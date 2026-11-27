"""Contract tests: health, auth, endpoint shapes, RFC 7807 errors (no cluster needed)."""
import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.k8s.executor import TrainingExecutor
from app.main import app, get_executor
from tests.fakes import FakeGateway

TOKEN = "test-token"
AUTH = {"X-Service-Token": TOKEN}

BODY = {
    "runId": "run-1",
    "projectId": "proj-1",
    "attempt": 1,
    "image": "registry.local/trainer:latest",
    "resources": {"cpu": "1", "memory": "1Gi", "gpu": 0},
}


@pytest.fixture(autouse=True)
def _setup(monkeypatch):
    monkeypatch.setenv("EXECUTOR_SERVICE_TOKEN", TOKEN)
    gateway = FakeGateway()
    executor = TrainingExecutor(gateway, Settings())
    app.dependency_overrides[get_executor] = lambda: executor
    yield gateway
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app, raise_server_exceptions=False)


def test_health_is_open_and_reports_contract_version(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "UP", "contractVersion": "v1"}


@pytest.mark.parametrize("method,path", [
    ("get", "/api/v1/capacity"),
    ("post", "/api/v1/tasks"),
    ("get", "/api/v1/tasks/x"),
    ("post", "/api/v1/tasks/x/stop"),
    ("get", "/api/v1/tasks/x/logs"),
])
def test_endpoints_reject_missing_or_wrong_token(client, method, path):
    assert getattr(client, method)(path).status_code == 401
    r = getattr(client, method)(path, headers={"X-Service-Token": "wrong"})
    assert r.status_code == 401
    assert r.headers["content-type"].startswith("application/problem+json")


def test_fails_closed_when_token_not_configured(client, monkeypatch):
    monkeypatch.delenv("EXECUTOR_SERVICE_TOKEN")
    assert client.get("/api/v1/capacity", headers=AUTH).status_code == 503


def test_capacity_shape(client):
    r = client.get("/api/v1/capacity", headers=AUTH)
    assert r.status_code == 200
    assert "gpus" in r.json()


def test_create_returns_202_with_job_name_as_task_id(client):
    r = client.post("/api/v1/tasks", json=BODY, headers=AUTH)
    assert r.status_code == 202
    data = r.json()
    assert data["taskId"].startswith("tr-run-1-")
    assert data["runId"] == "run-1"
    assert data["attempt"] == 1
    assert data["status"] == "Pending"


def test_create_is_idempotent_per_run_and_attempt(client, _setup):
    first = client.post("/api/v1/tasks", json=BODY, headers=AUTH)
    second = client.post("/api/v1/tasks", json=BODY, headers=AUTH)
    assert second.status_code == 200
    assert second.json()["taskId"] == first.json()["taskId"]
    assert len(_setup.jobs) == 1
    third = client.post("/api/v1/tasks", json={**BODY, "attempt": 2}, headers=AUTH)
    assert third.status_code == 202
    assert third.json()["taskId"] != first.json()["taskId"]


def test_create_validation_error_is_rfc7807(client):
    r = client.post("/api/v1/tasks", json={"runId": "r"}, headers=AUTH)
    assert r.status_code == 422
    assert r.headers["content-type"].startswith("application/problem+json")
    body = r.json()
    assert body["status"] == 422 and body["errors"]


def test_run_id_must_be_dns_safe(client):
    r = client.post("/api/v1/tasks", json={**BODY, "runId": "Bad_Run"}, headers=AUTH)
    assert r.status_code == 422


def test_status_and_unknown_task(client):
    task_id = client.post("/api/v1/tasks", json=BODY, headers=AUTH).json()["taskId"]
    assert client.get(f"/api/v1/tasks/{task_id}", headers=AUTH).json()["taskId"] == task_id
    r = client.get("/api/v1/tasks/nope", headers=AUTH)
    assert r.status_code == 404
    assert r.json()["title"] == "Not Found"


def test_stop_cancels_and_is_idempotent(client):
    task_id = client.post("/api/v1/tasks", json=BODY, headers=AUTH).json()["taskId"]
    for _ in range(2):
        r = client.post(f"/api/v1/tasks/{task_id}/stop", headers=AUTH)
        assert r.status_code == 200
        assert r.json()["status"] == "Cancelled"
        assert r.json()["failureType"] == "CANCELLED"


def test_logs_endpoint(client):
    task_id = client.post("/api/v1/tasks", json=BODY, headers=AUTH).json()["taskId"]
    assert client.get(f"/api/v1/tasks/{task_id}/logs?tail=10", headers=AUTH).status_code == 200
    assert client.get("/api/v1/tasks/nope/logs", headers=AUTH).status_code == 404
    assert client.get(f"/api/v1/tasks/{task_id}/logs?tail=0", headers=AUTH).status_code == 422


def test_openapi_documents_all_v1_endpoints(client):
    paths = client.get("/openapi.json").json()["paths"]
    for p in ["/health", "/api/v1/capacity", "/api/v1/tasks",
              "/api/v1/tasks/{task_id}", "/api/v1/tasks/{task_id}/stop",
              "/api/v1/tasks/{task_id}/logs"]:
        assert p in paths
