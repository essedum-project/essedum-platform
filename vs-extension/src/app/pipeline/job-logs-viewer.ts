// Job Logs Viewer - VS Code Extension implementation
// Based on Angular JobsComponent pattern

import * as vscode from 'vscode';
import axios from 'axios';
import * as https from 'https';

export interface JobData {
    id: string;
    jobId: string;
    submittedBy: string;
    submittedOn: string;
    finishtime?: string;
    runtime: string;
    jobStatus: string;
    jobmetadata?: any;
    agenttaskname?: string;
    [key: string]: any;
}

export interface JobLogData {
    name: string;
    value: any;
}

export class JobLogsViewer {
    private _extensionUri: vscode.Uri;
    private _token: string = '';
    private _organization: string = 'leo1311';

    // Pagination
    private page: number = 0;
    private row: number = 4;
    private totalJobs: number = 0;
    private lastPage: number = 0;

    // Data
    private jobList: JobData[] = [];
    private currentJob: any = {};
    private logsdata: JobLogData[] = [];
    private timeInterval?: NodeJS.Timeout;

    constructor(
        private readonly _context: vscode.ExtensionContext,
        token: string,
        private readonly _pipelineName?: string,
        private readonly _internalJob?: string
    ) {
        this._extensionUri = _context.extensionUri;
        this._token = token;
    }

    /**
     * Show the job logs viewer in a new webview panel
     */
    public async showJobLogsViewer(): Promise<void> {
        try {
            const jobLogsPanel = vscode.window.createWebviewPanel(
                'jobLogs',
                `Job Logs: ${this._pipelineName || this._internalJob || 'Jobs'}`,
                { viewColumn: vscode.ViewColumn.Active, preserveFocus: false },
                {
                    enableScripts: true,
                    localResourceRoots: [this._extensionUri],
                    retainContextWhenHidden: true
                }
            );

            // Set initial HTML content
            jobLogsPanel.webview.html = this.getJobLogsHtml();

            // Handle messages from the webview
            jobLogsPanel.webview.onDidReceiveMessage(
                async (message) => {
                    await this.handleWebviewMessage(message, jobLogsPanel);
                },
                undefined,
                this._context.subscriptions
            );

            // Initialize data
            await this.initializeJobs(jobLogsPanel);

        } catch (error: any) {
            console.error('Error showing job logs viewer:', error);
            vscode.window.showErrorMessage(`Failed to show job logs: ${error.message}`);
        }
    }

    /**
     * Initialize job data (equivalent to ngOnInit)
     */
    private async initializeJobs(panel: vscode.WebviewPanel): Promise<void> {
        try {
            let totalJobsResponse: number;

            if (this._internalJob) {
                totalJobsResponse = await this.fetchInternalJobLenByName(this._internalJob);
            } else if (this._pipelineName) {
                totalJobsResponse = await this.getJobsByStreamingServiceLen(this._pipelineName);
            } else {
                throw new Error('No pipeline name or internal job specified');
            }

            this.totalJobs = totalJobsResponse;
            const remainder = this.totalJobs % this.row;
            const cof = (this.totalJobs - remainder) / this.row;
            this.lastPage = remainder !== 0 ? cof : cof - 1;

            if (this.totalJobs !== 0) {
                await this.getJobs('First', panel);
            } else {
                this.jobList = [];
                this.updateJobsInWebview(panel);
            }

        } catch (error: any) {
            console.error('Error initializing jobs:', error);
            vscode.window.showErrorMessage(`Failed to fetch jobs: ${error.message}`);
        }
    }

    /**
     * Handle messages from webview
     */
    private async handleWebviewMessage(message: any, panel: vscode.WebviewPanel): Promise<void> {
        switch (message.command) {
            case 'refresh':
                await this.onRefresh(panel);
                break;
            case 'getJobs':
                await this.getJobs(message.choice, panel);
                break;
            case 'showConsole':
                await this.showConsole(message.jobId, message.runtime, message.status, message.job, panel);
                break;
            case 'stopJob':
                await this.stopJob(message.jobId, panel);
                break;
            case 'showOutputArtifact':
                await this.showOutputArtifact(message.jobId);
                break;
        }
    }

    /**
     * Refresh jobs (equivalent to onRefresh)
     */
    private async onRefresh(panel: vscode.WebviewPanel): Promise<void> {
        this.page = 0;
        await this.initializeJobs(panel);
    }

