# Docker Compose Setup

> Full service inventory, volumes, networks, and access URLs: [docs/DOCKERDEPLOYMENT.md](../docs/DOCKERDEPLOYMENT.md)

## Quick Start

```bash
cd docker
cp .env.sample .env   # fill in required values (see SETUP_GUIDE.md)
docker compose up --build
```

For step-by-step setup instructions see [SETUP_GUIDE.md](SETUP_GUIDE.md).

## Access URLs (default ports)

| Service | URL |
|---|---|
| Essedum UI | `https://<SERVER_IP>:8084` |
| Keycloak | `http://<SERVER_IP>:8180` |
| MinIO Console | `http://<SERVER_IP>:9001` |
| Langflow | `https://<SERVER_IP>:8086` |
| LangFuse | `https://<SERVER_IP>:8087` |
| LiteLLM UI | `https://<SERVER_IP>:4000/ui/` |
| Ollama API | `http://<SERVER_IP>:11434` |

## UI-Only Mode

Run only the frontend against a shared backend:

```bash
cp .env.ui-only.sample .env.ui-only
# set ESSEDUM_BACKEND_UPSTREAM, ESSEDUM_KEYCLOAK_UPSTREAM, KEYCLOAK_ISSUER
docker compose -f docker-compose.ui-only.yml up
```
