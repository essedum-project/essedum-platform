print("importing started")
# import os

# # print('proxing started')

# os.environ['http_proxy']='http://blrproxy.ad.infosys.com:8080' 
# os.environ['https_proxy']='http://blrproxy.ad.infosys.com:80'

# os.environ['no_proxy']='localhost,0.0.0.0,10.*,*.ad.infosys.com,10.85.12.143,10.86.117.104,10.177.28.36,10.81.78.167'

# print('done proxing')
# from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
import gradio as gr
# # please load the requirements manually at the pod(rancher)
# requirements = ['chromadb==0.3.29']
# for module in requirements:
#     subprocess.run('pip install '+ module,shell=True)
##--------------------------##
##-----------------------------
##--------------------------##

# import
from langchain.document_loaders import TextLoader
from langchain.embeddings.sentence_transformer import SentenceTransformerEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Chroma

# write a script for creating folder "leapdata" if it does not exist in linux server
import os
if not os.path.exists('leapdata'):
    os.makedirs('leapdata')

import boto3
import pathlib

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

s3 = boto3.resource('s3',
                    endpoint_url='https://10.82.53.110/',
                    aws_access_key_id='GISeSU7xd6WBnXrU-QbffBee7WsCxaE2',
                    aws_secret_access_key='g2d4nVxehagjOkCkZ4WrCMOzrfTrFiI0',
                    verify=False)



def download(bucket,s3_path, local_path):
    bucket_object = s3.Bucket(bucket)
    for my_bucket_object in bucket_object.objects.filter(Prefix=s3_path):
        object_save_path = (
            f"{local_path}/{pathlib.Path(my_bucket_object.key).name}"
        )
        print(f"Downloading {my_bucket_object.key} to {object_save_path}")
        if "dataset" in my_bucket_object.key:
            bucket_object.download_file(my_bucket_object.key, object_save_path)
    print("------Download Completed------")


s3_path =  'leapdatasets'
bucket_name = 'aicloudprd'
download_path = "./leapdata/"
download(bucket_name,s3_path,download_path)


# --------------------------------docment loader--------------------------------
# load the document and split it into chunks
# loader = TextLoader("./data/dataset.txt")
loader = TextLoader("./leapdata/dataset.txt")
documents = loader.load()

# # split it into chunks
text_splitter = CharacterTextSplitter(chunk_size=300, chunk_overlap=10)
docs = text_splitter.split_documents(documents)

# # create the open-source embedding function
embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

# load it into Chroma
db = Chroma.from_documents(docs, embedding_function)
print("-----------------transformer model loaded-----------------")
# print("-----------------"+ str(type(db)) +"---------------")

def get_similar_chunks(question):
    docs = db.similarity_search_with_score(question)
    res_docs = []
    for doc,sc in docs:
        res_docs.append([doc.page_content,sc])
    return res_docs

# # query it
# query = "a bot to check file Exists java code"
# abs_q = "the bot is used to remove  a folder from the given directory path"
# docs = db.similarity_search_with_score(query)
# docs_sc = db.similarity_search_with_score(abs_q)
# print('number of results: ', len(docs))
# print('---------------------------')
# # print results
# for doc,sc in docs:
#     print(doc.page_content)
#     print('score: ', sc)
#     print('---------------------------')

# print('---------------------------')

# # print results with score
# for doc, score in docs_sc:
#     print(doc.page_content)
#     print('score: ', score)
#     print('---------------------------')        

import requests

superBotList = []
HOST_URL = "http://10.81.78.167:5000"
# HOST_URL = "http://127.0.0.1:5000"


def get_chunks_from_vm(question):
    vmUrl = HOST_URL
    data = {'query': question}
    response = requests.post(vmUrl, json=data)
    jsondata = response.json()
    return jsondata

def words():
    # sentence = "A test of Gradio"
    global superBotList
    words = superBotList
    update_show = [gr.update(visible=True, value=w) for w in words]
    update_hide = [gr.update(visible=False, value="") for _ in range(10-len(words))]
    return update_show + update_hide 

def get_generation_from_vm(question):
    global superBotList
    vmUrl = HOST_URL + "/generate"
    data = {'query': question}
    response = requests.post(vmUrl, json=data)
    
    jsondata = response.json()
    resp = jsondata['response']
    BotList = jsondata['botList']
    
    superBotList = BotList[:]
    return resp


def get_summarization_from_vm(question):
    vmUrl = HOST_URL + "/summarize"
    data = {'query': question}
    response = requests.post(vmUrl, json=data)
    jsondata = response.text
    return jsondata

