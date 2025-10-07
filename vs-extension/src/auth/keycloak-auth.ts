import * as vscode from 'vscode';
import axios from 'axios';
import * as https from 'https';
import { OAuthAuthServer, PKCEChallenge } from './oauth-auth-server';
import { createHTTPSAgent, initializeSSLBypass } from '../core/constants/api-config';

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    scope?: string;
}

export interface DeviceCodeResponse {
    device_code: string;
    user_code: string;
    verification_uri: string;
    verification_uri_complete?: string;
    expires_in: number;
    interval: number;
}

export interface KeycloakConfig {
    issuerUri: string;
    clientId: string;
    scope: string;
}

// export class KeycloakAuthService {
//     private static readonly TOKEN_KEY = 'keycloak_tokens';
    
//     private config: KeycloakConfig;
//     private context: vscode.ExtensionContext;
//     private authPromise?: Promise<TokenResponse>;

//     constructor(config: KeycloakConfig, context: vscode.ExtensionContext) {
//         this.config = config;
//         this.context = context;
//     }

//     /**
//      * Create HTTPS agent that can handle self-signed certificates
//      */
//     private createHttpsAgent(): https.Agent {
//         const config = vscode.workspace.getConfiguration('essedum.auth');
//         const allowSelfSigned = config.get<boolean>('allowSelfSignedCertificates', true);
        
//         return new https.Agent({
//             rejectUnauthorized: !allowSelfSigned
//         });
//     }

//     /**
//      * Get axios config with proper HTTPS handling
//      */
//     private getAxiosConfig() {
//         return {
//             httpsAgent: this.createHttpsAgent(),
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//         };
//     }

//     /**
//      * Show security warning for self-signed certificates
//      */
//     private async showCertificateWarning(): Promise<boolean> {
//         const config = vscode.workspace.getConfiguration('essedum.auth');
//         const showWarnings = config.get<boolean>('showCertificateWarnings', true);
        
//         if (!showWarnings) {
//             return true; // Skip warning if user disabled it
//         }
        
//         const choice = await vscode.window.showWarningMessage(
//             'The Keycloak server uses a self-signed certificate. This extension will accept it for authentication purposes.',
//             { modal: false },
//             'Continue',
//             'Cancel'
//         );
        
//         return choice === 'Continue';
//     }

//     /**
//      * Initiate device authorization flow
//      */
//     private async initiateDeviceFlow(): Promise<DeviceCodeResponse> {
//         const deviceAuthUrl = `${this.config.issuerUri}/protocol/openid-connect/auth/device`;
        
//         const params = new URLSearchParams();
//         params.append('client_id', this.config.clientId);
//         params.append('scope', this.config.scope);

//         try {
//             const response = await axios.post(deviceAuthUrl, params, this.getAxiosConfig());

//             return response.data as DeviceCodeResponse;
//         } catch (error: any) {
//             console.error('Device flow initiation error:', error);
            
//             // Handle certificate errors specifically
//             if (error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' || 
//                 error.code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
//                 error.message.includes('certificate')) {
                
//                 const continueAuth = await this.showCertificateWarning();
//                 if (!continueAuth) {
//                     throw new Error('Authentication cancelled due to certificate issues');
//                 }
                
//                 // If user accepts, the HTTPS agent should handle it
//                 throw new Error(`Certificate error persists: ${error.message}. Please check your Keycloak server configuration.`);
//             }
            
//             throw new Error(`Failed to initiate device flow: ${error.response?.data?.error_description || error.message}`);
//         }
//     }

//     /**
//      * Poll for token using device code
//      */
//     private async pollForToken(deviceCode: string, interval: number, expiresIn: number): Promise<TokenResponse> {
//         const tokenUrl = `${this.config.issuerUri}/protocol/openid-connect/token`;
//         const startTime = Date.now();
//         const timeoutMs = expiresIn * 1000;

//         while (Date.now() - startTime < timeoutMs) {
//             const params = new URLSearchParams();
//             params.append('grant_type', 'urn:ietf:params:oauth:grant-type:device_code');
//             params.append('client_id', this.config.clientId);
//             params.append('device_code', deviceCode);

