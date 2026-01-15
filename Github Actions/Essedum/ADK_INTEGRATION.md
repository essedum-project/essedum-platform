# ADK Application Integration Guide

## 🎯 Overview

Your **Agent Development Kit (ADK)** is a LangChain/LangGraph-based workflow system that has been integrated into the CI/CD pipeline. The application loads Langflow design JSON files and executes them as LangGraph workflows.

---

## 📁 ADK Application Structure

### Your Actual Application (ADK folder)

```
ADK/
├── LEOAZR_M74854_leo1311.json   # Langflow design file
├── README.md                     # ADK documentation
├── requirements.txt              # Original dependencies
└── src/
    ├── __init__.py              # Package initialization
    ├── config.py                # Configuration (Azure/OpenAI)
    ├── graph_builder.py         # LangGraph workflow builder
    ├── main.py                  # CLI entry point
    ├── nodes.py                 # Node implementations
    └── workflow_state.py        # Pydantic state model
```

### CI/CD Integration Structure

```
c:\ESSEDUM\Github Actions\Essedum/
├── .github/workflows/           # CI/CD workflows
├── scripts/                     # Build & test scripts
├── src/
│   ├── main.py                  # Modified: API mode wrapper
│   └── __init__.py
├── ADK/                         # Your original ADK code
│   └── (all your files)
├── tests/                       # Updated tests
├── requirements.txt             # Updated with LangChain deps
├── Dockerfile                   # Updated for ADK
└── env.template                 # Environment config template
```

---

## 🔄 What Was Updated

### 1. **requirements.txt** - Updated Dependencies

**Added:**
```
langchain>=0.3.0
langchain-core>=0.3.0
langchain-openai>=0.2.0
langgraph>=0.2.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
```

**Kept:**
- FastAPI and Uvicorn for API mode
- Development tools (pytest, ruff, flake8)

### 2. **src/main.py** - Dual Mode Support

**Added:**
- FastAPI wrapper for API mode (production deployment)
- `/workflow/execute` endpoint for workflow execution
- Health checks with workflow engine information
- CLI mode support for interactive usage

**Key Endpoints:**
```python
GET  /               # Service info
GET  /health         # Health check
GET  /info           # Detailed info
POST /workflow/execute  # Execute workflow (placeholder)
```

### 3. **Dockerfile** - ADK-Aware Container

**Updated:**
- Copies both `src/` and `ADK/` directories
- Copies JSON design files
- Supports environment variables for Azure OpenAI
- Maintains API mode as default entry point

### 4. **Tests** - ADK-Specific Validations

**Added tests for:**
- Workflow engine identification
- LangChain/LangGraph endpoints
- ADK-specific API structure

---

## 🚀 Deployment Modes

### Mode 1: API Mode (Production - Default)

The container runs as a FastAPI service that can execute workflows via HTTP:

```bash
# Start container
docker run -d -p 8080:8080 \
  -e AZURE_OPENAI_API_KEY=your-key \
  -e AZURE_OPENAI_ENDPOINT=your-endpoint \
  -e AZURE_OPENAI_DEPLOYMENT=your-deployment \
  --name agent-dk-uat \
  192.168.28.36:5000/agent-dk:latest

# Execute workflow
curl -X POST http://192.168.28.36:18080/workflow/execute \
  -H "Content-Type: application/json" \
  -d '{"user_input": "Hello", "session_id": "test-123"}'
```

### Mode 2: CLI Mode (Interactive)

Run the original ADK CLI interface:

```bash
# Interactive CLI
docker run -it agent-dk:latest python -m src.main --cli --debug

# Or use the original ADK main.py
docker run -it agent-dk:latest python -m ADK.src.main --debug
```

---

## 🔧 Environment Configuration

### Required Environment Variables

For production deployment, configure these in your container:

```bash
# Azure OpenAI (Primary)
AZURE_OPENAI_API_KEY=***
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
AZURE_API_VERSION=2024-06-01

# Optional: OpenAI (Fallback)
OPENAI_API_KEY=***

# Model Configuration
MODEL_NAME=gpt-4
TEMPERATURE=0.7
MAX_TOKENS=1000
```

### Setting in CI/CD Workflow

The workflow already supports passing environment variables:

