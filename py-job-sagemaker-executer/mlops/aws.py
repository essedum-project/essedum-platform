from urllib.parse import urlparse
import boto3
import json
import traceback
import sagemaker
from datetime import datetime
import logging
from botocore.config import Config
from utils import *
import os
import io
import pandas as pd
from sagemaker.automl.automl import AutoML, AutoMLInput
from dotenv import load_dotenv

load_dotenv()

# dec 4

os.environ['http_proxy'] = PROXY
os.environ['https_proxy'] = PROXY
os.environ['HTTP_PROXY'] = PROXY
os.environ['HTTPS_PROXY'] = PROXY
os.environ['no_proxy'] = NOPROXY

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
file_handler = logging.FileHandler('logfile.log')
formatter = logging.Formatter('%(asctime)s : %(levelname)s : %(name)s : %(message)s')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



def projects_datasets_list_list(adapter_instance, project, isCached, isInstance, connections):
    try:
        access_key = connections.get("accessKey",None)
        secret_key = connections.get("secretKey",None)
        region = connections.get("region",None)
        session_token = connections.get("sessionToken",None)  # or "aws_session_token" if that's your key
        if access_key and secret_key and region:
            if session_token:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token
                )
            else:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )
                           
            # response = s3_client.list_objects(Bucket = "s3-ppcaws2441999-essedum-s3-bucket", Prefix = 'aws_sagemaker', MaxKeys = 4)
            response = s3_client.list_objects(Bucket =  connections.get('bucketName', None), MaxKeys = 4)

            dataset_dict_info = []
            for obj in response.get('Contents', []):
                dataset_info = {
                    'sourceID' : obj.get('Key'),
                    'container' : obj.get('Amazon Resource Name', ''),
                    'adapter' : adapter_instance,
                    'rawPayload' : json.dumps(response, default = str),
                    'syncDate' : obj.get('LastModified'),
                    'description': '',
                    'project': project,
                    'type' : 's3',
                    'createdOn' : obj.get('CreationTime'),
                    'sourceOrg' : '',
                    #"createdBy": "admin",
                    'name': obj.get('Key'),
                    #"modifiedBy": "",
                    'id' : obj.get('ID'),
                    'sourcename' : obj.get('Key'),
                    'status': 'Registered',
                    #"likes": 0,
                    'artifacts':obj.get('Amazon Resource Name', ''),
                    'deployment': ''
                }
                dataset_info['rawPayload'] = json.dumps(dataset_info, default = str)
                dataset_dict_info.append(dataset_info)
            return dataset_dict_info, 200
        else:
            pass
    except Exception as err:
        print(err)
    return "", 500
    #logging.info("s3 Datasets List Response: %s", str(bucket_list))



def projects_datasets_get(adapter_instance, project, isCached, isInstance, connections, dataset_id):
    try:
        access_key = connections.get("accessKey",None)
        secret_key = connections.get("secretKey",None)
        region = connections.get("region",None)
        session_token = connections.get("sessionToken",None)
        if access_key and secret_key and region:
            if session_token:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token
                )
            else:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )
        
        
            logger.info("Dataset get is in progress")
            response = s3_client.head_object(Bucket =  connections.get('bucketName', None),Key = dataset_id)
            logger.info("Dataset Details")
            dataset_info = {
                'sourceID' : dataset_id,
                'container' : response.get('Amazon Resource Name'),
                'adapter' : adapter_instance,
                'rawPayload' : json.dumps(response, default = str),
                'syncDate' : response.get('LastModified'),
                'description': 'null',
                'project': project,
                'type' : 's3',
                'createdOn' : response.get('date'),
                'sourceOrg' : 'null',
                #"createdBy": "admin",
                'name': dataset_id,
                #"modifiedBy": "",
                'id' : response.get('ID'),
                'sourcename' : dataset_id,
                'status': 'Registered',
                #"likes": 0,
                'artifacts':response.get('Amazon Resource Name'),
                'deployment': 'null'
            }
            dataset_info['rawPayload'] = json.dumps(response, default = str)
            return dataset_info,200
        else:
            pass
    except Exception as err:
        print(err)
    return ""
    #logging.info("s3 Dataset Get Response: %s", str(my_bucket))


import uuid
def projects_datasets_create(adapter_instance, project, isCached, isInstance, connections, request_body):
    try:
        access_key = connections.get("accessKey",None)
        secret_key = connections.get("secretKey",None)
        region = connections.get("region",None)
        session_token = connections.get("sessionToken",None)
        if access_key and secret_key and region:
            if session_token:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token
                )
            else:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )
            logger.info("**************")
            logger.info(request_body)
            data = pd.read_csv(request_body.get("local_dataset_path"))
            s3_key = request_body.get("Key")
            bucket = request_body.get("Bucket")
            response = s3_client.put_object(Body = data.to_csv(index = False), Bucket = bucket, Key = s3_key)
            



            short_uuid = str(uuid.uuid4()).replace('-', '')[:10]

            dataset_info = {
                'sourceID' : s3_key,
                'container' : response.get('Amazon Resource Name'),
                'adapter' : adapter_instance,
                'rawPayload' : json.dumps(response, default = str),
                'syncDate' : response.get('Last modified'),
                'description': '',
                'project': project,
                'type' : 's3',
                'createdOn' : response.get('date', 'N/A'),
                'sourceOrg' : '',
                #"createdBy": "admin",
                'name': s3_key,
                #"modifiedBy": "",
                'id' : short_uuid,
                'sourcename' : s3_key,
                'status': 'Registered',
                #"likes": 0,
                'artifacts':response.get('Amazon Resource Name'),
                'deployment': ''
            }
            dataset_info['rawPayload'] = json.dumps(dataset_info, default = str)
            return dataset_info, 200
        else:
            pass
    except Exception as err:
        print(err)
    return "",500
    #logging.info("s3 Dataset Create Response: %s", str(response))



def projects_datasets_delete(adapter_instance, project, isCached, isInstance, connections,dataset_id):
    try:
        access_key = connections.get("accessKey",None)
        secret_key = connections.get("secretKey",None)
        region = connections.get("region",None)
        session_token = connections.get("sessionToken",None)

        if access_key and secret_key and region:
            if session_token:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token
                )
            else:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )
            response = s3_client.delete_object(Bucket =  connections.get('bucketName', None),Key = dataset_id)
            logger.info("Dataset deleted successfully")
            return {"message": f"Dataset {dataset_id} deleted successfully."}, 200
              
        else:
            logger.info("access key is None")
            return {"error": "You got an error Kindly check the credentials"}
    except Exception as err:
        logger.info(f"Error in deletion of dataset: {str(err)}")
        return {"error": str(err)},500
    
    #logging.info("s3 Dataset Delete Response: %s", str(response))



