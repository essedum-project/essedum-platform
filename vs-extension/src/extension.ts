// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import { PipelineCardsProvider } from './app/pipeline/pipeline-cards';
import { KeycloakAuthService, KeycloakConfig } from './auth/keycloak-auth';
import { EssedumFileSystemProvider } from './providers/essedum-file-provider';
import { initializeSSLBypass, setupAxiosDefaults } from './constants/api-config';
import { PipelineService } from './services/pipeline.service';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('Essedum AI Platform extension is now active!');

	// CRITICAL: Initialize SSL bypass before any HTTPS requests
	initializeSSLBypass();
	setupAxiosDefaults();

	// Create Keycloak configuration (updated to match working login URL)
	const keycloakConfig: KeycloakConfig = {
		issuerUri: 'https://aiplatform.az.ad.idemo-ppc.com:8443/realms/ESSEDUM',
		clientId: 'essedum-45',
		scope: 'email'  // Match the working scope from your URL
	};

	// Create improved authentication service with automatic OAuth flow
	const authService = new KeycloakAuthService(keycloakConfig, context);

	// Function to update authentication context for UI visibility
	const updateAuthenticationContext = async () => {
		try {
			const isAuthenticated = await authService.isTokenValid();
			await vscode.commands.executeCommand('setContext', 'essedum.isAuthenticated', isAuthenticated);
			console.log(`Authentication context updated: ${isAuthenticated}`);
		} catch (error) {
			console.error('Failed to update authentication context:', error);
			await vscode.commands.executeCommand('setContext', 'essedum.isAuthenticated', false);
		}
	};

	// Create Essedum file system provider
	const essedumFileProvider = new EssedumFileSystemProvider('');

	// Register the Essedum file system provider
	context.subscriptions.push(
		vscode.workspace.registerFileSystemProvider('essedum', essedumFileProvider, {
			isCaseSensitive: true,
			isReadonly: false  // Allow editing - files saved only during pipeline execution
		})
	);

	// Create pipeline cards provider (this will handle all pipeline logic)
	let pipelineCardsProvider: PipelineCardsProvider;
	let pipelineService: PipelineService;

	// Initialize pipeline provider with authentication
	const initializePipelineProvider = async () => {
		try {
			const accessToken = await authService.getAccessToken();
			// Create pipeline service first
			pipelineService = new PipelineService(accessToken, 'leo1311'); // Pass token and organization
			// Create pipeline cards provider with service dependency
			pipelineCardsProvider = new PipelineCardsProvider(context, accessToken, authService, essedumFileProvider, pipelineService);
			essedumFileProvider.updateToken(accessToken);
			// Update authentication context after successful initialization
			await updateAuthenticationContext();
			return pipelineCardsProvider;
		} catch (error) {
			console.error('Failed to initialize pipeline provider:', error);
			// Create provider with empty token, it will be updated when user logs in
			// Create empty pipeline service for fallback
			pipelineService = new PipelineService('', 'leo1311');
			pipelineCardsProvider = new PipelineCardsProvider(context, '', authService, essedumFileProvider, pipelineService);
			// Set authentication context to false since initialization failed
			await vscode.commands.executeCommand('setContext', 'essedum.isAuthenticated', false);
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

		// Initial authentication context check
		updateAuthenticationContext();
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
		vscode.commands.registerCommand('essedum.logout', async () => {
			try {
				// Clear stored tokens without browser redirect (same as refresh button logout)
				await authService.clearStoredTokens();

				// Clear pipeline provider token
				if (pipelineCardsProvider) {
					pipelineCardsProvider.updateToken('');
					essedumFileProvider.updateToken('');
				}

				// Update authentication context to hide logout button
				await vscode.commands.executeCommand('setContext', 'essedum.isAuthenticated', false);

				if (pipelineCardsProvider) {
					pipelineCardsProvider.loadInitialContent();
				}
				vscode.window.showInformationMessage('Successfully logged out from Essedum AI Platform.');
			} catch (error: any) {
				vscode.window.showErrorMessage(`Logout failed: ${error.message}`);
			}
		})
	);

	// Register command to run pipeline (can be called from file provider)
	context.subscriptions.push(
		vscode.commands.registerCommand('essedum.runPipeline', async (pipelineName?: string) => {
			if (pipelineCardsProvider) {
				// If pipeline name provided, try to find and run it
				if (pipelineName) {
					// This would need to be implemented in the pipeline provider
					vscode.window.showInformationMessage(
						`To run pipeline "${pipelineName}", use the Run Pipeline button in the script viewer.`,
						'Open Pipelines'
					).then(selection => {
						if (selection === 'Open Pipelines') {
							vscode.commands.executeCommand('workbench.view.extension.essedum-explorer');
						}
					});
				} else {
					// Open the pipelines view
					vscode.commands.executeCommand('workbench.view.extension.essedum-explorer');
				}
			} else {
				vscode.window.showErrorMessage('Please login first to run pipelines.');
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

					progress.report({ increment: 20, message: 'Starting automatic OAuth authentication...' });

					// Force fresh authentication using the improved OAuth flow
					const newTokens = await authService.forceAuthentication();

					progress.report({ increment: 80, message: 'Authentication successful, updating services...' });

					return newTokens;
				});

				const accessToken = authResult.access_token;
				console.log('Fresh authentication successful, token length:', accessToken ? accessToken.length : 0);

				// Update the pipeline provider with new token
				if (pipelineCardsProvider) {
					pipelineCardsProvider.updateToken(accessToken);
					essedumFileProvider.updateToken(accessToken);
					// Update pipeline service token as well
					if (pipelineService) {
						pipelineService.updateToken(accessToken);
					}
				} else {
					// Re-initialize the provider if it doesn't exist
					// Create pipeline service first
					pipelineService = new PipelineService(accessToken, 'leo1311');
					pipelineCardsProvider = new PipelineCardsProvider(context, accessToken, authService, essedumFileProvider, pipelineService);
					essedumFileProvider.updateToken(accessToken);
					context.subscriptions.push(
						vscode.window.registerWebviewViewProvider(
							'essedum-sidebar',
							pipelineCardsProvider
						)
					);
				}

				// Update authentication context to show logout button
				await updateAuthenticationContext();

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
export async function deactivate() {
	console.log('Essedum AI Platform extension is being deactivated');

	// Clean up auth service resources if available
	try {
		// Note: authService is not accessible in this scope, but VS Code will handle cleanup
		// The improved auth service will clean up automatically when the extension context is disposed
		console.log('Extension deactivation completed');
	} catch (error) {
		console.error('Error during extension deactivation:', error);
	}
}