import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { TagEventDTO } from "../../models/tagEventDTO.model";
import { HttpParams } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { animate, style, transition, trigger } from "@angular/animations";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { MatSelectModule } from "@angular/material/select";
import { UsmPermissionsService } from "../../services/usm-permission.service";
import { RoleService } from "../../services/role.service";
import { Project } from "../../models/project";
import { Role } from "../../models/role";
import { UsmPermissions } from "../../models/usm-permissions";

// Interface for filter items
interface FilterItem {
  category: string;
  label: string;
  value: string;
  selected: boolean;
}

// Enum for service types
enum ServiceType {
  PORTFOLIO = "Portfolio",
  ROLEPERMISSION = "RolePermission",
}

// Enum for filter types
enum FilterType {
  CATEGORY = "category",
  ROLENAME = "roleName",
}

@Component({
  selector: "app-aip-filter",
  templateUrl: "./aip-filter.component.html",
  styleUrls: ["./aip-filter.component.scss"],
  animations: [
    trigger("slideToggle", [
      transition(":enter", [
        style({ height: 0, opacity: 0 }),
        animate("600ms ease-out", style({ height: "*", opacity: 1 })),
      ]),
      transition(":leave", [
        animate("600ms ease-in", style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
  standalone: true,
  imports: [
    MatIconModule,
    MatTooltipModule,
    CommonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatChipsModule,
    MatSelectModule,
  ],
})
export class AipFilterComponent implements OnInit, OnChanges {
  // Input properties
  @Input() tagrefresh = false;
  @Input() servicev1 = "";
  @Input() selectedPortfolioList: any;
  @Input() selectedRolePermissionList: any;


  // Output properties
  @Output() tagSelected = new EventEmitter<TagEventDTO>();
  @Output() filterStatusChange = new EventEmitter<boolean>();

  // Constants
  readonly TOOLTIP_POSITION = "above";
  readonly ServiceType = ServiceType;
  readonly FilterType = FilterType;

  // UI state
  isFilterExpanded = false;
  isExpanded = false;
  isLoading = false;

  // Filter arrays and maps
  category: string[] = [];
  tags: Record<string, any[]> = {};
  tagStatus: Record<string, boolean> = {};
  catStatus: Record<string, boolean> = {};

  // Portfolio filter inputs
  searchedName: string = "";
  filterUsmPortfolio: string = "";

  // Selected filters
  selectedType: string[] = [];
  selectedAdapterType: string[] = [];
  selectedRoleName: string[] = [];

  selectedAdapterList: string[] = [];


  selectedMlAppType: string[] = [];
  selectedMlIncType: string[] = [];
  appsTypeList = [];
  selectedPortfolioDescriptionList: string[] = [];
  selectedPortfolioNameList: string[] = [];
  portfolioDescription: string[] = [];  portfolioName: string[] = [];    rolePermission: { role: any; module: string; permission: any } = {
    role: null,
    module: 'All',
    permission: [],
  };
  
  uniqueModules: string[] = [];
  filteredPermissions: any[] = [];
  showRoleError: boolean = false;
  view: boolean = false;

  modulepermissionarrayFilter = [];
  modulepermissionarray = [];
  roleArray = [];
  examplerole: Role = new Role();
  examplepermission: UsmPermissions = new UsmPermissions();
  lazyload = { first: 0, rows: 5000, sortField: null, sortOrder: null };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roleService: RoleService,
    private usmPermissionsService: UsmPermissionsService
  ) {}

  ngOnInit(): void {
    this.loadPreselectedFilters();
    this.initializeServiceBasedFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {}

  /**
   * Loads preselected filters from input properties
   */
  private loadPreselectedFilters(): void {

    if (this.selectedPortfolioNameList) {
      this.portfolioName = this.selectedPortfolioNameList ?? [];
    }

    if (this.selectedPortfolioDescriptionList) {
      this.portfolioDescription = this.selectedPortfolioDescriptionList ?? [];
    }

    if (this.selectedPortfolioList) {
      this.selectedAdapterType =
        this.selectedPortfolioList.selectedAdapterType ?? [];
    }

     if (this.selectedRolePermissionList) {
      this.selectedRoleName =
        this.selectedRolePermissionList.selectedRoleName ?? [];
    }

    
  }



  /**
   * Initializes filters based on the service type
   */
  private initializeServiceBasedFilters(): void {
    this.isLoading = true;

    switch (this.servicev1) {
      case ServiceType.PORTFOLIO:
      case ServiceType.ROLEPERMISSION:
        this.loadPermissions();
        this.loadRoles();
        break;
      default:
        this.fetchAdapters();
    }
    if (this.tagrefresh) {
      this.refresh();
    }

    this.isLoading = false;
  }

  /**
   * Handles changes to the tagrefresh input
   */
  private handleTagRefreshChange(): void {
    if (this.servicev1 === ServiceType.PORTFOLIO) {
    } else {
      this.refresh();
    }
  }

  /**
   * Helper method to process filter lists
   */
  private processFilterList(
    sourceList: string[],
    category: string,
    selectedFromInput: string[],
    targetFilterList: FilterItem[],
    targetSelectedList: string[]
  ): void {
    sourceList.forEach((element) => {
      const isPreselected =
        !this.tagrefresh &&
        selectedFromInput &&
        selectedFromInput.length > 0 &&
        selectedFromInput.includes(element);

      if (!targetFilterList.some((item) => item.value === element)) {
        targetFilterList.push({
          category,
          label: element,
          value: element,
          selected: isPreselected,
        });

        if (isPreselected && !targetSelectedList.includes(element)) {
          targetSelectedList.push(element);
        }
      }
    });
  }

  /**
   * Fetches adapters based on current adapter type selection
   */
  fetchAdapters(): boolean {
    const params = new HttpParams().set(
      "project",
      sessionStorage.getItem("organization") || ""
    );
    return true;
  }

  /**
   * Toggles an item in a selection array
   */
  private toggleFilterSelection(value: string, selectionArray: string[]): void {
    const index = selectionArray.indexOf(value);

    if (index === -1) {
      selectionArray.push(value);
    } else {
      selectionArray.splice(index, 1);
    }
  }

  /**
   * Emits selection changes to parent component
   */
  private emitSelectionChanges(): void {
    this.tagSelected.emit(this.geteventtagsdto());
  }

  /**
   * Refreshes all filters
   */
  refresh(): void {
    this.resetAllFilters();
    this.emitSelectionChanges();
    this.initializeServiceSpecificFilters();
  }

  /**
   * Resets all filter arrays
   */
  private resetAllFilters(): void {
    this.portfolioDescription = [];
    this.portfolioName = [];
  }

  /**
   * Initializes service-specific filters
   */
  private initializeServiceSpecificFilters(): void {
    if (this.servicev1 === ServiceType.PORTFOLIO) {
    }
  }



  /**
   * Helper method to clear a filter list
   */
  private clearFilterList(
    selectedArray: string[],
    filterList: FilterItem[]
  ): void {
    selectedArray.length = 0;
    filterList.forEach((element) => {
      element.selected = false;
    });
  }



  /**
   * Creates a tag event DTO
   */  
  geteventtagsdto(): TagEventDTO {
    // For portfolio filtering, pass the current search field values directly
    const portfolioName = this.searchedName ? [this.searchedName] : [];
    const portfolioDesc = this.filterUsmPortfolio ? [this.filterUsmPortfolio] : [];
    
    const dto = new TagEventDTO(
      this.selectedAdapterType,
      portfolioName,
      portfolioDesc,
      this.selectedRoleName ?? []
    );
    
    if (this.servicev1 === ServiceType.PORTFOLIO) {
      console.log("Portfolio filter values being emitted:", {
        searchedName: this.searchedName,
        filterUsmPortfolio: this.filterUsmPortfolio,
        portfolioName: dto.portfolioName,
        portfolioDescription: dto.portfolioDescription
      });
    }
    if (this.servicev1 === ServiceType.ROLEPERMISSION) {
      dto["roleFilter"] = this.rolePermission.role || "All";
      if (typeof this.rolePermission.module === 'object') {
        dto["moduleFilter"] = String(this.rolePermission.module);
      } else {
        dto["moduleFilter"] = this.rolePermission.module || "All";
      }
      
      dto["permissionFilter"] = this.rolePermission.permission || [];
      console.log("Role permission filter being emitted:", {
        role: this.rolePermission.role,
        module: dto["moduleFilter"],
        permission: this.rolePermission.permission,
      });
    }

    return dto;
  }

  /**
   * Toggles expand state
   */
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * Toggles filter expanded state
   */
  toggleFilterExpanded(): void {
    this.isFilterExpanded = !this.isFilterExpanded;
  }

  /**
   * Applies the current filter values and emits filter change event
   */ 
  applyFilters(): void {    switch (this.servicev1) {
      case ServiceType.PORTFOLIO:
        // Make sure we're working with clean string values
        if (this.searchedName) {
          this.searchedName = this.searchedName.trim();
        }
        if (this.filterUsmPortfolio) {
          this.filterUsmPortfolio = this.filterUsmPortfolio.trim();
        }
        
        console.log("AipFilterComponent: Applying portfolio filters", {
          searchedName: this.searchedName,
          filterUsmPortfolio: this.filterUsmPortfolio,
        });
        break;
      case ServiceType.ROLEPERMISSION:
        console.log("AipFilterComponent: Applying role permission filters", {
          role: this.rolePermission.role
            ? this.rolePermission.role.name
            : "All",
          permission:
            this.rolePermission.permission &&
            this.rolePermission.permission.length > 0
              ? this.rolePermission.permission
                  .map((p) => `${p.module}-${p.permission}`)
                  .join(", ")
              : "All",
        });
        break;

      default:
        console.log("AipFilterComponent: Applying adapter filters", {
          selectedAdapterType: this.selectedAdapterType,
        });
        break;
    }

    this.emitSelectionChanges();
    this.updateFilterStatus();
    this.isFilterExpanded = !this.isFilterExpanded;
  }

  /**
   * Checks if there are active filters
   */ 
  hasActiveFilters(): boolean {
    if (this.servicev1 === ServiceType.PORTFOLIO) {
      const hasTypeFilter = this.selectedAdapterType && this.selectedAdapterType.length > 0;
      const hasNameFilter = Boolean(this.searchedName && this.searchedName.trim());
      const hasDescFilter = Boolean(this.filterUsmPortfolio && this.filterUsmPortfolio.trim());
      
      console.log('Portfolio filter status:', {
        hasTypeFilter,
        hasNameFilter,
        hasDescFilter,
        searchedName: this.searchedName,
        filterUsmPortfolio: this.filterUsmPortfolio
      });
      
      return hasTypeFilter || hasNameFilter || hasDescFilter;
    }if (this.servicev1 === ServiceType.ROLEPERMISSION) {
      const hasRoleFilter = this.rolePermission.role && this.rolePermission.role !== 'All';
      const hasModuleFilter = this.rolePermission.module && this.rolePermission.module !== 'All';
      const hasPermissionFilter = this.rolePermission.permission && 
         Array.isArray(this.rolePermission.permission) && 
         this.rolePermission.permission.length > 0;
      
      console.log('Active filters check:', {
        hasRoleFilter,
        hasModuleFilter,
        hasPermissionFilter
      });
      
      return hasRoleFilter || hasModuleFilter || hasPermissionFilter;
    }

    return (
      this.selectedRoleName?.length > 0 
    );
  }

  /**
   * Gets a summary of active filters for display
   */ 
  getActiveFiltersSummary(): string {
    if (this.servicev1 === ServiceType.PORTFOLIO) {
      const filterSummary = [];

      // Prioritize search field values over arrays
      if (this.searchedName && this.searchedName.trim()) {
        filterSummary.push(`Name: ${this.searchedName}`);
      } else if (this.portfolioName?.length > 0) {
        filterSummary.push(`Name: ${this.portfolioName[0]}`);
      }

      if (this.filterUsmPortfolio && this.filterUsmPortfolio.trim()) {
        filterSummary.push(`Description: ${this.filterUsmPortfolio}`);
      } else if (this.portfolioDescription?.length > 0) {
        filterSummary.push(`Description: ${this.portfolioDescription[0]}`);
      }

      if (this.selectedAdapterType?.length > 0) {
        filterSummary.push(`Type: ${this.selectedAdapterType.join(", ")}`);
      }

      return filterSummary.join(" | ");
    }    if (this.servicev1 === ServiceType.ROLEPERMISSION) {
      const filterSummary = [];

      if (this.rolePermission.role && this.rolePermission.role !== 'All') {
        filterSummary.push(`Role: ${this.rolePermission.role.name || this.rolePermission.role}`);
      }
      
      if (this.rolePermission.module && this.rolePermission.module !== 'All') {
        filterSummary.push(`Module: ${this.rolePermission.module}`);
      }

      if (
        this.rolePermission.permission &&
        Array.isArray(this.rolePermission.permission) &&
        this.rolePermission.permission.length > 0
      ) {
        const permLabels = this.rolePermission.permission.map(
          (perm) => `${perm.module}-${perm.permission}`
        );
        filterSummary.push(`Permission: ${permLabels.join(", ")}`);
      }

      return filterSummary.join(" | ");
    }

    return this.selectedAdapterType?.length > 0
      ? `Types: ${this.selectedAdapterType.join(", ")}`
      : "";
  }

  /**
   * Updates filter status
   */
  private updateFilterStatus(): void {
    const hasFilters = this.hasActiveFilters();
    console.log(
      "AipFilterComponent: Emitting filter status change:",
      hasFilters
    );
    this.filterStatusChange.emit(hasFilters);
  }

  /**
   * Removes a portfolio type from the filter
   */
  removePortfolioType(type: string): void {
    const index = this.selectedAdapterType.indexOf(type);
    if (index !== -1) {
      this.selectedAdapterType.splice(index, 1);
      this.applyFilters();
    }
  }

  /**
   * Removes the role filter
   */
  removeRoleFilter(): void {
    this.rolePermission.role = 'All';
    this.applyFilters();
  }
  
  /**
   * Removes a specific permission filter
   */
  removePermissionFilter(permission: any): void {
    if (this.rolePermission.permission && Array.isArray(this.rolePermission.permission)) {
      const index = this.rolePermission.permission.findIndex(
        p => p.module === permission.module && p.permission === permission.permission
      );
      
      if (index !== -1) {
        this.rolePermission.permission.splice(index, 1);
        this.applyFilters();
      }
    }
  }

  compareObjects(o1: any, o2: any): boolean {
    if (!o1 || !o2) {
      return o1 === o2;
    }
    if (o1 === "All" || o2 === "All") {
      return o1 === o2;
    }
    return o1.id === o2.id;
  }

  roleSelectionChanged(event: any): void {
    this.showRoleError = !this.rolePermission.role;
    this.applyFilters();
  }

  /**
   * Load all roles from the API
   */
  loadRoles() {
    this.roleArray = [];
    this.examplerole.projectId = null;
    this.roleService
      .findAll(this.examplerole, this.lazyload)
      .subscribe((response) => {
        let project: Project;
        try {
          project = JSON.parse(sessionStorage.getItem("project"));
        } catch (e) {
          project = null;
        }
        this.roleArray = response.content;
        this.roleArray = response.content.filter((role) => role.id != 8);
        let role = JSON.parse(sessionStorage.getItem("role"));
        if (role.roleadmin) {
          this.roleArray = response.content.filter(
            (value) =>
              (!value.projectId || value.projectId == project.id) &&
              value.id != 6
          );
        }
        this.roleArray = this.roleArray.sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        );
      });
  }

  /**
   * Load all permissions from the API
   */  
  loadPermissions() {
    this.modulepermissionarray = [];
    this.uniqueModules = [];
    this.filteredPermissions = [];
    this.usmPermissionsService
      .findAll(this.examplepermission, this.lazyload)
      .subscribe((response) => {
        let project: Project;
        try {
          project = JSON.parse(sessionStorage.getItem("project"));
        } catch (e) {
          project = null;
        }
        this.modulepermissionarray = response.content;
        this.modulepermissionarray = this.modulepermissionarray.filter(
          (arr, index, self) =>
            index ===
            self.findIndex(
              (t) => t.module === arr.module && t.permission === arr.permission
            )
        );
        this.modulepermissionarray = this.modulepermissionarray.sort((a, b) =>
          a.module.toLowerCase() > b.module.toLowerCase() ? 1 : -1
        );
        this.modulepermissionarrayFilter = this.modulepermissionarray;
        this.filteredPermissions = this.modulepermissionarray;
     
        this.uniqueModules = Array.from(
          new Set(this.modulepermissionarray.map(item => item.module))
        ).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      });
  }

  /**
   * Clears all filters of a specific type
   */
  clearAllFilters(filterType: FilterType): void {
    switch (filterType) {
      case FilterType.ROLENAME:
        this.clearFilterList(this.selectedAdapterType, this.roleArray || []);
        break;
    }
    this.emitSelectionChanges();
    this.updateFilterStatus();
  }
  
  /**
   * Gets permissions filtered by selected module
   */
  getPermissionsByModule(): any[] {
    if (!this.rolePermission.module) {
      this.rolePermission.module = 'All';
      return this.modulepermissionarray || [];
    }

    if (typeof this.rolePermission.module === 'object') {
      this.rolePermission.module = String(this.rolePermission.module);
    }
    
    if (this.rolePermission.module === 'All') {
      return this.modulepermissionarray || [];
    }    
    const filteredPerms = (this.modulepermissionarray || []).filter(
      permission => permission.module === this.rolePermission.module
    );    
    console.log(`Filtered ${filteredPerms.length} permissions for module: ${this.rolePermission.module}`);    
    return filteredPerms;
  }
  
  /**
   * Handles module selection change
   */ 
  onModuleChange(): void {
    this.rolePermission.permission = [];
    if (!this.rolePermission.module) {
      this.rolePermission.module = 'All';
    } else if (typeof this.rolePermission.module === 'object' && this.rolePermission.module !== null) {
      this.rolePermission.module = this.rolePermission.module ? String(this.rolePermission.module) : 'All';
    }
    this.filteredPermissions = this.getPermissionsByModule();
    
    console.log('Module changed to:', this.rolePermission.module);
    console.log('Filtered permissions updated:', this.filteredPermissions ? this.filteredPermissions.length : 0, 'items');
    this.applyFilters();
  }
  
  /**
   * Removes the module filter
   */
  removeModuleFilter(): void {
    this.rolePermission.module = 'All';
    this.rolePermission.permission = [];
    this.filteredPermissions = this.modulepermissionarray;    
    console.log('Module filter removed, reset to:', this.rolePermission.module);
    this.applyFilters();
  }
}
