# Dockerfile for Langflow Persistent Deployment
# Based on official Langflow image with custom configurations
# 
# Build: docker build -t langflow-persistent:custom .
# Run: docker run -p 7860:7860 --env-file .env langflow-persistent:custom

FROM langflowai/langflow:latest

# Metadata
LABEL maintainer="Essedum Platform"
LABEL description="Langflow with PostgreSQL persistence for 5G deployment"
LABEL version="1.0"

# Set environment variables
ENV LANGFLOW_HOST=0.0.0.0
ENV LANGFLOW_PORT=7860
ENV LANGFLOW_ENV=production

# Database connection (override at runtime)
ENV LANGFLOW_DATABASE_URL=""
ENV LANGFLOW_AUTO_LOGIN=false

# Install additional dependencies if needed
# RUN pip install --no-cache-dir <additional-package>

# Create data directory
RUN mkdir -p /app/data && chmod 777 /app/data

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD curl -f http://localhost:${LANGFLOW_PORT}/health || exit 1

# Expose port
EXPOSE 7860

# Default command (override in kubernetes deployment)
# CMD ["langflow", "run", "--host", "0.0.0.0", "--port", "7860"]

# Alternative: Custom Build with Modifications
# Uncomment and modify as needed

# FROM python:3.11-slim

# # Install system dependencies
# RUN apt-get update && apt-get install -y \
#     build-essential \
#     curl \
#     git \
#     && rm -rf /var/lib/apt/lists/*

# # Install Langflow
# RUN pip install --no-cache-dir langflow

# # Install PostgreSQL client
# RUN pip install --no-cache-dir psycopg2-binary

# # Set working directory
# WORKDIR /app

# # Copy custom configuration files
# COPY config/ /app/config/

# # Set environment variables
# ENV LANGFLOW_CONFIG_DIR=/app/config
# ENV PYTHONUNBUFFERED=1

# # Expose port
# EXPOSE 7860

# # Run Langflow
# CMD ["langflow", "run", "--host", "0.0.0.0", "--port", "7860"]

---

# Docker Compose Example for Local Development
# Save as docker-compose.yml in the same directory

version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: langflow-postgres-local
    restart: unless-stopped
    environment:
      POSTGRES_DB: langflowdb
      POSTGRES_USER: langfuse
      POSTGRES_PASSWORD: langfuse
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U langfuse -d langflowdb"]
      interval: 10s
      timeout: 5s
      retries: 5

  langflow:
    build: .
    # OR use official image:
    # image: langflowai/langflow:latest
    container_name: langflow-app-local
    restart: unless-stopped
    environment:
      LANGFLOW_DATABASE_URL: "postgresql://langfuse:langfuse@postgres:5432/langflowdb"
      LANGFLOW_AUTO_LOGIN: "true"
      LANGFLOW_HOST: "0.0.0.0"
      LANGFLOW_PORT: "7860"
      LANGFLOW_ENV: "development"
    ports:
      - "7860:7860"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - langflow_data:/app/data

volumes:
  postgres_data:
    driver: local
  langflow_data:
    driver: local

---

# .env File Example
# Create this file for environment-specific configurations

LANGFLOW_DATABASE_URL=postgresql://langfuse:langfuse@postgres:5432/langflowdb
LANGFLOW_AUTO_LOGIN=true
LANGFLOW_HOST=0.0.0.0
LANGFLOW_PORT=7860
LANGFLOW_ENV=production

# Optional: Custom configurations
# LANGFLOW_CORS_ORIGINS=https://yourdomain.com
# LANGFLOW_MAX_FILE_SIZE=100
# LANGFLOW_WORKERS=4

---

# Build and Push to Registry (Example)

# Build the image
# docker build -t your-registry.com/langflow-persistent:1.0 .

# Tag as latest
# docker tag your-registry.com/langflow-persistent:1.0 your-registry.com/langflow-persistent:latest

# Push to registry
# docker push your-registry.com/langflow-persistent:1.0
# docker push your-registry.com/langflow-persistent:latest

# Update Kubernetes deployment to use custom image:
# kubectl set image deployment/langflow-persistent langflow=your-registry.com/langflow-persistent:1.0 -n aipns
