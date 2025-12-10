/**
 * Pipeline Cards Client-Side JavaScript
 * 
 * This file contains the client-side JavaScript logic for the pipeline cards
 * webview interface. It handles:
 * - User interface interactions
 * - Communication with the VS Code extension
 * - Dynamic content rendering
 * - Form handling and validation
 * - Event management
 * 
 * @fileoverview Client-side JavaScript for pipeline cards webview
 * @author Essedum AI Platform Team
 * @version 1.0.0
 */

// ================================
// CONSTANTS AND CONFIGURATION
// ================================

/**
 * Application configuration constants
 */
const CONFIG = {
    /** Maximum visible pages in pagination */
    MAX_VISIBLE_PAGES: 5,

    /** Default pagination page size */
    DEFAULT_PAGE_SIZE: 4,

    /** Search debounce delay in milliseconds */
    SEARCH_DEBOUNCE_DELAY: 300,

    /** Animation durations */
    ANIMATION: {
        FAST: 200,
        NORMAL: 300,
        SLOW: 500
    },

    /** Loading state timeouts */
    TIMEOUTS: {
        LOADING_MIN: 500,
        ERROR_DISPLAY: 5000,
        SUCCESS_DISPLAY: 3000
    }
};

/**
 * Webview command constants
 */
const COMMANDS = {
    // Data operations
    // LOAD_CARDS: 'loadCards',
    REFRESH: 'refresh',
    FILTER: 'filter',

    // Navigation
    NEXT_PAGE: 'nextPage',
    PREVIOUS_PAGE: 'previousPage',
    FIRST_PAGE: 'firstPage',
    LAST_PAGE: 'lastPage',
    GO_TO_PAGE: 'goToPage',

    // Pipeline actions
    VIEW_DETAILS: 'viewDetails',
    RUN_PIPELINE: 'runPipeline',
    VIEW_LOGS: 'viewLogs',
    REFRESH_SCRIPTS: 'refreshScripts',

    // Script actions
    OPEN_SCRIPT: 'openScript',
    COPY_SCRIPT: 'copyScript',
    GENERATE_SCRIPTS: 'generateScripts',

    // UI updates
    UPDATE_CARDS: 'updateCards',
    SHOW_DETAILS: 'showDetails',
    SHOW_LOGIN_PROGRESS: 'showLoginProgress',
    SHOW_LOGIN_ERROR: 'showLoginError'
};

/**
 * CSS selector constants
 */
const SELECTORS = {
    // Input elements
    SEARCH_INPUT: '#searchInput',
    SEARCH_BTN: '#searchBtn',
    REFRESH_BTN: '#refreshBtn',

    // Content containers
    LOADING_STATE: '#loadingState',
    CARDS_CONTAINER: '#cardsContainer',
    EMPTY_STATE: '#emptyState',
    DETAILS_VIEW: '#detailsView',

    // Pagination elements
    PAGINATION_CONTAINER: '#paginationContainer',
    PAGINATION_INFO: '#paginationInfo',
    PAGINATION_PAGES: '#paginationPages',
    FIRST_PAGE_BTN: '#firstPageBtn',
    PREV_PAGE_BTN: '#prevPageBtn',
    NEXT_PAGE_BTN: '#nextPageBtn',
    LAST_PAGE_BTN: '#lastPageBtn',

    // Details view elements
    BACK_BTN: '#backBtn',
    DETAILS_TITLE: '#detailsTitle',
    PIPELINE_INFO: '#pipelineInfo',
    SCRIPTS_CONTAINER: '#scriptsContainer',
    RUN_TYPES_CONTAINER: '#runTypesContainer',
    RUN_PIPELINE_BTN: '#runPipelineBtn',
    VIEW_LOGS_BTN: '#viewLogsBtn',
    REFRESH_SCRIPTS_BTN: '#refreshScriptsBtn',

    // Login elements
    LOGIN_BUTTON: '.login-button',
    LOGIN_MESSAGE: '.logout-message p'
};

/**
 * UI text constants
 */
