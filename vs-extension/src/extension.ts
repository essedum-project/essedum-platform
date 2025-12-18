/**
 * Essedum AI Platform VS Code Extension - Main Entry Point
 * 
 * This extension provides integration between VS Code and the Essedum AI Platform,
 * enabling users to authenticate, manage pipelines, and work with remote files
 * directly from their development environment.
 * 
 * Features:
 * - Keycloak OAuth authentication
 * - Pipeline management and execution
 * - Virtual file system for remote files
 * - Job logs viewer
 * - Integrated development workflow
 * 
 * @fileoverview Main extension activation and command registration
 * @author Essedum AI Platform Team
 * @version 1.0.0
 */

// ================================
// IMPORTS
// ================================

import * as vscode from 'vscode';

// Service imports
import { PipelineCardsProvider } from './app/pipeline/pipeline-cards';
import { KeycloakAuthService, KeycloakConfig } from './auth/keycloak-auth';
import { LoginScreenProvider } from './auth/login-screen';
import { EssedumFileSystemProvider } from './providers/essedum-file-provider';
import { PipelineService } from './services/pipeline.service';

// Configuration imports
import { initializeSSLBypass, setupAxiosDefaults, makeSecureRequest, getBaseUrl, setBaseUrl, isBaseUrlSet } from './constants/api-config';
import {
    AUTH_CONFIG,
    EXTENSION_CONFIG,
    COMMANDS,
    MESSAGES,
    UI_CONFIG,
    EXTERNAL_LINKS,
    DEBUG_CONFIG,
    NetworkConfig,
    NetworkType
} from './constants/app-constants';

// Utility imports
import {
    updateAuthenticationContext,
    checkAndUpdateAuthStatus,
    getAuthErrorMessage,
    showErrorWithOptions,
    showProgressNotification,
    showSuccessMessage,
    registerCommand,
    registerWebviewViewProvider,
    registerFileSystemProvider,
    createLogger,
    validateServices,
    safeExecuteCommand
} from './constants/extension-utils';

// ================================
// TYPES AND INTERFACES
// ================================

interface PortfolioId {
    id: number;
    portfolioName: string;
    description: string | null;
    lastUpdated: number | null;
}

interface ProjectId {
    id: number;
    name: string;
    description: string | null;
    lastUpdated: number | null;
    logoName: string | null;
    logo: string | null;
    defaultrole: boolean;
    portfolioId: PortfolioId;
    projectdisplayname: string;
    theme: string | null;
    domainName: string | null;
    productDetails: string | null;
    timeZone: string;
    azureOrgId: string | null;
    provisioneddate: number | null;
    disableExcel: boolean;
    createdDate: number;
    projectAutologin: string | null;
    autologinRole: string | null;
}

interface RoleId {
    id: number;
    projectId: any | null;
    name: string;
    description: string;
    permission: boolean;
    roleadmin: any | null;
    projectadmin: any | null;
    portfolioId: any | null;
    projectAdminId: any | null;
}

interface ProjectWithRoles {
    projectId: ProjectId;
    roleId: RoleId[];
}

interface Portfolio {
    projectWithRoles: ProjectWithRoles[];
    porfolioId: PortfolioId;
}

interface UserInfo {
    userId: any;
    porfolios?: Portfolio[];
}

interface ServerConfig {
    data_limit?: number;
    autoUserCreation?: boolean;
    autoUserProject?: any;
    activeProfiles?: string;
    logoLocation?: string;
    theme?: string;
    font?: string;
    telemetryUrl?: string;
    telemetry?: boolean;
    telemetryPdataId?: string;
    capBaseUrl?: string;
    appVersion?: string;
    leapAppYear?: string;
    showPortfolioHeader?: boolean;
    showProfileIcon?: boolean;
    encDefault?: string;
    expireTokenTime?: number;
    issuerUri?: string;
    clientId?: string;
    scope?: string;
    silentRefreshTimeoutFactor?: number;
    baseUrl?: string;
}

interface OAuthConfig {
    issuerUri: string;
    clientId: string;
    scope: string;
    responseType: string;
    useSilentRefresh: boolean;
    timeoutFactor: number;
    sessionChecksEnabled: boolean;
    showDebugInformation: boolean;
    clearHashAfterLogin: boolean;
    strictDiscoveryDocumentValidation: boolean;
}

interface DashConstantQuery {
    keys: string;
}

// ================================
// CONSTANTS
// ================================

// Dynamic API URLs - these should be constructed when needed, not at module load time
function getConfigApiUrl(): string {
    return `${getBaseUrl()}/api/getConfigDetails`;
}

function getUserInfoApiUrl(): string {
    return `${getBaseUrl()}/api/userInfo`;
}
const CONFIG_TIMEOUT = 10000;
const FALLBACK_TIMEOUT = 15000;

const STORAGE_KEYS = {
    // Authentication
    JWT_TOKEN: 'jwtToken',
    ACCESS_TOKEN: 'accessToken',

    // User data
    USER: 'user',
    ROLE: 'role',
    PROJECT: 'project',
    ORGANIZATION: 'organization',
    CURRENT_USER_INFO: 'currentUserInfo',
    USER_INFO_DATA: 'userInfoData',
    USER_PORTFOLIOS: 'userPortfolios',
    UPDATED_USER: 'UpdatedUser',

    // Configuration
    OAUTH_CONFIG: 'oauthConfig',
    BASE_URL: 'baseUrl',
    THEME: 'theme',
    DEFAULT_THEME: 'defaultTheme',
    ACTIVE_PROFILES: 'activeProfiles',
    AUTO_USER_CREATION: 'autoUserCreation',
    AUTO_USER_PROJECT: 'autoUserProject',
    ENC_DEFAULT: 'encDefault',

    // Navigation
    RETURN_URL: 'returnUrl',
    CURRENT_PROJECT: 'currentProject',
    CURRENT_PORTFOLIO: 'currentPortfolio'
} as const;

const REQUEST_HEADERS = {
    ACCEPT: 'application/json, text/plain, */*',
    CONTENT_TYPE: 'application/json',
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    X_REQUESTED_WITH: 'Leap'
} as const;

// ================================
// GLOBAL VARIABLES
// ================================

/** Extension logger instance */
const logger = createLogger('Extension');

/** Global service instances */
let authService: KeycloakAuthService;
let loginScreenProvider: LoginScreenProvider;
let pipelineService: PipelineService;
let pipelineCardsProvider: PipelineCardsProvider;
let essedumFileProvider: EssedumFileSystemProvider;

/** Global extension context for accessing storage */
let extensionContext: vscode.ExtensionContext;

// ================================
// EXTENSION ACTIVATION
// ================================

/**
 * Extension activation function - called when extension is first activated
 * 
 * This function:
 * 1. Initializes SSL bypass for HTTPS requests
 * 2. Creates and configures authentication service
 * 3. Sets up file system provider
 * 4. Initializes pipeline services
 * 5. Registers all commands and providers
 * 
 * @param context - VS Code extension context
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    logger.info(MESSAGES.SUCCESS.EXTENSION_ACTIVATED);

    // Store context globally for access from command handlers
    extensionContext = context;

    try {
        // IMPORTANT: Set authentication context to false FIRST to ensure login screen is shown
        await updateAuthenticationContext(false);

        // Initialize SSL bypass before any HTTPS requests
        await initializeSSLConfiguration();

        // Create login screen provider first
        loginScreenProvider = createLoginScreenProvider(context);

        // Check if user has already selected a network and is authenticated
        const hasValidAuth = await initializeAuthenticationService(context);

        // Only initialize configuration if we have a valid base URL
        if (hasValidAuth || await hasStoredNetworkConfig(context)) {
            // Initialize configuration from server after network is selected
            await initializeConfiguration(context);
        }

        // Create file system provider
        essedumFileProvider = createFileSystemProvider();

        // Register file system provider
        registerFileSystemProvider(
            context,
            EXTENSION_CONFIG.FILE_SYSTEM_SCHEME,
            essedumFileProvider,
            {
                isCaseSensitive: true,
                isReadonly: false // Allow editing - files saved only during pipeline execution
            }
        );

        // Register webview providers BEFORE initializing pipeline services
        registerWebviewProviders(context);

        // Initialize pipeline services only if we have a network configured
        if (hasValidAuth || await hasStoredNetworkConfig(context)) {
            await initializePipelineServices(context);
        }

        // Register all extension commands
        registerExtensionCommands(context);

        // Now handle authentication state
        if (hasValidAuth) {
            // User is already authenticated and has used login screen before
            await updateAuthenticationContext(true);
            await checkAndUpdateAuthStatus(authService);
        } else {
            // Always show login screen for network selection first
            // (even if autoLogin is enabled, we need network selection)
            await updateAuthenticationContext(false);
            await showLoginScreen();
        }

        logger.info('Extension activation completed successfully');

    } catch (error) {
        await handleActivationError(error);
    }
}

// ================================
// INITIALIZATION FUNCTIONS
// ================================

/**
 * Initializes extension configuration by fetching settings from server
 * @param context - VS Code extension context
 */
