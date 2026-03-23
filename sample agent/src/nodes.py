# file: src/nodes.py
"""
Workflow Node Implementations

Each function represents a node from the Langflow design JSON.
Nodes receive WorkflowState and AppConfig, execute logic, and return updates as dict.
"""

import logging
from typing import Any, Optional
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_openai import AzureChatOpenAI, ChatOpenAI
from langgraph.prebuilt import create_react_agent

from src.workflow_state import WorkflowState
from src.config import AppConfig
from src.vllm_client import VLLMClient

logger = logging.getLogger(__name__)


def get_model(config: AppConfig, node_params: Optional[dict] = None):
    """
    Get LLM instance based on configuration.
    
    Uses vLLM/LiteLLM if configured, otherwise Azure OpenAI or OpenAI.
    Applies node-specific parameters or config defaults.
    
    Args:
        config: Application configuration
        node_params: Optional node-specific parameters (temperature, model_name, etc.)
        
    Returns:
        LLM instance (VLLMClient, AzureChatOpenAI, or ChatOpenAI)
    """
    params = node_params or {}
    
    temperature = params.get("temperature", config.temperature)
    max_tokens = params.get("max_tokens", config.max_tokens)
    timeout = params.get("timeout", config.timeout_seconds)
    
    logger.info(f"=" * 80)
    logger.info(f"Initializing LLM Model:")
    logger.info(f"  Temperature: {temperature}")
    logger.info(f"  Max Tokens: {max_tokens}")
    logger.info(f"  Timeout: {timeout}s")
    
    # Use vLLM/LiteLLM if configured
    if config.is_vllm():
        logger.info(f"  Provider: LiteLLM (vLLM)")
        logger.info(f"  URL: {config.vllm_url}")
        logger.info(f"  Model: {config.vllm_model_name}")
        logger.info(f"  API Key: {'<set>' if config.vllm_api_key else '<empty>'}")
        logger.info(f"  Langfuse: {'enabled' if config.is_langfuse_enabled() else 'disabled'}")
        logger.info(f"=" * 80)
        
        return VLLMClient(
            url=config.vllm_url,
            model_name=config.vllm_model_name,
            api_key=config.vllm_api_key or "",  # API key is optional
            temperature=temperature,
            max_tokens=max_tokens or 500,
            timeout=timeout,
            langfuse_secret_key=config.langfuse_secret_key,
            langfuse_public_key=config.langfuse_public_key,
            langfuse_host=config.langfuse_host
        )
    # Use Azure OpenAI if configured
    elif config.is_azure():
        model_name = params.get("model_name", config.model_name)
        logger.info(f"Using Azure OpenAI with deployment: {config.azure_openai_deployment}")
        
        try:
            return AzureChatOpenAI(
                azure_endpoint=config.azure_openai_endpoint,
                azure_deployment=config.azure_openai_deployment,
                api_version=config.azure_api_version,
                api_key=config.azure_openai_api_key,
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=timeout,
            )
        except Exception as e:
            logger.error(f"Error initializing Azure OpenAI: {e}")
            raise ValueError(f"Azure OpenAI initialization failed: {e}")
    # Fall back to OpenAI
    elif config.is_openai():
        model_name = params.get("model_name", config.model_name)
        logger.info(f"Using OpenAI with model: {model_name}")
        
        try:
            return ChatOpenAI(
                model=model_name,
                api_key=config.openai_api_key,
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=timeout,
            )
        except Exception as e:
            logger.error(f"Error initializing OpenAI: {e}")
            raise ValueError(f"OpenAI initialization failed: {e}")
    else:
        logger.error("No LLM provider configured")
        raise ValueError("No LLM provider configured. Set USE_VLLM=true or configure Azure OpenAI/OpenAI credentials.")


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
        logger.error(f"Error in LLM Model node: {e}")
        return {"error": f"LLM Model failed: {str(e)}"}


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


