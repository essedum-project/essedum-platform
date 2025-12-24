"""Essedum Export API endpoints."""

from __future__ import annotations

import json
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, File, Form, UploadFile, Request
from lfx.log.logger import logger
from pydantic import BaseModel, ValidationError
from typing import Optional, Any

from langflow.api.utils import CurrentActiveUser, DbSession
from langflow.services.auth.utils import get_current_active_user
from langflow.services.database.models.flow.model import Flow


# Pydantic models for request/response
class SessionInfo(BaseModel):
    """Session information from frontend."""
    organization: str | None = None
    portfolio_id: str | int | None = None
    portfolio_name: str | None = None
    project_id: str | int | None = None
    project_name: str | None = None
    role_id: str | int | None = None
    role_name: str | None = None
    user_id: str | int | None = None
    user_name: str | None = None
    parent_token: str | None = None

    class Config:
        # Allow extra fields that might come from frontend
        extra = "allow"


class EssedumExportRequest(BaseModel):
    """Request model for exporting flow to Essedum."""
    flow_id: str
    alias: str | None = None
    description: str | None = None
    type: str = "AIAgent"
    interface_type: str = "pipeline-agent"
    is_template: bool = False
    groups: list | None = None


class EssedumCreatePipelineRequest(BaseModel):
    """Request model for creating pipeline via Langflow->Essedum."""
    alias: str | None = None
    description: str | None = None
    type: str | None = None
    interface_type: str | None = None
    is_template: bool = False
    json_content: Any | None = None
    groups: list | None = None
    session_info: SessionInfo | dict | None = None

    class Config:
        # Allow extra fields and be flexible with types
        extra = "allow"


class EssedumUpdatePipelineRequest(BaseModel):
    """Request model for updating pipeline via Langflow->Essedum."""
    cid: int
    alias: str | None = None
    name: str | None = None
    description: str | None = None
    json_content: str | Any | None = None
    type: str | None = None
    organization: str | None = None
    interfacetype: str | None = None
    is_template: bool = False
    session_info: SessionInfo | dict | None = None

    class Config:
        # Allow extra fields and be flexible with types
        extra = "allow"


class EssedumExportResponse(BaseModel):
    """Response model for Essedum export."""
    success: bool
    message: str
    essedum_response: dict | str | list | None = None


# Create router
router = APIRouter(prefix="/essedum", tags=["Essedum Export"])


@router.post("/export", dependencies=[Depends(get_current_active_user)])
async def export_to_essedum(
    request: EssedumExportRequest,
    session: DbSession,
    current_user: CurrentActiveUser,
) -> EssedumExportResponse:
    """
    Export a Langflow flow to Essedum platform.
    
    This endpoint:
    1. Retrieves the flow from Langflow database
    2. Calls the Essedum Java backend API to create the pipeline
    3. Returns the result
    """
    try:
        # Get the flow from database
        flow = session.get(Flow, request.flow_id)
        if not flow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Flow with ID {request.flow_id} not found"
            )

        # Check if user has access to this flow
        if flow.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this flow"
            )

        # Prepare payload for Essedum API
        # Convert flow.data to string if it's an object (Java backend expects string)
        json_content_str = json.dumps(flow.data) if isinstance(flow.data, dict) else flow.data
        
        essedum_payload = {
            "alias": request.alias or flow.name,
            "description": request.description or flow.description,
            "type": request.type,
            "interfacetype": request.interface_type,
            "is_template": request.is_template,
            "json_content": json_content_str,  # The flow configuration as JSON string
            "groups": request.groups or [],
        }

        # Call Essedum Java backend API
        # You can pass session info from request headers or user context
        session_info = {
            "project_id": "your_project_id",  # Extract from request headers or user context
            "project_name": "your_project_name",
            "role_id": "your_role_id",
            "role_name": "your_role_name"
        }
        essedum_response = await call_essedum_api(essedum_payload, session_info)
        
        return EssedumExportResponse(
            success=True,
            message="Flow exported to Essedum successfully",
            essedum_response=essedum_response
        )
        
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error exporting flow to Essedum: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(exc)}"
        ) from exc


