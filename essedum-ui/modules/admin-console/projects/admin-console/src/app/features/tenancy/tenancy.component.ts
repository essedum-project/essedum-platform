import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import { LegacyOrganisation, LegacyProject, RbacEnvironment } from '../../core/api-models';
import { ProvisionDialogComponent, ProvisionKind } from './provision-dialog/provision-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

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

  readonly orgColumns = ['name', 'status', 'actions'];
  readonly projectColumns = ['name', 'organization', 'description', 'actions'];
  readonly environmentColumns = ['name', 'projectName', 'configRef'];

  rank = 0;

  constructor(
    private readonly api: ApiService,
    private readonly dialog: MatDialog,
    private readonly userContext: UserContextService,
  ) {}

  // Rank-gated create/delete buttons (server re-checks). 4=platform,3=org,2=project admin.
  get canCreateOrg(): boolean { return this.rank >= 4; }
  get canCreateProject(): boolean { return this.rank >= 3; }
  get canCreateEnv(): boolean { return this.rank >= 2; }
  get canDeleteOrg(): boolean { return this.rank >= 4; }
  get canDeleteProject(): boolean { return this.rank >= 3; }

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

  organizationName(project: LegacyProject): string {
    const org = this.organizations.find(o => o.id === project.organisationId);
    return org ? org.name : '—';
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

  deleteOrg(row: LegacyOrganisation): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: { title: 'Delete organization', message: `Delete organization "${row.name}"? This cannot be undone.` },
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }
      this.api.deleteOrganization(row.id, this.userContext.userId$.value).subscribe({
        next: () => this.loadOrgs(),
        error: err => alert(err?.error?.message || 'Could not delete this organization.'),
      });
    });
  }

  deleteProject(row: LegacyProject): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: { title: 'Delete project', message: `Delete project "${row.name}"? This cannot be undone.` },
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }
      this.api.deleteProject(row.id, this.userContext.userId$.value).subscribe({
        next: () => this.loadProjects(),
        error: err => alert(err?.error?.message || 'Could not delete this project.'),
      });
    });
  }
}
