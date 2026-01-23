import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Services } from '../../services/service';
import { AgentDirectoryService } from '../agent-directory.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-agent-directory-edit',
  templateUrl: './agent-directory-edit.component.html',
  styleUrls: ['./agent-directory-edit.component.scss'],
})
export class AgentDirectoryEditComponent implements OnInit {
  addView: boolean = false;
  editView: boolean = false;
  agentName: string = '';
  lang: string = 'json'; // Set language for code editor
  script: any[] = []; // Script array for code editor
  pipelineMode: 'agent' | 'mcp' = 'agent';
  agentMcpPipelines = [];
  assignedAgentMcpPipeline: string = '';
  options = [];
  organization: string = '';
  // Single object to hold all agent data
  agentData: any = {
    name: '',
    alias: '',
    version: '',
    type: '',
    description: '',
    cid: '',
    creator: '',
    organization: '',
    category: '',
    connection_details: '',
    extras_json: '{}',
    pipeline_id: null,
    jsonModelString: '',
    modules: [],
    skills: [],
    locators: [],
    domains: [],
    tools: [],
    resources: [],
    prompts: [],
    syncs: [],
    publications: [],
    extensions: [],
    signatures: [],
    selectors: [],
  };

  // New item inputs
  newModuleName: string = '';
  newSkillName: string = '';
  newLocatorType: string = '';
  newLocatorUrl: string = '';
  newDomainName: string = '';
  newDomainDescription: string = '';
  newSyncTarget: string = '';
  newSyncFrequency: string = '';
  newPublicationChannel: string = '';
  newPublicationStatus: string = '';
  newExtensionKey: string = '';
  newExtensionValue: string = '';
  newExtensionDescription: string = '';
  newSignatureAlgorithm: string = '';
  newSignatureValue: string = '';
  newSignatureCertificate: string = '';
  newSelectorKey: string = '';
  newSelectorValue: string = '';

  // Locator type options
  locatorTypeOptions = [
    { value: 'source-code', label: 'Source Code' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'api', label: 'API' },
    { value: 'repository', label: 'Repository' },
    { value: 'oci-image', label: 'OCI Image' },
    { value: 'endpoint', label: 'Endpoint' },
  ];

  // Sync frequency options
  syncFrequencyOptions = [
    { value: 'real-time', label: 'Real-time' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'manual', label: 'Manual' },
  ];

