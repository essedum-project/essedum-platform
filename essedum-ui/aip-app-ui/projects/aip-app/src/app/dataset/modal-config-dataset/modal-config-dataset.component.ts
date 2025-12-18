import { Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DatasetServices } from '../dataset-service';
import { Services } from '../../services/service';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { FileUploader } from 'ng2-file-upload';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { SwaggerAPISpec } from '../../DTO/swaggerapispec';
import {Location} from '@angular/common';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { RaiservicesService } from '../../services/raiservices.service';

@Component({
  selector: 'app-modal-config-dataset',
  templateUrl: './modal-config-dataset.component.html',
  styleUrls: ['./modal-config-dataset.component.scss']
})
export class ModalConfigDatasetComponent implements OnInit, OnDestroy {
  @Output() responseLink = new EventEmitter<any>();
  datasourcesOpt =[];
  originalSchemasOpt =[];
  originalSchemaTemplatesOpt =[];
  tagsOptions =[];
  edit: boolean = false;
  datasetName: any;
  editdialog: boolean = false;
  data_alias: any;
  data_description: any;
  data_type: OptionsDTO;
  data_datasource: OptionsDTO;
  data_schema: OptionsDTO;
  data_views: any;
  selectedTags:string[] = [];
  datasourceAllOpt = [];
  schemaAllOpt = [];
  nextbtn: boolean = true
  check: boolean= false;
  
  @ViewChild('ingest', { static: true }) ingest: ElementRef;

  constructor(private datasetsService: DatasetServices,
    private service: Services,
    private route: ActivatedRoute,
    
    @Inject(MAT_DIALOG_DATA) public matData1: any,
    public dialogRef: MatDialogRef<ModalConfigDatasetComponent>,
    private router: Router,
    @Inject('dataSets') private dataUrl: string,
    private dialog: MatDialog,
    private _location: Location,
    private raiService: RaiservicesService
    ) { }

  data: any = {
    alias: '',
    name: '',
    description: '',
    datasource: '',
    schema: '',
    type: 'r',
    views: '',
    attributes: {},
    expStatus: '',
    interfacetype: null,
    isAuditRequired: false,
    isPermissionManaged: false,
    isApprovalRequired: false,
    isInboxRequired: false,
    IsArchivalEnabled: false

  };
  public matData: any = {};
  isExperiment: '';       //Exp
  isPrivateDataset: '';   //Exp
  isSchema: boolean = false;
  datePipe = new DatePipe("en-US");
  schemas: any = [];
  schemaTemplates: any = [];
  datasources: any = [];
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
  returnedName: string;
  keys: any = [];
  groups: any[] = [];
  schemaBol: any;
  isAuth = true
  isDropdownOpen: { [key: string]: boolean } = {};
  testSuccessful: boolean = false;
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
  busy: Subscription
  datasets: any = [];
  filteredDatasets: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  backingDatasetCtrl = new FormControl();
  backingDatasetFilterCtrl = new FormControl();
  @ViewChild('datasetSelect', { static: false }) datasetSelect: MatSelect;
  scriptShow = false;
  script = [];
  firstForm = new FormGroup({
    alias: new FormControl(''),
    name: new FormControl(''),
    description: new FormControl(''),
    groupsCtrl: this.matData1.purpose != 'pipeline' ? new FormControl('') : new FormControl(''),
    datasourceCtrl: new FormControl('', [Validators.required]),
    viewTypeCtrl: new FormControl(''),
    schemaCtrl: new FormControl(''),
    schemaFormCtrl: new FormControl(''),
    isExperiment: new FormControl(''),      //Exp
    isPrivateDataset: new FormControl(''),   //Exp
    isAuditRequired: new FormControl(false),
    isPermissionManaged: new FormControl(false),
    isApprovalRequired: new FormControl(false),
    isInboxRequired: new FormControl(false),
    interfacetype: new FormControl(null),
    tagsDisp: new FormControl("")
  });
  proceed = false;
  nextpage:boolean = false;
  isInEdit: boolean = false;
  contentVal: boolean = false;
  isChecked: boolean = false;
  restExp;
  tags;
  customCreate:boolean=false;
  viewType = [
    {viewValue:'Table View',value:'Table View'}, {viewValue:'Json View',value:'Json View'},
    {viewValue:'Image View',value:'Image View'}, {viewValue:'Doc View',value:'Doc View'}, 
    {viewValue:'Audio View',value:'Audio View'}, {viewValue:'Pdf View',value:'Pdf View'}, 
    {viewValue:'Zip View',value:'Zip View'}, {viewValue:'Text View',value:'Text View'}, 
    {viewValue:'Folder View',value:'Folder View'}, {viewValue:'Video View',value:'Video View'}];
  swaggerapispec: SwaggerAPISpec = new SwaggerAPISpec();