async function initializeConfiguration(context: vscode.ExtensionContext): Promise<void> {
    logger.info('Initializing configuration from server...');

    // Check if base URL is set (network selected)
    if (!isBaseUrlSet()) {
        logger.warn('Base URL not set yet - skipping configuration initialization');
        return;
    }

    try {
        const config = await fetchServerConfiguration();
        await storeServerConfiguration(context, config);
        logger.info('Configuration initialization completed successfully');
    } catch (error) {
        logger.warn('Failed to fetch configuration from server:', error);
        await handleConfigurationError(context, error);
    }
}

async function fetchServerConfiguration(): Promise<ServerConfig> {
    const response = await makeSecureRequest('GET', getConfigApiUrl(), {
        timeout: CONFIG_TIMEOUT,
        withCredentials: true,
        headers: {
            'accept': REQUEST_HEADERS.ACCEPT,
            'content-type': REQUEST_HEADERS.CONTENT_TYPE,
            'user-agent': REQUEST_HEADERS.USER_AGENT,
            'x-requested-with': REQUEST_HEADERS.X_REQUESTED_WITH
        }
    });

    return response.data;
}

async function storeServerConfiguration(context: vscode.ExtensionContext, config: ServerConfig): Promise<void> {
    const updates = [
        { key: 'dataLimit', value: config.data_limit },
        { key: STORAGE_KEYS.AUTO_USER_CREATION, value: config.autoUserCreation },
        { key: STORAGE_KEYS.AUTO_USER_PROJECT, value: config.autoUserProject },
        { key: STORAGE_KEYS.ACTIVE_PROFILES, value: config.activeProfiles?.split(',') || [] },
        { key: 'logoLocation', value: config.logoLocation },
        { key: STORAGE_KEYS.THEME, value: config.theme },
        { key: STORAGE_KEYS.DEFAULT_THEME, value: config.theme },
        { key: 'font', value: config.font },
        { key: 'telemetryUrl', value: config.telemetryUrl },
        { key: 'telemetry', value: config.telemetry },
        { key: 'telemetryPdataId', value: config.telemetryPdataId },
        { key: 'capBaseUrl', value: config.capBaseUrl },
        { key: 'appVersion', value: config.appVersion },
        { key: 'leapAppYear', value: config.leapAppYear },
        { key: 'showPortfolioHeader', value: config.showPortfolioHeader },
        { key: 'showProfileIcon', value: config.showProfileIcon },
        { key: STORAGE_KEYS.ENC_DEFAULT, value: config.encDefault },
        { key: STORAGE_KEYS.BASE_URL, value: config.baseUrl || '' }
    ];

    // Handle JWT token expiration for specific profiles
    const activeProfiles = config.activeProfiles?.split(',') || [];
    if (activeProfiles.includes('dbjwt')) {
        updates.push({ key: 'expireTokenTime', value: config.expireTokenTime });
    }

    // Store OAuth configuration
    const oauthConfig = createOAuthConfig(config);
    updates.push({ key: STORAGE_KEYS.OAUTH_CONFIG, value: oauthConfig });

    await Promise.all(updates.map(({ key, value }) => context.globalState.update(key, value)));
}

function createOAuthConfig(config: ServerConfig): any {
    return {
        issuerUri: config.issuerUri || AUTH_CONFIG.ISSUER_URI,
        clientId: config.clientId || AUTH_CONFIG.CLIENT_ID,
        scope: config.scope || AUTH_CONFIG.SCOPE,
        responseType: 'code',
        useSilentRefresh: true,
        timeoutFactor: validateTimeoutFactor(config.silentRefreshTimeoutFactor),
        sessionChecksEnabled: true,
        showDebugInformation: DEBUG_CONFIG.VERBOSE_LOGGING,
        clearHashAfterLogin: false,
        strictDiscoveryDocumentValidation: false
    };
}

function validateTimeoutFactor(factor?: number): number {
    return (typeof factor === 'number' && factor > 0 && factor <= 1) ? factor : 0.9;
}

async function handleConfigurationError(context: vscode.ExtensionContext, error: unknown): Promise<void> {
    if (isSSLError(error)) {
        logger.error('SSL Certificate Error detected');
        await attemptFallbackConfiguration(context);
    } else {
        await storeDefaultConfiguration(context);
    }
}


function isSSLError(error: unknown): boolean {
    if (!(error instanceof Error)) { return false; }

    const sslKeywords = ['certificate', 'CERT_', 'unable to get local issuer certificate', 'self signed certificate'];
    return sslKeywords.some(keyword => error.message.includes(keyword));
}

async function attemptFallbackConfiguration(context: vscode.ExtensionContext): Promise<void> {
    try {
        logger.info('Attempting configuration fetch with additional SSL bypass...');

        const axios = require('axios');
        const https = require('https');

        const agent = new https.Agent({
            rejectUnauthorized: false,
            checkServerIdentity: () => undefined,
            requestCert: false,
            agent: false
        });

        const response = await axios.get(getConfigApiUrl(), {
            httpsAgent: agent,
            timeout: FALLBACK_TIMEOUT,
            headers: {
                'accept': REQUEST_HEADERS.ACCEPT,
                'user-agent': REQUEST_HEADERS.USER_AGENT,
                'x-requested-with': REQUEST_HEADERS.X_REQUESTED_WITH
            }
        });

        await storeServerConfiguration(context, response.data);
        logger.info('Configuration fetched successfully with fallback method');
    } catch (fallbackError) {
        logger.error('Fallback configuration fetch failed:', fallbackError);
        await storeDefaultConfiguration(context);
    }
}

async function storeDefaultConfiguration(context: vscode.ExtensionContext): Promise<void> {
    const defaultUpdates = [
        { key: STORAGE_KEYS.THEME, value: 'default' },
        { key: STORAGE_KEYS.DEFAULT_THEME, value: 'default' },
        { key: STORAGE_KEYS.ACTIVE_PROFILES, value: [] },
        { key: STORAGE_KEYS.OAUTH_CONFIG, value: createDefaultOAuthConfig() }
    ];

    await Promise.all(defaultUpdates.map(({ key, value }) => context.globalState.update(key, value)));
    logger.info('Using default configuration due to server fetch failure');
}

function createDefaultOAuthConfig(): OAuthConfig {
    return {
        issuerUri: AUTH_CONFIG.ISSUER_URI,
        clientId: AUTH_CONFIG.CLIENT_ID,
        scope: AUTH_CONFIG.SCOPE,
        responseType: 'code',
        useSilentRefresh: true,
        timeoutFactor: 0.9,
        sessionChecksEnabled: true,
        showDebugInformation: DEBUG_CONFIG.VERBOSE_LOGGING,
        clearHashAfterLogin: false,
        strictDiscoveryDocumentValidation: false
    };
}

/**
 * Initializes SSL bypass configuration for HTTPS requests
 */
async function initializeSSLConfiguration(): Promise<void> {
    logger.info('Initializing SSL configuration...');

    // Initialize comprehensive SSL bypass before any HTTPS requests
    initializeSSLBypass();
    setupAxiosDefaults();

    // Additional Node.js SSL bypass settings
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    process.env['PYTHONHTTPSVERIFY'] = '0';

    logger.info('SSL bypass configuration completed - all HTTPS certificate validation disabled');
}

