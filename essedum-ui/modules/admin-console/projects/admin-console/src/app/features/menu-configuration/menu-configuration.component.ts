import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import { MenuItem, RoleMenu } from '../../core/api-models';
import { MenuItemDialogComponent } from './menu-item-dialog/menu-item-dialog.component';
import { RoleMenuDialogComponent } from './role-menu-dialog/role-menu-dialog.component';

interface MenuItemRow extends MenuItem {
  parentLabel: string;
}

// Two sources, one screen (§7):
//  - 'admin'  → rbac_menu_item, the Admin Console sidebar (rank-gated).
//  - 'role'   → usm_constant "<Role> Side", the LIVE per-role sidebars every
//               non-admin role renders from; edits here show up immediately.
@Component({
  selector: 'app-menu-configuration',
  templateUrl: './menu-configuration.component.html',
  styleUrls: ['./menu-configuration.component.scss'],
  standalone: false,
})
export class MenuConfigurationComponent implements OnInit {
  mode: 'admin' | 'role' = 'admin';

  // ----- admin console menu (rbac_menu_item) -----
  adminRows: MenuItemRow[] = [];
  readonly adminColumns = ['label', 'icon', 'route', 'parentLabel', 'minRoleRank', 'displayOrder', 'actions'];

  // Matches rbac_role ranks. null = no filter.
  readonly adminTiers = [
    { rank: 4, label: 'AI Platform Admin' },
    { rank: 3, label: 'AI Organization Admin' },
    { rank: 2, label: 'AI Project Admin' },
    { rank: 1, label: 'AI Engineer' },
    { rank: 0, label: 'AI Consumer(Read only)' },
  ];
  adminTierFilter: number | null = null;

  /** Items the chosen tier would actually see, i.e. minRoleRank at or below it. */
  get filteredAdminRows(): MenuItemRow[] {
    if (this.adminTierFilter === null) {
      return this.adminRows;
    }
    return this.adminRows.filter(row => (row.minRoleRank ?? 0) <= this.adminTierFilter!);
  }

  // ----- role menus (usm_constant) -----
  roleOptions: string[] = [];
  projectOptions: string[] = [];
  selectedRole = '';
  selectedProject = '';
  roleRows: RoleMenu[] = [];
  readonly roleColumns = ['label', 'icon', 'url', 'hasChildren', 'actions'];

  constructor(
    private readonly api: ApiService,
    private readonly dialog: MatDialog,
    private readonly userContext: UserContextService,
  ) {}

  ngOnInit(): void {
    this.loadAdmin();
    this.api.getRoleMenuRoles(this.userContext.userId$.value).subscribe(roles => (this.roleOptions = roles));
  }

  setMode(mode: 'admin' | 'role'): void {
    this.mode = mode;
    if (mode === 'role' && !this.selectedRole && this.roleOptions.length) {
      this.onRoleChange(this.roleOptions[0]);
    }
  }

  // ----- admin console menu -----
  private loadAdmin(): void {
    this.api.getMenuItems(this.userContext.userId$.value).subscribe(items => {
      this.adminRows = items
        .map(item => ({
          ...item,
          parentLabel: items.find(p => p.id === item.parentId)?.label ?? '—',
        }))
        .sort((a, b) => a.displayOrder - b.displayOrder);
    });
  }

  addAdmin(): void {
    const ref = this.dialog.open(MenuItemDialogComponent, { width: '640px' });
    ref.afterClosed().subscribe((result: Omit<MenuItem, 'id'> | undefined) => {
      if (result) {
        this.api.createMenuItem(this.userContext.userId$.value, result).subscribe(() => this.loadAdmin());
      }
    });
  }

  editAdmin(row: MenuItemRow): void {
    const ref = this.dialog.open(MenuItemDialogComponent, { width: '640px', data: row });
    ref.afterClosed().subscribe((result: Omit<MenuItem, 'id'> | undefined) => {
      if (result) {
        this.api.updateMenuItem(row.id, this.userContext.userId$.value, result).subscribe(() => this.loadAdmin());
      }
    });
  }

  removeAdmin(row: MenuItemRow): void {
    this.api.deleteMenuItem(row.id, this.userContext.userId$.value).subscribe(() => this.loadAdmin());
  }

  // ----- role menus -----
  onRoleChange(role: string): void {
    this.selectedRole = role;
    this.selectedProject = '';
    this.roleRows = [];
    this.api.getRoleMenuProjects(role, this.userContext.userId$.value).subscribe(projects => {
      this.projectOptions = projects;
      if (projects.length) {
        this.onProjectChange(projects[0]);
      }
    });
  }

  onProjectChange(project: string): void {
    this.selectedProject = project;
    this.loadRoleMenus();
  }

  private loadRoleMenus(): void {
    if (!this.selectedRole || !this.selectedProject) {
      this.roleRows = [];
      return;
    }
    this.api.getRoleMenus(this.selectedRole, this.selectedProject, this.userContext.userId$.value).subscribe(rows => (this.roleRows = rows));
  }

  addRoleMenu(): void {
    if (!this.selectedRole || !this.selectedProject) {
      return;
    }
    const ref = this.dialog.open(RoleMenuDialogComponent, { width: '480px' });
    ref.afterClosed().subscribe((result: { label: string; icon: string | null; url: string | null } | undefined) => {
      if (result) {
        this.api
          .createRoleMenu(this.userContext.userId$.value, { role: this.selectedRole, project: this.selectedProject, ...result })
          .subscribe(() => this.loadRoleMenus());
      }
    });
  }

  editRoleMenu(row: RoleMenu): void {
    const ref = this.dialog.open(RoleMenuDialogComponent, { width: '480px', data: row });
    ref.afterClosed().subscribe((result: { label: string; icon: string | null; url: string | null } | undefined) => {
      if (result) {
        this.api.updateRoleMenu(row.id, this.userContext.userId$.value, result).subscribe(() => this.loadRoleMenus());
      }
    });
  }

  removeRoleMenu(row: RoleMenu): void {
    this.api.deleteRoleMenu(row.id, this.userContext.userId$.value).subscribe(() => this.loadRoleMenus());
  }
}
