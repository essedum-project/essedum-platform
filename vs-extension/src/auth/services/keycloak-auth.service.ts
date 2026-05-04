import * as vscode from 'vscode';
import axios from 'axios';
import * as https from 'https';
import { OAuthAuthServer, PKCEChallenge } from '../servers/oauth-auth.server';
import { initializeSSLBypass } from '../../constants/api-config';
import { createHTTPSAgent, shouldBypassSSL, configureSSLEnvironment } from '../../utils/ssl-config.util';
import { NetworkConfig } from '../constants/auth-constants';
import * as ExtensionUtils from '../../utils/extension-utils';
import {
    TokenResponse,
    KeycloakConfig,
    UserInfo,
    StoredTokenData,
    AuthenticationStatus
} from '../interfaces/auth.interfaces';
import {
    TOKEN_STORAGE_KEY,
    NETWORK_STORAGE_KEY,
    TOKEN_REFRESH_CHECK_INTERVAL,
    TOKEN_REFRESH_BEFORE_EXPIRY,
    TOKEN_EXPIRY_BUFFER,
    OAUTH_FLOW_TIMEOUT,
    HTTP_REQUEST_TIMEOUT,
    USERINFO_REQUEST_TIMEOUT,
    TOKEN_EXPIRY_WARNING_THRESHOLD
} from '../constants/auth-constants';

const logger = ExtensionUtils.createLogger('KeycloakAuthService');

/**
 * Keycloak Authentication Service
 * Handles OAuth 2.0 authentication flow with PKCE for VS Code extension
 */
export class KeycloakAuthService {
    private static readonly TOKEN_KEY = TOKEN_STORAGE_KEY;
    private static readonly NETWORK_KEY = NETWORK_STORAGE_KEY;
    private static readonly REFRESH_CHECK_INTERVAL = TOKEN_REFRESH_CHECK_INTERVAL;
    private static readonly REFRESH_BEFORE_EXPIRY = TOKEN_REFRESH_BEFORE_EXPIRY;

    private config: KeycloakConfig;
    private context: vscode.ExtensionContext;
    private authPromise?: Promise<TokenResponse>;
    private oauthServer: OAuthAuthServer;
    private refreshTimer?: NodeJS.Timeout;
    private hasAuthenticatedThisSession: boolean = false;
    private sessionStatusBar?: vscode.StatusBarItem;

    constructor(config: KeycloakConfig, context: vscode.ExtensionContext) {
        this.config = config;
        this.context = context;
        this.oauthServer = new OAuthAuthServer(context.extensionPath, context);

        // Create session status bar item
        this.sessionStatusBar = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.sessionStatusBar.command = 'essedum.showSessionInfo';
        this.sessionStatusBar.tooltip = 'Click to view session details';
        context.subscriptions.push(this.sessionStatusBar);

        // Initialize SSL configuration based on network selection
        initializeSSLBypass(context);

        const bypass = shouldBypassSSL(context);
        logger.info('KeycloakAuthService initialized with SSL bypass:', bypass);
        logger.info('Network configuration:', {
            networkType: config.networkType,
            networkName: config.networkName,
            issuerUri: config.issuerUri
        });

        // Set up axios interceptors for automatic token refresh
        this.setupAxiosInterceptors();

        // Note: Automatic token refresh will start after first successful authentication
        // to avoid refresh attempts on extension startup with expired tokens
    }

    /**
     * Update the network configuration for authentication
     * @param networkConfig - Network configuration to use
     */
    public async updateNetworkConfig(networkConfig: NetworkConfig): Promise<void> {
        logger.info('Updating network configuration:', networkConfig);

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

        logger.info('Network configuration updated successfully');
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
     * Create HTTPS agent with appropriate SSL configuration based on network
     */
    private createHttpsAgent(): https.Agent {
        const bypass = shouldBypassSSL(this.context);
        logger.info(`Creating HTTPS agent for OAuth flow - SSL bypass: ${bypass}`);

        return createHTTPSAgent(this.context);
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
            timeout: HTTP_REQUEST_TIMEOUT,
            validateStatus: (status: number) => status < 500, // Accept all non-server-error status codes
            maxRedirects: 5
        };
    }

