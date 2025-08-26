from essedum.core.iLoader import Loader
from essedum.utils.Utilities import Utilities
import requests
from urllib.parse import urlparse, urljoin
from requests.auth import HTTPBasicAuth
import json
from essedum.utils import configVariables
import logging as logger
from essedum.utils import vault

class REST(Loader):
    def __init__(self, datasource_attributes, dataset_attributes):
        self.url = datasource_attributes.get("url")

        self.auth = datasource_attributes.get("auth", "no_auth")

        self.authUrl = datasource_attributes.get("authUrl", "")
        self.authToken = datasource_attributes.get("authToken", "")
        self.authParams = datasource_attributes.get("authParams", "")
        self.noProxy = datasource_attributes.get("noProxy", "false")
        self.user = datasource_attributes.get("username","")
        self.vaultkey = datasource_attributes.get("vaultkey", "")
        if self.vaultkey != "":
            self.password = vault.getPassword(self.vaultkey)
        else:
            self.password = Utilities.decrypt(datasource_attributes.get("password", ""),
                                              datasource_attributes.get("salt", ""))
        self.path = dataset_attributes.get("EndPoints", "")
        self.method = dataset_attributes.get("API Type", "POST")
        self.params = dataset_attributes.get("Query Params", "")
        self.headers = dataset_attributes.get("Headers", "")
        self.requestBody = dataset_attributes.get("Request Body", "")

    def loadDataset(self, dataset, spark_session, runtime):

        logger.info("Writing REST Dataset")

        URL = urljoin(self.url, self.path)
        HEADERS = None
        if self.headers != "" and self.headers is not None:
            HEADERS = json.loads(self.headers)

        PROXIES = {}
        hostname = urlparse(URL).hostname
        if (hostname != '' and hostname not in configVariables.NO_PROXY.split(',')) \
                or (self.noProxy.lower() == "true"):
            logger.info("Removing Proxy")
            PROXIES['http'] = ''
            PROXIES['https'] = ''

        if self.auth.lower() == "basicauth":
            AUTH = HTTPBasicAuth(self.user, self.password)
            response = requests.request(method=self.method, url=URL, headers=HEADERS, params=self.params,
                                        proxies=PROXIES, auth=AUTH,
                                        verify=True, data=dataset,
                                        timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))
        elif self.auth.lower() == "token":
            token_dataset = auth_details.get("tokenDataset")
            
            dataset_attributes = token_dataset["attributes"]
            if type(dataset_attributes) is str:
                dataset_attributes = json.loads(dataset_attributes)
            
            datasource = token_dataset["datasource"]
            datasource_attributes = json.loads(datasource["connectionDetails"])
            datasource_attributes["salt"] = datasource.get("salt", "")
            
            extractor = REST(datasource_attributes, dataset_attributes)
           
                                       	
        elif self.authUrl != "":
            auth_params = json.loads(self.authParams)
            params = []
            for key in auth_params:
                params.append("{0}={1}".format(key, auth_params[key]))

            HEADERS = {}
            HEADERS['Authorization'] = "Bearer " + self.authToken

            response = requests.request(method=self.method, url=URL, headers=HEADERS, params=self.params,
                                        proxies=PROXIES, verify=True, data=dataset,
                                        timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))
            
        elif self.auth.lower() == "bearertoken":
            HEADERS = {}
            HEADERS['Authorization'] = "Bearer " + self.authToken

            response = requests.request(method=self.method, url=URL, headers=HEADERS, params=self.params,
                                        proxies=PROXIES, verify=True, data=dataset,
                                        timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))
        else:
            response = requests.request(method=self.method, url=URL, headers=HEADERS, params=self.params,
                                        proxies=PROXIES,
                                        verify=True, data=dataset,
                                        timeout=(configVariables.CONNECT_TIMEOUT, configVariables.READ_TIMEOUT))

        logger.info("Response Code: {0}".format(response.status_code))

    def loadStreamingDataset(self, dataset, spark_session, runtime):
        # implement streaming dataset if supported by spark
        logger.info("Streaming Loader for type REST is not supported. Set streaming to False in dataset configuration")
        return None
