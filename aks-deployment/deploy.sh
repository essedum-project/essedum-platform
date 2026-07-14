#!/usr/bin/env bash
# =============================================================================
# Essedum Platform — Universal Kubernetes Deployment Script
# Zero hardcoded values — all config from docker/.env (copy of .env.sample).
# Works identically on AKS, 5G, and LFN clusters.
#
# Usage:
#   ./deploy.sh              — deploy / upgrade everything
#   ./deploy.sh status       — show rollout status of all workloads
#   ./deploy.sh validate     — validate env config without deploying
#   ./deploy.sh one-touch    — one command: build + push + deploy
#   ./deploy.sh one-touch frontend  — build only frontend images, then deploy
#
# How environment-agnostic works:
#   1. Set ENVIRONMENT, KUBE_CONTEXT, KUBE_NAMESPACE, INGRESS_HOST, etc. in .env
#   2. Run ./deploy.sh — script handles context switching, namespace creation,
#      envsubst on all YAML, and rollout validation automatically.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ACTION="${1:-deploy}"
BUILD_TARGET="${2:-all}"

# ─── Colour helpers ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }
step()    { echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; \
            echo -e "${CYAN}  $*${NC}"; \
            echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }

# ─── Load .env ───────────────────────────────────────────────────────────────
load_env() {
  local env_file=""
  for candidate in \
    "${REPO_ROOT}/.env" \
    "${REPO_ROOT}/docker/.env" \
    "${REPO_ROOT}/docker/.env.sample"; do
    if [[ -f "${candidate}" ]]; then
      env_file="${candidate}"
      break
    fi
  done

  [[ -z "${env_file}" ]] && \
    error "No .env file found. Copy docker/.env.sample → docker/.env and fill in your values."

  info "Loading config from: ${env_file}"
  local had_nounset=0
  [[ $- == *u* ]] && had_nounset=1
  set +u
  set -a
  # shellcheck disable=SC1090
  source "${env_file}"
  set +a
  (( had_nounset )) && set -u

  # Apply defaults for optional values
  KUBE_NAMESPACE="${KUBE_NAMESPACE:-aipns}"
  ENVIRONMENT="${ENVIRONMENT:-unknown}"
  VIBE_APPS_NAMESPACE="${VIBE_APPS_NAMESPACE:-vibe-apps}"
  VIBE_MCP_NAMESPACE="${VIBE_MCP_NAMESPACE:-vibe-mcp}"
  VIBE_AGENTS_NAMESPACE="${VIBE_AGENTS_NAMESPACE:-vibe-agents}"
  INGRESS_CLASS="${INGRESS_CLASS:-nginx}"
}

