import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TagEventDTO } from '../../models/tagEventDTO.model';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';


// Interface for filter items
interface FilterItem {
  category: string;
  label: string;
  value: string;
  selected: boolean;
}

// Enum for service types
enum ServiceType {
  PORTFOLIO = 'Portfolio',
}

// Enum for filter types
enum FilterType {
  CATEGORY = 'category',
  ADAPTER_TYPE = 'adapterType',
  ADAPTER_INSTANCE = 'adapterInstance',
  PIPELINE_TYPE = 'pipelineType',
  TOPIC = 'topic',
  TAG = 'tag',

}

@Component({
  selector: 'app-aip-filter',
  templateUrl: './aip-filter.component.html',
  styleUrls: ['./aip-filter.component.scss'],  animations: [
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
    MatSelectModule
  ],
})
export class AipFilterComponent implements OnInit, OnChanges {  // Input properties
  @Input() tagrefresh = false;
  @Input() servicev1 = '';
  @Input() selectedAdpImplCombinedLists: any;
  @Input() selectedPortfolioList: any;


  // Output properties
  @Output() tagSelected = new EventEmitter<TagEventDTO>();
  @Output() filterStatusChange = new EventEmitter<boolean>();

  // Constants
  readonly TOOLTIP_POSITION = 'above';
  readonly ServiceType = ServiceType;
  readonly FilterType = FilterType;

  // UI state
  isFilterExpanded = false;
  isExpanded = false;
  isLoading = false;

  // Filter arrays and maps
  category: string[] = [];
  tags: Record<string, any[]> = {};
  tagsBackup: Record<string, any[]> = {};
  allTags: any[] = [];
  tagStatus: Record<string, boolean> = {};
  catStatus: Record<string, boolean> = {};

  // Portfolio filter inputs
  searchedName: string = '';
  filterUsmPortfolio: string = '';

  // Selected filters
  selectedTag: any[] = [];
  selectedTagList: any[] = [];
  selectedType: string[] = [];
  selectedAdapterType: string[] = [];
  selectedAdapterList: string[] = [];
  selectedAdapterInstance: string[] = [];
  selectedTagsType: any[] = [];

  

  // URL param lists
  type: string[] = [];
  categoryList: string[] = [];
  connectionList: string[] = [];
  specList: string[] = [];
  specCapabilityList: string[] = [];
  instanceConnectionList: string[] = [];
  instanceImplementationList: string[] = [];
  instance: string[] = [];
  pipelineType: string[] = [];
  toolsType: string[] = [];
  chainType: string[] = [];
  instanceType: string[] = [];
  appType: string[] = [];

  selectedMlAppType: string[] = [];
  selectedMlIncType: string[] = [];
  appsTypeList = [];
  selectedPortfolioDescriptionList:string[]=[];
  selectedPortfolioNameList:string[]=[];
  portfolioDescription:string[]=[];
  portfolioName:string[]=[];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadPreselectedFilters();
    this.loadQueryParams();
    this.initializeSelectedLists();
    this.initializeServiceBasedFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {
  
  }

  /**
   * Loads preselected filters from input properties
   */
  private loadPreselectedFilters(): void {
    if (this.selectedAdpImplCombinedLists) {
      this.categoryList =
        this.selectedAdpImplCombinedLists.selectedCategoryList ?? [];
      this.connectionList =
        this.selectedAdpImplCombinedLists.selectedConnectionNamesList ?? [];
      this.specList = this.selectedAdpImplCombinedLists.selectedSpecList ?? [];
      this.specCapabilityList =
        this.selectedAdpImplCombinedLists.selectedCapabilityType ?? [];
      this.instanceConnectionList =
        this.selectedAdpImplCombinedLists.selectedInstanceConnectionList ?? [];
      this.instanceImplementationList =
        this.selectedAdpImplCombinedLists.selectedInstanceImplementationList ??
        [];
    }    if (this.selectedPortfolioNameList) {
      this.portfolioName = this.selectedPortfolioNameList ?? [];
    }

    if (this.selectedPortfolioDescriptionList) {
      this.portfolioDescription = this.selectedPortfolioDescriptionList ?? [];
    }
    
    if (this.selectedPortfolioList) {
      this.selectedAdapterType = this.selectedPortfolioList.selectedAdapterType ?? [];
    }
  }

