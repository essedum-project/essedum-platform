import { Component, OnInit, ViewChild, ViewChildren, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
import { combineLatest, switchMap, map, take, of, Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import { NotificationService } from '../../core/notification.service';
import type { PromotionEvent } from '../../core/api-models';
import { ApproveRejectDialogComponent, ApproveRejectDialogResult } from './approve-reject-dialog/approve-reject-dialog.component';

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
export class ApprovalsComponent implements OnInit, AfterViewInit, OnDestroy {
  pending = new MatTableDataSource<PromotionEventRow>([]);
  readyForOrgEscalation: PromotionEventRow[] = [];

  // Streaming services approvals (Pipeline/Agent/MCP) - with pagination support
  streamingApprovals: any[] = [];
  streamingOrgApprovals: any[] = [];
  streamingPlatformApprovals: any[] = [];
  streamingApprovalsDataSource = new MatTableDataSource<any>([]);
  streamingOrgApprovalsDataSource = new MatTableDataSource<any>([]);
  streamingPlatformApprovalsDataSource = new MatTableDataSource<any>([]);

  projectId: number | null = null;
  orgId: number | null = null;
  userRank: number = -1;

  readonly columns = ['assetName', 'versionNo', 'gate', 'actorName', 'occurredAt', 'actions'];
  readonly streamingColumns = ['name', 'type', 'createdBy', 'createdDate', 'status', 'actions'];
  readonly streamingOrgColumns = ['name', 'type', 'createdBy', 'status', 'actions'];
  readonly streamingPlatformColumns = ['name', 'type', 'createdBy', 'status', 'actions'];

  @ViewChild(MatPaginator) legacyPaginator!: MatPaginator;
  @ViewChildren(MatPaginator) allPaginators!: QueryList<MatPaginator>;
  
  private readonly destroy$ = new Subject<void>();

  ngAfterViewInit(): void {
    // Bind legacy paginator
    this.legacyPaginator.pageSizeOptions = [5, 10, 25];
    this.pending.paginator = this.legacyPaginator;

    // Bind paginators for streaming tables
    const paginators = this.allPaginators.toArray();
    if (paginators.length >= 1) {
      this.streamingApprovalsDataSource.paginator = paginators[0];
    }
    if (paginators.length >= 2) {
      this.streamingOrgApprovalsDataSource.paginator = paginators[1];
    }
    if (paginators.length >= 3) {
      this.streamingPlatformApprovalsDataSource.paginator = paginators[2];
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor(
    private readonly api: ApiService,
    private readonly userContext: UserContextService,
    private readonly dialog: MatDialog,
    private readonly notify: NotificationService,
  ) {}

  ngOnInit(): void {
    // Load immediately
    this.load();
    
    // Reload when projectId or orgId changes
    combineLatest([this.userContext.projectId$, this.userContext.orgId$])
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(([projectId, orgId]) => {
        console.log('[APPROVALS] Context changed:', { projectId, orgId });
        this.load();
      });
  }

  private load(): void {
    console.log('[APPROVALS] load() called');
    
    // Log current context from sessionStorage
    try {
      const proj = JSON.parse(sessionStorage.getItem('project') || '{}');
      const org = JSON.parse(sessionStorage.getItem('organisation') || '{}');
      console.log('[APPROVALS] sessionStorage data:', { proj, org });
    } catch (e) {
      console.error('[APPROVALS] Error reading sessionStorage:', e);
    }
    
    combineLatest([this.userContext.userId$, this.userContext.orgId$, this.userContext.projectId$])
      .pipe(
        take(1),
        switchMap(([userId, orgId, projectId]) => {
          console.log('[APPROVALS] Step 1 - Context from UserContextService:', { userId, orgId, projectId });
          
          // Fallback: If projectId is not from UserContextService, try sessionStorage
          let finalProjectId = projectId;
          if (!finalProjectId) {
            try {
              const projObj = JSON.parse(sessionStorage.getItem('project') || '{}');
              finalProjectId = projObj?.id ? Number(projObj.id) : null;
              console.log('[APPROVALS] Step 2a - Got projectId from sessionStorage:', finalProjectId);
            } catch (e) {
              console.error('[APPROVALS] Error reading project from sessionStorage:', e);
            }
          } else {
            console.log('[APPROVALS] Step 2a - Using projectId from UserContextService:', finalProjectId);
          }

          // Fallback: If orgId is not from UserContextService, try sessionStorage
          let finalOrgId = orgId;
          if (!finalOrgId) {
            try {
              const orgObj = JSON.parse(sessionStorage.getItem('organisation') || '{}');
              finalOrgId = orgObj?.id ? Number(orgObj.id) : null;
              console.log('[APPROVALS] Step 2b - Got orgId from sessionStorage:', finalOrgId);
            } catch (e) {
              console.error('[APPROVALS] Error reading organisation from sessionStorage:', e);
            }
          } else {
            console.log('[APPROVALS] Step 2b - Using orgId from UserContextService:', finalOrgId);
          }

          // Store for use in methods
          this.projectId = finalProjectId;
          this.orgId = finalOrgId;

          console.log('[APPROVALS] Step 3 - Final IDs to use:', { finalProjectId, finalOrgId, userId });
          
          // Read rank for platform-admin section
          let streamingUserRank = -1;
          try { streamingUserRank = Number(JSON.parse(sessionStorage.getItem('role') || '{}')?.rank ?? -1); } catch {}
          this.userRank = streamingUserRank;

          // Load NEW streaming service approvals ONLY
          // Rank 2: PENDING_PROJECT_APPROVAL (needs projectId)
          // Rank 3: PENDING_ORG_APPROVAL (needs orgId)
          // Rank 4: PENDING_PLATFORM_APPROVAL (no project/org needed)
          if (!finalProjectId && !finalOrgId && streamingUserRank !== 4) {
            console.warn('[APPROVALS] WARNING: No projectId or orgId found! Will return empty arrays');
            return combineLatest([of([]), of([]), of([])]);
          }

          const streamingApi$ = finalProjectId ? this.api.getProjectAdminApprovals(finalProjectId) : of([]);
          const streamingOrgApi$ = finalOrgId ? this.api.getOrgAdminApprovals(finalOrgId) : of([]);
          const platformApi$ = streamingUserRank === 4 ? this.api.getPlatformAdminApprovals() : of([]);

          return combineLatest([streamingApi$, streamingOrgApi$, platformApi$]);
        }),
        map(([streamingApprovals, streamingOrgApprovals, platformApprovals]) => {
          console.log('[APPROVALS] Step 4 - Received raw data:', { streamingApprovals, streamingOrgApprovals, platformApprovals });
          
          try {
            // Extract data arrays from response objects (API returns {count, data, success})
            // Handle both array and object responses safely
            let approvalsList: any[] = [];
            if (Array.isArray(streamingApprovals)) {
              console.log('[APPROVALS] streamingApprovals is array, using directly');
              approvalsList = streamingApprovals;
            } else if (streamingApprovals && typeof streamingApprovals === 'object') {
              if (Array.isArray(streamingApprovals.data)) {
                console.log('[APPROVALS] streamingApprovals.data is array, extracting');
                approvalsList = streamingApprovals.data;
              } else {
                console.warn('[APPROVALS] streamingApprovals.data is not an array:', streamingApprovals.data);
              }
            }
            
            let orgApprovalsList: any[] = [];
            if (Array.isArray(streamingOrgApprovals)) {
              console.log('[APPROVALS] streamingOrgApprovals is array, using directly');
              orgApprovalsList = streamingOrgApprovals;
            } else if (streamingOrgApprovals && typeof streamingOrgApprovals === 'object') {
              if (Array.isArray(streamingOrgApprovals.data)) {
                console.log('[APPROVALS] streamingOrgApprovals.data is array, extracting');
                orgApprovalsList = streamingOrgApprovals.data;
              } else {
                console.warn('[APPROVALS] streamingOrgApprovals.data is not an array:', streamingOrgApprovals.data);
              }
            }
            
            console.log('[APPROVALS] Step 5 - Extracted arrays:', { 
              approvalsList_length: approvalsList.length, 
              orgApprovalsList_length: orgApprovalsList.length,
              approvalsList,
              orgApprovalsList
            });
            
            // Extract platform approvals (rank 4)
            let platformApprovalsList: any[] = [];
            if (Array.isArray(platformApprovals)) {
              platformApprovalsList = platformApprovals;
            } else if (platformApprovals && typeof platformApprovals === 'object') {
              if (Array.isArray((platformApprovals as any).data)) {
                platformApprovalsList = (platformApprovals as any).data;
              }
            }

            // Store streaming services for display with data sources
            this.streamingApprovals = approvalsList;
            this.streamingApprovalsDataSource.data = approvalsList;

            this.streamingOrgApprovals = orgApprovalsList;
            this.streamingOrgApprovalsDataSource.data = orgApprovalsList;

            this.streamingPlatformApprovals = platformApprovalsList;
            this.streamingPlatformApprovalsDataSource.data = platformApprovalsList;
          } catch (error) {
            console.error('[APPROVALS] Error extracting data:', error);
            this.streamingApprovals = [];
            this.streamingApprovalsDataSource.data = [];

            this.streamingOrgApprovals = [];
            this.streamingOrgApprovalsDataSource.data = [];

            this.streamingPlatformApprovals = [];
            this.streamingPlatformApprovalsDataSource.data = [];
          }
          
          // Return empty array for legacy pending table
          return [];
        }),
      )
      .subscribe({
        next: (rows) => {
          console.log('[APPROVALS] Step 6 - Subscribe success, setting pending.data');
          this.pending.data = rows;
        },
        error: (err) => {
          console.error('[APPROVALS] Step 6 - Subscribe error:', err);
          this.streamingApprovals = [];
          this.streamingApprovalsDataSource.data = [];

          this.streamingOrgApprovals = [];
          this.streamingOrgApprovalsDataSource.data = [];

          this.streamingPlatformApprovals = [];
          this.streamingPlatformApprovalsDataSource.data = [];
        }
      });
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
    this.dialog
      .open(ApproveRejectDialogComponent, { width: '480px', panelClass: 'approve-reject-dialog', data: { action } })
      .afterClosed()
      .subscribe((result: ApproveRejectDialogResult | undefined) => {
        if (!result) {
          return;
        }
        const userId = this.userContext.userId$.value;
        this.api
          .decideApproval(event.assetVersionId, {
            gate: event.gate,
            action,
            actorId: userId,
            actorName: `User #${userId}`,
            note: result.note,
          })
          .subscribe({
            next: () => {
              const msg = action === 'approved' ? 'Asset approved successfully.' : 'Asset rejected.';
              action === 'approved' ? this.notify.success(msg) : this.notify.warning(msg);
              this.load();
            },
            error: err => this.notify.error(err?.error?.message || `Failed to ${action} the submission.`),
          });
      });
  }

  // Streaming service (Pipeline/Agent/MCP) approval methods
  approveStreamingService(resourceId: number, isOrgLevel: boolean = false, isPlatformLevel: boolean = false): void {
    let apiCall$;

    if (isPlatformLevel) {
      apiCall$ = this.api.approvePlatformApproval(resourceId);
    } else if (isOrgLevel) {
      apiCall$ = this.api.approveOrgApproval(resourceId);
    } else {
      // Get projectId from component property or fallback to sessionStorage
      let finalProjectId = this.projectId;
      if (!finalProjectId) {
        try {
          const projObj = JSON.parse(sessionStorage.getItem('project') || '{}');
          finalProjectId = projObj?.id ? Number(projObj.id) : null;
          console.log('[APPROVALS] approveStreamingService - Using projectId from sessionStorage:', finalProjectId);
        } catch (e) {
          console.error('[APPROVALS] Error reading projectId from sessionStorage:', e);
        }
      }
      apiCall$ = this.api.approveProjectApproval(resourceId, finalProjectId || 0);
    }

    apiCall$.subscribe({
      next: () => {
        this.notify.success('Resource approved successfully');
        this.load();
      },
      error: err => this.notify.error(err?.error?.message || 'Failed to approve'),
    });
  }

  rejectStreamingService(resourceId: number, isOrgLevel: boolean = false, isPlatformLevel: boolean = false): void {
    const apiCall$ = isPlatformLevel
      ? this.api.rejectPlatformApproval(resourceId)
      : isOrgLevel
        ? this.api.rejectOrgApproval(resourceId)
        : this.api.rejectProjectApproval(resourceId);

    apiCall$.subscribe({
      next: () => {
        this.notify.success('Resource rejected successfully');
        this.load();
      },
      error: err => this.notify.error(err?.error?.message || 'Failed to reject'),
    });
  }

  /**
   * Check if item is a streaming service (has approval_status field)
   */
  isStreamingService(item: any): boolean {
    return item && item.hasOwnProperty('approval_status') && item.hasOwnProperty('cid');
  }
}
