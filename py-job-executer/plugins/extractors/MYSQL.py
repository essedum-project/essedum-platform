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
 
class MYSQL():
    def __init__(self, datasourceAttributes, datasetAttributes):
        self.url = datasourceAttributes.get("url","")
        self.user = datasourceAttributes.get("userName","")
        self.vaultkey = datasourceAttributes.get("vaultkey", "")
        if self.vaultkey != "":
            self.password = Vault.getPassword(self.vaultkey)
        else:
            self.password = Security.decrypt(datasourceAttributes.get("password", ""),
                                              datasourceAttributes.get("salt", ""))
        self.query = datasetAttributes.get("Query", "")
        self.params = datasetAttributes.get("params", "")
        self.applySchema = datasetAttributes.get("applySchema", False)
        self.schema = datasetAttributes.get("schema", "")
        self.isStreaming = datasetAttributes.get("isStreaming", "false")
 
 
    def getConnection(self):
        import mysql.connector
        username = self.user
        password = self.password
        host = urlparse(self.url[5:]).hostname
        port =urlparse(self.url[5:]).port
        database = urlparse(self.url[5:]).path.rsplit('/', 1)[1]
        connection = mysql.connector.connect(user=username, password=password, host=host, database=database, port = port)
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
 
 
    def getData(self):
        connection = self.getConnection()
        query = self.mapQueryParams()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query)
        results = cursor.fetchall()
        return results
 
    def getDataset(self, sparkSession):
        print("Reading MYSQL Dataset")
        #build query
        self.query = "( " + self.query + " ) t1"
        query = self.mapQueryParams()
        print("Connecting to server")
        #read dataset
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
        print("Dataset Extracted Successfully")
        return dataset