  /**
   * Loads filters from URL query parameters
   */
  private loadQueryParams(): void {
    this.route.queryParams.subscribe((params) => {
      this.type = params['type'] ? params['type'].split(',') : [];
      this.appType = params['type'] ? params['type'].split(',') : [];
      this.pipelineType = params['pipelineType']
        ? params['pipelineType'].split(',')
        : [];

      this.pipelineType = params['toolsType']
        ? params['toolsType'].split(',')
        : [];

      this.instance = params['adapterInstance']
        ? params['adapterInstance'].split(',')
        : [];
      this.chainType = params['chainType']
        ? params['chainType'].split(',')
        : [];
      this.instanceType = params['adapterList']
        ? params['adapterList'].split(',')
        : [];
    });
  }

  /**
   * Initializes selected filter arrays from URL params
   */
  private initializeSelectedLists(): void {
    this.selectedAdapterType = [
      ...this.type,
      ...this.appType,
      ...this.pipelineType,
      ...this.toolsType,
      ...this.chainType,
    ];

    this.selectedAdapterList = [...this.instanceType];
    this.selectedAdapterInstance = [...this.instance];
  }

  /**
   * Initializes filters based on the service type
   */
  private initializeServiceBasedFilters(): void {
    this.isLoading = true;

    switch (this.servicev1) {   
      case ServiceType.PORTFOLIO:
      
        break;
      default:        
        this.fetchAdapters();
    }

    // Apply refresh if needed
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
    
    }  else {
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
      'project',
      sessionStorage.getItem('organization') || ''
    );

    this.selectedAdapterInstance = [];
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
    // Reset all selection arrays
    this.resetAllFilters();

