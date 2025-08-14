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

DB_CONNECTIONS = {}
for referer in MYSQLREFERER:
    DB_CONNECTIONS[referer] = {}
    DB_CONNECTIONS[referer]['USER'] = config[referer]['USER']
    DB_CONNECTIONS[referer]['PASSWORD'] = config[referer]['PASSWORD']
    DB_CONNECTIONS[referer]['HOST'] = config[referer]['HOST']
    DB_CONNECTIONS[referer]['PORT'] = int(config[referer]['PORT'])
    DB_CONNECTIONS[referer]['DATABASE'] = config[referer]['DATABASE']
    DB_CONNECTIONS[referer]['TOKEN'] = config[referer]['TOKEN']
