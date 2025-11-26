/**
 * Pipeline Utility Functions for Essedum AI Platform
 * 
 * This file contains reusable utility functions for pipeline components including:
 * - Date and time formatting
 * - String manipulation and validation
 * - Webview communication helpers
 * - Error handling utilities
 * - File and script management
 * 
 * @fileoverview Utility functions for pipeline-related operations
 * @author Essedum AI Platform Team
 * @version 1.0.0
 */

import * as vscode from 'vscode';
import {
    UI_TEXT,
    DATE_FORMAT,
    PIPELINE_CONFIG,
    WEBVIEW_COMMANDS,
    CSS_CLASSES,
    getLanguageFromExtension,
    isLocalRuntime,
    isRemoteRuntime
} from './pipeline-constants';

// ================================
// DATE AND TIME UTILITIES
// ================================

/**
 * Formats a date string to a user-friendly format
 * @param dateString - ISO date string or date object
 * @param format - Format type ('short', 'long', 'datetime')
 * @returns Formatted date string
 */
export function formatDate(
    dateString: string | Date, 
    format: 'short' | 'long' | 'datetime' = 'short'
): string {
    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        
        if (isNaN(date.getTime())) {
            return UI_TEXT.LABELS.UNKNOWN;
        }

        const options = format === 'short' 
            ? DATE_FORMAT.OPTIONS.SHORT_DATE
            : format === 'long'
            ? DATE_FORMAT.OPTIONS.LONG_DATE
            : DATE_FORMAT.OPTIONS.DATE_TIME;

        return date.toLocaleDateString(DATE_FORMAT.DEFAULT_LOCALE, options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return UI_TEXT.LABELS.UNKNOWN;
    }
}

/**
 * Formats a date to full weekday format (e.g., "Tuesday, October 7, 2025")
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatFullDate(dateString: string): string {
    return formatDate(dateString, 'long');
}

/**
 * Gets relative time string (e.g., "2 hours ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function getRelativeTime(dateString: string): string {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) {
            return 'Just now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else {
            return formatDate(dateString, 'short');
        }
    } catch (error) {
        console.error('Error calculating relative time:', error);
        return UI_TEXT.LABELS.UNKNOWN;
    }
}

// ================================
// STRING MANIPULATION UTILITIES
// ================================

/**
 * Converts a string to title case
 * @param str - Input string
 * @returns Title case string
 */