    /**
     * Configure SSL based on network for OAuth flow
     */
    private forceSSLBypass(): void {
        // Configure SSL environment based on network
        configureSSLEnvironment(this.context);

        const bypass = shouldBypassSSL(this.context);
        logger.info(`SSL configuration for OAuth flow - Bypass: ${bypass}`);

        if (bypass) {
            // Show user notification about SSL bypass (Infosys network)
            vscode.window.showInformationMessage(
                'SSL certificate validation bypassed for authentication (Infosys network)'
            );
        } else {
            logger.info('SSL certificate validation enabled for LFN network');
        }
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

            logger.info('Starting OAuth flow with URL:', authUrl);
            logger.info('Redirect URI:', redirectUri);
            logger.info('Client ID:', this.config.clientId);
            logger.info('Scope:', this.config.scope);

            // Check if the Keycloak server is reachable before opening browser
            const isReachable = await this.checkServerReachability();
            if (!isReachable) {
                throw new Error(
                    `Cannot reach authentication server at ${this.config.issuerUri}. ` +
                    `Please check:\n` +
                    `1. The server URL is correct\n` +
                    `2. You are connected to the correct network\n` +
                    `3. The server is running and accessible\n` +
                    `4. No firewall is blocking the connection`
                );
            }

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
                    const authResponse = await this.oauthServer.startAuthFlow(authUrl, OAUTH_FLOW_TIMEOUT);

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

            // Mark that user has authenticated in this session
            this.hasAuthenticatedThisSession = true;

            // Start automatic token refresh mechanism now that user is authenticated
            if (!this.refreshTimer) {
                this.startAutomaticTokenRefresh();
            }

            vscode.window.showInformationMessage(
                '✅ Successfully authenticated with Keycloak!',
                'Continue'
            );

            return authResult;

        } catch (error: any) {
            console.error('Authorization code flow error:', error);

            // Provide user-friendly error messages
            if (error.message.includes('Cannot reach authentication server')) {
                // Direct passthrough of our custom server unreachable message
                throw error;
            } else if (error.message.includes('timeout')) {
                throw new Error('Authentication timed out. Please try again and complete the login process within 5 minutes.');
            } else if (error.message.includes('cancelled')) {
                throw new Error('Authentication was cancelled by user.');
            } else if (error.message.includes('Port') && error.message.includes('in use')) {
                throw new Error('Unable to start OAuth server. Please ensure port 8085 is available and try again.');
            } else if (error.code === 'ECONNREFUSED') {
                throw new Error(
                    `Authentication server refused connection at ${this.config.issuerUri}. ` +
                    `The server may be down or not accessible from your network.`
                );
            } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
                throw new Error(
                    `Cannot resolve hostname for ${this.config.issuerUri}. ` +
                    `Please check the server address and your network connection.`
                );
            } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
                throw new Error(
                    `Connection to ${this.config.issuerUri} timed out. ` +
                    `Please check your network connection and try again.`
                );
            } else if (error.message.includes('certificate') ||
                error.message.includes('SSL') ||
                error.message.includes('TLS') ||
                error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' ||
                error.code === 'SELF_SIGNED_CERT_IN_CHAIN') {

                logger.info('SSL/Certificate error in OAuth flow, attempting automatic bypass...');
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
     * Check if the Keycloak server is reachable
     * @returns true if server is reachable, false otherwise
     */
    private async checkServerReachability(): Promise<boolean> {
        try {
            // Try to reach the OpenID configuration endpoint
            const configUrl = `${this.config.issuerUri}/.well-known/openid-configuration`;
            
            logger.info(`Checking server reachability at: ${configUrl}`);

            const httpsAgent = createHTTPSAgent(this.context);

            const response = await axios.get(configUrl, {
                httpsAgent,
                timeout: 10000, // 10 second timeout for connectivity check
                validateStatus: (status) => status >= 200 && status < 500 // Accept any non-5xx status
            });

            if (response.status >= 200 && response.status < 400) {
                logger.info('Server is reachable');
                return true;
            }

            logger.warn(`Server returned status ${response.status}`);
            return false;
        } catch (error: any) {
            logger.error('Server reachability check failed:', error.message);
            logger.error('Error code:', error.code);
            
            // Log detailed error information for debugging
            if (error.code === 'ECONNREFUSED') {
                logger.error('Connection refused - server may be down or not listening');
            } else if (error.code === 'ENOTFOUND') {
                logger.error('Hostname not found - DNS resolution failed');
            } else if (error.code === 'ETIMEDOUT') {
                logger.error('Connection timed out - network issue or server unreachable');
            }
            
            return false;
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
            logger.info('Exchanging authorization code for tokens...');
            logger.info('Token URL:', tokenUrl);
            logger.info('Client ID:', this.config.clientId);
            logger.info('Redirect URI:', redirectUri);

            const response = await axios.post(tokenUrl, params, this.getAxiosConfig());

            logger.info('Token exchange successful');
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

                logger.info('SSL certificate error detected, attempting with bypass...');
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
            logger.info('Refreshing access token...');
            const response = await axios.post(tokenUrl, params, this.getAxiosConfig());

            const tokens = response.data as TokenResponse;
            await this.storeTokens(tokens);
            logger.info('Token refresh successful');
            return tokens;
        } catch (error: any) {
            console.error('Token refresh error:', error);

            // Handle SSL certificate errors during refresh
            if (error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' ||
                error.code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
                error.message.includes('certificate') ||
                error.message.includes('SSL') ||
                error.message.includes('TLS')) {

                logger.info('SSL certificate error during token refresh, bypassing...');
                this.forceSSLBypass();
            }

            throw new Error(`Failed to refresh token: ${error.response?.data?.error_description || error.message}`);
        }
    }

    /**
     * Store tokens securely using VS Code's SecretStorage
     */
    private async storeTokens(tokens: TokenResponse): Promise<void> {
        const tokenData: StoredTokenData = {
            ...tokens,
            timestamp: Date.now()
        };
        await this.context.secrets.store(KeycloakAuthService.TOKEN_KEY, JSON.stringify(tokenData));
        logger.info('Tokens stored securely');
    }

    /**
     * Retrieve stored tokens
     */
    public async getStoredTokens(): Promise<TokenResponse | null> {
        try {
            const tokenData = await this.context.secrets.get(KeycloakAuthService.TOKEN_KEY);
            if (tokenData) {
                const tokens: StoredTokenData = JSON.parse(tokenData);
                const now = Date.now();

                // Check if token is still valid (with buffer time)
                const expirationTime = tokens.timestamp + (tokens.expires_in * 1000) - TOKEN_EXPIRY_BUFFER;

                logger.info('Token check:', {
                    currentTime: new Date(now).toISOString(),
                    expirationTime: new Date(expirationTime).toISOString(),
                    timeUntilExpiry: Math.floor((expirationTime - now) / 1000) + ' seconds',
                    isValid: now < expirationTime
                });

                if (now < expirationTime) {
                    return tokens;
                } else {
                    // Try to refresh the token only if user has authenticated in this session
                    if (tokens.refresh_token && this.hasAuthenticatedThisSession) {
                        try {
                            logger.info('Token expired or expiring soon, attempting refresh...');
                            const refreshedTokens = await this.refreshToken(tokens.refresh_token);
                            logger.info('Token refreshed successfully');
                            return refreshedTokens;
                        } catch (error) {
                            console.error('Failed to refresh expired token:', error);
                            await this.clearStoredTokens();

                            // Notify user that they need to re-authenticate
                            vscode.window.showWarningMessage(
                                'Your session has expired and could not be refreshed. Please login again.',
                                'Login'
                            ).then(selection => {
                                if (selection === 'Login') {
                                    vscode.commands.executeCommand('essedum.authenticate');
                                }
                            });

                            return null;
                        }
                    } else {
                        logger.info('Token expired. User needs to authenticate.');
                        await this.clearStoredTokens();

                        // Only show notification if user was authenticated in this session
                        if (this.hasAuthenticatedThisSession) {
                            vscode.window.showWarningMessage(
                                'Your session has expired. Please login again.',
                                'Login'
                            ).then(selection => {
                                if (selection === 'Login') {
                                    vscode.commands.executeCommand('essedum.authenticate');
                                }
                            });
                        }

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

        // Reset session flag when clearing tokens
        this.hasAuthenticatedThisSession = false;

        logger.info('Stored tokens cleared', clearNetwork ? '(including network selection)' : '');
    }

    /**
     * Force fresh authentication by clearing existing tokens and performing new auth
     */
    public async forceAuthentication(): Promise<TokenResponse> {
        logger.info('Forcing fresh authentication - clearing existing tokens');

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
            logger.info('Using existing valid tokens');
            // Mark session as authenticated since we have valid tokens
            this.hasAuthenticatedThisSession = true;
            // Ensure automatic refresh is started
            if (!this.refreshTimer) {
                this.startAutomaticTokenRefresh();
            }
            return existingTokens;
        }

        // Prevent multiple concurrent auth flows
        if (this.authPromise) {
            logger.info('Auth flow already in progress, waiting...');
            return this.authPromise;
        }

        // Start new authentication flow
        logger.info('Starting new OAuth authentication flow');
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
     * Ensure we have a fresh, valid access token before making API calls
     * This proactively checks and refreshes the token if it's expired or about to expire
     * Use this before critical API operations to avoid 401 errors
     * 
     * @returns Fresh access token
     * @throws Error if authentication fails and user is not logged in
     */
    public async ensureFreshToken(): Promise<string> {
        try {
            const tokenData = await this.context.secrets.get(KeycloakAuthService.TOKEN_KEY);
            
            if (!tokenData) {
                logger.info('No token found, user needs to authenticate');
                throw new Error('Not authenticated. Please login first.');
            }

            const tokens: StoredTokenData = JSON.parse(tokenData);
            const now = Date.now();
            const expirationTime = tokens.timestamp + (tokens.expires_in * 1000);
            
            // Use a smaller buffer for proactive refresh (30 seconds)
            // This ensures we refresh before the token expires
            const proactiveRefreshBuffer = 30_000; // 30 seconds
            const refreshThreshold = expirationTime - proactiveRefreshBuffer;
            
            const timeUntilExpiry = Math.floor((expirationTime - now) / 1000);
            
            // If token is expired or will expire soon, refresh it proactively
            if (now >= refreshThreshold) {
                if (tokens.refresh_token && this.hasAuthenticatedThisSession) {
                    logger.info(`Token expires in ${timeUntilExpiry}s, refreshing proactively...`);
                    try {
                        const refreshedTokens = await this.refreshToken(tokens.refresh_token);
                        logger.info('✓ Proactive token refresh successful');
                        return refreshedTokens.access_token;
                    } catch (error) {
                        logger.error('Proactive token refresh failed:', error);
                        throw new Error('Session expired and could not be refreshed. Please login again.');
                    }
                } else {
                    logger.info('Token expired and no valid refresh token available');
                    throw new Error('Session expired. Please login again.');
                }
            }
            
            // Token is still valid
            logger.info(`Token valid for ${timeUntilExpiry} more seconds`);
            return tokens.access_token;
            
        } catch (error: any) {
            logger.error('Error ensuring fresh token:', error);
            throw error;
        }
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
    public async getAuthenticationStatus(): Promise<AuthenticationStatus> {
        try {
            const tokenData = await this.context.secrets.get(KeycloakAuthService.TOKEN_KEY);
            if (!tokenData) {
                return { isAuthenticated: false };
            }

            const tokens: StoredTokenData = JSON.parse(tokenData);
            const now = Date.now();
            const expirationTime = tokens.timestamp + (tokens.expires_in * 1000);
            const refreshTime = tokens.timestamp + (tokens.expires_in * 1000) - TOKEN_REFRESH_BEFORE_EXPIRY;

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
     * Get remaining session time in a human-readable format
     * @returns Object with remaining time details or null if not authenticated
     */
    public async getSessionTimeRemaining(): Promise<{
        totalSeconds: number;
        formatted: string;
        expiresAt: Date;
        percentRemaining: number;
    } | null> {
        try {
            const tokenData = await this.context.secrets.get(KeycloakAuthService.TOKEN_KEY);
            if (!tokenData) {
                return null;
            }

            const tokens: StoredTokenData = JSON.parse(tokenData);
            const now = Date.now();
            const expirationTime = tokens.timestamp + (tokens.expires_in * 1000);
            const totalSeconds = Math.floor((expirationTime - now) / 1000);

            if (totalSeconds <= 0) {
                return null; // Session expired
            }

            // Calculate percentage of time remaining
            const totalSessionTime = tokens.expires_in;
            const percentRemaining = Math.floor((totalSeconds / totalSessionTime) * 100);

            return {
                totalSeconds,
                formatted: this.formatDuration(totalSeconds),
                expiresAt: new Date(expirationTime),
                percentRemaining
            };
        } catch (error) {
            console.error('Error getting session time remaining:', error);
            return null;
        }
    }

    /**
     * Format duration in seconds to human-readable string
     * @param seconds - Total seconds
     * @returns Formatted string like "2h 30m" or "45m" or "30s"
     */
    private formatDuration(seconds: number): string {
        if (seconds < 0) {
            return 'Expired';
        }

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    /**
     * Show detailed session information to the user
     */
    public async showSessionInfo(): Promise<void> {
        const sessionInfo = await this.getSessionTimeRemaining();
        
        if (!sessionInfo) {
            vscode.window.showInformationMessage('No active session. Please login to continue.');
            return;
        }

        const { totalSeconds, formatted, expiresAt, percentRemaining } = sessionInfo;

        let message = `🔐 **Session Active**\n\n`;
        message += `⏱️  Time Remaining: **${formatted}**\n`;
        message += `📅 Expires: ${expiresAt.toLocaleString()}\n`;
        message += `📊 Session Health: ${percentRemaining}%\n\n`;

        if (totalSeconds < 300) { // Less than 5 minutes
            message += `⚠️ Your session will expire soon. Activity will auto-refresh it.`;
        } else {
            message += `✅ Session is healthy. Auto-refresh is active.`;
        }

        const items: string[] = [];
        
        if (totalSeconds < 600) { // Less than 10 minutes
            items.push('Refresh Now');
        }
        items.push('OK');

        const selection = await vscode.window.showInformationMessage(message, ...items);
        
        if (selection === 'Refresh Now') {
            try {
                await this.ensureFreshToken();
                vscode.window.showInformationMessage('✅ Session refreshed successfully!');
            } catch (error: any) {
                vscode.window.showErrorMessage(`Failed to refresh session: ${error.message}`);
            }
        }
    }

    /**
     * Update the status bar with current session information
     */
    private async updateSessionStatusBar(): Promise<void> {
        if (!this.sessionStatusBar) {
            return;
        }

        const sessionInfo = await this.getSessionTimeRemaining();
        
        if (!sessionInfo) {
            this.sessionStatusBar.hide();
            return;
        }

        const { totalSeconds, formatted, percentRemaining } = sessionInfo;

        // Choose icon and color based on remaining time
        let icon = '$(check)';
        let backgroundColor: vscode.ThemeColor | undefined;

        if (totalSeconds < 120) { // Less than 2 minutes - critical
            icon = '$(alert)';
            backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        } else if (totalSeconds < 300) { // Less than 5 minutes - warning
            icon = '$(warning)';
            backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        } else {
            icon = '$(clock)';
        }

        this.sessionStatusBar.text = `${icon} Session: ${formatted}`;
        this.sessionStatusBar.backgroundColor = backgroundColor;
        this.sessionStatusBar.tooltip = `Session expires in ${formatted}\nClick for details`;
        this.sessionStatusBar.show();
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
                    timeout: USERINFO_REQUEST_TIMEOUT
                });

                // Merge token claims with userinfo response
                userInfo = { ...tokenClaims, ...response.data };
            } catch (userInfoError) {
                logger.info('Could not fetch userinfo endpoint, using token claims only:', userInfoError);
            }

            return userInfo;
        } catch (error) {
            console.error('Error getting user info:', error);
            return null;
        }
    }

    /**
     * Set up axios interceptors to handle token refresh on 401 errors
     * This ensures all API calls fail fast with clear error messages
     * Token refresh is now done proactively before API calls
     */
    private setupAxiosInterceptors(): void {
        logger.info('Setting up axios interceptors for 401 error handling');

        // Response interceptor to catch 401 errors
        axios.interceptors.response.use(
            // Success handler - just return the response
            (response) => response,

            // Error handler - provide clear messages for 401 errors
            async (error) => {
                // Check if this is a 401 error
                if (error.response?.status === 401) {
                    logger.warn('Received 401 Unauthorized - token expired or invalid');

                    // Clear stored tokens since they're invalid
                    await this.clearStoredTokens();

                    // Show user-friendly notification
                    vscode.window.showErrorMessage(
                        'Session expired. Please login again to continue.',
                        'Login'
                    ).then(selection => {
                        if (selection === 'Login') {
                            vscode.commands.executeCommand('essedum.authenticate');
                        }
                    });
                }

                // For all errors (including 401), reject immediately without retry
                // This gives users fast feedback instead of making them wait
                return Promise.reject(error);
            }
        );

        logger.info('Axios interceptors configured for fast-fail on 401');
    }

    /**
     * Start automatic token refresh mechanism
     * Checks token expiry every minute and refreshes proactively
     */
    private startAutomaticTokenRefresh(): void {
        logger.info('Starting automatic token refresh mechanism');

        // Clear any existing timer
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }

        // Initial status bar update
        this.updateSessionStatusBar();

        // Check and refresh tokens periodically
        this.refreshTimer = setInterval(async () => {
            try {
                // Update status bar with current session info
                await this.updateSessionStatusBar();

                const tokenData = await this.context.secrets.get(KeycloakAuthService.TOKEN_KEY);
                if (!tokenData) {
                    return; // No tokens stored
                }

                const tokens: StoredTokenData = JSON.parse(tokenData);
                const now = Date.now();
                const expirationTime = tokens.timestamp + (tokens.expires_in * 1000);
                const refreshTime = expirationTime - KeycloakAuthService.REFRESH_BEFORE_EXPIRY;

                // Calculate time until expiry and refresh
                const timeUntilExpiry = Math.floor((expirationTime - now) / 1000);
                const timeUntilRefresh = Math.floor((refreshTime - now) / 1000);

                logger.info('Token refresh check:', {
                    timeUntilExpiry: timeUntilExpiry + ' seconds',
                    timeUntilRefresh: timeUntilRefresh + ' seconds',
                    shouldRefresh: now >= refreshTime && now < expirationTime
                });

                // If token will expire soon, refresh it proactively
                if (now >= refreshTime && now < expirationTime && tokens.refresh_token) {
                    logger.info(`Token expiring in ${timeUntilExpiry} seconds, refreshing proactively...`);
                    try {
                        await this.refreshToken(tokens.refresh_token);
                        logger.info('✓ Proactive token refresh successful');

                        // Update status bar after refresh
                        await this.updateSessionStatusBar();

                        // Optional: Show subtle notification that session was extended
                        vscode.window.setStatusBarMessage(
                            '$(check) Session extended automatically',
                            3000
                        );
                    } catch (error) {
                        console.error('Proactive token refresh failed:', error);

                        // If refresh fails and token is very close to expiry, notify user
                        if (timeUntilExpiry < TOKEN_EXPIRY_WARNING_THRESHOLD) {
                            vscode.window.showWarningMessage(
                                `⚠️ Session expiring in ${Math.floor(timeUntilExpiry / 60)} minutes. Please save your work.`,
                                'Refresh Now',
                                'Dismiss'
                            ).then(selection => {
                                if (selection === 'Refresh Now') {
                                    vscode.commands.executeCommand('essedum.authenticate');
                                }
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Error in automatic token refresh:', error);
            }
        }, KeycloakAuthService.REFRESH_CHECK_INTERVAL);
    }

    /**
     * Stop automatic token refresh
     */
    private stopAutomaticTokenRefresh(): void {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = undefined;
            logger.info('Automatic token refresh stopped');
        }

        // Hide status bar when stopping refresh
        if (this.sessionStatusBar) {
            this.sessionStatusBar.hide();
        }
    }

    /**
     * Clean up resources
     */
    public async dispose(): Promise<void> {
        this.stopAutomaticTokenRefresh();
        
        // Dispose of status bar item
        if (this.sessionStatusBar) {
            this.sessionStatusBar.dispose();
            this.sessionStatusBar = undefined;
        }
        
        await this.oauthServer.stopAuthFlow();
    }
}

export { KeycloakConfig };


