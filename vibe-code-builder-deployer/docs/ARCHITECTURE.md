# Vibe Code Builder Deployer — Architecture

---

## 1. Service Architecture

Identical in pattern to the ADK Code Builder Deployer — Flask + Socket.IO with a long-running pipeline handler. The key differences: Kubernetes-only (no Docker mode), uses a ClusterIP registry URL configured for containerd compatibility, and targets Vibe coding session workloads.

```mermaid
graph TB
    subgraph Inbound
        UI["Vibe UI\n(Socket.IO client)"]
    end

    subgraph Vibe Code Builder Deployer
        REST["REST API\n/api/delete-deployment\n/api/list-deployments · /health"]
        SIO["Socket.IO\nstart_pipeline · delete_deployment\nconnect · disconnect"]
        PIPELINE["Build & Deploy Pipeline\n1. Download source (S3/MinIO)\n2. Extract archive\n3. buildctl image build\n4. Push to registry\n5. K8s Deployment + Service + Secret"]
        LOG["Event Broadcaster\npipeline_update events → client"]
    end

    subgraph Infrastructure
        K8S["Kubernetes API\nDeployments · Services · Secrets"]
        BUILDKIT["BuildKit daemon\ntcp://buildkitd:1234"]
        REGISTRY["In-Cluster Registry\nClusterIP :5000"]
        S3["AWS S3 / MinIO\nSource code archives"]
    end

    UI -->|Socket.IO| SIO
    UI -->|HTTP| REST
    SIO --> PIPELINE
    PIPELINE --> S3 & BUILDKIT & K8S
    BUILDKIT --> REGISTRY
    PIPELINE --> LOG --> UI
    REST --> K8S
```

---

## 2. Dependency Map

```mermaid
graph LR
    VCB["Vibe Code Builder"]

    subgraph K8s
        K8S_API["Kubernetes API"]
        REG["In-Cluster Registry\nClusterIP :5000"]
    end

    subgraph Build
        BK["BuildKit daemon\ntcp://buildkitd:1234"]
    end

    subgraph Storage
        S3_MINIO["AWS S3 / MinIO\nSource archives"]
    end

    VCB -->|deploy| K8S_API
    VCB -->|build image| BK
    BK -->|push image| REG
    VCB -->|download source| S3_MINIO
```

| Dependency | Type | Purpose |
|---|---|---|
| Kubernetes API | Internal (in-cluster) | Create/delete Deployments, Services, Secrets |
| BuildKit daemon | Internal (TCP) | Build container images from source |
| In-cluster registry (ClusterIP) | Internal (HTTP) | Store and serve built images |
| AWS S3 / MinIO | External (HTTP/SDK) | Download Vibe agent source code archives |

---

## 3. Architectural Decisions

### AD-VCB1 — ClusterIP registry for containerd compatibility
**Decision:** The in-cluster registry is addressed by its ClusterIP (e.g., `10.104.220.183:5000`) rather than a DNS service name.
**Reason:** containerd, used as the Kubernetes container runtime, requires the registry URL to match exactly what is configured in its `registries.conf`. ClusterIP is stable and avoids containerd's DNS resolution timing issues during image pull at pod startup.

### AD-VCB2 — Kubernetes-only (no Docker mode)
**Decision:** Unlike the ADK deployer, this service has no Docker fallback mode.
**Reason:** Vibe coding sessions are always deployed to Kubernetes. The Docker mode complexity is not needed, and removing it reduces the code surface and eliminates a potential configuration error path.

---

## 4. Architecturally Significant Flows

### Flow 1 — Build and Deploy Vibe Agent Container

```mermaid
sequenceDiagram
    participant UI as Vibe UI (Socket.IO)
    participant SVC as Vibe Deployer
    participant S3 as S3 / MinIO
    participant BK as BuildKit
    participant REG as In-Cluster Registry
    participant K8S as Kubernetes

    UI->>SVC: emit start_pipeline {source_url, agent_config}
    SVC->>UI: pipeline_update {step: "downloading"}
    SVC->>S3: Download source archive
    SVC->>UI: pipeline_update {step: "building"}
    SVC->>BK: buildctl build --output image:registry/vibe-agent:tag
    BK->>REG: Push image
    SVC->>UI: pipeline_update {step: "deploying"}
    SVC->>K8S: Create Secret
    SVC->>K8S: Create Deployment
    SVC->>K8S: Create Service
    SVC->>UI: pipeline_update {step: "done", status: "SUCCESS"}
```
