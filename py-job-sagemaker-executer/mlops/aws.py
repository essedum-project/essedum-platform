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
# ...existing code...
# Add AWS endpoints to no_proxy
os.environ['no_proxy'] = f"{NOPROXY},*.amazonaws.com,s3.amazonaws.com,sagemaker.us-east-1.amazonaws.com"
# ...existing code...

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
file_handler = logging.FileHandler('logfile.log')
formatter = logging.Formatter('%(asctime)s : %(levelname)s : %(name)s : %(message)s')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)



def projects_datasets_list_list(adapter_instance, project, isCached, isInstance, connections):
    logger.info(f"Inside projects_datasets_list_list function :")
    try:
        access_key = connections.get("accessKey")
        secret_key = connections.get("secretKey")
        region = connections.get("region")
        session_token = connections.get("sessionToken")

        logger.info(f"Starting projects_datasets_create with Ak:{access_key}")
        config = Config(
                proxies={
                    'http': PROXY,
                    'https': PROXY
                },
                retries={'max_attempts': 3},
                connect_timeout=60,
                read_timeout=60
            )
        if access_key and secret_key and region:
            if session_token:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token,
                    config=config
                )
            else:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    config=config
                )
            
            
            
            try:
                buckets_response = s3_client.list_buckets()
                logger.info(f"Listing datasets from S3 bucket: {json.dumps(buckets_response, default=str)}")
            except Exception as e:
                logger.error(f"Failed to list S3 buckets: {str(e)}")
            response = s3_client.list_objects(Bucket = connections.get('bucketName', None), MaxKeys = 4)
            
            

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
        config = Config(
                proxies={
                    'http': PROXY,
                    'https': PROXY
                },
                retries={'max_attempts': 3},
                connect_timeout=60,
                read_timeout=60
            )
        if access_key and secret_key and region:
            if session_token:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token,
                    config=config
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
# def projects_datasets_create(adapter_instance, project, isCached, isInstance, connections, request_body):
#     try:
#         access_key = connections.get("accessKey",None)
#         secret_key = connections.get("secretKey",None)
#         region = connections.get("region",None)
#         session_token = connections.get("sessionToken",None)
#         config = Config(
#                 proxies={
#                     'http': PROXY,
#                     'https': PROXY
#                 },
#                 retries={'max_attempts': 3},
#                 connect_timeout=60,
#                 read_timeout=60
#             )
#         if access_key and secret_key and region:
#             if session_token:
#                 s3_client = boto3.client(
#                     's3',
#                     aws_access_key_id=access_key,
#                     aws_secret_access_key=secret_key,
#                     region_name=region,
#                     aws_session_token=session_token,
#                     config=config
#                 )
#             else:
#                 s3_client = boto3.client(
#                     's3',
#                     aws_access_key_id=access_key,
#                     aws_secret_access_key=secret_key,
#                     region_name=region,
#                     config=config
#                 )
#             logger.info("**************")
#             logger.info(request_body)
#             data = pd.read_csv(request_body.get("local_dataset_path"))
#             s3_key = request_body.get("Key")
#             bucket = request_body.get("Bucket")
#             response = s3_client.put_object(Body = data.to_csv(index = False), Bucket = bucket, Key = s3_key)
            



#             short_uuid = str(uuid.uuid4()).replace('-', '')[:10]

