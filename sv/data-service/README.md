# Data Service (Files, Data Adapters & Search)

## Documentation

| Document | Link |
|---|---|
| Scope & Requirements | [docs/SCOPE.md](docs/SCOPE.md) |
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| OpenAPI Spec | [docs/openapi.yaml](docs/openapi.yaml) *(generate from running instance — see ARCHITECTURE.md)* |

## Overview

The Data Service manages **file storage, data adapters, dataset operations, and search functionality** for the ESSEDUM platform.

## Technical Details

| Property | Value |
|---|---|
| **Port** | `8083` |
| **Service Name** | `data-service` |
| **Framework** | Spring Boot 3.3.5 |
| **Java Version** | 21 |
| **Main Class** | `com.lfn.data.DataServiceApplication` |
| **Swagger UI** | `/swagger-ui/index.html` |

## Source Modules

| Module | Description |
|---|---|
| `icip-lib-fsvr` | File server operations |
| `icip-lib-adp` | Data adapter framework |
| `icip-lib-search` | Lucene search indexing |
| `icip-adp-rest` | REST API data adapter |
| `icip-adp-s3` | AWS S3 data adapter |
| `icip-adp-mysql` | MySQL data adapter |
| `icip-adp-postgresql` | PostgreSQL data adapter |
| `icip-adp-azure` | Azure Blob data adapter |
| `icip-adp-aws-sagemaker` | AWS SageMaker data adapter |
| `icip-adp-gcp-vertex` | GCP Vertex AI data adapter |

## Build & Run

```bash
cd sv
mvn clean install -pl data-service -am -Dmaven.test.skip=true
mvn spring-boot:run -pl data-service
```

## Spring Profiles

| Profile | Purpose |
|---|---|
| `dbjwt` | DB-issued JWT authentication |
| `oauth2` | Keycloak OIDC authentication |
| `mysql` | MySQL datasource |
| `vault` | HashiCorp Vault for secrets |
