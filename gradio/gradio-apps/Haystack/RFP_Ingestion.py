
import sys
import subprocess
import os
import pandas as pd
# please load the requirements manually at the pod(rancher)
# requirements = ['zipfile']
# for module in requirements:
#     subprocess.run(sys.executable + ' -m pip install '+ module + ' -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com',shell=True)
import logging
import json
import warnings
import datetime
from pathlib import Path
from haystack.document_stores import FAISSDocumentStore
from haystack.utils import clean_wiki_text, convert_files_to_docs
from haystack.nodes import JsonConverter
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
# roberta = '/opt/pipelines/deepset/roberta-base-squad2'
roberta = 'deepset/roberta-base-squad2'

os.environ['HF_DATASETS_OFFLINE'] = '1'
os.environ['TRANSFORMERS_OFFLINE'] = '1'

def DatasetExtractorMINIO(dataset_datasource_connectiondetails_url_param='', dataset_datasource_connectiondetails_accesskey_param='', dataset_datasource_connectiondetails_secretkey_param='', dataset_attributes_object_param='',dataset_attributes_bucket_param=''):
    URL = dataset_datasource_connectiondetails_url_param
    secure = True if urlparse(URL).scheme == 'https' else False
    client =Minio(urlparse(URL).hostname+':'+str(urlparse(URL).port),access_key=dataset_datasource_connectiondetails_accesskey_param,secret_key=dataset_datasource_connectiondetails_secretkey_param,secure=secure)
    if dataset_attributes_object_param.split('.')[-1] == 'csv':
        obj = client.get_object(dataset_attributes_bucket_param,dataset_attributes_object_param)
        dataset = pd.read_csv(obj)
        return dataset
    else:
        file_path = './' + dataset_attributes_object_param
        isExist = os.path.exists(file_path)
       
        if not isExist:
            print('Not exist==')
            result = client.fget_object(dataset_attributes_bucket_param,dataset_attributes_object_param, file_path)
        
        isExist = os.path.exists(dataset_attributes_object_param.split('.')[0])
        if not isExist:
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall('./')
        return file_path


def documentStoreCreation(folder, embed_model_param):
    try:
        global embedding_model, name
        embed_model = embed_model_param
        # folder = 'fileset_280'
        # folder = 'dataset'
        # folder = 'Dataset'
        name = ''
        
        if embed_model.lower() == 'sentence':
            embed_model = sentence
        elif embed_model.lower() == 'e5_large':
            embed_model = e5_large
            
        # faiss_dir = '/faiss_db'

        faiss_dir = './faiss_db'
        
        if not os.path.exists(faiss_dir):
            os.makedirs(faiss_dir)

        for file in Path(folder).iterdir():            
            name = os.path.basename(file)          
            doc_dir = f'{folder}/{name}'
            print("doc_dir==",doc_dir)
            # Creation or Load of FaissDocument Store
            if os.path.exists(f'{faiss_dir}/{embed_model}_{name}_index.faiss'):
                print(f'Already DB Created for {name}')
                document_store = FAISSDocumentStore.load(index_path=f'{faiss_dir}/{embed_model}_{name}_index.faiss',config_path=f'{faiss_dir}/{embed_model}_{name}_config.json')
            else:
                print('in else statement')
                document_store = FAISSDocumentStore(sql_url = f'sqlite:///{faiss_dir}/{embed_model}_{name}_DocumentStore.db')           
            
            print("file==",file)
            file_list = os.listdir(doc_dir)            
            for i in file_list:
                print(i)
                if i.split(".")[1].lower() == 'json':
                    converter = JsonConverter()
                    json_doc = converter.convert(f'{doc_dir}/{i}')                       
            
            doc = convert_files_to_docs(dir_path=doc_dir, clean_func=clean_wiki_text, split_paragraphs=True)
            
            for i in range(len(json_doc)):                
                doc.append(json_doc[i])           
                                 
            preprocessor = PreProcessor(clean_empty_lines=True,clean_whitespace=True,clean_header_footer=False,split_by='word',
                                        split_length=200,split_respect_sentence_boundary=True)
    
            # Preprocessing of doc and writing docs into document store    
            docs = preprocessor.process(doc)
            document_store.write_documents(docs)
        
        embedding_model = embed_model
        name = name
        
        return document_store

    except Exception as e:
        print(e)
        return str(e)



def embedding(document_store):
    try:
        # Embedding Retriever created
        faiss_dir = './faiss_db'
        # retriever = EmbeddingRetriever(document_store=document_store,embedding_model='/opt/pipelines/sentence-transformers/multi-qa-mpnet-base-dot-v1')
        retriever = EmbeddingRetriever(document_store=document_store,embedding_model='sentence-transformers/multi-qa-mpnet-base-dot-v1')        
        # Document Store is updated by retriever
        document_store.update_embeddings(retriever)
        # Document Store is save by indexing
        document_store.save(index_path=f'{faiss_dir}/{embedding_model}_{name}_index.faiss',config_path=f'{faiss_dir}/{embedding_model}_{name}_config.json')                
        return 'Embedding completed'
    except Exception as e:
        print(e)
        return str(e)

def executePipeline():
    ds_LeftMiddle_DURWr = documentStoreCreation("dataset", embed_model_param='Sentence')
    s = embedding(ds_LeftMiddle_DURWr)
    print(s)

logging.info('Completed')


if __name__ == '__main__':
    executePipeline()
    print('Completed')
