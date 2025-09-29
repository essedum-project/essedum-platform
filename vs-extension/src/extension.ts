// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import * as https from 'https';
import { PipelineCardsProvider, HttpParams } from './app/pipeline/pipeline-cards';
import { KeycloakAuthService, KeycloakConfig } from './auth/keycloak-auth';
// We'll use vscode.env.openExternal instead of the 'open' package
// to avoid CommonJS/ESM compatibility issues

// This class provides the functionality for the Essedum Sidebar webview
class EssedumSidebarProvider implements vscode.WebviewViewProvider {

	private _view?: vscode.WebviewView;
	private _extensionUri: vscode.Uri;
	private _isAuthenticated: boolean = false;
	private _token: string = '';
	private _currentView: 'login' | 'pipelines' | 'details' = 'login';
	private _selectedPipeline: any = null;
	private _pipelines: any[] = [];
	private _loadingPipelines: boolean = false;
	private _pipelineCardsProvider?: PipelineCardsProvider;
	private _authService: KeycloakAuthService;
	private keycloakConfig: KeycloakConfig = {
		issuerUri: 'https://aiplatform.az.ad.idemo-ppc.com:8443/realms/ESSEDUM',
		clientId: 'essedum-45',
		scope: 'openid email profile'
	};

	constructor(private readonly _context: vscode.ExtensionContext) {
		this._extensionUri = _context.extensionUri;
		this._authService = new KeycloakAuthService(this.keycloakConfig, _context);
	}

	// Check for existing authentication on startup
	private async checkExistingAuth(): Promise<void> {
		try {
			const existingTokens = await this._authService.getStoredTokens();
			if (existingTokens) {
				this._isAuthenticated = true;
				this._token = existingTokens.access_token;
				this._currentView = 'pipelines';
				console.log('Found existing valid authentication');
				
				// Load pipelines automatically
				setTimeout(() => this.loadPipelines(), 100);
			} else {
				this._isAuthenticated = false;
				this._token = '';
				this._currentView = 'login';
			}
		} catch (error) {
			console.error('Error checking existing auth:', error);
			this._isAuthenticated = false;
			this._token = '';
			this._currentView = 'login';
		}
	}

