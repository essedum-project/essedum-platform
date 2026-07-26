# ADK Code Builder Deployer — Scope

## Objective

Build container images from agent source code and deploy them as running services in Kubernetes (or Docker for local development). The service receives a build-and-deploy request via Socket.IO, downloads the source from S3/MinIO, invokes BuildKit to produce a container image, pushes it to an in-cluster registry, and deploys it as a Kubernetes Deployment and Service — streaming real-time build progress back to the caller.

---

## Functional Requirements

### Deployment Management

| ID | Requirement |
|---|---|
| FR-ADK1 | The service accepts a delete-deployment request via `POST /api/delete-deployment` or the `delete_deployment` Socket.IO event, removing the Kubernetes Deployment, Service, and associated Secrets (or Docker container in Docker mode). |
| FR-ADK2 | The service lists active deployments in the target namespace via `GET /api/list-deployments`. |
| FR-ADK3 | Deployment names are sanitized to valid Kubernetes DNS-label format (lowercase, alphanumeric + hyphens, no leading digits) before any K8s API call. |

### Build and Deploy Pipeline (Socket.IO)

| ID | Requirement |
|---|---|
| FR-ADK4 | Clients connect via Socket.IO and trigger a build+deploy pipeline by emitting the `start_pipeline` event with a payload describing the source location and target configuration. |
| FR-ADK5 | The service downloads the agent source code archive from S3 or MinIO to a temporary directory. |
| FR-ADK6 | The service extracts the source archive and invokes BuildKit (`buildctl`) to build a container image from the source, streaming build output back to the client via `pipeline_update` events. |
| FR-ADK7 | The built image is pushed to the configured in-cluster container registry. |
| FR-ADK8 | The service creates a Kubernetes Deployment and Service for the agent in the target namespace, injecting any required secrets as environment variables. |
| FR-ADK9 | Each pipeline step emits a timestamped `pipeline_update` Socket.IO event to the connected client so build progress is visible in real time. |
| FR-ADK10 | The service supports both Kubernetes mode (default) and Docker mode (for local development), selected via the `DEPLOY_MODE` environment variable. |

### Health

| ID | Requirement |
|---|---|
| FR-ADK11 | A health check endpoint is available at `GET /health`. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-ADK1 | Socket.IO ping timeout is set to **300 seconds** to accommodate long container builds without connection drops. |
| NFR-ADK2 | Deployment names are sanitized with regex (`[^a-z0-9-]` → `-`) before any Kubernetes API call to prevent invalid resource names. |
| NFR-ADK3 | BuildKit address is configurable via `BUILDKIT_ADDR` environment variable (default: `tcp://buildkitd:1234`). |
| NFR-ADK4 | The target namespace is configurable per request. No hardcoded namespace is assumed. |
| NFR-ADK5 | AWS/MinIO credentials used for source download are supplied per request and never persisted by the service. |