#             dataset_info = {
#                 'sourceID' : s3_key,
#                 'container' : response.get('Amazon Resource Name'),
#                 'adapter' : adapter_instance,
#                 'rawPayload' : json.dumps(response, default = str),
#                 'syncDate' : response.get('Last modified'),
#                 'description': '',
#                 'project': project,
#                 'type' : 's3',
#                 'createdOn' : response.get('date', 'N/A'),
#                 'sourceOrg' : '',
#                 #"createdBy": "admin",
#                 'name': s3_key,
#                 #"modifiedBy": "",
#                 'id' : short_uuid,
#                 'sourcename' : s3_key,
#                 'status': 'Registered',
#                 #"likes": 0,
#                 'artifacts':response.get('Amazon Resource Name'),
#                 'deployment': ''
#             }
#             dataset_info['rawPayload'] = json.dumps(dataset_info, default = str)
#             return dataset_info, 200
#         else:
#             pass
#     except Exception as err:
#         print(err)
#     return "",500
#     #logging.info("s3 Dataset Create Response: %s", str(response))
from flask import request
def projects_datasets_create(adapter_instance, project, isCached, isInstance, connections, request_body):
    try:
        access_key = connections.get("accessKey", None)
        secret_key = connections.get("secretKey", None)
        region = connections.get("region", None)
        session_token = connections.get("sessionToken", None)
        
        # Increase timeout values to handle large file uploads
        config = Config(
            proxies={
                'http': PROXY,
                'https': PROXY
            },
            retries={'max_attempts': 3, 'mode': 'adaptive'},
            connect_timeout=120,  # Increased from 60
            read_timeout=300,     # Increased from 60 for large file uploads
            max_pool_connections=50
        )
        
        if access_key and secret_key and region:
            if session_token:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token,
                    config=config
                )
            else:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    config=config
                )
            
            logger.info("Starting dataset upload process")
            logger.info(f"Request body: {request_body}")
            
            # Validate required parameters
        bucket = request_body.get("Bucket")
        s3_key = request_body.get("Key")

        if not all([bucket, s3_key]):
            logger.error("Missing required parameters: Bucket or Key")
            return {"error": "Missing required parameters"}, 400

        # Try to get file from request (multipart/form-data)
        uploaded_file = request.files.get('file')
        if uploaded_file:
            try:
                data = pd.read_csv(uploaded_file)
                logger.info(f"Successfully read uploaded CSV file")
            except Exception as csv_err:
                logger.error(f"Error reading uploaded CSV file: {str(csv_err)}")
                return {"error": f"Error reading uploaded CSV file: {str(csv_err)}"}, 400
        else:
            # Fallback to local path
            local_dataset_path = request_body.get("local_dataset_path")
            if not local_dataset_path or not os.path.exists(local_dataset_path):
                logger.error(f"File not found: {local_dataset_path}")
                return {"error": f"File not found: {local_dataset_path}"}, 404
            try:
                data = pd.read_csv(local_dataset_path)
                logger.info(f"Successfully read local CSV file with {len(data)} rows")
            except Exception as csv_err:
                logger.error(f"Error reading local CSV file: {str(csv_err)}")
                return {"error": f"Error reading local CSV file: {str(csv_err)}"}, 400

        csv_data = data.to_csv(index=False)
        file_size = len(csv_data.encode('utf-8'))
        logger.info(f"File size: {file_size} bytes")

        try:
            if file_size > 5 * 1024 * 1024:
                logger.info("Using multipart upload for large file")
                response = s3_client.create_multipart_upload(Bucket=bucket, Key=s3_key)
                upload_id = response['UploadId']
                chunk_size = 5 * 1024 * 1024
                parts = []
                part_number = 1

                for i in range(0, len(csv_data), chunk_size):
                    chunk = csv_data[i:i + chunk_size]
                    part_response = s3_client.upload_part(
                        Bucket=bucket,
                        Key=s3_key,
                        PartNumber=part_number,
                        UploadId=upload_id,
                        Body=chunk.encode('utf-8')
                    )
                    parts.append({'ETag': part_response['ETag'], 'PartNumber': part_number})
                    part_number += 1

                response = s3_client.complete_multipart_upload(
                    Bucket=bucket,
                    Key=s3_key,
                    UploadId=upload_id,
                    MultipartUpload={'Parts': parts}
                )
                logger.info("Multipart upload completed successfully")
            else:
                s3_client.put_object(
                    Body=csv_data.encode('utf-8'),
                    Bucket=bucket,
                    Key=s3_key,
                    ContentType='text/csv'
                )
                logger.info("Regular upload completed successfully")
        except Exception as upload_err:
            logger.error(f"Upload failed: {str(upload_err)}")
            if 'upload_id' in locals():
                try:
                    s3_client.abort_multipart_upload(Bucket=bucket, Key=s3_key, UploadId=upload_id)
                except:
                    pass
            return {"error": f"Upload failed: {str(upload_err)}"}, 500

        short_uuid = str(uuid.uuid4()).replace('-', '')[:10]
        s3_arn = f"arn:aws:s3:::{bucket}/{s3_key}"
        current_time = datetime.now().isoformat()

        dataset_info = {
            'sourceID': s3_key,
            'container': s3_arn,
            'adapter': adapter_instance,
            'rawPayload': json.dumps(response, default=str),
            'syncDate': current_time,
            'description': '',
            'project': project,
            'type': 's3',
            'createdOn': current_time,
            'sourceOrg': '',
            'name': s3_key,
            'id': short_uuid,
            'sourcename': s3_key,
            'status': 'Registered',
            'artifacts': s3_arn,
            'deployment': ''
        }

        dataset_info['rawPayload'] = json.dumps(dataset_info, default=str)
        logger.info("Dataset created successfully")
        return dataset_info, 200

    except Exception as err:
        logger.error(f"Error in projects_datasets_create: {str(err)}")
        exc_trace = traceback.format_exc()
        logger.error(f"Full traceback: {exc_trace}")
        return {"error": str(err)}, 500



