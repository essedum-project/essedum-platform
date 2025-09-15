import requests
import json 
import os
import pandas as pd
import logging
from azureml.core.compute import AmlCompute, ComputeTarget
from azureml.core.environment import CondaDependencies
from azureml.core.authentication import ServicePrincipalAuthentication
from azureml.pipeline.steps import AutoMLStep, PythonScriptStep
from azureml.train.automl import AutoMLConfig
from azureml.pipeline.core import Pipeline, PipelineData, TrainingOutput
import azureml.core
import json,shutil
from azureml.core import Dataset, Experiment, RunConfiguration, Workspace, Environment, Model
import sys
import subprocess
from azure.identity import ClientSecretCredential
from azure.ai.ml.entities import BatchEndpoint, ModelBatchDeployment, ModelBatchDeploymentSettings, PipelineComponentBatchDeployment, Model, AmlCompute, Data, BatchRetrySettings, CodeConfiguration, Environment, Data
from azure.ai.ml.constants import AssetTypes, BatchDeploymentOutputAction
from azureml.train.automl.run import AutoMLRun
from azure.ai.ml import MLClient, Input, load_component
from azure.identity import ClientSecretCredential
from dotenv import load_dotenv
import logging
from utils import *
import os

load_dotenv()

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
def token_generate():
  url = f"https://login.microsoftonline.com/{os.environ.get('tenant_id')}/oauth2/token"

  payload = f"grant_type=client_credentials&client_id={os.environ.get('client_id')}&client_secret={os.environ.get('client_secret')}&resource={os.environ.get('resource')}"
  headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Cookie': 'fpc=AnhFZJgHdUZBh0ZeIH62qTPRTIEqAQAAAENpn9wOAAAA; stsservicecookie=estsfd; x-ms-gateway-slice=estsfd'
  }

  response = requests.request("POST", url, headers=headers, data=payload)
  return response.text
  
def responseFormat(adapter_instance,project,values):   
  format=[]
    
  
  if "value" in values and isinstance(values["value"],list):   
    for value in values["value"]:
      #print(value)
      response_format={
        "sourceId": value.get("name")  ,
        "container":value.get("id") ,
        "adapter":adapter_instance,
        "rawPayload":value,
        "syncDate":value.get("systemData").get("createdAt") ,
        "description": value.get("properties").get("description"," "),
        "organisation":project,
        "type":value.get("type"),
        "createdOn": value.get("systemData").get("createdAt") ,
        "sourceOrg": adapter_instance,
        "createdBy": value.get("systemData").get("createdBy","Application"),
        "name":value.get("id"),
        "modifiedBy": value.get("systemData").get("lastModifiedBy","Application"),
        "id":value.get("id"),
        "sourceName": value.get("name"),
        "adapterId": None,
        "status": value.get("provisioningState","registered"),
        "likes": None,
        "artifacts": value.get("id"),
        "deployment": None,            
      }
      response_format['rawPayload'] = json.dumps(response_format, default=str)      
      format.append(response_format)     
    return format
  else:  
    response_format={
      "sourceId": values.get("name"),
      "container":values.get("id"),
      "adapter":adapter_instance,
      "rawPayload":values,
      "syncDate":values.get("systemData").get("createdAt"),
      "description": values.get("properties").get("description"," "),
      "organisation":project,
      "type":values.get("type"),
      "createdOn": values.get("systemData").get("createdAt") ,
      "sourceOrg": adapter_instance,
      "createdBy": values.get("systemData").get("createdBy","Application"),
      "name":values.get("id"),
      "modifiedBy": values.get("systemData").get("lastModifiedBy","Application"),
      "id":values.get("id"),
      "sourceName": values.get("name"),
      "adapterId": None,
      "status": values.get("properties").get("provisioningState","registered"),
      "likes": None,
      "artifacts": values.get("id"),
      "deployment": None,            
        }
    response_format['rawPayload'] = json.dumps(json.dumps(response_format, default=str))
    #format.append(response_format) 
    # result={"values":format}
    # result.update(result)
    return response_format
              
