#!/usr/bin/env bash
# =============================================================================
#  Essedum Platform — One-Touch Kubernetes Deployment Script
#  Usage:
#    ./deploy.sh              # full deploy (default)
#    ./deploy.sh deploy       # full deploy
#    ./deploy.sh teardown     # delete all essedum resources (keeps PVs by default)
#    ./deploy.sh teardown --purge-volumes   # also delete PVs/PVCs
#    ./deploy.sh status       # show pod/service/ingress status
#    ./deploy.sh restart <svc># rollout restart a single deployment, e.g. backend
# =============================================================================
set -euo pipefail

# ── Resolve script directory ──────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Configuration ─────────────────────────────────────────────────────────────
NAMESPACE="essedum"
NODE_NAME="essedum-1"
NODE_IP="10.200.111.51"
INGRESS_HTTP_PORT="30080"
INGRESS_HTTPS_PORT="30443"
KUBECTL="${KUBECTL:-kubectl}"

# Timeout values (seconds)
TIMEOUT_INFRA=180       # databases, caches
TIMEOUT_APP=120         # application services
TIMEOUT_JOB=120         # one-off jobs

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ── Helpers ───────────────────────────────────────────────────────────────────
log()     { echo -e "${CYAN}[$(date '+%H:%M:%S')]${RESET} $*"; }
success() { echo -e "${GREEN}[$(date '+%H:%M:%S')] ✔  $*${RESET}"; }
warn()    { echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠  $*${RESET}"; }
error()   { echo -e "${RED}[$(date '+%H:%M:%S')] ✘  $*${RESET}" >&2; }
section() { echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════${RESET}"; \
            echo -e "${BOLD}${CYAN}  $*${RESET}"; \
            echo -e "${BOLD}${CYAN}══════════════════════════════════════════${RESET}"; }

apply() {
  local path="$1"
  log "Applying $(basename "$path") ..."
  $KUBECTL apply -f "$path"
}

apply_dir() {
  local dir="$1"
  log "Applying all manifests in $(basename "$dir")/ ..."
  $KUBECTL apply -f "$dir/"
}

wait_deploy() {
  local name="$1"
  local timeout="${2:-$TIMEOUT_APP}"
  log "Waiting for deployment/${name} to be ready (timeout ${timeout}s) ..."
  if $KUBECTL rollout status deployment/"$name" -n "$NAMESPACE" --timeout="${timeout}s"; then
    success "deployment/${name} is ready"
  else
    error "deployment/${name} did not become ready within ${timeout}s"
    $KUBECTL get pods -n "$NAMESPACE" -l "app=$name" --no-headers
    exit 1
  fi
}

wait_job() {
  local name="$1"
  local timeout="${2:-$TIMEOUT_JOB}"
  log "Waiting for job/${name} to complete (timeout ${timeout}s) ..."
  if $KUBECTL wait --for=condition=complete job/"$name" -n "$NAMESPACE" --timeout="${timeout}s"; then
    success "job/${name} completed"
  else
    warn "job/${name} did not complete within ${timeout}s — continuing anyway"
    $KUBECTL logs -n "$NAMESPACE" -l "app=$name" --tail=20 2>/dev/null || true
  fi
}

# ── Preflight checks ──────────────────────────────────────────────────────────
preflight() {
  section "Preflight Checks"

  # kubectl available
  if ! command -v $KUBECTL &>/dev/null; then
    error "kubectl not found. Install kubectl and ensure it is in PATH."
    exit 1
  fi
  success "kubectl found: $($KUBECTL version --client --short 2>/dev/null || $KUBECTL version --client)"

  # cluster reachable
  if ! $KUBECTL cluster-info --request-timeout=10s &>/dev/null; then
    error "Cannot reach Kubernetes cluster. Check your KUBECONFIG."
    exit 1
  fi
  success "Cluster is reachable"

  # target node exists
  if ! $KUBECTL get node "$NODE_NAME" &>/dev/null; then
    warn "Node '${NODE_NAME}' not found in the cluster — pods will fail to schedule."
  else
    local node_status
    node_status=$($KUBECTL get node "$NODE_NAME" -o jsonpath='{.status.conditions[-1].type}' 2>/dev/null)
    if [[ "$node_status" == "Ready" ]]; then
      success "Node ${NODE_NAME} is Ready"
    else
      warn "Node ${NODE_NAME} status: ${node_status}"
    fi
  fi

  # secret.yaml sanity — warn if placeholder values remain
  local secret_file="$SCRIPT_DIR/secret.yaml"
  if grep -q 'change-this\|your-.*-here\|sk-1234\b' "$secret_file" 2>/dev/null; then
    warn "secret.yaml still contains placeholder values — update before production use."
  fi

  success "Preflight complete"
}

# ── Create host-path directories on essedum-1 (via kubectl debug or manual) ──
create_host_dirs() {
  section "Ensuring Host-Path Directories on ${NODE_NAME}"

  local dirs=(
    /data/essedum/mysql
    /data/essedum/qdrant
    /data/essedum/minio
    /data/essedum/langfuse-minio
    /data/essedum/langflow
    /data/essedum/langflow-postgres
    /data/essedum/langfuse-postgres
    /data/essedum/litellm-postgres
    /data/essedum/litellm/config
    /data/essedum/litellm/data
    /data/essedum/clickhouse/data
    /data/essedum/clickhouse/logs
    /data/essedum/ollama
  )

  # Try to create directories via a privileged pod on the target node
  local dir_list
  dir_list=$(printf "mkdir -p %s && " "${dirs[@]}")
  dir_list="${dir_list%% && }"   # trim trailing &&

  if $KUBECTL run essedum-dir-init \
      --image=busybox:1.36 \
      --restart=Never \
      --rm \
      --attach \
      --overrides="{
        \"spec\": {
          \"nodeSelector\": { \"kubernetes.io/hostname\": \"${NODE_NAME}\" },
          \"tolerations\": [{\"operator\": \"Exists\"}],
          \"hostPID\": true,
          \"containers\": [{
            \"name\": \"init\",
            \"image\": \"busybox:1.36\",
            \"command\": [\"sh\",\"-c\",\"${dir_list}\"],
            \"volumeMounts\": [{\"name\":\"host-root\",\"mountPath\":\"/data\"}],
            \"securityContext\": {\"privileged\": true}
          }],
          \"volumes\": [{\"name\":\"host-root\",\"hostPath\":{\"path\":\"/data\",\"type\":\"DirectoryOrCreate\"}}]
        }
      }" \
      -n "$NAMESPACE" --timeout=60s 2>/dev/null; then
    success "Host directories created on ${NODE_NAME}"
  else
    warn "Could not auto-create host dirs. Run manually on ${NODE_NAME}:"
    for d in "${dirs[@]}"; do
      echo "    sudo mkdir -p $d"
    done
  fi
}