//             try {
//                 const response = await axios.post(tokenUrl, params, this.getAxiosConfig());

//                 const tokens = response.data as TokenResponse;
//                 await this.storeTokens(tokens);
//                 return tokens;
//             } catch (error: any) {
//                 const errorCode = error.response?.data?.error;
                
//                 if (errorCode === 'authorization_pending') {
//                     // Continue polling
//                     await new Promise(resolve => setTimeout(resolve, interval * 1000));
//                     continue;
//                 } else if (errorCode === 'slow_down') {
//                     // Increase polling interval
//                     interval += 5;
//                     await new Promise(resolve => setTimeout(resolve, interval * 1000));
//                     continue;
//                 } else if (errorCode === 'expired_token') {
//                     throw new Error('Device code expired. Please try again.');
//                 } else if (errorCode === 'access_denied') {
//                     throw new Error('Access denied. User cancelled authorization.');
//                 } else {
//                     throw new Error(`Token polling error: ${error.response?.data?.error_description || error.message}`);
//                 }
//             }
//         }

//         throw new Error('Device code expired. Please try again.');
//     }

//     /**
//      * Refresh access token using refresh token
//      */
//     public async refreshToken(refreshToken: string): Promise<TokenResponse> {
//         const tokenUrl = `${this.config.issuerUri}/protocol/openid-connect/token`;
        
//         const params = new URLSearchParams();
//         params.append('grant_type', 'refresh_token');
//         params.append('client_id', this.config.clientId);
//         params.append('refresh_token', refreshToken);

//         try {
//             const response = await axios.post(tokenUrl, params, this.getAxiosConfig());

//             const tokens = response.data as TokenResponse;
//             await this.storeTokens(tokens);
//             return tokens;
//         } catch (error: any) {
//             console.error('Token refresh error:', error);
//             throw new Error(`Failed to refresh token: ${error.response?.data?.error_description || error.message}`);
//         }
//     }

//     /**
//      * Store tokens securely using VS Code's SecretStorage
//      */
//     private async storeTokens(tokens: TokenResponse): Promise<void> {
//         const tokenData = {
//             ...tokens,
//             timestamp: Date.now()
//         };
//         await this.context.secrets.store(KeycloakAuthService.TOKEN_KEY, JSON.stringify(tokenData));
//     }

//     /**
//      * Retrieve stored tokens
//      */
//     public async getStoredTokens(): Promise<TokenResponse | null> {
//         try {
//             const tokenData = await this.context.secrets.get(KeycloakAuthService.TOKEN_KEY);
//             if (tokenData) {
//                 const tokens = JSON.parse(tokenData);
                
//                 // Check if token is still valid (with some buffer time)
//                 const expirationTime = tokens.timestamp + (tokens.expires_in * 1000) - 60000; // 1 minute buffer
//                 if (Date.now() < expirationTime) {
//                     return tokens;
//                 } else {
//                     // Try to refresh the token
//                     if (tokens.refresh_token) {
//                         try {
//                             return await this.refreshToken(tokens.refresh_token);
//                         } catch (error) {
//                             console.error('Failed to refresh expired token:', error);
//                             await this.clearStoredTokens();
//                             return null;
//                         }
//                     }
//                 }
//             }
//             return null;
//         } catch (error) {
//             console.error('Error retrieving stored tokens:', error);
//             return null;
//         }
//     }

//     /**
//      * Clear stored tokens
//      */
//     public async clearStoredTokens(): Promise<void> {
//         await this.context.secrets.delete(KeycloakAuthService.TOKEN_KEY);
//     }

//     /**
//      * Check if device flow is supported by testing the endpoint
//      */
//     private async isDeviceFlowSupported(): Promise<boolean> {
//         try {
//             const deviceAuthUrl = `${this.config.issuerUri}/protocol/openid-connect/auth/device`;
//             const response = await axios.head(deviceAuthUrl, {
//                 httpsAgent: this.createHttpsAgent(),
//                 timeout: 5000
//             });
//             return response.status < 400;
//         } catch (error: any) {
//             console.log('Device flow endpoint check failed:', error.message);
//             return false;
//         }
//     }

