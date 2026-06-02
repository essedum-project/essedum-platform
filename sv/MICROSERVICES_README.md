# ESSEDUM Platform - Microservices Architecture

## Overview

The ESSEDUM platform has been decomposed from a monolithic architecture into **4 microservices** plus shared infrastructure (API Gateway + Service Discovery).

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY (:8080)                                │
│                     (Spring Cloud Gateway)                                 │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┬───────────────┐
          ▼               ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   USM SERVICE   │ │  ICIP SERVICE   │ │  DATA SERVICE   │ │  VIBE SERVICE   │
│    (:8081)      │ │    (:8082)      │ │    (:8083)      │ │    (:8084)      │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ • Authentication│ │ • Job Execution │ │ • File Storage  │ │ • Goose API     │
│ • Authorization │ │ • Pipelines     │ │ • Data Adapters │ │ • Sessions      │
│ • User Mgmt     │ │ • Events        │ │ • Dataset Mgmt  │ │ • GitHub Sync   │
│ • Roles/Perms   │ │ • Models        │ │ • Search        │ │ • Code Gen      │
│ • Organizations │ │ • MLOps         │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
          │                                                           │
          └──────────── Eureka Discovery Service (:8761) ─────────────┘
```

## Services

### 1. USM Service (`usm-service`) - Port 8081
**User & Security Management**

| Component | Description |
|-----------|-------------|
| Module | `iamp-lib-usm` |
| Package | `com.lfn.iamp.usm` |
| Endpoints | `/api/users/**`, `/api/roles/**`, `/api/organisations/**`, `/api/authenticate` |
| DB Pool | 20 connections |

**Includes:** Users, Roles, Permissions, Organizations, Org Units, Projects, Delegates, Email, Notifications, Country/TimeZones, Access Tokens, Process Mappings

### 2. ICIP Service (`icip-service`) - Port 8082
**AI/ML Pipeline & Jobs**

| Component | Description |
|-----------|-------------|
| Modules | `icip-lib-iai`, `icip-lib-jobs`, `icip-lib-evt`, `icip-lib-mod`, `icip-lib-mlops` |
| Package | `com.lfn.icip` |
| Endpoints | `/api/aip/**`, `/api/event/**`, `/api/webhook/**`, `/api/modelservice/**`, `/api/exp/**` |
| DB Pool | 30 connections (main) + 8 (quartz) + 8 (model) |

**Includes:** Job scheduling (Quartz), Pipeline management, Event publishing, Model management, MLOps REST API, WebSocket/SSE streaming, Kafka/RabbitMQ messaging

### 3. Data Service (`data-service`) - Port 8083
**Files & Data Adapters**

| Component | Description |
|-----------|-------------|
| Modules | `icip-lib-fsvr`, `icip-lib-adp`, `icip-lib-search`, `icip-adp-*` |
| Package | `com.lfn.icip.icipwebeditor.fileserver`, `com.lfn.icip.icipwebeditor.adapter` |
| Endpoints | `/api/file/**`, `/api/datasets/**`, `/api/adapters/**` |
| DB Pool | 20 connections |

**Includes:** File upload/download (Local/MinIO/Azure/S3), Data adapters (REST, S3, MySQL, PostgreSQL, Azure, AI Cloud, SageMaker, GCP Vertex, Remote), Dataset management, Search (Lucene)

### 4. Vibe Service (`vibe-service`) - Port 8084
**AI-Assisted Coding**

| Component | Description |
|-----------|-------------|
| Modules | `icip-lib-vibe`, `common-app` (GitHub controllers) |
| Package | `com.lfn.icip.vibecoding`, `com.lfn.common.app.controller` |
| Endpoints | `/api/vibe/**`, `/api/goose/**`, `/api/github/**` |
| DB Pool | 15 connections |

**Includes:** Goose AI API relay, Coding sessions, SSE streaming, GitHub push/pull/PR, GitHub OAuth, Recipe management

## Shared Libraries (Unchanged)

| Library | Description |
|---------|-------------|
| `comm-lib-util` | HTTP utilities, file validation, header extraction |
| `comm-lib-secrets` | AES/GCM encryption, secrets manager |
| `comm-secrets-app` | Database-backed secrets management |
| `common-lib-rest` | REST client utilities, OAuth2 token support |
| `common-app` | Security infrastructure (JWT, OAuth2, CORS, exception handlers) — used as a library dependency |

## Infrastructure

| Service | Port | Purpose |
|---------|------|---------|
| `discovery-service` | 8761 | Eureka service discovery |
| `api-gateway` | 8080 | Spring Cloud Gateway routing |

## Database Connection Distribution

| Service | Max Connections |
|---------|-----------------|
| USM Service | 20 |
| ICIP Service | 46 (30 + 8 + 8) |
| Data Service | 20 |
| Vibe Service | 15 |
| **Total** | **101** (vs. 624 in monolith) |

## Quick Start

### Build All Services
```bash
cd sv
mvn clean package -DskipTests
```

### Run Individual Services
```bash
# Start Discovery Service first
java -jar discovery-service/target/discovery-service-3.3-SNAPSHOT.jar

# Start API Gateway
java -jar api-gateway/target/api-gateway-3.3-SNAPSHOT.jar

# Start microservices (in any order)
java -jar usm-service/target/usm-service-3.3-SNAPSHOT.jar --spring.profiles.active=mysql,dbjwt
java -jar icip-service/target/icip-service-3.3-SNAPSHOT.jar --spring.profiles.active=mysql,dbjwt
java -jar data-service/target/data-service-3.3-SNAPSHOT.jar --spring.profiles.active=mysql,dbjwt
java -jar vibe-service/target/vibe-service-3.3-SNAPSHOT.jar --spring.profiles.active=mysql,dbjwt
```

### Run with Docker Compose
```bash
cd sv
mvn clean package -DskipTests
docker-compose -f docker-compose-microservices.yml up -d
```

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `MYSQL_DATASOURCE_URL` | `localhost:3306` | MySQL host:port |
| `MYSQL_USER` | `root` | Database username |
| `MYSQL_PASSWORD` | `password` | Database password |
| `JWT_SECRET` | (built-in) | JWT signing secret |
| `EUREKA_ENABLED` | `false` | Enable Eureka registration |
| `EUREKA_URL` | `http://localhost:8761/eureka` | Eureka URL |
| `KAFKA_SERVERS` | `localhost:9092` | Kafka bootstrap servers (ICIP only) |
| `GOOSE_URL` | `http://localhost:30132` | Goose API URL (Vibe only) |
| `GOOSE_SECRET_KEY` | `sk-1234` | Goose API key (Vibe only) |

## Project Structure

```
sv/
├── pom.xml                          # Parent POM (includes all modules)
│
├── # --- Shared Libraries (unchanged) ---
├── comm-lib-util/                   # Common utilities
├── comm-lib-secrets/                # Secrets management
├── comm-secrets-app/                # Secrets app layer
├── common-lib-rest/                 # REST utilities
├── common-app/                      # Security infrastructure (used as library)
│
├── # --- Domain Libraries (unchanged) ---
├── iamp-lib-usm/                    # USM business logic
├── icip-lib-iai/                    # AI/ML pipeline core
├── icip-lib-jobs/                   # Job scheduling
├── icip-lib-evt/                    # Event management
├── icip-lib-mod/                    # Model management
├── icip-lib-mlops/                  # MLOps API
├── icip-lib-fsvr/                   # File server
├── icip-lib-adp/                    # Data adapter core
├── icip-lib-search/                 # Search
├── icip-lib-vibe/                   # Vibe AI coding
├── icip-adp-*/                      # Data adapter plugins
│
├── # --- NEW: Microservices ---
├── usm-service/                     # USM Microservice (port 8081)
├── icip-service/                    # ICIP Microservice (port 8082)
├── data-service/                    # Data Microservice (port 8083)
├── vibe-service/                    # Vibe Microservice (port 8084)
│
├── # --- NEW: Infrastructure ---
├── discovery-service/               # Eureka Server (port 8761)
├── api-gateway/                     # API Gateway (port 8080)
│
├── # --- Deployment ---
├── docker-compose-microservices.yml # Docker Compose orchestration
├── Dockerfile_usm                   # USM service Dockerfile
├── Dockerfile_icip                  # ICIP service Dockerfile
├── Dockerfile_data                  # Data service Dockerfile
└── Dockerfile_vibe                  # Vibe service Dockerfile
```

## Key Design Decisions

1. **Shared Security via common-app**: Each service depends on `common-app` as a library to reuse JWT authentication, CORS config, and exception handlers. No security code duplication.

2. **Existing Libraries Unchanged**: All business logic remains in the original library modules (`iamp-lib-usm`, `icip-lib-*`, etc.). The new services are thin Spring Boot application wrappers that compose the right libraries.

3. **Selective Component Scanning**: Each service's `@ComponentScan` targets only the packages relevant to its bounded context, preventing cross-service bean conflicts.

4. **Shared JWT Secret**: All services use the same JWT secret for token validation, enabling seamless cross-service authentication.

5. **API Gateway Routing**: The gateway routes requests by URL path patterns to the correct service, maintaining backward compatibility with existing API contracts.

6. **Optional Eureka**: Service discovery via Eureka is optional (`EUREKA_ENABLED=false` by default). Services can function with direct URLs for simpler deployments.

