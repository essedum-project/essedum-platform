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
import { EssedumFileSystemProvider } from './providers/essedum-file-provider';
import { PipelineService } from './services/pipeline.service';

// Configuration imports
import { initializeSSLBypass, setupAxiosDefaults, makeSecureRequest } from './constants/api-config';
import {
    AUTH_CONFIG,
    EXTENSION_CONFIG,
    COMMANDS,
    CONTEXT_KEYS,
    MESSAGES,
    UI_CONFIG,
    EXTERNAL_LINKS,
    DEBUG_CONFIG
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
// GLOBAL VARIABLES
// ================================

/** Extension logger instance */
const logger = createLogger('Extension');

/** Global service instances */
let authService: KeycloakAuthService;
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
        // Initialize SSL bypass before any HTTPS requests
        await initializeSSLConfiguration();

        // Initialize configuration from server before creating services
        await initializeConfiguration(context);

        // Create and configure authentication service with server config
        authService = createAuthenticationService(context);

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

        // Initialize pipeline services
        await initializePipelineServices(context);

        // Register all extension commands
        registerExtensionCommands(context);

        // Perform initial authentication check
        await checkAndUpdateAuthStatus(authService);

        logger.info('Extension activation completed successfully');

    } catch (error) {
        logger.error('Failed to activate extension:', error);
        await vscode.window.showErrorMessage(
            `Failed to activate Essedum AI Platform extension: ${error}`
        );
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

    try {
        // Fetch configuration from server using the secure request wrapper that handles SSL bypass
        const response = await makeSecureRequest('GET', 'https://essedum.az.ad.idemo-ppc.com/api/getConfigDetails', {
            timeout: 10000, // 10 second timeout
            withCredentials: true, // Include cookies for session management
            headers: {
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'en-US,en;q=0.9',
                'content-type': 'application/json',
                'priority': 'u=1, i',
                'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
                'x-requested-with': 'Leap'
            }
        });

        const config = response.data;
        logger.info('Configuration fetched successfully');

        // Store configuration in extension context globalState

        await context.globalState.update('dataLimit', config.data_limit);
        await context.globalState.update('autoUserCreation', config.autoUserCreation);
        await context.globalState.update('autoUserProject', config.autoUserProject);
        await context.globalState.update('activeProfiles', config.activeProfiles?.split(',') || []);
        await context.globalState.update('logoLocation', config.logoLocation);
        await context.globalState.update('theme', config.theme);
        await context.globalState.update('defaultTheme', config.theme);
        await context.globalState.update('font', config.font);
        await context.globalState.update('telemetryUrl', config.telemetryUrl);
        await context.globalState.update('telemetry', config.telemetry);
        await context.globalState.update('telemetryPdataId', config.telemetryPdataId);
        await context.globalState.update('capBaseUrl', config.capBaseUrl);
        await context.globalState.update('appVersion', config.appVersion);
        await context.globalState.update('leapAppYear', config.leapAppYear);
        await context.globalState.update('showPortfolioHeader', config.showPortfolioHeader);
        await context.globalState.update('showProfileIcon', config.showProfileIcon);
        await context.globalState.update('encDefault', config.encDefault);

        // Handle JWT token expiration for specific profiles
        const activeProfiles = config.activeProfiles?.split(',') || [];
        if (activeProfiles.includes('dbjwt')) {
            await context.globalState.update('expireTokenTime', config.expireTokenTime);
        }

        // Store OAuth configuration for authentication service
        const oauthConfig = {
            issuerUri: config.issuerUri || AUTH_CONFIG.ISSUER_URI,
            clientId: config.clientId || AUTH_CONFIG.CLIENT_ID,
            scope: config.scope || AUTH_CONFIG.SCOPE,
            responseType: 'code',
            useSilentRefresh: true,
            timeoutFactor: (typeof config.silentRefreshTimeoutFactor === 'number' &&
                config.silentRefreshTimeoutFactor > 0 &&
                config.silentRefreshTimeoutFactor <= 1)
                ? config.silentRefreshTimeoutFactor : 0.9,
            sessionChecksEnabled: true,
            showDebugInformation: DEBUG_CONFIG.VERBOSE_LOGGING,
            clearHashAfterLogin: false,
            strictDiscoveryDocumentValidation: false
        };

        await context.globalState.update('oauthConfig', oauthConfig);
        await context.globalState.update('baseUrl', config.baseUrl || '');

        logger.info('Configuration initialization completed successfully');

    } catch (error) {
        logger.warn('Failed to fetch configuration from server:', error);

        // Check if it's an SSL certificate error
        if (error instanceof Error &&
            (error.message.includes('certificate') ||
                error.message.includes('CERT_') ||
                error.message.includes('unable to get local issuer certificate') ||
                error.message.includes('self signed certificate'))) {
            logger.error('SSL Certificate Error detected. The server appears to be using a self-signed or untrusted certificate.');
            logger.error('SSL bypass should handle this, but the certificate validation is still failing.');

            // Try one more time with additional SSL bypass
            try {
                logger.info('Attempting configuration fetch with additional SSL bypass...');
                process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

                const axios = require('axios');
                const https = require('https');

                // Create a more aggressive HTTPS agent
                const agent = new https.Agent({
                    rejectUnauthorized: false,
                    checkServerIdentity: () => undefined,
                    requestCert: false,
                    agent: false
                });

                const fallbackResponse = await axios.get('https://essedum.az.ad.idemo-ppc.com/api/getConfigDetails', {
                    httpsAgent: agent,
                    timeout: 15000,
                    headers: {
                        'accept': 'application/json, text/plain, */*',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'x-requested-with': 'Leap'
                    }
                });

                const config = fallbackResponse.data;
                logger.info('Configuration fetched successfully with fallback method');

                // Store the configuration as before...
                await context.globalState.update('dataLimit', config.data_limit);
                await context.globalState.update('autoUserCreation', config.autoUserCreation);
                // ... (rest of the storage logic would go here)

                return; // Exit early if fallback worked

            } catch (fallbackError) {
                logger.error('Fallback configuration fetch also failed:', fallbackError);
            }
        }

        // Use default configuration if server fetch fails
        await context.globalState.update('theme', 'default');
        await context.globalState.update('defaultTheme', 'default');
        await context.globalState.update('activeProfiles', []);

        // Store default OAuth configuration
        const defaultOAuthConfig = {
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

        await context.globalState.update('oauthConfig', defaultOAuthConfig);

        // Don't throw error to allow extension to continue with defaults
        logger.info('Using default configuration due to server fetch failure');
    }
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
 * Creates and configures the Keycloak authentication service
 * @param context - VS Code extension context
 * @returns Configured authentication service
 */
function createAuthenticationService(context: vscode.ExtensionContext): KeycloakAuthService {
    logger.info('Creating authentication service...');

    // Get OAuth configuration from stored config (fetched from server) or use defaults
    const storedOAuthConfig = context.globalState.get('oauthConfig') as any;

    // Create Keycloak configuration using server config if available, otherwise defaults
    const keycloakConfig: KeycloakConfig = {
        issuerUri: storedOAuthConfig?.issuerUri || AUTH_CONFIG.ISSUER_URI,
        clientId: storedOAuthConfig?.clientId || AUTH_CONFIG.CLIENT_ID,
        scope: storedOAuthConfig?.scope || AUTH_CONFIG.SCOPE
    };

    logger.debug('Keycloak configuration:', keycloakConfig);
    logger.info('Using configuration from:', storedOAuthConfig ? 'server' : 'defaults');

    // Create authentication service with improved OAuth flow
    return new KeycloakAuthService(keycloakConfig, context);
}

/**
 * Creates the Essedum file system provider
 * @returns Configured file system provider
 */
function createFileSystemProvider(): EssedumFileSystemProvider {
    logger.info('Creating file system provider...');

    // Create Essedum file system provider with empty initial token
    return new EssedumFileSystemProvider('',null,null);
}

/**
 * Initializes pipeline-related services and providers
 * @param context - VS Code extension context
 */
async function initializePipelineServices(context: vscode.ExtensionContext): Promise<void> {
    logger.info('Initializing pipeline services...');

    try {
        // Attempt to get access token for initialization
        const accessToken = await authService.getAccessToken();

        await getUserAtLogin(extensionContext, accessToken);

        const project: any = context.globalState.get('project');
        const role: any = context.globalState.get('role');
        // Create pipeline service with token
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

        logger.info('Pipeline services initialized with valid token');

    } catch (error) {
        logger.warn('Failed to initialize pipeline services with token, creating with empty tokens:', error);
        const project: any = context.globalState.get('project');
        // Create services with empty tokens (will be updated when user logs in)
        pipelineService = new PipelineService('', project.name);
        pipelineCardsProvider = new PipelineCardsProvider(
            context,
            '',
            authService,
            essedumFileProvider,
            pipelineService
        );

        // Set authentication context to false since initialization failed
        await updateAuthenticationContext(false);
    }

    // Register the pipeline cards provider as the main webview
    registerWebviewViewProvider(
        context,
        EXTENSION_CONFIG.SIDEBAR_VIEW_ID,
        pipelineCardsProvider
    );

    logger.info('Pipeline services registration completed');
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

    // Register main sidebar command
    registerCommand(context, COMMANDS.OPEN_SIDEBAR, handleOpenSidebar);

    // Register authentication commands
    registerCommand(context, COMMANDS.LOGIN, handleLogin);
    registerCommand(context, COMMANDS.LOGOUT, handleLogout);
    registerCommand(context, COMMANDS.CHECK_AUTH, handleCheckAuth);

    // Register pipeline commands
    registerCommand(context, COMMANDS.RUN_PIPELINE, handleRunPipeline);

    // Register user info commands
    // Register user info commands
    registerCommand(context, COMMANDS.GET_USER_INFO, () => handleGetUserInfo());
    registerCommand(context, COMMANDS.REFRESH_USER_INFO, () => handleRefreshUserInfo());

    // Add debug and clear commands
    registerCommand(context, 'essedum.clearUserData', handleClearUserData);
    registerCommand(context, 'essedum.debugUserData', handleDebugUserData);
    logger.info('All extension commands registered successfully');
}

// ================================
// COMMAND HANDLERS
// ================================

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

        const accessToken = authResult.access_token;
        logger.info('Authentication successful, token length:', accessToken?.length || 0);

        // Store tokens in extension context for consistency with web app
        await extensionContext.globalState.update('jwtToken', accessToken);
        await extensionContext.globalState.update('accessToken', accessToken);

        // Update services with new token
        await updateServicesWithToken(accessToken);

        // Fetch and process user information after successful authentication
        await getUserAtLogin(extensionContext, accessToken);

        // Update authentication context
        await updateAuthenticationContext(true);

        // Open the sidebar to show updated view
        await safeExecuteCommand(COMMANDS.VSCODE.OPEN_EXTENSION_VIEW);

        // Show success message
        const selection = await showSuccessMessage(
            MESSAGES.SUCCESS.LOGIN_SUCCESS,
            UI_CONFIG.BUTTONS.VIEW_PIPELINES
        );

        if (selection === UI_CONFIG.BUTTONS.VIEW_PIPELINES) {
            await safeExecuteCommand(COMMANDS.VSCODE.OPEN_EXTENSION_VIEW);
        }

        logger.info('Login process completed successfully');

    } catch (error) {
        logger.error('Authentication failed:', error);

        const userMessage = getAuthErrorMessage(error);
        await showErrorWithOptions(
            userMessage,
            COMMANDS.LOGIN,
            EXTERNAL_LINKS.KEYCLOAK_DOCS
        );

        throw error; // Re-throw for any additional error handling
    }
}

