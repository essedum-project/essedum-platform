/**
 * Pipeline Agent Provider Constants
 * 
 * Centralized constants for Pipeline Agent Provider (main view)
 */

/**
 * Logging prefix
 */
export const LOG_PREFIX = '[PipelineAgent]';

/**
 * Pagination configuration
 */
export const PAGINATION = {
    PAGE_SIZE: 2,
    INITIAL_PAGE: 1
} as const;

/**
 * WebView commands received from client
 */
export const WEBVIEW_COMMANDS = {
    LOAD_CARDS: 'loadCards',
    FILTER: 'filter',
    REFRESH: 'refresh',
    GO_TO_PAGE: 'goToPage',
    FIRST_PAGE: 'firstPage',
    PREVIOUS_PAGE: 'previousPage',
    NEXT_PAGE: 'nextPage',
    LAST_PAGE: 'lastPage',
    VIEW_DETAILS: 'viewDetails',
    TRIGGER_LOGIN: 'triggerLogin',
    LOGOUT: 'logout',
    OPEN_COPILOT: 'openCopilot',
    UPLOAD_FROM_GITHUB: 'uploadFromGitHub',
    VIEW_ADK: 'viewAdk',
    DOWNLOAD_ADK: 'downloadAdk',
    REFRESH_JSON: 'refreshJson',
    COPY_JSON: 'copyJson',
    ADD_SKILLS_TO_COPILOT: 'addSkillsToCopilot'
} as const;

/**
 * WebView commands sent to client
 */
export const CLIENT_COMMANDS = {
    UPDATE_CARDS: 'updateCards',
    SHOW_DETAILS: 'showDetails',
    ADK_FILES_STATUS: 'adkFilesStatus',
    AUTHENTICATION_PROGRESS: 'authenticationProgress',
    AUTHENTICATION_ERROR: 'authenticationError',
    AUTHENTICATION_SUCCESS: 'authenticationSuccess',
    SKILLS_LOADED: 'skillsLoaded'
} as const;

/**
 * Icon glyphs used by the client for the "Attach a skill" menu, keyed by
 * skillType returned from the API. This webview has no icon font (unlike the
 * web app's mat-icon), so plain unicode glyphs are used instead — the type
 * keys mirror the web app's iconMap (agent-pipeline.component.ts) for parity.
 */
export const SKILL_ICON_MAP: Record<string, string> = {
    CODE_GENERATION: '✨',
    TEST_GENERATION: '🧪',
    DOCUMENTATION: '📖',
    REFACTOR: '🛠',
    DEBUG: '🐞',
    SECURITY: '🛡',
    PERFORMANCE: '⚡',
    ANALYSIS: '🧩'
} as const;

export const DEFAULT_SKILL_ICON = '🔧';

/**
 * HTTP parameters for API calls
 */
export const HTTP_PARAMS = {
    IS_CACHED: 'true',
    ADAPTER_INSTANCE: 'internal',
    INTERFACE_TYPE: 'pipeline-agent', // Critical: distinguishes Pipeline Agent from Pipeline
    CLOUD_PROVIDER: 'internal'
} as const;

/**
 * File extensions to language mapping
 */
export const LANGUAGE_MAP: Record<string, string> = {
    'py': 'python',
    'js': 'javascript',
    'ts': 'typescript',
    'json': 'json',
    'xml': 'xml',
    'html': 'html',
    'css': 'css',
    'md': 'markdown',
    'txt': 'plaintext',
    'yml': 'yaml',
    'yaml': 'yaml',
    'sh': 'shellscript',
    'sql': 'sql',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'go': 'go',
    'rs': 'rust',
    'rb': 'ruby',
    'php': 'php'
} as const;

/**
 * Default language for unknown extensions
 */
export const DEFAULT_LANGUAGE = 'plaintext';

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
    ROOT_DIR_NAME: 'essedum-pipeline-agent',
    JSON_EXTENSION: '.json'
} as const;

/**
 * File naming patterns
 */
export const FILE_PATTERNS = {
    JSON_SEPARATOR: '_',
    JSON_EXTENSION: '.json',
    ZIP_EXTENSION: '.zip',
    ADK_SUFFIX: '_adk'
} as const;

/**
 * VS Code context keys
 */
export const CONTEXT_KEYS = {
    IS_AUTHENTICATED: 'essedum.isAuthenticated'
} as const;

/**
 * Global state keys
 */
export const STATE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    PROJECT: 'project',
    ROLE: 'role'
} as const;

/**
 * Default organization
 */
export const DEFAULT_ORGANIZATION = '';

/**
 * View columns
 */
export const VIEW_COLUMNS = {
    ONE: 1,
    TWO: 2
} as const;

/**
 * HTML file paths (relative to dist folder)
 */
export const HTML_PATHS = {
    AGENT_VIEW: 'app/pipeline-agent/pipeline-agent.html',
    AGENT_CSS: 'app/pipeline-agent/pipeline-agent.css',
    AGENT_CONSTANTS: 'constants/pipeline-agent-constants.js',
    AGENT_CLIENT: 'app/pipeline-agent/pipeline-agent-client.js'
} as const;

/**
 * Template placeholders
 */
export const TEMPLATE_PLACEHOLDERS = {
    CSS_URI: '{{CSS_URI}}',
    CONSTANTS_URI: '{{CONSTANTS_URI}}',
    JS_URI: '{{JS_URI}}'
} as const;

/**
 * Minimum filter length
 */
export const FILTER_CONFIG = {
    MIN_LENGTH: 1
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
    PIPELINE_NOT_FOUND: 'Pipeline Agent not found',
    NO_JSON_FILES: 'No JSON files found in pipeline',
    FAILED_LOAD_HTML: 'Failed to read pipeline-agent.html',
    PROMPT_EMPTY: 'Prompt cannot be empty',
    NO_COPILOT_MODELS: 'No Copilot models available',
    AUTH_REQUIRED: 'Authentication required to access Pipeline Agent'
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
    JSON_SAVED: '✓ JSON file saved to server successfully',
    FILE_DELETED: '✓ Cached file deleted successfully'
} as const;

/**
 * Progress notification titles
 */
export const PROGRESS_TITLES = {
    LOADING_AGENT: 'Loading Pipeline Agent',
    SAVING_JSON: 'Saving to server',
    GENERATING_ADK: 'Generating and uploading ADK'
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403
} as const;

/**
 * Copilot configuration
 */
export const COPILOT_CONFIG = {
    VENDOR: 'copilot'
} as const;

/**
 * Prompt configuration
 */
export const PROMPT_CONFIG = {
    FOLDER: 'media',
    FILENAME: 'adk-prompt.txt',
    USE_EXISTING_OPTION: 'Use existing prompt',
    CUSTOM_OPTION: 'Enter custom prompt',
    PLACEHOLDER: 'Describe what ADK structure you want to generate...'
} as const;
