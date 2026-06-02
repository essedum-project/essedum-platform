# ICIP Service (AI/ML Pipeline & Jobs)

## Overview

The ICIP Service is the **core AI/ML pipeline engine** for the ESSEDUM platform. It manages job execution, pipeline orchestration, event handling, model management, MLOps workflows, and AI agent operations. It is decomposed from the monolithic `icip-lib-iai`, `icip-lib-jobs`, `icip-lib-evt`, `icip-lib-mod`, and `icip-lib-mlops` modules.

## Technical Details

| Property          | Value                  |
|-------------------|------------------------|
| **Port**          | `8082`                 |
| **Service Name**  | `icip-service`         |
| **Framework**     | Spring Boot 3.3.5      |
| **Java Version**  | 21                     |
| **Main Class**    | `com.lfn.icip.IcipServiceApplication` |
| **Source Files**   | 1,319 Java files       |

## Responsibilities

- **Job Execution** — Run, schedule, and monitor AI/ML jobs (native scripts, drag-and-drop, LangChain, HayStack, agents)
- **Pipeline Management** — Create, edit, and execute multi-step data/ML pipelines
- **Event Management** — Event-driven job triggering, event-job mappings
- **Model Management** — ML model registry, endpoints, pipeline models
- **MLOps** — Federated runtime, model deployment, A/B testing
- **AI Agents** — Agent directory, agent job execution, AI agent scripts
- **Streaming Services** — Kafka/RabbitMQ stream processing, WebSocket real-time updates
- **Code Generation** — AI-powered code generation (Azure OpenAI, AWS Bedrock, GCP Vertex AI)
- **Plugin System** — Extensible plugin architecture for custom job types
- **Dataset & Datasource Management** — Dataset CRUD, datasource connections, schema registry
- **File Server** — File upload/download, binary file management
- **Search** — Lucene-based searchable content indexing

## Source Modules (from Monolith)

| Original Module      | Description                              |
|----------------------|------------------------------------------|
| `icip-lib-iai`       | Core AI/ML pipeline, AI agents, code gen |
| `icip-lib-jobs`      | Job scheduling, execution, chains        |
| `icip-lib-evt`       | Event management, event-job mappings     |
| `icip-lib-mod`       | Model management, endpoints              |
| `icip-lib-mlops`     | MLOps, federated runtime                 |
| `icip-lib-fsvr`      | File server operations                   |
| `icip-lib-adp`       | Data adapter framework                   |
| `icip-lib-search`    | Lucene search indexing                   |
| `icip-adp-*`         | All data adapter plugins                 |
| `common-app`         | Security, config, GitHub integration     |
| `comm-lib-util`      | Shared utilities                         |

## REST Endpoints

### Pipeline & Jobs
| Controller                         | Description                      |
|------------------------------------|----------------------------------|
| `ICIPPipelineNewController`        | Pipeline CRUD & execution        |
| `ICIPJobsController`              | Job management & execution       |
| `InternalJobsController`          | Internal job operations          |
| `ICIPPluginController`            | Plugin management                |
| `DeploymentFormController`        | Deployment form operations       |

### AI & ML
| Controller                         | Description                      |
|------------------------------------|----------------------------------|
| `ICIPCodeGenController`           | AI code generation               |
| `ICIPAgentDirectoryController`    | AI agent directory               |
| `ICIPAIOpsController`            | AI operations                    |
| `ICIPGroupModelController`       | Group model management           |
| `ICIPLangflowController`        | LangFlow integration             |
| `ICIPMLFederatedRuntimeController` | Federated ML runtime            |
| `ICIPMlopsController`            | MLOps operations                 |

### Data & Files
| Controller                         | Description                      |
|------------------------------------|----------------------------------|
| `ICIPDatasetController`           | Dataset management               |
| `ICIPDatasourceController`        | Datasource connections           |
| `ICIPFileController`              | File operations                  |
| `ICIPFolderController`            | Folder management                |
| `FileServerController`           | File server upload/download      |
| `ICIPSchemaRegistryController`   | Schema registry                  |
| `ICIPAdaptersController`         | Data adapter management          |

### Streaming & Events
| Controller                         | Description                      |
|------------------------------------|----------------------------------|
| `ICIPStreamingServicesController`  | Streaming service management     |
| `ICIPServicesController`          | Service management               |
| `WebSocketController`            | WebSocket real-time updates      |
| `SSEController`                  | Server-Sent Events streaming     |
| `WebhookController`              | Webhook handling                 |

### Search & Tags
| Controller                         | Description                      |
|------------------------------------|----------------------------------|
| `ICIPSearchableController`        | Full-text search                 |
| `ICIPTagsController`             | Tag management                   |
| `ICIPRatingController`           | Rating management                |
| `ICIPRelatedComponentsController` | Related component discovery      |

### ML Resources
| Controller                         | Description                      |
|------------------------------------|----------------------------------|
| `MlAdaptersController`           | ML adapter management            |
| `MlInstancesController`          | ML instance management           |
| `MlSpecTemplatesController`      | ML specification templates       |

## AI/LLM Integrations

- **Azure OpenAI** — via LangChain4j
- **AWS Bedrock** — via LangChain4j
- **GCP Vertex AI Gemini** — via LangChain4j
- **Azure AI Text Analytics** — Sentiment analysis

## Database

- Supports **MySQL** and **PostgreSQL** via Spring profiles
- Schema managed by **Liquibase** changelogs
- Database name: `essedum_core` (recommended)

## Running

```bash
# Start discovery-service first, then:
mvn spring-boot:run -pl icip-service -Dspring-boot.run.profiles=mysql
```

## Configuration

- `src/main/resources/application.yml` — Main configuration
- `src/main/resources/application-mysql.yml` — MySQL profile
- `src/main/resources/application-postgresql.yml` — PostgreSQL profile
- `src/main/resources/application-oauth2.yml` — OAuth2 profile

