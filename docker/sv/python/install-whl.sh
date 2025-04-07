#!/bin/bash
set -x #echo on
source /venv/bin/activate
python3 -m pip install /app/python/leap-2.0.*.whl -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/BotFactoryHome/PythonBots/BotExecutor-0.0.1-py3-none-any.whl -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install spacy==3.0.6 -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install en_core_web_sm-3.0.0.tar.gz -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install boto3 bs4 pycryptodome -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/xmltodict-0.12.0-py2.py3-none-any.whl -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/psycopg2_binary-2.9.3-cp39-cp39-manylinux_2_17_x86_64.manylinux2014_x86_64.whl -i https://munish_arya:APAzbj4e2kbuvyUUPBdGaGUK76F@infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/six-1.16.0-py2.py3-none-any.whl -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/requests_oauthlib-1.3.0-py2.py3-none-any.whl -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/requests_aws4auth-1.1.1-py2.py3-none-any.whl -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/pytz-2020.1-py2.py3-none-any.whl -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/requests-2.24.0-py2.py3-none-any.whl -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/pyodbc-4.0.31.tar.gz -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/PyMySQL-1.0.2-py3-none-any.whl -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/protobuf-3.17.3-py2.py3-none-any.whl -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/mysql_connector_python-8.0.25-py2.py3-none-any.whl -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/kafka-1.3.5-py2.py3-none-any.whl -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/influxdb-5.3.1-py2.py3-none-any.whl -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/ibm_db-3.0.2.tar.gz -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/google_cloud_bigquery-2.20.0-py2.py3-none-any.whl -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/google_cloud_bigquery_connection-1.1.0-py2.py3-none-any.whl -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/exchangelib-4.4.0-py2.py3-none-any.whl -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/elasticsearch-7.13.3-py2.py3-none-any.whl -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install /app/plugins_dep/cx_Oracle-8.2.1-cp39-cp39-manylinux1_x86_64.whl -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install neo4j==4.4.3 -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install py2neo -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
python3 -m pip install urllib3==1.26.11 -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
java -jar /app/leap-cli/leap-cli.jar -plugininstall /app/pluginZips/*.zip /app/
echo "successfully installed"
