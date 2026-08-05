#!/usr/bin/env bash
# =============================================================================
# Essedum Platform — Universal Build & Push Script
# Zero hardcoded values — all config from docker/.env (copy of .env.sample).
#
# Usage:
#   ./build-and-push.sh [target]
#   target: all | frontend | backend | services | <service> (default: all)
#
#   Groups:
#     frontend  — agent-designer + all frontend MFEs
#     backend   — api-gateway usm-service icip-service data-service vibe-service
#     services  — agent-designer-backend pyjob-executer proxy-service
#                 vibe-code-builder adk-deployer goosed-base goosed
#
#   Individual services:
#     api-gateway | usm-service | icip-service | data-service | vibe-service |
#     agent-designer | agent-designer-backend | frontend-shell | frontend-agent |
#     frontend-data-ops | frontend-integration | frontend-vibe-studio |
#     pyjob-executer | proxy-service | vibe-code-builder | adk-deployer |
#     vibe-pod-watcher | goosed-base | goosed
#
#   goosed target builds goosed-base first, then the wrapper (required order).
#   goose-ui has no local Dockerfile — skipped (external image).
#
# Environments: AKS | 5G | LFN — same script, different .env values.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TARGET="${1:-all}"
MAX_RETRIES=3

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
  # Resolution order: repo-root .env → docker/.env → docker/.env.sample
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
}

