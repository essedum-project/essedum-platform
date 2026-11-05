import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { ApiService } from '../../core/api.service';

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

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    let projectId: number | null = null;
    let orgId: number | null = null;
    try { projectId = Number(JSON.parse(sessionStorage.getItem('project') || '{}')?.id) || null; } catch {}
    try { orgId = Number(JSON.parse(sessionStorage.getItem('portfoliodata') || '{}')?.id) || null; } catch {}

    // Pass both projectId and orgId for every user — backend returns the full approved scope:
    // PROJECT_APPROVED (project) + ORG_APPROVED (org) + PUBLISHED (globally)
    this.api.getPipelineCatalog(projectId, orgId)
      .pipe(take(1))
      .subscribe(rows => (this.assets = Array.isArray(rows) ? rows : []));

    this.api.getDatasetCatalog(projectId, orgId)
      .pipe(take(1))
      .subscribe(rows => (this.datasetAssets = Array.isArray(rows) ? rows : (rows?.data && Array.isArray(rows.data) ? rows.data : [])));

    this.api.getDatasourceCatalog(projectId, orgId)
      .pipe(take(1))
      .subscribe(rows => (this.datasourceAssets = Array.isArray(rows) ? rows : (rows?.data && Array.isArray(rows.data) ? rows.data : [])));
  }

  badgeClass(item: any): string {
    const s: string = item?.approval_status ?? '';
    if (s === 'PROJECT_APPROVED')   return 'badge-project';
    if (s === 'PUBLISHED')          return 'badge-organization';
    if (s === 'GLOBALLY_PUBLISHED') return 'badge-global';
    return 'badge-public';
  }

  scopeLabel(item: any): string {
    const s: string = item?.approval_status ?? '';
    if (s === 'PROJECT_APPROVED')   return 'Project';
    if (s === 'PUBLISHED')          return 'Organization';
    if (s === 'GLOBALLY_PUBLISHED') return 'Global';
    return s;
  }

  scopeIcon(item: any): string {
    const s: string = item?.approval_status ?? '';
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
