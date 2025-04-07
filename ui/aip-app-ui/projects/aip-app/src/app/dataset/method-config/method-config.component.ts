import { Component, Inject, Input, ViewChild } from '@angular/core';
import { TagsComponent } from '../../tags/tags.component';
import { DatasetServices } from '../dataset-service';
import { Services } from '../../services/service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { FileUploader } from 'ng2-file-upload';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { SwaggerAPISpec } from '../../DTO/swaggerapispec';
import { saveAs as importedSaveAs } from "file-saver";

export class NameAndAlias {
  name: string;
  alias: string
}
@Component({
  selector: 'app-method-config',
  templateUrl: './method-config.component.html',
  styleUrls: ['./method-config.component.scss']
})
export class MethodConfigComponent {
  templates: any;
  originalDatasetForms: any;
  variable: any;
  tags: TagsComponent;
  filteredTags: any;
  tagsFilterCtrl: any;
  datasetNamebackup

  constructor(private datasetsService: DatasetServices,
    private groupService: Services,
    public schemaRegistryService: Services,
    // private loader: LoaderService,
    private datasourceService: Services,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public matDataInp: any,
    public dialogRef: MatDialogRef<MethodConfigComponent>,
    private dialog: MatDialog) {

  }

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
    isArchivalEnabled: false,
    archivalConfig: false,
    isInboxRequired: '',
    tags: '',
  };
  isExperiment: boolean = false;       //Exp
  isPrivateDataset: boolean = false;   //Exp
  isSchema: boolean = false;
  schemas: any = [];
  datasources: any = [];
  schemaTemplates: any = [];
  originalDataSources: any = [];
  originalSchemas: any = [];
  originalSchemaTemplates: any[] = [];
  isCacheable: any = false;
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
  keys: any = [];
  schemaBol: any;
  groups: any[] = [];
  @Input('dataset') matData: any;
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
    datasourceCtrl: new FormControl(''),
    schemaCtrl: new FormControl(''),
    schemaFormCtrl: new FormControl([]),
    isExperiment: new FormControl(''),      //Exp
    isPrivateDataset: new FormControl(''),   //Exp
    isAuditRequired: new FormControl(''),
    isPermissionManaged: new FormControl(''),
    isApprovalRequired: new FormControl(''),
    isArchivalEnabled: new FormControl(''),
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
  isPopup: boolean = false;
  schema
  template
  restExp
  
  reqdColsPresent: boolean = true;
  swaggerapispec: SwaggerAPISpec = new SwaggerAPISpec();

  public uploader: FileUploader = new FileUploader({
    url: '/datasets/upload',
    // authToken: 'Bearer ' + JSON.parse(localStorage.getItem('authenticationToken'))
  });

  ngOnInit() {
    if(this.matDataInp && this.matDataInp.name){
      this.isPopup=true;
      this.matData=this.matDataInp;
    }
    this.datasetNamebackup = this.data?.name
    try{
    this.matData["tags"]=JSON.parse(this.matData["tags"])
    }catch(ex:any){console.log("Cannot parse tags : ",this.matData["tags"])}
    
    this.authentications();

    if (this.matData) {
      this.data = this.matData
      if (this.matData.schema)
        this.schemaName = this.matData.schema;
      if (this.data.expStatus != 0 && this.data.expStatus != null)
        this.isExperiment = true;       //Exp
      if (this.data.expStatus == 3 || this.data.expStatus == 1)
        this.isPrivateDataset = true;   //Exp
      this.firstForm.controls.datasourceCtrl.setValue(this.matData.datasource.name);
      this.matData.schema ? this.firstForm.controls.schemaCtrl.setValue(this.matData.schema) : null;
      this.firstForm.controls.isArchivalEnabled.setValue(this.matData.isArchivalEnabled);
      this.firstForm.controls.archivalConfig.setValue(this.matData.archivalConfig);
      this.firstForm.controls.tagsDisp.setValue(this.matData.tags);
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
    this.datasourceService.getPermission("cip").subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes("dataset-edit")) this.isAuth = false;
      }
    );
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
    try{
      this.filteredSchemas
      .pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(() => {
        if (this.schemaSelect) {
          this.schemaSelect.compareWith = (a: any, b: any) => a && b && a === b;
        }
      });
    let selectedSchema = this.originalSchemas.filter(schema => schema.name == this.firstForm.controls.schemaCtrl.value)[0];
    if (selectedSchema) {
      this.isSchema = true;
      this.schemaName = selectedSchema.alias;
    }
    if (selectedSchema) {
      this.schemaRegistryService.getSchemaFormsByName(selectedSchema.name).subscribe(
        resp => {
          this.originalSchemaTemplates = resp;
          this.originalSchemaTemplates.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
          this.originalSchemaTemplates.forEach(element => {
            this.schemaTemplates.push({"name":element.name,"alias":element.alias});
            this.filteredSchemaTemplates.next(this.schemaTemplates);
          },
            error => {
              this.datasetsService.message("Error while fetching Form Templates", "IAMP")
            }
          );

        });
    }

    if (selectedSchema && selectedSchema.schemavalue){
      this.scmValList = JSON.parse(selectedSchema.schemavalue.toString());
      this.reqdColsPresent = (this.scmValList?.filter(ele=> ele.isrequired).length>0)
    }
    }
    catch(Exception){
    this.datasetsService.message("Some error occured", "Error")
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
    try{
      if (this.matData.purpose != 'pipeline') {
        const editCanvas = JSON.parse(JSON.stringify(this.data));
        editCanvas.backingDataset = editCanvas.backingDataset !== '' ? editCanvas.backingDataset : null;
        editCanvas.attributes["Cacheable"] = this.isCacheable;
        // editCanvas.attributes = JSON.stringify(editCanvas.attributes);
        if (editCanvas.schema && typeof (editCanvas.schema) == "string" && editCanvas.schema.toString().replace(/\s/g, '').length > 0) {
          const schema = this.originalSchemas.filter(s => s.name === editCanvas.schema)[0];
          editCanvas.schema = schema;
        }
        else
          if (typeof (editCanvas.schema) != "object")
            editCanvas.schema = undefined;
        if (this.data.schemajson && typeof (editCanvas.schemajson) != "string") 
          editCanvas.schemajson = JSON.stringify(this.data.schemajson);
        // delete editCanvas["groups"]
        editCanvas.taskdetails = editCanvas.taskdetails?JSON.parse(editCanvas.taskdetails):[]
        editCanvas.tags = JSON.stringify(this.firstForm.controls.tagsDisp.value)
        this.datasetsService.saveDataset(editCanvas).subscribe((res) => {
          let dataset = res
          this.datasetsService.message('Saved!', 'Updated successfully');
          if (this.data.datasource.category == "REST"){
            this.datasourceService.getCoreDatasource(this.data.datasource.name,sessionStorage.getItem("organization")).subscribe(res => {
              dataset.datasource = res
              //this.modifyAPISpec(dataset,dataset.name)
            })
          }
          
          if (this.firstForm.controls.groupsCtrl.value != null) {
            const grouplist = this.firstForm.controls.groupsCtrl.value;
            this.datasetsService.addGroupModelEntity(this.data.name, grouplist, this.data.organization).subscribe();
          }
        },
          error => {
            this.datasetsService.message('Error!', 'Dataset not created due to  ' + error);
          });
      }
    }
    catch(Exception){
    this.datasetsService.message("Some error occured", "Error")
    }
    if(this.isPopup)
      this.closeDialog();
  }

  testConnection() {
    try{
      const editCanvas = JSON.parse(JSON.stringify(this.data));
      editCanvas.backingDataset = editCanvas.backingDataset !== '' ? editCanvas.backingDataset : null;
      // editCanvas.attributes = JSON.stringify(editCanvas.attributes);
      editCanvas.taskdetails = editCanvas.taskdetails?JSON.parse(editCanvas.taskdetails):[]
      if (editCanvas.schema && editCanvas.schema.toString().replace(/\s/g, '').length > 0) {
        const schema = this.originalSchemas.filter(s => s.name === editCanvas.schema)[0];
        editCanvas.schema = schema;
      }
      else editCanvas.schema = undefined;
      editCanvas.tags = JSON.stringify(this.firstForm.controls.tagsDisp.value)
      if (this.data.schemajson && typeof (editCanvas.schemajson) != "string") editCanvas.schemajson = JSON.stringify(this.data.schemajson);
      this.datasetsService.testConnection(editCanvas).subscribe((response) => {
        this.datasetsService.message('Tested!', 'Connected successfully');
        this.testSuccessful = true;
      },
        error => {
          this.datasetsService.message('Error!', error);
          // this.loader.hide();
        });
    }
    catch(Exception){
    this.datasetsService.message("Some error occured", "Error")
    }
  
  }

  modifyAPISpec(dataset,name) {
    let attributes = JSON.parse(dataset.attributes)
    attributes.Headers=attributes.Headers==''? []:attributes.Headers
    attributes.QueryParams=attributes.QueryParams==''? []:attributes.QueryParams
    let parameters = []
    // if(attributes.QueryParams == true || attributes.QueryParams && attributes.Headers == true ){
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
    if(dataset.datasource.alias=="CodeBuddy")
      this.swaggerapispec.addUrlPath("/api/aip/codebuddy/service/v1/"+dataset.alias)
    else
      this.swaggerapispec.addUrlPath("/api/aip/service/"+dataset.datasource.type+"/"+dataset.datasource.alias+"/"+dataset.alias+"/"+sessionStorage.getItem('organization')+"/true")
    let apispec;//(this.requestbodytype == 'application/json')
    let datasrc = dataset.datasource
    let extras;
    if (datasrc.extras) {
      extras = JSON.parse(datasrc.extras).apispec
      let path = JSON.parse(this.swaggerapispec.getAPIPath())
      for (let ex in path) {
        extras.paths[ex] = path[ex]
      }
      apispec = JSON.stringify(extras)
    }
    else
      apispec = this.swaggerapispec.getAPISpec(true)
    datasrc.extras.apispec = apispec
//console.log("datasrc=", datasrc)
    this.datasourceService.saveDatasource(datasrc).subscribe((res) => {

    })

  }

  getdatasetTypes() {
    try{
      if (this.matData && this.matData.name) {
        this.datasetsService.getDataset(this.matData.name).subscribe(res1 => {
          this.data = res1;
          if (res1.schema) {
            this.schemaBol = res1.schema;
          }
          this.datasourceService.getDatasource(this.data.datasource).subscribe(res => {
            this.data.datasource = res
          }, err => { }, () => {
            this.fetchEntityGroups();
            this.type = this.data.datasource.type;
            this.category = this.data.datasource.category;
            try{
            this.data.attributes = JSON.parse(this.data.attributes);
            }catch(ex:any){console.log("Already parsed")}
            this.firstForm.controls.datasourceCtrl.setValue(this.data.datasource.name);
            this.setDataSourceInitialValue();
            this.onDatasourceChange(this.data.datasource.name)
            this.matData.schema ? this.firstForm.controls.schemaCtrl.setValue(this.data.schema) : null;
            // this.matData.schemajson && this.data.schemajson && Array.isArray(JSON.parse(this.data.schemajson)) ? this.firstForm.controls.schemaFormCtrl.setValue([...JSON.parse(this.data.schemajson).map(ele => ele.templateName)]) : null;
            
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
    catch(Exception){
    this.datasetsService.message("Some error occured", "Error")
    }

    
   
  }

  getCache($event) {
    this.isCacheable = $event;
  }

  onDatasourceChange(datasourceName) {
    try{
      let datasource;
      this.datasourceService.getDatasource(datasourceName).subscribe(res => {
        datasource = res
      }, err => { }, () => {
        if (datasource) {
          this.type = datasource.type;
          this.category = datasource.category;
          this.data.datasource = JSON.parse(JSON.stringify(datasource));
          this.data.datasource.type = this.type;
          this.data.datasource.category = this.category;
        }
      })
    }
    catch(Exception){
    this.datasetsService.message("Some error occured", "Error")
    }
   
  }

  onSchemaChange(schemaName?) {
    try{
      this.isSchema = schemaName?.toString().trim().length > 0;
      this.originalSchemaTemplates = [];
      this.schemaTemplates = [];
      this.data.schemajson = undefined;
      this.firstForm.controls.schemaFormCtrl.setValue([]);
      this.filteredSchemaTemplates.next(this.schemaTemplates);
      const schema = this.originalSchemas.filter(s => s.name === schemaName)[0];
      this.schemaName = schema?.alias;
      this.scmValList = schema?.schemavalue ? JSON.parse(schema.schemavalue.toString()) : [];
      this.reqdColsPresent = (this.scmValList?.filter(ele=> ele.isrequired).length>0)
      this.data.schema = schema ? JSON.parse(JSON.stringify(schema)) : null;
      if (schema) {
        this.schemaRegistryService.getSchemaFormsByName(schema.name).subscribe(
          resp => {
            if (resp) {
              this.originalSchemaTemplates = resp;
              this.originalSchemaTemplates.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
              this.originalSchemaTemplates.forEach(element => {
                this.schemaTemplates.push({"name":element.name,"alias":element.alias});
                this.filteredSchemaTemplates.next(this.schemaTemplates);
              },
                error => {
                  this.datasetsService.message("Error while fetching Form Templates", "IAMP")
                }
              );
            }
  
          });
  
      }
    }
    catch(Exception){
    this.datasetsService.message("Some error occured", "Error")
    }
   
  }
  onTemplateChange(templateName) {
    try{
      if (!this.data.schemajson) {
        this.data.schemajson = [];
        this.templates.forEach(templ=>{this.data.schemajson.push(this.originalSchemaTemplates.filter(temp=>temp.name==templ)[0])})
    }
      let index = this.templates.findIndex(ele => ele == templateName.name);
      if (this.templates.length == 0 || index == -1) {
        let templ = this.originalSchemaTemplates.filter(temp=>temp.name==templateName.name)[0]
        this.data.schemajson.push(templ);
      }
      else {
        this.templates.splice(index, 1);
        this.data.schemajson.splice(index,1);
        // this.data.schemajson = this.templates
      }
    }
    catch(Exception){
    this.datasetsService.message("Some error occured", "Error")
    }
   
  }

  fetchEntityGroups() {
    const temp = [];
    this.datasetsService.getGroupsForEntity(this.data.name).subscribe(res => {
      res.forEach(element => {
        const index = this.groups.findIndex((i => i.name == element.name));
        if (index !== -1) {
          temp.push(this.groups[index].name);
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
      this.schemaRegistryService.getAllSchemas()
        .subscribe(res => {
          this.originalSchemas = res;
          this.originalSchemas = this.originalSchemas.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
          this.schemas = [];
          this.originalSchemas.forEach(element => {
            this.schemas.push(element);
          });
          this.filteredSchemas.next(this.schemas.slice());
          this.datasetsService.getDatasetForm(this.matData.name).subscribe(res=>{
            this.originalDatasetForms = res
            this.templates = []
            res.forEach(form=>{
              this.templates.push(form.formtemplate.name)
            })
            this.firstForm.controls.schemaFormCtrl.setValue(this.templates)
            this.setSchemaInitialValue();
          })
          resolve("Schema informtion updated");
        });
    })
  }

  findalldatasources() {
    this.datasourceService.getAdaptersByOrg()
      .subscribe(res => {
        this.datasources = res;
        this.filteredDataSources.next(this.datasources.slice());
        if (this.matData && this.matData.redirect) {
          this.firstForm.controls.datasourceCtrl.setValue(this.matData.datasource.name);
          this.onDatasourceChange(this.matData.datasource.alias)
        }
      });
  }

  downloadCsvTemplate(buttonCase:string) {
    let finalHeader: string = "";
    this.scmValList.forEach((col) => {
      
        if(buttonCase === "All"){
          
          if (col.isrequired)finalHeader = finalHeader + col.recordcolumnname + "*";
          else finalHeader = finalHeader + col.recordcolumnname;
          finalHeader = finalHeader + ",";
        }
        else{
          if (col.isrequired){
            finalHeader = finalHeader + col.recordcolumnname + "*";
            finalHeader = finalHeader + ",";
          }
        }
      
    });
    let templateBlob = new Blob([finalHeader], { type: "text/csv" });
    importedSaveAs(templateBlob, this.schemaName + " Template.csv");
  }

  openFormEditor() {
    const schema = this.originalSchemas.filter(schema => schema.name == this.firstForm.controls.schemaCtrl.value)[0];
    // const dialogRef = this.dialog.open(ModalConfigSchemaComponent, {
    //   width: '80%',
    //   height: '95%',
    //   data: {
    //     isAutoExtract: false,
    //     name: schema.name
    //   }
    // });
    // dialogRef.afterClosed().subscribe(async result => {
    //   if (result.data.schema)
    //     this.data.schema = result.data.schema
    //   if (result.data.formTempalte) {
    //     let arr: any[] = result.data.formTemplate;
    //     // this.data.schemajson = arr.filter(data => {
    //     //   if (this.data.schemajson.templateName == data.templateName)
    //     //     return true;
    //     // });
    //     this.data.schemajson.forEach((ele, index) => {
    //       let idx = arr.findIndex(ele1 => ele.templateName.name == ele1.templateName.name);
    //       if (idx > -1) {
    //         this.data.schemajson.splice(index, 1, arr[idx]);
    //       }
    //     })
    //   }
    //   if (result.data.schema) {
    //     await this.findallschema().then(onfulfilledresp => {
    //       if (onfulfilledresp == "Schema informtion updated") {
    //         this.onSchemaChange(schema.name);
    //       }
    //     })
    //   }
    // })
  }

  openArchival() {
    // const dialogRef = this.dialog.open(DatasetArchivalComponent, {
    //   width: '80%',
    //   height: '95%',
    //   data: {
    //     data: this.data
    //   }
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     this.data.archivalConfig = result.data.archivalConfig
    //     this.datasetsService.message("Please save dataset", "Save Dataset")
    //   }
    // })
  }

  fetchGroups() {
    this.datasetsService.getDatasetGroupNames(sessionStorage.getItem('organization')).subscribe((res) => {
      this.groups = res;
      this.groups.sort((a, b) => a.alias.toLowerCase() < b.alias.toLowerCase() ? -1 : 1);
    });
  }
 
  fetchTags(){
    this.datasetsService.getMlTags().subscribe(res => {
   
        this.tags = res;
        
      });
    
  }
  filterTags() {
    // if (!this.tags) {
    //   return;
    // }
    // let find = this.tagsFilterCtrl.value;
    // if (!find) {
    //   this.filteredTags.next(this.tags.slice());
    //   return;
    // } else {
    //   find = find.toLowerCase();
    // }
    // this.filteredTags.next(
    //   this.tags.filter(tags => tags.toLowerCase().indexOf(find) > -1)
    // );
  }

  ngDoCheck(){
    if(this.datasetNamebackup!=this.matData?.name){
      this.datasetNamebackup = this.matData.name
      this.ngOnInit()
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
