#!/bin/bash
set -e

# =============================================================================
# Essedum Platform - Build & Run Script
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

ENV_FILE=".env"
ENV_SAMPLE=".env.sample"
COMPOSE_FILE="docker-compose.yml"

# --- Colors for output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
print_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

usage() {
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  start       Smart start: check Docker, detect running services, start if needed"
    echo "  build       Build all Docker images (without starting)"
    echo "  up          Build and start all services"
    echo "  down        Stop and remove all services"
    echo "  restart     Restart all services"
    echo "  logs        Show logs (use -f for follow)"
    echo "  status      Show status of all services"
    echo "  clean       Stop services and remove images, volumes"
    echo "  init-env    Create .env from .env.sample"
    echo ""
    echo "Options:"
    echo "  --no-cache  Build without Docker cache"
    echo "  -d          Run in detached mode (for 'up' command)"
    echo "  -f          Follow logs (for 'logs' command)"
    echo ""
    echo "Examples:"
    echo "  $0 start             # Smart start (recommended)"
    echo "  $0 init-env          # First-time setup: create .env"
    echo "  $0 up -d             # Build and start in background"
    echo "  $0 up -d --no-cache  # Full rebuild and start"
    echo "  $0 logs -f           # Stream live logs"
    echo "  $0 down              # Stop everything"
    echo ""
}

# --- Check prerequisites ---
check_prerequisites() {
    print_info "Checking prerequisites..."

    # Check Docker installation
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        print_error "  Install guide: https://docs.docker.com/get-docker/"
        exit 1
    fi
    local docker_version
    docker_version=$(docker --version 2>/dev/null)
    print_info "Docker found: $docker_version"

    # Check if Docker daemon is running
    local DOCKER_PREFIX=""
    if ! docker info &> /dev/null; then
        if sudo docker info &> /dev/null 2>&1; then
            print_warn "Docker not accessible without sudo in this session. Using sudo. (Add user to 'docker' group and re-login to avoid this.)"
            DOCKER_PREFIX="sudo"
        else
            print_error "Docker daemon is not running. Please start Docker and try again."
            exit 1
        fi
    fi
    print_info "Docker daemon is running."

    # Check Docker Compose availability
    if ! $DOCKER_PREFIX docker compose version &> /dev/null 2>&1; then
        if ! $DOCKER_PREFIX docker-compose version &> /dev/null 2>&1; then
            print_error "Docker Compose is not available. Please install Docker Compose."
            exit 1
        fi
        COMPOSE_CMD="$DOCKER_PREFIX docker-compose"
        local compose_ver
        compose_ver=$($DOCKER_PREFIX docker-compose version --short 2>/dev/null || $DOCKER_PREFIX docker-compose version 2>/dev/null)
        print_info "Docker Compose found (standalone): $compose_ver"
    else
        COMPOSE_CMD="$DOCKER_PREFIX docker compose"
        local compose_ver
        compose_ver=$($DOCKER_PREFIX docker compose version 2>/dev/null)
        print_info "Docker Compose found: $compose_ver"
    fi

    echo ""
}

# --- Get list of running services for this project ---
get_running_services() {
    $COMPOSE_CMD -f "$COMPOSE_FILE" ps --format '{{.Name}}' 2>/dev/null | grep -v '^$' || true
}

