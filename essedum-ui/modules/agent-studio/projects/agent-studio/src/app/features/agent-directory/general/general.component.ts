import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { AgentDirectoryService } from '../agent-directory.service';
import { Services } from '@essedum/shared-lib';
import { HttpParams } from '@angular/common/http';

@Component({
    selector: 'app-general',
    templateUrl: './general.component.html',
    styleUrls: ['./general.component.scss'],
    standalone: false
})
export class GeneralComponent implements OnInit, OnChanges {
  @Input() agentData: any;

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
  modules: any[] = [];
  tools: any[] = [];
  resources: any[] = [];
  prompts: any[] = [];
  skills: any[] = [];
  locators: any[] = [];
  domains: any[] = [];
  syncs: any[] = [];
  publications: any[] = [];
  extensions: any[] = [];
  selectors: any[] = [];
  signatures: any[] = [];
  jsonModel: any = {};
  jsonModelString = '';
  jsonModelLines: string[] = [];
  activeSection = 'about';

  sectionStates: Record<string, boolean> = {
    about: true, modules: true, skills: true, selectors: true,
    domains: true, locators: true, syncs: true, publications: true,
    extensions: true, signatures: true, tools: true, resources: true, prompts: true,
  };

  toggleSection(id: string): void {
    this.sectionStates[id] = !this.sectionStates[id];
  }

  aboutDescription =
    'dirctl hub pull baeareia34eoebxwrxakvp1mtqrx3fjzqdklxorpkzyh7eqlzjker6cbcj4';

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

  resourcesHeaders = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'url', label: 'URL' },
  ];

  sectionTitles = {
    about: 'Basic Information',
    modules: 'Modules',
    skills: 'Skills',
    selectors: 'Selectors',
    domains: 'Domains',
    locators: 'Locators',
    syncs: 'Syncs',
    publications: 'Publications',
    extensions: 'Extensions',
    tools: 'Tools',
    resources: 'Resources',
    signatures: 'Signatures',
    prompts: 'Prompts'
  };

  toolSearchQuery = '';
  filteredTools: any[] = [];
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private agentService: AgentDirectoryService,
    private service: Services
  ) {}

  ngOnInit(): void {
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
    const fields = ['name', 'alias', 'type', 'description', 'cid', 'version', 'creator', 'organization'];
    fields.forEach(field => {
      this[field] = this.agentData[field] ?? this[field];
    });
  }

  private populateArrayFields(): void {
    this.skills = (this.agentData.skills ?? []).map((skill: any) =>
      typeof skill === 'string' ? { name: skill } : skill
    );
    
    const arrayFields = ['modules', 'domains', 'locators', 'syncs', 'publications', 
                         'extensions', 'selectors', 'signatures'];
    arrayFields.forEach(field => {
      this[field] = this.agentData[field] ?? [];
    });
  }

  private populateMcpFields(): void {
    const isMcpType = this.agentData.type === 'MCP' || this.agentData.type === 'mcpServer';
    if (isMcpType) {
      const mcpFields = ['tools', 'resources', 'prompts'];
      mcpFields.forEach(field => {
        this[field] = this.agentData[field] ?? [];
      });
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

  sortParameters(tool: any, column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    tool.parameters.sort((a: any, b: any) => {
      let aValue = a[column];
      let bValue = b[column];

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

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
