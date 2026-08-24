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
import { EssedumFileSystemProvider } from '../../providers/essedum-file-provider';

const logger = ExtensionUtils.createLogger('PipelineAgent');

/**
 * ADK Tree Item for tree view
 */
class AdkTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly resourceUri?: vscode.Uri,
        public readonly isFile: boolean = false,
        public readonly children: AdkTreeItem[] = []
    ) {
        super(label, collapsibleState);

        if (isFile && resourceUri) {
            this.command = {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [resourceUri]
            };
            this.contextValue = 'adkFile';
            // Set icon based on file extension
            const ext = path.extname(label);
            this.iconPath = new vscode.ThemeIcon(this.getIconForExtension(ext));
        } else {
            this.contextValue = 'adkFolder';
            this.iconPath = new vscode.ThemeIcon('folder');
        }
    }

    private getIconForExtension(ext: string): string {
        const iconMap: { [key: string]: string } = {
            '.py': 'symbol-method',
            '.js': 'symbol-method',
            '.ts': 'symbol-method',
            '.json': 'json',
            '.md': 'markdown',
            '.txt': 'file-text',
            '.yaml': 'file-code',
            '.yml': 'file-code'
        };
        return iconMap[ext.toLowerCase()] || 'file';
    }
}

/**
 * ADK Tree Data Provider for Explorer view
 */
