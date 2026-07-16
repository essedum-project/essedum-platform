# Essedum Frontend (essedum-ui)

> Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

Angular 18 micro-frontend shell with four MFE remotes, a React/Vite Agent Designer, and embedded Langflow/LangFuse/LiteLLM UIs.

## Applications

| Application | Directory | Purpose |
|---|---|---|
| Shell (host) | `shell/` | Main layout, routing, OIDC auth |
| Agent Studio MFE | `modules/agent-studio/` | AI pipelines, agent directory |
| Data Ops MFE | `modules/data-ops/` | Dataset, datasource, model mgmt |
| Integration Hub MFE | `modules/integration-hub/` | Pipeline design & execution |
| Vibe Studio MFE | `modules/vibe-studio/` | AI coding interface |
| Agent Designer | `agent-designer-frontend/` | LangGraph visual canvas (React/Vite) |

## Build

```bash
# Shell
cd shell && npm install && npm run build-prod

# Each MFE module (repeat for each)
cd modules/agent-studio && npm install && npm run build
```

## Development

```bash
cd shell && npm install && npm start   # starts shell on :8080
```
