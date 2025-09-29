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
        this.loadingState = document.getElementById('loadingState');
        this.cardsContainer = document.getElementById('cardsContainer');
        this.emptyState = document.getElementById('emptyState');
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

        // Listen for messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'updateCards':
                    this.updateCardsDisplay(message.cards, message.loading);
                    break;
            }
        });
    }

    updateCardsDisplay(cards, loading) {
        // Show/hide loading state
        if (this.loadingState) {
            this.loadingState.style.display = loading ? 'block' : 'none';
        }
        
        if (loading) {
            if (this.cardsContainer) this.cardsContainer.style.display = 'none';
            if (this.emptyState) this.emptyState.style.display = 'none';
            return;
        }

        // Show/hide empty state
        if (!cards || cards.length === 0) {
            if (this.cardsContainer) this.cardsContainer.style.display = 'none';
            if (this.emptyState) this.emptyState.style.display = 'block';
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
    }

    createCardHTML(pipeline) {
        const createdDate = new Date(pipeline.createdDate).toLocaleDateString();
        const createdTime = new Date(pipeline.createdDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const initials = this.getInitials(pipeline.created_by);
        
        return `
            <div class="pipeline-card">
                <div class="card-header">
                    <div class="pipeline-type-badge">${pipeline.type}</div>
                    <div class="created-by-avatar" title="${pipeline.created_by}">${initials}</div>
                </div>
                <div class="card-body">
                    <div class="pipeline-alias" title="${pipeline.alias}">${pipeline.alias}</div>
                    <div class="pipeline-meta">
                        <div class="meta-item">
                            <span class="meta-label">Created:</span>
                            <span class="meta-value">${createdDate}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Time:</span>
                            <span class="meta-value">${createdTime}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">By:</span>
                            <span class="meta-value">${pipeline.created_by}</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary view-details-btn" data-pipeline-id="${pipeline.id}">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }

    getInitials(name) {
        if (!name) return '??';
        return name.split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    }

    requestInitialLoad() {
        // Request initial data load
        this.vscode.postMessage({
            command: 'loadCards'
        });
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
