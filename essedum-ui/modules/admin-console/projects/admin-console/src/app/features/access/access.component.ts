import { Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, map } from 'rxjs';
import { take } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from '../../core/api.service';
import { RoleNameUtil } from '../../core/role-name.util';
import type { LegacyOrganisation, LegacyProject, RbacRole, RoleAssignment, UserOption } from '../../core/api-models';
import { GrantRoleDialogComponent } from './grant-role-dialog/grant-role-dialog.component';
import { UserContextService } from '../../core/user-context.service';
import { NotificationService } from '../../core/notification.service';
import { ProvisionDialogComponent } from '../tenancy/provision-dialog/provision-dialog.component';

interface RoleAssignmentRow extends RoleAssignment {
  roleName: string;
  userName: string;
  scopeLabel: string;
  /** Organisation the grant belongs to (direct, or via the project's organisation). */
  orgId: number | null;
}

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AccessComponent implements OnInit, AfterViewInit {
  rows = new MatTableDataSource<RoleAssignmentRow>([]);
  rank = 0;

  /** Filter dropdown sources (same lists the grant-role dialog uses). */
  users: UserOption[] = [];
  roles: RbacRole[] = [];
  projects: LegacyProject[] = [];
  organisations: LegacyOrganisation[] = [];

  /** Current filter selections; null = "All". */
  selectedUserId: number | null = null;
  selectedRoleId: number | null = null;
  selectedOrgId: number | null = null;
  selectedProjectId: number | null = null;

  /** Projects narrowed to the selected organisation (all projects when none selected). */
  get filteredProjects(): LegacyProject[] {
    if (this.selectedOrgId == null) {
      return this.projects;
    }
    return this.projects.filter(p => p.organisationId === this.selectedOrgId);
  }

  private allRows: RoleAssignmentRow[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.rows.paginator = this.paginator;
  }

  readonly columns = ['userName', 'roleName', 'scopeLabel', 'grantedAt', 'actions'];

  constructor(
    private readonly api: ApiService,
    private readonly dialog: MatDialog,
    private readonly userContext: UserContextService,
    private readonly notify: NotificationService,
  ) {}

  get canCreateRole(): boolean { return this.rank >= 4; }

  get hasActiveFilter(): boolean {
    return this.selectedUserId != null || this.selectedRoleId != null
      || this.selectedOrgId != null || this.selectedProjectId != null;
  }

  getDisplayRoleName(roleName: string): string {
    return RoleNameUtil.getDisplayNameByRoleName(roleName);
  }

  ngOnInit(): void {
    this.api.getAccessContext(this.userContext.userId$.value)
      .subscribe(ctx => (this.rank = ctx?.highestRank ?? 0));

    // Same filtering/sorting as GrantRoleDialogComponent: only RBAC roles (rank defined),
    // hide AI Engineer (rank 1), sort lowest → highest rank.
    this.api.getRoles().subscribe(roles => {
      this.roles = roles
        .filter(r => r.rank != null)
        .filter(r => r.rank !== 1)
        .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
    });
    this.api.getUsers().subscribe(users => (this.users = users));
    this.api.getProjects().subscribe(projects => (this.projects = projects));
    this.api.getOrganisations()
      .subscribe(orgs => (this.organisations = orgs));

    this.load();
  }

  /** Re-applies the User / Role / Organisation / Project filters to the loaded rows. */
  applyFilters(): void {
    this.rows.data = this.allRows.filter(row =>
      (this.selectedUserId == null || row.userId === this.selectedUserId) &&
      (this.selectedRoleId == null || row.roleId === this.selectedRoleId) &&
      (this.selectedOrgId == null || row.orgId === this.selectedOrgId) &&
      (this.selectedProjectId == null || row.projectId === this.selectedProjectId),
    );
    this.paginator?.firstPage();
  }

  /** Changing the organisation drops a project selection that belongs to another org. */
  onOrgChange(): void {
    if (this.selectedProjectId != null && !this.filteredProjects.some(p => p.id === this.selectedProjectId)) {
      this.selectedProjectId = null;
    }
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedUserId = null;
    this.selectedRoleId = null;
    this.selectedOrgId = null;
    this.selectedProjectId = null;
    this.applyFilters();
  }

  createRole(): void {
    const userId = this.userContext.userId$.value;
    const ref = this.dialog.open(ProvisionDialogComponent, { width: '460px', data: { kind: 'role' } });
    ref.afterClosed().subscribe((r: any) => {
      if (!r) {
        return;
      }
      this.api.createRole(userId, { name: r.name, rank: r.rank }).subscribe({
        next: () => { this.notify.success('Role created successfully.'); this.load(); },
        error: err => this.notify.error(err?.error?.message || 'Failed to create role.'),
      });
    });
  }

  private load(): void {
    const actorUserId = this.userContext.userId$.value;
    // Session context: the shell writes the active user/project/org into
    // sessionStorage, and UserContextService re-reads it on every subscription,
    // so pass those ids through to scope the server-side query.
    combineLatest([this.userContext.orgId$, this.userContext.projectId$])
      .pipe(take(1))
      .subscribe(([organizationId, projectId]) => {
        combineLatest([
          this.api.getRoleAssignments(actorUserId, { userId: actorUserId, organizationId, projectId }),
          this.api.getRoles(),
          this.api.getUsers(),
          this.api.getProjects(),
          this.api.getOrganisations(),
        ])
          .pipe(
            map(([assignments, roles, users, projects, organisations]) =>
              assignments
                .filter(a => !a.revokedAt)
                .map(a => ({
                  ...a,
                  orgId: a.organizationId
                    ?? projects.find(p => p.id === a.projectId)?.organisationId
                    ?? null,
                  roleName: this.getDisplayRoleName(roles.find(r => r.id === a.roleId)?.name ?? 'unknown'),
                  userName: users.find((u: UserOption) => u.id === a.userId)?.name ?? `User #${a.userId}`,
                  scopeLabel: a.projectId
                    ? `Project: ${projects.find(p => p.id === a.projectId)?.name ?? '#' + a.projectId}`
                    : a.organizationId
                    ? `Organization: ${organisations.find(o => o.id === a.organizationId)?.name ?? '#' + a.organizationId}`
                    : 'Platform',
                })),
            ),
          )
          .subscribe(rows => {
            this.allRows = rows;
            this.applyFilters();
          });
      });
  }

  grantRole(): void {
    const ref = this.dialog.open(GrantRoleDialogComponent, { width: '480px' });
    ref.afterClosed().subscribe((result: {
      userId: number; roleId: number; organizationId: number | null;
      projectIds: number[]; isLegacyOrg?: boolean;
    } | undefined) => {
      if (!result) {
        return;
      }
      const actorUserId = this.userContext.userId$.value;
      const projectIds = result.projectIds.length ? result.projectIds : [null];
      const grants = projectIds.map(projectId =>
        this.api.grantRole({
          userId: result.userId,
          roleId: result.roleId,
          // Legacy portfolio-scoped grants: pass organizationId as the portfolio id.
          // The backend stores it in rbac_role_assignment and resync bridges it.
          organizationId: result.organizationId,
          projectId,
          actorUserId,
        }),
      );
      combineLatest(grants).subscribe({
        next: () => {
          this.notify.success('Role granted successfully.');
          this.load();
          window.dispatchEvent(new CustomEvent('essedum:assignments-changed'));
        },
        error: err => this.notify.error(err?.error?.message || 'Failed to grant role.'),
      });
    });
  }

  revoke(row: RoleAssignmentRow): void {
    this.api.revokeRoleAssignment(row.id, this.userContext.userId$.value).subscribe({
      next: () => {
        this.notify.warning('Role assignment revoked.');
        this.load();
        window.dispatchEvent(new CustomEvent('essedum:assignments-changed'));
      },
      error: err => this.notify.error(err?.error?.message || 'Failed to revoke role assignment.'),
    });
  }
}
