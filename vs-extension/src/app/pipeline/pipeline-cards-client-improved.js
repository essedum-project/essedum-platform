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
    LOAD_CARDS: 'loadCards',
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

/**
 * Pipeline Cards Client - Manages client-side interactions
 */
class PipelineCardsClient {
    /**
     * Creates a new Pipeline Cards Client instance
     */
    constructor() {
        this.vscode = acquireVsCodeApi();
        this.currentView = 'list'; // 'list' or 'details'
        this.currentPipelineId = null;
        this.currentPipelineData = null;
        this.selectedRunType = null;
        
        // Initialize the client
        this.initializeElements();
        this.attachEventListeners();
        this.requestInitialLoad();

        // Make available globally for onclick handlers
        window.pipelineClient = this;
        
        console.log('[PipelineClient] Initialized successfully');
    }

    // ================================
    // INITIALIZATION METHODS
    // ================================

    /**
     * Initializes all DOM element references
     */
    initializeElements() {
        console.log('[PipelineClient] Initializing DOM elements...');
        
        // Input elements
        this.searchInput = document.querySelector(SELECTORS.SEARCH_INPUT);
        this.searchBtn = document.querySelector(SELECTORS.SEARCH_BTN);
        this.refreshBtn = document.querySelector(SELECTORS.REFRESH_BTN);

        // Content containers
        this.loadingState = document.querySelector(SELECTORS.LOADING_STATE);
        this.cardsContainer = document.querySelector(SELECTORS.CARDS_CONTAINER);
        this.emptyState = document.querySelector(SELECTORS.EMPTY_STATE);
        this.detailsView = document.querySelector(SELECTORS.DETAILS_VIEW);

        // Pagination elements
        this.paginationContainer = document.querySelector(SELECTORS.PAGINATION_CONTAINER);
        this.paginationInfo = document.querySelector(SELECTORS.PAGINATION_INFO);
        this.paginationPages = document.querySelector(SELECTORS.PAGINATION_PAGES);
        this.firstPageBtn = document.querySelector(SELECTORS.FIRST_PAGE_BTN);
        this.prevPageBtn = document.querySelector(SELECTORS.PREV_PAGE_BTN);
        this.nextPageBtn = document.querySelector(SELECTORS.NEXT_PAGE_BTN);
        this.lastPageBtn = document.querySelector(SELECTORS.LAST_PAGE_BTN);

        // Details view elements
        this.backBtn = document.querySelector(SELECTORS.BACK_BTN);
        this.detailsTitle = document.querySelector(SELECTORS.DETAILS_TITLE);
        this.pipelineInfo = document.querySelector(SELECTORS.PIPELINE_INFO);
        this.scriptsContainer = document.querySelector(SELECTORS.SCRIPTS_CONTAINER);
        this.runTypesContainer = document.querySelector(SELECTORS.RUN_TYPES_CONTAINER);
        this.runPipelineBtn = document.querySelector(SELECTORS.RUN_PIPELINE_BTN);
        this.viewLogsBtn = document.querySelector(SELECTORS.VIEW_LOGS_BTN);
        this.refreshScriptsBtn = document.querySelector(SELECTORS.REFRESH_SCRIPTS_BTN);
        
        console.log('[PipelineClient] DOM elements initialized');
    }