def projects_datasets_delete(adapter_instance, project, isCached, isInstance, connections,dataset_id):
    try:
        access_key = connections.get("accessKey",None)
        secret_key = connections.get("secretKey",None)
        region = connections.get("region",None)
        session_token = connections.get("sessionToken",None)
        config = Config(
                proxies={
                    'http': PROXY,
                    'https': PROXY
                },
                retries={'max_attempts': 3},
                connect_timeout=60,
                read_timeout=60
            )

        if access_key and secret_key and region:
            if session_token:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token,
                    config=config
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
        config = Config(
                proxies={
                    'http': PROXY,
                    'https': PROXY
                },
                retries={'max_attempts': 3},
                connect_timeout=60,
                read_timeout=60
            )
        
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
            client = session.client("sagemaker",region_name='us-east-1', verify=False, config=config)
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
        config = Config(
                proxies={
                    'http': PROXY,
                    'https': PROXY
                },
                retries={'max_attempts': 3},
                connect_timeout=60,
                read_timeout=60
            )
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

        
       
            client = session.client("sagemaker", verify=False, config=config)
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
        config = Config(
                proxies={
                    'http': PROXY,
                    'https': PROXY
                },
                retries={'max_attempts': 3},
                connect_timeout=60,
                read_timeout=60
            )

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
            client = session.client("sagemaker",region_name="us-east-1",verify=False, config=config)
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
        config = Config(
                proxies={
                    'http': PROXY,
                    'https': PROXY
                },
                retries={'max_attempts': 3},
                connect_timeout=60,
                read_timeout=60
            )

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
            client = session.client("sagemaker",region_name="us-east-1",verify=False, config=config)
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
        config = Config(
                proxies={
                    'http': PROXY,
                    'https': PROXY
                },
                retries={'max_attempts': 3},
                connect_timeout=60,
                read_timeout=60
            )
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
            client = session.client("sagemaker", region_name='us-east-1', verify=False, config=config)
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
        config = Config(
                proxies={
                    'http': PROXY,
                    'https': PROXY
                },
                retries={'max_attempts': 3},
                connect_timeout=60,
                read_timeout=60
            )

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

            client = session.client("sagemaker",verify=False, config=config)
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
        config = Config(
                proxies={
                    'http': PROXY,
                    'https': PROXY
                },
                retries={'max_attempts': 3},
                connect_timeout=60,
                read_timeout=60
            )

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

            client = session.client("sagemaker",verify=False, config=config)

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
        config = Config(
                proxies={
                    'http': PROXY,
                    'https': PROXY
                },
                retries={'max_attempts': 3},
                connect_timeout=60,
                read_timeout=60
            )

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
            client = session.client("sagemaker",verify=False, config=config)
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
        config = Config(
                proxies={
                    'http': PROXY,
                    'https': PROXY
                },
                retries={'max_attempts': 3},
                connect_timeout=60,
                read_timeout=60
            )

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
            sagemaker = session.client("sagemaker",verify=False, config=config)
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
        config = Config(
            proxies={
                'http': PROXY,
                'https': PROXY
            },
            retries={'max_attempts': 3},
            connect_timeout=60,
            read_timeout=60
        )

        if access_key and secret_key and region:
            if session_token:
                sagemaker_runtime = boto3.client(
                    service_name='sagemaker-runtime',
                    region_name=region,
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    aws_session_token=session_token,
                    config=config,
                    verify=False
                )
            else:
                sagemaker_runtime = boto3.client(
                    service_name='sagemaker-runtime',
                    region_name=region,
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    config=config,
                    verify=False
                )

            logger.info(f"Request body: {request_body}")
            
            # Check if request contains S3Uri (existing logic) or direct data
            if 'S3Uri' in request_body:
                # Existing S3 data logic
                s3_uri = request_body['S3Uri']
                logger.info(f"Processing S3 URI: {s3_uri}")
                
                o = urlparse(s3_uri, allow_fragments=False)
                bucket = o.netloc.split('.')[0]
                key = o.path.lstrip('/')

                if session_token:
                    s3_client = boto3.client(
                        's3',
                        aws_access_key_id=access_key,
                        aws_secret_access_key=secret_key,
                        region_name=region,
                        aws_session_token=session_token,
                        config=config,
                        verify=False
                    )
                else:
                    s3_client = boto3.client(
                        's3',
                        aws_access_key_id=access_key,
                        aws_secret_access_key=secret_key,
                        region_name=region,
                        config=config,
                        verify=False
                    )

                result = s3_client.list_objects(Bucket=bucket, Prefix=key)
                extension = key.split('.')[-1]
                
                for obj in result.get('Contents', []):
                    data = s3_client.get_object(Bucket=bucket, Key=obj.get('Key'))
                    contents = data['Body'].read()
                    
                    if extension == 'csv':
                        contents = str(contents, 'utf-8')
                        contents = io.StringIO(contents)
                        dataset = pd.read_csv(contents)
                        # Convert to CSV for inference
                        payload = dataset.to_csv(index=False, header=False).encode('utf-8')
                        content_type = 'text/csv'
                    elif extension == 'json':
                        dataset = json.loads(contents.decode('utf-8'))
                        payload = json.dumps(dataset).encode('utf-8')
                        content_type = 'application/json'
                    else:
                        payload = contents
                        content_type = 'text/plain'
            else:
                # Direct data inference (new logic)
                logger.info("Processing direct inference data")
                
                # Support both dict and list of dicts
                if isinstance(request_body, dict):
                    payload = json.dumps(request_body).encode('utf-8')
                elif isinstance(request_body, list):
                    payload = json.dumps(request_body).encode('utf-8')
                else:
                    payload = str(request_body).encode('utf-8')
                
                content_type = 'application/json'
            
            logger.info(f"Invoking endpoint: {endpoint_id} with content type: {content_type}")
            
            # Invoke endpoint
            response = sagemaker_runtime.invoke_endpoint(
                EndpointName=endpoint_id,
                Body=payload,
                ContentType=content_type,
                
            )
            
            logger.info("Endpoint invoked successfully")
            output_body = response['Body'].read().decode('utf-8', errors='replace')
            logger.info(f"Raw response: {output_body}")
            
            # Parse response based on content type
            try:
                # Try JSON first
                result = json.loads(output_body)
                return json.dumps(result), 200
            except json.JSONDecodeError:
                # Fall back to CSV parsing
                try:
                    out = pd.read_csv(io.StringIO(output_body), header=None)
                    out = out.transpose()
                    json_str = out.to_json(orient='records')
                    return json_str, 200
                except Exception as csv_err:
                    logger.warning(f"CSV parsing failed: {csv_err}, returning raw output")
                    return output_body, 200
        else:
            logger.error("Missing AWS credentials")
            return json.dumps({"error": "Missing AWS credentials"}), 400
        
    except Exception as err:
        logger.error(f"Error in inference: {str(err)}", exc_info=True)
        return json.dumps({"error": str(err)}), 500



