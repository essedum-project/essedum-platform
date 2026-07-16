# Data Service — Architecture

> **OpenAPI Spec:** [`docs/openapi.yaml`](openapi.yaml) — generated automatically on every push to main by the [`openapi-spec`](../../../.github/workflows/openapi-spec.yml) workflow. Import into Postman, Swagger Editor, or any OpenAPI-compatible tool.

---

## 1. Service Architecture

Data Service is a **storage and connectivity hub**. It has two distinct responsibilities handled by the same process: a file server for binary assets, and an adapter framework that lets pipelines read from and write to external data sources through a uniform interface.

```mermaid
graph TB
    subgraph Inbound
        GW["API Gateway"]
        KAFKA_IN["Kafka / RabbitMQ\n(stream inputs)"]
    end

    subgraph Data Service
        CTL["REST Controllers\nFiles · Folders · Datasets · Datasources · Schemas · Adapters"]
        SVC["Service Layer\nFile management · Dataset registration · Adapter orchestration"]
        FILE_SVC["File Server\nUpload · Download · Folder mgmt"]
        ADAPTER_FW["Adapter Framework\nPlugin interface — one impl per source type"]
        SEARCH_IDX["Lucene Index\nFull-text search over datasets + files"]
        STREAM_SVC["Stream Consumer\nKafka / RabbitMQ topic ingestion"]
        PARSER["Data Parsers\nCSV · Excel · PDF → normalised rows"]
    end

    subgraph Storage
        DB[("MySQL\nessedum_data")]
        LOCAL["Local Filesystem"]
        S3["AWS S3 / MinIO"]
        AZBLOB["Azure Blob Storage"]
    end

    subgraph Adapter Targets
        MYSQL_EXT["MySQL (external)"]
        PG_EXT["PostgreSQL (external)"]
        REST_EXT["REST APIs"]
        GCP_GCS["GCP Cloud Storage"]
        SAGE["AWS SageMaker"]
        VERTEX["GCP Vertex AI"]
        REMOTE["Remote Executor"]
    end

    GW --> CTL --> SVC
    SVC --> FILE_SVC
    SVC --> ADAPTER_FW
    SVC --> SEARCH_IDX
    SVC --> PARSER
    KAFKA_IN --> STREAM_SVC --> SVC

    FILE_SVC --> LOCAL
    FILE_SVC --> S3
    FILE_SVC --> AZBLOB
    SVC --> DB

    ADAPTER_FW --> MYSQL_EXT
    ADAPTER_FW --> PG_EXT
    ADAPTER_FW --> REST_EXT
    ADAPTER_FW --> GCP_GCS
    ADAPTER_FW --> SAGE
    ADAPTER_FW --> VERTEX
    ADAPTER_FW --> REMOTE
```

**Key internal subsystems:**
- **File Server** — handles binary I/O. Storage backend (local/S3/Azure) is selected at runtime based on configuration; the rest of the service does not know which backend is active.
- **Adapter Framework** — each external data source type is implemented as an adapter plugin. All adapters implement the same interface (`read`, `write`, `schema`). Pipelines call the framework; the framework delegates to the correct adapter.
- **Lucene Index** — maintained locally per service instance, updated on every file/dataset mutation. Used for keyword search within a project's data.
- **Data Parsers** — normalise uploaded CSV/Excel/PDF files into row-column records before indexing or dataset registration.

---

## 2. Dependency Map

| Dependency | Type | Purpose |
|---|---|---|
| MySQL (`essedum_data`) | Internal DB | File metadata, dataset definitions, datasource configs, schema registry |
| Local Filesystem | Storage | Binary file storage in single-node / Docker deployments |
| AWS S3 / MinIO | Storage | Object storage for cloud / Kubernetes deployments |
| Azure Blob Storage | Storage | Object storage for Azure-hosted deployments |
| MySQL (external) | Adapter target | Read/write user-connected databases |
| PostgreSQL (external) | Adapter target | Read/write user-connected databases |
| REST APIs (external) | Adapter target | Fetch data from user-configured HTTP endpoints |
| GCP Cloud Storage | Adapter target | Read/write files in GCS buckets |
| AWS SageMaker / GCP Vertex AI | Adapter target | Interact with cloud ML data channels |
| Kafka / RabbitMQ | Messaging | Consume streaming data; publish data outputs |

