"""
MCP HTTP Client for connecting to MCP Server via SSE/HTTP
Communicates with MCP server using JSON-RPC over HTTP
"""

import asyncio
import httpx
import json
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class MCPHttpClient:
    """
    Client for communicating with MCP server via SSE/HTTP transport.
    """
    
    def __init__(self, base_url: str = "http://localhost:8094"):
        """
        Initialize MCP HTTP client.
        
        Args:
            base_url: Base URL of the MCP server (default: http://localhost:8094)
        """
        self.base_url = base_url.rstrip('/')
        self.messages_url = f"{self.base_url}/messages"
        self.timeout = 60.0
        self._initialized = False
        
    async def initialize(self):
        """Initialize connection to MCP server"""
        if self._initialized:
            return
            
        request = {
            "jsonrpc": "2.0",
            "id": 0,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {
                    "name": "ServiceQualifierAgent",
                    "version": "1.0.0"
                }
            }
        }
        
        try:
            response = await self._send_request(request)
            self._initialized = True
            logger.info("MCP client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize MCP client: {e}")
            raise
        
    async def list_tools(self) -> List[Dict[str, Any]]:
        """
        List available tools from the MCP server.
        
        Returns:
            List of tool definitions
        """
        if not self._initialized:
            await self.initialize()
            
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/list",
            "params": {}
        }
        
        response = await self._send_request(request)
        return response.get("result", {}).get("tools", [])
    
    async def call_tool(
        self,
        tool_name: str,
        arguments: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Call a tool on the MCP server.
        
        Args:
            tool_name: Name of the tool to call
            arguments: Tool arguments
            
        Returns:
            Tool execution result
        """
        if not self._initialized:
            await self.initialize()
            
        request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments
            }
        }
        
        response = await self._send_request(request)
        
        if "error" in response:
            error = response["error"]
            raise Exception(f"MCP Tool Error: {error.get('message', 'Unknown error')}")
        
        result = response.get("result", {})
        
        # Parse content from MCP response
        content = result.get("content", [])
        if content and len(content) > 0:
            # Extract text from first content item
            first_content = content[0]
            if isinstance(first_content, dict) and "text" in first_content:
                return {"content": first_content["text"], "raw": result}
        
        return {"content": str(result), "raw": result}
    
    async def _send_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send a JSON-RPC request to the MCP server.
        
        Args:
            request: JSON-RPC request
            
        Returns:
            JSON-RPC response
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.messages_url,
                    json=request,
                    headers={
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"MCP Server returned status {response.status_code}: {response.text}")
                    raise Exception(f"MCP Server error: {response.status_code}")
                    
        except httpx.TimeoutException:
            logger.error(f"MCP request timed out after {self.timeout}s")
            raise Exception("MCP request timed out")
        except Exception as e:
            logger.error(f"MCP request failed: {str(e)}")
            raise
    
    async def check_service_qualification(
        self,
        related_party: Dict[str, Any],
        network_metrics: Dict[str, Any],
        risk_threshold: float = 0.5,
        service_qualification_items: list = None
    ) -> Dict[str, Any]:
        """
        Check service qualification using MCP server.
        
        Args:
            related_party: TMF 645 relatedParty object
            network_metrics: Network metrics for qualification
            risk_threshold: Risk threshold for qualification
            service_qualification_items: List of service qualification items with bandwidth/latency requirements
            
        Returns:
            Service qualification result
        """
        arguments = {
            "relatedParty": related_party,
            "network_metrics": network_metrics,
            "risk_threshold": risk_threshold
        }
        
        # Include service qualification items if provided
        if service_qualification_items:
            arguments["serviceQualificationItem"] = service_qualification_items
        
        return await self.call_tool("check_service_qualification", arguments)
    
    async def provision_slice(
        self,
        related_party: Dict[str, Any],
        service_specification: Dict[str, Any],
        service_characteristics: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Provision a network slice using MCP server (calls orchestrator API).
        
        Args:
            related_party: TMF 645 relatedParty object
            service_specification: Service specification details
            service_characteristics: List of service characteristics
            
        Returns:
            Slice provisioning result
        """
        arguments = {
            "relatedParty": related_party,
            "serviceSpecification": service_specification,
            "serviceCharacteristic": service_characteristics
        }
        
        return await self.call_tool("provision_slice", arguments)
