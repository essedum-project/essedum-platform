# IMPORT THE SQALCHEMY LIBRARY's CREATE_ENGINE METHOD
from sqlalchemy import create_engine, text
from urllib.parse import quote_plus
import json
import requests
import traceback
from utils import *
import logging
# Gets or creates a logger
logger = logging.getLogger(__name__)  

# set log level
logger.setLevel(logging.INFO)
# define file handler and set formatter
file_handler = logging.FileHandler('logfile.log')
formatter    = logging.Formatter('%(asctime)s : %(levelname)s : %(name)s : %(message)s')
file_handler.setFormatter(formatter)

# add file handler to logger
logger.addHandler(file_handler)

conn_details = {}
for referer in MYSQLREFERER:
    conn_details[referer] = {}
for referer in POSTGRESSREFERER:
    conn_details[referer] = {}



def get_connection(referer):
	user = DB_CONNECTIONS[referer].get('USER', None)
	password = DB_CONNECTIONS[referer].get('PASSWORD', None)
	host = DB_CONNECTIONS[referer].get('HOST', None)
	port = DB_CONNECTIONS[referer].get('PORT', None)
	database = DB_CONNECTIONS[referer].get('DATABASE', None)
	
	if referer in POSTGRESSREFERER:
		return create_engine(
			url="postgresql+psycopg2://{0}:{1}@{2}:{3}/{4}".format(
				user, quote_plus(password), host, port, database
			)
		)
	return create_engine(
		url="mysql+pymysql://{0}:{1}@{2}:{3}/{4}".format(
			user, quote_plus(password), host, port, database
		)
	)

def get_connection_details(referer, adapter_instance, project, isInstance=None):
	logger.info(f"Inside datasource.py file...")
	logger.info(f'{conn_details}')
	connection_details = {}
	schema = ''
	if referer in POSTGRESSREFERER:
		schema = DB_CONNECTIONS[referer].get('SCHEMA', '')
		if len(schema) > 0:
			schema += '.'
	try:
		if isInstance is not None and (isInstance == 'Y' or isInstance =='true' or isInstance==True):
			sqlquery = f"SELECT connectiondetails FROM {schema}mldatasource where name IN (SELECT connectionid FROM {schema}mlintstance where name='{adapter_instance}' AND organization='{project}') AND organization='{project}'"
		elif isInstance is not None and (isInstance == 'N' or isInstance =='false' or isInstance==False):
			sqlquery = f"SELECT connectiondetails FROM {schema}mldatasource where name IN (SELECT connectionid FROM {schema}mladapters where name='{adapter_instance}' AND organization='{project}' AND isactive='Y') AND organization='{project}'"	
		else:
			sqlquery = f"SELECT connectiondetails FROM {schema}mldatasource a WHERE name='{adapter_instance}' AND organization='{project}';"

		if conn_details[referer].get('connection', None) is None:
			logger.info("DB connection lost, trying to reconnect...!")
			conn_details[referer]['engine'] = get_connection(referer)
			conn_details[referer]['connection'] = conn_details[referer]['engine'].connect()	
			logger.info("DB connection established successfully...!")

		logger.info(f"SQL query is: {str(sqlquery)}")
		sqlquery = text(sqlquery)
		result = conn_details[referer]['connection'].execute(sqlquery)
		rows = []
		for row in result:
			rows.append(row)
		logger.info(f"rows of connection details: {str(rows)}")
		if len(rows) > 0:
			conn = rows[-1]
			conn_json = json.loads(conn[-1])
			connection_details = conn_json
	except Exception as err:
		logger.info(f"Exception occured in datasource.py file: {str(err)}")
		if conn_details[referer].get('engine', None) is not None:
			conn_details[referer]['engine'].dispose()
			conn_details[referer]['engine'] = None
			conn_details[referer]['connection'] = None
	return connection_details


def get_connection_details_with_token(referer, adapter_instance, project, isInstance=None):
	os.environ['no_proxy'] = "localhost,0.0.0.0,10.*,*.ad.infosys.com,10.82.53.110,victlpast02,infyaiplat-tst.ad.infosys.com,infyaiplat.ad.infosys.com"
	logger.info(f"Inside datasource.py file...")
	connection_details = {}
	try:
		url = f"{referer}api/aip/services/fetchConnectionDetailsByAdapterInstance?project={project}&adapter_instance={adapter_instance}"
		if isInstance is not None:
			url += f"&isInstance={isInstance}"

		logger.info(f"The url is: {str(url)}")

		payload = {}
		headers = {
		'access-token': DB_CONNECTIONS[referer].get('TOKEN', '')
		}

		logger.info(f"The headers are: {str(headers)}")

		response = requests.request("GET", url, headers=headers, data=payload,verify=False,proxies={})
		response = json.loads(response.text)

		logger.info(f"The response from url: {str(url)} is: {str(response)}")

		connection_details = json.loads(response.get("connection", {}).get("connectionDetails", {}))
		connection_details["adapter_id"] = response.get("connection", {}).get("name", "")
	except Exception as err:
		exc_trace = traceback.format_exc()
		logger.info(f"Exception occured in datasource.py file: {str(err)} \n {str(exc_trace)}")
	return connection_details
