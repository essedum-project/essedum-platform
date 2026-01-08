import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { AgentDirectoryService } from '../agent-directory.service';
import { Services } from '../../services/service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
})
export class GeneralComponent implements OnInit, OnChanges {
  @Input() agentData: any;

  // General Information (fallback defaults)
  name = 'Agent Name';
  alias = 'agent-alias';
  type = 'Agent';
  description =
    'Build multimodal language agents for fast prototype and production';
  cid = 'baeareia34eoebxwrxakvp1mtqrx3fjzqdklxorpkzyh7eqlzjker6cbcj4';
  version = '1.0.0';
  creator = 'om-ai-lab';
  organization = 'OmAgent Team';
  agentMcpPipelines = [];
  assignedAgentMcpPipeline: string = '';

  // Modules data
  modules: any[] = [];

  // Tools data (dynamic - loaded from agentData)
  tools: any[] = [];

  // Resources data (dynamic - loaded from agentData)
  resources: any[] = [];

  // Prompts data (dynamic - loaded from agentData)
  prompts: any[] = [];

  // Skills data
  skills: any[] = [];

  // Locators data (dynamic - loaded from agentData)
  locators: any[] = [];

  // Domains data (dynamic - loaded from agentData)
  domains: any[] = [];

  // Syncs data (dynamic - loaded from agentData)
  syncs: any[] = [];

  // Publications data (dynamic - loaded from agentData)
  publications: any[] = [];

  // Extensions data (dynamic - loaded from agentData)
  extensions: any[] = [];

  // Selectors data (dynamic - loaded from agentData)
  selectors: any[] = [];

  // Signatures data (dynamic - loaded from agentData)
  signatures: any[] = [];

  // JSON Model data (dynamic only)
  jsonModel: any = {};

  // For editor display
  jsonModelString = '';
  jsonModelLines: string[] = [];

  activeSection = 'about';
  aboutDescription =
    'dirctl hub pull baeareia34eoebxwrxakvp1mtqrx3fjzqdklxorpkzyh7eqlzjker6cbcj4';

  // Dynamic table headers
  locatorsHeaders = [
    { key: 'locator_type', label: 'Type' },
    { key: 'url', label: 'URL' },
  ];

  syncsHeaders = [
    { key: 'target', label: 'Target' },
    { key: 'frequency', label: 'Frequency' },
    { key: 'last_sync', label: 'Last Sync' },
  ];

  publicationsHeaders = [
    { key: 'channel', label: 'Channel' },
    { key: 'published_date', label: 'Published Date' },
    { key: 'status', label: 'Status' },
  ];

  extensionsHeaders = [
    { key: 'ext_key', label: 'Key' },
    { key: 'ext_value', label: 'Value' },
    { key: 'description', label: 'Description' },
  ];

