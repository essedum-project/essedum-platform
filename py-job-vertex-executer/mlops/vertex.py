import os
import sys
import requests
import json
import google.auth
import google.auth.transport.requests
import logging
import utils
from datetime import timezone
import pytz
import traceback
from google.oauth2 import service_account
import time
from datetime import datetime
from google.cloud import aiplatform
from google.cloud import aiplatform as vertex_ai, storage
from utils import *


os.environ['http_proxy'] = PROXY
os.environ['https_proxy'] = PROXY
os.environ['HTTP_PROXY'] = PROXY
os.environ['HTTPS_PROXY'] = PROXY
os.environ['no_proxy'] = NOPROXY


# Gets or creates a logger
logger = logging.getLogger(__name__)  

# set log level
logger.setLevel(logging.INFO)

# define file handler and set formatter
file_handler = logging.FileHandler('logfile.log')
formatter    = logging.Formatter('%(asctime)s : %(levelname)s : %(name)s : %(message)s')
file_handler.setFormatter(formatter)

# add file handler to logger
logger.addHandler(file_handler)


def get_access_token(connection):

    credentials_info = {
            'type': connection.get("type"),
            'project_id': connection.get("project_id"),
            'private_key_id': connection.get("private_key_id"),
            'private_key': connection.get("private_key", "").replace('\\n', '\n'),
            'client_email': connection.get("client_email"),
            'client_id': connection.get("client_id"),
            'auth_uri': connection.get("auth_uri"),
            'token_uri': connection.get("token_uri"),
            'auth_provider_x509_cert_url': connection.get("auth_provider_x509_cert_url"),
            'client_x509_cert_url': connection.get("client_x509_cert_url")
        }

    scopes = [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/cloud-platform.read-only'
    ]

    credentials = service_account.Credentials.from_service_account_info(credentials_info, scopes=scopes)
    auth_req = google.auth.transport.requests.Request()
    credentials.refresh(auth_req)

    return credentials.token

#cloud connect part
def cloudconnect(payload):
    try:
        credentials_info = {
            'type': payload.get("type"),
            'project_id': payload.get("project_id"),
            'private_key_id': payload.get("private_key_id"),
            'private_key': payload.get("private_key", "").replace('\\n', '\n'),
            'client_email': payload.get("client_email"),
            'client_id': payload.get("client_id"),
            'auth_uri': payload.get("auth_uri"),
            'token_uri': payload.get("token_uri"),
            'auth_provider_x509_cert_url': payload.get("auth_provider_x509_cert_url"),
            'client_x509_cert_url': payload.get("client_x509_cert_url")
        }

        credentials = service_account.Credentials.from_service_account_info(credentials_info)
        storage_client = storage.Client(project=payload.get("project_id"), credentials=credentials)
        buckets = list(storage_client.list_buckets())
        return True
    except Exception as err:
        logger.error(f"Unable to connect: {str(err)}")
        return False