# ═════════════════════════════════════════════════════════════════════════════
#  DEPLOY
# ═════════════════════════════════════════════════════════════════════════════
cmd_deploy() {
  preflight

  # ── Step 1: Ingress Controller (cluster-scoped) ──────────────────────────
  section "Step 1/10 — Ingress Controller"
  apply "$SCRIPT_DIR/ingress-controller.yaml"
  log "Waiting for ingress-nginx controller to be ready ..."
  $KUBECTL rollout status deployment/ingress-nginx-controller \
    -n ingress-nginx --timeout=120s || warn "Ingress controller not ready yet — continuing"

  # ── Step 2: Namespace ──────────────────────────────────────────────────────
  section "Step 2/10 — Namespace"
  apply "$SCRIPT_DIR/namespace.yaml"
  success "Namespace '${NAMESPACE}' ensured"

  # ── Step 3: ConfigMap & Secret ────────────────────────────────────────────
  section "Step 3/10 — ConfigMap & Secret"
  apply "$SCRIPT_DIR/configmap.yaml"
  apply "$SCRIPT_DIR/secret.yaml"
  apply "$SCRIPT_DIR/clickhouse/configmap.yaml"
  success "Config resources applied"

  # ── Step 4: Persistent Volumes ────────────────────────────────────────────
  section "Step 4/10 — Persistent Volumes & Claims"
  apply_dir "$SCRIPT_DIR/volumes"
  success "Persistent volumes applied"

  # ── Step 5: Host directories ──────────────────────────────────────────────
  create_host_dirs

  # ── Step 6: Infrastructure (DBs, caches, object storage) ─────────────────
  section "Step 6/10 — Infrastructure Services"

  log "→ MySQL"
  apply_dir "$SCRIPT_DIR/mysql"
  wait_deploy mysql $TIMEOUT_INFRA

  log "→ Qdrant"
  apply_dir "$SCRIPT_DIR/qdrant"
  wait_deploy qdrant $TIMEOUT_INFRA

  log "→ Keycloak"
  apply_dir "$SCRIPT_DIR/keycloak"
  wait_deploy keycloak $TIMEOUT_INFRA

  log "→ Redis"
  apply_dir "$SCRIPT_DIR/redis"
  wait_deploy redis $TIMEOUT_INFRA

  log "→ ClickHouse"
  apply_dir "$SCRIPT_DIR/clickhouse"
  wait_deploy clickhouse $TIMEOUT_INFRA

  log "→ MinIO (platform)"
  apply_dir "$SCRIPT_DIR/minio"
  wait_deploy minio $TIMEOUT_INFRA

  log "→ MinIO (langfuse)"
  apply_dir "$SCRIPT_DIR/langfuse-minio"
  wait_deploy langfuse-minio $TIMEOUT_INFRA

  log "→ Ollama"
  apply_dir "$SCRIPT_DIR/ollama"
  # Ollama pulls large models — don't block on it
  $KUBECTL rollout status deployment/ollama -n "$NAMESPACE" --timeout=60s \
    || warn "Ollama pod is starting — model downloads may take several minutes"

  success "Infrastructure services deployed"

  # ── Step 7: Database tiers ───────────────────────────────────────────────
  section "Step 7/10 — Database Tiers"

  log "→ LiteLLM PostgreSQL"
  apply_dir "$SCRIPT_DIR/litellm-postgres"
  wait_deploy litellm-postgres $TIMEOUT_INFRA

  log "→ Langflow PostgreSQL"
  apply_dir "$SCRIPT_DIR/langflow-postgres"
  wait_deploy langflow-postgres $TIMEOUT_INFRA

  log "→ Langfuse PostgreSQL"
  apply_dir "$SCRIPT_DIR/langfuse-postgres"
  wait_deploy langfuse-postgres $TIMEOUT_INFRA

  success "Database tiers ready"

  # ── Step 8: One-time setup jobs ───────────────────────────────────────────
  section "Step 8/10 — Setup Jobs"

  # Delete stale minio-setup job if it exists (Jobs are immutable)
  if $KUBECTL get job minio-setup -n "$NAMESPACE" &>/dev/null; then
    log "Deleting existing minio-setup job ..."
    $KUBECTL delete job minio-setup -n "$NAMESPACE" --ignore-not-found
    sleep 3
  fi
  apply "$SCRIPT_DIR/minio-setup/job.yaml"
  wait_job minio-setup $TIMEOUT_JOB

  # ── Step 9: Application services ─────────────────────────────────────────
  section "Step 9/10 — Application Services"

  log "→ BuildKit daemon"
  apply_dir "$SCRIPT_DIR/buildkitd"
  wait_deploy buildkitd

  log "→ LiteLLM"
  apply_dir "$SCRIPT_DIR/litellm"
  wait_deploy litellm

  log "→ Langflow"
  apply_dir "$SCRIPT_DIR/langflow"
  wait_deploy langflow

  log "→ Langfuse Worker"
  apply_dir "$SCRIPT_DIR/langfuse-worker"
  wait_deploy langfuse-worker

  log "→ Langfuse Web"
  apply_dir "$SCRIPT_DIR/langfuse-web"
  wait_deploy langfuse-web

  log "→ ADK Code Builder/Deployer"
  apply_dir "$SCRIPT_DIR/adk-code-builder-deployer"
  wait_deploy adk-code-builder-deployer

  log "→ Proxy Service"
  apply_dir "$SCRIPT_DIR/proxy-service"
  wait_deploy proxy-service

  log "→ Python Job Executor"
  apply_dir "$SCRIPT_DIR/py-job-executor"
  wait_deploy py-job-executor

  log "→ Python Job SageMaker Executor"
  apply_dir "$SCRIPT_DIR/py-job-sagemaker-executer"
  wait_deploy py-job-sagemaker-executer

  log "→ Python Job Vertex Executor"
  apply_dir "$SCRIPT_DIR/py-job-vertex-executer"
  wait_deploy py-job-vertex-executer

  success "Application services deployed"

  # ── Step 10: Main application + Ingress ──────────────────────────────────
  section "Step 10/10 — Main Application & Ingress"

  log "→ Backend"
  apply_dir "$SCRIPT_DIR/backend"
  wait_deploy backend

  log "→ Frontend"
  apply_dir "$SCRIPT_DIR/frontend"
  wait_deploy frontend

  log "→ Ingress rules"
  apply "$SCRIPT_DIR/ingress.yaml"

  # ── Summary ───────────────────────────────────────────────────────────────
  section "Deployment Complete"
  success "All Essedum services are running in namespace '${NAMESPACE}'"
  echo ""
  echo -e "${BOLD}Add these entries to /etc/hosts (point to ${NODE_IP}):${RESET}"
  cat <<EOF
${NODE_IP}  essedum.local
${NODE_IP}  api.essedum.local
${NODE_IP}  keycloak.essedum.local
${NODE_IP}  langflow.essedum.local
${NODE_IP}  langfuse.essedum.local
${NODE_IP}  litellm.essedum.local
${NODE_IP}  minio.essedum.local
${NODE_IP}  minio-console.essedum.local
${NODE_IP}  ollama.essedum.local
${NODE_IP}  proxy.essedum.local
${NODE_IP}  adk.essedum.local
${NODE_IP}  qdrant.essedum.local
EOF
  echo ""
  echo -e "${BOLD}Service URLs (via Ingress NodePort):${RESET}"
  printf "  %-30s %s\n" "Frontend"       "http://essedum.local:${INGRESS_HTTP_PORT}"
  printf "  %-30s %s\n" "Backend API"    "http://api.essedum.local:${INGRESS_HTTP_PORT}"
  printf "  %-30s %s\n" "Keycloak"       "http://keycloak.essedum.local:${INGRESS_HTTP_PORT}"
  printf "  %-30s %s\n" "Langflow"       "http://langflow.essedum.local:${INGRESS_HTTP_PORT}"
  printf "  %-30s %s\n" "Langfuse"       "http://langfuse.essedum.local:${INGRESS_HTTP_PORT}"
  printf "  %-30s %s\n" "LiteLLM"        "http://litellm.essedum.local:${INGRESS_HTTP_PORT}"
  printf "  %-30s %s\n" "MinIO Console"  "http://minio-console.essedum.local:${INGRESS_HTTP_PORT}"
  printf "  %-30s %s\n" "Qdrant"         "http://qdrant.essedum.local:${INGRESS_HTTP_PORT}"
  echo ""

  cmd_status
}

