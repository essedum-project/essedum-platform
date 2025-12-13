import {
  Component,
  OnInit,
  HostListener,
  Input,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Services } from '../services/service';
import {
  AgentPipelineService,
  FileNode as ServiceFileNode,
  AgentGenerationRequest,
  ICIPAiAgentScript,
} from './agent-pipeline.service';
import { StreamingServices } from '../streaming-services/streaming-service';
import {
  DynamicParamsGrid,
  DynamicSecretsGrid,
} from '../pipeline.description/pipeline.description.component';
import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';

import { HttpParams } from '@angular/common/http';
import { OptionsDTO } from '../DTO/OptionsDTO';
import { MatTreeNestedDataSource } from '@angular/material/tree';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  id?: string;
  path?: string;
  expanded?: boolean; // Add expanded state for folders
  extension?: string;
  selected?: boolean;
}

interface AgentCard {
  cid: string;
  cname: string; // Fixed container name for this agent
  name: string;
  alias: string;
  description: string;
  type: string;
  language: string;
  status: string;
  version: string;
  lastModified: Date;
  tags?: string[];
  lastmodifiedon?: Date;
  createdby?: string;
  hover?: boolean;
}

// Interface for persisting agent state
interface AgentState {
  cname: string;
  hasGeneratedAgent: boolean;
  fileSystemData: FileNode[];
  isJsonProcessed: boolean;
  consoleOutput: string[];
  selectedFileName?: string;
  selectedFileContent?: string;
  selectedFilePath?: string;
  fileExtension?: string;
  originalFileContent?: string;
}

@Component({
  selector: 'app-agent-pipeline',
  templateUrl: './agent-pipeline.component.html',
  styleUrls: ['./agent-pipeline.component.scss'],
})
export class AgentPipelineComponent implements OnInit {
  streamItem: StreamingServices;
  cardToggled: boolean = false;
  card: any;
  pipelineAlias: String;
  githubUsername: string = '';

  // API-related properties
  currentUserId: string = 'user123'; // Default user ID for testing
  currentCname: string = ''; // Current container/agent name
  isLoadingFiles: boolean = false;
  // View mode: 'list' shows cards, 'detail' shows script/generate tabs
  viewMode: 'list' | 'detail' = 'list';
  selectedAgent: AgentCard | null = null;

  // Card title
  cardTitle = 'Agent Pipeline';
  lastRefreshedTime: Date | null = null;

  script: any[] = [];
  lang: string;
  loadScript: boolean = false;
  scriptFileName = '';
  dynamicEnvArray: Array<DynamicParamsGrid> = [];
  isExpand: boolean = true;
  uploader: FileUploader;
  cardName: any;
  uploadingCounter = 0;
  uploadingError = false;
  component: any = [];
  linkAuth: boolean;
  relatedComponent: any;
  fileExtension: string = 'py';
  scriptSelected: string;
  runTypes: OptionsDTO[] = [];
  selectedRunType: any;
  runtypesCheck: boolean = true;
  defaultRuntimeFromDB: any;
  defaultRuntime: any;
  fileTreeDataSource = new MatTreeNestedDataSource<FileNode>();
  organisation: any;
  fileStructure: FileNode[] = [];

  data: any = {
    filetype: 'json',
    files: [],
  };

  // Filter properties
  tagrefresh: boolean = false;
  selectedFilterTypes: any = {};

  // JSON Processing Flow
  isJsonProcessed = false;
  dynamicJsonContent: any;
  dynamicFileName: any;
  relatedloaded = false;

  // Console output for Generate SDK Agent
  consoleOutput: string[] = [];
  isGenerating = false;

  // Playground popup
  showPlayground = false;
  hasGeneratedAgent = false;
  playgroundMessages: Array<{ role: 'user' | 'agent'; content: string }> = [];
  userQuestion = '';
  isAgentThinking = false;

  // GitHub Push functionality
  githubRepoName = '';
  selectedBranch = 'main';
  availableBranches: string[] = [
    'main',
    'develop',
    'feature/agent-updates',
    'staging',
    'production',
  ];
  availableRepositories: Array<{ name: string; description?: string }> = [
    {
      name: 'customer-support-agent-sdk',
      description: 'Customer Support Agent SDK',
    },
    { name: 'data-analysis-agent-sdk', description: 'Data Analysis Agent SDK' },
    { name: 'code-review-agent-sdk', description: 'Code Review Agent SDK' },
    {
      name: 'marketing-automation-sdk',
      description: 'Marketing Automation SDK',
    },
    { name: 'content-generator-sdk', description: 'Content Generator SDK' },
    { name: 'chatbot-framework-sdk', description: 'Chatbot Framework SDK' },
  ];
  useCustomCommit = false;
  commitMessage = '';
  isPushing = false;

  // Hardcoded agent cards with fixed cnames
  agentCards: AgentCard[] = [
    {
      cid: '1',
      cname: 'YL79B7', // Short alphanumeric cname for Customer Support Agent
      name: 'customer-support-agent',
      alias: 'Customer Support Agent',
      description:
        'AI-powered customer support agent with knowledge base integration and ticket management',
      type: 'AgentScript',
      language: 'Python3',
      status: 'Active',
      version: '1.2.0',
      lastModified: new Date('2024-11-15'),
      tags: ['customer-service', 'automation', 'nlp'],
      lastmodifiedon: new Date('2024-11-15'),
      createdby: 'admin@example.com',
      hover: false,
    },
    {
      cid: '2',
      cname: 'MK84C7', // Short alphanumeric cname for Data Analysis Agent
      name: 'data-analysis-agent',
      alias: 'Data Analysis Agent',
      description:
        'Automated data analysis and visualization agent for business intelligence',
      type: 'AgentScript',
      language: 'Python3',
      status: 'Active',
      version: '2.0.1',
      lastModified: new Date('2024-11-17'),
      tags: ['analytics', 'bi', 'data-science'],
      lastmodifiedon: new Date('2024-11-17'),
      createdby: 'admin@example.com',
      hover: false,
    },
    {
      cid: '3',
      cname: 'QR53F1', // Short alphanumeric cname for Code Review Agent
      name: 'code-review-agent',
      alias: 'Code Review Agent',
      description:
        'Intelligent code review agent that analyzes pull requests and suggests improvements',
      type: 'AgentScript',
      language: 'Python3',
      status: 'Ready',
      version: '1.0.0',
      lastModified: new Date('2024-11-10'),
      tags: ['code-quality', 'devops', 'automation'],
      lastmodifiedon: new Date('2024-11-10'),
      createdby: 'admin@example.com',
      hover: false,
    },
  ];

  // JSON configuration
  jsonContent = `{
  "agent_name": "customer-support-agent",
  "version": "1.0.0"
}`;

  // File system structure
  fileSystemData: FileNode[] = [];

  // Selected file content for editor
  selectedFileContent = '';
  selectedFileName = '';
  selectedFileId = ''; // File ID for API operations
  selectedFileNode: FileNode | null = null;
  selectedFilePath = '';
  // fileExtension = 'py';
  isFileModified = false;
  isSavingFile = false;

  // Track original content and changes for diff highlighting
  originalFileContent = '';
  modifiedLines: Set<number> = new Set();
  addedLines: Set<number> = new Set();

  // Track user modifications vs API content
  isUserModifiedContent = false;

  // Virtual scrolling properties
  visibleLineStart: number = 0;
  visibleLineEnd: number = 50;
  maxVisibleLines: number = 50;
  currentLineOffset: number = 0;
  visibleLineCount: number = 50;
  totalLineCount: number = 100;

  // Additional dialog properties
  showUnsavedDialog = false;
  pendingAction: (() => void) | null = null;
  userModifiedLines: Set<number> = new Set();
  scrollContainer: HTMLElement | null = null;

  // Drag and Drop functionality
  isDragging = false;
  draggedNode: FileNode | null = null;
  dropTarget: FileNode | null = null;
  showSaveStructureDialog = false;
  originalFileStructure: FileNode[] = [];

  // Save confirmation dialog
  showSaveConfirmationDialog = false;
  pendingNavigation: FileNode | null = null;

  // Delete confirmation dialog
  showDeleteDialog = false;
  isDownloading = false;

  // Hover states
  isHoveredBack = false;
  isHoveredTag = false;
  isHoveredSave = false;
  isHoveredDuplicate = false;
  isBackHovered = false;

  constructor(
    @Inject('envi') private baseUrl: string,

    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private agentPipelineService: AgentPipelineService,
    private service: Services,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.lastRefreshedTime = new Date();
    this.route.params.subscribe((params) => {
      if (params['cname']) {
        this.cardName = params['cname'];
      } else {
        this.cardName = this.streamItem.name;
      }
    });

    this.getStreamService();
    this.getPipelineByName();
  }

