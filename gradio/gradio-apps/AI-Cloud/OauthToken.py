import requests
import json
from pathlib import Path
import configparser
import os
import vault

def get_new_token():
    path = Path(__file__).parent
    config = configparser.ConfigParser()
    config.read(os.path.join(path,'urls.ini'))

    isvaultEnabled = config['VAULT']['ENABLED']
    
    url = config['OAUTH']['url']
    client_id =config['OAUTH']['client_id']
    client_secret=config['OAUTH']['client_secret']
    grant_type=config['OAUTH']['grant_type']
    scope=config['OAUTH']['scope']
    if isvaultEnabled=="True":
        url = vault.getValue(url)
        
    payload = 'client_id={0}&client_secret={1}&scope={2}&grant_type={3}'.format(client_id,client_secret,scope,grant_type)
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
            }

    response = requests.request("POST", url, headers=headers, data=payload)
    if response.status_code != 200:
        print("Failed to obtain token from the OAuth 2.0 server")
        return ""
    else:
        tokens = json.loads(response.text)
        return tokens['access_token']
