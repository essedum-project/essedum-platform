from essedum.core.iLoader import Loader
from urllib.parse import urlparse
from essedum.utils.Utilities import Utilities
import logging as logger
from essedum.utils import vault
import mysql.connector

class MYSQL(Loader):
    def __init__(self, datasourceAttributes, datasetAttributes):
        self.url = datasourceAttributes.get("url", "")
        self.user = datasourceAttributes.get("userName", "")
        self.vaultkey = datasourceAttributes.get("vaultkey", "")
        if self.vaultkey != "":
            self.password = vault.getPassword(self.vaultkey)
        else:
            self.password = Utilities.decrypt(datasourceAttributes.get("password", ""),
                                              datasourceAttributes.get("salt", ""))
        self.dbtable = datasetAttributes.get("tableName", "")
        self.mode = datasetAttributes.get("writeMode", "append")
        self.schema = datasetAttributes.get("schema", None)
        self.applySchema = datasetAttributes.get("applySchema", False)
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

    def loadDataset(self, dataset, sparkSession, runtime):
        logger.info("Writing MYSQL Dataset")

        if (self.applySchema == True and self.schema is not None):
            logger.info("Applying Schema on output dataset")
            columns = []
            for i in self.schema.get("schemaDetails"):
                columnName = i.get("recordcolumnname")
                columns.append(columnName)
                dataset = dataset.withColumn(i.get("recordcolumndisplayname"),
                                             dataset[columnName].cast(Utilities.getCType(i.get("columntype"))))
            dataset = dataset.select(columns)

        logger.info("Saving Dataset")

        if self.mode.lower() in ('overwrite', 'append', 'error', 'errorifexists', 'ignore'):
            logger.info("Connecting to server")
            dataset.write.format('jdbc').options(
                url=self.url,
                dbtable=self.dbtable,
                user=self.user,
                password=self.password).mode(self.mode).save()

        elif self.mode.lower() in ('update'):
            columnList = dataset.columns
            tablename = self.dbtable
            username = self.user
            password = self.password
            host = urlparse(self.url[5:]).hostname
            port = urlparse(self.url[5:]).port
            database = urlparse(self.url[5:]).path.rsplit('/', 1)[1]

            def process_partition(iterator):
                logger.info("Connecting to server")
                cnx = mysql.connector.connect(user=username, password=password, host=host, port=port, database=database)
                mycursor = cnx.cursor()
                data_list = []
                for row in iterator:
                    paramsDict = {}
                    values = []
                    for i in range(0, len(columnList)):
                        paramsDict[columnList[i]] = row[i]
                        values.append(row[i])

                    columns = ', '.join('`{0}`'.format(k) for k in paramsDict)
                    duplicates = ', '.join('{0}=VALUES({0})'.format(k) for k in paramsDict)
                    place_holders = ', '.join('%s'.format(k) for k in paramsDict)

                    query = "INSERT INTO {0} ({1}) VALUES ({2})".format(tablename, columns, place_holders)
                    query = "{0} ON DUPLICATE KEY UPDATE {1}".format(query, duplicates)
                    data_list.append(values)
                if len(data_list) > 0:
                    mycursor.executemany(query, data_list)

                    cnx.commit()

                mycursor.close()
                cnx.close()

            dataset.foreachPartition(process_partition)

            logger.info("Dataset saved")

    def loadStreamingDataset(self, dataset, sparkSession, runtime):
        logger.info("Writing SQL Dataset")
        if self.applySchema == True and self.schema is not None:
            logger.info("Applying Schema on output dataset")
            columns = []
            for i in self.schema.get("schemaDetails"):
                columnName = i.get("recordcolumnname")
                columns.append(columnName)
                dataset = dataset.withColumn(i.get("recordcolumndisplayname"),
                                             dataset[columnName].cast(Utilities.getCType(i.get("columntype"))))
            dataset = dataset.select(columns)

        columnList = dataset.columns
        tablename = self.dbtable
        username = self.user
        password = self.password
        host = urlparse(self.url[5:]).hostname
        port = urlparse(self.url[5:]).port

        database = urlparse(self.url[5:]).path.rsplit('/', 1)[1]


        class RowPrinter:
            def open(self, partition_id, epoch_id):

                self.cnx = mysql.connector.connect(user=username, password=password, host=host, database=database,  port = port)
                self.mycursor = self.cnx.cursor()
                return True

            def process(self, row):
                paramsDict = {}

                for i in range(0, len(columnList)):
                    if isinstance(row[i], str):
                        paramsDict[columnList[i]] = "'{0}'".format(row[i])
                    elif row[i] is None:
                        paramsDict[columnList[i]] = 'null'
                    else:
                        paramsDict[columnList[i]] = row[i]

                columns = ', '.join('`{0}`'.format(k) for k in paramsDict)
                values = ",".join("{0}".format(paramsDict[k]) for k in paramsDict)

                query = "INSERT INTO {0} ({1}) VALUES ({2})".format(tablename, columns, values)
                print(query)
                self.mycursor.execute(query)
                self.cnx.commit()

            def close(self, error):
                self.mycursor.close()
                self.cnx.close()

        logger.info("Writing Stream to table: {0}".format(self.dbtable))
        query = dataset.writeStream.foreach(RowPrinter()).start()
        query.awaitTermination()

    def loadData(self, dataset):
        tablename = self.dbtable
        cnx = self.getConnection()
        mycursor = cnx.cursor()
        if dataset != None and len(dataset) > 0:
            columnList = list(dataset[0].keys())
        if self.mode.lower() in 'overwrite':
            mycursor.execute("Drop table IF EXISTS {0}".format(tablename))

        # create table if not exists

        column_definition = ', '.join(['`{0}` TEXT'.format(c) for c in columnList])
        createQuery = ' CREATE TABLE IF NOT EXISTS {0} ({1})'.format(tablename, column_definition)
        mycursor.execute(createQuery)
        data = []
        for row in dataset:
            try:
                paramsDict = {}
                values = []
                for i in range(0, len(columnList)):
                    paramsDict[columnList[i]] = row[columnList[i]]
                    values.append(row[columnList[i]])

                columns = ', '.join('`{0}`'.format(k) for k in paramsDict)
                duplicates = ', '.join('{0}=VALUES({0})'.format(k) for k in paramsDict)
                place_holders = ', '.join('%s'.format(k) for k in paramsDict)

                query = "INSERT INTO {0} ({1}) VALUES ({2})".format(tablename, columns, place_holders)
                if self.mode.lower() in ('update'):
                    query = "{0} ON DUPLICATE KEY UPDATE {1}".format(query, duplicates)
                data.append(values)
            
            except Exception as e:
                logger.error('{0}:{1}'.format(e,row))
        if(len(data) > 0):
            mycursor.executemany(query, data)
            cnx.commit()

        mycursor.close()
        cnx.close()
