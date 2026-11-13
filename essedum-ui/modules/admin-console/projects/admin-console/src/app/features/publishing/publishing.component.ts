import { Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, switchMap, map, of, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil, catchError, take } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
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

  // Model drafts
  modelDrafts: any[] = [];
  modelDraftsDataSource = new MatTableDataSource<any>([]);
  modelOrgDrafts: any[] = [];
  modelOrgDraftsDataSource = new MatTableDataSource<any>([]);

  modelDraftsTotal = 0;
  modelDraftsPageIndex = 0;
  modelDraftsPageSize = 5;
  modelOrgDraftsTotal = 0;
  modelOrgDraftsPageIndex = 0;
  modelOrgDraftsPageSize = 5;
  readonly modelPageSizeOptions = [5, 10, 25];

  // Server-side pagination for the Connections tab (datasources).
  datasourceDraftsTotal = 0;
  datasourceDraftsPageIndex = 0;
  datasourceDraftsPageSize = 5;
  datasourceOrgDraftsTotal = 0;
  datasourceOrgDraftsPageIndex = 0;
  datasourceOrgDraftsPageSize = 5;
  readonly datasourcePageSizeOptions = [5, 10, 25];

  projectId: number | null = null;
  orgId: number | null = null;
  /** Org id used for ORG_APPROVED lookups (portfoliodata.id — see load()). */
  private approvalOrgId: number | null = null;

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
          // Rank 3: ORG_APPROVED resources — must query by portfoliodata.id (the same value stored
          // in approvedOrganizationId during org approval), not project.organisationId which is a
          // different numeric ID and causes a mismatch.
          let approvalOrgId = orgId;
          try {
            const pd = JSON.parse(sessionStorage.getItem('portfoliodata') || '{}');
            if (pd?.id) { approvalOrgId = Number(pd.id); }
          } catch {}
          this.approvalOrgId = approvalOrgId;
          const streamingRank3$ = (streamingRank === 3 && approvalOrgId) ? this.api.getOrgAdminDraftResources(approvalOrgId) : of([]);

          const datasetRank2$ = (streamingRank === 2 && projectId) ? this.api.getDatasetDraftResources(projectId).pipe(catchError(() => of([]))) : of([]);
          const datasetRank3$ = (streamingRank === 3 && approvalOrgId) ? this.api.getDatasetOrgDraftResources(approvalOrgId).pipe(catchError(() => of([]))) : of([]);
          const datasourceRank2$ = (streamingRank === 2 && projectId)
            ? this.api.getDatasourceDraftResources(projectId, this.datasourceDraftsPageIndex, this.datasourceDraftsPageSize).pipe(catchError(() => of([])))
            : of([]);
          const datasourceRank3$ = (streamingRank === 3 && approvalOrgId)
            ? this.api.getDatasourceOrgDraftResources(approvalOrgId, this.datasourceOrgDraftsPageIndex, this.datasourceOrgDraftsPageSize).pipe(catchError(() => of([])))
            : of([]);

          const modelRank2$ = (streamingRank === 2 && projectId)
            ? this.api.getModelDraftResources(projectId, this.modelDraftsPageIndex, this.modelDraftsPageSize).pipe(catchError(() => of([])))
            : of([]);
          const modelRank3$ = (streamingRank === 3 && approvalOrgId)
            ? this.api.getModelOrgDraftResources(approvalOrgId, this.modelOrgDraftsPageIndex, this.modelOrgDraftsPageSize).pipe(catchError(() => of([])))
            : of([]);

          return combineLatest([
            this.api.getDraftVersions(userId, orgId, projectId),
            this.api.getAssets(userId, orgId, projectId),
            streamingRank2$,
            streamingRank3$,
            datasetRank2$,
            datasetRank3$,
            datasourceRank2$,
            datasourceRank3$,
            modelRank2$,
            modelRank3$
          ]);
        }),
        map(([versions, assets, streamingRank2, streamingRank3, datasetRank2, datasetRank3, datasourceRank2, datasourceRank3, modelRank2, modelRank3]) => {
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
          this.datasetDrafts = extractArr(datasetRank2).filter((s: any) => (s.approvalStatus || s.approval_status) === 'PROJECT_APPROVED');
          this.datasetDraftsDataSource.data = this.datasetDrafts;
          this.datasetOrgDrafts = extractArr(datasetRank3);
          this.datasetOrgDraftsDataSource.data = this.datasetOrgDrafts;

          // Datasource drafts (Connections tab — server-paginated)
          this.datasourceDrafts = extractArr(datasourceRank2).filter((s: any) => s.approval_status === 'PROJECT_APPROVED');
          this.datasourceDraftsDataSource.data = this.datasourceDrafts;
          this.datasourceDraftsTotal = this.extractCount(datasourceRank2, this.datasourceDrafts);
          this.datasourceOrgDrafts = extractArr(datasourceRank3);
          this.datasourceOrgDraftsDataSource.data = this.datasourceOrgDrafts;
          this.datasourceOrgDraftsTotal = this.extractCount(datasourceRank3, this.datasourceOrgDrafts);

          // Model drafts (server-paginated)
          this.modelDrafts = extractArr(modelRank2).filter((s: any) => (s.approvalStatus || s.approval_status) === 'PROJECT_APPROVED');
          this.modelDraftsDataSource.data = this.modelDrafts;
          this.modelDraftsTotal = this.extractCount(modelRank2, this.modelDrafts);
          this.modelOrgDrafts = extractArr(modelRank3);
          this.modelOrgDraftsDataSource.data = this.modelOrgDrafts;
          this.modelOrgDraftsTotal = this.extractCount(modelRank3, this.modelOrgDrafts);

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
        this.notify.success(`${resource.alias || resource.name} submitted to organization for approval`);
        
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
      error: () => this.notify.error(`Failed to submit ${resource.alias || resource.name}`),
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
      error: () => this.notify.error(`Failed to submit ${resource.alias || resource.name}`),
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
      error: () => this.notify.error(`Failed to submit ${resource.alias || resource.name}`),
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
      error: () => this.notify.error(`Failed to submit ${resource.alias || resource.name}`),
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

  /** Total record count for server-side pagination, falling back to the page length. */
  private extractCount(raw: any, pageRows: any[]): number {
    const count = raw?.count;
    return typeof count === 'number' ? count : pageRows.length;
  }

  onDatasourceDraftsPage(event: PageEvent): void {
    this.datasourceDraftsPageIndex = event.pageIndex;
    this.datasourceDraftsPageSize = event.pageSize;
    if (!this.projectId) return;
    this.api.getDatasourceDraftResources(this.projectId, this.datasourceDraftsPageIndex, this.datasourceDraftsPageSize)
      .pipe(take(1), catchError(() => of([])))
      .subscribe((raw: any) => {
        const rows = (Array.isArray(raw) ? raw : (raw?.data ?? [])).filter((s: any) => s.approval_status === 'PROJECT_APPROVED');
        this.datasourceDrafts = rows;
        this.datasourceDraftsDataSource.data = rows;
        this.datasourceDraftsTotal = this.extractCount(raw, rows);
      });
  }

  onDatasourceOrgDraftsPage(event: PageEvent): void {
    this.datasourceOrgDraftsPageIndex = event.pageIndex;
    this.datasourceOrgDraftsPageSize = event.pageSize;
    if (!this.approvalOrgId) return;
    this.api.getDatasourceOrgDraftResources(this.approvalOrgId, this.datasourceOrgDraftsPageIndex, this.datasourceOrgDraftsPageSize)
      .pipe(take(1), catchError(() => of([])))
      .subscribe((raw: any) => {
        const rows = Array.isArray(raw) ? raw : (raw?.data ?? []);
        this.datasourceOrgDrafts = rows;
        this.datasourceOrgDraftsDataSource.data = rows;
        this.datasourceOrgDraftsTotal = this.extractCount(raw, rows);
      });
  }

  submitModelToOrg(resource: any): void {
    if (!this.orgId) { this.notify.error('Organization not set.'); return; }
    this.api.submitModelForOrgApproval(resource.id, this.orgId).subscribe({
      next: () => {
        this.notify.success(`${resource.modelName || resource.model_name} submitted to organization for approval`);
        this.modelDrafts = this.modelDrafts.filter(s => s.id !== resource.id);
        this.modelDraftsDataSource.data = [...this.modelDrafts];
        this.load();
      },
      error: err => this.notify.error(err?.error?.message || 'Failed to submit'),
    });
  }

  submitModelToPlatform(resource: any): void {
    this.api.submitModelForPlatformApproval(resource.id).subscribe({
      next: () => {
        this.notify.success(`${resource.modelName || resource.model_name} submitted to Platform Admin for approval`);
        this.modelOrgDrafts = this.modelOrgDrafts.filter(s => s.id !== resource.id);
        this.modelOrgDraftsDataSource.data = [...this.modelOrgDrafts];
        this.load();
      },
      error: err => this.notify.error(err?.error?.message || 'Failed to submit'),
    });
  }

  onModelDraftsPage(event: PageEvent): void {
    this.modelDraftsPageIndex = event.pageIndex;
    this.modelDraftsPageSize = event.pageSize;
    if (!this.projectId) return;
    this.api.getModelDraftResources(this.projectId, this.modelDraftsPageIndex, this.modelDraftsPageSize)
      .pipe(take(1), catchError(() => of([])))
      .subscribe((raw: any) => {
        const rows = (Array.isArray(raw) ? raw : (raw?.data ?? [])).filter((s: any) => (s.approvalStatus || s.approval_status) === 'PROJECT_APPROVED');
        this.modelDrafts = rows;
        this.modelDraftsDataSource.data = rows;
        this.modelDraftsTotal = this.extractCount(raw, rows);
      });
  }

  onModelOrgDraftsPage(event: PageEvent): void {
    this.modelOrgDraftsPageIndex = event.pageIndex;
    this.modelOrgDraftsPageSize = event.pageSize;
    if (!this.approvalOrgId) return;
    this.api.getModelOrgDraftResources(this.approvalOrgId, this.modelOrgDraftsPageIndex, this.modelOrgDraftsPageSize)
      .pipe(take(1), catchError(() => of([])))
      .subscribe((raw: any) => {
        const rows = Array.isArray(raw) ? raw : (raw?.data ?? []);
        this.modelOrgDrafts = rows;
        this.modelOrgDraftsDataSource.data = rows;
        this.modelOrgDraftsTotal = this.extractCount(raw, rows);
      });
  }
}
