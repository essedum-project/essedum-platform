# ICIP Service (AI/ML Pipeline & Jobs)

## Documentation

| Document | Link |
|---|---|
| Scope & Requirements | [docs/SCOPE.md](docs/SCOPE.md) |
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |

## Overview

The ICIP Service is the **core AI/ML pipeline engine** for the ESSEDUM platform. It manages job execution, pipeline orchestration, event handling, model management, MLOps workflows, and AI agent operations.

## Technical Details

| Property | Value |
|---|---|
| **Port** | `8082` |
| **Service Name** | `icip-service` |
| **Framework** | Spring Boot 3.3.5 |
| **Java Version** | 21 |
| **Main Class** | `com.lfn.icip.IcipServiceApplication` |

## Source Modules

| Module | Description |
|---|---|
| `icip-lib-iai` | Core AI/ML pipeline, AI agents, code gen |
| `icip-lib-jobs` | Job scheduling, execution, chains |
| `icip-lib-evt` | Event management, event-job mappings |
| `icip-lib-mod` | Model management, endpoints |
| `icip-lib-mlops` | MLOps, federated runtime |
| `icip-lib-fsvr` | File server operations |
| `icip-lib-adp` | Data adapter framework |
| `icip-lib-search` | Lucene search indexing |
| `icip-adp-*` | All data adapter plugins |

## Build & Run

```bash
cd sv
mvn clean install -pl icip-service -am -Dmaven.test.skip=true
mvn spring-boot:run -pl icip-service
```

## Spring Profiles

| Profile | Purpose |
|---|---|
| `dbjwt` | DB-issued JWT authentication |
| `oauth2` | Keycloak OIDC authentication |
| `mysql` | MySQL datasource |
| `vault` | HashiCorp Vault for secrets |
| `btf` | BTF configuration |
