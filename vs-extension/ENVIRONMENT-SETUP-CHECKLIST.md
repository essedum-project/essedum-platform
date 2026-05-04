# Environment Setup Checklist for New Deployment

> **Purpose**: Quick reference checklist for deploying Essedum VS Code Extension  
> **Version**: 1.0.40  
> **Last Updated**: April 2026

---

## 🎯 Quick Start

This checklist guides you through deploying the Essedum VS Code Extension in a new environment. Follow each step in order.

**Estimated Time**: 2-3 hours (first deployment)

---

## ✅ Phase 1: Prerequisites (30 min)

### Infrastructure

- [ ] Essedum AI Platform is running and accessible
  - [ ] API endpoint URL noted: `_______________________`
  - [ ] API version confirmed: v1 or later
  - [ ] Test API connectivity: `curl https://your-platform.com/api/aip/service/v1/pipelines/count`

- [ ] Keycloak server is running and accessible
  - [ ] Keycloak version: 18.x or later
  - [ ] Admin console URL: `_______________________`
  - [ ] Admin credentials available

- [ ] Network connectivity verified
  - [ ] Clients can reach Essedum Platform (HTTPS): ✓
  - [ ] Clients can reach Keycloak (HTTPS): ✓
  - [ ] Port 8085 available on client machines: ✓

### Development Environment

- [ ] Node.js installed (v18 or later)
  - [ ] Version check: `node --version` → `_______`
  - [ ] NPM installed: `npm --version` → `_______`

- [ ] VS Code installed for testing
  - [ ] Version 1.103.0 or higher
  - [ ] Version check: Help → About → `_______`

- [ ] Git repository cloned
  - [ ] Repository URL: `_______________________`
  - [ ] Branch: `main` or `_______`

---

## ✅ Phase 2: Keycloak Configuration (45 min)

### Create/Verify Realm

- [ ] Keycloak realm configured
  - [ ] Realm name: `____________` (default: `essedum`)
  - [ ] Realm enabled: ✓
  - [ ] Realm URL noted: `https://your-keycloak.com/realms/____________`

### Create OAuth Client

- [ ] Client created in Keycloak
  - [ ] Client ID: `____________` (default: `vscode-essedum-extension`)
  - [ ] Client Protocol: `openid-connect`
  - [ ] Client Type: **Public** (must be public, not confidential)
  - [ ] Client authentication: **OFF**
  - [ ] Standard flow enabled: **ON**
  - [ ] Implicit flow: **OFF**
  - [ ] Direct access grants: **OFF**

### Configure Redirect URIs

- [ ] Redirect URIs added:
  - [ ] `http://localhost:8085/callback`
  - [ ] `http://127.0.0.1:8085/callback`
  - [ ] Custom port if needed: `http://localhost:____/callback`

- [ ] Web origins added:
  - [ ] `http://localhost:8085`
  - [ ] `http://127.0.0.1:8085`
  - [ ] Custom port if needed: `http://localhost:____`

### Enable PKCE

- [ ] PKCE configured (Advanced Settings)
  - [ ] Proof Key for Code Exchange Code Challenge Method: **S256**
  - [ ] Verified in client settings: ✓

### Configure Token Lifespans

- [ ] Token settings configured
  - [ ] Access Token Lifespan: `______ seconds` (recommended: 3600 = 1 hour)
  - [ ] Refresh Token Lifespan: `______ seconds` (recommended: 28800 = 8 hours)
  - [ ] Client Session Idle: `______ seconds` (recommended: 1800 = 30 min)
  - [ ] Client Session Max: `______ seconds` (recommended: 28800 = 8 hours)

### Create Test User

- [ ] Test user created
  - [ ] Username: `____________`
  - [ ] Email: `____________`
  - [ ] Email verified: ✓
  - [ ] Password set: ✓
  - [ ] User enabled: ✓

### Test Keycloak Configuration

- [ ] Test authentication endpoint
  ```bash
  curl https://your-keycloak.com/realms/essedum/.well-known/openid-configuration
  ```
  - [ ] Returns JSON with endpoints: ✓

- [ ] Test JWKS endpoint
  ```bash
  curl https://your-keycloak.com/realms/essedum/protocol/openid-connect/certs
  ```
  - [ ] Returns JSON with keys: ✓

---

## ✅ Phase 3: Extension Configuration (30 min)

### Configure Environment File

- [ ] Navigate to extension directory
  ```bash
  cd /path/to/vs-extension
  ```

- [ ] Copy environment template
  ```bash
  cp src/config/environment.example.ts src/config/environment.ts
  ```

- [ ] Edit `src/config/environment.ts`
  
  - [ ] Network 1 configured:
    - [ ] Network ID: `____________` (e.g., `production`)
    - [ ] issuerUri: `https://____________/realms/____________`
    - [ ] jwkSetUri: `https://____________/realms/____________/protocol/openid-connect/certs`
    - [ ] clientId: `____________`
    - [ ] baseURL: `https://____________` (Essedum Platform)
  
  - [ ] Network 2 configured (if needed):
    - [ ] Network ID: `____________` (e.g., `development`)
    - [ ] issuerUri: `____________`
    - [ ] jwkSetUri: `____________`
    - [ ] clientId: `____________`
    - [ ] baseURL: `____________`

