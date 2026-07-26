# AKS Deployment

> Detailed deployment architecture, namespace topology, ingress routing, HPA, secrets:
> - [docs/K8DEPLOYMENT.md](../docs/K8DEPLOYMENT.md) — full K8s architecture
> - [docs/AKSDEPLOYMENT.md](../docs/AKSDEPLOYMENT.md) — manifest inventory & startup order

## Contents

Kubernetes manifests for deploying the Essedum platform on Azure Kubernetes Service (AKS).

## Deploy

```bash
cd aks-deployment
./deploy.sh
```

Or apply manifests manually in the order listed in [docs/AKSDEPLOYMENT.md](../docs/AKSDEPLOYMENT.md).

## Namespaces

| Namespace | Purpose |
|---|---|
| `aipns` | All platform services |
| `vibe-apps` | Dynamically spawned Vibe coding session pods |
| `vibe-mcp` | MCP server pods |
| `vibe-agents` | ADK / LangGraph agent pods |
| `ingress-nginx` | Nginx Ingress Controller |
| `metallb-system` | MetalLB load balancer |
