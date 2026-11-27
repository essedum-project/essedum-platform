"""Deterministic Kubernetes object names and label keys.

The Job name doubles as the task ID. Because it is derived from (runId, attempt),
the same request always maps to the same Job, which makes create idempotent
without any executor-side database.
"""
import hashlib

LABEL_PART_OF = "app.kubernetes.io/part-of"
PART_OF_VALUE = "essedum-mtaas"
LABEL_RUN = "essedum.io/run-id"
LABEL_PROJECT = "essedum.io/project"
LABEL_ATTEMPT = "essedum.io/attempt"
ANNOTATION_STOP = "essedum.io/stop-requested"
POD_JOB_LABEL = "job-name"  # set automatically by the Job controller on its pods


def job_name(run_id: str, attempt: int) -> str:
    """e.g. tr-my-run-3f9a1c2b7d-a1. Always a valid DNS label of at most 63 characters."""
    digest = hashlib.sha256(f"{run_id}:{attempt}".encode()).hexdigest()[:10]
    readable = run_id[:30].rstrip("-")
    return f"tr-{readable}-{digest}-a{attempt}"


def callback_secret_name(job: str) -> str:
    return f"{job}-callback"


def common_labels(run_id: str, project_id: str, attempt: int) -> dict:
    return {
        LABEL_PART_OF: PART_OF_VALUE,
        LABEL_RUN: run_id,
        LABEL_PROJECT: project_id,
        LABEL_ATTEMPT: str(attempt),
    }
