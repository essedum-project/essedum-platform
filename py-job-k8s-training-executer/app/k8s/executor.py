"""Task orchestration on top of the Kubernetes gateway (PY-02).

Create / get / stop. No database: the Job object holds all state.
"""
from datetime import datetime
from typing import Optional, Tuple

from app.config import Settings
from app.k8s.gateway import Conflict, KubernetesGateway
from app.k8s.job_builder import build_callback_secret, build_job
from app.k8s.names import ANNOTATION_STOP, LABEL_ATTEMPT, LABEL_RUN, job_name
from app.k8s.status import TERMINAL, map_status, snapshot_from_k8s, timestamps
from app.models import CreateTaskRequest, FailureType, TaskResponse, TaskStatus


def _parse(value: Optional[str]) -> Optional[datetime]:
    return datetime.fromisoformat(value.replace("Z", "+00:00")) if value else None


class TrainingExecutor:
    def __init__(self, gateway: KubernetesGateway, settings: Settings) -> None:
        self.gateway = gateway
        self.settings = settings

    def create(self, req: CreateTaskRequest) -> Tuple[TaskResponse, bool]:
        """Create the Job. Returns (task, created). A repeat of the same runId+attempt
        returns the existing task with created=False and does not create a second Job."""
        name = job_name(req.runId, req.attempt)
        ns = self.settings.namespace
        try:
            job = self.gateway.create_job(ns, build_job(req, name, self.settings))
        except Conflict:
            existing = self.gateway.get_job(ns, name)
            return self._to_response(existing), False

        if req.callback:
            try:
                secret = build_callback_secret(name, job["metadata"]["uid"], req, self.settings)
                self.gateway.create_secret(ns, secret)
            except Exception:
                # Do not leave a Job running without its callback credentials.
                self.gateway.delete_job(ns, name)
                raise
        return self._to_response(job), True

    def get(self, task_id: str) -> Optional[TaskResponse]:
        job = self.gateway.get_job(self.settings.namespace, task_id)
        if job is None:
            return None
        return self._to_response(job)

    def stop(self, task_id: str) -> Optional[TaskResponse]:
        """Cancel a task. Idempotent. A task that already finished keeps its final status.

        The Job object is kept (not deleted) so its status stays queryable. Only its pods
        are removed. Because the stop flag is set first, the Job reads as Cancelled."""
        ns = self.settings.namespace
        job = self.gateway.get_job(ns, task_id)
        if job is None:
            return None
        current = self._to_response(job)
        if current.status in TERMINAL:
            return current
        self.gateway.annotate_job(ns, task_id, {ANNOTATION_STOP: "true"})
        self.gateway.delete_pods(ns, task_id)
        return self.get(task_id)

    def _to_response(self, job: dict) -> TaskResponse:
        ns = self.settings.namespace
        name = job["metadata"]["name"]
        pods = self.gateway.list_pods(ns, name)
        status = map_status(snapshot_from_k8s(job, pods))
        started, finished = timestamps(job)
        labels = job["metadata"].get("labels", {})
        return TaskResponse(
            taskId=name,
            runId=labels[LABEL_RUN],
            attempt=int(labels[LABEL_ATTEMPT]),
            status=status,
            failureType=FailureType.CANCELLED if status == TaskStatus.CANCELLED else None,
            createdAt=_parse(job["metadata"]["creationTimestamp"]),
            startedAt=_parse(started),
            finishedAt=_parse(finished) if status in TERMINAL else None,
        )
