import os
from utils import *
import logging

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


os.environ["PYTHONIOENCODING"] = "UTF-8"
os.environ['http_proxy'] = PROXY
os.environ['https_proxy'] = PROXY
os.environ['HTTP_PROXY'] = PROXY
os.environ['HTTPS_PROXY'] = PROXY
os.environ['no_proxy'] = NOPROXY


import boto3
import sys
import time
import sagemaker
from sagemaker.processing import ScriptProcessor, ProcessingOutput
from sagemaker.amazon.amazon_estimator import image_uris
from utils import *
import json

args = sys.argv

script_path = args[1]
logfile_path = args[2]
save_path = args[3]
name_version = args[4]

def cloudexecution(script_path='', logfile_path='', save_path=''):
    wd = os.getcwd()
    os.chdir(save_path)

    try:
        with open("configs.json", "r") as fp:
            configs = json.load(fp)
        logger.info(f"configs is: {str(configs)}")
    except:
        logger.info(f"configs file not found")
        configs = {}

    bucket = configs.get('bucket', 'aiplatdata1')

    session = boto3.Session(
        aws_access_key_id=configs.get('aws_access_key_id', 'AKIAWSEIAMU6H5SKF2E2'),
        aws_secret_access_key=configs.get('aws_secret_access_key','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'),
        region_name = configs.get('region_name', 'us-east-1')
    )
    sagemakerSession = sagemaker.Session(boto_session=session)

    print('Submitting job for execution')

    role = 'arn:aws:iam::451256804668:role/Semi-Structured-Annotation-SageMakerExecutionRole-1K8KPZUU2Y3YE' # 'aiplat'
    role = configs.get('role', role)
    container = image_uris.get_base_python_image_uri(region=configs.get('region_name', 'us-east-1'), py_version=configs.get('py_version', '310'))
    container = configs.get('container', container)

    script_processor = ScriptProcessor(sagemaker_session=sagemakerSession,
        command=['python3'],
        image_uri=container,
        role=role,
        instance_count=configs.get('instance_count', 1),
        instance_type=configs.get('instance_type', 'ml.m5.xlarge'),
    )

    processing_job = script_processor.run(code=script_path,
                                          outputs=[ProcessingOutput(source=configs.get('source', '/opt/ml/processing/outputs/'), 
                                                                    destination=f's3://{bucket}/outputdataset/{name_version}/')],
                                          wait=False) 

    client = boto3.client('logs', 
                            aws_access_key_id=configs.get('aws_access_key_id', 'AKIAWSEIAMU6H5SKF2E2'),
                            aws_secret_access_key=configs.get('aws_secret_access_key','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'), 
                            region_name=configs.get('region_name', 'us-east-1'))
    log_group_name = '/aws/sagemaker/ProcessingJobs'
    event_index = 0
    with open(logfile_path, 'w', encoding='utf-8') as log_file:
        while True:
            try:
                describe_response = script_processor.jobs[-1].describe()
        
                response = client.describe_log_streams(logGroupName=log_group_name, logStreamNamePrefix=describe_response['ProcessingJobName'])
                if 'logStreams' in response and response['logStreams']:
                    latest_log_stream_name = response['logStreams'][0]['logStreamName']
                    log_events = client.get_log_events(logGroupName=log_group_name, logStreamName=latest_log_stream_name)
                    events = log_events.get('events', [])
                    for i in range(event_index, len(events)):
                        event = events[i]
                        log_file.write(event['message'])
                        log_file.write('\n')
                    event_index = len(log_events.get('events', []))
                if describe_response['ProcessingJobStatus'] in ['Failed', 'Completed']:
                    break
            except Exception as e:
                print('Error fetching logs', e)
    os.chdir(wd)
    

cloudexecution(script_path, logfile_path, save_path)
