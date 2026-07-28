# Nginx — Scope

## Objective

Serve as the **reverse proxy and static file server** for the Essedum platform. Nginx sits in front of the Angular frontend applications and routes API requests to the appropriate backend services. It handles TLS termination, CORS headers, rate limiting, WebSocket upgrades, and file size limits in one place so individual services do not need to manage these concerns.

---

## Functional Requirements

### Frontend Serving

| ID | Requirement |
|---|---|
| FR-NGX1 | Nginx serves the Angular shell application (`common-app`) and the AIP micro-frontend (`icip-app`) as static files from their respective `dist/` build output directories. |
| FR-NGX2 | All navigation requests (SPA routes) that do not match a static file are rewritten to `index.html` so Angular's client-side router handles them. |
| FR-NGX3 | Static assets (CSS, JavaScript, images) are served with long-lived cache headers (`max` expiry). HTML files are served with `epoch` (no-cache) to ensure the latest shell is always loaded. |

### API Proxy

| ID | Requirement |
|---|---|
| FR-NGX4 | Requests to `/api/**` are proxied to the backend Spring Boot service. The `Host`, `X-Forwarded-Proto`, `X-Real-IP`, and `X-Forwarded-For` headers are set on proxied requests. |
| FR-NGX5 | WebSocket upgrade connections (`Upgrade: websocket`) are proxied through to the backend service using the `connection_upgrade` map. |
| FR-NGX6 | The proxy supports request bodies up to **500 MB** to accommodate file uploads forwarded through Nginx. |

### Security & Traffic Control

| ID | Requirement |
|---|---|
| FR-NGX7 | Rate limiting is enforced per client IP using a shared zone of 10 MB (`zone=one`), capping at **1000 req/s**. |
| FR-NGX8 | TLS termination is handled at Nginx for HTTPS deployments. Certificates and keys are provided by the deployment configuration. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-NGX1 | Nginx runs as a single worker process (`worker_processes 1`) with up to **1024 simultaneous connections** per worker. |
| NFR-NGX2 | Keep-alive timeout is set to **60 seconds** for persistent upstream connections. |
| NFR-NGX3 | Character encoding is forced to **UTF-8** for all served content. |
| NFR-NGX4 | The configuration is environment-specific — directory paths, upstream addresses, and TLS settings are provided per deployment. The repo ships `nginx.conf` (dev), `nginx_ui.conf` (production Docker), and `nginx_ui_5g.conf` (5G lab) variants. |