/**
 * Creates and configures the Keycloak authentication service (legacy method)
 * @param context - VS Code extension context
 * @returns Configured authentication service
 */
function createAuthenticationService(context: vscode.ExtensionContext): KeycloakAuthService {
    logger.info('Creating authentication service with default configuration...');

    // Get OAuth configuration from stored config (fetched from server) or use defaults
    const storedOAuthConfig = context.globalState.get<OAuthConfig>(STORAGE_KEYS.OAUTH_CONFIG);

    // Create Keycloak configuration using server config if available, otherwise defaults
    const keycloakConfig: KeycloakConfig = {
        issuerUri: storedOAuthConfig?.issuerUri || AUTH_CONFIG.NETWORKS.INFOSYS.issuerUri,
        clientId: storedOAuthConfig?.clientId || AUTH_CONFIG.NETWORKS.INFOSYS.clientId,
        scope: storedOAuthConfig?.scope || AUTH_CONFIG.NETWORKS.INFOSYS.scope,
        networkType: AUTH_CONFIG.DEFAULT_NETWORK,
        networkName: AUTH_CONFIG.NETWORKS.INFOSYS.displayName
    };

    logger.debug('Keycloak configuration:', keycloakConfig);
    logger.info('Using configuration from:', storedOAuthConfig ? 'server' : 'defaults');

    // Create authentication service with improved OAuth flow
    return new KeycloakAuthService(keycloakConfig, context);
}

/**
 * Creates the login screen provider
 * @param context - VS Code extension context
 * @returns Configured login screen provider
 */
function createLoginScreenProvider(context: vscode.ExtensionContext): LoginScreenProvider {
    logger.info('Creating login screen provider...');
    return new LoginScreenProvider(context.extensionUri);
}

/**
 * Check if we have a stored network configuration
 * @param context - VS Code extension context
 * @returns boolean indicating if network is configured
 */
async function hasStoredNetworkConfig(context: vscode.ExtensionContext): Promise<boolean> {
    const storedNetwork = context.globalState.get<NetworkConfig>('selected_network');
    const hasUsedLoginScreen = context.globalState.get<boolean>('has_used_login_screen', false);
    
    if (storedNetwork && hasUsedLoginScreen) {
        // Set the base URL from stored network configuration
        setBaseUrl(storedNetwork.baseURL);
        return true;
    }
    
    return false;
}

/**
 * Initialize authentication service based on stored network selection
 * @param context - VS Code extension context
 * @returns boolean indicating if valid authentication exists
 */
async function initializeAuthenticationService(context: vscode.ExtensionContext): Promise<boolean> {
    logger.info('Initializing authentication service...');

    try {
        // Check if we have a stored network selection AND user has been through our login screen
        const storedNetwork = context.globalState.get<NetworkConfig>('selected_network');
        const hasUsedLoginScreen = context.globalState.get<boolean>('has_used_login_screen', false);
        
        logger.info('Stored network:', storedNetwork?.displayName || 'None');
        logger.info('Has used login screen:', hasUsedLoginScreen);
        
        if (storedNetwork && hasUsedLoginScreen) {
            logger.info('Found stored network configuration and login screen usage:', storedNetwork.displayName);
            
            // Create auth service with stored network
            authService = KeycloakAuthService.createWithNetwork(storedNetwork, context);
            
            // Check if we have valid tokens
            const isAuthenticated = await authService.isTokenValid();
            logger.info('Authentication status with stored network:', isAuthenticated);
            
            return isAuthenticated;
        } else {
            logger.info('No stored network or user has not used login screen, will show login screen');
            
            // Create auth service with default network for now
            authService = createAuthenticationService(context);
            return false;
        }
    } catch (error) {
        logger.error('Error initializing authentication service:', error);
        
        // Fallback to default auth service
        authService = createAuthenticationService(context);
        return false;
    }
}

/**
 * Register webview providers
 * @param context - VS Code extension context
 */
function registerWebviewProviders(context: vscode.ExtensionContext): void {
    logger.info('Registering webview providers...');

    // Register login screen provider
    registerWebviewViewProvider(
        context,
        EXTENSION_CONFIG.LOGIN_VIEW_ID,
        loginScreenProvider
    );

    // Set up login screen event handlers
    setupLoginScreenEventHandlers();

    logger.info('Webview providers registered successfully');
}

/**
 * Set up event handlers for the login screen
 */
