import { Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, switchMap, map, take } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import { NotificationService } from '../../core/notification.service';
import type { AssetVersion } from '../../core/api-models';
import { DraftDialogComponent, DraftDialogResult } from './draft-dialog/draft-dialog.component';

/** Minimum rank to create a draft — mirrors rbac_menu_item.min_role_rank for "My Drafts". */
const MIN_RANK_CREATE = 1;

interface AssetVersionRow extends AssetVersion {
  assetName: string;
  assetScope: string;
}

// Human labels for the gate a version is heading to next — §5 ladder.
const GATE_LABEL: Record<string, string> = {
  project_admin: 'Project',
  org_admin: 'Organization',
  platform_admin: 'Public',
};

@Component({
  selector: 'app-publishing',
  templateUrl: './publishing.component.html',
  styleUrls: ['./publishing.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class PublishingComponent implements OnInit, AfterViewInit {
  versions = new MatTableDataSource<AssetVersionRow>([]);
  // versionId -> next gate ('project_admin' | 'org_admin' | 'platform_admin' | null)
  nextGateByVersion: Record<number, string | null> = {};
  // versionId -> latest rejection note 
  rejectionNoteByVersion: Record<number, string> = {};
  /** The caller's highest role rank — drives "New Draft" visibility. */
  userRank = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.versions.paginator = this.paginator;
  }

  readonly columns = ['assetName', 'versionNo', 'status', 'comments', 'nextGate', 'updatedAt', 'actions'];

  constructor(
    private readonly api: ApiService,
    private readonly userContext: UserContextService,
    private readonly dialog: MatDialog,
    private readonly notify: NotificationService,
  ) {}

  ngOnInit(): void {
    this.load();
    // Resolve rank once so the template can show/hide "New Draft".
    this.userContext.userId$
      .pipe(switchMap(uid => this.api.getAccessContext(uid)))
      .subscribe(ctx => (this.userRank = ctx?.highestRank ?? 0));
  }

  private load(): void {
    combineLatest([this.userContext.userId$, this.userContext.orgId$, this.userContext.projectId$])
      .pipe(
        take(1),
        switchMap(([userId, orgId, projectId]) =>
          combineLatest([
            this.api.getDraftVersions(userId, orgId, projectId),
            this.api.getAssets(userId, orgId, projectId),
          ]),
        ),
        map(([versions, assets]) =>
          versions.map(v => {
            const asset = assets.find(a => a.id === v.assetId);
            return {
              ...v,
              assetName: asset?.name ?? `Asset #${v.assetId}`,
              assetScope: asset?.scope ?? 'draft',
            };
          }),
        ),
      )
      .subscribe(rows => {
        this.versions.data = rows;
        this.nextGateByVersion = {};
        this.rejectionNoteByVersion = {};
        rows.forEach(row => {
          this.api.getNextGate(row.id).subscribe(res => (this.nextGateByVersion[row.id] = res.gate));
          //  load the rejection note for rejected versions so it appears in My Drafts
          if (row.status === 'rejected') {
            this.api.getVersionEvents(row.id).subscribe(events => {
              const latest = events
                .filter(e => e.action === 'rejected')
                .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0];
              if (latest?.note) {
                this.rejectionNoteByVersion[row.id] = latest.note;
              }
            });
          }
        });
      });
  }

  gateLabel(versionId: number): string {
    const gate = this.nextGateByVersion[versionId];
    if (gate === null) {
      return 'Public';
    }
    return gate ? GATE_LABEL[gate] ?? gate : '…';
  }

  newDraft(): void {
    this.dialog
      .open(DraftDialogComponent, { width: '480px', data: { mode: 'create' } })
      .afterClosed()
      .subscribe((result: DraftDialogResult | undefined) => {
        if (!result || result.projectId == null) {
          return;
        }
        const userId = this.userContext.userId$.value;
        this.api
          .createAsset({
            projectId: result.projectId,
            assetType: result.assetType,
            name: result.name,
            payloadRef: result.payloadRef,
            actorId: userId,
            actorName: `User #${userId}`,
          })
          .subscribe({
            next: () => { this.notify.success('Draft created successfully.'); this.load(); },
            error: err => this.notify.error(err?.error?.message || 'Failed to create the draft.'),
          });
      });
  }

  edit(version: AssetVersionRow): void {
    this.dialog
      .open(DraftDialogComponent, {
        width: '480px',
        data: {
          mode: 'edit',
          versionId: version.id,
          name: version.assetName,
          assetType: version.assetScope,
          payloadRef: version.payloadRef ?? '',
        },
      })
      .afterClosed()
      .subscribe((result: DraftDialogResult | undefined) => {
        if (!result) {
          return;
        }
        const userId = this.userContext.userId$.value;
        this.api
          .editVersion(version.id, {
            name: result.name,
            payloadRef: result.payloadRef,
            actorId: userId,
            actorName: `User #${userId}`,
          })
          .subscribe({
            next: () => { this.notify.success('Draft saved successfully.'); this.load(); },
            error: err => this.notify.error(err?.error?.message || 'Failed to save the draft.'),
          });
      });
  }

  // Submit to the next gate — the backend computes which gate from the
  // version's own promotion history; §5 state machine.
  submit(version: AssetVersionRow): void {
    const userId = this.userContext.userId$.value;
    this.api
      .submitVersion(version.id, { actorId: userId, actorName: `User #${userId}`, note: '' })
      .subscribe({
        next: () => { this.notify.success('Submitted for review successfully.'); this.load(); },
        error: err => this.notify.error(err?.error?.message || 'Failed to submit for approval.'),
      });
  }

  canSubmit(version: AssetVersionRow): boolean {
    return version.status === 'draft' || version.status === 'rejected';
  }

  canEdit(version: AssetVersionRow): boolean {
    return version.status === 'draft' || version.status === 'rejected';
  }

  /** Returns the rejection note for a rejected version  Empty string when none loaded yet. */
  rejectionNote(versionId: number): string {
    return this.rejectionNoteByVersion[versionId] ?? '';
  }

  /** Human-readable label for asset_version.status — TC-083 requires "in review" not "in_review". */
  statusLabel(status: string): string {
    const map: Record<string, string> = {
      draft: 'Draft',
      in_review: 'In Review',
      published: 'Published',
      rejected: 'Rejected',
    };
    return map[status] ?? status;
  }

  /** "New Draft" is only visible to users with rank ≥ 1 (Developer+). */
  get canCreate(): boolean {
    return this.userRank >= MIN_RANK_CREATE;
  }
}