# --- Show detailed service status ---
show_service_status() {
    echo ""
    print_info "=== Service Status ==="
    echo ""

    local running_services
    running_services=$($COMPOSE_CMD -f "$COMPOSE_FILE" ps --format 'table {{.Name}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null || \
                       $COMPOSE_CMD -f "$COMPOSE_FILE" ps 2>/dev/null)

    if [ -z "$running_services" ]; then
        print_warn "No services are currently running."
        return 1
    fi

    echo "$running_services"
    echo ""

    # Count running vs total
    local running_count
    running_count=$($COMPOSE_CMD -f "$COMPOSE_FILE" ps --status running --format '{{.Name}}' 2>/dev/null | wc -l | tr -d ' ')
    local total_count
    total_count=$($COMPOSE_CMD -f "$COMPOSE_FILE" ps --format '{{.Name}}' 2>/dev/null | wc -l | tr -d ' ')

    if [ "$running_count" -eq "$total_count" ] && [ "$total_count" -gt 0 ]; then
        print_info "All $running_count service(s) are running."
    elif [ "$total_count" -gt 0 ]; then
        print_warn "$running_count of $total_count service(s) are running."
    fi

    echo ""
    return 0
}

# --- Get all defined service names from compose file ---
get_all_services() {
    $COMPOSE_CMD -f "$COMPOSE_FILE" config --services 2>/dev/null || true
}

# --- Get running service names (compose service names, not container names) ---
get_running_service_names() {
    $COMPOSE_CMD -f "$COMPOSE_FILE" ps --status running --format '{{.Service}}' 2>/dev/null | sort -u || true
}

# --- Smart start command ---
cmd_start() {
    print_info "=== Essedum Platform - Smart Start ==="
    echo ""

    # Step 1: Prerequisites already checked in main block

    ensure_env
    ensure_entrypoint

    # Step 2: Determine which services are running and which are down
    print_info "Checking service states..."

    local all_services running_services stopped_services
    all_services=$(get_all_services)
    running_services=$(get_running_service_names)

    if [ -z "$all_services" ]; then
        print_error "No services defined in $COMPOSE_FILE."
        exit 1
    fi

    # Compute stopped services (all minus running)
    stopped_services=""
    while IFS= read -r svc; do
        [ -z "$svc" ] && continue
        if ! echo "$running_services" | grep -qx "$svc"; then
            stopped_services="$stopped_services $svc"
        fi
    done <<< "$all_services"

    # Trim leading space
    stopped_services=$(echo "$stopped_services" | xargs)

    # Report running services
    if [ -n "$running_services" ]; then
        print_info "Already running (will not be touched):"
        echo "$running_services" | while IFS= read -r svc; do
            [ -n "$svc" ] && echo "  - $svc"
        done
        echo ""
    fi

    # If nothing is stopped, everything is already up
    if [ -z "$stopped_services" ]; then
        print_info "All services are already running. Nothing to do."
        echo ""
        show_service_status
        return 0
    fi

    print_info "Services to start: $stopped_services"
    echo ""

    # Step 3: Build and start only the stopped services
    print_info "Building and starting stopped services in detached mode..."
    # shellcheck disable=SC2086
    $COMPOSE_CMD -f "$COMPOSE_FILE" up --build -d $stopped_services

    echo ""
    print_info "Waiting for services to initialize..."
    sleep 5

    # Step 4: Show final status
    show_service_status

    print_info "Frontend: http://localhost:${FRONTEND_PORT:-8084}"
    print_info "Backend:  http://localhost:${BACKEND_PORT:-8082}"
    echo ""
    print_info "Use '$0 logs -f' to follow logs."
    print_info "Use '$0 status' to check service status."
    print_info "Use '$0 down' to stop all services."
}

# --- Ensure .env exists ---
ensure_env() {
    if [ ! -f "$ENV_FILE" ]; then
        if [ -f "$ENV_SAMPLE" ]; then
            print_warn ".env file not found. Creating from .env.sample..."
            cp "$ENV_SAMPLE" "$ENV_FILE"
            print_info "Created .env — review and update it before starting services."
        else
            print_error "Neither .env nor .env.sample found. Cannot continue."
            exit 1
        fi
    fi
}

# --- Make entrypoint script executable ---
ensure_entrypoint() {
    local entrypoint="entrypoint.sh"
    if [ -f "$entrypoint" ]; then
        chmod +x "$entrypoint"
    fi
}

# --- Commands ---

cmd_init_env() {
    if [ -f "$ENV_FILE" ]; then
        print_warn ".env already exists. Overwrite? (y/N)"
        read -r answer
        if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
            print_info "Skipped."
            return
        fi
    fi
    if [ ! -f "$ENV_SAMPLE" ]; then
        print_error ".env.sample not found."
        exit 1
    fi
    cp "$ENV_SAMPLE" "$ENV_FILE"
    print_info ".env created from .env.sample. Edit it with your configuration:"
    print_info "  vi $ENV_FILE"
}

cmd_build() {
    ensure_env
    ensure_entrypoint
    local cache_flag=""
    if [[ "$*" == *"--no-cache"* ]]; then
        cache_flag="--no-cache"
    fi
    print_info "Building Docker images..."
    $COMPOSE_CMD -f "$COMPOSE_FILE" build $cache_flag
    print_info "Build complete."
}

cmd_up() {
    ensure_env
    ensure_entrypoint
    local flags=""
    local cache_flag=""
    if [[ "$*" == *"-d"* ]]; then
        flags="-d"
    fi
    if [[ "$*" == *"--no-cache"* ]]; then
        cache_flag="--no-cache"
    fi
    print_info "Building and starting services..."
    $COMPOSE_CMD -f "$COMPOSE_FILE" up --build $cache_flag $flags
    if [[ "$flags" == *"-d"* ]]; then
        echo ""
        print_info "Services started in background."
        print_info "Frontend: http://localhost:${FRONTEND_PORT:-8084}"
        print_info "Backend:  http://localhost:${BACKEND_PORT:-8082}"
        print_info "Use '$0 logs -f' to follow logs."
    fi
}

cmd_down() {
    print_info "Stopping services..."
    $COMPOSE_CMD -f "$COMPOSE_FILE" down
    print_info "Services stopped."
}

cmd_restart() {
    print_info "Restarting services..."
    $COMPOSE_CMD -f "$COMPOSE_FILE" down
    cmd_up "$@"
}

cmd_logs() {
    local flags=""
    if [[ "$*" == *"-f"* ]]; then
        flags="-f"
    fi
    $COMPOSE_CMD -f "$COMPOSE_FILE" logs $flags
}

cmd_status() {
    show_service_status
}

cmd_clean() {
    print_warn "This will stop all services and remove images and volumes. Continue? (y/N)"
    read -r answer
    if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
        print_info "Cancelled."
        return
    fi
    print_info "Cleaning up..."
    $COMPOSE_CMD -f "$COMPOSE_FILE" down --rmi local -v
    print_info "Cleanup complete."
}

# =============================================================================
# Main
# =============================================================================
check_prerequisites

COMMAND="${1:-}"
shift 2>/dev/null || true

case "$COMMAND" in
    start)    cmd_start ;;
    build)    cmd_build "$@" ;;
    up)       cmd_up "$@" ;;
    down)     cmd_down ;;
    restart)  cmd_restart "$@" ;;
    logs)     cmd_logs "$@" ;;
    status)   cmd_status ;;
    clean)    cmd_clean ;;
    init-env) cmd_init_env ;;
    help|-h|--help) usage ;;
    *)
        if [ -n "$COMMAND" ]; then
            print_error "Unknown command: $COMMAND"
        fi
        usage
        exit 1
        ;;
esac