def projects_datasets_create(adapter_instance, project, isCached, isInstance, connections, payload):
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  dataset_name=payload.get("name")
  api_version=connections.get("datasets_api-version",None)
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  path=payload.get("path")
  description=payload.get("description")
  version=payload.get("version")
  ml_client=ConnectClient() 
  my_data = Data(
          path=path,
          type=AssetTypes.URI_FILE,
          description=description,
          name=dataset_name,
          version=version,
      )
  ml_client.data.create_or_update(my_data)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/data/{dataset_name}?api-version={api_version}"
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }
  response = requests.request("GET", url, headers=headers)
  try:
    if response.status_code == 200 or 201:
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

def projects_datasets_list_list(adapter_instance, project, isCached, isInstance, connections):
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  api_version=connections.get("datasets_api-version",None)
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/data?api-version={api_version}"
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }
  response = requests.request("GET", url, headers=headers)
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
  response = requests.request("GET", url, headers=headers)
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
  response = requests.request("GET", url, headers=headers)
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
  response = requests.request("GET", url, headers=headers)
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
  experiment_name=payload.get("experiment_name")
  runId=payload.get("runId")
  model_name=payload.get("model_name")
  ws=ConfigEnvironment()
  experiment = ws.experiments[experiment_name]
  automl_run = AutoMLRun(experiment, runId)
  best_run, fitted_model = automl_run.get_output()
  model=best_run.register_model(model_name,model_path="outputs/model.pkl")
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
  response = requests.request("GET", url, headers=headers)
  training_dataset_name=connections.get('trainingData',None)
  training_data = Dataset.get_by_name(workspace=ws, name=training_dataset_name)
  train_data=(training_data.to_pandas_dataframe().dtypes).to_dict()
  try:
    if response.status_code == 200:
      values=json.loads(response.text)
      values=responseFormat(adapter_instance,project,values)
      status="creating"
      values["metadata"]=train_data
      #print(values,"11111")
      # values['rawPayload'] = json.dumps(json.dumps(values, default=str))
      # print(values,"2222")
      return values,response.status_code
  except Exception as e:
    logger.error(f"an error occured:{str(e)}")  
    return e    

          
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
  response = requests.request("GET", url, headers=headers)
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
  response = requests.request("DELETE", url, headers=headers)
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
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/batchEndpoints?api-version={api_version}"
  
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }
  response = requests.request("GET", url, headers=headers)
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
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  endpoint_name=payload.get("name")
  api_version=connections.get("endpoints_api-version",None)
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/batchEndpoints/{endpoint_name}?api-version={api_version}"
  payload_json = json.dumps(payload)
  headers = {
  "Authorization" : "Bearer "+str(Authorization),
  "Content-Type":"application/json"
  }
  response = requests.request("PUT", url, headers=headers,data=payload_json)
  try:
    if response.status_code == 200 or 201:
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
  response = requests.request("GET", url, headers=headers)
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
  response = requests.request("DELETE", url, headers=headers)
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
  response = requests.request("GET", url, headers=headers)
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
  response = requests.request("GET", url, headers=headers)
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
  ws=ConfigEnvironment()
  #list_vms = AmlCompute.supported_vmsizes(workspace=ws)
  compute_name=payload.get("compute")
  vm_size=payload.get("vm_size")
  dataset_name=payload.get("dataset_name")
  name=payload.get("name")
  task=payload.get("task_type")
  column_name=payload.get("target_column_name")
  metrics=payload.get("metrics_type")
  compute_config = RunConfiguration()
  compute_config.target = compute_name
  compute_config.amlcompute.vm_size = vm_size
  step_compute_target  = ComputeTarget(workspace=ws, name=compute_name)
  training_data = Dataset.get_by_name(workspace=ws, name=dataset_name)
  print(training_data)
   
    
  automl_config = AutoMLConfig(
        task=task,
        compute_target=step_compute_target,
        run_configuration=compute_config,
        training_data=training_data,
        label_column_name = column_name,
        iterations=5,
        iteration_timeout_minutes=60,
        experiment_timeout_hours=3.0,
        primary_metric=metrics,
        # path='outputs/',
        # debug_log='debug.log',
        featurization='auto',
    )

  automl_step = AutoMLStep(
                      name='Auto  M L',
                      automl_config=automl_config,
                      passthru_automl_config=False,
                      
                      enable_default_model_output=True,
                      enable_default_metrics_output=False,
                      allow_reuse='True')
  pipeline = Pipeline(ws, automl_step)
  experiment = Experiment(name=name, workspace=ws)
  run = experiment.submit(pipeline,show_output=True)
  step_run_ids = [step.id for step in run.get_children()]

  # Print the step run IDs
  for step_run_id in step_run_ids:
      print("Step Run ID:", step_run_id)
  #run.wait_for_completion()
  #logs=run.get_details_with_logs()
  # format=[]
  #logs.get('runId')
  # format=format_logs(adapter_instance, project,logs)
  # return format
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  api_version=connections.get("trainingPipeline_api-version",None)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/jobs/{name}?api-version={api_version}"
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }
  response = requests.request("GET", url, headers=headers)
  
  values=json.loads(response.text)
  values=responseFormat(adapter_instance,project,values)
  values["run_id"]=step_run_id
  return values,response.status_code 

