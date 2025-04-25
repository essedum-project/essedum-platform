#Version: 1.0
#Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
#this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
#rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
#transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
#recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
#criminal penalties, and will be prosecuted to the maximum extent possible under the law.


import ast
from urllib.parse import urlparse
from leaputils import Vault
from leaputils import Security
import pyodbc

class MSSQL():
    def __init__(self,  datasourceAttributes, datasetAttributes):
        self.url = datasourceAttributes.get("url","")
        self.user = datasourceAttributes.get("userName", "")
        self.vaultkey = datasourceAttributes.get("vaultkey", "")
        if self.vaultkey != "":
            self.password = vault.getPassword(self.vaultkey)
        else:
            self.password = Security.decrypt(datasourceAttributes.get("password", ""),
                                              datasourceAttributes.get("salt", ""))
        self.query = datasetAttributes.get("Query", "")
        self.params = datasetAttributes.get("params", "")
        self.applySchema = datasetAttributes.get("applySchema", False)
        self.schema = datasetAttributes.get("schema", "")
        self.isStreaming = datasetAttributes.get("isStreaming", "false")
    
    def getConnection(self):
        url= self.url       
        if 'ActiveDirectoryServicePrincipal' in url :
            temp1 = self.url.split('//')
            temp2 = temp1[1].split(';')
            if temp2[0].index(':'):
                server = temp2[0].split(':')[0]
            else:
                server = temp2[0]
            database = (temp2[1].split('='))[1]
            
                # Active Directory Service Principal authentication
            connectionString = (
                    f'DRIVER={{ODBC Driver 18 for SQL Server}};'
                    f'SERVER={server};'
                    f'DATABASE={database};'
                    'Authentication=ActiveDirectoryServicePrincipal;'
                    f'UID={self.user};'
                    f'PWD={self.password};'
                    'Encrypt=yes;'
                    'TrustServerCertificate=no;'
                    'HostNameInCertificate=*.database.windows.net;'
                    'LoginTimeout=120'
                )
            connection = pyodbc.connect(connectionString)
        elif 'ActiveDirectoryPassword' in url :
            temp1 = self.url.split('//')
            temp2 = temp1[1].split(';')
            if temp2[0].index(':'):
                server = temp2[0].split(':')[0]
            else:
                server = temp2[0]
            database = (temp2[1].split('='))[1]
            
                # Active Directory Password
            connectionString = (
                    f'DRIVER={{ODBC Driver 18 for SQL Server}};'
                    f'SERVER={server};'
                    f'DATABASE={database};'
                    'Authentication=ActiveDirectoryPassword;'
                    f'UID={self.user};'
                    f'PWD={self.password};'
                    'Encrypt=yes;'
                    'TrustServerCertificate=no;'
                    'HostNameInCertificate=*.database.windows.net;'
                    'LoginTimeout=120'
                )
            connection = pyodbc.connect(connectionString)
        else:
            temp1 = self.url.split('//')
            temp2 = temp1[1].split(';')
            server = temp2[0]
            database = (temp2[1].split('='))[1]
            isTrusted = 'no'
            if self.user == '':
                isTrusted = 'yes'

            connectionString = "DRIVER={0};SERVER={1}; " \
                               "DATABASE={2};UID={3};PWD={4};Trusted_Connection={5};TrustServerCertificate=yes;Encrypt=no".format(
                'ODBC Driver 18 for SQL SERVER', server, database, self.user, self.password, isTrusted)
            connection = pyodbc.connect(connectionString)
            
        return connection

    def mapQueryParams(self):
        query = self.query
        if self.params != "":
            paramsJson = ast.literal_eval(self.params)
            for key in paramsJson.keys():
                if paramsJson[key].lower() != 'false':
                    query = query.replace("{" + key + "}", paramsJson[key])
                else:
                    query = query.replace("{" + key + "}", key)
        return query

    def getDataset(self, sparkSession):
        logger.info("Reading MSSQL Dataset")
        self.query = "( " + self.query + " ) t1"
        query = self.mapQueryParams()
        logger.info("Connecting to server")
        logger.info("Executing Query - {0}".format(query))
        dataset = sparkSession.read.format("jdbc").options(url=self.url,dbtable=query,user=self.user,password=self.password).load()
        if self.applySchema == True and self.schema != "" and self.schema is not None:
            logger.info("Applying Schema on input dataset")
            columns = []
            for i in self.schema.get("schemaDetails"):
                columnName = i.get("recordcolumnname")
                columns.append(columnName)
                dataset = dataset.withColumn(columnName,
                                             dataset[columnName].cast(Utilities.getCType(i.get("columntype"))))
            dataset = dataset.select(columns)
        logger.info("Dataset Extracted Successfully")
        logger.info("Dataset Schema:")
        logger.info(dataset.printSchema())
        return dataset

    def getStreamingDataset(self, sparkSession):
        #implement streaming dataset if supported by spark
        logger.info(
            "Streaming Extractor for type MS SQL is not supported. Set streaming to False in dataset configuration")
        return None

    def getData(self):
        connection = self.getConnection()
        query = self.mapQueryParams()
        cursor = connection.cursor()
        cursor = cursor.execute(query)
        columns = [column[0] for column in cursor.description]
        results =[]
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        return results
        
    def getDataset(self, sparkSession):
        print("Reading MSSQL Dataset")
        self.query = "( " + self.query + " ) t1"
        query = self.mapQueryParams()
        print("Connecting to server")
        print("Executing Query - {0}".format(query))
        dataset = sparkSession.read.format("jdbc").options(url=self.url,dbtable=query,user=self.user,password=self.password).load()
        if self.applySchema == True and self.schema != "" and self.schema is not None:
            print("Applying Schema on input dataset")
            columns = []
            for i in self.schema.get("schemaDetails"):
                columnName = i.get("recordcolumnname")
                columns.append(columnName)
                dataset = dataset.withColumn(columnName,
                                             dataset[columnName].cast(Utilities.getCType(i.get("columntype"))))
            dataset = dataset.select(columns)
        print("Dataset Extracted Successfully")
        return dataset
