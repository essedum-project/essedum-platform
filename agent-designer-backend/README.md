# AgentFlow Designer — Backend API

## Documentation

| Document | Link |
|---|---|
| Scope & Requirements | [docs/SCOPE.md](docs/SCOPE.md) |
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |

## Overview

FastAPI backend for the AgentFlow Designer. Provides flow authoring, execution (powered by LangGraph), RAG pipelines, MCP tool integration, memory management, and multi-provider LLM connectivity.

## Requirements

| Tool | Version |
|---|---|
| Python | 3.11+ |
| Qdrant | optional (RAG endpoints only) |
| PostgreSQL | optional (SQLite used by default) |

## Local Setup

```bash
cd agent-designer-backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements-local.txt
```

## Configuration

Copy and edit the environment file:

```bash
cp .env.example .env
```

Key variables:

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `sqlite+aiosqlite:///./agentflow-local.db` | Database connection |
| `QDRANT_HOST` | `localhost` | Qdrant host for RAG |
| `QDRANT_PORT` | `6333` | Qdrant port |
| `AZURE_OPENAI_API_KEY` | — | Azure OpenAI credentials |
| `AWS_ACCESS_KEY_ID` | — | AWS Bedrock credentials |
| `GOOGLE_PROJECT_ID` | — | GCP Vertex AI credentials |
| `OLLAMA_BASE_URL` | `http://localhost:11434/v1` | Local Ollama |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed CORS origins |

## Running

```bash
python run.py
# API docs available at http://localhost:8000/docs
```

## Running with PostgreSQL (Production)

Set `DATABASE_URL` to a PostgreSQL connection string and run Alembic migrations:

```bash
DATABASE_URL=postgresql+asyncpg://user:pass@host/db alembic upgrade head
python run.py
```

## Testing

```bash
python test_smoke.py
python test_langgraph.py
python test_ollama.py
```

## Docker

```bash
docker compose up --build
```
