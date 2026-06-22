import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  readonly VIEWPIPELINE       = 'View Pipeline';
  readonly VIEWPODLOGS        = 'View Pod Logs';
  readonly DELETECONTAINER    = 'Delete Container';

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
  readonly pageSize = 10;
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

    // Auto-refresh pod list every 15 s
    interval(15000)
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap(() => this.podWatcher.getPipelinePods(
          'all', this.pageNumber, this.pageSize, this.selectedStatus, this.selectedType
        ))
      )
      .subscribe(res => this.applyApiResponse(res));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllPipelines(): void {
    this.loading = true;
    this.podWatcher
      .getPipelinePods('all', this.pageNumber, this.pageSize, this.selectedStatus, this.selectedType)
      .subscribe(res => {
        this.applyApiResponse(res);
        this.loading = false;
      });
  }

  private applyApiResponse(res: PipelinePodsResponse): void {
    this.totalPods = res.total;

    // Map records and enforce pod_phase filter client-side for exact matching
    let records = (res.records || []).map(r => ({ ...r, pipelineMode: this.modeFromType(r.type) }));
    if (this.selectedStatus && this.selectedStatus !== 'all') {
      records = records.filter(r => (r.pod_phase || '').toLowerCase() === this.selectedStatus);
    }

    this.filteredPipelines  = records;
    this.paginatedPipelines = records;
    this.noOfPages          = Math.ceil(res.total / this.pageSize);
    this.pageArr            = Array.from({ length: this.noOfPages }, (_, i) => i);
    this.hoverStates        = new Array(this.noOfPages).fill(false);
    this.startIndex         = 0;
    this.endIndex           = this.noOfPages;
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
      this.loadAllPipelines();
    }
  }

  onNextPage(): void {
    if (this.pageNumber < this.noOfPages) {
      this.pageNumber++;
      this.loadAllPipelines();
    }
  }

  onChangePage(page: number): void {
    if (page >= 1 && page <= this.noOfPages) {
      this.pageNumber = page;
      this.loadAllPipelines();
    }
  }

  onTypeChange(type: string): void {
    this.selectedType = type;
    this.applyFilters();
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedType = 'all';
    this.selectedStatus = 'all';
    this.applyFilters();
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
      this.router.navigate(
        [`../view/${name}`],
        {
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
        }
      );
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

  /** Stops the K8s deployment (container_name used as the deployment name). */
  deletePipelineAsContainer(pipeline: ExecutionPipeline): void {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { entityName: pipeline.container_name }
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.podWatcher
          .deleteContainer(pipeline.container_name, pipeline.namespace)
          .subscribe(() => {
            this.service.message('Pipeline container deleted!', 'success');
            this.loadAllPipelines();
          });
      }
    });
  }
}
