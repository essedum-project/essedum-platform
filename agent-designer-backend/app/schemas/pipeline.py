from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field


class PipelineCreate(BaseModel):
    flow_id: str
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    env_vars: list[dict[str, Any]] = Field(default_factory=list)
    secrets: list[dict[str, Any]] = Field(default_factory=list)


class PipelineUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None


class PipelineStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(registered|deploying|running|stopped|error)$")


class PipelineResponse(BaseModel):
    id: str
    flow_id: str
    name: str
    description: str | None
    cname: str
    status: str
    env_vars: list[dict[str, Any]]
    secrets: list[dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PipelineListResponse(BaseModel):
    items: list[PipelineResponse]
    total: int
