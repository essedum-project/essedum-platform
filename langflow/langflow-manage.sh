#!/bin/bash
# Langflow Persistent - Management Script
# Comprehensive pod, container, and database management

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="aipns"
DEPLOYMENT="langflow-persistent"
SERVICE="langflow-persistent"
POSTGRES_DEPLOYMENT="postgres-langfuse"

print_header() {
    echo -e "${BLUE}=========================================="
    echo -e "$1"
    echo -e "==========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

show_menu() {
    print_header "Langflow Persistent - Management Menu"
    echo ""
    echo "POD MANAGEMENT:"
    echo "  1) Show Pod Status"
    echo "  2) Show Pod Details"
    echo "  3) Show Container Details"
    echo "  4) Restart Pod"
    echo "  5) View Logs (Live)"
    echo "  6) View Logs (Last 100 lines)"
    echo ""
    echo "DATABASE:"
    echo "  7) Show Database Connection Info"
    echo "  8) Test Database Connection"
    echo "  9) Show Database Tables & Data"
    echo " 10) Interactive Database Shell"
    echo " 11) Backup Database"
    echo ""
    echo "DEPLOYMENT:"
    echo " 12) Show Deployment YAML"
    echo " 13) Show Service YAML"
    echo " 14) Show Ingress Configuration"
    echo " 15) Show All Resources"
    echo ""
    echo "TESTING:"
    echo " 16) Check Flows in Database"
    echo " 17) View langflow-test.md (All Test Commands)"
    echo ""
    echo "OPERATIONS:"
    echo " 18) Stop Langflow (Scale to 0)"
    echo " 19) Start Langflow (Scale to 1)"
    echo " 20) Update to Latest Langflow Image"
    echo ""
    echo "  0) Exit"
    echo ""
    read -p "Select option: " choice
    echo ""
    handle_choice "$choice"
}

handle_choice() {
    case $1 in
        1) show_pod_status ;;
        2) show_pod_details ;;
        3) show_container_details ;;
        4) restart_pod ;;
        5) view_logs_live ;;
        6) view_logs_last ;;
        7) show_db_connection ;;
        8) test_db_connection ;;
        9) show_db_data ;;
        10) db_interactive_shell ;;
        11) backup_database ;;
        12) show_deployment_yaml ;;
        13) show_service_yaml ;;
        14) show_ingress_config ;;
        15) show_all_resources ;;
        16) check_flows ;;
        17) view_test_commands ;;
        18) stop_langflow ;;
        19) start_langflow ;;
        20) update_image ;;
        0) exit 0 ;;
        *) print_error "Invalid option"; sleep 2 ;;
    esac
    
    if [ "$1" != "0" ]; then
        echo ""
        read -p "Press Enter to continue..."
        show_menu
    fi
}

# POD MANAGEMENT FUNCTIONS

show_pod_status() {
    print_header "Pod Status"
    kubectl get pods -n $NAMESPACE -l app=$DEPLOYMENT
    echo ""
    print_info "Service Status:"
    kubectl get svc -n $NAMESPACE $SERVICE
}

show_pod_details() {
    print_header "Pod Details"
    POD=$(kubectl get pod -n $NAMESPACE -l app=$DEPLOYMENT -o jsonpath='{.items[0].metadata.name}')
    if [ -z "$POD" ]; then
        print_error "Pod not found"
        return
    fi
    kubectl describe pod $POD -n $NAMESPACE
}

show_container_details() {
    print_header "Container Details"
    POD=$(kubectl get pod -n $NAMESPACE -l app=$DEPLOYMENT -o jsonpath='{.items[0].metadata.name}')
    if [ -z "$POD" ]; then
        print_error "Pod not found"
        return
    fi
    
    echo "Container Name: langflow"
    echo "Init Container: wait-for-postgres"
    echo ""
    print_info "Container Image:"
    kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.spec.containers[0].image}' && echo ""
    echo ""
    print_info "Container Environment Variables:"
    kubectl exec $POD -n $NAMESPACE -- env | grep LANGFLOW
    echo ""
    print_info "Resource Requests/Limits:"
    kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.spec.containers[0].resources}' | python3 -m json.tool
}

