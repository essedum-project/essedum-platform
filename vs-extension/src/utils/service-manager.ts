/**
 * Service Management Utilities
 * 
 * Handles updating and managing extension services with authentication tokens.
 * Provides centralized service token management and update logic.
 */

import * as vscode from 'vscode';
import { PipelineCardsProvider } from '../app/pipeline/pipeline-cards';
import { PipelineAgentProvider } from '../app/pipeline-agent/pipeline-agent';
import { EssedumFileSystemProvider } from '../providers/essedum-file-provider';
import { PipelineService } from '../services/pipeline.service';
import { GitHubAuthService } from '../auth/services/github-auth.service';
import { GitHubService } from '../services/github.service';
import { SessionBranchManager } from '../services/session-branch.manager';
import { GitStatusBarItem } from '../app/git/git-status-bar';
import * as ExtensionUtils from './extension-utils';
import { MESSAGES as MSG } from '../messages/extension-messages';

const logger = ExtensionUtils.createLogger('ServiceManager');

/**
 * Service container interface
 */
export interface ServiceContainer {
    pipelineCardsProvider?: PipelineCardsProvider;
    pipelineAgentProvider?: PipelineAgentProvider;
    essedumFileProvider?: EssedumFileSystemProvider;
    pipelineService?: PipelineService;
    // GitHub integration services
    githubAuthService?: GitHubAuthService;
    githubService?: GitHubService;
    sessionBranchManager?: SessionBranchManager;
    gitStatusBar?: GitStatusBarItem;
}

/**
 * Updates all extension services with a new authentication token
 * 
 * @param accessToken - JWT access token (empty string to clear)
 * @param services - Container with service instances
 * @param context - VS Code extension context
 */
export async function updateServicesWithToken(
    accessToken: string,
    services: ServiceContainer,
    context: vscode.ExtensionContext
): Promise<void> {
    logger.info(MSG.TOKEN.UPDATING_SERVICES);

    try {
        // Update pipeline cards provider
        if (services.pipelineCardsProvider) {
            services.pipelineCardsProvider.updateToken(accessToken);

            // Trigger UI transition if token is valid
            if (accessToken && accessToken.trim().length > 0) {
                await services.pipelineCardsProvider.onTokenUpdated(accessToken);
            }
        }

        // Update pipeline agent provider
        if (services.pipelineAgentProvider) {
            services.pipelineAgentProvider.updateToken(accessToken);
        }

        // Update file system provider
        if (services.essedumFileProvider) {
            services.essedumFileProvider.updateToken(accessToken);
        }

        // Update or recreate pipeline service
        if (services.pipelineService) {
            services.pipelineService.refreshAuthData();
        } else if (accessToken) {
            services.pipelineService = new PipelineService(context);
        }

        // Refresh GitHub service auth data
        if (services.githubService) {
            services.githubService.refreshAuthData();
        }

        logger.info(MSG.TOKEN.SERVICES_UPDATED);

    } catch (error) {
        logger.error(MSG.TOKEN.UPDATE_FAILED, error);
        throw error;
    }
}

/**
 * Creates and wires the GitHub services into the container.
 * Call this after extension activate() has all base services ready.
 * The services are injected into pipelineAgentProvider via setGitHubServices().
 */
export function initializeGitHubServices(
    context: vscode.ExtensionContext,
    services: ServiceContainer
): void {
    try {
        const gitStatusBar    = new GitStatusBarItem();
        const githubAuth      = new GitHubAuthService(context);
        const githubService   = new GitHubService(context, githubAuth, (services as any).authService);
        const sessionBranch   = new SessionBranchManager(context, githubService, githubAuth, gitStatusBar);

        services.gitStatusBar         = gitStatusBar;
        services.githubAuthService    = githubAuth;
        services.githubService        = githubService;
        services.sessionBranchManager = sessionBranch;

        // Wire into the pipeline agent provider
        if (services.pipelineAgentProvider) {
            services.pipelineAgentProvider.setGitHubServices(githubAuth, githubService, sessionBranch);
        }

        // Push disposables
        context.subscriptions.push(gitStatusBar, githubAuth, githubService, sessionBranch);

        logger.info('GitHub services initialized');
    } catch (err) {
        logger.error('Failed to initialize GitHub services (non-fatal):', err);
    }
}

/**
 * Cleans up service instances during deactivation
 */
export function cleanupServices(services: ServiceContainer): void {
    logger.info('Cleaning up services');

    try {
        if (services.pipelineAgentProvider) {
            services.pipelineAgentProvider.cleanup();
        }

        // Clear references
        services.pipelineService = undefined;
        services.pipelineCardsProvider = undefined;
        services.essedumFileProvider = undefined;
        services.pipelineAgentProvider = undefined;

        // Dispose GitHub services
        if (services.sessionBranchManager) { services.sessionBranchManager.dispose(); }
        if (services.gitStatusBar) { services.gitStatusBar.dispose(); }
        if (services.githubAuthService) { services.githubAuthService.dispose(); }
        if (services.githubService) { services.githubService.dispose(); }
        services.sessionBranchManager = undefined;
        services.gitStatusBar = undefined;
        services.githubAuthService = undefined;
        services.githubService = undefined;

        logger.info('Service cleanup completed');
    } catch (error) {
        logger.error('Error during service cleanup', error);
    }
}