def get_starcoderResp_from_vm(question):
    vmUrl = HOST_URL + "/starcodeGenerate"
    data = {'query': question}
    response = requests.post(vmUrl, json=data)
    jsondata = response.json()
    return jsondata['response']



# ---------------------------------model-----------------------------------------

# Define the LLMs API endpoint and token URL
llm_api_url = "https://itgateway.infosys.com/ai-platform/fln-aic/v1/language/generate"
starcodegen_api_url = "https://itgateway.infosys.com/ai-platform/scb-aic/v1/code/complete"
token_url = "https://login.microsoftonline.com/63ce7d59-2f3e-42cd-a8cc-be764cff5eb6/oauth2/v2.0/token"


# Define client ID, secret, and scope
client_id = "9090f1c5-d381-4ef6-b845-4bac98d02fbe"
client_secret = "CNl8Q~IA-EUpiyA5Kkh97-4uH3ajo2PqQOkpHbp~"
scope = "b3490b10-6bd3-4f66-908d-fa1950e46598/.default"

# Get access token
token_payload = {
    "client_id": client_id,
    "client_secret": client_secret,
    "grant_type": "client_credentials",
    "scope": scope,
}


def get_model_response(user_input,url):
    # Prepare data for LLMs request
    data = {
        "inputs": [user_input],
        "parameters" : {
            "max_length": 512
        }
    }

    token_response = requests.post(token_url, data=token_payload)
    token = token_response.json()["access_token"]
    # Send request to LLMs API
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }

    llm_response = requests.post(url, headers=headers, json=data)

    # Print the response
    return (llm_response.json()[0]['generated_text'])

# print(get_model_response("write a paragraph about watermelon and its benefits"))

def get_resp_flan(query):
    return get_model_response(query,llm_api_url)
def get_resp_star(query):
    return get_model_response(query,starcodegen_api_url)

print("-----------------model url setting done-----------------")

# ---------------------------------templates-----------------------------------------

similar_template = """you are given data of extracted rows of the bot csv file.

data:
{data}

based on the above data, find the similar bot which matches the given description. explain clearly why the you think the bot is similar to the given description.
clearly MENTION THE BOT NAME as it is in the csv file.

and do not ask any extra questions to the user. give a brief an clear response

description:
{question}

"""

recommend_template = """you are given data of extracted rows of the bot csv file.

data:
{data}

based on the above data, recommend few bots which matches the given description. 
for each bot mention the bot name 
generate the response in a way to recommend the user with the best possible bot.

description:
{question}

"""

generate_script_template = """you are given the description of the bot. generate a script for the bot. and describe all the neccesaary steps to be performed for the bot to work.
description:
{question}

"""

def generate_response1(data,question,mytemp):
    prompt = PromptTemplate(template=mytemp, input_variables=["data","question"])
    # llm_chain = LLMChain(
    #     prompt=prompt, 
    #     # llm=my_llm,
    #     llm=local_llm_alpaca)
    # response = llm_chain.run(data=data,question=question)
    user_data = prompt.format(data=data,question=question)
    # return get_generation_from_vm(user_data)
    return get_resp_flan(user_data)



def get_recommendations(question):
    extracted_docs = get_similar_chunks(question)
    final_res = ''
    add_info = ''
    for doc,sc in extracted_docs:
        final_res += doc + '\n\n'
        add_info += doc + '\n' + 'score: ' + str(sc) + '\n\n'    

    if final_res == '':
        final_res = "empty result"
    # first_result = "\n\n".join([i.page_content for i in extracted_docs])
    # print(final_res)
    response = generate_response1(final_res,question,recommend_template)
    return response,add_info

def get_similar_bots(user_query):
    extracted_docs = get_similar_chunks(user_query)
    final_res = ''
    add_info = ''
    for doc,sc in extracted_docs:
        final_res += doc + '\n\n'
        add_info += doc + '\n' + 'score: ' + str(sc) + '\n\n'    

    if final_res == '':
        final_res = " "
    # first_result = "\n\n".join([i.page_content for i in extracted_docs])
    # print(final_res)
    response = generate_response1(final_res,user_query,similar_template)
    return response,add_info 

# Define functions for different options
def find_similar_bots(desp):
  # Implement logic to find bot for ticket ID
  return get_similar_bots(desp) # will return 2 param
  #  return "will be soon"
  
def find_recommendations(desp):
  # Implement logic to find bots for requirement document
  return get_recommendations(desp) 

def generate_script(desp):
  # Implement logic to find script for ticket ID
  return "generation of script is comming soon"


