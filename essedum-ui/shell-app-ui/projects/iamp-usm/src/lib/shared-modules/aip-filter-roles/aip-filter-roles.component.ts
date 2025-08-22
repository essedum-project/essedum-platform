import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output
} from '@angular/core';

@Component({
  selector: 'app-aip-filter-roles',
  templateUrl: './aip-filter-roles.component.html',
  styleUrls: ['./aip-filter-roles.component.scss']
})
export class AipFilterRolesComponent implements OnInit, OnChanges {
  // Input properties
  @Input() filterOptions: any[] = [];
  @Input() selectedFilterValues: any = {};
  @Input() componentName: string;

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
  
  // New properties for manage-users component
  selectedUserLoginList: string[] = [];
  selectedEmailList: string[] = [];
  
  // Filter properties
  roleOptions: any[] = [];
  projectOptions: any[] = [];
  userOptions: any[] = [];
  portfolioOptions: any[] = [];
  // New filter options for manage-users
  userLoginOptions: any[] = [];
  emailOptions: any[] = [];
  
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
    // Reset options
    this.roleOptions = [];
    this.projectOptions = [];
    this.userOptions = [];
    this.portfolioOptions = [];
    this.userLoginOptions = [];
    this.emailOptions = [];

    if (!this.filterOptions || this.filterOptions.length === 0) {
      return;
    }

    this.filterOptions.forEach(filterGroup => {
      if (filterGroup && filterGroup.type && filterGroup.options) {
        switch (filterGroup.type) {
          case 'role':
            this.roleOptions = filterGroup.options;
            break;
          case 'project':
            this.projectOptions = filterGroup.options;
            break;
          case 'user':
            this.userOptions = filterGroup.options;
            break;
          case 'portfolio':
            this.portfolioOptions = filterGroup.options;
            break;
          case 'userlogins':
            this.userLoginOptions = filterGroup.options;
            break;
          case 'emails':
            this.emailOptions = filterGroup.options;
            break;
        }
      } else {
        console.warn('Invalid filter group received:', filterGroup);
      }
    });

    this.updateSelectedFilters();
  }

  private updateSelectedFilters(): void {
    if (this.selectedFilterValues) {
      this.selectedRoleList = this.selectedFilterValues.roles || [];
      this.selectedProjectList = this.selectedFilterValues.projects || [];
      this.selectedUserList = this.selectedFilterValues.users || [];
      this.selectedPortfolioList = this.selectedFilterValues.portfolios || [];
      this.selectedUserLoginList = this.selectedFilterValues.userLogins || [];
      this.selectedEmailList = this.selectedFilterValues.emails || [];
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
      this.selectedPortfolioList.length > 0 ||
      this.selectedUserLoginList.length > 0 ||
      this.selectedEmailList.length > 0
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
    
    if (this.selectedUserLoginList.length > 0) {
      filters.push(`User Logins (${this.selectedUserLoginList.length})`);
    }
    
    if (this.selectedEmailList.length > 0) {
      filters.push(`Emails (${this.selectedEmailList.length})`);
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

  userLoginSelected(event: any): void {
    const selectedValue = event.value;
    if (selectedValue && !this.selectedUserLoginList.includes(selectedValue)) {
      this.selectedUserLoginList.push(selectedValue);
      this.emitFilterChange();
    }
  }

  emailSelected(event: any): void {
    const selectedValue = event.value;
    if (selectedValue && !this.selectedEmailList.includes(selectedValue)) {
      this.selectedEmailList.push(selectedValue);
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

  removeUserLogin(userLogin: string): void {
    this.selectedUserLoginList = this.selectedUserLoginList.filter(u => u !== userLogin);
    this.emitFilterChange();
  }

  removeEmail(email: string): void {
    this.selectedEmailList = this.selectedEmailList.filter(e => e !== email);
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
      case 'userLogin':
        this.selectedUserLoginList = [];
        break;
      case 'email':
        this.selectedEmailList = [];
        break;
      default:
        this.selectedRoleList = [];
        this.selectedProjectList = [];
        this.selectedUserList = [];
        this.selectedPortfolioList = [];
        this.selectedUserLoginList = [];
        this.selectedEmailList = [];
        break;
    }
    this.emitFilterChange();
  }

  private emitFilterChange(): void {
    this.filterSelected.emit({
      roles: this.selectedRoleList,
      projects: this.selectedProjectList,
      users: this.selectedUserList,
      portfolios: this.selectedPortfolioList,
      userLogins: this.selectedUserLoginList,
      emails: this.selectedEmailList
    });
    
    // Collapse the filter panel after any change
    setTimeout(() => {
      this.isFilterExpanded = false;
      this.filterStatusChange.emit(false);
    }, 300);
  }
}
