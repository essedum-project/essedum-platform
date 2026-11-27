"""PY-02 status mapping and executor lifecycle tests, against the in-memory fake gateway."""
import pytest

from app.config import Settings
from app.k8s.executor import TrainingExecutor
from app.k8s.names import ANNOTATION_STOP, callback_secret_name, job_name
from app.k8s.status import JobSnapshot, map_status
from app.models import CreateTaskRequest, FailureType, TaskStatus
from tests.fakes import FakeGateway

SETTINGS = Settings(namespace="ns-test")


def req(attempt=1, callback=True) -> CreateTaskRequest:
    data = {"runId": "run-9", "projectId": "proj", "attempt": attempt,
            "image": "trainer:1", "resources": {"cpu": "1", "memory": "1Gi", "gpu": 0}}
    if callback:
        data["callback"] = {"url": "https://icip/events", "token": "TOK"}
    return CreateTaskRequest(**data)


@pytest.fixture
def gw():
    return FakeGateway()


@pytest.fixture
def ex(gw):
    return TrainingExecutor(gw, SETTINGS)


# ---- pure status mapping -----------------------------------------------------
@pytest.mark.parametrize("snapshot,expected", [
    (JobSnapshot(), TaskStatus.PENDING),
    (JobSnapshot(pod_phase="Pending"), TaskStatus.PENDING),
    (JobSnapshot(pod_phase="Pending", init_running=True), TaskStatus.PREPARING),
    (JobSnapshot(pod_phase="Running"), TaskStatus.RUNNING),
    (JobSnapshot(pod_phase="Running", init_running=True), TaskStatus.RUNNING),
    (JobSnapshot(succeeded=1, pod_phase="Succeeded"), TaskStatus.SUCCEEDED),
    (JobSnapshot(failed=1), TaskStatus.FAILED),
    (JobSnapshot(pod_phase="Failed"), TaskStatus.FAILED),
    (JobSnapshot(stop_requested=True, failed=1), TaskStatus.CANCELLED),
    (JobSnapshot(stop_requested=True, pod_phase="Running"), TaskStatus.CANCELLED),
    (JobSnapshot(stop_requested=True, succeeded=1), TaskStatus.SUCCEEDED),
])
def test_status_mapping(snapshot, expected):
    assert map_status(snapshot) == expected


# ---- executor lifecycle ------------------------------------------------------
def test_create_builds_job_and_owned_secret(ex, gw):
    task, created = ex.create(req())
    assert created is True
    name = job_name("run-9", 1)
    assert task.taskId == name and task.status == TaskStatus.PENDING
    secret = gw.secrets[callback_secret_name(name)]
    assert secret["metadata"]["ownerReferences"][0]["uid"] == gw.jobs[name]["metadata"]["uid"]


def test_create_without_callback_makes_no_secret(ex, gw):
    ex.create(req(callback=False))
    assert gw.secrets == {}


def test_repeat_create_returns_existing_job(ex, gw):
    first, _ = ex.create(req())
    again, created = ex.create(req())
    assert created is False
    assert again.taskId == first.taskId
    assert len(gw.jobs) == 1


def test_status_follows_pod_lifecycle(ex, gw):
    task, _ = ex.create(req())
    name = task.taskId
    gw.set_pod(name, "Pending", init_running=True)
    assert ex.get(name).status == TaskStatus.PREPARING
    gw.set_pod(name, "Running")
    assert ex.get(name).status == TaskStatus.RUNNING
    gw.set_job_status(name, succeeded=1)
    gw.set_pod(name, "Succeeded")
    done = ex.get(name)
    assert done.status == TaskStatus.SUCCEEDED
    assert done.finishedAt is None or done.finishedAt >= done.createdAt


def test_pod_killed_without_stop_is_failed_and_no_new_job_is_created(ex, gw):
    # backoffLimit=0 + deleted pod -> Job failed. ICIP, not the executor, decides on retries.
    task, _ = ex.create(req())
    gw.set_pod(task.taskId, "Running")
    gw.set_job_status(task.taskId, failed=1)
    gw.delete_pods(SETTINGS.namespace, task.taskId)
    assert ex.get(task.taskId).status == TaskStatus.FAILED
    assert len(gw.jobs) == 1


def test_stop_cancels_running_job_and_removes_pods(ex, gw):
    task, _ = ex.create(req())
    gw.set_pod(task.taskId, "Running")
    stopped = ex.stop(task.taskId)
    assert stopped.status == TaskStatus.CANCELLED
    assert gw.pods[task.taskId] == []
    assert gw.jobs[task.taskId]["metadata"]["annotations"][ANNOTATION_STOP] == "true"
    assert stopped.failureType == FailureType.CANCELLED
    after = ex.get(task.taskId)
    assert after.status == TaskStatus.CANCELLED
    assert after.failureType == FailureType.CANCELLED


def test_stop_is_idempotent(ex, gw):
    task, _ = ex.create(req())
    gw.set_pod(task.taskId, "Running")
    ex.stop(task.taskId)
    assert ex.stop(task.taskId).status == TaskStatus.CANCELLED


def test_stop_does_not_rewrite_a_finished_task(ex, gw):
    task, _ = ex.create(req())
    gw.set_job_status(task.taskId, succeeded=1)
    gw.set_pod(task.taskId, "Succeeded")
    assert ex.stop(task.taskId).status == TaskStatus.SUCCEEDED


def test_unknown_task_returns_none(ex):
    assert ex.get("missing") is None
    assert ex.stop("missing") is None
