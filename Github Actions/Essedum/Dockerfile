# ============================================================================
# Dockerfile for Agent Development Kit (ADK)
# LangChain/LangGraph-based workflow system with Python 3.11
# ============================================================================

ARG PYTHON_VERSION=3.11

FROM python:${PYTHON_VERSION}-slim

# Metadata
LABEL maintainer="Essedum DevOps Team"
LABEL description="Agent Development Kit - LangChain/LangGraph Workflow System"
LABEL version="1.0"

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DEBIAN_FRONTEND=noninteractive

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
# Note: LangChain and LangGraph may have specific version requirements
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY src/ ./src/

# Copy design files if present
COPY *.json ./ 2>/dev/null || true

# Create non-root user for security
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Entry point - API mode
CMD ["python", "-m", "src.main"]

# ============================================================================
# Build Instructions:
# docker build -t agent-dk:latest .
# docker build --build-arg PYTHON_VERSION=3.11 -t agent-dk:v1.0 .
#
# Run with GPU (if needed for specific models):
# docker run -d --gpus all -p 8080:8080 --name agent-dk agent-dk:latest
#
# Run without GPU:
# docker run -d -p 8080:8080 --name agent-dk agent-dk:latest
#
# Run with environment variables:
# docker run -d -p 8080:8080 \
#   -e AZURE_OPENAI_API_KEY=your-key \
#   -e AZURE_OPENAI_ENDPOINT=your-endpoint \
#   -e AZURE_OPENAI_DEPLOYMENT=your-deployment \
#   --name agent-dk agent-dk:latest
#
# For CLI mode:
# docker run -it agent-dk:latest python -m src.main --cli --debug
# ============================================================================
