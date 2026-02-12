/**
 * Essedum AI Platform VS Code Extension
 * 
 * Main entry point - orchestrates initialization, command registration, and lifecycle.
 * All business logic is delegated to utility modules for maintainability.
 * 
 * @author Essedum AI Platform Team
 * @version 1.0.21
 */

import * as vscode from 'vscode';

// Service imports
import { KeycloakAuthService, LoginScreenProvider } from './auth';
import { NavigationScreenProvider } from './app/navigation/navigation-screen';
import { EssedumFileSystemProvider } from './providers/essedum-file-provider';
import { PipelineCardsProvider } from './app/pipeline/pipeline-cards';
import { PipelineAgentProvider } from './app/pipeline-agent/pipeline-agent';
import { PipelineService } from './services/pipeline.service';
import { PipelineAgentService } from './services/pipeline-agent.service';

// Utility modules
import * as ExtensionUtils from './utils/extension-utils';
import * as ConfigUtils from './utils/config-utils';
import * as AuthSetupUtils from './utils/auth-setup-utils';
import * as InitializationUtils from './utils/initialization-utils';
import * as CommandHandlers from './utils/command-handlers';
import * as ServiceManager from './utils/service-manager';
import * as AppConstants from './constants/app-constants';
import { NetworkType } from './auth/constants/auth-constants';

// Messages
import { MESSAGES as MSG } from './messages/extension-messages';

/** Logger for the main extension */
const logger = ExtensionUtils.createLogger('Extension');

/** Activation guard to prevent re-entrancy */
let activating = false;

/** Global extension context */
let context: vscode.ExtensionContext;

/** Service instances */
let authService: KeycloakAuthService;
let loginScreenProvider: LoginScreenProvider;
let navigationScreenProvider: NavigationScreenProvider;
let fileSystemProvider: EssedumFileSystemProvider;
let pipelineService: PipelineService;
let pipelineCardsProvider: PipelineCardsProvider;
let pipelineAgentService: PipelineAgentService;
let pipelineAgentProvider: PipelineAgentProvider;

// ================================
// EXTENSION LIFECYCLE
// ================================

/**
 * Extension activation entry point
 * 
 * Initialization flow:
 * 1. SSL configuration
 * 2. Authentication service setup
 * 3. File system provider creation
 * 4. Webview provider registration
 * 5. Pipeline services initialization
 * 6. Command registration
 * 7. Initial screen display (login or navigation)
 */
export async function activate(extensionContext: vscode.ExtensionContext): Promise<void> {
    // Guard against re-entrancy
    if (activating) {
        logger.warn('Activation already in progress, skipping');
        return;
    }

    activating = true;
    logger.info(AppConstants.MESSAGES.SUCCESS.EXTENSION_ACTIVATED);
    context = extensionContext;

    try {
        await ExtensionUtils.updateAuthenticationContext(false);

        // Step 1: Initialize SSL configuration with error handling
        try {
            await InitializationUtils.initializeSSL(context);
        } catch (sslError) {
            logger.warn('SSL initialization failed, falling back to default trust store', sslError);
            // Continue with degraded mode - SSL errors are often non-fatal in corporate networks
        }

        // Step 2: Set up authentication service
        const authResult = await AuthSetupUtils.initializeAuthenticationService(context);
        authService = authResult.service;
        const hasValidAuth = authResult.isAuthenticated;

        // Set authentication context keys for UI state
        await vscode.commands.executeCommand('setContext', 'essedum.isAuthenticated', hasValidAuth);

        // Step 3: Create providers
        loginScreenProvider = InitializationUtils.createLoginProvider(context);
        fileSystemProvider = InitializationUtils.createFileSystemProvider(context);

        // Register file system provider (disposable tracked internally)
        ExtensionUtils.registerFileSystemProvider(
            context,
            AppConstants.EXTENSION_CONFIG.FILE_SYSTEM_SCHEME,
            fileSystemProvider,
            { isCaseSensitive: true, isReadonly: false }
        );

        // Step 4: Initialize configuration if network is set
        if (hasValidAuth || await AuthSetupUtils.hasStoredNetworkConfig(context)) {
            await ConfigUtils.initializeConfiguration(context);
        }

        // Step 5: Register webview providers
        navigationScreenProvider = InitializationUtils.registerWebviewProviders(
            context,
            loginScreenProvider,
            authService
        );

        // Step 6: Initialize pipeline services if authenticated
        if (hasValidAuth || await AuthSetupUtils.hasStoredNetworkConfig(context)) {
            const services = await InitializationUtils.initializePipelineServices(
                context,
                authService,
                fileSystemProvider
            );

            pipelineService = services.pipelineService;
            pipelineCardsProvider = services.pipelineCardsProvider;
            pipelineAgentService = services.pipelineAgentService;
            pipelineAgentProvider = services.pipelineAgentProvider;
        }

        // Step 7: Register commands
        registerCommands();

        // Step 8: Set up configuration change listener
        const configDisposable = vscode.workspace.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration('essedum')) {
                logger.info('Configuration changed, reinitializing');
                try {
                    await ConfigUtils.initializeConfiguration(context);
                    // Refresh views if they exist
                    if (navigationScreenProvider) {
                        await vscode.commands.executeCommand('workbench.action.webview.reloadWebviewAction');
                    }
                } catch (error) {
                    logger.error('Failed to reload configuration:', error);
                }
            }
        });
        context.subscriptions.push(configDisposable);

        // Step 9: Determine initial screen to show
        await InitializationUtils.showInitialScreen(context, hasValidAuth);

        logger.info(MSG.ACTIVATION.ACTIVATION_COMPLETED);

    } catch (error) {
        logger.error('Extension activation failed:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const choice = await vscode.window.showErrorMessage(
            `Failed to activate Essedum AI Platform extension: ${errorMessage}`,
            'Open Logs',
            'Retry Activation'
        );

        if (choice === 'Open Logs') {
            await vscode.commands.executeCommand('workbench.action.openLogsFolder');
        } else if (choice === 'Retry Activation') {
            activating = false; // Reset flag before retry
            await activate(context);
        }
    } finally {
        activating = false;
    }
}

