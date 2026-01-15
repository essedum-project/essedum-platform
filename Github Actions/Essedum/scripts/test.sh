#!/bin/bash

# ============================================================================
# Python Test Runner Script
# Runs unit and integration tests using pytest
# ============================================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# ============================================================================
# Configuration
# ============================================================================

TEST_TYPE="${1:-all}"  # unit, integration, or all
COVERAGE_THRESHOLD=80  # Minimum coverage percentage
TEST_DIR="tests"
COVERAGE_DIR="htmlcov"
COVERAGE_REPORT="coverage.xml"

# pytest configuration
PYTEST_OPTS="--verbose --tb=short --strict-markers"
PYTEST_UNIT_MARKER="unit"
PYTEST_INTEGRATION_MARKER="integration"

# ============================================================================
# Check if pytest is installed
# ============================================================================

check_dependencies() {
    print_info "Checking test tool dependencies..."
    
    local missing_tools=0
    
    if ! command -v pytest &> /dev/null; then
        print_warning "pytest is not installed. Installing..."
        pip install pytest pytest-cov pytest-mock pytest-asyncio || missing_tools=1
    else
        print_success "pytest is available ($(pytest --version | head -n1))"
    fi
    
    if [ $missing_tools -ne 0 ]; then
        print_error "Failed to install required testing tools"
        exit 1
    fi
    
    echo ""
}

# ============================================================================
# Setup test environment
# ============================================================================

setup_test_environment() {
    print_info "Setting up test environment..."
    
    # Set environment variables for testing
    export PYTHONPATH="${PYTHONPATH}:$(pwd)"
    export TESTING=true
    export ENVIRONMENT=test
    
    # Create test directories if they don't exist
    if [ ! -d "$TEST_DIR" ]; then
        print_warning "Test directory not found: $TEST_DIR"
        print_info "Creating test directory..."
        mkdir -p "$TEST_DIR"
        
        # Create basic test structure
        touch "$TEST_DIR/__init__.py"
        touch "$TEST_DIR/test_example.py"
        
        cat > "$TEST_DIR/test_example.py" << 'EOF'
"""
Example test file - replace with actual tests
"""
import pytest


@pytest.mark.unit
def test_example():
    """Example unit test"""
    assert True


@pytest.mark.integration
def test_integration_example():
    """Example integration test"""
    assert True
EOF
        
        print_success "Created test directory structure"
    fi
    
    print_success "Test environment ready"
    echo ""
}

# ============================================================================
# Run unit tests
# ============================================================================

run_unit_tests() {
    print_header "Running Unit Tests"
    
    if [ ! -d "$TEST_DIR" ]; then
        print_error "Test directory not found: $TEST_DIR"
        return 1
    fi
    
    print_info "Running unit tests with pytest..."
    print_info "Marker: $PYTEST_UNIT_MARKER"
    
    # Run pytest with unit marker
    if pytest $PYTEST_OPTS \
        -m "$PYTEST_UNIT_MARKER" \
        --cov=src \
        --cov-report=term-missing \
        --cov-report=html:$COVERAGE_DIR \
        --cov-report=xml:$COVERAGE_REPORT \
        $TEST_DIR; then
        print_success "Unit tests passed"
        echo ""
        return 0
    else
        print_error "Unit tests failed"
        echo ""
        return 1
    fi
}

# ============================================================================
# Run integration tests
# ============================================================================

run_integration_tests() {
    print_header "Running Integration Tests"
    
    if [ ! -d "$TEST_DIR" ]; then
        print_error "Test directory not found: $TEST_DIR"
        return 1
    fi
    
    print_info "Running integration tests with pytest..."
    print_info "Marker: $PYTEST_INTEGRATION_MARKER"
    
    # Run pytest with integration marker
    if pytest $PYTEST_OPTS \
        -m "$PYTEST_INTEGRATION_MARKER" \
        $TEST_DIR; then
        print_success "Integration tests passed"
        echo ""
        return 0
    else
        print_error "Integration tests failed"
        echo ""
        return 1
    fi
}

# ============================================================================
# Run all tests
# ============================================================================

