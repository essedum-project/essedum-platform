package com.lfn.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * API Gateway - Spring Cloud Gateway.
 * Routes all incoming requests to the appropriate microservice based on path patterns.
 *
 * Routing rules:
 * - /api/users/**, /api/roles/**, /api/authenticate/**, /api/organisations/** → USM Service (8081)
 * - /api/aip/**, /api/jobs/**, /api/pipelines/**, /api/models/** → ICIP Service (8082)
 * - /api/file/**, /api/datasets/**, /api/adapters/** → Data Service (8083)
 * - /api/vibe/**, /api/goose/**, /api/github/** → Vibe Service (8084)
 */
@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}