def projects_models_list(adapter_instance, project, isCached, isInstance, connections):
    res = 'Internal Server Error'
    try:
        access_key = connections.get("accessKey",None)
        secret_key = connections.get("secretKey",None)
        region = connections.get("region",None)
        session_token = connections.get("sessionToken",None)
        if access_key and secret_key and region:
            if session_token:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token
                )
            else:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )
            client = session.client("sagemaker",region_name='us-east-1', verify=False)
            response = {}
            res = {'Models': []}
            while True:
                response = client.list_models(SortBy='CreationTime', SortOrder='Descending', NextToken=response.get('NextToken', ''))
                res['Models'].extend(response.get('Models', []))
                if response.get('NextToken', '') == '':
                    break
            model_info_dict = []
            response = res
            for model in response.get('Models', []):
            
            # for sourceOrg
                sourceOrg = model.get('ExecutionRoleArn', '').split("/")[-1] if model.get('ExecutionRoleArn') else 'NULL'
                
            # for status
                if 'Registered' in model.get('ModelName', '').lower():
                    status = 'Registered'
                else:
                    status = 'Unregistered'

                # for type
                model_name = model.get('ModelName', '')
                if 'S3' in model_name.lower():
                    model_type = 'S3'
                else:
                    model_type = 'AWSSAGEMAKER'

                LMT = model.get('LastModifiedTime', None)
                if LMT is not None:
                    LMT = LMT.strftime('%Y-%m-%d %H-%M-%S')
                CT = model.get('CreationTime', None)
                if CT is not None:
                    CT = CT.strftime('%Y-%m-%d %H-%M-%S')
                model_info = {
                    'sourceID' : model.get('ModelName'),
                    'container' : model.get('ModelArn'),
                    'adapter' : adapter_instance,
                    'rawPayload' : json.dumps(model, default = str),
                    'syncDate' : LMT,
                    'description': '',
                    'project': project,
                    'type' : model_type,
                    'createdOn' : CT,
                    'sourceOrg' : sourceOrg,
                    #"createdBy": "admin",
                    'name': model.get('ModelName'),
                    #"modifiedBy": "",
                    'id' : model.get(''),
                    'sourcename' : model.get('ModelName'),
                    'status': 'Registered',
                    'artifacts': model.get('ModelArn'),
                    'deployment': ''
                }
                model_info['rawPayload'] = json.dumps(model_info, default = str)
                model_info_dict.append(model_info)   
            return model_info_dict, 200
        else:
            return 'Access key is None', 200
    except Exception as err:
        print(err)
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"error is : {str(exc_trace)}")
    return result, 500



def projects_models_get(adapter_instance, project, isCached, isInstance, connections, model_id):
    try:
        access_key = connections.get("accessKey",None)
        secret_key = connections.get("secretKey",None)
        region = connections.get("region",None)
        session_token = connections.get("sessionToken",None)
        if access_key and secret_key and region:
            if session_token:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token
                )
            else:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )

        
       
            client = session.client("sagemaker")
            response = client.describe_model(ModelName = model_id)
            # for type
            if 'S3' in model_id.lower():
                model_type = 'S3'
            else:
                model_type = 'AWSSAGEMAKER'

            model_info = {
                'sourceID' : model_id,
                'container' : response.get('ModelArn'),
                'adapter' : adapter_instance,
                'rawPayload' : json.dumps(model_id, default = str),
                'syncDate' : response.get('LastModifiedTime'),
                'description': '',
                'project': project,
                'type' : model_type,
                'createdOn' : response.get('CreationTime', 'N/A').strftime('%Y-%m-%d %H-%M-%S'),
                'sourceOrg' : response.get('ExecutionRoleArn', 'N/A'),
                #"createdBy": "admin",
                'name': model_id,
                #"modifiedBy": "",
                'id' : '',
                'sourcename' : model_id,
                #"adapterId": "DEMAWSRH51496",
                'status': 'Registered',
                #"likes": 0,
                'artifacts': response.get('ModelArn'),
                'deployment': ''
            }
            model_info['rawPayload'] = json.dumps(model_info, default = str)
            return model_info, 200

        else:
            pass
    except Exception as err:
        print(err)
    return ""
    #logging.info("SageMaker Models Get Response: %s", str(response))



def projects_models_register_create(adapter_instance, project, isCached, isInstance, connections,request_body):
    result = ""
    try:
        access_key = connections.get("accessKey",None)
        secret_key = connections.get("secretKey",None)
        region = connections.get("region",None)
        session_token = connections.get("sessionToken",None)
        import boto3

        if access_key and secret_key and region:
            if session_token:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    aws_session_token=session_token,
                    region_name=region
                )
            else:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )
            client = session.client("sagemaker",region_name="us-east-1",verify=False)
            execution_role_arn = request_body.get("ExecutionRoleArn", "")
            container = request_body.get("Containers", "")
            model_name = request_body.get("ModelName", "")
            response = client.create_model(ModelName = model_name,                                    
                                        Containers = container,                               
                                        ExecutionRoleArn = execution_role_arn
                                        )
            if 'S3' in model_name.lower():
                model_type = 'S3'
            else:
                model_type = 'AWSSAGEMAKER'
            
            
            model_info = {
                'sourceID' : model_name,
                'container' : response.get('ModelArn'),
                'adapter' : adapter_instance,
                'rawPayload' : json.dumps(model_name, default = str),
                'syncDate' : response.get('LastModifiedTime', 'N/A'),
                'description': '',
                'project': project,
                'type' : model_type,
                'createdOn' : datetime.now().isoformat(), #.strftime('%Y-%m-%d %H-%M-%S'),
                'sourceOrg' : response.get('ExecutionRoleArn', 'N/A'),
                #"createdBy": "admin",
                'name': model_name,
                #"modifiedBy": "",
                'id' : '',
                'sourcename' : model_name,
                'status': 'Registered',
                #"likes": 0,
                'artifacts': response.get('ModelArn'),
                'deployment': ''
            }
            model_info['rawPayload'] = json.dumps(model_info, default = str)
            return model_info, 200   
        else:
            return 'Access key is None'
    except Exception as err:
        print(err)
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"error is : {str(exc_trace)}")
    return result,500




def projects_models_delete(adapter_instance, project, isCached, isInstance, connections, model_id):
    logger.info("Enter delete model function")
    try:
        access_key = connections.get("accessKey",None)
        secret_key = connections.get("secretKey",None)
        region = connections.get("region",None)
        session_token = connections.get("sessionToken",None)
        import boto3

        if access_key and secret_key and region:
            if session_token:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    aws_session_token=session_token,
                    region_name=region
                )
            else:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )

            s3_client = session.client("s3", verify=False)
            client = session.client("sagemaker",region_name="us-east-1",verify=False)
            logger.info("Model deletion inprogress...")
            response = client.delete_model(ModelName = model_id)
            logger.info("Model deleted successfully")
            return {"message": "Model deleted successfully."}, 200
              
        else:
            logger.info("access key is None")
            return {"error": "You got an error Kindly check the credentials"}
    except Exception as err:
        logger.info(f"Error in deletion of model: {str(err)}")
        return {"error": str(err)},500
    


