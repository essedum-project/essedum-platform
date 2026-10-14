import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../core/api.service';
import { MenuItem } from '../../core/api-models';
import { MenuItemDialogComponent } from './menu-item-dialog/menu-item-dialog.component';

interface MenuItemRow extends MenuItem {
  parentLabel: string;
}

// Drives MenuService.menuFor() per §7 — min_role_rank gates visibility,
// parentId/displayOrder control nesting and ordering, roles/project provide the
// per-role + per-project override (legacy menus migrated in).
@Component({
  selector: 'app-menu-configuration',
  templateUrl: './menu-configuration.component.html',
  styleUrls: ['./menu-configuration.component.scss'],
  standalone: false,
})
export class MenuConfigurationComponent implements OnInit {
  private allRows: MenuItemRow[] = [];

  // Filters (220+ migrated rows span many roles/projects — filtering is essential).
  roleFilter = 'ALL';
  projectFilter = 'ALL';
  roleOptions: string[] = [];
  projectOptions: string[] = [];

  readonly columns = ['label', 'icon', 'route', 'parentLabel', 'minRoleRank', 'roles', 'project', 'displayOrder', 'actions'];

  constructor(
    private readonly api: ApiService,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get rows(): MenuItemRow[] {
    return this.allRows.filter(r => {
      const roleOk =
        this.roleFilter === 'ALL'
          ? true
          : this.roleFilter === '__admin__'
          ? !r.roles
          : (r.roles || '').split(',').map(s => s.trim()).includes(this.roleFilter);
      const projectOk =
        this.projectFilter === 'ALL'
          ? true
          : this.projectFilter === '__none__'
          ? !r.project
          : r.project === this.projectFilter;
      return roleOk && projectOk;
    });
  }

  private load(): void {
    this.api.getMenuItems().subscribe(items => {
      this.allRows = items
        .map(item => ({
          ...item,
          parentLabel: items.find(p => p.id === item.parentId)?.label ?? '—',
        }))
        .sort((a, b) => a.displayOrder - b.displayOrder);

      const roles = new Set<string>();
      const projects = new Set<string>();
      for (const it of items) {
        (it.roles || '').split(',').map(s => s.trim()).filter(Boolean).forEach(r => roles.add(r));
        if (it.project) {
          projects.add(it.project);
        }
      }
      this.roleOptions = Array.from(roles).sort((a, b) => a.localeCompare(b));
      this.projectOptions = Array.from(projects).sort((a, b) => a.localeCompare(b));
    });
  }

  add(): void {
    const ref = this.dialog.open(MenuItemDialogComponent, { width: '480px' });
    ref.afterClosed().subscribe((result: Omit<MenuItem, 'id'> | undefined) => {
      if (!result) {
        return;
      }
      this.api.createMenuItem(result).subscribe(() => this.load());
    });
  }

  edit(row: MenuItemRow): void {
    const ref = this.dialog.open(MenuItemDialogComponent, { width: '480px', data: row });
    ref.afterClosed().subscribe((result: Omit<MenuItem, 'id'> | undefined) => {
      if (!result) {
        return;
      }
      this.api.updateMenuItem(row.id, result).subscribe(() => this.load());
    });
  }

  remove(row: MenuItemRow): void {
    this.api.deleteMenuItem(row.id).subscribe(() => this.load());
  }
}
