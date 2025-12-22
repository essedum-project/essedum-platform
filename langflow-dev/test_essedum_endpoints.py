"""Simple test script to verify the essedum endpoint fix."""

import requests
import json

def test_essedum_endpoints():
    """Test the essedum endpoints to verify the 500 error is fixed."""
    
    base_url = "http://127.0.0.1:7860"
    
    print("Testing Essedum Endpoints...")
    print("=" * 50)
    
    # Test 1: Status endpoint
    try:
        print("1. Testing Status Endpoint...")
        response = requests.get(f"{base_url}/api/v1/essedum/status")
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print()
    
    # Test 2: Debug endpoint
    try:
        print("2. Testing Debug Endpoint...")
        test_payload = {
            "alias": "test-pipeline",
            "description": "Test pipeline for debugging",
            "type": "AIAgent",
            "interface_type": "pipeline-agent"
        }
        response = requests.post(
            f"{base_url}/api/v1/essedum/create-pipeline-debug",
            json=test_payload,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print()
    
    # Test 3: Create pipeline endpoint
    try:
        print("3. Testing Create Pipeline Endpoint...")
        test_payload = {
            "alias": "test-pipeline",
            "description": "Test pipeline creation",
            "type": "AIAgent",
            "interface_type": "pipeline-agent",
            "is_template": False,
            "json_content": {"test": "data"},
            "groups": []
        }
        response = requests.post(
            f"{base_url}/api/v1/essedum/create-pipeline",
            json=test_payload,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status Code: {response.status_code}")
        if response.status_code in [200, 502]:  # 502 expected if Essedum not reachable
            print(f"   Response: {response.json()}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")

if __name__ == "__main__":
    test_essedum_endpoints()