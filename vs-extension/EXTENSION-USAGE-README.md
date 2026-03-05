# Essedum VS Code Extension - Complete Visual Guide

> This comprehensive guide showcases all features of the Essedum VS Code Extension with detailed screenshots. Users can access these features in any order based on their workflow needs.

---

## 📑 Table of Contents

- [Installation](#installation)
- [Authentication](#authentication)
- [Navigation Dashboard](#navigation-dashboard)
- [Pipeline Management](#pipeline-management)
- [Pipeline Execution & Job Logs](#pipeline-execution--job-logs)
- [Pipeline Agents & MCP Servers](#pipeline-agents--mcp-servers)
- [Code Management](#code-management)
- [GitHub Integration](#github-integration)
- [Copilot Integration](#copilot-integration)
- [Session Management](#session-management)

---

## 📦 Installation

### Finding Essedum in Marketplace

![Navigating to VS Code Marketplace](media/screenshots/01-extension-marketplace.png)

Access the **VS Code Extensions Marketplace** by clicking the Extensions icon in the Activity Bar or by pressing **`Ctrl+Shift+X`**.

### Searching for Essedum

![Searching for Essedum extension](media/screenshots/02-extension-search.png)

Type **"Essedum"** in the marketplace search box to locate the extension.

### Extension Preview

![Hovering over Essedum extension](media/screenshots/03-extension-preview.png)

Hover over the Essedum extension in search results to **preview its details and ratings**.

### Installing the Extension

![Install button highlighted](media/screenshots/04-extension-install.png)

Click on the Essedum extension to view its full details page, then click on the **Install** button to proceed with installation.

### Installation Complete

![Extension installed successfully](media/screenshots/05-extension-installed.png)

Once installed, the Install button changes to **Disable/Uninstall**, and the Essedum icon appears in the **Activity Bar** on the left side of VS Code.

### Accessing Essedum

![Essedum icon in Activity Bar](media/screenshots/06-activity-bar-icon.png)

Hover over the **Essedum icon** in the Activity Bar to see the tooltip, then **click to open** the extension interface.

---

## 🔐 Authentication

### Login Screen

![Initial login interface](media/screenshots/07-login-screen.png)

Upon first launch, you'll see the **login screen** where you can authenticate with your Essedum account.

### Network Selection

![List of available networks](media/screenshots/08-network-selection.png)

Select your **target network** from the available list. This determines which Essedum server you'll connect to.

### Initiating Login

![Login button ready](media/screenshots/09-login-button.png)

After selecting your network (such as **"5G Server Network"**), hover over the **Login** button and click to begin authentication.

### Browser Authentication

![Browser login page](media/screenshots/10-browser-auth.png)

The extension redirects you to your **default browser** where you'll be prompted to enter your credentials for authentication.

### Authentication Success

![Successful authentication message](media/screenshots/11-auth-success.png)

After successful login, the browser displays an authentication confirmation message indicating you can **return to VS Code**.

---

## 🏠 Navigation Dashboard

### Main Dashboard

![Navigation screen overview](media/screenshots/12-navigation-dashboard.png)

After authentication, you're directed to the **Navigation Dashboard**, which serves as the **central hub** for accessing all extension features.

### Accessing Pipelines

![Pipeline navigation option](media/screenshots/13-pipeline-navigation.png)

The Navigation Dashboard provides access to **Pipelines**. Click on the Pipeline option to navigate to the pipeline management interface.


---

## 🔄 Pipeline Management

### Pipeline List View

![Pipelines displayed as cards](media/screenshots/14-pipeline-list.png)

The Pipeline interface displays all available pipelines in a **card-based layout**, making it easy to browse and access your pipelines.

### Search Functionality

![Pipeline search feature](media/screenshots/15-pipeline-search.png)

Use the **search box** to filter pipelines by name or description. Click on the **search icon** to activate the search functionality and find specific pipelines quickly.

### Viewing Pipeline Details

![Pipeline card with View Details button](media/screenshots/16-pipeline-card-details.png)

Each pipeline card shows key information and includes a **"View Details"** button. Hover over a pipeline card (such as **"Classification Infer Test"**) to highlight it, then click "View Details" to access the complete pipeline information.

### Pipeline Detail Screen

![Detailed pipeline information](media/screenshots/17-pipeline-detail-screen.png)

The detail screen displays **comprehensive information** about the selected pipeline, including configuration, scripts, and execution history.

### Full Detail View

![Scrolled detail view](media/screenshots/18-pipeline-detail-full.png)

Scroll down on the detail screen to view **all pipeline components**, including associated scripts, notebooks, and action buttons.

### Opening Python Scripts

![Python script open button](media/screenshots/19-pipeline-script-open.png)

Hover over the **"Open"** button next to a Python script file to view the tooltip. Clicking this button opens the script directly in the **VS Code editor**.

### Python File in Editor

![Python file opened](media/screenshots/20-python-file-opened.png)

Python scripts open in the editor with **full syntax highlighting**, allowing you to view the pipeline's source code.

### Opening Jupyter Notebooks

![Notebook open button](media/screenshots/21-notebook-open.png)

Click on the **"Open"** button next to a **`.ipynb`** (Jupyter Notebook) file to open Python notebooks in the editor.

### Notebook in Editor

![Jupyter notebook displayed](media/screenshots/22-notebook-display.png)

Jupyter notebooks open with proper formatting, displaying **cells, code, and embedded outputs** or visualizations.

### Copying Content

![Copy button highlighted](media/screenshots/23-copy-button.png)

Use the **Copy button** to quickly copy content from pipeline configuration or script sections to your clipboard.

### Accessing Job Logs

![View Logs button](media/screenshots/24-view-logs-button.png)

Click on the **"View Logs"** button on the pipeline detail screen to access the job execution history and status information.



---

## ▶️ Pipeline Execution & Job Logs

### Job Logs Viewer

![Job logs interface](media/screenshots/25-job-logs-viewer.png)

After clicking **"View Logs"**, the Job Logs screen opens, displaying the **execution history and status** of pipeline runs.

### Running a Pipeline

![Run Pipeline button](media/screenshots/26-run-pipeline-button.png)

From the pipeline detail screen, click on the **"Run Pipeline"** button to execute the pipeline and create a new job.

### Execution Success & Refresh

![Success notification and refresh button](media/screenshots/27-execution-success.png)

After running a pipeline, a **success notification** appears confirming the execution has started. The **refresh button** (also highlighted) allows you to update the job list to see the latest run.

### Updated Job List

![Latest job displayed](media/screenshots/28-updated-job-list.png)

After clicking refresh, the newly executed pipeline job appears in the job logs list with its **current status**.

### Viewing Job Details

![Job action button](media/screenshots/29-view-logs-action.png)

Hover over the **action button** (eye icon) in the Actions column of a job entry. The tooltip indicates "View Logs" - clicking this opens detailed execution information.

### Console Logs

![Console log output](media/screenshots/30-console-logs.png)

The **Console Logs** tab displays **real-time output** from the pipeline execution, showing print statements, warnings, and other console messages.

### Job Log Details

![Job details tab](media/screenshots/31-job-log-details.png)

The **Job Log Details** tab provides structured information about the job execution, including **timestamps, status changes, and execution parameters**.

### Returning to Pipelines

![Back to Pipelines button](media/screenshots/32-back-to-pipelines.png)

Hover over the **back button** to see the "Back to Pipelines" tooltip. Click this to return to the pipeline list view.

### Refreshing Pipeline Cards

![Refresh pipelines button](media/screenshots/33-refresh-pipelines.png)

Back on the pipeline list screen, click the **refresh button** to update the pipeline cards with the latest information. The tooltip reads "Refresh pipeline cards".

### Pagination - Next Page

![Next page navigation](media/screenshots/34-next-page.png)

Use the **"Next Page"** button to navigate through multiple pages of pipelines when you have a large number of pipelines available.

### Pagination - Last Page

![Last page navigation](media/screenshots/35-last-page.png)

Click the **"Last Page"** button to jump directly to the final page of pipelines (e.g., page 6 in this example).

### Navigating Back

![Back to Navigation button](media/screenshots/36-back-to-navigation.png)

From the pipeline list view, hover over the back button at the top to see the **"Back to Navigation"** tooltip. This returns you to the main Navigation Dashboard.



---

## 🤖 Pipeline Agents & MCP Servers

### Agent MCP Pipelines

![Accessing Agent MCP Pipelines](media/screenshots/37-agent-mcp-access.png)

From the Navigation Dashboard, click on **"Agent MCP Pipelines"** to access the agent management interface.

### Agents Tab - List View

![Pipeline agents displayed as cards](media/screenshots/38-agents-list.png)

The Agent MCP Pipelines screen features **two tabs**: "Agents" and "MCP Servers". The Agents tab displays all available pipeline agents in a **card-based format**.

### MCP Servers Tab Access

![MCP Servers tab](media/screenshots/39-mcp-servers-tab.png)

Hover over the **"MCP Servers"** tab to switch views. Clicking this tab displays MCP servers in the same card layout format.

### MCP Servers List

![MCP Servers displayed](media/screenshots/40-mcp-servers-list.png)

The MCP Servers tab shows all available MCP servers, allowing you to browse and manage server configurations.

### Searching MCP Servers

![Search functionality for MCP servers](media/screenshots/41-mcp-search.png)

Type in the **search box** (e.g., "Test") and click the search icon to filter MCP servers based on your search criteria.

### Filtered Results

![Search results displayed](media/screenshots/42-mcp-search-results.png)

After clicking search, only the MCP server cards **matching your search text** are displayed.

### Returning to Agents Tab

![Navigating back to Agents](media/screenshots/43-back-to-agents.png)

Click on the **"Agents"** tab to return to the pipeline agents view.

### Viewing Agent Details

![Agent View Details button](media/screenshots/44-agent-view-details.png)

On the Agents tab, hover over the **"View Details"** button of a specific agent card (such as **"Agent-test-v2"**). The entire card highlights, indicating it's interactive. Click to access the detailed agent information.

### Agent Detail Screen

![Agent details interface](media/screenshots/45-agent-detail-screen.png)

The agent detail screen displays **comprehensive information** about the selected pipeline agent, including available actions like **Download Code** and **Edit Code**.

### Downloading Agent Code

![Download Code button](media/screenshots/46-download-code-button.png)

Hover over the **"Download Code"** button to prepare for downloading the agent's source code files to your local system.

### Download Location Selection

![File explorer for download location](media/screenshots/47-download-location.png)

A **file explorer window** opens, prompting you to select a location where the agent code will be downloaded.

### Download In Progress

![Download notification](media/screenshots/48-download-progress.png)

A notification message displays **"Downloading Complete"** status, indicating the download process has finished.

### Download Success

![Success notification with folder option](media/screenshots/49-download-success.png)

Another notification confirms successful download and provides options such as **"Open Folder"** to directly access the downloaded files.

### Editing Agent Code

![Edit Code button](media/screenshots/50-edit-code-button.png)

Click on the **"Edit Code"** button on the agent detail screen for editing the agent's source files directly in VS Code.

---

## 💻 Code Management

### Workspace Trust Prompt

![VS Code trust dialog](media/screenshots/51-workspace-trust.png)

After clicking **"Edit Code"**, VS Code displays a trust prompt asking **"Do you trust the authors of files in this folder?"** This security measure ensures you're aware that files will be loaded into your workspace.

### Return to Agent List

![Pipeline agents list view](media/screenshots/52-return-agent-list.png)

After confirming the trust prompt or navigating away, you're redirected back to the **pipeline agents list screen**.

### VS Code Explorer Access

![Explorer icon in Activity Bar](media/screenshots/53-explorer-access.png)

Click on the **Explorer icon** in VS Code's Activity Bar to access the file explorer where loaded agent files are displayed.

### Explorer View with Agent Files

![Workspace with agent folders](media/screenshots/54-explorer-view.png)

The Explorer shows an **"Untitled" workspace** containing the pipeline agent folder. Under this folder, you'll find the **ADK (Agent Development Kit)** folder structure with all agent files.

### Opening Files in Editor

![File opened in editor](media/screenshots/55-file-opened.png)

Click on any file (such as **`mcp-servicequal-requirements.txt`**) to open it in the VS Code editor with **full syntax highlighting** and editing capabilities.

### Editing Files

![Modified file content](media/screenshots/56-file-editing.png)

Make changes to the file directly in the editor. **Modified files are marked** with indicators showing unsaved changes.

### Saving Changes to Server

![Save notification](media/screenshots/57-save-to-server.png)

Press **`Ctrl+S`** to save the file. Changes are **automatically synchronized** to the server, and a notification message confirms successful save.

### Creating New Files

![New file creation](media/screenshots/58-create-new-file.png)

Create new files in the agent folder by right-clicking and selecting **"New File"** or using the new file icon. For example, creating a **`readme.md`** file.

### Uploading Code to Server

![Context menu with Upload option](media/screenshots/59-upload-code-menu.png)

After adding content to your new file, right-click on the root folder and hover over **"Upload Code to Essedum"**. This option allows you to **sync your local changes** (including new or deleted files) back to the server.

### Upload Confirmation

![Upload confirmation dialog](media/screenshots/60-upload-confirmation.png)

A **confirmation popup** appears asking you to confirm the upload operation before proceeding.

### Upload Success

![Success notification](media/screenshots/61-upload-success.png)

After confirming, a notification message displays **"Files are uploaded successfully"**, confirming that your changes have been synced to the Essedum server.

---

## 🔗 GitHub Integration

### Agent Without ADK

![Agent detail with GitHub option](media/screenshots/62-agent-without-adk.png)

On page 2 of the pipeline agents list, view details of an agent like **"Telecom-service-qualification-agent-copy"**. Agents without an ADK **(Agent Development Kit)** display different action buttons: **"Open Copilot"** and **"Upload From Github"** instead of "View Code" and "Download Code".

### Upload From Github Button

![URL input field](media/screenshots/64-github-url-input.png)

Click on the **"Upload From Github"** button for importing code from a GitHub repository. This feature allows you to **pull code directly from GitHub** to serve as the agent's ADK.

### GitHub Repository URL Input

![Repository branch list](media/screenshots/65-branch-selection.png)

After clicking "Upload From Github", an **input field** appears at the top of the screen prompting you to enter the **GitHub repository URL**.

### Branch Selection

Once you enter a valid GitHub repository URL, the extension retrieves and displays a **list of available branches**. Select the desired branch to import its code into your agent as the ADK.

---

## 🤝 Copilot Integration

### Open Copilot Feature

![Upload From Github highlighted](media/screenshots/63-open-copilot.png)

For agents without ADK, the **"Open Copilot"** button is available. Click on this button to access the Copilot integration feature.

### Using Copilot with Agents

When you click **"Open Copilot"**, GitHub Copilot opens and a reference JSON file is loaded in the editor. You can paste (**`Ctrl+V`**) the master prompt directly into Copilot, which will use the JSON file as context for generating code or providing assistance specific to your agent configuration.

---

## 🚪 Session Management

### Logout Function

![Logout button](media/screenshots/66-logout.png)

At the top of the interface, hover over the **logout button** to see the "Logout from Essedum" tooltip. Click this button to **end your current session** and clear authentication tokens.

---

## ✨ Key Features Summary

### Pipeline Management

- ✅ Browse pipelines in a card-based interface
- ✅ Search and filter pipelines by name
- ✅ View detailed pipeline information including scripts and notebooks
- ✅ Open Python files and Jupyter notebooks directly in the editor
- ✅ Execute pipelines and monitor job status
- ✅ View console logs and job details
- ✅ Navigate through paginated results

### Pipeline Agents & MCP Servers

- ✅ Switch between Agents and MCP Servers tabs
- ✅ Search and filter agents or servers
- ✅ View comprehensive agent details
- ✅ Download agent code to local system
- ✅ Edit agent code directly in VS Code workspace

### Code Development

- ✅ Edit files with full VS Code functionality
- ✅ Automatic save synchronization to server
- ✅ Create new files and folders
- ✅ Upload local changes back to server
- ✅ Trust and security prompts for workspace safety

### Integration Features

- ✅ Import code from GitHub repositories
- ✅ Select specific branches for import
- ✅ Copilot integration for AI-assisted development
- ✅ JSON configuration files as Copilot context

### Navigation & Workflow

- ✅ Non-sequential access to all features
- ✅ Contextual back buttons for easy navigation
- ✅ Refresh functionality to update data
- ✅ Pagination for large datasets
- ✅ Tooltip guidance throughout the interface

---

## 💡 Tips for Effective Use

### Best Practices

- 🔍 **Use Search**: Quickly locate specific pipelines or agents using the search functionality
- 📊 **Monitor Jobs**: Regularly check job logs after running pipelines to catch issues early
- 💾 **Save Frequently**: While auto-save is enabled, use **`Ctrl+S`** to ensure immediate synchronization
- 📁 **Organize Code**: When editing agents, maintain clear folder structures for easier maintenance
- 🔗 **Leverage GitHub**: Use the GitHub import feature to maintain version control of your agent code

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **`Ctrl+Shift+X`** | Open Extensions marketplace |
| **`Ctrl+Shift+E`** | Open File Explorer |
| **`Ctrl+S`** | Save file and sync to server |
| **`Ctrl+V`** | Paste (used with Copilot integration) |
| **`Ctrl+W`** | Close current editor tab |

### Troubleshooting

- ⚠️ **Connection Issues**: Use the logout/login cycle to refresh authentication
- ⚠️ **Missing Files**: Check if you trusted the workspace when prompted
- ⚠️ **Upload Failures**: Verify folder selection and confirm upload dialogs
- ⚠️ **Search Not Working**: Ensure you click the search icon after typing your query

---

## 📚 Conclusion

> **This visual guide covers the complete functionality of the Essedum VS Code Extension. Users can access features in any order based on their workflow needs and preferences.**

---

*For additional support or questions, please refer to the official documentation or contact the Essedum support team.*