    // Emit empty selections
    this.emitSelectionChanges();

   
    // Initialize service-specific filters
    this.initializeServiceSpecificFilters();
  }

  /**
   * Resets all filter arrays
   */
  private resetAllFilters(): void {
    this.tagStatus = {};
    this.selectedTagList = [];   
    this.portfolioDescription = [];
    this.portfolioName = [];

   
  }

  /**
   * Initializes service-specific filters
   */
  private initializeServiceSpecificFilters(): void {
    if (
      this.servicev1 === ServiceType.PORTFOLIO     
    ) {
      
    }

  }


  /**
   * Shows more tags for a category
   */
  showMore(category: string): void {
    this.catStatus[category] = !this.catStatus[category];

    this.tags[category] = this.catStatus[category]
      ? this.allTags.filter((tag) => tag.category === category)
      : this.allTags.filter((tag) => tag.category === category).slice(0, 10);
  }

  /**
   * Gets selected tags for a category
   */
  getSelectedTagsForCategory(category: string): any[] {
    return this.selectedTag.filter((tag) => tag.category === category);
  }

  /**
   * Clears all tags for a category
   */
  clearAllTagsForCategory(category: string): void {
    // Remove tags for this category
    this.selectedTag = this.selectedTag.filter(
      (tag) => tag.category !== category
    );

    // Update tag statuses
    this.allTags?.forEach((tag) => {
      if (tag.category === category) {
        this.tagStatus[`${tag.category} - ${tag.label}`] = false;
      }
    });

    // Update selected tag list
    this.selectedTagList = this.selectedTag.map((tag) => tag.id);

    // Emit changes
    this.emitSelectionChanges();
    this.updateFilterStatus();
  }

  /**
   * Removes a tag from selection
   */
  removeTag(tag: any): void {
    const index = this.selectedTag.indexOf(tag);

    if (index !== -1) {
      this.selectedTag.splice(index, 1);
      this.tagStatus[`${tag.category} - ${tag.label}`] = false;

      // Update selected tag list
      this.selectedTagList = this.selectedTag.map((tag) => tag.id);

      // Emit changes
      this.emitSelectionChanges();
    }

    this.updateFilterStatus();
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
   * Filters by tag
   */
  filterByTag(tag: any): void {
    const tagKey = `${tag.category} - ${tag.label}`;
    this.tagStatus[tagKey] = !this.tagStatus[tagKey];

    if (!this.selectedTag.includes(tag)) {
      this.selectedTag.push(tag);
    } else {
      this.selectedTag.splice(this.selectedTag.indexOf(tag), 1);
    }

    // Update selected tag list
    this.selectedTagList = this.selectedTag.map((tag) => tag.id);

    // Emit changes
    this.emitSelectionChanges();
  }

  /**
   * Creates a tag event DTO
   */  geteventtagsdto(): TagEventDTO {
    return new TagEventDTO(
      this.selectedTagList,
      this.selectedAdapterType,
      this.selectedAdapterInstance,
      this.selectedMlAppType ?? [],
      this.selectedMlIncType ?? [],
      this.portfolioName ?? [],
      this.portfolioDescription ?? [],
      this.categoryList ?? [],
      this.connectionList ?? [],
      this.specList ?? [],
      this.searchedName ? [this.searchedName] : [],
      this.filterUsmPortfolio ? [this.filterUsmPortfolio] : []
    );
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
  applyFilters(): void {
    // Set portfolio filters from input values
    this.portfolioName = this.searchedName ? [this.searchedName] : [];
    this.portfolioDescription = this.filterUsmPortfolio ? [this.filterUsmPortfolio] : [];
    
    console.log('AipFilterComponent: Applying filters', {
      portfolioName: this.portfolioName,
      portfolioDescription: this.portfolioDescription,
      selectedAdapterType: this.selectedAdapterType
    });
    
    // Emit the filter changes
    this.emitSelectionChanges();
    
    // Update filter status
    this.updateFilterStatus();
    this.isFilterExpanded=!this.isFilterExpanded;
  }

  /**
   * Checks if there are active filters
   */  
  hasActiveFilters(): boolean {
    if (this.servicev1 === ServiceType.PORTFOLIO) {
      return (
        this.selectedAdapterType?.length > 0 ||
        this.portfolioName?.length > 0 ||
        this.portfolioDescription?.length > 0 ||
        Boolean(this.searchedName) ||
        Boolean(this.filterUsmPortfolio)
      );
    }

    // Default case for other service types
    return (
      this.selectedAdapterType?.length > 0 ||
      this.selectedAdapterInstance?.length > 0 ||
      this.selectedTagList?.length > 0
    );
  } 

  /**
   * Gets a summary of active filters for display
   */
  getActiveFiltersSummary(): string {
    if (this.servicev1 === ServiceType.PORTFOLIO) {
      const filterSummary = [];
      
      // Add portfolio name filter if present
      if (this.searchedName || this.portfolioName?.length > 0) {
        filterSummary.push(`Name: ${this.searchedName || this.portfolioName[0]}`);
      }
      
      // Add portfolio description filter if present
      if (this.filterUsmPortfolio || this.portfolioDescription?.length > 0) {
        filterSummary.push(`Description: ${this.filterUsmPortfolio || this.portfolioDescription[0]}`);
      }
      
      // Add other filters if present
      if (this.selectedAdapterType?.length > 0) {
        filterSummary.push(`Type: ${this.selectedAdapterType.join(', ')}`);
      }
      
      return filterSummary.join(' | ');
    }
    
    // Default summary for other service types
    return this.selectedAdapterType?.length > 0 ? `Types: ${this.selectedAdapterType.join(', ')}` : '';
  }
  /**
   * Updates filter status
   */
  private updateFilterStatus(): void {
    const hasFilters = this.hasActiveFilters();
    console.log('AipFilterComponent: Emitting filter status change:', hasFilters);
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
}
