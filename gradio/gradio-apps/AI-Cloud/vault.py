import requests
from pathlib import Path
import logging as logger
import json
import os
from urllib.parse import urlparse, urljoin
import configparser

def getVaultConfigs(configName):
    path = Path(__file__).parent
    config = configparser.ConfigParser()
    config.read(os.path.join(path, 'urls.ini'))
    value = config['VAULT'][configName]
    return value

def getValue(vaultKey):
    #get Token
    authUrl= urljoin(getVaultConfigs('VAULT_URI'),'/auth/approle/login')
    authParams = {}
    authParams["role_id"] =  getVaultConfigs('VAULT_APPROLE_ROLEID')
    authParams["secret_id"] = getVaultConfigs('VAULT_APPROLE_SECRETID')
    VAULT_HOST = urlparse(getVaultConfigs('VAULT_URI')).hostname

    response = requests.request(method='POST',url=authUrl,data = json.dumps(authParams),verify=False)
    token=""
    if response.status_code == 200 :
        responseJson = response.json()
        url  =  urljoin(getVaultConfigs('VAULT_URI'),(getVaultConfigs('VAULT_APPLICATION_NAME')+'/'+getVaultConfigs('VAULT_PROFILES')))
        token = responseJson['auth']['client_token']

        header = {}
        header['X-Vault-Token'] = token
        response = requests.request(method='GET', url=url, headers=header, verify=False)
        if(response.status_code == 200):
            try:
                resJson = response.json()
                for key in resJson['data']['data']:
                    if key == vaultKey:
                        return resJson['data']['data'][key]
            except:
                logger.error("Error while retieving key from Vault")
        else:
            logger.error("Error while retieving key from Vault. Response Code : {0}".format(response.status_code))
    else :
        logger.error('Token Failure')
