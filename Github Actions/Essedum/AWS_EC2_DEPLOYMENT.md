# AWS EC2 Deployment Guide

Complete guide for deploying the Agent Development Kit (ADK) to AWS EC2 using ec2-user.

## 📋 Prerequisites

- AWS Account with EC2 access
- SSH key pair for EC2 access
- Azure OpenAI or OpenAI API credentials
- Git repository (GitHub, GitLab, etc.)

## 🚀 Quick Deployment

### Step 1: Launch EC2 Instance

1. **Log in to AWS Console**
   - Navigate to EC2 Dashboard
   - Click "Launch Instance"

2. **Configure Instance**
   ```
   Name: agent-dk-server
   AMI: Amazon Linux 2023 (recommended) or Amazon Linux 2
   Instance Type: t2.micro (free tier) or t3.small
   Key Pair: Select or create a key pair
   ```

3. **Configure Security Group**
   - Create or select a security group with these rules:
   
   | Type | Protocol | Port | Source | Description |
   |------|----------|------|--------|-------------|
   | SSH | TCP | 22 | Your IP | SSH access |
   | Custom TCP | TCP | 8080 | 0.0.0.0/0 | Application port |
   | HTTPS | TCP | 443 | 0.0.0.0/0 | Optional: for SSL |

4. **Storage**
   - 8 GB gp3 (minimum)
   - 20 GB gp3 (recommended for logs and data)

5. **Launch Instance**
   - Click "Launch Instance"
   - Wait for instance to be in "running" state
   - Note the Public IPv4 address

### Step 2: Connect to EC2 Instance

**Password-based Authentication (Recommended for your setup):**
```bash
# Connect via SSH (works on Mac/Linux/Windows)
ssh user@YOUR_EC2_PUBLIC_IP
# Enter password when prompted
```

**Key-based Authentication (Alternative):**

*Windows (using PowerShell):*
```powershell
# Set correct permissions
icacls "your-key.pem" /inheritance:r
icacls "your-key.pem" /grant:r "$($env:USERNAME):(R)"

# Connect via SSH
ssh -i "your-key.pem" ec2-user@YOUR_EC2_PUBLIC_IP
```

*Linux/Mac:*
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

### Step 3: Run Automated Deployment Script

Once connected to your EC2 instance:

```bash
# Download the deployment script
curl -o deploy_ec2.sh https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/scripts/deploy_ec2.sh

# Make it executable
chmod +x deploy_ec2.sh

# Set your Git repository URL
export GIT_REPO="https://github.com/YOUR_USERNAME/YOUR_REPO.git"

# Run the deployment
./deploy_ec2.sh
```

The script will:
- ✅ Update system packages
- ✅ Install Python 3.11
- ✅ Clone your repository
- ✅ Create virtual environment
- ✅ Install dependencies
- ✅ Create systemd service
- ✅ Configure firewall
- ✅ Start the application

### Step 4: Configure Environment Variables

Edit the `.env` file with your actual credentials:

```bash
# Open the environment file
sudo nano /home/ec2-user/agent-dk/.env
```

Update these critical values:
```bash
AZURE_OPENAI_API_KEY=your-actual-api-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
ENVIRONMENT=production
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 5: Restart Service

```bash
sudo systemctl restart agent-dk
```

### Step 6: Verify Deployment

```bash
# Check service status
sudo systemctl status agent-dk

# View real-time logs
sudo journalctl -u agent-dk -f

# Test the endpoint
curl http://localhost:8080/health
```

Access from your browser:
```
http://YOUR_EC2_PUBLIC_IP:8080
```

## 🔧 Manual Deployment (Alternative)

If you prefer manual setup:

### 1. Install Dependencies

```bash
# Update system
sudo yum update -y

# Install Python 3.11
sudo yum install -y python3.11 python3.11-pip git

# Verify installation
python3.11 --version
```

### 2. Clone Repository

```bash
# Create app directory (adjust path based on your user)
mkdir -p ~/agent-dk
cd ~/agent-dk

# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
```

### 3. Setup Virtual Environment

```bash
# Create virtual environment
python3.11 -m venv venv

# Activate it
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
# Copy template
cp env.template .env

# Edit with your values
nano .env
```

### 5. Create Systemd Service

```bash
# Replace 'user' with your actual username if different
sudo tee /etc/systemd/system/agent-dk.service > /dev/null <<EOF
[Unit]
Description=Agent Development Kit Service
After=network.target

[Service]
Type=simple
User=user
WorkingDirectory=/home/user/agent-dk
Environment="PATH=/home/user/agent-dk/venv/bin"
ExecStart=/home/user/agent-dk/venv/bin/uvicorn src.main:app --host 0.0.0.0 --port 8080
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

**Note:** Replace `user` with your actual username if different (check with `whoami` command).

### 6. Start Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service on boot
sudo systemctl enable agent-dk

# Start service
sudo systemctl start agent-dk

# Check status
sudo systemctl status agent-dk
```

## 📊 Management Commands

### Service Management

```bash
# Start service
sudo systemctl start agent-dk

# Stop service
sudo systemctl stop agent-dk

# Restart service
sudo systemctl restart agent-dk

# View status
sudo systemctl status agent-dk

