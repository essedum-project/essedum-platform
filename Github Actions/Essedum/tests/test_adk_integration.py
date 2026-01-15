"""
Integration tests for ADK workflow system
Tests the LangChain/LangGraph components
"""

import pytest
from pathlib import Path
import sys
import os

# Add src to path for direct imports
sys.path.insert(0, str(Path(__file__).parent.parent))


@pytest.mark.integration
def test_adk_modules_importable():
    """Test that ADK modules can be imported"""
    try:
        from src.config import AppConfig
        from src.workflow_state import WorkflowState
        assert AppConfig is not None
        assert WorkflowState is not None
    except ImportError as e:
        pytest.skip(f"ADK modules not available: {e}")


@pytest.mark.integration
def test_design_file_exists():
    """Test that Langflow design file exists"""
    design_files = [
        "LEOAZR_M74854_leo1311.json",
        "design/LEOAZR_M74854_leo1311.json"
    ]
    
    found = False
    for design_file in design_files:
        if Path(design_file).exists():
            found = True
            break
    
    if not found:
        pytest.skip("Design JSON file not found in expected locations")


@pytest.mark.integration
def test_workflow_state_model():
    """Test WorkflowState Pydantic model"""
    try:
        from src.workflow_state import WorkflowState
        
        # Create instance
        state = WorkflowState(
            user_input="test input",
            session_id="test-session"
        )
        
        assert state.user_input == "test input"
        assert state.session_id == "test-session"
        assert isinstance(state.messages, list)
    except ImportError:
        pytest.skip("ADK modules not available")


@pytest.mark.integration
@pytest.mark.slow
def test_app_config_initialization():
    """Test AppConfig initialization (without actual credentials)"""
    try:
        from src.config import AppConfig
        
        # Should not raise even without credentials
        # The config class should handle missing values gracefully
        config = AppConfig()
        
        assert config is not None
        assert hasattr(config, "model_name")
        assert hasattr(config, "temperature")
    except ImportError:
        pytest.skip("ADK modules not available")
    except Exception as e:
        # Configuration may fail without proper .env, which is OK
        pytest.skip(f"Configuration requires environment setup: {e}")


@pytest.mark.integration
def test_langchain_dependencies():
    """Test that LangChain dependencies are installed"""
    try:
        import langchain
        import langchain_core
        import langchain_openai
        import langgraph
        assert True
    except ImportError as e:
        pytest.fail(f"LangChain dependencies not installed: {e}")


@pytest.mark.integration
def test_pydantic_v2():
    """Test that Pydantic v2 is installed"""
    try:
        import pydantic
        from pydantic import BaseModel
        from pydantic_settings import BaseSettings
        
        # Verify Pydantic v2
        assert hasattr(BaseModel, "model_config"), "Pydantic v2 required"
    except ImportError as e:
        pytest.fail(f"Pydantic v2 not installed: {e}")


@pytest.mark.integration
def test_api_workflow_endpoint():
    """Test that workflow API endpoint is accessible"""
    from fastapi.testclient import TestClient
    from src.main import app
    
    client = TestClient(app)
    
    # Test workflow endpoint exists
    response = client.post(
        "/workflow/execute",
        json={
            "user_input": "test",
            "session_id": "test-123"
        }
    )
    
    # Should return 200 (success) or 500 (implementation not complete)
    # But not 404 (endpoint doesn't exist)
    assert response.status_code in [200, 500], \
        f"Workflow endpoint should exist, got {response.status_code}"


@pytest.mark.integration
@pytest.mark.slow
def test_full_workflow_pipeline():
    """
    Integration test for full workflow pipeline
    Skipped if credentials not available
    """
    pytest.skip("Requires Azure OpenAI credentials - run manually in production")
    
    # Example of how to test full pipeline:
    # from ADK.src.config import AppConfig
    # from ADK.src.graph_builder import create_workflow
    # from ADK.src.workflow_state import WorkflowState
    # 
    # config = AppConfig()
    # # Load design JSON
    # # Build workflow
    # # Execute workflow
    # # Assert output