  getStreamService() {
    this.service.getStreamingServicesByName(this.cardName).subscribe((res) => {
      this.streamItem = res;
      this.pipelineAlias = res.alias;

      // Load files for code explorer
      // Files will be loaded after data is parsed in try block below

      if (this.router.url.includes('preview')) {
        this.pipelineAlias = this.streamItem.alias;
      }
    
      try {
        if (this.streamItem.json_content) {
          this.dynamicEnvArray = JSON.parse(
            this.streamItem.json_content
          ).environment;
          
        }
        this.data = JSON.parse(
          this.streamItem.json_content
        ).elements[0].attributes;
        this.dynamicEnvArray = JSON.parse(
          this.streamItem.json_content
        ).environment;

        if (this.data.filetype) {
          this.changeLang(this.data.filetype);
        }

        if (this.data.files && this.data.files.length > 0) {
          //  Don't read files here - let buildFileStructure handle it
          this.readFile(this.data.files[0]);
        }

        if (this.data.files == null || this.data.files == undefined) {
          this.data['files'] = [];
          this.loadScript = true;
        }

        // Build file structure for code explorer
        this.buildFileStructure();
      } catch (e) {
        this.loadScript = true;
        console.error('no attribute found in json[element0]');
      }
      this.uploader.onErrorItem = (item, response, status, headers) =>
        this.onErrorItem(item, response, status, headers);
      this.uploader.onSuccessItem = (item, response, status, headers) =>
        this.onSuccessItem(item, response, status, headers);
      //this.getRelatedComponent();

      this.linkAuth = true;
    });
  }

  changeLang(type) {
    switch (type) {
      case 'Python2':
      case 'Python3':
      case 'Jython':
        this.lang = 'python';
        break;
      case 'JavaScript':
        this.lang = 'javascript';
        break;
      default:
        this.lang = undefined;
    }
  }

  
  refeshrelated(event: any) {
    if (event == true) {
      this.relatedloaded = false;
      setTimeout(() => {
       // this.getRelatedComponent();
      }, 2000);
    }
  }
  expandCollapse() {
    this.isExpand = !this.isExpand;
  }

  getPipelineByName() {
    let params: HttpParams = new HttpParams();
    params = params.set('name', this.cardName);
    params = params.set('org', this.organisation);
    this.service.getPipelineByName(params).subscribe((res) => {
      console.log('res', res);
      this.cardTitle = 'Agent Pipeline';
      this.card = res[0];
    });
  }

  onSuccessItem(
    item: FileItem,
    response: string,
    status: number,
    headers: ParsedResponseHeaders
  ): any {
    this.data.files.push(response);
    this.uploadingCounter++;
    if (this.uploadingCounter == this.uploader.queue.length) {
      this.service.message('Uploaded Successfully', 'success');
      this.uploader.clearQueue();
      this.readFile(response);
    }
  }

  onErrorItem(
    item: FileItem,
    response: string,
    status: number,
    headers: ParsedResponseHeaders
  ): any {
    const error = response;
    this.service.message('Error! while uploading file', 'error');
    this.uploadingError = true;
  }

  readFile(filename: string, retryCount = 0) {
    console.log(
      'Reading file:',
      filename,
      'for stream:',
      this.streamItem?.name,
      'org:',
      this.streamItem?.organization,
      'retry:',
      retryCount
    );

    if (!filename || !this.streamItem?.name || !this.streamItem?.organization) {
      console.error('Missing required parameters for readFile:', {
        filename,
        streamName: this.streamItem?.name,
        org: this.streamItem?.organization,
      });
      this.service.message(
        'Error: Missing file or stream information',
        'error'
      );
      return;
    }

    // Encode filename to handle special characters
    const encodedFilename = encodeURIComponent(filename);
    this.scriptFileName = filename;

    this.service
      .readNativeFile(
        this.streamItem.name,
        this.streamItem.organization,
        encodedFilename
      )
      .subscribe({
        next: (resp) => {
          console.log('File read response received for:', filename);
          try {
            const textDecoder = new TextDecoder('utf-8');
            this.script = textDecoder.decode(resp).split('\n');
            this.loadScript = true;
            console.log(
              'Successfully loaded script with',
              this.script.length,
              'lines'
            );

            // Update the selected file in the structure
            if (this.fileStructure.length > 0) {
              this.fileStructure.forEach((file) => {
                file.selected =
                  file.name === filename && file.extension === 'py';
              });
              this.selectedFileNode =
                this.fileStructure.find(
                  (f) => f.name === filename && f.extension === 'py'
                ) || null;
            }

            // Trigger change detection
            this.cdr.detectChanges();
          } catch (e) {
            console.error('Error decoding file:', e);
            this.service.message('Error decoding file content', 'error');
            this.script = [];
            this.loadScript = true;
          }
        },
        error: (err) => {
          console.error(
            'Error while reading file:',
            filename,
            'Attempt:',
            retryCount + 1,
            err
          );

          // Retry logic for file reading errors
          if (retryCount < 3) {
            console.log(
              `Retrying file read in ${(retryCount + 1) * 1000}ms...`
            );
            setTimeout(() => {
              this.readFile(filename, retryCount + 1);
            }, (retryCount + 1) * 1000);
            return;
          }

          // After all retries failed
          let errorMessage = 'Error reading file';
          if (err.status === 404) {
            errorMessage =
              'Python file not found. The file may still be processing.';
          } else if (err.status === 400) {
            errorMessage = 'Invalid file request. Please check the file name.';
          } else if (err.status === 500) {
            errorMessage = 'Server error while reading file. Please try again.';
          } else {
            errorMessage +=
              ': ' + (err.message || err.statusText || 'Unknown error');
          }

          this.service.message(errorMessage, 'error');
          this.script = [];
          this.loadScript = true;
        },
        complete: () => {
          console.log('readNativeFile observable completed for:', filename);
        },
      });
  }

