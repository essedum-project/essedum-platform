import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Services } from '../../services/service';
import { ActivatedRoute, Router } from '@angular/router';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import { Location } from '@angular/common';
import { AgentDirectoryService } from '../agent-directory.service';

@Component({
  selector: 'app-agent-directory-view',
  templateUrl: './agent-directory-view.component.html',
  styleUrls: ['./agent-directory-view.component.scss'],
})
export class AgentDirectoryViewComponent implements OnInit {
  edit: boolean = false;
  connectionName: any;
  data: any;
  typeOptions = [];
  datasourceTypes: any;
  uischema: any;
  attributes: any;
  keys: any[];
  sourceType: any;
  category: any;
  renderers = angularMaterialRenderers;
  schema: any;
  formData: any;
  type: any;
  datasourceports: any;
  datasourceportsjson: any;
  isBackHovered: boolean = false;
  connectionDetails = {};
  isCdFull: boolean = false;
  view: boolean = false;
  isVaultEnabled: boolean = false;
  testSuccessful: boolean = false;
  extras = { apispec: {}, apispectemplate: {} };
  apiSpecTemplate: '';
  extasforAPIspec: any;
  apispec: any;
  component: any = [];
  relatedComponent: any;
  ConnectionUnlink: boolean;
  capability: string[] = [];
  capabilityPromise: Promise<boolean>;
  relatedloaded: boolean = false;
  linkAuth: boolean = false;
  cardName: any;
  organisation: any;
  hideDetails: boolean = true;
  portDetails: any;
  portPayload: any;
  agentMcpPipelines = [];
  assignedAgentMcpPipeline: string = '';
  capabilityOptions = [
    { viewValue: 'Data', value: 'dataset' },
    { viewValue: 'Runtime', value: 'runtime' },
    { viewValue: 'Model', value: 'model' },
    { viewValue: 'Adapter', value: 'adapter' },
    { viewValue: 'Prompt Provider', value: 'promptprovider' },
    { viewValue: 'Endpoint', value: 'endpoint' },
    { viewValue: 'App', value: 'app' },
  ];
  initiativeView: boolean;
  lastRefreshedTime: Date | null = null;
  agentData: any = null;
  relatedVersions: any[] = [];

  // Dynamic table headers for Related Versions
  relatedVersionsHeaders = [
    { key: 'version', label: 'Version' },
    { key: 'cid', label: 'CID' },
    { key: 'publishedDate', label: 'Published Date' },
    { key: 'creator', label: 'Creator' },
  ];

  constructor(
    private Services: Services,
    private route: ActivatedRoute,
    private router: Router,
    private _location: Location,
    private cdRef: ChangeDetectorRef,
    private service: Services,
    private agentService: AgentDirectoryService
  ) {
    // Support both route params and query params for the agent name
    this.route.params.subscribe((params) => {
      if (params['name']) {
        this.cardName = params['name'];
        this.organisation =
          params['org'] || sessionStorage.getItem('organization');
        this.loadAgentData(this.cardName);
      }
    });

    this.route.queryParams.subscribe((params) => {
      if (params['name']) {
        this.cardName = params['name'];
        this.organisation =
          params['org'] || sessionStorage.getItem('organization');
        this.loadAgentData(this.cardName);
      }
    });
  }

  reload($event: any) {
    if ($event) {
      this.ngOnInit();
    }
  }

  refeshrelated(event: any) {
    this.relatedloaded = false;
    setTimeout(() => {
      this.ngOnInit();
    }, 1000);
  }

  ngOnInit() {
    this.organisation = sessionStorage.getItem('organization');

    if (this.cardName) {
      this.loadAgentData(this.cardName);
    }
  }

  loadAgentData(name: string): void {
    if (!name) return;
    const org = this.organisation || sessionStorage.getItem('organization');
    this.agentService.getAgentDirectory(name, org).subscribe(
      (response) => {
        this.agentData = response;
        this.lastRefreshedTime = new Date();
      },
      (error) => {
        console.error('Error loading agent data:', error);
        const errorMessage = error?.details || 'Failed to load agent directory';
        this.service.message(errorMessage, 'error');
      }
    );
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }

    return 0;
  }

  navigateToVersion(agent: any): void {
    this.router.navigate(['../view', agent.alias || agent.name], {
      relativeTo: this.route,
    });
  }

  navigateBack() {
    this._location.back();
  }
}
