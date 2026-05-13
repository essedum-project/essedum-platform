# build trigger: pipeline recovery
FROM moby/buildkit:v0.18.2 AS buildkit-binary

FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    unzip curl gnupg lsb-release && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
    chmod a+r /etc/apt/keyrings/docker.asc && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list && \
    apt-get update && apt-get install -y docker-ce-cli && \
    rm -rf /var/lib/apt/lists/*

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

# When running in Docker deploy mode, mount the Docker socket:
# docker run -v /var/run/docker.sock:/var/run/docker.sock ...

EXPOSE 5000
CMD ["python", "app.py"]