async def call_essedum_api(payload: dict, session_info: dict | None = None) -> dict | str:
    """
    Call the Essedum Java backend API to create a pipeline.
    
    This function makes an HTTP POST request to the Essedum API endpoint
    that matches the existing create_pipeline functionality.
    """
    from langflow.services.essedum.config import get_essedum_settings
    
    settings = get_essedum_settings()
    essedum_api_url = f"{settings.base_url}{settings.create_pipeline_endpoint}"
    
    # Start with default headers
    headers = settings.default_headers.copy()
    
    # Add session-specific headers if provided
    if session_info:
        # Use parent_token from session_info as Authorization (this is the JWT from frontend)
        if session_info.get("parent_token"):
            headers["Authorization"] = f"Bearer {session_info['parent_token']}"
        
        # Add project and role headers that Essedum expects
        if session_info.get("project_id"):
            headers["Project"] = str(session_info["project_id"])
        if session_info.get("project_name"):
            headers["ProjectName"] = session_info["project_name"]
        if session_info.get("role_id"):
            headers["roleId"] = str(session_info["role_id"])
        if session_info.get("role_name"):
            headers["roleName"] = session_info["role_name"]
    
    # Add additional headers that Essedum backend expects (based on working curl)
    headers.update({
        "Accept-Language": "en-US,en;q=0.9", 
        "Connection": "keep-alive",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
        "charset": "utf-8",
        "sec-ch-ua": '"Microsoft Edge";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "priority": "u=1, i"
    })
    
    # Add session-specific headers from the working curl command
    if session_info:
        if session_info.get("user_name"):
            headers["username"] = session_info["user_name"]
        if session_info.get("user_id"):
            headers["userid"] = str(session_info["user_id"])
        # Also add the access-token header (production might need this)
        if session_info.get("parent_token"):
            headers["access-token"] = session_info["parent_token"]
    
    try:
        # Log the request details for debugging
        logger.info(f"Making request to Essedum: {essedum_api_url}")
        logger.info(f"SSL verification disabled: True (for production compatibility)")
        logger.info(f"Session info: project_id={session_info.get('project_id') if session_info else 'None'}, user={session_info.get('user_name') if session_info else 'None'}")
        logger.info(f"Authorization header present: {'Authorization' in headers}")
        logger.info(f"Access-token header present: {'access-token' in headers}")
        if 'Authorization' in headers:
            logger.info(f"Auth token starts with: {headers['Authorization'][:20]}...")
        if 'access-token' in headers:
            logger.info(f"Access token starts with: {headers['access-token'][:20]}...")
        
        # Configure httpx client with SSL settings for production
        client_config = {
            "timeout": settings.timeout,
            "verify": False,  # Disable SSL verification for production (like curl --ssl-no-revoke)
        }
        
        async with httpx.AsyncClient(**client_config) as client:
            response = await client.post(
                essedum_api_url,
                json=payload,
                headers=headers
            )
            
            logger.info(f"Essedum response status: {response.status_code}")
            
            # Accept both 200 (OK) and 201 (Created) as success
            if response.status_code in [200, 201]:
                try:
                    result = response.json()
                    logger.info(f"Essedum success response received (status: {response.status_code})")
                    return result
                except Exception:
                    logger.info(f"Essedum success response received as text (status: {response.status_code})")
                    return response.text
            else:
                # Log full error details for debugging errors
                error_text = response.text
                logger.error(f"Essedum API returned {response.status_code}: {error_text}")
                logger.error(f"Request payload was: {payload}")
                
                error_msg = f"Essedum API call failed: {response.status_code} {error_text}"
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=error_msg
                )
                
    except httpx.RequestError as exc:
        error_msg = f"Error connecting to Essedum API at {essedum_api_url}: {exc}"
        logger.error(error_msg)
        logger.error(f"Essedum settings: base_url={settings.base_url}, endpoint={settings.create_pipeline_endpoint}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Cannot reach Essedum backend at {settings.base_url}. Please ensure Essedum service is running."
        ) from exc


