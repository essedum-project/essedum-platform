import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { combineLatest, switchMap, map } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import type { PromotionEvent } from '../../core/api-models';

interface PromotionEventRow extends PromotionEvent {
  assetName: string;
  versionNo: number;
}

// Adaptive queue per §6 — the backend's pendingApprovalsForRank() already
// filters to gates the caller's rank can decide at; this just joins display
// fields (asset name, version number) that the API doesn't denormalize.
@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.scss'],
  standalone: false,
})
export class ApprovalsComponent implements OnInit, AfterViewInit {
  pending = new MatTableDataSource<PromotionEventRow>([]);

  readonly columns = ['assetName', 'versionNo', 'gate', 'actorName', 'occurredAt', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.pending.paginator = this.paginator;
  }

  constructor(
    private readonly api: ApiService,
    private readonly userContext: UserContextService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.userContext.userId$
      .pipe(
        switchMap(userId =>
          combineLatest([
            this.api.getApprovals(userId),
            this.api.getVersions(userId),
            this.api.getAssets(userId),
          ]),
        ),
        map(([events, versions, assets]) =>
          events.map(e => {
            const version = versions.find(v => v.id === e.assetVersionId);
            const asset = version ? assets.find(a => a.id === version.assetId) : undefined;
            return {
              ...e,
              versionNo: version?.versionNo ?? 0,
              assetName: asset?.name ?? `Version #${e.assetVersionId}`,
            };
          }),
        ),
      )
      .subscribe(rows => (this.pending.data = rows));
  }

  gateLabel(gate: string): string {
    const map: Record<string, string> = {
      project_admin: 'Project',
      org_admin: 'Organization',
      platform_admin: 'Public',
    };
    return map[gate] ?? gate;
  }

  decide(event: PromotionEventRow, action: 'approved' | 'rejected'): void {
    //  a note is mandatory for every approve/reject decision
    const label = action === 'approved' ? 'approval' : 'rejection';
    const note = window.prompt(`Enter a ${label} note (required):`);
    if (note === null) {
      return; // user cancelled
    }
    if (!note.trim()) {
      alert(`A ${label} note is required.`);
      return;
    }
    const userId = this.userContext.userId$.value;
    this.api
      .decideApproval(event.assetVersionId, {
        gate: event.gate,
        action,
        actorId: userId,
        actorName: `User #${userId}`,
        note: note.trim(),
      })
      .subscribe({
        next: () => this.load(),
        error: err => alert(err?.error?.message || `Failed to ${action} the submission.`),
      });
  }
}
