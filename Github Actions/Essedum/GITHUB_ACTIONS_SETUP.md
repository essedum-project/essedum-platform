# GitHub Actions Setup Guide

Complete guide for setting up automated deployment to AWS EC2 using GitHub Actions.

## 🎯 Overview

This setup enables **fully automated deployment** to your AWS EC2 instance. Every time you push code to `main` or `develop` branch, GitHub Actions will:

1. ✅ Checkout your code
2. ✅ Run syntax checks
3. ✅ Connect to your EC2 instance via SSH
4. ✅ Install/update the application
5. ✅ Configure environment variables
6. ✅ Restart the service
7. ✅ Perform health checks
8. ✅ Report deployment status

## 📋 Prerequisites

- AWS EC2 instance running (with public IP address)
- SSH access to EC2 (username + password or key)
- GitHub repository
- Azure OpenAI API credentials (optional - can be added later)

## 🔧 Setup Steps

### Step 1: Configure EC2 Instance

**1.1 Ensure SSH Access**

Test SSH connection from your local machine:
```bash
ssh user@public_ip
# Enter password when prompted
```

**1.2 Install Required Software (if not already done)**

Connect to EC2 and run:
```bash
# Update system
sudo yum update -y

# Install Python 3.11 and Git
sudo yum install -y python3.11 python3.11-pip git

# Verify installation
python3.11 --version
git --version
```

**1.3 Configure Sudo Access (Important)**

Ensure your user can run `systemctl` commands without password:
```bash
# Add sudo permission for systemctl
echo "$USER ALL=(ALL) NOPASSWD: /bin/systemctl" | sudo tee -a /etc/sudoers.d/systemctl
sudo chmod 0440 /etc/sudoers.d/systemctl
```

### Step 2: Configure GitHub Repository Secrets

**2.1 Go to Repository Settings**
1. Open your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

**2.2 Add Required Secrets**

Add these secrets one by one:

**Required for Deployment:**
| Secret Name | Value | Example |
|------------|-------|---------||
| `EC2_HOST` | Your EC2 public IP address |  |
| `EC2_USERNAME` | SSH username | `` |
| `EC2_PASSWORD` | SSH password | `your-secure-password` |

**Optional (for AI features - can add later):**
| Secret Name | Value | Example |
|------------|-------|---------||
| `AZURE_OPENAI_API_KEY` | Your Azure OpenAI API key | `abc123...` |
| `AZURE_OPENAI_ENDPOINT` | Your Azure OpenAI endpoint | `https://your-resource.openai.azure.com/` |
| `AZURE_OPENAI_DEPLOYMENT` | Your deployment name | `gpt-4` |

**Note:** Without AI credentials:
- ✅ Infrastructure will deploy successfully
- ✅ Health endpoint will work
- ✅ API documentation will be accessible
- ❌ Query endpoint will return errors (AI not configured)
- 💡 Add AI secrets later and re-deploy to enable AI features

**Screenshot Guide:**
```
Settings → Secrets and variables → Actions → New repository secret
┌─────────────────────────────────────┐
│ Name: EC2_HOST                      │
│ Secret:               │
│                                     │
│ [Add secret]                        │
└─────────────────────────────────────┘
```

### Step 3: Verify Workflow File

The workflow file is already created at `.github/workflows/deploy-ec2.yml`

**Key Features:**
- ✅ Deploys on push to `main` or `develop` branches
- ✅ Can be triggered manually via "workflow_dispatch"
- ✅ Handles first-time setup automatically
- ✅ Updates existing installations
- ✅ Configures environment variables from secrets
- ✅ Performs health checks
- ✅ Shows deployment summary

### Step 4: Test the Deployment

**4.1 Make a Small Change**

Edit any file, for example `README.md`:
```bash
echo "# Test deployment" >> README.md
```

**4.2 Commit and Push**
```bash
git add .
git commit -m "test: trigger GitHub Actions deployment"
git push origin main
```

**4.3 Monitor Deployment**
1. Go to your GitHub repository
2. Click **Actions** tab
3. Click on the running workflow
4. Watch the deployment progress in real-time

**Expected Output:**
```
🚀 Starting deployment...
User: user
Directory: /home/user/agent-dk
📥 Cloning repository... (or Pulling latest code...)
🐍 Creating virtual environment...
📦 Installing dependencies...
🔐 Updating environment variables from secrets...
♻️ Restarting service...
✅ Deployment successful!
```

