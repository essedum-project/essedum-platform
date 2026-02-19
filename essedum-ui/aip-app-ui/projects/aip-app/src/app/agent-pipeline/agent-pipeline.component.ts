import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  Input,
  Inject,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { Services } from '../services/service';
import {
  AgentPipelineService,
  FileNode as ServiceFileNode,
  AgentGenerationRequest,
  ICIPAiAgentScript,
} from './agent-pipeline.service';
import { StreamingServices } from '../streaming-services/streaming-service';
import { PipelineCreateComponent } from '../pipeline/pipeline-create/pipeline-create.component';
import {
  DynamicParamsGrid,
  DynamicSecretsGrid,
} from '../pipeline.description/pipeline.description.component';
import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';

import { HttpClient, HttpParams } from '@angular/common/http';
import pipelineConfig from './pipeline-config.json';
import { OptionsDTO } from '../DTO/OptionsDTO';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { io, Socket } from 'socket.io-client';

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
export class AgentPipelineComponent implements OnInit, OnDestroy {
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
  cardTitle = 'Agent Pipelines';
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

  private getOrganization(): string {
    return localStorage.getItem('organisation') || 'leo1311';
  }
  
  /**
   * Get consistent organization for both save and load operations
   */
  private getConsistentOrganization(): string {
    // Priority: streamItem.organization > localStorage > default
    const streamOrg = this.streamItem?.organization;
    const localOrg = localStorage.getItem('organisation');
    const defaultOrg = 'leo1311';
    
    const result = streamOrg || localOrg || defaultOrg;
    
    return result;
  }

  /**
   * Get the environment URL from the injected baseUrl
   * Removes '/api' suffix if present to get the base environment URL
   */
  private getEnvironmentUrl(): string {
    // Remove '/api/aip' or '/api' suffix if present to get the base environment URL
    if (this.baseUrl.endsWith('/api/aip')) {
      return this.baseUrl.slice(0, -8); // Remove '/api/aip'
    } else if (this.baseUrl.endsWith('/api')) {
      return this.baseUrl.slice(0, -4); // Remove '/api'
    }
    return this.baseUrl;
  }


