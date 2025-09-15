from db import DatabaseOperations, JobNF
import os
import pathlib
import subprocess
import traceback
import boto3
import botocore
from minio import Minio
from urllib.parse import urlparse
from utils import *
import logging
import json

os.environ["PYTHONIOENCODING"] = "UTF-8"

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

db_operations = DatabaseOperations()

class Task:
    def __init__(self, id,bucket,project_id, name, version, credentials, key, command, storage, configs={}):
        self.id = id
        self.bucket = bucket
        self.project_id = project_id
        self.name = name
        self.version=version
        self.credentials=credentials
        self.key=key
        self.command = command
        self.storage = storage
        self.configs = configs
        self.status= 'WAITING'

        if storage =="minio":
            self.log_dir = f"{project_id}/remote/{name}/{version}/outputartifacts/logs/log.txt"
        elif storage == "s3":
            self.log_dir = f"{project_id}/remote/{name}/{version}/outputartifacts/logs/log.txt"
        else:
            self.log_dir =WORKING_DIRECTORY+id

        if storage =="minio":
            self.log_path = f"minio://{bucket}/{project_id}/remote/{name}/{version}/outputartifacts/logs/log.txt"
        elif storage == "s3":
            self.log_path = f"s3://{bucket}/{project_id}/remote/{name}/{version}/outputartifacts/logs/log.txt"
        else:
            self.log_path =WORKING_DIRECTORY+id

    def execute_script(self):
        if self.storage == "minio":
            return self.execute_minio_script()
        elif self.storage == "s3":
            return self.execute_s3_script()
        else:
            return self.execute_local_script()

    def execute_local_script(self):
        if not os.path.exists(WORKING_DIRECTORY):
            os.makedirs(WORKING_DIRECTORY)
        if self.id:
            os.mkdir(os.path.join(WORKING_DIRECTORY, self.id))
            save_path = os.path.join(WORKING_DIRECTORY, self.id)
            log_text = os.path.join(WORKING_DIRECTORY, self.id, "log.txt")

        with open(log_text, "wb") as log_file:
            wd = os.getcwd()
            os.chdir(save_path)
            p = subprocess.Popen(self.command, stdout=log_file, stderr=log_file, encoding='utf-8', errors='ignore', universal_newlines=True, shell=True)
            out, err = p.communicate()
            returnCode = p.returncode
            logger.info("return code is ", returnCode)
            pid = p.pid
            logger.info("pid is ", pid)
        return {"pid": pid, "return_code":returnCode}

    def execute_minio_script(self):
        if not os.path.exists(WORKING_DIRECTORY):
            os.makedirs(WORKING_DIRECTORY)
        if self.id:
            os.mkdir(os.path.join(WORKING_DIRECTORY, self.id))
            save_path = os.path.join(WORKING_DIRECTORY, self.id)
            log_text = os.path.join(WORKING_DIRECTORY, self.id, "log.txt")

        try:
            self.endpoint=self.credentials.get("endpoint","")
            self.access_key=self.credentials.get("access_key","")
            self.secret_key=self.credentials.get("secret_key","")

            if 'http' not in self.endpoint:
                self.endpoint = 'http://' + self.endpoint.split('/')[-1]
            secure = True if urlparse(self.endpoint).scheme == 'https' else False

            
            client = Minio(urlparse(self.endpoint).hostname+':'+str(urlparse(self.endpoint).port), access_key=self.access_key,secret_key=self.secret_key, secure=secure)
            objects = client.list_objects(self.bucket, self.key, recursive=True)
            for obj in objects:
                object_save_path = f"{save_path}/{pathlib.Path(obj.object_name).name}"
                client.fget_object(self.bucket, obj.object_name, object_save_path)

            with open(log_text, "wb") as log_file:
                from pathlib import Path
                prefix = Path(__file__).parent
                wd = os.getcwd()
                # clusterexecutor_path = os.path.join(wd , 'cloudexecuter.py')
                clusterexecutor_path = os.path.join(prefix , 'cloudexecuter.py')
                os.chdir(save_path)
                if isinstance(self.command, str):
                    script_path = self.command.split(' ')[-1]
                    self.command = f'python {clusterexecutor_path} {script_path} {log_text} {save_path}'
                p = subprocess.Popen(self.command, stdout=log_file, stderr=log_file, encoding='utf-8', errors='ignore', universal_newlines=True, shell=True)
                # p = subprocess.Popen(self.command, stdout=log_file, stderr=log_file, shell=True)
                pid = p.pid
                db_operations.update_job_pid(self.id, pid)
                out, err = p.communicate()
                returnCode = p.returncode
                os.chdir(wd)

            if os.stat(log_text).st_size > 0:
                client.fput_object(
                    bucket_name=self.bucket, object_name=self.log_dir, file_path=log_text
                )
                # upload error "log" file to minio here
    
            return {"pid": pid, "return_code": returnCode}

        except Exception as e:
            exc_trace = traceback.format_exc()
            with open(log_text, "w") as err_file:
                err_file.write(exc_trace)
            logger.error('Exception occured', exc_info=True)
            # print(exc_trace)
            return {"pid": pid, "return_code": -1}



    def execute_s3_script(self):
        os.environ['no_proxy'] = "localhost,0.0.0.0,10.*,*.ad.infosys.com,10.82.53.110"
        if not os.path.exists(WORKING_DIRECTORY):
            os.makedirs(WORKING_DIRECTORY)
        if self.id:
            os.mkdir(os.path.join(WORKING_DIRECTORY, self.id))
            save_path = os.path.join(WORKING_DIRECTORY, self.id)
            log_text = os.path.join(WORKING_DIRECTORY, self.id, "log.txt")
            configs_path = os.path.join(WORKING_DIRECTORY, self.id, "configs.json")
            with open(configs_path, "w") as fp:
                json.dump(self.configs , fp)

        try:
            self.endpoint=self.credentials.get("endpoint","")
            self.access_key=self.credentials.get("access_key","")
            self.secret_key=self.credentials.get("secret_key","")
            s3 = boto3.resource(service_name="s3", endpoint_url=self.endpoint,aws_access_key_id=self.access_key,aws_secret_access_key=self.secret_key,verify=False)
            bucket_object = s3.Bucket(self.bucket)
            try:
                for my_bucket_object in bucket_object.objects.filter(Prefix=self.key):
                    object_save_path = (
                        f"{save_path}/{pathlib.Path(my_bucket_object.key).name}"
                    )
                    bucket_object.download_file(my_bucket_object.key, object_save_path)

            except botocore.exceptions.ClientError as e:
                if e.response["Error"]["Code"] == "404":
                    logger.error("The object does not exist.")
                else:
                    logger.error('Exception occured', exc_info=True)
                    raise

            with open(log_text, "wb") as log_file:
                from pathlib import Path
                prefix = Path(__file__).parent
                wd = os.getcwd()
                print('prefix', prefix, wd)
                clusterexecutor_path = os.path.join(prefix , 'cloudexecuter.py')
                os.chdir(save_path)
                if isinstance(self.command, str):
                    script_path = self.command.split(' ')[-1]
                    name_version =  self.name + '/' + self.version
                    self.command = f'python {clusterexecutor_path} {script_path} {log_text} {save_path} {name_version}'
                p = subprocess.Popen(self.command, stdout=log_file, stderr=log_file, encoding='utf-8', universal_newlines=True, errors='ignore', shell=True)
                pid = p.pid
                db_operations.update_job_pid(self.id, pid)
                out, err = p.communicate()
                returnCode = p.returncode

                os.chdir(wd)

            # if os.stat(err_text).st_size > 0:
            if os.stat(log_text).st_size > 0:
                bucket_object.upload_file(Key=self.log_dir, Filename=log_text)
                # upload error "log" file to minio here
            
            return {"pid": pid, "return_code": returnCode}
        except Exception as err:
            exc_trace = traceback.format_exc()
            with open(log_text, "w") as err_file:
                err_file.write(exc_trace)
            return {"pid": None, "return_code": -1}