### Configure Network Selection UI

- [ ] Edit `src/auth/constants/auth-constants.ts`
  
  - [ ] Network 1 option added:
    ```typescript
    {
        id: '____________',
        name: '____________',
        description: '____________'
    }
    ```
  
  - [ ] Network 2 option added (if applicable):
    ```typescript
    {
        id: '____________',
        name: '____________',
        description: '____________'
    }
    ```

### Configure OAuth Port (Optional)

- [ ] Custom OAuth port needed? Yes / No
  
  If Yes:
  - [ ] Edit `src/auth/constants/oauth-constants.ts`
  - [ ] Change `DEFAULT_OAUTH_PORT` to: `______`
  - [ ] Updated Keycloak redirect URIs with new port: ✓
  - [ ] Verified port is not blocked by firewall: ✓

### Configure SSL (if needed)

- [ ] SSL configuration needed? Yes / No
  
  If Yes:
  - [ ] Self-signed certificates or custom CA? ___________
  - [ ] Edit `src/utils/ssl-config.util.ts`
  - [ ] Option chosen:
    - [ ] Trust system certificates only
    - [ ] Add custom CA certificate
    - [ ] Bypass SSL for specific networks (dev only!)
  - [ ] CA certificate added to `certs/` folder (if applicable)

---

## ✅ Phase 4: Build & Package (15 min)

### Install Dependencies

- [ ] Install NPM packages
  ```bash
  npm install
  ```
  - [ ] No errors during installation: ✓

### Build Extension

- [ ] Clean previous builds (optional)
  ```bash
  npm run clean
  ```

- [ ] Compile TypeScript
  ```bash
  npm run compile
  ```
  - [ ] Compilation successful: ✓
  - [ ] No errors in output: ✓

- [ ] Fix any TypeScript errors
  - [ ] All errors resolved: ✓

### Package Extension

- [ ] Install VSCE (if not installed)
  ```bash
  npm install -g @vscode/vsce
  ```

- [ ] Package as .vsix
  ```bash
  vsce package
  ```
  - [ ] .vsix file created: ✓
  - [ ] File name noted: `essedum-_______.vsix`
  - [ ] File size reasonable: ✓ (typically 1-5 MB)

---

## ✅ Phase 5: Testing (30 min)

### Install Extension Locally

- [ ] Install .vsix in test VS Code instance
  ```
  VS Code → Extensions → ... (More Actions) → Install from VSIX...
  ```
  - [ ] Installation successful: ✓
  - [ ] Essedum icon appears in Activity Bar: ✓

### Test Authentication Flow

- [ ] Click Essedum icon in Activity Bar
  - [ ] Login screen appears: ✓

- [ ] Select network from dropdown
  - [ ] Expected network appears: ✓
  - [ ] Network selection works: ✓

- [ ] Click Login button
  - [ ] Browser opens: ✓
  - [ ] Keycloak login page loads: ✓
  - [ ] Correct realm shown: ✓

- [ ] Enter test user credentials
  - [ ] Authentication successful: ✓
  - [ ] Browser shows success message: ✓
  - [ ] Redirects to VS Code: ✓

- [ ] Check VS Code
  - [ ] Navigation dashboard appears: ✓
  - [ ] No errors in Output panel (Essedum channel): ✓

### Test API Integration

- [ ] Test pipeline listing
  - [ ] Click Pipelines in navigation: ✓
  - [ ] Pipeline list loads: ✓
  - [ ] Pipelines displayed correctly: ✓

- [ ] Test pipeline details
  - [ ] Click View Details on a pipeline: ✓
  - [ ] Details load correctly: ✓
  - [ ] Scripts listed: ✓

- [ ] Test file opening
  - [ ] Click Open on a script file: ✓
  - [ ] File opens in editor: ✓
  - [ ] Syntax highlighting works: ✓
  - [ ] Can edit file: ✓
  - [ ] Can save file (Ctrl+S): ✓

- [ ] Test job logs (if applicable)
  - [ ] Navigate to Job Logs: ✓
  - [ ] Job list loads: ✓
  - [ ] Can view job details: ✓

### Test Token Refresh

- [ ] Wait for token to expire (or force expiration)
  - [ ] Token expiry time: ______ seconds

- [ ] Make API call after expiry
  - [ ] Extension detects expired token: ✓
  - [ ] Extension refreshes token automatically: ✓
  - [ ] API call succeeds: ✓
  - [ ] No re-authentication required: ✓

### Test Logout

- [ ] Click logout button
  - [ ] Logout successful: ✓
  - [ ] Returns to login screen: ✓
  - [ ] Tokens cleared from storage: ✓

---

## ✅ Phase 6: Distribution (Variable)

### Choose Distribution Method

