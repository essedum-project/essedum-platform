#!/usr/bin/env bash
# Manual pre-flight checks for LFN MicroK8s deployment.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

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

  [[ -z "${env_file}" ]] && error "No .env found. Copy docker/.env.sample to docker/.env first."

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

check_cmds() {
  command -v kubectl >/dev/null 2>&1 || error "kubectl is required."
  command -v envsubst >/dev/null 2>&1 || error "envsubst is required. Install gettext-base."
  command -v microk8s >/dev/null 2>&1 || warn "microk8s command not found; continuing with kubectl checks."
  success "Tooling checks passed."
}

check_context() {
  [[ -n "${KUBE_CONTEXT:-}" ]] || error "KUBE_CONTEXT is not set."
  kubectl config use-context "${KUBE_CONTEXT}" >/dev/null
  local current
  current="$(kubectl config current-context)"
  [[ "${current}" == "${KUBE_CONTEXT}" ]] || error "Current context '${current}' does not match KUBE_CONTEXT '${KUBE_CONTEXT}'."
  success "Context lock verified: ${current}"
}

check_cluster() {
  kubectl cluster-info >/dev/null 2>&1 || error "Cluster is not reachable."
  kubectl get nodes >/dev/null 2>&1 || error "Unable to list cluster nodes."
  success "Cluster connectivity verified."
}

check_registry() {
  [[ -n "${DOCKER_REGISTRY:-}" ]] || error "DOCKER_REGISTRY is not set."
  if curl -fsS "http://${DOCKER_REGISTRY}/v2/_catalog" >/dev/null 2>&1; then
    success "Registry endpoint reachable: ${DOCKER_REGISTRY}"
  else
    warn "Registry catalog check failed. Verify network/auth if registry requires credentials."
  fi
}

check_tls_secret() {
  local tls_secret="${TLS_SECRET_NAME:-essedum-secret}"
  if kubectl get secret "${tls_secret}" -n "${KUBE_NAMESPACE}" >/dev/null 2>&1; then
    success "TLS secret exists: ${tls_secret}"
  else
    error "Required TLS secret missing: ${tls_secret} (expected existing secret)."
  fi
}

check_ingress_host() {
  [[ -n "${INGRESS_HOST:-}" ]] || error "INGRESS_HOST is not set."
  if getent hosts "${INGRESS_HOST}" >/dev/null 2>&1; then
    success "Ingress host resolves: ${INGRESS_HOST}"
  else
    warn "Ingress host does not resolve from this node: ${INGRESS_HOST}"
  fi
}

main() {
  info "Starting LFN MicroK8s pre-flight checks"
  load_env
  check_cmds
  check_context
  check_cluster
  check_registry
  check_ingress_host
  check_tls_secret
  success "Pre-flight checks completed."
}

main "$@"
