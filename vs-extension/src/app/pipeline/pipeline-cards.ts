// Pipeline Cards Component for displaying Essedum pipeline data
import * as vscode from 'vscode';
import axios from 'axios';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';

export interface PipelineCard {
    type: string;
    alias: string;
    createdDate: string;
    created_by: string;
    id?: string;
    [key: string]: any;
}

export interface ScriptFile {
    fileName: string;
    content: string;
    extension: string;
    language: string;
}

export interface PipelineScript {
    pipelineName: string;
    files: ScriptFile[];
    runTypes: any[];
    selectedRunType?: any;
}

export interface HttpParams {
    page: string;
    size: string;
    project: string;
    isCached: string;
    adapter_instance: string;
    interfacetype: string;
    type?: string;
    query?: string;
    tags?: string;
}

export interface JobStatus {
    jobId: string;
    correlationId?: string;
    streamingService?: string;
    jobStatus: string;
    version?: string;
    type?: string;
    runtime?: string;
    finishTime?: string;
    submittedBy?: string;
    submittedOn?: string;
    pipelineName: string;
    organization: string;
    logs?: string;
    hashParams?: string;
}

export interface JobLogResponse {
    log: string;
    jobStatus: string;
    hashparams?: string;
    jobmetadata?: string;
    organization?: string;
}

export class PipelineCardsProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private _extensionUri: vscode.Uri;
    private _token: string = '';

    // Configuration
    private pageNumber: number = 1;
    private pageSize: number = 8;
    private organization: string = 'leo1311';
    private filter: string = '';
    private selectedAdapterType: string[] = [];
    private selectedTag: string[] = [];
    private loading: boolean = false;
    private cards: PipelineCard[] = [];
    private filteredCards: PipelineCard[] = [];
    private users: string[] = [];

    constructor(private readonly _context: vscode.ExtensionContext, token: string) {
        this._extensionUri = _context.extensionUri;
        this._token = token || 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1dGgiOiJVU0VSX1JPTEUiLCJleHAiOjE3NTc3NTMwMTB9.kwMhfD0g6_1lQQj3h4RAXHy6DwD7ZNRh7kpZ5WZVmkf3f7xZfsk-GO5MyF5vNHxUepjcOnILfFf-IfotmUPycg';
    }

    public updateToken(token: string) {
        this._token = token;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'loadCards':
                        await this.getCards();
                        break;
                    case 'viewDetails':
                        await this.viewScriptDetails(message.cardId);
                        break;
                    case 'filter':
                        this.filter = message.filter;
                        await this.getCards();
                        break;
                    case 'refresh':
                        await this.getCards();
                        break;
                    case 'runScript':
                        await this.runPipelineScript(message.cardId, message.runType);
                        break;
                    case 'copyScript':
                        await this.copyScriptToClipboard(message.cardId, message.fileName);
                        break;
                    case 'refreshScript':
                        await this.refreshScripts(message.cardId);
                        break;
                    case 'viewLogs':
                        await this.viewPipelineLogs(message.cardId);
                        break;
                }
            },
            undefined,
            this._context.subscriptions
        );

        // Load cards on initialization
        this.getCards();
    }

    private async getCards(): Promise<void> {
        this.loading = true;
        this.updateWebview();

        const params = this.buildHttpParams();

        try {
            const response = await this.getPipelinesCards(params);
            const data: PipelineCard[] = [];

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
                    this.users.push(element.alias);
                });
            }
            console.log('API Response:', data);
            this.cards = data;
            this.filteredCards = data;
            this.loading = false;

            this.updateQueryParam(
                this.pageNumber,
                this.filter,
                this.selectedAdapterType.toString()
            );

            this.updateWebview();
        } catch (error: any) {
            this.loading = false;
            vscode.window.showErrorMessage(`Failed to load pipeline cards: ${error.message}`);
            this.updateWebview();
        }
    }

    private buildHttpParams(): HttpParams {
        let params: HttpParams = {
            page: this.pageNumber.toString(),
            size: this.pageSize.toString(),
            project: this.organization,
            isCached: 'true',
            adapter_instance: 'internal',
            interfacetype: 'pipeline'
        };

        if (this.selectedAdapterType.length >= 1) {
            params.type = this.selectedAdapterType.toString();
        }

        if (this.filter.length >= 1) {
            params.query = this.filter;
        }

        if (this.selectedTag.length >= 1) {
            params.tags = this.selectedTag.toString();
        }

        return params;
    }

    private async getPipelinesCards(params: HttpParams): Promise<any> {
        try {
            // Convert params to URLSearchParams for axios
            const urlParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    urlParams.append(key, value);
                }
            });

            console.log('Making API request with params:', urlParams.toString());
            console.log('Using token:', this._token ? 'Token present' : 'No token');

            // Create HTTPS agent to bypass SSL certificate issues
            const httpsAgent = new https.Agent({
                rejectUnauthorized: false
            });

            const response = await axios.get('/api/aip/service/v1/pipelines/training/list', {
                baseURL: 'http://localhost:8087',
                params: urlParams,
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Authorization': `Bearer ${this._token}`,
                    'Connection': 'keep-alive',
                    'Content-Type': 'application/json',
                    'Project': '2',
                    'ProjectName': 'leo1311',
                    'X-Requested-With': 'Leap',
                    'charset': 'utf-8',
                    'roleId': '1',
                    'roleName': 'IT Portfolio Manager',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
                },
                httpsAgent: httpsAgent,
                timeout: 30000
            });

            return response.data;
        } catch (error: any) {
            console.error('API call failed:', error);

            // Provide more detailed error information
            let errorMessage = 'Failed to fetch pipeline data';

            if (error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY') {
                errorMessage = 'SSL Certificate error - unable to verify server certificate';
            } else if (error.code === 'ENOTFOUND') {
                errorMessage = 'Network error - unable to reach the server';
            } else if (error.response) {
                errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
            } else if (error.request) {
                errorMessage = 'Network timeout or connection refused';
            } else {
                errorMessage = `Request setup error: ${error.message}`;
            }

            throw new Error(errorMessage);
        }
    }

    private async viewScriptDetails(cardId: string): Promise<void> {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) {
            vscode.window.showErrorMessage('Pipeline not found');
            return;
        }

        // Show loading message
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Loading scripts for ${card.alias}...`,
            cancellable: true
        }, async (progress, token) => {
            try {
                progress.report({ increment: 0, message: 'Connecting to server...' });

                // Fetch scripts for the pipeline
                const scripts = await this.fetchPipelineScripts(card.name);

                progress.report({ increment: 50, message: 'Processing scripts...' });

                if (scripts && scripts.files && scripts.files.length > 0) {
                    progress.report({ increment: 80, message: 'Creating script viewer...' });

                    // Create and show script viewer
                    await this.createScriptViewer(card, scripts);

                    progress.report({ increment: 100, message: 'Complete!' });

                    vscode.window.showInformationMessage(
                        `Loaded ${scripts.files.length} script file(s) for pipeline: ${card.alias}`
                    );
                } else {
                    // Offer to generate scripts if none found
                    const selection = await vscode.window.showInformationMessage(
                        'No scripts found for this pipeline. Would you like to generate scripts?',
                        'Generate Scripts',
                        'View Template Only',
                        'Cancel'
                    );

                    if (selection === 'Generate Scripts') {
                        await this.generatePipelineScripts(card.alias || card.name);
                        // Retry loading scripts after generation
                        setTimeout(() => this.viewScriptDetails(cardId), 2000);
                    } else if (selection === 'View Template Only') {
                        // Show the script viewer with mock data
                        await this.createScriptViewer(card, scripts);
                    }
                }
            } catch (error: any) {
                console.error('Error in viewScriptDetails:', error);
                vscode.window.showErrorMessage(
                    `Failed to load scripts for ${card.alias}: ${error.message}. Check the Output panel for details.`
                );

                // Still show the viewer with mock/template data for debugging
                const mockScripts = {
                    pipelineName: card.alias || card.name,
                    files: [{
                        fileName: 'debug_template.py',
                        content: `# Debug Template for ${card.alias}
