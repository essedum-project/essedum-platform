# Essedum Platform — Kubernetes Manifests

Production-ready Kubernetes manifests converted from the Docker Compose stack.

## Cluster Requirements

| Requirement | Value |
|---|---|
| Namespace | `essedum` |
| Node selector | `kubernetes.io/hostname: essedum-1` |
| Ingress class | `nginx` |
| Storage class | `manual` (hostPath) |

All pods are pinned to the node **essedum-1** via `nodeSelector`.

---

## Directory Structure

```
k8s/
├── namespace.yaml                  # essedum namespace
├── configmap.yaml                  # Non-sensitive config + MySQL init SQL
├── secret.yaml                     # Sensitive credentials (update before deploy!)
├── ingress-controller.yaml         # NGINX Ingress Controller + IngressClass
├── ingress.yaml                    # Ingress routing rules for all services
│
├── volumes/                        # PersistentVolume + PersistentVolumeClaim pairs
│   ├── mysql-pv.yaml
│   ├── qdrant-pv.yaml
│   ├── minio-pv.yaml
│   ├── langfuse-minio-pv.yaml
│   ├── langflow-pv.yaml
│   ├── langflow-postgres-pv.yaml
│   ├── langfuse-postgres-pv.yaml
│   ├── litellm-postgres-pv.yaml
│   ├── litellm-pv.yaml             # config + data PVCs for LiteLLM
│   ├── clickhouse-pv.yaml          # data + logs PVCs
│   └── ollama-pv.yaml
│
├── mysql/                          # MySQL 8.0 + init scripts
├── qdrant/                         # Qdrant vector DB
├── keycloak/                       # Keycloak 25 IAM
├── backend/                        # Spring Boot backend (essedum/backend:latest)
├── frontend/                       # NGINX frontend (essedum/frontend:latest)
├── py-job-executor/                # Python job executor
├── py-job-sagemaker-executer/      # SageMaker job executor
├── py-job-vertex-executer/         # Vertex AI job executor
├── proxy-service/                  # Proxy service
├── buildkitd/                      # BuildKit daemon (privileged)
├── adk-code-builder-deployer/      # ADK code builder/deployer
├── minio/                          # MinIO object storage (platform)
├── ollama/                         # Ollama LLM server
├── litellm-postgres/               # PostgreSQL for LiteLLM
├── litellm/                        # LiteLLM proxy
├── langflow-postgres/              # PostgreSQL for Langflow
├── langflow/                       # Langflow AI pipeline builder
├── langfuse-postgres/              # PostgreSQL for Langfuse
├── clickhouse/                     # ClickHouse analytics DB
├── redis/                          # Redis cache/queue
├── langfuse-minio/                 # MinIO object storage (Langfuse)
├── minio-setup/                    # One-time Kubernetes Job — creates MinIO bucket
├── langfuse-worker/                # Langfuse background worker
└── langfuse-web/                   # Langfuse web UI
```

---

## Ingress Host Routing

Add entries to your `/etc/hosts` (or DNS) pointing to the node IP:

```
<NODE-IP>  essedum.local
<NODE-IP>  api.essedum.local
<NODE-IP>  keycloak.essedum.local
<NODE-IP>  langflow.essedum.local
<NODE-IP>  langfuse.essedum.local
<NODE-IP>  litellm.essedum.local
<NODE-IP>  minio.essedum.local
<NODE-IP>  minio-console.essedum.local
<NODE-IP>  ollama.essedum.local
<NODE-IP>  proxy.essedum.local
<NODE-IP>  adk.essedum.local
<NODE-IP>  qdrant.essedum.local
```

The NGINX Ingress Controller is exposed as a NodePort:
- HTTP → `<NODE-IP>:30080`
- HTTPS → `<NODE-IP>:30443`

---

## Deployment Order

Apply manifests in this order to respect dependencies:

