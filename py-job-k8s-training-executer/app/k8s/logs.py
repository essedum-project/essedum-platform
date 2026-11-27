"""Pod log retrieval for a task (PY-03).

Only the trainer container's output is returned. The init container's output is
not included.

Follow mode starts only once the trainer has started. If it has not started yet,
the stream is empty and the client should request again.
"""
from typing import Iterator, Optional

from app.k8s.gateway import KubernetesGateway
from app.k8s.status import newest_pod

TRAINER = "trainer"
NOT_STARTED = "Pending"


def _started_pod_name(gateway: KubernetesGateway, namespace: str, job: str) -> Optional[str]:
    pod = newest_pod(gateway.list_pods(namespace, job))
    if pod is None or (pod.get("status") or {}).get("phase") == NOT_STARTED:
        return None
    return pod["metadata"]["name"]


def tail_logs(gateway: KubernetesGateway, namespace: str, job: str, tail: int) -> str:
    pod = _started_pod_name(gateway, namespace, job)
    if pod is None:
        return ""
    return gateway.read_pod_log(namespace, pod, TRAINER, tail)


def follow_logs(gateway: KubernetesGateway, namespace: str, job: str, tail: int) -> Iterator[str]:
    pod = _started_pod_name(gateway, namespace, job)
    if pod is None:
        return
    yield from gateway.stream_pod_log(namespace, pod, TRAINER, tail)
