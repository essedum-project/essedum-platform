"""PY-03 tests: GPU capacity arithmetic, log tail and follow, and the HTTP endpoints."""
import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.k8s.capacity import compute_capacity
from app.k8s.executor import TrainingExecutor
from app.main import app, get_executor
from tests.fakes import FakeGateway

TOKEN = "test-token"
AUTH = {"X-Service-Token": TOKEN}
GPU = "nvidia.com/gpu"


def node(name, gpus, pool="default", gpu_type="a100"):
    return {"metadata": {"name": name, "labels": {
                "essedum.io/pool": pool, "nvidia.com/gpu.product": gpu_type}},
            "status": {"allocatable": {GPU: str(gpus)}}}


def pod(name, node_name, phase, gpus):
    return {"metadata": {"name": name},
            "spec": {"nodeName": node_name,
                     "containers": [{"resources": {"limits": {GPU: str(gpus)} if gpus else {}}}]},
            "status": {"phase": phase}}


# ---- capacity arithmetic ---------------------------------------------------
def test_allocatable_is_summed_per_pool_and_type():
    nodes = [node("n1", 4, pool="gpu-a", gpu_type="a100"),
             node("n2", 2, pool="gpu-a", gpu_type="a100"),
             node("n3", 8, pool="gpu-b", gpu_type="h100")]
    cap = compute_capacity(nodes, [], GPU).gpus
    rows = {(g.pool, g.gpuType): g for g in cap}
    assert rows[("gpu-a", "a100")].allocatable == 6
    assert rows[("gpu-b", "h100")].allocatable == 8


def test_nodes_without_gpus_are_excluded():
    nodes = [node("cpu-only", 0), node("gpu", 2)]
    cap = compute_capacity(nodes, [], GPU).gpus
    assert [g.allocatable for g in cap] == [2]


def test_used_counts_active_pods_on_the_node():
    nodes = [node("n1", 4)]
    pods = [pod("p1", "n1", "Running", 2), pod("p2", "n1", "Pending", 1)]
    row = compute_capacity(nodes, pods, GPU).gpus[0]
    assert (row.allocatable, row.used, row.available) == (4, 3, 1)


def test_finished_pods_release_their_gpus():
    nodes = [node("n1", 4)]
    pods = [pod("done", "n1", "Succeeded", 2), pod("failed", "n1", "Failed", 2)]
    row = compute_capacity(nodes, pods, GPU).gpus[0]
    assert row.used == 0 and row.available == 4


def test_unscheduled_pods_do_not_count_as_used():
    nodes = [node("n1", 4)]
    pods = [pod("waiting", None, "Pending", 2)]
    assert compute_capacity(nodes, pods, GPU).gpus[0].used == 0


def test_pods_on_other_nodes_are_ignored():
    nodes = [node("n1", 4)]
    pods = [pod("elsewhere", "cpu-node", "Running", 4)]
    assert compute_capacity(nodes, pods, GPU).gpus[0].used == 0


def test_available_never_goes_negative():
    nodes = [node("n1", 2)]
    pods = [pod("p", "n1", "Running", 3)]
    row = compute_capacity(nodes, pods, GPU).gpus[0]
    assert row.used == 3 and row.available == 0


def test_missing_labels_use_defaults():
    nodes = [{"metadata": {"name": "n1"}, "status": {"allocatable": {GPU: "1"}}}]
    row = compute_capacity(nodes, [], GPU).gpus[0]
    assert (row.pool, row.gpuType) == ("default", "unknown")


# ---- logs ------------------------------------------------------------------
@pytest.fixture
def gw():
    return FakeGateway()


@pytest.fixture
def ex(gw):
    return TrainingExecutor(gw, Settings(namespace="ns-test"))


def _job(gw, ex):
    from app.models import CreateTaskRequest
    task, _ = ex.create(CreateTaskRequest(runId="run-1", projectId="p", attempt=1, image="i"))
    return task.taskId


def test_tail_returns_last_n_lines(gw, ex):
    job = _job(gw, ex)
    gw.set_pod(job, "Running")
    gw.set_log(job, "".join(f"line {i}\n" for i in range(1, 11)))
    assert ex.logs(job, tail=3) == "line 8\nline 9\nline 10\n"


def test_logs_empty_while_pod_is_pending(gw, ex):
    job = _job(gw, ex)
    gw.set_pod(job, "Pending", init_running=True)
    gw.set_log(job, "should not be read\n")
    assert ex.logs(job, tail=10) == ""


def test_logs_empty_when_no_pod_yet(gw, ex):
    job = _job(gw, ex)
    assert ex.logs(job, tail=10) == ""


def test_follow_yields_lines_in_order(gw, ex):
    job = _job(gw, ex)
    gw.set_pod(job, "Running")
    gw.set_log(job, "a\nb\nc\n")
    assert list(ex.follow(job, tail=10)) == ["a\n", "b\n", "c\n"]


def test_logs_and_follow_return_none_for_unknown_task(ex):
    assert ex.logs("missing", tail=5) is None
    assert ex.follow("missing", tail=5) is None


# ---- endpoints -------------------------------------------------------------
@pytest.fixture
def client(monkeypatch, gw):
    monkeypatch.setenv("EXECUTOR_SERVICE_TOKEN", TOKEN)
    executor = TrainingExecutor(gw, Settings(namespace="ns-test"))
    app.dependency_overrides[get_executor] = lambda: executor
    yield TestClient(app, raise_server_exceptions=False)
    app.dependency_overrides.clear()


def test_logs_endpoint_returns_tail_text(client, gw):
    body = {"runId": "run-1", "projectId": "p", "attempt": 1, "image": "i"}
    task_id = client.post("/api/v1/tasks", json=body, headers=AUTH).json()["taskId"]
    gw.set_pod(task_id, "Running")
    gw.set_log(task_id, "one\ntwo\nthree\n")
    r = client.get(f"/api/v1/tasks/{task_id}/logs?tail=2", headers=AUTH)
    assert r.status_code == 200
    assert r.text == "two\nthree\n"


def test_logs_follow_endpoint_streams(client, gw):
    body = {"runId": "run-1", "projectId": "p", "attempt": 1, "image": "i"}
    task_id = client.post("/api/v1/tasks", json=body, headers=AUTH).json()["taskId"]
    gw.set_pod(task_id, "Running")
    gw.set_log(task_id, "x\ny\n")
    r = client.get(f"/api/v1/tasks/{task_id}/logs?follow=true", headers=AUTH)
    assert r.status_code == 200
    assert r.text == "x\ny\n"


def test_logs_endpoint_404_for_unknown_task(client):
    assert client.get("/api/v1/tasks/nope/logs", headers=AUTH).status_code == 404
    assert client.get("/api/v1/tasks/nope/logs?follow=true", headers=AUTH).status_code == 404


def test_capacity_endpoint_reports_gpus(client, gw):
    gw.add_node("n1", 4, pool="gpu-a", gpu_type="a100")
    gw.add_other_pod("other-team", "n1", "Running", 1)
    r = client.get("/api/v1/capacity", headers=AUTH)
    assert r.status_code == 200
    assert r.json()["gpus"] == [{"pool": "gpu-a", "gpuType": "a100",
                                 "allocatable": 4, "used": 1, "available": 3}]
