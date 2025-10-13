// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import { PipelineCardsProvider } from './app/pipeline/pipeline-cards';
import { KeycloakAuthService, KeycloakConfig } from './auth/keycloak-auth';
import { EssedumFileSystemProvider } from './providers/essedum-file-provider';
import { initializeSSLBypass, setupAxiosDefaults, BASE_URL } from './constants/api-config';
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

	// Register command to open job logs viewer for a specific pipeline
	context.subscriptions.push(
		vscode.commands.registerCommand('essedum.openJobLogs', async (pipelineName?: string) => {
			try {
				const accessToken = await authService.getAccessToken();

				if (!pipelineName) {
					// If no pipeline name provided, ask user to enter one
					pipelineName = await vscode.window.showInputBox({
						prompt: 'Enter pipeline name to view job logs',
						placeHolder: 'e.g., LEORGNGS24627'
					});

					if (!pipelineName) {
						return; // User cancelled
					}
				}

			} catch (error: any) {
				console.error('Error opening job logs:', error);
				vscode.window.showErrorMessage(`Failed to open job logs: ${error.message}`);
			}
		})
	);

	// Register command to open internal job logs viewer
	context.subscriptions.push(
		vscode.commands.registerCommand('essedum.openInternalJobLogs', async (internalJobName?: string) => {
			try {
				const accessToken = await authService.getAccessToken();

				if (!internalJobName) {
					// If no internal job name provided, ask user to enter one
					internalJobName = await vscode.window.showInputBox({
						prompt: 'Enter internal job name to view logs',
						placeHolder: 'e.g., internal_job_name'
					});

					if (!internalJobName) {
						return; // User cancelled
					}
				}


			} catch (error: any) {
				console.error('Error opening internal job logs:', error);
				vscode.window.showErrorMessage(`Failed to open internal job logs: ${error.message}`);
			}
		})
	);

	// Register command to open job logs in output channel/terminal
	context.subscriptions.push(
		vscode.commands.registerCommand('essedum.showJobLogsInTerminal', async (jobId?: string) => {
			try {
				const accessToken = await authService.getAccessToken();

				if (!jobId) {
					jobId = await vscode.window.showInputBox({
						prompt: 'Enter job ID to view logs in terminal',
						placeHolder: 'e.g., job_12345'
					});

					if (!jobId) {
						return; // User cancelled
					}
				}

				// Create or get existing output channel
				const outputChannel = vscode.window.createOutputChannel(`Essedum Job Logs - ${jobId}`);
				outputChannel.show(true);

				// Clear previous content
				outputChannel.clear();
				outputChannel.appendLine(`=== Job Logs for ${jobId} ===`);
				outputChannel.appendLine(`Timestamp: ${new Date().toISOString()}`);
				outputChannel.appendLine('');

				// Fetch and display logs
				const axios = require('axios');
				const https = require('https');

				const httpsAgent = new https.Agent({
					rejectUnauthorized: false
				});

				const headers = {
					'Accept': 'application/json, text/plain, */*',
					'Authorization': `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
					'Project': '2',
					'ProjectName': 'leo1311',
					'X-Requested-With': 'Leap',
				};

				try {
					// Try fetching as Spark job first
					const sparkResponse = await axios.get(`/api/aip/service/v1/jobs/spark/${jobId}/logs?line=0&size=1000&background=false`, {
						baseURL: BASE_URL,
						headers,
						httpsAgent,
						timeout: 15000
					});

					if (sparkResponse.data) {
						const jobData = typeof sparkResponse.data === 'string' ? JSON.parse(sparkResponse.data) : sparkResponse.data;

						outputChannel.appendLine('=== Spark Job Logs ===');
						if (jobData.log) {
							outputChannel.appendLine(jobData.log);
						} else {
							// Display all job data
							Object.entries(jobData).forEach(([key, value]) => {
								outputChannel.appendLine(`${key}: ${value}`);
							});
						}
					}
				} catch (sparkError: any) {
					// Try as internal job
					try {
						const internalResponse = await axios.get(`/api/aip/service/v1/jobs/internal/${jobId}/logs?line=0&size=1000`, {
							baseURL: BASE_URL,
							headers,
							httpsAgent,
							timeout: 15000
						});

						if (internalResponse.data) {
							const jobData = typeof internalResponse.data === 'string' ? JSON.parse(internalResponse.data) : internalResponse.data;

							outputChannel.appendLine('=== Internal Job Logs ===');
							if (jobData.log) {
								outputChannel.appendLine(jobData.log);
							} else {
								// Display all job data
								Object.entries(jobData).forEach(([key, value]) => {
									outputChannel.appendLine(`${key}: ${value}`);
								});
							}
						}
					} catch (internalError: any) {
						outputChannel.appendLine(`Error fetching logs: ${sparkError.message}`);
						outputChannel.appendLine(`Also tried internal job, error: ${internalError.message}`);
					}
				}

				vscode.window.showInformationMessage(`Job logs for ${jobId} opened in output channel`);

			} catch (error: any) {
				console.error('Error showing job logs in terminal:', error);
				vscode.window.showErrorMessage(`Failed to show job logs in terminal: ${error.message}`);
			}
		})
	);

	// Register debug command to test upload endpoints
	context.subscriptions.push(
		vscode.commands.registerCommand('essedum.debugUpload', async () => {
			try {
				const accessToken = await authService.getAccessToken();

				// Test a simple API endpoint first
				const axios = require('axios');
				const https = require('https');

				const httpsAgent = new https.Agent({
					rejectUnauthorized: false
				});

				const headers = {
					'Accept': 'application/json, text/plain, */*',
					'Authorization': `Bearer ${accessToken}`,
					'Project': '2',
					'ProjectName': 'leo1311',
					'X-Requested-With': 'Leap',
					'User-Agent': 'axios/1.11.0'
				};

				// Test endpoints
				const testEndpoints = [
					'/api/aip/file/write/LEORGNGS24627/leo1311',
					'/api/aip/file/upload/LEORGNGS24627/leo1311',
					'/file/pipeline/native/upload/LEORGNGS24627/leo1311',
					'/api/aip/service/v1/files/upload/LEORGNGS24627/leo1311'
				];

				const results: string[] = [];

				for (const endpoint of testEndpoints) {
					try {
						// Create a simple FormData for testing
						const FormData = require('form-data');
						const formData = new FormData();
						formData.append('scriptFile', 'print("test")', 'test.py');
						formData.append('filetype', 'Python3');
						formData.append('pipelineName', 'LEORGNGS24627');
						formData.append('organization', 'leo1311');

						const response = await axios.post(endpoint, formData, {
							baseURL: BASE_URL,
							headers: { ...headers, ...formData.getHeaders() },
							httpsAgent: httpsAgent,
							timeout: 10000
						});

						results.push(`✅ ${endpoint}: ${response.status} - ${response.statusText}`);
					} catch (error: any) {
						const status = error.response?.status || 'NO_RESPONSE';
						const statusText = error.response?.statusText || error.message;
						results.push(`❌ ${endpoint}: ${status} - ${statusText}`);
					}
				}

				// Show results
				const message = `Upload Endpoint Test Results:\n\n${results.join('\n')}`;
				vscode.window.showInformationMessage(message, { modal: true });

			} catch (error: any) {
				vscode.window.showErrorMessage(`Debug test failed: ${error.message}`);
			}
		})
	);

	// Register command to test session data extraction
	context.subscriptions.push(
		vscode.commands.registerCommand('essedum.testSessionData', async () => {
			try {
				console.log('Testing session data extraction...');
				
				// Get session data
				const sessionData = await authService.getSessionData();
				const userInfo = await authService.getUserInfo();
				const accessToken = await authService.getAccessToken();

				let message = `🔍 Session Data Test Results:\n\n`;
				message += `🔐 Token Available: ${accessToken ? '✅ Yes' : '❌ No'}\n`;
				message += `🔐 Token Length: ${accessToken ? accessToken.length : 0}\n\n`;
				
				if (sessionData) {
					message += `📊 Extracted Session Data:\n`;
					message += `• Project ID: ${sessionData.projectId}\n`;
					message += `• Project Name: ${sessionData.projectName}\n`;
					message += `• Role ID: ${sessionData.roleId}\n`;
					message += `• Role Name: ${sessionData.roleName}\n`;
					message += `• Organization: ${sessionData.organization || 'N/A'}\n`;
					message += `• User ID: ${sessionData.userId || 'N/A'}\n`;
					message += `• Email: ${sessionData.email || 'N/A'}\n`;
					message += `• Username: ${sessionData.username || 'N/A'}\n\n`;
				} else {
					message += `❌ No session data available\n\n`;
				}

				if (userInfo) {
					message += `👤 Raw User Info (first 10 properties):\n`;
					const entries = Object.entries(userInfo).slice(0, 10);
					entries.forEach(([key, value]) => {
						const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
						const truncatedValue = valueStr.length > 50 ? valueStr.substring(0, 50) + '...' : valueStr;
						message += `• ${key}: ${truncatedValue}\n`;
					});
					
					if (Object.keys(userInfo).length > 10) {
						message += `• ... and ${Object.keys(userInfo).length - 10} more properties\n`;
					}
				} else {
					message += `❌ No user info available`;
				}

				// Show in a modal dialog
				vscode.window.showInformationMessage(message, { modal: true }, 'Copy to Clipboard').then(selection => {
					if (selection === 'Copy to Clipboard') {
						vscode.env.clipboard.writeText(message);
						vscode.window.showInformationMessage('Session data copied to clipboard!');
					}
				});

				// Also log to console for debugging
				console.log('Session Data:', sessionData);
				console.log('User Info:', userInfo);

			} catch (error: any) {
				console.error('Session data test failed:', error);
				vscode.window.showErrorMessage(`Session data test failed: ${error.message}`);
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