/**
 * Centralized API Configuration for Essedum AI Platform
 * This file contains all API endpoints and configuration in one place
 */

import * as https from 'https';

// CRITICAL: Disable SSL verification globally for Node.js
// This must be set before any HTTPS requests are made
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

// Additional SSL bypass for axios and other HTTP clients
if (typeof global !== 'undefined') {
    (global as any).GLOBAL_HTTPS_AGENT = {
        rejectUnauthorized: false,
        requestCert: false,
        agent: false
    };
}

// Dynamic BASE_URL management
let currentBaseUrl: string | null = null; // Start with null, will be set when user selects network

// Function to get current base URL
export function getBaseUrl(): string {
    // If no URL is set yet, return a placeholder - this should only happen during initialization
    if (currentBaseUrl === null) {
        console.warn('Base URL not set yet - network selection required');
        return 'https://lfn.essedum.anuket.iol.unh.edu'; // This will cause obvious errors if used before network selection
    }
    return currentBaseUrl;
}

export function setBaseUrl(newUrl: string): void {
    currentBaseUrl = newUrl;
    console.log('Base URL updated to:', newUrl);
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

// HTTPS Agent for bypassing SSL certificate issues
export const HTTPS_AGENT = new https.Agent({
    rejectUnauthorized: false,
    // Additional SSL bypass options
    checkServerIdentity: () => undefined,
    secureOptions: require('constants').SSL_OP_LEGACY_SERVER_CONNECT,
    // More comprehensive SSL bypass
    secureProtocol: 'TLSv1_2_method',
    requestCert: false,
    keepAlive: true,
    maxSockets: 10,
    timeout: 30000
});

// Create authenticated headers
export function createAuthHeaders(token: string, role: any, projectId: string = '2', projectName: string = 'leo1311'): Record<string, string> {
    return {
        ...DEFAULT_REQUEST_CONFIG.headers,
        'Authorization': `Bearer ${token}`,
        'Project': projectId,
        'ProjectName': projectName,
        'roleId': role.id,
        'roleName': role.name
    };
}

// Create axios config with SSL bypass
export function createSecureAxiosConfig(token: string, role: any, additionalConfig: any = {}): any {
    // Ensure Node.js SSL bypass is set
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    
    const baseConfig = {
        ...DEFAULT_REQUEST_CONFIG,
        headers: createAuthHeaders(token, role),
        httpsAgent: HTTPS_AGENT,
        // Additional SSL bypass settings for axios
        rejectUnauthorized: false,
        requestCert: false,
        agent: false,
        // More axios-specific SSL bypass options
        maxRedirects: 5,
        validateStatus: function (status: number) {
            return status >= 200 && status < 300; // default
        },
        // Force HTTP adapter to ignore SSL
        adapter: undefined, // Use default adapter but with our custom agent
        // Additional SSL bypass flags
        strictSSL: false,
        secureOptions: require('constants').SSL_OP_LEGACY_SERVER_CONNECT
    };
    
    // Merge additional config, ensuring httpsAgent is not overridden
    const mergedConfig = {
        ...baseConfig,
        ...additionalConfig
    };
    
    // Ensure HTTPS agent is always set and SSL is bypassed
    mergedConfig.httpsAgent = HTTPS_AGENT;
    mergedConfig.rejectUnauthorized = false;
    
    return mergedConfig;
}

// Create a simple HTTPS agent for direct use
export function createHTTPSAgent(): https.Agent {
    return new https.Agent({
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined,
        secureOptions: require('constants').SSL_OP_LEGACY_SERVER_CONNECT
    });
}

// Simple axios request wrapper with guaranteed SSL bypass
export async function makeSecureRequest(method: string, url: string, config: any = {}): Promise<any> {
    const axios = require('axios');
    
    // Force SSL bypass for this specific request
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    
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
        'project': '2',
        'projectname': 'leo1311',
        'referer': `${getBaseUrl()}/`,
        'roleid': '',
        'rolename': 'IT Port',
        'sec-ch-ua': '"Microsoft Edge";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
        'x-requested-with': 'Leap'
    };
    
    // Add authorization header if token is provided
    if (token) {
        defaultHeaders['authorization'] = `Bearer ${token}`;
    }
    
    const requestConfig = {
        method: method,
        url: url,
        httpsAgent: HTTPS_AGENT,
        rejectUnauthorized: false,
        requestCert: false,
        agent: false,
        timeout: 30000,
        headers: {
            ...defaultHeaders,
            ...config.headers
        },
        ...config
    };
    
    console.log('Making secure request to:', url);
    console.log('SSL bypass active:', process.env['NODE_TLS_REJECT_UNAUTHORIZED'] === '0');
    console.log('Request headers being sent:', requestConfig.headers);
    console.log('Token extracted:', token ? 'Token present' : 'No token');
    console.log('Full request config:', { 
        method: requestConfig.method, 
        url: requestConfig.url,
        params: requestConfig.params,
        hasHttpsAgent: !!requestConfig.httpsAgent 
    });
    
    return axios(requestConfig);
}

// Initialize global SSL bypass - call this at extension startup
export function initializeSSLBypass(): void {
    console.log('Initializing comprehensive SSL bypass...');
    
    // Set Node.js environment variables
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 'false';
    process.env['PYTHONHTTPSVERIFY'] = '0';
    
    // Override global HTTPS agent (use type assertion to bypass readonly)
    if (typeof global !== 'undefined') {
        (global as any).GLOBAL_AGENT = HTTPS_AGENT;
        
        // Override default HTTPS globalAgent using type assertion
        try {
            (https as any).globalAgent = HTTPS_AGENT;
        } catch (e) {
            console.log('Could not override global HTTPS agent, using per-request agents');
        }
    }
    
    console.log('SSL bypass initialized - all HTTPS requests will ignore certificate validation');
}

// Set up axios defaults with SSL bypass
export function setupAxiosDefaults(): void {
    const axios = require('axios');
    
    // Set default HTTPS agent for all axios requests
    axios.defaults.httpsAgent = HTTPS_AGENT;
    
    // Set other SSL bypass defaults
    if (axios.defaults.https) {
        axios.defaults.https.rejectUnauthorized = false;
    }
    
    // Add request interceptor to ensure SSL bypass on every request
    axios.interceptors.request.use(
        function (config: any) {
            // Ensure SSL bypass on every request
            config.httpsAgent = HTTPS_AGENT;
            config.rejectUnauthorized = false;
            config.requestCert = false;
            return config;
        },
        function (error: any) {
            return Promise.reject(error);
        }
    );
    
    console.log('Axios defaults and interceptors configured with SSL bypass');
}