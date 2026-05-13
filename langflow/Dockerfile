# build trigger: pipeline recovery
# Dockerfile for Langflow Persistent Deployment
# Based on official Langflow image with custom configurations
# 
# Build: docker build -t langflow-persistent:custom .
# Run: docker run -p 7860:7860 --env-file .env langflow-persistent:custom

FROM langflowai/langflow:1.8.1

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

# Default command inherited from base image (langflowai/langflow:1.8.1)
# Override in Kubernetes deployment spec if needed.

# Build the image
# docker build -t your-registry.com/langflow-persistent:1.0 .

# Tag as latest
# docker tag your-registry.com/langflow-persistent:1.0 your-registry.com/langflow-persistent:latest

# Push to registry
# docker push your-registry.com/langflow-persistent:1.0
# docker push your-registry.com/langflow-persistent:latest

# Update Kubernetes deployment to use custom image:
# kubectl set image deployment/langflow-persistent langflow=your-registry.com/langflow-persistent:1.0 -n aipns
