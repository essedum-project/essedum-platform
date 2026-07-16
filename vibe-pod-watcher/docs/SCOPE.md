# Vibe Pod Watcher — Scope

## Objective

Provide a **Kubernetes pod monitoring and management API** for the Vibe coding platform. The service watches pods and deployments in the `vibe-apps`, `vibe-mcp`, and `vibe-agents` namespaces, streams live pod logs over Socket.IO, and exposes REST endpoints for listing, inspecting, and deleting pods and deployments. It is the observability and control plane for dynamically spawned Vibe coding session containers.

---

## Functional Requirements

### Namespace & Pod Inspection

| ID | Requirement |
|---|---|
| FR-VPW1 | The service returns the list of watched Kubernetes namespaces via `GET /api/namespaces`. |
| FR-VPW2 | The service lists pods across all watched namespaces (or a specified namespace) via `GET /api/pods`, including pod name, status, namespace, node, IP, age, and container details. |
| FR-VPW3 | The service retrieves recent log output from a specific pod via `GET /api/pods/{pod_name}/logs`. |

### Deployment Inspection

| ID | Requirement |
|---|---|
| FR-VPW4 | The service lists Kubernetes Deployments in the watched namespaces via `GET /api/deployments`, including replica counts and conditions. |

### Pod & Deployment Deletion

| ID | Requirement |
|---|---|
| FR-VPW5 | The service deletes a specific pod via `DELETE /api/pods/{pod_name}`. |
| FR-VPW6 | The service deletes a Deployment and its associated Service and Secrets via `DELETE /api/deployments/{deployment_name}`. |

### Real-Time Log Streaming

| ID | Requirement |
|---|---|
| FR-VPW7 | Clients can subscribe to live log streaming for a specific pod by emitting the `stream_logs` Socket.IO event with `{pod_name, namespace}`. Log lines are pushed to the client as `log_line` events. |
| FR-VPW8 | Log streaming for a specific pod can be stopped by emitting the `stop_log_stream` Socket.IO event. All active streams for a client are stopped on Socket.IO `disconnect`. |

### Pipeline Pod Monitoring

| ID | Requirement |
|---|---|
| FR-VPW9 | The service exposes filtered views of pipeline execution pods by status: `GET /api/pipeline-pods` (all), `/running`, `/pending`, `/success`, `/failed`, `/inactive`. |

### Health

| ID | Requirement |
|---|---|
| FR-VPW10 | A health check is available at `GET /health`. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-VPW1 | Log streaming runs in a per-client background thread. A `threading.Event` stop flag per Socket.IO session allows clean thread shutdown on disconnect or explicit stop. |
| NFR-VPW2 | The service connects to Kubernetes using in-cluster config (`load_incluster_config`) when running in the cluster, falling back to `load_kube_config` for local development. |
| NFR-VPW3 | Watched namespaces are fixed to `vibe-apps`, `vibe-mcp`, and `vibe-agents`. Namespace filtering per request is supported via the `namespace` query parameter. |
| NFR-VPW4 | Socket.IO ping timeout is **300 seconds** to keep log streams open during long-running coding sessions. |
