# AGENTS.md - Docker Directory

This file provides instructions for agents working with the Docker configuration in this directory.

## Purpose
This directory contains the Docker Compose configuration used to orchestrate the entire Essedum platform locally or in a containerized environment.

## Guidelines for Modification

### `docker-compose.yml`
*   **Service Definition**: When adding a new microservice, define it here. Ensure it shares the `mysql` and `keycloak` networks/dependencies if needed.
*   **Volume Mapping**: Use named volumes for persistence (e.g., `mysql-data`, `qdrant-data`). Do not map local host paths directly unless necessary for development overrides.
*   **Environment Variables**: Do not hardcode secrets. Use variables defined in `.env` (and `.env.sample`).

### `.env` and `.env.sample`
*   **Secrets**: If you introduce a new required environment variable (especially secrets), add it to `.env.sample` with a placeholder value.
*   **Documentation**: Comment what the variable controls in `.env.sample`.

### `mysql-init/`
*   **Schema Changes**: If the database schema requires initialization or migration scripts that must run on fresh install, place `.sql` files here. They are executed in alphabetical order by the official MySQL image.

## Troubleshooting

*   **Container Failures**: If a container exits immediately, check logs using `docker-compose logs <service_name>`.
*   **Database Connectivity**: Ensure the `mysql` service is healthy before dependent services start. The `depends_on` clause handles startup order but not necessarily readiness.
*   **Port Conflicts**: If default ports (8082, 8084, etc.) are in use, modify the mapping in `docker-compose.yml` or override via `.env`.