def node_tmf645_validator(state: WorkflowState, config: AppConfig) -> dict:
    """
    TMF 645 Validator node: Uses LLM to validate service qualification request format.
    
    Node Type: TMF645Validator (LLM-based)
    """
    try:
        logger.info("Processing TMF 645 Validator node (LLM-based)")
        
        import json
        from langchain_core.messages import HumanMessage, SystemMessage
        
        # Get TMF 645 request from state
        tmf645_request = state.tmf645_request
        
        if not tmf645_request:
            logger.error("No TMF 645 request found in state")
            return {
                "validation_passed": False,
                "validation_result": {
                    "validation_status": "failed",
                    "message": "No TMF 645 request provided",
                    "is_valid": False
                },
                "error": "No TMF 645 request provided"
            }
        
        # Get LLM instance
        logger.info("Initializing LLM for validation...")
        llm = get_model(config, {"temperature": 0.3, "max_tokens": 500})
        
        # Create validation prompt
        system_prompt = """You are a TMF 645 Service Qualification Request Validator.
Your task is to analyze a service qualification request and determine if it's valid.

A valid TMF 645 request should have:
1. serviceQualificationItem array with at least one item
2. Each item should have a 'service' object with service specifications
3. Service should have bandwidth, latency, or other QoS requirements
4. Optional: relatedParty information

Respond in JSON format:
{
  "is_valid": true/false,
  "validation_status": "passed" or "failed",
  "message": "explanation",
  "missing_fields": ["list of missing fields if any"],
  "items_validated": number
}"""
        
        request_json = json.dumps(tmf645_request, indent=2)
        user_prompt = f"""Validate this TMF 645 Service Qualification Request:

{request_json}

Provide your validation result in JSON format."""
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        
        # Invoke LLM
        logger.info("Calling LLM to validate TMF 645 request...")
        response = llm.invoke(messages)
        
        # Extract response content
        if hasattr(response, "content"):
            response_text = response.content
        else:
            response_text = str(response)
        
        logger.info(f"LLM validation response: {response_text[:200]}...")
        
        # Parse LLM response
        try:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{[^{}]*"is_valid"[^{}]*\}', response_text, re.DOTALL)
            if json_match:
                validation_data = json.loads(json_match.group())
            else:
                # Fallback: parse response text
                is_valid = "valid" in response_text.lower() and "not valid" not in response_text.lower()
                validation_data = {
                    "is_valid": is_valid,
                    "validation_status": "passed" if is_valid else "failed",
                    "message": response_text,
                    "items_validated": len(tmf645_request.get('serviceQualificationItem', []))
                }
        except Exception as parse_error:
            logger.warning(f"Failed to parse LLM response as JSON: {parse_error}")
            is_valid = "valid" in response_text.lower() and ("invalid" not in response_text.lower() and "not valid" not in response_text.lower())
            validation_data = {
                "is_valid": is_valid,
                "validation_status": "passed" if is_valid else "failed",
                "message": response_text,
                "items_validated": len(tmf645_request.get('serviceQualificationItem', []))
            }
        
        is_valid = validation_data.get('is_valid', False)
        logger.info(f"LLM Validation result: {'PASSED' if is_valid else 'FAILED'}")
        
        return {
            "validation_passed": is_valid,
            "validation_result": validation_data,
            "llm_response": response_text
        }
        
    except Exception as e:
        logger.error(f"Error in TMF 645 Validator node: {e}", exc_info=True)
        return {
            "validation_passed": False,
            "validation_result": {
                "validation_status": "error",
                "message": f"LLM Validator error: {str(e)}",
                "is_valid": False
            },
            "error": f"TMF 645 Validator failed: {str(e)}"
        }


