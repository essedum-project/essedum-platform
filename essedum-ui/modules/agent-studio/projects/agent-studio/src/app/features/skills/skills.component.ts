import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDeleteDialogComponent } from '@essedum/shared-lib';

export interface Skill {
  id: string;
  skillUid?: string;
  name: string;
  alias?: string;
  version: string;
  // Classification
  skillType: string;
  category: string;
  subcategory?: string;
  tags?: string;
  triggerKeywords?: string;
  // Description
  description: string;
  longDescription?: string;
  // Technical Definition
  language?: string;
  framework?: string;
  runtime?: string;
  entrypoint?: string;
  inputSchema?: string;
  outputSchema?: string;
  // Availability
  pipelineScope: string;
  status: string;
  visibility: string;
  // Multi-tenancy
  organization: string;
  projectId?: number;
  // Usage Metrics
  usageCount?: number;
  lastUsedDate?: string;
  // Audit
  createdBy: string;
  createdAt: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
}

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
})
export class SkillsComponent implements OnInit {
  loading = false;
  skills: Skill[] = [];
  filteredSkills: Skill[] = [];
  searchTerm = '';
  lastRefreshedTime: Date | null = null;

  // ── Pagination state ────────────────────────────────────────────────────
  pageNumber: number = 1;
  pageSize: number = 5;
  noOfPages: number = 0;
  pageArr: number[] = [];
  startIndex: number = 0;
  endIndex: number = 5;
  hoverStates: boolean[] = [];
  paginatedSkills: Skill[] = [];

  // ── Filter state ─────────────────────────────────────────────────────────
  isFilterExpanded = false;
  selectedType = '';
  selectedCategory = '';
  selectedSubcategory = '';

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

  readonly categoryOptions = [
    { value: '',         label: 'All' },
    { value: 'Backend',  label: 'Backend' },
    { value: 'Frontend', label: 'Frontend' },
    { value: 'ML',       label: 'ML' },
    { value: 'DevOps',   label: 'DevOps' },
    { value: 'Data',     label: 'Data' },
  ];

  readonly subcategoryOptions = [
    { value: '',           label: 'All' },
    { value: 'SpringBoot', label: 'Spring Boot' },
    { value: 'FastAPI',    label: 'FastAPI' },
    { value: 'React',      label: 'React' },
    { value: 'Angular',    label: 'Angular' },
    { value: 'LangChain',  label: 'LangChain' },
    { value: 'Docker',     label: 'Docker' },
    { value: 'Kubernetes', label: 'Kubernetes' },
  ];