@router.post("/create-pipeline", dependencies=[Depends(get_current_active_user)])
async def create_pipeline_via_langflow(
    request: EssedumCreatePipelineRequest,
    current_user: CurrentActiveUser,
) -> EssedumExportResponse:
    """
    Create pipeline in Essedum via Langflow backend.
    This is used by EXPORT_LANG_ESSEDUM button -> create functionality.
    """
    try:
        logger.info(f"Received create-pipeline request: {request.dict()}")
        logger.info(f"Current user: {current_user.id if current_user else 'None'}")
        # Prepare payload for Essedum API similar to frontend create_pipeline
        # Convert json_content to string if it's an object (Java backend expects string)
        json_content_str = request.json_content
        if isinstance(request.json_content, dict):
            json_content_str = json.dumps(request.json_content)
        
        essedum_payload = {
            "alias": request.alias,
            "description": request.description,
            "type": request.type,
            "interfacetype": request.interface_type,
            "is_template": request.is_template,
            "json_content": json_content_str,
            "groups": request.groups or [],
        }
        
        # Add session info if provided
        if request.session_info:
            session = request.session_info
            essedum_payload.update({
                "organization": session.organization,
                "portfolioId": session.portfolio_id,
                "portfolioName": session.portfolio_name,
                "projectId": session.project_id,
                "projectName": session.project_name,
                "roleId": session.role_id,
                "roleName": session.role_name,
                "userId": session.user_id,
            "userName": session.user_name,
                "parentToken": session.parent_token,
            })

        # Convert SessionInfo to dict for call_essedum_api
        session_dict = None
        if request.session_info:
            if isinstance(request.session_info, dict):
                # If it's already a dict, use it directly
                session_dict = {
                    "project_id": request.session_info.get("project_id"),
                    "project_name": request.session_info.get("project_name"), 
                    "role_id": request.session_info.get("role_id"),
                    "role_name": request.session_info.get("role_name"),
                    "parent_token": request.session_info.get("parent_token"),
                    "user_name": request.session_info.get("user_name")
                }
            else:
                # If it's a SessionInfo object, extract the fields
                session_dict = {
                    "project_id": request.session_info.project_id,
                    "project_name": request.session_info.project_name,
                    "role_id": request.session_info.role_id,
                    "role_name": request.session_info.role_name,
                    "parent_token": request.session_info.parent_token,
                    "user_name": request.session_info.user_name
                }

        # Call Essedum create pipeline API
        essedum_response = await call_essedum_api(essedum_payload, session_dict)
        
        return EssedumExportResponse(
            success=True,
            message="Pipeline created in Essedum via Langflow successfully",
            essedum_response=essedum_response
        )
        
    except HTTPException:
        raise
    except ValidationError as exc:
        logger.error(f"Validation error in create pipeline: {exc}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {str(exc)}"
        ) from exc
    except Exception as exc:
        logger.error(f"Error creating pipeline in Essedum via Langflow: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(exc)}"
        ) from exc


@router.post("/create-pipeline-debug", dependencies=[Depends(get_current_active_user)])
async def create_pipeline_debug(
    request_body: dict,
    current_user: CurrentActiveUser,
) -> dict:
    """
    Debug endpoint that accepts raw JSON to troubleshoot validation issues.
    """
    logger.info(f"Debug endpoint received: {request_body}")
    logger.info(f"Request body type: {type(request_body)}")
    
    try:
        # Try to parse as EssedumCreatePipelineRequest
        parsed_request = EssedumCreatePipelineRequest(**request_body)
        logger.info(f"Successfully parsed request: {parsed_request.dict()}")
        
        return {
            "success": True,
            "message": "Request parsed successfully",
            "parsed_data": parsed_request.dict()
        }
    except Exception as e:
        logger.error(f"Failed to parse request: {e}")
        return {
            "success": False,
            "error": str(e),
            "received_data": request_body
        }


@router.put("/update-pipeline", dependencies=[Depends(get_current_active_user)])
async def update_pipeline_via_langflow(
    request: EssedumUpdatePipelineRequest,
    current_user: CurrentActiveUser,
) -> EssedumExportResponse:
    """
    Update pipeline in Essedum via Langflow backend.
    This is used by EXPORT_LANG_ESSEDUM button -> update functionality.
    """
    try:
        # Prepare payload for Essedum API similar to frontend update_pipeline
        # Convert json_content to string if it's an object (Java backend expects string)
        json_content_str = request.json_content
        if isinstance(request.json_content, dict):
            json_content_str = json.dumps(request.json_content)
        
        essedum_payload = {
            "cid": request.cid,
            "alias": request.alias,
            "name": request.name,
            "description": request.description,
            "json_content": json_content_str,
            "type": request.type,
            "organization": request.organization,
            "interfacetype": request.interfacetype,
            "is_template": request.is_template,
        }

        # Convert SessionInfo to dict for call_essedum_update_api
        session_dict = None
        if request.session_info:
            if isinstance(request.session_info, dict):
                # If it's already a dict, use it directly (include parent_token!)
                session_dict = {
                    "project_id": request.session_info.get("project_id"),
                    "project_name": request.session_info.get("project_name"),
                    "role_id": request.session_info.get("role_id"),
                    "role_name": request.session_info.get("role_name"),
                    "parent_token": request.session_info.get("parent_token"),
                    "user_name": request.session_info.get("user_name"),
                    "user_id": request.session_info.get("user_id")
                }
            else:
                # If it's a SessionInfo object, extract the fields (include parent_token!)
                session_dict = {
                    "project_id": request.session_info.project_id,
                    "project_name": request.session_info.project_name,
                    "role_id": request.session_info.role_id,
                    "role_name": request.session_info.role_name,
                    "parent_token": request.session_info.parent_token,
                    "user_name": request.session_info.user_name,
                    "user_id": request.session_info.user_id
                }

        # Call Essedum update pipeline API
        essedum_response = await call_essedum_update_api(essedum_payload, session_dict)
        
        return EssedumExportResponse(
            success=True,
            message="Pipeline updated in Essedum via Langflow successfully",
            essedum_response=essedum_response
        )
        
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error updating pipeline in Essedum via Langflow: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(exc)}"
        ) from exc