def node_service_qualifier(state: WorkflowState, config: AppConfig) -> dict:
    """
    Service Qualifier node: Uses LLM to analyze service requirements and make qualification decisions.
    Optionally queries MCP server for network data to inform the decision.
    
    Node Type: ServiceQualifier (LLM-based)
    """
    try:
        logger.info("Processing Service Qualifier with LLM-based reasoning")
        
        # Check if validation passed
        if not state.validation_passed:
            logger.warning("Skipping qualification - validation failed")
            return {
                "service_qualified": False,
                "qualification_result": {
                    "qualification_status": "skipped",
                    "message": "Qualification skipped due to validation failure",
                    "is_qualified": False
                }
            }
        
        # Get TMF 645 request
        tmf645_request = state.tmf645_request
        
        # Get configuration
        mcp_server_url = getattr(config, 'mcp_server_url', 'http://localhost:8094')
        use_mcp = getattr(config, 'use_mcp', True)
        
        import json
        from langchain_core.messages import HumanMessage, SystemMessage
        
        # Get LLM instance
        logger.info("Initializing LLM for qualification decision...")
        llm = get_model(config, {"temperature": 0.5, "max_tokens": 800})
        
        # Optionally get network data from MCP server
        network_data = None
        if use_mcp:
            try:
                logger.info(f"Querying MCP server at {mcp_server_url} for network data...")
                import asyncio
                from src.mcp_http_client import MCPHttpClient
                
                mcp_client = MCPHttpClient(base_url=mcp_server_url)
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    result = loop.run_until_complete(_call_qualification_tool(mcp_client, tmf645_request))
                    network_data = result.get('content', '')
                    logger.info(f"Received network data from MCP: {network_data[:200]}...")
                finally:
                    loop.close()
            except Exception as mcp_error:
                logger.warning(f"Failed to get MCP data: {mcp_error}. Proceeding with LLM-only qualification.")
        
        # Create qualification prompt
        system_prompt = """You are a 5G Network Service Qualification Expert.
Your task is to analyze service requests and determine if they can be qualified based on requirements and available network capacity.

Consider:
1. Bandwidth requirements (e.g., 100 Mbps, 1 Gbps)
2. Latency requirements (e.g., <10ms for URLLC, <50ms for eMBB)
3. Service type (URLLC, eMBB, mMTC)
4. Network availability and capacity
5. QoS parameters

Respond in JSON format:
{
  "is_qualified": true/false,
  "qualification_status": "done" or "terminatedWithError",
  "confidence": 0.0-1.0,
  "message": "detailed explanation",
  "reasoning": "why qualified or not",
  "recommendations": "suggestions if not qualified"
}"""
        
        request_json = json.dumps(tmf645_request, indent=2)
        
        user_prompt = f"""Analyze this 5G service qualification request:

{request_json}
"""
        
        if network_data:
            user_prompt += f"\n\nNetwork Data from MCP Server:\n{network_data}\n"
            user_prompt += "\nBased on the service requirements and network data, should this service be qualified?"
        else:
            user_prompt += "\n\nNo real-time network data available. Qualify based on the service requirements and typical network capabilities."
        
        user_prompt += "\n\nProvide your qualification decision in JSON format."
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        
        # Invoke LLM
        logger.info("Calling LLM to make qualification decision...")
        response = llm.invoke(messages)
        
        # Extract response content
        if hasattr(response, "content"):
            response_text = response.content
        else:
            response_text = str(response)
        
        logger.info(f"LLM qualification response: {response_text[:300]}...")
        
        # Parse LLM response
        try:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{[^{}]*"is_qualified"[^{}]*\}', response_text, re.DOTALL)
            if not json_match:
                # Try to find nested JSON
                json_match = re.search(r'\{(?:[^{}]|\{[^{}]*\})*\}', response_text, re.DOTALL)
            
            if json_match:
                qualification_data = json.loads(json_match.group())
            else:
                # Fallback: parse response text
                is_qualified = ("qualified" in response_text.lower() or "yes" in response_text.lower()) and \
                              ("not qualified" not in response_text.lower() and "cannot" not in response_text.lower())
                qualification_data = {
                    "is_qualified": is_qualified,
                    "qualification_status": "done" if is_qualified else "terminatedWithError",
                    "message": response_text,
                    "reasoning": "LLM analysis based on service requirements",
                    "confidence": 0.7
                }
        except Exception as parse_error:
            logger.warning(f"Failed to parse LLM response as JSON: {parse_error}")
            is_qualified = ("qualified" in response_text.lower() or "approve" in response_text.lower()) and \
                          ("not qualified" not in response_text.lower() and "reject" not in response_text.lower())
            qualification_data = {
                "is_qualified": is_qualified,
                "qualification_status": "done" if is_qualified else "terminatedWithError",
                "message": response_text,
                "reasoning": "LLM-based qualification decision",
                "confidence": 0.6
            }
        
        is_qualified = qualification_data.get('is_qualified', False)
        logger.info(f"LLM Qualification decision: {'QUALIFIED' if is_qualified else 'NOT QUALIFIED'}")
        
        # Add metadata
        qualification_data['llm_response'] = response_text
        qualification_data['used_mcp_data'] = network_data is not None
        if network_data:
            qualification_data['network_data_summary'] = network_data[:200]
        
        return {
            "service_qualified": is_qualified,
            "qualification_result": qualification_data
        }
        
    except Exception as e:
        logger.error(f"Error in Service Qualifier node: {e}", exc_info=True)
        return {
            "service_qualified": False,
            "qualification_result": {
                "qualification_status": "error",
                "message": f"Qualifier error: {str(e)}",
                "is_qualified": False
            },
            "error": f"Service Qualifier failed: {str(e)}"
        }


