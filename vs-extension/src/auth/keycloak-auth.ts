import * as vscode from 'vscode';
import axios from 'axios';
import * as https from 'https';
import { OAuthAuthServer, PKCEChallenge } from './oauth-auth-server';
import { createHTTPSAgent, initializeSSLBypass } from '../constants/api-config';
import { NetworkConfig, NetworkType } from '../constants/app-constants';

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
    networkType?: NetworkType;
    networkName?: string;
}

export interface UserInfo {
    sub: string;
    email?: string;
    name?: string;
    preferred_username?: string;
    given_name?: string;
    family_name?: string;
    realm_access?: {
        roles: string[];
    };
    resource_access?: {
        [clientId: string]: {
            roles: string[];
        };
    };
    // Additional properties that might be present in the JWT token
    [key: string]: any;
}

export interface SessionData {
    projectId: string;
    projectName: string;
    roleId: string;
    roleName: string;
    organization?: string;
    userId?: string;
    email?: string;
    username?: string;
}

export class KeycloakAuthService {
    private static readonly TOKEN_KEY = 'keycloak_tokens_v2';
    private static readonly NETWORK_KEY = 'selected_network';
    
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
        console.log('Network configuration:', {
            networkType: config.networkType,
            networkName: config.networkName,
            issuerUri: config.issuerUri
        });
    }

    /**
     * Update the network configuration for authentication
     * @param networkConfig - Network configuration to use
     */
    public async updateNetworkConfig(networkConfig: NetworkConfig): Promise<void> {
        console.log('Updating network configuration:', networkConfig);
        
        this.config = {
            issuerUri: networkConfig.issuerUri,
            clientId: networkConfig.clientId,
            scope: networkConfig.scope,
            networkType: networkConfig.id,
            networkName: networkConfig.displayName
        };
        
        // Store the selected network for future use
        await this.context.globalState.update(KeycloakAuthService.NETWORK_KEY, networkConfig);
        
        // Clear any existing tokens since we're changing networks
        await this.clearStoredTokens();
        
        console.log('Network configuration updated successfully');
    }

    /**
     * Get the currently selected network configuration
     * @returns NetworkConfig or null if none selected
     */
    public async getSelectedNetwork(): Promise<NetworkConfig | null> {
        return this.context.globalState.get<NetworkConfig>(KeycloakAuthService.NETWORK_KEY) || null;
    }

    /**
     * Create a new KeycloakAuthService with a specific network configuration
     * @param networkConfig - Network configuration to use
     * @param context - VS Code extension context
     * @returns New KeycloakAuthService instance
     */
    public static createWithNetwork(networkConfig: NetworkConfig, context: vscode.ExtensionContext): KeycloakAuthService {
        const config: KeycloakConfig = {
            issuerUri: networkConfig.issuerUri,
            clientId: networkConfig.clientId,
            scope: networkConfig.scope,
            networkType: networkConfig.id,
            networkName: networkConfig.displayName
        };
        
        const service = new KeycloakAuthService(config, context);
        
        // Store the network config
        context.globalState.update(KeycloakAuthService.NETWORK_KEY, networkConfig);
        
        return service;
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
     * Clear stored tokens and optionally network selection
     */
    public async clearStoredTokens(clearNetwork: boolean = false): Promise<void> {
        await this.context.secrets.delete(KeycloakAuthService.TOKEN_KEY);
        
        if (clearNetwork) {
            await this.context.globalState.update(KeycloakAuthService.NETWORK_KEY, undefined);
        }
        
        console.log('Stored tokens cleared', clearNetwork ? '(including network selection)' : '');
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
     * @param clearNetwork - Whether to also clear network selection (forces network re-selection)
     */
    public async logout(clearNetwork: boolean = false): Promise<void> {
        // Stop any ongoing auth flow
        await this.oauthServer.stopAuthFlow();
        
        // Clear stored tokens and optionally network selection
        await this.clearStoredTokens(clearNetwork);
        
        // Open Keycloak logout endpoint
        const logoutUrl = `${this.config.issuerUri}/protocol/openid-connect/logout`;
        await vscode.env.openExternal(vscode.Uri.parse(logoutUrl));
        
        if (clearNetwork) {
            vscode.window.showInformationMessage('Successfully logged out. You can now select a different network.');
        } else {
            vscode.window.showInformationMessage('Successfully logged out from Keycloak.');
        }
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
     * Decode JWT token without verification (for extracting claims)
     */
    private decodeJWTToken(token: string): any {
        try {
            // JWT tokens have 3 parts separated by dots: header.payload.signature
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT token format');
            }

            // Decode the payload (second part)
            const payload = parts[1];
            
            // Add padding if needed (JWT base64 encoding might not have padding)
            const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
            
            // Decode from base64
            const decodedPayload = Buffer.from(paddedPayload, 'base64').toString('utf8');
            
            return JSON.parse(decodedPayload);
        } catch (error) {
            console.error('Error decoding JWT token:', error);
            throw new Error('Failed to decode JWT token');
        }
    }

    /**
     * Extract user information from access token
     */
    public async getUserInfo(): Promise<UserInfo | null> {
        try {
            const token = await this.getAccessToken();
            if (!token) {
                return null;
            }

            // First try to decode token directly
            const tokenClaims = this.decodeJWTToken(token);
            
            // Try to fetch additional user info from Keycloak userinfo endpoint
            let userInfo: UserInfo = tokenClaims;
            
            try {
                const userInfoUrl = `${this.config.issuerUri}/protocol/openid-connect/userinfo`;
                const response = await axios.get(userInfoUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    httpsAgent: this.createHttpsAgent(),
                    timeout: 10000
                });
                
                // Merge token claims with userinfo response
                userInfo = { ...tokenClaims, ...response.data };
            } catch (userInfoError) {
                console.log('Could not fetch userinfo endpoint, using token claims only:', userInfoError);
            }

            return userInfo;
        } catch (error) {
            console.error('Error getting user info:', error);
            return null;
        }
    }

    /**
     * Clean up resources
     */
    public async dispose(): Promise<void> {
        await this.oauthServer.stopAuthFlow();
    }
}

