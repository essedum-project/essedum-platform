import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { combineLatest, take } from 'rxjs';
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

/** One entry of the Role filter: ranks 0 and 1 both display as "AI Engineer", so ids can be several. */
interface RoleFilterOption {
  /** Normalised rank (0/1 collapse to 1) — also the select value. */
  key: number;
  label: string;
  roleIds: number[];
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
  /** Deduplicated, non-legacy roles the current profile-switcher role may filter by. */
  roleOptions: RoleFilterOption[] = [];
  projects: LegacyProject[] = [];

  /** Current filter selections; null = "All". Both narrow the server-side query. */
  selectedRoleKey: number | null = null;
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
    return this.selectedRoleKey != null || this.selectedProjectId != null;
  }

  getDisplayRoleName(roleName: string): string {
    return RoleNameUtil.getDisplayNameByRoleName(roleName);
  }

  ngOnInit(): void {
    const actorUserId = this.userContext.userId$.value;

    this.api.getAccessContext(actorUserId)
      .subscribe(ctx => {
        this.rank = ctx?.highestRank ?? 0;
        this.refreshRoleOptions();
      });

    // Role dropdown: the server returns only the roles this actor may see.
    this.api.getRoles(actorUserId).subscribe(roles => {
      this.roles = roles;
      this.refreshRoleOptions();
    });
    // Project filter: only projects of the organisation selected in the profile switcher.
    this.api.getProjects().subscribe(projects => {
      const activeId = this.activeProjectId();
      const activeOrg = projects.find(p => p.id === activeId)?.organisationId ?? null;
      this.projects = activeOrg != null ? projects.filter(p => p.organisationId === activeOrg) : projects;
    });

    this.loadPage();
  }

  /**
   * Builds the Role dropdown: RBAC roles only (legacy usm_role entries have no rank), one entry per
   * display name, capped by the role selected in the profile thumbnail (falling back to the actor's
   * highest rank): platform admin → all four, org admin → up to Org Admin, project admin → up to
   * Project Admin, AI Engineer → AI Engineer only.
   */
  private refreshRoleOptions(): void {
    const cap = Math.max(this.activeRoleRank() ?? this.rank, 1);
    const byKey = new Map<number, RoleFilterOption>();
    for (const r of this.roles) {
      if (r.rank == null || r.rank > cap) {
        continue;
      }
      const key = Math.max(r.rank, 1);
      const opt = byKey.get(key)
        ?? { key, label: RoleNameUtil.getDisplayNameByRank(key), roleIds: [] };
      opt.roleIds.push(r.id);
      byKey.set(key, opt);
    }
    this.roleOptions = [...byKey.values()].sort((a, b) => a.key - b.key);
    if (this.selectedRoleKey != null && !byKey.has(this.selectedRoleKey)) {
      this.selectedRoleKey = null;
    }
  }

  private selectedRoleIds(): number[] | null {
    return this.roleOptions.find(o => o.key === this.selectedRoleKey)?.roleIds ?? null;
  }

  /** A filter change always returns to the first page and re-queries. */
  applyFilters(): void {
    this.pageIndex = 0;
    this.loadPage();
  }

  clearFilters(): void {
    this.selectedRoleKey = null;
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

  // projectId$/selectedRoleRank$ re-read sessionStorage on subscribe (synchronous), so the
  // list always follows whatever project/role is currently selected in the profile switcher.
  private activeProjectId(): number | null {
    let v: number | null = null;
    this.userContext.projectId$.pipe(take(1)).subscribe(x => (v = x));
    return v;
  }

  private activeRoleRank(): number | null {
    let v: number | null = null;
    this.userContext.selectedRoleRank$.pipe(take(1)).subscribe(x => (v = x));
    return v;
  }

  private loadPage(): void {
    const actorUserId = this.userContext.userId$.value;
    this.loading = true;
    this.refreshRoleOptions();
    this.api.getRoleAssignmentsPage(actorUserId, {
      activeProjectId: this.activeProjectId(),
      activeRoleRank: this.activeRoleRank(),
      roleIds: this.selectedRoleIds(),
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
