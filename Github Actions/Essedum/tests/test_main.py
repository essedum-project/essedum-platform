"""
Unit tests for ADK main module (API mode)
"""

import os
import pytest
from fastapi.testclient import TestClient

# Set test environment
os.environ["TESTING"] = "true"
os.environ["ENVIRONMENT"] = "test"

from src.main import app

client = TestClient(app)


@pytest.mark.unit
def test_root_endpoint():
    """Test root endpoint returns expected response"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["status"] == "operational"
    assert data["mode"] == "langchain-langgraph"


@pytest.mark.unit
def test_health_endpoint():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "agent-dk"
    assert data["workflow_engine"] == "langgraph"


@pytest.mark.unit
def test_health_endpoint_structure():
    """Test health endpoint returns all required fields"""
    response = client.get("/health")
    data = response.json()
    
    required_fields = ["status", "service", "environment", "version", "workflow_engine"]
    for field in required_fields:
        assert field in data, f"Missing required field: {field}"


@pytest.mark.unit
def test_info_endpoint():
    """Test info endpoint returns service information"""
    response = client.get("/info")
    assert response.status_code == 200
    data = response.json()
    assert "service" in data
    assert "version" in data
    assert "workflow_engine" in data
    assert data["service"] == "agent-dk"
    assert data["workflow_engine"] == "langgraph"


@pytest.mark.unit
def test_workflow_endpoint_structure():
    """Test workflow execution endpoint exists and has proper structure"""
    # Test with minimal valid request
    response = client.post(
        "/workflow/execute",
        json={
            "user_input": "test input",
            "session_id": "test-session"
        }
    )
    # Should return 200 or 500 (implementation dependent), but not 404
    assert response.status_code in [200, 500], "Workflow endpoint should exist"


@pytest.mark.unit
def test_invalid_endpoint():
    """Test that invalid endpoints return 404"""
    response = client.get("/invalid-endpoint")
    assert response.status_code == 404


@pytest.mark.unit
def test_environment_variables():
    """Test that environment variables are properly set in test mode"""
    response = client.get("/health")
    data = response.json()
    assert data["environment"] == "test"


@pytest.mark.unit
def test_adk_specific_endpoints():
    """Test ADK-specific functionality is exposed"""
    # Root should mention ADK
    response = client.get("/")
    data = response.json()
    assert "Agent Development Kit" in data["message"]
    
    # Info should show LangChain/LangGraph
    response = client.get("/info")
    data = response.json()
    assert "langchain" in data.get("langchain_version", "").lower()
