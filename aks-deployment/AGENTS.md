# AGENTS.md - AKS Deployment Directory

This file provides instructions for agents working with the Kubernetes manifests in this directory.

## Purpose
This directory contains Kubernetes manifests (YAML) and Helm charts for deploying the Essedum platform to Azure Kubernetes Service (AKS).

## Guidelines for Modification

### YAML Manifests
*   **Deployments & Services**: Standard K8s resources. When updating, ensure `image` tags are dynamic or clearly documented (often replaced by CI/CD).
*   **HPA**: Horizontal Pod Autoscalers are defined for scalable components (`backend`, `ui`, `executors`).
*   **Persistent Volumes**: `mysql` and `qdrant` use PVCs. Ensure the storage class matches the target environment (e.g., Azure Disk).

### Helm Charts
*   **Location**: `helm-deployment/`
*   **Templating**: Use Helm values (`values.yaml`) for environment-specific configuration (replicas, image tags, resources) rather than hardcoding in templates.

## Deployment Instructions

### Applying Manifests
To apply individual manifests:
```bash
kubectl apply -f <filename>.yaml
```

### Using Helm
To install or upgrade using the Helm chart:
```bash
helm upgrade --install essedum ./helm-deployment -f ./helm-deployment/values.yaml
```

## Troubleshooting
*   **Pod CrashLoopBackOff**: Check logs (`kubectl logs <pod>`). Often due to missing env vars or DB connectivity.
*   **Ingress Issues**: Verify the Ingress Controller (Nginx) is running and the `ingress.yaml` hosts match your DNS.
