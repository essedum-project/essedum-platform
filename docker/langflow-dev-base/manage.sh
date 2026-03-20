#!/bin/bash
# Langflow Management Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

show_help() {
    cat << EOF
Langflow Management Script

Usage: ./manage.sh [command]

Commands:
    start       Start Langflow container
    stop        Stop Langflow container
    restart     Restart Langflow container
    status      Show container status
    logs        Show recent logs (last 100 lines)
    follow      Follow logs in real-time
    shell       Open shell in container
    backup      Backup data directory
    restore     Restore from backup
    clean       Stop and remove all data (WARNING!)
    stats       Show resource usage
    health      Check if Langflow is responding
    version     Show Langflow version
    help        Show this help message

Examples:
    ./manage.sh start
    ./manage.sh logs
    ./manage.sh follow

EOF
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "Error: Docker is not installed"
        exit 1
    fi
    if ! command -v docker compose &> /dev/null; then
        echo "Error: Docker Compose is not installed"
        exit 1
    fi
}

start_langflow() {
    echo "Starting Langflow..."
    mkdir -p data
    docker compose up -d
    echo "✓ Langflow started"
    echo "  Access at: http://localhost:7865"
    sleep 2
    health_check
}

stop_langflow() {
    echo "Stopping Langflow..."
    docker compose down
    echo "✓ Langflow stopped"
}

restart_langflow() {
    echo "Restarting Langflow..."
    docker compose restart
    echo "✓ Langflow restarted"
    sleep 2
    health_check
}

show_status() {
    echo "=== Container Status ==="
    docker compose ps
    echo ""
    if docker ps --filter name=langflow --format "{{.Names}}" | grep -q "langflow"; then
        echo "=== Container Details ==="
        docker inspect -f 'Status={{.State.Status}} Restarts={{.RestartCount}} Uptime={{.State.StartedAt}}' langflow
        echo ""
        echo "=== Resource Usage ==="
        docker stats langflow --no-stream
    fi
}

show_logs() {
    echo "=== Langflow Logs (last 100 lines) ==="
    docker compose logs --tail 100
}

follow_logs() {
    echo "=== Following Langflow Logs (Ctrl+C to exit) ==="
    docker compose logs -f
}

open_shell() {
    echo "Opening shell in Langflow container..."
    echo "(Type 'exit' to leave)"
    docker exec -it langflow /bin/sh
}

backup_data() {
    BACKUP_FILE="langflow-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    echo "Creating backup: $BACKUP_FILE"
    tar -czf "$BACKUP_FILE" data/
    echo "✓ Backup created: $BACKUP_FILE"
    ls -lh "$BACKUP_FILE"
}

restore_data() {
    echo "Available backups:"
    ls -lh langflow-backup-*.tar.gz 2>/dev/null || {
        echo "No backups found"
        exit 1
    }
    echo ""
    read -p "Enter backup filename to restore: " BACKUP_FILE
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "Error: File not found: $BACKUP_FILE"
        exit 1
    fi
    read -p "This will overwrite current data. Continue? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo "Restore cancelled"
        exit 0
    fi
    echo "Stopping Langflow..."
    docker compose down
    echo "Restoring from $BACKUP_FILE..."
    tar -xzf "$BACKUP_FILE"
    echo "Starting Langflow..."
    docker compose up -d
    echo "✓ Restore complete"
}

clean_all() {
    read -p "This will DELETE all data. Are you sure? (type 'yes' to confirm): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo "Clean cancelled"
        exit 0
    fi
    echo "Stopping and removing containers..."
    docker compose down -v
    echo "Removing data directory..."
    rm -rf ./data/*
    echo "✓ All data removed"
}

show_stats() {
    echo "=== Resource Usage ==="
    docker stats langflow --no-stream
    echo ""
    echo "=== Disk Usage ==="
    echo "Data directory: $(du -sh ./data 2>/dev/null | cut -f1)"
    echo "Docker image: $(docker image ls langflowai/langflow:1.1.2 --format '{{.Size}}')"
}

health_check() {
    echo "Checking Langflow health..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:7865 | grep -q "200\|302"; then
        echo "✓ Langflow is responding"
        return 0
    else
        echo "⚠ Langflow is not responding yet"
        echo "  Check status with: ./manage.sh status"
        echo "  View logs with: ./manage.sh logs"
        return 1
    fi
}

show_version() {
    echo "=== Langflow Version ==="
    docker exec langflow langflow --version 2>/dev/null || {
        echo "Container not running. Start with: ./manage.sh start"
        exit 1
    }
    echo ""
    echo "=== Python Version ==="
    docker exec langflow python --version
    echo ""
    echo "=== Image ==="
    docker image ls langflowai/langflow:1.1.2
}

# Main script
check_docker

case "${1:-help}" in
    start)
        start_langflow
        ;;
    stop)
        stop_langflow
        ;;
    restart)
        restart_langflow
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    follow)
        follow_logs
        ;;
    shell)
        open_shell
        ;;
    backup)
        backup_data
        ;;
    restore)
        restore_data
        ;;
    clean)
        clean_all
        ;;
    stats)
        show_stats
        ;;
    health)
        health_check
        ;;
    version)
        show_version
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "Error: Unknown command '$1'"
        echo ""
        show_help
        exit 1
        ;;
esac
