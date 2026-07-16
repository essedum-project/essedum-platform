# Vibe Service (AI-Assisted Coding)

## Documentation

| Document | Link |
|---|---|
| Scope & Requirements | [docs/SCOPE.md](docs/SCOPE.md) |
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |

## Overview

The Vibe Service provides **AI-assisted coding capabilities** for the ESSEDUM platform. It integrates with the Goose AI engine for code generation, manages coding sessions, handles GitHub synchronization, and supports SSE streaming for real-time AI responses.

## Technical Details

| Property | Value |
|---|---|
| **Port** | `8084` |
| **Service Name** | `vibe-service` |
| **Framework** | Spring Boot 3.3.5 |
| **Java Version** | 21 |
| **Main Class** | `com.lfn.vibe.VibeServiceApplication` |

## Source Modules

| Module | Description |
|---|---|
| `icip-lib-vibe` | Goose API relay, session management, SSE |
| `common-app` | GitHub OAuth controllers, integration |
| `comm-lib-util` | Shared utilities |
| `comm-lib-secrets` | Secrets management library |
| `common-lib-rest` | Common REST utilities |

## Build & Run

```bash
cd sv
mvn clean install -pl vibe-service -am -Dmaven.test.skip=true
mvn spring-boot:run -pl vibe-service
```

## Spring Profiles

| Profile | Purpose |
|---|---|
| `dbjwt` | DB-issued JWT authentication |
| `oauth2` | Keycloak OIDC authentication |
| `mysql` | MySQL datasource |
| `vault` | HashiCorp Vault for secrets |
| `github` | GitHub integration |
