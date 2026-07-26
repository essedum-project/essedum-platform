# S3Proxy — Scope

## Objective

Provide an **S3-compatible API facade** over non-S3 storage backends. S3Proxy (open-source, `gaul/s3proxy`) accepts standard Amazon S3 API calls and translates them to the underlying storage provider — including local filesystem, Azure Blob Storage, Google Cloud Storage, and others. In the Essedum platform, it is used to expose a local filesystem or alternative cloud storage as an S3-compatible endpoint so pipeline executors and data adapters that expect S3 can work without modification.

---

## Functional Requirements

| ID | Requirement |
|---|---|
| FR-S3P1 | The service implements the Amazon S3 REST API: `CreateBucket`, `DeleteBucket`, `ListBuckets`, `PutObject`, `GetObject`, `DeleteObject`, `ListObjectsV2`, `HeadObject`, `HeadBucket`, `CopyObject`, `MultipartUpload`. |
| FR-S3P2 | The service supports the local filesystem as a storage backend, mapping S3 buckets to directories and objects to files. |
| FR-S3P3 | The service supports Azure Blob Storage, GCP Cloud Storage, and other jclouds-supported backends as storage targets. |
| FR-S3P4 | The service supports anonymous access mode (no AWS credential validation) for internal deployments where access is controlled at the network layer. |
| FR-S3P5 | The service supports AWS Signature v2 and v4 authentication for deployments where credential validation is required. |
| FR-S3P6 | Storage backend, endpoint, credentials, and access mode are configured via a properties file (`s3proxy.conf`) — no code changes are required to switch backends. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-S3P1 | The service is the upstream open-source project `gaul/s3proxy` version 2.x, built with Java 11+. It is included as a vendored component in the platform. |
| NFR-S3P2 | The listening endpoint is configurable via `s3proxy.endpoint` in the properties file. |
| NFR-S3P3 | In local filesystem mode, the base directory for all bucket/object storage is set via `jclouds.filesystem.basedir`. |
| NFR-S3P4 | For production deployments, TLS termination is handled externally (Nginx or Kubernetes Ingress) — S3Proxy itself listens on plain HTTP in the Essedum deployment. |
