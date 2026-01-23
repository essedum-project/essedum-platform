/**
 * Extension Logger Messages
 * 
 * Centralized logging messages for the extension
 * This file contains all logger.info, logger.warn, logger.error, and logger.debug messages
 * 
 * @fileoverview Logger message constants
 * @author Essedum AI Platform Team
 * @version 1.0.21
 */

/**
 * Extension activation and initialization messages
 */
export const ACTIVATION_MESSAGES = {
    TOKEN_VALIDATION_FAILED: 'Token validation failed, showing login screen',
    ACTIVATION_COMPLETED: 'Extension activation completed successfully',
    ACTIVATION_FAILED: 'Failed to activate extension:',
} as const;

/**
 * Configuration initialization messages
 */
export const CONFIG_MESSAGES = {
    INITIALIZING: 'Initializing configuration from server...',
    BASE_URL_NOT_SET: 'Base URL not set yet - skipping configuration initialization',
    COMPLETED: 'Configuration initialization completed successfully',
    FETCH_FAILED: 'Failed to fetch configuration from server:',
    SSL_ERROR: 'SSL Certificate Error detected',
    ATTEMPTING_FALLBACK: 'Attempting configuration fetch with additional SSL bypass...',
    FALLBACK_SUCCESS: 'Configuration fetched successfully with fallback method',
    FALLBACK_FAILED: 'Fallback configuration fetch failed:',
    USING_DEFAULT: 'Using default configuration due to server fetch failure',
} as const;

/**
 * SSL configuration messages
 */
export const SSL_MESSAGES = {
    INITIALIZING: 'Initializing SSL configuration...',
    COMPLETED: 'SSL bypass configuration completed - all HTTPS certificate validation disabled',
} as const;

/**
 * Authentication service messages
 */
export const AUTH_SERVICE_MESSAGES = {
    CREATING: 'Creating authentication service with default configuration...',
    CONFIG_SOURCE: (source: string) => `Using configuration from: ${source}`,
    INITIALIZING: 'Initializing authentication service...',
    STORED_NETWORK: (network: string) => `Stored network: ${network}`,
    HAS_USED_LOGIN: (used: boolean) => `Has used login screen: ${used}`,
    FOUND_STORED_CONFIG: (network: string) => `Found stored network configuration and login screen usage: ${network}`,
    AUTH_STATUS: (status: boolean) => `Authentication status with stored network: ${status}`,
    NO_STORED_NETWORK: 'No stored network or user has not used login screen, will show login screen',
    INIT_ERROR: 'Error initializing authentication service:',
} as const;

/**
 * Login screen messages
 */
export const LOGIN_SCREEN_MESSAGES = {
    CREATING_PROVIDER: 'Creating login screen provider...',
    SHOWING: 'Showing login screen...',
    FOCUS_FAILED: 'Could not focus login view directly:',
    DISPLAY_COMPLETED: 'Login screen display process completed',
    SHOW_FAILED: 'Failed to show login screen:',
} as const;

/**
 * Webview provider messages
 */
export const WEBVIEW_MESSAGES = {
    REGISTERING: 'Registering webview providers...',
    REGISTERED: 'Webview providers registered successfully',
} as const;

/**
 * Network selection messages
 */
export const NETWORK_MESSAGES = {
    SELECTED: (network: string) => `Network selected: ${network}`,
    SERVICES_INITIALIZED: 'Services initialized successfully after network selection',
    SERVICES_INIT_FAILED: 'Failed to initialize some services after network selection:',
    AUTH_FAILED: 'Authentication failed after network selection:',
    LOGIN_CANCELLED: 'Login cancelled by user',
    SELECTION_CANCELLED: 'Network selection cancelled',
    LOGIN_COMPLETED: 'Login with network completed successfully',
} as const;

/**
 * File system provider messages
 */
export const FILE_SYSTEM_MESSAGES = {
    CREATING: 'Creating file system provider...',
} as const;

/**
 * Pipeline service messages
 */
export const PIPELINE_MESSAGES = {
    INITIALIZING: 'Initializing pipeline services...',
    INITIALIZED_WITH_TOKEN: 'Pipeline services initialized with valid stored token',
    TOKEN_INVALID: 'Stored token is invalid or expired:',
    NO_TOKENS: 'No stored tokens available, initializing with empty token',
    INITIALIZED: 'Pipeline services initialized successfully',
    REGISTRATION_COMPLETED: 'Pipeline services registration completed',
    INIT_FAILED: 'Failed to initialize pipeline services with token, creating with empty tokens:',
} as const;