  parametersHeaders = [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'description', label: 'Description' },
  ];

  // Search and filter
  toolSearchQuery = '';
  filteredTools: any[] = [];

  // Sort state for parameters table
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private agentService: AgentDirectoryService,
    private service: Services
  ) {}

  ngOnInit(): void {
    // Populate UI from input if available
    this.organization = sessionStorage.getItem('organization');

    this.populateFromAgentData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['agentData']) {
      this.populateFromAgentData();
    }
  }

  private populateFromAgentData(): void {
    if (!this.agentData) {
      this.jsonModel = null;
    } else {
      this.populateBasicFields();
      this.populateArrayFields();
      this.populateMcpFields();
      this.populateJsonModel();
    }

    this.updateJsonModelStrings();
    this.filteredTools = [...this.tools];
    this.getAllListOfAgentMcpPipeline();
  }

  private populateBasicFields(): void {
    this.name = this.agentData.name || this.name;
    this.alias = this.agentData.alias || this.alias;
    this.type = this.agentData.type || this.type;
    this.description = this.agentData.description || this.description;
    this.cid = this.agentData.cid || this.cid;
    this.version = this.agentData.version || this.version;
    this.creator = this.agentData.creator || this.creator;
    this.organization = this.agentData.organization || this.organization;
  }

  private populateArrayFields(): void {
    this.modules = this.agentData.modules || [];
    this.skills = (this.agentData.skills || []).map((skill: any) =>
      typeof skill === 'string' ? { name: skill } : skill
    );
    this.domains = this.agentData.domains || [];
    this.locators = this.agentData.locators || [];
    this.syncs = this.agentData.syncs || [];
    this.publications = this.agentData.publications || [];
    this.extensions = this.agentData.extensions || [];
    this.selectors = this.agentData.selectors || [];
    this.signatures = this.agentData.signatures || [];
  }

  private populateMcpFields(): void {
    const isMcpType = this.agentData.type === 'MCP' || this.agentData.type === 'mcpServer';
    if (isMcpType) {
      this.tools = this.agentData.tools || [];
      this.resources = this.agentData.resources || [];
      this.prompts = this.agentData.prompts || [];
    }
  }

  private populateJsonModel(): void {
    const jsonModelData = this.agentData.extras_json;
    
    if (!jsonModelData) {
      this.jsonModel = null;
      return;
    }

    if (typeof jsonModelData === 'string') {
      this.jsonModel = this.parseJsonString(jsonModelData);
    } else {
      this.jsonModel = jsonModelData;
    }
  }

  private parseJsonString(data: string): any {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Error parsing JSON model:', e);
      return { raw: data };
    }
  }

  private updateJsonModelStrings(): void {
    if (this.jsonModel) {
      this.jsonModelString = JSON.stringify(this.jsonModel, null, 2);
      this.jsonModelLines = [this.jsonModelString];
    } else {
      this.jsonModelString = '';
      this.jsonModelLines = [];
    }
  }

  // Search tools by name
  searchTools(): void {
    const query = this.toolSearchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredTools = [...this.tools];
    } else {
      this.filteredTools = this.tools.filter((tool) =>
        tool.name.toLowerCase().includes(query)
      );
    }
  }

  // Sort parameters table
  sortParameters(tool: any, column: string): void {
    if (this.sortColumn === column) {
      // Toggle direction if same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    tool.parameters.sort((a: any, b: any) => {
      let aValue = a[column];
      let bValue = b[column];

      // Convert to lowercase for string comparison
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Get sort icon for column
  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'unfold_more';
    return this.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  scrollToSection(sectionId: string): void {
    this.activeSection = sectionId;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }

  downloadJson(): void {
    const dataStr = JSON.stringify(this.jsonModel, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'general-model.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  private mapTypeToInterfaceType(type: string | undefined): string {
    if (!type) return 'pipeline-agent';
    if (type === 'mcpServer') return 'mcp-pipeline';
    return 'pipeline-agent';
  }

  private getAllListOfAgentMcpPipeline(): void {
    const params = this.buildHttpParams();

    this.service.getPipelinesCards(params).subscribe(
      (res) => {
        this.agentMcpPipelines = [];
        if (res && Array.isArray(res) && res.length > 0) {
          res.forEach((element: any) => {
            this.agentMcpPipelines.push(element);
          });
          const assignedPipeline = this.agentMcpPipelines.find(
            (pipeline) => pipeline.cid === this.agentData.pipeline_id
          );
          this.assignedAgentMcpPipeline = assignedPipeline
            ? assignedPipeline.alias
            : '';
        } else {
          // No pipelines available
          this.agentMcpPipelines = [];
          this.assignedAgentMcpPipeline = '';
          this.service.message('No pipelines available for the selected type', 'info');
        }
      },
      (error) => {
        console.error('Error fetching pipeline cards:', error);
        this.agentMcpPipelines = [];
        this.assignedAgentMcpPipeline = '';
        const errorMessage = error?.details || 'Failed to load pipelines';
        this.service.message(errorMessage, 'error');
      }
    );
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
