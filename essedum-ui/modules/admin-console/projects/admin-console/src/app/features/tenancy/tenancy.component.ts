import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { MockDataService } from '../../core/mock-data.service';
import { LegacyOrganisation, LegacyProject } from '../../core/api-models';
import { Environment } from '../../core/models';

interface EnvironmentRow extends Environment {
  projectName: string;
}

@Component({
  selector: 'app-tenancy',
  templateUrl: './tenancy.component.html',
  styleUrls: ['./tenancy.component.scss'],
  standalone: false,
})
export class TenancyComponent implements OnInit {
  organizations: LegacyOrganisation[] = [];
  projects: LegacyProject[] = [];
  environmentRows: EnvironmentRow[] = [];

  readonly orgColumns = ['name', 'status'];
  readonly projectColumns = ['name', 'description'];
  readonly environmentColumns = ['name', 'projectName', 'configRef'];

  constructor(
    private readonly api: ApiService,
    // Environments has no backend endpoint yet (no Environment entity exists
    // in sv/usm-service) — stays mock until §11 adds one.
    private readonly mockData: MockDataService,
  ) {}

  ngOnInit(): void {
    this.api.getOrganisations().subscribe(orgs => (this.organizations = orgs));
    this.api.getProjects().subscribe(projects => (this.projects = projects));

    this.mockData.environments$.subscribe(envs => {
      this.environmentRows = envs.map(e => ({
        ...e,
        projectName: this.mockData.projects$.value.find(p => p.id === e.projectId)?.name ?? 'Unknown',
      }));
    });
  }
}