def training_istlist(adapter_instance, project, isCached, isInstance, connections):
    try:
        access_key = connections.get("accessKey", None)
        secret_key = connections.get("secretKey", None)
        region = connections.get("region", None)
        session_token = connections.get("sessionToken", None)
        config = Config(
                proxies={
                    'http': PROXY,
                    'https': PROXY
                },
                retries={'max_attempts': 3},
                connect_timeout=60,
                read_timeout=60
            )

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

            client = session.client("sagemaker",region_name="us-east-1",verify=False, config=config)
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
        config = Config(
                proxies={
                    'http': PROXY,
                    'https': PROXY
                },
                retries={'max_attempts': 3},
                connect_timeout=60,
                read_timeout=60
            )

        if access_key and secret_key and region:
            if session_token:
                sagemaker_session = sagemaker.Session(boto_session = boto3.Session(aws_access_key_id=connections.get("accessKey"),
                                aws_secret_access_key=connections.get("secretKey"),
                                region_name=connections.get("region"),
                                aws_session_token=session_token,
                                config=config
                                ))
            else:
                sagemaker_session = sagemaker.Session(boto_session = boto3.Session(aws_access_key_id=connections.get("accessKey"),
                                aws_secret_access_key=connections.get("secretKey"),
                                region_name=connections.get("region"),
                                config=config
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
        config = Config(
                proxies={
                    'http': PROXY,
                    'https': PROXY
                },
                retries={'max_attempts': 3},
                connect_timeout=60,
                read_timeout=60
            )

        if access_key and secret_key and region:
            if session_token:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    aws_session_token=session_token,
                    region_name=region,
                    config=config
                )
            else:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    config=config
                )

            s3_client = session.client("s3", verify=False, config=config)
            client = session.client("sagemaker", verify=False, config=config)

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
        config = Config(
                proxies={
                    'http': PROXY,
                    'https': PROXY
                },
                retries={'max_attempts': 3},
                connect_timeout=60,
                read_timeout=60
            )

        if access_key and secret_key and region:
            if session_token:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token,
                    config=config
                )
            else:
                session = boto3.Session(
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region
                )

            client = session.client("sagemaker",verify=False, config=config)
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
        config = Config(
                proxies={
                    'http': PROXY,
                    'https': PROXY
                },
                retries={'max_attempts': 3},
                connect_timeout=60,
                read_timeout=60
            )
        if access_key and secret_key and region:
            if session_token:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    aws_session_token=session_token,
                    config=config  # Added missing config parameter
                )
            else:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                    config=config  # Added missing config parameter
                )

            # Use bucket name from connections instead of hardcoded value
            bucket_name = 'sagemaker-us-east-1-102586998158'
            
            try:
                response = s3_client.list_objects(Bucket=bucket_name, MaxKeys=10)
                logger.info(f"Listed inference pipeline objects from S3 bucket: {bucket_name}")
            except Exception as e:
                logger.error(f"Failed to list S3 objects: {str(e)}")
                return {"error": f"Failed to access bucket {bucket_name}: {str(e)}"}, 500

            dataset_dict_info = []
            for obj in response.get('Contents', []):
                # Use proper S3 object key instead of Prefix
                s3_key = obj.get('Key', '')
                arn = f'arn:aws:s3:::{bucket_name}/{s3_key}'

                dataset_info = {
                    'sourceID': s3_key,  # Use Key instead of Prefix
                    'container': arn,
                    'adapter': adapter_instance,
                    'rawPayload': json.dumps(obj, default=str),  # Use individual object data
                    'syncDate': obj.get('LastModified'),
                    'description': '',
                    'project': project,
                    'type': 's3',
                    'createdOn': obj.get('LastModified'),  # S3 objects don't have CreationTime
                    'sourceOrg': '',
                    'name': s3_key.split('/')[-1] if s3_key else '',  # Get filename from key
                    'id': s3_key,  # Use key as ID since S3 objects don't have separate ID
                    'sourcename': s3_key,
                    'status': 'Registered',
                    'artifacts': arn,
                    'deployment': ''
                }
                dataset_info['rawPayload'] = json.dumps(dataset_info, default=str)
                dataset_dict_info.append(dataset_info)
            
            return dataset_dict_info, 200
        else:
            logger.warning("Missing required AWS credentials")
            return {"error": "Missing AWS credentials (accessKey, secretKey, or region)"}, 400
    except Exception as err:
        logger.error(f"Error in projects_inferencePipelines_list_list: {str(err)}")
        return {"error": str(err)}, 500



