"""In-memory stand-in for KubernetesGateway. Lets tests run without a cluster.

Simulates the parts of Kubernetes behaviour the executor relies on:
- Job names are unique (409 Conflict on duplicate create)
- deleting a pod with backoffLimit=0 marks the Job as failed
- nodes, cluster-wide pods and per-pod logs (PY-03)
"""
import copy
from datetime import datetime, timezone
from typing import Dict, Iterator, List, Optional

from app.k8s.gateway import Conflict


class FakeGateway:
    def __init__(self) -> None:
        self.jobs: Dict[str, dict] = {}
        self.pods: Dict[str, List[dict]] = {}
        self.secrets: Dict[str, dict] = {}
        self.nodes: List[dict] = []
        self.other_pods: List[dict] = []          # pods not owned by a Job (other workloads)
        self.logs: Dict[str, str] = {}            # pod name -> full log text
        self._uid = 0

    # --- helpers for tests -------------------------------------------------
    def set_pod(self, job_name: str, phase: str, init_running: bool = False,
                node: Optional[str] = None, gpus: int = 0) -> None:
        init = [{"state": {"running": {}}}] if init_running else [{"state": {"terminated": {}}}]
        self.pods[job_name] = [_pod(f"{job_name}-pod", phase, node, gpus, init)]

    def set_job_status(self, job_name: str, **status) -> None:
        self.jobs[job_name]["status"].update(status)

    def add_node(self, name: str, gpus: int, pool: str = "default",
                 gpu_type: str = "unknown", gpu_resource: str = "nvidia.com/gpu") -> None:
        self.nodes.append({
            "metadata": {"name": name, "labels": {
                "essedum.io/pool": pool, "nvidia.com/gpu.product": gpu_type}},
            "status": {"allocatable": {gpu_resource: str(gpus)}},
        })

    def add_other_pod(self, name: str, node: str, phase: str, gpus: int) -> None:
        self.other_pods.append(_pod(name, phase, node, gpus))

    def set_log(self, job_name: str, text: str) -> None:
        self.logs[f"{job_name}-pod"] = text

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

    def list_nodes(self) -> List[dict]:
        return copy.deepcopy(self.nodes)

    def list_all_pods(self) -> List[dict]:
        job_pods = [p for pods in self.pods.values() for p in pods]
        return copy.deepcopy(job_pods + self.other_pods)

    def read_pod_log(self, namespace: str, pod: str, container: str, tail: int) -> str:
        lines = self.logs.get(pod, "").splitlines(keepends=True)
        return "".join(lines[-tail:])

    def stream_pod_log(self, namespace: str, pod: str, container: str, tail: int) -> Iterator[str]:
        yield from self.read_pod_log(namespace, pod, container, tail).splitlines(keepends=True)

    def delete_job(self, namespace: str, name: str) -> None:
        self.jobs.pop(name, None)
        self.pods.pop(name, None)


def _pod(name: str, phase: str, node: Optional[str], gpus: int, init: Optional[list] = None) -> dict:
    spec = {"containers": [{"name": "trainer",
                            "resources": {"limits": {"nvidia.com/gpu": str(gpus)} if gpus else {}}}]}
    if node:
        spec["nodeName"] = node
    return {
        "metadata": {"name": name, "creationTimestamp": _now()},
        "spec": spec,
        "status": {"phase": phase, "initContainerStatuses": init or []},
    }


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
