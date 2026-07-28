---
applyTo: "docker/docker-compose.ui-only.yml,docker/.env.ui-only*,essedum-ui/**"
---

# Essedum UI — Local Developer Mode

## What this skill covers
Running **only the Essedum frontend** on a developer laptop while all backend
services (Spring Boot, Keycloak, MySQL, Qdrant, Langflow, etc.) run on a shared
team server.  This avoids each developer needing to run the full stack locally.

---

## Prerequisites
- Docker Desktop or Docker Engine installed locally
- Network access to the shared backend server (VPN if needed)
- The shared server must have ports **8080** (API), **8180** (Keycloak) open

---

## Step-by-step: Run UI only

### 1 — Create your local env file
```bash
cd essedum-platform/docker
cp .env.ui-only.sample .env.ui-only
```

### 2 — Edit `.env.ui-only`
Fill in `<SERVER_IP>` with the actual IP or hostname of the shared backend:

```env
ESSEDUM_BACKEND_UPSTREAM=10.200.111.51:8080
ESSEDUM_KEYCLOAK_UPSTREAM=10.200.111.51:8180
KEYCLOAK_ISSUER=http://10.200.111.51:8180/realms/ESSEDUM
FE_LANGFLOW_URL=https://10.200.111.51:8086
FE_LANGFUSE_URL=https://10.200.111.51:8087
FE_LITELLM_URL=https://10.200.111.51:4000/ui/
```

### 3 — Build and start
```bash
docker compose -f docker-compose.ui-only.yml up --build
```

The UI is available at **https://localhost:8084**
(accept the self-signed certificate warning in the browser on first visit).

### 4 — Subsequent starts (no code changes)
```bash
docker compose -f docker-compose.ui-only.yml up
```

### 5 — Stop
```bash
docker compose -f docker-compose.ui-only.yml down
```

---

## How it works (architecture)

```
Your Laptop                          Shared Server
┌─────────────────────────┐          ┌──────────────────────────┐
│  Docker: essedum-ui     │          │  Spring Boot :8080       │
│  Nginx :8084            │──/api/──▶│  Keycloak    :8180       │
│   ├─ serves Angular SPA │          │  MySQL, Qdrant, etc.     │
│   ├─ proxies /api/      │          │  Langflow    :8086       │
│   ├─ proxies /realms/   │          └──────────────────────────┘
│   └─ proxies /js/ /res/ │
└─────────────────────────┘
```

The entrypoint uses `envsubst` to inject `ESSEDUM_BACKEND_UPSTREAM` and
`ESSEDUM_KEYCLOAK_UPSTREAM` into the Nginx config at container startup.
The `KEYCLOAK_ISSUER` is injected into the built Angular `auth-config.json`
asset so OIDC authentication points to the correct server.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Blank page / JS errors | Check browser console; likely `KEYCLOAK_ISSUER` is wrong or unreachable |
| 502 Bad Gateway | `ESSEDUM_BACKEND_UPSTREAM` or `ESSEDUM_KEYCLOAK_UPSTREAM` is unreachable — check VPN/firewall |
| OIDC redirect loop | `KEYCLOAK_ISSUER` must be the **browser-accessible** URL, not an internal hostname |
| `__KEYCLOAK_ISSUER__` visible in login page | `KEYCLOAK_ISSUER` env var was empty when the container started |
| Build fails | Run `docker compose -f docker-compose.ui-only.yml build --no-cache` |

---

## Full-stack deployment (no change needed)
The main `docker-compose.yml` is **unaffected**.  It uses the same Docker
service names as defaults:
- `ESSEDUM_BACKEND_UPSTREAM` defaults to `essedum-backend-api-gateway-service:8080`
- `ESSEDUM_KEYCLOAK_UPSTREAM` defaults to `keycloak:8180`

No existing CI/CD or production configuration needs to change.
