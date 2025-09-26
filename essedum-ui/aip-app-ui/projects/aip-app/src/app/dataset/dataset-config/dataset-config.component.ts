import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { TagsComponent } from '../../tags/tags.component';
import { DatasetServices } from '../dataset-service';
import { Services } from '../../services/service';
import { SchemaRegistryService } from '../../services/schema-registry.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';
import { SwaggerAPISpec } from '../../DTO/swaggerapispec';
import { FileUploader } from 'ng2-file-upload';
import { Location } from "@angular/common";
import { ActivatedRoute, Router } from '@angular/router';

export class NameAndAlias {
  name: string;
  alias: string
}
@Component({
  selector: 'app-dataset-config',
  templateUrl: './dataset-config.component.html',
  styleUrls: ['./dataset-config.component.scss']
})
export class DatasetConfigComponent implements OnInit, OnDestroy {

  templates: any;
  originalDatasetForms: any;
  variable: any;
  tags: TagsComponent;
  filteredTags: any;
  tagsFilterCtrl: any;
  viewType = [{ viewValue: 'Table View', value: 'Table View' }, { viewValue: 'Json View', value: 'Json View' },
  { viewValue: 'Image View', value: 'Image View' }, { viewValue: 'Audio View', value: 'Audio View' },
  { viewValue: 'Video View', value: 'Video View' }, { viewValue: 'Doc View', value: 'Doc View' },
  { viewValue: 'Pdf View', value: 'Pdf View' }, { viewValue: 'Text View', value: 'Text View' },
  { viewValue: 'Zip View', value: 'Zip View' }, { viewValue: 'Folder View', value: 'Folder View' },
  { viewValue: 'Form View', value: 'Form View' }];
  groupsOptions = [];
  rwOptions = [{ viewValue: 'Read Only', value: 'r' }, { viewValue: 'Read Write', value: 'rw' }];
  datasourceAllOpt = [];
  datasourcesOpt = [];
  originalSchemasOpt = [];
  originalSchemaTemplatesOpt = [];
  originalSchemaTemplateAlias = [];
  fetchedtagsOptions = [];
  SelectedGroup: any;
  data_type: any;
  originalSchemasAllOpt: any = [];
  isTemplate: boolean;
  schemajsonAlias: any;
  testLoaderBoolean: boolean;
  ;

  constructor(private datasetsService: DatasetServices,
        private route: ActivatedRoute,
 
    public services: Services,
    public schemaRegistryService: SchemaRegistryService,
    private location: Location,
    private router: Router,

    private formBuilder: FormBuilder,
    private dialog: MatDialog) {

  }
  copyData: any = {};
  data: any = {
    alias: '',
    name: '',
    description: '',
    datasource: '',
    schema: '',
    type: 'r',
    attributes: {},
    expStatus: '',     //For exp
    isAuditRequired: '',
    isPermissionManaged: '',
    isApprovalRequired: '',
    interfacetype: null,
    isArchivalEnabled: false,
    archivalConfig: false,
    isInboxRequired: '',
    tags: '',
  };
  isExperiment: boolean = false;      
  isPrivateDataset: boolean = false;   
  isSchema: boolean = false;
  schemas: any = [];
  datasources: any = [];
  schemaTemplates: any = [];
  originalDataSources: any = [];
  originalSchemas: any = [];
  originalSchemaTemplates: any[] = [];
  isCacheable: boolean = false;
  type: any;
  category: any;
  splunkTypes = [];
  datasetTypes = [];
  sourceType: any = {};
  selectedDatasetType: any;
  headers: Headers;
  filename: string;
  filepath: string;
  fileData: any;
  fileToUpload: File;
    isDropdownOpen: { [key: string]: boolean } = {};

