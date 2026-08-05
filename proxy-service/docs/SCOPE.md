# Proxy Service — Scope

## Objective

Act as a **secure HTTP and WebSocket reverse proxy** between the Essedum frontend and dynamically spawned Kubernetes pod services (Vibe coding sessions, agent runners). The service routes requests to Kubernetes cluster-internal services by name, enforcing a strict allowlist and multiple layers of URL/header sanitization to prevent SSRF and injection attacks.

---

## Functional Requirements

| ID | Requirement |
|---|---|
| FR-PROXY1 | The service proxies HTTP requests from `/{service}/{subpath}` to the corresponding Kubernetes cluster-internal service at `http://{service}.{namespace}.svc.cluster.local/{subpath}`. |
| FR-PROXY2 | The service proxies WebSocket upgrade requests for Socket.IO connections, preserving the Socket.IO transport handshake across the proxy boundary. |
| FR-PROXY3 | Service names are validated against a strict DNS-label pattern (1–63 chars, lowercase letters, digits, hyphens, starting and ending with alphanumeric) before any upstream connection is made. Invalid names return HTTP 400. |
| FR-PROXY4 | When an `ALLOWLIST` environment variable is set, only services explicitly listed are reachable. Requests to unlisted services return HTTP 403. |
| FR-PROXY5 | The upstream URL is validated to confirm it resolves within `*.{namespace}.svc.cluster.local` before the connection is forwarded, preventing requests from escaping the cluster namespace. |
| FR-PROXY6 | Only known Socket.IO query parameters (`EIO`, `transport`, `t`, `sid`, `j`) are forwarded to upstream services. All other query parameters are stripped. |
| FR-PROXY7 | Hop-by-hop HTTP headers (`connection`, `keep-alive`, `transfer-encoding`, `upgrade`, etc.) are stripped from forwarded requests and responses. |
| FR-PROXY8 | Subpaths are normalized using `posixpath.normpath` to remove `..` and `.` segments before being appended to the upstream URL. |
| FR-PROXY9 | A health check endpoint is available at `/health`. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-PROXY1 | The service is built on **aiohttp** with fully async I/O — no threads block on upstream HTTP or WebSocket connections. |
| NFR-PROXY2 | The target namespace is configurable via the `TARGET_NAMESPACE` environment variable (default: `aipns`). |
| NFR-PROXY3 | The upstream allowlist is configurable via the `ALLOWLIST` environment variable (comma-separated service names). When not set, all DNS-label-valid service names are reachable within the namespace. |
| NFR-PROXY4 | Upstream HTTP connections use a 120-second total timeout to prevent hanging connections. |
| NFR-PROXY5 | The service performs no authentication. It relies on the Kubernetes network policy and the upstream service itself to enforce access control. |
