# Vibe Code Builder Deployer — Scope

## Objective

Build container images for Vibe coding session agents and deploy them as running Kubernetes services. The service receives a build-and-deploy request via Socket.IO, downloads source code from S3/MinIO, invokes BuildKit to produce a container image, pushes it to an in-cluster registry, and creates a Kubernetes Deployment and Service — streaming real-time build progress back to the caller. It is the Vibe-specific counterpart to the ADK Code Builder Deployer and targets the Vibe platform exclusively (Kubernetes-only, no Docker mode).

---

## Functional Requirements

### Deployment Management

| ID | Requirement |
|---|---|
| FR-VCB1 | The service accepts a delete-deployment request via `POST /api/delete-deployment` or the `delete_deployment` Socket.IO event, removing the Kubernetes Deployment, Service, and associated Secrets. |
| FR-VCB2 | The service lists active deployments in the target namespace via `GET /api/list-deployments`. |
| FR-VCB3 | Deployment names are sanitized to valid Kubernetes DNS-label format before any K8s API call. |

### Build and Deploy Pipeline (Socket.IO)

| ID | Requirement |
|---|---|
| FR-VCB4 | Clients connect via Socket.IO and trigger a build+deploy pipeline by emitting the `start_pipeline` event. |
| FR-VCB5 | The service downloads the Vibe agent source code archive from S3 or MinIO. |
| FR-VCB6 | The service invokes BuildKit (`buildctl`) to build a container image, streaming build output to the client via `pipeline_update` events. |
| FR-VCB7 | The built image is pushed to the configured in-cluster container registry. |
| FR-VCB8 | The service creates a Kubernetes Deployment and Service for the Vibe agent, injecting required secrets as environment variables. |
| FR-VCB9 | Each pipeline step emits a timestamped `pipeline_update` Socket.IO event to the connected client. |

### Health

| ID | Requirement |
|---|---|
| FR-VCB10 | A health check endpoint is available at `GET /health`. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-VCB1 | Socket.IO ping timeout is **300 seconds** to accommodate long container builds. |
| NFR-VCB2 | Maximum Socket.IO HTTP buffer size is **10 MB** for large build payloads. |
| NFR-VCB3 | The service operates in **Kubernetes mode only** — no Docker fallback. |
| NFR-VCB4 | Registry URL is configurable via `REGISTRY_URL` environment variable. BuildKit address via `BUILDKIT_ADDR`. |
| NFR-VCB5 | Deployment names are sanitized with regex before any Kubernetes API call. |
