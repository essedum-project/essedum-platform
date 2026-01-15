# AWS EC2 Setup Checklist

Complete checklist for deploying Agent Development Kit to AWS EC2.

## ☑️ Pre-Deployment Checklist

### AWS Account Setup
- [ ] AWS account created and accessible
- [ ] AWS CLI installed locally (optional but recommended)
- [ ] AWS IAM user with EC2 permissions (if not using root)

### Repository Setup
- [ ] Code pushed to Git repository (GitHub/GitLab/Bitbucket)
- [ ] Repository is accessible (public or with deploy keys)
- [ ] `.gitignore` excludes `.env` file (security)

### API Keys Ready
- [ ] Azure OpenAI API key available
- [ ] Azure OpenAI endpoint URL available
- [ ] Azure OpenAI deployment name known
- [ ] OR OpenAI API key available (fallback)

## 🚀 EC2 Instance Setup

### 1. Launch EC2 Instance
- [ ] Logged into AWS Console → EC2 Dashboard
- [ ] Clicked "Launch Instance"
- [ ] **Name**: `agent-dk-server` (or your preferred name)
- [ ] **AMI**: Selected Amazon Linux 2023 or Amazon Linux 2
- [ ] **Instance Type**: Selected `t2.micro` (free tier) or `t3.small` (recommended)
- [ ] **Key Pair**: Created or selected SSH key pair
- [ ] **Downloaded key pair** (.pem file) to safe location

### 2. Configure Security Group
- [ ] Created new security group or selected existing
- [ ] **Rule 1 - SSH**: 
  - Type: SSH
  - Port: 22
  - Source: My IP (your IP address)
- [ ] **Rule 2 - Application**: 
  - Type: Custom TCP
  - Port: 8080
  - Source: 0.0.0.0/0 (or specific IPs)
- [ ] **Rule 3 - HTTPS** (optional for SSL):
  - Type: HTTPS
  - Port: 443
  - Source: 0.0.0.0/0

### 3. Storage Configuration
- [ ] Set root volume size (8 GB minimum, 20 GB recommended)
- [ ] Selected volume type (gp3 recommended)

### 4. Launch and Verify
- [ ] Clicked "Launch Instance"
- [ ] Instance state is "running"
- [ ] **Noted Public IPv4 address**: `___.___.___.___`
- [ ] **Noted Public IPv4 DNS** (optional): `ec2-___-___-___-___.compute.amazonaws.com`

## 🔌 SSH Connection Setup

### Password-based Authentication (Your Setup)
- [ ] Opened terminal (Mac/Linux) or PowerShell (Windows)
- [ ] Connected via SSH:
  ```bash
  ssh user@public_ip
  ```
- [ ] Entered password when prompted
- [ ] Connection successful ✅

### Key-based Authentication (Alternative)

**Windows Users:**
- [ ] Opened PowerShell
- [ ] Set key permissions:
  ```powershell
  icacls "path\to\your-key.pem" /inheritance:r
  icacls "path\to\your-key.pem" /grant:r "$($env:USERNAME):(R)"
  ```
- [ ] Connected via SSH:
  ```powershell
  ssh -i "path\to\your-key.pem" ec2-user@YOUR_EC2_PUBLIC_IP
  ```
- [ ] Connection successful ✅

**Linux/Mac Users:**
- [ ] Opened terminal
- [ ] Set key permissions:
  ```bash
  chmod 400 path/to/your-key.pem
  ```
- [ ] Connected via SSH:
  ```bash
  ssh -i path/to/your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
  ```
- [ ] Connection successful ✅

## 📦 Application Deployment

### Automated Deployment (Recommended)
- [ ] Connected to EC2 instance via SSH: `ssh user@public_ip`
- [ ] Downloaded deployment script:
  ```bash
  curl -o deploy_ec2.sh https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/scripts/deploy_ec2.sh
  ```
