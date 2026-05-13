# build trigger: pipeline recovery
FROM moby/buildkit:v0.18.2 AS buildkit-binary

FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    unzip curl && rm -rf /var/lib/apt/lists/*

COPY --from=buildkit-binary /usr/bin/buildctl /usr/bin/buildctl

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 5000
CMD ["python", "app.py"]