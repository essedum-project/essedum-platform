import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import { LegacyOrganisation, LegacyProject, RbacEnvironment } from '../../core/api-models';
import { ProvisionDialogComponent, ProvisionKind } from './provision-dialog/provision-dialog.component';

interface EnvironmentRow extends RbacEnvironment {
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

  rank = 0;

  constructor(
    private readonly api: ApiService,
    private readonly dialog: MatDialog,
    private readonly userContext: UserContextService,
  ) {}

  // Rank-gated create buttons (server re-checks). 4=platform,3=org,2=project admin.
  get canCreateOrg(): boolean { return this.rank >= 4; }
  get canCreateProject(): boolean { return this.rank >= 3; }
  get canCreateEnv(): boolean { return this.rank >= 2; }

  ngOnInit(): void {
    const userId = this.userContext.userId$.value;
    this.api.getAccessContext(userId).subscribe(ctx => (this.rank = ctx?.highestRank ?? 0));
    this.loadOrgs();
    this.loadProjects();
    this.loadEnvironments();
  }

  private loadOrgs(): void {
    this.api.getOrganisations().subscribe(orgs => (this.organizations = orgs));
  }

  private loadProjects(): void {
    this.api.getProjects().subscribe(projects => (this.projects = projects));
  }

  private loadEnvironments(): void {
    this.api
      .getProjects()
      .pipe(
        switchMap(projects => {
          if (projects.length === 0) {
            return of([] as EnvironmentRow[]);
          }
          return forkJoin(
            projects.map(project =>
              this.api.getEnvironments(project.id).pipe(
                switchMap(envs => of(envs.map(e => ({ ...e, projectName: project.name })))),
              ),
            ),
          ).pipe(switchMap(rows => of(rows.flat())));
        }),
      )
      .subscribe(rows => (this.environmentRows = rows));
  }

  create(kind: ProvisionKind): void {
    const userId = this.userContext.userId$.value;
    const ref = this.dialog.open(ProvisionDialogComponent, { width: '460px', data: { kind } });
    ref.afterClosed().subscribe((r: any) => {
      if (!r) {
        return;
      }
      if (r.kind === 'organization') {
        this.api.createOrganization(userId, { name: r.name, status: r.status }).subscribe(() => this.loadOrgs());
      } else if (r.kind === 'project') {
        this.api
          .createProject(userId, { name: r.name, description: r.description, organisationId: r.organisationId })
          .subscribe(() => this.loadProjects());
      } else if (r.kind === 'environment') {
        this.api
          .createEnvironment(userId, { name: r.name, projectId: r.projectId, configRef: r.configRef })
          .subscribe(() => this.loadEnvironments());
      }
    });
  }
}
