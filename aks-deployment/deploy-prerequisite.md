# Essedum Platform — Deployment Prerequisites

Run these steps **once per cluster** before the first `./deploy.sh` execution.
`deploy.sh` itself does **not** create namespaces, secrets, or persistent volumes —
it only verifies they exist and aborts if anything is missing.

---

## 1. Namespaces

```bash
kubectl create namespace aipns
kubectl create namespace vibe-apps
kubectl create namespace vibe-mcp
kubectl create namespace vibe-agents
```

---

## 2. RBAC (Vibe Studio)

```bash
kubectl apply -f aks-deployment/vibe-apps-rbac.yaml
kubectl apply -f aks-deployment/vibe-mcp-rbac.yaml
kubectl apply -f aks-deployment/vibe-agents-rbac.yaml
```

---

## 3. Persistent Volumes & Claims

> **Important:** Only run on a **new** cluster. Never run on a cluster that already has data —
> re-applying these manifests while MySQL/Qdrant are running is safe (no-op), but deleting
> and re-creating the PVs will destroy all database data.

```bash
kubectl apply -f aks-deployment/mysql_file_pv.yaml
kubectl apply -f aks-deployment/qdrantfilepv.yaml
```

Verify they are Bound before proceeding:

```bash
kubectl get pvc -n aipns
# Expected: mysql-pvc Bound, qdrant-pvc Bound
```

If `qdrant-pvc` is `Pending`, ensure `qdrantfilepv.yaml` has `nodeAffinity` matching your node label.

---

## 4. Secrets

Replace placeholder values (`<...>`) with actual credentials for your environment.

### 4a. Database secret

```bash
kubectl create secret generic essedum-db-secret -n aipns \
  --from-literal=MYSQL_PASSWORD=<db-password> \
  --from-literal=MYSQL_USER=root \
  --from-literal=MYSQL_DATASOURCE_URL=jdbc:mysql://mysql.aipns.svc.cluster.local:3306/essedum
```

### 4b. Keycloak admin secret

```bash
kubectl create secret generic keycloak-admin-secret -n aipns \
  --from-literal=username=admin \
  --from-literal=password=<keycloak-admin-password>
```

### 4c. MinIO / S3 secret

```bash
kubectl create secret generic essedum-minio-secret -n aipns \
  --from-literal=endpoint=<minio-endpoint-url> \
  --from-literal=access-key=<minio-access-key> \
  --from-literal=secret-key=<minio-secret-key>
```

### 4d. Vibe Studio secret (Azure OpenAI)

```bash
kubectl create secret generic essedum-vibe-secret -n aipns \
  --from-literal=VIBE_AZURE_OPENAI_ENDPOINT=<azure-openai-endpoint> \
  --from-literal=VIBE_AZURE_OPENAI_DEPLOYMENT_NAME=<deployment-name> \
  --from-literal=VIBE_AZURE_OPENAI_API_VERSION=<api-version> \
  --from-literal=VIBE_AZURE_OPENAI_API_KEY=<api-key>
```

### 4e. Goose secrets

```bash
kubectl create secret generic goose-secret -n aipns \
  --from-literal=GOOSE_API_KEY=<goose-api-key>

kubectl create secret generic goose-minio-secret -n aipns \
  --from-literal=endpoint=<minio-endpoint-url> \
  --from-literal=access-key=<minio-access-key> \
  --from-literal=secret-key=<minio-secret-key>
```

### 4f. App secret

```bash
kubectl create secret generic essedum-app-secret -n aipns \
  --from-literal=SECRET_KEY=<app-secret-key>
```

### 4g. Agent designer secrets

```bash
kubectl create secret generic agent-designer-secrets -n aipns \
  --from-literal=DB_URL=<postgres-url> \
  --from-literal=DB_PASSWORD=<postgres-password>
```

### 4h. TLS certificates

```bash
# Platform ingress TLS (matches TLS_SECRET_NAME in .env)
kubectl create secret tls essedum-tls -n aipns \
  --cert=<path/to/tls.crt> \
  --key=<path/to/tls.key>

# Keycloak TLS
kubectl create secret tls essedum-secret -n aipns \
  --cert=<path/to/keycloak-tls.crt> \
  --key=<path/to/keycloak-tls.key>

# ACR image pull secret (AKS only — skip for 5G/LFN)
kubectl create secret docker-registry regcred -n aipns \
  --docker-server=<acr-name>.azurecr.io \
  --docker-username=<acr-username> \
  --docker-password=<acr-password>
```

---

## 5. Fresh Install vs Upgrade

| Scenario | Action |
|----------|--------|
| **Brand-new cluster** | Run all steps 1–4 above, then set `DB_WIPE_PROTECTION=false` in `docker/.env` for the first deploy only, then set it back to `true` |
| **Existing cluster upgrade** | Skip steps 1–4 (already done). `deploy.sh` will verify PVCs are Bound and proceed |
| **Recovering lost data** | Restore from MySQL dump into the existing PV hostPath (`/mnt/mysql-data`), then restart the MySQL pod |

---

## 6. Verify Prerequisites

Run this before `./deploy.sh` to confirm all requirements are met:

```bash
# Namespaces
kubectl get namespace aipns vibe-apps vibe-mcp vibe-agents

# PVCs
kubectl get pvc -n aipns mysql-pvc qdrant-pvc

# Secrets
kubectl get secret -n aipns \
  essedum-db-secret keycloak-admin-secret essedum-minio-secret \
  essedum-vibe-secret goose-secret essedum-app-secret essedum-tls
```

All should show `STATUS: Active` (namespaces), `Bound` (PVCs), and `Opaque`/`kubernetes.io/tls` (secrets).
