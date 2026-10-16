import { Component, OnInit } from '@angular/core';
import { combineLatest, switchMap, map } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import { Asset, AssetVersion } from '../../core/api-models';

interface CatalogRow extends Asset {
  servingVersionNo: number | null;
}

// §4 marketplace — the single visibility query. Published assets the caller
// can reach, each badged with the scope it has climbed to (Project → Org →
// Public). New drafts opened via the "Edit" action keep the live version
// here untouched until they re-climb the gates.
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
  ) {}

  ngOnInit(): void {
    this.userContext.userId$
      .pipe(
        switchMap(userId =>
          combineLatest([this.api.getCatalog(userId), this.api.getVersions(userId)]),
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
