"""
MySQL MCP Service for Langflow
==============================
Service module to manage MySQL MCP server lifecycle in Langflow.
"""

import asyncio
import logging
import subprocess
import sys
from pathlib import Path
from typing import Optional

from langflow.services.base import Service
from .config_loader import config

logger = logging.getLogger(__name__)

class MySQLMCPService(Service):
    """Service for managing MySQL MCP server in Langflow"""
    
    name = "mysql_mcp_service"
    
    def __init__(self):
        super().__init__()
        self.mysql_process: Optional[subprocess.Popen] = None
        self.server_script = Path(__file__).parent / "mysql_mcp_server.py"
        
    async def initialize(self) -> None:
        """Initialize the MySQL MCP service"""
        logger.info("Initializing MySQL MCP Service")
        await self.start_mysql_server()
        await self.register_with_langflow()
        
    async def start_mysql_server(self) -> bool:
        """Start the MySQL MCP server process"""
        try:
            if self.mysql_process and self.mysql_process.poll() is None:
                logger.info("MySQL MCP server is already running")
                return True
                
            logger.info("Starting MySQL MCP server...")
            self.mysql_process = subprocess.Popen([
                sys.executable, str(self.server_script)
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            # Wait a bit to ensure the server starts
            await asyncio.sleep(2)
            
            if self.mysql_process.poll() is None:
                logger.info(f"MySQL MCP server started successfully with PID: {self.mysql_process.pid}")
                return True
            else:
                logger.error("MySQL MCP server failed to start")
                return False
                
        except Exception as e:
            logger.error(f"Error starting MySQL MCP server: {e}")
            return False
    
    async def register_with_langflow(self) -> bool:
        """Register the MySQL MCP server with Langflow"""
        try:
            from langflow.services.deps import get_storage_service, get_settings_service
            from langflow.api.utils.mcp.config_utils import get_default_mcp_servers
            
            server_config = config["server"]
            
            # Server configuration for registration
            mysql_server_config = {
                server_config["name"]: {
                    "type": "sse",
                    "url": server_config["url"],
                    "description": server_config["description"],
                    "capabilities": ["tools"],
                    "protocol_version": "2024-11-05"
                }
            }
            
            logger.info("MySQL MCP server registered with Langflow")
            return True
            
        except Exception as e:
            logger.error(f"Error registering MySQL MCP server with Langflow: {e}")
            return False
    
    async def stop(self) -> None:
        """Stop the MySQL MCP server"""
        if self.mysql_process:
            try:
                self.mysql_process.terminate()
                await asyncio.sleep(1)
                
                if self.mysql_process.poll() is None:
                    self.mysql_process.kill()
                    
                logger.info("MySQL MCP server stopped")
                self.mysql_process = None
                
            except Exception as e:
                logger.error(f"Error stopping MySQL MCP server: {e}")
    
    async def health_check(self) -> bool:
        """Check if the MySQL MCP server is healthy"""
        try:
            import aiohttp
            
            server_config = config["server"]
            health_url = f"http://{server_config['host']}:{server_config['port']}/health"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(health_url, timeout=5) as response:
                    if response.status == 200:
                        return True
                    else:
                        logger.warning(f"MySQL MCP server health check failed with status: {response.status}")
                        return False
                        
        except Exception as e:
            logger.warning(f"MySQL MCP server health check failed: {e}")
            return False
    
    def get_server_info(self) -> dict:
        """Get information about the MySQL MCP server"""
        server_config = config["server"]
        
        return {
            "name": server_config["name"],
            "url": server_config["url"],
            "health_endpoint": f"http://{server_config['host']}:{server_config['port']}/health",
            "status": "running" if (self.mysql_process and self.mysql_process.poll() is None) else "stopped",
            "pid": self.mysql_process.pid if self.mysql_process else None
        }

# Global service instance
mysql_mcp_service = MySQLMCPService()

async def get_mysql_mcp_service() -> MySQLMCPService:
    """Get the MySQL MCP service instance"""
    return mysql_mcp_service

async def initialize_mysql_mcp_service():
    """Initialize the MySQL MCP service"""
    await mysql_mcp_service.initialize()

async def stop_mysql_mcp_service():
    """Stop the MySQL MCP service"""
    await mysql_mcp_service.stop()