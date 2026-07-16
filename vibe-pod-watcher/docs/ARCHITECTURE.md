# Vibe Pod Watcher — Architecture

---

## 1. Service Architecture

A Flask + Socket.IO service that bridges the Kubernetes API to the Vibe UI. REST endpoints call the K8s API synchronously; log streaming uses a dedicated background thread per Socket.IO connection to tail pod logs and push lines as events.

```mermaid
graph TB
    subgraph Inbound
        UI["Vibe UI\n(REST + Socket.IO)"]
    end

    subgraph Vibe Pod Watcher
        REST["REST API\n/health · /api/namespaces · /api/pods\n/api/deployments · /api/pipeline-pods/*"]
        SIO["Socket.IO\nstream_logs · stop_log_stream · disconnect"]
        LOG_THREAD["Per-Client Log Thread\nK8s log_stream → socket emit\nStop flag per sid"]
        K8S_CLIENT["Kubernetes Client\nCoreV1Api · AppsV1Api\nIn-cluster or kubeconfig"]
    end

    subgraph Kubernetes
        PODS["Pods\nvibe-apps · vibe-mcp · vibe-agents"]
        DEPLOYS["Deployments"]
        SECRETS["Secrets"]
        SVCS["Services"]
    end

    UI -->|HTTP| REST
    UI -->|Socket.IO| SIO
    REST --> K8S_CLIENT
    SIO --> LOG_THREAD
    LOG_THREAD --> K8S_CLIENT
    K8S_CLIENT --> PODS & DEPLOYS & SECRETS & SVCS
    LOG_THREAD -->|log_line events| UI
```

---

## 2. Dependency Map

```mermaid
graph LR
    VPW["Vibe Pod Watcher"]

    subgraph K8sAPI
        K8S["Kubernetes API\nCoreV1Api · AppsV1Api"]
    end

    subgraph Namespaces
        VA["vibe-apps"]
        VM["vibe-mcp"]
        VG["vibe-agents"]
    end

    VPW -->|list / delete / stream logs| K8S
    K8S --- VA & VM & VG
```

 List/get/delete pods and deployments, stream pod logs |
| Kubernetes namespaces (`vibe-apps`, `vibe-mcp`, `vibe-agents`) | Internal | Target namespaces for all K8s operations |

No external services or databases. All state is read from the Kubernetes API.

---

## 3. Architectural Decisions

### AD-VPW1 — Per-client log streaming thread with stop flag
**Decision:** Each Socket.IO client that subscribes to pod logs gets a dedicated background thread. A `threading.Event` stop flag is keyed by `socket.sid` and signals the thread to exit when the client disconnects or emits `stop_log_stream`.
**Reason:** The Kubernetes Python SDK's `log_stream` is a blocking iterator. Running it in a background thread prevents it from blocking the event loop. The per-sid stop flag ensures clean thread shutdown without joining threads on every frame.

### AD-VPW2 — In-cluster config with kubeconfig fallback
**Decision:** The service calls `load_incluster_config()` at startup; if it fails (i.e., running outside a cluster), it falls back to `load_kube_config()`.
**Reason:** In production the service runs as a Kubernetes pod with a mounted ServiceAccount token. The fallback supports local development without changing any code or configuration.

---

## 4. Architecturally Significant Flows

### Flow 1 — Real-Time Pod Log Streaming

```mermaid
sequenceDiagram
    participant UI as Vibe UI (Socket.IO)
    participant SVC as Pod Watcher
    participant THREAD as Log Thread
    participant K8S as Kubernetes API

    UI->>SVC: emit stream_logs {pod_name, namespace}
    SVC->>SVC: Create stop_event for sid
    SVC->>THREAD: Start background thread
    THREAD->>K8S: read_namespaced_pod_log (follow=True, stream=True)
    loop Each log line
        K8S-->>THREAD: log line
        THREAD->>UI: emit log_line {pod_name, line}
    end
    UI->>SVC: emit stop_log_stream
    SVC->>THREAD: stop_event.set()
    THREAD->>THREAD: Exit loop
```

### Flow 2 — Deployment Deletion

```mermaid
sequenceDiagram
    participant UI as Vibe UI
    participant SVC as Pod Watcher
    participant K8S as Kubernetes API

    UI->>SVC: DELETE /api/deployments/{deployment_name}?namespace=vibe-apps
    SVC->>K8S: delete_namespaced_deployment(name, namespace)
    SVC->>K8S: delete_namespaced_service(name, namespace)
    SVC->>K8S: delete_namespaced_secret(name, namespace)
    K8S-->>SVC: 200 OK (each)
    SVC-->>UI: 200 OK {deleted: [deployment, service, secret]}
```