restart_pod() {
    print_header "Restart Pod"
    print_warning "This will restart the Langflow pod. Data will persist in PostgreSQL."
    read -p "Continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_info "Cancelled"
        return
    fi
    
    kubectl rollout restart deployment/$DEPLOYMENT -n $NAMESPACE
    print_success "Restart initiated"
    echo ""
    print_info "Waiting for pod to be ready..."
    kubectl wait --for=condition=ready pod -l app=$DEPLOYMENT -n $NAMESPACE --timeout=180s
    print_success "Pod is ready!"
}

view_logs_live() {
    print_header "Live Logs (Ctrl+C to exit)"
    kubectl logs -f deployment/$DEPLOYMENT -n $NAMESPACE
}

view_logs_last() {
    print_header "Last 100 Log Lines"
    kubectl logs --tail=100 deployment/$DEPLOYMENT -n $NAMESPACE
}

# DATABASE FUNCTIONS

show_db_connection() {
    print_header "Database Connection Information"
    
    # Load credentials from .env file if it exists
    ENV_FILE="$(dirname "$0")/.env"
    if [ -f "$ENV_FILE" ]; then
        source "$ENV_FILE"
        echo "Database Name:  ${POSTGRES_DB:-langflowdb}"
        echo "Database User:  ${POSTGRES_USER:-<from .env>}"
        echo "Database Pass:  ${POSTGRES_PASSWORD:-<from .env>}"
        echo "Database Host:  ${POSTGRES_HOST:-postgres.aipns.svc.cluster.local}"
        echo "Database Port:  ${POSTGRES_PORT:-5432}"
        echo ""
        echo "Connection String:"
        echo "  ${LANGFLOW_DATABASE_URL:-<from .env>}"
    else
        print_warning ".env file not found at: $ENV_FILE"
        echo "Database credentials are stored in .env file."
        echo "Copy .env.example to .env and update with your values."
    fi
    echo ""
    print_info "Environment variable in pod:"
    POD=$(kubectl get pod -n $NAMESPACE -l app=$DEPLOYMENT -o jsonpath='{.items[0].metadata.name}')
    if [ ! -z "$POD" ]; then
        kubectl exec $POD -n $NAMESPACE -- env | grep LANGFLOW_DATABASE_URL
    fi
}

