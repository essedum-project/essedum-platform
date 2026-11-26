"""Service-to-service authentication: ICIP sends a shared token in X-Service-Token."""
import hmac

from fastapi import Header, HTTPException

from app.config import service_token


def require_service_token(x_service_token: str = Header(default="", alias="X-Service-Token")) -> None:
    expected = service_token()
    # Fail closed: if no token is configured, nothing is allowed through.
    if not expected:
        raise HTTPException(status_code=503, detail="Service token is not configured")
    if not hmac.compare_digest(x_service_token.encode(), expected.encode()):
        raise HTTPException(status_code=401, detail="Invalid or missing service token")
