// Job Logs Viewer - Client-side JavaScript
const vscode = acquireVsCodeApi();

let currentJobs = [];
let currentPage = 0;
let lastPage = 0;

// Escape HTML special characters to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

function refresh() {
    console.log('Refresh function called');
    vscode.postMessage({ command: 'refresh' });
    console.log('Refresh message sent');
    showLoading();
}

function getJobs(choice) {
    vscode.postMessage({ command: 'getJobs', choice: choice });
}

function showConsole(jobId, runtime, status, job) {
    console.log('showConsole function called with:', { jobId, runtime, status, job });
    vscode.postMessage({
        command: 'showConsole',
        jobId: jobId,
        runtime: runtime,
        status: status,
        job: job
    });
    console.log('showConsole message sent');
}

function stopJob(jobId) {
    console.log('stopJob function called with jobId:', jobId);
    // Send message directly without confirmation - VS Code will handle confirmation
    console.log('Sending stopJob message to VS Code');
    vscode.postMessage({ command: 'stopJob', jobId: jobId });
    console.log('Message sent to VS Code');
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
    if (!dateString) { return '-'; }
    const date = new Date(dateString);
    // Use user's local time zone for display, include seconds
    const options = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    // Remove comma before time for a cleaner look
    let formatted = date.toLocaleString('en-US', options).replace(',', '');
    return formatted;
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
    console.log('renderJobs called with', jobs.length, 'jobs');
    const tbody = document.getElementById('jobsTableBody');
    tbody.innerHTML = '';

    jobs.forEach((job, index) => {
        console.log('Rendering job', index, ':', job);
        const row = document.createElement('tr');

        const triggerType = job.jobmetadata && job.jobmetadata.tag === 'EVENT' ? 'Event triggered' : 'User triggered';

        const showStopButton = job.jobStatus === 'RUNNING' && job.jobmetadata !== 'CHAIN';
        console.log('Job', job.jobId, 'status:', job.jobStatus, 'show stop button:', showStopButton);

        // Display column shows the numeric DB id; log/stop/artifact APIs expect the encoded jobId string.
        const actionJobId = job.jobId || job.id;

        const tdJobId = document.createElement('td');
        tdJobId.className = 'job-id';
        tdJobId.textContent = job.id || job.jobId;
        row.appendChild(tdJobId);

        const tdSubmittedBy = document.createElement('td');
        const divName = document.createElement('div');
        divName.textContent = job.submittedBy || '-';
        const divTrigger = document.createElement('div');
        divTrigger.className = 'trigger-tag';
        divTrigger.textContent = triggerType;
        tdSubmittedBy.appendChild(divName);
        tdSubmittedBy.appendChild(divTrigger);
        row.appendChild(tdSubmittedBy);

        const tdSubmittedOn = document.createElement('td');
        tdSubmittedOn.textContent = formatDate(job.submittedOn);
        row.appendChild(tdSubmittedOn);

        const tdFinishTime = document.createElement('td');
        tdFinishTime.textContent = formatDate(job.finishtime);
        row.appendChild(tdFinishTime);

        const tdRuntime = document.createElement('td');
        tdRuntime.textContent = job.runtime || '-';
        row.appendChild(tdRuntime);

        const tdStatus = document.createElement('td');
        const statusSpan = document.createElement('span');
        statusSpan.className = `badge ${getStatusBadgeClass(job.jobStatus)}`;
        statusSpan.textContent = job.jobStatus;
        tdStatus.appendChild(statusSpan);
        row.appendChild(tdStatus);

        const tdActions = document.createElement('td');
        const logsBtn = document.createElement('button');
        logsBtn.className = 'action-btn';
        logsBtn.title = 'View Logs';
        logsBtn.textContent = '📄';
        logsBtn.addEventListener('click', () => showConsole(actionJobId, job.runtime || '-', job.jobStatus, job));
        tdActions.appendChild(logsBtn);
        if (job.jobStatus === 'RUNNING' && job.jobmetadata !== 'CHAIN') {
            const stopBtn = document.createElement('button');
            stopBtn.className = 'action-btn';
            stopBtn.title = 'Stop Job';
            stopBtn.textContent = '⏹️';
            stopBtn.addEventListener('click', () => stopJob(actionJobId));
            tdActions.appendChild(stopBtn);
        }
        row.appendChild(tdActions);

        const tdArtifacts = document.createElement('td');
        if (job.runtime && (job.runtime.toLowerCase() === 'remote' || job.runtime.split('-')[0].toLowerCase() === 'remote')) {
            const artifactBtn = document.createElement('button');
            artifactBtn.className = 'action-btn';
            artifactBtn.title = 'Show Output Artifacts';
            artifactBtn.textContent = '📊';
            artifactBtn.addEventListener('click', () => showOutputArtifact(actionJobId));
            tdArtifacts.appendChild(artifactBtn);
        } else {
            tdArtifacts.textContent = '-';
        }
        row.appendChild(tdArtifacts);

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
