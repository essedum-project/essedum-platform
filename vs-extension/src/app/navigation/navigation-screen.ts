/**
 * Navigation Screen Provider for Essedum AI Platform
 * 
 * This component provides a webview-based navigation interface that allows users
 * to choose between different views after authentication:
 * - Pipeline Screen (existing flow)
 * - Pipeline Agent Screen (new flow)
 * 
 * @fileoverview Navigation screen after login
 * @author Essedum AI Platform Team
 * @version 1.0.21
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Message types for communication between webview and extension
 */
interface NavigationMessage {
    command: 'navigate';
    target: 'pipeline' | 'pipeline-agent';
}

/**
 * Navigation Screen Provider Class
 */
export class NavigationScreenProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'essedum-navigation';
    
    private _view?: vscode.WebviewView;
    private _disposables: vscode.Disposable[] = [];
    private _context?: vscode.ExtensionContext;

    constructor(private readonly _extensionUri: vscode.Uri, context?: vscode.ExtensionContext) {
        this._context = context;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;
        
        // Save active view state when navigation view is opened/resolved
        // This ensures the view is restored correctly after extension reload
        if (this._context) {
            const { STORAGE_KEYS } = require('../../constants/extension-constants');
            this._context.globalState.update(STORAGE_KEYS.ACTIVE_VIEW, 'navigation');
        }

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            (message: NavigationMessage) => {
                if (message.command === 'navigate') {
                    this.handleNavigation(message.target);
                }
            },
            null,
            this._disposables
        );
    }

    /**
     * Handle navigation to different views
     */
    private handleNavigation(target: 'pipeline' | 'pipeline-agent'): void {
        // Set context to show the appropriate view
        if (target === 'pipeline') {
            vscode.commands.executeCommand('setContext', 'essedum.showPipeline', true);
            vscode.commands.executeCommand('setContext', 'essedum.showPipelineAgent', false);
            vscode.commands.executeCommand('setContext', 'essedum.showNavigation', false);
        } else if (target === 'pipeline-agent') {
            vscode.commands.executeCommand('setContext', 'essedum.showPipeline', false);
            vscode.commands.executeCommand('setContext', 'essedum.showPipelineAgent', true);
            vscode.commands.executeCommand('setContext', 'essedum.showNavigation', false);
        }
    }

    /**
     * Generate HTML for the navigation webview
     */
    private _getHtmlForWebview(webview: vscode.Webview): string {
        // Check if we're in development or production
        const isDevelopment = fs.existsSync(path.join(this._extensionUri.fsPath, 'src'));
        const baseFolder = isDevelopment ? 'src' : 'dist';
        
        // Get paths to resources
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, baseFolder, 'app', 'navigation', 'navigation-screen-client.js')
        );
        const cssUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, baseFolder, 'app', 'navigation', 'navigation-screen.css')
        );

        const nonce = getNonce();

        // Read HTML template
        const htmlPath = path.join(this._extensionUri.fsPath, baseFolder, 'app', 'navigation', 'navigation-screen.html');
        let html = fs.readFileSync(htmlPath, 'utf8');

        // Replace placeholders
        html = html
            .replace(/{{nonce}}/g, nonce)
            .replace(/{{scriptUri}}/g, scriptUri.toString())
            .replace(/{{cssUri}}/g, cssUri.toString())
            .replace(/{{cspSource}}/g, webview.cspSource);

        return html;
    }

    public dispose() {
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
