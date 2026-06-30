#!/usr/bin/env bash
# =============================================================================
# Essedum Platform – Build & Push Script
# Builds all microservice images and pushes them to the local registry.
#
# Usage:
#   ./build-and-push.sh           – build & push all images
#   ./build-and-push.sh frontend  – build & push frontend only
#   ./build-and-push.sh backend   – build & push all backend microservices only
#   ./build-and-push.sh <service> – build & push a single service
#                                   (api-gateway | usm-service | icip-service |
#                                    data-service | vibe-service | ui)
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

REGISTRY="localhost:5000"
TAG="micro_latest"
TARGET="${1:-all}"

# ─── Colour helpers ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

command -v docker >/dev/null 2>&1 || error "docker not found in PATH."

# ─── Build helpers ───────────────────────────────────────────────────────────
build_and_push() {
  local image="$1"      # full image:tag
  local context="$2"    # build context directory
  local dockerfile="$3" # path to Dockerfile (relative to context)

  info "Building ${image} ..."
  docker build \
    --progress=plain \
    -t "${image}" \
    -f "${context}/${dockerfile}" \
    "${context}"

  info "Pushing ${image} ..."
  docker push "${image}"
  success "Done: ${image}"
}

# ─── Individual service functions ────────────────────────────────────────────
build_ui() {
  build_and_push \
    "${REGISTRY}/essedum-ui:${TAG}" \
    "${REPO_ROOT}" \
    "essedum-ui/Dockerfile"
}

build_api_gateway() {
  build_and_push \
    "${REGISTRY}/essedum-api-gateway:${TAG}" \
    "${REPO_ROOT}/sv" \
    "api-gateway/Dockerfile_oauth2"
}

build_usm_service() {
  build_and_push \
    "${REGISTRY}/essedum-usm-service:${TAG}" \
    "${REPO_ROOT}/sv" \
    "usm-service/Dockerfile_oauth2"
}

build_icip_service() {
  build_and_push \
    "${REGISTRY}/essedum-icip-service:${TAG}" \
    "${REPO_ROOT}/sv" \
    "icip-service/Dockerfile_oauth2"
}

build_data_service() {
  build_and_push \
    "${REGISTRY}/essedum-data-service:${TAG}" \
    "${REPO_ROOT}/sv" \
    "data-service/Dockerfile_oauth2"
}

build_vibe_service() {
  build_and_push \
    "${REGISTRY}/essedum-vibe-service:${TAG}" \
    "${REPO_ROOT}/sv" \
    "vibe-service/Dockerfile_oauth2"
}

build_agent_designer() {
  build_and_push \
    "${REGISTRY}/essedum-frontend-agent-designer:${TAG}" \
    "${REPO_ROOT}/essedum-ui/agent-designer-frontend" \
    "Dockerfile"
}

build_frontend_shell() {
  build_and_push \
    "${REGISTRY}/essedum-frontend-shell:${TAG}" \
    "${REPO_ROOT}" \
    "essedum-ui/Dockerfile.shell"
}

build_frontend_agent() {
  build_and_push \
    "${REGISTRY}/essedum-frontend-agent:${TAG}" \
    "${REPO_ROOT}" \
    "essedum-ui/Dockerfile.agent"
}

build_frontend_data_ops() {
  build_and_push \
    "${REGISTRY}/essedum-frontend-data-ops:${TAG}" \
    "${REPO_ROOT}" \
    "essedum-ui/Dockerfile.data-ops"
}

build_frontend_integration() {
  build_and_push \
    "${REGISTRY}/essedum-frontend-integration:${TAG}" \
    "${REPO_ROOT}" \
    "essedum-ui/Dockerfile.integration"
}

build_frontend_vibe_studio() {
  build_and_push \
    "${REGISTRY}/essedum-frontend-vibe-studio:${TAG}" \
    "${REPO_ROOT}" \
    "essedum-ui/Dockerfile.vibe-studio"
}

build_agent_designer_backend() {
  build_and_push \
    "${REGISTRY}/agent-designer-backend:${TAG}" \
    "${REPO_ROOT}/agent-designer-backend" \
    "Dockerfile"
}

# ─── Entry point ─────────────────────────────────────────────────────────────
info "Registry : ${REGISTRY}"
info "Tag      : ${TAG}"
info "Target   : ${TARGET}"
echo ""

case "${TARGET}" in
  all)
    build_ui
    build_api_gateway
    build_usm_service
    build_icip_service
    build_data_service
    build_vibe_service
    build_agent_designer
    ;;
  frontend|ui)
    build_ui
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
  api-gateway)      build_api_gateway      ;;
  usm-service)      build_usm_service      ;;
  icip-service)     build_icip_service     ;;
  data-service)     build_data_service     ;;
  vibe-service)     build_vibe_service     ;;
  agent-designer)           build_agent_designer           ;;
  agent-designer-backend)   build_agent_designer_backend   ;;
  frontend-shell)           build_frontend_shell           ;;
  frontend-agent)       build_frontend_agent       ;;
  frontend-data-ops)    build_frontend_data_ops    ;;
  frontend-integration) build_frontend_integration ;;
  frontend-vibe-studio) build_frontend_vibe_studio ;;
  *)
    error "Unknown target '${TARGET}'. Valid: all | frontend | backend | api-gateway | usm-service | icip-service | data-service | vibe-service | agent-designer | frontend-shell | frontend-agent | frontend-data-ops | frontend-integration | frontend-vibe-studio"
    ;;
esac

echo ""
success "====== Build & Push Complete ======"
