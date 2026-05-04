# Essedum VS Code Extension - Keycloak Integration Deep Dive

> **Audience**: Security Engineers, Identity & Access Management Teams  
> **Purpose**: Detailed technical guide for Keycloak OAuth 2.0 integration  
> **Version**: 1.0.40  
> **Last Updated**: April 2026

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [OAuth 2.0 with PKCE Flow](#oauth-20-with-pkce-flow)
3. [Keycloak Server Setup](#keycloak-server-setup)
4. [Client Configuration](#client-configuration)
5. [Extension Implementation](#extension-implementation)
6. [Token Management](#token-management)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 1. Overview

### 1.1 Why OAuth 2.0 with PKCE?

The Essedum VS Code Extension uses **OAuth 2.0 Authorization Code Flow with PKCE (RFC 7636)** for authentication. This approach provides:

✅ **Secure authentication** for public clients (VS Code extension)  
✅ **No client secrets** needed (which can't be securely stored in extensions)  
✅ **Protection against authorization code interception** attacks  
✅ **Automatic token refresh** for seamless user experience  
✅ **Standard-compliant** implementation compatible with any OAuth 2.0 provider  

### 1.2 Architecture Components

```
┌─────────────────────────────────────────────────────────────┐
│              VS Code Extension (Client)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  OAuthAuthServer (Local Callback Server)               │ │
│  │  • Listens on localhost:8085                           │ │
│  │  • Receives authorization code                         │ │
│  │  • Handles PKCE parameters                             │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  KeycloakAuthService                                   │ │
│  │  • Manages authentication state                        │ │
│  │  • Handles token refresh                               │ │
│  │  • Stores tokens securely                              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │ ▲
                           │ │
              Authorization│ │Tokens
                   Request │ │
                           ▼ │
┌─────────────────────────────────────────────────────────────┐
│               Keycloak Server                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Realm: essedum                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ Client: vscode-essedum-extension                 │ │ │
│  │  │ • Type: Public                                   │ │ │
│  │  │ • Flow: Authorization Code + PKCE               │ │ │
│  │  │ • Redirect URI: http://localhost:8085/callback  │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. OAuth 2.0 with PKCE Flow

### 2.1 Complete Authentication Sequence

```
User          VS Code Extension         Browser          Keycloak Server
  │                  │                      │                    │
  │ Click "Login"    │                      │                    │
  ├─────────────────>│                      │                    │
  │                  │                      │                    │
  │                  │ 1. Generate PKCE    │                    │
  │                  │    code_verifier    │                    │
  │                  │    (random 32 bytes)│                    │
  │                  │                      │                    │
  │                  │ 2. Compute          │                    │
  │                  │    code_challenge = │                    │
  │                  │    SHA256(verifier) │                    │
  │                  │                      │                    │
  │                  │ 3. Start callback   │                    │
  │                  │    server :8085     │                    │
  │                  │                      │                    │
  │                  │ 4. Build auth URL   │                    │
  │                  │    with parameters  │                    │
  │                  │                      │                    │
  │                  │ 5. Open browser     │                    │
  │                  ├─────────────────────>│                    │
  │                  │                      │                    │
  │                  │                      │ 6. GET /authorize  │
  │                  │                      │   + client_id      │
  │                  │                      │   + redirect_uri   │
  │                  │                      │   + code_challenge │
  │                  │                      │   + method=S256    │
  │                  │                      │   + scope          │
  │                  │                      │   + state          │
  │                  │                      ├───────────────────>│
  │                  │                      │                    │
  │                  │                      │ 7. Show login form │
  │                  │                      │<───────────────────┤
  │                  │                      │                    │
  │ 8. Enter         │                      │                    │
  │    credentials   │                      │                    │
  ├─────────────────────────────────────────>│                    │
  │                  │                      │                    │
  │                  │                      │ 9. POST credentials│
  │                  │                      ├───────────────────>│
  │                  │                      │                    │
  │                  │                      │ 10. Validate user  │
  │                  │                      │    Create session  │
  │                  │                      │    Generate code   │
  │                  │                      │    Store challenge │
  │                  │                      │                    │
  │                  │                      │ 11. Redirect with  │
  │                  │                      │     authorization  │
  │                  │                      │     code           │
  │                  │                      │<───────────────────┤
  │                  │                      │                    │
  │                  │ 12. GET /callback   │                    │
  │                  │     ?code=...       │                    │
  │                  │     &state=...      │                    │
  │                  │<─────────────────────│                    │
  │                  │                      │                    │
  │                  │ 13. Validate state  │                    │
  │                  │     Extract code    │                    │
  │                  │                      │                    │
  │                  │ 14. POST /token                           │
  │                  │     grant_type=authorization_code         │
  │                  │     code=...                              │
  │                  │     code_verifier=...                     │
  │                  │     client_id=...                         │
  │                  │     redirect_uri=...                      │
  │                  ├──────────────────────────────────────────>│
  │                  │                      │                    │
  │                  │                      │ 15. Verify code    │
  │                  │                      │     Verify PKCE:   │
  │                  │                      │     SHA256(verifier)│
  │                  │                      │     == challenge   │
  │                  │                      │     Issue tokens   │
  │                  │                      │                    │
  │                  │ 16. Return tokens   │                    │
  │                  │     {               │                    │
  │                  │       access_token, │                    │
  │                  │       refresh_token,│                    │
  │                  │       expires_in    │                    │
  │                  │     }               │                    │
  │                  │<──────────────────────────────────────────┤
  │                  │                      │                    │
  │                  │ 17. Store tokens in │                    │
  │                  │     SecretStorage   │                    │
  │                  │                      │                    │
  │                  │ 18. Close callback  │                    │
  │                  │     server          │                    │
  │                  │                      │                    │
  │ 19. Authenticated│                      │                    │
  │<─────────────────┤                      │                    │
  │                  │                      │                    │
```

### 2.2 PKCE Implementation Details

#### Code Verifier Generation

```typescript
// src/auth/servers/oauth-auth.server.ts

/**
 * Generate PKCE code verifier
 * - 32 random bytes (256 bits of entropy)
 * - Base64URL encoded (43 characters)
 */
private generateCodeVerifier(): string {
    const verifier = crypto.randomBytes(PKCE_VERIFIER_LENGTH);
    return this.base64URLEncode(verifier);
}

/**
 * Base64URL encoding (RFC 4648)
 * - Replace + with -
 * - Replace / with _
 * - Remove = padding
 */
private base64URLEncode(buffer: Buffer): string {
    return buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
```

#### Code Challenge Computation

```typescript
/**
 * Generate PKCE code challenge
 * - SHA-256 hash of code verifier
 * - Base64URL encoded
 * Method: S256 (SHA-256)
 */
private generateCodeChallenge(verifier: string): string {
    const hash = crypto
        .createHash(PKCE_HASH_ALGORITHM)
        .update(verifier)
        .digest();
    return this.base64URLEncode(hash);
}
```

#### State Parameter Generation

```typescript
/**
 * Generate state parameter (CSRF protection)
 * - 16 random bytes (128 bits)
 * - Hex encoded (32 characters)
 */
private generateState(): string {
    return crypto.randomBytes(PKCE_STATE_LENGTH).toString('hex');
}
```

### 2.3 Authorization URL Construction

```typescript
/**
 * Build authorization URL with all required parameters
 */
private buildAuthorizationUrl(
    challenge: PKCEChallenge,
    redirectUri: string
): string {
    const config = this.keycloakAuthService.getKeycloakConfig();
    const authEndpoint = `${config.issuerUri}/protocol/openid-connect/auth`;
    
    const params = new URLSearchParams({
        client_id: config.clientId,
        response_type: OAUTH_RESPONSE_TYPE,        // 'code'
        redirect_uri: redirectUri,                  // http://localhost:8085/callback
        code_challenge: challenge.codeChallenge,    // SHA256(verifier)
        code_challenge_method: PKCE_CHALLENGE_METHOD, // 'S256'
        state: challenge.state,                     // Random value for CSRF protection
        scope: 'openid profile email'               // OpenID Connect scopes
    });
    
    return `${authEndpoint}?${params.toString()}`;
}
```

---

## 3. Keycloak Server Setup

### 3.1 Realm Configuration

#### Create Realm

1. **Access Admin Console**: `https://your-keycloak:8443/admin`
2. **Add Realm**:
   - Name: `essedum`
   - Enabled: `true`
   - Display name: `Essedum AI Platform`

#### Realm Settings

```yaml
Realm Settings:
  General:
    Realm name: essedum
    Display name: Essedum AI Platform
    Enabled: true
    
  Login:
    User registration: Disabled (unless needed)
    Forgot password: Enabled
    Remember me: Enabled
    Login with email: Enabled
    
  Tokens:
    Default Signature Algorithm: RS256
    Revoke Refresh Token: Enabled
    Refresh Token Max Reuse: 0 (no reuse allowed)
    
  Sessions:
    SSO Session Idle: 30 minutes
    SSO Session Max: 10 hours
    Client Session Idle: 30 minutes
    Client Session Max: 10 hours
```

### 3.2 User Management

#### Create Test User

1. Navigate to **Users** → **Add User**
2. Configure:
   ```yaml
   Username: testuser@company.com
   Email: testuser@company.com
   Email verified: true
   Enabled: true
   ```
3. Set password in **Credentials** tab:
   ```yaml
   Password: YourSecurePassword123!
   Temporary: false
   ```

---

## 4. Client Configuration

### 4.1 Create OAuth Client

#### Basic Configuration

```yaml
Client ID: vscode-essedum-extension
Name: Essedum VS Code Extension
Description: OAuth client for VS Code extension
Enabled: true
Client Protocol: openid-connect
```

#### Access Settings

```yaml
Access Type: public
Client Authentication: OFF  # Public client, no secret

Standard Flow Enabled: ON   # Authorization Code Flow
Implicit Flow Enabled: OFF  # Not needed, less secure
Direct Access Grants: OFF   # Password grant not needed
Service Accounts Enabled: OFF

```

### 4.2 Redirect URIs

**CRITICAL**: These must match exactly!

```
Valid Redirect URIs:
  http://localhost:8085/callback
  http://127.0.0.1:8085/callback

Valid Post Logout Redirect URIs:
  +  # Allow any configured redirect URI

Web Origins:
  http://localhost:8085
  http://127.0.0.1:8085
```

**Notes**:
- Port `8085` is default (configurable)
- Must use `http` for localhost (not `https`)
- Use `*` for testing only, never in production

### 4.3 Advanced Settings

#### PKCE Configuration

```yaml
Advanced Settings:
  Proof Key for Code Exchange Code Challenge Method: S256
  # This enables PKCE with SHA-256
```

#### Token Lifespans

```yaml
Access Token Lifespan: 1 hour (3600 seconds)
  # Balance security vs. UX
  # Too short: frequent refreshes
  # Too long: security risk

Client Session Idle: 30 minutes
  # User inactive for 30 min → re-authenticate

Client Session Max: 8 hours
  # Max session duration regardless of activity

Refresh Token Lifespan: 8 hours
  # Must be ≥ Client Session Max
  # After this, user must re-authenticate
```

### 4.4 Scope Configuration

#### Default Client Scopes

Add these scopes to the client:

```yaml
Default Scopes:
  - openid           # Required for OIDC
  - profile          # User profile info
  - email            # Email address
  - roles            # User roles
  - web-origins      # CORS handling
  - acr              # Authentication context
```

#### Optional Scopes (not needed for basic auth)

```yaml
Optional:
  - offline_access   # For long-lived refresh tokens
  - address          # Physical address
  - phone            # Phone number
```

### 4.5 Export Client Configuration

For backup or replication:

```bash
# Export realm with clients
/opt/keycloak/bin/kc.sh export \
  --realm essedum \
  --file essedum-realm-export.json
```

---

## 5. Extension Implementation

### 5.1 Authentication Service Architecture

```
KeycloakAuthService
├── authenticate()          # Main entry point
├── refreshAccessToken()    # Auto-refresh when expired
├── logout()                # Clear tokens and session
├── isAuthenticated()       # Check auth status
└── getAccessToken()        # Get current valid token

OAuthAuthServer
├── startAuthFlow()         # Start OAuth flow
├── waitForCallback()       # Listen for redirect
├── exchangeCodeForToken()  # Exchange code for tokens
└── close()                 # Shutdown server
```

### 5.2 KeycloakAuthService Implementation

```typescript
// src/auth/services/keycloak-auth.service.ts

export class KeycloakAuthService {
    private context: vscode.ExtensionContext;
    private keycloakConfig: KeycloakConfig;
    private sessionData: SessionData | null = null;
    
    /**
     * Main authentication method
     * Orchestrates the OAuth flow
     */
    async authenticate(network: NetworkType): Promise<boolean> {
        try {
            // 1. Get network configuration
            this.keycloakConfig = this.getNetworkConfig(network);
            
            // 2. Create OAuth server
            const oauthServer = new OAuthAuthServer(
                this,
                this.context
            );
            
            // 3. Start authentication flow
            const authResponse = await oauthServer.startAuthFlow();
            
            if (!authResponse) {
                logger.error('Authentication failed - no response');
                return false;
            }
            
            // 4. Validate tokens
            const isValid = await this.validateAccessToken(
                authResponse.access_token
            );
            
            if (!isValid) {
                logger.error('Token validation failed');
                return false;
            }
            
            // 5. Store tokens securely
            await this.storeTokens({
                accessToken: authResponse.access_token,
                refreshToken: authResponse.refresh_token,
                expiresAt: Date.now() + (authResponse.expires_in * 1000),
                network: network
            });
            
            // 6. Update session
            this.sessionData = {
                accessToken: authResponse.access_token,
                refreshToken: authResponse.refresh_token,
                expiresAt: Date.now() + (authResponse.expires_in * 1000),
                network: network,
                authenticatedAt: Date.now()
            };
            
            logger.info('Authentication successful');
            return true;
            
        } catch (error) {
            logger.error('Authentication error:', error);
            return false;
        }
    }
    
    /**
     * Get valid access token (refresh if needed)
     */
    async getAccessToken(): Promise<string | null> {
        if (!this.sessionData) {
            return null;
        }
        
        // Check if token is expired or will expire soon (5 min buffer)
        const expiresIn = this.sessionData.expiresAt - Date.now();
        if (expiresIn < 300_000) {  // 5 minutes
            logger.info('Access token expiring soon, refreshing...');
            const refreshed = await this.refreshAccessToken();
            if (!refreshed) {
                logger.error('Token refresh failed');
                return null;
            }
        }
        
        return this.sessionData.accessToken;
    }
    
    /**
     * Refresh access token using refresh token
     */
    private async refreshAccessToken(): Promise<boolean> {
        if (!this.sessionData?.refreshToken) {
            logger.error('No refresh token available');
            return false;
        }
        
        try {
            const tokenEndpoint = `${this.keycloakConfig.issuerUri}/protocol/openid-connect/token`;
            
            const params = new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: this.sessionData.refreshToken,
                client_id: this.keycloakConfig.clientId
            });
            
            const response = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params.toString()
            });
            
            if (!response.ok) {
                throw new Error(`Token refresh failed: ${response.status}`);
            }
            
            const tokens: TokenResponse = await response.json();
            
            // Update tokens
            this.sessionData.accessToken = tokens.access_token;
            this.sessionData.refreshToken = tokens.refresh_token || this.sessionData.refreshToken;
            this.sessionData.expiresAt = Date.now() + (tokens.expires_in * 1000);
            
            // Persist to storage
            await this.storeTokens({
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || this.sessionData.refreshToken,
                expiresAt: this.sessionData.expiresAt,
                network: this.sessionData.network
            });
            
            logger.info('Token refreshed successfully');
            return true;
            
        } catch (error) {
            logger.error('Token refresh error:', error);
            return false;
        }
    }
    
    /**
     * Store tokens in VS Code SecretStorage
     */
    private async storeTokens(data: StoredTokenData): Promise<void> {
        await this.context.secrets.store(
            'essedum.tokens',
            JSON.stringify(data)
        );
    }
}
```

### 5.3 OAuth Callback Server

```typescript
// src/auth/servers/oauth-auth.server.ts

export class OAuthAuthServer {
    private server: http.Server | null = null;
    private port: number;
    
    /**
     * Start OAuth authorization flow
     * Returns tokens on success
     */
    async startAuthFlow(): Promise<TokenResponse | null> {
        try {
            // 1. Generate PKCE parameters
            const challenge = this.generatePKCEChallenge();
            
            // 2. Start local callback server
            const redirectUri = await this.startCallbackServer();
            
            // 3. Build authorization URL
            const authUrl = this.buildAuthorizationUrl(challenge, redirectUri);
            
            // 4. Open browser
            await vscode.env.openExternal(vscode.Uri.parse(authUrl));
            
            // 5. Wait for callback (timeout: 2 minutes)
            const authCode = await this.waitForCallback(
                challenge.state,
                DEFAULT_OAUTH_TIMEOUT
            );
            
            if (!authCode) {
                throw new Error('No authorization code received');
            }
            
            // 6. Exchange code for tokens
            const tokens = await this.exchangeCodeForToken(
                authCode,
                challenge.codeVerifier,
                redirectUri
            );
            
            return tokens;
            
        } finally {
            // Always close server
            this.close();
        }
    }
    
    /**
     * Exchange authorization code for access token
     */
    private async exchangeCodeForToken(
        code: string,
        codeVerifier: string,
        redirectUri: string
    ): Promise<TokenResponse> {
        const config = this.keycloakAuthService.getKeycloakConfig();
        const tokenEndpoint = `${config.issuerUri}/protocol/openid-connect/token`;
        
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            client_id: config.clientId,
            code_verifier: codeVerifier  // PKCE verification
        });
        
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Token exchange failed: ${error}`);
        }
        
        return await response.json();
    }
}
```

---

## 6. Token Management

### 6.1 Secure Token Storage

The extension uses VS Code's **SecretStorage API** which provides OS-level encryption:

| OS | Storage Backend |
|----|----------------|
| **Windows** | Windows Credential Manager |
| **macOS** | Keychain |
| **Linux** | libsecret (GNOME Keyring / KWallet) |

```typescript
// Store tokens
await context.secrets.store('essedum.tokens', JSON.stringify({
    accessToken: 'eyJhbGc...',
    refreshToken: 'eyJhbGc...',
    expiresAt: 1735689600000,
    network: 'production'
}));

// Retrieve tokens
const tokensJson = await context.secrets.get('essedum.tokens');
const tokens = JSON.parse(tokensJson);
```

### 6.2 Token Validation

```typescript
/**
 * Validate access token with Keycloak
 * Uses token introspection endpoint
 */
async validateAccessToken(token: string): Promise<boolean> {
    try {
        const config = this.keycloakConfig;
        const introspectEndpoint = `${config.issuerUri}/protocol/openid-connect/token/introspect`;
        
        const params = new URLSearchParams({
            token: token,
            client_id: config.clientId
        });
        
        const response = await fetch(introspectEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });
        
        const result = await response.json();
        return result.active === true;
        
    } catch (error) {
        logger.error('Token validation error:', error);
        return false;
    }
}
```

### 6.3 Automatic Token Refresh

The extension automatically refreshes tokens before expiry:

```typescript
/**
 * Get access token with auto-refresh
 * Checks expiry and refreshes if needed
 */
async getAccessToken(): Promise<string | null> {
    if (!this.sessionData) {
        return null;
    }
    
    // Calculate time until expiry
    const expiresIn = this.sessionData.expiresAt - Date.now();
    const REFRESH_BUFFER = 5 * 60 * 1000;  // 5 minutes
    
    // Refresh if expiring soon
    if (expiresIn < REFRESH_BUFFER) {
        logger.info('Token expiring in ' + Math.floor(expiresIn / 1000) + 's, refreshing...');
        await this.refreshAccessToken();
    }
    
    return this.sessionData.accessToken;
}
```

---

## 7. Security Best Practices

### 7.1 Keycloak Hardening

#### Enable Security Features

```yaml
# Require PKCE for all public clients
Client Settings:
  Proof Key for Code Exchange Code Challenge Method: S256 (required)

# Enable token rotation
Realm Settings → Tokens:
  Revoke Refresh Token: Enabled
  Refresh Token Max Reuse: 0

# Strong password policies
Authentication → Password Policy:
  - Minimum length: 12
  - Uppercase characters: 1
  - Lowercase characters: 1
  - Digits: 1
  - Special characters: 1
  - Not recently used: 5

# Enable brute force protection
Realm Settings → Security Defenses:
  Brute Force Detection: Enabled
  Max Login Failures: 5
  Wait Increment: 60 seconds
  Max Wait: 900 seconds (15 min)
```

#### Audit Logging

```yaml
# Enable event logging
Realm Settings → Events:
  Save Events: Enabled
  Expiration: 90 days
  
  Save Login Events: Enabled
  Login Events Expiration: 90 days
  
  Event Types:
    - LOGIN
    - LOGIN_ERROR
    - LOGOUT
    - CODE_TO_TOKEN
    - REFRESH_TOKEN
    - TOKEN_EXCHANGE
```

### 7.2 Network Security

#### Use HTTPS for Keycloak (Production)

```nginx
# Nginx reverse proxy for Keycloak
server {
    listen 443 ssl http2;
    server_name keycloak.company.com;
    
    ssl_certificate /etc/ssl/certs/keycloak.crt;
    ssl_certificate_key /etc/ssl/private/keycloak.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Firewall Rules

```bash
# Only allow HTTPS traffic to Keycloak
sudo ufw allow 443/tcp
sudo ufw deny 8080/tcp  # Block direct access to Keycloak HTTP port
```

### 7.3 Extension Security

#### Don't Log Tokens

```typescript
// ❌ NEVER DO THIS
logger.info('Access token:', accessToken);

// ✅ SAFE - Log token metadata only
logger.info('Access token acquired, expires in:', expiresIn);
```

#### Validate All Inputs

```typescript
// Validate state parameter (CSRF protection)
if (receivedState !== expectedState) {
    throw new Error('Invalid state parameter - possible CSRF attack');
}

// Validate redirect URI
if (!redirectUri.startsWith('http://localhost')) {
    throw new Error('Invalid redirect URI');
}
```

---

## 8. Troubleshooting

### 8.1 Common Issues

#### Issue: "Invalid redirect_uri"

**Symptom**: Keycloak returns error during authorization

**Cause**: Redirect URI in request doesn't match Keycloak configuration exactly

**Solution**:
1. Check Keycloak client configuration
2. Ensure URIs match exactly:
   ```
   http://localhost:8085/callback  # Configured in Keycloak
   http://localhost:8085/callback  # Used by extension
   ```
3. Check for typos (trailing slash, http vs https, etc.)

#### Issue: "Invalid PKCE code_verifier"

**Symptom**: Token exchange fails with PKCE error

**Cause**: Code verifier doesn't match code challenge

**Solution**:
1. Verify PKCE implementation:
   - `code_challenge = base64url(sha256(code_verifier))`
2. Ensure code verifier is stored correctly during flow
3. Check that same verifier is sent in token request

#### Issue: "Token refresh fails repeatedly"

**Symptom**: Extension keeps logging out

**Cause**: Refresh token expired or revoked

**Solution**:
1. Check refresh token lifespan in Keycloak
2. Verify refresh token rotation settings
3. Check Keycloak logs for revocation events

### 8.2 Debug Tools

#### Test Token Endpoint

```bash
# Test token exchange manually
curl -X POST \
  https://keycloak.company.com/realms/essedum/protocol/openid-connect/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=authorization_code' \
  -d 'code=YOUR_AUTH_CODE' \
  -d 'redirect_uri=http://localhost:8085/callback' \
  -d 'client_id=vscode-essedum-extension' \
  -d 'code_verifier=YOUR_CODE_VERIFIER'
```

#### Decode JWT Token

```bash
# Decode access token (without verification)
echo "eyJhbGc..." | base64 -d | jq .
```

#### Check Keycloak Logs

```bash
# Docker
docker logs keycloak -f

# Standalone
tail -f /opt/keycloak/data/log/keycloak.log
```

---

## Appendix: Complete Keycloak Client JSON

```json
{
  "clientId": "vscode-essedum-extension",
  "name": "Essedum VS Code Extension",
  "description": "OAuth 2.0 client for Essedum AI Platform VS Code Extension",
  "rootUrl": "",
  "adminUrl": "",
  "baseUrl": "",
  "surrogateAuthRequired": false,
  "enabled": true,
  "alwaysDisplayInConsole": false,
  "clientAuthenticatorType": "client-secret",
  "secret": "",
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
    "saml.assertion.signature": "false",
    "id.token.as.detached.signature": "false",
    "saml.multivalued.roles": "false",
    "saml.force.post.binding": "false",
    "saml.encrypt": "false",
    "oauth2.device.authorization.grant.enabled": "false",
    "backchannel.logout.revoke.offline.tokens": "false",
    "saml.server.signature": "false",
    "saml.server.signature.keyinfo.ext": "false",
    "use.refresh.tokens": "true",
    "exclude.session.state.from.auth.response": "false",
    "oidc.ciba.grant.enabled": "false",
    "saml.artifact.binding": "false",
    "backchannel.logout.session.required": "true",
    "client_credentials.use_refresh_token": "false",
    "saml_force_name_id_format": "false",
    "require.pushed.authorization.requests": "false",
    "saml.client.signature": "false",
    "tls.client.certificate.bound.access.tokens": "false",
    "saml.authnstatement": "false",
    "display.on.consent.screen": "false",
    "saml.onetimeuse.condition": "false",
    "pkce.code.challenge.method": "S256"
  },
  "authenticationFlowBindingOverrides": {},
  "fullScopeAllowed": true,
  "nodeReRegistrationTimeout": -1,
  "protocolMappers": [],
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

---

**End of Document**
