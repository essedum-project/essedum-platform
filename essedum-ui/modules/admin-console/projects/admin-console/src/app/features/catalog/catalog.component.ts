import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { combineLatest, switchMap, map, take } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import { NotificationService } from '../../core/notification.service';
import type { Asset, AssetVersion } from '../../core/api-models';

interface CatalogRow extends Asset {
  servingVersionNo: number | null;
}

// §4 marketplace — the single visibility query. Published assets the caller
// can reach, each badged with the scope it has climbed to (Project → Org →
// Public). New drafts opened via the "Edit" action keep the live version
// here untouched until they re-climb the gates (TC-071).
@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  standalone: false,
})
export class CatalogComponent implements OnInit {
  assets: CatalogRow[] = [];

  constructor(
    private readonly api: ApiService,
    private readonly userContext: UserContextService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notify: NotificationService,
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.userContext.userId$, 
      this.userContext.orgId$, 
      this.userContext.projectId$,
      this.userContext.roleId$
    ])
      .pipe(
        take(1),
        switchMap(([userId, orgId, projectId, roleId]) =>
          combineLatest([
            this.api.getCatalog(userId, orgId, projectId),
            this.api.getVersions(userId, orgId, projectId),
          ]).pipe(
            // Filter based on rank/role
            map(([assets, versions]) => this.filterByRank(assets, versions, roleId))
          ),
        ),
        map(([assets, versions]: [Asset[], AssetVersion[]]) =>
          assets.map(a => ({
            ...a,
            servingVersionNo:
              versions.find(v => v.id === a.currentVersionId)?.versionNo ?? null,
          })),
        ),
      )
      .subscribe(rows => (this.assets = rows));
  }

  /**
   * Filter catalog assets based on user rank
   * Rank 2 (Project Admin): Show ONLY PROJECT_APPROVED assets (assets approved by project admin)
   * Rank 3 (Org Admin): Show ONLY PUBLISHED assets (assets approved by org admin)
   * Other ranks: Show all assets (no filtering)
   */
  private filterByRank(assets: Asset[], versions: AssetVersion[], roleId: number | null): [Asset[], AssetVersion[]] {
    if (roleId === 2) {
      // Project Admin: Only show assets that have been approved by project admin
      const filtered = assets.filter(a => (a as any).approval_status === 'PROJECT_APPROVED');
      console.log('[Catalog] Rank 2 (Project Admin) filtering - showing', filtered.length, 'of', assets.length, 'assets with PROJECT_APPROVED status');
      return [filtered, versions];
    } else if (roleId === 3) {
      // Org Admin: Only show assets that have been approved by org admin (published)
      const filtered = assets.filter(a => (a as any).approval_status === 'PUBLISHED');
      console.log('[Catalog] Rank 3 (Org Admin) filtering - showing', filtered.length, 'of', assets.length, 'assets with PUBLISHED status');
      return [filtered, versions];
    }
    
    // Other ranks: No filtering, show all
    return [assets, versions];
  }

  // TC-071: the catalog route guard (minRank 1) already blocks rank-0 viewers,
  // so every user who reaches this page may open a new draft from any asset.
  canEdit(asset: CatalogRow): boolean {
    return asset.scope !== 'draft';
  }

  // POST /assets/{id}/versions — clones the published asset as a fresh draft;
  // live version keeps serving until the clone re-climbs the gates (TC-071).
  cloneAsset(asset: CatalogRow): void {
    const userId = this.userContext.userId$.value;
    this.api
      .createNewVersion(asset.id, { payloadRef: '', actorId: userId, actorName: `User #${userId}` })
      .subscribe({
        next: () => {
          this.notify.success('Asset cloned as new draft — opening My Drafts.');
          this.router.navigate(['../publishing'], { relativeTo: this.route });
        },
        error: err => this.notify.error(err?.error?.message || 'Failed to clone the published asset.'),
      });
  }

  scopeLabel(scope: string): string {
    switch (scope) {
      case 'project':      return 'Project';
      case 'organization': return 'Organization';
      case 'public':       return 'Public';
      default:             return scope;
    }
  }

  scopeIcon(scope: string): string {
    switch (scope) {
      case 'project':      return 'folder';
      case 'organization': return 'business';
      case 'public':       return 'public';
      default:             return 'label';
    }
  }
}