- [ ] Distribution method selected:
  - [ ] Private extension marketplace
  - [ ] Manual distribution (.vsix file)
  - [ ] Public VS Code marketplace
  - [ ] Internal package repository

### Prepare Documentation

- [ ] End-user documentation prepared
  - [ ] Installation instructions: ✓
  - [ ] Login instructions: ✓
  - [ ] Feature overview: ✓
  - [ ] Troubleshooting guide: ✓

### Distribute Extension

**For Private Marketplace:**
- [ ] Upload .vsix to marketplace
- [ ] Test installation from marketplace
- [ ] Verify extension appears in search

**For Manual Distribution:**
- [ ] Copy .vsix to shared location
- [ ] Document installation process
- [ ] Notify users of availability

**For Public Marketplace:**
- [ ] Review VS Code marketplace guidelines
- [ ] Prepare marketplace listing (README, screenshots, etc.)
- [ ] Publish: `vsce publish`
- [ ] Verify listing on marketplace

---

## ✅ Phase 7: User Onboarding

### Communication

- [ ] Announcement sent to users
  - [ ] Installation instructions included: ✓
  - [ ] Network selection guidance: ✓
  - [ ] Support contact provided: ✓

### Training

- [ ] Training materials prepared
  - [ ] Demo recording available: ✓
  - [ ] User guide distributed: ✓
  - [ ] FAQ document created: ✓

### Support

- [ ] Support channels established
  - [ ] Email/ticket system: ___________
  - [ ] Slack/Teams channel: ___________
  - [ ] Issue tracker: ___________

---

## ✅ Phase 8: Monitoring & Maintenance

### Monitoring

- [ ] Usage monitoring set up
  - [ ] Keycloak user activity tracking: ✓
  - [ ] API endpoint usage logging: ✓

- [ ] Error monitoring
  - [ ] Keycloak error logs reviewed: ✓
  - [ ] Essedum Platform logs reviewed: ✓
  - [ ] User-reported issues tracked: ✓

### Maintenance Plan

- [ ] Update schedule defined
  - [ ] Frequency: ___________
  - [ ] Testing process: ___________
  - [ ] Deployment process: ___________

- [ ] Backup & Recovery
  - [ ] Keycloak configuration backed up: ✓
  - [ ] Extension source code backed up: ✓
  - [ ] Documentation backed up: ✓

---

## 🆘 Troubleshooting Reference

### Common Issues

| Issue | Check | Solution |
|-------|-------|----------|
| "Invalid redirect_uri" | Keycloak client redirect URIs | Must match exactly: `http://localhost:8085/callback` |
| "PKCE verification failed" | Keycloak client PKCE setting | Enable S256 in Advanced Settings |
| SSL certificate errors | SSL configuration | Add CA certificate or configure ssl-config.util.ts |
| Port 8085 in use | OAuth port configuration | Change port in oauth-constants.ts and Keycloak |
| 401 Unauthorized on API calls | Token validity | Check token expiry, verify API endpoint URL |
| Pipeline list doesn't load | Network connectivity | Verify base URL in environment.ts |

### Quick Diagnostics

```bash
# Test Keycloak connectivity
curl https://your-keycloak.com/realms/essedum/.well-known/openid-configuration

# Test Essedum Platform connectivity
curl https://your-platform.com/api/aip/service/v1/pipelines/count

# Check if port 8085 is available
netstat -an | grep 8085

# Test DNS resolution
nslookup your-keycloak.com
nslookup your-platform.com
```

### Getting Help

- **Documentation**: See DEPLOYMENT-GUIDE.md for detailed information
- **Keycloak**: See KEYCLOAK-INTEGRATION-GUIDE.md for OAuth configuration
- **Demo**: See DEMO-RECORDING-SCRIPT.md for feature walkthrough
- **Architecture**: See DESIGN-AND-IMPLEMENTATION.md for technical details

---

## 📋 Configuration Summary

Once completed, document your configuration:

```yaml
Deployment Name: ___________
Date: ___________

Keycloak:
  - Server URL: ___________
  - Realm: ___________
  - Client ID: ___________

Essedum Platform:
  - API Base URL: ___________
  - Version: ___________

Extension:
  - Version: 1.0.40
  - OAuth Port: ___________
  - Networks Configured: ___________

Testing:
  - Test User: ___________
  - Test Results: Pass / Fail
  - Issues Found: ___________
```

---

## ✨ Success Criteria

Your deployment is successful when:

- [ ] Users can install the extension without errors
- [ ] Users can authenticate successfully
- [ ] Users can view and manage pipelines
- [ ] Users can edit and save pipeline scripts
- [ ] Users can execute pipelines and view logs
- [ ] Token refresh works automatically
- [ ] No critical errors in logs
- [ ] User feedback is positive

---

**Congratulations on completing your deployment!** 🎉

For ongoing support and updates, refer to the complete documentation set in the repository.

---

**Document Version**: 1.0.40  
**Last Updated**: April 2026  
**Maintained By**: Essedum AI Platform Team
