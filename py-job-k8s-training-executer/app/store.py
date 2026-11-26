"""In-memory task store used by the PY-01 stub.

PY-02 replaces this with real Kubernetes Jobs (state lives in K8s labels, so the
executor stays stateless). Keep the same function signatures.
"""
import threading
import uuid
from datetime import datetime, timezone
from typing import Dict, Optional, Tuple

from app.models import CreateTaskRequest, FailureType, TaskResponse, TaskStatus

_lock = threading.Lock()
_tasks: Dict[str, TaskResponse] = {}
_by_run_attempt: Dict[Tuple[str, int], str] = {}

TERMINAL = {TaskStatus.SUCCEEDED, TaskStatus.FAILED, TaskStatus.CANCELLED}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def create(req: CreateTaskRequest) -> Tuple[TaskResponse, bool]:
    """Create a task. Idempotent per (runId, attempt). Returns (task, created)."""
    key = (req.runId, req.attempt)
    with _lock:
        existing = _by_run_attempt.get(key)
        if existing:
            return _tasks[existing], False
        task_id = f"task-{uuid.uuid4().hex[:12]}"
        task = TaskResponse(
            taskId=task_id, runId=req.runId, attempt=req.attempt,
            status=TaskStatus.PENDING, createdAt=_now(),
        )
        _tasks[task_id] = task
        _by_run_attempt[key] = task_id
        return task, True


def get(task_id: str) -> Optional[TaskResponse]:
    with _lock:
        return _tasks.get(task_id)


def stop(task_id: str) -> Optional[TaskResponse]:
    """Cancel a task. Idempotent: stopping a terminal task changes nothing."""
    with _lock:
        task = _tasks.get(task_id)
        if task is None:
            return None
        if task.status not in TERMINAL:
            task.status = TaskStatus.CANCELLED
            task.failureType = FailureType.CANCELLED
            task.finishedAt = _now()
        return task


def clear() -> None:
    with _lock:
        _tasks.clear()
        _by_run_attempt.clear()
