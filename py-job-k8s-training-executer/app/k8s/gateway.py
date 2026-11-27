"""The only module that talks to the Kubernetes API.

Everything else depends on the small KubernetesGateway interface, so tests use an
in-memory fake (tests/fakes.py) and never need a cluster.
"""
from typing import Iterator, List, Optional

from kubernetes import client, config
from kubernetes.client.exceptions import ApiException


class Conflict(Exception):
    """The object already exists (HTTP 409)."""


class KubernetesGateway:
    def __init__(self) -> None:
        try:
            config.load_incluster_config()   # running inside the cluster
        except config.ConfigException:
            config.load_kube_config()        # local development
        self._batch = client.BatchV1Api()
        self._core = client.CoreV1Api()
        self._api = client.ApiClient()

    def _dict(self, obj) -> dict:
        return self._api.sanitize_for_serialization(obj)

    def create_job(self, namespace: str, body: dict) -> dict:
        try:
            return self._dict(self._batch.create_namespaced_job(namespace, body))
        except ApiException as e:
            if e.status == 409:
                raise Conflict(body["metadata"]["name"]) from e
            raise

    def get_job(self, namespace: str, name: str) -> Optional[dict]:
        try:
            return self._dict(self._batch.read_namespaced_job(name, namespace))
        except ApiException as e:
            if e.status == 404:
                return None
            raise

    def annotate_job(self, namespace: str, name: str, annotations: dict) -> None:
        self._batch.patch_namespaced_job(
            name, namespace, {"metadata": {"annotations": annotations}})

    def list_pods(self, namespace: str, job_name: str) -> List[dict]:
        pods = self._core.list_namespaced_pod(namespace, label_selector=f"job-name={job_name}")
        return [self._dict(p) for p in pods.items]

    def delete_pods(self, namespace: str, job_name: str) -> None:
        for pod in self.list_pods(namespace, job_name):
            try:
                self._core.delete_namespaced_pod(pod["metadata"]["name"], namespace)
            except ApiException as e:
                if e.status != 404:
                    raise

    def create_secret(self, namespace: str, body: dict) -> None:
        try:
            self._core.create_namespaced_secret(namespace, body)
        except ApiException as e:
            if e.status != 409:
                raise

    def list_nodes(self) -> List[dict]:
        return [self._dict(n) for n in self._core.list_node().items]

    def list_all_pods(self) -> List[dict]:
        """Pods in every namespace. Needed because GPUs on a node are shared with other workloads."""
        return [self._dict(p) for p in self._core.list_pod_for_all_namespaces().items]

    def read_pod_log(self, namespace: str, pod: str, container: str, tail: int) -> str:
        return self._core.read_namespaced_pod_log(
            pod, namespace, container=container, tail_lines=tail)

    def stream_pod_log(self, namespace: str, pod: str, container: str, tail: int) -> Iterator[str]:
        """Yield log lines as they are written, until the container exits."""
        resp = self._core.read_namespaced_pod_log(
            pod, namespace, container=container, tail_lines=tail,
            follow=True, _preload_content=False)
        buffer = b""
        try:
            for chunk in resp.stream(decode_content=True):
                buffer += chunk
                while b"\n" in buffer:
                    line, buffer = buffer.split(b"\n", 1)
                    yield line.decode("utf-8", "replace") + "\n"
            if buffer:
                yield buffer.decode("utf-8", "replace")
        finally:
            resp.release_conn()

    def delete_job(self, namespace: str, name: str) -> None:
        try:
            self._batch.delete_namespaced_job(name, namespace, propagation_policy="Background")
        except ApiException as e:
            if e.status != 404:
                raise
