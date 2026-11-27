"""Maps Kubernetes Job + Pod state onto the contract's TaskStatus values.

The mapping is pure (no API calls), so it is unit-tested with plain dicts.
Rules, in priority order:
  1. Job succeeded                  -> Succeeded
  2. stop requested by ICIP         -> Cancelled
  3. Job failed (backoffLimit hit)  -> Failed
  4. pod Running                    -> Running
  5. pod Pending, init running      -> Preparing
  6. pod Pending / no pod yet       -> Pending
Failure *types* (OOM, EVICTED, ...) are assigned in PY-06, not here.
"""
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional, Tuple

from app.k8s.names import ANNOTATION_STOP
from app.models import TaskStatus

TERMINAL = {TaskStatus.SUCCEEDED, TaskStatus.FAILED, TaskStatus.CANCELLED}


@dataclass
class JobSnapshot:
    succeeded: int = 0
    failed: int = 0
    stop_requested: bool = False
    pod_phase: Optional[str] = None
    init_running: bool = False


def map_status(s: JobSnapshot) -> TaskStatus:
    if s.succeeded > 0:
        return TaskStatus.SUCCEEDED
    if s.stop_requested:
        return TaskStatus.CANCELLED
    if s.failed > 0:
        return TaskStatus.FAILED
    if s.pod_phase == "Running":
        return TaskStatus.RUNNING
    if s.pod_phase in (None, "Pending"):
        return TaskStatus.PREPARING if s.init_running else TaskStatus.PENDING
    if s.pod_phase == "Succeeded":
        return TaskStatus.SUCCEEDED
    if s.pod_phase == "Failed":
        return TaskStatus.FAILED
    return TaskStatus.PENDING


def _newest_pod(pods: List[dict]) -> Optional[dict]:
    if not pods:
        return None
    return max(pods, key=lambda p: p.get("metadata", {}).get("creationTimestamp", ""))


def snapshot_from_k8s(job: dict, pods: List[dict]) -> JobSnapshot:
    """Build a snapshot from Kubernetes JSON dicts (as returned by the gateway)."""
    status = job.get("status", {}) or {}
    annotations = job.get("metadata", {}).get("annotations", {}) or {}
    pod = _newest_pod(pods)
    pod_status = (pod or {}).get("status", {}) or {}
    init_statuses = pod_status.get("initContainerStatuses", []) or []
    return JobSnapshot(
        succeeded=int(status.get("succeeded", 0) or 0),
        failed=int(status.get("failed", 0) or 0),
        stop_requested=annotations.get(ANNOTATION_STOP) == "true",
        pod_phase=pod_status.get("phase"),
        init_running=any("running" in (cs.get("state") or {}) for cs in init_statuses),
    )


def timestamps(job: dict) -> Tuple[Optional[datetime], Optional[datetime]]:
    """(startedAt, finishedAt) from Job status conditions and timestamps."""
    status = job.get("status", {}) or {}
    started = status.get("startTime")
    finished = status.get("completionTime")
    if not finished:
        for cond in status.get("conditions", []) or []:
            if cond.get("type") in ("Complete", "Failed") and cond.get("status") == "True":
                finished = cond.get("lastTransitionTime")
                break
    return started, finished
