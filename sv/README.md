# ESSEDUM Platform — Backend Services

> **Microservices-based backend** for the ESSEDUM platform, built with **Java 21** and **Spring Boot 3.3.x**.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites & Tools](#prerequisites--tools)
3. [Services](#services)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
   - [Build](#build)
   - [Run Locally (without Docker)](#run-locally-without-docker)
   - [Run with Docker Compose](#run-with-docker-compose)
6. [Environment Variables](#environment-variables)
7. [API Endpoints](#api-endpoints)
8. [Health Checks](#health-checks)
9. [Database Configuration](#database-configuration)
10. [Spring Profiles](#spring-profiles)
11. [Testing APIs](#testing-apis)
12. [Troubleshooting](#troubleshooting)
13. [Key Design Decisions](#key-design-decisions)

---

## Architecture Overview

The ESSEDUM backend has been decomposed from a monolithic application into **4 microservices** plus shared infrastructure (API Gateway + Service Discovery).

```text
                        ┌──────────────────────────────────────────┐
                        │       API GATEWAY  (Port 8080)           │
                        │       Spring Cloud Gateway               │
                        └──────────┬───────┬───────┬───────┬───────┘
                                   │       │       │       │
              ┌────────────────────┘       │       │       └────────────────────┐
              ▼                            ▼       ▼                            ▼
  ┌───────────────────┐     ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
  │  USM SERVICE      │     │  ICIP SERVICE     │ │  DATA SERVICE     │ │  VIBE SERVICE     │
  │  Port 8081        │     │  Port 8082        │ │  Port 8083        │ │  Port 8084        │
  ├───────────────────┤     ├───────────────────┤ ├───────────────────┤ ├───────────────────┤
  │ • Authentication  │     │ • Job Execution   │ │ • File Storage    │ │ • Goose AI API    │
  │ • Authorization   │     │ • ML Pipelines    │ │ • Data Adapters   │ │ • Coding Sessions │
  │ • User Management │     │ • Events          │ │ • Dataset Mgmt    │ │ • GitHub Sync     │
  │ • Roles & Perms   │     │ • Model Registry  │ │ • Search (Lucene) │ │ • Code Generation │
  │ • Organizations   │     │ • MLOps           │ │                   │ │ • Recipes         │
  └───────────────────┘     └───────────────────┘ └───────────────────┘ └───────────────────┘
              │                                                                  │
              └─────────── Eureka Discovery Service (Port 8761) ─────────────────┘
```

All requests enter via the **API Gateway** on port **8080** and are routed to the appropriate service based on URL path patterns.

---

## Prerequisites & Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Java (JDK)** | 21+ | Runtime & compilation |
| **Apache Maven** | 3.9.6+ | Build tool |
| **MySQL** or **PostgreSQL** | 8.x / 15.x | Relational database |
| **Docker** | 24+ | Containerisation (optional) |
| **Docker Compose** | 2.20+ | Multi-container orchestration (optional) |
| **Git** | 2.40+ | Version control |
| **IDE (recommended)** | IntelliJ IDEA 2024+ | Development |
| **Postman** (optional) | Latest | API testing |

### Optional External Services (depending on features used)

| Service | Required For |
|---------|-------------|
| **Apache Kafka** | Event streaming in ICIP Service |
| **MinIO / AWS S3** | Object storage in Data Service |
| **Azure Blob Storage** | Cloud file storage in Data Service |
| **GCP Vertex AI / AWS SageMaker** | ML model execution in ICIP Service |
| **Keycloak** | OAuth2 authentication (when using `oauth2` profile) |
| **Goose AI** | AI-assisted coding in Vibe Service |
| **NGINX** | Reverse proxy (containerised deployments) |

---

## Services

### Infrastructure

| Service | Port | Description |
|---------|------|-------------|
| **Discovery Service** | `8761` | Netflix Eureka — service registry & discovery |
| **API Gateway** | `8080` | Spring Cloud Gateway — unified entry point, routing, load balancing |

### Microservices

| # | Service | Port | Bounded Context | Key Endpoints |
|---|---------|------|-----------------|---------------|
| 1 | **USM Service** | `8081` | User & Security Management | `/api/authenticate`, `/api/users/**`, `/api/roles/**`, `/api/organisations/**` |
| 2 | **ICIP Service** | `8082` | AI / ML Pipelines & Jobs | `/api/aip/**`, `/api/event/**`, `/api/webhook/**`, `/api/modelservice/**` |
| 3 | **Data Service** | `8083` | Files & Data Adapters | `/api/file/**`, `/api/datasets/**`, `/api/adapters/**` |
| 4 | **Vibe Service** | `8084` | AI-Assisted Coding | `/api/vibe/**`, `/api/goose/**`, `/api/github/**` |

### Database Connection Pool

| Service | Max Connections | Notes |
|---------|----------------|-------|
| USM Service | 20 | Single datasource |
| ICIP Service | 46 | 30 (main) + 8 (Quartz) + 8 (Model) |
| Data Service | 20 | Single datasource |
| Vibe Service | 15 | Single datasource |
| **Total** | **101** | Reduced from 624 in the monolith |

---

## Project Structure

```text
sv/
├── pom.xml                              # Parent POM (all modules)
│
├── ── Shared Libraries ──────────────
├── comm-lib-util/                       # HTTP utilities, file validation, header extraction
├── comm-lib-secrets/                    # AES/GCM encryption, secrets manager
├── comm-secrets-app/                    # Database-backed secrets management
├── common-lib-rest/                     # REST client utilities, OAuth2 token support
├── common-app/                          # Security infra (JWT, OAuth2, CORS, exception handlers)
│
├── ── Domain Libraries ──────────────
├── iamp-lib-usm/                        # USM business logic
├── icip-lib-iai/                        # AI/ML pipeline core
├── icip-lib-jobs/                       # Job scheduling (Quartz)
├── icip-lib-evt/                        # Event management
├── icip-lib-mod/                        # Model management
├── icip-lib-mlops/                      # MLOps REST API
├── icip-lib-fsvr/                       # File server
├── icip-lib-adp/                        # Data adapter core
├── icip-lib-search/                     # Search (Lucene)
├── icip-lib-vibe/                       # Vibe AI coding
├── icip-adp-*/                          # Data adapter plugins (S3, Azure, SageMaker, GCP Vertex…)
│
├── ── Microservices ─────────────────
├── usm-service/                         # USM Microservice  → port 8081
├── icip-service/                        # ICIP Microservice → port 8082
├── data-service/                        # Data Microservice → port 8083
├── vibe-service/                        # Vibe Microservice → port 8084
│
├── ── Infrastructure ────────────────
├── discovery-service/                   # Eureka Server     → port 8761
├── api-gateway/                         # API Gateway       → port 8080
│
├── ── Deployment ────────────────────
├── docker-compose-microservices.yml     # Docker Compose orchestration
├── Dockerfile_usm                       # USM Dockerfile
├── Dockerfile_icip                      # ICIP Dockerfile
├── Dockerfile_data                      # Data Dockerfile
├── Dockerfile_vibe                      # Vibe Dockerfile
│
├── ── Documentation ─────────────────
├── README.md                            # This file
├── MICROSERVICES_README.md              # Architecture deep-dive
└── MICROSERVICES_DECOMPOSITION.md       # Decomposition strategy & rationale
```

---

## Getting Started

### Build

```bash
# From the sv/ directory
mvn clean package -DskipTests
```

This compiles all modules, runs packaging, and produces executable JARs under each service's `target/` directory.

### Run Locally (without Docker)

> **Prerequisite**: Make sure MySQL/PostgreSQL is running and accessible.

**Step 1 — Start Discovery Service (Eureka)**

```bash
java -jar discovery-service/target/discovery-service-3.3-SNAPSHOT.jar
```

Wait until you see `Started DiscoveryServiceApplication` in the console.  
Eureka dashboard: [http://localhost:8761](http://localhost:8761)

**Step 2 — Start API Gateway**

```bash
java -jar api-gateway/target/api-gateway-3.3-SNAPSHOT.jar
```

**Step 3 — Start Microservices** (in separate terminals, any order)

```bash
# USM Service
java -jar usm-service/target/usm-service-3.3-SNAPSHOT.jar --spring.profiles.active=mysql,dbjwt

# ICIP Service
java -jar icip-service/target/icip-service-3.3-SNAPSHOT.jar --spring.profiles.active=mysql,dbjwt

# Data Service
java -jar data-service/target/data-service-3.3-SNAPSHOT.jar --spring.profiles.active=mysql,dbjwt

# Vibe Service
java -jar vibe-service/target/vibe-service-3.3-SNAPSHOT.jar --spring.profiles.active=mysql,dbjwt
```

**Step 4 — Verify**

```bash
curl http://localhost:8080/actuator/health   # API Gateway
curl http://localhost:8081/actuator/health   # USM
curl http://localhost:8082/actuator/health   # ICIP
curl http://localhost:8083/actuator/health   # Data
curl http://localhost:8084/actuator/health   # Vibe
```

### Run with Docker Compose

```bash
# 1. Build JARs first
mvn clean package -DskipTests

# 2. Start all services (detached)
docker-compose -f docker-compose-microservices.yml up -d

# 3. View logs
docker-compose -f docker-compose-microservices.yml logs -f

# 4. Stop all
docker-compose -f docker-compose-microservices.yml down
```

Docker Compose starts services in the correct order using health-check dependencies.

---

## Environment Variables

### Common (all services)

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_PROFILES_ACTIVE` | `mysql,dbjwt` | Active Spring profiles |
| `MYSQL_DATASOURCE_URL` | `localhost:3306` | MySQL `host:port` |
| `MYSQL_USER` | `root` | Database username |
| `MYSQL_PASSWORD` | `password` | Database password |
| `JWT_SECRET` | *(built-in)* | Shared JWT signing secret — **must be the same across all services** |
| `EUREKA_ENABLED` | `false` | Enable/disable Eureka registration |
| `EUREKA_URL` | `http://localhost:8761/eureka` | Eureka server URL |
| `JAVA_OPTS` | *(varies)* | JVM options (e.g. `-Xms256m -Xmx512m`) |

### Service-Specific

| Variable | Service | Default | Description |
|----------|---------|---------|-------------|
| `KAFKA_SERVERS` | ICIP | `localhost:9092` | Kafka bootstrap servers |
| `MINIO_URL` | Data | — | MinIO / S3-compatible endpoint |
| `MINIO_ACCESS_KEY` | Data | — | MinIO access key |
| `MINIO_SECRET_KEY` | Data | — | MinIO secret key |
| `GOOSE_URL` | Vibe | `http://localhost:30132` | Goose AI API URL |
| `GOOSE_SECRET_KEY` | Vibe | `sk-1234` | Goose AI API key |
| `VIBE_GITHUB_ENABLED` | Vibe | `false` | Enable GitHub integration |
| `VIBE_GITHUB_TOKEN` | Vibe | — | GitHub personal access token |
| `USM_SERVICE_URL` | ICIP, Data, Vibe | `http://localhost:8081` | USM service base URL (inter-service calls) |
| `DATA_SERVICE_URL` | ICIP | `http://localhost:8083` | Data service base URL |

---

## API Endpoints

> All requests should go through the **API Gateway** at `http://localhost:8080`.

### USM Service — User & Security Management (~60+ endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/authenticate` | Login — returns JWT token |
| `GET` | `/api/userss` | List all users |
| `GET` | `/api/userss/page?page=0&size=10` | Paginated user list |
| `GET` | `/api/userss/get-user/{login}` | Get user by login |
| `POST` | `/api/userss` | Create user |
| `GET` | `/api/roles` | List all roles |
| `GET` | `/api/usm-permissionss` | List all permissions |
| `GET` | `/api/usm-portfolios` | List portfolios (organizations) |
| `GET` | `/api/user-project-roles` | User project roles |
| `GET` | `/api/usm-notificationss/page?page=0&size=10` | Notifications (paginated) |
| `GET` | `/api/usm-modules` | List modules |

### ICIP Service — AI / ML Operations (~65+ endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/aip/service/v1/datasets/list?org=default` | List datasets |
| `POST` | `/api/aip/service/v1/datasets` | Create dataset |
| `GET` | `/api/aip/service/v1/models/list/default` | List models |
| `POST` | `/api/aip/service/v1/models/register` | Register model |
| `GET` | `/api/aip/service/v1/endpoints/list?org=default` | List endpoints |
| `GET` | `/api/aip/service/v1/pipelines/training/list?org=default` | Training pipelines |
| `GET` | `/api/aip/service/v1/adapters/list?org=default` | List adapters |
| `GET` | `/api/aip/service/v1/datasources/list?org=default` | List datasources |

### Data Service — Files & Storage (~15+ endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/aip/fileserver/upload` | Upload file (multipart) |
| `GET` | `/api/aip/fileserver/downloadFile/{id}/{org}` | Download file |
| `GET` | `/api/github/repos` | List GitHub repos |
| `GET` | `/api/github/branches?repo=my-repo` | List branches |
| `POST` | `/api/github/verify-token` | Verify GitHub token |

### Vibe Service — AI-Assisted Coding (~90+ endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/aip/service/v1/vibe-coding/status` | Goose AI status |
| `POST` | `/api/aip/service/v1/vibe-coding/agent/start` | Start coding session |
| `POST` | `/api/aip/service/v1/vibe-coding/reply` | Send chat message (SSE stream) |
| `GET` | `/api/aip/service/v1/vibe-coding/sessions` | List sessions |
| `POST` | `/api/aip/service/v1/vibe-coding/agent/stop` | Stop agent |
| `GET` | `/api/aip/service/v1/vibe-coding/config/providers` | List AI providers |
| `GET` | `/api/aip/service/v1/vibe-coding/recipes/list` | List recipes |

---

## Health Checks

All services expose Spring Boot Actuator health endpoints (**no authentication required**):

```bash
curl http://localhost:8080/actuator/health   # API Gateway
curl http://localhost:8081/actuator/health   # USM Service
curl http://localhost:8082/actuator/health   # ICIP Service
curl http://localhost:8083/actuator/health   # Data Service
curl http://localhost:8084/actuator/health   # Vibe Service
curl http://localhost:8761/actuator/health   # Eureka Discovery
```

Expected response: `{"status":"UP"}`

---

## Database Configuration

### MySQL (default)

All services share the same MySQL database. Activate the `mysql` profile:

```bash
--spring.profiles.active=mysql,dbjwt
```

Connection URL pattern:
```
jdbc:mysql://${MYSQL_DATASOURCE_URL}/essedum?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
```

### PostgreSQL

Activate the `postgresql` profile instead:

```bash
--spring.profiles.active=postgresql,dbjwt
```

---

## Spring Profiles

| Profile | Description |
|---------|-------------|
| `mysql` | Use MySQL datasource |
| `postgresql` | Use PostgreSQL datasource |
| `dbjwt` | Database-backed JWT authentication |
| `oauth2` | Keycloak / OAuth2 authentication |
| `dev` | Development settings (verbose logging, etc.) |

Profiles are combined: `--spring.profiles.active=mysql,dbjwt`

---

## Testing APIs

### Using Postman

1. Create a new Postman collection for the Essedum services (a prebuilt collection file is not currently included in this repo).
2. Set collection variables:

   | Variable | Value |
   |----------|-------|
   | `gateway_url` | `http://localhost:8080` |
   | `usm_direct_url` | `http://localhost:8081` |
   | `icip_direct_url` | `http://localhost:8082` |
   | `data_direct_url` | `http://localhost:8083` |
   | `vibe_direct_url` | `http://localhost:8084` |

3. Run **"USM Service → Authentication → Login (JWT)"** first — the token auto-saves to the `auth_token` variable.
4. All subsequent requests use the saved token automatically.

### Using cURL

```bash
# 1. Authenticate and get token
curl -X POST http://localhost:8080/api/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin@121$","rememberMe":false}'

# 2. Copy the id_token from the response
TOKEN="<paste id_token here>"

# 3. Use the token for any API call
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/userss
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ClassNotFoundException: javax.wsdl.extensions.ExtensibilityElement` | Add `javax.wsdl:wsdl4j:1.6.3` dependency to the service's `pom.xml` |
| Port already in use | Check for processes on ports 8080–8084 and 8761; kill or change `server.port` |
| Eureka connection refused | Start Discovery Service first, or set `EUREKA_ENABLED=false` for standalone mode |
| JWT token invalid across services | Ensure all services use the **same `JWT_SECRET`** value |
| Database connection failures | Verify `MYSQL_DATASOURCE_URL`, `MYSQL_USER`, `MYSQL_PASSWORD` env vars |
| Kafka connection errors (ICIP) | Ensure Kafka is running on configured `KAFKA_SERVERS`, or disable Kafka if not needed |
| Docker build failures | Run `mvn clean package -DskipTests` before `docker-compose up` |
| CORS errors from frontend | API Gateway handles CORS; verify gateway config matches frontend origin |

---

## Key Design Decisions

1. **Shared Security via `common-app`** — Each service depends on `common-app` as a library, reusing JWT authentication, CORS config, and exception handlers. Zero security code duplication.

2. **Existing Libraries Unchanged** — All business logic stays in the original library modules (`iamp-lib-usm`, `icip-lib-*`, etc.). Services are thin Spring Boot wrappers composing the right libraries.

3. **Selective Component Scanning** — Each service's `@ComponentScan` targets only packages relevant to its bounded context, preventing cross-service bean conflicts.

4. **Shared JWT Secret** — All services use the same JWT secret for token validation, enabling seamless cross-service authentication.

5. **API Gateway Routing** — The gateway routes requests by URL path patterns to the correct service, maintaining full backward compatibility with existing API contracts.

6. **Optional Eureka** — Service discovery via Eureka is optional (`EUREKA_ENABLED=false` by default). Services work with direct URLs for simpler deployments.

---

## Further Reading

- [Microservices Architecture Details](./MICROSERVICES_README.md)
- [Decomposition Strategy & Rationale](./MICROSERVICES_DECOMPOSITION.md)
