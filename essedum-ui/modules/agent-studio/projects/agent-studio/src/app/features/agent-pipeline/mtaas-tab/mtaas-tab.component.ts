import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AipGridAction, AipGridColumn } from '../../sharedModule/aip-grid/aip-grid.component';
import {
  MTAAS_RUN_STATES,
  MtaasRun,
  MtaasRunState,
  MtaasService,
  MtaasTemplate,
} from './mtaas.service';
import { MtaasWizardComponent, MtaasWizardData } from './mtaas-wizard/mtaas-wizard.component';
import { MtaasRunDetailComponent } from './mtaas-run-detail/mtaas-run-detail.component';
import { MtaasTemplateDetailComponent } from './mtaas-template-detail/mtaas-template-detail.component';

/** Flattened row the shared aip-grid renders; `run` keeps the original for actions. */
export interface MtaasRunRow {
  runId: string;
  displayName: string;
  templateLabel: string;
  datasetLabel: string;
  resourceLabel: string;
  state: MtaasRunState;
  queuePosition?: number;
  createdAt: string;
  run: MtaasRun;
}

@Component({
  selector: 'app-mtaas-tab',
  templateUrl: './mtaas-tab.component.html',
  styleUrls: ['./mtaas-tab.component.scss'],
  standalone: false,
})
export class MtaasTabComponent implements OnInit, OnChanges, OnDestroy {
  @Input() search = '';

  readonly states = MTAAS_RUN_STATES;
  readonly pageSize = 10;

  // ── Shared aip-grid configuration (same design as the Skills table) ──────
  readonly GRID_TEMPLATE = '22% 16% 14% 18% 12% 12% 6%';
  readonly gridColumns: AipGridColumn[] = [
    { key: 'name', label: 'Run', field: 'displayName', cssClass: 'col-mt-name', type: 'icon-text', icon: 'model_training', subField: 'runId' },
    { key: 'template', label: 'Template', field: 'templateLabel', cssClass: 'col-mt-template', type: 'text', textCssClass: 'mtaas-text' },
    { key: 'dataset', label: 'Dataset', field: 'datasetLabel', cssClass: 'col-mt-dataset', type: 'text', textCssClass: 'mtaas-text' },
    { key: 'resources', label: 'Resources', field: 'resourceLabel', cssClass: 'col-mt-resources', type: 'text', textCssClass: 'mtaas-text' },
    {
      key: 'status', label: 'Status', field: 'state', cssClass: 'col-mt-status', type: 'badge',
      badgeCssFn: (v) => `mtaas-state-badge state-${String(v || 'pending').toLowerCase()}`,
      badgeLabelFn: (v, row: MtaasRunRow) => this.stateLabel(v, row?.queuePosition),
    },
    {
      key: 'created', label: 'Created', field: 'createdAt', cssClass: 'col-mt-created', type: 'date', textCssClass: 'mtaas-date',
      dateFn: (v) => this.formatDate(v),
    },
  ];
  readonly gridActions: AipGridAction[] = [
    { key: 'view', label: 'View run', icon: 'visibility', iconCssClass: 'mtaas-icon-view' },
    { key: 'clone', label: 'Clone as new run', icon: 'content_copy', iconCssClass: 'mtaas-icon-clone' },
  ];