  public uploader: FileUploader = new FileUploader({
    url: '/api/aip/datasets/upload',
  });

  groupsOptions =[]
  datasetUsageType = [ {viewValue:'Read Only',value:'r'}, {viewValue:'Read Write',value:'rw'}]

  ngOnInit() {
    if(this.router.url.includes('datasets') || this.router.url.includes('pipelines') || this.router.url.includes('knowledge')){
      this.customCreate = false;
    }
    else
    {
      this.customCreate = true;

    }
this.findallschema();
this.fetchGroups();
this.findalldatasources();
this.getdatasetTypes();
this.fetchTags();
if (this.router.url.includes('/initiative')) {
  this.check=true;
}
if (this.matData1.create){
  this.matData = this.matData1
  this.editdialog = true
  this.data_alias = this.data.alias
  this.data_description = this.data.description
  this.data_type = this.data.type
  this.data_datasource = this.data.datasource

  this.data_schema = this.data.schema
  this.data_views = this.data.views
  this.selectedTags = []
}
else if (this.matData1.edit) {
  this.matData = this.matData1
  this.data = this.matData.data
  this.editdialog = true
  if(this.matData.data.alias)this.data_alias = this.matData.data.alias
  if(this.matData.data.description)this.data_description = this.matData.data.description
  if(this.matData.data.type)this.data_type = this.matData.data.type
  if(this.matData.data.datasource && this.matData.data.datasource.name ){
    let index = this.datasourceAllOpt.findIndex(option => option.value ===  this.matData.data.datasource.name || option.viewValue ===  this.matData.data.datasource.name );
    this.data_datasource = this.datasourceAllOpt[index]?.viewValue.toString();
    if(this.data_datasource) this.nextbtn = false
  }
  if(this.matData.data.schema)this.data_schema = this.matData.data.schema
  if(this.matData.data.views)this.data_views = this.matData.data.views
  if(this.matData.data.tags)this.selectedTags = JSON.parse(this.matData.data.tags)
}
else{
  this.route.params.subscribe( params => this.edit = params.edit );
  this.route.params.subscribe( params => this.datasetName = params.name );
   this.datasetsService.getDataset(this.datasetName).subscribe(res=>{
    this.matData.data = res;
   })
}
  
  this.authentications();

   setTimeout(() => {
    if (this.matData.data) {
      if (typeof (this.matData.data) != "string") {
        this.data = this.matData.data
       
        this.category = this.matData.data.datasource?.category
      }
      else {
        this.matData.name = this.matData.data
      }
      this.isInEdit = true;
    }
    else {
      if (this.matData.alias) this.data.alias = this.matData.alias
    }
   }, 0);

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
   
    if(this.matData.tags)
      this.firstForm.controls.tagsDisp.setValue(JSON.parse(this.matData.tags));
    
  
  }

