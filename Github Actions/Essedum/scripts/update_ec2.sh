#!/bin/bash
# Quick update script for deployed application on EC2

set -e

# Auto-detect user and app directory
CURRENT_USER=$(whoami)
APP_DIR="${HOME}/agent-dk"
SERVICE_NAME="agent-dk"

echo "🔄 Updating application..."
echo "  User: ${CURRENT_USER}"
echo "  Directory: ${APP_DIR}"

cd "${APP_DIR}"

# Pull latest code
echo "📥 Pulling latest code from Git..."
git pull

# Activate virtual environment
source venv/bin/activate

# Update dependencies if requirements changed
echo "📦 Checking dependencies..."
pip install -r requirements.txt --upgrade

# Restart service
echo "♻️ Restarting service..."
sudo systemctl restart ${SERVICE_NAME}

# Wait a moment
sleep 2

# Check status
echo "✅ Checking service status..."
sudo systemctl status ${SERVICE_NAME} --no-pager -l

echo ""
echo "✅ Update complete!"
echo "View logs: sudo journalctl -u ${SERVICE_NAME} -f"
