"""PY-02 Job spec tests: the manifest must match the agreed Kubernetes rules."""
import re

from app.config import Settings
from app.k8s.job_builder import build_callback_secret, build_job
from app.k8s.names import ANNOTATION_STOP, callback_secret_name, job_name
from app.models import CreateTaskRequest

SETTINGS = Settings(namespace="ns-test")
DNS_LABEL = re.compile(r"^[a-z0-9]([-a-z0-9]*[a-z0-9])?$")


def make_req(**overrides) -> CreateTaskRequest:
    data = {
        "runId": "run-7",
        "projectId": "proj-a",
        "attempt": 2,
        "image": "registry.local/trainer:1.0",
        "command": ["python", "train.py"],
        "args": ["--epochs", "3"],
        "env": {"USER_VAR": "x"},
        "params": {"lr": 0.001},
        "resources": {"cpu": "2", "memory": "4Gi", "gpu": 0},
        "nodeSelector": {"pool": "cpu"},
        "inputs": ["s3://bucket/a.csv"],
    }
    data.update(overrides)
    return CreateTaskRequest(**data)


def env_map(container: dict) -> dict:
    return {e["name"]: e.get("value") for e in container["env"]}


def test_name_is_valid_deterministic_and_within_63_chars():
    name = job_name("run-7", 2)
    assert name == job_name("run-7", 2)
    assert len(name) <= 63 and DNS_LABEL.match(name)
    assert name != job_name("run-7", 3)
    long_name = job_name("a" * 40, 1)
    assert len(long_name) <= 63 and DNS_LABEL.match(long_name)


def test_job_metadata_labels_and_retry_policy():
    job = build_job(make_req(), job_name("run-7", 2), SETTINGS)
    assert job["apiVersion"] == "batch/v1" and job["kind"] == "Job"
    assert job["metadata"]["namespace"] == "ns-test"
    labels = job["metadata"]["labels"]
    assert labels["essedum.io/run-id"] == "run-7"
    assert labels["essedum.io/project"] == "proj-a"
    assert labels["essedum.io/attempt"] == "2"
    assert job["spec"]["backoffLimit"] == 0
    assert job["spec"]["template"]["spec"]["restartPolicy"] == "Never"
    assert job["metadata"]["annotations"][ANNOTATION_STOP] == "false"


def test_cpu_job_has_limits_and_no_gpu_resources_or_tolerations():
    job = build_job(make_req(), job_name("run-7", 2), SETTINGS)
    trainer = job["spec"]["template"]["spec"]["containers"][0]
    assert trainer["resources"]["limits"] == {"cpu": "2", "memory": "4Gi"}
    assert "nvidia.com/gpu" not in trainer["resources"]["limits"]
    assert "tolerations" not in job["spec"]["template"]["spec"]


def test_gpu_job_has_gpu_limit_and_toleration():
    req = make_req(resources={"cpu": "4", "memory": "16Gi", "gpu": 2})
    job = build_job(req, job_name("run-7", 2), SETTINGS)
    pod = job["spec"]["template"]["spec"]
    assert pod["containers"][0]["resources"]["limits"]["nvidia.com/gpu"] == "2"
    assert any(t["key"] == "nvidia.com/gpu" for t in pod["tolerations"])


def test_node_selector_is_applied():
    job = build_job(make_req(), job_name("run-7", 2), SETTINGS)
    assert job["spec"]["template"]["spec"]["nodeSelector"] == {"pool": "cpu"}


def test_volumes_workspace_and_shared_memory():
    job = build_job(make_req(), job_name("run-7", 2), SETTINGS)
    pod = job["spec"]["template"]["spec"]
    volumes = {v["name"]: v for v in pod["volumes"]}
    assert volumes["workspace"]["emptyDir"] == {}
    assert volumes["dshm"]["emptyDir"]["medium"] == "Memory"
    trainer_mounts = {m["mountPath"] for m in pod["containers"][0]["volumeMounts"]}
    assert {"/workspace", "/dev/shm"} <= trainer_mounts


def test_init_container_stages_inputs_before_trainer():
    job = build_job(make_req(), job_name("run-7", 2), SETTINGS)
    init = job["spec"]["template"]["spec"]["initContainers"][0]
    assert init["name"] == "stage-inputs"
    assert init["env"][0]["value"] == "s3://bucket/a.csv"
    assert any(m["mountPath"] == "/workspace" for m in init["volumeMounts"])


def test_reserved_env_wins_over_user_env_and_resume_is_exported():
    req = make_req(env={"ESSEDUM_RUN_ID": "hacked", "USER_VAR": "x"},
                   resumeFrom="s3://ckpt/attempt-1/step-500")
    job = build_job(req, job_name("run-7", 2), SETTINGS)
    env = env_map(job["spec"]["template"]["spec"]["containers"][0])
    assert env["ESSEDUM_RUN_ID"] == "run-7"
    assert env["USER_VAR"] == "x"
    assert env["ESSEDUM_RESUME_FROM"] == "s3://ckpt/attempt-1/step-500"
    assert env["ESSEDUM_ATTEMPT"] == "2"


def test_resume_variable_absent_when_not_resuming():
    job = build_job(make_req(), job_name("run-7", 2), SETTINGS)
    assert "ESSEDUM_RESUME_FROM" not in env_map(job["spec"]["template"]["spec"]["containers"][0])


def test_callback_token_never_appears_in_job_spec():
    req = make_req(callback={"url": "https://icip/internal/events", "token": "SECRET-TOKEN"})
    job = build_job(req, job_name("run-7", 2), SETTINGS)
    assert "SECRET-TOKEN" not in str(job)
    env = job["spec"]["template"]["spec"]["containers"][0]["env"]
    token_entry = next(e for e in env if e["name"] == "ESSEDUM_CALLBACK_TOKEN")
    assert token_entry["valueFrom"]["secretKeyRef"]["name"] == callback_secret_name(job_name("run-7", 2))


def test_callback_secret_is_owned_by_job_and_holds_token():
    name = job_name("run-7", 2)
    req = make_req(callback={"url": "https://icip/internal/events", "token": "SECRET-TOKEN"})
    secret = build_callback_secret(name, "uid-42", req, SETTINGS)
    assert secret["stringData"]["token"] == "SECRET-TOKEN"
    owner = secret["metadata"]["ownerReferences"][0]
    assert owner["kind"] == "Job" and owner["name"] == name and owner["uid"] == "uid-42"


def test_ttl_and_shm_size_come_from_settings():
    settings = Settings(namespace="ns", shm_size="8Gi", ttl_seconds_after_finished=600)
    job = build_job(make_req(), job_name("run-7", 2), settings)
    assert job["spec"]["ttlSecondsAfterFinished"] == 600
    shm = next(v for v in job["spec"]["template"]["spec"]["volumes"] if v["name"] == "dshm")
    assert shm["emptyDir"]["sizeLimit"] == "8Gi"