  keys: any = [];
  schemaBol: any;
  groups: any[] = [];
  @Input('dataset') matData: any;
  @Input() copyDataset: boolean;
  @Output() refreshcards = new EventEmitter<boolean>();
  dataSourceFilterCtrl = new FormControl();
  schemaFilterCtrl = new FormControl();
  schemaFormFilterCtrl = new FormControl();
  filteredDataSources: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredSchemas: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredSchemaTemplates: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  @ViewChild('dataSourceSelect', { static: false }) dataSourceSelect: MatSelect;
  @ViewChild('schemaSelect', { static: false }) schemaSelect: MatSelect;
  @ViewChild('schemaFormSelect', { static: false }) schemaFormSelect: MatSelect;
  protected onDestroy = new Subject<void>();
  datasets: any = [];
  datasetObjects: any = [];
  filteredDatasets: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  backingDatasetCtrl = new FormControl();
  backingDatasetFilterCtrl = new FormControl();
  @ViewChild('datasetSelect', { static: false }) datasetSelect: MatSelect;
  scriptShow = false;
  script = [];
  firstForm = new FormGroup({
    alias: new FormControl(''),
    name: new FormControl(''),
    description: new FormControl(),
    groupsCtrl: new FormControl([]),
    Viewertype: new FormControl(''),
    Usagetype: new FormControl(''),
    datasourceCtrl: new FormControl(''),
    datasourceAliasCtrl: new FormControl(''),
    schemaCtrl: new FormControl(''),
    schemaAliasCtrl: new FormControl(''),
    schemajsonAliasCtrl: new FormControl(''),
    schemaFormCtrl: new FormControl([]),
    isExperiment: new FormControl(''),      
    isPrivateDataset: new FormControl(''),   
    isAuditRequired: new FormControl(''),
    isPermissionManaged: new FormControl(''),
    isApprovalRequired: new FormControl(''),
    isArchivalEnabled: new FormControl(''),
    interfacetype: new FormControl(null),
    archivalConfig: new FormControl(''),
    isInboxRequired: new FormControl(''),
    tagsDisp: new FormControl(""),
    tagsFilterCtrl: new FormControl(""),
  });
  proceed = false;
  isInEdit: boolean = false
  isAuth: boolean = true;
  scmValList: any[] = [];
  schemaName: any;
  openEditor: boolean = false;
  contentVal: boolean = true;
  testSuccessful: boolean = false;
  busy: Subscription
  schema
  template
  restExp

  reqdColsPresent: boolean = true;
  swaggerapispec: SwaggerAPISpec = new SwaggerAPISpec();

  public uploader: FileUploader = new FileUploader({
    url: '/datasets/upload',
  });

  ngOnInit() {
    this.authentications();
    if (this.matData) {
      this.data = this.matData
      if (this.data.datasource.type == "S3") {
        this.viewType.push({ viewValue: 'Code View', value: 'Code View' }, { viewValue: 'Log View', value: 'Log View' },
          { viewValue: 'Email View', value: 'Email View' }
        );
      }
      if (this.matData.schema)
        this.schemaName = this.matData.schema;
      if (this.data.expStatus != 0 && this.data.expStatus != null)
        this.isExperiment = true;       //Exp
      if (this.data.expStatus == 3 || this.data.expStatus == 1)
        this.isPrivateDataset = true;   //Exp
      if (this.data.interfacetype == 'template')
        this.isTemplate = true
      this.firstForm.controls.datasourceCtrl.setValue(this.matData.datasource.name);
      this.firstForm.controls.datasourceAliasCtrl.setValue(this.matData.datasource?.alias);
      this.matData.schema ? this.firstForm.controls.schemaCtrl.setValue(this.matData.schema) : null;
      this.matData.schema ? this.firstForm.controls.schemaAliasCtrl.setValue(this.matData.schema.alias) : null;
      this.matData.schemajson ? this.schemajsonAlias = JSON.parse(this.matData.schemajson)[0]?.alias : null;
      this.firstForm.controls.isArchivalEnabled.setValue(this.matData.isArchivalEnabled);
      this.firstForm.controls.archivalConfig.setValue(this.matData.archivalConfig);
      if (typeof this.data.tags === 'string') {
        this.data.tags = JSON.parse(this.data.tags);
      }
      this.firstForm.controls.tagsDisp.setValue(this.matData.tags);
      this.firstForm.controls.Viewertype.setValue(this.matData.views);
      this.firstForm.controls.Usagetype.setValue(this.matData.type);
      this.isInEdit = true;
    }

    this.fetchTags();
    this.findallschema();
    this.findalldatasources();
    this.fetchGroups();
    this.getdatasetTypes();
    this.dataSourceFilterCtrl.valueChanges
      .pipe(takeUntil(this.onDestroy))
      .subscribe(() => {
        this.filterDatasources();
      });
    this.schemaFilterCtrl.valueChanges
      .pipe(takeUntil(this.onDestroy))
      .subscribe(() => {
        this.filterSchemas();
      });
    this.schemaFormFilterCtrl.valueChanges
      .pipe(takeUntil(this.onDestroy))
      .subscribe(() => {
        this.filterSchemaTemplate();
      });
    this.backingDatasetFilterCtrl.valueChanges
      .pipe(takeUntil(this.onDestroy))
      .subscribe(() => {
        this.filterDatasets();
      });
    this.tagsFilterCtrl?.valueChanges
      .pipe(takeUntil(this.onDestroy))
      .subscribe(() => {
        this.filterTags();
      });
    if (this.matData) {
      if (typeof (this.matData) != "string") {
        this.data = this.matData
        if (this.matData.schema)
          this.schemaName = this.matData.schema;
        this.firstForm.controls.datasourceCtrl.setValue(this.matData.datasource.name);
        this.matData.schema ? this.firstForm.controls.schemaCtrl.setValue(this.matData.schema) : null;
      }
    }
  }