    /**
     * Get jobs with pagination (equivalent to getJobs)
     */
    private async getJobs(choice: string, panel: vscode.WebviewPanel): Promise<void> {
        try {
            switch (choice) {
                case 'Next':
                    this.page += 1;
                    if (this.page === this.lastPage) {
                        choice = 'Last';
                        return this.getJobs('Last', panel);
                    }
                    break;
                case 'Prev':
                    this.page -= 1;
                    if (this.page === 0) {
                        choice = 'First';
                        return this.getJobs('First', panel);
                    }
                    break;
                case 'First':
                    this.page = 0;
                    break;
                case 'Last':
                    this.page = this.lastPage;
                    break;
            }

            let jobs: JobData[] = [];

            if (this._pipelineName) {
                jobs = await this.fetchInternalJobByName(this._pipelineName, this.page, this.row);
                const filteredJobs = jobs.filter(job => 
                    job.agenttaskname?.toLowerCase() === job.jobmetadata?.taskName?.toLowerCase()
                );
                this.sortByLatest(filteredJobs);
            } else if (this._internalJob) {
                jobs = await this.fetchInternalJobByName2(this._internalJob, this.page, this.row);
                this.sortByLatest(jobs);
            }

            this.updateJobsInWebview(panel);

        } catch (error: any) {
            console.error('Error fetching jobs:', error);
            this.jobList = [];
            this.updateJobsInWebview(panel);
        }
    }

    /**
     * Sort jobs by latest (equivalent to sortByLatest)
     */
    private sortByLatest(jobData: JobData[]): void {
        if (!this.isValidJobData(jobData)) {
            this.jobList = [];
            return;
        }

        this.jobList = jobData.sort((a, b) => {
            const dateA = a.submittedOn ? new Date(a.submittedOn).getTime() : 0;
            const dateB = b.submittedOn ? new Date(b.submittedOn).getTime() : 0;
            return dateB - dateA;
        });

        // Process job metadata and dates
        this.jobList.forEach((job, index) => {
            if (job.jobmetadata && typeof job.jobmetadata === 'string') {
                try {
                    this.jobList[index].jobmetadata = JSON.parse(job.jobmetadata);
                } catch (error) {
                    console.error('Error parsing jobmetadata for job at index', index, ':', error);
                }
            }

            if (this.jobList[index].submittedOn) {
                this.jobList[index].submittedOn = this.jobList[index].submittedOn.split('+')[0];
            }
            if (this.jobList[index].finishtime) {
                this.jobList[index].finishtime = this.jobList[index].finishtime.split('+')[0];
            }
        });
    }

    /**
     * Validate job data
     */
    private isValidJobData(jobData: any): boolean {
        if (!jobData) {
            console.warn('Job data is null or undefined');
            return false;
        }
        if (!Array.isArray(jobData)) {
            console.warn('Job data is not an array');
            return false;
        }
        if (jobData.length === 0) {
            console.warn('Job data array is empty');
            return false;
        }
        return true;
    }

    /**
     * Show console/logs for a job (equivalent to showConsole)
     */
    private async showConsole(jobId: string, runtime: string, status: string, job: any, panel: vscode.WebviewPanel): Promise<void> {
        try {
            if (this._internalJob) {
                await this.fetchInternalJobLogs(jobId, status, panel);
            } else {
                await this.fetchSparkJobLogs(jobId, runtime, status, panel);
            }
        } catch (error: any) {
            console.error('Error showing console:', error);
            vscode.window.showErrorMessage(`Failed to show logs: ${error.message}`);
        }
    }

    /**
     * Fetch internal job logs
     */
    private async fetchInternalJobLogs(jobId: string, status: string, panel: vscode.WebviewPanel): Promise<void> {
        try {
            const response = await this.fetchInternalJob(jobId, 0, 50, status);
            if (response) {
                this.currentJob = response;
                await this.processJobData(jobId, 'internal jobs', this.currentJob.jobStatus, panel);
                
                // Start polling if job is running
                if (this.currentJob.status === 'STARTED' || this.currentJob.status === 'RUNNING') {
                    this.startJobPolling(jobId, status, 'internal');
                }
            }
        } catch (error: any) {
            console.error('Error fetching internal job logs:', error);
            this.currentJob = { status: 'ERROR' };
        }
    }

