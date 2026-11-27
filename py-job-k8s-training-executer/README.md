# ESSEDUM Kubernetes Training Executor

Stateless service that turns ICIP training requests into Kubernetes Jobs (MTaaS, contract v1).

Status: **PY-01** - service skeleton and contract. Endpoints return contract-shaped
responses from an in-memory stub; real Jobs arrive in PY-02, logs/capacity in PY-03.

## Run

    pip install -r requirements.txt
    set EXECUTOR_SERVICE_TOKEN=change-me        (Windows)  /  export ... (Linux)
    uvicorn app.main:app --port 5010

Interactive docs: http://localhost:5010/docs - contract: `openapi.json`
(regenerate with `python scripts/export_openapi.py` after any DTO change).

## Endpoints (v1)

| Method | Path | Purpose |
|---|---|---|
| GET | /health | Liveness (no auth) |
| GET | /api/v1/capacity | GPU allocatable/used per pool/type |
| POST | /api/v1/tasks | Create task (202; 200 if runId+attempt already exists) |
| GET | /api/v1/tasks/{taskId} | Status |
| POST | /api/v1/tasks/{taskId}/stop | Cancel (idempotent) |
| GET | /api/v1/tasks/{taskId}/logs?tail=&follow= | Pod logs |

All `/api/v1` calls require header `X-Service-Token`. If `EXECUTOR_SERVICE_TOKEN`
is unset the service rejects everything (fail closed). Errors are RFC 7807
(`application/problem+json`).

## Test

    python -m pytest
