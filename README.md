# ESSEDUM

Essedum is an enterprise-grade, cloud-native platform for building, training, deploying, and monitoring AI-powered applications. It provides a unified workspace for connecting data sources, designing pipelines, executing ML jobs on cloud platforms, deploying models as endpoints, and building LLM-powered agents.

## Documentation

| Document | Description |
|---|---|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Platform architecture — functional blocks, component diagrams, cross-service flows |
| [SCOPE.md](docs/SCOPE.md) | Business objectives, functional and non-functional requirements |
| [K8DEPLOYMENT.md](docs/K8DEPLOYMENT.md) | Kubernetes / AKS deployment — namespaces, ingress, HPA, PVs, secrets |
| [AKSDEPLOYMENT.md](docs/AKSDEPLOYMENT.md) | AKS manifest inventory and startup order |
| [DOCKERDEPLOYMENT.md](docs/DOCKERDEPLOYMENT.md) | Docker Compose deployment — all services, ports, volumes, networks |
| [JOB-EXECUTOR-ARCHITECTURE.md](docs/JOB-EXECUTOR-ARCHITECTURE.md) | Python job executor layer — all four executors, selection logic, artifact flow |
| [MICROSERVICES_DECOMPOSITION.md](MICROSERVICES_DECOMPOSITION.md) | Microservices decomposition strategy and service boundaries |
| [USER_GUIDE.md](USER_GUIDE.md) | Step-by-step guide to building AI applications on the platform |
| [CHANGELOG.md](CHANGELOG.md) | Release history and notable changes per version |

---

## Platform Components

| Component | Directory | README | Architecture |
|---|---|---|---|
| Backend (Java) | `sv/` | [sv/README.md](sv/README.md) | [sv/docs/ARCHITECTURE.md](sv/docs/ARCHITECTURE.md) |
| Frontend (Angular MFE) | `essedum-ui/` | [essedum-ui/README.md](essedum-ui/README.md) | [essedum-ui/docs/ARCHITECTURE.md](essedum-ui/docs/ARCHITECTURE.md) |
| Agent Designer Backend | `agent-designer-backend/` | [README.md](agent-designer-backend/README.md) | [docs/ARCHITECTURE.md](agent-designer-backend/docs/ARCHITECTURE.md) |
| Nginx | `nginx/` | [nginx/README.md](nginx/README.md) | [nginx/docs/ARCHITECTURE.md](nginx/docs/ARCHITECTURE.md) |
| Python Job Executor | `py-job-executer/` | [README.md](py-job-executer/README.md) | [docs/ARCHITECTURE.md](py-job-executer/docs/ARCHITECTURE.md) |
| SageMaker Executor | `py-job-sagemaker-executer/` | — | [docs/ARCHITECTURE.md](py-job-sagemaker-executer/docs/ARCHITECTURE.md) |
| Vertex AI Executor | `py-job-vertex-executer/` | — | [docs/ARCHITECTURE.md](py-job-vertex-executer/docs/ARCHITECTURE.md) |
| Azure ML Executor | `py-job-azure-executer/` | [README.md](py-job-azure-executer/README.md) | [docs/ARCHITECTURE.md](py-job-azure-executer/docs/ARCHITECTURE.md) |
| Proxy Service | `proxy-service/` | — | [docs/ARCHITECTURE.md](proxy-service/docs/ARCHITECTURE.md) |
| Vibe Code Builder | `vibe-code-builder-deployer/` | — | [docs/ARCHITECTURE.md](vibe-code-builder-deployer/docs/ARCHITECTURE.md) |
| ADK Code Builder | `adk-code-builder-deployer/` | — | [docs/ARCHITECTURE.md](adk-code-builder-deployer/docs/ARCHITECTURE.md) |
| Vibe Pod Watcher | `vibe-pod-watcher/` | — | [docs/ARCHITECTURE.md](vibe-pod-watcher/docs/ARCHITECTURE.md) |
| S3Proxy | `s3proxy/` | — | [docs/ARCHITECTURE.md](s3proxy/docs/ARCHITECTURE.md) |
| VS Code Extension | `vs-extension/` | [README.md](vs-extension/README.md) | [docs/ARCHITECTURE.md](vs-extension/docs/ARCHITECTURE.md) |

---

## Getting Started

### Docker Compose (recommended for local deployment)

```bash
cd docker
cp .env.sample .env   # configure credentials
docker compose up --build
```

See [docker/README.md](docker/README.md) and [docker/SETUP_GUIDE.md](docker/SETUP_GUIDE.md) for full setup instructions.

### Kubernetes (AKS)

```bash
cd aks-deployment
./deploy.sh
```

See [aks-deployment/README.md](aks-deployment/README.md) and [docs/AKSDEPLOYMENT.md](docs/AKSDEPLOYMENT.md).

### Developer Setup (manual)

See the component READMEs and docs linked in the table above.

---

## License

MIT License — see [LICENSE](LICENSE).

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
