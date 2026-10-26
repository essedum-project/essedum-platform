import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, map } from 'rxjs';
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
  roleRank: number;
  orgName: string | null;
  projectName: string | null;
  projectId: number | null;
  grantedAt: string;
  revoking: boolean;
}

@Component({
  selector: 'app-my-details',
  templateUrl: './my-details.component.html',
  styleUrls: ['./my-details.component.scss'],
  standalone: false,
})
export class MyDetailsComponent implements OnInit, OnDestroy {
  cards: RoleCard[] = [];
  loading = true;
  user: any = {};

  readonly tableColumns = ['role', 'org', 'project', 'user', 'granted', 'actions'];

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

        // Deduplicate: same role+project+org combo → one card, track all ids
        const seen = new Map<string, RoleCard>();
        for (const a of assignments.filter(a => !a.revokedAt)) {
          const roleName = roleMap.get(a.roleId)?.name ?? `Role #${a.roleId}`;
          const orgName = a.organizationId != null ? (orgMap.get(a.organizationId) ?? `Org #${a.organizationId}`) : null;
          const projectName = a.projectId != null ? (projMap.get(a.projectId) ?? `Project #${a.projectId}`) : null;
          const key = `${a.roleId}|${a.organizationId ?? ''}|${a.projectId ?? ''}`;

          if (seen.has(key)) {
            seen.get(key)!.ids.push(a.id);
          } else {
            seen.set(key, {
              ids: [a.id],
              roleName,
              roleRank: roleMap.get(a.roleId)?.rank ?? 0,
              orgName,
              projectName,
              projectId: a.projectId,
              grantedAt: a.grantedAt,
              revoking: false,
            });
          }
        }
        return Array.from(seen.values());
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
