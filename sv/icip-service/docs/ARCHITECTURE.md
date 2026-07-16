# ICIP Service — Architecture

> **OpenAPI Spec:** [`docs/openapi.yaml`](openapi.yaml) — generate by running `curl http://<host>:8082/v3/api-docs.yaml -o sv/icip-service/docs/openapi.yaml` against a running instance, then commit. Swagger UI available at `/swagger-ui/index.html`.

---

## 1. Service Architecture

ICIP is the most complex service. It combines a standard REST layer with an **asynchronous job execution engine**, a **scheduler**, and **real-time streaming**. Jobs submitted via REST are handed off to an execution subsystem; the REST call returns immediately while execution proceeds asynchronously.

```mermaid
graph TB
    subgraph Inbound
        GW["API Gateway"]
        WS["WebSocket clients\n(job status)"]
    end

    subgraph ICIP Service
        CTL["REST Controllers\nPipelines · Jobs · Models · Agents · Events · MLOps"]
        SVC["Service Layer\nOrchestration · Scheduling · Code Gen · Model Registry"]
        EXEC["Job Execution Engine\nLocal executor dispatch · Cloud job submission"]
        SCHED["Quartz Scheduler\nPersistent · Clustered"]
        EVT["Event Manager\nEvent-to-job mapping · Webhook triggers"]
        STREAM["WebSocket / SSE Handler\nReal-time status push"]
        SEARCH["Lucene Search\nContent indexing"]
        PLUGIN["Plugin System\nExtensible job types"]
    end

    subgraph External
        DB_MAIN[("MySQL\nessedum_core")]
        DB_QUARTZ[("MySQL\nQuartz DB")]
        DB_MODEL[("MySQL\nModel DB")]
        KAFKA["Kafka"]
        RABBIT["RabbitMQ"]
        SAGE["AWS SageMaker"]
        VERTEX["GCP Vertex AI"]
        AZML["Azure ML"]
        LLM["LLM APIs\nOpenAI · Bedrock · Gemini"]
        PY_EXEC["Python Executors\n(separate processes)"]
    end

    GW --> CTL --> SVC
    WS --> STREAM
    SVC --> EXEC
    SVC --> SCHED --> DB_QUARTZ
    SVC --> EVT
    SVC --> SEARCH
    EXEC --> PY_EXEC
    EXEC --> SAGE
    EXEC --> VERTEX
    EXEC --> AZML
    EXEC --> STREAM
    EVT --> KAFKA
    EVT --> RABBIT
    SVC --> LLM
    SVC --> DB_MAIN
    SVC --> DB_MODEL
    PLUGIN -.->|extends| EXEC
```

**Key internal subsystems:**
- **Job Execution Engine** — dispatches jobs to the correct executor (local Python process or cloud ML platform). Tracks state transitions (queued → running → completed/failed).
- **Quartz Scheduler** — manages timed and recurring job triggers using a clustered, database-backed store.
- **Event Manager** — maps platform events (e.g., file uploaded, dataset updated) to job triggers.
- **WebSocket Handler** — maintains open connections to UI clients and pushes state changes the moment they occur.
- **Plugin System** — allows new job types to be registered without modifying core execution logic.

---

## 2. Dependency Map

| Dependency | Type | Purpose |
|---|---|---|
| MySQL (`essedum_core`) | Internal DB | Pipelines, jobs, events, agents, plugins, execution history |
| MySQL (Quartz DB) | Internal DB | Quartz job scheduler state — triggers, misfire records |
| MySQL (Model DB) | Internal DB | Model registry, model versions, deployed endpoints |
| Python Executors | Internal services | Run the actual Python pipeline code in isolated processes |
| AWS SageMaker | External (HTTP) | Submit and monitor cloud training/inference jobs |
| GCP Vertex AI | External (HTTP) | Submit and monitor cloud training/inference jobs |
| Azure ML | External (HTTP) | Submit and monitor cloud training/inference jobs |
| LLM APIs (OpenAI, Bedrock, Gemini) | External (HTTP) | AI code generation |
| Kafka | Messaging | Publish job lifecycle events; consume stream inputs |
| RabbitMQ | Messaging | Publish job lifecycle events; consume stream inputs |