def projects_endpoints_list_lists(adapter_instance, project, isCached, isInstance, connections):
    res = "internal server error"
    try:
        access_key = connections.get("accessKey",None)
        secret_key = connections.get("secretKey",None)
        region = connections.get("region",None)
        session_token = connections.get("sessionToken",None)
        if access_key and secret_key and region:
            if session_token:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token
                )
            else:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )
            client = session.client("sagemaker", region_name='us-east-1', verify=False)
            response = {}
            res = {'Endpoints': []}
            while True:
                response = client.list_endpoints( SortBy='CreationTime',
                SortOrder='Descending', NextToken=response.get('NextToken', ''))
                res['Endpoints'].extend(response.get('Endpoints', []))
                if response.get('NextToken', '') == '':
                    break
            response = res
            Endpoint_info_dict = []
            for endpoint in response.get('Endpoints', []):
            
            # for sourceOrg
                sourceOrg = endpoint.get('ExecutionRoleArn', '').split("/")[-1] if endpoint.get('ExecutionRoleArn') else 'NULL'
                
            # for status
                if 'Registered' in endpoint.get('EndpointName', '').lower():
                    status = 'Registered'
                else:
                    status = 'Unregistered'

                # for type
                endpoint_name = endpoint.get('EndpointName', '')
                if 'S3' in endpoint_name.lower():
                    endpoint_type = 'S3'
                else:
                    endpoint_type = 'AWSSAGEMAKER'
                
                
                endpoint_info = {
                    'sourceID' : endpoint.get('EndpointName'),
                    'container' : endpoint.get('EndpointArn'),
                    'adapter' : adapter_instance,
                    'rawPayload' : json.dumps(endpoint, default = str),
                    'syncDate' : endpoint.get('LastModifiedTime').strftime('%Y-%m-%d %H-%M-%S'),
                    'description': '',
                    'project': project,
                    'type' : endpoint_type,
                    'createdOn' : endpoint.get('CreationTime', 'N/A').strftime('%Y-%m-%d %H-%M-%S'),
                    'sourceOrg' : sourceOrg,
                    #"createdBy": "admin",
                    'name': endpoint.get('EndpointName'),
                    #"modifiedBy": "",
                    'id' : endpoint.get(''),
                    'sourcename' : endpoint.get('EndpointName'),
                    'status': 'Registered',
                    #"likes": 0,
                    'artifacts': endpoint.get('EndpointArn'),
                    'deployment': ''
                }
                endpoint_info['rawPayload'] = json.dumps(endpoint_info, default = str)
                Endpoint_info_dict.append(endpoint_info)
            print("endpoint dict",Endpoint_info_dict)
            return Endpoint_info_dict, 200
        else:
            pass
    except Exception as err:
        exc_trace = traceback.format_exc()
        logger.info(f"error in aws.py: {str(exc_trace)}")
        res = str(err)
    return res,500



def projects_endpoints_get(adapter_instance, project, isCached, isInstance, connections, endpoint_id):
    try:
        access_key = connections.get("accessKey",None)
        secret_key = connections.get("secretKey",None)
        region = connections.get("region",None)
        session_token = connections.get("sessionToken",None)

        if access_key and secret_key and region:
            if session_token:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token
                )
            else:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )

            client = session.client("sagemaker")
            response = client.describe_endpoint(EndpointName = endpoint_id)
            endpoint_id = response['EndpointName']
            if 'S3' in endpoint_id.lower():
                endpoint_type = 'S3'
            else:
                endpoint_type = 'AWSSAGEMAKER'
            
            
            endpoint_info = {
                'sourceID' : endpoint_id,
                'container' : response.get('EndpointArn'),
                'adapter' : adapter_instance,
                'rawPayload' : json.dumps(endpoint_id, default = str),
                'syncDate' : response.get('LastModifiedTime', 'N/A'),
                'description': '',
                'project': project,
                'type' : endpoint_type,
                'createdOn' : response.get('CreationTime', 'N/A').strftime('%Y-%m-%d %H-%M-%S'),
                'sourceOrg' : response.get('ExecutionRoleArn', 'N/A'),
                #"createdBy": "admin",
                'name': endpoint_id,
                #"modifiedBy": "",
                'id' : '',
                'sourcename' : endpoint_id,
                'status': 'Registered',
                #"likes": 0,
                'artifacts': response.get('EndpointArn'),
                'deployment': ''
            }
            endpoint_info['rawPayload'] = json.dumps(endpoint_info, default = str)
            return endpoint_info, 200

        else:
            pass
    except Exception as err:
        print(err)
    return ""
    #logging.info("SageMaker Endpoint Get Response: %s", response)



def projects_endpoints_create(adapter_instance, project, isCached, isInstance, connections, request_body):
    try:
        access_key = connections.get("accessKey",None)
        secret_key = connections.get("secretKey",None)
        region = connections.get("region",None)
        session_token = connections.get("sessionToken",None)

        if access_key and secret_key and region:
            if session_token:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token
                )
            else:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )

            client = session.client("sagemaker")

            execution_role_arn = request_body.get("ExecutionRoleArn", "")
            primary_container = request_body.get("PrimaryContainer", "")
            model_name = request_body.get("ModelName", "")
            #model_create_response = projects_models_register_create(adapter_instance, project, isCached, isInstance,connections, request_body)

            endpoint_config_name = request_body.get("EndpointConfigName", "")
            production_variants = request_body.get("ProductionVariants", "")
            response = client.create_endpoint_config(
                EndpointConfigName = endpoint_config_name,
                ProductionVariants = [
            {
                'VariantName' : request_body.get("VariantName",""),
                'ModelName' : model_name,
                'InitialInstanceCount' : request_body.get("InitialInstanceCount",""),
                'InstanceType' : request_body.get("InstanceType", ""),
            },
            ])
            # for type
            if 'S3' in endpoint_config_name.lower():
                endpoint_type = 'S3'
            else:
                endpoint_type = 'AWSSAGEMAKER'
            
            
            endpoint_info = {
                'sourceID' : endpoint_config_name,
                'container' : response.get('EndpointConfigArn'),
                'adapter' : adapter_instance,
                'rawPayload' : json.dumps(endpoint_config_name, default = str),
                'syncDate' : response.get('LastModifiedTime'),
                'description': '',
                'project': project,
                'type' : endpoint_type,
                'createdOn' : datetime.now().isoformat(), #.strftime('%Y-%m-%d %H-%M-%S'),
                'sourceOrg' : response.get('ExecutionRoleArn'),
                #"createdBy": "admin",
                'name': endpoint_config_name,
                #"modifiedBy": "",
                'id' : '',
                'sourcename' : endpoint_config_name,
                'status': 'Registered',
                #"likes": 0,
                'artifacts': response.get('EndpointConfigArn'),
                'deployment': ''
            }
            endpoint_info['rawPayload'] = json.dumps(endpoint_info, default = str)
            return endpoint_info, 200
        else:
            pass
    except Exception as err:
        print(err)
    return "",500
    #logging.info("SageMaker Endpoint Create Response: %s", response)



