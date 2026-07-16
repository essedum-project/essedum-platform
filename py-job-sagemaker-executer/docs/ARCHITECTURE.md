# SageMaker Job Executor — Architecture

---

## 1. Service Architecture

Extends the base Python job executor pattern with a full **SageMaker MLOps API layer**. The base job execution engine (queue → thread pool → subprocess) is identical to the standard executor. The SageMaker-specific routes operate independently of the job queue — they call the SageMaker SDK directly and return synchronously or initiate async SageMaker jobs tracked by SageMaker itself.

```mermaid
graph TB
    subgraph Inbound
        ICIP["ICIP Service"]
    end

    subgraph SageMaker Job Executor
        BASE_API["Base Job API\n/execute/* endpoints"]
        SM_API["SageMaker MLOps API\n/api/service/v1/*\ndatasets · models · endpoints\ntraining · inference · cloudconnect"]
        QUEUE["In-Memory Queue"]
        THREAD_POOL["ThreadPoolExecutor"]
        TASK["Task Runner\nSubprocess + S3/MinIO I/O"]
        DB["SQLite /data/app.db\n(WAL mode)"]
        MLOPS["mlops/sagemaker.py\nSageMaker SDK calls"]
        FUNC_ADAPTER["functionadapter.py\nDynamic script + pip"]
    end

    subgraph External
        AWS_SM["AWS SageMaker\nTraining · Inference · AutoML\nModel Registry · Endpoints"]
        S3["AWS S3\nDatasets · Artifacts"]
    end

    ICIP --> BASE_API & SM_API
    BASE_API --> QUEUE --> THREAD_POOL --> TASK
    TASK --> DB & S3
    SM_API --> MLOPS --> AWS_SM & S3
    SM_API --> FUNC_ADAPTER
```

---

## 2. Dependency Map

| Dependency | Type | Purpose |
|---|---|---|
| AWS SageMaker SDK (`sagemaker`) | External (HTTPS/SDK) | Training jobs, AutoML, endpoints, model registry, inference |
| AWS S3 (`boto3`) | External (HTTPS/SDK) | Dataset storage, artifact upload/download |
| SQLite (`/data/app.db`) | Local file | Job state persistence |
| `conf/conf.ini` | Local file | Thread count, working directory |

---

## 3. Architectural Decisions

### AD-SM1 — SageMaker MLOps API is synchronous (not queued)
**Decision:** SageMaker dataset, model, endpoint, and pipeline API calls are handled synchronously via direct SDK calls — they do not go through the internal job queue.
**Reason:** SageMaker SDK calls themselves return job IDs or resource ARNs quickly (the actual work runs on AWS infrastructure). Queuing them would add latency without benefit. Polling for SageMaker job completion is the responsibility of the caller via the status endpoints.

### AD-SM2 — Shared SQLite store for base jobs only
**Decision:** SQLite tracks only the base job-executor jobs (submitted via `/execute`). SageMaker MLOps operations (training jobs, endpoints) are tracked directly in AWS and surfaced via the status/list endpoints.
**Reason:** SageMaker already maintains durable job state in AWS. Duplicating that into SQLite would create a consistency problem if the two stores diverged.

---

## 4. Architecturally Significant Flows

### Flow 1 — SageMaker AutoML Training Job

```mermaid
sequenceDiagram
    participant ICIP as ICIP Service
    participant API as SageMaker Executor
    participant SDK as mlops/sagemaker.py
    participant SM as AWS SageMaker

    ICIP->>API: POST /api/service/v1/pipelines/training/automl {dataset, target_column, config}
    API->>SDK: submit_automl_job(config)
    SDK->>SM: CreateAutoMLJob (SDK)
    SM-->>SDK: Job ARN
    SDK-->>API: {job_id, status: "InProgress"}
    API-->>ICIP: 200 OK {job_id}
    Note over ICIP: Polls GET /api/service/v1/pipelines/training/{id}/get for status
```

### Flow 2 — Model Deployment to Endpoint

```mermaid
sequenceDiagram
    participant ICIP as ICIP Service
    participant API as SageMaker Executor
    participant SDK as mlops/sagemaker.py
    participant SM as AWS SageMaker

    ICIP->>API: POST /api/service/v1/endpoints/{endpoint_id}/deploy_model {model_id, instance_type}
    API->>SDK: deploy_model(endpoint_id, model_id)
    SDK->>SM: CreateEndpoint / UpdateEndpoint
    SM-->>SDK: Endpoint ARN (creating)
    SDK-->>API: {endpoint_id, status: "Creating"}
    API-->>ICIP: 200 OK
```
