import * as http from 'http';
import * as url from 'url';
import * as crypto from 'crypto';
import * as vscode from 'vscode';
import { AuthCodeResponse, PKCEChallenge } from '../interfaces/auth.interfaces';
import {
    DEFAULT_OAUTH_PORT,
    DEFAULT_OAUTH_TIMEOUT,
    OAUTH_CALLBACK_PATH,
    OAUTH_CONFIG_SECTION,
    OAUTH_PORT_CONFIG_KEY,
    PKCE_VERIFIER_LENGTH,
    PKCE_STATE_LENGTH,
    PKCE_HASH_ALGORITHM
} from '../constants/oauth-constants';
import { HtmlTemplateLoader } from '../utils/html-template-loader.util';
import { shouldBypassSSL, configureSSLEnvironment } from '../../utils/ssl-config.util';
import * as ExtensionUtils from '../../utils/extension-utils';

const logger = ExtensionUtils.createLogger('OAuthAuthServer');

export { AuthCodeResponse, PKCEChallenge };

/**
 * OAuth Authorization Server
 * Local HTTP server for handling OAuth 2.0 authorization code callback
 */
export class OAuthAuthServer {
    private server?: http.Server;
    private readonly port: number;
    private readonly redirectUri: string;
    private authPromise?: Promise<AuthCodeResponse>;
    private authResolve?: (value: AuthCodeResponse) => void;
    private authReject?: (reason: any) => void;
    private templateLoader: HtmlTemplateLoader;
    private context?: vscode.ExtensionContext;

    constructor(extensionPath: string, context?: vscode.ExtensionContext) {
        // Get port from configuration
        const config = vscode.workspace.getConfiguration(OAUTH_CONFIG_SECTION);
        this.port = config.get<number>(OAUTH_PORT_CONFIG_KEY, DEFAULT_OAUTH_PORT);
        this.redirectUri = `http://localhost:${this.port}${OAUTH_CALLBACK_PATH}`;
        this.templateLoader = new HtmlTemplateLoader(extensionPath);
        this.context = context;
    }

    /**
     * Generate PKCE code verifier and challenge
     */
    public generatePKCE(): PKCEChallenge {
        const codeVerifier = crypto
            .randomBytes(PKCE_VERIFIER_LENGTH)
            .toString('base64url');

        const codeChallenge = crypto
            .createHash(PKCE_HASH_ALGORITHM)
            .update(codeVerifier)
            .digest('base64url');

        return {
            codeVerifier,
            codeChallenge
        };
    }

    /**
     * Generate a random state parameter for CSRF protection
     */
    public generateState(): string {
        return crypto.randomBytes(PKCE_STATE_LENGTH).toString('hex');
    }

    /**
     * Start the local HTTP server to capture the authorization code
     */
    private async startServer(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server = http.createServer((req, res) => {
                const parsedUrl = url.parse(req.url || '', true);

                if (parsedUrl.pathname === OAUTH_CALLBACK_PATH) {
                    const { code, state, error, error_description } = parsedUrl.query;

                    // Set CORS headers
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                    if (error) {
                        const errorMsg = `OAuth Error: ${error}${error_description ? ` - ${error_description}` : ''}`;
                        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(this.templateLoader.getErrorTemplate(errorMsg));

                        if (this.authReject) {
                            this.authReject(new Error(errorMsg));
                        }
                        return;
                    }

                    if (code && state) {
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(this.templateLoader.getSuccessTemplate());

                        if (this.authResolve) {
                            this.authResolve({
                                code: code as string,
                                state: state as string
                            });
                        }
                    } else {
                        const errorMsg = 'Missing authorization code or state parameter';
                        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(this.templateLoader.getErrorTemplate(errorMsg));

                        if (this.authReject) {
                            this.authReject(new Error(errorMsg));
                        }
                    }
                } else {
                    // Handle other paths - show info page
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(this.templateLoader.getServerInfoTemplate());
                }
            });

            this.server.on('error', (err: any) => {
                if (err.code === 'EADDRINUSE') {
                    reject(new Error(`Port ${this.port} is already in use. Please close any applications using this port and try again.`));
                } else {
                    reject(err);
                }
            });

            this.server.listen(this.port, 'localhost', () => {
                logger.info(`OAuth callback server started on http://localhost:${this.port}`);
                resolve();
            });
        });
    }

    /**
     * Stop the local HTTP server
     */
    private async stopServer(): Promise<void> {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    logger.info('OAuth callback server stopped');
                    this.server = undefined;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Start the OAuth authorization flow
     * @param authUrl - The OAuth authorization URL to open in browser
     * @param timeoutMs - Timeout in milliseconds (default: 2 minutes)
     */
    public async startAuthFlow(authUrl: string, timeoutMs: number = DEFAULT_OAUTH_TIMEOUT): Promise<AuthCodeResponse> {
        // Clean up any existing auth flow
        await this.stopAuthFlow();

        // Configure SSL based on network selection (Infosys only)
        if (this.context) {
            configureSSLEnvironment(this.context);
            const bypass = shouldBypassSSL(this.context);
            logger.info(`OAuth flow - SSL bypass: ${bypass}`);
        }

        // Start the local server
        await this.startServer();

        // Create a promise for the auth result
        this.authPromise = new Promise<AuthCodeResponse>((resolve, reject) => {
            this.authResolve = resolve;
            this.authReject = reject;

            // Set a timeout
            setTimeout(() => {
                reject(new Error('Authentication timeout. Please try again.'));
            }, timeoutMs);
        });

        // Open the browser
        try {
            await vscode.env.openExternal(vscode.Uri.parse(authUrl));
            logger.info('Opened browser for OAuth authentication');
        } catch (error) {
            await this.stopAuthFlow();
            throw new Error(`Failed to open browser: ${error}`);
        }

        try {
            // Wait for the auth result
            const result = await this.authPromise;
            await this.stopAuthFlow();
            return result;
        } catch (error) {
            await this.stopAuthFlow();
            throw error;
        }
    }

    /**
     * Stop the current auth flow and clean up
     */
    public async stopAuthFlow(): Promise<void> {
        // Reject any pending auth promise
        if (this.authReject) {
            this.authReject(new Error('Authentication flow cancelled'));
        }

        // Clear promise references
        this.authPromise = undefined;
        this.authResolve = undefined;
        this.authReject = undefined;

        // Stop the server
        await this.stopServer();
    }

    /**
     * Get the redirect URI for this server
     */
    public getRedirectUri(): string {
        return this.redirectUri;
    }

    /**
     * Check if the server is currently running
     */
    public isRunning(): boolean {
        return !!this.server && this.server.listening;
    }
}