def projects_endpoints_delete(adapter_instance, project, isCached, isInstance, connections, endpoint_id):
    logger.info("Enter delete endpoint function")
    try:
        access_key = connections.get("accessKey",None)
        secret_key = connections.get("secretKey",None)
        region = connections.get("region",None)
        session_token = connections.get("sessionToken",None)

        if access_key and secret_key and region:
            if session_token:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token
                )
            else:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )
            client = session.client("sagemaker")
            logger.info("Endpoint deletion inprogress...")
            response = client.delete_endpoint(EndpointName = endpoint_id)
            logger.info("Endpoint deleted successfully")
            return {"message": "Endpoint deleted successfully."}, 200
              
        else:
            logger.info("access key is None")
            return {"error": "You got an error Kindly check the credentials"}
    except Exception as err:
        logger.info(f"Error in deletion of endpoint: {str(err)}")
        return {"error": str(err)},500
    
    #logging.info("SageMaker Endpoint Delete Response: %s", response)



def projects_endpoints_deploy_model_create(adapter_instance, project, isCached, isInstance, connections, endpoint_id, request_body):
    try:
        access_key = connections.get("accessKey",None)
        secret_key = connections.get("secretKey",None)
        region = connections.get("region",None)
        session_token = connections.get("sessionToken",None)

        if access_key and secret_key and region:
            if session_token:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token
                )
            else:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )
            sagemaker = session.client("sagemaker")
            execution_role_arn = request_body.get("ExecutionRoleArn", "")
            primary_container = request_body.get("PrimaryContainer", "")
            model_name = request_body.get("ModelName", "")
            endpoint_config_name = request_body.get("EndpointConfigName", "")
            production_variants = request_body.get("ProductionVariants", "")
            endpoint_config_create = projects_endpoints_create(adapter_instance, project, isCached, isInstance, connections, request_body)

            response = sagemaker.create_endpoint(EndpointName = endpoint_id, EndpointConfigName = endpoint_config_name)
            # for type
            if 'S3' in endpoint_id.lower():
                endpoint_type = 'S3'
            else:
                endpoint_type = 'AWSSAGEMAKER'
            
            
            endpoint_info = {
                'sourceID' : endpoint_id,
                'container' : response.get('EndpointArn'),
                'adapter' : adapter_instance,
                'rawPayload' : json.dumps(response, default = str),
                'syncDate' : response.get('LastModifiedTime'),
                'description': '',
                'project': project,
                'type' : endpoint_type,
                'createdOn' : datetime.now().isoformat(), #.strftime('%Y-%m-%d %H-%M-%S'),
                'sourceOrg' : response.get('ExecutionRoleArn'),
                #"createdBy": "admin",
                'name': endpoint_id,
                #"modifiedBy": "",
                'id' : '',
                'sourcename' : endpoint_id,
                'status': 'Registered',
                #"likes": 0,
                'artifacts': response.get('EndpointArn'),
                'deployment': ''
            }
            endpoint_info['rawPayload'] = json.dumps(endpoint_info, default = str)
            return endpoint_info, 200
        else:
            pass
    except Exception as err:
        print(err)
    return "",500



def projects_endpoints_infer_create(adapter_instance, project, isCached, isInstance, connections, endpoint_id, request_body):
    try:
        access_key = connections.get("accessKey", None)
        secret_key = connections.get("secretKey", None)
        region = connections.get("region", None)
        session_token = connections.get("sessionToken", None)

        if access_key and secret_key and region:
            if session_token:
                sagemaker_runtime = boto3.client(service_name='sagemaker-runtime', region_name=connections.get("region"),
                    aws_access_key_id=connections.get("accessKey"),
                    aws_secret_access_key=connections.get("secretKey"),
                    aws_session_token=session_token)
            else:
                sagemaker_runtime = boto3.client(service_name='sagemaker-runtime', region_name=connections.get("region"),
                    aws_access_key_id=connections.get("accessKey"),
                    aws_secret_access_key=connections.get("secretKey"))

            logger.info("#########")
            logger.info(request_body)
            request_body = request_body['S3Uri']
            logger.info("$$$$$$$$$$$")
            logger.info(request_body)
            logger.info("aaaaaaaaaaaaaaa")
            url = request_body
            o = urlparse(url, allow_fragments=False)
            bucket = o.netloc.split('.')[0]
            key =o.path.lstrip('/')

            if access_key and secret_key and region:
                if session_token:
                    s3_client = boto3.client(
                        's3',
                        aws_access_key_id=access_key,
                        aws_secret_access_key=secret_key,
                        region_name=region,
                        aws_session_token=session_token
                    )
                else:
                    s3_client = boto3.client(
                        's3',
                        aws_access_key_id=access_key,
                        aws_secret_access_key=secret_key,
                        region_name=region
                    )

            
            result = s3_client.list_objects(Bucket = bucket, Prefix=key)
            extension = key.split('.')[-1]
            for o in result.get('Contents'):
                data = s3_client.get_object(Bucket=bucket, Key=o.get('Key'))
                contents = data['Body'].read()
                if extension == 'csv':
                    contents=str(contents,'utf-8')
                    contents = io.StringIO(contents)
                    dataset = pd.read_csv(contents)
                elif extension == 'json':
                    dataset = json.loads(contents.decode('utf-8'))
                else:
                    dataset = contents.decode('utf-8')

            request_body = pd.DataFrame.from_dict(dataset)
            logger.info("*************")
            #credentials = {'region': region_param, 'aws_access_key_id': aws_access_key_id_param, 'aws_secret_access_key': aws_secret_access_key_param}
            
            data = request_body.to_csv(index=False, header=False)
            data = data.encode('utf-8')
            
            response = sagemaker_runtime.invoke_endpoint(
                EndpointName=endpoint_id,
                Body=data,
                ContentType='text/csv',
            )
            logger.info("vvvvvvvvvvvvvvv")
            output_body = response['Body'].read().decode('utf-8', errors= 'replace')
            logger.info("wwwwwwwwwwww")
            out = pd.read_csv(io.StringIO(output_body), header=None)
            logger.info("xxxxxxxxxxxxxxx")
            out = out.transpose()
            json_str = out.to_json(orient = 'records')


            # out = out.to_dict('records')
            return json_str, 200
        else:
            pass
    except Exception as err:
        print(err)
    return "",500



def training_istlist(adapter_instance, project, isCached, isInstance, connections):
    try:
        access_key = connections.get("accessKey", None)
        secret_key = connections.get("secretKey", None)
        region = connections.get("region", None)
        session_token = connections.get("sessionToken", None)

        if access_key and secret_key and region:
            if session_token:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token
                )
            else:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )

            client = session.client("sagemaker",region_name="us-east-1",verify=False)
            response = client.list_training_jobs(MaxResults=10)
            training_job_info = []
            for obj in response.get('TrainingJobSummaries', []):
                training_info = {
                    'sourceID' : obj.get('TrainingJobName'),
                    'container' : obj.get('TrainingJobArn', ''),
                    'adapter' : adapter_instance,
                    'rawPayload' : json.dumps(response, default = str),
                    'syncDate' : obj.get('LastModified'),
                    'description': '',
                    'project': project,
                    'type' : 's3',
                    'createdOn' : obj.get('CreationTime'),
                    'sourceOrg' : '',
                    #"createdBy": "admin",
                    'name': obj.get('TrainingJobName'),
                    #"modifiedBy": "",
                    'id' : obj.get('ID'),
                    'sourcename' : obj.get('TrainingJobName'),
                    'status': 'Registered',
                    #"likes": 0,
                    'artifacts':obj.get('TrainingJobArn', ''),
                    'deployment': ''
                }
                training_info['rawPayload'] = json.dumps(training_info, default = str)
                training_job_info.append(training_info)
            return training_job_info, 200
        else:
            pass
    except Exception as err:
        print(err)
    return "",500
    #logging.info("SageMaker List pipeline Response: %s", response)



