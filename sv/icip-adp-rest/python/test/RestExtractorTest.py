from plugins.extractors.REST import  REST
from pyspark.sql import SparkSession
spark = SparkSession.builder.getOrCreate()
datasourceAttributes={
"authUrl":"",
"password":"",
"authParams":"{}",
"auth":"NoAuth",
"url":"https://myzul02n:9200/esiamplogs/_count",
"username":"",
"noProxy":"true"
}
datasetAttributes={
"documentElement":"",
"Cacheable":"false",
"Request Body":"",
"API Type":"GET",
"EndPoints":"",
"QueryParams":""
}
e = REST(datasourceAttributes,datasetAttributes)
res = e.getDataset(spark)
print(res.content)