"""Configuration settings for Essedum integration."""

import os
from typing import Optional
from dotenv import load_dotenv

# Load .env file
# By default, load_dotenv() looks for .env file in current directory or parent directories
load_dotenv()


class EssedumSettings:
    """Settings for Essedum API integration."""
    
    def __init__(self):
        # Essedum API base URL - Read from environment variable (required)
        base_url = os.getenv("ESSEDUM_BACKEND_URL")
        if not base_url:
            raise ValueError(
                "ESSEDUM_BACKEND_URL environment variable must be set. "
                "Please check your .env file or set it as an environment variable."
            )
        self.base_url: str = base_url.rstrip('/')
        
        # Langflow frontend URL - Read from environment variable (required)
        frontend_url = os.getenv("LANGFLOW_FRONTEND_URL")
        if not frontend_url:
            raise ValueError(
                "LANGFLOW_FRONTEND_URL environment variable must be set. "
                "Please check your .env file or set it as an environment variable."
            )
        self.frontend_url: str = frontend_url.rstrip('/')
        
        # Essedum API endpoints - Updated based on actual API structure
        self.create_pipeline_endpoint: str = "/api/aip/service/v1/streamingServices/add"  # Based on curl example
        self.update_pipeline_endpoint: str = "/api/aip/service/v1/streamingServices/update"
        self.health_endpoint: str = "/health"
        
        # Authentication settings
        self.auth_required: bool = os.getenv("ESSEDUM_AUTH_REQUIRED", "true").lower() == "true"
        self.jwt_token: Optional[str] = os.getenv("ESSEDUM_JWT_TOKEN")
        self.parent_token: Optional[str] = os.getenv("ESSEDUM_PARENT_TOKEN")
        
        # Default headers
        self.default_headers: dict = {
            "Content-Type": "application/json",
            "X-Requested-With": "Leap",
            "Accept": "application/json, text/plain, */*",
        }
        
        # Request timeout settings
        self.timeout: int = int(os.getenv("ESSEDUM_TIMEOUT", "30"))
        
        # Session information (can be overridden per request)
        self.organization: Optional[str] = os.getenv("ESSEDUM_ORGANIZATION")
        self.project_id: Optional[str] = os.getenv("ESSEDUM_PROJECT_ID")
        self.project_name: Optional[str] = os.getenv("ESSEDUM_PROJECT_NAME")
        self.role_id: Optional[str] = os.getenv("ESSEDUM_ROLE_ID")
        self.role_name: Optional[str] = os.getenv("ESSEDUM_ROLE_NAME")


# Global settings instance - lazy loaded
_essedum_settings = None


def get_essedum_settings() -> EssedumSettings:
    """Get Essedum settings instance (lazy loaded)."""
    global _essedum_settings
    if _essedum_settings is None:
        _essedum_settings = EssedumSettings()
    return _essedum_settings