#!/usr/bin/env python3
# file: test_vllm.py
"""
vLLM Integration Test Script

Tests the vLLM endpoint and demonstrates usage with various prompts.
"""

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import requests
import json
import time
from src.vllm_client import VLLMClient

VLLM_URL = "http://litellm:4000/chat/completions"
MODEL_NAME = "Llama-3.2-3B-Instruct"
API_KEY = "sk-1234"


def test_endpoint_health():
    """Test if vLLM endpoint is reachable"""
    print("\n" + "="*80)
    print("TEST 0: Endpoint Health Check")
    print("="*80)
    
    print(f"\n🔍 Checking vLLM endpoint: {VLLM_URL}")
    
    try:
        # Try a simple GET request first
        response = requests.get(VLLM_URL.replace('/v1/completions', '/health'), timeout=5)
        print(f"✅ Health endpoint responded with status: {response.status_code}")
    except requests.exceptions.RequestException:
        print(f"⚠️  Health endpoint not available, trying completions endpoint...")
    
    # Try a minimal completion request
    try:
        payload = {
            "model": MODEL_NAME,
            "prompt": "Hello",
            "max_tokens": 5,
            "temperature": 0.7
        }
        response = requests.post(VLLM_URL, json=payload, headers={"Content-Type": "application/json"}, timeout=30)
        
        if response.status_code == 200:
            print(f"✅ vLLM endpoint is working! Status: {response.status_code}")
            result = response.json()
            print(f"✅ Model response: {result.get('choices', [{}])[0].get('text', 'N/A')}")
            return True
        else:
            print(f"❌ vLLM returned status: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Connection timed out after 30 seconds")
        return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Could not connect to vLLM at {VLLM_URL}")
        print(f"   Make sure vLLM is running and accessible")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_basic_queries():
    """Test basic question-answering"""
    print("\n" + "="*80)
    print("TEST 1: Basic Question Answering")
    print("="*80)
    
    client = VLLMClient(url=VLLM_URL, model_name=MODEL_NAME)
    
    test_cases = [
        ("What is the capital of France?", 50),
        ("Explain what fiber optic internet is in one sentence.", 100),
        ("List 3 benefits of high-speed internet.", 150)
    ]
    
    for i, (prompt, max_tokens) in enumerate(test_cases, 1):
        print(f"\n📝 Test {i}: {prompt}")
        print("-" * 80)
        response = client.query_vllm(prompt, max_tokens=max_tokens, temperature=0.7)
        
        if response:
            print(f"✅ Response: {response}")
        else:
            print(f"❌ Failed to get response")
        print()


def test_json_generation():
    """Test JSON generation capability"""
    print("\n" + "="*80)
    print("TEST 2: JSON Generation")
    print("="*80)
    
    client = VLLMClient(url=VLLM_URL, model_name=MODEL_NAME)
    
    prompt = """Generate a JSON object with the following information:
- service_type: "fiber"
- speed: "100Mbps"
- city: "Paris"

Return ONLY the JSON object, no other text."""
    
    print(f"\n📝 Prompt: {prompt}")
    print("-" * 80)
    
    response = client.query_vllm(prompt, max_tokens=200, temperature=0.3)
    
    if response:
        print(f"✅ Response: {response}")
        
        # Try to parse as JSON
        try:
            # Extract JSON from response
            start_idx = response.find('{')
            end_idx = response.rfind('}')
            if start_idx != -1 and end_idx != -1:
                json_str = response[start_idx:end_idx+1]
                parsed = json.loads(json_str)
                print(f"✅ Successfully parsed JSON: {json.dumps(parsed, indent=2)}")
        except json.JSONDecodeError as e:
            print(f"⚠️  Warning: Could not parse as JSON: {e}")
    else:
        print(f"❌ Failed to get response")


def test_langchain_message_format():
    """Test with LangChain message format"""
    print("\n" + "="*80)
    print("TEST 3: LangChain Message Format")
    print("="*80)
    
    client = VLLMClient(url=VLLM_URL, model_name=MODEL_NAME)
    
    # Simulate LangChain messages
    from langchain_core.messages import HumanMessage, SystemMessage
    
    messages = [
        SystemMessage(content="You are a helpful assistant for service qualification. Extract information from user input."),
        HumanMessage(content="I need 100Mbps fiber internet at 123 Main Street, Paris, France. My name is John.")
    ]
    
    print(f"\n📝 Testing LangChain message format...")
    print("-" * 80)
    
    response = client.invoke(messages)
    
    if response:
        print(f"✅ Response: {response.content}")
    else:
        print(f"❌ Failed to get response")


def test_service_qualification_scenario():
    """Test the actual service qualification use case"""
    print("\n" + "="*80)
    print("TEST 4: Service Qualification Scenario")
    print("="*80)
    
    client = VLLMClient(url=VLLM_URL, model_name=MODEL_NAME, max_tokens=500)
    
    system_prompt = """You are a helpful assistant collecting information for a service qualification request.

Required information:
1. Service type (e.g., broadband, fiber)
2. Service speed (e.g., 100Mbps)
3. Address (street, city, postcode, country)
4. Customer name

Analyze the user input and respond in JSON format:
{
  "is_complete": true or false,
  "collected_info": {
    "service_type": "value or null",
    "service_speed": "value or null",
    "street": "value or null",
    "city": "value or null",
    "postcode": "value or null",
    "country": "value or null",
    "customer_name": "value or null"
  },
  "message_to_user": "Your message here"
}

Return ONLY the JSON object."""

    user_input = "I need 100Mbps fiber internet"
    
    from langchain_core.messages import SystemMessage, HumanMessage
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"User input: {user_input}")
    ]
    
    print(f"\n📝 User says: {user_input}")
    print("-" * 80)
    
    response = client.invoke(messages)
    
    if response:
        print(f"✅ Response: {response.content}")
        
        # Try to parse as JSON
        try:
            content = response.content
            start_idx = content.find('{')
            end_idx = content.rfind('}')
            if start_idx != -1 and end_idx != -1:
                json_str = content[start_idx:end_idx+1]
                parsed = json.loads(json_str)
                print(f"\n✅ Parsed JSON:")
                print(json.dumps(parsed, indent=2))
        except json.JSONDecodeError as e:
            print(f"⚠️  Warning: Could not parse as JSON: {e}")
    else:
        print(f"❌ Failed to get response")


def run_all_tests():
    """Run all tests"""
    print("\n" + "🚀"*40)
    print("vLLM MODEL TESTING SUITE")
    print(f"Endpoint: {VLLM_URL}")
    print(f"Model: {MODEL_NAME}")
    print("🚀"*40)
    
    # Test endpoint health first
    if not test_endpoint_health():
        print("\n❌ vLLM endpoint is not accessible. Please check:")
        print("   1. Is vLLM server running?")
        print("   2. Is the URL correct?")
        print("   3. Can you reach the server from this machine?")
        return
    
    # Run all tests
    test_basic_queries()
    test_json_generation()
    test_langchain_message_format()
    test_service_qualification_scenario()
    
    print("\n" + "="*80)
    print("✅ All tests completed!")
    print("="*80)


if __name__ == "__main__":
    run_all_tests()
