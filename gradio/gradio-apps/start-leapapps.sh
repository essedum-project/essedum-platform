export HTTP_PROXY=http://blrproxy.ad.infosys.com:80
export HTTPS_PROXY=http://blrproxy.ad.infosys.com:80
export http_proxy=http://blrproxy.ad.infosys.com:80
export https_proxy=http://blrproxy.ad.infosys.com:80
export NO_PROXY=localhost,0.0.0.0,127.0.0.1,10.81.78.167

echo "Starting ITSM buddy"
python /gradio-apps/leap/ITSM.py &
sleep 30
echo "Starting Automation buddy"
python /gradio-apps/leap/automationBuddy.py &
sleep 30
echo "Starting Kafka Webhook"
python /gradio-apps/monitoring/kafka_webhook.py &
sleep 30
python
