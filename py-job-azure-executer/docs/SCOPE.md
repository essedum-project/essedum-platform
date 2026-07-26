# Azure Job Executor — Scope

## Objective

Execute AI/ML pipeline jobs on **Microsoft Azure ML** on behalf of the Essedum platform. The service receives job submissions from the ICIP backend, queues them internally, runs them against Azure ML (AutoML training, inference, model deployment), and tracks their state in a local SQLite database. It is a stateless-by-design HTTP microservice — one instance per Azure execution container.

---

## Functional Requirements

### Job Submission

| ID | Requirement |
|---|---|
| FR-AZ1 | The service accepts a job submission via `POST /execute` with a JSON payload containing bucket, project ID, pipeline name, version, credentials, input artifacts, command, storage type, and optional configs and environment variables. |
| FR-AZ2 | Each submitted job is assigned a UUID and persisted in the local job store with status `SUBMITTED` before being queued. |
| FR-AZ3 | The service validates all required fields on submission. Missing or malformed fields return HTTP 400 or 422 before the job is queued. |
| FR-AZ4 | Submitted jobs are placed on an internal in-memory queue and processed asynchronously by a thread pool. The submission API call returns immediately with the assigned `task_id`. |

### Job Lifecycle Management

| ID | Requirement |
|---|---|
| FR-AZ5 | The caller can query the status of a job via `GET /execute/{task_id}/getStatus`, which returns the job's current state (SUBMITTED, RUNNING, COMPLETED, ERROR, CANCELLED), timestamps, and process ID. |
| FR-AZ6 | A running or queued job can be cancelled via `GET /execute/{task_id}/stop`. Running jobs are terminated by killing the OS process tree; queued jobs are cancelled via the future. The final status is set to CANCELLED. |
| FR-AZ7 | The service exposes `GET /execute/{task_id}/getLog` to retrieve the execution log for a specific job from the local filesystem. |
| FR-AZ8 | The service exposes `GET /execute/getLog` to retrieve the main service log. |
| FR-AZ9 | The service exposes `GET /execute/jobs` which renders an HTML view of the last 100 jobs and their statuses. |

### Azure ML Integration

| ID | Requirement |
|---|---|
| FR-AZ10 | The service authenticates to Azure using Service Principal credentials (`tenant_id`, `service_principal_id`, `service_principal_password`, `subscription_id`) loaded from environment variables. |
| FR-AZ11 | The service submits training pipelines to Azure ML, including AutoML training jobs and Python script–based experiments. |
| FR-AZ12 | The service creates and manages Azure ML datasets and registers trained models in the Azure ML model registry. |
| FR-AZ13 | The service deploys registered models as Azure ML batch endpoints and manages batch deployments. |
| FR-AZ14 | The service generates and caches Azure AD access tokens for Azure ML API calls via the OAuth2 client-credentials flow. |
| FR-AZ15 | The service supports connecting to external MySQL and PostgreSQL datasources using credentials supplied in the job payload, for use as pipeline inputs. |

### API Documentation

| ID | Requirement |
|---|---|
| FR-AZ16 | The service exposes a Swagger UI at `/swagger` and serves the OpenAPI spec at `/swagger.json`. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-AZ1 | Job submission (`POST /execute`) must respond in **< 200 ms**. Actual execution time is determined by the Azure ML platform. |
| NFR-AZ2 | The thread pool size is configurable via `conf/conf.ini` (`ThreadCount`). Concurrent job execution is bounded by this setting. |
| NFR-AZ3 | Job state is persisted in a local SQLite database at `/data/app.db` using WAL mode for concurrent read safety. Job state survives application restarts within the same pod/container. |
| NFR-AZ4 | All string values in API responses are HTML-escaped to prevent reflected XSS. Stack traces are stripped from log output before it is returned to callers. |
| NFR-AZ5 | Security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`) are applied to all responses. |
| NFR-AZ6 | Task IDs are validated as well-formed UUIDs before any filesystem or database lookup. Path traversal attacks on log file access are detected and rejected with HTTP 403. |
| NFR-AZ7 | Azure credentials (tenant ID, service principal, subscription ID) are never returned in API responses. They are loaded exclusively from environment variables at runtime. |
| NFR-AZ8 | All Azure HTTP calls bypass any configured proxy (`http_proxy`, `https_proxy` env vars are cleared before the `requests` module is imported) to ensure direct connectivity to Azure endpoints. |
| NFR-AZ9 | The service runs as a Python 3.12+ Flask application. Port is configurable via environment; default configuration is specified in `conf/conf.ini`. |
