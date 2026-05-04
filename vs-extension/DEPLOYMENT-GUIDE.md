# Essedum VS Code Extension - Deployment & Customization Guide

> **Audience**: DevOps Engineers, System Administrators, and Technical Leads  
> **Purpose**: Complete guide for deploying and customizing the extension in new environments  
> **Version**: 1.0.40  
> **Last Updated**: April 2026

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture & Integration](#architecture--integration)
4. [Keycloak Integration](#keycloak-integration)
5. [Environment Configuration](#environment-configuration)
6. [Deployment Steps](#deployment-steps)
7. [Customization Guide](#customization-guide)
8. [Troubleshooting](#troubleshooting)
9. [Security Considerations](#security-considerations)
10. [Testing & Validation](#testing--validation)

---

## 1. Overview

### 1.1 What is the Essedum VS Code Extension?

The Essedum VS Code Extension is an enterprise-grade integration that connects Visual Studio Code with the Essedum AI Platform, enabling developers to:

- **Authenticate** via OAuth 2.0 with PKCE flow using Keycloak
- **Manage AI Pipelines** directly from the IDE
- **Execute and Monitor** pipeline jobs in real-time
- **Edit Pipeline Scripts** with full IDE capabilities
- **Manage AI Agents** and MCP (Model Context Protocol) servers
- **Upload/Download Code** seamlessly between IDE and platform

### 1.2 Deployment Scope

This guide covers:

✅ Setting up Keycloak OAuth integration  
✅ Configuring environment-specific settings  
✅ SSL/TLS certificate management  
✅ Network configuration for multiple environments  
✅ Extension packaging and distribution  
✅ Testing and validation procedures  

---

## 2. Prerequisites

### 2.1 Infrastructure Requirements

#### Essedum AI Platform
- **Version**: Compatible with Essedum AI Platform v1.0 or later
- **API Access**: REST API endpoints accessible from client machines
- **Network**: HTTPS connectivity to the platform (port 443 or custom)

#### Keycloak Server
- **Version**: Keycloak 18.x or later (supports OAuth 2.0 with PKCE)
- **Realm**: Configured realm for Essedum authentication
- **Client**: Public client configured for the VS Code extension

#### Client Requirements
- **VS Code**: Version 1.103.0 or higher
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **Network Access**: 
  - HTTPS to Essedum Platform
  - HTTPS to Keycloak Server
  - Port 8085 (default, configurable) for OAuth callback
- **Node.js**: v18.x or later (for development/building)

### 2.2 Access Requirements

You will need:

- ✅ Keycloak admin access to create/configure clients
- ✅ Access to Essedum Platform API documentation
- ✅ Network firewall rules (if applicable)
- ✅ SSL certificates (if using custom CAs)
- ✅ Test user accounts in Keycloak

---

## 3. Architecture & Integration

### 3.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     VS Code Client                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         Essedum VS Code Extension                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  Auth Layer  │  │   Services   │  │   WebViews   │  │  │
│  │  │  (OAuth)     │  │   Layer      │  │   (UI)       │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────────┘  │  │
│  │         │                  │                             │  │
│  │         │                  │                             │  │
│  └─────────┼──────────────────┼─────────────────────────────┘  │
│            │                  │                                │
└────────────┼──────────────────┼────────────────────────────────┘
             │                  │
             │                  │ HTTPS/REST
             │                  │
             │                  ▼
             │      ┌─────────────────────────┐
             │      │  Essedum AI Platform    │
             │      │  ┌───────────────────┐  │
             │      │  │   REST API        │  │
             │      │  │   (/api/aip/...)  │  │
             │      │  └───────────────────┘  │
             │      └─────────────────────────┘
             │
             │ OAuth 2.0 + PKCE
             │
             ▼
┌──────────────────────────────┐
│     Keycloak Server          │
│  ┌────────────────────────┐  │
│  │   Realm: essedum       │  │
│  │   Client: vscode-ext   │  │
│  │   Flow: Authorization  │  │
│  │         Code + PKCE    │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

### 3.2 Authentication Flow

The extension uses **OAuth 2.0 Authorization Code Flow with PKCE**:

```
┌─────────┐                                                ┌──────────┐
│ VS Code │                                                │ Keycloak │
└────┬────┘                                                └────┬─────┘
     │                                                          │
     │ 1. Generate code_verifier & code_challenge              │
     │    (PKCE parameters)                                    │
     │                                                          │
     │ 2. Start local callback server (port 8085)             │
     │                                                          │
     │ 3. Open browser with authorization URL                  │
     │    ───────────────────────────────────────────────────> │
     │    + client_id                                          │
     │    + redirect_uri (http://localhost:8085/callback)      │
     │    + code_challenge                                     │
     │    + code_challenge_method=S256                         │
     │                                                          │
     │                    4. User authenticates                │
     │                    <───────────────────>                │
     │                                                          │
     │ 5. Redirect with authorization code                     │
     │    <─────────────────────────────────────────────────── │
     │    http://localhost:8085/callback?code=...              │
     │                                                          │
     │ 6. Exchange code for tokens                             │
     │    ───────────────────────────────────────────────────> │
     │    + authorization_code                                 │
     │    + code_verifier                                      │
     │                                                          │
     │ 7. Receive access_token & refresh_token                 │
     │    <─────────────────────────────────────────────────── │
     │                                                          │
     │ 8. Store tokens securely (VS Code SecretStorage)       │
     │                                                          │
     │ 9. Use access_token for API calls                       │
     │                                                          │
     │ 10. Refresh token when expired                          │
     │     (automatic, transparent to user)                    │
     │                                                          │
```

### 3.3 API Integration Points

The extension integrates with the following Essedum API endpoints:

| Endpoint Category | Base Path | Purpose |
|------------------|-----------|---------|
| **Pipelines** | `/api/aip/service/v1/pipelines` | List, search, and manage pipelines |
| **Pipeline Execution** | `/api/aip/service/v1/pipeline/run-pipeline` | Execute pipeline jobs |
| **Job Logs** | `/api/aip/service/v1/events` | Fetch job status and logs |
| **File Operations** | `/api/aip/service/v1/file` | Read/write pipeline scripts |
| **Folder Operations** | `/api/aip/service/v1/folder` | Upload/download code folders |
| **Streaming Services** | `/api/aip/service/v1/streaming-services` | Manage MCP servers |
| **Pipeline Agents** | `/api/aip/service/v1/agent` | Agent configuration |
| **GitHub Integration** | `/api/aip/service/v1/github` | Pull code from GitHub |

All API calls:
- Use **Bearer token authentication** (OAuth access token)
- Accept/Return **JSON** format
- Use **HTTPS** (configurable SSL validation)
- Include **automatic retry logic** for network failures

---

## 4. Keycloak Integration

### 4.1 Keycloak Configuration

#### Step 1: Create a Realm (if not exists)

1. Log into Keycloak Admin Console
2. Click **"Add Realm"** or use existing realm
3. Recommended name: `essedum` (configurable)

#### Step 2: Create the Client

1. Navigate to **Clients** → **Create Client**
2. Configure the following:

```yaml
Client ID: vscode-essedum-extension
Client Protocol: openid-connect
Client Type: Public
Access Type: public

# Disable these for public client
Standard Flow Enabled: ✓ (Authorization Code Flow)
Direct Access Grants: ✗
Implicit Flow: ✗
Service Accounts: ✗
```

#### Step 3: Configure Valid Redirect URIs

Add the following redirect URIs:

```
http://localhost:8085/callback
http://127.0.0.1:8085/callback
```

**Note**: The port `8085` is the default but can be customized. Update accordingly.

#### Step 4: Configure Web Origins

Add:
```
http://localhost:8085
http://127.0.0.1:8085
```

#### Step 5: Enable PKCE

In **Advanced Settings**:
```yaml
Proof Key for Code Exchange Code Challenge Method: S256
```

#### Step 6: Configure Token Settings

```yaml
Access Token Lifespan: 1 hour (3600 seconds)
Refresh Token Lifespan: 8 hours (28800 seconds)
Client Session Idle: 30 minutes
Client Session Max: 8 hours
```

### 4.2 Keycloak Client Configuration Export

Here's a complete client configuration (JSON export):

```json
{
  "clientId": "vscode-essedum-extension",
  "name": "Essedum VS Code Extension",
  "description": "OAuth client for Essedum VS Code Extension",
  "rootUrl": "",
  "adminUrl": "",
  "baseUrl": "",
  "surrogateAuthRequired": false,
  "enabled": true,
  "alwaysDisplayInConsole": false,
  "clientAuthenticatorType": "client-secret",
  "redirectUris": [
    "http://localhost:8085/callback",
    "http://127.0.0.1:8085/callback"
  ],
  "webOrigins": [
    "http://localhost:8085",
    "http://127.0.0.1:8085"
  ],
  "notBefore": 0,
  "bearerOnly": false,
  "consentRequired": false,
  "standardFlowEnabled": true,
  "implicitFlowEnabled": false,
  "directAccessGrantsEnabled": false,
  "serviceAccountsEnabled": false,
  "publicClient": true,
  "frontchannelLogout": false,
  "protocol": "openid-connect",
  "attributes": {
    "pkce.code.challenge.method": "S256",
    "post.logout.redirect.uris": "+",
    "oauth2.device.authorization.grant.enabled": false,
    "backchannel.logout.revoke.offline.tokens": false,
    "use.refresh.tokens": true,
    "oidc.ciba.grant.enabled": false,
    "backchannel.logout.session.required": true,
    "client_credentials.use_refresh_token": false,
    "require.pushed.authorization.requests": false,
    "display.on.consent.screen": false
  },
  "authenticationFlowBindingOverrides": {},
  "fullScopeAllowed": true,
  "nodeReRegistrationTimeout": -1,
  "defaultClientScopes": [
    "web-origins",
    "acr",
    "profile",
    "roles",
    "email"
  ],
  "optionalClientScopes": [
    "address",
    "phone",
    "offline_access",
    "microprofile-jwt"
  ]
}
```

### 4.3 Testing Keycloak Configuration

Use this curl command to test the token endpoint:

```bash
# Test authorization endpoint (should return HTML login page)
curl -v https://your-keycloak.com/realms/essedum/protocol/openid-connect/auth

# Test token endpoint discovery
curl https://your-keycloak.com/realms/essedum/.well-known/openid-configuration

# Verify JWKS endpoint
curl https://your-keycloak.com/realms/essedum/protocol/openid-connect/certs
```

---

## 5. Environment Configuration

### 5.1 Configuration Files Overview

The extension uses two configuration files:

| File | Purpose | Committed to Git? |
|------|---------|-------------------|
| `src/config/environment.example.ts` | Template with placeholders | ✅ Yes |
| `src/config/environment.ts` | Actual configuration values | ❌ No (gitignored) |

### 5.2 Step-by-Step Configuration

#### Step 1: Copy the Template

```bash
cd src/config
cp environment.example.ts environment.ts
```

#### Step 2: Configure Network Environments

Edit `environment.ts`:

```typescript
export const environment: EnvironmentConfig = {
    networks: {
        // Network 1: Production Environment
        production: {
            // Keycloak issuer URI
            issuerUri: 'https://keycloak.yourcompany.com:8443/realms/essedum',
            
            // JWKS URI for token validation
            jwkSetUri: 'https://keycloak.yourcompany.com:8443/realms/essedum/protocol/openid-connect/certs',
            
            // OAuth Client ID (must match Keycloak)
            clientId: 'vscode-essedum-extension',
            
            // Essedum Platform API Base URL
            baseURL: 'https://essedum.yourcompany.com'
        },
        
        // Network 2: Development/Staging Environment
        development: {
            issuerUri: 'https://keycloak-dev.yourcompany.com:8443/realms/essedum-dev',
            jwkSetUri: 'https://keycloak-dev.yourcompany.com:8443/realms/essedum-dev/protocol/openid-connect/certs',
            clientId: 'vscode-essedum-extension-dev',
            baseURL: 'https://essedum-dev.yourcompany.com'
        }
    }
};
```

#### Step 3: Add Network to UI Selection

Edit `src/auth/constants/auth-constants.ts`:

```typescript
export const NETWORK_OPTIONS: readonly NetworkConfig[] = [
    {
        id: 'production',
        name: 'Production Environment',
        description: 'Production Essedum Platform'
    },
    {
        id: 'development',
        name: 'Development Environment',
        description: 'Development/Testing Essedum Platform'
    }
] as const;
```

### 5.3 Configuration Parameters Explained

| Parameter | Description | Example |
|-----------|-------------|---------|
| `issuerUri` | Keycloak realm URL | `https://keycloak.com:8443/realms/essedum` |
| `jwkSetUri` | Public key endpoint for token validation | `{issuerUri}/protocol/openid-connect/certs` |
| `clientId` | OAuth client ID configured in Keycloak | `vscode-essedum-extension` |
| `baseURL` | Essedum Platform API base URL | `https://essedum.company.com` |

### 5.4 Optional: Custom OAuth Port

Users can customize the OAuth callback port in VS Code settings:

```json
{
  "essedum.auth.oauthPort": 8085
}
```

To change the default, edit `src/auth/constants/oauth-constants.ts`:

```typescript
export const DEFAULT_OAUTH_PORT = 8085; // Change this
```

---

## 6. Deployment Steps

### 6.1 Building the Extension

#### Prerequisites
```bash
# Install Node.js (v18 or later)
node --version  # Should output v18.x or higher

# Install dependencies
npm install
```

#### Build for Production

```bash
# Clean build
npm run clean

# Compile TypeScript and bundle with webpack
npm run compile

# Or use watch mode during development
npm run watch
```

#### Package the Extension

```bash
# Install vsce (VS Code Extension packager)
npm install -g @vscode/vsce

# Package the extension (.vsix file)
vsce package
```

This creates a file like `essedum-1.0.40.vsix`.

### 6.2 Distribution Options

#### Option 1: Private Extension Marketplace (Recommended for Enterprise)

1. Set up an internal VS Code extensions marketplace
2. Upload the `.vsix` file
3. Users install via VS Code Extensions view

#### Option 2: Manual Distribution

1. Share the `.vsix` file via internal file sharing
2. Users install manually:
   ```
   VS Code → Extensions → ... (More Actions) → Install from VSIX...
   ```

#### Option 3: Public Marketplace (if applicable)

```bash
# Login to VS Code marketplace
vsce login your-publisher-name

# Publish
vsce publish
```

### 6.3 Post-Deployment Configuration

After installation, users need to:

1. **Open VS Code**
2. **Click Essedum icon** in Activity Bar
3. **Select Network** from dropdown
4. **Click Login** button
5. **Authenticate** in browser
6. **Return to VS Code** - authenticated!

---

## 7. Customization Guide

### 7.1 Adding New Networks

To add support for a new environment:

1. **Update `environment.ts`**:
```typescript
networks: {
    // ...existing networks
    newEnvironment: {
        issuerUri: 'https://new-keycloak.com/realms/realm',
        jwkSetUri: 'https://new-keycloak.com/realms/realm/protocol/openid-connect/certs',
        clientId: 'new-client-id',
        baseURL: 'https://new-essedum.com'
    }
}
```

2. **Update `auth-constants.ts`**:
```typescript
export const NETWORK_OPTIONS: readonly NetworkConfig[] = [
    // ...existing options
    {
        id: 'newEnvironment',
        name: 'New Environment',
        description: 'Description for users'
    }
] as const;
```

3. **Rebuild and redeploy** the extension

### 7.2 Customizing SSL Validation

For environments with self-signed certificates or custom CAs:

#### Option 1: Trust System Certificates

Edit `src/utils/ssl-config.util.ts`:

```typescript
export function shouldBypassSSL(network: NetworkType): boolean {
    // Bypass SSL for specific networks
    return network === 'development';
}
```

#### Option 2: Add Custom CA Certificates

1. Place certificate in `certs/` folder
2. Edit `src/utils/ssl-config.util.ts`:

```typescript
import * as fs from 'fs';
import * as path from 'path';

const customCA = fs.readFileSync(path.join(__dirname, '../../certs/custom-ca.crt'));

export function createHTTPSAgent(network: NetworkType): https.Agent {
    return new https.Agent({
        ca: customCA,
        rejectUnauthorized: true
    });
}
```

### 7.3 Customizing Branding

#### Change Extension Name

Edit `package.json`:
```json
{
  "name": "your-company-platform",
  "displayName": "Your Company Platform",
  "description": "VS Code extension for Your Company AI Platform"
}
```

#### Change Extension Icon

1. Replace `media/icon.png` with your logo (128x128 px)
2. Update `package.json`:
```json
{
  "icon": "media/icon.png"
}
```

#### Customize UI Colors

Edit CSS files in `src/app/*/`:
- `login-screen.css`
- `navigation-screen.css`
- `pipeline-cards.css`
- etc.

### 7.4 Adding Custom API Endpoints

To integrate additional API endpoints:

1. **Edit `src/constants/api-config.ts`**:
```typescript
export function getApiEndpoints(): ApiEndpoints {
    const apiBaseUrl = getApiBaseUrl();
    
    return {
        // ...existing endpoints
        CUSTOM_ENDPOINT: `${apiBaseUrl}/custom/endpoint`
    };
}
```

2. **Create/Update Service**:
```typescript
// src/services/custom.service.ts
export class CustomService {
    async callCustomEndpoint(): Promise<any> {
        const endpoints = getApiEndpoints();
        const response = await fetch(endpoints.CUSTOM_ENDPOINT, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.json();
    }
}
```

---

## 8. Troubleshooting

### 8.1 Common Issues

#### Issue: "Failed to authenticate"

**Cause**: Keycloak configuration mismatch

**Solution**:
1. Verify `issuerUri` matches Keycloak realm URL exactly
2. Check redirect URIs in Keycloak client match `http://localhost:8085/callback`
3. Ensure client is **Public** and PKCE is enabled
4. Check network connectivity to Keycloak server

#### Issue: "SSL Certificate Error"

**Cause**: Self-signed or untrusted certificate

**Solution**:
1. Add CA certificate to system trust store, OR
2. Configure SSL bypass for specific network (see [7.2](#72-customizing-ssl-validation))

#### Issue: "Port 8085 already in use"

**Cause**: Another application using the OAuth callback port

**Solution**:
1. Configure custom port: `"essedum.auth.oauthPort": 8086`
2. Update Keycloak redirect URIs accordingly

#### Issue: "API calls return 401 Unauthorized"

**Cause**: Token expired or invalid

**Solution**:
1. Extension should auto-refresh - check logs
2. Manually logout and login again
3. Verify token in VS Code Output panel (Essedum channel)

### 8.2 Debug Logging

Enable debug logging:

1. Open VS Code **Output** panel (`Ctrl+Shift+U`)
2. Select **"Essedum"** from dropdown
3. Check for error messages and stack traces

View logs in TypeScript:
```typescript
const logger = ExtensionUtils.createLogger('ComponentName');
logger.info('Debug message');
logger.error('Error message', error);
```

### 8.3 Network Diagnostics

Test connectivity:

```bash
# Test Keycloak
curl https://your-keycloak.com/realms/essedum/.well-known/openid-configuration

# Test Essedum API
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-essedum.com/api/aip/service/v1/pipelines/count
```

---

## 9. Security Considerations

### 9.1 Token Storage

- **Access tokens** and **refresh tokens** are stored in **VS Code SecretStorage**
- SecretStorage uses OS-level encryption:
  - **Windows**: Windows Credential Manager
  - **macOS**: Keychain
  - **Linux**: libsecret
- Tokens are **never** logged or written to disk in plain text

### 9.2 PKCE Flow

- Prevents authorization code interception attacks
- `code_verifier` generated client-side with 256 bits of entropy
- `code_challenge` computed using SHA-256 hash

### 9.3 Network Security

- All API calls use **HTTPS** (TLS 1.2 or higher)
- SSL certificate validation enabled by default
- Custom CA support for enterprise PKI

### 9.4 Recommended Security Policies

1. **Enable token rotation** in Keycloak
2. **Set short access token lifespans** (1 hour recommended)
3. **Enable refresh token reuse detection** in Keycloak
4. **Audit OAuth client access** regularly
5. **Use network policies** to restrict API access

---

## 10. Testing & Validation

### 10.1 Pre-Deployment Checklist

- [ ] Keycloak client created and configured
- [ ] Redirect URIs match exactly
- [ ] `environment.ts` configured with correct URLs
- [ ] Extension builds without errors (`npm run compile`)
- [ ] `.vsix` package created successfully
- [ ] Test user account available in Keycloak

### 10.2 Deployment Validation

After deploying:

#### Test 1: Extension Activation
- [ ] Extension appears in Extensions list
- [ ] Essedum icon visible in Activity Bar
- [ ] No errors in Output panel

#### Test 2: Authentication Flow
- [ ] Network selection dropdown shows configured networks
- [ ] Login button redirects to browser
- [ ] Keycloak login page loads correctly
- [ ] Authentication succeeds and returns to VS Code
- [ ] Success message displayed

#### Test 3: API Integration
- [ ] Navigation dashboard loads
- [ ] Pipeline list displays
- [ ] Can view pipeline details
- [ ] Can open pipeline scripts in editor

#### Test 4: Token Refresh
- [ ] Wait for token to expire (or force expiration)
- [ ] Verify automatic refresh triggers
- [ ] No re-authentication required

### 10.3 User Acceptance Testing

Create test scenarios:

1. **First-time user**: Install, authenticate, view pipelines
2. **Returning user**: Launch VS Code, verify auto-authentication
3. **Multi-network user**: Switch between networks
4. **Pipeline execution**: Run a pipeline, view logs
5. **Code upload**: Upload code folder to platform

---

## Appendix A: File Structure Reference

```
vs-extension/
├── src/
│   ├── extension.ts              # Main entry point
│   ├── config/
│   │   ├── environment.ts        # ⚠️ CONFIGURE THIS (gitignored)
│   │   └── environment.example.ts # Template
│   ├── auth/
│   │   ├── index.ts
│   │   ├── constants/
│   │   │   ├── auth-constants.ts  # ⚙️ Network options
│   │   │   └── oauth-constants.ts # ⚙️ OAuth settings
│   │   ├── services/
│   │   │   └── keycloak-auth.service.ts
│   │   └── servers/
│   │       └── oauth-auth.server.ts
│   ├── constants/
│   │   └── api-config.ts         # ⚙️ API endpoints
│   └── utils/
│       └── ssl-config.util.ts    # ⚙️ SSL configuration
├── package.json                  # ⚙️ Extension metadata
└── webpack.config.js
```

**Legend**: ⚠️ Required configuration | ⚙️ Optional customization

---

## Appendix B: Quick Start Commands

```bash
# Clone and setup
git clone <repository-url>
cd vs-extension
npm install

# Configure environment
cp src/config/environment.example.ts src/config/environment.ts
# Edit environment.ts with your values

# Build
npm run compile

# Package
vsce package

# Install locally for testing
code --install-extension essedum-1.0.40.vsix
```

---

## Appendix C: Support & Resources

### Documentation Files
- `README.md` - User guide
- `DESIGN-AND-IMPLEMENTATION.md` - Architecture documentation
- `DEMO-WALKTHROUGH.md` - Technical demo guide
- `EXTENSION-USAGE-README.md` - Visual feature guide

### Getting Help
- Check VS Code Output panel (Essedum channel) for logs
- Review Keycloak server logs for authentication issues
- Check Essedum Platform API logs for integration errors

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.40 | April 2026 | Initial deployment guide created |

---

**End of Document**