//     /**
//      * Enhanced manual authentication with working redirect URI
//      */
//     private async performManualTokenAuth(): Promise<TokenResponse> {
//         // Use the working redirect URI from the application configuration
//         const workingRedirectUri = 'https://essedum.az.ad.idemo-ppc.com/index.html';
        
//         // Build the authentication URL without PKCE (client doesn't support it)
//         const authParams = new URLSearchParams({
//             response_type: 'code',
//             client_id: this.config.clientId,
//             redirect_uri: workingRedirectUri,
//             scope: this.config.scope
//             // No PKCE parameters - client doesn't support them
//         });
        
//         const loginUrl = `${this.config.issuerUri}/protocol/openid-connect/auth?${authParams.toString()}`;
        
//         // Show detailed instructions to the user
//         const choice = await vscode.window.showInformationMessage(
//             'Manual Authentication Required',
//             {
//                 detail: `Opening the Keycloak login page with the exact same configuration as your working web application.

// Steps:
// 1. Click "Open Browser" to go to the login page
// 2. Complete the login process normally
// 3. You'll be redirected to the application page: ${workingRedirectUri}
// 4. Open browser developer tools (F12)
// 5. Go to Application > Local Storage or Session Storage
// 6. Find and copy the access token
// 7. Paste it in the next dialog

// This URL uses the same parameters as your working application (no PKCE).`,
//                 modal: true
//             },
//             'Open Browser',
//             'Cancel'
//         );
        
//         if (choice !== 'Open Browser') {
//             throw new Error('Authentication cancelled by user');
//         }
        
//         await vscode.env.openExternal(vscode.Uri.parse(loginUrl));
        
//         // Ask user to manually copy the token
//         const result = await vscode.window.showInputBox({
//             prompt: 'After logging in, copy the access token from browser storage and paste it here (F12 > Application > Local Storage)',
//             placeHolder: 'Paste your access token...',
//             password: true,
//             ignoreFocusOut: true
//         });
        
//         if (!result) {
//             throw new Error('Authentication cancelled');
//         }
        
//         // Create a token response from manually entered token
//         const tokens: TokenResponse = {
//             access_token: result.trim(),
//             refresh_token: '', // Will be empty in manual mode
//             expires_in: 3600, // 1 hour default
//             token_type: 'Bearer'
//         };
        
//         await this.storeTokens(tokens);
//         return tokens;
//     }

//     /**
//      * Force fresh authentication by clearing existing tokens and performing new auth
//      */
//     public async forceAuthentication(): Promise<TokenResponse> {
//         console.log('Forcing fresh authentication - clearing existing tokens');
        
//         // Clear any existing tokens first
//         await this.clearStoredTokens();
        
//         // Reset the auth promise to ensure fresh authentication
//         this.authPromise = undefined;
        
//         // Skip device flow check since we know it's disabled for this client
//         console.log('Using manual authentication with working redirect URI');
//         vscode.window.showInformationMessage('Opening browser for authentication using the same configuration as the web application.');
//         return await this.performManualTokenAuth();
//     }

//     /**
//      * Perform OAuth 2.0 authentication flow
//      */
//     public async authenticate(): Promise<TokenResponse> {
//         // Check if we already have valid tokens
//         const existingTokens = await this.getStoredTokens();
//         if (existingTokens) {
//             return existingTokens;
//         }

//         // Prevent multiple concurrent auth flows
//         if (this.authPromise) {
//             return this.authPromise;
//         }

//         // Skip device flow check since we know it's disabled for this client
//         console.log('Using manual authentication with working redirect URI');
//         this.authPromise = this.performManualTokenAuth();
        
//         try {
//             const tokens = await this.authPromise;
//             this.authPromise = undefined;
//             return tokens;
//         } catch (error) {
//             this.authPromise = undefined;
//             throw error;
//         }
//     }

//     private async performDeviceFlow(): Promise<TokenResponse> {
//         try {
//             // Step 1: Get device code
//             vscode.window.showInformationMessage('Starting authentication with Keycloak...');
//             const deviceResponse = await this.initiateDeviceFlow();
            
