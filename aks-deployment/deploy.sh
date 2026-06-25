#!/usr/bin/env bash
# =============================================================================
# Essedum Platform – One-Touch AKS Deployment Script
# Usage:
#   ./deploy.sh          – deploy / upgrade everything
#   ./deploy.sh status   – show rollout status of all workloads
#   ./deploy.sh teardown – delete all resources (prompts for confirmation)
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAMESPACE="aipns"
ACTION="${1:-deploy}"

# ─── Colour helpers ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ─── Pre-flight checks ───────────────────────────────────────────────────────
check_prerequisites() {
  info "Checking prerequisites..."
  command -v kubectl >/dev/null 2>&1 || error "kubectl not found in PATH."
  kubectl cluster-info >/dev/null 2>&1 || error "Cannot reach Kubernetes cluster. Check your kubeconfig."
  success "Prerequisites OK."
}

# ─── Apply a manifest with a label ───────────────────────────────────────────
apply() {
  local label="$1"
  local file="$2"
  if [[ ! -f "${SCRIPT_DIR}/${file}" ]]; then
    warn "Manifest not found, skipping: ${file}"
    return
  fi
  info "Applying [${label}] → ${file}"
  kubectl apply -f "${SCRIPT_DIR}/${file}"
}

# ─── Wait for a Deployment to become available ───────────────────────────────
wait_for() {
  local name="$1"
  local ns="${2:-${NAMESPACE}}"
  info "Waiting for deployment/${name} to be ready..."
  kubectl rollout status deployment/"${name}" -n "${ns}" --timeout=180s \
    && success "deployment/${name} is ready." \
    || warn "deployment/${name} did not become ready within timeout – continuing."
}

