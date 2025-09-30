// Pipeline Cards Component for displaying Essedum pipeline data
import * as vscode from 'vscode';
import axios from 'axios';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';

export interface PipelineCard {
    type: string;
    alias: string;
    createdDate: string;
    created_by: string;
    id?: string;
    [key: string]: any;
}

export interface ScriptFile {
    fileName: string;
    content: string;
    extension: string;
    language: string;
}

export interface PipelineScript {
    pipelineName: string;
    files: ScriptFile[];
    runTypes: any[];
    selectedRunType?: any;
}

export interface HttpParams {
    page: string;
    size: string;
    project: string;
    isCached: string;
    adapter_instance: string;
    interfacetype: string;
    cloud_provider: string;
    type?: string;
    query?: string;
    tags?: string;
}

export interface JobStatus {
    jobId: string;
    correlationId?: string;
    streamingService?: string;
    jobStatus: string;
    version?: string;
    type?: string;
    runtime?: string;
    finishTime?: string;
    submittedBy?: string;
    submittedOn?: string;
    pipelineName: string;
    organization: string;
    logs?: string;
    hashParams?: string;
}

export interface JobLogResponse {
    log: string;
    jobStatus: string;
    hashparams?: string;
    jobmetadata?: string;
    organization?: string;
}

export class PipelineCardsProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private _extensionUri: vscode.Uri;
    private _token: string = '';
    private _isAuthenticated: boolean = false;
    private _authService?: any; // Will be injected from extension

    // Configuration
    private pageNumber: number = 1;
    private pageSize: number = 4;
    private totalCount: number = 0;
    private totalPages: number = 0;
    private allCards: PipelineCard[] = []; // Store all cards for client-side pagination
    private organization: string = 'leo1311';
    private filter: string = '';
    private selectedAdapterType: string[] = [];
    private selectedTag: string[] = [];
    private loading: boolean = false;
    private cards: PipelineCard[] = [];
    private filteredCards: PipelineCard[] = [];
    private users: string[] = [];

    constructor(private readonly _context: vscode.ExtensionContext, token: string, authService?: any) {
        this._extensionUri = _context.extensionUri;
        this.updateToken(token);
        this._authService = authService;
    }

    public updateToken(token: string) {
        this._token = token;
        this._isAuthenticated = !!token && token.trim().length > 0;
        console.log('Token updated, authenticated:', this._isAuthenticated);
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
    private async loadInitialContent(): Promise<void> {
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
            // Convert params to URLSearchParams for axios
            const urlParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    urlParams.append(key, value);
                }
            });

            console.log('Making count API request with params:', urlParams.toString());

            // Create HTTPS agent to bypass SSL certificate issues
            const httpsAgent = new https.Agent({
                rejectUnauthorized: false
            });

            const response = await axios.get('/api/aip/service/v1/pipelines/count', {
                baseURL: 'http://localhost:8087',
                params: urlParams,
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Authorization': `Bearer ${this._token}`,
                    'Connection': 'keep-alive',
                    'Content-Type': 'application/json',
                    'Project': '2',
                    'ProjectName': 'leo1311',
                    'X-Requested-With': 'Leap',
                    'charset': 'utf-8',
                    'roleId': '1',
                    'roleName': 'IT Portfolio Manager',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
                },
                httpsAgent: httpsAgent,
                timeout: 30000
            });

            console.log('Count API Response:', response.data);
            return response.data || 0;

        } catch (error: any) {
            console.error('Error fetching pipelines count:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                console.error('Request made but no response received:', error.request);
            } else {
                console.error('Error setting up request:', error.message);
            }
            throw new Error(`Failed to fetch pipelines count: ${error.message}`);
        }
    }

    private async getPipelinesCards(params: HttpParams): Promise<any> {
        try {
            // Convert params to URLSearchParams for axios
            const urlParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    urlParams.append(key, value);
                }
            });

            console.log('Making API request with params:', urlParams.toString());
            console.log('Using token:', this._token ? 'Token present' : 'No token');
            console.log('Page size in URL params:', urlParams.get('size'));

            // Create HTTPS agent to bypass SSL certificate issues
            const httpsAgent = new https.Agent({
                rejectUnauthorized: false
            });

            const response = await axios.get('/api/aip/service/v1/pipelines/training/list', {
                baseURL: 'http://localhost:8087',
                params: urlParams,
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Authorization': `Bearer ${this._token}`,
                    'Connection': 'keep-alive',
                    'Content-Type': 'application/json',
                    'Project': '2',
                    'ProjectName': 'leo1311',
                    'X-Requested-With': 'Leap',
                    'charset': 'utf-8',
                    'roleId': '1',
                    'roleName': 'IT Portfolio Manager',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
                },
                httpsAgent: httpsAgent,
                timeout: 30000
            });

            return response.data;
        } catch (error: any) {
            console.error('API call failed:', error);

            // Provide more detailed error information
            let errorMessage = 'Failed to fetch pipeline data';

            if (error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY') {
                errorMessage = 'SSL Certificate error - unable to verify server certificate';
            } else if (error.code === 'ENOTFOUND') {
                errorMessage = 'Network error - unable to reach the server';
            } else if (error.response) {
                errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
            } else if (error.request) {
                errorMessage = 'Network timeout or connection refused';
            } else {
                errorMessage = `Request setup error: ${error.message}`;
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

                    // Create and show script viewer
                    await this.createScriptViewer(card, scripts);

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
                        await this.createScriptViewer(card, scripts);
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

                await this.createScriptViewer(card, mockScripts);
            }
        });
    }

    private async fetchPipelineScripts(pipelineName: string): Promise<PipelineScript> {
        console.log(`Fetching scripts for pipeline: ${pipelineName}`);

        try {
            // Create HTTPS agent to bypass SSL certificate issues
            const httpsAgent = new https.Agent({
                rejectUnauthorized: false
            });

            const headers = {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Authorization': `Bearer ${this._token}`,
                'Connection': 'keep-alive',
                'Content-Type': 'application/json',
                'Project': '2',
                'ProjectName': this.organization,
                'Referer': 'http://localhost:8087/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
                'X-Requested-With': 'Leap',
                'charset': 'utf-8',
                'roleId': '1',
                'roleName': 'IT Portfolio Manager',
                'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            };

            let files: ScriptFile[] = [];
            let streamingService: any = null;
            let pipelineData: any = null;

            // Step 1: Get streaming service by name (following Angular getStreamingServicesByName pattern)
            try {
                console.log('Fetching streaming service details...');
                const streamingServiceResponse = await axios.get(`/api/aip/service/v1/streamingServices/${pipelineName}/${this.organization}`, {
                    baseURL: 'http://localhost:8087',
                    headers: headers,
                    httpsAgent: httpsAgent,
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

                    const pipelineResponse = await axios.get('/api/aip/service/v1/pipelines/byname', {
                        baseURL: 'http://localhost:8087',
                        headers: headers,
                        params: urlParams,
                        httpsAgent: httpsAgent,
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
                        const response = await axios.get(`/api/aip/file/read/${pipelineName}/${this.organization}`, {
                            baseURL: 'http://localhost:8087',
                            headers: headers,
                            params: {
                                file: fileName
                            },
                            responseType: 'arraybuffer', // Match Angular responseType
                            httpsAgent: httpsAgent,
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
                        const response = await axios.get(`/api/aip/file/read/${pipelineName}/${this.organization}`, {
                            baseURL: 'http://localhost:8087',
                            headers: headers,
                            params: {
                                file: fileName
                            },
                            responseType: 'arraybuffer', // Match Angular responseType
                            httpsAgent: httpsAgent,
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
                runTypesResponse = await axios.get(`/api/aip/service/v1/jobs/runtime/types/${this.organization}`, {
                    baseURL: 'http://localhost:8087',
                    headers: headers,
                    httpsAgent: httpsAgent,
                    timeout: 30000
                });
                console.log('Run types response:', runTypesResponse.data);
            } catch (runTypesError: any) {
                console.log('Job run types endpoint failed, trying alternative...');

                try {
                    // Try alternative endpoint
                    runTypesResponse = await axios.get('/api/aip/service/v1/datasources/runtime', {
                        baseURL: 'http://localhost:8087',
                        headers: headers,
                        httpsAgent: httpsAgent,
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
                errorMessage = 'Network error - unable to reach the server at localhost:8087';
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
    1. Ensure the backend server is running on localhost:8087
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

        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to open script: ${error.message}`);
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
                        <span class="info-value">${card.created_by}</span>
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

    private async runPipelineScript(cardId: string, runType: string): Promise<void> {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) {
            vscode.window.showErrorMessage('Pipeline not found');
            return;
        }

        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Running pipeline ${card.alias}...`,
                cancellable: false
            }, async (progress) => {
                const httpsAgent = new https.Agent({
                    rejectUnauthorized: false
                });

                const headers = {
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Authorization': `Bearer ${this._token}`,
                    'Connection': 'keep-alive',
                    'Content-Type': 'application/json',
                    'Project': '2',
                    'ProjectName': this.organization,
                    'X-Requested-With': 'Leap',
                    'charset': 'utf-8',
                    'roleId': '1',
                    'roleName': 'IT Portfolio Manager',
                    'Referer': 'http://localhost:8087/',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin'
                };

                progress.report({ increment: 3, message: 'Starting pipeline execution...' });

                // Parse runType to extract type and dsName (format: "type-dsAlias")
                const runTypeParts = runType.split('-');
                const runtimeType = runTypeParts[0] || 'Local';
                const dsName = runTypeParts[1] || '';

                // Use the correct API endpoint format based on Angular code
                const response = await axios.post('/api/aip/service/v1/jobs/run-pipeline', {
                    alias: card.alias || card.name,
                    name: card.alias || card.name,
                    type: 'DragAndDrop', // or 'Script' based on your pipeline type
                    runtimeType: runtimeType,
                    dsName: dsName,
                    scriptType: 'generated'
                }, {
                    baseURL: 'http://localhost:8087',
                    headers: headers,
                    httpsAgent: httpsAgent,
                    timeout: 60000
                });

                progress.report({ increment: 100, message: 'Pipeline started!' });

                const jobId = response.data.jobId || response.data.id;
                if (jobId) {
                    // Create job status object
                    const jobStatus: JobStatus = {
                        jobId: jobId,
                        correlationId: response.data.correlationId,
                        streamingService: card.alias || card.name,
                        jobStatus: 'RUNNING',
                        type: runtimeType,
                        runtime: dsName,
                        submittedBy: 'Current User',
                        submittedOn: new Date().toISOString(),
                        pipelineName: card.alias || card.name,
                        organization: this.organization,
                        logs: ''
                    };

                    // Show job status viewer
                    await this.showJobStatusViewer(jobStatus, card);
                    
                    vscode.window.showInformationMessage(
                        `Pipeline started successfully! Job ID: ${jobId}`,
                        'View Status'
                    ).then(selection => {
                        if (selection === 'View Status') {
                            this.showJobStatusViewer(jobStatus, card);
                        }
                    });
                } else {
                    vscode.window.showInformationMessage('Pipeline started successfully!');
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
            }

            vscode.window.showErrorMessage(`${errorMessage}: ${error.message}`);
        }
    }

    private async copyScriptToClipboard(cardId: string, fileName: string): Promise<void> {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) return;

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
        if (!card) return;

        try {
            await this.viewScriptDetails(cardId);
            vscode.window.showInformationMessage('Scripts refreshed successfully!');
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to refresh scripts: ${error.message}`);
        }
    }

    private async viewPipelineLogs(cardId: string): Promise<void> {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) return;

        // Open logs in a new webview or redirect to logs view
        vscode.window.showInformationMessage(`Opening logs for pipeline: ${card.alias}`);
        // You can implement log viewer here
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
     * Handle logout functionality
     */
    private async handleLogout(): Promise<void> {
        try {
            // Clear the token
            this._token = '';
            
            // Clear any stored authentication data
            await this._context.globalState.update('keycloak_tokens', undefined);
            
            // Show logout message
            vscode.window.showInformationMessage('Logged out successfully. You will need to authenticate again to access pipelines.');
            
            // You could also trigger a command to restart the extension or switch to login view
            // For now, just clear the current view
            if (this._view) {
                this._view.webview.html = this.getLogoutHtml();
            }
            
        } catch (error: any) {
            console.error('Error during logout:', error);
            vscode.window.showErrorMessage(`Logout failed: ${error.message}`);
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
                baseURL: 'http://localhost:8087',
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
                        baseURL: 'http://localhost:8087',
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
                    baseURL: 'http://localhost:8087',
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
                            baseURL: 'http://localhost:8087',
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
                    baseURL: 'http://localhost:8087',
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
                    baseURL: 'http://localhost:8087',
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
}
