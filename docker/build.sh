#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────
# Essedum Platform – Docker Build & Deploy Script
# ──────────────────────────────────────────────────────────────
# Usage:
#   ./build.sh              # Start all services (only those that are down)
#   ./build.sh --build      # Rebuild images before starting
#   ./build.sh --restart    # Restart all services
#   ./build.sh --stop       # Stop all services
#   ./build.sh --status     # Show status of all services
#   ./build.sh --logs       # Tail logs of all services
#   ./build.sh --clean      # Stop and remove containers, volumes, images
# ──────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.yml"
ENV_FILE="${SCRIPT_DIR}/.env"
ENV_SAMPLE="${SCRIPT_DIR}/.env.sample"

# All services defined in docker-compose.yml
ALL_SERVICES=(
  mysql
  qdrant
  keycloak
  leap-app-backend-service
  frontend
  py-job-executor
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }
log_step()  { echo -e "${CYAN}[STEP]${NC}  $*"; }

# ──────────────────────────────────────────────────────────────
# Pre-flight checks
# ──────────────────────────────────────────────────────────────

check_docker() {
  if ! command -v docker &>/dev/null; then
    log_error "Docker is not installed or not in PATH."
    log_error "Install Docker from https://docs.docker.com/get-docker/"
    exit 1
  fi

  if ! docker info &>/dev/null; then
    log_error "Docker daemon is not running. Please start Docker and try again."
    exit 1
  fi

  log_info "Docker detected: $(docker --version)"
}

check_docker_compose() {
  # docker compose (v2 plugin) or docker-compose (standalone v1)
  if docker compose version &>/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
  elif command -v docker-compose &>/dev/null; then
    COMPOSE_CMD="docker-compose"
  else
    log_error "Docker Compose is not installed."
    log_error "Install it from https://docs.docker.com/compose/install/"
    exit 1
  fi

  log_info "Docker Compose detected: $(${COMPOSE_CMD} version --short 2>/dev/null || ${COMPOSE_CMD} version)"
}

check_env_file() {
  if [ ! -f "${ENV_FILE}" ]; then
    if [ -f "${ENV_SAMPLE}" ]; then
      log_warn ".env file not found. Creating from .env.sample ..."
      cp "${ENV_SAMPLE}" "${ENV_FILE}"
      log_warn "Please review and customise ${ENV_FILE} before proceeding."
      log_warn "Re-run this script after updating .env."
      exit 1
    else
      log_error ".env file not found and no .env.sample available."
      log_error "Create a .env file in ${SCRIPT_DIR} with the required variables."
      exit 1
    fi
  fi
  log_info ".env file found."
}

check_compose_file() {
  if [ ! -f "${COMPOSE_FILE}" ]; then
    log_error "docker-compose.yml not found at ${COMPOSE_FILE}"
    exit 1
  fi
  log_info "docker-compose.yml found."
}

check_disk_space() {
  # Warn if less than 5 GB free on the Docker root partition
  local free_kb
  free_kb=$(df "$(docker info --format '{{.DockerRootDir}}' 2>/dev/null || echo /)" 2>/dev/null | awk 'NR==2 {print $4}')
  if [ -n "${free_kb}" ] && [ "${free_kb}" -lt 5242880 ] 2>/dev/null; then
    log_warn "Less than 5 GB of free disk space. Docker builds may fail."
  fi
}

check_port_available() {
  local port="$1"
  local service="$2"
  if command -v ss &>/dev/null; then
    if ss -tlnp 2>/dev/null | grep -q ":${port} "; then
      log_warn "Port ${port} (${service}) is already in use by another process."
    fi
  elif command -v netstat &>/dev/null; then
    if netstat -tlnp 2>/dev/null | grep -q ":${port} "; then
      log_warn "Port ${port} (${service}) is already in use by another process."
    fi
  fi
}

check_ports() {
  # Source .env defaults for port variables
  source "${ENV_FILE}" 2>/dev/null || true
  check_port_available "${BACKEND_PORT:-8082}" "backend"
  check_port_available "${FRONTEND_PORT:-8084}" "frontend"
  check_port_available "${PYJOB_EXECUTOR_PORT:-5000}" "py-job-executor"
  check_port_available "${MYSQL_PORT:-3306}" "mysql"
  check_port_available "${QDRANT_PORT:-6333}" "qdrant"
  check_port_available "${KEYCLOAK_PORT:-8180}" "keycloak"
}

# ──────────────────────────────────────────────────────────────
# Service helpers
# ──────────────────────────────────────────────────────────────

compose() {
  ${COMPOSE_CMD} -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" "$@"
}

