# AKS Deployment — Architecture & Reference

> **Full deployment architecture details** (namespace topology, ingress routing, HPA, persistent volumes, secrets, registry): [K8DEPLOYMENT.md](K8DEPLOYMENT.md)

This file serves as a quick reference for the manifest files in this directory.

---

## Manifest Inventory

### Ingress & Networking

| File | Purpose |
|---|---|
| `ingress-nginx-deploy.yaml` | Deploy the Nginx Ingress Controller into `ingress-nginx` namespace |
| `metallib-config.yaml` | MetalLB LoadBalancer configuration for bare-metal / on-prem clusters |
| `ingress.yaml` | Main frontend ingress — `lfn.essedum.anuket.iol.unh.edu` → frontend :8084 |
| `essedum-api-ingress.yaml` | API ingress — `essedum.az.ad.idemo-ppc.com` → API Gateway :8080 |
| `essedum-frontend-ingress.yaml` | Shell frontend ingress — `essedum.az.ad.idemo-ppc.com` → shell :8084 |
| `essedum-frontend-mfe-ingress.yaml` | MFE path ingress — `/agent`, `/data-ops`, `/integration`, `/vibe-studio` |
| `keycloak-ingress.yaml` | Keycloak ingress — `essedum.az.ad.idemo-ppc.com` → Keycloak :8443 |
| `vibe-code-builder-ingress.yaml` | Vibe Code Builder service ingress (cluster-internal) |
| `vibe-pod-watcher-ingress.yaml` | Vibe Pod Watcher service ingress (cluster-internal) |
| `goose-ingress.yaml` | Goose AI service ingress |
| `essedum-auth-config.yaml` | Auth-related config map |

### Frontend Deployments

| File | Deployment | Service Port |
|---|---|---|
| `essedum-ui.yaml` | `essedum-frontend-ui` (5 replicas) | 8082, 8084 |
| `essedum-frontend-shell.yaml` | `essedum-frontend-shell` | 8082, 8084 |
| `essedum-frontend-agent.yaml` | `essedum-frontend-agent` (Agent Designer UI) | 8082 |
| `essedum-frontend-data-ops.yaml` | `essedum-frontend-data-ops` | 8082 |
| `essedum-frontend-integration.yaml` | `essedum-frontend-integration` | 8082 |
| `essedum-frontend-vibe-studio.yaml` | `essedum-frontend-vibe-studio` | 8082 |
| `essedum-ui-service.yaml` | Service for `essedum-frontend-ui` | — |
| `essedum-ui-hpa.yaml` | HPA for frontend UI (1–5 replicas, CPU/Mem 50%) | — |

### Backend Deployments

| File | Deployment | Image | Port |
|---|---|---|---|
| `essedum-backend.yaml` | `essedum-backend-api-gateway` | `essedum-api-gateway` | 8080 |
| `essedum-backend-hpa.yaml` | HPA for gateway (1–5 replicas, CPU/Mem 50%) | — | — |
| `usm-service.yaml` | `essedum-backend-usm` | `essedum-usm-service:v15` | 8081 |
| `icip-service.yaml` | `essedum-backend-icip` | `essedum-icip-service:v17` | 8082 |
| `data-service.yaml` | `essedum-backend-data` | `essedum-data-service:v18` | 8083 |
| `vibe-service.yaml` | `essedum-backend-vibe` | `essedum-vibe-service:v15` | 8084 |
| `pyjob-executor.yaml` | `pyjob-executor` | `pyjob-excecutor:v15` | 5000 |
| `pyjob-executor-hpa.yaml` | HPA for Python Executor (1–3 replicas, CPU/Mem 70%) | — | — |

### Infrastructure Deployments

| File | Deployment | Image | Port | Volume |
|---|---|---|---|---|
| `keycloak_deployment.yaml` | `keycloak` | `keycloak:26.2.3` | 8443 | — |
| `keycloak-hpa.yaml` | HPA for Keycloak (1–2 replicas, CPU/Mem 70%) | — | — | — |
| `mysql_deployment_v3.yaml` | `mysql` | `mysql:8.0` | 3306 | 5 Gi |
| `mysql_file_pv.yaml` | PV for MySQL | — | — | `/var/lib/mysql` |
| `qdrant_deployment.yaml` | `qdrant` | `qdrant/qdrant` | 6333 | 10 Gi |
| `qdrantfilepv.yaml` | PV for Qdrant | — | — | `/qdrant/storage` |
| `langflow-deployment-with-tls.yaml` | `langflow` | — | 7860 | 5 Gi |
| `langflow_file_pv.yaml` | PV for Langflow | — | — | `/app/langflow` |

### Vibe Platform Deployments

| File | Deployment | Image | Port |
|---|---|---|---|
| `proxy-deployment.yml` | `proxy-service` | `proxy-service:v15` | 8080 |
| `vibe-code-builder-deployment.yml` | `vibe-code-builder-service` | `vibe-code-builder-service:v15` | 5000 |
| `vibe-code-builder-configmap.yml` | ConfigMap for Vibe Code Builder | — | — |
| `vibe-pod-watcher-deployment.yaml` | `vibe-pod-watcher` | `vibe-pod-watcher:v16` | 5000 |
| `vibe-pod-watcher-rbac.yaml` | RBAC for Pod Watcher | — | — |
| `builder-deployment.yml` | `builder-service` | `builder-service:v15` | 5000 |
| `builder-rbac.yml` | RBAC for Builder | — | — |
| `goosed-deployment.yaml` | Goose AI daemon | — | — |
| `goose-ui-deployment.yaml` | Goose UI | — | — |

### Namespaces & RBAC

| File | Purpose |
|---|---|
| `vibe-apps-namespace.yaml` | Create `vibe-apps` namespace |
| `vibe-apps-rbac.yaml` | RBAC allowing Pod Watcher / Code Builder to manage pods in `vibe-apps` |
| `vibe-mcp-namespace.yaml` | Create `vibe-mcp` namespace |
| `vibe-mcp-rbac.yaml` | RBAC for MCP pods |
| `vibe-agents-namespace.yaml` | Create `vibe-agents` namespace |
| `vibe-agents-rbac.yaml` | RBAC for agent pods |

---

## Deployment Startup Order

```
1. ingress-nginx-deploy.yaml       ← Ingress controller first
2. metallib-config.yaml            ← Load balancer config
3. vibe-*-namespace.yaml           ← Namespaces before workloads
4. vibe-*-rbac.yaml                ← RBAC before workloads that need it
5. mysql_file_pv.yaml              ← PVs before PVCs
   qdrantfilepv.yaml
   langflow_file_pv.yaml
6. mysql_deployment_v3.yaml        ← Databases before services that depend on them
   qdrant_deployment.yaml
   langflow-deployment-with-tls.yaml
7. keycloak_deployment.yaml        ← Auth before backend
8. essedum-backend.yaml            ← API Gateway + backend services
   usm-service.yaml
   icip-service.yaml
   data-service.yaml
   vibe-service.yaml
9. pyjob-executor.yaml             ← Job executor after backend
10. proxy-deployment.yml           ← Support services
    vibe-code-builder-deployment.yml
    vibe-pod-watcher-deployment.yaml
    builder-deployment.yml
    goosed-deployment.yaml
11. essedum-ui.yaml                ← Frontend last
    essedum-frontend-*.yaml
12. *-ingress.yaml                 ← Ingress rules after services exist
13. *-hpa.yaml                     ← HPA after deployments exist
```

---

## Deploy Script

The `deploy.sh` script in this directory applies all manifests in the correct order. Review and update image tags and namespace values before running in a new environment.
