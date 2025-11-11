from flask import Flask, jsonify, abort, request, render_template, make_response, g
import uuid
from utils import *
from Queue import Queue
from db import DatabaseOperations, JobNF
from Task import Task
from threading import Thread, Lock, Event
from flask_swagger_ui import get_swaggerui_blueprint
import json
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
import atexit
import psutil
import time
import os
import signal
import traceback
from mlops import vertex
from datasource import get_connection_details_with_token
from functionadapter import function_execute

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


app = Flask(__name__)
q = Queue()
executor = ThreadPoolExecutor(max_workers=THREAD_COUNT)
process_lock = Lock()
db_operations = DatabaseOperations()
submitted_futures = {}
pause_event = Event()

@app.before_request
def create_database():
    """Create the database before the first request."""
    try:
        db_operations.create_database()
        logger.info('created data base table')
    except Exception as e:
        logger.error('Error while creating table', exc_info=True)

# @app.teardown_appcontext
def cleanup_threads_and_db(exception=None):
    """Cleanup threads and close database connections after each request."""
    try:
        for future in as_completed(list(submitted_futures.values())):
            pass
        executor.shutdown(wait=True)
        db_operations.close_connection()
        logger.info('Closing db connection')
    except Exception as e:
        logger.error('Exception occured', exc_info=True)


def process_service_queue():
    """Process the service queue in a separate thread."""
    while True:
        if q.size() == 0:
            pause_event.wait()
        if q.size() >0:
            task = q.get()
            future = executor.submit(process_service_request, task)
            logger.info('Task submitted')
            submitted_futures[task.id] = future


def process_service_request(task):
    """Process a service request."""
    try:
        with process_lock:
            db_operations.update_job_status(task.id, 'RUNNING')
            db_operations.update_job_start_time(task.id)
        result = task.execute_script()
        if result["return_code"] == 0:
            with process_lock:
                db_operations.update_job_status(task.id,'COMPLETED')
        else:
            with process_lock:
                db_operations.update_job_status(task.id, 'ERROR')
        with process_lock:
            db_operations.update_job_finish_time(task.id)
            db_operations.update_job_pid(task.id,result["pid"])
    except Exception as e:
        with process_lock:
            db_operations.update_job_status(task.id, 'ERROR')
            db_operations.update_job_finish_time(task.id)
        logger.error('Exception occured', exc_info=True)


#swaggerUI

sw_url="/swagger"
api_url='/swagger.json'
swaggerui_blueprint=get_swaggerui_blueprint(
    
    sw_url,api_url,config={'app_name': "JobExecuter API"}
)

app.register_blueprint(swaggerui_blueprint,url_prefix=sw_url)


with open('swagger_json.json') as file:
    swagger_json=json.load(file)

@app.route('/swagger.json',methods=['GET'])
def swagger_json_end():
    return jsonify(swagger_json)

#flask logging to pod o/p
handler=logging.StreamHandler()
handler.setLevel(logging.INFO)
app.logger.addHandler(handler)




# error handler
@app.errorhandler(400)
def not_found(error):
    return make_response(jsonify({'error': 'Bad Request - Missing or invalid parameters'}), 400)


# error handler
@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found - The requested resource does not exists'}), 404)

# error handler
@app.errorhandler(422)
def not_found(error):
    return make_response(jsonify({'error': 'Unprocessable Entity - Invalid data or values in the payload'}), 422)


@app.route('/execute/jobs', methods=['GET'])
def show_tasks():
    try:
        tasks = db_operations.get_jobs(limit=100)
        return render_template("Jobs.html",data=tasks)
    except Exception as e:
        logger.error('Exception occured', exc_info=True)
        return jsonify({'error': 'Not found'}),404


# get specific queue task
@app.route('/execute/<task_id>/getStatus', methods=['GET'])
def get_task_status(task_id):
    try:
        task = db_operations.get_job_by_id(task_id)
        if task is None:
            abort(404)
        result = {
            "task_id": task_id,
            "pid":task["pid"],
            "task_status": task["status"],
            "log_path": task["logpath"],
            "submitted":task["submitted"],
            "started":task["started"],
            "finished":task["finished"]
        }
        return jsonify(result)
    except Exception as e:
        logger.error('Exception occured', exc_info=True)
        return jsonify({'error': 'Not found'}),404

