import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Services } from '../../services/service';
import { TagsService } from '../../services/tags.service';
import { HttpParams } from '@angular/common/http';
import { TagEventDTO } from '../../DTO/tagEventDTO.model';
import { AdapterServices } from '../services/adapter-service';
import { DatasetServices } from '../../dataset/dataset-service';
import { ActivatedRoute, Router } from '@angular/router';
import { SemanticService } from '../../services/semantic.services';
import { animate, style, transition, trigger } from '@angular/animations';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interface for filter items
interface FilterItem {
  category: string;
  label: string;
  value: string;
  selected: boolean;
}

// Enum for service types
enum ServiceType {
  PIPELINE = 'pipeline',
  CHAIN = 'chain',
  CONNECTIONS = 'connections',
  DATASETS = 'Datasets',
  ADAPTERS = 'adapters',
  APPS = 'apps',
  SPECS = 'specs',
  FEATURESTORE = 'featurestore',
  DG_APP = 'dgApp',
  INSTANCES = 'instances',
  WORKER_TOOLS = 'worker-tools',
  MODEL='model'
}

// Enum for filter types
enum FilterType {
  CATEGORY = 'category',
  SPEC = 'spec',
  CONNECTION = 'connection',
  INSTANCE_ADAPTER = 'instanceAdapter',
  INSTANCE_CONNECTION = 'instanceConnection',
  SPEC_TEMPLATE_CAPABILITY = 'specTemplateCapability',
  ADAPTER_TYPE = 'adapterType',
  ADAPTER_INSTANCE = 'adapterInstance',
  PIPELINE_TYPE = 'pipelineType',
  TOPIC = 'topic',
  TAG = 'tag',
  TOOLS_TYPE = 'toolsType',
  DATASET_TYPE = 'datasetType',
  DATASET_KNOWLEDGE = 'datasetKnowledge',
  DATASET_TAG = 'datasetTag',
  CONNECTION_TYPE = 'connectiontype',
  DATASOURCE='Datasource'
}

