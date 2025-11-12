"""
MySQL MCP Server for Langflow Integration
========================================
A Model Context Protocol (MCP) server that provides MySQL database access tools
for Langflow applications.
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

import mysql.connector
from fastapi import FastAPI, Response, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# Import config with fallback for different execution contexts
try:
    from .config_loader import config
except ImportError:
    from config_loader import config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MySQL MCP Server", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL Configuration from environment
MYSQL_CONFIG = config["mysql"]

class MCPRequest(BaseModel):
    """MCP request model"""
    jsonrpc: str = "2.0"
    id: Optional[str] = None
    method: Optional[str] = None
    params: Optional[Dict[str, Any]] = None

class MCPResponse(BaseModel):
    """MCP response model"""
    jsonrpc: str = "2.0"
    id: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, Any]] = None

def execute_mysql_query(query: str) -> List[Dict[str, Any]]:
    """Execute MySQL query and return results as list of dictionaries"""
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query)
        
        if query.strip().lower().startswith(('select', 'show', 'describe', 'explain')):
            result = cursor.fetchall()
        else:
            conn.commit()
            result = [{"affected_rows": cursor.rowcount, "message": "Query executed successfully"}]
        
        cursor.close()
        conn.close()
        
        logger.info(f"Query executed successfully: {len(result) if isinstance(result, list) else 1} rows affected")
        return result
        
    except mysql.connector.Error as e:
        logger.error(f"MySQL error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Server error: {e}")

def get_mcp_tools():
    """Get available MCP tools"""
    return [
        {
            "name": "mysql_query",
            "description": "Execute SQL queries against the MySQL database",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "SQL query to execute"
                    }
                },
                "required": ["query"]
            }
        },
        {
            "name": "get_tables",
            "description": "Get list of tables in the database",
            "inputSchema": {
                "type": "object",
                "properties": {},
                "required": []
            }
        },
        {
            "name": "describe_table",
            "description": "Get table structure and column information",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "table_name": {
                        "type": "string",
                        "description": "Name of the table to describe"
                    }
                },
                "required": ["table_name"]
            }
        }
    ]

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "server": "MySQL MCP Server for Langflow"
    }

@app.get("/mcp/tools")
async def get_tools_endpoint():
    """Direct endpoint to get available tools (for Langflow compatibility)"""
    return {
        "jsonrpc": "2.0",
        "result": {
            "tools": get_mcp_tools()
        }
    }

@app.post("/mcp/tools")
async def post_tools_endpoint():
    """POST endpoint for tools list (for MCP compatibility)"""
    return {
        "jsonrpc": "2.0",
        "result": {
            "tools": get_mcp_tools()
        }
    }

@app.get("/mcp/sse")
@app.get("/mcp/sse/")
@app.get("/mcp/sse/{session_path:path}")
async def sse_endpoint(request: Request, session_path: Optional[str] = None):
    """Server-Sent Events endpoint for MCP communication"""
    
    # Extract session ID from various sources
    session_id = session_path or request.query_params.get('session_id') or 'default_session'
    
    logger.info(f"SSE connection established for session: {session_id}")
    logger.info(f"Request headers: {dict(request.headers)}")
    logger.info(f"Request URL: {request.url}")
    
    async def event_stream():
        try:
            # Send a simple ping first to establish connection
            yield f"data: {json.dumps({'type': 'ping'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Send initialization message in the format Langflow expects
            init_message = {
                "jsonrpc": "2.0",
                "method": "notifications/initialized",
                "params": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {
                        "tools": {
                            "listChanged": True
                        }
                    },
                    "serverInfo": {
                        "name": "MySQL MCP Server",
                        "version": "1.0.0"
                    }
                }
            }
            yield f"data: {json.dumps(init_message)}\n\n"
            await asyncio.sleep(0.1)
            
            # Send tools list immediately
            tools_message = {
                "jsonrpc": "2.0",
                "method": "notifications/tools/list_changed",
                "params": {
                    "tools": get_mcp_tools()
                }
            }
            yield f"data: {json.dumps(tools_message)}\n\n"
            await asyncio.sleep(0.1)
            
            logger.info(f"Session {session_id} initialized successfully with {len(get_mcp_tools())} tools")
            
            # Keep connection alive with periodic pings
            while True:
                await asyncio.sleep(30)
                ping_message = {
                    "jsonrpc": "2.0",
                    "method": "notifications/ping",
                    "params": {
                        "timestamp": datetime.now().isoformat()
                    }
                }
                yield f"data: {json.dumps(ping_message)}\n\n"
                
        except Exception as e:
            logger.error(f"SSE stream error: {e}")
            # Send error message
            error_message = {
                "jsonrpc": "2.0",
                "method": "notifications/error",
                "params": {
                    "error": str(e)
                }
            }
            yield f"data: {json.dumps(error_message)}\n\n"
    
    return StreamingResponse(
        event_stream(), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
        }
    )

@app.post("/mcp/sse")
@app.post("/mcp/sse/")
@app.post("/mcp/sse/{session_path:path}")
async def handle_mcp_requests(request: Request, session_path: Optional[str] = None):
    """Handle MCP method calls"""
    try:
        data = await request.json()
        logger.info(f"Received MCP request: {data}")
        
        method = data.get("method")
        params = data.get("params", {})
        request_id = data.get("id", "1")
        
        if method == "tools/list":
            logger.info("Handling tools/list request")
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "result": {
                    "tools": get_mcp_tools()
                }
            }
            
        elif method == "tools/call":
            tool_name = params.get("name")
            arguments = params.get("arguments", {})
            logger.info(f"Handling tools/call request for tool: {tool_name}")
            
            if tool_name == "mysql_query":
                query = arguments.get("query")
                if not query:
                    return {
                        "jsonrpc": "2.0",
                        "id": request_id,
                        "error": {"code": -32602, "message": "Query parameter is required"}
                    }
                
                result = execute_mysql_query(query)
                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "result": {
                        "content": [{
                            "type": "text", 
                            "text": json.dumps(result, default=str, indent=2)
                        }]
                    }
                }
                
            elif tool_name == "get_tables":
                result = execute_mysql_query("SHOW TABLES")
                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "result": {
                        "content": [{
                            "type": "text", 
                            "text": json.dumps(result, default=str, indent=2)
                        }]
                    }
                }
                
            elif tool_name == "describe_table":
                table_name = arguments.get("table_name")
                if not table_name:
                    return {
                        "jsonrpc": "2.0",
                        "id": request_id,
                        "error": {"code": -32602, "message": "table_name parameter is required"}
                    }
                
                result = execute_mysql_query(f"DESCRIBE {table_name}")
                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "result": {
                        "content": [{
                            "type": "text", 
                            "text": json.dumps(result, default=str, indent=2)
                        }]
                    }
                }
            
            else:
                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "error": {"code": -32601, "message": f"Unknown tool: {tool_name}"}
                }
                
        elif method == "initialize":
            logger.info("Handling initialize request")
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {
                        "tools": {
                            "listChanged": True
                        }
                    },
                    "serverInfo": {
                        "name": "MySQL MCP Server", 
                        "version": "1.0.0"
                    }
                }
            }
            
        else:
            logger.warning(f"Unknown method: {method}")
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {"code": -32601, "message": f"Unknown method: {method}"}
            }
            
    except Exception as e:
        logger.error(f"Error handling MCP request: {e}")
        return {
            "jsonrpc": "2.0",
            "error": {"code": -32603, "message": str(e)}
        }

@app.options("/mcp/sse")
@app.options("/mcp/sse/")
@app.options("/mcp/sse/{session_path:path}")
async def handle_cors_options(session_path: Optional[str] = None):
    """Handle CORS preflight requests"""
    return Response(
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    )

if __name__ == "__main__":
    import uvicorn
    
    server_config = config["server"]
    
    print("🚀 " + "="*50)
    print("   MySQL MCP Server for Langflow")
    print("   " + "="*50)
    print(f"   🌐 Server: http://{server_config['host']}:{server_config['port']}")
    print(f"   🔗 SSE Endpoint: {server_config['url']}")
    print(f"   💊 Health Check: http://{server_config['host']}:{server_config['port']}/health")
    print("   " + "="*50)
    print("   ✅ Ready for Langflow integration!")
    print("🚀 " + "="*50)
    
    uvicorn.run(app, host=server_config["host"], port=server_config["port"], log_level="info")