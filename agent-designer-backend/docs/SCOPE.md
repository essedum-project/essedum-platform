# Agent Designer Backend — Scope

## Objective

Provide the **REST and WebSocket API backend** for the AgentFlow Designer UI. The service enables users to author AI agent flows as node graphs, execute them via LangGraph, query knowledge bases through RAG pipelines, connect to multiple LLM providers, integrate external MCP tools, and manage per-flow conversation memory. It is a Python FastAPI application that operates independently of the Java backend.

---

## Functional Requirements

### Flow Authoring

| ID | Requirement |
|---|---|
| FR-ADB1 | Users can create, retrieve, update, and delete agent flows. Each flow stores a node graph (nodes + edges) as its definition. |
| FR-ADB2 | Users can list all flows with pagination support (`skip`, `limit`). |
| FR-ADB3 | The service validates flow graph structure (topological sort, cycle detection) before accepting execution requests. |

### Flow Execution

| ID | Requirement |
|---|---|
| FR-ADB4 | Users can trigger a flow execution via `POST /api/v1/executions/flows/{flow_id}/run`. The call returns immediately with an `execution_id`; execution proceeds asynchronously in a background task. |
| FR-ADB5 | Users can list all executions, optionally filtered by `flow_id`, with pagination. |
| FR-ADB6 | Users can retrieve the current status and details of a specific execution. |
| FR-ADB7 | Users can retrieve structured per-node execution logs for any execution, with pagination. |
| FR-ADB8 | Users can stop a running execution. |

### Real-Time Execution Streaming

| ID | Requirement |
|---|---|
| FR-ADB9 | Clients can connect to `WebSocket /ws/executions/{execution_id}` to receive real-time node-level events as the execution progresses. |
| FR-ADB10 | The WebSocket connection pushes events for each node transition — including node start, completion, and output — without requiring polling. |

### Node Registry

| ID | Requirement |
|---|---|
| FR-ADB11 | The service exposes a node registry listing all supported node types with their input/output schemas. |
| FR-ADB12 | Users can retrieve the schema for a specific node type by name. |

### LLM Connectivity

| ID | Requirement |
|---|---|
| FR-ADB13 | Users can send a chat request to any configured LLM provider via `POST /api/v1/llm/chat`, specifying provider, model, messages, temperature, and max tokens. |
| FR-ADB14 | Users can list available models for a given provider via `GET /api/v1/llm/models`. |
| FR-ADB15 | Users can test connectivity to an LLM provider via `POST /api/v1/llm/test`. |
| FR-ADB16 | Supported LLM providers: Azure OpenAI, AWS Bedrock, GCP Vertex AI (Gemini), and Ollama (local). |

### MCP Tool Integration

| ID | Requirement |
|---|---|
| FR-ADB17 | Users can test connectivity to an MCP server and retrieve its available tools via `POST /api/v1/mcp/test`. |
| FR-ADB18 | Users can list all tools exposed by an MCP server via `GET /api/v1/mcp/servers/{server_url}/tools`. |

### Knowledge Bases & Documents

| ID | Requirement |
|---|---|
| FR-ADB19 | Users can create, retrieve, update, and delete named knowledge bases. |
| FR-ADB20 | Users can upload documents to a knowledge base. Uploaded documents are ingested asynchronously — chunked, embedded, and indexed in the vector store. |
| FR-ADB21 | Users can list and delete documents within a knowledge base. |

### RAG Query

| ID | Requirement |
|---|---|
| FR-ADB22 | Users can query a knowledge base using natural language via `POST /api/v1/rag/query`. The service retrieves relevant document chunks from the vector store and returns them as context. |

### Conversation Memory

| ID | Requirement |
|---|---|
| FR-ADB23 | The service stores and retrieves per-flow, per-session conversation memory entries (role + content + timestamp). |
| FR-ADB24 | Users can append new entries to a flow's memory for a given session. |
| FR-ADB25 | Users can clear all memory for a flow, optionally scoped to a specific session. |

### API Documentation

| ID | Requirement |
|---|---|
| FR-ADB26 | The service exposes interactive API documentation at `/docs` (Swagger UI) and `/redoc`. |
| FR-ADB27 | A health check endpoint is available at `/health`. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-ADB1 | Flow execution is non-blocking. `POST /run` responds in **< 200 ms**; actual execution time depends on the LLM provider and flow complexity. |
| NFR-ADB2 | The service is built on **Python 3.11+** with FastAPI and fully async I/O (`asyncio`, `aiosqlite`, `asyncpg`). All database and LLM calls are non-blocking. |
| NFR-ADB3 | Document ingestion runs as a FastAPI `BackgroundTask` — the upload API call returns before ingestion completes. |
| NFR-ADB4 | WebSocket event delivery uses an in-process `asyncio.Queue` per connection — no external message broker (Redis, Kafka) is required. |
| NFR-ADB5 | The service supports **SQLite** (default, local development) and **PostgreSQL** (production) via a single `DATABASE_URL` environment variable. Database schema is managed with Alembic migrations. |
| NFR-ADB6 | The vector store is **Qdrant**. Host, port, API key, and gRPC mode are configurable via environment variables. |
| NFR-ADB7 | All sensitive credentials (LLM API keys, cloud credentials) are loaded exclusively from environment variables. They are never stored in the database or returned in API responses. |
| NFR-ADB8 | CORS allowed origins are configurable via the `CORS_ORIGINS` environment variable (JSON array or comma-separated). |
| NFR-ADB9 | All request paths and response times are logged via a middleware layer for observability. |
| NFR-ADB10 | Flow graph cycle detection prevents invalid DAG execution. Cyclic patterns are supported only for agent-loop node types handled natively by LangGraph. |
