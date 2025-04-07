
import sys
import subprocess
import os

# please load the requirements manually at the pod(rancher)
# requirements = ["azure-search","azure-search-documents","azure-identity","azure-storage-file-datalake"]
# for module in requirements:
#     subprocess.run(sys.executable + ' -m pip install '+ module + ' --index-url https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3MjI5Mzk1MjA6b25Yc3ZVRUYxV2tYR1VDS1p3elNFMkxQOHpM@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io',shell=True)

import os
import logging as logger
# os.environ['http_proxy']='http://ep.threatpulse.net:80'
# os.environ['https_proxy']='http://ep.threatpulse.net:80'
os.environ['http_proxy']='http://blrproxy.ad.infosys.com:80' 
os.environ['https_proxy']='http://blrproxy.ad.infosys.com:80'
os.environ['no_proxy']='localhost,0.0.0.0,10.*,*.ad.infosys.com,10.64.84.65,10.177.41.196,10.81.72.254'
from langchain.chains import RetrievalQA
from langchain.agents import Tool
from langchain.agents import AgentType
from langchain.chat_models import AzureChatOpenAI
from langchain.callbacks import StreamlitCallbackHandler
from langchain.chains import LLMMathChain

import os
from langchain.agents import initialize_agent
import streamlit as st
from langchain.retrievers import AzureCognitiveSearchRetriever
from langchain.tools.python.tool import PythonAstREPLTool
from azure.storage.filedatalake import DataLakeServiceClient
import pandas as pd
from io import StringIO
from prometheus_client import start_http_server, Gauge, REGISTRY
import threading

def start_prometheus_server():
    start_http_server(8000)

if 'service_status' not in REGISTRY._names_to_collectors:
    service_status_metric = Gauge('service_status', 'Status of the service')
else:
    service_status_metric = REGISTRY._names_to_collectors['service_status']
 
# Start Prometheus server in a separate thread
prometheus_thread = threading.Thread(target=start_prometheus_server)
prometheus_thread.daemon = True
prometheus_thread.start()

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



def setup_azure_cognitive_environ(azure_cognitive_search_service_name_param='', 
                                azure_cognitive_search_index_name_param='', 
                                azure_cognitive_search_api_key_param=''
                                ):
    os.environ['AZURE_COGNITIVE_SEARCH_SERVICE_NAME'] = azure_cognitive_search_service_name_param
    os.environ['AZURE_COGNITIVE_SEARCH_INDEX_NAME'] =azure_cognitive_search_index_name_param
    os.environ['AZURE_COGNITIVE_SEARCH_API_KEY'] = azure_cognitive_search_api_key_param
    return True

def azure_cognitive_search_retriever(azure_cognitive_environ_flag=False):
    retriever = None
    if azure_cognitive_environ_flag:
        retriever = AzureCognitiveSearchRetriever()
    else:
        print('Please Setup/Configure AZURE_COGNITIVE_SEARCH environment')
    return retriever
def retrieval_qa_tool_function(llm, retriever_obj, chain_type_param=''):
    # create tool function
    # initialize vectorstore retriever object
    timekeeping_policy = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type=chain_type_param,
        retriever=retriever_obj,
    )
    return timekeeping_policy

def InitializeTool(function_obj, name_param = '', description_param=''):
    tool =  Tool(
                    name = name_param,
                    func=function_obj.run,
                    description = description_param
                )
    return tool


def datalake(account_url_param='', credential_param='', file_system_param='', file_path_param='', decode_param=''):
    # create employee data tool 
    client = DataLakeServiceClient( # authenticate to azure datalake
                                  account_url=account_url_param,
                                  credential=credential_param)
                            
    # azure data lake boilerplate to load from file system.  
    file = client.get_file_system_client(file_system_param).get_file_client(file_path_param).download_file().readall().decode(decode_param) 
    
    csv_file = StringIO(file) 
    #csv_file = '/folder/employee_data.csv'
    df = pd.read_csv(csv_file) # load employee_data.csv as dataframe
    return df

def python_ast_repl_tool_function(df):
    # create tool function
    tool_function = PythonAstREPLTool(locals={'df': df}) # set access of python_repl tool to the dataframe
    return tool_function

def math_chain_tool_function(llm, verbose_param=True):
    # create tool function
    tool_function = LLMMathChain.from_llm(llm=llm, verbose=verbose_param)
    return tool_function

