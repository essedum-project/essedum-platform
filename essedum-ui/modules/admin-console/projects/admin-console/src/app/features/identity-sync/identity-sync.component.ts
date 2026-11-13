import { Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import { NotificationService } from '../../core/notification.service';
import type { IdentityTarget, LegacyProject } from '../../core/api-models';

interface SystemCell {
  target?: IdentityTarget;
  status: 'synced' | 'pending' | 'failed' | 'none';
}
interface ProjectRow {
  projectId: number;
  projectName: string;
  cells: { [key: string]: SystemCell };
}

// §8 Identity Sync Status — a checklist per project, one column per external
// system (Git / Kubernetes / Storage / Gateway). ✅ synced, ⚠️ not caught up.
@Component({
  selector: 'app-identity-sync',
  templateUrl: './identity-sync.component.html',
  styleUrls: ['./identity-sync.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class IdentitySyncComponent implements OnInit, AfterViewInit {
  // target_type -> display column
  readonly systems: { key: string; label: string }[] = [
    { key: 'git_team', label: 'Git' },
    { key: 'k8s_rbac', label: 'Kubernetes' },
    { key: 'storage_iam', label: 'Storage' },
    { key: 'gateway_key', label: 'Gateway' },
  ];
  readonly columns = ['project', 'git_team', 'k8s_rbac', 'storage_iam', 'gateway_key'];

  rows = new MatTableDataSource<ProjectRow>([]);
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.rows.paginator = this.paginator;
  }

  constructor(
    private readonly api: ApiService,
    private readonly userContext: UserContextService,
    private readonly notify: NotificationService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    const userId = this.userContext.userId$.value;
    forkJoin({
      targets: this.api.getIdentityTargets(userId).pipe(catchError(() => of([] as IdentityTarget[]))),
      projects: this.api.getProjects().pipe(catchError(() => of([] as LegacyProject[]))),
    }).subscribe(({ targets, projects }) => {
      const nameById = new Map<number, string>(projects.map(p => [p.id, p.name]));
      const byProject = new Map<number, ProjectRow>();
      for (const t of targets) {
        let row = byProject.get(t.projectId);
        if (!row) {
          row = {
            projectId: t.projectId,
            projectName: nameById.get(t.projectId) ?? `Project #${t.projectId}`,
            cells: {},
          };
          this.systems.forEach(s => (row!.cells[s.key] = { status: 'none' }));
          byProject.set(t.projectId, row);
        }
        row.cells[t.targetType] = { target: t, status: (t.syncStatus as any) || 'pending' };
      }
      this.rows.data = Array.from(byProject.values()).sort((a, b) => a.projectName.localeCompare(b.projectName));
      this.loading = false;
    });
  }

  retry(cell: SystemCell): void {
    if (!cell.target) {
      return;
    }
    this.api.retryIdentityTarget(cell.target.id, this.userContext.userId$.value).subscribe({
      next: () => { this.notify.info('Sync retry triggered.'); this.load(); },
      error: err => this.notify.error(err?.error?.message || 'Failed to retry sync.'),
    });
  }
}