# ─── Validate required variables ─────────────────────────────────────────────
validate_env() {
  local required=(DOCKER_REGISTRY IMAGE_TAG)
  local missing=()
  for var in "${required[@]}"; do
    [[ -z "${!var:-}" ]] && missing+=("${var}")
  done
  if [[ ${#missing[@]} -gt 0 ]]; then
    error "Missing required variables: ${missing[*]}. Set them in docker/.env."
  fi
}

# ─── Registry login ───────────────────────────────────────────────────────────
registry_login() {
  if [[ -n "${DOCKER_USERNAME:-}" && -n "${DOCKER_PASSWORD:-}" ]]; then
    info "Logging in to registry: ${DOCKER_REGISTRY} (username/password)"
    if echo "${DOCKER_PASSWORD}" | docker login "${DOCKER_REGISTRY}" \
      -u "${DOCKER_USERNAME}" --password-stdin; then
      success "Registry login OK."
    else
      error "Registry login failed. Check DOCKER_USERNAME / DOCKER_PASSWORD in docker/.env."
    fi
  elif [[ "${ENVIRONMENT:-}" == "5G" || "${ENVIRONMENT:-}" == "LFN" ]]; then
    # Local/bare-metal registry — Azure login is not applicable; registry is on-prem.
    info "ENVIRONMENT=${ENVIRONMENT} — skipping Azure login for local registry ${DOCKER_REGISTRY}."
  else
    # ── ACR auto-login via Azure CLI (fallback when credentials not set, AKS only) ──
    local acr_name
    acr_name="${DOCKER_REGISTRY%%.*}"   # strip .azurecr.io → e.g. acrreq0762935
    if command -v az >/dev/null 2>&1; then
      info "DOCKER_USERNAME/DOCKER_PASSWORD not set — attempting ACR login via Azure CLI."
      info "  Registry: ${DOCKER_REGISTRY}  |  ACR name: ${acr_name}"
      if az acr login --name "${acr_name}"; then
        success "ACR login via Azure CLI OK."
      else
        error "ACR login failed. Run: az login  then retry, or set DOCKER_USERNAME / DOCKER_PASSWORD in docker/.env."
      fi
    else
      warn "DOCKER_USERNAME/DOCKER_PASSWORD not set and 'az' CLI not found."
      warn "Options to fix:"
      warn "  1. Set DOCKER_USERNAME and DOCKER_PASSWORD in docker/.env"
      warn "     (get ACR admin password: az acr credential show --name ${acr_name})"
      warn "  2. Run 'docker login ${DOCKER_REGISTRY}' manually before deploying"
      warn "  3. Install Azure CLI and run 'az login' then retry"
      error "Cannot authenticate to registry ${DOCKER_REGISTRY}. Aborting."
    fi
  fi
}

# ─── NPM lock-file cleanup ────────────────────────────────────────────────────
# Stale package-lock.json / yarn.lock files can block builds when a private
# Artifactory registry is configured.  Remove them before Docker builds.
clean_npm_lockfiles() {
  info "Scanning for npm lock files in essedum-ui ..."
  local removed=0
  while IFS= read -r -d '' f; do
    warn "  Removing: ${f}"
    rm -f "${f}"
    (( removed++ )) || true
  done < <(find "${REPO_ROOT}/essedum-ui" \
    \( -name "package-lock.json" -o -name "yarn.lock" \) \
    -not -path "*/node_modules/*" -print0 2>/dev/null)
  if [[ ${removed} -gt 0 ]]; then
    success "Removed ${removed} lock file(s)."
  else
    info "No lock files found — nothing to clean."
  fi
}

# ─── npm registry config ──────────────────────────────────────────────────────
# Accepts consolidated REGISTRY_TOKEN or legacy NPM_AUTH_TOKEN.
# A JFrog identity token works for both npm (frontend) and Maven (backend).
configure_npm() {
  local npm_token="${NPM_AUTH_TOKEN:-${REGISTRY_TOKEN:-}}"
  if [[ -n "${NPM_REGISTRY_URL:-}" ]] && [[ -n "${npm_token}" ]]; then
    info "Configuring npm registry: ${NPM_REGISTRY_URL}"
    npm config set registry "${NPM_REGISTRY_URL}" 2>/dev/null || \
      warn "npm config set failed — npm may not be installed on this host (OK for Docker-only builds)."
    local reg_host
    reg_host="${NPM_REGISTRY_URL#http*:}"
    npm config set "${reg_host}:_authToken" "${npm_token}" 2>/dev/null || true
    success "npm auth token configured for ${reg_host}."
  elif [[ -n "${NPM_REGISTRY_URL:-}" ]]; then
    info "NPM_REGISTRY_URL set but no token — using unauthenticated registry."
    npm config set registry "${NPM_REGISTRY_URL}" 2>/dev/null || true
  fi
}

# ─── Build + push with retry ─────────────────────────────────────────────────
build_and_push() {
  local image="$1"
  local context="$2"
  local dockerfile="$3"
  local attempt=1
  local is_frontend_build="false"

  if [[ "${dockerfile}" == essedum-ui/* || "${context}" == *"/essedum-ui/agent-designer-frontend" ]]; then
    is_frontend_build="true"
  fi

  while (( attempt <= MAX_RETRIES )); do
    # Enforce lock-file rule for every frontend build attempt.
    if [[ "${is_frontend_build}" == "true" ]]; then
      clean_npm_lockfiles
    fi

    info "Build [${attempt}/${MAX_RETRIES}]: ${image}"
    if docker build \
        --progress=plain \
        --network=host \
        --build-arg DOCKER_REGISTRY="${DOCKER_REGISTRY}" \
        --build-arg IMAGE_TAG="${IMAGE_TAG}" \
        --build-arg NPM_REGISTRY_URL="${NPM_REGISTRY_URL:-}" \
        --build-arg NPM_AUTH_TOKEN="${NPM_AUTH_TOKEN:-${REGISTRY_TOKEN:-}}" \
        --build-arg NPM_ALWAYS_AUTH="${NPM_ALWAYS_AUTH:-true}" \
        --build-arg ARTIFACTORY_REPO_USER="${ARTIFACTORY_REPO_USER:-${REGISTRY_USER:-}}" \
        --build-arg ARTIFACTORY_REPO_PASS="${ARTIFACTORY_REPO_PASS:-${REGISTRY_TOKEN:-}}" \
        --build-arg MAVEN_SETTINGS_FILE="${MAVEN_SETTINGS_FILE:-maven-settings.xml}" \
        -t "${image}" \
        -f "${context}/${dockerfile}" \
        "${context}"; then
      info "Pushing: ${image}"
      if docker push "${image}"; then
        success "✓  ${image}"
        return 0
      fi
    fi
    warn "Attempt ${attempt} failed for: ${image}"
    (( attempt++ )) || true
    [[ ${attempt} -le ${MAX_RETRIES} ]] && { warn "Retrying in 10s ..."; sleep 10; }
  done
  error "All ${MAX_RETRIES} build attempts failed for: ${image}"
}

# ─── Per-service build functions ─────────────────────────────────────────────
build_api_gateway() {
  build_and_push \
    "${DOCKER_REGISTRY}/${API_GATEWAY_IMAGE:-essedum-api-gateway}:${IMAGE_TAG}" \
    "${REPO_ROOT}/sv" \
    "api-gateway/Dockerfile_oauth2"
}

build_usm_service() {
  build_and_push \
    "${DOCKER_REGISTRY}/${USM_IMAGE:-essedum-usm-service}:${IMAGE_TAG}" \
    "${REPO_ROOT}/sv" \
    "usm-service/Dockerfile_oauth2"
}

build_icip_service() {
  build_and_push \
    "${DOCKER_REGISTRY}/${ICIP_IMAGE:-essedum-icip-service}:${IMAGE_TAG}" \
    "${REPO_ROOT}/sv" \
    "icip-service/Dockerfile_oauth2"
}

build_data_service() {
  build_and_push \
    "${DOCKER_REGISTRY}/${DATA_IMAGE:-essedum-data-service}:${IMAGE_TAG}" \
    "${REPO_ROOT}/sv" \
    "data-service/Dockerfile_oauth2"
}

build_vibe_service() {
  build_and_push \
    "${DOCKER_REGISTRY}/${VIBE_IMAGE:-essedum-vibe-service}:${IMAGE_TAG}" \
    "${REPO_ROOT}/sv" \
    "vibe-service/Dockerfile_oauth2"
}

build_agent_designer() {
  build_and_push \
    "${DOCKER_REGISTRY}/${FRONTEND_AGENT_DESIGNER_IMAGE:-essedum-frontend-agent-designer}:${IMAGE_TAG}" \
    "${REPO_ROOT}/essedum-ui/agent-designer-frontend" \
    "Dockerfile"
}

build_agent_designer_backend() {
  build_and_push \
    "${DOCKER_REGISTRY}/${AGENT_DESIGNER_IMAGE:-agent-designer-backend}:${IMAGE_TAG}" \
    "${REPO_ROOT}/agent-designer-backend" \
    "Dockerfile"
}

build_frontend_shell() {
  build_and_push \
    "${DOCKER_REGISTRY}/${FRONTEND_SHELL_IMAGE:-essedum-frontend-shell}:${IMAGE_TAG}" \
    "${REPO_ROOT}" \
    "essedum-ui/Dockerfile.shell"
}

build_frontend_agent() {
  build_and_push \
    "${DOCKER_REGISTRY}/${FRONTEND_AGENT_IMAGE:-essedum-frontend-agent}:${IMAGE_TAG}" \
    "${REPO_ROOT}" \
    "essedum-ui/Dockerfile.agent"
}

build_frontend_data_ops() {
  build_and_push \
    "${DOCKER_REGISTRY}/${FRONTEND_DATA_OPS_IMAGE:-essedum-frontend-data-ops}:${IMAGE_TAG}" \
    "${REPO_ROOT}" \
    "essedum-ui/Dockerfile.data-ops"
}

build_frontend_integration() {
  build_and_push \
    "${DOCKER_REGISTRY}/${FRONTEND_INTEGRATION_IMAGE:-essedum-frontend-integration}:${IMAGE_TAG}" \
    "${REPO_ROOT}" \
    "essedum-ui/Dockerfile.integration"
}

build_frontend_vibe_studio() {
  build_and_push \
    "${DOCKER_REGISTRY}/${FRONTEND_VIBE_STUDIO_IMAGE:-essedum-frontend-vibe-studio}:${IMAGE_TAG}" \
    "${REPO_ROOT}" \
    "essedum-ui/Dockerfile.vibe-studio"
}

build_pyjob_executer() {
  build_and_push \
    "${DOCKER_REGISTRY}/${PYJOB_IMAGE:-py-job-executer}:${IMAGE_TAG}" \
    "${REPO_ROOT}/py-job-executer" \
    "Dockerfile"
}

build_proxy_service() {
  build_and_push \
    "${DOCKER_REGISTRY}/${PROXY_IMAGE:-proxy-service}:${IMAGE_TAG}" \
    "${REPO_ROOT}/proxy-service" \
    "Dockerfile"
}

build_vibe_code_builder() {
  build_and_push \
    "${DOCKER_REGISTRY}/${VIBE_BUILDER_IMAGE:-vibe-code-builder-deployer}:${IMAGE_TAG}" \
    "${REPO_ROOT}/vibe-code-builder-deployer" \
    "Dockerfile"
}

build_adk_deployer() {
  build_and_push \
    "${DOCKER_REGISTRY}/${ADK_DEPLOYER_IMAGE:-adk-code-builder-deployer}:${IMAGE_TAG}" \
    "${REPO_ROOT}/adk-code-builder-deployer" \
    "Dockerfile"
}

build_goosed_base() {
  local goose_path="${GOOSE_PATH:-/home/useradmin/goose-vibe-studio-agent/essedum-agents/goose-vibe-studio-agent}"
  [[ -d "${goose_path}" ]] || \
    error "GOOSE_PATH not found: ${goose_path}. Set GOOSE_PATH in docker/.env."
  [[ -f "${goose_path}/goosed-bin" ]] || \
    warn "goosed-bin not found in ${goose_path} — Docker build may fail if binary is missing."
  build_and_push \
    "${DOCKER_REGISTRY}/${GOOSED_BASE_IMAGE:-goosed-base}:${IMAGE_TAG}" \
    "${goose_path}" \
    "Dockerfile.goosed"
}

build_vibe_pod_watcher() {
  build_and_push \
    "${DOCKER_REGISTRY}/${VIBE_POD_WATCHER_IMAGE:-vibe-pod-watcher}:${IMAGE_TAG}" \
    "${REPO_ROOT}/vibe-pod-watcher" \
    "Dockerfile"
}

build_goosed_wrapper() {
  local ctx
  local wrapper_path="${GOOSED_WRAPPER_PATH:-${REPO_ROOT}/../goosed-wrapper}"
  ctx="$(cd "${wrapper_path}" 2>/dev/null && pwd)" \
    || error "goosed-wrapper directory not found at ${wrapper_path}. Set GOOSED_WRAPPER_PATH in docker/.env."
  build_and_push \
    "${DOCKER_REGISTRY}/${GOOSED_IMAGE:-goosed}:${IMAGE_TAG}" \
    "${ctx}" \
    "Dockerfile"
}

# ─── Entry point ─────────────────────────────────────────────────────────────
command -v docker >/dev/null 2>&1 || error "docker not found in PATH."

step "Loading Configuration"
load_env
validate_env
registry_login
clean_npm_lockfiles
configure_npm

step "Build Target: ${TARGET} | Registry: ${DOCKER_REGISTRY} | Tag: ${IMAGE_TAG} | Env: ${ENVIRONMENT:-unset}"

case "${TARGET}" in
  all)
    build_api_gateway
    build_usm_service
    build_icip_service
    build_data_service
    build_vibe_service
    build_agent_designer_backend
    build_agent_designer
    build_frontend_shell
    build_frontend_agent
    build_frontend_data_ops
    build_frontend_integration
    build_frontend_vibe_studio
    build_pyjob_executer
    build_proxy_service
    build_vibe_code_builder
    build_adk_deployer
    build_vibe_pod_watcher
    build_goosed_base
    build_goosed_wrapper
    warn "goose-ui has no local Dockerfile — skipping (external image)."
    ;;
  frontend)
    build_agent_designer
    build_frontend_shell
    build_frontend_agent
    build_frontend_data_ops
    build_frontend_integration
    build_frontend_vibe_studio
    ;;
  backend)
    build_api_gateway
    build_usm_service
    build_icip_service
    build_data_service
    build_vibe_service
    ;;
  services)
    build_agent_designer_backend
    build_pyjob_executer
    build_proxy_service
    build_vibe_code_builder
    build_adk_deployer
    build_vibe_pod_watcher
    build_goosed_base
    build_goosed_wrapper
    ;;
  api-gateway)              build_api_gateway            ;;
  usm-service)              build_usm_service            ;;
  icip-service)             build_icip_service           ;;
  data-service)             build_data_service           ;;
  vibe-service)             build_vibe_service           ;;
  agent-designer)           build_agent_designer         ;;
  agent-designer-backend)   build_agent_designer_backend ;;
  frontend-shell)           build_frontend_shell         ;;
  frontend-agent)           build_frontend_agent         ;;
  frontend-data-ops)        build_frontend_data_ops      ;;
  frontend-integration)     build_frontend_integration   ;;
  frontend-vibe-studio)     build_frontend_vibe_studio   ;;
  pyjob-executer)           build_pyjob_executer         ;;
  proxy-service)            build_proxy_service          ;;
  vibe-code-builder)        build_vibe_code_builder      ;;
  adk-deployer)             build_adk_deployer           ;;
  vibe-pod-watcher)         build_vibe_pod_watcher       ;;
  goosed-base)              build_goosed_base            ;;
  goosed)                   build_goosed_base && build_goosed_wrapper ;;
  *)
    error "Unknown target '${TARGET}'. Valid: all | frontend | backend | services | \
api-gateway | usm-service | icip-service | data-service | vibe-service | \
agent-designer | agent-designer-backend | frontend-shell | frontend-agent | \
frontend-data-ops | frontend-integration | frontend-vibe-studio | \
pyjob-executer | proxy-service | vibe-code-builder | adk-deployer | vibe-pod-watcher | goosed-base | goosed"
    ;;
esac

echo ""
success "====== Build & Push Complete: [${TARGET}] ======"
info    "Registry : ${DOCKER_REGISTRY}"
info    "Tag      : ${IMAGE_TAG}"
info    "Env      : ${ENVIRONMENT:-unset}"