'''----------------------------------------DATASETS-------------------------------------------------------------------------------------------'''
def projects_datasets_list_list(adapter_instance, project, isCached, isInstance, connection):
    logger.info(f"Inside projects_datasets {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/datasets"
    logger.info(f"printing url :{str(url)}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    logger.info(f"printing response :{response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            response_json = response.json()
            values = response_json.get("datasets")
            formatted = []
            logger.info("entering into the response format code..")
            for dataset in values:
                combined=f""
                response_format = {
                    "container": dataset.get('containerSpec', None),
                "adapter": adapter_instance,
                "rawPayload": dataset,
                "description": dataset.get("description", 'List Datset Operation'),
                "organization": project,
                "type": dataset.get('metadata',{}).get('dataItemSchemaUri', None),
                "createdOn": dataset.get("createTime", None),
                "sourceOrg": dataset.get('sourceOrg',None),
                "createdBy": dataset.get('createdBy', "user"),
                "metaData": dataset.get('metadata',None),
                "Id": dataset.get("name", 'None').split("/")[5],
                "SourceID": dataset.get("SourceID", None),
                "sourceName": dataset.get("displayName", None),
                "adapterId": connection['adapter_id'],
                "status": dataset.get("status", 'Listed'),
                "likes": dataset.get("likes", None),
                "modifiedOn": dataset.get("updateTime",None),
                "syncDate": dataset.get("createTime", None),
                "artifacts": dataset.get("metadataArtifact", None).split("/")[-1],
                "deployment": dataset.get("deployment", None)
            }
                response_format['rawPayload'] = json.dumps(json.dumps(response_format, default=str))
                formatted.append(response_format)
                logger.info(formatted)
            return formatted, 200
        else:
            return f"Request failed with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500

def projects_datasets_get(adapter_instance, project, isCached, isInstance, connection, dataset_id):
    logger.info(f"Inside projects_datasets {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/datasets/{dataset_id}"
    logger.info(f"printing url :{str(url)}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    logger.info(f"print response :{response.text}")

    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            dataset = json.loads(response.text)
            logger.info("entering into the response format code..")
            response_format = {
                "container": dataset.get('containerSpec', None),
                "adapter": adapter_instance,
                "rawPayload": dataset,
                "description": dataset.get("description", 'Get Datset Operation'),
                "organization": project,
                "type": dataset.get('metadata',{}).get('dataItemSchemaUri', None),
                "createdOn": dataset.get("createTime", None),
                "sourceOrg": dataset.get('sourceOrg',None),
                "createdBy": dataset.get('createdBy', "user"),
                "metaData": dataset.get('metadata',None),
                "Id": dataset.get("name", 'None').split("/")[5],
                "SourceID": dataset.get("SourceID", None),
                "sourceName": dataset.get("displayName", None),
                "adapterId": connection['adapter_id'],
                "status": dataset.get("status", 'Fetched'),
                "likes": dataset.get("likes", None),
                "modifiedOn": dataset.get("updateTime",None),
                "syncDate": dataset.get("createTime", None),
                "artifacts": dataset.get("metadataArtifact", None).split("/")[-1],
                "deployment": dataset.get("deployment", None)
            }
            response_format['rawPayload'] = json.dumps(json.dumps(response_format, default=str))
            logger.info(f"response format: {response_format}")
            return response_format, 200
        else:
            return f"Request failed with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500

def projects_datasets_delete(adapter_instance, project, isCached, isInstance, connection, dataset_id):
    logger.info(f"Inside projects_datasets_delete {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/datasets/{dataset_id}"
    logger.info(f"printing url :{str(url)}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.delete(url, headers=headers)
    logger.info(f"printing response :{response.text}")
    try:
        if response.status_code == 200 or 201 or 202:
            logger.info("entering into  if block after checking the statuscode =200....")
            dataset_details = json.loads(response.text)
            logger.info("entering into the response format code..")
            response_format = {
                    "container": dataset_details.get('Container', None),
                    "adapter": adapter_instance,
                    "rawPayload": dataset_details,
                    "description": dataset_details.get("description",'Delete Dataset Operation'),
                    "organization": project,
                    "type": dataset_details.get('metadata', {}).get('@type', None),
                    "createdOn": dataset_details.get('metadata', {}).get('genericMetadata', {}).get('createTime', None),
                    "sourceOrg": dataset_details.get('sourceOrg', None),
                    "createdBy": dataset_details.get('createdBy', 'user'),
                    "metaData": dataset_details.get('metadata', None),
                    "Id": dataset_id,
                    "SourceID": dataset_details.get("name", None).split("/")[5],
                    "sourceName": dataset_details.get('name', None),
                    "adapterId": connection['adapter_id'],
                    "status": dataset_details.get("done", 'Deleted'),
                    "likes": dataset_details.get('likes', None),
                    "syncDate":dataset_details.get('metadata', {}).get('genericMetadata', {}).get('createTime', None),
                    "modifiedOn": dataset_details.get('metadata', {}).get('genericMetadata', {}).get('updateTime', None),
                    "artifacts": dataset_details.get('metadataArtifact', None),
                    "deployment": dataset_details.get('deployment', None)
                }
            response_format['rawPayload'] = json.dumps(json.dumps(response_format, default=str))
            logger.info(f"response format: {response_format}")
            return response_format, 200
        else:
                return f"Request failed with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500

def projects_datasets_create(adapter_instance, project, isCached, isInstance, connection, request_body):
    logger.info(f"Inside projects_datasets {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/datasets"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers, json=request_body)
    try:
        if response.status_code == 200:
            dataset=json.loads(response.text)
            #formatted=responseFormat(adapter_instance,project,dataset)
            return dataset,200
        elif response.status_code == 400:
            return "Error: Bad Parameters(HTTP 400)",400
        elif response.status_code ==500:
            return "Internal Server Error(HTTP 500)",500
        else:
            return f"Request failed with status code:{response.status_code}",response.status_code
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")  
        return e,500
    
'''----------------------------------------MODELS-------------------------------------------------------------------------------------------'''

def projects_models_list(adapter_instance, project, isCached, isInstance, connection):
    logger.info(f"Inside projects_models {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/models"
    logger.info(f"printing url :{str(url)}") 
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    logger.info(f"printing response :{response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            response_json = response.json()
            values = response_json.get("models")
            formatted = []
            for models in values:
                if models.get("trainingPipeline"):
                    training_id = models['trainingPipeline'].split('/')[-1]
                    url1 = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/trainingPipelines/{training_id}"
                    headers1 = {
                 "Authorization": f"Bearer {token}",
                 "Content-Type": "application/json"
                    }
                    response1 = requests.get(url1, headers=headers1)
                    if response1.status_code == 200:
                        dataset_details= json.loads(response1.text)
                        dataset_id=dataset_details.get('inputDataConfig', {}).get('datasetId', None)
                    else:
                        dataset_id = None
                    logger.info("entering into the response format code..")
                    response_format = {
                  "container": models.get('container', None),
                  "adapter": adapter_instance,
                  "rawPayload": models,
                  "description": models.get("description",'Model List operation - Trained'),
                  "organization": project,
                  "type": models.get('modelSourceInfo', {}).get('sourceType', None),
                  "createdOn": models.get("versionCreateTime", None),
                  "sourceOrg": models.get('sourceOrg', None),
                  "createdBy": models.get('createdBy', 'User'),
                  "metaData": models.get('explanationSpec', {}).get('metadata', None),
                  "Id": models.get("name", 'None').split("/")[5],
                  "SourceID": f"dataset_id:{dataset_id},Training_pipeline_id:{training_id}",
                  "sourceName": models.get("displayName", None),
                  "adapterId": connection['adapter_id'],
                  "status": models.get("status", 'Listed'),
                  "likes": models.get("versionId", None),
                  "modifiedOn": models.get("versionUpdateTime",None),
                  "syncDate": models.get("versionCreateTime", None),
                  "artifacts": models.get("artifacts", None),
                  "deployment": models.get("supportedDeploymentResourcesTypes", None)
                  }
                else:
                    logger.info("non trained model response format..")
                    logger.info("entering into the response format code..")
                    response_format = {
                    "container": models.get('containerSpec', None),
                 "adapter": adapter_instance,
                 "rawPayload": models,
                 "description": models.get("description",'Model List operation -Non trained'),
                 "organization": project,
                 "type": models.get('modelSourceInfo', {}).get('sourceType', None),
                 "createdOn": models.get("createTime", None),
                 "sourceOrg": models.get('sourceOrg', None),
                 "createdBy": models.get('createdBy', 'User'),
                "metaData":  {
                  "supportedDeploymentResourcesTypes": models.get("supportedDeploymentResourcesTypes", None),
                  "supportedInputStorageFormats": models.get("supportedInputStorageFormats", None),
                  "supportedOutputStorageFormats": models.get("supportedOutputStorageFormats", None)
                 },
                 "Id": models.get("name",None).split("/")[5],
                 "SourceID": 'None',
                 "sourceName": models.get("displayName", None),
                 "adapterId":connection['adapter_id'],
                 "status": models.get("status", 'Listed'),
                 "likes": models.get("versionId", None),
                 "modifiedOn": models.get("updateTime",None),
                 "artifacts": models.get("artifactUri", None),
                 "syncDate":  models.get("createTime", None),
                 "deployment": models.get("supportedDeploymentResourcesTypes", None)
                } 
                response_format['rawPayload'] = json.dumps(json.dumps(response_format, default=str))
                logger.info(f"response format: {formatted}")
                formatted.append(response_format)
            return formatted, 200
        else:
            return f"Request failed with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500


def projects_models_get(adapter_instance, project, isCached, isInstance, connection, model_id):
    logger.info(f"Inside projects_models {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/models/{model_id}"
    logger.info(f"printing url:{str(url)}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    logger.info(f"printing response: {response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            models = json.loads(response.text)
            if models.get("trainingPipeline"):
                training_id = models['trainingPipeline'].split('/')[-1]
                url1 = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/trainingPipelines/{training_id}"
                headers1 = {
                 "Authorization": f"Bearer {token}",
                 "Content-Type": "application/json"
                }
                response1 = requests.get(url1, headers=headers1)
                if response1.status_code == 200:
                        dataset_details= json.loads(response1.text)
                        dataset_id=dataset_details.get('inputDataConfig', {}).get('datasetId', None)
                else:
                        dataset_id = None
                logger.info("entering into the response format code..")
                response_format = {
                  "container": models.get('container', None),
                  "adapter": adapter_instance,
                  "rawPayload": models,
                  "description": models.get("description",'Model List operation - Trained'),
                  "organization": project,
                  "type": models.get('modelSourceInfo', {}).get('sourceType', None),
                  "createdOn": models.get("versionCreateTime", None),
                  "sourceOrg": models.get('sourceOrg', None),
                  "createdBy": models.get('createdBy', 'User'),
                  "metaData": models.get('explanationSpec', {}).get('metadata', None),
                  "Id": models.get("name", 'None').split("/")[5],
                  "SourceID": f"dataset_id:{dataset_id},Training_pipeline_id:{training_id}",
                  "sourceName": models.get("displayName", None),
                  "adapterId": connection['adapter_id'],
                  "status": models.get("status", 'Fetched'),
                  "likes": models.get("versionId", None),
                  "modifiedOn": models.get("versionUpdateTime",None),
                  "syncDate": models.get("versionCreateTime", None),
                  "artifacts": models.get("artifacts", None),
                  "deployment": models.get("supportedDeploymentResourcesTypes", None)
                  }
            else:
                logger.info("non trained model response format..")
                logger.info("entering into the response format code..")
                response_format = {
                    "container": models.get('containerSpec', None),
                 "adapter": adapter_instance,
                 "rawPayload": models,
                 "description": models.get("description",'Model List operation -Non trained'),
                 "organization": project,
                 "type": models.get('modelSourceInfo', {}).get('sourceType', None),
                 "createdOn": models.get("createTime", None),
                 "sourceOrg": models.get('sourceOrg', None),
                 "createdBy": models.get('createdBy', 'User'),
                "metaData":  {
                  "supportedDeploymentResourcesTypes": models.get("supportedDeploymentResourcesTypes", None),
                  "supportedInputStorageFormats": models.get("supportedInputStorageFormats", None),
                  "supportedOutputStorageFormats": models.get("supportedOutputStorageFormats", None)
                 },
                 "Id": models.get("name",None).split("/")[5],
                 "SourceID": 'None',
                 "sourceName": models.get("displayName", None),
                 "adapterId":connection['adapter_id'],
                 "status": models.get("status", 'Fetched'),
                 "likes": models.get("versionId", None),
                 "modifiedOn": models.get("updateTime",None),
                 "artifacts": models.get("artifactUri", None),
                 "syncDate":  models.get("createTime", None),
                 "deployment": models.get("supportedDeploymentResourcesTypes", None)
                } 
            response_format['rawPayload'] = json.dumps(json.dumps(response_format, default=str))
            logger.info(f"response format: {response_format}")
            return response_format, 200
        else:
            return f"Request failed  with status code: {response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500


def projects_models_register_create(adapter_instance, project, isCached, isInstance, connection, request_body):
    logger.info(f"Inside projects_datasets {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    request_body = json.dumps(request_body)
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/models:upload"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers, data=request_body)
    logger.info(f"printing response:{response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            model = json.loads(response.text)
            request_body_dict = json.loads(request_body)
            logger.info("entering into the response format code..")
            response_format = {
                "container": request_body_dict.get('model', {}).get('containerSpec',None),
                "adapter": adapter_instance,
                "rawPayload": model,
                "description": model.get("description", 'Model Create Operation'),
                "organization": project,
                "type": model.get("metadata", {}).get('@type', None),
                "createdOn": model.get("metadata", {}).get("genericMetadata", {}).get("createTime", None),
                "sourceOrg": model.get('sourceOrg', None),
                "createdBy": model.get('createdBy', "user"),
                "metaData": model.get('metadata', None),
                "Id": model.get("name", None).split("/")[5],
                "SourceID": model.get("name", None).split("/")[-1],
                "sourceName": request_body_dict.get('model', {}).get('displayName', None),
                "adapterId": connection['adapter_id'],
                "status": model.get("status", 'Created'),
                "likes": model.get("likes", None),
                "syncDate":  model.get("metadata", {}).get("genericMetadata", {}).get("createTime", None),
                "modifiedOn": model.get("metadata", {}).get("genericMetadata", {}).get("updateTime", None),
                "artifacts": request_body_dict.get('model', {}).get('artifactUri', None),
                "deployment": model.get("deployment", None)
            }
            response_format['rawPayload'] = json.dumps(response_format)
            logger.info(f"response format printing: {response_format}")
            return response_format, 200
        else:
            return f"Request failed with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500


def projects_models_delete(adapter_instance, project, isCached, isInstance, connection,model_id):
    logger.info(f"Inside projects_endpoints {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/models/{model_id}"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.delete(url, headers=headers)
    logger.info(f"printing response:{response.text}")
    try:
        if response.status_code==200 or 201 or 202:
                logger.info("entering into  if block after checking the statuscode =200....")
                model=json.loads(response.text)
                logger.info("entering into the response format code..")
                response_format = {
                    "container": model.get('containerSpec', None),
                    "adapter": adapter_instance,
                    "rawPayload": model,
                    "description": model.get("description",'Model Delete Operation'),
                    "organization": project,
                    "type": model.get('response', {}).get('@type', None),
                    "createdOn":  model.get("metadata",{}).get("genericMetadata",{}).get("createTime",None),
                    "sourceOrg": model.get('sourceOrg', None),
                    "createdBy": model.get('createdBy', 'User'),
                    "metaData":  model.get('metadata',None),
                    "Id": model.get("name", 'None').split("/")[5],
                     "SourceID": model.get("name", 'None').split("/")[-1],
                    "sourceName": model.get("displayName", None),
                    "adapterId": connection['adapter_id'],
                    "status": model.get("done", 'Not deleted'),
                    "likes": model.get("versionId", None),
                    "syncDate":  model.get("metadata",{}).get("genericMetadata",{}).get("createTime",None),
                    "modifiedOn": model.get("metadata",{}).get("genericMetadata",{}).get("updateTime",None),
                    "artifacts": model.get("artifactUri", None),
                    "deployment": model.get("deployment", None)
                }
                response_format['rawPayload'] = json.dumps(json.dumps(response_format, default=str))
                logger.info(f"printing response :{response_format}")
                return response_format, 200
        else:
            return f"Request failed with  status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500
    
'''----------------------------------------ENDPOINTS-------------------------------------------------------------------------------------------'''
def projects_endpoints_list_list(adapter_instance, project, isCached, isInstance, connection):
    logger.info(f"Inside projects_endpoints {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/endpoints"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    logger.info(f"printing response:{response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            response_json = response.json()
            values = response_json.get("endpoints")
            formatted = []
            logger.info("entering into the response format code..")
            for endpoint in values:
                response_format = {
                    "container": endpoint.get("container", None) ,
                       "adapter": adapter_instance,
                       "rawPayload": endpoint,
                       "description": endpoint.get("description", 'Endpoint List Operation'),
                      "organization": project,
                      "type": endpoint.get('type', None),
                      "createdOn": endpoint.get("createTime", None),
                    "sourceOrg": endpoint.get('sourceOrg', None),
                      "createdBy": endpoint.get('createdBy', "user"),
                    "metaData": endpoint.get('deployedModels', None),
                      "Id": endpoint.get("name", 'None').split("/")[5],
                    "SourceID": [model.get('model', 'None').split("/")[5] for model in endpoint.get('deployedModels', [])],
                        "sourceName": endpoint.get('displayName', ''),
                        "adapterId": connection['adapter_id'],
                        "status": endpoint.get("status", 'Listed'),
                        "likes": endpoint.get("modelVersionId", None),
                        "modifiedOn": endpoint.get("updateTime", None),
                        "syncDate": endpoint.get("createTime", None),
                     "artifacts": endpoint.get("artifacts", None) ,
                    "deployment": len([model.get('model', 'None') for model in endpoint.get('deployedModels', [])])
            }
                response_format['rawPayload'] = json.dumps(json.dumps(response_format, default=str))
                logger.info(f"printing response format:{formatted}")
                formatted.append(response_format)
            return formatted, 200
        else:
            return f"Request failed with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500

def projects_endpoints_get(adapter_instance, project, isCached, isInstance, connection,endpoint_id):
    logger.info(f"Inside projects_endpoints {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/endpoints/{endpoint_id}"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    logger.info(f"printing response:{response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            endpoint=json.loads(response.text)
            logger.info("entering into the response format code..")
            response_format = {
                    "container": endpoint.get("container", None) ,
                       "adapter": adapter_instance,
                       "rawPayload": endpoint,
                       "description": endpoint.get("description", 'Endpoint Getting Operation'),
                      "organization": project,
                      "type": endpoint.get('type', None),
                      "createdOn": endpoint.get("createTime", None),
                    "sourceOrg": endpoint.get('sourceOrg', None),
                      "createdBy": endpoint.get('createdBy', "user"),
                    "metaData": endpoint.get('deployedModels', None),
                      "Id": endpoint.get("name", 'None').split("/")[5],
                    "SourceID": [model.get('model', 'None').split("/")[5] for model in endpoint.get('deployedModels', [])],
                        "sourceName": endpoint.get('displayName', ''),
                        "adapterId": connection['adapter_id'],
                        "status": endpoint.get("status", 'Fetched'),
                        "likes": endpoint.get("modelVersionId", None),
                        "modifiedOn": endpoint.get("updateTime", None),
                        "syncDate": endpoint.get("createTime", None),
                     "artifacts": endpoint.get("artifacts", None) ,
                    "deployment": len([model.get('model', 'None') for model in endpoint.get('deployedModels', [])])
            }
            response_format['rawPayload'] = json.dumps(json.dumps(response_format, default=str))
            logger.info(f"printing response format:{response_format}")
            return response_format, 200
        else:
            return f"Request failed with status code:", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500
                 
def projects_endpoints_create(adapter_instance, project, isCached, isInstance, connection, request_body):
    logger.info(f"Inside projects_endpoints {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/endpoints"
    logger.info(f"printing Url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers, json=request_body)
    logger.info(f"printing response:{response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            endpoint=json.loads(response.text)
            logger.info("entering into the response format code..")
            response_format = {
                    "container": endpoint.get("container", None) ,
                    "adapter": adapter_instance,
                    "rawPayload": endpoint,
                    "description": endpoint.get("description", 'Endpoint Creation Operation'),
                    "organization": project,
                    "type": endpoint.get("metadata", {}).get('@type', None),
                    "createdOn": endpoint.get("metadata", {}).get("genericMetadata", {}).get("createTime", None),
                    "sourceOrg": endpoint.get('sourceOrg', None),
                    "createdBy": endpoint.get('createdBy', "user"),
                    "metaData": endpoint.get('metadata', None),
                    "Id": endpoint.get("name", None).split("/")[5],
                    "SourceID": endpoint.get("name", None).split("/")[-1],
                    "sourceName":  request_body.get('displayName', None),
                    "adapterId": connection['adapter_id'],
                    "status": endpoint.get("status", 'Created'),
                    "likes": endpoint.get("likes", None),
                    "syncDate":  endpoint.get("metadata", {}).get("genericMetadata", {}).get("createTime", None),
                    "modifiedOn": endpoint.get("metadata", {}).get("genericMetadata", {}).get("updateTime", None),
                    "artifacts": endpoint.get("artifacts", None) ,
                    "deployment": endpoint.get("deployment", None)
            }
            response_format['rawPayload'] = json.dumps(response_format)
            logger.info(f"printing response:{response_format}")
            return response_format, 200
        else:
            return f"Request failed with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500
        
def projects_endpoints_delete(adapter_instance, project, isCached, isInstance, connection,endpoint_id):
    logger.info(f"Inside projects_datasets_delete {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/endpoints/{endpoint_id}"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    logger.info(f"printing getting response:{response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            endpoint_details = json.loads(response.text)
            url1 = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/endpoints/{endpoint_id}"
            logger.info(f"printing url :{url}")
            response1 = requests.delete(url1, headers=headers)
            logger.info(f"printing getting response:{response1.text}")
            endpoint = json.loads(response1.text)
            logger.info("entering into the response format code..")
            response_format = {
                    "container": endpoint.get('Container', None),
                  "adapter": adapter_instance,
                  "rawPayload": endpoint,
                  "description": endpoint.get("description",'Endpoint Delete Operation'),
                  "organization": project,
                  "type": endpoint.get('metadata', {}).get('@type', None),
                  "createdOn": endpoint.get('metadata', {}).get('genericMetadata', {}).get('createTime', None),
                    "sourceOrg": endpoint.get('sourceOrg', None),
                  "createdBy": endpoint.get('createdBy', 'user'),
                  "metaData": endpoint.get('metadata', None),
                  "Id": endpoint_id,
                  "SourceID": endpoint.get('name',None).split('/')[5],
                  "sourceName": endpoint_details.get('displayName', None),
                  "adapterId": connection['adapter_id'],
                  "status": endpoint.get("done", None),
                  "syncDate": endpoint.get('metadata', {}).get('genericMetadata', {}).get('createTime', None),
                  "likes": endpoint.get("modelVersionId",None),
                  "modifiedOn": endpoint.get('metadata', {}).get('genericMetadata', {}).get('updateTime', None),
                  "artifacts": endpoint.get('metadataArtifact', None),
                  "deployment": endpoint.get('deployment', None)
                }
            response_format['rawPayload'] = json.dumps(response_format)
            logger.info(f"printing response format:{response_format}")
            return response_format, 200
        else:
            return f"Request failed with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500

'''----------------------------------------Training PIPELINES-------------------------------------------------------------------------------------------'''

def training_istlist(adapter_instance, project, isCached, isInstance, connection):
    logger.info(f"Inside projects_datasets {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/trainingPipelines"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    logger.info(f"printing response :{response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            response_json = response.json()
            values = response_json.get("trainingPipelines")
            formatted = []
            logger.info("entering into the response format code..")
            for tp in values:
                model_id = tp.get('modelToUpload', {}).get('name', None)
                if model_id:
                    model_id = model_id.split('/')[5]
                combined_details = f"dataset id: {tp.get('inputDataConfig', {}).get('datasetId',None)}, model id:{model_id}"
                response_format = {
                  "container": tp.get("container", None) ,
                      "adapter": adapter_instance,
                      "rawPayload": tp,
                      "description": tp.get("description", 'List training_Pipeline Operation'),
                      "organization": project,
                     "type": tp.get('trainingTaskInputs', {}).get('predictionType',None),
                     "createdOn": tp.get("createTime", None),
                    "sourceOrg": tp.get('sourceOrg', None),
                     "createdBy": tp.get('createdBy', "user"),
                     "metaData": tp.get('trainingTaskInputs', None),
                    "Id": tp.get('name','None').split("/")[5],
                    "SourceID": combined_details,
                    "sourceName": tp.get('displayName', None),
                  "adapterId": connection['adapter_id'],
                    "status": tp.get("state", None),
                    "likes": tp.get("modelToUpload", {}).get('versionId',None),
                    "syncDate": tp.get("createTime", None),
                    "modifiedOn": tp.get("updateTime", None),
                   "artifacts": tp.get("artifacts", None) ,
                  "deployment": tp.get("deployment", None)
            }
                response_format['rawPayload'] = json.dumps(json.dumps(response_format, default=str))
                formatted.append(response_format)
                logger.info(f"printing response format:{formatted}")
            return formatted, 200
        else:
            return f"Request failed with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500
               
def training_get_list(adapter_instance, project, isCached, isInstance, connection,pipeline_id):
    logger.info(f"Inside projects_training {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/trainingPipelines/{pipeline_id}"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    logger.info(f"printing response:{response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            tp=json.loads(response.text)
            logger.info("entering into the response format code..")
            model_id = tp.get('modelToUpload', {}).get('name', None)
            if model_id:
                model_id = model_id.split('/')[5]
            combined_details = f"dataset id: {tp.get('inputDataConfig', {}).get('datasetId',None)}, model id:{model_id}"
            response_format = {
                  "container": tp.get("container", None) ,
                      "adapter": adapter_instance,
                      "rawPayload": tp,
                      "description": tp.get("description", 'Get training_Pipeline Operation'),
                      "organization": project,
                     "type": tp.get('trainingTaskInputs', {}).get('predictionType',None),
                     "createdOn": tp.get("createTime", None),
                    "sourceOrg": tp.get('sourceOrg', None),
                     "createdBy": tp.get('createdBy', "user"),
                     "metaData": tp.get('trainingTaskInputs', None),
                    "Id": pipeline_id,
                    "SourceID": combined_details,
                    "sourceName": tp.get('displayName', None),
                  "adapterId": connection['adapter_id'],
                    "status": tp.get("state", None),
                    "likes": tp.get("modelToUpload", {}).get('versionId',None),
                    "syncDate": tp.get("createTime", None),
                    "modifiedOn": tp.get("updateTime", None),
                   "artifacts": tp.get("artifacts", None) ,
                  "deployment": tp.get("deployment", None)
            }
            response_format['rawPayload'] = json.dumps(response_format)
            logger.info(f"printing response format:{response_format}")
            return response_format, 200
        else:
            return f"Request failed with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500    

def training_cancel_list(adapter_instance, project, isCached, isInstance, connection, training_job_id):
    logger.info(f"Inside projects_training {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/trainingPipelines/{training_job_id}"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    logger.info(f"printing response:{response.text}")
    try:
        if response.status_code==200:
            logger.info("entering into  if block after checking the statuscode =200....")
            url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/trainingPipelines/{training_job_id}:cancel"
            response1 = requests.post(url, headers=headers,)
            tp=json.loads(response.text)
            combined_details = f"dataset_id: {tp.get('inputDataConfig', {}).get('datasetId',None)}, model_Name:{tp.get('modelToUpload', {}).get('displayName',None)}"
            logger.info("entering into the response format code..")
            response_format = {
                  "container": tp.get("container", None) ,
                      "adapter": adapter_instance,
                      "rawPayload": tp,
                      "description": tp.get("description", 'training_Pipeline Cancel Operation'),
                      "organization": project,
                     "type": tp.get('trainingTaskInputs', {}).get('predictionType',None),
                     "createdOn": tp.get("createTime", None),
                    "sourceOrg": tp.get('sourceOrg', None),
                     "createdBy": tp.get('createdBy', "user"),
                     "metaData": tp.get('trainingTaskInputs', None),
                    "Id": training_job_id,
                    "SourceID": combined_details,
                    "sourceName": tp.get('displayName', None),
                  "adapterId": connection['adapter_id'],
                    "status": tp.get("state", 'Pipeline Cancelling..'),
                    "likes": tp.get("modelToUpload", {}).get('versionId',None),
                   "syncDate": tp.get("createTime", None),
                    "modifiedOn": tp.get("updateTime", None),
                   "artifacts": tp.get("artifacts", None) ,
                  "deployment": tp.get("deployment", None)
            }
            response_format['rawPayload'] = json.dumps(response_format)
            logger.info(f"printing response format:{response_format}")
            return response_format, 200
        else:
            return f"Request failed with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500
       

def training_train_create(adapter_instance, project, isCached, isInstance, connection, request_body):
    logger.info(f"Inside projects_training {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/trainingPipelines"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers, json=request_body)
    logger.info(f"printing response:{response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            training=json.loads(response.text)
            logger.info("entering into the response format code..")
            response_format = {
                  "container": training.get("container", None) ,
                "adapter": adapter_instance,
                "rawPayload": training,
                "description": training.get("description", 'training pipeline Create Operation'),
                "organization": project,
                  "type": training.get('type',None),
                "createdOn": training.get("createTime", None),
                  "sourceOrg": training.get('sourceOrg', None),
                "createdBy": training.get('createdBy', "user"),
                "metaData": {
                            "inputConfig": training.get("inputConfig", None),
                             "trainingTaskDefinition": training.get("trainingTaskDefinition", None),
                             "trainingTaskInputs": training.get("trainingTaskInputs", None),
							 "modelToUpload": training.get("modelToUpload", None),
                            },
               "Id": training.get('name',None).split('/')[5],
               "SourceID": f"dataset_id:{training.get('inputDataConfig',{}).get('datasetId')},model_id:{request_body.get('modelToUpload',{}).get('name').split('/')[5]}",
               "sourceName": training.get('displayName', None),
               "adapterId": connection['adapter_id'],
               "status": training.get("state", None),
               "likes": request_body.get("modelToUpload",{}).get("versionId"),
               "modifiedOn": training.get("updateTime", None),
               "syncDate": training.get("createTime", None),
                 "artifacts": training.get("artifacts", None) ,
                 "deployment": training.get("deployment",None)
            }
            response_format['rawPayload'] = json.dumps(response_format)
            logger.info(f"printing response format:{response_format}")
            return response_format, 200
        else:
            return f"Request failed with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500

def training_delete(adapter_instance, project, isCached, isInstance, connection, training_job_id):
    logger.info(f"Inside projects_training {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/trainingPipelines/{training_job_id}"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    logger.info(f"printing response:{response.text}")
    try:
        if response.status_code==200:
            logger.info("entering into  if block after checking the statuscode =200....")
            tp=json.loads(response.text)
            url1 = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/trainingPipelines/{training_job_id}"
            response1 = requests.delete(url1, headers=headers)
            tp_delete_details=json.loads(response1.text)
            logger.info("entering into the response format code..")
            response_format = {
                  "container": tp_delete_details.get('Container', None),
                  "adapter": adapter_instance,
                  "rawPayload": tp_delete_details,
                  "description": tp_delete_details.get("description",'Training Pipeline Delete Operation'),
                  "organization": project,
                  "type": tp_delete_details.get('metadata', {}).get('@type', None),
                  "createdOn": tp_delete_details.get('metadata', {}).get('genericMetadata', {}).get('createTime', None),
                  "sourceOrg": tp_delete_details.get('sourceOrg', None),
                  "createdBy": tp_delete_details.get('createdBy', 'user'),
                  "metaData": tp_delete_details.get('metadata', None),
                  "Id": training_job_id,
                  "SourceID": tp_delete_details.get('name',None).split('/')[5],
                  "sourceName": tp.get('displayName', None),
                  "adapterId": connection['adapter_id'],
                  "status": tp_delete_details.get("done", None),
                  "syncDate": tp_delete_details.get('metadata', {}).get('genericMetadata', {}).get('createTime', None),
                  "likes": tp_delete_details.get("modelVersionId",None),
                  "modifiedOn": tp_delete_details.get('metadata', {}).get('genericMetadata', {}).get('updateTime', None),
                  "artifacts": tp_delete_details.get('metadataArtifact', None),
                  "deployment": tp_delete_details.get('deployment', None)
                }
            response_format['rawPayload'] = json.dumps(response_format)
            logger.info(f"printing response format:{response_format}")
            return response_format, 200
        else:
            return f"Request failed with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500

        
        

#-------------------------------#inference pipelines---------------------------------------------------------------------

def projects_inferencePipelines_list_list(adapter_instance, project, isCached, isInstance, connection):
    logger.info(f"Inside projects_inference {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/batchPredictionJobs"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    logger.info(f"printing response:{response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            response_json = response.json()
            values = response_json.get("batchPredictionJobs")
            formatted = []
            logger.info("entering into the response format code..")
            for ip in values:
               response_format = {
                   "container": ip.get("container", None) ,
               "adapter": adapter_instance,
               "rawPayload": ip,
               "description": ip.get("description", 'Inference_Pipeline List Operation'),
               "organization": project,
                     "type": ip.get('trainingTaskInputs', {}).get('predictionType',None),
               "createdOn": ip.get("createTime", None),
                    "sourceOrg": ip.get('sourceOrg', None),
               "createdBy": ip.get('createdBy', "user"),
               "metaData": {
                            "inputConfig": ip.get("inputConfig", None),
                             "outputConfig": ip.get("outputConfig", None),
                             "dedicatedResources": ip.get("dedicatedResources", None),
							 "manualBatchTuningParameters": ip.get("manualBatchTuningParameters", None),
							 "outputInfo": ip.get("outputInfo", None)
                            },
               "Id": ip.get('name',None).split('/')[5],
               "SourceID": ip.get('model',None).split('/')[5] ,
               "sourceName": ip.get('displayName', None),
               "adapterId":connection['adapter_id'],
               "status": ip.get("state", None),
               "likes": ip.get("modelVersionId",None),
               "modifiedOn": ip.get("updateTime", None),
               "syncDate": ip.get("createTime", None),
                   "artifacts": ip.get("artifacts", None) ,
               "deployment":f"deployed model id:{ip.get('model',None).split('/')[5]}" 
            }
               response_format['rawPayload'] = json.dumps(json.dumps(response_format, default=str))
               formatted.append(response_format)
               logger.info(f"printing response format:{formatted}")
            return formatted, 200
        else:
            return f"Request failed with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500

def projects_inferencePipelines_get(adapter_instance, project, isCached, isInstance, connection,pipeline_id ):
    logger.info(f"Inside projects_inference {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/batchPredictionJobs/{pipeline_id}"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    logger.info(f"printing response:{response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            ip=json.loads(response.text)
            logger.info("entering into the response format code..")
            response_format = {
                   "container": ip.get("container", None) ,
               "adapter": adapter_instance,
               "rawPayload": ip,
               "description": ip.get("description", 'Inference_Pipeline Get Operation'),
               "organization": project,
                     "type": ip.get('trainingTaskInputs', {}).get('predictionType',None),
               "createdOn": ip.get("createTime", None),
                    "sourceOrg": ip.get('sourceOrg', None),
               "createdBy": ip.get('createdBy', "user"),
               "metaData": {
                            "inputConfig": ip.get("inputConfig", None),
                             "outputConfig": ip.get("outputConfig", None),
                             "dedicatedResources": ip.get("dedicatedResources", None),
							 "manualBatchTuningParameters": ip.get("manualBatchTuningParameters", None),
							 "outputInfo": ip.get("outputInfo", None)
                            },
               "Id": ip.get('name',None).split('/')[5],
               "SourceID": ip.get('model',None).split('/')[5] ,
               "sourceName": ip.get('displayName', None),
               "adapterId": connection['adapter_id'],
               "status": ip.get("state", None),
               "likes": ip.get("modelVersionId",None),
               "modifiedOn": ip.get("updateTime", None),
               "syncDate":ip.get("createTime", None),
                   "artifacts": ip.get("artifacts", None) ,
               "deployment":f"deployed model id:{ip.get('model',None).split('/')[5]}" 
            }
            response_format['rawPayload'] = json.dumps(response_format)
            logger.info(f"printing response format:{response_format}")
            return response_format, 200
        else:
            return f"Request failed with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500    
    

def projects_inferencePipelines_create(adapter_instance, project, isCached, isInstance, connection, request_body):
    logger.info(f"Inside projects_training {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/batchPredictionJobs"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers, json=request_body)
    logger.info(f"printing response:{response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            bp=json.loads(response.text)
            logger.info("entering into the response format code..")
            response_format = {
                    "container": bp.get("container", None) ,
                  "adapter": adapter_instance,
                  "rawPayload": bp,
                  "descrbption": bp.get("description", 'Batch_Prediction Create Operation'),
                  "organization": project,
                    "type": bp.get('type',None),
                  "createdOn": bp.get("createTime", None),
                    "sourceOrg": bp.get('sourceOrg', None),
                  "createdBy": bp.get('createdBy', "user"),
                  "metaData": {
                            "inputConfig": bp.get("inputConfig", None),
                             "outputConfig": bp.get("outputConfig", None),
                             "dedicatedResources": bp.get("dedicatedResources", None),
							 "manualBatchTuningParameters": bp.get("manualBatchTuningParameters", None),
							 "outputInfo": request_body.get("outputInfo", None)
                            },
                 "Id": bp.get('name',None).split('/')[5],
                 "SourceID": f"deployed model id:{bp.get('model',None).split('/')[5]}",
                 "sourceName": bp.get('displayName', None),
                   "adapterId": connection['adapter_id'],
                 "status": bp.get("state", None),
                 "likes": bp.get("modelVersionId",None),
                 "modifiedOn": bp.get("updateTime", None),
                 "syncDate": bp.get("createTime", None),
                   "artifacts": bp.get("artifacts", None) ,
                   "deployment": bp.get("deployment",None)
            }
            response_format['rawPayload'] = json.dumps(response_format)
            logger.info(f"printing response format:{response_format}")
            return response_format, 200
        else:
            return f"Request failed with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500
                
def projects_inferencePipelines_delete(adapter_instance, project, isCached, isInstance, connection, inference_job_id):
    logger.info(f"Inside projects_datasets_delete {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/batchPredictionJobs/{inference_job_id}"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    logger.info(f"printing response:{response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            ip = json.loads(response.text)
            url1 = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/batchPredictionJobs/{inference_job_id}"
            response1 = requests.delete(url1, headers=headers)
            ip_delete= json.loads(response1.text)
            logger.info("entering into the response format code..")
            response_format = {
                  "container": ip_delete.get('Container', None),
                  "adapter": adapter_instance,
                  "rawPayload": ip_delete,
                  "description": ip_delete.get("description",'Training Pipeline Delete Operation'),
                  "organization": project,
                  "type": ip_delete.get('metadata', {}).get('@type', None),
                  "createdOn": ip_delete.get('metadata', {}).get('genericMetadata', {}).get('createTime', None),
                  "sourceOrg": ip_delete.get('sourceOrg', None),
                  "createdBy": ip_delete.get('createdBy', 'user'),
                  "metaData": ip_delete.get('metadata', None),
                  "Id": inference_job_id,
                  "SourceID": ip_delete.get('name',None).split('/')[5],
                  "sourceName": ip.get('displayName', None),
                  "adapterId": connection['adapter_id'],
                  "status": ip_delete.get("done", None),
                  "syncDate": ip_delete.get('metadata', {}).get('genericMetadata', {}).get('createTime', None),
                  "likes": ip_delete.get("modelVersionId",None),
                  "modifiedOn": ip_delete.get('metadata', {}).get('genericMetadata', {}).get('updateTime', None),
                  "artifacts": ip_delete.get('metadataArtifact', None),
                  "deployment": ip_delete.get('deployment', None)
                }
            response_format['rawPayload'] = json.dumps(response_format)
            logger.info(f"printing response format:{response_format}")
            return response_format, 200
        else:
            return f"Request failed with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500

    
def projects_inferencePipelines_cancel(adapter_instance, project, isCached, isInstance, connection, inference_job_id, request_body):
    logger.info(f"Inside projects_training {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/batchPredictionJobs/{inference_job_id}"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    logger.info(f"printing response:{response.text}")
    try:
        if response.status_code==200:
            logger.info("entering into  if block after checking the statuscode =200....")
            url1 = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/batchPredictionJobs/{inference_job_id}:cancel"
            response1 = requests.post(url1, headers=headers)
            logger.info("entering into the response format code..")
            ip=json.loads(response.text)
            response_format = {
                   "container": ip.get("container", None) ,
               "adapter": adapter_instance,
               "rawPayload": ip,
               "description": ip.get("description", 'Inference_Pipeline Deleting Operation'),
               "organization": project,
                     "type": ip.get('trainingTaskInputs', {}).get('predictionType',None),
               "createdOn": ip.get("createTime", None),
                    "sourceOrg": ip.get('sourceOrg', None),
               "createdBy": ip.get('createdBy', "user"),
               "metaData": {
                            "inputConfig": ip.get("inputConfig", None),
                             "outputConfig": ip.get("outputConfig", None),
                             "dedicatedResources": ip.get("dedicatedResources", None),
							 "manualBatchTuningParameters": ip.get("manualBatchTuningParameters", None),
							 "outputInfo": ip.get("outputInfo", None)
                            },
               "Id": ip.get('name',None).split('/')[5],
               "SourceID": ip.get('model',None).split('/')[5] ,
               "sourceName": ip.get('displayName', None),
               "adapterId": connection['adapter_id'],
               "status": ip.get("state", 'Cancelling...'),
               "likes": ip.get("modelVersionId",None),
               "modifiedOn": ip.get("updateTime", None),
               "syncDate":ip.get("createTime", None),
                   "artifacts": ip.get("artifacts", None) ,
               "deployment":f"deployed model id:{ip.get('model',None).split('/')[5]}" 
            }
            response_format['rawPayload'] = json.dumps(response_format)
            logger.info(f"printing response format:{response_format}")
            return response_format, 200
        else:
            return f"Request failed with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500

#------------------------------other API's----------------------------------------------

def projects_endpoints_deploy_model_create(adapter_instance, project, isCached, isInstance, connection, endpoint_id, request_body):
    logger.info(f"Inside projects_endpoints {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/endpoints/{endpoint_id}:deployModel"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers, json=request_body)
    logger.info(f"printing response: {response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            modeldeploy=json.loads(response.text)
            logger.info("entering into the response format code..")
            model_id=request_body.get('deployedModel', {}).get('model','None').split("/")[5]
            response_format = {
                   "container": request_body.get('modeldeploy', {}).get('containerSpec', None),
                   "adapter": adapter_instance,
                   "rawPayload": modeldeploy,
                  "description": modeldeploy.get("description", 'ModelDeploy Creation'),
                  "organization": project,
                   "type": modeldeploy.get("metadata", {}).get('@type', None),
                   "createdOn": modeldeploy.get("metadata", {}).get("genericMetadata", {}).get("createTime", None),
                   "syncDate": modeldeploy.get("metadata", {}).get("genericMetadata", {}).get("createTime", None),
                  "sourceOrg": modeldeploy.get('sourceOrg', None),
                    "createdBy": modeldeploy.get('createdBy', "user"),
                    "metaData": request_body.get('deployedModel', {}).get('dedicatedResources',None),
                    "Id": modeldeploy.get("name", None).split("/")[5],
                    "SourceID": model_id, 
                    "sourceName": request_body.get('deployedModel', {}).get('displayName',None) ,
                    "adapterId": connection['adapter_id'],
                    "status": modeldeploy.get("status", 'Deployed'),
                    "likes": modeldeploy.get("likes", None),
                    "modifiedOn": modeldeploy.get("metadata", {}).get("genericMetadata", {}).get("updateTime", None),
                    "artifacts": request_body.get('modeldeploy', {}).get('artifactUri', None),
                    "deployment": f"{model_id} model  was deployed at endpoint: {endpoint_id}"
            }
            response_format['rawPayload'] = json.dumps(response_format)
            logger.info("Model Deployment Created Successfully")   
            return response_format,200
        else:
            return f"Request failed with get_dataset API with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500

def projects_endpoints_undeploy_models_create(adapter_instance, project, isCached, isInstance, connection, endpoint_id, request_body):
    logger.info(f"Inside projects_endpoints {str(adapter_instance)}, {str(connection)}")
    aiplatform.init(project=connection['project_id'])
    endpoint = aiplatform.Endpoint(endpoint_name=endpoint_id)
    deployed_models = endpoint.list_models()
    rawpayload = ""
    response_format = None
    try:
        for deployed_model in deployed_models:
            if deployed_model.id == request_body.get("deployedModelId") and deployed_model.display_name == request_body.get("displayName"):
                model_id = request_body.get("deployedModelId")
                response = endpoint.undeploy(deployed_model_id=model_id)
                rawpayload += f"Undeploying Endpoint model: {(endpoint.resource_name).split('/')[5]}"
                logger.info(f"rawpayload:{rawpayload}")
                current_time = time.gmtime()
                times = datetime.strftime(datetime.fromtimestamp(time.mktime(current_time)), "%Y-%m-%dT%H:%M:%S.%fZ")
                response_format = {
                   "container": request_body.get('modeldeploy', {}).get('containerSpec', None),
                   "adapter": adapter_instance,
                   "rawPayload": response_format ,
                  "description": request_body.get("description", 'Model Undeploy Operation'),
                  "organization": project,
                   "type": request_body.get("metadata", {}).get('@type', None),
                   "createdOn": times,
                   "syncDate": times,
                  "sourceOrg": request_body.get('sourceOrg', None),
                    "createdBy": request_body.get('createdBy', "user"),
                    "metaData": rawpayload,
                    "Id":model_id ,
                    "SourceID": endpoint_id, 
                    "sourceName": request_body.get('displayName',None) ,
                    "adapterId": connection['adapter_id'],
                    "status": request_body.get("status", 'UnDeployed'),
                    "likes": request_body.get("likes", None),
                    "modifiedOn": times,
                    "artifacts": request_body.get('modeldeploy', {}).get('artifactUri', None),
                    "deployment": f"{model_id} model  was undeployed at endpoint: {endpoint_id}"
                }
                logger.info("Model Un-Deployed Successfully")
                logger.info(f"response_format:{response_format}") 
                return response_format,200
            else:
                return f"Request failed with get_dataset API with status code:{response.status_code}", response.status_code

    except json.decoder.JSONDecodeError as e:
        logger.error(f"Error: {e}")
        return f"Error: JSON Decode Error", 500

    except Exception as e:
        logger.error(f"Error: {e}")
        return f"Error: {e}", 500


def training_automl_simplified_create(adapter_instance, project, isCached, isInstance, connection, request_body):
    logger.info(f"Inside projects_endpoints {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/trainingPipelines"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers, json=request_body)
    logger.info(f"printing response: {response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            training=json.loads(response.text)
            logger.info("entering into the response format code..")
            response_format = {
                  "container": training.get("container", None) ,
                "adapter": adapter_instance,
                "rawPayload": training,
                "description": training.get("description", 'training Create Operation'),
                "organization": project,
                  "type": training.get('type',None),
                "createdOn": training.get("createTime", None),
                "syncDate": training.get("createTime", None),
                  "sourceOrg": training.get('sourceOrg', None),
                "createdBy": training.get('createdBy', "user"),
                "metaData": {
                            "inputConfig": training.get("inputConfig", None),
                             "trainingTaskDefinition": training.get("trainingTaskDefinition", None),
                             "trainingTaskInputs": training.get("trainingTaskInputs", None),
							 "modelToUpload": training.get("modelToUpload", None),
                            },
               "Id": training.get('name',None).split('/')[5],
               "SourceID": f"dataset_id:{training.get('inputDataConfig',{}).get('datasetId')},model_id:{request_body.get('modelToUpload',{}).get('name').split('/')[5]}",
               "sourceName": training.get('displayName', None),
               "adapterId": connection['adapter_id'],
               "status": training.get("state", None),
               "likes": request_body.get("modelToUpload",{}).get("versionId"),
               "modifiedOn": training.get("updateTime", None),
                 "artifacts": training.get("artifacts",None) ,
                 "deployment": training.get("deployment",None)
            }
            response_format['rawPayload'] = json.dumps(response_format)
            logger.info("Auto ML Created Successfully")   
            return response_format,200
        else:
            return f"Request failed with get_dataset API with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500
    


def projects_endpoints_infer_create(adapter_instance, project, isCached, isInstance, connection, endpoint_id, request_body):
    logger.info(f"Inside projects_endpoints {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/endpoints/{endpoint_id}:predict"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers, json=request_body)
    logger.info(f"printing response: {response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            infer= json.loads(response.text)
            current_time = time.gmtime()
            times = datetime.strftime(datetime.fromtimestamp(time.mktime(current_time)), "%Y-%m-%dT%H:%M:%S.%fZ")
            logger.info("entering into the response format code..")
            response_format = {
            "container": infer.get("container", None) ,
            "adapter": adapter_instance,
            "rawPayload": infer,
            "description": infer.get("description", 'Online Inference Create Operation'),
            "organization": project,
            "type": infer.get('type',None),
            "createdOn": times,
            "sourceOrg": infer.get('sourceOrg', None),
            "createdBy": infer.get('createdBy', "user"),
            "metaData": f"predictions :{infer.get('predictions', None)},Data : {request_body}",        
            "Id": infer.get('deployedModelId',None),
            "SourceID": f"endpoint_id:{endpoint_id},model_id:{infer.get('model',None).split('/')[5]}",
            "sourceName": infer.get('modelDisplayName', None),
            "adapterId": connection['adapter_id'],
            "status": infer.get("state", 'Prediction Done'),
            "likes": infer.get("modelVersionId",None),
            "modifiedOn":times,
            "syncDate": times,
            "artifacts": infer.get("artifacts", None) ,
            "deployment":f"deployed at Endpoint_id: {endpoint_id}"
            }
            response_format['rawPayload'] = json.dumps(response_format)
            logger.info("online prediction Created Successfully")   
            return response_format,200
        else:
            return f"Request failed with get_dataset API with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500

def projects_endpoints_explain_create(adapter_instance, project, isCached, isInstance, connection, endpoint_id, request_body):
    logger.info(f"Inside projects_endpoints {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/endpoints/{endpoint_id}:explain"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers, json=request_body)
    logger.info(f"printing response: {response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            endpoint=json.loads(response.text)
            current_time = time.gmtime()
            logger.info("entering into the response format code..")
            response_format = {
            "container": endpoint.get("container", None) ,
            "adapter": adapter_instance,
            "rawPayload": endpoint,
            "description": endpoint.get("description", 'Endpoint Explination Operation'),
            "organization": project,
            "type": endpoint.get('type',None),
            "createdOn": datetime.strftime(datetime.fromtimestamp(time.mktime(current_time)), "%Y-%m-%dT%H:%M:%S.%fZ"),
            "createdBy": endpoint.get('createdBy', "user"),
            "metaData": request_body,       
            "Id": endpoint_id,
            "SourceID": endpoint.get('deployedModelId',None),
            "sourceName": endpoint.get('modelDisplayName', None),
            "adapterId": connection['adapter_id'],
            "status": endpoint.get("state", 'Endpoint Explained'),
            "syncDate":  datetime.strftime(datetime.fromtimestamp(time.mktime(current_time)), "%Y-%m-%dT%H:%M:%S.%fZ"),
            "likes": endpoint.get("modelVersionId",'1'),
            "modifiedOn":datetime.strftime(datetime.fromtimestamp(time.mktime(current_time)), "%Y-%m-%dT%H:%M:%S.%fZ"),
            "artifacts": endpoint.get("artifacts", None) ,
            "deployment":f"deployed at Endpoint_id: {endpoint_id}"
            }
            response_format['rawPayload'] = json.dumps(response_format)
            logger.info("Endpoint Explained Successfully")   
            return response_format,200
        else:
            return f"Request failed with get_dataset API with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500

            
    

def projects_models_export_create(adapter_instance, project, isCached, isInstance, connection, model_id, request_body):
    logger.info(f"Inside projects_endpoints {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/models/{model_id}"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    logger.info(f"printing response: {response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            models = json.loads(response.text)
            url2 = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/models/{model_id}:export"
            response2 = requests.post(url2, headers=headers, json=request_body)
            if models.get("trainingPipeline"):
                training_id = models['trainingPipeline'].split('/')[-1]
                url1 = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/trainingPipelines/{training_id}"
                headers1 = {
                 "Authorization": f"Bearer {token}",
                 "Content-Type": "application/json"
                }
                response1 = requests.get(url1, headers=headers1)
                dataset_details= json.loads(response1.text)
                dataset_id=dataset_details['inputDataConfig']['datasetId']
                logger.info("entering into the response format code..")
                response_format = {
                  "container": models.get('predictSchemata', None),
                  "adapter": adapter_instance,
                  "rawPayload": models,
                  "description": models.get("description",'Trained Model Export Model'),
                  "organization": project,
                  "export_Details": response2.text,
                  "type": models.get('modelSourceInfo', {}).get('sourceType', None),
                  "createdOn": models.get("versionCreateTime", None),
                  "syncDate":models.get("versionCreateTime", None),
                  "sourceOrg": models.get('sourceOrg', None),
                  "createdBy": models.get('createdBy', 'User'),
                  "metaData": models.get('explanationSpec', {}).get('metadata', None),
                  "Id": models.get("name", None).split("/")[5],
                  "SourceID": dataset_id,
                  "sourceName": models.get("displayName", None),
                  "adapterId": connection['adapter_id'],
                  "status": models.get("status", 'Exported'),
                  "likes": models.get("versionId", None),
                  "modifiedOn": models.get("versionUpdateTime",None),
                  "artifacts": models.get("metadataSchemaUri", None),
                  "deployment": models.get("supportedDeploymentResourcesTypes", None)
                }
            else:
                response_format = {
                    "container": models.get('containerSpec', None),
                 "adapter": adapter_instance,
                 "rawPayload": response2.text,
                 "description": models.get("description",'Non trained Model Export'),
                 "organization": project,
                 "export_Details": request_body,
                 "type": models.get('modelSourceInfo', {}).get('sourceType', None),
                 "createdOn": models.get("createTime", None),
                 "sourceOrg": models.get('sourceOrg', None),
                 "createdBy": models.get('createdBy', 'User'),
                "metaData":  {
                  "supportedDeploymentResourcesTypes": models.get("supportedDeploymentResourcesTypes", None),
                  "supportedInputStorageFormats": models.get("supportedInputStorageFormats", None),
                  "supportedOutputStorageFormats": models.get("supportedOutputStorageFormats", None)
                 },
                 "Id": models.get("name", None).split("/")[5],
                 "SourceID": None,
                 "sourceName": models.get("displayName", None),
                 "adapterId": connection['adapter_id'],
                 "status": models.get("status", 'Exported'),
                 "likes": models.get("versionId", None),
                 "modifiedOn": models.get("updateTime",None),
                "syncDate":models.get("createTime", None),
                 "artifacts": models.get("artifactUri", None),
                 "deployment": models.get("supportedDeploymentResourcesTypes", None)
                }
            response_format['rawPayload'] = json.dumps(json.dumps(response_format, default=str))
            logger.info("Model Exported Successfully")   
            return response_format, 200
        else:
            return f"Request failed with get_dataset API with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500


    
    
def projects_datasets_export_create(adapter_instance, project, isCached, isInstance, connection, dataset_id, request_body):
    logger.info(f"Inside projects_endpoints {str(adapter_instance)}, {str(connection)}")
    logger.info("get access token...")
    logger.info("calling get access token function ...")
    token = get_access_token(connection)
    logger.info("Access token generated.")
    url = f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/datasets/{dataset_id}"
    logger.info(f"printing url:{url}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    logger.info(f"printing response: {response.text}")
    try:
        if response.status_code == 200:
            logger.info("entering into  if block after checking the statuscode =200....")
            url1 =  f"https://{connection['regionName']}-aiplatform.googleapis.com/v1/projects/{connection['project_id']}/locations/{connection['regionName']}/datasets/{dataset_id}:export"
            response1 = requests.post(url, headers=headers, json=request_body)
            dataset = json.loads(response.text)
            logger.info("entering into the response format code..")
            response_format = {
                "container": dataset.get('containerSpec', None),
                "adapter": adapter_instance,
                "rawPayload": request_body,
                "description": dataset.get("description", 'Export Dataset Details Operation'),
                "organization": project,
                "type": dataset.get('etag', None),
                "createdOn": dataset.get("createTime", None),
                "sourceOrg": dataset.get('sourceOrg',None),
                "createdBy": dataset.get('createdBy', "user"),
                "metaData": dataset.get('metadataSchemaUri',None),
                "Id": dataset.get("name", 'None').split("/")[5],
                "SourceID": dataset.get("SourceID", None),
                "sourceName": dataset.get("displayName", None),
                "adapterId": connection['adapter_id'],
                "status": dataset.get("status", 'Created'),
                 "syncDate": dataset.get("createTime", None),
                "likes": dataset.get("likes", 1),
                "modifiedOn": dataset.get("updateTime",None),
                "artifacts": dataset.get("metadataArtifact", None).split("/")[-1],
                "deployment": dataset.get("deployment", None)
            }
            response_format['rawPayload'] = json.dumps(json.dumps(response_format, default=str))
            logger.info("Dataset Exported Successfully")   
            return response_format, 200
        else:
             return f"Request failed with get_dataset API with status code:{response.status_code}", response.status_code
    except json.decoder.JSONDecodeError:
        logger.error("Error: JSON Decode Error")
        return "Error: JSON Decode Error", 500
    except Exception as e:
        logger.error(f"an error occured:{str(e)}")
        return str(e), 500



def upload_and_create_dataset(project_id, dataset_name, dataset_description, bucket_name, file):
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file.filename)
    blob.upload_from_string(
        file.read(),
        content_type=file.content_type,
    )
    gcs_file_path = f"gs://{bucket_name}/{file.filename}"

    aiplatform.init(project=project_id)
    dataset = aiplatform.TabularDataset.create(
        display_name=dataset_name,
        gcs_source=gcs_file_path,
        project=project_id,
    )
    print(f"Dataset {dataset.resource_name} created successfully")
    return 'File uploaded successfully and dataset created!'
    


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