  buildFileStructure() {
    console.log('Building file structure in NativeScript...', this.streamItem);
    this.fileStructure = [];

    if (this.streamItem && this.streamItem.json_content) {
      try {
        const jsonContent = JSON.parse(this.streamItem.json_content);
        const files = jsonContent.elements[0]?.attributes?.files;

        console.log('Raw files array from API:', files);

        if (files && Array.isArray(files) && files.length > 0) {
          // Process each file entry in the files array
          files.forEach((fileEntry: any, index: number) => {
            console.log(
              `Processing file entry ${index}:`,
              fileEntry,
              'Type:',
              typeof fileEntry
            );
            let fileNames: string[] = [];

            // Handle different formats of file entries
            if (typeof fileEntry === 'string') {
              // Check if the file entry is in bracket format like '["file1.py","file2.ipynb"]'
              if (fileEntry.startsWith('[') && fileEntry.endsWith(']')) {
                try {
                  // Try to parse as JSON array first
                  const parsedArray = JSON.parse(fileEntry);
                  if (Array.isArray(parsedArray)) {
                    fileNames = parsedArray.filter(
                      (name) =>
                        typeof name === 'string' && name.trim().length > 0
                    );
                    console.log('Parsed as JSON array:', fileNames);
                  } else {
                    fileNames = [fileEntry.trim()];
                  }
                } catch (e) {
                  console.warn(
                    'Failed to parse as JSON, trying manual parsing:',
                    e
                  );
                  // Fallback: manual parsing of bracket format
                  const cleanEntry = fileEntry.slice(1, -1); // Remove brackets
                  fileNames = cleanEntry
                    .split(',')
                    .map((f) => f.trim().replace(/[\"\']/g, ''))
                    .filter((f) => f.length > 0);
                  console.log('Manually parsed file names:', fileNames);
                }
              } else if (fileEntry.includes(',')) {
                // Handle comma-separated without brackets
                fileNames = fileEntry
                  .split(',')
                  .map((f) => f.trim())
                  .filter((f) => f.length > 0);
                console.log(
                  'Extracted file names from comma-separated format:',
                  fileNames
                );
              } else {
                // Single file name
                fileNames = [fileEntry.trim()];
                console.log('Single file name:', fileNames);
              }
            } else if (Array.isArray(fileEntry)) {
              // Handle direct array entries
              fileNames = fileEntry.filter(
                (name) => typeof name === 'string' && name.trim().length > 0
              );
              console.log('Direct array format:', fileNames);
            } else {
              console.warn(
                'File entry is neither string nor array:',
                fileEntry
              );
              return; // Exit this iteration of forEach
            }

            // Process each extracted file name
            fileNames.forEach((fileName: string) => {
              if (fileName && fileName.length > 0) {
                const cleanFileName = fileName.trim();
                const extension = cleanFileName.split('.').pop()?.toLowerCase();
                console.log(
                  `Processing file: ${cleanFileName}, extension: ${extension}`
                );

                if (extension === 'py' || extension === 'ipynb') {
                  // Check if file already exists in structure to avoid duplicates
                  const existingFile = this.fileStructure.find(
                    (f) => f.name === cleanFileName
                  );
                  if (!existingFile) {
                    this.fileStructure.push({
                      name: cleanFileName,
                      extension: extension,
                      selected: false,
                      type: 'file',
                    });
                    console.log('Added file to structure:', cleanFileName);
                  }
                } else {
                  console.log(
                    'Skipping file with unsupported extension:',
                    cleanFileName
                  );
                }
              }
            });
          });

          console.log('Built file structure:', this.fileStructure);

          // Auto-select the first Python file with a delay to ensure backend is ready
          if (this.fileStructure.length > 0) {
            const firstPyFile = this.fileStructure.find(
              (file) => file.extension === 'py'
            );
            if (firstPyFile) {
              console.log('Auto-selecting Python file:', firstPyFile.name);

              // Mark as selected immediately for UI
              this.fileStructure.forEach((file) => (file.selected = false));
              firstPyFile.selected = true;
              this.selectedFileNode = firstPyFile; // Ensure selectedFileNode is set

              console.log('Set selectedFileNode to:', this.selectedFileNode);

              // If we already have script content, don't reload
              if (this.script && this.script.length > 0) {
                console.log('Script content already available, not reloading');
                this.loadScript = true;
                this.cdr.detectChanges();
              } else {
                // Add delay before reading file to ensure it's available on the server
                setTimeout(() => {
                  this.readFile(firstPyFile.name);
                }, 1000);
              }
            } else {
              console.log('No Python file found, setting loadScript to true');
              // If no Python file found, just set loadScript to true for empty editor
              this.loadScript = true;
              this.selectedFileNode = null;
            }
          } else {
            console.log('No files in structure, setting loadScript to true');
            // No files found, show empty editor
            this.loadScript = true;
          }
        } else {
          console.log('No files found in json_content or files array is empty');
          this.loadScript = true;
        }
      } catch (error) {
        console.error('Error parsing json_content:', error);
        this.loadScript = true;
      }
    } else {
      console.log('No streamItem or json_content available');
      this.loadScript = true;
    }

    this.fileTreeDataSource.data = this.fileStructure;
    console.log('File tree data source updated:', this.fileTreeDataSource.data);

    // Trigger change detection
    this.cdr.detectChanges();
  }

  onScriptChange(newContent: string): void {
    console.log('Script content changed, length:', newContent.length);
  }

  navigateBack(): void {
    if (this.viewMode === 'detail') {
      this.viewMode = 'list';
      this.selectedAgent = null;
      // Clear current state - data will be fetched fresh from API when we return
      this.resetToDashboardState();
    } else {
      this.location.back();
    }
  }

  // Reset state when going back to dashboard
  private resetToDashboardState(): void {
    this.selectedFileName = '';
    this.selectedFileContent = '';
    this.isJsonProcessed = false;
    this.hasGeneratedAgent = false;
    this.currentCname = ''; // Clear cname when going back to dashboard
    this.fileSystemData = [];
    this.consoleOutput = [];
    this.clearFileSelection();
    console.log('Reset state for dashboard navigation');
  }

  onSearch(searchTerm: string): void {
    console.log('Search:', searchTerm);
    // TODO: Implement search functionality
  }

  onRefresh(): void {
    this.lastRefreshedTime = new Date();
    console.log('Refreshed at:', this.lastRefreshedTime);
    // TODO: Implement refresh functionality
  }

  onAdd(): void {
    console.log('Add new agent pipeline');
    // TODO: Implement add functionality
  }

  onTagSelected(tags: any): void {
    console.log('Tags selected:', tags);
    this.tagrefresh = !this.tagrefresh;
    // TODO: Implement tag filtering
  }

  onFilterStatusChange(filters: any): void {
    console.log('Filters changed:', filters);
    // TODO: Implement filter functionality
  }

  viewDetails(agent: AgentCard): void {
    this.selectedAgent = agent;

    // this.viewMode = 'detail';

    // Special handling for QR53F1 - generate new cname each time
    if (agent.cname === 'QR53F1') {
      // Generate a new random cname for fresh generation
      this.currentCname = this.agentPipelineService.generateRandomCname();
      console.log(
        'QR53F1 detected - using new random cname:',
        this.currentCname
      );
      // Always show fresh generation state
      this.resetToInitialStateForNewAgent();
    } else {
      // For other agents, use their fixed cname and check for existing files
      this.currentCname = agent.cname;
      console.log('Loading agent with fixed cname:', agent.cname);
      // Always check for existing files first
      this.checkForExistingFilesAndLoadState(agent.cname);
    }

    // Update JSON content based on selected agent
    this.updateJsonContent(agent);
  }

  // Save current file changes
  async saveFile(): Promise<void> {
    if (!this.selectedFileNode || !this.isFileModified || !this.currentCname) {
      return;
    }

    this.isSavingFile = true;
    try {
      console.log('Saving file:', this.selectedFileName);

      // Update the node content first
      this.selectedFileNode.content = this.selectedFileContent;

      // Call the bulk update API with the modified file
      const result = await this.agentPipelineService
        .updateFileContent(
          this.currentCname,
          this.selectedFileNode.id!,
          this.selectedFileName,
          this.selectedFileContent,
          this.selectedFilePath
        )
        .toPromise();

      console.log('File saved successfully via bulk update API:', result);

      this.isFileModified = false;
      this.isUserModifiedContent = false;
      this.userModifiedLines.clear();

      // Update original content and reset diff tracking after successful save
      this.originalFileContent = this.selectedFileContent;
      this.resetDiffTracking();

      // Show success message with properly formatted response
      const successResponse = { status: 200, body: result || [] };
      this.service.messageService(successResponse, 'File saved successfully!');
    } catch (error) {
      console.error('Error saving file:', error);
      // Show error message
      this.service.messageService(error);
    } finally {
      this.isSavingFile = false;
    }
  }

  // Show delete confirmation dialog
  showDeleteConfirmation(): void {
    if (
      !this.selectedFileNode ||
      !this.currentCname ||
      !this.selectedFileName
    ) {
      console.log('Cannot delete: missing file info', {
        hasFileNode: !!this.selectedFileNode,
        hasCname: !!this.currentCname,
        hasFileName: !!this.selectedFileName,
      });
      return;
    }

    if (this.isSavingFile) {
      console.log('Cannot delete: file is currently being saved');
      return;
    }

    console.log('Showing delete confirmation for:', this.selectedFileName);
    this.showDeleteDialog = true;
  }

  // Delete current file
  async deleteFile(): Promise<void> {
    if (!this.selectedFileNode || !this.currentCname) {
      return;
    }

    this.isSavingFile = true; // Reuse the saving flag for UI state
    try {
      console.log(
        'Deleting file:',
        this.selectedFileName,
        'with ID:',
        this.selectedFileId
      );

      // Call the delete API with just the file ID
      const result = await this.agentPipelineService
        .deleteFile(this.selectedFileId)
        .toPromise();

      console.log('File deleted successfully:', result);

      // Update the file tree with the response
      if (result && Array.isArray(result)) {
        this.fileSystemData =
          this.agentPipelineService.buildFileTreeFromApiResponse(result);
      }

      // Clear the editor
      this.selectedFileName = '';
      this.selectedFileContent = '';
      this.selectedFileNode = null;
      this.selectedFilePath = '';
      this.selectedFileId = '';
      this.isFileModified = false;
      this.userModifiedLines.clear();
      this.resetDiffTracking();

      // Show success message with properly formatted response
      const successResponse = { status: 200, body: result || [] };
      this.service.messageService(
        successResponse,
        'File deleted successfully!'
      );
    } catch (error) {
      console.error('Error deleting file:', error);
      // Show error message
      this.service.messageService(error);
    } finally {
      this.isSavingFile = false;
    }
  }

  // Close file with unsaved changes check
  closeFile(): void {
    if (this.isFileModified) {
      console.log('Showing save confirmation dialog for file close');
      this.pendingNavigation = null; // No specific navigation target, just closing
      this.showSaveConfirmationDialog = true;
      return;
    }

    // No unsaved changes, close immediately
    this.selectedFileName = '';
    this.selectedFileContent = '';
    this.selectedFileNode = null;
    this.selectedFilePath = '';
    this.isFileModified = false;
    this.userModifiedLines.clear();
    this.resetDiffTracking();
  }

  // Keyboard shortcut for saving files (Ctrl+S)
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (
      event.ctrlKey &&
      event.key === 's' &&
      this.selectedFileName &&
      this.isFileModified
    ) {
      event.preventDefault();
      this.saveFile();
    }

    // Ctrl+C for copying file content when editor is focused
    if (
      event.ctrlKey &&
      event.key === 'c' &&
      this.selectedFileName &&
      event.altKey
    ) {
      event.preventDefault();
      this.copyFileContent();
    }

    // Ctrl+W for closing file
    if (event.ctrlKey && event.key === 'w' && this.selectedFileName) {
      event.preventDefault();
      this.closeFile();
    }
  }

  updateJsonContent(agent: AgentCard): void {
    this.jsonContent = `{
  "agent_name": "${agent.name}",
  "version": "${agent.version}",
  "description": "${agent.description}",
  "configuration": {
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 2000,
    "tools": ${JSON.stringify(this.getToolsForAgent(agent.name), null, 6)}
  },
  "runtime": {
    "type": "${agent.language}",
    "dependencies": [
      "openai>=1.0.0",
      "requests>=2.28.0",
      "python-dotenv>=0.19.0"
    ]
  }
}`;
  }

  getToolsForAgent(agentName: string): any[] {
    const toolsMap: any = {
      'customer-support-agent': [
        {
          name: 'search_knowledge_base',
          description: 'Search the knowledge base for relevant articles',
        },
        { name: 'create_ticket', description: 'Create a support ticket' },
        {
          name: 'get_customer_info',
          description: 'Retrieve customer information',
        },
      ],
      'data-analysis-agent': [
        { name: 'load_dataset', description: 'Load and preprocess datasets' },
        {
          name: 'generate_visualizations',
          description: 'Create charts and graphs',
        },
        {
          name: 'run_statistical_analysis',
          description: 'Perform statistical computations',
        },
      ],
      'code-review-agent': [
        {
          name: 'analyze_code_quality',
          description: 'Check code quality metrics',
        },
        {
          name: 'detect_vulnerabilities',
          description: 'Scan for security issues',
        },
        {
          name: 'suggest_improvements',
          description: 'Provide code optimization suggestions',
        },
      ],
    };
    return toolsMap[agentName] || [];
  }

  updateFileSystemData(agent: AgentCard): void {
    // This method is now replaced by loadAgentFiles()
    // which is called after successful agent generation
    this.loadAgentFiles();
  }

  loadAgentFiles(): void {
    if (!this.currentCname) {
      console.warn('No container name available for loading files');
      return;
    }

    this.isLoadingFiles = true;

    this.agentPipelineService.getAgentFiles(this.currentCname).subscribe({
      next: (apiResponse) => {
        console.log('Building file tree from API response:', apiResponse);
        this.fileSystemData =
          this.agentPipelineService.buildFileTreeFromApiResponse(apiResponse);
        this.isLoadingFiles = false;
      },
      error: (error) => {
        console.error('Error loading agent files:', error);
        this.isLoadingFiles = false;
        this.fileSystemData = [];

        // Show error message to user
        alert(`Failed to load agent files: ${error.message}`);
      },
    });
  }

  // Track user modifications for neon green highlighting
  onUserContentChange(newContent: string): void {
    this.isUserModifiedContent = true;
    this.selectedFileContent = newContent;
    this.isFileModified = true;

    // Track which lines are user-modified
    this.trackUserModifiedLines();
  }

  // Track which lines have been modified by user
  private trackUserModifiedLines(): void {
    const originalLines = this.originalFileContent.split('\n');
    const currentLines = this.selectedFileContent.split('\n');

    this.userModifiedLines.clear();

    // Compare lines to find user modifications
    const maxLines = Math.max(originalLines.length, currentLines.length);
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || '';
      const currentLine = currentLines[i] || '';

      if (originalLine !== currentLine) {
        this.userModifiedLines.add(i);
      }
    }

    // Don't set isUserModifiedContent to prevent whole textarea styling

    console.log('User modification tracking complete:', {
      modifiedLines: this.userModifiedLines.size,
      totalOriginalLines: originalLines.length,
      totalCurrentLines: currentLines.length,
      modifiedLineNumbers: Array.from(this.userModifiedLines),
    });
  }

  // Get CSS class for user-modified lines
  getUserModifiedLineClass(lineIndex: number): string {
    if (this.isUserModifiedContent && this.userModifiedLines.has(lineIndex)) {
      return 'user-modified-line';
    }
    return '';
  }

  // Virtual scrolling methods
  initializeVirtualScrolling(): void {
    this.scrollContainer = document.querySelector('.line-numbers-gutter');
    if (this.scrollContainer) {
      this.scrollContainer.addEventListener(
        'scroll',
        this.onLineNumbersScroll.bind(this)
      );
    }
    this.updateTotalLineCount();
  }

  onLineNumbersScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;
    const itemHeight = 20; // Height of each line number

    const newOffset = Math.floor(scrollTop / itemHeight);
    if (newOffset !== this.currentLineOffset) {
      this.currentLineOffset = newOffset;
      this.updateVisibleLines();
    }
  }

