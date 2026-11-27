"""In-memory stand-in for KubernetesGateway. Lets tests run without a cluster.

Simulates the parts of Kubernetes behaviour the executor relies on:
- Job names are unique (409 Conflict on duplicate create)
- deleting a pod with backoffLimit=0 marks the Job as failed
"""
import copy
from datetime import datetime, timezone
from typing import Dict, List, Optional

from app.k8s.gateway import Conflict


class FakeGateway:
    def __init__(self) -> None:
        self.jobs: Dict[str, dict] = {}
        self.pods: Dict[str, List[dict]] = {}
        self.secrets: Dict[str, dict] = {}
        self._uid = 0

    # --- helpers for tests -------------------------------------------------
    def set_pod(self, job_name: str, phase: str, init_running: bool = False) -> None:
        init = [{"state": {"running": {}}}] if init_running else [{"state": {"terminated": {}}}]
        self.pods[job_name] = [{
            "metadata": {"name": f"{job_name}-pod", "creationTimestamp": _now()},
            "status": {"phase": phase, "initContainerStatuses": init},
        }]

    def set_job_status(self, job_name: str, **status) -> None:
        self.jobs[job_name]["status"].update(status)

    # --- KubernetesGateway interface ---------------------------------------
    def create_job(self, namespace: str, body: dict) -> dict:
        name = body["metadata"]["name"]
        if name in self.jobs:
            raise Conflict(name)
        self._uid += 1
        job = copy.deepcopy(body)
        job["metadata"]["uid"] = f"uid-{self._uid}"
        job["metadata"]["creationTimestamp"] = _now()
        job["status"] = {}
        self.jobs[name] = job
        self.pods[name] = []
        return copy.deepcopy(job)

    def get_job(self, namespace: str, name: str) -> Optional[dict]:
        job = self.jobs.get(name)
        return copy.deepcopy(job) if job else None

    def annotate_job(self, namespace: str, name: str, annotations: dict) -> None:
        self.jobs[name]["metadata"].setdefault("annotations", {}).update(annotations)

    def list_pods(self, namespace: str, job_name: str) -> List[dict]:
        return copy.deepcopy(self.pods.get(job_name, []))

    def delete_pods(self, namespace: str, job_name: str) -> None:
        if self.pods.get(job_name):
            self.pods[job_name] = []
            # backoffLimit=0: a deleted pod counts as a failure
            self.jobs[job_name]["status"]["failed"] = 1

    def create_secret(self, namespace: str, body: dict) -> None:
        name = body["metadata"]["name"]
        self.secrets.setdefault(name, copy.deepcopy(body))

    def delete_job(self, namespace: str, name: str) -> None:
        self.jobs.pop(name, None)
        self.pods.pop(name, None)


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
