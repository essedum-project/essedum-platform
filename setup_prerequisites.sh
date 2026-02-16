#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        log_warning "Running as root. This is not recommended for development."
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            OS=$ID
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    else
        log_error "Unsupported OS: $OSTYPE"
        exit 1
    fi
    log_info "Detected OS: $OS"
}

# Check version comparison
version_ge() {
    [ "$(printf '%s\n' "$1" "$2" | sort -V | head -n1)" = "$2" ]
}

# Install JDK 21
install_jdk() {
    log_info "Checking JDK installation..."
    
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
        if [ "$JAVA_VERSION" -ge 21 ]; then
            log_success "JDK $JAVA_VERSION is already installed"
            return 0
        else
            log_warning "JDK $JAVA_VERSION found, but version 21 or higher is required"
        fi
    fi
    
    log_info "Installing JDK 21..."
    
    case $OS in
        ubuntu|debian)
            sudo apt update
            sudo apt install -y openjdk-21-jdk
            ;;
        fedora|rhel|centos)
            sudo dnf install -y java-21-openjdk-devel
            ;;
        macos)
            if command -v brew &> /dev/null; then
                brew install openjdk@21
                sudo ln -sfn $(brew --prefix)/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk
            else
                log_error "Homebrew not found. Please install Homebrew first: https://brew.sh"
                exit 1
            fi
            ;;
        *)
            log_error "Automatic JDK installation not supported for $OS"
            log_info "Please install JDK 21 manually from: https://adoptium.net/"
            exit 1
            ;;
    esac
    
    if command -v java &> /dev/null; then
        log_success "JDK installed successfully"
        java -version
    else
        log_error "JDK installation failed"
        exit 1
    fi
}

# Install Maven
install_maven() {
    log_info "Checking Maven installation..."
    
    if command -v mvn &> /dev/null; then
        MVN_VERSION=$(mvn -version | grep "Apache Maven" | awk '{print $3}')
        if version_ge "$MVN_VERSION" "3.9.6"; then
            log_success "Maven $MVN_VERSION is already installed"
            return 0
        else
            log_warning "Maven $MVN_VERSION found, but version 3.9.6 or higher is required"
        fi
    fi
    
    log_info "Installing Maven 3.9.6..."
    
    case $OS in
        ubuntu|debian)
            sudo apt update
            sudo apt install -y maven
            # Check if installed version is sufficient, otherwise install manually
            if command -v mvn &> /dev/null; then
                MVN_VERSION=$(mvn -version | grep "Apache Maven" | awk '{print $3}')
                if ! version_ge "$MVN_VERSION" "3.9.6"; then
                    log_info "Installed Maven version is too old, installing manually..."
                    install_maven_manual
                fi
            fi
            ;;
        fedora|rhel|centos)
            sudo dnf install -y maven
            ;;
        macos)
            if command -v brew &> /dev/null; then
                brew install maven
            else
                log_error "Homebrew not found"
                exit 1
            fi
            ;;
        *)
            install_maven_manual
            ;;
    esac
    
    if command -v mvn &> /dev/null; then
        log_success "Maven installed successfully"
        mvn -version
    else
        log_error "Maven installation failed"
        exit 1
    fi
}

# Install Maven manually
install_maven_manual() {
    MAVEN_VERSION="3.9.6"
    MAVEN_URL="https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz"
    
    log_info "Installing Maven ${MAVEN_VERSION} manually..."
    
    cd /tmp
    wget -q $MAVEN_URL -O maven.tar.gz
    sudo tar -xzf maven.tar.gz -C /opt
    sudo ln -sf /opt/apache-maven-${MAVEN_VERSION} /opt/maven
    
    # Add to PATH
    if ! grep -q "MAVEN_HOME" ~/.bashrc; then
        echo "export MAVEN_HOME=/opt/maven" >> ~/.bashrc
        echo "export PATH=\$MAVEN_HOME/bin:\$PATH" >> ~/.bashrc
    fi
    
    export MAVEN_HOME=/opt/maven
    export PATH=$MAVEN_HOME/bin:$PATH
    
    rm maven.tar.gz
}

