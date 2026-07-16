# Agent Designer Backend — Architecture

---

## 1. Service Architecture

The service is a **fully async FastAPI application**. The API layer handles HTTP and WebSocket connections; execution is handed off to background tasks immediately so API calls never block on LLM or vector store latency. The LangGraph compiler translates a stored flow JSON into a runnable state graph, which is executed by the runner. Real-time events are fanned out to WebSocket clients via in-process asyncio queues.

```mermaid
graph TB
    subgraph Inbound
        UI["AgentFlow Designer UI"]
        WS_CLIENT["WebSocket clients\n(execution events)"]
    end

    subgraph Agent Designer Backend
        API["FastAPI Router\n/api/v1/* · /health · /docs · /redoc"]
        MW["Middleware\nCORS · Request Logging"]
        FLOWS["Flows API\nCRUD flow definitions"]
        EXEC_API["Executions API\nRun · Status · Logs · Stop"]
        NODES["Node Registry\nList + schema per node type"]
        LLM_API["LLM API\nChat · Models · Test connection"]
        MCP_API["MCP API\nTest · List tools"]
        KB_API["Knowledge Bases API\nCRUD knowledge bases"]
        DOCS_API["Documents API\nUpload · List · Delete"]
        RAG_API["RAG Query API\nNatural language retrieval"]
        MEM_API["Memory API\nGet · Append · Clear per-flow/session"]
        WS_API["WebSocket Handler\n/ws/executions/{id}"]

        RUNNER["Execution Runner\nBackground task · LangGraph invoke\nExecutionLog persistence"]
        COMPILER["Flow Compiler\nFlow JSON → LangGraph StateGraph"]
        GRAPH["Graph Utilities\nTopological sort · Cycle detection\nInput resolution"]
        EXECUTORS["Node Executors\nOne executor per node type"]
        CONNECTORS["LLM Connectors\nAzure OpenAI · Bedrock\nVertex AI · Ollama"]
        CONN_MGR["ConnectionManager\nasyncio.Queue fan-out per execution_id"]
        RAG_SVC["RAG Service\nChunk · Embed · Retrieve"]
        INGEST["Document Ingestion\nBackground chunking + embedding"]

        DB["SQLAlchemy (async)\nFlows · Executions · Logs\nKnowledge Bases · Documents · Memory"]
    end

    subgraph External
        PG[("PostgreSQL\nor SQLite")]
        QDRANT["Qdrant\nVector Store"]
        AZURE_OAI["Azure OpenAI"]
        BEDROCK["AWS Bedrock"]
        VERTEX["GCP Vertex AI"]
        OLLAMA["Ollama\n(local LLM)"]
        MCP_SRV["MCP Servers\n(external tools)"]
    end

    UI --> MW --> API
    WS_CLIENT --> WS_API
    API --> FLOWS & EXEC_API & NODES & LLM_API & MCP_API & KB_API & DOCS_API & RAG_API & MEM_API
    EXEC_API -->|background task| RUNNER
    RUNNER --> COMPILER --> GRAPH
    RUNNER --> EXECUTORS
    RUNNER --> CONN_MGR --> WS_API
    RUNNER --> DB
    EXECUTORS --> CONNECTORS
    CONNECTORS --> AZURE_OAI & BEDROCK & VERTEX & OLLAMA
    DOCS_API -->|background task| INGEST
    INGEST --> QDRANT
    RAG_API --> RAG_SVC --> QDRANT
    MCP_API --> MCP_SRV
    FLOWS & EXEC_API & KB_API & DOCS_API & MEM_API --> DB
    DB --> PG
```

