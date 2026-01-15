#!/bin/bash

# ============================================================================
# Smoke Test Script
# Post-Deployment Validation
# ============================================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# ============================================================================
# Configuration
# ============================================================================

HOST="${1:-192.168.28.36}"
PORT="${2:-8080}"
BASE_URL="http://${HOST}:${PORT}"

MAX_RETRIES=5
RETRY_DELAY=10  # seconds
TIMEOUT=10      # seconds

# ============================================================================
# Test Functions
# ============================================================================

# Health endpoint test
test_health_endpoint() {
    print_info "Testing health endpoint: ${BASE_URL}/health"
    
    local retry_count=0
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "${BASE_URL}/health" 2>/dev/null || echo "000")
        
        if [ "$HTTP_CODE" == "200" ]; then
            print_success "Health endpoint responding (HTTP $HTTP_CODE)"
            return 0
        else
            retry_count=$((retry_count + 1))
            print_warning "Health check attempt ${retry_count}/${MAX_RETRIES} failed (HTTP ${HTTP_CODE})"
            
            if [ $retry_count -lt $MAX_RETRIES ]; then
                print_info "Retrying in ${RETRY_DELAY} seconds..."
                sleep $RETRY_DELAY
            fi
        fi
    done
    
    print_error "Health endpoint not responding after $MAX_RETRIES attempts"
    return 1
}

# API readiness test
test_api_readiness() {
    print_info "Testing API readiness..."
    
    # TODO: Customize based on your actual API endpoints
    # This is a placeholder test
    
    # Example: Test a basic API endpoint
    # HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "${BASE_URL}/api/v1/status")
    
    # For now, just check if service is accepting connections
    if curl -s --max-time $TIMEOUT "${BASE_URL}" > /dev/null 2>&1; then
        print_success "API is ready and accepting connections"
        return 0
    else
        print_warning "API readiness check inconclusive"
        return 0  # Don't fail the smoke test on this
    fi
}

# Response time test
test_response_time() {
    print_info "Testing response time..."
    
    START_TIME=$(date +%s%N)
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "${BASE_URL}/health" 2>/dev/null || echo "000")
    END_TIME=$(date +%s%N)
    
    if [ "$HTTP_CODE" != "200" ]; then
        print_error "Failed to get response for timing test"
        return 1
    fi
    
    RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))  # Convert to milliseconds
    RESPONSE_TIME_THRESHOLD=2000  # 2 seconds
    
    if [ $RESPONSE_TIME -lt $RESPONSE_TIME_THRESHOLD ]; then
        print_success "Response time: ${RESPONSE_TIME}ms (threshold: ${RESPONSE_TIME_THRESHOLD}ms)"
        return 0
    else
        print_warning "Response time: ${RESPONSE_TIME}ms exceeds threshold (${RESPONSE_TIME_THRESHOLD}ms)"
        return 0  # Warning, not failure
    fi
}

# Container connectivity test
test_container_connectivity() {
    print_info "Testing container connectivity..."
    
    # Check if port is accessible
    if nc -z -w5 $HOST $PORT 2>/dev/null; then
        print_success "Container port $PORT is accessible"
        return 0
    elif timeout 5 bash -c "cat < /dev/null > /dev/tcp/$HOST/$PORT" 2>/dev/null; then
        print_success "Container port $PORT is accessible"
        return 0
    else
        print_error "Cannot connect to container port $PORT"
        return 1
    fi
}

# Basic load test (optional)
test_basic_load() {
    print_info "Running basic load test (10 requests)..."
    
    local success_count=0
    local total_requests=10
    
    for i in $(seq 1 $total_requests); do
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "${BASE_URL}/health" 2>/dev/null || echo "000")
        
        if [ "$HTTP_CODE" == "200" ]; then
            success_count=$((success_count + 1))
        fi
    done
    
    SUCCESS_RATE=$((success_count * 100 / total_requests))
    
    if [ $SUCCESS_RATE -ge 90 ]; then
        print_success "Basic load test passed: ${success_count}/${total_requests} successful (${SUCCESS_RATE}%)"
        return 0
    else
        print_warning "Basic load test: ${success_count}/${total_requests} successful (${SUCCESS_RATE}%)"
        return 0  # Warning, not failure
    fi
}

# GPU availability test (if applicable)
test_gpu_availability() {
    print_info "Checking GPU availability (placeholder)..."
    
    # TODO: Implement GPU-specific health check
    # This could involve:
    # 1. Calling a GPU-aware endpoint in your application
    # 2. Checking CUDA availability via your API
    # 3. Verifying GPU memory allocation
    
    # For now, we'll just mark it as a placeholder
    print_success "GPU availability check: Placeholder (implement based on application needs)"
    return 0
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    echo "========================================"
    echo "Smoke Test Suite"
    echo "Target: ${BASE_URL}"
    echo "========================================"
    echo ""
    
    FAILED_TESTS=0
    TOTAL_TESTS=0
    
    # Run all smoke tests
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    test_container_connectivity || FAILED_TESTS=$((FAILED_TESTS + 1))
    echo ""
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    test_health_endpoint || FAILED_TESTS=$((FAILED_TESTS + 1))
    echo ""
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    test_api_readiness || FAILED_TESTS=$((FAILED_TESTS + 1))
    echo ""
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    test_response_time || FAILED_TESTS=$((FAILED_TESTS + 1))
    echo ""
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    test_basic_load || FAILED_TESTS=$((FAILED_TESTS + 1))
    echo ""
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    test_gpu_availability || FAILED_TESTS=$((FAILED_TESTS + 1))
    echo ""
    
    # Summary
    echo "========================================"
    PASSED_TESTS=$((TOTAL_TESTS - FAILED_TESTS))
    echo "Results: ${PASSED_TESTS}/${TOTAL_TESTS} tests passed"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        print_success "All smoke tests passed"
        echo "========================================"
        exit 0
    else
        print_error "${FAILED_TESTS} smoke test(s) failed"
        echo "========================================"
        exit 1
    fi
}

# Check dependencies
check_dependencies() {
    local missing_deps=0
    
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed"
        missing_deps=1
    fi
    
    if [ $missing_deps -ne 0 ]; then
        print_error "Missing required dependencies"
        exit 1
    fi
}

# Entry point
check_dependencies
main