function setupLoginScreenEventHandlers(): void {
    // Handle network selection
    loginScreenProvider.onNetworkSelected(async (networkConfig: NetworkConfig) => {
        logger.info('Network selected:', networkConfig.displayName);
        
        try {
            loginScreenProvider.showLoading('Connecting to ' + networkConfig.displayName + '...');
            
            // Mark that user has used the login screen
            await extensionContext.globalState.update('has_used_login_screen', true);
            
            // Update or create auth service with selected network
            if (authService) {
                await authService.updateNetworkConfig(networkConfig);
            } else {
                authService = KeycloakAuthService.createWithNetwork(networkConfig, extensionContext);
            }
            
            loginScreenProvider.showLoading('Initializing services...');
            
            // Now that we have a network selected, initialize configuration and services
            try {
                await initializeConfiguration(extensionContext);
                await initializePipelineServices(extensionContext);
                logger.info('Services initialized successfully after network selection');
            } catch (serviceError) {
                logger.warn('Failed to initialize some services after network selection:', serviceError);
                // Continue with authentication even if services fail to initialize
            }
            
            loginScreenProvider.showLoading('Authenticating...');
            
            // Perform authentication
            const tokens = await authService.forceAuthentication();
            
            // Process successful login
            await processSuccessfulLogin(tokens.access_token);
            
            // Hide login screen and show main interface
            await vscode.commands.executeCommand('workbench.view.extension.essedum-explorer');
            
        } catch (error) {
            logger.error('Authentication failed after network selection:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            loginScreenProvider.showError('Authentication failed: ' + errorMessage);
        }
    });

    // Handle login cancellation
    loginScreenProvider.onLoginCancelled(() => {
        logger.info('Login cancelled by user');
        loginScreenProvider.reset();
    });
}

/**
 * Show the login screen
 */
async function showLoginScreen(): Promise<void> {
    logger.info('Showing login screen...');
    
    try {
        // Ensure authentication context is set to false to show login view
        await updateAuthenticationContext(false);
        
        // Force refresh of the view to ensure proper rendering
        await vscode.commands.executeCommand('workbench.view.extension.essedum-explorer');
        
        // Small delay to ensure view container is loaded
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try to focus on the login view specifically
        try {
            await vscode.commands.executeCommand('essedum-login.focus');
        } catch (focusError) {
            logger.warn('Could not focus login view directly:', focusError);
        }
        
        logger.info('Login screen display process completed');
    } catch (error) {
        logger.error('Failed to show login screen:', error);
        
        // Fallback: show command palette login
        const selection = await vscode.window.showInformationMessage(
            'Welcome to Essedum AI Platform! Please select your authentication network.',
            'Login with Network Selection',
            'Cancel'
        );
        
        if (selection === 'Login with Network Selection') {
            await vscode.commands.executeCommand(COMMANDS.LOGIN_WITH_NETWORK);
        }
    }
}

/**
 * Creates the Essedum file system provider
 * @returns Configured file system provider
 */
function createFileSystemProvider(): EssedumFileSystemProvider {
    logger.info('Creating file system provider...');

    // Create Essedum file system provider with empty initial token
    return new EssedumFileSystemProvider('', null, null);
}

/**
 * Initializes pipeline-related services and providers
 * @param context - VS Code extension context
 */
async function initializePipelineServices(context: vscode.ExtensionContext): Promise<void> {
    logger.info('Initializing pipeline services...');

    try {
        // Check if we have valid tokens WITHOUT triggering authentication
        const storedTokens = await authService.getStoredTokens();
        let accessToken = '';
        
        if (storedTokens && storedTokens.access_token) {
            accessToken = storedTokens.access_token;
            await getUserAtLogin(extensionContext, accessToken);
            logger.info('Pipeline services initialized with stored token');
        } else {
            logger.info('No stored tokens available, initializing with empty token');
        }

        const project = context.globalState.get<any>(STORAGE_KEYS.PROJECT);
        const role = context.globalState.get<any>(STORAGE_KEYS.ROLE);

        // Create pipeline service with token (empty if not authenticated)
        pipelineService = new PipelineService(accessToken, role, project);

        // Create pipeline cards provider with dependencies
        pipelineCardsProvider = new PipelineCardsProvider(
            context,
            accessToken,
            authService,
            essedumFileProvider,
            pipelineService
        );

        // Update file provider with token
        essedumFileProvider.updateToken(accessToken);

        logger.info('Pipeline services initialized successfully');

    } catch (error) {
        await handlePipelineServiceInitializationError(context, error);
    }

    // Register the pipeline cards provider as the main webview
    registerWebviewViewProvider(
        context,
        EXTENSION_CONFIG.SIDEBAR_VIEW_ID,
        pipelineCardsProvider
    );

    logger.info('Pipeline services registration completed');
}

async function handlePipelineServiceInitializationError(context: vscode.ExtensionContext, error: unknown): Promise<void> {
    logger.warn('Failed to initialize pipeline services with token, creating with empty tokens:', error);

    const project = context.globalState.get<any>(STORAGE_KEYS.PROJECT);

    pipelineService = new PipelineService('', project?.name);
    pipelineCardsProvider = new PipelineCardsProvider(
        context,
        '',
        authService,
        essedumFileProvider,
        pipelineService
    );

    await updateAuthenticationContext(false);
}

// ================================
// COMMAND REGISTRATION
// ================================

/**
 * Registers all extension commands with VS Code
 * @param context - VS Code extension context
 */
function registerExtensionCommands(context: vscode.ExtensionContext): void {
    logger.info('Registering extension commands...');

    const commandMappings = [
        { command: COMMANDS.OPEN_SIDEBAR, handler: handleOpenSidebar },
        { command: COMMANDS.SHOW_LOGIN_SCREEN, handler: handleShowLoginScreen },
        { command: COMMANDS.LOGIN, handler: handleLogin },
        { command: COMMANDS.LOGIN_WITH_NETWORK, handler: handleLoginWithNetwork },
        { command: COMMANDS.LOGOUT, handler: handleLogout },
        { command: COMMANDS.CHECK_AUTH, handler: handleCheckAuth },
        { command: COMMANDS.RUN_PIPELINE, handler: handleRunPipeline },
        { command: COMMANDS.GET_USER_INFO, handler: handleGetUserInfo },
        { command: COMMANDS.REFRESH_USER_INFO, handler: handleRefreshUserInfo },
        { command: 'essedum.clearUserData', handler: handleClearUserData },
        { command: 'essedum.debugUserData', handler: handleDebugUserData }
    ];

    commandMappings.forEach(({ command, handler }) => {
        registerCommand(context, command, handler);
    });

    logger.info('All extension commands registered successfully');
}

// ================================
// COMMAND HANDLERS
// ================================

/**
 * Handles the show login screen command
 */
async function handleShowLoginScreen(): Promise<void> {
    logger.info('Showing login screen...');
    await showLoginScreen();
}

/**
 * Handles the login with specific network command
 * @param networkType - Network type to use for login
 */
async function handleLoginWithNetwork(networkType?: NetworkType): Promise<void> {
    logger.info('Login with network requested:', networkType);

    try {
        let networkConfig: NetworkConfig;

        if (networkType) {
            // Use specified network
            const networkKey = networkType.toUpperCase() as keyof typeof AUTH_CONFIG.NETWORKS;
            networkConfig = AUTH_CONFIG.NETWORKS[networkKey];
            
            if (!networkConfig) {
                throw new Error(`Unknown network type: ${networkType}`);
            }
        } else {
            // Show quick pick for network selection
            const networkOptions = [
                {
                    label: AUTH_CONFIG.NETWORKS.INFOSYS.displayName,
                    description: 'For Infosys employees and internal users',
                    detail: AUTH_CONFIG.NETWORKS.INFOSYS.issuerUri,
                    network: AUTH_CONFIG.NETWORKS.INFOSYS
                },
                {
                    label: AUTH_CONFIG.NETWORKS.LFN.displayName,
                    description: 'For Linux Foundation Networking users',
                    detail: AUTH_CONFIG.NETWORKS.LFN.issuerUri,
                    network: AUTH_CONFIG.NETWORKS.LFN
                }
            ];

            const selection = await vscode.window.showQuickPick(networkOptions, {
                placeHolder: 'Select authentication network',
                title: 'Essedum AI Platform - Network Selection'
            });

            if (!selection) {
                logger.info('Network selection cancelled');
                return;
            }

            networkConfig = selection.network;
        }

        // Show progress during authentication
        const authResult = await showProgressNotification(
            `Authenticating with ${networkConfig.displayName}`,
            async (progress, token) => {
                if (token.isCancellationRequested) {
                    throw new Error(MESSAGES.ERROR.AUTH_CANCELLED);
                }

                progress.report({ increment: 20, message: 'Configuring network...' });

                // Mark that user has used login screen/network selection
                await extensionContext.globalState.update('has_used_login_screen', true);

                // Update or create auth service with selected network
                if (authService) {
                    await authService.updateNetworkConfig(networkConfig);
                } else {
                    authService = KeycloakAuthService.createWithNetwork(networkConfig, extensionContext);
                }

                if (token.isCancellationRequested) {
                    throw new Error(MESSAGES.ERROR.AUTH_CANCELLED);
                }

                progress.report({ increment: 40, message: 'Starting authentication...' });

                // Force fresh authentication
                const tokens = await authService.forceAuthentication();

                progress.report({ increment: 80, message: 'Authentication successful, updating services...' });

                return tokens;
            },
            true // Allow cancellation
        );

        await processSuccessfulLogin(authResult.access_token);
        logger.info('Login with network completed successfully');

    } catch (error) {
        await handleLoginError(error);
    }
}

/**
 * Handles the open sidebar command
 */
async function handleOpenSidebar(): Promise<void> {
    logger.info('Opening sidebar...');
    await safeExecuteCommand(COMMANDS.VSCODE.OPEN_EXTENSION_VIEW);
}

/**
 * Handles the user login command
 */
async function handleLogin(): Promise<void> {
    logger.info('Starting login process...');

    try {
        // Mark that user has used login functionality
        await extensionContext.globalState.update('has_used_login_screen', true);

        // Show progress during authentication
        const authResult = await showProgressNotification(
            MESSAGES.PROGRESS.AUTHENTICATING,
            async (progress, token) => {
                // Check for cancellation
                if (token.isCancellationRequested) {
                    throw new Error(MESSAGES.ERROR.AUTH_CANCELLED);
                }

                progress.report({ increment: 0, message: MESSAGES.PROGRESS.CLEARING_TOKENS });

                // Check for cancellation again
                if (token.isCancellationRequested) {
                    throw new Error(MESSAGES.ERROR.AUTH_CANCELLED);
                }

                progress.report({ increment: 20, message: MESSAGES.PROGRESS.STARTING_OAUTH });

                // Force fresh authentication
                const tokens = await authService.forceAuthentication();

                progress.report({ increment: 80, message: MESSAGES.PROGRESS.AUTH_SUCCESSFUL });

                return tokens;
            },
            true // Allow cancellation
        );

        await processSuccessfulLogin(authResult.access_token);
        logger.info('Login process completed successfully');

    } catch (error) {
        await handleLoginError(error);
    }
}

async function processSuccessfulLogin(accessToken: string): Promise<void> {
    logger.info('Authentication successful, token length:', accessToken?.length || 0);

    await Promise.all([
        extensionContext.globalState.update(STORAGE_KEYS.JWT_TOKEN, accessToken),
        extensionContext.globalState.update(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    ]);

    await updateServicesWithToken(accessToken);
    await getUserAtLogin(extensionContext, accessToken);
    await updateAuthenticationContext(true);
    await safeExecuteCommand(COMMANDS.VSCODE.OPEN_EXTENSION_VIEW);

    const selection = await showSuccessMessage(
        MESSAGES.SUCCESS.LOGIN_SUCCESS,
        UI_CONFIG.BUTTONS.VIEW_PIPELINES
    );

    if (selection === UI_CONFIG.BUTTONS.VIEW_PIPELINES) {
        await safeExecuteCommand(COMMANDS.VSCODE.OPEN_EXTENSION_VIEW);
    }
}

async function handleLoginError(error: unknown): Promise<void> {
    logger.error('Authentication failed:', error);
    
    const userMessage = getAuthErrorMessage(error);
    await showErrorWithOptions(
        userMessage,
        COMMANDS.LOGIN,
        EXTERNAL_LINKS.KEYCLOAK_DOCS
    );
    
    throw error;
}

/**
 * Handles the user logout command
 */
async function handleLogout(): Promise<void> {
    logger.info('Starting logout process...');

    try {
        // Ask user if they want to switch networks or just logout
        const options = [
            'Logout (same network)',
            'Logout and switch network',
            'Cancel'
        ];

        const selection = await vscode.window.showQuickPick(options, {
            placeHolder: 'Choose logout option',
            title: 'Logout Options'
        });

        if (!selection || selection === 'Cancel') {
            logger.info('Logout cancelled by user');
            return;
        }

        const clearNetwork = selection === 'Logout and switch network';

        // Clear stored tokens and optionally network selection
        await authService.clearStoredTokens(clearNetwork);

        // Clear user data - but keep network selection if not switching networks
        if (clearNetwork) {
            await clearAllUserData(extensionContext);
        } else {
            // Clear user data but preserve network and login screen flag
            await clearUserDataExceptNetwork(extensionContext);
        }

        // Clear service tokens
        await updateServicesWithToken('');

        // Update authentication context
        await updateAuthenticationContext(false);

        // Reload initial content or show login screen
        if (clearNetwork) {
            // Show login screen for network re-selection
            await showLoginScreen();
        } else if (pipelineCardsProvider) {
            // Just reload content with same network
            pipelineCardsProvider.loadInitialContent();
        }

        const message = clearNetwork 
            ? MESSAGES.SUCCESS.LOGOUT_SUCCESS + ' You can now select a different network.'
            : MESSAGES.SUCCESS.LOGOUT_SUCCESS;

        await vscode.window.showInformationMessage(message);

        logger.info('Logout completed successfully', clearNetwork ? '(with network switch)' : '');

    } catch (error) {
        logger.error('Logout failed:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        await vscode.window.showErrorMessage(MESSAGES.ERROR.LOGOUT_FAILED(errorMessage));
    }
}

/**
 * Handles the check authentication status command
 */
async function handleCheckAuth(): Promise<void> {
    logger.info('Checking authentication status...');

    try {
        const authStatus = await authService.getAuthenticationStatus();
        const isValid = await authService.isTokenValid();

        const message = MESSAGES.INFO.AUTH_STATUS_MESSAGE(
            authStatus.isAuthenticated,
            isValid,
            authStatus.tokenExpiry,
            authStatus.needsRefresh
        );

        const selection = await vscode.window.showInformationMessage(
            message,
            UI_CONFIG.BUTTONS.OK,
            UI_CONFIG.BUTTONS.LOGIN
        );

        if (selection === UI_CONFIG.BUTTONS.LOGIN) {
            await safeExecuteCommand(COMMANDS.LOGIN);
        }

    } catch (error) {
        logger.error('Failed to check authentication status:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        await vscode.window.showErrorMessage(
            MESSAGES.ERROR.AUTH_STATUS_CHECK_FAILED(errorMessage)
        );
    }
}

/**
 * Handles the run pipeline command
 * @param pipelineName - Optional pipeline name to run
 */
async function handleRunPipeline(pipelineName?: string): Promise<void> {
    logger.info('Handling run pipeline request:', pipelineName || 'no specific pipeline');

    // Validate that services are available
    if (!validateServices({ pipelineCardsProvider })) {
        await vscode.window.showErrorMessage(MESSAGES.ERROR.LOGIN_REQUIRED);
        return;
    }

    if (pipelineName) {
        // Show instruction for running specific pipeline
        const selection = await vscode.window.showInformationMessage(
            MESSAGES.INFO.PIPELINE_RUN_INSTRUCTION(pipelineName),
            UI_CONFIG.BUTTONS.OPEN_PIPELINES
        );

        if (selection === UI_CONFIG.BUTTONS.OPEN_PIPELINES) {
            await safeExecuteCommand(COMMANDS.VSCODE.OPEN_EXTENSION_VIEW);
        }
    } else {
        // Open the pipelines view
        await safeExecuteCommand(COMMANDS.VSCODE.OPEN_EXTENSION_VIEW);
    }
}

/**
 * Handles clearing all cached user data
 */
async function handleClearUserData(): Promise<void> {
    logger.info('Clearing all cached user data...');

    try {
        await clearAllUserData(extensionContext);
        await vscode.window.showInformationMessage('All cached user data cleared successfully. Please login again.');
        logger.info('User data cleared successfully via command');
    } catch (error) {
        logger.error('Failed to clear user data:', error);
        await vscode.window.showErrorMessage('Failed to clear user data.');
    }
}

/**
 * Handles debugging current user data
 */
async function handleDebugUserData(): Promise<void> {
    logger.info('Debugging current user data...');

    try {
        const user = extensionContext.globalState.get('user') as any;
        const role = extensionContext.globalState.get('role') as any;
        const project = extensionContext.globalState.get('project') as any;
        const organization = extensionContext.globalState.get('organization') as string;

        const message = `Current User Data:\n` +
            `• User: ${user?.user_f_name} ${user?.user_l_name} (${user?.user_email})\n` +
            `• Role: ${role?.name || 'Not set'}\n` +
            `• Project: ${project?.name || 'Not set'}\n` +
            `• Organization: ${organization || 'Not set'}`;

        await vscode.window.showInformationMessage(message, 'OK', 'Clear Data');

    } catch (error) {
        logger.error('Failed to debug user data:', error);
        await vscode.window.showErrorMessage('Failed to retrieve user data for debugging.');
    }
}

/**
 * Clears all cached user data from globalState
 */


/**
 * Handles the get user info command
 */
async function handleGetUserInfo(): Promise<void> {
    logger.info('Getting current user information...');

    try {
        const cachedUserInfo = extensionContext.globalState.get('userInfoData') as any;
        const currentUserInfo = extensionContext.globalState.get('currentUserInfo') as any;

        if (cachedUserInfo || currentUserInfo) {
            const userInfo = currentUserInfo || cachedUserInfo;
            const portfolioCount = userInfo?.porfolios?.length || 0;

            const message = `User Information:\n` +
                `• Portfolios: ${portfolioCount}\n` +
                `• User ID: ${userInfo?.userId || 'Not available'}\n` +
                `• Last Updated: ${userInfo?.lastUpdated || 'Not available'}`;

            await vscode.window.showInformationMessage(message, UI_CONFIG.BUTTONS.OK);
        } else {
            await vscode.window.showInformationMessage(
                'No user information available. Please login first.',
                UI_CONFIG.BUTTONS.LOGIN
            );
        }

    } catch (error) {
        logger.error('Failed to get user information:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        await vscode.window.showErrorMessage(`Failed to get user information: ${errorMessage}`);
    }
}

/**
 * Handles the refresh user info command
 */
async function handleRefreshUserInfo(): Promise<void> {
    logger.info('Refreshing user information...');

    try {
        const accessToken = extensionContext.globalState.get('accessToken') as string;

        if (!accessToken) {
            await vscode.window.showWarningMessage(
                'No access token available. Please login first.',
                UI_CONFIG.BUTTONS.LOGIN
            );
            return;
        }

        // Show progress during user info refresh
        await showProgressNotification(
            'Refreshing user information...',
            async (progress, token) => {
                if (token.isCancellationRequested) {
                    throw new Error('User info refresh was cancelled');
                }

                progress.report({ increment: 0, message: 'Fetching user information...' });

                // Mark user info as needing update
                await extensionContext.globalState.update('UpdatedUser', true);

                // Fetch fresh user information
                const userInfo = await getUserInfo(extensionContext, accessToken);

                progress.report({ increment: 80, message: 'Updating user access...' });

                // Re-initialize user access with fresh data
                await initUserAccess(extensionContext, userInfo, accessToken);

                progress.report({ increment: 100, message: 'User information refreshed successfully' });
            },
            true // Allow cancellation
        );

        await vscode.window.showInformationMessage('User information refreshed successfully.');
        logger.info('User info refresh completed successfully');

    } catch (error) {
        logger.error('Failed to refresh user information:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        await vscode.window.showErrorMessage(`Failed to refresh user information: ${errorMessage}`);
    }
}

// ================================
// UTILITY FUNCTIONS
// ================================

async function clearAllUserData(context: vscode.ExtensionContext): Promise<void> {
    logger.info('Clearing all cached user data...');

    const keysToCllear = [
        STORAGE_KEYS.USER,
        STORAGE_KEYS.ROLE,
        STORAGE_KEYS.PROJECT,
        STORAGE_KEYS.ORGANIZATION,
        STORAGE_KEYS.CURRENT_USER_INFO,
        STORAGE_KEYS.USER_INFO_DATA,
        STORAGE_KEYS.USER_PORTFOLIOS,
        STORAGE_KEYS.JWT_TOKEN,
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.CURRENT_PROJECT,
        STORAGE_KEYS.CURRENT_PORTFOLIO,
        STORAGE_KEYS.UPDATED_USER,
        STORAGE_KEYS.RETURN_URL,
        STORAGE_KEYS.THEME,
        STORAGE_KEYS.DEFAULT_THEME,
        'font',
        'dashConstants',
        'userPreferences',
        'selectedRole',
        'selectedProject',
        'selectedPortfolio',
        'has_used_login_screen', // Clear login screen usage flag
        'selected_network' // Optionally clear network selection based on logout type
    ];

    await Promise.all(
        keysToCllear.map(key => {
            logger.debug(`Clearing key: ${key}`);
            return context.globalState.update(key, undefined);
        })
    );

    logger.info('All user data cleared from cache');
}

/**
 * Clears user data but preserves network selection and login screen usage
 */
async function clearUserDataExceptNetwork(context: vscode.ExtensionContext): Promise<void> {
    logger.info('Clearing user data but preserving network selection...');

    const keysToCllear = [
        STORAGE_KEYS.USER,
        STORAGE_KEYS.ROLE,
        STORAGE_KEYS.PROJECT,
        STORAGE_KEYS.ORGANIZATION,
        STORAGE_KEYS.CURRENT_USER_INFO,
        STORAGE_KEYS.USER_INFO_DATA,
        STORAGE_KEYS.USER_PORTFOLIOS,
        STORAGE_KEYS.JWT_TOKEN,
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.CURRENT_PROJECT,
        STORAGE_KEYS.CURRENT_PORTFOLIO,
        STORAGE_KEYS.UPDATED_USER,
        STORAGE_KEYS.RETURN_URL,
        STORAGE_KEYS.THEME,
        STORAGE_KEYS.DEFAULT_THEME,
        'font',
        'dashConstants',
        'userPreferences',
        'selectedRole',
        'selectedProject',
        'selectedPortfolio'
        // Note: NOT clearing 'has_used_login_screen' and 'selected_network'
    ];

    await Promise.all(
        keysToCllear.map(key => {
            logger.debug(`Clearing key: ${key}`);
            return context.globalState.update(key, undefined);
        })
    );

    logger.info('User data cleared, network selection preserved');
}

/**
 * Gets a configuration value from the stored server configuration
 * @param context - VS Code extension context
 * @param key - Configuration key to retrieve
 * @param defaultValue - Default value if key is not found
 * @returns Configuration value or default
 */
function getConfigurationValue<T>(context: vscode.ExtensionContext, key: string, defaultValue: T): T {
    return context.globalState.get(key, defaultValue);
}

/**
 * Gets the current OAuth configuration (server-fetched or defaults)
 * @param context - VS Code extension context
 * @returns OAuth configuration object
 */
function getOAuthConfiguration(context: vscode.ExtensionContext): any {
    return context.globalState.get('oauthConfig', {
        issuerUri: AUTH_CONFIG.ISSUER_URI,
        clientId: AUTH_CONFIG.CLIENT_ID,
        scope: AUTH_CONFIG.SCOPE,
        responseType: 'code',
        useSilentRefresh: true,
        timeoutFactor: 0.9,
        sessionChecksEnabled: true,
        showDebugInformation: DEBUG_CONFIG.VERBOSE_LOGGING,
        clearHashAfterLogin: false,
        strictDiscoveryDocumentValidation: false
    });
}

/**
 * Updates all services with a new authentication token
 * @param accessToken - New access token (empty string to clear)
 */
async function updateServicesWithToken(accessToken: string): Promise<void> {
    logger.info('Updating services with new token...');

    try {
        // Update pipeline provider
        if (pipelineCardsProvider) {
            pipelineCardsProvider.updateToken(accessToken);
            
            // If we have a valid token, also trigger the onTokenUpdated method
            // to handle the UI transition from auth screen to main view
            if (accessToken && accessToken.trim().length > 0) {
                await pipelineCardsProvider.onTokenUpdated(accessToken);
            }
        }

        // Update file system provider
        if (essedumFileProvider) {
            essedumFileProvider.updateToken(accessToken);
        }

        // Update pipeline service
        if (pipelineService) {
            pipelineService.updateToken(accessToken);
        } else if (accessToken) {
            const project: any = extensionContext.globalState.get('project');
            const role = extensionContext.globalState.get('role');
            // Re-create pipeline service if it doesn't exist and we have a token
            pipelineService = new PipelineService(accessToken, role, project.name);
        }

        logger.info('Services updated with new token successfully');

    } catch (error) {
        logger.error('Failed to update services with token:', error);
        throw error;
    }
}

/**
 * Handles user information fetching and processing after successful login
 * Similar to Angular getUserAtLogin function
 * @param context - VS Code extension context
 * @param accessToken - JWT access token
 */
async function getUserAtLogin(context: vscode.ExtensionContext, accessToken: string): Promise<void> {
    logger.info('Processing user information after login...');

    try {
        await context.globalState.update(STORAGE_KEYS.JWT_TOKEN, accessToken);

        const returnUrl = context.globalState.get<string>(STORAGE_KEYS.RETURN_URL, '');
        let userAccess = false;

        if (returnUrl?.includes('pfolio') && returnUrl.includes('&prjct') && returnUrl.includes('&prole')) {
            logger.info('Return URL contains portfolio, project, and role parameters');
        }

        const userInfo = await getUserInfoData(context, accessToken);

        if (!userInfo) {
            logger.warn('No user info received');
            return;
        }

        if (!userInfo.porfolios || userInfo.porfolios.length === 0) {
            await handleNoPortfolios(context);
        } else {
            logger.info('User has portfolios, initializing user access');
            await initUserAccess(context, userInfo, accessToken);

            const role = context.globalState.get(STORAGE_KEYS.ROLE);
            await getDashboardConstants(context, role, accessToken);

            if (!userAccess) {
                await safeExecuteCommand(COMMANDS.VSCODE.OPEN_EXTENSION_VIEW);
            }
        }
    } catch (error) {
        await handleGetUserAtLoginError(context, error);
    }
}

async function handleNoPortfolios(context: vscode.ExtensionContext): Promise<void> {
    logger.info('User has no portfolios');

    const activeProfiles = context.globalState.get<string[]>(STORAGE_KEYS.ACTIVE_PROFILES, []);
    const autoUserCreation = context.globalState.get<boolean>(STORAGE_KEYS.AUTO_USER_CREATION, false);

    const requiresPermission = ['keycloak', 'msal', 'aicloud'].some(profile => 
        activeProfiles.includes(profile)
    );

    if (requiresPermission) {
        if (!autoUserCreation) {
            await vscode.window.showWarningMessage(
                'You do not have access to any portfolios. Please contact your administrator for access.'
            );
        } else {
            await vscode.window.showInformationMessage('Setting up your account automatically...');
        }
    }
}

async function handleGetUserAtLoginError(context: vscode.ExtensionContext, error: unknown): Promise<void> {
    logger.error('Error processing user information:', error);

    const activeProfiles = context.globalState.get<string[]>(STORAGE_KEYS.ACTIVE_PROFILES, []);
    const autoUserCreation = context.globalState.get<boolean>(STORAGE_KEYS.AUTO_USER_CREATION, false);

    if ((activeProfiles.includes('keycloak') || activeProfiles.includes('msal')) && !autoUserCreation) {
        await vscode.window.showErrorMessage(
            'Unable to retrieve user information. Please contact your administrator.'
        );
    }
}


/**
 * Fetches user information from the server
 * @param context - VS Code extension context
 * @param accessToken - JWT access token
 * @returns User information or null if error
 */
async function getUserInfoData(context: vscode.ExtensionContext, accessToken: string): Promise<UserInfo | null> {
    logger.info('Fetching user information...');

    try {
        return await getUserInfo(context, accessToken);
    } catch (error) {
        logger.error('Error fetching user info data:', error);
        return null;
    }
}

/**
 * Fetches user information from the API
 * @param context - VS Code extension context  
 * @param accessToken - JWT access token
 * @returns User information
 */
async function getUserInfo(context: vscode.ExtensionContext, accessToken: string): Promise<UserInfo> {
    logger.info('Fetching user info from API...');

    try {
        const salt = context.globalState.get<string>(STORAGE_KEYS.ENC_DEFAULT, '');

        const response = await makeSecureRequest('GET', getUserInfoApiUrl(), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'accept': REQUEST_HEADERS.ACCEPT,
                'content-type': REQUEST_HEADERS.CONTENT_TYPE,
                'x-requested-with': REQUEST_HEADERS.X_REQUESTED_WITH
            },
            responseType: 'text'
        });

        const result = salt
            ? JSON.parse(await decryptUsingAES256(response.data, salt))
            : (typeof response.data === 'string' ? JSON.parse(response.data) : response.data);

        await Promise.all([
            context.globalState.update(STORAGE_KEYS.USER_INFO_DATA, result),
            context.globalState.update(STORAGE_KEYS.UPDATED_USER, false)
        ]);

        logger.info('User information fetched and cached successfully');
        return result;
    } catch (error) {
        logger.error('Error fetching user info from API:', error);
        await vscode.window.showErrorMessage(
            'You are not authorized to access this application. Please contact the administrator.'
        );
        throw new Error('You are not authorized to access this application. Please contact the admin');
    }
}

/**
 * Initializes user access settings with complete logic from Angular version
 * @param context - VS Code extension context
 * @param userInfo - User information object
 * @param accessToken - JWT access token
 */
async function initUserAccess(context: vscode.ExtensionContext, userInfo: UserInfo, accessToken: string): Promise<void> {
    logger.info('Initializing user access settings...');

    try {
        await Promise.all([
            context.globalState.update(STORAGE_KEYS.CURRENT_USER_INFO, userInfo),
            context.globalState.update(STORAGE_KEYS.USER_PORTFOLIOS, userInfo.porfolios || [])
        ]);

        if (!userInfo.porfolios || userInfo.porfolios.length === 0) {
            logger.warn('No portfolios available for user');
            return;
        }

        const portfolio = userInfo.porfolios[0];
        const dashconstant: DashConstantQuery = {
            keys: portfolio.porfolioId.portfolioName + "default"
        };

        const currentProject = context.globalState.get<any>(STORAGE_KEYS.PROJECT);
        const currentRole = context.globalState.get<any>(STORAGE_KEYS.ROLE);

        try {
            const dashConstants = await findAllDashConstant(
                context,
                portfolio.projectWithRoles[0].projectId,
                currentRole,
                dashconstant,
                accessToken
            );

            await processUserAccessWithConstants(context, userInfo, dashConstants, currentProject, currentRole);
        } catch (error) {
            logger.error('Error fetching dashboard constants, using fallback initialization:', error);
            await fallbackUserAccessInitialization(context, userInfo);
        }

        //   if (userInfo.porfolios && userInfo.porfolios.length > 0) {
        //     const defaultPortfolio = userInfo.porfolios[0];
        //     await context.globalState.update('currentPortfolio', defaultPortfolio);

        //     if (defaultPortfolio.projects && defaultPortfolio.projects.length > 0) {
        //         const defaultProject = defaultPortfolio.projects[0];
        //         await context.globalState.update('currentProject', defaultProject);
        //     }
        // }
        if (portfolio.projectWithRoles && portfolio.projectWithRoles.length > 0) {
            await context.globalState.update(STORAGE_KEYS.CURRENT_PROJECT, portfolio.projectWithRoles[0]);
        }

        logger.info('User access initialization completed successfully');
    } catch (error) {
        logger.error('Error initializing user access:', error);
        await fallbackUserAccessInitialization(context, userInfo);
    }
}


async function processUserAccessWithConstants(
    context: vscode.ExtensionContext,
    userInfo: UserInfo,
    dashConstants: any,
    currentProject: any,
    currentRole: any
): Promise<void> {
    const portfolio = userInfo.porfolios![0];
    let res = (dashConstants.content || []).filter((item: any) => 
        item.keys === portfolio.porfolioId.portfolioName + "default"
    );

    const projectCheck = res.some((item: any) => 
        currentProject && currentProject.id === item.project_id.id
    );

    let projectindex = 0;
    let flag1 = 0;

    if (res.length > 0 && projectCheck) {
        const value = tryParseJSON(res[0].value);
        if (value?.defaultproject) {
            portfolio.projectWithRoles.forEach((element: any, index: number) => {
                if (element.projectId.id === value.defaultproject) {
                    projectindex = index;
                    flag1 = 1;
                    const porfolios = tryStringifyJSON(element.projectId);
                    if (porfolios) {
                        context.globalState.update(STORAGE_KEYS.PROJECT, JSON.parse(porfolios));
                    }
                }
            });
        }
    }

    let index = determineProjectIndex(portfolio, context, flag1, projectindex);

    if (flag1 === 0) {
        await context.globalState.update(
            STORAGE_KEYS.PROJECT,
            currentProject || portfolio.projectWithRoles[index].projectId
        );
    }

    await processRoleSelection(context, userInfo, res, currentRole, flag1, projectindex, index);
    await context.globalState.update(STORAGE_KEYS.USER, userInfo.userId);
    
    const finalProject = context.globalState.get<any>(STORAGE_KEYS.PROJECT);
    await context.globalState.update(
        STORAGE_KEYS.ORGANIZATION,
        currentProject?.name || portfolio.projectWithRoles[index].projectId.name
    );

    logger.info('User access initialization completed with project:', finalProject?.name || 'Unknown');
}

function determineProjectIndex(portfolio: any, context: vscode.ExtensionContext, flag1: number, projectindex: number): number {
    if (flag1 === 1) {return projectindex;}
    
    let index = 0;
    if (portfolio.projectWithRoles.length > 1) {
        const autoUserProject = context.globalState.get<any>(STORAGE_KEYS.AUTO_USER_PROJECT);
        if (autoUserProject && portfolio.projectWithRoles[index].projectId.id === autoUserProject.id) {
            index++;
        }
    }
    return index;
}

async function processRoleSelection(
    context: vscode.ExtensionContext,
    userInfo: UserInfo,
    res: any[],
    currentRole: any,
    flag1: number,
    projectindex: number,
    index: number
): Promise<void> {
    let flag = 0;
    const portfolio = userInfo.porfolios![0];

    if (res.length > 0) {
        const project = context.globalState.get<any>(STORAGE_KEYS.PROJECT);
        const value = tryParseJSON(res[0].value);
        
        if (value) {
            const projectRoles = value.defaultprojectroles?.filter((item: any) => item.project === project.id) || [];
            
            if (projectRoles.length > 0) {
                const defaultrole = projectRoles[0].role;
                const clientDetailsDefaultRole = extractClientDetailsDefaultRole(userInfo.userId.clientDetails);
                const roleIndex = flag1 === 1 ? projectindex : index;

                if (clientDetailsDefaultRole) {
                    flag = trySetRoleFromClientDetails(
                        context,
                        portfolio.projectWithRoles[roleIndex].roleId,
                        clientDetailsDefaultRole
                    );
                }

                if (defaultrole && (!clientDetailsDefaultRole || flag === 0)) {
                    flag = trySetRoleFromDefault(
                        context,
                        portfolio.projectWithRoles[roleIndex].roleId,
                        defaultrole
                    );
                }
            }
        }
    }

    if (flag === 0) {
        const roleIndex = flag1 === 1 ? projectindex : index;
        await context.globalState.update(
            STORAGE_KEYS.ROLE,
            currentRole || portfolio.projectWithRoles[roleIndex].roleId[0]
        );
    }
}

function extractClientDetailsDefaultRole(clientDetails: string | undefined): string | null {
    if (!clientDetails) {return null;}

    const details = tryParseJSON(clientDetails);
    if (!Array.isArray(details)) {return null;}

    const defaultRoleItem = details.find((item: any) => item.pointer?.trim() === "defaultRole");
    return defaultRoleItem?.value || null;
}

function trySetRoleFromClientDetails(context: vscode.ExtensionContext, roles: any[], clientRole: string): number {
    const matchingRole = roles.find((element: any) => element.name.trim() === clientRole.trim());
    
    if (matchingRole) {
        const roleValue = tryStringifyJSON(matchingRole);
        if (roleValue) {
            context.globalState.update(STORAGE_KEYS.ROLE, JSON.parse(roleValue));
            return 1;
        }
    }
    return 0;
}

function trySetRoleFromDefault(context: vscode.ExtensionContext, roles: any[], defaultRoleId: string): number {
    const matchingRole = roles.find((element: any) => element.id === defaultRoleId);
    
    if (matchingRole) {
        const roleValue = tryStringifyJSON(matchingRole);
        if (roleValue) {
            context.globalState.update(STORAGE_KEYS.ROLE, JSON.parse(roleValue));
            return 1;
        }
    }
    return 0;
}

async function fallbackUserAccessInitialization(context: vscode.ExtensionContext, userInfo: UserInfo): Promise<void> {
    try {
        if (!userInfo.porfolios || userInfo.porfolios.length === 0 ||
            !userInfo.porfolios[0].projectWithRoles || userInfo.porfolios[0].projectWithRoles.length === 0) {
            logger.warn('Cannot perform fallback initialization - missing required data');
            return;
        }

        const portfolio = userInfo.porfolios[0];
        const firstProject = portfolio.projectWithRoles[0];

        await Promise.all([
            context.globalState.update(STORAGE_KEYS.USER, userInfo.userId),
            context.globalState.update(STORAGE_KEYS.PROJECT, firstProject.projectId),
            context.globalState.update(STORAGE_KEYS.ROLE, firstProject.roleId[0]),
            context.globalState.update(STORAGE_KEYS.ORGANIZATION, firstProject.projectId.name)
        ]);
    } catch (fallbackError) {
        logger.error('Fallback initialization also failed:', fallbackError);
    }
}


/**
 * Fetches dashboard constants (equivalent to Angular findAllDashConstant)
 * @param context - VS Code extension context
 * @param dashConstant - Dashboard constant query object
 * @param accessToken - JWT access token
 * @returns Dashboard constants response
 */
async function findAllDashConstant(
    context: vscode.ExtensionContext,
    project: any,
    role: any,
    dashConstant: DashConstantQuery,
    accessToken: string
): Promise<any> {
    logger.info('Fetching dashboard constants...');

    try {
        const baseUrl = context.globalState.get<string>(STORAGE_KEYS.BASE_URL, getBaseUrl());
        const apiUrl = `${baseUrl}/api/aip/service/v1/dashconstants/search`;

        const response = await makeSecureRequest('POST', apiUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'accept': REQUEST_HEADERS.ACCEPT,
                'content-type': REQUEST_HEADERS.CONTENT_TYPE,
                'x-requested-with': REQUEST_HEADERS.X_REQUESTED_WITH,
                'project': project.id,
                'projectname': project.name,
                'roleid': role.id,
                'rolename': role.name
            },
            data: { keys: dashConstant.keys }
        });

        logger.info('Dashboard constants fetched successfully');
        return response.data;
    } catch (error) {
        logger.error('Error fetching dashboard constants:', error);
        return { content: [] };
    }
}

/**
 * Fetches dashboard constants and configuration
 * @param context - VS Code extension context
 * @param accessToken - JWT access token
 */
async function getDashboardConstants(context: vscode.ExtensionContext, role: any, accessToken: string): Promise<void> {
    logger.info('Fetching dashboard constants...');
    
    try {
        logger.info('Dashboard constants fetch completed (placeholder)');
    } catch (error) {
        logger.error('Error fetching dashboard constants:', error);
    }
}

function tryParseJSON(jsonString: string | undefined): any {
    if (!jsonString) {return null;}
    
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        logger.error("JSON.parse error:", e);
        return null;
    }
}

