import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Services, ConfirmDeleteDialogComponent } from '@essedum/shared-lib';
import { Skill, SkillsListResponse, SkillsService, SkillsServiceMessages } from '../services/skills.service';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
})
export class SkillsComponent implements OnInit {
  loading = false;
  lastRefreshedTime: Date | null = null;

  // ── API response object — single source of truth ─────────────────────────
  skillsResponse: SkillsListResponse | null = null;

  // ── Derived display lists ─────────────────────────────────────────────────
  filteredSkills: Skill[] = [];
  paginatedSkills: Skill[] = [];

  // ── Search ────────────────────────────────────────────────────────────────
  searchTerm = '';

  // ── Pagination state ──────────────────────────────────────────────────────
  pageNumber: number = 1;
  pageSize: number = 5;
  noOfPages: number = 0;
  pageArr: number[] = [];
  startIndex: number = 0;
  endIndex: number = 5;
  hoverStates: boolean[] = [];

  // ── Filter state ──────────────────────────────────────────────────────────
  isFilterExpanded = false;
  selectedType = '';
  selectedCategory = '';
  selectedSubcategory = '';

  // Hardcoded type options kept for human-readable labels
  readonly skillTypeOptions = [
    { value: '',                label: 'All' },
    { value: 'CODE_GENERATION', label: 'Code Generation' },
    { value: 'TEST_GENERATION', label: 'Test Generation' },
    { value: 'DEBUGGING',       label: 'Debugging' },
    { value: 'REFACTORING',     label: 'Refactoring' },
    { value: 'DOCUMENTATION',   label: 'Documentation' },
    { value: 'DEPLOYMENT',      label: 'Deployment' },
    { value: 'CODE_REVIEW',     label: 'Code Review' },
    { value: 'SECURITY_SCAN',   label: 'Security Scan' },
    { value: 'DATA_PIPELINE',   label: 'Data Pipeline' },
    { value: 'CUSTOM',          label: 'Custom' },
  ];

  // ── Page labels ───────────────────────────────────────────────────────────
  readonly PAGETITLE         = 'Skills';
  readonly COLNAME           = 'Skill Name';
  readonly COLTYPE           = 'Type';
  readonly COLCATEGORY       = 'Category';
  readonly COLDESC           = 'Description';
  readonly COLDATE           = 'Date';
  readonly COLCREATEDBY      = 'Created By';
  readonly COLACTIONS        = 'Actions';
  readonly EMPTYMESSAGE      = 'No skills found. Click "+" to create one.';
  readonly VIEWLABEL         = 'View';
  readonly EDITLABEL         = 'Edit';
  readonly DELETELABEL       = 'Delete';
  readonly DELETEDMSG        = 'Skill deleted successfully!';
  readonly FILTERTITLE       = 'FILTER BY:';
  readonly FILTERTYPELBL     = 'TYPE';
  readonly FILTERCATEGORYLBL = 'CATEGORY';
  readonly FILTERSUBCATLBL   = 'SUB-CATEGORY';
  readonly FILTERALLOPT      = 'All';
  readonly LOADINGMSG        = 'Loading skills…';
  readonly OPTIONSTIP        = 'Options';

  constructor(
    private dialog: MatDialog,
    private service: Services,
    private router: Router,
    private route: ActivatedRoute,
    private skillsService: SkillsService,
  ) {}

  ngOnInit(): void {
    this.loadSkills();
  }

  loadSkills(): void {
    this.loading = true;
    this.lastRefreshedTime = new Date();
    const org = sessionStorage.getItem('organization') || '';

    // Backend doesn't filter by subcategory yet — fetch all records and paginate client-side
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
      .subscribe({
        next: (response: SkillsListResponse) => {
          this.skillsResponse = response;
          if (!clientPaging) {
            this.noOfPages = response.totalPages || 0;
            this.pageArr = [...Array(this.noOfPages).keys()];
            this.hoverStates = new Array(this.pageArr.length).fill(false);
          }
          this.applyFilter();
          this.loading = false;
          this.service.message(SkillsServiceMessages.FETCH_SUCCESS, 'success');
        },
        error: () => {
          this.loading = false;
          this.service.message(SkillsServiceMessages.FETCH_ERROR, 'error');
        },
      });
  }

  onRefresh(): void {
    this.pageNumber = 1;
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedCategory = '';
    this.selectedSubcategory = '';
    this.isFilterExpanded = false;
    this.loadSkills();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.pageNumber = 1;
    this.loadSkills();
  }

  onTypeChange(value: string): void {
    this.selectedType = value;
    this.pageNumber = 1;
    this.loadSkills();
  }

  onCategoryChange(value: string): void {
    this.selectedCategory = value;
    this.pageNumber = 1;
    this.loadSkills();
  }

  onSubcategoryChange(value: string): void {
    this.selectedSubcategory = value;
    this.pageNumber = 1;
    this.loadSkills();
  }

  clearTypeFilter(): void {
    this.selectedType = '';
    this.pageNumber = 1;
    this.loadSkills();
  }

  clearCategoryFilter(): void {
    this.selectedCategory = '';
    this.pageNumber = 1;
    this.loadSkills();
  }

  clearSubcategoryFilter(): void {
    this.selectedSubcategory = '';
    this.pageNumber = 1;
    this.loadSkills();
  }

  toggleFilter(): void {
    this.isFilterExpanded = !this.isFilterExpanded;
  }

  applyFilter(): void {
    const source: Skill[] = this.skillsResponse?.skills ?? [];

    // search is server-side; subcategory is client-side until backend adds support
    this.filteredSkills = this.selectedSubcategory
      ? source.filter(s => (s.skillSubcategory ?? '') === this.selectedSubcategory)
      : [...source];

    if (this.selectedSubcategory) {
      // Recalculate pagination from the filtered set
      this.noOfPages = Math.ceil(this.filteredSkills.length / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
      this.hoverStates = new Array(this.pageArr.length).fill(false);
      const start = (this.pageNumber - 1) * this.pageSize;
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
          this.endIndex = this.pageNumber;
          this.startIndex = this.endIndex - 5;
        } else {
          this.startIndex = 0;
          this.endIndex = 5;
        }
        this.loadSkills();
      }
    }
  }

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
    ref.afterClosed().subscribe((result: string) => {
      if (result === 'delete') {
        this.skillsService.deleteSkill(skill.id).subscribe({
          next: () => {
            this.service.message(SkillsServiceMessages.DELETE_SUCCESS, 'success');
            this.loadSkills();
          },
          error: () => {
            this.service.message(SkillsServiceMessages.DELETE_ERROR, 'error');
          },
        });
      }
    });
  }

  getTypeLabel(type: string): string {
    return this.skillTypeOptions.find(o => o.value === type)?.label ?? type;
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
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  }
}