  authentications() {
    this.services.getPermission("cip").subscribe(
      (cipAuthority) => {
           const authorityArr = JSON.parse(cipAuthority);
           this.isAuth = !authorityArr.some(item => item.permission === "dataset-edit");
        
      }
    );
  }

  alterInterfaceType(event) {
    if (event.checked) {
      this.data.interfacetype = "template";
    } else {
      this.data.interfacetype = null;
    }

  }

  filterDatasources() {
    if (!this.datasources) {
      return;
    }
    let search = this.dataSourceFilterCtrl.value;
    if (!search) {
      this.filteredDataSources.next(this.datasources.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredDataSources.next(
      this.datasources.filter(datasource => datasource.toLowerCase().indexOf(search) > -1)
    );
  }

  filterSchemas() {
    if (!this.schemas) {
      return;
    }
    let search = this.schemaFilterCtrl.value;
    if (!search) {
      this.filteredSchemas.next(this.schemas.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredSchemas.next(
      this.schemas.filter(schema => schema?.alias?.toLowerCase().indexOf(search) > -1)
    );
  }

  filterDatasets() {
    if (!this.datasets) {
      return;
    }
    let search = this.backingDatasetFilterCtrl.value;
    if (!search) {
      this.filteredDatasets.next(this.datasets.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredDatasets.next(
      this.datasets.filter(dataset => dataset.toLowerCase().indexOf(search) > -1)
    );
  }
  filterSchemaTemplate() {
    if (!this.schemaTemplates) {
      return;
    }
    let search = this.schemaFormFilterCtrl.value;
    if (!search) {
      this.filteredSchemaTemplates.next(this.schemaTemplates.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredSchemaTemplates.next(
      this.schemaTemplates.filter(schemaTemplates => schemaTemplates.name.toLowerCase().indexOf(search) > -1)
    );
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
   
  }
  setDataSourceInitialValue() {
    this.filteredDataSources
      .pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(() => {
        if (this.dataSourceSelect) {
          this.dataSourceSelect.compareWith = (a: any, b: any) => a && b && a === b;
        }
      });
  }

  setSchemaInitialValue() {
    try {
      let schemaName = this.firstForm.controls.schemaCtrl.value['name']
      let selectedSchema = this.originalSchemas.filter(schema => schema.name == schemaName)[0];
      if (selectedSchema) {
        this.isSchema = true;
        this.schemaName = selectedSchema.alias;
      }
      if (selectedSchema) {
        this.services.getSchemaFormsByName(selectedSchema.name).subscribe(
          resp => {
            this.originalSchemaTemplates = resp;
            this.originalSchemaTemplates.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
            this.originalSchemaTemplates.forEach(element => {
              this.schemaTemplates.push({ "name": element.name, "alias": element.alias });
              this.filteredSchemaTemplates.next(this.schemaTemplates);
            },
              error => {
                this.services.message("Error while fetching Form Templates",'error')
              }
            );

          });
      }

      if (selectedSchema && selectedSchema.schemavalue) {
        this.scmValList = JSON.parse(selectedSchema.schemavalue.toString());
        this.reqdColsPresent = (this.scmValList?.filter(ele => ele.isrequired).length > 0)
      }
    }
    catch (Exception) {
      this.services.message("Some error occured",'error')
    }

  }

  setBackingDatasetInitialValue() {
    this.filteredDatasets
      .pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(() => {
        if (this.datasetSelect) {
          this.datasetSelect.compareWith = (a: any, b: any) => a && b && a === b;
        }
      });
  }

  saveDataset() {
    try {
      if (this.matData.purpose != 'pipeline') {
        const editCanvas = JSON.parse(JSON.stringify(this.data));
        editCanvas.backingDataset = editCanvas.backingDataset !== '' ? editCanvas.backingDataset : null;
        if (this.isExperiment = true) { this.data.expStatus = 2 }
        editCanvas.attributes["Cacheable"] = this.isCacheable;
        if (editCanvas.schema && typeof (editCanvas.schema) == "string" && editCanvas.schema.toString().replace(/\s/g, '').length > 0) {
          const schema = this.originalSchemas.filter(s => s.name === editCanvas.schema)[0];
          editCanvas.schema = schema;
        }
        else
          if (typeof (editCanvas.schema) != "object")
            editCanvas.schema = undefined;
        if (this.data.schemajson && typeof (editCanvas.schemajson) != "string")
          editCanvas.schemajson = JSON.stringify(this.data.schemajson);
        editCanvas.taskdetails = editCanvas.taskdetails ? JSON.parse(editCanvas.taskdetails) : []
        editCanvas.tags = JSON.stringify(this.firstForm.controls.tagsDisp.value)
        editCanvas.views = this.firstForm.controls.Viewertype.value
        this.datasetsService.saveDataset(editCanvas).subscribe((res) => {
          let dataset = res.body
          this.services.message('Saved! Updated successfully');
          if (this.data.datasource.category == "REST") {
            this.services.getCoreDatasource(this.data.datasource.name, sessionStorage.getItem("organization")).subscribe(res => {
              dataset.datasource = res
              this.modifyAPISpec(dataset, dataset.name)
            })
          }
          if (this.firstForm.controls.groupsCtrl.value != null) {
            const grouplist = this.firstForm.controls.groupsCtrl.value;
            this.datasetsService.addGroupModelEntity(this.data.name, grouplist, this.data.organization).subscribe();
          }
          this.location.back();
        },
          error => {
            this.services.message('Error! Dataset not created due to ' + error,'error');
          });
      }
    }
    catch (Exception) {
      this.services.message("Some error occured",'error')
    }

  }
  createDataset() {
    try {
      const dataset = JSON.parse(JSON.stringify(this.data));
      dataset.name = ""
      dataset.alias = this.data.alias
      dataset.backingDataset = dataset.backingDataset !== '' ? dataset.backingDataset : null;
      if (this.isExperiment = true) { dataset.expStatus = 2 }
      dataset.attributes["Cacheable"] = this.isCacheable;
      if (dataset.schema && typeof (dataset.schema) == "string" && dataset.schema.toString().replace(/\s/g, '').length > 0) {
        const schema = this.originalSchemas.filter(s => s.name === dataset.schema)[0];
        dataset.schema = schema;
      }
      else
        if (typeof (dataset.schema) != "object")
          dataset.schema = undefined;
      if (this.data.schemajson && typeof (dataset.schemajson) != "string")
        dataset.schemajson = JSON.stringify(this.data.schemajson);
      dataset.taskdetails = dataset.taskdetails ? JSON.parse(dataset.taskdetails) : []
      dataset.tags = JSON.stringify(this.firstForm.controls.tagsDisp.value)
      dataset.views = this.firstForm.controls.Viewertype.value
      this.busy = this.datasetsService.createDataset(dataset).subscribe((res) => {
        let returnedName = res.name;
        this.services.message('Saved! Copied successfully');

        if (this.data.datasource.category == "REST")
          this.modifyAPISpec(this.data, returnedName)
        if (JSON.parse(res.expStatus) != 0) {
        }
        const temp = [];
        if (this.firstForm.controls.groupsCtrl.value != null) {
          if (Array.isArray(this.firstForm.controls.groupsCtrl.value)) {
            this.firstForm.controls.groupsCtrl.value.forEach(element => {
              temp.push((JSON.parse(element))["name"]);
            });
          }
          this.datasetsService.addGroupModelEntity(returnedName, temp, dataset.organization).subscribe();
        }
        this.router.navigate(['../datasets/' ], { relativeTo: this.route });

      },
        error => {
          this.datasetsService.message('Error! Dataset not created due to  ' + error,'error');
        });
    }
    catch (Exception) {
      this.datasetsService.message("Some error occured", "error")
    }

  }

  loader($event) {
    this.testLoaderBoolean = $event;
  }

  testConnection() {
    try {
      const editCanvas = JSON.parse(JSON.stringify(this.data));
      editCanvas.backingDataset = editCanvas.backingDataset !== '' ? editCanvas.backingDataset : null;
      editCanvas.taskdetails = editCanvas.taskdetails ? JSON.parse(editCanvas.taskdetails) : []
      if (editCanvas.schema && editCanvas.schema.toString().replace(/\s/g, '').length > 0) {
        const schema = this.originalSchemas.filter(s => s.name === editCanvas.schema)[0];
        editCanvas.schema = schema;
      }
      else editCanvas.schema = undefined;
      editCanvas.tags = JSON.stringify(this.firstForm.controls.tagsDisp.value)
      editCanvas.views = JSON.stringify(this.firstForm.controls.Viewertype.value)
      if (this.data.schemajson && typeof (editCanvas.schemajson) != "string") editCanvas.schemajson = JSON.stringify(this.data.schemajson);
      this.datasetsService.testConnection(editCanvas).subscribe((response) => {
        this.testLoaderBoolean = false
        this.services.message('Tested! Connected successfully');
        this.testSuccessful = true;
      },
        error => {
          this.services.message('Error!', 'error');
        });
    }
    catch (Exception) {
      this.services.message("Some error occured",'error')
    }

  }

  modifyAPISpec(dataset, name) {
    let attributes = JSON.parse(dataset.attributes)
    attributes.Headers = attributes.Headers == '' ? [] : attributes.Headers
    attributes.QueryParams = attributes.QueryParams == '' ? [] : attributes.QueryParams
    let parameters = []
    attributes.QueryParams?.forEach(param => {
      let params = {}
      params["name"] = param.key
      params["value"] = param.value
      params["description"] = param.key
      params["required"] = "true"
      params["type"] = "string"
      params["in"] = "params"
      parameters.push(params)

    })
    attributes.Headers?.forEach(param => {
      let params = {}
      params["name"] = param.key
      params["value"] = param.value
      params["description"] = param.key
      params["required"] = "true"
      params["type"] = "string"
      params["in"] = "header"
      parameters.push(params)

    })
    // }
    this.swaggerapispec.changeType("application/json")
    this.swaggerapispec.addTitle(dataset.datasource.alias)
    this.swaggerapispec.addVersion(1)
    this.swaggerapispec.addDescription(dataset.description)
    this.swaggerapispec.addDatasetAndParams(name, parameters)
    this.swaggerapispec.addUrl(window.location.origin)
    this.swaggerapispec.addRequestMethod(JSON.parse(dataset.attributes).RequestMethod.toLowerCase())
    this.swaggerapispec.addUrlPath("/api/aip/service/" + dataset.datasource.type + "/" + dataset.datasource.alias + "/" + dataset.alias)
    let apispec;
    let datasrc = dataset.datasource
    let extras;
    if (datasrc.extras) {
      extras = JSON.parse(datasrc.extras)
      let path = JSON.parse(this.swaggerapispec.getAPIPath())
      for (let ex in path) {
        extras.paths[ex] = path[ex]
      }
      apispec = JSON.stringify(extras)
    }
    else
      apispec = this.swaggerapispec.getAPISpec(true)
    datasrc.extras = apispec
    this.services.saveDatasource(datasrc).subscribe((res) => {

    })

  }

  getdatasetTypes() {
    try {
      if (this.matData && this.matData.name) {
        this.datasetsService.getDataset(this.matData.name).subscribe(res1 => {
          this.data = res1;
          if (res1.schema) {
            this.schemaBol = res1.schema;
          }
          this.services.getDatasource(this.data.datasource).subscribe(res => {
            this.data.datasource = res
          }, err => { }, () => {
            this.fetchEntityGroups();
            this.type = this.data.datasource.type;
            this.category = this.data.datasource.category;
            this.data.attributes = JSON.parse(this.data.attributes);
            this.firstForm.controls.datasourceCtrl.setValue(this.data.datasource.name);
            this.setDataSourceInitialValue();
            this.onDatasourceChange(this.data.datasource.alias)
            this.matData.schema ? this.firstForm.controls.schemaCtrl.setValue(this.data.schema) : null;

            if (this.matData.isCopy) {
              this.data.alias = '';
              this.data.name = '';
              this.data.description = '';
              delete this.data.id;
            }
          })
        });
      }
    }
    catch (Exception) {
      this.services.message("Some error occured",'error')
    }



  }

  getCache($event) {
    this.isCacheable = $event;
  }

  onDatasourceChange(datasourceAlias) {
    let datasourceName;
    this.datasourceAllOpt.forEach((opt) => {
      if (opt.viewValue == datasourceAlias)
        datasourceName = opt.value;
    })
    try {
      const datasource = this.originalDataSources.filter(d => d.name === datasourceName)[0];
      this.type = datasource.type;
      this.category = datasource.category;
      this.data.datasource = JSON.parse(JSON.stringify(datasource));
    }
    catch (Exception) {
      this.datasetsService.message("Some error occured", "error")
    }

    if (this.type === "GIT") {
      this.viewType.push({ viewValue: 'GIT View', value: 'GIT View' });
      this.data.views = "GIT View";
    }
    else {
      this.viewType = this.viewType.filter(item => item.value !== 'GIT View');
      if (this.data.views === "GIT View") {
        this.data.views = null;
      }
    }
  }

  onSchemaChange(schemaAlias?) {
    console.log("CAME IN 2")
    if (schemaAlias == "None") {
      this.isSchema = false;
      this.schemaName = null;
      this.scmValList = [];
      this.reqdColsPresent = false;
      this.data.schema = null;
      this.data.schemajson = undefined;
      this.firstForm.controls.schemaFormCtrl.setValue([]);
      this.filteredSchemaTemplates.next(this.schemaTemplates);
      return;
    }
    let schemaName;
    this.originalSchemasAllOpt.forEach((opt) => {
      if (opt.viewValue == schemaAlias)
        schemaName = opt.value;
    })
    try {
      this.isSchema = schemaName?.toString().trim().length > 0;
      this.originalSchemaTemplates = [];
      this.schemaTemplates = [];
      this.data.schemajson = undefined;
      this.firstForm.controls.schemaFormCtrl.setValue([]);
      this.filteredSchemaTemplates.next(this.schemaTemplates);
      const schema = this.originalSchemas.filter(s => s.name === schemaName)[0];
      this.schemaName = schema?.alias;
      this.scmValList = schema?.schemavalue ? JSON.parse(schema.schemavalue.toString()) : [];
      this.reqdColsPresent = (this.scmValList?.filter(ele => ele.isrequired).length > 0)
      this.data.schema = schema ? JSON.parse(JSON.stringify(schema)) : null;
      this.data.schema ? this.firstForm.controls.schemaAliasCtrl.setValue(this.data.schema.alias) : null;
      if (schema) {
        this.services.getSchemaFormsByName(schema.name).subscribe(
          resp => {
            if (resp) {
              console.log("GETTTIMG THIS SCHEMAAA--", resp)
              this.originalSchemaTemplateAlias = [];
              this.originalSchemaTemplates = resp;
              this.originalSchemaTemplates.forEach((opt) => {
                let val = { viewValue: opt.alias, value: opt.name };
                this.originalSchemaTemplatesOpt.push(val)
                this.originalSchemaTemplateAlias.push(opt.alias)
              })
              this.originalSchemaTemplates.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
              this.originalSchemaTemplates.forEach(element => {
                this.schemaTemplates.push({ "name": element.name, "alias": element.alias });
                this.filteredSchemaTemplates.next(this.schemaTemplates);
              },
                error => {
                  this.services.message("Error while fetching Form Templates",'error')
                }
              );
            }
            if (schemaAlias != this.matData.schema.alias) this.schemajsonAlias = null
            this.schemajsonAlias ? this.firstForm.controls.schemajsonAliasCtrl.setValue(this.schemajsonAlias) : null;
          });
      }
    }
    catch (Exception) {
      this.services.message("Some error occured",'error')
    }

  }
  onTemplateChange(templateAlias?) {
    let templateName;
    this.originalSchemaTemplatesOpt.forEach((opt) => {
      if (opt.viewValue == templateAlias)
        templateName = opt.value;
    })
    try {
      if (!this.data.schemajson) {
        this.data.schemajson = [];
        this.templates.forEach(templ => { this.data.schemajson.push(this.originalSchemaTemplates.filter(temp => temp.name == templ)[0]) })
      }
      let index = this.templates.findIndex(ele => ele == templateName);
      if (this.templates.length == 0 || index == -1) {
        let templ = this.originalSchemaTemplates.filter(temp => temp.name == templateName)[0]
        this.data.schemajson = [];
        this.schemajsonAlias = templ ? templ.alias : null
        this.schemajsonAlias ? this.firstForm.controls.schemajsonAliasCtrl.setValue(this.schemajsonAlias) : null
        this.data.schemajson.push(templ);
      }
      else {
        this.templates.splice(index, 1);
        this.data.schemajson = [];
        let templ = this.originalSchemaTemplates.filter(temp => temp.name == templateName)[0];
        this.data.schemajson.push(templ);
   
      }
    }
    catch (Exception) {
      this.services.message("Some error occured",'error')
    }

  }

  fetchEntityGroups() {
    const temp = [];
    this.datasetsService.getGroupsForEntity(this.data.name).subscribe(res => {
      res.forEach(element => {
        const index = this.groups.findIndex((i => i.name == element.name));
        if (index !== -1) {
          temp.push(this.groups[index].name);
          this.SelectedGroup = this.groups[index].alias;
        }
        this.firstForm.controls.groupsCtrl.setValue(temp);
      });
    }, error => { });
  }

  setValues() {
  }

  onScriptChange($event) {
    this.data.attributes.script = $event;
  }

  next() {
    if (this.firstForm.valid) {
      this.proceed = true;
    }
  }

  eventHandler($event) {
    switch ($event) {
      case 'back': this.proceed = false;
        break;
      case 'test': this.testConnection();
        break;
      case 'save': this.saveDataset();
        break;
      case 'create': this.createDataset();
        break;
    }
    if ($event === 'back') {
      this.proceed = false;
    }
  }

  omit_special_char(event) {
    if (this.isAuth)
      return false
    var k = event.charCode
    return this.isValidLetter(k);
  }

  isValidLetter(k) {
    return ((k >= 65 && k <= 90) || (k >= 97 && k <= 122) || (k >= 48 && k <= 57) || [8, 9, 13, 16, 17, 20, 95].indexOf(k) > -1)
  }

  onNext() {
    if (this.firstForm.valid) {
      this.data.groups = this.firstForm.controls.groupsCtrl.value;
      this.proceed = true;
    }
  }

  findallschema(): Promise<string> {

    return new Promise(resolve => {
      this.services.getAllSchemas()
        .subscribe(res => {
          this.originalSchemas = res;
          this.originalSchemas.forEach((opt) => {
            let val = { viewValue: opt.alias, value: opt.name };
            this.originalSchemasAllOpt.push(val)
            this.originalSchemasOpt[0] = "None"
            this.originalSchemasOpt.push(opt.alias)
          })
          this.originalSchemas = this.originalSchemas.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
          this.schemas = [];
          this.originalSchemas.forEach(element => {
            this.schemas.push(element);
          });
          this.filteredSchemas.next(this.schemas.slice());
          this.datasetsService.getDatasetForm(this.matData.name).subscribe(res => {
            this.originalDatasetForms = res
            this.templates = []
            res.forEach(form => {
              this.templates.push(form.formtemplate.name)
            })
            this.firstForm.controls.schemaFormCtrl.setValue(this.templates)
            this.setSchemaInitialValue();
          })
          resolve("Schema informtion updated");
          if (this.matData.schema != null && this.originalSchemas.length >= 1) this.onSchemaChange(this.matData.schema.alias)
            else this.originalSchemaTemplateAlias=this.originalSchemasOpt;
        });
    })
  }

  findalldatasources() {
    this.services.getDatasources()
      .subscribe(res => {
        this.originalDataSources = res;
        this.originalDataSources.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
        this.originalDataSources.forEach(element => {
          this.datasources.push(element.alias);
        });
        this.filteredDataSources.next(this.datasources.slice());
        this.originalDataSources.forEach((opt) => {
          let val = { viewValue: opt.alias, value: opt.name };
          this.datasourcesOpt.push(opt.alias)
          this.datasourceAllOpt.push(val)
        })
      }, err => { },
        () => {
          if (this.matData && this.matData.redirect) {
            this.firstForm.controls.datasourceCtrl.setValue(this.matData.datasource);
            this.onDatasourceChange(this.matData.datasource)
          }

        });
  }

  downloadCsvTemplate(buttonCase: string) {
    let finalHeader: string = "";
    this.scmValList.forEach((col) => {

      if (buttonCase === "All") {

        if (col.isrequired) finalHeader = finalHeader + col.recordcolumnname + "*";
        else finalHeader = finalHeader + col.recordcolumnname;
        finalHeader = finalHeader + ",";
      }
      else {
        if (col.isrequired) {
          finalHeader = finalHeader + col.recordcolumnname + "*";
          finalHeader = finalHeader + ",";
        }
      }

    });
    let templateBlob = new Blob([finalHeader], { type: "text/csv" });
    importedSaveAs(templateBlob, this.schemaName + " Template.csv");
  }



  fetchGroups() {
    this.datasetsService.getDatasetGroupNames(sessionStorage.getItem('organization')).subscribe((res) => {
      this.groups = res;
      this.groups.sort((a, b) => a.alias.toLowerCase() < b.alias.toLowerCase() ? -1 : 1);
      this.groups.forEach((opt) => {
        let val = { viewValue: opt.alias, value: opt.alias };
        this.groupsOptions.push(val)
      })
    });
  }

  fetchTags() {
    this.datasetsService.getMlTags().subscribe(res => {
      let fetchedtags = res;
      this.tags = res;
      fetchedtags.forEach((opt) => {
        let val = { viewValue: opt.category + ' : ' + opt.label, value: opt.category + ' : ' + opt.label };
        this.fetchedtagsOptions.push(val)
      })

    });

  }
  filterTags() {
    if (!this.tags) {
      return;
    }
    let find = this.tagsFilterCtrl.value;
    if (!find) {
      this.filteredTags.next(this.tags.slice());
      return;
    } else {
      find = find.toLowerCase();
    }
    this.filteredTags.next(
      this.tags.filter(tags => tags.toLowerCase().indexOf(find) > -1)
    );
  }
  closeModal(returnedName?) {
    this.refreshcards.emit(true);

  }
onOpenedChange(key: string, isOpen: boolean): void {
  this.isDropdownOpen[key] = isOpen;
}

}
function importedSaveAs(templateBlob: Blob, arg1: string) {
  throw new Error('Function not implemented.');
}
