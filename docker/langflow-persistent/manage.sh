#!/bin/bash
# Langflow Persistent Management Script (PostgreSQL Backend)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

show_help() {
    cat << EOF
Langflow Persistent Management Script (PostgreSQL Backend)

Usage: ./manage.sh [command]

Commands:
    start       Start Langflow container
    stop        Stop Langflow container
    restart     Restart Langflow container
    status      Show container and database status
    logs        Show recent logs (last 100 lines)
    follow      Follow logs in real-time
    shell       Open shell in container
    dbshell     Open PostgreSQL shell
    backup      Backup PostgreSQL database
    restore     Restore from database backup
    clean       Stop container (database preserved)
    stats       Show resource usage
    health      Check if Langflow is responding
    dbstatus    Check database connection and size
    version     Show Langflow and PostgreSQL versions
    help        Show this help message

Examples:
    ./manage.sh start
    ./manage.sh dbstatus
    ./manage.sh backup

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

check_postgres() {
    if ! docker ps --filter name=langflow-postgres --format "{{.Names}}" | grep -q "langflow-postgres"; then
        echo "⚠ Warning: PostgreSQL container 'langflow-postgres' is not running"
        echo "  Langflow requires PostgreSQL to be running first"
        echo "  Check with: docker ps --filter name=langflow-postgres"
        return 1
    fi
    return 0
}

start_langflow() {
    echo "Starting Langflow (PostgreSQL backend)..."
    mkdir -p data
    
    if ! check_postgres; then
        read -p "PostgreSQL not running. Continue anyway? (yes/no): " CONFIRM
        if [ "$CONFIRM" != "yes" ]; then
            echo "Start cancelled"
            exit 0
        fi
    fi
    
    docker compose up -d
    echo "✓ Langflow started"
    echo "  Access at: http://localhost:7866"
    echo "  Database: langflow_persistent @ langflow-postgres"
    sleep 3
    health_check
}

stop_langflow() {
    echo "Stopping Langflow..."
    echo "(Database will be preserved in PostgreSQL)"
    docker compose down
    echo "✓ Langflow stopped"
    echo "  Database: Still available in langflow-postgres"
}

restart_langflow() {
    echo "Restarting Langflow..."
    docker compose restart langflow
    echo "✓ Langflow restarted"
    sleep 2
    health_check
}

show_status() {
    echo "=== Langflow Container Status ==="
    docker compose ps
    echo ""
    
    if docker ps --filter name=langflow-persistent --format "{{.Names}}" | grep -q "langflow-persistent"; then
        echo "=== Container Details ==="
        docker inspect -f 'Status={{.State.Status}} Restarts={{.RestartCount}} Uptime={{.State.StartedAt}}' langflow-persistent
        echo ""
        echo "=== Resource Usage ==="
        docker stats langflow-persistent --no-stream
    fi
    
    echo ""
    echo "=== PostgreSQL Status ==="
    if check_postgres; then
        docker ps --filter name=langflow-postgres --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
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
    docker exec -it langflow-persistent /bin/sh
}

open_dbshell() {
    echo "Opening PostgreSQL shell for langflow_persistent database..."
    echo "(Type '\q' or Ctrl+D to exit)"
    docker exec -it langflow-postgres psql -U langflow_user -d langflow_persistent
}

backup_database() {
    BACKUP_FILE="langflow-persistent-db-backup-$(date +%Y%m%d-%H%M%S).sql"
    echo "Creating PostgreSQL database backup: $BACKUP_FILE"
    
    if ! check_postgres; then
        echo "Error: PostgreSQL is not running"
        exit 1
    fi
    
    docker exec langflow-postgres pg_dump -U langflow_user langflow_persistent > "$BACKUP_FILE"
    echo "✓ Database backup created: $BACKUP_FILE"
    ls -lh "$BACKUP_FILE"
    
    # Also backup local cache
    if [ -d "data" ]; then
        CACHE_FILE="langflow-persistent-cache-$(date +%Y%m%d-%H%M%S).tar.gz"
        tar -czf "$CACHE_FILE" data/
        echo "✓ Cache backup created: $CACHE_FILE"
        ls -lh "$CACHE_FILE"
    fi
}

restore_database() {
    echo "Available database backups:"
    ls -lh langflow-persistent-db-backup-*.sql 2>/dev/null || {
        echo "No database backups found"
        exit 1
    }
    echo ""
    read -p "Enter backup filename to restore: " BACKUP_FILE
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "Error: File not found: $BACKUP_FILE"
        exit 1
    fi
    
    read -p "This will overwrite current database. Continue? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo "Restore cancelled"
        exit 0
    fi
    
    if ! check_postgres; then
        echo "Error: PostgreSQL is not running"
        exit 1
    fi
    
    echo "Stopping Langflow..."
    docker compose down
    
    echo "Restoring database from $BACKUP_FILE..."
    cat "$BACKUP_FILE" | docker exec -i langflow-postgres psql -U langflow_user langflow_persistent
    
    echo "Starting Langflow..."
    docker compose up -d
    echo "✓ Restore complete"
}

clean_container() {
    echo "This will stop the container but preserve the PostgreSQL database"
    read -p "Continue? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo "Clean cancelled"
        exit 0
    fi
    echo "Stopping containers..."
    docker compose down
    echo "Removing local cache..."
    rm -rf ./data/cache/*
    echo "✓ Container stopped, local cache cleared"
    echo "  Database preserved in PostgreSQL (langflow_persistent)"
}

show_stats() {
    echo "=== Langflow Resource Usage ==="
    if docker ps --filter name=langflow-persistent --format "{{.Names}}" | grep -q "langflow-persistent"; then
        docker stats langflow-persistent --no-stream
    else
        echo "Container not running"
    fi
    
    echo ""
    echo "=== PostgreSQL Resource Usage ==="
    if check_postgres; then
        docker stats langflow-postgres --no-stream
    fi
    
    echo ""
    echo "=== Disk Usage ==="
    echo "Local cache: $(du -sh ./data 2>/dev/null | cut -f1 || echo '0')"
    echo "Docker image: $(docker image ls langflowai/langflow:1.1.2 --format '{{.Size}}')"
    
    if check_postgres; then
        echo ""
        DB_SIZE=$(docker exec langflow-postgres psql -U langflow_user -d langflow_persistent -t -c \
            "SELECT pg_size_pretty(pg_database_size('langflow_persistent'));" 2>/dev/null | xargs)
        echo "Database size: ${DB_SIZE:-N/A}"
    fi
}

health_check() {
    echo "Checking Langflow health..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:7866 | grep -q "200\|302"; then
        echo "✓ Langflow is responding on port 7866"
        return 0
    else
        echo "⚠ Langflow is not responding yet"
        echo "  Check status with: ./manage.sh status"
        echo "  View logs with: ./manage.sh logs"
        return 1
    fi
}

show_dbstatus() {
    echo "=== Database Connection Status ==="
    
    if ! check_postgres; then
        echo "❌ PostgreSQL is not running"
        exit 1
    fi
    
    # Check if database exists
    if docker exec langflow-postgres psql -U langflow_user -d langflowdb -t -c \
        "SELECT 1 FROM pg_database WHERE datname='langflow_persistent';" 2>/dev/null | grep -q 1; then
        echo "✓ Database 'langflow_persistent' exists"
    else
        echo "❌ Database 'langflow_persistent' does not exist"
        echo "  Run 'docker compose up -d' to create it"
        exit 1
    fi
    
    # Test connection
    if docker run --rm --network march16_default postgres:16-alpine \
        pg_isready -h langflow-postgres -U langflow_user -d langflow_persistent >/dev/null 2>&1; then
        echo "✓ Database is accepting connections"
    else
        echo "❌ Cannot connect to database"
        exit 1
    fi
    
    # Get database size
    echo ""
    echo "=== Database Information ==="
    docker exec langflow-postgres psql -U langflow_user -d langflow_persistent -c \
        "SELECT 
            pg_size_pretty(pg_database_size('langflow_persistent')) as database_size,
            (SELECT count(*) FROM pg_stat_activity WHERE datname='langflow_persistent') as active_connections;"
    
    # List tables
    echo ""
    echo "=== Tables ==="
    docker exec langflow-postgres psql -U langflow_user -d langflow_persistent -c '\dt' 2>/dev/null || \
        echo "No tables yet (database is empty)"
}

show_version() {
    echo "=== Langflow Version ==="
    if docker ps --filter name=langflow-persistent --format "{{.Names}}" | grep -q "langflow-persistent"; then
        docker exec langflow-persistent langflow --version 2>/dev/null || echo "Container running but langflow not responding"
        echo ""
        echo "=== Python Version ==="
        docker exec langflow-persistent python --version
    else
        echo "Container not running. Start with: ./manage.sh start"
    fi
    
    echo ""
    echo "=== PostgreSQL Version ==="
    if check_postgres; then
        docker exec langflow-postgres psql -U langflow_user -V
    else
        echo "PostgreSQL not running"
    fi
    
    echo ""
    echo "=== Images ==="
    docker image ls | grep -E "langflow|postgres" | grep -E "1.1.2|16-alpine"
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
    dbshell)
        open_dbshell
        ;;
    backup)
        backup_database
        ;;
    restore)
        restore_database
        ;;
    clean)
        clean_container
        ;;
    stats)
        show_stats
        ;;
    health)
        health_check
        ;;
    dbstatus)
        show_dbstatus
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
