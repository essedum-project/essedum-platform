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

        logger.info(MSG.TOKEN.SERVICES_UPDATED);

    } catch (error) {
        logger.error(MSG.TOKEN.UPDATE_FAILED, error);
        throw error;
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

        logger.info('Service cleanup completed');
    } catch (error) {
        logger.error('Error during service cleanup', error);
    }
}
