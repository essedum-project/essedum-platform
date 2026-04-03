# Langflow Stable with PostgreSQL

## Configuration Details

### Langflow Stable Setup
- **Container Name**: langflow-stable
- **Port**: 7861 (both host and container)
- **URL**: http://10.200.111.51:7861/
- **Database**: PostgreSQL
- **Network**: langflow-stable-network (isolated)
- **All Configuration**: Managed via `.env` file

### PostgreSQL Configuration
- **Container Name**: langflow-stable-postgres
- **Database Name**: langflowfb (from .env)
- **Username**: langflow (from .env)
- **Password**: password (from .env)
- **Internal Port**: 5432 (from .env)
- **External Port**: 5433 (from .env)
- **Host**: postgres (from app container) / localhost:5433 (from host machine)

### Environment Variables (.env)
All configuration is centralized in the `.env` file:
- `LANGFLOW_PORT=7861`
- `LANGFLOW_HOST=0.0.0.0`
- `POSTGRES_DB=langflowfb`
- `POSTGRES_USER=langflow`
- `POSTGRES_PASSWORD=password`
- `POSTGRES_EXTERNAL_PORT=5433`
- `LANGFLOW_DATABASE_URL` (auto-constructed)
- `LANGFLOW_SECRET_KEY`
- `LANGFLOW_URL=http://10.200.111.51:7861/`

## How to Start

1. Navigate to the folder:
   ```bash
   cd /home/devopsuser/devops/langflow-stable
   ```

2. Start the services:
   ```bash
   docker-compose up -d
   ```

3. Check the logs:
   ```bash
   docker-compose logs -f app
   ```

4. Access Langflow:
   - URL: http://10.200.111.51:7861/

## How to Stop

```bash
docker-compose down
```

## How to Stop and Remove Data

```bash
docker-compose down -v
```

## Verify PostgreSQL Connection

From inside the container:
```bash
docker exec -it langflow-stable-postgres psql -U langflow -d langflowfb
```

From host machine:
```bash
psql -h localhost -p 5433 -U langflow -d langflowfb
```
(Password: password)

## Environment Variables Summary

All configuration is centralized in `.env` file. The port mapping is 7861:7861 (both host and container use the same port).
