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

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    let rank = 0;
    let projectId: number | null = null;
    let orgId: number | null = null;
    try { rank = Number(JSON.parse(sessionStorage.getItem('role') || '{}')?.rank ?? 0); } catch {}
    try { projectId = Number(JSON.parse(sessionStorage.getItem('project') || '{}')?.id) || null; } catch {}
    try { orgId = Number(JSON.parse(sessionStorage.getItem('portfoliodata') || '{}')?.id) || null; } catch {}

    // Rank 2 (Project Admin) → PROJECT_APPROVED for their project
    // Rank 3 (Org Admin)     → PUBLISHED for their org
    const requestProjectId = rank === 2 ? projectId : null;
    const requestOrgId     = rank === 3 ? orgId     : null;

    this.api.getPipelineCatalog(requestProjectId, requestOrgId)
      .pipe(take(1))
      .subscribe(rows => (this.assets = Array.isArray(rows) ? rows : []));
  }

  badgeClass(item: any): string {
    const s: string = item?.approval_status ?? '';
    if (s === 'PROJECT_APPROVED') return 'badge-project';
    if (s === 'PUBLISHED')        return 'badge-organization';
    return 'badge-public';
  }

  scopeLabel(item: any): string {
    const s: string = item?.approval_status ?? '';
    if (s === 'PROJECT_APPROVED') return 'Project';
    if (s === 'PUBLISHED')        return 'Organization';
    return s;
  }

  scopeIcon(item: any): string {
    const s: string = item?.approval_status ?? '';
    if (s === 'PROJECT_APPROVED') return 'folder';
    if (s === 'PUBLISHED')        return 'business';
    return 'label';
  }

  displayDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return dateStr; }
  }
}