def training_train_create(adapter_instance, project, isCached, isInstance, connections, request_body):
    try:
        access_key = connections.get("accessKey", None)
        secret_key = connections.get("secretKey", None)
        region = connections.get("region", None)
        session_token = connections.get("sessionToken", None)

        if access_key and secret_key and region:
            if session_token:
                sagemaker_session = sagemaker.Session(boto_session = boto3.Session(aws_access_key_id=connections.get("accessKey"),
                                aws_secret_access_key=connections.get("secretKey"),
                                region_name=connections.get("region"),
                                aws_session_token=session_token
                                ))
            else:
                sagemaker_session = sagemaker.Session(boto_session = boto3.Session(aws_access_key_id=connections.get("accessKey"),
                                aws_secret_access_key=connections.get("secretKey"),
                                region_name=connections.get("region")
                                ))

            role = request_body.get("RoleArn", "")
            logger.info(role)
            bucket = request_body.get("Bucket","")
            prefix = request_body.get("S3Prefix","")
            output_path=f's3://{bucket}/{prefix}/output'
            logger.info(output_path)
            logger.info("Training is started")
            # Step 1: Train the model with AutoML

            input_data = request_body.get('inputs', '')
            target_name = request_body.get('target_attribute_name', '')
            content = request_body.get('content_type', '')

            s3_input_train = AutoMLInput(inputs=input_data, target_attribute_name= target_name, content_type= content)
            logger.info("Training is in progress")
            automl = AutoML(role = role,
                            target_attribute_name='SaleType',
                            sagemaker_session=sagemaker_session,
                            output_path=f's3://{bucket}/{prefix}/output',
                            max_candidates = 1)
            automl.fit(inputs=[s3_input_train])
            best_model = automl.best_candidate()
            print(best_model)


            model_info = {
                'sourceID' : best_model.get('CandidateName', ''),
                'container' : best_model.get('ARN', ' '),
                'adapter' : adapter_instance,
                'rawPayload' : json.dumps(best_model, default = str),
                'syncDate' : best_model.get('LastModifiedTime'),
                'description': '',
                'project': project,
                'type' : 'sagemaker',
                'createdOn' : best_model.get('CreationTime', ' '),
                'sourceOrg' : '',
                #"createdBy": "admin",
                'name': best_model.get('CandidateName', []),
                #"modifiedBy": "",
                'id' : best_model.get('ID'),
                'sourcename' : best_model.get('CandidateName', []),
                'status': 'Registered',
                #"likes": 0,
                'artifacts':best_model.get('ARN'),
                'deployment': ''
            }
            model_info['rawPayload'] = json.dumps(best_model, default = str)
            logger.info("Training is done successfully")
            return model_info, 200
              
        else:
            logger.info("access key is None")
            return {"error": "You got an error Kindly check the credentials"}
    except Exception as err:
        logger.info(f"Error in Training Job: {str(err)}")
        return {"error": str(err)},500
    #logging.info("SageMaker Create Pipeline Response: %s", response)



def training_get_list(adapter_instance, project, isCached, isInstance, connections, training_job_id):
    try:
        access_key = connections.get("accessKey", None)
        secret_key = connections.get("secretKey", None)
        region = connections.get("region", None)
        session_token = connections.get("sessionToken", None)
        print(training_job_id)
        import boto3

        if access_key and secret_key and region:
            if session_token:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    aws_session_token=session_token,
                    region_name=region
                )
            else:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )

            s3_client = session.client("s3", verify=False)
            client = session.client("sagemaker", verify=False)

            response = client.describe_training_job(TrainingJobName = training_job_id)

            dataset_info = {
                'sourceID' : training_job_id,
                'container' : response.get('TrainingJobArn', ' '),
                'adapter' : adapter_instance,
                'rawPayload' : json.dumps(response, default = str),
                'syncDate' : response.get('LastModifiedTime'),
                'description': '',
                'project': project,
                'type' : 's3',
                'createdOn' : response.get('CreationTime', ' '),
                'sourceOrg' : '',
                #"createdBy": "admin",
                'name': training_job_id,
                #"modifiedBy": "",
                'id' : response.get('ID'),
                'sourcename' : training_job_id,
                'status': 'Registered',
                #"likes": 0,
                'artifacts':response.get('TrainingJobArn'),
                'deployment': ''
            }
            dataset_info['rawPayload'] = json.dumps(response, default = str)
            return dataset_info, 200
        else:
            logger.info("access key is None")
            return {"error": "You got an error Kindly check the credentials"}
    except Exception as err:
        logger.info(f"Error in deletion of endpoint: {str(err)}")
        return {"error": str(err)},500          
    #logging.info("SageMaker Get Pipeline Response: %s", response)



def training_delete(adapter_instance, project, isCached, isInstance, connections,training_job_id):
    try:
        access_key = connections.get("accessKey", None)
        secret_key = connections.get("secretKey", None)
        region = connections.get("region", None)
        session_token = connections.get("sessionToken", None)

        if access_key and secret_key and region:
            if session_token:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token
                )
            else:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )

            client = session.client("sagemaker")
            response = client.delete_pipeline(PipelineName = training_job_id)
            # for type
            if 'S3' in training_job_id.lower():
                pipeline_type = 'S3'
            else:
                pipeline_type = 'AWSSAGEMAKER'
            

            pipeline_info = {
                'sourceID' : training_job_id,
                'container' : response.get('PipelineArn'),
                'adapter' : adapter_instance,
                'rawPayload' : json.dumps(training_job_id, default = str),
                'syncDate' : response.get('LastModifiedTime'),
                'description': '',
                'project': project,
                'type' : pipeline_type,
                'createdOn' : response.get('CreationTime'), #.strftime('%Y-%m-%d %H-%M-%S'),
                'sourceOrg' : response.get('ExecutionRoleArn'),
                #"createdBy": "admin",
                'name': training_job_id,
                #"modifiedBy": "",
                'id' : '',
                'sourcename' : training_job_id,
                'status':'Registered',
                #"likes": 0,
                'artifacts': response.get('PipelineArn'),
                'deployment': ''
            }
            pipeline_info['rawPayload'] = json.dumps(pipeline_info, default = str)
            return pipeline_info,200
        else:
            pass
    except Exception as err:
        print(err)
    return "",500
    #logging.info("SageMaker Delete Pipeline Response: %s", response)