  updateVisibleLines(): void {
    const endLine = Math.min(
      this.currentLineOffset + this.visibleLineCount,
      this.totalLineCount
    );
    // Update visible line range
  }

  getVisibleLineNumbers(): number[] {
    const start = this.currentLineOffset;
    const end = Math.min(start + this.visibleLineCount, this.totalLineCount);
    return Array.from({ length: end - start }, (_, i) => start + i + 1);
  }

  // Sync line numbers with textarea scroll - fix dual scrollbar issue
  onTextareaScroll(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const scrollTop = textarea.scrollTop;

    // Calculate visible line range based on scroll position
    const lineHeight = 20; // matches CSS line-height
    this.currentLineOffset = Math.floor(scrollTop / lineHeight);
    this.visibleLineStart = this.currentLineOffset;
    this.visibleLineEnd = Math.min(
      this.visibleLineStart + this.visibleLineCount,
      this.totalLineCount
    );
  }

  // Check if user can navigate away from unsaved changes
  canNavigateAway(): boolean {
    // Allow navigation if no modifications
    if (!this.isFileModified) {
      return true;
    }

    // Block navigation if there are unsaved changes - show custom dialog instead of browser alert
    console.log('Navigation blocked - unsaved changes detected');
    return false;
  }

  // Show save confirmation dialog before navigation
  confirmNavigation(targetNode: FileNode): void {
    if (this.canNavigateAway()) {
      this.selectFile(targetNode);
    } else {
      this.pendingNavigation = targetNode;
      this.showSaveConfirmationDialog = true;
    }
  }

  // Handle save and continue navigation
  async saveAndContinue(): Promise<void> {
    try {
      await this.saveFile();
      this.showSaveConfirmationDialog = false;
      if (this.pendingNavigation) {
        const targetNode = this.pendingNavigation;
        this.pendingNavigation = null;
        this.selectFile(targetNode);
      }
    } catch (error) {
      console.error('Failed to save file:', error);
      // Handle save error - maybe show error dialog
    }
  }

  // Handle discard changes and continue navigation
  discardAndContinue(): void {
    console.log('Discarding changes and continuing...');

    // Restore original content
    this.selectedFileContent = this.originalFileContent;
    this.isFileModified = false;
    this.userModifiedLines.clear();
    this.modifiedLines.clear();
    this.addedLines.clear();

    this.showSaveConfirmationDialog = false;

    if (this.pendingNavigation) {
      // Navigate to new file
      const targetNode = this.pendingNavigation;
      this.pendingNavigation = null;
      this.selectFile(targetNode);
    } else {
      // Just close the current file
      this.selectedFileName = '';
      this.selectedFileContent = '';
      this.selectedFileNode = null;
      this.selectedFilePath = '';
      this.isFileModified = false;
      this.userModifiedLines.clear();
      this.resetDiffTracking();
    }
  }

  // Cancel navigation and stay on current file
  cancelNavigation(): void {
    this.showSaveConfirmationDialog = false;
    this.pendingNavigation = null;
  }

