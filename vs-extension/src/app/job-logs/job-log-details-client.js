// Job Log Details - Client-side JavaScript
const vscode = acquireVsCodeApi();

function refreshLogs() {
    vscode.postMessage({ command: 'refreshLogs' });
}