  // ── Page labels ───────────────────────────────────────────────────────────
  readonly PAGETITLE         = 'Skills';
  readonly COLNAME           = 'Skill Name';
  readonly COLVERSION        = 'Version';
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
  // ── Filter / table labels ───────────────────────────────────────────
  readonly FILTERTITLE       = 'FILTER BY:';
  readonly FILTERTYPELBL     = 'TYPE';
  readonly FILTERCATEGORYLBL = 'CATEGORY';
  readonly FILTERSUBCATLBL   = 'SUB-CATEGORY';
  readonly FILTERALLOPT      = 'All';
  readonly LOADINGMSG        = 'Loading skills…';
  readonly OPTIONSTIP        = 'Options';

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.loadSkills();
  }

  loadSkills(): void {
    this.loading = true;
    this.lastRefreshedTime = new Date();
    // Mock data — replace with real API call when backend is available
    setTimeout(() => {
      this.skills = [
        {
          id: '1',
          skillUid: 'skill-uid-001',
          name: 'Java REST Code Generator',
          alias: 'java-rest-gen',
          version: '1.2.0',
          skillType: 'CODE_GENERATION',
          category: 'Backend',
          subcategory: 'SpringBoot',
          tags: 'java,spring,rest',
          triggerKeywords: 'generate class,create controller',
          description: 'Generates Spring Boot REST controllers and service classes from natural language descriptions.',
          language: 'java',
          framework: 'SpringBoot',
          runtime: 'jdk21',
          pipelineScope: 'ALL',
          status: 'ACTIVE',
          visibility: 'PROJECT',
          organization: 'essedum',
          usageCount: 128,
          createdBy: 'admin',
          createdAt: '2026-05-01T09:00:00Z',
        },
        {
          id: '2',
          skillUid: 'skill-uid-002',
          name: 'JUnit Test Generator',
          alias: 'junit-test-gen',
          version: '1.0.0',
          skillType: 'TEST_GENERATION',
          category: 'Backend',
          subcategory: 'SpringBoot',
          tags: 'java,junit,testing',
          description: 'Generates JUnit 5 test cases automatically from existing Java source code.',
          language: 'java',
          framework: 'SpringBoot',
          runtime: 'jdk21',
          pipelineScope: 'ALL',
          status: 'ACTIVE',
          visibility: 'ORG',
          organization: 'essedum',
          usageCount: 45,
          createdBy: 'john.doe',
          createdAt: '2026-05-15T14:00:00Z',
        },
        {
          id: '3',
          skillUid: 'skill-uid-003',
          name: 'Python FastAPI Scaffolding',
          alias: 'fastapi-scaffold',
          version: '2.0.0',
          skillType: 'CODE_GENERATION',
          category: 'Backend',
          subcategory: 'FastAPI',
          tags: 'python,fastapi,rest',
          description: 'Scaffolds FastAPI endpoints and Pydantic models from OpenAPI specifications.',
          language: 'python',
          framework: 'FastAPI',
          runtime: 'python3.11',
          pipelineScope: 'ALL',
          status: 'ACTIVE',
          visibility: 'GLOBAL',
          organization: 'essedum',
          usageCount: 67,
          createdBy: 'jane.smith',
          createdAt: '2026-06-01T08:00:00Z',
        },
        {
          id: '4',
          skillUid: 'skill-uid-004',
          name: 'React Component Builder',
          alias: 'react-comp-builder',
          version: '1.1.0',
          skillType: 'CODE_GENERATION',
          category: 'Frontend',
          subcategory: 'React',
          tags: 'react,typescript,components',
          description: 'Generates React functional components with TypeScript and hooks from wireframe descriptions.',
          language: 'typescript',
          framework: 'React',
          runtime: 'node18',
          pipelineScope: 'SPECIFIC',
          status: 'ACTIVE',
          visibility: 'PROJECT',
          organization: 'essedum',
          usageCount: 38,
          createdBy: 'alice.jones',
          createdAt: '2026-06-10T11:30:00Z',
        },
        {
          id: '5',
          skillUid: 'skill-uid-005',
          name: 'Security Vulnerability Scanner',
          alias: 'sec-scan',
          version: '1.0.0',
          skillType: 'SECURITY_SCAN',
          category: 'DevOps',
          subcategory: 'Docker',
          tags: 'security,owasp,vulnerabilities',
          description: 'Scans code for OWASP Top 10 vulnerabilities and generates remediation suggestions.',
          pipelineScope: 'ALL',
          status: 'ACTIVE',
          visibility: 'ORG',
          organization: 'essedum',
          usageCount: 22,
          createdBy: 'admin',
          createdAt: '2026-06-20T07:00:00Z',
        },
        {
          id: '6',
          skillUid: 'skill-uid-006',
          name: 'LangChain Pipeline Builder',
          alias: 'lc-pipeline',
          version: '3.0.0',
          skillType: 'DATA_PIPELINE',
          category: 'ML',
          subcategory: 'LangChain',
          tags: 'langchain,llm,pipeline',
          description: 'Generates LangChain pipeline definitions with agents, tools and memory components.',
          language: 'python',
          framework: 'LangChain',
          runtime: 'python3.11',
          pipelineScope: 'ALL',
          status: 'INACTIVE',
          visibility: 'PROJECT',
          organization: 'essedum',
          usageCount: 9,
          createdBy: 'john.doe',
          createdAt: '2026-07-01T13:00:00Z',
        },
      ];
      this.applyFilter();
      this.loading = false;
    }, 400);
  }

  onRefresh(): void {
    this.loadSkills();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilter();
  }

  onTypeChange(value: string): void {
    this.selectedType = value;
    this.applyFilter();
  }

  onCategoryChange(value: string): void {
    this.selectedCategory = value;
    this.applyFilter();
  }

  onSubcategoryChange(value: string): void {
    this.selectedSubcategory = value;
    this.applyFilter();
  }

  clearTypeFilter(): void {
    this.selectedType = '';
    this.applyFilter();
  }

  clearCategoryFilter(): void {
    this.selectedCategory = '';
    this.applyFilter();
  }

  clearSubcategoryFilter(): void {
    this.selectedSubcategory = '';
    this.applyFilter();
  }

  toggleFilter(): void {
    this.isFilterExpanded = !this.isFilterExpanded;
  }

  applyFilter(): void {
    let result = [...this.skills];
    if (this.selectedType) {
      result = result.filter(s => s.skillType === this.selectedType);
    }
    if (this.selectedCategory) {
      result = result.filter(s => s.category === this.selectedCategory);
    }
    if (this.selectedSubcategory) {
      result = result.filter(s => s.subcategory === this.selectedSubcategory);
    }
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(term) ||
          s.description.toLowerCase().includes(term) ||
          s.createdBy.toLowerCase().includes(term) ||
          (s.category ?? '').toLowerCase().includes(term),
      );
    }
    this.filteredSkills = result;

    // Reset to first page and recalculate pagination
    this.pageNumber = 1;
    this.noOfPages = Math.ceil(this.filteredSkills.length / this.pageSize);
    this.pageArr = [...Array(this.noOfPages).keys()];
    this.hoverStates = new Array(this.pageArr.length).fill(false);
    this.updatePaginatedSkills();
  }

  updatePaginatedSkills(): void {
    const startIdx = (this.pageNumber - 1) * this.pageSize;
    const endIdx = startIdx + this.pageSize;
    this.paginatedSkills = this.filteredSkills.slice(startIdx, endIdx);
  }

  nextPage(): void {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      this.changePage();
    }
  }

  prevPage(): void {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      this.changePage();
    }
  }

  changePage(page?: number): void {
    if (page && page >= 1 && page <= this.noOfPages) this.pageNumber = page;
    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      if (this.pageNumber > 5) {
        this.endIndex = this.pageNumber;
        this.startIndex = this.endIndex - 5;
      } else {
        this.startIndex = 0;
        this.endIndex = 5;
      }
      this.updatePaginatedSkills();
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
      width: '400px',
      data: {
        title: 'Delete Skill',
        message: `Are you sure you want to delete "${skill.name}"?`,
        confirmLabel: 'Delete',
      },
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.skills = this.skills.filter(s => s.id !== skill.id);
        
        // Recalculate pagination after deletion
        this.noOfPages = Math.ceil(this.filteredSkills.length / this.pageSize);
        if (this.pageNumber > this.noOfPages && this.noOfPages > 0) {
          this.pageNumber = this.noOfPages;
        }
        
        this.applyFilter();
        this.snackBar.open(this.DELETEDMSG, 'Close', { duration: 3000 });
      }
    });
  }

  getTypeLabel(type: string): string {
    return this.skillTypeOptions.find(o => o.value === type)?.label ?? type;
  }

  getCategoryLabel(cat: string): string {
    return this.categoryOptions.find(o => o.value === cat)?.label ?? cat;
  }

  getTypeBadgeClass(type: string): string {
    return 'type-' + type.toLowerCase().replace(/_/g, '-');
  }

  getCategoryBadgeClass(cat: string): string {
    return 'cat-' + cat.toLowerCase();
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