const UI_TEXT = {
    LOADING: {
        PIPELINES: 'Loading pipelines...',
        SCRIPTS: 'Loading scripts...',
        AUTHENTICATING: 'Authenticating...'
    },

    EMPTY_STATES: {
        NO_PIPELINES: 'No pipelines found.',
        NO_SCRIPTS: 'No scripts available for this pipeline.'
    },

    BUTTONS: {
        VIEW_DETAILS: 'View Details',
        RUN_PIPELINE: '▶ Run Pipeline',
        VIEW_LOGS: '📄 View Logs',
        REFRESH_SCRIPTS: '🔄 Refresh Scripts',
        OPEN: '📂 Open',
        COPY: '📋 Copy',
        AUTHENTICATING: 'Authenticating...',
        LOGIN: 'Login to Essedum'
    },

    TOOLTIPS: {
        FIRST_PAGE: 'First Page',
        PREVIOUS_PAGE: 'Previous Page',
        NEXT_PAGE: 'Next Page',
        LAST_PAGE: 'Last Page',
        BACK_TO_PIPELINES: 'Back to Pipelines'
    },

    MESSAGES: {
        AUTHENTICATION_ERROR: 'Authentication failed. Please try again.',
        NETWORK_ERROR: 'Network error. Please check your connection.',
        UNKNOWN_ERROR: 'An unexpected error occurred.'
    }
};

/**
 * CSS class name constants
 */
const CSS_CLASSES = {
    // State classes
    HIDDEN: 'hidden',
    LOADING: 'loading',
    ACTIVE: 'active',
    DISABLED: 'disabled',
    SELECTED: 'selected',

    // Button classes
    BTN: 'btn',
    BTN_PRIMARY: 'btn-primary',
    BTN_SECONDARY: 'btn-secondary',
    BTN_SMALL: 'btn-small',

    // Card classes
    PIPELINE_CARD: 'pipeline-card',
    CARD_HEADER: 'pipeline-card-header',
    CARD_BODY: 'pipeline-card-body',
    CARD_ACTIONS: 'pipeline-card-actions',

    // Pagination classes
    PAGE_NUMBER: 'page-number',
    PAGE_ELLIPSIS: 'page-ellipsis'
};

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Utility functions for common operations
 */
const Utils = {
    /**
     * Converts string to title case
     * @param {string} str - Input string
     * @returns {string} Title case string
     */
    toTitleCase(str) {
        if (!str) {
            return '';
        }
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },

    /**
     * Formats date to user-friendly format
     * @param {string} dateStr - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateStr) {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Unknown Date';
        }
    },

    /**
     * Sanitizes HTML content
     * @param {string} html - HTML string to sanitize
     * @returns {string} Sanitized HTML
     */
    sanitizeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    },

    /**
     * Debounces function execution
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Shows/hides element with optional animation
     * @param {HTMLElement} element - Element to show/hide
     * @param {boolean} show - Whether to show or hide
     * @param {string} displayType - CSS display type when showing
     */
    toggleElement(element, show, displayType = 'block') {
        if (!element) {
            return;
        }

        if (show) {
            element.style.display = displayType;
            element.classList.remove(CSS_CLASSES.HIDDEN);
        } else {
            element.style.display = 'none';
            element.classList.add(CSS_CLASSES.HIDDEN);
        }
    },

    /**
     * Gets user avatar letter from name
     * @param {string} name - User name
     * @returns {string} Avatar letter
     */
    getAvatarLetter(name) {
        return (name && name.length > 0) ? name.charAt(0).toUpperCase() : 'U';
    }
};

// ================================
// MAIN CLASS DEFINITION
// ================================

class PipelineCardsClient {
    constructor() {
        this.vscode = acquireVsCodeApi();
        this.initializeElements();
        this.attachEventListeners();
        this.requestInitialLoad();

        // Make available globally for onclick handlers
        window.pipelineClient = this;
    }

    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.loadingState = document.getElementById('loadingState');
        this.cardsContainer = document.getElementById('cardsContainer');
        this.emptyState = document.getElementById('emptyState');
        this.paginationContainer = document.getElementById('paginationContainer');
        this.paginationInfo = document.getElementById('paginationInfo');
        this.paginationPages = document.getElementById('paginationPages');
        this.firstPageBtn = document.getElementById('firstPageBtn');
        this.prevPageBtn = document.getElementById('prevPageBtn');
        this.nextPageBtn = document.getElementById('nextPageBtn');
        this.lastPageBtn = document.getElementById('lastPageBtn');