### Step 5: Verify Deployment

**5.1 Check Health Endpoint**
```bash
curl http://public_ip:8080/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "azure_configured": true,
  "openai_configured": false
}
```

**5.2 Test API Documentation**

Open in browser:
```
http://public_ip:8080/docs
```

**5.3 Test Query Endpoint**
```bash
curl -X POST http://public_ip:8080/query \
  -H "Content-Type: application/json" \
  -d '{"message": "What is machine learning?", "session_id": "test"}'
```

## 🔄 Deployment Workflow

### Automatic Deployment

Every push to `main` or `develop` triggers deployment:

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main
# ↓ GitHub Actions automatically deploys to EC2
```

### Manual Deployment

Trigger deployment manually without code changes:

1. Go to **Actions** tab in GitHub
2. Select **Deploy to AWS EC2** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

### Deployment Branches

- **main** → Production deployment
- **develop** → Development/staging deployment

## 📊 Monitoring Deployments

### GitHub Actions Dashboard

View all deployments:
1. Repository → **Actions** tab
2. See deployment history, status, and logs

### Deployment Status

Each deployment shows:
- ✅ **Success**: Green checkmark
- ❌ **Failed**: Red X
- 🟡 **In Progress**: Yellow dot

### Deployment Logs

Click on any workflow run to see:
- Checkout code logs
- Syntax check results
- SSH connection logs
- Deployment script output
- Health check results
- Deployment summary

### Deployment Summary

After each deployment, view summary with:
- Repository and branch
- Commit SHA
- EC2 host
- Access points (Health, API Docs, Query)

## 🚨 Troubleshooting

### SSH Connection Failed

**Error:** `Failed to connect to EC2 instance`

**Solutions:**
1. Verify `EC2_HOST` secret is correct
2. Check `EC2_USERNAME` matches your SSH user
3. Verify `EC2_PASSWORD` is correct
4. Ensure EC2 Security Group allows SSH from GitHub IPs
5. Test SSH manually: `ssh user@YOUR_EC2_IP`

### Service Failed to Start

**Error:** `Service failed to start`

**Solutions:**
1. Check logs in GitHub Actions output
2. SSH to EC2 and check: `sudo journalctl -u agent-dk -n 100`
3. Verify Python version: `python3.11 --version`
4. Check if port 8080 is available: `sudo netstat -tulpn | grep 8080`
5. Test manually:
   ```bash
   cd ~/agent-dk
   source venv/bin/activate
   python -m uvicorn src.main:app --host 0.0.0.0 --port 8080
   ```

### Health Check Failed

**Error:** `Health check failed`

**Solutions:**
1. Verify Security Group allows port 8080
2. Check if service is running: `sudo systemctl status agent-dk`
3. Test locally on EC2: `curl http://localhost:8080/health`
4. Check firewall rules: `sudo firewall-cmd --list-all`

### Environment Variables Not Updated

**Error:** Application not using correct API keys

**Solutions:**
1. Verify all secrets are set in GitHub
2. Check secret names match exactly (case-sensitive)
3. Re-run deployment
4. SSH to EC2 and verify: `cat ~/agent-dk/.env`
5. Restart service: `sudo systemctl restart agent-dk`

### Permission Denied

**Error:** `sudo: systemctl: command not found` or `permission denied`

**Solutions:**
1. Add sudo permission (Step 1.3 above)
2. Check user can run systemctl: `sudo systemctl status agent-dk`
3. Verify sudoers file: `sudo cat /etc/sudoers.d/systemctl`

## 🔐 Security Best Practices

### 1. Rotate Credentials Regularly

Update GitHub secrets periodically:
- SSH password every 90 days
- API keys when compromised
- Use strong passwords (20+ characters)

### 2. Restrict SSH Access

In AWS Security Group:
- Limit SSH (port 22) to specific IPs
- Use GitHub's IP ranges for Actions
- Consider using SSH keys instead of passwords

### 3. Use Environment-Specific Branches

- `main` → Production (with branch protection)
- `develop` → Testing/staging
- Require pull requests for `main`

### 4. Enable Branch Protection

In GitHub:
1. Settings → Branches
2. Add rule for `main`
3. Enable:
   - Require pull request reviews
   - Require status checks to pass
   - Require signed commits (optional)

