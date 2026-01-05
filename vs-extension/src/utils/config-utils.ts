/**
 * Configuration Utility Functions
 * 
 * Handles initialization and management of extension configuration,
 * including fetching settings from the server and storing them locally.
 */

import * as vscode from 'vscode';
import * as ExtensionInterfaces from '../interfaces/extension.interfaces';
import { STORAGE_KEYS, TIMEOUTS, REQUEST_HEADERS } from '../constants/extension-constants';
import { AUTH_CONFIG } from '../auth/constants/auth-constants';
import * as AppConstants from '../constants/app-constants';
import { makeSecureRequest } from '../constants/api-config';
import { getConfigApiUrl, isBaseUrlSet } from '../constants/api-config';
import * as ExtensionUtils from './extension-utils';

const logger = ExtensionUtils.createLogger('ConfigUtils');

/**
 * Initializes extension configuration by fetching settings from server
 */
export async function initializeConfiguration(context: vscode.ExtensionContext): Promise<void> {
    logger.info('Initializing configuration...');

    if (!isBaseUrlSet()) {
        logger.warn('Base URL not set, skipping configuration initialization');
        return;
    }

    try {
        const config = await fetchServerConfiguration(context);
        await storeServerConfiguration(context, config);
        logger.info('Configuration initialization completed');
    } catch (error) {
        logger.warn('Failed to fetch configuration from server', error);
        await handleConfigurationError(context, error);
    }
}

/**
 * Fetches configuration from the server
 */
