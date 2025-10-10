# Job Logs Viewer - Usage Guide

This VS Code extension now includes a comprehensive job logs viewer interface. The interface displays jobs in a table format with pagination, status badges, and various actions.

## Features

### 📊 Job Logs Table Interface
- **Job List Display**: Shows jobs in a table format with columns for:
  - Job ID (monospace font for easy reading)
  - Submitted By (with trigger type indicator)
  - Submitted On (formatted date)
  - Completed On (formatted date) 
  - Runtime
  - Status (with color-coded badges)
  - Actions (View Logs, Stop Job)
  - Output Artifacts (for remote runtime jobs)

### 🔄 Pagination
- First, Previous, Next, Last navigation
- Configurable page size (default: 4 jobs per page)
- Page state management
- Total jobs counter

### 🎯 Job Status Management  
- **Status Badges**: Color-coded status indicators
  - 🔴 ERROR/CANCELLED (Red)
  - 🟢 COMPLETED (Green) 
  - 🟡 RUNNING/OPEN (Yellow)
- **Real-time Updates**: Auto-polling for running jobs every 10 seconds
- **Job Control**: Stop running jobs (when applicable)

### 📝 Detailed Log Viewer
- **Job Log Details**: Full job data display in key-value format
- **Live Refresh**: Manual refresh capability for active jobs
- **Expandable Data**: JSON objects displayed with proper formatting

### 🎨 VS Code Integration
- **Native UI**: Uses VS Code's theme colors and styling
- **Multiple Views**: Table view, detailed logs, and output artifacts
- **Output Channel**: Can display logs in VS Code's output channel/terminal
- **Command Palette**: All functions accessible via command palette

## Available Commands

### 1. `essedum.openJobLogs`
Opens the main job logs viewer for a specific pipeline.
```
Command Palette: "Open Job Logs Viewer"
```
- Prompts for pipeline name if not provided
- Displays all jobs for the pipeline in table format
- Supports pagination and real-time updates

### 2. `essedum.openInternalJobLogs` 
Opens job logs viewer for internal jobs.
```
Command Palette: "Open Internal Job Logs"
```
- Prompts for internal job name
- Shows internal job-specific data and logs

### 3. `essedum.showJobLogsInTerminal`
Displays job logs directly in VS Code's output channel.
```
Command Palette: "Show Job Logs in Terminal"
```
- Prompts for job ID
- Creates dedicated output channel for the job
- Fetches and displays raw log data
- Tries both Spark and Internal job APIs

## Usage Examples

### From Pipeline Cards
When viewing pipeline cards in the sidebar:
1. Click the "View Logs" button on any pipeline card
2. The job logs viewer opens automatically for that pipeline
3. Browse jobs, view detailed logs, and manage job status

### Direct Command Usage
1. **Open Command Palette** (`Ctrl+Shift+P`)
2. **Type**: "Open Job Logs Viewer"
3. **Enter Pipeline Name**: e.g., "LEORGNGS24627"
4. **Browse Jobs**: Use pagination and actions

### Terminal/Output View
1. **Command Palette** → "Show Job Logs in Terminal"
2. **Enter Job ID**: e.g., "job_12345"
3. **View in Output Channel**: Logs appear in dedicated output channel

## Interface Components

### Main Job Table
```
┌─────────────┬──────────────┬──────────────┬──────────────┬─────────┬────────┬────────┬─────────────┐
│ Job Id      │ Submitted By │ Submitted On │ Completed On │ Runtime │ Status │ Action │ Artifacts   │
├─────────────┼──────────────┼──────────────┼──────────────┼─────────┼────────┼────────┼─────────────┤
│ job_12345   │ john.doe     │ Oct 1, 2025  │ Oct 1, 2025  │ remote  │ ✅ DONE │ 📄 ⏹️  │ 📊         │
│             │ User trigger │ 2:30 PM      │ 2:35 PM      │         │        │        │             │
└─────────────┴──────────────┴──────────────┴──────────────┴─────────┴────────┴────────┴─────────────┘
```

### Action Buttons
- **📄 View Logs**: Opens detailed log viewer
- **⏹️ Stop Job**: Stops running jobs (with confirmation)
- **📊 Output Artifacts**: Shows job output artifacts (remote jobs only)
- **🔄 Refresh**: Refreshes the entire job list

### Status Indicators
- **🔴 ERROR/CANCELLED**: Job failed or was cancelled
- **🟢 COMPLETED**: Job finished successfully  
- **🟡 RUNNING/OPEN**: Job is currently executing
- **Trigger Type**: Shows "Event triggered" or "User triggered"

## API Integration

The job logs viewer integrates with your existing Essedum API endpoints:

### Job List APIs
- `/api/aip/service/v1/jobs/internal/{name}/count` - Get job count
- `/api/aip/service/v1/jobs/internal/{name}?page={page}&size={size}` - Get paginated jobs
- `/api/aip/service/v1/jobs/streaming/{name}/count` - Get streaming job count

### Job Detail APIs  
- `/api/aip/service/v1/jobs/spark/{id}/logs` - Spark job logs
- `/api/aip/service/v1/jobs/internal/{id}/logs` - Internal job logs
- `/api/aip/service/v1/jobs/{id}/stop` - Stop job
- `/api/aip/service/v1/jobs/{id}/artifacts` - Get output artifacts

## Styling & Theming

The interface automatically adapts to your VS Code theme:
- **Dark Theme**: Dark backgrounds with light text
- **Light Theme**: Light backgrounds with dark text  
- **High Contrast**: Enhanced contrast for accessibility
- **Custom Themes**: Uses VS Code's CSS variables for full compatibility

## Error Handling

Comprehensive error handling for:
- **Network Issues**: Graceful fallbacks and retry mechanisms
- **Authentication**: Token refresh and re-authentication prompts
- **API Errors**: User-friendly error messages
- **Data Validation**: Handles malformed or missing job data

## Performance Features

- **Lazy Loading**: Jobs loaded on-demand with pagination
- **Caching**: Reduces API calls with intelligent caching
- **Background Updates**: Non-blocking status updates
- **Optimized Rendering**: Efficient DOM updates for large job lists

This job logs viewer provides a comprehensive interface for monitoring and managing your Essedum pipeline jobs directly within VS Code, leveraging VS Code's native capabilities.