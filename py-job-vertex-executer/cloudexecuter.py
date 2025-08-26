import boto3
import os
import sys
import time
import json
from pathlib import Path
from utils import *
import json
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

prefix = Path(__file__).parent

args = sys.argv

script_path = args[1]
logfile_path = args[2]
save_path = args[3]
name_version = args[4]

wd = os.getcwd()
os.chdir(save_path)

try:
    with open("configs.json", "r") as fp:
        configs = json.load(fp)
    logger.info(f"configs is: {str(configs)}")
except:
    logger.info(f"configs file not found")
    configs = {}

type = configs.get('type', 'service_account')
project_id = configs.get('project_id', 'poc-icets-mlservices-16306')
private_key_id = configs.get('private_key_id', 'ea675cf09c2bb73e907eae1b8dcd6c1bbb7b105e')
private_key = configs.get('private_key', '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7EuhVkr9JyX8O\nc9LARgzzVcqaIGFqeWOUzS96XT6LqlhNclrx9YHZs3iVaXYciRdzCcu7H9GJCCsX\nKSQQvXCwm56BMyFaF+AYxcmug5ati7OEPkdCA88wEWGURR2sucUwtllK0gjf2s9S\nYyOey3nNnwhZCOFEScADf07cNmUDCLuVSLfhIkAbVBJ+gLY9YMR7XuWcoPrLqpUg\nDKimqts/lRlgywJZFazT+JL9kos1wXRLl3SugfkfErfk/QvR61E71EqrPggXU/X1\n4g0kNi4AJfmZx0t6/PyqZsmn5UE2E0LAYRvgwlJUHV5Gq9z8pwTNez13P+RxKQSG\nHPz4sQR9AgMBAAECggEAL726hyQlJxqCD1klnqYB5hOt2bmLwtVpwW6/wBWNwaze\nTh1x8i+6TKmNi2vXlZ6y2kvUr1OGcNch0A5SwublnFyKjeRTjZ9sNEY9mwi/6lgt\nnwEZxFIejODSqzkcQplCJpVSolKJqz83C4p7a6n30q7UPYyTmI7NrtbNdEt5adVf\nunOIazKYcsg/3ylIIFU5IqJT3RQku6zWBYLTKdA7v88EgBlInd7TZR3GB9+Varc5\n3pkSqEVZb+uwj5cR32SAAeIncHkl3Pn6KgoX/yMT5fEmq7d3GTHUrgVWFkQVy1WH\n8CnN/l5pz3rpc/5gTgz8epHtPQGUgZnH7wScRmZ3jQKBgQDqj/QJGlBXH/48doE4\n+3HvZb9eNHQ6/+52zDoCIfGeBXFQmseNnxE/S3tH6khfmEBcRKyBSVUOliMX2guw\nvr13CsKLCHpCCyRi9XRMnN7tiTUgc7e2JEl6nb30D5RE4UPLNjxMiGUg0bvgNXHy\nQxzhkVva9UcpbAw/1X6cRk/36wKBgQDMK95OB2Hbbgfuf/uU7VwNRsuuLAFP/DOa\n5rC8hPJ2Fv/ye1JJ1e3wS/7vu2QMkblKQ/IEt4I1QbqFEYunHDRGXyOjCKaQVd+Y\nkq18y1DG0vpEgo43XMdohUYfHisd3HtK8P3aSV9w0X0bNFtrCDHjUm7jqhPE57g6\nPxE3pREDNwKBgQC71XUlyPWnH06XGorWl7ygack6ZiThjktmxJp7VLVIxrD8TEYa\n6dOE7SwW5cz5CFIZ0UCW86NyX9ZQZmLQMZ5Fcs9hSPOmaYfE2yw7oa9/Zk2t5Bys\ndhiFYUZY6BTip8WDOLZGzz60bl/V5taNmyLIm3+EMsC+sfCJOaz+9etZ6wKBgCa1\nVnNCsQnSBYzxFLh6e85Eks8VprYMYZhHjlBfgDxlRecp/ELlXTQGpHG8/E3pvtBW\nq2a7h+Mi8ALUfb6T+VEyLmZ1eGa68SZTALM9NLZNP4eHnQDgBSpKwi2aIaCKsZFW\nuToOWRrhjK+AsKhNKHApq75b+12EdQgN9uyuzdfnAoGAMZTr7vOfr/b8MnKsG81a\nQrT1KNLKaEv2AsaR+A+yGXHMSITqCpbreVsxI3VdwufqhrRk1NEst7RhaozCy3cq\nnIM9N1XXKAOF/RlIqfqEj2ngBaGlU07Z9X43J90nT+isIBcu2Q/AUO5groIknTpl\nR1yk+JWqEEo+o/bpvsmues8=\n-----END PRIVATE KEY-----\n')
client_email = configs.get('client_email', 'vertex-ai-poc@poc-icets-mlservices-16306.iam.gserviceaccount.com')
client_id = configs.get('client_id', '107770620897612549677')
auth_uri = configs.get('auth_uri', 'https://accounts.google.com/o/oauth2/auth')
token_uri = configs.get('token_uri', 'https://oauth2.googleapis.com/token')
auth_provider_x509_cert_url = configs.get('auth_provider_x509_cert_url', 'https://www.googleapis.com/oauth2/v1/certs')
client_x509_cert_url = configs.get('client_x509_cert_url', 'https://www.googleapis.com/robot/v1/metadata/x509/vertex-ai-poc%40poc-icets-mlservices-16306.iam.gserviceaccount.com')


