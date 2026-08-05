# ICIP Service — Scope

## Objective

Serve as the **AI/ML execution engine** of the platform. Accept pipeline and job definitions from users, orchestrate their execution on local or cloud ML infrastructure, manage the model registry, and stream real-time results back to the UI.

---

## Functional Requirements

### Pipeline & Job Management

| ID | Requirement |
|---|---|
| FR-ICIP1 | Users can create AI/ML pipelines by providing Python code. Three pipeline types are supported: Training, Inference, and RAG (Retrieval-Augmented Generation). |
| FR-ICIP2 | Pipelines can be run on-demand or scheduled at a fixed time or recurring interval. |
| FR-ICIP3 | Jobs can be triggered automatically when a defined platform event occurs (event-driven execution). |
| FR-ICIP4 | Job execution status is pushed to the UI in real time via WebSocket. Users never need to poll. |
| FR-ICIP5 | Users can view the full execution log, elapsed time, and error details for any job run. |
| FR-ICIP6 | Failed jobs are retried automatically up to a configurable limit before being marked as permanently failed. |
| FR-ICIP7 | Pipelines can be cloned, versioned, and shared within a project. |
| FR-ICIP8 | Jobs can be cancelled mid-execution. The service cleans up any in-progress cloud resources on cancellation. |

### Cloud ML Execution

| ID | Requirement |
|---|---|
| FR-ICIP9 | Pipelines can be submitted to **AWS SageMaker**, **GCP Vertex AI**, or **Azure ML** using the credentials stored in the linked execution container. |
| FR-ICIP10 | The service supports local Python execution for development and testing without cloud infrastructure. |
| FR-ICIP11 | The service monitors submitted cloud jobs and reflects their status back to the platform in real time. |

### Model Registry

| ID | Requirement |
|---|---|
| FR-ICIP12 | Models produced by a successful training run are automatically registered in the model registry. |
| FR-ICIP13 | Users can upload pre-trained models manually and register them with metadata (framework, version, description). |
| FR-ICIP14 | Registered models can be deployed as inference endpoints on SageMaker, Vertex AI, or Azure ML directly from the UI. |
| FR-ICIP15 | Deployed endpoint status (running, stopped, error) is visible in the UI. Users can invoke an endpoint with a sample payload to validate it. |

### AI Agents & Code Generation

| ID | Requirement |
|---|---|
| FR-ICIP16 | Users can define and execute AI agent jobs (LangChain, HayStack, drag-and-drop agent canvas). |
| FR-ICIP17 | The service generates Python code on demand using Azure OpenAI, AWS Bedrock, or GCP Vertex AI (Gemini). |
| FR-ICIP18 | Agent definitions are stored and versioned in the agent directory for reuse across projects. |

### Streaming & Events

| ID | Requirement |
|---|---|
| FR-ICIP19 | The service publishes job lifecycle events (started, completed, failed) to Kafka and RabbitMQ for downstream consumers. |
| FR-ICIP20 | The service can consume and process streaming data from Kafka and RabbitMQ topics as pipeline inputs. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-ICIP1 | Job submission must respond in **< 500 ms**. Actual execution time depends on the workload and cloud platform. |
| NFR-ICIP2 | WebSocket job status updates must reach the UI within **2 seconds** of a state change in the executor. |
| NFR-ICIP3 | The service must support **concurrent execution of multiple jobs** across multiple service instances without job state collisions. |
| NFR-ICIP4 | The Quartz job scheduler must use a **persistent, database-backed, clustered store**. Scheduled jobs must survive a pod restart without loss. |
| NFR-ICIP5 | The service must scale horizontally. Each instance is stateless; job state is stored in the database. |
| NFR-ICIP6 | Total database connection pool must not exceed **46 connections** (30 main + 8 Quartz + 8 model DB). |
| NFR-ICIP7 | Cloud ML credentials must never be logged. They are retrieved at runtime from the secrets manager. |
| NFR-ICIP8 | The service exposes `/actuator/health` for Kubernetes liveness and readiness probes. |
| NFR-ICIP9 | Job execution history must be retained for a minimum of **90 days** before archival. |
