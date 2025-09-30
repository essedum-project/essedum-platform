import * as vscode from 'vscode';
import { JobLogsViewer } from './job-logs-viewer';

export class JobLogsPanelProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'essedum-job-logs';
    private _view?: vscode.WebviewView;
    private _jobLogsViewer?: JobLogsViewer;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _context: vscode.ExtensionContext
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        // Set initial content
        webviewView.webview.html = this._getInitialHtml();

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            message => {
                if (this._jobLogsViewer) {
                    // Forward messages to the job logs viewer
                    this._jobLogsViewer.handlePanelMessage(message, webviewView);
                }
            },
            undefined,
            this._context.subscriptions
        );
    }

    public showJobLogs(token: string, pipelineName?: string, internalJob?: string): void {
        // Set the context to make the view visible
        vscode.commands.executeCommand('setContext', 'essedum.jobLogsVisible', true);
        
        // Focus the panel area and show our view
        vscode.commands.executeCommand('workbench.action.togglePanel');
        vscode.commands.executeCommand('workbench.view.extension.essedum-panel.essedum-job-logs');

        // Create or update the job logs viewer
        this._jobLogsViewer = new JobLogsViewer(this._context, token, pipelineName, internalJob);
        
        if (this._view) {
            // Update the webview content with job logs
            this._jobLogsViewer.setWebviewContent(this._view);
        }
    }

    public hideJobLogs(): void {
        vscode.commands.executeCommand('setContext', 'essedum.jobLogsVisible', false);
        if (this._view) {
            this._view.webview.html = this._getInitialHtml();
        }
        this._jobLogsViewer = undefined;
    }

    private _getInitialHtml(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Logs</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            font-weight: var(--vscode-font-weight);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
        }
        .placeholder {
            opacity: 0.7;
        }
        .icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
        }
    </style>
</head>
<body>
    <div class="placeholder">
        <div class="icon">📋</div>
        <p>Job logs will appear here when you open a job.</p>
        <p>Use the "Open Job Logs Viewer" command or click the logs icon in the pipeline view.</p>
    </div>
</body>
</html>`;
    }
}