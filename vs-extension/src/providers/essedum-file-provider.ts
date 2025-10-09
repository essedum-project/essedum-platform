import * as vscode from 'vscode';
import * as https from 'https';
import { BASE_URL } from '../constants/api-config';

const axios = require('axios');

interface EssedumFile {
    uri: vscode.Uri;
    content: string;
    modified: boolean;
    fileName: string;
    extension: string;
    pipelineName: string;
    organization: string;
}

/**
 * File system provider for essedum:// scheme
 */
export class EssedumFileSystemProvider implements vscode.FileSystemProvider {
    private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

    private _files = new Map<string, EssedumFile>();
    private _token: string;

    constructor(token: string) {
        this._token = token;
    }

    /**
     * Update the authentication token
     */
    public updateToken(token: string): void {
        this._token = token;
    }

    watch(uri: vscode.Uri, options: { recursive: boolean; excludes: string[]; }): vscode.Disposable {
        // Ignore, fires for all changes...
        return new vscode.Disposable(() => { });
    }

    stat(uri: vscode.Uri): vscode.FileStat | Thenable<vscode.FileStat> {
        const file = this._files.get(uri.toString());
        if (!file) {
            throw vscode.FileSystemError.FileNotFound();
        }

        return {
            type: vscode.FileType.File,
            ctime: Date.now(),
            mtime: Date.now(),
            size: file.content.length
        };
    }

    readDirectory(uri: vscode.Uri): [string, vscode.FileType][] | Thenable<[string, vscode.FileType][]> {
        const entries: [string, vscode.FileType][] = [];
        
        // Find all files that are children of this URI
        for (const [fileUri, file] of this._files) {
            const fileUriObj = vscode.Uri.parse(fileUri);
            if (fileUriObj.path.startsWith(uri.path) && fileUriObj.path !== uri.path) {
                const relativePath = fileUriObj.path.substring(uri.path.length + 1);
                if (!relativePath.includes('/')) { // Direct child
                    entries.push([relativePath, vscode.FileType.File]);
                }
            }
        }

        return entries;
    }

    createDirectory(uri: vscode.Uri): void | Thenable<void> {
        // Not implemented for files
    }

    readFile(uri: vscode.Uri): Uint8Array | Thenable<Uint8Array> {
        const file = this._files.get(uri.toString());
        if (!file) {
            throw vscode.FileSystemError.FileNotFound();
        }

        return Buffer.from(file.content, 'utf8');
    }

    writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }): void | Thenable<void> {
        const existingFile = this._files.get(uri.toString());
        
        if (!existingFile && !options.create) {
            throw vscode.FileSystemError.FileNotFound();
        }
        
        if (existingFile && !options.overwrite) {
            throw vscode.FileSystemError.FileExists();
        }

        const contentStr = Buffer.from(content).toString('utf8');
        
        if (existingFile) {
            // Update existing file
            existingFile.content = contentStr;
            existingFile.modified = true;
        } else {
            // This shouldn't happen in normal operation since files are registered first
            throw vscode.FileSystemError.FileNotFound();
        }

        this._emitter.fire([{ type: vscode.FileChangeType.Changed, uri }]);
    }

    delete(uri: vscode.Uri, options: { recursive: boolean; }): void | Thenable<void> {
        const file = this._files.get(uri.toString());
        if (!file) {
            throw vscode.FileSystemError.FileNotFound();
        }

        this._files.delete(uri.toString());
        this._emitter.fire([{ type: vscode.FileChangeType.Deleted, uri }]);
    }

    rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean; }): void | Thenable<void> {
        const file = this._files.get(oldUri.toString());
        if (!file) {
            throw vscode.FileSystemError.FileNotFound();
        }

        const existing = this._files.get(newUri.toString());
        if (existing && !options.overwrite) {
            throw vscode.FileSystemError.FileExists();
        }

        // Update the file object
        file.uri = newUri;
        
        // Move the file in our map
        this._files.delete(oldUri.toString());
        this._files.set(newUri.toString(), file);

        this._emitter.fire([
            { type: vscode.FileChangeType.Deleted, uri: oldUri },
            { type: vscode.FileChangeType.Created, uri: newUri }
        ]);
    }

    /**
     * Register a file with the file system provider
     */
    public registerFile(fileName: string, content: string, pipelineName: string, organization: string): vscode.Uri {
        const extension = fileName.split('.').pop() || 'txt';
        const uri = vscode.Uri.parse(`essedum:///${pipelineName}/${fileName}`);
        
        const file: EssedumFile = {
            uri,
            content,
            modified: false,
            fileName,
            extension,
            pipelineName,
            organization
        };

        this._files.set(uri.toString(), file);
        this._emitter.fire([{ type: vscode.FileChangeType.Created, uri }]);
        
        return uri;
    }

    /**
     * Get all files for a specific pipeline that have been modified
     */
    private getModifiedFilesForPipeline(pipelineName: string): EssedumFile[] {
        return Array.from(this._files.values()).filter(file => 
            file.pipelineName === pipelineName && file.modified
        );
    }

    /**
     * Save all modified files for a pipeline to the Essedum server
     */
    public async saveFilesToServer(pipelineName: string): Promise<void> {
        const filesToSave = this.getModifiedFilesForPipeline(pipelineName);
        
        if (filesToSave.length === 0) {
            return;
        }

        const savePromises = filesToSave.map(file => this.saveFileToServer(file));
        
        try {
            await Promise.all(savePromises);
            vscode.window.showInformationMessage(
                `Successfully saved ${filesToSave.length} file(s) to Essedum server for pipeline: ${pipelineName}`
            );
        } catch (error: any) {
            vscode.window.showErrorMessage(
                `Failed to save some files to Essedum server: ${error.message}`
            );
            throw error;
        }
    }

    /**
     * Save individual file to Essedum server using correct API endpoint
     */
    private async saveFileToServer(file: EssedumFile): Promise<void> {
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false
        });

        const headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Authorization': `Bearer ${this._token}`,
            'Connection': 'keep-alive',
            'Project': '2',
            'ProjectName': file.organization,
            'X-Requested-With': 'Leap',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
            'charset': 'utf-8',
            'roleId': '1',
            'roleName': 'IT Portfolio Manager',
            'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        };

        // Create FormData for file upload
        const formData = new FormData();
        
        // Create a Blob from the script content
        const scriptBlob = new Blob([file.content], { type: 'text/plain' });
        formData.append('scriptFile', scriptBlob, file.fileName);

        // Add metadata
        const fileType = this.getFileTypeByExtension(file.extension);
        formData.append('filetype', fileType);
        formData.append('pipelineName', file.pipelineName);
        formData.append('organization', file.organization);
        
        // Debug: log the form data contents
        console.log('FormData contents:');
        console.log('- scriptFile:', file.fileName, 'size:', file.content.length);
        console.log('- filetype:', fileType);
        console.log('- pipelineName:', file.pipelineName);
        console.log('- organization:', file.organization);

        // Use the correct file create endpoint from curl analysis
        const uploadEndpoint = `/api/aip/file/create/${file.pipelineName}/${file.organization}/${fileType}?file=${file.fileName}`;
        
        console.log(`Attempting to upload file ${file.fileName} to pipeline ${file.pipelineName} in organization ${file.organization}`);
        console.log(`Using endpoint: ${uploadEndpoint}`);
        console.log(`File type: ${fileType}`);
        
        const response = await axios.post(
            uploadEndpoint,
            formData,
            {
                baseURL: BASE_URL,
                headers: headers,
                httpsAgent: httpsAgent,
                timeout: 30000
            }
        );
        
        console.log(`File ${file.fileName} saved to Essedum server successfully:`, response.data);
    }

    /**
     * Get file type for Essedum server based on extension
     */
    private getFileTypeByExtension(extension: string): string {
        const extensionMap: { [key: string]: string } = {
            'py': 'Python3',
            'js': 'JavaScript',
            'ts': 'TypeScript',
            'java': 'Java',
            'scala': 'Scala',
            'r': 'R',
            'sql': 'SQL',
            'txt': 'Text',
            'json': 'JSON',
            'xml': 'XML',
            'yaml': 'YAML',
            'yml': 'YAML'
        };

        return extensionMap[extension.toLowerCase()] || 'Text';
    }
}