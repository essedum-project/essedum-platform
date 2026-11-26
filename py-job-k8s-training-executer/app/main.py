"""ESSEDUM Kubernetes Training Executor - contract v1 (PY-01 skeleton).

Endpoints return contract-shaped responses. Kubernetes behaviour arrives in
PY-02 (Jobs) and PY-03 (logs, capacity).
"""
from fastapi import Depends, FastAPI, HTTPException, Query, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, PlainTextResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app import store
from app.models import CapacityResponse, CreateTaskRequest, HealthResponse, TaskResponse
from app.security import require_service_token

app = FastAPI(
    title="ESSEDUM Kubernetes Training Executor",
    version="1.0.0",
    description="Stateless executor that turns ICIP training requests into Kubernetes Jobs. Contract v1.",
)

PROBLEM_JSON = "application/problem+json"
_TITLES = {400: "Bad Request", 401: "Unauthorized", 404: "Not Found",
           422: "Validation Failed", 503: "Service Unavailable"}


# ---- RFC 7807 error handling (shared contract with ICIP / UI) ---------------
@app.exception_handler(StarletteHTTPException)
async def http_problem(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        media_type=PROBLEM_JSON,
        content={"type": "about:blank", "title": _TITLES.get(exc.status_code, "Error"),
                 "status": exc.status_code, "detail": str(exc.detail),
                 "instance": request.url.path},
    )


@app.exception_handler(RequestValidationError)
async def validation_problem(request: Request, exc: RequestValidationError):
    errors = [{"field": ".".join(str(p) for p in e["loc"][1:]), "message": e["msg"]}
              for e in exc.errors()]
    return JSONResponse(
        status_code=422, media_type=PROBLEM_JSON,
        content={"type": "about:blank", "title": "Validation Failed", "status": 422,
                 "detail": "Request body is invalid", "instance": request.url.path,
                 "errors": errors},
    )


# ---- Endpoints --------------------------------------------------------------
@app.get("/health", response_model=HealthResponse, tags=["ops"])
def health() -> HealthResponse:
    """Liveness. Unauthenticated so Kubernetes probes work."""
    return HealthResponse()


@app.get("/api/v1/capacity", response_model=CapacityResponse, tags=["capacity"],
         dependencies=[Depends(require_service_token)])
def capacity() -> CapacityResponse:
    """Allocatable vs. used GPU capacity per pool/type. Stub until PY-03."""
    return CapacityResponse()


@app.post("/api/v1/tasks", response_model=TaskResponse, status_code=202, tags=["tasks"],
          dependencies=[Depends(require_service_token)])
def create_task(req: CreateTaskRequest, response: Response) -> TaskResponse:
    """Create a training task. Idempotent per (runId, attempt): a repeat returns
    the existing task with 200 instead of creating a second Job."""
    task, created = store.create(req)
    if not created:
        response.status_code = 200
    return task


@app.get("/api/v1/tasks/{task_id}", response_model=TaskResponse, tags=["tasks"],
         dependencies=[Depends(require_service_token)])
def get_task(task_id: str) -> TaskResponse:
    task = store.get(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    return task


@app.post("/api/v1/tasks/{task_id}/stop", response_model=TaskResponse, tags=["tasks"],
          dependencies=[Depends(require_service_token)])
def stop_task(task_id: str) -> TaskResponse:
    """Cancel a task. Idempotent."""
    task = store.stop(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    return task


@app.get("/api/v1/tasks/{task_id}/logs", response_class=PlainTextResponse, tags=["tasks"],
         dependencies=[Depends(require_service_token)])
def task_logs(task_id: str,
              tail: int = Query(200, ge=1, le=10000, description="Last N lines"),
              follow: bool = Query(False, description="Stream new lines (implemented in PY-03)")) -> str:
    if store.get(task_id) is None:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    return ""
