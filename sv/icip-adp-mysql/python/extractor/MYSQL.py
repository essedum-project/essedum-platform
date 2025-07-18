#@ 2020 - 2021 Infosys Limited, Bangalore, India. All Rights Reserved.
#Version: 1.0
#Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
#this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
#rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
#transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
#recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
#criminal penalties, and will be prosecuted to the maximum extent possible under the law.

from leap.core.iExtractor import Extractor
from leap.utils.Utilities import Utilities
import ast
import logging as logger
import mysql.connector
from urllib.parse import urlparse
from leap.utils import vault
from leap.core.iExtractor import Extractor
from leap.utils.Utilities import Utilities
import ast
import logging as logger
from urllib.parse import urlparse
from leap.utils import vault

class MYSQL(Extractor):
    def __init__(self, datasource_attributes, dataset_attributes):
        self.url = datasource_attributes.get("url","")
        self.user = datasource_attributes.get("userName","")
        self.vaultkey = datasource_attributes.get("vaultkey", "")
        if self.vaultkey != "":
            self.password = vault.getPassword(self.vaultkey)
        else:
            self.password = Utilities.decrypt(datasource_attributes.get("password", ""),
                                              datasource_attributes.get("salt", ""))
        self.query = dataset_attributes.get("Query", "")
        self.params = dataset_attributes.get("params", "")
        self.applySchema = dataset_attributes.get("applySchema", False)
        self.schema = dataset_attributes.get("schema", "")
        self.isStreaming = dataset_attributes.get("isStreaming", "false")


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
            params_json = ast.literal_eval(self.params)
            for key in params_json.keys():
                if params_json[key].lower() != 'false':
                    query = query.replace("{" + key + "}", params_json[key])
                else:
                    query = query.replace("{" + key + "}", key)
        return query

    def getDataset(self, spark_session):
        logger.info("Reading MYSQL Dataset")
        #build query
        self.query = "( " + self.query + " ) t1"
        query = self.mapQueryParams()
        logger.info("Connecting to server")
        logger.info("Executing Query - {0}".format(query))
        #read dataset
        dataset = spark_session.read.format("jdbc").options(url=self.url,dbtable=query,user=self.user,password=self.password).load()
        dataset.show()
        if self.applySchema == True and self.schema != "" and self.schema is not None:
            logger.info("Applying Schema on input dataset")
            columns = []
            for i in self.schema.get("schemaDetails"):
                column_name = i.get("recordcolumnname")
                columns.append(column_name)
                dataset = dataset.withColumn(column_name,
                                             dataset[column_name].cast(Utilities.getCType(i.get("columntype"))))
            dataset = dataset.select(columns)
        logger.info("Dataset Extracted Successfully")
        logger.info("Dataset Schema:")
        logger.info(dataset.printSchema())
        return dataset

    def getStreamingDataset(self, spark_session):
        #implement streaming dataset if supported by spark
        logger.info(
            "Streaming Extractor for type MY SQL is not supported. Set streaming to False in dataset configuration")
        return None

    def getData(self):
        connection = self.getConnection()
        query = self.mapQueryParams()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query)
        results = cursor.fetchall()
        return results