    /**
     * Attaches event listeners to interactive elements
     */
    attachEventListeners() {
        console.log('[PipelineClient] Attaching event listeners...');
        
        // Search functionality with debouncing
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this.handleSearch());
        }

        if (this.searchInput) {
            const debouncedSearch = Utils.debounce(() => this.handleSearch(), CONFIG.SEARCH_DEBOUNCE_DELAY);
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
            this.searchInput.addEventListener('input', debouncedSearch);
        }

        // Refresh functionality
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => this.handleRefresh());
        }

        // Navigation functionality
        if (this.backBtn) {
            this.backBtn.addEventListener('click', () => this.showListView());
        }

        // Pagination functionality
        this.attachPaginationListeners();

        // Listen for messages from extension
        window.addEventListener('message', (event) => this.handleExtensionMessage(event));
        
        console.log('[PipelineClient] Event listeners attached');
    }

    /**
     * Attaches pagination event listeners
     */
    attachPaginationListeners() {
        if (this.firstPageBtn) {
            this.firstPageBtn.addEventListener('click', () => this.sendCommand(COMMANDS.FIRST_PAGE));
        }

        if (this.prevPageBtn) {
            this.prevPageBtn.addEventListener('click', () => this.sendCommand(COMMANDS.PREVIOUS_PAGE));
        }

        if (this.nextPageBtn) {
            this.nextPageBtn.addEventListener('click', () => this.sendCommand(COMMANDS.NEXT_PAGE));
        }

        if (this.lastPageBtn) {
            this.lastPageBtn.addEventListener('click', () => this.sendCommand(COMMANDS.LAST_PAGE));
        }
    }

    // ================================
    // EVENT HANDLERS
    // ================================

    /**
     * Handles search input and button clicks
     */
    handleSearch() {
        const filter = this.searchInput ? this.searchInput.value.trim() : '';
        console.log('[PipelineClient] Searching with filter:', filter);
        
        this.sendCommand(COMMANDS.FILTER, { filter });
    }

    /**
     * Handles refresh button clicks
     */
    handleRefresh() {
        console.log('[PipelineClient] Refreshing data...');
        this.sendCommand(COMMANDS.REFRESH);
    }

    /**
     * Handles messages from the VS Code extension
     * @param {MessageEvent} event - Message event from extension
     */
    handleExtensionMessage(event) {
        const message = event.data;
        console.log('[PipelineClient] Received message:', message.command);

        try {
            switch (message.command) {
                case COMMANDS.UPDATE_CARDS:
                    this.updateCardsDisplay(message.cards, message.loading, message.pagination);
                    break;
                    
                case COMMANDS.SHOW_DETAILS:
                    this.showPipelineDetails(message.pipeline, message.scripts, message.runTypes);
                    break;
                    
                case COMMANDS.SHOW_LOGIN_PROGRESS:
                    this.showLoginProgress(message.message);
                    break;
                    
                case COMMANDS.SHOW_LOGIN_ERROR:
                    this.showLoginError(message.message);
                    break;
                    
                default:
                    console.warn('[PipelineClient] Unknown command:', message.command);
            }
        } catch (error) {
            console.error('[PipelineClient] Error handling message:', error);
        }
    }

    // ================================
    // DISPLAY UPDATE METHODS
    // ================================

    /**
     * Updates the cards display with new data
     * @param {Array} cards - Array of pipeline cards
     * @param {boolean} loading - Loading state
     * @param {Object} pagination - Pagination information
     */
    updateCardsDisplay(cards, loading, pagination) {
        console.log('[PipelineClient] Updating cards display:', { 
            cardsCount: cards?.length || 0, 
            loading, 
            pagination 
        });

        // Show/hide loading state
        Utils.toggleElement(this.loadingState, loading);

        if (loading) {
            Utils.toggleElement(this.cardsContainer, false);
            Utils.toggleElement(this.emptyState, false);
            Utils.toggleElement(this.paginationContainer, false);
            return;
        }

        // Show/hide empty state
        if (!cards || cards.length === 0) {
            Utils.toggleElement(this.cardsContainer, false);
            Utils.toggleElement(this.emptyState, true);
            Utils.toggleElement(this.paginationContainer, false);
            return;
        }

        // Show cards
        Utils.toggleElement(this.cardsContainer, true);
        Utils.toggleElement(this.emptyState, false);

        // Render pipeline cards
        this.renderPipelineCards(cards);

        // Update pagination
        this.updatePagination(pagination);
    }

    /**
     * Renders pipeline cards HTML
     * @param {Array} cards - Array of pipeline cards
     */
    renderPipelineCards(cards) {
        if (!this.cardsContainer) {
            console.warn('[PipelineClient] Cards container not found');
            return;
        }

        const cardsHtml = cards.map(pipeline => this.createCardHTML(pipeline)).join('');
        this.cardsContainer.innerHTML = cardsHtml;

        // Attach click listeners to cards
        this.attachCardListeners();
    }

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

    /**
     * Attaches click listeners to pipeline cards
     */
    attachCardListeners() {
        const actionButtons = this.cardsContainer.querySelectorAll('.pipeline-action-btn');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const pipelineId = button.getAttribute('data-pipeline-id');
                if (pipelineId) {
                    this.sendCommand(COMMANDS.VIEW_DETAILS, { cardId: pipelineId });
                }
            });
        });
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
            Utils.toggleElement(this.paginationContainer, false);
            return;
        }

        Utils.toggleElement(this.paginationContainer, true);

        // Update pagination info
        if (this.paginationInfo) {
            const { currentPage, totalPages, totalItems } = pagination;
            this.paginationInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalItems} items)`;
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
        if (!this.paginationPages) {
            return;
        }

        const { currentPage, totalPages } = pagination;
        const maxVisiblePages = CONFIG.MAX_VISIBLE_PAGES;
        let startPage, endPage;

        if (totalPages <= maxVisiblePages) {
            startPage = 1;
            endPage = totalPages;
        } else {
            const half = Math.floor(maxVisiblePages / 2);
            startPage = Math.max(1, currentPage - half);
            endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
        }

        let pagesHtml = '';

        // Add first page and ellipsis if needed
        if (startPage > 1) {
            pagesHtml += `<button class="${CSS_CLASSES.PAGE_NUMBER}" data-page="1">1</button>`;
            if (startPage > 2) {
                pagesHtml += `<span class="${CSS_CLASSES.PAGE_ELLIPSIS}">...</span>`;
            }
        }

        // Add visible page numbers
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === currentPage ? ` ${CSS_CLASSES.ACTIVE}` : '';
            pagesHtml += `<button class="${CSS_CLASSES.PAGE_NUMBER}${activeClass}" data-page="${i}">${i}</button>`;
        }

        // Add ellipsis and last page if needed
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pagesHtml += `<span class="${CSS_CLASSES.PAGE_ELLIPSIS}">...</span>`;
            }
            pagesHtml += `<button class="${CSS_CLASSES.PAGE_NUMBER}" data-page="${totalPages}">${totalPages}</button>`;
        }

        this.paginationPages.innerHTML = pagesHtml;

        // Add click listeners to page numbers
        this.paginationPages.querySelectorAll(`.${CSS_CLASSES.PAGE_NUMBER}`).forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.getAttribute('data-page'));
                if (page && page !== currentPage) {
                    this.sendCommand(COMMANDS.GO_TO_PAGE, { page });
                }
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

    /**
     * Shows list view (hides details)
     */
    showListView() {
        console.log('[PipelineClient] Showing list view');
        
        this.currentView = 'list';
        this.currentPipelineId = null;
        this.currentPipelineData = null;

        // Hide details view
        Utils.toggleElement(this.detailsView, false);

        // Show list view elements
        this.showListViewElements();

        // Request refresh of cards list
        this.sendCommand(COMMANDS.LOAD_CARDS);
    }

    /**
     * Hides list view elements
     */
    hideListView() {
        Utils.toggleElement(this.cardsContainer, false);
        Utils.toggleElement(this.emptyState, false);
        Utils.toggleElement(this.paginationContainer, false);
        Utils.toggleElement(this.loadingState, false);

        // Hide header elements
        const header = document.querySelector('.header');
        const searchContainer = document.querySelector('.search-container');
        const headerButtons = document.querySelector('.header-buttons');
        
        Utils.toggleElement(header, false);
        Utils.toggleElement(searchContainer, false);
        Utils.toggleElement(headerButtons, false);
    }

    /**
     * Shows list view elements
     */
    showListViewElements() {
        // Show appropriate elements based on current state
        if (this.cardsContainer && this.cardsContainer.innerHTML.trim()) {
            Utils.toggleElement(this.cardsContainer, true);
        }

        // Show header elements
        const header = document.querySelector('.header');
        const searchContainer = document.querySelector('.search-container');
        const headerButtons = document.querySelector('.header-buttons');
        
        Utils.toggleElement(header, true);
        Utils.toggleElement(searchContainer, true);
        Utils.toggleElement(headerButtons, true);
    }

    /**
     * Updates details view content
     * @param {Object} pipeline - Pipeline data
     * @param {Object} scripts - Scripts data
     * @param {Array} runTypes - Run types data
     */
    updateDetailsContent(pipeline, scripts, runTypes) {
        // Update title
        if (this.detailsTitle) {
            this.detailsTitle.textContent = Utils.toTitleCase(pipeline.alias);
        }

        // Update sections
        this.updatePipelineInfo(pipeline);
        this.updateScriptsContent(scripts);
        this.updateRunTypesContent(runTypes);
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

    /**
     * Sets up action buttons for details view
     * @param {Object} pipeline - Pipeline data
     */
    setupActionButtons(pipeline) {
        // Run Pipeline button
        if (this.runPipelineBtn) {
            this.runPipelineBtn.onclick = () => {
                if (this.selectedRunType) {
                    this.sendCommand(COMMANDS.RUN_PIPELINE, {
                        cardId: this.currentPipelineId,
                        runType: this.selectedRunType
                    });
                } else {
                    console.warn('[PipelineClient] No run type selected');
                }
            };
        }

        // View Logs button
        if (this.viewLogsBtn) {
            this.viewLogsBtn.onclick = () => {
                this.sendCommand(COMMANDS.VIEW_LOGS, { cardId: this.currentPipelineId });
            };
        }

        // Refresh Scripts button
        if (this.refreshScriptsBtn) {
            this.refreshScriptsBtn.onclick = () => {
                this.sendCommand(COMMANDS.REFRESH_SCRIPTS, { cardId: this.currentPipelineId });
            };
        }
    }

    // ================================
    // SCRIPT ACTION METHODS
    // ================================

    /**
     * Opens a script file
     * @param {number} fileIndex - Index of file in scripts array
     */
    openScript(fileIndex) {
        if (this.currentPipelineData && this.currentPipelineData.scripts && this.currentPipelineData.scripts.files) {
            const file = this.currentPipelineData.scripts.files[fileIndex];
            if (file) {
                this.sendCommand(COMMANDS.OPEN_SCRIPT, {
                    cardId: this.currentPipelineId,
                    fileIndex: fileIndex,
                    fileName: file.fileName
                });
            }
        }
    }

    /**
     * Copies a script to clipboard
     * @param {string} fileName - Name of file to copy
     */
    copyScript(fileName) {
        this.sendCommand(COMMANDS.COPY_SCRIPT, {
            cardId: this.currentPipelineId,
            fileName: fileName
        });
    }

    /**
     * Selects a run type
     * @param {string} index - Index of selected run type
     */
    selectRunType(index) {
        if (this.currentPipelineData && this.currentPipelineData.runTypes) {
            const runType = this.currentPipelineData.runTypes[parseInt(index)];
            if (runType) {
                this.selectedRunType = runType;
                console.log('[PipelineClient] Selected run type:', runType);
            }
        }
    }

    /**
     * Generates scripts for current pipeline
     */
    generateScripts() {
        if (this.currentPipelineId) {
            this.sendCommand(COMMANDS.GENERATE_SCRIPTS, { cardId: this.currentPipelineId });
        }
    }

    // ================================
    // AUTHENTICATION METHODS
    // ================================

    /**
     * Shows login progress state
     * @param {string} message - Progress message
     */
    showLoginProgress(message) {
        console.log('[PipelineClient] Login progress:', message);
        
        const loginButton = document.querySelector(SELECTORS.LOGIN_BUTTON);
        if (loginButton) {
            loginButton.textContent = UI_TEXT.BUTTONS.AUTHENTICATING;
            loginButton.disabled = true;
        }

        const loginMessage = document.querySelector(SELECTORS.LOGIN_MESSAGE);
        if (loginMessage) {
            loginMessage.textContent = message || UI_TEXT.LOADING.AUTHENTICATING;
        }
    }

    /**
     * Shows login error state
     * @param {string} message - Error message
     */
    showLoginError(message) {
        console.error('[PipelineClient] Login error:', message);
        
        const loginButton = document.querySelector(SELECTORS.LOGIN_BUTTON);
        if (loginButton) {
            loginButton.textContent = UI_TEXT.BUTTONS.LOGIN;
            loginButton.disabled = false;
        }

        const loginMessage = document.querySelector(SELECTORS.LOGIN_MESSAGE);
        if (loginMessage) {
            loginMessage.textContent = message || UI_TEXT.MESSAGES.AUTHENTICATION_ERROR;
            loginMessage.style.color = 'var(--vscode-errorForeground)';
        }

        // Reset error state after timeout
        setTimeout(() => {
            if (loginMessage) {
                loginMessage.textContent = '';
                loginMessage.style.color = '';
            }
        }, CONFIG.TIMEOUTS.ERROR_DISPLAY);
    }

    // ================================
    // COMMUNICATION METHODS
    // ================================

    /**
     * Sends a command to the VS Code extension
     * @param {string} command - Command to send
     * @param {Object} data - Additional data
     */
    sendCommand(command, data = {}) {
        console.log('[PipelineClient] Sending command:', command, data);
        this.vscode.postMessage({ command, ...data });
    }

    /**
     * Requests initial data load
     */
    requestInitialLoad() {
        console.log('[PipelineClient] Requesting initial load...');
        this.sendCommand(COMMANDS.LOAD_CARDS);
    }
}

// ================================
// INITIALIZATION
// ================================

/**
 * Initialize the Pipeline Cards Client when DOM is ready
 */
function initializePipelineClient() {
    console.log('[PipelineClient] Initializing...');
    try {
        new PipelineCardsClient();
    } catch (error) {
        console.error('[PipelineClient] Initialization failed:', error);
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePipelineClient);
} else {
    initializePipelineClient();
}