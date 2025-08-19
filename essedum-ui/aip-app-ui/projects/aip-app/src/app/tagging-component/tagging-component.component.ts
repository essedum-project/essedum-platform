import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Services } from '../services/service';
import { TagsService } from '../services/tags.service';
import { HttpParams } from '@angular/common/http';
import { TagEventDTO } from '../DTO/tagEventDTO.model';
import { AdapterServices } from '../sharedModule/services/adapter-service';
// import { LeapTelemetryService } from 'com-lib-util';
import { DatasetServices } from '../dataset/dataset-service';
import { ActivatedRoute, Router } from '@angular/router';
import { SemanticService } from '../services/semantic.services';
//import { PromptServices } from '../prompts/prompt.service';

@Component({
  selector: 'app-tagging-component',
  templateUrl: './tagging-component.component.html',
  styleUrls: ['./tagging-component.component.scss'],
})
export class TaggingComponentComponent implements OnInit, OnChanges {
  @Input() tagrefresh: boolean;
  @Input() servicev1: string;
  @Input() preselectedtag :any;
  @Input() selectedAdpImplCombinedLists :any;
  @Input() selectedConnectionTypeList: any;
  @Input() selectedDatasetTypeList: any;
  @Input() selectedPipelineTypeList: any;
  @Input() selectedToolsTypeList: any;
  @Input() selectedChainTypeList: any;
  @Input() selectedModelTypeLists: any;
  @Input() selectedEndpointTypeLists: any;
  @Input() selectedAppTypeList: any;
  category = [];
  tags;
  tagsBackup;
  allTags: any;
  tagStatus = {};
  catStatus = {};
  selectedTag = [];
  selectedTagList = [];
  selectedType: string[] = [];
  adapterTypes: any;
  selectedAdapterType: string[] = [];
  selectedAdapterList: string[] = [];
  selectedAdapterInstance: string[] = [];
  adapterTypeList: any[] = [];
  appTypeList: any[] = [];
  selectedAppType: string[] = [];
  appTypes: any;
  adapterInstanceList: any[] = [];
  @Output() tagSelected = new EventEmitter<any>();
  pipelinesTypeList: any[];
  toolsTypeList: any[] = [];
  connectionsTypeList: any[];
  datasetTopicList:any[]=[];
  datasetsTypes: any[];
  pipelinesTypes: any[];
  toolsTypes: any[];
  connectionsTypes: any[];
  datasetsTypeList: any[];
  selectedPipelineType: string[] = [];
  selectedToolsType: string[] = [];
  selectedconnectionType: string[] = [];
  mlAdapterConnectionTypesList: any[];
  mlAdapterCategoryTypeList: any[];
  mlAdapterSpecTypeList: any[];
  mlSpecTemplateCapabilityTypeList: any[];
  mlInstanceAdapterTypeList: any[];
  mlInstanceConnectionTypeList: any[];
  mlAdapterConnectionNamesList: string[] = [];
  mlAdapterCategoryList: string[] = [];
  mlAdapterSpecTemplateList: string[] = [];
  mlSpecTemplateCapabilityList: string[] = [];
  mlInstancesAdapterList: string[] = [];
  mlInstancesConnectionList: string[] = [];
  selectedMlAdapterConnectionType: string[] = [];
  selectedMlAdapterCategoryType: string[] = [];
  selectedMlAdapterSpecType: string[] = [];
  selectedMlSpecTemplateCapabilityType: string[] = [];
  selectedMlInstancesConnectionType: string[] = [];
  selectedMlInstancesAdapterType: string[] = [];
  selectedDatasetTopicType:string[] =[]
  datasetsTags: any[];
  datasetsTagsList: any[];
  selectedTagsType: any[];
  type = [];
  categoryList = [];
  connectionList = [];
  specList = [];
  specCapabilityList = [];
  instanceConnectionList = [];
  instanceImplementationList = [];
  instance = [];
  pipelineType = [];
  toolsType = [];
  chainType = [];
  instanceType = [];
  appType=[];
  preSelectedConnectionType = [];
  constructor(
    // private telemetryService: LeapTelemetryService,
    private service: Services,
    private DatasetServices: DatasetServices,
    public tagService: TagsService,
    private adapterServices: AdapterServices,
    private semanticService:SemanticService,
   // private promptService: PromptServices,
    private router: Router,
    private route: ActivatedRoute
  ) { }
  ngOnInit(): void {

    if (this.selectedAdpImplCombinedLists) {
      //for Adapter Implementations screen - preselected Filters
      this.categoryList = this.selectedAdpImplCombinedLists.selectedCategoryList ?? [];
      this.connectionList = this.selectedAdpImplCombinedLists.selectedConnectionNamesList ?? [];
      this.specList = this.selectedAdpImplCombinedLists.selectedSpecList ?? [];
      //for Specs screen - preselected Filters
      this.specCapabilityList = this.selectedAdpImplCombinedLists.selectedCapabilityType ?? [];

      //for Instances screen - preselected Filters
      this.instanceConnectionList = this.selectedAdpImplCombinedLists.selectedInstanceConnectionList ?? [];
      this.instanceImplementationList = this.selectedAdpImplCombinedLists.selectedInstanceImplementationList ?? [];
    }

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
    if (this.selectedConnectionTypeList) {
      //for Connection screen - preselected Filters
      this.type = this.selectedConnectionTypeList.selectedAdapterType ?? [];
    }
    if (this.selectedDatasetTypeList) {
      this.type = this.selectedDatasetTypeList.selectedAdapterType ?? [];
    }
    if (this.selectedPipelineTypeList) {
      this.pipelineType = this.selectedPipelineTypeList.selectedAdapterType ?? [];
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
      this.instanceType = this.selectedEndpointTypeLists.selectedAdapterInstance ?? [];
    }
    if (this.selectedAppTypeList) {
      this.appType = this.selectedAppTypeList.selectedTagType ?? [];
    }
    this.type.forEach((types) => {
      this.selectedAdapterType.push(types);
    });
    this.appType.forEach((types) => {
      this.selectedAdapterType.push(types);
    })
    this.pipelineType.forEach((types) => {
      this.selectedAdapterType.push(types);
    });
    this.toolsType.forEach((types) => {
      this.selectedAdapterType.push(types);
    });
    this.chainType.forEach((types) => {
      this.selectedAdapterType.push(types);
    });
    this.instanceType.forEach((types) => {
      this.selectedAdapterList.push(types);
    });
    this.instance.forEach((instances) => {
      this.selectedAdapterInstance.push(instances);
    });
    console.log("WE CALLED - ", this.servicev1)
    // this.telemetryImpression();
    if (this.servicev1 === 'pipeline' || this.servicev1 === 'chain') {
      // this.getTags();
      this.getPipelinesTypes();
      this.getTags();

      if (this.tagrefresh) {
        this.refresh();
      }
    } else if (this.servicev1 === 'connections') {
      this.getDatasourceTypes();
      if (this.tagrefresh) {
        this.refresh();
      }
    } else if (this.servicev1 === 'Datasets') {
      this.getDatasetsTypes();
      this.getTopicTypes();
      if (this.tagrefresh) {
        this.refresh();
      }
    } else if (this.servicev1 === 'adapters') {
      this.getMlAdapterFilters();
      this.selectedMlAdapterConnectionType = [];
      this.selectedMlAdapterCategoryType = [];
      this.selectedMlAdapterSpecType = [];
      if (this.tagrefresh) {
        this.refresh();
      }
    }
    
    else if (this.servicev1 === 'apps') {
      this.fetchAppType();
      this.getTags();

      if (this.tagrefresh) {
        this.refresh();
      }
    }  else if (this.servicev1 === 'specs') {
      this.getMlSpecTemplateFilters();
      this.selectedMlSpecTemplateCapabilityType = [];
      if (this.tagrefresh) {
        this.refresh();
      }
    } else if (this.servicev1 === 'featurestore') {
      this.fetchFSAdapters();
      this.fetchFSAdaptersTypes();
      if (this.tagrefresh) {
        this.refresh();
      }
    } else if (this.servicev1 === 'dgApp') {
      this.fetchDGAdapters();
      this.fetchDGAdaptersTypes();
      if (this.tagrefresh) {
        this.refresh();
      }
    } else if (this.servicev1 === 'instances') {
      this.getMlInstancesFilters();
      this.selectedMlInstancesAdapterType = [];
      this.selectedMlInstancesConnectionType = [];
      if (this.tagrefresh) {
        this.refresh();
      }
    }else if (this.servicev1 === 'worker-tools') {
      this.getToolsTypes();

      if (this.tagrefresh) {
        this.refresh();
      }
    }
     else {
      this.getTags();
      this.fetchAdaptersTypes();
      this.fetchAdapters();
      if (this.tagrefresh) {
        this.refresh();
      }
    }
  }
  getToolsTypes() {
    // this.promptService.getAllToolCategory().subscribe((res) => {
    //   this.toolsTypes = res;
    //   this.toolsTypes.forEach((element: any) => {
    //       if (this.toolsType.length > 0) {
    //         this.toolsType.forEach((type) => {
    //           if (type === element) {
    //             // if (element && element != 'App' && element != 'Langchain') {
    //             this.toolsTypeList.push({
    //               category: 'Type',
    //               label: element.substr(element.indexOf(':') + 2),
    //               value: element.substr(element.indexOf(':') + 2),
    //               selected: true,
    //             });
    //             // }
    //           }
    //         });
    //       }
    //       if (
    //         !this.toolsTypeList.some(
    //           (obj) => obj.label === element.substr(element.indexOf(':') + 2) && obj.value === element.substr(element.indexOf(':') + 2)
    //         )
    //       ) {
    //         // if (element && element != 'App' && element != 'Langchain') {
    //         this.toolsTypeList.push({
    //           category: 'Type',
    //           label: element.substr(element.indexOf(':') + 2),
    //           value: element.substr(element.indexOf(':') + 2),
    //           selected: false,
    //         });
    //         // }
    //       }
        
    //   });
    // });
  }
  getTopicTypes() {
    this.semanticService.getAllTopics().subscribe(res=>{
      res.forEach((element: any) => {
        console.log(element);
        
        this.datasetTopicList.push({
          category: 'Topic',
          label: element.topicname,
          value: element.topicname,
          selected: false,
        })
    })
  })
  }