# Install MySQL
install_mysql() {
    log_info "Checking MySQL installation..."
    
    if command -v mysql &> /dev/null; then
        MYSQL_VERSION=$(mysql --version | awk '{print $5}' | cut -d',' -f1)
        if version_ge "$MYSQL_VERSION" "8.3"; then
            log_success "MySQL $MYSQL_VERSION is already installed"
            return 0
        else
            log_warning "MySQL $MYSQL_VERSION found, but version 8.3 or higher is required"
        fi
    fi
    
    log_info "Installing MySQL Server 8.3..."
    
    case $OS in
        ubuntu|debian)
            sudo apt update
            sudo apt install -y mysql-server
            sudo systemctl start mysql
            sudo systemctl enable mysql
            ;;
        fedora|rhel|centos)
            sudo dnf install -y mysql-server
            sudo systemctl start mysqld
            sudo systemctl enable mysqld
            ;;
        macos)
            if command -v brew &> /dev/null; then
                brew install mysql
                brew services start mysql
            else
                log_error "Homebrew not found"
                exit 1
            fi
            ;;
        *)
            log_error "Automatic MySQL installation not supported for $OS"
            log_info "Please install MySQL 8.3 manually from: https://dev.mysql.com/downloads/"
            exit 1
            ;;
    esac
    
    if command -v mysql &> /dev/null; then
        log_success "MySQL installed successfully"
        mysql --version
        log_info "Run 'sudo mysql_secure_installation' to secure your MySQL installation"
    else
        log_error "MySQL installation failed"
        exit 1
    fi
}

# Install Node.js and npm
install_nodejs() {
    log_info "Checking Node.js installation..."
    
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2)
        NPM_VERSION=$(npm -v)
        log_success "Node.js $NODE_VERSION and npm $NPM_VERSION are already installed"
        return 0
    fi
    
    log_info "Installing Node.js and npm..."
    
    case $OS in
        ubuntu|debian)
            # Install Node.js LTS via NodeSource - safer method
            log_info "Downloading NodeSource setup script..."
            curl -fsSL https://deb.nodesource.com/setup_lts.x -o /tmp/nodesource_setup.sh
            log_info "Verifying and running NodeSource setup..."
            sudo -E bash /tmp/nodesource_setup.sh
            rm -f /tmp/nodesource_setup.sh
            sudo apt install -y nodejs
            ;;
        fedora|rhel|centos)
            log_info "Downloading NodeSource setup script..."
            curl -fsSL https://rpm.nodesource.com/setup_lts.x -o /tmp/nodesource_setup.sh
            log_info "Verifying and running NodeSource setup..."
            sudo bash /tmp/nodesource_setup.sh
            rm -f /tmp/nodesource_setup.sh
            sudo dnf install -y nodejs
            ;;
        macos)
            if command -v brew &> /dev/null; then
                brew install node
            else
                log_error "Homebrew not found"
                exit 1
            fi
            ;;
        *)
            log_error "Automatic Node.js installation not supported for $OS"
            log_info "Please install Node.js manually from: https://nodejs.org/"
            exit 1
            ;;
    esac
    
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        log_success "Node.js and npm installed successfully"
        node -v
        npm -v
    else
        log_error "Node.js/npm installation failed"
        exit 1
    fi
}

