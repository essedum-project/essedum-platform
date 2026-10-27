import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface RoleMenuItem {
  label: string;
  icon: string | null;
  url: string;
  children?: RoleMenuItem[];
}

/**
 * Active RBAC roles in rbac_role table (rbac.xml rbac-17 + rbac-21).
 * Admin tier (rank >= 2): sidebar shows admin-console routes.
 * App tier (rank 0-1): sidebar shows product routes.
 * Lowercase match.
 */
const ADMIN_ROLE_NAMES = new Set([
  // rank 4 — platform
  'admin',
  // rank 3 — org
  'organization admin',
  // rank 2 — project
  'project admin',
]);

/**
 * All RBAC role names that use rbac_menu_item-based sidebar (bypass legacy DashConsts).
 * Must stay in sync with rbac_role.name values in the DB.
 */
const RBAC_ROLE_NAMES = new Set([
  // Rank 0
  'ai client',
  // Rank 1
  'developer',
  // Rank 2
  'project admin',
  // Rank 3
  'organization admin',
  // Rank 4
  'admin',
]);

@Injectable({ providedIn: 'root' })
export class RoleMenuService {
  constructor(private http: HttpClient) {}

  /**
   * Fetches sidebar items for the user from the BE and filters them by role tier.
   * Admin-tier roles (rank ≥ 2) get admin-console routes only.
   * App-tier roles (rank 0-1) get product routes only.
   *
   * BE endpoint: GET /api/usm/menu?userId={userId}
   * Returns items already rank-filtered on the server by the user's highest rank.
   */
  getMenuForRole(roleName: string, userId: number | null | undefined): Observable<RoleMenuItem[]> {
    if (!userId) return of([]);

    return this.http.get<any[]>(`/api/usm/menu?userId=${userId}`).pipe(
      map(items => this._filterAndMap(items || [], roleName)),
      catchError(() => of([]))
    );
  }

  /** True when the role name should use the new menu system. */
  isRbacRole(roleName: string): boolean {
    return RBAC_ROLE_NAMES.has((roleName || '').toLowerCase().trim());
  }

  /** True when the role's menu is admin-console-only. */
  isRbacAdminRole(roleName: string): boolean {
    return ADMIN_ROLE_NAMES.has((roleName || '').toLowerCase().trim());
  }

  private _filterAndMap(items: any[], _roleName: string): RoleMenuItem[] {
    const mapped = items.map(item => ({
      label: item.label,
      icon: item.icon ?? null,
      // Normalise: BE seeds use "/route", shell expects "./route"
      url: item.route
        ? (item.route.startsWith('/') ? '.' + item.route : item.route)
        : '',
      children: [],
    }));

    if (mapped.length === 0) {
      return [{ label: 'Dashboard', icon: null, url: './dashboard', children: [] }];
    }
    return mapped;
  }
}
