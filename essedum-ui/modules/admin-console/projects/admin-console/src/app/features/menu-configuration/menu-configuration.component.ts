import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import { NotificationService } from '../../core/notification.service';
import type { MenuItem, RoleMenu } from '../../core/api-models';
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
export class MenuConfigurationComponent implements OnInit, AfterViewInit {
  mode: 'admin' | 'role' = 'admin';

  // ----- admin console menu (rbac_menu_item) -----
  adminRows: MenuItemRow[] = [];
  adminDataSource = new MatTableDataSource<MenuItemRow>([]);
  readonly adminColumns = ['label', 'icon', 'route', 'parentLabel', 'minRoleRank', 'roles', 'displayOrder', 'actions'];

  // Matches rbac_role ranks. null = no filter.
  readonly adminTiers = [
    { rank: 4, label: 'AI Platform Admin',    roleName: 'admin' },
    { rank: 3, label: 'AI Organization Admin', roleName: 'organization admin' },
    { rank: 2, label: 'AI Project Admin',      roleName: 'project admin' },
    { rank: 0, label: 'AI Engineer',             roleName: 'ai client' },
  ];
  adminTierFilter: number | null = null;

  /** Items the chosen tier would actually see.
   *  Mirrors role-menu.service._filterAndMap: role-override CSV takes priority
   *  over the min_role_rank rank gate, so items like My Drafts (min_role_rank=99,
   *  roles='Developer,Organization Admin,Admin') appear for the right tiers. */
  get filteredAdminRows(): MenuItemRow[] {
    if (this.adminTierFilter === null) {
      return this.adminRows;
    }
    const rank = this.adminTierFilter;
    const tier = this.adminTiers.find(t => t.rank === rank);
    const roleNameLower = (tier?.roleName ?? '').toLowerCase();

    return this.adminRows.filter(row => {
      // Route-tier split: mirrors role-menu.service._filterAndMap.
      // rank 0 (AI Client)  → product routes only (route does NOT start with /admin-console)
      // rank 1+ (all others) → admin-console routes only
      const route = (row.route || '').toLowerCase();
      const isAdminRoute = route.startsWith('/admin-console');
      if (rank === 0 ? isAdminRoute : !isAdminRoute) return false;

      // Role-override CSV takes priority over min_role_rank gate.
      const itemRoles: string[] = ((row as any).roles || '')
        .split(',').map((r: string) => r.trim().toLowerCase()).filter(Boolean);
      if (itemRoles.length > 0) {
        return itemRoles.includes(roleNameLower);
      }
      // Rank-based default gate (with optional upper bound)
      return (row.minRoleRank ?? 0) <= rank &&
             (row.maxRoleRank == null || rank <= row.maxRoleRank);
    });
  }

  // ----- role menus (usm_constant) -----
  roleOptions: string[] = [];
  projectOptions: string[] = [];
  selectedRole = '';
  selectedProject = '';
  roleRows: RoleMenu[] = [];
  roleDataSource = new MatTableDataSource<RoleMenu>([]);
  readonly roleColumns = ['label', 'icon', 'url', 'hasChildren', 'actions'];

  @ViewChild('adminPaginator') adminPaginator!: MatPaginator;
  @ViewChild('rolePaginator') rolePaginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.adminDataSource.paginator = this.adminPaginator;
    this.roleDataSource.paginator = this.rolePaginator;
  }

  constructor(
    private readonly api: ApiService,
    private readonly dialog: MatDialog,
    private readonly userContext: UserContextService,
    private readonly notify: NotificationService,
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

  syncAdminData(): void {
    this.adminDataSource.data = this.filteredAdminRows;
    this.adminDataSource.paginator = this.adminPaginator;
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
      this.syncAdminData();
    });
  }

  addAdmin(): void {
    const ref = this.dialog.open(MenuItemDialogComponent, { width: '640px' });
    ref.afterClosed().subscribe((result: Omit<MenuItem, 'id'> | undefined) => {
      if (result) {
        this.api.createMenuItem(this.userContext.userId$.value, result).subscribe({
          next: () => { this.notify.success('Menu item created successfully.'); this.loadAdmin(); },
          error: err => this.notify.error(err?.error?.message || 'Failed to create menu item.'),
        });
      }
    });
  }

  editAdmin(row: MenuItemRow): void {
    const ref = this.dialog.open(MenuItemDialogComponent, { width: '640px', data: row });
    ref.afterClosed().subscribe((result: Omit<MenuItem, 'id'> | undefined) => {
      if (result) {
        this.api.updateMenuItem(row.id, this.userContext.userId$.value, result).subscribe({
          next: () => { this.notify.success('Menu item updated successfully.'); this.loadAdmin(); },
          error: err => this.notify.error(err?.error?.message || 'Failed to update menu item.'),
        });
      }
    });
  }

  removeAdmin(row: MenuItemRow): void {
    this.api.deleteMenuItem(row.id, this.userContext.userId$.value).subscribe({
      next: () => { this.notify.success('Menu item deleted.'); this.loadAdmin(); },
      error: err => this.notify.error(err?.error?.message || 'Failed to delete menu item.'),
    });
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
    this.api.getRoleMenus(this.selectedRole, this.selectedProject, this.userContext.userId$.value).subscribe(rows => {
      this.roleRows = rows;
      this.roleDataSource.data = rows;
      this.roleDataSource.paginator = this.rolePaginator;
    });
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
          .subscribe({
            next: () => { this.notify.success('Role menu item created successfully.'); this.loadRoleMenus(); },
            error: err => this.notify.error(err?.error?.message || 'Failed to create role menu item.'),
          });
      }
    });
  }

  editRoleMenu(row: RoleMenu): void {
    const ref = this.dialog.open(RoleMenuDialogComponent, { width: '480px', data: row });
    ref.afterClosed().subscribe((result: { label: string; icon: string | null; url: string | null } | undefined) => {
      if (result) {
        this.api.updateRoleMenu(row.id, this.userContext.userId$.value, result).subscribe({
          next: () => { this.notify.success('Role menu item updated successfully.'); this.loadRoleMenus(); },
          error: err => this.notify.error(err?.error?.message || 'Failed to update role menu item.'),
        });
      }
    });
  }

  removeRoleMenu(row: RoleMenu): void {
    this.api.deleteRoleMenu(row.id, this.userContext.userId$.value).subscribe({
      next: () => { this.notify.success('Role menu item deleted.'); this.loadRoleMenus(); },
      error: err => this.notify.error(err?.error?.message || 'Failed to delete role menu item.'),
    });
  }
}
