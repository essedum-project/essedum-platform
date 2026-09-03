import {
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Services, EventBusService } from '@essedum/shared-lib';
import { Router } from '@angular/router';
import { AgentDirectoryService } from '../agent-directory.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-agent-directory-create',
    templateUrl: './agent-directory-create.component.html',
    styleUrls: ['./agent-directory-create.component.scss'],
    standalone: false
})
export class AgentDirectoryCreateComponent implements OnInit {
  @Output() responseLink = new EventEmitter<any>();
  @Output() modalClosed = new EventEmitter<void>();

  name = '';
  description = '';
  type: any;
  selectedPipeline: any;
  options = [];
  agentMcpPipelines = [];
  edit: boolean = false;
  errFlag: boolean = false;
  isAuth: any = false;
  organization = '';
  pipelineMode: any;

  // LLM configuration fields
  llmProvider = '';
  llmModel = '';
  llmProviders: Array<{ value: string; label: string }> = [
    { value: 'ollama',       label: 'Ollama' },
    { value: 'azure_openai', label: 'Azure OpenAI' },
    { value: 'anthropic',    label: 'Anthropic' },
  ];
  llmModels: Array<{ value: string; label: string }> = [
    { value: 'qwen3:4b',                    label: 'qwen3:4b' },
    { value: 'gpt-4o-mini',                 label: 'gpt-4o-mini' },
    { value: 'claude-3-5-sonnet-20241022',  label: 'claude-3.5-sonnet' },
  ];

  constructor(
    public dialogRef: MatDialogRef<AgentDirectoryCreateComponent>,
    public dialog: MatDialog,
    private service: Services,
    private agentService: AgentDirectoryService,
    private router: Router,
    private eventBus: EventBusService,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.organization = sessionStorage.getItem('organization');
    this.authentications();
    this.loadAgentTypes();
    this.pipelineMode = this.mapTypeToInterfaceType(this.type);
    this.getAgentPipelineDetailsByType();
    this.loadLiteLLMModels();

    if (this.data) {
      if (this.data.edit) {
        this.edit = this.data.edit;
      }
      if (this.data.agentData) {
        if (this.data.agentData.name) {
          this.name = this.data.agentData.name;
        }
        if (this.data.agentData.type) {
          this.type = this.data.agentData.type;
        }
        if (this.data.agentData.description) {
          this.description = this.data.agentData.description;
        }
        if (this.data.agentData.selectedPipeline) {
          this.selectedPipeline = this.data.agentData.selectedPipeline;
        }
      }
    }
  }

  authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      if (cipAuthority.includes('edit')) this.isAuth = false;
    });
  }

  loadAgentTypes() {
    // Default agent types - can be extended based on API
    this.options = [
      { viewValue: 'Agent', value: 'AIAgent' },
      { viewValue: 'MCP Server', value: 'mcpServer' },
    ];
    this.type = this.options[0].value;
  }

  saveDetails() {
    try {
      if (this.type && this.name.length) {
        const interfaceType = this.mapTypeToInterfaceType(this.type);

        const currentDate = new Date().toISOString();
        const currentUser = sessionStorage.getItem('username') || 'admin';

        const agentData: any = {
          alias: this.name,
          organization: sessionStorage.getItem('organization'),
          interface_type: interfaceType,
          description: this.description || '',
          type: this.type,
          status: 'ACTIVE',
          createdBy: currentUser,
          createdDate: currentDate,
          updatedBy: currentUser,
          updatedDate: currentDate,
          pipeline_id: this.selectedPipeline,
          category: this.type === 'mcpServer' ? 'MCPSERVER' : 'AGENT',
          tools: [],
          prompts: [],
          resources: [],
        };

        // Include LLM config if selected
        if (this.llmProvider || this.llmModel) {
          agentData['llm_config'] = { provider: this.llmProvider, model: this.llmModel };
        }

        const doSave = () => {
          this.agentService.saveAgentDirectory(agentData).subscribe(
            (response) => {
              const agentId = response?.body?.id ?? response?.body?.name ?? agentData.alias;
              this.eventBus.emit({ type: 'AGENT_DEPLOYED', payload: { agentId } });
              this.responseLink.emit(response.body);
              this.service.message('Agent Directory Created Successfully.', 'success');
              this.dialogRef.close(response.body);
              if (!this.data?.edit) this.modalClosed.emit();
            },
            (error) => {
              console.error('Error creating agent:', error);
              this.service.message(error?.details || 'Failed to create agent directory', 'error');
            }
          );
        };

        // Salus safety check on the description before saving
        const salusUrl = (environment as any).salusUrl ?? '';
        if (salusUrl && this.description.trim()) {
          this.runSalusCheck(this.description, salusUrl).then(safe => {
            if (!safe) {
              this.service.message('Description flagged by Salus safety filter. Please revise.', 'error');
              return;
            }
            doSave();
          });
        } else {
          doSave();
        }
      } else {
        this.errFlag = true;
      }
    } catch (Exception) {
      this.service.message('Some error occurred', 'error');
    }
  }

  editDetails() {
    try {
      const agentData = {
        ...this.data.agentData,
        name: this.name,
        alias: this.name,
        description: this.description,
        type: this.type,
        updatedAt: new Date().toISOString(),
      };

      this.responseLink.emit(agentData);
      this.service.message('Agent Directory Updated Successfully', 'success');
      this.dialogRef.close(agentData);
    } catch (Exception) {
      this.service.message('Some error occurred', 'error');
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  changeType() {
    this.agentMcpPipelines = [];
    this.selectedPipeline = null; 
    this.pipelineMode = this.mapTypeToInterfaceType(this.type);

    this.getAgentPipelineDetailsByType();
  }

  omit_special_char(event) {
    var k = event.charCode;
    return this.isValidLetter(k);
  }

  isValidLetter(k) {
    return (
      (k >= 65 && k <= 90) ||
      (k >= 97 && k <= 122) ||
      (k >= 48 && k <= 57) ||
      [8, 9, 13, 16, 17, 20, 32, 95].indexOf(k) > -1
    );
  }

  /** Fetch models from LiteLLM and merge them into the llmModels dropdown. */
  private loadLiteLLMModels(): void {
    const litellmUrl = (environment as any).litellmUrl ?? '/litellm/';
    if (!litellmUrl) return;
    const url = `${litellmUrl.replace(/\/$/, '')}/v1/models`;
    this.http.get<any>(url).subscribe({
      next: (resp) => {
        const data = resp?.data ?? resp?.models ?? resp ?? [];
        if (!Array.isArray(data)) return;
        const fetched = data
          .map((m: any) => {
            const id = m?.id ?? m?.model ?? m?.name ?? '';
            return id ? { value: id, label: id } : null;
          })
          .filter(Boolean) as Array<{ value: string; label: string }>;
        if (!fetched.length) return;
        // Merge, deduplicating by value
        const existing = new Set(this.llmModels.map(m => m.value));
        const newModels = fetched.filter(m => !existing.has(m.value));
        if (newModels.length) this.llmModels = [...this.llmModels, ...newModels];
        // Add LiteLLM provider entry if not already present
        if (!this.llmProviders.find(p => p.value === 'litellm')) {
          this.llmProviders = [...this.llmProviders, { value: 'litellm', label: 'LiteLLM' }];
        }
      },
      error: () => { /* keep hardcoded fallback silently */ },
    });
  }

  /** Returns true if the text is safe (or Salus unreachable), false if flagged. */
  private async runSalusCheck(text: string, salusUrl: string): Promise<boolean> {
    try {
      const url = `${salusUrl.replace(/\/$/, '')}/api/v1/scan`;
      const resp = await this.http.post<any>(url, { text }).toPromise();
      if (resp?.flagged === true || resp?.safe === false) return false;
      return true;
    } catch {
      return true; // fail open
    }
  }

  private getAgentPipelineDetailsByType(): void {
    const interfacetype = this.mapTypeToInterfaceType(this.type);

    this.agentService
      .getUnregisteredPipelines(this.organization, interfacetype)
      .subscribe(
        (res) => {
          this.agentMcpPipelines = []; // Clear before populating
          if (res && Array.isArray(res) && res.length > 0) {
            this.agentMcpPipelines = res;
          }
        },
        (error) => {
          console.error('Error loading unregistered pipelines:', error);
          this.agentMcpPipelines = [];
          const errorMessage =
              error?.details || 'Failed to load unregistered pipelines';
          this.service.message(errorMessage, 'error');
        }
      );
  }

  /**
   * Map DB `type` values to API `interfacetype` values
   * DB types: 'AIAgent' and 'mcpServer'
   * Interface types: 'pipeline-agent' and 'mcp-pipeline'
   */
  private mapTypeToInterfaceType(type: string | undefined): string {
    if (!type) return 'pipeline-agent';
    if (type === 'mcpServer') return 'mcp-pipeline';
    return 'pipeline-agent';
  }
}