def projects_inferencePipelines_list_list(adapter_instance, project, isCached, isInstance, connections):
    try:
        access_key = connections.get("accessKey", None)
        secret_key = connections.get("secretKey", None)
        region = connections.get("region", None)
        session_token = connections.get("sessionToken", None)
        if access_key and secret_key and region:
            if session_token:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token
                )
            else:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )

        
                                
            bucket_name = "sagemaker-us-east-1-102586998158"
            key = "ASIARPYVJLWHKKUTVGTP"
            response = s3_client.list_objects(Bucket = bucket_name, MaxKeys = 3)
            arn = f'arn:aws:s3:::{bucket_name}/{key}'

            dataset_dict_info = []
            for obj in response.get('Contents', []):

                dataset_info = {
                    'sourceID' : obj.get('Prefix'),
                    'container' : arn,
                    'adapter' : adapter_instance,
                    'rawPayload' : json.dumps(response, default = str),
                    'syncDate' : obj.get('LastModified'),
                    'description': '',
                    'project': project,
                    'type' : 's3',
                    'createdOn' : obj.get('CreationTime'),
                    'sourceOrg' : '',
                    #"createdBy": "admin",
                    'name': obj.get('Prefix'),
                    #"modifiedBy": "",
                    'id' : obj.get('ID'),
                    'sourcename' : obj.get('Prefix'),
                    'status': 'Registered',
                    #"likes": 0,
                    'artifacts':arn,
                    'deployment': ''
                }
                dataset_info['rawPayload'] = json.dumps(dataset_info, default = str)
                dataset_dict_info.append(dataset_info)
            return dataset_dict_info,200
        else:
            pass
    except Exception as err:
        print(err)
    return "",500
    #logging.info("SageMaker List Inference Pipeline Response: %s", response)



def projects_inferencePipelines_get(adapter_instance, project, isCached, isInstance, connections, inference_job_id):
    try:
        access_key = connections.get("accessKey",None)
        secret_key = connections.get("secretKey",None)
        region = connections.get("region",None)
        session_token = connections.get("sessionToken",None)

        if access_key is not None and secret_key is not None and region is not None:
            if session_token is not None:
                s3_client = boto3.client('s3',aws_access_key_id=access_key,
                                          aws_secret_access_key=secret_key,
                                          region_name=region,
                                          aws_session_token=session_token
                                          )
            else:
                s3_client = boto3.client('s3',aws_access_key_id=access_key,
                                          aws_secret_access_key=secret_key,
                                          region_name=region
                                          )

            logger.info("Dataset get is in progress")
            response = s3_client.head_object(Bucket =  connections.get('bucketName', None),Key = inference_job_id)
            logger.info("Dataset Details")

            dataset_info = {
                'sourceID' : inference_job_id,
                'container' : response.get('Amazon Resource Name'),
                'adapter' : adapter_instance,
                'rawPayload' : json.dumps(response, default = str),
                'syncDate' : response.get('LastModified'),
                'description': 'null',
                'project': project,
                'type' : 's3',
                'createdOn' : response.get('date'),
                'sourceOrg' : 'null',
                #"createdBy": "admin",
                'name': inference_job_id,
                #"modifiedBy": "",
                'id' : response.get('ID'),
                'sourcename' : inference_job_id,
                'status': 'Registered',
                #"likes": 0,
                'artifacts':response.get('Amazon Resource Name'),
                'deployment': 'null'
            }
            dataset_info['rawPayload'] = json.dumps(response, default = str)
            return dataset_info
        else:
            pass
    except Exception as err:
        print(err)
    return ""
    #logging.info("SageMaker Describe Inference Pipeline Response: %s", response)


def projects_inferencePipelines_create(adapter_instance, project, isCached, isInstance, connections, request_body):
    try:
        access_key = connections.get("accessKey", None)
        secret_key = connections.get("secretKey", None)
        region = connections.get("region", None)
        session_token = connections.get("sessionToken", None)
        

        if access_key and secret_key and region:
            if session_token:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    aws_session_token=session_token,
                    region_name=region
                )
            else:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )

            s3_client = session.client("s3", verify=False)
            
            client = session.client("sagemaker",verify=False)

            transform_job_name = request_body.get("TransformJobName", "")
            model_name = request_body.get("ModelName", "")
            model_client_config = request_body.get("ModelClientConfig", "")
            transform_input = request_body.get("TransformInput", "")
            transform_output = request_body.get("TransformOutput", "")
            transform_resources = request_body.get("TransformResources", "")
            data_processing = request_body.get("DataProcessing", "")
            response = client.create_transform_job(TransformJobName = transform_job_name,
                                                ModelName = model_name,
                                                ModelClientConfig = model_client_config,
                                                TransformInput = transform_input,
                                                TransformOutput = transform_output,
                                                TransformResources = transform_resources,
                                                DataProcessing = data_processing )
            # for type
            if 'S3' in transform_job_name.lower():
                pipeline_type = 'S3'
            else:
                pipeline_type = 'AWSSAGEMAKER'
            

            pipeline_info = {
                'sourceID' : transform_job_name,
                'container' : response.get('TransformJobArn'),
                'adapter' : adapter_instance,
                'rawPayload' : json.dumps(transform_job_name, default = str),
                'syncDate' : response.get('LastModifiedTime', 'N/A'),
                'description': '',
                'project': project,
                'type' : pipeline_type,
                'createdOn' : datetime.now().isoformat(), #.strftime('%Y-%m-%d %H-%M-%S'),
                'sourceOrg' : response.get('ExecutionRoleArn', 'N/A'),
                #"createdBy": "admin",
                'name': transform_job_name,
                #"modifiedBy": "",
                'id' : '',
                'sourcename' : transform_job_name,
                'status': 'Registered',
                #"likes": 0,
                'artifacts': response.get('TransformJobArn'),
                'deployment': ''
            }
            pipeline_info['rawPayload'] = json.dumps(pipeline_info, default = str)
            return pipeline_info, 200
        else:
            pass
    except Exception as err:
        print(err)
    return "",500


def cloudconnect(accessKey, secretKey, region):
    try:
        client = boto3.client('sagemaker',aws_access_key_id=accessKey,aws_secret_access_key=secretKey,region_name=region)
        return True
    except Exception as e:
        print(f"An error occurred: {str(e)}")
    return False