# Define options for dropdown
options = [
    "Find similar bot on basis of given description",
    "Recommend a bot for a given description",
    "Generate bot script for a given description",
]


# Define function to call based on dropdown selection
def select_function(function, text):  
    gen_output = ""
    additional_info = "additional info"
    if function == "Find similar bot on basis of given description":
        gen_output,additional_info = find_similar_bots(text)
    elif function == "Recommend a bot for a given description":
        gen_output,additional_info = find_recommendations(text)
    elif function == "Generate bot script for a given description":
        gen_output = generate_script(text)
    else:
        gen_output = "Please select a valid option"
    updtComp = gr.update(visible=False, value="")
    if 'no bots' in gen_output or 'empty result' in gen_output or 'No similar bot found' in gen_output or not gen_output:
        updtComp = gr.update(visible=True, value="Generate script")
    update_hide = [gr.update(visible=False, value="") for _ in range(10)] 
    return gen_output,additional_info,updtComp,*update_hide

def codegen_function(text):
    return get_resp_star(text)
    # return get_starcoderResp_from_vm(text)


print('gradiopart')

import webbrowser

def handle_click():
    link="https://victlpast02:7861/"
    browser = webbrowser.get()
    browser.open(link, new=2)

def downloadFunc(filename):
    link = HOST_URL+"/download/"+filename
    browser = webbrowser.get()
    browser.open(link)
    
btn_list = []
def change_tab():
    return gr.Tabs.update(selected=1)

with gr.Blocks() as demo:
    gr.Markdown(
    """
    # Automation Buddy
    Your one-stop shop for finding, managing, and generating automation solutions.
    """)

    with gr.Tabs() as tabs:
        with gr.TabItem("Automation buddy", id=0):
            # t = gr.Textbox()
            dropdown = gr.Dropdown(label="Scenario dropdown", choices=options)

            with gr.Row():
                with gr.Column():
                    input_text = gr.Textbox(label="Input",lines=5, info="Enter your input for selected scenario")
                    submit_button = gr.Button(value="Submit")
                with gr.Column():
                    output_text = gr.Textbox(label="Output", lines=5, info="Results from gen AI")
                    redirect_btn = gr.Button("generate script",visible=False)
                    b = gr.Button("Download MicroBot")
            with gr.Row():
                for i in range(10):
                    btn = gr.Button(visible=False)
                    btn_list.append(btn)
            b.click(words, None, btn_list)
            movetogenbtn = gr.Button(value="Move to code generation")  
            # examples section
            gr.Markdown("## Text Examples")
            gr.Examples(
                [
                [options[0], "bot to create the folder from given path"],
                [options[0], "bot for converting MAP to JSON string"],
                [options[1], "bot to validate data in database"],
                [options[1], "bot to generate msTeams notifications"],
                [options[2], "generate script to perform API call to POST data"], 
                ],
                [dropdown,input_text],
            )
        

        with gr.TabItem("code generation", id=1):
            with gr.Row():
                with gr.Column():
                    gen_input_text = gr.Textbox(label="Input",lines=5, info="Enter the detailed prompt to generate the code")
                with gr.Column():
                    gen_output_text = gr.Textbox(label="Output", lines=5, info="Results from gen AI")
            gen_submit_button = gr.Button(value="Submit")

            gr.Markdown("## Text Examples")
            gr.Examples(
                [
                ["program to post api call with the given json data \ndef post_api_call(url, data):"],
                ["program to create a folder in given path def createFolder(path):"],
                ],
                [gen_input_text],
            )
    


    with gr.Row():
        template_text = gr.Textbox(label="Template", visible=False, lines=5,max_lines=10, info="Template for gen AI")
    additional_info = gr.Textbox(label="Additional Info", info="Additional info from gen AI", visible=False)
    
    submit_button.click(fn=select_function, inputs=[dropdown,input_text], outputs=[output_text,additional_info,redirect_btn,*btn_list], api_name="greet")
    gen_submit_button.click(fn=codegen_function, inputs=[gen_input_text], outputs=[gen_output_text])
    movetogenbtn.click(change_tab, None, tabs)
    redirect_btn.click(handle_click)

    btn_list[0].click(downloadFunc,inputs=[btn_list[0]])
    btn_list[1].click(downloadFunc,inputs=[btn_list[1]])
    btn_list[2].click(downloadFunc,inputs=[btn_list[2]])
    btn_list[3].click(downloadFunc,inputs=[btn_list[3]])
if __name__ == "__main__":
    print("---------------Starting GRADIO---------------")
    demo.launch(server_name='0.0.0.0',server_port=7861)   
