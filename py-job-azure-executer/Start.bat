set http_proxy=http://blrproxy.ad.infosys.com:80
set https_proxy=http://blrproxy.ad.infosys.com:80
set NO_PROXY=localhost,0.0.0.0,*.ad.infosys.com,10.*,10.82.53.110
cd D:\py-job-azure-executer-master\py-job-azure-executer-master\azurevenv
D: 
call .\Scripts\activate
cd D:\py-job-azure-executer-master\py-job-azure-executer-master
py -3.10 D:\py-job-azure-executer-master\py-job-azure-executer-master\app.py
