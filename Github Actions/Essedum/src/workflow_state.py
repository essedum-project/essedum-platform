# file: src/workflow_state.py
"""
Workflow State Definition

Defines the WorkflowState Pydantic model that captures all data flowing through
the workflow graph. Each node reads from and writes to this shared state.
"""

from typing import Optional, Any
from pydantic import BaseModel, Field


class WorkflowState(BaseModel):
    """
    Shared state for the Langflow workflow execution.
    
    Each node function receives this state and returns a dict with updates.
    The graph automatically merges updates into the state.
    
    Fields represent outputs from each node in the workflow:
    - messages: Chat message history
    - user_input: Raw user input text
    - formatted_prompt: Prompt template output
    - model_response: LLM response
    - agent_response: Agent execution result
    - final_output: Final chat output
    - error: Any error messages from node execution
    """
    
    # Chat history - core message list
    messages: list[dict] = Field(default_factory=list, description="Chat message history")
    
    # Node outputs
    user_input: Optional[str] = Field(None, description="User input from ChatInput node")
    formatted_prompt: Optional[str] = Field(None, description="Formatted prompt from Prompt Template")
    model_response: Optional[str] = Field(None, description="Response from Azure OpenAI model")
    agent_response: Optional[str] = Field(None, description="Response from Agent node")
    final_output: Optional[str] = Field(None, description="Final output from ChatOutput")
    
    # MCP tools metadata
    mcp_tools: Optional[list[Any]] = Field(default_factory=list, description="MCP tools available to agent")
    
    # Error tracking
    error: Optional[str] = Field(None, description="Error message if any node fails")
    
    # Session metadata
    session_id: Optional[str] = Field(None, description="Session identifier for conversation tracking")
    
    class Config:
        """Pydantic v2 configuration."""
        arbitrary_types_allowed = True
    
    def update(self, delta: dict) -> "WorkflowState":
        """
        Merge updates into state deterministically.
        
        Args:
            delta: Dictionary of field updates from a node execution
            
        Returns:
            Self (updated state)
        """
        for key, value in delta.items():
            if hasattr(self, key):
                setattr(self, key, value)
        return self