/**
 * Extension deactivation entry point
 * Cleanup operations before extension unloads
 */
export async function deactivate(): Promise<void> {
    logger.info('Deactivating extension');

    // Collect all disposables before clearing subscriptions
    const disposables = context ? [...context.subscriptions] : [];
    if (context) {
        context.subscriptions.length = 0;
    }

    try {
        // Clear authentication tokens
        if (authService) {
            await authService.clearStoredTokens();
        }

        // Cleanup services
        ServiceManager.cleanupServices({
            pipelineCardsProvider,
            pipelineAgentProvider,
            essedumFileProvider: fileSystemProvider,
            pipelineService
        });

        // Dispose all registered disposables
        disposables.forEach(disposable => {
            try {
                disposable.dispose();
            } catch (error) {
                // Ignore disposal errors to ensure all items are attempted
                logger.warn('Error disposing resource:', error);
            }
        });

        logger.info('Extension deactivated successfully');
    } catch (error) {
        logger.error('Error during deactivation:', error);
    }
}

// ================================
// COMMAND REGISTRATION
// ================================

/**
 * Registers all extension commands with their handlers from utility modules
 */
function registerCommands(): void {
    logger.info(MSG.COMMAND.REGISTERING);

    const commands = [
        // Internal commands
        {
            id: 'essedum.internal.processLogin', handler: (token: string) =>
                CommandHandlers.processLogin(context, token, updateServices)
        },

        // Authentication
        { id: AppConstants.COMMANDS.SHOW_LOGIN_SCREEN, handler: CommandHandlers.showLoginScreen },
        {
            id: AppConstants.COMMANDS.LOGIN, handler: () =>
                CommandHandlers.handleLogin(context, authService, updateServices)
        },
        {
            id: AppConstants.COMMANDS.LOGIN_WITH_NETWORK, handler: (type?: NetworkType) =>
                CommandHandlers.handleLoginWithNetwork(context, authService, updateServices, type)
        },
        {
            id: AppConstants.COMMANDS.LOGOUT, handler: () =>
                CommandHandlers.handleLogout(context, authService, updateServices, pipelineCardsProvider)
        },
        {
            id: AppConstants.COMMANDS.CHECK_AUTH, handler: () =>
                CommandHandlers.handleCheckAuth(authService)
        },
        {
            id: 'essedum.showSessionInfo', handler: () =>
                authService?.showSessionInfo()
        },

        // Navigation
        {
            id: AppConstants.COMMANDS.OPEN_SIDEBAR, handler: () =>
                ExtensionUtils.safeExecuteCommand(AppConstants.COMMANDS.VSCODE.OPEN_EXTENSION_VIEW)
        },
        {
            id: AppConstants.COMMANDS.SHOW_NAVIGATION, handler: () =>
                CommandHandlers.setNavigationContext(context)
        },
        {
            id: AppConstants.COMMANDS.SHOW_PIPELINE, handler: () =>
                CommandHandlers.setPipelineContext(context)
        },
        {
            id: AppConstants.COMMANDS.SHOW_PIPELINE_AGENT, handler: () =>
                CommandHandlers.setPipelineAgentContext(context)
        },
        {
            id: AppConstants.COMMANDS.BACK_TO_NAVIGATION, handler: () =>
                CommandHandlers.setNavigationContext(context)
        },

        // Pipeline
        {
            id: AppConstants.COMMANDS.RUN_PIPELINE, handler: (name?: string) =>
                CommandHandlers.handleRunPipeline(pipelineCardsProvider, name)
        },

        // User data
        {
            id: AppConstants.COMMANDS.GET_USER_INFO, handler: () =>
                CommandHandlers.handleGetUserInfo(context)
        },
        {
            id: AppConstants.COMMANDS.REFRESH_USER_INFO, handler: () =>
                CommandHandlers.handleRefreshUserInfo(context)
        },
        {
            id: AppConstants.COMMANDS.CLEAR_USER_DATA, handler: () =>
                CommandHandlers.handleClearUserData(context)
        },
        {
            id: AppConstants.COMMANDS.DEBUG_USER_DATA, handler: () =>
                CommandHandlers.handleDebugUserData(context)
        },

        // Pipeline Agent       
        {
            id: 'essedum.uploadAgentFolder', handler: (uri?: vscode.Uri) =>
                CommandHandlers.handleUploadAgentFolder(context, pipelineAgentProvider, uri)
        }
    ];

    commands.forEach(({ id, handler }) => {
        ExtensionUtils.registerCommand(context, id, handler);
    });

    logger.info(MSG.COMMAND.REGISTERED);
}

// ================================
// SERVICE MANAGEMENT
// ================================

/**
 * Updates all services with new authentication token
 * Delegates to ServiceManager utility
 * Uses defensive null checks since services may not be initialized yet
 */
async function updateServices(accessToken: string): Promise<void> {
    await ServiceManager.updateServicesWithToken(accessToken, {
        pipelineCardsProvider: pipelineCardsProvider ?? undefined,
        pipelineAgentProvider: pipelineAgentProvider ?? undefined,
        essedumFileProvider: fileSystemProvider ?? undefined,
        pipelineService: pipelineService ?? undefined
    }, context);
}
