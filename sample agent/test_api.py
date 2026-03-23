import requests
import json

# Test health endpoint
print("Testing /health endpoint...")
try:
    response = requests.get("http://localhost:8040/health")
    print(f"Status: {response.status_code}")
    print(f"Response Text: {response.text}")
    try:
        print(f"Response JSON: {json.dumps(response.json(), indent=2)}")
    except:
        pass
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*60 + "\n")

# Test /api/ask endpoint
print("Testing /api/ask endpoint...")
test_request = {
    "tmf645_request": {
        "serviceType": "URLLC",
        "requestedCapacity": {
            "bandwidth": "100Mbps",
            "latency": "5ms"
        },
        "location": {
            "city": "New York",
            "coordinates": {
                "lat": 40.7128,
                "lon": -74.0060
            }
        }
    },
    "session_id": "test-session-001"
}

try:
    response = requests.post(
        "http://localhost:8040/api/ask",
        json=test_request,
        headers={"Content-Type": "application/json"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
