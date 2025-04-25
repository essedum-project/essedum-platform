import uuid
from utils import *
import os
import logging
import sys
import subprocess
import importlib
import traceback

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

def baseScript():
    return '''
import os
import logging as logger

{imports}

{functions}

def executePipeline():
{executionOrder}
logger.info('Completed')


if __name__ == '__main__':
    try:
        executePipeline()
    except Exception as ex:
        logger.info(ex)
    print('Completed')
'''

def scriptgeneration(request_payload, save_path, fileid):
    import_lines = [imports['key'] for imports in request_payload["Imports"]]
    requirements = [requirements['key'] for requirements in request_payload["Requirements"]]
    # requirements = [{requirements}]
    for module in requirements:
        subprocess.run(sys.executable + ' -m pip install '+ module + ' -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com',shell=True)
    
    functions = [request_payload["Script"]]
    import_lines = [l for l in set(import_lines) if l != '']
    requirements = [l for l in set(requirements) if l != '']
    pipelineCode = baseScript()
    pipelineCode = pipelineCode.replace('{imports}', ('\n').join(import_lines))
    if len(requirements)>0:
        pipelineCode = pipelineCode.replace('{requirements}', '\''+ ('\',\'').join(requirements)+'\'')
    else:
        pipelineCode = pipelineCode.replace('{requirements}', '')
        
    pipelineCode = pipelineCode.replace('{functions}', ('\r').join(functions))
    executionOrder = '\n'
    nodename = 'execute'
    default_params = []
    outputs=[]
    inputs = [f'connectionDetails=\'\'\'{request_payload["ConnectionDetails"]}\'\'\'',
            f'body=\'\'\'{request_payload["Body"]}\'\'\'']
    # Generating function call
    if len(outputs) > 0:
        call = '    ' + ','.join(outputs) + ' = ' + nodename + '(' + ','.join(inputs)
        if len(default_params) > 0:
            call += ', ' if len(inputs) > 0 else ''
            call += ','.join(default_params)
        call +=  ')\n'
    else:
        call = '    ' + nodename + '(' + ','.join(inputs)
        if len(default_params) > 0:
            call += ', ' if len(inputs) > 0 else ''
            call += ','.join(default_params)
        call +=  ')\n' 

    executionOrder = executionOrder + call 
    pipelineCode = pipelineCode.replace('{executionOrder}', executionOrder)
    pipelineCode = pipelineCode.replace('\r', '\n')
    filename = fileid + '.py'
    filepath = os.path.join(save_path, filename)
    with open(filepath, 'w') as file:
        file.write(pipelineCode)
    return filename



def execute_function(save_path, module_name, function_name, *args):
    result = ""

    try:
        from pathlib import Path
        sys.path.append(save_path)
        p = Path(save_path)
        module=importlib.import_module(p.stem)
        if hasattr(module, function_name):
            function_to_execute = getattr(module, function_name)
            result = function_to_execute(*args)
            print("result: ", result)
        else:
            print(f"{function_name} doesn't exists")
    except Exception as e:
        exc_trace = traceback.format_exc()
        print(exc_trace)
        print("Exception occured: ", {e})
        result = e
    return result

def function_execute(request_body):
    result={}
    try:
        fileid = str(uuid.uuid4())
        if fileid:
            os.mkdir(os.path.join(WORKING_DIRECTORY, fileid))
            save_path = os.path.join(WORKING_DIRECTORY, fileid)

        filename = scriptgeneration(request_body, save_path, fileid)
        result = execute_function(save_path, fileid, "execute", request_body["ConnectionDetails"], request_body["Body"])
        result={
            'logs':{'content': str(result)}     
        }

        return result
    except Exception as err:
        return str(err)

