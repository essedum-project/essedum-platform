import { Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import type { LegacyOrganisation, LegacyProject, LegacyPortfolio, DisplayOrg, RbacEnvironment } from '../../core/api-models';
import { ProvisionDialogComponent, ProvisionKind } from './provision-dialog/provision-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

interface EnvironmentRow extends RbacEnvironment {
  projectName: string;
}

@Component({
  selector: 'app-tenancy',
  templateUrl: './tenancy.component.html',
  styleUrls: ['./tenancy.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class TenancyComponent implements OnInit, AfterViewInit {
  /** Unified org list: RBAC orgs (usm_organisation) + legacy portfolios (usm_portfolio). */
  orgDataSource = new MatTableDataSource<DisplayOrg>([]);
  /** Raw RBAC orgs kept for delete and name-lookup. */
  organizations: LegacyOrganisation[] = [];
  projectDataSource = new MatTableDataSource<LegacyProject>([]);
  portfolios: LegacyPortfolio[] = [];
  envDataSource = new MatTableDataSource<EnvironmentRow>([]);

  @ViewChild('orgPaginator') orgPaginator!: MatPaginator;
  @ViewChild('projectPaginator') projectPaginator!: MatPaginator;
  @ViewChild('envPaginator') envPaginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.orgDataSource.paginator = this.orgPaginator;
    this.projectDataSource.paginator = this.projectPaginator;
    this.envDataSource.paginator = this.envPaginator;
  }

  readonly orgColumns = ['id', 'name', 'source', 'status', 'actions'];
  readonly projectColumns = ['id', 'name', 'organization', 'description', 'actions'];
  readonly environmentColumns = ['name', 'projectName', 'configRef'];

  private readonly tabIndexByName: Record<string, number> = { organizations: 0, projects: 1, environments: 2 };
  selectedTab = 0;

  rank = 0;

  constructor(
    private readonly api: ApiService,
    private readonly dialog: MatDialog,
    private readonly userContext: UserContextService,
    private readonly route: ActivatedRoute,
  ) {}

  // Rank-gated create/delete buttons (server re-checks). 4=platform,3=org,2=project admin.
  get canCreateOrg(): boolean { return this.rank >= 4; }
  get canCreateProject(): boolean { return this.rank >= 3; }
  get canCreateEnv(): boolean { return this.rank >= 2; }
  get canDeleteOrg(): boolean { return this.rank >= 4; }
  get canDeleteProject(): boolean { return this.rank >= 3; }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.selectedTab = this.tabIndexByName[params.get('tab') ?? ''] ?? 0;
    });
    const userId = this.userContext.userId$.value;
    this.api.getAccessContext(userId).subscribe(ctx => (this.rank = ctx?.highestRank ?? 0));
    this.loadOrgs();
    this.loadProjects();
    this.loadEnvironments();
  }

  private loadOrgs(): void {
    forkJoin([
      this.api.getOrganisations().pipe(catchError(() => of([] as any[]))),
      this.api.getPortfolios().pipe(catchError(() => of([] as any[]))),
    ]).subscribe(([orgs, portfolios]) => {
      this.organizations = orgs;
      this.portfolios = portfolios;
      this.buildDisplayOrgs();
    });
  }

  private buildDisplayOrgs(): void {
    const rbacRows: DisplayOrg[] = this.organizations.map(o => ({
      id: o.id, name: o.name, status: o.status, source: 'rbac' as const, rawOrg: o,
    }));
    const rbacNames = new Set(this.organizations.map(o => (o.name || '').toLowerCase()));
    const legacyRows: DisplayOrg[] = (this.portfolios || [])
      .filter(p => !rbacNames.has((p.portfolioName || '').toLowerCase()))
      .map(p => ({ id: p.id, name: p.portfolioName, status: p.status, source: 'legacy' as const }));
    this.orgDataSource.data = [...rbacRows, ...legacyRows]
      .sort((a, b) => (a.name || '').toLowerCase() > (b.name || '').toLowerCase() ? 1 : -1);
  }

  private loadProjects(): void {
    this.api.getProjects().subscribe(projects => (this.projectDataSource.data = projects));
  }

  organizationName(project: LegacyProject): string {
    const rbacOrg = this.organizations.find(o => o.id === project.organisationId);
    if (rbacOrg) return rbacOrg.name;
    // Fallback to portfolio name lookup if project was linked via legacy portfolioId
    return '—';
  }

  projectDisplayName(project: LegacyProject): string {
    return project.projectdisplayname || project.name;
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
      .subscribe(rows => (this.envDataSource.data = rows));
  }

  create(kind: ProvisionKind): void {
    const userId = this.userContext.userId$.value;
    const ref = this.dialog.open(ProvisionDialogComponent, { width: '460px', data: { kind } });
    ref.afterClosed().subscribe((r: any) => {
      if (!r) {
        return;
      }
      if (r.kind === 'organization') {
        this.api.createOrganization(userId, { name: r.name, status: r.status }).subscribe(() => {
          this.loadOrgs();
          window.dispatchEvent(new CustomEvent('essedum:tenancy-changed'));
        });
      } else if (r.kind === 'project') {
        this.api
          .createProject(userId, { name: r.name, description: r.description, organisationId: r.organisationId })
          .subscribe(() => {
            this.loadProjects();
            window.dispatchEvent(new CustomEvent('essedum:tenancy-changed'));
          });
      } else if (r.kind === 'environment') {
        this.api
          .createEnvironment(userId, { name: r.name, projectId: r.projectId, configRef: r.configRef })
          .subscribe(() => {
            this.loadEnvironments();
            window.dispatchEvent(new CustomEvent('essedum:tenancy-changed'));
          });
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
        next: () => { this.loadOrgs(); window.dispatchEvent(new CustomEvent('essedum:tenancy-changed')); },
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
        next: () => { this.loadProjects(); window.dispatchEvent(new CustomEvent('essedum:tenancy-changed')); },
        error: err => alert(err?.error?.message || 'Could not delete this project.'),
      });
    });
  }
}