run_all_tests() {
    print_header "Running All Tests"
    
    if [ ! -d "$TEST_DIR" ]; then
        print_error "Test directory not found: $TEST_DIR"
        return 1
    fi
    
    print_info "Running all tests with pytest..."
    
    # Run pytest on all tests
    if pytest $PYTEST_OPTS \
        --cov=src \
        --cov-report=term-missing \
        --cov-report=html:$COVERAGE_DIR \
        --cov-report=xml:$COVERAGE_REPORT \
        $TEST_DIR; then
        print_success "All tests passed"
        echo ""
        return 0
    else
        print_error "Some tests failed"
        echo ""
        return 1
    fi
}

# ============================================================================
# Check code coverage
# ============================================================================

check_coverage() {
    print_header "Code Coverage Report"
    
    if [ ! -f "$COVERAGE_REPORT" ]; then
        print_warning "Coverage report not found: $COVERAGE_REPORT"
        print_info "Coverage checking skipped"
        echo ""
        return 0
    fi
    
    print_info "Checking code coverage threshold..."
    
    # Extract coverage percentage from XML report
    # This is a simple approach - can be enhanced with python-coverage or coverage.py tools
    if command -v coverage &> /dev/null; then
        COVERAGE_PERCENT=$(coverage report --precision=2 | tail -n 1 | awk '{print $NF}' | sed 's/%//')
        
        print_info "Current coverage: ${COVERAGE_PERCENT}%"
        print_info "Required threshold: ${COVERAGE_THRESHOLD}%"
        
        # Compare coverage (handle decimals)
        if (( $(echo "$COVERAGE_PERCENT >= $COVERAGE_THRESHOLD" | bc -l) )); then
            print_success "Coverage threshold met!"
        else
            print_warning "Coverage below threshold"
            print_info "Consider adding more tests to improve coverage"
            # Don't fail on coverage - just warn
        fi
    else
        print_info "Coverage tool not available - skipping threshold check"
    fi
    
    if [ -d "$COVERAGE_DIR" ]; then
        print_info "HTML coverage report available at: $COVERAGE_DIR/index.html"
    fi
    
    echo ""
    return 0
}

# ============================================================================
# Generate test report
# ============================================================================

generate_test_report() {
    print_header "Test Summary"
    
    echo "Test run completed at: $(date)"
    echo "Test type: $TEST_TYPE"
    echo ""
    
    if [ $TEST_FAILURES -eq 0 ]; then
        print_success "All tests passed!"
    else
        print_error "Some tests failed"
    fi
    
    # Show test statistics if available
    if [ -f ".pytest_cache/v/cache/stepwise" ]; then
        print_info "Detailed results available in .pytest_cache/"
    fi
    
    echo ""
}

# ============================================================================
# Clean test artifacts
# ============================================================================

clean_test_artifacts() {
    print_info "Cleaning test artifacts..."
    
    # Remove pytest cache
    if [ -d ".pytest_cache" ]; then
        rm -rf .pytest_cache
        print_success "Removed .pytest_cache"
    fi
    
    # Remove pycache
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
    
    # Optionally remove coverage reports
    # rm -rf $COVERAGE_DIR $COVERAGE_REPORT
    
    echo ""
}

# ============================================================================
# Main execution
# ============================================================================

main() {
    print_header "Python Test Suite"
    echo "Python version: $(python --version 2>&1)"
    echo "Test directory: $TEST_DIR"
    echo "Test type: $TEST_TYPE"
    echo ""
    
    # Check dependencies
    check_dependencies
    
    # Setup test environment
    setup_test_environment
    
    # Track test failures
    TEST_FAILURES=0
    
    # Run tests based on type
    case $TEST_TYPE in
        unit)
            run_unit_tests || TEST_FAILURES=$((TEST_FAILURES + 1))
            check_coverage
            ;;
        integration)
            run_integration_tests || TEST_FAILURES=$((TEST_FAILURES + 1))
            ;;
        all)
            run_all_tests || TEST_FAILURES=$((TEST_FAILURES + 1))
            check_coverage
            ;;
        clean)
            clean_test_artifacts
            exit 0
            ;;
        *)
            print_error "Unknown test type: $TEST_TYPE"
            print_info "Valid types: unit, integration, all, clean"
            exit 1
            ;;
    esac
    
    # Generate report
    generate_test_report
    
    # Exit with appropriate code
    if [ $TEST_FAILURES -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main