  // Publication status options
  publicationStatusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
    { value: 'deprecated', label: 'Deprecated' },
  ];

  // Signature algorithm options
  signatureAlgorithmOptions = [
    { value: 'SHA2_256', label: 'SHA-256' },
    { value: 'SHA2_512', label: 'SHA-512' },
    { value: 'SHA3_256', label: 'SHA3-256' },
    { value: 'RSA', label: 'RSA' },
    { value: 'ECDSA', label: 'ECDSA' },
  ];

  // Active section for navigation
  activeSection = 'basic';

  isBackHovered: boolean = false;

  // Dynamic table headers (include width and put Actions first for consistent layout)
  locatorsHeaders = [
    { key: 'actions', label: 'Action', width: '10%' },
    { key: 'type', label: 'Type', width: '30%' },
    { key: 'url', label: 'URL', width: '60%' },
  ];

  syncsHeaders = [
    { key: 'actions', label: 'Action', width: '10%' },
    { key: 'target', label: 'Target', width: '60%' },
    { key: 'frequency', label: 'Frequency', width: '30%' },
  ];

  publicationsHeaders = [
    { key: 'actions', label: 'Action', width: '10%' },
    { key: 'channel', label: 'Channel', width: '60%' },
    { key: 'status', label: 'Status', width: '30%' },
  ];

  extensionsHeaders = [
    { key: 'actions', label: 'Action', width: '10%' },
    { key: 'key', label: 'Key', width: '30%' },
    { key: 'value', label: 'Value', width: '30%' },
    { key: 'description', label: 'Description', width: '30%' },
  ];

  parametersHeaders = [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'description', label: 'Description' },
    { key: 'required', label: 'Required' },
    { key: 'actions', label: 'Actions' },
  ];

  // Section titles
  sectionTitles = {
    basic: 'Basic Information',
    cid: 'CID',
    jsonModel: 'JSON Model',
    modules: 'Modules',
    skills: 'Skills',
    selectors: 'Selectors',
    domains: 'Domains',
    locators: 'Locators',
    syncs: 'Syncs',
    publications: 'Publications',
    extensions: 'Extensions',
    signatures: 'Signatures',
    tools: 'Tools',
    resources: 'Resources',
    prompts: 'Prompts'
  };

  // Section collapse states
  sectionStates: { [key: string]: boolean } = {
    'basic': true,
    'cid': true,
    'json-model': true,
    'modules': true,
    'skills': true,
    'selectors': true,
    'domains': true,
    'locators': true,
    'syncs': true,
    'publications': true,
    'extensions': true,
    'signatures': true,
    'tools': true,
    'resources': true,
    'prompts': true
  };

  // Section hover states for title animation
  sectionHoverStates: { [key: string]: boolean } = {
    'basic': false,
    'cid': false,
    'json-model': false,
    'modules': false,
    'skills': false,
    'selectors': false,
    'domains': false,
    'locators': false,
    'syncs': false,
    'publications': false,
    'extensions': false,
    'signatures': false,
    'tools': false,
    'resources': false,
    'prompts': false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private agentService: AgentDirectoryService,
    private service: Services
  ) {}

  ngOnInit(): void {
    this.organization = sessionStorage.getItem('organization');
    this.loadAgentTypes();
    // Check if we're in edit mode or create mode
    this.route.params.subscribe((params) => {
      if (params['name']) {
        this.editView = true;
        this.addView = false;
        this.agentName = params['name'];
        this.getAgentData(this.agentName);
      } else {
        this.addView = true;
        this.editView = false;
        this.initializeNewAgent();
      }
    });
  }

  loadAgentTypes() {
    // Default agent types - can be extended based on API
    this.options = [
      { viewValue: 'Agent', value: 'AIAgent' },
      { viewValue: 'MCP Server', value: 'mcpServer' },
    ];
  }

  // Get agent data from service
  getAgentData(name: string): void {
    const org = sessionStorage.getItem('organization');

    this.agentService.getAgentDirectory(name, org).subscribe(
      (response) => {
        if (response) {
          this.loadAgentData(response);
        } else {
          console.error('Agent not found');
          this.navigateBack();
        }
      },
      (error) => {
        console.error('Error loading agent data:', error);
        const errorMessage =error?.details || 'Failed to load agent directory';
        this.service.message(errorMessage, 'error');
        this.navigateBack();
      }
    );
  }

  loadAgentData(apiResponse: any): void {
    // Parse jsonModel if it's a string, otherwise use as object
    let jsonModelObject = apiResponse.extras_json;
    if (typeof jsonModelObject === 'string') {
      try {
        jsonModelObject = JSON.parse(jsonModelObject);
      } catch (e) {
        console.warn('Failed to parse jsonModel string:', e);
        jsonModelObject = {};
      }
    }

    // Load all data into the agentData object - preserve id fields for updates
    this.agentData = {
      name: apiResponse.name,
      alias: apiResponse.alias,
      version: apiResponse.version || '1.0.0',
      type: apiResponse.type,
      description: apiResponse.description,
      cid: apiResponse.cid,
      creator: apiResponse.creator || '',
      organization:
        apiResponse.organization || sessionStorage.getItem('organization'),
      category: apiResponse.category || 'Agent',
      connection_details:
        apiResponse.connection_details || apiResponse.connectionDetails || '',
      extras_json:
        apiResponse.extras_json ||
        (apiResponse.extras ? JSON.stringify(apiResponse.extras) : '{}'),
      pipeline_id: apiResponse.pipeline_id || null,
      // Preserve id fields for all arrays
      modules: (apiResponse.modules || []).map((m) => ({ ...m })),
      skills: (apiResponse.skills || []).map((s) => ({ ...s })),
      locators: (apiResponse.locators || []).map((l) => ({ ...l })),
      domains: (apiResponse.domains || []).map((d) => ({ ...d })),
      tools: (apiResponse.tools || []).map((t) => ({
        ...t,
        parameters: (t.parameters || []).map((p) => ({ ...p })),
      })),
      resources: (apiResponse.resources || []).map((r) => ({ ...r })),
      prompts: (apiResponse.prompts || []).map((p) => ({ ...p })),
      syncs: (apiResponse.syncs || []).map((s) => ({
        ...s,
        frequency: s.frequency ? s.frequency.toLowerCase() : s.frequency,
      })),
      publications: (apiResponse.publications || []).map((p) => ({ ...p })),
      extensions: (apiResponse.extensions || []).map((e) => ({ ...e })),
      selectors: (apiResponse.selectors || []).map((s) => ({ ...s })),
      signatures: (apiResponse.signatures || []).map((s) => ({ ...s })),
      jsonModelString: JSON.stringify(jsonModelObject, null, 2),
    };

    // Convert jsonModelString to script array for code editor
    this.script = [this.agentData.jsonModelString];
    this.getAgentPipelineBasedOnType();
    this.getAllListOfAgentMcpPipeline();
  }

  initializeNewAgent(): void {
    // Initialize with empty/default values for new agent
    this.agentData.name = '';
    this.agentData.alias = '';
    this.agentData.version = '1.0.0';
    this.agentData.type = '';
    this.agentData.description = '';
    this.agentData.cid = this.generateCID();
    this.agentData.creator = sessionStorage.getItem('username') || '';
    this.agentData.organization = sessionStorage.getItem('organization') || '';
    this.agentData.category = 'Agent';
    this.agentData.connection_details = '';
    this.agentData.extras_json = '{}';
    this.agentData.pipeline_id = null;
    this.agentData.jsonModelString = JSON.stringify(
      {
        name: '',
        version: '1.0.0',
        description: '',
        capabilities: [],
        configuration: {},
        locators: [],
        signature: {},
      },
      null,
      2
    );

    // Convert jsonModelString to script array for code editor
    this.script = [this.agentData.jsonModelString];
  }

  generateCID(): string {
    // Generate a random CID-like string
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'b';
    for (let i = 0; i < 61; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Module operations
  addModule(): void {
    if (this.newModuleName.trim()) {
      // Don't include id for new items - backend will assign
      this.agentData.modules.push({ name: this.newModuleName.trim() });
      this.newModuleName = '';
    }
  }

  removeModule(index: number): void {
    this.agentData.modules.splice(index, 1);
  }

  // Skill operations
  addSkill(): void {
    if (this.newSkillName.trim()) {
      // Don't include id for new items
      this.agentData.skills.push({ name: this.newSkillName.trim() });
      this.newSkillName = '';
    }
  }

  removeSkill(index: number): void {
    this.agentData.skills.splice(index, 1);
  }

  // Locator operations
  addLocator(): void {
    this.agentData.locators.push({
      locator_type: '',
      url: '',
    });
  }

  removeLocator(index: number): void {
    this.agentData.locators.splice(index, 1);
  }

  // Tool operations
  addTool(): void {
    this.agentData.tools.push({
      name: '',
      description: '',
      parameters: [],
    });
  }

  removeTool(index: number): void {
    this.agentData.tools.splice(index, 1);
  }

  addParameter(toolIndex: number): void {
    this.agentData.tools[toolIndex].parameters.push({
      name: '',
      type: 'string',
      description: '',
    });
  }

  removeParameter(toolIndex: number, paramIndex: number): void {
    this.agentData.tools[toolIndex].parameters.splice(paramIndex, 1);
  }

  // Resource operations
  addResource(): void {
    this.agentData.resources.push({
      name: '',
      description: '',
      url: '',
    });
  }

  removeResource(index: number): void {
    this.agentData.resources.splice(index, 1);
  }

  // Prompt operations
  addPrompt(): void {
    this.agentData.prompts.push({
      name: '',
      description: '',
    });
  }

  removePrompt(index: number): void {
    this.agentData.prompts.splice(index, 1);
  }

  // Domain operations
  addDomain(): void {
    if (this.newDomainName.trim()) {
      // Don't include id for new items
      this.agentData.domains.push({
        name: this.newDomainName.trim(),
        description: this.newDomainDescription.trim(),
      });
      this.newDomainName = '';
      this.newDomainDescription = '';
    }
  }

  removeDomain(index: number): void {
    this.agentData.domains.splice(index, 1);
  }

  // Sync operations
  addSync(): void {
    this.agentData.syncs.push({
      target: '',
      frequency: '',
      last_sync: new Date().toISOString(),
    });
  }

  removeSync(index: number): void {
    this.agentData.syncs.splice(index, 1);
  }

  // Publication operations
  addPublication(): void {
    this.agentData.publications.push({
      channel: '',
      published_date: new Date(),
      status: '',
    });
  }

  removePublication(index: number): void {
    this.agentData.publications.splice(index, 1);
  }

  // Extension operations
  addExtension(): void {
    this.agentData.extensions.push({
      key: '',
      value: '',
      description: '',
    });
  }

  removeExtension(index: number): void {
    this.agentData.extensions.splice(index, 1);
  }

  // Selector operations
  addSelector(): void {
    if (this.newSelectorKey.trim() && this.newSelectorValue.trim()) {
      this.agentData.selectors.push({
        key: this.newSelectorKey.trim(),
        value: this.newSelectorValue.trim(),
      });
      this.newSelectorKey = '';
      this.newSelectorValue = '';
    }
  }

  removeSelector(index: number): void {
    this.agentData.selectors.splice(index, 1);
  }

  // Signature operations
  addSignature(): void {
    // Always add an empty signature row to allow immediate inline editing
    this.agentData.signatures.push({
      algorithm: '',
      value: '',
      certificate: ''
    });
  }

  removeSignature(index: number): void {
    this.agentData.signatures.splice(index, 1);
  }

  // Navigation
  scrollToSection(sectionId: string): void {
    this.activeSection = sectionId;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleSection(sectionId: string): void {
    this.sectionStates[sectionId] = !this.sectionStates[sectionId];
  }

  // Actions
  updateAgent(): void {
    // Validate required fields
    if (
      !this.agentData.alias ||    
      !this.agentData.type 
     
    ) {
      this.service.message('Please fill all required fields', 'warning');
      return;
    }

    // Parse JSON model string to object
    let jsonModelObject = {};
    try {
      jsonModelObject = JSON.parse(this.agentData.jsonModelString);
    } catch (e) {
      console.warn('Invalid JSON model, using empty object:', e);
      jsonModelObject = {};
    }

    // Prepare the complete agent data payload with snake_case fields
    const agentData = {
      name: this.agentData.name,
      alias: this.agentData.alias,
      type: this.agentData.type,
      cid: this.agentData.cid,

      interface_type:
        this.agentData.type === 'MCP' || this.agentData.type === 'mcpServer'
          ? 'mcp-pipeline'
          : 'pipeline-agent',
      description: this.agentData.description,
      connection_details: this.agentData.connection_details || '',
      organization:
        this.agentData.organization || sessionStorage.getItem('organization'),
      last_modified_by: sessionStorage.getItem('username') || 'system',
      last_modified_date: new Date(),
      category: this.agentData.category || 'Agent',
      version: this.agentData.version,
      creator:
        this.agentData.creator ||
        sessionStorage.getItem('username') ||
        'system',
      extras_json: this.agentData.jsonModelString || JSON.stringify({}),
      pipeline_id: this.agentData.pipeline_id || null,

      // OASF Collections - preserve id fields for existing items
      modules: (this.agentData.modules || []).map((m) => {
        const module: any = { name: m.name };
        if (m.id) module.id = m.id; // Preserve id if exists
        return module;
      }),
      skills: (this.agentData.skills || []).map((s) => {
        const skill: any = { name: s.name };
        if (s.id) skill.id = s.id;
        return skill;
      }),
      domains: (this.agentData.domains || []).map((d) => {
        const domain: any = {
          name: d.name,
          description: d.description,
        };
        if (d.id) domain.id = d.id;
        return domain;
      }),
      locators: (this.agentData.locators || []).map((l) => {
        const locator: any = {
          locator_type: l.locator_type,
          url: l.url,
        };
        if (l.id) locator.id = l.id;
        return locator;
      }),
      syncs: (this.agentData.syncs || []).map((s) => {
        const sync: any = {
          target: s.target,
          frequency: s.frequency?.toUpperCase() || s.frequency,
          last_sync: s.last_sync,
        };
        if (s.id) sync.id = s.id;
        return sync;
      }),
      publications: (this.agentData.publications || []).map((p) => {
        const publication: any = {
          channel: p.channel,
          published_date: p.published_date,
          status: p.status,
        };
        if (p.id) publication.id = p.id;
        return publication;
      }),
      extensions: (this.agentData.extensions || []).map((e) => {
        const extension: any = {
          key: e.key,
          value: e.value,
          description: e.description,
          
        };
        if (e.id) extension.id = e.id;
        return extension;
      }),
      selectors: (this.agentData.selectors || []).map((s) => {
        const selector: any = {
          key: s.key,
          value: s.value,
        };
        if (s.id) selector.id = s.id;
        return selector;
      }),
      signatures: (this.agentData.signatures || []).map((s) => {
        const signature: any = {
          algorithm: s.algorithm,
          value: s.value,
          certificate: s.certificate,
        };
        if (s.id) signature.id = s.id;
        return signature;
      }),
      tools: (this.agentData.tools || []).map((t) => {
        const tool: any = {
          name: t.name,
          description: t.description,
          parameters: (t.parameters || []).map((p) => {
            const param: any = {
              name: p.name,
              type: p.type,
              description: p.description,
            };
            if (p.id) param.id = p.id; // Preserve parameter id
            return param;
          }),
        };
        if (t.id) tool.id = t.id; // Preserve tool id
        return tool;
      }),
      resources: (this.agentData.resources || []).map((r) => {
        const resource: any = {
          name: r.name,
          description: r.description,
          url: r.url,
        };
        if (r.id) resource.id = r.id;
        return resource;
      }),
      prompts: (this.agentData.prompts || []).map((p) => {
        const prompt: any = {
          name: p.name,
          description: p.description,
        };
        if (p.id) prompt.id = p.id;
        return prompt;
      }),
    };

    console.log('Saving agent:', agentData);

    // Call service based on mode (using API)
    if (this.editView) {
      // Update existing agent
      this.agentService.agentDirectoryUpdate(agentData).subscribe(
        (response) => {
          console.log('Agent updated successfully:', response);
          this.service.message('Agent directory updated successfully');
          this.navigateBack();
        },
        (error) => {
          console.error('Error updating agent:', error);
          const errorMessage =error?.details || 'Failed to update agent directory';
          this.service.message(errorMessage, 'error');
        }
      );
    } else if (this.addView) {
      // Create new agent
      this.agentService.createAgentDirectory(agentData).subscribe(
        (response) => {
          console.log('Agent created successfully:', response);
          this.service.message('Agent directory created successfully');
          this.navigateBack();
        },
        (error) => {
          console.error('Error creating agent:', error);
          const errorMessage =error?.details || 'Failed to create agent directory';
          this.service.message(errorMessage, 'error');
        }
      );
    }
  }

  cancel(): void {
    this.navigateBack();
  }

  navigateBack(): void {
    if (this.editView) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else if (this.addView) {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  }

  regenerateCID(): void {
    this.agentData.cid = this.generateCID();
    alert('CID regenerated');
  }

  onScriptChange($event) {
    // Convert script array back to string
    this.script = $event;
    if (Array.isArray($event)) {
      this.agentData.jsonModelString = $event.join('\n');
    } else {
      this.agentData.jsonModelString = $event;
    }

    // Also update extras_json when JSON model changes
    this.agentData.extras_json = this.agentData.jsonModelString;
  }

  private getAgentPipelineBasedOnType(): void {
    const interfacetype = this.mapTypeToInterfaceType(this.agentData.type);

    this.agentService
      .getUnregisteredPipelines(this.organization, interfacetype)
      .subscribe(
        (res) => {
          this.agentMcpPipelines = []; // Clear before populating
          if (res && Array.isArray(res) && res.length > 0) {
            this.agentMcpPipelines = res;
            this.assignedAgentMcpPipeline = this.agentMcpPipelines.find(
              (pipeline) => pipeline.cid === this.agentData.pipeline_id
            );
          }
        },
        (error) => {
          console.error('Error loading unregistered pipelines:', error);
          this.agentMcpPipelines = [];
          const errorMessage =error?.details || 'Failed to load unregistered pipelines';
          this.service.message(errorMessage, 'error');
        }
      );
  }

  private mapTypeToInterfaceType(type: string | undefined): string {
    if (!type) return 'pipeline-agent';
    if (type === 'mcpServer') return 'mcp-pipeline';
    return 'pipeline-agent';
  }

  private getAllListOfAgentMcpPipeline(): void {
    const params = this.buildHttpParams();

    this.service.getPipelinesCards(params).subscribe((res) => {
      this.agentMcpPipelines = [];
      if (res && Array.isArray(res) && res.length > 0) {
        res.forEach((element: any) => {
          this.agentMcpPipelines.push(element);
        });
        const assignedPipeline = this.agentMcpPipelines.find(
          (pipeline) => pipeline.cid === this.agentData.pipeline_id
        );
        // assignedPipeline may be undefined if not found
        this.assignedAgentMcpPipeline = assignedPipeline
          ? assignedPipeline.alias
          : '';
      } else {
        // No pipelines returned - clear state and show informational message
        this.agentMcpPipelines = [];
        this.assignedAgentMcpPipeline = '';
        this.service.message('No pipelines available for the selected type', 'info');
      }
    },
    (error) => {
      // Handle API errors gracefully
      console.error('Error fetching pipeline cards:', error);
      this.agentMcpPipelines = [];
      this.assignedAgentMcpPipeline = '';
      const errorMessage = error?.details || 'Failed to load pipelines';
      this.service.message(errorMessage, 'error');
    });
  }

  private buildHttpParams(): HttpParams {
    const interfacetype = this.mapTypeToInterfaceType(this.agentData.type);
    let params = new HttpParams()
      .set('project', this.organization)
      .set('isCached', 'true')
      .set('adapter_instance', 'internal')
      .set('interfacetype', interfacetype);
    return params;
  }
}
