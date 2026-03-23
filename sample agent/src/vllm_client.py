# file: src/vllm_client.py
"""
vLLM Client for LLM Inference (using LiteLLM)

Provides a client for querying LiteLLM endpoints with OpenAI-compatible chat completions API.
"""

import requests
import json
import time
import logging
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

# Initialize Langfuse for observability (optional)
try:
    from langfuse import Langfuse
    LANGFUSE_AVAILABLE = True
except ImportError:
    LANGFUSE_AVAILABLE = False
    logger.warning("Langfuse not installed. Install with: pip install langfuse")


class VLLMClient:
    """
    Client for interacting with LiteLLM inference server.
    
    Provides methods compatible with LangChain's message format.
    Uses OpenAI-compatible chat completions API.
    """
    
    def __init__(
        self,
        url: str = "http://litellm:4000/chat/completions",
        model_name: str = "Llama-3.2-3B-Instruct",
        api_key: str = "",
        temperature: float = 0.7,
        max_tokens: int = 500,
        timeout: int = 120,
        langfuse_secret_key: Optional[str] = None,
        langfuse_public_key: Optional[str] = None,
        langfuse_host: str = "http://langfuse:3000"
    ):
        """
        Initialize vLLM client (now using LiteLLM endpoint).
        
        Args:
            url: LiteLLM endpoint URL
            model_name: Model name
            api_key: API key for authentication
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum tokens to generate
            timeout: Request timeout in seconds
            langfuse_secret_key: Langfuse secret key for observability
            langfuse_public_key: Langfuse public key for observability
            langfuse_host: Langfuse host URL
        """
        self.url = url
        self.model_name = model_name
        self.api_key = api_key
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.timeout = timeout
        
        # Initialize Langfuse if credentials provided
        self.langfuse = None
        if LANGFUSE_AVAILABLE and langfuse_secret_key and langfuse_public_key:
            try:
                self.langfuse = Langfuse(
                    secret_key=langfuse_secret_key,
                    public_key=langfuse_public_key,
                    host=langfuse_host
                )
                logger.info(f"Langfuse observability enabled: {langfuse_host}")
            except Exception as e:
                logger.warning(f"Failed to initialize Langfuse: {e}")
                self.langfuse = None
        
        # Log initialization with detailed info
        masked_key = f"{api_key[:8]}...{api_key[-4:]}" if len(api_key) > 12 else "<empty>" if not api_key else "<short>"
        logger.info(f"Initialized LiteLLM client:")
        logger.info(f"  URL: {url}")
        logger.info(f"  Model: {model_name}")
        logger.info(f"  API Key: {masked_key}")
        logger.info(f"  Temperature: {temperature}")
        logger.info(f"  Max Tokens: {max_tokens}")
        logger.info(f"  Timeout: {timeout}s")
        logger.info(f"  Langfuse: {'enabled' if self.langfuse else 'disabled'}")
    
    def query_vllm(self, prompt: str, temperature: Optional[float] = None, max_tokens: Optional[int] = None) -> Optional[str]:
        """
        Query the LiteLLM endpoint (OpenAI compatible chat completions API).
        
        Args:
            prompt: The prompt to send
            temperature: Optional temperature override
            max_tokens: Optional max tokens override
        
        Returns:
            Generated text or None if error
        """
        logger.info(f"⚡ Querying LiteLLM with prompt (length: {len(prompt)})")
        
        # Convert prompt to chat format
        messages = [{"role": "user", "content": prompt}]
        
        payload = {
            "model": self.model_name,
            "messages": messages,
            "max_tokens": max_tokens or self.max_tokens,
            "temperature": temperature or self.temperature,
            "top_p": 0.9,
            "n": 1,
            "stream": False
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        # Log request details
        logger.info(f"=" * 80)
        logger.info(f"LiteLLM Request:")
        logger.info(f"  URL: {self.url}")
        logger.info(f"  Model: {self.model_name}")
        logger.info(f"  Prompt length: {len(prompt)} chars")
        logger.info(f"  Payload: {json.dumps(payload, indent=2)}")
        logger.debug(f"  Headers: {json.dumps({k: v if k != 'Authorization' else 'Bearer ***' for k, v in headers.items()}, indent=2)}")
        
        # Create Langfuse trace and generation if enabled (v2.x API)
        trace = None
        generation = None
        if self.langfuse:
            try:
                # Create trace for the query
                trace = self.langfuse.trace(
                    name="litellm_query",
                    metadata={
                        "model": self.model_name,
                        "temperature": temperature or self.temperature,
                        "max_tokens": max_tokens or self.max_tokens,
                        "endpoint": self.url
                    },
                    input={"prompt": prompt, "messages": messages}
                )
                # Create generation within the trace
                generation = trace.generation(
                    name="llm_call",
                    model=self.model_name,
                    input=messages,
                    model_parameters={
                        "temperature": temperature or self.temperature,
                        "max_tokens": max_tokens or self.max_tokens,
                        "top_p": 0.9
                    }
                )
                logger.info(f"✓ Langfuse trace created: {trace.id}")
            except Exception as e:
                logger.warning(f"Failed to create Langfuse trace: {e}")
        
        try:
            start_time = time.time()
            logger.info(f"Sending POST request to LiteLLM...")
            
            response = requests.post(self.url, json=payload, headers=headers, timeout=self.timeout)
            end_time = time.time()
            elapsed = end_time - start_time
            
            logger.info(f"Response received in {elapsed:.2f}s")
            logger.info(f"  Status Code: {response.status_code}")
            logger.info(f"  Response Headers: {dict(response.headers)}")
            
            # Log raw response for debugging
            logger.debug(f"  Raw Response: {response.text[:500]}..." if len(response.text) > 500 else f"  Raw Response: {response.text}")
            
            response.raise_for_status()
            
            result = response.json()
            logger.debug(f"  Parsed JSON: {json.dumps(result, indent=2)[:1000]}")
            
            generated_text = result['choices'][0]['message']['content']
            logger.info(f"  Generated text length: {len(generated_text)} chars")
            logger.info(f"  Generated text preview: {generated_text[:200]}..." if len(generated_text) > 200 else f"  Generated text: {generated_text}")
            logger.info(f"=" * 80)
            
            # Log to Langfuse if enabled (v2.x API)
            if generation:
                try:
                    # Extract usage information if available
                    usage_data = result.get('usage', {})
                    
                    # Update generation with output (v2.x uses assignment, not update)
                    if usage_data:
                        generation.output = generated_text
                        generation.usage = {
                            "input": usage_data.get('prompt_tokens', 0),
                            "output": usage_data.get('completion_tokens', 0),
                            "total": usage_data.get('total_tokens', 0)
                        }
                        generation.metadata = {
                            "latency_seconds": elapsed,
                            "status_code": response.status_code
                        }
                    else:
                        generation.output = generated_text
                        generation.metadata = {
                            "latency_seconds": elapsed,
                            "status_code": response.status_code
                        }
                    logger.info(f"✓ Langfuse generation logged")
                except Exception as e:
                    logger.warning(f"Failed to log generation to Langfuse: {e}")
            
            # Flush to ensure data is sent to Langfuse
            if self.langfuse:
                try:
                    self.langfuse.flush()
                    logger.info(f"✓ Langfuse data flushed")
                except Exception as e:
                    logger.warning(f"Failed to flush Langfuse: {e}")
            
            return generated_text
        
        except requests.exceptions.Timeout:
            logger.error(f"=" * 80)
            logger.error(f"REQUEST TIMEOUT")
            logger.error(f"  URL: {self.url}")
            logger.error(f"  Timeout: {self.timeout} seconds")
            logger.error(f"=" * 80)
            if generation:
                try:
                    generation.metadata = {"error": "Request timeout"}
                    generation.level = "ERROR"
                except:
                    pass
            if self.langfuse:
                try:
                    self.langfuse.flush()
                except:
                    pass
            return None
        
        except requests.exceptions.ConnectionError as e:
            logger.error(f"=" * 80)
            logger.error(f"CONNECTION ERROR")
            logger.error(f"  URL: {self.url}")
            logger.error(f"  Error: {str(e)}")
            logger.error(f"  Check if LiteLLM server is running and accessible")
            logger.error(f"=" * 80, exc_info=True)
            if generation:
                try:
                    generation.metadata = {"error": f"Connection error: {str(e)}"}
                    generation.level = "ERROR"
                except:
                    pass
            if self.langfuse:
                try:
                    self.langfuse.flush()
                except:
                    pass
            return None
        
        except requests.exceptions.HTTPError as e:
            logger.error(f"=" * 80)
            logger.error(f"HTTP ERROR")
            logger.error(f"  Status Code: {response.status_code}")
            logger.error(f"  Response: {response.text}")
            logger.error(f"  Error: {str(e)}")
            logger.error(f"=" * 80, exc_info=True)
            if generation:
                try:
                    generation.level = "ERROR"
                    generation.metadata = {
                        "error": f"HTTP {response.status_code}: {str(e)}",
                        "response": response.text
                    }
                except:
                    pass
            if self.langfuse:
                try:
                    self.langfuse.flush()
                except:
                    pass
            return None
        
        except KeyError as e:
            logger.error(f"=" * 80)
            logger.error(f"RESPONSE PARSING ERROR")
            logger.error(f"  Missing key: {e}")
            logger.error(f"  Response: {response.text if 'response' in locals() else 'No response'}")
            logger.error(f"=" * 80, exc_info=True)
            if generation:
                try:
                    generation.level = "ERROR"
                    generation.metadata = {"error": f"Parsing error: {str(e)}"}
                except:
                    pass
            if self.langfuse:
                try:
                    self.langfuse.flush()
                except:
                    pass
            return None
        
        except Exception as e:
            logger.error(f"=" * 80)
            logger.error(f"UNEXPECTED ERROR")
            logger.error(f"  Error type: {type(e).__name__}")
            logger.error(f"  Error: {str(e)}")
            logger.error(f"=" * 80, exc_info=True)
            if generation:
                try:
                    generation.level = "ERROR"
                    generation.metadata = {"error": f"Unexpected error: {str(e)}"}
                except:
                    pass
            if self.langfuse:
                try:
                    self.langfuse.flush()
                except:
                    pass
            return None
    
    def invoke(self, messages: List[Any]) -> 'VLLMResponse':
        """
        Invoke the model with LangChain-style messages.
        
        Args:
            messages: List of message objects (HumanMessage, SystemMessage, etc.)
        
        Returns:
            VLLMResponse object with content attribute
        """
        # Convert LangChain messages to chat format
        chat_messages = self._messages_to_chat_format(messages)
        
        # Build payload for chat completions API
        payload = {
            "model": self.model_name,
            "messages": chat_messages,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "top_p": 0.9,
            "stream": False
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        # Log request details
        logger.info(f"=" * 80)
        logger.info(f"LiteLLM Invoke Request:")
        logger.info(f"  URL: {self.url}")
        logger.info(f"  Model: {self.model_name}")
        logger.info(f"  Messages count: {len(chat_messages)}")
        logger.info(f"  Payload: {json.dumps(payload, indent=2)}")
        logger.debug(f"  Headers: {json.dumps({k: v if k != 'Authorization' else 'Bearer ***' for k, v in headers.items()}, indent=2)}")
        
        # Create Langfuse trace and generation if enabled (v2.x API)
        trace = None
        generation = None
        if self.langfuse:
            try:
                # Create trace for the invoke call
                trace = self.langfuse.trace(
                    name="litellm_invoke",
                    metadata={
                        "model": self.model_name,
                        "temperature": self.temperature,
                        "max_tokens": self.max_tokens,
                        "endpoint": self.url
                    },
                    input={"messages": chat_messages}
                )
                # Create generation within the trace
                generation = trace.generation(
                    name="llm_invoke_call",
                    model=self.model_name,
                    input=chat_messages,
                    model_parameters={
                        "temperature": self.temperature,
                        "max_tokens": self.max_tokens,
                        "top_p": 0.9
                    }
                )
                logger.info(f"✓ Langfuse trace created: {trace.id}")
            except Exception as e:
                logger.warning(f"Failed to create Langfuse trace: {e}")
        
        try:
            start_time = time.time()
            logger.info(f"Sending POST request to LiteLLM...")
            
            response = requests.post(self.url, json=payload, headers=headers, timeout=self.timeout)
            end_time = time.time()
            elapsed = end_time - start_time
            
            logger.info(f"Response received in {elapsed:.2f}s")
            logger.info(f"  Status Code: {response.status_code}")
            logger.info(f"  Response Headers: {dict(response.headers)}")
            
            # Log raw response for debugging
            logger.debug(f"  Raw Response: {response.text[:500]}..." if len(response.text) > 500 else f"  Raw Response: {response.text}")
            
            response.raise_for_status()
            
            result = response.json()
            logger.debug(f"  Parsed JSON: {json.dumps(result, indent=2)[:1000]}")
            
            response_text = result['choices'][0]['message']['content']
            logger.info(f"  Response text length: {len(response_text)} chars")
            logger.info(f"  Response text preview: {response_text[:200]}..." if len(response_text) > 200 else f"  Response text: {response_text}")
            logger.info(f"=" * 80)
            
            # Log to Langfuse if enabled (v2.x API)
            if generation:
                try:
                    # Extract usage information if available
                    usage_data = result.get('usage', {})
                    
                    # Update generation with output
                    if usage_data:
                        generation.output = response_text
                        generation.usage = {
                            "input": usage_data.get('prompt_tokens', 0),
                            "output": usage_data.get('completion_tokens', 0),
                            "total": usage_data.get('total_tokens', 0)
                        }
                        generation.metadata = {
                            "latency_seconds": elapsed,
                            "status_code": response.status_code
                        }
                    else:
                        generation.output = response_text
                        generation.metadata = {
                            "latency_seconds": elapsed,
                            "status_code": response.status_code
                        }
                    logger.info(f"✓ Langfuse generation logged")
                except Exception as e:
                    logger.warning(f"Failed to log generation to Langfuse: {e}")
            
            # Flush to ensure data is sent to Langfuse
            if self.langfuse:
                try:
                    self.langfuse.flush()
                    logger.info(f"✓ Langfuse data flushed")
                except Exception as e:
                    logger.warning(f"Failed to flush Langfuse: {e}")
            
            return VLLMResponse(content=response_text)
        
        except requests.exceptions.Timeout:
            logger.error(f"=" * 80)
            logger.error(f"INVOKE TIMEOUT")
            logger.error(f"  URL: {self.url}")
            logger.error(f"  Timeout: {self.timeout} seconds")
            logger.error(f"=" * 80)
            if generation:
                try:
                    generation.metadata = {"error": "Request timeout"}
                    generation.level = "ERROR"
                except:
                    pass
            if self.langfuse:
                try:
                    self.langfuse.flush()
                except:
                    pass
            return VLLMResponse(content="Error: Request timed out")
        
        except requests.exceptions.ConnectionError as e:
            logger.error(f"=" * 80)
            logger.error(f"INVOKE CONNECTION ERROR")
            logger.error(f"  URL: {self.url}")
            logger.error(f"  Error: {str(e)}")
            logger.error(f"  Check if LiteLLM server is running and accessible")
            logger.error(f"=" * 80, exc_info=True)
            if generation:
                try:
                    generation.metadata = {"error": f"Connection error: {str(e)}"}
                    generation.level = "ERROR"
                except:
                    pass
            if self.langfuse:
                try:
                    self.langfuse.flush()
                except:
                    pass
            return VLLMResponse(content="Error: Could not connect to LiteLLM server")
        
        except requests.exceptions.HTTPError as e:
            logger.error(f"=" * 80)
            logger.error(f"INVOKE HTTP ERROR")
            logger.error(f"  Status Code: {response.status_code}")
            logger.error(f"  Response: {response.text}")
            logger.error(f"  Error: {str(e)}")
            logger.error(f"=" * 80, exc_info=True)
            if generation:
                try:
                    generation.level = "ERROR"
                    generation.metadata = {
                        "error": f"HTTP {response.status_code}: {str(e)}",
                        "response": response.text
                    }
                except:
                    pass
            if self.langfuse:
                try:
                    self.langfuse.flush()
                except:
                    pass
            return VLLMResponse(content=f"Error: HTTP {response.status_code}")
        
        except KeyError as e:
            logger.error(f"=" * 80)
            logger.error(f"INVOKE RESPONSE PARSING ERROR")
            logger.error(f"  Missing key: {e}")
            logger.error(f"  Response: {response.text if 'response' in locals() else 'No response'}")
            logger.error(f"=" * 80, exc_info=True)
            if generation:
                try:
                    generation.level = "ERROR"
                    generation.metadata = {"error": f"Parsing error: {str(e)}"}
                except:
                    pass
            if self.langfuse:
                try:
                    self.langfuse.flush()
                except:
                    pass
            return VLLMResponse(content="Error: Invalid response format from LiteLLM")
        
        except Exception as e:
            logger.error(f"=" * 80)
            logger.error(f"INVOKE UNEXPECTED ERROR")
            logger.error(f"  Error type: {type(e).__name__}")
            logger.error(f"  Error: {str(e)}")
            logger.error(f"=" * 80, exc_info=True)
            if generation:
                try:
                    generation.level = "ERROR"
                    generation.metadata = {"error": f"Unexpected error: {str(e)}"}
                except:
                    pass
            if self.langfuse:
                try:
                    self.langfuse.flush()
                except:
                    pass
            return VLLMResponse(content="Error: Failed to get response from LiteLLM")
    
    def _messages_to_chat_format(self, messages: List[Any]) -> List[Dict[str, str]]:
        """
        Convert LangChain messages to OpenAI chat format.
        
        Args:
            messages: List of message objects
        
        Returns:
            List of message dicts with role and content
        """
        chat_messages = []
        
        for msg in messages:
            # Extract message type and content
            if hasattr(msg, '__class__'):
                msg_type = msg.__class__.__name__
                content = msg.content if hasattr(msg, 'content') else str(msg)
            elif isinstance(msg, dict):
                msg_type = msg.get('type', 'human')
                content = msg.get('content', '')
            else:
                msg_type = 'human'
                content = str(msg)
            
            # Map to OpenAI chat format
            if 'System' in msg_type or msg_type == 'system':
                chat_messages.append({"role": "system", "content": content})
            elif 'Human' in msg_type or msg_type == 'human' or msg_type == 'user':
                chat_messages.append({"role": "user", "content": content})
            elif 'AI' in msg_type or msg_type == 'ai' or msg_type == 'assistant':
                chat_messages.append({"role": "assistant", "content": content})
            else:
                # Default to user message
                chat_messages.append({"role": "user", "content": content})
        
        return chat_messages


class VLLMResponse:
    """
    Response object compatible with LangChain response format.
    """
    
    def __init__(self, content: str):
        self.content = content
    
    def __str__(self):
        return self.content
    
    def __repr__(self):
        return f"VLLMResponse(content={self.content[:100]}...)"
