FROM moby/buildkit:v0.18.2 AS buildkit-binary

FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    unzip curl && rm -rf /var/lib/apt/lists/*

COPY --from=buildkit-binary /usr/bin/buildctl /usr/bin/buildctl

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

# Provide fallback Dockerfile for user apps that don't include one
RUN mkdir -p /opt/fallback
COPY fallback.Dockerfile /opt/fallback/Dockerfile

# Pre-create app-specific tmp directories and set ownership
RUN mkdir -p /tmp/downloads /tmp/source_code

# Run as non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser /app /opt/fallback /tmp/downloads /tmp/source_code
USER appuser

EXPOSE 5000
CMD ["python", "app.py"]