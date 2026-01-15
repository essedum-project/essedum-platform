# Langflow to Python ADK Conversion

Production-ready Python implementation of the Langflow workflow design (LEOAZR_M74854_M74854.json).

## Overview

This package converts a Langflow graph (nodes + edges) into an executable LangGraph workflow using modern libraries:
- `langchain-core` and `langchain-openai` for LLM integration
- `langgraph` for agentic workflow orchestration
- `pydantic` v2 for configuration and state management

## Workflow Design

The workflow implements a Multi-Purpose Agent with database query capabilities:

1. **ChatInput** - Captures user input
2. **Prompt Template** - Formats comprehensive system prompt for multi-scenario handling
3. **Azure OpenAI Model** - LLM processing with Azure deployment
4. **MCP Tools** - Model Context Protocol tools (placeholder in phase-1)
5. **Agent** - ReAct agent with tool integration
6. **ChatOutput** - Final response formatting

## Project Structure

```
essedum-pipeline-agent/
├── src/
│   ├── __init__.py              # Package initialization
│   ├── workflow_state.py        # Pydantic state model
│   ├── config.py                # Configuration with Azure/OpenAI support
│   ├── nodes.py                 # Node implementations
│   ├── graph_builder.py         # LangGraph workflow builder
│   └── main.py                  # CLI entry point
├── requirements.txt             # Dependencies
├── LEOAZR_M74854_M74854.json   # Original Langflow design
└── .env                         # Environment configuration (create this)
```

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
# Azure OpenAI (recommended)
AZURE_OPENAI_API_KEY=your-azure-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
AZURE_API_VERSION=2024-06-01

# OR OpenAI (fallback)
OPENAI_API_KEY=your-openai-api-key

# Optional settings
MODEL_NAME=gpt-4
TEMPERATURE=0.7
LOG_LEVEL=INFO
```

### 3. Run the Workflow

```bash
python src/main.py
```

With debug logging:

```bash
python src/main.py --debug
```

With custom design file:

```bash
python src/main.py --design-file path/to/design.json
```

## Usage

The CLI starts an interactive session:

```
Enter your question: What is machine learning?
Assistant: [AI response...]

Enter your question: SELECT * FROM users WHERE role='admin';
Assistant: [Database query results...]

Enter your question: quit
```

## Phase-1 Limitations

- **No conditional branching**: If routers/conditions exist in the design, only the first path is executed
- **MCP Tools**: Placeholder implementation; full MCP server integration pending
- **Linear workflow**: All nodes execute in sequence based on edge order

## Node Functions

Generated node functions from Langflow design:

- `node_chatinput_vip4f` - User input capture
- `node_prompt_template_t2vsf` - Prompt formatting with multi-scenario logic
- `node_mcp_ufeql` - MCP tools integration (stub)
- `node_azureopenaimodel_6aodl` - Azure OpenAI LLM invocation
- `node_agent_zgq5d` - ReAct agent with tool execution
- `node_chatoutput_avpjo` - Final output formatting

## Error Handling

All nodes implement comprehensive error handling:
- Graceful fallbacks for missing inputs
- ASCII-only logging (Windows-safe)
- State propagation with error tracking
- Non-crashing workflow execution

## Deployment

### GitHub Actions (Automated - Recommended)

**Fully automated deployment** to AWS EC2 on every push:

**Quick Setup:**
1. Add GitHub Secrets (Settings → Secrets → Actions):
   - `EC2_HOST` = Your EC2 IP address (e.g., )
   - `EC2_USERNAME` = Your SSH username (e.g., ``)
   - `EC2_PASSWORD` = Your SSH password
   - `AZURE_OPENAI_API_KEY` = Your API key
   - `AZURE_OPENAI_ENDPOINT` = Your Azure endpoint
   - `AZURE_OPENAI_DEPLOYMENT` = Your deployment name

2. Push code to GitHub:
```bash
git add .
git commit -m "deploy: setup automated deployment"
git push origin main
```

3. GitHub Actions will automatically:
   - ✅ Deploy to your EC2 instance
   - ✅ Install/update dependencies
   - ✅ Configure environment variables
   - ✅ Restart the service
   - ✅ Run health checks

**Complete Guide:** [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)

### Local Development

```bash
# Run CLI mode
python src/main.py

# Run web server mode
python src/main.py --mode web --port 8080

# Or with uvicorn directly
uvicorn src.main:app --host 0.0.0.0 --port 8080

# Or with Docker
docker build -t agent-dk .
docker run -p 8080:8080 --env-file .env agent-dk
```

### Manual EC2 Deployment (Alternative)

For manual deployment without GitHub Actions:

**See:** [AWS_EC2_DEPLOYMENT.md](AWS_EC2_DEPLOYMENT.md) for manual deployment instructions

## API Endpoints

When deployed in web mode, the service exposes:

```bash
GET  /              # API information
GET  /health        # Health check for monitoring
POST /query         # Execute workflow with user input
GET  /docs          # Interactive API documentation (Swagger UI)
```

**Example:**
```bash
# Health check
curl http://your-server:8080/health

# Query the workflow
curl -X POST http://your-server:8080/query \
  -H "Content-Type: application/json" \
  -d '{"message": "What is machine learning?", "session_id": "user123"}'
```

## Running Modes

### CLI Mode (Default)
Interactive command-line interface:
```bash
python src/main.py
```

### Web Server Mode
FastAPI server for HTTP requests:
```bash
python src/main.py --mode web --host 0.0.0.0 --port 8080
```

## Documentation

- [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) - **START HERE** - Automated deployment setup
- [AWS_EC2_DEPLOYMENT.md](AWS_EC2_DEPLOYMENT.md) - Manual EC2 deployment guide
- [EC2_SETUP_CHECKLIST.md](EC2_SETUP_CHECKLIST.md) - Interactive deployment checklist
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [ADK_INTEGRATION.md](ADK_INTEGRATION.md) - Integration documentation
