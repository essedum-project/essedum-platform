from pathlib import Path
import configparser
import os


def get_config():
    path = Path(__file__).parent
    config = configparser.ConfigParser()
    config.read(os.path.join(path, 'conf/conf.ini'))
    return config


config = get_config()
THREAD_COUNT = int(config['DEFAULT']['ThreadCount'])
WORKING_DIRECTORY = config['DEFAULT']['WorkingDirectory']
DB_TRUNCATE = config['DEFAULT']['DbTruncate']
PROXY = config['DEFAULT']['PROXY']
NOPROXY = config['DEFAULT']['NOPROXY']
MYSQLREFERER=config['DEFAULT']['MYSQLREFERER'].split(',')
POSTGRESSREFERER=config['DEFAULT']['POSTGRESSREFERER'].split(',')
REFERER=config['DEFAULT']['REFERER'].split(',')

DB_CONNECTIONS = {}
for referer in REFERER:
    DB_CONNECTIONS[referer] = {}
    DB_CONNECTIONS[referer]['TOKEN'] = config[referer]['TOKEN']

