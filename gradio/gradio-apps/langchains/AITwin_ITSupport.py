
import sys
import subprocess
import os
import pandas as pd
# please load the requirements manually at the pod(rancher)
requirements = []
for module in requirements:
    subprocess.run(sys.executable + ' -m pip install '+ module + ' -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com',shell=True)

import os
import logging as logger
os.environ['http_proxy']='http://blrproxy.ad.infosys.com:80' 
os.environ['https_proxy']='http://blrproxy.ad.infosys.com:80'
from langchain.chains import RetrievalQA
from langchain.agents import Tool
from langchain.prompts import PromptTemplate
# from langchain.chat_models import AzureChatOpenAI
from langchain_community.chat_models import AzureChatOpenAI
from langchain.agents import initialize_agent
from langchain.agents import AgentType
import streamlit as st
# from langchain.embeddings.openai import OpenAIEmbeddings
from langchain_openai import AzureOpenAIEmbeddings
from langchain.callbacks.streaming_stdout_final_only import FinalStreamingStdOutCallbackHandler
from langchain.vectorstores.azuresearch import AzureSearch
# from langchain.callbacks import StreamlitCallbackHandler
from langchain_community.callbacks import StreamlitCallbackHandler

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

        openai_api_type=openai_api_type_param,

        streaming=True,

        verbose=True

        )

    return llm

def PromptTemplates(templete_param='', input_var_param='', validate_template_param=True, template_format_param=''):

    SUPPORT_PROMPT = PromptTemplate(

        template=templete_param, 

        input_variables=input_var_param.split(','),

        validate_template=validate_template_param,

        template_format=template_format_param,



    )

    return SUPPORT_PROMPT

def AzureOpenAItextembeddingada002(deployment_param='', 

                    model_param='', 

                    openai_api_key_param='', 

                    openai_api_base_param='', 

                    openai_api_type_param=''

                    ):

    # initialize embeddings object; for use with user query/input

    embed = AzureOpenAIEmbeddings(

                    deployment=deployment_param,

                    model=model_param,

                    openai_api_key=openai_api_key_param,
                    azure_endpoint = openai_api_base_param,
                    # openai_api_base=openai_api_base_param,

                    openai_api_type=openai_api_type_param,
                    openai_api_version="2023-03-15-preview"

                )



    return embed



def AzureSearches(embeddings, vector_store_address_param='', vector_store_password_param='', index_name_param=''):

    vector_store_address: str = vector_store_address_param

    vector_store_password: str = vector_store_password_param



    index_name: str = index_name_param

    store: AzureSearch = AzureSearch(

        azure_search_endpoint=vector_store_address,

        azure_search_key=vector_store_password,

        index_name=index_name,

        embedding_function=embeddings.embed_query,

    )



    return store

def RetrievalChain(llm, retriever_obj, prompt = None, chain_type_param='',):

    # create tool function

    # initialize vectorstore retriever object

    chain_type_kwargs = None

    if prompt is not None:

        chain_type_kwargs={'prompt': prompt}

    timekeeping_policy = RetrievalQA.from_chain_type(

        llm=llm,

        chain_type=chain_type_param,

        retriever=retriever_obj.as_retriever(),

        chain_type_kwargs = chain_type_kwargs

    )

    return timekeeping_policy

def initialize_tool(function_obj, name_param = '', description_param=''):

    tool =  Tool(

                    name = name_param,

                    func=function_obj.run,

                    description = description_param

                )

    return tool









def combinetools(tool1, tool2):
    #python-script Data
    tools = [
        tool1, tool2
        ]

    return tools

def InitializeAgent(tools, llm, agent_param='', max_execution_time_param='', early_stopping_method_param='', prefix_argument_param='', verbose_param=''):

    # change the value of the prefix argument in the initialize_agent function. This will overwrite the default prompt template of the zero shot agent type

    agent_kwargs = {'prefix': prefix_argument_param}

    

    

    # initialize the LLM agent

    agent = initialize_agent(tools, 

                             llm, 

                             agent=agent_param, 

                             verbose=verbose_param, 

                             max_execution_time=int(max_execution_time_param), 

                             early_stopping_method=early_stopping_method_param,

                             agent_kwargs=agent_kwargs

                             )

   

    return agent

































