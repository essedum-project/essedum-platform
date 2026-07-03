import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SkillsAddEditComponent } from './skills-add-edit/skills-add-edit.component';
import { ConfirmDeleteDialogComponent } from '@essedum/shared-lib';

export interface Skill {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  type: string;
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

  readonly typeOptions = [
    { value: '', label: 'All' },
    { value: 'nlp',  label: 'NLP' },
    { value: 'code', label: 'Code' },
    { value: 'data', label: 'Data' },
    { value: 'vision', label: 'Vision' },
  ];

  // ── Page labels ───────────────────────────────────────────────────────────
  readonly PAGETITLE      = 'Skills';
  readonly COLNAME        = 'Skill Name';
  readonly COLDESC        = 'Description';
  readonly COLCREATEDBY   = 'Created By';
  readonly COLTYPE        = 'Type';
  readonly COLDATE        = 'Date';
  readonly COLACTIONS     = 'Actions';
  readonly EMPTYMESSAGE   = 'No skills found. Click "+" to create one.';
  readonly VIEWLABEL      = 'View';
  readonly EDITLABEL      = 'Edit';
  readonly DELETELABEL    = 'Delete';
  readonly DELETEDMSG     = 'Skill deleted successfully!';
  // ── Filter / table labels ───────────────────────────────────────────
  readonly FILTERTITLE    = 'FILTER BY:';
  readonly FILTERTYPELBL  = 'TYPE';
  readonly FILTERALLOPT   = 'All';
  readonly LOADINGMSG     = 'Loading skills…';
  readonly OPTIONSTIP     = 'Options';

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
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
          name: 'Text Summarization',
          description: 'Summarizes long documents into concise paragraphs using LLMs.',
          createdBy: 'admin',
          createdAt: '2026-05-10T10:30:00Z',
          type: 'nlp',
        },
        {
          id: '2',
          name: 'Sentiment Analysis',
          description: 'Classifies text input as positive, negative, or neutral.',
          createdBy: 'john.doe',
          createdAt: '2026-05-15T14:00:00Z',
          type: 'nlp',
        },
        {
          id: '3',
          name: 'Code Generation',
          description: 'Generates code snippets from natural language descriptions.',
          createdBy: 'admin',
          createdAt: '2026-06-01T09:15:00Z',
          type: 'code',
        },
        {
          id: '4',
          name: 'Image Classification',
          description: 'Classifies images into predefined categories using vision models.',
          createdBy: 'jane.smith',
          createdAt: '2026-06-15T08:00:00Z',
          type: 'vision',
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

  clearTypeFilter(): void {
    this.selectedType = '';
    this.applyFilter();
  }

  toggleFilter(): void {
    this.isFilterExpanded = !this.isFilterExpanded;
  }

  applyFilter(): void {
    let result = [...this.skills];
    if (this.selectedType) {
      result = result.filter(s => s.type === this.selectedType);
    }
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(term) ||
          s.description.toLowerCase().includes(term) ||
          s.createdBy.toLowerCase().includes(term),
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
    const ref = this.dialog.open(SkillsAddEditComponent, {
      width: '600px',
      maxWidth: '96vw',
      panelClass: 'skills-dialog-panel',
      data: { mode: 'add', skill: null },
    });
    ref.afterClosed().subscribe((result: Skill | null) => {
      if (result) {
        this.skills.push(result);
        this.applyFilter();
        // Go to last page to see new item
        if (this.pageNumber !== this.noOfPages) {
          this.pageNumber = this.noOfPages;
          this.changePage();
        }
      }
    });
  }

  openEdit(skill: Skill): void {
    const ref = this.dialog.open(SkillsAddEditComponent, {
      width: '600px',
      maxWidth: '96vw',
      panelClass: 'skills-dialog-panel',
      data: { mode: 'edit', skill: { ...skill } },
    });
    ref.afterClosed().subscribe((result: Skill | null) => {
      if (result) {
        const idx = this.skills.findIndex(s => s.id === result.id);
        if (idx !== -1) {
          this.skills[idx] = result;
          this.applyFilter();
        }
      }
    });
  }

  openView(skill: Skill): void {
    this.dialog.open(SkillsAddEditComponent, {
      width: '600px',
      maxWidth: '96vw',
      panelClass: 'skills-dialog-panel',
      data: { mode: 'view', skill: { ...skill } },
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
    return this.typeOptions.find(o => o.value === type)?.label ?? type;
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
