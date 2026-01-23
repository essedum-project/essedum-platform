/**
 * Pipeline Agent Client-Side JavaScript
 * 
 * Handles client-side logic for Pipeline Agent webview including:
 * - Card rendering and pagination
 * - Detail view navigation
 * - Communication with VS Code extension
 * - User interactions
 */

class PipelineAgentClient {
    constructor() {
        console.log('[Pipeline Agent Client] Initializing...');
        
        // Reference to constants
        this.constants = window.PipelineAgentConstants;
        
        // Check if VS Code API already acquired and stored globally
        if (window.vscodeApi) {
            this.vscode = window.vscodeApi;
        } else {
            this.vscode = acquireVsCodeApi();
            // Store globally for reuse
            window.vscodeApi = this.vscode;
        }
        
        this.currentAgentData = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.setupMessageHandler();
        this.requestInitialLoad();
        
        // Make available globally
        window.pipelineAgentClient = this;
        
        console.log('[Pipeline Agent Client] Initialized successfully');
    }

    initializeElements() {
        // Main container elements
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.searchContainer = document.querySelector('.search-container');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.loadingState = document.getElementById('loadingState');
        this.cardsContainer = document.getElementById('cardsContainer');
        this.emptyState = document.getElementById('emptyState');
        
        // Pagination elements
        this.paginationContainer = document.getElementById('paginationContainer');
        this.paginationInfo = document.getElementById('paginationInfo');
        this.paginationPages = document.getElementById('paginationPages');
        this.firstPageBtn = document.getElementById('firstPageBtn');
        this.prevPageBtn = document.getElementById('prevPageBtn');
        this.nextPageBtn = document.getElementById('nextPageBtn');
        this.lastPageBtn = document.getElementById('lastPageBtn');
        
        // Detail view elements
        this.detailsView = document.getElementById('detailsView');
        this.backBtn = document.getElementById('backBtn');
        this.detailsTitle = document.getElementById('detailsTitle');
        this.pipelineInfo = document.getElementById('pipelineInfo');
        this.openCopilotBtn = document.getElementById('openCopilotBtn');
        this.uploadAdkBtn = document.getElementById('uploadAdkBtn');
        this.viewAdkBtn = document.getElementById('viewAdkBtn');
        this.downloadAdkBtn = document.getElementById('downloadAdkBtn');
        this.refreshJsonBtn = document.getElementById('refreshJsonBtn');
        this.copyJsonBtn = document.getElementById('copyJsonBtn');
        this.actionStatus = document.getElementById('actionStatus');
    }