function tryStringifyJSON(obj: any): string | null {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        logger.error("JSON.stringify error:", e);
        return null;
    }
}

/**
 * Checks if user has access to specific portfolio, project, and role
 * @param userInfo - User information object
 * @param pfolio - Portfolio object
 * @param prjct - Project object  
 * @param prole - Role object
 * @returns Boolean indicating access
 */
function checkUserAccess(userInfo: any, pfolio: any, prjct: any, prole: any): boolean {
    logger.info('Checking user access permissions...');

    try {
        // Implement access checking logic here
        // This is a placeholder - would need actual business logic
        if (userInfo && userInfo.porfolios && pfolio && prjct && prole) {
            // Check if user has access to the specified portfolio, project, and role
            return true; // Placeholder - implement actual logic
        }

        return false;

    } catch (error) {
        logger.error('Error checking user access:', error);
        return false;
    }
}

/**
 * Extracts URL parameter value between specified delimiters
 * @param url - URL string to parse
 * @param param - Parameter name to extract
 * @param endDelimiter - End delimiter (empty string for end of URL)
 * @returns Extracted parameter value
 */
function extractUrlParameter(url: string, param: string, endDelimiter: string): string {
    const startIndex = url.indexOf(param) + param.length + 1; // +1 for the = sign
    if (endDelimiter) {
        const endIndex = url.indexOf(endDelimiter, startIndex);
        return endIndex !== -1 ? url.slice(startIndex, endIndex) : url.slice(startIndex);
    } else {
        return url.slice(startIndex);
    }
}