@router.post("/create-native-file", dependencies=[Depends(get_current_active_user)])
async def create_native_file_via_langflow(
    current_user: CurrentActiveUser,
    scriptFile: UploadFile = File(...),
    pipelineName: str = Form(...),
    organization: str = Form(...),
    fileName: str = Form(...),
    fileType: str = Form(...),
    sessionInfo: str = Form(...),  # JSON string
) -> EssedumExportResponse:
    """
    Create native file in Essedum via Langflow backend.
    This is used by EXPORT_LANG_ESSEDUM button -> create_native functionality.
    """
    try:
        import json
        
        # Parse session info
        session_data = json.loads(sessionInfo)
        session = SessionInfo(**session_data)
        
        # Call Essedum create native file API
        essedum_response = await call_essedum_create_native_api(
            pipeline_name=pipelineName,
            organization=organization,
            file_name=fileName,
            file_type=fileType,
            script_file=scriptFile,
            session_info=session
        )
        
        return EssedumExportResponse(
            success=True,
            message="Native file created in Essedum via Langflow successfully",
            essedum_response=essedum_response
        )
        
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error creating native file in Essedum via Langflow: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(exc)}"
        ) from exc


async def call_essedum_update_api(payload: dict, session_info: dict | None = None) -> dict | str:
    """Call the Essedum Java backend API to update a pipeline."""
    from langflow.services.essedum.config import get_essedum_settings
    
    settings = get_essedum_settings()
    essedum_api_url = f"{settings.base_url}{settings.update_pipeline_endpoint}"
    
    # Start with default headers
    headers = settings.default_headers.copy()
    
    # Add authentication headers if configured
    if settings.auth_required:
        if settings.jwt_token:
            headers["Authorization"] = f"Bearer {settings.jwt_token}"
        if settings.parent_token:
            headers["Parent-Token"] = settings.parent_token
    
    # Add session-specific headers and authentication from session_info (same as create-native-file)
    if session_info:
        # Use parent_token from session_info for Authorization (most important!)
        if session_info.get("parent_token"):
            headers["Authorization"] = f"Bearer {session_info['parent_token']}"
            headers["access-token"] = session_info["parent_token"]
            
        if session_info.get("project_id"):
            headers["Project"] = str(session_info["project_id"])
        if session_info.get("project_name"):
            headers["ProjectName"] = session_info["project_name"]
        if session_info.get("role_id"):
            headers["roleId"] = str(session_info["role_id"])
        if session_info.get("role_name"):
            headers["roleName"] = session_info["role_name"]
        if session_info.get("user_name"):
            headers["username"] = session_info["user_name"]
        if session_info.get("user_id"):
            headers["userid"] = str(session_info["user_id"])
            
    # Add additional headers for production environment (same as create-native-file)
    headers.update({
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
        "sec-ch-ua": '"Microsoft Edge";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "priority": "u=1, i"
    })
    
    try:
        # Log the request details for debugging (same as other APIs)
        logger.info(f"Making update pipeline request to: {essedum_api_url}")
        logger.info(f"Authorization header present: {'Authorization' in headers}")
        logger.info(f"Access-token header present: {'access-token' in headers}")
        if 'Authorization' in headers:
            logger.info(f"Auth token starts with: {headers['Authorization'][:20]}...")
        
        # Configure httpx client with SSL settings for production
        client_config = {
            "timeout": settings.timeout,
            "verify": False,  # Disable SSL verification for production
        }
        
        async with httpx.AsyncClient(**client_config) as client:
            response = await client.put(
                essedum_api_url,
                json=payload,
                headers=headers
            )
            
            # Accept both 200 (OK) and 201 (Created) as success
            if response.status_code in [200, 201]:
                try:
                    logger.info(f"Essedum update success response received (status: {response.status_code})")
                    return response.json()
                except Exception:
                    logger.info(f"Essedum update success response received as text (status: {response.status_code})")
                    return response.text
            else:
                error_msg = f"Essedum update API call failed: {response.status_code} {response.text}"
                logger.error(error_msg)
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=error_msg
                )
                
    except httpx.RequestError as exc:
        error_msg = f"Error connecting to Essedum update API: {exc}"
        logger.error(error_msg)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=error_msg
        ) from exc


