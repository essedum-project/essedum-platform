# API Gateway (Spring Cloud Gateway)

## Documentation

| Document | Link |
|---|---|
| Scope & Requirements | [docs/SCOPE.md](docs/SCOPE.md) |
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |

## Overview

The API Gateway is the **single entry point** for all client requests to the ESSEDUM microservices platform. It uses **Spring Cloud Gateway** to route traffic to the appropriate downstream microservice based on URL path patterns.

## Technical Details

| Property | Value |
|---|---|
| **Port** | `8080` |
| **Service Name** | `api-gateway` |
| **Framework** | Spring Cloud Gateway |
| **Main Class** | `com.lfn.gateway.ApiGatewayApplication` |

## Running

```bash
# From sv/ directory — start Eureka first
mvn spring-boot:run -pl discovery-service
mvn spring-boot:run -pl api-gateway
```

## Configuration

Key properties in `src/main/resources/application.yml`:

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
