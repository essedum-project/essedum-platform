# file: src/config.py
"""
Application Configuration

Manages environment variables and configuration settings using Pydantic v2 BaseSettings.
Supports both Azure OpenAI and OpenAI with automatic fallback logic.
"""

from typing import Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppConfig(BaseSettings):
    """
    Application configuration loaded from environment variables and .env file.
    
    Supports dual Azure OpenAI / OpenAI configuration with validation.
    """
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # Azure OpenAI configuration
    azure_openai_api_key: Optional[str] = Field(None, alias="AZURE_OPENAI_API_KEY")
    azure_openai_endpoint: Optional[str] = Field(None, alias="AZURE_OPENAI_ENDPOINT")
    azure_openai_deployment: Optional[str] = Field(None, alias="AZURE_OPENAI_DEPLOYMENT")
    azure_api_version: str = Field("2024-06-01", alias="AZURE_API_VERSION")
    
    # OpenAI configuration (fallback)
    openai_api_key: Optional[str] = Field(None, alias="OPENAI_API_KEY")
    
    # LiteLLM configuration
    vllm_url: str = Field("http://litellm:4000/chat/completions", alias="VLLM_URL")
    vllm_model_name: str = Field("Llama-3.2-3B-Instruct", alias="VLLM_MODEL_NAME")
    vllm_api_key: Optional[str] = Field("sk-1234", alias="VLLM_API_KEY")
    use_vllm: bool = Field(True, alias="USE_VLLM")  # Set to True to use vLLM instead of OpenAI
    
    # Langfuse configuration for LLM observability
    langfuse_secret_key: Optional[str] = Field(None, alias="LANGFUSE_SECRET_KEY")
    langfuse_public_key: Optional[str] = Field(None, alias="LANGFUSE_PUBLIC_KEY")
    langfuse_host: str = Field("http://langfuse:3000", alias="LANGFUSE_HOST")
    
    # Federated API configuration
    federated_api_url: str = Field("http://192.168.14.119:8092", alias="FEDERATED_API_URL")
    
    # MCP Server configuration (HTTP/SSE)
    mcp_server_url: str = Field("http://service-qual-5g-mcp:80", alias="MCP_SERVER_URL")
    use_mcp: bool = Field(True, alias="USE_MCP")  # Set to True to use MCP server for service qualification
    
    # Common model settings
    model_name: str = Field("gpt-4", alias="MODEL_NAME")
    temperature: float = Field(0.7, alias="TEMPERATURE")
    max_tokens: Optional[int] = Field(500, alias="MAX_TOKENS")
    timeout_seconds: int = Field(120, alias="TIMEOUT_SECONDS")
    
    # System configuration
    system_prompt: Optional[str] = Field(None, alias="SYSTEM_PROMPT")
    log_level: str = Field("INFO", alias="LOG_LEVEL")
    
    def model_post_init(self, __context) -> None:
        """Normalize configuration after initialization."""
        # Strip whitespace from string fields
        if self.azure_openai_endpoint:
            self.azure_openai_endpoint = self.azure_openai_endpoint.strip()
        if self.azure_openai_deployment:
            self.azure_openai_deployment = self.azure_openai_deployment.strip()
        
        # Ensure temperature is in valid range
        if self.temperature < 0:
            self.temperature = 0.0
        elif self.temperature > 2:
            self.temperature = 2.0
    
    def is_azure(self) -> bool:
        """Check if Azure OpenAI credentials are configured."""
        return bool(
            self.azure_openai_api_key 
            and self.azure_openai_endpoint 
            and self.azure_openai_deployment
        )
    
    def is_openai(self) -> bool:
        """Check if OpenAI credentials are configured."""
        return bool(self.openai_api_key)
    
    def is_vllm(self) -> bool:
        """Check if vLLM is configured and enabled."""
        # API key is optional for vLLM/LiteLLM (some deployments don't require auth)
        return self.use_vllm and bool(self.vllm_url and self.vllm_model_name)
    
    def is_langfuse_enabled(self) -> bool:
        """Check if Langfuse is configured and enabled."""
        return bool(self.langfuse_secret_key and self.langfuse_public_key and self.langfuse_host)
    
    def validate(self) -> None:
        """
        Validate that at least one LLM provider is configured.
        
        Raises:
            ValueError: If no LLM provider is configured
        """
        if not self.is_vllm() and not self.is_azure() and not self.is_openai():
            raise ValueError(
                "Missing LLM configuration. Provide either vLLM (USE_VLLM=true, VLLM_URL, VLLM_MODEL_NAME), "
                "Azure OpenAI (AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT), "
                "or OpenAI (OPENAI_API_KEY) configuration."
            )
