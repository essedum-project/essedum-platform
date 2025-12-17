import json 
import os
import pandas as pd
import logging
import shutil
import sys
import subprocess
import tempfile
import time
from itertools import groupby
from urllib.parse import urlparse

# STEP 2: Load environment and config
from dotenv import load_dotenv
load_dotenv()

from utils import *

# STEP 3: CLEAR PROXY **BEFORE** IMPORTING REQUESTS - THIS IS CRITICAL!
os.environ.pop('http_proxy', None)
os.environ.pop('https_proxy', None)
os.environ.pop('HTTP_PROXY', None)
os.environ.pop('HTTPS_PROXY', None)
os.environ.pop('NO_PROXY', None)
os.environ.pop('no_proxy', None)

# STEP 4: NOW import requests (with clean environment - no proxy)
import requests

# STEP 5: Import all Azure ML libraries
from azureml.core.compute import AmlCompute, ComputeTarget
from azureml.core.environment import CondaDependencies
from azureml.core.authentication import ServicePrincipalAuthentication
from azureml.pipeline.steps import AutoMLStep, PythonScriptStep
from azureml.train.automl import AutoMLConfig
from azureml.pipeline.core import Pipeline, PipelineData, TrainingOutput
import azureml.core
from azureml.core import Dataset, Experiment, RunConfiguration, Workspace, Environment, Model
from azure.identity import ClientSecretCredential
from azure.ai.ml.entities import BatchEndpoint, ModelBatchDeployment, ModelBatchDeploymentSettings, PipelineComponentBatchDeployment, Model, AmlCompute, Data, BatchRetrySettings, CodeConfiguration, Environment, Data
from azure.ai.ml.constants import AssetTypes, BatchDeploymentOutputAction
from azureml.train.automl.run import AutoMLRun
from azure.core.pipeline.transport import RequestsTransport
from requests import Session
from azure.ai.ml import MLClient, Input, load_component

# STEP 6: Create logger
logger = logging.getLogger(__name__)  
logger.setLevel(logging.INFO)
file_handler = logging.FileHandler('logfile.log')
formatter = logging.Formatter('%(asctime)s : %(levelname)s : %(name)s : %(message)s')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

logger.info("Proxy disabled - all proxy environment variables cleared before requests module loaded")

# def token_generate():
#   url = f"https://login.microsoftonline.com/{os.environ.get('tenant_id')}/oauth2/token"

#   payload = f"grant_type=client_credentials&client_id={os.environ.get('client_id')}&client_secret={os.environ.get('client_secret')}&resource={os.environ.get('resource')}"
#   headers = {
#   'Content-Type': 'application/x-www-form-urlencoded',
#   'Cookie': 'fpc=AnhFZJgHdUZBh0ZeIH62qTPRTIEqAQAAAENpn9wOAAAA; stsservicecookie=estsfd; x-ms-gateway-slice=estsfd'
#   }

#   response = requests.request("POST", url, headers=headers, data=payload)
#   return response.text

def token_generate():
  try:
    logger.info(f"enviromenttest tenant_id :  {os.environ.get('tenant_id')}")

    logger.info(f"enviromenttest tenant_id :  {os.environ.get('client_secret')}")


    url = f"https://login.microsoftonline.com/{os.environ.get('tenant_id')}/oauth2/token"
    
    payload = f"grant_type=client_credentials&client_id={os.environ.get('client_id')}&client_secret={os.environ.get('client_secret')}&resource={os.environ.get('resource')}"
    headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': 'fpc=AnhFZJgHdUZBh0ZeIH62qTPRTIEqAQAAAENpn9wOAAAA; stsservicecookie=estsfd; x-ms-gateway-slice=estsfd'
    }
    
    logger.info("Generating Azure AD access token...")
    response = requests.request("POST", url, headers=headers, data=payload, verify=False, proxies={'http': None, 'https': None})
    
    if response.status_code == 200:
      logger.info("Access token generated successfully")
      return response.text
    else:
      logger.error(f"Token generation failed with status code: {response.status_code}")
      logger.error(f"Response: {response.text[:200]}")
      return response.text
      
  except Exception as e:
    logger.error(f"Token generation error: {str(e)}", exc_info=True)
  


def responseFormat(adapter_instance,project,values):
  if isinstance(values, list):
    result = []
    for value in values:
      system_data = value.get("systemData") or {}
      properties = value.get("properties") or {}
      
      result.append({
        "sourceId": value.get("name"),
        "container": value.get("id"),
        "adapter": adapter_instance,
        "rawPayload": value,
        "syncDate": system_data.get("createdAt"),
        "description": properties.get("description"),
        "organisation": project,
        "type": value.get("type"),
        "createdOn": system_data.get("createdAt"),
        "sourceOrg": adapter_instance,
        "createdBy": system_data.get("createdBy"),
        "name": value.get("id"),
        "modifiedBy": system_data.get("createdByType"),
        "id": value.get("id"),
        "sourceName": value.get("name"),
        "adapterId": None,
        "status": "registered",
        "likes": None,
        "artifacts": value.get("id"),
        "deployment": None
      })
    return result
  else:
    system_data = values.get("systemData") or {}
    properties = values.get("properties") or {}
    
    return {
      "sourceId": values.get("name"),
      "container": values.get("id"),
      "adapter": adapter_instance,
      "rawPayload": values,
      "syncDate": system_data.get("createdAt"),
      "description": properties.get("description"),
      "organisation": project,
      "type": values.get("type"),
      "createdOn": system_data.get("createdAt"),
      "sourceOrg": adapter_instance,
      "createdBy": system_data.get("createdBy"),
      "name": values.get("id"),
      "modifiedBy": system_data.get("createdByType"),
      "id": values.get("id"),
      "sourceName": values.get("name"),
      "adapterId": None,
      "status": "registered",
      "likes": None,
      "artifacts": values.get("id"),
      "deployment": None
    }

