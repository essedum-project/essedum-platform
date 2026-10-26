import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { combineLatest, map, of } from 'rxjs';
import { ApiService } from '../../../core/api.service';
import type { RoleMenu } from '../../../core/api-models';

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
  /** When true this row is a visual category separator, not a toggleable item. */
  isCategory?: boolean;
}

/** Only these sidebar items (from DashConst) are shown in the menu picker. */
const ALLOWED_SIDEBAR_LABELS = new Set([
  'dashboard', 'pipelines', 'agent directory', 'vibe studio',
  'datasets', 'models', 'connections', 'adapters',
]);

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

        const makeCategory = (label: string): PickerRow => ({
          item: { label, icon: null, url: null },
          depth: 0, active: false, roleMenuId: null, saving: false,
          hasChildren: false, isCategory: true,
        });

        // ── Source 1: DashConst sidebar items — whitelist only ──
        const appRows: PickerRow[] = [];
        const seenApp = new Set<string>();
        const sideConsts = dashConsts.filter(
          dc => dc.keys && dc.keys.includes('Side') && !dc.keys.includes('SideConfiguration')
        );
        for (const dc of sideConsts) {
          try {
            const parsed: SidebarItem = JSON.parse(dc.value);
            if (!parsed?.label) continue;
            if (!ALLOWED_SIDEBAR_LABELS.has(parsed.label.toLowerCase())) continue;
            const key = parsed.url || parsed.label;
            if (seenApp.has(key) || skipUrls.has(parsed.url ?? '')) continue;
            seenApp.add(key);
            seen.add(key);
            appRows.push({
              item: parsed,
              depth: 0,
              active: parsed.url ? activeMap.has(parsed.url) : false,
              roleMenuId: parsed.url ? (activeMap.get(parsed.url) ?? null) : null,
              saving: false,
              hasChildren: false,
            });
          } catch {}
        }
        if (appRows.length) {
          rows.push(makeCategory('Application'));
          rows.push(...appRows);
        }

        // ── Source 2: RBAC admin-console menu items ──
        const adminRows: PickerRow[] = [];
        for (const mi of rbacItems) {
          if (!mi.route || skipUrls.has(mi.route) || seen.has(mi.route)) continue;
          seen.add(mi.route);
          adminRows.push({
            item: { label: mi.label, icon: mi.icon ?? null, url: mi.route },
            depth: mi.parentId != null ? 1 : 0,
            active: activeMap.has(mi.route),
            roleMenuId: activeMap.get(mi.route) ?? null,
            saving: false,
            hasChildren: false,
          });
        }
        if (adminRows.length) {
          rows.push(makeCategory('Admin Console'));
          rows.push(...adminRows);
        }

        return rows;
      })
    ).subscribe({
      next: rows => { this.rows = rows; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  get activeCount(): number { return this.rows.filter(r => !r.isCategory && r.active).length; }
  get categoryCount(): number { return this.rows.filter(r => r.isCategory).length; }

  toggle(row: PickerRow): void {
    if (row.saving || row.isCategory) return;
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
