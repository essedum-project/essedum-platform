// Job Logs Viewer - Client-side JavaScript
const vscode = acquireVsCodeApi();

let currentJobs = [];
let currentPage = 0;
let lastPage = 0;

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
    console.log('renderJobs called with', jobs.length, 'jobs');
    const tbody = document.getElementById('jobsTableBody');
    tbody.innerHTML = '';

    jobs.forEach((job, index) => {
        console.log('Rendering job', index, ':', job);
        const row = document.createElement('tr');

        const triggerType = job.jobmetadata && job.jobmetadata.tag === 'EVENT' ? 'Event triggered' : 'User triggered';

        const showStopButton = job.jobStatus === 'RUNNING' && job.jobmetadata !== 'CHAIN';
        console.log('Job', job.jobId, 'status:', job.jobStatus, 'show stop button:', showStopButton);

        row.innerHTML = `
            <td class="job-id">${job.id || job.jobId}</td>
            <td>
                <div>${job.submittedBy || '-'}</div>
                <div class="trigger-tag">${triggerType}</div>
            </td>
            <td>${formatDate(job.submittedOn)}</td>
            <td>${formatDate(job.finishtime)}</td>
            <td>${job.runtime || '-'}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(job.jobStatus)}">${job.jobStatus}</span>
            </td>
            <td>
                <button class="action-btn" onclick="showConsole('${job.jobId}', '${job.runtime}', '${job.jobStatus}', ${JSON.stringify(job).replace(/"/g, '&quot;')})" title="View Logs">
                    📄
                </button>
                ${job.jobStatus === 'RUNNING' && job.jobmetadata !== 'CHAIN' ?
                `<button class="action-btn" onclick="stopJob('${job.jobId}')" title="Stop Job">⏹️</button>` :
                ''
            }
            </td>
            <td>
                ${job.runtime && (job.runtime.toLowerCase() === 'remote' || job.runtime.split('-')[0].toLowerCase() === 'remote') ?
                `<button class="action-btn" onclick="showOutputArtifact('${job.jobId}')" title="Show Output Artifacts">📊</button>` :
                '-'
            }
            </td>
        `;

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
