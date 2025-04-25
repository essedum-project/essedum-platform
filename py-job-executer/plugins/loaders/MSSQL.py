from urllib.parse import urlparse
import logging as logger
from leaputils import Vault
from leaputils import Security
import pyodbc



class MSSQL():
    def __init__(self, datasourceAttributes, datasetAttributes):
        self.url = datasourceAttributes.get("url", "")
        self.user = datasourceAttributes.get("userName", "")
        self.vaultkey = datasourceAttributes.get("vaultkey", "")
        if self.vaultkey != "":
            self.password = vault.getPassword(self.vaultkey)
        else:
            self.password = Security.decrypt(datasourceAttributes.get("password", ""),
                                             datasourceAttributes.get("salt", ""))
        self.dbtable = datasetAttributes.get("tableName", "")
        self.mode = datasetAttributes.get("writeMode", "append")
        self.schema = datasetAttributes.get("schema", None)
        self.applySchema = datasetAttributes.get("applySchema", True)

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

    def loadData(self, dataset):
        logger.info('INSIDE LoadData of MSSQL.py')

        tablename = self.dbtable
        cnx = self.getConnection()
        mycursor = cnx.cursor()
        if dataset != None and len(dataset) > 0:
            columnList = list(dataset[0].keys())
        if self.mode.lower() in ('overwrite'):
            mycursor.execute("Drop table IF EXISTS {0}".format(tablename))
        # create table if not exists
        columnDefinition = ', '.join(['{0} text'.format(c) for c in columnList])
        createQuery = "if not exists (select * from sysobjects where name='{0}' and xtype='U') CREATE TABLE {0} ({1})".format(
            tablename, columnDefinition)
        mycursor.execute(createQuery)
        # get Primary key columns of table
        primarykeyColumns = []
        q = '''SELECT Col.Column_Name from INFORMATION_SCHEMA.TABLE_CONSTRAINTS Tab,\
                                INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE Col \
                                WHERE Col.Constraint_Name = Tab.Constraint_Name AND Col.Table_Name = Tab.Table_Name \
                                AND Constraint_Type = 'PRIMARY KEY' AND Col.Table_Name = '{0}' '''.format(tablename)
        mycursor.execute(q)
        for row in mycursor.fetchall():
            primarykeyColumns.append(row[0])
        if len(primarykeyColumns) ==0:
            q = '''SELECT Col.Column_Name from INFORMATION_SCHEMA.TABLE_CONSTRAINTS Tab,\
                                INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE Col \
                                WHERE Col.Constraint_Name = Tab.Constraint_Name AND Col.Table_Name = Tab.Table_Name \
                                AND Constraint_Type = 'UNIQUE' AND Col.Table_Name = '{0}' '''.format(tablename)
            mycursor.execute(q)
            for row in mycursor.fetchall():
                primarykeyColumns.append(row[0])
        
        for row_no , row in enumerate(dataset):
            try:
                paramsDict = {}
                values = []
                col_value = []
                for i in range(0, len(columnList)):
                    value = row[columnList[i]]
                    if value is None:
                        col_value.append("{0}=NULL".format(columnList[i]))
                        values.append(None)
                    else:
                        col_value.append("{0}='{1}'".format(columnList[i], value))
                        values.append(value)
                    paramsDict[columnList[i]] = value

                if self.mode.lower() in ('overwrite', 'append'):
                    columns = ', '.join('{0}'.format(k) for k in paramsDict.keys())
                    place_holders = ', '.join('?' for _ in paramsDict.keys())

                    query = "INSERT INTO {0} ({1}) VALUES ({2})".format(tablename, columns, place_holders)
                    mycursor.execute(query, tuple(values))

                elif self.mode.lower() == 'update':
                    
                    columns = ', '.join(columnList)
                    col_values = ', '.join(col_value)

                    if len(primarykeyColumns) > 0:
                        joinon = ' AND '.join('t.{0} = s.{0}'.format(col) for col in primarykeyColumns)
                    else:
                        joinon = ' AND '.join('t.{0} = s.{0}'.format(col) for col in columnList)
                    
                    updateValues = ', '.join('{0} = s.{0}'.format(col) for col in columnList)
                    insertValues = ', '.join('s.{0}'.format(col) for col in columnList)
                    query = "MERGE INTO {0} AS t USING (SELECT {1}) AS s ON {2} WHEN MATCHED THEN UPDATE SET {3} WHEN NOT MATCHED THEN INSERT({4}) VALUES({5});".format(
                        tablename, col_values, joinon, updateValues, columns, insertValues)
                    
                    
                    mycursor.execute(query)

                cnx.commit()


            except Exception as e:
                logger.error('Row no {1} not inserted due to following error : {0}'.format(e, row_no+1))
        mycursor.close()
        cnx.close()

    def loadDataset(self, dataset, sparkSession, runtime):
        print("Writing MSSQL Dataset")
        if (self.applySchema == True and self.schema is not None):
            print("Applying Schema on output dataset")
            columns = []
            for i in self.schema.get("schemaDetails"):
                columnName = i.get("recordcolumnname")
                columns.append(columnName)
                dataset = dataset.withColumn(i.get("recordcolumndisplayname"),
                                             dataset[columnName].cast(Utilities.getCType(i.get("columntype"))))
            dataset = dataset.select(columns)

        print("Saving Dataset")

        if self.mode.lower() in ('overwrite', 'append', 'error', 'errorifexists', 'ignore'):
            print("Connecting to server")
            dataset.write.format('jdbc').options(
                url=self.url,
                dbtable=self.dbtable,
                user=self.user,
                password=self.password).mode(self.mode).save()
            print("Dataset saved")

        elif self.mode.lower() in ('update'):
            columnList = dataset.columns
            tablename = self.dbtable

            temp1 = self.url.split('//')
            temp2 = temp1[1].split(';')
            server = temp2[0]
            database = (temp2[1].split('='))[1]
            isTrusted = False
            if self.user == '':
                isTrusted = True
            user = self.user
            password = self.password

            def process_partition(iterator):
                print("Connecting to server")
                driver=os.environ.get('MSSQLDRIVER', 'ODBC Driver 17 for SQL Server')
                connectionString = "DRIVER={0};SERVER={1}; " \
                                   "DATABASE={2};UID={3};PWD={4}; trusted_connection={5}".format(
                    driver, server, database, user, password, isTrusted)
                cnx = pyodbc.connect(connectionString)
                mycursor = cnx.cursor()

                # get Primary key columns of table
                primarykeyColumns = []
                q = '''SELECT Col.Column_Name from INFORMATION_SCHEMA.TABLE_CONSTRAINTS Tab,\
                        INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE Col \
                        WHERE Col.Constraint_Name = Tab.Constraint_Name AND Col.Table_Name = Tab.Table_Name \
                        AND Constraint_Type = 'PRIMARY KEY' AND Col.Table_Name = '{0}' '''.format(self.dbtable)
                mycursor.execute(q)
                for row in mycursor.fetchall():
                    primarykeyColumns.append(row[0])

                for row in iterator:
                    col_value = []
                    for i in range(0, len(columnList)):
                        col_value.append("{0}='{1}'".format(columnList[i], row[i]))

                    columns = ', '.join(columnList)
                    col_values = ', '.join(col_value)
                    if len(primarykeyColumns) > 0:
                        joinon = ' AND '.join('t.{0} = s.{0}'.format(col) for col in primarykeyColumns)
                    else:
                        joinon = ' AND '.join('t.{0} = s.{0}'.format(col) for col in columnList)
                    updateValues = ', '.join('{0} = s.{0}'.format(col) for col in columnList)
                    insertValues = ', '.join('s.{0}'.format(col) for col in columnList)

                    query = "MERGE  INTO {0} AS t USING (SELECT {1}) AS s  ON {2} WHEN MATCHED THEN UPDATE SET {3} WHEN NOT MATCHED THEN INSERT({4}) VALUES({}5);".format(
                        tablename, col_values, joinon, updateValues, columns, insertValues)
                    mycursor.executemany(query)
                    cnx.commit()

                mycursor.close()
                cnx.close()

            dataset.foreachPartition(process_partition)
