import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  HostListener,
  Input,
  Inject,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { Services } from '@essedum/shared-lib';
import {
  AgentPipelineService,
  FileNode as ServiceFileNode,
  AgentGenerationRequest,
  ICIPAiAgentScript,
} from './agent-pipeline.service';
import { AiChatCoderService, AiChatFile, AiChatPushState } from './ai-chat-coder.service';
import { Subscription } from 'rxjs';
import { StreamingServices } from '@essedum/shared-lib';
import { PipelineCreateComponent } from '../pipeline/pipeline-create/pipeline-create.component';
import {
  DynamicParamsGrid,
  DynamicSecretsGrid,
} from '../native-script/pipeline.models';
import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';

import { HttpClient, HttpParams } from '@angular/common/http';
import pipelineConfig from './pipeline-config.json';
import { OptionsDTO } from '@essedum/shared-lib';
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

// ─── AI Chat panel (VS Code Copilot-style) ────────────────────────────────
// Wired to the real Goose backend via AiChatCoderService — same endpoints as
// Vibe Studio for /agent/start, /reply (SSE), /agent/list-apps, /agent/call-tool
// and /sessions/{id}/push-to-github. The /sessions/{id}/preview call is NOT
// invoked automatically; the user triggers it via the "Deploy" button.
export interface AiChatSkill {
  value: string;
  label: string;
  icon: string;
  description: string;
}
export interface AiChatOption {
  value: string;
  label: string;
}
export interface AiChatEvent {
  text: string;
  pending?: boolean;
}
export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  skills?: AiChatSkill[];
  events?: AiChatEvent[];
  streaming?: boolean;
}

@Component({
    selector: 'app-agent-pipeline',
    templateUrl: './agent-pipeline.component.html',
    styleUrls: ['./agent-pipeline.component.scss'],
    standalone: false
})
export class AgentPipelineComponent implements OnInit, AfterViewInit, OnDestroy {
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
  dynamicSecretsArray: Array<DynamicSecretsGrid> = [];

  // Collapsible section state
  envCollapsed = true;
  secretsCollapsed = true;

  // Env-var inline edit state
  envEditIndex: number | null = null;
  envEditMode = false;

  // Secrets inline edit state
  secretsEditIndex: number | null = null;
  secretsEditMode = false;
  secretsShowValue: boolean[] = [];

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
    
    // Handle empty or undefined baseUrl - use window.location.origin as fallback
    if (!this.baseUrl || this.baseUrl.trim() === '') {
      const fallbackUrl = window.location.origin;
      console.warn('baseUrl is empty, using window.location.origin:', fallbackUrl);
      return fallbackUrl;
    }
    
    // Check if baseUrl is a relative URL (starts with /)
    let environmentUrl = this.baseUrl;
    if (this.baseUrl.startsWith('/')) {
      // Relative URL - prepend window.location.origin
      environmentUrl = window.location.origin + this.baseUrl;
    }
    
    // Remove '/api/aip' or '/api' suffix if present to get the base environment URL
    if (environmentUrl.endsWith('/api/aip')) {
      environmentUrl = environmentUrl.slice(0, -8); // Remove '/api/aip'
    } else if (environmentUrl.endsWith('/api')) {
      environmentUrl = environmentUrl.slice(0, -4); // Remove '/api'
    }
    
    // Final check - if empty after processing, use window.location.origin
    if (!environmentUrl || environmentUrl.trim() === '') {
      environmentUrl = window.location.origin;
      console.warn('Environment URL is empty after processing, using window.location.origin:', environmentUrl);
    }
    
    return environmentUrl;
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

  
  // Console output for Generate adk Agent
  consoleOutput: string[] = [];
  isGenerating = false;
  
  // WebSocket and Run/Deploy functionality
  private socket: Socket | null = null;
  private heartbeatInterval: any = null; // Track heartbeat interval for keep-alive
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
  
  // App Pipeline embedded viewer
  showAppViewer = false;
  appUrl = '';

  // ─── AI Chat Panel state (mockup) ────────────────────────────────────────
  @ViewChild('aiChatMessagesEl') aiChatMessagesEl?: ElementRef<HTMLDivElement>;
  @ViewChild('aiChatTextarea') aiChatTextareaEl?: ElementRef<HTMLTextAreaElement>;

  aiChatMessages: AiChatMessage[] = [];
  aiChatInput: string = '';
  aiChatStreaming: boolean = false;
  aiChatOpenMenu: 'skill' | 'model' | 'agent' | null = null;
  aiChatAttachedSkills: AiChatSkill[] = [];
  /**
   * Collapse toggle was removed — the AI chat panel is now always expanded so
   * we keep the flag as a constant `false` to avoid touching every template
   * binding at once. Do NOT reintroduce a setter for this.
   */
  aiChatCollapsed = false;
  private aiChatMockTimers: any[] = [];

  // ─── AI Chat coder service wiring ─────────────────────────────────────────
  /** Subscriptions to the AiChatCoderService streams — cleaned up in ngOnDestroy. */
  private aiChatSubs: Subscription[] = [];
  /** True once the current generation round has produced files → shows Deploy button. */
  aiChatDeployAvailable = false;
  /** Deployment lifecycle for the manual "Deploy" button. */
  aiChatDeployStatus: 'idle' | 'deploying' | 'success' | 'error' = 'idle';
  /** URL / result returned by /sessions/{id}/preview on success. */
  aiChatDeployedUrl: string | null = null;

  /**
   * Controls visibility of the entire AI chat panel (3rd grid column).
   * User can close it via the X button in the panel header; a "Open AI Chat"
   * pill appears above the codespace row to bring it back.
   * Persisted per browser so a closed panel stays closed across reloads.
   */
  aiChatVisible: boolean = (() => {
    try { return localStorage.getItem('essedum.aiChat.visible') !== '0'; } catch { return true; }
  })();

  // ─── GitHub push status (toast + expandable details panel) ────────────────
  /** Mirrors AiChatCoderService.pushStatus$ so the template can bind directly. */
  pushStatus: AiChatPushState = { phase: 'idle' };
  /** True when the user has expanded the details / edit-URL panel. */
  pushStatusPanelOpen = false;
  /** Working copy of the repo URL edited via the panel form. */
  pushStatusRepoUrlDraft = '';

  /**
   * Skill catalogue — hydrated on init from `/api/aip/skills?org=X&page=0&size=5`.
   * Starts empty; if the API returns nothing (or fails) the "Attach a skill"
   * menu shows "No skills available".
   */
  aiChatSkills: AiChatSkill[] = [];
  /** True while the skills API request is in flight. */
  aiChatSkillsLoading = false;

  /** Suggestion chips shown on the empty state. */
  readonly aiChatSuggestions: AiChatSkill[] = [
    { value: 'explain',   label: 'Explain this file',      icon: 'lightbulb',    description: '' },
    { value: 'gen-tests', label: 'Generate tests',         icon: 'science',      description: '' },
    { value: 'find-bugs', label: 'Find potential bugs',    icon: 'bug_report',   description: '' },
    { value: 'add-docs',  label: 'Add documentation',      icon: 'menu_book',    description: '' },
  ];

  /** Agent + model dropdowns — hydrated from the real API on init with a hardcoded fallback. */
  aiChatAgents: AiChatOption[] = [
    { label: 'Ollama',        value: 'ollama' },
    { label: 'Azure OpenAI',  value: 'azure_openai' },
    { label: 'Anthropic',     value: 'anthropic' },
  ];
  aiChatModels: AiChatOption[] = [
    { label: 'gpt-4o-mini',    value: 'gpt-4o-mini' },
    { label: 'gpt-4o',         value: 'gpt-4o' },
    { label: 'qwen3:4b',       value: 'qwen3:4b' },
    { label: 'qwen3.6:27b',    value: 'qwen3.6:27b' },
    { label: 'llama3:latest',  value: 'llama3:latest' },
    { label: 'gemma3:latest',  value: 'gemma3:latest' },
    { label: 'phi3:mini',      value: 'phi3:mini' },
    { label: 'claude-3.5-sonnet', value: 'claude-3-5-sonnet-20241022' },
  ];
  /**
   * Default agent + model are driven by the page origin (see
   * `applyOriginBasedDefaults()` — same logic as Vibe Studio). These initial
   * values are just a safe fallback until that method runs in ngOnInit.
   */
  aiChatSelectedAgent: string = 'ollama';
  aiChatSelectedModel: string = 'qwen3:4b';

  get aiChatSelectedAgentLabel(): string {
    return this.aiChatAgents.find(a => a.value === this.aiChatSelectedAgent)?.label
      ?? this.aiChatSelectedAgent ?? 'Select agent';
  }
  get aiChatSelectedModelLabel(): string {
    return this.aiChatModels.find(m => m.value === this.aiChatSelectedModel)?.label
      ?? this.aiChatSelectedModel ?? 'Select model';
  }
  appPort = ''; // Store app port from deployment

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
  isOpeningUploadDialog = false; // Tracks button loading state before dialog renders
  showUploadDialog = false;
  selectedZipFile: File | null = null;