if __name__ == "__main__":
  
  #projects_datasets_list_list()

  #projects_datasets_get(bucket_name = "aiplatdata1")

  #dataset_create = projects_datasets_create(bucket_name = 'aiplatdata1oct-1')

  #dataset_delete = projects_datasets_delete(bucket_name = 'aiplatdata1oct-1')

  projects_models_list()

  #model_details=projects_models_get(model_name = 'string20aprilmodel')

  #model_create = projects_models_register_create(primary_container = {"Image" : "683313688378.dkr.ecr.us-east-1.amazonaws.com/sagemaker-sklearn-automl:2.5-1-cpu-py3","ModelDataUrl" : "s3://aiplatdata1/housing04April23/awstraining04April23/data-processor-models/awstraining04April23-dpp1-1-a4ae4b450dcf417a99f80bd2b9ae4140ce1/output/model.tar.gz"},execution_role_arn = 'arn:aws:iam::451256804668:role/service-role/A2ISageMaker-ExecutionRole-20220613T035320',model_name = 'stringMode25sept-10')

  #model_delete = projects_models_delete(model_name = 'stringMode25sept-10')

  #list_endpoints = projects_endpoints_list_list()

  #get_endpoint = projects_endpoints_get(endpoint_name = 'stringEndPoint21Sep1')

  #create_endpoint = projects_endpoints_create(endpoint_name = 'stringEndPoint3oct-1', endpoint_config_name = 'script-container-config-serverless2022-12-08-23-11-02')

  #delete_endpoint = projects_endpoints_delete(endpoint_name = "stringEndPoint3oct-1")

  #pipeline_list = list_Pipeline()

  #pipeline_create = create_pipeline(pipeline_name = 'string27sep2', pipeline_definition = "{\"Version\": \"2020-12-01\", \"Metadata\": {}, \"Parameters\": [{\"Name\": \"ProcessingInstanceCount\", \"Type\": \"Integer\", \"DefaultValue\": 1}, {\"Name\": \"TrainingInstanceType\", \"Type\": \"String\", \"DefaultValue\": \"ml.m5.xlarge\"}, {\"Name\": \"ModelApprovalStatus\", \"Type\": \"String\", \"DefaultValue\": \"PendingManualApproval\"}, {\"Name\": \"InputData\", \"Type\": \"String\", \"DefaultValue\": \"s3://sagemaker-us-east-1-451256804668/abalone/abalone-dataset.csv\"}, {\"Name\": \"BatchData\", \"Type\": \"String\", \"DefaultValue\": \"s3://sagemaker-us-east-1-451256804668/abalone/abalone-dataset-batch\"}, {\"Name\": \"MseThreshold\", \"Type\": \"Float\", \"DefaultValue\": 6.0}], \"PipelineExperimentConfig\": {\"ExperimentName\": {\"Get\": \"Execution.PipelineName\"}, \"TrialName\": {\"Get\": \"Execution.PipelineExecutionId\"}}, \"Steps\": [{\"Name\": \"AbaloneProcess\", \"Type\": \"Processing\", \"Arguments\": {\"ProcessingResources\": {\"ClusterConfig\": {\"InstanceType\": \"ml.m5.xlarge\", \"InstanceCount\": {\"Get\": \"Parameters.ProcessingInstanceCount\"}, \"VolumeSizeInGB\": 30}}, \"AppSpecification\": {\"ImageUri\": \"683313688378.dkr.ecr.us-east-1.amazonaws.com/sagemaker-scikit-learn:1.2-1-cpu-py3\", \"ContainerEntrypoint\": [\"python3\", \"/opt/ml/processing/input/code/preprocessing.py\"]}, \"RoleArn\": \"arn:aws:iam::451256804668:role/aiplat\", \"ProcessingInputs\": [{\"InputName\": \"input-1\", \"AppManaged\": false, \"S3Input\": {\"S3Uri\": {\"Get\": \"Parameters.InputData\"}, \"LocalPath\": \"/opt/ml/processing/input\", \"S3DataType\": \"S3Prefix\", \"S3InputMode\": \"File\", \"S3DataDistributionType\": \"FullyReplicated\", \"S3CompressionType\": \"None\"}}, {\"InputName\": \"code\", \"AppManaged\": false, \"S3Input\": {\"S3Uri\": \"s3://sagemaker-us-east-1-451256804668/AbalonePipeline/code/6c16bff3da7c21ecd2b5fec3db907a9e/preprocessing.py\", \"LocalPath\": \"/opt/ml/processing/input/code\", \"S3DataType\": \"S3Prefix\", \"S3InputMode\": \"File\", \"S3DataDistributionType\": \"FullyReplicated\", \"S3CompressionType\": \"None\"}}], \"ProcessingOutputConfig\": {\"Outputs\": [{\"OutputName\": \"train\", \"AppManaged\": false, \"S3Output\": {\"S3Uri\": {\"Std:Join\": {\"On\": \"/\", \"Values\": [\"s3:/\", \"sagemaker-us-east-1-451256804668\", \"AbalonePipeline\", {\"Get\": \"Execution.PipelineExecutionId\"}, \"AbaloneProcess\", \"output\", \"train\"]}}, \"LocalPath\": \"/opt/ml/processing/train\", \"S3UploadMode\": \"EndOfJob\"}}, {\"OutputName\": \"validation\", \"AppManaged\": false, \"S3Output\": {\"S3Uri\": {\"Std:Join\": {\"On\": \"/\", \"Values\": [\"s3:/\", \"sagemaker-us-east-1-451256804668\", \"AbalonePipeline\", {\"Get\": \"Execution.PipelineExecutionId\"}, \"AbaloneProcess\", \"output\", \"validation\"]}}, \"LocalPath\": \"/opt/ml/processing/validation\", \"S3UploadMode\": \"EndOfJob\"}}, {\"OutputName\": \"test\", \"AppManaged\": false, \"S3Output\": {\"S3Uri\": {\"Std:Join\": {\"On\": \"/\", \"Values\": [\"s3:/\", \"sagemaker-us-east-1-451256804668\", \"AbalonePipeline\", {\"Get\": \"Execution.PipelineExecutionId\"}, \"AbaloneProcess\", \"output\", \"test\"]}}, \"LocalPath\": \"/opt/ml/processing/test\", \"S3UploadMode\": \"EndOfJob\"}}]}}}, {\"Name\": \"AbaloneTrain\", \"Type\": \"Training\", \"Arguments\": {\"AlgorithmSpecification\": {\"TrainingInputMode\": \"File\", \"TrainingImage\": \"683313688378.dkr.ecr.us-east-1.amazonaws.com/sagemaker-xgboost:1.0-1-cpu-py3\"}, \"OutputDataConfig\": {\"S3OutputPath\": \"s3://sagemaker-us-east-1-451256804668/AbaloneTrain\"}, \"StoppingCondition\": {\"MaxRuntimeInSeconds\": 86400}, \"ResourceConfig\": {\"VolumeSizeInGB\": 30, \"InstanceCount\": 1, \"InstanceType\": {\"Get\": \"Parameters.TrainingInstanceType\"}}, \"RoleArn\": \"arn:aws:iam::451256804668:role/aiplat\", \"InputDataConfig\": [{\"DataSource\": {\"S3DataSource\": {\"S3DataType\": \"S3Prefix\", \"S3Uri\": {\"Get\": \"Steps.AbaloneProcess.ProcessingOutputConfig.Outputs['train'].S3Output.S3Uri\"}, \"S3DataDistributionType\": \"FullyReplicated\"}}, \"ContentType\": \"text/csv\", \"ChannelName\": \"train\"}, {\"DataSource\": {\"S3DataSource\": {\"S3DataType\": \"S3Prefix\", \"S3Uri\": {\"Get\": \"Steps.AbaloneProcess.ProcessingOutputConfig.Outputs['validation'].S3Output.S3Uri\"}, \"S3DataDistributionType\": \"FullyReplicated\"}}, \"ContentType\": \"text/csv\", \"ChannelName\": \"validation\"}], \"HyperParameters\": {\"objective\": \"reg:linear\", \"num_round\": \"50\", \"max_depth\": \"5\", \"eta\": \"0.2\", \"gamma\": \"4\", \"min_child_weight\": \"6\", \"subsample\": \"0.7\"}, \"DebugHookConfig\": {\"S3OutputPath\": \"s3://sagemaker-us-east-1-451256804668/AbaloneTrain\", \"CollectionConfigurations\": []}, \"ProfilerConfig\": {\"S3OutputPath\": \"s3://sagemaker-us-east-1-451256804668/AbaloneTrain\", \"DisableProfiler\": false}}}, {\"Name\": \"AbaloneEval\", \"Type\": \"Processing\", \"Arguments\": {\"ProcessingResources\": {\"ClusterConfig\": {\"InstanceType\": \"ml.m5.xlarge\", \"InstanceCount\": 1, \"VolumeSizeInGB\": 30}}, \"AppSpecification\": {\"ImageUri\": \"683313688378.dkr.ecr.us-east-1.amazonaws.com/sagemaker-xgboost:1.0-1-cpu-py3\", \"ContainerEntrypoint\": [\"python3\", \"/opt/ml/processing/input/code/evaluation.py\"]}, \"RoleArn\": \"arn:aws:iam::451256804668:role/aiplat\", \"ProcessingInputs\": [{\"InputName\": \"input-1\", \"AppManaged\": false, \"S3Input\": {\"S3Uri\": {\"Get\": \"Steps.AbaloneTrain.ModelArtifacts.S3ModelArtifacts\"}, \"LocalPath\": \"/opt/ml/processing/model\", \"S3DataType\": \"S3Prefix\", \"S3InputMode\": \"File\", \"S3DataDistributionType\": \"FullyReplicated\", \"S3CompressionType\": \"None\"}}, {\"InputName\": \"input-2\", \"AppManaged\": false, \"S3Input\": {\"S3Uri\": {\"Get\": \"Steps.AbaloneProcess.ProcessingOutputConfig.Outputs['test'].S3Output.S3Uri\"}, \"LocalPath\": \"/opt/ml/processing/test\", \"S3DataType\": \"S3Prefix\", \"S3InputMode\": \"File\", \"S3DataDistributionType\": \"FullyReplicated\", \"S3CompressionType\": \"None\"}}, {\"InputName\": \"code\", \"AppManaged\": false, \"S3Input\": {\"S3Uri\": \"s3://sagemaker-us-east-1-451256804668/AbalonePipeline/code/1b60a7c7d5c90dbebe83ffb30ff7deae/evaluation.py\", \"LocalPath\": \"/opt/ml/processing/input/code\", \"S3DataType\": \"S3Prefix\", \"S3InputMode\": \"File\", \"S3DataDistributionType\": \"FullyReplicated\", \"S3CompressionType\": \"None\"}}], \"ProcessingOutputConfig\": {\"Outputs\": [{\"OutputName\": \"evaluation\", \"AppManaged\": false, \"S3Output\": {\"S3Uri\": \"s3://sagemaker-us-east-1-451256804668/script-abalone-eval-2023-04-24-05-58-11-640/output/evaluation\", \"LocalPath\": \"/opt/ml/processing/evaluation\", \"S3UploadMode\": \"EndOfJob\"}}]}}, \"PropertyFiles\": [{\"PropertyFileName\": \"EvaluationReport\", \"OutputName\": \"evaluation\", \"FilePath\": \"evaluation.json\"}]}, {\"Name\": \"AbaloneMSECond\", \"Type\": \"Condition\", \"Arguments\": {\"Conditions\": [{\"Type\": \"LessThanOrEqualTo\", \"LeftValue\": {\"Std:JsonGet\": {\"PropertyFile\": {\"Get\": \"Steps.AbaloneEval.PropertyFiles.EvaluationReport\"}, \"Path\": \"regression_metrics.mse.value\"}}, \"RightValue\": {\"Get\": \"Parameters.MseThreshold\"}}], \"IfSteps\": [{\"Name\": \"AbaloneRegisterModel-RegisterModel\", \"Type\": \"RegisterModel\", \"Arguments\": {\"ModelPackageGroupName\": \"AbaloneModelPackageGroupName\", \"ModelMetrics\": {\"ModelQuality\": {\"Statistics\": {\"ContentType\": \"application/json\", \"S3Uri\": \"s3://sagemaker-us-east-1-451256804668/script-abalone-eval-2023-04-24-05-58-11-640/output/evaluation/evaluation.json\"}}, \"Bias\": {}, \"Explainability\": {}}, \"InferenceSpecification\": {\"Containers\": [{\"Image\": \"683313688378.dkr.ecr.us-east-1.amazonaws.com/sagemaker-xgboost:1.0-1-cpu-py3\", \"Environment\": {}, \"ModelDataUrl\": {\"Get\": \"Steps.AbaloneTrain.ModelArtifacts.S3ModelArtifacts\"}}], \"SupportedContentTypes\": [\"text/csv\"], \"SupportedResponseMIMETypes\": [\"text/csv\"], \"SupportedRealtimeInferenceInstanceTypes\": [\"ml.t2.medium\", \"ml.m5.xlarge\"], \"SupportedTransformInstanceTypes\": [\"ml.m5.xlarge\"]}, \"ModelApprovalStatus\": {\"Get\": \"Parameters.ModelApprovalStatus\"}}}, {\"Name\": \"AbaloneCreateModel-CreateModel\", \"Type\": \"Model\", \"Arguments\": {\"ExecutionRoleArn\": \"arn:aws:iam::451256804668:role/aiplat\", \"PrimaryContainer\": {\"Image\": \"683313688378.dkr.ecr.us-east-1.amazonaws.com/sagemaker-xgboost:1.0-1-cpu-py3\", \"Environment\": {}, \"ModelDataUrl\": {\"Get\": \"Steps.AbaloneTrain.ModelArtifacts.S3ModelArtifacts\"}}}}, {\"Name\": \"AbaloneTransform\", \"Type\": \"Transform\", \"Arguments\": {\"ModelName\": {\"Get\": \"Steps.AbaloneCreateModel-CreateModel.ModelName\"}, \"TransformInput\": {\"DataSource\": {\"S3DataSource\": {\"S3DataType\": \"S3Prefix\", \"S3Uri\": {\"Get\": \"Parameters.BatchData\"}}}}, \"TransformOutput\": {\"S3OutputPath\": \"s3://sagemaker-us-east-1-451256804668/AbaloneTransform\"}, \"TransformResources\": {\"InstanceCount\": 1, \"InstanceType\": \"ml.m5.xlarge\"}}}], \"ElseSteps\": [{\"Name\": \"AbaloneMSEFail\", \"Type\": \"Fail\", \"Arguments\": {\"ErrorMessage\": {\"Std:Join\": {\"On\": \" \", \"Values\": [\"Execution failed due to MSE >\", {\"Get\": \"Parameters.MseThreshold\"}]}}}}]}}]}"
   #, role_arn = 'arn:aws:iam::451256804668:role/service-role/A2ISageMaker-ExecutionRole-20220613T035320')

  #pipeline_describe = describe_pipeline(pipeline_name = 'string26sep3')

  #client =cloudconnect(access_key = 'AKIAWSEIAMU6H5SKF2E2', secret_key = '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', region= 'us-east-1')
