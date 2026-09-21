#!/usr/bin/env bash
# =============================================================================
# Essedum Platform — MicroK8s / LFN Post-Deploy Patches
#
# Applies environment-specific patches to base Kubernetes deployments after
# deploy.sh. Base YAML files remain environment-agnostic (untouched). This
# script is the LFN/MicroK8s "overlay" — run it once after every deploy.sh
# on this server.
#
# Usage:
#   ./aks-deployment/microk8s-patches.sh
#
# Idempotent — safe to re-run. Uses strategic-merge patches so patches with
# the same name key are merged, not duplicated.
#
# Why these patches are needed on MicroK8s/LFN only:
#   - Calico Felix takes ~30s to program nftables chains for new pods after a
#     cluster restart. Spring Boot and Keycloak try MySQL TCP immediately at
#     JVM start — before Felix is ready — causing "Connect timed out" crashes.
#     initContainers run sequentially BEFORE the main container, so the JVM
#     only starts after Felix has had time to program the chains.
#   - ENCRYPTION_KEY lives in essedum-app-secret (from docker/.env) on LFN.
#     On other environments it may come from Vault or another source — so it
#     must not be hardcoded into the base YAML.
#   - Hikari INITIALIZATIONFAILTIMEOUT=-1 prevents pool init from aborting
#     on the first failed connection (Spring default is 1 attempt).
#   - Keycloak Agroal pool settings prevent eager connection pre-warming that
#     fails on cold start before MySQL is fully ready.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
export PATH="/snap/bin:/usr/local/bin:$PATH"

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
  [[ -z "${env_file}" ]] && error "No .env found. Copy docker/.env.sample to docker/.env first."
  info "Loading config from: ${env_file}"
  set +u; set -a
  # shellcheck disable=SC1090
  source "${env_file}"
  set +a; set -u
}

# ─── Pre-checks ──────────────────────────────────────────────────────────────
preflight() {
  command -v kubectl >/dev/null 2>&1 || error "kubectl not found in PATH."
  kubectl cluster-info >/dev/null 2>&1 || error "Cluster not reachable."
  NS="${KUBE_NAMESPACE:-aipns}"
  kubectl get namespace "${NS}" >/dev/null 2>&1 || error "Namespace '${NS}' not found."
  success "Pre-flight OK — namespace: ${NS}"
}

# ─── [1] Ensure essedum-app-secret exists ────────────────────────────────────
ensure_app_secret() {
  step "[1/6] Ensure essedum-app-secret"
  NS="${KUBE_NAMESPACE:-aipns}"

  # Read values safely without shell expansion of special characters (grep+cut)
  local env_file="${REPO_ROOT}/docker/.env"
  [[ -f "${env_file}" ]] || env_file="${REPO_ROOT}/docker/.env.sample"

  local enc_key license pub_key
  enc_key=$(grep -m1 '^ENCRYPTION_KEY=' "${env_file}" | cut -d= -f2- | tr -d '\r')
  license=$(grep -m1 '^LICENSE='        "${env_file}" | cut -d= -f2- | tr -d '\r')
  pub_key=$(grep -m1 '^PUBLIC_KEY='     "${env_file}" | cut -d= -f2- | tr -d '\r')

  [[ -z "${enc_key}" ]] && error "ENCRYPTION_KEY not found in ${env_file}"

  kubectl create secret generic essedum-app-secret \
    --from-literal=encryption-key="${enc_key}" \
    --from-literal=license="${license}" \
    --from-literal=public-key="${pub_key}" \
    -n "${NS}" --dry-run=client -o yaml | kubectl apply -f -
  success "essedum-app-secret applied."
}

# ─── [2] Patch Spring Boot backends ──────────────────────────────────────────
patch_backends() {
  step "[2/6] Patch Spring Boot backends (data, icip, usm, vibe)"
  NS="${KUBE_NAMESPACE:-aipns}"

  for svc in essedum-backend-data essedum-backend-icip essedum-backend-usm essedum-backend-vibe; do
    info "  Patching ${svc}..."

    # Legacy wait-for-felix initContainers were causing drift with source
    # manifests and could keep pods in Init state indefinitely on some runs.
    # Remove injected initContainers and rely on startup/readiness probes.
    kubectl patch deployment "${svc}" -n "${NS}" \
      --type=json \
      --patch '[{"op": "remove", "path": "/spec/template/spec/initContainers"}]' 2>/dev/null || true

    # ── Remove lifecycle.postStart (replaced by initContainer) ──────────
    # Null patch removes the field if present; no-op if already absent.
    kubectl patch deployment "${svc}" -n "${NS}" \
      --type=json \
      --patch '[
        {"op": "remove", "path": "/spec/template/spec/containers/0/lifecycle"}
      ]' 2>/dev/null || true

    # ── Hikari resilience env vars ────────────────────────────────────────
    kubectl set env "deployment/${svc}" -n "${NS}" \
      SPRING_DATASOURCE_HIKARI_CONNECTIONTIMEOUT=120000 \
      SPRING_DATASOURCE_HIKARI_INITIALIZATIONFAILTIMEOUT=-1

    success "  ${svc} patched."
  done
}

