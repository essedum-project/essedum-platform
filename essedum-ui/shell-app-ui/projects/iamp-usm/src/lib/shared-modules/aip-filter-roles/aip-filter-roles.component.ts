import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

// Interface for filter items
export interface FilterItem {
  category: string;
  label: string;
  value: string;
  selected: boolean;
}

@Component({
  selector: 'app-aip-filter-roles',
  templateUrl: './aip-filter-roles.component.html',
  styleUrls: ['./aip-filter-roles.component.scss'],
  animations: [
    trigger('slideToggle', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('600ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('600ms ease-in', style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
})
export class AipFilterRolesComponent implements OnInit, OnChanges {
  // Input properties
  @Input() filterOptions: any[] = [];
  @Input() selectedFilterValues: any = {};

  // Output properties
  @Output() filterSelected = new EventEmitter<any>();
  @Output() filterStatusChange = new EventEmitter<boolean>();

  // Constants
  TOOLTIP_POSITION: 'above' | 'below' = 'above';
  
  // Component state
  isFilterExpanded: boolean = false;
  selectedRoleList: string[] = [];
  selectedProjectList: string[] = [];
  selectedDescriptionList: string[] = [];
  selectedPortfolioList: string[] = [];
  
  // Filter properties
  roleOptions: any[] = [];
  projectOptions: any[] = [];
  descriptionOptions: any[] = [];
  portfolioOptions: any[] = [];
  
  constructor() {}

  ngOnInit(): void {
    this.initializeFilterOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterOptions'] && !changes['filterOptions'].firstChange) {
      this.initializeFilterOptions();
    }
    
    if (changes['selectedFilterValues'] && !changes['selectedFilterValues'].firstChange) {
      this.updateSelectedFilters();
    }
  }

  private initializeFilterOptions(): void {
    if (this.filterOptions && this.filterOptions.length > 0) {
      this.roleOptions = this.filterOptions.filter(option => option.type === 'role');
      this.projectOptions = this.filterOptions.filter(option => option.type === 'project');
      this.descriptionOptions = this.filterOptions.filter(option => option.type === 'description');
      this.portfolioOptions = this.filterOptions.filter(option => option.type === 'portfolio');
      
      // Log for debugging
      console.log('Portfolio options:', this.portfolioOptions);
    }
    this.updateSelectedFilters();
  }

  private updateSelectedFilters(): void {
    if (this.selectedFilterValues) {
      this.selectedRoleList = this.selectedFilterValues.roles || [];
      this.selectedProjectList = this.selectedFilterValues.projects || [];
      this.selectedDescriptionList = this.selectedFilterValues.descriptions || [];
      this.selectedPortfolioList = this.selectedFilterValues.portfolios || [];
    }
  }

  toggleFilterExpanded(): void {
    this.isFilterExpanded = !this.isFilterExpanded;
    this.filterStatusChange.emit(this.isFilterExpanded);
  }

  toggleExpand(event: Event): void {
    event.stopPropagation();
    this.toggleFilterExpanded();
  }

  hasActiveFilters(): boolean {
    return (
      this.selectedRoleList.length > 0 ||
      this.selectedProjectList.length > 0 ||
      this.selectedDescriptionList.length > 0
    );
  }

  getActiveFiltersSummary(): string {
    const filters = [];
    
    if (this.selectedRoleList.length > 0) {
      filters.push(`Roles (${this.selectedRoleList.length})`);
    }
    
    if (this.selectedProjectList.length > 0) {
      filters.push(`Projects (${this.selectedProjectList.length})`);
    }
    
    if (this.selectedDescriptionList.length > 0) {
      filters.push(`Descriptions (${this.selectedDescriptionList.length})`);
    }
    
    return filters.join(', ');
  }

  roleSelected(event: any): void {
    const selectedValue = event.value;
    if (selectedValue && !this.selectedRoleList.includes(selectedValue)) {
      this.selectedRoleList.push(selectedValue);
      this.emitFilterChange();
    }
  }

  projectSelected(event: any): void {
    const selectedValue = event.value;
    if (selectedValue && !this.selectedProjectList.includes(selectedValue)) {
      this.selectedProjectList.push(selectedValue);
      this.emitFilterChange();
    }
  }

  descriptionSelected(event: any): void {
    const selectedValue = event.value;
    if (selectedValue && !this.selectedDescriptionList.includes(selectedValue)) {
      this.selectedDescriptionList.push(selectedValue);
      this.emitFilterChange();
    }
  }

  portfolioSelected(event: any): void {
    const selectedValue = event.value;
    if (selectedValue && !this.selectedPortfolioList.includes(selectedValue)) {
      this.selectedPortfolioList.push(selectedValue);
      this.emitFilterChange();
    }
  }

  removeRole(role: string): void {
    this.selectedRoleList = this.selectedRoleList.filter(r => r !== role);
    this.emitFilterChange();
  }

  removeProject(project: string): void {
    this.selectedProjectList = this.selectedProjectList.filter(p => p !== project);
    this.emitFilterChange();
  }

  removeDescription(description: string): void {
    this.selectedDescriptionList = this.selectedDescriptionList.filter(d => d !== description);
    this.emitFilterChange();
  }

  removePortfolio(portfolio: string): void {
    this.selectedPortfolioList = this.selectedPortfolioList.filter(p => p !== portfolio);
    this.emitFilterChange();
  }

  clearAllFilters(filterType: string): void {
    switch (filterType) {
      case 'role':
        this.selectedRoleList = [];
        break;
      case 'project':
        this.selectedProjectList = [];
        break;
      case 'description':
        this.selectedDescriptionList = [];
        break;
      case 'portfolio':
        this.selectedPortfolioList = [];
        break;
      default:
        this.selectedRoleList = [];
        this.selectedProjectList = [];
        this.selectedDescriptionList = [];
        this.selectedPortfolioList = [];
        break;
    }
    this.emitFilterChange();
  }

  private emitFilterChange(): void {
    this.filterSelected.emit({
      roles: this.selectedRoleList,
      projects: this.selectedProjectList,
      descriptions: this.selectedDescriptionList,
      portfolios: this.selectedPortfolioList
    });
    
    // Collapse the filter panel after any change
    setTimeout(() => {
      this.isFilterExpanded = false;
      this.filterStatusChange.emit(false);
    }, 300);
  }
}
