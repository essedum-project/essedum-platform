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

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const minRank: number = route.data?.['minRank'] ?? 0;
    const userId = this.userContext.userId$.value;
    return this.api.getAccessContext(userId).pipe(
      map(ctx => {
        const rank = ctx?.highestRank ?? 0;
        if (rank >= minRank) {
          return true;
        }
        return this.router.createUrlTree(['/admin-console/overview']);
      }),
      catchError(() => of(this.router.createUrlTree(['/admin-console/overview']))),
    );
  }
}
