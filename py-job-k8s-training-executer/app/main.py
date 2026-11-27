"""ESSEDUM Kubernetes Training Executor - contract v1.

PY-02: create / status / stop map onto batch/v1 Jobs.
PY-03: logs (tail and follow) read the trainer pod; capacity reports GPUs per pool/type.
"""
from functools import lru_cache

from fastapi import Depends, FastAPI, HTTPException, Query, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, PlainTextResponse, StreamingResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import Settings
from app.k8s.executor import TrainingExecutor
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


@lru_cache(maxsize=1)
def get_executor() -> TrainingExecutor:
    """Production wiring. Tests replace this via app.dependency_overrides."""
    from app.k8s.gateway import KubernetesGateway
    return TrainingExecutor(KubernetesGateway(), Settings.from_env())


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
def capacity(executor: TrainingExecutor = Depends(get_executor)) -> CapacityResponse:
    """Allocatable, used and available GPUs per pool and GPU type."""
    return executor.capacity()


@app.post("/api/v1/tasks", response_model=TaskResponse, status_code=202, tags=["tasks"],
          dependencies=[Depends(require_service_token)])
def create_task(req: CreateTaskRequest, response: Response,
                executor: TrainingExecutor = Depends(get_executor)) -> TaskResponse:
    """Create a training Job. Idempotent per (runId, attempt): a repeat returns
    the existing task with 200 instead of creating a second Job."""
    task, created = executor.create(req)
    if not created:
        response.status_code = 200
    return task


@app.get("/api/v1/tasks/{task_id}", response_model=TaskResponse, tags=["tasks"],
         dependencies=[Depends(require_service_token)])
def get_task(task_id: str, executor: TrainingExecutor = Depends(get_executor)) -> TaskResponse:
    task = executor.get(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    return task


@app.post("/api/v1/tasks/{task_id}/stop", response_model=TaskResponse, tags=["tasks"],
          dependencies=[Depends(require_service_token)])
def stop_task(task_id: str, executor: TrainingExecutor = Depends(get_executor)) -> TaskResponse:
    """Cancel a task. Idempotent. Finished tasks keep their final status."""
    task = executor.stop(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    return task


@app.get("/api/v1/tasks/{task_id}/logs", response_class=PlainTextResponse, tags=["tasks"],
         dependencies=[Depends(require_service_token)])
def task_logs(task_id: str,
              tail: int = Query(200, ge=1, le=10000, description="Last N lines"),
              follow: bool = Query(False, description="Keep the connection open and stream new lines"),
              executor: TrainingExecutor = Depends(get_executor)):
    """Trainer output. With follow=true the response streams until the container exits.
    If the trainer has not started yet, the response is empty."""
    if follow:
        lines = executor.follow(task_id, tail)
        if lines is None:
            raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
        return StreamingResponse(lines, media_type="text/plain")
    text = executor.logs(task_id, tail)
    if text is None:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    return PlainTextResponse(text)
