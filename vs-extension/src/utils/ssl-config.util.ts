/**
 * SSL Configuration Utility
 * 
 * Centralized SSL certificate validation management.
 * SSL bypass is only enabled for Infosys network, not for LFN network.
 */

import * as https from 'https';
import * as vscode from 'vscode';
import { STORAGE_KEYS } from '../constants/extension-constants';
import type { NetworkConfig } from '../auth/constants/auth-constants';
import * as ExtensionUtils from './extension-utils';

const logger = ExtensionUtils.createLogger('SSLConfig');

/**
 * Check if SSL should be bypassed based on current network
 */
export function shouldBypassSSL(context?: vscode.ExtensionContext): boolean {
    if (!context) {
        logger.info('SSL Config: No context provided, defaulting to SSL validation (secure mode)');
        return false;
    }

    // Get the stored network config (it's a NetworkConfig object, not just the type)
    const selectedNetwork = context.globalState.get<NetworkConfig>(STORAGE_KEYS.SELECTED_NETWORK);

    // Extract the network type from the config object
    const networkType = selectedNetwork?.id;

    // Only bypass SSL for Infosys network
    // const bypass = networkType === 'infosys';
    const bypass = false;

    logger.info(`SSL Config: Network=${networkType}, Bypass=${bypass}`);
    return bypass;
}

/**
 * Configure Node.js process environment for SSL
 */
export function configureSSLEnvironment(context?: vscode.ExtensionContext): void {
    const bypass = shouldBypassSSL(context);

    if (bypass) {
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
        logger.info('SSL Config: SSL verification DISABLED for Infosys network');
    } else {
        // Re-enable SSL verification for LFN network
        delete process.env['NODE_TLS_REJECT_UNAUTHORIZED'];
        logger.info('SSL Config: SSL verification ENABLED for LFN network');
    }
}

/**
 * Create HTTPS agent with appropriate SSL configuration
 */
export function createHTTPSAgent(context?: vscode.ExtensionContext): https.Agent {
    const bypass = shouldBypassSSL(context);

    if (bypass) {
        // Infosys network - bypass SSL
        return new https.Agent({
            rejectUnauthorized: false,
            checkServerIdentity: () => undefined,
            secureOptions: require('constants').SSL_OP_LEGACY_SERVER_CONNECT,
            secureProtocol: 'TLSv1_2_method',
            requestCert: false,
            keepAlive: true,
            keepAliveMsecs: 60000,
            maxSockets: 10,
            maxFreeSockets: 10,
            timeout: 300000
        });
    } else {
        // LFN network - enforce SSL validation
        return new https.Agent({
            rejectUnauthorized: true,
            keepAlive: true,
            keepAliveMsecs: 60000,
            maxSockets: 10,
            maxFreeSockets: 10,
            timeout: 300000
        });
    }
}

/**
 * Get axios config overrides for SSL handling
 */
export function getAxiosSSLConfig(context?: vscode.ExtensionContext): any {
    const bypass = shouldBypassSSL(context);

    if (bypass) {
        return {
            httpsAgent: createHTTPSAgent(context),
            rejectUnauthorized: false,
            requestCert: false
        };
    } else {
        return {
            httpsAgent: createHTTPSAgent(context),
            rejectUnauthorized: true
        };
    }
}

/**
 * Initialize SSL configuration when network is selected
 */
export function initializeSSLConfig(context: vscode.ExtensionContext): void {
    configureSSLEnvironment(context);
    logger.info('SSL Config: Initialization complete');
}