get_service_status() {
  # Returns "running", "exited", "created", "paused", or "" (not found)
  local svc="$1"
  compose ps --format json 2>/dev/null \
    | grep -o "\"State\":\"[^\"]*\"" \
    | head -1 >/dev/null 2>&1

  # Fallback: parse text output for broader compatibility
  local state
  state=$(compose ps -a 2>/dev/null | grep -E "(^|-)${svc}" | awk '{for(i=1;i<=NF;i++) if($i ~ /^(running|exited|created|paused|restarting|dead)$/){print $i}}' | head -1)

  if [ -z "${state}" ]; then
    # Try JSON format (docker compose v2)
    state=$(compose ps -a --format json 2>/dev/null | python3 -c "
import sys, json
for line in sys.stdin:
    try:
        obj = json.loads(line)
        if obj.get('Service','') == '${svc}' or obj.get('Name','').find('${svc}') >= 0:
            print(obj.get('State',''))
            break
    except: pass
" 2>/dev/null || true)
  fi

  echo "${state}"
}

get_down_services() {
  local down_services=()
  for svc in "${ALL_SERVICES[@]}"; do
    local status
    status=$(get_service_status "${svc}")
    if [ "${status}" != "running" ]; then
      down_services+=("${svc}")
    fi
  done
  echo "${down_services[@]}"
}

# ──────────────────────────────────────────────────────────────
# Actions
# ──────────────────────────────────────────────────────────────

do_status() {
  log_step "Service status:"
  echo ""
  printf "  %-35s %s\n" "SERVICE" "STATUS"
  printf "  %-35s %s\n" "───────────────────────────────────" "─────────"
  for svc in "${ALL_SERVICES[@]}"; do
    local status
    status=$(get_service_status "${svc}")
    if [ "${status}" = "running" ]; then
      printf "  %-35s ${GREEN}%s${NC}\n" "${svc}" "running"
    elif [ -z "${status}" ]; then
      printf "  %-35s ${YELLOW}%s${NC}\n" "${svc}" "not created"
    else
      printf "  %-35s ${RED}%s${NC}\n" "${svc}" "${status}"
    fi
  done
  echo ""
}

do_start() {
  local build_flag="${1:-}"
  local down_services
  down_services=$(get_down_services)

  if [ -z "${down_services}" ]; then
    log_info "All services are already running. Nothing to do."
    do_status
    return 0
  fi

  log_step "Services to start: ${down_services}"

  if [ "${build_flag}" = "--build" ]; then
    log_step "Building and starting services …"
    compose up -d --build ${down_services}
  else
    log_step "Starting services …"
    compose up -d ${down_services}
  fi

  log_info "Waiting for services to become healthy …"
  echo ""

  # Wait loop – check every 10s for up to 5 minutes
  local max_wait=300
  local elapsed=0
  local interval=10

  while [ ${elapsed} -lt ${max_wait} ]; do
    local still_down
    still_down=$(get_down_services)
    if [ -z "${still_down}" ]; then
      log_info "All services are running!"
      do_status
      return 0
    fi
    echo -ne "\r  Waiting … (${elapsed}s / ${max_wait}s) – still starting: ${still_down}   "
    sleep ${interval}
    elapsed=$((elapsed + interval))
  done

  echo ""
  log_warn "Timed out after ${max_wait}s. Some services may still be starting."
  do_status

  # Print logs for any unhealthy/stopped containers
  local still_down
  still_down=$(get_down_services)
  if [ -n "${still_down}" ]; then
    log_warn "Showing recent logs for services that are not running:"
    for svc in ${still_down}; do
      echo ""
      log_step "── ${svc} logs ──"
      compose logs --tail=20 "${svc}" 2>/dev/null || true
    done
  fi
}

do_stop() {
  log_step "Stopping all services …"
  compose down
  log_info "All services stopped."
}

do_restart() {
  log_step "Restarting all services …"
  compose down
  do_start
}

do_logs() {
  compose logs -f --tail=100
}

do_clean() {
  log_warn "This will stop and remove all containers, networks, and volumes."
  read -rp "Are you sure? (y/N) " confirm
  if [[ "${confirm}" =~ ^[Yy]$ ]]; then
    log_step "Cleaning up …"
    compose down -v --rmi local --remove-orphans
    log_info "Cleanup complete."
  else
    log_info "Aborted."
  fi
}

# ──────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────

main() {
  echo ""
  echo "╔══════════════════════════════════════════╗"
  echo "║   Essedum Platform – Docker Launcher     ║"
  echo "╚══════════════════════════════════════════╝"
  echo ""

  # Pre-flight
  check_docker
  check_docker_compose
  check_compose_file
  check_env_file
  check_disk_space

  local action="${1:-}"

  case "${action}" in
    --stop)
      do_stop
      ;;
    --restart)
      check_ports
      do_restart
      ;;
    --status)
      do_status
      ;;
    --logs)
      do_logs
      ;;
    --clean)
      do_clean
      ;;
    --build)
      check_ports
      do_start "--build"
      ;;
    --help|-h)
      echo "Usage: $0 [OPTION]"
      echo ""
      echo "Options:"
      echo "  (none)        Start services that are down (no rebuild)"
      echo "  --build       Rebuild images then start services that are down"
      echo "  --restart     Stop and restart all services"
      echo "  --stop        Stop all services"
      echo "  --status      Show status of all services"
      echo "  --logs        Tail logs of all services"
      echo "  --clean       Stop + remove containers, volumes, local images"
      echo "  --help, -h    Show this help"
      echo ""
      ;;
    "")
      check_ports
      do_start
      ;;
    *)
      log_error "Unknown option: ${action}"
      log_error "Run '$0 --help' for usage."
      exit 1
      ;;
  esac
}

main "$@"
