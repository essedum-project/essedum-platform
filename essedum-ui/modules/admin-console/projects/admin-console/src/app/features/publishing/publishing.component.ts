import { Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, switchMap, map, of, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil, catchError } from 'rxjs/operators';
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

  // Rank 2: PROJECT_APPROVED resources ready to submit to org
  streamingServicesDrafts: any[] = [];
  streamingServicesDraftsDataSource = new MatTableDataSource<any>([]);
  // Rank 3: ORG_APPROVED resources ready to submit to platform admin
  streamingOrgDrafts: any[] = [];
  streamingOrgDraftsDataSource = new MatTableDataSource<any>([]);

  // Dataset drafts
  datasetDrafts: any[] = [];
  datasetDraftsDataSource = new MatTableDataSource<any>([]);
  datasetOrgDrafts: any[] = [];
  datasetOrgDraftsDataSource = new MatTableDataSource<any>([]);

  // Datasource drafts
  datasourceDrafts: any[] = [];
  datasourceDraftsDataSource = new MatTableDataSource<any>([]);
  datasourceOrgDrafts: any[] = [];
  datasourceOrgDraftsDataSource = new MatTableDataSource<any>([]);
  projectId: number | null = null;
  orgId: number | null = null;

  @ViewChild(MatPaginator) legacyPaginator!: MatPaginator;
  @ViewChild('streamingPaginator') streamingPaginator!: MatPaginator;
  @ViewChild('orgStreamingPaginator') orgStreamingPaginator!: MatPaginator;

  private readonly destroy$ = new Subject<void>();

  ngAfterViewInit(): void {
    this.versions.paginator = this.legacyPaginator;

    if (this.streamingPaginator) {
      this.streamingServicesDraftsDataSource.paginator = this.streamingPaginator;
    }
    if (this.orgStreamingPaginator) {
      this.streamingOrgDraftsDataSource.paginator = this.orgStreamingPaginator;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  readonly columns = ['assetName', 'versionNo', 'status', 'comments', 'nextGate', 'updatedAt', 'actions'];
  readonly streamingColumns = ['name', 'type', 'createdBy', 'status', 'actions'];
  readonly orgStreamingColumns = ['name', 'type', 'createdBy', 'status', 'actions'];

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

          // Read rank from sessionStorage for immediate use in streaming section
          let streamingRank = 0;
          try { streamingRank = Number(JSON.parse(sessionStorage.getItem('role') || '{}')?.rank ?? 0); } catch {}
          if (streamingRank > 0) { this.userRank = streamingRank; }

          // Rank 2: PROJECT_APPROVED resources ready to submit to org
          const streamingRank2$ = projectId ? this.api.getDraftResources(projectId) : of([]);
          // Rank 3: ORG_APPROVED resources ready to submit to platform admin
          const streamingRank3$ = (streamingRank === 3 && orgId) ? this.api.getOrgAdminDraftResources(orgId) : of([]);

          const datasetRank2$ = (streamingRank === 2 && projectId) ? this.api.getDatasetDraftResources(projectId).pipe(catchError(() => of([]))) : of([]);
          const datasetRank3$ = (streamingRank === 3 && orgId) ? this.api.getDatasetOrgDraftResources(orgId).pipe(catchError(() => of([]))) : of([]);
          const datasourceRank2$ = (streamingRank === 2 && projectId) ? this.api.getDatasourceDraftResources(projectId).pipe(catchError(() => of([]))) : of([]);
          const datasourceRank3$ = (streamingRank === 3 && orgId) ? this.api.getDatasourceOrgDraftResources(orgId).pipe(catchError(() => of([]))) : of([]);

          return combineLatest([
            this.api.getDraftVersions(userId, orgId, projectId),
            this.api.getAssets(userId, orgId, projectId),
            streamingRank2$,
            streamingRank3$,
            datasetRank2$,
            datasetRank3$,
            datasourceRank2$,
            datasourceRank3$
          ]);
        }),
        map(([versions, assets, streamingRank2, streamingRank3, datasetRank2, datasetRank3, datasourceRank2, datasourceRank3]) => {
          console.log('[PUBLISHING] Data loaded - versions:', versions?.length, 'assets:', assets?.length, 'rank2:', streamingRank2, 'rank3:', streamingRank3);

          // Extract rank 2 data (PROJECT_APPROVED)
          let rank2Array: any[] = [];
          if (Array.isArray(streamingRank2)) {
            rank2Array = streamingRank2;
          } else if (streamingRank2?.data && Array.isArray(streamingRank2.data)) {
            rank2Array = streamingRank2.data;
          }

          // Extract rank 3 data (ORG_APPROVED)
          let rank3Array: any[] = [];
          if (Array.isArray(streamingRank3)) {
            rank3Array = streamingRank3;
          } else if (streamingRank3?.data && Array.isArray(streamingRank3.data)) {
            rank3Array = streamingRank3.data;
          }

          // Process asset versions
          const processedVersions = versions.map(v => {
            const asset = assets.find(a => a.id === v.assetId);
            return {
              ...v,
              assetName: asset?.name ?? `Asset #${v.assetId}`,
              assetScope: asset?.scope ?? 'draft',
            };
          });

          // Rank 2: PROJECT_APPROVED resources ready for org submission
          this.streamingServicesDrafts = rank2Array.filter(
            s => s.approval_status === 'PROJECT_APPROVED'
          );
          console.log('[PUBLISHING] Rank2 drafts:', this.streamingServicesDrafts.length);
          this.streamingServicesDraftsDataSource.data = this.streamingServicesDrafts;

          // Rank 3: ORG_APPROVED resources ready for platform submission
          this.streamingOrgDrafts = rank3Array;
          console.log('[PUBLISHING] Rank3 org drafts:', this.streamingOrgDrafts.length);
          this.streamingOrgDraftsDataSource.data = this.streamingOrgDrafts;

          // Dataset drafts
          const extractArr = (raw: any): any[] => Array.isArray(raw) ? raw : (raw?.data && Array.isArray(raw.data) ? raw.data : []);
          this.datasetDrafts = extractArr(datasetRank2).filter((s: any) => s.approval_status === 'PROJECT_APPROVED');
          this.datasetDraftsDataSource.data = this.datasetDrafts;
          this.datasetOrgDrafts = extractArr(datasetRank3);
          this.datasetOrgDraftsDataSource.data = this.datasetOrgDrafts;

          // Datasource drafts
          this.datasourceDrafts = extractArr(datasourceRank2).filter((s: any) => s.approval_status === 'PROJECT_APPROVED');
          this.datasourceDraftsDataSource.data = this.datasourceDrafts;
          this.datasourceOrgDrafts = extractArr(datasourceRank3);
          this.datasourceOrgDraftsDataSource.data = this.datasourceOrgDrafts;

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

  // Rank 3 Org Admin: submit ORG_APPROVED resource to Platform Admin for global publishing
  submitToPlatform(resource: any): void {
    this.api.submitForPlatformApproval(resource.cid).subscribe({
      next: () => {
        this.notify.success(`${resource.alias || resource.name} submitted to Platform Admin for approval`);
        const index = this.streamingOrgDrafts.findIndex(s => s.cid === resource.cid);
        if (index !== -1) {
          this.streamingOrgDrafts.splice(index, 1);
          this.streamingOrgDraftsDataSource.data = [...this.streamingOrgDrafts];
        }
        this.load();
      },
      error: err => this.notify.error(err?.error?.message || 'Failed to submit for platform approval'),
    });
  }

  /**
   * Check if item is a streaming service (has approval_status field)
   */
  isStreamingService(item: any): boolean {
    return item && item.hasOwnProperty('approval_status');
  }

  submitDatasetToOrg(resource: any): void {
    if (!this.orgId) { this.notify.error('Organization not set.'); return; }
    this.api.submitDatasetForOrgApproval(resource.id, this.orgId).subscribe({
      next: () => {
        this.notify.success(`${resource.alias || resource.name} submitted to organization for approval`);
        this.datasetDrafts = this.datasetDrafts.filter(s => s.id !== resource.id);
        this.datasetDraftsDataSource.data = [...this.datasetDrafts];
        this.load();
      },
      error: err => this.notify.error(err?.error?.message || 'Failed to submit'),
    });
  }

  submitDatasetToPlatform(resource: any): void {
    this.api.submitDatasetForPlatformApproval(resource.id).subscribe({
      next: () => {
        this.notify.success(`${resource.alias || resource.name} submitted to Platform Admin for approval`);
        this.datasetOrgDrafts = this.datasetOrgDrafts.filter(s => s.id !== resource.id);
        this.datasetOrgDraftsDataSource.data = [...this.datasetOrgDrafts];
        this.load();
      },
      error: err => this.notify.error(err?.error?.message || 'Failed to submit'),
    });
  }

  submitDatasourceToOrg(resource: any): void {
    if (!this.orgId) { this.notify.error('Organization not set.'); return; }
    this.api.submitDatasourceForOrgApproval(resource.id, this.orgId).subscribe({
      next: () => {
        this.notify.success(`${resource.alias || resource.name} submitted to organization for approval`);
        this.datasourceDrafts = this.datasourceDrafts.filter(s => s.id !== resource.id);
        this.datasourceDraftsDataSource.data = [...this.datasourceDrafts];
        this.load();
      },
      error: err => this.notify.error(err?.error?.message || 'Failed to submit'),
    });
  }

  submitDatasourceToPlatform(resource: any): void {
    this.api.submitDatasourceForPlatformApproval(resource.id).subscribe({
      next: () => {
        this.notify.success(`${resource.alias || resource.name} submitted to Platform Admin for approval`);
        this.datasourceOrgDrafts = this.datasourceOrgDrafts.filter(s => s.id !== resource.id);
        this.datasourceOrgDraftsDataSource.data = [...this.datasourceOrgDrafts];
        this.load();
      },
      error: err => this.notify.error(err?.error?.message || 'Failed to submit'),
    });
  }
}