@Component({
  selector: 'app-aip-filter',
  templateUrl: './aip-filter.component.html',
  styleUrls: ['./aip-filter.component.scss'],
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
export class AipFilterComponent implements OnInit, OnChanges {
  // Input properties
  @Input() tagrefresh = false;
  @Input() servicev1 = '';
  @Input() preselectedtag: number[] = [];
  @Input() selectedAdpImplCombinedLists: any;
  @Input() selectedConnectionTypeList: any;
  @Input() selectedModelDataSourceList:any;
  @Input() selectedDatasetTypeList: any;
  @Input() selectedPipelineTypeList: any;
  @Input() selectedToolsTypeList: any;
  @Input() selectedChainTypeList: any;
  @Input() selectedModelTypeLists: any;
  @Input() selectedEndpointTypeLists: any;
  @Input() selectedAppTypeList: any;

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

  // Selected filters
  selectedTag: any[] = [];
  selectedTagList: any[] = [];
  selectedType: string[] = [];
  selectedAdapterType: string[] = [];
  selectedAdapterList: string[] = [];
  selectedAdapterInstance: string[] = [];
  selectedPipelineType: string[] = [];
  selectedToolsType: string[] = [];
  selectedconnectionType: string[] = [];
  selectedMlAdapterConnectionType: string[] = [];
  selectedMlAdapterCategoryType: string[] = [];
  selectedMlAdapterSpecType: string[] = [];
  selectedMlSpecTemplateCapabilityType: string[] = [];
  selectedMlInstancesConnectionType: string[] = [];
  selectedMlInstancesAdapterType: string[] = [];
  selectedDatasetTopicType: string[] = [];
  selectedAppType: string[] = [];
  selectedTagsType: any[] = [];
  selectedModelDatasource: string[] = [];

  // Filter lists
  adapterTypes: any[] = [];
  adapterTypeList: FilterItem[] = [];
  appTypeList: FilterItem[] = [];
  appTypes: any[] = [];
  adapterInstanceList: FilterItem[] = [];
  pipelinesTypeList: FilterItem[] = [];
  toolsTypeList: FilterItem[] = [];
  connectionsTypeList: FilterItem[] = [];
  datasetTopicList: FilterItem[] = [];
  datasetsTypes: string[] = [];
  pipelinesTypes: string[] = [];
  toolsTypes: string[] = [];
  connectionsTypes: string[] = [];
  datasetsTypeList: FilterItem[] = [];
  mlAdapterConnectionTypesList: FilterItem[] = [];
  mlAdapterCategoryTypeList: FilterItem[] = [];
  mlAdapterSpecTypeList: FilterItem[] = [];
  mlSpecTemplateCapabilityTypeList: FilterItem[] = [];
  mlInstanceAdapterTypeList: FilterItem[] = [];
  mlInstanceConnectionTypeList: FilterItem[] = [];

  // Raw data lists
  mlAdapterConnectionNamesList: string[] = [];
  mlAdapterCategoryList: string[] = [];
  mlAdapterSpecTemplateList: string[] = [];
  mlSpecTemplateCapabilityList: string[] = [];
  mlInstancesAdapterList: string[] = [];
  mlInstancesConnectionList: string[] = [];
  datasetsTags: any[] = [];
  datasetsTagsList: FilterItem[] = [];

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
  modelDataSourceList: FilterItem[] = [];

  constructor(
    private service: Services,
    private datasetServices: DatasetServices,
    public tagService: TagsService,
    private adapterServices: AdapterServices,
    private semanticService: SemanticService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadPreselectedFilters();
    this.loadQueryParams();
    this.initializeSelectedLists();
    this.initializeServiceBasedFilters();  
    this.initializeModelDatasourceList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tagrefresh?.currentValue) {
      this.handleTagRefreshChange();
    }
    
    // Handle changes to selectedModelDataSourceList
    if (changes.selectedModelDataSourceList?.currentValue) {
      this.initializeModelDatasourceList();
    }
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
    }

    if (this.selectedConnectionTypeList) {
      this.type = this.selectedConnectionTypeList.selectedAdapterType ?? [];
    }
    if (this.selectedDatasetTypeList) {
      this.type = this.selectedDatasetTypeList.selectedAdapterType ?? [];
    }
    if (this.selectedPipelineTypeList) {
      this.pipelineType =
        this.selectedPipelineTypeList.selectedAdapterType ?? [];
    }
    if (this.selectedToolsTypeList) {
      this.toolsType = this.selectedToolsTypeList.selectedAdapterType ?? [];
    }
    if (this.selectedChainTypeList) {
      this.chainType = this.selectedChainTypeList.selectedAdapterType ?? [];
    }
    if (this.selectedModelTypeLists) {
      this.type = this.selectedModelTypeLists.selectedAdapterType ?? [];
      this.instance = this.selectedModelTypeLists.selectedAdapterInstance ?? [];
    }
    if (this.selectedEndpointTypeLists) {
      this.type = this.selectedEndpointTypeLists.selectedType ?? [];
      this.instanceType =
        this.selectedEndpointTypeLists.selectedAdapterInstance ?? [];
    }
    if (this.selectedAppTypeList) {
      this.appType = this.selectedAppTypeList.selectedTagType ?? [];
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
      case ServiceType.PIPELINE:
      case ServiceType.CHAIN:
        this.getPipelinesTypes();
        this.getTags();
        break;
      case ServiceType.CONNECTIONS:
        this.getDatasourceTypes();
        break;
      case ServiceType.DATASETS:
        this.getDatasetsTypes();
        this.getTopicTypes();
        break;
      case ServiceType.ADAPTERS:
        this.getMlAdapterFilters();
        this.selectedMlAdapterConnectionType = [];
        this.selectedMlAdapterCategoryType = [];
        this.selectedMlAdapterSpecType = [];
        break;
      case ServiceType.APPS:
        this.fetchAppType();
        this.getTags();
        break;
      case ServiceType.SPECS:
        this.getMlSpecTemplateFilters();
        this.selectedMlSpecTemplateCapabilityType = [];
        break;
      case ServiceType.FEATURESTORE:
        this.fetchFSAdapters();
        this.fetchFSAdaptersTypes();
        break;
      case ServiceType.DG_APP:
        this.fetchDGAdapters();
        this.fetchDGAdaptersTypes();
        break;
      case ServiceType.INSTANCES:
        this.getMlInstancesFilters();
        this.selectedMlInstancesAdapterType = [];
        this.selectedMlInstancesConnectionType = [];
        break;
      case ServiceType.WORKER_TOOLS:
        this.getToolsTypes();
        break;
      case ServiceType.MODEL:
        this.getTags();
        this.initializeModelDatasourceList();
        break;
      default:
        this.getTags();
        this.fetchAdaptersTypes();
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
    if (this.servicev1 === ServiceType.FEATURESTORE) {
      this.fetchFSAdapters();
      this.fetchFSAdaptersTypes();
    } else if (this.servicev1 === ServiceType.DG_APP) {
      this.fetchDGAdapters();
      this.fetchDGAdaptersTypes();
      this.refresh();
    } else if (this.servicev1 === ServiceType.WORKER_TOOLS) {
      this.refresh();
    } else {
      this.refresh();
    }
  }

  /**
   * Gets tools types from API
   */
  getToolsTypes(): void {
    // Implementation to be added
  }

  /**
   * Gets topic types from the semantic service
   */
  getTopicTypes(): void {
    // this.semanticService
    //   .getAllTopics()
    //   .pipe(
    //     catchError((error) => {
    //       console.error('Error fetching topics:', error);
    //       return of([]);
    //     })
    //   )
    //   .subscribe((res: any[]) => {
    //     this.datasetTopicList = res.map((element) => ({
    //       category: 'Topic',
    //       label: element.topicname,
    //       value: element.topicname,
    //       selected: false,
    //     }));
    //   });
    this.datasetServices
      .getIndexNamesByOrg(sessionStorage.getItem('organization'))
      .pipe(
        catchError((error) => {
          console.error('Error fetching topics:', error);
          return of([]);
        })
      )
      .subscribe((res: any[]) => {
        this.datasetTopicList = res.map((element) => ({
          category: 'Topic',
          label: element.topicname,
          value: element.topicname,
          selected: false,
        }));
      });
  }

  /**
   * Fetches application types
   */
  fetchAppType(): void {
    this.adapterTypeList = [];
    this.adapterTypes = [];
    this.selectedAdapterType = [];

    // Get types from URL if available
    this.route.queryParams.subscribe((params) => {
      if (params['type']) {
        this.selectedAdapterType = params['type'].split(',');
      }
    });

    this.service.getAppTypes().subscribe((res) => {
      this.adapterTypes = res.body;

      this.adapterTypeList = this.adapterTypes
        .filter((element) => element) // Filter out null/undefined
        .map((element) => {
          const isSelected = this.appType.includes(element);
          return {
            category: 'Type',
            label: element,
            value: element,
            selected: isSelected,
          };
        });
    });
  }

  /**
   * Gets ML instance filters from adapter service
   */
  getMlInstancesFilters(): void {
    this.adapterServices.getInstancesFilters().subscribe((res: any) => {
      this.mlInstancesAdapterList = res.adapters;
      this.mlInstancesConnectionList = res.connections;
      this.mlInstanceConnectionTypeList = [];
      this.mlInstanceAdapterTypeList = [];
      this.selectedMlInstancesAdapterType = [];

      // Process connection list
      this.mlInstancesConnectionList.forEach((element) => {
        const isPreselected =
          !this.tagrefresh &&
          this.instanceConnectionList &&
          this.instanceConnectionList.length > 0 &&
          this.instanceConnectionList.includes(element);

        if (
          !this.mlInstanceConnectionTypeList.some(
            (item) => item.value === element
          )
        ) {
          this.mlInstanceConnectionTypeList.push({
            category: 'Connections',
            label: element,
            value: element,
            selected: isPreselected,
          });

          if (
            isPreselected &&
            !this.selectedMlInstancesConnectionType.includes(element)
          ) {
            this.selectedMlInstancesConnectionType.push(element);
          }
        }
      });

      // Process adapter list
      this.mlInstancesAdapterList.forEach((element) => {
        const isPreselected =
          !this.tagrefresh &&
          this.instanceImplementationList &&
          this.instanceImplementationList.length > 0 &&
          this.instanceImplementationList.includes(element);

        if (
          !this.mlInstanceAdapterTypeList.some((item) => item.value === element)
        ) {
          this.mlInstanceAdapterTypeList.push({
            category: 'Adapter',
            label: element,
            value: element,
            selected: isPreselected,
          });

          if (
            isPreselected &&
            !this.selectedMlInstancesAdapterType.includes(element)
          ) {
            this.selectedMlInstancesAdapterType.push(element);
          }
        }
      });
    });
  }

  /**
   * Gets pipeline types based on service type
   */
  getPipelinesTypes(): void {
    this.pipelinesTypeList = [];
    this.pipelinesTypes = [];
    this.selectedPipelineType = [];

    // Add pipeline types to selected types
    this.pipelineType.forEach((type) => {
      if (!this.selectedAdapterType.includes(type)) {
        this.selectedAdapterType.push(type);
      }
    });

    this.service.getPipelinesTypeByOrganization().subscribe((res) => {
      this.pipelinesTypes = JSON.parse(res);

      const excludedTypes =
        this.servicev1 === ServiceType.CHAIN ? ['App'] : ['App', 'Langchain'];

      this.pipelinesTypeList = this.pipelinesTypes
        .filter((element) => element && !excludedTypes.includes(element))
        .map((element) => {
          const typesList =
            this.servicev1 === ServiceType.CHAIN
              ? this.chainType
              : this.pipelineType;
          const isSelected = typesList.includes(element);

          return {
            category: 'Type',
            label: element,
            value: element,
            selected: isSelected,
          };
        });
    });
  }

  /**
   * Gets datasource types
   */
  getDatasourceTypes(): void {
    this.connectionsTypeList = [];
    this.connectionsTypes = [];
    this.selectedAdapterType = [];
    this.selectedconnectionType = [];

    this.service.getDatasourcesTypeByOrganization().subscribe((res) => {
      this.connectionsTypes = JSON.parse(res);

      this.connectionsTypes.forEach((element) => {
        const isPreselected =
          !this.tagrefresh &&
          this.type &&
          this.type.length > 0 &&
          this.type.includes(element);

        if (!this.connectionsTypeList.some((item) => item.value === element)) {
          this.connectionsTypeList.push({
            category: 'Type',
            label: element,
            value: element,
            selected: isPreselected,
          });

          if (isPreselected && !this.selectedAdapterType.includes(element)) {
            this.selectedAdapterType.push(element);
          }
        }
      });
    });
  }

  /**
   * Gets dataset types and tags
   */
  getDatasetsTypes(): void {
    this.datasetsTypeList = [];
    this.datasetsTypes = [];
    this.selectedconnectionType = [];
    this.datasetsTagsList = [];
    this.datasetsTags = [];
    this.selectedTagsType = [];

    // Get dataset types
    this.datasetServices.getDatasetsType().subscribe((res) => {
      const data = JSON.parse(res);
      this.datasetsTypes = data.map((element) => element.type);

      this.datasetsTypeList = this.datasetsTypes.map((element) => {
        const isSelected = this.type.includes(element);
        return {
          category: 'Type',
          label: element,
          value: element,
          selected: isSelected,
        };
      });
    });

    // Get dataset tags
    this.service.getDatasetCards('', '', '', false).subscribe((datasetList) => {
      // Extract tags from datasets
      this.datasetsTags = datasetList
        .filter((element) => element.tags)
        .map((element) => JSON.parse(element.tags));

      // Create unique tags list
      const uniqueTags = new Set<string>();
      this.datasetsTags.forEach((tagArray) => {
        if (tagArray && tagArray.length > 0) {
          tagArray.forEach((tag) => uniqueTags.add(tag));
        }
      });

      // Convert to filter items
      this.datasetsTagsList = Array.from(uniqueTags).map((tag) => ({
        category: 'Tags',
        label: tag,
        value: tag,
        selected: false,
      }));
    });
  }

  /**
   * Gets ML adapter filters
   */
  getMlAdapterFilters(): void {
    this.adapterServices.getAdapterFilters().subscribe((res) => {
      this.mlAdapterConnectionNamesList = res.connections;
      this.mlAdapterSpecTemplateList = res.specTemplates;
      this.mlAdapterCategoryList = res.categories;

      this.mlAdapterConnectionTypesList = [];
      this.mlAdapterCategoryTypeList = [];
      this.mlAdapterSpecTypeList = [];

      // Process connections
      this.processFilterList(
        this.mlAdapterConnectionNamesList,
        'Connections',
        this.connectionList,
        this.mlAdapterConnectionTypesList,
        this.selectedMlAdapterConnectionType
      );

      // Process categories
      this.processFilterList(
        this.mlAdapterCategoryList,
        'Category',
        this.categoryList,
        this.mlAdapterCategoryTypeList,
        this.selectedMlAdapterCategoryType
      );

      // Process specs
      this.processFilterList(
        this.mlAdapterSpecTemplateList,
        'Spec',
        this.specList,
        this.mlAdapterSpecTypeList,
        this.selectedMlAdapterSpecType
      );
    });
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
   * Gets ML spec template filters
   */
  getMlSpecTemplateFilters(): void {
    this.adapterServices.getSpecTemplateFilters().subscribe((res) => {
      this.mlSpecTemplateCapabilityList = res.capability;
      this.mlSpecTemplateCapabilityTypeList = [];

      this.processFilterList(
        this.mlSpecTemplateCapabilityList,
        'Capability',
        this.specCapabilityList,
        this.mlSpecTemplateCapabilityTypeList,
        this.selectedMlSpecTemplateCapabilityType
      );
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

    this.adapterInstanceList = [];
    this.selectedAdapterInstance = [];
    this.service.getModelListAdapters(params).subscribe((res) => {
      const adapters = res.body;
      adapters.forEach((element) => {
        const isSelected = this.instance.includes(element.name);

        if (
          !this.adapterInstanceList.some((obj) => obj.value === element.name)
        ) {
          this.adapterInstanceList.push({
            category: 'Instance',
            label: element.alias,
            value: element.name,
            selected: isSelected,
          });
        }
      });
    });

    return true;
  }

  /**
   * Fetches feature store adapters
   */
  fetchFSAdapters(): boolean {
    const params = new HttpParams()
      .set('project', sessionStorage.getItem('organization') || '')
      .set(
        'adapterType',
        this.selectedAdapterType.length >= 1
          ? this.selectedAdapterType.toString()
          : ''
      );

    this.adapterInstanceList = [];
    this.selectedAdapterInstance = [];

    this.service.getFeastAdapters(params).subscribe((res) => {
      const adapters = res.body;

      this.adapterInstanceList = adapters.map((element) => ({
        category: 'Instance',
        label: element.alias,
        value: element.name,
        selected: false,
      }));
    });

    return true;
  }

  /**
   * Fetches data governance adapters
   */
  fetchDGAdapters(): boolean {
    const params = new HttpParams()
      .set('project', sessionStorage.getItem('organization') || '')
      .set(
        'adapterType',
        this.selectedAdapterType.length >= 1
          ? this.selectedAdapterType.toString()
          : ''
      );

    this.adapterInstanceList = [];
    this.selectedAdapterInstance = [];

    this.service.getDGAdapters(params).subscribe((res) => {
      const adapters = res.body;

      this.adapterInstanceList = adapters.map((element) => ({
        category: 'Instance',
        label: element.alias,
        value: element.name,
        selected: false,
      }));
    });

    return true;
  }

  /**
   * Fetches feature store adapter types
   */
  fetchFSAdaptersTypes(): void {
    this.adapterTypeList = [];
    this.adapterTypes = [];
    this.selectedAdapterType = [];

    this.service.getFeastAdaptersTypes().subscribe((res) => {
      this.adapterTypes = res.body;

      this.adapterTypeList = this.adapterTypes.map((element) => ({
        category: 'Type',
        label: element.name,
        value: element.name,
        selected: false,
      }));
    });
  }

  /**
   * Handles selection of app type filter
   */
  appTypeSelected(value: FilterItem): void {
    this.toggleFilterSelection(value.value, this.selectedAdapterType);

    this.adapterTypeList.forEach((element) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });

    this.emitSelectionChanges();
  }

  /**
   * Fetches data governance adapter types
   */
  fetchDGAdaptersTypes(): void {
    this.adapterTypeList = [];
    this.adapterTypes = [];
    this.selectedAdapterType = [];

    this.service.getDGAdaptersTypes().subscribe((res) => {
      this.adapterTypes = res.body;

      this.adapterTypeList = this.adapterTypes.map((element) => ({
        category: 'Type',
        label: element.name,
        value: element.name,
        selected: false,
      }));
    });
  }

  /**
   * Fetches adapter types
   */
  fetchAdaptersTypes(): void {
    this.adapterTypeList = [];
    this.adapterTypes = [];
    this.selectedAdapterType = [];

    // Add types to selected adapter types
    this.type.forEach((type) => {
      if (!this.selectedAdapterType.includes(type)) {
        this.selectedAdapterType.push(type);
      }
    });

    const params = new HttpParams()
      .set('project', sessionStorage.getItem('organization') || '')
      .set(
        'adapterType',
        this.selectedType.length >= 1 ? this.selectedType.toString() : ''
      );

    this.service.getModelListAdaptersTypes().subscribe((res) => {
      this.adapterTypes = res.body;
      // Create adapter type list
      this.adapterTypeList = this.adapterTypes.map((element) => {
        const isSelected = this.type.includes(element.name);
        return {
          category: 'Type',
          label: element.name,
          value: element.name,
          selected: isSelected,
        };
      });

      // Add LOCAL type if applicable
      const isModelOrEndpoint =
        this.router.url.includes('model') ||
        this.router.url.includes('endpoints');
      const isLocal = this.type.length > 0 && isModelOrEndpoint;

      this.adapterTypeList.push({
        category: 'Type',
        label: 'LOCAL',
        value: 'LOCAL',
        selected: isLocal,
      });
    });
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
   * Handles adapter type selection
   */
  adapterTypeSelected(value: FilterItem): void {
    this.toggleFilterSelection(value.value, this.selectedAdapterType);

    this.adapterTypeList.forEach((element) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });

    // Refresh adapters list based on service type
    if (this.servicev1 === ServiceType.FEATURESTORE) {
      this.fetchFSAdapters();
    } else if (this.servicev1 === ServiceType.DG_APP) {
      this.fetchDGAdapters();
    } else {
      this.fetchAdapters();
    }

    this.emitSelectionChanges();
    this.toggleFilterExpanded();
  }

  /**
   * Removes an adapter type from selection
   */
  removeAdapterType(type: string): void {
    this.removeFromSelection(
      type,
      this.selectedAdapterType,
      this.adapterTypeList,
      true
    );
  }

  /**
   * Generic method to remove an item from a selection
   */
  private removeFromSelection(
    value: string,
    selectedArray: string[],
    filterList: FilterItem[],
    updateStatus = false
  ): void {
    const index = selectedArray.indexOf(value);

    if (index !== -1) {
      selectedArray.splice(index, 1);

      // Update UI selection state
      filterList.forEach((element) => {
        if (element.value === value) {
          element.selected = false;
        }
      });

      // Emit updated selection
      this.emitSelectionChanges();
    }

    if (updateStatus) {
      this.updateFilterStatus();
    }
  }

  /**
   * Emits selection changes to parent component
   */
  private emitSelectionChanges(): void {
    this.tagSelected.emit(this.geteventtagsdto());
  }

  /**
   * Handles pipeline type selection
   */
  pipelineTypeSelected(value: FilterItem): void {
    this.toggleFilterSelection(value.value, this.selectedAdapterType);

    this.pipelinesTypeList?.forEach((element) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });

    this.emitSelectionChanges();
    this.toggleFilterExpanded();
  }

  /**
   * Removes a pipeline type from selection
   */
  removePipelineType(type: string): void {
    this.removeFromSelection(
      type,
      this.selectedAdapterType,
      this.pipelinesTypeList || [],
      true
    );
  }

  /**
   * Handles tools type selection
   */
  toolsTypeSelected(value: FilterItem): void {
    this.toggleFilterSelection(value.value, this.selectedAdapterType);

    this.toolsTypeList.forEach((element) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });

    this.emitSelectionChanges();
  }

  /**
   * Handles connection type selection
   */
  connectionTypeSelected(value: FilterItem): void {
    this.toggleFilterSelection(value.value, this.selectedAdapterType);

    this.connectionsTypeList.forEach((element) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });

    this.emitSelectionChanges();
    this.toggleFilterExpanded();
  }

  /**
   * Handles dataset type selection
   */
  datasetTypeSelected(value, category: string): void {
    if (category === 'datasetType') {
      if (!this.selectedAdapterType.includes(value.value)) {
        this.selectedAdapterType.push(value.value);
      } else {
        this.selectedAdapterType.splice(
          this.selectedAdapterType.indexOf(value.value),
          1
        );
      }
      this.datasetsTypeList.forEach((element: any) => {
        if (element.value === value.value) {
          element.selected = !element.selected;
        }
      });
    } else if (category === 'datasetTag') {
      if (!this.selectedTagList.includes(value.value)) {
        this.selectedTagList.push(value.value);
      } else {
        this.selectedTagList.splice(
          this.selectedTagList.indexOf(value.value),
          1
        );
      }
      this.datasetsTagsList.forEach((element: any) => {
        if (element.value === value.value) {
          element.selected = !element.selected;
        }
      });
    }
    this.emitSelectionChanges();
    this.toggleFilterExpanded();
  }
  removeConnectionType(connection: string): void {
    const index = this.selectedAdapterType.indexOf(connection);
    if (index !== -1) {
      this.selectedAdapterType.splice(index, 1);

      // Update the UI selection state
      this.connectionsTypeList.forEach((element) => {
        if (element.value === connection) {
          element.selected = false;
        }
      });

      // Emit the updated selection
      this.tagSelected.emit(this.geteventtagsdto());
    }
    this.updateFilterStatus();
  }

  removeDatasetType(connection: string): void {
    const index = this.selectedAdapterType.indexOf(connection);
    if (index !== -1) {
      this.selectedAdapterType.splice(index, 1);

      // Update the UI selection state
      this.datasetsTypeList.forEach((element) => {
        if (element.value === connection) {
          element.selected = false;
        }
      });

      // Emit the updated selection
      this.tagSelected.emit(this.geteventtagsdto());
    }
    this.updateFilterStatus();
  }
  removeDatasetKnowledge(connection: string): void {
    const index = this.selectedDatasetTopicType.indexOf(connection);
    if (index !== -1) {
      this.selectedDatasetTopicType.splice(index, 1);

      // Update the UI selection state
      this.datasetTopicList.forEach((element) => {
        if (element.value === connection) {
          element.selected = false;
        }
      });

      // Emit the updated selection
      this.tagSelected.emit(this.geteventtagsdto());
    }
    this.updateFilterStatus();
  }
  removeDatasetTag(connection: string): void {
    const index = this.selectedTagList.indexOf(connection);
    if (index !== -1) {
      this.selectedTagList.splice(index, 1);

      // Update the UI selection state
      this.datasetsTagsList.forEach((element) => {
        if (element.value === connection) {
          element.selected = false;
        }
      });

      // Emit the updated selection
      this.tagSelected.emit(this.geteventtagsdto());
    }
    this.updateFilterStatus();
  }

  /**
   * Handles dataset topic selection
   */
  datasetTopicSelected(value: FilterItem): void {
    this.toggleFilterSelection(value.value, this.selectedDatasetTopicType);

    this.datasetTopicList.forEach((element) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });

    this.emitSelectionChanges();
    this.toggleFilterExpanded();
  }

  /**
   * Handles ML adapter connection type selection
   */
  mlAdapterConnectionTypeSelected(value: FilterItem): void {
    this.toggleFilterSelection(
      value.value,
      this.selectedMlAdapterConnectionType
    );

    this.mlAdapterConnectionTypesList.forEach((element) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });

    this.emitSelectionChanges();
    this.updateFilterStatus();
    this.toggleFilterExpanded();
  }

  /**
   * Removes a connection from selection
   */
  removeConnection(connection: string): void {
    this.removeFromSelection(
      connection,
      this.selectedMlAdapterConnectionType,
      this.mlAdapterConnectionTypesList,
      true
    );
  }

  /**
   * Handles ML adapter category selection
   */
  mlAdapterCategoryTypeSelected(value: FilterItem): void {
    this.toggleFilterSelection(value.value, this.selectedMlAdapterCategoryType);

    this.mlAdapterCategoryTypeList.forEach((element) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });

    this.emitSelectionChanges();
    this.updateFilterStatus();
    this.toggleFilterExpanded();
  }

  /**
   * Removes a category from selection
   */
  removeCategory(category: string): void {
    this.removeFromSelection(
      category,
      this.selectedMlAdapterCategoryType,
      this.mlAdapterCategoryTypeList,
      true
    );
  }

  /**
   * Handles ML adapter spec selection
   */
  mlAdapterScecTypeSelected(value: FilterItem): void {
    this.toggleFilterSelection(value.value, this.selectedMlAdapterSpecType);

    this.mlAdapterSpecTypeList.forEach((element) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });

    this.emitSelectionChanges();
    this.updateFilterStatus();
    this.toggleFilterExpanded();
  }

  /**
   * Removes a spec from selection
   */
  removeSpec(spec: string): void {
    this.removeFromSelection(
      spec,
      this.selectedMlAdapterSpecType,
      this.mlAdapterSpecTypeList,
      true
    );
  }

  /**
   * Handles ML spec template capability selection
   */
  mlSpecTemplateCapabilityTypeSelected(value: FilterItem): void {
    this.toggleFilterSelection(
      value.value,
      this.selectedMlSpecTemplateCapabilityType
    );

    this.mlSpecTemplateCapabilityTypeList.forEach((element) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });

    this.emitSelectionChanges();
    this.updateFilterStatus();
    this.toggleFilterExpanded();
  }

  /**
   * Removes a spec template capability from selection
   */
  removeSpecTemplateCapability(capability: string): void {
    this.removeFromSelection(
      capability,
      this.selectedMlSpecTemplateCapabilityType,
      this.mlSpecTemplateCapabilityTypeList,
      true
    );
  }

  /**
   * Handles ML instance connection selection
   */
  mlInstanceConnectionTypeSelected(value: FilterItem): void {
    this.toggleFilterSelection(
      value.value,
      this.selectedMlInstancesConnectionType
    );

    this.mlInstanceConnectionTypeList.forEach((element) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });

    this.emitSelectionChanges();
    this.updateFilterStatus();
    this.toggleFilterExpanded();
  }

  /**
   * Removes an instance connection from selection
   */
  removeInstanceConnection(connection: string): void {
    this.removeFromSelection(
      connection,
      this.selectedMlInstancesConnectionType,
      this.mlInstanceConnectionTypeList,
      true
    );
  }

  /**
   * Handles ML instance adapter selection
   */
  mlInstanceAdapterTypeSelected(value: FilterItem): void {
    this.toggleFilterSelection(
      value.value,
      this.selectedMlInstancesAdapterType
    );

    this.mlInstanceAdapterTypeList.forEach((element) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });

    this.emitSelectionChanges();
    this.updateFilterStatus();
    this.toggleFilterExpanded();
  }

  /**
   * Removes an instance adapter from selection
   */
  removeInstanceAdapter(instanceAdapter: string): void {
    this.removeFromSelection(
      instanceAdapter,
      this.selectedMlInstancesAdapterType,
      this.mlInstanceAdapterTypeList,
      true
    );
  }

  /**
   * Handles adapter instance selection
   */
  adapterInstanceSelected(value: FilterItem): void {
    this.toggleFilterSelection(value.value, this.selectedAdapterInstance);

    this.adapterInstanceList.forEach((element) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });

    this.emitSelectionChanges();
    // this.toggleFilterExpanded();
  }

  /**
   * Removes an adapter instance from selection
   */
  removeAdapterInstance(adapterInstance: string): void {
    this.removeFromSelection(
      adapterInstance,
      this.selectedAdapterInstance,
      this.adapterInstanceList,
      true
    );
  }

  /**
   * Refreshes all filters
   */
  refresh(): void {
    // Reset all selection arrays
    this.resetAllFilters();

    // Emit empty selections
    this.emitSelectionChanges();

    // Reload data based on service type
    if (this.servicev1 !== ServiceType.DG_APP) {
      this.getTags();
      this.fetchAdaptersTypes();
      this.fetchAdapters();
    }

    // Initialize service-specific filters
    this.initializeServiceSpecificFilters();
  }

  /**
   * Initializes model datasource list from input
   */
  private initializeModelDatasourceList(): void {
    if (this.selectedModelDataSourceList?.dataSourceList && Array.isArray(this.selectedModelDataSourceList.dataSourceList)) {
      this.modelDataSourceList = this.selectedModelDataSourceList.dataSourceList.map(item => ({
        category: item.category || 'Datasource',
        label: item.label,
        value: item.value,
        selected: item.selected || false
      }));
      
      // Initialize selected datasources from the list
      this.selectedModelDatasource = this.modelDataSourceList
        .filter(item => item.selected)
        .map(item => item.value);
        
      console.log('Model datasource list initialized:', this.modelDataSourceList);
    }
  }

  /**
   * Resets all filter arrays
   */
  private resetAllFilters(): void {
    this.tagStatus = {};
    this.selectedTagList = [];
    this.selectedAdapterType = [];
    this.datasetTopicList = [];
    this.selectedDatasetTopicType = [];
    this.selectedAdapterInstance = [];

    this.catStatus = {};
    this.selectedTag = [];
    this.selectedType = [];
    this.adapterTypes = [];
    this.adapterTypeList = [];
    this.adapterInstanceList = [];
    this.type = [];
    this.instance = [];
    this.pipelineType = [];
    this.toolsType = [];

    // Reset adapter implementation filters
    this.selectedMlAdapterCategoryType = [];
    this.selectedMlAdapterConnectionType = [];
    this.selectedMlAdapterSpecType = [];
    this.categoryList = [];
    this.connectionList = [];
    this.specList = [];
    this.mlAdapterConnectionTypesList = [];
    this.mlAdapterCategoryTypeList = [];
    this.mlAdapterSpecTypeList = [];

    // Reset spec filters
    this.selectedMlSpecTemplateCapabilityType = [];
    this.mlSpecTemplateCapabilityTypeList = [];
    this.specCapabilityList = [];

    // Reset instance filters
    this.instanceConnectionList = [];
    this.instanceImplementationList = [];
    this.selectedMlInstancesAdapterType = [];
    this.selectedMlInstancesConnectionType = [];

    // Reset model datasource filters
    this.selectedModelDatasource = [];
    this.modelDataSourceList.forEach(item => item.selected = false);
  }

  /**
   * Initializes service-specific filters
   */
  private initializeServiceSpecificFilters(): void {
    if (
      this.servicev1 === ServiceType.PIPELINE ||
      this.servicev1 === ServiceType.CHAIN
    ) {
      this.getPipelinesTypes();
    }

    if (this.servicev1 === ServiceType.WORKER_TOOLS) {
      this.getToolsTypes();
    }

    if (this.servicev1 === ServiceType.CONNECTIONS) {
      this.getDatasourceTypes();
    }

    if (this.servicev1 === ServiceType.INSTANCES) {
      this.getMlInstancesFilters();
    }

    if (this.servicev1 === ServiceType.DATASETS) {
      this.getTopicTypes();
      this.getDatasetsTypes();
    }

    if (this.servicev1 === ServiceType.ADAPTERS) {
      this.getMlAdapterFilters();
    }

    if (this.servicev1 === ServiceType.SPECS) {
      this.getMlSpecTemplateFilters();
    }
  }

  /**
   * Gets tags from API
   */
  getTags(): void {
    this.tags = {};
    this.tagsBackup = {};

    const servicename =
      this.servicev1 === ServiceType.CHAIN
        ? ServiceType.PIPELINE
        : this.servicev1;

    const param = new HttpParams()
      .set('project', sessionStorage.getItem('organization') || '')
      .set('service', servicename);

    this.service.getMlTagswithparams(param).subscribe((resp) => {
      this.allTags = resp;

      // Process tags
      this.allTags.forEach((tag) => {
        if (!this.category.includes(tag.category)) {
          this.category.push(tag.category);
        }

        const tagKey = `${tag.category} - ${tag.label}`;
        const isPreselected =
          this.preselectedtag?.length > 0 &&
          this.preselectedtag.some((ele) => ele == tag.id);

        this.tagStatus[tagKey] = isPreselected;

        if (isPreselected) {
          this.selectedTag.push(tag);
        }
      });

      // Group tags by category
      this.category.forEach((cat) => {
        const categoryTags = this.allTags.filter((tag) => tag.category === cat);
        this.tags[cat] = categoryTags.slice(0, 10);
        this.tagsBackup[cat] = categoryTags;
        this.catStatus[cat] = false;
      });
    });
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
   * Clears all filters of a specific type
   */
  clearAllFilters(filterType: FilterType): void {
    switch (filterType) {
      case FilterType.CATEGORY:
        this.clearFilterList(
          this.selectedMlAdapterCategoryType,
          this.mlAdapterCategoryTypeList
        );
        break;
      case FilterType.SPEC:
        this.clearFilterList(
          this.selectedMlAdapterSpecType,
          this.mlAdapterSpecTypeList
        );
        break;
      case FilterType.CONNECTION:
        this.clearFilterList(
          this.selectedMlAdapterConnectionType,
          this.mlAdapterConnectionTypesList
        );
        break;
      case FilterType.INSTANCE_ADAPTER:
        this.clearFilterList(
          this.selectedMlInstancesAdapterType,
          this.mlInstanceAdapterTypeList
        );
        break;
      case FilterType.INSTANCE_CONNECTION:
        this.clearFilterList(
          this.selectedMlInstancesConnectionType,
          this.mlInstanceConnectionTypeList
        );
        break;
      case FilterType.SPEC_TEMPLATE_CAPABILITY:
        this.clearFilterList(
          this.selectedMlSpecTemplateCapabilityType,
          this.mlSpecTemplateCapabilityTypeList
        );
        break;
      case FilterType.ADAPTER_TYPE:
        this.clearFilterList(this.selectedAdapterType, this.adapterTypeList);
        break;
      case FilterType.ADAPTER_INSTANCE:
        this.clearFilterList(
          this.selectedAdapterInstance,
          this.adapterInstanceList
        );
        break;
      case FilterType.PIPELINE_TYPE:
        this.clearFilterList(
          this.selectedAdapterType,
          this.pipelinesTypeList || []
        );
        break;
      case FilterType.CONNECTION_TYPE:
        this.clearFilterList(
          this.selectedAdapterType,
          this.connectionsTypeList || []
        );
        break;
      case FilterType.DATASET_TYPE:
        this.clearFilterList(
          this.selectedAdapterType,
          this.datasetsTypeList || []
        );
        break;
      case FilterType.DATASET_KNOWLEDGE:
        this.clearFilterList(
          this.selectedDatasetTopicType,
          this.datasetTopicList || []
        );
        break;
      case FilterType.DATASET_TAG:
        this.clearFilterList(this.selectedTagList, this.datasetsTagsList || []);
    }

    // Emit changes
    this.emitSelectionChanges();
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
   */
  geteventtagsdto(): TagEventDTO {
    return new TagEventDTO(
      this.selectedTagList,
      this.selectedAdapterType,
      this.selectedAdapterInstance,
      this.selectedMlAdapterConnectionType,
      this.selectedMlAdapterCategoryType,
      this.selectedMlAdapterSpecType,
      this.selectedMlSpecTemplateCapabilityType,
      this.selectedMlInstancesAdapterType,
      this.selectedMlInstancesConnectionType,
      this.selectedDatasetTopicType,
      this.selectedModelDatasource
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
   * Checks if there are active filters
   */
  hasActiveFilters(): boolean {
    if (this.servicev1 === ServiceType.MODEL) {
      return (
        this.selectedModelDatasource?.length > 0 ||
        this.selectedTagList?.length > 0 ||
        this.selectedAdapterInstance?.length > 0
      );
    }

    // Add conditions for other service types
    if (this.servicev1 === ServiceType.ADAPTERS) {
      return (
        this.selectedMlAdapterCategoryType?.length > 0 ||
        this.selectedMlAdapterSpecType?.length > 0 ||
        this.selectedMlAdapterConnectionType?.length > 0
      );
    }

    if (this.servicev1 === ServiceType.INSTANCES) {
      return (
        this.selectedMlInstancesAdapterType?.length > 0 ||
        this.selectedMlInstancesConnectionType?.length > 0
      );
    }

    if (this.servicev1 === ServiceType.SPECS) {
      return this.selectedMlSpecTemplateCapabilityType?.length > 0;
    }

    // Default case for other service types
    return (
      this.selectedAdapterType?.length > 0 ||
      this.selectedAdapterInstance?.length > 0 ||
      this.selectedTagList?.length > 0 ||
      this.selectedDatasetTopicType?.length > 0 ||
      this.selectedModelDatasource?.length > 0
    );
  }

  /**
   * Gets active filters summary
   */
  getActiveFiltersSummary(): string {
    const activeFilters: string[] = [];

    switch (this.servicev1) {
      case ServiceType.ADAPTERS:
        if (this.selectedMlAdapterCategoryType?.length > 0) {
          activeFilters.push('Category');
        }
        if (this.selectedMlAdapterSpecType?.length > 0) {
          activeFilters.push('Spec');
        }
        if (this.selectedMlAdapterConnectionType?.length > 0) {
          activeFilters.push('Connection');
        }
        break;
      case ServiceType.CONNECTIONS:
        if (this.selectedAdapterType?.length > 0) {
          activeFilters.push('Type');
        }
        if (this.selectedAdapterInstance?.length > 0) {
          activeFilters.push('Instance');
        }
        break;
      case ServiceType.PIPELINE:
      case ServiceType.CHAIN:
        if (this.selectedAdapterType?.length > 0) {
          activeFilters.push('Type');
        }
        if (this.selectedAdapterInstance?.length > 0) {
          activeFilters.push('Instance');
        }
        break;
      case ServiceType.APPS:
        if (this.selectedAdapterType?.length > 0) {
          activeFilters.push('Type');
        }
        if (this.selectedAdapterInstance?.length > 0) {
          activeFilters.push('Instance');
        }
        break;
      case ServiceType.MODEL:
        if (this.selectedModelDatasource?.length > 0) {
          activeFilters.push('Datasource');
        }
        if (this.selectedTagList?.length > 0) {
          activeFilters.push('Tag');
        }
        if (this.selectedAdapterInstance?.length > 0) {
          activeFilters.push('Instance');
        }
        break;
      case ServiceType.DATASETS:
        if (this.selectedAdapterType?.length > 0) {
          activeFilters.push('Type');
        }
        if (this.selectedTagList?.length > 0) {
          activeFilters.push('Tag');
        }
        if (this.selectedDatasetTopicType?.length > 0) {
          activeFilters.push('Topic');
        }
        break;
      case ServiceType.SPECS:
        if (this.selectedMlSpecTemplateCapabilityType?.length > 0) {
          activeFilters.push('Capability');
        }
        break;
      case ServiceType.INSTANCES:
        if (this.selectedMlInstancesAdapterType?.length > 0) {
          activeFilters.push('Adapter');
        }
        if (this.selectedMlInstancesConnectionType?.length > 0) {
          activeFilters.push('Connection');
        }
        break;
      case ServiceType.WORKER_TOOLS:
        if (this.selectedAdapterType?.length > 0) {
          activeFilters.push('Type');
        }
        break;
      default:
        if (this.selectedAdapterType?.length > 0) {
          activeFilters.push('Type');
        }
        if (this.selectedAdapterInstance?.length > 0) {
          activeFilters.push('Instance');
        }
        if (this.selectedTagList?.length > 0) {
          activeFilters.push('Tag');
        }
        if (this.selectedDatasetTopicType?.length > 0) {
          activeFilters.push('Topic');
        }
        if (this.selectedModelDatasource?.length > 0) {
          activeFilters.push('Datasource');
        }
        break;
    }

    return activeFilters.length > 0 ? activeFilters.join(' | ') : '';
  }

  /**
   * Updates filter status
   */
  private updateFilterStatus(): void {
    this.filterStatusChange.emit(this.hasActiveFilters());
  }
  removeAppFilter(app: string): void {
    const index = this.selectedMlAppType.indexOf(app);
    if (index !== -1) {
      this.selectedMlAppType.splice(index, 1);

      // Update the UI selection state
      this.adapterTypeList.forEach((element) => {
        if (element.value === app) {
          element.selected = false;
        }
      });

      // Emit the updated selection
      this.tagSelected.emit(this.geteventtagsdto());
    }
    this.updateFilterStatus();
  }

  removeAppIncFilter(inc: string): void {
    const index = this.selectedMlIncType.indexOf(inc);
    if (index !== -1) {
      this.selectedMlIncType.splice(index, 1);

      // Update the UI selection state
      this.adapterInstanceList.forEach((element) => {
        if (element.value === inc) {
          element.selected = false;
        }
      });

      // Emit the updated selection
      this.tagSelected.emit(this.geteventtagsdto());
    }
    this.updateFilterStatus();
  }

  removeAppTypeFilter(type: string): void {
    const index = this.selectedAdapterType.indexOf(type);
    if (index !== -1) {
      this.selectedAdapterType.splice(index, 1);

      // Update the UI selection state
      this.adapterTypeList.forEach((element) => {
        if (element.value === type) {
          element.selected = false;
        }
      });

      // Emit the updated selection
      this.tagSelected.emit(this.geteventtagsdto());
    }
    this.updateFilterStatus();
  }


   /**
   * Handles selection of model datasource filter
   */
  modelDatasourceSelected(value: any): void {
    console.log('Model datasource selected:', value);
    // Toggle the selected state for the clicked datasource
    this.modelDataSourceList.forEach((element) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });
    // Update the selectedModelDatasource array
    this.selectedModelDatasource = this.modelDataSourceList
      .filter(item => item.selected)
      .map(item => item.value);

    this.emitSelectionChanges();
    this.updateFilterStatus();
    this.toggleFilterExpanded();
  }
  /**
   * Removes model datasource filterelDatasource:', this.selectedModelDatasource);
   */
  /**
   * Removes a model datasource filter
   */
  removeModelDatasourceFilter(type: string): void {
    const index = this.selectedModelDatasource.indexOf(type);
    if (index !== -1) {
      this.selectedModelDatasource.splice(index, 1);
      // Update the UI selection state
      this.modelDataSourceList.forEach((element) => {
        if (element.value === type) {
          element.selected = false;
        }
      });
      // Emit the updated selection
      this.tagSelected.emit(this.geteventtagsdto());
    }
    this.updateFilterStatus();
  }

  /**
   * Gets the label for a datasource value (for chip display)
   */
  getDatasourceLabel(value: string): string {
    const datasource = this.modelDataSourceList.find(item => item.value === value);
    return datasource ? datasource.label : value;
  }
}
