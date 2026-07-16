# SageMaker Job Executor — Scope

## Objective

Execute AI/ML pipeline jobs on **AWS SageMaker** on behalf of the Essedum platform. Beyond the base job execution capability shared with the standard Python executor, this service provides a full SageMaker MLOps API: dataset management, model registry, endpoint lifecycle, training pipelines (AutoML and custom script), inference pipelines, and cloud connectivity validation.

---

## Functional Requirements

### Job Execution (shared with base executor)

| ID | Requirement |
|---|---|
| FR-SM1 | The service accepts job submissions via `POST /execute`, queues them asynchronously, and returns a `task_id` immediately. |
| FR-SM2 | Job status is queryable via `GET /execute/{task_id}/getStatus`, returning state, timestamps, PID, log path, and elapsed duration. |
| FR-SM3 | Running or queued jobs can be cancelled via `GET /execute/{task_id}/stop` using OS process-tree termination. |
| FR-SM4 | Per-job logs and output artifacts are retrievable via `GET /execute/{task_id}/getLog` and `GET /execute/{task_id}/getOutputArtifacts`. |
| FR-SM5 | Service-level logs are retrievable via `GET /execute/getLog`. |
| FR-SM6 | Job list (last 100) is available via `GET /execute` (JSON) and `GET /execute/jobs` (HTML dashboard). |

### SageMaker Dataset Management

| ID | Requirement |
|---|---|
| FR-SM7 | Users can create SageMaker datasets (S3-backed) via `POST /api/service/v1/datasets`. |
| FR-SM8 | Users can list, retrieve, delete, and export datasets. |

### SageMaker Model Registry

| ID | Requirement |
|---|---|
| FR-SM9 | Users can register models in SageMaker's model registry via `POST /api/service/v1/models/register`. |
| FR-SM10 | Users can list, retrieve, delete, and export registered models. |

### SageMaker Endpoint Lifecycle

| ID | Requirement |
|---|---|
| FR-SM11 | Users can register, list, and retrieve SageMaker inference endpoints. |
| FR-SM12 | Users can deploy a registered model to a SageMaker endpoint via `POST /api/service/v1/endpoints/{endpoint_id}/deploy_model`. |
| FR-SM13 | Users can run inference against a deployed endpoint via `POST /api/service/v1/endpoints/{endpoint_id}/infer`. |
| FR-SM14 | Users can request model explanations via `POST /api/service/v1/endpoints/{endpoint_id}/explain`. |
| FR-SM15 | Users can undeploy models from an endpoint and delete endpoints. |

### Training Pipelines

| ID | Requirement |
|---|---|
| FR-SM16 | Users can submit AutoML training jobs via `POST /api/service/v1/pipelines/training/automl`. |
| FR-SM17 | Users can submit custom script training jobs via `POST /api/service/v1/pipelines/training/custom_script`. |
| FR-SM18 | Users can submit general training runs via `POST /api/service/v1/pipelines/training/train`. |
| FR-SM19 | Users can list, retrieve, cancel, and delete training jobs. |

### Inference Pipelines

| ID | Requirement |
|---|---|
| FR-SM20 | Users can submit inference pipeline jobs via `POST /api/service/v1/pipelines/inference`. |
| FR-SM21 | Users can list, retrieve, cancel, and delete inference jobs. |

### Cloud Connectivity & Function Adapter

| ID | Requirement |
|---|---|
| FR-SM22 | Users can validate SageMaker cloud connectivity via `POST /cloudconnect`. |
| FR-SM23 | The service supports dynamic function-adapter execution via `POST /api/service/v1/function/execute`. |

### API Documentation

| ID | Requirement |
|---|---|
| FR-SM24 | Swagger UI is available at `/swagger` and the spec at `/swagger.json`. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-SM1 | Job submission returns in **< 200 ms**. SageMaker training and inference job duration is determined by AWS. |
| NFR-SM2 | Thread pool size is configurable via `conf/conf.ini` (`ThreadCount`). |
| NFR-SM3 | Job state is persisted in SQLite at `/data/app.db` with WAL mode. |
| NFR-SM4 | AWS credentials are loaded from environment variables at runtime and never logged or returned in responses. |
| NFR-SM5 | UUID validation and path traversal protection are enforced on all `/{task_id}/*` endpoints. |
| NFR-SM6 | Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`) are applied to all responses. |
