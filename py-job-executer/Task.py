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
import subprocess
import os
from minio.error import S3Error
from requests.exceptions import ConnectionError, Timeout
from botocore.exceptions import EndpointConnectionError


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
    def __init__(self, id,bucket,project_id, name, version, credentials, key, command, storage, env):
        self.id = id
        self.bucket = bucket
        self.project_id = project_id
        self.name = name
        self.version=version
        self.credentials=credentials
        self.key=key
        self.command = command
        self.storage = storage
        self.status= 'WAITING'
        self.env = env

        if storage =="minio":
            self.log_dir = f"{project_id}/remote/{name}/{version}/outputartifacts/logs/log.txt"
            self.output_dir = f"{project_id}/remote/{name}/{version}/outputartifacts/logs/outputs"
        elif storage == "s3":
            self.log_dir = f"{project_id}/remote/{name}/{version}/outputartifacts/logs/log.txt"
            self.output_dir = f"{project_id}/remote/{name}/{version}/outputartifacts/logs/outputs"
        else:
            self.log_dir = WORKING_DIRECTORY+id
            self.output_dir = WORKING_DIRECTORY+id

        if storage =="minio":
            self.log_path = f"minio://{bucket}/{project_id}/remote/{name}/{version}/outputartifacts/logs/log.txt"
        elif storage == "s3":
            self.log_path = f"s3://{bucket}/{project_id}/remote/{name}/{version}/outputartifacts/logs/log.txt"
        else:
            self.log_path =WORKING_DIRECTORY+id

    def create_service_request_venv(self):
        """Create or reuse a virtual environment for the service request."""
        try:
            env_name = f"script_venv_{self.name}"
            dir = os.path.join("venvs", env_name)
            venv_dir = os.path.join(dir, "venv")
            if not os.path.exists(venv_dir):
                os.makedirs(dir, exist_ok=True)
                subprocess.run(["python", "-m", "venv", "--system-site-packages", venv_dir], check=True)
                print(f"Created virtual environment for task {self.id}")
            else:
                print(f"Reusing existing virtual environment for task {self.id}")
            executable_path = os.path.normpath(
                os.path.join(venv_dir, "bin", "activate") if os.name != 'nt' else os.path.join(venv_dir, "Scripts", "activate.bat")
            )
            shell_command = "call " if os.name == "nt" else ". "
            python_executable = shell_command + os.path.abspath(executable_path)
            return python_executable
        except Exception as e:
            print('Exception occurred:', e)

    def execute_script(self):
        python_executable = self.create_service_request_venv() if config['DEFAULT']['use_venv'] == 'True' else ''
        if self.storage == "minio":
            return self.execute_minio_script(python_executable)
        elif self.storage == "s3":
            return self.execute_s3_script(python_executable)
        else:
            return self.execute_local_script(python_executable)

    def execute_local_script(self, python_executable = ''):
        if not os.path.exists(WORKING_DIRECTORY):
            os.makedirs(WORKING_DIRECTORY)
        if self.id:
            os.mkdir(os.path.join(WORKING_DIRECTORY, self.id))
            save_path = os.path.join(WORKING_DIRECTORY, self.id)
            log_text = os.path.join(WORKING_DIRECTORY, self.id, "log.txt")

        with open(log_text, "wb") as log_file:
            wd = os.getcwd()
            os.chdir(save_path)
            full_command = self.command
            if(python_executable):
                full_command =f"""{python_executable} && {self.command} && deactivate"""
            p = subprocess.Popen(full_command, stdout=log_file, stderr=log_file,shell=True)
            out, err = p.communicate()
            returnCode = p.returncode
            logger.info("return code is ", returnCode)
            pid = p.pid
            logger.info("pid is ", pid)
        return {"pid": pid, "return_code":returnCode}

    def execute_minio_script(self, python_executable = ''):
        if not os.path.exists(WORKING_DIRECTORY):
            os.makedirs(WORKING_DIRECTORY)
        if self.id:
            os.mkdir(os.path.join(WORKING_DIRECTORY, self.id))
            save_path = os.path.join(WORKING_DIRECTORY, self.id)
            os.mkdir(os.path.join(save_path, 'output_dir'))
            log_text = os.path.join(WORKING_DIRECTORY, self.id, "log.txt")
            output_dir = os.path.join(save_path, 'output_dir')
            d = dict(os.environ)
            d["output_dir"] = output_dir
            d.update(self.env)
            print('d', d)

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
                wd = os.getcwd()
                os.chdir(save_path)
                full_command = self.command
                if(python_executable):
                    full_command =f"""{python_executable} && {self.command} && deactivate"""
                p = subprocess.Popen(full_command, stdout=log_file, stderr=log_file,shell=True, env=d)
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
            if os.path.exists(output_dir):
                for file in os.listdir(output_dir):
                    if '.' in file:
                        file_path = os.path.join(output_dir, file)
                        self.output_dir = self.output_dir + '/' + file
                        client.fput_object(
                            bucket_name=self.bucket, object_name=self.output_dir, file_path=file_path
                        )
            return {"pid": pid, "return_code": returnCode}

        except (ConnectionError, Timeout) as e:
            error_message = "Network error: Service is not available."
            logger.error(error_message)
            with open(log_text, "w") as err_file:
                err_file.write(error_message)
            return {"pid": None, "return_code": -1}

        except S3Error as e:
            error_message = "Service is not available."
            logger.error(error_message)
            with open(log_text, "w") as err_file:
                err_file.write(error_message)
            return {"pid": None, "return_code": -1}

        except Exception as e:
            exc_trace = traceback.format_exc()
            with open(log_text, "w") as err_file:
                err_file.write(exc_trace)
            logger.error('Exception occured', exc_info=True)
            # print(exc_trace)
            return {"pid": pid, "return_code": -1}



    def execute_s3_script(self, python_executable = ''):
        if not os.path.exists(WORKING_DIRECTORY):
            os.makedirs(WORKING_DIRECTORY)
        if self.id:
            os.mkdir(os.path.join(WORKING_DIRECTORY, self.id))
            save_path = os.path.join(WORKING_DIRECTORY, self.id)
            os.mkdir(os.path.join(save_path, 'output_dir'))
            log_text = os.path.join(WORKING_DIRECTORY, self.id, "log.txt")
            output_dir = os.path.join(save_path, 'output_dir')
            d = dict(os.environ)
            d["output_dir"] = output_dir
            d.update(self.env)

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
                wd = os.getcwd()
                os.chdir(save_path)
                full_command = self.command
                if(python_executable):
                    full_command =f"""{python_executable} && {self.command} && deactivate"""
                p = subprocess.Popen(full_command, stdout=log_file, stderr=log_file,shell=True, env=d)
                pid = p.pid
                db_operations.update_job_pid(self.id, pid)
                out, err = p.communicate()
                returnCode = p.returncode

                os.chdir(wd)

            # if os.stat(err_text).st_size > 0:
            if os.stat(log_text).st_size > 0:
                bucket_object.upload_file(Key=self.log_dir, Filename=log_text)
                # upload error "log" file to minio here
            
            if os.path.exists(output_dir):
                for file in os.listdir(output_dir):
                    if '.' in file:
                        file_path = os.path.join(output_dir, file)
                        self.output_dir = self.output_dir + '/' + file
                        bucket_object.upload_file(Key=self.output_dir, Filename=file_path)
            return {"pid": pid, "return_code": returnCode}

        except (ConnectionError, Timeout) as e:
            error_message = "Network error: Service is not available."
            logger.error(error_message)
            with open(log_text, "w") as err_file:
                err_file.write(error_message)
            return {"pid": None, "return_code": -1}
        
        except EndpointConnectionError:
            error_message = "Service is not available."
            logger.error(error_message)
            with open(log_text, "w") as err_file:
                err_file.write(error_message)
            return {"pid": None, "return_code": -1}
    
        except Exception as err:
            exc_trace = traceback.format_exc()
            with open(log_text, "w") as err_file:
                err_file.write(exc_trace)
            return {"pid": None, "return_code": -1}