def training_delete(adapter_instance, project, isCached, isInstance, connections, training_job_id):
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
  response = requests.request("DELETE", url, headers=headers)
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
  connect=token_generate()
  value=json.loads(connect)
  #batchEndpointsName=connections.get('batchEndpointsName',None)
  ml_client=ConnectClient()  
  #deploymentName=payload.get('name')
  model_name=payload.get("model_name")
  version=payload.get("model_version")
  compute_target=payload.get("compute_target")
  mini_batch=payload.get("mini_batch")
  deploymentName=payload.get("deployment_name")
  model = ml_client.models.get(model_name,version)
  compute_name = compute_target
  conda_file_dir = os.getcwd()
  conda_file_path = os.path.join(conda_file_dir,'housing-env.yml')
  env = ['name: project_environment\r', 'dependencies:\r', '  # The python interpreter version.\r', '  # Currently Azure ML only supports 3.8 and later.\r', '- python=3.7.9\r', '\r', '- pip:\r', '  - azureml-train-automl-runtime==1.48.0.post1\r', '  - inference-schema\r', '  - azureml-interpret==1.48.0\r', '  - azureml-defaults==1.48.0\r', '- numpy==1.21.6\r', '- pandas==1.1.5\r', '- scikit-learn==0.22.1\r', '- py-xgboost==1.3.3\r', '- fbprophet==0.7.1\r', '- holidays==0.10.3\r', '- psutil==5.9.3\r', 'channels:\r', '- anaconda\r', '- conda-forge\r', '\r', '\r', '\r', '\r', '\r', '\r', '\r', '']
  with open(conda_file_path, 'w+') as f:
      # write elements of list
      for line in env:
          f.write('%s\n' %line)
  f.close()

  
  env = Environment(
      name='batch-torch-py39',
      conda_file=conda_file_path,
      image = 'mcr.microsoft.com/azureml/openmpi3.1.2-ubuntu18.04:20220616.v1'
  )
  cwd = os.getcwd()
  script_path = os.path.join(cwd,'score.py')
  script = ['import os', 'import numpy as np', 'import pandas as pd', 'import azureml.automl.core ', 'from azureml.core import Model', 'import joblib', 'def init():', '    # Runs when the pipeline step is initialized', '    global model', '    # load the model', '    model_path = Model.get_model_path(\'mdlname\')', '    model = joblib.load(model_path)', 'def run(mini_batch):', '    # This runs for each batch', '    resultList = []', '    for f in mini_batch:', '        data = pd.read_csv(f)','        prediction = model.predict(data)', '        data[\'Prediction\'] = prediction', '        # Append prediction to results', '        resultList.append(data)', '        print(resultList)', '    result = pd.concat(resultList)', '    return resultList']
  script = [s.replace('mdlname', model_name) for s in script]
  with open(script_path, 'w+') as f:
      # write elements of list
      for line in script:
          f.write('%s\n' %line)
  f.close()
  
  deploymentConfig = ModelBatchDeploymentSettings(
          max_concurrency_per_instance=2,
          mini_batch_size=mini_batch,
          instance_count=2,
          output_action=BatchDeploymentOutputAction.APPEND_ROW,
          output_file_name='predictions.csv',
          retry_settings=BatchRetrySettings(max_retries=3, timeout=30),
          logging_level='info',
      )
  deployment = ModelBatchDeployment(
      name=deploymentName,
      description='A deployment for regression dataset.',
      endpoint_name=endpoint_id,
      model=model,
      code_configuration=CodeConfiguration(code=cwd, scoring_script='score.py'),
      environment=env,
      compute=compute_name,
      settings=deploymentConfig
  )
  response=ml_client.begin_create_or_update(deployment).result()
  Authorization=value["access_token"]
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  api_version=connections.get("inferencePipeline_api-version",None)
  #batchEndpointsName=connections.get('batchEndpointsName',None)
  
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/batchEndpoints/{endpoint_id}/deployments/{deploymentName}?api-version={api_version}"    
  print(url)
  headers = {
  "Authorization" : "Bearer "+str(Authorization) 
  }
  response= requests.request("GET", url, headers=headers)
  values=json.loads(response.text)
  print(values)
  values=responseFormat(adapter_instance,project,values)
    
  return values,response.status_code   
 

