import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { interval, Subject } from 'rxjs';
import { exhaustMap, takeUntil } from 'rxjs/operators';
import { Services } from '@essedum/shared-lib';
import { ConfirmDeleteDialogComponent } from '@essedum/shared-lib';
import { PodLogDialogComponent } from './pod-log-dialog/pod-log-dialog.component';
import { PodWatcherService, PipelinePodsResponse } from '../../services/pod-watcher.service';

export interface ExecutionPipeline {
  pod_name:         string;
  container_name:   string;
  deployment_name:  string;
  namespace:        string;
  type:             string;
  description:      string;
  execution_status: string;
  container_status: string;
  pod_phase:        string;
  ready:            boolean;
  restarts:         number;
  created_at:       string;
  updated_at:       string;
  age:              string;
  pipelineMode:     'agent' | 'mcp' | 'app';
}

@Component({
  selector: 'app-pipeline-in-execution',
  templateUrl: './pipeline-in-execution.component.html',
  styleUrls: ['./pipeline-in-execution.component.scss'],
})
export class PipelineInExecutionComponent implements OnInit, OnDestroy {
  loading   = true;
  totalPods = 0;
  private destroy$ = new Subject<void>();
  filteredPipelines: ExecutionPipeline[] = [];
  paginatedPipelines: ExecutionPipeline[] = [];
  private allRecords: ExecutionPipeline[] = [];   // all records for current type (unfiltered by status)

  selectedType = 'all';
  selectedStatus = 'all';
  isBackHovered = false;

  // ── Page labels (dynamic, single source of truth) ───────────────────────
  readonly PAGETITLE          = 'Pipelines in Execution';
  readonly FILTERTYPELABEL    = 'Agent Type';
  readonly FILTERSTATUSLABEL  = 'Pipeline Status';
  readonly COLPIPELINE        = 'Pipeline';
  readonly COLPODNAME         = 'Pod Name';
  readonly COLTYPE            = 'Type';
  readonly COLSTATUS          = 'Execution Status';
  readonly COLACTIONS         = 'Actions';
  readonly EMPTYMESSAGE       = 'No pipelines found';
  readonly CLEARFILTERSLABEL  = 'Clear filters';
  readonly LOADINGMESSAGE     = 'Loading pipelines…';
  readonly VIEWPIPELINE              = 'View Pipeline';
  readonly VIEWPODLOGS               = 'View Pod Logs';
  readonly DELETEPOD                 = 'Delete Pod';
  readonly DELETECONTAINER           = 'Delete Container';
  readonly PODDELETEDSUCCESS         = 'Pod deleted successfully!';
  readonly DEPLOYMENTDELETEDSUCCESS  = 'Pipeline deployment deleted!';

  // ── Dynamic filter option definitions ───────────────────────────────────
  readonly typeOptions = [
    { value: 'all',   label: 'All Types', icon: 'layers',    desc: 'View all pipeline types' },
    { value: 'agent', label: 'Agent',     icon: 'smart_toy', desc: 'AI Agent pipelines' },
    { value: 'mcp',   label: 'MCP',       icon: 'hub',       desc: 'MCP server pipelines' },
    { value: 'app',   label: 'App',       icon: 'apps',      desc: 'Application pipelines' },
  ];

  get selectedTypeLabel(): string {
    return this.typeOptions.find(o => o.value === this.selectedType)?.label ?? 'All Types';
  }

  get selectedTypeIcon(): string {
    return this.typeOptions.find(o => o.value === this.selectedType)?.icon ?? 'layers';
  }

  readonly statusOptions = [
    { value: 'all',       label: 'All',      icon: 'layers',                desc: '',                      cssClass: '',                     color: '' },
    { value: 'running',   label: 'Running',  icon: 'sync',                  desc: 'Actively executing',    cssClass: 'status-chip-running',  color: '#38bdf8' },
    { value: 'pending',   label: 'Pending',  icon: 'schedule',              desc: 'Waiting for execution', cssClass: 'status-chip-pending',  color: '#facc15' },
    { value: 'succeeded', label: 'Success',  icon: 'check_circle',          desc: 'Execution completed',   cssClass: 'status-chip-succeeded',color: '#4ade80' },
    { value: 'failed',    label: 'Failed',   icon: 'error',                 desc: 'Execution failed',      cssClass: 'status-chip-failed',   color: '#f87171' },
    { value: 'inactive',  label: 'Inactive', icon: 'remove_circle_outline', desc: 'No active pod',         cssClass: 'status-chip-inactive', color: '#94a3b8' },
  ];