def ChatUIV2(agent, header_param='💬 LLM HR Chatbot - Chain of Thought Demo', markdown_param='', prompt_text_param=''):    

   

    def on_btn_click():

        del st.session_state.messages[:]



    st.set_page_config(initial_sidebar_state='auto')   

    st.header(header_param)

    st.markdown(prompt_text_param, unsafe_allow_html=True)

    st.markdown(markdown_param, unsafe_allow_html=True) 



    st.sidebar.title('⚡ Chain of thoughts')

    

    stream_container = st.sidebar.container()

    stream_handler1 = StreamlitCallbackHandler(stream_container)

    stream_handler2 = FinalStreamingStdOutCallbackHandler()



    if 'messages' not in st.session_state:        

        st.session_state.messages = []

        

    for message in st.session_state.messages:

        with st.chat_message(message['role']):

            st.markdown(message['content'], unsafe_allow_html=True)

    

    if prompt := st.chat_input('Ask your question?'):

        st.session_state.messages.append({'role': 'user', 'content': prompt})

        with st.chat_message('user'):

            st.markdown(prompt)

        

        with st.chat_message('assistant'):

            message_placeholder = st.empty()

            full_response = ''

            try:      

                reply = agent.run(prompt, callbacks=[stream_handler1,stream_handler2])                

            except Exception as e:

                print(e)

                reply = 'Invalid input. Please try again'

                

            for response in reply:

                full_response += response

                message_placeholder.markdown(full_response + '▌', unsafe_allow_html=True)

            message_placeholder.markdown(full_response, unsafe_allow_html=True)

        st.session_state.messages.append({'role': 'assistant', 'content': full_response})

        st.button('Clear chat', on_click=on_btn_click)












