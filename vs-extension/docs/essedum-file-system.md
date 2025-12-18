# Essedum File System Feature

## Overview
The Essedum VS Code extension now includes a custom file system provider that handles pipeline files in a special way, ensuring they remain server-only and are properly managed during pipeline execution.

## How It Works

### When Viewing Pipeline Details
1. Click "View Details" on any pipeline card
2. **All script files automatically open in VS Code editor** with `essedum://` URIs
3. **Details panel shows summary** of opened files and run controls
4. Files are immediately available for editing with full VS Code features

### File Management
**Automatic Editor Opening:**
- All pipeline script files open automatically in separate editor tabs
- Files use `essedum:///pipeline-name/filename.ext` URI scheme
- Full VS Code editing capabilities with syntax highlighting and IntelliSense
- Local changes saved with Ctrl+S, server sync during pipeline execution

**Details Panel Summary:**
- Shows list of opened files with their status
- Displays file information (language, size, URI)
- **Script Actions**: Copy all scripts, refresh scripts, view logs
- Provides pipeline execution controls
- Back button to return to pipeline list

### Editable Behavior
- ✅ Full syntax highlighting and IntelliSense
- ✅ Code navigation and search capabilities  
- ✅ **Full editing capabilities** - modify files as needed
- ✅ **Ctrl+S saves locally** with automatic server sync during pipeline execution
- ✅ Copy, paste, and all normal editing operations

### When Files Are Saved
Files have a two-stage saving process:

#### Local Editing (Ctrl+S)
1. User edits files and presses Ctrl+S
2. Changes are saved locally within the VS Code session
3. User sees message: *"Changes to script.py saved locally. Run the pipeline to save to Essedum server."*
4. Option to immediately run pipeline or continue editing

#### Server Sync (Pipeline Execution)
1. User runs the pipeline from the VS Code extension
2. **All modified Essedum files are automatically uploaded to the server**
3. Pipeline execution begins with the latest file versions
4. User receives confirmation that files were saved to the server

## Benefits

### Security & Integrity
- Prevents accidental local file modifications
- Ensures all changes go through proper pipeline execution flow
- Maintains server-side file integrity

### User Experience  
- **Instant Access**: All files open automatically - no manual clicking required
- **Full Editor Features**: Complete VS Code editing experience for all files
- **Rich Actions**: Copy all scripts, refresh scripts, and view logs with single clicks
- **Organized Workflow**: Details panel provides overview while files are ready for editing
- **Seamless Integration**: Files appear as native VS Code tabs with special URIs

### Development Workflow
- Browse pipelines in sidebar
- Click "View Details" → All script files open automatically in editor
- Edit files using full VS Code capabilities (syntax highlighting, IntelliSense, etc.)
- Use details panel for pipeline information and execution
- Run pipeline to sync all changes to server
- Use back button to navigate between pipelines

## Technical Implementation

### File System Provider
- Custom `essedum://` URI scheme
- Read-only file access
- Server-side file registration
- Automatic cleanup when extension closes

### Integration Points
- Pipeline cards "View Details" button
- Pipeline execution workflow
- Authentication token management
- Error handling and user feedback

## User Messages

### On View Details
> "Opened 3 script file(s) in editor for pipeline: my-data-pipeline"

### On Local Save (Ctrl+S)
> "Changes to script.py saved locally. Run the pipeline to save to Essedum server." (with "Run Pipeline" button)

### On Pipeline Execution
> "Successfully saved 3 file(s) to Essedum server for pipeline: my-data-pipeline"

## Supported File Types
- Python (`.py`)
- JavaScript (`.js`)
- TypeScript (`.ts`)
- SQL (`.sql`)
- JSON (`.json`)
- YAML (`.yaml`, `.yml`)
- Text files (`.txt`)
- Requirements files (`requirements.txt`)

## Future Enhancements
- Diff view showing changes before pipeline execution
- Temporary edit mode with explicit save-to-server action
- File history and version tracking
- Multi-file pipeline editing with atomic saves