# ═════════════════════════════════════════════════════════════════════════════
#  STATUS
# ═════════════════════════════════════════════════════════════════════════════
cmd_status() {
  section "Cluster Status  —  namespace: ${NAMESPACE}"

  echo -e "\n${BOLD}Pods:${RESET}"
  $KUBECTL get pods -n "$NAMESPACE" -o wide 2>/dev/null || true

  echo -e "\n${BOLD}Services:${RESET}"
  $KUBECTL get services -n "$NAMESPACE" 2>/dev/null || true

  echo -e "\n${BOLD}Ingress:${RESET}"
  $KUBECTL get ingress -n "$NAMESPACE" 2>/dev/null || true

  echo -e "\n${BOLD}PersistentVolumeClaims:${RESET}"
  $KUBECTL get pvc -n "$NAMESPACE" 2>/dev/null || true

  echo -e "\n${BOLD}Jobs:${RESET}"
  $KUBECTL get jobs -n "$NAMESPACE" 2>/dev/null || true

  echo -e "\n${BOLD}Ingress Controller:${RESET}"
  $KUBECTL get pods -n ingress-nginx 2>/dev/null || true
}

# ═════════════════════════════════════════════════════════════════════════════
#  TEARDOWN
# ═════════════════════════════════════════════════════════════════════════════
cmd_teardown() {
  local purge_volumes=false
  for arg in "$@"; do
    [[ "$arg" == "--purge-volumes" ]] && purge_volumes=true
  done

  section "Teardown — namespace: ${NAMESPACE}"

  warn "This will DELETE all Essedum resources."
  if [[ "$purge_volumes" == "true" ]]; then
    warn "  --purge-volumes  is set: PersistentVolumes/Claims will also be deleted."
  else
    warn "  PersistentVolumes/Claims will be KEPT (use --purge-volumes to remove)."
  fi
  echo -n "  Confirm? (yes/N): "
  read -r confirm
  if [[ "$confirm" != "yes" ]]; then
    log "Teardown cancelled."
    exit 0
  fi

  # Delete namespace (removes all namespaced resources)
  log "Deleting namespace '${NAMESPACE}' ..."
  $KUBECTL delete namespace "$NAMESPACE" --ignore-not-found --wait=true \
    --timeout=120s || warn "Namespace deletion timed out — resources may still be terminating"
  success "Namespace deleted"

  # Delete ingress controller
  log "Deleting ingress-nginx namespace ..."
  $KUBECTL delete -f "$SCRIPT_DIR/ingress-controller.yaml" --ignore-not-found || true
  success "Ingress controller removed"

  # Optionally remove PersistentVolumes (cluster-scoped)
  if [[ "$purge_volumes" == "true" ]]; then
    log "Deleting PersistentVolumes ..."
    $KUBECTL delete -f "$SCRIPT_DIR/volumes/" --ignore-not-found || true
    success "Persistent volumes deleted"
    warn "Host-path data in /data/essedum on ${NODE_NAME} was NOT removed automatically."
    warn "Run:  sudo rm -rf /data/essedum   on ${NODE_NAME} to fully purge data."
  fi

  success "Teardown complete"
}

# ═════════════════════════════════════════════════════════════════════════════
#  RESTART a single deployment
# ═════════════════════════════════════════════════════════════════════════════
cmd_restart() {
  local svc="${1:-}"
  if [[ -z "$svc" ]]; then
    error "Usage: $0 restart <deployment-name>"
    exit 1
  fi
  section "Restarting deployment/${svc}"
  $KUBECTL rollout restart deployment/"$svc" -n "$NAMESPACE"
  wait_deploy "$svc"
  success "deployment/${svc} restarted"
}

# ═════════════════════════════════════════════════════════════════════════════
#  Entrypoint
# ═════════════════════════════════════════════════════════════════════════════
CMD="${1:-deploy}"
shift || true

case "$CMD" in
  deploy)    cmd_deploy ;;
  teardown)  cmd_teardown "$@" ;;
  status)    cmd_status ;;
  restart)   cmd_restart "$@" ;;
  *)
    echo -e "Usage: $0 {deploy|teardown [--purge-volumes]|status|restart <name>}"
    exit 1
    ;;
esac