	// Helper method to load HTML template files
	private loadHtmlTemplate(templateName: string, replacements?: { [key: string]: string }): string {
		try {
			const templatePath = path.join(this._context.extensionPath, 'src', 'app', 'templates', `${templateName}.html`);
			let html = fs.readFileSync(templatePath, 'utf8');
			
			// Replace placeholders if provided
			if (replacements) {
				Object.entries(replacements).forEach(([key, value]) => {
					html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
				});
			}
			
			return html;
		} catch (error) {
			console.error(`Failed to load template ${templateName}:`, error);
			return `<html><body><h2>Error loading template: ${templateName}</h2></body></html>`;
		}
	}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Enable JavaScript in the webview
			enableScripts: true,
			localResourceRoots: [this._extensionUri]
		};

		// Check for existing authentication first
		this.checkExistingAuth().then(() => {
			webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
		});

		// Handle messages from the webview
		webviewView.webview.onDidReceiveMessage(
			async (message) => {
				switch (message.command) {
					case 'login':
						await this.authenticate();
						break;
					case 'logout':
						await this.logout();
						break;
					case 'loadPipelines':
						await this.loadPipelines();
						break;
					case 'viewDetails':
						await this.viewPipelineDetails(message.pipelineId);
						break;
					case 'backToPipelines':
						this._currentView = 'pipelines';
						this.updateView();
						break;
					case 'refreshPipelines':
						await this.loadPipelines();
						break;
				}
			},
			undefined,
			this._context.subscriptions
		);
	}

	// Authenticate using proper OAuth 2.0 flow with Keycloak
	private async authenticate() {
		try {
			// Show progress indicator
			const authProgress = vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "Authenticating with Essedum AI Platform...",
				cancellable: true
			}, async (progress, token) => {
				progress.report({ message: "Starting authentication..." });
				
				// Handle cancellation
				token.onCancellationRequested(() => {
					console.log('Authentication cancelled by user');
				});

				// Perform OAuth authentication
				const tokens = await this._authService.authenticate();
				
				progress.report({ message: "Authentication successful!" });
				return tokens;
			});

			const tokens = await authProgress;
			
			this._isAuthenticated = true;
			this._token = tokens.access_token;
			
			console.log('Authentication successful, switching to pipelines view');
			vscode.window.showInformationMessage('Successfully authenticated with Essedum AI Platform');
			
			// Switch to pipelines view and load data
			this._currentView = 'pipelines';
			console.log('Current view set to:', this._currentView);
			// First update the view to show loading state, then load pipelines
			this.updateView();
			await this.loadPipelines();
			
		} catch (error: any) {
			console.error('Authentication failed:', error);
			this._isAuthenticated = false;
			this._token = '';
			
			vscode.window.showErrorMessage(`Authentication failed: ${error.message}`);
			
			if (this._view) {
				this._view.webview.postMessage({ command: 'authFailed', error: error.message });
			}
		}
	}

	// Logout user and clear authentication
	private async logout(): Promise<void> {
		try {
			await this._authService.logout();
			this._isAuthenticated = false;
			this._token = '';
			this._currentView = 'login';
			this.updateView();
			vscode.window.showInformationMessage('Successfully logged out from Essedum AI Platform');
		} catch (error: any) {
			console.error('Logout error:', error);
			// Even if logout fails, clear local state
			this._isAuthenticated = false;
			this._token = '';
			this._currentView = 'login';
			this.updateView();
			vscode.window.showWarningMessage('Logged out locally. Please clear your browser session manually if needed.');
		}
	}

	// Load pipelines from API using PipelineCardsProvider
	private async loadPipelines(): Promise<void> {
		console.log('Loading pipelines...');
		this._loadingPipelines = true;
		this.updateView(); // Show loading state
		
		try {
			// Get fresh access token (will refresh if needed)
			const accessToken = await this._authService.getAccessToken();
			this._token = accessToken;

			// Create PipelineCardsProvider if it doesn't exist
			if (!this._pipelineCardsProvider) {
				this._pipelineCardsProvider = new PipelineCardsProvider(this._context, this._token);
			} else {
				// Update the token
				this._pipelineCardsProvider.updateToken(this._token);
			}

			// Build parameters for the API call
			const params: HttpParams = {
				page: '1',
				size: '20',
				project: 'leo1311',
				isCached: 'true',
				adapter_instance: 'internal',
				interfacetype: 'pipeline'
			};

			// Use the existing getPipelinesCards method
			const response = await (this._pipelineCardsProvider as any).getPipelinesCards(params);
			
			// Process the response data
			const data: any[] = [];
			if (response && response.length) {
				response.forEach((element: any) => {
					data.push({
						type: element.type || 'Unknown',
						alias: element.alias || 'No Alias',
						createdDate: element.createdDate || element.created_date || new Date().toISOString(),
						created_by: element.created_by || element.createdBy || 'Unknown',
						id: element.id || element._id || Math.random().toString(36),
						...element
					});
				});
			}

			this._pipelines = data;
			console.log('Loaded', this._pipelines.length, 'pipelines');
			this._loadingPipelines = false;
			this.updateView(); // Show loaded pipelines
		} catch (error: any) {
			console.error('Failed to load pipelines:', error);
			this._loadingPipelines = false;
			this.updateView();
			vscode.window.showErrorMessage(`Failed to load pipelines: ${error.message}`);
		}
	}

	// View pipeline details using existing PipelineCardsProvider functionality
	private async viewPipelineDetails(pipelineId: string): Promise<void> {
		let pipeline;
		
		// Try to find by ID first, then by index if ID is not available
		if (isNaN(Number(pipelineId))) {
			pipeline = this._pipelines.find(p => p.id === pipelineId);
		} else {
			const index = Number(pipelineId);
			pipeline = this._pipelines[index];
		}
		
		if (pipeline) {
			// Use the existing PipelineCardsProvider to view script details
			if (this._pipelineCardsProvider) {
				try {
					// Get fresh access token
					const accessToken = await this._authService.getAccessToken();
					this._pipelineCardsProvider.updateToken(accessToken);

					// Set the pipeline card in the provider's cards array so it can find it
					(this._pipelineCardsProvider as any).cards = this._pipelines;
					
					// Call the existing viewScriptDetails method
					await (this._pipelineCardsProvider as any).viewScriptDetails(pipeline.id);
				} catch (error: any) {
					console.error('Error viewing pipeline details:', error);
					
					// If it's an authentication error, try to re-authenticate
					if (error.message.includes('401') || error.message.includes('Unauthorized')) {
						vscode.window.showErrorMessage('Session expired. Please log in again.');
						await this.logout();
					} else {
						vscode.window.showErrorMessage(`Failed to view pipeline details: ${error.message}`);
					}
				}
			} else {
				vscode.window.showErrorMessage('Pipeline provider not available');
			}
		} else {
			vscode.window.showErrorMessage('Pipeline not found');
		}
	}

	// Update the webview content based on current view
	private updateView(): void {
		if (this._view) {
			console.log('Updating view to:', this._currentView);
			this._view.webview.html = this._getHtmlForWebview(this._view.webview);
		} else {
			console.log('No view available to update');
		}
	}



	private _getHtmlForWebview(webview: vscode.Webview) {
		console.log('Generating HTML for view:', this._currentView);
		switch (this._currentView) {
			case 'login':
				return this.getLoginHtml();
			case 'pipelines':
			case 'details': // Fall through to pipelines since we use external script viewer
				return this.getPipelinesHtml();
			default:
				console.log('Unknown view, defaulting to login');
				return this.getLoginHtml();
		}
	}

	private getLoginHtml(): string {
		return this.loadHtmlTemplate('login');
	}

	private getPipelinesHtml(): string {
		// Handle loading state
		if (this._loadingPipelines) {
			return this.loadHtmlTemplate('loading-pipelines');
		}

		// Handle empty state
		if (!this._pipelines || this._pipelines.length === 0) {
			return this.loadHtmlTemplate('empty-pipelines');
		}

		// Generate pipeline cards HTML
		const pipelinesContent = this._pipelines.map((pipeline, index) => `
			<div class="pipeline-card">
				<div class="pipeline-header">
					<h3>${pipeline.alias || pipeline.name || 'Unnamed Pipeline'}</h3>
					<span class="pipeline-type">${pipeline.type || 'Unknown'}</span>
				</div>
				<div class="pipeline-info">
					<p><strong>Created:</strong> ${pipeline.createdDate ? new Date(pipeline.createdDate).toLocaleDateString() : 'Unknown'}</p>
					<p><strong>Created by:</strong> ${pipeline.created_by || 'Unknown'}</p>
				</div>
				<button class="view-details-btn" data-pipeline-id="${pipeline.id || index}">View Details</button>
			</div>
		`).join('');

		// Load template with pipeline content
		return this.loadHtmlTemplate('pipelines', {
			'PIPELINES_CONTENT': pipelinesContent
		});
	}

	private getDetailsHtml(): string {
		// Since we're using the existing script viewer, we don't need this anymore
		// Just return to pipelines view
		return this.getPipelinesHtml();
	}
}

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('Essedum AI Platform extension is now active!');

	// Register the unified Essedum sidebar provider
	const essedumSidebarProvider = new EssedumSidebarProvider(context);
	
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			'essedum-sidebar',
			essedumSidebarProvider
		)
	);

	// Register commands
	context.subscriptions.push(
		vscode.commands.registerCommand('essedum.openSidebar', () => {
			vscode.commands.executeCommand('workbench.view.extension.essedum-explorer');
		})
	);
	
	context.subscriptions.push(
		vscode.commands.registerCommand('essedum.login', () => {
			// This command will open the sidebar and initiate login
			vscode.commands.executeCommand('workbench.view.extension.essedum-explorer');
			// The actual login is handled by the sidebar
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
