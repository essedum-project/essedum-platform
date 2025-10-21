from requests import auth
from leap.core.iExtractor import Extractor
from urllib.parse import urlparse
import requests
from requests.auth import HTTPBasicAuth
from leap.utils import configVariables
from leap.utils.Utilities import Utilities
from leap.utils import vault
import json
import logging as logger
import warnings



class MLFLOW(Extractor):

    def __init__(self, datasourceAttributes, datasetAttributes):    
        warnings.filterwarnings('ignore')
        self.connection_type = datasourceAttributes.get("ConnectionType")
        self.auth_type = datasourceAttributes.get("AuthType")
        self.auth_details = datasourceAttributes.get("AuthDetails")
        self.test_dataset = datasourceAttributes.get("testDataset")
        self.noProxy = datasourceAttributes.get("noProxy", "false")
        self.vaultkey =self.auth_details['password'] if 'password_vault' in self.auth_details.keys() and self.auth_details['password_vault']== True else ''
        self.salt = datasourceAttributes.get("salt", "")

        self.url = datasetAttributes.get("Url")
        self.method = datasetAttributes.get("RequestMethod", "GET")
        self.path = datasetAttributes.get("EndPoint", "")
        self.params = datasetAttributes.get("QueryParams", "")
        self.headers = datasetAttributes.get("Headers", "")
        self.requestBody = datasetAttributes.get("Body", "")
        self.documentElement = datasetAttributes.get("TransformationScript", "")
        self.isStreaming = datasetAttributes.get("isStreaming", "false")

    def getDataset(self, sparkSession):
        # warnings.filterwarnings('ignore')
        logger.info("Reading rest Dataset")
        if self.connection_type.lower() == "apirequest":
            URL = self.url
        elif self.connection_type.lower() == "apispec":
            URL = self.url + self.path
        logger.info("Connecting to URL {0}".format(URL))

        PROXIES = {}
        hostname = urlparse(URL).hostname
        if (hostname != '' and hostname in configVariables.NO_PROXY.split(',')) or (self.noProxy.lower() == 'true'):
            logger.info("Removing Proxy")
            PROXIES['http'] = ''
            PROXIES['https'] = ''
        auth_details=self.auth_details
        auth_token=""

        header_prefix = "Bearer"
        response = ""

        params = {}
        HEADERS = {}
        if self.params != '':
            params_list = self.params
            for item in params_list:
                item_obj = item
                params[item_obj.get("key")] = item_obj.get("value")

        if self.headers != '':
            headers_list=self.headers
            for item in headers_list:
                item_obj=item
                HEADERS[item_obj.get("key")] = item_obj.get("value")

        if self.auth_type.lower() == "basicauth":

            username = auth_details.get("username")
            enc_password = auth_details.get("password")
            password=None
            if str(enc_password).startswith('enc'):
                password = Utilities.decrypt(enc_password, self.salt)
            elif self.vaultkey != "":
                password = vault.getPassword(self.vaultkey)
            AUTH = HTTPBasicAuth(username, password)

            response = requests.request(method=self.method, url=URL, headers=HEADERS, params=params,
                                        proxies=PROXIES, auth=AUTH, verify=False, data=self.requestBody,
                                        timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))

        elif self.auth_type.lower() == "bearertoken":
            auth_token = auth_details.get("authToken")

        elif self.auth_type.lower() == "oauth":
            auth_url = auth_details.get("authUrl")
            auth_params = auth_details.get("authParams")
            auth_headers = auth_details.get("authHeaders")
            header_prefix = auth_details.get("HeaderPrefix")
            auth_method = auth_details.get("authMethod" , "GET")
            token_element = auth_details.get("tokenElement", "")

            authResponse = requests.request(method=auth_method, url=auth_url ,params=auth_params, headers = auth_headers,
                                            timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))

            if token_element!="":
                auth_token = json.loads(str(authResponse)).get(token_element)

            else:
                auth_token= authResponse.json()

        elif self.auth_type.lower() == "noauth":
            flag = True
            entityList = []
            data = None
            dataType=None
            while(flag):
                response = requests.request(method=self.method, url=URL, headers=HEADERS, params=params,
                                            proxies=PROXIES,
                                            verify=False, data=self.requestBody,
                                            timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))
                data = response.json()
                dataKeys = list(data.keys())
                if 'entities' in dataKeys:
                    dataType='entities'
                elif 'events' in dataKeys:
                    dataType='events'
                elif 'problems' in dataKeys:
                    dataType='problems'
                elif 'events' in dataKeys:
                    dataType='events'
                elif 'result' in dataKeys:
                    dataType='result' 
                
                if dataType is not None:                 
                    for item in data[dataType]:
                        entityList.append(item)
                    if 'nextPageKey' in dataKeys:
                        url = URL.split('?')[0]
                        URL = url
                        params['nextPageKey'] = data['nextPageKey']                    
                    elif 'nextCursor' in dataKeys:
                        url = URL.split('?')[0]
                        URL = url
                        params['nextCursor'] = data['nextCursor']
                    else:
                        flag = False
            if dataType is not None:           
                data[dataType] = entityList
                response = json.dumps(data,indent=4)
           
        if auth_token!= "":
            HEADERS['Authorization'] = header_prefix + " " + auth_token
            response = requests.request(method=self.method, url=URL, headers=HEADERS, params=params,
                                        proxies=PROXIES, verify=False, data=self.requestBody,
                                        timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))

        # logger.info("Response Code: {0}".format(response.status_code))

        return response

    def getData(self):
        # warnings.filterwarnings('ignore')
        logger.info("Reading rest Dataset")
        if self.connection_type.lower() == "apirequest":
            URL = self.url
        elif self.connection_type.lower() == "apispec":
            URL = self.url + self.path
        logger.info("Connecting to URL {0}".format(URL))

        PROXIES = {}
        hostname = urlparse(URL).hostname
        if (hostname != '' and hostname in configVariables.NO_PROXY.split(',')) or (self.noProxy.lower() == 'true'):
            logger.info("Removing Proxy")
            PROXIES['http'] = ''
            PROXIES['https'] = ''
        # auth_details = json.loads(self.auth_details)
        auth_details = self.auth_details
        auth_token = ""

        header_prefix = "Bearer"
        response = ""

        params = {}
        HEADERS = {}
        if self.params != '':
            params_list = self.params
            for item in params_list:
                item_obj = item
                params[item_obj.get("key")] = item_obj.get("value")
        if self.headers != '':
            headers_list = self.headers
            for item in headers_list:
                item_obj = item
                HEADERS[item_obj.get("key")] = item_obj.get("value")

        if self.auth_type.lower() == "basicauth":
            username = auth_details.get("username")
            enc_password = auth_details.get("password")
            password = None
            if str(enc_password).startswith('enc'):
                password = Utilities.decrypt(enc_password, self.salt)
            elif self.vaultkey != "":
                password = vault.getPassword(self.vaultkey)
            AUTH = HTTPBasicAuth(username, enc_password)

            response = requests.request(method=self.method, url=URL, headers=HEADERS, params=params,
                                        proxies=PROXIES, auth=AUTH, verify=False, data=self.requestBody,
                                        timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))

        elif self.auth_type.lower() == "bearertoken":
            auth_token = auth_details.get("authToken")

        elif self.auth_type.lower() == "oauth":
            auth_url = auth_details.get("authUrl")
            auth_params = auth_details.get("authParams")
            auth_headers = auth_details.get("authHeaders")
            header_prefix = auth_details.get("HeaderPrefix")
            auth_method = auth_details.get("authMethod", "GET")
            token_element = auth_details.get("tokenElement", "")

            authResponse = requests.request(method=auth_method, url=auth_url, params=auth_params, headers=auth_headers,
                                            timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))

            if token_element != "":
                if (authResponse is str):
                    auth_token = json.loads(str(authResponse)).get(token_element)
                elif (authResponse is dict):
                    auth_token = authResponse.get(token_element)

            else:
                auth_token = authResponse.json()

        elif self.auth_type.lower() == "noauth":
            flag = True
            entityList = []
            data = None
            dataType=None
            dtAuthToken = params['API-Token']
            while(flag):
                response = requests.request(method=self.method, url=URL, headers=HEADERS, params=params,
                                            proxies=PROXIES,
                                            verify=False, data=self.requestBody,
                                            timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))
                
                data = response.json()
                dataKeys = list(data.keys())
                if 'entities' in dataKeys:
                    dataType='entities'
                elif 'events' in dataKeys:
                    dataType='events'
                elif 'problems' in dataKeys:
                    dataType='problems'
                elif 'events' in dataKeys:
                    dataType='events'
                elif 'result' in dataKeys:
                    dataType='result' 
                
                if dataType is not None:                 
                    for item in data[dataType]:
                        entityList.append(item)
                    if 'nextPageKey' in dataKeys:
                        if data['nextPageKey'] is not None:
                            url = URL.split('?')[0]
                            URL = url
                            params = {}
                            params['nextPageKey'] = data['nextPageKey']
                        else:
                            flag=False
                    elif 'nextCursor' in dataKeys and data['nextCursor'] is not None:
                        url = URL.split('?')[0]
                        URL = url
                        params = {}
                        params['cursor'] = data['nextCursor']
                    else:
                        flag = False
                    params['API-Token'] = dtAuthToken
                    
                        
                else:
                    flag = False
                    
            if dataType is not None:           
                data[dataType] = entityList
                response = json.dumps(data,indent=4)
        if auth_token != "":
            HEADERS['Authorization'] = header_prefix + " " + auth_token
            response = requests.request(method=self.method, url=URL, headers=HEADERS, params=params,
                                        proxies=PROXIES, verify=False, data=self.requestBody,
                                        timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))

        # logger.info("Response Code: {0}".format(response.status_code))

        return response

    def getStreamingDataset(self, sparkSession):
        # implement streaming dataset if supported by spark
        logger.info(
            "Streaming Extractor for type REST is not supported. Set streaming to False in dataset configuration")
        return None

    def getConnection(self):

        ses = requests.session()
        ses.timeout = (configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT)

        if self.connection_type.lower() == "api request":
            URL = self.path
        elif self.connection_type.lower() == "apispec":
            URL = self.url + self.path
        logger.info("Connecting to URL {0}".format(URL))

        PROXIES = {}
        hostname = urlparse(URL).hostname
        if (hostname != '' and hostname in configVariables.NO_PROXY.split(',')) or (self.noProxy.lower() == 'true'):
            logger.info("Removing Proxy")
            PROXIES['http'] = ''
            PROXIES['https'] = ''

        ses.proxies = PROXIES
        ses.url = URL
        auth_details =self.auth_details
        auth_token = ""
        header_prefix = "Bearer"

        params = {}
        HEADERS = {}
        if self.params != '':
            params_list = self.params
            for item in params_list:
                item_obj = item
                params[item_obj.get("key")] = item_obj.get("value")
        ses.params = params

        if self.headers != '':
            headers_list = json.loads(self.headers)
            for item in headers_list:
                item_obj = item
                HEADERS[item_obj.get("key")] = item_obj.get("value")

        if self.auth_type.lower() == "basicauth":

            username = auth_details.get("username")
            enc_password = auth_details.get("password")
            password = None
            if str(enc_password).startswith('enc'):
                password = Utilities.decrypt(enc_password, self.salt)
            elif self.vaultkey != "":
                password = vault.getPassword(self.vaultkey)
            ses.auth = (username, password)

        elif self.auth_type.lower() == "bearertoken":
            auth_token = auth_details.get("authToken")

        elif self.auth_type.lower() == "oauth":
            auth_url = auth_details.get("authUrl")
            auth_params = auth_details.get("authParams")
            auth_headers = auth_details.get("authHeaders")
            header_prefix = auth_details.get("HeaderPrefix")
            auth_method = auth_details.get("authMethod", "GET")
            token_element = auth_details.get("tokenElement", "")

            authResponse = requests.request(method=auth_method, url=auth_url, params=auth_params, headers=auth_headers,
                                            timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))

            if token_element != "":
                if(authResponse is str):
                    auth_token = json.loads(str(authResponse)).get(token_element)
                elif(authResponse is dict):
                    auth_token = authResponse.get(token_element)
            else:
                auth_token = authResponse.json()

        elif self.auth_type.lower() == "noauth":
            response = requests.request(method=self.method, url=URL, headers=HEADERS, params=params,
                                        proxies=PROXIES, verify=False, data=self.requestBody,
                                        timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))

        if auth_token != "":
            HEADERS['Authorization'] = header_prefix + " " + auth_token

        ses.headers=HEADERS

        return ses