# stop specific queue task
@app.route('/execute/<task_id>/stop', methods=['GET'])
def terminate_task(task_id):
    try:
        task = db_operations.get_job_by_id(task_id)
        print('task', task)
        if task is None:
            abort(404)

        process_stop_flag = False
        if task['pid'] is not None and task['status'] == 'RUNNING':
            # os.kill(int(task['pid']), signal.SIGTERM)
            parent_pid = int(task['pid'])
            parent = psutil.Process(parent_pid)
            for child in parent.children(recursive=True):  # or parent.children() for recursive=False
                print('Killing child with pid: ', child.pid)
                child.kill()
            parent.kill()
            process_stop_flag = True
        elif task['pid'] is None and task['status'] == 'WAITING':
            future_thread = submitted_futures[task_id]
            try:
                future_thread.cancel()
                print(f'{submitted_futures[task_id]} is {submitted_futures[task_id].cancelled}')

                time.sleep(0.1)
                if not submitted_futures[task_id].cancelled:
                    terminate_task(task_id)
                
                # removing the cancelled task from dictionary
                del submitted_futures[task_id]
                process_stop_flag = True
            except:
                process_stop_flag = False

        result = {
            'Task cancelled': process_stop_flag
        }

        print('result', result)

        # To override the error status from task
        task = db_operations.get_job_by_id(task_id)
        while task['status'] == 'RUNNING':
            time.sleep(0.2)
            task = db_operations.get_job_by_id(task_id)
        db_operations.update_job_status(task_id, 'CANCELLED')
        return jsonify(result)
    except Exception as e:
        logger.error('Exception occured', exc_info=True)
        return jsonify({'error': 'Not found'}),404
   
# get logs
@app.route('/execute/<task_id>/getLog', methods=['GET'])
def get_task_log(task_id):
    try:
        task_folder=str(task_id)
        log_file=r'/temp/Jobs/'+task_folder+'/log.txt'
        
        with open(log_file,'r', encoding='utf-8', errors='ignore') as f:
            log=f.read()
        
        result={
            'logs':{'content':log}     
        }
       
        return jsonify(result)
    except Exception as e:
        logger.error('Exception occured', exc_info=True)
        return jsonify({'error': 'Not found'}),404

# get logs
@app.route('/execute/getLog', methods=['GET'])
def get_log():
    try:
        log_file='logfile.log'
        
        with open(log_file,'r', encoding='utf-8', errors='ignore') as f:
            log=f.read()
        
        result={
            'logs':{'content':log}     
        }
       
        return jsonify(result)
    except Exception as e:
        logger.error('Exception occured', exc_info=True)
        return jsonify({'error': 'Not found'}),404

def create_task_util(payload):
    id = str(uuid.uuid4())
    bucket = payload.get("bucket","")
    project_id = payload.get("project_id","")
    name = payload.get("name","")
    version = payload.get("version","")
    credentials = payload.get("credentials","")
    key = payload.get("input_artifacts","")
    command = payload.get("command","")
    storage=payload.get("storage", "local")
    configs = payload.get("configs", {})
    env=payload.get("environment", "")
    
    if isinstance(env, str):
        payload["environment"] = {}
        env = {}
        
    if not configs:
        payload["configs"] = {}

    valid_parameters = {"bucket", "project_id", "name", "version", "credentials", "input_artifacts", "command", "storage", "configs", "environment"}
    input_parameters = set(payload.keys())

    # checking for valid parameters
    if len(valid_parameters.difference(input_parameters)) > 0 or len(input_parameters.difference(valid_parameters)) > 0:
        abort(400)

    # checking for valid payload
    if not all(isinstance(var, str) for var in [bucket,project_id, name, version, key, command, storage]):
         abort(422)

    # checking for valid payload
    if any(len(var) == 0 for var in [bucket,project_id, name, version, key, command, storage]):
         abort(422)

    # checking for valid payload
    if isinstance(credentials, dict):
        valid_cred_parameters = {"endpoint", "access_key", "secret_key"}
        input_cred_parameters = set(credentials.keys())

        # checking for valid parameters
        if len(valid_cred_parameters.difference(input_cred_parameters)) > 0 or len(input_cred_parameters.difference(valid_cred_parameters)) > 0:
            abort(400)

        if not all(isinstance(var, str) for var in list(credentials.values())):
            abort(422)
        if any(len(var) == 0 for var in list(credentials.values())):
            abort(422)
    else:
        abort(422)

    task = Task(id,bucket,project_id, name, version, credentials, key, command, storage, configs)
    db_operations.create_job(task)
    q.put(task)
    pause_event.set()
    response = {
        "task_id": task.id,
        "task_status": "Submitted",
        "log_path": task.log_path,
    }
    return jsonify(response), 201

