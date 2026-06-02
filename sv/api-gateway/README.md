# API Gateway (Spring Cloud Gateway)

## Overview

The API Gateway is the **single entry point** for all client requests to the ESSEDUM microservices platform. It uses **Spring Cloud Gateway** to route traffic to the appropriate downstream microservice based on URL path patterns.

## Technical Details

| Property          | Value                  |
|-------------------|------------------------|
| **Port**          | `8080`                 |
| **Service Name**  | `api-gateway`          |
| **Framework**     | Spring Cloud Gateway   |
| **Main Class**    | `com.lfn.gateway.ApiGatewayApplication` |

## Responsibilities

- **Request Routing** — Routes incoming requests to the correct microservice based on path prefix.
- **Load Balancing** — Client-side load balancing via Eureka service discovery.
- **Cross-Cutting Concerns** — Centralized handling of CORS, rate limiting, and request logging.
- **Service Aggregation** — Single endpoint for frontend clients to interact with all backend services.

## Route Configuration

| Path Prefix      | Target Service   | Port   | Description                     |
|-------------------|------------------|--------|---------------------------------|
| `/api/usm/**`    | `usm-service`    | `8081` | User & Security Management      |
| `/api/icip/**`   | `icip-service`   | `8082` | AI/ML Pipeline & Jobs            |
| `/api/data/**`   | `data-service`   | `8083` | Files, Data Adapters & Search    |
| `/api/vibe/**`   | `vibe-service`   | `8084` | AI-Assisted Coding (Vibe)        |

## Running

```bash
# From project root (start discovery-service first)
mvn spring-boot:run -pl discovery-service
mvn spring-boot:run -pl api-gateway
```

## Configuration

Configuration is in `src/main/resources/application.yml`.

Key properties:
```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

## Architecture

```
Client Request
      │
      ▼
┌──────────────┐
│  API Gateway │  :8080
│  (Gateway)   │
└──────┬───────┘
       │
       ├── /api/usm/**  ──▶  USM Service   :8081
       ├── /api/icip/** ──▶  ICIP Service  :8082
       ├── /api/data/** ──▶  Data Service  :8083
       └── /api/vibe/** ──▶  Vibe Service  :8084
```