def projects_inferencePipelines_get(adapter_instance, project, isCached, isInstance, connections, inference_job_id):
    try:
        access_key = connections.get("accessKey",None)
        secret_key = connections.get("secretKey",None)
        region = connections.get("region",None)
        session_token = connections.get("sessionToken",None)
        config = Config(
        proxies={
            'http': PROXY,
            'https': PROXY
        },
        retries={'max_attempts': 3},
        connect_timeout=60,
        read_timeout=60
    )

        if access_key is not None and secret_key is not None and region is not None:
            if session_token is not None:
                s3_client = boto3.client('s3',aws_access_key_id=access_key,
                                          aws_secret_access_key=secret_key,
                                          region_name=region,
                                          aws_session_token=session_token,
                                          config=config
                                          )
            else:
                s3_client = boto3.client('s3',aws_access_key_id=access_key,
                                          aws_secret_access_key=secret_key,
                                          region_name=region,
                                          config=config
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
        config = Config(
        proxies={
            'http': PROXY,
            'https': PROXY
        },
        retries={'max_attempts': 3},
        connect_timeout=60,
        read_timeout=60
    )
        

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
                    region_name=region,
                    
                )

            s3_client = session.client("s3", verify=False)

            client = session.client("sagemaker",verify=False, config=config)

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