- [ ] Made script executable:
  ```bash
  chmod +x deploy_ec2.sh
  ```
- [ ] Set repository URL:
  ```bash
  export GIT_REPO="https://github.com/YOUR_USERNAME/YOUR_REPO.git"
  ```
- [ ] Ran deployment script:
  ```bash
  ./deploy_ec2.sh
  ```
- [ ] Deployment completed without errors ✅

### Manual Verification
- [ ] Application directory exists: `/home/user/agent-dk` (or `~/agent-dk`)
- [ ] Virtual environment created: `/home/user/agent-dk/venv`
- [ ] Dependencies installed successfully
- [ ] Systemd service created: `/etc/systemd/system/agent-dk.service`

## ⚙️ Configuration

### Environment Variables
- [ ] Opened .env file:
  ```bash
  nano ~/agent-dk/.env
  # or: sudo nano /home/user/agent-dk/.env
  ```
- [ ] Updated `AZURE_OPENAI_API_KEY` with actual key
- [ ] Updated `AZURE_OPENAI_ENDPOINT` with actual endpoint
- [ ] Updated `AZURE_OPENAI_DEPLOYMENT` with actual deployment name
- [ ] Set `ENVIRONMENT=production`
- [ ] Saved file (Ctrl+X, Y, Enter)
- [ ] Set proper permissions:
  ```bash
  chmod 600 ~/agent-dk/.env
  ```

### Service Configuration
- [ ] Restarted service after config change:
  ```bash
  sudo systemctl restart agent-dk
  ```
- [ ] Checked service status:
  ```bash
  sudo systemctl status agent-dk
  ```
- [ ] Service is "active (running)" ✅
- [ ] No errors in service status

## ✅ Verification & Testing

### Service Checks
- [ ] Service is running:
  ```bash
  sudo systemctl is-active agent-dk
  ```
- [ ] Service enabled on boot:
  ```bash
  sudo systemctl is-enabled agent-dk
  ```
- [ ] Logs show no errors:
  ```bash
  sudo journalctl -u agent-dk -n 50
  ```

### Application Testing
- [ ] Health endpoint responds locally:
  ```bash
  curl http://localhost:8080/health
  ```
- [ ] Root endpoint responds:
  ```bash
  curl http://localhost:8080/
  ```
- [ ] Test query endpoint:
  ```bash
  curl -X POST http://localhost:8080/query \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello, test query"}'
  ```

### External Access
- [ ] Opened browser
- [ ] Navigated to: `http://YOUR_EC2_PUBLIC_IP:8080/health`
- [ ] Received healthy response ✅
- [ ] Visited: `http://YOUR_EC2_PUBLIC_IP:8080/docs`
- [ ] API documentation loads (Swagger UI) ✅

## 🔐 Security Hardening (Optional but Recommended)

### SSL/HTTPS Setup
- [ ] Installed Nginx:
  ```bash
  sudo yum install -y nginx
  ```
- [ ] Installed Certbot:
  ```bash
  sudo yum install -y certbot python3-certbot-nginx
  ```
- [ ] Configured domain name to point to EC2 IP
- [ ] Generated SSL certificate:
  ```bash
  sudo certbot --nginx -d your-domain.com
  ```
- [ ] HTTPS working ✅

### Additional Security
- [ ] Changed SSH port from 22 (optional)
- [ ] Installed fail2ban (optional):
  ```bash
  sudo yum install -y fail2ban
  sudo systemctl enable fail2ban
  sudo systemctl start fail2ban
  ```
- [ ] Configured AWS CloudWatch for monitoring
- [ ] Set up AWS Systems Manager for secure access (SSM)

## 🔄 CI/CD Setup (Optional)

