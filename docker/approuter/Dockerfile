FROM  infyartifactory.jfrog.io/docker-local/aiplat/leap-pyjob-executer:3.0.4
WORKDIR /
USER root
ENV HTTP_PROXY=http://blrproxy.ad.infosys.com:80
ENV HTTPS_PROXY=http://blrproxy.ad.infosys.com:80
ENV http_proxy=http://blrproxy.ad.infosys.com:80
ENV https_proxy=http://blrproxy.ad.infosys.com:80
RUN apt-get -y update && \
    apt-get -y install git
USER leapuser
RUN python -m pip install langchain -i https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3MjI5Mzk1MjA6b25Yc3ZVRUYxV2tYR1VDS1p3elNFMkxQOHpM@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io
RUN python -m pip install unstructured[docx] -i https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3MjI5Mzk1MjA6b25Yc3ZVRUYxV2tYR1VDS1p3elNFMkxQOHpM@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io
RUN python -m pip install qdrant-client -i https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3MjI5Mzk1MjA6b25Yc3ZVRUYxV2tYR1VDS1p3elNFMkxQOHpM@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io
RUN python -m pip install unstructured -i https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3MjI5Mzk1MjA6b25Yc3ZVRUYxV2tYR1VDS1p3elNFMkxQOHpM@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io
RUN python -m pip install sentence-transformers -i https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3MjI5Mzk1MjA6b25Yc3ZVRUYxV2tYR1VDS1p3elNFMkxQOHpM@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io
RUN python -m pip install protobuf==3.20.0 -i https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3MjI5Mzk1MjA6b25Yc3ZVRUYxV2tYR1VDS1p3elNFMkxQOHpM@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io
RUN python -m pip install unstructured[pdf] -i https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3MjI5Mzk1MjA6b25Yc3ZVRUYxV2tYR1VDS1p3elNFMkxQOHpM@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io
RUN python -m pip install python-dotenv -i https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3MjI5Mzk1MjA6b25Yc3ZVRUYxV2tYR1VDS1p3elNFMkxQOHpM@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io
RUN python -m pip install openai -i https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3MjI5Mzk1MjA6b25Yc3ZVRUYxV2tYR1VDS1p3elNFMkxQOHpM@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io
RUN python -m pip install huggingface-hub==0.16.4 -i https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3MjI5Mzk1MjA6b25Yc3ZVRUYxV2tYR1VDS1p3elNFMkxQOHpM@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io
USER root
RUN git config --global http.sslVerify false
ENV MAVEN_REPO_USER=lalith.basna
ENV GIT_TOKEN=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
RUN git clone https://${MAVEN_REPO_USER}:${GIT_TOKEN}@github.com/Infosys-icets-leap/aip-app-router;
RUN apt-get -y remove git
RUN chown -R leapuser /aip-app-router/
RUN chmod -R 777 /aip-app-router/
USER leapuser
EXPOSE 8080
