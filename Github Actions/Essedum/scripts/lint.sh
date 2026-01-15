#!/bin/bash

# ============================================================================
# Python Linting Script
# Uses ruff and flake8 for code quality checks
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

# Directories to lint (customize based on your project structure)
SRC_DIRS="src tests"
EXCLUDE_DIRS="__pycache__,.git,.venv,venv,env,.eggs,*.egg-info,build,dist"

# Ruff configuration
RUFF_LINE_LENGTH=100
RUFF_TARGET_VERSION="py311"

# Flake8 configuration
FLAKE8_MAX_LINE_LENGTH=100
FLAKE8_MAX_COMPLEXITY=10

# ============================================================================
# Check if linting tools are installed
# ============================================================================

check_dependencies() {
    print_info "Checking linting tool dependencies..."
    
    local missing_tools=0
    
    if ! command -v ruff &> /dev/null; then
        print_warning "ruff is not installed. Installing..."
        pip install ruff || missing_tools=1
    else
        print_success "ruff is available"
    fi
    
    if ! command -v flake8 &> /dev/null; then
        print_warning "flake8 is not installed. Installing..."
        pip install flake8 || missing_tools=1
    else
        print_success "flake8 is available"
    fi
    
    if [ $missing_tools -ne 0 ]; then
        print_error "Failed to install required linting tools"
        exit 1
    fi
    
    echo ""
}

# ============================================================================
# Run Ruff linter
# ============================================================================

run_ruff() {
    print_header "Running Ruff Linter"
    
    # Check if source directories exist
    for dir in $SRC_DIRS; do
        if [ ! -d "$dir" ]; then
            print_warning "Directory not found: $dir (skipping)"
            continue
        fi
        
        print_info "Linting: $dir"
        
        # Run ruff check
        if ruff check $dir \
            --line-length $RUFF_LINE_LENGTH \
            --target-version $RUFF_TARGET_VERSION \
            --exclude "$EXCLUDE_DIRS" \
            --output-format=text; then
            print_success "Ruff check passed for $dir"
        else
            print_error "Ruff check failed for $dir"
            return 1
        fi
    done
    
    echo ""
    return 0
}

# ============================================================================
# Run Ruff formatter check
# ============================================================================

run_ruff_format_check() {
    print_header "Running Ruff Format Check"
    
    for dir in $SRC_DIRS; do
        if [ ! -d "$dir" ]; then
            continue
        fi
        
        print_info "Checking format: $dir"
        
        # Check if code is formatted (don't modify)
        if ruff format --check $dir \
            --line-length $RUFF_LINE_LENGTH \
            --exclude "$EXCLUDE_DIRS"; then
            print_success "Format check passed for $dir"
        else
            print_error "Format check failed for $dir"
            print_info "Run 'ruff format $dir' to fix formatting issues"
            return 1
        fi
    done
    
    echo ""
    return 0
}

# ============================================================================
# Run Flake8 linter
# ============================================================================

run_flake8() {
    print_header "Running Flake8 Linter"
    
    for dir in $SRC_DIRS; do
        if [ ! -d "$dir" ]; then
            continue
        fi
        
        print_info "Linting: $dir"
        
        # Run flake8
        if flake8 $dir \
            --max-line-length=$FLAKE8_MAX_LINE_LENGTH \
            --max-complexity=$FLAKE8_MAX_COMPLEXITY \
            --exclude="$EXCLUDE_DIRS" \
            --count \
            --statistics; then
            print_success "Flake8 check passed for $dir"
        else
            print_error "Flake8 check failed for $dir"
            return 1
        fi
    done
    
    echo ""
    return 0
}

# ============================================================================
# Check Python imports (isort - optional)
# ============================================================================

check_imports() {
    print_header "Checking Import Ordering (Optional)"
    
    if ! command -v isort &> /dev/null; then
        print_info "isort not installed - skipping import check"
        echo ""
        return 0
    fi
    
    for dir in $SRC_DIRS; do
        if [ ! -d "$dir" ]; then
            continue
        fi
        
        print_info "Checking imports: $dir"
        
        # Check import ordering (don't modify)
        if isort --check-only --diff $dir; then
            print_success "Import ordering is correct for $dir"
        else
            print_warning "Import ordering issues found in $dir"
            print_info "Run 'isort $dir' to fix import ordering"
            # Don't fail on import ordering issues
        fi
    done
    
    echo ""
    return 0
}

# ============================================================================
# Type checking with mypy (optional)
# ============================================================================

run_type_checking() {
    print_header "Type Checking with MyPy (Optional)"
    
    if ! command -v mypy &> /dev/null; then
        print_info "mypy not installed - skipping type checking"
        echo ""
        return 0
    fi
    
    for dir in $SRC_DIRS; do
        if [ ! -d "$dir" ]; then
            continue
        fi
        
        # Skip tests directory for mypy (often has more relaxed typing)
        if [[ "$dir" == "tests" ]]; then
            print_info "Skipping type checking for tests directory"
            continue
        fi
        
        print_info "Type checking: $dir"
        
        # Run mypy (informational only - don't fail build)
        if mypy $dir --ignore-missing-imports; then
            print_success "Type checking passed for $dir"
        else
            print_warning "Type checking issues found in $dir (non-blocking)"
        fi
    done
    
    echo ""
    return 0
}

# ============================================================================
# Generate linting report
# ============================================================================

generate_report() {
    print_header "Linting Summary"
    
    echo "Linting completed at: $(date)"
    echo ""
    
    if [ $TOTAL_FAILURES -eq 0 ]; then
        print_success "All linting checks passed!"
    else
        print_error "$TOTAL_FAILURES linting check(s) failed"
    fi
    
    echo ""
}

# ============================================================================
# Main execution
# ============================================================================

main() {
    print_header "Python Code Linting"
    echo "Source directories: $SRC_DIRS"
    echo "Python version: $(python --version 2>&1)"
    echo ""
    
    # Check dependencies
    check_dependencies
    
    # Track failures
    TOTAL_FAILURES=0
    
    # Run all linting checks
    run_ruff || TOTAL_FAILURES=$((TOTAL_FAILURES + 1))
    
    run_ruff_format_check || TOTAL_FAILURES=$((TOTAL_FAILURES + 1))
    
    run_flake8 || TOTAL_FAILURES=$((TOTAL_FAILURES + 1))
    
    # Optional checks (don't count failures)
    check_imports
    run_type_checking
    
    # Generate report
    generate_report
    
    # Exit with appropriate code
    if [ $TOTAL_FAILURES -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main
