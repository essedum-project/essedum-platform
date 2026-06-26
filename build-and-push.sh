#!/usr/bin/env bash
# =============================================================================
# Essedum Platform – Build & Push All Docker Images to ACR
# Usage:
#   ./build-and-push.sh          – build and push all images
#   ./build-and-push.sh <service> – build and push a single service
#     e.g. ./build-and-push.sh essedum-api-gateway
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ACR_REGISTRY="Your Registry Name Here"  # e.g. myregistry.azurecr.io
TAG="v18"

# ─── Colour helpers ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ─── Load NPM / Artifactory credentials from docker/.env.sample ─────────────
ENV_SAMPLE="${SCRIPT_DIR}/docker/.env.sample"
if [[ -f "${ENV_SAMPLE}" ]]; then
  NPM_REGISTRY_URL=$(grep -m1 '^NPM_REGISTRY_URL=' "${ENV_SAMPLE}" | cut -d= -f2-)
  NPM_AUTH_TOKEN=$(grep -m1 '^NPM_AUTH_TOKEN=' "${ENV_SAMPLE}" | cut -d= -f2-)
  ARTIFACTORY_REPO_USER=$(grep -m1 '^ARTIFACTORY_REPO_USER=' "${ENV_SAMPLE}" | cut -d= -f2-)
  ARTIFACTORY_REPO_PASS=$(grep -m1 '^ARTIFACTORY_REPO_PASS=' "${ENV_SAMPLE}" | cut -d= -f2-)
  export NPM_REGISTRY_URL NPM_AUTH_TOKEN ARTIFACTORY_REPO_USER ARTIFACTORY_REPO_PASS
  info "Loaded Artifactory credentials from ${ENV_SAMPLE}"
else
  warn ".env.sample not found — frontend npm install may fail without Artifactory auth"
fi

# Ensure Java 21 is used for Maven builds (needed by Spring Boot 3.3.x services)
export JAVA_HOME="/usr/lib/jvm/java-21-openjdk-amd64"
export PATH="${JAVA_HOME}/bin:${PATH}"
hash -r  # flush bash's PATH cache so javac resolves to JDK 21

# ─── ACR Login ───────────────────────────────────────────────────────────────
acr_login() {
  info "Logging in to ACR: ${ACR_REGISTRY}..."
  az acr login --name acrreq0762935 || error "ACR login failed. Ensure 'az' CLI is authenticated."
  success "ACR login successful."
}

# ─── Build and push a single image ───────────────────────────────────────────
# Usage: build_push <image-name> <build-context-dir> [dockerfile]
build_push() {
  local image_name="$1"
  local context_dir="$2"
  local dockerfile="${3:-${context_dir}/Dockerfile}"
  local full_image="${ACR_REGISTRY}/${image_name}:${TAG}"

  info "Building  → ${full_image}"
  docker build \
    --platform linux/amd64 \
    -t "${full_image}" \
    -f "${dockerfile}" \
    "${context_dir}"

  info "Pushing   → ${full_image}"
  docker push "${full_image}"
  success "Done      ✓ ${full_image}"
  echo ""
}

# ─── Build and push a frontend (Angular) image with Artifactory auth ─────────
# Usage: build_push_frontend <image-name> <dockerfile>
build_push_frontend() {
  local image_name="$1"
  local dockerfile="$2"
  local full_image="${ACR_REGISTRY}/${image_name}:${TAG}"

  info "Building  → ${full_image} (frontend)"
  docker build \
    --platform linux/amd64 \
    --no-cache \
    --build-arg "NPM_REGISTRY_URL=${NPM_REGISTRY_URL:-}" \
    --build-arg "NPM_AUTH_TOKEN=${NPM_AUTH_TOKEN:-}" \
    --build-arg "ARTIFACTORY_REPO_USER=${ARTIFACTORY_REPO_USER:-}" \
    --build-arg "ARTIFACTORY_REPO_PASS=${ARTIFACTORY_REPO_PASS:-}" \
    -t "${full_image}" \
    -f "${dockerfile}" \
    "${SCRIPT_DIR}"

  info "Pushing   → ${full_image}"
  docker push "${full_image}"
  success "Done      ✓ ${full_image}"
  echo ""
}

# ─── Build backend JAR on host then docker-package ───────────────────────────
# Usage: build_push_backend <maven-module> <image-name>
# Builds the JAR using host Maven (avoids Docker SSL issues in corporate envs)
build_push_backend() {
  local module="$1"
  local image_name="$2"
  local full_image="${ACR_REGISTRY}/${image_name}:${TAG}"
  local service_dir="${SCRIPT_DIR}/sv/${module}"

  info "Building JAR on host (Maven) for module: ${module}"
  (cd "${SCRIPT_DIR}/sv" && mvn clean install -pl "${module}" \
    -Dmaven.test.skip=true \
    -Dlicense.skip=true \
    -q) || { error "Maven build failed for ${module}. Check sv/${module}/pom.xml."; }

  info "Copying runtime dependencies for ${module}"
  (cd "${service_dir}" && mvn dependency:copy-dependencies \
    -DoutputDirectory=target/dependency \
    -Dmdep.prependGroupId=false \
    -DincludeScope=runtime \
    -q) || warn "dependency:copy-dependencies failed for ${module} – image will use fat-jar fallback."

  info "Building Docker image → ${full_image}"
  docker build \
    --platform linux/amd64 \
    -t "${full_image}" \
    "${service_dir}"

  info "Pushing   → ${full_image}"
  docker push "${full_image}"
  success "Done      ✓ ${full_image}"
  echo ""
}

# ─── Service definitions ─────────────────────────────────────────────────────
# Format: build_push <image-name> <build-context> [dockerfile]