### 5. Monitor Deployments

- Review Action logs regularly
- Set up notifications for failed deployments
- Use AWS CloudWatch for EC2 monitoring

## 📈 Advanced Features

### Adding AI Credentials Later

If you deployed without AI credentials, you can add them anytime:

**Step 1: Get Your Credentials**
- **Azure OpenAI**: Get from Azure Portal → Azure OpenAI Service
- **OpenAI**: Get from https://platform.openai.com/api-keys

**Step 2: Add GitHub Secrets**
1. Go to: Settings → Secrets and variables → Actions
2. Add these three secrets:
   - `AZURE_OPENAI_API_KEY`
   - `AZURE_OPENAI_ENDPOINT`
   - `AZURE_OPENAI_DEPLOYMENT`

**Step 3: Re-deploy**
Option A - Push any change:
```bash
git commit --allow-empty -m "chore: trigger deployment with AI credentials"
git push origin main
```

Option B - Manual trigger:
1. Go to Actions tab
2. Select "Deploy to AWS EC2" workflow
3. Click "Run workflow"

**Step 4: Verify AI Works**
```bash
curl -X POST http://public_ip:8080/query \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, are you working?", "session_id": "test"}'
```

### Multiple Environments

Create separate workflow files for different environments:

**`.github/workflows/deploy-production.yml`**
```yaml
on:
  push:
    branches: [ main ]
env:
  APP_NAME: agent-dk-prod
```

**`.github/workflows/deploy-staging.yml`**
```yaml
on:
  push:
    branches: [ develop ]
env:
  APP_NAME: agent-dk-staging
```

### Deployment Notifications

Add Slack/Discord notifications:

```yaml
- name: Notify Slack
  if: always()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "Deployment ${{ job.status }}: ${{ github.repository }}"
      }
```

### Rollback on Failure

Add automatic rollback:

```yaml
- name: Rollback on Failure
  if: failure()
  run: |
    ssh user@host "cd ~/agent-dk && git checkout HEAD~1"
```

### Database Migrations

Add migration step:

```yaml
- name: Run Migrations
  run: |
    cd ~/agent-dk
    source venv/bin/activate
    python manage.py migrate
```

## ✅ Deployment Checklist

**Infrastructure Setup:**
- [ ] EC2 instance running and accessible
- [ ] SSH access working (test manually)
- [ ] Sudo permissions configured for systemctl

**Required GitHub Secrets:**
- [ ] EC2_HOST
- [ ] EC2_USERNAME
- [ ] EC2_PASSWORD

**Optional GitHub Secrets (for AI features):**
- [ ] AZURE_OPENAI_API_KEY (add when available)
- [ ] AZURE_OPENAI_ENDPOINT (add when available)
- [ ] AZURE_OPENAI_DEPLOYMENT (add when available)

**Deployment Verification:**
- [ ] Workflow file present in `.github/workflows/deploy-ec2.yml`
- [ ] First deployment tested and successful
- [ ] Health endpoint accessible
- [ ] API documentation accessible
- [ ] Query endpoint tested (will work after AI secrets added)

## 🎯 Next Steps

1. **Test Complete Workflow**
   - Make a small change
   - Push to GitHub
   - Verify automatic deployment

2. **Setup Branch Protection**
   - Protect `main` branch
   - Require PR reviews

3. **Monitor First Week**
   - Watch deployment logs
   - Check application health
   - Review error rates

4. **Optimize Performance**
   - Review deployment time
   - Optimize dependencies
   - Consider caching

5. **Document Custom Changes**
   - Update README with your specifics
   - Document any custom configurations
   - Share with team

## 📞 Support

**GitHub Actions Issues:**
- Check Actions tab for error messages
- Review workflow syntax
- Verify secrets are set correctly

**EC2 Connection Issues:**
- Test SSH manually
- Check Security Group rules
- Verify instance is running

**Application Issues:**
- SSH to EC2 and check logs: `sudo journalctl -u agent-dk -f`
- Verify environment variables: `cat ~/agent-dk/.env`
- Test application manually: `cd ~/agent-dk && source venv/bin/activate && python -m uvicorn src.main:app`

---

**🎉 Congratulations!** You now have a fully automated CI/CD pipeline deploying your application to AWS EC2 via GitHub Actions!
