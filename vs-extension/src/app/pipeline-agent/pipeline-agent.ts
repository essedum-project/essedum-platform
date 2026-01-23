/**
 * Pipeline Agent Provider for Essedum AI Platform
 * 
 * This provider manages the Pipeline Agent view independently from the Pipeline flow.
 * It uses dedicated APIs for Pipeline Agent data:
 * - GET /api/aip/service/v1/pipelines/count (interfacetype=pipeline-agent)
 * - GET /api/aip/service/v1/pipelines/training/list (interfacetype=pipeline-agent)
 * 
 * @fileoverview Pipeline Agent webview provider
 * @author Essedum AI Platform Team
 * @version 1.0.21
 */

import { PipelineAgentService } from '../../services/pipeline-agent.service';
import { HttpParams } from '../../interfaces/pipeline.interfaces';
import * as CONSTANTS from '../../constants/pipeline-agent-provider-constants';
import { STORAGE_KEYS } from '../../constants/extension-constants';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import archiver from 'archiver';
import { PipelineAgentCard } from '../../interfaces/pipeline-agent.interface';
import * as ExtensionUtils from '../../utils/extension-utils';

const logger = ExtensionUtils.createLogger('PipelineAgent');


/**
 * Pipeline Agent Provider - Independent implementation for Pipeline Agent management
 */
export class PipelineAgentProvider implements vscode.WebviewViewProvider {
    /** VS Code webview instance */
    private _view?: vscode.WebviewView;

    /** Extension context for accessing resources */
    private _context: vscode.ExtensionContext;

    /** Extension URI for resource loading */
    private _extensionUri: vscode.Uri;

    /** Authentication token */
    private _token: string = '';

    /** Authentication state */
    private _isAuthenticated: boolean = false;

    /** Authentication service reference */
    private _authService?: any;

    /** Pipeline Agent service instance */
    private _pipelineAgentService: PipelineAgentService;

    /** Pagination and filtering configuration */
    private pageNumber: number = CONSTANTS.PAGINATION.INITIAL_PAGE;
    private pageSize: number = CONSTANTS.PAGINATION.PAGE_SIZE; // As per API requirement
    private totalCount: number = 0;
    private totalPages: number = 0;
    private allCards: PipelineAgentCard[] = [];
    private filteredCards: PipelineAgentCard[] = [];
    private organization: string;
    private project: any;
    private role: any;
    private filter: string = '';
    private loading: boolean = false;

    /** Cache directory for JSON files and generated ADK */
    private cacheDir: string;

    /** Track opened cached JSON files for cleanup - maps normalized path to original path */
    private openedCachedFiles: Map<string, string> = new Map();
    
    /** Track open ADK documents for cleanup */
    private openDocuments: Map<string, vscode.TextDocument> = new Map();
    
    /** ADK files cache */
    private adkFilesCache: Map<string, any[]> = new Map();
    
    /** Current ADK folder watcher */
    private adkFolderWatcher?: vscode.FileSystemWatcher;
    
    /** Current ADK folder path */
    private currentAdkFolderPath?: string;

    /** Component logger prefix */
    private readonly logPrefix = CONSTANTS.LOG_PREFIX;

    /**
     * Creates a new Pipeline Agent Provider instance
     * @param _context - VS Code extension context
     * @param token - Authentication token
     * @param authService - Authentication service instance
     * @param pipelineAgentService - Pipeline Agent service instance
     */
    constructor(
        _context: vscode.ExtensionContext,
        token: string,
        authService?: any,
        pipelineAgentService?: PipelineAgentService
    ) {
        this._context = _context;
        this._extensionUri = _context.extensionUri;
        this.updateToken(token);
        this.project = _context.globalState.get(CONSTANTS.STATE_KEYS.PROJECT);
        this.organization = this.project?.name;
        this.role = _context.globalState.get(CONSTANTS.STATE_KEYS.ROLE);
        this._authService = authService;
        this._pipelineAgentService = pipelineAgentService || new PipelineAgentService(_context);

        // Initialize cache directory
        this.cacheDir = path.join(os.tmpdir(), CONSTANTS.CACHE_CONFIG.ROOT_DIR_NAME);
        this.ensureCacheDirectory();

        logger.info(`${this.logPrefix} Pipeline Agent Provider initialized independently`);
        logger.info(`${this.logPrefix} Organization: ${this.organization}, Page size: ${this.pageSize}`);
        logger.info(`${this.logPrefix} Cache directory: ${this.cacheDir}`);
    }

    /**
     * Refresh authentication data (project, role, organization) from VS Code storage
     * Call this before operations that use organization to ensure up-to-date values
     */
    private refreshAuthData(): void {
        this.project = this._context.globalState.get(CONSTANTS.STATE_KEYS.PROJECT);
        this.role = this._context.globalState.get(CONSTANTS.STATE_KEYS.ROLE);
        
        // Get organization from multiple sources with fallbacks
        const storedOrg = this._context.globalState.get<string>(STORAGE_KEYS.ORGANIZATION);
        const projectName = this.project?.name || this.project?.projectname;
        this.organization = storedOrg || projectName || this.organization || '';
        
        logger.info(`${this.logPrefix} Auth data refreshed:`);
        logger.info(`  - Project: ${this.project?.name || 'undefined'}`);
        logger.info(`  - Organization: ${this.organization || 'undefined'}`);
        logger.info(`  - Role: ${this.role?.name || 'undefined'}`);
    }

    /**
     * Updates the authentication token
     */
    public updateToken(token: string): void {
        this._token = token;
        this._isAuthenticated = !!token && token.trim().length > 0;
        logger.info(`${this.logPrefix} Token updated, authenticated:`, this._isAuthenticated);

        // Update the authentication context
        vscode.commands.executeCommand('setContext', CONSTANTS.CONTEXT_KEYS.IS_AUTHENTICATED, this._isAuthenticated);

        // Refresh auth data in pipeline agent service from VS Code storage
        if (this._pipelineAgentService) {
            this._pipelineAgentService.refreshAuthData();
        }
        
        // Also refresh local auth data
        this.refreshAuthData();
    }

    /**
     * Handle external token update
     */
    public async onTokenUpdated(token: string): Promise<void> {
        logger.info(`${this.logPrefix} External token update received`);
        this.updateToken(token);

        if (this._isAuthenticated && this._view) {
            logger.info(`${this.logPrefix} Token update successful, switching to main view`);
            await this.returnToMainView();
        }
    }

