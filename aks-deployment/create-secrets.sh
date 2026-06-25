#!/usr/bin/env bash
# =============================================================================
# Essedum Platform – Create / Update All Kubernetes Secrets
# Usage:
#   ./create-secrets.sh            – loads values from ../.env (or ../docker/.env)
#   ./create-secrets.sh /path/.env – loads values from a custom .env file
#
# This script is idempotent: it uses --dry-run=client | kubectl apply -f -
# so it is safe to re-run after updating secret values.
# =============================================================================

set -euo pipefail

NAMESPACE="aipns"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ─── Colour helpers ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ─── Load .env file ──────────────────────────────────────────────────────────
ENV_FILE="${1:-}"
if [[ -z "${ENV_FILE}" ]]; then
  # Look for .env in docker/ or repo root
  if [[ -f "${SCRIPT_DIR}/../docker/.env" ]]; then
    ENV_FILE="${SCRIPT_DIR}/../docker/.env"
  elif [[ -f "${SCRIPT_DIR}/../.env" ]]; then
    ENV_FILE="${SCRIPT_DIR}/../.env"
  else
    error "No .env file found. Copy docker/.env.sample to docker/.env and fill in values, then re-run."
  fi
fi

info "Loading environment from: ${ENV_FILE}"
# shellcheck disable=SC1090
set -o allexport
source "${ENV_FILE}"
set +o allexport

# ─── Ensure namespace exists ─────────────────────────────────────────────────
kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -
success "Namespace '${NAMESPACE}' ready."

# ─── Helper: create/update a generic secret (idempotent) ────────────────────
apply_secret() {
  local name="$1"
  shift
  info "Applying secret: ${name}"
  kubectl create secret generic "${name}" \
    --namespace="${NAMESPACE}" \
    "$@" \
    --dry-run=client -o yaml | kubectl apply -f -
  success "Secret '${name}' applied."
}

# ─── 1. MinIO secret ─────────────────────────────────────────────────────────
apply_secret "essedum-minio-secret" \
  --from-literal=endpoint="${MINIO_ENDPOINT:-http://minio-service:9000}" \
  --from-literal=access-key="${MINIO_ROOT_USER:?MINIO_ROOT_USER is required}" \
  --from-literal=secret-key="${MINIO_ROOT_PASSWORD:?MINIO_ROOT_PASSWORD is required}"

# ─── 2. Database secret ──────────────────────────────────────────────────────
apply_secret "essedum-db-secret" \
  --from-literal=MYSQL_DATASOURCE_URL="${MYSQL_DATASOURCE_URL:?MYSQL_DATASOURCE_URL is required}" \
  --from-literal=MYSQL_USER="${MYSQL_USER:-root}" \
  --from-literal=MYSQL_PASSWORD="${MYSQL_ROOT_PASSWORD:?MYSQL_ROOT_PASSWORD is required}"

# ─── 3. Keycloak secret ──────────────────────────────────────────────────────
apply_secret "keycloak-secret" \
  --from-literal=KEYCLOAK_ADMIN="${KEYCLOAK_ADMIN_USER:?KEYCLOAK_ADMIN_USER is required}" \
  --from-literal=KEYCLOAK_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:?KEYCLOAK_ADMIN_PASSWORD is required}" \
  --from-literal=KC_DB_USERNAME="${KC_DB_USERNAME:-root}" \
  --from-literal=KC_DB_PASSWORD="${KC_DB_PASSWORD:-${MYSQL_ROOT_PASSWORD}}"

# ─── 4. Goose secret ─────────────────────────────────────────────────────────
apply_secret "goose-secret" \
  --from-literal=secret-key="${VIBE_GOOSE_SERVICE_SECRET_KEY:?VIBE_GOOSE_SERVICE_SECRET_KEY is required}"

# ─── 5. Vibe service secret (Azure OpenAI) ───────────────────────────────────
apply_secret "essedum-vibe-secret" \
  --from-literal=VIBE_AZURE_OPENAI_ENDPOINT="${VIBE_AZURE_OPENAI_ENDPOINT:-}" \
  --from-literal=VIBE_AZURE_OPENAI_DEPLOYMENT_NAME="${VIBE_AZURE_OPENAI_DEPLOYMENT_NAME:-}" \
  --from-literal=VIBE_AZURE_OPENAI_API_VERSION="${VIBE_AZURE_OPENAI_API_VERSION:-}" \
  --from-literal=VIBE_AZURE_OPENAI_API_KEY="${VIBE_AZURE_OPENAI_API_KEY:-}"

# ─── 6. Vibe code builder secret ─────────────────────────────────────────────
apply_secret "vibe-code-builder-secret" \
  --from-literal=REGISTRY_URL="${REGISTRY_URL:-acrreq0762935.azurecr.io}" \
  --from-literal=ACR_NAME="${ACR_NAME:-acrreq0762935}" \
  --from-literal=AZURE_CLIENT_ID="${AZURE_CLIENT_ID:-}" \
  --from-literal=AZURE_CLIENT_SECRET="${AZURE_CLIENT_SECRET:-}" \
  --from-literal=AZURE_TENANT_ID="${AZURE_TENANT_ID:-}"

echo ""
success "======================================================"
success " All secrets applied to namespace '${NAMESPACE}'"
success "======================================================"
echo ""
info "To verify: kubectl get secrets -n ${NAMESPACE}"