  // telemetryImpression() {
  //   this.telemetryService.start();
  //   this.telemetryService.impression(
  //     'aip-app',
  //     'list',
  //     'TaggingComponentComponent'
  //   );
  // }
  // fetchAppType(){
  //   this.adapterTypeList = [];
  //   this.adapterTypes = [];
  //   this.selectedAdapterType = [];
  //   this.service.getAppTypes().subscribe((res) => {
  //     this.adapterTypes = res.body;
  //     this.adapterTypes.forEach((element: any) => {
  //       this.adapterTypeList.push({
  //         category: 'Type',
  //         label: element,
  //         value: element,
  //         selected: false,
  //       });
  //     });
  //   });
  // }
  fetchAppType() {
    this.adapterTypeList = [];
    this.adapterTypes = [];
    this.selectedAdapterType = [];
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['type']) {
        this.selectedAdapterType = params['type'].split(',');
        
      }
      
    });
    this.service.getAppTypes().subscribe((res) => {
      this.adapterTypes = res.body;
      this.adapterTypes.forEach((element: any) => {
        if (this.appType.length > 0) {
          this.appType.forEach((type) => {
            if (type === element) {
              this.adapterTypeList.push({
                category: 'Type',
                label: element,
                value: element,
                selected: true,
              });
            }
          });
        }
        if (!this.adapterTypeList.some((obj) => obj.label === element && obj.value === element)) {
          if(element){
          this.adapterTypeList.push({
            category: 'Type',
            label: element,
            value: element,
            selected: false,
          });
        }
      }
      });
    });
  }
  getMlInstancesFilters() {
    this.adapterServices.getInstancesFilters().subscribe((res: any) => {
      this.mlInstancesAdapterList = res.adapters;
      this.mlInstancesConnectionList = res.connections;
      this.mlInstanceConnectionTypeList = [];
      this.mlInstanceAdapterTypeList = [];
      this.selectedMlInstancesAdapterType = [];
      this.mlInstancesConnectionList.forEach((element: any) => {
        if (!this.tagrefresh && this.instanceConnectionList && this.instanceConnectionList.length > 0 && this.instanceConnectionList.includes(element)) {
          const itemExists = this.mlInstanceConnectionTypeList.some(item => item.value === element);
          if (!itemExists) {
            this.mlInstanceConnectionTypeList.push({
              category: 'Connections',
              label: element,
              value: element,
              selected: true,
            });
          }
          if (!this.selectedMlInstancesConnectionType.includes(element))
            this.selectedMlInstancesConnectionType.push(element);
        } else {
          const itemExists = this.mlInstanceConnectionTypeList.some(item => item.value === element);
          if (!itemExists) {
            this.mlInstanceConnectionTypeList.push({
              category: 'Connections',
              label: element,
              value: element,
              selected: false,
            });
          }
        }
      });

      this.mlInstancesAdapterList.forEach((element: any) => {
        if (!this.tagrefresh && this.instanceImplementationList && this.instanceImplementationList.length > 0 && this.instanceImplementationList.includes(element)) {
          const itemExists = this.mlInstanceAdapterTypeList.some(item => item.value === element);
          if (!itemExists) {
            this.mlInstanceAdapterTypeList.push({
              category: 'Adapter',
              label: element,
              value: element,
              selected: true,
            });
          }
          if (!this.selectedMlInstancesAdapterType.includes(element))
            this.selectedMlInstancesAdapterType.push(element);
        } else {
          const itemExists = this.mlInstanceAdapterTypeList.some(item => item.value === element);
          if (!itemExists) {
            this.mlInstanceAdapterTypeList.push({
              category: 'Adapter',
              label: element,
              value: element,
              selected: false,
            });
          }
        }
      });
    });
  }

  getPipelinesTypes() {
    this.pipelinesTypeList = [];
    this.pipelinesTypes = [];
    this.selectedPipelineType = [];
    this.pipelineType.forEach((types) => {
      this.selectedAdapterType.push(types);
    });
    if (this.servicev1 == 'chain') {
      this.service.getPipelinesTypeByOrganization().subscribe((res) => {
        this.pipelinesTypes = JSON.parse(res);
        this.pipelinesTypes.forEach((element: any) => {
          if (element && element != 'App') {
            if (this.chainType.length > 0) {
              this.chainType.forEach((type) => {
                if (type === element) {
                  this.pipelinesTypeList.push({
                    category: 'Type',
                    label: element,
                    value: element,
                    selected: true,
                  });
                }
              });
              // this.pipelinesTypeList.push({
              //   category: 'Type',
              //   label: element,
              //   value: element,
              //   selected: false,
              // });
            }
            if (
              !this.pipelinesTypeList.some(
                (obj) => obj.label === element && obj.value === element
              )
            ) {
              this.pipelinesTypeList.push({
                category: 'Type',
                label: element,
                value: element,
                selected: false,
              });
            }
          }
        });
      });
    } else {
      this.service.getPipelinesTypeByOrganization().subscribe((res) => {
        this.pipelinesTypes = JSON.parse(res);
        this.pipelinesTypes.forEach((element: any) => {
          if (element && element != 'App' && element != 'Langchain') {
            if (this.pipelineType.length > 0) {
              this.pipelineType.forEach((type) => {
                if (type === element) {
                  // if (element && element != 'App' && element != 'Langchain') {
                  this.pipelinesTypeList.push({
                    category: 'Type',
                    label: element,
                    value: element,
                    selected: true,
                  });
                  // }
                }
              });
            }
            if (
              !this.pipelinesTypeList.some(
                (obj) => obj.label === element && obj.value === element
              )
            ) {
              // if (element && element != 'App' && element != 'Langchain') {
              this.pipelinesTypeList.push({
                category: 'Type',
                label: element,
                value: element,
                selected: false,
              });
              // }
            }
          }
        });
      });
    }
  }
  getDatasourceTypes() {
    this.connectionsTypeList = [];
    this.connectionsTypes = [];
    this.selectedAdapterType = [];
    this.selectedconnectionType = [];
    this.service.getDatasourcesTypeByOrganization().subscribe((res) => {
      this.connectionsTypes = JSON.parse(res);
      this.connectionsTypes.forEach((element: any) => {
        if (!this.tagrefresh && this.type && this.type.length > 0 && this.type.includes(element)) {
          const itemExists = this.connectionsTypeList.some(item => item.value === element);
          if (!itemExists) {
            this.connectionsTypeList.push({
              category: 'Type',
              label: element,
              value: element,
              selected: true,
            });
          }
          if (!this.selectedAdapterType.includes(element))
            this.selectedAdapterType.push(element);
        } else {
          const itemExists = this.connectionsTypeList.some(item => item.value === element);
          if (!itemExists) {
            this.connectionsTypeList.push({
              category: 'Type',
              label: element,
              value: element,
              selected: false,
            });
          }
        }
      });
    });
  }
  getDatasetsTypes() {
    this.datasetsTypeList = [];
    this.datasetsTypes = [];
    this.selectedconnectionType = [];
    this.datasetsTagsList = [];
    this.datasetsTags = [];
    this.selectedTagsType = [];
    this.DatasetServices.getDatasetsType().subscribe((res) => {
      let data = JSON.parse(res);
      data.forEach((element) => {
        this.datasetsTypes.push(element.type);
      });
      this.datasetsTypes.forEach((element: any) => {
        if (this.type.length > 0) {
          this.type.forEach((type) => {
            if (type === element) {
              this.datasetsTypeList.push({
                category: 'Type',
                label: element,
                value: element,
                selected: true,
              });
              // }
            }
          });
        }
        if (!this.datasetsTypeList.some((obj) => obj.label === element && obj.value === element)) {
        this.datasetsTypeList.push({
          category: 'Type',
          label: element,
          value: element,
          selected: false,
        });
      }
      });
    });
    this.service.getDatasetCards('', '', '', false).subscribe((res) => {
      let datasetList = res;
      datasetList.forEach((element) => {
        if (element.tags) this.datasetsTags.push(JSON.parse(element.tags));
      });
      let tags: any;
      let tagsList: any = [];
      this.datasetsTags.forEach((element: any) => {
        if (
          element != null &&
          element != '' &&
          element != 'null' &&
          element != ''
        ) {
          tags = element;
          tags.forEach((tag) => {
            tagsList.push({
              category: 'Tags',
              label: tag,
              value: tag,
              selected: false,
            });
          });
        }
      });
      tagsList = [...new Set(tagsList.map((item) => item.value))];
      tagsList.forEach((element) => {
        this.datasetsTagsList.push({
          category: 'Tags',
          label: element,
          value: element,
          selected: false,
        });
      });
      console.log('tagsList', tagsList);
    });
  }

  getMlAdapterFilters() {
    this.adapterServices.getAdapterFilters().subscribe((res) => {
      this.mlAdapterConnectionNamesList = res.connections;
      this.mlAdapterSpecTemplateList = res.specTemplates;
      this.mlAdapterCategoryList = res.categories;
      this.mlAdapterConnectionTypesList = [];
      this.mlAdapterCategoryTypeList = [];
      this.mlAdapterSpecTypeList = [];

      this.mlAdapterConnectionNamesList.forEach((element: any) => {
        if (!this.tagrefresh && this.connectionList && this.connectionList.length > 0 && this.connectionList.includes(element)) {
          const itemExists = this.mlAdapterConnectionTypesList.some(item => item.value === element);
          if (!itemExists) {
            this.mlAdapterConnectionTypesList.push({
              category: 'Connections',
              label: element,
              value: element,
              selected: true,
            });
          }
          if (!this.selectedMlAdapterConnectionType.includes(element))
            this.selectedMlAdapterConnectionType.push(element);
        } else {
          const itemExists = this.mlAdapterConnectionTypesList.some(item => item.value === element);
          if (!itemExists) {
            this.mlAdapterConnectionTypesList.push({
              category: 'Connections',
              label: element,
              value: element,
              selected: false,
            });
          }
        }
      });

      this.mlAdapterCategoryList.forEach((element: any) => {
        if (!this.tagrefresh && this.categoryList && this.categoryList.length > 0 && this.categoryList.includes(element)) {
          const itemExists = this.mlAdapterCategoryTypeList.some(item => item.value === element);
          if (!itemExists) {
            this.mlAdapterCategoryTypeList.push({
              category: 'Category',
              label: element,
              value: element,
              selected: true,
            });
          }
          if (!this.selectedMlAdapterCategoryType.includes(element))
            this.selectedMlAdapterCategoryType.push(element);
        } else {
          const itemExists = this.mlAdapterCategoryTypeList.some(item => item.value === element);
          if (!itemExists) {
            this.mlAdapterCategoryTypeList.push({
              category: 'Category',
              label: element,
              value: element,
              selected: false,
            });
          }
        }
      });

      this.mlAdapterSpecTemplateList.forEach((element: any) => {
        if (!this.tagrefresh && this.specList && this.specList.length > 0 && this.specList.includes(element)) {
          const itemExists = this.mlAdapterSpecTypeList.some(item => item.value === element);
          if (!itemExists) {
            this.mlAdapterSpecTypeList.push({
              category: 'Spec',
              label: element,
              value: element,
              selected: true,
            });
          }
          if (!this.selectedMlAdapterSpecType.includes(element))
            this.selectedMlAdapterSpecType.push(element);
        } else {
          const itemExists = this.mlAdapterSpecTypeList.some(item => item.value === element);
          if (!itemExists) {
            this.mlAdapterSpecTypeList.push({
              category: 'Spec',
              label: element,
              value: element,
              selected: false,
            });
          }
        }
      });
    });
  }
  getMlSpecTemplateFilters() {
    this.adapterServices.getSpecTemplateFilters().subscribe((res) => {
      this.mlSpecTemplateCapabilityList = res.capability;
      this.mlSpecTemplateCapabilityTypeList = [];
      this.mlSpecTemplateCapabilityList.forEach((element: any) => {
        if (!this.tagrefresh && this.specCapabilityList && this.specCapabilityList.length > 0 && this.specCapabilityList.includes(element)) {
          const itemExists = this.mlSpecTemplateCapabilityTypeList.some(item => item.value === element);
          if (!itemExists) {
            this.mlSpecTemplateCapabilityTypeList.push({
              category: 'Capability',
              label: element,
              value: element,
              selected: true,
            });
          }
          if (!this.selectedMlSpecTemplateCapabilityType.includes(element))
            this.selectedMlSpecTemplateCapabilityType.push(element);
        } else {
          const itemExists = this.mlSpecTemplateCapabilityTypeList.some(item => item.value === element);
          if (!itemExists) {
            this.mlSpecTemplateCapabilityTypeList.push({
              category: 'Capability',
              label: element,
              value: element,
              selected: false,
            });
          }
        }
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // this.refresh();
    if (changes.tagrefresh?.currentValue) {
      if (this.servicev1 === 'featurestore') {
        this.fetchFSAdapters();
        this.fetchFSAdaptersTypes();
      } else if (this.servicev1 === 'dgApp') {
        this.fetchDGAdapters();
        this.fetchDGAdaptersTypes();
        this.refresh();
      } else this.refresh();
    }
    if(this.servicev1 === 'worker-tools' && this.tagrefresh){
      this.refreshToolsTypes();
      this.refresh;
    }
  }
  refreshToolsTypes() {
    // this.promptService.getAllToolCategory().subscribe((res) => {
    //   this.toolsTypes = res;
    //   this.toolsTypeList = [];
    //   this.toolsTypes.forEach((element: any) => {
    //         this.toolsTypeList.push({
    //           category: 'Type',
    //           label: element.substr(element.indexOf(':') + 2),
    //           value: element.substr(element.indexOf(':') + 2),
    //           selected: false,
    //         });
    //   });
    // });
  }

  fetchAdapters(): boolean {
    let params: HttpParams = new HttpParams();
    this.adapterInstanceList = [];
    this.selectedAdapterInstance = [];
    if (this.selectedAdapterType.length >= 1)
      params = params.set('adapterType', this.selectedAdapterType.toString());
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.getModelListAdapters(params).subscribe((res) => {
      let test = res.body;
      let alias = test.map((item: any) => item.alias);
      let options = test;
      test.forEach((element: any) => {
        if (this.instance.length > 0) {
          this.instance.forEach((instance) => {
            if (element.name === instance) {
              this.adapterInstanceList.push({
                category: 'Instance',
                label: element.alias,
                value: element.name,
                selected: true,
              });
            }
            // else {
            //   this.adapterInstanceList.push({
            //     category: 'Instance',
            //     label: element.alias,
            //     value: element.name,
            //     selected: false,
            //   });
            // }
          });
        }
        if (
          !this.adapterInstanceList.some(
            (obj) => obj.label === element.alias && obj.value === element.name
          )
        ) {
          this.adapterInstanceList.push({
            category: 'Instance',
            label: element.alias,
            value: element.name,
            selected: false,
          });
        }
      });
    });
    return true;
  }
  fetchFSAdapters(): boolean {
    let params: HttpParams = new HttpParams();
    this.adapterInstanceList = [];
    this.selectedAdapterInstance = [];
    if (this.selectedAdapterType.length >= 1)
      params = params.set('adapterType', this.selectedAdapterType.toString());
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.getFeastAdapters(params).subscribe((res) => {
      let test = res.body;
      let alias = test.map((item: any) => item.alias);
      let options = test;
      test.forEach((element: any) => {
        this.adapterInstanceList.push({
          category: 'Instance',
          label: element.alias,
          value: element.name,
          selected: false,
        });
      });
    });
    return true;
  }
  fetchDGAdapters(): boolean {
    let params: HttpParams = new HttpParams();
    this.adapterInstanceList = [];
    this.selectedAdapterInstance = [];
    if (this.selectedAdapterType.length >= 1)
      params = params.set('adapterType', this.selectedAdapterType.toString());
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.getDGAdapters(params).subscribe((res) => {
      let test = res.body;
      let alias = test.map((item: any) => item.alias);
      let options = test;
      test.forEach((element: any) => {
        this.adapterInstanceList.push({
          category: 'Instance',
          label: element.alias,
          value: element.name,
          selected: false,
        });
      });
      console.log('dgInstanceList', this.adapterInstanceList);
    });
    return true;
  }

  fetchFSAdaptersTypes() {
    this.adapterTypeList = [];
    this.adapterTypes = [];
    this.selectedAdapterType = [];
    this.service.getFeastAdaptersTypes().subscribe((res) => {
      this.adapterTypes = res.body;
      this.adapterTypes.forEach((element: any) => {
        this.adapterTypeList.push({
          category: 'Type',
          label: element.name,
          value: element.name,
          selected: false,
        });
      });
    });
  }
 

  appTypeSelected(value): void {
    if (!this.selectedAdapterType.includes(value.value)) {
      this.selectedAdapterType.push(value.value);
    } else {
      this.selectedAdapterType.splice(
        this.selectedAdapterType.indexOf(value.value),
        1
      );
    }
    this.adapterTypeList.forEach((element: any) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });
    this.tagSelected.emit(this.geteventtagsdto());
    //this.refresh();
  }
  fetchDGAdaptersTypes() {
    this.adapterTypeList = [];
    this.adapterTypes = [];
    this.selectedAdapterType = [];
    this.service.getDGAdaptersTypes().subscribe((res) => {
      this.adapterTypes = res.body;
      this.adapterTypes.forEach((element: any) => {
        this.adapterTypeList.push({
          category: 'Type',
          label: element.name,
          value: element.name,
          selected: false,
        });
      });
    });
    console.log('DGTypes', this.adapterTypeList);
  }

  fetchAdaptersTypes() {
    let params: HttpParams = new HttpParams();
    this.adapterTypeList = [];
    this.adapterTypes = [];
    this.selectedAdapterType = [];
    this.type.forEach((types) => {
      this.selectedAdapterType.push(types);
    });
    if (this.selectedType.length >= 1)
      params = params.set('adapterType', this.selectedType.toString());
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.getModelListAdaptersTypes().subscribe((res) => {
      this.adapterTypes = res.body;
      this.adapterTypes.forEach((element: any) => {
        if (this.type.length > 0) {
          this.type.forEach((type) => {
            if (element.name === type) {
              this.adapterTypeList.push({
                category: 'Type',
                label: element.name,
                value: element.name,
                selected: true,
              });
            }
            // else {
            //   this.adapterTypeList.push({
            //     category: 'Type',
            //     label: element.name,
            //     value: element.name,
            //     selected: false,
            //   });
            // }
          });
        }
        if (
          !this.adapterTypeList.some(
            (obj) => obj.label === element.name && obj.value === element.name
          )
        ) {
          this.adapterTypeList.push({
            category: 'Type',
            label: element.name,
            value: element.name,
            selected: false,
          });
        }
      });
      if (this.router.url.includes('model') && this.type.length >0) {
        this.adapterTypeList.push({
          category: 'Type',
          label: 'LOCAL',
          value: 'LOCAL',
          selected: true,
        });
      } else if (this.router.url.includes('endpoints') && this.type.length >0) {
        this.adapterTypeList.push({
          category: 'Type',
          label: 'LOCAL',
          value: 'LOCAL',
          selected: true,
        });
      } else{
        this.adapterTypeList.push({
          category: 'Type',
          label: 'LOCAL',
          value: 'LOCAL',
          selected: false,
        });
      } 
    });
  }

  adapterTypeSelected(value): void {
    if (!this.selectedAdapterType.includes(value.value)) {
      this.selectedAdapterType.push(value.value);
    } else {
      this.selectedAdapterType.splice(
        this.selectedAdapterType.indexOf(value.value),
        1
      );
    }
    this.adapterTypeList.forEach((element: any) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });
    if (this.servicev1 === 'featurestore') {
      this.fetchFSAdapters();
    } else if (this.servicev1 === 'dgApp') {
      this.fetchDGAdapters();
    } else {
      this.fetchAdapters();
    }
    this.tagSelected.emit(this.geteventtagsdto());
    //this.refresh();
  }

  pipelineTypeSelected(value): void {
    if (!this.selectedAdapterType.includes(value.value)) {
      this.selectedAdapterType.push(value.value);
    } else {
      this.selectedAdapterType.splice(
        this.selectedAdapterType.indexOf(value.value),
        1
      );
    }
    this.pipelinesTypeList.forEach((element: any) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });
    // this.fetchAdapters();
    this.tagSelected.emit(this.geteventtagsdto());
    //this.refresh();
  }

  
  toolsTypeSelected(value): void {
    if (!this.selectedAdapterType.includes(value.value)) {
      this.selectedAdapterType.push(value.value);
    } else {
      this.selectedAdapterType.splice(
        this.selectedAdapterType.indexOf(value.value),
        1
      );
    }
    this.toolsTypeList.forEach((element: any) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });
    // this.fetchAdapters();
    this.tagSelected.emit(this.geteventtagsdto());
    //this.refresh();
  }
  connectionTypeSelected(value): void {
    if (!this.selectedAdapterType.includes(value.value)) {
      this.selectedAdapterType.push(value.value);
    } else {
      this.selectedAdapterType.splice(
        this.selectedAdapterType.indexOf(value.value),
        1
      );
    }
    this.connectionsTypeList.forEach((element: any) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });
    // this.fetchAdapters();
    this.tagSelected.emit(this.geteventtagsdto());
    //this.refresh();
  }
  datasetTypeSelected(value): void {
    if (value.category === 'Type') {
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
    } else if (value.category === 'Tags') {
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
    // this.fetchAdapters();
    this.tagSelected.emit(this.geteventtagsdto());
    //this.refresh();
  }
  datasetTopicSelected(value):void{
    if (!this.selectedDatasetTopicType.includes(value.value)) {
      this.selectedDatasetTopicType.push(value.value);
    } else {
      this.selectedDatasetTopicType.splice(
        this.selectedDatasetTopicType.indexOf(value.value),
        1
      );
    }
    this.datasetTopicList.forEach((element: any) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });
    this.tagSelected.emit(this.geteventtagsdto());
  }
  mlAdapterConnectionTypeSelected(value): void {
    if (!this.selectedMlAdapterConnectionType.includes(value.value)) {
      this.selectedMlAdapterConnectionType.push(value.value);
    } else {
      this.selectedMlAdapterConnectionType.splice(
        this.selectedMlAdapterConnectionType.indexOf(value.value),
        1
      );
    }
    this.mlAdapterConnectionTypesList.forEach((element: any) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });
    this.tagSelected.emit(this.geteventtagsdto());
  }

  mlAdapterCategoryTypeSelected(value): void {
    if (!this.selectedMlAdapterCategoryType.includes(value.value)) {
      this.selectedMlAdapterCategoryType.push(value.value);
    } else {
      this.selectedMlAdapterCategoryType.splice(
        this.selectedMlAdapterCategoryType.indexOf(value.value),
        1
      );
    }
    this.mlAdapterCategoryTypeList.forEach((element: any) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });
    this.tagSelected.emit(this.geteventtagsdto());
  }

  mlAdapterScecTypeSelected(value): void {
    if (!this.selectedMlAdapterSpecType.includes(value.value)) {
      this.selectedMlAdapterSpecType.push(value.value);
    } else {
      this.selectedMlAdapterSpecType.splice(
        this.selectedMlAdapterSpecType.indexOf(value.value),
        1
      );
    }
    this.mlAdapterSpecTypeList.forEach((element: any) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });
    this.tagSelected.emit(this.geteventtagsdto());
  }
  mlSpecTemplateCapabilityTypeSelected(value): void {
    if (!this.selectedMlSpecTemplateCapabilityType.includes(value.value)) {
      this.selectedMlSpecTemplateCapabilityType.push(value.value);
    } else {
      this.selectedMlSpecTemplateCapabilityType.splice(
        this.selectedMlSpecTemplateCapabilityType.indexOf(value.value),
        1
      );
    }
    this.mlSpecTemplateCapabilityTypeList.forEach((element: any) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });
    this.tagSelected.emit(this.geteventtagsdto());
  }
  mlInstanceConnectionTypeSelected(value): void {
    if (!this.selectedMlInstancesConnectionType.includes(value.value)) {
      this.selectedMlInstancesConnectionType.push(value.value);
    } else {
      this.selectedMlInstancesConnectionType.splice(
        this.selectedMlInstancesConnectionType.indexOf(value.value),
        1
      );
    }
    this.mlInstanceConnectionTypeList.forEach((element: any) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });
    this.tagSelected.emit(this.geteventtagsdto());
  }
  mlInstanceAdapterTypeSelected(value): void {
    if (!this.selectedMlInstancesAdapterType.includes(value.value)) {
      this.selectedMlInstancesAdapterType.push(value.value);
    } else {
      this.selectedMlInstancesAdapterType.splice(
        this.selectedMlInstancesAdapterType.indexOf(value.value),
        1
      );
    }
    this.mlInstanceAdapterTypeList.forEach((element: any) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });
    this.tagSelected.emit(this.geteventtagsdto());
  }

  adapterInstanceSelected(value): void {
    if (!this.selectedAdapterInstance.includes(value.value)) {
      this.selectedAdapterInstance.push(value.value);
    } else {
      this.selectedAdapterInstance.splice(
        this.selectedAdapterInstance.indexOf(value.value),
        1
      );
    }
    this.adapterInstanceList.forEach((element: any) => {
      if (element.value === value.value) {
        element.selected = !element.selected;
      }
    });
    this.tagSelected.emit(this.geteventtagsdto());
    //   this.refresh();
  }
  refresh() {
    this.tagStatus = {};
    this.selectedTagList = [];
    this.selectedAdapterType = [];
    this.datasetTopicList = [];
    this.selectedDatasetTopicType= [];
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

    //for Adapter Implementations screen Complete Reset of Filters
    this.selectedMlAdapterCategoryType = [];
    this.selectedMlAdapterConnectionType = [];
    this.selectedMlAdapterSpecType = [];
    this.categoryList = [];
    this.connectionList = [];
    this.specList = [];
    this.mlAdapterConnectionTypesList = [];
    this.mlAdapterCategoryTypeList = [];
    this.mlAdapterSpecTypeList = [];

    //for Spec  screen Complete Reset of Filters
    this.selectedMlSpecTemplateCapabilityType = [];
    this.mlSpecTemplateCapabilityTypeList = [];
    this.specCapabilityList = [];

    //for Instance  screen Complete Reset of Filters
    this.instanceConnectionList = [];
    this.instanceImplementationList = [];
    this.selectedMlInstancesAdapterType = [];
    this.selectedMlInstancesConnectionType = [];

    this.tagSelected.emit(this.geteventtagsdto());
    if(this.servicev1 !=='dgApp'){
    this.getTags();
    this.fetchAdaptersTypes();
    this.fetchAdapters();
    }
    if (this.servicev1 === 'pipeline' || this.servicev1 === 'chain')
      this.getPipelinesTypes();
    if (this.servicev1 === 'worker-tools')
      this.getToolsTypes();
    if (this.servicev1 === 'connections') this.getDatasourceTypes();
    if(this.servicev1 === 'instances') this.getMlInstancesFilters();
    if (this.servicev1 === 'Datasets'){ 
      this.getTopicTypes();
      this.getDatasetsTypes();}
    if (this.servicev1 === 'adapters')
      this.getMlAdapterFilters();
    if (this.servicev1 === 'specs')
      this.getMlSpecTemplateFilters();
  }
  getTags() {
    this.tags = {};
    this.tagsBackup = {};
    // this.category.push("platform")
    let servicename = this.servicev1;
    if (this.servicev1 === 'chain') servicename = 'pipeline';
    let param = new HttpParams();
    param = param.set('project', sessionStorage.getItem('organization'));
    // param = param.set('service', this.servicev1);
    param = param.set('service', servicename);

    this.service.getMlTagswithparams(param).subscribe((resp) => {
      this.allTags = resp;
      this.allTags.forEach((tag) => {
        if (this.category.indexOf(tag.category) == -1) {
          this.category.push(tag.category);
        }
        if(this.preselectedtag?.length>0 && this.preselectedtag.some((ele)=>ele == tag.id)){
          this.tagStatus[tag.category + ' - ' + tag.label] = true;
          this.selectedTag.push(tag);
        }
        else{
        this.tagStatus[tag.category + ' - ' + tag.label] = false;
        }
      });
      this.category.forEach((cat) => {
        this.tags[cat] = this.allTags
          .filter((tag) => tag.category == cat)
          .slice(0, 10);
        this.tagsBackup[cat] = this.allTags.filter(
          (tag) => tag.category == cat
        );
        this.catStatus[cat] = false;
      });
    });
  }
  showMore(category) {
    this.catStatus[category] = !this.catStatus[category];
    if (this.catStatus[category])
      this.tags[category] = this.allTags.filter(
        (tag) => tag.category == category
      );
    else
      this.tags[category] = this.allTags
        .filter((tag) => tag.category == category)
        .slice(0, 10);
  }

  filterByTag(tag) {
    this.tagStatus[tag.category + ' - ' + tag.label] =
      !this.tagStatus[tag.category + ' - ' + tag.label];

    if (!this.selectedTag.includes(tag)) {
      this.selectedTag.push(tag);
    } else {
      this.selectedTag.splice(this.selectedTag.indexOf(tag), 1);
    }
    console.log(this.selectedTag);

    this.selectedTagList = this.selectedTag.map((tag) => {
      return tag.id;
    });
    this.tagSelected.emit(this.geteventtagsdto());

    console.log(this.selectedTagList);
    // this.refresh() ;
  }

  geteventtagsdto(): TagEventDTO {
    let tagEventDTO = new TagEventDTO(
      this.selectedTagList,
      this.selectedAdapterType,
      this.selectedAdapterInstance,
      this.selectedMlAdapterConnectionType,
      this.selectedMlAdapterCategoryType,
      this.selectedMlAdapterSpecType,
      this.selectedMlSpecTemplateCapabilityType,
      this.selectedMlInstancesAdapterType,
      this.selectedMlInstancesConnectionType,
      this.selectedDatasetTopicType
    );
    return tagEventDTO;
  }
}