# ─── Validate required variables ─────────────────────────────────────────────
validate_env() {
  step "Validating Configuration"
  local required=(
    DOCKER_REGISTRY IMAGE_TAG
    KUBE_NAMESPACE
    INGRESS_HOST TLS_SECRET_NAME
  )
  local missing=()

  for var in "${required[@]}"; do
    if [[ -z "${!var:-}" ]]; then
      missing+=("${var}")
      warn "  ✗ ${var} — NOT SET"
    else
      info "  ✓ ${var} = ${!var}"
    fi
  done

  if [[ -n "${KUBE_CONTEXT:-}" ]]; then
    info "  ✓ KUBE_CONTEXT = ${KUBE_CONTEXT}"
  else
    warn "  ! KUBE_CONTEXT not set — will use current kubeconfig context."
  fi

  [[ ${#missing[@]} -gt 0 ]] && \
    error "Missing required variables: ${missing[*]}. Edit docker/.env."

  success "Validation passed — Environment: ${ENVIRONMENT} | Namespace: ${KUBE_NAMESPACE}"
}

# ─── Apply with envsubst ──────────────────────────────────────────────────────
# envsubst replaces ${VAR} placeholders in YAML with values from the loaded env.
# This makes every YAML file fully environment-agnostic.
apply() {
  local label="$1"
  local file="$2"
  local full_path="${SCRIPT_DIR}/${file}"

  if [[ ! -f "${full_path}" ]]; then
    warn "[SKIP] Not found: ${file}"
    return
  fi

  info "Applying [${label}]  →  ${file}"
  envsubst < "${full_path}" | kubectl apply -f -
}

# ─── Wait for rollout ─────────────────────────────────────────────────────────
wait_for() {
  local name="$1"
  local ns="${2:-${KUBE_NAMESPACE}}"
  info "Waiting for deployment/${name} in ns/${ns} ..."
  kubectl rollout status "deployment/${name}" -n "${ns}" --timeout=180s \
    && success "  deployment/${name} ready." \
    || warn "  deployment/${name} timed out — check manually: kubectl describe pod -l app=${name} -n ${ns}"
}

# ─── Pre-flight checks ────────────────────────────────────────────────────────
check_prerequisites() {
  step "Pre-flight Checks"

  command -v kubectl    >/dev/null 2>&1 || error "kubectl not found in PATH."
  command -v envsubst   >/dev/null 2>&1 || \
    error "envsubst not found. Install: sudo apt-get install -y gettext-base"

  # Switch kubectl context dynamically — the core of environment-agnosticism
  if [[ -n "${KUBE_CONTEXT:-}" ]]; then
    info "Switching kubectl context → ${KUBE_CONTEXT}"
    kubectl config use-context "${KUBE_CONTEXT}" \
      || error "Cannot switch to context '${KUBE_CONTEXT}'. Run: kubectl config get-contexts"
  else
    local current_ctx
    current_ctx="$(kubectl config current-context 2>/dev/null || echo 'none')"
    warn "KUBE_CONTEXT not set — using current context: ${current_ctx}"
  fi

  # Override kubeconfig path if specified
  if [[ -n "${KUBE_CONFIG_PATH:-}" ]]; then
    export KUBECONFIG="${KUBE_CONFIG_PATH}"
    info "Using KUBECONFIG: ${KUBECONFIG}"
  fi

  kubectl cluster-info >/dev/null 2>&1 \
    || error "Cannot reach Kubernetes cluster. Check kubeconfig / VPN / cluster status."

  success "Pre-flight OK — cluster is reachable."
}

# ─── DEPLOY ──────────────────────────────────────────────────────────────────
deploy() {
  step "Essedum Deployment — Env: ${ENVIRONMENT} | Cluster: ${KUBE_CONTEXT:-current} | Namespace: ${KUBE_NAMESPACE}"

  # ── [1/9] Ingress controller ─────────────────────────────────────────────
  info "--- [1/9] Ingress-NGINX controller ---"
  if [[ "${SKIP_INGRESS_NGINX_MANAGEMENT:-true}" == "true" ]]; then
    warn "Skipping ingress-nginx management (SKIP_INGRESS_NGINX_MANAGEMENT=true). Using existing ingress controller."
  else
    if ! apply "ingress-nginx" "ingress-nginx-deploy.yaml"; then
      warn "Ingress-NGINX apply failed (likely immutable admission Job on existing install). Continuing with existing ingress controller."
    fi
    wait_for "ingress-nginx-controller" "ingress-nginx"
  fi

  # ── [2/9] MetalLB (bare-metal / 5G / LFN; no-op on AKS) ─────────────────
  info "--- [2/9] MetalLB config ---"
  apply "metallb-config" "metallib-config.yaml"

  # ── [3/9] Application namespace ──────────────────────────────────────────
  info "--- [3/9] Namespace: ${KUBE_NAMESPACE} ---"
  kubectl create namespace "${KUBE_NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -
  success "Namespace '${KUBE_NAMESPACE}' ready."

  # ── [3b/9] Vibe Studio namespaces ────────────────────────────────────────
  info "--- [3b/9] Vibe Studio namespaces ---"
  for ns in "${VIBE_APPS_NAMESPACE}" "${VIBE_MCP_NAMESPACE}" "${VIBE_AGENTS_NAMESPACE}"; do
    kubectl create namespace "${ns}" --dry-run=client -o yaml | kubectl apply -f -
  done
  success "Vibe namespaces (${VIBE_APPS_NAMESPACE}, ${VIBE_MCP_NAMESPACE}, ${VIBE_AGENTS_NAMESPACE}) ready."
  apply "vibe-apps-rbac"   "vibe-apps-rbac.yaml"
  apply "vibe-mcp-rbac"    "vibe-mcp-rbac.yaml"
  apply "vibe-agents-rbac" "vibe-agents-rbac.yaml"

  # ── [3.5/9] Secrets ───────────────────────────────────────────────────────
  info "--- [3.5/9] Secrets ---"
  apply "minio-secret" "essedum-minio-secret.yaml"

  # ── [4/9] Persistent storage ─────────────────────────────────────────────
  info "--- [4/9] Persistent Volumes & Claims ---"
  apply "mysql-pv"    "mysql_file_pv.yaml"
  apply "qdrant-pv"   "qdrantfilepv.yaml"
  warn "Skipping optional service: langflow_file_pv.yaml (policy: microservices-only)."

  # ── [5/9] Data stores ────────────────────────────────────────────────────
  info "--- [5/9] Data stores (MySQL, Qdrant) ---"
  apply "mysql"  "mysql_deployment_v3.yaml"
  apply "qdrant" "qdrant_deployment.yaml"
  wait_for "mysql"  "${KUBE_NAMESPACE}"
  wait_for "qdrant" "${KUBE_NAMESPACE}"

  # ── [6/9] Identity ───────────────────────────────────────────────────────
  info "--- [6/9] Keycloak ---"
  apply "keycloak" "keycloak_deployment.yaml"
  wait_for "keycloak" "${KUBE_NAMESPACE}"

  # ── [7/9] Core application workloads ─────────────────────────────────────
  info "--- [7/9] Backend microservices ---"
  apply "essedum-backend-api-gateway"   "essedum-backend.yaml"
  apply "essedum-backend-usm"          "usm-service.yaml"
  apply "essedum-backend-icip"         "icip-service.yaml"
  apply "essedum-backend-data"         "data-service.yaml"
  apply "essedum-backend-vibe"         "vibe-service.yaml"

  wait_for "essedum-backend-api-gateway"  "${KUBE_NAMESPACE}"
  wait_for "essedum-backend-usm"         "${KUBE_NAMESPACE}"
  wait_for "essedum-backend-icip"        "${KUBE_NAMESPACE}"
  wait_for "essedum-backend-data"        "${KUBE_NAMESPACE}"
  wait_for "essedum-backend-vibe"        "${KUBE_NAMESPACE}"

  info "--- [7b/9] Frontend microservices (MFE shell + modules) ---"
  apply "essedum-frontend-shell"              "essedum-frontend-shell.yaml"
  apply "essedum-frontend-agent"              "essedum-frontend-agent.yaml"
  apply "essedum-frontend-agent-designer"     "essedum-frontend-agent-designer.yaml"
  apply "essedum-frontend-data-ops"           "essedum-frontend-data-ops.yaml"
  apply "essedum-frontend-integration"        "essedum-frontend-integration.yaml"
  apply "essedum-frontend-vibe-studio"        "essedum-frontend-vibe-studio.yaml"

  wait_for "essedum-frontend-shell"           "${KUBE_NAMESPACE}"
  wait_for "essedum-frontend-agent"           "${KUBE_NAMESPACE}"
  wait_for "essedum-frontend-agent-designer"  "${KUBE_NAMESPACE}"
  wait_for "essedum-frontend-data-ops"        "${KUBE_NAMESPACE}"
  wait_for "essedum-frontend-integration"     "${KUBE_NAMESPACE}"
  wait_for "essedum-frontend-vibe-studio"     "${KUBE_NAMESPACE}"

  info "--- [7c/9] Supporting services ---"
  apply "pyjob-executor"     "pyjob-executor.yaml"
  apply "proxy"              "proxy-deployment.yml"
  warn "Skipping optional service: langflow-deployment-with-tls.yaml (policy: microservices-only)."
  apply "builder-rbac"       "builder-rbac.yml"
  apply "builder"            "builder-deployment.yml"
  apply "goosed"             "goosed-deployment.yaml"
  apply "goose-ui"           "goose-ui-deployment.yaml"
  apply "vibe-configmap"     "vibe-code-builder-configmap.yml"
  apply "vibe-builder"       "vibe-code-builder-deployment.yml"
  apply "adk-deployer"       "adk-code-builder-deployer.yaml"

  wait_for "pyjob-executor" "${KUBE_NAMESPACE}"

  # ── [8/9] HPA ────────────────────────────────────────────────────────────
  info "--- [8/9] Horizontal Pod Autoscalers ---"
  apply "backend-hpa"  "essedum-backend-hpa.yaml"
  warn "Skipping monolithic manifest: essedum-ui-hpa.yaml (policy: microservices-only)."
  apply "keycloak-hpa" "keycloak-hpa.yaml"
  apply "pyjob-hpa"    "pyjob-executor-hpa.yaml"

  # ── [9/9] Ingress rules ───────────────────────────────────────────────────
  info "--- [9/9] Ingress rules (host: ${INGRESS_HOST}) ---"
  apply "frontend-ingress"     "essedum-frontend-ingress.yaml"
  apply "frontend-mfe-ingress" "essedum-frontend-mfe-ingress.yaml"
  apply "api-ingress"          "essedum-api-ingress.yaml"
  apply "keycloak-ingress"     "keycloak-ingress.yaml"
  apply "main-ingress"         "ingress.yaml"
  apply "goose-ingress"        "goose-ingress.yaml"
  apply "vibe-builder-ingress" "vibe-code-builder-ingress.yaml"

  success "====== Deployment Complete ======"
  echo ""
  info "  Platform URL : https://${INGRESS_HOST}"
  info "  Keycloak URL : https://${KEYCLOAK_INGRESS_HOST:-login.${INGRESS_HOST}}"
  info "  Namespace    : ${KUBE_NAMESPACE}"
  info "  Environment  : ${ENVIRONMENT}"
  echo ""
  status
}

# ─── STATUS ──────────────────────────────────────────────────────────────────
status() {
  step "Deployment Status — Namespace: ${KUBE_NAMESPACE} | Env: ${ENVIRONMENT}"

  echo ""
  info "===== Workloads ====="
  kubectl get deployments,pods -n "${KUBE_NAMESPACE}" \
    -o wide --sort-by='.metadata.name' 2>/dev/null || true

  echo ""
  info "===== Services & Ingress ====="
  kubectl get services,ingress -n "${KUBE_NAMESPACE}" 2>/dev/null || true

  echo ""
  info "===== HPA ====="
  kubectl get hpa -n "${KUBE_NAMESPACE}" 2>/dev/null || true

  echo ""
  info "===== Ingress-NGINX controller ====="
  kubectl get pods,services -n ingress-nginx 2>/dev/null || true
}

# ─── TEARDOWN ────────────────────────────────────────────────────────────────
teardown() {
  error "Teardown is permanently disabled. No resources will be deleted by this script."
}

# ─── ONE-TOUCH (Build + Deploy) ─────────────────────────────────────────────
one_touch() {
  step "One-Touch Build + Deploy — Build target: ${BUILD_TARGET}"

  local preflight_script="${SCRIPT_DIR}/pre-flight-checks.sh"
  local backup_script="${SCRIPT_DIR}/backup-before-deploy.sh"
  local build_script="${SCRIPT_DIR}/build-and-push.sh"

  if [[ "${SKIP_ONE_TOUCH_PREFLIGHT:-false}" != "true" ]]; then
    if [[ -f "${preflight_script}" ]]; then
      info "Running pre-flight gate: ${preflight_script}"
      bash "${preflight_script}"
    else
      warn "Pre-flight script not found: ${preflight_script} (continuing)"
    fi
  else
    warn "Skipping pre-flight gate (SKIP_ONE_TOUCH_PREFLIGHT=true)."
  fi

  if [[ "${SKIP_ONE_TOUCH_BACKUP:-false}" != "true" ]]; then
    if [[ -f "${backup_script}" ]]; then
      info "Running backup capture: ${backup_script}"
      bash "${backup_script}"
    else
      warn "Backup script not found: ${backup_script} (continuing)"
    fi
  else
    warn "Skipping backup capture (SKIP_ONE_TOUCH_BACKUP=true)."
  fi

  [[ -f "${build_script}" ]] || error "Missing build script: ${build_script}"

  info "Running build stage via build-and-push.sh (${BUILD_TARGET})"
  bash "${build_script}" "${BUILD_TARGET}"

  success "Build stage complete. Starting deployment stage."
  deploy
}

# ─── Entry point ─────────────────────────────────────────────────────────────
step "Essedum Universal Deployment — Action: ${ACTION}"
load_env
validate_env
check_prerequisites

case "${ACTION}" in
  deploy)    deploy    ;;
  status)    status    ;;
  validate)  success "Config is valid for environment: ${ENVIRONMENT}." ;;
  one-touch|onetouch)
             one_touch ;;
  *) error "Unknown action '${ACTION}'. Valid: deploy | status | validate | one-touch" ;;
esac
