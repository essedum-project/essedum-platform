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
    
    # Common model settings
    model_name: str = Field("gpt-4", alias="MODEL_NAME")
    temperature: float = Field(0.7, alias="TEMPERATURE")
    max_tokens: Optional[int] = Field(None, alias="MAX_TOKENS")
    timeout_seconds: int = Field(60, alias="TIMEOUT_SECONDS")
    
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
    
    def validate(self) -> None:
        """
        Validate that at least one LLM provider is configured.
        
        Raises:
            ValueError: If neither Azure nor OpenAI credentials are present
        """
        if not self.is_azure() and not self.is_openai():
            raise ValueError(
                "Missing LLM credentials. Provide either Azure OpenAI "
                "(AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT) "
                "or OpenAI (OPENAI_API_KEY) configuration."
            )
