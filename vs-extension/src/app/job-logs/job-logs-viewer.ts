// Job Logs Viewer - VS Code Extension implementation
import * as vscode from 'vscode';
import axios from 'axios';
import { getBaseUrl } from '../../constants/api-config';
import { createHTTPSAgent } from '../../utils/ssl-config.util';
import * as path from 'path';
import * as fs from 'fs';
import * as ExtensionUtils from '../../utils/extension-utils';

const logger = ExtensionUtils.createLogger('JobLogsViewer');


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
    private role: any;
    private project: any;

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
        this.project = _context.globalState.get('project');
        this.role = _context.globalState.get('role');
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
            jobLogsPanel.webview.html = this.getJobLogsHtml(jobLogsPanel.webview);

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
        logger.info('Received webview message:', message);

        switch (message.command) {
            case 'refresh':
                logger.info('Handling refresh command');
                await this.onRefresh(panel);
                break;
            case 'getJobs':
                logger.info('Handling getJobs command:', message.choice);
                await this.getJobs(message.choice, panel);
                break;
            case 'showConsole':
                logger.info('Handling showConsole command for jobId:', message.jobId);
                await this.showConsole(message.jobId, message.runtime, message.status, message.job, panel);
                break;
            case 'stopJob':
                logger.info('Handling stopJob command for jobId:', message.jobId);
                await this.stopJob(message.jobId, panel);
                break;
            case 'showOutputArtifact':
                logger.info('Handling showOutputArtifact command for jobId:', message.jobId);
                await this.showOutputArtifact(message.jobId);
                break;
            default:
                logger.info('Unknown command received:', message.command);
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
            // Use the new console API to fetch job logs
            await this.fetchConsoleJobLogs(jobId, job, status, panel);
        } catch (error: any) {
            console.error('Error showing console:', error);
            vscode.window.showErrorMessage(`Failed to show logs: ${error.message}`);

            // Fallback to original methods if console API fails
            try {
                if (this._internalJob) {
                    await this.fetchInternalJobLogs(jobId, status, panel);
                } else {
                    await this.fetchSparkJobLogs(jobId, runtime, status, panel);
                }
            } catch (fallbackError: any) {
                console.error('Fallback method also failed:', fallbackError);
                vscode.window.showErrorMessage(`All log retrieval methods failed: ${fallbackError.message}`);
            }
        }
    }

    /**
     * Fetch console job logs using the new console API
     */
    private async fetchConsoleJobLogs(jobId: string, job: any, status: string, panel: vscode.WebviewPanel): Promise<void> {
        try {
            const response = await this.fetchConsoleJob(jobId, 0, 0, status, false);
            if (response) {
                this.currentJob = response;
                await this.processJobData(job.id, 'console', status, panel);

                // Start polling if job is running
                if (this.currentJob.status === 'STARTED' || this.currentJob.status === 'RUNNING') {
                    this.startConsoleJobPolling(jobId, status);
                }

                // Display the console logs in a new webview
                await this.displayConsoleLogs(job.id, response);
            }
        } catch (error: any) {
            console.error('Error fetching console job logs:', error);
            throw error; // Re-throw to trigger fallback
        }
    }

    /**
     * Start polling for console job logs
     */
    private startConsoleJobPolling(jobId: string, status: string): void {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }

        this.timeInterval = setInterval(async () => {
            try {
                await this.fetchConsoleJob(jobId, 0, 0, status, false);

                if (this.currentJob.status !== 'STARTED' && this.currentJob.status !== 'RUNNING') {
                    if (this.timeInterval) {
                        clearInterval(this.timeInterval);
                        this.timeInterval = undefined;
                    }
                }
            } catch (error) {
                console.error('Error polling console job status:', error);
                if (this.timeInterval) {
                    clearInterval(this.timeInterval);
                    this.timeInterval = undefined;
                }
            }
        }, 10000); // Poll every 10 seconds
    }

    /**
     * Display console logs in a new webview window
     */
    private async displayConsoleLogs(jobId: string, logData: any): Promise<void> {
        const consolePanel = vscode.window.createWebviewPanel(
            'consoleLogs',
            `Console Logs: ${jobId}`,
            vscode.ViewColumn.Active,
            {
                enableScripts: true,
                localResourceRoots: [this._extensionUri],
                retainContextWhenHidden: true
            }
        );

        consolePanel.webview.html = this.getConsoleLogsHtml(consolePanel.webview, jobId, logData);

        // Handle messages from the console logs webview
        consolePanel.webview.onDidReceiveMessage(
            async (message) => {
                if (message.command === 'refreshConsoleLogs') {
                    try {
                        const refreshedData = await this.fetchConsoleJob(jobId, 0, 0, 'ERROR', false);
                        consolePanel.webview.html = this.getConsoleLogsHtml(consolePanel.webview, jobId, refreshedData);
                    } catch (error: any) {
                        vscode.window.showErrorMessage(`Failed to refresh console logs: ${error.message}`);
                    }
                } else if (message.command === 'downloadLogs') {
                    await this.downloadConsoleLogs(jobId, logData);
                }
            },
            undefined,
            this._context.subscriptions
        );
    }

    /**
     * Download console logs to a file
     */
    private async downloadConsoleLogs(jobId: string, logData: any): Promise<void> {
        try {
            const logContent = typeof logData === 'string' ? logData : JSON.stringify(logData, null, 2);
            const fileName = `console-logs-${jobId}-${new Date().getTime()}.txt`;

            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file(fileName),
                filters: {
                    'Text files': ['txt'],
                    'JSON files': ['json'],
                    'All files': ['*']
                }
            });

            if (uri) {
                await vscode.workspace.fs.writeFile(uri, Buffer.from(logContent, 'utf8'));
                vscode.window.showInformationMessage(`Console logs saved to ${uri.fsPath}`);
            }
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to download logs: ${error.message}`);
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
                await this.processJobData(this.currentJob.id, 'pipeline', this.currentJob.jobStatus, panel);

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

        logPanel.webview.html = this.getJobLogDetailsHtml(logPanel.webview, jobId, jobType, status, data);

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
        logger.info('stopJob called with jobId:', jobId);

        // Show confirmation dialog using VS Code's native dialog
        const confirmResult = await vscode.window.showWarningMessage(
            `Are you sure you want to stop job ${jobId}?`,
            { modal: true },
            'Yes, Stop Job'
        );

        if (confirmResult !== 'Yes, Stop Job') {
            logger.info('User cancelled stop job operation');
            return;
        }

        vscode.window.showInformationMessage(`Attempting to stop job: ${jobId}`);

        try {
            logger.info('Calling stopPipeline API...');
            const response = await this.stopPipeline(jobId);
            logger.info('stopPipeline API response:', response);

            vscode.window.showInformationMessage('Stop Event Triggered!');
            logger.info(response, 'stopjob response');

            logger.info('Refreshing job list...');
            await this.onRefresh(panel);
            logger.info('Job list refreshed successfully');
        } catch (error: any) {
            console.error('Error stopping job:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            vscode.window.showErrorMessage(`Error stopping job: ${error.message || 'Unknown error'}`);
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

            artifactsPanel.webview.html = this.getOutputArtifactsHtml(artifactsPanel.webview, jobId, response);
        } catch (error: any) {
            console.error('Error showing output artifacts:', error);
            vscode.window.showErrorMessage(`Failed to show output artifacts: ${error.message}`);
        }
    }

    /**
     * Update jobs in webview
     */
    private updateJobsInWebview(panel: vscode.WebviewPanel): void {
        logger.info('updateJobsInWebview called with jobs:', this.jobList.length);
        logger.info('Sample job data:', this.jobList[0]);

        panel.webview.postMessage({
            command: 'updateJobs',
            jobs: this.jobList,
            totalJobs: this.totalJobs,
            currentPage: this.page,
            lastPage: this.lastPage
        });

        logger.info('Posted updateJobs message to webview');
    }

    // API Methods (

    private async fetchInternalJobLenByName(jobName: string): Promise<number> {
        const httpsAgent = createHTTPSAgent(this._context);
        const headers = this.getHeaders();

        const response = await axios.get(`/api/aip/service/v1/jobs/internal/${jobName}/count`, {
            baseURL: getBaseUrl(),
            headers,
            httpsAgent,
            timeout: 10000
        });

        return Number(response.data);
    }

    private async getJobsByStreamingServiceLen(serviceName: string): Promise<number> {
        const httpsAgent = createHTTPSAgent(this._context);
        const headers = this.getHeaders();

        const response = await axios.get(`/api/aip/service/v1/jobs/streamingLen/${serviceName}/${this.project.name}`, {
            baseURL: getBaseUrl(),
            headers,
            httpsAgent,
            timeout: 10000
        });

        return Number(response.data);
    }

    private async fetchInternalJobByName(jobName: string, page: number, size: number): Promise<JobData[]> {
        const httpsAgent = createHTTPSAgent(this._context);
        const headers = this.getHeaders();

        const response = await axios.get(`/api/aip/jobs/${jobName}/${this.project.name}?page=${page}&size=${size}`, {
            baseURL: getBaseUrl(),
            headers,
            httpsAgent,
            timeout: 10000
        });

        return response.data || [];
    }

    private async fetchInternalJobByName2(internalJob: string, page: number, size: number): Promise<JobData[]> {
        const httpsAgent = createHTTPSAgent(this._context);
        const headers = this.getHeaders();

        const response = await axios.get(`/api/aip/service/v1/jobs/internal2/${internalJob}?page=${page}&size=${size}`, {
            baseURL: getBaseUrl(),
            headers,
            httpsAgent,
            timeout: 10000
        });

        return response.data || [];
    }

    private async fetchInternalJob(jobId: string, lineNumber: number, size: number, status: string): Promise<any> {
        const httpsAgent = createHTTPSAgent(this._context);
        const headers = this.getHeaders();

        const response = await axios.get(`/api/aip/service/v1/jobs/internal/${jobId}/logs?line=${lineNumber}&size=${size}&status=${status}`, {
            baseURL: getBaseUrl(),
            headers,
            httpsAgent,
            timeout: 10000
        });

        return JSON.parse(response.data);
    }

    private async fetchSparkJob(jobId: string, lineNumber: number, runtime: string, size: number, status: string, isBackground: boolean): Promise<any> {
        const httpsAgent = createHTTPSAgent(this._context);
        const headers = this.getHeaders();

        const response = await axios.get(`/api/aip/service/v1/jobs/spark/${jobId}/logs?line=${lineNumber}&runtime=${runtime}&size=${size}&status=${status}&background=${isBackground}`, {
            baseURL: getBaseUrl(),
            headers,
            httpsAgent,
            timeout: 10000
        });

        return JSON.parse(response.data);
    }

    /**
     * Fetch console logs for a job using the console API endpoint
     */
    private async fetchConsoleJob(jobId: string, offset: number = 0, lineno: number = 0, status: string = 'ERROR', readconsole: boolean = false): Promise<any> {
        const httpsAgent = createHTTPSAgent(this._context);
        const headers = this.getConsoleHeaders();

        const response = await axios.get(`/api/aip/jobs/console/${jobId}?offset=${offset}&org=${this.project.name}&lineno=${lineno}&status=${status}&readconsole=${readconsole}`, {
            baseURL: getBaseUrl(),
            headers,
            httpsAgent,
            timeout: 10000
        });

        return response.data;
    }

    private async stopPipeline(jobId: string): Promise<any> {
        logger.info('stopPipeline called with jobId:', jobId);
        logger.info('BASE_URL:', getBaseUrl());
        logger.info('Organization:', this.project.name);

        const httpsAgent = createHTTPSAgent(this._context);
        const headers = this.getHeaders();
        logger.info('Request headers:', headers);

        const url = `/api/aip/service/v1/jobs/stopJob/${jobId}`;
        logger.info('Making GET request to:', `${getBaseUrl()}${url}`);

        try {
            const response = await axios.get(url, {
                baseURL: getBaseUrl(),
                headers,
                httpsAgent,
                timeout: 10000
            });

            logger.info('stopPipeline API response status:', response.status);
            logger.info('stopPipeline API response data:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('stopPipeline API error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            throw error;
        }
    }

    private async fetchOutputArtifacts(jobId: string): Promise<any> {
        const httpsAgent = createHTTPSAgent(this._context);
        const headers = this.getHeaders();

        const response = await axios.get(`/api/aip/service/v1/jobs/outputArtifacts/${jobId}`, {
            baseURL: getBaseUrl(),
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
            'Project': this.project?.id,
            'ProjectName': this.project?.name,
            'X-Requested-With': 'Leap',
        };
    }

    private getConsoleHeaders() {
        return {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9',
            'authorization': `Bearer ${this._token}`,
            'content-type': 'application/json',
            'priority': 'u=1, i',
            'project': this.project?.id,
            'projectname': this.project?.name,
            'referer': `${getBaseUrl()}/`,
            'roleid': this.role?.id || '',
            'rolename': this.role?.name || '',
            'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
            'x-requested-with': 'Leap'
        };
    }

    /**
     * Load HTML template from file
     */
    private loadHtmlTemplate(templateName: string): string {
        // Check if we're in development or production
        const isDevelopment = fs.existsSync(path.join(this._context.extensionPath, 'src'));
        const baseFolder = isDevelopment ? 'src' : 'dist';

        const templatePath = path.join(
            this._context.extensionPath,
            baseFolder,
            'app',
            'job-logs',
            templateName
        );
        return fs.readFileSync(templatePath, 'utf8');
    }

    /**
     * Get nonce for CSP
     */
    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    /**
     * Generate HTML for job logs viewer (main table view)
     */
    private getJobLogsHtml(webview: vscode.Webview): string {
        const nonce = this.getNonce();

        // Check if we're in development or production
        const isDevelopment = fs.existsSync(path.join(this._extensionUri.fsPath, 'src'));
        const baseFolder = isDevelopment ? 'src' : 'dist';

        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, baseFolder, 'app', 'job-logs', 'job-logs-viewer.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, baseFolder, 'app', 'job-logs', 'job-logs-viewer-client.js'));

        let html = this.loadHtmlTemplate('job-logs-viewer.html');

        html = html.replace(/{{nonce}}/g, nonce);
        html = html.replace(/{{cssUri}}/g, styleUri.toString());
        html = html.replace(/{{scriptUri}}/g, scriptUri.toString());

        return html;
    }

    /**
     * Generate HTML for job log details (equivalent to JobDataViewerComponent)
     */
    private getJobLogDetailsHtml(webview: vscode.Webview, jobId: string, jobType: string, status: string, logData: JobLogData[]): string {
        const nonce = this.getNonce();

        // Check if we're in development or production
        const isDevelopment = fs.existsSync(path.join(this._extensionUri.fsPath, 'src'));
        const baseFolder = isDevelopment ? 'src' : 'dist';

        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, baseFolder, 'app', 'job-logs', 'job-logs-viewer.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, baseFolder, 'app', 'job-logs', 'job-log-details-client.js'));

        let html = this.loadHtmlTemplate('job-log-details.html');

        const logEntries = logData.map(entry => `
            <div class="log-entry">
                <div class="log-key">${this.escapeHtml(entry.name)}:</div>
                <div class="log-value">${typeof entry.value === 'object' ? this.escapeHtml(JSON.stringify(entry.value, null, 2)) : this.escapeHtml(String(entry.value))}</div>
            </div>
        `).join('');

        html = html.replace(/{{nonce}}/g, nonce);
        html = html.replace(/{{cssUri}}/g, styleUri.toString());
        html = html.replace(/{{scriptUri}}/g, scriptUri.toString());
        html = html.replace(/{{jobId}}/g, this.escapeHtml(jobId));
        html = html.replace(/{{jobType}}/g, this.escapeHtml(jobType));
        html = html.replace(/{{status}}/g, this.escapeHtml(status));
        html = html.replace(/{{statusLower}}/g, status.toLowerCase());
        html = html.replace(/{{logEntries}}/g, logEntries);

        return html;
    }

    /**
     * Generate HTML for output artifacts (equivalent to ShowOutputArtifactsComponent)
     */
    private getOutputArtifactsHtml(webview: vscode.Webview, jobId: string, artifactsData: any): string {
        // Check if we're in development or production
        const isDevelopment = fs.existsSync(path.join(this._extensionUri.fsPath, 'src'));
        const baseFolder = isDevelopment ? 'src' : 'dist';

        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, baseFolder, 'app', 'job-logs', 'job-logs-viewer.css'));

        let html = this.loadHtmlTemplate('output-artifacts.html');

        const artifactsContent = Array.isArray(artifactsData) ?
            artifactsData.map((artifact, index) => `
                <div class="artifact-item">
                    <div class="artifact-name">Artifact ${index + 1}</div>
                    <div class="artifact-content">${this.escapeHtml(typeof artifact === 'object' ? JSON.stringify(artifact, null, 2) : String(artifact))}</div>
                </div>
            `).join('') :
            `<div class="artifact-item">
                <div class="artifact-name">Output Data</div>
                <div class="artifact-content">${this.escapeHtml(typeof artifactsData === 'object' ? JSON.stringify(artifactsData, null, 2) : String(artifactsData))}</div>
            </div>`;

        html = html.replace(/{{cssUri}}/g, styleUri.toString());
        html = html.replace(/{{artifactsContent}}/g, artifactsContent);

        return html;
    }

    /**
     * Generate HTML for console logs viewer
     */
    private getConsoleLogsHtml(webview: vscode.Webview, jobId: string, logData: any): string {
        const nonce = this.getNonce();
        const logContent = typeof logData === 'string' ? logData : JSON.stringify(logData, null, 2);

        // Check if we're in development or production
        const isDevelopment = fs.existsSync(path.join(this._extensionUri.fsPath, 'src'));
        const baseFolder = isDevelopment ? 'src' : 'dist';

        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, baseFolder, 'app', 'job-logs', 'job-logs-viewer.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, baseFolder, 'app', 'job-logs', 'console-logs-client.js'));

        let html = this.loadHtmlTemplate('console-logs.html');

        const logContentHtml = logContent ?
            `<div class="log-content" id="logContent">${this.escapeHtml(logContent)}</div>` :
            `<div class="empty-logs">No console logs available for this job.</div>`;

        html = html.replace(/{{nonce}}/g, nonce);
        html = html.replace(/{{cssUri}}/g, styleUri.toString());
        html = html.replace(/{{scriptUri}}/g, scriptUri.toString());
        html = html.replace(/{{jobId}}/g, this.escapeHtml(jobId));
        html = html.replace(/{{logContent}}/g, logContentHtml);

        return html;
    }

    /**
     * Escape HTML to prevent XSS
     */
    private escapeHtml(text: any): string {
        if (text === null || text === undefined) {
            return '';
        }
        const str = String(text);
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
}