def executePipeline():

    ds_TopCenter_oXIwg = AzureOpenAIGPT35(openai_api_key_param='85b968a4b5c84d849c99661788c2c1ed',model_name_param='gpt-35-turbo',openai_api_type_param='azure',deployment_name_param='gtp35turbo',openai_api_base_param='https://azureft.openai.azure.com/',openai_api_version_param='2023-03-15-preview')
    ds_BottomCenter_DhNmu = PromptTemplates(input_var_param='context,question',validate_template_param=True,templete_param='''As a Neo4j Customer Support bot, you are here to assist with any issues 
a user might be facing with their graph database implementation and Cypher statements.
Please provide as much detail as possible about the problem, how to solve it, and steps a user should take to fix it.
If the provided context doesn't provide enough information, you are allowed to use your knowledge and experience to offer you the best possible assistance.

{context}

Question: {question}''',template_format_param='f-string')
    ds_BottomCenter_pAiOE = PromptTemplates(input_var_param='context,question',validate_template_param=True,templete_param='''As a Neo4j marketing bot, your goal is to provide accurate and helpful information about Neo4j,
a powerful graph database used for building various applications.
You should answer user inquiries based on the context provided and avoid making up answers.
If you don't know the answer, simply state that you don't know.
Remember to provide relevant information about Neo4j's features, benefits,
and use cases to assist the user in understanding its value for application development.

{context}

Question: {question}''',template_format_param='f-string')
    ds_LeftMiddle_DhNmu = AzureOpenAIGPT35(openai_api_key_param='85b968a4b5c84d849c99661788c2c1ed',model_name_param='gpt-35-turbo',openai_api_type_param='azure',deployment_name_param='gtp35turbo',openai_api_base_param='https://azureft.openai.azure.com/',openai_api_version_param='2023-03-15-preview')
    ds_LeftMiddle_pAiOE = AzureOpenAIGPT35(openai_api_key_param='85b968a4b5c84d849c99661788c2c1ed',model_name_param='gpt-35-turbo',openai_api_type_param='azure',deployment_name_param='gtp35turbo',openai_api_base_param='https://azureft.openai.azure.com/',openai_api_version_param='2023-03-15-preview')
    ds_LeftMiddle_Lfkyh = AzureOpenAItextembeddingada002(openai_api_key_param='c20dfca2800f4cd6a172c642e20d1aa0',openai_api_type_param='azure',model_param='text-embedding-ada-002',openai_api_base_param='https://leapazureopenai.openai.azure.com/',deployment_param='text-embedding-ada-002')
    ds_TopCenter_DhNmu = AzureSearches(ds_LeftMiddle_Lfkyh, vector_store_address_param='https://leapaisearch.search.windows.net',vector_store_password_param='RzvQYniNlRwhSlZ0cZbMPyx0wgg3e8sqCwrGuebvsSAzSeCHDuZo',index_name_param='neo4j-support-kb-index')
    ds_LeftMiddle_qIVMr = RetrievalChain(ds_LeftMiddle_DhNmu,ds_TopCenter_DhNmu,ds_BottomCenter_DhNmu, chain_type_param='stuff')
    ds_BottomCenter_SHXfi = initialize_tool(ds_LeftMiddle_qIVMr, name_param='support',description_param='''useful for when when a user asks to optimize or debug a Cypher statement or needs
                       specific instructions how to accomplish a specified task. 
                       Input should be a fully formed question.''')
    ds_LeftMiddle_BLAvK = AzureOpenAItextembeddingada002(openai_api_key_param='c20dfca2800f4cd6a172c642e20d1aa0',openai_api_type_param='azure',model_param='text-embedding-ada-002',openai_api_base_param='https://leapazureopenai.openai.azure.com/',deployment_param='text-embedding-ada-002')
    ds_TopCenter_pAiOE = AzureSearches(ds_LeftMiddle_BLAvK, vector_store_address_param='https://leapaisearch.search.windows.net',vector_store_password_param='RzvQYniNlRwhSlZ0cZbMPyx0wgg3e8sqCwrGuebvsSAzSeCHDuZo',index_name_param='neo4j-sales-kb-index')
    ds_LeftMiddle_WyTyx = RetrievalChain(ds_LeftMiddle_pAiOE,ds_TopCenter_pAiOE,ds_BottomCenter_pAiOE, chain_type_param='stuff')
    ds_LeftMiddle_SHXfi = initialize_tool(ds_LeftMiddle_WyTyx, name_param='sales',description_param='''useful for when a user is interested in various Neo4j information, 
                       use-cases, or applications. A user is not asking for any debugging, but is only
                       interested in general advice for integrating and using Neo4j.
                       Input should be a fully formed question.''')
    ds_LeftMiddle_oXIwg = combinetools(ds_LeftMiddle_SHXfi,ds_BottomCenter_SHXfi)
    ds_LeftMiddle_opdFs = InitializeAgent(ds_LeftMiddle_oXIwg,ds_TopCenter_oXIwg, prefix_argument_param='''''',agent_param='zero-shot-react-description',max_execution_time_param='200',early_stopping_method_param='generate',verbose_param=True)
    ChatUIV2(ds_LeftMiddle_opdFs, prompt_text_param='''<h2>Prompt Used </h2>
<h4>Neo4j Customer Support Bot:</h4> 
<p>As a Neo4j Customer Support bot, you are here to assist with any issues 
a user might be facing with their graph database implementation and Cypher statements.
Please provide as much detail as possible about the problem, how to solve it, and steps a user should take to fix it.
If the provided context doesn't provide enough information, you are allowed to use your knowledge and experience to offer you the best possible assistance.</br>
<b>❓ Example Queries</b>
<ul>
    <li>Can you provide a cypher query to get all relationships between a specific set of nodes?</li>
    <li>Can you provide cypher query to get all nodes linked by a specific relationship?</li>
    <li>Can you provide cypher query to find nodes which have more incoming than outgoing connections of a particular kind?</li>
    <li>Can you provide cypher query to find all nodes connected to certain nodes in a directed graph?</li>
<ul>
</br>
<h4>Neo4j Marketing Bot:</h4> 
As a Neo4j marketing bot, your goal is to provide accurate and helpful information about Neo4j,
a powerful graph database used for building various applications.
You should answer user inquiries based on the context provided and avoid making up answers.
If you don't know the answer, simply state that you don't know.
Remember to provide relevant information about Neo4j's features, benefits,
and use cases to assist the user in understanding its value for application development.</br>
<b>❓ Example Queries</b>
<ul>
    <li>How are graph databases used in health care domain?</li>
</ul>''',markdown_param='''## Ask your Neo4j-related questions here.''',header_param='💬 Neo4j Product Chatbot - Chain of Thought Demo')

logger.info('Completed')


if __name__ == '__main__':
    executePipeline()
    print('Completed')
