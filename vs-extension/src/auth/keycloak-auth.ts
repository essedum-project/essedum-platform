import * as vscode from 'vscode';
import axios from 'axios';
import * as https from 'https';

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
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

export class KeycloakAuthService {
    private static readonly TOKEN_KEY = 'keycloak_tokens';
    
    private config: KeycloakConfig;
    private context: vscode.ExtensionContext;
    private authPromise?: Promise<TokenResponse>;

    constructor(config: KeycloakConfig, context: vscode.ExtensionContext) {
        this.config = config;
        this.context = context;
    }

    /**
     * Create HTTPS agent that can handle self-signed certificates
     */
    private createHttpsAgent(): https.Agent {
        const config = vscode.workspace.getConfiguration('essedum.auth');
        const allowSelfSigned = config.get<boolean>('allowSelfSignedCertificates', true);
        
        return new https.Agent({
            rejectUnauthorized: !allowSelfSigned
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
     * Initiate device authorization flow
     */
    private async initiateDeviceFlow(): Promise<DeviceCodeResponse> {
        const deviceAuthUrl = `${this.config.issuerUri}/protocol/openid-connect/auth/device`;
        
        const params = new URLSearchParams();
        params.append('client_id', this.config.clientId);
        params.append('scope', this.config.scope);

        try {
            const response = await axios.post(deviceAuthUrl, params, this.getAxiosConfig());

            return response.data as DeviceCodeResponse;
        } catch (error: any) {
            console.error('Device flow initiation error:', error);
            
            // Handle certificate errors specifically
            if (error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' || 
                error.code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
                error.message.includes('certificate')) {
                
                const continueAuth = await this.showCertificateWarning();
                if (!continueAuth) {
                    throw new Error('Authentication cancelled due to certificate issues');
                }
                
                // If user accepts, the HTTPS agent should handle it
                throw new Error(`Certificate error persists: ${error.message}. Please check your Keycloak server configuration.`);
            }
            
            throw new Error(`Failed to initiate device flow: ${error.response?.data?.error_description || error.message}`);
        }
    }

    /**
     * Poll for token using device code
     */
    private async pollForToken(deviceCode: string, interval: number, expiresIn: number): Promise<TokenResponse> {
        const tokenUrl = `${this.config.issuerUri}/protocol/openid-connect/token`;
        const startTime = Date.now();
        const timeoutMs = expiresIn * 1000;

        while (Date.now() - startTime < timeoutMs) {
            const params = new URLSearchParams();
            params.append('grant_type', 'urn:ietf:params:oauth:grant-type:device_code');
            params.append('client_id', this.config.clientId);
            params.append('device_code', deviceCode);

            try {
                const response = await axios.post(tokenUrl, params, this.getAxiosConfig());

                const tokens = response.data as TokenResponse;
                await this.storeTokens(tokens);
                return tokens;
            } catch (error: any) {
                const errorCode = error.response?.data?.error;
                
                if (errorCode === 'authorization_pending') {
                    // Continue polling
                    await new Promise(resolve => setTimeout(resolve, interval * 1000));
                    continue;
                } else if (errorCode === 'slow_down') {
                    // Increase polling interval
                    interval += 5;
                    await new Promise(resolve => setTimeout(resolve, interval * 1000));
                    continue;
                } else if (errorCode === 'expired_token') {
                    throw new Error('Device code expired. Please try again.');
                } else if (errorCode === 'access_denied') {
                    throw new Error('Access denied. User cancelled authorization.');
                } else {
                    throw new Error(`Token polling error: ${error.response?.data?.error_description || error.message}`);
                }
            }
        }

        throw new Error('Device code expired. Please try again.');
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
            const response = await axios.post(tokenUrl, params, this.getAxiosConfig());

            const tokens = response.data as TokenResponse;
            await this.storeTokens(tokens);
            return tokens;
        } catch (error: any) {
            console.error('Token refresh error:', error);
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
                            return await this.refreshToken(tokens.refresh_token);
                        } catch (error) {
                            console.error('Failed to refresh expired token:', error);
                            await this.clearStoredTokens();
                            return null;
                        }
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
    }

    /**
     * Check if device flow is supported by testing the endpoint
     */
    private async isDeviceFlowSupported(): Promise<boolean> {
        try {
            const deviceAuthUrl = `${this.config.issuerUri}/protocol/openid-connect/auth/device`;
            const response = await axios.head(deviceAuthUrl, {
                httpsAgent: this.createHttpsAgent(),
                timeout: 5000
            });
            return response.status < 400;
        } catch (error: any) {
            console.log('Device flow endpoint check failed:', error.message);
            return false;
        }
    }

    /**
     * Fallback to manual token input if device flow is not supported
     */
    private async performManualTokenAuth(): Promise<TokenResponse> {
        // Open Keycloak in browser for manual authentication
        const loginUrl = `${this.config.issuerUri}/protocol/openid-connect/auth?client_id=${this.config.clientId}&response_type=code&scope=${this.config.scope}&redirect_uri=urn:ietf:wg:oauth:2.0:oob`;
        
        await vscode.env.openExternal(vscode.Uri.parse(loginUrl));
        
        // Ask user to manually copy the token
        const result = await vscode.window.showInputBox({
            prompt: 'After logging in, please paste the access token here',
            placeHolder: 'Paste your access token...',
            password: true,
            ignoreFocusOut: true
        });
        
        if (!result) {
            throw new Error('Authentication cancelled');
        }
        
        // Create a mock token response (you might need to adjust this based on your needs)
        const tokens: TokenResponse = {
            access_token: result.trim(),
            refresh_token: '', // Will be empty in manual mode
            expires_in: 3600, // 1 hour default
            token_type: 'Bearer'
        };
        
        await this.storeTokens(tokens);
        return tokens;
    }

    /**
     * Perform OAuth 2.0 authentication flow
     */
    public async authenticate(): Promise<TokenResponse> {
        // Check if we already have valid tokens
        const existingTokens = await this.getStoredTokens();
        if (existingTokens) {
            return existingTokens;
        }

        // Prevent multiple concurrent auth flows
        if (this.authPromise) {
            return this.authPromise;
        }

        // Check if device flow is supported
        const supportsDeviceFlow = await this.isDeviceFlowSupported();
        
        if (supportsDeviceFlow) {
            this.authPromise = this.performDeviceFlow();
        } else {
            console.log('Device flow not supported, falling back to manual authentication');
            vscode.window.showWarningMessage('Device flow not supported by this Keycloak server. Using manual authentication.');
            this.authPromise = this.performManualTokenAuth();
        }
        
        try {
            const tokens = await this.authPromise;
            this.authPromise = undefined;
            return tokens;
        } catch (error) {
            this.authPromise = undefined;
            throw error;
        }
    }

    private async performDeviceFlow(): Promise<TokenResponse> {
        try {
            // Step 1: Get device code
            const deviceResponse = await this.initiateDeviceFlow();
            
            // Step 2: Show user code and open verification URL
            const userCode = deviceResponse.user_code;
            const verificationUri = deviceResponse.verification_uri_complete || deviceResponse.verification_uri;
            
            // Copy user code to clipboard for convenience
            await vscode.env.clipboard.writeText(userCode);
            
            // Show user code and instructions
            const choice = await vscode.window.showInformationMessage(
                `To authenticate, visit: ${deviceResponse.verification_uri}\n\nEnter this code: ${userCode}\n\n(Code copied to clipboard)`,
                { modal: true },
                'Open Browser',
                'I\'ve completed authentication'
            );
            
            if (choice === 'Open Browser') {
                await vscode.env.openExternal(vscode.Uri.parse(verificationUri));
            }
            
            if (choice !== 'Open Browser' && choice !== 'I\'ve completed authentication') {
                throw new Error('Authentication cancelled');
            }

            // Step 3: Poll for tokens
            vscode.window.showInformationMessage('Waiting for authentication completion...');
            
            const tokens = await this.pollForToken(
                deviceResponse.device_code,
                deviceResponse.interval,
                deviceResponse.expires_in
            );
            
            return tokens;
        } catch (error: any) {
            console.error('Device flow authentication error:', error);
            
            // Provide more specific error messages
            if (error.message.includes('certificate')) {
                throw new Error(`SSL Certificate Error: ${error.message}\n\nThis usually happens with self-signed certificates. Please ensure your Keycloak server has a valid SSL certificate or contact your administrator.`);
            } else if (error.message.includes('ECONNREFUSED')) {
                throw new Error(`Connection Error: Cannot connect to Keycloak server at ${this.config.issuerUri}. Please check the server URL and ensure it's accessible.`);
            } else if (error.message.includes('ENOTFOUND')) {
                throw new Error(`DNS Error: Cannot resolve hostname for ${this.config.issuerUri}. Please check the server URL.`);
            }
            
            throw new Error(`Device flow authentication failed: ${error.message}`);
        }
    }

    /**
     * Logout user and clear stored tokens
     */
    public async logout(): Promise<void> {
        await this.clearStoredTokens();
        
        // Optionally, you can also call Keycloak's logout endpoint
        const logoutUrl = `${this.config.issuerUri}/protocol/openid-connect/logout`;
        await vscode.env.openExternal(vscode.Uri.parse(logoutUrl));
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
}