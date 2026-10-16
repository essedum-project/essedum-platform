import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UserContextService } from './user-context.service';

// NFR-SEC2/SEC7: the sidebar's rbac_menu_item.min_role_rank only controls
// link VISIBILITY, not route access — a lower-rank admin navigating
// directly to a URL (or a bookmark) would otherwise still load the
// component and its data. This guard mirrors the same rank thresholds at
// the router level; the backend endpoints independently re-check rank/scope
// (this guard is a UX convenience, not the security boundary).
@Injectable({ providedIn: 'root' })
export class RankGuard implements CanActivate {
  constructor(
    private readonly api: ApiService,
    private readonly userContext: UserContextService,
    private readonly router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const minRank: number = route.data?.['minRank'] ?? 0;
    const userId = this.userContext.userId$.value;
    const fallback = this.overviewUrl(state.url);
    return this.api.getAccessContext(userId).pipe(
      map(ctx => {
        const rank = ctx?.highestRank ?? 0;
        if (rank >= minRank) {
          return true;
        }
        return this.router.parseUrl(fallback);
      }),
      catchError(() => of(this.router.parseUrl(fallback))),
    );
  }

  // The remote is mounted under the host (e.g. /landing/admin-console/**), so
  // swap the last segment rather than hardcoding an absolute path.
  private overviewUrl(url: string): string {
    const path = url.split('?')[0].split('#')[0];
    const segments = path.split('/').filter(s => s);
    segments[segments.length - 1] = 'overview';
    return '/' + segments.join('/');
  }
}