/**
 * Command registration messages
 */
export const COMMAND_MESSAGES = {
    REGISTERING: 'Registering extension commands...',
    REGISTERED: 'All extension commands registered successfully',
} as const;

/**
 * Login command messages
 */
export const LOGIN_MESSAGES = {
    NETWORK_REQUESTED: (network?: string) => `Login with network requested: ${network || 'none'}`,
    STARTING: 'Starting login process...',
    COMPLETED: 'Login process completed successfully',
    AUTH_SUCCESS: (tokenLength: number) => `Authentication successful, token length: ${tokenLength}`,
    USER_NOT_AUTHORIZED: 'User is not authorized to access the application',
    ERROR_DURING_LOGIN: 'Error during login process:',
    AUTH_FAILED: 'Authentication failed:',
} as const;

/**
 * Logout command messages
 */
export const LOGOUT_MESSAGES = {
    STARTING: 'Starting logout process...',
    CANCELLED: 'Logout cancelled by user',
    COMPLETED: (withNetworkSwitch: boolean) => `Logout completed successfully${withNetworkSwitch ? ' (with network switch)' : ''}`,
    FAILED: 'Logout failed:',
} as const;

/**
 * Sidebar command messages
 */
export const SIDEBAR_MESSAGES = {
    OPENING: 'Opening sidebar...',
} as const;

/**
 * Auth check command messages
 */
export const AUTH_CHECK_MESSAGES = {
    CHECKING: 'Checking authentication status...',
    FAILED: 'Failed to check authentication status:',
} as const;

/**
 * Pipeline run command messages
 */
export const PIPELINE_RUN_MESSAGES = {
    HANDLING: (pipeline: string) => `Handling run pipeline request: ${pipeline}`,
} as const;

/**
 * User data command messages
 */
export const USER_DATA_MESSAGES = {
    CLEARING: 'Clearing all cached user data...',
    CLEARED: 'User data cleared successfully via command',
    CLEAR_FAILED: 'Failed to clear user data:',
    DEBUGGING: 'Debugging current user data...',
    DEBUG_FAILED: 'Failed to debug user data:',
} as const;

/**
 * Navigation command messages
 */
export const NAVIGATION_MESSAGES = {
    SHOWING_NAVIGATION: 'Showing navigation screen...',
    SHOWING_PIPELINE: 'Showing pipeline screen...',
    SHOWING_AGENT: 'Showing pipeline agent screen...',
    BACK_TO_NAVIGATION: 'Navigating back to navigation screen...',
} as const;

/**
 * User info command messages
 */
export const USER_INFO_MESSAGES = {
    GETTING: 'Getting current user information...',
    GET_FAILED: 'Failed to get user information:',
    REFRESHING: 'Refreshing user information...',
    REFRESH_COMPLETED: 'User info refresh completed successfully',
    REFRESH_FAILED: 'Failed to refresh user information:',
} as const;

/**
 * Clear data utility messages
 */
export const CLEAR_DATA_MESSAGES = {
    CLEARING_ALL: 'Clearing all cached user data...',
    CLEARING_KEY: (key: string) => `Clearing key: ${key}`,
    ALL_CLEARED: 'All user data cleared from cache',
    CLEARING_EXCEPT_NETWORK: 'Clearing user data but preserving network selection...',
    CLEARED_EXCEPT_NETWORK: 'User data cleared, network selection preserved',
} as const;

/**
 * Token update messages
 */
export const TOKEN_MESSAGES = {
    UPDATING_SERVICES: 'Updating services with new token...',
    SERVICES_UPDATED: 'Services updated with new token successfully',
    UPDATE_FAILED: 'Failed to update services with token:',
} as const;

/**
 * User login processing messages
 */
export const USER_LOGIN_MESSAGES = {
    PROCESSING: 'Processing user information after login...',
    RETURN_URL_PARAMS: 'Return URL contains portfolio, project, and role parameters',
    HAS_PORTFOLIOS: 'User has portfolios, initializing user access',
    NO_PORTFOLIOS: 'User has no portfolios',
    PROCESSING_ERROR: 'Error processing user information:',
} as const;