import boto3
import logging
from botocore.exceptions import ClientError
import time
from datetime import datetime

logger = logging.getLogger(__name__)

def training_automl_simplified_create(adapter_instance, project, isCached, isInstance, connections, request_body):
    """
    Create and start an AutoML training job using Amazon SageMaker Autopilot
    
    Args:
        adapter_instance: Adapter instance identifier
        project: Project identifier
        isCached: Cache flag
        isInstance: Instance flag
        connections: Connection details containing AWS credentials
        request_body: Dictionary containing AutoML configuration
        
    Expected request_body format:
    {
        "job_name": "automl-job-name",
        "input_data_config": {
            "s3_uri": "s3://bucket/path/to/training/data.csv",
            "content_type": "text/csv"
        },
        "output_data_config": {
            "s3_output_path": "s3://bucket/path/to/output"
        },
        "target_attribute_name": "target_column_name",
        "problem_type": "Regression|BinaryClassification|MulticlassClassification",
        "objective": {
            "metric_name": "Accuracy|MSE|F1|AUC|...",
        },
        "registered_model_name": "my-registered-model",  # NEW: Use specific registered model
        "model_id": "arn:aws:sagemaker:region:account:model/model-name",  # NEW: Model ARN to use
        "algorithm_preference": ["xgboost", "linear-learner"],  # NEW: Specify algorithms
        "max_candidates": 10,
        "max_runtime_per_training_job_in_seconds": 86400,
        "total_job_runtime_in_seconds": 2592000,
        "role_arn": "arn:aws:iam::account-id:role/service-role",
        "generate_candidate_definitions_only": false,  # NEW: Only generate candidates without training
        "mode": "AUTO|ENSEMBLING|HYPERPARAMETER_TUNING",  # NEW: Training mode
        "tags": [
            {"Key": "project", "Value": "ml-project"}
        ]
    }
    
    Returns:
        tuple: (result_dict, status_code)
    """
    try:
        logger.info(f"Starting AutoML job creation for project: {project}")
        
        # Extract AWS credentials from connections
        region =  connections.get("region",None)
        aws_access_key = connections.get("accessKey",None)
        aws_secret_key = connections.get("secretKey",None)
        session_token = connections.get("sessionToken",None)
        role_arn = connections.get("role_arn",None)
        config = Config(
        proxies={
            'http': PROXY,
            'https': PROXY
        },
        retries={'max_attempts': 3},
        connect_timeout=60,
        read_timeout=60
    )
        
        # Create SageMaker client
        session_config = {
            "region_name": region
        }
        
        if aws_access_key and aws_secret_key:
            session_config["aws_access_key_id"] = aws_access_key
            session_config["aws_secret_access_key"] = aws_secret_key
            if session_token:
                session_config["aws_session_token"] = session_token
        
        sagemaker_client = boto3.client('sagemaker', **session_config, verify=False, config=config)
        
        # Extract and validate required parameters from request_body
        job_name = request_body.get("job_name")
        if not job_name:
            # Generate unique job name if not provided
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            job_name = f"automl-{project}-{timestamp}"
        
        # Validate required fields
        input_data_config = request_body.get("input_data_config")
        if not input_data_config or not input_data_config.get("s3_uri"):
            return {
                "error": "input_data_config with s3_uri is required",
                "message": "Please provide the S3 URI for training data"
            }, 400
        
        output_data_config = request_body.get("output_data_config")
        if not output_data_config or not output_data_config.get("s3_output_path"):
            return {
                "error": "output_data_config with s3_output_path is required",
                "message": "Please provide the S3 output path"
            }, 400
        
        target_attribute_name = request_body.get("target_attribute_name")
        if not target_attribute_name:
            return {
                "error": "target_attribute_name is required",
                "message": "Please specify the target column name for prediction"
            }, 400
        
        # Get or validate IAM role
        if not role_arn:
            role_arn = request_body.get("role_arn")
        
        if not role_arn:
            return {
                "error": "role_arn is required",
                "message": "Please provide an IAM role ARN with SageMaker permissions"
            }, 400
        
        # Build AutoML job configuration
        automl_job_config = {
            "AutoMLJobName": job_name,
            "InputDataConfig": [
                {
                    "DataSource": {
                        "S3DataSource": {
                            "S3DataType": "S3Prefix",
                            "S3Uri": input_data_config["s3_uri"]
                        }
                    },
                    "TargetAttributeName": target_attribute_name
                }
            ],
            "OutputDataConfig": {
                "S3OutputPath": output_data_config["s3_output_path"]
            },
            "RoleArn": role_arn
        }
        
        # Add optional content type
        if input_data_config.get("content_type"):
            automl_job_config["InputDataConfig"][0]["ContentType"] = input_data_config["content_type"]
        
        # Add optional compression type
        if input_data_config.get("compression_type"):
            automl_job_config["InputDataConfig"][0]["CompressionType"] = input_data_config["compression_type"]
        
        # Add optional problem type
        problem_type = request_body.get("problem_type")
        if problem_type:
            automl_job_config["ProblemType"] = problem_type
        
        # Add optional AutoML job objective
        objective = request_body.get("objective")
        if objective and objective.get("metric_name"):
            automl_job_config["AutoMLJobObjective"] = {
                "MetricName": objective["metric_name"]
            }
        
        # ===== NEW: Configure specific model/algorithm preferences =====
        automl_config_dict = {}
        
        # Specify candidate generation mode
        mode = request_body.get("mode")
        if mode:
            automl_config_dict["Mode"] = mode  # AUTO, ENSEMBLING, HYPERPARAMETER_TUNING
        
        # Specify algorithms to use (for registered model scenario)
        algorithm_preference = request_body.get("algorithm_preference")
        if algorithm_preference:
            automl_config_dict["CandidateGenerationConfig"] = {
                "AlgorithmsConfig": [
                    {"AutoMLAlgorithms": algorithm_preference}
                ]
            }
        
        # Add model constraints if using a registered model as baseline
        model_id = request_body.get("model_id")
        registered_model_name = request_body.get("registered_model_name")
        
        if model_id or registered_model_name:
            logger.info(f"Using registered model: {registered_model_name or model_id}")
            
            # If model_id is provided, we can use it to retrieve model info
            if model_id:
                try:
                    # Get model details to understand its algorithm
                    model_response = sagemaker_client.describe_model(ModelName=model_id.split('/')[-1])
                    logger.info(f"Retrieved model details: {model_response}")
                    
                    # Extract algorithm from model if available
                    primary_container = model_response.get('PrimaryContainer', {})
                    image_uri = primary_container.get('Image', '')
                    
                    # Infer algorithm from image URI
                    algorithm_name = _extract_algorithm_from_image(image_uri)
                    if algorithm_name:
                        automl_config_dict["CandidateGenerationConfig"] = {
                            "AlgorithmsConfig": [
                                {"AutoMLAlgorithms": [algorithm_name]}
                            ]
                        }
                        logger.info(f"Using algorithm from registered model: {algorithm_name}")
                    
                except ClientError as e:
                    logger.warning(f"Could not retrieve model details: {str(e)}")
        
        # Add completion criteria
        completion_criteria = {}
        
        if request_body.get("max_candidates"):
            completion_criteria["MaxCandidates"] = request_body["max_candidates"]
        
        if request_body.get("max_runtime_per_training_job_in_seconds"):
            completion_criteria["MaxRuntimePerTrainingJobInSeconds"] = request_body["max_runtime_per_training_job_in_seconds"]
        
        if request_body.get("total_job_runtime_in_seconds"):
            completion_criteria["MaxAutoMLJobRuntimeInSeconds"] = request_body["total_job_runtime_in_seconds"]
        
        if completion_criteria:
            automl_config_dict["CompletionCriteria"] = completion_criteria
        
        # Add security config if provided
        if request_body.get("vpc_config"):
            automl_config_dict["SecurityConfig"] = {
                "VpcConfig": request_body["vpc_config"]
            }
        
        # Add encryption config if provided
        if request_body.get("volume_kms_key_id") or output_data_config.get("kms_key_id"):
            automl_config_dict["SecurityConfig"] = automl_config_dict.get("SecurityConfig", {})
            if request_body.get("volume_kms_key_id"):
                automl_config_dict["SecurityConfig"]["VolumeKmsKeyId"] = request_body["volume_kms_key_id"]
            if output_data_config.get("kms_key_id"):
                automl_job_config["OutputDataConfig"]["KmsKeyId"] = output_data_config["kms_key_id"]
        
        # NEW: Option to only generate candidate definitions without training
        if request_body.get("generate_candidate_definitions_only"):
            automl_job_config["GenerateCandidateDefinitionsOnly"] = True
        
        # Add AutoML config if any settings were specified
        if automl_config_dict:
            automl_job_config["AutoMLJobConfig"] = automl_config_dict
        
        # Add optional tags
        tags = request_body.get("tags", [])
        if tags:
            automl_job_config["Tags"] = tags
        
        # Add project and model tags
        default_tags = []
        if project and not any(tag.get("Key") == "project" for tag in tags):
            default_tags.append({"Key": "project", "Value": project})
        
        if registered_model_name and not any(tag.get("Key") == "base_model" for tag in tags):
            default_tags.append({"Key": "base_model", "Value": registered_model_name})
        
        if model_id and not any(tag.get("Key") == "model_id" for tag in tags):
            default_tags.append({"Key": "model_id", "Value": model_id})
        
        if default_tags:
            automl_job_config.setdefault("Tags", []).extend(default_tags)
        
        # Add model deployment config if provided
        if request_body.get("model_deploy_config"):
            automl_job_config["ModelDeployConfig"] = request_body["model_deploy_config"]
        
        logger.info(f"Creating AutoML job with config: {automl_job_config}")
        
        # Create the AutoML job
        response = sagemaker_client.create_auto_ml_job(**automl_job_config)
        
        logger.info(f"AutoML job created successfully: {response}")
        
        # Return success response
        result = {
            "job_name": job_name,
            "job_arn": response.get("AutoMLJobArn"),
            "status": "InProgress",
            "message": "AutoML training job created successfully",
            "input_data": input_data_config["s3_uri"],
            "output_path": output_data_config["s3_output_path"],
            "target_attribute": target_attribute_name,
            "created_at": datetime.now().isoformat()
        }
        
        # Add registered model info to response if provided
        if registered_model_name:
            result["base_model"] = registered_model_name
        if model_id:
            result["model_id"] = model_id
        if algorithm_preference:
            result["algorithms"] = algorithm_preference
        
        return result, 201
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        logger.error(f"AWS ClientError: {error_code} - {error_message}")
        
        if error_code == 'ResourceInUse':
            return {
                "error": "Job name already exists",
                "message": f"AutoML job with name '{job_name}' already exists. Please use a different name.",
                "aws_error": error_message
            }, 409
        elif error_code == 'ValidationException':
            return {
                "error": "Invalid parameters",
                "message": "One or more parameters are invalid",
                "aws_error": error_message
            }, 400
        elif error_code == 'AccessDeniedException':
            return {
                "error": "Access denied",
                "message": "Insufficient permissions to create AutoML job",
                "aws_error": error_message
            }, 403
        elif error_code == 'ResourceNotFound':
            return {
                "error": "Model not found",
                "message": "The specified registered model was not found",
                "aws_error": error_message
            }, 404
        else:
            return {
                "error": error_code,
                "message": error_message
            }, 500
            
    except KeyError as e:
        logger.error(f"Missing required parameter: {str(e)}")
        return {
            "error": "Missing required parameter",
            "message": f"Required parameter is missing: {str(e)}"
        }, 400
        
    except Exception as e:
        logger.error(f"Unexpected error creating AutoML job: {str(e)}", exc_info=True)
        return {
            "error": "Internal server error",
            "message": str(e)
        }, 500


def _extract_algorithm_from_image(image_uri):
    """
    Extract algorithm name from SageMaker image URI
    
    Args:
        image_uri: Docker image URI
        
    Returns:
        str: Algorithm name or None
    """
    algorithm_mapping = {
        'xgboost': 'xgboost',
        'linear-learner': 'linear-learner',
        'kmeans': 'kmeans',
        'pca': 'pca',
        'factorization-machines': 'factorization-machines',
        'ntm': 'ntm',
        'randomcutforest': 'randomcutforest',
        'knn': 'knn',
        'object2vec': 'object2vec',
        'ipinsights': 'ipinsights',
        'lightgbm': 'lightgbm',
        'catboost': 'catboost',
        'autogluon': 'autogluon-tabular',
        'tabular': 'autogluon-tabular',
        'mxnet': 'mxnet',
        'pytorch': 'pytorch',
        'tensorflow': 'tensorflow',
        'sklearn': 'sklearn'
    }
    
    if not image_uri:
        return None
    
    image_lower = image_uri.lower()
    for key, value in algorithm_mapping.items():
        if key in image_lower:
            return value
    
    return None


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
