#!/bin/bash
# ============================================================================
# AWS EC2 Deployment Script for Agent Development Kit (ADK)
# ============================================================================

set -e  # Exit on error

echo "🚀 Starting AWS EC2 Deployment..."

# Detect current user (works for ec2-user, ubuntu, etc.)
CURRENT_USER=$(whoami)

# Configuration
APP_NAME="agent-dk"
APP_DIR="${HOME}/${APP_NAME}"
VENV_DIR="${APP_DIR}/venv"
SERVICE_NAME="agent-dk"

echo "📋 Configuration:"
echo "  User: ${CURRENT_USER}"
echo "  App Directory: ${APP_DIR}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Step 1: Update system packages
echo "📦 Updating system packages..."
sudo yum update -y
print_status "System packages updated"

# Step 2: Install Python 3.11 if not present
echo "🐍 Installing Python 3.11..."
if ! command -v python3.11 &> /dev/null; then
    sudo yum install -y python3.11 python3.11-pip
    print_status "Python 3.11 installed"
else
    print_status "Python 3.11 already installed"
fi

# Step 3: Install Git if not present
echo "📚 Checking Git installation..."
if ! command -v git &> /dev/null; then
    sudo yum install -y git
    print_status "Git installed"
else
    print_status "Git already installed"
fi

# Step 4: Create application directory
echo "📁 Setting up application directory..."
mkdir -p "${APP_DIR}"
print_status "Application directory created at ${APP_DIR}"

# Step 5: Clone or update repository
echo "🔄 Setting up code repository..."
if [ -d "${APP_DIR}/.git" ]; then
    cd "${APP_DIR}"
    git pull
    print_status "Repository updated"
else
    if [ -n "${GIT_REPO}" ]; then
        git clone "${GIT_REPO}" "${APP_DIR}"
        cd "${APP_DIR}"
        print_status "Repository cloned"
    else
        print_warning "GIT_REPO not set. Please manually copy code to ${APP_DIR}"
        exit 1
    fi
fi

# Step 6: Create virtual environment
echo "🔧 Creating Python virtual environment..."
if [ ! -d "${VENV_DIR}" ]; then
    python3.11 -m venv "${VENV_DIR}"
    print_status "Virtual environment created"
else
    print_status "Virtual environment already exists"
fi

# Step 7: Activate virtual environment and install dependencies
echo "📥 Installing Python dependencies..."
source "${VENV_DIR}/bin/activate"
pip install --upgrade pip
pip install -r requirements.txt
print_status "Dependencies installed"

# Step 8: Configure environment variables
echo "⚙️ Configuring environment..."
if [ ! -f "${APP_DIR}/.env" ]; then
    if [ -f "${APP_DIR}/env.template" ]; then
        cp "${APP_DIR}/env.template" "${APP_DIR}/.env"
        print_warning ".env file created from template. Please update with your actual values!"
    else
        print_error ".env file not found. Please create it manually."
        exit 1
    fi
else
    print_status ".env file already exists"
fi

# Step 9: Create systemd service
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null <<EOF
[Unit]
Description=Agent Development Kit Service
After=network.target

[Service]
Type=simple
User=${CURRENT_USER}
WorkingDirectory=${APP_DIR}
Environment="PATH=${VENV_DIR}/bin"
ExecStart=${VENV_DIR}/bin/uvicorn src.main:app --host 0.0.0.0 --port 8080
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

print_status "Systemd service created"

# Step 10: Reload systemd and enable service
echo "🔄 Enabling service..."
sudo systemctl daemon-reload
sudo systemctl enable ${SERVICE_NAME}
print_status "Service enabled"

# Step 11: Start the service
echo "▶️ Starting service..."
sudo systemctl restart ${SERVICE_NAME}
sleep 3

# Step 12: Check service status
if sudo systemctl is-active --quiet ${SERVICE_NAME}; then
    print_status "Service is running!"
else
    print_error "Service failed to start. Check logs with: sudo journalctl -u ${SERVICE_NAME} -n 50"
    exit 1
fi

# Step 13: Configure firewall (if firewalld is running)
if sudo systemctl is-active --quiet firewalld; then
    echo "🔥 Configuring firewall..."
    sudo firewall-cmd --permanent --add-port=8080/tcp
    sudo firewall-cmd --reload
    print_status "Firewall configured"
fi

echo ""
echo "============================================================================"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "============================================================================"
echo ""
echo "Service Status:"
sudo systemctl status ${SERVICE_NAME} --no-pager -l
echo ""
echo "Useful Commands:"
echo "  • View logs:     sudo journalctl -u ${SERVICE_NAME} -f"
echo "  • Restart:       sudo systemctl restart ${SERVICE_NAME}"
echo "  • Stop:          sudo systemctl stop ${SERVICE_NAME}"
echo "  • Check status:  sudo systemctl status ${SERVICE_NAME}"
echo ""
echo "Important Next Steps:"
echo "  1. Configure .env file with your API keys:"
echo "     sudo nano ${APP_DIR}/.env"
echo "  2. Restart service after updating .env:"
echo "     sudo systemctl restart ${SERVICE_NAME}"
echo "  3. Configure AWS Security Group to allow port 8080"
echo "  4. Access your app at: http://YOUR_EC2_PUBLIC_IP:8080"
echo ""
