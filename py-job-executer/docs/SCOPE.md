# Python Job Executor — Scope

## Objective

Execute general-purpose Python-based AI/ML pipeline jobs on behalf of the Essedum platform. The service accepts job submissions from the ICIP backend, queues them internally, runs each job as an OS subprocess, and tracks their state in a local SQLite database. Unlike the cloud-specific executors, this service targets **local and S3/MinIO-backed** workloads and additionally provides function-adapter execution and virtual environment lifecycle management.

---

## Functional Requirements

### Job Submission

| ID | Requirement |
|---|---|
| FR-PY1 | The service accepts a job submission via `POST /execute` with a JSON payload containing bucket, project ID, pipeline name, version, credentials, input artifacts, command, storage type, and optional environment variables. |
| FR-PY2 | Each submitted job is assigned a UUID and persisted in the local job store with status `SUBMITTED` before being queued. |
| FR-PY3 | The service validates all required fields on submission. Missing or mismatched parameters return HTTP 400; type or length violations return HTTP 422. |
| FR-PY4 | Submitted jobs are placed on an in-memory queue and processed asynchronously by a thread pool. The submission call returns immediately with the `task_id`. |
| FR-PY5 | The service supports two dispatch modes: **queue mode** (FIFO via in-memory queue) and **direct executor mode** (immediate submission to the thread pool bypassing the queue), selected per-call by the internal `push_in_queue` flag. |

### Job Lifecycle Management

| ID | Requirement |
|---|---|
| FR-PY6 | The caller can query the status of a job via `GET /execute/{task_id}/getStatus`, which returns status (SUBMITTED, RUNNING, COMPLETED, ERROR, CANCELLED), timestamps, PID, log path, output directory, and elapsed duration for terminal states. |
| FR-PY7 | A running or queued job can be cancelled via `GET /execute/{task_id}/stop`. Running jobs are terminated by killing the full OS process tree (parent + children) using `psutil`; queued jobs are cancelled via the future. Final status is set to CANCELLED. |
| FR-PY8 | The service exposes `GET /execute/{task_id}/getLog` to retrieve the execution log for a specific job from the local working directory. |
| FR-PY9 | The service exposes `GET /execute/{task_id}/getOutputArtifacts` to retrieve all output artifact files produced by a job's execution. |
| FR-PY10 | The service exposes `GET /execute/getLog` to retrieve the main service log. |
| FR-PY11 | The service exposes `GET /execute/jobs` which renders an HTML dashboard of the last 100 jobs and their statuses. |
| FR-PY12 | The service exposes `GET /execute` to list all tracked jobs as JSON (last 100). |

### Storage Backends

| ID | Requirement |
|---|---|
| FR-PY13 | Jobs targeting `storage=local` read input artifacts from and write output artifacts to the local filesystem under the configured working directory. |
| FR-PY14 | Jobs targeting `storage=minio` read input artifacts from and write output artifacts to a MinIO object store using the credentials in the job payload. |
| FR-PY15 | Jobs targeting `storage=s3` read input artifacts from and write output artifacts to AWS S3 using the credentials in the job payload. |

### Function Adapter Execution

| ID | Requirement |
|---|---|
| FR-PY16 | The service exposes `POST /api/service/v1/function/execute` which executes a function adapter call (dynamic Python script generation and execution) from a structured request payload. |
| FR-PY17 | The function adapter supports dynamic script generation: it assembles a Python script from imports, requirements, and execution-order blocks supplied in the request, installs missing packages via pip, and runs the script. |

### Virtual Environment Management

| ID | Requirement |
|---|---|
| FR-PY18 | The service exposes `GET /venvs` to list all virtual environments under the `venvs/` directory. |
| FR-PY19 | The service exposes `DELETE /venvs` to delete one or more named virtual environments by name. |

### Task Retriever Integration

| ID | Requirement |
|---|---|
| FR-PY20 | When `use_task_retriver` is enabled in configuration, the service propagates job status transitions (RUNNING, COMPLETED, ERROR) to an external task-retriever module via async database updates. |

### API Documentation

| ID | Requirement |
|---|---|
| FR-PY21 | The service exposes a Swagger UI at `/swagger` and serves the OpenAPI spec at `/swagger.json`. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-PY1 | Job submission (`POST /execute`) must respond in **< 200 ms**. Actual execution time depends on the pipeline script and its dependencies. |
| NFR-PY2 | The thread pool size is configurable via `conf/conf.ini` (`ThreadCount`). Concurrent job execution is bounded by this setting. |
| NFR-PY3 | Job state is persisted in a local SQLite database at `/data/app.db` using WAL mode. Job state survives application restarts within the same pod or container. |
| NFR-PY4 | Task IDs are validated as well-formed UUIDs before any filesystem or database operation. All file paths are resolved and checked against the configured working directory to prevent path traversal attacks. |
| NFR-PY5 | Package names in function-adapter requests are validated against a strict regex (`^[A-Za-z0-9_\-\.]+...`) before being passed to `pip install`. Shell injection via package names is not possible. |
| NFR-PY6 | Security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`) are applied to all responses. |
| NFR-PY7 | Storage credentials from the job payload are never logged or returned in API responses. |
| NFR-PY8 | The service runs as a Python Flask application. Port and working directory are configurable via `conf/conf.ini`. |
