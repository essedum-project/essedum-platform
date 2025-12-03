/**
 * Pipeline Constants for Essedum AI Platform Pipeline Components
 * 
 * This file contains all pipeline-specific constants including:
 * - Pipeline configuration and defaults
 * - Language and file type mappings
 * - UI text and labels
 * - API endpoints and request configurations
 * - Pagination and display settings
 * 
 * @fileoverview Centralized constants for pipeline-related components
 * @author Essedum AI Platform Team
 * @version 1.0.0
 */

import { get } from "axios";
import {  getBaseUrl } from "./api-config";

// ================================
// PIPELINE CONFIGURATION
// ================================

/**
 * Default pipeline configuration settings
 */
export const PIPELINE_CONFIG = {
    /** Default page size for pagination */
    DEFAULT_PAGE_SIZE: 3,
    
    /** Initial page number */
    INITIAL_PAGE: 1,
    
    /** Default organization name */
    DEFAULT_ORGANIZATION: 'leo1311',
    
    /** Default runtime type for pipeline execution */
    DEFAULT_RUNTIME: 'REMOTE',
    
    /** Local runtime identifier */
    LOCAL_RUNTIME: 'Local',
    
    /** Remote runtime identifier */
    REMOTE_RUNTIME: 'REMOTE',
    
    /** Default file type for scripts */
    DEFAULT_FILE_TYPE: 'Python3',
    
    /** Default data source alias */
    DEFAULT_DATASOURCE_ALIAS: 'Sample-Remote-Test'
} as const;

/**
 * Pagination display configuration
 */
export const PAGINATION_CONFIG = {
    /** Maximum visible page numbers in pagination */
    MAX_VISIBLE_PAGES: 5,
    
    /** Minimum items required to show pagination */
    MIN_ITEMS_FOR_PAGINATION: 1
} as const;

// ================================
// LANGUAGE AND FILE TYPE MAPPINGS
// ================================

/**
 * File extension to language mapping
 */
export const LANGUAGE_MAPPINGS = {
    'py': 'python',
    'js': 'javascript',
    'ts': 'typescript',
    'json': 'json',
    'yml': 'yaml',
    'yaml': 'yaml',
    'txt': 'plaintext',
    'md': 'markdown',
    'sql': 'sql',
    'r': 'r',
    'sh': 'shell',
    'bat': 'batch'
} as const;

/**
 * Language to file extension mapping
 */
export const EXTENSION_MAPPINGS = {
    'python': 'py',
    'javascript': 'js',
    'typescript': 'ts',
    'json': 'json',
    'yaml': 'yml',
    'plaintext': 'txt',
    'markdown': 'md',
    'sql': 'sql',
    'r': 'r',
    'shell': 'sh',
    'batch': 'bat'
} as const;

/**
 * Default file types and their properties
 */
export const FILE_TYPES = {
    PYTHON: {
        extension: 'py',
        language: 'python',
        mimeType: 'text/x-python',
        serverType: 'Python3'
    },
    JAVASCRIPT: {
        extension: 'js',
        language: 'javascript',
        mimeType: 'text/javascript',
        serverType: 'JavaScript'
    },
    REQUIREMENTS: {
        fileName: 'requirements.txt',
        description: 'Python dependencies',
        language: 'plaintext'
    }
} as const;

// ================================
// UI TEXT AND LABELS
// ================================

/**
 * User interface text constants
 */
