# Backend Services — Scope

## Objective

Provide a **Java 21 / Spring Boot 3.x microservices backend** that exposes RESTful APIs for the Essedum platform, covering user security, AI/ML pipeline execution, data connectivity, and AI-assisted coding. All external traffic enters through a single API Gateway and is routed to one of four domain services.

---

## Services at a Glance

| Service | Domain | Description |
|---|---|---|
| [API Gateway](../api-gateway/docs/SCOPE.md) | Routing & Security | Single entry point for all traffic. Validates tokens, routes by URL path, applies rate limiting, and forwards correlation headers. No business logic. |
| [USM Service](../usm-service/docs/SCOPE.md) | User & Access Management | Manages users, roles, organisations, and permissions. Issues and validates JWTs. Enforces RBAC on every request. |
| [ICIP Service](../icip-service/docs/SCOPE.md) | AI/ML Pipelines & Jobs | Core execution engine. Runs training, inference, and RAG pipelines; manages the model registry; submits jobs to cloud ML platforms; streams job status in real time. |
| [Data Service](../data-service/docs/SCOPE.md) | Files, Datasets & Adapters | Handles all data at rest and in motion — file storage, dataset management, schema registry, and pluggable adapters to external databases and cloud storage. |
| [Vibe Service](../vibe-service/docs/SCOPE.md) | AI-Assisted Coding | Relays coding requests to the Goose AI engine via SSE, manages coding sessions and recipes, and syncs generated code to GitHub. |
| Eureka | Service Discovery | Registry where all services self-register. Gateway resolves addresses dynamically — no hardcoded service URLs. |

---

## Detailed Scope

Each service maintains its own scope document covering functional and non-functional requirements:

- [API Gateway — SCOPE.md](../api-gateway/docs/SCOPE.md)
- [USM Service — SCOPE.md](../usm-service/docs/SCOPE.md)
- [ICIP Service — SCOPE.md](../icip-service/docs/SCOPE.md)
- [Data Service — SCOPE.md](../data-service/docs/SCOPE.md)
- [Vibe Service — SCOPE.md](../vibe-service/docs/SCOPE.md)
