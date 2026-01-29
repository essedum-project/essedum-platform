/**
 * Command Handler Utilities
 * 
 * Contains all command handler functions for the extension.
 * Separating command handlers keeps the main extension file focused on orchestration.
 */

import * as vscode from 'vscode';
import { KeycloakAuthService } from '../auth/services/keycloak-auth.service';
import { PipelineCardsProvider } from '../app/pipeline/pipeline-cards';
import { PipelineAgentProvider } from '../app/pipeline-agent/pipeline-agent';
import { NetworkType } from '../auth/constants/auth-constants';
import { STORAGE_KEYS } from '../constants/extension-constants';
import * as AppConstants from '../constants/app-constants';
import * as ExtensionUtils from './extension-utils';
import * as AuthSetupUtils from './auth-setup-utils';
import * as UserUtils from './user-utils';
import { MESSAGES as MSG } from '../messages/extension-messages';

const logger = ExtensionUtils.createLogger('CommandHandlers');

// Service update callback type
type ServiceUpdater = (accessToken: string) => Promise<void>;

/**
 * Displays the login screen
 */
export async function showLoginScreen(): Promise<void> {
    logger.info(MSG.LOGIN_SCREEN.SHOWING);

    try {
        await ExtensionUtils.updateAuthenticationContext(false);
        await vscode.commands.executeCommand('workbench.view.extension.essedum-explorer');
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            await vscode.commands.executeCommand('essedum-login.focus');
        } catch (focusError) {
            logger.warn(MSG.LOGIN_SCREEN.FOCUS_FAILED, focusError);
        }

        logger.info(MSG.LOGIN_SCREEN.DISPLAY_COMPLETED);
    } catch (error) {
        logger.error(MSG.LOGIN_SCREEN.SHOW_FAILED, error);

        const selection = await vscode.window.showInformationMessage(
            'Welcome to Essedum AI Platform! Please select your authentication network.',
            'Login with Network Selection',
            'Cancel'
        );

        if (selection === 'Login with Network Selection') {
            await vscode.commands.executeCommand(AppConstants.COMMANDS.LOGIN_WITH_NETWORK);
        }
    }
}

/**
 * Handles login with network selection
 */
export async function handleLoginWithNetwork(
    context: vscode.ExtensionContext,
    authService: KeycloakAuthService,
    updateServices: ServiceUpdater,
    networkType?: NetworkType
): Promise<void> {
    logger.info(MSG.LOGIN.NETWORK_REQUESTED(networkType));

    try {
        const networkConfig = await AuthSetupUtils.selectNetwork(networkType);

        const authResult = await ExtensionUtils.showProgressNotification(
            `Authenticating with ${networkConfig.displayName}`,
            async (progress, token) => {
                if (token.isCancellationRequested) {
                    throw new Error(AppConstants.MESSAGES.ERROR.AUTH_CANCELLED);
                }

                progress.report({ increment: 20, message: 'Configuring network...' });
                await context.globalState.update(STORAGE_KEYS.HAS_USED_LOGIN_SCREEN, true);

                await authService.updateNetworkConfig(networkConfig);

                if (token.isCancellationRequested) {
                    throw new Error(AppConstants.MESSAGES.ERROR.AUTH_CANCELLED);
                }

                progress.report({ increment: 40, message: 'Starting authentication...' });
                const tokens = await authService.forceAuthentication();

                progress.report({ increment: 80, message: 'Authentication successful' });
                return tokens;
            },
            true
        );

        await processSuccessfulLogin(context, authResult.access_token, updateServices);
        logger.info(MSG.NETWORK.LOGIN_COMPLETED);

    } catch (error) {
        await handleLoginError(error);
    }
}

/**
 * Handles standard login (without network selection)
 */
export async function handleLogin(
    context: vscode.ExtensionContext,
    authService: KeycloakAuthService,
    updateServices: ServiceUpdater
): Promise<void> {
    logger.info(MSG.LOGIN.STARTING);

    try {
        await context.globalState.update(STORAGE_KEYS.HAS_USED_LOGIN_SCREEN, true);

        const authResult = await ExtensionUtils.showProgressNotification(
            AppConstants.MESSAGES.PROGRESS.AUTHENTICATING,
            async (progress, token) => {
                if (token.isCancellationRequested) {
                    throw new Error(AppConstants.MESSAGES.ERROR.AUTH_CANCELLED);
                }

                progress.report({ increment: 20, message: AppConstants.MESSAGES.PROGRESS.STARTING_OAUTH });
                const tokens = await authService.forceAuthentication();

                progress.report({ increment: 80, message: AppConstants.MESSAGES.PROGRESS.AUTH_SUCCESSFUL });
                return tokens;
            },
            true
        );

        await processSuccessfulLogin(context, authResult.access_token, updateServices);
        logger.info(MSG.LOGIN.COMPLETED);

    } catch (error) {
        await handleLoginError(error);
    }
}

