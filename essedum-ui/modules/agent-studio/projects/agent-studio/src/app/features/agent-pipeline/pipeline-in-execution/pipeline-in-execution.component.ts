import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Services } from '@essedum/shared-lib';
import { ConfirmDeleteDialogComponent } from '@essedum/shared-lib';
import { PodLogDialogComponent } from './pod-log-dialog/pod-log-dialog.component';

export interface ExecutionPipeline {
  cid: string;
  name: string;
  alias: string;
  description: string;
  type: string;
  interfacetype: string;
  createdDate: string;
  createdBy: string;
  pipelineMode: 'agent' | 'mcp' | 'app';
  status: string;
}

@Component({
  selector: 'app-pipeline-in-execution',
  templateUrl: './pipeline-in-execution.component.html',
  styleUrls: ['./pipeline-in-execution.component.scss'],
})
export class PipelineInExecutionComponent implements OnInit {
  loading = true;
  allPipelines: ExecutionPipeline[] = [];
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
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.organization = sessionStorage.getItem('organization');
    this.route.queryParams.subscribe(params => {
      this.selectedStatus = params['status'] || 'all';
      this.loadAllPipelines();
    });
  }

  private buildParams(mode: 'agent' | 'mcp' | 'app'): HttpParams {
    const cfgMap = {
      agent: { interfacetype: 'pipeline-agent', type: null },
      mcp:   { interfacetype: 'mcp-pipeline',   type: 'mcpServer' },
      app:   { interfacetype: 'app-pipeline',    type: 'appPipeline' },
    };
    const cfg = cfgMap[mode];
    let params = new HttpParams()
      .set('page', '1')
      .set('size', '100')
      .set('project', this.organization)
      .set('isCached', 'true')
      .set('adapter_instance', 'internal')
      .set('interfacetype', cfg.interfacetype);
    if (cfg.type) {
      params = params.set('type', cfg.type);
    }
    return params;
  }

  loadAllPipelines(): void {
    this.loading = true;
    const modes: Array<'agent' | 'mcp' | 'app'> = ['agent', 'mcp', 'app'];

    forkJoin(
      modes.map(mode =>
        this.service.getPipelinesCards(this.buildParams(mode)).pipe(catchError(() => of([])))
      )
    ).subscribe(([agentData, mcpData, appData]) => {
      const toRows = (arr: any[], mode: 'agent' | 'mcp' | 'app'): ExecutionPipeline[] =>
        (arr || []).map(p => ({
          cid: p.cid,
          name: p.name,
          alias: p.alias || p.name,
          description: p.description,
          type: p.type,
          interfacetype: mode === 'agent' ? 'pipeline-agent' : mode === 'mcp' ? 'mcp-pipeline' : 'app-pipeline',
          createdDate: p.createdDate || p.created_date || '',
          createdBy: p.target?.created_by || p.createdBy || '',
          pipelineMode: mode,
          status: this.deriveStatus(p),
        }));

      this.allPipelines = [
        ...toRows(agentData, 'agent'),
        ...toRows(mcpData, 'mcp'),
        ...toRows(appData, 'app'),
      ];
      this.applyFilters();
      this.loading = false;
    });
  }

  private deriveStatus(p: any): string {
    if (p.running > 0)  return 'Running';
    if (p.queued > 0)   return 'Queued';
    if (p.finished > 0) return 'Success';
    if (p.error > 0)    return 'Failed';
    if (p.killed > 0)   return 'Inactive';
    return 'Inactive';
  }

  applyFilters(): void {
    let result = [...this.allPipelines];
    if (this.selectedType !== 'all') {
      result = result.filter(p => p.pipelineMode === this.selectedType);
    }
    if (this.selectedStatus !== 'all') {
      result = result.filter(p => p.status.toLowerCase() === this.selectedStatus.toLowerCase());
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
    this.service.getStreamingServicesByName(pipeline.name).subscribe((res: any) => {
      this.router.navigate(
        [`../view/${pipeline.name}`],
        {
          state: {
            cardTitle: pipeline.pipelineMode === 'mcp'
              ? 'MCP Pipelines'
              : pipeline.pipelineMode === 'app'
              ? 'App Pipelines'
              : 'Pipeline Agent',
            pipelineAlias: res?.alias || pipeline.alias,
            streamItem: res,
            card: pipeline,
            pipelineMode: pipeline.pipelineMode,
          },
        }
      );
    });
  }

  checkPodLog(pipeline: ExecutionPipeline): void {
    this.dialog.open(PodLogDialogComponent, {
      data: {
        pipelineName: pipeline.alias || pipeline.name,
        logText: 'Unable to write logs at this time. Please try again',
      },
      width: '760px',
      maxWidth: '95vw',
      panelClass: 'pod-log-dialog-panel',
    });
  }

  deletePipelineAsContainer(pipeline: ExecutionPipeline): void {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent);
    ref.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.service.deletePipeline(pipeline.cid).subscribe(() => {
          this.service.message('Pipeline container deleted!', 'success');
          this.loadAllPipelines();
        });
      }
    });
  }
}