# Enable on boot
sudo systemctl enable agent-dk

# Disable on boot
sudo systemctl disable agent-dk
```

### Logs and Monitoring

```bash
# View all logs
sudo journalctl -u agent-dk

# View last 50 lines
sudo journalctl -u agent-dk -n 50

# Follow logs in real-time
sudo journalctl -u agent-dk -f

# View logs since today
sudo journalctl -u agent-dk --since today

# View logs with timestamps
sudo journalctl -u agent-dk -o short-precise
```

### Application Management

```bash
# Update application
cd /home/ec2-user/agent-dk
git pull
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart agent-dk

# Update environment variables
sudo nano /home/ec2-user/agent-dk/.env
sudo systemctl restart agent-dk

# Check Python processes
ps aux | grep python
```

## 🔒 Security Best Practices

### 1. Secure Environment Variables

```bash
# Set proper permissions
chmod 600 /home/ec2-user/agent-dk/.env
```

### 2. Configure AWS Security Group

Restrict SSH access to your IP:
```
Type: SSH
Port: 22
Source: My IP (not 0.0.0.0/0)
```

### 3. Use IAM Roles (Recommended)

Instead of storing API keys in .env, use AWS Secrets Manager:

```bash
# Install AWS CLI
sudo yum install -y aws-cli

# Configure IAM role for EC2
# Then retrieve secrets programmatically
```

### 4. Enable HTTPS (Optional)

Use Nginx as reverse proxy with Let's Encrypt SSL:

```bash
# Install Nginx
sudo yum install -y nginx

# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Configure SSL
sudo certbot --nginx -d your-domain.com
```

## 🚨 Troubleshooting

### Service Won't Start

```bash
# Check service logs
sudo journalctl -u agent-dk -n 100

# Check if port is in use
sudo netstat -tulpn | grep 8080

# Verify Python path
/home/ec2-user/agent-dk/venv/bin/python --version

# Test manually
cd /home/ec2-user/agent-dk
source venv/bin/activate
python -m uvicorn src.main:app --host 0.0.0.0 --port 8080
```

### Permission Denied

```bash
# Fix ownership
sudo chown -R ec2-user:ec2-user /home/ec2-user/agent-dk

# Fix .env permissions
chmod 600 /home/ec2-user/agent-dk/.env
```

### Cannot Connect from Browser

```bash
# Check security group in AWS Console
# Ensure port 8080 is open

# Check if service is listening
sudo netstat -tulpn | grep 8080

# Check firewall (if enabled)
sudo firewall-cmd --list-all
```

### Python Dependencies Issues

```bash
cd /home/ec2-user/agent-dk
source venv/bin/activate

# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

## 📈 Scaling and Optimization

### 1. Use Larger Instance Type

For production workloads:
- **t3.small**: 2 vCPU, 2 GB RAM
- **t3.medium**: 2 vCPU, 4 GB RAM
- **c6i.large**: 2 vCPU, 4 GB RAM (compute-optimized)

### 2. Enable Auto Scaling

Use AWS Auto Scaling Groups for high availability.

### 3. Add Load Balancer

Use Application Load Balancer (ALB) for multiple instances.

### 4. Monitoring

```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
```

### 5. Database Integration

If using databases, consider:
- Amazon RDS for PostgreSQL
- Amazon DynamoDB for NoSQL
- Amazon ElastiCache for Redis

## 💰 Cost Optimization

### Free Tier Eligible Setup

- **EC2**: t2.micro (750 hours/month free)
- **EBS**: 30 GB storage
- **Data Transfer**: 100 GB/month outbound

### Estimated Costs (After Free Tier)

- **t2.micro**: ~$8.50/month
- **t3.small**: ~$15/month
- **t3.medium**: ~$30/month
- **EBS (20 GB)**: ~$2/month

## 🔄 CI/CD Integration

### GitHub Actions Deployment

Create `.github/workflows/deploy-ec2.yml`:

```yaml
name: Deploy to EC2

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ec2-user/agent-dk
            git pull
            source venv/bin/activate
            pip install -r requirements.txt
            sudo systemctl restart agent-dk
```

## 📞 Support

For issues or questions:
- Check logs: `sudo journalctl -u agent-dk -f`
- Verify configuration: `cat /home/ec2-user/agent-dk/.env`
- Test manually: Run uvicorn directly to see errors

## ✅ Post-Deployment Checklist

- [ ] EC2 instance launched and running
- [ ] Security group configured (ports 22, 8080)
- [ ] SSH access working
- [ ] Application deployed via script
- [ ] .env file configured with actual API keys
- [ ] Service running: `sudo systemctl status agent-dk`
- [ ] Application accessible via public IP
- [ ] Logs showing no errors
- [ ] Health endpoint responding: `curl http://localhost:8080/health`
- [ ] Production testing completed

## 🎯 Next Steps

1. **Setup Custom Domain**: Point a domain to your EC2 public IP
2. **Enable HTTPS**: Use Certbot for free SSL certificate
3. **Setup Monitoring**: Configure CloudWatch alarms
4. **Backup Strategy**: Regular snapshots of EBS volumes
5. **CI/CD Pipeline**: Automate deployments with GitHub Actions
