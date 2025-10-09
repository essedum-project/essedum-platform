// Pipeline Cards Component for displaying Essedum pipeline data
import * as vscode from 'vscode';
import axios from 'axios';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';
import FormData from 'form-data';
import { EssedumFileSystemProvider } from '../../providers/essedum-file-provider';
import { JobLogsViewer } from './job-logs-viewer';
import { API_ENDPOINTS, createSecureAxiosConfig, createHTTPSAgent, BASE_URL, initializeSSLBypass } from '../../constants/api-config';
import { HttpParams, JobStatus, PipelineCard, PipelineScript, ScriptFile } from '../../interfaces/pipeline.interfaces';
import { PipelineService } from '../../services/pipeline.service';

export class PipelineCardsProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private _extensionUri: vscode.Uri;
    private _token: string = '';
    private _isAuthenticated: boolean = false;
    private _authService?: any; // Will be injected from extension
    private _fileProvider?: EssedumFileSystemProvider; // File provider for upload operations
    private _currentPipelineName?: string; // Track current pipeline for file system operations

    // Configuration
    private pageNumber: number = 1;
    private pageSize: number = 4;
    private totalCount: number = 0;
    private totalPages: number = 0;
    private allCards: PipelineCard[] = []; // Store all cards for client-side pagination
    private organization: string = 'leo1311';
    private filter: string = '';
    private selectedAdapterType: string[] = [];
    private editingScripts?: Map<string, any>; // Track editing sessions
    private script: string[] = []; // Track script lines for editing
    private scriptContent: string = ''; // Store current script content
    private selectedTag: string[] = [];
    private loading: boolean = false;
    private cards: PipelineCard[] = [];
    private filteredCards: PipelineCard[] = [];
    private users: string[] = [];
    private _pipelineService: PipelineService;

    constructor(private readonly _context: vscode.ExtensionContext, token: string, authService?: any, fileProvider?: EssedumFileSystemProvider, pipelineService?: PipelineService) {
        this._extensionUri = _context.extensionUri;
        this.updateToken(token);
        this._authService = authService;
        this._fileProvider = fileProvider;
        this._pipelineService = pipelineService || new PipelineService(token, 'leo1311'); // Create default if not provided
    }

    public updateToken(token: string) {
        this._token = token;
        this._isAuthenticated = !!token && token.trim().length > 0;
        console.log('Token updated, authenticated:', this._isAuthenticated);

        // Update token in file provider as well
        if (this._fileProvider) {
            this._fileProvider.updateToken(token);
        }
    }

    /**
     * Set the authentication service reference
     */
    public setAuthService(authService: any) {
        this._authService = authService;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'loadCards':
                        await this.getCards();
                        break;
                    case 'viewDetails':
                        await this.viewScriptDetails(message.cardId);
                        break;
                    case 'filter':
                        this.filter = message.filter;
                        await this.getCards();
                        break;
                    case 'refresh':
                        await this.getCards();
                        break;
                    case 'goToPage':
                        this.goToPage(message.page);
                        break;
                    case 'nextPage':
                        this.nextPage();
                        break;
                    case 'previousPage':
                        this.previousPage();
                        break;
                    case 'firstPage':
                        this.goToFirstPage();
                        break;
                    case 'lastPage':
                        this.goToLastPage();
                        break;
                    case 'runScript':
                        await this.runPipelineScript(message.cardId, message.runType);
                        break;
                    case 'copyScript':
                        await this.copyScriptToClipboard(message.cardId, message.fileName);
                        break;
                    case 'refreshScript':
                        await this.refreshScripts(message.cardId);
                        break;
                    case 'viewLogs':
                        await this.viewPipelineLogs(message.cardId);
                        break;
                    case 'openScript':
                        await this.openScriptFromDetails(message.cardId, message.fileIndex);
                        break;
                    case 'generateScripts':
                        await this.generatePipelineScripts(message.cardId);
                        break;
                    case 'editScript':
                        await this.editScript(message.cardId, message.fileName, message.currentContent);
                        break;
                    case 'saveScript':
                        await this.saveScript(message.cardId, message.fileName, message.content);
                        break;
                    case 'logout':
                        await this.handleLogout();
                        break;
                    case 'triggerLogin':
                        // Trigger fresh Keycloak authentication
                        try {
                            console.log('triggerLogin command received, forcing fresh Keycloak authentication...');

                            // Show authentication progress in webview
                            if (this._view) {
                                this._view.webview.postMessage({
                                    command: 'authenticationProgress',
                                    message: '🔄 Clearing existing tokens and starting fresh authentication...'
                                });
                            }

                            // Force fresh authentication through the auth service
                            if (this._authService) {
                                console.log('Using auth service for fresh authentication');
                                const tokens = await this._authService.forceAuthentication();
                                console.log('Fresh authentication successful, updating token');
                                this.updateToken(tokens.access_token);
                            } else {
                                console.log('No auth service available, using command execution');
                                // Fallback to command execution if auth service not available
                                await vscode.commands.executeCommand('essedum.login');
                            }

                            // Show success feedback
                            if (this._view) {
                                this._view.webview.postMessage({
                                    command: 'authenticationSuccess',
                                    message: 'Authentication successful!'
                                });
                            }

                            // After successful login, return to main pipeline view
                            await this.returnToMainView();

                            vscode.window.showInformationMessage('Successfully authenticated with Keycloak! Pipeline view loaded.');

                        } catch (error: any) {
                            console.error('Error executing fresh authentication:', error);

                            // Show error state in webview
                            if (this._view) {
                                this._view.webview.postMessage({
                                    command: 'authenticationError',
                                    message: error.message || 'Fresh authentication failed'
                                });
                            }

                            vscode.window.showErrorMessage(
                                `Fresh authentication failed: ${error.message || 'Unknown error'}. Please try using Command Palette (Ctrl+Shift+P) and search for "Essedum: Login".`
                            );
                        }
                        break;
                }
            },
            undefined,
            this._context.subscriptions
        );
    }

    /**
     * Load initial content based on authentication state
     */
    public async loadInitialContent(): Promise<void> {
        if (this._isAuthenticated) {
            // Load main pipeline interface
            if (this._view) {
                this._view.webview.html = this._getHtmlForWebview(this._view.webview);
                // Load cards after a brief delay to ensure webview is ready
                setTimeout(() => this.getCards(), 100);
            }
        } else {
            // Show authentication required page
            this.showAuthenticationRequired();
        }
    }

    /**
     * Show authentication required page
     */
    private showAuthenticationRequired(): void {
        if (this._view) {
            this._view.webview.html = this.getAuthenticationRequiredHtml();
        }
    }

    /**
     * Get HTML for authentication required state
     */
    private getAuthenticationRequiredHtml(): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Authentication Required</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    padding: 40px 20px;
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    min-height: 300px;
                }
                .auth-container {
                    max-width: 400px;
                    margin: 0 auto;
                }
                .auth-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                    color: var(--vscode-charts-blue);
                }
                .auth-title {
                    font-size: 24px;
                    font-weight: 600;
                    margin-bottom: 16px;
                    color: var(--vscode-editor-foreground);
                }
                .auth-message {
                    margin-bottom: 24px;
                    color: var(--vscode-descriptionForeground);
                    line-height: 1.5;
                }
                .auth-button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    margin: 8px;
                    transition: background-color 0.2s;
                }
                .auth-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .auth-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .auth-steps {
                    text-align: left;
                    margin: 20px 0;
                    padding: 16px;
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                    border-radius: 6px;
                    border-left: 4px solid var(--vscode-charts-blue);
                }
                .auth-steps ol {
                    margin: 0;
                    padding-left: 20px;
                }
                .auth-steps li {
                    margin-bottom: 8px;
                    color: var(--vscode-editor-foreground);
                }
                .error-message {
                    color: var(--vscode-errorForeground);
                    background-color: var(--vscode-inputValidation-errorBackground);
                    border: 1px solid var(--vscode-inputValidation-errorBorder);
                    padding: 12px;
                    border-radius: 4px;
                    margin-top: 16px;
                    display: none;
                }
            </style>
        </head>
        <body>
            <div class="auth-container">
                <div class="auth-icon">🔐</div>
                <h1 class="auth-title">Authentication Required</h1>
                <p class="auth-message">
                    You need to authenticate with Keycloak to access the Essedum AI Platform pipelines.
                </p>
                
                <div class="auth-steps">
                    <strong>How to authenticate:</strong>
                    <ol>
                        <li>Click the "Login with Keycloak" button below</li>
                        <li>Your browser will open to the Keycloak login page</li>
                        <li>Enter your credentials and approve the access</li>
                        <li>Return to VS Code to see your pipelines</li>
                    </ol>
                </div>

                <button class="auth-button" onclick="startAuthentication()" id="loginBtn">
                    🚀 Login with Keycloak
                </button>
                
                <div class="error-message" id="errorMessage"></div>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                
                function startAuthentication() {
                    const loginBtn = document.getElementById('loginBtn');
                    const errorMessage = document.getElementById('errorMessage');
                    
                    try {
                        // Hide any previous errors
                        errorMessage.style.display = 'none';
                        
                        // Update button state
                        loginBtn.textContent = '🔄 Authenticating...';
                        loginBtn.disabled = true;
                        
                        console.log('Starting authentication flow...');
                        
                        // Trigger the login command
                        vscode.postMessage({ 
                            command: 'triggerLogin',
                            timestamp: new Date().toISOString()
                        });
                       
                        
                    } catch (error) {
                        console.error('Error starting authentication:', error);
                        showError('Failed to start authentication. Please try using the Command Palette.');
                        resetButton();
                    }
                }
                
                function showError(message) {
                    const errorMessage = document.getElementById('errorMessage');
                    errorMessage.textContent = message;
                    errorMessage.style.display = 'block';
                }
                
                function resetButton() {
                    const loginBtn = document.getElementById('loginBtn');
                    loginBtn.textContent = '🚀 Login with Keycloak';
                    loginBtn.disabled = false;
                }
                
                // Listen for messages from the extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    switch (message.command) {
                        case 'authenticationProgress':
                            const loginBtn = document.getElementById('loginBtn');
                            loginBtn.textContent = message.message || '🔄 Authenticating...';
                            break;
                        case 'authenticationError':
                            showError(message.message || 'Authentication failed');
                            resetButton();
                            break;
                        case 'authenticationSuccess':
                            const successBtn = document.getElementById('loginBtn');
                            successBtn.textContent = '✅ Authentication Successful';
                            successBtn.style.backgroundColor = 'var(--vscode-charts-green)';
                            break;
                    }
                });
                
                // Check if VS Code API is available
                if (typeof acquireVsCodeApi === 'undefined') {
                    console.error('VS Code API not available');
                    showError('VS Code API not available. Please try reloading the extension.');
                }
            </script>
        </body>
        </html>`;
    }

    private async getCards(): Promise<void> {
        // Check authentication before proceeding
        if (!this._isAuthenticated) {
            console.log('Not authenticated, showing authentication required page');
            this.showAuthenticationRequired();
            return;
        }

        this.loading = true;
        this.updateWebview();

        const params = this.buildHttpParams();

        try {
            // For first page, get total count to calculate proper pagination
            if (this.pageNumber === 1) {
                // Fetch total count first
                this.totalCount = await this.getPipelinesCount(params);
                this.totalPages = Math.ceil(this.totalCount / this.pageSize);

                // If total count is small (like <= 20), fetch all and do client-side pagination
                if (this.totalCount <= 20) {
                    console.log('Small dataset detected, using client-side pagination');

                    // Fetch all cards with a larger page size to get all data for client-side pagination
                    const allParams = { ...params, size: this.totalCount.toString(), page: '1' };
                    const response = await this.getPipelinesCards(allParams);

                    if (response && response.length) {
                        this.allCards = response.map((element: any) => ({
                            type: element.type || 'Unknown',
                            alias: element.alias || 'No Alias',
                            createdDate: element.createdDate || element.created_date || new Date().toISOString(),
                            created_by: element.created_by || element.createdBy || 'Unknown',
                            id: element.id || element._id || Math.random().toString(36),
                            ...element
                        }));
                    }

                    // Update total count and pages based on actual data
                    this.totalCount = this.allCards.length;
                    this.totalPages = Math.ceil(this.totalCount / this.pageSize);

                    // For testing: ensure we always have at least 2 pages if we have more than 3 cards
                    if (this.totalCount > this.pageSize) {
                        console.log('Multiple pages detected - pagination will be shown');
                    }

                    console.log(`Client-side pagination: ${this.totalCount} total cards, ${this.totalPages} pages`);
                } else {
                    // Use server-side pagination for larger datasets
                    console.log('Large dataset detected, using server-side pagination');
                    const response = await this.getPipelinesCards(params);

                    if (response && response.length) {
                        this.allCards = response.map((element: any) => ({
                            type: element.type || 'Unknown',
                            alias: element.alias || 'No Alias',
                            createdDate: element.createdDate || element.created_date || new Date().toISOString(),
                            created_by: element.created_by || element.createdBy || 'Unknown',
                            id: element.id || element._id || Math.random().toString(36),
                            ...element
                        }));
                    }
                }
            }

            // Calculate which cards to show for current page
            const startIndex = (this.pageNumber - 1) * this.pageSize;
            const endIndex = startIndex + this.pageSize;

            if (this.totalCount <= 3) {
                // Client-side pagination
                this.filteredCards = this.allCards.slice(startIndex, endIndex);
            } else {
                // Server-side pagination - fetch the specific page
                if (this.pageNumber > 1) {
                    const response = await this.getPipelinesCards(params);

                    if (response && response.length) {
                        this.allCards = response.map((element: any) => ({
                            type: element.type || 'Unknown',
                            alias: element.alias || 'No Alias',
                            createdDate: element.createdDate || element.created_date || new Date().toISOString(),
                            created_by: element.created_by || element.createdBy || 'Unknown',
                            id: element.id || element._id || Math.random().toString(36),
                            ...element
                        }));
                    }
                }

                // Limit to page size even for server-side pagination
                this.filteredCards = this.allCards.slice(0, this.pageSize);
            }

            this.cards = this.allCards; // Keep all cards for reference

            console.log(`Page ${this.pageNumber}: Showing ${this.filteredCards.length} of ${this.totalCount} total cards`);
            console.log(`Total pages: ${this.totalPages}`);

            this.loading = false;

            this.updateQueryParam(
                this.pageNumber,
                this.filter,
                this.selectedAdapterType.toString()
            );

            this.updateWebview();
        } catch (error: any) {
            console.error('Error fetching cards:', error);
            this.loading = false;

            // Handle authentication errors specifically
            if (error.response && error.response.status === 403) {
                console.error('Authentication failed (403) - token may be invalid or expired');
                this._isAuthenticated = false; // Mark as not authenticated

                vscode.window.showErrorMessage(
                    'Authentication failed. Your token may be invalid or expired. Please login again.',
                    'Login Again'
                ).then(selection => {
                    if (selection === 'Login Again') {
                        // Force fresh authentication
                        vscode.commands.executeCommand('essedum.login');
                    }
                });

                // Show authentication required page
                this.showAuthenticationRequired();
                return;
            } else if (error.response && error.response.status === 401) {
                console.error('Unauthorized (401) - authentication required');
                this._isAuthenticated = false; // Mark as not authenticated

                vscode.window.showErrorMessage(
                    'Unauthorized access. Please authenticate with Keycloak.',
                    'Login'
                ).then(selection => {
                    if (selection === 'Login') {
                        vscode.commands.executeCommand('essedum.login');
                    }
                });

                // Show authentication required page
                this.showAuthenticationRequired();
                return;
            }

            // Handle other errors
            let errorMessage = 'Failed to fetch pipeline data';
            if (error.message) {
                errorMessage = error.message;
            }

            vscode.window.showErrorMessage(`Error loading pipelines: ${errorMessage}`);
            this.updateWebview();
        }
    }

    private buildHttpParams(): HttpParams {
        let params: HttpParams = {
            page: this.pageNumber.toString(),
            size: this.pageSize.toString(),
            project: this.organization,
            isCached: 'true',  // Enable caching for better performance
            adapter_instance: 'internal',
            interfacetype: 'pipeline',
            cloud_provider: 'internal'
        };

        console.log(`Building HTTP params - Page: ${this.pageNumber}, Size: ${this.pageSize}`);

        if (this.selectedAdapterType.length >= 1) {
            params.type = this.selectedAdapterType.toString();
        }

        if (this.filter.length >= 1) {
            params.query = this.filter;
        }

        if (this.selectedTag.length >= 1) {
            params.tags = this.selectedTag.toString();
        }

        return params;
    }

    private async getPipelinesCount(params: HttpParams): Promise<number> {
        try {
            return await this._pipelineService.getPipelinesCount(params);

            // console.log('Attempting fallback request...');
            // process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

            // const https = require('https');
            // const axiosConfig = {
            //     httpsAgent: new https.Agent({
            //         rejectUnauthorized: false
            //     }),
            //     timeout: 10000,
            //     params: {
            //         ...params,
            //         project: this.organization
            //     },
            //     headers: {
            //         'accept': 'application/json, text/plain, */*',
            //         'accept-language': 'en-US,en;q=0.9',
            //         'content-type': 'application/json',
            //         'priority': 'u=1, i',
            //         'project': '2',
            //         'projectname': 'leo1311',
            //         'referer': 'https://essedum.az.ad.idemo-ppc.com/',
            //         'roleid': '1',
            //         'rolename': 'IT Portfolio Manager',
            //         'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
            //         'x-requested-with': 'Leap',
            //         ...(this._token ? { 'authorization': `Bearer ${this._token}` } : {})
            //     }
            // };

            // const response = await axios.get(API_ENDPOINTS.PIPELINES_COUNT, axiosConfig);
            // console.log('Fallback response:', response.data);
            // return response.data || 0;

        } catch (fallbackError: any) {
            console.error('Fallback request also failed:', fallbackError);
            if (fallbackError.response) {
                console.error('Response data:', fallbackError.response.data);
                console.error('Response status:', fallbackError.response.status);
                console.error('Response headers:', fallbackError.response.headers);
            } else if (fallbackError.request) {
                console.error('Request made but no response received:', fallbackError.request);
            } else {
                console.error('Error setting up request:', fallbackError.message);
            }
            throw new Error(`Failed to fetch pipelines count: ${fallbackError.message || fallbackError}`);
        }
    }

    private async getPipelinesCards(params: HttpParams): Promise<any> {
        try {
            console.log('Attempting fallback request for pipelines list...');
            process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

            const https = require('https');
            const axiosConfig = {
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false
                }),
                timeout: 10000,
                params: {
                    ...params,
                    project: this.organization
                },
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'accept-language': 'en-US,en;q=0.9',
                    'content-type': 'application/json',
                    'priority': 'u=1, i',
                    'project': '2',
                    'projectname': 'leo1311',
                    'referer': 'https://essedum.az.ad.idemo-ppc.com/',
                    'roleid': '1',
                    'rolename': 'IT Portfolio Manager',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
                    'x-requested-with': 'Leap',
                    ...(this._token ? { 'authorization': `Bearer ${this._token}` } : {})
                }
            };

            const response = await axios.get(API_ENDPOINTS.PIPELINES_LIST, axiosConfig);
            console.log('Fallback pipelines list success');
            return response.data;

        } catch (fallbackError: any) {
            console.error('Fallback pipelines list also failed:', fallbackError);

            // Provide more detailed error information
            let errorMessage = 'Failed to fetch pipeline data';

            if (fallbackError.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY') {
                errorMessage = 'SSL Certificate error - unable to verify server certificate';
            } else if (fallbackError.code === 'ENOTFOUND') {
                errorMessage = 'Network error - unable to reach the server';
            } else if (fallbackError.response) {
                errorMessage = `Server error: ${fallbackError.response.status} - ${fallbackError.response.statusText}`;
            } else if (fallbackError.request) {
                errorMessage = 'Network timeout or connection refused';
            } else {
                errorMessage = `Request setup error: ${fallbackError.message}`;
            }

            throw new Error(errorMessage);
        }
    }

    private async viewScriptDetails(cardId: string): Promise<void> {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) {
            vscode.window.showErrorMessage('Pipeline not found');
            return;
        }

        // Track current pipeline for file system operations
        this._currentPipelineName = card.alias || card.name;

        // Show loading message
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Loading scripts for ${card.alias}...`,
            cancellable: true
        }, async (progress, token) => {
            try {
                progress.report({ increment: 0, message: 'Connecting to server...' });

                // Fetch scripts for the pipeline
                const scripts = await this.fetchPipelineScripts(card.name);

                progress.report({ increment: 50, message: 'Processing scripts...' });

                if (scripts && scripts.files && scripts.files.length > 0) {
                    progress.report({ increment: 80, message: 'Creating script viewer...' });

                    // Send pipeline details to webview
                    await this.sendPipelineDetailsToWebview(card, scripts);

                    progress.report({ increment: 100, message: 'Complete!' });

                    vscode.window.showInformationMessage(
                        `Loaded ${scripts.files.length} script file(s) for pipeline: ${card.alias}`
                    );
                } else {
                    // Offer to generate scripts if none found
                    const selection = await vscode.window.showInformationMessage(
                        'No scripts found for this pipeline. Would you like to generate scripts?',
                        'Generate Scripts',
                        'View Template Only',
                        'Cancel'
                    );

                    if (selection === 'Generate Scripts') {
                        await this.generatePipelineScripts(card.alias || card.name);
                        // Retry loading scripts after generation
                        setTimeout(() => this.viewScriptDetails(cardId), 2000);
                    } else if (selection === 'View Template Only') {
                        // Show the script viewer with mock data
                        await this.sendPipelineDetailsToWebview(card, scripts);
                    }
                }
            } catch (error: any) {
                console.error('Error in viewScriptDetails:', error);
                vscode.window.showErrorMessage(
                    `Failed to load scripts for ${card.alias}: ${error.message}. Check the Output panel for details.`
                );

                // Still show the viewer with mock/template data for debugging
                const mockScripts = {
                    pipelineName: card.alias || card.name,
                    files: [{
                        fileName: 'debug_template.py',
                        content: `# Debug Template for ${card.alias}
# Error occurred: ${error.message}
# 
# This template is shown when script loading fails
# Check the VS Code Output panel for detailed logs

def debug_pipeline():
    print("Pipeline: ${card.alias}")
    print("Error: ${error.message}")
    print("Check server connectivity and authentication")

if __name__ == "__main__":
    debug_pipeline()
`,
                        extension: 'py',
                        language: 'python'
                    }],
                    runTypes: [{ type: 'Local', dsAlias: '', dsName: 'Local Runtime', dsCapability: '' }]
                };

                await this.sendPipelineDetailsToWebview(card, mockScripts);
            }
        });
    }

    private async fetchPipelineScripts(pipelineName: string): Promise<PipelineScript> {
        console.log(`Fetching scripts for pipeline: ${pipelineName}`);

        try {
            // Use centralized HTTPS agent for SSL bypass
            const httpsAgent = createHTTPSAgent();

            let files: ScriptFile[] = [];
            let streamingService: any = null;
            let pipelineData: any = null;

            // Step 1: Get streaming service by name (following Angular getStreamingServicesByName pattern)
            try {
                console.log('Fetching streaming service details...');
                const streamingServiceResponse = await axios.get(`${API_ENDPOINTS.STREAMING_SERVICES}/${pipelineName}/${this.organization}`, {
                    ...createSecureAxiosConfig(this._token),
                    timeout: 30000
                });

                streamingService = streamingServiceResponse.data;
                console.log('Streaming service response:', streamingService);
            } catch (serviceError: any) {
                console.log('Streaming service fetch failed, trying pipeline by name...', serviceError.message);

                // Step 2: Try getting pipeline by name if streaming service fails (following Angular getPipelineByName pattern)
                try {
                    console.log('Fetching pipeline by name...');
                    const urlParams = new URLSearchParams();
                    urlParams.append('name', pipelineName);
                    urlParams.append('org', this.organization);

                    const pipelineResponse = await axios.get(API_ENDPOINTS.PIPELINES_BY_NAME, {
                        ...createSecureAxiosConfig(this._token),
                        params: urlParams,
                        timeout: 30000
                    });

                    pipelineData = pipelineResponse.data && pipelineResponse.data.length > 0 ? pipelineResponse.data[0] : null;
                    console.log('Pipeline by name response:', pipelineData);
                } catch (pipelineError: any) {
                    console.log('Pipeline by name also failed:', pipelineError.message);
                }
            }

            // Step 3: Parse JSON content to get file information (following Angular pattern)
            let jsonContent: any = null;
            let fileList: string[] = [];

            if (streamingService) {
                try {
                    // Try both jsonContent and json_content properties
                    const contentStr = streamingService.jsonContent || streamingService.json_content;
                    if (contentStr) {
                        jsonContent = JSON.parse(contentStr);
                        console.log('Parsed JSON content:', jsonContent);

                        // Extract files from elements[0].attributes.files (following Angular pattern)
                        if (jsonContent.elements && jsonContent.elements[0] && jsonContent.elements[0].attributes) {
                            const attributes = jsonContent.elements[0].attributes;
                            if (attributes.files && Array.isArray(attributes.files)) {
                                fileList = attributes.files;
                                console.log('Found files in JSON:', fileList);
                            }
                        }
                    }
                } catch (parseError) {
                    console.log('Failed to parse JSON content:', parseError);
                }
            }

            // Step 4: Read actual files using the native file API (following Angular readFile pattern)
            if (fileList.length > 0) {
                console.log('Reading files from JSON content...');

                for (const fileName of fileList) {
                    try {
                        console.log(`Reading file from JSON list: ${fileName}`);

                        // Use the exact API pattern from Angular readNativeFile method
                        const response = await axios.get(`${API_ENDPOINTS.FILE_READ}/${pipelineName}/${this.organization}`, {
                            ...createSecureAxiosConfig(this._token),
                            params: {
                                file: fileName
                            },
                            responseType: 'arraybuffer', // Match Angular responseType
                            timeout: 30000
                        });

                        if (response.data) {
                            console.log(`Successfully read file: ${fileName}`);

                            // Convert arraybuffer to text using TextDecoder (matching Angular approach)
                            const textDecoder = new TextDecoder('utf-8');
                            const fileContent = textDecoder.decode(response.data);

                            const extension = fileName.includes('.')
                                ? fileName.substring(fileName.lastIndexOf('.') + 1)
                                : 'txt';
                            const language = this.getLanguageByExtension(extension);

                            files.push({
                                fileName: fileName,
                                content: fileContent,
                                extension: extension,
                                language: language
                            });

                            console.log(`File ${fileName} decoded successfully, content length: ${fileContent.length}`);
                        }
                    } catch (fileError: any) {
                        console.log(`File ${fileName} not found or error reading:`, fileError.response?.status || fileError.message);
                        // Continue trying other files
                    }
                }
            } else {
                // Step 5: Fallback to common file names if no files found in JSON
                console.log('No files in JSON content, trying common file names...');

                const possibleFiles = [
                    `${pipelineName}.py`,           // Main script file
                    `${pipelineName}_${this.organization}.py`,  // Pipeline with org
                    `main.py`,                      // Default main file
                    `script.py`,                    // Generic script file
                    `${pipelineName}.json`,         // Pipeline configuration
                    `config.json`,                  // Generic config
                    `requirements.txt`              // Python dependencies
                ];

                for (const fileName of possibleFiles) {
                    try {
                        console.log(`Attempting to read file: ${fileName}`);

                        // Use the exact API pattern from Angular readNativeFile method
                        const response = await axios.get(`${API_ENDPOINTS.FILE_READ}/${pipelineName}/${this.organization}`, {
                            ...createSecureAxiosConfig(this._token),
                            params: {
                                file: fileName
                            },
                            responseType: 'arraybuffer', // Match Angular responseType
                            timeout: 30000
                        });

                        if (response.data) {
                            console.log(`Successfully read file: ${fileName}`);

                            // Convert arraybuffer to text using TextDecoder (matching Angular approach)
                            const textDecoder = new TextDecoder('utf-8');
                            const fileContent = textDecoder.decode(response.data);

                            const extension = fileName.includes('.')
                                ? fileName.substring(fileName.lastIndexOf('.') + 1)
                                : 'txt';
                            const language = this.getLanguageByExtension(extension);

                            files.push({
                                fileName: fileName,
                                content: fileContent,
                                extension: extension,
                                language: language
                            });

                            console.log(`File ${fileName} decoded successfully, content length: ${fileContent.length}`);
                        }
                    } catch (fileError: any) {
                        console.log(`File ${fileName} not found or error reading:`, fileError.response?.status || fileError.message);
                        // Continue trying other files
                    }
                }
            }

            // If no files were found, create a placeholder script
            if (files.length === 0) {
                console.log('No native files found, creating placeholder script...');

                const fileName = `${pipelineName}.py`;
                files.push({
                    fileName: fileName,
                    content: `# Pipeline Script for ${pipelineName}
# Organization: ${this.organization}
# 
# This script was not found on the server using the native file API.
# API endpoint: /file/read/${pipelineName}/${this.organization}?file={filename}
#
# To generate this script:
# 1. Go to the pipeline in the web interface
# 2. Click "Generate Script" or "Save" 
# 3. Wait for script generation to complete
# 4. Refresh this view

def main():
    """
    Main pipeline function for ${pipelineName}
    """
    print("Pipeline: ${pipelineName}")
    print("Organization: ${this.organization}")
    print("Status: Script file not found")
    print("Please generate the script first using the web interface")
    
    # Add your pipeline logic here
    pass
    
if __name__ == "__main__":
    main()
`,
                    extension: 'py',
                    language: 'python'
                });
            }

            // Fetch run types - using the same endpoint pattern as in the Angular code
            let runTypesResponse: any = null;
            try {
                console.log('Fetching run types...');

                // Try the job run types endpoint (from Angular code reference)
                runTypesResponse = await axios.get(`${API_ENDPOINTS.JOB_RUNTIME_TYPES}/${this.organization}`, {
                    ...createSecureAxiosConfig(this._token),
                    timeout: 30000
                });
                console.log('Run types response:', runTypesResponse.data);
            } catch (runTypesError: any) {
                console.log('Job run types endpoint failed, trying alternative...');

                try {
                    // Try alternative endpoint
                    runTypesResponse = await axios.get(API_ENDPOINTS.DATASOURCES_RUNTIME, {
                        ...createSecureAxiosConfig(this._token),
                        timeout: 30000
                    });
                    console.log('Alternative run types response:', runTypesResponse.data);
                } catch (altError: any) {
                    console.log('Failed to fetch run types from both endpoints, using defaults:', altError.message);
                    // Provide default run types if API fails
                    runTypesResponse = {
                        data: [
                            { type: 'Local', dsAlias: '', dsName: 'Local Runtime', dsCapability: '' },
                            { type: 'Spark', dsAlias: 'default', dsName: 'Spark Cluster', dsCapability: 'spark' },
                            { type: 'Docker', dsAlias: 'docker', dsName: 'Docker Container', dsCapability: 'container' }
                        ]
                    };
                }
            }

            console.log(`Successfully prepared ${files.length} script files for pipeline ${pipelineName}`);

            return {
                pipelineName: pipelineName,
                files: files,
                runTypes: runTypesResponse.data || []
            };

        } catch (error: any) {
            console.error('Failed to fetch scripts - Full error:', error);

            // Provide detailed error message
            let errorMessage = 'Failed to fetch pipeline scripts';

            if (error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY') {
                errorMessage = 'SSL Certificate error - unable to verify server certificate';
            } else if (error.code === 'ENOTFOUND') {
                errorMessage = 'Network error - unable to reach the server at ${BASE_URL}';
            } else if (error.response) {
                errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
                console.error('Response data:', error.response.data);
            } else if (error.request) {
                errorMessage = 'Network timeout or connection refused';
            } else {
                errorMessage = `Request setup error: ${error.message}`;
            }

            console.error('Processed error message:', errorMessage);

            // Return mock data instead of throwing error to allow user to see the interface
            console.log('Returning mock data due to API failure');
            return {
                pipelineName: pipelineName,
                files: [{
                    fileName: 'pipeline_template.py',
                    content: `# Pipeline Script for ${pipelineName}
# This is a template - actual scripts will be loaded from the server

def main():
    """
    Main pipeline function for ${pipelineName}
    
    Error: ${errorMessage}
    
    To resolve:
    1. Ensure the backend server is running on ${BASE_URL}
    2. Check that the pipeline has generated scripts
    3. Verify your authentication token is valid
    """
    print("Pipeline: ${pipelineName}")
    print("Status: Script generation pending or failed")
    print("Error: ${errorMessage}")
    
    # Your pipeline logic will be generated here
    pass

if __name__ == "__main__":
    main()
`,
                    extension: 'py',
                    language: 'python'
                }],
                runTypes: [
                    { type: 'Local', dsAlias: '', dsName: 'Local Runtime', dsCapability: '' },
                    { type: 'Spark', dsAlias: 'default', dsName: 'Spark Cluster', dsCapability: '' }
                ]
            };
        }
    }

    private getLanguageByExtension(extension: string): string {
        const languageMap: { [key: string]: string } = {
            'py': 'python',
            'js': 'javascript',
            'ts': 'typescript',
            'json': 'json',
            'sql': 'sql',
            'sh': 'shellscript',
            'bat': 'bat',
            'yml': 'yaml',
            'yaml': 'yaml',
            'xml': 'xml',
            'txt': 'plaintext'
        };
        return languageMap[extension.toLowerCase()] || 'plaintext';
    }

    private updateQueryParam(pageNumber: number, filter: string, adapterType: string): void {
        // This would typically update URL query parameters in a web app
        console.log(`Query params updated: page=${pageNumber}, filter=${filter}, type=${adapterType}`);
    }

    public goToPage(page: number): void {
        if (page < 1 || page > this.totalPages) {
            return;
        }
        this.pageNumber = page;
        this.getCards();
    }

    public nextPage(): void {
        if (this.pageNumber < this.totalPages) {
            this.pageNumber++;
            this.getCards();
        }
    }

    public previousPage(): void {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            this.getCards();
        }
    }

    public goToFirstPage(): void {
        this.pageNumber = 1;
        this.getCards();
    }

    public goToLastPage(): void {
        this.pageNumber = this.totalPages;
        this.getCards();
    }

    private updateWebview(): void {
        if (this._view) {
            // Ensure we always have correct pagination info
            const actualTotalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));

            console.log('Updating webview with:', {
                cards: this.filteredCards.length,
                currentPage: this.pageNumber,
                totalPages: actualTotalPages,
                totalCount: this.totalCount,
                pageSize: this.pageSize
            });

            this._view.webview.postMessage({
                command: 'updateCards',
                cards: this.filteredCards,
                loading: this.loading,
                pagination: {
                    currentPage: this.pageNumber,
                    totalPages: actualTotalPages,
                    totalCount: this.totalCount,
                    pageSize: this.pageSize
                }
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        // Read HTML template from external file
        const htmlPath = path.join(this._context.extensionPath, 'src', 'app', 'pipeline', 'pipeline-cards.html');
        let htmlTemplate = '';

        try {
            htmlTemplate = fs.readFileSync(htmlPath, 'utf8');
        } catch (error) {
            console.error('Failed to read HTML template:', error);
            return this._getFallbackHtml();
        }

        // Get CSS file URI
        const cssPath = vscode.Uri.joinPath(this._extensionUri, 'src', 'app', 'pipeline', 'pipeline-cards.css');
        const cssUri = webview.asWebviewUri(cssPath);

        // Get JavaScript file URI
        const jsPath = vscode.Uri.joinPath(this._extensionUri, 'src', 'app', 'pipeline', 'pipeline-cards-client.js');
        const jsUri = webview.asWebviewUri(jsPath);

        // Replace placeholders with actual URIs
        htmlTemplate = htmlTemplate.replace('{{CSS_URI}}', cssUri.toString());
        htmlTemplate = htmlTemplate.replace('{{JS_URI}}', jsUri.toString());

        return htmlTemplate;
    }

    private _getFallbackHtml(): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pipeline Cards</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    padding: 16px;
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                }
                .error {
                    text-align: center;
                    padding: 40px;
                    color: var(--vscode-errorForeground);
                }
            </style>
        </head>
        <body>
            <div class="error">
                <h2>Error Loading Pipeline Cards</h2>
                <p>Could not load the pipeline cards template. Please check the extension files.</p>
            </div>
        </body>
        </html>`;
    }

    private async createScriptViewer(card: PipelineCard, scripts: PipelineScript): Promise<void> {
        // Create webview panel for script actions (sidebar)
        const scriptActionsPanel = vscode.window.createWebviewPanel(
            'pipelineScriptActions',
            `Pipeline Actions: ${card.alias}`,
            { viewColumn: vscode.ViewColumn.Two, preserveFocus: true },
            {
                enableScripts: true,
                localResourceRoots: [this._extensionUri]
            }
        );

        // Set the HTML content for the actions panel
        scriptActionsPanel.webview.html = this.getScriptActionsHtml(card, scripts);

        // Handle messages from the actions panel
        scriptActionsPanel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'selectScript':
                        await this.openScriptInEditor(scripts.files[message.fileIndex]);
                        break;
                    case 'runScript':
                        await this.runPipelineScript(card.id || '', message.runType);
                        break;
                    case 'copyScript':
                        await this.copyScriptToClipboard(card.id || '', message.fileName);
                        break;
                    case 'refreshScripts':
                        await this.refreshScripts(card.id || '');
                        break;
                    case 'viewLogs':
                        await this.viewPipelineLogs(card.id || '');
                        break;
                }
            },
            undefined,
            this._context.subscriptions
        );

        // Open the first script file in the editor
        if (scripts.files.length > 0) {
            await this.openScriptInEditor(scripts.files[0]);
        }
    }

    private async openScriptInEditor(scriptFile: ScriptFile): Promise<void> {
        try {
            // If we have the file system provider, use Essedum scheme
            if (this._fileProvider && this._currentPipelineName) {
                await this.openScriptAsEssedumFile(scriptFile);
            } else {
                // Fallback to untitled document
                await this.openScriptAsUntitledDocument(scriptFile);
            }
        } catch (error: any) {
            console.error('Failed to open script:', error);
            vscode.window.showErrorMessage(`Failed to open script: ${error.message}`);

            // Try fallback method
            try {
                await this.openScriptAsUntitledDocument(scriptFile);
            } catch (fallbackError: any) {
                vscode.window.showErrorMessage(`Failed to open script with fallback: ${fallbackError.message}`);
            }
        }
    }

    /**
     * Open script as an Essedum file that can only be saved to the server
     */
    private async openScriptAsEssedumFile(scriptFile: ScriptFile): Promise<void> {
        if (!this._fileProvider || !this._currentPipelineName) {
            throw new Error('File provider or pipeline name not available');
        }

        // Register the file with the file system provider
        const uri = this._fileProvider.registerFile(
            scriptFile.fileName,
            scriptFile.content,
            this._currentPipelineName,
            this.organization
        );

        // Open the document using the Essedum scheme
        const doc = await vscode.workspace.openTextDocument(uri);

        await vscode.window.showTextDocument(doc, {
            viewColumn: vscode.ViewColumn.One,
            preserveFocus: false
        });

        // Find the pipeline for auto-save functionality
        const pipeline = this.allCards.find((card: PipelineCard) => 
            this._currentPipelineName === card.name || this._currentPipelineName === card.alias);

        if (pipeline) {
            console.log('🔧 Setting up auto-save for Essedum file:', scriptFile.fileName);

            // Update script state initially
            const scriptLines = scriptFile.content.split('\n');
            this.onScriptChange(scriptLines);

            // Set up auto-save functionality - listen for document changes
            const changeDisposable = vscode.workspace.onDidChangeTextDocument(async (event) => {
                if (event.document === doc) {
                    console.log('📝 Essedum file content changed, triggering onScriptChange...');

                    // Get updated content and split into lines (Angular pattern)
                    const updatedContent = event.document.getText();
                    const updatedLines = updatedContent.split('\n');

                    // Call onScriptChange like Angular code editor
                    this.onScriptChange(updatedLines);

                    console.log('✅ Script state updated with', this.script.length, 'lines');
                }
            });

            // Set up save listener - automatically upload when user saves
            const saveDisposable = vscode.workspace.onDidSaveTextDocument(async (savedDocument) => {
                if (savedDocument === doc) {
                    console.log('💾 📥 ESSEDUM FILE SAVE EVENT - Auto-uploading script changes...');

                    try {
                        // Get the saved content and update scriptContent
                        const savedContent = savedDocument.getText();
                        const savedLines = savedContent.split('\n');

                        console.log('📝 Saved Essedum file content length:', savedContent.length);
                        console.log('📝 Saved lines count:', savedLines.length);

                        // Update script state - this will set this.scriptContent
                        this.onScriptChange(savedLines);

                        console.log('📤 Auto-uploading Essedum file:', scriptFile.fileName);

                        // Auto-upload using Angular pattern
                        await this.createNativeFileWithFormData(pipeline.name, scriptFile.fileName);

                        // Show success message
                        vscode.window.showInformationMessage(
                            `✅ Essedum file changes auto-uploaded successfully to ${scriptFile.fileName}!`
                        );

                        // Update stream item and save (following Angular pattern)
                        await this.updateStreamItemAfterFileUpload(pipeline, scriptFile.fileName);

                    } catch (error: any) {
                        console.error('❌ Essedum file auto-upload failed:', error);
                        vscode.window.showErrorMessage(`Auto-upload failed: ${error.message}`);
                    }
                }
            });

            // Clean up listeners when document is closed
            const closeDisposable = vscode.workspace.onDidCloseTextDocument((closedDocument) => {
                if (closedDocument === doc) {
                    console.log('📄 Essedum file editor closed, cleaning up listeners');
                    changeDisposable.dispose();
                    saveDisposable.dispose();
                    closeDisposable.dispose();
                }
            });
        }

        // Show a message indicating this is an Essedum file with auto-save
        vscode.window.showInformationMessage(
            `📝 Opened ${scriptFile.fileName} as Essedum file with auto-save. Changes will be uploaded when you save (Ctrl+S).`,
            'Got it!'
        );
    }

    /**
     * Fallback method to open script as untitled document with auto-save functionality
     */
    private async openScriptAsUntitledDocument(scriptFile: ScriptFile): Promise<void> {
        // Create a new untitled document with the script content
        const doc = await vscode.workspace.openTextDocument({
            content: scriptFile.content,
            language: scriptFile.language
        });

        // Show the document in the main editor (column one)
        await vscode.window.showTextDocument(doc, {
            viewColumn: vscode.ViewColumn.One,
            preserveFocus: false
        });

        // Find the pipeline for auto-save functionality
        const pipeline = this.allCards.find((card: PipelineCard) => 
            this._currentPipelineName === card.name || this._currentPipelineName === card.alias);

        if (pipeline) {
            console.log('🔧 Setting up auto-save for script:', scriptFile.fileName);

            // Update script state initially
            const scriptLines = scriptFile.content.split('\n');
            this.onScriptChange(scriptLines);

            // Set up auto-save functionality - listen for document changes
            const changeDisposable = vscode.workspace.onDidChangeTextDocument(async (event) => {
                if (event.document === doc) {
                    console.log('📝 Script content changed, triggering onScriptChange...');

                    // Get updated content and split into lines (Angular pattern)
                    const updatedContent = event.document.getText();
                    const updatedLines = updatedContent.split('\n');

                    // Call onScriptChange like Angular code editor
                    this.onScriptChange(updatedLines);

                    console.log('✅ Script state updated with', this.script.length, 'lines');
                }
            });

            // Set up save listener - automatically upload when user saves
            const saveDisposable = vscode.workspace.onDidSaveTextDocument(async (savedDocument) => {
                if (savedDocument === doc) {
                    console.log('💾 📥 SAVE EVENT TRIGGERED - Auto-uploading script changes...');

                    try {
                        // Get the saved content and update scriptContent
                        const savedContent = savedDocument.getText();
                        const savedLines = savedContent.split('\n');

                        console.log('📝 Saved content length:', savedContent.length);
                        console.log('📝 Saved lines count:', savedLines.length);

                        // Update script state - this will set this.scriptContent
                        this.onScriptChange(savedLines);

                        // Use the original filename or generate one
                        const scriptFileName = scriptFile.fileName || `${pipeline.name}_${this.organization}.py`;

                        console.log('📤 About to upload file:', scriptFileName);

                        // Auto-upload using Angular pattern
                        await this.createNativeFileWithFormData(pipeline.name, scriptFileName);

                        // Show success message
                        vscode.window.showInformationMessage(
                            `✅ Script changes auto-uploaded successfully to ${scriptFileName}!`
                        );

                        // Update stream item and save (following Angular pattern)
                        await this.updateStreamItemAfterFileUpload(pipeline, scriptFileName);

                    } catch (error: any) {
                        console.error('❌ Auto-upload failed:', error);
                        vscode.window.showErrorMessage(`Auto-upload failed: ${error.message}`);
                    }
                }
            });

            // Clean up listeners when document is closed
            const closeDisposable = vscode.workspace.onDidCloseTextDocument((closedDocument) => {
                if (closedDocument === doc) {
                    console.log('📄 Script editor closed, cleaning up listeners');
                    changeDisposable.dispose();
                    saveDisposable.dispose();
                    closeDisposable.dispose();
                }
            });

            // Show initial instructions
            vscode.window.showInformationMessage(
                `📝 Script "${scriptFile.fileName}" opened with auto-save. Changes will be uploaded when you save (Ctrl+S).`
            );
        }
    }

    private getScriptActionsHtml(card: PipelineCard, scripts: PipelineScript): string {
        const scriptFilesList = scripts.files.map((file, index) =>
            `<button class="script-file-btn" onclick="selectScript(${index})">${file.fileName}</button>`
        ).join('');

        const runTypeOptions = scripts.runTypes.map(runType =>
            `<option value="${runType.type}-${runType.dsAlias}">${runType.type} - ${runType.dsAlias}</option>`
        ).join('');

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pipeline Script Actions</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    padding: 16px;
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                }
                .section {
                    margin-bottom: 24px;
                    padding: 16px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 6px;
                }
                .section-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    color: var(--vscode-editor-foreground);
                }
                .pipeline-info {
                    margin-bottom: 16px;
                }
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 14px;
                }
                .info-label {
                    font-weight: 500;
                    color: var(--vscode-descriptionForeground);
                }
                .info-value {
                    color: var(--vscode-editor-foreground);
                }
                .script-file-btn {
                    display: block;
                    width: 100%;
                    padding: 8px 12px;
                    margin-bottom: 8px;
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    border: 1px solid var(--vscode-button-border);
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    text-align: left;
                }
                .script-file-btn:hover {
                    background-color: var(--vscode-button-secondaryHoverBackground);
                }
                .form-group {
                    margin-bottom: 16px;
                }
                .form-label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: 500;
                    color: var(--vscode-editor-foreground);
                }
                .form-select, .form-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 4px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    font-size: 14px;
                }
                .btn {
                    padding: 10px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    margin-right: 8px;
                    margin-bottom: 8px;
                }
                .btn-primary {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }
                .btn-primary:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .btn-secondary {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                }
                .btn-secondary:hover {
                    background-color: var(--vscode-button-secondaryHoverBackground);
                }
                .actions-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
            </style>
        </head>
        <body>
            <div class="section">
                <div class="section-title">Pipeline Information</div>
                <div class="pipeline-info">
                    <div class="info-item">
                        <span class="info-label">Name:</span>
                        <span class="info-value">${card.alias}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Type:</span>
                        <span class="info-value">${card.type}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Created:</span>
                        <span class="info-value">${new Date(card.createdDate).toLocaleDateString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Created By:</span>
                        <span class="info-value">${card.target?.created_by}</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Script Files</div>
                ${scriptFilesList}
            </div>

            <div class="section">
                <div class="section-title">Run Configuration</div>
                <div class="form-group">
                    <label class="form-label" for="runType">Select Run Type:</label>
                    <select id="runType" class="form-select">
                        ${runTypeOptions}
                    </select>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Actions</div>
                <div class="actions-grid">
                    <button class="btn btn-primary" onclick="runScript()">Run Pipeline</button>
                    <button class="btn btn-secondary" onclick="editScript()">Edit Script</button>
                    <button class="btn btn-secondary" onclick="copyScript()">Copy Script</button>
                    <button class="btn btn-secondary" onclick="refreshScripts()">Refresh Scripts</button>
                    <button class="btn btn-secondary" onclick="viewLogs()">View Logs</button>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();

                function selectScript(fileIndex) {
                    vscode.postMessage({
                        command: 'selectScript',
                        fileIndex: fileIndex
                    });
                }

                function runScript() {
                    const runType = document.getElementById('runType').value;
                    vscode.postMessage({
                        command: 'runScript',
                        runType: runType
                    });
                }

                function copyScript() {
                    // Get currently selected script file name - you might want to track this
                    vscode.postMessage({
                        command: 'copyScript',
                        fileName: 'current_script' // You can enhance this to track current file
                    });
                }

                function editScript() {
                    // For now, we'll use a simplified approach where we get the generated script
                    // In the future, this could be enhanced to work with specific script files
                    vscode.postMessage({
                        command: 'editScript',
                        fileName: 'generated_script.py',
                        currentContent: 'Generated script content will be loaded...'
                    });
                }

                function refreshScripts() {
                    vscode.postMessage({
                        command: 'refreshScripts'
                    });
                }

                function viewLogs() {
                    vscode.postMessage({
                        command: 'viewLogs'
                    });
                }
            </script>
        </body>
        </html>`;
    }

    // Get streaming service by name
    private async getStreamingServicesByName(name: string, org?: string): Promise<any> {
        const organization = org || this.organization;
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false
        });

        const headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Authorization': `Bearer ${this._token}`,
            'Content-Type': 'application/json',
            'Project': '2',
            'ProjectName': organization,
            'X-Requested-With': 'Leap',
            'roleId': '1',
            'roleName': 'IT Portfolio Manager',
            'Referer': BASE_URL,
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
        };

        try {
            const response = await axios.get(`/api/aip/service/v1/streamingServices/${name}/${organization}`, {
                baseURL: BASE_URL,
                headers: headers,
                httpsAgent: httpsAgent,
                timeout: 30000
            });

            console.log('Streaming service retrieved:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Failed to get streaming service:', error);
            throw error;
        }
    }

    // Angular-pattern helper methods for pipeline execution
    private async savePipelineJSON(name: string, jsonContent: string): Promise<any> {
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false
        });

        const headers = {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9',
            'authorization': `Bearer ${this._token}`,
            'content-type': 'application/json; charset=UTF-8',
            'connection': 'keep-alive',
            'origin': 'https://essedum.az.ad.idemo-ppc.com',
            'project': '2',
            'projectname': this.organization,
            'referer': 'https://essedum.az.ad.idemo-ppc.com/',
            'roleid': '1',
            'rolename': 'IT Portfolio Manager',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
            'x-requested-with': 'Leap'
        };

        try {
            // Angular pattern: /streamingServices/saveJson/{name}/{org}
            const response = await axios.post(
                `https://essedum.az.ad.idemo-ppc.com/api/aip/service/v1/streamingServices/saveJson/${name}/${this.organization}`,
                jsonContent,
                {
                    headers: headers,
                    httpsAgent: httpsAgent,
                    timeout: 30000
                }
            );

            console.log('Pipeline JSON saved successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Failed to save pipeline JSON:', error);
            throw new Error(`Failed to save pipeline JSON: ${error.message}`);
        }
    }

    private async getDatasourceByName(name: string, org?: string): Promise<any> {
        const organization = org || this.organization;
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false
        });

        const headers = {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9',
            'authorization': `Bearer ${this._token}`,
            'content-type': 'application/json; charset=UTF-8',
            'project': '2',
            'projectname': organization,
            'referer': 'https://essedum.az.ad.idemo-ppc.com/',
            'roleid': '1',
            'rolename': 'IT Portfolio Manager',
            'x-requested-with': 'Leap'
        };

        try {
            // Angular pattern: /service/v1/fetchDatasource with name and org params
            const response = await axios.get(
                'https://essedum.az.ad.idemo-ppc.com/api/aip/service/v1/fetchDatasource',
                {
                    params: {
                        name: name,
                        org: organization
                    },
                    headers: headers,
                    httpsAgent: httpsAgent,
                    timeout: 30000
                }
            );

            console.log('Datasource fetched:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Failed to get datasource by name:', error);
            throw error;
        }
    }

    private async saveJson(streamItem: any, run: boolean = false): Promise<void> {
        try {
            console.log('Saving JSON for stream item:', streamItem.name);

            // Parse and clean up JSON content similar to Angular
            let jsonContent = streamItem.json_content;
            if (typeof jsonContent === 'string') {
                try {
                    jsonContent = JSON.parse(jsonContent);
                } catch (parseError) {
                    console.warn('Failed to parse json_content, using as-is');
                }
            }

            // Clean up elements (remove context and connattributes like Angular)
            if (jsonContent && jsonContent.elements) {
                jsonContent.elements.forEach((element: any) => {
                    delete element.context;
                    delete element.connattributes;

                    // Clean up script arrays
                    if (element.attributes && element.attributes.script) {
                        const script = [];
                        for (let i = 0; i < element.attributes.script.length; i++) {
                            if (element.attributes.script[i] && element.attributes.script[i].length > 0) {
                                script.push(element.attributes.script[i]);
                            }
                        }
                        element.attributes.script = script;
                    }
                });
            }

            // Update the stream item with cleaned JSON
            streamItem.json_content = JSON.stringify(jsonContent);
            streamItem.organization = this.organization;

            // Update the streaming service
            await this.updateStreamingService(streamItem);

            if (run) {
                console.log('JSON saved successfully for pipeline run');
            }

        } catch (error: any) {
            console.error('Error in saveJson:', error);
            if (run) {
                throw new Error(`Canvas not updated due to error: ${error.message}`);
            }
        }
    }

    private async generateScript(streamItem: any, selectedRunType: any): Promise<any> {
        try {
            console.log('Generating script for:', streamItem.name);

            // Step 1: Create/upload script file FIRST (matching browser behavior)
            // Use edited script content if available, otherwise generate fresh content
            console.log('🔧 Preparing script content for pipeline:', streamItem.name);
            console.log('🔍 DEBUG: Script state check:');
            console.log('🔍   this.scriptContent exists?', !!this.scriptContent);
            console.log('🔍   this.scriptContent length:', this.scriptContent ? this.scriptContent.length : 'undefined');
            console.log('🔍   this.script exists?', !!this.script);
            console.log('🔍   this.script length:', this.script ? this.script.length : 'undefined');

            if (this.scriptContent && this.scriptContent.length > 0) {
                console.log('🔍   scriptContent preview (first 200 chars):', this.scriptContent.substring(0, 200) + '...');
            }
            if (this.script && this.script.length > 0) {
                console.log('🔍   script[0] preview:', this.script[0].substring(0, 100) + '...');
            }

            let scriptContent: string;

            if (this.scriptContent && this.scriptContent.length > 0) {
                // User has saved script content - use it
                scriptContent = this.scriptContent;
                console.log('� ✅ Using saved script content from editor');
                console.log('� Saved script preview (first 200 chars):', scriptContent.substring(0, 200) + '...');
            } else if (this.script && this.script.length > 0) {
                // User has edited the script and it's still in memory - use it
                scriptContent = this.script.join('\n');
                console.log('📝 ✅ Using current this.script content from active editing session');
                console.log('📊 Current script preview (first 200 chars):', scriptContent.substring(0, 200) + '...');
            } else {
                // No edited content - generate fresh script
                console.log('� Generating fresh script content for pipeline:', streamItem.name);
                scriptContent = await this.generatePipelineScript(streamItem.name);
                console.log('📊 Generated script preview (first 200 chars):', scriptContent.substring(0, 200) + '...');
            }

            const fileName = `${streamItem.name}_${this.organization}.py`;
            console.log('📤 Creating script file FIRST:', fileName);
            await this.createScriptFile(streamItem.name, scriptContent, fileName);

            // Step 2: Save JSON (Angular saveJson pattern)
            console.log('💾 Saving JSON for streaming service...');
            await this.saveJson(streamItem, true);

            // Step 3: Check for connection nodes and update datasources if needed
            let jsonContent = streamItem.json_content;
            if (typeof jsonContent === 'string') {
                jsonContent = JSON.parse(jsonContent);
            }

            let connNodeExist = false;
            let connNodeIndex = -1;

            if (jsonContent.elements) {
                jsonContent.elements.forEach((element: any, index: number) => {
                    if (element.name === 'Connection') {
                        connNodeExist = true;
                        connNodeIndex = index;
                    }
                });
            }

            if (connNodeExist && connNodeIndex >= 0) {
                // Handle connection node datasource update
                const connectionElement = jsonContent.elements[connNodeIndex];
                if (connectionElement.attributes && connectionElement.attributes.connections) {
                    try {
                        const datasource = await this.getDatasourceByName(
                            connectionElement.attributes.connections.name,
                            connectionElement.attributes.connections.organization || this.organization
                        );

                        if (datasource && datasource.length > 0) {
                            connectionElement.attributes.connections = datasource[0];
                            streamItem.json_content = JSON.stringify(jsonContent);

                            // Update streaming service with new connection data
                            await this.updateStreamingService(streamItem);
                        }
                    } catch (error) {
                        console.warn('Could not update datasource connection:', error);
                    }
                }
            }

            // Step 4: Execute pipeline directly (matching browser behavior)
            console.log('🚀 Executing pipeline:', streamItem.name);

            // Extract parameters from selectedRunType
            const isLocal = selectedRunType.type === 'Local' ? 'true' : 'false';
            const runtime = selectedRunType.type === 'Local' ? 'Local' : 'REMOTE';
            const datasource = selectedRunType.dsName || selectedRunType.dsAlias || '';
            const alias = streamItem.alias || streamItem.name;

            console.log('🎯 Pipeline execution parameters:', {
                alias: alias,
                name: streamItem.name,
                type: streamItem.type || 'NativeScript',
                isLocal: isLocal,
                runtime: runtime,
                datasource: datasource
            });

            const executionResult = await this.runPipeline(
                alias,
                streamItem.name,
                streamItem.type || 'NativeScript',
                isLocal === 'true' ? 'Local' : 'REMOTE',
                datasource,
                '{}',
                'undefined'
            );

            console.log('✅ Pipeline execution completed:', executionResult);
            return executionResult;

        } catch (error: any) {
            console.error('Error in generateScript:', error);
            throw error;
        }
    }

    private async triggerEvent(path: string, streamItem: any, selectedRunType: any): Promise<any> {
        try {
            console.log('Triggering pipeline event with path:', path);

            // Step 1: Trigger script generation event (Angular pattern)
            const httpsAgent = new https.Agent({
                rejectUnauthorized: false
            });

            const headers = {
                'Accept': 'application/json, text/plain, */*',
                'Authorization': `Bearer ${this._token}`,
                'Content-Type': 'application/json',
                'Project': '2',
                'ProjectName': this.organization,
                'X-Requested-With': 'Leap',
            };

            const body = {
                pipelineName: streamItem.name,
                scriptPath: Array.isArray(path) ? path[0] : path
            };

            console.log('Triggering generateScript event with body:', body);

            // Angular triggerPostEvent pattern: generateScript_{type}
            const eventType = `generateScript_${streamItem.type}`;
            const eventResponse = await axios.post(`/api/aip/service/v1/events/trigger/${eventType}`, body, {
                baseURL: BASE_URL,
                headers: headers,
                httpsAgent: httpsAgent,
                timeout: 60000
            });

            const eventId = eventResponse.data.eventId || eventResponse.data.id || eventResponse.data;
            console.log('Script generation event triggered with ID:', eventId);

            // Step 2: Wait for script generation to complete (Angular getEventStatus pattern)
            let attempts = 0;
            const maxAttempts = 30;

            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000));

                try {
                    const statusResponse = await axios.get(`/api/aip/service/v1/events/status/${eventId}`, {
                        baseURL: BASE_URL,
                        headers: headers,
                        httpsAgent: httpsAgent,
                        timeout: 10000
                    });

                    const status = statusResponse.data.status || statusResponse.data;
                    console.log(`Script generation status: ${status} (attempt ${attempts + 1}/${maxAttempts})`);

                    if (status === 'COMPLETED') {
                        console.log('Script generation completed successfully');
                        break;
                    } else if (status === 'ERROR') {
                        throw new Error('Script generation failed on server');
                    }
                } catch (statusError) {
                    console.warn('Status check failed, continuing...', statusError);
                }

                attempts++;
            }

            if (attempts >= maxAttempts) {
                console.warn('Script generation taking longer than expected, proceeding with pipeline run...');
            }

            // Step 3: Run pipeline (Angular runPipeline pattern)
            const pipelineAlias = streamItem.alias || streamItem.name;
            const pipelineName = streamItem.name;
            const passType = streamItem.type === 'Binary' || streamItem.type === 'NativeScript' ? streamItem.type : 'DragAndDrop';
            const isLocal = selectedRunType.type === 'Local' ? 'true' : 'false';
            const datasource = selectedRunType.dsName || '';
            const params = 'generated';

            console.log('Running pipeline with params:', {
                alias: pipelineAlias,
                name: pipelineName,
                type: passType,
                isLocal: isLocal,
                datasource: datasource,
                params: params
            });

            const executionResult = await this.runPipeline(
                pipelineAlias,
                pipelineName,
                passType,
                isLocal,
                datasource,
                params,
                ''
            );

            return executionResult;
        } catch (error: any) {
            console.error('Error in triggerEvent:', error);
            throw error;
        }
    }

    private async generatePipelineScript(pipelineName: string): Promise<string> {
        // Generate the exact Python script content from your curl example
        const generatedScript = `import os
import json
import requests
import shutil
import boto3
import stat
import sys
import logging as logger

logger.basicConfig(level=logger.INFO, format='%(asctime)s - %(levelname)s - %(message)s', datefmt='%y/%m/%d %H:%M:%S')
 
arguments = sys.argv
argsDict = {}
for arg in arguments:
    try:
        argsDict[arg.split(':')[0]] = (':').join(arg.split(':')[1:])
    except IndexError as e:
        logger.error(f"Invalid argument format: {arg}. Error: {str(e)}")
        continue

dataset_details = json.loads(argsDict.get("dataset"))

def parse_nested_json(obj):
    print();
    if isinstance(obj, str):
        try:
            parsed = json.loads(obj)
            return parse_nested_json(parsed)
        except (json.JSONDecodeError, TypeError):
            return obj
    elif isinstance(obj, dict):
        return {k: parse_nested_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [parse_nested_json(elem) for elem in obj]
    else:
        return obj
        

parsed_data_details = parse_nested_json(dataset_details)



datasetid_param = parsed_data_details.get("name")
org_param = parsed_data_details.get("organization")


def s3_download_data(end_point_url,access_key,secret_key,bucket, obj_key, local_path):

    \"""

    Download a folder from S3 to a local path.

    \"""

    session = boto3.session.Session()

    s3c = session.client(

        aws_access_key_id=access_key,

        aws_secret_access_key=secret_key,

        endpoint_url=end_point_url,

        service_name="s3",

        use_ssl=False,

    )    

    resource = boto3.resource(

        aws_access_key_id=access_key,

        aws_secret_access_key=secret_key,

        endpoint_url=end_point_url,

        service_name="s3",

        use_ssl=False,
        )
    # List all objects in the folder

    response = s3c.list_objects_v2(Bucket=bucket, Prefix=obj_key)

    objects = response.get('Contents', [])

    for obj in objects:

        key = obj['Key']
        # if key == "icets-sv":
        print("Downloading file: ", key)
        file_path = os.path.join(local_path, key)
        try:
            if not os.path.exists(os.path.dirname(file_path)):
                os.makedirs(os.path.dirname(file_path))
            if not obj.get('Key').endswith('/'):
                resource.meta.client.download_file(bucket, obj.get('Key'), file_path)
                print(f"Downloaded {key} to {file_path}")
        except PermissionError as e:
            print(f"PermissionError: {e} - Skipping {key}")    
    return file_path    
            
def DatasetExtractor():    #python-script Data

    #get dataset configurations 

    #  = getdatasetconfig(dataset_id=datasetid_param, organization=org_param)   

    dataset_type = parsed_data_details['datasource']['type']  

    print("dataset_type",dataset_type)

    if dataset_type == 'S3':

        connection_dict = parsed_data_details['datasource']['connectionDetails']

        print("Fetched Connection Details")

        s3_access_key = connection_dict['accessKey']

        s3_secret_key = connection_dict['secretKey']

        s3_end_point_url = connection_dict['url'] 

        attribute = parsed_data_details['attributes']

        bucket = attribute['bucket']               
        path = attribute['path']   

        obj_key = attribute['object']  

        key = f'{path}/{obj_key}'

        local_path = "/home/useradmin/py-job-executer/tmp/sample_linear"

        def on_rm_error(func, path, exc_info):

            if not os.access(path, os.W_OK):

                os.chmod(path, stat.S_IWUSR)

                func(path)

            else:

                raise

        if os.path.exists(local_path):

            shutil.rmtree(local_path, onerror=on_rm_error)

        if not os.path.exists(local_path):

            os.makedirs(local_path)

        os.listdir(local_path)
        
        file_path = s3_download_data(end_point_url = s3_end_point_url, access_key = s3_access_key, secret_key=s3_secret_key, bucket = bucket, obj_key = key, local_path = local_path)
        return file_path
    else:
        print("Type not supported...")
    return local_path
    
    

saved_path = DatasetExtractor()
print(saved_path)

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import joblib
from pathlib import Path



full_path = Path(saved_path)
parent_path = full_path.parent

# Read data from CSV file
data = pd.read_csv(saved_path)
X = data[['YearsExperience']]  # Replace with your feature columns
y = data['Salary']  # Replace with your target column

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create and train the model
model = LinearRegression()
model.fit(X_train, y_train)

# Save the model to a file
joblib.dump(model, os.path.join(parent_path, "salary_linear_regression_model.pkl"))

print("Model saved to 'salary_linear_regression_model.pkl'")


import boto3

import uuid

import os

from botocore.client import Config

from pathlib import Path

import requests

import json
 
 
 

 
def upload_model(bucket_name, model_name, folder_name):

    \"""

    model_name: name of the model that saved.

    folder_name: Name of the folder to be created inside bucket.

    Returns:

    Uploaded path of the model to s3.

    \"""

    datasource_details = parsed_data_details.get("datasource")

    connection_details = datasource_details.get('connectionDetails')


    access_key = connection_details['accessKey']

    secret_key = connection_details['secretKey']

    region = connection_details['Region']

    endpoint_url = connection_details['url']

    current_file_path = os.path.join(parent_path, "salary_linear_regression_model.pkl")

    unique_id = str(uuid.uuid4())
 
    _, file_extension = os.path.splitext(model_name)
 
    new_model_file_name = f"{os.path.splitext(model_name)[0]}_{unique_id}{file_extension}"
 
    s3_key = f"{folder_name.rstrip('/')}/{new_model_file_name}"
 
    s3 = boto3.client('s3',

                      endpoint_url = endpoint_url,

                      region_name = region,

                      aws_access_key_id = access_key,

                      aws_secret_access_key = secret_key,

                      config = Config(signature_version = "s3v4")

                      )

    try:

        with open(current_file_path, 'rb') as script_file:

            s3.upload_fileobj(script_file, bucket_name, s3_key)

        model_headers = {'access-token': 'aec127c2-c984-33f6-9a3a-355xd1dof097', 'project': '2', 'Content-Type': 'application/json'}

        payload = {

                        "Model Name": model_name,

                        "Version": "1",

                        "Container ImageUri": folder_name,

                        "Storage Type": "s3",

                        "Storage Uri": s3_key

                    }

        model_card = "https://essedum.az.ad.idemo-ppc.com/api/aip/service/v1/models/register?project=leo1311&isCached=true&adapter_instance=local"

        try:

            model_response = requests.post(url = model_card, headers=model_headers, json=payload, verify=False)

        except Exception as e:

            print("Got Exception when registering model.", {e})
 
        print(f"Script uploaded to minio://aipmodels/{s3_key}")
 
        file = Path(model_name)

        if file.exists():

            file.unlink()

            print("deleted in local")

    except Exception as e:

        print(f"Failed to upload and Got an exception:{e}")
 
    return s3_key
 
 
uploaded_path = upload_model('aipmodels','salary_linear_regression_model', "models/linear")

print(f"The model got uploaded {uploaded_path} here")





 `;

        console.log('Script generated for pipeline:', pipelineName);
        return generatedScript;
    }

    private async triggerPipelineExecution(pipelineName: string, runtime: string = 'Local'): Promise<any> {
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false
        });

        const headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Authorization': `Bearer ${this._token}`,
            'Content-Type': 'application/json',
            'Project': '2',
            'ProjectName': this.organization,
            'X-Requested-With': 'Leap',
            'roleId': '1',
            'roleName': 'IT Portfolio Manager',
            'Referer': BASE_URL,
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        };

        const requestBody = {
            pipelineName: pipelineName,
            organization: this.organization,
            runtime: runtime
        };

        const response = await axios.post(`/api/aip/service/v1/pipeline/run-pipeline/NativeScript/${pipelineName}/${this.organization}/${runtime}`, requestBody, {
            baseURL: BASE_URL,
            headers: headers,
            httpsAgent: httpsAgent,
            timeout: 60000
        });

        console.log('Pipeline execution triggered:', response.data);
        return response.data;
    }

    private async updateStreamingService(streamItem: any): Promise<void> {
        try {
            console.log('Updating streaming service:', streamItem.name);

            // Create HTTPS agent with SSL bypass
            const httpsAgent = new https.Agent({
                rejectUnauthorized: false,
                requestCert: false
            });

            // Headers matching the working API call exactly
            const headers = {
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'en-US,en;q=0.9',
                'authorization': `Bearer ${this._token}`,
                'content-type': 'application/json; charset=UTF-8',
                'connection': 'keep-alive',
                'origin': 'https://essedum.az.ad.idemo-ppc.com',
                'priority': 'u=1, i',
                'project': '2',
                'projectname': this.organization,
                'referer': 'https://essedum.az.ad.idemo-ppc.com/',
                'roleid': '1',
                'rolename': 'IT Portfolio Manager',
                'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
                'x-requested-with': 'Leap'
            };

            // Build the exact payload structure from the working curl command
            let jsonContent = streamItem.json_content;
            if (typeof jsonContent === 'string') {
                try {
                    jsonContent = JSON.parse(jsonContent);
                } catch (parseError) {
                    console.warn('Failed to parse existing json_content, using default');
                    jsonContent = {
                        elements: [{
                            attributes: {
                                filetype: 'Python3',
                                files: [`${streamItem.name}_${this.organization}.py`],
                                arguments: [{
                                    name: 'dataset',
                                    value: `${streamItem.name}_DATASET`,
                                    type: 'Dataset',
                                    alias: `${streamItem.name}_DATASET`,
                                    index: '1'
                                }],
                                dataset: [],
                                usedSecrets: []
                            }
                        }],
                        environment: [],
                        default_runtime: {
                            dsAlias: 'Sample-Remote-Test',
                            dsName: `${streamItem.name}_RUNTIME`,
                            type: 'REMOTE'
                        }
                    };
                }
            }

            // Ensure json_content is properly stringified for the API
            const requestBody = {
                cid: streamItem.cid || streamItem.id || 21,
                alias: streamItem.alias || streamItem.name,
                name: streamItem.name,
                description: streamItem.description || '',
                job_id: streamItem.job_id || null,
                json_content: typeof jsonContent === 'string' ? jsonContent : JSON.stringify(jsonContent),
                type: streamItem.type || 'NativeScript',
                organization: this.organization,
                created_date: streamItem.created_date || streamItem.createdDate || new Date().toISOString(),
                created_by: streamItem.created_by || streamItem.createdBy || 'demouser',
                tags: streamItem.tags || null,
                version: typeof streamItem.version === 'number' ? streamItem.version : (streamItem.version || 2),
                interfacetype: streamItem.interfacetype || 'pipeline',
                is_template: streamItem.is_template || false,
                is_app: streamItem.is_app || false
            };

            console.log('Request payload:', JSON.stringify(requestBody, null, 2));

            // Make the API call with absolute URL
            const response = await axios.put(
                'https://essedum.az.ad.idemo-ppc.com/api/aip/service/v1/streamingServices/update',
                requestBody,
                {
                    headers: headers,
                    httpsAgent: httpsAgent,
                    timeout: 30000,
                    validateStatus: function (status) {
                        return status >= 200 && status < 300; // Accept only 2xx status codes
                    }
                }
            );

            console.log('Streaming service update response:', {
                status: response.status,
                statusText: response.statusText,
                data: response.data,
                headers: response.headers
            });

            return response.data;

        } catch (error: any) {
            console.error('Failed to update streaming service - Full error:', error);

            // Provide detailed error information
            let errorMessage = 'Failed to update streaming service';

            if (error.response) {
                console.error('Response error details:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data,
                    headers: error.response.headers
                });

                errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
                if (error.response.data && error.response.data.message) {
                    errorMessage += ` - ${error.response.data.message}`;
                }
            } else if (error.request) {
                console.error('Request error:', error.request);
                errorMessage = 'Network timeout or connection refused';
            } else {
                console.error('Setup error:', error.message);
                errorMessage = `Request setup error: ${error.message}`;
            }

            throw new Error(errorMessage);
        }
    }

    // Handle script content changes - save to scriptContent property
    private onScriptChange(scriptLines: string[]): void {
        console.log('📝 🔄 onScriptChange called with', scriptLines.length, 'lines');
        console.log('📝 First 3 lines preview:');
        scriptLines.slice(0, 3).forEach((line, index) => {
            console.log(`  ${index + 1}: ${line.substring(0, 80)}${line.length > 80 ? '...' : ''}`);
        });

        this.script = scriptLines;
        this.scriptContent = scriptLines.join('\n');

        console.log('📝 ✅ onScriptChange completed:');
        console.log('📝   this.script.length:', this.script.length);
        console.log('📝   this.scriptContent.length:', this.scriptContent.length);
        console.log('�   scriptContent preview (first 200 chars):', this.scriptContent.substring(0, 200) + '...');

        // Log specific changes that indicate user editing
        if (this.script.length > 0) {
            const hasCustomChanges = this.script.some(line =>
                line.includes('Parsing nested JSON...') ||
                line.includes('print("') ||
                line.includes('# Custom') ||
                line.includes('Starting the script')
            );
            if (hasCustomChanges) {
                console.log('✅ onScriptChange: Detected user customizations in script content');
            } else {
                console.log('⚠️ onScriptChange: No user customizations detected');
            }
        }
    }

    // Edit script functionality - opens script content in VS Code editor with auto-save
    private async editScript(cardId: string, fileName: string, currentContent: string): Promise<void> {
        try {
            console.log('🔧 Opening script for editing with auto-save:', fileName);

            // Find the pipeline by cardId
            const pipeline = this.allCards.find((card: PipelineCard) => card.id === cardId);
            if (!pipeline) {
                throw new Error('Pipeline not found');
            }

            // Generate fresh script content for editing
            let scriptContent: string;
            if (currentContent && currentContent !== 'Generated script content will be loaded...') {
                scriptContent = currentContent;
            } else {
                console.log('🔄 Generating fresh script content for editing...');
                scriptContent = await this.generatePipelineScript(pipeline.name);
            }

            // Split content into lines for editing (similar to Angular pattern)
            const scriptLines = scriptContent.split('\n');
            this.onScriptChange(scriptLines);

            // Create a new untitled document with the script content
            const document = await vscode.workspace.openTextDocument({
                content: scriptContent,
                language: 'python'
            });

            // Open the document in VS Code editor
            const editor = await vscode.window.showTextDocument(document);

            // Set up auto-save functionality - listen for document changes
            const changeDisposable = vscode.workspace.onDidChangeTextDocument(async (event) => {
                if (event.document === document) {
                    console.log('📝 Script content changed, triggering onScriptChange...');

                    // Get updated content and split into lines (Angular pattern)
                    const updatedContent = event.document.getText();
                    const updatedLines = updatedContent.split('\n');

                    // Call onScriptChange like Angular code editor
                    this.onScriptChange(updatedLines);

                    console.log('✅ Script state updated with', this.script.length, 'lines');
                }
            });

            // Set up save listener - automatically upload when user saves
            const saveDisposable = vscode.workspace.onDidSaveTextDocument(async (savedDocument) => {
                if (savedDocument === document) {
                    console.log('💾 📥 SAVE EVENT TRIGGERED - Document saved, auto-uploading script changes...');
                    console.log('📄 Saved document URI:', savedDocument.uri.toString());
                    console.log('📄 Target document URI:', document.uri.toString());
                    console.log('📄 URIs match:', savedDocument.uri.toString() === document.uri.toString());

                    try {
                        // Get the saved content and update scriptContent
                        const savedContent = savedDocument.getText();
                        const savedLines = savedContent.split('\n');

                        console.log('📝 Saved content length:', savedContent.length);
                        console.log('📝 Saved lines count:', savedLines.length);
                        console.log('📝 First 200 chars of saved content:', savedContent.substring(0, 200) + '...');

                        // Update script state - this will set this.scriptContent
                        this.onScriptChange(savedLines);

                        console.log('📊 After onScriptChange:');
                        console.log('📊   this.scriptContent length:', this.scriptContent.length);
                        console.log('📊   this.script length:', this.script.length);
                        console.log('📊   scriptContent preview:', this.scriptContent.substring(0, 200) + '...');

                        // Generate filename with timestamp
                        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                        const scriptFileName = `${pipeline.name}_${this.organization}.py`;

                        console.log('📤 About to upload file:', scriptFileName);

                        // Auto-upload using Angular pattern
                        await this.createNativeFileWithFormData(pipeline.name, scriptFileName);

                        // Show success message
                        vscode.window.showInformationMessage(
                            `✅ Script changes auto-uploaded successfully to ${scriptFileName}!`
                        );

                        // Update stream item and save (following Angular pattern)
                        await this.updateStreamItemAfterFileUpload(pipeline, scriptFileName);

                    } catch (error: any) {
                        console.error('❌ Auto-upload failed:', error);
                        vscode.window.showErrorMessage(`Auto-upload failed: ${error.message}`);
                    }
                } else {
                    console.log('📄 ⚠️ Save event for different document, ignoring...');
                    console.log('📄 Saved document URI:', savedDocument.uri.toString());
                    console.log('📄 Target document URI:', document.uri.toString());
                }
            });

            // Clean up listeners when document is closed
            const closeDisposable = vscode.workspace.onDidCloseTextDocument((closedDocument) => {
                if (closedDocument === document) {
                    console.log('📄 Script editor closed, cleaning up listeners');
                    changeDisposable.dispose();
                    saveDisposable.dispose();
                    closeDisposable.dispose();
                }
            });

            // Show initial instructions
            vscode.window.showInformationMessage(
                `📝 Script editor opened for "${pipeline.name}". Changes will be auto-uploaded when you save (Ctrl+S).`
            );

        } catch (error: any) {
            console.error('❌ Failed to open script for editing:', error);
            vscode.window.showErrorMessage(`Failed to open script for editing: ${error.message}`);
        }
    }

    // Update stream item after file upload (following Angular pattern)
    private async updateStreamItemAfterFileUpload(pipeline: PipelineCard, fileName: string): Promise<void> {
        try {
            console.log('🔄 Updating stream item after file upload (Angular pattern)...');

            // Simulate Angular pattern: update data.files[0], arguments, etc.
            const streamItem = {
                name: pipeline.name,
                organization: this.organization,
                json_content: JSON.stringify({
                    elements: [{
                        attributes: {
                            files: [fileName],
                            filetype: 'Python3',
                            arguments: {},
                            usedSecrets: []
                        }
                    }],
                    environment: [],
                    default_runtime: 'REMOTE'
                })
            };

            console.log('📊 Stream item to update:', streamItem);

            // Call the update streaming service API
            await this.updateStreamingService(streamItem);

            console.log('✅ Stream item updated successfully');

        } catch (error: any) {
            console.error('❌ Failed to update stream item:', error);
            throw error;
        }
    }

    // Save script functionality - uploads modified script content (Angular pattern)
    private async saveScript(cardId: string, fileName: string, content: string): Promise<void> {
        try {
            console.log('💾 Saving script:', fileName);

            // Find the pipeline by cardId
            const pipeline = this.allCards.find((card: PipelineCard) => card.id === cardId);
            if (!pipeline) {
                throw new Error('Pipeline not found');
            }

            // Update script content from editor (similar to Angular onScriptChange)
            const scriptLines = content.split('\n');
            this.onScriptChange(scriptLines);

            // Create FormData following Angular pattern
            await this.createNativeFileWithFormData(pipeline.name, fileName);

            vscode.window.showInformationMessage(`Script ${fileName} uploaded successfully!`);

            // Refresh the pipeline details to show updated content
            await this.viewScriptDetails(cardId);

        } catch (error: any) {
            console.error('❌ Failed to save script:', error);
            vscode.window.showErrorMessage(`Failed to save script: ${error.message}`);
        }
    }

    /**
     * Create native file with FormData (Angular pattern implementation)
     * Follows the exact pattern from Angular: script.join('\n') -> Blob -> FormData
     */
    private async createNativeFileWithFormData(pipelineName: string, fileName: string): Promise<any> {
        try {
            console.log('🚀 Starting createNativeFileWithFormData (Angular pattern)...');
            console.log('📁 Pipeline Name:', pipelineName);
            console.log('📄 File Name:', fileName);
            console.log('📝 this.script lines count:', this.script.length);
            console.log('📝 this.scriptContent length:', this.scriptContent.length);

            // Check if script content exists - prefer scriptContent over script lines
            let scriptToUpload: string;
            if (this.scriptContent && this.scriptContent.length > 0) {
                scriptToUpload = this.scriptContent;
                console.log('✅ Using this.scriptContent (preferred)');
            } else if (this.script && this.script.length > 0) {
                scriptToUpload = this.script.join('\n');
                console.log('⚠️ Falling back to this.script.join()');
            } else {
                throw new Error('No script content available. Please ensure script is loaded first.');
            }

            // Debug: Print script content details
            console.log('📊 Script content to upload (first 500 chars):');
            console.log(scriptToUpload.substring(0, 500));
            console.log('📏 Total script length:', scriptToUpload.length);
            console.log('📝 Number of lines in scriptToUpload:', scriptToUpload.split('\n').length);

            // Script list to file (exact Angular pattern)
            const formData = new FormData();

            // Create the form data exactly like the working curl command
            formData.append('scriptFile', Buffer.from(scriptToUpload, 'utf8'), {
                filename: 'blob',
                contentType: 'text/plain'
            });

            console.log('✅ FormData created successfully');

            const httpsAgent = new https.Agent({
                rejectUnauthorized: false
            });

            // Headers matching the exact working curl command
            const headers = {
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'en-US,en;q=0.9',
                'authorization': `Bearer ${this._token}`,
                'origin': 'https://essedum.az.ad.idemo-ppc.com',
                'priority': 'u=1, i',
                'project': '2',
                'projectname': this.organization,
                'referer': 'https://essedum.az.ad.idemo-ppc.com/',
                'roleid': '1',
                'rolename': 'IT Portfolio Manager',
                'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
                'x-requested-with': 'Leap',
                // Don't manually set content-type, let FormData handle it
                ...formData.getHeaders()
            };

            const url = `https://essedum.az.ad.idemo-ppc.com/api/aip/file/create/${pipelineName}/${this.organization}/Python3?file=${fileName}`;

            console.log('🌐 API URL:', url);
            console.log('🔑 Authorization token length:', this._token?.length || 0);
            console.log('📋 Request headers:');
            Object.keys(headers).forEach(key => {
                if (key !== 'authorization') {
                    console.log(`  ${key}: ${(headers as any)[key]}`);
                } else {
                    console.log(`  ${key}: Bearer [REDACTED_${this._token?.length || 0}_CHARS]`);
                }
            });

            console.log('📤 Sending POST request to upload script...');
            const response = await axios.post(url, formData, {
                headers: headers,
                httpsAgent: httpsAgent,
                timeout: 30000,
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            });

            console.log('✅ Native file created successfully (Angular pattern)!');
            console.log('📊 Response Status:', response.status);
            console.log('📋 Response Data:', response.data);
            console.log('📈 Response Headers:', response.headers);
            return response.data;

        } catch (error: any) {
            console.error('❌ Failed to create native file:', error);

            let errorMessage = 'Failed to create native file';
            if (error.response) {
                console.error('📋 Native file creation error details:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data,
                    headers: error.response.headers
                });
                errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
                if (error.response.data) {
                    errorMessage += ` - ${JSON.stringify(error.response.data)}`;
                }
            } else if (error.request) {
                console.error('🌐 Request error:', error.request);
                errorMessage = 'Network error - could not reach the server';
            } else {
                console.error('⚙️ Setup error:', error.message);
                errorMessage = `Request setup error: ${error.message}`;
            }

            throw new Error(errorMessage);
        }
    }

    /**
     * Upload/create script file to server - missing API from browser calls
     * API: /api/aip/file/create/{pipelineName}/{org}/Python3
     */
    private async createScriptFile(pipelineName: string, scriptContent: string, fileName: string): Promise<any> {
        try {
            console.log('🚀 Starting createScriptFile API call...');
            console.log('📁 Pipeline Name:', pipelineName);
            console.log('📄 File Name:', fileName);
            console.log('📏 Script Content Length:', scriptContent.length);

            const httpsAgent = new https.Agent({
                rejectUnauthorized: false
            });

            // Create FormData for multipart/form-data request
            const form = new FormData();

            // Add the script file as blob (matching browser behavior)
            form.append('scriptFile', Buffer.from(scriptContent, 'utf8'), {
                filename: 'blob',
                contentType: 'text/plain'
            });

            const headers = {
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'en-US,en;q=0.9',
                'authorization': `Bearer ${this._token}`,
                'origin': 'https://essedum.az.ad.idemo-ppc.com',
                'priority': 'u=1, i',
                'project': '2',
                'projectname': this.organization,
                'referer': 'https://essedum.az.ad.idemo-ppc.com/',
                'roleid': '1',
                'rolename': 'IT Portfolio Manager',
                'sec-ch-ua': '"Microsoft Edge";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
                'x-requested-with': 'Leap',
                ...form.getHeaders()
            };

            const url = `https://essedum.az.ad.idemo-ppc.com/api/aip/file/create/${pipelineName}/${this.organization}/Python3?file=${fileName}`;

            console.log('🌐 API URL:', url);
            console.log('📋 Headers:', JSON.stringify(headers, null, 2));
            console.log('📄 Script content being uploaded (length):', scriptContent.length);
            console.log('📊 Script preview (first 300 chars):', scriptContent.substring(0, 300) + '...');
            const response = await axios.post(url, form, {
                headers: headers,
                httpsAgent: httpsAgent,
                timeout: 30000
            });

            console.log('✅ Script file created successfully!');
            console.log('📊 Response Status:', response.status);
            console.log('📋 Response Data:', response.data);
            return response.data;

        } catch (error: any) {
            console.error('❌ Failed to create script file:', error);

            let errorMessage = 'Failed to create script file';
            if (error.response) {
                console.error('📋 File creation error details:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                });
                errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
            } else if (error.request) {
                console.error('🌐 Request error:', error.request);
                errorMessage = 'Network error - could not reach the server';
            } else {
                console.error('⚙️ Setup error:', error.message);
                errorMessage = `Request setup error: ${error.message}`;
            }

            throw new Error(errorMessage);
        }
    }

    // Angular pattern runPipeline method - matches Angular implementation exactly
    private async runPipeline(
        alias: string,
        cname: string,
        pipelineType: string,
        isLocal: string = 'REMOTE',
        datasource: string = '',
        params: string = '{}',
        workerlogId: string = 'undefined'
    ): Promise<any> {
        console.log('🔥 Starting runPipeline API call...');
        console.log('📋 Parameters:', { alias, cname, pipelineType, isLocal, datasource, params, workerlogId });

        const org = this.organization;
        const offset = new Date().getTimezoneOffset();

        const httpsAgent = new https.Agent({
            rejectUnauthorized: false
        });

        // Headers matching your exact curl request
        const headers = {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9',
            'authorization': `Bearer ${this._token}`,
            'content-type': 'application/json',
            'priority': 'u=1, i',
            'project': '2',
            'projectname': org,
            'referer': 'https://essedum.az.ad.idemo-ppc.com/',
            'roleid': '1',
            'rolename': 'IT Portfolio Manager',
            'sec-ch-ua': '"Microsoft Edge";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
            'x-requested-with': 'Leap'
        };

        // Build URL exactly matching your curl: run-pipeline/{pipelineType}/{cname}/{org}/{isLocal}
        const baseUrl = `https://essedum.az.ad.idemo-ppc.com/api/aip/service/v1/pipeline/run-pipeline/${pipelineType}/${cname}/${org}/${isLocal}`;

        // Build query parameters exactly matching your curl
        const queryParams = new URLSearchParams();
        queryParams.append('offset', offset.toString());
        queryParams.append('param', params);
        queryParams.append('alias', alias);
        if (datasource && datasource !== '') {
            queryParams.append('datasource', datasource);
        }
        if (workerlogId && workerlogId !== 'undefined') {
            queryParams.append('workerlogId', workerlogId);
        } else {
            queryParams.append('workerlogId', 'undefined');
        }

        const fullUrl = `${baseUrl}?${queryParams.toString()}`;

        console.log('🌐 Full API URL:', fullUrl);
        console.log('📋 Request Headers:', JSON.stringify(headers, null, 2));

        try {
            const response = await axios.get(fullUrl, {
                headers: headers,
                httpsAgent: httpsAgent,
                timeout: 60000,
                responseType: 'text'
            });

            console.log('✅ Pipeline execution successful!');
            console.log('📊 Response Status:', response.status);
            console.log('📋 Response Data:', response.data);
            return response.data;

        } catch (error: any) {
            console.error('❌ Pipeline execution failed:', error);

            if (error.response) {
                console.error('📋 Error Response:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                });
            }

            throw error;
        }
    }

    /**
     * Angular-style runScript workflow: runScript -> generateScript -> saveJson -> savePipelineJSON -> triggerEvent -> runPipeline
     */
    private async runPipelineScript(cardId: string, runType: string): Promise<void> {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) {
            vscode.window.showErrorMessage('Pipeline not found');
            return;
        }

        const pipelineName = card.alias || card.name;

        console.log('🚀 runPipelineScript called for:', pipelineName);
        console.log('🔍 runPipelineScript: DEBUG - Checking script state at start...');
        console.log('🔍 runPipelineScript: this.script exists?', !!this.script);
        console.log('🔍 runPipelineScript: this.script length:', this.script ? this.script.length : 'undefined');
        console.log('🔍 runPipelineScript: this.scriptContent length:', this.scriptContent ? this.scriptContent.length : 'undefined');

        if (this.script && this.script.length > 0) {
            console.log('🔍 runPipelineScript: First line of this.script:', this.script[0].substring(0, 100));
        }

        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Running pipeline ${pipelineName}...`,
                cancellable: false
            }, async (progress) => {

                // Parse runType to extract runtime info (Angular pattern)
                let selectedRunType = {
                    type: 'Local',
                    dsName: '',
                    dsAlias: ''
                };

                if (typeof runType === 'string') {
                    const runTypeParts = runType.split('-');
                    selectedRunType.type = runTypeParts[0] || 'Local';
                    selectedRunType.dsAlias = runTypeParts[1] || '';
                    selectedRunType.dsName = runTypeParts[1] || '';
                } else if (typeof runType === 'object' && runType) {
                    selectedRunType.type = (runType as any).type || 'Local';
                    selectedRunType.dsAlias = (runType as any).dsAlias || '';
                    selectedRunType.dsName = (runType as any).dsName || '';
                }

                // Step 1: Get streaming service data (Angular getStreamingServicesByName pattern)
                progress.report({ increment: 20, message: 'Getting streaming service data...' });
                const streamItem = await this.getStreamingServicesByName(card.name, this.organization);

                if (!streamItem) {
                    throw new Error('Could not find streaming service for pipeline');
                }

                // Step 2: Follow Angular runScript -> generateScript workflow
                progress.report({ increment: 60, message: 'Executing Angular workflow...' });
                const executionResult = await this.generateScript(streamItem, selectedRunType);

                progress.report({ increment: 100, message: 'Pipeline started successfully!' });

                // Handle execution result
                if (executionResult) {
                    let jobId = null;

                    if (typeof executionResult === 'string') {
                        const jobIdMatch = executionResult.match(/job[_\s]*id[:\s]*([\w-]+)/i);
                        if (jobIdMatch) {
                            jobId = jobIdMatch[1];
                        }
                    } else if (typeof executionResult === 'object') {
                        jobId = executionResult.jobId || executionResult.id || executionResult.job_id;
                    }

                    if (jobId) {
                        const result = await vscode.window.showInformationMessage(
                            `Pipeline "${pipelineName}" started successfully! Job ID: ${jobId}`,
                            'View Logs',
                            'OK'
                        );

                        if (result === 'View Logs') {
                            await this.viewPipelineLogs(cardId);
                        }
                    } else {
                        vscode.window.showInformationMessage(
                            `Pipeline "${pipelineName}" started successfully!`
                        );
                    }
                } else {
                    vscode.window.showInformationMessage(`Pipeline "${pipelineName}" started successfully!`);
                }
            });

        } catch (error: any) {
            console.error('Pipeline run error:', error);
            let errorMessage = 'Failed to run pipeline';
            if (error.response) {
                errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
                if (error.response.data && error.response.data.message) {
                    errorMessage += ` - ${error.response.data.message}`;
                }
            } else if (error.request) {
                errorMessage = 'Network error - could not reach the server';
            } else {
                errorMessage = `Request setup error: ${error.message}`;
            }
            vscode.window.showErrorMessage(`${errorMessage}: ${error.message}`);
        }
    }

    private async copyScriptToClipboard(cardId: string, fileName: string): Promise<void> {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) {
            return;
        }

        try {
            const scripts = await this.fetchPipelineScripts(card.alias || card.name);
            const scriptFile = scripts.files.find(f => f.fileName === fileName);

            if (scriptFile) {
                await vscode.env.clipboard.writeText(scriptFile.content);
                vscode.window.showInformationMessage('Script copied to clipboard!');
            }
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to copy script: ${error.message}`);
        }
    }

    private async refreshScripts(cardId: string): Promise<void> {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) {
            return;
        }

        try {
            await this.viewScriptDetails(cardId);
            vscode.window.showInformationMessage('Scripts refreshed successfully!');
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to refresh scripts: ${error.message}`);
        }
    }

    private async viewPipelineLogs(cardId: string): Promise<void> {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) {
            return;
        }

        try {
            // Create and show the job logs viewer with table interface similar to Angular
            const jobLogsViewer = new JobLogsViewer(
                this._context,
                this._token,
                card.name, // Pipeline name
                undefined   // Not an internal job
            );

            await jobLogsViewer.showJobLogsViewer();
            vscode.window.showInformationMessage(`Job logs opened for pipeline: ${card.alias}`);

        } catch (error: any) {
            console.error('Error opening job logs viewer:', error);
            vscode.window.showErrorMessage(`Failed to open job logs: ${error.message}`);
        }
    }

    /**
     * Return to main pipeline view after successful login
     */
    private async returnToMainView(): Promise<void> {
        try {
            console.log('Returning to main pipeline view...');

            // Ensure we have a valid token before proceeding
            if (!this._isAuthenticated) {
                console.log('Warning: returnToMainView called but not authenticated');
                return;
            }

            // Reset the view state
            this.pageNumber = 1;
            this.filter = '';
            this.selectedAdapterType = [];
            this.selectedTag = [];

            // Update the webview to show the main HTML template
            if (this._view) {
                this._view.webview.html = this._getHtmlForWebview(this._view.webview);

                // Wait a moment for the webview to load, then get cards
                setTimeout(async () => {
                    await this.getCards();
                }, 500);
            }

        } catch (error: any) {
            console.error('Error returning to main view:', error);
            vscode.window.showErrorMessage(`Failed to load main view: ${error.message}`);
        }
    }

    /**
     * Get HTML for logout state
     */
    private getLogoutHtml(): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Logged Out</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    padding: 40px;
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    text-align: center;
                }
                .logout-message {
                    margin-bottom: 20px;
                    color: var(--vscode-descriptionForeground);
                }
                .login-button {
                    background-color: #007acc;
                    color: #ffffff;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                }
                .login-button:hover {
                    background-color: #005a9e;
                }
            </style>
        </head>
        <body>
            <div class="logout-message">
                <h2>Logged Out</h2>
                <p>You have been logged out successfully.</p>
                <p><strong>To access pipelines, you need to authenticate with Keycloak.</strong></p>
                <p>Click the button below to start fresh authentication.</p>
            </div>
            <button class="login-button" onclick="loginAgain()" id="loginBtn">🔐 Login with Keycloak</button>
            
            <script>
                const vscode = acquireVsCodeApi();
                
                function loginAgain() {
                    try {
                        console.log('Login button clicked, starting fresh Keycloak authentication...');
                        
                        const button = document.getElementById('loginBtn');
                        button.textContent = '🔄 Starting fresh authentication...';
                        button.disabled = true;
                        
                        // Trigger fresh authentication
                        vscode.postMessage({ 
                            command: 'triggerLogin',
                            timestamp: new Date().toISOString(),
                            forceRefresh: true
                        });
                        
                    } catch (error) {
                        console.error('Error in loginAgain function:', error);
                        alert('Error triggering login. Please try using Command Palette: Ctrl+Shift+P -> "Essedum: Login"');
                        
                        // Reset button
                        const button = document.getElementById('loginBtn');
                        button.textContent = '🔐 Login with Keycloak';
                        button.disabled = false;
                    }
                }
                
                // Test if vscode API is available
                if (typeof acquireVsCodeApi === 'undefined') {
                    console.error('VS Code API not available');
                    document.getElementById('loginBtn').textContent = 'VS Code API Error - Use Command Palette';
                } else {
                    console.log('VS Code API is available');
                }
            </script>
        </body>
        </html>`;
    }



    /**
     * Show job status viewer based on Angular JobDataViewerComponent
     */
    private async showJobStatusViewer(jobStatus: JobStatus, card: PipelineCard): Promise<void> {
        try {
            // Create webview panel for job status
            const jobStatusPanel = vscode.window.createWebviewPanel(
                'jobStatus',
                `Job Status: ${jobStatus.pipelineName}`,
                { viewColumn: vscode.ViewColumn.Two, preserveFocus: false },
                {
                    enableScripts: true,
                    localResourceRoots: [this._extensionUri],
                    retainContextWhenHidden: true
                }
            );

            // Set initial HTML content
            jobStatusPanel.webview.html = this.getJobStatusHtml(jobStatus);

            // Start monitoring job status
            const statusInterval = setInterval(async () => {
                try {
                    const updatedStatus = await this.fetchJobStatus(jobStatus.jobId);
                    if (updatedStatus) {
                        // Update the webview with new status
                        jobStatusPanel.webview.postMessage({
                            command: 'updateStatus',
                            status: updatedStatus
                        });

                        // Stop monitoring if job is completed
                        if (updatedStatus.jobStatus.toLowerCase() !== 'running') {
                            clearInterval(statusInterval);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching job status:', error);
                }
            }, 3000); // Poll every 3 seconds

            // Handle messages from the webview
            jobStatusPanel.webview.onDidReceiveMessage(
                async (message) => {
                    switch (message.command) {
                        case 'viewLogsInBrowser':
                            await this.openLogsInBrowser(jobStatus.jobId);
                            break;
                        case 'refreshStatus':
                            const updatedStatus = await this.fetchJobStatus(jobStatus.jobId);
                            if (updatedStatus) {
                                jobStatusPanel.webview.postMessage({
                                    command: 'updateStatus',
                                    status: updatedStatus
                                });
                            }
                            break;
                        case 'copyJobId':
                            await vscode.env.clipboard.writeText(jobStatus.jobId);
                            vscode.window.showInformationMessage('Job ID copied to clipboard!');
                            break;
                    }
                },
                undefined,
                this._context.subscriptions
            );

            // Clean up interval when panel is disposed
            jobStatusPanel.onDidDispose(() => {
                clearInterval(statusInterval);
            });

        } catch (error: any) {
            console.error('Error showing job status viewer:', error);
            vscode.window.showErrorMessage(`Failed to show job status: ${error.message}`);
        }
    }

    /**
     * Fetch job status from server (based on Angular fetchSparkJob pattern)
     */
    private async fetchJobStatus(jobId: string): Promise<JobStatus | null> {
        try {
            const httpsAgent = new https.Agent({
                rejectUnauthorized: false
            });

            const headers = {
                'Accept': 'application/json, text/plain, */*',
                'Authorization': `Bearer ${this._token}`,
                'Content-Type': 'application/json',
                'Project': '2',
                'ProjectName': this.organization,
                'X-Requested-With': 'Leap',
            };

            // Fetch job status using the pattern from Angular code
            const response = await axios.get(`/api/aip/service/v1/jobs/status/${jobId}`, {
                baseURL: BASE_URL,
                headers: headers,
                httpsAgent: httpsAgent,
                timeout: 10000
            });

            if (response.data) {
                const data = response.data;
                return {
                    jobId: jobId,
                    correlationId: data.correlationId || data.correlationid,
                    streamingService: data.streamingService,
                    jobStatus: data.jobStatus || data.status || 'UNKNOWN',
                    version: data.version,
                    type: data.type,
                    runtime: data.runtime,
                    finishTime: data.finishTime || data.finishtime,
                    submittedBy: data.submittedBy,
                    submittedOn: data.submittedOn,
                    pipelineName: data.pipelineName || data.jobName,
                    organization: data.organization || this.organization,
                    logs: data.log || '',
                    hashParams: data.hashparams || data.hashParams
                };
            }

            return null;
        } catch (error: any) {
            console.error('Failed to fetch job status:', error);
            return null;
        }
    }

    /**
     * Open job logs in browser (following Angular pattern)
     */
    private async openLogsInBrowser(jobId: string): Promise<void> {
        try {
            // Construct the URL to open logs in browser
            const logsUrl = `http://localhost:8087/pipeline/logs?jobId=${jobId}&org=${this.organization}`;

            // Open in VS Code's simple browser
            await vscode.commands.executeCommand('simpleBrowser.show', logsUrl);

            vscode.window.showInformationMessage('Job logs opened in browser');
        } catch (error: any) {
            console.error('Failed to open logs in browser:', error);
            vscode.window.showErrorMessage(`Failed to open logs: ${error.message}`);
        }
    }

    /**
     * Generate HTML for job status viewer (based on Angular JobDataViewer template)
     */
    private getJobStatusHtml(jobStatus: JobStatus): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Job Status - ${jobStatus.pipelineName}</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    padding: 16px;
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                }
                .modal-body {
                    padding: 16px;
                }
                .section {
                    margin-bottom: 24px;
                    padding: 16px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 6px;
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                }
                .section-header {
                    background-color: #0094ff;
                    color: white;
                    padding: 12px 16px;
                    border-radius: 6px 6px 0 0;
                    margin: -16px -16px 16px -16px;
                    font-weight: 600;
                    font-size: 16px;
                }
                .hidden-details {
                    margin: 16px 0;
                }
                .space {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                }
                .content-group {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 16px;
                }
                .content-group > div {
                    display: flex;
                    flex-direction: column;
                }
                .id {
                    font-weight: 600;
                    color: var(--vscode-descriptionForeground);
                    margin: 0 0 4px 0;
                    font-size: 14px;
                }
                .line-wrap {
                    word-break: break-all;
                    color: var(--vscode-editor-foreground);
                    margin: 0;
                    font-size: 14px;
                }
                .footer-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid var(--vscode-panel-border);
                }
                .icon-data-wrap {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 14px;
                }
                .log-card {
                    margin-top: 16px;
                    padding: 16px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 6px;
                    background-color: var(--vscode-editor-background);
                }
                .log-title {
                    font-weight: 600;
                    font-size: 16px;
                    margin-bottom: 12px;
                    color: var(--vscode-editor-foreground);
                }
                .log-content {
                    background-color: var(--vscode-terminal-background, #1e1e1e);
                    color: var(--vscode-terminal-foreground, #ffffff);
                    padding: 12px;
                    border-radius: 4px;
                    font-family: 'Courier New', Consolas, monospace;
                    font-size: 12px;
                    white-space: pre-wrap;
                    word-break: break-word;
                    max-height: 300px;
                    overflow-y: auto;
                    border: 1px solid var(--vscode-panel-border);
                }
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-weight: 600;
                    font-size: 12px;
                    text-transform: uppercase;
                }
                .status-running {
                    background-color: #ffa500;
                    color: white;
                }
                .status-completed {
                    background-color: #28a745;
                    color: white;
                }
                .status-failed {
                    background-color: #dc3545;
                    color: white;
                }
                .status-unknown {
                    background-color: #6c757d;
                    color: white;
                }
                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    margin-right: 8px;
                    margin-bottom: 8px;
                }
                .btn-primary {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }
                .btn-primary:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .btn-secondary {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                }
                .btn-secondary:hover {
                    background-color: var(--vscode-button-secondaryHoverBackground);
                }
                .actions-section {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid var(--vscode-panel-border);
                }
                .loading {
                    color: var(--vscode-progressBar-background);
                    font-style: italic;
                }
            </style>
        </head>
        <body>
            <div class="modal-body">
                <div class="section">
                    <div class="section-header">Job Details</div>
                    <div class="hidden-details">
                        <div class="space">
                            <h3 class="id">Job ID</h3>
                            <h3 class="line-wrap" id="jobId">${jobStatus.jobId}</h3>
                        </div>
                        ${jobStatus.correlationId ? `
                        <div class="space">
                            <h3 class="id">Correlation ID</h3>
                            <h3 id="correlationId">${jobStatus.correlationId}</h3>
                        </div>
                        ` : ''}
                        <div class="content-group">
                            <div>
                                <h3 class="id">Streaming Service</h3>
                                <h3 id="streamingService">${jobStatus.streamingService || 'N/A'}</h3>
                            </div>
                            <div>
                                <h3 class="id">Job Status</h3>
                                <span class="status-badge status-${jobStatus.jobStatus.toLowerCase()}" id="jobStatus">${jobStatus.jobStatus}</span>
                            </div>
                            <div>
                                <h3 class="id">Version</h3>
                                <h3 id="version">${jobStatus.version || 'N/A'}</h3>
                            </div>
                        </div>
                        <div class="content-group">
                            <div>
                                <h3 class="id">Type</h3>
                                <h3 id="type">${jobStatus.type || 'N/A'}</h3>
                            </div>
                            <div>
                                <h3 class="id">Runtime</h3>
                                <h3 id="runtime">${jobStatus.runtime || 'N/A'}</h3>
                            </div>
                            <div>
                                <h3 class="id">Finish Time</h3>
                                <h3 id="finishTime">${jobStatus.finishTime || 'Not finished'}</h3>
                            </div>
                        </div>
                        <hr>
                        <div class="footer-content">
                            <div class="icon-data-wrap">
                                <div class="avatar" id="submittedByAvatar">
                                    ${jobStatus.submittedBy ? jobStatus.submittedBy.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <h3 class="id">Submitted By</h3>
                                    <h3 id="submittedBy">${jobStatus.submittedBy || 'Unknown'}</h3>
                                </div>
                            </div>
                            <div>
                                <h3 class="id">Submitted On</h3>
                                <h3 id="submittedOn">${jobStatus.submittedOn ? new Date(jobStatus.submittedOn).toLocaleString() : 'N/A'}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="log-card">
                    <div class="log-title">Logs:</div>
                    <div class="log-content" id="logContent">
                        <div class="loading">Loading job logs... <span id="statusIndicator">●</span></div>
                    </div>
                    <div class="actions-section">
                        <button class="btn btn-primary" onclick="viewLogsInBrowser()">Open Full Logs in Browser</button>
                        <button class="btn btn-secondary" onclick="refreshStatus()">Refresh Status</button>
                        <button class="btn btn-secondary" onclick="copyJobId()">Copy Job ID</button>
                    </div>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                let statusUpdateInterval;

                // Handle messages from the extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'updateStatus':
                            updateJobStatus(message.status);
                            break;
                    }
                });

                function updateJobStatus(status) {
                    // Update job details
                    document.getElementById('jobId').textContent = status.jobId;
                    if (status.correlationId) {
                        document.getElementById('correlationId').textContent = status.correlationId;
                    }
                    document.getElementById('streamingService').textContent = status.streamingService || 'N/A';
                    
                    // Update status badge
                    const statusElement = document.getElementById('jobStatus');
                    statusElement.textContent = status.jobStatus;
                    statusElement.className = 'status-badge status-' + status.jobStatus.toLowerCase();
                    
                    document.getElementById('version').textContent = status.version || 'N/A';
                    document.getElementById('type').textContent = status.type || 'N/A';
                    document.getElementById('runtime').textContent = status.runtime || 'N/A';
                    document.getElementById('finishTime').textContent = status.finishTime || 'Not finished';
                    document.getElementById('submittedBy').textContent = status.submittedBy || 'Unknown';
                    document.getElementById('submittedOn').textContent = status.submittedOn ? new Date(status.submittedOn).toLocaleString() : 'N/A';

                    // Update avatar
                    const avatar = document.getElementById('submittedByAvatar');
                    avatar.textContent = status.submittedBy ? status.submittedBy.charAt(0).toUpperCase() : 'U';

                    // Update logs
                    const logContent = document.getElementById('logContent');
                    if (status.logs && status.logs.trim()) {
                        let fullLogs = '';
                        if (status.hashParams && status.hashParams.trim()) {
                            fullLogs += status.hashParams + '\\n';
                        }
                        fullLogs += status.logs;
                        logContent.textContent = fullLogs;
                    } else if (status.hashParams && status.hashParams.trim()) {
                        logContent.textContent = status.hashParams;
                    } else {
                        const statusIndicator = document.getElementById('statusIndicator');
                        if (status.jobStatus.toLowerCase() === 'running') {
                            logContent.innerHTML = 'Job is still running... <span id="statusIndicator">●</span>';
                            animateStatusIndicator();
                        } else {
                            logContent.textContent = 'No logs available for this job.';
                        }
                    }
                }

                function animateStatusIndicator() {
                    const indicator = document.getElementById('statusIndicator');
                    if (indicator) {
                        let opacity = 1;
                        setInterval(() => {
                            opacity = opacity === 1 ? 0.3 : 1;
                            indicator.style.opacity = opacity;
                        }, 500);
                    }
                }

                function viewLogsInBrowser() {
                    vscode.postMessage({
                        command: 'viewLogsInBrowser'
                    });
                }

                function refreshStatus() {
                    vscode.postMessage({
                        command: 'refreshStatus'
                    });
                }

                function copyJobId() {
                    vscode.postMessage({
                        command: 'copyJobId'
                    });
                }

                // Start the status indicator animation
                animateStatusIndicator();
            </script>
        </body>
        </html>`;
    }

    private async generatePipelineScripts(pipelineName: string): Promise<void> {
        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Generating scripts for ${pipelineName}...`,
                cancellable: false
            }, async (progress) => {
                const httpsAgent = new https.Agent({
                    rejectUnauthorized: false
                });

                const headers = {
                    'Accept': 'application/json, text/plain, */*',
                    'Authorization': `Bearer ${this._token}`,
                    'Content-Type': 'application/json',
                    'Project': '2',
                    'ProjectName': this.organization,
                    'X-Requested-With': 'Leap',
                };

                progress.report({ increment: 10, message: 'Initiating script generation...' });

                // First, save the pipeline JSON (similar to Angular implementation)
                try {
                    const saveJsonResponse = await axios.post('/api/aip/service/v1/pipelines/save-json', {
                        name: pipelineName,
                        organization: this.organization
                    }, {
                        baseURL: BASE_URL,
                        headers: headers,
                        httpsAgent: httpsAgent,
                        timeout: 30000
                    });

                    progress.report({ increment: 30, message: 'Pipeline JSON saved, generating script...' });
                } catch (saveError) {
                    console.log('Save JSON failed, continuing with direct generation...', saveError);
                    progress.report({ increment: 20, message: 'Proceeding with script generation...' });
                }

                // Trigger script generation using event-based approach (from Angular code)
                const generateResponse = await axios.post('/api/aip/service/v1/events/trigger', {
                    eventType: 'generateScript_Pipeline', // Adjust based on pipeline type
                    pipelineName: pipelineName,
                    organization: this.organization
                }, {
                    baseURL: BASE_URL,
                    headers: headers,
                    httpsAgent: httpsAgent,
                    timeout: 60000
                });

                const eventId = generateResponse.data.eventId || generateResponse.data.id;
                progress.report({ increment: 50, message: 'Script generation in progress...' });

                // Poll for completion using event status
                let attempts = 0;
                const maxAttempts = 30; // 30 seconds

                while (attempts < maxAttempts) {
                    try {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

                        const statusResponse = await axios.get(`/api/aip/service/v1/events/status/${eventId}`, {
                            baseURL: BASE_URL,
                            headers: headers,
                            httpsAgent: httpsAgent,
                            timeout: 10000
                        });

                        if (statusResponse.data === 'COMPLETED' || statusResponse.data.status === 'COMPLETED') {
                            progress.report({ increment: 100, message: 'Scripts generated successfully!' });
                            vscode.window.showInformationMessage(`Scripts generated successfully for ${pipelineName}!`);
                            return;
                        } else if (statusResponse.data === 'ERROR' || statusResponse.data.status === 'ERROR') {
                            throw new Error('Script generation failed on server');
                        }

                        progress.report({
                            increment: 50 + (attempts * 40 / maxAttempts),
                            message: `Generating scripts... (${attempts + 1}/${maxAttempts})`
                        });

                    } catch (statusError) {
                        console.log('Status check failed, continuing...', statusError);
                    }

                    attempts++;
                }

                // If we reach here, generation might be taking longer than expected
                vscode.window.showWarningMessage(
                    `Script generation for ${pipelineName} is taking longer than expected. Please check the pipeline in the web interface.`
                );

            });

        } catch (error: any) {
            console.error('Script generation error:', error);

            let errorMessage = 'Failed to generate scripts';
            if (error.response) {
                errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
            } else if (error.request) {
                errorMessage = 'Network error - could not reach the server';
            }

            vscode.window.showErrorMessage(`${errorMessage}: ${error.message}`);
        }
    }

    /**
     * Create or update a native file based on the Angular createNativeFile pattern
     * @param pipelineName Pipeline name
     * @param organization Organization name
     * @param fileName File name to create/update
     * @param fileType File type (Python3, JavaScript, etc.)
     * @param content File content
     */
    private async createNativeFile(
        pipelineName: string,
        organization: string,
        fileName: string,
        fileType: string,
        content: string
    ): Promise<string> {
        try {
            console.log(`Creating native file: ${fileName} for pipeline: ${pipelineName}`);

            const httpsAgent = new https.Agent({
                rejectUnauthorized: false
            });

            const headers = {
                'Accept': 'application/json, text/plain, */*',
                'Authorization': `Bearer ${this._token}`,
                'Content-Type': 'multipart/form-data',
                'Project': '2',
                'ProjectName': organization,
                'X-Requested-With': 'Leap',
            };

            // Create FormData similar to Angular implementation
            const formData = new FormData();

            // Create a Blob from the script content (similar to Angular)
            const scriptBlob = new Blob([content], { type: 'text/plain' });
            formData.append('scriptFile', scriptBlob, fileName);

            // Add metadata
            formData.append('filetype', fileType);
            formData.append('pipelineName', pipelineName);
            formData.append('organization', organization);

            // Use the native file upload endpoint pattern from Angular
            const response = await axios.post(
                `/file/pipeline/native/upload/${pipelineName}/${organization}`,
                formData,
                {
                    baseURL: BASE_URL,
                    headers: headers,
                    httpsAgent: httpsAgent,
                    timeout: 30000
                }
            );

            console.log('Native file created successfully:', response.data);
            return response.data; // Returns the created file name or path

        } catch (error: any) {
            console.error('Failed to create native file:', error);

            let errorMessage = 'Failed to create native file';
            if (error.response) {
                errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
                console.error('Response data:', error.response.data);
            } else if (error.request) {
                errorMessage = 'Network error - could not reach the server';
            } else {
                errorMessage = `Request setup error: ${error.message}`;
            }

            throw new Error(`${errorMessage}: ${error.message}`);
        }
    }

    /**
     * Download a native file based on the Angular downloadNativeFile pattern
     * @param pipelineName Pipeline name
     * @param organization Organization name  
     * @param fileName File name to download
     */
    private async downloadNativeFile(
        pipelineName: string,
        organization: string,
        fileName: string
    ): Promise<ArrayBuffer> {
        try {
            console.log(`Downloading native file: ${fileName} from pipeline: ${pipelineName}`);

            const httpsAgent = new https.Agent({
                rejectUnauthorized: false
            });

            const headers = {
                'Accept': 'application/octet-stream',
                'Authorization': `Bearer ${this._token}`,
                'Project': '2',
                'ProjectName': organization,
                'X-Requested-With': 'Leap',
            };

            // Use the download endpoint pattern from Angular
            const response = await axios.get(
                `/api/aip/file/pipeline/native/download/${pipelineName}/${organization}/${fileName}`,
                {
                    baseURL: BASE_URL,
                    headers: headers,
                    responseType: 'arraybuffer', // For binary file downloads
                    httpsAgent: httpsAgent,
                    timeout: 30000
                }
            );

            console.log('Native file downloaded successfully');
            return response.data;

        } catch (error: any) {
            console.error('Failed to download native file:', error);

            let errorMessage = 'Failed to download native file';
            if (error.response) {
                errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
            } else if (error.request) {
                errorMessage = 'Network error - could not reach the server';
            } else {
                errorMessage = `Request setup error: ${error.message}`;
            }

            throw new Error(`${errorMessage}: ${error.message}`);
        }
    }

    private async sendPipelineDetailsToWebview(card: PipelineCard, scripts: PipelineScript): Promise<void> {
        if (!this._view) {
            vscode.window.showErrorMessage('Pipeline view not available');
            return;
        }

        // Prepare run types data
        const runTypes = scripts.runTypes || [{
            type: 'Local',
            dsAlias: '',
            dsName: 'Local Runtime',
            dsCapability: ''
        }];

        // Send pipeline details to webview
        this._view.webview.postMessage({
            command: 'showPipelineDetails',
            pipeline: card,
            scripts: scripts,
            runTypes: runTypes
        });
    }

    private async openScriptFromDetails(cardId: string, fileIndex: number): Promise<void> {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) {
            vscode.window.showErrorMessage('Pipeline not found');
            return;
        }

        try {
            // Set current pipeline name for auto-save functionality
            this._currentPipelineName = card.name;
            console.log('🔧 Set current pipeline for auto-save:', this._currentPipelineName);

            const scripts = await this.fetchPipelineScripts(card.name);
            console.log('Fetched Scripts:', scripts);
            if (scripts && scripts.files && scripts.files[fileIndex]) {
                await this.openScriptInEditor(scripts.files[fileIndex]);
            } else {
                vscode.window.showErrorMessage('Script file not found');
            }
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to open script: ${error.message}`);
        }
    }

    /**
     * Handle logout functionality - clears tokens and shows logout page
     */
    private async handleLogout(): Promise<void> {
        try {
            console.log('Starting logout process...');

            // Clear stored tokens and authentication state
            if (this._authService) {
                await this._authService.logout();
                console.log('Auth service logout completed');
            }

            // Execute the logout command to clear tokens from SecretStorage
            await vscode.commands.executeCommand('essedum.logout');
            console.log('Logout command executed');

            // Update the webview to show logout page
            if (this._view) {
                this._view.webview.html = this.getLogoutHtml();
                console.log('Logout HTML displayed');
            }

            // Clear internal state
            this._token = '';
            this.cards = [];

            vscode.window.showInformationMessage('Logged out successfully');

        } catch (error: any) {
            console.error('Error during logout:', error);
            vscode.window.showErrorMessage(`Logout failed: ${error.message}`);

            // Still try to show logout page even if there was an error
            if (this._view) {
                this._view.webview.html = this.getLogoutHtml();
            }
        }
    }
}