  // Pagination
  readonly pageSize = 5;
  /** Max records to fetch per type to enable client-side pod_phase filtering. */
  private readonly FETCH_SIZE = 1000;
  pageNumber = 1;
  noOfPages = 0;
  pageArr: number[] = [];      // 0-based indices: [0, 1, 2, ...]
  startIndex = 0;              // window start into pageArr
  endIndex = 0;                // window end into pageArr
  hoverStates: boolean[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private dialog: MatDialog,
    private podWatcher: PodWatcherService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedStatus = params['status'] || 'all';
      this.loadAllPipelines();
    });

    // Auto-refresh: re-fetch all records for current type every 15 s
    interval(15000)
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap(() => this.podWatcher.getPipelinePods(
          'all', 1, this.FETCH_SIZE, undefined, this.selectedType
        ))
      )
      .subscribe(res => {
        this.allRecords = (res.records || []).map(r => ({ ...r, pipelineMode: this.modeFromType(r.type) }));
        this.applyClientFilters();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Fetches ALL records for the current type (no status param) then applies client-side filters. */
  loadAllPipelines(): void {
    this.loading = true;
    this.podWatcher
      .getPipelinePods('all', 1, this.FETCH_SIZE, undefined, this.selectedType)
      .subscribe(res => {
        this.allRecords = (res.records || []).map(r => ({ ...r, pipelineMode: this.modeFromType(r.type) }));
        this.applyClientFilters();
        this.loading = false;
      });
  }

  /**
   * Filters allRecords by pod_phase (selectedStatus) client-side,
   * then slices the current page into paginatedPipelines.
   */
  private applyClientFilters(): void {
    let filtered = this.allRecords;
    if (this.selectedStatus !== 'all') {
      filtered = this.allRecords.filter(
        r => (r.pod_phase || '').toLowerCase() === this.selectedStatus
      );
    }
    this.filteredPipelines  = filtered;
    this.totalPods          = filtered.length;
    this.noOfPages          = Math.ceil(filtered.length / this.pageSize);
    this.pageArr            = Array.from({ length: this.noOfPages }, (_, i) => i);
    this.hoverStates        = new Array(this.noOfPages).fill(false);
    const start             = (this.pageNumber - 1) * this.pageSize;
    this.paginatedPipelines = filtered.slice(start, start + this.pageSize);
    this.initializePagination();
  }

  /** Computes the sliding window of max 5 visible page numbers. */
  private initializePagination(): void {
    const visiblePages = 5;
    const halfVisible  = Math.floor(visiblePages / 2);

    if (!this.noOfPages) {
      this.startIndex = 0;
      this.endIndex   = visiblePages;
    } else if (this.noOfPages <= visiblePages) {
      this.startIndex = 0;
      this.endIndex   = this.noOfPages;
    } else if (this.pageNumber <= halfVisible + 1) {
      this.startIndex = 0;
      this.endIndex   = visiblePages;
    } else if (this.pageNumber >= this.noOfPages - halfVisible) {
      this.startIndex = this.noOfPages - visiblePages;
      this.endIndex   = this.noOfPages;
    } else {
      this.startIndex = this.pageNumber - halfVisible - 1;
      this.endIndex   = this.pageNumber + halfVisible;
    }

    this.startIndex = Math.max(0, this.startIndex);
    this.endIndex   = Math.min(this.noOfPages, this.endIndex);
  }

  /** Maps API type string (derived from namespace in service) to internal pipelineMode. */
  private modeFromType(type: string): 'agent' | 'mcp' | 'app' {
    const t = (type || '').toLowerCase();
    if (t === 'agent') { return 'agent'; }
    if (t === 'mcp')   { return 'mcp'; }
    return 'app';
  }

  applyFilters(): void {
    this.pageNumber = 1;
    this.loadAllPipelines();
  }

  onPrevPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.applyClientFilters();   // re-slice only, no API call
    }
  }

  onNextPage(): void {
    if (this.pageNumber < this.noOfPages) {
      this.pageNumber++;
      this.applyClientFilters();   // re-slice only, no API call
    }
  }

  onChangePage(page: number): void {
    if (page >= 1 && page <= this.noOfPages) {
      this.pageNumber = page;
      this.applyClientFilters();   // re-slice only, no API call
    }
  }

  onTypeChange(type: string): void {
    this.selectedType = type;
    this.pageNumber = 1;
    this.loadAllPipelines();       // new type → fetch new data from server
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.pageNumber = 1;
    this.applyClientFilters();     // status change → re-filter cached data, no API call
  }

  clearFilters(): void {
    this.selectedType = 'all';
    this.selectedStatus = 'all';
    this.pageNumber = 1;
    this.loadAllPipelines();       // type reset → re-fetch all
  }

  get hasActiveFilters(): boolean {
    return this.selectedType !== 'all' || this.selectedStatus !== 'all';
  }

  getStatusIcon(status: string): string {
    const s = (status || '').toLowerCase();
    const opt = this.statusOptions.find(o => o.value === s);
    return opt?.icon ?? 'help_outline';
  }

  getStatusLabel(status: string): string {
    const s = (status || '').toLowerCase();
    const opt = this.statusOptions.find(o => o.value === s);
    return opt?.label ?? status;
  }

  getTypeIcon(mode: string): string {
    const opt = this.typeOptions.find(o => o.value === (mode || '').toLowerCase());
    return opt?.icon || 'help_outline';
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: null });
    window.history.back();
  }

  viewPipeline(pipeline: ExecutionPipeline): void {
    const name = pipeline.container_name;
    this.service.getStreamingServicesByName(name).subscribe((res: any) => {
      const navigationExtras: NavigationExtras = {
        queryParams: {
          page: 1,
          search: '',
          pipelineType: pipeline.pipelineMode === 'agent' ? '' : pipeline.pipelineMode,
          org: sessionStorage.getItem('organization'),
          roleId: JSON.parse(sessionStorage.getItem('role') || '{}').id,
        },
        queryParamsHandling: 'merge',
        state: {
          cardTitle: pipeline.pipelineMode === 'mcp'
            ? 'MCP Pipelines'
            : pipeline.pipelineMode === 'app'
            ? 'App Pipelines'
            : 'Pipeline Agent',
          pipelineAlias: res?.alias || pipeline.container_name,
          streamItem: res,
          card: pipeline,
          pipelineMode: pipeline.pipelineMode,
        },
        relativeTo: this.route,
      };

      if (res?.type === 'AIAgent' ||
          res?.type === 'mcpServer' ||
          res?.type === 'appPipeline' ||
          res?.type === 'NativeScript' ||
          pipeline.pipelineMode === 'mcp' ||
          pipeline.pipelineMode === 'app' ||
          (pipeline.pipelineMode === 'agent' && res?.interfacetype === 'pipeline-agent')) {
        this.router.navigate([`../view/${name}`], navigationExtras);
      }
    });
  }

  /** Opens PodLogDialogComponent — the dialog fetches live logs using the pod_name. */
  checkPodLog(pipeline: ExecutionPipeline): void {
    this.dialog.open(PodLogDialogComponent, {
      data: {
        pipelineName: pipeline.container_name,
        pod_name:     pipeline.pod_name,
        namespace:    pipeline.namespace,
      },
      width:      '760px',
      height:     '600px',
      maxWidth:   '95vw',
      maxHeight:  '90vh',
      panelClass: 'pod-log-dialog-panel',
    });
  }

  /** Deletes the pod — K8s recreates it via the ReplicaSet. */
  deletePipelinePod(pipeline: ExecutionPipeline): void {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { entityName: pipeline.pod_name }
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.podWatcher
          .deletePod(pipeline.pod_name, pipeline.namespace)
          .subscribe(() => {
            this.service.message(this.PODDELETEDSUCCESS, 'success');
            this.loadAllPipelines();
          });
      }
    });
  }

  /** Deletes the full K8s deployment + Service + Secret (full teardown). */
  deletePipelineAsContainer(pipeline: ExecutionPipeline): void {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { entityName: pipeline.deployment_name }
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.podWatcher
          .deleteDeployment(pipeline.deployment_name, pipeline.namespace)
          .subscribe(() => {
            this.service.message(this.DEPLOYMENTDELETEDSUCCESS, 'success');
            this.loadAllPipelines();
          });
      }
    });
  }
}
