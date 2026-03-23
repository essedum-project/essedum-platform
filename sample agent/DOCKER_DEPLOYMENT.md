# TMF 645 Service Qualification API - Docker Deployment

This directory contains Docker configuration for containerizing the TMF 645 Service Qualification API with LangGraph workflow.

## Quick Start

### Build and Run with Docker Compose

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Build and Run with Docker

```bash
# Build the image
docker build -t tmf645-agent:latest .

# Run the container
docker run -d \
  -p 5000:5000 \
  -e FEDERATED_API_URL=http://host.docker.internal:8092 \
  --name tmf645-agent \
  tmf645-agent:latest

# View logs
docker logs -f tmf645-agent

# Stop the container
docker stop tmf645-agent
docker rm tmf645-agent
```

## Configuration

### Environment Variables

Configure the application using environment variables:

**Federated API** (Required):
- `FEDERATED_API_URL` - Federated Learning API endpoint (default: `http://localhost:8092`)

**vLLM Configuration**:
- `USE_VLLM` - Enable vLLM (default: `true`)
- `VLLM_URL` - vLLM API endpoint
- `VLLM_MODEL_NAME` - Model path

**Azure OpenAI** (Optional):
- `AZURE_OPENAI_API_KEY` - Azure OpenAI API key
- `AZURE_OPENAI_ENDPOINT` - Azure endpoint URL
- `AZURE_OPENAI_DEPLOYMENT` - Deployment name
- `AZURE_API_VERSION` - API version (default: `2024-06-01`)

**Application Settings**:
- `LOG_LEVEL` - Logging level (default: `INFO`)
- `MODEL_NAME` - Model name (default: `gpt-4`)
- `TEMPERATURE` - Temperature for LLM (default: `0.7`)
- `MAX_TOKENS` - Max tokens (default: `500`)

### Using .env File

Create a `.env` file in the same directory:

```env
FEDERATED_API_URL=http://host.docker.internal:8092
USE_VLLM=true
VLLM_URL=http://litellm:4000/chat/completions
VLLM_MODEL_NAME=Llama-3.2-3B-Instruct
VLLM_API_KEY=sk-1234
LOG_LEVEL=INFO
```

Then run:
```bash
docker-compose --env-file .env up -d
```

## API Endpoints

Once running, the API is available at `http://localhost:5000`:

- `GET /` - API documentation
- `GET /health` - Health check and workflow status
- `POST /api/ask` - Submit TMF 645 service qualification request
- `POST /api/validate` - Validate TMF 645 format only

## Testing the Container

```bash
# Health check
curl http://localhost:5000/health

# Test qualification request
curl -X POST http://localhost:5000/api/ask \
  -H "Content-Type: application/json" \
  -d '{
    "tmf645_request": {
      "instantSyncQualification": true,
      "serviceQualificationItem": [{
        "id": "1",
        "service": {
          "serviceType": "URLLC",
          "serviceSpecification": {
            "id": "spec-001",
            "name": "5G URLLC Service"
          },
          "serviceCharacteristic": [
            {"name": "bandwidth", "value": "100 Mbps"},
            {"name": "latency", "value": "5 ms"}
          ]
        },
        "action": "add"
      }]
    }
  }'
```

## Networking

### Accessing Federated API from Container

**On Windows/Mac**:
Use `host.docker.internal` to access services on the host machine:
```env
FEDERATED_API_URL=http://host.docker.internal:8092
```

**On Linux**:
Use `--network host` or the host's IP address:
```bash
docker run -d --network host tmf645-agent:latest
```

Or find the host IP and use it:
```env
FEDERATED_API_URL=http://172.17.0.1:8092
```

## Multi-Stage Build

The Dockerfile uses a multi-stage build to:
1. **Builder stage**: Install dependencies with build tools
2. **Runtime stage**: Copy only necessary files, reducing image size

## Health Check

The container includes a health check that:
- Runs every 30 seconds
- Calls `/health` endpoint
- Marks container unhealthy after 3 failed attempts

View health status:
```bash
docker ps
docker inspect tmf645-agent | grep -A 10 Health
```

## Production Deployment

For production, consider:

1. **Use a production WSGI server** (Gunicorn):
   ```dockerfile
   CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
   ```

2. **Add TLS/SSL** with a reverse proxy (Nginx, Traefik)

3. **Configure secrets** using Docker secrets or environment management tools

4. **Resource limits**:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '2'
         memory: 4G
   ```

## Troubleshooting

**Container won't start:**
```bash
# Check logs
docker logs tmf645-agent

# Check if port is available
netstat -an | findstr 5000  # Windows
lsof -i :5000               # Linux/Mac
```

**Can't connect to Federated API:**
```bash
# Test from inside container
docker exec -it tmf645-agent curl http://host.docker.internal:8092/health
```

**Health check failing:**
```bash
# Check health status
docker inspect tmf645-agent

# Test health endpoint manually
curl http://localhost:5000/health
```
