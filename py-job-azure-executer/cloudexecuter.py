# imports
import sys
from pathlib import Path
from azureml.core.authentication import ServicePrincipalAuthentication
from azureml.core import Workspace
from azureml.core import ScriptRunConfig, Experiment, Environment
from azureml.core.compute import ComputeTarget, AmlCompute
from azureml.core.compute_target import ComputeTargetException
from azureml.data import OutputFileDatasetConfig
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

tenant_id=configs.get('tenant_id', "1a484722-7609-45f3-89fc-e8cad131d18f")
service_principal_id=configs.get('service_principal_id', "2d37ea3b-afdc-49bb-859d-867bd44acdd1")
service_principal_password=configs.get('service_principal_password', "DuV8Q~FFw2fqoWqhqwz8RlQ-IxmfaWyFzYz7fdaY")
subscription_id=configs.get('subscription_id', "70c4fc73-c3e2-4c56-90bf-ba167adf0d5d")
resource_group=configs.get('resource_group', "aiplatform_apis")
workspace_name=configs.get('workspace_name', "aiplatform_apis")
compute_name = configs.get('compute_name', "cpu-cluster-aiplat")
vm_size=configs.get('vm_size', "STANDARD_DS2_V2")
max_nodes=configs.get('max_nodes', 2)

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
