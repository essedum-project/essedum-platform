set http_proxy=http://blrproxy.ad.infosys.com:80
set https_proxy=http://blrproxy.ad.infosys.com:80
set NO_PROXY=localhost,0.0.0.0,*.ad.infosys.com,10.*,10.82.53.110
cd D:\py-job-vertex-executer-master\py-job-vertex-executer-master\vertexcloud
D: 
call .\Scripts\activate
cd D:\py-job-vertex-executer-master\py-job-vertex-executer-master
python D:\py-job-vertex-executer-master\py-job-vertex-executer-master\app.py