    /**
     * Fetch Spark job logs
     */
    private async fetchSparkJobLogs(jobId: string, runtime: string, status: string, panel: vscode.WebviewPanel): Promise<void> {
        try {
            const response = await this.fetchSparkJob(jobId, 0, runtime, 0, status, false);
            if (response) {
                this.currentJob = response;
                await this.processJobData(jobId, 'pipeline', this.currentJob.jobStatus, panel);
                
                // Start polling if job is running
                if (this.currentJob.status === 'STARTED' || this.currentJob.status === 'RUNNING') {
                    this.startJobPolling(jobId, status, 'spark', runtime);
                }
            }
        } catch (error: any) {
            console.error('Error fetching Spark job logs:', error);
            this.currentJob = { status: 'ERROR' };
        }
    }

    /**
     * Process job data for display
     */
    private async processJobData(jobId: string, jobType: string, status: string, panel: vscode.WebviewPanel): Promise<void> {
        this.logsdata = [];
        if (this.currentJob) {
            for (const key in this.currentJob) {
                this.logsdata.push({ name: key, value: this.currentJob[key] });
            }
        }
        
        // Open detailed log dialog
        await this.openLogDialog(jobId, jobType, status, this.logsdata);
    }

    /**
     * Start job polling for running jobs
     */
    private startJobPolling(jobId: string, status: string, type: 'internal' | 'spark', runtime?: string): void {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }

        this.timeInterval = setInterval(async () => {
            try {
                if (type === 'internal') {
                    await this.fetchInternalJob(jobId, 0, 50, status);
                } else {
                    await this.fetchSparkJob(jobId, 0, runtime || '', 50, status, false);
                }

                if (this.currentJob.status !== 'STARTED' && this.currentJob.status !== 'RUNNING') {
                    if (this.timeInterval) {
                        clearInterval(this.timeInterval);
                        this.timeInterval = undefined;
                    }
                }
            } catch (error) {
                console.error('Error polling job status:', error);
                if (this.timeInterval) {
                    clearInterval(this.timeInterval);
                    this.timeInterval = undefined;
                }
            }
        }, 10000); // Poll every 10 seconds
    }

    /**
     * Open log dialog (equivalent to openDialog)
     */
    private async openLogDialog(jobId: string, jobType: string, status: string, data: JobLogData[]): Promise<void> {
        const logPanel = vscode.window.createWebviewPanel(
            'jobLogDetails',
            `Job Log Details: ${jobId}`,
            vscode.ViewColumn.Active,
            {
                enableScripts: true,
                localResourceRoots: [this._extensionUri],
                retainContextWhenHidden: true
            }
        );

        logPanel.webview.html = this.getJobLogDetailsHtml(jobId, jobType, status, data);

        // Handle message for refreshing logs
        logPanel.webview.onDidReceiveMessage(
            async (message) => {
                if (message.command === 'refreshLogs') {
                    // Refresh the log data
                    await this.processJobData(jobId, jobType, status, logPanel);
                }
            },
            undefined,
            this._context.subscriptions
        );
    }

    /**
     * Stop a job (equivalent to stopJob)
     */
    private async stopJob(jobId: string, panel: vscode.WebviewPanel): Promise<void> {
        try {
            const response = await this.stopPipeline(jobId);
            vscode.window.showInformationMessage('Stop Event Triggered!');
            console.log(response, 'stopjob response');
            await this.onRefresh(panel);
        } catch (error: any) {
            console.error('Error stopping job:', error);
            vscode.window.showErrorMessage('Error stopping job!');
        }
    }

    /**
     * Show output artifacts (equivalent to showOutputArtifact)
     */
    private async showOutputArtifact(jobId: string): Promise<void> {
        try {
            const response = await this.fetchOutputArtifacts(jobId);
            
            const artifactsPanel = vscode.window.createWebviewPanel(
                'outputArtifacts',
                `Output Artifacts: ${jobId}`,
                vscode.ViewColumn.Active,
                {
                    enableScripts: true,
                    localResourceRoots: [this._extensionUri],
                    retainContextWhenHidden: true
                }
            );

            artifactsPanel.webview.html = this.getOutputArtifactsHtml(jobId, response);
        } catch (error: any) {
            console.error('Error showing output artifacts:', error);
            vscode.window.showErrorMessage(`Failed to show output artifacts: ${error.message}`);
        }
    }

    /**
     * Update jobs in webview
     */
    private updateJobsInWebview(panel: vscode.WebviewPanel): void {
        panel.webview.postMessage({
            command: 'updateJobs',
            jobs: this.jobList,
            totalJobs: this.totalJobs,
            currentPage: this.page,
            lastPage: this.lastPage
        });
    }

    // API Methods (equivalent to Angular service calls)

    private async fetchInternalJobLenByName(jobName: string): Promise<number> {
        const httpsAgent = new https.Agent({ rejectUnauthorized: false });
        const headers = this.getHeaders();

        const response = await axios.get(`/api/aip/service/v1/jobs/internal/${jobName}/count`, {
            baseURL: 'http://localhost:8087',
            headers,
            httpsAgent,
            timeout: 10000
        });

        return Number(response.data);
    }

    private async getJobsByStreamingServiceLen(serviceName: string): Promise<number> {
        const httpsAgent = new https.Agent({ rejectUnauthorized: false });
        const headers = this.getHeaders();

        const response = await axios.get(`/api/aip/service/v1/jobs/streamingLen/${serviceName}/${this._organization}`, {
            baseURL: 'http://localhost:8087',
            headers,
            httpsAgent,
            timeout: 10000
        });

        return Number(response.data);
    }

    private async fetchInternalJobByName(jobName: string, page: number, size: number): Promise<JobData[]> {
        const httpsAgent = new https.Agent({ rejectUnauthorized: false });
        const headers = this.getHeaders();

        const response = await axios.get(`/api/aip/jobs/${jobName}/${this._organization}?page=${page}&size=${size}`, {
            baseURL: 'http://localhost:8087',
            headers,
            httpsAgent,
            timeout: 10000
        });

        return response.data || [];
    }

    private async fetchInternalJobByName2(internalJob: string, page: number, size: number): Promise<JobData[]> {
        const httpsAgent = new https.Agent({ rejectUnauthorized: false });
        const headers = this.getHeaders();

        const response = await axios.get(`/api/aip/service/v1/jobs/internal2/${internalJob}?page=${page}&size=${size}`, {
            baseURL: 'http://localhost:8087',
            headers,
            httpsAgent,
            timeout: 10000
        });

        return response.data || [];
    }

    private async fetchInternalJob(jobId: string, lineNumber: number, size: number, status: string): Promise<any> {
        const httpsAgent = new https.Agent({ rejectUnauthorized: false });
        const headers = this.getHeaders();

        const response = await axios.get(`/api/aip/service/v1/jobs/internal/${jobId}/logs?line=${lineNumber}&size=${size}&status=${status}`, {
            baseURL: 'http://localhost:8087',
            headers,
            httpsAgent,
            timeout: 10000
        });

        return JSON.parse(response.data);
    }

    private async fetchSparkJob(jobId: string, lineNumber: number, runtime: string, size: number, status: string, isBackground: boolean): Promise<any> {
        const httpsAgent = new https.Agent({ rejectUnauthorized: false });
        const headers = this.getHeaders();

        const response = await axios.get(`/api/aip/service/v1/jobs/spark/${jobId}/logs?line=${lineNumber}&runtime=${runtime}&size=${size}&status=${status}&background=${isBackground}`, {
            baseURL: 'http://localhost:8087',
            headers,
            httpsAgent,
            timeout: 10000
        });

        return JSON.parse(response.data);
    }

    private async stopPipeline(jobId: string): Promise<any> {
        const httpsAgent = new https.Agent({ rejectUnauthorized: false });
        const headers = this.getHeaders();

        const response = await axios.post(`/api/aip/service/v1/jobs/${jobId}/stop`, {}, {
            baseURL: 'http://localhost:8087',
            headers,
            httpsAgent,
            timeout: 10000
        });

        return response.data;
    }

    private async fetchOutputArtifacts(jobId: string): Promise<any> {
        const httpsAgent = new https.Agent({ rejectUnauthorized: false });
        const headers = this.getHeaders();

        const response = await axios.get(`/api/aip/service/v1/jobs/${jobId}/artifacts`, {
            baseURL: 'http://localhost:8087',
            headers,
            httpsAgent,
            timeout: 10000
        });

        return response.data;
    }

    private getHeaders() {
        return {
            'Accept': 'application/json, text/plain, */*',
            'Authorization': `Bearer ${this._token}`,
            'Content-Type': 'application/json',
            'Project': '2',
            'ProjectName': this._organization,
            'X-Requested-With': 'Leap',
        };
    }

    /**
     * Generate HTML for job logs viewer (main table view)
     */
    private getJobLogsHtml(): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Job Logs</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    padding: 16px;
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                }
                
                .title-jobs {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    font-size: 18px;
                    font-weight: bold;
                }
                
                .refresh-btn {
                    background: none;
                    border: none;
                    color: var(--vscode-foreground);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 4px;
                }
                
                .refresh-btn:hover {
                    background-color: var(--vscode-toolbar-hoverBackground);
                    color: #0056b3;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 16px;
                    background-color: var(--vscode-editor-background);
                }
                
                th, td {
                    padding: 12px 8px;
                    text-align: left;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    font-size: 14px;
                }
                
                th {
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                    font-weight: 600;
                    position: sticky;
                    top: 0;
                }
                
                tr:hover {
                    background-color: var(--vscode-list-hoverBackground);
                }
                
                .badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: uppercase;
                }
                
                .badge-error {
                    background-color: var(--vscode-errorForeground);
                    color: white;
                }
                
                .badge-active {
                    background-color: var(--vscode-testing-iconPassed);
                    color: white;
                }
                
                .badge-warning {
                    background-color: var(--vscode-list-warningForeground);
                    color: white;
                }
                
                .action-btn {
                    background: none;
                    border: none;
                    color: var(--vscode-foreground);
                    cursor: pointer;
                    padding: 6px;
                    margin: 0 2px;
                    border-radius: 4px;
                }
                
                .action-btn:hover {
                    background-color: var(--vscode-toolbar-hoverBackground);
                }
                
                .pagination {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 16px;
                }
                
                .pagination button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .pagination button:hover:not(:disabled) {
                    background-color: var(--vscode-button-hoverBackground);
                }
                
                .pagination button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .trigger-tag {
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                    margin-top: 4px;
                }
                
                .job-id {
                    font-family: monospace;
                    font-size: 13px;
                }
                
                .loading {
                    text-align: center;
                    padding: 40px;
                    color: var(--vscode-descriptionForeground);
                }
            </style>
        </head>
        <body>
            <div class="title-jobs">
                <span>Total Jobs: <span id="totalJobs">0</span></span>
                <button class="refresh-btn" onclick="refresh()" title="Refresh">
                    🔄
                </button>
            </div>
            
            <div id="loadingContainer" class="loading">
                Loading jobs...
            </div>
            
            <div id="tableContainer" style="display: none;">
                <table>
                    <thead>
                        <tr>
                            <th>Job Id</th>
                            <th>Submitted By</th>
                            <th>Submitted On</th>
                            <th>Completed On</th>
                            <th>Runtime</th>
                            <th>Status</th>
                            <th>Action</th>
                            <th>Output Artifacts</th>
                        </tr>
                    </thead>
                    <tbody id="jobsTableBody">
                    </tbody>
                </table>
                
                <div class="pagination">
                    <button id="firstBtn" onclick="getJobs('First')">First</button>
                    <button id="prevBtn" onclick="getJobs('Prev')">&lt;&lt; Prev</button>
                    <button id="nextBtn" onclick="getJobs('Next')">Next &gt;&gt;</button>
                    <button id="lastBtn" onclick="getJobs('Last')">Last</button>
                </div>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                
                let currentJobs = [];
                let currentPage = 0;
                let lastPage = 0;
                
                function refresh() {
                    vscode.postMessage({ command: 'refresh' });
                    showLoading();
                }
                
                function getJobs(choice) {
                    vscode.postMessage({ command: 'getJobs', choice: choice });
                }
                
                function showConsole(jobId, runtime, status, job) {
                    vscode.postMessage({ 
                        command: 'showConsole', 
                        jobId: jobId, 
                        runtime: runtime, 
                        status: status, 
                        job: job 
                    });
                }
                
                function stopJob(jobId) {
                    if (confirm('Are you sure you want to stop this job?')) {
                        vscode.postMessage({ command: 'stopJob', jobId: jobId });
                    }
                }
                
                function showOutputArtifact(jobId) {
                    vscode.postMessage({ command: 'showOutputArtifact', jobId: jobId });
                }
                
                function showLoading() {
                    document.getElementById('loadingContainer').style.display = 'block';
                    document.getElementById('tableContainer').style.display = 'none';
                }
                
                function hideLoading() {
                    document.getElementById('loadingContainer').style.display = 'none';
                    document.getElementById('tableContainer').style.display = 'block';
                }
                
                function formatDate(dateString) {
                    if (!dateString) return '-';
                    const date = new Date(dateString);
                    return date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
                
                function getStatusBadgeClass(status) {
                    switch (status) {
                        case 'ERROR':
                        case 'CANCELLED':
                            return 'badge-error';
                        case 'COMPLETED':
                            return 'badge-active';
                        case 'RUNNING':
                        case 'OPEN':
                            return 'badge-warning';
                        default:
                            return 'badge-active';
                    }
                }
                
                function updatePaginationButtons() {
                    document.getElementById('firstBtn').disabled = currentPage === 0;
                    document.getElementById('prevBtn').disabled = currentPage === 0;
                    document.getElementById('nextBtn').disabled = currentPage === lastPage;
                    document.getElementById('lastBtn').disabled = currentPage === lastPage;
                }
                
                function renderJobs(jobs) {
                    const tbody = document.getElementById('jobsTableBody');
                    tbody.innerHTML = '';
                    
                    jobs.forEach(job => {
                        const row = document.createElement('tr');
                        
                        const triggerType = job.jobmetadata && job.jobmetadata.tag === 'EVENT' ? 'Event triggered' : 'User triggered';
                        
                        row.innerHTML = \`
                            <td class="job-id">\${job.id || job.jobId}</td>
                            <td>
                                <div>\${job.submittedBy || '-'}</div>
                                <div class="trigger-tag">\${triggerType}</div>
                            </td>
                            <td>\${formatDate(job.submittedOn)}</td>
                            <td>\${formatDate(job.finishtime)}</td>
                            <td>\${job.runtime || '-'}</td>
                            <td>
                                <span class="badge \${getStatusBadgeClass(job.jobStatus)}">\${job.jobStatus}</span>
                            </td>
                            <td>
                                <button class="action-btn" onclick="showConsole('\${job.jobId}', '\${job.runtime}', '\${job.jobStatus}', \${JSON.stringify(job).replace(/"/g, '&quot;')})" title="View Logs">
                                    📄
                                </button>
                                \${job.jobStatus === 'RUNNING' && job.jobmetadata !== 'CHAIN' ? 
                                    \`<button class="action-btn" onclick="stopJob('\${job.jobId}')" title="Stop Job">⏹️</button>\` : 
                                    ''
                                }
                            </td>
                            <td>
                                \${job.runtime && (job.runtime.toLowerCase() === 'remote' || job.runtime.split('-')[0].toLowerCase() === 'remote') ? 
                                    \`<button class="action-btn" onclick="showOutputArtifact('\${job.jobId}')" title="Show Output Artifacts">📊</button>\` : 
                                    '-'
                                }
                            </td>
                        \`;
                        
                        tbody.appendChild(row);
                    });
                }
                
                // Handle messages from extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    switch (message.command) {
                        case 'updateJobs':
                            currentJobs = message.jobs;
                            currentPage = message.currentPage;
                            lastPage = message.lastPage;
                            
                            document.getElementById('totalJobs').textContent = message.totalJobs;
                            renderJobs(currentJobs);
                            updatePaginationButtons();
                            hideLoading();
                            break;
                    }
                });
                
                // Initialize
                showLoading();
            </script>
        </body>
        </html>`;
    }

    /**
     * Generate HTML for job log details (equivalent to JobDataViewerComponent)
     */
    private getJobLogDetailsHtml(jobId: string, jobType: string, status: string, logData: JobLogData[]): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Job Log Details - ${jobId}</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    padding: 16px;
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                }
                
                .header {
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                    padding: 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                }
                
                .header h2 {
                    margin: 0 0 8px 0;
                    color: var(--vscode-foreground);
                }
                
                .header-info {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }
                
                .info-item {
                    display: flex;
                    flex-direction: column;
                }
                
                .info-label {
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                    margin-bottom: 4px;
                    text-transform: uppercase;
                    font-weight: 600;
                }
                
                .info-value {
                    font-size: 14px;
                    color: var(--vscode-foreground);
                    font-family: monospace;
                }
                
                .logs-container {
                    background-color: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 8px;
                    max-height: 60vh;
                    overflow-y: auto;
                }
                
                .log-entry {
                    display: flex;
                    padding: 8px 16px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                }
                
                .log-entry:hover {
                    background-color: var(--vscode-list-hoverBackground);
                }
                
                .log-key {
                    font-weight: 600;
                    min-width: 150px;
                    color: var(--vscode-symbolIcon-keywordForeground);
                    font-size: 13px;
                }
                
                .log-value {
                    flex: 1;
                    font-family: monospace;
                    font-size: 13px;
                    white-space: pre-wrap;
                    word-break: break-all;
                }
                
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: uppercase;
                }
                
                .status-running {
                    background-color: var(--vscode-list-warningForeground);
                    color: white;
                }
                
                .status-completed {
                    background-color: var(--vscode-testing-iconPassed);
                    color: white;
                }
                
                .status-error {
                    background-color: var(--vscode-errorForeground);
                    color: white;
                }
                
                .refresh-btn {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-bottom: 16px;
                }
                
                .refresh-btn:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Job Log Details</h2>
                <div class="header-info">
                    <div class="info-item">
                        <div class="info-label">Job ID</div>
                        <div class="info-value">${jobId}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Job Type</div>
                        <div class="info-value">${jobType}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Status</div>
                        <div class="info-value">
                            <span class="status-badge status-${status.toLowerCase()}">${status}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <button class="refresh-btn" onclick="refreshLogs()">🔄 Refresh Logs</button>
            
            <div class="logs-container">
                ${logData.map(entry => `
                    <div class="log-entry">
                        <div class="log-key">${entry.name}:</div>
                        <div class="log-value">${typeof entry.value === 'object' ? JSON.stringify(entry.value, null, 2) : entry.value}</div>
                    </div>
                `).join('')}
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                
                function refreshLogs() {
                    vscode.postMessage({ command: 'refreshLogs' });
                }
            </script>
        </body>
        </html>`;
    }

    /**
     * Generate HTML for output artifacts (equivalent to ShowOutputArtifactsComponent)
     */
    private getOutputArtifactsHtml(jobId: string, artifactsData: any): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Output Artifacts - ${jobId}</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    padding: 16px;
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                }
                
                .header {
                    margin-bottom: 20px;
                }
                
                .artifacts-container {
                    background-color: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 8px;
                    padding: 16px;
                }
                
                .artifact-item {
                    padding: 12px;
                    margin: 8px 0;
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                    border-radius: 6px;
                    border-left: 4px solid var(--vscode-button-background);
                }
                
                .artifact-name {
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: var(--vscode-symbolIcon-keywordForeground);
                }
                
                .artifact-content {
                    font-family: monospace;
                    font-size: 13px;
                    white-space: pre-wrap;
                    background-color: var(--vscode-editor-background);
                    padding: 8px;
                    border-radius: 4px;
                    border: 1px solid var(--vscode-panel-border);
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Output Artifacts for Job: ${jobId}</h2>
            </div>
            
            <div class="artifacts-container">
                ${Array.isArray(artifactsData) ? 
                    artifactsData.map((artifact, index) => `
                        <div class="artifact-item">
                            <div class="artifact-name">Artifact ${index + 1}</div>
                            <div class="artifact-content">${typeof artifact === 'object' ? JSON.stringify(artifact, null, 2) : artifact}</div>
                        </div>
                    `).join('') :
                    `<div class="artifact-item">
                        <div class="artifact-name">Output Data</div>
                        <div class="artifact-content">${typeof artifactsData === 'object' ? JSON.stringify(artifactsData, null, 2) : artifactsData}</div>
                    </div>`
                }
            </div>
        </body>
        </html>`;
    }

    /**
     * Handle messages from the panel webview
     */
    public async handlePanelMessage(message: any, webviewView: vscode.WebviewView): Promise<void> {
        // Convert WebviewView to WebviewPanel-like interface for compatibility
        const panelLike = {
            webview: webviewView.webview
        } as vscode.WebviewPanel;

        // Reuse existing message handling logic
        await this.handleWebviewMessage(message, panelLike);
    }

    /**
     * Set webview content for the panel view
     */
    public setWebviewContent(webviewView: vscode.WebviewView): void {
        webviewView.webview.html = this.getJobLogsHtml();
        
        // Initialize jobs if we have panel-like interface
        const panelLike = {
            webview: webviewView.webview
        } as vscode.WebviewPanel;

        this.initializeJobs(panelLike);
    }

    /**
     * Show job logs in panel (alternative to showJobLogsViewer)
     */
    public async showJobLogsInPanel(): Promise<void> {
        // This method will be called by the panel provider
        // The actual implementation is handled by the panel provider
        // which calls setWebviewContent
    }
}