    /**
     * Implements WebviewViewProvider interface
     */
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void | Thenable<void> {
        logger.info(`${this.logPrefix} Resolving webview view`);

        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getAgentHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case CONSTANTS.WEBVIEW_COMMANDS.LOAD_CARDS:
                        await this.getAgentCards();
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.FILTER:
                        this.filter = message.filter;
                        await this.getAgentCards();
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.REFRESH:
                        await this.getAgentCards();
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.GO_TO_PAGE:
                        this.goToPage(message.page);
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.NEXT_PAGE:
                        this.nextPage();
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.PREVIOUS_PAGE:
                        this.previousPage();
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.FIRST_PAGE:
                        this.goToFirstPage();
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.LAST_PAGE:
                        this.goToLastPage();
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.VIEW_DETAILS:
                        await this.viewAgentDetails(message.pipelineId);
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.OPEN_COPILOT:
                        await this.handleOpenCopilot(message.pipelineId);
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.UPLOAD_ADK:
                        await this.handleUploadAdk(message.pipelineId);
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.VIEW_ADK:
                        await this.handleViewAdk(message.pipelineId);
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.DOWNLOAD_ADK:
                        await this.handleDownloadAdk(message.pipelineId);
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.REFRESH_JSON:
                        await this.handleRefreshJson(message.pipelineId);
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.COPY_JSON:
                        await this.handleCopyJson(message.pipelineId);
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.LOGOUT:
                        await this.handleLogout();
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.TRIGGER_LOGIN:
                        await this.handleLogin();
                        break;
                }
            },
            undefined,
            this._context.subscriptions
        );

        // Clean up cached JSON files when tabs are closed
        this._context.subscriptions.push(
            vscode.window.tabGroups.onDidChangeTabs((event) => {
                // Check for closed tabs
                event.closed.forEach(tab => {
                    if (tab.input instanceof vscode.TabInputText) {
                        const closedPath = tab.input.uri.fsPath.toLowerCase();
                        logger.info(`${this.logPrefix} Tab closed: ${closedPath}`);
                        
                        // Check if this is one of our tracked cached files (normalized)
                        if (this.openedCachedFiles.has(closedPath)) {
                            logger.info(`${this.logPrefix} Found tracked cached file, attempting deletion...`);
                            // Use original path for deletion
                            this.deleteCachedFile(tab.input.uri.fsPath);
                        } else {
                            logger.info(`${this.logPrefix} Not in tracked files. Tracked: [${Array.from(this.openedCachedFiles).join(', ')}]`);
                        }
                    }
                });
            })
        );

        // Also clean up when document is closed (backup mechanism)
        this._context.subscriptions.push(
            vscode.workspace.onDidCloseTextDocument((document) => {
                const filePath = document.uri.fsPath.toLowerCase();
                logger.info(`${this.logPrefix} Document closed: ${filePath}`);
                
                // Check if this is one of our tracked cached files (normalized)
                if (this.openedCachedFiles.has(filePath)) {
                    logger.info(`${this.logPrefix} Found tracked cached file in document close, attempting deletion...`);
                    // Use original path for deletion
                    this.deleteCachedFile(document.uri.fsPath);
                }
            })
        );

        // Auto-save JSON files to server when edited
        this._context.subscriptions.push(
            vscode.workspace.onDidSaveTextDocument(async (document) => {
                const documentPath = document.uri.fsPath.toLowerCase();
                
                // Check if this is one of our cached JSON files
                const matchedEntry = Array.from(this.openedCachedFiles.entries())
                    .find(([normalized, original]) => normalized === documentPath);
                
                if (matchedEntry) {
                    const [normalizedPath, originalPath] = matchedEntry;
                    logger.info(`${this.logPrefix} JSON file saved, uploading to server: ${originalPath}`);
                    await this.uploadJsonToServer(document, originalPath);
                }
            })
        );
        
        logger.info(`${this.logPrefix} Registered cleanup handlers for cached JSON files`);
        logger.info(`${this.logPrefix} Watching cache directory: ${this.cacheDir}`);
    }

    /**
     * Load initial content based on authentication state
     */
    public async loadInitialContent(): Promise<void> {
        logger.info(`${this.logPrefix} Loading initial content, current auth state: ${this._isAuthenticated}`);

        if (!this._isAuthenticated) {
            logger.info('Not authenticated, checking context for token...');
            const contextToken = this._context.globalState.get(CONSTANTS.STATE_KEYS.ACCESS_TOKEN) as string;
            if (contextToken && contextToken.trim().length > 0) {
                logger.info('Found valid token in context, updating component state');
                this.updateToken(contextToken);
            }
        }

        if (this._isAuthenticated) {
            logger.info('Authenticated, loading Pipeline Agent interface');
            if (this._view) {
                this._view.webview.html = this._getAgentHtmlForWebview(this._view.webview);
                setTimeout(() => this.getAgentCards(), 100);
            }
        } else {
            logger.info('Not authenticated, showing authentication required page');
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
     * Return to main view after authentication
     */
    private async returnToMainView(): Promise<void> {
        if (this._view) {
            this._view.webview.html = this._getAgentHtmlForWebview(this._view.webview);
            await this.getAgentCards();
        }
    }

    /**
     * Handle logout
     */
    private async handleLogout(): Promise<void> {
        try {
            await vscode.commands.executeCommand('essedum.logout');
            this._isAuthenticated = false;
            this.showAuthenticationRequired();
        } catch (error: any) {
            console.error('Logout failed:', error);
            vscode.window.showErrorMessage(`Logout failed: ${error.message}`);
        }
    }

    /**
     * Handle login
     */
    private async handleLogin(): Promise<void> {
        try {
            logger.info('triggerLogin command received, forcing fresh authentication...');

            if (this._view) {
                this._view.webview.postMessage({
                    command: CONSTANTS.CLIENT_COMMANDS.AUTHENTICATION_PROGRESS,
                    message: '🔄 Starting authentication...'
                });
            }

            let authSuccessful = false;

            if (this._authService) {
                logger.info('Using auth service for authentication');
                const tokens = await this._authService.forceAuthentication();
                logger.info('Authentication successful, updating token');
                this.updateToken(tokens.access_token);
                authSuccessful = true;
            } else {
                logger.info('No auth service available, using command execution');
                await vscode.commands.executeCommand('essedum.login');

                await new Promise(resolve => setTimeout(resolve, 2000));

                const updatedToken = this._context.globalState.get('accessToken') as string;
                if (updatedToken && updatedToken.trim().length > 0) {
                    logger.info('Found updated token in context, updating component token');
                    this.updateToken(updatedToken);
                    authSuccessful = true;
                } else {
                    logger.info('No token found after authentication');
                    throw new Error('Authentication completed but no valid token was found');
                }
            }

            if (authSuccessful && this._isAuthenticated) {
                if (this._view) {
                    this._view.webview.postMessage({
                        command: CONSTANTS.CLIENT_COMMANDS.AUTHENTICATION_SUCCESS,
                        message: 'Authentication successful!'
                    });
                }

                await this.returnToMainView();
                vscode.window.showInformationMessage('Successfully authenticated! Pipeline Agent view loaded.');
            } else {
                throw new Error('Authentication did not complete successfully');
            }

        } catch (error: any) {
            console.error('Error executing authentication:', error);

            if (this._view) {
                this._view.webview.postMessage({
                    command: CONSTANTS.CLIENT_COMMANDS.AUTHENTICATION_ERROR,
                    message: error.message || 'Authentication failed'
                });
            }

            vscode.window.showErrorMessage(
                `Authentication failed: ${error.message || 'Unknown error'}`
            );
        }
    }

    /**
     * Get Pipeline Agent cards using dedicated APIs
     */
    private async getAgentCards(): Promise<void> {
        logger.info(`${this.logPrefix} getAgentCards called, token length: ${this._token ? this._token.length : 0}`);

        // Refresh auth data to ensure organization is current
        this.refreshAuthData();

        // Check authentication
        if (!this._isAuthenticated) {
            logger.info('Not authenticated, checking for token in context...');

            const contextToken = this._context.globalState.get(CONSTANTS.STATE_KEYS.ACCESS_TOKEN) as string;
            if (contextToken && contextToken.trim().length > 0) {
                logger.info('Found valid token in context, updating component state');
                this.updateToken(contextToken);
            } else {
                logger.info('No valid token found, showing authentication required page');
                this.showAuthenticationRequired();
                return;
            }
        }

        if (!this._isAuthenticated) {
            logger.info('Still not authenticated, showing auth page');
            this.showAuthenticationRequired();
            return;
        }

        this.loading = true;
        this.updateWebview();

        const params = this.buildHttpParams();

        try {
            // Step 1: Get total count using Pipeline Agent count API
            logger.info(`${this.logPrefix} Fetching Pipeline Agent count...`);
            this.totalCount = await this._pipelineAgentService.getPipelineAgentCount(params);
            this.totalPages = Math.ceil(this.totalCount / this.pageSize);

            logger.info(`${this.logPrefix} Total count: ${this.totalCount}, Total pages: ${this.totalPages}`);

            // Step 2: Get cards using Pipeline Agent list API
            logger.info(`${this.logPrefix} Fetching Pipeline Agent cards for page ${this.pageNumber}...`);
            const response = await this._pipelineAgentService.getPipelineAgentCards(params);

            if (response && Array.isArray(response) && response.length > 0) {
                this.allCards = response.map((element: any) => ({
                    pipelineId: element.name || element.id || element._id || Math.random().toString(36),
                    type: element.type || 'Unknown',
                    alias: element.alias || element.name || 'No Alias',
                    createdDate: element.createdDate || element.created_date || new Date().toISOString(),
                    created_by: element.created_by || element.createdBy || 'Unknown',
                    id: element.id || element._id,
                    status: 'active',
                    description: element.description || '',
                    interfacetype: element.interfacetype || 'pipeline-agent',
                    ...element
                }));

                // Use all cards returned from API (already paginated by server)
                this.filteredCards = this.allCards;
            } else {
                logger.info(`${this.logPrefix} No cards returned from API`);
                this.allCards = [];
                this.filteredCards = [];
            }

            logger.info(`${this.logPrefix} Page ${this.pageNumber}: Showing ${this.filteredCards.length} of ${this.totalCount} total cards`);

            this.loading = false;
            this.updateWebview();

        } catch (error: any) {
            console.error(`${this.logPrefix} Error fetching Pipeline Agent cards:`, error);
            this.loading = false;

            // Handle authentication errors
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                console.error(`${this.logPrefix} Authentication error (${error.response.status})`);
                this._isAuthenticated = false;

                const action = error.response.status === 401 ? 'Login' : 'Login Again';
                vscode.window.showErrorMessage(
                    `Authentication ${error.response.status === 401 ? 'required' : 'failed'}. Please authenticate.`,
                    action
                ).then(selection => {
                    if (selection === action) {
                        vscode.commands.executeCommand('essedum.login');
                    }
                });

                this.showAuthenticationRequired();
                return;
            }

            // Handle other errors
            let errorMessage = 'Failed to fetch Pipeline Agent data';
            if (error.message) {
                errorMessage = error.message;
            }

            vscode.window.showErrorMessage(`${this.logPrefix} Error: ${errorMessage}`);

            // Show error state in webview
            this.filteredCards = [];
            this.updateWebview();
        }
    }

    /**
     * Build HTTP parameters for Pipeline Agent API calls
     */
    private buildHttpParams(): HttpParams {
        const params: HttpParams = {
            page: this.pageNumber.toString(),
            size: this.pageSize.toString(),
            project: this.organization,
            isCached: CONSTANTS.HTTP_PARAMS.IS_CACHED,
            adapter_instance: CONSTANTS.HTTP_PARAMS.ADAPTER_INSTANCE,
            interfacetype: CONSTANTS.HTTP_PARAMS.INTERFACE_TYPE, // CRITICAL: This is what distinguishes Pipeline Agent from Pipeline
            cloud_provider: CONSTANTS.HTTP_PARAMS.CLOUD_PROVIDER
        };

        logger.info(`${this.logPrefix} Building HTTP params:`, params);

        if (this.filter.length >= CONSTANTS.FILTER_CONFIG.MIN_LENGTH) {
            params.query = this.filter;
        }

        return params;
    }

    /**
     * Update webview with current state
     */
    private updateWebview(): void {
        if (this._view) {
            const actualTotalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));

            logger.info(`${this.logPrefix} Updating webview:`, {
                cards: this.filteredCards.length,
                currentPage: this.pageNumber,
                totalPages: actualTotalPages,
                totalCount: this.totalCount,
                pageSize: this.pageSize
            });

            this._view.webview.postMessage({
                command: CONSTANTS.CLIENT_COMMANDS.UPDATE_CARDS,
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

    // Pagination methods
    public goToPage(page: number): void {
        if (page < 1 || page > this.totalPages) {
            return;
        }
        this.pageNumber = page;
        this.getAgentCards();
    }

    public nextPage(): void {
        if (this.pageNumber < this.totalPages) {
            this.pageNumber++;
            this.getAgentCards();
        }
    }

    public previousPage(): void {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            this.getAgentCards();
        }
    }

    public goToFirstPage(): void {
        this.pageNumber = 1;
        this.getAgentCards();
    }

    public goToLastPage(): void {
        this.pageNumber = this.totalPages;
        this.getAgentCards();
    }

    /**
     * View Pipeline Agent details - reads and displays JSON configuration file
     * Directly reads the JSON file using file read API
     */
    private async viewAgentDetails(pipelineId: string): Promise<void> {
        // Refresh auth data to ensure organization is current
        this.refreshAuthData();
        
        const card = this.allCards.find(c => c.pipelineId === pipelineId);
        if (!card) {
            vscode.window.showErrorMessage('Pipeline Agent not found');
            return;
        }

        // Get the pipeline name from card
        const pipelineName = card.name || card.alias || pipelineId;

        // Show loading message with progress
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Loading Pipeline Agent: ${card.alias || pipelineName}...`,
            cancellable: false
        }, async (progress) => {
            let formattedContent = '';
            let jsonLoadError: string | null = null;

            try {
                progress.report({ increment: 0, message: 'Reading configuration file...' });

                // Determine the JSON filename: {pipelineName}_{organization}.json
                const jsonFileName = `${pipelineName}_${this.organization}.json`;

                // Call file read API to get the JSON file
                const fileResponse = await this._pipelineAgentService.readPipelineFile(pipelineName, jsonFileName);

                if (!fileResponse.data) {
                    throw new Error('No data received from file read API');
                }

                progress.report({ increment: 50, message: 'Parsing JSON content...' });

                // Convert ArrayBuffer to text using TextDecoder
                const textDecoder = new TextDecoder('utf-8');
                const fileContent = textDecoder.decode(fileResponse.data);

                // Try to parse and format the JSON
                formattedContent = fileContent;
                try {
                    const jsonData = JSON.parse(fileContent);
                    formattedContent = JSON.stringify(jsonData, null, 2);
                } catch (parseError) {
                    console.warn(`${this.logPrefix} Could not parse JSON, displaying raw content:`, parseError);
                }

                progress.report({ increment: 80, message: 'Opening in editor...' });

                // Save JSON file in cache directory
                this.ensureCacheDirectory();
                const cachedJsonPath = path.join(this.cacheDir, jsonFileName);
                fs.writeFileSync(cachedJsonPath, formattedContent, 'utf-8');

                // Track this file for cleanup (map normalized to original path)
                const normalizedPath = cachedJsonPath.toLowerCase();
                this.openedCachedFiles.set(normalizedPath, cachedJsonPath);
                logger.info(`${this.logPrefix} Tracking cached file for cleanup: ${normalizedPath} -> ${cachedJsonPath}`);

                // Open the cached JSON file from disk
                const doc = await vscode.workspace.openTextDocument(cachedJsonPath);

                // Open in editor (Column One)
                await vscode.window.showTextDocument(doc, {
                    viewColumn: vscode.ViewColumn.One,
                    preview: false
                });

            } catch (error: any) {
                console.error(`${this.logPrefix} Error loading Pipeline Agent JSON:`, error);

                // Handle specific error cases first
                const errorStatus = error.status || 500;

                if (errorStatus === 404) {
                    jsonLoadError = `Configuration file not found for pipeline: ${card.alias || pipelineName}`;
                } else if (errorStatus === 401 || errorStatus === 403) {
                    jsonLoadError = 'Authentication required. Please log in again.';
                    
                    // Show login prompt but still show detail view
                    vscode.window.showErrorMessage(jsonLoadError, 'Login').then(selection => {
                        if (selection === 'Login') {
                            vscode.commands.executeCommand('essedum.login');
                        }
                    });
                } else {
                    jsonLoadError = error.message || 'Failed to load configuration file';
                }

                // Create error JSON content
                const safeErrorMessage = (jsonLoadError || 'Unknown error').replace(/"/g, '\\"').replace(/\n/g, '\\n');
                formattedContent = `{\n  "error": "Failed to load configuration",\n  "message": "${safeErrorMessage}"\n}`;

                // Show warning notification
                vscode.window.showWarningMessage(`${this.logPrefix} ${jsonLoadError}. Showing detail view with available information.`);
            }

            progress.report({ increment: 90, message: 'Opening detail view...' });

            // ALWAYS send message to webview to show detail view, even if JSON load failed
            if (this._view) {
                this._view.webview.postMessage({
                    command: CONSTANTS.CLIENT_COMMANDS.SHOW_DETAILS,
                    data: {
                        pipelineId: pipelineName,
                        name: card.alias || pipelineName,
                        description: card.description || '',
                        alias: card.alias,
                        type: card.type || card.interfacetype || 'N/A',
                        organization: this.organization,
                        status: card.status || 'active',
                        jsonContent: formattedContent,
                        hasError: !!jsonLoadError,
                        errorMessage: jsonLoadError || undefined
                    }
                });
            }

            progress.report({ increment: 95, message: 'Checking ADK files...' });

            // Check if ADK files exist to show/hide View ADK button
            try {
                const adkFiles = await this._pipelineAgentService.listAdkFiles(pipelineName);
                const hasFiles = adkFiles && adkFiles.length > 0;
                
                // Send message to main webview to show/hide View ADK button
                if (this._view) {
                    this._view.webview.postMessage({
                        command: CONSTANTS.CLIENT_COMMANDS.ADK_FILES_STATUS,
                        hasFiles: hasFiles,
                        fileCount: adkFiles.length
                    });
                }
            } catch (error) {
                // Silently fail - just means View ADK button won't show
                if (this._view) {
                    this._view.webview.postMessage({
                        command: CONSTANTS.CLIENT_COMMANDS.ADK_FILES_STATUS,
                        hasFiles: false,
                        fileCount: 0
                    });
                }
            }

            progress.report({ increment: 100, message: 'Complete!' });
        });
    }

    // ================================
    // INLINE ACTION HANDLERS
    // ================================

    /**
     * Handle Open Copilot action
     */
    private async handleOpenCopilot(pipelineId: string): Promise<void> {
        try {
            // Refresh auth data to ensure organization is current
            this.refreshAuthData();
            
            const card = this.allCards.find(c => c.pipelineId === pipelineId);
            if (!card) {
                this.sendMessageToWebview({ command: 'actionError', message: 'Pipeline agent not found' });
                return;
            }

            const pipelineName = card.name || card.alias || pipelineId;
            const jsonFileName = `${pipelineName}_${this.organization}.json`;
            const jsonFilePath = path.join(this.cacheDir, jsonFileName);

            // If JSON doesn't exist in cache, fetch it
            if (!fs.existsSync(jsonFilePath)) {
                const fileResponse = await this._pipelineAgentService.readPipelineFile(pipelineName, jsonFileName);
                if (!fileResponse.data) {
                    throw new Error('Could not fetch configuration file');
                }
                const textDecoder = new TextDecoder('utf-8');
                const fileContent = textDecoder.decode(fileResponse.data);
                fs.writeFileSync(jsonFilePath, fileContent, 'utf-8');
            }

            // Read prompt file
            const promptFilePath = path.join(this._context.extensionPath, CONSTANTS.PROMPT_CONFIG.FOLDER, CONSTANTS.PROMPT_CONFIG.FILENAME);
            if (!fs.existsSync(promptFilePath)) {
                throw new Error('Prompt file not found');
            }

            const promptContent = fs.readFileSync(promptFilePath, 'utf-8');
            if (!promptContent || promptContent.trim().length === 0) {
                throw new Error('Prompt file is empty');
            }

            // Track this file for cleanup
            const normalizedJsonPath = jsonFilePath.toLowerCase();
            this.openedCachedFiles.set(normalizedJsonPath, jsonFilePath);

            // Open the JSON file
            const jsonDoc = await vscode.workspace.openTextDocument(jsonFilePath);
            await vscode.window.showTextDocument(jsonDoc, {
                viewColumn: vscode.ViewColumn.One,
                preview: false,
                preserveFocus: false
            });

            // Wait for editor to be active
            await new Promise(resolve => setTimeout(resolve, 300));

            // Open Copilot Chat panel
            await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
            await new Promise(resolve => setTimeout(resolve, 500));

            // Copy prompt to clipboard
            await vscode.env.clipboard.writeText(promptContent);

            vscode.window.showInformationMessage(
                `Copilot Chat opened! Paste the prompt (Ctrl+V) to generate ADK code in ${this.cacheDir}`,
                'Got it'
            );

            this.sendMessageToWebview({ command: 'actionComplete', message: '✓ Copilot opened successfully' });
            this.sendMessageToWebview({ command: 'enableUpload' });

        } catch (error: any) {
            console.error(`${this.logPrefix} Error opening Copilot:`, error);
            this.sendMessageToWebview({ command: 'actionError', message: `Failed to open Copilot: ${error.message}` });
        }
    }

    /**
     * Handle Upload ADK action
     */
    private async handleUploadAdk(pipelineId: string): Promise<void> {
        try {
            // Refresh auth data to ensure organization is current
            this.refreshAuthData();
            
            const card = this.allCards.find(c => c.pipelineId === pipelineId);
            if (!card) {
                this.sendMessageToWebview({ command: 'actionError', message: 'Pipeline agent not found' });
                return;
            }

            const pipelineName = card.name || card.alias || pipelineId;

            // Verify cache directory exists
            if (!fs.existsSync(this.cacheDir)) {
                throw new Error('Cache directory not found. Please open Copilot first.');
            }

            // Get all files in cache directory (excluding the JSON config file)
            const jsonFileName = `${pipelineName}_${this.organization}.json`;
            const allFiles = fs.readdirSync(this.cacheDir);
            const adkFiles = allFiles.filter(f => f !== jsonFileName && !f.endsWith('.zip'));

            if (adkFiles.length === 0) {
                throw new Error('No ADK files found. Please generate code using Copilot first.');
            }

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Uploading ADK...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: `Creating ZIP archive...` });

                // Create ZIP file
                const zipPath = await this.createZipFromCache(pipelineName, adkFiles);

                progress.report({ increment: 50, message: 'Uploading to server...' });

                // Upload ZIP
                const zipBuffer = fs.readFileSync(zipPath);
                const sizeMB = (zipBuffer.length / (1024 * 1024)).toFixed(2);
                await this._pipelineAgentService.uploadFolderZip(pipelineName, zipBuffer, path.basename(zipPath));

                progress.report({ increment: 90, message: 'Cleaning up...' });

                // Clean up ADK files (keep JSON) - handle both files and directories
                adkFiles.forEach(fileName => {
                    const filePath = path.join(this.cacheDir, fileName);
                    if (fs.existsSync(filePath)) {
                        try {
                            const stats = fs.statSync(filePath);
                            if (stats.isDirectory()) {
                                fs.rmSync(filePath, { recursive: true, force: true });
                            } else {
                                fs.unlinkSync(filePath);
                            }
                        } catch (error: any) {
                            console.error(`${this.logPrefix} Failed to delete ${fileName}:`, error);
                        }
                    }
                });

                // Delete ZIP file
                if (fs.existsSync(zipPath)) {
                    fs.unlinkSync(zipPath);
                }

                progress.report({ increment: 100, message: 'Complete!' });

                vscode.window.showInformationMessage(`✓ ADK uploaded successfully (${sizeMB} MB)`);
                this.sendMessageToWebview({ command: 'actionComplete', message: `✓ ADK uploaded (${sizeMB} MB)` });
                
                // Refresh ADK files status to show View/Download buttons
                try {
                    const adkFiles = await this._pipelineAgentService.listAdkFiles(pipelineName);
                    const hasFiles = adkFiles && adkFiles.length > 0;
                    
                    if (this._view) {
                        this._view.webview.postMessage({
                            command: CONSTANTS.CLIENT_COMMANDS.ADK_FILES_STATUS,
                            hasFiles: hasFiles,
                            fileCount: adkFiles.length
                        });
                    }
                } catch (statusError) {
                    console.warn(`${this.logPrefix} Could not check ADK files status after upload:`, statusError);
                }
            });

        } catch (error: any) {
            console.error(`${this.logPrefix} Error uploading ADK:`, error);
            this.sendMessageToWebview({ command: 'actionError', message: `Upload failed: ${error.message}` });
        }
    }

    /**
     * Handle View ADK action
     */
    private async handleViewAdk(pipelineId: string): Promise<void> {
        try {
            // Refresh auth data to ensure organization is current
            this.refreshAuthData();
            
            const card = this.allCards.find(c => c.pipelineId === pipelineId);
            if (!card) {
                this.sendMessageToWebview({ command: 'actionError', message: 'Pipeline agent not found' });
                return;
            }

            const pipelineName = card.name || card.alias || pipelineId;

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Loading ADK files...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: 'Fetching files from server...' });

                const adkFiles = await this._pipelineAgentService.listAdkFiles(pipelineName);

                if (!adkFiles || adkFiles.length === 0) {
                    throw new Error('No ADK files found on server');
                }

                progress.report({ increment: 30, message: `Creating folder for ${adkFiles.length} files...` });

                // Create temp folder for ADK files
                const adkFolderName = `adk_${pipelineName}_${Date.now()}`;
                const adkFolderPath = path.join(this.cacheDir, adkFolderName);
                fs.mkdirSync(adkFolderPath, { recursive: true });

                this.currentAdkFolderPath = adkFolderPath;
                this.adkFilesCache.set(pipelineName, adkFiles);

                progress.report({ increment: 50, message: 'Saving files...' });

                // Save all files to temp folder
                for (const file of adkFiles) {
                    const fullPath = path.join(adkFolderPath, file.filePath);
                    const dir = path.dirname(fullPath);
                    
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    
                    fs.writeFileSync(fullPath, file.filescript || '', 'utf-8');
                }

                progress.report({ increment: 80, message: 'Opening files in editor...' });

                // Open all files in editor
                for (const file of adkFiles) {
                    const fullPath = path.join(adkFolderPath, file.filePath);
                    const fileUri = vscode.Uri.file(fullPath);
                    
                    try {
                        const doc = await vscode.workspace.openTextDocument(fileUri);
                        await vscode.window.showTextDocument(doc, {
                            preview: false,
                            preserveFocus: true
                        });
                    } catch (err) {
                        console.error(`${this.logPrefix} Failed to open file ${file.filePath}:`, err);
                    }
                }

                // Also reveal folder in explorer
                const folderUri = vscode.Uri.file(adkFolderPath);
                await vscode.commands.executeCommand('revealInExplorer', folderUri);

                progress.report({ increment: 100, message: 'Complete!' });

                vscode.window.showInformationMessage(`✓ ${adkFiles.length} ADK files opened. Edit and save to sync changes.`);
                this.sendMessageToWebview({ command: 'actionComplete', message: `✓ ${adkFiles.length} files opened` });

                // Setup file watcher for auto-sync
                this.setupAdkFolderWatcher(adkFolderPath, pipelineName);
            });

        } catch (error: any) {
            console.error(`${this.logPrefix} Error viewing ADK:`, error);
            this.sendMessageToWebview({ command: 'actionError', message: `Failed to view ADK: ${error.message}` });
        }
    }

    /**
     * Handle Download ADK action
     */
    private async handleDownloadAdk(pipelineId: string): Promise<void> {
        try {
            // Refresh auth data to ensure organization is current
            this.refreshAuthData();
            
            const card = this.allCards.find(c => c.pipelineId === pipelineId);
            if (!card) {
                this.sendMessageToWebview({ command: 'actionError', message: 'Pipeline agent not found' });
                return;
            }

            const pipelineName = card.name || card.alias || pipelineId;

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Downloading ADK...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: 'Downloading ZIP from server...' });

                const zipBuffer = await this._pipelineAgentService.downloadAdkZip(pipelineName);

                if (!zipBuffer || zipBuffer.length === 0) {
                    throw new Error('No ADK ZIP file available on server');
                }

                progress.report({ increment: 40, message: 'Select download location...' });

                // Ask user to select download location
                const folderUri = await vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    openLabel: 'Select Download Location',
                    title: `Download ADK files for ${pipelineName}`
                });

                if (!folderUri || folderUri.length === 0) {
                    return; // User cancelled
                }

                progress.report({ increment: 60, message: 'Extracting files...' });

                // Extract ZIP
                const AdmZip = require('adm-zip');
                const zip = new AdmZip(zipBuffer);
                const folderName = `${pipelineName}-${this.organization}`;
                const downloadPath = path.join(folderUri[0].fsPath, folderName);

                if (!fs.existsSync(downloadPath)) {
                    fs.mkdirSync(downloadPath, { recursive: true });
                }

                zip.extractAllTo(downloadPath, true);

                progress.report({ increment: 100, message: 'Complete!' });

                // Ask if user wants to open the folder
                const openFolder = await vscode.window.showInformationMessage(
                    `ADK files extracted successfully!`,
                    'Open Folder',
                    'Close'
                );

                if (openFolder === 'Open Folder') {
                    await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(downloadPath), true);
                }

                this.sendMessageToWebview({ command: 'actionComplete', message: `✓ Downloaded to: ${downloadPath}` });
            });

        } catch (error: any) {
            console.error(`${this.logPrefix} Error downloading ADK:`, error);
            this.sendMessageToWebview({ command: 'actionError', message: `Download failed: ${error.message}` });
        }
    }

    /**
     * Handle Refresh JSON action
     */
    private async handleRefreshJson(pipelineId: string): Promise<void> {
        try {
            // Refresh auth data to ensure organization is current
            this.refreshAuthData();
            
            const card = this.allCards.find(c => c.pipelineId === pipelineId);
            if (!card) {
                this.sendMessageToWebview({ command: 'actionError', message: 'Pipeline agent not found' });
                return;
            }

            const pipelineName = card.name || card.alias || pipelineId;
            const jsonFileName = `${pipelineName}_${this.organization}.json`;

            const fileResponse = await this._pipelineAgentService.readPipelineFile(pipelineName, jsonFileName);

            if (!fileResponse.data) {
                throw new Error('No data received from server');
            }

            const textDecoder = new TextDecoder('utf-8');
            const fileContent = textDecoder.decode(fileResponse.data);
            const jsonData = JSON.parse(fileContent);
            const formattedContent = JSON.stringify(jsonData, null, 2);

            // Update cached file
            const cachedJsonPath = path.join(this.cacheDir, jsonFileName);
            fs.writeFileSync(cachedJsonPath, formattedContent, 'utf-8');

            // Update open editor if exists
            const editors = vscode.window.visibleTextEditors;
            const jsonEditor = editors.find(e => e.document.fileName.includes(jsonFileName));

            if (jsonEditor) {
                const edit = new vscode.WorkspaceEdit();
                const fullRange = new vscode.Range(
                    jsonEditor.document.positionAt(0),
                    jsonEditor.document.positionAt(jsonEditor.document.getText().length)
                );
                edit.replace(jsonEditor.document.uri, fullRange, formattedContent);
                await vscode.workspace.applyEdit(edit);
            }

            vscode.window.showInformationMessage('✓ Configuration refreshed');
            this.sendMessageToWebview({ command: 'actionComplete', message: '✓ Configuration refreshed' });

        } catch (error: any) {
            console.error(`${this.logPrefix} Error refreshing JSON:`, error);
            this.sendMessageToWebview({ command: 'actionError', message: `Failed to refresh: ${error.message}` });
        }
    }

    /**
     * Handle Copy JSON action
     */
    private async handleCopyJson(pipelineId: string): Promise<void> {
        try {
            // Refresh auth data to ensure organization is current
            this.refreshAuthData();
            
            const card = this.allCards.find(c => c.pipelineId === pipelineId);
            if (!card) {
                this.sendMessageToWebview({ command: 'actionError', message: 'Pipeline agent not found' });
                return;
            }

            const pipelineName = card.name || card.alias || pipelineId;
            const jsonFileName = `${pipelineName}_${this.organization}.json`;
            const jsonFilePath = path.join(this.cacheDir, jsonFileName);

            if (!fs.existsSync(jsonFilePath)) {
                throw new Error('Configuration file not found in cache');
            }

            const jsonContent = fs.readFileSync(jsonFilePath, 'utf-8');
            await vscode.env.clipboard.writeText(jsonContent);

            vscode.window.showInformationMessage('✓ Configuration copied to clipboard');
            this.sendMessageToWebview({ command: 'actionComplete', message: '✓ Copied to clipboard' });

        } catch (error: any) {
            console.error(`${this.logPrefix} Error copying JSON:`, error);
            this.sendMessageToWebview({ command: 'actionError', message: `Failed to copy: ${error.message}` });
        }
    }

    /**
     * Create ZIP file from cache directory
     */
    private async createZipFromCache(pipelineName: string, adkFiles: string[]): Promise<string> {
        return new Promise((resolve, reject) => {
            const zipFileName = `${pipelineName}_adk.zip`;
            const zipPath = path.join(this.cacheDir, zipFileName);

            if (fs.existsSync(zipPath)) {
                fs.unlinkSync(zipPath);
            }

            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', () => resolve(zipPath));
            output.on('error', reject);
            archive.on('error', reject);

            archive.pipe(output);

            adkFiles.forEach(fileName => {
                const filePath = path.join(this.cacheDir, fileName);
                if (fs.existsSync(filePath)) {
                    const stats = fs.statSync(filePath);
                    if (stats.isDirectory()) {
                        archive.directory(filePath, fileName);
                    } else {
                        archive.file(filePath, { name: fileName });
                    }
                }
            });

            archive.finalize();
        });
    }

    /**
     * Setup file system watcher for ADK folder
     */
    private setupAdkFolderWatcher(adkFolderPath: string, pipelineName: string): void {
        if (this.adkFolderWatcher) {
            this.adkFolderWatcher.dispose();
        }

        const pattern = new vscode.RelativePattern(adkFolderPath, '**/*');
        this.adkFolderWatcher = vscode.workspace.createFileSystemWatcher(pattern);

        // Watch for file saves
        const saveDisposable = vscode.workspace.onDidSaveTextDocument(async (document) => {
            if (document.uri.fsPath.startsWith(adkFolderPath)) {
                await this.handleAdkFileSave(document, pipelineName, adkFolderPath);
            }
        });

        // Watch for file deletions
        this.adkFolderWatcher.onDidDelete(async (uri) => {
            await this.handleAdkFileDelete(uri, pipelineName, adkFolderPath);
        });

        this._context.subscriptions.push(this.adkFolderWatcher, saveDisposable);
    }

    /**
     * Handle ADK file save - sync to server
     */
    private async handleAdkFileSave(document: vscode.TextDocument, pipelineName: string, adkFolderPath: string): Promise<void> {
        try {
            const relativePath = path.relative(adkFolderPath, document.uri.fsPath).replace(/\\/g, '/');
            const fileContent = document.getText();

            const cachedFiles = this.adkFilesCache.get(pipelineName);
            if (!cachedFiles) {return;}

            const fileMetadata = cachedFiles.find(f => f.filePath === relativePath);
            if (!fileMetadata) {return;}

            const updatedFile = { ...fileMetadata, filescript: fileContent };
            await this._pipelineAgentService.updateAdkFolder(pipelineName, [updatedFile]);

            const fileIndex = cachedFiles.findIndex(f => f.filePath === relativePath);
            if (fileIndex !== -1) {
                cachedFiles[fileIndex] = updatedFile;
            }

            vscode.window.showInformationMessage(`✓ ${path.basename(relativePath)} saved to server`);

        } catch (error: any) {
            console.error(`${this.logPrefix} Error syncing file:`, error);
            vscode.window.showErrorMessage(`Failed to sync file: ${error.message}`);
        }
    }

    /**
     * Handle ADK file delete - sync to server
     */
    private async handleAdkFileDelete(uri: vscode.Uri, pipelineName: string, adkFolderPath: string): Promise<void> {
        try {
            const relativePath = path.relative(adkFolderPath, uri.fsPath).replace(/\\/g, '/');

            const cachedFiles = this.adkFilesCache.get(pipelineName);
            if (!cachedFiles) {return;}

            const fileMetadata = cachedFiles.find(f => f.filePath === relativePath);
            if (!fileMetadata || !fileMetadata.id) {return;}

            await this._pipelineAgentService.deleteAdkFolderFile(fileMetadata.id);

            const fileIndex = cachedFiles.findIndex(f => f.filePath === relativePath);
            if (fileIndex !== -1) {
                cachedFiles.splice(fileIndex, 1);
            }

            vscode.window.showInformationMessage(`✓ ${path.basename(relativePath)} deleted from server`);

        } catch (error: any) {
            console.error(`${this.logPrefix} Error deleting file from server:`, error);
            vscode.window.showErrorMessage(`Failed to delete file: ${error.message}`);
        }
    }

    /**
     * Send message to webview
     */
    private sendMessageToWebview(message: any): void {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
    }

    // /**
    //  * Get language identifier from file extension
    //  */
    // private getLanguageByExtension(extension: string): string {
    //     const languageMap: Record<string, string> = {
    //         'py': 'python',
    //         'js': 'javascript',
    //         'ts': 'typescript',
    //         'json': 'json',
    //         'xml': 'xml',
    //         'html': 'html',
    //         'css': 'css',
    //         'md': 'markdown',
    //         'txt': 'plaintext',
    //         'yml': 'yaml',
    //         'yaml': 'yaml',
    //         'sh': 'shellscript',
    //         'sql': 'sql',
    //         'java': 'java',
    //         'cpp': 'cpp',
    //         'c': 'c',
    //         'go': 'go',
    //         'rs': 'rust',
    //         'rb': 'ruby',
    //         'php': 'php'
    //     };

    //     return languageMap[extension.toLowerCase()] || 'plaintext';
    // }



    /**
     * Generates HTML content specific to Pipeline Agent view
     */
    private _getAgentHtmlForWebview(webview: vscode.Webview): string {
        // Read HTML template from external file
        const htmlPath = path.join(this._context.extensionPath, 'dist', CONSTANTS.HTML_PATHS.AGENT_VIEW);
        let htmlTemplate = '';

        try {
            htmlTemplate = fs.readFileSync(htmlPath, 'utf8');
        } catch (error) {
            console.error(`${this.logPrefix} Failed to read pipeline-agent.html:`, error);
            return this._getFallbackHtml();
        }

        // Get CSS file URI (pipeline-agent.css)
        const cssPath = vscode.Uri.joinPath(this._extensionUri, 'dist', CONSTANTS.HTML_PATHS.AGENT_CSS);
        const cssUri = webview.asWebviewUri(cssPath);

        // Get Constants file URI (pipeline-agent-constants.js)
        const constantsPath = vscode.Uri.joinPath(this._extensionUri, 'dist', CONSTANTS.HTML_PATHS.AGENT_CONSTANTS);
        const constantsUri = webview.asWebviewUri(constantsPath);

        // Get JavaScript file URI (pipeline-agent-client.js)
        const jsPath = vscode.Uri.joinPath(this._extensionUri, 'dist', CONSTANTS.HTML_PATHS.AGENT_CLIENT);
        const jsUri = webview.asWebviewUri(jsPath);

        // Replace placeholders with actual URIs
        htmlTemplate = htmlTemplate.replace(CONSTANTS.TEMPLATE_PLACEHOLDERS.CSS_URI, cssUri.toString());
        htmlTemplate = htmlTemplate.replace(CONSTANTS.TEMPLATE_PLACEHOLDERS.CONSTANTS_URI, constantsUri.toString());
        htmlTemplate = htmlTemplate.replace(CONSTANTS.TEMPLATE_PLACEHOLDERS.JS_URI, jsUri.toString());

        logger.info(`${this.logPrefix} Successfully loaded pipeline-agent.html`);
        return htmlTemplate;
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
                    You need to authenticate to access Pipeline Agent.
                </p>
                <button class="auth-button" onclick="startAuthentication()" id="loginBtn">
                    🚀 Login with Keycloak
                </button>
                <div class="error-message" id="errorMessage"></div>
            </div>
            <script>
                const vscode = acquireVsCodeApi();
                function startAuthentication() {
                    const loginBtn = document.getElementById('loginBtn');
                    loginBtn.textContent = '🔄 Authenticating...';
                    loginBtn.disabled = true;
                    vscode.postMessage({ command: 'triggerLogin' });
                }
                window.addEventListener('message', event => {
                    const message = event.data;
                    const loginBtn = document.getElementById('loginBtn');
                    switch (message.command) {
                        case 'authenticationProgress':
                            loginBtn.textContent = message.message || '🔄 Authenticating...';
                            break;
                        case 'authenticationError':
                            document.getElementById('errorMessage').textContent = message.message;
                            document.getElementById('errorMessage').style.display = 'block';
                            loginBtn.textContent = '🚀 Login with Keycloak';
                            loginBtn.disabled = false;
                            break;
                        case 'authenticationSuccess':
                            loginBtn.textContent = '✅ Authentication Successful';
                            break;
                    }
                });
            </script>
        </body>
        </html>`;
    }

    /**
     * Fallback HTML if pipeline-agent.html cannot be loaded
     */
    private _getFallbackHtml(): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pipeline Agent</title>
        </head>
        <body>
            <div style="padding: 20px; text-align: center;">
                <h3>Pipeline Agent</h3>
                <p>Failed to load the Pipeline Agent interface.</p>
            </div>
        </body>
        </html>`;
    }

    // ================================
    // ADK GENERATION AND UPLOAD METHODS
    // ================================

    /**
     * Ensure cache directory exists
     */
    private ensureCacheDirectory(): void {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
            logger.info(`${this.logPrefix} Created cache directory: ${this.cacheDir}`);
        }
    }

    /**
     * Upload edited JSON file to server
     */
    private async uploadJsonToServer(document: vscode.TextDocument, filePath: string): Promise<void> {
        try {
            const content = document.getText();
            const fileName = path.basename(filePath);
            
            // Extract pipeline name and organization from filename
            // Format: {pipelineName}_{organization}.json
            const fileNameWithoutExt = fileName.replace('.json', '');
            const parts = fileNameWithoutExt.split('_');
            
            if (parts.length < 2) {
                throw new Error('Invalid JSON filename format. Expected: {pipelineName}_{organization}.json');
            }
            
            const pipelineName = parts[0];
            const orgFromFile = parts.slice(1).join('_'); // Handle org names with underscores
            
            logger.info(`${this.logPrefix} Uploading JSON to server:`);
            logger.info(`${this.logPrefix} - Pipeline: ${pipelineName}`);
            logger.info(`${this.logPrefix} - Organization: ${orgFromFile}`);
            logger.info(`${this.logPrefix} - File: ${fileName}`);
            
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Saving ${fileName} to server...`,
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 30, message: 'Uploading...' });
                
                // Upload using the service
                await this._pipelineAgentService.uploadJsonFile(pipelineName, orgFromFile, fileName, content);
                
                progress.report({ increment: 100, message: 'Complete!' });
                
                vscode.window.showInformationMessage(`✓ ${fileName} saved to server successfully!`);
                logger.info(`${this.logPrefix} ✓ JSON file uploaded successfully`);
            });
            
        } catch (error: any) {
            console.error(`${this.logPrefix} ✗ Failed to upload JSON file:`, error);
            vscode.window.showErrorMessage(`Failed to save JSON to server: ${error.message}`);
        }
    }

    /**
     * Delete a cached file and remove from tracking
     */
    private deleteCachedFile(filePath: string): void {
        const normalizedPath = filePath.toLowerCase();
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                this.openedCachedFiles.delete(normalizedPath);
                logger.info(`${this.logPrefix} ✓ Deleted cached file: ${path.basename(filePath)}`);
                vscode.window.showInformationMessage(`Deleted cached file: ${path.basename(filePath)}`);
            } else {
                logger.info(`${this.logPrefix} File already deleted: ${filePath}`);
                this.openedCachedFiles.delete(normalizedPath);
            }
        } catch (error: any) {
            console.error(`${this.logPrefix} ✗ Failed to delete cached file:`, error);
            vscode.window.showErrorMessage(`Failed to delete cached file: ${error.message}`);
        }
    }

    /**
     * Clean up all tracked cached files (called on extension deactivation)
     */
    public cleanup(): void {
        logger.info(`${this.logPrefix} Cleaning up tracked cached files...`);
        logger.info(`${this.logPrefix} Tracked files count: ${this.openedCachedFiles.size}`);
        logger.info(`${this.logPrefix} Cache directory: ${this.cacheDir}`);
        
        // Delete all tracked files using original paths
        let trackedDeleted = 0;
        this.openedCachedFiles.forEach((originalPath, normalizedPath) => {
            try {
                logger.info(`${this.logPrefix} Attempting to delete tracked: ${originalPath}`);
                if (fs.existsSync(originalPath)) {
                    fs.unlinkSync(originalPath);
                    trackedDeleted++;
                    logger.info(`${this.logPrefix} ✓ Cleaned up tracked: ${path.basename(originalPath)}`);
                } else {
                    logger.info(`${this.logPrefix} Tracked file not found: ${originalPath}`);
                }
            } catch (error: any) {
                console.error(`${this.logPrefix} Failed to clean up tracked ${originalPath}:`, error);
            }
        });
        
        this.openedCachedFiles.clear();
        logger.info(`${this.logPrefix} Deleted ${trackedDeleted} tracked file(s)`);
        
        // Fallback: Scan cache directory and delete all JSON files
        try {
            if (fs.existsSync(this.cacheDir)) {
                const files = fs.readdirSync(this.cacheDir);
                const jsonFiles = files.filter(f => f.endsWith('.json'));
                logger.info(`${this.logPrefix} Found ${jsonFiles.length} JSON file(s) in cache directory`);
                
                let fallbackDeleted = 0;
                jsonFiles.forEach(fileName => {
                    try {
                        const filePath = path.join(this.cacheDir, fileName);
                        fs.unlinkSync(filePath);
                        fallbackDeleted++;
                        logger.info(`${this.logPrefix} ✓ Deleted untracked JSON: ${fileName}`);
                    } catch (error: any) {
                        console.error(`${this.logPrefix} Failed to delete ${fileName}:`, error);
                    }
                });
                
                logger.info(`${this.logPrefix} Deleted ${fallbackDeleted} untracked JSON file(s) from cache`);
            }
        } catch (error: any) {
            console.error(`${this.logPrefix} Failed to scan cache directory:`, error);
        }
        
        logger.info(`${this.logPrefix} Cleanup complete`);
    }
}