  authentications() {
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        const authorityArr = JSON.parse(cipAuthority);
        this.isAuth = !authorityArr.some(item => item.permission === "dataset-edit");
      }
    );
  }
  selectChange(event?) {
    if(this.data.type!=null && this.data.datasource!="" && (event!=null || this.data_views!=null)){
      this.nextbtn = false;
    }
  }

  alterInterfaceType(event){
    if(event.checked){
      this.data.interfacetype="template";
    }else{
      this.data.interfacetype=null;
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
      this.schemas.filter(schema => schema.toLowerCase().indexOf(search) > -1)
    );
  }

 
  filterSchemaTemplate() {
    if (!this.schemaTemplates) {
      return;
    }
    let search = this.schemaFilterCtrl.value;
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
    if (this.data.datasource && !this.data.datasource.alias) {
      this.originalDataSources.forEach(ele => {
        if (ele.name == this.data.datasource) {
          this.data.datasource = ele
          this.category = this.data.datasource.category;
          this.type = this.data.datasource.type;
        }
      });
    }
    this.filteredDataSources
      .pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(() => {
        if (this.dataSourceSelect) {
          this.dataSourceSelect.compareWith = (a: any, b: any) => a && b && a === b;
        }
      });
  }

  setSchemaInitialValue() {
    if (this.data.schema && !this.data.schema.alias)
      this.data.schema = this.originalSchemas.filter(sch => sch.alias == this.data.schema)[0]
    this.filteredSchemas
      .pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(() => {
        if (this.schemaSelect) {
          this.schemaSelect.compareWith = (a: any, b: any) => a && b && a === b;
        }
      });
  }


  saveDataset() {
    try {
      if (this.matData.purpose != 'pipeline') {
        this.data.alias = this.data_alias
        this.data.description = this.data_description
        const dataset = JSON.parse(JSON.stringify(this.data));
        dataset.backingDataset = dataset.backingDataset !== '' ? dataset.backingDataset : null;
        dataset.tags = JSON.stringify(this.selectedTags)
        dataset.views = this.data_views
        dataset.type = this.data_type
        if (dataset.schema && typeof (dataset.schema) == "string" && dataset.schema.toString().replace(/\s/g, '').length > 0) {
          const schema = this.originalSchemas.filter(s => s.name === dataset.schema)[0];
          dataset.schema = schema;
        }
        else if (typeof (dataset.schema) != "object") dataset.schema = undefined;
        if (this.data.schemajson) dataset.schemajson = JSON.stringify(this.data.schemajson);
        dataset.attributes["Cacheable"] = this.isCacheable;

        if ((dataset.attributes.QueryParams == undefined) || (dataset.attributes.QueryParams.length == 1 && dataset.attributes.QueryParams[0].key == "" && dataset.attributes.QueryParams[0].value == ""))
          dataset.attributes.QueryParams = "";

        if ((dataset.attributes.Headers == undefined) || (dataset.attributes.Headers.length == 1 && dataset.attributes.Headers[0].key == "" && dataset.attributes.Headers[0].value == ""))
          dataset.attributes.Headers = "";

        this.busy = this.datasetsService.createDataset(dataset).subscribe((res) => {
          this.responseLink.emit(res);
          this.returnedName = res.name;
          if(this.router.url.includes('knowledge')){
          }
          this.service.message('Saved! Created successfully');
          if (this.data.datasource.category == "REST")
            this.modifyAPISpec(this.data,this.returnedName)
          if (JSON.parse(res.expStatus) != 0) {
          }
          const temp = [];
          if (this.firstForm.controls.groupsCtrl.value != null) {
            if(Array.isArray(this.firstForm.controls.groupsCtrl.value)){
            this.firstForm.controls.groupsCtrl.value.forEach(element => {
              temp.push((JSON.parse(element))["name"]);
            });
          }
            this.datasetsService.addGroupModelEntity(this.returnedName, temp, dataset.organization).subscribe();
          }
          if(this.router.url.includes('initiative')){
            this.raiService.changeModalData(true);
          }
          else{
            this._location.back();
            }
        },
          error => {
            this.datasetsService.message('Error! Dataset not created due to ', 'error');
          });

      } else {
        this.data.alias = this.data_alias
        this.data.description = this.data_description
      
        this.data.backingDataset = this.data.backingDataset !== '' ? this.data.backingDataset : null;
        if (typeof (this.data.schema) != "object") this.data.schema = undefined;
        this.data.schemajson = JSON.stringify(this.data.schemajson)
        this.data.views = this.data_views
        this.data.tags = JSON.stringify(this.selectedTags)
        if(this.data.taskdetails){
          this.data.taskdetails = JSON.parse(this.data.taskdetails)
        }
        if(this.data.name == ""){
          this.busy = this.datasetsService.createDataset(this.data).subscribe((res) => {
            this.responseLink.emit(res);
            this.returnedName = res.name;
            this.service.message('Saved! Created successfully','success');
            if (this.data.datasource.category == "REST")
              this.modifyAPISpec(this.data,this.returnedName)
            if (JSON.parse(res.expStatus) != 0) {
            }
            this.dialogRef.close(res);

          },
            error => {
              this.datasetsService.message('Error! Dataset not created due to  ' + error,'error');
            });
        }else{
          this.datasetsService.saveDataset(this.data).subscribe((res) => {
            this.datasetsService.message('Dataset updated successfully.','success');
            this.dialogRef.close(res);
          },
          error => {
            this.datasetsService.message('Error! Dataset not updated due to  ' + error,'error');
          })
          
        }
    
      
      }
    }
    catch (Exception) {
      this.datasetsService.message("Some error occured", "Error")
    }



  }

  modifyAPISpec(dataset,name) {
    let attributes = (dataset.attributes)
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
  
    this.swaggerapispec.changeType("application/json")
    this.swaggerapispec.addTitle(dataset.datasource.alias)
    this.swaggerapispec.addVersion(1)
    this.swaggerapispec.addDescription(dataset.description)
    this.swaggerapispec.addDatasetAndParams(name, parameters)
    this.swaggerapispec.addUrl(window.location.origin)
    this.swaggerapispec.addRequestMethod(dataset.attributes.RequestMethod.toLowerCase())
    this.swaggerapispec.addUrlPath("/api/aip/service/"+dataset.datasource.type+"/"+dataset.datasource.alias+"/"+dataset.alias)
    let apispec;
    let datasrc = dataset.datasource
    let extras;
    if (JSON.stringify(JSON.parse(datasrc.extras).apispec)!="{}") {
      extras = JSON.parse(datasrc.extras)
      let path = JSON.parse(this.swaggerapispec.getAPIPath())
      for (let ex in path) {
        extras.apispec.paths[ex] = path[ex]
      }
      apispec = extras
    }
    else{
      let spec = this.swaggerapispec.getAPISpec(true)
      apispec = JSON.parse(datasrc.extras)
      apispec.apispec = JSON.parse(spec)
    }
    datasrc.extras = JSON.stringify(apispec)
    this.service.saveDatasource(datasrc).subscribe((res) => {

    })

  }

  makeRandom(lengthOfCode: number, possible: string) {
    let text = "";
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(Math.floor((window.crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1)) * possible.length));
    }
    return text;
  }

  testConnection() {
    try {
      const editCanvas = JSON.parse(JSON.stringify(this.data));
      editCanvas.backingDataset = editCanvas.backingDataset !== '' ? editCanvas.backingDataset : null;
      editCanvas.tags = JSON.stringify(this.selectedTags)
      editCanvas.views = this.data_views
      if (editCanvas.schema && editCanvas.schema.toString().replace(/\s/g, '').length > 0) {
        const schema = this.originalSchemas.filter(s => s.name === editCanvas.schema)[0];
        editCanvas.schema = schema;
      }
      else editCanvas.schema = undefined;
      if (this.data.schemajson) editCanvas.schemajson = JSON.stringify(this.data.schemajson);
      if ((editCanvas.attributes.QueryParams == undefined) || (editCanvas.attributes.QueryParams.length == 1 && editCanvas.attributes.QueryParams[0].key == "" && editCanvas.attributes.QueryParams[0].value == ""))
        editCanvas.attributes.QueryParams = "";

      if ((editCanvas.attributes.Headers == undefined) || (editCanvas.attributes.Headers.length == 1 && editCanvas.attributes.Headers[0].key == "" && editCanvas.attributes.Headers[0].value == ""))
        editCanvas.attributes.Headers = "";
      if(editCanvas.taskdetails){
        editCanvas.taskdetails = JSON.parse(editCanvas.taskdetails)
      }
      this.busy = this.datasetsService.testConnection(editCanvas).subscribe((response) => {
        this.service.message('Tested! Connected successfully');
        this.testSuccessful = true;
      },
        error => {
          this.service.message('Error!', 'error');
        });
    }
    catch (Exception) {
      this.service.message("Some error occured", 'error')
    }

  }

  closeDialog() {

    if(this.data.attributes.uploadFile){
      if(this.data.name===''){
     
        let reqBody:any = {
          uploadFilePath: this.data.attributes.uploadFile
        }
        this.datasetsService.deleteFileFromServer(reqBody).subscribe(res => {
        },
          err => {
          })
      }
    }
  }

  getdatasetTypes() {
    try {
      if (this.matData && this.matData.name) {
        this.datasetsService.getDataset(this.matData.name).subscribe(res => {
          this.data = res;
          this.fetchEntityGroups();
          this.data.attributes = JSON.parse(this.data.attributes);
          this.data.schema ? this.firstForm.controls.schemaCtrl.setValue(this.data.schema) : null;
          this.setSchemaInitialValue();
          this.matData.purpose == 'pipeline' ? this.data.datasource.name ? this.firstForm.controls.datasourceCtrl.setValue(this.data.datasource.name) : this.firstForm.controls.datasourceCtrl.setValue(this.data.datasource) : this.firstForm.controls.datasourceCtrl.setValue(this.data.datasource);
          this.setDataSourceInitialValue();
          if (this.matData.isCopy) {
            this.data.alias = '';
            this.data.name = '';
            this.data.description = '';
            delete this.data.id;
          }
        });
      }
    }
    catch (Exception) {
      this.datasetsService.message("Some error occured", "error")
    }

  }

  getCache($event) {
    this.isCacheable = $event;
  }

  findallschema() {
    this.service.getAllSchemas()
      .subscribe(res => {
        this.originalSchemas = res;
        this.originalSchemas = this.originalSchemas.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
        this.originalSchemas.forEach(element => {
          this.schemas.push(element.alias);
        });
        this.filteredSchemas.next(this.schemas.slice());
        this.originalSchemas.forEach((opt)=>{
          let val={viewValue:opt.alias,value:opt.name};
          this.originalSchemasOpt.push(opt.alias)
          this.schemaAllOpt.push(val)
        })
      });
  }

  findalldatasources() {
    this.service.getDatasources()
      .subscribe(res => {
        this.originalDataSources = res;
        this.originalDataSources.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
        this.originalDataSources.forEach(element => {
          this.datasources.push(element.alias);
        });
        this.filteredDataSources.next(this.datasources.slice());
        this.originalDataSources.forEach((opt)=>{
          let val={viewValue:opt.alias,value:opt.name};
          this.datasourcesOpt.push(opt.alias)
          this.datasourceAllOpt.push(val)
        })
        if(this.editdialog){
          if(this.matData.data.datasource && this.matData.data.datasource.name ){
            let index = this.datasourceAllOpt.findIndex(option => option.value ===  this.matData.data.datasource.name || option.viewValue ===  this.matData.data.datasource.name );
            this.data_datasource = this.datasourceAllOpt[index]?.viewValue.toString();
            if(this.data_datasource){
              this.nextbtn = false;
            }
            if(this.data_datasource){
              this.nextbtn = false;
            }
          }
        }
        
      }, err => { },
        () => {
          if (this.matData && this.matData.redirect) {
            this.firstForm.controls.datasourceCtrl.setValue(this.matData.datasource);
            this.onChanginDatasource(this.matData.datasource)
          }

        });
  }


  onTagChange(event:MatSelectChange){
  this.selectedTags = event.value;
  }

  onSchemaChange(schemaAlias) {
    let schemaName;
    this.schemaAllOpt.forEach((opt)=>{
      if(opt.viewValue == schemaAlias)
      schemaName = opt.value;
    })
    try {
      this.isSchema = true;
      this.schemaTemplates = [];
      this.originalSchemaTemplates = [];
      this.data.schemajson = undefined;
      this.filteredSchemaTemplates.next(this.schemaTemplates);
      const schema = this.originalSchemas.filter(s => s.name === schemaName)[0];
      this.data.schema = JSON.parse(JSON.stringify(schema));
      this.schemaBol = this.data.schema.name;
      if (schema) {
        this.service.getSchemaFormsByName(schema.name).subscribe(
          resp => {
            this.originalSchemaTemplates = resp;
            if (this.originalSchemaTemplates.length > 0) {
              this.originalSchemaTemplates.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
              this.originalSchemaTemplates.forEach(element => {
                this.schemaTemplates.push({"name":element.name,"alias":element.alias});
                this.filteredSchemaTemplates.next(this.schemaTemplates);
              },
                error => {
                  this.datasetsService.message("Error while fetching Form Templates", 'error')
                }
              );
            }
            this.originalSchemaTemplatesOpt=[];
            this.originalSchemaTemplates.forEach((opt)=>{
              let val={viewValue:opt.alias,value:opt.name};
              this.originalSchemaTemplatesOpt.push(val)
            })
          });
      }
    }
    catch (Exception) {
      this.datasetsService.message("Some error occured", 'error')
    }


  }
  onTemplateChange(templateName) {
    try {
      if (!this.data.schemajson) this.data.schemajson = [];
      const template = this.originalSchemaTemplates.filter(s => s.name === templateName)[0];
      if (typeof (this.data.schemajson) == "string") this.data.schemajson = JSON.parse(this.data.schemajson);
      let index = this.data.schemajson.findIndex(ele => ele.name == templateName);
      if (this.data.schemajson.length == 0 || index == -1) {
        this.data.schemajson.push(template);
      }
      else {
        this.data.schemajson.splice(index, 1);
      }
    }
    catch (Exception) {
      this.datasetsService.message("Some error occured", 'error')
    }

  }

  fetchGroups() {
    var length: any;
    this.service.getGroupsLength().subscribe(res => {
      length = res
    },
      err => { },
      () => {
        this.datasetsService.getPaginatedDatasetGroups(0, length).subscribe((res) => {
          this.groups = res;
          this.groups.forEach((opt)=>{
            let val={viewValue:opt.alias,value:opt.alias};
            this.groupsOptions.push(val)
          })
          this.groups.sort((a, b) => a.alias.toLowerCase() < b.alias.toLowerCase() ? -1 : 1);
        }, err => { },
          () => {
            if (this.matData && !this.matData.redirect && this.matData.datasource != "NA") {
              let temp = [];
              const index = this.groups.findIndex((i => i.name === this.matData.datasource));
              if (index !== -1) {
                temp.push(JSON.stringify(this.groups[index]));
              }
              this.firstForm.controls.groupsCtrl.setValue(String(temp));
            }
          });

      })
  }

  selectedz(data) {
    try {
      return JSON.stringify(data);
    }
    catch (Exception) {
      this.datasetsService.message("Some error occured", 'error')
    }

  }

  fetchEntityGroups() {
    try {
      this.datasetsService.getGroupsForEntity(this.data.name).subscribe(res1 => {
        const temp = [];
        res1.forEach(element => {
          const index = this.groups.findIndex((i => i.alias === element.alias));
          if (index !== -1) {
            temp.push(JSON.stringify(this.groups[index]));
          }
        });
        this.firstForm.controls.groupsCtrl.setValue(String(temp));
      });
    }
    catch (Exception) {
      this.datasetsService.message("Some error occured", 'error')
    }

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

  onCheckingApprover() {
    this.isChecked = !this.isChecked;
  }

  onNext() {
    
      if(!this.nextbtn) this.proceed = true;
    
  }

  fetchTags(){
    this.service.getMlTags().subscribe(res => {
    this.tags = res;  
    this.tags.forEach((opt)=>{
      let val={viewValue:opt.label,value:opt.label};
      this.tagsOptions.push(val)
    })
    });
  }
  routeBackToList() {
    if(this.editdialog){
      this.dialogRef.close();
    }else
      this._location.back();
  }

  onChanginDatasource(datasourceAlias) {
    let datasourceName;
    this.datasourceAllOpt.forEach((opt)=>{
      if(opt.viewValue == datasourceAlias)
       datasourceName = opt.value;
    })
    try {
      const datasource = this.originalDataSources.filter(d => d.name === datasourceName)[0];
      this.type = datasource.type;
      if (this.type === "GIT") {
        this.viewType.push({ viewValue: 'GIT View', value: 'GIT View' });
        this.data_views = "GIT View";
      }
      else {
        this.viewType = this.viewType.filter(item => item.value !== 'GIT View');
        if (this.data_views === "GIT View") {
          this.data_views = null;
        }
      }
      this.category = datasource.category;
      this.data.datasource = JSON.parse(JSON.stringify(datasource));
      this.selectChange()
    }
    catch (Exception) {
      this.datasetsService.message("Some error occured", 'error')
    }
    if(this.type == "S3"){
      this.viewType.push({viewValue:'Code View',value:'Code View'},{viewValue:'Log View',value:'Log View'},
      {viewValue:'Email View',value:'Email View'}
       );
    }

  }
onOpenedChange(key: string, isOpen: boolean): void {
  this.isDropdownOpen[key] = isOpen;
}



}
