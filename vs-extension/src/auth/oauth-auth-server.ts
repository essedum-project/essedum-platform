import * as http from 'http';
import * as url from 'url';
import * as crypto from 'crypto';
import * as vscode from 'vscode';

export interface AuthCodeResponse {
    code: string;
    state: string;
}

export interface PKCEChallenge {
    codeVerifier: string;
    codeChallenge: string;
}

export class OAuthAuthServer {
    private server?: http.Server;
    private readonly port: number;
    private readonly redirectUri: string;
    private authPromise?: Promise<AuthCodeResponse>;
    private authResolve?: (value: AuthCodeResponse) => void;
    private authReject?: (reason: any) => void;

    constructor() {
        // Get port from configuration
        const config = vscode.workspace.getConfiguration('essedum.auth');
        this.port = config.get<number>('oauthPort', 8085);
        this.redirectUri = `http://localhost:${this.port}/callback`;
    }

    /**
     * Generate PKCE code verifier and challenge
     */
    public generatePKCE(): PKCEChallenge {
        const codeVerifier = crypto
            .randomBytes(32)
            .toString('base64url');

        const codeChallenge = crypto
            .createHash('sha256')
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
        return crypto.randomBytes(16).toString('hex');
    }

    /**
     * Start the local HTTP server to capture the authorization code
     */
    private async startServer(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server = http.createServer((req, res) => {
                const parsedUrl = url.parse(req.url || '', true);

                if (parsedUrl.pathname === '/callback') {
                    const { code, state, error, error_description } = parsedUrl.query;

                    // Set CORS headers
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                    if (error) {
                        const errorMsg = `OAuth Error: ${error}${error_description ? ` - ${error_description}` : ''}`;
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.end(`
                            <html>
                                <head><title>Authentication Error</title></head>
                                <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                                    <h1 style="color: #d32f2f;">Authentication Error</h1>
                                    <p>${errorMsg}</p>
                                    <p>You can close this window and try again.</p>
                                    <script>
                                        setTimeout(() => window.close(), 3000);
                                    </script>
                                </body>
                            </html>
                        `);

                        if (this.authReject) {
                            this.authReject(new Error(errorMsg));
                        }
                        return;
                    }

                    if (code && state) {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(`                            
                            <html lang="en">
                            <head>
                               <meta charset="UTF-8" />
                               <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                               <title>Authentication Successful</title>
                               <style>
                                 body {
                                   margin: 0;
                                   font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                   background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                                   color: #fff;
                                   display: flex;
                                   justify-content: center;
                                   align-items: center;
                                   height: 100vh;
                                   text-align: center;
                               }

                                .container {
                                  background: rgba(255, 255, 255, 0.1);
                                  padding: 40px;
                                  border-radius: 12px;
                                  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                                  max-width: 500px;
                                }

                                .icon {
                                  font-size: 60px;
                                  margin-bottom: 20px;
                                }

                                 h1 {
                                   font-size: 32px;
                                   margin-bottom: 10px;
                                   }

                                 p {
                                    font-size: 18px;
                                    margin-bottom: 30px;
                                   }

                                .button {
                                    background-color: #ffffff;
                                    color: #0078d7;
                                    padding: 12px 24px;
                                    border: none;
                                    border-radius: 8px;
                                    font-size: 16px;
                                    cursor: pointer;
                                    transition: background-color 0.3s ease;
                                   }

                                .button:hover {
                                   background-color: #e0e0e0;
                                }
                                </style>
                              </head>
                            <body>
                                <div class="container">
                                <div class="icon">🔐</div>
                                <h1>Authentication Successful!</h1>
                                <p>You’ve been securely signed in.</p>
                                <p>You can now close this window and return to VS Code.</p>    
                                </div>
                              </body>
                            </html>
                        `);

                        if (this.authResolve) {
                            this.authResolve({
                                code: code as string,
                                state: state as string
                            });
                        }
                    } else {
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.end(`
                            <html>
                                <head><title>Authentication Error</title></head>
                                <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                                    <h1 style="color: #d32f2f;">Authentication Error</h1>
                                    <p>Missing authorization code or state parameter.</p>
                                    <p>You can close this window and try again.</p>
                                    <script>
                                        setTimeout(() => window.close(), 3000);
                                    </script>
                                </body>
                            </html>
                        `);

                        if (this.authReject) {
                            this.authReject(new Error('Missing authorization code or state parameter'));
                        }
                    }
                } else {
                    // Handle other paths
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(`
                        <html>
                            <head><title>Essedum OAuth Server</title></head>
                            <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                                <h1>Essedum OAuth Callback Server</h1>
                                <p>This server is running to handle OAuth authentication callbacks.</p>
                                <p>Please complete the authentication flow in your browser.</p>
                            </body>
                        </html>
                    `);
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
                console.log(`OAuth callback server started on http://localhost:${this.port}`);
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
                    console.log('OAuth callback server stopped');
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
     */
    public async startAuthFlow(authUrl: string, timeoutMs: number = 120000): Promise<AuthCodeResponse> {
        // Clean up any existing auth flow
        await this.stopAuthFlow();

        // Force SSL bypass for development environment
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

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
            console.log('Opened browser for OAuth authentication');
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