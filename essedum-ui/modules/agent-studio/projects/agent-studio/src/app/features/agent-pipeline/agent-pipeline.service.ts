import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export interface ICIPAiAgentScript {
  id: number;
  cname: string;
  organization: string;
  filename: string;
  filePath: string;
  filescript: string;
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  id?: string;
  path?: string;
  expanded?: boolean;
}

export interface AgentGenerationRequest {
  agentName: string;
  version: string;
  description: string;
  cname: string; // Fixed container name for the agent
  configuration: any;
  runtime: any;
}

export interface AgentGenerationResponse {
  success: boolean;
  message: string;
  fileStructure?: any[];
  generatedCode?: any;
  cname?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgentPipelineService {
  
  private readonly baseUrl = '/api/aip';
  private readonly orgName = this.getOrganization(); // Dynamic organization name
  
  constructor(private http: HttpClient) {}

  /**
   * Get organization from localStorage with fallback
   */
  private getOrganization(): string {
    return localStorage.getItem('organisation') || 'leo1311';
  }

  /**
   * Generate random cname (container name) for fresh agents
   */
  generateRandomCname(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate adk Agent by calling the real API
   */
  generateadkAgent(agentRequest: AgentGenerationRequest): Observable<AgentGenerationResponse> {
    // Use the cname from the request instead of generating a random one
    const cname = agentRequest.cname;
    const orgName = this.getOrganization();
    const url = `${this.baseUrl}/folder/upload/${cname}/${orgName}`;
    
    return this.http.post<any>(url, agentRequest).pipe(
      // After successful generation, call the list endpoint to get the actual files
      switchMap(response => {
        return this.getFilesList(cname).pipe(
          map(filesList => {
            return {
              success: true,
              message: 'Agent generated successfully',
              fileStructure: filesList,
              generatedCode: response.generatedCode || {},
              cname: cname // Return the same cname that was used
            } as AgentGenerationResponse;
          })
        );
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in generateadkAgent:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Bulk update files using the new API - handles both content changes and structure changes
   */
  bulkUpdateFiles(cname: string, updates: ICIPAiAgentScript[]): Observable<ICIPAiAgentScript[]> {
    const orgName = this.getOrganization();
    const url = `${this.baseUrl}/folder/update/${cname}/${orgName}`;
    
    return this.http.post<ICIPAiAgentScript[]>(url, updates).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in bulkUpdateFiles:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update single file content
   */
  updateFileContent(cname: string, fileId: string, fileName: string, newContent: string, filePath: string): Observable<ICIPAiAgentScript[]> {
    const update: ICIPAiAgentScript = {
      id: parseInt(fileId),
      cname: cname,
      organization: this.getOrganization(),
      filename: fileName,
      filePath: filePath,
      filescript: newContent
    };
    
    return this.bulkUpdateFiles(cname, [update]);
  }

  /**
   * Update file structure (for drag-drop operations)
   */
  updateFileStructure(cname: string, fileNodes: FileNode[]): Observable<ICIPAiAgentScript[]> {
    const updates: ICIPAiAgentScript[] = this.convertFileNodesToUpdates(fileNodes);
    return this.bulkUpdateFiles(cname, updates);
  }

  /**
   * Convert FileNode array to ICIPAiAgentScript array for API
   */
  private convertFileNodesToUpdates(fileNodes: FileNode[]): ICIPAiAgentScript[] {
    const updates: ICIPAiAgentScript[] = [];
    const orgName = this.getOrganization();
    
    const processNode = (node: FileNode, currentPath: string = '') => {
      if (node.type === 'file' && node.id) {
        const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
        updates.push({
          id: parseInt(node.id),
          cname: '', // Will be set by the calling method
          organization: orgName,
          filename: node.name,
          filePath: fullPath,
          filescript: node.content || ''
        });
      } else if (node.type === 'folder' && node.children) {
        const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
        node.children.forEach(child => processNode(child, fullPath));
      }
    };
    
    fileNodes.forEach(node => processNode(node));
    return updates;
  }

  /**
   * Get files list for a specific container/user from the list endpoint
   */
  getFilesList(cname: string): Observable<any[]> {
    const orgName = this.getOrganization();
    const url = `${this.baseUrl}/folder/list/${cname}/${orgName}`;
    
    
    return this.http.get<any[]>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in getFilesList:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get files for a specific container/user
   */
  getAgentFiles(cname: string): Observable<any[]> {
    const orgName = this.getOrganization();
    const url = `${this.baseUrl}/folder/list/${cname}/${orgName}`;
    
    
    return this.http.get<any[]>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in getAgentFiles:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Upload agent folder - calls the upload API with folder path
   */
  uploadAgentFolder(cname: string, folderPath: string): Observable<any> {
    const orgName = this.getOrganization();
    const url = `${this.baseUrl}/folder/upload/${cname}/${orgName}`;
    const params = new HttpParams().set('folderPath', folderPath);
    
    
    return this.http.post<any>(url, {}, { params }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in uploadAgentFolder:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Download specific file content
   */
  downloadFileContent(cname: string, fileId: string): Observable<string> {
    const orgName = this.getOrganization();
    const url = `${this.baseUrl}/folder/download/${cname}/${orgName}/${fileId}`;
    
    
    return this.http.get(url, { responseType: 'text' }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in downloadFileContent:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Extract file content from blob/binary data
   */
  private extractFileContentFromBlob(filescript: any, filename: string): string {
    
    if (!filescript) {
      console.error('No filescript data available for file:', filename);
      return `// No content available for file: ${filename}`;
    }
    
    try {
      // Handle string content directly
      if (typeof filescript === 'string') {
        return filescript;
      }
      
      // Handle byte array content (most likely scenario)
      if (Array.isArray(filescript)) {
        if (filescript.length === 0) {
          return `// Empty file: ${filename}`;
        }
        // Convert byte array to string
        return new TextDecoder('utf-8').decode(new Uint8Array(filescript));
      }
      
      // Handle blob object structures
      if (typeof filescript === 'object') {
        
        // Check for direct byte array in object properties
        const possibleArrayProps = ['bytes', 'data', 'content', 'buffer', 'array'];
        for (const prop of possibleArrayProps) {
          if (filescript[prop] && Array.isArray(filescript[prop])) {
            return new TextDecoder('utf-8').decode(new Uint8Array(filescript[prop]));
          }
        }
        
        // Handle nested blob structures (wrappedBlob, binaryStream)
        if (filescript.wrappedBlob && filescript.wrappedBlob.array && Array.isArray(filescript.wrappedBlob.array)) {
          return new TextDecoder('utf-8').decode(new Uint8Array(filescript.wrappedBlob.array));
        }
        
        if (filescript.binaryStream && filescript.binaryStream.buf && Array.isArray(filescript.binaryStream.buf)) {
          return new TextDecoder('utf-8').decode(new Uint8Array(filescript.binaryStream.buf));
        }
        
        // Handle ArrayBuffer
        if (filescript instanceof ArrayBuffer) {
          return new TextDecoder('utf-8').decode(filescript);
        }
        
        // Handle Uint8Array
        if (filescript instanceof Uint8Array) {
          return new TextDecoder('utf-8').decode(filescript);
        }
        
        // Last resort - check if the object has any numeric properties (might be indexed bytes)
        const keys = Object.keys(filescript).filter(key => !isNaN(Number(key)));
        if (keys.length > 0) {
          const byteArray = keys.map(key => filescript[key]).filter(val => typeof val === 'number');
          if (byteArray.length > 0) {
            return new TextDecoder('utf-8').decode(new Uint8Array(byteArray));
          }
        }
        
        console.error('✗ Could not extract content from object structure for file:', filename);
        console.error('Object structure:', JSON.stringify(filescript, null, 2));
        return `// Could not extract content from blob object for file: ${filename}
// Object keys: ${Object.keys(filescript).join(', ')}
// Please check console for full object structure`;
      }
      
      // If we get here, it's an unknown format
      console.error('✗ Unknown filescript format for file:', filename, typeof filescript);
      return `// Unknown file content format for: ${filename}
// Type: ${typeof filescript}
// Value: ${String(filescript)}`;
      
    } catch (error) {
      console.error('✗ Error extracting file content:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return `// Error extracting file content: ${errorMessage}
// File: ${filename}
// Check console for details`;
    }
  }
  



  
  /**
   * Build file tree structure from API response
   */
  buildFileTreeFromApiResponse(apiResponse: any[]): FileNode[] {
    const root: FileNode = { name: 'root', type: 'folder', children: [] };
    
    if (!apiResponse || !Array.isArray(apiResponse)) {
      console.warn('Invalid API response for file tree:', apiResponse);
      return [];
    }
    
    
    apiResponse.forEach((item, index) => {
      
      // The API response uses 'filePath' and 'filename' fields
      const path = item.filePath || item.filename;
      if (!path) {
        console.warn('File item missing filePath/filename:', item);
        return;
      }
      
      
      const pathParts = path.split('/').filter(part => part.length > 0);
      let currentNode = root;
      
      // Navigate/create the directory structure
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        const isFile = i === pathParts.length - 1;
        
        if (!currentNode.children) {
          currentNode.children = [];
        }
        
        // Find existing node or create new one
        let existingNode = currentNode.children.find(child => child.name === part);
        
        if (!existingNode) {
          // Extract file content from filescript field
          let fileContent = '';
          if (isFile && item.filescript) {
            fileContent = this.extractFileContentFromBlob(item.filescript, item.filename);
          }
          
          existingNode = {
            name: part,
            type: isFile ? 'file' : 'folder',
            id: isFile ? item.id?.toString() : undefined,
            path: isFile ? path : undefined,
            children: isFile ? undefined : [],
            expanded: false, // Default to collapsed
            content: isFile ? fileContent : undefined
          };
          currentNode.children.push(existingNode);
        }
        
        currentNode = existingNode;
      }
    });
    
    // Sort the tree alphabetically (folders first, then files)
    this.sortFileTree(root);
    
    return root.children || [];
  }

  /**
   * Sort file tree alphabetically (folders first, then files)
   */
  private sortFileTree(node: FileNode): void {
    if (node.children && node.children.length > 0) {
      // Sort children: folders first, then files, both alphabetically
      node.children.sort((a, b) => {
        // If one is folder and other is file, folder comes first
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        // Both are same type, sort alphabetically (case-insensitive)
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });
      
      // Recursively sort children of folders
      node.children.forEach(child => {
        if (child.type === 'folder') {
          this.sortFileTree(child);
        }
      });
    }
  }

  /**
   * Download all files as ZIP from the backend
   */
  downloadAllFilesAsZip(cname: string, org?: string): Observable<Blob> {
    const orgName = org || this.getOrganization();
    const url = `${this.baseUrl}/folder/download/${cname}/${orgName}`;
    
    
    return this.http.get(url, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/zip'
      }
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in downloadAllFilesAsZip:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a file from the backend
   */
  deleteFile(id: string | number): Observable<any> {
    const url = `${this.baseUrl}/folder/delete/${id}`;
    
    
    return this.http.delete<any>(url).pipe(
      map(response => {
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in deleteFile:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse) => {
    console.error('API Error:', error);
    
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Network Error: ${error.error.message}`;
    } else {
      // Backend returned unsuccessful response code
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage += ` - ${error.error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  };

  
  
  /**
   * Upload agent files ZIP to backend
   */
  uploadAgentFilesZip(cname: string, organization: string, zipFile: File, type: string = 'Agent'): Observable<any> {
    const url = `${this.baseUrl}/folder/upload/${cname}/${organization}?zipFile=null&type=${type}`;  

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('zipFile', zipFile);
    formData.append('isvibestudio', 'false');

    // Get auth token from localStorage or session storage
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
    const roleId = localStorage.getItem('roleId') || '1';
    const roleName = localStorage.getItem('roleName') || 'IT Portfolio Manager';

    return this.http.post(url, formData, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,hi;q=0.6',
        'Authorization': `Bearer ${authToken}`,
        'Connection': 'keep-alive',
        'Project': '2',
        'ProjectName': organization,
        'X-Requested-With': 'Leap',
        'charset': 'utf-8',
        'roleId': roleId,
        'roleName': roleName
        // Don't set Content-Type - let the browser set it with multipart/form-data boundary
      }
    }).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error) => {
        console.error('ZIP upload error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Upload agent files to MinIO
   */
  uploadToMinio(cname: string, organization: string): Observable<any> {
    const url = `${this.baseUrl}/folder/push-to-minio/${cname}/${organization}`;
    

    return this.http.post(url, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
      // Remove responseType: 'text' to allow proper JSON error parsing
    }).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in uploadToMinio:', error);
        // Error is already properly structured by HttpClient
        return throwError(() => error);
      })
    );
  }
}