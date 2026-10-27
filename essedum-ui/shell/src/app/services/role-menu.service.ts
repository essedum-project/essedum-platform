import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface RoleMenuItem {
  label: string;
  icon: string | null;
  url: string;
  children?: RoleMenuItem[];
}

// ── App-tier menu items (shared across app roles) ────────────────────────────
const APP_MENU: RoleMenuItem[] = [
  { label: 'Dashboard',       icon: 'dashboard',     url: './dashboard' },
  { label: 'Pipelines',       icon: 'pipeline',      url: './aip/pipelines' },
  { label: 'Datasets',        icon: 'storage',       url: './aip/datasets' },
  { label: 'Models',          icon: 'psychology',    url: './aip/models' },
  { label: 'Connections',     icon: 'cable',         url: './aip/connections' },
  { label: 'Adapters',        icon: 'extension',     url: './aip/adapters' },
  { label: 'Agent Directory', icon: 'smart_toy',     url: './aip/agent-directory' },
  { label: 'Vibe Studio',     icon: 'auto_awesome',  url: './aip/vibe-studio' },
  { label: 'Skills',          icon: 'school',        url: './aip/skills' },
];

// ── Admin-tier menu items ────────────────────────────────────────────────────
const ADMIN_MENU: RoleMenuItem[] = [
  { label: 'Overview',      icon: 'home',     url: './admin-console/overview' },
  { label: 'Members',       icon: 'people',   url: './admin-console/access' },
  { label: 'Role Approval', icon: 'approval', url: './admin-console/role-approval' },
];

/**
 * Keyed by EXACT lowercase role name as stored in the DB (rbac_role table).
 * To add an alias, duplicate the key pointing to the same array.
 *
 * Swap `of(...)` for `this.http.get(...)` when the BE endpoint is ready:
 *   GET /api/usm/role-menu-config?role=<name>  →  RoleMenuItem[]
 */
const ROLE_MENUS: Record<string, RoleMenuItem[]> = {
  // ── Rank 0 — read-only consumer ──────────────────────────────────────────
  'ai consumer(read only)': APP_MENU,
  'ai client':              APP_MENU,   // alias

  // ── Rank 1 — engineer ────────────────────────────────────────────────────
  'ai engineer':            APP_MENU,
  'developer':              APP_MENU,   // alias (existing DB role)

  // ── Rank 2 — project admin ───────────────────────────────────────────────
  'project admin':          [...ADMIN_MENU, ...APP_MENU.slice(0, 4)],
  'ai project admin':       [...ADMIN_MENU, ...APP_MENU.slice(0, 4)],  // alias

  // ── Rank 3 — org admin ───────────────────────────────────────────────────
  'organization admin':     ADMIN_MENU,
  'ai organisation admin':  ADMIN_MENU,  // alias

  // ── Rank 4 — platform admin ──────────────────────────────────────────────
  'admin':                  ADMIN_MENU,
  'ai platform admin':      ADMIN_MENU,  // alias
};

@Injectable({ providedIn: 'root' })
export class RoleMenuService {
  /**
   * Returns sidebar items for a given RBAC role name.
   * Returns null when the role is not one of the 5 RBAC roles (legacy fallback applies).
   *
   * TODO: replace `of(...)` with:
   *   return this.http.get<RoleMenuItem[]>(`/api/usm/role-menu-config?role=${encodeURIComponent(roleName)}`);
   */
  getMenuForRole(roleName: string): Observable<RoleMenuItem[] | null> {
    const key = (roleName || '').toLowerCase().trim();
    return of(ROLE_MENUS[key] ?? null);
  }

  /** True when the role name maps to one of the 5 RBAC roles. */
  isRbacRole(roleName: string): boolean {
    return (roleName || '').toLowerCase().trim() in ROLE_MENUS;
  }

  /** True when the RBAC role's menu is admin-console-only (no app routes). */
  isRbacAdminRole(roleName: string): boolean {
    const adminRoles = new Set([
      'admin', 'ai platform admin',
      'organization admin', 'ai organisation admin',
      'project admin', 'ai project admin',
    ]);
    return adminRoles.has((roleName || '').toLowerCase().trim());
  }
}