ICIP has **no dependency on USM, Data, or Vibe services** at runtime.

---

## 3. Architectural Decisions

### AD-ICIP1 — Asynchronous job execution via task queue
Job submission returns immediately (HTTP 202). Execution happens asynchronously. The client tracks progress via WebSocket. This prevents HTTP timeouts on long-running ML jobs (which can run for hours) and decouples submission from execution throughput.

### AD-ICIP2 — Quartz with a clustered database-backed store
Quartz is configured with a JDBC job store (not in-memory). Scheduled triggers survive pod restarts and are not duplicated when multiple instances run. This is critical for exactly-once scheduled execution in Kubernetes where pods can be evicted at any time.

### AD-ICIP3 — Python execution in separate processes, not the JVM
Python ML libraries (PyTorch, scikit-learn, etc.) cannot run inside a Java process. Python executors are separate microservices. ICIP communicates with them over HTTP. A runaway Python job cannot consume the Java heap or crash the ICIP service.

### AD-ICIP4 — Plugin system for extensible job types
New job types (e.g., a new ML framework or data processing step) are added as plugins that implement a standard interface. Core execution logic does not change. This keeps the service open for extension without modifying tested code paths.

### AD-ICIP5 — Events published to message queues, not direct service calls
When a job completes or fails, ICIP publishes an event to Kafka / RabbitMQ. Downstream consumers (e.g., notification service, audit log) subscribe independently. ICIP does not know or care who is listening. This avoids tight coupling to consumers that may not exist yet.

---

## 4. Architecturally Significant Flows

### Flow 1 — Pipeline Execution (On-Demand)

```mermaid
sequenceDiagram
    participant U as User (UI)
    participant GW as API Gateway
    participant ICIP as ICIP Service
    participant PY as Python Executor
    participant WS as WebSocket

    U->>GW: POST /api/icip/jobs/run {pipelineId}
    GW->>ICIP: Forward
    ICIP->>ICIP: Validate pipeline + resolve execution container
    ICIP->>ICIP: Persist job record (status=QUEUED)
    ICIP-->>U: 202 Accepted {jobId}
    ICIP->>PY: Submit job payload (async)
    PY-->>ICIP: Job started (status=RUNNING)
    ICIP->>WS: Push status update to connected UI clients
    PY-->>ICIP: Streaming log lines
    ICIP->>WS: Stream logs to UI
    PY-->>ICIP: Job finished (status=COMPLETED, artifacts)
    ICIP->>ICIP: Persist result + register model (if training)
    ICIP->>WS: Push COMPLETED status to UI
```

### Flow 2 — Scheduled Job Trigger

```mermaid
sequenceDiagram
    participant QUARTZ as Quartz Scheduler
    participant ICIP as ICIP Service
    participant PY as Python Executor

    QUARTZ->>ICIP: Trigger fires (cron expression matched)
    ICIP->>ICIP: Load pipeline definition from DB
    ICIP->>ICIP: Create job record (status=QUEUED)
    ICIP->>PY: Submit job
    Note over ICIP: Same execution path as on-demand
```

### Flow 3 — Cloud ML Job Submission (SageMaker)

```mermaid
sequenceDiagram
    participant ICIP as ICIP Service
    participant VAULT as Vault
    participant SAGE as AWS SageMaker

    ICIP->>VAULT: Fetch AWS credentials for execution container
    VAULT-->>ICIP: AccessKeyId + SecretAccessKey
    ICIP->>SAGE: CreateTrainingJob (script, instance type, S3 input/output)
    SAGE-->>ICIP: Job ARN
    loop Poll until terminal state
        ICIP->>SAGE: DescribeTrainingJob (ARN)
        SAGE-->>ICIP: Status (InProgress / Completed / Failed)
        ICIP->>ICIP: Update job record + push WebSocket update
    end
```
