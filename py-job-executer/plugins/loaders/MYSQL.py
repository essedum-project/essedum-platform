from urllib.parse import urlparse
import logging as logger
from leaputils import Vault
from leaputils import Security
import mysql.connector


class MYSQL():
    def __init__(self, datasourceAttributes, datasetAttributes):
        self.url = datasourceAttributes.get("url", "")
        self.user = datasourceAttributes.get("userName", "")
        self.vaultkey = datasourceAttributes.get("vaultkey", "")
        if self.vaultkey != "":
            self.password = Vault.getPassword(self.vaultkey)
        else:
            self.password = Security.decrypt(datasourceAttributes.get("password", ""),
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
        port = urlparse(self.url[5:]).port
        database = urlparse(self.url[5:]).path.rsplit('/', 1)[1]
        connection = mysql.connector.connect(user=username, password=password, host=host, database=database, port=port)
        return connection

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
                logger.error('{0}:{1}'.format(e, row))
        if (len(data) > 0):
            mycursor.executemany(query, data)
            cnx.commit()

        mycursor.close()
        cnx.close()
    
    def loadDataset(self, dataset, sparkSession, runtime):
        print("Writing MYSQL Dataset")

        if (self.applySchema == True and self.schema is not None):
            print("Applying Schema on output dataset")
            columns = []
            for i in self.schema.get("schemaDetails"):
                column_name = i.get("recordcolumnname")
                columns.append(column_name)
                dataset = dataset.withColumn(i.get("recordcolumndisplayname"),
                                             dataset[column_name].cast(Utilities.getCType(i.get("columntype"))))
            dataset = dataset.select(columns)

        print("Saving Dataset")

        if self.mode.lower() in ('overwrite', 'append', 'error', 'errorifexists', 'ignore'):
            print("Connecting to server")
            dataset.write.format('jdbc').options(
                url=self.url,
                dbtable=self.dbtable,
                user=self.user,
                password=self.password).mode(self.mode).save()

        elif self.mode.lower() in ('update'):
            column_list = dataset.columns
            tablename = self.dbtable
            username = self.user
            password = self.password
            host = urlparse(self.url[5:]).hostname
            port = urlparse(self.url[5:]).port
            database = urlparse(self.url[5:]).path.rsplit('/', 1)[1]

            def process_partition(iterator):
                import mysql.connector
                logger.info("Connecting to server")
                cnx = mysql.connector.connect(user=username, password=password, host=host, port=port, database=database)
                mycursor = cnx.cursor()
                data_list = []
                for row in iterator:
                    paramsDict = {}
                    values = []
                    for i in range(0, len(column_list)):
                        paramsDict[column_list[i]] = row[i]
                        values.append(row[i])

                    columns = ', '.join('`{0}`'.format(k) for k in paramsDict)
                    duplicates = ', '.join('{0}=VALUES({0})'.format(k) for k in paramsDict)
                    place_holders = ', '.join('%s'.format(k) for k in paramsDict)

                    query = "INSERT INTO {0} ({1}) VALUES ({2})".format(tablename, columns, place_holders)
                    query = "{0} ON DUPLICATE KEY UPDATE {1}".format(query, duplicates)
                    data_list.append(values)
                if (len(data_list) > 0):
                    mycursor.executemany(query, data_list)
                    cnx.commit()

                mycursor.close()
                cnx.close()

            dataset.foreachPartition(process_partition)

            print("Dataset saved")
