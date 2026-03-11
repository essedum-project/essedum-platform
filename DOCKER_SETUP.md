# Essedum Platform — Docker Setup Guide

This document explains the Docker-based setup for running the Essedum **frontend** and **backend** services with fully dynamic, environment-driven configuration.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Files Created / Modified](#files-created--modified)
4. [Quick Start](#quick-start)
5. [Environment Variables Reference](#environment-variables-reference)
6. [How Dynamic URLs Work](#how-dynamic-urls-work)
   - [Backend (Spring Boot)](#backend-spring-boot)
   - [Frontend (Angular + Nginx)](#frontend-angular--nginx)
7. [Build Script (`build.sh`)](#build-script-buildsh)
8. [Customization Guide](#customization-guide)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The setup packages the Essedum platform into two Docker containers:

| Service | Source | Dockerfile | Exposed Port |
|---------|--------|------------|-------------|
| **Backend** (Spring Boot) | `sv/` | `sv/Dockerfile_oauth2` | 8082 (host) → 8082 (container) |
| **Frontend** (Angular + Nginx) | `essedum-ui/` | `essedum-ui/Dockerfile` | 8084 (host) → 8084 (container) |

Every URL, credential, and service address is configurable via environment variables defined in a single `.env` file — **no code changes needed** to switch between environments (dev, staging, production).

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Host Machine                             │
│                                                                 │
│   .env  ──▶  docker-compose.yaml                                │
│                  │                                               │
│      ┌───────────┴───────────────┐                              │
│      ▼                           ▼                              │
│  ┌──────────────────┐   ┌────────────────────┐                  │
│  │ essedum-backend   │   │ essedum-frontend    │                 │
│  │ (Spring Boot)     │   │ (Nginx + Angular)   │                 │
│  │                   │   │                     │                 │
│  │ Port: 8082        │   │ Port: 8084 (shell)  │                 │
│  │                   │   │ Port: 8082 (aip)    │                 │
│  │ Reads env vars    │   │ entrypoint.sh:      │                 │
│  │ via Spring's      │   │  1. envsubst nginx  │                 │
│  │ ${VAR:default}    │   │  2. envsubst JSON   │                 │
│  │ syntax            │   │  3. sed JS bundles  │                 │
│  └──────────────────┘   └────────────────────┘                  │
│          │                       │                               │
│          └───────────┬───────────┘                              │
│                      ▼                                          │
│              essedum-network (bridge)                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files Created / Modified

### New Files

| File | Purpose |
|------|---------|
| `docker-compose.yaml` | Orchestrates frontend + backend services with all env vars |
| `.env.sample` | Template with all configurable variables and their defaults |
| `build.sh` | Convenience script for build, start, stop, logs, etc. |
| `essedum-ui/nginx.conf.template` | Nginx config with `${BACKEND_SERVICE_URL}`, `${LANGFLOW_SERVICE_URL}`, `${LANGFUSE_SERVICE_URL}`, and `${LITELLM_SERVICE_URL}` placeholders |
| `essedum-ui/docker-entrypoint.sh` | Container startup script that generates configs from templates |
| `essedum-ui/config-templates/auth-config.json.template` | Runtime auth config template for shell-app |
| `essedum-ui/config-templates/pipeline-config.json.template` | Runtime pipeline config template for aip-app |

### Modified Files

| File | What Changed |
|------|-------------|
| `sv/Dockerfile_oauth2` | CMD now references `${ENV_VAR}` instead of hardcoded values; added `ENV` declarations with defaults |
| `sv/common-app/.../application-mysql.yml` | All hardcoded URLs replaced with `${PLACEHOLDER:default}` syntax |
| `sv/common-app/.../application-mysql-oauth2.yml` | Same — all URLs use Spring `${VAR:default}` placeholders |
| `sv/common-app/.../application-oauth2.yml` | OAuth2 issuer, JWK, clientId, scope, claim all use `${VAR:default}` |
| `sv/common-app/.../application-vault.yml` | Vault enabled, URI, token use `${VAR:default}` |
| `essedum-ui/aip-app-ui/.../environment.prod.ts` | `langflowUrl`, `langfuseUrl`, and `litellmUrl` use placeholder values for runtime replacement |

---

## Quick Start

### 1. Create your `.env` file

```bash
# Using build.sh
./build.sh init-env

# Or manually
cp .env.sample .env
```

### 2. Edit `.env` with your environment values

```bash
vi .env    # or use any editor
```

At minimum, update:
- `MYSQL_DATASOURCE_URL` — your MySQL connection string
- `MYSQL_DATASOURCE_USER` / `MYSQL_DATASOURCE_PASS` — DB credentials
- `OAUTH2_ISSUER_URI` / `OAUTH2_JWK_SET_URI` — your identity provider URLs
- `FE_AUTH_ISSUER` / `FE_AUTH_CLIENT_ID` — frontend auth config (if auth is enabled)

### 3. Build and start

```bash
# Using build.sh (recommended)
./build.sh up -d

# Or using docker compose directly
docker compose up --build -d
```

### 4. Verify

```bash
./build.sh status
# or
docker compose ps
```

- **Frontend (shell-app):** http://localhost:8084
- **Frontend (aip-app):** http://localhost:8082
- **Backend API:** http://localhost:8082/api/

### 5. View logs

```bash
./build.sh logs -f
```

### 6. Stop

```bash
./build.sh down
```

---

## Environment Variables Reference

### Frontend Variables

| Variable | Default | Used In | Description |
|----------|---------|---------|-------------|
| `FRONTEND_PORT` | `8084` | docker-compose | Host port mapped to frontend |
| `BACKEND_SERVICE_URL` | `essedum-backend-service:8082` | nginx.conf.template | Backend address for nginx proxy |
| `LANGFLOW_SERVICE_URL` | `essedum-langflow-service:80` | nginx.conf.template | Langflow address for nginx proxy |
| `LANGFUSE_SERVICE_URL` | `essedum-langfuse-service:3000` | nginx.conf.template | Langfuse address for nginx proxy |
| `LITELLM_SERVICE_URL` | `essedum-litellm-service:4000` | nginx.conf.template | LiteLLM address for nginx proxy |
| `FE_AUTH_REQUIRED` | `false` | auth-config.json | Enable/disable authentication |
| `FE_AUTH_ISSUER` | *(empty)* | auth-config.json | OAuth2 issuer URL (set in .env if needed) |
| `FE_AUTH_CLIENT_ID` | *(empty)* | auth-config.json | OAuth2 client ID (set in .env if needed) |
| `FE_AUTH_SCOPE` | *(empty)* | auth-config.json | OAuth2 scope (set in .env if needed) |
| `FE_LANGFLOW_URL` | `https://langflow.essedum-lfn.infosys.com/` | JS bundle (sed) | Langflow URL in Angular app |
| `FE_LANGFUSE_URL` | `https://langfuse.essedum-lfn.infosys.com/` | JS bundle (sed) | Langfuse URL in Angular app |
| `FE_LITELLM_URL` | `https://litellm.essedum-lfn.infosys.com/ui/` | JS bundle (sed) | LiteLLM URL in Angular app |
| `FE_MINIO_ENDPOINT` | `http://minio:9000` | pipeline-config.json | MinIO storage endpoint |
| `FE_MINIO_BUCKET` | `aiptest` | pipeline-config.json | MinIO bucket name |
| `FE_CONTAINER_REGISTRY_PREFIX` | `acrreq0762935.azurecr.io/` | pipeline-config.json | Container registry prefix |
| `FE_CONTAINER_REGISTRY_VERSION` | `v1` | pipeline-config.json | Container image version |

### Backend Variables

| Variable | Default | Used In | Description |
|----------|---------|---------|-------------|
| `BACKEND_PORT` | `8082` | docker-compose | Host port mapped to backend |
| `SPRING_PROFILES_ACTIVE` | `mysql,dbjwt,btf,dbconstants,vault` | Dockerfile CMD | Active Spring profiles |
| `ENCRYPTION_KEY` | `essedum` | application properties | Data encryption key |
| `ENCRYPTION_SALT` | `defaultsalt` | application properties | Encryption salt |
| `MYSQL_DATASOURCE_URL` | `jdbc:mysql://mysql:3306` | application-mysql.yml | MySQL JDBC URL (without DB name) |
| `MYSQL_DATASOURCE_USER` | `root` | application-mysql.yml | MySQL username |
| `MYSQL_DATASOURCE_PASS` | `password` | application-mysql.yml | MySQL password |
| `ESSEDUM_CORE_DB` | `essedum_coredb` | application-mysql.yml | Core database name |
| `ESSEDUM_QUARTZ_DB` | `essedum_quartzdb` | application-mysql.yml | Quartz scheduler DB name |
| `ESSEDUM_BTF_DB` | `essedum_btf` | application-mysql.yml | BTF database name |
| `ESSEDUM_SJS_DB` | `essedum_sjs` | application-mysql.yml | SJS database name |
| `ESSEDUM_REF_DB` | `essedum_ref_data` | application-mysql.yml | Reference data DB name |
| `TELEMETRY_DATASOURCE_URL` | `jdbc:mysql://mysql:3306/telemetrydb` | application-mysql.yml | Telemetry DB full JDBC URL |
| `ESSEDUM_URL` | `http://essedum-backend-service:8082/` | application-mysql.yml | Backend self-URL (external) |
| `COMMON_APP_URL` | `http://essedum-backend-service:8081/` | application-mysql.yml | Backend self-URL (internal) |
| `PYJOB_EXECUTOR_URL` | `http://py-job-executor:5000` | application-mysql.yml | Python job executor URL |
| `VAULT_ENABLED` | `false` | application-vault.yml | Enable HashiCorp Vault |
| `VAULT_URL` | `http://vault:8200` | application-vault.yml | Vault server URL |
| `VAULT_TOKEN` | *(empty)* | application-vault.yml | Vault access token |
| `KAFKA_BOOTSTRAP_SERVERS` | `kafka:9092` | application-mysql.yml | Kafka broker addresses |
| `RABBITMQ_HOST` | `rabbitmq` | application-mysql.yml | RabbitMQ hostname |
| `RABBITMQ_PORT` | `5672` | application-mysql.yml | RabbitMQ port |
| `BACKEND_SERVER_PORT` | `8081` | application-mysql.yml | Spring Boot server port |
| `OAUTH2_ISSUER_URI` | *(Keycloak URL)* | application-oauth2.yml | OAuth2 token issuer |
| `OAUTH2_JWK_SET_URI` | *(Keycloak URL)* | application-oauth2.yml | JWK Set endpoint for token verification |
| `OAUTH2_CLIENT_ID` | `essedum-45` | application-oauth2.yml | OAuth2 client identifier |
| `OAUTH2_SCOPE` | `openid profile email` | application-oauth2.yml | OAuth2 scopes |
| `OAUTH2_CLAIM` | `email\|\|admin` | application-oauth2.yml | OAuth2 claim mapping |
| `OAUTH2_CREATE_USER` | `true` | application-oauth2.yml | Auto-create users on first login |

---

## How Dynamic URLs Work

### Backend (Spring Boot)

Spring Boot natively supports environment variable overrides using the `${VAR:default}` syntax in YAML property files.

**Example in `application-mysql.yml`:**
```yaml
spring:
  datasource:
    url: ${MYSQL_DATASOURCE_URL:jdbc:mysql://mysql:3306}/${ESSEDUM_CORE_DB:essedum_coredb}
    username: ${MYSQL_DATASOURCE_USER:root}
    password: ${MYSQL_DATASOURCE_PASS:password}
```

**Flow:**
```
.env file
   ↓ (docker-compose reads it)
docker-compose.yaml  →  sets container env vars
   ↓
Spring Boot picks up env vars  →  overrides YAML defaults
```

If `MYSQL_DATASOURCE_URL` is set in the environment, Spring uses that value. Otherwise, it falls back to the default after the colon (`jdbc:mysql://mysql:3306`).

The `Dockerfile_oauth2` CMD also uses `${VAR}` syntax:
```dockerfile
ENV SPRING_PROFILES_ACTIVE=mysql,oauth2,btf,dbconstants,vault
CMD java ... -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE} ...
```

### Frontend (Angular + Nginx)

The frontend has **three layers** of dynamic configuration, each handled differently:

#### Layer 1: Nginx Proxy Config (envsubst)

`nginx.conf.template` contains placeholders like `${BACKEND_SERVICE_URL}`. At container startup, `docker-entrypoint.sh` runs:

```sh
envsubst '${BACKEND_SERVICE_URL} ${LANGFLOW_SERVICE_URL} ${LANGFUSE_SERVICE_URL} ${LITELLM_SERVICE_URL}' \
  < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
```

This generates the actual `nginx.conf` with real service addresses, enabling nginx to proxy `/api/` requests to the backend and `/langflow`, `/langfuse`, and `/litellm` to their respective services.

#### Layer 2: Runtime JSON Configs (envsubst)

Angular apps load configuration from JSON files at runtime (not baked into the build). Templates live in `essedum-ui/config-templates/`:

- **`auth-config.json.template`** → generates `auth-config.json` for shell-app (OAuth2 settings)
- **`pipeline-config.json.template`** → generates `pipeline-config.json` for aip-app (MinIO, container registry)

At startup, `docker-entrypoint.sh` runs `envsubst` on each template to produce the final JSON files with real values.

#### Layer 3: Build-Time JS Bundle Replacement (sed)

Some values are baked into Angular's compiled JavaScript during `ng build` (for example `langflowUrl`, `langfuseUrl`, and `litellmUrl` from `environment.prod.ts`). These can't use `envsubst` because they're inside minified JS bundles.

**Solution:** The build uses a placeholder string:
```typescript
// environment.prod.ts
langflowUrl: '__LANGFLOW_URL_PLACEHOLDER__',
langfuseUrl: '__LANGFUSE_URL_PLACEHOLDER__',
litellmUrl: '__LITELLM_URL_PLACEHOLDER__'
```

At container startup, `docker-entrypoint.sh` replaces them with real values using `sed`:
```sh
find /app/ui/aip -name '*.js' -exec \
  sed -i "s|__LANGFLOW_URL_PLACEHOLDER__|${FE_LANGFLOW_URL}|g" {} +
find /app/ui/aip -name '*.js' -exec \
  sed -i "s|__LANGFUSE_URL_PLACEHOLDER__|${FE_LANGFUSE_URL}|g" {} +
find /app/ui/aip -name '*.js' -exec \
  sed -i "s|__LITELLM_URL_PLACEHOLDER__|${FE_LITELLM_URL}|g" {} +
```

---

## Build Script (`build.sh`)

The `build.sh` script wraps common Docker Compose operations:

| Command | Description |
|---------|-------------|
| `./build.sh init-env` | Create `.env` from `.env.sample` |
| `./build.sh build` | Build Docker images without starting |
| `./build.sh build --no-cache` | Full rebuild (no Docker cache) |
| `./build.sh up -d` | Build and start services in background |
| `./build.sh up -d --no-cache` | Full rebuild and start |
| `./build.sh down` | Stop and remove services |
| `./build.sh restart` | Restart all services |
| `./build.sh logs` | Show logs |
| `./build.sh logs -f` | Stream logs in real time |
| `./build.sh status` | Show container status (ports, state) |
| `./build.sh clean` | Stop and remove containers, images, volumes |

The script:
- Auto-detects `docker compose` v2 vs legacy `docker-compose`
- Creates `.env` from `.env.sample` if missing
- Makes `docker-entrypoint.sh` executable before builds

---

## Customization Guide

### Switching to a Different Spring Profile

To use `dbjwt` instead of `oauth2`, update `.env`:

```env
SPRING_PROFILES_ACTIVE=mysql,dbjwt,btf,dbconstants,vault
```

And change the Dockerfile in `docker-compose.yaml`:

```yaml
essedum-backend-service:
  build:
    context: ./sv
    dockerfile: Dockerfile_dbjwt  # instead of Dockerfile_oauth2
```

### Adding External Services (MySQL, Kafka, etc.)

The current `docker-compose.yaml` only contains the backend and frontend. External services (MySQL, Kafka, RabbitMQ, Vault, Keycloak) are expected to be running separately. If you need them in Docker too, add them to `docker-compose.yaml`:

```yaml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_DATASOURCE_PASS:-password}
    ports:
      - "3306:3306"
    networks:
      - essedum-network
```

### Disabling Authentication

Set in `.env`:

```env
FE_AUTH_REQUIRED=false
```

### Changing Host Ports

```env
BACKEND_PORT=9090
FRONTEND_PORT=9091
```

---

## Troubleshooting

### Container fails to start

```bash
# Check logs for the specific service
docker compose logs essedum-backend-service
docker compose logs essedum-frontend
```

### Nginx shows 502 Bad Gateway

The backend is not reachable from the frontend container. Verify:
1. Both containers are on the same network (`essedum-network`)
2. `BACKEND_SERVICE_URL` matches the backend service name and port
3. The backend is fully started (check backend logs)

If `/langfuse` or `/litellm` shows 502, verify `LANGFUSE_SERVICE_URL` and `LITELLM_SERVICE_URL` point to reachable services on the same Docker network.

### Spring Boot can't connect to MySQL

1. Ensure MySQL is running and accessible from the Docker network
2. Check `MYSQL_DATASOURCE_URL` in `.env` — it must be reachable from within Docker
3. If MySQL is on the host machine, use `host.docker.internal:3306` instead of `localhost:3306`

### Auth not working on frontend

1. Check `FE_AUTH_REQUIRED` is `true` in `.env`
2. Set `FE_AUTH_ISSUER` and `FE_AUTH_CLIENT_ID` in `.env` to match your identity provider
3. Inspect the generated config: `docker exec essedum-frontend cat /app/ui/common/configs/auth-config.json`

### Langflow URL not replaced in Angular app

1. Verify `FE_LANGFLOW_URL` is set in `.env`
2. Check entrypoint logs: `docker compose logs essedum-frontend | grep langflowUrl`
3. Inspect a JS bundle: `docker exec essedum-frontend grep -r "LANGFLOW" /app/ui/aip/*.js`

### Langfuse/LiteLLM URLs not replaced in Angular app

1. Verify `FE_LANGFUSE_URL` and `FE_LITELLM_URL` are set in `.env`
2. Check entrypoint logs for replacement messages for `langfuseUrl` and `litellmUrl`
3. Inspect JS bundles:
  - `docker exec essedum-frontend grep -r "LANGFUSE" /app/ui/aip/*.js`
  - `docker exec essedum-frontend grep -r "LITELLM" /app/ui/aip/*.js`

### Rebuilding after config changes

Environment variable changes in `.env` take effect on restart:
```bash
./build.sh restart
```

Changes to templates, Dockerfiles, or source code require a rebuild:
```bash
./build.sh up -d --no-cache
```

---

## File Structure Summary

```
essedum-platform/
├── docker-compose.yaml              # Main orchestration file
├── .env.sample                      # Environment variable template
├── .env                             # Your local config (git-ignored)
├── build.sh                         # Build & run convenience script
├── DOCKER_SETUP.md                  # This file
│
├── sv/                              # Backend (Spring Boot)
│   ├── Dockerfile_oauth2            # Dockerfile with ENV placeholders
│   └── common-app/src/main/resources/
│       ├── application-mysql.yml          # DB, Kafka, RabbitMQ config
│       ├── application-mysql-oauth2.yml   # DB config (OAuth2 variant)
│       ├── application-oauth2.yml         # OAuth2 provider config
│       └── application-vault.yml          # Vault config
│
└── essedum-ui/                      # Frontend (Angular + Nginx)
    ├── Dockerfile                   # Multi-stage Angular build
    ├── nginx.conf.template          # Nginx config with URL placeholders
    ├── docker-entrypoint.sh         # Startup script (envsubst + sed)
    ├── config-templates/
    │   ├── auth-config.json.template      # Auth config template
    │   └── pipeline-config.json.template  # Pipeline config template
    └── aip-app-ui/.../environment.prod.ts # Langflow/Langfuse/LiteLLM URL placeholders
```
