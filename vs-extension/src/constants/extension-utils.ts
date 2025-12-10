/**
 * Utility Functions for Essedum AI Platform VS Code Extension
 * 
 * This file contains reusable utility functions for:
 * - Authentication management
 * - Error handling
 * - Message formatting
 * - Extension lifecycle management
 * 
 * @fileoverview Common utility functions to promote code reuse and maintainability
 * @author Essedum AI Platform Team
 * @version 1.0.0
 */

import * as vscode from 'vscode';
import { CONTEXT_KEYS, COMMANDS, MESSAGES, DEBUG_CONFIG } from './app-constants';

// ================================
// AUTHENTICATION UTILITIES
// ================================

/**
 * Updates the authentication context for VS Code UI visibility
 * @param isAuthenticated - Whether the user is currently authenticated
 */
export async function updateAuthenticationContext(isAuthenticated: boolean): Promise<void> {
    try {
        await vscode.commands.executeCommand(
            COMMANDS.VSCODE.SET_CONTEXT, 
            CONTEXT_KEYS.IS_AUTHENTICATED, 
            isAuthenticated
        );
        
        if (DEBUG_CONFIG.VERBOSE_LOGGING) {
            console.log(MESSAGES.SUCCESS.AUTH_CONTEXT_UPDATED(isAuthenticated));
        }
    } catch (error) {
        console.error(MESSAGES.ERROR.AUTH_CONTEXT_UPDATE_FAILED, error);
        // Fallback: ensure context is set to false on error
        await vscode.commands.executeCommand(
            COMMANDS.VSCODE.SET_CONTEXT, 
            CONTEXT_KEYS.IS_AUTHENTICATED, 
            false
        );
    }
}

/**
 * Checks authentication status and updates UI context
 * @param authService - The authentication service instance
 */
export async function checkAndUpdateAuthStatus(authService: any): Promise<boolean> {
    try {
        const isAuthenticated = await authService.isTokenValid();
        await updateAuthenticationContext(isAuthenticated);
        return isAuthenticated;
    } catch (error) {
        console.error(MESSAGES.ERROR.AUTH_CONTEXT_UPDATE_FAILED, error);
        await updateAuthenticationContext(false);
        return false;
    }
}

// ================================
// ERROR HANDLING UTILITIES
// ================================

/**
 * Determines the user-friendly error message based on error type
 * @param error - The error object
 * @returns User-friendly error message
 */
export function getAuthErrorMessage(error: any): string {
    const errorMessage = error?.message || error?.toString() || '';
    
    if (errorMessage.includes('cancelled')) {
        return MESSAGES.ERROR.AUTH_CANCELLED;
    } else if (errorMessage.includes('certificate')) {
        return MESSAGES.ERROR.SSL_CERTIFICATE_ERROR;
    } else if (errorMessage.includes('connection')) {
        return MESSAGES.ERROR.CONNECTION_ERROR;
    } else if (errorMessage.includes('expired')) {
        return MESSAGES.ERROR.SESSION_EXPIRED;
    } else {
        return `${MESSAGES.ERROR.AUTH_FAILED}: ${errorMessage}`;
    }
}

/**
 * Shows an error message with retry and help options
 * @param message - The error message to display
 * @param retryCommand - Command to execute on retry (optional)
 * @param helpUrl - URL to open for help (optional)
 */
export async function showErrorWithOptions(
    message: string, 
    retryCommand?: string, 
    helpUrl?: string
): Promise<void> {
    const options = ['OK'];
    
    if (retryCommand) {
        options.unshift('Retry');
    }
    
    if (helpUrl) {
        options.push('Help');
    }
    
    const selection = await vscode.window.showErrorMessage(message, ...options);
    
    if (selection === 'Retry' && retryCommand) {
        await vscode.commands.executeCommand(retryCommand);
    } else if (selection === 'Help' && helpUrl) {
        await vscode.env.openExternal(vscode.Uri.parse(helpUrl));
    }
}

// ================================
// PROGRESS AND NOTIFICATION UTILITIES
// ================================

/**
 * Shows a progress notification for an async operation
 * @param title - Progress notification title
 * @param operation - Async operation to execute
 * @param cancellable - Whether the operation can be cancelled
 * @returns Promise with the operation result
 */
export async function showProgressNotification<T>(
    title: string,
    operation: (progress: vscode.Progress<{ increment?: number; message?: string }>, token: vscode.CancellationToken) => Promise<T>,
    cancellable: boolean = true
): Promise<T> {
    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title,
        cancellable
    }, operation);
}

/**
 * Shows a success message with optional actions
 * @param message - Success message to display
 * @param actions - Optional action buttons
 * @returns Promise with the selected action
 */
export async function showSuccessMessage(
    message: string, 
    ...actions: string[]
): Promise<string | undefined> {
    return vscode.window.showInformationMessage(message, ...actions);
}