class AdkTreeDataProvider implements vscode.TreeDataProvider<AdkTreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<AdkTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private rootItems: AdkTreeItem[] = [];

    constructor(private fileSystemProvider: EssedumFileSystemProvider) { }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    setFiles(pipelineName: string, files: any[]): void {
        // Build tree structure from flat file list
        this.rootItems = [];
        const folderMap = new Map<string, AdkTreeItem>();

        // Sort files by path
        const sortedFiles = files.sort((a, b) => a.filePath.localeCompare(b.filePath));

        for (const file of sortedFiles) {
            const parts = file.filePath.split('/');
            const fileName = parts[parts.length - 1];
            const folderPath = parts.slice(0, -1).join('/');

            // Create folders if needed
            if (folderPath) {
                const folderParts = folderPath.split('/');
                let currentPath = '';
                let parentFolder: AdkTreeItem | null = null;

                for (const folderName of folderParts) {
                    currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

                    if (!folderMap.has(currentPath)) {
                        const folderItem = new AdkTreeItem(
                            folderName,
                            vscode.TreeItemCollapsibleState.Expanded,
                            undefined,
                            false,
                            []
                        );
                        folderMap.set(currentPath, folderItem);

                        if (parentFolder) {
                            parentFolder.children.push(folderItem);
                        } else {
                            this.rootItems.push(folderItem);
                        }
                    }
                    parentFolder = folderMap.get(currentPath)!;
                }
            }

            // Create file item
            const uri = vscode.Uri.parse(`essedum://adk/${pipelineName}/${file.filePath}`);
            const fileItem = new AdkTreeItem(
                fileName,
                vscode.TreeItemCollapsibleState.None,
                uri,
                true
            );

            // Add to appropriate parent
            if (folderPath && folderMap.has(folderPath)) {
                folderMap.get(folderPath)!.children.push(fileItem);
            } else {
                this.rootItems.push(fileItem);
            }
        }

        this.refresh();
    }

    clear(): void {
        this.rootItems = [];
        this.refresh();
    }

    getTreeItem(element: AdkTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: AdkTreeItem): Thenable<AdkTreeItem[]> {
        if (!element) {
            return Promise.resolve(this.rootItems);
        }
        return Promise.resolve(element.children);
    }
}

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

    /** File system provider for ADK files */
    private _fileSystemProvider?: EssedumFileSystemProvider;

    /** ADK Tree Data Provider */
    private _adkTreeDataProvider?: AdkTreeDataProvider;

    /** ADK Tree View */
    private _adkTreeView?: vscode.TreeView<AdkTreeItem>;

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
    private currentTab: 'agents' | 'mcp' | 'app' = 'agents'; // Track current active tab

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

    /** Track folder changes */
    private folderHasChanges: boolean = false;

    /** Changed files tracking */
    private changedFiles: Set<string> = new Set();

    /** Path to the current "Attached Skills" context file, if any skills are attached */
    private attachedSkillsContextPath?: string;

    /**
     * Debounced watch on a pipeline's real ADK folder (the same one "Open
     * Copilot"/"Edit Code" use — see getPipelineFolderPath) armed by "Add
     * Skill with Copilot Chat" when that pipeline has no server-side files
     * yet. Every time the folder settles (no changes for a few seconds),
     * its CURRENT, COMPLETE contents are re-uploaded — see
     * armSkillFolderUploadWatch() for why the local copy is never deleted
     * and the watch never gets torn down after a single upload.
     */
    private skillFolderUploadWatch?: {
        folderPath: string;
        disposables: vscode.Disposable[];
        debounceTimer?: NodeJS.Timeout;
    };

    /** Which pipeline's generation target (workspace folder / adkContext) was last prepared by "Add Skill", to avoid redundant re-preparation on every skill toggle */
    private lastSkillGenerationPreparedPipelineId?: string;

    /** Quiet period after the last file change before an auto-upload fires */
    private static readonly AUTO_UPLOAD_DEBOUNCE_MS = 3000;

    /** Component logger prefix */
    private readonly logPrefix = CONSTANTS.LOG_PREFIX;

    /**
     * Creates a new Pipeline Agent Provider instance
     * @param _context - VS Code extension context
     * @param token - Authentication token
     * @param authService - Authentication service instance
     * @param pipelineAgentService - Pipeline Agent service instance
     * @param fileSystemProvider - File system provider for ADK files
     */
    constructor(
        _context: vscode.ExtensionContext,
        token: string,
        authService?: any,
        pipelineAgentService?: PipelineAgentService,
        fileSystemProvider?: EssedumFileSystemProvider
    ) {
        this._context = _context;
        this._extensionUri = _context.extensionUri;
        this.updateToken(token);
        this.project = _context.globalState.get(CONSTANTS.STATE_KEYS.PROJECT);
        this.organization = this.project?.name;
        this.role = _context.globalState.get(CONSTANTS.STATE_KEYS.ROLE);
        this._authService = authService;
        this._pipelineAgentService = pipelineAgentService || new PipelineAgentService(_context);
        this._fileSystemProvider = fileSystemProvider;

        // Configure file system provider with pipeline agent service for individual saves
        if (this._fileSystemProvider && this._pipelineAgentService) {
            this._fileSystemProvider.setPipelineAgentService(this._pipelineAgentService);

            // Note: ADK tree provider commented out - using workspace folders instead
            // this._adkTreeDataProvider = new AdkTreeDataProvider(this._fileSystemProvider);
            // this._adkTreeView = vscode.window.createTreeView('essedumAdkExplorer', {
            //     treeDataProvider: this._adkTreeDataProvider,
            //     showCollapseAll: true
            // });
            // this._context.subscriptions.push(this._adkTreeView);
        }

        // Initialize cache directory - use extension global storage instead of temp
        this.cacheDir = path.join(this._context.globalStorageUri.fsPath, CONSTANTS.CACHE_CONFIG.ROOT_DIR_NAME);

        // Initialize folder changes context
        vscode.commands.executeCommand('setContext', 'essedum.folderHasChanges', false);
        this.ensureCacheDirectory();

        // Register GLOBAL save handler for ADK files
        this.registerGlobalAdkSaveHandler();

        // Restore ADK folder watcher if context exists (e.g., after extension reload)
        this.restoreAdkFolderWatcher();

        // Check for pending copilot action after extension reload
        this.checkPendingCopilotAction();

        // Check for a pending "Add Skill" folder setup after extension reload
        this.checkPendingSkillGenerationSetup();

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

        // Save active view state when pipeline-agent view is opened/resolved
        // This ensures the view is restored correctly after extension reload
        this._context.globalState.update(STORAGE_KEYS.ACTIVE_VIEW, 'pipeline-agent').then(() => {
            logger.info(`${this.logPrefix} Saved active view state: pipeline-agent`);
        });

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
                        await this.refreshCurrentTab();
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.FILTER:
                        this.filter = message.filter;
                        await this.refreshCurrentTab();
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.REFRESH:
                        await this.refreshCurrentTab();
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
                    case CONSTANTS.WEBVIEW_COMMANDS.UPLOAD_FROM_GITHUB:
                        await this.handleUploadFromGitHub(message.pipelineId);
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
                    case CONSTANTS.WEBVIEW_COMMANDS.ADD_SKILLS_TO_COPILOT:
                        await this.handleSyncSkillsContext(message.skills, message.pipelineId);
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.LOGOUT:
                        await this.handleLogout();
                        break;
                    case CONSTANTS.WEBVIEW_COMMANDS.TRIGGER_LOGIN:
                        await this.handleLogin();
                        break;
                    case 'switchTab':
                        await this.handleTabSwitch(message.tab);
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
                // Check if this is a virtual file (essedum:// scheme)
                if (document.uri.scheme === 'essedum') {
                    const uriPath = document.uri.path;
                    
                    // Check if it's a JSON file
                    if (uriPath.endsWith('.json')) {
                        logger.info(`${this.logPrefix} Virtual JSON file saved, uploading to server: ${uriPath}`);
                        
                        // Extract filename from URI path
                        const fileName = path.basename(uriPath);
                        await this.uploadVirtualJsonToServer(document, fileName);
                    }
                    return;
                }

                // Handle physical cached files (legacy)
                const documentPath = document.uri.fsPath.toLowerCase();
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
            logger.error('Authentication error details:', {
                message: error.message,
                stack: error.stack,
                authServiceAvailable: !!this._authService
            });

            if (this._view) {
                this._view.webview.postMessage({
                    command: CONSTANTS.CLIENT_COMMANDS.AUTHENTICATION_ERROR,
                    message: error.message || 'Authentication failed'
                });
            }

            // Provide more specific error messages
            let errorMsg = 'Authentication failed. ';
            if (!this._authService) {
                errorMsg += 'Authentication service not initialized. Try reloading the window (Ctrl+R).';
            } else if (error.message?.includes('token')) {
                errorMsg += 'Token refresh failed. Please try logging in again.';
            } else if (error.message?.includes('network') || error.message?.includes('ECONNREFUSED')) {
                errorMsg += 'Cannot connect to authentication server. Check your network connection.';
            } else {
                errorMsg += error.message || 'Unknown error occurred.';
            }

            vscode.window.showErrorMessage(
                errorMsg,
                'Try Command Palette',
                'Reload Window'
            ).then(selection => {
                if (selection === 'Try Command Palette') {
                    vscode.commands.executeCommand('workbench.action.showCommands');
                } else if (selection === 'Reload Window') {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            });
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
     * Get MCP Server cards
     */
    private async getMcpServerCards(): Promise<void> {
        logger.info(`${this.logPrefix} getMcpServerCards called, token length: ${this._token ? this._token.length : 0}`);

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
            // Step 1: Get total count using MCP count API
            logger.info(`${this.logPrefix} Fetching MCP Server count...`);
            this.totalCount = await this._pipelineAgentService.getMcpServerCount(params);
            this.totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));

            logger.info(`${this.logPrefix} Total MCP count: ${this.totalCount}, Total pages: ${this.totalPages}`);

            // Step 2: Get cards using MCP list API
            logger.info(`${this.logPrefix} Fetching MCP Server cards for page ${this.pageNumber}...`);
            const response = await this._pipelineAgentService.getMcpServerList(params);

            if (response && Array.isArray(response) && response.length > 0) {
                this.allCards = response.map((element: any) => ({
                    pipelineId: element.name || element.id || element._id || Math.random().toString(36),
                    type: element.type || 'MCP Server',
                    alias: element.alias || element.name || 'No Alias',
                    createdDate: element.createdDate || element.created_date || new Date().toISOString(),
                    created_by: element.created_by || element.createdBy || 'Unknown',
                    id: element.id || element._id,
                    status: 'active',
                    description: element.description || '',
                    interfacetype: 'mcp-pipeline',
                    ...element
                }));

                // Use all cards returned from API (already paginated by server)
                this.filteredCards = this.allCards;
            } else {
                logger.info(`${this.logPrefix} No MCP cards returned from API`);
                this.allCards = [];
                this.filteredCards = [];
            }

            logger.info(`${this.logPrefix} Page ${this.pageNumber}: Showing ${this.filteredCards.length} of ${this.totalCount} total MCP cards`);

            this.loading = false;
            this.updateWebview();

        } catch (error: any) {
            console.error(`${this.logPrefix} Error fetching MCP Server cards:`, error);
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
            let errorMessage = 'Failed to fetch MCP Server data';
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
     * Get App Pipeline cards
     */
    private async getAppPipelineCards(): Promise<void> {
        logger.info(`${this.logPrefix} getAppPipelineCards called`);

        this.refreshAuthData();

        if (!this._isAuthenticated) {
            const contextToken = this._context.globalState.get(CONSTANTS.STATE_KEYS.ACCESS_TOKEN) as string;
            if (contextToken && contextToken.trim().length > 0) {
                this.updateToken(contextToken);
            } else {
                this.showAuthenticationRequired();
                return;
            }
        }

        if (!this._isAuthenticated) {
            this.showAuthenticationRequired();
            return;
        }

        this.loading = true;
        this.updateWebview();

        const params = this.buildHttpParams();

        try {
            logger.info(`${this.logPrefix} Fetching App Pipeline count...`);
            this.totalCount = await this._pipelineAgentService.getAppPipelineCount(params);
            this.totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));

            logger.info(`${this.logPrefix} Total App count: ${this.totalCount}, Total pages: ${this.totalPages}`);

            const response = await this._pipelineAgentService.getAppPipelineList(params);

            if (response && Array.isArray(response) && response.length > 0) {
                this.allCards = response.map((element: any) => ({
                    pipelineId: element.name || element.id || element._id || Math.random().toString(36),
                    type: element.type || 'appPipeline',
                    alias: element.alias || element.name || 'No Alias',
                    createdDate: element.createdDate || element.created_date || new Date().toISOString(),
                    created_by: element.created_by || element.createdBy || 'Unknown',
                    id: element.id || element._id,
                    status: 'active',
                    description: element.description || '',
                    interfacetype: 'app-pipeline',
                    ...element
                }));
                this.filteredCards = this.allCards;
            } else {
                logger.info(`${this.logPrefix} No App Pipeline cards returned from API`);
                this.allCards = [];
                this.filteredCards = [];
            }

            logger.info(`${this.logPrefix} Page ${this.pageNumber}: Showing ${this.filteredCards.length} of ${this.totalCount} total app cards`);

            this.loading = false;
            this.updateWebview();

        } catch (error: any) {
            console.error(`${this.logPrefix} Error fetching App Pipeline cards:`, error);
            this.loading = false;

            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
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

            let errorMessage = 'Failed to fetch App Pipeline data';
            if (error.message) {
                errorMessage = error.message;
            }

            vscode.window.showErrorMessage(`${this.logPrefix} Error: ${errorMessage}`);
            this.filteredCards = [];
            this.updateWebview();
        }
    }

    /**
     * Handle tab switch between Agents, MCP Servers, and App
     */
    private async handleTabSwitch(tab: 'agents' | 'mcp' | 'app'): Promise<void> {
        logger.info(`${this.logPrefix} Switching to tab: ${tab}`);

        // Update current tab
        this.currentTab = tab;

        // Reset pagination
        this.pageNumber = 1;
        this.totalCount = 0;
        this.totalPages = 1;
        this.allCards = [];
        this.filteredCards = [];
        this.filter = '';

        // Load appropriate cards based on tab
        if (tab === 'agents') {
            await this.getAgentCards();
        } else if (tab === 'mcp') {
            await this.getMcpServerCards();
        } else if (tab === 'app') {
            await this.getAppPipelineCards();
        }
    }

    /**
     * Refresh current tab data
     */
    private async refreshCurrentTab(): Promise<void> {
        if (this.currentTab === 'agents') {
            await this.getAgentCards();
        } else if (this.currentTab === 'mcp') {
            await this.getMcpServerCards();
        } else if (this.currentTab === 'app') {
            await this.getAppPipelineCards();
        }
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
        this.refreshCurrentTab();
    }

    public nextPage(): void {
        if (this.pageNumber < this.totalPages) {
            this.pageNumber++;
            this.refreshCurrentTab();
        }
    }

    public previousPage(): void {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            this.refreshCurrentTab();
        }
    }

    public goToFirstPage(): void {
        this.pageNumber = 1;
        this.refreshCurrentTab();
    }

    public goToLastPage(): void {
        this.pageNumber = this.totalPages;
        this.refreshCurrentTab();
    }

    // /**
    //  * Delete file from Explorer (context menu)
    //  * Public method called from command handler
    //  */
    // public async deleteFileFromExplorer(uri: vscode.Uri): Promise<void> {
    //     logger.info(`${this.logPrefix} Delete file requested from Explorer: ${uri.fsPath}`);

    //     // Retrieve ADK context to get pipeline name and folder path
    //     const adkContext = this._context.globalState.get<any>('adkContext');
    //     if (!adkContext) {
    //         vscode.window.showWarningMessage('No ADK context found. Please open ADK files first.');
    //         return;
    //     }

    //     const pipelineName = adkContext.pipelineName;
    //     const adkFolderPath = adkContext.folderPath;

    //     // Verify the file is within the ADK folder
    //     const normalizedAdkPath = path.normalize(adkFolderPath).toLowerCase();
    //     const normalizedFilePath = path.normalize(uri.fsPath).toLowerCase();

    //     if (!normalizedFilePath.startsWith(normalizedAdkPath)) {
    //         vscode.window.showWarningMessage('This file is not part of the current ADK workspace.');
    //         return;
    //     }

    //     // Confirm deletion
    //     const fileName = path.basename(uri.fsPath);
    //     const confirmation = await vscode.window.showWarningMessage(
    //         `Delete "${fileName}" from server?`,
    //         { modal: true },
    //         'Delete',
    //         'Cancel'
    //     );

    //     if (confirmation !== 'Delete') {
    //         return;
    //     }

    //     // Call the delete handler
    //     await this.handleAdkFileDelete(uri, pipelineName, adkFolderPath);
    // }

    /**
     * Upload Agent Folder (context menu on folder)
     * Public method called from command handler
     */
    public async uploadAgentFolder(uri?: vscode.Uri): Promise<void> {
        logger.info(`${this.logPrefix} Upload folder requested from Explorer: ${uri?.fsPath}`);

        if (!uri) {
            vscode.window.showWarningMessage('No folder selected.');
            return;
        }

        // Check if this folder is a workspace folder (not a subfolder)
        const workspaceFolder = vscode.workspace.workspaceFolders?.find(
            folder => folder.uri.fsPath === uri.fsPath
        );

        if (!workspaceFolder) {
            vscode.window.showWarningMessage('Upload Agent Folder can only be used on workspace folders, not subfolders.');
            return;
        }

        // Try to find pipeline info from ADK context or by matching folder path pattern
        let pipelineId: string | undefined;
        let pipelineName: string | undefined;
        let organization: string | undefined;

        // First try to get from ADK context
        const adkContext = this._context.globalState.get<any>('adkContext');
        if (adkContext && adkContext.folderPath === uri.fsPath) {
            pipelineId = adkContext.pipelineId;
            pipelineName = adkContext.pipelineName;
            organization = adkContext.organization;
        } else {
            // Try to extract from folder name pattern: pipeline_${pipelineId}
            const folderName = path.basename(uri.fsPath);
            const match = folderName.match(/^pipeline_(.+)$/);
            if (match) {
                pipelineName = match[1];
                pipelineId = match[1];
                organization = this.organization;
            }
        }

        if (!pipelineName || !organization) {
            vscode.window.showWarningMessage('Could not determine pipeline information. Please use Edit Code or Open Copilot first.');
            return;
        }

        // Get display name (alias) for user-facing messages
        const card = this.allCards.find(c => c.pipelineId === pipelineId);
        const pipelineDisplayName = card?.alias || card?.name || pipelineName;

        logger.info(`${this.logPrefix} Root folder selected. Scanning for files...`);

        // Scan the folder for all files (excluding JSON config)
        const jsonFileName = `${pipelineName}_${organization}.json`;
        const allFiles: string[] = [];

        const scanDirectory = (dirPath: string, relativePath: string = '') => {
            const items = fs.readdirSync(dirPath);
            for (const item of items) {
                // Skip the JSON configuration file
                if (item === jsonFileName && relativePath === '') {
                    continue;
                }

                const fullPath = path.join(dirPath, item);
                const relPath = relativePath ? path.join(relativePath, item) : item;
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    scanDirectory(fullPath, relPath);
                } else {
                    allFiles.push(relPath);
                }
            }
        };

        scanDirectory(uri.fsPath);

        logger.info(`${this.logPrefix} Found ${allFiles.length} file(s) in folder`);

        // Confirm upload
        const folderName = path.basename(uri.fsPath);
        const fileCountMessage = allFiles.length === 0 
            ? 'Upload empty folder (clear all files)' 
            : `Upload ${allFiles.length} file(s)`;
        
        const confirmation = await vscode.window.showInformationMessage(
            `${fileCountMessage} in "${pipelineDisplayName}" to server?`,
            { modal: true },
            'Upload',
            'Cancel'
        );

        if (confirmation !== 'Upload') {
            return;
        }

        // Upload entire folder as ZIP
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Uploading ${folderName}...`,
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 10, message: 'Creating ZIP archive...' });

                // Create ZIP from the ADK folder - include ALL contents (files and subfolders)
                const AdmZip = require('adm-zip');
                const zip = new AdmZip();

                // Determine the JSON filename to exclude
                const jsonFileName = `${pipelineName}_${organization}.json`;
                logger.info(`${this.logPrefix} Excluding JSON file from upload: ${jsonFileName}`);

                // Read all files and folders in the folder
                const items = fs.readdirSync(uri.fsPath);

                for (const item of items) {
                    // Skip the JSON configuration file
                    if (item === jsonFileName) {
                        logger.info(`${this.logPrefix} Skipping JSON file: ${item}`);
                        continue;
                    }

                    const itemPath = path.join(uri.fsPath, item);
                    const stat = fs.statSync(itemPath);

                    if (stat.isDirectory()) {
                        // Add entire subfolder with its contents
                        zip.addLocalFolder(itemPath, item);
                    } else {
                        // Add individual file at root level
                        zip.addLocalFile(itemPath);
                    }
                }

                progress.report({ increment: 40, message: 'Compressing files...' });

                const zipBuffer = zip.toBuffer();
                const zipFileName = `${pipelineName}_${organization}.zip`;

                progress.report({ increment: 60, message: 'Uploading to server...' });

                // Upload ZIP using the bulk upload API
                await this._pipelineAgentService.uploadFolderZip(
                    pipelineName,
                    zipBuffer,
                    zipFileName
                );

                progress.report({ increment: 100, message: 'Complete!' });

                // Clear changes after successful upload
                this.changedFiles.clear();

                // Update context menu state
                this.updateFolderHasChangesContext();

                vscode.window.showInformationMessage(
                    `✓ ${allFiles.length} file(s) uploaded successfully to ${pipelineName}`
                );

            } catch (error: any) {
                logger.error(`${this.logPrefix} Error uploading folder:`, error);
                vscode.window.showErrorMessage(`Upload failed: ${error.message}`);
            }
        });
    }

    /**
     * Track file changes for enabling Upload Agent Folder
     */
    private trackFileChange(filePath: string, adkFolderPath: string): void {
        logger.info(`${this.logPrefix} trackFileChange called for: ${filePath}`);
        const normalizedAdkPath = path.normalize(adkFolderPath).toLowerCase();
        const normalizedFilePath = path.normalize(filePath).toLowerCase();

        logger.info(`${this.logPrefix} Normalized ADK path: ${normalizedAdkPath}`);
        logger.info(`${this.logPrefix} Normalized file path: ${normalizedFilePath}`);
        logger.info(`${this.logPrefix} Starts with? ${normalizedFilePath.startsWith(normalizedAdkPath)}`);

        if (normalizedFilePath.startsWith(normalizedAdkPath)) {
            this.changedFiles.add(filePath);
            this.updateFolderHasChangesContext();
            logger.info(`${this.logPrefix} ✓ Tracked change: ${filePath}. Total changes: ${this.changedFiles.size}`);
        } else {
            logger.warn(`${this.logPrefix} ✗ File not in ADK folder, not tracking`);
        }
    }

    /**
     * Update context for enabling/disabling Upload Agent Folder menu
     */
    private updateFolderHasChangesContext(): void {
        const hasChanges = this.changedFiles.size > 0;
        logger.info(`${this.logPrefix} updateFolderHasChangesContext: hasChanges=${hasChanges}, changedFiles.size=${this.changedFiles.size}`);

        if (this.folderHasChanges !== hasChanges) {
            this.folderHasChanges = hasChanges;
            vscode.commands.executeCommand('setContext', 'essedum.folderHasChanges', hasChanges);
            logger.info(`${this.logPrefix} ✓ Context updated: essedum.folderHasChanges = ${hasChanges}`);
        } else {
            logger.info(`${this.logPrefix} Context unchanged, still: ${hasChanges}`);
        }
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

                progress.report({ increment: 80, message: 'Loading detail view...' });

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

                // Create error JSON content — JSON.stringify handles all necessary encoding
                const safeErrorMsg = (String(jsonLoadError || 'Unknown error')).substring(0, 500);
                formattedContent = JSON.stringify({
                    error: 'Failed to load configuration',
                    message: safeErrorMsg
                }, null, 2);

                // Show warning notification
                // vscode.window.showWarningMessage(`${this.logPrefix} ${jsonLoadError}. Showing detail view with available information.`);
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

            // Load skills catalogue for the "Attach a skill" menu (non-blocking;
            // a failure here should never prevent the detail view from showing)
            await this.fetchAndSendSkills();

            progress.report({ increment: 100, message: 'Complete!' });
        });
    }

    /**
     * Fetch the skills catalogue and push it to the webview for the
     * "Attach a skill" menu. Mirrors the web app's agent-pipeline chat panel
     * (loadAiChatSkills/toChatSkill in agent-pipeline.component.ts), which
     * lets users attach a skill before sending a message to the AI agent.
     */
    private async fetchAndSendSkills(): Promise<void> {
        if (!this._view) {
            return;
        }
        try {
            const response = await this._pipelineAgentService.getSkills({ org: this.organization });
            const rawSkills = Array.isArray(response)
                ? response
                : (response?.skills || response?.content || response?.data || []);

            const skills = Array.isArray(rawSkills)
                ? rawSkills.map((s: any) => this.mapToChatSkill(s)).filter((s): s is { value: string; label: string; icon: string; description: string } => !!s)
                : [];

            this._view.webview.postMessage({
                command: CONSTANTS.CLIENT_COMMANDS.SKILLS_LOADED,
                skills
            });
        } catch (error) {
            logger.warn(`${this.logPrefix} Failed to load skills for attach-skill menu:`, error);
            this._view.webview.postMessage({
                command: CONSTANTS.CLIENT_COMMANDS.SKILLS_LOADED,
                skills: []
            });
        }
    }

    /**
     * Map a raw skill record from the API to the simplified shape used by
     * the "Add Skill with Copilot Chat" menu: { value, label, icon, description }.
     * The description isn't shown in the chip UI, but it IS sent to Copilot
     * (see handleSyncSkillsContext) so the full skill context is available
     * even though only the name is visible on screen.
     */
    private mapToChatSkill(s: any): { value: string; label: string; icon: string; description: string } | null {
        if (!s || typeof s !== 'object') {
            return null;
        }
        const value = String(s.skillUid ?? s.id ?? s.skillAlias ?? s.skillName ?? '').trim();
        if (!value) {
            return null;
        }
        const label = String(s.skillName ?? s.skillAlias ?? s.name ?? value).trim();
        const description = String(s.description ?? '').trim();
        const type = String(s.skillType ?? '').toUpperCase();
        const icon = CONSTANTS.SKILL_ICON_MAP[type] || CONSTANTS.DEFAULT_SKILL_ICON;
        return { value, label, icon, description };
    }

    /**
     * Resolve where the "Attached Skills" context file should live: inside
     * the open workspace (so it's a normal file the user can drag into chat
     * as an attachment) if a workspace folder is open, otherwise fall back
     * to the extension's cache directory.
     */
    private getSkillsContextFilePath(): string {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        const dir = workspaceRoot ? path.join(workspaceRoot, '.essedum') : this.cacheDir;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        return path.join(dir, 'attached-skills-context.md');
    }

    /**
     * Keep the "Attached Skills" context file in sync with the current
     * attach/detach state from the webview. This intentionally does NOT
     * send anything into chat automatically — it only prepares a file with
     * each attached skill's name + full description (so nothing gets
     * truncated), which the user can drag/attach into their own chat
     * message alongside whatever they want to ask. Removing the last
     * attached skill deletes the file entirely; removing one of several
     * just rewrites the file without it.
     *
     * If the currently selected pipeline (`pipelineId`) is known, this also
     * prepares that pipeline's REAL ADK folder (the same one "Open
     * Copilot"/"Edit Code" use) as a workspace root — see
     * prepareSkillGenerationTarget() for why: telling the coding agent
     * "use this folder" via a note was unreliable, but agents do reliably
     * write inside whatever folder is actually open as the workspace root.
     */
    private async handleSyncSkillsContext(
        skills?: Array<{ value?: string; label?: string; description?: string }>,
        pipelineId?: string
    ): Promise<void> {
        try {
            const list = (skills || []).filter(s => s && s.label);

            if (!list.length) {
                await this.removeSkillsContextFile();
                this.disposeSkillFolderUploadWatch();
                this.lastSkillGenerationPreparedPipelineId = undefined;
                return;
            }

            this.refreshAuthData();
            const card = pipelineId ? this.allCards.find(c => c.pipelineId === pipelineId) : undefined;
            const pipelineName = card?.name || card?.alias || pipelineId;

            const filePath = this.getSkillsContextFilePath();
            const body = list
                .map(s => `## ${s.label}\n\n${s.description ? s.description : '_No description provided._'}`)
                .join('\n\n');
            const content = `# Attached Skills\n\nAttach this file to your Copilot/Chat message (drag it in, or use the attach/"+" button), then type your own question or instruction — the assistant should use the skill guidance below alongside it.\n\n${body}\n`;

            fs.writeFileSync(filePath, content, 'utf-8');
            this.attachedSkillsContextPath = filePath;

            // Open it as a normal tab in the active editor group (no split),
            // without stealing focus from whatever the user is doing.
            const doc = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(doc, {
                viewColumn: vscode.ViewColumn.Active,
                preview: true,
                preserveFocus: true
            });

            const count = list.length;
            this.sendMessageToWebview({
                command: 'actionComplete',
                message: `✓ ${count} skill${count > 1 ? 's' : ''} ready — attach the opened file to your chat message`
            });

            // Prepare the generation target in the background (may involve
            // an extension reload if the folder isn't in the workspace yet —
            // both "Edit Code" and this flow already survive that via their
            // own persisted state, so this doesn't need to block the visible
            // "skill ready" step above). Skipped if already prepared for
            // this exact pipeline this session. Note: if this triggers a
            // reload, the sidebar resets to the card list — by design, not
            // restored (the user reselects the card).
            if (pipelineId && pipelineName && this.lastSkillGenerationPreparedPipelineId !== pipelineId) {
                this.lastSkillGenerationPreparedPipelineId = pipelineId;
                this.prepareSkillGenerationTarget(pipelineId, pipelineName, card).catch(error => {
                    logger.warn(`${this.logPrefix} Failed to prepare skill generation target:`, error);
                });
            }
        } catch (error: any) {
            logger.error(`${this.logPrefix} Error syncing skills context file:`, error);
            this.sendMessageToWebview({ command: 'actionError', message: `Failed to prepare skill context: ${error.message}` });
        }
    }

    /**
     * Decide how to make this pipeline's real folder available for the
     * coding agent to write into, depending on whether it already has
     * server-side files:
     * - Has files → reuse the exact, already-working "Edit Code" flow
     *   (handleViewAdk): pulls files locally with real server IDs and arms
     *   the existing per-file sync-on-save. No new upload logic needed.
     * - No files yet → add the same folder "Open Copilot" would use to the
     *   workspace (so the agent has a single, concrete root to target) and
     *   bulk-upload it once generation settles — see
     *   ensureSkillGenerationWorkspaceFolder().
     */
    private async prepareSkillGenerationTarget(pipelineId: string, pipelineName: string, card: any): Promise<void> {
        const hasFiles = await this.pipelineHasAdkFiles(pipelineName);
        if (hasFiles) {
            await this.handleViewAdk(pipelineId);
            return;
        }
        await this.ensureSkillGenerationWorkspaceFolder(pipelineId, pipelineName, card);
    }

    private async pipelineHasAdkFiles(pipelineName: string): Promise<boolean> {
        try {
            const files = await this._pipelineAgentService.listAdkFiles(pipelineName);
            return !!(files && files.length > 0);
        } catch {
            return false;
        }
    }

    /**
     * Add this pipeline's real ADK folder to the workspace (same folder,
     * same mechanism "Open Copilot" uses — getPipelineFolderPath +
     * updateWorkspaceFolders) if it isn't already there, then arm a
     * debounced bulk-upload watch on it. If adding it to the workspace
     * triggers an extension reload, persisted state survives it — see
     * checkPendingSkillGenerationSetup().
     */
    private async ensureSkillGenerationWorkspaceFolder(pipelineId: string, pipelineName: string, card: any): Promise<void> {
        const pipelineFolderPath = this.getPipelineFolderPath(pipelineId);
        const folderExists = vscode.workspace.workspaceFolders?.some(
            folder => folder.uri.fsPath === pipelineFolderPath
        );

        if (!folderExists) {
            await this._context.globalState.update('pendingSkillGenerationSetup', {
                pipelineId,
                pipelineName,
                organization: this.organization,
                pipelineFolderPath,
                timestamp: Date.now()
            });

            const pipelineDisplayName = card?.alias || card?.name || pipelineId;
            const workspaceFoldersCount = vscode.workspace.workspaceFolders?.length || 0;
            const added = vscode.workspace.updateWorkspaceFolders(
                workspaceFoldersCount,
                0,
                { uri: vscode.Uri.file(pipelineFolderPath), name: pipelineDisplayName }
            );

            if (added) {
                logger.info(`${this.logPrefix} Added skill-generation folder to workspace, extension will reload...`);
            }
            // Execution may stop here due to extension reload; resumed via
            // checkPendingSkillGenerationSetup().
            return;
        }

        this.armSkillFolderUploadWatch(pipelineFolderPath, pipelineId, pipelineName, this.organization);
    }

    /**
     * Resume arming the skill-generation folder watch after an extension
     * reload triggered by ensureSkillGenerationWorkspaceFolder() adding the
     * folder to the workspace (mirrors checkPendingCopilotAction()'s
     * pattern for the same kind of reload).
     */
    private checkPendingSkillGenerationSetup(): void {
        try {
            const pending = this._context.globalState.get<any>('pendingSkillGenerationSetup');
            if (!pending) {
                return;
            }

            // Adding an unfamiliar folder to the workspace can trigger VS
            // Code's own "Do you trust the authors..." prompt, and granting
            // trust can cause its OWN separate extension-host reload after
            // this one. Only clear this marker once it's stale — while
            // fresh, leave it in place so a follow-up reload from that trust
            // prompt can also find it and re-arm the watch (idempotent, so
            // re-running this is harmless).
            const age = Date.now() - (pending.timestamp || 0);
            if (age > 90000) {
                logger.info(`${this.logPrefix} Pending skill-generation setup is stale (${age}ms old), clearing`);
                this._context.globalState.update('pendingSkillGenerationSetup', undefined);
                return;
            }

            if (fs.existsSync(pending.pipelineFolderPath)) {
                this.armSkillFolderUploadWatch(
                    pending.pipelineFolderPath,
                    pending.pipelineId,
                    pending.pipelineName,
                    pending.organization
                );
            }

            // Clean up shortly after, but only if nothing interrupts this —
            // if another reload (e.g. from a trust-prompt grant) happens
            // first, this scheduled clear never runs and the marker survives
            // for that reload to consume too.
            setTimeout(() => {
                this._context.globalState.update('pendingSkillGenerationSetup', undefined);
            }, 5000);
        } catch (error) {
            logger.warn(`${this.logPrefix} Error resuming pending skill-generation setup:`, error);
        }
    }

    /**
     * Debounced watch on `folderPath`: once nothing has changed in it for a
     * few seconds, zip its CURRENT, COMPLETE contents and upload the whole
     * thing (isVibeStudio=true, since it has no pipeline metadata.json yet —
     * the same bypass the web app's Vibe Studio/AI-chat-coder persist flows
     * already use). The watch stays armed indefinitely and re-uploads on
     * every subsequent settle, since the backend's folder/upload endpoint
     * does a full delete-and-replace for this pipeline (not an incremental
     * add) — deleting the local copy or handing off to "Edit Code"'s
     * per-file sync after only the first upload would mean any file the
     * coding agent creates afterward gets fileId=0 in that per-file path
     * and silently fails to persist while still showing a success toast.
     * Always re-zipping the whole (never-deleted) local folder avoids that
     * entirely — each upload is a complete, accurate snapshot.
     */
    private armSkillFolderUploadWatch(folderPath: string, pipelineId: string, pipelineName: string, organization: string): void {
        this.disposeSkillFolderUploadWatch();

        const scheduleUpload = () => {
            const state = this.skillFolderUploadWatch;
            if (!state) {
                return;
            }
            if (state.debounceTimer) {
                clearTimeout(state.debounceTimer);
            }
            state.debounceTimer = setTimeout(() => {
                this.uploadSkillGenerationFolder(pipelineName, organization, folderPath).catch(error => {
                    logger.error(`${this.logPrefix} Skill-attach folder upload failed:`, error);
                });
            }, PipelineAgentProvider.AUTO_UPLOAD_DEBOUNCE_MS);
        };

        const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(folderPath, '**/*'));
        const disposables: vscode.Disposable[] = [
            watcher,
            watcher.onDidCreate(scheduleUpload),
            watcher.onDidChange(scheduleUpload),
            watcher.onDidDelete(scheduleUpload)
        ];

        this.skillFolderUploadWatch = { folderPath, disposables };
        this._context.subscriptions.push(...disposables);

        logger.info(`${this.logPrefix} Armed skill-attach folder upload watch for pipeline ${pipelineId}: ${folderPath}`);
    }

    private disposeSkillFolderUploadWatch(): void {
        const state = this.skillFolderUploadWatch;
        if (!state) {
            return;
        }
        if (state.debounceTimer) {
            clearTimeout(state.debounceTimer);
        }
        state.disposables.forEach(d => d.dispose());
        this.skillFolderUploadWatch = undefined;
    }

    /**
     * Zip the pipeline's generation folder's CURRENT, COMPLETE contents and
     * upload it. The local folder is left in place (never deleted) and the
     * watch stays armed — see armSkillFolderUploadWatch() for why: the
     * backend replaces this pipeline's server files wholesale on every
     * call, so every upload must include everything, not just what changed
     * since the last one.
     */
    private async uploadSkillGenerationFolder(
        pipelineName: string,
        organization: string,
        folderPath: string
    ): Promise<void> {
        if (!fs.existsSync(folderPath)) {
            return;
        }
        const items = fs.readdirSync(folderPath);
        if (!items.length) {
            return; // nothing generated yet — keep waiting
        }

        // Defensively exclude the pipeline's own JSON config file, in case
        // this folder was ever also used by "Open Copilot" for the same
        // pipeline (which writes {pipelineName}_{org}.json here) — that file
        // is a separate record, not ADK code, and must never ride along in
        // this zip. Also exclude ".essedum" — once this folder becomes the
        // workspace root, getSkillsContextFilePath() anchors the "Attached
        // Skills" context file (.essedum/attached-skills-context.md) inside
        // this exact same folder, and that's this extension's own scratch
        // file, never ADK code either.
        const jsonFileName = `${pipelineName}_${organization}.json`;
        const excludedTopLevel = new Set([jsonFileName, '.essedum']);
        let fileCount = 0;

        try {
            const AdmZip = require('adm-zip');
            const zip = new AdmZip();

            const countFiles = (dirPath: string, isRoot: boolean) => {
                for (const entry of fs.readdirSync(dirPath)) {
                    if (isRoot && excludedTopLevel.has(entry)) {
                        continue;
                    }
                    const fullPath = path.join(dirPath, entry);
                    if (fs.statSync(fullPath).isDirectory()) {
                        countFiles(fullPath, false);
                    } else {
                        fileCount++;
                    }
                }
            };
            countFiles(folderPath, true);

            if (fileCount === 0) {
                return; // nothing to upload yet (only excluded items, if anything)
            }

            for (const item of items) {
                if (excludedTopLevel.has(item)) {
                    continue;
                }
                const itemPath = path.join(folderPath, item);
                if (fs.statSync(itemPath).isDirectory()) {
                    zip.addLocalFolder(itemPath, item);
                } else {
                    zip.addLocalFile(itemPath);
                }
            }

            const zipBuffer = zip.toBuffer();
            const zipFileName = `${pipelineName}_${organization}.zip`;
            await this._pipelineAgentService.uploadFolderZip(pipelineName, zipBuffer, zipFileName, undefined, true, 'App');
        } catch (error: any) {
            // Only a failure of the actual save-to-server belongs here.
            logger.error(`${this.logPrefix} Skill-attach folder upload failed for ${pipelineName}:`, error);
            this.sendMessageToWebview({
                command: 'actionError',
                message: `Auto-save to server failed: ${error.message}`
            });
            return;
        }

        // The save genuinely succeeded — the whole current folder was just
        // replaced server-side with exactly what's on disk. Nothing is
        // deleted locally and the watch is left armed (it's still in
        // skillFolderUploadWatch, untouched) so the next batch of changes
        // triggers another full re-upload the same way.
        logger.info(`${this.logPrefix} Skill-attach folder upload complete for ${pipelineName}: ${fileCount} file(s)`);
        this.sendMessageToWebview({
            command: 'actionComplete',
            message: `✓ Saved ${fileCount} file${fileCount === 1 ? '' : 's'} to server`
        });
    }

    /**
     * Delete the "Attached Skills" context file (and close its editor tab if
     * open) once no skills remain attached.
     */
    private async removeSkillsContextFile(): Promise<void> {
        const filePath = this.attachedSkillsContextPath;
        if (!filePath) {
            return;
        }
        this.attachedSkillsContextPath = undefined;

        try {
            const targetUri = vscode.Uri.file(filePath);
            const openEditors = vscode.window.tabGroups.all.flatMap(group => group.tabs);
            for (const tab of openEditors) {
                if (tab.input instanceof vscode.TabInputText && tab.input.uri.fsPath === targetUri.fsPath) {
                    await vscode.window.tabGroups.close(tab);
                    break;
                }
            }
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                logger.info(`${this.logPrefix} Deleted skills context file: ${filePath}`);
            }
        } catch (error) {
            logger.warn(`${this.logPrefix} Failed to delete skills context file:`, error);
        }
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

            // Close any virtual JSON files that are open in the editor
            const virtualJsonUri = vscode.Uri.parse(`essedum:///${pipelineName}/${jsonFileName}`);
            const openEditors = vscode.window.tabGroups.all.flatMap(group => group.tabs);
            for (const tab of openEditors) {
                if (tab.input instanceof vscode.TabInputText) {
                    if (tab.input.uri.toString() === virtualJsonUri.toString()) {
                        // Close this tab
                        await vscode.window.tabGroups.close(tab);
                        logger.info(`${this.logPrefix} Closed virtual JSON file: ${virtualJsonUri.toString()}`);
                        break;
                    }
                }
            }

            // Use pipeline-specific folder
            const pipelineFolderPath = this.getPipelineFolderPath(pipelineId);

            // Read prompt file
            const promptFilePath = path.join(this._context.extensionPath, CONSTANTS.PROMPT_CONFIG.FOLDER, CONSTANTS.PROMPT_CONFIG.FILENAME);
            if (!fs.existsSync(promptFilePath)) {
                throw new Error('Prompt file not found');
            }

            const promptContent = fs.readFileSync(promptFilePath, 'utf-8');
            if (!promptContent || promptContent.trim().length === 0) {
                throw new Error('Prompt file is empty');
            }

            // Add the folder to workspace explorer
            const folderUri = vscode.Uri.file(pipelineFolderPath);
            const workspaceFoldersCount = vscode.workspace.workspaceFolders?.length || 0;
            const pipelineDisplayName = card.alias || card.name || pipelineId;

            // Check if folder is already in workspace
            const folderExists = vscode.workspace.workspaceFolders?.some(
                folder => folder.uri.fsPath === pipelineFolderPath
            );

            if (!folderExists) {
                // Store the copilot action state before workspace reload
                await this._context.globalState.update('pendingCopilotAction', {
                    pipelineId: pipelineId,
                    pipelineName: pipelineName,
                    promptContent: promptContent,
                    pipelineFolderPath: pipelineFolderPath,
                    timestamp: Date.now()
                });
                logger.info(`${this.logPrefix} Stored pending copilot action before workspace reload`);

                // Add the folder to workspace (this will cause extension reload)
                const added = vscode.workspace.updateWorkspaceFolders(
                    workspaceFoldersCount,
                    0,
                    { uri: folderUri, name: pipelineDisplayName }
                );

                if (added) {
                    logger.info(`${this.logPrefix} Workspace folder added, extension will reload...`);
                }
                // Execution will stop here due to extension reload
                return;
            } else {
                logger.info(`${this.logPrefix} Folder already in workspace`);
            }

            // Open Copilot Chat panel
            logger.info(`${this.logPrefix} Opening Copilot Chat panel...`);
            await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
            await new Promise(resolve => setTimeout(resolve, 500));

            // Copy prompt to clipboard
            await vscode.env.clipboard.writeText(promptContent);

            vscode.window.showInformationMessage(
                `Copilot Chat opened! Paste the prompt (Ctrl+V) to generate ADK code in ${pipelineFolderPath}`,
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
    /**
     * Handle Upload from GitHub action
     */
    private async handleUploadFromGitHub(pipelineId: string): Promise<void> {
        try {
            // Validate authentication
            const isAuthenticated = await this.validateAndRefreshAuth();
            if (!isAuthenticated) {
                this.sendMessageToWebview({
                    command: 'actionError',
                    message: 'Authentication required. Please login again.'
                });
                return;
            }

            const card = this.allCards.find(c => c.pipelineId === pipelineId);
            if (!card) {
                this.sendMessageToWebview({ command: 'actionError', message: 'Pipeline agent not found' });
                return;
            }

            const pipelineName = card.name || card.alias || pipelineId;

            // Prompt for GitHub repository URL
            const repoUrl = await vscode.window.showInputBox({
                prompt: 'Enter GitHub Repository URL',
                placeHolder: 'https://github.com/owner/repository',
                validateInput: (value) => {
                    if (!value) { return 'Repository URL is required'; }
                    // Use URL parser only — no substring checks to avoid incomplete sanitization
                    try {
                        const parsed = new URL(value);
                        if (parsed.protocol !== 'https:') {
                            return 'Please enter a valid HTTPS GitHub repository URL';
                        }
                        if (parsed.username || parsed.password) {
                            return 'URL should not contain credentials';
                        }
                        if (parsed.hostname !== 'github.com') {
                            return 'Please enter a valid GitHub repository URL';
                        }
                    } catch {
                        return 'Please enter a valid GitHub repository URL';
                    }
                    return null;
                }
            });

            if (!repoUrl) {
                return; // User cancelled
            }

            // Extract owner/repo from URL
            const repoName = this.extractRepoFromUrl(repoUrl);
            if (!repoName) {
                vscode.window.showErrorMessage('Invalid GitHub repository URL');
                return;
            }

            // Get branches
            this.sendMessageToWebview({ command: 'actionStatus', message: 'Fetching branches...' });
            const branches = await this._pipelineAgentService.getGitHubBranches(repoName);

            if (!branches || branches.length === 0) {
                vscode.window.showErrorMessage('No branches found or repository is not accessible');
                return;
            }

            // Prompt for branch selection
            const selectedBranch = await vscode.window.showQuickPick(branches, {
                placeHolder: 'Select a branch to pull from',
                canPickMany: false
            });

            if (!selectedBranch) {
                return; // User cancelled
            }

            // Pull files from GitHub and upload
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Uploading from GitHub: ${repoName}...`,
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: 'Pulling files from GitHub...' });

                // Pull files from GitHub
                const pulledFiles = await this._pipelineAgentService.pullFromGitHub({
                    repoUrl: repoUrl,
                    branch: selectedBranch
                });

                progress.report({ increment: 40, message: 'Creating ZIP archive...' });

                // Create ZIP from pulled files
                const zipFileName = `${repoName.split('/')[1]}-${selectedBranch}-${Date.now()}.zip`;
                const zipBuffer = await this.createZipFromGitHubFiles(pulledFiles.files);

                progress.report({ increment: 70, message: 'Uploading to server...' });

                // Upload ZIP to server
                await this._pipelineAgentService.uploadFolderZip(pipelineName, zipBuffer, zipFileName);

                progress.report({ increment: 100, message: 'Complete!' });

                const sizeMB = (zipBuffer.length / (1024 * 1024)).toFixed(2);
                vscode.window.showInformationMessage(`✓ Files uploaded successfully from GitHub (${sizeMB} MB)`);
                this.sendMessageToWebview({ 
                    command: 'actionComplete', 
                    message: `✓ Uploaded from ${repoName} (${selectedBranch})` 
                });

                // Refresh ADK files status
                try {
                    const adkFiles = await this._pipelineAgentService.listAdkFiles(pipelineName);
                    if (this._view) {
                        this._view.webview.postMessage({
                            command: CONSTANTS.CLIENT_COMMANDS.ADK_FILES_STATUS,
                            hasFiles: adkFiles && adkFiles.length > 0,
                            fileCount: adkFiles?.length || 0
                        });
                    }
                } catch (statusError) {
                    console.warn(`${this.logPrefix} Could not check ADK files status:`, statusError);
                }
            });

        } catch (error: any) {
            console.error(`${this.logPrefix} Error uploading from GitHub:`, error);
            this.sendMessageToWebview({ 
                command: 'actionError', 
                message: `GitHub upload failed: ${error.message}` 
            });
        }
    }

    /**
     * Extract owner/repo from GitHub URL
     */
    private extractRepoFromUrl(url: string): string | null {
        try {
            url = url.trim().replace(/\/+$/, '');
            const patterns = [
                /github\.com\/([^\/]+)\/([^\/]+)/i,
                /^([^\/]+)\/([^\/]+)$/
            ];

            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) {
                    const owner = match[1];
                    const repo = match[2].replace(/\.git$/, '');
                    return `${owner}/${repo}`;
                }
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Create ZIP file from GitHub pulled files
     */
    private async createZipFromGitHubFiles(files: any[]): Promise<Buffer> {
        const archiver = require('archiver');
        const { Readable } = require('stream');

        return new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            const archive = archiver('zip', { zlib: { level: 9 } });

            // Collect data chunks
            archive.on('data', (chunk: Buffer) => chunks.push(chunk));
            archive.on('end', () => resolve(Buffer.concat(chunks)));
            archive.on('error', reject);

            // Add each file to the archive
            for (const file of files) {
                const filePath = file.path || file.fileName || 'unknown';
                const content = file.content || '';
                
                // Create a readable stream from content
                const stream = Readable.from([content]);
                archive.append(stream, { name: filePath });
            }

            archive.finalize();
        });
    }

    /**
     * Handle View ADK action - Opens ADK files in workspace Explorer with auto-save to server
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
            const pipelineDisplayName = card.alias || card.name || pipelineId;

            let adkFilesCount = 0;  // Track file count for notification

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

                adkFilesCount = adkFiles.length;  // Store count for later use

                progress.report({ increment: 30, message: `Creating folder for ${adkFiles.length} files...` });

                // Use the same folder naming as Open Copilot for consistency
                const adkFolderPath = this.getPipelineFolderPath(pipelineId);

                // Check if folder is already in workspace
                const folderUri = vscode.Uri.file(adkFolderPath);
                const existingWorkspaceFolder = vscode.workspace.workspaceFolders?.find(
                    folder => folder.uri.fsPath === adkFolderPath
                );

                // Create folder if it doesn't exist
                if (!fs.existsSync(adkFolderPath)) {
                    fs.mkdirSync(adkFolderPath, { recursive: true });
                    logger.info(`${this.logPrefix} Created new folder: ${adkFolderPath}`);
                } else {
                    logger.info(`${this.logPrefix} Using existing folder: ${adkFolderPath}`);
                }

                this.currentAdkFolderPath = adkFolderPath;
                this.adkFilesCache.set(pipelineName, adkFiles);

                progress.report({ increment: 50, message: 'Saving files...' });

                // Save all files to folder (overwrites existing files)
                for (const file of adkFiles) {
                    const fullPath = path.join(adkFolderPath, file.filePath);
                    const dir = path.dirname(fullPath);

                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }

                    fs.writeFileSync(fullPath, file.filescript || '', 'utf-8');
                }

                progress.report({ increment: 70, message: 'Storing context...' });

                // Get current base URL from storage - try multiple keys
                let baseUrl = this._context.globalState.get<string>(STORAGE_KEYS.BASE_URL);
                if (!baseUrl) {
                    // Try alternate key
                    baseUrl = this._context.globalState.get<string>('baseUrl');
                }
                if (!baseUrl) {
                    // Import and use the current value from api-config
                    const { getBaseUrl } = require('../../constants/api-config');
                    baseUrl = getBaseUrl();
                }

                logger.info(`${this.logPrefix} Retrieved base URL for storage: ${baseUrl}`);

                // Verify we have a valid base URL
                if (!baseUrl) {
                    logger.error(`${this.logPrefix} ⚠️ WARNING: Base URL is empty! This will cause API calls to fail.`);
                    vscode.window.showWarningMessage('Base URL not configured. Please ensure network is selected.');
                }

                // Create file ID mapping (filePath -> id)
                const fileIdMap: Record<string, number> = {};
                for (const file of adkFiles) {
                    fileIdMap[file.filePath] = file.id;
                }

                // CRITICAL: Store ADK context BEFORE adding workspace folder
                // This ensures context survives the extension reload that happens when workspace changes
                const contextData = {
                    pipelineName: pipelineName,
                    pipelineId: pipelineId,
                    organization: this.organization,
                    project: this.project,
                    role: this.role,
                    token: this._token,
                    baseUrl: baseUrl || '',
                    folderPath: adkFolderPath,
                    fileIdMap: fileIdMap,
                    timestamp: Date.now()
                };

                logger.info(`${this.logPrefix} ⚡ Storing ADK context BEFORE workspace update:`, JSON.stringify(contextData, null, 2));

                await this._context.globalState.update('adkContext', contextData);

                // Verify it was stored
                const verifyContext = this._context.globalState.get('adkContext');
                logger.info(`${this.logPrefix} ✅ Verified stored context:`, JSON.stringify(verifyContext, null, 2));

                if (!verifyContext) {
                    logger.error(`${this.logPrefix} ⚠️ CRITICAL: Context was not stored properly!`);
                    throw new Error('Failed to store ADK context');
                }

                progress.report({ increment: 80, message: 'Adding to workspace...' });

                // Only add to workspace if not already present
                if (!existingWorkspaceFolder) {
                    const workspaceFoldersCount = vscode.workspace.workspaceFolders?.length || 0;

                    // Add the ADK folder to workspace (shows in Explorer) with pipeline alias
                    const added = vscode.workspace.updateWorkspaceFolders(
                        workspaceFoldersCount,
                        0,
                        { uri: folderUri, name: pipelineDisplayName }
                    );

                    if (added) {
                        logger.info(`${this.logPrefix} Added folder to workspace`);
                        // Give VS Code a moment to update the workspace
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } else {
                        logger.warn(`${this.logPrefix} Failed to add ADK folder to workspace`);
                    }
                } else {
                    logger.info(`${this.logPrefix} Folder already in workspace, skipping add`);
                }

                // Focus the Explorer view to show the folder
                await vscode.commands.executeCommand('workbench.view.explorer');

                // Reveal the folder in Explorer
                try {
                    await vscode.commands.executeCommand('revealInExplorer', folderUri);
                } catch (err) {
                    logger.warn(`${this.logPrefix} Could not reveal in explorer:`, err);
                }

                progress.report({ increment: 90, message: 'Setting up auto-save...' });

                // Context is already stored before workspace update (to survive extension reload)
                // Just setup the file watcher now
                this.setupAdkFolderWatcher(adkFolderPath, pipelineName);

                progress.report({ increment: 100, message: 'Complete!' });
            });

            // Show notification AFTER progress dialog closes with option to save workspace
            await new Promise(resolve => setTimeout(resolve, 300));

            const workspaceFile = vscode.workspace.workspaceFile;
            if (!workspaceFile || workspaceFile.scheme === 'untitled') {
                // Prompt user to save workspace
                vscode.window.showInformationMessage(
                    `Files loaded in Explorer as "${pipelineDisplayName}". Save the workspace to persist this name.`,
                    'Save Workspace As...',
                    'Not Now'
                ).then(selection => {
                    if (selection === 'Save Workspace As...') {
                        vscode.commands.executeCommand('workbench.action.saveWorkspaceAs');
                    }
                });
            } else {
                vscode.window.showInformationMessage(
                    `Workspace "${pipelineDisplayName}" loaded. You can view and edit all project files in the Explorer.`,
                    'Open Explorer'
                ).then(selection => {
                    if (selection === 'Open Explorer') {
                        vscode.commands.executeCommand('workbench.view.explorer');
                    }
                });
            }

            this.sendMessageToWebview({
                command: 'actionComplete',
                message: `✓ ${adkFilesCount} files opened`
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
            // Validate and refresh authentication before proceeding
            const isAuthenticated = await this.validateAndRefreshAuth();

            if (!isAuthenticated) {
                this.sendMessageToWebview({
                    command: 'actionError',
                    message: 'Authentication required. Please login again.'
                });
                return;
            }

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
            // Validate and refresh authentication before proceeding
            const isAuthenticated = await this.validateAndRefreshAuth();

            if (!isAuthenticated) {
                this.sendMessageToWebview({
                    command: 'actionError',
                    message: 'Authentication required. Please login again.'
                });
                return;
            }

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

            // Update open editor if exists (only if user already has it open)
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

            // Fetch directly from API (no disk cache needed)
            const fileResponse = await this._pipelineAgentService.readPipelineFile(pipelineName, jsonFileName);
            if (!fileResponse.data) {
                throw new Error('No data received from server');
            }
            const textDecoder = new TextDecoder('utf-8');
            const jsonContent = textDecoder.decode(fileResponse.data);

            await vscode.env.clipboard.writeText(jsonContent);

            vscode.window.showInformationMessage('✓ Configuration copied to clipboard');
            this.sendMessageToWebview({ command: 'actionComplete', message: '✓ Copied to clipboard' });

        } catch (error: any) {
            console.error(`${this.logPrefix} Error copying JSON:`, error);
            this.sendMessageToWebview({ command: 'actionError', message: `Failed to copy: ${error.message}` });
        }
    }

    /**
     * Create ZIP file from pipeline-specific directory
     */
    private async createZipFromCache(pipelineName: string, adkFiles: string[], pipelineFolderPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const zipFileName = `${pipelineName}_adk.zip`;
            const zipPath = path.join(pipelineFolderPath, zipFileName);

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
                const filePath = path.join(pipelineFolderPath, fileName);
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
    /**
     * Check for and execute pending copilot action after extension reload
     */
    private async checkPendingCopilotAction(): Promise<void> {
        try {
            const pendingAction = this._context.globalState.get<any>('pendingCopilotAction');
            
            if (!pendingAction) {
                return;
            }

            // Check if the action is recent (within last 30 seconds to avoid stale actions)
            const timeSinceAction = Date.now() - pendingAction.timestamp;
            if (timeSinceAction > 30000) {
                logger.info(`${this.logPrefix} Pending copilot action is stale (${timeSinceAction}ms old), ignoring`);
                await this._context.globalState.update('pendingCopilotAction', undefined);
                return;
            }

            logger.info(`${this.logPrefix} Found pending copilot action, resuming...`);

            // Clear the pending action
            await this._context.globalState.update('pendingCopilotAction', undefined);

            // Give VS Code time to fully initialize after reload
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Focus the Explorer view to show the newly added workspace folder
            await vscode.commands.executeCommand('workbench.view.explorer');
            await new Promise(resolve => setTimeout(resolve, 300));

            // Open Copilot Chat panel
            logger.info(`${this.logPrefix} Opening Copilot Chat panel...`);
            await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
            await new Promise(resolve => setTimeout(resolve, 500));

            // Copy prompt to clipboard
            await vscode.env.clipboard.writeText(pendingAction.promptContent);

            vscode.window.showInformationMessage(
                `Copilot Chat opened! Paste the prompt (Ctrl+V) to generate ADK code in ${pendingAction.pipelineFolderPath}`,
                'Got it'
            );

            this.sendMessageToWebview({ command: 'actionComplete', message: '✓ Copilot opened successfully' });
            this.sendMessageToWebview({ command: 'enableUpload' });

            logger.info(`${this.logPrefix} ✓ Pending copilot action completed successfully`);

        } catch (error: any) {
            logger.error(`${this.logPrefix} Error executing pending copilot action:`, error);
            // Clear the pending action on error
            await this._context.globalState.update('pendingCopilotAction', undefined);
        }
    }

    /**
     * Register global save handler for ADK files
     * This ensures ALL file saves are caught, regardless of how the folder was added
     */
    private registerGlobalAdkSaveHandler(): void {
        const globalSaveDisposable = vscode.workspace.onDidSaveTextDocument(async (document) => {
            try {
                logger.info(`${this.logPrefix} === GLOBAL SAVE HANDLER ===`);
                logger.info(`${this.logPrefix} File saved: ${document.uri.fsPath}`);

                // Debug: List all keys in globalState
                const allKeys = this._context.globalState.keys();
                logger.info(`${this.logPrefix} Available context keys: ${JSON.stringify(allKeys)}`);

                // Check if this file is in an ADK folder
                const adkContext = this._context.globalState.get<any>('adkContext');

                logger.info(`${this.logPrefix} ADK context retrieved:`, JSON.stringify(adkContext, null, 2));

                if (adkContext && adkContext.folderPath) {
                    const normalizedDocPath = path.normalize(document.uri.fsPath).toLowerCase();
                    const normalizedAdkPath = path.normalize(adkContext.folderPath).toLowerCase();

                    logger.info(`${this.logPrefix} ADK folder path: ${normalizedAdkPath}`);
                    logger.info(`${this.logPrefix} Document path: ${normalizedDocPath}`);
                    logger.info(`${this.logPrefix} Is in ADK folder: ${normalizedDocPath.startsWith(normalizedAdkPath)}`);

                    if (normalizedDocPath.startsWith(normalizedAdkPath)) {
                        logger.info(`${this.logPrefix} 🎯 ADK FILE DETECTED - Triggering save to server`);
                        await this.handleAdkFileSaveToServer(document, adkContext.pipelineName, adkContext.folderPath);
                    } else {
                        logger.info(`${this.logPrefix} Not an ADK file - skipping`);
                    }
                } else {
                    logger.warn(`${this.logPrefix} ⚠️ No ADK context found - skipping`);
                    logger.warn(`${this.logPrefix} This means the context was not stored when ADK folder was opened`);
                }
            } catch (error) {
                logger.error(`${this.logPrefix} Error in global save handler:`, error);
            }
        });

        this._context.subscriptions.push(globalSaveDisposable);
        logger.info(`${this.logPrefix} Global ADK save handler registered`);
    }

    /**
     * Restore ADK folder watcher from stored context (e.g., after extension reload)
     */
    private restoreAdkFolderWatcher(): void {
        const adkContext = this._context.globalState.get<any>('adkContext');

        if (adkContext && adkContext.folderPath && adkContext.pipelineName) {
            logger.info(`${this.logPrefix} Restoring ADK folder watcher from context`);
            logger.info(`${this.logPrefix} Pipeline: ${adkContext.pipelineName}`);
            logger.info(`${this.logPrefix} Folder: ${adkContext.folderPath}`);

            // Check if the folder still exists
            if (fs.existsSync(adkContext.folderPath)) {
                this.setupAdkFolderWatcher(adkContext.folderPath, adkContext.pipelineName);
                logger.info(`${this.logPrefix} ✓ ADK folder watcher restored successfully`);
            } else {
                logger.warn(`${this.logPrefix} ADK folder no longer exists: ${adkContext.folderPath}`);
            }
        } else {
            logger.info(`${this.logPrefix} No ADK context found - watcher will be set up when ADK folder is opened`);
        }
    }

    /**
     * Setup document save handler for ADK files in virtual file system
     */
    private setupAdkSaveHandler(pipelineName: string): void {
        // Create a save handler that watches for document saves
        const saveDisposable = vscode.workspace.onDidSaveTextDocument(async (document) => {
            // Check if this document is an ADK file (essedum://adk/{pipelineName}/...)
            if (document.uri.scheme === 'essedum' &&
                document.uri.path.startsWith(`/adk/${pipelineName}/`)) {
                await this.handleAdkFileSave(document, pipelineName);
            }
        });

        this._context.subscriptions.push(saveDisposable);
    }

    /**
     * Handle ADK file save - sync to server using individual updateAdkFile API
     */
    private async handleAdkFileSave(document: vscode.TextDocument, pipelineName: string): Promise<void> {
        try {
            logger.info(`${this.logPrefix} Saving ADK file: ${document.uri.toString()}`);

            // Check if file system provider is available
            if (!this._fileSystemProvider) {
                throw new Error('File system provider not found');
            }

            // Get the file from the virtual file system
            const file = this._fileSystemProvider.getAdkFilesForPipeline(pipelineName)
                .find(f => f.uri.toString() === document.uri.toString());

            if (!file) {
                throw new Error('File not found in virtual file system');
            }

            // Save individual file using the updateAdkFile API
            await this._fileSystemProvider.saveIndividualAdkFile(file);

            // Show success message
            const fileName = document.uri.path.split('/').pop();
            vscode.window.showInformationMessage(`✓ ${fileName} saved to server`);

        } catch (error: any) {
            logger.error(`${this.logPrefix} Error syncing file:`, error);
            vscode.window.showErrorMessage(`Failed to sync file: ${error.message}`);
        }
    }

    private setupAdkFolderWatcher(adkFolderPath: string, pipelineName: string): void {
        if (this.adkFolderWatcher) {
            this.adkFolderWatcher.dispose();
        }

        // Reset change tracking for new ADK folder
        this.changedFiles.clear();
        this.folderHasChanges = false;
        vscode.commands.executeCommand('setContext', 'essedum.folderHasChanges', false);

        // Normalize path for consistent comparison
        const normalizedAdkPath = path.normalize(adkFolderPath).toLowerCase();

        logger.info(`${this.logPrefix} Setting up ADK folder watcher`);
        logger.info(`${this.logPrefix} Watching path: ${normalizedAdkPath}`);
        logger.info(`${this.logPrefix} Pipeline: ${pipelineName}`);

        const pattern = new vscode.RelativePattern(adkFolderPath, '**/*');
        this.adkFolderWatcher = vscode.workspace.createFileSystemWatcher(pattern);

        // Watch for file saves - use API to save to server (handles both edits and new files)
        const saveDisposable = vscode.workspace.onDidSaveTextDocument(async (document) => {
            const normalizedDocPath = path.normalize(document.uri.fsPath).toLowerCase();

            logger.info(`${this.logPrefix} File saved: ${normalizedDocPath}`);
            logger.info(`${this.logPrefix} Checking if starts with: ${normalizedAdkPath}`);

            if (normalizedDocPath.startsWith(normalizedAdkPath)) {
                logger.info(`${this.logPrefix} Match! Syncing to server...`);
                await this.handleAdkFileSaveToServer(document, pipelineName, adkFolderPath);

                // Track change
                this.trackFileChange(document.uri.fsPath, adkFolderPath);
            } else {
                logger.info(`${this.logPrefix} No match - file not in ADK folder`);
            }
        });

        // Watch for file creations (via Explorer "New File" button)
        this.adkFolderWatcher.onDidCreate(async (uri) => {
            logger.info(`${this.logPrefix} File created: ${uri.fsPath}`);

            // Track change
            this.trackFileChange(uri.fsPath, adkFolderPath);

            // Wait a bit for the file to be created and opened
            setTimeout(async () => {
                try {
                    const document = await vscode.workspace.openTextDocument(uri);
                    // Show message that file will be synced on first save
                    const fileName = path.basename(uri.fsPath);
                    vscode.window.showInformationMessage(`ℹ ${fileName} created. Press Ctrl+S to upload to server.`);
                } catch (err) {
                    logger.warn(`${this.logPrefix} Could not open created file:`, err);
                }
            }, 100);
        });

        // Watch for file deletions
        this.adkFolderWatcher.onDidDelete(async (uri) => {
            logger.info(`${this.logPrefix} File deleted: ${uri.fsPath}`);

            // Track change
            this.trackFileChange(uri.fsPath, adkFolderPath);

            // Note: Server delete API call removed - file deleted locally only
            // await this.handleAdkFileDelete(uri, pipelineName, adkFolderPath);
        });

        this._context.subscriptions.push(this.adkFolderWatcher, saveDisposable);
        logger.info(`${this.logPrefix} ADK folder watcher setup complete`);
    }

    /**
     * Handle ADK file save - sync to server using updateAdkFile API
     */
    private async handleAdkFileSaveToServer(document: vscode.TextDocument, pipelineName: string, adkFolderPath: string): Promise<void> {
        try {
            const relativePath = path.relative(adkFolderPath, document.uri.fsPath).replace(/\\/g, '/');
            const fileContent = document.getText();

            logger.info(`${this.logPrefix} ==========================================`);
            logger.info(`${this.logPrefix} Saving file to server`);
            logger.info(`${this.logPrefix} Pipeline: ${pipelineName}`);
            logger.info(`${this.logPrefix} Relative path: ${relativePath}`);
            logger.info(`${this.logPrefix} Content length: ${fileContent.length} bytes`);

            // Retrieve ADK context from workspace state
            const adkContext = this._context.globalState.get<any>('adkContext');
            if (adkContext) {
                logger.info(`${this.logPrefix} Using stored ADK context:`);
                logger.info(`${this.logPrefix}   - Pipeline: ${adkContext.pipelineName}`);
                logger.info(`${this.logPrefix}   - Organization: ${adkContext.organization}`);
                logger.info(`${this.logPrefix}   - Base URL: ${adkContext.baseUrl}`);
                logger.info(`${this.logPrefix}   - Has token: ${!!adkContext.token}`);
                logger.info(`${this.logPrefix}   - Has project: ${!!adkContext.project}`);
                logger.info(`${this.logPrefix}   - Has role: ${!!adkContext.role}`);
                logger.info(`${this.logPrefix}   - File ID map: ${JSON.stringify(adkContext.fileIdMap || {})}`);

                // Update context state keys for PipelineAgentService to use
                await this._context.globalState.update(STORAGE_KEYS.ACCESS_TOKEN, adkContext.token);
                await this._context.globalState.update(STORAGE_KEYS.PROJECT, adkContext.project);
                await this._context.globalState.update(STORAGE_KEYS.ROLE, adkContext.role);
                await this._context.globalState.update(STORAGE_KEYS.ORGANIZATION, adkContext.organization);

                // CRITICAL: Restore base URL from context
                if (adkContext.baseUrl) {
                    await this._context.globalState.update(STORAGE_KEYS.BASE_URL, adkContext.baseUrl);
                    // Also set it in the API config
                    const { setBaseUrl } = require('../../constants/api-config');
                    setBaseUrl(adkContext.baseUrl);
                    logger.info(`${this.logPrefix}   - Base URL restored: ${adkContext.baseUrl}`);
                }
            } else {
                logger.warn(`${this.logPrefix} No ADK context found, using current values`);
            }

            logger.info(`${this.logPrefix} ==========================================`);

            // Refresh service auth data before API call
            this._pipelineAgentService.refreshAuthData();

            // Get file ID from stored mapping
            const fileId = adkContext?.fileIdMap?.[relativePath] || 0;
            if (fileId === 0) {
                logger.warn(`${this.logPrefix} ⚠️ No file ID found for ${relativePath}, using 0 (may fail)`);
            } else {
                logger.info(`${this.logPrefix} Using file ID: ${fileId} for ${relativePath}`);
            }

            // Use the updateAdkFile API
            await this._pipelineAgentService.updateAdkFile(pipelineName, relativePath, fileContent, fileId);

            logger.info(`${this.logPrefix} API call completed successfully`);

            // Update cache
            const cachedFiles = this.adkFilesCache.get(pipelineName);
            if (cachedFiles) {
                const fileIndex = cachedFiles.findIndex(f => f.filePath === relativePath);
                if (fileIndex !== -1) {
                    cachedFiles[fileIndex].filescript = fileContent;
                    logger.info(`${this.logPrefix} Updated cache for file: ${relativePath}`);
                }
            }

            const fileName = path.basename(relativePath);
            vscode.window.showInformationMessage(`✓ ${fileName} saved to server`);

        } catch (error: any) {
            logger.error(`${this.logPrefix} ==========================================`);
            logger.error(`${this.logPrefix} Error saving file to server:`, error);
            logger.error(`${this.logPrefix} Error details:`, {
                message: error.message,
                stack: error.stack,
                response: error.response?.data
            });
            logger.error(`${this.logPrefix} ==========================================`);
            vscode.window.showErrorMessage(`Failed to save file: ${error.message}`);
        }
    }

    /**
     * Handle ADK file save - sync to server (old method for workspace folders)
     */
    private async handleAdkFileSaveOld(document: vscode.TextDocument, pipelineName: string, adkFolderPath: string): Promise<void> {
        try {
            const relativePath = path.relative(adkFolderPath, document.uri.fsPath).replace(/\\/g, '/');
            const fileContent = document.getText();

            const cachedFiles = this.adkFilesCache.get(pipelineName);
            if (!cachedFiles) { return; }

            const fileMetadata = cachedFiles.find(f => f.filePath === relativePath);
            if (!fileMetadata) { return; }

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
     * Handle ADK file delete - sync to server using file ID
     */
    private async handleAdkFileDelete(uri: vscode.Uri, pipelineName: string, adkFolderPath: string): Promise<void> {
        try {
            const relativePath = path.relative(adkFolderPath, uri.fsPath).replace(/\\/g, '/');

            logger.info(`${this.logPrefix} Deleting file from server: ${relativePath}`);

            // Retrieve and apply ADK context for API call
            const adkContext = this._context.globalState.get<any>('adkContext');
            if (adkContext) {
                await this._context.globalState.update(STORAGE_KEYS.ACCESS_TOKEN, adkContext.token);
                await this._context.globalState.update(STORAGE_KEYS.PROJECT, adkContext.project);
                await this._context.globalState.update(STORAGE_KEYS.ROLE, adkContext.role);
                await this._context.globalState.update(STORAGE_KEYS.ORGANIZATION, adkContext.organization);

                // Restore base URL
                if (adkContext.baseUrl) {
                    await this._context.globalState.update(STORAGE_KEYS.BASE_URL, adkContext.baseUrl);
                    const { setBaseUrl } = require('../../constants/api-config');
                    setBaseUrl(adkContext.baseUrl);
                }
            }

            // Refresh service auth data
            this._pipelineAgentService.refreshAuthData();

            // Get file ID from stored mapping
            const fileId = adkContext?.fileIdMap?.[relativePath];
            if (!fileId) {
                logger.error(`${this.logPrefix} No file ID found for ${relativePath}, cannot delete`);
                vscode.window.showErrorMessage(`Cannot delete file: File ID not found for ${path.basename(relativePath)}`);
                return;
            }

            logger.info(`${this.logPrefix} Deleting file with ID: ${fileId}`);

            // Use the deleteAdkFolderFile API with file ID (DELETE /api/aip/folder/delete/{id})
            await this._pipelineAgentService.deleteAdkFolderFile(fileId);

            // Update cache - remove from file ID map
            if (adkContext?.fileIdMap) {
                delete adkContext.fileIdMap[relativePath];
                await this._context.globalState.update('adkContext', adkContext);
            }

            // Update cached files list
            const cachedFiles = this.adkFilesCache.get(pipelineName);
            if (cachedFiles) {
                const fileIndex = cachedFiles.findIndex(f => f.filePath === relativePath);
                if (fileIndex !== -1) {
                    cachedFiles.splice(fileIndex, 1);
                }
            }

            const fileName = path.basename(relativePath);
            vscode.window.showInformationMessage(`✓ ${fileName} deleted from server`);

        } catch (error: any) {
            logger.error(`${this.logPrefix} Error deleting file from server:`, error);

            // Handle specific error cases
            if (error.status === 403 || error.code === 'ERR_BAD_REQUEST' && error.message?.includes('403')) {
                vscode.window.showErrorMessage(
                    `Permission denied: Your current role does not have permission to delete files. Please contact your administrator or delete the file from the web interface.`
                );
            } else {
                vscode.window.showErrorMessage(`Failed to delete file: ${error.message}`);
            }
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
     * Get pipeline-specific folder path
     * Creates a unique folder for each pipeline agent based on pipelineId
     */
    private getPipelineFolderPath(pipelineId: string): string {
        const pipelineFolderPath = path.join(this.cacheDir, `pipeline_${pipelineId}`);
        if (!fs.existsSync(pipelineFolderPath)) {
            fs.mkdirSync(pipelineFolderPath, { recursive: true });
            logger.info(`${this.logPrefix} Created pipeline-specific folder: ${pipelineFolderPath}`);
        }
        return pipelineFolderPath;
    }

    /**
     * Validate and refresh authentication if needed
     * Checks token validity and refreshes if expired/expiring
     * Returns true if authentication is valid, false otherwise
     */
    private async validateAndRefreshAuth(): Promise<boolean> {
        try {
            if (!this._authService) {
                logger.warn(`${this.logPrefix} Auth service not available`);
                return false;
            }

            // Check if token is valid
            const isValid = await this._authService.isTokenValid();

            if (!isValid) {
                logger.warn(`${this.logPrefix} Token is invalid or expired`);

                // Try to get stored tokens which will trigger refresh if needed
                try {
                    const tokens = await this._authService.getStoredTokens();

                    if (!tokens) {
                        logger.error(`${this.logPrefix} Failed to refresh tokens`);
                        vscode.window.showErrorMessage(
                            'Your session has expired. Please login again.',
                            'Login'
                        ).then(selection => {
                            if (selection === 'Login') {
                                vscode.commands.executeCommand('essedum.authenticate');
                            }
                        });
                        return false;
                    }

                    logger.info(`${this.logPrefix} Token refreshed successfully`);

                    // Refresh auth data and service
                    this.refreshAuthData();
                    this._pipelineAgentService.refreshAuthData();

                    return true;
                } catch (error: any) {
                    logger.error(`${this.logPrefix} Failed to refresh authentication:`, error);
                    vscode.window.showErrorMessage(
                        'Authentication failed. Please login again.',
                        'Login'
                    ).then(selection => {
                        if (selection === 'Login') {
                            vscode.commands.executeCommand('essedum.authenticate');
                        }
                    });
                    return false;
                }
            }

            logger.info(`${this.logPrefix} Token is valid`);
            // Refresh auth data to ensure latest values
            this.refreshAuthData();
            this._pipelineAgentService.refreshAuthData();
            return true;

        } catch (error: any) {
            logger.error(`${this.logPrefix} Error validating authentication:`, error);
            return false;
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
     * Upload virtual JSON file to server
     */
    private async uploadVirtualJsonToServer(document: vscode.TextDocument, fileName: string): Promise<void> {
        try {
            const content = document.getText();

            // Extract pipeline name and organization from filename
            // Format: {pipelineName}_{organization}.json
            const fileNameWithoutExt = fileName.replace('.json', '');
            const parts = fileNameWithoutExt.split('_');

            if (parts.length < 2) {
                throw new Error('Invalid JSON filename format. Expected: {pipelineName}_{organization}.json');
            }

            const pipelineName = parts[0];
            const orgFromFile = parts.slice(1).join('_'); // Handle org names with underscores

            logger.info(`${this.logPrefix} Uploading virtual JSON to server:`);
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
                logger.info(`${this.logPrefix} ✓ Virtual JSON file uploaded successfully`);
            });

        } catch (error: any) {
            console.error(`${this.logPrefix} ✗ Failed to upload virtual JSON file:`, error);
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



