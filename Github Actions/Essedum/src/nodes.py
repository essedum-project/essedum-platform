# file: src/nodes.py
"""
Workflow Node Implementations

Each function represents a node from the Langflow design JSON.
Nodes receive WorkflowState and AppConfig, execute logic, and return updates as dict.
"""

import logging
from typing import Any, Optional
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_aws import ChatBedrock
from langgraph.prebuilt import create_react_agent

from src.workflow_state import WorkflowState
from src.config import AppConfig

logger = logging.getLogger(__name__)


def get_model(config: AppConfig, node_params: Optional[dict] = None):
    """
    Get LLM instance based on configuration.
    
    Uses AWS Bedrock with Claude models.
    Applies node-specific parameters or config defaults.
    
    Args:
        config: Application configuration
        node_params: Optional node-specific parameters (temperature, model_name, etc.)
        
    Returns:
        LLM instance (ChatBedrock)
    """
    params = node_params or {}
    
    temperature = params.get("temperature", config.temperature)
    max_tokens = params.get("max_tokens", config.max_tokens)
    model_id = params.get("model_name", config.model_name)
    
    try:
        logger.info(f"Using AWS Bedrock with model: {model_id} in region: {config.aws_region}")
        
        # Prepare credentials dict
        credentials = {
            "aws_access_key_id": config.aws_access_key_id,
            "aws_secret_access_key": config.aws_secret_access_key,
            "region_name": config.aws_region,
        }
        
        # Add session token if provided (for temporary credentials)
        if config.aws_session_token:
            credentials["aws_session_token"] = config.aws_session_token
        
        return ChatBedrock(
            model_id=model_id,
            model_kwargs={
                "temperature": temperature,
                "max_tokens": max_tokens,
            },
            credentials_profile_name=None,  # Use explicit credentials
            region_name=config.aws_region,
            **credentials
        )
    except Exception as e:
        logger.error(f"Failed to initialize AWS Bedrock LLM: {e}")
        raise


def node_chatinput_vip4f(state: WorkflowState, config: AppConfig) -> dict:
    """
    ChatInput node: Captures user input and adds to message history.
    
    Node ID: ChatInput-viP4f
    Type: ChatInput
    """
    try:
        logger.info("Processing ChatInput node")
        
        # Get the latest user input from messages
        user_input = ""
        if state.messages:
            last_msg = state.messages[-1]
            if isinstance(last_msg, dict):
                user_input = last_msg.get("content", "")
            else:
                user_input = str(last_msg)
        
        logger.info(f"User input captured: {user_input[:100]}...")
        
        return {
            "user_input": user_input
        }
        
    except Exception as e:
        logger.error(f"Error in ChatInput node: {e}")
        return {"error": f"ChatInput failed: {str(e)}"}


def node_prompt_template_t2vsf(state: WorkflowState, config: AppConfig) -> dict:
    """
    Prompt Template node: Formats the system prompt with user input.
    
    Node ID: Prompt Template-t2VSF
    Type: Prompt Template
    """
    try:
        logger.info("Processing Prompt Template node")
        
        # Extract template from JSON design
        template = """You are an intelligent Multi-Purpose Agent that handles both General AI questions and Database queries.

**User Query:** {text}

**ANALYZE REQUEST TYPE:**

**SCENARIO 1: GENERAL AI QUESTIONS**
If the query is about general knowledge, explanations, concepts, or non-database topics:
- Respond naturally as a helpful AI assistant
- Do NOT use database tools
- Provide informative, conversational answers

Examples: "What is machine learning?", "Help me write an email", "Explain artificial intelligence"

**SCENARIO 2: DIRECT SQL QUERIES**
If the user provides a complete SQL statement (starts with SELECT, INSERT, UPDATE, DELETE):
- Execute the SQL immediately using mysql_query()
- Return the actual database results
- Show both query and results

**SCENARIO 3: NATURAL LANGUAGE DATABASE QUERIES**
If the query asks for data/information that requires database lookup:
- First use get_tables() to see available tables
- Use describe_table() for relevant tables to understand structure
- Build appropriate SQL query using actual column names
- Execute with mysql_query() and return results

**CRITICAL RULES:**
1. ALWAYS execute mysql_query() for database requests - return real data
2. ALWAYS show the complete response from mysql_query() tool
3. Use get_tables() and describe_table() for natural language queries
4. Never just show query JSON format - always execute and show results
5. For general questions, respond normally without database tools
"""
        
        # Safe formatting - substitute missing keys with empty string
        user_input = state.user_input or ""
        safe_vars = {"text": user_input}
        
        try:
            formatted_prompt = template.format(**safe_vars)
        except KeyError as ke:
            logger.warning(f"Missing template variable: {ke}, using partial format")
            formatted_prompt = template.replace("{text}", user_input)
        
        logger.info("Prompt template formatted successfully")
        
        return {
            "formatted_prompt": formatted_prompt
        }
        
    except Exception as e:
        logger.error(f"Error in Prompt Template node: {e}")
        return {"error": f"Prompt Template failed: {str(e)}"}