# Error occurred: ${error.message}
# 
# This template is shown when script loading fails
# Check the VS Code Output panel for detailed logs

def debug_pipeline():
    print("Pipeline: ${card.alias}")
    print("Error: ${error.message}")
    print("Check server connectivity and authentication")

if __name__ == "__main__":
    debug_pipeline()
`,
                        extension: 'py',
                        language: 'python'
                    }],
                    runTypes: [{ type: 'Local', dsAlias: '', dsName: 'Local Runtime', dsCapability: '' }]
                };

                await this.createScriptViewer(card, mockScripts);
            }
        });
    }

    private async fetchPipelineScripts(pipelineName: string): Promise<PipelineScript> {
        console.log(`Fetching scripts for pipeline: ${pipelineName}`);

        try {
            // Create HTTPS agent to bypass SSL certificate issues
            const httpsAgent = new https.Agent({
                rejectUnauthorized: false
            });

            const headers = {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Authorization': `Bearer ${this._token}`,
                'Connection': 'keep-alive',
                'Content-Type': 'application/json',
                'Project': '2',
                'ProjectName': this.organization,
                'Referer': 'http://localhost:8087/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
                'X-Requested-With': 'Leap',
                'charset': 'utf-8',
                'roleId': '1',
                'roleName': 'IT Portfolio Manager',
                'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            };

            let files: ScriptFile[] = [];
            let streamingService: any = null;
            let pipelineData: any = null;

            // Step 1: Get streaming service by name (following Angular getStreamingServicesByName pattern)
            try {
                console.log('Fetching streaming service details...');
                const streamingServiceResponse = await axios.get(`/api/aip/service/v1/streamingServices/${pipelineName}/${this.organization}`, {
                    baseURL: 'http://localhost:8087',
                    headers: headers,
                    httpsAgent: httpsAgent,
                    timeout: 30000
                });

                streamingService = streamingServiceResponse.data;
                console.log('Streaming service response:', streamingService);
            } catch (serviceError: any) {
                console.log('Streaming service fetch failed, trying pipeline by name...', serviceError.message);

                // Step 2: Try getting pipeline by name if streaming service fails (following Angular getPipelineByName pattern)
                try {
                    console.log('Fetching pipeline by name...');
                    const urlParams = new URLSearchParams();
                    urlParams.append('name', pipelineName);
                    urlParams.append('org', this.organization);

                    const pipelineResponse = await axios.get('/api/aip/service/v1/pipelines/byname', {
                        baseURL: 'http://localhost:8087',
                        headers: headers,
                        params: urlParams,
                        httpsAgent: httpsAgent,
                        timeout: 30000
                    });

                    pipelineData = pipelineResponse.data && pipelineResponse.data.length > 0 ? pipelineResponse.data[0] : null;
                    console.log('Pipeline by name response:', pipelineData);
                } catch (pipelineError: any) {
                    console.log('Pipeline by name also failed:', pipelineError.message);
                }
            }

            // Step 3: Parse JSON content to get file information (following Angular pattern)
            let jsonContent: any = null;
            let fileList: string[] = [];

            if (streamingService) {
                try {
                    // Try both jsonContent and json_content properties
                    const contentStr = streamingService.jsonContent || streamingService.json_content;
                    if (contentStr) {
                        jsonContent = JSON.parse(contentStr);
                        console.log('Parsed JSON content:', jsonContent);

                        // Extract files from elements[0].attributes.files (following Angular pattern)
                        if (jsonContent.elements && jsonContent.elements[0] && jsonContent.elements[0].attributes) {
                            const attributes = jsonContent.elements[0].attributes;
                            if (attributes.files && Array.isArray(attributes.files)) {
                                fileList = attributes.files;
                                console.log('Found files in JSON:', fileList);
                            }
                        }
                    }
                } catch (parseError) {
                    console.log('Failed to parse JSON content:', parseError);
                }
            }

            // Step 4: Read actual files using the native file API (following Angular readFile pattern)
            if (fileList.length > 0) {
                console.log('Reading files from JSON content...');

                for (const fileName of fileList) {
                    try {
                        console.log(`Reading file from JSON list: ${fileName}`);

                        // Use the exact API pattern from Angular readNativeFile method
                        const response = await axios.get(`/api/aip/file/read/${pipelineName}/${this.organization}`, {
                            baseURL: 'http://localhost:8087',
                            headers: headers,
                            params: {
                                file: fileName
                            },
                            responseType: 'arraybuffer', // Match Angular responseType
                            httpsAgent: httpsAgent,
                            timeout: 30000
                        });

                        if (response.data) {
                            console.log(`Successfully read file: ${fileName}`);

                            // Convert arraybuffer to text using TextDecoder (matching Angular approach)
                            const textDecoder = new TextDecoder('utf-8');
                            const fileContent = textDecoder.decode(response.data);

                            const extension = fileName.includes('.')
                                ? fileName.substring(fileName.lastIndexOf('.') + 1)
                                : 'txt';
                            const language = this.getLanguageByExtension(extension);

                            files.push({
                                fileName: fileName,
                                content: fileContent,
                                extension: extension,
                                language: language
                            });

                            console.log(`File ${fileName} decoded successfully, content length: ${fileContent.length}`);
                        }
                    } catch (fileError: any) {
                        console.log(`File ${fileName} not found or error reading:`, fileError.response?.status || fileError.message);
                        // Continue trying other files
                    }
                }
            } else {
                // Step 5: Fallback to common file names if no files found in JSON
                console.log('No files in JSON content, trying common file names...');

                const possibleFiles = [
                    `${pipelineName}.py`,           // Main script file
                    `${pipelineName}_${this.organization}.py`,  // Pipeline with org
                    `main.py`,                      // Default main file
                    `script.py`,                    // Generic script file
                    `${pipelineName}.json`,         // Pipeline configuration
                    `config.json`,                  // Generic config
                    `requirements.txt`              // Python dependencies
                ];

                for (const fileName of possibleFiles) {
                    try {
                        console.log(`Attempting to read file: ${fileName}`);

                        // Use the exact API pattern from Angular readNativeFile method
                        const response = await axios.get(`/api/aip/file/read/${pipelineName}/${this.organization}`, {
                            baseURL: 'http://localhost:8087',
                            headers: headers,
                            params: {
                                file: fileName
                            },
                            responseType: 'arraybuffer', // Match Angular responseType
                            httpsAgent: httpsAgent,
                            timeout: 30000
                        });

                        if (response.data) {
                            console.log(`Successfully read file: ${fileName}`);

                            // Convert arraybuffer to text using TextDecoder (matching Angular approach)
                            const textDecoder = new TextDecoder('utf-8');
                            const fileContent = textDecoder.decode(response.data);

                            const extension = fileName.includes('.')
                                ? fileName.substring(fileName.lastIndexOf('.') + 1)
                                : 'txt';
                            const language = this.getLanguageByExtension(extension);

                            files.push({
                                fileName: fileName,
                                content: fileContent,
                                extension: extension,
                                language: language
                            });

                            console.log(`File ${fileName} decoded successfully, content length: ${fileContent.length}`);
                        }
                    } catch (fileError: any) {
                        console.log(`File ${fileName} not found or error reading:`, fileError.response?.status || fileError.message);
                        // Continue trying other files
                    }
                }
            }

            // If no files were found, create a placeholder script
            if (files.length === 0) {
                console.log('No native files found, creating placeholder script...');

                const fileName = `${pipelineName}.py`;
                files.push({
                    fileName: fileName,
                    content: `# Pipeline Script for ${pipelineName}