region = configs.get('region', "us-central1")
bucket_uri = configs.get('bucket_uri', "gs://test-bucket-unique1")
service_account = configs.get('service_account', "vertex-ai-poc@poc-icets-mlservices-16306.iam.gserviceaccount.com")
container_uri = configs.get('container_uri', "gcr.io/deeplearning-platform-release/base-cu113.py310")

with open(script_path, 'a') as file:
    file.write(f'''
gs_command = 'gsutil -m cp -r ./outputs gs://test-bucket-unique1/outputdataset/{name_version}'
os.system(gs_command)
print('Completed')''')

import os
import time
from google.cloud import aiplatform as vertex_ai
import google.cloud.logging

credentials_json = {
          'type': type,
          'project_id': project_id,
          'private_key_id': private_key_id,
          'private_key': private_key,
          'client_email': client_email,
          'client_id': client_id,
          'auth_uri': auth_uri,
          'token_uri': token_uri,
          'auth_provider_x509_cert_url': auth_provider_x509_cert_url,
          'client_x509_cert_url': client_x509_cert_url
    }
        
with open(os.path.join('.', 'poc-icets-mlservices-16306-ea675cf09c2b.json'), 'w') as f:
    json.dump(credentials_json, f, indent = 2)

creds_path = os.path.join('.' , 'poc-icets-mlservices-16306-ea675cf09c2b.json"')

print('creds_path', creds_path)

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r".\poc-icets-mlservices-16306-ea675cf09c2b.json"


PROJECT_ID = project_id
REGION = region
BUCKET_URI = bucket_uri
EXPERIMENT_NAME = "aiplat-experiment"


vertex_ai.init(
    project=PROJECT_ID,
    location=REGION,
    staging_bucket=BUCKET_URI,
    experiment=EXPERIMENT_NAME,
)


display_name = "aiplat"

job = vertex_ai.CustomJob.from_local_script(
        display_name=display_name,
        base_output_dir="gs://test-bucket-unique1/outputdataset/",
        script_path=script_path,
        container_uri=container_uri,
        enable_autolog=True,
    )


job.run(
    service_account=service_account,
    experiment=EXPERIMENT_NAME,
    experiment_run="aiplat-experiment-run",
    sync=False,
    enable_web_access=False
)

job.wait_for_resource_creation()

job_id = job.resource_name.split('/')[-1]

with open(logfile_path, 'w', encoding='utf-8', errors='ignore') as log_file:
    pending_log = f"CustomJob with job id {job_id} created.\n"
    log_file.write(pending_log)

pending_job_count = 1
while True:
    status = str(job.state)
    if status != "JobState.JOB_STATE_PENDING":
        print('status: ', status)
        break
    with open(logfile_path, 'w', encoding='utf-8', errors='ignore') as log_file:
        pending_log = f"CustomJob with job id {job_id} created.\nJobState.JOB_STATE_PENDING x({str(pending_job_count)})\n"
        log_file.write(pending_log)
    pending_job_count += 1
    time.sleep(10)

datastamp = job.create_time


datastamp = datastamp.rfc3339()

logging_client = google.cloud.logging.Client()

try:
    with open(logfile_path, 'a', encoding='utf-8', errors='ignore') as log_file:
        while not job.done() or job.end_time is None:
            log_filter = f'resource.labels.job_id="{job_id}" timestamp>="{datastamp}"'
            timestamp = datastamp
            for entry in logging_client.list_entries(filter_=log_filter):
                timestamp = entry.timestamp.isoformat()
                message = ""
                payload = entry.payload
                if isinstance(payload, dict):
                    message = payload.get("message", "")
                elif isinstance(payload, str):
                    message = payload + '\n'
                else:
                    message = payload
                script_logs = "* {}: {}".format(timestamp, message)
                print(script_logs)
                log_file.write(script_logs)

            datastamp = timestamp
except Exception as err:
    print('error: ', err)
os.chdir(wd)
