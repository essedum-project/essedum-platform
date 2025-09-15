# imports
import sys
import os
from pathlib import Path
from azureml.core.authentication import ServicePrincipalAuthentication
from azureml.core import Workspace
from azureml.core import ScriptRunConfig, Experiment, Environment
from azureml.core.compute import ComputeTarget, AmlCompute
from azureml.core.compute_target import ComputeTargetException
from azureml.data import OutputFileDatasetConfig
from dotenv import load_dotenv
from utils import *
import json
import logging

load_dotenv()

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

os.environ['http_proxy'] = PROXY
os.environ['https_proxy'] = PROXY
os.environ['HTTP_PROXY'] = PROXY
os.environ['HTTPS_PROXY'] = PROXY
os.environ['no_proxy'] = NOPROXY

args = sys.argv

script_path = args[1]
logfile_path = args[2]
save_path = args[3]
name_version = save_path = args[4]

script_dir = save_path
script_name = script_path

try:
    with open("configs.json", "r") as fp:
        configs = json.load(fp)
    logger.info(f"configs is: {str(configs)}")
except:
    logger.info(f"configs file not found")
    configs = {}

tenant_id=os.environ.get('tenant_id')
service_principal_id=os.environ.get('service_principal_id')
service_principal_password=os.environ.get('service_principal_password')
subscription_id=os.environ.get('subscription_id')
resource_group=os.environ.get('resource_group')
workspace_name=os.environ.get('workspace_name')
compute_name = os.environ.get('compute_name')
vm_size=os.environ.get('vm_size')
max_nodes=os.environ.get('max_nodes')

# get workspace
svc_pr = ServicePrincipalAuthentication(
    tenant_id=tenant_id,
    service_principal_id=service_principal_id,
    service_principal_password=service_principal_password,
)

ws = Workspace(
    subscription_id=subscription_id,
    resource_group=resource_group,
    workspace_name=workspace_name,
    auth=svc_pr,
)

def_blob_store = ws.get_default_datastore()
outpath = script_name.split(".")[0]
output = OutputFileDatasetConfig(destination=(def_blob_store, 'outputdataset/' + str(name_version)), source='./outputs/')

arguments = ["--output_path", output, "--compute", "CPU"]  # set to GPU for accelerated training

# environment file
environment_file = "./req.txt"
with open(environment_file, 'w') as f:
    f.write('azureml-mlflow')

# azure ml settings
environment_name = "aiplat"
experiment_name = "aiplat"
# compute_name = "cpu-cluster-aiplat" 


# Verify that cluster does not exist already
try:
    compute_target = ComputeTarget(workspace=ws, name=compute_name)
    print("Found existing cluster, using it.")
except ComputeTargetException:
    compute_config = AmlCompute.provisioning_configuration(
        vm_size=vm_size, max_nodes=max_nodes
    )
    compute_target = ComputeTarget.create(ws, compute_name, compute_config)
    compute_target.wait_for_completion(show_output=True)

# create environment
env = Environment.from_pip_requirements(environment_name, environment_file)

# create job config
src = ScriptRunConfig(
    source_directory=script_dir,
    script=script_name,
    arguments=arguments,
    environment=env,
    compute_target=compute_name,
)

# submit job
run = Experiment(ws, experiment_name).submit(src)
try:
    run.wait_for_completion(show_output=True)
    print('get_file_names(): ', run.get_file_names())
except Exception as err:
    print(f"{str(err)}")
