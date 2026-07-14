import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Services, ConfirmDeleteDialogComponent, TagEventDTO } from '@essedum/shared-lib';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Skill, SkillsListResponse, SkillsService, SkillsServiceMessages } from '../services/skills.service';
import { AipGridColumn, AipGridAction } from '../sharedModule/aip-grid/aip-grid.component';

@Component({
  standalone: false,
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
})
export class SkillsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private skipNextFetchMessage = false;
  private isFirstLoad = true;
  loading = false;
  lastRefreshedTime: Date | null = null;

  // ── API response — single source of truth ─────────────────────────────────
  skillsResponse: SkillsListResponse | null = null;

  // ── Derived display lists ──────────────────────────────────────────────────
  filteredSkills:  Skill[] = [];
  paginatedSkills: Skill[] = [];

  // ── Search ─────────────────────────────────────────────────────────────────
  searchTerm = '';

  // ── Filter state ───────────────────────────────────────────────────────────
  // selectedSkillTypes mirrors TagEventDTO.selectedAdapterType at the boundary
  selectedSkillTypes: string[] = [];
  selectedType        = '';
  selectedCategory    = '';
  selectedSubcategory = '';

  // ── aip-filter inputs ──────────────────────────────────────────────────────
  readonly servicev1 = 'skills';
  tagrefresh = false;
  hasFilters = false;

  // ── Pagination ─────────────────────────────────────────────────────────────
  pageNumber = 1;
  pageSize   = 5;
  noOfPages  = 0;
  pageArr:     number[]  = [];
  startIndex   = 0;
  endIndex     = 5;
  hoverStates: boolean[] = [];

  // ── Type-label lookup (display only) ──────────────────────────────────────
  private readonly skillTypeMap: Record<string, string> = {
    CODE_GENERATION: 'Code Generation',
    TEST_GENERATION: 'Test Generation',
    DEBUGGING:       'Debugging',
    REFACTORING:     'Refactoring',
    DOCUMENTATION:   'Documentation',
    DEPLOYMENT:      'Deployment',
    CODE_REVIEW:     'Code Review',
    SECURITY_SCAN:   'Security Scan',
    DATA_PIPELINE:   'Data Pipeline',
    CUSTOM:          'Custom',
  };

  // ── Page labels ────────────────────────────────────────────────────────────
  readonly PAGETITLE    = 'Skills';
  readonly COLACTIONS   = 'Actions';
  readonly EMPTYMESSAGE = 'No skills found. Click "+" to create one.';
  readonly VIEWLABEL    = 'View Skill';
  readonly EDITLABEL    = 'Edit Skill';
  readonly DELETELABEL  = 'Delete Skill';
  readonly LOADINGMSG   = 'Loading skills…';
  readonly OPTIONSTIP   = 'Options';

  // ── aip-grid configuration ─────────────────────────────────────────────────
  readonly GRID_TEMPLATE = '20% 15% 10% 25% 10% 10% 10%';

  readonly gridColumns: AipGridColumn[] = [
    {
      key: 'name', label: 'Skill Name', field: 'skillName', cssClass: 'col-sk-name',
      type: 'icon-text', icon: 'psychology',
    },
    {
      key: 'type', label: 'Type', field: 'skillType', cssClass: 'col-sk-type',
      type: 'badge',
      badgeCssFn:   (v) => `skills-type-badge ${this.getTypeBadgeClass(v)}`,
      badgeLabelFn: (v) => this.getTypeLabel(v),
    },
    {
      key: 'category', label: 'Category', field: 'skillCategory', cssClass: 'col-sk-category',
      type: 'badge',
      badgeCssFn: (v) => `skills-category-badge ${this.getCategoryBadgeClass(v)}`,
    },
    {
      key: 'desc', label: 'Description', field: 'description', cssClass: 'col-sk-desc',
      type: 'text', textCssClass: 'skills-desc-text',
    },
    {
      key: 'date', label: 'Date', field: 'createdDate', cssClass: 'col-sk-date',
      type: 'date', textCssClass: 'skills-date-text',
      dateFn: (v) => this.formatDate(v),
    },
    {
      key: 'createdby', label: 'Created By', field: 'createdBy', cssClass: 'col-sk-createdby',
      type: 'user',
    },
  ];

  readonly gridActions: AipGridAction[] = [
    { key: 'view',   label: this.VIEWLABEL,   icon: 'visibility', iconCssClass: 'skills-icon-view' },
    { key: 'edit',   label: this.EDITLABEL,   icon: 'edit',       iconCssClass: 'skills-icon-edit' },
    { key: 'delete', label: this.DELETELABEL, icon: 'delete',     iconCssClass: 'skills-icon-delete', cssClass: 'skills-menu-delete' },
  ];

  onGridAction(event: { key: string; row: Skill }): void {
    switch (event.key) {
      case 'view':   this.openView(event.row);    break;
      case 'edit':   this.openEdit(event.row);    break;
      case 'delete': this.deleteSkill(event.row); break;
    }
  }

  constructor(
    private dialog:       MatDialog,
    private service:      Services,
    private router:       Router,
    private route:        ActivatedRoute,
    private skillsService: SkillsService,
  ) {}

  ngOnInit(): void {
    const needsDelayedRefresh = this.skillsService.needsRefreshWithDelay;
    this.skillsService.needsRefreshWithDelay = false;

    if (needsDelayedRefresh) {
      this.loadSkills(true, 3000);
    } else {
      this.loadSkills();
    }

    this.skillsService.refreshList$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageNumber = 1;
        this.skipNextFetchMessage = false;
        this.loadSkills(true, 3000);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSkills(showFetchMessage: boolean = true, fetchMessageDelayMs: number = 0): void {
    this.loading = true;
    this.lastRefreshedTime = new Date();
    const org = sessionStorage.getItem('organization') || '';

    // subcategory filter is client-side; fetch all rows when active
    const clientPaging = !!this.selectedSubcategory;
    const apiPage = clientPaging ? 0 : this.pageNumber - 1;
    const apiSize = clientPaging ? 1000 : this.pageSize;

    this.skillsService
      .getSkills(
        org,
        apiPage,
        apiSize,
        this.selectedType        || undefined,
        this.selectedCategory    || undefined,
        this.selectedSubcategory || undefined,
        this.searchTerm          || undefined,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: SkillsListResponse) => {
          this.skillsResponse = response;
          if (!clientPaging) {
            this.noOfPages  = response.totalPages || 0;
            this.pageArr    = [...Array(this.noOfPages).keys()];
            this.hoverStates = new Array(this.pageArr.length).fill(false);
          }
          this.applyFilter();
          this.loading = false;
          if (showFetchMessage && !this.skipNextFetchMessage && (this.isFirstLoad || fetchMessageDelayMs > 0)) {
            if (fetchMessageDelayMs > 0) {
              setTimeout(() => {
                this.service.message(SkillsServiceMessages.FETCH_SUCCESS, 'success');
              }, fetchMessageDelayMs);
            } else if (this.isFirstLoad) {
              this.service.message(SkillsServiceMessages.FETCH_SUCCESS, 'success');
            }
          }
          this.isFirstLoad = false;
          this.skipNextFetchMessage = false;
        },
        error: () => {
          this.loading = false;
          if (!this.skipNextFetchMessage) {
            if (fetchMessageDelayMs > 0) {
              setTimeout(() => {
                this.service.message(SkillsServiceMessages.FETCH_ERROR, 'error');
              }, fetchMessageDelayMs);
            } else {
              this.service.message(SkillsServiceMessages.FETCH_ERROR, 'error');
            }
          }
          this.skipNextFetchMessage = false;
        },
      });
  }

  onRefresh(): void {
    this.pageNumber         = 1;
    this.searchTerm         = '';
    this.selectedSkillTypes = [];
    this.selectedType       = '';
    this.selectedCategory   = '';
    this.selectedSubcategory = '';
    this.tagrefresh = !this.tagrefresh;
    this.loadSkills();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.pageNumber = 1;
    this.loadSkills();
  }

  // ── aip-filter events ──────────────────────────────────────────────────────

  /**
   * aip-filter maps skill-specific arrays into TagEventDTO at emit time:
   *   selectedAdapterType        → selectedSkillTypeFilter        → selectedType
   *   selectedMlAdapterCategoryType → selectedSkillCategoryFilter → selectedCategory
   *   selectedMlAdapterSpecType  → selectedSkillSubcategoryFilter → selectedSubcategory
   */
  tagSelectedEvent(event: TagEventDTO): void {
    this.selectedSkillTypes  = event.selectedAdapterType               || [];
    this.selectedType        = this.selectedSkillTypes[0]              || '';
    this.selectedCategory    = (event.selectedMlAdapterCategoryType    || [])[0] || '';
    this.selectedSubcategory = (event.selectedMlAdapterSpecType        || [])[0] || '';
    this.pageNumber = 1;
    this.loadSkills();
  }

  onFilterStatusChange(hasFilters: boolean): void {
    this.hasFilters = hasFilters;
  }

  // ── Filter / pagination helpers ────────────────────────────────────────────

  applyFilter(): void {
    const source: Skill[] = this.skillsResponse?.skills ?? [];

    this.filteredSkills = this.selectedSubcategory
      ? source.filter(s => (s.skillSubcategory ?? '') === this.selectedSubcategory)
      : [...source];

    if (this.selectedSubcategory) {
      this.noOfPages  = Math.ceil(this.filteredSkills.length / this.pageSize);
      this.pageArr    = [...Array(this.noOfPages).keys()];
      this.hoverStates = new Array(this.pageArr.length).fill(false);
      const start     = (this.pageNumber - 1) * this.pageSize;
      this.paginatedSkills = this.filteredSkills.slice(start, start + this.pageSize);
    } else {
      this.paginatedSkills = [...this.filteredSkills];
    }
  }

  nextPage(): void {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      this.selectedSubcategory ? this.applyFilter() : this.changePage();
    }
  }

  prevPage(): void {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      this.selectedSubcategory ? this.applyFilter() : this.changePage();
    }
  }

  changePage(page?: number): void {
    if (page && page >= 1 && page <= this.noOfPages) this.pageNumber = page;
    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      if (this.selectedSubcategory) {
        this.applyFilter();
      } else {
        if (this.pageNumber > 5) {
          this.endIndex   = this.pageNumber;
          this.startIndex = this.endIndex - 5;
        } else {
          this.startIndex = 0;
          this.endIndex   = 5;
        }
        this.loadSkills();
      }
    }
  }

  // ── CRUD navigation ────────────────────────────────────────────────────────

  openAdd(): void {
    this.router.navigate(['add'], { relativeTo: this.route.parent });
  }

  openEdit(skill: Skill): void {
    this.router.navigate(['edit', skill.id], {
      relativeTo: this.route.parent,
      state: { skill: { ...skill } },
    });
  }

  openView(skill: Skill): void {
    this.router.navigate(['view', skill.id], {
      relativeTo: this.route.parent,
      state: { skill: { ...skill } },
    });
  }

  deleteSkill(skill: Skill): void {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { entityName: skill.skillName },
    });
    ref.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: string) => {
      if (result === 'delete') {
        this.skillsService.deleteSkill(skill.id).subscribe({
          next: () => {
            this.service.message(SkillsServiceMessages.DELETE_SUCCESS, 'success');
            this.pageNumber = 1;
            this.loadSkills(true, 3000);
          },
          error: () => {
            this.service.message(SkillsServiceMessages.DELETE_ERROR, 'error');
          },
        });
      }
    });
  }

  // ── Display helpers ────────────────────────────────────────────────────────

  getTypeLabel(type: string): string {
    return this.skillTypeMap[type] ?? type;
  }

  getTypeBadgeClass(type: string): string {
    return 'type-' + type.toLowerCase().replace(/_/g, '-');
  }

  getCategoryBadgeClass(cat: string): string {
    return 'cat-' + (cat ?? '').toLowerCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
    });
  }
}