export const UI_TEXT = {
    /** Loading states */
    LOADING: {
        PIPELINES: 'Loading pipelines...',
        SCRIPTS: 'Loading scripts...',
        AUTHENTICATION: 'Authenticating...',
        RUNNING_PIPELINE: 'Running pipeline...',
        SAVING: 'Saving...',
        GENERATING: 'Generating scripts...'
    },
    
    /** Error messages */
    ERRORS: {
        NO_PIPELINES: 'No pipelines found.',
        NO_SCRIPTS: 'No scripts available for this pipeline.',
        AUTHENTICATION_REQUIRED: 'Please login to view pipelines.',
        FAILED_TO_LOAD: 'Failed to load pipelines. Please try again.',
        FAILED_TO_RUN: 'Failed to run pipeline. Please check your permissions.',
        INVALID_TOKEN: 'Invalid authentication token. Please login again.',
        NETWORK_ERROR: 'Network error. Please check your connection.',
        PERMISSION_DENIED: 'Permission denied. Please contact your administrator.'
    },
    
    /** Success messages */
    SUCCESS: {
        PIPELINE_STARTED: 'Pipeline started successfully!',
        SCRIPT_SAVED: 'Script saved successfully!',
        SCRIPT_COPIED: 'Script copied to clipboard!',
        AUTHENTICATION_SUCCESS: 'Authentication successful!'
    },
    
    /** Button labels */
    BUTTONS: {
        VIEW_DETAILS: 'View Details',
        RUN_PIPELINE: '▶ Run Pipeline',
        VIEW_LOGS: '📄 View Logs',
        REFRESH_SCRIPTS: '🔄 Refresh Scripts',
        OPEN_SCRIPT: '📂 Open',
        COPY_SCRIPT: '📋 Copy',
        BACK: 'Back',
        SEARCH: 'Search',
        REFRESH: 'Refresh',
        LOGIN: 'Login to Essedum',
        LOGOUT: 'Logout',
        FIRST_PAGE: '⏮',
        PREVIOUS_PAGE: '◀',
        NEXT_PAGE: '▶',
        LAST_PAGE: '⏭'
    },
    
    /** Section headers */
    HEADERS: {
        PIPELINES: 'Pipelines',
        PIPELINE_DETAILS: 'Pipeline Details',
        PIPELINE_INFORMATION: 'Pipeline Information',
        AVAILABLE_SCRIPTS: 'Available Scripts',
        RUN_TYPES: 'Run Types',
        ACTIONS: 'Actions'
    },
    
    /** Form labels */
    LABELS: {
        SELECT_RUN_TYPE: 'Select Run Type:',
        SEARCH_PLACEHOLDER: 'Search pipelines...',
        CREATED_DATE: 'Created Date:',
        CREATED_BY: 'Created By:',
        TYPE: 'Type:',
        UNKNOWN: 'Unknown'
    },
    
    /** Tooltips and accessibility labels */
    TOOLTIPS: {
        FIRST_PAGE: 'First Page',
        PREVIOUS_PAGE: 'Previous Page',
        NEXT_PAGE: 'Next Page',
        LAST_PAGE: 'Last Page',
        BACK_TO_PIPELINES: 'Back to Pipelines',
        VIEW_DETAILS_FOR: (name: string) => `View details for ${name}`,
        OPEN_FILE: (fileName: string) => `Open ${fileName}`,
        COPY_FILE: (fileName: string) => `Copy ${fileName}`
    }
} as const;

// ================================
// API AND REQUEST CONFIGURATION
// ================================

/**
 * Request timeout configurations
 */
export const REQUEST_TIMEOUTS = {
    /** Default request timeout */
    DEFAULT: 30000,
    
    /** File upload timeout */
    FILE_UPLOAD: 60000,
    
    /** Long running operations timeout */
    LONG_OPERATION: 120000
} as const;

/**
 * HTTP request headers for form data
 */
export const FORM_DATA_HEADERS = {
    'origin': getBaseUrl(),
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9',
    'referer': `${getBaseUrl()}/`,
    'sec-ch-ua': '"Microsoft Edge";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0'
} as const;

// ================================
// SCRIPT GENERATION TEMPLATES
// ================================

/**
 * Python script templates and patterns
 */
export const SCRIPT_TEMPLATES = {
    /** Python data extractor function template */
    DATA_EXTRACTOR: `def DatasetExtractor():    #python-script Data
    import pandas as pd
    import json
    
    # Your data extraction logic here
    df = pd.DataFrame()  # Replace with actual data
    
    # Convert to JSON format expected by pipeline
    return df.to_json(orient='records')`,
    
    /** Default Python script header */
    PYTHON_HEADER: `# Generated Python script for pipeline execution
# This script is auto-generated and can be modified as needed

import json
import pandas as pd
from typing import Any, Dict, List`,
    
    /** Model registration URL template */
    MODEL_CARD_URL: (project: string) => 
        `${getBaseUrl()}api/aip/service/v1/models/register?project=${project}&isCached=true&adapter_instance=local`
} as const;

// ================================
// WEBVIEW COMMUNICATION COMMANDS
// ================================

/**
 * Commands used for webview communication
 */
export const WEBVIEW_COMMANDS = {
    /** Data loading commands */
    // LOAD_CARDS: 'loadCards',
    REFRESH: 'refresh',
    FILTER: 'filter',
    
    /** Navigation commands */
    NEXT_PAGE: 'nextPage',
    PREVIOUS_PAGE: 'previousPage',
    FIRST_PAGE: 'firstPage',
    LAST_PAGE: 'lastPage',
    GO_TO_PAGE: 'goToPage',
    
    /** Pipeline actions */
    VIEW_DETAILS: 'viewDetails',
    RUN_PIPELINE: 'runPipeline',
    VIEW_LOGS: 'viewLogs',
    REFRESH_SCRIPTS: 'refreshScripts',
    
    /** Script actions */
    OPEN_SCRIPT: 'openScript',
    COPY_SCRIPT: 'copyScript',
    GENERATE_SCRIPTS: 'generateScripts',
    
    /** Authentication */
    LOGIN: 'login',
    LOGOUT: 'logout',
    
    /** UI updates */
    UPDATE_CARDS: 'updateCards',
    SHOW_DETAILS: 'showDetails',
    SHOW_LOGIN_PROGRESS: 'showLoginProgress',
    SHOW_LOGIN_ERROR: 'showLoginError'
} as const;

// ================================
// CSS CLASS NAMES
// ================================

/**
 * CSS class name constants for consistency
 */
