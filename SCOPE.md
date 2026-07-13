# Essedum Platform — Project Scope

> **Version:** 4.0  
> **Last Updated:** 2026-07-13  
> **Status:** Active Development

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Objectives](#2-business-objectives)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Out of Scope](#5-out-of-scope)

---

## 1. Executive Summary

Essedum is an enterprise-grade, cloud-native platform that enables teams to **build, train, deploy, and monitor AI-powered applications** — without deep infrastructure expertise.

It provides a single, unified workspace where data scientists, ML engineers, and developers can connect data sources, design pipelines, execute jobs on cloud ML platforms, deploy models as endpoints, and build LLM-powered agents — all through a browser or VS Code.

---

## 2. Business Objectives

| # | Objective | Why It Matters |
|---|---|---|
| BO-1 | **Reduce AI app delivery time** — cut time-to-production for ML models and AI agents from weeks to days. | Gives organizations a competitive edge by accelerating AI adoption. |
| BO-2 | **Eliminate infrastructure complexity** — abstract away cloud vendor differences (AWS, GCP, Azure). | Teams focus on AI logic, not DevOps. |
| BO-3 | **Enable multi-cloud flexibility** — run workloads on SageMaker, Vertex AI, or Azure ML interchangeably. | Avoids vendor lock-in; uses the cheapest or most capable platform per task. |
| BO-4 | **Democratize AI development** — provide a visual, low-code interface alongside a code-first path. | Expands AI usage beyond ML specialists to domain experts. |
| BO-5 | **Centralize governance** — manage users, roles, projects, and data access in one place. | Enforces security and compliance across all AI workloads. |
| BO-6 | **Support AI agent design and deployment** — allow teams to build, test, and ship LLM agents into production. | Addresses the growing enterprise demand for AI agents and RAG applications. |
| BO-7 | **Ensure observability** — track LLM usage, costs, and model performance in production. | Enables data-driven optimization and budget control. |

---

## 3. Functional Requirements

### 3.1 User & Access Management

| ID | Requirement |
|---|---|
| FR-U1 | Users can register, log in, and log out. Passwords must be resetable via email. |
| FR-U2 | Administrators can create and manage users, assign them to projects, and define their roles. |
| FR-U3 | The system supports role-based access control (RBAC). Permissions are defined per role and enforced on every API call. |
| FR-U4 | The system supports SSO via Keycloak (OIDC/OAuth 2.0). Teams can connect their own identity providers (LDAP, SAML). |
| FR-U5 | Users belong to portfolios and projects. Each project has its own set of roles and data boundaries. |
| FR-U6 | Administrators can create and configure organizations, org units, and delegate access between users. |

---

### 3.2 Data Container Management

| ID | Requirement |
|---|---|
| FR-D1 | Users can create data containers backed by MinIO, AWS S3, Azure Blob Storage, or GCS. |
| FR-D2 | Users can upload files and datasets to a data container through the UI or API. |
| FR-D3 | Users can browse, search, preview, and download files from a data container. |
| FR-D4 | Datasets can be registered with column schema metadata for use in pipelines. |
| FR-D5 | The system supports connecting external databases (MySQL, PostgreSQL) as data sources. |
| FR-D6 | Data containers are scoped per project. Users cannot access containers outside their project. |

---

### 3.3 Execution Container Management

| ID | Requirement |
|---|---|
| FR-E1 | Users can create execution containers targeting: local Python executor, AWS SageMaker, GCP Vertex AI, or Azure ML. |
| FR-E2 | Each execution container stores credentials and configuration needed to connect to the target cloud platform. |
| FR-E3 | Users can link an execution container to one or more data containers. |
| FR-E4 | The system validates connectivity to the execution platform before a container is saved. |

---

### 3.4 Pipeline Design & Execution

| ID | Requirement |
|---|---|
| FR-P1 | Users can create AI/ML pipelines by writing or uploading Python code. |
| FR-P2 | Pipelines support three types: **Training** (fit a model), **Inference** (use a model), and **RAG** (retrieval-augmented generation). |
| FR-P3 | Users can run a pipeline immediately (on-demand) or schedule it to run at a fixed time or interval. |
| FR-P4 | Pipeline execution status is streamed in real time to the UI (via WebSocket or SSE). |
| FR-P5 | Users can view execution logs, elapsed time, and error details for any pipeline run. |
| FR-P6 | Pipeline results and artifacts (models, outputs) are automatically saved to the linked data container. |
| FR-P7 | Pipelines can be cloned, versioned, and shared within a project. |

---

### 3.5 Model Management

| ID | Requirement |
|---|---|
| FR-M1 | Trained models are automatically registered in the model registry after a successful training run. |
| FR-M2 | Users can upload pre-trained models manually. |
| FR-M3 | Users can browse, filter, download, and delete models in the model registry. |
| FR-M4 | Models can be deployed as inference endpoints on SageMaker, Vertex AI, or Azure ML directly from the UI. |
| FR-M5 | Deployed endpoint status (running, stopped, error) is visible in the UI. |
| FR-M6 | Users can invoke a deployed model endpoint with a sample input to validate it. |

---

### 3.6 AI Agent Design & Deployment

| ID | Requirement |
|---|---|
| FR-A1 | Users can design AI agents visually using the integrated Langflow canvas (drag-and-drop nodes). |
| FR-A2 | Agent designs can be exported and converted to LangGraph or Google ADK agent code. |
| FR-A3 | The Agent Designer supports multi-agent workflows, tool calling, and memory nodes. |
| FR-A4 | Agents can be deployed to Kubernetes (AKS) as isolated pod-based services. |
| FR-A5 | Users can test deployed agents through the Agent Playground UI with free-text queries. |
| FR-A6 | Agent code can be pushed to a GitHub repository (with branch selection) directly from the UI. |
| FR-A7 | Users can build and publish agent container images to a container registry from within the platform. |

---

### 3.7 LLM Integration & Observability

| ID | Requirement |
|---|---|
| FR-L1 | The platform provides a unified LLM proxy (LiteLLM) that routes to Azure OpenAI, AWS Bedrock, GCP Vertex AI (Gemini), Anthropic, and local Ollama models. |
| FR-L2 | Users can configure LLM provider credentials and model routing rules through the admin UI. |
| FR-L3 | All LLM calls are logged in LangFuse. Users can view traces, token usage, latency, and cost per call. |
| FR-L4 | Users can run local open-source LLMs (e.g., Llama, Mistral) via Ollama without an internet connection. |
| FR-L5 | Users can create and manage prompt templates and evaluate LLM responses through LangFuse. |

---

### 3.8 Developer Tools

| ID | Requirement |
|---|---|
| FR-DT1 | A VS Code extension allows developers to authenticate, browse pipelines, submit jobs, and monitor execution — without leaving the editor. |
| FR-DT2 | All platform features are accessible via a documented REST API. |
| FR-DT3 | The platform supports MCP (Model Context Protocol) so any agent can be exposed as a tool to GitHub Copilot or other AI assistants. |
| FR-DT4 | Developers can use the proxy service to route HTTP and WebSocket traffic to dynamically spawned K8s pods. |

---

### 3.9 Notifications & Alerts

| ID | Requirement |
|---|---|
| FR-N1 | Users receive in-app notifications when a pipeline run completes, fails, or is cancelled. |
| FR-N2 | The system can send email notifications for key events (job completion, error, password reset). |
| FR-N3 | Notification preferences can be configured per user. |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Requirement |
|---|---|
| NFR-P1 | API responses for standard read operations must complete in **under 500 ms** at 100 concurrent users. |
| NFR-P2 | The UI initial load (Angular shell) must complete in **under 3 seconds** on a standard broadband connection. |
| NFR-P3 | Pipeline execution status updates must reach the UI within **2 seconds** of a state change. |
| NFR-P4 | File uploads up to **500 MB** must be supported without timeout or memory exhaustion. |
| NFR-P5 | The LLM proxy must add **less than 100 ms overhead** on top of the underlying model provider latency. |

---

### 4.2 Scalability

| ID | Requirement |
|---|---|
| NFR-S1 | Each microservice (USM, ICIP, Data, Vibe) must scale **independently** — horizontally via Kubernetes HPA. |
| NFR-S2 | The Python job executor layer must support **concurrent job execution** across multiple executor instances. |
| NFR-S3 | The platform must support at least **500 concurrent users** per deployment without degradation. |
| NFR-S4 | Database connection pools are sized per service (total ≤ 101 connections) to prevent MySQL exhaustion at scale. |
| NFR-S5 | The vector database (Qdrant) must support collections with **100M+ vectors** for enterprise RAG use cases. |

---

### 4.3 Security

| ID | Requirement |
|---|---|
| NFR-SEC1 | All API endpoints must require a valid JWT token. Unauthenticated requests return HTTP 401. |
| NFR-SEC2 | JWT tokens are validated at the API Gateway using Keycloak's JWK Set URI — no service trusts tokens in isolation. |
| NFR-SEC3 | All sensitive data at rest (user passwords, API keys, secrets) must be encrypted using AES-256-GCM. |
| NFR-SEC4 | All data in transit must use TLS 1.2 or higher. Plain HTTP is only permitted in local development. |
| NFR-SEC5 | Secrets (DB passwords, cloud credentials) must never be hardcoded. They are injected via environment variables or a secrets manager. |
| NFR-SEC6 | The platform enforces rate limiting (1000 req/s per IP) at the Nginx layer to prevent abuse. |
| NFR-SEC7 | Role and permission checks are enforced on every API endpoint, not just at the UI level. |
| NFR-SEC8 | Container images must be built from trusted base images. No `latest` tags in production deployments. |
| NFR-SEC9 | The proxy service validates that upstream K8s service names match a strict DNS-label allowlist to prevent SSRF attacks. |

---

### 4.4 Reliability & Availability

| ID | Requirement |
|---|---|
| NFR-R1 | The platform must target **99.5% uptime** for production deployments on AKS. |
| NFR-R2 | A failure in any single microservice must **not bring down** the rest of the platform. |
| NFR-R3 | Failed pipeline jobs must be retried automatically up to 3 times before being marked as failed. |
| NFR-R4 | Keycloak and MySQL must run with persistent storage volumes and survive pod restarts without data loss. |
| NFR-R5 | All services must expose a `/health` endpoint so Kubernetes liveness and readiness probes can detect failures. |

---

### 4.5 Maintainability

| ID | Requirement |
|---|---|
| NFR-M1 | Each service is independently deployable — a change to the Vibe service must not require rebuilding the USM or Data service. |
| NFR-M2 | All services share common security and utility libraries (`common-app`, `comm-lib-*`) to avoid code duplication. |
| NFR-M3 | Backend code follows standard Java/Spring Boot conventions. Frontend follows the Angular style guide. Python code follows PEP 8. |
| NFR-M4 | Each service and module must have a `README.md` describing its purpose, build steps, and configuration. |
| NFR-M5 | Database schema changes must use migration tools (Flyway/Liquibase/Alembic) — no manual SQL in production. |

---

### 4.6 Observability

| ID | Requirement |
|---|---|
| NFR-O1 | All LLM API calls must be traced in LangFuse with token count, latency, and cost. |
| NFR-O2 | Application logs must be structured (JSON) and include a correlation ID for tracing requests across services. |
| NFR-O3 | Kubernetes deployments must expose Prometheus metrics for CPU, memory, and request throughput. |
| NFR-O4 | Pipeline job execution history must be retained for a minimum of **90 days**. |

---

### 4.7 Portability & Interoperability

| ID | Requirement |
|---|---|
| NFR-PORT1 | The entire platform must run locally using `docker-compose up` with a single `.env` file for configuration. |
| NFR-PORT2 | The platform must deploy to any Kubernetes cluster (AKS, EKS, GKE) using the provided Helm charts and YAML manifests. |
| NFR-PORT3 | The REST API must follow standard HTTP conventions (correct status codes, JSON payloads) so any client can integrate without a custom SDK. |
| NFR-PORT4 | Agent designs exported from Langflow must be compatible with LangGraph and Google ADK without manual conversion. |

---

### 4.8 Usability

| ID | Requirement |
|---|---|
| NFR-UX1 | A new user with no prior platform knowledge must be able to create and run their first pipeline in **under 30 minutes** following the User Guide. |
| NFR-UX2 | The UI must work on all modern browsers (Chrome, Edge, Firefox, Safari) — latest two major versions. |
| NFR-UX3 | All long-running operations (pipeline execution, file upload, model deployment) must show real-time progress to the user — no silent waits. |
| NFR-UX4 | Error messages shown to users must be human-readable and include actionable guidance, not raw stack traces. |

---

## 5. Out of Scope

The following items are explicitly **not** covered in the current version:

| # | Out of Scope Item |
|---|---|
| OOS-1 | Building or hosting the underlying cloud ML platforms (SageMaker, Vertex AI, Azure ML) — Essedum connects to them, it does not replace them. |
| OOS-2 | Providing data labelling or data annotation tooling. |
| OOS-3 | Real-time streaming inference (sub-millisecond latency) — the platform targets batch and near-real-time workloads. |
| OOS-4 | Native mobile applications (iOS / Android). |
| OOS-5 | Managing billing or cost allocation for cloud ML compute directly — users manage cloud accounts separately. |
| OOS-6 | Long-term archival or backup of training datasets — this is delegated to the underlying storage provider (S3, Azure Blob, GCS). |

---

*Document Owner: Architecture Team*  
*Review Cycle: Per major release*