# Organization: ${this.organization}
# 
# This script was not found on the server using the native file API.
# API endpoint: /file/read/${pipelineName}/${this.organization}?file={filename}
#
# To generate this script:
# 1. Go to the pipeline in the web interface
# 2. Click "Generate Script" or "Save" 
# 3. Wait for script generation to complete
# 4. Refresh this view

def main():
    """
    Main pipeline function for ${pipelineName}
    """
    print("Pipeline: ${pipelineName}")
    print("Organization: ${this.organization}")
    print("Status: Script file not found")
    print("Please generate the script first using the web interface")
    
    # Add your pipeline logic here
    pass
    
if __name__ == "__main__":
    main()
`,
                    extension: 'py',
                    language: 'python'
                });
            }

            // Fetch run types - using the same endpoint pattern as in the Angular code
            let runTypesResponse: any = null;
            try {
                console.log('Fetching run types...');

                // Try the job run types endpoint (from Angular code reference)
                runTypesResponse = await axios.get(`/api/aip/service/v1/jobs/runtime/types/${this.organization}`, {
                    baseURL: 'http://localhost:8087',
                    headers: headers,
                    httpsAgent: httpsAgent,
                    timeout: 30000
                });
                console.log('Run types response:', runTypesResponse.data);
            } catch (runTypesError: any) {
                console.log('Job run types endpoint failed, trying alternative...');

                try {
                    // Try alternative endpoint
                    runTypesResponse = await axios.get('/api/aip/service/v1/datasources/runtime', {
                        baseURL: 'http://localhost:8087',
                        headers: headers,
                        httpsAgent: httpsAgent,
                        timeout: 30000
                    });
                    console.log('Alternative run types response:', runTypesResponse.data);
                } catch (altError: any) {
                    console.log('Failed to fetch run types from both endpoints, using defaults:', altError.message);
                    // Provide default run types if API fails
                    runTypesResponse = {
                        data: [
                            { type: 'Local', dsAlias: '', dsName: 'Local Runtime', dsCapability: '' },
                            { type: 'Spark', dsAlias: 'default', dsName: 'Spark Cluster', dsCapability: 'spark' },
                            { type: 'Docker', dsAlias: 'docker', dsName: 'Docker Container', dsCapability: 'container' }
                        ]
                    };
                }
            }

            console.log(`Successfully prepared ${files.length} script files for pipeline ${pipelineName}`);

            return {
                pipelineName: pipelineName,
                files: files,
                runTypes: runTypesResponse.data || []
            };

        } catch (error: any) {
            console.error('Failed to fetch scripts - Full error:', error);

            // Provide detailed error message
            let errorMessage = 'Failed to fetch pipeline scripts';

            if (error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY') {
                errorMessage = 'SSL Certificate error - unable to verify server certificate';
            } else if (error.code === 'ENOTFOUND') {
                errorMessage = 'Network error - unable to reach the server at localhost:8087';
            } else if (error.response) {
                errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
                console.error('Response data:', error.response.data);
            } else if (error.request) {
                errorMessage = 'Network timeout or connection refused';
            } else {
                errorMessage = `Request setup error: ${error.message}`;
            }

            console.error('Processed error message:', errorMessage);

            // Return mock data instead of throwing error to allow user to see the interface
            console.log('Returning mock data due to API failure');
            return {
                pipelineName: pipelineName,
                files: [{
                    fileName: 'pipeline_template.py',
                    content: `# Pipeline Script for ${pipelineName}
# This is a template - actual scripts will be loaded from the server

def main():
    """
    Main pipeline function for ${pipelineName}
    
    Error: ${errorMessage}
    
    To resolve:
    1. Ensure the backend server is running on localhost:8087
    2. Check that the pipeline has generated scripts
    3. Verify your authentication token is valid
    """
    print("Pipeline: ${pipelineName}")
    print("Status: Script generation pending or failed")
    print("Error: ${errorMessage}")
    
    # Your pipeline logic will be generated here
    pass

if __name__ == "__main__":
    main()