# create a new queue task
@app.route('/execute', methods=['POST'])
def create_task():
    if not request.get_json():
        abort(400)
    payload = request.get_json()
    return create_task_util(payload)
    

@app.route('/execute', methods=['GET'])
def get_tasks():
    tasks = db_operations.get_jobs_id(limit=100)
    if tasks is None:
        abort(404)
    return jsonify(tasks)

# MLOPs endpoints starts
@app.route('/api/service/v1/datasets', methods=['post'])
def projects_datasets_create():
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers = {
        "Authorization": request.headers.get("Authorization", ""),
        "Project": request.headers.get("Project", ""),
        'Projectname': request.headers.get("Projectname", ""),
        'Rolename': request.headers.get("Rolename", ""),
        'Roleid': request.headers.get("Roleid", ""),
        'Referer': request.headers.get("Referer", "")
        }
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        request_body = request.get_json()
        logger.info(f"Request body is: {str(request_body)}")
        result, status_code = vertex.projects_datasets_create(adapter_instance, project, isCached, isInstance, connections, request_body)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500


@app.route('/api/service/v1/datasets/list', methods=['get'])
def projects_datasets_list_list():
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        referer = request.headers.get('referer', None)
        headers=request.headers
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        result, status_code = vertex.projects_datasets_list_list(adapter_instance, project, isCached, isInstance, connections)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500

@app.route('/api/service/v1/datasets/<dataset_id>', methods=['get'])
def projects_datasets_get(dataset_id):
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers=request.headers
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        result, status_code = vertex.projects_datasets_get(adapter_instance, project, isCached, isInstance, connections, dataset_id)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 400


@app.route('/api/service/v1/datasets/<dataset_id>', methods=['delete'])
def projects_datasets_delete(dataset_id):
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers = {
        "Authorization": request.headers.get("Authorization", ""),
        "Project": request.headers.get("Project", ""),
        'Projectname': request.headers.get("Projectname", ""),
        'Rolename': request.headers.get("Rolename", ""),
        'Roleid': request.headers.get("Roleid", ""),
        'Referer': request.headers.get("Referer", "")
        }
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        result, status_code = vertex.projects_datasets_delete(adapter_instance, project, isCached, isInstance, connections, dataset_id)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500


@app.route('/api/service/v1/datasets/<dataset_id>/export', methods=['post'])
def projects_datasets_export_create(dataset_id):
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers = {
        "Authorization": request.headers.get("Authorization", ""),
        "Project": request.headers.get("Project", ""),
        'Projectname': request.headers.get("Projectname", ""),
        'Rolename': request.headers.get("Rolename", ""),
        'Roleid': request.headers.get("Roleid", ""),
        'Referer': request.headers.get("Referer", "")
        }
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        request_body = request.get_json()
        logger.info(f"Request body is: {str(request_body)}")
        result, status_code = vertex.projects_datasets_export_create(adapter_instance, project, isCached, isInstance, connections, dataset_id, request_body)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500


@app.route('/api/service/v1/endpoints/register', methods=['post'])
def projects_endpoints_create():
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers = {
        "Authorization": request.headers.get("Authorization", ""),
        "Project": request.headers.get("Project", ""),
        'Projectname': request.headers.get("Projectname", ""),
        'Rolename': request.headers.get("Rolename", ""),
        'Roleid': request.headers.get("Roleid", ""),
        'Referer': request.headers.get("Referer", "")
        }
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        request_body = request.get_json()
        logger.info(f"Request body is: {str(request_body)}")
        result, status_code = vertex.projects_endpoints_create(adapter_instance, project, isCached, isInstance, connections, request_body)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500


@app.route('/api/service/v1/endpoints/list', methods=['get'])
def projects_endpoints_list_list():
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers=request.headers
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        result, status_code = vertex.projects_endpoints_list_list(adapter_instance, project, isCached, isInstance, connections)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500



