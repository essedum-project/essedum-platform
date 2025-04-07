import sys
import subprocess
import os
import pandas as pd
# please load the requirements manually at the pod(rancher)
requirements = ['openai','langchain']
for module in requirements:
    subprocess.run(sys.executable + ' -m pip install '+ module + ' -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com',shell=True)

import os
import logging as logger
os.environ['http_proxy']='http://proxy.threatpulse.net:8080' 
os.environ['https_proxy']='http://proxy.threatpulse.net:8080'
os.environ['no_proxy']='localhost,0.0.0.0,10.*,*.ad.infosys.com,10.81.72.254'
from langchain.callbacks import StreamlitCallbackHandler
import os
from langchain.chat_models import AzureChatOpenAI
from langchain.prompts import PromptTemplate
import streamlit as st
from streamlit_chat import message
import random
import langchain
langchain.verbose = False
def PromptTemplates(templete_param='', input_var_param='', validate_template_param=True, template_format_param=''):
    SUPPORT_PROMPT = PromptTemplate(
        template=templete_param, 
        input_variables=input_var_param.split(','),
        validate_template=validate_template_param,
        template_format=template_format_param,
    )
    return SUPPORT_PROMPT


def AzureOpenAIGPT35(deployment_name_param='', 
                    model_name_param='', 
                    openai_api_key_param='', 
                    openai_api_version_param='', 
                    openai_api_base_param='', 
                    openai_api_type_param=''
                    ):
    #initialize LLM object
    llm = AzureChatOpenAI(    
        deployment_name=deployment_name_param, 
        model_name=model_name_param, 
        openai_api_key=openai_api_key_param,
        openai_api_version = openai_api_version_param, 
        openai_api_base=openai_api_base_param,
        openai_api_type=openai_api_type_param

        )
    return llm
                        
def llmchain(llm, prompt):
    from langchain.chains import LLMChain
    llm_chain = LLMChain(llm=llm, prompt=prompt)
    return llm_chain

from langchain.chains import TransformChain, LLMChain, SimpleSequentialChain
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chat_models import AzureChatOpenAI
import requests
import json

def transform():
    from langchain.chains import TransformChain
    def transform_func(inputs: dict) -> dict:
        text = inputs['text']
        headers = {
            'Content-Type': 'application/json'
        }

        # data = {
        # 'inputText': text
        # }
        data = {
            'config_id': 1, 
            'data': text
        }
        data = json.dumps(data)
        res = ''
        try:
            response = requests.post('http://10.81.72.254:5000/udd/discover_data', headers=headers, data = data, verify=False)

            print('reponse code: ', response.status_code)
            if response.status_code == 200:
                print('response', response.json())

                response_with_index = []
                for ent in response.json():
                    intext = ent['pre_text'] + ent['text'] + ent['post_text']
                    res = [i for i in range(len(text)) if text.startswith(intext, i)]
                    if len(res) > 0:
                        ent['index_to_be_relaced'] = [ind + len(ent['pre_text']) for ind in res]
                    response_with_index.append(ent)

                response_with_index = sorted(response_with_index, key=lambda d: d['index_to_be_relaced'][0])
                prev_ind = 0
                res = ''
                for i, ent in enumerate(response_with_index):
                    for index in ent['index_to_be_relaced']:
                        if i == 0:
                            res += text[:index] + '<' + ent['entity_name'] + '>'
                            prev_ind = index + len(ent['text'])
                        else:
                            res += text[prev_ind:index] + '<' + ent['entity_name'] + '>'
                            prev_ind = index + len(ent['text'])
                res += text[prev_ind:]
        except:
            res = ''
            
        res = ' '.join(res.split(' ')[:7000])
        res = res.replace('<', '`')
        res = res.replace('>', '`')
        print('response: ', res)
        shortened_text = '\n\n'.join(res.split('\n\n')[:5])
        return {'output_text': shortened_text}

    transform_chain = TransformChain(
        input_variables=['text'], output_variables=['output_text'], transform=transform_func
    )

    return transform_chain
def simpleseqchain(transform_chain, llm_chain, state_of_the_union_param=''):
    from langchain.chains import SimpleSequentialChain
    sequential_chain = SimpleSequentialChain(chains=[transform_chain, llm_chain])
    # print(sequential_chain.run(state_of_the_union_param))
    return sequential_chain

from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler



def ChatUI(agent, header_param='💬 LLM HR Chatbot - Chain of Thought Demo', markdown_param='## Ask your HR-related questions here.', button_param='stop', prompt_text='', title_param='controls'):
    st.set_page_config(initial_sidebar_state='auto')   
    st.title(header_param)
    st.markdown(prompt_text, unsafe_allow_html=True)
    st.markdown(markdown_param)
    stop = st.sidebar.button(button_param)
    st.sidebar.title('⚡ Streaming output')

    chat_container = st.container()
    stream_container = st.sidebar.container() 

    st_callback = StreamlitCallbackHandler(stream_container)

    if 'past' not in st.session_state:
        st.session_state['past'] = []
    if 'generated' not in st.session_state:
        st.session_state['generated'] = []
    if 'input_message_key' not in st.session_state:
        st.session_state['input_message_key'] = str(random.random())
        
    text = st.empty()
    user_input = text.text_input('Type your message and press Enter to send.', key=st.session_state['input_message_key'])

    if st.button('Send'):
        try:
            response = agent.run(user_input, callbacks=[st_callback])             
        except Exception as e:
            response = str(e)
            if not response.startswith('Could not parse LLM output: `'):
                raise e
            response = response.removeprefix('Could not parse LLM output: `').removesuffix('`')

        st.session_state['past'].append(user_input)
        st.session_state['generated'].append(response)
        st.session_state['input_message_key'] = str(random.random())            
        user_input = text.text_input('Type your message and press Enter to send.', value='', key=st.session_state['input_message_key'])        

    if st.session_state['generated']:
        with chat_container:
            for i in range(len(st.session_state['generated'])):
                message(st.session_state['past'][i], is_user=True, key=str(i) + '_user')                
                message(st.session_state['generated'][i], key=str(i))    

    if stop:
        print('stop')
        os._exit(0)                              

    return True


def executePipeline():

    ds_TopCenter_dSwpb = PromptTemplates(input_var_param='output_text',validate_template_param=True,templete_param='''Summarize this text:

{output_text}

Summary:''',template_format_param='f-string')
    ds_LeftMiddle_dSwpb = AzureOpenAIGPT35(openai_api_key_param='85b968a4b5c84d849c99661788c2c1ed',model_name_param='gpt-35-turbo',openai_api_type_param='azure',deployment_name_param='gtp35turbo',openai_api_base_param='https://azureft.openai.azure.com/',openai_api_version_param='2023-03-15-preview')
    ds_TopCenter_CTgUv = llmchain(ds_LeftMiddle_dSwpb,ds_TopCenter_dSwpb)
    ds_LeftMiddle_CTgUv = transform()
    ds_LeftMiddle_qRqOx = simpleseqchain(ds_LeftMiddle_CTgUv,ds_TopCenter_CTgUv, state_of_the_union_param='John Smith\'s SSN is 012884567')
    ChatUI(ds_LeftMiddle_qRqOx, button_param='stop',markdown_param='Ask your questions here.',header_param='Summarize with Anonymization - Responsible by Design',title_param='controls')

logger.info('Completed')


if __name__ == '__main__':
    executePipeline()
    print('Completed')