def ConnectClient():
    global ml_client
    # dirname = './AzurePipelinePredict'
    # if os.path.exists(dirname):
    #     shutil.rmtree(dirname)
    #     os.mkdir(dirname)
    # else:
    #     os.mkdir(dirname)
    # os.chdir(dirname)
    tenant = os.environ.get('tenant_id')
    serv_id = os.environ.get('service_principal_id')
    sec_key = os.environ.get('service_principal_password')
    res_grp = os.environ.get('resource_group')
    ws = os.environ.get('workspace_name')
    subs_id = os.environ.get('subscription_id')
    ml_client = MLClient(ClientSecretCredential(tenant,serv_id,sec_key),subs_id, res_grp, ws)
    print('MLCLIENT CONNECTED')
    return ml_client

def projects_inferencePipelines_create(adapter_instance, project, isCached, isInstance, connections, payload):
  ml_client=ConnectClient() 
  adapter_id=connections.get('adapter_id',None)
  endpoint_name=payload.get("endpoint_name")
  dataset_name=payload.get("dataset_name")
  deploymentName=payload.get("deploymentName")
  azml_ds = ml_client.datastores.get('azureml')
  filename = f'predictions-{dataset_name}.csv'
  version = payload.get("model_version")
  input_data = ml_client.data.get(dataset_name,version)
  input_path = getattr(input_data,'path')
  job = ml_client.batch_endpoints.invoke(
  endpoint_name=endpoint_name,
  deployment_name=deploymentName,
  input= Input(
      path=input_path,
      type=AssetTypes.URI_FOLDER,
  ),
  params_override=[
      {'output_dataset.datastore_id': f'azureml:{azml_ds.id}'},
      {'output_dataset.path': f'/{endpoint_name}/'},
      {'output_file_name': filename},
  ],
  )  
  job_name=job.name  
  # ml_client.jobs.stream(name=job.name)
  # print('job completed')
  # print('#######################')
  # job_name = getattr(job,'name')
  # print(job_name)
  # print('completed')
  #ml_client.jobs.download(name=job_name, download_path='./', output_name='score')
  connect=token_generate()
  value=json.loads(connect)
  Authorization=value["access_token"]
  subscriptionId=connections.get('subscriptionId',None)
  resourceGroupName=connections.get('resourceGroupName',None)
  workspaceName=connections.get('workspaceName',None)
  api_version=connections.get("trainingPipeline_api-version",None)
  url=f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/workspaces/{workspaceName}/jobs/{job_name}?api-version={api_version}"
  headers = {
  "Authorization" : "Bearer "+str(Authorization)
  }
  response = requests.request("GET", url, headers=headers)
  
  values=json.loads(response.text)
  values=responseFormat(adapter_instance,project,values)
  return values,response.status_code   
 
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
  response = requests.request("DELETE", url, headers=headers)
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
  response = requests.request("GET", url, headers=headers)
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
  response = requests.request("GET", url, headers=headers)
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