async def call_essedum_create_native_api(
    pipeline_name: str,
    organization: str,
    file_name: str,
    file_type: str,
    script_file: UploadFile,
    session_info: SessionInfo
) -> dict | str:
    """Call the Essedum Java backend API to create native file."""
    from langflow.services.essedum.config import get_essedum_settings
    
    settings = get_essedum_settings()
    essedum_api_url = f"{settings.base_url}/api/aip/file/create/{pipeline_name}/{organization}/{file_type}"
    
    # Start with default headers (but don't set Content-Type for multipart)
    headers = {
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'X-Requested-With': 'Leap',
    }
    
    # Add authentication headers if configured
    if settings.auth_required:
        if settings.jwt_token:
            headers["Authorization"] = f"Bearer {settings.jwt_token}"
        if settings.parent_token:
            headers["Parent-Token"] = settings.parent_token
    
    # Add session-specific headers and authentication from session_info
    if session_info:
        # Use parent_token from session_info for Authorization (most important!)
        if session_info.parent_token:
            headers["Authorization"] = f"Bearer {session_info.parent_token}"
            headers["access-token"] = session_info.parent_token
            
        if session_info.project_id:
            headers["Project"] = str(session_info.project_id)
        if session_info.project_name:
            headers["ProjectName"] = session_info.project_name
        if session_info.role_id:
            headers["roleId"] = str(session_info.role_id)
        if session_info.role_name:
            headers["roleName"] = session_info.role_name
        if session_info.user_name:
            headers["username"] = session_info.user_name
        if session_info.user_id:
            headers["userid"] = str(session_info.user_id)
            
    # Add additional headers for production environment  
    headers.update({
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
        "sec-ch-ua": '"Microsoft Edge";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "priority": "u=1, i"
    })
    
    try:
        # Log the request details for debugging
        logger.info(f"Making create native file request to: {essedum_api_url}")
        logger.info(f"Authorization header present: {'Authorization' in headers}")
        logger.info(f"Access-token header present: {'access-token' in headers}")
        if 'Authorization' in headers:
            logger.info(f"Auth token starts with: {headers['Authorization'][:20]}...")
        
        # Prepare multipart form data
        files = {"scriptFile": (script_file.filename, await script_file.read(), script_file.content_type)}
        params = {"file": file_name}
        
        # Configure httpx client with SSL settings for production
        client_config = {
            "timeout": settings.timeout,
            "verify": False,  # Disable SSL verification for production
        }
        
        async with httpx.AsyncClient(**client_config) as client:
            response = await client.post(
                essedum_api_url,
                files=files,
                params=params,
                headers=headers
            )
            
            # Accept both 200 (OK) and 201 (Created) as success
            if response.status_code in [200, 201]:
                try:
                    result = response.json()
                    logger.info(f"Essedum create native file success response received (status: {response.status_code}): {result}")
                    return result  # Can be dict, list, or string
                except Exception:
                    logger.info(f"Essedum create native file success response received as text (status: {response.status_code})")
                    return response.text
            else:
                error_msg = f"Essedum create native file API call failed: {response.status_code} {response.text}"
                logger.error(error_msg)
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=error_msg
                )
                
    except httpx.RequestError as exc:
        error_msg = f"Error connecting to Essedum create native file API: {exc}"
        logger.error(error_msg)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=error_msg
        ) from exc


@router.get("/status")
async def essedum_status_check():
    """Simple status check to verify the essedum router is working."""
    return {
        "status": "ok",
        "message": "Essedum export router is responding",
        "endpoints": [
            "/api/v1/essedum/export",
            "/api/v1/essedum/create-pipeline", 
            "/api/v1/essedum/update-pipeline",
            "/api/v1/essedum/create-native-file",
            "/api/v1/essedum/create-pipeline-debug",
            "/api/v1/essedum/health"
        ]
    }


@router.get("/health")
async def essedum_health_check():
    """Health check endpoint to test Essedum API connectivity."""
    from langflow.services.essedum.config import get_essedum_settings
    
    try:
        settings = get_essedum_settings()
        health_url = f"{settings.base_url}{settings.health_endpoint}"
        
        async with httpx.AsyncClient(timeout=10.0, verify=False) as client:
            response = await client.get(health_url)
            
        return {
            "status": "healthy" if response.status_code == 200 else "unhealthy",
            "essedum_status": response.status_code,
            "essedum_url": settings.base_url,
            "message": "Essedum API is reachable"
        }
    except Exception as exc:
        return {
            "status": "unhealthy",
            "message": f"Cannot reach Essedum API: {exc}"
        }