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
 * Roles whose sidebar is purely admin-console routes (rank >= 2).
 * All other RBAC roles get product routes.
 */
const ADMIN_ROLE_NAMES = new Set([
  'admin', 'ai platform admin',
  'organization admin', 'ai organisation admin',
  'project admin', 'ai project admin',
]);

/**
 * All role names that should use this new menu system (bypass legacy DashConsts).
 * Lowercase match. Extend as new roles are added to the DB.
 */
const RBAC_ROLE_NAMES = new Set([
  // Rank 0
  'viewer', 'ai client', 'ai consumer(read only)',
  // Rank 1
  'developer', 'ai engineer',
  // Rank 2
  'project admin', 'ai project admin',
  // Rank 3
  'organization admin', 'ai organisation admin',
  // Rank 4
  'admin', 'ai platform admin',
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

  private _filterAndMap(items: any[], roleName: string): RoleMenuItem[] {
    const isAdmin = this.isRbacAdminRole(roleName);

    return items
      .filter(item => {
        const route: string = (item.route || '').toLowerCase();
        const isAdminRoute = route.includes('admin-console') || route.includes('admin_console');
        return isAdmin ? isAdminRoute : !isAdminRoute;
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
  }
}