//             // Step 2: Show user code and open verification URL
//             const userCode = deviceResponse.user_code;
//             const verificationUri = deviceResponse.verification_uri_complete || deviceResponse.verification_uri;
            
//             // Copy user code to clipboard for convenience
//             await vscode.env.clipboard.writeText(userCode);
            
//             // Show progress notification
//             const authProgress = vscode.window.withProgress({
//                 location: vscode.ProgressLocation.Notification,
//                 title: 'Keycloak Authentication',
//                 cancellable: true
//             }, async (progress, token) => {
//                 progress.report({ 
//                     increment: 0, 
//                     message: `Code: ${userCode} (copied to clipboard)` 
//                 });
                
//                 // Show user code and instructions
//                 const choice = await vscode.window.showInformationMessage(
//                     `Authentication Code: ${userCode}\n\nThis code has been copied to your clipboard.\n\nPlease visit: ${deviceResponse.verification_uri}`,
//                     { modal: true },
//                     'Open Browser & Continue',
//                     'I\'ve completed authentication'
//                 );
                
//                 if (choice === 'Open Browser & Continue') {
//                     await vscode.env.openExternal(vscode.Uri.parse(verificationUri));
//                 }
                
//                 if (!choice || token.isCancellationRequested) {
//                     throw new Error('Authentication cancelled by user');
//                 }

//                 progress.report({ 
//                     increment: 30, 
//                     message: 'Waiting for authentication completion...' 
//                 });
                
//                 // Step 3: Poll for tokens
//                 const tokens = await this.pollForToken(
//                     deviceResponse.device_code,
//                     deviceResponse.interval,
//                     deviceResponse.expires_in
//                 );
                
//                 progress.report({ 
//                     increment: 100, 
//                     message: 'Authentication successful!' 
//                 });
                
//                 return tokens;
//             });
            
//             return await authProgress;
            
//         } catch (error: any) {
//             console.error('Device flow authentication error:', error);
            
//             // Provide more specific error messages
//             if (error.message.includes('cancelled')) {
//                 throw new Error('Authentication was cancelled');
//             } else if (error.message.includes('certificate')) {
//                 const continueAnyway = await vscode.window.showErrorMessage(
//                     `SSL Certificate Error: ${error.message}\n\nThis usually happens with self-signed certificates.`,
//                     'Continue Anyway',
//                     'Cancel'
//                 );
                
//                 if (continueAnyway === 'Continue Anyway') {
//                     // Retry with certificate warnings disabled
//                     vscode.window.showWarningMessage('Continuing with SSL certificate verification disabled.');
//                     throw new Error('Please retry authentication. SSL verification has been adjusted.');
//                 } else {
//                     throw new Error('Authentication cancelled due to SSL certificate issues');
//                 }
//             } else if (error.message.includes('ECONNREFUSED')) {
//                 throw new Error(`Connection Error: Cannot connect to Keycloak server at ${this.config.issuerUri}.\n\nPlease check:\n1. Server URL is correct\n2. Server is running and accessible\n3. Network connectivity`);
//             } else if (error.message.includes('ENOTFOUND')) {
//                 throw new Error(`DNS Error: Cannot resolve hostname for ${this.config.issuerUri}.\n\nPlease check the server URL in your configuration.`);
//             } else if (error.message.includes('expired')) {
//                 throw new Error('Authentication session expired. Please try again.');
//             } else if (error.message.includes('denied')) {
//                 throw new Error('Access denied. Please check your permissions or try again.');
//             }
            
//             throw new Error(`Authentication failed: ${error.message}`);
//         }
//     }

//     /**
//      * Logout user and clear stored tokens
//      */
//     public async logout(): Promise<void> {
//         await this.clearStoredTokens();
        
//         // Optionally, you can also call Keycloak's logout endpoint
//         const logoutUrl = `${this.config.issuerUri}/protocol/openid-connect/logout`;
//         await vscode.env.openExternal(vscode.Uri.parse(logoutUrl));
//     }

