"""
Integration tests for the API
"""

import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


@pytest.mark.integration
def test_api_workflow():
    """Test complete API workflow"""
    # Step 1: Check health
    health_response = client.get("/health")
    assert health_response.status_code == 200
    
    # Step 2: Get service info
    info_response = client.get("/info")
    assert info_response.status_code == 200
    
    # Step 3: Call root endpoint
    root_response = client.get("/")
    assert root_response.status_code == 200


@pytest.mark.integration
def test_multiple_health_checks():
    """Test multiple consecutive health checks"""
    for _ in range(5):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


@pytest.mark.integration
def test_api_response_consistency():
    """Test API returns consistent responses"""
    # Make multiple requests and verify consistency
    responses = []
    for _ in range(3):
        response = client.get("/info")
        responses.append(response.json())
    
    # All responses should have same version
    versions = [r["version"] for r in responses]
    assert len(set(versions)) == 1, "Version should be consistent"


@pytest.mark.integration
@pytest.mark.slow
def test_api_under_load():
    """Test API behavior under load (100 requests)"""
    success_count = 0
    total_requests = 100
    
    for _ in range(total_requests):
        response = client.get("/health")
        if response.status_code == 200:
            success_count += 1
    
    success_rate = (success_count / total_requests) * 100
    assert success_rate >= 99, f"Success rate too low: {success_rate}%"
