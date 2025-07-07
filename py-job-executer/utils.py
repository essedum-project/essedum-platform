from pathlib import Path
import configparser
import os

def get_config():
    path = Path(__file__).parent
    config = configparser.ConfigParser()
    config.read(os.path.join(path, 'conf/conf.ini'))
    return config


config = get_config()

working_directory_raw = config['DEFAULT']['WorkingDirectory']
WORKING_DIRECTORY = Path(__file__).parent.parent / working_directory_raw
THREAD_COUNT = int(config['DEFAULT']['ThreadCount'])
DB_TRUNCATE = config['DEFAULT']['DbTruncate']
TASK_RETRIVER = config['DEFAULT']['task_retriver']
EXECUTER_NAME = config['DEFAULT']['executer_name']
USE_TASK_RETRIVER = config['DEFAULT']['use_task_retriver']