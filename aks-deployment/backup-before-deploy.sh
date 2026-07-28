#!/usr/bin/env bash
# Non-destructive backup helper for manual LFN deployments.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKUP_ROOT="${SCRIPT_DIR}/backups"

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

capture_secrets() {
  local out_dir="$1"
  kubectl get secrets -n "${KUBE_NAMESPACE}" -o yaml > "${out_dir}/secrets.yaml"
  success "Captured namespace secrets spec."
}

capture_pvc_specs() {
  local out_dir="$1"
  kubectl get pvc -n "${KUBE_NAMESPACE}" -o yaml > "${out_dir}/pvc.yaml" || true
  success "Captured PVC specs (if present)."
}

backup_mysql_dump() {
  local out_dir="$1"
  local mysql_pod
  mysql_pod="$(kubectl get pod -n "${KUBE_NAMESPACE}" -l app=mysql -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)"

  if [[ -z "${mysql_pod}" ]]; then
    warn "MySQL pod not found; skipping SQL dump."
    return 0
  fi

  if [[ -z "${MYSQL_USER:-}" || -z "${MYSQL_PASSWORD:-}" ]]; then
    warn "MYSQL_USER or MYSQL_PASSWORD not set; skipping SQL dump."
    return 0
  fi

  info "Creating MySQL dump from pod: ${mysql_pod}"
  kubectl exec -n "${KUBE_NAMESPACE}" "${mysql_pod}" -- \
    mysqldump -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" --all-databases \
    > "${out_dir}/mysql.sql"
  success "MySQL dump captured."
}

main() {
  load_env
  local ts
  ts="$(date +%Y%m%d-%H%M%S)"
  local out_dir="${BACKUP_ROOT}/${KUBE_NAMESPACE}-${ts}"

  mkdir -p "${out_dir}"
  info "Writing backup artifacts to: ${out_dir}"

  capture_secrets "${out_dir}"
  capture_pvc_specs "${out_dir}"
  backup_mysql_dump "${out_dir}"

  success "Backup workflow complete."
}

main "$@"
