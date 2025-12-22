"""
MySQL MCP Server Integration for Langflow
==========================================
This module provides integration for the MySQL MCP server into Langflow's MCP system.
"""

import json
import logging
import os
from pathlib import Path
from typing import Dict, Any

logger = logging.getLogger(__name__)

def get_mysql_mcp_config() -> Dict[str, Any]:
    """Get the MySQL MCP server configuration"""
    return {
        "name": "mysql_database_server",
        "description": "MySQL database MCP server for local database communication",
        "type": "sse",
        "url": "http://127.0.0.1:5555/mcp/sse",
        "capabilities": ["tools"],
        "protocol_version": "2024-11-05",
        "config": {
            "command": "python",
            "args": [
                str(Path(__file__).parent / "mysql_mcp_server.py")
            ],
            "env": {
                "PYTHONPATH": str(Path(__file__).parent.parent),
                "LANGFLOW_MCP_SERVER_ENABLED": "true"
            },
            "cwd": str(Path(__file__).parent)
        }
    }

def get_mysql_mcp_server_definition() -> Dict[str, Any]:
    """Get the server definition for registration with Langflow"""
    return {
        "mysql_database_server": {
            "command": "python",
            "args": [
                str(Path(__file__).parent / "mysql_mcp_server.py")
            ],
            "env": {
                "PYTHONPATH": str(Path(__file__).parent.parent),
                "LANGFLOW_MCP_SERVER_ENABLED": "true"
            },
            "cwd": str(Path(__file__).parent),
            "description": "MySQL database MCP server for local database communication",
            "capabilities": ["tools"],
            "protocol_version": "2024-11-05"
        }
    }

async def register_mysql_mcp_server():
    """Register the MySQL MCP server with Langflow's MCP system"""
    try:
        # Import Langflow MCP utilities
        from langflow.api.v2.mcp import upload_server_config
        from langflow.services.deps import get_storage_service, get_settings_service
        
        logger.info("Registering MySQL MCP server with Langflow")
        
        # Get server configuration
        server_config = {
            "mcpServers": get_mysql_mcp_server_definition()
        }
        
        logger.info(f"MySQL MCP server configuration: {server_config}")
        return server_config
        
    except ImportError as e:
        logger.warning(f"Could not register MySQL MCP server: {e}")
        return None
    except Exception as e:
        logger.error(f"Error registering MySQL MCP server: {e}")
        return None

def start_mysql_mcp_server():
    """Start the MySQL MCP server as a subprocess"""
    import subprocess
    import sys
    
    server_script = Path(__file__).parent / "mysql_mcp_server.py"
    
    try:
        logger.info("Starting MySQL MCP server...")
        process = subprocess.Popen([
            sys.executable, str(server_script)
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        logger.info(f"MySQL MCP server started with PID: {process.pid}")
        return process
        
    except Exception as e:
        logger.error(f"Failed to start MySQL MCP server: {e}")
        return None

if __name__ == "__main__":
    # For testing purposes
    import asyncio
    
    async def main():
        config = await register_mysql_mcp_server()
        if config:
            print("MySQL MCP server configuration:")
            print(json.dumps(config, indent=2))
        else:
            print("Failed to register MySQL MCP server")
    
    asyncio.run(main())