// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import { PipelineCardsProvider } from './app/pipeline/pipeline-cards';
import { KeycloakAuthService, KeycloakConfig } from './auth/keycloak-auth';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('Essedum AI Platform extension is now active!');

	// Create Keycloak configuration
	const keycloakConfig: KeycloakConfig = {
		issuerUri: 'https://aiplatform.az.ad.idemo-ppc.com:8443/realms/ESSEDUM',
		clientId: 'essedum-45',
		scope: 'openid email profile'
	};

	// Create authentication service
	const authService = new KeycloakAuthService(keycloakConfig, context);
	
	// Create pipeline cards provider (this will handle all pipeline logic)
	let pipelineCardsProvider: PipelineCardsProvider;
	
	// Initialize pipeline provider with authentication
	const initializePipelineProvider = async () => {
		try {
			const accessToken = await authService.getAccessToken();
			pipelineCardsProvider = new PipelineCardsProvider(context, accessToken, authService);
			return pipelineCardsProvider;
		} catch (error) {
			console.error('Failed to initialize pipeline provider:', error);
			// Create provider with empty token, it will be updated when user logs in
			pipelineCardsProvider = new PipelineCardsProvider(context, '', authService);
			return pipelineCardsProvider;
		}
	};

	// Register the pipeline cards provider as the main webview
	initializePipelineProvider().then(provider => {
		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider(
				'essedum-sidebar',
				provider
			)
		);
	});

	// Register commands
	context.subscriptions.push(
		vscode.commands.registerCommand('essedum.openSidebar', () => {
			vscode.commands.executeCommand('workbench.view.extension.essedum-explorer');
		})
	);

	// Add authentication status command for troubleshooting
	context.subscriptions.push(
		vscode.commands.registerCommand('essedum.checkAuth', async () => {
			try {
				const authStatus = await authService.getAuthenticationStatus();
				const isValid = await authService.isTokenValid();
				
				let message = `Authentication Status:\n`;
				message += `• Authenticated: ${authStatus.isAuthenticated ? '✅' : '❌'}\n`;
				message += `• Token Valid: ${isValid ? '✅' : '❌'}\n`;
				
				if (authStatus.tokenExpiry) {
					message += `• Token Expires: ${authStatus.tokenExpiry.toLocaleString()}\n`;
				}
				
				if (authStatus.needsRefresh) {
					message += `• Needs Refresh: ⚠️ Yes\n`;
				}
				
				vscode.window.showInformationMessage(message, 'OK', 'Login').then(selection => {
					if (selection === 'Login') {
						vscode.commands.executeCommand('essedum.login');
					}
				});
				
			} catch (error: any) {
				vscode.window.showErrorMessage(`Failed to check authentication status: ${error.message}`);
			}
		})
	);
	
	context.subscriptions.push(
		vscode.commands.registerCommand('essedum.login', async () => {
			try {
				console.log('Starting Keycloak authentication...');
				
				// Always force fresh authentication to ensure valid tokens
				console.log('Clearing any existing tokens and forcing fresh authentication...');
				
				// Show progress during authentication
				const authResult = await vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: 'Authenticating with Keycloak',
					cancellable: true
				}, async (progress, token) => {
					progress.report({ increment: 0, message: 'Clearing existing tokens...' });
					
					// Check for cancellation
					if (token.isCancellationRequested) {
						throw new Error('Authentication cancelled by user');
					}
					
					progress.report({ increment: 20, message: 'Starting fresh authentication...' });
					
					// Force fresh authentication (this will clear tokens and re-authenticate)
					const newTokens = await authService.forceAuthentication();
					
					progress.report({ increment: 80, message: 'Authentication successful, updating services...' });
					
					return newTokens;
				});
				
				const accessToken = authResult.access_token;
				console.log('Fresh authentication successful, token length:', accessToken ? accessToken.length : 0);
				
				// Update the pipeline provider with new token
				if (pipelineCardsProvider) {
					pipelineCardsProvider.updateToken(accessToken);
				} else {
					// Re-initialize the provider if it doesn't exist
					pipelineCardsProvider = new PipelineCardsProvider(context, accessToken, authService);
					context.subscriptions.push(
						vscode.window.registerWebviewViewProvider(
							'essedum-sidebar',
							pipelineCardsProvider
						)
					);
				}
				
				// Open the sidebar to show the updated view
				await vscode.commands.executeCommand('workbench.view.extension.essedum-explorer');
				
				console.log('Login flow completed successfully');
				vscode.window.showInformationMessage(
					`Successfully authenticated with Keycloak! Welcome to Essedum AI Platform.`,
					'View Pipelines'
				).then(selection => {
					if (selection === 'View Pipelines') {
						vscode.commands.executeCommand('workbench.view.extension.essedum-explorer');
					}
				});
				
			} catch (error: any) {
				console.error('Authentication failed:', error);
				
				// Provide user-friendly error messages
				let userMessage = 'Authentication failed';
				if (error.message.includes('cancelled')) {
					userMessage = 'Authentication was cancelled';
				} else if (error.message.includes('certificate')) {
					userMessage = 'SSL certificate error. Please check with your administrator.';
				} else if (error.message.includes('connection')) {
					userMessage = 'Cannot connect to Keycloak server. Please check your network connection.';
				} else if (error.message.includes('expired')) {
					userMessage = 'Authentication session expired. Please try again.';
				} else {
					userMessage = `Authentication failed: ${error.message}`;
				}
				
				vscode.window.showErrorMessage(userMessage, 'Retry', 'Help').then(selection => {
					if (selection === 'Retry') {
						vscode.commands.executeCommand('essedum.login');
					} else if (selection === 'Help') {
						vscode.env.openExternal(vscode.Uri.parse('https://docs.keycloak.org/'));
					}
				});
				
				throw error; // Re-throw so the pipeline provider can handle it
			}
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}