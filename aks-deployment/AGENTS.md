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

Most manifests contain `${VAR}` placeholders, so apply them through `envsubst`
with `docker/.env` loaded, the way `deploy.sh` does:
```bash
set -a && . ../docker/.env && set +a
envsubst < pyjob-executor.yaml | kubectl apply -f -
```
`envsubst` silently replaces any placeholder missing from `.env` with an empty
string, so add new variables to both `docker/.env` and `docker/.env.sample`.

### Image tags
`IMAGE_TAG` in `docker/.env` is **not** a global truth — deployments have
drifted and are individually pinned (`v18`, `V-18`, `V-20`, `v24` are all live).
Before rebuilding a single service, check what it actually runs:
```bash
kubectl get deploy -n aipns -o custom-columns='NAME:.metadata.name,IMAGE:.spec.template.spec.containers[0].image'
```
Docker tags are case-sensitive: `v18` and `V-18` are different images.

`build-and-push.sh` does `set -a; source docker/.env`, which **overwrites** any
pre-set `IMAGE_TAG`, so `IMAGE_TAG=X ./build-and-push.sh ...` does not work.
Edit `docker/.env` for the build and restore it afterwards.

Rebuilding onto an existing tag overwrites it with no rollback copy. Back the
old image up first:
```bash
docker pull ${REG}/${IMAGE}:${TAG}
docker tag  ${REG}/${IMAGE}:${TAG} ${REG}/${IMAGE}:${TAG}-pre-<change>
docker push ${REG}/${IMAGE}:${TAG}-pre-<change>
```

### Using Helm
To install or upgrade using the Helm chart:
```bash
helm upgrade --install essedum ./helm-deployment -f ./helm-deployment/values.yaml
```

## Troubleshooting
*   **Pod CrashLoopBackOff**: Check logs (`kubectl logs <pod>`). Often due to missing env vars or DB connectivity.
*   **Ingress Issues**: Verify the Ingress Controller (Nginx) is running and the `ingress.yaml` hosts match your DNS.
*   **Redeploy did not pick up a new image**: If the tag is unchanged, `kubectl apply` sees no spec change and does nothing. Force it with `kubectl rollout restart deployment/<name> -n aipns` (the manifests already set `imagePullPolicy: Always`).
*   **Docker Hub 429 on build**: The base image cannot be pulled anonymously. Pull the same official image from a mirror and retag it locally, e.g. `docker pull public.ecr.aws/docker/library/python:3.12-slim && docker tag public.ecr.aws/docker/library/python:3.12-slim python:3.12-slim`.
*   **Registry API returns 503**: `pyjob-executor` ships with the Model/Agent Registry disabled. Set `REGISTRY_DB_ENABLED=True` plus `REGISTRY_DB_HOST` / `REGISTRY_DB_NAME` in `docker/.env`. Keep `pyjob-executor-service` off the ingress — those endpoints are unauthenticated.
