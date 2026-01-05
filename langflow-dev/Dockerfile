
# syntax=docker/dockerfile:1

########################################
# Stage 1: builder (Python deps + Frontend build)
########################################
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder
WORKDIR /app
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV RUSTFLAGS="--cfg reqwest_unstable"

# Tools for building Python deps and frontend
RUN apt-get update && apt-get upgrade -y && \
    apt-get install --no-install-recommends -y build-essential git npm gcc && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ---- Copy project metadata FIRST (cache-friendly) ----
COPY uv.lock /app/uv.lock
COPY pyproject.toml /app/pyproject.toml
COPY README.md /app/README.md

# ---- langflow-base local package (README must be present) ----
COPY src/backend/base/uv.lock /app/src/backend/base/uv.lock
COPY src/backend/base/pyproject.toml /app/src/backend/base/pyproject.toml
COPY src/backend/base/README.md /app/src/backend/base/README.md

# ---- lfx package (uncomment only if present in your repo) ----
# COPY src/lfx/pyproject.toml /app/src/lfx/pyproject.toml
# COPY src/lfx/README.md /app/src/lfx/README.md

# ---- Copy full source BEFORE first uv sync ----
COPY src /app/src

# ---- Resolve Python deps (local path packages now have files) ----
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-editable --extra postgresql

# ---- Build Frontend inside image ----
# If you serve under a subpath (e.g. /langflow/), set VITE_BASE accordingly
ARG VITE_BASE=/
COPY src/frontend /tmp/frontend
WORKDIR /tmp/frontend
RUN --mount=type=cache,target=/root/.npm \
    npm ci && \
    ESBUILD_BINARY_PATH="" NODE_OPTIONS="--max-old-space-size=8192" JOBS=1 \
    npm run build -- --base=${VITE_BASE}

# Put built FE where backend serves it (matches upstream)
RUN mkdir -p /app/src/backend/langflow/frontend && \
    cp -r build/* /app/src/backend/langflow/frontend/ && \
    rm -rf /tmp/frontend

# Optional: second sync to lock final environment (installs the /app project)
WORKDIR /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-editable --extra postgresql
# If you prefer NOT to install the project in this second step:
# RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --no-install-project --no-editable --extra postgresql

########################################
# Stage 2: runtime
########################################
FROM python:3.12.3-slim AS runtime
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y curl git libpq5 && \
    apt-get clean && rm -rf /var/lib/apt/lists/* && \
    useradd user -u 1000 -g 0 --no-create-home --home-dir /app/data

# Bring the ready virtualenv
COPY --from=builder --chown=1000 /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"
WORKDIR /app
USER user

# Langflow runtime settings
ENV LANGFLOW_HOST=0.0.0.0
ENV LANGFLOW_PORT=7860

# Essedum Configuration - Can be overridden by Kubernetes deployment
ENV ESSEDUM_BACKEND_URL=""
ENV LANGFLOW_FRONTEND_URL=""
ENV VITE_ESSEDUM_BACKEND_URL=""
ENV ESSEDUM_BACKEND_SERVICE_URL=""
ENV ESSEDUM_AUTH_REQUIRED=true
ENV ESSEDUM_TIMEOUT=30

EXPOSE 7860

# If you don't use Composio bundle, you can disable it to avoid import errors at startup:
# ENV LANGFLOW_BUNDLE_URLS="[]"
# ENV LANGFLOW_DISABLE_COMPOSIO="true"

CMD ["langflow","run"]
