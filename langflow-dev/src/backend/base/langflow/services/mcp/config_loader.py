"""
Configuration loader for MySQL MCP Server
==========================================
Simple configuration management using environment variables from .env file
"""

import os
from pathlib import Path
from typing import Dict, Any

def load_config() -> Dict[str, Any]:
    """Load configuration from environment variables and .env file"""
    
    # Load .env file if it exists
    env_file = Path(__file__).parent / "mcp_config.env"
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    # Only set if not already in environment
                    if key not in os.environ:
                        os.environ[key] = value
    
    # Return configuration dictionary
    return {
        # MySQL Configuration
        "mysql": {
            "host": os.getenv("MYSQL_HOST", "localhost"),
            "port": int(os.getenv("MYSQL_PORT", "3306")),
            "user": os.getenv("MYSQL_USER", "root"),
            "password": os.getenv("MYSQL_PASSWORD", ""),
            "database": os.getenv("MYSQL_DATABASE", "essedum_db_core")
        },
        
        # MCP Server Configuration
        "server": {
            "host": os.getenv("MCP_SERVER_HOST", "127.0.0.1"),
            "port": int(os.getenv("MCP_SERVER_PORT", "5555")),
            "url": os.getenv("MCP_SERVER_URL", f"http://{os.getenv('MCP_SERVER_HOST', '127.0.0.1')}:{os.getenv('MCP_SERVER_PORT', '5555')}/mcp/sse"),
            "description": os.getenv("MCP_SERVER_DESCRIPTION", "MySQL database MCP server for local database communication"),
            "name": os.getenv("MCP_SERVER_NAME", "mysql_database_server")
        }
    }

# Global configuration instance
config = load_config()