@app.route('/api/service/v1/endpoints/<endpoint_id>', methods=['get'])
def projects_endpoints_get(endpoint_id):
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers=request.headers
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers,isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        result, status_code = vertex.projects_endpoints_get(adapter_instance, project, isCached, isInstance, connections, endpoint_id)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500


@app.route('/api/service/v1/endpoints/<endpoint_id>/delete', methods=['delete'])
def projects_endpoints_delete(endpoint_id):
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        result, status_code = vertex.projects_endpoints_delete(adapter_instance, project, isCached, isInstance, connections, endpoint_id)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500


@app.route('/api/service/v1/endpoints/<endpoint_id>/deploy_model', methods=['post'])
def projects_endpoints_deploy_model_create(endpoint_id):
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers = {
        "Authorization": request.headers.get("Authorization", ""),
        "Project": request.headers.get("Project", ""),
        'Projectname': request.headers.get("Projectname", ""),
        'Rolename': request.headers.get("Rolename", ""),
        'Roleid': request.headers.get("Roleid", ""),
        'Referer': request.headers.get("Referer", "")
        }
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        request_body = request.get_json()
        logger.info(f"Request body is: {str(request_body)}")
        result, status_code = vertex.projects_endpoints_deploy_model_create(adapter_instance, project, isCached, isInstance, connections, endpoint_id, request_body)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500



@app.route('/api/service/v1/endpoints/<endpoint_id>/explain', methods=['post'])
def projects_endpoints_explain_create(endpoint_id):
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers = {
        "Authorization": request.headers.get("Authorization", ""),
        "Project": request.headers.get("Project", ""),
        'Projectname': request.headers.get("Projectname", ""),
        'Rolename': request.headers.get("Rolename", ""),
        'Roleid': request.headers.get("Roleid", ""),
        'Referer': request.headers.get("Referer", "")
        }
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        request_body = request.get_json()
        logger.info(f"Request body is: {str(request_body)}")
        result, status_code = vertex.projects_endpoints_explain_create(adapter_instance, project, isCached, isInstance, connections, endpoint_id, request_body)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500



@app.route('/api/service/v1/endpoints/<endpoint_id>/infer', methods=['post'])
def projects_endpoints_infer_create(endpoint_id):
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers = {
        "Authorization": request.headers.get("Authorization", ""),
        "Project": request.headers.get("Project", ""),
        'Projectname': request.headers.get("Projectname", ""),
        'Rolename': request.headers.get("Rolename", ""),
        'Roleid': request.headers.get("Roleid", ""),
        'Referer': request.headers.get("Referer", "")
        }
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        request_body = request.get_json()
        logger.info(f"Request body is: {str(request_body)}")
        result, status_code = vertex.projects_endpoints_infer_create(adapter_instance, project, isCached, isInstance, connections, endpoint_id, request_body)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500



@app.route('/api/service/v1/endpoints/<endpoint_id>/undeploy_models', methods=['post'])
def projects_endpoints_undeploy_models_create(endpoint_id):
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers = {
        "Authorization": request.headers.get("Authorization", ""),
        "Project": request.headers.get("Project", ""),
        'Projectname': request.headers.get("Projectname", ""),
        'Rolename': request.headers.get("Rolename", ""),
        'Roleid': request.headers.get("Roleid", ""),
        'Referer': request.headers.get("Referer", "")
        }
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        request_body = request.get_json()
        logger.info(f"Request body is: {str(request_body)}")
        result, status_code = vertex.projects_endpoints_undeploy_models_create(adapter_instance, project, isCached, isInstance, connections, endpoint_id, request_body)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500




@app.route('/api/service/v1/models/list', methods=['get'])
def projects_models_list():
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers=request.headers
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400
        
        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        result, status_code = vertex.projects_models_list(adapter_instance, project, isCached, isInstance, connections)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500

@app.route('/api/service/v1/models/<model_id>', methods=['get'])
def projects_models_get(model_id):
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers=request.headers
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        result, status_code = vertex.projects_models_get(adapter_instance, project, isCached, isInstance, connections, model_id)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500