```yaml
# In .github/workflows/adk-cicd.yml
docker run -d \
  --name ${CONTAINER_NAME} \
  --restart unless-stopped \
  --gpus all \
  -p ${EXTERNAL_PORT}:${INTERNAL_PORT} \
  -e ENVIRONMENT=${{ needs.metadata.outputs.environment }} \
  -e DEPLOY_VERSION=${{ needs.metadata.outputs.image_tag }} \
  -e AZURE_OPENAI_API_KEY=${{ secrets.AZURE_OPENAI_API_KEY }} \    # ADD THIS
  -e AZURE_OPENAI_ENDPOINT=${{ secrets.AZURE_OPENAI_ENDPOINT }} \  # ADD THIS
  -e AZURE_OPENAI_DEPLOYMENT=${{ secrets.AZURE_OPENAI_DEPLOYMENT }} \  # ADD THIS
  ${FULL_IMAGE}
```

---

## 🔐 Adding ADK Secrets to GitHub

In addition to the SSH secrets, add these for ADK functionality:

```
Settings → Secrets and variables → Actions → New secret

Name: AZURE_OPENAI_API_KEY
Value: your-azure-openai-api-key

Name: AZURE_OPENAI_ENDPOINT
Value: https://your-resource.openai.azure.com/

Name: AZURE_OPENAI_DEPLOYMENT
Value: your-deployment-name
```

**Optional OpenAI fallback:**
```
Name: OPENAI_API_KEY
Value: your-openai-api-key
```

---

## ✅ Integration TODO List

### 1. Complete Workflow Execution Integration

The `/workflow/execute` endpoint currently has a placeholder. To complete it:

**File:** `src/main.py`

```python
@app.post("/workflow/execute", response_model=WorkflowResponse)
async def execute_workflow(request: WorkflowRequest):
    """Execute ADK workflow with user input"""
    try:
        # Import your ADK modules
        from ADK.src.config import AppConfig
        from ADK.src.graph_builder import create_workflow
        from ADK.src.workflow_state import WorkflowState
        
        # Load configuration
        config = AppConfig()
        
        # Load design JSON
        design_path = Path(request.design_file)
        with open(design_path) as f:
            design_json = json.load(f)
        
        # Build workflow
        workflow = create_workflow(config, design_json)
        
        # Execute with user input
        initial_state = WorkflowState(
            user_input=request.user_input,
            session_id=request.session_id
        )
        
        result = workflow.invoke(initial_state.dict())
        
        return WorkflowResponse(
            response=result.get("final_output", "No output"),
            session_id=request.session_id,
            status="success"
        )
    except Exception as e:
        logger.error(f"Workflow execution failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
```

### 2. Update Workflow to Pass Environment Variables

**File:** `.github/workflows/adk-cicd.yml`

**Find the "Deploy New Container" step and add:**

```yaml
- name: Deploy New Container with GPU Support
  run: |
    ssh ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} << 'EOF'
      # ... existing code ...
      
      docker run -d \
        --name ${CONTAINER_NAME} \
        --restart unless-stopped \
        --gpus all \
        -p ${EXTERNAL_PORT}:${INTERNAL_PORT} \
        -e ENVIRONMENT=${{ needs.metadata.outputs.environment }} \
        -e DEPLOY_VERSION=${{ needs.metadata.outputs.image_tag }} \
        -e DEPLOY_TIMESTAMP=${{ needs.metadata.outputs.deploy_timestamp }} \
        -e AZURE_OPENAI_API_KEY=${{ secrets.AZURE_OPENAI_API_KEY }} \
        -e AZURE_OPENAI_ENDPOINT=${{ secrets.AZURE_OPENAI_ENDPOINT }} \
        -e AZURE_OPENAI_DEPLOYMENT=${{ secrets.AZURE_OPENAI_DEPLOYMENT }} \
        -e AZURE_API_VERSION=2024-06-01 \
        -e MODEL_NAME=gpt-4 \
        -e TEMPERATURE=0.7 \
        ${FULL_IMAGE}
```

### 3. Add ADK-Specific Tests

**Create:** `tests/test_adk_integration.py`

