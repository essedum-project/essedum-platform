# file: src/main.py
"""
Main Entry Point - CLI for Langflow to Python ADK Workflow

Loads design JSON, builds workflow, and executes interactive session.
"""

import sys
import os

# Add project root to sys.path to fix imports when running from src/
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import argparse
import json
import logging
from pathlib import Path

from src.config import AppConfig
from src.workflow_state import WorkflowState
from src.graph_builder import create_workflow


def setup_logging(debug: bool = False) -> None:
    """
    Configure logging with ASCII-only output.
    
    Args:
        debug: Enable debug level logging
    """
    level = logging.DEBUG if debug else logging.INFO
    
    logging.basicConfig(
        level=level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


def check_dependencies() -> None:
    """
    Verify all required dependencies are installed.
    
    Exits with code 1 if imports fail.
    """
    try:
        import langchain_core
        import langchain_openai
        import langgraph
        import pydantic
        import pydantic_settings
    except ImportError as e:
        print(f"Dependency check failed: {e}")
        print("Install requirements: pip install -r requirements.txt")
        sys.exit(1)


def load_config() -> AppConfig:
    """
    Load and validate application configuration.
    
    Returns:
        Validated AppConfig instance
    """
    try:
        config = AppConfig()
        config.validate()
        return config
    except Exception as e:
        print(f"Configuration error: {e}")
        print("Ensure .env file exists with required credentials")
        sys.exit(1)


def load_design_json(json_path: Path) -> dict:
    """
    Load Langflow design JSON from file.
    
    Args:
        json_path: Path to design.json file
        
    Returns:
        Parsed JSON dict
    """
    try:
        if not json_path.exists():
            raise FileNotFoundError(f"Design file not found: {json_path}")
        
        with open(json_path, "r", encoding="utf-8") as f:
            design_json = json.load(f)
        
        return design_json
    except Exception as e:
        print(f"Failed to load design JSON: {e}")
        sys.exit(1)


def main():
    """Main entry point with interactive workflow execution."""
    
    parser = argparse.ArgumentParser(
        description="Langflow to Python ADK Workflow Executor"
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug logging"
    )
    parser.add_argument(
        "--session-id",
        type=str,
        default=None,
        help="Session ID for conversation tracking"
    )
    parser.add_argument(
        "--design-file",
        type=str,
        default=None,
        help="Path to Langflow design JSON file (optional - runs simple mode without)"
    )
    
    args = parser.parse_args()
    
    # Setup logging
    setup_logging(args.debug)
    logger = logging.getLogger(__name__)
    
    logger.info("Starting Langflow to Python ADK Workflow")
    
    # Check dependencies
    logger.info("Checking dependencies...")
    check_dependencies()
    logger.info("Dependencies OK")
    
    # Load configuration
    logger.info("Loading configuration...")
    config = load_config()
    logger.info(f"Configuration loaded (vLLM: {config.is_vllm()}, Azure: {config.is_azure()}, OpenAI: {config.is_openai()})")
    
    # Load design JSON if provided
    workflow = None
    if args.design_file:
        design_path = Path(args.design_file)
        if not design_path.is_absolute():
            design_path = Path.cwd() / design_path
        
        logger.info(f"Loading design JSON from: {design_path}")
        design_json = load_design_json(design_path)
        logger.info("Design JSON loaded successfully")
        
        # Build workflow
        logger.info("Building workflow graph...")
        try:
            workflow = create_workflow(design_json, config)
            logger.info("Workflow built successfully")
        except Exception as e:
            logger.error(f"Failed to build workflow: {e}")
            sys.exit(1)
    else:
        logger.info("Running in simple mode without workflow graph")
    
    # Initialize state
    state = WorkflowState(
        session_id=args.session_id or "default-session"
    )
    
    print("\n" + "=" * 60)
    print("Telecom Multi-Agent Workflow - Interactive Mode")
    print("=" * 60)
    print("Agent 1: Validation Agent (validates telecom-related questions)")
    print("Agent 2: Answering Agent (provides telecom responses)")
    print("=" * 60)
    print("Type 'quit' or 'exit' to stop\n")
    
    # Interactive loop
    while True:
        try:
            # Get user input
            user_input = input("Enter your question: ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ["quit", "exit", "q"]:
                print("Exiting...")
                break
            
            # Add user message to state
            state.messages.append({
                "role": "user",
                "content": user_input
            })
            
            # Update state with latest input
            state = state.update({"user_input": user_input})
            
            # Execute workflow or simple vLLM call
            logger.info("Executing workflow...")
            try:
                if workflow:
                    # Use workflow graph
                    result = workflow.invoke(state)
                    
                    # Extract final output
                    if isinstance(result, dict):
                        final_output = result.get("final_output") or result.get("agent_response") or result.get("model_response")
                        error = result.get("error")
                        
                        if error:
                            print(f"\nError: {error}\n")
                        elif final_output:
                            print(f"\nAssistant: {final_output}\n")
                            
                            # Update state with result
                            state = state.update(result)
                            
                            # Add assistant message to history
                            state.messages.append({
                                "role": "assistant",
                                "content": final_output
                            })
                        else:
                            print("\nNo response generated\n")
                    else:
                        print(f"\nResponse: {result}\n")
                else:
                    # Multi-agent mode: Validation Agent -> Answering Agent
                    from src.vllm_client import VLLMClient
                    
                    # Initialize validation agent with Langfuse
                    validation_agent = VLLMClient(
                        url=config.vllm_url,
                        model_name=config.vllm_model_name,
                        api_key=config.vllm_api_key or "",
                        temperature=0.3,  # Lower temperature for consistent validation
                        max_tokens=200,
                        langfuse_secret_key=config.langfuse_secret_key,
                        langfuse_public_key=config.langfuse_public_key,
                        langfuse_host=config.langfuse_host
                    )
                    
                    # Initialize answering agent with Langfuse
                    answering_agent = VLLMClient(
                        url=config.vllm_url,
                        model_name=config.vllm_model_name,
                        api_key=config.vllm_api_key or "",
                        temperature=config.temperature,
                        max_tokens=config.max_tokens,
                        langfuse_secret_key=config.langfuse_secret_key,
                        langfuse_public_key=config.langfuse_public_key,
                        langfuse_host=config.langfuse_host
                    )
                    
                    # Step 1: Validation Agent
                    print("\n[Validation Agent] Checking if question is telecom-related...")
                    validation_prompt = f"""You are a telecom validation agent. Analyze the following user question and determine if it is:
1. Related to telecommunications, networking, internet services, mobile services, fiber optics, 5G, telecom infrastructure, or telecom industry
2. Clear and understandable
3. Appropriate (no harmful, offensive, or inappropriate content)

User Question: "{user_input}"

Telecom topics include: internet services, mobile networks, fiber optics, broadband, 5G/4G/LTE, telecom providers, network infrastructure, telecommunications equipment, VoIP, satellite communications, cable services, telecom billing, customer service, network troubleshooting, etc.

Respond with ONLY:
- "VALID: <brief reason>" if the question is telecom-related and acceptable
- "INVALID: <brief reason>" if the question is NOT telecom-related or should be rejected

Your response:"""
                    
                    validation_result = validation_agent.query_vllm(validation_prompt)
                    print(f"[Validation Agent] {validation_result.strip()}\n")
                    
                    # Check validation result
                    if validation_result and "INVALID" in validation_result.upper():
                        print(f"\nAssistant: I apologize, but I can only answer telecommunications-related questions. {validation_result.split('INVALID:')[-1].strip()}\n")
                        print("Please ask questions about: internet services, mobile networks, fiber optics, broadband, 5G/4G, telecom providers, network infrastructure, etc.\n")
                        
                        state.messages.append({
                            "role": "assistant",
                            "content": f"Question validation failed: {validation_result}"
                        })
                    else:
                        # Step 2: Answering Agent
                        print("[Answering Agent] Processing your question...")
                        response = answering_agent.query_vllm(user_input)
                        print(f"\nAssistant: {response}\n")
                        
                        # Add assistant message to history
                        state.messages.append({
                            "role": "assistant",
                            "content": response
                        })
                    
            except Exception as e:
                logger.error(f"Workflow execution failed: {e}")
                print(f"\nExecution error: {e}\n")
        
        except KeyboardInterrupt:
            print("\n\nInterrupted. Exiting...")
            break
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            print(f"\nError: {e}\n")
    
    logger.info("Workflow session ended")


if __name__ == "__main__":
    main()