export function toTitleCase(str: string): string {
    if (!str) {
        return '';
    }
    
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Converts a string to sentence case
 * @param str - Input string
 * @returns Sentence case string
 */
export function toSentenceCase(str: string): string {
    if (!str) {
        return '';
    }
    
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncates text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Sanitizes text for HTML display
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export function sanitizeHtml(text: string): string {
    if (!text) {
        return '';
    }
    
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Generates a user avatar letter from name
 * @param name - User name
 * @returns Avatar letter
 */
export function getUserAvatarLetter(name: string): string {
    if (!name || typeof name !== 'string') {
        return 'U';
    }
    return name.charAt(0).toUpperCase();
}

// ================================
// WEBVIEW COMMUNICATION UTILITIES
// ================================

/**
 * Creates a webview message object
 * @param command - Command identifier
 * @param data - Additional data
 * @returns Webview message object
 */
export function createWebviewMessage(command: string, data: any = {}): any {
    return {
        command,
        ...data
    };
}

/**
 * Posts a message to webview safely
 * @param webview - VS Code webview instance
 * @param command - Command identifier
 * @param data - Additional data
 */
export function postToWebview(webview: vscode.Webview, command: string, data: any = {}): void {
    try {
        const message = createWebviewMessage(command, data);
        webview.postMessage(message);
    } catch (error) {
        console.error('Failed to post message to webview:', error);
    }
}

/**
 * Shows loading state in webview
 * @param webview - VS Code webview instance
 * @param loading - Loading state
 * @param message - Optional loading message
 */
export function showWebviewLoading(
    webview: vscode.Webview, 
    loading: boolean, 
    message?: string
): void {
    postToWebview(webview, WEBVIEW_COMMANDS.UPDATE_CARDS, {
        loading,
        cards: [],
        pagination: null,
        message
    });
}

/**
 * Updates webview with cards data
 * @param webview - VS Code webview instance
 * @param cards - Pipeline cards array
 * @param pagination - Pagination information
 */
export function updateWebviewCards(
    webview: vscode.Webview,
    cards: any[],
    pagination: any
): void {
    postToWebview(webview, WEBVIEW_COMMANDS.UPDATE_CARDS, {
        loading: false,
        cards,
        pagination
    });
}

// ================================
// ERROR HANDLING UTILITIES
// ================================

/**
 * Creates a standardized error object
 * @param message - Error message
 * @param code - Error code
 * @param details - Additional error details
 * @returns Error object
 */
export function createError(message: string, code?: string, details?: any): Error {
    const error = new Error(message);
    (error as any).code = code;
    (error as any).details = details;
    return error;
}

/**
 * Gets user-friendly error message
 * @param error - Error object or string
 * @returns User-friendly error message
 */
export function getUserFriendlyErrorMessage(error: any): string {
    if (typeof error === 'string') {
        return error;
    }
    
    if (error?.message) {
        // Check for common error patterns
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
            return UI_TEXT.ERRORS.INVALID_TOKEN;
        }
        if (error.message.includes('403') || error.message.includes('forbidden')) {
            return UI_TEXT.ERRORS.PERMISSION_DENIED;
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
            return UI_TEXT.ERRORS.NETWORK_ERROR;
        }
        
        return error.message;
    }
    
    return UI_TEXT.ERRORS.FAILED_TO_LOAD;
}

/**
 * Logs error with context information
 * @param error - Error to log
 * @param context - Context information
 * @param component - Component name
 */
export function logError(error: any, context: string, component: string = 'Pipeline'): void {
    console.error(`[${component}] ${context}:`, error);
}

/**
 * Handles async operation with error logging
 * @param operation - Async operation
 * @param context - Context description
 * @param component - Component name
 * @returns Promise with error handling
 */
export async function handleAsyncOperation<T>(
    operation: () => Promise<T>,
    context: string,
    component: string = 'Pipeline'
): Promise<T | null> {
    try {
        return await operation();
    } catch (error) {
        logError(error, context, component);
        return null;
    }
}

// ================================
// FILE AND SCRIPT UTILITIES
// ================================

/**
 * Gets file information from name
 * @param fileName - File name
 * @returns File information object
 */
export function getFileInfo(fileName: string): {
    name: string;
    extension: string;
    language: string;
    nameWithoutExtension: string;
} {
    const lastDotIndex = fileName.lastIndexOf('.');
    const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex + 1) : '';
    const nameWithoutExtension = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
    const language = getLanguageFromExtension(extension);
    
    return {
        name: fileName,
        extension,
        language,
        nameWithoutExtension
    };
}

/**
 * Creates a virtual file URI for the Essedum file system
 * @param pipelineName - Pipeline name
 * @param fileName - File name
 * @returns Virtual file URI
 */
export function createEssedumFileUri(pipelineName: string, fileName: string): vscode.Uri {
    return vscode.Uri.parse(`essedum:/${pipelineName}/${fileName}`);
}

/**
 * Validates script content
 * @param content - Script content
 * @param language - Programming language
 * @returns Validation result
 */
export function validateScriptContent(content: string, language: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    
    if (!content || content.trim().length === 0) {
        errors.push('Script content cannot be empty');
    }
    
    if (language === 'python') {
        // Basic Python validation
        const lines = content.split('\n');
        let indentLevel = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            if (trimmed.length === 0 || trimmed.startsWith('#')) {
                continue; // Skip empty lines and comments
            }
            
            // Check for basic syntax issues
            if (trimmed.endsWith(':')) {
                indentLevel++;
            }
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// ================================
// PAGINATION UTILITIES
// ================================

/**
 * Calculates pagination information
 * @param totalItems - Total number of items
 * @param currentPage - Current page number (1-based)
 * @param pageSize - Items per page
 * @returns Pagination information
 */
export function calculatePagination(
    totalItems: number,
    currentPage: number,
    pageSize: number = PIPELINE_CONFIG.DEFAULT_PAGE_SIZE
): {
    totalPages: number;
    startIndex: number;
    endIndex: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    isFirstPage: boolean;
    isLastPage: boolean;
} {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
    const startIndex = (validCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    
    return {
        totalPages,
        startIndex,
        endIndex,
        hasNextPage: validCurrentPage < totalPages,
        hasPreviousPage: validCurrentPage > 1,
        isFirstPage: validCurrentPage === 1,
        isLastPage: validCurrentPage === totalPages
    };
}

/**
 * Gets page numbers for pagination display
 * @param currentPage - Current page number
 * @param totalPages - Total number of pages
 * @param maxVisible - Maximum visible page numbers
 * @returns Array of page numbers to display
 */
export function getPaginationPages(
    currentPage: number,
    totalPages: number,
    maxVisible: number = 5
): (number | 'ellipsis')[] {
    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const pages: (number | 'ellipsis')[] = [];
    const halfVisible = Math.floor(maxVisible / 2);
    
    // Always show first page
    pages.push(1);
    
    let startPage = Math.max(2, currentPage - halfVisible);
    let endPage = Math.min(totalPages - 1, currentPage + halfVisible);
    
    // Adjust if we're near the beginning or end
    if (currentPage <= halfVisible + 1) {
        endPage = Math.min(maxVisible - 1, totalPages - 1);
    }
    if (currentPage >= totalPages - halfVisible) {
        startPage = Math.max(2, totalPages - maxVisible + 2);
    }
    
    // Add ellipsis if needed
    if (startPage > 2) {
        pages.push('ellipsis');
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    
    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
        pages.push('ellipsis');
    }
    
    // Always show last page (if not already added)
    if (totalPages > 1) {
        pages.push(totalPages);
    }
    
    return pages;
}

// ================================
// RUNTIME AND EXECUTION UTILITIES
// ================================

/**
 * Determines runtime type from string
 * @param runtime - Runtime string
 * @returns Normalized runtime type
 */
export function normalizeRuntime(runtime: string): string {
    if (isLocalRuntime(runtime)) {
        return PIPELINE_CONFIG.LOCAL_RUNTIME;
    }
    if (isRemoteRuntime(runtime)) {
        return PIPELINE_CONFIG.REMOTE_RUNTIME;
    }
    return PIPELINE_CONFIG.DEFAULT_RUNTIME;
}

/**
 * Creates pipeline execution parameters
 * @param pipelineName - Pipeline name
 * @param runType - Selected run type
 * @param customParams - Custom parameters
 * @returns Execution parameters object
 */
export function createExecutionParams(
    pipelineName: string,
    runType: any,
    customParams: any = {}
): any {
    return {
        alias: pipelineName,
        cname: pipelineName,
        pipelineType: runType?.type || PIPELINE_CONFIG.DEFAULT_RUNTIME,
        isLocal: isLocalRuntime(runType?.type) ? 'true' : 'false',
        datasource: runType?.dsAlias || PIPELINE_CONFIG.DEFAULT_DATASOURCE_ALIAS,
        params: JSON.stringify(customParams),
        workerlogId: 'undefined',
        ...customParams
    };
}

// ================================
// DEBOUNCE UTILITY
// ================================

/**
 * Creates a debounced function
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// ================================
// LOCAL STORAGE UTILITIES
// ================================

/**
 * Safely gets item from VS Code global state
 * @param context - Extension context
 * @param key - Storage key
 * @param defaultValue - Default value if not found
 * @returns Stored value or default
 */
export function getStoredValue<T>(
    context: vscode.ExtensionContext,
    key: string,
    defaultValue: T
): T {
    try {
        return context.globalState.get(key, defaultValue);
    } catch (error) {
        logError(error, `Getting stored value for key: ${key}`);
        return defaultValue;
    }
}

/**
 * Safely sets item in VS Code global state
 * @param context - Extension context
 * @param key - Storage key
 * @param value - Value to store
 */
export async function setStoredValue(
    context: vscode.ExtensionContext,
    key: string,
    value: any
): Promise<void> {
    try {
        await context.globalState.update(key, value);
    } catch (error) {
        logError(error, `Setting stored value for key: ${key}`);
    }
}