  view: 'runs' | 'templates' = 'runs';
  runs: MtaasRun[] = [];
  gridRows: MtaasRunRow[] = [];
  stateFilter: MtaasRunState | '' = '';
  projectFilter = '';
  filterExpanded = false;
  loading = false;
  error = false;
  page = 0;
  totalPages = 0;
  totalElements = 0;
  // Pagination inputs for aip-grid's pager; kept as fields so they are not rebuilt every change detection.
  pageArr: number[] = [];
  hoverStates: boolean[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private service: MtaasService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['search']) {
      this.rebuildRows();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasActiveFilters(): boolean {
    return !!this.stateFilter || !!this.projectFilter.trim();
  }

  onGridAction(event: { key: string; row: MtaasRunRow }): void {
    if (event.key === 'view') {
      this.viewRun(event.row.run);
    } else if (event.key === 'clone') {
      this.cloneRun(event.row.run);
    }
  }

  toggleFilter(): void {
    this.filterExpanded = !this.filterExpanded;
  }

  load(): void {
    const projectId = Number(this.projectFilter);
    this.loading = true;
    this.error = false;
    this.service
      .getRuns({
        state: this.stateFilter,
        projectId: this.projectFilter.trim() && !isNaN(projectId) ? projectId : undefined,
        page: this.page,
        size: this.pageSize,
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (res) => {
          this.runs = res.content;
          this.totalPages = res.totalPages;
          this.totalElements = res.totalElements;
          this.pageArr = Array.from({ length: this.totalPages }, (_, i) => i);
          this.hoverStates = this.pageArr.map(() => false);
          this.rebuildRows();
        },
        error: () => {
          this.runs = [];
          this.rebuildRows();
          this.error = true;
        },
      });
  }

  reload(): void {
    this.page = 0;
    this.load();
  }

  clearFilters(): void {
    this.stateFilter = '';
    this.projectFilter = '';
    this.reload();
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.load();
    }
  }

  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.load();
    }
  }

  goToPage(oneBased: number): void {
    const target = oneBased - 1;
    if (target >= 0 && target < this.totalPages && target !== this.page) {
      this.page = target;
      this.load();
    }
  }

  showTemplates(): void {
    this.view = 'templates';
  }

  showRuns(): void {
    this.view = 'runs';
  }

  newRun(data: MtaasWizardData | null = null): void {
    this.dialog
      .open(MtaasWizardComponent, { width: '900px', panelClass: 'wizard-dialog', data })
      .afterClosed()
      .subscribe((result) => {
        if (result?.run) {
          this.view = 'runs';
          this.reload();
        }
      });
  }

  viewRun(run: MtaasRun): void {
    this.dialog
      .open(MtaasRunDetailComponent, { width: '900px', panelClass: 'wizard-dialog', data: { runId: run.runId } })
      .afterClosed()
      .subscribe((result) => {
        if (result?.clone) {
          this.newRun({ clone: result.clone });
        }
      });
  }

  cloneRun(run: MtaasRun): void {
    this.service.getRun(run.runId).subscribe((detail) => this.newRun({ clone: detail }));
  }

  viewTemplate(template: MtaasTemplate): void {
    this.dialog
      .open(MtaasTemplateDetailComponent, { width: '800px', panelClass: 'wizard-dialog', data: { template } })
      .afterClosed()
      .subscribe((result) => {
        if (result?.startTemplate) {
          this.startTemplate(result.startTemplate);
        }
      });
  }

  startTemplate(template: MtaasTemplate): void {
    this.newRun({ templateId: template.id });
  }

  private rebuildRows(): void {
    const term = (this.search || '').toLowerCase().trim();
    const source = term
      ? this.runs.filter(
          (r) =>
            (r.displayName || '').toLowerCase().includes(term) ||
            r.templateName.toLowerCase().includes(term) ||
            r.runId.toLowerCase().includes(term)
        )
      : this.runs;
    this.gridRows = source.map((run) => ({
      runId: run.runId,
      displayName: run.displayName || run.runId,
      templateLabel: `${run.templateName} v${run.templateVersion}`,
      datasetLabel: `${run.datasetId} ${run.datasetVersion}`,
      resourceLabel: this.resourceLabel(run),
      state: run.state,
      queuePosition: run.queuePosition,
      createdAt: run.createdAt,
      run,
    }));
  }

  private resourceLabel(run: MtaasRun): string {
    const gpu = run.gpus > 0 ? `${run.gpus} × ${run.gpuType ?? 'GPU'}` : 'CPU only';
    return `${gpu} · ${run.cpu} vCPU · ${run.memory}`;
  }

  private stateLabel(state: string, queuePosition?: number): string {
    const text = String(state || 'pending').charAt(0).toUpperCase() + String(state || 'pending').slice(1).toLowerCase();
    return state === 'QUEUED' && queuePosition ? `${text} · #${queuePosition}` : text;
  }

  private formatDate(value: string): string {
    if (!value) {
      return '-';
    }
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