**Key subsystems:**
- **Execution Runner** — orchestrates the full lifecycle of a flow run: compiles the graph, invokes LangGraph, persists per-node logs, broadcasts WebSocket events, and writes the final execution status.
- **Flow Compiler** — converts a stored flow definition (nodes + edges JSON) into a `LangGraph StateGraph`. Each node type maps to an executor function. Conditional edges are wired from the graph's edge list.
- **Graph Utilities** — provides topological sort (Kahn's algorithm) and cycle detection for validation paths. The compiler delegates ordering to LangGraph natively to support agent-loop cycles.
- **Node Executors** — one executor per node type (LLM, tool, input, output, RAG, memory, etc.). Called by LangGraph during graph traversal.
- **LLM Connectors** — thin async adapters wrapping each provider's SDK. A single `get_connector(provider)` factory selects the right implementation at runtime.
- **ConnectionManager** — maintains a dictionary of `execution_id → [(WebSocket, asyncio.Queue)]`. The runner calls `broadcast()` after each node; queues fan out to all connected WebSocket clients without blocking execution.
- **RAG Service** — embeds the query, retrieves top-k chunks from Qdrant, and assembles context for the response.
- **Document Ingestion** — runs as a `BackgroundTask`; chunks the uploaded file, generates embeddings via the configured LLM connector, and upserts vectors into Qdrant.

---

## 2. Dependency Map

```mermaid
graph LR
    ADB["Agent Designer Backend"]

    subgraph Databases
        PG[("PostgreSQL\nproduction")]
        SQ[("SQLite\nlocal dev")]
    end

    subgraph VectorStore
        QD["Qdrant\nRAG embeddings"]
    end

    subgraph LLMProviders
        OAI["Azure OpenAI"]
        BEDROCK["AWS Bedrock"]
        VERTEX["GCP Vertex AI"]
        OLLAMA["Ollama\nlocal"]
    end

    subgraph Tools
        MCP["MCP Servers\nHTTP / SSE"]
    end

    ADB --> PG
    ADB -.->|dev only| SQ
    ADB -->|embed / retrieve| QD
    ADB -->|chat / embed| OAI & BEDROCK & VERTEX & OLLAMA
    ADB -->|tool discovery| MCP
```

 Production relational store for flows, executions, logs, knowledge bases, documents, memory |
| SQLite (`aiosqlite`) | Local file | Default DB for local development — same schema, no external service required |
| Qdrant | External (HTTP/gRPC) | Vector store for document embeddings and RAG retrieval |
| Azure OpenAI | External (HTTPS) | LLM chat and embedding via Azure-hosted OpenAI models |
| AWS Bedrock | External (HTTPS/SDK) | LLM chat via AWS-hosted foundation models |
| GCP Vertex AI | External (HTTPS/SDK) | LLM chat via Google Gemini models |
| Ollama | External (HTTP, local) | Local open-source LLM inference (no cloud dependency) |
| MCP Servers | External (HTTP/SSE) | Tool discovery and invocation via Model Context Protocol |
| Alembic | Build-time | Database schema migrations |

---

## 3. Architectural Decisions

### AD-ADB1 — LangGraph as the execution engine
**Decision:** Flow execution is powered by LangGraph's `StateGraph`, not a custom graph traversal loop.
**Reason:** LangGraph natively handles agent-loop patterns (cycles), conditional branching, and multi-step tool-calling workflows that a plain topological sort cannot represent. This makes the execution engine robust for real agentic workloads without custom control-flow code.

### AD-ADB2 — Execution runs as a FastAPI BackgroundTask
**Decision:** `POST /run` creates an execution record, enqueues the run as a `BackgroundTask`, and returns `202 Accepted` with the `execution_id` immediately.
**Reason:** LLM calls can take seconds to minutes. Holding an HTTP connection open for that duration is unreliable and wastes server resources. The caller polls status or subscribes via WebSocket.

### AD-ADB3 — In-process asyncio.Queue for WebSocket fan-out (no Redis)
**Decision:** WebSocket event delivery uses an in-process `asyncio.Queue` per client connection, managed by a `ConnectionManager` singleton.
**Reason:** Eliminates a Redis dependency for single-instance deployments (the primary deployment target). The runner's `broadcast()` is a simple queue `put` — no serialisation overhead for local connections. For multi-instance deployments, the architecture can be extended by replacing the in-process queues with a pub/sub backend.

### AD-ADB4 — SQLite default, PostgreSQL in production, same codebase
**Decision:** The database URL is read from `DATABASE_URL` env var. SQLite (`aiosqlite`) is used by default; PostgreSQL (`asyncpg`) is used in production. No code changes are needed to switch.
**Reason:** Developers can run the service with zero external dependencies (`python run.py`). Production deployments use the same binary with a different env var. Alembic manages schema for both dialects.

### AD-ADB5 — LLM connectors as pluggable adapters behind a factory
**Decision:** Each LLM provider (Azure OpenAI, Bedrock, Vertex AI, Ollama) is implemented as an independent connector class. `get_connector(provider)` selects the right one at runtime.
**Reason:** Adding or swapping a provider requires only a new connector class — no changes to the execution engine, node executors, or API layer. Provider credentials are injected from config, not hardcoded.

### AD-ADB6 — Graph cycle detection separate from LangGraph compilation
**Decision:** `graph.py` provides a standalone topological sort and cycle detector (Kahn's algorithm) used for validation and dry-run paths. The LangGraph compiler does not call it — LangGraph handles ordering natively.
**Reason:** Validation must be fast and must not require a full LangGraph compilation. The standalone utility catches invalid DAG structures early (e.g., at flow save time) before any execution is attempted.

---

## 4. Architecturally Significant Flows

### Flow 1 — Flow Execution with Real-Time WebSocket Streaming

```mermaid
sequenceDiagram
    participant UI as Designer UI
    participant API as FastAPI
    participant BG as Background Task
    participant COMPILER as Flow Compiler
    participant LG as LangGraph
    participant EXEC as Node Executor
    participant CM as ConnectionManager
    participant WS as WebSocket Client
    participant DB as Database

    UI->>API: POST /api/v1/executions/flows/{id}/run {input}
    API->>DB: INSERT execution (status=pending)
    API-->>UI: 202 Accepted {execution_id}
    UI->>API: WS /ws/executions/{execution_id}
    API->>CM: connect(execution_id, websocket)
    BG->>DB: UPDATE execution (status=running)
    BG->>COMPILER: compile_flow(flow_definition)
    COMPILER-->>BG: StateGraph
    loop For each node in graph
        BG->>LG: invoke next node
        LG->>EXEC: execute node (LLM call / tool / RAG)
        EXEC-->>LG: node output
        LG-->>BG: node result
        BG->>DB: INSERT ExecutionLog (node, output)
        BG->>CM: broadcast(execution_id, event)
        CM-->>WS: SSE event {node_id, status, output}
    end
    BG->>DB: UPDATE execution (status=completed)
    BG->>CM: broadcast(execution_id, {done: true})
```

### Flow 2 — Document Upload and RAG Ingestion

```mermaid
sequenceDiagram
    participant UI as Designer UI
    participant API as FastAPI
    participant BG as Background Task
    participant INGEST as Ingestion Pipeline
    participant LLM as LLM Connector (Embeddings)
    participant QD as Qdrant
    participant DB as Database

    UI->>API: POST /api/v1/knowledge-bases/{kb_id}/documents (file upload)
    API->>DB: INSERT document (status=processing)
    API-->>UI: 202 Accepted {document_id}
    BG->>INGEST: ingest_document(file, kb_id)
    INGEST->>INGEST: Chunk document (fixed-size or semantic)
    INGEST->>LLM: Embed chunks (batch)
    LLM-->>INGEST: Embedding vectors
    INGEST->>QD: Upsert vectors (collection=kb_id)
    INGEST->>DB: UPDATE document (status=ready, chunk_count)
```

### Flow 3 — RAG Query

```mermaid
sequenceDiagram
    participant UI as Designer UI
    participant API as FastAPI
    participant RAG as RAG Service
    participant LLM as LLM Connector (Embeddings)
    participant QD as Qdrant

    UI->>API: POST /api/v1/rag/query {kb_id, query, top_k}
    API->>RAG: query_rag(request)
    RAG->>LLM: Embed query text
    LLM-->>RAG: Query vector
    RAG->>QD: Search(collection=kb_id, vector, top_k)
    QD-->>RAG: Top-k chunks with scores
    RAG-->>API: {chunks, sources}
    API-->>UI: 200 OK {chunks, sources}
```

### Flow 4 — LLM Connectivity Test

```mermaid
sequenceDiagram
    participant UI as Designer UI
    participant API as FastAPI
    participant FACTORY as get_connector()
    participant CONN as LLM Connector
    participant LLM as LLM Provider

    UI->>API: POST /api/v1/llm/test {provider, model}
    API->>FACTORY: get_connector(provider)
    FACTORY-->>API: connector instance
    API->>CONN: list_models() [if model not supplied]
    CONN-->>API: [model list]
    API->>CONN: chat(model, [{role:user, content:ping}], max_tokens=5)
    CONN->>LLM: API call
    LLM-->>CONN: response token
    CONN-->>API: ok
    API-->>UI: 200 OK {status: ok, provider}
```
