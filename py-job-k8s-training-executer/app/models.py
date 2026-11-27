"""Training Executor contract v1 - DTOs shared with the ICIP Java backend.

Any change here is a contract change: version it and agree with the ICIP owner.
"""
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel, Field

# Kubernetes DNS-label style identifiers. runId is embedded in Job names (max 63 chars),
# so it is capped at 40. projectId is used as a label value (max 63 chars).
RUN_ID_PATTERN = r"^[a-z0-9]([-a-z0-9]{0,38}[a-z0-9])?$"
PROJECT_ID_PATTERN = r"^[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?$"


class TaskStatus(str, Enum):
    PENDING = "Pending"
    PREPARING = "Preparing"
    RUNNING = "Running"
    SUCCEEDED = "Succeeded"
    FAILED = "Failed"
    CANCELLED = "Cancelled"


class FailureType(str, Enum):
    """Failure taxonomy agreed with ICIP."""
    FAILED_RETRYABLE = "FAILED_RETRYABLE"
    FAILED_PERMANENT = "FAILED_PERMANENT"
    OOM = "OOM"
    EVICTED = "EVICTED"
    NODE_LOST = "NODE_LOST"
    CANCELLED = "CANCELLED"


class Resources(BaseModel):
    cpu: str = Field("1", description="CPU limit, Kubernetes quantity, e.g. '2' or '500m'")
    memory: str = Field("2Gi", description="Memory limit, e.g. '4Gi'")
    gpu: int = Field(0, ge=0, description="Number of GPUs; 0 = CPU only")
    gpuType: Optional[str] = Field(None, description="GPU pool/type, e.g. 'a100'")


class EventCallback(BaseModel):
    url: str = Field(..., description="ICIP internal event endpoint the SDK posts to")
    token: str = Field(..., description="Per-run token; stored in a Kubernetes Secret, never logged")


class CreateTaskRequest(BaseModel):
    runId: str = Field(..., pattern=RUN_ID_PATTERN, max_length=40)
    projectId: str = Field(..., pattern=PROJECT_ID_PATTERN, max_length=63)
    attempt: int = Field(1, ge=1)
    image: str = Field(..., description="Trainer container image")
    command: List[str] = Field(default_factory=list)
    args: List[str] = Field(default_factory=list)
    env: Dict[str, str] = Field(default_factory=dict)
    params: Dict[str, object] = Field(default_factory=dict, description="Template parameters")
    resources: Resources = Field(default_factory=Resources)
    nodeSelector: Dict[str, str] = Field(default_factory=dict)
    inputs: List[str] = Field(default_factory=list, description="Input URIs staged by the init container")
    checkpointBaseUri: Optional[str] = Field(None, description="Where the SDK writes checkpoints")
    resumeFrom: Optional[str] = Field(None, description="Checkpoint URI; exported as ESSEDUM_RESUME_FROM")
    callback: Optional[EventCallback] = None


class TaskResponse(BaseModel):
    taskId: str = Field(..., description="Kubernetes Job name; use it for status, stop and logs")
    runId: str
    attempt: int
    status: TaskStatus
    failureType: Optional[FailureType] = None
    message: Optional[str] = None
    createdAt: datetime
    startedAt: Optional[datetime] = None
    finishedAt: Optional[datetime] = None


class GpuCapacity(BaseModel):
    pool: str
    gpuType: str
    allocatable: int
    used: int
    available: int = Field(0, description="allocatable minus used, never negative")


class CapacityResponse(BaseModel):
    gpus: List[GpuCapacity] = Field(default_factory=list)
    cpuAllocatable: Optional[str] = None
    memoryAllocatable: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "UP"
    contractVersion: str = "v1"


class Problem(BaseModel):
    """RFC 7807 problem details."""
    type: str = "about:blank"
    title: str
    status: int
    detail: Optional[str] = None
    instance: Optional[str] = None
