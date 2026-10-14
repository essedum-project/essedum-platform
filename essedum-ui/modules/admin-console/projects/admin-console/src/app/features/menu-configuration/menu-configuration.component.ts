import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../core/api.service';
import { MenuItem } from '../../core/api-models';
import { MenuItemDialogComponent } from './menu-item-dialog/menu-item-dialog.component';

interface MenuItemRow extends MenuItem {
  parentLabel: string;
}

// Drives MenuService.menuFor() per §7 — min_role_rank gates visibility,
// parentId/displayOrder control nesting and ordering.
@Component({
  selector: 'app-menu-configuration',
  templateUrl: './menu-configuration.component.html',
  styleUrls: ['./menu-configuration.component.scss'],
  standalone: false,
})
export class MenuConfigurationComponent implements OnInit {
  rows: MenuItemRow[] = [];

  readonly columns = ['label', 'icon', 'route', 'parentLabel', 'minRoleRank', 'roles', 'displayOrder', 'actions'];

  constructor(
    private readonly api: ApiService,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.api.getMenuItems().subscribe(items => {
      this.rows = items
        .map(item => ({
          ...item,
          parentLabel: items.find(p => p.id === item.parentId)?.label ?? '—',
        }))
        .sort((a, b) => a.displayOrder - b.displayOrder);
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