  /**
   * Download all files as a ZIP archive
   */
  downloadAllFiles(): void {
    if (!this.currentCname) {
      console.error('No container name available for download');
      return;
    }

    this.isDownloading = true;

    this.agentPipelineService
      .downloadAllFilesAsZip(this.currentCname, 'leo1311')
      .subscribe({
        next: (blob: Blob) => {
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${this.currentCname}-leo1311.zip`;

          // Trigger download
          document.body.appendChild(link);
          link.click();

          // Cleanup
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          console.log('Download completed successfully');
          // Create a properly formatted success response for messageService
          const successResponse = { status: 200, body: [] };
          this.service.messageService(
            successResponse,
            'Files downloaded successfully!'
          );
        },
        error: (error) => {
          console.error('Error downloading files:', error);
          this.service.messageService(error);
        },
        complete: () => {
          this.isDownloading = false;
        },
      });
  }

  // Confirm delete action
  confirmDelete(): void {
    this.showDeleteDialog = false;
    this.deleteFile();
  }

  // Cancel delete action
  cancelDelete(): void {
    this.showDeleteDialog = false;
  }

  // Show custom unsaved changes dialog
  showUnsavedChangesDialog(action: () => void): void {
    if (this.isFileModified) {
      this.pendingAction = action;
      this.showUnsavedDialog = true;
    } else {
      action();
    }
  }

  // Cancel unsaved dialog
  cancelUnsavedDialog(): void {
    this.showUnsavedDialog = false;
    this.pendingAction = null;
  }

  // Proceed without saving changes
  proceedWithoutSaving(): void {
    this.showUnsavedDialog = false;

    // Reset content to original
    this.selectedFileContent = this.originalFileContent;
    this.isFileModified = false;
    this.userModifiedLines.clear();

    // Execute pending action
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
  }

  // Save and then proceed with pending action
  async saveAndProceed(): Promise<void> {
    try {
      await this.saveFile();
      this.showUnsavedDialog = false;

      // Execute pending action after successful save
      if (this.pendingAction) {
        this.pendingAction();
        this.pendingAction = null;
      }
    } catch (error) {
      console.error('Failed to save file before proceeding:', error);
      // Don't proceed if save failed
    }
  }

  // Simulate byte array response from API
  simulateByteArrayResponse(fileId: string): number[] {
    const content = this.getSampleFileContent(fileId);
    // Convert string to byte array simulation
    const byteArray = [];
    for (let i = 0; i < content.length; i++) {
      byteArray.push(content.charCodeAt(i));
    }
    return byteArray;
  }

  // Convert byte array to string (as would be done in real implementation)
  convertByteArrayToString(byteArray: number[]): string {
    return String.fromCharCode(...byteArray);
  }

  getClassName(agentName: string): string {
    return (
      agentName
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('') + 'Agent'
    );
  }

  getMainPyContent(agentName: string): string {
    const className = this.getClassName(agentName);
    const tools = this.getToolsForAgent(agentName);

    const toolMethods = tools
      .map(
        (tool: any) => `
    def ${tool.name}(self, *args, **kwargs):
        """${tool.description}"""
        # Implementation here
        return {"status": "success", "data": {}}`
      )
      .join('\n');

    return `import os
from openai import OpenAI
from dotenv import load_dotenv
from typing import Dict, Any

# Load environment variables
load_dotenv()

class ${className}:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-4"
        self.tools = ${JSON.stringify(tools, null, 8)}
${toolMethods}
    
    def process_request(self, message: str) -> str:
        """Process ${agentName.replace(/-/g, ' ')} request"""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a helpful AI agent."},
                {"role": "user", "content": message}
            ],
            tools=self.tools,
            tool_choice="auto"
        )
        return response.choices[0].message.content
    
    def run(self):
        """Main execution loop"""
        print("${className} initialized successfully!")
        print(f"Available tools: {[tool['name'] for tool in self.tools]}")

if __name__ == "__main__":
    agent = ${className}()
    agent.run()
`;
  }

  getToolsPyContent(agentName: string): string {
    const tools = this.getToolsForAgent(agentName);
    const toolFunctions = tools
      .map(
        (tool: any) => `
def ${tool.name}(*args, **kwargs):
    """${tool.description}"""
    # Implementation
    pass`
      )
      .join('\n');

    return `"""
Agent tools and utilities for ${agentName}
"""
${toolFunctions}

class AgentToolkit:
    """Collection of tools for the agent"""
    
    def __init__(self):
        self.tools = {
${tools.map((t: any) => `            '${t.name}': ${t.name}`).join(',\n')}
        }
    
    def execute_tool(self, tool_name: str, *args, **kwargs):
        """Execute a tool by name"""
        if tool_name in self.tools:
            return self.tools[tool_name](*args, **kwargs)
        raise ValueError(f"Tool {tool_name} not found")
`;
  }

  onJsonChange(event: any): void {
    this.jsonContent = event.join('\n');
  }

  onFileContentChange(event: any): void {
    const newContent = event.join('\n');
    if (newContent !== this.selectedFileContent) {
      this.isFileModified = true;
      // Don't set isUserModifiedContent to prevent whole editor styling
      this.updateDiffTracking(newContent);
      this.selectedFileContent = newContent;
      this.trackUserModifiedLines();
      this.updateTotalLineCount();
    }
  }

  // Handle text content changes for non-Python files
  onTextContentChange(newContent: string): void {
    console.log(
      'onTextContentChange called with content length:',
      newContent.length
    );
    console.log('Current content length:', this.selectedFileContent.length);
    console.log('Original content length:', this.originalFileContent.length);

    // Store the previous content for comparison
    const previousContent = this.selectedFileContent;

    // Update the content
    this.selectedFileContent = newContent;

    // Check if this represents a real change from the original
    const hasChangesFromOriginal =
      this.selectedFileContent !== this.originalFileContent;
    const hasChangesFromPrevious = this.selectedFileContent !== previousContent;

    console.log('Content comparison:', {
      hasChangesFromOriginal,
      hasChangesFromPrevious,
      isTyping: hasChangesFromPrevious && hasChangesFromOriginal,
    });

    if (hasChangesFromOriginal) {
      this.isFileModified = true;
      // Don't set isUserModifiedContent to prevent textarea styling
      this.updateDiffTracking(newContent);
      this.trackUserModifiedLines();
      this.updateTotalLineCount();

      console.log('Content changed - flags set:', {
        isFileModified: this.isFileModified,
        userModifiedLines: this.userModifiedLines.size,
      });
    } else {
      // Reset flags if content matches original
      this.isFileModified = false;
      this.userModifiedLines.clear();

      console.log('Content matches original - flags reset');
    }
  }

  // Update total line count for virtual scrolling
  updateTotalLineCount(): void {
    this.totalLineCount = this.selectedFileContent.split('\n').length;
  }

  // Reset diff tracking
  resetDiffTracking(): void {
    this.modifiedLines.clear();
    this.addedLines.clear();
  }

  // Get current lines for display
  getCurrentLines(): string[] {
    return this.selectedFileContent.split('\n');
  }

  // Update diff tracking when content changes
  updateDiffTracking(newContent: string): void {
    const originalLines = this.originalFileContent.split('\n');
    const newLines = newContent.split('\n');

    this.modifiedLines.clear();
    this.addedLines.clear();

    // Simple diff algorithm
    const maxLines = Math.max(originalLines.length, newLines.length);

    for (let i = 0; i < newLines.length; i++) {
      const newLine = newLines[i] || '';
      const originalLine = originalLines[i] || '';

      if (i >= originalLines.length) {
        // New line added
        this.addedLines.add(i);
      } else if (originalLine !== newLine) {
        // Line was modified
        this.modifiedLines.add(i);
      }
    }

    // Handle case where lines were deleted (mark previous line as modified)
    if (newLines.length < originalLines.length) {
      for (let i = newLines.length; i < originalLines.length; i++) {
        if (newLines.length > 0) {
          this.modifiedLines.add(newLines.length - 1);
        }
      }
    }
  }

  // Get line classes for styling
  getLineClasses(lineIndex: number): string[] {
    const classes: string[] = [];

    if (this.addedLines.has(lineIndex)) {
      classes.push('line-added');
    } else if (this.modifiedLines.has(lineIndex)) {
      classes.push('line-modified');
    }

    return classes;
  }

  // Check if a line is modified or added
  isLineChanged(lineIndex: number): boolean {
    return this.addedLines.has(lineIndex) || this.modifiedLines.has(lineIndex);
  }

  // Get diff statistics for display
  getDiffStats(): { added: number; modified: number; total: number } {
    return {
      added: this.addedLines.size,
      modified: this.modifiedLines.size,
      total: this.addedLines.size + this.modifiedLines.size,
    };
  }

  // Get current line content for display
  // Toggle folder expand/collapse
  toggleFolder(node: FileNode, event: Event): void {
    event.stopPropagation(); // Prevent file selection when clicking folder toggle
    if (node.type === 'folder') {
      node.expanded = !node.expanded;
    }
  }

  // Check if folder is expanded (default to true for root folders)
  isFolderExpanded(node: FileNode): boolean {
    if (node.type !== 'folder') return false;
    return node.expanded !== false; // Default to expanded if not explicitly set
  }

  // Drag and Drop Methods
  onDragStart(event: DragEvent, node: FileNode): void {
    this.isDragging = true;
    this.draggedNode = node;
    this.originalFileStructure = JSON.parse(
      JSON.stringify(this.fileSystemData)
    ); // Deep copy

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', node.name);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragEnter(event: DragEvent, node: FileNode): void {
    event.preventDefault();
    if (node.type === 'folder' && node !== this.draggedNode) {
      this.dropTarget = node;
      // Add visual feedback
      (event.currentTarget as HTMLElement)?.classList.add('drag-over');
    }
  }

  onDragLeave(event: DragEvent): void {
    (event.currentTarget as HTMLElement)?.classList.remove('drag-over');
  }

  onDrop(event: DragEvent, targetNode: FileNode): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement)?.classList.remove('drag-over');

    if (!this.draggedNode || !targetNode || this.draggedNode === targetNode) {
      return;
    }

    if (targetNode.type === 'folder') {
      this.moveNodeToFolder(this.draggedNode, targetNode);
      this.showSaveStructureDialog = true;
    }

    this.isDragging = false;
    this.draggedNode = null;
    this.dropTarget = null;
  }

  private moveNodeToFolder(sourceNode: FileNode, targetFolder: FileNode): void {
    // Remove from current location
    this.removeNodeFromStructure(sourceNode, this.fileSystemData);

    // Add to target folder
    if (!targetFolder.children) {
      targetFolder.children = [];
    }

    // Update the path correctly
    const newPath = this.buildNewPath(targetFolder, sourceNode);
    sourceNode.path = newPath;

    // Add to target folder and sort
    targetFolder.children.push(sourceNode);
    // Note: Sorting is handled by the service method

    // Update the selected file path if it's currently selected
    if (this.selectedFileNode === sourceNode) {
      this.selectedFilePath = newPath;
    }

    console.log(
      `Moved ${sourceNode.name} to ${targetFolder.name}. New path: ${newPath}`
    );
  }

  private removeNodeFromStructure(
    nodeToRemove: FileNode,
    nodes: FileNode[]
  ): boolean {
    const index = nodes.findIndex((node) => node === nodeToRemove);
    if (index !== -1) {
      nodes.splice(index, 1);
      return true;
    }

    for (const node of nodes) {
      if (
        node.children &&
        this.removeNodeFromStructure(nodeToRemove, node.children)
      ) {
        return true;
      }
    }

    return false;
  }

  private buildNewPath(targetFolder: FileNode, sourceNode: FileNode): string {
    const targetPath = this.getFullNodePath(targetFolder);
    if (targetPath) {
      return `${targetPath}/${sourceNode.name}`;
    }
    return sourceNode.name;
  }

  private getFullNodePath(node: FileNode): string {
    // First, try to get the path from the node itself if it exists
    if (node.path && node.path !== node.name) {
      return node.path;
    }

    // Otherwise, build the path by finding the node in the tree
    const pathParts: string[] = [];
    if (this.findNodePath(node, this.fileSystemData, pathParts)) {
      return pathParts.join('/');
    }

    return node.name;
  }

  private findNodePath(
    targetNode: FileNode,
    nodes: FileNode[],
    currentPath: string[]
  ): boolean {
    for (const node of nodes) {
      // Check if this is the target node
      if (node === targetNode) {
        currentPath.push(node.name);
        return true;
      }

      // Search in children if this is a folder
      if (node.children && node.children.length > 0) {
        currentPath.push(node.name);
        if (this.findNodePath(targetNode, node.children, currentPath)) {
          return true;
        }
        currentPath.pop(); // Remove this node from path if not found in this branch
      }
    }
    return false;
  }

  // Save structure dialog methods
  saveNewFileStructure(): void {
    if (!this.currentCname) {
      console.error('No container name available for saving file structure');
      return;
    }

    // Call bulk update API to save new structure
    this.agentPipelineService
      .updateFileStructure(this.currentCname, this.fileSystemData)
      .subscribe({
        next: (result) => {
          console.log(
            'File structure saved successfully via bulk update API:',
            result
          );
          this.showSaveStructureDialog = false;
          this.originalFileStructure = [];

          // Show success message with properly formatted response
          const successResponse = { status: 200, body: result || [] };
          this.service.messageService(
            successResponse,
            'File structure updated successfully!'
          );
        },
        error: (error) => {
          console.error('Failed to save file structure:', error);
          this.service.messageService(error);

          // Restore original structure on error
          this.fileSystemData = JSON.parse(
            JSON.stringify(this.originalFileStructure)
          );
          this.showSaveStructureDialog = false;
          this.originalFileStructure = [];
        },
      });
  }

  cancelStructureChange(): void {
    // Restore original structure
    this.fileSystemData = JSON.parse(
      JSON.stringify(this.originalFileStructure)
    );
    this.showSaveStructureDialog = false;
    this.originalFileStructure = [];
  }

  // Generate CSS background gradients for line diff highlighting
  getLineDiffStyles(): string {
    if (!this.isFileModified) {
      return 'none';
    }

    const lines = this.getCurrentLines();
    const lineHeight = 20; // pixels
    const gradients: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const yStart = i * lineHeight;
      const yEnd = (i + 1) * lineHeight;

      if (this.addedLines.has(i)) {
        gradients.push(
          `linear-gradient(to right, rgba(40, 167, 69, 0.3) 0%, rgba(40, 167, 69, 0.3) 100%) 0 ${yStart}px / 100% ${lineHeight}px no-repeat`
        );
      } else if (this.modifiedLines.has(i)) {
        gradients.push(
          `linear-gradient(to right, rgba(255, 149, 0, 0.3) 0%, rgba(255, 149, 0, 0.3) 100%) 0 ${yStart}px / 100% ${lineHeight}px no-repeat`
        );
      }
    }

    return gradients.length > 0 ? gradients.join(', ') : 'none';
  }

  // Get file type class for styling
  getFileTypeClass(fileName: string): string {
    if (fileName.endsWith('.py')) return 'python-file';
    if (fileName.endsWith('.json')) return 'json-file';
    if (fileName.endsWith('.java')) return 'java-file';
    if (fileName.endsWith('.xml')) return 'xml-file';
    if (fileName.endsWith('.properties')) return 'properties-file';
    if (fileName.endsWith('.md')) return 'markdown-file';
    return 'text-file';
  }

  // Get file icon based on file type
  getFileIcon(fileName: string): string {
    if (fileName.endsWith('.py')) return 'code';
    if (fileName.endsWith('.json')) return 'data_object';
    if (fileName.endsWith('.java')) return 'code';
    if (fileName.endsWith('.xml')) return 'code';
    if (fileName.endsWith('.properties')) return 'settings';
    if (fileName.endsWith('.md')) return 'description';
    return 'insert_drive_file';
  }

  // Copy file content to clipboard
  copyFileContent(): void {
    if (this.selectedFileContent) {
      navigator.clipboard
        .writeText(this.selectedFileContent)
        .then(() => {
          console.log('File content copied to clipboard');
          // You can add a snackbar notification here
        })
        .catch((err) => {
          console.error('Failed to copy content: ', err);
        });
    }
  }

  // Syntax highlighting for JSON
  highlightJsonSyntax(line: string): string {
    if (!line.trim()) return '&nbsp;';

    return line
      .replace(/("[^"]*":\s*)/g, '<span class="json-key">$1</span>')
      .replace(/:\s*("([^"]*)")/g, ': <span class="json-string">$1</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
      .replace(
        /:\s*(true|false|null)/g,
        ': <span class="json-literal">$1</span>'
      )
      .replace(/([{}[\],])/g, '<span class="json-punctuation">$1</span>');
  }

  // Basic syntax highlighting for other file types
  highlightCodeSyntax(line: string, extension: string): string {
    if (!line.trim()) return '&nbsp;';

    let highlightedLine = line;

    // Common patterns for different file types
    if (extension === 'xml') {
      highlightedLine = highlightedLine
        .replace(
          /(&lt;\/?)([a-zA-Z0-9-]+)/g,
          '<span class="xml-tag">$1$2</span>'
        )
        .replace(/([a-zA-Z-]+)(=)/g, '<span class="xml-attribute">$1</span>$2')
        .replace(/(="[^"]*")/g, '<span class="xml-value">$1</span>');
    } else if (extension === 'java') {
      highlightedLine = highlightedLine
        .replace(
          /\b(public|private|protected|static|final|class|interface|extends|implements|import|package)\b/g,
          '<span class="java-keyword">$1</span>'
        )
        .replace(
          /\b(String|int|boolean|void|Object)\b/g,
          '<span class="java-type">$1</span>'
        )
        .replace(/(\/\/.*$)/g, '<span class="java-comment">$1</span>');
    } else if (extension === 'properties') {
      highlightedLine = highlightedLine
        .replace(
          /^([^=]+)(=)/g,
          '<span class="prop-key">$1</span><span class="prop-equals">$2</span>'
        )
        .replace(/(#.*$)/g, '<span class="prop-comment">$1</span>');
    }

    return highlightedLine;
  }

  saveChanges(): void {
    console.log('Saving changes...');
    // Implementation for saving
  }

  duplicateAgent(): void {
    console.log('Duplicating agent...');
    // Implementation for duplication
  }

  openTagModal(): void {
    console.log('Opening tag modal...');
    // Implementation for tags
  }

  // Generate sample file content based on file ID and type
  getSampleFileContent(fileId: string): string {
    const fileMap: { [key: string]: string } = {
      '1': `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <groupId>com.example</groupId>
    <artifactId>zip-upload</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    
    <name>Zip Upload Service</name>
    <description>Service for handling zip file uploads and processing</description>
</project>`,
      '2': `# Application Configuration
server.port=8080
spring.application.name=zip-upload-service

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Database Configuration
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true`,
      '3': `package com.example.zipupload;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ZipUploadApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZipUploadApplication.class, args);
    }

}`,
      '4': `package com.example.zipupload.service;