@app.route('/api/service/v1/models/register', methods=['post'])
def projects_models_register_create():
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers = {
        "Authorization": request.headers.get("Authorization", ""),
        "Project": request.headers.get("Project", ""),
        'Projectname': request.headers.get("Projectname", ""),
        'Rolename': request.headers.get("Rolename", ""),
        'Roleid': request.headers.get("Roleid", ""),
        'Referer': request.headers.get("Referer", "")
        }
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        request_body = request.get_json()
        
        logger.info(f"Request body is: {str(request_body)}")
        result, status_code = vertex.projects_models_register_create(adapter_instance, project, isCached, isInstance, connections, request_body)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500



@app.route('/api/service/v1/models/<model_id>', methods=['delete'])
def projects_models_delete(model_id):
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        result, status_code = vertex.projects_models_delete(adapter_instance, project, isCached, isInstance, connections, model_id)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500


@app.route('/api/service/v1/models/<model_id>/export', methods=['post'])
def projects_models_export_create(model_id):
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers = {
        "Authorization": request.headers.get("Authorization", ""),
        "Project": request.headers.get("Project", ""),
        'Projectname': request.headers.get("Projectname", ""),
        'Rolename': request.headers.get("Rolename", ""),
        'Roleid': request.headers.get("Roleid", ""),
        'Referer': request.headers.get("Referer", "")
        }
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        request_body = request.get_json()
        logger.info(f"Request body is: {str(request_body)}")
        result, status_code = vertex.projects_models_export_create(adapter_instance, project, isCached, isInstance, connections, model_id, request_body)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500



@app.route('/api/service/v1/pipelines/training/automl', methods=['post'])
def training_automl_simplified_create():
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers = {
        "Authorization": request.headers.get("Authorization", ""),
        "Project": request.headers.get("Project", ""),
        'Projectname': request.headers.get("Projectname", ""),
        'Rolename': request.headers.get("Rolename", ""),
        'Roleid': request.headers.get("Roleid", ""),
        'Referer': request.headers.get("Referer", "")
        }
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        request_body = request.get_json()
        logger.info(f"Request body is: {str(request_body)}")
        result, status_code = vertex.training_automl_simplified_create(adapter_instance, project, isCached, isInstance, connections, request_body)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500



@app.route('/api/service/v1/pipelines/training/custom_script', methods=['post'])
def training_custom_script_create():
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers = {
        "Authorization": request.headers.get("Authorization", ""),
        "Project": request.headers.get("Project", ""),
        'Projectname': request.headers.get("Projectname", ""),
        'Rolename': request.headers.get("Rolename", ""),
        'Roleid': request.headers.get("Roleid", ""),
        'Referer': request.headers.get("Referer", "")
        }
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        request_body = request.get_json()
        return create_task_util(request_body)
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500


@app.route('/api/service/v1/pipelines/training/list', methods=['get'])
def training_istlist():
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers=request.headers
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        result, status_code = vertex.training_istlist(adapter_instance, project, isCached, isInstance, connections)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500


@app.route('/api/service/v1/pipelines/training/train', methods=['post'])
def training_train_create():
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers = {
        "Authorization": request.headers.get("Authorization", ""),
        "Project": request.headers.get("Project", ""),
        'Projectname': request.headers.get("Projectname", ""),
        'Rolename': request.headers.get("Rolename", ""),
        'Roleid': request.headers.get("Roleid", ""),
        'Referer': request.headers.get("Referer", "")
        }
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        request_body = request.get_json()
        logger.info(f"Request body is: {str(request_body)}")
        result, status_code = vertex.training_train_create(adapter_instance, project, isCached, isInstance, connections, request_body)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500


@app.route('/api/service/v1/pipelines/training/<training_job_id>/cancel', methods=['get'])
def training_cancel_list(training_job_id):
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers=request.headers
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        result, status_code = vertex.training_cancel_list(adapter_instance, project, isCached, isInstance, connections, training_job_id)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500



@app.route('/api/service/v1/pipelines/training/<training_job_id>/delete', methods=['delete'])
def training_delete(training_job_id):
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        result, status_code = vertex.training_delete(adapter_instance, project, isCached, isInstance, connections, training_job_id)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500




