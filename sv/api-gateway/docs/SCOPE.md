# API Gateway — Scope

## Objective

Act as the **sole public entry point** for all client traffic. Authenticate every request, route it to the correct downstream service, and enforce platform-wide policies — without containing any business logic.

---

## Functional Requirements

| ID | Requirement |
|---|---|
| FR-GW1 | All incoming HTTP requests must pass through the gateway. Downstream services (ports 8081–8084) are not directly reachable from outside the cluster. |
| FR-GW2 | The gateway validates the JWT token on every request before forwarding. Requests with a missing or invalid token are rejected with HTTP 401. |
| FR-GW3 | Requests are routed to USM, ICIP, Data, or Vibe service based on the URL path prefix (`/api/usm/**`, `/api/icip/**`, `/api/data/**`, `/api/vibe/**`). |
| FR-GW4 | Service addresses are resolved dynamically via Eureka. No downstream URL is hardcoded in the gateway configuration. |
| FR-GW5 | The gateway load-balances across multiple instances of the same service using Eureka-registered addresses. |
| FR-GW6 | CORS headers are applied centrally at the gateway for all responses. |
| FR-GW7 | Request body size is capped at 500 MB. Requests exceeding this are rejected with HTTP 413. |
| FR-GW8 | The gateway propagates tracing headers (`X-Request-ID`, `X-Forwarded-For`) to downstream services on every forwarded request. |
| FR-GW9 | Rate limiting is enforced per client IP at the gateway layer. |
| FR-GW10 | The gateway exposes a `/health` endpoint for Kubernetes liveness and readiness probes. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-GW1 | The gateway must handle **≥ 1,000 req/s** at steady state without dropping requests. |
| NFR-GW2 | Gateway-added latency must be **< 10 ms** (p99) on top of the downstream service response time. |
| NFR-GW3 | The gateway must be **stateless** — any instance can handle any request. No session state is stored in the gateway process. |
| NFR-GW4 | Token validation must use the Keycloak JWK Set URI, not a locally cached secret, so key rotation is handled automatically. |
| NFR-GW5 | The gateway must recover from a downstream service outage without crashing. Unavailable routes return HTTP 503; other routes continue operating. |
| NFR-GW6 | Configuration (routes, Eureka URL, token issuer URI) is injected via environment variables or a config file — no hardcoded values. |
| NFR-GW7 | The gateway must be independently deployable and scalable without redeploying any domain service. |
