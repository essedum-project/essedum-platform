from requests import auth
from essedum.core.iExtractor import Extractor
from urllib.parse import urlparse
import requests
from requests.auth import HTTPBasicAuth
from essedum.utils import configVariables
from essedum.utils.Utilities import Utilities
from essedum.utils import vault
import json
import logging as logger
import warnings



class MLFLOW(Extractor):

    def __init__(self, datasource_attributes, dataset_attributes):    
        warnings.filterwarnings('ignore')
        self.connection_type = datasource_attributes.get("ConnectionType")
        self.auth_type = datasource_attributes.get("AuthType")
        self.auth_details = datasource_attributes.get("AuthDetails")
        self.test_dataset = datasource_attributes.get("testDataset")
        self.noProxy = datasource_attributes.get("noProxy", "false")
        self.vaultkey =self.auth_details['password'] if 'password_vault' in self.auth_details.keys() and self.auth_details['password_vault']== True else ''
        self.salt = datasource_attributes.get("salt", "")

        self.url = dataset_attributes.get("Url")
        self.method = dataset_attributes.get("RequestMethod", "GET")
        self.path = dataset_attributes.get("EndPoint", "")
        self.params = dataset_attributes.get("QueryParams", "")
        self.headers = dataset_attributes.get("Headers", "")
        self.requestBody = dataset_attributes.get("Body", "")
        self.documentElement = dataset_attributes.get("TransformationScript", "")
        self.isStreaming = dataset_attributes.get("isStreaming", "false")

    def getDataset(self, spark_session):
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
                                        proxies=PROXIES, auth=AUTH, verify=True, data=self.requestBody,
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

            auth_response = requests.request(method=auth_method, url=auth_url ,params=auth_params, headers = auth_headers,
                                            timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))

            if token_element!="":
                auth_token = json.loads(str(auth_response)).get(token_element)

            else:
                auth_token= auth_response.json()

        elif self.auth_type.lower() == "noauth":
            flag = True
            entity_list = []
            data = None
            data_type=None
            while(flag):
                response = requests.request(method=self.method, url=URL, headers=HEADERS, params=params,
                                            proxies=PROXIES,
                                            verify=True, data=self.requestBody,
                                            timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))
                data = response.json()
                data_keys = list(data.keys())
                if 'entities' in data_keys:
                    data_type='entities'
                elif 'events' in data_keys:
                    data_type='events'
                elif 'problems' in data_keys:
                    data_type='problems'
                elif 'result' in data_keys:
                    data_type='result' 
                
                if data_type is not None:                 
                    for item in data[data_type]:
                        entity_list.append(item)
                    if 'nextPageKey' in data_keys:
                        url = URL.split('?')[0]
                        URL = url
                        params['nextPageKey'] = data['nextPageKey']                    
                    elif 'nextCursor' in data_keys:
                        url = URL.split('?')[0]
                        URL = url
                        params['nextCursor'] = data['nextCursor']
                    else:
                        flag = False
            if data_type is not None:           
                data[data_type] = entity_list
                response = json.dumps(data,indent=4)
           
        if auth_token!= "":
            HEADERS['Authorization'] = header_prefix + " " + auth_token
            response = requests.request(method=self.method, url=URL, headers=HEADERS, params=params,
                                        proxies=PROXIES, verify=True, data=self.requestBody,
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
            
            if str(enc_password).startswith('enc'):
                Utilities.decrypt(enc_password, self.salt)
            elif self.vaultkey != "":
                vault.getPassword(self.vaultkey)
            AUTH = HTTPBasicAuth(username, enc_password)

            response = requests.request(method=self.method, url=URL, headers=HEADERS, params=params,
                                        proxies=PROXIES, auth=AUTH, verify=True, data=self.requestBody,
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

            auth_response = requests.request(method=auth_method, url=auth_url, params=auth_params, headers=auth_headers,
                                            timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))

            if token_element != "":
                if (auth_response is str):
                    auth_token = json.loads(str(auth_response)).get(token_element)
                elif (auth_response is dict):
                    auth_token = auth_response.get(token_element)

            else:
                auth_token = auth_response.json()

        elif self.auth_type.lower() == "noauth":
            flag = True
            entity_list = []
            data = None
            data_type=None
            dt_auth_token = params['API-Token']
            while(flag):
                response = requests.request(method=self.method, url=URL, headers=HEADERS, params=params,
                                            proxies=PROXIES,
                                            verify=True, data=self.requestBody,
                                            timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))
                
                data = response.json()
                data_keys = list(data.keys())
                if 'entities' in data_keys:
                    data_type='entities'
                elif 'events' in data_keys:
                    data_type='events'
                elif 'problems' in data_keys:
                    data_type='problems'
                elif 'result' in data_keys:
                    data_type='result' 
                
                if data_type is not None:                 
                    for item in data[data_type]:
                        entity_list.append(item)
                    if 'nextPageKey' in data_keys:
                        if data['nextPageKey'] is not None:
                            url = URL.split('?')[0]
                            URL = url
                            params = {}
                            params['nextPageKey'] = data['nextPageKey']
                        else:
                            flag=False
                    elif 'nextCursor' in data_keys and data['nextCursor'] is not None:
                        url = URL.split('?')[0]
                        URL = url
                        params = {}
                        params['cursor'] = data['nextCursor']
                    else:
                        flag = False
                    params['API-Token'] = dt_auth_token
                    
                        
                else:
                    flag = False
                    
            if data_type is not None:           
                data[data_type] = entity_list
                response = json.dumps(data,indent=4)
        if auth_token != "":
            HEADERS['Authorization'] = header_prefix + " " + auth_token
            response = requests.request(method=self.method, url=URL, headers=HEADERS, params=params,
                                        proxies=PROXIES, verify=True, data=self.requestBody,
                                        timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))

        # logger.info("Response Code: {0}".format(response.status_code))

        return response

    def getStreamingDataset(self, spark_session):
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

            auth_response = requests.request(method=auth_method, url=auth_url, params=auth_params, headers=auth_headers,
                                            timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))

            if token_element != "":
                if(auth_response is str):
                    auth_token = json.loads(str(auth_response)).get(token_element)
                elif(auth_response is dict):
                    auth_token = auth_response.get(token_element)
            else:
                auth_token = auth_response.json()

        elif self.auth_type.lower() == "noauth":
            requests.request(method=self.method, url=URL, headers=HEADERS, params=params,
                                        proxies=PROXIES, verify=True, data=self.requestBody,
                                        timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))

        if auth_token != "":
            HEADERS['Authorization'] = header_prefix + " " + auth_token

        ses.headers=HEADERS

        return ses