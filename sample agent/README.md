# Langflow to Python ADK Conversion

Production-ready Python implementation of the Langflow workflow design with **LLM-powered intelligent service qualification**.

## Overview

This package converts a Langflow graph (nodes + edges) into an executable LangGraph workflow using modern libraries:
- **LiteLLM** for LLM inference (Llama 3.2 or other models)
- `langchain-core` for message handling
- `langgraph` for agentic workflow orchestration
- `pydantic` v2 for configuration and state management

**NEW**: The TMF 645 Service Qualification workflow now uses **LLM-based intelligent reasoning** instead of deterministic rules, providing context-aware validation and qualification decisions.

## Workflow Design

The workflow implements TMF 645 Service Qualification with **LLM-based intelligent reasoning**:

1. **ChatInput** - Captures user input
2. **Prompt Template** - Formats comprehensive system prompt for multi-scenario handling
3. **TMF 645 Validator (LLM-based)** - Uses LiteLLM to intelligently validate service requests
4. **Service Qualifier (LLM-based)** - Uses LiteLLM to analyze requirements and make qualification decisions
5. **MCP Tools** - Optional: Queries MCP server for real-time network data to inform LLM decisions
6. **ChatOutput** - Final response formatting

**Key Features:**
- ✅ **LLM-powered validation** - Intelligent understanding of TMF 645 requests
- ✅ **LLM-powered qualification** - Context-aware service qualification decisions
- ✅ **Hybrid approach** - Combines LLM reasoning with optional real-time network data from MCP server
- ✅ **Explainable decisions** - LLM provides reasoning and confidence scores

## Project Structure

```
LEOSMPLG95195-leo1311/
├── src/
│   ├── __init__.py              # Package initialization
│   ├── workflow_state.py        # Pydantic state model
│   ├── config.py                # Configuration with vLLM/Azure/OpenAI support
│   ├── vllm_client.py           # vLLM client implementation
│   ├── nodes.py                 # Node implementations
│   ├── graph_builder.py         # LangGraph workflow builder
│   └── main.py                  # CLI entry point
├── requirements.txt             # Dependencies
├── test_vllm.py                 # vLLM integration tests
├── VLLM_CONFIG.md              # vLLM configuration guide
├── LEOAZR_M74854_leo1311.json  # Original Langflow design
└── .env                         # Environment configuration (create this)
```

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the project root:

**Option A: vLLM (Recommended - Default)**

```env
# LiteLLM Configuration
USE_VLLM=true
VLLM_URL=http://litellm:4000/chat/completions
VLLM_MODEL_NAME=
VLLM_API_KEY=

# Langfuse Configuration (Optional - for LLM Observability)
LANGFUSE_SECRET_KEY=
LANGFUSE_PUBLIC_KEY=
LANGFUSE_HOST=http://langfuse:3000

# Model Settings
TEMPERATURE=0.7
MAX_TOKENS=500
TIMEOUT_SECONDS=120
LOG_LEVEL=INFO
```

**Option B: Azure OpenAI (Alternative)**

```env
USE_VLLM=false
AZURE_OPENAI_API_KEY=your-azure-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
AZURE_API_VERSION=2024-06-01

TEMPERATURE=0.7
LOG_LEVEL=INFO
```

**Option C: OpenAI (Alternative)**

```env
USE_VLLM=false
OPENAI_API_KEY=your-openai-api-key
MODEL_NAME=gpt-4

TEMPERATURE=0.7
LOG_LEVEL=INFO
```

See [VLLM_CONFIG.md](VLLM_CONFIG.md) for detailed configuration instructions.

**Note**: VLLM_API_KEY is optional and only required if your LiteLLM server enforces authentication.

### 3. Test LiteLLM Connection (if using vLLM)

Before running the main workflow, test your vLLM connection:

```bash
python test_vllm.py
```

This will verify:
- vLLM endpoint connectivity
- Model response quality
- LangChain message format compatibility
- JSON generation capabilities

### 4. Run the Workflow

```bash
python -m src.main --design-file LEOAZR_M74854_leo1311.json
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
- `node_azureopenaimodel_6aodl` - LLM invocation (vLLM/Azure OpenAI/OpenAI)
- `node_agent_zgq5d` - ReAct agent with tool execution
- `node_chatoutput_avpjo` - Final output formatting

## LLM Provider Selection

The system automatically selects the LLM provider based on your configuration:

1. **vLLM** - If `USE_VLLM=true` and vLLM settings are configured
2. **Azure OpenAI** - If Azure credentials are configured
3. **OpenAI** - If OpenAI API key is configured

The `get_model()` function in [src/nodes.py](src/nodes.py) handles provider selection automatically.

## Error Handling

All nodes implement comprehensive error handling:
- Graceful fallbacks for missing inputs
- ASCII-only logging (Windows-safe)
- State propagation with error tracking
- Non-crashing workflow execution

## Development

### Running Tests

```bash
python -m pytest tests/
```

### Logging

Set `LOG_LEVEL=DEBUG` in `.env` for detailed execution traces.

### Extending

To add custom nodes:
1. Create node function in `src/nodes.py`
2. Register in `node_function_map` in `src/graph_builder.py`
3. Update `WorkflowState` if new fields are needed

## License

Production-ready conversion for enterprise deployment.
