# Data Service (Files, Data Adapters & Search)

## Overview

The Data Service manages **file storage, data adapters, dataset operations, and search functionality** for the ESSEDUM platform. It is decomposed from the monolithic `icip-lib-fsvr`, `icip-lib-adp`, `icip-lib-search`, and all `icip-adp-*` adapter modules.

## Technical Details

| Property          | Value                  |
|-------------------|------------------------|
| **Port**          | `8083`                 |
| **Service Name**  | `data-service`         |
| **Framework**     | Spring Boot 3.3.5      |
| **Java Version**  | 21                     |
| **Main Class**    | `com.lfn.data.DataServiceApplication` |
| **Source Files**   | 1,307 Java files       |

## Responsibilities

- **File Server** — File upload, download, and binary file management
- **Data Adapters** — Pluggable adapter framework for connecting to external data sources
- **Dataset Management** — Dataset CRUD, datasource connections, schema registry
- **Search** — Lucene-based full-text search and content indexing
- **Cloud Storage** — Integration with AWS S3, Azure Blob, GCP Cloud Storage, MinIO
- **Data Processing** — CSV, Excel, PDF parsing and data transformation
- **Streaming** — Kafka/RabbitMQ data stream processing
- **Pipeline & Job Execution** — Data pipeline jobs, native scripts, remote execution

## Source Modules (from Monolith)

| Original Module         | Description                          |
|-------------------------|--------------------------------------|
| `icip-lib-fsvr`         | File server operations               |
| `icip-lib-adp`          | Data adapter framework               |
| `icip-lib-search`       | Lucene search indexing               |
| `icip-adp-rest`         | REST API data adapter                |
| `icip-adp-s3`           | AWS S3 data adapter                  |
| `icip-adp-mysql`        | MySQL data adapter                   |
| `icip-adp-postgresql`   | PostgreSQL data adapter              |
| `icip-adp-azure`        | Azure Blob data adapter              |
| `icip-adp-aicloud`      | AI Cloud data adapter                |
| `icip-adp-aws-sagemaker`| AWS SageMaker data adapter           |
| `icip-adp-gcp-vertex`   | GCP Vertex AI data adapter           |
| `icip-adp-remote`       | Remote execution data adapter        |
| `common-app`            | Security, config, GitHub integration |
| `comm-lib-util`         | Shared utilities                     |

## REST Endpoints

### File & Data Operations
| Controller                         | Description                      |
|------------------------------------|----------------------------------|
| `FileServerController`            | File upload/download             |
| `ICIPFileController`              | File operations                  |
| `ICIPFolderController`            | Folder management                |
| `ICIPDatasetController`           | Dataset management               |
| `ICIPDatasourceController`        | Datasource connections           |
| `ICIPSchemaRegistryController`    | Schema registry                  |

### Adapters
| Controller                         | Description                      |
|------------------------------------|----------------------------------|
| `ICIPAdaptersController`          | Data adapter management          |
| `ICIPAdaptersV1Controller`        | Data adapters v1 API             |
| `MlAdaptersController`           | ML adapter management            |

### Pipeline & Jobs
| Controller                         | Description                      |
|------------------------------------|----------------------------------|
| `ICIPPipelineNewController`       | Pipeline CRUD & execution        |
| `ICIPJobsController`             | Job management & execution       |
| `InternalJobsController`         | Internal job operations          |
| `ICIPPluginController`           | Plugin management                |
| `DeploymentFormController`       | Deployment form operations       |

### Search & Discovery
| Controller                         | Description                      |
|------------------------------------|----------------------------------|
| `ICIPSearchableController`        | Full-text search                 |
| `ICIPTagsController`             | Tag management                   |
| `ICIPRatingController`           | Rating management                |
| `ICIPRelatedComponentsController` | Related component discovery      |

### Streaming & Services
| Controller                         | Description                      |
|------------------------------------|----------------------------------|
| `ICIPStreamingServicesController`  | Streaming service management     |
| `ICIPServicesController`          | Service management               |
| `ICIPAppsController`             | Application management           |
| `WebSocketController`            | WebSocket real-time updates      |
| `SSEController`                  | Server-Sent Events streaming     |

## Cloud Integrations

- **AWS S3** — Object storage via AWS SDK v2
- **Azure Blob Storage** — Blob storage via Azure SDK
- **GCP Cloud Storage** — Object storage via Google Cloud SDK
- **MinIO** — S3-compatible object storage
- **AWS SageMaker** — ML model training/deployment
- **GCP Vertex AI** — ML model management

## Database

- Supports **MySQL** and **PostgreSQL** via Spring profiles
- Schema managed by **Liquibase** changelogs
- Database name: `essedum_data` (recommended)

## Running

```bash
# Start discovery-service first, then:
mvn spring-boot:run -pl data-service -Dspring-boot.run.profiles=mysql
```

## Configuration

- `src/main/resources/application.yml` — Main configuration
- `src/main/resources/application-mysql.yml` — MySQL profile
- `src/main/resources/application-postgresql.yml` — PostgreSQL profile
- `src/main/resources/application-oauth2.yml` — OAuth2 profile

