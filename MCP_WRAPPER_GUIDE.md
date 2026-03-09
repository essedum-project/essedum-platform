# MCP Server Wrapper Guide for Developers

Simple guide to expose any agent system as an MCP (Model Context Protocol) HTTP server.

## Prerequisites

- Python 3.11+
- Your existing agent code
- GitHub Copilot

## Time Required

**10-15 minutes** 

---

## The Simple Approach

## Step 1: Tell Copilot About Your Agents

Open GitHub Copilot and use this prompt:

### 🤖 Main Prompt

```
Create an MCP server wrapper that exposes my existing agents as tools via HTTP streaming (SSE).

My agents:
- [Agent Class Name] in [file path]
  - Method: [method_name(params)] - [what it does]
  - Method: [method_name(params)] - [what it does]
  
- [Another Agent Class] in [file path]
  - Method: [method_name(params)] - [what it does]

Requirements:
1. Create mcp_server/ folder with:
   - server.py: HTTP server using Starlette + Uvicorn
   - main.py: Entry point script
   - __init__.py: Module initialization
   - SSE endpoint at /sse for MCP protocol
   - Health check endpoint at /health
   - Tool handlers that call my agent methods
   - Proper error handling and logging
   
2. Add necessary dependencies to requirements.txt:
   - mcp, starlette, uvicorn, sse-starlette

3. Each agent method should be exposed as an MCP tool with:
   - Clear tool name and description
   - JSON schema for input parameters
   - Proper return format

Server should run on http://localhost:8000
Run with: python -m mcp_server.main
```

**That's it!** Copilot will create all the code, schemas, and configurations.

---

## Step 2: Containerize the mcp server

### 🐳 Docker Prompt

```
Containerize the MCP server application.

Create:
1. Dockerfile with:
   - Python 3.11+ base image
   - Install all dependencies from requirements.txt
   - Copy application code
   - Expose port 8000
   - Run: python -m mcp_server.main

2. docker-compose.yml for easy deployment

3. .dockerignore file

Include health check and proper logging.
```

---

## Step 3: Test It

### Start the server:
```bash
python -m mcp_server.main
```

### Check health:
```bash
curl http://localhost:8000/health
```

### Expected response:
```json
{"status": "healthy"}
```

### Or with Docker:
```bash
docker-compose up
```

---

## What You'll Get

Copilot will create:

✅ **mcp_server/** - Folder containing all MCP server code  
✅ **mcp_server/server.py** - Complete MCP server with HTTP/SSE support  
✅ **mcp_server/main.py** - Entry point script  
✅ **Updated requirements.txt** - All dependencies  
✅ **Dockerfile** - Container configuration  
✅ **docker-compose.yml** - Easy deployment  
✅ **Tool schemas** - Proper JSON schemas for all tools  
✅ **Error handling** - Try/catch blocks and logging  
✅ **Health endpoint** - For monitoring  

---

## Example: Real Usage

**Your current project:**
```
my-project/
├── agents/
│   ├── validator.py      # ValidatorAgent with validate(data) method
│   └── processor.py      # ProcessorAgent with process(request) method
└── requirements.txt
```

**Your prompt to Copilot:**
```
Create an MCP server wrapper that exposes my agents as tools via HTTP streaming.

My agents:
- ValidatorAgent in agents/validator.py
  - Method: validate(data) - validates input data against rules
  
- ProcessorAgent in agents/processor.py  
  - Method: process(request) - processes validated requests

Organize MCP server code in mcp_server/ folder with server.py and main.py.
Use HTTP/SSE, expose both methods as MCP tools, add health check at /health, 
run on port 8000. Include all dependencies.
```

**Copilot creates everything in seconds!**

**Result:**
```
my-project/
├── agents/
│   ├── validator.py
│   └── processor.py
├── mcp_server/            # ✨ Created by Copilot
│   ├── __init__.py
│   ├── server.py
│   └── main.py
├── requirements.txt       # ✨ Updated
├── Dockerfile             # ✨ Created
└── docker-compose.yml     # ✨ Created
```

---

## Accessing Your MCP Server

Once running, your server is available at:

- **Base URL:** `http://localhost:8000`
- **Health Check:** `GET http://localhost:8000/health`
- **MCP Endpoint:** `POST http://localhost:8000/sse`

Any MCP-compatible client can connect to `http://localhost:8000/sse`

---

## Troubleshooting

**Port already in use?**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

**Module not found?**
```bash
pip install -r requirements.txt
```

**Can't connect?**
- Check server is running: `curl http://localhost:8000/health`
- Check firewall allows port 8000
- Verify URL in client: `http://localhost:8000/sse`

---

## Tips for Better Results

When giving the prompt to Copilot:

1. **Be specific about agent locations** - Include file paths
2. **Describe what methods do** - Helps Copilot create better descriptions
3. **Mention any special requirements** - Authentication, CORS, rate limiting
4. **Include example inputs** - Copilot will create better schemas

### Enhanced Prompt Example:

```
Create an MCP server wrapper for my service qualification agents.

Agents in src/:
- TMF645ValidatorAgent in validator_agent.py
  - validate_request(tmf645_request: dict) -> Returns (bool, str, dict)
  - Checks if TMF 645 service requests are valid
  
- ServiceQualifierAgent in qualifier_agent.py
  - qualify_service(validated_request: dict) -> Returns (bool, str, dict)  
  - Determines if service can be provisioned

Organize in mcp_server/ folder. Create HTTP MCP server with:
- Starlette + Uvicorn
- SSE endpoint for MCP protocol
- Tool for each agent method
- Proper JSON schemas
- Error handling
- Health check
- Port 8000

Add dependencies to requirements.txt. Include Dockerfile.
Run with: python -m mcp_server.main
```

**Copilot will generate production-ready code!**

---

## Summary

**What to do:**
1. Open Copilot
2. Describe your agents and methods
3. Ask for MCP HTTP server wrapper in mcp_server/ folder
4. Let Copilot create all the code
5. Test it with `python -m mcp_server.main`

**Time saved:** 50+ minutes of manual coding

---

## Project Structure After Copilot Creation

```
your-project/
├── agents/                    # Your existing agent code
│   ├── agent1.py
│   └── agent2.py
├── mcp_server/                # ✨ Created by Copilot - MCP server code
│   ├── __init__.py
│   ├── server.py              # MCP server implementation
│   └── main.py                # Entry point
├── requirements.txt           # ✨ Updated by Copilot
├── Dockerfile                 # ✨ Created by Copilot
├── docker-compose.yml         # ✨ Created by Copilot
└── .dockerignore              # ✨ Created by Copilot
```
