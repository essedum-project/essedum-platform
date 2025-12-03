/**
 * Login Screen WebView Provider
 * 
 * Provides a WebView with network selection dropdown for Keycloak authentication.
 * Users can choose between Infosys Internal Network and LFN Network.
 * 
 * @fileoverview Login screen with network selection for Essedum AI Platform
 * @author Essedum AI Platform Team
 * @version 1.0.0
 */

import * as vscode from 'vscode';
import { AUTH_CONFIG, NetworkConfig, NetworkType } from '../constants/app-constants';
import {  setBaseUrl } from '../constants/api-config';

/**
 * Message types for communication between webview and extension
 */
interface LoginMessage {
    command: 'login' | 'cancel' | 'ready';
    network?: NetworkType;
}

/**
 * Login Screen WebView Provider Class
 */
export class LoginScreenProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'essedum-login';
    
    private _view?: vscode.WebviewView;
    private _disposables: vscode.Disposable[] = [];
    private _onNetworkSelected: vscode.EventEmitter<NetworkConfig> = new vscode.EventEmitter<NetworkConfig>();
    private _onLoginCancelled: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    
    public readonly onNetworkSelected: vscode.Event<NetworkConfig> = this._onNetworkSelected.event;
    public readonly onLoginCancelled: vscode.Event<void> = this._onLoginCancelled.event;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            (message: LoginMessage) => {
                switch (message.command) {
                    case 'login':
                        if (message.network) {
                            const networkConfig = AUTH_CONFIG.NETWORKS[message.network.toUpperCase() as keyof typeof AUTH_CONFIG.NETWORKS];
                            if (networkConfig) {
                               setBaseUrl(networkConfig.baseURL);
                                this._onNetworkSelected.fire(networkConfig);
                            }
                        }
                        break;
                    case 'cancel':
                        this._onLoginCancelled.fire();
                        break;
                    case 'ready':
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
    public showLoading(message: string = 'Authenticating...') {
        if (this._view) {
            this._view.webview.postMessage({
                command: 'showLoading',
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
                command: 'hideLoading'
            });
        }
    }

    /**
     * Show an error message in the webview
     */
    public showError(message: string) {
        if (this._view) {
            this._view.webview.postMessage({
                command: 'showError',
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
                command: 'reset'
            });
        }
    }

    /**
     * Generate the HTML content for the webview
     */
    private _getHtmlForWebview(webview: vscode.Webview): string {
        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Essedum Login</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    padding: 20px;
                    margin: 0;
                }
                
                .container {
                    max-width: 400px;
                    margin: 0 auto;
                    text-align: center;
                }
                
                .logo {
                    margin-bottom: 30px;
                }
                
                .logo h1 {
                    color: var(--vscode-textLink-foreground);
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                }
                
                .logo p {
                    color: var(--vscode-descriptionForeground);
                    margin: 5px 0 0 0;
                    font-size: 14px;
                }
                
                .login-form {
                    background-color: var(--vscode-input-background);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 6px;
                    padding: 30px;
                    margin-bottom: 20px;
                }
                
                .form-group {
                    margin-bottom: 20px;
                    text-align: left;
                }
                
                label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: var(--vscode-input-foreground);
                }
                
                select {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 4px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    font-size: 14px;
                    font-family: var(--vscode-font-family);
                }
                
                select:focus {
                    outline: none;
                    border-color: var(--vscode-focusBorder);
                    box-shadow: 0 0 0 1px var(--vscode-focusBorder);
                }
                
                .network-info {
                    margin-top: 10px;
                    padding: 10px;
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                    border-radius: 4px;
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                    text-align: left;
                }
                
                .network-info.infosys {
                    border-left: 3px solid var(--vscode-charts-blue);
                }
                
                .network-info.lfn {
                    border-left: 3px solid var(--vscode-charts-green);
                }
                
                .button-group {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    margin-top: 20px;
                }
                
                button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    font-size: 14px;
                    font-family: var(--vscode-font-family);
                    cursor: pointer;
                    min-width: 100px;
                    transition: all 0.2s ease;
                }
                
                .btn-primary {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }
                
                .btn-primary:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                
                .btn-primary:disabled {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    cursor: not-allowed;
                }
                
                .btn-secondary {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                }
                
                .btn-secondary:hover {
                    background-color: var(--vscode-button-secondaryHoverBackground);
                }
                
                .loading {
                    display: none;
                    text-align: center;
                    margin: 20px 0;
                }
                
                .loading.show {
                    display: block;
                }
                
                .spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 2px solid var(--vscode-progressBar-background);
                    border-radius: 50%;
                    border-top-color: var(--vscode-progressBar-foreground);
                    animation: spin 1s ease-in-out infinite;
                    margin-right: 10px;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .error {
                    display: none;
                    background-color: var(--vscode-inputValidation-errorBackground);
                    border: 1px solid var(--vscode-inputValidation-errorBorder);
                    color: var(--vscode-inputValidation-errorForeground);
                    padding: 10px;
                    border-radius: 4px;
                    margin-bottom: 20px;
                    font-size: 13px;
                }
                
                .error.show {
                    display: block;
                }
                
                .form-section {
                    transition: opacity 0.3s ease;
                }
                
                .form-section.disabled {
                    opacity: 0.6;
                    pointer-events: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <h1>🔐 Essedum AI Platform</h1>
                    <p>Please select your authentication network</p>
                </div>
                
                <div id="errorMessage" class="error"></div>
                
                <div class="login-form">
                    <div id="formSection" class="form-section">
                        <div class="form-group">
                            <label for="networkSelect">Authentication Network:</label>
                            <select id="networkSelect">
                                <option value="">-- Select Network --</option>
                                <option value="infosys">Infosys Internal Network</option>
                                <option value="lfn">LFN Network</option>
                            </select>
                            
                            <div id="networkInfo" class="network-info" style="display: none;">
                                <div id="infosysInfo" style="display: none;">
                                    <strong>Infosys Internal Network</strong><br>
                                    Server: aiplatform.az.ad.idemo-ppc.com<br>
                                    For Infosys employees and internal users
                                </div>
                                <div id="lfnInfo" style="display: none;">
                                    <strong>LFN Network</strong><br>
                                    Server: login.lfn.essedum.anuket.iol.unh.edu<br>
                                    For Linux Foundation Networking users
                                </div>
                            </div>
                        </div>
                        
                        <div class="button-group">
                            <button id="loginBtn" class="btn-primary" disabled>Login</button>
                            <button id="cancelBtn" class="btn-secondary">Cancel</button>
                        </div>
                    </div>
                    
                    <div id="loadingSection" class="loading">
                        <div class="spinner"></div>
                        <span id="loadingMessage">Authenticating...</span>
                    </div>
                </div>
            </div>

            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                
                // DOM elements
                const networkSelect = document.getElementById('networkSelect');
                const networkInfo = document.getElementById('networkInfo');
                const infosysInfo = document.getElementById('infosysInfo');
                const lfnInfo = document.getElementById('lfnInfo');
                const loginBtn = document.getElementById('loginBtn');
                const cancelBtn = document.getElementById('cancelBtn');
                const errorMessage = document.getElementById('errorMessage');
                const loadingSection = document.getElementById('loadingSection');
                const formSection = document.getElementById('formSection');
                const loadingMessage = document.getElementById('loadingMessage');
                
                // Network selection handler
                networkSelect.addEventListener('change', function() {
                    const selectedNetwork = this.value;
                    
                    // Reset info display
                    infosysInfo.style.display = 'none';
                    lfnInfo.style.display = 'none';
                    networkInfo.style.display = 'none';
                    networkInfo.className = 'network-info';
                    
                    if (selectedNetwork) {
                        networkInfo.style.display = 'block';
                        networkInfo.classList.add(selectedNetwork);
                        
                        if (selectedNetwork === 'infosys') {
                            infosysInfo.style.display = 'block';
                        } else if (selectedNetwork === 'lfn') {
                            lfnInfo.style.display = 'block';
                        }
                        
                        loginBtn.disabled = false;
                    } else {
                        loginBtn.disabled = true;
                    }
                    
                    hideError();
                });
                
                // Login button handler
                loginBtn.addEventListener('click', function() {
                    const selectedNetwork = networkSelect.value;
                    if (selectedNetwork) {
                        vscode.postMessage({
                            command: 'login',
                            network: selectedNetwork
                        });
                    }
                });
                
                // Cancel button handler
                cancelBtn.addEventListener('click', function() {
                    vscode.postMessage({
                        command: 'cancel'
                    });
                });
                
                // Message handler for extension communication
                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    switch (message.command) {
                        case 'showLoading':
                            showLoading(message.message || 'Authenticating...');
                            break;
                        case 'hideLoading':
                            hideLoading();
                            break;
                        case 'showError':
                            showError(message.message);
                            break;
                        case 'reset':
                            reset();
                            break;
                    }
                });
                
                function showLoading(message) {
                    loadingMessage.textContent = message;
                    formSection.classList.add('disabled');
                    loadingSection.classList.add('show');
                    hideError();
                }
                
                function hideLoading() {
                    formSection.classList.remove('disabled');
                    loadingSection.classList.remove('show');
                }
                
                function showError(message) {
                    errorMessage.textContent = message;
                    errorMessage.classList.add('show');
                    hideLoading();
                }
                
                function hideError() {
                    errorMessage.classList.remove('show');
                }
                
                function reset() {
                    networkSelect.value = '';
                    networkInfo.style.display = 'none';
                    infosysInfo.style.display = 'none';
                    lfnInfo.style.display = 'none';
                    loginBtn.disabled = true;
                    hideLoading();
                    hideError();
                }
                
                // Notify extension that webview is ready
                vscode.postMessage({
                    command: 'ready'
                });
            </script>
        </body>
        </html>`;
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

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}