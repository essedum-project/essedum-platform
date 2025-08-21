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
  selectedUserList: string[] = [];
  selectedPortfolioList: string[] = [];
  
  // Filter properties
  roleOptions: any[] = [];
  projectOptions: any[] = [];
  userOptions: any[] = [];
  portfolioOptions: any[] = [];
  
  constructor() {}

  ngOnInit(): void {
    console.log('Component initialized with filter options:', this.filterOptions);
    this.initializeFilterOptions();
    
    // Add debug HTML to show options in DOM for debugging
    if (typeof document !== 'undefined') {
      const debugDiv = document.createElement('div');
      debugDiv.style.display = 'none'; // Hide from view but keep in DOM
      debugDiv.id = 'filter-debug-data';
      debugDiv.setAttribute('data-role-options', JSON.stringify(this.roleOptions || []));
      debugDiv.setAttribute('data-project-options', JSON.stringify(this.projectOptions || []));
      document.body.appendChild(debugDiv);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Changes detected in filter component:', changes);
    
    if (changes['filterOptions']) {
      console.log('Filter options changed:', this.filterOptions);
      // Initialize on all changes, not just non-first changes
      this.initializeFilterOptions();
    }
    
    if (changes['selectedFilterValues']) {
      console.log('Selected filter values changed:', this.selectedFilterValues);
      this.updateSelectedFilters();
    }
  }

  private initializeFilterOptions(): void {
    console.log('Initializing filter options with:', JSON.stringify(this.filterOptions));
    
    // Reset existing options
    this.roleOptions = [];
    this.projectOptions = [];
    this.userOptions = [];
    this.portfolioOptions = [];
    
    if (this.filterOptions && this.filterOptions.length > 0) {
      // Extract and process each filter type
      this.filterOptions.forEach(filter => {
        if (!filter || !filter.type || !filter.options) {
          console.warn('Invalid filter:', filter);
          return;
        }
        
        switch (filter.type) {
          case 'role':
            this.roleOptions = [...filter.options];
            console.log('Set role options:', this.roleOptions.length);
            break;
          case 'project':
            this.projectOptions = [...filter.options];
            console.log('Set project options:', this.projectOptions.length);
            break;
          case 'user':
            this.userOptions = [...filter.options];
            console.log('Set user options:', this.userOptions.length);
            break;
          case 'portfolio':
            this.portfolioOptions = [...filter.options];
            console.log('Set portfolio options:', this.portfolioOptions.length);
            break;
          default:
            console.warn('Unknown filter type:', filter.type);
        }
      });
    }
    
    // Update any selected filters
    this.updateSelectedFilters();
    
    // Diagnose issues if no options
    if (this.roleOptions.length === 0) {
      console.warn('No role options found after initialization');
    }
    if (this.projectOptions.length === 0) {
      console.warn('No project options found after initialization');
    }
  }

  private updateSelectedFilters(): void {
    if (this.selectedFilterValues) {
      this.selectedRoleList = this.selectedFilterValues.roles || [];
      this.selectedProjectList = this.selectedFilterValues.projects || [];
      this.selectedUserList = this.selectedFilterValues.users || [];
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
      this.selectedUserList.length > 0 ||
      this.selectedPortfolioList.length > 0
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
    
    if (this.selectedUserList.length > 0) {
      filters.push(`Users (${this.selectedUserList.length})`);
    }
    
    if (this.selectedPortfolioList.length > 0) {
      filters.push(`Portfolios (${this.selectedPortfolioList.length})`);
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

  userSelected(event: any): void {
    const selectedValue = event.value;
    if (selectedValue && !this.selectedUserList.includes(selectedValue)) {
      this.selectedUserList.push(selectedValue);
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

  removeUser(user: string): void {
    this.selectedUserList = this.selectedUserList.filter(u => u !== user);
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
      case 'user':
        this.selectedUserList = [];
        break;
      case 'portfolio':
        this.selectedPortfolioList = [];
        break;
      default:
        this.selectedRoleList = [];
        this.selectedProjectList = [];
        this.selectedUserList = [];
        this.selectedPortfolioList = [];
        break;
    }
    this.emitFilterChange();
  }

  private emitFilterChange(): void {
    this.filterSelected.emit({
      roles: this.selectedRoleList,
      projects: this.selectedProjectList,
      users: this.selectedUserList,
      portfolios: this.selectedPortfolioList
    });
    
    // Collapse the filter panel after any change
    setTimeout(() => {
      this.isFilterExpanded = false;
      this.filterStatusChange.emit(false);
    }, 300);
  }
}
