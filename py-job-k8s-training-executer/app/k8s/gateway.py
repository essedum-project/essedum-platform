"""The only module that talks to the Kubernetes API.

Everything else depends on the small KubernetesGateway interface, so tests use an
in-memory fake (tests/fakes.py) and never need a cluster.
"""
from typing import List, Optional

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

    def delete_job(self, namespace: str, name: str) -> None:
        try:
            self._batch.delete_namespaced_job(name, namespace, propagation_policy="Background")
        except ApiException as e:
            if e.status != 404:
                raise
