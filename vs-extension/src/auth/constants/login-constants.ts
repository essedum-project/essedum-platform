/**
 * Login Screen Constants
 * 
 * Constants specific to the login screen UI and functionality
 * 
 * @fileoverview Login screen constants for Essedum AI Platform
 * @author Essedum AI Platform Team
 * @version 1.0.21
 */

/**
 * Network display information
 */
export const NETWORK_INFO = {
    INFOSYS: {
        name: 'Infosys Internal Network',
        description: 'For Infosys employees and internal users'
    },
    LFN: {
        name: 'LFN Network',
        description: 'For Linux Foundation Networking users'
    },
    SERVER5G: {
        name: '5G Server Network',
        description: 'For 5G Server users'
    }
} as const;

/**
 * UI Text Constants
 */
export const UI_TEXT = {
    TITLE: '🔐 Essedum AI Platform',
    SUBTITLE: 'Please select your authentication network',
    LABEL: 'Authentication Network:',
    SELECT_PLACEHOLDER: '-- Select Network --',
    LOGIN_BUTTON: 'Login',
    CANCEL_BUTTON: 'Cancel',
    LOADING_MESSAGE: 'Authenticating...'
} as const;

/**
 * WebView Message Commands
 * Commands used for communication between webview and extension
 */
export const LOGIN_COMMANDS = {
    // From webview to extension
    LOGIN: 'login',
    CANCEL: 'cancel',
    READY: 'ready',

    // From extension to webview
    SHOW_LOADING: 'showLoading',
    HIDE_LOADING: 'hideLoading',
    SHOW_ERROR: 'showError',
    RESET: 'reset'
} as const;

/**
 * Default messages
 */
export const LOGIN_MESSAGES = {
    DEFAULT_LOADING: 'Authenticating...',
    CRITICAL_ERROR_TITLE: '⚠️ Critical Error',
    CRITICAL_ERROR_MESSAGE: 'Unable to load login screen. Please reinstall the extension.'
} as const;

/**
 * Login Screen View Type ID
 */
export const LOGIN_VIEW_TYPE = 'essedum-login';

/**
 * Generate a cryptographically random nonce for Content Security Policy
 * @returns {string} A 32-character random string
 */
export function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
