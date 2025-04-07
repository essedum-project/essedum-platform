from flask import Flask, request, jsonify
import json
import logging
import re
from confluent_kafka import Producer
logging.basicConfig(level=logging.INFO, format='- %(levelname)s - %(filename)s - %(message)s')

topic = 'kc-ict885-tp'
bootstrap_servers = 'kc-ict885-kafka-external-bootstrap-kc-ict885.apps.sdampocpclu06.infyit-ocp.com:443'
sasl_mechanism = 'SCRAM-SHA-512'
security_protocol = 'SASL_SSL'
ssl_ca_location = r"/gradio-apps/monitoring/kc-ict885.cert"
kafka_username = 'kc-ict885-user-write'
kafka_password = 'S2OgKJ8Kdc5SvKptC83KXcljElia2FEf'

ssl_config = {
    'security.protocol': security_protocol,
    'sasl.mechanism': sasl_mechanism,
    'ssl.ca.location': ssl_ca_location,
}

producer_config = {
  'bootstrap.servers': bootstrap_servers,
  'sasl.username': kafka_username,
  'sasl.password': kafka_password,
    **ssl_config
}
def process_alert_data(data, modify=False):
    """
    Process and normalize alert data with a consistent structure.
    
    Args:
        data (bytes or dict): Input alert data
    
    Returns:
        dict: Processed alert dictionary
    """
    logging.info(f"Type of data received: {type(data)}, and modify condition: {modify}")
    if modify:
        if isinstance(data, bytes):
            logging.info(f"Modifying data and converting to dict: {data}")
            try:
                cleaned_data = data.decode('utf-8').replace("\\n", "").replace("\n", "")
                # Remove trailing commas before closing brackets only for the last element in arrays
                cleaned_data = re.sub(r',\s*([\]}])', r'\1', cleaned_data)
                # Ensure the trailing comma in the alerts array is removed
                cleaned_data = re.sub(r',\s*([\]}])\s*\]', r'\1]', cleaned_data)
                alerts = json.loads(cleaned_data)
                return alerts
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                return None
        else:
            print("Data is not in bytes format")
            return None
        
    elif isinstance(data, bytes):
        try:
            cleaned_data = data.decode('utf-8').replace("\\n", "").replace("\n", "")
            alerts = json.loads(cleaned_data)
            return alerts
        except json.JSONDecodeError as e:
            logging.error(f"Error decoding JSON: {e}")
            return None

    elif isinstance(data, dict):
        alerts = data.copy()
        return alerts
    else:
        logging.error(f"Unsupported data type: {type(data)}")
        return None


app = Flask(__name__)

@app.errorhandler(400)
def bad_request(error):
    logging.info("400 Error: ",error)
    return jsonify({'error': error}), 400
	
@app.route('/alert', methods=['POST'])
def alert():
    logging.info(f"Received Prometheus alert: {request.data}\n")
    if request.is_json:
        data = request.get_json()
    else:
        data = request.data
    
    # Process the alert data
    alerts = process_alert_data(data)
    
    if not alerts:
        return 'Invalid alert data', 400
    
    alerts.update({"From":"Basic"})
    producer = Producer(producer_config)
    message_key = 'kafkaproducer'
    message_value = json.dumps(alerts)
    producer.produce(topic, key=message_key, value=message_value)   
    producer.flush()
    return 'Message sent successfully!', 200

@app.route('/alert/opensearch', methods=['POST'])
def opensearch_alert():
    logging.info(f"Received OpenSearch alert: {request.data}\n")
    # if request.is_json:
    #     data = request.get_json()
    # else:
    data = request.data
    
    # Process the alert data
    alerts = process_alert_data(data, modify=True)
    
    if not alerts:
        return 'Invalid alert data', 400
    alerts.update({"From":"OpenSearch"})
    logging.info(f"Final message: {alerts}")
    producer = Producer(producer_config)
    message_key = 'kafkaproducer'
    message_value = json.dumps(alerts)
    producer.produce(topic, key=message_key, value=message_value)   
    producer.flush()
    return 'Message sent successfully!', 200

@app.route('/alert/prometheus', methods=['POST'])
def prometheus_alert():
    alerts = request.json
    alerts.update({"From":"Prometheus"})
    logging.info(f"Final message: {alerts}")
    producer = Producer(producer_config)
    message_key = 'kafkaproducer'
    message_value = json.dumps(alerts)
    producer.produce(topic, key=message_key, value=message_value)   
    producer.flush()
    return 'Message sent successfully!', 200

@app.route('/healthCheck', methods=['GET'])
def healthCheck():
    answer_json = {
        "App Status": "UP",
	"Available Endpoints": ["/alert", "/alert/opensearch", "/alert/prometheus"],
        "Avaiable Sources": ["Basic", "OpenSearch", "Prometheus"],
        "Kafka Topic": topic,
        "Kafka Username": kafka_username,
        "Kafka Message Key":"kafkaproducer"
    }
    return answer_json, 200
if __name__ == '__main__':
    app.run(debug=True, host= '0.0.0.0', port=7878)