def node_mcp_ufeql(state: WorkflowState, config: AppConfig) -> dict:
    """
    MCP Tools node: Placeholder for MCP (Model Context Protocol) tools.
    
    Node ID: MCP-ufEql
    Type: MCP
    
    Phase-1: Returns stub tools list. Real MCP integration requires external server.
    """
    try:
        logger.info("Processing MCP Tools node")
        logger.warning("MCP tools not fully implemented in phase-1; returning stub")
        
        # Stub tools for phase-1
        # In production, this would connect to MCP server and fetch real tools
        mcp_tools = []
        
        return {
            "mcp_tools": mcp_tools
        }
        
    except Exception as e:
        logger.error(f"Error in MCP node: {e}")
        return {"error": f"MCP node failed: {str(e)}"}


def node_azureopenaimodel_6aodl(state: WorkflowState, config: AppConfig) -> dict:
    """
    Azure OpenAI Model node: Invokes LLM with formatted prompt.
    
    Node ID: AzureOpenAIModel-6aodL
    Type: AzureOpenAIModel
    """
    try:
        logger.info("Processing Azure OpenAI Model node")
        
        # Get node-specific parameters from design JSON
        node_params = {
            "temperature": 0.7,
            "max_tokens": None,
        }
        
        llm = get_model(config, node_params)
        
        # Build messages for LLM
        messages = []
        
        # Use formatted prompt if available
        if state.formatted_prompt:
            messages.append(HumanMessage(content=state.formatted_prompt))
        elif state.user_input:
            messages.append(HumanMessage(content=state.user_input))
        else:
            logger.warning("No input available for LLM")
            return {"model_response": "No input provided"}
        
        # Invoke LLM
        logger.info("Invoking LLM...")
        response = llm.invoke(messages)
        
        # Extract text from response
        if hasattr(response, "content"):
            model_response = response.content
        else:
            model_response = str(response)
        
        logger.info(f"LLM response received: {model_response[:100]}...")
        
        return {
            "model_response": model_response
        }
        
    except Exception as e:
        logger.error(f"Error in Azure OpenAI Model node: {e}")
        return {"error": f"Azure OpenAI Model failed: {str(e)}"}


def node_agent_zgq5d(state: WorkflowState, config: AppConfig) -> dict:
    """
    Agent node: Executes agentic workflow with tools.
    
    Node ID: Agent-Zgq5D
    Type: Agent
    
    Uses create_react_agent if tools are available, otherwise direct LLM invocation.
    """
    try:
        logger.info("Processing Agent node")
        
        # Get LLM instance
        node_params = {
            "temperature": 0.7,
        }
        llm = get_model(config, node_params)
        
        # Prepare tools list
        tools = state.mcp_tools or []
        
        # Build input message
        user_input = state.user_input or ""
        
        # If tools exist, use react agent; otherwise direct invocation
        if tools:
            logger.info(f"Creating agent with {len(tools)} tools")
            
            # System message from formatted prompt
            system_message = state.formatted_prompt or "You are a helpful AI assistant."
            
            try:
                agent = create_react_agent(llm, tools, state_modifier=system_message)
                
                # Run agent
                result = agent.invoke({"messages": [HumanMessage(content=user_input)]})
                
                # Extract response
                if "messages" in result and result["messages"]:
                    last_message = result["messages"][-1]
                    agent_response = last_message.content if hasattr(last_message, "content") else str(last_message)
                else:
                    agent_response = str(result)
                    
            except Exception as agent_error:
                logger.warning(f"Agent execution failed, falling back to direct LLM: {agent_error}")
                # Fallback to direct LLM
                messages = [
                    SystemMessage(content=state.formatted_prompt or "You are a helpful assistant."),
                    HumanMessage(content=user_input)
                ]
                response = llm.invoke(messages)
                agent_response = response.content if hasattr(response, "content") else str(response)
        else:
            logger.info("No tools available; using direct LLM invocation")
            
            # Direct LLM invocation without tools
            messages = []
            if state.formatted_prompt:
                messages.append(SystemMessage(content=state.formatted_prompt))
            messages.append(HumanMessage(content=user_input))
            
            response = llm.invoke(messages)
            agent_response = response.content if hasattr(response, "content") else str(response)
        
        logger.info(f"Agent response: {agent_response[:100]}...")
        
        return {
            "agent_response": agent_response
        }
        
    except Exception as e:
        logger.error(f"Error in Agent node: {e}")
        return {"error": f"Agent failed: {str(e)}"}


def node_chatoutput_avpjo(state: WorkflowState, config: AppConfig) -> dict:
    """
    Chat Output node: Formats final output for display.
    
    Node ID: ChatOutput-AVpjO
    Type: ChatOutput
    """
    try:
        logger.info("Processing Chat Output node")
        
        # Get final output from agent or model
        final_output = state.agent_response or state.model_response or "No response generated"
        
        logger.info("Chat output prepared")
        
        return {
            "final_output": final_output
        }
        
    except Exception as e:
        logger.error(f"Error in Chat Output node: {e}")
        return {"error": f"Chat Output failed: {str(e)}"}
