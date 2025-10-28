/**
 * Application Constants for Essedum AI Platform VS Code Extension
 * 
 * This file contains all application-wide constants including:
 * - Authentication configuration
 * - Extension commands and identifiers
 * - UI configuration
 * - Default values and timeouts
 * 
 * @fileoverview Centralized constants to avoid hardcoded values throughout the application
 * @author Essedum AI Platform Team
 * @version 1.0.0
 */

// ================================
// AUTHENTICATION CONFIGURATION
// ================================

/**
 * Keycloak Authentication Configuration
 * Contains all OAuth/OIDC related settings
 */
export const AUTH_CONFIG = {
    /** Keycloak issuer URI for authentication */
    ISSUER_URI: 'https://aiplatform.az.ad.idemo-ppc.com:8443/realms/ESSEDUM',
    
    /** OAuth Client ID registered in Keycloak */
    CLIENT_ID: 'essedum-45',
    
    /** OAuth scopes requested during authentication */
    SCOPE: 'email',
    
    /** Keycloak realm name */
    REALM: 'ESSEDUM',
    
    /** Authentication timeout in milliseconds */
    AUTH_TIMEOUT: 60000,
    
    /** Token refresh threshold in minutes (refresh when token expires within this time) */
    TOKEN_REFRESH_THRESHOLD_MINUTES: 5
} as const;

// ================================
// PROJECT AND ORGANIZATION SETTINGS
// ================================

/**
 * Default project and organization configuration
 * These values are used across the application for API calls
 */

// ================================
// VS CODE EXTENSION CONFIGURATION
// ================================

/**
 * VS Code extension specific constants
 * Command IDs, view IDs, and extension metadata
 */
export const EXTENSION_CONFIG = {
    /** Extension display name */
    DISPLAY_NAME: 'Essedum AI Platform',
    
    /** Extension identifier */
    EXTENSION_ID: 'essedum',
    
    /** Main sidebar view ID */
    SIDEBAR_VIEW_ID: 'essedum-sidebar',
    
    /** Explorer view container ID */
    EXPLORER_VIEW_ID: 'essedum-explorer',
    
    /** File system scheme for virtual files */
    FILE_SYSTEM_SCHEME: 'essedum'
} as const;

/**
 * VS Code command identifiers
 * All commands registered by the extension
 */
export const COMMANDS = {
    /** Open the main sidebar panel */
    OPEN_SIDEBAR: 'essedum.openSidebar',
    
    /** Authenticate user with Keycloak */
    LOGIN: 'essedum.login',
    
    /** Logout and clear authentication */
    LOGOUT: 'essedum.logout',
    
    /** Check current authentication status */
    CHECK_AUTH: 'essedum.checkAuth',
    
    /** Run a pipeline */
    RUN_PIPELINE: 'essedum.runPipeline',
    
    /** Open job logs viewer */
    OPEN_JOB_LOGS: 'essedum.openJobLogs',
    
    /** Show job logs in terminal */
    SHOW_JOB_LOGS_TERMINAL: 'essedum.showJobLogsInTerminal',
    
    /** Open internal job logs */
    OPEN_INTERNAL_JOB_LOGS: 'essedum.openInternalJobLogs',
    
    /** Debug upload endpoints */
    DEBUG_UPLOAD: 'essedum.debugUpload',
    
    /** Get current configuration */
    GET_CONFIGURATION: 'essedum.getConfiguration',
    
    /** Refresh configuration from server */
    REFRESH_CONFIGURATION: 'essedum.refreshConfiguration',
    
    /** Get user information */
    GET_USER_INFO: 'essedum.getUserInfo',
    
    /** Refresh user information */
    REFRESH_USER_INFO: 'essedum.refreshUserInfo',
    
    /** VS Code built-in commands */
    VSCODE: {
        /** Set extension context for conditional UI */
        SET_CONTEXT: 'setContext',
        
        /** Open extension view */
        OPEN_EXTENSION_VIEW: 'workbench.view.extension.essedum-explorer'
    }
} as const;

/**
 * Context keys for conditional UI visibility
 */
export const CONTEXT_KEYS = {
    /** Whether user is authenticated */
    IS_AUTHENTICATED: 'essedum.isAuthenticated'
} as const;

// ================================
// UI CONFIGURATION
// ================================

/**
 * User interface configuration and messages
 */
export const UI_CONFIG = {
    /** Progress notification locations */
    PROGRESS_LOCATION: {
        NOTIFICATION: 1, // vscode.ProgressLocation.Notification
        SOURCE_CONTROL: 2, // vscode.ProgressLocation.SourceControl
        WINDOW: 10 // vscode.ProgressLocation.Window
    },
    
    /** Standard button labels */
    BUTTONS: {
        OK: 'OK',
        CANCEL: 'Cancel',
        RETRY: 'Retry',
        LOGIN: 'Login',
        LOGOUT: 'Logout',
        HELP: 'Help',
        VIEW_PIPELINES: 'View Pipelines',
        OPEN_PIPELINES: 'Open Pipelines'
    },
    
    /** Icon identifiers for commands */
    ICONS: {
        SIGN_OUT: '$(sign-out)',
        LIST_FLAT: '$(list-flat)',
        LIST_TREE: '$(list-tree)',
        TERMINAL: '$(terminal)'
    }
} as const;

