# ESSEDUM Platform — Backend Services

> Java 21 / Spring Boot 3.x microservices backend.

## Documentation

| Document | Link |
|---|---|
| Backend Scope & Requirements | [sv/docs/SCOPE.md](docs/SCOPE.md) |
| Backend Architecture Overview | [sv/docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |

## Services

| Service | Port | docs/ |
|---|---|---|
| API Gateway | 8080 | [api-gateway/docs/](api-gateway/docs/) |
| USM Service | 8081 | [usm-service/docs/](usm-service/docs/) |
| ICIP Service | 8082 | [icip-service/docs/](icip-service/docs/) |
| Data Service | 8083 | [data-service/docs/](data-service/docs/) |
| Vibe Service | 8084 | [vibe-service/docs/](vibe-service/docs/) |
| Eureka Discovery | 8761 | — |

## Prerequisites

| Tool | Version |
|---|---|
| Java (JDK) | 21+ |
| Apache Maven | 3.9.6+ |
| MySQL or PostgreSQL | 8.x / 15.x |
| Docker | 24+ *(optional)* |

## Build

```bash
# Build all services (from sv/)
mvn clean install -Dmaven.test.skip=true

# Build a specific service and its dependencies
mvn clean install -pl data-service -am -Dmaven.test.skip=true
```

## Run Locally

```bash
# 1. Start Eureka discovery
mvn spring-boot:run -pl discovery-service

# 2. Start each service (separate terminals)
mvn spring-boot:run -pl usm-service   -Dspring.profiles.active=dbjwt,mysql
mvn spring-boot:run -pl icip-service  -Dspring.profiles.active=dbjwt,mysql
mvn spring-boot:run -pl data-service  -Dspring.profiles.active=dbjwt,mysql
mvn spring-boot:run -pl vibe-service  -Dspring.profiles.active=dbjwt,mysql
mvn spring-boot:run -pl api-gateway
```

## Run with Docker Compose

```bash
cd ../docker
cp .env.sample .env   # configure values
docker compose up --build
```

## Spring Profiles

| Profile | Purpose |
|---|---|
| `dbjwt` | DB-issued JWT authentication |
| `oauth2` | Keycloak OIDC (production) |
| `mysql` | MySQL datasource |
| `vault` | HashiCorp Vault for secrets |
| `btf` | BTF feature configuration |
| `github` | GitHub integration (Vibe) |

## Health Checks

All services expose `/actuator/health`. After starting, verify:

```bash
curl http://localhost:8080/actuator/health   # API Gateway
curl http://localhost:8081/actuator/health   # USM
curl http://localhost:8082/actuator/health   # ICIP
curl http://localhost:8083/actuator/health   # Data
curl http://localhost:8084/actuator/health   # Vibe
```

## Troubleshooting

| Problem | Solution |
|---|---|
| Port already in use | Check ports 8080–8084 and 8761; kill conflicting processes |
| Eureka connection refused | Start discovery-service first, or set `EUREKA_ENABLED=false` |
| JWT invalid across services | Ensure all services share the same `JWT_SECRET` |
| Database connection failures | Verify `MYSQL_DATASOURCE_URL`, `MYSQL_USER`, `MYSQL_PASSWORD` |
| Kafka connection errors (ICIP) | Ensure Kafka is running or disable Kafka in profile config |
| Docker build failures | Run `mvn clean package -DskipTests` before `docker compose up` |

## Further Reading

- [Microservices Architecture Details](MICROSERVICES_README.md)
- [Decomposition Strategy & Rationale](MICROSERVICES_DECOMPOSITION.md)
