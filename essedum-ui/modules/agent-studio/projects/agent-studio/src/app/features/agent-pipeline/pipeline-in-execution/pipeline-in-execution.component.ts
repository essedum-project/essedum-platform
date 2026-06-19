import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { interval, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { Services } from '@essedum/shared-lib';
import { ConfirmDeleteDialogComponent } from '@essedum/shared-lib';
import { PodLogDialogComponent } from './pod-log-dialog/pod-log-dialog.component';
import { PodWatcherService } from '../../services/pod-watcher.service';

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
  loading = true;
  allPipelines: ExecutionPipeline[] = [];
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
    { value: 'all',      label: 'All', icon: 'layers',                desc: '',                      cssClass: '',                    color: '' },
    { value: 'running',  label: 'Running',      icon: 'sync',                  desc: 'Actively executing',    cssClass: 'status-chip-running', color: '#38bdf8' },
    { value: 'queued',   label: 'Queued',       icon: 'schedule',              desc: 'Waiting for execution', cssClass: 'status-chip-queued',  color: '#facc15' },
    { value: 'success',  label: 'Success',      icon: 'check_circle',          desc: 'Execution completed',   cssClass: 'status-chip-success', color: '#4ade80' },
    { value: 'failed',   label: 'Failed',       icon: 'error',                 desc: 'Execution failed',      cssClass: 'status-chip-failed',  color: '#f87171' },
    { value: 'inactive', label: 'Inactive',     icon: 'remove_circle_outline', desc: 'No Active pod',         cssClass: 'status-chip-inactive',color: '#94a3b8' },
  ];

  // Pagination
  readonly pageSize = 5;
  pageNumber = 1;
  noOfPages = 0;
  pageArr: number[] = [];      // 0-based indices: [0, 1, 2, ...]
  startIndex = 0;              // window start into pageArr
  endIndex = 0;                // window end into pageArr
  hoverStates: boolean[] = [];

  private organization: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private dialog: MatDialog,
    private podWatcher: PodWatcherService
  ) {}

  ngOnInit(): void {
    this.organization = sessionStorage.getItem('organization');
    this.route.queryParams.subscribe(params => {
      this.selectedStatus = params['status'] || 'all';
      this.loadAllPipelines();
    });

    // Auto-refresh pod list every 15 s
    interval(15000)
      .pipe(takeUntil(this.destroy$), switchMap(() => this.podWatcher.getPods('all')))
      .subscribe(pods => {
        this.allPipelines = pods.map(p => ({ ...p, pipelineMode: this.modeFromType(p.type) }));
        this.applyFilters();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllPipelines(): void {
    this.loading = true;
    this.podWatcher.getPods('all').subscribe(pods => {
      this.allPipelines = pods.map(p => ({ ...p, pipelineMode: this.modeFromType(p.type) }));
      this.applyFilters();
      this.loading = false;
    });
  }

  /** Maps API type string to internal pipelineMode. */
  private modeFromType(type: string): 'agent' | 'mcp' | 'app' {
    const t = (type || '').toLowerCase();
    if (t === 'agent') { return 'agent'; }
    if (t === 'mcp')   { return 'mcp'; }
    return 'app';
  }

  applyFilters(): void {
    let result = [...this.allPipelines];
    if (this.selectedType !== 'all') {
      result = result.filter(p => p.pipelineMode === this.selectedType);
    }
    if (this.selectedStatus !== 'all') {
      result = result.filter(p => p.execution_status.toLowerCase() === this.selectedStatus.toLowerCase());
    }
    this.filteredPipelines = result;
    this.pageNumber = 1;
    this.updatePagination();
  }

  private updatePagination(): void {
    const total = this.filteredPipelines.length;
    this.noOfPages = Math.ceil(total / this.pageSize);
    this.pageArr = Array.from({ length: this.noOfPages }, (_, i) => i); // 0-based
    this.hoverStates = new Array(this.noOfPages).fill(false);
    this.startIndex = 0;
    this.endIndex = this.noOfPages;
    this.slicePage();
  }

  private slicePage(): void {
    const dataStart = (this.pageNumber - 1) * this.pageSize;
    const dataEnd = Math.min(dataStart + this.pageSize, this.filteredPipelines.length);
    this.paginatedPipelines = this.filteredPipelines.slice(dataStart, dataEnd);
  }

  onPrevPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.slicePage();
    }
  }

  onNextPage(): void {
    if (this.pageNumber < this.noOfPages) {
      this.pageNumber++;
      this.slicePage();
    }
  }

  onChangePage(page: number): void {
    if (page >= 1 && page <= this.noOfPages) {
      this.pageNumber = page;
      this.slicePage();
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
    const opt = this.statusOptions.find(o => o.value === status.toLowerCase());
    return opt?.icon || 'help_outline';
  }

  getStatusLabel(status: string): string {
    const opt = this.statusOptions.find(o => o.value === status.toLowerCase());
    return opt?.label || status;
  }

  getPipelineTypeLabel(mode: 'agent' | 'mcp' | 'app'): string {
    const opt = this.typeOptions.find(o => o.value === mode);
    return opt?.label || mode;
  }

  getTypeIcon(mode: 'agent' | 'mcp' | 'app'): string {
    const opt = this.typeOptions.find(o => o.value === mode);
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
      maxWidth:   '95vw',
      maxHeight:  '80vh',
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