//     /**
//      * Get current access token, refreshing if necessary
//      */
//     public async getAccessToken(): Promise<string> {
//         const tokens = await this.getStoredTokens();
//         if (tokens) {
//             return tokens.access_token;
//         }
        
//         // If no valid tokens, perform authentication
//         const newTokens = await this.authenticate();
//         return newTokens.access_token;
//     }

//     /**
//      * Validate if current token is still valid
//      */
//     public async isTokenValid(): Promise<boolean> {
//         try {
//             const tokens = await this.getStoredTokens();
//             return tokens !== null && !!tokens.access_token && tokens.access_token.length > 0;
//         } catch (error) {
//             console.error('Error validating token:', error);
//             return false;
//         }
//     }

//     /**
//      * Get authentication status
//      */
//     public async getAuthenticationStatus(): Promise<{
//         isAuthenticated: boolean;
//         tokenExpiry?: Date;
//         needsRefresh?: boolean;
//     }> {
//         try {
//             const tokenData = await this.context.secrets.get(KeycloakAuthService.TOKEN_KEY);
//             if (!tokenData) {
//                 return { isAuthenticated: false };
//             }

//             const tokens = JSON.parse(tokenData);
//             const now = Date.now();
//             const expirationTime = tokens.timestamp + (tokens.expires_in * 1000);
//             const refreshTime = tokens.timestamp + (tokens.expires_in * 1000) - 300000; // 5 minutes before expiry

//             return {
//                 isAuthenticated: now < expirationTime,
//                 tokenExpiry: new Date(expirationTime),
//                 needsRefresh: now > refreshTime && now < expirationTime
//             };
//         } catch (error) {
//             console.error('Error getting authentication status:', error);
//             return { isAuthenticated: false };
//         }
//     }
// }


export class KeycloakAuthService {
    private static readonly TOKEN_KEY = 'keycloak_tokens_v2';
    
    private config: KeycloakConfig;
    private context: vscode.ExtensionContext;
    private authPromise?: Promise<TokenResponse>;
    private oauthServer: OAuthAuthServer;

    constructor(config: KeycloakConfig, context: vscode.ExtensionContext) {
        this.config = config;
        this.context = context;
        this.oauthServer = new OAuthAuthServer();
        
        // Ensure SSL bypass is initialized for OAuth flow
        initializeSSLBypass();
        
        console.log('KeycloakAuthService initialized with SSL bypass enabled');
    }

    /**
     * Create HTTPS agent that can handle self-signed certificates
     */
    private createHttpsAgent(): https.Agent {
        // Force SSL bypass for OAuth authentication
        console.log('Creating HTTPS agent with SSL bypass for OAuth flow');
        
        return new https.Agent({
            rejectUnauthorized: false, // Always bypass SSL for OAuth flow
            checkServerIdentity: () => undefined, // Disable hostname verification
            secureProtocol: 'TLSv1_2_method', // Use TLS 1.2
            keepAlive: true,
            maxSockets: 50,
            maxFreeSockets: 10,
            timeout: 30000
        });
    }

