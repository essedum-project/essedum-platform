# Data Service — Scope

## Objective

Be the **single source of truth for all data** in the platform — files, datasets, datasource connections, and schema metadata. Provide a pluggable adapter layer so pipelines can read from and write to any supported storage or database without knowing the underlying technology.

---

## Functional Requirements

### File Management

| ID | Requirement |
|---|---|
| FR-DATA1 | Users can upload files and binary assets to the platform via the UI or API. Upload size limit is 500 MB per file. |
| FR-DATA2 | Users can browse, preview, download, and delete files through a folder hierarchy scoped to their project. |
| FR-DATA3 | Files can be stored on local disk, AWS S3 / MinIO, or Azure Blob Storage depending on the deployment configuration. |
| FR-DATA4 | Partial or failed uploads are cleaned up automatically — no orphaned partial files remain on storage. |

### Dataset & Schema Management

| ID | Requirement |
|---|---|
| FR-DATA5 | Users can register datasets with column schema metadata (name, type, description) for use in pipelines. |
| FR-DATA6 | The service maintains a schema registry that pipelines reference to validate their inputs and outputs. |
| FR-DATA7 | Users can connect external databases (MySQL, PostgreSQL) as named datasources and browse their schema. |
| FR-DATA8 | Datasets support CSV, Excel, and PDF as source formats. The service parses and normalises these on ingestion. |

### Data Adapters

| ID | Requirement |
|---|---|
| FR-DATA9 | The service provides a pluggable adapter framework. Each adapter implements a standard interface for read, write, and schema discovery. |
| FR-DATA10 | Supported adapters: REST API, MySQL, PostgreSQL, AWS S3 / MinIO, Azure Blob Storage, GCP Cloud Storage, AWS SageMaker, GCP Vertex AI, remote execution. |
| FR-DATA11 | Adapter credentials are stored securely and associated with a named datasource. Credentials are never returned in API responses. |
| FR-DATA12 | Adding a new adapter does not require changes to any other service. |

### Search

| ID | Requirement |
|---|---|
| FR-DATA13 | File and dataset content is indexed for full-text search using Apache Lucene. |
| FR-DATA14 | Users can search across all files and datasets within their project using keyword queries. |
| FR-DATA15 | Search index is updated automatically when files or datasets are added, updated, or deleted. |

### Streaming

| ID | Requirement |
|---|---|
| FR-DATA16 | The service can consume data from Kafka and RabbitMQ topics and make them available as pipeline inputs. |
| FR-DATA17 | The service can publish data to Kafka topics as a pipeline output. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-DATA1 | File upload and download throughput must be **≥ 100 MB/s** on local storage. Cloud storage throughput is bounded by the provider. |
| NFR-DATA2 | Dataset search queries must return results in **< 1 second** for indices up to 10 million documents. |
| NFR-DATA3 | The service must handle **concurrent uploads from multiple users** without file collision or data corruption. |
| NFR-DATA4 | Adapter connections are pooled and reused. Creating a new adapter instance must not open an unbounded number of connections. |
| NFR-DATA5 | The service is stateless. File metadata is stored in the database; binary content is stored on the configured storage backend. |
| NFR-DATA6 | Database connection pool is capped at **25 connections** to prevent MySQL exhaustion. |
| NFR-DATA7 | Datasource credentials are retrieved at runtime from the secrets manager. They are never stored as plaintext in the database. |
| NFR-DATA8 | The service exposes `/actuator/health` for Kubernetes liveness and readiness probes. |
| NFR-DATA9 | Data is scoped per project. A user in Project A cannot read, list, or search files belonging to Project B. |