export async function fetchServerConfiguration(context: vscode.ExtensionContext): Promise<ExtensionInterfaces.ServerConfig> {
    const response = await makeSecureRequest('GET', getConfigApiUrl(), context, {
        timeout: TIMEOUTS.CONFIG,
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

/**
 * Stores server configuration in extension storage
 */
export async function storeServerConfiguration(context: vscode.ExtensionContext, config: ExtensionInterfaces.ServerConfig): Promise<void> {
    const updates: Array<{ key: string; value: any }> = [
        { key: STORAGE_KEYS.DATA_LIMIT, value: config.data_limit },
        { key: STORAGE_KEYS.AUTO_USER_CREATION, value: config.autoUserCreation },
        { key: STORAGE_KEYS.AUTO_USER_PROJECT, value: config.autoUserProject },
        { key: STORAGE_KEYS.ACTIVE_PROFILES, value: config.activeProfiles?.split(',') || [] },
        { key: STORAGE_KEYS.LOGO_LOCATION, value: config.logoLocation },
        { key: STORAGE_KEYS.THEME, value: config.theme },
        { key: STORAGE_KEYS.DEFAULT_THEME, value: config.theme },
        { key: STORAGE_KEYS.FONT, value: config.font },
        { key: STORAGE_KEYS.TELEMETRY_URL, value: config.telemetryUrl },
        { key: STORAGE_KEYS.TELEMETRY, value: config.telemetry },
        { key: STORAGE_KEYS.TELEMETRY_PDATA_ID, value: config.telemetryPdataId },
        { key: STORAGE_KEYS.CAP_BASE_URL, value: config.capBaseUrl },
        { key: STORAGE_KEYS.APP_VERSION, value: config.appVersion },
        { key: STORAGE_KEYS.LEAP_APP_YEAR, value: config.leapAppYear },
        { key: STORAGE_KEYS.SHOW_PORTFOLIO_HEADER, value: config.showPortfolioHeader },
        { key: STORAGE_KEYS.SHOW_PROFILE_ICON, value: config.showProfileIcon },
        { key: STORAGE_KEYS.ENC_DEFAULT, value: config.encDefault },
        { key: STORAGE_KEYS.BASE_URL, value: config.baseUrl || '' }
    ];

    // Handle JWT token expiration for specific profiles
    const activeProfiles = config.activeProfiles?.split(',') || [];
    if (activeProfiles.includes('dbjwt')) {
        updates.push({ key: STORAGE_KEYS.EXPIRE_TOKEN_TIME, value: config.expireTokenTime });
    }

    // Store OAuth configuration
    const oauthConfig = createOAuthConfig(config);
    updates.push({ key: STORAGE_KEYS.OAUTH_CONFIG, value: oauthConfig });

    await Promise.all(updates.map(({ key, value }) => context.globalState.update(key, value)));
}

/**
 * Creates OAuth configuration from server config
 */
export function createOAuthConfig(config: ExtensionInterfaces.ServerConfig): ExtensionInterfaces.OAuthConfig {
    return {
        issuerUri: config.issuerUri || AUTH_CONFIG.ISSUER_URI,
        clientId: config.clientId || AUTH_CONFIG.CLIENT_ID,
        scope: config.scope || AUTH_CONFIG.SCOPE,
        responseType: 'code',
        useSilentRefresh: true,
        timeoutFactor: validateTimeoutFactor(config.silentRefreshTimeoutFactor),
        sessionChecksEnabled: true,
        showDebugInformation: AppConstants.DEBUG_CONFIG.VERBOSE_LOGGING,
        clearHashAfterLogin: false,
        strictDiscoveryDocumentValidation: false
    };
}

/**
 * Creates default OAuth configuration
 */
export function createDefaultOAuthConfig(): ExtensionInterfaces.OAuthConfig {
    return {
        issuerUri: AUTH_CONFIG.ISSUER_URI,
        clientId: AUTH_CONFIG.CLIENT_ID,
        scope: AUTH_CONFIG.SCOPE,
        responseType: 'code',
        useSilentRefresh: true,
        timeoutFactor: 0.9,
        sessionChecksEnabled: true,
        showDebugInformation: AppConstants.DEBUG_CONFIG.VERBOSE_LOGGING,
        clearHashAfterLogin: false,
        strictDiscoveryDocumentValidation: false
    };
}

/**
 * Validates timeout factor value
 */
function validateTimeoutFactor(factor?: number): number {
    return (typeof factor === 'number' && factor > 0 && factor <= 1) ? factor : 0.9;
}

/**
 * Handles configuration errors with fallback strategies
 */
async function handleConfigurationError(context: vscode.ExtensionContext, error: unknown): Promise<void> {
    if (isSSLError(error)) {
        logger.error('SSL error detected, attempting fallback configuration');
        await attemptFallbackConfiguration(context);
    } else {
        await storeDefaultConfiguration(context);
    }
}

/**
 * Checks if error is SSL-related
 */
function isSSLError(error: unknown): boolean {
    if (!(error instanceof Error)) { return false; }

    const sslKeywords = ['certificate', 'CERT_', 'unable to get local issuer certificate', 'self signed certificate'];
    return sslKeywords.some(keyword => error.message.includes(keyword));
}

/**
 * Attempts fallback configuration with relaxed SSL validation
 */
async function attemptFallbackConfiguration(context: vscode.ExtensionContext): Promise<void> {
    try {
        logger.info('Attempting fallback configuration with relaxed SSL...');

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
            timeout: TIMEOUTS.FALLBACK,
            headers: {
                'accept': REQUEST_HEADERS.ACCEPT,
                'user-agent': REQUEST_HEADERS.USER_AGENT,
                'x-requested-with': REQUEST_HEADERS.X_REQUESTED_WITH
            }
        });

        await storeServerConfiguration(context, response.data);
        logger.info('Fallback configuration successful');
    } catch (fallbackError) {
        logger.error('Fallback configuration failed', fallbackError);
        await storeDefaultConfiguration(context);
    }
}

/**
 * Stores default configuration when server fetch fails
 */
async function storeDefaultConfiguration(context: vscode.ExtensionContext): Promise<void> {
    const defaultUpdates: Array<{ key: string; value: any }> = [
        { key: STORAGE_KEYS.THEME, value: 'default' },
        { key: STORAGE_KEYS.DEFAULT_THEME, value: 'default' },
        { key: STORAGE_KEYS.ACTIVE_PROFILES, value: [] },
        { key: STORAGE_KEYS.OAUTH_CONFIG, value: createDefaultOAuthConfig() }
    ];

    await Promise.all(defaultUpdates.map(({ key, value }) => context.globalState.update(key, value)));
    logger.info('Using default configuration');
}
