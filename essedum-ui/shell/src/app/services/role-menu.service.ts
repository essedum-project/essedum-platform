import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface RoleMenuItem {
  label: string;
  icon: string | null;
  url: string;
  children?: RoleMenuItem[];
}

/**
 * Dummy role-menu data keyed by lowercase role name.
 * Replace the `of(...)` calls with real HTTP requests when the BE endpoint is ready.
 * Shape: GET /api/usm/role-menu-config?role=<name>  →  { role, items: RoleMenuItem[] }
 */
const ROLE_MENUS: Record<string, RoleMenuItem[]> = {
  'ai client': [
    { label: 'Dashboard',       icon: 'dashboard',     url: './dashboard' },
    { label: 'Pipelines',       icon: 'pipeline',      url: './aip/pipelines' },
    { label: 'Datasets',        icon: 'storage',       url: './aip/datasets' },
    { label: 'Models',          icon: 'psychology',    url: './aip/models' },
    { label: 'Connections',     icon: 'cable',         url: './aip/connections' },
    { label: 'Adapters',        icon: 'extension',     url: './aip/adapters' },
    { label: 'Agent Directory', icon: 'smart_toy',     url: './aip/agent-directory' },
    { label: 'Vibe Studio',     icon: 'auto_awesome',  url: './aip/vibe-studio' },
    { label: 'Skills',          icon: 'school',        url: './aip/skills' },
  ],
  'ai engineer': [
    { label: 'Dashboard',       icon: 'dashboard',     url: './dashboard' },
    { label: 'Pipelines',       icon: 'pipeline',      url: './aip/pipelines' },
    { label: 'Datasets',        icon: 'storage',       url: './aip/datasets' },
    { label: 'Models',          icon: 'psychology',    url: './aip/models' },
    { label: 'Connections',     icon: 'cable',         url: './aip/connections' },
    { label: 'Adapters',        icon: 'extension',     url: './aip/adapters' },
    { label: 'Agent Directory', icon: 'smart_toy',     url: './aip/agent-directory' },
    { label: 'Vibe Studio',     icon: 'auto_awesome',  url: './aip/vibe-studio' },
    { label: 'Skills',          icon: 'school',        url: './aip/skills' },
  ],
  'ai project admin': [
    { label: 'Overview',        icon: 'home',          url: './admin-console/overview' },
    { label: 'Members',         icon: 'people',        url: './admin-console/access' },
    { label: 'Role Approval',   icon: 'approval',      url: './admin-console/role-approval' },
    { label: 'Dashboard',       icon: 'dashboard',     url: './dashboard' },
    { label: 'Pipelines',       icon: 'pipeline',      url: './aip/pipelines' },
    { label: 'Datasets',        icon: 'storage',       url: './aip/datasets' },
    { label: 'Models',          icon: 'psychology',    url: './aip/models' },
  ],
  'ai organisation admin': [
    { label: 'Overview',        icon: 'home',          url: './admin-console/overview' },
    { label: 'Members',         icon: 'people',        url: './admin-console/access' },
    { label: 'Role Approval',   icon: 'approval',      url: './admin-console/role-approval' },
  ],
  'ai platform admin': [
    { label: 'Overview',        icon: 'home',          url: './admin-console/overview' },
    { label: 'Members',         icon: 'people',        url: './admin-console/access' },
    { label: 'Role Approval',   icon: 'approval',      url: './admin-console/role-approval' },
  ],
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
    const adminRoles = new Set(['ai platform admin', 'ai organisation admin', 'ai project admin']);
    return adminRoles.has((roleName || '').toLowerCase().trim());
  }
}
