# AGENTS.md - S3Proxy

This file provides instructions for agents working with S3Proxy in the Essedum context.

## Purpose
S3Proxy is used as a storage abstraction layer. It allows the Essedum platform services (Backend, Executors) to interact with various storage providers (Local Filesystem, Azure Blob Storage, GCS) using the standard AWS S3 API.

## Guidelines for Modification

### Configuration
*   **`s3proxy.conf` / Environment Variables**: Configuration is primarily handled via environment variables passed to the Docker container.
*   **Docker Integration**: See `Dockerfile` and `src/main/resources/run-docker-container.sh` for how variables like `JCLOUDS_PROVIDER` are mapped to system properties.

### Supported Backends
*   **Development**: Use `filesystem-nio2` (Local filesystem) mapped to a volume.
*   **Production**: Configure for `azureblob` or `google-cloud-storage` depending on the deployment target.

### Codebase
*   **Upstream**: This appears to be based on the [official S3Proxy](https://github.com/gaul/s3proxy). Avoid modifying core Java code unless necessary. Prefer configuration changes or middleware extensions.

## Troubleshooting
*   **Credential Issues**: If the backend rejects credentials, check `S3PROXY_IDENTITY` and `S3PROXY_CREDENTIAL` match what the client (Essedum Backend) is sending.
*   **BlobStore Errors**: Check logs for JClouds exceptions. Ensure the underlying storage (e.g., Azure container) exists or permissions are correct.