test_db_connection() {
    print_header "Testing Database Connection"
    POSTGRES_POD=$(kubectl get pod -n $NAMESPACE -l app=$POSTGRES_DEPLOYMENT -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$POSTGRES_POD" ]; then
        print_error "PostgreSQL pod not found"
        return
    fi
    
    print_info "PostgreSQL Pod: $POSTGRES_POD"
    echo ""
    print_info "Testing connection..."
    kubectl exec $POSTGRES_POD -n $NAMESPACE -- psql -U langfuse -d langflowdb -c "SELECT version();" 2>/dev/null
    print_success "Database connection successful!"
}

show_db_data() {
    print_header "Database Tables & Data"
    POSTGRES_POD=$(kubectl get pod -n $NAMESPACE -l app=$POSTGRES_DEPLOYMENT -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$POSTGRES_POD" ]; then
        print_error "PostgreSQL pod not found"
        return
    fi
    
    print_info "Database Size:"
    kubectl exec $POSTGRES_POD -n $NAMESPACE -- psql -U langfuse -d langflowdb -c "SELECT pg_size_pretty(pg_database_size('langflowdb')) as size;"
    echo ""
    
    print_info "Tables:"
    kubectl exec $POSTGRES_POD -n $NAMESPACE -- psql -U langfuse -d langflowdb -c "\dt"
    echo ""
    
    print_info "Row Counts:"
    kubectl exec $POSTGRES_POD -n $NAMESPACE -- psql -U langfuse -d langflowdb -c "
    SELECT 
        'flows' as table_name, COUNT(*) as rows FROM flow
    UNION ALL SELECT 'users', COUNT(*) FROM \"user\"
    UNION ALL SELECT 'folders', COUNT(*) FROM folder
    UNION ALL SELECT 'messages', COUNT(*) FROM message
    ORDER BY table_name;
    "
}

db_interactive_shell() {
    print_header "Interactive Database Shell"
    POSTGRES_POD=$(kubectl get pod -n $NAMESPACE -l app=$POSTGRES_DEPLOYMENT -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$POSTGRES_POD" ]; then
        print_error "PostgreSQL pod not found"
        return
    fi
    
    print_info "Connecting to langflowdb... (Type \\q to exit)"
    echo ""
    kubectl exec -it $POSTGRES_POD -n $NAMESPACE -- psql -U langfuse -d langflowdb
}

backup_database() {
    print_header "Backup Database"
    POSTGRES_POD=$(kubectl get pod -n $NAMESPACE -l app=$POSTGRES_DEPLOYMENT -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$POSTGRES_POD" ]; then
        print_error "PostgreSQL pod not found"
        return
    fi
    
    BACKUP_FILE="langflow_backup_$(date +%Y%m%d_%H%M%S).sql"
    print_info "Creating backup: $BACKUP_FILE"
    kubectl exec $POSTGRES_POD -n $NAMESPACE -- pg_dump -U langfuse langflowdb > "$BACKUP_FILE"
    print_success "Backup saved to: $BACKUP_FILE"
    ls -lh "$BACKUP_FILE"
}

# DEPLOYMENT FUNCTIONS

show_deployment_yaml() {
    print_header "Deployment YAML"
    kubectl get deployment $DEPLOYMENT -n $NAMESPACE -o yaml
}

show_service_yaml() {
    print_header "Service YAML"
    kubectl get svc $SERVICE -n $NAMESPACE -o yaml
}

show_ingress_config() {
    print_header "Ingress Configuration"
    kubectl get ingress langflow-ingress -n $NAMESPACE -o yaml
}

show_all_resources() {
    print_header "All Langflow Resources"
    print_info "Deployments:"
    kubectl get deployment -n $NAMESPACE -l app=$DEPLOYMENT
    echo ""
    print_info "Pods:"
    kubectl get pods -n $NAMESPACE -l app=$DEPLOYMENT
    echo ""
    print_info "Services:"
    kubectl get svc -n $NAMESPACE $SERVICE
    echo ""
    print_info "Ingress:"
    kubectl get ingress langflow-ingress -n $NAMESPACE
}

# TESTING FUNCTIONS

check_flows() {
    print_header "Check Flows in Database"
    POSTGRES_POD=$(kubectl get pod -n $NAMESPACE -l app=$POSTGRES_DEPLOYMENT -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$POSTGRES_POD" ]; then
        print_error "PostgreSQL pod not found"
        return
    fi
    
    kubectl exec -it $POSTGRES_POD -n $NAMESPACE -- psql -U langfuse -d langflowdb -c "
    SELECT 
        id,
        name,
        description,
        updated_at
    FROM flow
    ORDER BY updated_at DESC
    LIMIT 10;
    "
}

view_test_commands() {
    print_header "Test Commands Reference"
    print_info "Opening langflow-test.md with all test commands..."
    echo ""
    if command -v less &> /dev/null; then
        less langflow-test.md
    elif command -v more &> /dev/null; then
        more langflow-test.md
    else
        cat langflow-test.md
    fi
}

# OPERATIONS FUNCTIONS

stop_langflow() {
    print_header "Stop Langflow"
    print_warning "This will scale the deployment to 0 replicas (stop the pod)"
    read -p "Continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_info "Cancelled"
        return
    fi
    
    kubectl scale deployment/$DEPLOYMENT --replicas=0 -n $NAMESPACE
    print_success "Langflow stopped (scaled to 0)"
    kubectl get pods -n $NAMESPACE -l app=$DEPLOYMENT
}

start_langflow() {
    print_header "Start Langflow"
    kubectl scale deployment/$DEPLOYMENT --replicas=1 -n $NAMESPACE
    print_success "Langflow starting (scaled to 1)"
    echo ""
    print_info "Waiting for pod to be ready..."
    kubectl wait --for=condition=ready pod -l app=$DEPLOYMENT -n $NAMESPACE --timeout=180s
    print_success "Langflow is ready!"
    kubectl get pods -n $NAMESPACE -l app=$DEPLOYMENT
}

update_image() {
    print_header "Update Langflow Image"
    print_warning "This will update to the latest Langflow image and restart the pod"
    read -p "Continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_info "Cancelled"
        return
    fi
    
    kubectl set image deployment/$DEPLOYMENT langflow=langflowai/langflow:latest -n $NAMESPACE
    print_success "Image update initiated"
    echo ""
    print_info "Watching rollout status..."
    kubectl rollout status deployment/$DEPLOYMENT -n $NAMESPACE
    print_success "Update complete!"
}

# Main execution
if [ $# -eq 0 ]; then
    show_menu
else
    handle_choice "$1"
fi