    /**
     * Get axios config with proper HTTPS handling
     */
    private getAxiosConfig() {
        return {
            httpsAgent: this.createHttpsAgent(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            timeout: 30000, // 30 second timeout
            validateStatus: (status: number) => status < 500, // Accept all non-server-error status codes
            maxRedirects: 5
        };
    }

    /**
     * Show security warning for self-signed certificates
     */
    private async showCertificateWarning(): Promise<boolean> {
        const config = vscode.workspace.getConfiguration('essedum.auth');
        const showWarnings = config.get<boolean>('showCertificateWarnings', true);
        
        if (!showWarnings) {
            return true; // Skip warning if user disabled it
        }
        
        const choice = await vscode.window.showWarningMessage(
            'The Keycloak server uses a self-signed certificate. This extension will accept it for authentication purposes.',
            { modal: false },
            'Continue',
            'Cancel'
        );
        
        return choice === 'Continue';
    }

    /**
     * Force SSL bypass for OAuth flow
     */
    private forceSSLBypass(): void {
        // Set environment variable to disable SSL verification
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
        
        // Log the SSL bypass for debugging
        console.log('SSL certificate verification disabled for OAuth flow');
        
        // Show user notification about SSL bypass
        vscode.window.showInformationMessage(
            'SSL certificate validation bypassed for authentication (development environment)'
        );
    }

    /**
     * Perform OAuth 2.0 Authorization Code flow with PKCE
     */
    private async performAuthorizationCodeFlow(): Promise<TokenResponse> {
        try {
            // Force SSL bypass before starting OAuth flow
            this.forceSSLBypass();
            
            vscode.window.showInformationMessage('Starting secure OAuth authentication...');
            
            // Generate PKCE challenge
            const pkce: PKCEChallenge = this.oauthServer.generatePKCE();
            const state = this.oauthServer.generateState();
            const redirectUri = this.oauthServer.getRedirectUri();
            
            // Build the authorization URL
            const authParams = new URLSearchParams({
                response_type: 'code',
                client_id: this.config.clientId,
                redirect_uri: redirectUri,
                scope: this.config.scope,
                code_challenge: pkce.codeChallenge,
                code_challenge_method: 'S256',
                state: state
            });
            
            const authUrl = `${this.config.issuerUri}/protocol/openid-connect/auth?${authParams.toString()}`;
            
            console.log('Starting OAuth flow with URL:', authUrl);
            console.log('Redirect URI:', redirectUri);
            console.log('Client ID:', this.config.clientId);
            console.log('Scope:', this.config.scope);
            
            // Show progress and start the auth flow
            const authResult = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'OAuth Authentication',
                cancellable: true
            }, async (progress, token) => {
                progress.report({ 
                    increment: 0, 
                    message: 'Opening browser for authentication...' 
                });
                
                // Handle cancellation
                token.onCancellationRequested(() => {
                    this.oauthServer.stopAuthFlow();
                });
                
                try {
                    // Start the OAuth flow
                    const authResponse = await this.oauthServer.startAuthFlow(authUrl, 300000); // 5 minute timeout
                    
                    progress.report({ 
                        increment: 50, 
                        message: 'Authorization received, exchanging for tokens...' 
                    });
                    
                    // Verify state parameter
                    if (authResponse.state !== state) {
                        throw new Error('Invalid state parameter. Possible CSRF attack.');
                    }
                    
                    // Exchange authorization code for tokens
                    const tokens = await this.exchangeCodeForTokens(
                        authResponse.code,
                        redirectUri,
                        pkce.codeVerifier
                    );
                    
                    progress.report({ 
                        increment: 100, 
                        message: 'Authentication successful!' 
                    });
                    
                    return tokens;
                } catch (error: any) {
                    console.error('OAuth flow error:', error);
                    throw error;
                }
            });
            
            // Store the tokens
            await this.storeTokens(authResult);
            
            vscode.window.showInformationMessage(
                '✅ Successfully authenticated with Keycloak!',
                'Continue'
            );
            
            return authResult;
            
        } catch (error: any) {
            console.error('Authorization code flow error:', error);
            
            // Provide user-friendly error messages
            if (error.message.includes('timeout')) {
                throw new Error('Authentication timed out. Please try again and complete the login process within 5 minutes.');
            } else if (error.message.includes('cancelled')) {
                throw new Error('Authentication was cancelled by user.');
            } else if (error.message.includes('Port') && error.message.includes('in use')) {
                throw new Error('Unable to start OAuth server. Please ensure port 8085 is available and try again.');
            } else if (error.message.includes('certificate') || 
                      error.message.includes('SSL') || 
                      error.message.includes('TLS') ||
                      error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' ||
                      error.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
                
                console.log('SSL/Certificate error in OAuth flow, attempting automatic bypass...');
                vscode.window.showInformationMessage(
                    'SSL certificate validation has been bypassed for authentication (development environment).'
                );
                
                // The error should not propagate since we're bypassing SSL validation
                // This indicates a deeper SSL configuration issue
                throw new Error(`SSL bypass failed. Please ensure the OAuth server configuration allows insecure connections for development.`);
            }
            
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    /**
     * Exchange authorization code for access tokens
     */
    private async exchangeCodeForTokens(
        code: string, 
        redirectUri: string, 
        codeVerifier: string
    ): Promise<TokenResponse> {
        const tokenUrl = `${this.config.issuerUri}/protocol/openid-connect/token`;
        
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('client_id', this.config.clientId);
        params.append('code', code);
        params.append('redirect_uri', redirectUri);
        params.append('code_verifier', codeVerifier);

        try {
            console.log('Exchanging authorization code for tokens...');
            console.log('Token URL:', tokenUrl);
            console.log('Client ID:', this.config.clientId);
            console.log('Redirect URI:', redirectUri);
            
            const response = await axios.post(tokenUrl, params, this.getAxiosConfig());
            
            console.log('Token exchange successful');
            return response.data as TokenResponse;
        } catch (error: any) {
            console.error('Token exchange error:', error);
            console.error('Response data:', error.response?.data);
            console.error('Response status:', error.response?.status);
            console.error('Error code:', error.code);
            
            // Handle SSL certificate errors specifically
            if (error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' || 
                error.code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
                error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
                error.message.includes('certificate') ||
                error.message.includes('SSL') ||
                error.message.includes('TLS')) {
                
                console.log('SSL certificate error detected, attempting with bypass...');
                // Show user-friendly message about SSL bypass
                vscode.window.showWarningMessage(
                    'SSL certificate validation bypassed for Keycloak authentication (development environment)',
                    'Continue'
                );
            }
            
            const errorDetail = error.response?.data?.error_description || error.response?.data?.error || error.message;
            throw new Error(`Failed to exchange authorization code for tokens: ${errorDetail}`);
        }
    }

    /**
     * Refresh access token using refresh token
     */
    public async refreshToken(refreshToken: string): Promise<TokenResponse> {
        const tokenUrl = `${this.config.issuerUri}/protocol/openid-connect/token`;
        
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('client_id', this.config.clientId);
        params.append('refresh_token', refreshToken);

        try {
            console.log('Refreshing access token...');
            const response = await axios.post(tokenUrl, params, this.getAxiosConfig());

            const tokens = response.data as TokenResponse;
            await this.storeTokens(tokens);
            console.log('Token refresh successful');
            return tokens;
        } catch (error: any) {
            console.error('Token refresh error:', error);
            
            // Handle SSL certificate errors during refresh
            if (error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' || 
                error.code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
                error.message.includes('certificate') ||
                error.message.includes('SSL') ||
                error.message.includes('TLS')) {
                
                console.log('SSL certificate error during token refresh, bypassing...');
                this.forceSSLBypass();
            }
            
            throw new Error(`Failed to refresh token: ${error.response?.data?.error_description || error.message}`);
        }
    }

    /**
     * Store tokens securely using VS Code's SecretStorage
     */
    private async storeTokens(tokens: TokenResponse): Promise<void> {
        const tokenData = {
            ...tokens,
            timestamp: Date.now()
        };
        await this.context.secrets.store(KeycloakAuthService.TOKEN_KEY, JSON.stringify(tokenData));
        console.log('Tokens stored securely');
    }

    /**
     * Retrieve stored tokens
     */
    public async getStoredTokens(): Promise<TokenResponse | null> {
        try {
            const tokenData = await this.context.secrets.get(KeycloakAuthService.TOKEN_KEY);
            if (tokenData) {
                const tokens = JSON.parse(tokenData);
                
                // Check if token is still valid (with some buffer time)
                const expirationTime = tokens.timestamp + (tokens.expires_in * 1000) - 60000; // 1 minute buffer
                if (Date.now() < expirationTime) {
                    return tokens;
                } else {
                    // Try to refresh the token
                    if (tokens.refresh_token) {
                        try {
                            console.log('Token expired, attempting refresh...');
                            return await this.refreshToken(tokens.refresh_token);
                        } catch (error) {
                            console.error('Failed to refresh expired token:', error);
                            await this.clearStoredTokens();
                            return null;
                        }
                    } else {
                        console.log('Token expired and no refresh token available');
                        await this.clearStoredTokens();
                        return null;
                    }
                }
            }
            return null;
        } catch (error) {
            console.error('Error retrieving stored tokens:', error);
            return null;
        }
    }

    /**
     * Clear stored tokens
     */
    public async clearStoredTokens(): Promise<void> {
        await this.context.secrets.delete(KeycloakAuthService.TOKEN_KEY);
        console.log('Stored tokens cleared');
    }

    /**
     * Force fresh authentication by clearing existing tokens and performing new auth
     */
    public async forceAuthentication(): Promise<TokenResponse> {
        console.log('Forcing fresh authentication - clearing existing tokens');
        
        // Clear any existing tokens first
        await this.clearStoredTokens();
        
        // Reset the auth promise to ensure fresh authentication
        this.authPromise = undefined;
        
        // Perform the authorization code flow
        return await this.performAuthorizationCodeFlow();
    }

    /**
     * Perform OAuth 2.0 authentication flow
     */
    public async authenticate(): Promise<TokenResponse> {
        // Check if we already have valid tokens
        const existingTokens = await this.getStoredTokens();
        if (existingTokens) {
            console.log('Using existing valid tokens');
            return existingTokens;
        }

        // Prevent multiple concurrent auth flows
        if (this.authPromise) {
            console.log('Auth flow already in progress, waiting...');
            return this.authPromise;
        }

        // Start new authentication flow
        console.log('Starting new OAuth authentication flow');
        this.authPromise = this.performAuthorizationCodeFlow();
        
        try {
            const tokens = await this.authPromise;
            this.authPromise = undefined;
            return tokens;
        } catch (error) {
            this.authPromise = undefined;
            throw error;
        }
    }

    /**
     * Logout user and clear stored tokens
     */
    public async logout(): Promise<void> {
        // Stop any ongoing auth flow
        await this.oauthServer.stopAuthFlow();
        
        // Clear stored tokens
        await this.clearStoredTokens();
        
        // Open Keycloak logout endpoint
        const logoutUrl = `${this.config.issuerUri}/protocol/openid-connect/logout`;
        await vscode.env.openExternal(vscode.Uri.parse(logoutUrl));
        
        vscode.window.showInformationMessage('Successfully logged out from Keycloak.');
    }

    /**
     * Get current access token, refreshing if necessary
     */
    public async getAccessToken(): Promise<string> {
        const tokens = await this.getStoredTokens();
        if (tokens) {
            return tokens.access_token;
        }
        
        // If no valid tokens, perform authentication
        const newTokens = await this.authenticate();
        return newTokens.access_token;
    }

    /**
     * Validate if current token is still valid
     */
    public async isTokenValid(): Promise<boolean> {
        try {
            const tokens = await this.getStoredTokens();
            return tokens !== null && !!tokens.access_token && tokens.access_token.length > 0;
        } catch (error) {
            console.error('Error validating token:', error);
            return false;
        }
    }

    /**
     * Get authentication status
     */
    public async getAuthenticationStatus(): Promise<{
        isAuthenticated: boolean;
        tokenExpiry?: Date;
        needsRefresh?: boolean;
    }> {
        try {
            const tokenData = await this.context.secrets.get(KeycloakAuthService.TOKEN_KEY);
            if (!tokenData) {
                return { isAuthenticated: false };
            }

            const tokens = JSON.parse(tokenData);
            const now = Date.now();
            const expirationTime = tokens.timestamp + (tokens.expires_in * 1000);
            const refreshTime = tokens.timestamp + (tokens.expires_in * 1000) - 300000; // 5 minutes before expiry

            return {
                isAuthenticated: now < expirationTime,
                tokenExpiry: new Date(expirationTime),
                needsRefresh: now > refreshTime && now < expirationTime
            };
        } catch (error) {
            console.error('Error getting authentication status:', error);
            return { isAuthenticated: false };
        }
    }

    /**
     * Clean up resources
     */
    public async dispose(): Promise<void> {
        await this.oauthServer.stopAuthFlow();
    }
}

