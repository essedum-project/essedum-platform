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

    // Handle Wizard Pipelines card click
    document.getElementById('wizard-pipeline-card').addEventListener('click', () => {
        vscode.postMessage({
            command: 'navigate',
            target: 'pipeline-wizard'
        });
    });

    // Handle Pipeline Agent card click
    document.getElementById('pipeline-agent-card').addEventListener('click', () => {
        vscode.postMessage({
            command: 'navigate',
            target: 'pipeline-agent'
        });
    });

    // Handle keyboard navigation for all clickable cards
    document.querySelectorAll('.nav-card').forEach(card => {
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
})();