  /**
   * Clean filename to ensure it's always a proper string without array brackets
   */
  private cleanFileName(fileName: any): string {
    if (!fileName) return '';
    
    let cleanName = fileName;
    
    // Handle if fileName comes as an array
    if (Array.isArray(fileName)) {
      cleanName = fileName[0] || '';
    }
    
    // Handle string format
    if (typeof cleanName === 'string') {
      // Remove array brackets if present: ["file.json"] -> file.json
      if (cleanName.startsWith('[') && cleanName.endsWith(']')) {
        try {
          // Try to parse as JSON array first
          const parsed = JSON.parse(cleanName);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cleanName = parsed[0];
          }
        } catch (e) {
          // Manual cleanup if JSON parsing fails
          cleanName = cleanName.slice(1, -1).replace(/[\"\'\']/g, '').trim();
        }
      }
      
      // Remove any remaining quotes and trim whitespace
      cleanName = cleanName.replace(/[\"\'\']/g, '').trim();
    }
    
    return cleanName;
  }

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
  
  // Builder Tab Visibility Control
  // Default: HIDDEN (false). Show only when created_source is NOT 'user_defined'
  shouldShowBuilderTab = false;

  
  // Console output for Generate adk Agent
  consoleOutput: string[] = [];
  isGenerating = false;
  
  // WebSocket and Run/Deploy functionality
  private socket: Socket | null = null;
  isRunningAndDeploying = false;
   isDeletingDeployment = false;
  runnerServiceStatus = false; // Track runner_service_status from backend
  deploymentStatus: 'idle' | 'running' | 'success' | 'error' = 'idle';
  deploymentStatusMessage: string = ''; // User-friendly status message for deployment
  isPlaygroundEnabled = false; // Enable playground only after successful deployment
  
  // LLM Selection and Prompt Template
  selectedLLM: string = '';
  showPromptCopyDialog = false;
  
  // Playground popup
  showPlayground = false;
  hasGeneratedAgent = false;
  playgroundMessages: Array<{ role: 'user' | 'agent'; content: string }> = [];
  userQuestion = '';
  isAgentThinking = false;
  playgroundUrl = ''; // Store the playground URL from API
  currentDeploymentName = ''; // Store the deployment name used in WebSocket

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

  // Upload agent files functionality
  isUploadingFiles = false;
  showUploadDialog = false;
  selectedZipFile: File | null = null;

  // MCP Pipeline Mode Support
  pipelineMode: 'agent' | 'mcp' = 'agent';
  mcpJsonConfig: string = '';
  private hasLoadedApiContent: boolean = false; // Flag to track if API content has been loaded
  
  // Script modification tracking
  isScriptModified = false;
  originalScriptContent = '';

  // Default MCP JSON configuration template
  private defaultMcpConfig = {
    "name": "sample-mcp-server",
    "version": "1.0.0",
    "description": "Sample MCP Server Configuration",
    "tools": [
      {
        "name": "sample_tool",
        "description": "A sample MCP tool",
        "parameters": {
          "type": "object",
          "properties": {
            "input": {
              "type": "string",
              "description": "Input parameter for the tool"
            }
          },
          "required": ["input"]
        }
      }
    ],
    "resources": [],
    "prompts": []
  };

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
  
  // Script unsaved changes dialog
  showScriptUnsavedDialog = false;
  pendingScriptAction: (() => void) | null = null;
  
  // Deployment form data check
  hasDeploymentFormData = false;
  isCheckingDeploymentData = false;
  deploymentEnvironment: string = ''; // Store selected deployment environment

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

  // Reference to mat-tab-group for programmatic tab switching
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  constructor(
    @Inject('envi') private baseUrl: string,

    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private agentPipelineService: AgentPipelineService,
    private service: Services,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {
    // Don't initialize mcpJsonConfig here - let it be set by API data loading
  }

  ngOnInit(): void {
    this.lastRefreshedTime = new Date();
    this.route.params.subscribe((params) => {
      if (params['cname']) {
        this.cardName = params['cname'];
      } else {
        this.cardName = this.streamItem.name;
      }
    });

    // Check if we have router state data with card information
    const historyState = history.state;
    const cardFromState = historyState?.card;
    
    // Set pipeline mode from navigation state if available
    if (historyState?.pipelineMode) {
      this.pipelineMode = historyState.pipelineMode;
      
      // Set cardTitle based on pipeline mode
      this.cardTitle = this.pipelineMode === 'mcp' ? 'MCP Pipelines' : 'Agent Pipelines';
      
      // DO NOT initialize MCP config here - let the API load the real data first
      // Default config will only be set if API call fails
    }
    
    if (cardFromState && cardFromState.name) {
      // This is a real pipeline card from dashboard - use its cname for auto-loading
      this.currentCname = cardFromState.name; // Use the card name as cname
      this.viewMode = 'detail';
      
      // Reset loading flags and content state for new card
      this.resetLoadingState();
      
      // Update MCP filename if in MCP mode now that we have the actual cname
      if (this.pipelineMode === 'mcp') {
        this.scriptFileName = `${this.currentCname}.json`;
      }
      
      // Set pipeline alias for display
      if (historyState?.pipelineAlias) {
        this.pipelineAlias = historyState.pipelineAlias;
      }
      
      // Trigger auto-loading for real pipeline cards
      this.autoLoadAgentDataForPipelineCard();
    } else {
      // Fall back to old flow for hardcoded agent cards or when no state data
      
      // Reset loading flags for new navigation
      this.resetLoadingState();
      
      // Also try using cardName as currentCname for the new APIs
      if (this.cardName) {
        this.currentCname = this.cardName;
        this.autoLoadAgentDataForPipelineCard();
      } else {
        this.getStreamService();
      }
    }
    
    this.getPipelineByName();
    
    // Add beforeunload protection for unsaved changes
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }
  
  /**
   * Handle browser navigation/refresh with unsaved changes
   */
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.isScriptModified) {
      event.preventDefault();
      event.returnValue = 'You have unsaved changes in your configuration. Are you sure you want to leave?';
      return event.returnValue;
    }
  }
  
  /**
   * Generic method to check for unsaved changes before any navigation
   */
  checkUnsavedChanges(action: () => void): void {
    if (this.isScriptModified) {
      console.log('Unsaved changes detected, showing confirmation dialog');
      this.showScriptUnsavedChangesDialog(action);
    } else {
      // No unsaved changes, proceed immediately
      action();
    }
  }

  getStreamService() {
    this.service.getStreamingServicesByName(this.cardName).subscribe((res) => {
      this.streamItem = res;
      this.pipelineAlias = res.alias;

      // ============================================================================
      // Builder Tab Visibility Logic
      // ============================================================================
      // DEFAULT: HIDDEN (false)
      // SHOW: Only when created_source is NOT 'user_defined' (missing, null, empty, or other value)
      // HIDE: When created_source === 'user_defined'
      // ============================================================================
      
      this.shouldShowBuilderTab = false; // Start hidden
      
      console.log('🔍 Checking Builder tab visibility for:', this.cardName);
      console.log('📦 Raw json_content:', res.json_content);
      
      try {
        if (!res.json_content || res.json_content.trim() === '') {
          // No json_content or empty string → SHOW tab (langflow/other source)
          this.shouldShowBuilderTab = true;
          console.log('✅ Builder tab VISIBLE: json_content is empty/missing (langflow/other)');
        } else {
          // Parse json_content
          const jsonContent = JSON.parse(res.json_content);
          console.log('📋 Parsed json_content:', JSON.stringify(jsonContent, null, 2));
          console.log('🔑 Keys in json_content:', Object.keys(jsonContent));
          
          // Check created_source field
          if (jsonContent.hasOwnProperty('created_source')) {
            const sourceValue = jsonContent.created_source;
            console.log('🏷️ created_source field found, value:', sourceValue, 'type:', typeof sourceValue);
            
            if (sourceValue === 'user_defined') {
              // Explicitly user_defined → HIDE tab
              this.shouldShowBuilderTab = false;
              console.log('❌ Builder tab HIDDEN: created_source === "user_defined"');
            } else {
              // Has created_source but NOT user_defined → SHOW tab
              this.shouldShowBuilderTab = true;
              console.log('✅ Builder tab VISIBLE: created_source is "' + sourceValue + '" (not user_defined)');
            }
          } else {
            // No created_source field → SHOW tab (langflow/other source)
            this.shouldShowBuilderTab = true;
            console.log('✅ Builder tab VISIBLE: created_source field missing (langflow/other)');
          }
        }
      } catch (e) {
        // Parse error → SHOW tab (fail-safe)
        this.shouldShowBuilderTab = true;
        console.error('⚠️ Error parsing json_content, showing Builder tab as fail-safe:', e);
        console.error('Raw content that failed:', res.json_content);
      }
      
      console.log('🎯 Final decision: shouldShowBuilderTab =', this.shouldShowBuilderTab);

      // Update MCP filename if in MCP mode with actual stream item name
      if (this.pipelineMode === 'mcp') {
        const actualName = res.name || this.cardName || 'mcp-config';
        this.scriptFileName = `${actualName}.json`;
      }

      // Load saved JSON file content for script tab only if not already loading
      if (!this.isLoadingJsonFile) {
        this.loadJsonFileForScript();
      }

      // Load files for code explorer
      // Files will be loaded after data is parsed in try block below

      if (this.router.url.includes('preview')) {
        this.pipelineAlias = this.streamItem.alias;
      }
    });
  }

  /**
   * Check Builder Tab Visibility - Separate method to be called from multiple places
   * This fetches the streaming service and checks created_source flag
   */
  private checkBuilderTabVisibility(): void {
    if (!this.currentCname) {
      console.warn('⚠️ Cannot check Builder tab visibility: no cname available');
      return;
    }

    console.log('🔍 Fetching streaming service to check Builder tab visibility for:', this.currentCname);
    
    this.service.getStreamingServicesByName(this.currentCname).subscribe({
      next: (res) => {
        // Store streamItem for later use
        this.streamItem = res;
        this.pipelineAlias = res.alias;

        // ============================================================================
        // Builder Tab Visibility Logic
        // ============================================================================
        // DEFAULT: HIDDEN (false)
        // SHOW: Only when created_source is NOT 'user_defined' (missing, null, empty, or other value)
        // HIDE: When created_source === 'user_defined'
        // ============================================================================
        
        this.shouldShowBuilderTab = false; // Start hidden
        
        console.log('🔍 Checking Builder tab visibility for:', this.currentCname);
        console.log('📦 Raw json_content:', res.json_content);
        
        try {
          if (!res.json_content || res.json_content.trim() === '') {
            // No json_content or empty string → SHOW tab (langflow/other source)
            this.shouldShowBuilderTab = true;
            console.log('✅ Builder tab VISIBLE: json_content is empty/missing (langflow/other)');
          } else {
            // Parse json_content
            const jsonContent = JSON.parse(res.json_content);
            console.log('📋 Parsed json_content:', JSON.stringify(jsonContent, null, 2));
            console.log('🔑 Keys in json_content:', Object.keys(jsonContent));
            
            // Check created_source field
            if (jsonContent.hasOwnProperty('created_source')) {
              const sourceValue = jsonContent.created_source;
              console.log('🏷️ created_source field found, value:', sourceValue, 'type:', typeof sourceValue);
              
              if (sourceValue === 'user_defined') {
                // Explicitly user_defined → HIDE tab
                this.shouldShowBuilderTab = false;
                console.log('❌ Builder tab HIDDEN: created_source === "user_defined"');
              } else {
                // Has created_source but NOT user_defined → SHOW tab
                this.shouldShowBuilderTab = true;
                console.log('✅ Builder tab VISIBLE: created_source is "' + sourceValue + '" (not user_defined)');
              }
            } else {
              // No created_source field → SHOW tab (langflow/other source)
              this.shouldShowBuilderTab = true;
              console.log('✅ Builder tab VISIBLE: created_source field missing (langflow/other)');
            }
          }
        } catch (e) {
          // Parse error → SHOW tab (fail-safe)
          this.shouldShowBuilderTab = true;
          console.error('⚠️ Error parsing json_content, showing Builder tab as fail-safe:', e);
          console.error('Raw content that failed:', res.json_content);
        }
        
        console.log('🎯 Final decision: shouldShowBuilderTab =', this.shouldShowBuilderTab);
      },
      error: (error) => {
        console.error('❌ Error fetching streaming service for Builder tab check:', error);
        // On error, default to showing the tab (fail-safe)
        this.shouldShowBuilderTab = true;
      }
    });
  }

  /**
   * Reset loading state for new card navigation
   */
  private resetLoadingState(): void {
    this.isLoadingJsonFile = false;
    this.hasLoadedApiContent = false;
  }

  /**
   * Generate consistent filename for API calls
   */
  private generateConsistentFilename(): string {
    return `${this.currentCname}_${this.organisation}.json`;
  }

  /**
   * Handle pipeline mode change between Agent and MCP
   */
  onPipelineModeChange(event: any): void {
    const newMode = event.value;
    
    // Update the card title based on mode
    this.cardTitle = newMode === 'mcp' ? 'MCP Pipelines' : 'Agent Pipelines';
    
    // For MCP mode, initialize JSON config if empty and no API content loaded
    if (newMode === 'mcp' && !this.mcpJsonConfig.trim() && !this.hasLoadedApiContent) {
      this.mcpJsonConfig = JSON.stringify(this.defaultMcpConfig, null, 2);
      // Use the actual cname or cardName for filename
      const actualName = this.currentCname || this.cardName || 'mcp-config';
      this.scriptFileName = `${actualName}.json`;
    }
    // For agent mode, keep existing script functionality unchanged
    else if (newMode === 'agent') {
      this.scriptFileName = this.getOriginalScriptFileName();
    }
  }

  /**
   * Handle MCP JSON configuration changes
   */
  onMcpJsonChange(newConfig: string): void {
    this.mcpJsonConfig = newConfig;
    // Mark as modified if needed for save functionality
    // You can add validation here if needed
  }

  /**
   * Get the original script file name for agent mode
   */
  private getOriginalScriptFileName(): string {
    if (this.data && this.data.files && this.data.files.length > 0) {
      return this.cleanFileName(this.data.files[0]);
    }
    return 'script.py'; // default fallback
  }

  /**
   * Change language based on file type for script editor
   */
  changeLang(type: string): void {
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
      // Set cardTitle based on current pipeline mode
      this.cardTitle = this.pipelineMode === 'mcp' ? 'MCP Pipelines' : 'Agent Pipelines';
      console.log('Card title set in getPipelineByName to:', this.cardTitle);
      this.card = res[0];
      
      // Update MCP filename if in MCP mode with actual pipeline data
      if (this.pipelineMode === 'mcp' && res && res[0]) {
        const actualName = res[0].name || this.cardName || 'mcp-config';
        this.scriptFileName = `${actualName}.json`;
        console.log('MCP filename updated from getPipelineByName:', this.scriptFileName);
      }
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
      const cleanedResponse = this.cleanFileName(response);
      // Only read file if we're not already loading and haven't loaded content from API
      if (!this.isLoadingJsonFile && !this.hasLoadedApiContent) {
        this.readFile(cleanedResponse);
      }
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
    // Prevent duplicate calls if we're already loading
    if (this.isLoadingJsonFile) {
      console.log('Already loading JSON file, skipping readFile call');
      return;
    }

    // Ensure we use the consistent filename for the current card
    const expectedFilename = this.generateConsistentFilename();
    if (filename !== expectedFilename) {
      console.log(
        'Filename mismatch - expected:',
        expectedFilename,
        'got:',
        filename,
        'using expected filename instead'
      );
      filename = expectedFilename;
    }

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

    // Set loading flag to prevent duplicate calls
    this.isLoadingJsonFile = true;
    
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
          this.isLoadingJsonFile = false; // Clear loading flag
          console.log('File read response received for:', filename);
          try {
            const textDecoder = new TextDecoder('utf-8');
            this.script = textDecoder.decode(resp).split('\n');
            this.loadScript = true;
            this.hasLoadedApiContent = true; // Mark that we've loaded content from API
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
          this.isLoadingJsonFile = false; // Clear loading flag
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
              this.readFile(this.cleanFileName(filename), retryCount + 1);
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
                const cleanFileName = this.cleanFileName(fileName);
                const extension = cleanFileName.split('.').pop()?.toLowerCase();
                console.log(
                  `Processing file: ${cleanFileName}, extension: ${extension}, original: ${fileName}`
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
                  // Only read file if we're not already loading and haven't loaded content from API
                  if (!this.isLoadingJsonFile && !this.hasLoadedApiContent) {
                    this.readFile(firstPyFile.name); // readFile now handles cleaning internally
                  }
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
    console.log('Navigating back to agent-pipeline dashboard');
    
    // Check for unsaved script changes
    if (this.isScriptModified) {
      console.log('Unsaved script changes detected, showing confirmation dialog');
      this.showScriptUnsavedChangesDialog(() => {
        this.performNavigateBack();
      });
      return;
    }
    
    // No unsaved changes, navigate immediately
    this.performNavigateBack();
  }
  
  private performNavigateBack(): void {
    // Reset all state first
    this.resetToDashboardState();
    
    // Get current route parameters to preserve org and roleId
    const org = localStorage.getItem('organisation') || 'leo1311';
    const roleId = localStorage.getItem('roleId') || '1';
    
    // Navigate to the agent-pipeline dashboard with proper query parameters
    this.router.navigate(['/landing/aip/agent-pipeline'], {
      queryParams: {
        page: 1,
        search: '',
        pipelineType: '',
        org: org,
        roleId: roleId
      }
    });
  }

  // Reset state when going back to dashboard
  private resetToDashboardState(): void {
    this.selectedFileName = '';
    this.selectedFileContent = '';
    this.isJsonProcessed = false;
    this.hasGeneratedAgent = false;
    this.currentCname = ''; // Clear cname when going back to dashboard
    this.fileSystemData = [];
    this.consoleOutput = []; // Keep console clear
    this.deploymentStatus = 'idle'; // Reset deployment status
    this.deploymentStatusMessage = ''; // Clear status message
    this.isPlaygroundEnabled = false; // Disable playground
    this.isScriptModified = false; // Reset script modification state
    this.originalScriptContent = ''; // Clear original script content
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
    console.log('Opening pipeline creation dialog from agent detail view. Mode:', this.pipelineMode);
    
    if (this.pipelineMode === 'mcp') {
      console.log('Opening MCP Pipelines creation dialog');
      
      // Open the pipeline creation dialog with MCP-specific parameters
      const dialogRef = this.dialog.open(PipelineCreateComponent, {
        width: '600px',
        height: '500px',
        disableClose: true,
        data: {
          interfacetype: 'mcp-pipeline', // MCP-specific interface type
          type: 'mcpServer', // MCP-specific type
          mode: 'create'
        }
      });
      
      // Handle dialog result
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('MCP Pipelines created:', result);
          this.service.message('MCP Pipelines created successfully!', 'success');
          // Navigate back to dashboard to see the new pipeline
          this.navigateBack();
        }
      });
    } else {
      console.log('Opening Agent Pipelines creation dialog');
      
      // Open the pipeline creation dialog with Agent-specific parameters
      const dialogRef = this.dialog.open(PipelineCreateComponent, {
        width: '600px',
        height: '500px',
        disableClose: true,
        data: {
          interfacetype: 'pipeline-agent', // Agent-specific interface type
          type: 'AIAgent', // Agent-specific type
          mode: 'create'
        }
      });
      
      // Handle dialog result
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Agent Pipelines created:', result);
          this.service.message('Agent Pipelines created successfully!', 'success');
          // Navigate back to dashboard to see the new pipeline
          this.navigateBack();
        }
      });
    }
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
    this.viewMode = 'detail';
    
    // Reset LLM selection when viewing different agent
    this.selectedLLM = '';
    
    // Special handling for QR53F1 - generate new cname each time
    if (agent.cname === 'QR53F1') {
      // Generate new random cname for Code Review Agent
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      this.currentCname = 'CR' + randomSuffix;
      console.log('Generated new cname for Code Review Agent:', this.currentCname);
    } else {
      // Use fixed cname for other agents
      this.currentCname = agent.cname;
      console.log('Using fixed cname:', this.currentCname);
    }

    // Automatically call APIs to check for existing data
    this.autoLoadAgentData();
    
    // Check if deployment form data exists
    this.checkDeploymentFormData();
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
      
      // Refresh file structure to ensure UI reflects any server-side changes
      this.refreshFileStructure();
      
      // Show success message with properly formatted response
      const successResponse = { status: 200, body: result || [] };
      this.service.messageService(successResponse, 'File saved successfully!');
    } catch (error: any) {
      console.error('Error saving file:', error);
      // Check if error has the new format with details
      if (error?.error?.details) {
        this.service.message(error.error.details, 'error');
      } else if (error?.error?.message) {
        this.service.message(error.error.message, 'error');
      } else {
        // If error is not in the expected format, use a generic message
        const errorMessage = error?.message || 'Failed to save file';
        this.service.message(errorMessage, 'error');
      }
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
      
      // Always refresh the file structure from API after successful deletion
      // This ensures the UI reflects the current state on the server
      this.refreshFileStructure();
      
      // Show success message with properly formatted response
      const successResponse = { status: 200, body: result || [] };
      this.service.messageService(
        successResponse,
        'File deleted successfully!'
      );
    } catch (error: any) {
      console.error('Error deleting file:', error);
      // Check if error has the new format with details
      if (error?.error?.details) {
        this.service.message(error.error.details, 'error');
      } else if (error?.error?.message) {
        this.service.message(error.error.message, 'error');
      } else {
        const errorMessage = error?.message || 'Failed to delete file';
        this.service.message(errorMessage, 'error');
      }
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

  // updateJsonContent method removed - no placeholder JSON content

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
    console.log('Loading files for cname:', this.currentCname, 'mode:', this.pipelineMode);

    // Use the same API - the backend will handle the type differentiation
    this.agentPipelineService.getAgentFiles(this.currentCname).subscribe({
      next: (apiResponse) => {
        console.log('API response for files:', apiResponse);
        
        if (apiResponse && Array.isArray(apiResponse) && apiResponse.length > 0) {
          // Files found - enable codespace tab
          console.log('Files found, enabling codespace tab');
          this.fileSystemData = this.agentPipelineService.buildFileTreeFromApiResponse(apiResponse);
          this.expandAllFolders(this.fileSystemData);
          
          // Update state to show files exist
          this.hasGeneratedAgent = true;
          this.isJsonProcessed = true;
          
        } else {
          // No files found
          console.log('No files found, maintaining script tab only');
          this.fileSystemData = [];
          this.hasGeneratedAgent = false;
          this.isJsonProcessed = false;
          
          // Show warning message
          const warningResponse = {
            status: 'warning',
            message: `No ${this.pipelineMode === 'mcp' ? 'MCP server' : 'agent'} files found`
          };
          this.service.messageService(warningResponse, 'No Data Found');
        }
        
        this.isLoadingFiles = false;
      },
      error: (error) => {
        console.error('Error loading files:', error);
        // Check if error has the new format with details
        if (error?.error?.details) {
          this.service.message(error.error.details, 'error');
        } else if (error?.error?.message) {
          this.service.message(error.error.message, 'error');
        }
        this.isLoadingFiles = false;
        this.fileSystemData = [];
        this.hasGeneratedAgent = false;
        this.isJsonProcessed = false;

        // Show error message to user
        console.warn(`Failed to load ${this.pipelineMode === 'mcp' ? 'MCP server' : 'agent'} files: ${error.message || 'Unknown error'}`);
      },
    });
  }
  
  // Refresh file structure - can be called manually or after operations
  refreshFileStructure(): void {
    if (!this.currentCname) {
      console.warn('No container name available for refreshing files');
      return;
    }
    
    console.log('Refreshing file structure for container:', this.currentCname);
    this.loadAgentFiles();
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
    const organization = this.getOrganization();

    this.agentPipelineService
      .downloadAllFilesAsZip(this.currentCname, organization)
      .subscribe({
        next: (blob: Blob) => {
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${this.currentCname}-${organization}.zip`;

          // Trigger download
          document.body.appendChild(link);
          link.click();

          // Cleanup immediately
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          // Show success message after download starts
          setTimeout(() => {
            console.log('Download completed successfully');
            // Create a properly formatted success response for messageService
            const successResponse = { status: 200, body: [] };
            this.service.messageService(
              successResponse,
              'Files downloaded successfully!'
            );
          }, 500); // Small delay to ensure download has started
          
          // Reset loading state on success
          this.isDownloading = false;
        },
        error: (error) => {
          console.error('Error downloading files:', error);
          // Check if error has the new format with details
          if (error?.error?.details) {
            this.service.message(error.error.details, 'error');
          } else if (error?.error?.message) {
            this.service.message(error.error.message, 'error');
          } else {
            this.service.message('Failed to download files. Please try again.', 'error');
          }
          // Reset loading state on error
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
  
  /**
   * Show script unsaved changes dialog
   */
  showScriptUnsavedChangesDialog(action: () => void): void {
    this.showScriptUnsavedDialog = true;
    this.pendingScriptAction = action;
  }
  
  /**
   * Cancel script unsaved dialog
   */
  cancelScriptUnsavedDialog(): void {
    this.showScriptUnsavedDialog = false;
    this.pendingScriptAction = null;
  }
  
  /**
   * Save script and proceed with pending action
   */
  async saveScriptAndProceed(): Promise<void> {
    try {
      await this.saveScriptConfiguration();
      this.showScriptUnsavedDialog = false;
      if (this.pendingScriptAction) {
        this.pendingScriptAction();
        this.pendingScriptAction = null;
      }
    } catch (error) {
      console.error('Error saving script configuration:', error);
    }
  }
  
  /**
   * Discard script changes and proceed
   */
  discardScriptAndProceed(): void {
    console.log('Discarding script changes and continuing...');
    
    // Restore original content
    if (this.pipelineMode === 'mcp') {
      this.mcpJsonConfig = this.originalScriptContent;
    } else {
      this.script = this.originalScriptContent.split('\n');
    }
    
    this.isScriptModified = false;
    this.showScriptUnsavedDialog = false;
    
    if (this.pendingScriptAction) {
      this.pendingScriptAction();
      this.pendingScriptAction = null;
    }
  }

  onTabChange(event: any): void {
    console.log('Tab change requested to index:', event.index);
    
    // Check for unsaved script changes before switching tabs
    if (this.isScriptModified) {
      console.log('Unsaved script changes detected during tab switch');
      // Prevent the tab change by reverting to current tab
      event.source.selectedIndex = event.source.selectedIndex;
      
      this.showScriptUnsavedChangesDialog(() => {
        // After saving or discarding, allow the tab change
        setTimeout(() => {
          event.source.selectedIndex = event.index;
        }, 100);
      });
      return;
    }
    
    console.log(`Tab switched to index: ${event.index}`);
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
    // Handle JSON content changes from API data only
    console.log('JSON content changed:', event);
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

  // Expand all folders recursively
  expandAllFolders(nodes: FileNode[]): void {
    nodes.forEach(node => {
      if (node.type === 'folder') {
        node.expanded = true;
        if (node.children) {
          this.expandAllFolders(node.children);
        }
      }
    });
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
    this.agentPipelineService.updateFileStructure(this.currentCname, this.fileSystemData).subscribe({
      next: (result) => {
        console.log('File structure saved successfully via bulk update API:', result);
        this.showSaveStructureDialog = false;
        this.originalFileStructure = [];
        
        // Refresh file structure from API to ensure consistency
        this.refreshFileStructure();
        
        // Show success message with properly formatted response
        const successResponse = { status: 200, body: result || [] };
        this.service.messageService(successResponse, 'File structure updated successfully!');
      },
      error: (error: any) => {
        console.error('Failed to save file structure:', error);
        // Check if error has the new format with details
        if (error?.error?.details) {
          this.service.message(error.error.details, 'error');
        } else if (error?.error?.message) {
          this.service.message(error.error.message, 'error');
        } else {
          const errorMessage = error?.message || 'Failed to update file structure';
          this.service.message(errorMessage, 'error');
        }
        
        // Restore original structure on error
        this.fileSystemData = JSON.parse(JSON.stringify(this.originalFileStructure));
        this.showSaveStructureDialog = false;
        this.originalFileStructure = [];
      }
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

  isNodeFileModified(node: FileNode): boolean {
    return node.type === 'file' && node.name === this.selectedFileName && this.isFileModified === true;
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
  /**
   * Check if agent has existing files in the codespace
   */
  hasExistingFiles(): boolean {
    return this.fileSystemData && this.fileSystemData.length > 0;
  }

  /**
   * Check if Run and Deploy button should be enabled
   * - Enabled when files exist (generated or uploaded)
   * - Disabled when currently running/deploying
   * - Disabled when already deployed (runnerServiceStatus)
   * - Disabled when in error state
   */
  canRunAndDeploy(): boolean {
    const hasFiles = this.hasGeneratedAgent || this.hasExistingFiles();
    return (
      hasFiles &&
      !this.isRunningAndDeploying &&
      !this.runnerServiceStatus &&
      this.deploymentStatus !== 'error'
    );
  }

  /**
   * Check if Delete Deployment button should be enabled
   * - Enabled when files exist (hasGeneratedAgent or hasExistingFiles)
   * - Enabled only when runner_service_status is true (deployed)
   * - Disabled while deletion is in progress
   * - Disabled when in error state
   */
  canDeleteDeployment(): boolean {
    const hasFiles = this.hasGeneratedAgent || this.hasExistingFiles();
    return (
      hasFiles &&
      !this.isDeletingDeployment &&
      this.runnerServiceStatus &&
      this.deploymentStatus !== 'error'
    );
  }

  /**
   * Delete the current deployment via WebSocket
   */
  async deleteDeployment(): Promise<void> {
    if (!this.canDeleteDeployment() || !this.currentCname) {
      return;
    }

    this.isDeletingDeployment = true;
    this.deploymentStatus = 'running';
    this.deploymentStatusMessage = 'Deleting deployment...';
    
    // Clear console and add initial message
    this.consoleOutput = [];
    this.addToConsole('Starting deployment deletion process...');
    
    const organization = this.getOrganization();

    try {
      console.log('Initiating deployment deletion for:', this.currentCname);
      
      // Initialize WebSocket connection for deletion
      await this.initializeDeleteWebSocket();
      
    } catch (error) {
      console.error('Error initiating deployment deletion:', error);
      this.deploymentStatus = 'error';
      this.deploymentStatusMessage = 'Failed to initiate deployment deletion';
      this.addToConsole(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.service.messageService(error, 'Failed to delete deployment');
      this.isDeletingDeployment = false;
    }
  }

  /**
   * Initialize WebSocket connection for deployment deletion
   */
  private async initializeDeleteWebSocket(): Promise<void> {
    console.log('  STARTING DELETE WEBSOCKET INITIALIZATION PROCESS');
    try {
      console.log('  Step 1: Connecting to WebSocket server for deletion...');
      
      const environmentUrl = this.getEnvironmentUrl();
      console.log('  Connecting to WebSocket at environment URL:', environmentUrl);
      
      this.socket = io(environmentUrl, {
        path: '/apps/builder-service/socket.io',
        transports: ['websocket', 'polling'],
        timeout: 60000,
        forceNew: true,
        rejectUnauthorized: false,
        withCredentials: true,
        reconnection: false,
      });
      
      // Connection successful
      this.socket.on('connect', () => {
        console.log('  Step 2: WebSocket connected for deletion! Preparing delete payload...');
        
        // Use the same deployment name as used in deployment
        const deploymentName = this.currentDeploymentName || this.pipelineAlias?.toString() || 'DEFAULT-AGENT';
        
        const deletePayload = {
          deployment_name: deploymentName,
          namespace: 'aipns'
        };
        
        console.log('  Step 3: Sending delete_deployment event with payload:', deletePayload);
        this.addToConsole(`Deleting deployment: ${deploymentName} from namespace: aipns`);
        this.socket?.emit('delete_deployment', deletePayload);
        console.log('  Step 4: delete_deployment event emitted to WebSocket');
      });
      
      // Delete status event
      this.socket.on('delete_status', (data: any) => {
        console.log('Delete status received:', data);
        this.addToConsole(`Delete Status: ${JSON.stringify(data)}`);
        
        if (data.status === 'SUCCESS' || data.status === 'success') {
          this.addToConsole('✓ Deployment deleted successfully!');
          
          // Update streaming services to reflect deletion
          this.updateStreamingServicesAfterDeletion();
          
        } else if (data.status === 'ERROR' || data.status === 'error') {
          this.deploymentStatus = 'error';
          this.deploymentStatusMessage = 'Deployment deletion failed';
          this.addToConsole(`✗ Deletion failed: ${data.message || data.error || 'Unknown error'}`);
          this.service.message('Failed to delete deployment', 'error');
          this.isDeletingDeployment = false;
          this.disconnectWebSocket();
        }
      });
      
      // Connection error
      this.socket.on('connect_error', (error: any) => {
        this.addToConsole(`Connection error: ${error.message}`);
        this.deploymentStatus = 'error';
        this.deploymentStatusMessage = 'Connection error occurred during deletion';
        this.isDeletingDeployment = false;
        this.service.message('Failed to connect for deletion', 'error');
      });
      
      // Disconnection
      this.socket.on('disconnect', (reason: string) => {
        this.addToConsole(`Disconnected: ${reason}`);
        if (this.isDeletingDeployment) {
          this.isDeletingDeployment = false;
          this.deploymentStatus = 'error';
          this.deploymentStatusMessage = 'Connection lost during deletion';
        }
      });
      
    } catch (error) {
      this.addToConsole(`Failed to initialize WebSocket for deletion: ${error}`);
      this.deploymentStatus = 'error';
      this.deploymentStatusMessage = 'Failed to initialize deletion';
      this.isDeletingDeployment = false;
      throw error;
    }
  }

  /**
   * Update streaming services after successful deletion
   */
  private async updateStreamingServicesAfterDeletion(): Promise<void> {
    try {
      if (!this.currentCname) {
        return;
      }
      
      const organization = this.getOrganization();
      const streamingServicesUrl = this.baseUrl + `/service/v1/streamingServices/${this.currentCname}/${organization}`;
      
      console.log('Updating streaming services after deletion from:', streamingServicesUrl);
      this.addToConsole('Updating service configuration...');
      
      // Fetch current streaming services data
      const getResponse = await this.http.get<any>(streamingServicesUrl).toPromise();
      
      if (getResponse && getResponse.json_content) {
        let jsonContent = JSON.parse(getResponse.json_content);
        
        // Update runner_service_status to false
        jsonContent.runner_service_status = false;
        
        // Remove playground URL
        delete jsonContent.playgroundurl;
        
        const putPayload = {
          ...getResponse,
          json_content: JSON.stringify(jsonContent)
        };
        
        // Update via API
        const updateUrl = this.baseUrl + '/service/v1/streamingServices/update';
        await this.http.put<any>(updateUrl, putPayload).toPromise();
        
        console.log('Streaming services updated after deletion');
        this.addToConsole('✓ Service configuration updated successfully');
        
        // Update local status
        this.runnerServiceStatus = false;
        this.isPlaygroundEnabled = false;
        this.deploymentStatus = 'idle';
        this.deploymentStatusMessage = '';
        this.isDeletingDeployment = false;
        
        this.service.messageService({ status: 200, body: 'Success' }, 'Deployment deleted successfully!');
        this.disconnectWebSocket();
        
      } else {
        throw new Error('Failed to fetch streaming services data');
      }
      
    } catch (error) {
      console.error('Error updating streaming services after deletion:', error);
      this.addToConsole(`✗ Error updating service configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.deploymentStatus = 'error';
      this.deploymentStatusMessage = 'Deletion completed but failed to update configuration';
      this.isDeletingDeployment = false;
      this.disconnectWebSocket();
    }
  }

  /**
   * Run and Deploy the agent using WebSocket pipeline
   */
  runAndDeploy(): void {
    if (!this.canRunAndDeploy()) {
      return;
    }

    this.isRunningAndDeploying = true;
    this.deploymentStatus = 'running';
    this.deploymentStatusMessage = 'Pushing files to MinIO...';
    this.isPlaygroundEnabled = false; // Disable playground during deployment
    
    // Clear previous console output - console only shows WebSocket data during deployment
    this.consoleOutput = [];
    this.addToConsole('Starting deployment process...');
    this.addToConsole('Step 1: Pushing files to MinIO storage...');
    
    // ALWAYS call pushToMinio first before WebSocket APIs
    this.pushToMinioThenDeploy();
  }

  /**
   * Push to MinIO first, then start WebSocket deployment pipeline
   */
  private pushToMinioThenDeploy(): void {
    if (!this.currentCname) {
      this.deploymentStatus = 'error';
      this.deploymentStatusMessage = 'No container name available for deployment';
      this.isRunningAndDeploying = false;
      return;
    }
    
    // Get organization from localStorage or use default
    const organization = localStorage.getItem('organisation') || 'leo1311';
    
    console.log('Step 1: Pushing to MinIO before WebSocket deployment:', {
      cname: this.currentCname,
      organization: organization
    });
    
    // Call the MinIO upload API first
    this.agentPipelineService.uploadToMinio(this.currentCname, organization).subscribe({
      next: (response) => {
        console.log('MinIO push successful, proceeding to WebSocket deployment:', response);
        this.addToConsole('✓ Files successfully pushed to MinIO storage');
        this.addToConsole('Step 2: Starting WebSocket deployment pipeline...');
        
        // Show success snackbar message
        this.service.message('Files successfully pushed to MinIO storage', 'success');
        
        // Update status message and proceed to WebSocket
        this.deploymentStatusMessage = 'Files pushed to MinIO, starting deployment...';
        
        // Now initialize WebSocket connection for deployment
        this.initializeWebSocket();
      },
      error: (error) => {
        console.error('MinIO push error received:', error);
        console.log('Error object structure:', {
          status: error.status,
          statusText: error.statusText,
          statusText_includes_OK: error.statusText?.toLowerCase().includes('ok'),
          error: error.error,
          message: error.message
        });

        // Check if this is actually a success (status 200-299 OR statusText contains "OK")
        // Backend logs show success but Angular might misinterpret the response
        const isActualSuccess = 
          (error.status >= 200 && error.status < 300) || 
          error.statusText?.toLowerCase().includes('ok') ||
          (error.status === 200 && error.name === 'HttpErrorResponse') ||
          error.message?.includes('parsing');

        if (isActualSuccess) {
          console.log('API actually succeeded despite being in error handler - treating as success');
          this.addToConsole('✓ Files successfully pushed to MinIO storage');
          this.addToConsole('Step 2: Starting WebSocket deployment pipeline...');
          this.service.message('Files successfully pushed to MinIO storage', 'success');
          this.deploymentStatusMessage = 'Files pushed to MinIO, starting deployment...';
          this.initializeWebSocket();
        } else {
          // Real error - stop deployment
          this.deploymentStatus = 'error';
          this.deploymentStatusMessage = 'Failed to push files to MinIO. Deployment aborted.';
          this.addToConsole('✗ Failed to push files to MinIO storage');
          this.addToConsole(`Error: ${error.status} ${error.statusText || ''} - ${error.message || 'Unknown error'}`);
          
          // Check if error has the new format with details
          if (error?.error?.details) {
            this.service.message(error.error.details, 'error');
          } else if (error?.error?.message) {
            this.service.message(error.error.message, 'error');
          } else if (error?.message) {
            this.service.message(error.message, 'error');
          } else {
            const errorMessage = 'Unknown error occurred during MinIO push';
            this.service.message(errorMessage, 'error');
          }
          this.isRunningAndDeploying = false;
        }
      }
    });
  }

  /**
   * Fetch datasource credentials from the API
   */
  /**
   * Initialize WebSocket connection for deployment pipeline
   */
 private initializeWebSocket(): void {
    console.log('  STARTING WEBSOCKET INITIALIZATION PROCESS');
    try {
      console.log('  Step 1: Connecting to WebSocket server...');
      // Connect to the WebSocket server
      //  const webSocketUrl = 'http://100.78.49.149/';
        //console.log(' WebSocket connecting to URL:', webSocketUrl);
       // this.socket = io(webSocketUrl, {
//	  transports: ['websocket'],
  //        timeout: 20000,
    //      forceNew: true
     //   });
	  
	const environmentUrl = this.getEnvironmentUrl();
	console.log('  Connecting to WebSocket at environment URL:', environmentUrl);
	
	// Bulletproof method to ensure HTTPS protocol (not WSS)
	// Allow websocket transport but force HTTP protocol to prevent wss:// conversion
		  
	this.socket = io(environmentUrl, {
	  path: '/apps/builder-service/socket.io',
	  transports: ['websocket','polling'],       // <-- force polling only
	  timeout: 60000,
	  forceNew: true,
	  rejectUnauthorized: false,
	  withCredentials: true,         // optional; harmless if cookies are set
	  reconnection: false,
	});  
        // Connection successful
        this.socket.on('connect', () => {
          console.log('  Step 2: WebSocket connected! Fetching deployment alias...');
          // First fetch the streaming service to get the alias for deployment_name
          const organization = this.getOrganization();
          const streamingServiceUrl = this.baseUrl + `/service/v1/streamingServices/${this.currentCname}/${organization}`;
          
          console.log('  Step 2.1: Fetching streaming service alias from:', streamingServiceUrl);
          this.addToConsole(`Fetching deployment configuration...`);
          
          this.http.get<any>(streamingServiceUrl).toPromise().then((streamingResponse) => {
            console.log('  Step 2.2: Streaming service response:', streamingResponse);
            
            // CRITICAL: Update selectedAgent with alias from streaming service API response
            if (streamingResponse && streamingResponse.alias) {
              if (!this.selectedAgent) {
                this.selectedAgent = {} as AgentCard;
              }
              this.selectedAgent.alias = streamingResponse.alias;
              this.selectedAgent.cname = streamingResponse.name || this.currentCname;
              console.log('  Step 2.2a: Updated selectedAgent with alias:', this.selectedAgent.alias, 'and cname:', this.selectedAgent.cname);
            }
            // Use alias from selected card (uppercase)
            const deploymentAlias = (this.pipelineAlias ? this.pipelineAlias.toString() : 'DEFAULT-AGENT').toLowerCase();
            this.currentDeploymentName = deploymentAlias; // Store for use in playground URL
            
 // Now prepare payload with deployment_name from alias
            const apiParams = this.getApiParametersForMode();
     console.log('  Step 2.3: Using deployment alias:', deploymentAlias);
            
            // Generate dynamic target_image_tag from config
            const targetImageTag = `${pipelineConfig.containerRegistry.registryPrefix}${deploymentAlias}:${pipelineConfig.containerRegistry.imageVersion}`;
            console.log('  Step 2.4: Generated dynamic target_image_tag:', targetImageTag);
            
            // Determine deployment name based on pipeline mode
            const deploymentName = this.pipelineMode === 'mcp' 
              ? 'service-qualification-mcp-5g' 
              : 'service-qualification-agent-5g';
            
            const payload = {
              minio_endpoint: pipelineConfig.minio.endpoint,
              bucket_name: pipelineConfig.minio.bucketName,
              file_path: `ai-agent-scripts/${this.currentCname}/${organization}/${this.currentCname}-${organization}.zip`,
              target_image_tag: targetImageTag,
              deployment_name: deploymentAlias, // Dynamic value from API
              cname: this.currentCname,
              organization: organization,
              type: apiParams.type,
              interface: apiParams.interface
            };
           
            console.log('  Step 3: Sending start_pipeline event with dynamic payload:', payload);
            this.addToConsole(`Starting ${this.pipelineMode === 'mcp' ? 'MCP server' : 'agent'} pipeline with deployment: ${deploymentName}`);
            this.addToConsole(`Pipeline type: ${payload.type}, interface: ${payload.interface}`);
            this.socket?.emit('start_pipeline', payload);
            console.log('  Step 4: start_pipeline event emitted to WebSocket');
          }).catch((error) => {
            console.error('  ERROR: Failed to fetch streaming service alias:', error);
            this.addToConsole(`Error fetching deployment configuration: ${error.message || error}`);
            
            // Use alias from selected card (uppercase)
            const apiParams = this.getApiParametersForMode();
            const fallbackDeploymentName = (this.pipelineAlias ? this.pipelineAlias.toString() : 'DEFAULT-AGENT').toLowerCase();
            this.currentDeploymentName = fallbackDeploymentName; // Store for use in playground URL
            
            // Generate dynamic target_image_tag from config for fallback
            const fallbackTargetImageTag = `${pipelineConfig.containerRegistry.registryPrefix}${fallbackDeploymentName}:${pipelineConfig.containerRegistry.imageVersion}`;
            console.log('  Step 3 (Fallback): Generated dynamic target_image_tag:', fallbackTargetImageTag);
            
            const fallbackPayload = {
              minio_endpoint: pipelineConfig.minio.endpoint,
              bucket_name: pipelineConfig.minio.bucketName,
              file_path: `ai-agent-scripts/${this.currentCname}/${organization}/${this.currentCname}-${organization}.zip`,
              target_image_tag: fallbackTargetImageTag,
              deployment_name: fallbackDeploymentName, // mode-specific fallback
              cname: this.currentCname,
              organization: organization,
              type: apiParams.type,
              interface: apiParams.interface
            };
            
            console.log('  Step 3 (Fallback): Using fallback payload due to API error:', fallbackPayload);
            this.addToConsole(`Using fallback deployment name: ${fallbackDeploymentName}`);
            this.socket?.emit('start_pipeline', fallbackPayload);
          });
        });
 
        // Pipeline update events (high-level steps)
        this.socket.on('pipeline_update', (data: any) => {
          this.addToConsole(`[${data.step}] ${data.message}`);
        });
 
        // Build log events (raw docker build logs)
        this.socket.on('build_log', (data: any) => {
          this.addToConsole(`${data.log}`);
        });
 
        // Final pipeline status
        this.socket.on('pipeline_status', (data: any) => {
          this.addToConsole(`FINAL STATUS: ${data.status}`);
         
          if (data.status === 'SUCCESS' || data.status === 'success') {
            this.deploymentStatus = 'success';
            this.deploymentStatusMessage = 'Deployment completed successfully! Playground is now enabled.';
            this.isPlaygroundEnabled = true; // Enable playground only on successful deployment
            
            // Call streaming services API after successful deployment
            this.updateStreamingServicesWithPlaygroundUrl();
          } else {
            this.deploymentStatus = 'error';
            this.deploymentStatusMessage = 'Deployment failed. Please check the console output and try again.';
            this.isPlaygroundEnabled = false; // Keep playground disabled on error
            if (data.error) {
              this.addToConsole(`Error: ${data.error}`);
            }
          }
         
          this.isRunningAndDeploying = false;
          this.disconnectWebSocket();
        });
 
        // Connection error
        this.socket.on('connect_error', (error: any) => {
          this.addToConsole(`Connection error: ${error.message}`);
          this.deploymentStatus = 'error';
          this.deploymentStatusMessage = 'Connection error occurred. Playground is disabled.';
          this.isPlaygroundEnabled = false;
          this.isRunningAndDeploying = false;
        });

        // Disconnection
        this.socket.on('disconnect', (reason: string) => {
          this.addToConsole(`Disconnected: ${reason}`);
          if (this.isRunningAndDeploying) {
            this.isRunningAndDeploying = false;
            this.deploymentStatus = 'error';
            this.deploymentStatusMessage = 'Connection lost during deployment. Playground is disabled.';
            this.isPlaygroundEnabled = false;
          }
        });
 
    } catch (error) {
      this.addToConsole(`Failed to initialize WebSocket: ${error}`);
      this.deploymentStatus = 'error';
      this.isRunningAndDeploying = false;
    }
  }

  /**
   * Disconnect WebSocket connection
   */
  private disconnectWebSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Update streaming services with playground URL after successful deployment
   */
  private async updateStreamingServicesWithPlaygroundUrl(): Promise<void> {
    try {
      if (!this.currentCname) {
        console.error('Cannot update streaming services: no currentCname available');
        return;
      }

      const organization = this.getOrganization();
      const streamingServicesUrl = this.baseUrl + `/service/v1/streamingServices/${this.currentCname}/${organization}`;
      
      console.log('Fetching streaming services data from:', streamingServicesUrl);
      this.addToConsole('Updating streaming services with playground URL...');
      
      // Step 1: GET the current streaming services data
      const getResponse = await this.http.get<any>(streamingServicesUrl).toPromise();
      console.log('Streaming services GET response:', getResponse);
      
      if (getResponse && getResponse.json_content) {
        // Step 2: Parse the existing json_content
        let jsonContent = JSON.parse(getResponse.json_content);
        console.log('Parsed existing json_content:', jsonContent);
        
           // Step 3: Add/update the playgroundUrl and runner_service_status
        const environmentUrl = this.getEnvironmentUrl();
        const deploymentAlias = this.pipelineAlias ? this.pipelineAlias.toString() : 'DEFAULT-AGENT';
        jsonContent.playgroundurl = `${environmentUrl}/apps/${deploymentAlias}/ask`;
        jsonContent.runner_service_status = true;
        console.log('Updated json_content with playground URL and runner_service_status:', jsonContent);
        
        // Step 4: Prepare the PUT payload with updated json_content
        const putPayload = {
          ...getResponse,
          json_content: JSON.stringify(jsonContent)
        };
        
        console.log('Sending PUT request to update streaming services:', putPayload);
        
         // Step 5: PUT the updated data back using the update endpoint
        const updateUrl = this.baseUrl + '/service/v1/streamingServices/update';
        const putResponse = await this.http.put<any>(updateUrl, putPayload).toPromise();
        console.log('Streaming services PUT response:', putResponse);
        
        this.addToConsole('Streaming services updated successfully with playground URL!');
         // Update local runner_service_status
        this.runnerServiceStatus = true;
      } else {
        console.log('No json_content found in streaming services response');
        this.addToConsole('Warning: Could not update streaming services - no json_content found');
      }
      
    } catch (error) {
      console.error('Error updating streaming services with playground URL:', error);
      this.addToConsole(`Error updating streaming services: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add WebSocket message to console output with timestamp
   * Console is only used for WebSocket deployment data
   */
  private addToConsole(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.consoleOutput.push(`[${timestamp}] ${message}`);
    
    // Trigger change detection to update the UI
    this.cdr.detectChanges();
    
    // Auto-scroll to bottom of console if element exists
    setTimeout(() => {
      const consoleElement = document.querySelector('.console-output');
      if (consoleElement) {
        consoleElement.scrollTop = consoleElement.scrollHeight;
      }
    }, 100);
  }

  /**
   * Push agent files to MinIO (integrated with existing Push to MinIO functionality)
   */
  pushToMinio(): void {
    if (!this.currentCname) {
      return;
    }
    
    // Get organization from localStorage or use default
    const organization = localStorage.getItem('organisation') || 'leo1311';
    
    console.log('Pushing to MinIO:', {
      cname: this.currentCname,
      organization: organization
    });
    
    // Call the API - Handle parsing errors and different response types properly
    this.agentPipelineService.uploadToMinio(this.currentCname, organization).subscribe({
      next: (response) => {
        console.log('MinIO push successful:', response);
        
        // Always show success message for 200 status - API returned success
        const successResponse = { status: 200, body: response || 'Success' };
        this.service.messageService(successResponse, 'Push to MinIO completed successfully!');
      },
      error: (error) => {
        console.error('MinIO push error received:', error);
        console.log('Error object structure:', {
          status: error.status,
          statusText: error.statusText,
          statusText_includes_OK: error.statusText?.toLowerCase().includes('ok'),
          error: error.error,
          message: error.message
        });
        
        // Check if this is actually a success (status 200-299 OR statusText contains "OK")
        // Backend logs show success but Angular might misinterpret the response
        const isActualSuccess = 
          (error.status >= 200 && error.status < 300) || 
          error.statusText?.toLowerCase().includes('ok') ||
          (error.status === 200 && error.name === 'HttpErrorResponse') ||
          error.message?.includes('parsing');
        
        if (isActualSuccess) {
          console.log('API actually succeeded despite being in error handler - treating as success');
          const successResponse = { status: 200, body: error.error || 'Success' };
          this.service.messageService(successResponse, 'Push to MinIO completed successfully!');
        } else {
          // Real error - show error message
          console.error('Actual MinIO push error:', error);
          const errorResponse = error.status ? error : { status: 500, body: 'Unknown error' };
          this.service.messageService(errorResponse, 'Push to MinIO failed. Please try again.');
        }
      }
    });
  }

  /**
   * Open file upload dialog for agent files
   */
  openUploadDialog(): void {
    this.showUploadDialog = true;
    this.selectedZipFile = null;
  }

  /**
   * Close upload dialog and reset state
   */
  closeUploadDialog(): void {
    this.showUploadDialog = false;
    this.selectedZipFile = null;
  }

  /**
   * Handle file selection in upload dialog
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.zip')) {
      this.selectedZipFile = file;
      console.log('Selected zip file:', file.name, 'Size:', file.size);
    } else {
      this.service.message('Please select a valid ZIP file', 'error');
      this.selectedZipFile = null;
    }
  }

  /**
   * Handle ZIP file created from GitHub pull
   */
  onGitHubPullZipCreated(zipFile: File): void {
    console.log('GitHub pull ZIP file received:', zipFile.name, 'Size:', zipFile.size);
    this.selectedZipFile = zipFile;
    
    // Automatically trigger upload
    this.uploadAgentFiles();
  }

  /**
   * Upload selected zip file to server
   */
  uploadAgentFiles(): void {
    if (!this.selectedZipFile || !this.currentCname) {
      this.service.message('Please select a ZIP file', 'error');
      return;
    }

    this.isUploadingFiles = true;
    const organization = this.getOrganization();

    console.log('Uploading files:', {
      cname: this.currentCname,
      organization: organization,
      fileName: this.selectedZipFile.name,
      fileSize: this.selectedZipFile.size,
      mode: this.pipelineMode
    });

    // Call the upload API - the service should handle MCP vs Agent differentiation
    this.agentPipelineService.uploadAgentFilesZip(this.currentCname, organization, this.selectedZipFile).subscribe({
      next: (response) => {
        console.log('Upload successful:', response);
        this.service.message(
          `${this.pipelineMode === 'mcp' ? 'MCP server' : 'Agent'} files uploaded successfully!`, 
          'success'
        );
        
        // Close upload dialog
        this.closeUploadDialog();
        
        // Enable codespace and load files
        this.hasGeneratedAgent = true;
        
        // Load the uploaded files
        setTimeout(() => {
          this.loadAgentFiles();
        }, 1000);
        
        this.isUploadingFiles = false;
      },
      error: (error) => {
               let errorMessage = `Failed to upload ${this.pipelineMode === 'mcp' ? 'MCP server' : 'agent'} files`;
        
        // Check if error has the new format with details
         if (error?.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        } else if (error?.message) {
           errorMessage = error.message;
        }
           this.service.message(errorMessage, 'error');
        this.isUploadingFiles = false;
      }
    });
  }

  /**
   * Check if upload button should be shown (when no files exist yet)
   */
  shouldShowUploadButton(): boolean {
    return !this.hasGeneratedAgent && !this.isLoadingFiles;
  }

  /**
   * Get API parameters based on current pipeline mode
   */
  private getApiParametersForMode(): { type: string; interface: string } {
    if (this.pipelineMode === 'mcp') {
      return {
        type: 'mcpServer',
        interface: 'mcp-pipeline'
      };
    } else {
      return {
        type: 'AIAgent',
        interface: 'pipeline-agent'
      };
    }
  }

  /**
   * Check if run and playground buttons should be shown (only when files exist)
   */
  shouldShowRunPlaygroundButtons(): boolean {
    return this.hasGeneratedAgent && this.fileSystemData && this.fileSystemData.length > 0;
  }
 /**
   * Fetch runner_service_status from API
   */
  private async fetchRunnerServiceStatus(): Promise<void> {
    if (!this.currentCname) {
      console.warn('Cannot fetch runner_service_status: currentCname is not set');
      return;
    }

    try {
      const organization = this.getOrganization();
      const streamingServicesUrl = this.baseUrl + `/service/v1/streamingServices/${this.currentCname}/${organization}`;
      
      console.log('Fetching runner_service_status from:', streamingServicesUrl);
      const response = await this.http.get<any>(streamingServicesUrl).toPromise();
      
      console.log('API Response:', response);
      
      if (response && response.json_content) {
        const jsonContent = JSON.parse(response.json_content);
        console.log('Parsed json_content:', jsonContent);
        
        this.runnerServiceStatus = jsonContent.runner_service_status === true;
        console.log('✅ Set runnerServiceStatus to:', this.runnerServiceStatus);
        console.log('Button states:', {
          canRunAndDeploy: this.canRunAndDeploy(),
          canDeleteDeployment: this.canDeleteDeployment(),
          hasFiles: this.hasGeneratedAgent || this.hasExistingFiles(),
          isRunningAndDeploying: this.isRunningAndDeploying,
          isDeletingDeployment: this.isDeletingDeployment
        });
        
        // Trigger change detection
        this.cdr.detectChanges();
      } else {
        console.warn('No json_content in response, setting runnerServiceStatus to false');
        this.runnerServiceStatus = false;
      }
    } catch (error) {
      console.error('❌ Error fetching runner_service_status:', error);
      this.runnerServiceStatus = false;
    }
  }
  // Methods removed - auto-loading enabled when viewing details
  // generateadkAgent() and clearConsole() methods are no longer needed

  // LLM Selection and Prompt Template methods
  getPromptTemplate(): string {
    return `PROJECT STRUCTURE & EXECUTION PROTOCOL
1. File Structure:
   - Place all source code in a \`src/\` directory (e.g., \`src/main.py\`, \`src/config.py\`).
   - Place \`requirements.txt\` and \`.env\` in the project root.

2. Import Safety (CRITICAL):
   - The user will run the application from the project root using: \`python src/main.py\`
   - To prevent "ModuleNotFoundError", the \`main.py\` entry point MUST explicitly add the project root to \`sys.path\` before importing internal modules.
   - Use this snippet at the top of \`src/main.py\`:
     \`\`\`python
     import sys
     import os
     # Add project root to sys.path to fix imports when running from src/
     sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
     \`\`\`

3. Import Style:
   - Use absolute imports starting with \`src.\` (e.g., \`from src.config import AppConfig\`) OR relative imports (e.g., \`from .config import AppConfig\`) consistently.
   
FILE CREATION PROTOCOL 

You MUST create and save files directly in the current workspace using file blocks.
For each file, emit a fenced block that starts with an exact header line:
# file: src/<filename>.py

(or # file: requirements.txt for requirements)
After generating the block, apply the edit by creating the file in the workspace at that path. Do not merely display content in chat.
If the agent cannot apply edits automatically, show and execute the VS Code "Create file" action for each block.
Never skip file creation; confirm by listing the created files with their relative paths at the end.

ROLE & OBJECTIVE
You are a Senior Python Engineer and AI Systems Architect.
Convert a raw **Langflow Design JSON** (directed graph) into a production‑ready, modular **Python ADK** codebase. The output MUST work for ANY Langflow design (any number of nodes/agents/tools). For phase‑1, avoid complex conditional branching: detect it, log one line, and linearize execution.

INPUT
You will receive a Langflow graph JSON containing:
- Nodes: functions, agents, tools, prompts, LLMs, etc.
- Edges: data flow dependencies (source -> target).

OUTPUT — EXACTLY 7 FILES
Generate a multi‑file Python project with EXACTLY these files and NO extras:
1) \`__init__.py\`
2) \`workflow_state.py\`
3) \`config.py\`
4) \`nodes.py\`
5) \`graph_builder.py\`
6) \`main.py\`
7) \`requirements.txt\`

FILE EMISSION FORMAT (STRICT)
- For each file, output a fenced code block.
- The first line in each block MUST be a comment: \`# file: <relative_path/filename>\`
- Use \`src/\` as the root code directory for all Python files.
- Example block header:
  \`\`\`python
  # file: src/workflow_state.py
  \`\`\`
- Output only ASCII characters in code and logs (Windows‑safe). No emojis, arrows, or unicode symbols.
- After emitting all seven files, print a short ASCII "Build summary" section (no extra prose).

GENERAL RULES (CRITICAL)
- **Modern libraries only:** Use \`langchain_core\` + \`langchain_openai\`, \`langgraph.graph\` and \`langgraph.prebuilt\` (where tool use requires it), \`pydantic\` v2, and \`pydantic_settings\` v2. Avoid deprecated modules and legacy agent executors.
- **Environment management:** Read env via \`pydantic_settings.BaseSettings\` (v2). Do NOT call \`os.getenv\` directly in application logic.
- **Azure/OpenAI dual support:** Prefer Azure OpenAI if credentials exist; else fall back to OpenAI. Never hard‑code model names—read from node JSON or env; provide safe defaults.
- **No conditional branching (phase‑1):** If routers/conditions exist, log "Branching detected; skipped in phase-1" and build a straight‑through path using primary edge order only.
- **Idempotent state:** Each node returns a \`dict\` with only keys it produces; graph merges deterministically.
- **Error handling:** Each node wraps execution in \`try/except\`, logs concise ASCII messages, and returns \`{ "error": "<message>" }\` without crashing the workflow.
- **Strict imports whitelist:**
  - \`langchain_core.*\`
  - \`langchain_openai\` (AzureChatOpenAI, ChatOpenAI)
  - \`langgraph.graph\`, \`langgraph.prebuilt\`
  - \`pydantic\`, \`pydantic_settings\`
  - \`python_dotenv\` (optional dev convenience)
  - Standard library and \`typing\`
- **Logging:** Use the \`logging\` module, INFO level default, ASCII messages only.

PROJECT SPECIFICATION & ACCEPTANCE CRITERIA

1) __init__.py
- Minimal package initialization; export \`create_workflow\` and \`run_workflow\`.
- ASCII docstring summarizing the package and phase‑1 limitation.

2) workflow_state.py
- Define \`WorkflowState\` (Pydantic v2 \`BaseModel\`) capturing all keys produced/required by nodes in the JSON.
- Include \`messages: list[dict] = Field(default_factory=list)\` for chat history.
- Include all node outputs as \`Optional[...]\` fields (discoverability).
- Provide:
  \`\`\`python
  def update(self, delta: dict) -> "WorkflowState":
      # merges keys deterministically and returns self
  \`\`\`
- Keep it simple; do NOT use \`Annotated\` or \`operator.add\`.

3) config.py
- Use \`from pydantic_settings import BaseSettings\`
- Pydantic v2 config style:
  \`\`\`python
  class AppConfig(BaseSettings):
      model_config = ConfigDict(
          env_file=".env",
          env_file_encoding="utf-8",
          case_sensitive=False
      )
  \`\`\`
- Fields with aliases for env vars:
  - Azure: \`AZURE_OPENAI_API_KEY\`, \`AZURE_OPENAI_ENDPOINT\`, \`AZURE_OPENAI_DEPLOYMENT\`
  - OpenAI: \`OPENAI_API_KEY\`
  - Common: \`MODEL_NAME\`, \`TEMPERATURE\`, \`SYSTEM_PROMPT\`, \`TIMEOUT_SECONDS\`
- Implement \`model_post_init\` for normalization.
- Implement:
  - \`is_azure(self) -> bool\`
  - \`is_openai(self) -> bool\`
  - \`validate(self) -> None\` (ensures Azure OR OpenAI creds exist; raises \`ValueError\` single‑line if not)
- Do not hard‑code values; allow node JSON to override via parameters.

4) nodes.py
- For every JSON node, create:
  \`\`\`python
  def node_<sanitized_node_id>(state: WorkflowState, config: AppConfig) -> dict:
      ...
      return { "<output_key>": <value>, ... }
  \`\`\`
- Add \`get_model(config: AppConfig, node_params: dict | None = None)\` helper:
  - If Azure creds exist, return \`AzureChatOpenAI\` with endpoint + deployment; take \`model_name\` from node_params or env.
  - Else return \`ChatOpenAI\` with \`model_name\` from node_params or env.
  - Apply \`temperature\`, \`timeout\`, etc., from node_params or config defaults.
- **LLM usage:**
  - Prompt‑only nodes: format templates safely (guard missing keys) and call \`llm.invoke([{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}])\` or minimal structured messages as supported.
  - Tool‑using nodes: construct tools list; use \`langgraph.prebuilt.create_react_agent(llm, tools, prompt=<system_prompt>)\`. Do NOT use \`AgentExecutor\`.
- **Prompt nodes:** Render with \`str.format(**safe_state_dict)\`; if key missing, log and substitute empty string.
- **Tool nodes:** Implement Python wrappers; if unknown external tool, stub and log "Tool '<name>' not implemented in phase-1", return passthrough.
- Each node must have \`try/except\` and concise ASCII logging.

5) graph_builder.py
- \`from langgraph.graph import StateGraph\`
- Build \`StateGraph(WorkflowState)\` and add nodes via \`functools.partial(node_func, config=config)\`.
- Add edges exactly per JSON source->target order. If multiple outgoing edges (branching), choose the first listed edge for phase‑1; log and skip others.
- Determine \`entry_point\` and \`finish_point\`:
  - If explicit in JSON, use them.
  - Else infer: entry = first node with no inbound edges; finish = last node with no outbound edges.
- Provide:
  - \`def create_workflow(design_json: dict, config: AppConfig):\` → returns compiled graph
  - \`def visualize_graph_structure(design_json: dict) -> str:\` → returns ASCII topology (one node per line with its successors)

6) main.py
- CLI \`main()\` via \`argparse\` supporting only \`--debug\` and \`--session-id\`.
- \`check_dependencies()\` verifies imports; on ImportError, print one ASCII line and \`sys.exit(1)\`.
- \`load_config()\` instantiates \`AppConfig\` (auto‑loads \`.env\`) and calls \`config.validate()\`.
- Load \`./design.json\` from the repo root (phase‑1 requirement).
- Build workflow with \`create_workflow(design_json, config)\`.
- Interactive input:
  \`\`\`python
  input_message = input("Enter your question: ")
  \`\`\`
  Append to \`state.messages\`, run the graph, print concise ASCII result.
- Graceful errors: one‑line guidance, exit non‑zero.

7) requirements.txt
- Pin modern, compatible versions (use >= to reduce environment breakage):
  - langchain>=0.3.0
  - langchain-core>=0.3.0
  - langchain-openai>=0.2.0
  - langgraph>=0.2.0
  - pydantic>=2.0.0
  - pydantic-settings>=2.0.0
  - python-dotenv>=1.0.0

JSON INTERPRETATION RULES
- Map node types:
  - "LLM", "Chat Model" → model via \`get_model()\`, call \`invoke()\` with message dicts.
  - "Prompt" → template format node, output string.
  - "Tool" → Python wrapper; if unknown or external, stub and log once.
- Extract per‑node parameters (\`model_name\`, \`temperature\`, \`system_prompt\`, etc.) from node config; fallback to env/config defaults.
- Sanitize node ids to valid Python identifiers: lower‑case; non‑alphanumeric → \`_\`; ensure uniqueness.
- Infer output keys per node type; include these as optional fields in \`WorkflowState\`.

QUALITY & SAFETY PRE‑FLIGHT (the agent MUST do before finalizing output)
- No deprecated imports: do NOT use \`langchain.chat_models\`, \`AgentExecutor\`, or legacy submodules.
- Use \`create_react_agent\` ONLY if tools exist; otherwise call \`llm.invoke\`.
- Read env via \`pydantic_settings.BaseSettings\`; do NOT use \`os.getenv\` directly.
- ASCII logging only.
- Each file begins with \`# file: src/<name>.py\` (or \`# file: requirements.txt\`) and compiles cleanly.

PHASE‑1 LIMITATION
- If routers/conditions/branches are found, print/log:
  "Branching detected; skipped in phase-1"
  Then build a linear workflow using the first‑listed edge path.

DELIVERABLES
- Output exactly seven files, each in a fenced code block with the required header.
- After the files, output a brief ASCII "Build summary" with a single paragraph and a bullet list of node functions generated.`;
  }

  copyPromptTemplate(): void {
    const promptText = this.getPromptTemplate();
    
    // Copy to clipboard using the Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(promptText).then(() => {
        this.showPromptCopyDialog = true;
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        // Fallback to other copy method
        this.fallbackCopyToClipboard(promptText);
      });
    } else {
      // Fallback for older browsers or non-secure contexts
      this.fallbackCopyToClipboard(promptText);
    }
  }

  private fallbackCopyToClipboard(text: string): void {
    // Create a temporary textarea element
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.showPromptCopyDialog = true;
      } else {
        console.error('Copy command was unsuccessful');
      }
    } catch (err) {
      console.error('Fallback copy failed: ', err);
    }
    
    document.body.removeChild(textArea);
  }

  closePromptCopyDialog(): void {
    this.showPromptCopyDialog = false;
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


  /**
   * Get tooltip message for playground button based on deployment status
   */
  getPlaygroundTooltipMessage(): string {
    if (!this.hasGeneratedAgent) {
      return 'Generate agent code first to enable playground';
    }
    
    if (!this.isPlaygroundEnabled) {
      if (this.isRunningAndDeploying) {
        return 'Deployment in progress. Playground will be enabled after successful deployment.';
      } else if (this.deploymentStatus === 'error') {
        return 'Deployment failed. Run and Deploy successfully to enable playground.';
      } else if (this.deploymentStatus === 'idle') {
        return 'Run and Deploy the agent first to enable playground.';
      }
    }
    
    return 'Open playground to test your agent';
  }

  /**
   * Check if playground button should be enabled
   * Playground is only available for agent pipelines, not MCP
   */
  canOpenPlayground(): boolean {
    return this.shouldShowRunPlaygroundButtons() && this.isPlaygroundEnabled && !this.isRunningAndDeploying;
  }

  // Playground methods
  openPlayground(): void {
    if (!this.canOpenPlayground()) {
      return;
    }
    
    // First fetch the playground URL from streaming services API
    this.fetchPlaygroundUrl().then(() => {
      this.showPlayground = true;
      const agentName = this.selectedAgent?.alias || this.selectedAgent?.name || this.currentCname || 'Agent';
      const agentVersion = this.selectedAgent?.version || '1.0.0';
      this.playgroundMessages = [
        {
          role: 'agent',
          content: `Hello! I'm the ${agentName} (v${agentVersion}). I'm now running from the generated adk. How can I help you today?`
        }
      ];
    }).catch((error) => {
      console.error('Failed to fetch playground URL:', error);
      // Show playground anyway with error message
      this.showPlayground = true;
      this.playgroundMessages = [
        {
          role: 'agent',
          content: 'Error: Unable to connect to the agent service. Please try again later.'
        }
      ];
    });
  }

  /**
   * Fetch playground URL from streaming services API
   */
  private async fetchPlaygroundUrl(): Promise<void> {
    try {
      console.log('fetchPlaygroundUrl - checking agent data:', {
        currentCname: this.currentCname,
        selectedAgent: this.selectedAgent,
        cardName: this.cardName
      });
      
      if (!this.currentCname) {
        throw new Error('No agent selected - currentCname is empty');
      }
      
      const organization = this.getOrganization();
      const apiUrl = this.baseUrl + `/service/v1/streamingServices/${this.currentCname}/${organization}`;
      
      console.log('fetchPlaygroundUrl - API URL:', apiUrl);
      
      const response = await this.http.get<any>(apiUrl).toPromise();
      console.log('fetchPlaygroundUrl - Streaming services response:', response);
      
      if (response && response.json_content) {
        const jsonContent = JSON.parse(response.json_content);
        console.log('fetchPlaygroundUrl - Parsed JSON content:', jsonContent);
        
        if (jsonContent.playgroundurl) {
          this.playgroundUrl = jsonContent.playgroundurl;
          console.log('fetchPlaygroundUrl - Found playgroundurl:', this.playgroundUrl);
        } else {
          console.log('fetchPlaygroundUrl - No playgroundurl found, using stored deployment name');
          const environmentUrl = this.getEnvironmentUrl();
          const deploymentName = this.currentDeploymentName; // Use stored deployment name
          this.playgroundUrl = `${environmentUrl}/apps/${deploymentName}/ask`;
          console.log('fetchPlaygroundUrl - Using stored deployment name:', deploymentName);
        }
      } else {
        console.log('fetchPlaygroundUrl - No json_content in response, using stored deployment name');
        const environmentUrl = this.getEnvironmentUrl();
        const deploymentName = this.currentDeploymentName; // Use stored deployment name
        this.playgroundUrl = `${environmentUrl}/apps/${deploymentName}/ask`;
        console.log('fetchPlaygroundUrl - Using stored deployment name:', deploymentName);
      }
    } catch (error) {
      console.error('Error fetching playground URL:', error);
      // Don't generate URL without proper data - selectedAgent might not be populated
      throw error;
    }
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

    // Call real API instead of simulation
    this.callPlaygroundAPI(question);
  }

  /**
   * Call the playground API with user question
   */
  private async callPlaygroundAPI(question: string): Promise<void> {
    try {
      if (!this.playgroundUrl) {
        throw new Error('Playground URL not available');
      }

      // Use the exact playground URL from the streaming services API response
      const apiEndpoint = this.playgroundUrl;
      
      // Send whatever the user typed directly as the request body
      // Try to parse as JSON first, if it fails, send as raw string
      let payload: any;
      try {
        payload = JSON.parse(question);
      } catch (e) {
        // Not valid JSON, send as plain text string
        payload = question;
      }
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      const response = await this.http.post<any>(apiEndpoint, payload, { headers }).toPromise();
      
      // Add agent response
      this.playgroundMessages.push({
        role: 'agent',
        content: response?.answer || response?.response || JSON.stringify(response) || 'I received your question but could not generate a proper response.'
      });
      
    } catch (error) {
      console.error('Error calling playground API:', error);
      // Add error message as agent response
      this.playgroundMessages.push({
        role: 'agent',
        content: 'I apologize, but I encountered an error while processing your request. Please try again later.'
      });
    } finally {
      this.isAgentThinking = false;
    }
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
      'customer-support-agent-adk': ['main', 'develop', 'feature/chat-integration', 'hotfix/bug-fixes'],
      'data-analysis-agent-adk': ['main', 'develop', 'feature/new-charts', 'staging'],
      'code-review-agent-adk': ['main', 'develop', 'feature/security-scan', 'production']
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
    return `feat: Add ${agentName} adk v${version} - Generated on ${timestamp}`;
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
  private async checkForExistingFilesAndLoadState(cname: string): Promise<void> {    console.log('Checking for existing files for cname:', cname);

    // Reset to initial state first
    this.resetToInitialStateForNewAgent();
   // Fetch runner_service_status FIRST and WAIT for it
    await this.fetchRunnerServiceStatus();
    console.log('After fetch, runnerServiceStatus is:', this.runnerServiceStatus);
    // Try to fetch files for this specific cname - only to check existence
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
          // Only enable codespace tab and populate with response data
          this.enableCodespaceTabOnly(apiResponse);
        } else {
          console.log('No files found in response for cname:', cname);
          // Even if API succeeds but no files, show script tab only
          this.showScriptTabOnly();
        }
        this.isLoadingFiles = false;
             // Trigger change detection after files are loaded
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(
          'API error or no existing files found for cname:',
          cname,
          error
        );
        // Check if error has the new format with details
        if (error?.error?.details) {
          this.service.message(error.error.details, 'error');
        } else if (error?.error?.message) {
          this.service.message(error.error.message, 'error');
        }
        // API error or no files exist yet - show script tab only
        this.showScriptTabOnly();
        this.isLoadingFiles = false;
          // Trigger change detection even on error
        this.cdr.detectChanges();
      },
    });
  }

  // Enable codespace tab and populate file structure from list API response
  private enableCodespaceTabOnly(fileData?: any): void {
    this.hasGeneratedAgent = true;
    this.isJsonProcessed = true;

    // Populate file tree from list API response if data is provided
    if (fileData && Array.isArray(fileData) && fileData.length > 0) {
      console.log('Populating file structure from list API response:', fileData.length, 'files');
      this.fileSystemData = this.agentPipelineService.buildFileTreeFromApiResponse(fileData);
      this.expandAllFolders(this.fileSystemData); // Expand all folders by default
    } else {
      console.log('No file data provided, keeping empty file structure');
      this.fileSystemData = []; // Empty initially if no data
    }
    
    // Keep console empty - only WebSocket data from Run and Deploy should appear
    this.consoleOutput = [];

    console.log('Enabled codespace tab for existing agent:', {
      cname: this.currentCname,
      hasFiles: this.fileSystemData.length > 0,
      fileCount: fileData ? fileData.length : 0
    });
  }

  // Show only script tab when no files exist
  private showScriptTabOnly(): void {
    this.hasGeneratedAgent = false;
    this.isJsonProcessed = false; // This will show only the script tab
    this.fileSystemData = [];
    this.consoleOutput = []; // Keep console empty - only WebSocket data allowed
    this.clearFileSelection();
    
    // Show empty script content when no files exist
    if (!this.loadScript || !this.script || this.script.length === 0) {
      this.script = [];
      this.scriptFileName = '';
      this.loadScript = true;
      console.log('Showing empty script content - no placeholder data');
    }

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
    this.consoleOutput = []; // Console starts empty - only WebSocket data during deployment
    this.clearFileSelection();
    
    // Ensure script content is empty for new agents - but don't override API content
    if (!this.hasLoadedApiContent && (!this.loadScript || !this.script || this.script.length === 0)) {
      this.script = [];
      this.scriptFileName = '';
      this.loadScript = true;
      console.log('Set empty script content for new agent (no API content loaded)');
    } else if (this.hasLoadedApiContent) {
      console.log('Preserving API content during reset - not overriding script array');
    }
    
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

  /**
  * Handle deployment form finish event
   * Store deployment data - user stays on Deployment tab
   */
 onDeploymentFinished(deploymentData: any): void {
    console.log('🎯 Deployment form finished successfully:', deploymentData);
    
    // Set flag to true so deploy button on deployment tab can be used
    this.hasDeploymentFormData = true;
    
    // Extract and store deployment environment from the correct path
    this.deploymentEnvironment = deploymentData?.deployment_environment || '';
    console.log('🎯 Deployment environment:', this.deploymentEnvironment);
    
    // Trigger change detection to ensure the state is updated
    this.cdr.detectChanges();
    
    // Show success message - user stays on deployment tab
    this.service.message(
      'Deployment configuration saved successfully. You can now deploy using the Deploy button.',
      'success'
    );
  }

  /**
   * Check if deployment form data exists for the current agent
   */
  private checkDeploymentFormData(): void {
    if (!this.currentCname) {
      console.log('❌ Cannot check deployment form data: no cname available');
      this.hasDeploymentFormData = false;
      this.deploymentEnvironment = '';
      return;
    }

    const organization = this.getOrganization();
    console.log('🔍 Checking deployment form data for cname:', this.currentCname, 'org:', organization);
    console.log('🔍 API URL will be: /api/aip/deployment-form?cname=' + this.currentCname + '&org=' + organization);
    
    this.isCheckingDeploymentData = true;
    
    this.service.getDeploymentFormByCnameOrg(this.currentCname, organization).subscribe({
      next: (response) => {
        console.log('📦 Deployment form API response:', response);
        console.log('📦 Response type:', typeof response);
        console.log('📦 Is array:', Array.isArray(response));
        
        // More robust checking - if response exists and is not empty
        let hasData = false;
        let data = null;
        
        if (response) {
          if (Array.isArray(response)) {
            hasData = response.length > 0;
            data = response[0];
            console.log('📦 Array response with length:', response.length);
          } else if (typeof response === 'object') {
            hasData = Object.keys(response).length > 0;
            data = response;
            console.log('📦 Object response with keys:', Object.keys(response).length);
          }
        }
        
        console.log('📦 Has data:', hasData);
        
        if (hasData && data) {
          // Set flag to TRUE - button MUST show
          this.hasDeploymentFormData = true;
          
          // Try to extract deployment environment (optional)
          this.deploymentEnvironment = data.deployment_environment || '';
          
          console.log('✅ Deployment form data EXISTS - Deploy button WILL show');
          console.log('✅ Deployment environment extracted:', this.deploymentEnvironment || '(none - will show as "Deploy")');
          console.log('✅ hasDeploymentFormData flag set to:', this.hasDeploymentFormData);
        } else {
          this.hasDeploymentFormData = false;
          this.deploymentEnvironment = '';
          console.log('❌ No deployment form data found - Deploy button will NOT show');
        }
        
        this.isCheckingDeploymentData = false;
        
        // Force change detection to ensure UI updates
        this.cdr.detectChanges();
        console.log('🔄 Change detection triggered');
      },
      error: (error) => {
        console.error('❌ Error checking deployment form data:', error);
        console.error('❌ Error details:', error.message || error);
        this.hasDeploymentFormData = false;
        this.deploymentEnvironment = '';
        this.isCheckingDeploymentData = false;
      }
    });
  }

  // Automatically load agent data when viewing details
   private async autoLoadAgentData(): Promise<void> {
    if (!this.currentCname) {
      console.error('Cannot auto-load agent data: no cname available');
      this.showScriptTabOnly();
      return;
    }

    console.log('Auto-loading agent data for cname:', this.currentCname);
    this.isLoadingFiles = true;
    
    // Reset state first
    this.resetToInitialStateForNewAgent();
        // Fetch runner_service_status FIRST and WAIT for it
    await this.fetchRunnerServiceStatus();
    console.log('After autoLoadAgentData fetch, runnerServiceStatus is:', this.runnerServiceStatus);
    
    // THEN load JSON file from API for script tab (after reset)
    this.loadJsonFileForScript();

    // Only call folder list API to check existence
    this.agentPipelineService.getAgentFiles(this.currentCname).subscribe({
      next: (listResponse) => {
        console.log('Folder list API response:', listResponse);
        
        if (listResponse && listResponse.length > 0) {
          // Data exists, enable codespace tab and populate with response data
          this.enableCodespaceTabOnly(listResponse);
        } else {
          // No data from list API, show only script tab
          console.log('No data from folder list API, showing script tab only');
          this.showScriptTabOnly();
        }
        this.isLoadingFiles = false;
         // Trigger change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error calling folder list API:', error);
        // Check if error has the new format with details
        if (error?.error?.details) {
          this.service.message(error.error.details, 'error');
        } else if (error?.error?.message) {
          this.service.message(error.error.message, 'error');
        }
        // On error, show only script tab
        this.showScriptTabOnly();
        this.isLoadingFiles = false;
            // Trigger change detection
        this.cdr.detectChanges();
      }
    });
  }

  // Call the upload API to get full content
  // Auto-load agent data specifically for pipeline cards from dashboard
   private async autoLoadAgentDataForPipelineCard(): Promise<void> {
    if (!this.currentCname) {
      console.error('Cannot auto-load pipeline agent data: no cname available');
      this.showScriptTabOnly();
      return;
    }

    console.log('Auto-loading pipeline agent data for cname:', this.currentCname);
    this.isLoadingFiles = true;
    
    // CRITICAL: Load streaming service FIRST to check created_source for Builder tab visibility
    this.checkBuilderTabVisibility();
    
    // Reset state first
    this.resetToInitialStateForNewAgent();
      // Fetch runner_service_status FIRST and WAIT for it
    await this.fetchRunnerServiceStatus();
    console.log('After autoLoadAgentDataForPipelineCard fetch, runnerServiceStatus is:', this.runnerServiceStatus);
    
    // THEN load JSON file from API for script tab (after reset)
    this.loadJsonFileForScript();
    
    // Check if deployment form data exists for the Deploy button
    this.checkDeploymentFormData();

    // Call folder list API first - using the cname as both cname and filename for the API
    this.agentPipelineService.getAgentFiles(this.currentCname).subscribe({
      next: (listResponse) => {
        console.log('Pipeline folder list API response:', listResponse);
        
        if (listResponse && listResponse.length > 0) {
          // List API succeeded - enable codespace tab and populate with response data
          console.log('List API succeeded, enabling codespace tab for pipeline card');
          this.enableCodespaceTabOnly(listResponse);
          
          this.isLoadingFiles = false;

               
          // Trigger change detection
          this.cdr.detectChanges();
        } else {
          // No data from list API, show only script tab and continue with old flow
          console.log('No data from pipeline folder list API, falling back to script tab and old flow');
          this.showScriptTabOnly();
          this.isLoadingFiles = false;
          // Fall back to the original getStreamService flow
          this.getStreamService();

                  // Trigger change detection
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error calling pipeline folder list API:', error);
        // On error, show only script tab and fall back to old flow
        this.showScriptTabOnly();
        this.isLoadingFiles = false;
        this.getStreamService();
      }
    });
  }

  // Add flag to prevent multiple simultaneous API calls
  private isLoadingJsonFile = false;

  // Load JSON file from API for script tab - ALWAYS call read API first
  private loadJsonFileForScript(): void {
    // Prevent multiple simultaneous calls
    if (this.isLoadingJsonFile) {
      return;
    }

    let orgToUse = this.getConsistentOrganization();
    this.organisation = orgToUse;
    
    if (!this.currentCname || !orgToUse) {
      this.script = [];
      this.scriptFileName = '';
      this.loadScript = true;
      return;
    }

    // Create consistent filename using the same method as other API calls
    const jsonFileName = this.generateConsistentFilename();
    
    if (!this.currentCname || !orgToUse || !jsonFileName) {
      this.script = [];
      this.scriptFileName = jsonFileName || 'config.json';
      this.loadScript = true;
      return;
    }
    
    // Set loading flag to prevent multiple calls
    this.isLoadingJsonFile = true;
    
    console.log('🔍 Always calling read API first for script tab:', {
      endpoint: `${this.baseUrl}/api/aip/file/create/${this.currentCname}/${orgToUse}/json?file=${jsonFileName}`,
      cname: this.currentCname,
      organization: orgToUse,
      fileName: jsonFileName,
      mode: this.pipelineMode
    });
    
    // ALWAYS call read API first - show whatever comes from API
    this.service.readNativeFile(this.currentCname, orgToUse, jsonFileName).subscribe({
      next: (response) => {
        this.isLoadingJsonFile = false; // Clear loading flag
        
        try {
          let jsonString = '';
          if (response instanceof ArrayBuffer) {
            const decoder = new TextDecoder('utf-8');
            jsonString = decoder.decode(response);
          } else if (typeof response === 'string') {
            jsonString = response;
          } else {
            throw new Error('Invalid response format: ' + typeof response);
          }
          
          console.log('📋 API returned content:', {
            fileName: jsonFileName,
            contentLength: jsonString.length,
            hasContent: jsonString.trim().length > 0,
            contentPreview: jsonString.substring(0, 100) + '...'
          });
          
          // Always show what comes from API - even if empty or invalid
          this.script = jsonString.split('\n');
          this.scriptFileName = jsonFileName;
          this.loadScript = true;
          this.originalScriptContent = jsonString;
          this.isScriptModified = false;
          this.hasLoadedApiContent = true; // Mark that we successfully loaded API content
          
          // For MCP mode, set the JSON config from API data
          if (this.pipelineMode === 'mcp') {
            this.mcpJsonConfig = jsonString;
          }
          
          console.log('✅ Successfully loaded and displayed API content:', jsonFileName);
          
          if (this.cdr) {
            this.cdr.detectChanges();
          }
          
          if (this.pipelineMode === 'mcp') {
            setTimeout(() => {
              if (this.cdr) {
                this.cdr.markForCheck();
                this.cdr.detectChanges();
              }
            }, 100);
          }
        } catch (error) {
          console.error('Error processing API response:', error);
          // Even on error, show empty content from API instead of defaults
          this.script = [];
          this.scriptFileName = jsonFileName;
          this.loadScript = true;
          this.originalScriptContent = '';
          this.isScriptModified = false;
          
          if (this.pipelineMode === 'mcp') {
            this.mcpJsonConfig = '';
          }
          
          if (this.cdr) {
            this.cdr.detectChanges();
          }
        }
      },
      error: (error) => {
        this.isLoadingJsonFile = false; // Clear loading flag
        
        console.log('📄 Read API response (file not found):', {
          status: error.status,
          fileName: jsonFileName,
          message: 'File does not exist yet - showing empty content for viewing'
        });
        
        // For view details: show empty content when file doesn't exist
        // Default configs are ONLY used during new card creation flow
        this.script = [];
        this.scriptFileName = jsonFileName;
        this.loadScript = true;
        this.originalScriptContent = '';
        this.isScriptModified = false;
        
        if (this.pipelineMode === 'mcp') {
          this.mcpJsonConfig = '';
        }
        
        if (this.cdr) {
          this.cdr.detectChanges();
        }
        
        console.log('📝 Showing empty script content - file not found in API');
      }
    });
  }

  /**
   * Use default configuration ONLY for new card creation flow
   * This should NOT be called during view details navigation
   */
  private useDefaultConfigurationForNewCard(fileName: string, defaultConfig: any): void {
    console.log('🆕 Using default configuration for NEW CARD creation:', fileName);
    const configString = JSON.stringify(defaultConfig, null, 2);
    this.script = configString.split('\n');
    this.scriptFileName = fileName;
    this.loadScript = true;
    this.originalScriptContent = configString;
    this.isScriptModified = false;
    
    if (this.pipelineMode === 'mcp') {
      this.mcpJsonConfig = configString;
    }
    
    if (this.cdr) {
      this.cdr.detectChanges();
    }
    
    console.log('📝 Set default configuration for new card creation flow');
  }

  /**
   * Handle script content changes
   */
  onScriptContentChange(newContent: string): void {
    this.script = newContent.split('\n');
    
    // Always update both script and mcpJsonConfig to keep them in sync
    if (this.pipelineMode === 'mcp') {
      this.mcpJsonConfig = newContent;
    }
    
    // Update the modification flag
    this.isScriptModified = newContent !== this.originalScriptContent;
    
    console.log('Script content changed, isModified:', this.isScriptModified);
  }

  /**
   * Get script content as string for agent mode
   */
  getScriptAsString(): string {
    return this.script ? this.script.join('\n') : '';
  }

  /**
   * Get the JSON config that should be displayed - ALWAYS prioritizes API data
   * Empty content when no API data exists (for view details)
   */
  getDisplayedJsonConfig(): string {
    // If we have loaded API content, always use mcpJsonConfig
    if (this.hasLoadedApiContent && this.mcpJsonConfig && this.mcpJsonConfig.trim() !== '') {
      console.log('📖 Displaying API content from read call');
      return this.mcpJsonConfig;
    }
    
    // If mcpJsonConfig is set (user edited content), use that
    if (this.mcpJsonConfig && this.mcpJsonConfig.trim() !== '') {
      return this.mcpJsonConfig;
    }
    
    // For view details: show empty content when no API data exists
    // Default templates are ONLY used during new card creation
    console.log('📄 No API content found - showing empty content for view details');
    return '';
  }

  /**
   * Save script configuration to server
   */
  async saveScriptConfiguration(): Promise<void> {
    if (!this.isScriptModified) {
      return;
    }

    if (!this.streamItem) {
      try {
        await this.loadStreamItemForSave();
      } catch (error) {
        this.service.message('Unable to save: pipeline information not available', 'error');
        return;
      }
    }

    if (!this.streamItem) {
      this.service.message('Unable to save: pipeline information not available', 'error');
      return;
    }

    try {
      console.log('Saving script configuration for:', {
        cid: this.streamItem.cid,
        name: this.streamItem.name,
        mode: this.pipelineMode,
        organization: this.streamItem.organization
      });

      // Get current content
      const currentContent = this.pipelineMode === 'mcp' ? this.mcpJsonConfig : this.getScriptAsString();
      
      // Use consistent organization method
      const orgToUse = this.getConsistentOrganization();
      
      // Create the filename for the JSON content
      const fileName = this.pipelineMode === 'mcp' 
        ? `${this.currentCname}_${orgToUse}.json`
        : `${this.currentCname}_${orgToUse}.json`;

      console.log('💾 Save configuration details:', {
        cid: this.streamItem.cid,
        name: this.streamItem.name,
        mode: this.pipelineMode,
        orgToUse: orgToUse,
        fileName: fileName,
        contentLength: currentContent.length,
        contentPreview: currentContent.substring(0, 100) + '...'
      });

      // Preserve original json_content from API response (including created_source flag)
      let originalJsonContent = {};
      try {
        if (this.streamItem.json_content) {
          originalJsonContent = JSON.parse(this.streamItem.json_content);
          console.log('Preserved original json_content fields:', Object.keys(originalJsonContent));
        }
      } catch (e) {
        console.warn('Could not parse original json_content:', e);
      }

      // Prepare the update payload - preserve created_source if it exists
      const updatePayload = {
        lastmodifiedby: sessionStorage.getItem('username') || sessionStorage.getItem('user') || 'user',
        lastmodifieddate: new Date().toISOString().slice(0, 19).replace('T', ' '),
        alias: this.streamItem.alias,
        cid: this.streamItem.cid,
        name: this.streamItem.name,
        description: this.streamItem.description,
        json_content: JSON.stringify({
          ...originalJsonContent, // Preserve created_source and other original fields
          elements: [{
            attributes: {
              filetype: 'json',
              files: [fileName]
            }
          }]
        }),
        type: this.streamItem.type,
        organization: orgToUse,
        interfacetype: this.streamItem.interfacetype,
        is_template: this.streamItem.is_template || false
      };

      console.log('Update payload (with preserved created_source):', updatePayload);

      // First: Call the update API
      await this.updateStreamingService(updatePayload);
      
      // Second: Upload the JSON file using the create API
      await this.uploadJsonFile(currentContent, fileName);
      
      // Mark as saved
      this.originalScriptContent = currentContent;
      this.isScriptModified = false;
      
      // Show success message
      this.service.message(`${this.pipelineMode.toUpperCase()} configuration saved and file uploaded successfully!`, 'success');
      
      console.log('🎉 Configuration saved and uploaded successfully:', {
        fileName: fileName,
        organization: orgToUse,
        mode: this.pipelineMode,
        cid: this.streamItem.cid
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      this.service.message('Failed to save configuration. Please try again.', 'error');
    }
  }
  
  /**
   * Upload JSON file using the service's createNativeFile method
   */
  private async uploadJsonFile(content: string, fileName: string): Promise<any> {
    if (!this.streamItem) {
      throw new Error('StreamItem not available for file upload');
    }

    // Use consistent organization
    const orgToUse = this.getConsistentOrganization();
    
    // Ensure content is valid JSON string for JSON files
    let processedContent = content;
    try {
      // If content is not empty, validate it's proper JSON
      if (content && content.trim()) {
        // Try to parse and stringify to ensure valid JSON format
        const jsonObj = JSON.parse(content);
        processedContent = JSON.stringify(jsonObj, null, 2);
      } else {
        // If empty content, use empty JSON object
        processedContent = '{}';
      }
    } catch (jsonError) {
      console.warn('Content is not valid JSON, using as-is:', jsonError);
      // Use content as-is if it's not JSON
      processedContent = content || '{}';
    }
    
    console.log('📤 Uploading JSON file using service method (with form-data):', {
      cname: this.streamItem.name,
      organization: orgToUse,
      fileName: fileName,
      filetype: 'json',
      originalContentLength: content.length,
      processedContentLength: processedContent.length,
      contentPreview: processedContent.substring(0, 100) + '...'
    });


      // Get auth token to verify it exists
      const authToken = sessionStorage.getItem('access_token') || localStorage.getItem('access_token_lf');
      console.log('🔑 Auth token present for file upload:', !!authToken);


      // Use the corrected service method which now handles form-data properly
      const response = await this.service.createNativeFile(
        this.streamItem.name,  // cname
        orgToUse,             // org
        fileName,             // file
        'json',               // filetype
        processedContent      // script content
      ).toPromise();

      console.log('✅ JSON file uploaded successfully using service (form-data):', response);
      return response;
      
   
  }
  
  /**
   * Load streamItem if not available
   */
  private async loadStreamItemForSave(): Promise<void> {
    if (!this.currentCname) {
      throw new Error('No cname available');
    }
    
    return new Promise((resolve, reject) => {
      this.service.getStreamingServicesByName(this.currentCname).subscribe({
        next: (res) => {
          console.log('Loaded streamItem for save:', res);
          this.streamItem = res;
          resolve();
        },
        error: (error) => {
          console.error('Failed to load streamItem for save:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Update streaming service via API
   */
  private async updateStreamingService(payload: any): Promise<any> {
    const url = `${this.baseUrl}/service/v1/streamingServices/update`;
    
    // Get auth token from session/localStorage
    const authToken = sessionStorage.getItem('access_token') || localStorage.getItem('access_token_lf');
    
    const headers = {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'Origin': window.location.origin,
      'Project': sessionStorage.getItem('projectId') || '2',
      'ProjectName': sessionStorage.getItem('organization') || 'leo1311',
      'Referer': window.location.href,
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': navigator.userAgent,
      'X-Requested-With': 'Leap',
      'roleId': sessionStorage.getItem('roleId') || '1',
      'roleName': sessionStorage.getItem('roleName') || 'IT Portfolio Manager'
    };

    console.log('Making PUT request to:', url);
    console.log('Headers:', headers);
    console.log('Payload:', payload);

    try {
      const response = await this.http.put(url, payload, { headers }).toPromise();
      console.log('Update API response:', response);
      return response;
    } catch (error) {
      console.error('Update API error:', error);
      throw error;
    }
  }

  /**
   * Get default MCP configuration
   * ⚠️ ONLY use this for NEW CARD CREATION workflow, not for view details
   */
  private getDefaultMcpConfig(): any {
    return {
      "name": this.currentCname || "sample-mcp-server",
      "version": "1.0.0",
      "description": "MCP Server Configuration",
      "mcpServers": {
        [this.currentCname || "server"]: {
          "command": "python",
          "args": ["-m", "mcp_server"],
          "description": `MCP Server for ${this.currentCname}`,
          "version": "1.0.0",
          "tools": [],
          "resources": []
        }
      },
      "metadata": {
        "createdBy": "AIP MCP Pipeline Generator",
        "createdAt": new Date().toISOString(),
        "pipelineName": this.currentCname,
        "organization": this.organisation
      }
    };
  }

  /**
   * Initialize default configuration for NEW CARD creation workflow
   * This method should ONLY be called when creating a brand new card
   */
  private initializeDefaultConfigForNewCard(): void {
    if (!this.currentCname) {
      return;
    }
    
    const jsonFileName = this.generateConsistentFilename();
    let defaultConfig: any;
    
    if (this.pipelineMode === 'mcp') {
      defaultConfig = this.getDefaultMcpConfig();
    } else {
      defaultConfig = this.getDefaultAgentConfig();
    }
    
    this.useDefaultConfigurationForNewCard(jsonFileName, defaultConfig);
    
    console.log('🆕 Initialized default configuration for new card creation');
  }

  /**
   * Get default Agent configuration
   * ⚠️ ONLY use this for NEW CARD CREATION workflow, not for view details
   */
  private getDefaultAgentConfig(): any {
    return {
      "name": this.currentCname || "sample-agent",
      "version": "1.0.0",
      "description": "AI Agent Configuration",
      "agent": {
        "name": this.currentCname || "agent",
        "type": "AIAgent",
        "interface": "pipeline-agent",
        "model": {
          "provider": "openai",
          "model_name": "gpt-3.5-turbo",
          "temperature": 0.7,
          "max_tokens": 1000
        },
        "tools": [
          {
            "name": "sample_tool",
            "description": "A sample tool for the agent",
            "parameters": {
              "type": "object",
              "properties": {
                "input": {
                  "type": "string",
                  "description": "Input parameter for the tool"
                }
              },
              "required": ["input"]
            }
          }
        ],
        "memory": {
          "type": "conversation",
          "max_history": 10
        },
        "system_prompt": `You are ${this.currentCname || 'an AI agent'}, created to assist users with various tasks.`
      },
      "metadata": {
        "createdBy": "AIP Agent Pipeline Generator",
        "createdAt": new Date().toISOString(),
        "pipelineName": this.currentCname,
        "organization": this.organisation
      }
    };
  }

  // Call the upload API for pipeline cards
  /**
   * Component cleanup
   */
  ngOnDestroy(): void {
    // Remove event listener to prevent memory leaks
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    
    // Clean up WebSocket connection
    this.disconnectWebSocket();
  }
}