        // Details view elements
        this.detailsView = document.getElementById('detailsView');
        this.backBtn = document.getElementById('backBtn');
        this.detailsTitle = document.getElementById('detailsTitle');
        this.pipelineInfo = document.getElementById('pipelineInfo');
        this.scriptsContainer = document.getElementById('scriptsContainer');
        this.runTypesContainer = document.getElementById('runTypesContainer');
        this.runPipelineBtn = document.getElementById('runPipelineBtn');
        this.viewLogsBtn = document.getElementById('viewLogsBtn');
        this.refreshScriptsBtn = document.getElementById('refreshScriptsBtn');

        // Track current view state
        this.currentView = 'list'; // 'list' or 'details'
        this.currentPipelineId = null;
        this.currentPipelineData = null;
    }

    attachEventListeners() {
        // Search functionality
        this.searchBtn?.addEventListener('click', () => {
            const filter = this.searchInput.value.trim();
            this.vscode.postMessage({
                command: 'filter',
                filter: filter
            });
        });

        this.searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchBtn.click();
            }
        });

        // Refresh functionality
        this.refreshBtn?.addEventListener('click', () => {
            this.vscode.postMessage({
                command: 'refresh'
            });
        });

        // Back button functionality
        this.backBtn?.addEventListener('click', () => {
            this.showListView();
        });

        // Pagination functionality
        this.firstPageBtn?.addEventListener('click', () => {
            this.vscode.postMessage({ command: 'firstPage' });
        });

        this.prevPageBtn?.addEventListener('click', () => {
            this.vscode.postMessage({ command: 'previousPage' });
        });

        this.nextPageBtn?.addEventListener('click', () => {
            this.vscode.postMessage({ command: 'nextPage' });
        });

        this.lastPageBtn?.addEventListener('click', () => {
            this.vscode.postMessage({ command: 'lastPage' });
        });

        // Listen for messages from extension
        window.addEventListener('message', event => {
            const message = event.data;

            switch (message.command) {
                case 'updateCards':
                    this.updateCardsDisplay(message.cards, message.loading, message.pagination);
                    break;
                case 'showPipelineDetails':
                    this.showPipelineDetails(message.pipeline, message.scripts, message.runTypes);
                    break;
                case 'showLoginProgress':
                    this.showLoginProgress(message.message);
                    break;
                case 'showLoginError':
                    this.showLoginError(message.message);
                    break;
            }
        });
    }

    updateCardsDisplay(cards, loading, pagination) {
        // Show/hide loading state
        if (this.loadingState) {
            this.loadingState.style.display = loading ? 'block' : 'none';
        }

        if (loading) {
            if (this.cardsContainer) { this.cardsContainer.style.display = 'none'; }
            if (this.emptyState) { this.emptyState.style.display = 'none'; }
            if (this.paginationContainer) { this.paginationContainer.style.display = 'none'; }
            return;
        }

        // Show/hide empty state
        if (!cards || cards.length === 0) {
            if (this.cardsContainer) { this.cardsContainer.style.display = 'none'; }
            if (this.emptyState) { this.emptyState.style.display = 'block'; }
            if (this.paginationContainer) { this.paginationContainer.style.display = 'none'; }
            return;
        }

        // Show cards
        if (this.cardsContainer) { this.cardsContainer.style.display = 'block'; }
        if (this.emptyState) { this.emptyState.style.display = 'none'; }

        // Render pipeline cards
        if (this.cardsContainer) {
            this.cardsContainer.innerHTML = cards.map(pipeline => this.createCardHTML(pipeline)).join('');

            // Add event listeners to view details buttons
            document.querySelectorAll('.pipeline-action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const button = e.target.closest('.pipeline-action-btn');
                    const pipelineId = button?.dataset.pipelineId;
                    if (pipelineId) {
                        this.vscode.postMessage({
                            command: 'viewDetails',
                            cardId: pipelineId
                        });
                    }
                });
            });

            // Add keyboard navigation for cards
            document.querySelectorAll('.pipeline-card').forEach(card => {
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const button = card.querySelector('.pipeline-action-btn');
                        if (button) {
                            button.click();
                        }
                    }
                });
            });
        }

        // Update pagination
        this.updatePagination(pagination);
    }

    /**
     * Format date as "Tuesday, October 7, 2025"
     * @param {string} dateStr - Date string to format
     * @returns {string} Formatted date string
     */
    formatFullDate(dateStr) {
        if (!dateStr) { return 'Unknown'; }
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Convert string to title case
     * @param {string} str - String to convert
     * @returns {string} Title case string
     */
    toTitleCase(str) {
        if (!str) { return ''; }
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    // createCardHTML(pipeline) {
    //     const createdDate = new Date(pipeline.createdDate).toLocaleDateString();

    //     return `
    //         <div class="pipeline-card" tabindex="0" role="article" aria-label="Pipeline: ${this.toTitleCase(pipeline.alias)}">
    //             <div class="pipeline-card-header">                   
    //                     <span class="pipeline-title">${this.toTitleCase(pipeline.alias)}</span>
    //                      <span class="pipeline-type-badge">${pipeline.type.toUpperCase()}</span>
    //             </div>

    //             <div class="pipeline-card-body">                                              
    //                         <span class="metadata-value">${this.formatFullDate(pipeline.createdDate)}</span>                       
    //             </div>

    //             <div class="pipeline-card-actions">
    //             <button class="pipeline-action-btn primary" data-pipeline-id="${pipeline.id}" aria-label="View details for ${this.toTitleCase(pipeline.alias)}">
    //                     <span class="action-icon">👁</span>
    //                     <span class="action-text">View Details</span>
    //                 </button>
    //             <div class="pipeline-avatar-section">
    //                     <div class="pipeline-avatar" title="${pipeline.target?.created_by || 'Unknown User'}">
    //                         ${pipeline.target?.created_by?.charAt(0).toUpperCase() || 'U'}
    //                     </div>
    //                 </div>

    //             </div>
    //         </div>
    //     `;
    // }
    /**
        * Creates HTML for a single pipeline card
        * @param {Object} pipeline - Pipeline data
        * @returns {string} HTML string for the card
        */
    createCardHTML(pipeline) {
        const createdDate = Utils.formatDate(pipeline.createdDate);
        const title = Utils.toTitleCase(pipeline.alias);
        const avatarLetter = Utils.getAvatarLetter(pipeline.target?.created_by);
        const createdBy = pipeline.target?.created_by || 'Unknown User';

        return `
            <div class="${CSS_CLASSES.PIPELINE_CARD}" tabindex="0" role="article" 
                 aria-label="Pipeline: ${Utils.sanitizeHtml(title)}" 
                 data-pipeline-id="${pipeline.id}">
                <div class="${CSS_CLASSES.CARD_HEADER}">                   
                    <span class="pipeline-title">${Utils.sanitizeHtml(title)}</span>
                    <span class="pipeline-type-badge">${pipeline.type.toUpperCase()}</span>
                </div>
                
                <div class="${CSS_CLASSES.CARD_BODY}">                                              
                    <span class="metadata-value">${Utils.sanitizeHtml(createdDate)}</span>                       
                </div>
                
                <div class="${CSS_CLASSES.CARD_ACTIONS}">
                    <button class="pipeline-action-btn primary" 
                            data-pipeline-id="${pipeline.id}" 
                            aria-label="View details for ${Utils.sanitizeHtml(title)}">
                        <span class="action-icon">👁</span>
                        <span class="action-text">${UI_TEXT.BUTTONS.VIEW_DETAILS}</span>
                    </button>
                    <div class="pipeline-avatar-section">
                        <div class="pipeline-avatar" title="${Utils.sanitizeHtml(createdBy)}">
                            ${avatarLetter}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================
    // PAGINATION METHODS
    // ================================

    /**
     * Updates pagination display
     * @param {Object} pagination - Pagination data
     */
    updatePagination(pagination) {
        if (!pagination || pagination.totalPages <= 1) {
            if (this.paginationContainer) {
                Utils.toggleElement(this.paginationContainer, false);
            }
            return;
        }

        if (this.paginationContainer) {
            Utils.toggleElement(this.paginationContainer, true);
        }

        // Update pagination info
        if (this.paginationInfo) {
            const startItem = (pagination.currentPage - 1) * pagination.pageSize + 1;
            const endItem = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount);
            this.paginationInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages} (${startItem}-${endItem} of ${pagination.totalCount} items)`;
        }

        // Update button states
        this.updatePaginationButtons(pagination);

        // Update page numbers
        this.updatePageNumbers(pagination);
    }

    /**
   * Updates pagination button states
   * @param {Object} pagination - Pagination data
   */
    updatePaginationButtons(pagination) {
        const { currentPage, totalPages } = pagination;

        if (this.firstPageBtn) {
            this.firstPageBtn.disabled = currentPage === 1;
        }
        if (this.prevPageBtn) {
            this.prevPageBtn.disabled = currentPage === 1;
        }
        if (this.nextPageBtn) {
            this.nextPageBtn.disabled = currentPage === totalPages;
        }
        if (this.lastPageBtn) {
            this.lastPageBtn.disabled = currentPage === totalPages;
        }
    }

    /**
      * Updates page number display
      * @param {Object} pagination - Pagination data
      */
    updatePageNumbers(pagination) {
        if (!this.paginationPages) { return; }

        const { currentPage, totalPages } = pagination;
        const maxVisiblePages = 5;
        let startPage, endPage;

        if (totalPages <= maxVisiblePages) {
            startPage = 1;
            endPage = totalPages;
        } else {
            const halfVisible = Math.floor(maxVisiblePages / 2);

            if (currentPage <= halfVisible) {
                startPage = 1;
                endPage = maxVisiblePages;
            } else if (currentPage + halfVisible >= totalPages) {
                startPage = totalPages - maxVisiblePages + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - halfVisible;
                endPage = currentPage + halfVisible;
            }
        }

        let pagesHtml = '';

        // Add first page and ellipsis if needed
        if (startPage > 1) {
            pagesHtml += `<button class="page-number" data-page="1">1</button>`;
            if (startPage > 2) {
                pagesHtml += `<span class="page-ellipsis">...</span>`;
            }
        }

        // Add visible page numbers
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === currentPage ? 'active' : '';
            pagesHtml += `<button class="page-number ${isActive}" data-page="${i}">${i}</button>`;
        }

        // Add ellipsis and last page if needed
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pagesHtml += `<span class="page-ellipsis">...</span>`;
            }
            pagesHtml += `<button class="page-number" data-page="${totalPages}">${totalPages}</button>`;
        }

        this.paginationPages.innerHTML = pagesHtml;

        // Add click listeners to page numbers
        this.paginationPages.querySelectorAll('.page-number').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                this.vscode.postMessage({
                    command: 'goToPage',
                    page: page
                });
            });
        });
    }

    // ================================
    // DETAILS VIEW METHODS
    // ================================

    /**
     * Shows pipeline details view
     * @param {Object} pipeline - Pipeline data
     * @param {Object} scripts - Scripts data
     * @param {Array} runTypes - Run types data
     */
    showPipelineDetails(pipeline, scripts, runTypes) {
        console.log('[PipelineClient] Showing pipeline details:', pipeline.alias);

        this.currentView = 'details';
        this.currentPipelineId = pipeline.id;
        this.currentPipelineData = { pipeline, scripts, runTypes };

        // Hide list view elements
        this.hideListView();

        // Show details view
        Utils.toggleElement(this.detailsView, true, 'flex');

        // Update details content
        this.updateDetailsContent(pipeline, scripts, runTypes);
    }

    showListView() {
        this.currentView = 'list';
        this.currentPipelineId = null;
        this.currentPipelineData = null;

        // Hide details view
        if (this.detailsView) {
            this.detailsView.style.display = 'none';
        }

        // Show list view elements
        this.showListViewElements();

        // Request refresh of cards list
        this.vscode.postMessage({
            command: 'loadCards'
        });
    }

    hideListView() {
        if (this.cardsContainer) {
            this.cardsContainer.style.display = 'none';
        }
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
        if (this.paginationContainer) {
            this.paginationContainer.style.display = 'none';
        }
        if (this.loadingState) {
            this.loadingState.style.display = 'none';
        }

        // Hide search container and header buttons when in details view
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.style.display = 'none';
        }

        const headerButtons = document.querySelector('.header-buttons');
        if (headerButtons) {
            headerButtons.style.display = 'none';
        }
    }

    showListViewElements() {
        // Show appropriate elements based on current state
        // This will be called when returning from details view
        if (this.cardsContainer && this.cardsContainer.innerHTML.trim()) {
            this.cardsContainer.style.display = 'block';
        }

        // Show search container and header buttons when returning to list view
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.style.display = 'flex';
        }

        const headerButtons = document.querySelector('.header-buttons');
        if (headerButtons) {
            headerButtons.style.display = 'flex';
        }
    }

    updateDetailsContent(pipeline, scripts, runTypes) {
        // Update title
        if (this.detailsTitle) {
            this.detailsTitle.textContent = `Pipeline: ${pipeline.alias || pipeline.name || 'Unnamed Pipeline'}`;
        }

        // Update pipeline info
        this.updatePipelineInfo(pipeline);

        // Update scripts
        this.updateScriptsContent(scripts);

        // Update run types
        this.updateRunTypesContent(runTypes);

        // Setup action buttons
        this.setupActionButtons(pipeline);
    }

    /**
     * Updates pipeline information section
     * @param {Object} pipeline - Pipeline data
     */
    updatePipelineInfo(pipeline) {
        if (!this.pipelineInfo) {
            return;
        }

        const createdDate = pipeline.createdDate || 'Unknown';
        const createdBy = pipeline.target?.created_by || 'Unknown';

        this.pipelineInfo.innerHTML = `
            <div>
                <div class="pipeline-card-header-info">                   
                    <span class="pipeline-title">${Utils.sanitizeHtml(Utils.toTitleCase(pipeline.alias))}</span>
                    <span class="pipeline-type-badge">${pipeline.type.toUpperCase()}</span>
                </div>
                <div class="pipeline-card-body">                                              
                    <div class="metadata-item">
                        <strong>Created Date: </strong>
                        <span class="metadata-value">${Utils.sanitizeHtml(createdDate)}</span>
                    </div>
                    <div class="metadata-item">
                        <strong>Created By: </strong>
                        <span class="metadata-value">${Utils.sanitizeHtml(createdBy)}</span>
                    </div>
                </div>
            </div>            
        `;
    }

    /**
        * Updates scripts content section
        * @param {Object} scripts - Scripts data
        */
    updateScriptsContent(scripts) {
        if (!this.scriptsContainer) {
            return;
        }

        if (!scripts || !scripts.files || scripts.files.length === 0) {
            this.scriptsContainer.innerHTML = `
                <div class="empty-scripts">
                    <p>${UI_TEXT.EMPTY_STATES.NO_SCRIPTS}</p>
                </div>
            `;
            return;
        }

        const scriptsHtml = scripts.files.map((file, index) => `
            <div class="script-item">
                <div class="script-info">
                    <div class="script-name">${Utils.sanitizeHtml(file.fileName)}</div>                    
                    <div class="script-type">${file.language} (${file.extension})</div>
                </div>
                <div class="script-actions">                    
                    <button class="${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_SMALL} ${CSS_CLASSES.BTN_PRIMARY}" 
                            onclick="window.pipelineClient.openScript(${index})" 
                            title="Open ${Utils.sanitizeHtml(file.fileName)}">
                        ${UI_TEXT.BUTTONS.OPEN}
                    </button>                  
                    <button class="${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_SMALL} ${CSS_CLASSES.BTN_SECONDARY}" 
                            onclick="window.pipelineClient.copyScript('${file.fileName}')" 
                            title="Copy ${Utils.sanitizeHtml(file.fileName)}">
                        ${UI_TEXT.BUTTONS.COPY}
                    </button>
                </div>
            </div>
        `).join('');

        this.scriptsContainer.innerHTML = scriptsHtml;
    }

    /**
     * Updates run types content section
     * @param {Array} runTypes - Run types data
     */
    updateRunTypesContent(runTypes) {
        if (!this.runTypesContainer) {
            return;
        }

        if (!runTypes || runTypes.length === 0) {
            this.runTypesContainer.innerHTML = `
                <div class="empty-run-types">
                    <p>No run types available.</p>
                </div>
            `;
            return;
        }

        const runTypeOptions = runTypes.map((runType, index) => `
            <option value="${index}" ${index === 0 ? 'selected' : ''}>
                ${runType.type || 'Unknown Type'} - ${runType.dsAlias || 'Default'}
            </option>
        `).join('');

        this.runTypesContainer.innerHTML = `
            <div class="form-group">
                <label for="runTypeSelect" class="form-label">Select Run Type:</label>
                <select id="runTypeSelect" class="form-select" onchange="window.pipelineClient.selectRunType(this.value)">
                    ${runTypeOptions}
                </select>
            </div>
        `;

        // Store selected run type (default to first one)
        this.selectedRunType = runTypes[0] || null;
    }



    // Helper methods for script actions
    /**
    * Sets up action buttons for details view
    * @param {Object} pipeline - Pipeline data
    */
    setupActionButtons(pipeline) {
        // Run Pipeline button
        if (this.runPipelineBtn) {
            this.runPipelineBtn.onclick = () => {
                if (this.selectedRunType) {
                    this.vscode.postMessage({
                        command: 'runScript',
                        cardId: pipeline.id,
                        runType: this.selectedRunType
                    });
                } else {
                    this.vscode.postMessage({
                        command: 'showError',
                        message: 'Please select a run type first.'
                    });
                }
            };
        }

        // View Logs button
        if (this.viewLogsBtn) {
            this.viewLogsBtn.onclick = () => {
                this.vscode.postMessage({
                    command: 'viewLogs',
                    cardId: pipeline.id
                });
            };
        }

        // Refresh Scripts button
        if (this.refreshScriptsBtn) {
            this.refreshScriptsBtn.onclick = () => {
                this.vscode.postMessage({
                    command: 'refreshScript',
                    cardId: pipeline.id
                });
            };
        }
    }

    openScript(fileIndex) {
        if (this.currentPipelineData && this.currentPipelineData.scripts && this.currentPipelineData.scripts.files) {
            const file = this.currentPipelineData.scripts.files[fileIndex];
            if (file) {
                this.vscode.postMessage({
                    command: 'openScript',
                    cardId: this.currentPipelineId,
                    fileName: file.fileName,
                    fileIndex: fileIndex
                });
            }
        }
    }

    copyScript(fileName) {
        this.vscode.postMessage({
            command: 'copyScript',
            cardId: this.currentPipelineId,
            fileName: fileName
        });
    }

    selectRunType(index) {
        if (this.currentPipelineData && this.currentPipelineData.runTypes) {
            const selectedIndex = parseInt(index);
            if (selectedIndex >= 0 && selectedIndex < this.currentPipelineData.runTypes.length) {
                // Update selected run type
                this.selectedRunType = this.currentPipelineData.runTypes[selectedIndex];
                console.log('Selected run type:', this.selectedRunType);
            }
        }
    }

    generateScripts() {
        if (this.currentPipelineId) {
            this.vscode.postMessage({
                command: 'generateScripts',
                cardId: this.currentPipelineId
            });
        }
    }

    requestInitialLoad() {
        // Request initial data load
        this.vscode.postMessage({
            command: 'loadCards'
        });
    }

    showLoginProgress(message) {
        // Find the login button and show progress
        const loginButton = document.querySelector('.login-button');
        if (loginButton) {
            loginButton.textContent = message || 'Authenticating...';
            loginButton.disabled = true;
            loginButton.style.opacity = '0.7';
        }

        // Also update any status messages
        const loginMessage = document.querySelector('.logout-message p');
        if (loginMessage) {
            loginMessage.textContent = message || 'Authenticating with Keycloak...';
        }
    }

    showLoginError(message) {
        // Reset the login button
        const loginButton = document.querySelector('.login-button');
        if (loginButton) {
            loginButton.textContent = 'Login Again';
            loginButton.disabled = false;
            loginButton.style.opacity = '1';
            loginButton.style.backgroundColor = '#dc3545';
        }

        // Show error message
        const loginMessage = document.querySelector('.logout-message p');
        if (loginMessage) {
            loginMessage.textContent = `Login failed: ${message}. Please try again.`;
            loginMessage.style.color = 'var(--vscode-errorForeground)';
        }

        // Reset error state after a few seconds
        setTimeout(() => {
            if (loginButton) {
                loginButton.style.backgroundColor = '#007acc';
            }
            if (loginMessage) {
                loginMessage.style.color = '';
                loginMessage.textContent = 'Please run the "Login to Essedum" command to authenticate again.';
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PipelineCardsClient();
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PipelineCardsClient();
    });
} else {
    new PipelineCardsClient();
}