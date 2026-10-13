import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, map } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { RbacRole, RoleAssignment } from '../../core/api-models';
import { GrantRoleDialogComponent } from './grant-role-dialog/grant-role-dialog.component';

interface RoleAssignmentRow extends RoleAssignment {
  roleName: string;
  scopeLabel: string;
}

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.scss'],
  standalone: false,
})
export class AccessComponent implements OnInit {
  rows: RoleAssignmentRow[] = [];
  roles: RbacRole[] = [];

  readonly columns = ['userName', 'roleName', 'scopeLabel', 'grantedAt', 'actions'];

  constructor(
    private readonly api: ApiService,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    combineLatest([this.api.getRoleAssignments(), this.api.getRoles()])
      .pipe(
        map(([assignments, roles]) => {
          this.roles = roles;
          return assignments
            .filter(a => !a.revokedAt)
            .map(a => ({
              ...a,
              roleName: roles.find(r => r.id === a.roleId)?.name ?? 'unknown',
              scopeLabel: a.projectId
                ? `Project #${a.projectId}`
                : a.organizationId
                ? `Organization #${a.organizationId}`
                : 'Platform',
            }));
        }),
      )
      .subscribe(rows => (this.rows = rows));
  }

  grantRole(): void {
    const ref = this.dialog.open(GrantRoleDialogComponent, { width: '480px' });
    ref.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      this.api.grantRole(result).subscribe(() => this.load());
    });
  }

  revoke(row: RoleAssignmentRow): void {
    this.api.revokeRoleAssignment(row.id).subscribe(() => this.load());
  }
}