# ─── DEPLOY ──────────────────────────────────────────────────────────────────
deploy() {
  info "====== Essedum Platform Deployment Started ======"

  # 1. Cluster-level infrastructure
  info "--- [1/9] Ingress-NGINX controller ---"
  apply "ingress-nginx" "ingress-nginx-deploy.yaml"
  wait_for "ingress-nginx-controller" "ingress-nginx"

  info "--- [2/9] MetalLB config (if applicable) ---"
  # MetalLB is not used on AKS — skip
  info "  Skipping MetalLB (AKS uses Azure Load Balancer)"

  # 2. Application namespace
  info "--- [3/9] Namespace: ${NAMESPACE} ---"
  kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -
  success "Namespace '${NAMESPACE}' ready."

  # 2b. Vibe Studio deployment namespaces
  info "--- [3b/9] Vibe Studio namespaces ---"
  kubectl create namespace vibe-apps   --dry-run=client -o yaml | kubectl apply -f -
  kubectl create namespace vibe-mcp    --dry-run=client -o yaml | kubectl apply -f -
  kubectl create namespace vibe-agents --dry-run=client -o yaml | kubectl apply -f -
  success "Vibe Studio namespaces (vibe-apps, vibe-mcp, vibe-agents) ready."
  apply "vibe-apps-rbac"   "vibe-apps-rbac.yaml"
  apply "vibe-mcp-rbac"    "vibe-mcp-rbac.yaml"
  apply "vibe-agents-rbac" "vibe-agents-rbac.yaml"

  # 3. Secrets (must be applied before workloads that reference them)
  info "--- [3.5/9] Secrets ---"
  if [[ -f "${SCRIPT_DIR}/create-secrets.sh" ]]; then
    bash "${SCRIPT_DIR}/create-secrets.sh" || warn "create-secrets.sh encountered an issue – check secret values and re-run manually if needed."
  else
    warn "create-secrets.sh not found – skipping automated secret creation. Ensure all secrets exist in namespace '${NAMESPACE}'."
  fi

  # 4. Persistent storage (PVs are immutable after creation — errors here are non-fatal)
  info "--- [4/9] Persistent Volumes & Claims ---"
  apply "mysql-pv"    "mysql_file_pv.yaml"    || warn "mysql-pv: already exists or immutable — skipping"
  apply "qdrant-pv"   "qdrantfilepv.yaml"     || warn "qdrant-pv: already exists or immutable — skipping"
  apply "langflow-pv" "langflow_file_pv.yaml" || warn "langflow-pv: already exists or immutable — skipping"

  # 4. Stateful data-plane services (PVCs are immutable — errors are non-fatal)
  info "--- [5/9] Data stores (MySQL, Qdrant) ---"
  apply "mysql"  "mysql_deployment_v3.yaml"  || warn "mysql: apply had errors (PVC may be immutable) — continuing"
  apply "qdrant" "qdrant_deployment.yaml"    || warn "qdrant: apply had errors (PVC may be immutable) — continuing"
  wait_for "mysql"  "${NAMESPACE}"
  wait_for "qdrant" "${NAMESPACE}"

  # 5. Identity
  info "--- [6/9] Keycloak (Identity) ---"
  apply "keycloak" "keycloak_deployment.yaml"
  wait_for "keycloak" "${NAMESPACE}"

  # 6. Core application workloads
  info "--- [7/9] Core application workloads ---"

  # Backend microservices
  apply "essedum-backend-api-gateway"  "essedum-backend.yaml"
  apply "essedum-backend-usm"          "usm-service.yaml"
  apply "essedum-backend-icip"         "icip-service.yaml"
  apply "essedum-backend-data"         "data-service.yaml"
  apply "essedum-backend-vibe"         "vibe-service.yaml"

  wait_for "essedum-backend-api-gateway" "${NAMESPACE}"
  wait_for "essedum-backend-usm"         "${NAMESPACE}"
  wait_for "essedum-backend-icip"        "${NAMESPACE}"
  wait_for "essedum-backend-data"        "${NAMESPACE}"
  wait_for "essedum-backend-vibe"        "${NAMESPACE}"

  # Frontend microservices (1 shell host + 4 MFE pods)
  apply "essedum-frontend-shell"              "essedum-frontend-shell.yaml"
  apply "essedum-frontend-agent"              "essedum-frontend-agent.yaml"
  apply "essedum-frontend-agent-designer"     "essedum-frontend-agent-designer.yaml"
  apply "essedum-frontend-data-ops"           "essedum-frontend-data-ops.yaml"
  apply "essedum-frontend-integration"        "essedum-frontend-integration.yaml"
  apply "essedum-frontend-vibe-studio"        "essedum-frontend-vibe-studio.yaml"

  wait_for "essedum-frontend-shell"           "${NAMESPACE}"
  wait_for "essedum-frontend-agent"           "${NAMESPACE}"
  wait_for "essedum-frontend-agent-designer"  "${NAMESPACE}"
  wait_for "essedum-frontend-data-ops"        "${NAMESPACE}"
  wait_for "essedum-frontend-integration"     "${NAMESPACE}"
  wait_for "essedum-frontend-vibe-studio"     "${NAMESPACE}"

  # Supporting services
  apply "pyjob-executor"               "pyjob-executor.yaml"
  apply "proxy"                        "proxy-deployment.yml"
  apply "langflow"                     "langflow-deployment-with-tls.yaml"
  apply "builder-rbac"                 "builder-rbac.yml"
  apply "builder"                      "builder-deployment.yml"
  apply "goosed"                       "goosed-deployment.yaml"
  apply "goose-ui"                     "goose-ui-deployment.yaml"
  apply "vibe-configmap"               "vibe-code-builder-configmap.yml"
  apply "vibe-builder"                 "vibe-code-builder-deployment.yml"

  wait_for "pyjob-executor" "${NAMESPACE}"
  wait_for "langflow"       "${NAMESPACE}"

  # 7. Horizontal Pod Autoscalers
  info "--- [8/9] Horizontal Pod Autoscalers ---"
  apply "essedum-backend-api-gateway-hpa" "essedum-backend-hpa.yaml"
  apply "essedum-ui-hpa"                  "essedum-ui-hpa.yaml"
  apply "keycloak-hpa"                    "keycloak-hpa.yaml"
  apply "pyjob-hpa"                       "pyjob-executor-hpa.yaml"

  # 8. Ingress rules
  info "--- [9/9] Ingress rules ---"
  apply "essedum-frontend-ingress"     "essedum-frontend-ingress.yaml"
  apply "essedum-frontend-mfe-ingress" "essedum-frontend-mfe-ingress.yaml"
  apply "essedum-api-ingress"          "essedum-api-ingress.yaml"
  apply "keycloak-ingress"             "keycloak-ingress.yaml"
  apply "ingress"                      "ingress.yaml"
  apply "goose-ingress"                "goose-ingress.yaml"
  apply "vibe-builder-ingress"         "vibe-code-builder-ingress.yaml"

  success "====== Deployment Complete ======"
  status
}

