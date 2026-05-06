# GitHub Actions Kubernetes Setup - File Index

This folder contains all setup scripts, configuration guides, and documentation for the Kubernetes-based GitHub Actions runner infrastructure.

## Quick Start
For first-time setup, start with:
1. [SETUP_GUIDE_K8S.md](SETUP_GUIDE_K8S.md) - Complete step-by-step instructions
2. [runner-setup.sh](runner-setup.sh) - Automated installation script

## Setup Scripts

### runner-setup.sh
**Purpose:** Automated installation and configuration of GitHub Actions runner on Kubernetes

**Functions:**
- Checks prerequisites (Docker, kubectl, git)
- Creates service account and working directories
- Downloads and registers GitHub runner binary
- Creates systemd service for runner management
- Verifies Kubernetes access and health

**Usage:**
```bash
sudo bash runner-setup.sh \
  --github-token <PAT_TOKEN> \
  --github-owner <ORG_NAME> \
  --namespace essedum
```

**Requirements:**
- Root/sudo access
- Kubernetes cluster access (kubeconfig)
- GitHub Personal Access Token (repo, workflow, admin:org_hook scopes)

### github-secrets-setup.sh
**Purpose:** Helper script for configuring GitHub repository secrets

**Functions:**
- Interactive prompts for registry credentials
- Automated secret creation via GitHub CLI
- Validation of GitHub CLI authentication

**Usage:**
```bash
bash github-secrets-setup.sh
```

## Documentation

### SETUP_GUIDE_K8S.md
Complete step-by-step guide for setting up the entire infrastructure:
- Prerequisites and system requirements
- GitHub token generation
- RBAC and runner deployment
- Verification and troubleshooting
- Production hardening tips

**Length:** ~430 lines | **Reading time:** 15-20 minutes

### README_K8S_IMPLEMENTATION.md
Comprehensive overview of the Kubernetes implementation:
- Architecture overview
- Workflow automation pipelines
- Kubernetes manifests explained
- Integration with GitHub Actions
- Deployment verification procedures

**Length:** ~360 lines | **Reading time:** 15-20 minutes

### IMPLEMENTATION_SUMMARY.md
Summary of all changes and components:
- What was migrated from Docker to Kubernetes
- New files created
- Configuration changes
- Integration points
- Success criteria

**Length:** ~520 lines | **Reading time:** 20-25 minutes

### TROUBLESHOOTING_K8S.md
Detailed troubleshooting guide covering 8+ common issues:
- Runner registration failures
- Kubernetes authentication errors
- Docker image build issues
- Deployment failures
- Pod health problems
- Solutions and diagnostics for each issue

**Length:** ~600 lines | **Reading time:** 20-25 minutes

### QUICK_REFERENCE_K8S.md
Quick lookup guide and command reference:
- Common kubectl commands
- Debug commands
- Registry commands
- Useful aliases
- Environment variable reference

**Length:** ~350 lines | **Reading time:** 5-10 minutes

### DEPLOYMENT_CHECKLIST.md
Verification and deployment checklist:
- Pre-deployment checks
- Deployment verification steps
- Post-deployment validation
- Health checks and monitoring
- Rollback procedures

**Length:** ~400 lines | **Reading time:** 10-15 minutes

## Related Files

### In essedum-platform/.github/workflows/
- `ci-k8s.yml` - CI pipeline for "actions" branch
- `cd-deploy-k8s.yml` - CD deployment to Kubernetes
- `cd-rollback-k8s.yml` - Manual rollback workflow

### In essedum-platform/aks-deployment/
- `github-runner-rbac.yml` - RBAC configuration
- `github-runner-deployment.yml` - Runner pod deployment
- `README-RUNNER-CONFIG.md` - Runner configuration guide

## GitHub Secrets Required

Before running setup scripts, configure these secrets in your GitHub repository:

| Secret Name | Purpose | Example |
|---|---|---|
| `GITHUB_TOKEN` | PAT for runner registration | ghp_xxxxxxxxxxxx |
| `CONTAINER_REGISTRY` | Docker registry URL | docker.io/myorg |
| `REGISTRY_USERNAME` | Registry username | myuser |
| `REGISTRY_PASSWORD` | Registry password | [GitHub Actions secret] |
| `K8S_NAMESPACE` | Target namespace | essedum |

## Branch Strategy

### actions branch
- **Purpose:** Source and CI pipeline
- **Trigger:** On push, runs `ci-k8s.yml`
- **Function:** Builds, tests, and validates code

### actions-automation branch
- **Purpose:** CD/deployment branch (after CI success)
- **Trigger:** On push (after CI passes), runs `cd-deploy-k8s.yml`
- **Function:** Deploys to Kubernetes cluster

## Getting Help

1. **For setup issues:** See SETUP_GUIDE_K8S.md
2. **For troubleshooting:** See TROUBLESHOOTING_K8S.md
3. **For quick commands:** See QUICK_REFERENCE_K8S.md
4. **For architecture details:** See README_K8S_IMPLEMENTATION.md
5. **For verification:** See DEPLOYMENT_CHECKLIST.md

## Folder Structure

```
essedum-platform/
├── github-actions-setup/
│   ├── INDEX.md (this file)
│   ├── runner-setup.sh
│   ├── github-secrets-setup.sh
│   ├── SETUP_GUIDE_K8S.md
│   ├── README_K8S_IMPLEMENTATION.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── TROUBLESHOOTING_K8S.md
│   ├── QUICK_REFERENCE_K8S.md
│   └── DEPLOYMENT_CHECKLIST.md
├── .github/workflows/
│   ├── ci-k8s.yml
│   ├── cd-deploy-k8s.yml
│   └── cd-rollback-k8s.yml
├── aks-deployment/
│   ├── github-runner-rbac.yml
│   ├── github-runner-deployment.yml
│   ├── README-RUNNER-CONFIG.md
│   └── [other manifests...]
└── [other directories...]
```

---

**Last Updated:** 2024-04-28  
**Version:** 1.0  
**Status:** Production Ready
