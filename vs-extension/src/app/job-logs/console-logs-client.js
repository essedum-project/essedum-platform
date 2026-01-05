// Console Logs - Client-side JavaScript
const vscode = acquireVsCodeApi();

function refreshLogs() {
    document.getElementById('loading').style.display = 'block';
    vscode.postMessage({
        command: 'refreshConsoleLogs'
    });
}

function downloadLogs() {
    vscode.postMessage({
        command: 'downloadLogs'
    });
}

// Auto-scroll to bottom of logs
window.addEventListener('load', function() {
    const logsContainer = document.querySelector('.logs-container');
    if (logsContainer) {
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }
});
