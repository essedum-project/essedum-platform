/**
 * Authentication Setup Utility Functions
 * 
 * Handles initialization and configuration of authentication services.
 */

import * as vscode from 'vscode';
import { KeycloakAuthService, KeycloakConfig } from '../auth/services/keycloak-auth.service';
import { AUTH_CONFIG, NetworkConfig, NetworkType } from '../auth/constants/auth-constants';
import { STORAGE_KEYS } from '../constants/extension-constants';
import { setBaseUrl } from '../constants/api-config';
import * as ExtensionUtils from './extension-utils';

const logger = ExtensionUtils.createLogger('AuthSetupUtils');

/**
 * Creates authentication service with stored or default configuration
 */
export function createAuthenticationService(context: vscode.ExtensionContext): KeycloakAuthService {
    logger.info('Creating authentication service');

    const storedOAuthConfig = context.globalState.get<any>(STORAGE_KEYS.OAUTH_CONFIG);

    const keycloakConfig: KeycloakConfig = {
        issuerUri: storedOAuthConfig?.issuerUri || AUTH_CONFIG.NETWORKS.INFOSYS.issuerUri,
        clientId: storedOAuthConfig?.clientId || AUTH_CONFIG.NETWORKS.INFOSYS.clientId,
        scope: storedOAuthConfig?.scope || AUTH_CONFIG.NETWORKS.INFOSYS.scope,
        networkType: AUTH_CONFIG.DEFAULT_NETWORK,
        networkName: AUTH_CONFIG.NETWORKS.INFOSYS.displayName
    };

    logger.debug(`Using ${storedOAuthConfig ? 'server' : 'default'} configuration`);

    return new KeycloakAuthService(keycloakConfig, context);
}

/**
 * Initializes authentication service based on stored network selection
 * @returns boolean indicating if valid authentication exists
 */
export async function initializeAuthenticationService(context: vscode.ExtensionContext): Promise<{ service: KeycloakAuthService; isAuthenticated: boolean }> {
    logger.info('Initializing authentication service');

    try {
        const storedNetwork = context.globalState.get<NetworkConfig>(STORAGE_KEYS.SELECTED_NETWORK);
        const hasUsedLoginScreen = context.globalState.get<boolean>(STORAGE_KEYS.HAS_USED_LOGIN_SCREEN, false);

        logger.info(`Stored network: ${storedNetwork?.displayName || 'None'}`);
        logger.info(`Has used login screen: ${hasUsedLoginScreen}`);

        let authService: KeycloakAuthService;

        if (storedNetwork && hasUsedLoginScreen) {
            logger.info(`Found stored configuration for ${storedNetwork.displayName}`);
            authService = KeycloakAuthService.createWithNetwork(storedNetwork, context);

            const isAuthenticated = await authService.isTokenValid();
            logger.info(`Authentication status: ${isAuthenticated}`);

            return { service: authService, isAuthenticated };
        } else {
            logger.info('No stored network configuration found');
            authService = createAuthenticationService(context);
            return { service: authService, isAuthenticated: false };
        }
    } catch (error) {
        logger.error('Error initializing authentication service', error);
        const authService = createAuthenticationService(context);
        return { service: authService, isAuthenticated: false };
    }
}

/**
 * Checks if stored network configuration exists
 */
export async function hasStoredNetworkConfig(context: vscode.ExtensionContext): Promise<boolean> {
    const storedNetwork = context.globalState.get<NetworkConfig>(STORAGE_KEYS.SELECTED_NETWORK);
    const hasUsedLoginScreen = context.globalState.get<boolean>(STORAGE_KEYS.HAS_USED_LOGIN_SCREEN, false);

    if (storedNetwork && hasUsedLoginScreen) {
        setBaseUrl(storedNetwork.baseURL);
        return true;
    }

    return false;
}

/**
 * Handles network selection and returns configured auth service
 */
export async function selectNetwork(networkType?: NetworkType): Promise<NetworkConfig> {
    logger.info(`Network selection requested: ${networkType || 'interactive'}`);

    if (networkType) {
        const networkKey = networkType.toUpperCase() as keyof typeof AUTH_CONFIG.NETWORKS;
        const networkConfig = AUTH_CONFIG.NETWORKS[networkKey];

        if (!networkConfig) {
            throw new Error(`Invalid network type: ${networkType}`);
        }

        return networkConfig;
    }

    // Interactive selection
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
        throw new Error('Network selection cancelled');
    }

    return selection.network;
}
