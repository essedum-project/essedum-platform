from leap.core.iExtractor import Extractor
from leap.utils.Utilities import Utilities
import ast
import logging as logger
from leap.utils import vault
import psycopg2

class POSTGRESQL(Extractor):
    def __init__(self, datasourceAttributes, datasetAttributes):
        self.url = datasourceAttributes.get("url","")
        self.user = datasourceAttributes.get("userName", "")
        self.vaultkey = datasourceAttributes.get("vaultkey", "")
        if self.vaultkey != "":
            self.password = vault.getPassword(self.vaultkey)
        else:
            self.password = Utilities.decrypt(datasourceAttributes.get("password", ""),
                                              datasourceAttributes.get("salt", ""))
        self.query = datasetAttributes.get("Query", "")
        self.params = datasetAttributes.get("params", "")
        self.applySchema = datasetAttributes.get("applySchema", False)
        self.schema = datasetAttributes.get("schema", "")
        self.isStreaming = datasetAttributes.get("isStreaming", "false")


    def getDataset(self, sparkSession):

        logger.info("Reading PostgresSQL Dataset")
        # build query
        query = "( " + self.query + " ) t1"
        if self.params != "":
            paramsJson = ast.literal_eval(self.params)
            for key in paramsJson.keys():
                if paramsJson[key].lower() != 'false':
                    query = query.replace("{" + key + "}", paramsJson[key])
                else:
                    query = query.replace("{" + key + "}", key)
        logger.info("Connecting to server")
        logger.info("Executing Query - {0}".format(query))
        # read dataset
        dataset = sparkSession.read.format("jdbc").options(url=self.url, dbtable=query, user=self.user,
                                                           password=self.password).load()

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
            "Streaming Extractor for type PostgeSQL is not supported. Set streaming to False in dataset configuration")
        return None

    def getConnection(self):

        url = "jdbc:postgresql://10.82.183.77:5432/mlstudio_usecases"
        dbname = url.rsplit("/", 1)[1]
        port = (url.rsplit("/", 1)[0]).rsplit(":", 1)[1]
        host = ((url.rsplit("/", 1)[0]).rsplit(":", 1)[0])
        conn = psycopg2.connect(
            host=host,
            database=dbname,
            user=self.user,
            password=self.password,
            port=port)
        return conn
