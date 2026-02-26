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
import { Services } from '../../services/service';
import { Router } from '@angular/router';
import { AgentDirectoryService } from '../agent-directory.service';

@Component({
  selector: 'app-agent-directory-create',
  templateUrl: './agent-directory-create.component.html',
  styleUrls: ['./agent-directory-create.component.scss'],
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

  constructor(
    public dialogRef: MatDialogRef<AgentDirectoryCreateComponent>,
    public dialog: MatDialog,
    private service: Services,
    private agentService: AgentDirectoryService,
    private router: Router,
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

        const agentData = {
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

        // Call real API to create agent
        this.agentService.saveAgentDirectory(agentData).subscribe(
          (response) => {
            this.responseLink.emit(response.body);
            this.service.message(
              'Agent Directory Created Successfully.',
              'success'
            );
            this.dialogRef.close(response.body);

            if (!this.data?.edit) {
              this.modalClosed.emit();
            }
          },
          (error) => {
            console.error('Error creating agent:', error);
            const errorMessage =
              error?.details || 'Failed to create agent directory';
            this.service.message(errorMessage, 'error');
          }
        );
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