import org.springframework.stereotype.Service;
import java.io.*;
import java.util.zip.*;
import java.util.List;
import java.util.ArrayList;

@Service
public class ZipProcessingService {

    public List<String> extractZipFile(InputStream zipInputStream) throws IOException {
        List<String> extractedFiles = new ArrayList<>();
        
        try (ZipInputStream zis = new ZipInputStream(zipInputStream)) {
            ZipEntry zipEntry;
            while ((zipEntry = zis.getNextEntry()) != null) {
                if (!zipEntry.isDirectory()) {
                    extractedFiles.add(zipEntry.getName());
                    // Process file content here
                }
                zis.closeEntry();
            }
        }
        
        return extractedFiles;
    }
}`,
      '5': `package com.example.zipupload.repository;

import com.example.zipupload.entity.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    List<FileEntity> findByUserId(String userId);
}`,
      '6': `package com.example.zipupload.entity;

import javax.persistence.*;

@Entity
@Table(name = "files")
public class FileEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "file_name")
    private String fileName;
    
    @Column(name = "file_path")
    private String filePath;
    
    @Lob
    @Column(name = "content")
    private byte[] content;
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    
    public byte[] getContent() { return content; }
    public void setContent(byte[] content) { this.content = content; }
}`,
      '7': `package com.example.zipupload.controller;

import com.example.zipupload.service.ZipProcessingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/zip")
public class ZipController {