/**
 * Processes successful login and initializes user session
 */
async function processSuccessfulLogin(
    context: vscode.ExtensionContext,
    accessToken: string,
    updateServices: ServiceUpdater
): Promise<void> {
    logger.info(MSG.LOGIN.AUTH_SUCCESS(accessToken?.length || 0));

    // Store tokens
    await Promise.all([
        context.globalState.update(STORAGE_KEYS.JWT_TOKEN, accessToken),
        context.globalState.update(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    ]);

    // Update services with token
    await updateServices(accessToken);

    // Set navigation context before fetching user info
    await setNavigationContext();

    try {
        // Fetch and process user information
        const userInfo = await UserUtils.getUserInfo(context, accessToken);

        if (!userInfo.porfolios || userInfo.porfolios.length === 0) {
            await handleNoPortfolios(context);
        } else {
            await UserUtils.initUserAccess(context, userInfo, accessToken);
        }

        await ExtensionUtils.updateAuthenticationContext(true);
        await ExtensionUtils.showSuccessMessage(AppConstants.MESSAGES.SUCCESS.LOGIN_SUCCESS);

    } catch (error: any) {
        // Handle authorization errors
        if (error?.isAuthorizationError || error?.message?.includes('AUTHORIZATION_FAILED')) {
            logger.error(MSG.LOGIN.USER_NOT_AUTHORIZED);
            await clearSessionAndRedirect(context, updateServices);
            throw error;
        } else {
            logger.error(MSG.LOGIN.ERROR_DURING_LOGIN, error);
            await clearSessionAndRedirect(context, updateServices);
            throw error;
        }
    }
}

/**
 * Clears session data and redirects to login screen
 */
async function clearSessionAndRedirect(
    context: vscode.ExtensionContext,
    updateServices: ServiceUpdater
): Promise<void> {
    await UserUtils.clearUserDataExceptNetwork(context);
    await updateServices('');
    await ExtensionUtils.updateAuthenticationContext(false);
    await showLoginScreen();
}

/**
 * Handles portfolios not found scenario
 */
async function handleNoPortfolios(context: vscode.ExtensionContext): Promise<void> {
    logger.info(MSG.USER_LOGIN.NO_PORTFOLIOS);

    const activeProfiles = context.globalState.get<string[]>(STORAGE_KEYS.ACTIVE_PROFILES, []);
    const autoUserCreation = context.globalState.get<boolean>(STORAGE_KEYS.AUTO_USER_CREATION, false);

    const requiresPermission = ['keycloak', 'msal', 'aicloud'].some(profile =>
        activeProfiles.includes(profile)
    );

    if (requiresPermission && !autoUserCreation) {
        await vscode.window.showWarningMessage(
            'You do not have access to any portfolios. Please contact your administrator for access.'
        );
    } else if (autoUserCreation) {
        await vscode.window.showInformationMessage('Setting up your account automatically...');
    }
}

/**
 * Handles login errors
 */
async function handleLoginError(error: unknown): Promise<void> {
    logger.error(MSG.LOGIN.AUTH_FAILED, error);

    const userMessage = ExtensionUtils.getAuthErrorMessage(error);
    await ExtensionUtils.showErrorWithOptions(
        userMessage,
        AppConstants.COMMANDS.LOGIN,
        AppConstants.EXTERNAL_LINKS.KEYCLOAK_DOCS
    );

    throw error;
}

/**
 * Handles logout command
 */
export async function handleLogout(
    context: vscode.ExtensionContext,
    authService: KeycloakAuthService,
    updateServices: ServiceUpdater,
    pipelineCardsProvider?: PipelineCardsProvider
): Promise<void> {
    logger.info(MSG.LOGOUT.STARTING);

    try {
        const options = ['Logout (same network)', 'Logout and switch network', 'Cancel'];

        const selection = await vscode.window.showQuickPick(options, {
            placeHolder: 'Choose logout option',
            title: 'Logout Options'
        });

        if (!selection || selection === 'Cancel') {
            logger.info(MSG.LOGOUT.CANCELLED);
            return;
        }

        const clearNetwork = selection === 'Logout and switch network';

        // Clear tokens
        await authService.clearStoredTokens(clearNetwork);

        // Clear user data
        if (clearNetwork) {
            await UserUtils.clearAllUserData(context);
        } else {
            await UserUtils.clearUserDataExceptNetwork(context);
        }

        // Clear service tokens
        await updateServices('');
        await ExtensionUtils.updateAuthenticationContext(false);

        // Reload or show login screen
        if (clearNetwork) {
            await showLoginScreen();
        } else if (pipelineCardsProvider) {
            pipelineCardsProvider.loadInitialContent();
        }

        const message = clearNetwork
            ? AppConstants.MESSAGES.SUCCESS.LOGOUT_SUCCESS + ' You can now select a different network.'
            : AppConstants.MESSAGES.SUCCESS.LOGOUT_SUCCESS;

        await vscode.window.showInformationMessage(message);
        logger.info(MSG.LOGOUT.COMPLETED(clearNetwork));

    } catch (error) {
        logger.error(MSG.LOGOUT.FAILED, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        await vscode.window.showErrorMessage(AppConstants.MESSAGES.ERROR.LOGOUT_FAILED(errorMessage));
    }
}

/**
 * Handles check authentication status command
 */
export async function handleCheckAuth(authService: KeycloakAuthService): Promise<void> {
    logger.info(MSG.AUTH_CHECK.CHECKING);

    try {
        const authStatus = await authService.getAuthenticationStatus();
        const isValid = await authService.isTokenValid();

        const message = AppConstants.MESSAGES.INFO.AUTH_STATUS_MESSAGE(
            authStatus.isAuthenticated,
            isValid,
            authStatus.tokenExpiry,
            authStatus.needsRefresh
        );

        const selection = await vscode.window.showInformationMessage(
            message,
            AppConstants.UI_CONFIG.BUTTONS.OK,
            AppConstants.UI_CONFIG.BUTTONS.LOGIN
        );

        if (selection === AppConstants.UI_CONFIG.BUTTONS.LOGIN) {
            await ExtensionUtils.safeExecuteCommand(AppConstants.COMMANDS.LOGIN);
        }

    } catch (error) {
        logger.error(MSG.AUTH_CHECK.FAILED, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        await vscode.window.showErrorMessage(
            AppConstants.MESSAGES.ERROR.AUTH_STATUS_CHECK_FAILED(errorMessage)
        );
    }
}

/**
 * Sets navigation context keys
 */
export async function setNavigationContext(context?: vscode.ExtensionContext): Promise<void> {
    await vscode.commands.executeCommand(AppConstants.COMMANDS.VSCODE.SET_CONTEXT, AppConstants.CONTEXT_KEYS.SHOW_NAVIGATION, true);
    await vscode.commands.executeCommand(AppConstants.COMMANDS.VSCODE.SET_CONTEXT, AppConstants.CONTEXT_KEYS.SHOW_PIPELINE, false);
    await vscode.commands.executeCommand(AppConstants.COMMANDS.VSCODE.SET_CONTEXT, AppConstants.CONTEXT_KEYS.SHOW_PIPELINE_AGENT, false);
    
    // Save active view for restoration after extension reload
    if (context) {
        await context.globalState.update(STORAGE_KEYS.ACTIVE_VIEW, 'navigation');
    }
}

/**
 * Sets pipeline context keys
 */
export async function setPipelineContext(context?: vscode.ExtensionContext): Promise<void> {
    await vscode.commands.executeCommand(AppConstants.COMMANDS.VSCODE.SET_CONTEXT, AppConstants.CONTEXT_KEYS.SHOW_NAVIGATION, false);
    await vscode.commands.executeCommand(AppConstants.COMMANDS.VSCODE.SET_CONTEXT, AppConstants.CONTEXT_KEYS.SHOW_PIPELINE, true);
    await vscode.commands.executeCommand(AppConstants.COMMANDS.VSCODE.SET_CONTEXT, AppConstants.CONTEXT_KEYS.SHOW_PIPELINE_AGENT, false);
    
    // Save active view for restoration after extension reload
    if (context) {
        await context.globalState.update(STORAGE_KEYS.ACTIVE_VIEW, 'pipeline');
    }
}

/**
 * Sets pipeline agent context keys
 */
export async function setPipelineAgentContext(context?: vscode.ExtensionContext): Promise<void> {
    await vscode.commands.executeCommand(AppConstants.COMMANDS.VSCODE.SET_CONTEXT, AppConstants.CONTEXT_KEYS.SHOW_NAVIGATION, false);
    await vscode.commands.executeCommand(AppConstants.COMMANDS.VSCODE.SET_CONTEXT, AppConstants.CONTEXT_KEYS.SHOW_PIPELINE, false);
    await vscode.commands.executeCommand(AppConstants.COMMANDS.VSCODE.SET_CONTEXT, AppConstants.CONTEXT_KEYS.SHOW_PIPELINE_AGENT, true);
    
    // Save active view for restoration after extension reload
    if (context) {
        await context.globalState.update(STORAGE_KEYS.ACTIVE_VIEW, 'pipeline-agent');
    }
}

/**
 * Internal command to process successful login after authentication
 * This is called by the login screen event handler after OAuth completes
 * 
 * @param context - Extension context
 * @param accessToken - JWT access token from authentication
 * @param updateServices - Callback to update all services with new token
 */
export async function processLogin(
    context: vscode.ExtensionContext,
    accessToken: string,
    updateServices: ServiceUpdater
): Promise<void> {
    logger.info('Processing successful login...');

    try {
        // Store tokens
        await Promise.all([
            context.globalState.update(STORAGE_KEYS.JWT_TOKEN, accessToken),
            context.globalState.update(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
        ]);

        // Update all services with the new token
        await updateServices(accessToken);

        // Set navigation context
        await setNavigationContext();

        // Fetch and process user information
        const userInfo = await UserUtils.getUserInfo(context, accessToken);

        if (!userInfo.porfolios || userInfo.porfolios.length === 0) {
            const activeProfiles = context.globalState.get<string[]>(STORAGE_KEYS.ACTIVE_PROFILES, []);
            const autoUserCreation = context.globalState.get<boolean>(STORAGE_KEYS.AUTO_USER_CREATION, false);
            const requiresPermission = ['keycloak', 'msal', 'aicloud'].some(p => activeProfiles.includes(p));

            if (requiresPermission && !autoUserCreation) {
                await vscode.window.showWarningMessage(
                    'You do not have access to any portfolios. Please contact your administrator.'
                );
            }
        } else {
            await UserUtils.initUserAccess(context, userInfo, accessToken);
        }

        // Update authentication context
        await ExtensionUtils.updateAuthenticationContext(true);

        // Show success message
        await ExtensionUtils.showSuccessMessage(AppConstants.MESSAGES.SUCCESS.LOGIN_SUCCESS);

        // Open the main view
        await vscode.commands.executeCommand('workbench.view.extension.essedum-explorer');

        logger.info('Login processing completed successfully');

    } catch (error: any) {
        logger.error('Error processing login:', error);

        // Handle authorization errors
        if (error?.isAuthorizationError || error?.message?.includes('AUTHORIZATION_FAILED')) {
            await vscode.window.showErrorMessage(
                'You are not authorized to access this application. Please contact the administrator.'
            );
        } else {
            await vscode.window.showErrorMessage(
                'Failed to complete login. Please try again.'
            );
        }

        // Clear session and redirect to login
        await UserUtils.clearUserDataExceptNetwork(context);
        await updateServices('');
        await ExtensionUtils.updateAuthenticationContext(false);
        await showLoginScreen();
    }
}

/**
 * Handles run pipeline command
 * 
 * @param pipelineCardsProvider - Pipeline cards provider instance
 * @param pipelineName - Optional pipeline name to run
 */
export async function handleRunPipeline(
    pipelineCardsProvider: PipelineCardsProvider | undefined,
    pipelineName?: string
): Promise<void> {
    if (!ExtensionUtils.validateServices({ pipelineCardsProvider })) {
        await vscode.window.showErrorMessage(AppConstants.MESSAGES.ERROR.LOGIN_REQUIRED);
        return;
    }

    if (pipelineName) {
        const selection = await vscode.window.showInformationMessage(
            AppConstants.MESSAGES.INFO.PIPELINE_RUN_INSTRUCTION(pipelineName),
            AppConstants.UI_CONFIG.BUTTONS.OPEN_PIPELINES
        );
        if (selection === AppConstants.UI_CONFIG.BUTTONS.OPEN_PIPELINES) {
            await ExtensionUtils.safeExecuteCommand(AppConstants.COMMANDS.VSCODE.OPEN_EXTENSION_VIEW);
        }
    } else {
        await ExtensionUtils.safeExecuteCommand(AppConstants.COMMANDS.VSCODE.OPEN_EXTENSION_VIEW);
    }
}

/**
 * Handles get user info command
 */
export async function handleGetUserInfo(context: vscode.ExtensionContext): Promise<void> {
    const cachedUserInfo = context.globalState.get(STORAGE_KEYS.USER_INFO_DATA) as any;
    const currentUserInfo = context.globalState.get(STORAGE_KEYS.CURRENT_USER_INFO) as any;

    if (cachedUserInfo || currentUserInfo) {
        const userInfo = currentUserInfo || cachedUserInfo;
        const message = `User Information:\n` +
            `• Portfolios: ${userInfo?.porfolios?.length || 0}\n` +
            `• User ID: ${userInfo?.userId || 'Not available'}`;
        await vscode.window.showInformationMessage(message);
    } else {
        await vscode.window.showInformationMessage(
            'No user information available. Please login first.',
            AppConstants.UI_CONFIG.BUTTONS.LOGIN
        );
    }
}

/**
 * Handles refresh user info command
 */
export async function handleRefreshUserInfo(context: vscode.ExtensionContext): Promise<void> {
    const accessToken = context.globalState.get(STORAGE_KEYS.ACCESS_TOKEN) as string;

    if (!accessToken) {
        await vscode.window.showWarningMessage(
            'No access token available. Please login first.',
            AppConstants.UI_CONFIG.BUTTONS.LOGIN
        );
        return;
    }

    await ExtensionUtils.showProgressNotification(
        'Refreshing user information...',
        async (progress) => {
            progress.report({ increment: 30, message: 'Fetching user information...' });
            await context.globalState.update(STORAGE_KEYS.UPDATED_USER, true);
            
            const userInfo = await UserUtils.getUserInfo(context, accessToken);
            
            progress.report({ increment: 80, message: 'Updating user access...' });
            await UserUtils.initUserAccess(context, userInfo, accessToken);
        },
        true
    );

    await vscode.window.showInformationMessage('User information refreshed successfully.');
}

/**
 * Handles clear user data command
 */
export async function handleClearUserData(context: vscode.ExtensionContext): Promise<void> {
    await UserUtils.clearAllUserData(context);
    await vscode.window.showInformationMessage('All cached user data cleared. Please login again.');
}

/**
 * Handles debug user data command
 */
export async function handleDebugUserData(context: vscode.ExtensionContext): Promise<void> {
    const user = context.globalState.get(STORAGE_KEYS.USER) as any;
    const role = context.globalState.get(STORAGE_KEYS.ROLE) as any;
    const project = context.globalState.get(STORAGE_KEYS.PROJECT) as any;
    const organization = context.globalState.get(STORAGE_KEYS.ORGANIZATION) as string;

    const message = `Current User Data:\n` +
        `• User: ${user?.user_f_name} ${user?.user_l_name}\n` +
        `• Role: ${role?.name || 'Not set'}\n` +
        `• Project: ${project?.name || 'Not set'}\n` +
        `• Organization: ${organization || 'Not set'}`;

    await vscode.window.showInformationMessage(message);
}

/**
 * Delete file on server (right-click context menu in Explorer)
 */
export async function handleDeleteFileOnServer(
    context: vscode.ExtensionContext,
    pipelineAgentProvider: PipelineAgentProvider,
    uri?: vscode.Uri
): Promise<void> {
    logger.info('Delete file on server triggered');
    
    if (!uri) {
        logger.warn('No URI provided for delete');
        return;
    }

    try {
        await pipelineAgentProvider.deleteFileFromExplorer(uri);
    } catch (error) {
        logger.error('Error deleting file on server:', error);
        vscode.window.showErrorMessage(`Failed to delete file: ${error}`);
    }
}

/**
 * Upload Agent Folder (right-click context menu on folder in Explorer)
 */
export async function handleUploadAgentFolder(
    context: vscode.ExtensionContext,
    pipelineAgentProvider: PipelineAgentProvider,
    uri?: vscode.Uri
): Promise<void> {
    logger.info('Upload agent folder triggered');
    
    if (!uri) {
        logger.warn('No URI provided for upload');
        return;
    }

    try {
        await pipelineAgentProvider.uploadAgentFolder(uri);
    } catch (error) {
        logger.error('Error uploading folder:', error);
        vscode.window.showErrorMessage(`Failed to upload folder: ${error}`);
    }
}
