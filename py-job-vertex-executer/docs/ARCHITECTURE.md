# Vertex AI Job Executor — Architecture

---

## 1. Service Architecture

Structurally identical to the SageMaker executor — the same base job execution engine (queue → thread pool → subprocess) plus a cloud MLOps API layer, targeting GCP Vertex AI instead of AWS SageMaker. The Vertex AI MLOps API calls are synchronous; actual training and inference workloads run on GCP infrastructure.

```mermaid
graph TB
    subgraph Inbound
        ICIP["ICIP Service"]
    end

    subgraph Vertex AI Job Executor
        BASE_API["Base Job API\n/execute/* endpoints"]
        VX_API["Vertex AI MLOps API\n/api/service/v1/*\ndatasets · models · endpoints\ntraining · inference · cloudconnect"]
        QUEUE["In-Memory Queue"]
        THREAD_POOL["ThreadPoolExecutor"]
        TASK["Task Runner\nSubprocess + GCS I/O"]
        DB["SQLite /data/app.db\n(WAL mode)"]
        MLOPS["mlops/vertex.py\nVertex AI SDK calls"]
        FUNC_ADAPTER["functionadapter.py\nDynamic script + pip"]
    end

    subgraph External
        GCP_VX["GCP Vertex AI\nTraining · AutoML\nModel Registry · Endpoints"]
        GCS["Google Cloud Storage\nDatasets · Artifacts"]
    end

    ICIP --> BASE_API & VX_API
    BASE_API --> QUEUE --> THREAD_POOL --> TASK
    TASK --> DB & GCS
    VX_API --> MLOPS --> GCP_VX & GCS
    VX_API --> FUNC_ADAPTER
```

---

## 2. Dependency Map

| Dependency | Type | Purpose |
|---|---|---|
| GCP Vertex AI SDK (`google-cloud-aiplatform`) | External (HTTPS/SDK) | Training jobs, AutoML, endpoints, model registry |
| Google Cloud Storage | External (HTTPS/SDK) | Dataset and artifact storage |
| SQLite (`/data/app.db`) | Local file | Base job state persistence |
| `conf/conf.ini` | Local file | Thread count, working directory |

---

## 3. Architectural Decisions

### AD-VX1 — Mirror of SageMaker executor architecture
**Decision:** The Vertex AI executor follows the exact same architectural pattern as the SageMaker executor — base job queue + cloud MLOps API layer, with the cloud SDK layer (`mlops/vertex.py`) being the only differentiator.
**Reason:** The Essedum platform treats cloud ML platforms as interchangeable. A consistent executor structure means the ICIP Service uses the same protocol to communicate with all executors; only the target executor URL and the cloud-specific SDK differ.

### AD-VX2 — GCP credentials via Application Default Credentials or env vars
**Decision:** GCP authentication uses either a Service Account JSON file path (`GOOGLE_APPLICATION_CREDENTIALS` env var) or the GCP Application Default Credentials chain.
**Reason:** This follows GCP's recommended credential pattern, supporting both Kubernetes Workload Identity (cluster-managed credentials) and explicit Service Account keys without code changes.

---

## 4. Architecturally Significant Flows

### Flow 1 — Vertex AI Custom Script Training

```mermaid
sequenceDiagram
    participant ICIP as ICIP Service
    participant API as Vertex Executor
    participant SDK as mlops/vertex.py
    participant VX as GCP Vertex AI
    participant GCS as Google Cloud Storage

    ICIP->>API: POST /api/service/v1/pipelines/training/custom_script {script_uri, config}
    API->>SDK: submit_custom_training(config)
    SDK->>GCS: Confirm training script URI exists
    SDK->>VX: Create CustomJob (SDK)
    VX-->>SDK: Job resource name
    SDK-->>API: {job_id, status: "PENDING"}
    API-->>ICIP: 200 OK {job_id}
```

### Flow 2 — Vertex AI Model Endpoint Inference

```mermaid
sequenceDiagram
    participant ICIP as ICIP Service
    participant API as Vertex Executor
    participant SDK as mlops/vertex.py
    participant VX as GCP Vertex AI

    ICIP->>API: POST /api/service/v1/endpoints/{endpoint_id}/infer {instances}
    API->>SDK: predict(endpoint_id, instances)
    SDK->>VX: Endpoint.predict() (SDK)
    VX-->>SDK: predictions
    SDK-->>API: {predictions}
    API-->>ICIP: 200 OK {predictions}
```