```bash
# 1. Ingress controller (cluster-scoped, separate namespace)
kubectl apply -f k8s/ingress-controller.yaml

# 2. Namespace
kubectl apply -f k8s/namespace.yaml

# 3. ConfigMap and Secret (EDIT secret.yaml FIRST with real credentials)
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# 4. Persistent volumes and claims
kubectl apply -f k8s/volumes/

# 5. Infrastructure — databases and caches
kubectl apply -f k8s/mysql/
kubectl apply -f k8s/qdrant/
kubectl apply -f k8s/keycloak/
kubectl apply -f k8s/redis/
kubectl apply -f k8s/clickhouse/
kubectl apply -f k8s/minio/
kubectl apply -f k8s/langfuse-minio/
kubectl apply -f k8s/ollama/

# 6. Database tiers
kubectl apply -f k8s/litellm-postgres/
kubectl apply -f k8s/langflow-postgres/
kubectl apply -f k8s/langfuse-postgres/

# 7. One-time setup jobs
kubectl apply -f k8s/minio-setup/
kubectl wait --for=condition=complete job/minio-setup -n essedum --timeout=120s

# 8. Application services
kubectl apply -f k8s/buildkitd/
kubectl apply -f k8s/litellm/
kubectl apply -f k8s/langflow/
kubectl apply -f k8s/langfuse-worker/
kubectl apply -f k8s/langfuse-web/
kubectl apply -f k8s/adk-code-builder-deployer/
kubectl apply -f k8s/proxy-service/
kubectl apply -f k8s/py-job-executor/
kubectl apply -f k8s/py-job-sagemaker-executer/
kubectl apply -f k8s/py-job-vertex-executer/

# 9. Main application
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/

# 10. Ingress rules
kubectl apply -f k8s/ingress.yaml
```

Or apply everything at once (after applying the controller):
```bash
kubectl apply -f k8s/ingress-controller.yaml
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/volumes/
kubectl apply -R -f k8s/
```

---

## Before Deploying — Update Secrets

Edit [k8s/secret.yaml](secret.yaml) and replace all placeholder values:

| Key | Description |
|---|---|
| `ENCRYPTION_KEY` / `ENCRYPTION_SALT` | Backend encryption |
| `MYSQL_ROOT_PASSWORD` | MySQL root password |
| `KEYCLOAK_ADMIN_PASSWORD` | Keycloak admin password |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | MinIO credentials |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth app |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | AWS credentials |
| `LITELLM_MASTER_KEY` | LiteLLM API master key |
| `LANGFLOW_SECRET_KEY` | Langflow secret |
| `NEXTAUTH_SECRET` / `SALT` / `LANGFUSE_ENCRYPTION_KEY` | Langfuse secrets |
| `CLICKHOUSE_PASSWORD` | ClickHouse password |
| `REDIS_PASSWORD` | Redis password |

> **Security**: Never commit `secret.yaml` with real values to version control.
> Use a secrets manager (HashiCorp Vault, AWS Secrets Manager, Sealed Secrets, etc.) in production.

---

## Custom Images

The following services are built from source and must be built/pushed to your registry before deploying:

| Service | Image Placeholder |
|---|---|
| Backend | `essedum/backend:latest` |
| Frontend | `essedum/frontend:latest` |
| Proxy Service | `essedum/proxy-service:latest` |
| Py-Job Executor | `essedum/py-job-executor:latest` |
| Py-Job SageMaker | `essedum/py-job-sagemaker-executer:latest` |
| Py-Job Vertex | `essedum/py-job-vertex-executer:latest` |
| ADK Builder | `essedum/adk-code-builder-deployer:latest` |

Update the `image:` fields in the respective `deployment.yaml` files with your registry path.

---

## Persistent Data Locations (hostPath on essedum-1)

| PV | Host Path |
|---|---|
| `mysql-pv` | `/data/essedum/mysql` |
| `qdrant-pv` | `/data/essedum/qdrant` |
| `minio-pv` | `/data/essedum/minio` |
| `langfuse-minio-pv` | `/data/essedum/langfuse-minio` |
| `langflow-pv` | `/data/essedum/langflow` |
| `langflow-postgres-pv` | `/data/essedum/langflow-postgres` |
| `langfuse-postgres-pv` | `/data/essedum/langfuse-postgres` |
| `litellm-postgres-pv` | `/data/essedum/litellm-postgres` |
| `litellm-config-pv` | `/data/essedum/litellm/config` |
| `litellm-data-pv` | `/data/essedum/litellm/data` |
| `clickhouse-pv` | `/data/essedum/clickhouse/data` |
| `clickhouse-logs-pv` | `/data/essedum/clickhouse/logs` |
| `ollama-pv` | `/data/essedum/ollama` |

> Copy the LiteLLM config file to `/data/essedum/litellm/config/config.yaml` on `essedum-1` before starting LiteLLM.