/**
 * Handles the user logout command
 */
async function handleLogout(): Promise<void> {
    logger.info('Starting logout process...');

    try {
        // Clear stored tokens without browser redirect
        await authService.clearStoredTokens();

        // Clear ALL user data from globalState
        await clearAllUserData(extensionContext);

        // Clear service tokens
        await updateServicesWithToken('');

        // Update authentication context
        await updateAuthenticationContext(false);

        // Reload initial content
        if (pipelineCardsProvider) {
            pipelineCardsProvider.loadInitialContent();
        }

        await vscode.window.showInformationMessage(MESSAGES.SUCCESS.LOGOUT_SUCCESS);

        logger.info('Logout completed successfully');

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
async function clearAllUserData(context: vscode.ExtensionContext): Promise<void> {
    logger.info('Clearing all cached user data...');

    const keysToCllear = [
        // User authentication data
        'user', 'role', 'project', 'organization',
        'currentUserInfo', 'userInfoData', 'userPortfolios',
        'jwtToken', 'accessToken', 'currentProject',
        'currentPortfolio', 'UpdatedUser', 'returnUrl',

        // Configuration data that might contain user-specific info
        'theme', 'defaultTheme', 'font',

        // Additional cached data
        'dashConstants', 'userPreferences', 'selectedRole',
        'selectedProject', 'selectedPortfolio'
    ];

    for (const key of keysToCllear) {
        await context.globalState.update(key, undefined);
        logger.debug(`Cleared key: ${key}`);
    }

    logger.info('All user data cleared from cache');
}

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
        // Store token information
        await context.globalState.update('jwtToken', accessToken);

        // Parse return URL if exists (VS Code equivalent of localStorage.getItem("returnUrl"))
        const returnUrl = context.globalState.get('returnUrl', '') as string;
        let pfolio: any, prjct: any, prole: any;
        let userAccess = false;

        // Parse portfolio, project, and role from return URL if available
        if (returnUrl && returnUrl.includes('pfolio') && returnUrl.includes('&prjct') && returnUrl.includes('&prole')) {
            const autoportfolio = extractUrlParameter(returnUrl, 'pfolio', '&prjct');
            const autoproject = extractUrlParameter(returnUrl, 'prjct', '&prole');
            const autorole = extractUrlParameter(returnUrl, 'prole', '');

            logger.info('Extracted URL parameters:', { autoportfolio, autoproject, autorole });

            // In VS Code extension, we might not need these specific calls but log for reference
            logger.info('Would fetch portfolio, project, and role data in web app');
        }

        // Fetch user information
        const userInfo = await getUserInfoData(context, accessToken);

        if (!userInfo) {
            logger.warn('No user info received');
            return;
        }

        if (!userInfo.porfolios || userInfo.porfolios.length === 0) {
            logger.info('User has no portfolios');

            // Check active profiles for auto user creation
            const activeProfiles = getConfigurationValue(context, 'activeProfiles', []) as string[];
            const autoUserCreation = getConfigurationValue(context, 'autoUserCreation', false);

            if (activeProfiles.includes('keycloak') ||
                activeProfiles.includes('msal') ||
                activeProfiles.includes('aicloud')) {

                if (!autoUserCreation) {
                    logger.info('Auto user creation disabled, user needs permissions');
                    await vscode.window.showWarningMessage(
                        'You do not have access to any portfolios. Please contact your administrator for access.'
                    );
                } else {
                    logger.info('Auto user creation enabled');
                    await vscode.window.showInformationMessage(
                        'Setting up your account automatically...'
                    );
                }
            }
        } else {
            logger.info('User has portfolios, initializing user access');

            // Initialize user access (VS Code equivalent of initUserAccess)
            await initUserAccess(context, userInfo, accessToken);

            const role = context.globalState.get('role');
            // Get dashboard constants (VS Code equivalent of getDashConsts)
            await getDashboardConstants(context, role, accessToken);

            // Check user access if return URL and entities are available
            if (returnUrl && pfolio && prjct && prole) {
                userAccess = checkUserAccess(userInfo, pfolio, prjct, prole);
                if (userAccess) {
                    logger.info('User has access, would navigate to return URL in web app');
                    await vscode.window.showInformationMessage('Access verified successfully!');
                }
            }

            if (!userAccess) {
                logger.info('No specific access or no return URL, showing default view');
                // In VS Code, open the main extension view instead of navigating to landing page
                await safeExecuteCommand(COMMANDS.VSCODE.OPEN_EXTENSION_VIEW);
            }
        }

    } catch (error) {
        logger.error('Error processing user information:', error);

        // Handle error case similar to Angular catch block
        const activeProfiles = getConfigurationValue(context, 'activeProfiles', []) as string[];
        const autoUserCreation = getConfigurationValue(context, 'autoUserCreation', false);

        if (activeProfiles.includes('keycloak') || activeProfiles.includes('msal')) {
            if (!autoUserCreation) {
                logger.info('Error getting user info and auto user creation disabled');
                await vscode.window.showErrorMessage(
                    'Unable to retrieve user information. Please contact your administrator.'
                );
            }
        }
    }
}