def combinetools(tool1, tool2, tool3):
    #python-script Data
    tools = [
        tool1, tool2, tool3
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

def ChatUIV1(agent, header_param='💬 LLM HR Chatbot - Chain of Thought Demo', markdown_param='', prompt_text_param=''):    
    
    def on_btn_click():
        del st.session_state.messages[:]

    st.set_page_config(initial_sidebar_state='auto')   
    st.header(header_param)
    st.markdown(prompt_text_param, unsafe_allow_html=True)
    st.markdown(markdown_param, unsafe_allow_html=True) 

    st.sidebar.title('⚡ Chain of thoughts')
    
    stream_container = st.sidebar.container()
    st_callback = StreamlitCallbackHandler(stream_container)
        
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
                reply = agent.run(prompt, callbacks=[st_callback])                
            except Exception as e:
                reply = 'Invalid input. Please try again'
                
            for response in reply:
                full_response += response
                message_placeholder.markdown(full_response + '▌', unsafe_allow_html=True)
            message_placeholder.markdown(full_response, unsafe_allow_html=True)
        st.session_state.messages.append({'role': 'assistant', 'content': full_response})
        st.button('Clear chat', on_click=on_btn_click)







def executePipeline():
    try :
        service_status_metric.set(1)
        ds_TopCenter_kWnFE = AzureOpenAIGPT35(openai_api_key_param='85b968a4b5c84d849c99661788c2c1ed',model_name_param='gpt-35-turbo',openai_api_type_param='azure',deployment_name_param='gtp35turbo',openai_api_base_param='https://azureft.openai.azure.com/',openai_api_version_param='2023-03-15-preview')
        ds_LeftMiddle_KJEgj = AzureOpenAIGPT35(openai_api_key_param='85b968a4b5c84d849c99661788c2c1ed',model_name_param='gpt-35-turbo',openai_api_type_param='azure',deployment_name_param='gtp35turbo',openai_api_base_param='https://azureft.openai.azure.com/',openai_api_version_param='2023-03-15-preview')
        ds_LeftMiddle_eQHux = AzureOpenAIGPT35(openai_api_key_param='85b968a4b5c84d849c99661788c2c1ed',model_name_param='gpt-35-turbo',openai_api_type_param='azure',deployment_name_param='gtp35turbo',openai_api_base_param='https://azureft.openai.azure.com/',openai_api_version_param='2023-03-15-preview')
        # ds_LeftMiddle_TGVzt = setup_azure_cognitive_environ(azure_cognitive_search_index_name_param='azureblob-docs-index',azure_cognitive_search_service_name_param='search-ins',azure_cognitive_search_api_key_param='4FNKXW99u0BfMTXd2s1LNo10N6CxPafTwi7jLGa7cnAzSeB6HOL4')
        ds_LeftMiddle_TGVzt = setup_azure_cognitive_environ(azure_cognitive_search_index_name_param='adlsgen2-index',azure_cognitive_search_service_name_param='aiplat-agent-service',azure_cognitive_search_api_key_param='aXve2x3mxeXT4ngFDnKGplRdZZiZYcz8SB1yYR9Ky3AzSeDnClK1')
        ds_TopCenter_eQHux = azure_cognitive_search_retriever(ds_LeftMiddle_TGVzt)
        ds_LeftMiddle_iJQxR = retrieval_qa_tool_function(ds_LeftMiddle_eQHux,ds_TopCenter_eQHux, chain_type_param='stuff')
        ds_TopCenter_Klquq = InitializeTool(ds_LeftMiddle_iJQxR, name_param='Timekeeping Policies',description_param='''Useful for when you need to answer questions about employee timekeeping policies.
        
        <user>: What is the policy on unused vacation leave?
        <assistant>: I need to check the timekeeping policies to answer this question.
        <assistant>: Action: Timekeeping Policies
        <assistant>: Action Input: Vacation Leave Policy - Unused Leave''')
            # ds_LeftMiddle_fqCLH = datalake(file_path_param='employee_data/employee_data.csv',file_system_param='file1',credential_param='Y/tGx+bNiee2MD/hJ+4kzZTRE0uTDTQqAUy5eeeKKI09jjfI3QTv50qiSz1dIc/VHxpCJxJ8o4kDolHSwWWGMA==',account_url_param='https://act1.dfs.core.windows.net/',decode_param='utf-8')
        ds_LeftMiddle_fqCLH = datalake(file_path_param='HR/employee_data/employee_data.csv',file_system_param='aiplat-hr',credential_param='8IgizcOY0B6lD3gV/w2+eya0MNZCSpJzPSqGAwbyij2ixTJykd1vcrS1ryqsjy0d9JglsiCfIc/Q+AStD5DWIQ==',account_url_param='https://aiplatstorage.dfs.core.windows.net/',decode_param='utf-8')
        ds_LeftMiddle_fzZUR = python_ast_repl_tool_function(ds_LeftMiddle_fqCLH)
        ds_LeftMiddle_Klquq = InitializeTool(ds_LeftMiddle_fzZUR, name_param='Employee Data',description_param='''Useful for when you need to answer questions about employee data stored in pandas dataframe 'df'. 
        Run python pandas operations on 'df' to help you get the right answer.
        'df' has the following columns: [employee_id,name,position,organizational_unit,rank,hire_date,regularization_date,vacation_leave,sick_leave,basic_pay_in_phpemployment_status,supervisor]
                    
        <user>: How many Sick Leave do I have left?
        <assistant>: df[df['name'] == 'Alexander Verdad']['sick_leave']
        <assistant>: You have n sick leaves left.''')
        ds_LeftMiddle_JeLEu = math_chain_tool_function(ds_LeftMiddle_KJEgj, verbose_param=True)
        ds_BottomCenter_Klquq = InitializeTool(ds_LeftMiddle_JeLEu, name_param='Calculator',description_param='''Useful when you need to do math operations or arithmetic.''')
        ds_LeftMiddle_kWnFE = combinetools(ds_LeftMiddle_Klquq,ds_TopCenter_Klquq,ds_BottomCenter_Klquq)
        ds_LeftMiddle_qHVty = InitializeAgent(ds_LeftMiddle_kWnFE,ds_TopCenter_kWnFE, prefix_argument_param='''You are friendly HR assistant. You are tasked to assist the current user: Alexander Verdad on questions related to HR. You have access to the following tools:''',agent_param='zero-shot-react-description',max_execution_time_param='300',early_stopping_method_param='generate',verbose_param=True)
        ChatUIV1(ds_LeftMiddle_qHVty, 
        prompt_text_param="""
        <h3>Prompt Used:</h3>
        <p>You are friendly HR assistant. You are tasked to assist the current user: Alexander Verdad on questions related to HR. You have access to the following tools:</p>

        <h3>Employee Data:</h3> 
        <p>Useful for when you need to answer questions about employee data stored in pandas dataframe "df". Run python pandas operations on "df" to help you get the right answer.
        "df" has the following columns: [employee_id,name,position,organizational_unit,rank,hire_date,regularization_date,vacation_leave,sick_leave,basic_pay_in_phpemployment_status,supervisor]</p>

        <p>🙂: <b>How many Sick Leave do I have left?</b><br>
        🤖: df[df["name"] == "Alexander Verdad"]["sick_leave"]<br>
        🤖: You have n sick leaves left.</p>

        <h3>Timekeeping Policies:</h3>
        <p>Useful for when you need to answer questions about employee timekeeping policies.</p>

        <p>🙂: <b>What is the policy on unused vacation leave?</b><br>
        🤖: I need to check the timekeeping policies to answer this question.<br>
        🤖: Action: Timekeeping Policies<br>
        🤖: Action Input: Vacation Leave Policy - Unused Leave</p>

        <h3>Calculator:</h3>
        <p>Useful when you need to do math operations or arithmetic.</p>

        <h4>Use the following format:</h4>
        <p><b>Question</b>: the input question you must answer<br>
        Thought: you should always think about what to do<br>
        Action: the action to take, should be one of [Employee Data, Timekeeping Policies, Calculator]<br>
        Action Input: the input to the action<br>
        Observation: the result of the action<br>
        ... (this Thought/Action/Action Input/Observation can repeat N times)<br>
        Thought: I now know the final answer<br>
        <b>Final Answer</b>: the final answer to the original input question</p>
        """,
        markdown_param="""
        <h3>Ask your HR-related questions here.</h3>
        <b>❓ Example Queries</b>
        <ul>
            <li>Who am I and what is my employee ID?</li>
            <li>How many unused vacation leaves do I have left and what is the policy on unused vacation leaves?</li>
            <li>How much will I get paid if I encash my unused vacation leaves?</li>
        </ul>
        """,
        header_param='💬 LLM HR Chatbot - Chain of Thought Demo')

        logger.info('Completed')

    except Exception as e:
        service_status_metric.set(0)
        st.write("An error occurred:", e)



if __name__ == '__main__':
    executePipeline()
    print('Completed')
