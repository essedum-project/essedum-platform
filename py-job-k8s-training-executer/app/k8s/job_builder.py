"""Builds the batch/v1 Job manifest (as a plain dict in Kubernetes JSON shape).

Key rules:
- backoffLimit=0: Kubernetes never retries. ICIP alone owns retries and attempt numbers.
- The callback token is NOT placed in the Job spec. It is injected from a per-run Secret.
- Reserved ESSEDUM_* variables are set after user env, so user input cannot override them.
"""
import json
from typing import Dict, List

from app.config import Settings
from app.k8s.names import ANNOTATION_STOP, callback_secret_name, common_labels
from app.models import CreateTaskRequest

WORKSPACE_MOUNT = "/workspace"
SHM_MOUNT = "/dev/shm"
STAGE_SCRIPT = (
    "mkdir -p /workspace/input && "
    "printf '%s\\n' \"$ESSEDUM_INPUTS\" > /workspace/input/inputs.txt && "
    "echo \"staged $(wc -l < /workspace/input/inputs.txt) input reference(s)\""
)
GPU_TOLERATION = {"key": "nvidia.com/gpu", "operator": "Exists", "effect": "NoSchedule"}


def _env_list(values: Dict[str, str]) -> List[dict]:
    return [{"name": k, "value": v} for k, v in values.items()]


def build_job(req: CreateTaskRequest, name: str, settings: Settings) -> dict:
    labels = common_labels(req.runId, req.projectId, req.attempt)
    limits = {"cpu": req.resources.cpu, "memory": req.resources.memory}
    if req.resources.gpu:
        limits[settings.gpu_resource_name] = str(req.resources.gpu)

    # Plain env first, then reserved ESSEDUM_* values so they always win.
    env: Dict[str, str] = dict(req.env)
    env.update({
        "ESSEDUM_RUN_ID": req.runId,
        "ESSEDUM_PROJECT_ID": req.projectId,
        "ESSEDUM_ATTEMPT": str(req.attempt),
        "ESSEDUM_PARAMS": json.dumps(req.params),
        "ESSEDUM_WORKSPACE": WORKSPACE_MOUNT,
    })
    if req.checkpointBaseUri:
        env["ESSEDUM_CHECKPOINT_BASE_URI"] = req.checkpointBaseUri
    if req.resumeFrom:
        env["ESSEDUM_RESUME_FROM"] = req.resumeFrom
    env_entries = _env_list(env)
    if req.callback:
        env_entries.append({"name": "ESSEDUM_CALLBACK_URL", "value": req.callback.url})
        env_entries.append({
            "name": "ESSEDUM_CALLBACK_TOKEN",
            "valueFrom": {"secretKeyRef": {"name": callback_secret_name(name), "key": "token"}},
        })

    workspace_mount = {"name": "workspace", "mountPath": WORKSPACE_MOUNT}
    shm_mount = {"name": "dshm", "mountPath": SHM_MOUNT}

    init_container = {
        "name": "stage-inputs",
        "image": settings.staging_image,
        "command": ["sh", "-c", STAGE_SCRIPT],
        "env": [{"name": "ESSEDUM_INPUTS", "value": "\n".join(req.inputs)}],
        "volumeMounts": [workspace_mount],
    }
    trainer = {
        "name": "trainer",
        "image": req.image,
        "command": req.command,
        "args": req.args,
        "env": env_entries,
        "resources": {"limits": limits, "requests": dict(limits)},
        "volumeMounts": [workspace_mount, shm_mount],
        "securityContext": {"allowPrivilegeEscalation": False},
    }
    pod_spec = {
        "restartPolicy": "Never",
        "nodeSelector": dict(req.nodeSelector),
        "initContainers": [init_container],
        "containers": [trainer],
        "volumes": [
            {"name": "workspace", "emptyDir": {}},
            {"name": "dshm", "emptyDir": {"medium": "Memory", "sizeLimit": settings.shm_size}},
        ],
    }
    if req.resources.gpu:
        pod_spec["tolerations"] = [dict(GPU_TOLERATION)]

    return {
        "apiVersion": "batch/v1",
        "kind": "Job",
        "metadata": {
            "name": name,
            "namespace": settings.namespace,
            "labels": labels,
            "annotations": {ANNOTATION_STOP: "false"},
        },
        "spec": {
            "backoffLimit": 0,
            "ttlSecondsAfterFinished": settings.ttl_seconds_after_finished,
            "template": {"metadata": {"labels": labels}, "spec": pod_spec},
        },
    }


def build_callback_secret(name: str, job_uid: str, req: CreateTaskRequest, settings: Settings) -> dict:
    """Per-run Secret holding the callback token. Owned by the Job, so Kubernetes
    garbage-collects it together with the Job."""
    return {
        "apiVersion": "v1",
        "kind": "Secret",
        "metadata": {
            "name": callback_secret_name(name),
            "namespace": settings.namespace,
            "labels": common_labels(req.runId, req.projectId, req.attempt),
            "ownerReferences": [{
                "apiVersion": "batch/v1",
                "kind": "Job",
                "name": name,
                "uid": job_uid,
                "controller": False,
                "blockOwnerDeletion": True,
            }],
        },
        "type": "Opaque",
        "stringData": {"token": req.callback.token},
    }
