import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Services } from '@essedum/shared-lib';
import { ActivatedRoute, Router } from '@angular/router';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import { Location } from '@angular/common';
import { AgentDirectoryService } from '../agent-directory.service';

@Component({
    selector: 'app-agent-directory-view',
    templateUrl: './agent-directory-view.component.html',
    styleUrls: ['./agent-directory-view.component.scss'],
    standalone: false
})
export class AgentDirectoryViewComponent implements OnInit {
  isBackHovered: boolean = false;
  cardName: any;
  organisation: any;
  relatedloaded: boolean = false;
  lastRefreshedTime: Date | null = null;
  agentData: any = null;
  relatedVersions: any[] = [];

  relatedVersionsHeaders = [
    { key: 'version', label: 'Version' },
    { key: 'cid', label: 'CID' },
    { key: 'publishedDate', label: 'Published Date' },
    { key: 'creator', label: 'Creator' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _location: Location,
    private service: Services,
    private agentService: AgentDirectoryService
  ) {
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
