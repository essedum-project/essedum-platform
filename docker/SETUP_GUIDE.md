# Essedum Platform — Docker Compose Setup Guide

This guide walks you through deploying the full Essedum platform from scratch using Docker Compose.

---

## Platform Services & Access URLs

| Service | URL | Credentials |
|---|---|---|
| **Essedum UI** (main frontend) | `https://<SERVER_IP>:8084` | Keycloak login |
| **Langflow** | `https://<SERVER_IP>:8086` | Set via `LANGFLOW_AUTO_LOGIN` |
| **Langfuse** | `https://<SERVER_IP>:8087` | Register on first visit |
| **LiteLLM UI** | `https://<SERVER_IP>:4000/ui/` | `admin` / `admin` (configurable) |
| **Ollama API** | `http://<SERVER_IP>:11434` | No auth required |
| **MinIO Console** | `http://<SERVER_IP>:9001` | `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` |
| **Keycloak** | `http://<SERVER_IP>:8180` | `KEYCLOAK_ADMIN_USER` / `KEYCLOAK_ADMIN_PASSWORD` |

---

## Prerequisites

- Docker Engine 24+ and Docker Compose V2 (`docker compose`, not `docker-compose`)
- At least 8GB RAM, 20GB free disk space
- Open ports: `8084`, `8086`, `8087`, `4000`, `8180`, `9000`, `9001`, `11434`

Verify Docker Compose V2:
```bash
docker compose version
# Must show: Docker Compose version v2.x.x
```

---

## Step 1 — Clone & Navigate

```bash
git clone <repository-url>
cd essedum-platform/docker
```

---

## Step 2 — Create the `.env` File

Copy the sample and fill in your values:

```bash
cp .env.sample .env
```

### Required variables to update in `.env`

#### Server IP
```env
SERVER_IP=10.200.111.51   # Replace with your server's actual IP
```

#### Frontend iframe URLs
```env
FE_LANGFLOW_URL=https://<SERVER_IP>:8086
FE_LANGFUSE_URL=https://<SERVER_IP>:8087
FE_LITELLM_URL=https://<SERVER_IP>:4000/ui/
```

#### LiteLLM
```env
LITELLM_MASTER_KEY=sk-1234          # API key for LiteLLM proxy
LITELLM_UI_USERNAME=admin
LITELLM_UI_PASSWORD=admin
LITELLM_DB_PASSWORD=litellm         # Postgres password for litellm DB
```

#### Langfuse
```env
# Generate with: openssl rand -hex 32
LANGFUSE_ENCRYPTION_KEY=<64-char-hex>

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=<random-string>
NEXTAUTH_URL=https://<SERVER_IP>:8087

LANGFUSE_DATABASE_URL=postgresql://langfuse:<password>@langfuse-postgres:5432/langfuse
LANGFUSE_POSTGRES_USER=langfuse
LANGFUSE_POSTGRES_PASSWORD=langfuse123
LANGFUSE_POSTGRES_DB=langfuse

# Get from Langfuse UI after first login: Settings → API Keys
LANGFUSE_SECRET_KEY=sk-lf-xxxx
LANGFUSE_PUBLIC_KEY=pk-lf-xxxx
LANGFUSE_BASE_URL=https://<SERVER_IP>:8087
```

#### Langflow
```env
LANGFLOW_SECRET_KEY=<random-string>
LANGFLOW_DATABASE_URL=postgresql://<user>:<password>@langflow-stable-postgres:5432/<db>
LANGFLOW_PORT=7861
```

#### MySQL / Backend
```env
MYSQL_ROOT_PASSWORD=yourpassword
MYSQL_DATASOURCE_URL=jdbc:mysql://mysql:3306/yourdb
ENCRYPTION_KEY=yourkey
```

#### MinIO
```env
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_BUCKET=langfuse
```

---

## Step 3 — Generate Secrets

```bash
# Langfuse ENCRYPTION_KEY (must be 64-char hex)
openssl rand -hex 32

# NEXTAUTH_SECRET
openssl rand -base64 32

# LANGFLOW_SECRET_KEY
openssl rand -base64 32
```

---

## Step 4 — First-Time Build & Start

Build all images and start all services:

```bash
sudo docker compose up -d --build
```

This will:
1. Build the frontend (Angular + Nginx)
2. Build the backend (Spring Boot)
3. Build LiteLLM proxy
4. Pull all pre-built images (Langflow, Langfuse, Postgres, Redis, etc.)
5. Start all containers in dependency order

Monitor startup:
```bash
sudo docker compose logs -f
```

---