`,
                    extension: 'py',
                    language: 'python'
                }],
                runTypes: [
                    { type: 'Local', dsAlias: '', dsName: 'Local Runtime', dsCapability: '' },
                    { type: 'Spark', dsAlias: 'default', dsName: 'Spark Cluster', dsCapability: '' }
                ]
            };
        }
    }

    private getLanguageByExtension(extension: string): string {
        const languageMap: { [key: string]: string } = {
            'py': 'python',
            'js': 'javascript',
            'ts': 'typescript',
            'json': 'json',
            'sql': 'sql',
            'sh': 'shellscript',
            'bat': 'bat',
            'yml': 'yaml',
            'yaml': 'yaml',
            'xml': 'xml',
            'txt': 'plaintext'
        };
        return languageMap[extension.toLowerCase()] || 'plaintext';
    }

    private updateQueryParam(pageNumber: number, filter: string, adapterType: string): void {
        // This would typically update URL query parameters in a web app
        console.log(`Query params updated: page=${pageNumber}, filter=${filter}, type=${adapterType}`);
    }

    private updateWebview(): void {
        if (this._view) {
            this._view.webview.postMessage({
                command: 'updateCards',
                cards: this.filteredCards,
                loading: this.loading
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        // Read HTML template from external file
        const htmlPath = path.join(this._context.extensionPath, 'src', 'app', 'pipeline', 'pipeline-cards.html');
        let htmlTemplate = '';

        try {
            htmlTemplate = fs.readFileSync(htmlPath, 'utf8');
        } catch (error) {
            console.error('Failed to read HTML template:', error);
            return this._getFallbackHtml();
        }

        // Get CSS file URI
        const cssPath = vscode.Uri.joinPath(this._extensionUri, 'src', 'app', 'pipeline', 'pipeline-cards.css');
        const cssUri = webview.asWebviewUri(cssPath);

        // Get JavaScript file URI
        const jsPath = vscode.Uri.joinPath(this._extensionUri, 'src', 'app', 'pipeline', 'pipeline-cards-client.js');
        const jsUri = webview.asWebviewUri(jsPath);

        // Replace placeholders with actual URIs
        htmlTemplate = htmlTemplate.replace('{{CSS_URI}}', cssUri.toString());
        htmlTemplate = htmlTemplate.replace('{{JS_URI}}', jsUri.toString());

        return htmlTemplate;
    }

    private _getFallbackHtml(): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pipeline Cards</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    padding: 16px;
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                }
                .error {
                    text-align: center;
                    padding: 40px;
                    color: var(--vscode-errorForeground);
                }
            </style>
        </head>
        <body>
            <div class="error">
                <h2>Error Loading Pipeline Cards</h2>
                <p>Could not load the pipeline cards template. Please check the extension files.</p>
            </div>
        </body>
        </html>`;
    }

    private async createScriptViewer(card: PipelineCard, scripts: PipelineScript): Promise<void> {
        // Create webview panel for script actions (sidebar)
        const scriptActionsPanel = vscode.window.createWebviewPanel(
            'pipelineScriptActions',
            `Pipeline Actions: ${card.alias}`,
            { viewColumn: vscode.ViewColumn.Two, preserveFocus: true },
            {
                enableScripts: true,
                localResourceRoots: [this._extensionUri]
            }
        );

        // Set the HTML content for the actions panel
        scriptActionsPanel.webview.html = this.getScriptActionsHtml(card, scripts);

        // Handle messages from the actions panel
        scriptActionsPanel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'selectScript':
                        await this.openScriptInEditor(scripts.files[message.fileIndex]);
                        break;
                    case 'runScript':
                        await this.runPipelineScript(card.id || '', message.runType);
                        break;
                    case 'copyScript':
                        await this.copyScriptToClipboard(card.id || '', message.fileName);
                        break;
                    case 'refreshScripts':
                        await this.refreshScripts(card.id || '');
                        break;
                    case 'viewLogs':
                        await this.viewPipelineLogs(card.id || '');
                        break;
                }
            },
            undefined,
            this._context.subscriptions
        );

        // Open the first script file in the editor
        if (scripts.files.length > 0) {
            await this.openScriptInEditor(scripts.files[0]);
        }
    }

    private async openScriptInEditor(scriptFile: ScriptFile): Promise<void> {
        try {
            // Create a new untitled document with the script content
            const doc = await vscode.workspace.openTextDocument({
                content: scriptFile.content,
                language: scriptFile.language
            });

            // Show the document in the main editor (column one)
            await vscode.window.showTextDocument(doc, {
                viewColumn: vscode.ViewColumn.One,
                preserveFocus: false
            });

        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to open script: ${error.message}`);
        }
    }

    private getScriptActionsHtml(card: PipelineCard, scripts: PipelineScript): string {
        const scriptFilesList = scripts.files.map((file, index) =>
            `<button class="script-file-btn" onclick="selectScript(${index})">${file.fileName}</button>`
        ).join('');

        const runTypeOptions = scripts.runTypes.map(runType =>
            `<option value="${runType.type}-${runType.dsAlias}">${runType.type} - ${runType.dsAlias}</option>`
        ).join('');

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pipeline Script Actions</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    padding: 16px;
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                }
                .section {
                    margin-bottom: 24px;
                    padding: 16px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 6px;
                }
                .section-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    color: var(--vscode-editor-foreground);
                }
                .pipeline-info {
                    margin-bottom: 16px;
                }
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 14px;
                }
                .info-label {
                    font-weight: 500;
                    color: var(--vscode-descriptionForeground);
                }
                .info-value {
                    color: var(--vscode-editor-foreground);
                }
                .script-file-btn {
                    display: block;
                    width: 100%;
                    padding: 8px 12px;
                    margin-bottom: 8px;
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    border: 1px solid var(--vscode-button-border);
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    text-align: left;
                }
                .script-file-btn:hover {
                    background-color: var(--vscode-button-secondaryHoverBackground);
                }
                .form-group {
                    margin-bottom: 16px;
                }
                .form-label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: 500;
                    color: var(--vscode-editor-foreground);
                }
                .form-select, .form-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 4px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    font-size: 14px;
                }
                .btn {
                    padding: 10px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    margin-right: 8px;
                    margin-bottom: 8px;
                }
                .btn-primary {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }
                .btn-primary:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .btn-secondary {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                }
                .btn-secondary:hover {
                    background-color: var(--vscode-button-secondaryHoverBackground);
                }
                .actions-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
            </style>
        </head>
        <body>
            <div class="section">
                <div class="section-title">Pipeline Information</div>
                <div class="pipeline-info">
                    <div class="info-item">
                        <span class="info-label">Name:</span>
                        <span class="info-value">${card.alias}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Type:</span>
                        <span class="info-value">${card.type}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Created:</span>
                        <span class="info-value">${new Date(card.createdDate).toLocaleDateString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Created By:</span>
                        <span class="info-value">${card.created_by}</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Script Files</div>
                ${scriptFilesList}
            </div>

            <div class="section">
                <div class="section-title">Run Configuration</div>
                <div class="form-group">
                    <label class="form-label" for="runType">Select Run Type:</label>
                    <select id="runType" class="form-select">
                        ${runTypeOptions}
                    </select>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Actions</div>
                <div class="actions-grid">
                    <button class="btn btn-primary" onclick="runScript()">Run Pipeline</button>
                    <button class="btn btn-secondary" onclick="copyScript()">Copy Script</button>
                    <button class="btn btn-secondary" onclick="refreshScripts()">Refresh Scripts</button>
                    <button class="btn btn-secondary" onclick="viewLogs()">View Logs</button>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();

                function selectScript(fileIndex) {
                    vscode.postMessage({
                        command: 'selectScript',
                        fileIndex: fileIndex
                    });
                }

                function runScript() {
                    const runType = document.getElementById('runType').value;
                    vscode.postMessage({
                        command: 'runScript',
                        runType: runType
                    });
                }

                function copyScript() {
                    // Get currently selected script file name - you might want to track this
                    vscode.postMessage({
                        command: 'copyScript',
                        fileName: 'current_script' // You can enhance this to track current file
                    });
                }

                function refreshScripts() {
                    vscode.postMessage({
                        command: 'refreshScripts'
                    });
                }

                function viewLogs() {
                    vscode.postMessage({
                        command: 'viewLogs'
                    });
                }
            </script>
        </body>
        </html>`;
    }

    private async runPipelineScript(cardId: string, runType: string): Promise<void> {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) {
            vscode.window.showErrorMessage('Pipeline not found');
            return;
        }

        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Running pipeline ${card.alias}...`,
                cancellable: false
            }, async (progress) => {
                const httpsAgent = new https.Agent({
                    rejectUnauthorized: false
                });

                const headers = {
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Authorization': `Bearer ${this._token}`,
                    'Connection': 'keep-alive',
                    'Content-Type': 'application/json',
                    'Project': '2',
                    'ProjectName': this.organization,
                    'X-Requested-With': 'Leap',
                    'charset': 'utf-8',
                    'roleId': '1',
                    'roleName': 'IT Portfolio Manager',
                    'Referer': 'http://localhost:8087/',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin'
                };

                progress.report({ increment: 20, message: 'Starting pipeline execution...' });

                // Parse runType to extract type and dsName (format: "type-dsAlias")
                const runTypeParts = runType.split('-');
                const runtimeType = runTypeParts[0] || 'Local';
                const dsName = runTypeParts[1] || '';

                // Use the correct API endpoint format based on Angular code
                const response = await axios.post('/api/aip/service/v1/jobs/run-pipeline', {
                    alias: card.alias || card.name,
                    name: card.alias || card.name,
                    type: 'DragAndDrop', // or 'Script' based on your pipeline type
                    runtimeType: runtimeType,
                    dsName: dsName,
                    scriptType: 'generated'
                }, {
                    baseURL: 'http://localhost:8087',
                    headers: headers,
                    httpsAgent: httpsAgent,
                    timeout: 60000
                });

                progress.report({ increment: 100, message: 'Pipeline started!' });

                const jobId = response.data.jobId || response.data.id;
                if (jobId) {
                    // Create job status object
                    const jobStatus: JobStatus = {
                        jobId: jobId,
                        correlationId: response.data.correlationId,
                        streamingService: card.alias || card.name,
                        jobStatus: 'RUNNING',
                        type: runtimeType,
                        runtime: dsName,
                        submittedBy: 'Current User',
                        submittedOn: new Date().toISOString(),
                        pipelineName: card.alias || card.name,
                        organization: this.organization,
                        logs: ''
                    };

                    // Show job status viewer
                    await this.showJobStatusViewer(jobStatus, card);
                    
                    vscode.window.showInformationMessage(
                        `Pipeline started successfully! Job ID: ${jobId}`,
                        'View Status'
                    ).then(selection => {
                        if (selection === 'View Status') {
                            this.showJobStatusViewer(jobStatus, card);
                        }
                    });
                } else {
                    vscode.window.showInformationMessage('Pipeline started successfully!');
                }
            });

        } catch (error: any) {
            console.error('Pipeline run error:', error);

            let errorMessage = 'Failed to run pipeline';
            if (error.response) {
                errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
                if (error.response.data && error.response.data.message) {
                    errorMessage += ` - ${error.response.data.message}`;
                }
            } else if (error.request) {
                errorMessage = 'Network error - could not reach the server';
            }

            vscode.window.showErrorMessage(`${errorMessage}: ${error.message}`);
        }
    }

    private async copyScriptToClipboard(cardId: string, fileName: string): Promise<void> {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) return;

        try {
            const scripts = await this.fetchPipelineScripts(card.alias || card.name);
            const scriptFile = scripts.files.find(f => f.fileName === fileName);

            if (scriptFile) {
                await vscode.env.clipboard.writeText(scriptFile.content);
                vscode.window.showInformationMessage('Script copied to clipboard!');
            }
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to copy script: ${error.message}`);
        }
    }

    private async refreshScripts(cardId: string): Promise<void> {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) return;

        try {
            await this.viewScriptDetails(cardId);
            vscode.window.showInformationMessage('Scripts refreshed successfully!');
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to refresh scripts: ${error.message}`);
        }
    }

    private async viewPipelineLogs(cardId: string): Promise<void> {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) return;

        // Open logs in a new webview or redirect to logs view
        vscode.window.showInformationMessage(`Opening logs for pipeline: ${card.alias}`);
        // You can implement log viewer here
    }

    /**
     * Show job status viewer based on Angular JobDataViewerComponent
     */
    private async showJobStatusViewer(jobStatus: JobStatus, card: PipelineCard): Promise<void> {
        try {
            // Create webview panel for job status
            const jobStatusPanel = vscode.window.createWebviewPanel(
                'jobStatus',
                `Job Status: ${jobStatus.pipelineName}`,
                { viewColumn: vscode.ViewColumn.Two, preserveFocus: false },
                {
                    enableScripts: true,
                    localResourceRoots: [this._extensionUri],
                    retainContextWhenHidden: true
                }
            );

            // Set initial HTML content
            jobStatusPanel.webview.html = this.getJobStatusHtml(jobStatus);

            // Start monitoring job status
            const statusInterval = setInterval(async () => {
                try {
                    const updatedStatus = await this.fetchJobStatus(jobStatus.jobId);
                    if (updatedStatus) {
                        // Update the webview with new status
                        jobStatusPanel.webview.postMessage({
                            command: 'updateStatus',
                            status: updatedStatus
                        });

                        // Stop monitoring if job is completed
                        if (updatedStatus.jobStatus.toLowerCase() !== 'running') {
                            clearInterval(statusInterval);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching job status:', error);
                }
            }, 3000); // Poll every 3 seconds

            // Handle messages from the webview
            jobStatusPanel.webview.onDidReceiveMessage(
                async (message) => {
                    switch (message.command) {
                        case 'viewLogsInBrowser':
                            await this.openLogsInBrowser(jobStatus.jobId);
                            break;
                        case 'refreshStatus':
                            const updatedStatus = await this.fetchJobStatus(jobStatus.jobId);
                            if (updatedStatus) {
                                jobStatusPanel.webview.postMessage({
                                    command: 'updateStatus',
                                    status: updatedStatus
                                });
                            }
                            break;
                        case 'copyJobId':
                            await vscode.env.clipboard.writeText(jobStatus.jobId);
                            vscode.window.showInformationMessage('Job ID copied to clipboard!');
                            break;
                    }
                },
                undefined,
                this._context.subscriptions
            );

            // Clean up interval when panel is disposed
            jobStatusPanel.onDidDispose(() => {
                clearInterval(statusInterval);
            });

        } catch (error: any) {
            console.error('Error showing job status viewer:', error);
            vscode.window.showErrorMessage(`Failed to show job status: ${error.message}`);
        }
    }

    /**
     * Fetch job status from server (based on Angular fetchSparkJob pattern)
     */
    private async fetchJobStatus(jobId: string): Promise<JobStatus | null> {
        try {
            const httpsAgent = new https.Agent({
                rejectUnauthorized: false
            });

            const headers = {
                'Accept': 'application/json, text/plain, */*',
                'Authorization': `Bearer ${this._token}`,
                'Content-Type': 'application/json',
                'Project': '2',
                'ProjectName': this.organization,
                'X-Requested-With': 'Leap',
            };

            // Fetch job status using the pattern from Angular code
            const response = await axios.get(`/api/aip/service/v1/jobs/status/${jobId}`, {
                baseURL: 'http://localhost:8087',
                headers: headers,
                httpsAgent: httpsAgent,
                timeout: 10000
            });

            if (response.data) {
                const data = response.data;
                return {
                    jobId: jobId,
                    correlationId: data.correlationId || data.correlationid,
                    streamingService: data.streamingService,
                    jobStatus: data.jobStatus || data.status || 'UNKNOWN',
                    version: data.version,
                    type: data.type,
                    runtime: data.runtime,
                    finishTime: data.finishTime || data.finishtime,
                    submittedBy: data.submittedBy,
                    submittedOn: data.submittedOn,
                    pipelineName: data.pipelineName || data.jobName,
                    organization: data.organization || this.organization,
                    logs: data.log || '',
                    hashParams: data.hashparams || data.hashParams
                };
            }

            return null;
        } catch (error: any) {
            console.error('Failed to fetch job status:', error);
            return null;
        }
    }

    /**
     * Open job logs in browser (following Angular pattern)
     */
    private async openLogsInBrowser(jobId: string): Promise<void> {
        try {
            // Construct the URL to open logs in browser
            const logsUrl = `http://localhost:8087/pipeline/logs?jobId=${jobId}&org=${this.organization}`;
            
            // Open in VS Code's simple browser
            await vscode.commands.executeCommand('simpleBrowser.show', logsUrl);
            
            vscode.window.showInformationMessage('Job logs opened in browser');
        } catch (error: any) {
            console.error('Failed to open logs in browser:', error);
            vscode.window.showErrorMessage(`Failed to open logs: ${error.message}`);
        }
    }

    /**
     * Generate HTML for job status viewer (based on Angular JobDataViewer template)
     */
    private getJobStatusHtml(jobStatus: JobStatus): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Job Status - ${jobStatus.pipelineName}</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    padding: 16px;
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                }
                .modal-body {
                    padding: 16px;
                }
                .section {
                    margin-bottom: 24px;
                    padding: 16px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 6px;
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                }
                .section-header {
                    background-color: #0094ff;
                    color: white;
                    padding: 12px 16px;
                    border-radius: 6px 6px 0 0;
                    margin: -16px -16px 16px -16px;
                    font-weight: 600;
                    font-size: 16px;
                }
                .hidden-details {
                    margin: 16px 0;
                }
                .space {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                }
                .content-group {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 16px;
                }
                .content-group > div {
                    display: flex;
                    flex-direction: column;
                }
                .id {
                    font-weight: 600;
                    color: var(--vscode-descriptionForeground);
                    margin: 0 0 4px 0;
                    font-size: 14px;
                }
                .line-wrap {
                    word-break: break-all;
                    color: var(--vscode-editor-foreground);
                    margin: 0;
                    font-size: 14px;
                }
                .footer-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid var(--vscode-panel-border);
                }
                .icon-data-wrap {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 14px;
                }
                .log-card {
                    margin-top: 16px;
                    padding: 16px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 6px;
                    background-color: var(--vscode-editor-background);
                }
                .log-title {
                    font-weight: 600;
                    font-size: 16px;
                    margin-bottom: 12px;
                    color: var(--vscode-editor-foreground);
                }
                .log-content {
                    background-color: var(--vscode-terminal-background, #1e1e1e);
                    color: var(--vscode-terminal-foreground, #ffffff);
                    padding: 12px;
                    border-radius: 4px;
                    font-family: 'Courier New', Consolas, monospace;
                    font-size: 12px;
                    white-space: pre-wrap;
                    word-break: break-word;
                    max-height: 300px;
                    overflow-y: auto;
                    border: 1px solid var(--vscode-panel-border);
                }
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-weight: 600;
                    font-size: 12px;
                    text-transform: uppercase;
                }
                .status-running {
                    background-color: #ffa500;
                    color: white;
                }
                .status-completed {
                    background-color: #28a745;
                    color: white;
                }
                .status-failed {
                    background-color: #dc3545;
                    color: white;
                }
                .status-unknown {
                    background-color: #6c757d;
                    color: white;
                }
                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    margin-right: 8px;
                    margin-bottom: 8px;
                }
                .btn-primary {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }
                .btn-primary:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .btn-secondary {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                }
                .btn-secondary:hover {
                    background-color: var(--vscode-button-secondaryHoverBackground);
                }
                .actions-section {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid var(--vscode-panel-border);
                }
                .loading {
                    color: var(--vscode-progressBar-background);
                    font-style: italic;
                }
            </style>
        </head>
        <body>
            <div class="modal-body">
                <div class="section">
                    <div class="section-header">Job Details</div>
                    <div class="hidden-details">
                        <div class="space">
                            <h3 class="id">Job ID</h3>
                            <h3 class="line-wrap" id="jobId">${jobStatus.jobId}</h3>
                        </div>
                        ${jobStatus.correlationId ? `
                        <div class="space">
                            <h3 class="id">Correlation ID</h3>
                            <h3 id="correlationId">${jobStatus.correlationId}</h3>
                        </div>
                        ` : ''}
                        <div class="content-group">
                            <div>
                                <h3 class="id">Streaming Service</h3>
                                <h3 id="streamingService">${jobStatus.streamingService || 'N/A'}</h3>
                            </div>
                            <div>
                                <h3 class="id">Job Status</h3>
                                <span class="status-badge status-${jobStatus.jobStatus.toLowerCase()}" id="jobStatus">${jobStatus.jobStatus}</span>
                            </div>
                            <div>
                                <h3 class="id">Version</h3>
                                <h3 id="version">${jobStatus.version || 'N/A'}</h3>
                            </div>
                        </div>
                        <div class="content-group">
                            <div>
                                <h3 class="id">Type</h3>
                                <h3 id="type">${jobStatus.type || 'N/A'}</h3>
                            </div>
                            <div>
                                <h3 class="id">Runtime</h3>
                                <h3 id="runtime">${jobStatus.runtime || 'N/A'}</h3>
                            </div>
                            <div>
                                <h3 class="id">Finish Time</h3>
                                <h3 id="finishTime">${jobStatus.finishTime || 'Not finished'}</h3>
                            </div>
                        </div>
                        <hr>
                        <div class="footer-content">
                            <div class="icon-data-wrap">
                                <div class="avatar" id="submittedByAvatar">
                                    ${jobStatus.submittedBy ? jobStatus.submittedBy.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <h3 class="id">Submitted By</h3>
                                    <h3 id="submittedBy">${jobStatus.submittedBy || 'Unknown'}</h3>
                                </div>
                            </div>
                            <div>
                                <h3 class="id">Submitted On</h3>
                                <h3 id="submittedOn">${jobStatus.submittedOn ? new Date(jobStatus.submittedOn).toLocaleString() : 'N/A'}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="log-card">
                    <div class="log-title">Logs:</div>
                    <div class="log-content" id="logContent">
                        <div class="loading">Loading job logs... <span id="statusIndicator">●</span></div>
                    </div>
                    <div class="actions-section">
                        <button class="btn btn-primary" onclick="viewLogsInBrowser()">Open Full Logs in Browser</button>
                        <button class="btn btn-secondary" onclick="refreshStatus()">Refresh Status</button>
                        <button class="btn btn-secondary" onclick="copyJobId()">Copy Job ID</button>
                    </div>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                let statusUpdateInterval;

                // Handle messages from the extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'updateStatus':
                            updateJobStatus(message.status);
                            break;
                    }
                });

                function updateJobStatus(status) {
                    // Update job details
                    document.getElementById('jobId').textContent = status.jobId;
                    if (status.correlationId) {
                        document.getElementById('correlationId').textContent = status.correlationId;
                    }
                    document.getElementById('streamingService').textContent = status.streamingService || 'N/A';
                    
                    // Update status badge
                    const statusElement = document.getElementById('jobStatus');
                    statusElement.textContent = status.jobStatus;
                    statusElement.className = 'status-badge status-' + status.jobStatus.toLowerCase();
                    
                    document.getElementById('version').textContent = status.version || 'N/A';
                    document.getElementById('type').textContent = status.type || 'N/A';
                    document.getElementById('runtime').textContent = status.runtime || 'N/A';
                    document.getElementById('finishTime').textContent = status.finishTime || 'Not finished';
                    document.getElementById('submittedBy').textContent = status.submittedBy || 'Unknown';
                    document.getElementById('submittedOn').textContent = status.submittedOn ? new Date(status.submittedOn).toLocaleString() : 'N/A';

                    // Update avatar
                    const avatar = document.getElementById('submittedByAvatar');
                    avatar.textContent = status.submittedBy ? status.submittedBy.charAt(0).toUpperCase() : 'U';

                    // Update logs
                    const logContent = document.getElementById('logContent');
                    if (status.logs && status.logs.trim()) {
                        let fullLogs = '';
                        if (status.hashParams && status.hashParams.trim()) {
                            fullLogs += status.hashParams + '\\n';
                        }
                        fullLogs += status.logs;
                        logContent.textContent = fullLogs;
                    } else if (status.hashParams && status.hashParams.trim()) {
                        logContent.textContent = status.hashParams;
                    } else {
                        const statusIndicator = document.getElementById('statusIndicator');
                        if (status.jobStatus.toLowerCase() === 'running') {
                            logContent.innerHTML = 'Job is still running... <span id="statusIndicator">●</span>';
                            animateStatusIndicator();
                        } else {
                            logContent.textContent = 'No logs available for this job.';
                        }
                    }
                }

                function animateStatusIndicator() {
                    const indicator = document.getElementById('statusIndicator');
                    if (indicator) {
                        let opacity = 1;
                        setInterval(() => {
                            opacity = opacity === 1 ? 0.3 : 1;
                            indicator.style.opacity = opacity;
                        }, 500);
                    }
                }

                function viewLogsInBrowser() {
                    vscode.postMessage({
                        command: 'viewLogsInBrowser'
                    });
                }

                function refreshStatus() {
                    vscode.postMessage({
                        command: 'refreshStatus'
                    });
                }

                function copyJobId() {
                    vscode.postMessage({
                        command: 'copyJobId'
                    });
                }

                // Start the status indicator animation
                animateStatusIndicator();
            </script>
        </body>
        </html>`;
    }

    private async generatePipelineScripts(pipelineName: string): Promise<void> {
        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Generating scripts for ${pipelineName}...`,
                cancellable: false
            }, async (progress) => {
                const httpsAgent = new https.Agent({
                    rejectUnauthorized: false
                });

                const headers = {
                    'Accept': 'application/json, text/plain, */*',
                    'Authorization': `Bearer ${this._token}`,
                    'Content-Type': 'application/json',
                    'Project': '2',
                    'ProjectName': this.organization,
                    'X-Requested-With': 'Leap',
                };

                progress.report({ increment: 10, message: 'Initiating script generation...' });

                // First, save the pipeline JSON (similar to Angular implementation)
                try {
                    const saveJsonResponse = await axios.post('/api/aip/service/v1/pipelines/save-json', {
                        name: pipelineName,
                        organization: this.organization
                    }, {
                        baseURL: 'http://localhost:8087',
                        headers: headers,
                        httpsAgent: httpsAgent,
                        timeout: 30000
                    });

                    progress.report({ increment: 30, message: 'Pipeline JSON saved, generating script...' });
                } catch (saveError) {
                    console.log('Save JSON failed, continuing with direct generation...', saveError);
                    progress.report({ increment: 20, message: 'Proceeding with script generation...' });
                }

                // Trigger script generation using event-based approach (from Angular code)
                const generateResponse = await axios.post('/api/aip/service/v1/events/trigger', {
                    eventType: 'generateScript_Pipeline', // Adjust based on pipeline type
                    pipelineName: pipelineName,
                    organization: this.organization
                }, {
                    baseURL: 'http://localhost:8087',
                    headers: headers,
                    httpsAgent: httpsAgent,
                    timeout: 60000
                });

                const eventId = generateResponse.data.eventId || generateResponse.data.id;
                progress.report({ increment: 50, message: 'Script generation in progress...' });

                // Poll for completion using event status
                let attempts = 0;
                const maxAttempts = 30; // 30 seconds

                while (attempts < maxAttempts) {
                    try {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

                        const statusResponse = await axios.get(`/api/aip/service/v1/events/status/${eventId}`, {
                            baseURL: 'http://localhost:8087',
                            headers: headers,
                            httpsAgent: httpsAgent,
                            timeout: 10000
                        });

                        if (statusResponse.data === 'COMPLETED' || statusResponse.data.status === 'COMPLETED') {
                            progress.report({ increment: 100, message: 'Scripts generated successfully!' });
                            vscode.window.showInformationMessage(`Scripts generated successfully for ${pipelineName}!`);
                            return;
                        } else if (statusResponse.data === 'ERROR' || statusResponse.data.status === 'ERROR') {
                            throw new Error('Script generation failed on server');
                        }

                        progress.report({
                            increment: 50 + (attempts * 40 / maxAttempts),
                            message: `Generating scripts... (${attempts + 1}/${maxAttempts})`
                        });

                    } catch (statusError) {
                        console.log('Status check failed, continuing...', statusError);
                    }

                    attempts++;
                }

                // If we reach here, generation might be taking longer than expected
                vscode.window.showWarningMessage(
                    `Script generation for ${pipelineName} is taking longer than expected. Please check the pipeline in the web interface.`
                );

            });

        } catch (error: any) {
            console.error('Script generation error:', error);

            let errorMessage = 'Failed to generate scripts';
            if (error.response) {
                errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
            } else if (error.request) {
                errorMessage = 'Network error - could not reach the server';
            }

            vscode.window.showErrorMessage(`${errorMessage}: ${error.message}`);
        }
    }

    /**
     * Create or update a native file based on the Angular createNativeFile pattern
     * @param pipelineName Pipeline name
     * @param organization Organization name
     * @param fileName File name to create/update
     * @param fileType File type (Python3, JavaScript, etc.)
     * @param content File content
     */
    private async createNativeFile(
        pipelineName: string,
        organization: string,
        fileName: string,
        fileType: string,
        content: string
    ): Promise<string> {
        try {
            console.log(`Creating native file: ${fileName} for pipeline: ${pipelineName}`);

            const httpsAgent = new https.Agent({
                rejectUnauthorized: false
            });

            const headers = {
                'Accept': 'application/json, text/plain, */*',
                'Authorization': `Bearer ${this._token}`,
                'Content-Type': 'multipart/form-data',
                'Project': '2',
                'ProjectName': organization,
                'X-Requested-With': 'Leap',
            };

            // Create FormData similar to Angular implementation
            const formData = new FormData();

            // Create a Blob from the script content (similar to Angular)
            const scriptBlob = new Blob([content], { type: 'text/plain' });
            formData.append('scriptFile', scriptBlob, fileName);

            // Add metadata
            formData.append('filetype', fileType);
            formData.append('pipelineName', pipelineName);
            formData.append('organization', organization);

            // Use the native file upload endpoint pattern from Angular
            const response = await axios.post(
                `/file/pipeline/native/upload/${pipelineName}/${organization}`,
                formData,
                {
                    baseURL: 'http://localhost:8087',
                    headers: headers,
                    httpsAgent: httpsAgent,
                    timeout: 30000
                }
            );

            console.log('Native file created successfully:', response.data);
            return response.data; // Returns the created file name or path

        } catch (error: any) {
            console.error('Failed to create native file:', error);

            let errorMessage = 'Failed to create native file';
            if (error.response) {
                errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
                console.error('Response data:', error.response.data);
            } else if (error.request) {
                errorMessage = 'Network error - could not reach the server';
            } else {
                errorMessage = `Request setup error: ${error.message}`;
            }

            throw new Error(`${errorMessage}: ${error.message}`);
        }
    }

    /**
     * Download a native file based on the Angular downloadNativeFile pattern
     * @param pipelineName Pipeline name
     * @param organization Organization name  
     * @param fileName File name to download
     */
    private async downloadNativeFile(
        pipelineName: string,
        organization: string,
        fileName: string
    ): Promise<ArrayBuffer> {
        try {
            console.log(`Downloading native file: ${fileName} from pipeline: ${pipelineName}`);

            const httpsAgent = new https.Agent({
                rejectUnauthorized: false
            });

            const headers = {
                'Accept': 'application/octet-stream',
                'Authorization': `Bearer ${this._token}`,
                'Project': '2',
                'ProjectName': organization,
                'X-Requested-With': 'Leap',
            };

            // Use the download endpoint pattern from Angular
            const response = await axios.get(
                `/api/aip/file/pipeline/native/download/${pipelineName}/${organization}/${fileName}`,
                {
                    baseURL: 'http://localhost:8087',
                    headers: headers,
                    responseType: 'arraybuffer', // For binary file downloads
                    httpsAgent: httpsAgent,
                    timeout: 30000
                }
            );

            console.log('Native file downloaded successfully');
            return response.data;

        } catch (error: any) {
            console.error('Failed to download native file:', error);

            let errorMessage = 'Failed to download native file';
            if (error.response) {
                errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
            } else if (error.request) {
                errorMessage = 'Network error - could not reach the server';
            } else {
                errorMessage = `Request setup error: ${error.message}`;
            }

            throw new Error(`${errorMessage}: ${error.message}`);
        }
    }
}
