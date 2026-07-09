import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';

export interface AipGridColumn {
  key: string;
  label: string;
  field: string;
  cssClass?: string;
  /** Render hint for fully-dynamic (no rowTemplate) mode. */
  type?: 'text' | 'badge' | 'date' | 'icon-text' | 'user' | 'status-badge';
  // text / date
  textCssClass?: string;
  dateFn?: (value: any) => string;
  // badge / status-badge
  badgeCssFn?: (value: any, row: any) => string;
  badgeLabelFn?: (value: any, row: any) => string;
  badgeIconFn?: (value: any, row: any) => string;
  // icon-text
  icon?: string;
  iconFn?: (row: any) => string;
  iconWrapperCssClass?: string;
  iconWrapperCssFn?: (row: any) => string;
  subField?: string;
  // tooltip
  tooltip?: boolean;
  tooltipField?: string;
}

// ── Action definition ─────────────────────────────────────────────────────────
export interface AipGridAction {
  key: string;
  label: string;
  icon: string;
  iconCssClass?: string;
  cssClass?: string;
  visibleFn?: (row: any) => boolean;
  dividerBefore?: boolean;
}

@Component({
  selector: 'app-aip-grid',
  templateUrl: './aip-grid.component.html',
  styleUrls: ['./aip-grid.component.scss'],
})
export class AipGridComponent {
  // Data
  @Input() columns: AipGridColumn[] = [];
  @Input() rows: any[] = [];

  // State
  @Input() loading = false;
  @Input() loadingMessage = 'Loading…';
  @Input() emptyIcon = 'inbox';
  @Input() emptyMessage = 'No data found.';

  // Layout
  @Input() gridTemplateColumns = '';
  @Input() headerPadding = '6px 0';
  @Input() rowPadding = '10px 0';
  @Input() headerMarginTop = '';

  // Actions column
  @Input() actions: AipGridAction[] = [];
  @Input() actionsLabel = 'Actions';
  @Input() actionMenuCssClass = '';
  /** When provided, the actions button is only shown for rows where this returns true. */
  @Input() actionButtonVisibleFn?: (row: any) => boolean;

  // Custom row template (parent provides cell divs, no outer wrapper or actions div)
  @Input() rowTemplate?: TemplateRef<{ $implicit: any }>;

  // Pagination (grid renders app-aip-pagination internally when noOfPages > 0)
  @Input() pageNumber = 1;
  @Input() noOfPages = 0;
  @Input() pageArr: number[] = [];
  @Input() startIndex = 0;
  @Input() endIndex = 0;
  @Input() hoverStates: boolean[] = [];

  // Events
  @Output() actionClick = new EventEmitter<{ key: string; row: any }>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() prevPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() changePage = new EventEmitter<number>();

  get headerStyle(): Record<string, string> {
    const s: Record<string, string> = {};
    if (this.gridTemplateColumns) s['grid-template-columns'] = this.gridTemplateColumns;
    if (this.headerPadding)       s['padding']               = this.headerPadding;
    if (this.headerMarginTop)     s['margin-top']            = this.headerMarginTop;
    return s;
  }

  get rowStyle(): Record<string, string> {
    const s: Record<string, string> = {};
    if (this.gridTemplateColumns) s['grid-template-columns'] = this.gridTemplateColumns;
    if (this.rowPadding)          s['padding']               = this.rowPadding;
    return s;
  }

  getCellValue(row: any, col: AipGridColumn): any {
    return row?.[col.field];
  }

  getTooltip(row: any, col: AipGridColumn): string {
    if (!col.tooltip) return '';
    return row?.[col.tooltipField ?? col.field] ?? '';
  }

  showActionButton(row: any): boolean {
    return !this.actionButtonVisibleFn || this.actionButtonVisibleFn(row);
  }

  onAction(key: string, row: any): void {
    this.actionClick.emit({ key, row });
  }
}
