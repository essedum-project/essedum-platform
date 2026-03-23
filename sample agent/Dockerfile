# Multi-stage build for TMF 645 Service Qualification API
# Stage 1: Build stage
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Runtime stage
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY src/ ./src/
COPY app.py .
COPY TMF645_ServiceQual_Design.json .

# Make sure scripts in .local are usable
ENV PATH=/root/.local/bin:$PATH

# Set Python path
ENV PYTHONPATH=/app:$PYTHONPATH

# Environment variables for configuration
ENV FEDERATED_API_URL=http://192.168.14.119:8092
ENV USE_VLLM=true
ENV VLLM_URL=http://litellm:4000/chat/completions
ENV VLLM_MODEL_NAME=Llama-3.2-3B-Instruct
ENV VLLM_API_KEY=sk-1234
ENV LOG_LEVEL=INFO
ENV FLASK_ENV=production

# Expose Flask port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run the Flask application
CMD ["python", "app.py"]