    attachEventListeners() {
        // Search
        this.searchBtn?.addEventListener('click', () => this.handleSearch());
        this.searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {this.handleSearch();}
        });
        
        // Refresh
        this.refreshBtn?.addEventListener('click', () => this.handleRefresh());
        
        // Pagination
        this.firstPageBtn?.addEventListener('click', () => this.goToFirstPage());
        this.prevPageBtn?.addEventListener('click', () => this.goToPreviousPage());
        this.nextPageBtn?.addEventListener('click', () => this.goToNextPage());
        this.lastPageBtn?.addEventListener('click', () => this.goToLastPage());
        
        // Detail view - Back button
        this.backBtn?.addEventListener('click', () => this.hideDetailView());
        
        // Detail view - Action buttons
        this.openCopilotBtn?.addEventListener('click', () => this.handleOpenCopilot());
        this.uploadAdkBtn?.addEventListener('click', () => this.handleUploadAdk());
        this.viewAdkBtn?.addEventListener('click', () => this.handleViewAdk());
        this.downloadAdkBtn?.addEventListener('click', () => this.handleDownloadAdk());
        this.refreshJsonBtn?.addEventListener('click', () => this.handleRefreshJson());
        this.copyJsonBtn?.addEventListener('click', () => this.handleCopyJson());
    }

    setupMessageHandler() {
        window.addEventListener('message', event => {
            const message = event.data;
            console.log('[Pipeline Agent Client] Received message:', message);
            
            const CMD = this.constants.COMMANDS_FROM_EXTENSION;
            const STATUS = this.constants.STATUS_TYPES;
            switch (message.command) {
                case CMD.UPDATE_CARDS:
                    this.renderCards(message);
                    break;
                case CMD.SHOW_DETAILS:
                    this.showDetailView(message.data);
                    break;
                case CMD.ACTION_COMPLETE:
                    this.showActionStatus(message.message, STATUS.SUCCESS);
                    break;
                case CMD.ACTION_ERROR:
                    this.showActionStatus(message.message, STATUS.ERROR);
                    break;
                case CMD.ENABLE_UPLOAD:
                    this.enableUploadButton();
                    break;
                case CMD.ADK_FILES_STATUS:
                    this.handleAdkFilesStatus(message);
                    break;
            }
        });
    }

    requestInitialLoad() {
        this.showLoading();
        this.vscode.postMessage({ command: this.constants.COMMANDS_TO_EXTENSION.LOAD_CARDS });
    }

    handleSearch() {
        const filter = this.searchInput?.value || '';
        this.vscode.postMessage({ command: this.constants.COMMANDS_TO_EXTENSION.FILTER, filter });
    }

    handleRefresh() {
        this.vscode.postMessage({ command: this.constants.COMMANDS_TO_EXTENSION.REFRESH });
    }

    goToPage(page) {
        console.log('[Pipeline Agent Client] Going to page:', page);
        this.vscode.postMessage({ command: this.constants.COMMANDS_TO_EXTENSION.GO_TO_PAGE, page });
    }

    goToFirstPage() {
        console.log('[Pipeline Agent Client] Going to first page');
        this.vscode.postMessage({ command: this.constants.COMMANDS_TO_EXTENSION.FIRST_PAGE });
    }

    goToPreviousPage() {
        this.vscode.postMessage({ command: this.constants.COMMANDS_TO_EXTENSION.PREVIOUS_PAGE });
    }

    goToNextPage() {
        this.vscode.postMessage({ command: this.constants.COMMANDS_TO_EXTENSION.NEXT_PAGE });
    }

    goToLastPage() {
        this.vscode.postMessage({ command: this.constants.COMMANDS_TO_EXTENSION.LAST_PAGE });
    }

    renderCards(message) {
        console.log('[Pipeline Agent Client] Rendering cards:', message);
        
        // If still loading, keep showing loading spinner
        if (message && message.loading) {
            console.log('[Pipeline Agent Client] Still loading, showing spinner');
            this.showLoading();
            return;
        }
        
        // Not loading anymore, hide loading spinner
        this.hideLoading();
        
        // Check for empty cards after confirming we're not loading
        if (!message || !message.cards || message.cards.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        
        // Render cards using exact Pipeline structure
        this.cardsContainer.innerHTML = message.cards.map(card => this.createCardElement(card)).join('');

        // Update pagination with the pagination object from message
        if (message.pagination) {
            this.updatePagination(message.pagination);
        }
    }

    createCardElement(card) {
        // Get the pipeline ID from various possible fields
        const pipelineId = card.pipelineId || card.id || card._id || card.name || this.constants.DEFAULTS.UNKNOWN_ID;
        const cardTitle = card.alias || pipelineId;
        const cardType = (card.type || card.interfacetype || this.constants.DEFAULTS.PIPELINE_TYPE).toUpperCase();
        
        // Format date - exactly like Pipeline cards
        const createdDate = card.createdDate || card.created_date || new Date().toISOString();
        const dateObj = new Date(createdDate);
        const formattedDate = dateObj.toLocaleDateString(undefined, this.constants.DATE_FORMAT_OPTIONS);
        
        // Get initial for avatar
        const createdBy = card.created_by || this.constants.DEFAULTS.CREATED_BY;
        const initial = createdBy.charAt(0).toUpperCase();
        
        console.log('[Pipeline Agent Client] Creating card for:', pipelineId, card);
        
        const titleCased = this.toTitleCase(cardTitle);
        
        // Use exact HTML structure from Pipeline cards
        return `
            <div class="pipeline-card" tabindex="0" role="article" 
                 aria-label="Pipeline Agent: ${this.escapeHtml(titleCased)}" 
                 data-pipeline-id="${pipelineId}">
                <div class="pipeline-card-header">                   
                    <span class="pipeline-title">${this.escapeHtml(titleCased)}</span>
                    <span class="pipeline-type-badge">${cardType}</span>
                </div>
                
                <div class="pipeline-card-body">                                              
                    <span class="metadata-value">${this.escapeHtml(formattedDate)}</span>                       
                </div>
                
                <div class="pipeline-card-actions">
                    <button class="pipeline-action-btn primary" 
                            data-pipeline-id="${pipelineId}" 
                            onclick="window.pipelineAgentClient.viewDetails('${this.escapeHtml(pipelineId)}')"
                            aria-label="View details for ${this.escapeHtml(titleCased)}">
                        <span class="action-icon">👁</span>
                        <span class="action-text">View Details</span>
                    </button>
                    <div class="pipeline-avatar-section">
                        <div class="pipeline-avatar" title="${this.escapeHtml(createdBy)}">
                            ${this.escapeHtml(initial)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    toTitleCase(str) {
        if (!str) {return '';}
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    viewDetails(pipelineId) {
        console.log('[Pipeline Agent Client] View details for:', pipelineId);
        this.vscode.postMessage({ command: this.constants.COMMANDS_TO_EXTENSION.VIEW_DETAILS, pipelineId });
    }

    showDetailView(data) {
        console.log('[Pipeline Agent Client] Showing detail view:', data);
        this.currentAgentData = data;
        
        const DISP = this.constants.DISPLAY;
        // Hide cards, pagination, and search
        if (this.cardsContainer) {this.cardsContainer.style.display = DISP.NONE;}
        if (this.paginationContainer) {this.paginationContainer.style.display = DISP.NONE;}
        if (this.emptyState) {this.emptyState.style.display = DISP.NONE;}
        if (this.searchContainer) {this.searchContainer.style.display = DISP.NONE;}
        
        // Show detail view
        if (this.detailsView) {
            this.detailsView.style.display = DISP.BLOCK;
            console.log('[Pipeline Agent Client] Detail view displayed');
        }
        
        // Update detail content
        if (this.detailsTitle) {
            this.detailsTitle.textContent = data.name || this.constants.TEXT.DETAILS_TITLE;
        }
        
        if (this.pipelineInfo) {
            const DEF = this.constants.DEFAULTS;
            this.pipelineInfo.innerHTML = `
                <p><strong>Pipeline ID:</strong> ${this.escapeHtml(data.pipelineId || DEF.PIPELINE_ID)}</p>
                <p><strong>Type:</strong> ${this.escapeHtml(data.type || DEF.PIPELINE_ID)}</p>
                <p><strong>Organization:</strong> ${this.escapeHtml(data.organization || DEF.PIPELINE_ID)}</p>
                <p><strong>Status:</strong> <span class="status-badge">${this.escapeHtml(data.status || DEF.STATUS)}</span></p>
                ${data.description ? `<p><strong>Description:</strong> ${this.escapeHtml(data.description)}</p>` : ''}
            `;
        }
    }

    hideDetailView() {
        console.log('[Pipeline Agent Client] Hiding detail view');
        
        const DISP = this.constants.DISPLAY;
        // Hide detail view
        if (this.detailsView) {this.detailsView.style.display = DISP.NONE;}
        
        // Show cards, pagination, and search
        if (this.cardsContainer) {this.cardsContainer.style.display = DISP.GRID;}
        if (this.paginationContainer) {this.paginationContainer.style.display = DISP.FLEX;}
        if (this.searchContainer) {this.searchContainer.style.display = DISP.FLEX;}
        
        this.currentAgentData = null;
    }

    handleOpenCopilot() {
        if (this.currentAgentData) {
            console.log('[Pipeline Agent Client] Opening Copilot for:', this.currentAgentData.pipelineId);
            this.vscode.postMessage({
                command: this.constants.COMMANDS_TO_EXTENSION.OPEN_COPILOT,
                pipelineId: this.currentAgentData.pipelineId
            });
        }
    }

    handleUploadAdk() {
        if (this.currentAgentData) {
            console.log('[Pipeline Agent Client] Uploading ADK for:', this.currentAgentData.pipelineId);
            this.vscode.postMessage({
                command: this.constants.COMMANDS_TO_EXTENSION.UPLOAD_ADK,
                pipelineId: this.currentAgentData.pipelineId
            });
        }
    }

    handleViewAdk() {
        if (this.currentAgentData) {
            console.log('[Pipeline Agent Client] Viewing ADK for:', this.currentAgentData.pipelineId);
            this.vscode.postMessage({
                command: this.constants.COMMANDS_TO_EXTENSION.VIEW_ADK,
                pipelineId: this.currentAgentData.pipelineId
            });
        }
    }

    handleDownloadAdk() {
        if (this.currentAgentData) {
            console.log('[Pipeline Agent Client] Downloading ADK for:', this.currentAgentData.pipelineId);
            this.vscode.postMessage({
                command: this.constants.COMMANDS_TO_EXTENSION.DOWNLOAD_ADK,
                pipelineId: this.currentAgentData.pipelineId
            });
        }
    }

    handleAdkFilesStatus(message) {
        console.log('[Pipeline Agent Client] ADK files status:', message);
        const DISP = this.constants.DISPLAY;
        if (this.viewAdkBtn) {
            this.viewAdkBtn.style.display = message.hasFiles ? DISP.INLINE_BLOCK : DISP.NONE;
        }
        if (this.downloadAdkBtn) {
            this.downloadAdkBtn.style.display = message.hasFiles ? DISP.INLINE_BLOCK : DISP.NONE;
        }
        if (message.hasFiles) {
            console.log(`[Pipeline Agent Client] ADK buttons shown (${message.fileCount} files available)`);
        } else {
            console.log('[Pipeline Agent Client] ADK buttons hidden (no files available)');
        }
    }

    handleRefreshJson() {
        if (this.currentAgentData) {
            console.log('[Pipeline Agent Client] Refreshing JSON for:', this.currentAgentData.pipelineId);
            this.vscode.postMessage({
                command: this.constants.COMMANDS_TO_EXTENSION.REFRESH_JSON,
                pipelineId: this.currentAgentData.pipelineId
            });
        }
    }

    handleCopyJson() {
        if (this.currentAgentData) {
            console.log('[Pipeline Agent Client] Copying JSON for:', this.currentAgentData.pipelineId);
            this.vscode.postMessage({
                command: this.constants.COMMANDS_TO_EXTENSION.COPY_JSON,
                pipelineId: this.currentAgentData.pipelineId
            });
        }
    }

    showActionStatus(message, type = this.constants.STATUS_TYPES.SUCCESS) {
        if (!this.actionStatus) {return;}
        
        const DISP = this.constants.DISPLAY;
        const STATUS = this.constants.STATUS_TYPES;
        this.actionStatus.textContent = message;
        this.actionStatus.style.display = DISP.BLOCK;
        
        if (type === STATUS.SUCCESS) {
            this.actionStatus.style.backgroundColor = 'var(--vscode-testing-iconPassed)';
            this.actionStatus.style.color = 'var(--vscode-editor-foreground)';
        } else if (type === STATUS.ERROR) {
            this.actionStatus.style.backgroundColor = 'var(--vscode-testing-iconFailed)';
            this.actionStatus.style.color = 'var(--vscode-editor-foreground)';
        }
        
        setTimeout(() => {
            this.actionStatus.style.display = DISP.NONE;
        }, this.constants.TIMING.STATUS_MESSAGE_DURATION);
    }

    enableUploadButton() {
        if (this.uploadAdkBtn) {
            this.uploadAdkBtn.disabled = false;
            this.uploadAdkBtn.style.opacity = '1';
        }
    }

    updatePagination(pagination) {
        const { currentPage, totalPages, totalCount } = pagination;
        const DISP = this.constants.DISPLAY;
        
        if (totalPages <= 1) {
            this.paginationContainer.style.display = DISP.NONE;
            return;
        }
        
        this.paginationContainer.style.display = DISP.FLEX;
        
        // Update info
        this.paginationInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalCount} items)`;
        
        // Update button states
        this.firstPageBtn.disabled = currentPage === 1;
        this.prevPageBtn.disabled = currentPage === 1;
        this.nextPageBtn.disabled = currentPage === totalPages;
        this.lastPageBtn.disabled = currentPage === totalPages;
        
        // Render page numbers
        this.renderPageNumbers(currentPage, totalPages);
    }

    renderPageNumbers(currentPage, totalPages) {
        if (!this.paginationPages) { return; }
        
        const maxVisible = this.constants.PAGINATION.MAX_VISIBLE_PAGES;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        
        // Build HTML string for page numbers
        let pagesHtml = '';
        
        // Add first page and ellipsis if needed
        if (startPage > 1) {
            pagesHtml += `<button class="btn btn-pagination page-number" data-page="1">1</button>`;
            if (startPage > 2) {
                pagesHtml += `<span class="page-ellipsis">...</span>`;
            }
        }
        
        // Add visible page numbers
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === currentPage ? 'active' : '';
            pagesHtml += `<button class="btn btn-pagination page-number ${isActive}" data-page="${i}">${i}</button>`;
        }
        
        // Add ellipsis and last page if needed
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pagesHtml += `<span class="page-ellipsis">...</span>`;
            }
            pagesHtml += `<button class="btn btn-pagination page-number" data-page="${totalPages}">${totalPages}</button>`;
        }
        
        // Set the HTML
        this.paginationPages.innerHTML = pagesHtml;
        
        // Add click listeners to all page number buttons
        this.paginationPages.querySelectorAll('.page-number').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Use currentTarget to always get the button element, not its children
                const button = e.currentTarget;
                const page = parseInt(button.dataset.page);
                if (!isNaN(page)) {
                    console.log('[Pipeline Agent Client] Navigating to page:', page);
                    this.goToPage(page);
                }
            });
        });
    }

    showLoading() {
        const DISP = this.constants.DISPLAY;
        if (this.loadingState) {
            this.loadingState.style.display = DISP.FLEX;
        }
        if (this.cardsContainer) {
            this.cardsContainer.style.display = DISP.NONE;
        }
        if (this.emptyState) {
            this.emptyState.style.display = DISP.NONE;
        }
        if (this.paginationContainer) {
            this.paginationContainer.style.display = DISP.NONE;
        }
    }

    hideLoading() {
        const DISP = this.constants.DISPLAY;
        if (this.loadingState) {
            this.loadingState.style.display = DISP.NONE;
        }
    }

    showEmptyState() {
        const DISP = this.constants.DISPLAY;
        this.cardsContainer.style.display = DISP.NONE;
        this.paginationContainer.style.display = DISP.NONE;
        this.emptyState.style.display = DISP.BLOCK;
    }

    hideEmptyState() {
        const DISP = this.constants.DISPLAY;
        this.emptyState.style.display = DISP.NONE;
        this.cardsContainer.style.display = DISP.GRID;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PipelineAgentClient();
    });
} else {
    new PipelineAgentClient();
}