def _analyze_intent(user_input: str, tmf645_request: dict) -> str:
    """
    Analyze user intent to determine which MCP tool to call.
    
    Args:
        user_input: User's original input
        tmf645_request: Validated TMF 645 request
        
    Returns:
        'provision' or 'qualify'
    """
    # Check for provisioning keywords
    provision_keywords = [
        'provision', 'create', 'deploy', 'allocate', 'setup',
        'establish', 'activate', 'implement', 'install'
    ]
    
    # Check for qualification keywords  
    qualify_keywords = [
        'check', 'qualify', 'validate', 'assess', 'evaluate',
        'verify', 'can i', 'is it possible', 'feasible'
    ]
    
    user_lower = user_input.lower()
    
    # Check TMF 645 request action if present
    items = tmf645_request.get('serviceQualificationItem', [])
    if items:
        action = items[0].get('action', '').lower()
        if action in ['add', 'modify']:
            # Check if this is an add/modify with intent to provision
            if any(keyword in user_lower for keyword in provision_keywords):
                return 'provision'
    
    # Analyze user input
    if any(keyword in user_lower for keyword in provision_keywords):
        return 'provision'
    
    # Default to qualification
    return 'qualify'


async def _call_qualification_tool(mcp_client, tmf645_request: dict) -> dict:
    """Call check_service_qualification MCP tool"""
    from datetime import datetime, timedelta
    
    # Extract party info
    related_parties = tmf645_request.get('relatedParty', [])
    if related_parties:
        related_party = related_parties[0]
    else:
        related_party = {'id': 'ElBorn', 'name': 'Default Client', 'role': 'customer'}
    
    # Extract service qualification items (contains bandwidth/latency requirements)
    service_qual_items = tmf645_request.get('serviceQualificationItem', [])
    
    # Generate time-series network metrics (11 points)
    base_time = datetime.now()
    metrics_timeseries = []
    for i in range(11):
        ts = base_time - timedelta(minutes=10-i)
        metrics_timeseries.append({
            "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
            "down": 120.0 + (i * 0.5),
            "up": 60.0 + (i * 0.3),
            "rnti_count": 150.0 + i,
            "mcs_down": 15.0 + (i * 0.1),
            "mcs_down_var": 2.3,
            "mcs_up": 12.8 + (i * 0.05),
            "mcs_up_var": 1.9,
            "rb_down": 85.0 + (i * 0.2),
            "rb_down_var": 10.5,
            "rb_up": 45.0 + (i * 0.1),
            "rb_up_var": 5.2
        })
    
    return await mcp_client.check_service_qualification(
        related_party=related_party,
        network_metrics=metrics_timeseries,
        risk_threshold=0.5,
        service_qualification_items=service_qual_items  # Forward service requirements to MCP
    )


async def _call_provision_tool(mcp_client, tmf645_request: dict) -> dict:
    """Call provision_slice MCP tool"""
    
    # Extract party info
    related_parties = tmf645_request.get('relatedParty', [])
    if related_parties:
        related_party = related_parties[0]
    else:
        related_party = {'id': 'ElBorn', 'name': 'Default Client', 'role': 'customer'}
    
    # Extract service specification and characteristics
    items = tmf645_request.get('serviceQualificationItem', [])
    if items:
        service = items[0].get('service', {})
        service_spec = service.get('serviceSpecification', {})
        service_chars = service.get('serviceCharacteristic', [])
    else:
        service_spec = {'id': 'default', 'name': '5G Network Slice'}
        service_chars = []
    
    return await mcp_client.provision_slice(
        related_party=related_party,
        service_specification=service_spec,
        service_characteristics=service_chars
    )
