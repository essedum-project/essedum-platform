
import sys
import subprocess
import pandas as pd
# please load the requirements manually at the pod(rancher)
requirements = []
for module in requirements:
    subprocess.run(sys.executable + ' -m pip install '+ module + ' -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com',shell=True)
import logging
import gradio as gr
import os
import json
import warnings
import datetime
from pathlib import Path
from haystack.document_stores import FAISSDocumentStore
from haystack.utils import clean_wiki_text, convert_files_to_docs
from haystack.nodes import PreProcessor,EmbeddingRetriever
from haystack.document_stores import FAISSDocumentStore
from transformers import pipeline
import pandas as pd
from urllib.parse import urlparse
from minio import Minio
import zipfile

warnings.filterwarnings('ignore')

MAX_SECTION_LEN = 1000
SEPARATOR = '\n* '
ENCODING = 'gpt2'
sentence = 'sentence'
e5_large = 'e5-large'
roberta = 'deepset/roberta-base-squad2'


def qa_analysis(query_param, model_param, context_param, embedding_model_param):
    query = query_param
    model = model_param
    context = context_param
    embedding_model= embedding_model_param
    
    if embedding_model.lower() == 'sentence':
        embedding_model = sentence
    elif embedding_model.lower() == 'e5_large':
        embedding_model = e5_large
        
    faiss_dir = './faiss_db'
    p = f'{faiss_dir}/{embedding_model}_{context}_index.faiss'
    print(p)
    print('path exits', os.path.exists(f'{faiss_dir}/{embedding_model}_{context}_index.faiss'))
        
    if os.path.exists(f'{faiss_dir}/{embedding_model}_{context}_index.faiss'):
        document_store = FAISSDocumentStore.load(index_path=f'{faiss_dir}/{embedding_model}_{context}_index.faiss',
                                                 config_path=f'{faiss_dir}/{embedding_model}_{context}_config.json')
        
        # Retrieving context based documents
        retriever = EmbeddingRetriever(document_store=document_store,
                                       embedding_model='sentence-transformers/multi-qa-mpnet-base-dot-v1') 
        
        # Based on query retrieve Top 5 result from retriever
        prompt_text =  retriever.retrieve(query=query,top_k=5) 
            
        # Store file name respective documents
        file_name = []
        for i in range(len(prompt_text)):
            if 'name' in prompt_text[0].meta.keys():
                file_name.append(prompt_text[i].meta['name'])
            elif 'file_name' in prompt_text[0].meta.keys():
                file_name.append(prompt_text[i].meta['file_name'])
            elif 'Filename' in prompt_text[0].meta.keys():
                file_name.append(prompt_text[i].meta['Filename'])
            elif 'file_path' in prompt_text[0].meta.keys():
                file_name.append(prompt_text[i].meta['file_path'])

        ##adding sharepoint links 
        #customer_list=[i.meta['Customer'] for i in prompt_text if 'Customer' in i.meta.keys()]
        #sharepoint_list=[i.meta['Document_Path'] for i in prompt_text if 'Document_Path' in i.meta.keys()]               
        return [prompt_text, query, model, file_name]
    else:
        return 'Please do embedding first.'
        




def construct_prompt(*input_args):
    '''
    Fetch relevant context and create prompt
    '''  
    input_args = input_args[0]
    prompt_list = input_args[0]
    question = input_args[1]
    model =  input_args[2]
    file_name = input_args[3]
    
    
    chosen_sections = []
    chosen_sections_indexes=[]
    for _, section in enumerate(prompt_list):
        chosen_sections.append(SEPARATOR + section.content)
        chosen_sections_indexes.append(str(section.content))
            
    header = '''Answer the question as truthfully as possible using only the provided context, and if the answer is not contained within the text below, say 'I don't know.' Do not use knowledge other than the text given below \n\nContext:\n'''    
   
    if model == 'Roberta':
        prompt_str = {}
        prompt_str['question'] = question.strip()
        prompt_str['context'] = ''.join(chosen_sections)
    else:
        prompt_str = ''.join(chosen_sections) + '\n\n Q: ' + question + '\n A:'
        
    return [prompt_str, model, file_name]


def modelResult(*input_args):
    input_args = input_args[0]
    prompt = input_args[0]
    model =  input_args[1]
    file_name = input_args[2]
    #customer_list = input_args[3]
    #sharepoint_list = input_args[4]
    
    if model == 'Roberta':
        text = str(prompt)
        d = {}
        d['context'] = text.strip()
        R_model = pipeline('question-answering', model=roberta, tokenizer=roberta)
        res = R_model(prompt) 
        out = res['answer']                
    out = out.replace('\n','')
    predict = {'Answers': out, 'File_names':list(set(file_name))}
    print(predict)
    return predict
def stop_ui():

    print("inside")

    interface_ui.close()

def executePipeline(query_param):

    ds_LeftMiddle_ZlNIK = qa_analysis(query_param=query_param,model_param='Roberta',context_param='policies',embedding_model_param='Sentence')
    ds_LeftMiddle_VwqqS = construct_prompt(ds_LeftMiddle_ZlNIK)
    out=modelResult(ds_LeftMiddle_VwqqS)
    return out

logging.info('Completed')


if __name__ == '__main__':
    # Gradio code
    with gr.Blocks(theme=gr.themes.Soft()) as interface_ui:    
        gr.Markdown(
                        """
                        # Text, Docx and PDF QNA
                        ### Extracts content from particular file and performs QNA on top of that.
                        """
                    )
#         input_dropdown = gr.CheckboxGroup(["file","questions","documents"], label="Choose input type")
#         url_param = gr.File(type="file",show_label=True, visible=False)
        with gr.Row():
            query_param = gr.Textbox(value = "None", label='Questions',placeholder='Enter comma seperated value',visible=True)

        run = gr.Button(value="Run")  
        stop = gr.Button(value="Stop")
        output = gr.JSON(label="Output")
        
        inputs = [query_param]
        
        event = run.click(fn=executePipeline, inputs=inputs, outputs=output)
        event = stop.click(fn=stop_ui)
                                
    #interface_ui.queue().launch(server_name='0.0.0.0',inbrowser=True,inline='False')
    interface_ui.queue().launch(server_name='0.0.0.0')
    print('Completed')

