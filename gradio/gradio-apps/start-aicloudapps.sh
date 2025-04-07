export HTTP_PROXY=http://blrproxy.ad.infosys.com:80
export HTTPS_PROXY=http://blrproxy.ad.infosys.com:80
export http_proxy=http://blrproxy.ad.infosys.com:80
export https_proxy=http://blrproxy.ad.infosys.com:80
export NO_PROXY=localhost,0.0.0.0,127.0.0.1
echo "Installing Requirements"
pip install -r requirements.txt
# sleep 30
cd monitoring
echo "Starting Kafka Webhook"
python kafka_webhook.py &
# sleep 30
# cd AI-Cloud;
# python KnowledgeSearch.py &
# echo "Started KnowledgeSearch" 
# sleep 30
# echo "Starting SummarizeWithAnonymize" 
# cd ..
# cd langchains
# ls
# python -m streamlit run SummarizeWithAnonymize.py --server.headless true --server.port 7861 &
# sleep 30
# cd ..
# cd Haystack
# ls
# echo "Starting RFP_Ingestion" 
# python RFP_Ingestion.py &
# sleep 30
# echo "Started RFP_Ingestion"
# echo "Starting RFP_Inference" 
# python RFP_Inference.py &
# echo "Started RFP_Inference"
# cd ..
# cd langchains
# ls
# python -m streamlit run Hr_chatbot_ACS.py --server.headless true --server.port 7864 &
# sleep 100
# python -m streamlit run AITwin_ITSupport.py --server.headless true --server.port 7865 &
# sleep 30
# cd ..
# cd leap
# echo "Starting ITSM app" 
# python ITSM.py &
# sleep 30
# echo "Starrting Automation Buddy app" 
# python automationBuddy.py &
# sleep 30
