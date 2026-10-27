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
 * Admin tier (rank >= 1): sidebar shows admin-console routes.
 * App tier (rank 0 — AI Client only): sidebar shows product routes.
 * Lowercase match.
 */
// Roles that use the admin-console sidebar (rank >= 1).
// AI Client (rank 0) is the only role that uses the product sidebar instead.
const ADMIN_ROLE_NAMES = new Set([
  // rank 4 — platform
  'admin',
  // rank 3 — org
  'organization admin',
  // rank 2 — project
  'project admin',
  // rank 1 — AI Engineer (sees My Drafts + Asset Catalog in admin-console sidebar)
  'developer',
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
   * Fetches sidebar items for the user from the BE and filters them to the
   * items visible at the selected role's rank (minRoleRank <= roleRank).
   *
   * BE endpoint: GET /api/usm/menu?userId={userId}
   * Returns all items the user CAN see (gated by their highest rank).
   * FE then narrows to what the CURRENTLY SELECTED role tier should see.
   */
  getMenuForRole(roleName: string, userId: number | null | undefined, roleRank?: number): Observable<RoleMenuItem[]> {
    if (!userId) return of([]);

    return this.http.get<any[]>(`/api/usm/menu?userId=${userId}`).pipe(
      map(items => this._filterAndMap(items || [], roleRank ?? 0, roleName)),
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

  private _filterAndMap(items: any[], roleRank: number, roleName: string = ''): RoleMenuItem[] {
    // rank >= 1 (AI Engineer, Project Admin, Org Admin, Admin) → admin-console routes
    // rank 0 (AI Client) → product routes
    const isAdminTier = roleRank >= 1;
    const roleNameLower = roleName.toLowerCase().trim();

    const mapped = items
      .filter(item => {
        // Role-override column: CSV of role names (e.g. 'Developer,Organization Admin,Admin').
        // When set, the item is gated by role name instead of min_role_rank.
        // The backend always returns role-override items; we filter here where the
        // acting role is known.
        const itemRoles: string[] = (item.roles || '')
          .split(',')
          .map((r: string) => r.trim().toLowerCase())
          .filter(Boolean);
        if (itemRoles.length > 0) {
          return itemRoles.includes(roleNameLower);
        }
        // Rank-based default: min_role_rank <= roleRank (max_role_rank nullable upper bound)
        return (item.minRoleRank ?? 0) <= roleRank &&
               (item.maxRoleRank == null || roleRank <= item.maxRoleRank);
      })
      // Route-tier split: admin-console routes for rank 1+, product routes for rank 0.
      .filter(item => {
        const route = (item.route || '').toLowerCase();
        const isAdminRoute = route.startsWith('/admin-console');
        return isAdminTier ? isAdminRoute : !isAdminRoute;
      })
      .map(item => ({
        label: item.label,
        icon: item.icon ?? null,
        // Normalise: BE seeds use "/route", shell expects "./route"
        url: item.route
          ? (item.route.startsWith('/') ? '.' + item.route : item.route)
          : '',
        children: [],
      }));

    return mapped;
  }
}
