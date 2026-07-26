import uuid
from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field


class FlowCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    nodes: list[dict[str, Any]] = Field(default_factory=list)
    edges: list[dict[str, Any]] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    env_vars: list[dict[str, Any]] = Field(default_factory=list)
    secrets: list[dict[str, Any]] = Field(default_factory=list)


class FlowUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    nodes: list[dict[str, Any]] | None = None
    edges: list[dict[str, Any]] | None = None
    tags: list[str] | None = None
    env_vars: list[dict[str, Any]] | None = None
    secrets: list[dict[str, Any]] | None = None


class FlowResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    nodes: list[dict[str, Any]]
    edges: list[dict[str, Any]]
    tags: list[str]
    env_vars: list[dict[str, Any]]
    secrets: list[dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FlowListResponse(BaseModel):
    items: list[FlowResponse]
    total: int
