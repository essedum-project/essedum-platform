import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { combineLatest, map, of } from 'rxjs';
import { ApiService } from '../../../core/api.service';
import { RoleMenu } from '../../../core/api-models';

export interface SidebarItem {
  label: string;
  icon: string | null;
  url: string | null;
  children?: SidebarItem[];
}

export interface PickerRow {
  item: SidebarItem;
  depth: number;
  active: boolean;
  roleMenuId: number | null;
  saving: boolean;
  hasChildren: boolean;
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
      projectId?: number; portfolioId?: number;
    },
    private readonly dialogRef: MatDialogRef<MenuPickerDialogComponent>,
    private readonly api: ApiService,
  ) {}

  ngOnInit(): void {
    const { roleName, projectName, userId, projectId, portfolioId } = this.data;
    const project = projectName ?? '';

    const roleMenus$ = project
      ? this.api.getRoleMenus(roleName, project, userId)
      : of<RoleMenu[]>([]);

    combineLatest([
      this.api.getDashConstants(projectId, portfolioId),
      this.api.getMenuItems(userId),
      roleMenus$,
    ]).pipe(
      map(([dashConsts, rbacItems, roleMenus]) => {
        // Build a set of active URLs from the user's saved role menus
        const activeMap = new Map<string, number>(
          roleMenus.map(rm => [rm.url ?? '', rm.id])
        );

        const seen = new Set<string>();
        const rows: PickerRow[] = [];

        const skipUrls = new Set([
          './iamp-usm/dashconstant',
          './iamp-usm/portfoliolist',
          './admin-console/menu-configuration',
        ]);

        const addRow = (item: SidebarItem, depth: number) => {
          const key = item.url || item.label;
          if (!key || skipUrls.has(item.url ?? '') || seen.has(key)) return;
          seen.add(key);
          rows.push({
            item,
            depth,
            active: item.url ? activeMap.has(item.url) : false,
            roleMenuId: item.url ? (activeMap.get(item.url) ?? null) : null,
            saving: false,
            hasChildren: !!(item.children?.length),
          });
        };

        const flatten = (items: SidebarItem[], depth = 0) => {
          for (const item of items) {
            addRow(item, depth);
            if (item.children?.length) flatten(item.children, depth + 1);
          }
        };

        // ── Source 1: DashConst sidebar items (Dashboard, Pipelines, LiteLLM, etc.) ──
        const sideConsts = dashConsts.filter(
          dc => dc.keys && dc.keys.includes('Side') && !dc.keys.includes('SideConfiguration')
        );
        for (const dc of sideConsts) {
          try {
            const parsed: SidebarItem = JSON.parse(dc.value);
            if (parsed) flatten([parsed]);
          } catch {}
        }

        // ── Source 2: RBAC admin-console menu items (Overview, Tenancy, Access, etc.) ──
        for (const mi of rbacItems) {
          if (!mi.route) continue;
          addRow(
            { label: mi.label, icon: mi.icon ?? null, url: mi.route },
            mi.parentId != null ? 1 : 0,
          );
        }

        return rows;
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
        url: row.item.url ?? null,
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