```python
"""
Integration tests for ADK workflow system
"""
import pytest
from pathlib import Path

@pytest.mark.integration
def test_adk_modules_importable():
    """Test that ADK modules can be imported"""
    try:
        from ADK.src.config import AppConfig
        from ADK.src.workflow_state import WorkflowState
        from ADK.src.nodes import get_model
        assert True
    except ImportError as e:
        pytest.fail(f"ADK modules not importable: {e}")

@pytest.mark.integration
def test_design_file_exists():
    """Test that Langflow design file exists"""
    design_file = Path("LEOAZR_M74854_leo1311.json")
    assert design_file.exists(), "Design JSON file not found"

@pytest.mark.integration
@pytest.mark.slow
def test_workflow_configuration():
    """Test that workflow can be configured"""
    from ADK.src.config import AppConfig
    
    # Should not raise if .env is properly configured
    try:
        config = AppConfig()
        assert config is not None
    except Exception as e:
        pytest.skip(f"Configuration not available: {e}")
```

---

## 📊 Testing Your ADK Deployment

### Local Testing

```bash
# 1. Build container
docker build -t agent-dk:test .

# 2. Run with your Azure OpenAI credentials
docker run -d -p 8080:8080 \
  -e AZURE_OPENAI_API_KEY=your-key \
  -e AZURE_OPENAI_ENDPOINT=your-endpoint \
  -e AZURE_OPENAI_DEPLOYMENT=your-deployment \
  --name adk-test \
  agent-dk:test

# 3. Test health endpoint
curl http://localhost:8080/health

# 4. Test workflow execution (after implementing)
curl -X POST http://localhost:8080/workflow/execute \
  -H "Content-Type: application/json" \
  -d '{
    "user_input": "What can you help me with?",
    "session_id": "test-001"
  }'

# 5. Check logs
docker logs adk-test

# 6. Cleanup
docker stop adk-test && docker rm adk-test
```

### Production Testing (After Deployment)

```bash
# UAT environment (Port 18080)
curl http://192.168.28.36:18080/health
curl http://192.168.28.36:18080/info

# Workflow execution
curl -X POST http://192.168.28.36:18080/workflow/execute \
  -H "Content-Type: application/json" \
  -d '{"user_input": "Test query", "session_id": "uat-001"}'
```

---

## 🔍 Troubleshooting ADK-Specific Issues

### Issue 1: Missing Azure OpenAI Credentials

**Symptom:** Container starts but workflow execution fails

**Solution:**
```bash
# Check if environment variables are set
docker exec agent-dk-uat env | grep AZURE

# Add secrets to GitHub (see above)
# Update workflow to pass secrets to container
```

### Issue 2: Design JSON File Not Found

**Symptom:** `FileNotFoundError: Design file not found`

**Solution:**
```bash
# Ensure JSON file is copied in Dockerfile
# Verify file exists in container:
docker exec agent-dk-uat ls -la *.json

# If missing, update Dockerfile COPY instruction
```

### Issue 3: LangChain Import Errors

**Symptom:** `ImportError: No module named 'langchain'`

**Solution:**
```bash
# Verify requirements.txt includes LangChain deps
# Rebuild container:
docker build --no-cache -t agent-dk:latest .
```

---

## 📝 Next Steps

1. **Add GitHub Secrets** for Azure OpenAI credentials
2. **Update workflow YAML** to pass secrets as environment variables
3. **Complete workflow execution** integration in `src/main.py`
4. **Add ADK-specific tests** for workflow validation
5. **Test locally** with Docker before deploying
6. **Deploy to UAT** and verify workflow execution
7. **Monitor logs** for any runtime issues

---

## 📚 Reference

- **Your ADK Code:** `ADK/` directory
- **API Wrapper:** [src/main.py](src/main.py)
- **Requirements:** [requirements.txt](requirements.txt)
- **Dockerfile:** [Dockerfile](Dockerfile)
- **Environment Template:** [env.template](env.template)
- **CI/CD Workflow:** [.github/workflows/adk-cicd.yml](.github/workflows/adk-cicd.yml)

---

**Status:** ✅ CI/CD pipeline is ready for your ADK application  
**Mode:** Hybrid (API + CLI support)  
**Engine:** LangChain + LangGraph  
**Deployment:** GPU-enabled containers on 192.168.28.36  

**Ready to deploy your LangGraph workflows to production!** 🚀