# Install Python 3.12
install_python() {
    log_info "Checking Python installation..."
    
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | awk '{print $2}')
        PYTHON_MAJOR=$(echo "$PYTHON_VERSION" | cut -d'.' -f1)
        PYTHON_MINOR=$(echo "$PYTHON_VERSION" | cut -d'.' -f2)
        
        if [ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -ge 12 ]; then
            log_success "Python $PYTHON_VERSION is already installed"
            return 0
        else
            log_warning "Python $PYTHON_VERSION found, but version 3.12 or higher is required"
        fi
    fi
    
    log_info "Installing Python 3.12..."
    
    case $OS in
        ubuntu|debian)
            sudo apt update
            sudo apt install -y software-properties-common
            sudo add-apt-repository -y ppa:deadsnakes/ppa
            sudo apt update
            sudo apt install -y python3.12 python3.12-venv python3.12-dev python3-pip
            sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.12 1
            ;;
        fedora)
            sudo dnf install -y python3.12 python3.12-devel python3-pip
            ;;
        macos)
            if command -v brew &> /dev/null; then
                brew install python@3.12
                brew link python@3.12
            else
                log_error "Homebrew not found"
                exit 1
            fi
            ;;
        *)
            log_error "Automatic Python installation not supported for $OS"
            log_info "Please install Python 3.12 manually from: https://www.python.org/downloads/"
            exit 1
            ;;
    esac
    
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        log_success "Python installed successfully: $PYTHON_VERSION"
    else
        log_error "Python installation failed"
        exit 1
    fi
}

# Verify all installations
verify_installations() {
    log_info "Verifying all installations..."
    echo
    
    ALL_GOOD=true
    
    # Check JDK
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
        if [ "$JAVA_VERSION" -ge 21 ]; then
            log_success "✓ JDK $JAVA_VERSION"
        else
            log_error "✗ JDK version insufficient"
            ALL_GOOD=false
        fi
    else
        log_error "✗ JDK not found"
        ALL_GOOD=false
    fi
    
    # Check Maven
    if command -v mvn &> /dev/null; then
        MVN_VERSION=$(mvn -version | grep "Apache Maven" | awk '{print $3}')
        if version_ge "$MVN_VERSION" "3.9.6"; then
            log_success "✓ Maven $MVN_VERSION"
        else
            log_error "✗ Maven version insufficient"
            ALL_GOOD=false
        fi
    else
        log_error "✗ Maven not found"
        ALL_GOOD=false
    fi
    
    # Check MySQL
    if command -v mysql &> /dev/null; then
        MYSQL_VERSION=$(mysql --version | awk '{print $5}' | cut -d',' -f1)
        log_success "✓ MySQL $MYSQL_VERSION"
    else
        log_error "✗ MySQL not found"
        ALL_GOOD=false
    fi
    
    # Check Node.js and npm
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        NODE_VERSION=$(node -v)
        NPM_VERSION=$(npm -v)
        log_success "✓ Node.js $NODE_VERSION and npm $NPM_VERSION"
    else
        log_error "✗ Node.js/npm not found"
        ALL_GOOD=false
    fi
    
    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | awk '{print $2}')
        PYTHON_MAJOR=$(echo "$PYTHON_VERSION" | cut -d'.' -f1)
        PYTHON_MINOR=$(echo "$PYTHON_VERSION" | cut -d'.' -f2)
        
        if [ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -ge 12 ]; then
            log_success "✓ Python $PYTHON_VERSION"
        else
            log_error "✗ Python version insufficient"
            ALL_GOOD=false
        fi
    else
        log_error "✗ Python not found"
        ALL_GOOD=false
    fi
    
    echo
    if [ "$ALL_GOOD" = true ]; then
        log_success "All prerequisites are installed and meet the requirements!"
        echo
        log_info "You may need to restart your terminal or run 'source ~/.bashrc' for PATH changes to take effect"
    else
        log_error "Some prerequisites are missing or don't meet the requirements"
        exit 1
    fi
}

# Main installation flow
main() {
    echo "=========================================="
    echo "  Prerequisites Installation Script"
    echo "=========================================="
    echo
    
    detect_os
    
    echo
    log_info "This script will install the following prerequisites:"
    echo "  - JDK 21 or higher"
    echo "  - Maven 3.9.6 or higher"
    echo "  - MySQL Server 8.3 or higher"
    echo "  - Node.js and npm"
    echo "  - Python 3.12 or higher"
    echo
    
    read -p "Continue with installation? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Installation cancelled"
        exit 0
    fi
    
    echo
    install_jdk
    echo
    install_maven
    echo
    install_mysql
    echo
    install_nodejs
    echo
    install_python
    echo
    
    echo "=========================================="
    verify_installations
    echo "=========================================="
}

# Run main function
main