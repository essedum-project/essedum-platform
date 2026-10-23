import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, map } from 'rxjs';
import { ApiService } from '../../core/api.service';
import type { RbacRole, RoleAssignment, UserOption } from '../../core/api-models';
import { GrantRoleDialogComponent } from './grant-role-dialog/grant-role-dialog.component';
import { UserContextService } from '../../core/user-context.service';
import { ProvisionDialogComponent } from '../tenancy/provision-dialog/provision-dialog.component';

interface RoleAssignmentRow extends RoleAssignment {
  roleName: string;
  userName: string;
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
  rows: RoleAssignmentRow[] = [];
  roles: RbacRole[] = [];
  rank = 0;

  readonly columns = ['userName', 'roleName', 'scopeLabel', 'grantedAt', 'actions'];

  private readonly roleNameMap: { [key: string]: string } = {
    'viewer': 'AI Consumer(Read only)',
    'developer': 'AI Engineer',
    'project_admin': 'AI Project Admin',
    'org_admin': 'AI Organization Admin',
    'platform_admin': 'AI Platform Admin',
  };

  constructor(
    private readonly api: ApiService,
    private readonly dialog: MatDialog,
    private readonly userContext: UserContextService,
  ) {}

  get canCreateRole(): boolean { return this.rank >= 4; }

  getDisplayRoleName(roleName: string): string {
    return this.roleNameMap[roleName.toLowerCase()] || roleName;
  }

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
              roleName: this.getDisplayRoleName(roles.find(r => r.id === a.roleId)?.name ?? 'unknown'),
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
      combineLatest(grants).subscribe(() => {
        this.load();
        window.dispatchEvent(new CustomEvent('essedum:assignments-changed'));
      });
    });
  }

  revoke(row: RoleAssignmentRow): void {
    this.api.revokeRoleAssignment(row.id, this.userContext.userId$.value).subscribe(() => {
      this.load();
      window.dispatchEvent(new CustomEvent('essedum:assignments-changed'));
    });
  }
}