build_all() {
  echo ""
  info "============================================================"
  info " Essedum Platform – Build & Push  (tag: ${TAG})"
  info " Registry: ${ACR_REGISTRY}"
  info "============================================================"
  echo ""

  # ── Backend microservices (build JAR on host, package in Docker) ─────────────
  info "--- Backend Microservices ---"
  build_push_backend "api-gateway"  "essedum-api-gateway"
  build_push_backend "usm-service"  "essedum-usm-service"
  build_push_backend "icip-service" "essedum-icip-service"
  build_push_backend "data-service" "essedum-data-service"
  build_push_backend "vibe-service" "essedum-vibe-service"

  # ── Frontend MFEs (build context = repo root) ────────────────────────────────
  info "--- Frontend MFEs ---"
  build_push_frontend "essedum-frontend-shell"        "${SCRIPT_DIR}/essedum-ui/Dockerfile.shell"
  build_push_frontend "essedum-frontend-agent"        "${SCRIPT_DIR}/essedum-ui/Dockerfile.agent"
  build_push_frontend "essedum-frontend-data-ops"     "${SCRIPT_DIR}/essedum-ui/Dockerfile.data-ops"
  build_push_frontend "essedum-frontend-integration"  "${SCRIPT_DIR}/essedum-ui/Dockerfile.integration"
  build_push_frontend "essedum-frontend-vibe-studio"  "${SCRIPT_DIR}/essedum-ui/Dockerfile.vibe-studio"

  # ── Supporting services ──────────────────────────────────────────────────────
  info "--- Supporting Services ---"
  build_push "pyjob-excecutor"           "${SCRIPT_DIR}/py-job-executer"
  build_push "proxy-service"             "${SCRIPT_DIR}/proxy-service"
  build_push "goosed"                    "${SCRIPT_DIR}/agent-designer-backend"
  build_push "goose-ui"                  "/home/useradmin/goose-vibe-studio-agent/essedum-agents/goose-vibe-studio-agent" "/home/useradmin/goose-vibe-studio-agent/essedum-agents/goose-vibe-studio-agent/Dockerfile.streamlit"
  build_push "builder-service"           "${SCRIPT_DIR}/adk-code-builder-deployer"
  build_push "vibe-code-builder-service" "${SCRIPT_DIR}/vibe-code-builder-deployer"

  echo ""
  success "============================================================"
  success " All images built and pushed successfully!"
  success " Tag: ${TAG}  |  Registry: ${ACR_REGISTRY}"
  success "============================================================"
  echo ""
}

# ─── Single-service mode ─────────────────────────────────────────────────────
build_single() {
  local target="$1"
  case "${target}" in
    essedum-api-gateway)
      build_push_backend "api-gateway"  "essedum-api-gateway" ;;
    essedum-usm-service)
      build_push_backend "usm-service"  "essedum-usm-service" ;;
    essedum-icip-service)
      build_push_backend "icip-service" "essedum-icip-service" ;;
    essedum-data-service)
      build_push_backend "data-service" "essedum-data-service" ;;
    essedum-vibe-service)
      build_push_backend "vibe-service" "essedum-vibe-service" ;;
    essedum-frontend-shell)
      build_push_frontend "essedum-frontend-shell"       "${SCRIPT_DIR}/essedum-ui/Dockerfile.shell" ;;
    essedum-frontend-agent)
      build_push_frontend "essedum-frontend-agent"       "${SCRIPT_DIR}/essedum-ui/Dockerfile.agent" ;;
    essedum-frontend-data-ops)
      build_push_frontend "essedum-frontend-data-ops"    "${SCRIPT_DIR}/essedum-ui/Dockerfile.data-ops" ;;
    essedum-frontend-integration)
      build_push_frontend "essedum-frontend-integration" "${SCRIPT_DIR}/essedum-ui/Dockerfile.integration" ;;
    essedum-frontend-vibe-studio)
      build_push_frontend "essedum-frontend-vibe-studio" "${SCRIPT_DIR}/essedum-ui/Dockerfile.vibe-studio" ;;
    pyjob-excecutor)
      build_push "pyjob-excecutor" "${SCRIPT_DIR}/py-job-executer" ;;
    proxy-service)
      build_push "proxy-service"   "${SCRIPT_DIR}/proxy-service" ;;
    goosed)
      build_push "goosed"          "${SCRIPT_DIR}/agent-designer-backend" ;;
    goose-ui)
      build_push "goose-ui" "/home/useradmin/goose-vibe-studio-agent/essedum-agents/goose-vibe-studio-agent" "/home/useradmin/goose-vibe-studio-agent/essedum-agents/goose-vibe-studio-agent/Dockerfile.streamlit" ;;
    builder-service)
      build_push "builder-service" "${SCRIPT_DIR}/adk-code-builder-deployer" ;;
    vibe-code-builder-service)
      build_push "vibe-code-builder-service" "${SCRIPT_DIR}/vibe-code-builder-deployer" ;;
    *)
      error "Unknown service '${target}'. Valid names: essedum-api-gateway, essedum-usm-service, essedum-icip-service, essedum-data-service, essedum-vibe-service, essedum-frontend-shell, essedum-frontend-agent, essedum-frontend-data-ops, essedum-frontend-integration, essedum-frontend-vibe-studio, pyjob-excecutor, proxy-service, goosed, goose-ui, builder-service, vibe-code-builder-service" ;;
  esac
}

# ─── Entrypoint ──────────────────────────────────────────────────────────────
acr_login

if [[ $# -eq 0 ]]; then
  build_all
else
  info "Single-service mode: ${1}"
  build_single "$1"
fi
