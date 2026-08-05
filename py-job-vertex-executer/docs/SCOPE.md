# Vertex AI Job Executor — Scope

## Objective

Execute AI/ML pipeline jobs on **GCP Vertex AI** on behalf of the Essedum platform. Structurally identical to the SageMaker executor, this service targets Google Cloud: dataset management, model registry, endpoint lifecycle, training pipelines, inference pipelines, and cloud connectivity validation — all against GCP Vertex AI APIs.

---

## Functional Requirements

### Job Execution (shared with base executor)

| ID | Requirement |
|---|---|
| FR-VX1 | The service accepts job submissions via `POST /execute`, queues them asynchronously, and returns a `task_id` immediately. |
| FR-VX2 | Job status is queryable via `GET /execute/{task_id}/getStatus`. |
| FR-VX3 | Running or queued jobs can be cancelled via `GET /execute/{task_id}/stop`. |
| FR-VX4 | Per-job logs and output artifacts are retrievable via `GET /execute/{task_id}/getLog` and `GET /execute/{task_id}/getOutputArtifacts`. |
| FR-VX5 | Service logs are retrievable via `GET /execute/getLog`. |
| FR-VX6 | Job list (last 100) is available via `GET /execute` (JSON) and `GET /execute/jobs` (HTML). |

### Vertex AI Dataset Management

| ID | Requirement |
|---|---|
| FR-VX7 | Users can create, list, retrieve, delete, and export Vertex AI datasets. |

### Vertex AI Model Registry

| ID | Requirement |
|---|---|
| FR-VX8 | Users can register, list, retrieve, delete, and export models in the Vertex AI model registry. |

### Vertex AI Endpoint Lifecycle

| ID | Requirement |
|---|---|
| FR-VX9 | Users can register, list, and retrieve Vertex AI inference endpoints. |
| FR-VX10 | Users can deploy a registered model to a Vertex AI endpoint. |
| FR-VX11 | Users can run inference and explanations against deployed endpoints. |
| FR-VX12 | Users can undeploy models and delete endpoints. |

### Training Pipelines

| ID | Requirement |
|---|---|
| FR-VX13 | Users can submit AutoML training jobs via `POST /api/service/v1/pipelines/training/automl`. |
| FR-VX14 | Users can submit custom script training jobs via `POST /api/service/v1/pipelines/training/custom_script`. |
| FR-VX15 | Users can submit general training runs, and list, retrieve, cancel, and delete training jobs. |

### Inference Pipelines

| ID | Requirement |
|---|---|
| FR-VX16 | Users can submit, list, retrieve, cancel, and delete inference pipeline jobs. |

### Cloud Connectivity & Function Adapter

| ID | Requirement |
|---|---|
| FR-VX17 | Users can validate Vertex AI cloud connectivity via `POST /cloudconnect`. |
| FR-VX18 | The service supports dynamic function-adapter execution via `POST /api/service/v1/function/execute`. |

### API Documentation

| ID | Requirement |
|---|---|
| FR-VX19 | Swagger UI is available at `/swagger` and the spec at `/swagger.json`. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-VX1 | Job submission returns in **< 200 ms**. Vertex AI job duration is determined by GCP. |
| NFR-VX2 | Thread pool size is configurable via `conf/conf.ini` (`ThreadCount`). |
| NFR-VX3 | Job state is persisted in SQLite at `/data/app.db` with WAL mode. |
| NFR-VX4 | GCP credentials (Service Account JSON or Application Default Credentials) are loaded from environment variables at runtime and never logged or returned in responses. |
| NFR-VX5 | UUID validation and path traversal protection are enforced on all `/{task_id}/*` endpoints. |
| NFR-VX6 | Security headers are applied to all responses. |
