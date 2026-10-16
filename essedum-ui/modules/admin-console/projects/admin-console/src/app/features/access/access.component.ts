import { Component, OnInit, ViewEncapsulation, ElementRef, effect } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, map } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ThemeService } from '../../core/theme.service';
import { RbacRole, RoleAssignment, UserOption } from '../../core/api-models';
import { GrantRoleDialogComponent } from './grant-role-dialog/grant-role-dialog.component';
import { UserContextService } from '../../core/user-context.service';
import { ProvisionDialogComponent } from '../tenancy/provision-dialog/provision-dialog.component';

interface RoleAssignmentRow extends RoleAssignment {
  roleName: string;
  userName: string;
  scopeLabel: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// P1 VERSION: Access control with Shadow DOM encapsulation
// ═════════════════════════════════════════════════════════════════════════════
@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false,
})
export class AccessComponent implements OnInit {
  rows: RoleAssignmentRow[] = [];
  roles: RbacRole[] = [];
  rank = 0;

  readonly columns = ['userName', 'roleName', 'scopeLabel', 'grantedAt', 'actions'];

  constructor(
    private readonly api: ApiService,
    private readonly dialog: MatDialog,
    private readonly userContext: UserContextService,
    private readonly themeService: ThemeService,
    private readonly elementRef: ElementRef,
  ) {
    // Apply light-theme class when isDarkTheme is false
    effect(() => {
      const isDark = this.themeService.isDarkTheme();
      const hostElement = this.elementRef.nativeElement;
      if (isDark) {
        hostElement.classList.remove('light-theme');
      } else {
        hostElement.classList.add('light-theme');
      }
    });
  }

  get canCreateRole(): boolean { return this.rank >= 4; }

  ngOnInit(): void {
    this.api.getAccessContext(this.userContext.userId$.value)
      .subscribe(ctx => (this.rank = ctx?.highestRank ?? 0));
    this.load();
  }

  createRole(): void {
    const userId = this.userContext.userId$.value;
    const ref = this.dialog.open(ProvisionDialogComponent, { width: '460px', data: { kind: 'role' } });
    ref.afterClosed().subscribe((r: any) => {
      if (!r) {
        return;
      }
      this.api.createRole(userId, { name: r.name, rank: r.rank }).subscribe(() => this.load());
    });
  }

  private load(): void {
    combineLatest([
      this.api.getRoleAssignments(this.userContext.userId$.value),
      this.api.getRoles(),
      this.api.getUsers(),
      this.api.getProjects(),
      this.api.getOrganisations(),
    ])
      .pipe(
        map(([assignments, roles, users, projects, organisations]) => {
          this.roles = roles;
          return assignments
            .filter(a => !a.revokedAt)
            .map(a => ({
              ...a,
              roleName: roles.find(r => r.id === a.roleId)?.name ?? 'unknown',
              userName: users.find((u: UserOption) => u.id === a.userId)?.name ?? `User #${a.userId}`,
              scopeLabel: a.projectId
                ? `Project: ${projects.find(p => p.id === a.projectId)?.name ?? '#' + a.projectId}`
                : a.organizationId
                ? `Organization: ${organisations.find(o => o.id === a.organizationId)?.name ?? '#' + a.organizationId}`
                : 'Platform',
            }));
        }),
      )
      .subscribe(rows => (this.rows = rows));
  }

  grantRole(): void {
    const ref = this.dialog.open(GrantRoleDialogComponent, { width: '480px' });
    ref.afterClosed().subscribe((result: { userId: number; roleId: number; organizationId: number | null; projectIds: number[] } | undefined) => {
      if (!result) {
        return;
      }
      const actorUserId = this.userContext.userId$.value;
      // Project scope can target multiple (or "all") projects at once — grant
      // each one individually; the existing endpoint is single-project.
      const projectIds = result.projectIds.length ? result.projectIds : [null];
      const grants = projectIds.map(projectId =>
        this.api.grantRole({
          userId: result.userId,
          roleId: result.roleId,
          organizationId: result.organizationId,
          projectId,
          actorUserId,
        }),
      );
      combineLatest(grants).subscribe(() => this.load());
    });
  }

  revoke(row: RoleAssignmentRow): void {
    this.api.revokeRoleAssignment(row.id, this.userContext.userId$.value).subscribe(() => this.load());
  }
}