/**
 * User info fetching messages
 */
export const FETCH_USER_MESSAGES = {
    FETCHING: 'Fetching user information...',
    FETCHING_FROM_API: 'Fetching user info from API...',
    FETCHED: 'User information fetched and cached successfully',
    FETCH_ERROR: 'Error fetching user info from API:',
} as const;

/**
 * User access initialization messages
 */
export const USER_ACCESS_MESSAGES = {
    INITIALIZING: 'Initializing user access settings...',
    NO_PORTFOLIOS: 'No portfolios available for user',
    DASHBOARD_ERROR: 'Error fetching dashboard constants, using fallback initialization:',
    COMPLETED: 'User access initialization completed successfully',
    INIT_ERROR: 'Error initializing user access:',
    PROJECT_DETERMINED: (project: string) => `User access initialization completed with project: ${project}`,
} as const;

/**
 * Dashboard constants messages
 */
export const DASHBOARD_MESSAGES = {
    FETCHING: 'Fetching dashboard constants...',
    BASE_URL_NOT_SET: 'Base URL not set, cannot fetch dashboard constants',
    FETCHED: 'Dashboard constants fetched successfully',
    FETCH_ERROR: 'Error fetching dashboard constants:',
    FETCH_COMPLETED: 'Dashboard constants fetch completed (placeholder)',
} as const;

/**
 * Encryption messages
 */
export const ENCRYPTION_MESSAGES = {
    AES_DECRYPT_REQUESTED: 'AES decryption requested',
} as const;

/**
 * JSON parsing messages
 */
export const JSON_MESSAGES = {
    PARSE_ERROR: 'JSON.parse error:',
    STRINGIFY_ERROR: 'JSON.stringify error:',
} as const;

/**
 * Extension deactivation messages
 */
export const DEACTIVATION_MESSAGES = {
    DEACTIVATING: 'Essedum AI Platform extension is being deactivated',
    COMPLETED: 'Extension deactivation completed successfully',
    ERROR: 'Error during extension deactivation:',
} as const;

/**
 * Debug messages (Keycloak configuration)
 */
export const DEBUG_MESSAGES = {
    KEYCLOAK_CONFIG: (config: any) => `Keycloak configuration: ${JSON.stringify(config)}`,
} as const;

/**
 * Single namespace export for all messages
 * Use this for cleaner imports: import { MESSAGES } from './messages/extension-messages';
 */
export const MESSAGES = {
    ACTIVATION: ACTIVATION_MESSAGES,
    CONFIG: CONFIG_MESSAGES,
    SSL: SSL_MESSAGES,
    AUTH_SERVICE: AUTH_SERVICE_MESSAGES,
    LOGIN_SCREEN: LOGIN_SCREEN_MESSAGES,
    WEBVIEW: WEBVIEW_MESSAGES,
    NETWORK: NETWORK_MESSAGES,
    FILE_SYSTEM: FILE_SYSTEM_MESSAGES,
    PIPELINE: PIPELINE_MESSAGES,
    COMMAND: COMMAND_MESSAGES,
    LOGIN: LOGIN_MESSAGES,
    LOGOUT: LOGOUT_MESSAGES,
    SIDEBAR: SIDEBAR_MESSAGES,
    AUTH_CHECK: AUTH_CHECK_MESSAGES,
    PIPELINE_RUN: PIPELINE_RUN_MESSAGES,
    USER_DATA: USER_DATA_MESSAGES,
    NAVIGATION: NAVIGATION_MESSAGES,
    USER_INFO: USER_INFO_MESSAGES,
    CLEAR_DATA: CLEAR_DATA_MESSAGES,
    TOKEN: TOKEN_MESSAGES,
    USER_LOGIN: USER_LOGIN_MESSAGES,
    FETCH_USER: FETCH_USER_MESSAGES,
    USER_ACCESS: USER_ACCESS_MESSAGES,
    DASHBOARD: DASHBOARD_MESSAGES,
    ENCRYPTION: ENCRYPTION_MESSAGES,
    JSON: JSON_MESSAGES,
    DEACTIVATION: DEACTIVATION_MESSAGES,
    DEBUG: DEBUG_MESSAGES,
} as const;
