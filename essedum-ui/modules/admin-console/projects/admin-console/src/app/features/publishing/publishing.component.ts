import { Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, switchMap, map, of, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
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
export class PublishingComponent implements OnInit, AfterViewInit, OnDestroy {
  versions = new MatTableDataSource<AssetVersionRow>([]);
  // versionId -> next gate ('project_admin' | 'org_admin' | 'platform_admin' | null)
  nextGateByVersion: Record<number, string | null> = {};
  // versionId -> latest rejection note 
  rejectionNoteByVersion: Record<number, string> = {};
  /** The caller's highest role rank — drives "New Draft" visibility. */
  userRank = 0;

  // Streaming services (Pipeline/Agent/MCP) with PROJECT_APPROVED status ready to submit to org
  streamingServicesDrafts: any[] = [];
  streamingServicesDraftsDataSource = new MatTableDataSource<any>([]);
  projectId: number | null = null;
  orgId: number | null = null;

  @ViewChild(MatPaginator) legacyPaginator!: MatPaginator;
  @ViewChild('streamingPaginator') streamingPaginator!: MatPaginator;

  private readonly destroy$ = new Subject<void>();

  ngAfterViewInit(): void {
    this.versions.paginator = this.legacyPaginator;
    
    // Bind streaming paginators
    if (this.streamingPaginator) {
      this.streamingServicesDraftsDataSource.paginator = this.streamingPaginator;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  readonly columns = ['assetName', 'versionNo', 'status', 'comments', 'nextGate', 'updatedAt', 'actions'];
  readonly streamingColumns = ['name', 'type', 'createdBy', 'status', 'actions'];

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
        distinctUntilChanged((prev, curr) => 
          prev[0] === curr[0] && prev[1] === curr[1] && prev[2] === curr[2]
        ),
        switchMap(([userId, ctxOrgId, ctxProjectId]) => {
          // userContext.orgId$ reads project.organisationId which is often null;
          // fall back to portfoliodata.id (the org the user selected in the thumbnail).
          let orgId = ctxOrgId;
          if (!orgId) {
            try {
              const pd = JSON.parse(sessionStorage.getItem('portfoliodata') || '{}');
              orgId = pd?.id ? Number(pd.id) : null;
            } catch {}
          }
          let projectId = ctxProjectId;
          if (!projectId) {
            try {
              const proj = JSON.parse(sessionStorage.getItem('project') || '{}');
              projectId = proj?.id ? Number(proj.id) : null;
            } catch {}
          }
          console.log('[PUBLISHING] load() - context: userId:', userId, 'orgId:', orgId, 'projectId:', projectId);
          // Store for use in submitToOrg / other methods
          this.projectId = projectId;
          this.orgId = orgId;

          // Load streaming services with PROJECT_APPROVED status (Rank 2 can submit to org)
          const streamingApi$ = projectId ? this.api.getDraftResources(projectId) : of([]);

          return combineLatest([
            this.api.getDraftVersions(userId, orgId, projectId),
            this.api.getAssets(userId, orgId, projectId),
            streamingApi$
          ]);
        }),
        map(([versions, assets, streamingServices]) => {
          console.log('[PUBLISHING] Data loaded - versions:', versions?.length, 'assets:', assets?.length, 'streaming response:', streamingServices);
          
          // Extract data array from API response wrapper
          let streamingArray: any[] = [];
          if (streamingServices) {
            if (Array.isArray(streamingServices)) {
              streamingArray = streamingServices;
            } else if (streamingServices.data && Array.isArray(streamingServices.data)) {
              streamingArray = streamingServices.data;
            }
          }
          console.log('[PUBLISHING] Extracted streaming array length:', streamingArray.length);
          
          // Process asset versions
          const processedVersions = versions.map(v => {
            const asset = assets.find(a => a.id === v.assetId);
            return {
              ...v,
              assetName: asset?.name ?? `Asset #${v.assetId}`,
              assetScope: asset?.scope ?? 'draft',
            };
          });
          
          // Filter and store streaming services that are PROJECT_APPROVED
          this.streamingServicesDrafts = streamingArray.filter(
            s => s.approval_status === 'PROJECT_APPROVED'
          );
          console.log('[PUBLISHING] Filtered streaming drafts:', this.streamingServicesDrafts.length, 'resources:', this.streamingServicesDrafts);
          this.streamingServicesDraftsDataSource.data = this.streamingServicesDrafts;
          
          return processedVersions;
        }),
        takeUntil(this.destroy$)
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

  // Streaming service (Pipeline/Agent/MCP) methods
  submitToOrg(resource: any): void {
    if (!this.orgId) {
      this.notify.error('Organization not set. Please refresh the page.');
      return;
    }

    this.api.submitForOrgApproval(resource.cid, this.orgId).subscribe({
      next: () => {
        this.notify.success(`${resource.name} submitted to organization for approval`);
        
        // Remove submitted resource from the drafts list immediately
        const index = this.streamingServicesDrafts.findIndex(s => s.cid === resource.cid);
        if (index !== -1) {
          this.streamingServicesDrafts.splice(index, 1);
          this.streamingServicesDraftsDataSource.data = [...this.streamingServicesDrafts];
          console.log('[PUBLISHING] Removed submitted resource, remaining drafts:', this.streamingServicesDrafts.length);
        }
        
        // Also refresh legacy version data if needed
        this.load();
      },
      error: err => this.notify.error(err?.error?.message || 'Failed to submit'),
    });
  }

  /**
   * Check if item is a streaming service (has approval_status field)
   */
  isStreamingService(item: any): boolean {
    return item && item.hasOwnProperty('approval_status');
  }
}
