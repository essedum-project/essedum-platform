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
import { initializeSSLBypass, setupAxiosDefaults } from './constants/api-config';
import {
    AUTH_CONFIG,
    PROJECT_CONFIG,
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

    try {
        // Initialize SSL bypass before any HTTPS requests
        await initializeSSLConfiguration();

        // Create and configure authentication service
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
 * Initializes SSL bypass configuration for HTTPS requests
 */
async function initializeSSLConfiguration(): Promise<void> {
    logger.info('Initializing SSL configuration...');
    
    // Initialize SSL bypass before any HTTPS requests
    initializeSSLBypass();
    setupAxiosDefaults();
    
    logger.info('SSL bypass configuration completed');
}

/**
 * Creates and configures the Keycloak authentication service
 * @param context - VS Code extension context
 * @returns Configured authentication service
 */
function createAuthenticationService(context: vscode.ExtensionContext): KeycloakAuthService {
    logger.info('Creating authentication service...');
    
    // Create Keycloak configuration
    const keycloakConfig: KeycloakConfig = {
        issuerUri: AUTH_CONFIG.ISSUER_URI,
        clientId: AUTH_CONFIG.CLIENT_ID,
        scope: AUTH_CONFIG.SCOPE
    };

    logger.debug('Keycloak configuration:', keycloakConfig);

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
    return new EssedumFileSystemProvider('');
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
        
        // Create pipeline service with token
        pipelineService = new PipelineService(accessToken, PROJECT_CONFIG.DEFAULT_ORGANIZATION);
        
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
        
        // Create services with empty tokens (will be updated when user logs in)
        pipelineService = new PipelineService('', PROJECT_CONFIG.DEFAULT_ORGANIZATION);
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

        // Update services with new token
        await updateServicesWithToken(accessToken);

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

// ================================
// UTILITY FUNCTIONS
// ================================

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
            // Re-create pipeline service if it doesn't exist and we have a token
            pipelineService = new PipelineService(accessToken, PROJECT_CONFIG.DEFAULT_ORGANIZATION);
        }

        logger.info('Services updated with new token successfully');

    } catch (error) {
        logger.error('Failed to update services with token:', error);
        throw error;
    }
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