## Step 5 — Verify All Containers Are Running

```bash
sudo docker ps --format "table {{.Names}}\t{{.Status}}"
```

Expected running containers:
```
docker-frontend-1               Up
docker-leap-app-backend-service-1  Up
litellm                         Up
litellm-postgres                Up (healthy)
langflow-stable                 Up
langflow-stable-postgres        Up (healthy)
langfuse-web                    Up
langfuse-worker                 Up
langfuse-postgres               Up (healthy)
langfuse-clickhouse             Up (healthy)
langfuse-redis                  Up (healthy)
langfuse-minio                  Up (healthy)
langfuse-minio-setup            Exited (0)   ← normal
ollama                          Up
minio                           Up
docker-mysql-1                  Up
docker-qdrant-1                 Up
docker-keycloak-1               Up
```

---

## Step 6 — First Login to Langfuse

1. Go to `https://<SERVER_IP>:8087`
2. Click **Sign Up** and create an admin account
3. Create a new project
4. Go to **Settings → API Keys** → create a key pair
5. Copy `Secret Key` and `Public Key` into `.env`:
   ```env
   LANGFUSE_SECRET_KEY=sk-lf-xxxx
   LANGFUSE_PUBLIC_KEY=pk-lf-xxxx
   ```
6. Restart LiteLLM to apply:
   ```bash
   sudo docker compose up -d --no-build --force-recreate litellm
   ```

---

## Step 7 — Connect LiteLLM to Langfuse (Observability)

LiteLLM is pre-configured to send traces to Langfuse via `lite-llm/config/config.yaml`:

```yaml
litellm_settings:
  success_callback: ["langfuse"]
  failure_callback: ["langfuse"]
  langfuse_secret: ${LANGFUSE_SECRET_KEY}
  langfuse_public_key: ${LANGFUSE_PUBLIC_KEY}
  langfuse_host: ${LANGFUSE_BASE_URL}
```

All LLM calls through LiteLLM will appear in the Langfuse **Traces** view automatically.

---

## Step 8 — Pull Ollama Models

Pull models for local inference:

```bash
# Pull llama3 (used by LiteLLM config)
sudo docker exec ollama ollama pull llama3

# Pull mistral
sudo docker exec ollama ollama pull mistral

# List available models
sudo docker exec ollama ollama list
```

---

## Common Operations

### Restart a single service
```bash
sudo docker compose up -d --no-build --force-recreate <service-name>
# e.g.:
sudo docker compose up -d --no-build --force-recreate litellm
sudo docker compose up -d --no-build --force-recreate frontend
```

### Rebuild and restart a service (after code changes)
```bash
sudo docker compose up -d --build <service-name>
```

### View logs
```bash
sudo docker logs <container-name> --tail 50 -f
# e.g.:
sudo docker logs litellm --tail 50 -f
sudo docker logs langfuse-web --tail 50 -f
```

### Stop all services
```bash
sudo docker compose down
```

### Stop and remove all data (destructive)
```bash
sudo docker compose down -v
```

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `Port already allocated` | Another container/service using the port | `sudo docker compose up -d --force-recreate <service>` after stopping the conflicting container |
| Langfuse iframe `refused to connect` | `X-Frame-Options` header from upstream | `proxy_hide_header X-Frame-Options` in nginx config |
| LiteLLM `Not connected to DB` | `DATABASE_URL` not set or wrong | Check `litellm-postgres` is healthy, verify `DATABASE_URL` env var |
| LiteLLM `Invalid credentials` | `UI_USERNAME`/`UI_PASSWORD` not set | Add to litellm `environment:` block in docker-compose.yml |
| Langflow `502 Bad Gateway` | Wrong postgres hostname | Check `POSTGRES_HOST` matches the service name in compose |
| Frontend placeholder `__FE_LITELLM_URL__` showing | Container not recreated after `.env` change | `sudo docker compose up -d --no-build --force-recreate frontend` |
| `docker-compose` V1 `ContainerConfig` error | Old Docker Compose V1 binary | Use `docker compose` (V2) instead of `docker-compose` |

---

## Port Reference

| Port | Service |
|---|---|
| `8082` | Backend API |
| `8084` | Frontend UI (HTTPS) |
| `8086` | Langflow proxy (HTTPS) |
| `8087` | Langfuse proxy (HTTPS) |
| `4000` | LiteLLM proxy (HTTPS) |
| `8180` | Keycloak |
| `9000` | MinIO API |
| `9001` | MinIO Console |
| `11434` | Ollama API |
| `3306` | MySQL |
| `6333` | Qdrant |
