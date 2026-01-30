/**
 * Navigation Screen Client-Side Script
 * Handles user interactions in the navigation webview
 */

(function () {
    const vscode = acquireVsCodeApi();

    // Handle Pipeline card click
    document.getElementById('pipeline-card').addEventListener('click', () => {
        vscode.postMessage({
            command: 'navigate',
            target: 'pipeline'
        });
    });

    // Handle Pipeline Agent card click
    document.getElementById('pipeline-agent-card').addEventListener('click', () => {
        vscode.postMessage({
            command: 'navigate',
            target: 'pipeline-agent'
        });
    });

    // Handle keyboard navigation
    document.querySelectorAll('.nav-card').forEach(card => {
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
})();
