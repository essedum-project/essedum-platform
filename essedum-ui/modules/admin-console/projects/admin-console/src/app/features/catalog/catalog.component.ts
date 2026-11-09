import { Component, OnInit } from '@angular/core';
import { Observable, take } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { ApiService } from '../../core/api.service';
import { NotificationService } from '../../core/notification.service';

type AssetKind = 'pipeline' | 'dataset' | 'datasource';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  standalone: false,
})
export class CatalogComponent implements OnInit {
  assets: any[] = [];
  datasetAssets: any[] = [];
  datasourceAssets: any[] = [];

  // Server-side pagination for the Connections tab (datasources).
  datasourceTotal = 0;
  datasourcePageIndex = 0;
  datasourcePageSize = 5;
  readonly datasourcePageSizeOptions = [5, 10, 25];

  // Keyed by "<kind>:<id>" so only the card being cloned shows a spinner.
  cloning: Record<string, boolean> = {};

  private projectId: number | null = null;
  private orgId: number | null = null;

  constructor(
    private readonly api: ApiService,
    private readonly notify: NotificationService,
  ) {}

  ngOnInit(): void {
    try { this.projectId = Number(JSON.parse(sessionStorage.getItem('project') || '{}')?.id) || null; } catch {}
    try { this.orgId = Number(JSON.parse(sessionStorage.getItem('portfoliodata') || '{}')?.id) || null; } catch {}

    this.loadCatalog();
  }

  private loadCatalog(): void {
    // Pass both projectId and orgId for every user — backend returns the full approved scope:
    // PROJECT_APPROVED (project) + ORG_APPROVED (org) + PUBLISHED (globally)
    this.api.getPipelineCatalog(this.projectId, this.orgId)
      .pipe(take(1))
      .subscribe(rows => (this.assets = this.toRows(rows)));

    this.api.getDatasetCatalog(this.projectId, this.orgId)
      .pipe(take(1))
      .subscribe(rows => (this.datasetAssets = this.toRows(rows)));

    this.loadDatasourceCatalog();
  }

  /** Loads just the Connections (datasources) tab's current page. */
  private loadDatasourceCatalog(): void {
    this.api.getDatasourceCatalog(this.projectId, this.orgId, this.datasourcePageIndex, this.datasourcePageSize)
      .pipe(take(1))
      .subscribe(rows => {
        this.datasourceAssets = this.toRows(rows);
        this.datasourceTotal = this.toCount(rows, this.datasourceAssets);
      });
  }

  onDatasourcePage(event: PageEvent): void {
    this.datasourcePageIndex = event.pageIndex;
    this.datasourcePageSize = event.pageSize;
    this.loadDatasourceCatalog();
  }

  private toRows(rows: any): any[] {
    if (Array.isArray(rows)) return rows;
    return Array.isArray(rows?.data) ? rows.data : [];
  }

  /** Total record count for server-side pagination, falling back to the page length. */
  private toCount(rows: any, pageRows: any[]): number {
    const count = rows?.count;
    return typeof count === 'number' ? count : pageRows.length;
  }

  // ---- clone ----

  /** Pipelines key on `cid`, datasets/connections on `id`. */
  assetId(item: any): number | null {
    const id = item?.cid ?? item?.id;
    return Number.isFinite(Number(id)) ? Number(id) : null;
  }

  cloneKey(kind: AssetKind, item: any): string {
    return `${kind}:${this.assetId(item)}`;
  }

  isCloning(kind: AssetKind, item: any): boolean {
    return !!this.cloning[this.cloneKey(kind, item)];
  }

  /**
   * Clones an approved/published asset into a new DRAFT "<name>-v<n>". The
   * original stays as-is in the catalog; the clone appears in the
   * pipeline/dataset/connection tab and must be submitted for approval again.
   */
  clone(kind: AssetKind, item: any): void {
    const id = this.assetId(item);
    if (id == null) {
      this.notify.error('Cannot clone: asset id is missing.');
      return;
    }

    const key = this.cloneKey(kind, item);
    if (this.cloning[key]) return;
    this.cloning[key] = true;

    const request: Observable<any> =
      kind === 'pipeline' ? this.api.clonePipeline(id)
      : kind === 'dataset' ? this.api.cloneDataset(id)
      : this.api.cloneDatasource(id);

    request.pipe(take(1)).subscribe({
      next: res => {
        this.cloning[key] = false;
        const created = res?.data ?? res;
        const name = created?.name || created?.alias || 'new version';
        this.notify.success(`Created draft "${name}". Submit it for approval to publish this version.`);
        this.loadCatalog();
      },
      error: err => {
        this.cloning[key] = false;
        this.notify.error(err?.error?.error || `Failed to clone ${this.kindLabel(kind)}.`);
      },
    });
  }

  private kindLabel(kind: AssetKind): string {
    if (kind === 'pipeline') return 'pipeline';
    if (kind === 'dataset') return 'dataset';
    return 'connection';
  }

  badgeClass(item: any): string {
    const s: string = item?.approval_status ?? item?.approvalStatus ?? '';
    if (s === 'PROJECT_APPROVED')   return 'badge-project';
    if (s === 'PUBLISHED')          return 'badge-organization';
    if (s === 'GLOBALLY_PUBLISHED') return 'badge-global';
    return 'badge-public';
  }

  scopeLabel(item: any): string {
    const s: string = item?.approval_status ?? item?.approvalStatus ?? '';
    if (s === 'PROJECT_APPROVED')   return 'Project';
    if (s === 'PUBLISHED')          return 'Organization';
    if (s === 'GLOBALLY_PUBLISHED') return 'Global';
    return s;
  }

  scopeIcon(item: any): string {
    const s: string = item?.approval_status ?? item?.approvalStatus ?? '';
    if (s === 'PROJECT_APPROVED')   return 'folder';
    if (s === 'PUBLISHED')          return 'business';
    if (s === 'GLOBALLY_PUBLISHED') return 'public';
    return 'label';
  }

  displayDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return dateStr; }
  }
}
