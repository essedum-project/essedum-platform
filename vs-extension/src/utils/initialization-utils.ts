/**
 * Extension Initialization Utilities
 * 
 * Handles the initialization of services, providers, and event handlers during extension activation.
 * This module centralizes all setup logic to keep the main extension file clean and focused.
 */

import * as vscode from 'vscode';
import { KeycloakAuthService, LoginScreenProvider } from '../auth';
import { NavigationScreenProvider } from '../app/navigation/navigation-screen';
import { EssedumFileSystemProvider } from '../providers/essedum-file-provider';
import { PipelineService } from '../services/pipeline.service';
import { PipelineCardsProvider } from '../app/pipeline/pipeline-cards';
import { PipelineAgentService } from '../services/pipeline-agent.service';
import { PipelineAgentProvider } from '../app/pipeline-agent/pipeline-agent';
import { NetworkConfig } from '../auth/constants/auth-constants';
import { STORAGE_KEYS } from '../constants/extension-constants';
import * as AppConstants from '../constants/app-constants';
import * as ExtensionUtils from './extension-utils';
import * as ConfigUtils from './config-utils';
import * as UserUtils from './user-utils';
import { initializeSSLConfig } from './ssl-config.util';
import { setupAxiosDefaults } from '../constants/api-config';
import { MESSAGES as MSG } from '../messages/extension-messages';

const logger = ExtensionUtils.createLogger('InitializationUtils');

/** Track registered webview providers to prevent double registration */
const registeredProviders: Set<string> = new Set();

/**
 * Initializes SSL configuration for secure HTTPS requests
 * Configures SSL bypass for specific networks if needed
 */
export async function initializeSSL(context: vscode.ExtensionContext): Promise<void> {
    logger.info(MSG.SSL.INITIALIZING);
    initializeSSLConfig(context);
    setupAxiosDefaults(context);
    logger.info(MSG.SSL.COMPLETED);
}

/**
 * Creates and configures the login screen provider
 */
export function createLoginProvider(context: vscode.ExtensionContext): LoginScreenProvider {
    logger.info(MSG.LOGIN_SCREEN.CREATING_PROVIDER);
    return new LoginScreenProvider(context.extensionUri, context);
}

/**
 * Creates the file system provider for remote file access
 */
export function createFileSystemProvider(context: vscode.ExtensionContext): EssedumFileSystemProvider {
    logger.info(MSG.FILE_SYSTEM.CREATING);
    return new EssedumFileSystemProvider('', null, null, context);
}

/**
 * Registers all webview providers (login, navigation, pipeline)
 */
export function registerWebviewProviders(
    context: vscode.ExtensionContext,
    loginScreenProvider: LoginScreenProvider,
    authService: KeycloakAuthService
): NavigationScreenProvider {
    logger.info(MSG.WEBVIEW.REGISTERING);

    // Register login screen provider
    if (!registeredProviders.has(AppConstants.EXTENSION_CONFIG.LOGIN_VIEW_ID)) {
        ExtensionUtils.registerWebviewViewProvider(
            context,
            AppConstants.EXTENSION_CONFIG.LOGIN_VIEW_ID,
            loginScreenProvider
        );
        registeredProviders.add(AppConstants.EXTENSION_CONFIG.LOGIN_VIEW_ID);
    }

    // Create and register navigation screen provider
    const navigationScreenProvider = new NavigationScreenProvider(context.extensionUri, context);
    if (!registeredProviders.has(AppConstants.EXTENSION_CONFIG.NAVIGATION_VIEW_ID)) {
        ExtensionUtils.registerWebviewViewProvider(
            context,
            AppConstants.EXTENSION_CONFIG.NAVIGATION_VIEW_ID,
            navigationScreenProvider
        );
        registeredProviders.add(AppConstants.EXTENSION_CONFIG.NAVIGATION_VIEW_ID);
    }

    // Set up login screen event handlers
    setupLoginScreenHandlers(loginScreenProvider, authService, context);

    logger.info(MSG.WEBVIEW.REGISTERED);
    return navigationScreenProvider;
}

/**
 * Configures login screen event handlers for network selection and authentication
 */
