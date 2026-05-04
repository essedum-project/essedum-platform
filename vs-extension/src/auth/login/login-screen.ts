/**
 * Login Screen WebView Provider
 * 
 * Provides a WebView with network selection dropdown for Keycloak authentication.
 * Users can choose between Infosys Internal Network and LFN Network.
 * 
 * @fileoverview Login screen with network selection for Essedum AI Platform
 * @author Essedum AI Platform Team
 * @version 1.0.21
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AUTH_CONFIG, NetworkConfig } from '../constants/auth-constants';
import { setBaseUrl } from '../../constants/api-config';
import { LOGIN_VIEW_TYPE, getNonce, LOGIN_COMMANDS, LOGIN_MESSAGES } from '../constants/login-constants';
import { LoginMessage } from '../interfaces/auth.interfaces';
import * as ExtensionUtils from '../../utils/extension-utils';

const logger = ExtensionUtils.createLogger('LoginScreen');


/**
 * Login Screen WebView Provider Class
 */
export class LoginScreenProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = LOGIN_VIEW_TYPE;

    private _view?: vscode.WebviewView;
    private _disposables: vscode.Disposable[] = [];
    private _onNetworkSelected: vscode.EventEmitter<NetworkConfig> = new vscode.EventEmitter<NetworkConfig>();
    private _onLoginCancelled: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();

    public readonly onNetworkSelected: vscode.Event<NetworkConfig> = this._onNetworkSelected.event;
    public readonly onLoginCancelled: vscode.Event<void> = this._onLoginCancelled.event;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _context: vscode.ExtensionContext
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        // Set the login directory as a local resource root
        const loginDir = vscode.Uri.file(
            path.join(this._context.extensionPath, 'src', 'auth', 'login')
        );

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [this._extensionUri, loginDir]
        };

        logger.info('Login screen webview initialized');
        logger.info('Extension URI:', this._extensionUri.toString());
        logger.info('Login directory URI:', loginDir.toString());

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            (message: LoginMessage) => {
                switch (message.command) {
                    case LOGIN_COMMANDS.LOGIN:
                        if (message.network === 'custom' && message.config) {
                            // Handle custom network configuration
                            const customNetworkConfig: NetworkConfig = {
                                id: 'infosys' as any, // Using infosys as fallback type
                                name: 'custom',
                                displayName: 'Custom Network',
                                issuerUri: message.config.issuerUri,
                                jwkSetUri: message.config.jwkSetUri,
                                clientId: message.config.clientId,
                                scope: 'openid profile email',
                                claim: 'preferred_username',
                                createUserIfNotExist: true,
                                silentRefreshTimeoutFactor: 0.75,
                                baseURL: message.config.baseURL
                            };
                            setBaseUrl(customNetworkConfig.baseURL);
                            this._onNetworkSelected.fire(customNetworkConfig);
                        } else if (message.network) {
                            // Handle predefined network
                            const networkConfig = AUTH_CONFIG.NETWORKS[message.network.toUpperCase() as keyof typeof AUTH_CONFIG.NETWORKS];
                            if (networkConfig) {
                                setBaseUrl(networkConfig.baseURL);
                                this._onNetworkSelected.fire(networkConfig);
                            }
                        }
                        break;
                    case LOGIN_COMMANDS.CANCEL:
                        this._onLoginCancelled.fire();
                        break;
                    case LOGIN_COMMANDS.READY:
                        // Webview is ready, can send initial data if needed
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    /**
     * Show a loading state in the webview
     */
    public showLoading(message: string = LOGIN_MESSAGES.DEFAULT_LOADING) {
        if (this._view) {
            this._view.webview.postMessage({
                command: LOGIN_COMMANDS.SHOW_LOADING,
                message: message
            });
        }
    }

    /**
     * Hide loading state and show the form again
     */
    public hideLoading() {
        if (this._view) {
            this._view.webview.postMessage({
                command: LOGIN_COMMANDS.HIDE_LOADING
            });
        }
    }

    /**
     * Show an error message in the webview
     */
    public showError(message: string) {
        if (this._view) {
            this._view.webview.postMessage({
                command: LOGIN_COMMANDS.SHOW_ERROR,
                message: message
            });
        }
    }

    /**
     * Reset the webview to initial state
     */
    public reset() {
        if (this._view) {
            this._view.webview.postMessage({
                command: LOGIN_COMMANDS.RESET
            });
        }
    }

    /**
     * Generate the HTML content for the webview
     */
    private _getHtmlForWebview(webview: vscode.Webview): string {
        // Use the correct login path - check if we're in development or production
        const isDevelopment = fs.existsSync(path.join(this._context.extensionPath, 'src'));
        const loginDir = isDevelopment
            ? path.join(this._context.extensionPath, 'src', 'auth', 'login')
            : path.join(this._context.extensionPath, 'dist', 'auth', 'login');

        // Load HTML template
        const htmlPath = path.join(loginDir, 'login-screen.html');

        let htmlContent = '';
        try {
            if (!fs.existsSync(htmlPath)) {
                console.error('HTML template not found at:', htmlPath);
                return this._getFallbackHtml(webview);
            }
            htmlContent = fs.readFileSync(htmlPath, 'utf8');
            logger.info('Successfully loaded HTML template from:', htmlPath);
        } catch (error) {
            console.error('Failed to read HTML template:', error);
            return this._getFallbackHtml(webview);
        }

        // Get CSS URI
        const cssPath = path.join(loginDir, 'login-screen.css');
        if (!fs.existsSync(cssPath)) {
            console.error('CSS file not found at:', cssPath);
        }
        const cssUri = webview.asWebviewUri(vscode.Uri.file(cssPath));
        logger.info('CSS URI:', cssUri.toString());

        // Get JS URI
        const jsPath = path.join(loginDir, 'login-screen-client.js');
        if (!fs.existsSync(jsPath)) {
            console.error('JS file not found at:', jsPath);
        }
        const jsUri = webview.asWebviewUri(vscode.Uri.file(jsPath));
        logger.info('JS URI:', jsUri.toString());

        // Generate nonce for CSP
        const nonce = getNonce();

        // Replace placeholders
        htmlContent = htmlContent
            .replace(/\{\{cspSource\}\}/g, webview.cspSource)
            .replace(/\{\{nonce\}\}/g, nonce)
            .replace(/\{\{CSS_URI\}\}/g, cssUri.toString())
            .replace(/\{\{JS_URI\}\}/g, jsUri.toString());

        return htmlContent;
    }

    /**
     * Fallback HTML when template files cannot be loaded
     */
    private _getFallbackHtml(webview: vscode.Webview): string {
        const nonce = getNonce();

        // Try to load fallback HTML from file
        const isDevelopment = fs.existsSync(path.join(this._context.extensionPath, 'src'));
        const fallbackPath = isDevelopment
            ? path.join(this._context.extensionPath, 'src', 'auth', 'providers', 'login-fallback.html')
            : path.join(this._context.extensionPath, 'dist', 'auth', 'providers', 'login-fallback.html');

        try {
            let fallbackContent = fs.readFileSync(fallbackPath, 'utf8');
            return fallbackContent
                .replace(/\{\{cspSource\}\}/g, webview.cspSource)
                .replace(/\{\{nonce\}\}/g, nonce);
        } catch (error) {
            console.error('Failed to read fallback HTML template:', error);
            // Ultimate fallback if file loading fails
            return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
                <title>Error</title>
            </head>
            <body>
                <div style="padding: 20px; text-align: center;">
                    <h1>${LOGIN_MESSAGES.CRITICAL_ERROR_TITLE}</h1>
                    <p>${LOGIN_MESSAGES.CRITICAL_ERROR_MESSAGE}</p>
                </div>
            </body>
            </html>`;
        }
    }

    public dispose() {
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
        this._onNetworkSelected.dispose();
        this._onLoginCancelled.dispose();
    }
}



