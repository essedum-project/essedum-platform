/**
 * Centralized API Configuration for Essedum AI Platform
 * This file contains all API endpoints and configuration in one place
 */

import * as https from 'https';
import * as vscode from 'vscode';
import { shouldBypassSSL, createHTTPSAgent as createConditionalHTTPSAgent } from '../utils/ssl-config.util';
import * as ExtensionUtils from '../utils/extension-utils';

const logger = ExtensionUtils.createLogger('APIConfig');

// Note: SSL bypass is now conditional based on network selection
// Use the ssl-config.util functions instead of setting global variables

// Dynamic BASE_URL management
let currentBaseUrl: string | null = null; // Start with null, will be set when user selects network

// Function to get current base URL
export function getBaseUrl(): string {
    // If no URL is set yet, return a placeholder - this should only happen during initialization
    if (currentBaseUrl === null) {
        logger.info('Base URL not set yet - network selection required');
        return ''; // This will cause obvious errors if used before network selection
    }
    return currentBaseUrl;
}

export function setBaseUrl(newUrl: string): void {
    currentBaseUrl = newUrl;
    logger.info('Base URL updated to:', newUrl);
    // Clear any cached endpoint objects to force regeneration with new URL
    _endpointsCache = null;
}

// Check if base URL has been set
export function isBaseUrlSet(): boolean {
    return currentBaseUrl !== null;
}

// Base URLs
export const API_BASE_PATH = '/api/aip/service/v1';

// Dynamic API Base URL getter
export function getApiBaseUrl(): string {
    return `${getBaseUrl()}${API_BASE_PATH}`;
}

// Cache for endpoints to avoid recreating the object on every access
let _endpointsCache: any = null;

// Type definition for API endpoints
interface ApiEndpoints {
    PIPELINES_COUNT: string;
    PIPELINES_LIST: string;
    PIPELINES_BY_NAME: string;
    PIPELINES_SAVE_JSON: string;
    PIPELINE_RUN: string;
    STREAMING_SERVICES: string;
    STREAMING_SERVICES_UPDATE: string;
    JOB_RUNTIME_TYPES: string;
    DATASOURCES_RUNTIME: string;
    FILE_READ: string;
    FILE_CREATE: string;
    FILE_UPLOAD: string;
    FILE_UPDATE: string;
    FILE_DELETE: string;
    FOLDER_UPLOAD: string;
    FOLDER_LIST: string;
    FOLDER_UPDATE: string;
    FOLDER_DELETE: string;
    FOLDER_DOWNLOAD: string;
    EVENTS_TRIGGER: string;
    EVENTS_STATUS: string;
    FETCH_DATASOURCE: string;
    AUTH_BASE: string;
}

// Dynamic API Endpoints - these are generated on-demand with the current base URL
export function getApiEndpoints(): ApiEndpoints {
    // Return cached endpoints if available and base URL hasn't changed
    if (_endpointsCache && currentBaseUrl) {
        return _endpointsCache;
    }

    // Generate new endpoints with current base URL
    const apiBaseUrl = getApiBaseUrl();
    const baseUrl = getBaseUrl();
    
    _endpointsCache = {
        // Pipeline endpoints
        PIPELINES_COUNT: `${apiBaseUrl}/pipelines/count`,
        PIPELINES_LIST: `${apiBaseUrl}/pipelines/training/list`,
        PIPELINES_BY_NAME: `${apiBaseUrl}/pipelines/byname`,
        PIPELINES_SAVE_JSON: `${apiBaseUrl}/pipelines/save-json`,
        PIPELINE_RUN: `${apiBaseUrl}/pipeline/run-pipeline`,
        
        // Streaming services
        STREAMING_SERVICES: `${apiBaseUrl}/streamingServices`,
        STREAMING_SERVICES_UPDATE: `${baseUrl}/api/aip/service/v1/streamingServices/update`,
        
        // Job and runtime endpoints
        JOB_RUNTIME_TYPES: `${apiBaseUrl}/jobs/runtime/types`,
        DATASOURCES_RUNTIME: `${apiBaseUrl}/datasources/runtime`,
        
        // File operations
        FILE_READ: `${baseUrl}/api/aip/file/read`,
        FILE_CREATE: `${baseUrl}/api/aip/file/create`,
        FILE_UPLOAD: `${baseUrl}/api/aip/file/upload`,
        FILE_UPDATE: `${baseUrl}/api/aip/file/update`,
        FILE_DELETE: `${baseUrl}/api/aip/file/delete`,
        
        // Folder operations
        FOLDER_UPLOAD: `${baseUrl}/api/aip/folder/upload`,
        FOLDER_LIST: `${baseUrl}/api/aip/folder/list`,
        FOLDER_UPDATE: `${baseUrl}/api/aip/folder/update`,
        FOLDER_DELETE: `${baseUrl}/api/aip/folder/delete`,
        FOLDER_DOWNLOAD: `${baseUrl}/api/aip/folder/download`,
        
        // Event endpoints
        EVENTS_TRIGGER: `${apiBaseUrl}/events/trigger`,
        EVENTS_STATUS: `${apiBaseUrl}/events/status`,
        
        // Datasource endpoints
        FETCH_DATASOURCE: `${apiBaseUrl}/fetchDatasource`,
        
        // Authentication
        AUTH_BASE: `${baseUrl}/realms/essedum/protocol/openid-connect`
    };
    
    return _endpointsCache;
}

