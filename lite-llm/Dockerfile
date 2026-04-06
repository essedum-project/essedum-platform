
# Minimal image for running LiteLLM proxy
FROM python:3.11-slim

ENV PIP_NO_CACHE_DIR=1         PYTHONDONTWRITEBYTECODE=1         PYTHONUNBUFFERED=1

# Create non-root user
RUN useradd -m appuser
WORKDIR /app

# Install system deps needed by prisma CLI
RUN apt-get update && apt-get install -y --no-install-recommends \
    libatomic1 nodejs npm openssl libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install LiteLLM (proxy extras include server deps)
COPY lite-llm/requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && prisma generate --schema /usr/local/lib/python3.11/site-packages/litellm/proxy/schema.prisma

# Copy config
COPY lite-llm/config ./config

# Default port
EXPOSE 4000

USER appuser

# Entrypoint runs the LiteLLM proxy with our config
CMD ["litellm", "--config", "/app/config/config.yaml", "--host", "0.0.0.0", "--port", "4000"]
