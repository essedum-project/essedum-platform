/**
 * Pipeline Agent Constants
 * 
 * Centralized constants for Pipeline Agent webview client-side logic.
 * This file should be loaded before pipeline-agent-client.js in the HTML.
 */

// Create a global namespace for Pipeline Agent constants
window.PipelineAgentConstants = {
    /**
     * Commands sent FROM client TO extension
     */
    COMMANDS_TO_EXTENSION: {
        LOAD_CARDS: 'loadCards',
        FILTER: 'filter',
        REFRESH: 'refresh',
        GO_TO_PAGE: 'goToPage',
        FIRST_PAGE: 'firstPage',
        PREVIOUS_PAGE: 'previousPage',
        NEXT_PAGE: 'nextPage',
        LAST_PAGE: 'lastPage',
        VIEW_DETAILS: 'viewDetails',
        OPEN_COPILOT: 'openCopilot',
        UPLOAD_FROM_GITHUB: 'uploadFromGitHub',
        VIEW_ADK: 'viewAdk',
        DOWNLOAD_ADK: 'downloadAdk',
        REFRESH_JSON: 'refreshJson',
        COPY_JSON: 'copyJson',
        ADD_SKILLS_TO_COPILOT: 'addSkillsToCopilot'
    },

    /**
     * Commands received FROM extension TO client
     */
    COMMANDS_FROM_EXTENSION: {
        UPDATE_CARDS: 'updateCards',
        SHOW_DETAILS: 'showDetails',
        ACTION_COMPLETE: 'actionComplete',
        ACTION_ERROR: 'actionError',
        ENABLE_UPLOAD: 'enableUpload',
        ADK_FILES_STATUS: 'adkFilesStatus',
        SKILLS_LOADED: 'skillsLoaded'
    },

    /**
     * Pagination configuration
     */
    PAGINATION: {
        MAX_VISIBLE_PAGES: 5
    },

    /**
     * UI timing constants (in milliseconds)
     */
    TIMING: {
        STATUS_MESSAGE_DURATION: 3000
    },

    /**
     * Date formatting options
     */
    DATE_FORMAT_OPTIONS: {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    },

    /**
     * CSS display values
     */
    DISPLAY: {
        NONE: 'none',
        BLOCK: 'block',
        GRID: 'grid',
        FLEX: 'flex',
        INLINE_BLOCK: 'inline-block'
    },

    /**
     * Default values
     */
    DEFAULTS: {
        PIPELINE_TYPE: 'Agent',
        CREATED_BY: 'Unknown User',
        STATUS: 'active',
        PIPELINE_ID: 'N/A',
        UNKNOWN_ID: 'Unknown'
    },

    /**
     * Status types for action messages
     */
    STATUS_TYPES: {
        SUCCESS: 'success',
        ERROR: 'error'
    },

    /**
     * UI text strings
     */
    TEXT: {
        DETAILS_TITLE: 'Pipeline Agent Details'
    }
};

// Freeze the constants to prevent modifications
Object.freeze(window.PipelineAgentConstants.COMMANDS_TO_EXTENSION);
Object.freeze(window.PipelineAgentConstants.COMMANDS_FROM_EXTENSION);
Object.freeze(window.PipelineAgentConstants.PAGINATION);
Object.freeze(window.PipelineAgentConstants.TIMING);
Object.freeze(window.PipelineAgentConstants.DATE_FORMAT_OPTIONS);
Object.freeze(window.PipelineAgentConstants.DISPLAY);
Object.freeze(window.PipelineAgentConstants.DEFAULTS);
Object.freeze(window.PipelineAgentConstants.STATUS_TYPES);
Object.freeze(window.PipelineAgentConstants.TEXT);
Object.freeze(window.PipelineAgentConstants);

console.log('[Pipeline Agent Constants] Constants loaded and frozen');