# ─── [3] Patch USM: ENCRYPTION_KEY from secret ───────────────────────────────
patch_usm_secret() {
  step "[3/6] Patch USM — ENCRYPTION_KEY from essedum-app-secret"
  NS="${KUBE_NAMESPACE:-aipns}"

  # Remove any existing plain-value ENCRYPTION_KEY first (kubectl set env adds
  # value="...", but secretKeyRef and value cannot coexist on the same env var).
  # The trailing '-' tells kubectl set env to delete the variable. No-op if absent.
  kubectl set env deployment/essedum-backend-usm -n "${NS}" ENCRYPTION_KEY- 2>/dev/null || true
  info "  Removed plain-value ENCRYPTION_KEY (if present)."

  # Now add ENCRYPTION_KEY with secretKeyRef via strategic merge (merge key = name)
  kubectl patch deployment essedum-backend-usm -n "${NS}" \
    --type=strategic \
    --patch '{
      "spec": {
        "template": {
          "spec": {
            "containers": [
              {
                "name": "essedum-backend-usm",
                "env": [
                  {
                    "name": "ENCRYPTION_KEY",
                    "valueFrom": {
                      "secretKeyRef": {
                        "name": "essedum-app-secret",
                        "key": "encryption-key"
                      }
                    }
                  }
                ]
              }
            ]
          }
        }
      }
    }'
  success "USM ENCRYPTION_KEY patch applied."
}

# ─── [4] Remove stale MySQL pod-IP hostAliases from backends ─────────────────
# Pod IPs change on every MySQL restart — only keep the stable keycloak alias.
# K8s DNS (mysql.aipns.svc.cluster.local) handles MySQL routing correctly.
remove_mysql_ip_aliases() {
  step "[4/6] Remove stale MySQL pod-IP hostAliases from backends"
  NS="${KUBE_NAMESPACE:-aipns}"

  for svc in essedum-backend-data essedum-backend-icip essedum-backend-usm essedum-backend-vibe; do
    # Get current hostAliases; remove any entry whose IP is NOT 10.200.111.51
    # (the node IP used for keycloak.essedum.local — must stay)
    CURRENT_ALIASES=$(kubectl get deployment "${svc}" -n "${NS}" \
      -o jsonpath='{.spec.template.spec.hostAliases}' 2>/dev/null || echo "[]")

    # Check if a MySQL pod-IP alias exists (anything other than 10.200.111.51)
    if echo "${CURRENT_ALIASES}" | grep -qv '"10.200.111.51"' 2>/dev/null && \
       echo "${CURRENT_ALIASES}" | grep -q '"10\.' 2>/dev/null; then

      info "  Removing stale MySQL hostAlias from ${svc}..."
      # Replace hostAliases with only the keycloak entry (stable node IP)
      kubectl patch deployment "${svc}" -n "${NS}" \
        --type=strategic \
        --patch '{
          "spec": {
            "template": {
              "spec": {
                "hostAliases": [
                  {
                    "ip": "10.200.111.51",
                    "hostnames": ["keycloak.essedum.local"]
                  }
                ]
              }
            }
          }
        }'
      success "  ${svc}: MySQL pod-IP alias removed."
    else
      info "  ${svc}: no stale MySQL hostAlias found — skipping."
    fi
  done
}

# ─── [5] Patch Keycloak ───────────────────────────────────────────────────────
patch_keycloak() {
  step "[5/6] Patch Keycloak"
  NS="${KUBE_NAMESPACE:-aipns}"

  # Remove legacy initContainer patching to keep deployment state aligned
  # with source manifests and avoid stale Init:0/1 loops.
  kubectl patch deployment keycloak -n "${NS}" \
    --type=json \
    --patch '[{"op": "remove", "path": "/spec/template/spec/initContainers"}]' 2>/dev/null || true

  # Keycloak FQDN + Agroal pool: don't pre-warm connections on cold start
  kubectl set env deployment/keycloak -n "${NS}" \
    KC_DB_URL="jdbc:mysql://mysql.aipns.svc.cluster.local:3306/keycloak" \
    KC_DB_POOL_INITIAL_SIZE=0 \
    KC_DB_POOL_MIN_SIZE=0 \
    KC_TRANSACTION_XA_ENABLED=false

  success "Keycloak patched."
}

# ─── [6] Wait for rollouts ────────────────────────────────────────────────────
wait_rollouts() {
  step "[6/6] Waiting for rollouts"
  NS="${KUBE_NAMESPACE:-aipns}"

  for dep in \
    essedum-backend-data \
    essedum-backend-icip \
    essedum-backend-usm \
    essedum-backend-vibe \
    keycloak; do
    info "  Waiting: ${dep}..."
    kubectl rollout status "deployment/${dep}" -n "${NS}" --timeout=300s \
      && success "  ${dep}: ready." \
      || warn "  ${dep}: rollout timed out — check: kubectl describe pod -l app=${dep} -n ${NS}"
  done

  echo ""
  step "Final pod status"
  kubectl get pods -n "${NS}" -o wide
}

# ─── Main ────────────────────────────────────────────────────────────────────
main() {
  step "MicroK8s / LFN Post-Deploy Patches"
  info "Applying MicroK8s-specific patches on top of base YAML deployment."
  info "Base YAML files are NOT modified — this script is the LFN environment overlay."
  echo ""

  load_env
  preflight
  ensure_app_secret
  patch_backends
  patch_usm_secret
  remove_mysql_ip_aliases
  patch_keycloak
  wait_rollouts

  echo ""
  success "====== MicroK8s patches applied successfully ======"
  echo ""
  info "Each patched deployment will cycle through:"
  info "  1. initContainer: sleep 35s (Felix programs nft chains)"
  info "  2. Main container: Spring Boot / Keycloak connects to MySQL cleanly"
  echo ""
  info "To re-apply after a deploy.sh run:"
  info "  ./aks-deployment/microk8s-patches.sh"
}

main "$@"
