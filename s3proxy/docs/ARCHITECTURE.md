# S3Proxy — Architecture

---

## 1. Service Architecture

S3Proxy is a **protocol translation layer** — it speaks the S3 REST API to clients and translates each operation to the equivalent call on the configured jclouds backend. No business logic runs here; it is a thin translation proxy.

```mermaid
graph LR
    subgraph Clients
        PY_EXEC["Python Executors\n(boto3 / S3 SDK)"]
        DATA_SVC["Data Service\n(S3 adapter)"]
    end

    subgraph S3Proxy
        S3_API["S3 REST API\nBuckets · Objects · Multipart"]
        AUTH["Auth Handler\nAnonymous or AWS Sig v2/v4"]
        JCLOUDS["jclouds Backend Adapter\nFilesystem · Azure Blob\nGCP Storage · Swift"]
    end

    subgraph Storage
        LOCAL["Local Filesystem"]
        AZURE_BLOB["Azure Blob Storage"]
        GCS["Google Cloud Storage"]
    end

    PY_EXEC -->|S3 API calls| S3_API
    DATA_SVC -->|S3 API calls| S3_API
    S3_API --> AUTH --> JCLOUDS
    JCLOUDS --> LOCAL
    JCLOUDS --> AZURE_BLOB
    JCLOUDS --> GCS
```

---

## 2. Dependency Map

```mermaid
graph LR
    S3P["S3Proxy"]

    subgraph Backends
        FS["Local Filesystem"]
        AZURE["Azure Blob Storage"]
        GCS["GCP Cloud Storage"]
    end

    subgraph Config
        CONF["s3proxy.conf"]
    end

    S3P -->|local / Docker| FS
    S3P -->|Azure deployment| AZURE
    S3P -->|GCP deployment| GCS
    S3P -.->|reads| CONF
```

 Object storage backend for local/Docker deployments |
| Azure Blob Storage | External (HTTPS) | Object storage backend for Azure deployments |
| GCP Cloud Storage | External (HTTPS) | Object storage backend for GCP deployments |
| `s3proxy.conf` | Local file | All configuration: endpoint, auth mode, backend type, credentials |

S3Proxy has **no dependency on any other Essedum service**.

---

## 3. Architectural Decisions

### AD-S3P1 — Vendored open-source project, not a custom service
**Decision:** S3Proxy is included as the upstream open-source `gaul/s3proxy` project with no custom application code added.
**Reason:** The S3 protocol translation problem is fully solved by the upstream project. Building a custom implementation would duplicate significant work. All Essedum-specific configuration is in `s3proxy.conf`.

### AD-S3P2 — Anonymous access for internal cluster deployments
**Decision:** S3Proxy is configured with `s3proxy.authorization=none` for internal Essedum deployments.
**Reason:** Access is controlled at the Kubernetes network policy level — only cluster-internal services reach S3Proxy. Requiring AWS credential validation for internal traffic would add complexity without meaningful security benefit.

---

## 4. Architecturally Significant Flows

### Flow 1 — Python Executor Uploads Artifact to Local Storage

```mermaid
sequenceDiagram
    participant PY as Python Executor
    participant S3P as S3Proxy
    participant FS as Local Filesystem

    PY->>S3P: PUT /bucket/project/artifacts/model.pkl (boto3)
    S3P->>S3P: Validate bucket + object key
    S3P->>FS: Write file to basedir/bucket/project/artifacts/model.pkl
    FS-->>S3P: Write complete
    S3P-->>PY: 200 OK (ETag)
```