function setupLoginScreenHandlers(
    loginScreenProvider: LoginScreenProvider,
    authService: KeycloakAuthService,
    context: vscode.ExtensionContext
): void {
    // Handle network selection
    loginScreenProvider.onNetworkSelected(async (networkConfig: NetworkConfig) => {
        logger.info(MSG.NETWORK.SELECTED(networkConfig.displayName));

        try {
            loginScreenProvider.showLoading('Connecting to ' + networkConfig.displayName + '...');

            // Mark that user has used the login screen
            await context.globalState.update(STORAGE_KEYS.HAS_USED_LOGIN_SCREEN, true);

            // Update auth service with selected network
            await authService.updateNetworkConfig(networkConfig);

            loginScreenProvider.showLoading('Initializing services...');

            // Initialize configuration and services for the selected network
            try {
                await ConfigUtils.initializeConfiguration(context);
                logger.info(MSG.NETWORK.SERVICES_INITIALIZED);
            } catch (serviceError) {
                logger.warn(MSG.NETWORK.SERVICES_INIT_FAILED, serviceError);
            }

            loginScreenProvider.showLoading('Authenticating...');

            // Perform authentication
            const tokens = await authService.forceAuthentication();

            loginScreenProvider.showLoading('Completing login...');

            // Trigger the login processing command to handle user info and service updates
            await vscode.commands.executeCommand('essedum.internal.processLogin', tokens.access_token);

        } catch (error) {
            logger.error(MSG.NETWORK.AUTH_FAILED, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            loginScreenProvider.showError('Authentication failed: ' + errorMessage);
        }
    });

    // Handle login cancellation
    loginScreenProvider.onLoginCancelled(() => {
        logger.info(MSG.NETWORK.LOGIN_CANCELLED);
        loginScreenProvider.reset();
    });
}

/**
 * Initializes pipeline services and registers pipeline providers
 */
export async function initializePipelineServices(
    context: vscode.ExtensionContext,
    authService: KeycloakAuthService,
    essedumFileProvider: EssedumFileSystemProvider
): Promise<{
    pipelineService: PipelineService;
    pipelineCardsProvider: PipelineCardsProvider;
    pipelineAgentService: PipelineAgentService;
    pipelineAgentProvider: PipelineAgentProvider;
}> {
    logger.info(MSG.PIPELINE.INITIALIZING);

    try {
        // CRITICAL: Ensure base URL is set before validating tokens
        // This is needed when extension reactivates (e.g., when opening ADK folder)
        const { setBaseUrl, isBaseUrlSet } = require('../constants/api-config');
        if (!isBaseUrlSet()) {
            const storedNetwork = context.globalState.get<any>(STORAGE_KEYS.SELECTED_NETWORK);
            if (storedNetwork && storedNetwork.baseURL) {
                logger.info(`Restoring base URL from storage: ${storedNetwork.baseURL}`);
                setBaseUrl(storedNetwork.baseURL);
            }
        }

        // Retrieve and validate stored tokens
        let accessToken = '';
        const storedTokens = await authService.getStoredTokens();

        if (storedTokens && storedTokens.access_token) {
            accessToken = storedTokens.access_token;

            // Validate token only if base URL is set
            if (isBaseUrlSet()) {
                try {
                    await UserUtils.getUserInfo(context, accessToken);
                    logger.info(MSG.PIPELINE.INITIALIZED_WITH_TOKEN);
                } catch (error: any) {
                    // Only clear tokens if this is a real auth error, not a network/URL error
                    if (error.isAuthorizationError || error.response?.status === 401 || error.response?.status === 403) {
                        logger.error(MSG.PIPELINE.TOKEN_INVALID, error);
                        await authService.clearStoredTokens(false);
                        await UserUtils.clearUserDataExceptNetwork(context);
                        accessToken = '';
                        await context.globalState.update(STORAGE_KEYS.TOKEN_VALIDATION_FAILED, true);
                    } else {
                        logger.warn('Token validation failed due to network/config issue, keeping token:', error.message);
                        // Keep the token, it might be valid once network is properly configured
                    }
                }
            } else {
                logger.warn('Base URL not set, skipping token validation - will validate on next API call');
            }
        } else {
            logger.info(MSG.PIPELINE.NO_TOKENS);
        }

        // Create pipeline services
        const pipelineService = new PipelineService(context);
        const pipelineAgentService = new PipelineAgentService(context);

        // Create pipeline providers
        const pipelineCardsProvider = new PipelineCardsProvider(
            context,
            accessToken,
            authService,
            essedumFileProvider,
            pipelineService
        );

        const pipelineAgentProvider = new PipelineAgentProvider(
            context,
            accessToken,
            authService,
            pipelineAgentService,
            essedumFileProvider
        );

        // Update file provider with token
        essedumFileProvider.updateToken(accessToken);

        // Register pipeline providers
        registerPipelineProviders(context, pipelineCardsProvider, pipelineAgentProvider);

        logger.info(MSG.PIPELINE.INITIALIZED);

        return {
            pipelineService,
            pipelineCardsProvider,
            pipelineAgentService,
            pipelineAgentProvider
        };

    } catch (error) {
        logger.warn(MSG.PIPELINE.INIT_FAILED, error);

        // Fallback: create services without authentication
        const pipelineService = new PipelineService(context);
        const pipelineAgentService = new PipelineAgentService(context);

        const pipelineCardsProvider = new PipelineCardsProvider(
            context,
            '',
            authService,
            essedumFileProvider,
            pipelineService
        );

        const pipelineAgentProvider = new PipelineAgentProvider(
            context,
            '',
            authService,
            pipelineAgentService,
            essedumFileProvider
        );

        await ExtensionUtils.updateAuthenticationContext(false);

        return {
            pipelineService,
            pipelineCardsProvider,
            pipelineAgentService,
            pipelineAgentProvider
        };
    }
}

/**
 * Registers pipeline webview providers
 */
function registerPipelineProviders(
    context: vscode.ExtensionContext,
    pipelineCardsProvider: PipelineCardsProvider,
    pipelineAgentProvider: PipelineAgentProvider
): void {
    // Register pipeline cards provider
    if (!registeredProviders.has(AppConstants.EXTENSION_CONFIG.SIDEBAR_VIEW_ID)) {
        ExtensionUtils.registerWebviewViewProvider(
            context,
            AppConstants.EXTENSION_CONFIG.SIDEBAR_VIEW_ID,
            pipelineCardsProvider
        );
        registeredProviders.add(AppConstants.EXTENSION_CONFIG.SIDEBAR_VIEW_ID);
    }

    // Register pipeline provider
    if (!registeredProviders.has(AppConstants.EXTENSION_CONFIG.PIPELINE_VIEW_ID)) {
        ExtensionUtils.registerWebviewViewProvider(
            context,
            AppConstants.EXTENSION_CONFIG.PIPELINE_VIEW_ID,
            pipelineCardsProvider
        );
        registeredProviders.add(AppConstants.EXTENSION_CONFIG.PIPELINE_VIEW_ID);
    }

    // Register pipeline agent provider
    if (!registeredProviders.has(AppConstants.EXTENSION_CONFIG.PIPELINE_AGENT_VIEW_ID)) {
        ExtensionUtils.registerWebviewViewProvider(
            context,
            AppConstants.EXTENSION_CONFIG.PIPELINE_AGENT_VIEW_ID,
            pipelineAgentProvider
        );
        registeredProviders.add(AppConstants.EXTENSION_CONFIG.PIPELINE_AGENT_VIEW_ID);
    }

    logger.info(MSG.PIPELINE.REGISTRATION_COMPLETED);
}

/**
 * Determines and shows the appropriate initial screen based on authentication status
 * Restores the previously active view if extension is reactivating
 * 
 * @param context - Extension context
 * @param hasValidAuth - Whether user has valid authentication
 */
export async function showInitialScreen(
    context: vscode.ExtensionContext,
    hasValidAuth: boolean
): Promise<void> {
    const tokenValidationFailed = context.globalState.get<boolean>(
        STORAGE_KEYS.TOKEN_VALIDATION_FAILED,
        false
    );

    if (tokenValidationFailed) {
        // Previous token was invalid
        await context.globalState.update(STORAGE_KEYS.TOKEN_VALIDATION_FAILED, undefined);
        await ExtensionUtils.updateAuthenticationContext(false);
        await vscode.commands.executeCommand(AppConstants.COMMANDS.SHOW_LOGIN_SCREEN);
    } else if (hasValidAuth) {
        // User is authenticated - restore previous view or default to navigation
        await ExtensionUtils.updateAuthenticationContext(true);
        
        // Check if there's a stored active view (from before extension reload)
        const activeView = context.globalState.get<string>(STORAGE_KEYS.ACTIVE_VIEW, 'navigation');
        logger.info(`Restoring active view: ${activeView}`);
        
        // Restore the appropriate view (commands now handle saving the state)
        switch (activeView) {
            case 'pipeline':
                await vscode.commands.executeCommand(AppConstants.COMMANDS.SHOW_PIPELINE);
                break;
            case 'pipeline-agent':
                await vscode.commands.executeCommand(AppConstants.COMMANDS.SHOW_PIPELINE_AGENT);
                break;
            case 'navigation':
            default:
                await vscode.commands.executeCommand(AppConstants.COMMANDS.SHOW_NAVIGATION);
                break;
        }
    } else {
        // No authentication - show login
        await ExtensionUtils.updateAuthenticationContext(false);
        await vscode.commands.executeCommand(AppConstants.COMMANDS.SHOW_LOGIN_SCREEN);
    }
}
