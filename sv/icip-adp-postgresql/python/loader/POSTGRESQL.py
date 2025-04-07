from leap.core.iLoader import Loader
from leap.utils.Utilities import Utilities
import logging as logger
from leap.utils import vault

class POSTGRESQL(Loader):
    def __init__(self, datasourceAttributes, datasetAttributes):
        self.url = datasourceAttributes.get("url","")
        self.user = datasourceAttributes.get("userName","")
        self.vaultkey = datasourceAttributes.get("vaultkey", "")
        if self.vaultkey != "":
            self.password = vault.getPassword(self.vaultkey)
        else:
            self.password = Utilities.decrypt(datasourceAttributes.get("password", ""),
                                              datasourceAttributes.get("salt", ""))
        self.dbtable = datasetAttributes.get("tableName","")
        self.mode = datasetAttributes.get("writeMode", "append")
        self.schema = datasetAttributes.get("schema", None)
        self.applySchema = datasetAttributes.get("applySchema", False)

    def loadDataset(self, dataset, sparkSession, runtime):
        logger.info("Writing POSTGRESQL Dataset")
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

            logger.info("Dataset saved")

    def loadStreamingDataset(self, dataset, sparkSession, runtime):
        # implement streaming dataset if supported by spark
        logger.info("Streaming Loader for type POSTGRESQL is not supported. Set streaming to False in dataset configuration")
        return None