@app.route('/api/service/v1/pipelines/training/<training_job_id>/get', methods=['get'])
def training_get_list(training_job_id):
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers=request.headers
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        result, status_code = vertex.training_get_list(adapter_instance, project, isCached, isInstance, connections, training_job_id)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500



@app.route('/api/service/v1/pipelines/inference', methods=['post'])
def projects_inferencePipelines_create():
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers = {
        "Authorization": request.headers.get("Authorization", ""),
        "Project": request.headers.get("Project", ""),
        'Projectname': request.headers.get("Projectname", ""),
        'Rolename': request.headers.get("Rolename", ""),
        'Roleid': request.headers.get("Roleid", ""),
        'Referer': request.headers.get("Referer", "")
        }
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        request_body = request.get_json()
        logger.info(f"Request body is: {str(request_body)}")
        result, status_code = vertex.projects_inferencePipelines_create(adapter_instance, project, isCached, isInstance, connections, request_body)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500



@app.route('/api/service/v1/pipelines/inference/list', methods=['get'])
def projects_inferencePipelines_list_list():
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers=request.headers
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        result, status_code = vertex.projects_inferencePipelines_list_list(adapter_instance, project, isCached, isInstance, connections)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500



@app.route('/api/service/v1/pipelines/inference/<inference_job_id>', methods=['delete'])
def projects_inferencePipelines_delete(inference_job_id):
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        result, status_code = vertex.projects_inferencePipelines_delete(adapter_instance, project, isCached, isInstance, connections, inference_job_id)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500



@app.route('/api/service/v1/pipelines/inference/<inference_job_id>/cancel', methods=['get'])
def projects_inferencePipelines_cancel(inference_job_id):
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers=request.headers
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        request_body = request.get_json()
        logger.info(f"Request body is: {str(request_body)}")
        result, status_code = vertex.projects_inferencePipelines_cancel(adapter_instance, project, isCached, isInstance, connections, inference_job_id)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500


@app.route('/api/service/v1/pipelines/inference/<inference_job_id>/get', methods=['get'])
def projects_inferencePipelines_get(inference_job_id):
    result=""
    try:
        adapter_instance = request.args.get("adapter_instance", None)
        project = request.args.get("project", None)
        isCached = request.args.get("isCached", None)
        isInstance = request.args.get("isInstance", None)
        logger.info(f"adapter_instance: {adapter_instance}, project: {project}, isCached: {isCached}, isInstance: {isInstance}")
        headers=request.headers
        referer = request.headers.get('referer', None)
        if referer is None:
            referer = request.headers.get('Referer', None)
        logger.info(f'referrer {str(referer)}')
        if referer is None:
            result = 'referer is missing in header'
            return jsonify(result), 400

        connections = get_connection_details_with_token(referer, adapter_instance, project, headers, isInstance)
        if not connections:
            logger.info(f"Connections details is empty. {str(connections)}")
            result = "Please check if connection details are present in DB."
            return jsonify(result), 400
        result, status_code = vertex.projects_inferencePipelines_get(adapter_instance, project, isCached, isInstance, connections, inference_job_id)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500



@app.route('/api/service/v1/function/execute', methods=['post'])
def adapter_function_execute():
    result=""
    try:
        request_body = request.get_json()
        logger.info(f"Request body is: {str(request_body)}")
        result = function_execute(request_body)
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), 200
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
    return jsonify(result), 500


@app.route('/cloudconnect', methods=['post'])
def cloudconnect():
    result = ""
    try:
        payload = request.get_json()
        result, status_code = vertex.cloudconnect(payload)
        if result:
            return jsonify(result), 200
        logger.info(f"Response from mlops/<>.py is: {str(result)} !!!")
        return jsonify(result), status_code
    except Exception as err:
        result = str(err)
        exc_trace = traceback.format_exc()
        logger.info(f"Error is: {str(exc_trace)}")
        return jsonify(result), 400


if __name__ == '__main__':
    if DB_TRUNCATE == "True":
        db_operations.clean_jobs_table()
    # Start the thread to process the service queue
    Thread(target=process_service_queue, daemon=True).start()

    # Register the exit handler to ensure cleanup at application exit
    atexit.register(cleanup_threads_and_db)
    port = os.environ.get('PYJOB_EXECUTER_PORT','5007')
    app.run(debug=False, host='0.0.0.0', port = port)
    logger.info('Shutting down application')