  // MCP Pipeline Mode Support
  pipelineMode: 'agent' | 'mcp' | 'app' = 'agent';

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
    private http: HttpClient,
    private aiChatCoder: AiChatCoderService,
  ) {
    // Don't initialize mcpJsonConfig here - let it be set by API data loading
  }

  /**
   * Get pipeline type display name based on current mode
   */
  private getPipelineTypeName(): string {
    if (this.pipelineMode === 'mcp') {
      return 'MCP server';
    } else if (this.pipelineMode === 'app') {
      return 'app';
    } else {
      return 'agent';
    }
  }

  ngOnInit(): void {
    this.lastRefreshedTime = new Date();
    
    // Initialize organisation from localStorage or default
    this.organisation = this.getConsistentOrganization();
    
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
      if (this.pipelineMode === 'mcp') {
        this.cardTitle = 'MCP Pipelines';
      } else if (this.pipelineMode === 'app') {
        this.cardTitle = 'App Pipelines';
      } else {
        this.cardTitle = 'Agent Pipelines';
      }
      
      // DO NOT initialize MCP config here - let the API load the real data first
      // Default config will only be set if API call fails
    }
    
    if (cardFromState && cardFromState.name) {
      // This is a real pipeline card from dashboard - use its cname for auto-loading
      this.currentCname = cardFromState.name; // Use the card name as cname
      this.viewMode = 'detail';
      
      // Update filename if in MCP or App mode now that we have the actual cname
      if (this.pipelineMode === 'mcp' || this.pipelineMode === 'app') {
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
      
      // Also try using cardName as currentCname for the new APIs
      if (this.cardName) {
        this.currentCname = this.cardName;
        this.autoLoadAgentDataForPipelineCard();
      } else {
        this.getStreamService();
      }
    }
    
    this.getPipelineByName();

    // Pick default agent + model based on the page origin (localhost /
    // essedum-lfn → ollama+qwen; aipatform / azure origins → azure_openai+gpt).
    // Same logic Vibe Studio uses.
    this.applyOriginBasedDefaults();

    // Hydrate the AI Chat panel dropdowns (agent + model) from the real API,
    // silently falling back to the hardcoded lists on failure.
    this.loadAiChatProviders();

    // Load the skills catalogue from the platform skills API.
    this.loadAiChatSkills();

    // Bootstrap the AI chat coder service — subscribe to its streams so the
    // panel updates as Goose streams the reply and generates files.
    this.wireAiChatCoderService();

    // Add beforeunload protection for unsaved changes
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }
  
  /**
   * Handle browser navigation/refresh with unsaved changes
   */
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.isFileModified) {
      event.preventDefault();
      event.returnValue = 'You have unsaved changes in your files. Are you sure you want to leave?';
      return event.returnValue;
    }
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
    });
  }

  /**
   * Generate consistent filename for API calls
   */
  private generateConsistentFilename(): string {
    return `${this.currentCname}_${this.organisation}.json`;
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
      // Set cardTitle based on current pipeline mode
      if (this.pipelineMode === 'mcp') {
        this.cardTitle = 'MCP Pipelines';
      } else if (this.pipelineMode === 'app') {
        this.cardTitle = 'App Pipelines';
      } else {
        this.cardTitle = 'Agent Pipelines';
      }
      this.card = res[0];
      
      // Update filename if in MCP or App mode with actual pipeline data
      if ((this.pipelineMode === 'mcp' || this.pipelineMode === 'app') && res && res[0]) {
        const actualName = res[0].name || this.cardName || 'config';
        this.scriptFileName = `${actualName}.json`;
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
      this.readFile(cleanedResponse);
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
    // Ensure we use the consistent filename for the current card
    const expectedFilename = this.generateConsistentFilename();
    if (filename !== expectedFilename) {
      filename = expectedFilename;
    }

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
          try{
            const textDecoder = new TextDecoder('utf-8');
            this.script = textDecoder.decode(resp).split('\n');
            this.loadScript = true;

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
        },
      });
  }

  buildFileStructure() {
    this.fileStructure = [];

    if (this.streamItem && this.streamItem.json_content) {
      try {
        const jsonContent = JSON.parse(this.streamItem.json_content);
        const files = jsonContent.elements[0]?.attributes?.files;

        if (files && Array.isArray(files) && files.length > 0) {
          // Process each file entry in the files array
          files.forEach((fileEntry: any, index: number) => {
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
                }
              } else if (fileEntry.includes(',')) {
                // Handle comma-separated without brackets
                fileNames = fileEntry
                  .split(',')
                  .map((f) => f.trim())
                  .filter((f) => f.length > 0);
              } else {
                // Single file name
                fileNames = [fileEntry.trim()];
              }
            } else if (Array.isArray(fileEntry)) {
              // Handle direct array entries
              fileNames = fileEntry.filter(
                (name) => typeof name === 'string' && name.trim().length > 0
              );
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
                  }
                } else {
                }
              }
            });          });

          // Auto-select the first Python file with a delay to ensure backend is ready
          if (this.fileStructure.length > 0) {
            const firstPyFile = this.fileStructure.find(
              (file) => file.extension === 'py'
            );
            if (firstPyFile) {

              // Mark as selected immediately for UI
              this.fileStructure.forEach((file) => (file.selected = false));
              firstPyFile.selected = true;
              this.selectedFileNode = firstPyFile; // Ensure selectedFileNode is set

              // If we already have script content, don't reload
              if (this.script && this.script.length > 0) {
                this.loadScript = true;
                this.cdr.detectChanges();
              } else {
                // Add delay before reading file to ensure it's available on the server
                setTimeout(() => {
                  this.readFile(firstPyFile.name); // readFile now handles cleaning internally
                }, 1000);
              }
            } else {
              // If no Python file found, just set loadScript to true for empty editor
              this.loadScript = true;
              this.selectedFileNode = null;
            }
          } else {
            // No files found, show empty editor
            this.loadScript = true;
          }
        } else {
          this.loadScript = true;
        }
      } catch (error) {
        console.error('Error parsing json_content:', error);
        this.loadScript = true;
      }
    } else {
      this.loadScript = true;
    }

    this.fileTreeDataSource.data = this.fileStructure;

    // Trigger change detection
    this.cdr.detectChanges();
  }

  navigateBack(): void {
    
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
    this.showAppViewer = false; // Hide app viewer
    this.appUrl = ''; // Clear app URL
    this.clearFileSelection();
  }

  onSearch(searchTerm: string): void {
    // TODO: Implement search functionality
  }

  onRefresh(): void {
    this.lastRefreshedTime = new Date();
    // TODO: Implement refresh functionality
  }

  onAdd(): void {
    
    if (this.pipelineMode === 'mcp') {
      
      // Open the pipeline creation dialog with MCP-specific parameters
      const dialogRef = this.dialog.open(PipelineCreateComponent, {
        width: '460px',
        maxWidth: '92vw',
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
          this.service.message('MCP Pipelines created successfully!', 'success');
          // Navigate back to dashboard to see the new pipeline
          this.navigateBack();
        }
      });
    } else if (this.pipelineMode === 'app') {
      
      // Open the pipeline creation dialog with App-specific parameters
      const dialogRef = this.dialog.open(PipelineCreateComponent, {
        width: '460px',
        maxWidth: '92vw',
        disableClose: true,
        data: {
          interfacetype: 'app-pipeline', // App-specific interface type
          type: 'appPipeline', // App-specific type
          mode: 'create'
        }
      });
      
      // Handle dialog result
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.service.message('App Pipelines created successfully!', 'success');
          // Navigate back to dashboard to see the new pipeline
          this.navigateBack();
        }
      });
    } else {
      
      // Open the pipeline creation dialog with Agent-specific parameters
      const dialogRef = this.dialog.open(PipelineCreateComponent, {
        width: '460px',
        maxWidth: '92vw',
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
          this.service.message('Agent Pipelines created successfully!', 'success');
          // Navigate back to dashboard to see the new pipeline
          this.navigateBack();
        }
      });
    }
  }

  onTagSelected(tags: any): void {
    this.tagrefresh = !this.tagrefresh;
    // TODO: Implement tag filtering
  }

  onFilterStatusChange(filters: any): void {
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
    } else {
      // Use fixed cname for other agents
      this.currentCname = agent.cname;
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
      return;
    }

    if (this.isSavingFile) {
      return;
    }

    this.showDeleteDialog = true;
  }

  // Delete current file
  async deleteFile(): Promise<void> {
    if (!this.selectedFileNode || !this.currentCname) {
      return;
    }

    this.isSavingFile = true; // Reuse the saving flag for UI state
    try {

      // Call the delete API with just the file ID
      const result = await this.agentPipelineService
        .deleteFile(this.selectedFileId)
        .toPromise();

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

  loadAgentFiles(): void {
    if (!this.currentCname) {
      console.warn('No container name available for loading files');
      return;
    }

    this.isLoadingFiles = true;

    // Use the same API - the backend will handle the type differentiation
    this.agentPipelineService.getAgentFiles(this.currentCname).subscribe({
      next: (apiResponse) => {
        
        if (apiResponse && Array.isArray(apiResponse) && apiResponse.length > 0) {
          // Files found - enable codespace tab
          this.fileSystemData = this.agentPipelineService.buildFileTreeFromApiResponse(apiResponse);
          this.expandAllFolders(this.fileSystemData);
          
          // Update state to show files exist
          this.hasGeneratedAgent = true;
          this.isJsonProcessed = true;
          
        } else {
          // No files found
          this.fileSystemData = [];
          this.hasGeneratedAgent = false;
          this.isJsonProcessed = false;
          
          // Show warning message
          const warningResponse = {
            status: 'warning',
            message: `No ${this.getPipelineTypeName()} files found`
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
        console.warn(`Failed to load ${this.getPipelineTypeName()} files: ${error.message || 'Unknown error'}`);
      },
    });
  }
  
  // Refresh file structure - can be called manually or after operations
  refreshFileStructure(): void {
    if (!this.currentCname) {
      console.warn('No container name available for refreshing files');
      return;
    }
    
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

  onTabChange(event: any): void {
  }

  onJsonChange(event: any): void {
    // Handle JSON content changes from API data only
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

    // Store the previous content for comparison
    const previousContent = this.selectedFileContent;

    // Update the content
    this.selectedFileContent = newContent;

    // Check if this represents a real change from the original
    const hasChangesFromOriginal =
      this.selectedFileContent !== this.originalFileContent;
    const hasChangesFromPrevious = this.selectedFileContent !== previousContent;


    if (hasChangesFromOriginal) {
      this.isFileModified = true;
      // Don't set isUserModifiedContent to prevent textarea styling
      this.updateDiffTracking(newContent);
      this.trackUserModifiedLines();
      this.updateTotalLineCount();

    } else {
      // Reset flags if content matches original
      this.isFileModified = false;
      this.userModifiedLines.clear();

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
          // You can add a snackbar notification here
        })
        .catch((err) => {
          console.error('Failed to copy content: ', err);
        });
    }
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
    console.log('File selected:', node.name, 'Content length:', this.selectedFileContent.length, 'Has content:', !!node.content);
    this.originalFileContent = this.selectedFileContent; // Store original content
    this.isUserModifiedContent = false; // Reset user modification flag
    this.userModifiedLines.clear(); // Clear user modified lines
    this.resetDiffTracking(); // Reset diff tracking

    // Initialize virtual scrolling
    this.currentLineOffset = 0;
    this.updateTotalLineCount();
    setTimeout(() => this.initializeVirtualScrolling(), 100);

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
    try {
      
      const environmentUrl = this.getEnvironmentUrl();
      
      this.socket = io(environmentUrl, {
        path: '/apps/builder-service/socket.io',
        transports: ['websocket', 'polling'],
        timeout: 600000,               // 10 minute initial connection timeout
        forceNew: true,
        rejectUnauthorized: false,
        withCredentials: true,
        reconnection: true,            // Enable auto-reconnection to recover from timeouts
        reconnectionAttempts: 50,      // Try many times (50 attempts)
        reconnectionDelay: 2000,       // Wait 2 seconds between attempts
        reconnectionDelayMax: 10000    // Max 10 seconds between attempts
      });
      
      
      // Connection successful
      this.socket.on('connect', () => {
        
        // Don't use custom heartbeat - Socket.IO handles ping/pong internally
        
        // Use the same deployment name as used in deployment
        const deploymentName = this.currentDeploymentName || this.pipelineAlias?.toString() || 'DEFAULT-AGENT';
        
        const deletePayload = {
          deployment_name: deploymentName,
          namespace: this.getTargetNamespace()
        };
        
        this.addToConsole(`Deleting deployment: ${deploymentName} from namespace: ${this.getTargetNamespace()}`);
        this.socket?.emit('delete_deployment', deletePayload);
      });
      
      // Delete status event
      this.socket.on('delete_status', (data: any) => {
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
        console.error('WebSocket connect_error event (deletion):', error);
        console.error('Error details:', {
          message: error.message,
          type: error.type,
          description: error.description
        });
        this.addToConsole(`Connection error: ${error.message}`);
      });
      
      // Connection timeout
      this.socket.on('connect_timeout', (timeout: any) => {
        console.error('WebSocket connect_timeout event (deletion):', timeout);
        this.addToConsole(`Connection timeout after ${timeout}ms`);
      });
      
      // Error event
      this.socket.on('error', (error: any) => {
        console.error('WebSocket error event (deletion):', error);
        this.addToConsole(`Error: ${error}`);
      });
      
      // Disconnection
      this.socket.on('disconnect', (reason: string) => {
        this.addToConsole(`Disconnected: ${reason}`);
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
    
    // Hide app viewer during deployment (for app pipeline)
    if (this.pipelineMode === 'app') {
      this.showAppViewer = false;
    }
    
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
    
    
    // Call the MinIO upload API first
    this.agentPipelineService.uploadToMinio(this.currentCname, organization).subscribe({
      next: (response) => {
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

        // Check if this is actually a success (status 200-299 OR statusText contains "OK")
        // Backend logs show success but Angular might misinterpret the response
        const isActualSuccess = 
          (error.status >= 200 && error.status < 300) || 
          error.statusText?.toLowerCase().includes('ok') ||
          (error.status === 200 && error.name === 'HttpErrorResponse') ||
          error.message?.includes('parsing');

        if (isActualSuccess) {
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
    try {
      // Connect to the WebSocket server
      //  const webSocketUrl = 'http://100.78.49.149/';
       // this.socket = io(webSocketUrl, {
//	  transports: ['websocket'],
  //        timeout: 20000,
    //      forceNew: true
     //   });
	  
	const environmentUrl = this.getEnvironmentUrl();
	
	// Bulletproof method to ensure HTTPS protocol (not WSS)
	// Allow websocket transport but force HTTP protocol to prevent wss:// conversion
		  
	this.socket = io(environmentUrl, {
	  path: '/apps/builder-service/socket.io',
	  transports: ['websocket','polling'],
	  timeout: 600000,               // 10 minute initial connection timeout
	  forceNew: true,
	  rejectUnauthorized: false,
	  withCredentials: true,
	  reconnection: true,            // Enable auto-reconnection to recover from timeouts
	  reconnectionAttempts: 50,      // Try many times (50 attempts)
	  reconnectionDelay: 2000,       // Wait 2 seconds between attempts
	  reconnectionDelayMax: 10000    // Max 10 seconds between attempts
	});
	
	  
        // Connection successful
        this.socket.on('connect', () => {
          
          // Don't use custom heartbeat - Socket.IO handles ping/pong internally
          // this.startHeartbeat(); // REMOVED - causes issues
          
          // First fetch the streaming service to get the alias for deployment_name
          const organization = this.getOrganization();
          const streamingServiceUrl = this.baseUrl + `/service/v1/streamingServices/${this.currentCname}/${organization}`;
          
          this.addToConsole(`Fetching deployment configuration...`);
          
          this.http.get<any>(streamingServiceUrl).toPromise().then((streamingResponse) => {
            
            // CRITICAL: Update selectedAgent with alias from streaming service API response
            if (streamingResponse && streamingResponse.alias) {
              if (!this.selectedAgent) {
                this.selectedAgent = {} as AgentCard;
              }
              this.selectedAgent.alias = streamingResponse.alias;
              this.selectedAgent.cname = streamingResponse.name || this.currentCname;
            }
            // Use alias from selected card (uppercase)
            const deploymentAlias = (this.pipelineAlias ? this.pipelineAlias.toString() : 'DEFAULT-AGENT').toLowerCase();
            this.currentDeploymentName = deploymentAlias; // Store for use in playground URL
            
 // Now prepare payload with deployment_name from alias
            const apiParams = this.getApiParametersForMode();
            
            // Generate dynamic target_image_tag from config
            const targetImageTag = `${pipelineConfig.containerRegistry.registryPrefix}${deploymentAlias}:${pipelineConfig.containerRegistry.imageVersion}`;
            
            // Determine deployment name based on pipeline mode
            // const deploymentName = this.pipelineMode === 'mcp' 
            //   ? 'service-qualification-mcp-5g' 
            //   : 'service-qualification-agent-5g';
            
            const payload = {
              minio_endpoint: pipelineConfig.minio.endpoint,
              bucket_name: pipelineConfig.minio.bucketName,
              file_path: `ai-agent-scripts/${this.currentCname}/${organization}/${this.currentCname}-${organization}.zip`,
              target_image_tag: targetImageTag,
              deployment_name: deploymentAlias, // Dynamic value from API
              cname: this.currentCname,
              organization: organization,
              type: apiParams.type,
              interface: apiParams.interface,
              namespace: this.getTargetNamespace(),
              env_vars: this.dynamicEnvArray || [],
              secrets: this.dynamicSecretsArray || []
            };
           
            this.addToConsole(`Starting ${this.getPipelineTypeName()} pipeline with deployment: ${deploymentAlias}`);
            this.addToConsole(`Pipeline type: ${payload.type}, interface: ${payload.interface}`);
            this.socket?.emit('start_pipeline', payload);
          }).catch((error) => {
            console.error('  ERROR: Failed to fetch streaming service alias:', error);
            this.addToConsole(`Error fetching deployment configuration: ${error.message || error}`);
            
            // Use alias from selected card (uppercase)
            const apiParams = this.getApiParametersForMode();
            const fallbackDeploymentName = (this.pipelineAlias ? this.pipelineAlias.toString() : 'DEFAULT-AGENT').toLowerCase();
            this.currentDeploymentName = fallbackDeploymentName; // Store for use in playground URL
            
            // Generate dynamic target_image_tag from config for fallback
            const fallbackTargetImageTag = `${pipelineConfig.containerRegistry.registryPrefix}${fallbackDeploymentName}:${pipelineConfig.containerRegistry.imageVersion}`;
            
            const fallbackPayload = {
              minio_endpoint: pipelineConfig.minio.endpoint,
              bucket_name: pipelineConfig.minio.bucketName,
              file_path: `ai-agent-scripts/${this.currentCname}/${organization}/${this.currentCname}-${organization}.zip`,
              target_image_tag: fallbackTargetImageTag,
              deployment_name: fallbackDeploymentName, // mode-specific fallback
              cname: this.currentCname,
              organization: organization,
              type: apiParams.type,
              interface: apiParams.interface,
              namespace: this.getTargetNamespace(),
              env_vars: this.dynamicEnvArray || [],
              secrets: this.dynamicSecretsArray || []
            };
            
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
 
        // Reconnecting event
        this.socket.on('reconnect_attempt', (attemptNumber: number) => {
          this.addToConsole(`Reconnecting... Attempt ${attemptNumber}`);
        });
        
        // Successfully reconnected
        this.socket.on('reconnect', (attemptNumber: number) => {
          this.addToConsole(`✓ Reconnected successfully`);
        });
        
        // Failed to reconnect after all attempts
        this.socket.on('reconnect_failed', () => {
          console.error('Failed to reconnect after all attempts');
          this.addToConsole('✗ Connection failed after multiple attempts');
          if (this.isRunningAndDeploying) {
            this.deploymentStatus = 'error';
            this.deploymentStatusMessage = 'Connection lost. Playground is disabled.';
            this.isPlaygroundEnabled = false;
            this.isRunningAndDeploying = false;
          }
        });
        
        // Reconnecting event
        this.socket.on('reconnect_attempt', (attemptNumber: number) => {
          this.addToConsole(`Reconnecting... Attempt ${attemptNumber}`);
        });
        
        // Successfully reconnected  
        this.socket.on('reconnect', (attemptNumber: number) => {
          this.addToConsole(`✓ Reconnected successfully`);
        });
        
        // Failed to reconnect after all attempts
        this.socket.on('reconnect_failed', () => {
          console.error('Failed to reconnect after all attempts');
          this.addToConsole('✗ Connection failed after multiple attempts');
          if (this.isRunningAndDeploying) {
            this.deploymentStatus = 'error';
            this.deploymentStatusMessage = 'Connection lost. Playground is disabled.';
            this.isPlaygroundEnabled = false;
            this.isRunningAndDeploying = false;
          }
        });
        
        // Connection error
        this.socket.on('connect_error', (error: any) => {
          console.error('WebSocket connect_error event:', error);
          console.error('Error details:', {
            message: error.message,
            type: error.type,
            description: error.description
          });
          this.addToConsole(`Connection error: ${error.message}`);
        });
        
        // Connection timeout
        this.socket.on('connect_timeout', (timeout: any) => {
          console.error('WebSocket connect_timeout event:', timeout);
          this.addToConsole(`Connection timeout after ${timeout}ms`);
        });
        
        // Error event
        this.socket.on('error', (error: any) => {
          console.error('WebSocket error event:', error);
          this.addToConsole(`Error: ${error}`);
        });

        // Disconnection
        this.socket.on('disconnect', (reason: string) => {
          this.addToConsole(`Disconnected: ${reason}`);
          // Don't stop heartbeat as we removed it
          // Let reconnection handle it automatically
        });
 
    } catch (error) {
      this.addToConsole(`Failed to initialize WebSocket: ${error}`);
      this.deploymentStatus = 'error';
      this.isRunningAndDeploying = false;
    }
  }

  /**
   * Start heartbeat to keep WebSocket connection alive
   */
  private startHeartbeat(): void {
    // Clear any existing heartbeat
    this.stopHeartbeat();
    
    
    // Send heartbeat every 20 seconds to keep connection alive
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('ping', { timestamp: Date.now() });
      } else {
        console.warn('WebSocket not connected, stopping heartbeat');
        this.stopHeartbeat();
      }
    }, 20000); // Send heartbeat every 20 seconds
  }

  /**
   * Stop heartbeat interval
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Disconnect WebSocket connection
   */
  private disconnectWebSocket(): void {
    // No heartbeat to stop since we removed it
    // this.stopHeartbeat(); // REMOVED
    
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
      
      this.addToConsole('Updating streaming services with playground URL...');
      
      // Step 1: GET the current streaming services data
      const getResponse = await this.http.get<any>(streamingServicesUrl).toPromise();
      
      if (getResponse && getResponse.json_content) {
        // Step 2: Parse the existing json_content
        let jsonContent = JSON.parse(getResponse.json_content);
        
           // Step 3: Add/update the playgroundUrl and runner_service_status
        const environmentUrl = this.getEnvironmentUrl();
        const deploymentAlias = this.pipelineAlias ? this.pipelineAlias.toString() : 'DEFAULT-AGENT';
        jsonContent.playgroundurl = `${environmentUrl}/apps/${deploymentAlias}/ask`;
        jsonContent.runner_service_status = true;
        
        // Step 4: Prepare the PUT payload with updated json_content
        const putPayload = {
          ...getResponse,
          json_content: JSON.stringify(jsonContent)
        };
        
        
         // Step 5: PUT the updated data back using the update endpoint
        const updateUrl = this.baseUrl + '/service/v1/streamingServices/update';
        const putResponse = await this.http.put<any>(updateUrl, putPayload).toPromise();
        
        this.addToConsole('Streaming services updated successfully with playground URL!');
         // Update local runner_service_status
        this.runnerServiceStatus = true;
      } else {
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
    
    
    // Call the API - Handle parsing errors and different response types properly
    this.agentPipelineService.uploadToMinio(this.currentCname, organization).subscribe({
      next: (response) => {
        
        // Always show success message for 200 status - API returned success
        const successResponse = { status: 200, body: response || 'Success' };
        this.service.messageService(successResponse, 'Push to MinIO completed successfully!');
      },
      error: (error) => {
        console.error('MinIO push error received:', error);
        
        // Check if this is actually a success (status 200-299 OR statusText contains "OK")
        // Backend logs show success but Angular might misinterpret the response
        const isActualSuccess = 
          (error.status >= 200 && error.status < 300) || 
          error.statusText?.toLowerCase().includes('ok') ||
          (error.status === 200 && error.name === 'HttpErrorResponse') ||
          error.message?.includes('parsing');
        
        if (isActualSuccess) {
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
   * Open file upload dialog for agent files.
   * Sets a loading flag immediately so the button shows a spinner,
   * then defers the actual dialog open by one animation frame so Angular
   * can paint the button state before the heavier dialog is rendered.
   */
  openUploadDialog(): void {
    this.isOpeningUploadDialog = true;
    this.selectedZipFile = null;
    // Let Angular render the button spinner, then open the dialog
    setTimeout(() => {
      this.showUploadDialog = true;
      this.isOpeningUploadDialog = false;
      this.cdr.detectChanges();
    }, 0);
  }

  /**
   * Close upload dialog and reset state
   */
  closeUploadDialog(): void {
    this.showUploadDialog = false;
    this.isOpeningUploadDialog = false;
    this.selectedZipFile = null;
  }

  /**
   * Handle file selection in upload dialog
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.zip')) {
      this.selectedZipFile = file;
    } else {
      this.service.message('Please select a valid ZIP file', 'error');
      this.selectedZipFile = null;
    }
  }

  /**
   * Handle ZIP file created from GitHub pull
   */
  onGitHubPullZipCreated(zipFile: File): void {
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

// Call the upload API with type param: Agent | MCP | App
    const uploadType = this.pipelineMode === 'mcp' ? 'MCP' : this.pipelineMode === 'app' ? 'Application' : 'Agent';
    this.agentPipelineService.uploadAgentFilesZip(this.currentCname, organization, this.selectedZipFile, uploadType).subscribe({
         next: (response) => {
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
    } else if (this.pipelineMode === 'app') {
      return {
        type: 'appPipeline',
        interface: 'app-pipeline'
      };
    } else {
      return {
        type: 'AIAgent',
        interface: 'pipeline-agent'
      };
    }
  }

  /**
   * Get the target Kubernetes namespace based on pipeline mode.
   * Agents → vibe-agents, MCP servers → vibe-mcp, Apps → vibe-apps.
   */
  private getTargetNamespace(): string {
    if (this.pipelineMode === 'mcp') {
      return 'vibe-mcp';
    } else if (this.pipelineMode === 'app') {
      return 'vibe-apps';
    } else {
      return 'vibe-agents';
    }
  }

  /**
   * Derive pipelineMode from the StreamingServices interfacetype field.
   * This is the authoritative source of truth stored in the database:
   *   pipeline-agent  → agent
   *   mcp-pipeline    → mcp
   *   app-pipeline    → app
   */
  private modeFromInterfaceType(interfacetype: string): 'agent' | 'mcp' | 'app' {
    if (interfacetype === 'mcp-pipeline') return 'mcp';
    if (interfacetype === 'app-pipeline') return 'app';
    return 'agent';
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
      
      const response = await this.http.get<any>(streamingServicesUrl).toPromise();
      
      
      if (response && response.json_content) {
        const jsonContent = JSON.parse(response.json_content);

        // Use interfacetype from the API as the authoritative source for pipelineMode.
        // This corrects any stale router-state default (e.g. page refresh, direct URL).
        if (response.interfacetype) {
          const derivedMode = this.modeFromInterfaceType(response.interfacetype);
          if (derivedMode !== this.pipelineMode) {
            this.pipelineMode = derivedMode;
            if (this.pipelineMode === 'mcp') {
              this.cardTitle = 'MCP Pipelines';
            } else if (this.pipelineMode === 'app') {
              this.cardTitle = 'App Pipelines';
            } else {
              this.cardTitle = 'Agent Pipelines';
            }
          }
        }

        this.runnerServiceStatus = jsonContent.runner_service_status === true;
        this.isPlaygroundEnabled = this.runnerServiceStatus;

        // Restore env vars from jsonContent.environment
        const envData = jsonContent.environment;
        if (Array.isArray(envData)) {
          this.dynamicEnvArray = envData;
        }

        // Restore secrets from jsonContent.elements[0].attributes.usedSecrets
        const secretData = jsonContent.elements?.[0]?.attributes?.usedSecrets;
        if (Array.isArray(secretData)) {
          this.dynamicSecretsArray = secretData;
          this.secretsShowValue = secretData.map(() => false);
        }

        // Auto-expand if data exists, collapse if empty
        this.envCollapsed = this.dynamicEnvArray.length === 0;
        this.secretsCollapsed = this.dynamicSecretsArray.length === 0;

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
    // TODO: Implement edit functionality
  }

  deleteAgent(agent: AgentCard): void {
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
    // For App Pipeline, allow opening anytime (no deployment check)
    if (this.pipelineMode === 'app') {
      // Clear deployment status message when launching app
      this.deploymentStatusMessage = '';
      
      this.fetchAppUrl().then(() => {
        this.showAppViewer = true;
        // Don't add to console since it will be hidden
      }).catch((error) => {
        console.error('Failed to fetch app URL:', error);
        // Show a friendly message if app is not deployed yet
        this.service.message('App is not deployed yet. Please deploy the app first.', 'warning');
      });
      return;
    }
    
    // For agent mode, check if playground is enabled
    if (!this.canOpenPlayground()) {
      return;
    }
    
    // For agent mode, show playground popup as before
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
      
      if (!this.currentCname) {
        throw new Error('No agent selected - currentCname is empty');
      }
      
      const organization = this.getOrganization();
      const apiUrl = this.baseUrl + `/service/v1/streamingServices/${this.currentCname}/${organization}`;
      
      
      const response = await this.http.get<any>(apiUrl).toPromise();
      
      if (response && response.json_content) {
        const jsonContent = JSON.parse(response.json_content);
        
        if (jsonContent.playgroundurl) {
          this.playgroundUrl = jsonContent.playgroundurl;
        } else {
          const environmentUrl = this.getEnvironmentUrl();
          const deploymentName = this.currentDeploymentName; // Use stored deployment name
          this.playgroundUrl = `${environmentUrl}/apps/${deploymentName}/ask`;
        }
      } else {
        const environmentUrl = this.getEnvironmentUrl();
        const deploymentName = this.currentDeploymentName; // Use stored deployment name
        this.playgroundUrl = `${environmentUrl}/apps/${deploymentName}/ask`;
      }
    } catch (error) {
      console.error('Error fetching playground URL:', error);
      // Don't generate URL without proper data - selectedAgent might not be populated
      throw error;
    }
  }

  /**
   * Fetch app URL from streaming services API for App Pipeline
   */
  private async fetchAppUrl(): Promise<void> {
    try {
      if (!this.currentCname) {
        throw new Error('No app selected - currentCname is empty');
      }
      
      const organization = this.getOrganization();
      const apiUrl = this.baseUrl + `/service/v1/streamingServices/${this.currentCname}/${organization}`;
      
      const response = await this.http.get<any>(apiUrl).toPromise();
      
      if (response && response.json_content) {
        const jsonContent = JSON.parse(response.json_content);
        
        // Check if app URL is stored in json_content
        if (jsonContent.appUrl) {
          this.appUrl = jsonContent.appUrl;
        } else if (jsonContent.port) {
          // Build URL from host + port
          const environmentUrl = this.getEnvironmentUrl();
          const host = new URL(environmentUrl).hostname;
          this.appUrl = `http://${host}:${jsonContent.port}`;
        } else {
          // Fallback: use deployment name
          const environmentUrl = this.getEnvironmentUrl();
          const deploymentName = this.currentDeploymentName;
          this.appUrl = `${environmentUrl}/apps/${deploymentName}`;
        }
      } else {
        throw new Error('No app configuration found');
      }
    } catch (error) {
      console.error('Error fetching app URL:', error);
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

  // ═════════════════════════════════════════════════════════════════════════
  //  AI CHAT PANEL METHODS (mockup — replace with real API integration later)
  // ═════════════════════════════════════════════════════════════════════════

  /** trackBy for the message *ngFor to avoid re-rendering the whole list */
  trackAiMsg = (_i: number, msg: AiChatMessage) => msg.id;

  /**
   * Determines the default provider + model from the page origin (identical
   * to Vibe Studio's rules):
   *   • localhost / essedum-lfn.infosys.com → ollama + qwen3:4b
   *   • Azure / aipatform (AKS) origins    → azure_openai + gpt-4o-mini
   *   • anything else                      → ollama + qwen3:4b (safe fallback)
   * Only used to seed the initial selection — the user can still switch
   * via the pill dropdowns.
   */
  private applyOriginBasedDefaults(): void {
    const hostname = (typeof window !== 'undefined' && window.location.hostname) || '';
    if (hostname.includes('aipatform') ||
        hostname === 'essedum.az.ad.idemo-ppc.com' ||
        hostname.includes('azure')) {
      this.aiChatSelectedAgent = 'azure_openai';
      this.aiChatSelectedModel = 'gpt-4o-mini';
    } else if (hostname === 'localhost' ||
               hostname === 'essedum-lfn.infosys.com') {
      this.aiChatSelectedAgent = 'ollama';
      this.aiChatSelectedModel = 'qwen3:4b';
    } else {
      // Safe fallback for any unrecognised hostname.
      this.aiChatSelectedAgent = 'ollama';
      this.aiChatSelectedModel = 'qwen3:4b';
    }
  }

  /**
   * Loads the real agent providers + models from the same endpoint Vibe Studio
   * uses. Silently keeps the hardcoded fallback on failure.
   */
  private loadAiChatProviders(): void {
    const base = (this.baseUrl && this.baseUrl.trim()) ? this.baseUrl : window.location.origin;
    const url = `${base}/service/v1/vibe-coding/config/providers`;
    this.http.get<any>(url).subscribe({
      next: (res) => this.applyProvidersResponse(res),
      error: () => { /* keep hardcoded fallback silently */ },
    });
  }

  /**
   * Fetches the skills catalogue from /api/aip/skills for the current org.
   * Maps each row into the {value,label,icon,description} shape the "Attach
   * a skill" dropdown expects. Falls back to an empty list (which the menu
   * renders as "No skills available") on error / empty response.
   */
  private loadAiChatSkills(): void {
    const org = this.getConsistentOrganization();
    // /api/aip is the shared-lib base for agent-pipeline APIs; hard-code the
    // path since this endpoint isn't wrapped by a service yet.
    const url = `/api/aip/skills`;
    this.aiChatSkillsLoading = true;
    this.http.get<any>(url, { params: { org, page: '0', size: '50' } }).subscribe({
      next: (res) => {
        const skills = Array.isArray(res) ? res
                     : (res?.skills || res?.content || res?.data || []);
        this.aiChatSkills = Array.isArray(skills)
          ? skills.map((s: any) => this.toChatSkill(s)).filter(Boolean) as AiChatSkill[]
          : [];
        this.aiChatSkillsLoading = false;
        this.cdr.markForCheck?.();
      },
      error: () => {
        this.aiChatSkills = [];
        this.aiChatSkillsLoading = false;
        this.cdr.markForCheck?.();
      },
    });
  }

  /**
   * Maps one skill row from the /skills API into the AiChatSkill shape.
   * Picks a Material icon based on skillType so the dropdown stays visually
   * consistent with the previous hardcoded set.
   */
  private toChatSkill(s: any): AiChatSkill | null {
    if (!s || (typeof s !== 'object')) return null;
    const value = String(s.skillUid ?? s.id ?? s.skillAlias ?? s.skillName ?? '').trim();
    if (!value) return null;
    const label = String(s.skillName ?? s.skillAlias ?? s.name ?? value).trim();
    // Description intentionally omitted — the skill dropdown shows label only.
    const description = '';
    const type = String(s.skillType ?? '').toUpperCase();
    const iconMap: Record<string, string> = {
      CODE_GENERATION: 'auto_awesome',
      TEST_GENERATION: 'science',
      DOCUMENTATION:   'menu_book',
      REFACTOR:        'auto_fix_high',
      DEBUG:           'bug_report',
      SECURITY:        'shield',
      PERFORMANCE:     'speed',
      ANALYSIS:        'account_tree',
    };
    const icon = iconMap[type] || 'extension';
    return { value, label, icon, description };
  }

  /**
   * Normalises the /config/providers response into the flat pill-dropdown
   * shapes used by the AI chat panel. The backend response has been observed
   * in a few shapes across environments — this method is deliberately forgiving.
   */
  private applyProvidersResponse(res: any): void {
    if (!res) return;
    const list = Array.isArray(res) ? res : (res.providers || res.data || res.items);
    if (!Array.isArray(list) || list.length === 0) return;

    const agents: AiChatOption[] = [];
    const modelSet = new Map<string, string>();

    for (const p of list) {
      const value = p?.value ?? p?.id ?? p?.name ?? p?.provider;
      const label = p?.label ?? p?.displayName ?? p?.name ?? value;
      if (value) agents.push({ value, label });

      const models = p?.models ?? p?.availableModels ?? p?.supportedModels ?? [];
      if (Array.isArray(models)) {
        for (const m of models) {
          const mv = typeof m === 'string' ? m : (m?.value ?? m?.id ?? m?.name);
          const ml = typeof m === 'string' ? m : (m?.label ?? m?.displayName ?? m?.name ?? mv);
          if (mv && !modelSet.has(mv)) modelSet.set(mv, ml);
        }
      }
    }

    if (agents.length) {
      this.aiChatAgents = agents;
      // Preserve the origin-based default when the API's list contains it —
      // only fall back to agents[0] if our preferred value isn't available.
      if (!agents.find(a => a.value === this.aiChatSelectedAgent)) {
        this.aiChatSelectedAgent = agents[0].value;
      }
    }
    if (modelSet.size) {
      this.aiChatModels = Array.from(modelSet.entries()).map(([value, label]) => ({ value, label }));
      // Same preservation rule for the model — keep the origin default if present.
      if (!this.aiChatModels.find(m => m.value === this.aiChatSelectedModel)) {
        this.aiChatSelectedModel = this.aiChatModels[0].value;
      }
    }
    this.cdr.markForCheck?.();
  }

  /** Close menus when clicking anywhere in the chat panel background. */
  onAiChatPanelClick(ev: MouseEvent): void {
    const target = ev.target as HTMLElement;
    if (target?.closest('.ai-pill-dropdown') || target?.closest('.ai-menu-popover')) return;
    this.aiChatOpenMenu = null;
  }

  toggleAiChatMenu(menu: 'skill' | 'model' | 'agent', ev?: MouseEvent): void {
    ev?.stopPropagation();
    this.aiChatOpenMenu = this.aiChatOpenMenu === menu ? null : menu;
  }

  isSkillAttached(s: AiChatSkill): boolean {
    return this.aiChatAttachedSkills.some(a => a.value === s.value);
  }
  toggleAttachSkill(s: AiChatSkill): void {
    const i = this.aiChatAttachedSkills.findIndex(a => a.value === s.value);
    if (i >= 0) this.aiChatAttachedSkills.splice(i, 1);
    else this.aiChatAttachedSkills.push(s);
  }
  removeAttachedSkill(i: number): void {
    this.aiChatAttachedSkills.splice(i, 1);
  }

  selectAiChatAgent(a: AiChatOption): void {
    this.aiChatSelectedAgent = a.value;
    this.aiChatOpenMenu = null;
  }
  selectAiChatModel(m: AiChatOption): void {
    this.aiChatSelectedModel = m.value;
    this.aiChatOpenMenu = null;
  }

  useAiChatSuggestion(s: AiChatSkill): void {
    this.aiChatInput = s.label;
    // Focus the textarea after Angular renders
    setTimeout(() => this.aiChatTextareaEl?.nativeElement?.focus(), 0);
  }

  onAiChatKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      if (this.aiChatInput.trim() && !this.aiChatStreaming) this.sendAiChatMessage();
    }
  }

  clearAiChat(): void {
    this.cancelAiChatMockTimers();
    this.aiChatMessages = [];
    this.aiChatAttachedSkills = [];
    this.aiChatInput = '';
    this.aiChatStreaming = false;
    // Reset the underlying Goose session too so the next prompt starts fresh.
    this.aiChatCoder.reset();
    this.aiChatDeployAvailable = false;
    this.aiChatDeployStatus = 'idle';
    this.aiChatDeployedUrl = null;
  }

  /**
   * Wires the AI chat coder service to the panel — subscribes to message,
   * status, files, and deployment streams and mirrors them into component
   * state used by the template.
   */
  private wireAiChatCoderService(): void {
    // The AiChatCoderService is a module-scoped singleton — its messages/files
    // survive across component instances. When the user navigates away and
    // comes back (or opens a different pipeline card), we must fully reset
    // the service so the panel starts fresh instead of showing stale chat.
    this.aiChatCoder.reset();
    // Also clear any locally-mirrored state.
    this.aiChatMessages = [];
    this.aiChatInput = '';
    this.aiChatAttachedSkills = [];
    this.aiChatStreaming = false;
    this.aiChatDeployAvailable = false;
    this.aiChatDeployStatus = 'idle';
    this.aiChatDeployedUrl = null;
    this.pushStatus = { phase: 'idle' } as AiChatPushState;

    // Configure the service for the current pipeline card so persistence
    // (folder/upload) targets the right cname + organisation.
    if (this.currentCname) {
      this.aiChatCoder.configureForPipeline(this.currentCname, this.getConsistentOrganization());
    }

    // Mirror service messages → panel messages (map role/timestamp).
    this.aiChatSubs.push(
      this.aiChatCoder.messages$.subscribe(msgs => {
        // Mark the last assistant message as "streaming" while a reply is in
        // flight so the typing-dot indicator shows for empty content.
        const isGenerating = this.aiChatCoder.status$.value === 'generating';
        this.aiChatMessages = msgs.map((m, idx) => ({
          id: `svc-${idx}-${m.timestamp?.getTime?.() ?? idx}`,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp ?? new Date(),
          streaming: isGenerating && idx === msgs.length - 1 && m.role === 'assistant',
        }));
        this.scrollAiChatToBottom();
        this.cdr.detectChanges();
      })
    );

    this.aiChatSubs.push(
      this.aiChatCoder.status$.subscribe(status => {
        this.aiChatStreaming = status === 'generating';
        this.cdr.detectChanges();
      })
    );

    // When files are ready, enable the Deploy button. UI refresh happens on
    // persistComplete$ (see next subscription) so it fires once per round.
    this.aiChatSubs.push(
      this.aiChatCoder.generationComplete$.subscribe(files => {
        this.aiChatDeployAvailable = files.length > 0;
        this.hasGeneratedAgent = files.length > 0;
        this.isJsonProcessed = files.length > 0;
        this.cdr.detectChanges();
      })
    );

    // Persist-complete fires ONCE per round (in both success + error paths)
    // — this is the safe point to reload the codespace tree from the DB.
    // Subscribed exactly once so we don't leak subscriptions across rounds.
    this.aiChatSubs.push(
      this.aiChatCoder.persistComplete$.subscribe(() => {
        this.hasGeneratedAgent = true;
        this.isJsonProcessed = true;
        this.refreshFileStructure();
        this.cdr.detectChanges();
      })
    );

    this.aiChatSubs.push(
      this.aiChatCoder.deploymentStatus$.subscribe(s => {
        this.aiChatDeployStatus = s;
        this.cdr.detectChanges();
      })
    );

    this.aiChatSubs.push(
      this.aiChatCoder.deploymentResult$.subscribe(r => {
        this.aiChatDeployedUrl = typeof r === 'string' ? r : (r?.deployUrl ?? null);
        this.cdr.detectChanges();
      })
    );

    // GitHub push lifecycle — toast + expandable details panel.
    this.aiChatSubs.push(
      this.aiChatCoder.pushStatus$.subscribe(s => {
        // Guard against cross-card leaks: the service is a module-scoped
        // singleton, so a push kicked off from a different pipeline card
        // could still be emitting here. If the status is tagged with a
        // pipelineCname that doesn't match the card we're currently viewing,
        // treat it as idle so the toast doesn't appear on the wrong card.
        const belongsToOtherCard = !!s.pipelineCname
          && !!this.currentCname
          && s.pipelineCname !== this.currentCname;
        this.pushStatus = belongsToOtherCard ? { phase: 'idle' } as AiChatPushState : s;
        // Keep the draft URL synced with the latest known value when the panel
        // isn't open (so editing starts from a clean slate).
        if (!this.pushStatusPanelOpen) {
          this.pushStatusRepoUrlDraft = this.pushStatus.repoUrl ?? '';
        }
        this.cdr.detectChanges();
      })
    );
  }

  /**
   * Sends the prompt to the real Goose agent via AiChatCoderService.
   * Reply streams back via SSE; when files are generated the service auto-
   * saves them to the pipeline card DB and pushes to GitHub (but does NOT
   * trigger the deployment preview — that's manual via deployNow()).
   *
   * Every prompt is enriched with a CODEBASE CONTEXT block that lists all
   * files in the pipeline card and inlines the currently-open file's contents
   * so the agent always has full awareness of what the user is looking at —
   * regardless of what they typed.
   */
  sendAiChatMessage(): void {
    const text = (this.aiChatInput || '').trim();
    if (!text || this.aiChatStreaming) return;

    // Make sure the coder service is bound to the current pipeline card. The
    // cname may not have been available yet when the panel was first wired.
    if (this.currentCname) {
      this.aiChatCoder.configureForPipeline(this.currentCname, this.getConsistentOrganization());
    }

    // Reset input state (attached skills / open menu). Attached skills are
    // appended to the prompt as an inline hint so the agent knows what the
    // user wants to work on.
    const attached = [...this.aiChatAttachedSkills];
    const skillHint = attached.length
      ? `\n\n[User attached these skills: ${attached.map(a => a.label).join(', ')}]`
      : '';
    this.aiChatInput = '';
    this.aiChatAttachedSkills = [];
    this.aiChatOpenMenu = null;

    // A new generation round invalidates the previous deploy state.
    this.aiChatDeployAvailable = false;
    this.aiChatDeployStatus = 'idle';
    this.aiChatDeployedUrl = null;

    // Build the codebase context block — ALWAYS included so the agent knows
    // which pipeline / files it's working on before answering. The block is
    // sent to the agent but NOT shown in the chat bubble (see displayText arg).
    const contextBlock = this.buildCodebaseContext();
    const finalPrompt = contextBlock
      ? `${contextBlock}\n\n---\nUser question:\n${text}${skillHint}`
      : `${text}${skillHint}`;

    // displayText = what the user actually typed (+ optional skill hint) so
    // the chat bubble stays clean; finalPrompt = full context + question that
    // goes to the agent.
    const bubbleText = `${text}${skillHint}`;
    this.aiChatCoder.sendMessage(
      finalPrompt,
      this.aiChatSelectedAgent,
      this.aiChatSelectedModel,
      bubbleText,
    );
  }

  /**
   * Assembles a compact CODEBASE CONTEXT block covering the current pipeline
   * card. Included in every prompt sent from the AI chat panel:
   *   • Pipeline metadata (cname, alias, mode)
   *   • Full file list (flattened from the file explorer tree)
   *   • FULL CONTENTS of every file in the pipeline so the agent always sees
   *     the latest state (fresh generations + user edits + saves)
   *   • The currently-open file uses `selectedFileContent` (live in-memory)
   *     so any unsaved textarea edits are also included
   * Caps:
   *   • per-file content:  20,000 chars
   *   • total content sum: 150,000 chars (older files skipped once cap hit)
   */
  private buildCodebaseContext(): string {
    const lines: string[] = [];
    lines.push('[CODEBASE CONTEXT]');
    lines.push(`Pipeline: ${this.pipelineAlias || this.currentCname || '(unknown)'} (cname: ${this.currentCname || 'n/a'}, mode: ${this.pipelineMode})`);

    // Flatten the file tree into { path, content } pairs.
    const files = this.flattenFilesWithContent(this.fileSystemData);

    // Overlay the currently-open file with its live (possibly unsaved) content
    // so the agent sees exactly what the user is looking at in the editor.
    if (this.selectedFileName && this.selectedFileContent != null) {
      const openPath = this.selectedFilePath || this.selectedFileName;
      const idx = files.findIndex(f => f.path === openPath);
      const liveContent = this.selectedFileContent;
      const modified = this.isFileModified;
      if (idx >= 0) {
        files[idx] = { path: openPath, content: liveContent, modified };
      } else {
        files.unshift({ path: openPath, content: liveContent, modified });
      }
    }

    if (files.length) {
      lines.push('');
      lines.push(`Project files (${files.length}):`);
      const shownList = files.length > 200 ? files.slice(0, 200) : files;
      for (const f of shownList) {
        lines.push(`  - ${f.path}${f.modified ? '  (unsaved changes)' : ''}`);
      }
      if (files.length > shownList.length) {
        lines.push(`  ... and ${files.length - shownList.length} more file(s)`);
      }

      // Inline every file's content so the agent sees the full latest codebase.
      const PER_FILE_MAX = 20000;
      const TOTAL_MAX = 150000;
      let totalBytes = 0;
      const skipped: string[] = [];

      lines.push('');
      lines.push('File contents:');
      for (const f of files) {
        const raw = f.content ?? '';
        if (!raw) continue;
        if (totalBytes >= TOTAL_MAX) {
          skipped.push(f.path);
          continue;
        }
        const clipped = raw.length > PER_FILE_MAX
          ? raw.slice(0, PER_FILE_MAX) + `\n... [truncated ${raw.length - PER_FILE_MAX} chars]`
          : raw;
        const lang = this.langHintForPath(f.path);
        const header = f.modified
          ? `--- ${f.path}  (unsaved changes) ---`
          : `--- ${f.path} ---`;
        lines.push('');
        lines.push(header);
        lines.push('```' + lang);
        lines.push(clipped);
        lines.push('```');
        totalBytes += clipped.length;
      }
      if (skipped.length) {
        lines.push('');
        lines.push(`(${skipped.length} file(s) omitted from context to stay within size limit: ${skipped.slice(0, 10).join(', ')}${skipped.length > 10 ? ', ...' : ''})`);
      }
    } else {
      lines.push('');
      lines.push('Project files: (none yet — this is a fresh pipeline)');
    }

    lines.push('[END CODEBASE CONTEXT]');
    return lines.join('\n');
  }

  /**
   * Walks the file tree and returns { path, content, modified } for every file.
   * Uses the eager `content` loaded by buildFileTreeFromApiResponse so no
   * extra network round-trip is needed.
   */
  private flattenFilesWithContent(
    nodes: FileNode[] | undefined,
    prefix: string = '',
  ): Array<{ path: string; content: string; modified?: boolean }> {
    if (!nodes || !nodes.length) return [];
    const out: Array<{ path: string; content: string; modified?: boolean }> = [];
    for (const n of nodes) {
      const fullPath = prefix ? `${prefix}/${n.name}` : n.name;
      if (n.type === 'file') {
        out.push({ path: fullPath, content: n.content ?? '' });
      } else if (n.type === 'folder' && n.children?.length) {
        out.push(...this.flattenFilesWithContent(n.children, fullPath));
      }
    }
    return out;
  }

  /**
   * Maps a filename to a markdown fence language hint (best-effort — falls
   * back to the raw extension when unknown).
   */
  private langHintForPath(path: string): string {
    const ext = (path.split('.').pop() ?? '').toLowerCase();
    const map: Record<string, string> = {
      ts: 'ts', tsx: 'tsx', js: 'javascript', jsx: 'jsx', mjs: 'javascript', cjs: 'javascript',
      py: 'python', java: 'java', kt: 'kotlin', go: 'go', rs: 'rust', rb: 'ruby',
      html: 'html', htm: 'html', css: 'css', scss: 'scss', sass: 'sass', less: 'less',
      json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'toml', xml: 'xml',
      md: 'markdown', markdown: 'markdown',
      sh: 'bash', bash: 'bash', zsh: 'bash', ps1: 'powershell',
      sql: 'sql', dockerfile: 'dockerfile',
      properties: 'properties',
    };
    if (path.toLowerCase().endsWith('dockerfile')) return 'dockerfile';
    return map[ext] || ext;
  }

  /**
   * Walks the file tree and returns a flat array of file paths (folders are
   * used only for the path prefix — not included as separate entries).
   * Kept for callers that only need the list (currently unused after the
   * refactor to flattenFilesWithContent).
   */
  private flattenFilePaths(nodes: FileNode[] | undefined, prefix: string = ''): string[] {
    if (!nodes || !nodes.length) return [];
    const out: string[] = [];
    for (const n of nodes) {
      const fullPath = prefix ? `${prefix}/${n.name}` : n.name;
      if (n.type === 'file') {
        out.push(fullPath);
      } else if (n.type === 'folder' && n.children?.length) {
        out.push(...this.flattenFilePaths(n.children, fullPath));
      }
    }
    return out;
  }

  /**
   * Manual Deploy trigger — hits /sessions/{id}/preview via the coder service.
   * Bound to the "Deploy" button that shows after files have been generated.
   */
  deployAiChatFiles(): void {
    if (!this.aiChatDeployAvailable || this.aiChatDeployStatus === 'deploying') return;
    this.aiChatCoder.deployNow();
  }

  /** Close the AI chat panel — user can reopen via the "Open AI Chat" pill above the codespace. */
  hideAiChatPanel(): void {
    this.aiChatVisible = false;
    this.aiChatOpenMenu = null;
    try { localStorage.setItem('essedum.aiChat.visible', '0'); } catch { /* ignore */ }
  }

  /** Re-open the AI chat panel from the "Open AI Chat" pill in the codespace toolbar. */
  showAiChatPanel(): void {
    this.aiChatVisible = true;
    try { localStorage.setItem('essedum.aiChat.visible', '1'); } catch { /* ignore */ }
  }

  // ─── GitHub push status controls ──────────────────────────────────────────

  /** Open the expandable details panel; seed the URL draft with the latest value. */
  openPushStatusPanel(): void {
    this.pushStatusPanelOpen = true;
    this.pushStatusRepoUrlDraft = this.pushStatus.repoUrl ?? '';
  }

  /** Close the details panel without applying any URL change. */
  closePushStatusPanel(): void {
    this.pushStatusPanelOpen = false;
  }

  /** Dismiss the entire push toast (does not cancel an in-flight push). */
  dismissPushStatus(ev?: MouseEvent): void {
    // The dismiss button lives inside the toast header which also toggles the
    // expandable details panel on click — stop bubbling so we don't do both.
    ev?.stopPropagation();
    this.pushStatusPanelOpen = false;
    this.aiChatCoder.dismissPushStatus();
  }

  /** Manually refresh the push status via GET /github-status. */
  refreshPushStatus(): void {
    this.aiChatCoder.refreshPushStatus();
  }

  /** Persist the edited repo URL and retry the push. */
  saveRepoUrlAndRetry(): void {
    const trimmed = (this.pushStatusRepoUrlDraft || '').trim();
    if (trimmed) this.aiChatCoder.updateRepoUrl(trimmed);
    this.aiChatCoder.retryPushToGitHub();
  }

  /** Retry the push using the existing (or newly-set) URL. */
  retryPushToGitHub(): void {
    this.aiChatCoder.retryPushToGitHub();
  }

  /** Convenience getter — is the status toast visible right now? */
  get pushStatusVisible(): boolean {
    return this.pushStatus.phase !== 'idle';
  }

  private cancelAiChatMockTimers(): void {
    for (const t of this.aiChatMockTimers) clearTimeout(t);
    this.aiChatMockTimers = [];
  }

  private scrollAiChatToBottom(): void {
    const el = this.aiChatMessagesEl?.nativeElement;
    if (!el) return;
    // Use rAF to wait for DOM render
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
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


    // Simulate API call
    setTimeout(() => {
      this.isPushing = false;
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
  private async checkForExistingFilesAndLoadState(cname: string): Promise<void> {

    // Reset to initial state first
    this.resetToInitialStateForNewAgent();
   // Fetch runner_service_status FIRST and WAIT for it
    await this.fetchRunnerServiceStatus();
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
          // Only enable codespace tab and populate with response data
          this.enableCodespaceTabOnly(apiResponse);
        } else {
          // Even if API succeeds but no files, show script tab only
          this.showScriptTabOnly();
        }
        this.isLoadingFiles = false;
             // Trigger change detection after files are loaded
        this.cdr.detectChanges();
      },
      error: (error) => {
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
      this.fileSystemData = this.agentPipelineService.buildFileTreeFromApiResponse(fileData);
      this.expandAllFolders(this.fileSystemData); // Expand all folders by default
    } else {
      this.fileSystemData = []; // Empty initially if no data
    }
    
    // Keep console empty - only WebSocket data from Run and Deploy should appear
    this.consoleOutput = [];

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
    }

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
    
    // Ensure script content is empty for new agents
    if (!this.loadScript || !this.script || this.script.length === 0) {
      this.script = [];
      this.scriptFileName = '';
      this.loadScript = true;
    }
    
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
    
    // Set flag to true so deploy button on deployment tab can be used
    this.hasDeploymentFormData = true;
    
    // Extract and store deployment environment from the correct path
    this.deploymentEnvironment = deploymentData?.deployment_environment || '';
    
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
      this.hasDeploymentFormData = false;
      this.deploymentEnvironment = '';
      return;
    }

    const organization = this.getOrganization();
    
    this.isCheckingDeploymentData = true;
    
    this.service.getDeploymentFormByCnameOrg(this.currentCname, organization).subscribe({
      next: (response) => {
        
        // More robust checking - if response exists and is not empty
        let hasData = false;
        let data = null;
        
        if (response) {
          if (Array.isArray(response)) {
            hasData = response.length > 0;
            data = response[0];
          } else if (typeof response === 'object') {
            hasData = Object.keys(response).length > 0;
            data = response;
          }
        }
        
        
        if (hasData && data) {
          // Set flag to TRUE - button MUST show
          this.hasDeploymentFormData = true;
          
          // Try to extract deployment environment (optional)
          this.deploymentEnvironment = data.deployment_environment || '';
          
        } else {
          this.hasDeploymentFormData = false;
          this.deploymentEnvironment = '';
        }
        
        this.isCheckingDeploymentData = false;
        
        // Force change detection to ensure UI updates
        this.cdr.detectChanges();
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

    this.isLoadingFiles = true;
    
    // Reset state first
    this.resetToInitialStateForNewAgent();
        // Fetch runner_service_status FIRST and WAIT for it
    await this.fetchRunnerServiceStatus();

    // Only call folder list API to check existence
    this.agentPipelineService.getAgentFiles(this.currentCname).subscribe({
      next: (listResponse) => {
        
        if (listResponse && listResponse.length > 0) {
          // Data exists, enable codespace tab and populate with response data
          this.enableCodespaceTabOnly(listResponse);
        } else {
          // No data from list API, show only script tab
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

    this.isLoadingFiles = true;
    
    // Reset state first
    this.resetToInitialStateForNewAgent();
      // Fetch runner_service_status FIRST and WAIT for it
    await this.fetchRunnerServiceStatus();
    
    // Check if deployment form data exists for the Deploy button
    this.checkDeploymentFormData();

    // Call folder list API first - using the cname as both cname and filename for the API
    this.agentPipelineService.getAgentFiles(this.currentCname).subscribe({
      next: (listResponse) => {
        
        if (listResponse && listResponse.length > 0) {
          // List API succeeded - enable codespace tab and populate with response data
          this.enableCodespaceTabOnly(listResponse);
          
          this.isLoadingFiles = false;

               
          // Trigger change detection
          this.cdr.detectChanges();
        } else {
          // No data from list API, show only script tab and continue with old flow
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

  // ── Env/Secrets persistence ───────────────────────────────────────────────────

  private async persistEnvAndSecrets(): Promise<void> {
    if (!this.currentCname) return;
    try {
      const organization = this.getOrganization();
      const url = this.baseUrl + `/service/v1/streamingServices/${this.currentCname}/${organization}`;
      const response = await this.http.get<any>(url).toPromise();
      if (!response) return;
      const jsonContent = response.json_content ? JSON.parse(response.json_content) : {};
      // Write env vars to jsonContent.environment
      jsonContent.environment = this.dynamicEnvArray;
      // Write secrets to jsonContent.elements[0].attributes.usedSecrets
      if (!Array.isArray(jsonContent.elements) || jsonContent.elements.length === 0) {
        jsonContent.elements = [{ attributes: {} }];
      }
      if (!jsonContent.elements[0].attributes) {
        jsonContent.elements[0].attributes = {};
      }
      jsonContent.elements[0].attributes.usedSecrets = this.dynamicSecretsArray;
      const updateUrl = this.baseUrl + '/service/v1/streamingServices/update';
      await this.http.put<any>(updateUrl, { ...response, json_content: JSON.stringify(jsonContent) }).toPromise();
    } catch (error) {
      console.error('Error persisting env/secrets:', error);
    }
  }

  // ── Environment-variable CRUD ────────────────────────────────────────────────

  addEnvVar(): void {
    if (this.envEditMode) return;
    this.envCollapsed = false;
    this.dynamicEnvArray = [...this.dynamicEnvArray, { name: '', value: '' }];
    this.envEditIndex = this.dynamicEnvArray.length - 1;
    this.envEditMode = true;
  }

  editEnvVar(index: number): void {
    if (this.envEditMode && this.envEditIndex !== index) return;
    this.envEditIndex = index;
    this.envEditMode = true;
  }

  trackByIndex(index: number): number { return index; }

  saveEnvVar(_index: number): void {
    this.envEditIndex = null;
    this.envEditMode = false;
    this.persistEnvAndSecrets();
  }

  deleteEnvVar(index: number): void {
    this.dynamicEnvArray = this.dynamicEnvArray.filter((_, i) => i !== index);
    if (this.envEditIndex === index) {
      this.envEditIndex = null;
      this.envEditMode = false;
    }
    this.envCollapsed = this.dynamicEnvArray.length === 0;
    this.persistEnvAndSecrets();
  }

  // ── Secrets CRUD ─────────────────────────────────────────────────────────────

  addSecret(): void {
    if (this.secretsEditMode) return;
    this.secretsCollapsed = false;
    this.dynamicSecretsArray = [...this.dynamicSecretsArray, { name: '', value: '' }];
    this.secretsEditIndex = this.dynamicSecretsArray.length - 1;
    this.secretsEditMode = true;
    this.secretsShowValue = [...this.secretsShowValue, false];
  }

  editSecret(index: number): void {
    if (this.secretsEditMode && this.secretsEditIndex !== index) return;
    this.secretsEditIndex = index;
    this.secretsEditMode = true;
  }

  saveSecret(_index: number): void {
    this.secretsEditIndex = null;
    this.secretsEditMode = false;
    this.persistEnvAndSecrets();
  }

  deleteSecret(index: number): void {
    this.dynamicSecretsArray = this.dynamicSecretsArray.filter((_, i) => i !== index);
    this.secretsShowValue = this.secretsShowValue.filter((_, i) => i !== index);
    if (this.secretsEditIndex === index) {
      this.secretsEditIndex = null;
      this.secretsEditMode = false;
    }
    this.secretsCollapsed = this.dynamicSecretsArray.length === 0;
    this.persistEnvAndSecrets();
  }

  toggleSecretVisibility(index: number): void {
    this.secretsShowValue[index] = !this.secretsShowValue[index];
  }

  /**
   * Component cleanup
   */
  ngOnDestroy(): void {
    // Remove event listener to prevent memory leaks
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));

    // Clean up WebSocket connection
    this.disconnectWebSocket();

    // Tear down the Material tab-body width forcer.
    this.tabSizeObserver?.disconnect();
    this.tabSizeObserver = null;

    // Cancel any AI chat streaming timers still pending.
    this.cancelAiChatMockTimers();

    // Tear down AI chat coder service subscriptions & abort any in-flight stream.
    for (const s of this.aiChatSubs) s.unsubscribe();
    this.aiChatSubs = [];
    this.aiChatCoder.cancelReply();
  }

  // ---------------------------------------------------------------------------
  // Material tab-body width forcer
  //
  // In the federated MFE bundle, Material's mat-mdc-tab-body / mat-mdc-tab-body-
  // content lose the host's `width: 100%; position: absolute; inset: 0` styling
  // and collapse to shrink-to-content (260px, matching only the file explorer).
  // CSS ::ng-deep fixes don't pierce reliably here. So we own this with JS:
  // measure the outer panel and set inline widths on every Material wrapper.
  // Inline styles beat any cascade ordering.
  // ---------------------------------------------------------------------------
  private tabSizeObserver: ResizeObserver | null = null;
  @ViewChild('panelShell', { static: false }) private panelShellRef?: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    // Defer to next frame so Material has finished rendering mat-tab-body.
    requestAnimationFrame(() => this.installTabSizeForcer());
  }

  private installTabSizeForcer(): void {
    const root = (this.panelShellRef?.nativeElement)
              ?? (document.querySelector('.lfx-u-mar-t-16') as HTMLElement | null);
    if (!root || typeof ResizeObserver === 'undefined') return;

    // The whole container chain (mat-tab-body-wrapper → mat-tab-body →
    // mat-tab-body-content → .tab-content → .file-structure-container →
    // .file-panel) collapses to shrink-to-content inside the federated
    // bundle because the host's Material CSS singleton doesn't fully apply
    // to remote-rendered elements. We bypass the chain by measuring an
    // ancestor we KNOW has real width (the body/viewport) and stamping
    // inline width on every level from mat-tab-body downward.
    const apply = () => {
      // Prefer the panelShell wrapper if it has real width; else fall back
      // to the document body. body.clientWidth is always the visible width.
      let baseW = root.clientWidth;
      if (baseW <= 260) baseW = document.body.clientWidth;
      if (baseW <= 260) return;

      const selectors = [
        '.mat-mdc-tab-body-wrapper',
        '.mat-mdc-tab-body',
        '.mat-mdc-tab-body-content',
        '.tab-content',
        '.file-structure-container',
        '.file-panel',
      ].join(',');

      root.querySelectorAll<HTMLElement>(selectors).forEach((el) => {
        el.style.setProperty('width', `${baseW}px`, 'important');
        el.style.setProperty('max-width', 'none', 'important');
        el.style.setProperty('min-width', '0', 'important');
      });

      // Editor column = remaining space after the 260px file explorer.
      root.querySelectorAll<HTMLElement>('.file-editor-container').forEach((el) => {
        const w = Math.max(0, baseW - 260);
        el.style.setProperty('width', `${w}px`, 'important');
        el.style.setProperty('min-width', '0', 'important');
        el.style.setProperty('max-width', 'none', 'important');
      });
    };

    apply();
    // Re-apply on viewport resize.
    this.tabSizeObserver = new ResizeObserver(apply);
    this.tabSizeObserver.observe(document.body);
    this.tabSizeObserver.observe(root);

    // Re-apply when Material swaps tab content or *ngIf inserts the editor.
    const mo = new MutationObserver(() => apply());
    mo.observe(root, { childList: true, subtree: true });

    // Also try a few times in the first second — Material's tab body can
    // animate in after a delay.
    [50, 150, 400, 900].forEach((ms) => setTimeout(apply, ms));
  }
}