/**
 * Fetches user information from the server
 * @param context - VS Code extension context
 * @param accessToken - JWT access token
 * @returns User information or null if error
 */
async function getUserInfoData(context: vscode.ExtensionContext, accessToken: string): Promise<any> {
    logger.info('Fetching user information...');

    try {
        // Check if we have cached user info (VS Code equivalent of sessionStorage.getItem("UpdatedUser"))
        // const updatedUser = context.globalState.get('UpdatedUser', false);
        // const cachedUserInfo = context.globalState.get('userInfoData');

        // if (!updatedUser && cachedUserInfo) {
        //     logger.info('Using cached user information');
        //     return cachedUserInfo;
        // }

        // Fetch fresh user info from server
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
async function getUserInfo(context: vscode.ExtensionContext, accessToken: string): Promise<any> {
    logger.info('Fetching user info from API...');

    try {
        const salt = getConfigurationValue(context, 'encDefault', '');

        const response = await makeSecureRequest('GET', 'https://essedum.az.ad.idemo-ppc.com/api/userInfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'accept': 'application/json, text/plain, */*',
                'content-type': 'application/json',
                'x-requested-with': 'Leap'
            },
            responseType: 'text'
        });

        let result: any;
        if (salt) {
            // Decrypt the response if encryption is enabled
            result = JSON.parse(await decryptUsingAES256(response.data, salt));
        } else {
            // Parse as regular JSON if no encryption
            result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        }

        // Cache the user info
        await context.globalState.update('userInfoData', result);
        await context.globalState.update('UpdatedUser', false);

        logger.info('User information fetched and cached successfully');
        return result;

    } catch (error) {
        logger.error('Error fetching user info from API:', error);

        // VS Code equivalent of redirecting to unauthorized page
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
async function initUserAccess(context: vscode.ExtensionContext, userInfo: any, accessToken: string): Promise<void> {
    logger.info('Initializing user access settings...');

    try {
        // Store user information in context
        await context.globalState.update('currentUserInfo', userInfo);
        await context.globalState.update('userPortfolios', userInfo.porfolios || []);

        if (!userInfo.porfolios || userInfo.porfolios.length === 0) {
            logger.warn('No portfolios available for user');
            return;
        }

        // Initialize dashboard constants query object
        const dashconstant1: any = {
            keys: userInfo.porfolios[0].porfolioId.portfolioName + "default"
        };

        let flag1 = 0;
        let projectindex = 0;
        const currentProject = context.globalState.get('project') as any;
        const currentRole = context.globalState.get('role') as any;
        let projectCheck = false;

        try {
            // Fetch dashboard constants (equivalent to findAllDashConstant)
            const dashConstants = await findAllDashConstant(context, userInfo.porfolios[0].projectWithRoles[0].projectId, currentRole, dashconstant1, accessToken);

            // Filter constants for current portfolio
            let res = dashConstants.content || [];
            res = res.filter((item: any) => item.keys === userInfo.porfolios[0].porfolioId.portfolioName + "default");

            // Check if current project exists in dashboard constants
            res.forEach((item: any) => {
                if (currentProject && currentProject.id === item.project_id.id) {
                    projectCheck = true;
                    return;
                }
            });

            // Process dashboard constants if available and project check passes
            if (res && res.length > 0 && projectCheck) {
                let temp: any;
                try {
                    temp = JSON.parse(res[0].value);
                } catch (e: any) {
                    logger.error("JSON.parse error - ", e);
                }

                const value = temp;
                const defaultproject = value.defaultproject;

                if (defaultproject) {
                    userInfo.porfolios[0].projectWithRoles.forEach((element: any, index: number) => {
                        if (element.projectId.id === defaultproject) {
                            projectindex = index;
                            flag1 = 1;
                            try {
                                const porfolios = JSON.stringify(userInfo.porfolios[0].projectWithRoles[projectindex].projectId);
                                context.globalState.update('project', JSON.parse(porfolios));
                            } catch (e: any) {
                                logger.error("JSON.parse error - ", e);
                            }
                        }
                    });
                }
            }

            // Determine project index
            let index = 0;
            if (userInfo.porfolios[0].projectWithRoles.length > 1) {
                const autoUserProject = getConfigurationValue(context, 'autoUserProject', null) as any;
                if (autoUserProject && userInfo.porfolios[0].projectWithRoles[index].projectId.id === autoUserProject.id) {
                    index++;
                }
            }

            if (flag1 === 1) {
                index = projectindex;
            }

            // Set project in storage
            if (flag1 === 0) {
                if (currentProject) {
                    await context.globalState.update('project', currentProject);
                } else {
                    await context.globalState.update('project', userInfo.porfolios[0].projectWithRoles[index].projectId);
                }
            }

            // Process role selection
            let flag = 0;
            if (res && res.length > 0) {
                const project = context.globalState.get('project') as any;
                let value: any[] = [];

                try {
                    const parsedValue = JSON.parse(res[0].value);
                    value = parsedValue.defaultprojectroles.filter((item: any) => item.project === project.id);
                } catch (e: any) {
                    logger.error("JSON.parse error processing default project roles - ", e);
                }

                if (value.length > 0) {
                    const defaultrole = value[0].role;
                    let clientDetailsDefaultRole: string | null = null;

                    // Check for client details default role
                    if (userInfo.userId.clientDetails) {
                        try {
                            const temp = JSON.parse(userInfo.userId.clientDetails);
                            temp.forEach((item: any) => {
                                if (item.pointer.trim() === "defaultRole" && !clientDetailsDefaultRole) {
                                    clientDetailsDefaultRole = item.value;
                                    return;
                                }
                            });
                        } catch (e: any) {
                            logger.error("Error parsing client details - ", e);
                        }
                    }

                    let clientFlag = false;

                    // Try to set role from client details
                    if (clientDetailsDefaultRole) {
                        let roleIndex = flag1 === 1 ? projectindex : index;
                        userInfo.porfolios[0].projectWithRoles[roleIndex].roleId.forEach((element: any) => {
                            if (element.name.trim() === clientDetailsDefaultRole!.trim()) {
                                clientFlag = true;
                                try {
                                    const roleValue = JSON.stringify(element);
                                    context.globalState.update('role', JSON.parse(roleValue));

                                } catch (e: any) {
                                    logger.error("JSON.stringify error - ", e);
                                }
                                flag = 1;
                            }
                        });
                    }

                    // Use default role if client role not found or not specified
                    if (defaultrole && (!clientDetailsDefaultRole || !clientFlag)) {
                        let roleIndex = flag1 === 1 ? projectindex : index;
                        userInfo.porfolios[0].projectWithRoles[roleIndex].roleId.forEach((element: any) => {
                            if (element.id === defaultrole) {
                                try {
                                    const roleValue = JSON.stringify(element);
                                    context.globalState.update('role', JSON.parse(roleValue));

                                } catch (e: any) {
                                    logger.error("JSON.stringify error - ", e);
                                }
                                flag = 1;
                            }
                        });
                    }
                }
            }

            // Store user information
            await context.globalState.update('user', userInfo.userId);

            // Set organization
            const finalProject = context.globalState.get('project') as any;
            if (currentProject) {
                await context.globalState.update('organization', currentProject.name);
            } else {
                await context.globalState.update('organization', userInfo.porfolios[0].projectWithRoles[index].projectId.name);
            }

            // Set role if not already set
            if (flag === 0) {
                if (currentRole) {
                    await context.globalState.update('role', currentRole);
                } else {
                    await context.globalState.update('role', userInfo.porfolios[0].projectWithRoles[index].roleId[0]);
                }

            }

            // Log final project selection
            const finalProjectSelection = context.globalState.get('project') as any;
            logger.info('User access initialization completed with project:', finalProjectSelection?.name || 'Unknown');

        } catch (error) {
            logger.error('Error fetching dashboard constants, using fallback initialization:', error);

            // Fallback initialization if dashboard constants fail
            await context.globalState.update('user', userInfo.userId);
            await context.globalState.update('project', userInfo.porfolios[0].projectWithRoles[0].projectId);
            await context.globalState.update('role', userInfo.porfolios[0].projectWithRoles[0].roleId[0]);
            await context.globalState.update('organization', userInfo.porfolios[0].projectWithRoles[0].projectId.name);

        }

        // Set default project and organization if available (keeping original logic as backup)
        if (userInfo.porfolios && userInfo.porfolios.length > 0) {
            const defaultPortfolio = userInfo.porfolios[0];
            await context.globalState.update('currentPortfolio', defaultPortfolio);

            if (defaultPortfolio.projects && defaultPortfolio.projects.length > 0) {
                const defaultProject = defaultPortfolio.projects[0];
                await context.globalState.update('currentProject', defaultProject);
            }
        }

        logger.info('User access initialization completed successfully');

    } catch (error) {
        logger.error('Error initializing user access:', error);

        // Minimal fallback if everything fails
        try {
            await context.globalState.update('user', userInfo.userId);
            if (userInfo.porfolios && userInfo.porfolios.length > 0 &&
                userInfo.porfolios[0].projectWithRoles && userInfo.porfolios[0].projectWithRoles.length > 0) {
                await context.globalState.update('project', userInfo.porfolios[0].projectWithRoles[0].projectId);
                await context.globalState.update('role', userInfo.porfolios[0].projectWithRoles[0].roleId[0]);
                await context.globalState.update('organization', userInfo.porfolios[0].projectWithRoles[0].projectId.name);

            }
        } catch (fallbackError) {
            logger.error('Fallback initialization also failed:', fallbackError);
        }
    }
}

/**
 * Fetches dashboard constants (equivalent to Angular findAllDashConstant)
 * @param context - VS Code extension context
 * @param dashConstant - Dashboard constant query object
 * @param accessToken - JWT access token
 * @returns Dashboard constants response
 */
async function findAllDashConstant(context: vscode.ExtensionContext, project: any, role: any, dashConstant: any, accessToken: string): Promise<any> {
    logger.info('Fetching dashboard constants...');

    try {
        // Build the API endpoint for dashboard constants
        const baseUrl = getConfigurationValue<string>(context, 'baseUrl', 'https://essedum.az.ad.idemo-ppc.com');
        const apiUrl = `${baseUrl}/api/aip/service/v1/dashconstants/search`;

        // Prepare request payload
        const payload = {
            keys: dashConstant.keys,
            // Add other necessary parameters based on your API requirements
        };

        const response = await makeSecureRequest('POST', apiUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'accept': 'application/json, text/plain, */*',
                'content-type': 'application/json',
                'x-requested-with': 'Leap',
                'project': project.id, // Default project ID
                'projectname': project.name, // Default project name
                'roleid': role.id,
                'rolename': role.name
            },
            data: payload
        });

        logger.info('Dashboard constants fetched successfully');
        return response.data;

    } catch (error) {
        logger.error('Error fetching dashboard constants:', error);

        // Return empty response structure to allow graceful fallback
        return {
            content: []
        };
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
        // This would be equivalent to getDashConsts() in Angular
        // For now, we'll just log that this step would occur
        logger.info('Dashboard constants fetch completed (placeholder)');

    } catch (error) {
        logger.error('Error fetching dashboard constants:', error);
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
    // Placeholder for AES decryption - would need actual crypto implementation
    logger.info('AES decryption requested (placeholder implementation)');
    let cipherJson = JSON.parse(encryptedData);
    let output = await decryptgcm(cipherJson["ciphertext"], cipherJson["iv"], salt);
    return output;
    // For now, return the data as-is assuming it's not encrypted
    // In a real implementation, you would use Node.js crypto module
}

async function decryptgcm(ciphertext: string, iv: string, password: string): Promise<string> {
    // Decode the ciphertext and IV from Base64 strings
    const decodedCiphertext = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const decodedIV = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

    // Prepare the decryption parameters 
    const algorithm = {
        name: 'AES-GCM',
        iv: decodedIV
    };

    // Import the key from password
    const importedKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        algorithm,
        false,
        ['decrypt']
    );

    const decryptedData = await crypto.subtle.decrypt(algorithm, importedKey, decodedCiphertext);
    const decryptedText = new TextDecoder().decode(decryptedData);

    return decryptedText;

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
        // Clear authentication state if available
        if (authService) {
            await authService.clearStoredTokens();
        }

        // Clear service references
        authService = undefined as any;
        pipelineService = undefined as any;
        pipelineCardsProvider = undefined as any;
        essedumFileProvider = undefined as any;

        logger.info('Extension deactivation completed successfully');

    } catch (error) {
        logger.error('Error during extension deactivation:', error);
    }
}