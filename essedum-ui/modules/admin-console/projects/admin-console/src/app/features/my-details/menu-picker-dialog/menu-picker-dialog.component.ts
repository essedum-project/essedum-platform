import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { combineLatest, map, of } from 'rxjs';
import { ApiService } from '../../../core/api.service';
import { MenuItem, RoleMenu } from '../../../core/api-models';

interface PickerRow {
  item: MenuItem;
  active: boolean;
  roleMenuId: number | null;
  saving: boolean;
}

@Component({
  selector: 'app-menu-picker-dialog',
  templateUrl: './menu-picker-dialog.component.html',
  standalone: false,
})
export class MenuPickerDialogComponent implements OnInit {
  rows: PickerRow[] = [];
  loading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: {
      roleName: string; projectName: string | null; userId: number;
    },
    private readonly dialogRef: MatDialogRef<MenuPickerDialogComponent>,
    private readonly api: ApiService,
  ) {}

  ngOnInit(): void {
    const { roleName, projectName, userId } = this.data;
    const project = projectName ?? '';

    const roleMenus$ = project
      ? this.api.getRoleMenus(roleName, project, userId)
      : of<RoleMenu[]>([]);

    combineLatest([
      this.api.getMenuItems(userId),
      roleMenus$,
    ]).pipe(
      map(([items, roleMenus]) => {
        const activeMap = new Map<string, number>(
          roleMenus.map(rm => [rm.url ?? '', rm.id])
        );
        return items.map(item => ({
          item,
          active: activeMap.has(item.route),
          roleMenuId: activeMap.get(item.route) ?? null,
          saving: false,
        }));
      })
    ).subscribe({
      next: rows => { this.rows = rows; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  get activeCount(): number { return this.rows.filter(r => r.active).length; }

  toggle(row: PickerRow): void {
    if (row.saving) return;
    row.saving = true;
    const { roleName, projectName, userId } = this.data;

    if (row.active && row.roleMenuId != null) {
      this.api.deleteRoleMenu(row.roleMenuId, userId).subscribe({
        next: () => { row.active = false; row.roleMenuId = null; row.saving = false; },
        error: () => { row.saving = false; },
      });
    } else if (!row.active) {
      this.api.createRoleMenu(userId, {
        role: roleName,
        project: projectName ?? '',
        label: row.item.label,
        icon: row.item.icon ?? null,
        url: row.item.route,
      }).subscribe({
        next: rm => { row.active = true; row.roleMenuId = rm.id; row.saving = false; },
        error: () => { row.saving = false; },
      });
    } else {
      row.saving = false;
    }
  }

  close(): void { this.dialogRef.close(); }
}
