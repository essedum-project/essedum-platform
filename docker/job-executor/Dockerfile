FROM infyartifactory.jfrog.io/docker-local/leap/base/python:python-3.12.3-bp-v2
WORKDIR /
USER root
ENV HTTP_PROXY=http://blrproxy.ad.infosys.com:80
ENV HTTPS_PROXY=http://blrproxy.ad.infosys.com:80
ENV http_proxy=http://blrproxy.ad.infosys.com:80
ENV https_proxy=http://blrproxy.ad.infosys.com:80
ENV GIT_PYTHON_REFRESH=quiet
RUN apt-get -y update && \
    apt-get -y install wget && \
    apt-get -y install unzip && \
    apt-get -y install ffmpeg && \
        apt-get -y install python3-dev && \
        apt-get -y install build-essential
RUN wget https://packages.microsoft.com/keys/microsoft.asc https://packages.microsoft.com/config/ubuntu/22.04/prod.list
RUN mv microsoft.asc /etc/apt/trusted.gpg.d/microsoft.asc
RUN mv prod.list /etc/apt/sources.list.d/mssql-release.list
RUN apt-get -y update && \
    apt-get install -y unixodbc-dev && \
	apt-get -y install odbcinst
RUN ACCEPT_EULA=Y apt-get install -y msodbcsql18  
RUN wget --user rajesh.itagi@ad.infosys.com --password cmVmdGtuOjAxOjE3NDkyOTc4MDY6M0xPQ1d5U2MzN1FpYmZHblVrcVFzbE93UWE0 https://infyartifactory.jfrog.io/artifactory/icets-ai_generic/py-job-executer/py-job-executer-3.0.15.zip https://infyartifactory.jfrog.io/artifactory/icets-ai_generic/nltk_data_latest.zip https://infyartifactory.jfrog.io/artifactory/icets-ai_python/leaputils/3.0.0/leaputils-3.0.0-py3-none-any.whl
RUN unzip py-job-executer-3.0.15.zip
RUN unzip /py-job-executer/en_core_web_sm.zip.zip
RUN unzip nltk_data_latest.zip -d /app/
RUN mkdir data /temp /temp/Jobs
RUN chown -R leapuser /py-job-executer/ /data/ /temp/
RUN chmod -R 777 /py-job-executer/ /data/ /temp/ 
RUN rm -rf nltk_data_latest.zip py-job-executer-3.0.15.zip
ENV EXTRA_PLUGINS_PATH=/py-job-executer/plugins
USER leapuser
RUN python -m pip install leaputils-3.0.0-py3-none-any.whl -i https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3NTcxMzQwMjE6bHZUbkF3QVpBajhTT0lHSW1maGM5SHdPcGNn@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io
RUN python -m pip install  en_core_web_sm-3.7.1-py3-none-any.whl -i https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3NTcxMzQwMjE6bHZUbkF3QVpBajhTT0lHSW1maGM5SHdPcGNn@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io
ENV DECRYPTION_KEY=leap$123##
WORKDIR /py-job-executer
RUN python -m pip install -r /py-job-executer/requirements.txt -i https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3NTcxMzQwMjE6bHZUbkF3QVpBajhTT0lHSW1maGM5SHdPcGNn@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io
RUN python -m pip install -r /py-job-executer/leap_requirements -i https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3NTcxMzQwMjE6bHZUbkF3QVpBajhTT0lHSW1maGM5SHdPcGNn@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io
RUN python -m pip install -r /py-job-executer/chatbot_requirements -i https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3NTcxMzQwMjE6bHZUbkF3QVpBajhTT0lHSW1maGM5SHdPcGNn@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io
RUN python -m pip install -r /py-job-executer/semanticsearch_requirements -i https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3NTcxMzQwMjE6bHZUbkF3QVpBajhTT0lHSW1maGM5SHdPcGNn@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io
EXPOSE 8080
