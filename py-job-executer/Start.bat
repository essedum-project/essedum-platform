	echo "Start up script"
echo "-------------------------------"
cd /
git clone https://sarbajeet-pattanaik_infosys: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@github.com/Infosys-icets-leap/py-job-executer
pip install boto3 minio --index-url https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
cd /py-job-executer/
echo "requirements -------"
pip install -r requirements.txt --index-url https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com
echo "Flask app----------"
cd /py-job-executer/
python app.py
