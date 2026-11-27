"""GPU capacity per pool and GPU type (PY-03).

Pure computation over Kubernetes JSON dicts, so it is unit-tested without a cluster.

- allocatable: GPUs each schedulable node offers, summed per (pool, gpuType)
- used: GPU limits of active pods (Pending or Running) scheduled on those nodes
- available: allocatable minus used, never negative

Finished pods (Succeeded or Failed) release their GPUs, so they are not counted.
"""
from collections import defaultdict
from typing import Dict, Iterable, List, Tuple

from app.k8s.gateway import KubernetesGateway
from app.models import CapacityResponse, GpuCapacity

LABEL_POOL = "essedum.io/pool"
LABEL_GPU_TYPE = "nvidia.com/gpu.product"   # set by NVIDIA GPU feature discovery
DEFAULT_POOL = "default"
UNKNOWN_GPU_TYPE = "unknown"
ACTIVE_PHASES = {"Pending", "Running"}


def _quantity(value) -> int:
    """Whole-number Kubernetes quantity ('2' or 2). Anything else counts as 0."""
    try:
        return int(str(value))
    except (TypeError, ValueError):
        return 0


def compute_capacity(nodes: Iterable[dict], pods: Iterable[dict], gpu_resource: str) -> CapacityResponse:
    allocatable: Dict[Tuple[str, str], int] = defaultdict(int)
    node_group: Dict[str, Tuple[str, str]] = {}

    for node in nodes:
        meta = node.get("metadata", {})
        labels = meta.get("labels") or {}
        gpus = _quantity(((node.get("status") or {}).get("allocatable") or {}).get(gpu_resource, 0))
        if gpus <= 0:
            continue
        group = (labels.get(LABEL_POOL, DEFAULT_POOL), labels.get(LABEL_GPU_TYPE, UNKNOWN_GPU_TYPE))
        allocatable[group] += gpus
        node_group[meta["name"]] = group

    used: Dict[Tuple[str, str], int] = defaultdict(int)
    for pod in pods:
        spec = pod.get("spec") or {}
        node = spec.get("nodeName")
        phase = (pod.get("status") or {}).get("phase")
        if node not in node_group or phase not in ACTIVE_PHASES:
            continue
        for container in spec.get("containers") or []:
            limits = (container.get("resources") or {}).get("limits") or {}
            used[node_group[node]] += _quantity(limits.get(gpu_resource, 0))

    gpus: List[GpuCapacity] = []
    for group in sorted(allocatable):
        total, taken = allocatable[group], used[group]
        gpus.append(GpuCapacity(
            pool=group[0], gpuType=group[1],
            allocatable=total, used=taken,
            available=max(0, total - taken),
        ))
    return CapacityResponse(gpus=gpus)


def get_capacity(gateway: KubernetesGateway, gpu_resource: str) -> CapacityResponse:
    return compute_capacity(gateway.list_nodes(), gateway.list_all_pods(), gpu_resource)
