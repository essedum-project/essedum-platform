import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, switchMap, map } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import type { AssetVersion } from '../../core/api-models';
import { DraftDialogComponent, DraftDialogResult } from './draft-dialog/draft-dialog.component';

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
export class PublishingComponent implements OnInit {
  versions: AssetVersionRow[] = [];
  // versionId -> next gate ('project_admin' | 'org_admin' | 'platform_admin' | null)
  nextGateByVersion: Record<number, string | null> = {};

  readonly columns = ['assetName', 'versionNo', 'status', 'nextGate', 'updatedAt', 'actions'];

  constructor(
    private readonly api: ApiService,
    private readonly userContext: UserContextService,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.userContext.userId$
      .pipe(
        switchMap(userId =>
          combineLatest([this.api.getDraftVersions(userId), this.api.getAssets(userId)]),
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
        this.versions = rows;
        this.nextGateByVersion = {};
        rows.forEach(row =>
          this.api.getNextGate(row.id).subscribe(res => (this.nextGateByVersion[row.id] = res.gate)),
        );
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
            next: () => this.load(),
            error: err => alert(err?.error?.message || 'Failed to create the draft.'),
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
            next: () => this.load(),
            error: err => alert(err?.error?.message || 'Failed to save the draft.'),
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
        next: () => this.load(),
        error: err => alert(err?.error?.message || 'Failed to submit for approval.'),
      });
  }

  canSubmit(version: AssetVersionRow): boolean {
    return version.status === 'draft' || version.status === 'rejected';
  }

  canEdit(version: AssetVersionRow): boolean {
    return version.status === 'draft' || version.status === 'rejected';
  }
}
