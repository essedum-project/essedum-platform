// Pipeline Cards JavaScript logic
// This file contains the client-side JavaScript for pipeline cards functionality

class PipelineCardsClient {
    constructor() {
        this.vscode = acquireVsCodeApi();
        this.initializeElements();
        this.attachEventListeners();
        this.requestInitialLoad();
    }

    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
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

        // Logout functionality
        this.logoutBtn?.addEventListener('click', () => {
            this.vscode.postMessage({
                command: 'logout'
            });
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
            if (this.cardsContainer) this.cardsContainer.style.display = 'none';
            if (this.emptyState) this.emptyState.style.display = 'none';
            if (this.paginationContainer) this.paginationContainer.style.display = 'none';
            return;
        }

        // Show/hide empty state
        if (!cards || cards.length === 0) {
            if (this.cardsContainer) this.cardsContainer.style.display = 'none';
            if (this.emptyState) this.emptyState.style.display = 'block';
            if (this.paginationContainer) this.paginationContainer.style.display = 'none';
            return;
        }

        // Show cards
        if (this.cardsContainer) this.cardsContainer.style.display = 'block';
        if (this.emptyState) this.emptyState.style.display = 'none';
        
        // Render pipeline cards
        if (this.cardsContainer) {
            this.cardsContainer.innerHTML = cards.map(pipeline => this.createCardHTML(pipeline)).join('');
            
            // Add event listeners to view details buttons
            document.querySelectorAll('.view-details-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const pipelineId = e.target.dataset.pipelineId;
                    this.vscode.postMessage({
                        command: 'viewDetails',
                        cardId: pipelineId
                    });
                });
            });
        }

        // Update pagination
        this.updatePagination(pagination);
    }

    createCardHTML(pipeline) {
        const createdDate = new Date(pipeline.createdDate).toLocaleDateString();
        
        return `
            <div class="pipeline-card">
                <div class="pipeline-header">
                    <h3 class="pipeline-title">${pipeline.alias || pipeline.name || 'Unnamed Pipeline'}</h3>
                    <span class="pipeline-type-badge">${pipeline.type || 'Unknown'}</span>
                </div>
                <div class="pipeline-info">
                    <p class="pipeline-meta"><strong>Created:</strong> ${pipeline.createdDate ? new Date(pipeline.createdDate).toLocaleDateString() : 'Unknown'}</p>
                    <p class="pipeline-meta"><strong>Created by:</strong> ${pipeline.created_by || 'Unknown'}</p>
                </div>
                <button class="view-details-btn" data-pipeline-id="${pipeline.id}">View Details</button>
            </div>
        `;
    }

    updatePagination(pagination) {
        if (!pagination || pagination.totalPages <= 1) {
            if (this.paginationContainer) {
                this.paginationContainer.style.display = 'none';
            }
            return;
        }

        if (this.paginationContainer) {
            this.paginationContainer.style.display = 'flex';
        }

        // Update pagination info
        if (this.paginationInfo) {
            const startItem = (pagination.currentPage - 1) * pagination.pageSize + 1;
            const endItem = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount);
            this.paginationInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages} (${startItem}-${endItem} of ${pagination.totalCount} items)`;
        }

        // Update button states
        if (this.firstPageBtn) {
            this.firstPageBtn.disabled = pagination.currentPage === 1;
        }
        if (this.prevPageBtn) {
            this.prevPageBtn.disabled = pagination.currentPage === 1;
        }
        if (this.nextPageBtn) {
            this.nextPageBtn.disabled = pagination.currentPage === pagination.totalPages;
        }
        if (this.lastPageBtn) {
            this.lastPageBtn.disabled = pagination.currentPage === pagination.totalPages;
        }

        // Update page numbers
        this.updatePageNumbers(pagination);
    }

    updatePageNumbers(pagination) {
        if (!this.paginationPages) return;

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
