# GitHub Runner Configuration Guide (AKS Deployment)
#
# This file contains post-setup configuration steps and environment variables
# that should be configured before running the CI/CD workflows.

# ============================================================================
# GitHub Runner Secrets (Set in GitHub Repository Settings)
# ============================================================================

# Settings → Secrets and variables → Actions → New repository secret

# 1. GITHUB_TOKEN
#    Type: Personal Access Token (PAT)
#    Scopes needed:
#      - repo (full control of private repositories)
#      - workflow (update GitHub Action workflows)
#      - admin:org_hook (manage organization hooks)
#    Description: Token for runner registration and webhook access

# 2. CONTAINER_REGISTRY
#    Type: String
#    Example: docker.io or ghcr.io or registry.example.com
#    Description: Container registry URL for image storage

# 3. REGISTRY_USERNAME
#    Type: String
#    Description: Username for container registry authentication

# 4. REGISTRY_PASSWORD
#    Type: Secret
#    Description: Password/token for container registry authentication

# 5. K8S_NAMESPACE
#    Type: String
#    Default: essedum
#    Description: Kubernetes namespace where apps are deployed

# ============================================================================
# Environment Variables for Workflows
# ============================================================================

# In your GitHub Actions workflow files, add env section:
#
# env:
#   K8S_NAMESPACE: ${{ secrets.K8S_NAMESPACE || 'essedum' }}
#   REGISTRY: ${{ secrets.CONTAINER_REGISTRY }}
#   CI_COMMIT_SHA: ${{ github.sha }}
#   CI_BRANCH: ${{ github.ref_name }}

# ============================================================================
# Required Kubernetes Resources
# ============================================================================

# Before running workflows, ensure these exist:

# 1. Namespace
#    kubectl create namespace essedum

# 2. RBAC (Role, RoleBinding, ClusterRole, ClusterRoleBinding)
#    kubectl apply -f aks-deployment/github-runner-rbac.yml

# 3. GitHub Runner Deployment
#    kubectl apply -f aks-deployment/github-runner-deployment.yml

# 4. Secrets for runner (if not using deployment)
#    kubectl create secret generic github-runner-secret \
#      --from-literal=token=<GITHUB_PAT_TOKEN> \
#      -n essedum

# 5. ConfigMap for runner (if not using deployment)
#    kubectl create configmap github-runner-config \
#      --from-literal=github-owner=<ORG_NAME> \
#      --from-literal=runner-name=essedum-runner \
#      --from-literal=runner-labels=essedum-runner,k8s,linux \
#      -n essedum

# 6. Kubeconfig secret (if not using deployment)
#    kubectl create secret generic github-runner-kubeconfig \
#      --from-file=config=<PATH_TO_KUBECONFIG> \
#      -n essedum

# ============================================================================
# Branch Strategy
# ============================================================================

# Source Branch: "actions"
#   - Target branch for push triggers (CI runs)
#   - Developers push here to trigger CI pipeline
#   - Automatically triggers ci-k8s.yml workflow

# Destination Branch: "actions-automation"
#   - Target branch for pull requests
#   - PRs from "actions" to "actions-automation" trigger CI
#   - Automated deployment PRs should target this branch
#   - Protected branch with required checks

# Deployment Flow:
#   1. Developer pushes to "actions" branch
#   2. CI pipeline (ci-k8s.yml) runs
#   3. On success, create PR to "actions-automation"
#   4. Review and merge PR
#   5. CD pipeline (cd-deploy-k8s.yml) triggers
#   6. Deployment to Kubernetes cluster

# ============================================================================
# Workflow Files Location
# ============================================================================

# .github/workflows/
#   ├── ci-k8s.yml           # Build & Test on actions branch
#   ├── cd-deploy-k8s.yml    # Deploy to Kubernetes on actions branch
#   └── cd-rollback-k8s.yml  # Manual rollback workflow

# ============================================================================
# AKS Deployment Files Location
# ============================================================================

# aks-deployment/
#   ├── github-runner-rbac.yml           # RBAC configuration
#   ├── github-runner-deployment.yml     # Runner deployment
#   ├── essedum-backend.yaml             # Backend deployment (existing)
#   ├── essedum-ui.yaml                  # Frontend deployment (existing)
#   ├── proxy-deployment.yml             # Proxy service (existing)
#   └── [other existing manifests...]

# ============================================================================
# Post-Setup Verification
# ============================================================================

# 1. Verify runner is registered
#    curl -H "Authorization: token ${GITHUB_TOKEN}" \
#      https://api.github.com/orgs/<ORG>/actions/runners

# 2. Check runner status on self-hosted server
#    systemctl status github-runner
#    journalctl -u github-runner -f

# 3. Verify Kubernetes access from runner
#    sudo -u github-runner kubectl get nodes

# 4. Check GitHub Runner pod status
#    kubectl get pods -n essedum -l app=github-runner
#    kubectl logs -n essedum -l app=github-runner -f

# 5. Test runner with a simple workflow
#    Create a workflow that runs on [self-hosted, essedum-runner]

# ============================================================================
# Troubleshooting
# ============================================================================

# Runner not appearing in GitHub UI:
#   1. Check registration: cat /opt/github-runner/.runner | jq .
#   2. Check service: systemctl status github-runner
#   3. Check logs: journalctl -u github-runner -n 50
#   4. Check pod logs: kubectl logs -n essedum -l app=github-runner
#   5. Re-register: /opt/github-runner/config.sh --remove && re-run setup

# Kubernetes access issues:
#   1. Verify KUBECONFIG: export KUBECONFIG=/opt/github-runner/.kube/config
#   2. Test access: kubectl cluster-info
#   3. Check namespace: kubectl get ns essedum
#   4. Verify RBAC: kubectl auth can-i get deployments --as=system:serviceaccount:essedum:github-runner -n essedum

# Container registry issues:
#   1. Test login: docker login -u <username> -p <password> <registry>
#   2. Check credentials in GitHub secrets
#   3. Verify registry URL format

# Workflow failures:
#   1. Check workflow logs in GitHub Actions tab
#   2. Review pod logs: kubectl logs -n essedum <pod-name>
#   3. Check deployment status: kubectl describe deployment -n essedum
#   4. Review events: kubectl get events -n essedum --sort-by='.lastTimestamp'

# Manifest validation errors:
#   1. Validate manifest syntax: kubectl apply -f manifest.yml --dry-run=client
#   2. Check for required fields: grep -E "(image:|replicas:|name:)" manifest.yml
#   3. Use kubectl explain: kubectl explain deployment.spec
#   4. Check existing manifests: ls -la aks-deployment/
