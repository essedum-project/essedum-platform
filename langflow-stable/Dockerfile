FROM python:3.11-slim

# Langflow Stable - PostgreSQL enabled build
LABEL maintainer="devops"
LABEL description="Langflow Stable with PostgreSQL support"

ENV PIP_NO_CACHE_DIR=1 \
        PYTHONDONTWRITEBYTECODE=1 \
        PYTHONUNBUFFERED=1

# System deps for PostgreSQL psycopg2 and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        && rm -rf /var/lib/apt/lists/*

# Create non-root
RUN useradd -m appuser
WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
        && pip install --no-cache-dir -r requirements.txt

# Create data dir and ensure permissions
RUN mkdir -p /app/data && chown -R appuser:appuser /app

# Expose port for langflow-stable
EXPOSE 7861

USER appuser

# Entrypoint: run LangFlow
# LANGFLOW_DATABASE_URL, LANGFLOW_SECRET_KEY, and all configs are read from .env
CMD ["bash", "-lc", "langflow run --host ${LANGFLOW_HOST:-0.0.0.0} --port ${LANGFLOW_PORT:-7861}"]
