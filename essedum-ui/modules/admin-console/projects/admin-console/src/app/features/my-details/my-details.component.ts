import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { combineLatest, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import type { RoleAssignment, RbacRole, LegacyOrganisation, LegacyProject } from '../../core/api-models';
import { MenuPickerDialogComponent } from './menu-picker-dialog/menu-picker-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

export interface RoleCard {
  // All assignment ids that share this role+project+org combo (duplicates).
  // We show one card but track all ids so we can revoke all of them.
  ids: number[];
  roleName: string;
  /** null means legacy role (no RBAC rank); 0-4 means RBAC role at that rank level. */
  roleRank: number | null;
  orgName: string | null;
  projectName: string | null;
  projectId: number | null;
  grantedAt: string;
  revoking: boolean;
  /** 'rbac' = from rbac_role_assignment; 'legacy' = from usm_user_project_role only */
  source: 'rbac' | 'legacy';
}

@Component({
  selector: 'app-my-details',
  templateUrl: './my-details.component.html',
  styleUrls: ['./my-details.component.scss'],
  standalone: false,
  encapsulation: ViewEncapsulation.None,
})
export class MyDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  cards: RoleCard[] = [];
  loading = true;
  user: any = {};

  filterRole = '';
  filterOrg = '';
  filterProject = '';

  tableDataSource = new MatTableDataSource<RoleCard>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly tableColumns = ['role', 'org', 'project', 'user', 'granted', 'actions'];

  get filteredCards(): RoleCard[] {
    const r = this.filterRole.toLowerCase();
    const o = this.filterOrg.toLowerCase();
    const p = this.filterProject.toLowerCase();
    return this.cards.filter(c =>
      (!r || c.roleName.toLowerCase().includes(r)) &&
      (!o || (c.orgName || '').toLowerCase().includes(o)) &&
      (!p || (c.projectName || '').toLowerCase().includes(p))
    );
  }

  syncTableData(): void {
    this.tableDataSource.data = this.filteredCards;
  }

  ngAfterViewInit(): void {
    this.tableDataSource.paginator = this.paginator;
  }

  private readonly onAssignmentsChanged = () => this.load();

  constructor(
    private readonly api: ApiService,
    private readonly dialog: MatDialog,
    private readonly userContext: UserContextService,
  ) {}

  ngOnInit(): void {
    try { this.user = JSON.parse(sessionStorage.getItem('user') || '{}'); } catch {}
    this.load();
    // Refresh when any other component (e.g. Access page) grants or revokes a role
    window.addEventListener('essedum:assignments-changed', this.onAssignmentsChanged);
  }

  ngOnDestroy(): void {
    window.removeEventListener('essedum:assignments-changed', this.onAssignmentsChanged);
  }

  refresh(): void { this.load(); }

  get initials(): string {
    return ((this.user?.user_f_name || '')[0] || '') + ((this.user?.user_l_name || '')[0] || '');
  }

  get fullName(): string {
    return [this.user?.user_f_name, this.user?.user_l_name].filter(Boolean).join(' ') || 'User';
  }

  private load(): void {
    const userId = this.userContext.userId$.value;
    const userLogin: string = this.user?.user_login ?? '';

    combineLatest([
      this.api.getRoleAssignments(userId),
      this.api.getRoles(),
      this.api.getOrganisations(),
      this.api.getProjects(),
      // Also fetch legacy assignments — fall back to empty on error (old endpoint may be unavailable)
      userLogin
        ? this.api.getLegacyUserAssignments(userLogin).pipe(catchError(() => of({})))
        : of({}),
    ]).pipe(
      map(([assignments, roles, orgs, projects, legacyMap]) => {
        const roleMap = new Map<number, RbacRole>(roles.map(r => [r.id, r]));
        const orgMap = new Map<number, string>(orgs.map(o => [o.id, o.name]));
        const projMap = new Map<number, LegacyProject>(projects.map(p => [p.id, p]));

        // Deduplicate: key = roleName(lower)|projectId|orgId — catches RBAC + legacy duplicates
        const seen = new Map<string, RoleCard>();

        // ── Source 1: RBAC assignments ──
        for (const a of assignments.filter(a => !a.revokedAt)) {
          const role = roleMap.get(a.roleId);
          const roleName = role?.name ?? `Role #${a.roleId}`;
          const orgName = a.organizationId != null ? (orgMap.get(a.organizationId) ?? `Org #${a.organizationId}`) : null;
          const proj = a.projectId != null ? projMap.get(a.projectId) : null;
          // Prefer human-readable display name (what the shell thumbnail shows) over internal name.
          const projectName = proj?.projectdisplayname
            || proj?.portfolioId?.portfolioName
            || proj?.name
            || (a.projectId != null ? `Project #${a.projectId}` : null);
          const key = `${roleName.toLowerCase()}|${a.projectId ?? ''}|${a.organizationId ?? ''}`;

          if (seen.has(key)) {
            seen.get(key)!.ids.push(a.id);
          } else {
            seen.set(key, {
              ids: [a.id],
              roleName,
              roleRank: role?.rank != null ? role.rank : null,
              orgName,
              projectName,
              projectId: a.projectId,
              grantedAt: a.grantedAt,
              revoking: false,
              source: 'rbac',
            });
          }
        }

        // ── Source 2: Legacy assignments from usm_user_project_role ──
        // legacyMap shape: { [projectId]: Role[] }
        const legacy = legacyMap as Record<string, any[]>;
        for (const [projIdStr, roleList] of Object.entries(legacy)) {
          const projId = parseInt(projIdStr, 10);
          const proj = projMap.get(projId);
          const projectName = proj?.projectdisplayname
            || proj?.portfolioId?.portfolioName
            || proj?.name
            || `Project #${projId}`;
          // Org: from project's portfolioId (legacy) or organisationId (RBAC)
          const orgName = proj?.portfolioId?.portfolioName
            ?? (proj?.organisationId != null ? (orgMap.get(proj.organisationId) ?? null) : null);

          for (const legacyRole of (roleList || [])) {
            const roleName: string = legacyRole?.name ?? legacyRole?.role_name ?? `Role #${legacyRole?.id}`;
            const key = `${roleName.toLowerCase()}|${projId}|`;

            if (!seen.has(key)) {
              seen.set(key, {
                ids: [],   // no rbac_role_assignment id — can't revoke via new API
                roleName,
                roleRank: null,  // legacy role — no RBAC rank
                orgName,
                projectName,
                projectId: projId,
                grantedAt: legacyRole?.time_stamp ?? '',
                revoking: false,
                source: 'legacy',
              });
            }
          }
        }

        return Array.from(seen.values());
      })
    ).subscribe({
      next: cards => { this.cards = cards; this.loading = false; this.syncTableData(); },
      error: () => { this.loading = false; },
    });
  }

  isCurrentSession(card: RoleCard): boolean {
    try {
      const role = JSON.parse(sessionStorage.getItem('role') || 'null');
      const project = JSON.parse(sessionStorage.getItem('project') || 'null');
      if (!role || !project) return false;
      const roleMatch = (role.name || '').toLowerCase() === card.roleName.toLowerCase();
      // Match by ID (most reliable) OR any display name variant the shell may store.
      // The shell shows projectdisplayname in the thumbnail but stores the full project
      // object, so project.projectdisplayname is the canonical human-readable name.
      const projectMatch = card.projectName != null && card.projectId != null && (
        project.id === card.projectId ||
        project.name === card.projectName ||
        (project.projectdisplayname && project.projectdisplayname === card.projectName)
      );
      return roleMatch && projectMatch;
    } catch { return false; }
  }

  rankLabel(rank: number | null): string {
    if (rank == null) return 'Legacy';
    const map: Record<number, string> = {
      0: 'Consumer', 1: 'Engineer', 2: 'Project Admin', 3: 'Org Admin', 4: 'Platform Admin',
    };
    return map[rank] ?? `Rank ${rank}`;
  }

  rankColor(rank: number | null): string {
    if (rank == null) return '#9c27b0';
    const map: Record<number, string> = {
      0: '#607d8b', 1: '#1976d2', 2: '#388e3c', 3: '#f57c00', 4: '#7b1fa2',
    };
    return map[rank] ?? '#607d8b';
  }

  configureMenu(card: RoleCard): void {
    let portfolioId: number | undefined;
    try { portfolioId = JSON.parse(sessionStorage.getItem('portfoliodata') || '{}').id; } catch {}

    this.dialog.open(MenuPickerDialogComponent, {
      width: '700px',
      maxHeight: '85vh',
      panelClass: 'menu-picker-panel',
      data: {
        roleName: card.roleName,
        projectName: card.projectName,
        projectId: card.projectId ?? undefined,
        portfolioId,
        userId: this.userContext.userId$.value,
      },
    });
  }

  revokeCard(card: RoleCard): void {
    const scopeLabel = card.projectName
      ? `project "${card.projectName}"`
      : card.orgName
      ? `organisation "${card.orgName}"`
      : 'platform-wide scope';

    const dupNote = card.ids.length > 1
      ? ` (${card.ids.length} duplicate grants will all be removed)`
      : '';

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Revoke role assignment',
        message: `Remove the <strong>${card.roleName}</strong> role from ${scopeLabel}?${dupNote}<br><br>This cannot be undone from this page.`,
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      card.revoking = true;
      const actorUserId = this.userContext.userId$.value;

      // Revoke all duplicate assignment ids for this combo sequentially
      const revokeAll = (ids: number[]) => {
        if (ids.length === 0) {
          this.cards = this.cards.filter(c => c !== card);
          window.dispatchEvent(new CustomEvent('essedum:assignments-changed'));
          return;
        }
        const [head, ...tail] = ids;
        this.api.revokeRoleAssignment(head, actorUserId).subscribe({
          next: () => revokeAll(tail),
          error: () => { card.revoking = false; },
        });
      };

      revokeAll([...card.ids]);
    });
  }
}
