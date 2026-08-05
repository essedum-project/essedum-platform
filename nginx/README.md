# Nginx Configuration

> Architecture and design decisions: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

Nginx reverse proxy serving the Essedum frontend and routing API requests to backend services.

## Configuration Files

| File | Purpose |
|---|---|
| `nginx_shell.conf` | Production — shell app on :8084 with SSL |
| `nginx_ui.conf` | Production Docker — full MFE stack |
| `nginx_ui_5g.conf` | 5G lab deployment variant |
| `nginx_mfe.conf` | Micro-frontend serving |
| `nginx.conf` | Local development |

## Key Routes

| Path | Destination |
|---|---|
| `/` | Angular shell app (static files) |
| `/api/**` | Backend API Gateway `:8080` |
| `/realms/**` | Keycloak `:8180` |