def projects_datasets_create(adapter_instance, project, isCached, isInstance, connections, payload):
  logger.info("Starting dataset creation")
  
  try:
    connect = token_generate()
    value = json.loads(connect)
    Authorization = value["access_token"]
    
    dataset_name = payload.get("name")
    api_version = connections.get("datasets_api-version", "2023-04-01")
    subscriptionId = connections.get('subscriptionId')
    resourceGroupName = connections.get('resourceGroupName')
    workspaceName = connections.get('workspaceName')
    file_url = payload.get("path")  # Original file URL
    description = payload.get("description", "")
    version = payload.get("version", "1")
    
    logger.info(f"Creating MLTable dataset: {dataset_name} from {file_url}")
    
    ml_client = ConnectClient()
    
    # Extract filename from URL
    import os
    from urllib.parse import urlparse
    
    parsed_url = urlparse(file_url)
    filename = os.path.basename(parsed_url.path)
    logger.info(f"Extracted filename: {filename}")
    
    # Create temporary folder for MLTable
    import tempfile
    import shutil
    
    temp_dir = tempfile.mkdtemp()
    mltable_folder = os.path.join(temp_dir, dataset_name)
    os.makedirs(mltable_folder, exist_ok=True)
    
    logger.info(f"Created temporary MLTable folder: {mltable_folder}")
    
    # Download the CSV file using Azure Storage SDK with authentication
    csv_path = os.path.join(mltable_folder, filename)
    
    try:
      from azure.storage.blob import BlobServiceClient
      from azure.identity import DefaultAzureCredential
      
      logger.info(f"Downloading file from: {file_url}")
      
      # Parse storage account and container from URL
      # URL format: https://{account}.blob.core.windows.net/{container}/{blob}
      storage_account = parsed_url.netloc.split('.')[0]
      path_parts = parsed_url.path.strip('/').split('/', 1)
      container_name = path_parts[0]
      blob_name = path_parts[1] if len(path_parts) > 1 else filename
      
      logger.info(f"Storage account: {storage_account}, Container: {container_name}, Blob: {blob_name}")
      
      # Create blob service client with DefaultAzureCredential (uses service principal)
      account_url = f"https://{storage_account}.blob.core.windows.net"
      
      # Use service principal credentials
      from azure.identity import ClientSecretCredential
      
      credential = ClientSecretCredential(
        tenant_id=os.environ.get('tenant_id'),
        client_id=os.environ.get('service_principal_id'),
        client_secret=os.environ.get('service_principal_password')
      )
      
      blob_service_client = BlobServiceClient(
        account_url=account_url,
        credential=credential
      )
      
      # Get blob client
      blob_client = blob_service_client.get_blob_client(
        container=container_name,
        blob=blob_name
      )
      
      # Download blob
      with open(csv_path, 'wb') as download_file:
        download_stream = blob_client.download_blob()
        download_file.write(download_stream.readall())
      
      logger.info(f"File downloaded successfully to: {csv_path}")
      
    except Exception as download_error:
      logger.error(f"Failed to download file: {str(download_error)}")
      shutil.rmtree(temp_dir)
      return {"error": f"Failed to download file: {str(download_error)}"}, 400
    
    # Create MLTable YAML file - use relative path
    mltable_yaml_path = os.path.join(mltable_folder, "MLTable")
    
    # MLTable YAML content - using relative path to the CSV file
    mltable_yaml_content = f"""paths:
  - file: ./{filename}
transformations:
  - read_delimited:
      delimiter: ','
      encoding: 'utf8'
      header: all_files_same_headers
"""
    
    with open(mltable_yaml_path, 'w') as f:
      f.write(mltable_yaml_content)
    
    logger.info(f"Created MLTable YAML with relative path: ./{filename}")
    
    # Create Data asset as MLTABLE type
    my_data = Data(
      path=mltable_folder,  # Points to folder containing both MLTable and CSV
      type=AssetTypes.MLTABLE,
      description=description,
      name=dataset_name,
      version=version
    )
    
    logger.info("Uploading MLTable to Azure ML...")
    created_data = ml_client.data.create_or_update(my_data)
    logger.info(f"MLTable dataset created: {created_data.name}, version: {created_data.version}")
    logger.info(f"Dataset path: {created_data.path}")
    
    # Cleanup temporary folder
    try:
      shutil.rmtree(temp_dir)
      logger.info("Cleaned up temporary folder")
    except Exception as cleanup_error:
      logger.warning(f"Cleanup warning: {str(cleanup_error)}")
    
    # Get dataset details via REST API
    url = f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/data/{dataset_name}/versions/{version}?api-version={api_version}"
    
    headers = {
      "Authorization": "Bearer " + str(Authorization)
    }
    
    response = requests.request("GET", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
    
    if response.status_code == 200:
      values = json.loads(response.text)
      values = responseFormat(adapter_instance, project, values)
      return values, response.status_code
    else:
      # Return success response even if REST API fails
      return {
        "name": dataset_name,
        "version": version,
        "type": "mltable",
        "datastore_path": created_data.path,
        "status": "created",
        "message": "MLTable dataset created successfully"
      }, 201
    
  except Exception as e:
    logger.error(f"Dataset creation failed: {str(e)}", exc_info=True)
    return {"error": str(e)}, 500






# def projects_datasets_list_list(adapter_instance, project, isCached, isInstance, connections):
#   connect=token_generate()
#   value=json.loads(connect)
#   Authorization=value["access_token"]
#   api_version=connections.get("datasets_api-version",None)
#   subscriptionId=connections.get('subscriptionId',None)
#   resourceGroupName=connections.get('resourceGroupName',None)
#   workspaceName=connections.get('workspaceName',None)
#   url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/data?api-version={api_version}"
#   headers = {
#   "Authorization" : "Bearer "+str(Authorization)
#   }
#   response = requests.request("GET", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
#   try:
#     if response.status_code == 200 :
#       values=json.loads(response.text)
#       values=responseFormat(adapter_instance,project,values)
#       return values,response.status_code
#     elif response.status_code == 400:
#       return "Error: Bad Parameters(HTTP 400)"
#     elif response.status_code ==500:
#       return "Internal Server Error(HTTP 500)"
#     else:
#       return f"Request failed with status code:{response.status_code}"
        
#   except Exception as e:
#     logger.error(f"an error occured:{str(e)}")  
#     return e


def projects_datasets_list_list(adapter_instance, project, isCached, isInstance, connections):
  logger.info(f"Starting projects_datasets_list_list - adapter: {adapter_instance}, project: {project}")
  
  connect=token_generate()
  logger.info("Token generated successfully")
  
  value=json.loads(connect)
  logger.info("Token parsed to JSON")
  
  Authorization=value["access_token"]
  logger.info("Access token extracted")
  
  api_version=connections.get("datasets_api-version",None)
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  logger.info(f"Connection params - subscriptionId: {subscriptionId}, resourceGroup: {resourceGroupName}, workspace: {workspaceName}, api_version: {api_version}")
  
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/data?api-version={api_version}"
  logger.info(f"Request URL: {url}")
  
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }
  logger.info("Headers prepared")
  
  logger.info("Making GET request to Azure Management API...")
  response = requests.request("GET", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
  logger.info(f"Response received - Status code: {response.status_code}")
  
  try:
    if response.status_code == 200 :
      logger.info("Response status 200 - Success")
      values=json.loads(response.text)
      logger.info(f"Response parsed - Found {len(values.get('value', [])) if isinstance(values, dict) else 'N/A'} datasets")
      values=responseFormat(adapter_instance,project,values)
      logger.info("Response formatted successfully")
      return values,response.status_code
    elif response.status_code == 400:
      logger.error("Response status 400 - Bad Parameters")
      return "Error: Bad Parameters(HTTP 400)"
    elif response.status_code ==500:
      logger.error("Response status 500 - Internal Server Error")
      return "Internal Server Error(HTTP 500)"
    else:
      logger.error(f"Unexpected response status code: {response.status_code}")
      logger.error(f"Response body: {response.text[:500]}")
      return f"Request failed with status code:{response.status_code}"
        
  except Exception as e:
    logger.error(f"Exception occurred in projects_datasets_list_list: {str(e)}", exc_info=True)  
    return e
              
    

def projects_datasets_get(adapter_instance, project, isCached, isInstance, connections,dataset_name):
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  api_version=connections.get("datasets_api-version",None)
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/data/{dataset_name}?api-version={api_version}"
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }
  response = requests.request("GET", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
  try:
    if response.status_code == 200 :
      values=json.loads(response.text)
      values=responseFormat(adapter_instance,project,values)
      return values,response.status_code
    elif response.status_code == 400:
      return "Error: Bad Parameters(HTTP 400)"
    elif response.status_code ==500:
      return "Internal Server Error(HTTP 500)"
    else:
      return f"Request failed with status code:{response.status_code}"
        
  except Exception as e:
    logger.error(f"an error occured:{str(e)}")  
    return e

def projects_datasets_delete(adapter_instance, project, isCached, isInstance, connections, dataset_name):
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  api_version=connections.get("datasets_api-version",None)
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  ml_client=ConnectClient() 
  ml_client.data.archive(name=dataset_name)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/data/{dataset_name}?api-version={api_version}"
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }
  response = requests.request("GET", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
  try:
    if response.status_code == 200 or 202:
      logger.info("Dataset Archieved")
      return response.text,response.status_code
    elif response.status_code == 400:
      return "Error: Bad Parameters(HTTP 400)"
    elif response.status_code ==500:
      return "Internal Server Error(HTTP 500)"
    else:
      return f"Request failed with status code:{response.status_code}"
        
  except Exception as e:
    logger.error(f"an error occured:{str(e)}")  
    return e  
                               
def projects_models_list(adapter_instance, project, isCached, isInstance, connections):
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  api_version=connections.get('models_api-version',None)
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/models?api-version={api_version}"
  headers = {
  "Authorization" : "Bearer "+str(Authorization) 
  }
  response = requests.request("GET", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
  try:
    if response.status_code == 200:
      values=json.loads(response.text)
      values=responseFormat(adapter_instance,project,values)
      return values,response.status_code
    elif response.status_code == 400:
      return "Error: Bad Parameters(HTTP 400)"
    elif response.status_code ==500:
      return "Internal Server Error(HTTP 500)"
    else:
      return f"Request failed with status code:{response.status_code}"
        
  except Exception as e:
    logger.error(f"an error occured:{str(e)}")  
    return e


def projects_models_register_create(adapter_instance, project, isCached, isInstance, connections, payload):
  logger.info("Starting projects_models_register_create")
  
  try:
    experiment_name = payload.get("experiment_name")
    run_id = payload.get("runId")
    model_name = payload.get("model_name")
    
    # Validate required parameters
    if not all([experiment_name, run_id, model_name]):
      missing = []
      if not experiment_name: missing.append('experiment_name')
      if not run_id: missing.append('runId')
      if not model_name: missing.append('model_name')
      logger.error(f"Missing required parameters: {', '.join(missing)}")
      return {"error": f"Missing required parameters: {', '.join(missing)}"}, 400
    
    # Use ML Client for better compatibility
    ml_client = ConnectClient()
    logger.info("ML Client connected successfully")
    
    # Get the run/job
    try:
      job = ml_client.jobs.get(run_id)
      logger.info(f"Job retrieved: {job.name}, Status: {job.status}")
    except Exception as job_error:
      logger.error(f"Failed to get job '{run_id}': {str(job_error)}")
      return {"error": f"Job '{run_id}' not found. Please verify the run ID."}, 404
    
    # Check if job is completed
    if job.status != "Completed":
      logger.warning(f"Job status is '{job.status}', not 'Completed'.")
      return {"error": f"Job '{run_id}' is not completed yet. Current status: {job.status}. Please wait for the job to complete."}, 400
    
    # For AutoML jobs, register model directly from parent run outputs
    from azure.ai.ml.entities import Model as MLModel
    from azure.ai.ml.constants import AssetTypes
    
    # SIMPLIFIED APPROACH: Skip child job enumeration (proxy blocks it)
    # Register directly from parent run's best_model output
    try:
      logger.info("=" * 80)
      logger.info("REGISTERING MODEL WITHOUT LISTING CHILD JOBS (PROXY BYPASS)")
      logger.info("=" * 80)
      
      # Define model paths to try (without needing child job list)
      model_paths_to_try = [
        {
          'path': f"azureml://jobs/{run_id}/outputs/best_model/",
          'description': 'Parent run best_model output (PRIMARY PATH for AutoML)',
          'priority': 1
        },
        {
          'path': f"azureml://jobs/{run_id}/outputs/mlflow_model_folder/",
          'description': 'Parent run mlflow_model_folder',
          'priority': 2
        },
        {
          'path': f"azureml://jobs/{run_id}/outputs/trained_model/",
          'description': 'Parent run trained_model',
          'priority': 3
        },
        {
          'path': f"azureml://jobs/{run_id}/outputs/model_output/",
          'description': 'Parent run model_output',
          'priority': 4
        }
      ]
      
      registered_model = None
      last_error = None
      successful_path = None
      
      # Try each path in priority order
      logger.info(f"Will attempt {len(model_paths_to_try)} different model paths from parent run...")
      for path_info in model_paths_to_try:
        model_path = path_info['path']
        try:
          logger.info(f"[Priority {path_info['priority']}] Trying: {model_path}")
          logger.info(f"Description: {path_info['description']}")
          
          model = MLModel(
            path=model_path,
            name=model_name,
            description=f"Model registered from AutoML experiment {experiment_name}, run {run_id}",
            type=AssetTypes.MLFLOW_MODEL,
            tags={
              "experiment_name": experiment_name,
              "parent_run_id": run_id,
              "framework": "AutoML",
              "registration_method": "direct_parent_output"
            }
          )
          
          logger.info(f"Attempting to register model from: {model_path}")
          registered_model = ml_client.models.create_or_update(model)
          successful_path = model_path
          logger.info(f"✓ SUCCESS! Model registered with path: {model_path}")
          logger.info(f"Model: {registered_model.name}, Version: {registered_model.version}")
          break
          
        except Exception as path_error:
          last_error = str(path_error)
          logger.warning(f"✗ FAILED with path {model_path}")
          logger.warning(f"Error (first 300 chars): {last_error[:300]}")
          continue
      
      # If all paths failed, provide detailed error
      if registered_model is None:
        logger.error("=" * 80)
        logger.error("ALL MODEL REGISTRATION PATHS FAILED")
        logger.error("=" * 80)
        logger.error(f"Parent job name: {job.name}")
        logger.error(f"Parent job type: {job.type if hasattr(job, 'type') else 'N/A'}")
        logger.error(f"Total paths tried: {len(model_paths_to_try)}")
        logger.error(f"Last error: {last_error}")
        logger.error("=" * 80)
        
        return {
          "error": "Could not find model artifacts in parent run outputs.",
          "run_id": run_id,
          "paths_tried": [p['path'] for p in model_paths_to_try],
          "suggestion": f"Please check the job '{run_id}' in Azure ML Studio under 'Outputs + logs' tab to verify model outputs exist. For AutoML runs, the best model should be in 'outputs/best_model/'",
          "last_error": last_error[:500] if last_error else "No error details available"
        }, 404
      
      # SUCCESS! Get model details via REST API
      connect = token_generate()
      value = json.loads(connect)
      Authorization = value["access_token"]
      subscriptionId = connections.get('subscriptionId', None)
      resourceGroupName = connections.get('resourceGroupName', None)
      workspaceName = connections.get('workspaceName', None)
      api_version = connections.get("models_api-version", None)
      
      url = f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/models/{model_name}/versions/{registered_model.version}?api-version={api_version}"
      headers = {
        "Authorization": "Bearer " + str(Authorization)
      }
      response = requests.request("GET", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
      
      if response.status_code == 200:
        values = json.loads(response.text)
        values = responseFormat(adapter_instance, project, values)
        values["model_name"] = model_name
        values["version"] = registered_model.version
        values["parent_run_id"] = run_id
        values["model_path_used"] = successful_path
        logger.info(f"✓ Model registration completed successfully!")
        return values, response.status_code
      else:
        logger.warning(f"Could not retrieve model details via REST API: {response.status_code}")
        return {
          "model_name": model_name,
          "version": registered_model.version,
          "parent_run_id": run_id,
          "model_path_used": successful_path,
          "status": "registered",
          "message": "Model registered successfully"
        }, 201
        
    except Exception as model_error:
      logger.error(f"Failed to register model: {str(model_error)}", exc_info=True)
      return {"error": f"Failed to register model: {str(model_error)}"}, 500
    
  except Exception as e:
    logger.error(f"Model registration failed: {str(e)}", exc_info=True)
    return {"error": str(e)}, 500


          
def projects_models_get(adapter_instance, project, isCached, isInstance, connections,model_name):
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  api_version=connections.get('models_api-version',None)
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/models/{model_name}?api-version={api_version}"        
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }
  response = requests.request("GET", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
  try:
    if response.status_code == 200:
      values=json.loads(response.text)
      values=responseFormat(adapter_instance,project,values)
      return values,response.status_code
    elif response.status_code == 400:
      return "Error: Bad Parameters(HTTP 400)"
    elif response.status_code ==500:
      return "Internal Server Error(HTTP 500)"
    else:
      return f"Request failed with status code:{response.status_code}"
        
  except Exception as e:
    logger.error(f"an error occured:{str(e)}")  
    return e

def projects_models_delete(adapter_instance, project, isCached, isInstance, connections,model_name):
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  api_version=connections.get('models_api-version',None)
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/models/{model_name}?api-version={api_version}"    
  
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }
  response = requests.request("DELETE", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
  try:
    if response.status_code == 200 or 204:
      return response.text,response.status_code
    elif response.status_code == 400:
      return "Error: Bad Parameters(HTTP 400)"
    elif response.status_code ==500:
      return "Internal Server Error(HTTP 500)"
    else:
      return f"Request failed with status code:{response.status_code}"
        
  except Exception as e:
    logger.error(f"an error occured:{str(e)}")  
    return e
        
def projects_endpoints_list_list(adapter_instance, project, isCached, isInstance, connections):
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  api_version=connections.get("endpoints_api-version",None)
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  
  # Changed from batchEndpoints to onlineEndpoints for real-time endpoints
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/onlineEndpoints?api-version={api_version}"
  
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }
  response = requests.request("GET", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
  try:
    if response.status_code == 200 :
      values=json.loads(response.text)
      values=responseFormat(adapter_instance,project,values)
      return values,response.status_code
    elif response.status_code == 400:
      return "Error: Bad Parameters(HTTP 400)"
    elif response.status_code ==500:
      return "Internal Server Error(HTTP 500)"
    else:
      return f"Request failed with status code:{response.status_code}"
        
  except Exception as e:
    logger.error(f"an error occured:{str(e)}")  
    return e
 

def projects_endpoints_create(adapter_instance, project, isCached, isInstance, connections, payload):
  logger.info("Starting online endpoint creation")
  
  try:
    ml_client = ConnectClient()
    
    endpoint_name = payload.get("name")
    description = payload.get("description", "Online endpoint for real-time inference")
    auth_mode = payload.get("auth_mode", "key")  # "key" or "aml_token"
    
    logger.info(f"Creating online endpoint: {endpoint_name}")
    
    # Validate parameters
    if not endpoint_name:
      return {"error": "Missing required parameter: name"}, 400
    
    # Import required classes
    from azure.ai.ml.entities import ManagedOnlineEndpoint
    
    # Create online endpoint
    endpoint = ManagedOnlineEndpoint(
      name=endpoint_name,
      description=description,
      auth_mode=auth_mode,
      tags=payload.get("tags", {})
    )
    
    logger.info(f"Submitting online endpoint creation: {endpoint_name}")
    
    # Create the endpoint
    endpoint_operation = ml_client.online_endpoints.begin_create_or_update(endpoint)
    
    # Wait for completion
    logger.info("Waiting for endpoint creation to complete...")
    created_endpoint = endpoint_operation.result()
    logger.info(f"Online endpoint created successfully: {created_endpoint.name}")
    
    # Get endpoint details via REST API
    connect = token_generate()
    value = json.loads(connect)
    Authorization = value["access_token"]
    
    subscriptionId = connections.get('subscriptionId')
    resourceGroupName = connections.get('resourceGroupName')
    workspaceName = connections.get('workspaceName')
    api_version = connections.get("endpoints_api-version", "2023-04-01")
    
    # Use onlineEndpoints instead of batchEndpoints
    url = f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/onlineEndpoints/{endpoint_name}?api-version={api_version}"
    
    headers = {
      "Authorization": "Bearer " + str(Authorization)
    }
    
    response = requests.request("GET", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
    
    if response.status_code == 200:
      values = json.loads(response.text)
      values = responseFormat(adapter_instance, project, values)
      values["endpoint_type"] = "online"
      values["scoring_uri"] = created_endpoint.scoring_uri
      values["auth_mode"] = created_endpoint.auth_mode
      return values, response.status_code
    else:
      logger.warning(f"Could not retrieve endpoint details: {response.status_code}")
      return {
        "name": endpoint_name,
        "endpoint_type": "online",
        "scoring_uri": created_endpoint.scoring_uri,
        "auth_mode": created_endpoint.auth_mode,
        "provisioning_state": created_endpoint.provisioning_state,
        "status": "created",
        "message": "Online endpoint created successfully"
      }, 201
      
  except Exception as e:
    logger.error(f"Online endpoint creation failed: {str(e)}", exc_info=True)
    return {"error": str(e)}, 500

def projects_endpoints_get(adapter_instance, project, isCached, isInstance, connections, endpoint_name):
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  api_version=connections.get('models_api-version',None)
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/batchEndpoints/{endpoint_name}/?api-version={api_version}"
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }
  response = requests.request("GET", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
  try:
    if response.status_code == 200 :
      values=json.loads(response.text)
      values=responseFormat(adapter_instance,project,values)
      return values,response.status_code
    elif response.status_code == 400:
      return "Error: Bad Parameters(HTTP 400)"
    elif response.status_code ==500:
      return "Internal Server Error(HTTP 500)"
    else:
      return f"Request failed with status code:{response.status_code}"
        
  except Exception as e:
    logger.error(f"an error occured:{str(e)}")  
    return e 
        
def projects_endpoints_delete(adapter_instance, project, isCached, isInstance, connections, endpoint_name):
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  api_version=connections.get("endpoints_api-version",None)
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/batchEndpoints/{endpoint_name}/?api-version={api_version}"
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }    
  response = requests.request("DELETE", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
  try:
    if response.status_code == 200 or 202:
      return response.text,response.status_code
    elif response.status_code == 400:
      return "Error: Bad Parameters(HTTP 400)"
    elif response.status_code ==500:
      return "Internal Server Error(HTTP 500)"
    else:
      return f"Request failed with status code:{response.status_code}"
        
  except Exception as e:
    logger.error(f"an error occured:{str(e)}")  
    return e

def training_istlist(adapter_instance, project, isCached, isInstance, connections):
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  api_version=connections.get("trainingPipeline_api-version",None)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/jobs?api-version={api_version}"
  headers = {
  "Authorization" : "Bearer "+str(Authorization)

  }
  response = requests.request("GET", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
  try:
    if response.status_code == 200:
      values=json.loads(response.text)
      values=responseFormat(adapter_instance,project,values)
      return values,response.status_code
    elif response.status_code == 400:
      return "Error: Bad Parameters(HTTP 400)"
    elif response.status_code ==500:
      return "Internal Server Error(HTTP 500)"
    else:
      return f"Request failed with status code:{response.status_code}"
        
  except Exception as e:
    logger.error(f"an error occured:{str(e)}")  
    return e  
  
def training_get_list(adapter_instance, project, isCached, isInstance, connections, training_job_id):
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  api_version=connections.get("trainingPipeline_api-version",None)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/jobs/{training_job_id}?api-version={api_version}"
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }
  response = requests.request("GET", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
  try:
    if response.status_code == 200 :
      values=json.loads(response.text)
      values=responseFormat(adapter_instance,project,values)
      return values,response.status_code
    elif response.status_code == 400:
      return "Error: Bad Parameters(HTTP 400)"
    elif response.status_code ==500:
      return "Internal Server Error(HTTP 500)"
    else:
      return f"Request failed with status code:{response.status_code}"
  except Exception as e:
    logger.error(f"an error occured:{str(e)}")  
    return e 

def ConfigEnvironment():
    dirname = './AzurePipeline'
    if os.path.exists(dirname):
        shutil.rmtree(dirname)
        os.mkdir(dirname)
    else:
        os.mkdir(dirname)
    os.chdir(dirname)
    global workspace_glob
    svc_pr = ServicePrincipalAuthentication(
        tenant_id=os.environ.get('tenant_id'),
        service_principal_id=os.environ.get('service_principal_id'),
        service_principal_password=os.environ.get('service_principal_password'),
    )

    workspace = Workspace(
        subscription_id=os.environ.get('subscription_id'),
        resource_group=os.environ.get('resource_group'),
        workspace_name=os.environ.get('workspace_name'),
        auth=svc_pr,
    )
    workspace_glob = workspace
    return workspace 

def training_train_create(adapter_instance, project, isCached, isInstance, connections, payload):
  logger.info("Starting training_train_create")
  
  try:
    ml_client = ConnectClient()
    logger.info("ML Client connected successfully")
    
    compute_name = payload.get("compute")
    dataset_name = payload.get("dataset_name")
    name = payload.get("name")
    task = payload.get("task_type")
    column_name = payload.get("target_column_name")
    metrics = payload.get("metrics_type")
    
    logger.info(f"Training parameters: compute={compute_name}, dataset={dataset_name}, experiment={name}, task={task}, target_column={column_name}, metric={metrics}")
    
    # Validate required parameters
    if not all([compute_name, dataset_name, name, task, column_name, metrics]):
      missing = []
      if not compute_name: missing.append('compute')
      if not dataset_name: missing.append('dataset_name')
      if not name: missing.append('name')
      if not task: missing.append('task_type')
      if not column_name: missing.append('target_column_name')
      if not metrics: missing.append('metrics_type')
      logger.error(f"Missing required parameters: {', '.join(missing)}")
      return {"error": f"Missing required parameters: {', '.join(missing)}"}, 400
    
    # Get dataset - TRY MULTIPLE APPROACHES
    dataset = None
    dataset_path = None
    dataset_type = None
    
    try:
      # Approach 1: Try to get by name with "latest" label
      logger.info(f"Attempting to get dataset '{dataset_name}' with label 'latest'")
      dataset = ml_client.data.get(name=dataset_name, label="latest")
      dataset_path = dataset.path
      dataset_type = dataset.type
      logger.info(f"✓ Dataset found with 'latest' label")
      
    except Exception as e1:
      logger.warning(f"Failed to get dataset with 'latest' label: {str(e1)}")
      
      try:
        # Approach 2: Try to get latest version by listing all versions
        logger.info(f"Attempting to list all versions of dataset '{dataset_name}'")
        dataset_versions = list(ml_client.data.list(name=dataset_name))
        
        if dataset_versions:
          # Sort by version number (assuming versions are integers)
          dataset_versions.sort(key=lambda x: int(x.version) if x.version.isdigit() else 0, reverse=True)
          dataset = dataset_versions[0]
          dataset_path = dataset.path
          dataset_type = dataset.type
          logger.info(f"✓ Dataset found - using version {dataset.version}")
        else:
          raise Exception(f"No versions found for dataset '{dataset_name}'")
          
      except Exception as e2:
        logger.error(f"Failed to list dataset versions: {str(e2)}")
        
        # Approach 3: List ALL datasets and find a case-insensitive match
        try:
          logger.info("Attempting to find dataset by listing all datasets")
          all_datasets = list(ml_client.data.list())
          
          # Try exact match first
          matching = [d for d in all_datasets if d.name == dataset_name]
          
          if not matching:
            # Try case-insensitive match
            matching = [d for d in all_datasets if d.name.lower() == dataset_name.lower()]
          
          if matching:
            # Group by name and get latest version
            from itertools import groupby
            matching.sort(key=lambda x: x.name)
            
            for name_key, group in groupby(matching, key=lambda x: x.name):
              versions = list(group)
              versions.sort(key=lambda x: int(x.version) if x.version.isdigit() else 0, reverse=True)
              dataset = versions[0]
              dataset_path = dataset.path
              dataset_type = dataset.type
              logger.info(f"✓ Dataset found: '{dataset.name}' (version {dataset.version})")
              break
          else:
            # List available datasets for debugging
            available_names = [d.name for d in all_datasets[:10]]
            logger.error(f"Dataset '{dataset_name}' not found. Available datasets: {available_names}")
            
            return {
              "error": f"Dataset '{dataset_name}' not found in workspace.",
              "available_datasets": available_names,
              "suggestion": "Please verify the dataset name and ensure it has been successfully registered."
            }, 404
            
        except Exception as e3:
          logger.error(f"Failed to list all datasets: {str(e3)}")
          return {
            "error": f"Dataset '{dataset_name}' not found. Please verify it exists and has been registered successfully.",
            "details": str(e3)
          }, 404
    
    # Validate we got a dataset
    if not dataset or not dataset_path:
      return {
        "error": f"Failed to retrieve dataset '{dataset_name}' after trying multiple approaches.",
        "troubleshooting": [
          "Verify the dataset was successfully created",
          "Check the exact dataset name in Azure ML Studio",
          "Ensure the dataset has a valid version"
        ]
      }, 404
    
    # Remove trailing slash if present
    if dataset_path.endswith('/'):
      dataset_path = dataset_path.rstrip('/')
    
    logger.info(f"Dataset '{dataset.name}' retrieved successfully")
    logger.info(f"Dataset path: {dataset_path}")
    logger.info(f"Dataset type: {dataset_type}")
    logger.info(f"Dataset version: {dataset.version}")
    
    from azure.ai.ml import automl
    from azure.ai.ml.constants import AssetTypes
    
    # HANDLE DIFFERENT DATASET TYPES
    if dataset_type == AssetTypes.MLTABLE:
      # Dataset is already an MLTable - use it directly
      logger.info("Dataset is already MLTable type - using directly")
      
      training_data_input = Input(
        type=AssetTypes.MLTABLE, 
        path=f"azureml:{dataset.name}:{dataset.version}"  # Use explicit version
      )
      
    else:
      # Dataset is URI_FILE - need to create MLTable wrapper
      logger.info("Dataset is URI_FILE type - creating MLTable wrapper")
      
      import os
      import shutil
      
      # Create MLTable configuration for CSV file
      mltable_folder = f"./mltable_{name}"
      os.makedirs(mltable_folder, exist_ok=True)
      
      # Write MLTable yaml file
      mltable_yaml_content = f"""paths:
  - file: {dataset_path}
transformations:
  - read_delimited:
      delimiter: ','
      encoding: 'utf8'
      header: all_files_same_headers
"""
      
      mltable_yaml_path = os.path.join(mltable_folder, "MLTable")
      with open(mltable_yaml_path, 'w') as f:
        f.write(mltable_yaml_content)
      
      logger.info(f"Created MLTable yaml at: {mltable_yaml_path}")
      
      # Upload MLTable folder to datastore
      from azure.ai.ml.entities import Data
      
      mltable_data = Data(
        path=mltable_folder,
        type=AssetTypes.MLTABLE,
        name=f"{dataset.name}_mltable",
        description=f"MLTable version of {dataset.name}"
      )
      
      registered_mltable = ml_client.data.create_or_update(mltable_data)
      logger.info(f"Registered MLTable: {registered_mltable.name}")
      
      training_data_input = Input(
        type=AssetTypes.MLTABLE, 
        path=f"azureml:{registered_mltable.name}:{registered_mltable.version}"
      )
      
      # Cleanup temporary MLTable folder
      try:
        shutil.rmtree(mltable_folder)
        logger.info(f"Cleaned up temporary folder: {mltable_folder}")
      except Exception as cleanup_error:
        logger.warning(f"Failed to cleanup temporary folder {mltable_folder}: {str(cleanup_error)}")
    
    logger.info(f"Created training data input")
    
    # Configure AutoML job
    if task.lower() == "classification":
      automl_job = automl.classification(
        compute=compute_name,
        experiment_name=name,
        training_data=training_data_input,
        target_column_name=column_name,
        primary_metric=metrics,
        n_cross_validations=5
      )
      logger.info("Classification AutoML job configured")
      
    elif task.lower() == "regression":
      automl_job = automl.regression(
        compute=compute_name,
        experiment_name=name,
        training_data=training_data_input,
        target_column_name=column_name,
        primary_metric=metrics,
        n_cross_validations=5
      )
      logger.info("Regression AutoML job configured")
      
    else:
      return {"error": f"Unsupported task type: {task}. Supported: classification, regression"}, 400
    
    # Set limits
    automl_job.set_limits(
      timeout_minutes=180,
      trial_timeout_minutes=60,
      max_trials=5,
      enable_early_termination=True
    )
    logger.info("AutoML job limits configured")
    
    # Submit the job
    logger.info("Submitting AutoML job...")
    returned_job = ml_client.jobs.create_or_update(automl_job)
    logger.info(f"Job submitted successfully: {returned_job.name}")
    
    parent_run_id = returned_job.name
    
    # Get job details via REST API
    connect = token_generate()
    value = json.loads(connect)
    Authorization = value["access_token"]
    subscriptionId = connections.get('subscriptionId', None)
    resourceGroupName = connections.get('resourceGroupName', None)
    workspaceName = connections.get('workspaceName', None)
    api_version = connections.get("trainingPipeline_api-version", None)
    
    url = f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/jobs/{parent_run_id}?api-version={api_version}"
    headers = {
      "Authorization": "Bearer " + str(Authorization)
    }
    response = requests.request("GET", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
    
    if response.status_code == 200:
      values = json.loads(response.text)
      values = responseFormat(adapter_instance, project, values)
      values["run_id"] = parent_run_id
      values["dataset_type"] = dataset_type
      values["dataset_name_used"] = dataset.name
      values["dataset_version_used"] = dataset.version
      return values, response.status_code
    else:
      logger.warning(f"Could not retrieve job details via REST API: {response.status_code}")
      return {
        "run_id": parent_run_id,
        "status": "submitted",
        "name": name,
        "dataset_type": dataset_type,
        "dataset_name_used": dataset.name,
        "dataset_version_used": dataset.version,
        "message": "Job submitted successfully using Azure ML SDK v2"
      }, 202
    
  except Exception as e:
    logger.error(f"Training job creation failed: {str(e)}", exc_info=True)
    return {"error": str(e)}, 500



 
def training_cancel_list(adapter_instance, project, isCached, isInstance, connections, training_job_id):
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  api_version=connections.get("trainingPipeline_api-version",None)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/jobs/{training_job_id}/cancel?api-version={api_version}"
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }    
  response = requests.request("POST", url, headers=headers)
  try:
    if response.status_code == 200 or 202:
      return response.text,response.status_code
    elif response.status_code == 400:
      return "Error: Bad Parameters(HTTP 400)"
    elif response.status_code ==500:
      return "Internal Server Error(HTTP 500)"
    else:
      return f"Request failed with status code:{response.status_code}"
  except Exception as e:
    logger.error(f"an error occured:{str(e)}") 
    return e



def projects_endpoints_deploy_model_create(adapter_instance, project, isCached, isInstance, connections, endpoint_id, payload):
  logger.info("Starting online deployment creation")
  
  try:
    ml_client = ConnectClient()
    
    model_name = payload.get("model_name")
    version = payload.get("model_version")
    instance_type = payload.get("instance_type", "Standard_DS3_v2")
    instance_count = payload.get("instance_count", 3)
    deploymentName = payload.get("deployment_name")
    
    logger.info(f"Online deployment params: model={model_name}, version={version}, instance_type={instance_type}, deployment={deploymentName}")
    
    if not all([model_name, version, deploymentName]):
      return {"error": "Missing required parameters: model_name, model_version, deployment_name"}, 400
    
    # Get model
    try:
      model = ml_client.models.get(model_name, version)
      logger.info(f"Model retrieved: {model_name} v{version}, Type: {model.type}")
    except Exception as e:
      return {"error": f"Model '{model_name}' version '{version}' not found"}, 404
    
    from azure.ai.ml.entities import ManagedOnlineDeployment, ProbeSettings, OnlineRequestSettings
    
    # Create probe settings
    liveness_probe = ProbeSettings(
      initial_delay=10,
      period=10,
      timeout=2,
      success_threshold=1,
      failure_threshold=30
    )
    
    readiness_probe = ProbeSettings(
      initial_delay=10,
      period=10,
      timeout=2,
      success_threshold=1,
      failure_threshold=3
    )
    
    request_settings = OnlineRequestSettings(
      request_timeout_ms=90000,
      max_concurrent_requests_per_instance=1,
      max_queue_wait_ms=60000
    )
    
    # Create online deployment WITHOUT code_configuration or environment
    # MLflow models handle everything automatically
    online_deployment = ManagedOnlineDeployment(
      name=deploymentName,
      endpoint_name=endpoint_id,
      model=model,  # MLflow model - no code or environment needed!
      instance_type=instance_type,
      instance_count=instance_count,
      request_settings=request_settings,
      liveness_probe=liveness_probe,
      readiness_probe=readiness_probe
    )
    
    logger.info("Submitting online deployment with auto-generated MLflow environment...")
    deployment_operation = ml_client.online_deployments.begin_create_or_update(online_deployment)
    
    # DON'T WAIT - Return immediately after triggering deployment
    logger.info(f"Online deployment triggered: {deploymentName}")
    logger.info("Deployment is being created in the background. This may take 10-20 minutes.")
    
    # Optionally set as default deployment (this is quick)
    try:
      endpoint = ml_client.online_endpoints.get(endpoint_id)
      endpoint.traffic = {deploymentName: 100}
      ml_client.online_endpoints.begin_create_or_update(endpoint)
      logger.info(f"Set {deploymentName} as default deployment (will take effect when deployment completes)")
    except Exception as traffic_error:
      logger.warning(f"Could not set traffic: {str(traffic_error)}")
    
    return {
      "deployment_name": deploymentName,
      "endpoint_name": endpoint_id,
      "model_name": model_name,
      "model_version": version,
      "deployment_type": "online",
      "instance_type": instance_type,
      "instance_count": instance_count,
      "status": "creating",
      "provisioning_state": "Creating",
      "message": "Online deployment creation triggered successfully. The deployment is being provisioned in the background. This typically takes 10-20 minutes. Check Azure ML Studio or use the endpoint get API to monitor progress."
    }, 202  # 202 Accepted - request accepted for processing
      
  except Exception as e:
    logger.error(f"Online deployment failed: {str(e)}", exc_info=True)
    return {"error": str(e)}, 500


def ConnectClient():
    global ml_client
    
    logger.info("=" * 80)
    logger.info("CONNECTING ML CLIENT WITH ENHANCED PROXY BYPASS")
    logger.info("=" * 80)
    
    # STEP 1: AGGRESSIVELY clear ALL proxy environment variables
    proxy_vars = [
        'http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY',
        'NO_PROXY', 'no_proxy', 'all_proxy', 'ALL_PROXY',
        'ftp_proxy', 'FTP_PROXY', 'rsync_proxy', 'RSYNC_PROXY',
        'REQUESTS_CA_BUNDLE', 'CURL_CA_BUNDLE'
    ]
    
    for var in proxy_vars:
        if var in os.environ:
            logger.info(f"Removing environment variable: {var}")
            os.environ.pop(var, None)
    
    # Also try to unset them at system level
    try:
        for var in proxy_vars:
            if hasattr(os, 'unsetenv'):
                os.unsetenv(var)
    except Exception as e:
        logger.warning(f"Could not unset system env vars: {str(e)}")
    
    # STEP 2: Get credentials from environment
    tenant = os.environ.get('tenant_id')
    serv_id = os.environ.get('service_principal_id')
    sec_key = os.environ.get('service_principal_password')
    res_grp = os.environ.get('resource_group')
    ws = os.environ.get('workspace_name')
    subs_id = os.environ.get('subscription_id')
    
    logger.info(f"Tenant: {tenant[:10]}..." if tenant else "Tenant: None")
    logger.info(f"Subscription: {subs_id[:10]}..." if subs_id else "Subscription: None")
    logger.info(f"Resource Group: {res_grp}")
    logger.info(f"Workspace: {ws}")
    
    # STEP 3: Configure credential and client with MULTIPLE proxy bypass techniques
    import urllib3
    from azure.core.pipeline.transport import RequestsTransport
    from requests import Session
    from requests.adapters import HTTPAdapter
    
    # Disable urllib3 proxy warnings
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    # STEP 4: Create a completely clean session with NO PROXY
    session = Session()
    session.trust_env = False  # CRITICAL: Don't use environment proxy settings
    session.proxies = {'http': None, 'https': None, 'no_proxy': '*'}  # Explicitly disable all proxies
    session.verify = False  # Disable SSL verification
    
    # Set adapters with no proxy
    http_adapter = HTTPAdapter(max_retries=3)
    https_adapter = HTTPAdapter(max_retries=3)
    session.mount('http://', http_adapter)
    session.mount('https://', https_adapter)
    
    # Ensure session headers don't contain proxy info
    if 'Proxy-Connection' in session.headers:
        del session.headers['Proxy-Connection']
    if 'Proxy-Authorization' in session.headers:
        del session.headers['Proxy-Authorization']
    
    logger.info(f"Session trust_env: {session.trust_env}")
    logger.info(f"Session proxies: {session.proxies}")
    logger.info(f"Session verify: {session.verify}")
    
    # STEP 5: Create transport with custom session
    transport = RequestsTransport(
        session=session,
        session_owner=False,
        connection_verify=False,
        connection_cert=None
    )
    
    # STEP 6: Create credential with custom transport AND explicitly disable proxy
    try:
        credential = ClientSecretCredential(
            tenant_id=tenant,
            client_id=serv_id,
            client_secret=sec_key,
            transport=transport,
            proxies={'http': None, 'https': None},  # Explicitly no proxies
            connection_verify=False
        )
        logger.info("✓ ClientSecretCredential created successfully")
    except Exception as cred_error:
        logger.error(f"Failed to create credential: {str(cred_error)}")
        raise
    
    # STEP 7: Create ML Client with custom transport
    try:
        ml_client = MLClient(
            credential=credential,
            subscription_id=subs_id,
            resource_group_name=res_grp,
            workspace_name=ws,
            transport=transport,
            logging_enable=True
        )
        logger.info("✓ ML Client created successfully")
    except Exception as ml_error:
        logger.error(f"Failed to create ML Client: {str(ml_error)}")
        raise
    
    # STEP 8: Test the connection
    try:
        # Try to list workspaces or get workspace info to verify connection
        logger.info("Testing ML Client connection...")
        # This will trigger an actual API call
        test_call = ml_client.workspaces.get(ws)
        logger.info(f"✓ ML Client connected successfully! Workspace: {test_call.name}")
    except Exception as test_error:
        logger.warning(f"ML Client connection test failed: {str(test_error)}")
        logger.warning("Continuing anyway - connection might still work for specific operations")
    
    logger.info("=" * 80)
    logger.info("ML CLIENT CONNECTION COMPLETE")
    logger.info("=" * 80)
    
    return ml_client


def check_batch_deployment_status(endpoint_name, deployment_name):
  ml_client = ConnectClient()
  
  try:
    # Check endpoint
    endpoint = ml_client.batch_endpoints.get(endpoint_name)
    logger.info(f"Endpoint '{endpoint_name}' state: {endpoint.provisioning_state}")
    
    # Check deployment
    deployment = ml_client.batch_deployments.get(
      endpoint_name=endpoint_name,
      name=deployment_name
    )
    logger.info(f"Deployment '{deployment_name}' state: {deployment.provisioning_state}")
    
    # Check compute
    compute = ml_client.compute.get(deployment.compute)
    logger.info(f"Compute '{deployment.compute}' state: {compute.provisioning_state}")
    
    return {
      "endpoint_state": endpoint.provisioning_state,
      "deployment_state": deployment.provisioning_state,
      "compute_state": compute.provisioning_state
    }
    
  except Exception as e:
    logger.error(f"Status check failed: {str(e)}")
    return {"error": str(e)}


def projects_inferencePipelines_create(adapter_instance, project, isCached, isInstance, connections, payload):
  logger.info("Starting batch inference pipeline creation")
  
  try:
    ml_client = ConnectClient()
    
    endpoint_name = payload.get("endpoint_name")
    dataset_name = payload.get("dataset_name")
    deploymentName = payload.get("deploymentName")
    
    logger.info(f"Inference params: endpoint={endpoint_name}, dataset={dataset_name}, deployment={deploymentName}")
    
    # Validate parameters
    if not all([endpoint_name, dataset_name, deploymentName]):
      return {"error": "Missing required parameters: endpoint_name, dataset_name, deploymentName"}, 400
    
    # Get the original dataset
    try:
      input_data = ml_client.data.get(name=dataset_name, label="latest")
      original_path = input_data.path
      logger.info(f"Original dataset path: {original_path}")
    except Exception as e:
      logger.error(f"Failed to get dataset: {str(e)}")
      return {"error": f"Dataset '{dataset_name}' not found"}, 404
    
    # Extract blob path from azureml URI
    if '/paths/' in original_path:
      blob_path = original_path.split('/paths/')[1]
    else:
      blob_path = original_path
    
    logger.info(f"Extracted blob path: {blob_path}")
    
    # Get folder containing the file
    folder_path = '/'.join(blob_path.split('/')[:-1])
    
    # Create a new data asset for batch inference
    from azure.ai.ml.entities import Data
    from azure.ai.ml.constants import AssetTypes
    import time
    
    timestamp = int(time.time())
    temp_data_name = f"batch_input_{timestamp}"
    
    # Register the folder as a data asset
    batch_data = Data(
      name=temp_data_name,
      path=f"azureml://datastores/workspaceblobstore/paths/{folder_path}",
      type=AssetTypes.URI_FOLDER,
      description=f"Batch inference input from {dataset_name}"
    )
    
    logger.info(f"Registering batch data asset: {temp_data_name}")
    try:
      registered_batch_data = ml_client.data.create_or_update(batch_data)
      logger.info(f"Batch data asset registered: {registered_batch_data.name}")
    except Exception as reg_error:
      logger.error(f"Failed to register data asset: {str(reg_error)}")
      return {"error": f"Failed to register data asset: {str(reg_error)}"}, 500
    
    # Invoke batch endpoint
    from azure.ai.ml import Input
    
    batch_input = Input(
      type=AssetTypes.URI_FOLDER,
      path=f"azureml:{temp_data_name}@latest"
    )
    
    logger.info(f"Invoking batch endpoint: {endpoint_name}, deployment: {deploymentName}")
    
    try:
      job = ml_client.batch_endpoints.invoke(
        endpoint_name=endpoint_name,
        deployment_name=deploymentName,
        input=batch_input
      )
      
      job_name = job.name
      logger.info(f"Batch inference job submitted successfully: {job_name}")
      
    except Exception as invoke_error:
      error_msg = str(invoke_error)
      logger.error(f"Batch endpoint invoke failed: {error_msg}")
      
      # Clean up temporary data asset
      try:
        ml_client.data.archive(name=temp_data_name, label="latest")
      except Exception as archive_error:
        logger.warning(f"Failed to archive temporary data asset {temp_data_name}: {str(archive_error)}")
      
      # Provide specific error message
      return {
        "error": f"Failed to invoke batch endpoint '{endpoint_name}' with deployment '{deploymentName}'. "
                 f"Please verify: "
                 f"1) Endpoint exists and is provisioned successfully, "
                 f"2) Deployment is in 'Succeeded' state, "
                 f"3) Compute cluster is running, "
                 f"4) The scoring script is compatible with your MLflow model. "
                 f"Error details: {error_msg[:500]}"
      }, 500
    
    # Get job details via REST API
    connect = token_generate()
    value = json.loads(connect)
    Authorization = value["access_token"]
    subscriptionId = connections.get('subscriptionId')
    resourceGroupName = connections.get('resourceGroupName')
    workspaceName = connections.get('workspaceName')
    api_version = connections.get("trainingPipeline_api-version", "2022-10-01")
    
    url = f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/jobs/{job_name}?api-version={api_version}"
    headers = {
      "Authorization": "Bearer " + str(Authorization)
    }
    response = requests.request("GET", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
    
    if response.status_code == 200:
      values = json.loads(response.text)
      values = responseFormat(adapter_instance, project, values)
      values["job_name"] = job_name
      values["temp_data_asset"] = temp_data_name
      values["message"] = f"Batch inference job submitted. Job ID: {job_name}. Check Azure ML Studio for progress."
      return values, response.status_code
    else:
      logger.warning(f"Could not retrieve job details: {response.status_code}")
      return {
        "job_name": job_name,
        "endpoint_name": endpoint_name,
        "deployment_name": deploymentName,
        "temp_data_asset": temp_data_name,
        "status": "submitted",
        "message": f"Inference job submitted successfully. Job ID: {job_name}. Check Azure ML Studio for progress."
      }, 202
      
  except Exception as e:
    logger.error(f"Batch inference failed: {str(e)}", exc_info=True)
    return {"error": str(e)}, 500
 
def projects_inferencePipelines_delete(adapter_instance, project, isCached, isInstance, connections, training_job_id):
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  api_version=connections.get("trainingPipeline_api-version")
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  api_version=connections.get("trainingPipeline_api-version",None)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/jobs/{training_job_id}?api-version={api_version}"
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }    
  response = requests.request("DELETE", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
  try:
    if response.status_code == 200 or 202:
      return response.text,response.status_code
    elif response.status_code == 400:
      return "Error: Bad Parameters(HTTP 400)"
    elif response.status_code ==500:
      return "Internal Server Error(HTTP 500)"
    else:
      return f"Request failed with status code:{response.status_code}"
        
  except Exception as e:
    logger.error(f"an error occured:{str(e)}")  
    return e 
 
def projects_inferencePipelines_cancel(adapter_instance, project, isCached, isInstance, connections, training_job_id):
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  api_version=connections.get("trainingPipeline_api-version",None)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/jobs/{training_job_id}/cancel?api-version={api_version}"
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }    
  response = requests.request("POST", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
  try:
    if response.status_code == 200 or 202:
      return response.text,response.status_code
    elif response.status_code == 400:
      return "Error: Bad Parameters(HTTP 400)"
    elif response.status_code ==500:
      return "Internal Server Error(HTTP 500)"
    else:
      return f"Request failed with status code:{response.status_code}"
  except Exception as e:
    logger.error(f"an error occured:{str(e)}") 
    return e 

def projects_endpoints_infer_create(adapter_instance, project, isCached, isInstance, connections, endpoint_id, payload, isOnline):
  logger.info(f"Starting inference - endpoint_id: {endpoint_id}, isOnline: {isOnline}")
  logger.info(f"Payload received: {payload}")
  
  try:
    ml_client = ConnectClient()
    
    # Normalize isOnline to boolean
    is_online_mode = str(isOnline).lower() == "true" if isOnline else False
    
    # Auto-detect mode based on payload if isOnline not explicitly set
    if not is_online_mode and "input_data" in payload and "dataset_name" not in payload:
      is_online_mode = True
      logger.info("Auto-detected online inference mode based on payload structure")
    
    if is_online_mode:
      # ===== ONLINE REAL-TIME INFERENCE =====
      logger.info("Processing online inference request")
      
      endpoint_name = payload.get("endpoint_name") or endpoint_id
      deployment_name = payload.get("deployment_name") or payload.get("deploymentName")
      input_data = payload.get("input_data")
      
      logger.info(f"Online inference: endpoint={endpoint_name}, deployment={deployment_name}")
      
      # Validate parameters
      if not input_data:
        return {"error": "Missing required parameter: input_data"}, 400
      
      # Get endpoint details
      try:
        endpoint = ml_client.online_endpoints.get(endpoint_name)
        logger.info(f"Online endpoint retrieved: {endpoint_name}")
        logger.info(f"Endpoint auth mode: {endpoint.auth_mode}")
        logger.info(f"Provisioning state: {endpoint.provisioning_state}")
      except Exception as e:
        logger.error(f"Failed to get online endpoint: {str(e)}")
        return {
          "error": f"Online endpoint '{endpoint_name}' not found. "
                   f"Please create an online endpoint first."
        }, 404
      
      # Prepare input data for MLflow model - CORRECTED FORMAT
      if isinstance(input_data, dict):
        # Single record - convert to MLflow tabular format
        columns = list(input_data.keys())
        data = [list(input_data.values())]
        input_json = {
          "input_data": {
            "columns": columns,
            "data": data
          }
        }
      elif isinstance(input_data, list):
        # Multiple records - convert to MLflow tabular format
        if len(input_data) > 0 and isinstance(input_data[0], dict):
          columns = list(input_data[0].keys())
          data = [list(record.values()) for record in input_data]
          input_json = {
            "input_data": {
              "columns": columns,
              "data": data
            }
          }
        else:
          return {"error": "input_data list must contain dict objects"}, 400
      else:
        return {"error": "input_data must be a dict or list of dicts"}, 400
      
      logger.info(f"Input data prepared in MLflow format: {input_json}")
      
      # Get scoring URI
      scoring_uri = endpoint.scoring_uri
      logger.info(f"Scoring URI: {scoring_uri}")
      
      # Get the correct authentication based on endpoint auth mode
      if endpoint.auth_mode == "key":
        # Use API key authentication
        logger.info("Using key-based authentication")
        try:
          endpoint_keys = ml_client.online_endpoints.get_keys(endpoint_name)
          api_key = endpoint_keys.primary_key
          logger.info("Retrieved primary API key")
        except Exception as key_error:
          logger.error(f"Failed to get endpoint keys: {str(key_error)}")
          return {"error": f"Failed to retrieve endpoint API key: {str(key_error)}"}, 500
        
        headers = {
          "Content-Type": "application/json",
          "Authorization": f"Bearer {api_key}"
        }
      else:
        # Use AAD token authentication
        logger.info("Using AAD token authentication")
        connect = token_generate()
        value = json.loads(connect)
        Authorization = value["access_token"]
        
        headers = {
          "Content-Type": "application/json",
          "Authorization": f"Bearer {Authorization}"
        }
      
      # Add deployment name to headers if specified
      if deployment_name:
        headers["azureml-model-deployment"] = deployment_name
      
      # Make inference request
      try:
        logger.info(f"Calling scoring endpoint: {scoring_uri}")
        logger.info(f"Request body: {json.dumps(input_json)[:200]}")
        
        response = requests.post(
          scoring_uri,
          json=input_json,
          headers=headers,
          verify=False,
          proxies={'http': None, 'https': None},
          timeout=60,
        )
        
        logger.info(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
          predictions = response.json()
          logger.info(f"Inference successful: {predictions}")
          
          return {
            "endpoint_name": endpoint_name,
            "deployment_name": deployment_name,
            "input_data": input_data,
            "predictions": predictions,
            "status": "success"
          }, 200
        else:
          error_text = response.text
          logger.error(f"Inference failed: {response.status_code} - {error_text}")
          return {
            "error": f"Inference request failed with status {response.status_code}",
            "details": error_text[:500],
            "endpoint": endpoint_name,
            "deployment": deployment_name,
            "auth_mode": endpoint.auth_mode,
            "input_format_sent": input_json,
            "troubleshooting": "Check Azure ML Studio logs for the deployment to see the exact error"
          }, response.status_code
          
      except requests.exceptions.Timeout:
        logger.error("Request timed out")
        return {"error": "Inference request timed out after 60 seconds"}, 504
      except Exception as req_error:
        logger.error(f"Request failed: {str(req_error)}", exc_info=True)
        return {"error": f"Failed to call scoring endpoint: {str(req_error)}"}, 500
    else:
      
      logger.info("Processing batch inference request")
      
      batch_payload = {
        "endpoint_name": payload.get("endpoint_name") or endpoint_id,
        "dataset_name": payload.get("dataset_name"),
        "deploymentName": payload.get("deploymentName") or payload.get("deployment_name")
      }
      
      # Validate batch parameters
      missing_params = []
      if not batch_payload.get("endpoint_name"):
        missing_params.append("endpoint_name")
      if not batch_payload.get("dataset_name"):
        missing_params.append("dataset_name")
      if not batch_payload.get("deploymentName"):
        missing_params.append("deploymentName")
      
      if missing_params:
        return {
          "error": f"Missing required parameters for batch inference: {', '.join(missing_params)}",
          "required_params": {
            "endpoint_name": "Name of the batch endpoint",
            "dataset_name": "Name of the registered dataset",
            "deploymentName": "Name of the deployment"
          }
        }, 400
      
      logger.info(f"Batch inference payload: {batch_payload}")
      
      return projects_inferencePipelines_create(
        adapter_instance, 
        project, 
        isCached, 
        isInstance, 
        connections, 
        batch_payload
      )
    
  except Exception as e:
    logger.error(f"Inference failed: {str(e)}", exc_info=True)
    return {"error": str(e)}, 500
    
    


def projects_inferencePipelines_list_list(adapter_instance, project, isCached, isInstance, connections):
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  api_version=connections.get("trainingPipeline_api-version",None)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/jobs?api-version={api_version}"
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }
  response = requests.request("GET", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
  try:
    if response.status_code == 200:
      values=json.loads(response.text)
      values=responseFormat(adapter_instance,project,values)
      return values,response.status_code
    elif response.status_code == 400:
      return "Error: Bad Parameters(HTTP 400)"
    elif response.status_code ==500:
      return "Internal Server Error(HTTP 500)"
    else:
      return f"Request failed with status code:{response.status_code}"
        
  except Exception as e:
    logger.error(f"an error occured:{str(e)}")  
    return e 
   
def projects_inferencePipelines_get(adapter_instance, project, isCached, isInstance, connections, training_job_id):
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  api_version=connections.get("trainingPipeline_api-version",None)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/jobs/{training_job_id}?api-version={api_version}"
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }
  response = requests.request("GET", url, headers=headers, verify=False, proxies={'http': None, 'https': None})
  try:
    if response.status_code == 200 :
      values=json.loads(response.text)
      values=responseFormat(adapter_instance,project,values)
      return values,response.status_code
    elif response.status_code == 400:
      return "Error: Bad Parameters(HTTP 400)"
    elif response.status_code ==500:
      return "Internal Server Error(HTTP 500)"
    else:
      return f"Request failed with status code:{response.status_code}"
  except Exception as e:
    logger.error(f"an error occured:{str(e)}")  
    return e   
                                      
def cloudconnect(subscriptionId,resourceGroupName,workspaceName):
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/data?api-version=2022-10-01"
  payload = {}
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }
  try:
      response = requests.request("GET", url, headers=headers,data=payload)        
      if response.status_code == 200:
          logger.info("Azure Connection succedded")
          return True
      else:  
          logger.error(f"Request failed with status code{response.status_code}")  
  except Exception as e:
      logger.error(f"an error occured:{str(e)}") 
  return False                