Data Service has **no dependency on USM, ICIP, or Vibe services** at runtime.

---

## 3. Architectural Decisions

### AD-DATA1 — Storage backend abstracted behind an interface
The file server delegates all I/O to a pluggable storage backend (local, S3, Azure Blob). The selection is configuration-driven. The rest of the service — controllers, service layer, metadata DB — is identical regardless of backend. This lets the platform run on a laptop (local) or in production (S3) without code changes.

### AD-DATA2 — Adapter framework as a plugin registry
Each adapter is a self-contained module implementing a common interface. Adding a new data source type requires adding a new adapter module and registering it — no changes to the framework or existing adapters. This is the primary extension point of the service.

### AD-DATA3 — Metadata in MySQL, binaries in object storage
File metadata (name, size, project, path) is stored in MySQL for fast querying. Binary content lives in the storage backend. This separation means the database stays small and fast regardless of file sizes.

### AD-DATA4 — Per-project data isolation enforced at the service layer
Every query and file operation is filtered by the project ID extracted from the user's token. This is enforced in the service layer, not the UI. A user in Project A cannot enumerate, read, or search data belonging to Project B even with a crafted API call.

### AD-DATA5 — Lucene index co-located with the service instance
The search index runs in-process (no external search cluster required). For the current scale target (millions of documents per deployment) this is sufficient. The trade-off is that index is not shared across service instances — each instance indexes independently. If full cross-instance search is needed in future, a migration to Elasticsearch/OpenSearch is the intended path.

---

## 4. Architecturally Significant Flows

### Flow 1 — File Upload

```mermaid
sequenceDiagram
    participant U as User
    participant GW as API Gateway
    participant DATA as Data Service
    participant STORE as Storage Backend (S3/local)
    participant DB as MySQL

    U->>GW: POST /api/data/files (multipart, Bearer token)
    GW->>DATA: Forward
    DATA->>DATA: Validate project scope from token
    DATA->>DATA: Parse filename, size, MIME type
    DATA->>STORE: Stream binary to storage backend
    STORE-->>DATA: Storage path / object key
    DATA->>DB: Insert file metadata record
    DATA->>DATA: Update Lucene index (async)
    DATA-->>U: 201 Created {fileId, path}
```

### Flow 2 — Pipeline Reads from External Database via Adapter

```mermaid
sequenceDiagram
    participant ICIP as ICIP Service (via Python Executor)
    participant DATA as Data Service
    participant VAULT as Vault
    participant EXT_DB as External MySQL/PostgreSQL

    ICIP->>DATA: GET /api/data/adapters/{datasourceId}/query {sql}
    DATA->>DB: Load datasource config (host, db name, credential ref)
    DATA->>VAULT: Fetch DB credentials
    VAULT-->>DATA: username + password
    DATA->>EXT_DB: Execute query
    EXT_DB-->>DATA: Result rows
    DATA-->>ICIP: 200 OK [rows as JSON]
```

### Flow 3 — Dataset Registration with Schema

```mermaid
sequenceDiagram
    participant U as User
    participant DATA as Data Service
    participant DB as MySQL
    participant LUCENE as Lucene Index

    U->>DATA: POST /api/data/datasets {fileId, columns: [{name, type}]}
    DATA->>DB: Load file record (validate project scope)
    DATA->>DB: Insert dataset + schema columns
    DATA->>LUCENE: Index dataset name + column names
    DATA-->>U: 201 Created {datasetId}
    Note over DATA: Dataset is now available<br/>for pipeline input selection
```