// Create a properly typed proxy for backwards compatibility
export const API_ENDPOINTS: ApiEndpoints = new Proxy({} as ApiEndpoints, {
    get: function(target, prop: string | symbol) {
        const endpoints = getApiEndpoints();
        return endpoints[prop as keyof ApiEndpoints];
    }
});

// Default request configuration
export const DEFAULT_REQUEST_CONFIG = {
    timeout: 30000,
    headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'X-Requested-With': 'Leap',
        'charset': 'utf-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
    }
};

/**
 * Get HTTPS Agent with appropriate SSL configuration
 * @param context - VS Code extension context for network detection
 * @returns HTTPS Agent configured based on selected network
 */
export function getHTTPSAgent(context?: vscode.ExtensionContext): https.Agent {
    return createConditionalHTTPSAgent(context);
}

// Legacy export for backward compatibility - uses default agent without context
// WARNING: This may not work correctly without context. Use getHTTPSAgent(context) instead.
export const HTTPS_AGENT = new https.Agent({
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

// Create authenticated headers
export function createAuthHeaders(token: string, role: any, projectId: string = '', projectName: string = ''): Record<string, string> {
    return {
        ...DEFAULT_REQUEST_CONFIG.headers,
        'Authorization': `Bearer ${token}`,
        'Project': projectId,
        'ProjectName': projectName,
        'roleId': role.id,
        'roleName': role.name
    };
}

// Create axios config with conditional SSL bypass based on network
export function createSecureAxiosConfig(token: string, role: any, context?: vscode.ExtensionContext, additionalConfig: any = {}): any {
    const baseConfig = {
        ...DEFAULT_REQUEST_CONFIG,
        headers: createAuthHeaders(token, role),
        httpsAgent: getHTTPSAgent(context),
        maxRedirects: 5,
        validateStatus: function (status: number) {
            return status >= 200 && status < 300;
        },
        adapter: undefined
    };
    
    // Merge additional config, ensuring httpsAgent is not overridden
    const mergedConfig = {
        ...baseConfig,
        ...additionalConfig
    };
    
    // Ensure HTTPS agent is always set with correct SSL config
    mergedConfig.httpsAgent = getHTTPSAgent(context);
    
    return mergedConfig;
}

// Create a simple HTTPS agent for direct use with conditional SSL
export function createHTTPSAgent(context?: vscode.ExtensionContext): https.Agent {
    return createConditionalHTTPSAgent(context);
}

// Simple axios request wrapper with conditional SSL bypass
export async function makeSecureRequest(method: string, url: string, context?: vscode.ExtensionContext, config: any = {}): Promise<any> {
    const axios = require('axios');
    
    // Check if URL is absolute or needs base URL
    const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
    
    // If URL is relative and base URL is not set, throw a clear error
    if (!isAbsoluteUrl) {
        const baseUrl = getBaseUrl();
        if (!baseUrl) {
            const error: any = new Error('Base URL is not configured. Network selection required before making API requests.');
            error.code = 'ERR_BASE_URL_NOT_SET';
            logger.error('Cannot make request - base URL not set:', url);
            throw error;
        }
        // Convert relative URL to absolute
        url = `${baseUrl}${url}`;
    }
    
    // Use conditional SSL based on network
    const bypass = shouldBypassSSL(context);
    
    // Extract token from config if provided
    const token = config.headers?.Authorization?.replace('Bearer ', '') || 
                  config.headers?.authorization?.replace('Bearer ', '') || 
                  config.headers?.Authorization || 
                  config.headers?.authorization || 
                  '';

    const defaultHeaders: { [key: string]: string } = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        'priority': 'u=1, i',
        'project': '',
        'projectname': '',
        'referer': `${getBaseUrl()}/`,
        'roleid': '',
        'rolename': '',
        'sec-ch-ua': '"Microsoft Edge";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
        'x-requested-with': ''
    };
    
    // Add authorization header if token is provided
    if (token) {
        defaultHeaders['authorization'] = `Bearer ${token}`;
    }
    
    const requestConfig = {
        method: method,
        url: url,
        httpsAgent: getHTTPSAgent(context),
        rejectUnauthorized: !bypass,
        requestCert: false,
        agent: false,
        timeout: 30000,
        headers: {
            ...defaultHeaders,
            ...config.headers
        },
        ...config
    };
    
    logger.info('Making secure request to:', url);
    logger.info('SSL bypass active:', bypass);
    logger.info('Request headers being sent:', requestConfig.headers);
    logger.info('Token extracted:', token ? 'Token present' : 'No token');
    logger.info('Full request config:', { 
        method: requestConfig.method, 
        url: requestConfig.url,
        params: requestConfig.params,
        hasHttpsAgent: !!requestConfig.httpsAgent 
    });
    
    return axios(requestConfig);
}

// Initialize SSL configuration based on network - call this at extension startup
export function initializeSSLBypass(context?: vscode.ExtensionContext): void {
    logger.info('Initializing SSL configuration...');
    
    const bypass = shouldBypassSSL(context);
    
    if (bypass) {
        // Infosys network - bypass SSL
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
        process.env['PYTHONHTTPSVERIFY'] = '0';
        logger.info('SSL bypass enabled for Infosys network');
    } else {
        // LFN network - enforce SSL validation
        delete process.env['NODE_TLS_REJECT_UNAUTHORIZED'];
        delete process.env['PYTHONHTTPSVERIFY'];
        logger.info('SSL validation enabled for LFN network');
    }
    
    logger.info('SSL configuration initialized');
}

// Set up axios defaults with conditional SSL
export function setupAxiosDefaults(context?: vscode.ExtensionContext): void {
    const axios = require('axios');
    const bypass = shouldBypassSSL(context);
    
    // Set default HTTPS agent for all axios requests
    axios.defaults.httpsAgent = getHTTPSAgent(context);
    
    // Set other SSL defaults based on network
    if (axios.defaults.https) {
        axios.defaults.https.rejectUnauthorized = !bypass;
    }
    
    // Add request interceptor to ensure correct SSL config on every request
    axios.interceptors.request.use(
        function (config: any) {
            // Ensure correct SSL config on every request
            config.httpsAgent = getHTTPSAgent(context);
            config.rejectUnauthorized = !bypass;
            config.requestCert = false;
            return config;
        },
        function (error: any) {
            return Promise.reject(error);
        }
    );
    
    logger.info(`Axios defaults configured - SSL bypass: ${bypass}`);
}

/**
 * Dynamic API URL constructors
 * These functions construct API URLs using the current base URL
 */
export function getConfigApiUrl(): string {
    return `${getBaseUrl()}/api/getConfigDetails`;
}

export function getUserInfoApiUrl(): string {
    return `${getBaseUrl()}/api/userInfo`;
}