export const CSS_CLASSES = {
    /** Container classes */
    CONTAINER: 'container',
    CARDS_CONTAINER: 'cards-container',
    DETAILS_VIEW: 'details-view',
    
    /** Card classes */
    PIPELINE_CARD: 'pipeline-card',
    CARD_HEADER: 'pipeline-card-header',
    CARD_BODY: 'pipeline-card-body',
    CARD_ACTIONS: 'pipeline-card-actions',
    
    /** Button classes */
    BTN: 'btn',
    BTN_PRIMARY: 'btn-primary',
    BTN_SECONDARY: 'btn-secondary',
    BTN_SMALL: 'btn-small',
    BTN_PAGINATION: 'btn-pagination',
    
    /** State classes */
    LOADING: 'loading',
    EMPTY_STATE: 'empty-state',
    ACTIVE: 'active',
    DISABLED: 'disabled',
    HIDDEN: 'hidden',
    
    /** Form classes */
    FORM_GROUP: 'form-group',
    FORM_LABEL: 'form-label',
    FORM_SELECT: 'form-select',
    SEARCH_INPUT: 'search-input'
} as const;

// ================================
// DATE AND TIME FORMATTING
// ================================

/**
 * Date formatting options and patterns
 */
export const DATE_FORMAT = {
    /** Default locale for date formatting */
    DEFAULT_LOCALE: 'en-US',
    
    /** Date format options */
    OPTIONS: {
        SHORT_DATE: { year: 'numeric', month: 'short', day: 'numeric' } as Intl.DateTimeFormatOptions,
        LONG_DATE: { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        } as Intl.DateTimeFormatOptions,
        DATE_TIME: { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        } as Intl.DateTimeFormatOptions
    }
} as const;

// ================================
// VALIDATION PATTERNS
// ================================

/**
 * Regular expressions for validation
 */
export const VALIDATION_PATTERNS = {
    /** Pipeline name pattern */
    PIPELINE_NAME: /^[a-zA-Z0-9_-]+$/,
    
    /** File name pattern */
    FILE_NAME: /^[a-zA-Z0-9_.-]+$/,
    
    /** Email pattern */
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    
    /** URL pattern */
    URL: /^https?:\/\/.+/
} as const;

// ================================
// DEFAULT VALUES
// ================================

/**
 * Default values for various pipeline components
 */
export const DEFAULTS = {
    /** Default pipeline parameters */
    PIPELINE_PARAMS: '{}',
    
    /** Default worker log ID */
    WORKER_LOG_ID: 'undefined',
    
    /** Default user identifier */
    USER_AVATAR: 'U',
    
    /** Default error retry count */
    MAX_RETRIES: 3,
    
    /** Default debounce delay for search */
    SEARCH_DEBOUNCE_MS: 300
} as const;

// ================================
// TYPE DEFINITIONS
// ================================

/**
 * Type definitions for better type safety
 */
export type PipelineRuntime = typeof PIPELINE_CONFIG.LOCAL_RUNTIME | typeof PIPELINE_CONFIG.REMOTE_RUNTIME;
export type FileLanguage = keyof typeof LANGUAGE_MAPPINGS;
export type WebviewCommand = typeof WEBVIEW_COMMANDS[keyof typeof WEBVIEW_COMMANDS];
export type CSSClass = typeof CSS_CLASSES[keyof typeof CSS_CLASSES];

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Get language from file extension
 * @param extension - File extension (with or without dot)
 * @returns Language identifier
 */
export function getLanguageFromExtension(extension: string): string {
    const cleanExt = extension.replace(/^\./, '').toLowerCase();
    return LANGUAGE_MAPPINGS[cleanExt as keyof typeof LANGUAGE_MAPPINGS] || 'plaintext';
}

/**
 * Get file extension from language
 * @param language - Language identifier
 * @returns File extension without dot
 */
export function getExtensionFromLanguage(language: string): string {
    return EXTENSION_MAPPINGS[language as keyof typeof EXTENSION_MAPPINGS] || 'txt';
}

/**
 * Check if runtime is local
 * @param runtime - Runtime identifier
 * @returns Boolean indicating if runtime is local
 */
export function isLocalRuntime(runtime: string): boolean {
    return runtime === PIPELINE_CONFIG.LOCAL_RUNTIME || runtime.toLowerCase() === 'local';
}

/**
 * Check if runtime is remote
 * @param runtime - Runtime identifier
 * @returns Boolean indicating if runtime is remote
 */
export function isRemoteRuntime(runtime: string): boolean {
    return runtime === PIPELINE_CONFIG.REMOTE_RUNTIME || runtime.toUpperCase() === 'REMOTE';
}

/**
 * Validate pipeline name
 * @param name - Pipeline name to validate
 * @returns Boolean indicating if name is valid
 */
export function isValidPipelineName(name: string): boolean {
    return VALIDATION_PATTERNS.PIPELINE_NAME.test(name);
}

/**
 * Validate file name
 * @param name - File name to validate
 * @returns Boolean indicating if name is valid
 */
export function isValidFileName(name: string): boolean {
    return VALIDATION_PATTERNS.FILE_NAME.test(name);
}