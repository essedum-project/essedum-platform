"""Configuration settings for Essedum integration."""

import os
from typing import Optional


class EssedumSettings:
    """Settings for Essedum API integration."""
    
    def __init__(self):
        # Essedum API base URL - Update this to your actual Essedum backend URL  
        self.base_url: str = "https://essedum.az.ad.idemo-ppc.com"  # Java backend is running on port 8087
        
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


# Global settings instance
essedum_settings = EssedumSettings()


def get_essedum_settings() -> EssedumSettings:
    """Get Essedum settings instance."""
    return essedum_settings