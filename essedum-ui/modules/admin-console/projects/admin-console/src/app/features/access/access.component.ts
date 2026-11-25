import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { combineLatest } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { RoleNameUtil } from '../../core/role-name.util';
import type { LegacyProject, RbacRole, RoleAssignmentView } from '../../core/api-models';
import { GrantRoleDialogComponent } from './grant-role-dialog/grant-role-dialog.component';
import { UserContextService } from '../../core/user-context.service';
import { NotificationService } from '../../core/notification.service';
import { ProvisionDialogComponent } from '../tenancy/provision-dialog/provision-dialog.component';

interface RoleAssignmentRow extends RoleAssignmentView {
  scopeLabel: string;
}

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AccessComponent implements OnInit {
  rows = new MatTableDataSource<RoleAssignmentRow>([]);
  rank = 0;

  /** Filter dropdown sources. */
  roles: RbacRole[] = [];
  projects: LegacyProject[] = [];

  /** Current filter selections; null = "All". Both narrow the server-side query. */
  selectedRoleId: number | null = null;
  selectedProjectId: number | null = null;

  /** Server-side paging state. */
  pageIndex = 0;
  pageSize = 5;
  totalElements = 0;
  loading = false;

  readonly columns = ['userName', 'roleName', 'scopeLabel', 'grantedAt', 'actions'];

  constructor(
    private readonly api: ApiService,
    private readonly dialog: MatDialog,
    private readonly userContext: UserContextService,
    private readonly notify: NotificationService,
  ) {}

  get canCreateRole(): boolean { return this.rank >= 4; }

  get hasActiveFilter(): boolean {
    return this.selectedRoleId != null || this.selectedProjectId != null;
  }

  getDisplayRoleName(roleName: string): string {
    return RoleNameUtil.getDisplayNameByRoleName(roleName);
  }

  ngOnInit(): void {
    const actorUserId = this.userContext.userId$.value;

    this.api.getAccessContext(actorUserId)
      .subscribe(ctx => (this.rank = ctx?.highestRank ?? 0));

    // Role dropdown: the server returns only the roles this actor may see.
    this.api.getRoles(actorUserId).subscribe(roles => (this.roles = roles));
    this.api.getProjects().subscribe(projects => (this.projects = projects));

    this.loadPage();
  }

  /** A filter change always returns to the first page and re-queries. */
  applyFilters(): void {
    this.pageIndex = 0;
    this.loadPage();
  }

  clearFilters(): void {
    this.selectedRoleId = null;
    this.selectedProjectId = null;
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPage();
  }

  createRole(): void {
    const userId = this.userContext.userId$.value;
    const ref = this.dialog.open(ProvisionDialogComponent, { width: '460px', data: { kind: 'role' } });
    ref.afterClosed().subscribe((r: any) => {
      if (!r) {
        return;
      }
      this.api.createRole(userId, { name: r.name, rank: r.rank }).subscribe({
        next: () => { this.notify.success('Role created successfully.'); this.loadPage(); },
        error: err => this.notify.error(err?.error?.message || 'Failed to create role.'),
      });
    });
  }

  private loadPage(): void {
    const actorUserId = this.userContext.userId$.value;
    this.loading = true;
    this.api.getRoleAssignmentsPage(actorUserId, {
      roleId: this.selectedRoleId,
      projectId: this.selectedProjectId,
      page: this.pageIndex,
      size: this.pageSize,
    }).subscribe({
      next: res => {
        // If the requested page fell out of range (e.g. after a revoke emptied it),
        // step back one page instead of showing an empty table.
        if (res.content.length === 0 && this.pageIndex > 0 && res.totalElements > 0) {
          this.pageIndex = this.pageIndex - 1;
          this.loadPage();
          return;
        }
        this.rows.data = res.content.map(v => this.toRow(v));
        this.totalElements = res.totalElements;
        this.pageIndex = res.page;
        this.pageSize = res.size;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.notify.error(err?.error?.message || 'Failed to load role assignments.');
      },
    });
  }

  private toRow(v: RoleAssignmentView): RoleAssignmentRow {
    return {
      ...v,
      roleName: this.getDisplayRoleName(v.roleName ?? 'unknown'),
      userName: v.userName ?? `User #${v.userId}`,
      scopeLabel: v.projectId
        ? `Project: ${v.projectName ?? '#' + v.projectId}`
        : v.organizationId
        ? `Organization: ${v.organizationName ?? '#' + v.organizationId}`
        : 'Platform',
    };
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
          this.loadPage();
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
        this.loadPage();
        window.dispatchEvent(new CustomEvent('essedum:assignments-changed'));
      },
      error: err => this.notify.error(err?.error?.message || 'Failed to revoke role assignment.'),
    });
  }
}