# ─── STATUS ──────────────────────────────────────────────────────────────────
status() {
  echo ""
  info "===== Deployment Status: namespace '${NAMESPACE}' ====="
  kubectl get deployments,pods,services,ingress -n "${NAMESPACE}" 2>/dev/null || true
  echo ""
  info "===== Ingress-NGINX controller ====="
  kubectl get deployments,pods,services -n ingress-nginx 2>/dev/null || true
}

# ─── TEARDOWN ────────────────────────────────────────────────────────────────
teardown() {
  warn "This will DELETE all Essedum resources in namespace '${NAMESPACE}'."
  read -rp "Type 'yes' to confirm: " confirm
  [[ "${confirm}" == "yes" ]] || { info "Aborted."; exit 0; }

  info "Removing ingress rules..."
  kubectl delete -f "${SCRIPT_DIR}/essedum-frontend-ingress.yaml"     --ignore-not-found
  kubectl delete -f "${SCRIPT_DIR}/essedum-frontend-mfe-ingress.yaml" --ignore-not-found
  kubectl delete -f "${SCRIPT_DIR}/essedum-api-ingress.yaml"          --ignore-not-found
  kubectl delete -f "${SCRIPT_DIR}/keycloak-ingress.yaml"             --ignore-not-found
  kubectl delete -f "${SCRIPT_DIR}/ingress.yaml"                      --ignore-not-found
  kubectl delete -f "${SCRIPT_DIR}/goose-ingress.yaml"                --ignore-not-found
  kubectl delete -f "${SCRIPT_DIR}/vibe-code-builder-ingress.yaml"    --ignore-not-found

  info "Removing HPAs..."
  kubectl delete -f "${SCRIPT_DIR}/essedum-backend-hpa.yaml"  --ignore-not-found
  kubectl delete -f "${SCRIPT_DIR}/keycloak-hpa.yaml"         --ignore-not-found
  kubectl delete -f "${SCRIPT_DIR}/pyjob-executor-hpa.yaml"   --ignore-not-found

  info "Removing workloads..."
  for f in \
    essedum-backend.yaml usm-service.yaml icip-service.yaml \
    data-service.yaml vibe-service.yaml \
    essedum-frontend-shell.yaml essedum-frontend-agent.yaml \
    essedum-frontend-data-ops.yaml essedum-frontend-integration.yaml \
    essedum-frontend-vibe-studio.yaml \
    pyjob-executor.yaml proxy-deployment.yml langflow-deployment-with-tls.yaml \
    builder-deployment.yml builder-rbac.yml \
    goosed-deployment.yaml goose-ui-deployment.yaml \
    vibe-code-builder-configmap.yml vibe-code-builder-deployment.yml; do
    kubectl delete -f "${SCRIPT_DIR}/${f}" --ignore-not-found
  done

  info "Removing Keycloak..."
  kubectl delete -f "${SCRIPT_DIR}/keycloak_deployment.yaml"  --ignore-not-found

  info "Removing data stores..."
  kubectl delete -f "${SCRIPT_DIR}/mysql_deployment_v3.yaml"  --ignore-not-found
  kubectl delete -f "${SCRIPT_DIR}/qdrant_deployment.yaml"    --ignore-not-found

  info "Removing Persistent Volumes..."
  kubectl delete -f "${SCRIPT_DIR}/mysql_file_pv.yaml"        --ignore-not-found
  kubectl delete -f "${SCRIPT_DIR}/qdrantfilepv.yaml"         --ignore-not-found
  kubectl delete -f "${SCRIPT_DIR}/langflow_file_pv.yaml"     --ignore-not-found

  info "Deleting namespace '${NAMESPACE}'..."
  kubectl delete namespace "${NAMESPACE}" --ignore-not-found

  success "Teardown complete."
}

# ─── Entry point ─────────────────────────────────────────────────────────────
check_prerequisites

case "${ACTION}" in
  deploy)   deploy   ;;
  status)   status   ;;
  teardown) teardown ;;
  *) error "Unknown action '${ACTION}'. Use: deploy | status | teardown" ;;
esac