/**
 * User-facing messages and notifications
 */
export const MESSAGES = {
    /** Success messages */
    SUCCESS: {
        EXTENSION_ACTIVATED: 'Essedum AI Platform extension is now active!',
        LOGIN_SUCCESS: 'Successfully authenticated with Keycloak! Welcome to Essedum AI Platform.',
        LOGOUT_SUCCESS: 'Successfully logged out from Essedum AI Platform.',
        AUTH_CONTEXT_UPDATED: (isAuthenticated: boolean) => `Authentication context updated: ${isAuthenticated}`
    },
    
    /** Error messages */
    ERROR: {
        AUTH_FAILED: 'Authentication failed',
        AUTH_CANCELLED: 'Authentication was cancelled',
        SSL_CERTIFICATE_ERROR: 'SSL certificate error. Please check with your administrator.',
        CONNECTION_ERROR: 'Cannot connect to Keycloak server. Please check your network connection.',
        SESSION_EXPIRED: 'Authentication session expired. Please try again.',
        LOGOUT_FAILED: (error: string) => `Logout failed: ${error}`,
        AUTH_STATUS_CHECK_FAILED: (error: string) => `Failed to check authentication status: ${error}`,
        AUTH_CONTEXT_UPDATE_FAILED: 'Failed to update authentication context:',
        PIPELINE_INIT_FAILED: 'Failed to initialize pipeline provider:',
        LOGIN_REQUIRED: 'Please login first to run pipelines.'
    },
    
    /** Informational messages */
    INFO: {
        PIPELINE_RUN_INSTRUCTION: (pipelineName: string) => 
            `To run pipeline "${pipelineName}", use the Run Pipeline button in the script viewer.`,
        AUTH_STATUS_MESSAGE: (isAuthenticated: boolean, isValid: boolean, tokenExpiry?: Date, needsRefresh?: boolean) => {
            let message = `Authentication Status:\n`;
            message += `• Authenticated: ${isAuthenticated ? '✅' : '❌'}\n`;
            message += `• Token Valid: ${isValid ? '✅' : '❌'}\n`;
            
            if (tokenExpiry) {
                message += `• Token Expires: ${tokenExpiry.toLocaleString()}\n`;
            }
            
            if (needsRefresh) {
                message += `• Needs Refresh: ⚠️ Yes\n`;
            }
            
            return message;
        }
    },
    
    /** Progress messages */
    PROGRESS: {
        AUTHENTICATING: 'Authenticating with Keycloak',
        CLEARING_TOKENS: 'Clearing existing tokens...',
        STARTING_OAUTH: 'Starting automatic OAuth authentication...',
        AUTH_SUCCESSFUL: 'Authentication successful, updating services...'
    }
} as const;

// ================================
// DEVELOPMENT AND DEBUGGING
// ================================

/**
 * Development and debugging configuration
 */
export const DEBUG_CONFIG = {
    /** Enable detailed console logging */
    VERBOSE_LOGGING: true,
    
    /** Log prefixes for different components */
    LOG_PREFIXES: {
        EXTENSION: '[Essedum Extension]',
        AUTH: '[Auth Service]',
        PIPELINE: '[Pipeline Service]',
        FILE_PROVIDER: '[File Provider]',
        API: '[API Request]'
    }
} as const;

// ================================
// EXTERNAL LINKS
// ================================

/**
 * External URLs and links
 */
export const EXTERNAL_LINKS = {
    /** Keycloak documentation URL */
    KEYCLOAK_DOCS: 'https://docs.keycloak.org/',
    
    /** Essedum platform base URL */
    PLATFORM_BASE_URL: 'https://essedum.az.ad.idemo-ppc.com'
} as const;

// ================================
// TYPE DEFINITIONS
// ================================

/**
 * Type definitions for better type safety
 */
export type CommandId = string;
export type ContextKey = string;
export type ExtensionViewId = string;

// ================================
// VALIDATION FUNCTIONS
// ================================

/**
 * Validates if a command ID is registered
 * @param commandId - Command ID to validate
 * @returns boolean indicating if command is valid
 */
export function isValidCommand(commandId: string): boolean {
    const allCommands: string[] = [
        COMMANDS.OPEN_SIDEBAR,
        COMMANDS.LOGIN,
        COMMANDS.LOGOUT,
        COMMANDS.CHECK_AUTH,
        COMMANDS.RUN_PIPELINE,
        COMMANDS.OPEN_JOB_LOGS,
        COMMANDS.SHOW_JOB_LOGS_TERMINAL,
        COMMANDS.OPEN_INTERNAL_JOB_LOGS,
        COMMANDS.DEBUG_UPLOAD,
        COMMANDS.VSCODE.SET_CONTEXT,
        COMMANDS.VSCODE.OPEN_EXTENSION_VIEW
    ];
    return allCommands.includes(commandId);
}

/**
 * Validates if a context key is registered
 * @param contextKey - Context key to validate
 * @returns boolean indicating if context key is valid
 */
export function isValidContextKey(contextKey: string): boolean {
    const allContextKeys: string[] = [
        CONTEXT_KEYS.IS_AUTHENTICATED
    ];
    return allContextKeys.includes(contextKey);
}