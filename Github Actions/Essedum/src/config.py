# file: src/config.py
"""
Application Configuration

Manages environment variables and configuration settings using Pydantic v2 BaseSettings.
Supports AWS Bedrock with Claude models.
"""

from typing import Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppConfig(BaseSettings):
    """
    Application configuration loaded from environment variables and .env file.
    
    Supports AWS Bedrock for LLM inference with Claude models.
    """
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # AWS Bedrock configuration
    aws_access_key_id: Optional[str] = Field(None, alias="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: Optional[str] = Field(None, alias="AWS_SECRET_ACCESS_KEY")
    aws_region: str = Field("us-east-1", alias="AWS_REGION")
    aws_session_token: Optional[str] = Field(None, alias="AWS_SESSION_TOKEN")
    
    # Common model settings
    model_name: str = Field("anthropic.claude-3-5-sonnet-20241022-v2:0", alias="MODEL_NAME")
    temperature: float = Field(0.7, alias="TEMPERATURE")
    max_tokens: Optional[int] = Field(4096, alias="MAX_TOKENS")
    timeout_seconds: int = Field(60, alias="TIMEOUT_SECONDS")
    
    # System configuration
    system_prompt: Optional[str] = Field(None, alias="SYSTEM_PROMPT")
    log_level: str = Field("INFO", alias="LOG_LEVEL")
    
    def model_post_init(self, __context) -> None:
        """Normalize configuration after initialization."""
        # Strip whitespace from string fields
        if self.aws_region:
            self.aws_region = self.aws_region.strip()
        
        # Ensure temperature is in valid range (Bedrock uses 0-1)
        if self.temperature < 0:
            self.temperature = 0.0
        elif self.temperature > 1:
            self.temperature = 1.0
    
    def is_aws_bedrock(self) -> bool:
        """Check if AWS Bedrock credentials are configured."""
        return bool(
            self.aws_access_key_id 
            and self.aws_secret_access_key 
            and self.aws_region
        )
    
    def validate(self) -> None:
        """
        Validate that AWS Bedrock credentials are configured.
        
        Raises:
            ValueError: If AWS Bedrock credentials are not present
        """
        if not self.is_aws_bedrock():
            raise ValueError(
                "Missing AWS Bedrock credentials. Provide AWS_ACCESS_KEY_ID, "
                "AWS_SECRET_ACCESS_KEY, and AWS_REGION configuration."
            )