// ================================
// EXTENSION LIFECYCLE UTILITIES
// ================================

/**
 * Safely registers a disposable with the extension context
 * @param context - VS Code extension context
 * @param disposable - Disposable to register
 */
export function registerDisposable(context: vscode.ExtensionContext, disposable: vscode.Disposable): void {
    try {
        context.subscriptions.push(disposable);
    } catch (error) {
        console.error('Failed to register disposable:', error);
        // Attempt to dispose manually if context registration fails
        disposable.dispose();
    }
}

/**
 * Safely registers a command with the extension context
 * @param context - VS Code extension context
 * @param commandId - Command identifier
 * @param callback - Command callback function
 */
export function registerCommand(
    context: vscode.ExtensionContext, 
    commandId: string, 
    callback: (...args: any[]) => any
): void {
    try {
        const disposable = vscode.commands.registerCommand(commandId, callback);
        registerDisposable(context, disposable);
        
        if (DEBUG_CONFIG.VERBOSE_LOGGING) {
            console.log(`${DEBUG_CONFIG.LOG_PREFIXES.EXTENSION} Registered command: ${commandId}`);
        }
    } catch (error) {
        console.error(`Failed to register command ${commandId}:`, error);
    }
}

/**
 * Safely registers a webview view provider with the extension context
 * @param context - VS Code extension context
 * @param viewId - View identifier
 * @param provider - Webview view provider
 * @param options - Optional provider options
 */
export function registerWebviewViewProvider(
    context: vscode.ExtensionContext,
    viewId: string,
    provider: vscode.WebviewViewProvider,
    options?: { readonly webviewOptions?: { readonly retainContextWhenHidden?: boolean } }
): void {
    try {
        const disposable = vscode.window.registerWebviewViewProvider(viewId, provider, options);
        registerDisposable(context, disposable);
        
        if (DEBUG_CONFIG.VERBOSE_LOGGING) {
            console.log(`${DEBUG_CONFIG.LOG_PREFIXES.EXTENSION} Registered webview provider: ${viewId}`);
        }
    } catch (error) {
        console.error(`Failed to register webview provider ${viewId}:`, error);
    }
}

/**
 * Safely registers a file system provider with the extension context
 * @param context - VS Code extension context
 * @param scheme - File system scheme
 * @param provider - File system provider
 * @param options - Optional provider options
 */
export function registerFileSystemProvider(
    context: vscode.ExtensionContext,
    scheme: string,
    provider: vscode.FileSystemProvider,
    options?: { readonly isCaseSensitive?: boolean; readonly isReadonly?: boolean }
): void {
    try {
        const disposable = vscode.workspace.registerFileSystemProvider(scheme, provider, options);
        registerDisposable(context, disposable);
        
        if (DEBUG_CONFIG.VERBOSE_LOGGING) {
            console.log(`${DEBUG_CONFIG.LOG_PREFIXES.EXTENSION} Registered file system provider: ${scheme}`);
        }
    } catch (error) {
        console.error(`Failed to register file system provider ${scheme}:`, error);
    }
}

// ================================
// LOGGING UTILITIES
// ================================

/**
 * Creates a standardized logger for a component
 * @param component - Component name for log prefix
 * @returns Logger object with standard methods
 */
export function createLogger(component: string) {
    const prefix = `[${component}]`;
    
    return {
        info: (message: string, ...args: any[]) => {
            if (DEBUG_CONFIG.VERBOSE_LOGGING) {
                console.log(prefix, message, ...args);
            }
        },
        warn: (message: string, ...args: any[]) => {
            console.warn(prefix, message, ...args);
        },
        error: (message: string, ...args: any[]) => {
            console.error(prefix, message, ...args);
        },
        debug: (message: string, ...args: any[]) => {
            if (DEBUG_CONFIG.VERBOSE_LOGGING) {
                console.debug(prefix, message, ...args);
            }
        }
    };
}

// ================================
// VALIDATION UTILITIES
// ================================

/**
 * Validates that required services are initialized
 * @param services - Object containing service instances
 * @returns Boolean indicating if all services are valid
 */
export function validateServices(services: Record<string, any>): boolean {
    for (const [name, service] of Object.entries(services)) {
        if (!service) {
            console.error(`Service '${name}' is not initialized`);
            return false;
        }
    }
    return true;
}

/**
 * Safely executes a VS Code command
 * @param commandId - Command to execute
 * @param args - Command arguments
 * @returns Promise with command result or undefined on error
 */
export async function safeExecuteCommand(commandId: string, ...args: any[]): Promise<any> {
    try {
        return await vscode.commands.executeCommand(commandId, ...args);
    } catch (error) {
        console.error(`Failed to execute command '${commandId}':`, error);
        return undefined;
    }
}