/**
 * Decrypts data using AES256 encryption
 * @param encryptedData - Encrypted data string
 * @param salt - Salt/key for decryption
 * @returns Decrypted string
 */
async function decryptUsingAES256(encryptedData: string, salt: string): Promise<string> {
    logger.info('AES decryption requested');
    const cipherJson = JSON.parse(encryptedData);
    return await decryptgcm(cipherJson["ciphertext"], cipherJson["iv"], salt);
}

async function decryptgcm(ciphertext: string, iv: string, password: string): Promise<string> {
    const decodedCiphertext = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const decodedIV = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

    const algorithm = {
        name: 'AES-GCM',
        iv: decodedIV
    };

    const importedKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        algorithm,
        false,
        ['decrypt']
    );

    const decryptedData = await crypto.subtle.decrypt(algorithm, importedKey, decodedCiphertext);
    return new TextDecoder().decode(decryptedData);
}

async function handleActivationError(error: unknown): Promise<void> {
    logger.error('Failed to activate extension:', error);
    await vscode.window.showErrorMessage(
        `Failed to activate Essedum AI Platform extension: ${error}`
    );
}

// ================================
// EXTENSION DEACTIVATION
// ================================

/**
 * Extension deactivation function - called when extension is deactivated
 * 
 * Performs cleanup operations including:
 * - Clearing authentication state
 * - Disposing of service instances
 * - Cleaning up event listeners
 */
export async function deactivate(): Promise<void> {
    logger.info('Essedum AI Platform extension is being deactivated');

    try {
        if (authService) {
            await authService.clearStoredTokens();
        }

        authService = undefined as any;
        pipelineService = undefined as any;
        pipelineCardsProvider = undefined as any;
        essedumFileProvider = undefined as any;

        logger.info('Extension deactivation completed successfully');
    } catch (error) {
        logger.error('Error during extension deactivation:', error);
    }
}