    @Autowired
    private ZipProcessingService zipProcessingService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadZip(
            @RequestParam("userId") String userId,
            @RequestParam("file") MultipartFile file) {
        try {
            List<String> extractedFiles = zipProcessingService.extractZipFile(file.getInputStream());
            return ResponseEntity.ok("Files processed successfully: " + extractedFiles.size());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing zip file: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, String>>> getFilesForUser(@PathVariable String userId) {
        // Implementation here
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/download/{fileId}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long fileId) {
        // Implementation here
        return ResponseEntity.ok(new byte[0]);
    }
}`,
    };

    return (
      fileMap[fileId] ||
      `// File content for ID: ${fileId}\n// This is a sample file generated from the API response\n// In a real implementation, this would be fetched from the backend`
    );
  }

  // File system methods
  selectFile(node: FileNode): void {
    if (node.type === 'file') {
      // Check if there are unsaved changes before switching files
      if (this.isFileModified) {
        // Use custom dialog instead of browser confirm
        this.showUnsavedChangesDialog(() => {
          this.proceedWithFileSelection(node);
        });
        return;
      }

      // No unsaved changes, proceed directly
      this.proceedWithFileSelection(node);
    }
  }

  // New method to handle file selection after confirmation
  private async proceedWithFileSelection(node: FileNode): Promise<void> {
    this.selectedFileName = node.name;
    this.selectedFileNode = node;
    this.selectedFilePath = node.path || node.name;
    this.selectedFileId = node.id || ''; // Store the file ID
    this.isFileModified = false;

    // Set file extension
    if (node.name.endsWith('.py')) {
      this.fileExtension = 'py';
    } else if (node.name.endsWith('.json')) {
      this.fileExtension = 'json';
    } else if (node.name.endsWith('.java')) {
      this.fileExtension = 'java';
    } else if (node.name.endsWith('.xml')) {
      this.fileExtension = 'xml';
    } else if (node.name.endsWith('.properties')) {
      this.fileExtension = 'properties';
    } else if (node.name.endsWith('.md')) {
      this.fileExtension = 'markdown';
    } else {
      this.fileExtension = 'txt';
    }

    // Use content directly from the file node (already loaded from upload API)
    this.selectedFileContent = node.content || 'No content available';
    this.originalFileContent = this.selectedFileContent; // Store original content
    this.isUserModifiedContent = false; // Reset user modification flag
    this.userModifiedLines.clear(); // Clear user modified lines
    this.resetDiffTracking(); // Reset diff tracking

    // Initialize virtual scrolling
    this.currentLineOffset = 0;
    this.updateTotalLineCount();
    setTimeout(() => this.initializeVirtualScrolling(), 100);

    console.log(
      'Selected file:',
      this.selectedFileName,
      'Extension:',
      this.fileExtension,
      'Path:',
      this.selectedFilePath,
      'Content length:',
      this.selectedFileContent.length
    );
  }

  isFileSelected(node: FileNode): boolean {
    return node.type === 'file' && node.name === this.selectedFileName;
  }

  getFileLanguage(fileName: string): string {
    if (fileName.endsWith('.py')) return 'python';
    if (fileName.endsWith('.json')) return 'json';
    if (fileName.endsWith('.md')) return 'markdown';
    if (fileName.endsWith('.txt')) return 'text';
    return 'text';
  }

  /**
   * Check if Generate Agent button should be disabled
   * - Disabled when already generating
   * - Disabled when agent has already been generated (files exist)
   * - Disabled when files exist in the codespace
   */
  get isGenerateAgentDisabled(): boolean {
    return (
      this.isGenerating || this.hasGeneratedAgent || this.hasExistingFiles()
    );
  }

  /**
   * Check if agent has existing files in the codespace
   */
  hasExistingFiles(): boolean {
    return this.fileSystemData && this.fileSystemData.length > 0;
  }

  /**
   * Get tooltip text for Generate Agent button
   */
  getGenerateButtonTooltip(): string {
    if (this.isGenerating) {
      return 'Agent generation is in progress...';
    }
    if (this.hasGeneratedAgent || this.hasExistingFiles()) {
      return 'Agent has already been generated. Use the Essedum Codespace tab to edit existing files.';
    }
    return 'Click to generate SDK agent with project files and structure';
  }

  // Generate SDK Agent
  generateSDKAgent(): void {
    if (!this.selectedAgent) {
      console.error('No agent selected');
      return;
    }

    this.isGenerating = true;
    this.hasGeneratedAgent = false;
    this.consoleOutput = [];

    const agentName = this.selectedAgent.alias;
    const version = this.selectedAgent.version;

    // Add initial console output
    this.consoleOutput.push(
      `Starting SDK Agent generation for ${agentName}...`
    );
    this.consoleOutput.push('Preparing agent configuration...');

    // Prepare the request payload
    const agentRequest: AgentGenerationRequest = {
      agentName: this.selectedAgent.name,
      version: this.selectedAgent.version,
      description: this.selectedAgent.description,
      cname: this.currentCname, // Use the agent's fixed cname
      configuration: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        tools: this.getToolsForAgent(this.selectedAgent.name),
      },
      runtime: {
        type: this.selectedAgent.language,
        dependencies: [
          'openai>=1.0.0',
          'requests>=2.28.0',
          'python-dotenv>=0.19.0',
        ],
      },
    };

    this.consoleOutput.push('Calling agent generation API...');
    console.log(
      'About to call agentPipelineService.generateSDKAgent with payload:',
      agentRequest
    );
    console.log('Using fixed cname:', this.currentCname);

    // Call the real API
    this.agentPipelineService.generateSDKAgent(agentRequest).subscribe({
      next: (response) => {
        this.consoleOutput.push('✓ Agent generation API call successful');
        this.consoleOutput.push(`✓ Container Name: ${this.currentCname}`);
        this.consoleOutput.push('✓ Processing agent files...');

        // Keep using the agent's fixed cname (don't change it)
        console.log('Using fixed cname for agent:', this.currentCname);

        // Process the file structure directly from the response
        console.log(
          'Building file tree from API response:',
          response.fileStructure
        );
        this.fileSystemData =
          this.agentPipelineService.buildFileTreeFromApiResponse(
            response.fileStructure
          );

        this.consoleOutput.push(
          `SDK Agent generated successfully for ${agentName}!`
        );
        this.consoleOutput.push('');
        this.consoleOutput.push(`Container: ${this.currentCname}`);
        this.consoleOutput.push('Status: Ready for development');

        this.isGenerating = false;
        this.hasGeneratedAgent = true;

        // Show success message with properly formatted response
        const successResponse = { status: 200, body: response || [] };
        this.service.messageService(
          successResponse,
          `SDK Agent '${agentName}' generated successfully!`
        );

        // Don't automatically open playground - user will click "Open Playground" button when ready
        console.log(
          'Agent generation complete. Playground available via button.'
        );
      },
      error: (error) => {
        console.error('Agent generation failed:', error);
        this.consoleOutput.push('✗ Agent generation failed');
        this.consoleOutput.push(`Error: ${error.message}`);
        this.consoleOutput.push(
          'Please check the server connection and try again.'
        );

        this.isGenerating = false;
        this.hasGeneratedAgent = false;

        // Show error message to user
        this.service.messageService(error);
      },
    });
  }

  clearConsole(): void {
    this.consoleOutput = [];
  }

  trackByCardId(index: number, card: AgentCard): string {
    return card.cid;
  }

  editAgent(agent: AgentCard): void {
    console.log('Edit agent:', agent);
    // TODO: Implement edit functionality
  }

  deleteAgent(agent: AgentCard): void {
    console.log('Delete agent:', agent);
    // TODO: Implement delete functionality
  }

  // Playground methods
  openPlayground(): void {
    this.showPlayground = true;
    this.playgroundMessages = [
      {
        role: 'agent',
        content: `Hello! I'm the ${this.selectedAgent?.alias || 'Agent'} (v${
          this.selectedAgent?.version
        }). I'm now running from the generated SDK. How can I help you today?`,
      },
    ];
  }

  closePlayground(): void {
    this.showPlayground = false;
    this.playgroundMessages = [];
    this.userQuestion = '';
  }

  sendQuestion(): void {
    if (!this.userQuestion.trim()) return;

    // Add user message
    this.playgroundMessages.push({
      role: 'user',
      content: this.userQuestion,
    });

    const question = this.userQuestion;
    this.userQuestion = '';
    this.isAgentThinking = true;

    // Simulate agent response
    setTimeout(() => {
      const agentResponse = this.getAgentResponse(question);
      this.playgroundMessages.push({
        role: 'agent',
        content: agentResponse,
      });
      this.isAgentThinking = false;
    }, 1500);
  }

  getAgentResponse(question: string): string {
    const agentName = this.selectedAgent?.name || '';
    const questionLower = question.toLowerCase();

    // Contextual responses based on agent type and question
    if (agentName === 'customer-support-agent') {
      if (questionLower.includes('ticket') || questionLower.includes('issue')) {
        return "I can help you create a support ticket. Please provide me with: 1) Issue description, 2) Priority level (Low/Medium/High), and 3) Your contact information. I'll search our knowledge base for similar issues first.";
      } else if (
        questionLower.includes('order') ||
        questionLower.includes('tracking')
      ) {
        return 'I can look up your order status. Let me search our customer database. Could you provide your order number or email address associated with the account?';
      } else if (
        questionLower.includes('refund') ||
        questionLower.includes('return')
      ) {
        return 'I can assist with refund requests. According to our policy, refunds are processed within 5-7 business days. Would you like me to create a refund ticket for you?';
      }
    } else if (agentName === 'data-analysis-agent') {
      if (questionLower.includes('analyze') || questionLower.includes('data')) {
        return "I can analyze your dataset. I support CSV, Excel, and JSON formats. Please upload your data and specify what insights you're looking for: trends, correlations, outliers, or statistical summaries?";
      } else if (
        questionLower.includes('visualiz') ||
        questionLower.includes('chart') ||
        questionLower.includes('graph')
      ) {
        return 'I can create various visualizations: bar charts, line graphs, scatter plots, heatmaps, and more. What type of visualization would best represent your data?';
      } else if (questionLower.includes('report')) {
        return 'I can generate comprehensive reports with statistical analysis, charts, and insights. Would you like a summary report, detailed analysis, or executive dashboard?';
      }
    } else if (agentName === 'code-review-agent') {
      if (questionLower.includes('review') || questionLower.includes('code')) {
        return "I can review your code for quality, security vulnerabilities, and best practices. Please provide the repository URL or paste the code snippet you'd like me to analyze.";
      } else if (
        questionLower.includes('security') ||
        questionLower.includes('vulnerab')
      ) {
        return "I'll run a security scan to detect: SQL injection risks, XSS vulnerabilities, hardcoded credentials, and insecure dependencies. Should I proceed with a full security audit?";
      } else if (
        questionLower.includes('improve') ||
        questionLower.includes('optimize')
      ) {
        return 'I can suggest improvements for: code performance, readability, maintainability, and adherence to design patterns. Would you like me to focus on a specific aspect?';
      }
    }

    // Generic helpful response
    const tools = this.getToolsForAgent(agentName);
    if (tools.length > 0) {
      return `I'm equipped with the following capabilities: ${tools
        .map((t) => t.description)
        .join(', ')}. Which of these would you like me to help you with?`;
    }

    return `I understand your question: "${question}". Based on my SDK configuration, I can process this request using my trained model. How would you like me to proceed?`;
  }

  onPlaygroundKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendQuestion();
    }
  }

  // GitHub Push methods
  private isGitHubAuthenticated(): boolean {
    // Check if user has GitHub authentication token
    // In a real implementation, check localStorage, sessionStorage, or service
    const token = localStorage.getItem('github_token');
    this.githubUsername = localStorage.getItem('github_username') || '';
    return !!token;
  }

  private openGitHubLoginDialog(): void {
    // TODO: Implement proper GitHub login dialog
    alert(
      'GitHub authentication not implemented yet. Please add your GitHub token manually to localStorage.'
    );
  }

  onRepoNameChange(event: any): void {
    // Handle both input field (event.target.value) and mat-select (event.value) events
    this.githubRepoName = event.value || event.target?.value || event;
    // Mock: Load branches for the specified repository
    this.loadAvailableBranches();
  }

  loadAvailableBranches(): void {
    // Mock data - in real implementation, this would call GitHub API
    const mockBranches = {
      'customer-support-agent-sdk': [
        'main',
        'develop',
        'feature/chat-integration',
        'hotfix/bug-fixes',
      ],
      'data-analysis-agent-sdk': [
        'main',
        'develop',
        'feature/new-charts',
        'staging',
      ],
      'code-review-agent-sdk': [
        'main',
        'develop',
        'feature/security-scan',
        'production',
      ],
    };

    this.availableBranches = mockBranches[
      this.githubRepoName as keyof typeof mockBranches
    ] || ['main', 'develop', 'feature/agent-updates', 'staging', 'production'];
  }

  onCustomCommitChange(event: any): void {
    this.useCustomCommit = event.checked;
    if (!this.useCustomCommit) {
      this.commitMessage = '';
    }
  }

  getDefaultCommitMessage(): string {
    const agentName = this.selectedAgent?.alias || 'Agent';
    const version = this.selectedAgent?.version || '1.0.0';
    const timestamp = new Date().toISOString().split('T')[0];
    return `feat: Add ${agentName} SDK v${version} - Generated on ${timestamp}`;
  }

  canPush(): boolean {
    return !!(this.githubRepoName && this.selectedBranch);
  }

  pushToGitHub(): void {
    if (!this.canPush()) return;

    this.isPushing = true;

    // Prepare the commit message
    const finalCommitMessage = this.useCustomCommit
      ? this.commitMessage
      : this.getDefaultCommitMessage();

    // Mock API call data
    const pushData = {
      repository: this.githubRepoName,
      branch: this.selectedBranch,
      commitMessage: finalCommitMessage,
      agentCode: this.getAgentCodeForPush(),
      timestamp: new Date().toISOString(),
    };

    console.log('Pushing to GitHub:', pushData);

    // Simulate API call
    setTimeout(() => {
      this.isPushing = false;
      console.log('Successfully pushed to GitHub!');
      // Show success message or notification
      const successResponse = { status: 200, body: [] };
      this.service.messageService(
        successResponse,
        `Successfully pushed ${this.selectedAgent?.alias} to ${this.githubRepoName}/${this.selectedBranch}!`
      );

      // Reset form after successful push
      this.githubRepoName = '';
      this.selectedBranch = 'main';
      this.useCustomCommit = false;
      this.commitMessage = '';
    }, 3000);
  }

  getAgentCodeForPush(): any {
    // Mock: Return the generated agent code structure
    return {
      files: this.flattenFileStructure(this.fileSystemData),
      metadata: {
        agentName: this.selectedAgent?.name,
        agentAlias: this.selectedAgent?.alias,
        version: this.selectedAgent?.version,
        description: this.selectedAgent?.description,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  flattenFileStructure(nodes: FileNode[]): any[] {
    const files: any[] = [];

    const processNode = (node: FileNode, path: string = '') => {
      const fullPath = path ? `${path}/${node.name}` : node.name;

      if (node.type === 'file') {
        files.push({
          path: fullPath,
          content: node.content || '',
          type: 'file',
        });
      } else if (node.children) {
        files.push({
          path: fullPath,
          type: 'directory',
        });
        node.children.forEach((child) => processNode(child, fullPath));
      }
    };

    nodes.forEach((node) => processNode(node));
    return files;
  }

  // Check for existing files and load appropriate state
  private checkForExistingFilesAndLoadState(cname: string): void {
    console.log('Checking for existing files for cname:', cname);

    // Reset to initial state first
    this.resetToInitialStateForNewAgent();

    // Try to fetch files for this specific cname
    this.isLoadingFiles = true;
    this.agentPipelineService.getAgentFiles(cname).subscribe({
      next: (apiResponse) => {
        // Check if we actually have files
        if (
          apiResponse &&
          Array.isArray(apiResponse) &&
          apiResponse.length > 0
        ) {
          console.log(
            'Found existing files for cname:',
            cname,
            'Files count:',
            apiResponse.length
          );
          this.loadExistingAgentWithFilesFromAPI(apiResponse);
        } else {
          console.log('No files found in response for cname:', cname);
          // Even if API succeeds but no files, show script tab only
          this.showScriptTabOnly();
        }
        this.isLoadingFiles = false;
      },
      error: (error) => {
        console.log(
          'API error or no existing files found for cname:',
          cname,
          error
        );
        // API error or no files exist yet - show script tab only
        this.showScriptTabOnly();
        this.isLoadingFiles = false;
      },
    });
  }

  // Load existing agent data from API when files exist
  private loadExistingAgentWithFilesFromAPI(fileData: any): void {
    this.hasGeneratedAgent = true;
    this.isJsonProcessed = true;

    // Build file tree from API response
    this.fileSystemData =
      this.agentPipelineService.buildFileTreeFromApiResponse(fileData);

    // Set console output to show that agent was loaded
    this.consoleOutput = [
      `SDK Agent loaded from existing data`,
      `Container: ${this.currentCname}`,
      `Status: Ready for development`,
      `Files: ${fileData.length} files loaded`,
    ];

    console.log('Successfully loaded existing agent with files:', {
      cname: this.currentCname,
      hasFiles: this.fileSystemData.length > 0,
      fileCount: fileData.length,
    });
  }

  // Show only script tab when no files exist
  private showScriptTabOnly(): void {
    this.hasGeneratedAgent = false;
    this.isJsonProcessed = false; // This will show only the script tab
    this.fileSystemData = [];
    this.consoleOutput = [];
    this.clearFileSelection();

    console.log(
      'Showing script tab only - no existing files found for cname:',
      this.currentCname
    );
  }

  // Reset to initial state (no saved data) - used as starting point
  private resetToInitialStateForNewAgent(): void {
    this.selectedFileName = '';
    this.selectedFileContent = '';
    this.selectedFileId = '';
    this.isJsonProcessed = false; // Show script tab only initially
    this.hasGeneratedAgent = false; // Reset playground button state
    // Don't reset currentCname - keep the agent's fixed cname
    this.fileSystemData = [];
    this.consoleOutput = [];
    this.clearFileSelection();
    console.log(
      'Reset to initial state for agent with cname:',
      this.currentCname
    );
  }

  // Clear file selection
  private clearFileSelection(): void {
    this.selectedFileName = '';
    this.selectedFileContent = '';
    this.selectedFileNode = null;
    this.selectedFilePath = '';
    this.selectedFileId = '';
    this.fileExtension = 'py';
    this.isFileModified = false;
    this.originalFileContent = '';
    this.userModifiedLines.clear();
    this.resetDiffTracking();
  }
}
