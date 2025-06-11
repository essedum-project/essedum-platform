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
from datetime import datetime
from functionadapter import function_execute
from importlib import import_module
import asyncio


if USE_TASK_RETRIVER:
    task_retriver_module = import_module(f"task_retriver.{TASK_RETRIVER}")
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


def process_service_request(task, entry_id=''):
    """Process a service request."""
    try:
        with process_lock:
            db_operations.update_job_status(task.id, 'RUNNING')
            db_operations.update_job_start_time(task.id)
            if entry_id:
                asyncio.run(task_retriver_module.update_db(entry_id, 'job_status', 'RUNNING'))
        result = task.execute_script()
        if result["return_code"] == 0:
            with process_lock:
                db_operations.update_job_status(task.id,'COMPLETED')
                if entry_id:
                    asyncio.run(task_retriver_module.update_db(entry_id, 'job_status', 'COMPLETED'))
        else:
            with process_lock:
                db_operations.update_job_status(task.id, 'ERROR')
                if entry_id:
                    asyncio.run(task_retriver_module.update_db(entry_id, 'job_status', 'ERROR'))
        with process_lock:
            db_operations.update_job_finish_time(task.id)
            db_operations.update_job_pid(task.id,result["pid"])
    except Exception as e:
        with process_lock:
            db_operations.update_job_status(task.id, 'ERROR')
            if entry_id:
                asyncio.run(task_retriver_module.update_db(entry_id, 'job_status', 'ERROR'))
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
        submitted = datetime.strptime(task["submitted"], '%Y-%m-%d %H:%M:%S.%f%z')
        if task["finished"] != None:
            finish = datetime.strptime(task["finished"], '%Y-%m-%d %H:%M:%S.%f%z')
        result = {
            "task_id": task_id,
            "pid":task["pid"],
            "task_status": task["status"],
            "log_path": task["logpath"],
            "output_dir": '/'.join(task["logpath"].split('/')[:-1]) + '/outputs',
            "submitted":task["submitted"],
            "started":task["started"],
            "finished":task["finished"],
            "timestamp": (finish - submitted).total_seconds() if task["status"] in ['COMPLETED', 'ERROR', 'CANCELLED'] else None
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
        result=''
        print('task', task)
        if task is None:
            abort(404)

        process_stop_flag = False
        if task['pid'] is not None and task['status'] == 'RUNNING':
            # os.kill(int(task['pid']), signal.SIGTERM)
            parent_pid = int(task['pid'])
            parent = psutil.Process(parent_pid)
            if parent !=None:
                for child in parent.children(recursive=True):  # or parent.children() for recursive=False
                    print('Killing child with pid: ', child.pid)
                    child.kill()
                parent.kill()
                process_stop_flag = True
                result = {'Task cancelled': process_stop_flag}
            else:
                result = {'Task cancelled': 'PID not found'}
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

            result = {'Task cancelled': process_stop_flag}

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
        log_file = WORKING_DIRECTORY / task_folder / 'log.txt'
        
        with open(log_file,'r', encoding='utf-8', errors='ignore') as f:
            log=f.read()
        
        result={
            'logs':{'content':log}     
        }
        return jsonify(result)
    except Exception as e:
        logger.error('Exception occured', exc_info=True)
        return jsonify({'logs': {'content':'Log not found'} } )
    
# get logs
@app.route('/execute/<task_id>/getOutputArtifacts', methods=['GET'])
def get_task_output_artifacts(task_id):
    try:
        task_folder=str(task_id)
        output_dir = WORKING_DIRECTORY / task_folder / 'output_dir'
        
        result={}

        if os.path.exists(output_dir):
            for file in os.listdir(output_dir):
                if '.' in file:
                    file_path = os.path.join(output_dir, file)
                    key = file.split('.')[0]
                    with open(file_path,'r', encoding='utf-8', errors='ignore') as f:
                        log=f.read()
                    result[key] = {'content':log}
       
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


def create_task_util(payload, push_in_queue=True, entry_id=''):
    id = str(uuid.uuid4())
    bucket = payload.get("bucket","")
    project_id = payload.get("project_id","")
    name = payload.get("name","")
    version = payload.get("version","")
    credentials = payload.get("credentials","")
    key = payload.get("input_artifacts","")
    command = payload.get("command","")
    storage=payload.get("storage", "local")
    env=payload.get("environment", "")
    
    if isinstance(env, str):
        payload["environment"] = {}
        env = {}

    valid_parameters = {"bucket", "project_id", "name", "version", "credentials", "input_artifacts", "command", "storage", "environment"}
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

    task = Task(id,bucket,project_id, name, version, credentials, key, command, storage, env)
    db_operations.create_job(task)
    push_task_in_queue(task) if push_in_queue else push_in_executor(task,entry_id)
    response = {
        "task_id": task.id,
        "task_status": "Submitted",
        "log_path": task.log_path
    }
    return response

def push_in_executor(task, entry_id):
    future = executor.submit(process_service_request, task, entry_id)
    logger.info('Task submitted, executor!')
    submitted_futures[task.id] = future

def push_task_in_queue(task):
    q.put(task)
    pause_event.set()

# create a new queue task
@app.route('/execute', methods=['POST'])
def create_task():
    if not request.get_json():
        abort(400)
    payload = request.get_json()
    return create_task_util(payload)

@app.route('/execute', methods=['GET'])
def get_tasks():
    tasks = db_operations.get_jobs(limit=100)
    if tasks is None:
        abort(404)
    return jsonify(tasks)

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

@app.route('/venvs', methods=['DELETE'])
def delete_venv():
    if not request.get_json():
        abort(400)
    try:
        venvs_to_delete = request.get_json()
        venvs_path = os.path.join(os.getcwd(), "venvs")
        if not os.path.exists(venvs_path):
            return jsonify({"error": "venvs directory not found"}), 404
        deleted_venvs = []
        not_found_venvs = []
        for venv in venvs_to_delete:
            venv_path = os.path.join(venvs_path, venv)
            if os.path.exists(venv_path) and os.path.isdir(venv_path):
                try:
                    import shutil
                    shutil.rmtree(venv_path)
                    deleted_venvs.append(venv)
                except Exception as e:
                    logger.error(f"Failed to delete venv {venv}: {e}", exc_info=True)
            else:
                not_found_venvs.append(venv)
        response = {
            "deleted": deleted_venvs,
            "not_found": not_found_venvs
        }
        return jsonify(response), 200
    except Exception as err:
        logger.error(f'Exception occured: {err}', exc_info=True)
        return jsonify({"status": "failed to delete venv"}), 500

@app.route('/venvs', methods=['GET'])
def get_venvs():
    try:
        venvs_path = os.path.join(os.getcwd(), "venvs")
        if not os.path.exists(venvs_path):
            return jsonify({"error": "venvs directory not found"}), 404
        created_venvs = [venv for venv in os.listdir(venvs_path) if os.path.isdir(os.path.join(venvs_path, venv))]
        return created_venvs, 200
    except Exception as err:
        logger.error(f'Exception occured: {err}', exc_info=True)
        return jsonify({"status": "failed to get venvs"}), 500

if __name__ == '__main__':
    if DB_TRUNCATE == "True":
        db_operations.clean_jobs_table()
    # Start the thread to process the service queue
    Thread(target=process_service_queue, daemon=True).start()
    if USE_TASK_RETRIVER == "True":
        Thread(target=task_retriver_module.start_fetch_tasks, daemon=True).start()
    # Register the exit handler to ensure cleanup at application exit
    atexit.register(cleanup_threads_and_db)
    port = os.environ.get('PYJOB_EXECUTER_PORT','5000')
    app.run(debug=False, host='0.0.0.0', port = port)
    logger.info('Shutting down application')