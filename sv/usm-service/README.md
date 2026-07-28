# USM Service (User & Security Management)

## Documentation

| Document | Link |
|---|---|
| Scope & Requirements | [docs/SCOPE.md](docs/SCOPE.md) |
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |

## Overview

The USM Service handles all **user authentication, authorization, and organizational management** for the ESSEDUM platform.

## Technical Details

| Property | Value |
|---|---|
| **Port** | `8081` |
| **Service Name** | `usm-service` |
| **Framework** | Spring Boot 3.3.5 |
| **Java Version** | 21 |
| **Main Class** | `com.lfn.usm.UsmServiceApplication` |

## Source Modules

| Module | Description |
|---|---|
| `iamp-lib-usm` | Core USM domain, services, REST APIs |
| `common-app` | Security filters, JWT config, CORS |
| `comm-lib-util` | Shared utilities |
| `comm-lib-secrets` | Secrets management library |
| `common-lib-rest` | Common REST utilities |

## Build & Run

```bash
cd sv
mvn clean install -pl usm-service -am -Dmaven.test.skip=true
mvn spring-boot:run -pl usm-service
```

## Spring Profiles

| Profile | Purpose |
|---|---|
| `dbjwt` | DB-issued JWT authentication |
| `oauth2` | Keycloak OIDC authentication |
| `mysql` | MySQL datasource |
| `vault` | HashiCorp Vault for secrets |