### GitHub Actions
- [ ] Opened GitHub repository settings
- [ ] Navigated to: Settings → Secrets and variables → Actions
- [ ] Added secret: `EC2_HOST` = Your EC2 public IP
- [ ] Added secret: `EC2_SSH_KEY` = Contents of your .pem file
- [ ] Workflow file exists: `.github/workflows/deploy-ec2.yml`
- [ ] Pushed code to main branch
- [ ] GitHub Actions workflow triggered successfully ✅
- [ ] Automatic deployment working ✅

## 📊 Monitoring Setup

### CloudWatch (AWS Native)
- [ ] Enabled detailed monitoring in EC2 console
- [ ] Installed CloudWatch agent (optional):
  ```bash
  wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
  sudo rpm -U ./amazon-cloudwatch-agent.rpm
  ```
- [ ] Configured CloudWatch alarms for:
  - [ ] CPU utilization
  - [ ] Memory usage
  - [ ] Disk space
  - [ ] Network traffic

### Application Monitoring
- [ ] Log rotation configured
- [ ] Health check endpoint accessible
- [ ] Error alerting configured (optional)

## 📝 Documentation

### Record Important Information
- [ ] **EC2 Instance ID**: `i-xxxxxxxxxxxxxxxxx`
- [ ] **Public IP**: `___.___.___.___`
- [ ] **Security Group ID**: `sg-xxxxxxxxxxxxxxxxx`
- [ ] **SSH Key Name**: `your-key-name.pem`
- [ ] **Application URL**: `http://YOUR_EC2_PUBLIC_IP:8080`
- [ ] **GitHub Repository**: `https://github.com/YOUR_USERNAME/YOUR_REPO`

### Team Documentation
- [ ] Updated README with deployment info
- [ ] Documented environment variables needed
- [ ] Created runbook for common operations
- [ ] Shared access credentials securely (if needed)

## 🎯 Post-Deployment Tasks

### Regular Maintenance
- [ ] Schedule regular updates:
  ```bash
  sudo yum update -y
  ```
- [ ] Monitor disk space usage:
  ```bash
  df -h
  ```
- [ ] Review logs periodically:
  ```bash
  sudo journalctl -u agent-dk --since "1 day ago"
  ```
- [ ] Test application functionality weekly

### Backup Strategy
- [ ] Configure EC2 snapshots (AWS Console → EC2 → Snapshots)
- [ ] Set up automated backups
- [ ] Test restore procedure
- [ ] Document backup locations

### Cost Monitoring
- [ ] Set up AWS billing alerts
- [ ] Review AWS Cost Explorer monthly
- [ ] Monitor EC2 instance usage
- [ ] Consider Reserved Instances for long-term (cost savings)

## ✅ Final Verification

- [ ] Application accessible from internet
- [ ] All endpoints responding correctly
- [ ] Logs clean (no critical errors)
- [ ] Service auto-starts on reboot (test with: `sudo reboot`)
- [ ] Team members can access application
- [ ] Documentation complete and shared
- [ ] Monitoring and alerts configured
- [ ] Backup strategy in place

## 🎉 Deployment Complete!

Congratulations! Your Agent Development Kit is now deployed on AWS EC2.

### Quick Reference Commands

**Service Management:**
```bash
sudo systemctl status agent-dk     # Check status
sudo systemctl restart agent-dk    # Restart service
sudo systemctl stop agent-dk       # Stop service
sudo journalctl -u agent-dk -f     # View live logs
```

**Application Updates:**
```bash
cd /home/ec2-user/agent-dk
./scripts/update_ec2.sh            # Run update script
```

**Access Points:**
- Health: http://YOUR_EC2_PUBLIC_IP:8080/health
- API Docs: http://YOUR_EC2_PUBLIC_IP:8080/docs
- Query: POST http://YOUR_EC2_PUBLIC_IP:8080/query

---

**Need Help?**
- Check logs: `sudo journalctl -u agent-dk -n 100`
- Review: [AWS_EC2_DEPLOYMENT.md](AWS_EC2_DEPLOYMENT.md)
- EC2 Documentation: https://docs.aws.amazon.com/ec2/
