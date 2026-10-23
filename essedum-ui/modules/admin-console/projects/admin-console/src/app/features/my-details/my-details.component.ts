import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, map } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import type { RoleAssignment, RbacRole, LegacyOrganisation, LegacyProject } from '../../core/api-models';
import { MenuPickerDialogComponent } from './menu-picker-dialog/menu-picker-dialog.component';

export interface RoleCard {
  assignment: RoleAssignment;
  roleName: string;
  roleRank: number;
  orgName: string | null;
  projectName: string | null;
  projectId: number | null;
}

@Component({
  selector: 'app-my-details',
  templateUrl: './my-details.component.html',
  styleUrls: ['./my-details.component.scss'],
  standalone: false,
})
export class MyDetailsComponent implements OnInit {
  cards: RoleCard[] = [];
  loading = true;
  user: any = {};

  constructor(
    private readonly api: ApiService,
    private readonly dialog: MatDialog,
    private readonly userContext: UserContextService,
  ) {}

  ngOnInit(): void {
    try { this.user = JSON.parse(sessionStorage.getItem('user') || '{}'); } catch {}
    this.load();
  }

  get initials(): string {
    return ((this.user?.user_f_name || '')[0] || '') + ((this.user?.user_l_name || '')[0] || '');
  }

  get fullName(): string {
    return [this.user?.user_f_name, this.user?.user_l_name].filter(Boolean).join(' ') || 'User';
  }

  private load(): void {
    const userId = this.userContext.userId$.value;
    combineLatest([
      this.api.getRoleAssignments(userId),
      this.api.getRoles(),
      this.api.getOrganisations(),
      this.api.getProjects(),
    ]).pipe(
      map(([assignments, roles, orgs, projects]) => {
        const roleMap = new Map<number, RbacRole>(roles.map(r => [r.id, r]));
        const orgMap = new Map<number, string>(orgs.map(o => [o.id, o.name]));
        const projMap = new Map<number, string>(projects.map(p => [p.id, p.name]));
        return assignments
          .filter(a => !a.revokedAt)
          .map(a => ({
            assignment: a,
            roleName: roleMap.get(a.roleId)?.name ?? `Role #${a.roleId}`,
            roleRank: roleMap.get(a.roleId)?.rank ?? 0,
            orgName: a.organizationId != null ? (orgMap.get(a.organizationId) ?? `Org #${a.organizationId}`) : null,
            projectName: a.projectId != null ? (projMap.get(a.projectId) ?? `Project #${a.projectId}`) : null,
            projectId: a.projectId,
          }));
      })
    ).subscribe({
      next: cards => { this.cards = cards; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  rankLabel(rank: number): string {
    const map: Record<number, string> = {
      0: 'Consumer', 1: 'Engineer', 2: 'Project Admin', 3: 'Org Admin', 4: 'Platform Admin',
    };
    return map[rank] ?? `Rank ${rank}`;
  }

  rankColor(rank: number): string {
    const map: Record<number, string> = {
      0: '#607d8b', 1: '#1976d2', 2: '#388e3c', 3: '#f57c00', 4: '#7b1fa2',
    };
    return map[rank] ?? '#607d8b';
  }

  configureMenu(card: RoleCard): void {
    // Read portfolioId from session (set by the host shell) so DashConst loads correctly.
    let portfolioId: number | undefined;
    try {
      portfolioId = JSON.parse(sessionStorage.getItem('portfoliodata') || '{}').id;
    } catch {}

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
}
