//
//  @ 2018 Infosys Limited, Bangalore, India. All Rights Reserved.
//  Version: 1.0
//  Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
//  this Program is protected by copyright laws, international treaties and  other pending or existing intellectual property
//  rights in India, the United States, and other countries. Except as expressly permitted, any unauthorized reproduction, storage,
//  transmission in any form or by any means(including without limitation electronic, mechanical, printing, photocopying,
//  recording, or otherwise), or any distribution of this program, or any portion of it, may result in severe civil and
//  criminal penalties, and will be prosecuted to the maximum extent possible under the law.
//

import { Component, OnInit, OnChanges, Inject, Output, EventEmitter, ViewChild, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { FormControl } from '@angular/forms';
import { Services } from '../../services/service';
// import { MessageService } from '../../sharedModule/service/message.service';
// import { StreamingServicesService } from '../../entities/streaming-services/streaming-services.service';
// import { ModalInfoComponent, PaginationAttributes } from '../../extras/modal-info/modal-info.component';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { map, startWith, take, takeUntil } from 'rxjs/operators';
import * as ace from 'ace-builds';
import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';
// language package, choose your own
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';
// ui-theme package
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-dracula';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-beautify';
// import { element } from 'protractor';
// import { PluginService } from '../plugin/plugin.service';
// import { ModalPublishnamePopupComponent } from '../modal-publishname-popup/modal-publishname-popup.component';
// import { Dataset } from '../../extras/datasets';
// import { NativeScriptDialogComponent } from '../native-script-dialog/native-script-dialog.component';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { NativeScriptDialogComponent } from '../../native-script/native-script-dialog/native-script-dialog.component';
import { Dataset } from '../../dataset/datasets';
import { ModalConfigDatasetComponent } from '../../dataset/modal-config-dataset/modal-config-dataset.component';
import { ModalInfoComponent } from '../modal-info/modal-info.component';
import { AdapterServices } from '../../adapter/adapter-service';
// import { DatasetsService } from '../../entities/datasets/datasets.service';
// import { DatasourceService } from '../../entities/datasource/datasource.service';
// import { ModalConfigDatasetComponent } from '../../components/modal-config-dataset/modal-config-dataset.component';
// import { SchemaDetailsComponent } from '../../components/schema-details/schema-details.component';
// import { ApiService } from 'projects/iamp-iecp/src/public-api';
// import { PaginationAttributes } from 'projects/icip-adp/src/lib/components/mashup-view-wrapper/mashup-view-wrapper.component';

// import { DatasetdataService } from 'projects/iamp-iecp/src/lib/service/datasetdata.service';
const THEME = 'ace/theme/dracula';
const LANG = 'ace/mode/python';

interface Elementt {
  name: string;
  value: string;
  type: string;
  alias: string;
  children?: Elementt[];
  index: string;
}
interface UINode {
  name: string;
  children: UINode[];
  addCounter: boolean;
}
export class PaginationAttributes {
  page: any
  size: any
  sortEvent: any
  sortOrder: any
}
@Component({
  selector: 'app-modal-view-edit-properties',
  templateUrl: './modal-view-edit-properties.component.html',
  styleUrls: ['./modal-view-edit-properties.component.scss']
})
export class ModalViewEditPropertiesComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  // azuredatasets: any;
  vertexdatasets: any;
  models: any;
  datasetchoosetype = 'create';
  allDatasources: any = [];
  connectionList: any = [];
  selectedDatasource
  showupload = false
  createdDataset: any;
  apiValues;
  apiValue = []
  apiValues1;
  nme = []
  resultvalue: any;
  resp: any;
  separatorKeysCodes = [ENTER, COMMA];
  public addOnBlur: boolean = true;
  public tagsList: Array<string> = ['OTHER'];
  public selectable: boolean = true;
  public removable: boolean = true;
  public views: boolean = false;
  public view: boolean = false;
  dataset: any = {};
  rule
  rules
  columnList: any[];
  id: any;
  attribute: any;
  datasetsFetched: any;
  elements: any;
  editorBeautifys: any;
  scriptCodes: string;
  Bucket_list: any;
  Object_list: any[];
  Bucket_selected: any;
  Bucketname: any;
  amazondatasets = [];
  selection: any
  eLoc: string[];
  apiValue2 = []
  apiValue1 = []
  awsdata: any;
  mllist: any;
  trainSets: any;
  NERTypeTrainSet: any[];
  ClassifierTrainModelSet: any;
  customTags: any[];
  gotselected: any;
  gotAttributes: boolean;
  PClassifierDataSet: any;
  rulep: any;
  gotselecteds: boolean;
  labels_icmm: any;
  class_key = [];


  Object_key: any;
  question_input: string = '';
  class_key2 = [];
  selectedConnection: any;
  connectionAvaibale: boolean = false;
  constructor(
    // private datasetDataTransfer: DatasetdataService,
    public dialogRef: MatDialogRef<ModalViewEditPropertiesComponent>,
    // public messageService: MessageService,
    // private streamingServicesService: StreamingServicesService,
    // private datasetsService: DatasetsService,
    // private datasourceService: DatasourceService,
    // private pluginService: PluginService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: Services,
    private adapterServices: AdapterServices,
    // private apiService: ApiService,
    public dialog: MatDialog,
    @Inject('envi') private baseUrl: string
  ) {

    this.filteredChips = this.chipCtrl.valueChanges.pipe(
      startWith(<string>null),
      map((tag: string | null) => tag ? this.filter(tag) : this.allTags.slice()));
  }
  lang = 'python';
  options: any = { maxLines: 1000, printMargin: false };
  private editorBeautify;
  @ViewChild('editor', { static: false }) codeEditorElmRef: ElementRef;
  @ViewChild('editors', { static: false }) codeEditorElmRefs: ElementRef;
  private codeEditor: ace.Ace.Editor;
  private codeEditors: ace.Ace.Editor;
  keys = [];
  fileToUpload: File = null;
  inputP = JSON.parse(sessionStorage['user']).user_email
  selected: any = '';
  schemas: any = [];
  pluginData: any = [];
  plugin: any;
  addQues: boolean = false;
  result = {
    action: 'save',
    element: null,
    newDataset: ''
  };
  event = { first: 0, rows: 1000, sortField: null, sortOrder: 1, filters: null, multiSortMeta: null };
  colList: any = [];
  choosenFile = "";
  inputColumns = new FormControl();
  inputColumn = new FormControl();
  // azuredataset = new FormControl();
  vertexdataset = new FormControl();
  chipCtrl = new FormControl();
  S3Uri
  Bucketlist
  Objectlist
  model = new FormControl();
  isCode = false;
  isCodes = false;
  scriptCode: any;
  actualData = [];
  datasets: Dataset[] = [];
  originalDatasets: Dataset[] = [];
  selectedDataset: any = '';
  datasetList: any = [];
  originalDatasetList: any = [];
  isStreaming: boolean = false;
  scriptShow: boolean = false;
  scriptShows: boolean = false;
  flagR: boolean = false;
  attributes: any = {};
  isAuth: boolean = true;
  allTags = this.tagsList;
  filteredChips: Observable<any[]>;
  datasetCtrl = new FormControl();
  datasetFilterCtrl = new FormControl();
  schemaCtrl = new FormControl();
  schemaFilterCtrl = new FormControl();
  filteredDatasets: ReplaySubject<Dataset[]> = new ReplaySubject<Dataset[]>(1);
  filteredSchemas: ReplaySubject<String[]> = new ReplaySubject<String[]>(1);
  adapterFilterCtrl = new FormControl();
  connectionFilterCtrl = new FormControl();
  filteredAdapters: ReplaySubject<String[]> = new ReplaySubject<String[]>(1);
  filteredConnection: ReplaySubject<String[]> = new ReplaySubject<String[]>(1);
  adaptersList: any = [];
  dsetListForSelectedAdapter: any = [];
  methodFilterCtrl = new FormControl();
  filteredMethods: ReplaySubject<String[]> = new ReplaySubject<String[]>(1);
  selectedAdapter: any;
  selectedAdapterMethod: any;
  adaptermethodAvaibale: boolean = false;
  @ViewChild('datasetSelect', { static: false }) datasetSelect: MatSelect;
  @ViewChild('schemaSelect', { static: false }) schemaSelect: MatSelect;
  protected _onDestroy = new Subject<void>();

  treeData: Elementt[] = []
  dataSource = new MatTreeNestedDataSource<Elementt>();
  dataSet = new MatTreeNestedDataSource<Elementt>();
  treeControl = new NestedTreeControl<Elementt>(node => node.children);
  treeControl1 = new NestedTreeControl<UINode>(node => node.children);
  public uploader: FileUploader = new FileUploader({
    url: this.baseUrl + '/file/upload'
  });
  inputFilter: any;
  rootCounter: boolean = false;
  addNode(node: UINode, key: string) {
    node.children.push({ name: this.inputFilter, children: [], addCounter: false })
    node.addCounter = false;
    this.dataSource1.data = null;
    this.dataSource1.data = this.data.element.attributes[key];
    //console.log(this.data.element.attributes[key]);
    this.inputFilter = '';

  }
  addToRoot(key: string) {
    this.data.element.attributes[key].push({ name: this.inputFilter, children: [], addCounter: false });
    this.rootCounter = false;
    this.dataSource1.data = null;
    this.dataSource1.data = this.data.element.attributes[key];
    this.inputFilter = '';
    //console.log(this.data.element.attributes[key]);

  }
  //   Tree:treeNode;
  dataSource1 = new MatTreeNestedDataSource<UINode>();


  hasChild = (_: number, node: UINode) => !!node.children && node.children.length > 0;


  ngOnInit() {
    // try{
    this.eLoc = ['Default Bucket', 'Custom Bucket']
    this.keys = []
    this.authentications();
    this.actualData = JSON.parse(JSON.stringify(this.data));
    if (this.data.element.attributes) {
      Object.keys(this.data.element.attributes).forEach(keyValue => {
        if (keyValue === 'script') {
          this.scriptShow = true;
          this.isCode = true;
          const code = this.data.element.attributes[keyValue];
          let codeStr = '';
          for (let i = 0; i < code.length; i++) {
            codeStr += code[i];
          }
          // this.scriptCode = codeStr.replaceAll('\\n','\n');
          this.scriptCode = codeStr;

        }

        else if (keyValue === 'env_yaml') {
          this.scriptShows = true;
          this.isCodes = true;
          const code = this.data.element.attributes[keyValue];
          let codeStr = '';
          for (let i = 0; i < code.length; i++) {
            if (code.includes('\n'))
              codeStr += code[i];
            else
              codeStr += code[i] + '\n';
          }
          this.data.element.attributes[keyValue] = codeStr;
          this.scriptCodes = codeStr;
        }
        else {
          this.keys.push(keyValue);
        }
        if (this.data.element.formats[keyValue] === 'dropdown') {
          if (this.data.element.attributes[keyValue].includes(','))
            this.data.element.attributes[keyValue] = this.data.element.attributes[keyValue].split(',');
        }
      });
      if (this.data.element.attributes.adaptermethod?.name) {
        this.adaptermethodAvaibale = true;
      }
      if (this.data.element.attributes.connections?.alias) {
        this.connectionAvaibale = true;
      }
    }
    this.ngOnChanges();
    this.datasetFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterDatasets();
      });
    this.schemaFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterSchemas();
      });
    this.adapterFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterAdapters();
      });
    this.methodFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterMethods();
      });
    this.connectionFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterConnections();
      });
    this.uploader.onErrorItem = (item, response, status, headers) => this.onErrorItem(item, response, status, headers);
    this.uploader.onSuccessItem = (item, response, status, headers) => this.onSuccessItem(item, response, status, headers);
    // }
    // catch(Exception){
    // this.messageService.error("Some error occured", Exception)
    // }

    this.fetchAdapters();
    this.fetchDatasources();
  }

  authentications() {
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        // pipeline-edit/update permission
        if (cipAuthority.includes("pipeline-edit")) this.isAuth = false;
      }
    );
  }

  isOneQuestion(key: string) {
    return typeof this.data.element.attributes[key] == 'string' ? true : false;
  }

  addQuestion(key: string) {
    if (typeof this.data.element.attributes[key] == 'string') {
      let tmp = this.data.element.attributes[key];
      this.data.element.attributes[key] = [];
      this.data.element.attributes[key].push(tmp);
    }
    this.data.element.attributes[key].push(this.question_input);
    this.question_input = '';
    this.addQues = !this.addQues;
  }
  invert() {
    this.addQues = !this.addQues;
  }

  changedData() {
  }
  filter(name: string) {
    return this.allTags.filter(tag =>
      tag.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }
  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  // uploadFileToActivity() {
  //   this.streamingServicesService.postFile(this.fileToUpload).subscribe(data => {
  //     this.data.element.attributes['spark-jars'] = data;
  //   }, error => {
  //    
  //   });
  // }

  choosenFileChanged() {
    this.uploader.queue.forEach(element => {
      if (element.file.name.toUpperCase().endsWith(".JAR")) this.choosenFile += element.file.name + ",";
    });
    this.choosenFile = this.choosenFile.slice(0, -1);
  }

  uploads() {
    this.uploader.queue.forEach(element => {
      this.uploader.uploadItem(element);
    });
    // this.uploader.uploadItem(this.uploader.queue[this.uploader.queue.length - 1]);
    // this.data.element.attributes['spark-jars'] = this.uploader.queue[this.uploader.queue.length - 1].file.name;
  }

  onSuccessItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    this.data.element.attributes['spark-jars'] = response + ",";
  }

  onErrorItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    const error = response;
    this.service.message('Error! while uploading file', 'error');
  }
  remove(tag: any): void {
    let index = this.tagsList.indexOf(tag);

    if (index >= 0) {
      this.tagsList.splice(index, 1);
    }
  }

  add(event: MatChipInputEvent): void {
    let input = event.input;
    let value = event.value;

    // Add our tag
    if ((value || '').trim()) {
      this.tagsList.push(value.trim());
      if (this.gotselected == true) {
        this.data.element.attributes['ApplyOn'] = JSON.stringify(this.tagsList)
      }
      else if (this.gotAttributes == true) {
        this.data.element.attributes['Attributes Used'] = JSON.stringify(this.tagsList)
      }
      else {
        this.data.element.attributes['Keywords'] = JSON.stringify(this.tagsList)
      }


    }
  }
  autoCompleteSearch(searchText, list, elementName = undefined) {

    if (typeof searchText == 'string') {
      if (elementName) {
        const filterValue = searchText.toLowerCase();
        var filteredList = list.filter((option) => {
          return option[elementName]?.toLowerCase().includes(filterValue)
        })
        return filteredList
      }
      else {
        const filterValue = searchText.toLowerCase();
        var filteredList = list.filter((option) => {
          return String(option).toLowerCase().includes(filterValue)
        })

        return filteredList
      }
    }
    else return []



  }
  filterDatasets() {
    if (!this.datasetList) {
      return;
    }
    let search = this.datasetFilterCtrl.value;
    if (!search) {
      this.filteredDatasets.next(this.datasetList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredDatasets.next(
      this.datasetList.filter(dataset => dataset.alias.toLowerCase().indexOf(search) > -1)
    );
    //console.log(this.filteredDatasets)
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

  ngAfterViewInit() {
    // this.setInitialValue();

    ace.require('ace/ext/language_tools');
    if (this.codeEditorElmRef != undefined) {
      const element = this.codeEditorElmRef.nativeElement;
      const editorOptions = this.getEditorOptions();

      this.codeEditor = ace.edit(element, editorOptions);
      this.codeEditor.setTheme(THEME);
      this.codeEditor.getSession().setMode(LANG);
      this.codeEditor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
      });
      this.codeEditor.setShowFoldWidgets(true);
      this.editorBeautify = ace.require('ace/ext/beautify');
      this.codeEditor.setValue(this.scriptCode);
    }

    if (this.codeEditorElmRefs != undefined) {
      const element = this.codeEditorElmRefs.nativeElement;
      const editorOptions = this.getEditorOptions();

      this.codeEditors = ace.edit(element, editorOptions);
      this.codeEditors.setTheme(THEME);
      this.codeEditors.getSession().setMode(LANG);
      this.codeEditors.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
      });
      this.codeEditors.setShowFoldWidgets(true);
      this.editorBeautifys = ace.require('ace/ext/beautify');
      this.codeEditors.setValue(this.scriptCodes);
    }

  }
  getEditorOptions(): Partial<ace.Ace.EditorOptions> {
    const basicEditorOptions: Partial<ace.Ace.EditorOptions> = {
      highlightActiveLine: true,
      minLines: 14,
      maxLines: Infinity,
      displayIndentGuides: true
    };
    return basicEditorOptions;
  }

  public beautifyContent() {
    if (this.codeEditor && this.editorBeautify) {
      const session = this.codeEditor.getSession();
      this.editorBeautify.beautify(session);
    }
    else if (this.codeEditors && this.editorBeautifys) {
      const sessions = this.codeEditors.getSession();
      this.editorBeautifys.beautify(sessions);
    }
  }

  getCode() {
    const code = this.codeEditor.getValue();

  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
  setDatasetInitialValue() {
    this.filteredDatasets
      // .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        if (this.datasetSelect) {
          this.datasetSelect.compareWith = (a: any, b: any) => a && b && a === b;
        }
      });
  }
  setSchemaInitialValue() {
    this.filteredSchemas
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        if (this.schemaSelect) {
          this.schemaSelect.compareWith = (a: any, b: any) => a && b && a === b;
        }
      });
  }
  ngOnChanges() {
    this.findallschema();
    this.fetchDatasets();
    this.fetchColVal();
    if (this.keys.length >= 1) {
      this.keys.forEach(key => {
        if (key === 'schema') {
          this.selected = this.data.element.attributes[key];
          // this.schemaCtrl.setValue(this.selected);
        }
        if (key === 'inputCol') {
          this.inputColumn.setValue(this.data.element.attributes[key]);
        }
        if (key === 'inputCols') {
          this.inputColumns.setValue(this.data.element.attributes[key].split(','));
        }
        // if (key === 'azuredataset') {
        //   this.fetchAzureDatasets()
        //   this.azuredataset.setValue(this.data.element.attributes[key]);
        // }
        // if(key == 'S3URI'){
        //   if(this.selection == undefined){
        //     this.fetchAmazonData() 
        //     this.S3Uri = this.data.element.attributes[key]
        //   }
        //  else{
        //   this.fetchBucket()
        //   this.getObject('aiplatdata1')
        //  }
        //   }

        if (key === 'vertexdataset') {
          this.fetchVertexDatasets()
          this.vertexdataset.setValue(this.data.element.attributes[key]);
        }
        if (this.data.element.formats[key] === 'Taglist') {
          this.tagsList = JSON.parse(this.data.element.attributes[key])
        }
      });
    }
    this.schemaCtrl.setValue(this.selected);
    this.setSchemaInitialValue();
  }
  fetchBucket() {
    let obj = {
      "userId": this.inputP,
      "platform": "amazon"
    }
    this.service.postCallObservableFn("https://ai-platform/cloudBaseUrl/storages/list_buckets/", obj).subscribe(res => {
      this.Bucket_list = res['user_buckets']
      //  this.awsfilteredvalue.next( this.Bucket_list.slice()) 
    })
  }
  getObject(id) {
    this.Object_list = []
    this.Bucket_selected = id
    let obj = {
      "userId": this.inputP,
      "platform": "amazon",
      "bucketName": this.Bucketlist
    }
    this.service.postCallObservableFn("https://ai-platform/cloudBaseUrl/storages/list_objects/", obj).subscribe(res => {
      this.Bucketname = res

      for (var k of this.Bucketname[this.Bucket_selected]) {
        if (k.slice(k.length - 3) == 'csv') {
          this.Object_list.push(k)
        }
      }
    })
  }
  public fetchAmazonData() {

    let obj = {
      "userId": 'admin@infosys.com',
      "platform": "amazon"
    }
    this.amazondatasets = []
    this.datasetsFetched = this.service.getAllDatasets();
    if (this.datasetsFetched == undefined) {
      this.service.getDatasets().subscribe((res) => {
        this.service.setAllDatasets(res);
        this.datasetsFetched = this.service.getAllDatasets();
        this.setobj(obj)
      })
    }
    else {
      this.setobj(obj)
    }
  }
  // fetchAzureDatasets(){
  //   // let Uid=JSON.parse(sessionStorage.user).user_email
  //   let obj ={
  //     "userId": "admin@infosys.com",
  //     "platform":"Azure"
  //   }
  //   this.azuredatasets = []
  //   // this.azuredatasets = [{"displayName":"test1"},{"displayName":"test2"}]
  //   this.datasetsFetched = this.datasetsService.getAllDatasets();
  //   if (this.datasetsFetched == undefined) {
  //     this.datasetsService.getDatasets().subscribe((res) => {
  //       this.datasetsService.setAllDatasets(res);
  //       this.datasetsFetched = this.datasetsService.getAllDatasets();
  //       this.setobj(obj)
  //     })
  //   }
  //   else{
  //     this.setobj(obj)
  //   }


  // }
  setobj(obj) {
    let datasets
    let result = this.datasetsFetched.filter(each => each.alias == "Fetch_Dataset_API")
    if (result[0] != undefined && result[0] != '') {
      let datasetDetailsModified = this.service.getDatasetAttribute(result[0], obj);
      this.service.getSpecificDatasetDetail(datasetDetailsModified, this.flagR).subscribe(res => {
        datasets = res
        // if (obj.platform == 'Azure') {
        //   datasets.forEach(r => {
        //     this.azuredatasets.push(r.displayName)
        //   })
        // }
        if (obj.platform == 'Vertex-AI') {
          datasets.forEach(r => {
            this.vertexdatasets.push(r.displayName)
          })
        }
        else if (obj.platform.toLowerCase() == 'amazon') {
          datasets.forEach(r => {
            this.amazondatasets.push(r.displayName)
          })
        }
      })
    }


  }
  fetchVertexDatasets() {
    let obj = {
      "userId": "admin@infosys.com",
      "platform": "Vertex-AI"
    }
    this.vertexdatasets = []

    this.datasetsFetched = this.service.getAllDatasets();
    if (this.datasetsFetched == undefined) {
      this.service.getDatasets().subscribe((res) => {
        this.service.setAllDatasets(res);
        this.datasetsFetched = this.service.getAllDatasets();
        this.setobj(obj)
      })
    }
    else {
      this.setobj(obj)
    }


  }
  reload(key, formats?) {
    this.flagR = true
    // if(key==='azuredataset'){
    //   this.fetchAzureDatasets()
    // }
    if (key === 'vertexdataset') {
      this.fetchVertexDatasets()
    }
    // else if(key==='model'){
    //   this.fetchModel()
    // }
    else if (key === 'S3URI') {
      this.fetchAmazonData()
    }
    else if (key === 'restdataset' || formats == 'restdataset') {
      this.setapiobj(this.data.element.formats)
    }
    else if (key == 'dataset' && formats == 'restdataset') {
      this.setapiobj(this.data.element.formats)
    }
    else if (key == 'restdataset1' || formats == 'restdataset1') {
      this.setapi1obj(this.data.element.formats)
    }
    else if (key == 'restdataset2' || formats == 'restdataset2') {
      this.setapi2obj(this.data.element.formats)
    }
  }
  fetchModel() {
    // let Uid=JSON.parse(sessionStorage.user).user_email
    let obj = {};

    this.models = [];
    this.nme = []
    this.datasetsFetched = this.service.getAllDatasets();
    if (this.datasetsFetched == undefined) {
      this.service.getDatasets().subscribe((res) => {
        this.service.setAllDatasets(res);
        this.datasetsFetched = this.service.getAllDatasets();
      })
    }

    let result = this.datasetsFetched.filter(each => each.alias == "Fetch_Models_API")
    if (this.data.element.formats.type == "Azure") {
      obj = {
        "userId": "admin@infosys.com",
        "platform": "Azure"
      }
    }
    else if (this.data.element.formats.type == "vertex-ai") {
      obj = {
        "userId": "admin@infosys.com",
        "platform": "vertex-ai"
      }
    }
    if (result[0] != undefined && result[0] != '') {
      let datasetDetailsModified = this.service.getDatasetAttribute(result[0], obj);
      this.service.getSpecificDatasetDetail(datasetDetailsModified, this.flagR).subscribe(res => {
        let datasets: any = res
        datasets.forEach(r => {
          this.models.push(r.displayName)
          this.nme.push(r.name)
        })
      })
    }
  }


  getApiValues(formats) {
    //console.log("format", formats)
    let Uid = JSON.parse(sessionStorage['user']).user_email
    let url = formats['api'];
    let obj = formats['payload'];
    let resp;
    this.service.postCallObservableFn(url, obj).subscribe(res => {
      if (formats['response']) {
        this.apiValues = []
        this.resultvalue = [];
        if (typeof res == "string") {
          resp = JSON.parse(<string>res)
        }
        else {
          resp = res;
        }

        resp.forEach(rsp => {
          this.apiValues.push(rsp[formats['response']])
          this.resultvalue.push(rsp._id)
        })
      }
      else {
        this.apiValues = res
      }
    }, error => {
      //console.log(error);
    })
  }
  usermap(name, formats) {
    for (let key in formats) {
      if (formats[key] == 'Customdropdown') {
        for (var i2 of this.class_key) {
          delete this.data.element.attributes[i2]
        }
        this.class_key = []
        let class_value = []
        let obj
        //console.log(formats[key])
        let k = formats[key]
        for (var i of formats[k])
          if (i.variable.toLowerCase() == (name.value.toLowerCase())) {
            obj = i.values
          }


        this.class_key = Object.keys(obj)
        class_value = Object.values(obj)
        for (var i2 of this.class_key) {
          this.data.element.attributes[i2] = obj[i2]
        }


      }
      else if (formats[key] == 'Customdropdown2') {
        for (var i2 of this.class_key2) {
          delete this.data.element.attributes[i2]
        }
        this.class_key2 = []
        let class_value2 = []
        let obj
        //console.log(formats[key])
        let k = formats[key]
        for (var i of formats[k])
          if (i.variable.toLowerCase() == (name.value.toLowerCase())) {
            obj = i.values
          }
        this.class_key2 = Object.keys(obj)
        class_value2 = Object.values(obj)
        for (var i2 of this.class_key) {
          this.data.element.attributes[i2] = obj[i2]
        }


      }
    }
  }
  usermapping(name, formats) {
    for (let key in formats) {
      if (formats[key] == "userapi") {
        for (let i = 0; i < this.apiValues.length; i++) {
          if (this.apiValues[i] == name.value) {
            this.data.element.formats.payload1.validateUser.classifierID = this.resultvalue[i];
            this.getApiValues1(this.data.element.formats);
            break;
          }
        }
      }
      if (formats[key] == "Mlflow") {
        if (name.value == "image") {
          this.data.element.formats.dropValues1 = ["single_label_classification", "multi_label_classification"]
        }
        else if (name.value == "tabular" || name.value == "text") {
          this.data.element.formats.dropValues1 = ["single_label_classification", "multi_label_classification", "regression"]
        }
      }


    }
  }

  viewData(dataset: any) {
    let pagination: PaginationAttributes = new PaginationAttributes();
    pagination.page = 0;
    pagination.size = 1;
    this.service.getPaginatedDetails(dataset, pagination).subscribe(resp => {
      this.columnList = [];
      for (let col in resp[0]) {
        this.columnList.push(col)
      }
    })
  }

  getApiValues1(formats) {
    let Uid = JSON.parse(sessionStorage['user']).user_email
    let url = formats['api1'];
    let obj = formats['payload1'];
    let resp;
    this.service.postCallObservableFn(url, obj).subscribe(res => {
      if (formats['response1']) {
        this.apiValues1 = []
        if (typeof res == "string") {
          resp = JSON.parse(<string>res)
        }
        else {
          resp = res;
        }
        resp.forEach(rsp => {
          this.apiValues1.push(rsp[formats['response1']])
        })
      }
      else {
        this.apiValues1 = res
      }
    }, error => {
      //console.log(error);
    })
  }
  onChange(e) {
    if (e.checked == true) {
      this.view = true;
    } else {
      this.view = false;
    }
  }
  onChanged(e) {
    if (e.checked == true) {
      this.views = true;
    } else {
      this.views = false;
    }
  }
  dropChange(val, val1?: any, val2?: any) {
    if (val === 'inputCol') {
      this.data.element.attributes['inputCol'] = this.inputColumn.value;
    }
    // else if (val === 'azuredataset') {
    //   this.data.element.attributes['azuredataset'] = this.azuredataset.value;
    // }
    // else if ( val =='Default Bucket'){
    //   this.fetchAmazonData()
    //  }
    // else if ( val =='Custom Bucket'){
    //  this.fetchBucket()
    // }
    // else if (val == 'Bucketlist') {
    //   this.getObject(this.Bucketlist)
    //   this.data.element.attributes['S3URI'] ="s3://"+this.Bucketlist
    // }
    // else if (val == 'Objectlist') {
    //   this.data.element.attributes['S3URI'] ="s3://"+this.Bucketlist+'/' + this.Objectlist 
    // }

    else if (val === 'vertexdataset') {
      this.data.element.attributes['vertexdataset'] = this.vertexdataset.value;
    }
    else if (val == 'Enter tag') {
      if (val1.displayName == 'Section') {
        this.gotselected = true
      }
      this.data.element.attributes[val] = val1.displayName
    }
    else if (val == 'Select Lookup Dictionary') {
      let k = val2.filter(each => {
        if (each.displayName == val1.displayName) {
          return each
        }
      })
      this.data.element.attributes[val] = k[0].value
    }
    else if (val == 'Label') {
      let k = []
      k.push(val1)
      this.data.element.attributes['Label'] = k
    }
    else {
      this.data.element.attributes['inputCols'] = this.inputColumns.value.join();
    }
  }
  dropChanges(val1, val, formats?) {
    if (val1 == 'Dataset') {
      this.S3Uri = this.awsdata.filter(each => {
        if (each.displayName == val) {
          return each.url
        }
      }
      )


      this.data.element.attributes['Dataset'] = this.S3Uri[0].url


    }
    else if (val1 == 'Mlflowdataset') {
      this.S3Uri = this.mllist.filter(each => each.displayName == val)
      this.data.element.attributes['Mlflowdataset'] = this.S3Uri[0]._id

    }
  }

  datasetChooseType(val) {
    if (val == "create") {
      // this.showDatasets()
      this.createDatasets()
      this.datasetchoosetype = "create"
    }
    else if (val == "chooseexisting") {
      this.fetchDatasets()
      this.datasetchoosetype = "chooseexisting"
    }
    else if (val == "upload") {
      this.fetchDatasources()
      this.datasetchoosetype = "upload"
    }
  }

  findallschema() {
    this.service.listSchemas()
      .subscribe(res => {
        this.schemas = res?.map(ele => ele?.alias);
        this.schemas.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
        this.filteredSchemas.next(this.schemas.slice());
      });
  }

  saveProperties() {
    this.result.action = 'save';
    if (this.isCode) {
      const code = this.codeEditor.getValue();
      if (code !== '') {
        // const codeArray = [code]
        const codetxt = code;
        const codeArray = codetxt.replace(/"/g, "\"").split('\n');
        for (let i = 0; i < codeArray.length - 1; i++) {
          // codeArray[i] = codeArray[i] + '\\n';
          // codeArray[i] = codeArray[i] + String.fromCharCode(10);
          codeArray[i] = codeArray[i] + '\r';

        }
        this.data.element.attributes['script'] = codeArray;
      }
    }
    if (this.isCodes) {
      const code = this.codeEditors.getValue();
      if (code !== '') {
        const codetxt = code;
        const codeArray = codetxt.replace(/"/g, "\"").split('\n');
        this.data.element.attributes['env_yaml'] = codeArray;
      }
    }
    this.result.element = this.data.element;
    if (this.result.element.classname == "BatchConfig" && this.result.element.formats.type != "BatchPrediction") {
      for (let i = 0; i < this.apiValue.length; i++) {
        if (this.apiValue[i] == this.result.element.attributes.model) {
          this.result.element.attributes.model = this.nme[i];
        }
      }
    }
    if (this.result.element.name == "Para  Classifier" || this.result.element.name == "Document  Classifier") {
      for (let i = 0; i < this.apiValues.length; i++) {
        if (this.apiValues[i] == this.result.element.attributes.classifierconfig) {
          this.result.element.attributes.classifierconfig = this.resultvalue[i];
        }
      }
    }
    if (this.result.element.formats.type == "Mlflow" && this.result.element.name == "Dataset  Extractor") {
      this.dataset = this.result.element.attributes.dataset;
      this.viewData(this.dataset);
    }
    if (this.result.element.formats.type == "MlflowAutoml") {
      this.result.element.formats.payload.domain = this.result.element.attributes.domain;
      this.result.element.formats.payload.experiment_name = this.result.element.attributes.experiment_name;
      this.result.element.formats.payload.model_name = this.result.element.attributes.model_name;
      this.result.element.formats.payload.label = this.result.element.attributes.OutputColumn;
      if (this.attribute) {
        this.result.element.formats.payload.train_dataset = this.attribute;
      }
      this.result.element.formats.payload.time_limit = this.result.element.attributes.time_limit;
      this.getApiValues(this.result.element.formats);
    }
    if (this.result.element.formats.type == "MlflowEndpoint") {
      this.result.element.formats.payload.name = this.result.element.attributes.endpoint_name;
      this.result.element.formats.payload.model_name = this.result.element.attributes.model_name;
      this.result.element.formats.payload.version = this.result.element.attributes.version;
      this.getApiValues(this.result.element.formats);
    }
    // if (this.result.element.formats.type == "BatchPrediction") {
    //   this.result.element.formats.payload.name = this.result.element.attributes.endpoint_name;
    //   this.result.element.formats.payload.batch_data = this.result.element.attributes.dataset.id;
    //   this.getApiValues(this.result.element.formats);
    // }

    this.dialogRef.close(this.result);
  }

  deleteElement() {
    this.result.action = 'delete';
    this.result.element = this.data.element;
    this.dialogRef.close(this.result);
  }

  publish() {
    // this.service.getPlugin('DragAndDrop').subscribe(resp => {
    //   let response = JSON.parse(resp);
    //   this.pluginData = JSON.parse(response.pluginData);
    // },
    //   error => { },
    //   () => {
    //     const dialogRef = this.dialog.open(ModalPublishnamePopupComponent, {
    //       width: "400px",
    //       disableClose: true,
    //       data: this.pluginData
    //     });
    //     dialogRef.afterClosed().subscribe((result) => {
    //       if (result) {
    //         this.publishElement(result.name);
    //       }
    //     });
    //   })
  }

  publishElement(name) {
    this.plugin = {
      "requiredJars": [],
      "formats": {
        "arguments": "text"
      },
      "classname": name,
      "name": name,
      "alias": name,
      "attributes": {
        "arguments": ""
      },
      "id": 0,
      "category": "TransformerConfig",
      "inputEndpoints": ["in"],
      "outputEndpoints": ["out"]
    }
    this.service.updatePluginScript(name, this.scriptCode, 'Transformer').subscribe(resp => {
      this.service.message("Plugin Script Published", "success")
    },
      error => {
        this.service.message("Publish failed", "error")
      },
      () => {

        this.pluginData.push(this.plugin)
        this.service.updatePlugin('genericPython', this.pluginData, null).subscribe(resp => { })
        this.onCloseEditProperties();
      })
  }

  fetchColVal() {
    this.colList = [];
    // fetching from context
    if (this.data.element.context) {
      this.data.element.context.forEach(connAttr => {
        Object.keys(connAttr).forEach(keyValue => {
          if (keyValue === 'dataset') {
            if (connAttr[keyValue] && connAttr[keyValue] !== '') {
              if (connAttr[keyValue].name) {
                this.attribute = connAttr[keyValue].attributes;
                this.fetchSchemaColNames(connAttr[keyValue].schema['name']);
              }
              else {
                this.service.getDataset(connAttr[keyValue]).subscribe(res => {
                  if (res) {
                    const dataset: any = res
                    this.fetchSchemaColNames(dataset.schema ? dataset.schema['name'] : dataset.schema);
                  }
                });
              }
            }
          } else if (keyValue === 'schema') {
            this.fetchSchemaColNames(connAttr[keyValue]);
          } else if (keyValue === 'outputCol' && connAttr[keyValue] !== '') {
            this.colList.push(connAttr[keyValue]);
          } else if (keyValue === 'outputCols' && connAttr[keyValue] !== '') {
            this.colList = this.colList.concat(connAttr[keyValue].split(','));
          } else if (keyValue === 'outConnAttr') {
            Object.keys(connAttr[keyValue]).forEach(keys => {
              if (keys === 'schema') {
                this.fetchSchemaColNames(connAttr[keyValue][keys]);
              }
              if (keys === 'dataset') {
                this.colList.push(connAttr[keyValue].name)

              }
            });
          }
          // if (keyValue === 'azuredataset') {
          //   this.fetchAzureDatasets()
          //   this.azuredataset.setValue(this.data.element.attributes[keyValue]);
          // }
          else if (keyValue === 'vertexdataset') {
            this.fetchVertexDatasets()
            this.vertexdataset.setValue(this.data.element.attributes[keyValue]);
          }
          else if (keyValue === 'Bucket') {
            this.fetchBucket()
            this.Bucketlist.setValue(this.data.element.attributes[keyValue]);
          }
          this.colList = this.colList.filter((el, i, a) => i === a.indexOf(el));
        });
      });
    }
    if (this.data.element.formats) {
      for (let format in this.data.element.formats) {
        if (this.data.element.formats[format] === 'restdataset') {
          this.datasetsFetched = this.service.getAllDatasets();
          if (this.datasetsFetched == undefined) {
            this.service.getDatasets().subscribe((res) => {
              this.service.setAllDatasets(res);
              this.datasetsFetched = this.service.getAllDatasets();
              this.setapiobj(this.data.element.formats)
            })
          }
          else {
            this.setapiobj(this.data.element.formats)
          }
        }
        else if (this.data.element.formats[format] === 'restdataset1') {
          // this.fetchICMMDatasets()
          // this.getApiValues(this.data.element.formats);
          this.datasetsFetched = this.service.getAllDatasets();
          if (this.datasetsFetched == undefined) {
            this.service.getDatasets().subscribe((res) => {
              this.service.setAllDatasets(res);
              this.datasetsFetched = this.service.getAllDatasets();
              this.setapi1obj(this.data.element.formats)
            })
          }
          else {
            this.setapi1obj(this.data.element.formats)
          }
        }
        else if (this.data.element.formats[format] === 'restdataset2') {
          // this.fetchICMMDatasets()
          // this.getApiValues(this.data.element.formats);
          this.datasetsFetched = this.service.getAllDatasets();
          if (this.datasetsFetched == undefined) {
            this.service.getDatasets().subscribe((res) => {
              this.service.setAllDatasets(res);
              this.datasetsFetched = this.service.getAllDatasets();
              this.setapi1obj(this.data.element.formats)
            })
          }
          else {
            this.setapi1obj(this.data.element.formats)
          }
        }
        else if (this.data.element.formats[format] == 'api') {
          // this.fetchICMMDatasets()
          this.getApiValues(this.data.element.formats);
        }
        else if (format == 'Attributes Used') {

          this.gotAttributes = true

        }
        else if (this.data.element.formats[format] == 'tree') {
          this.dataSource1.data = this.data.element.attributes[format]

        }
        else if (this.data.element.formats[format] == 'list') {
          if (this.data.element.attributes[format] == '') {
            this.treeData = []
          }
          else {
            this.treeData = this.data.element.attributes[format];
          }
        }
        else if (this.data.element.formats[format] == 'api1') {
          // this.fetchICMMDatasets()
          this.getApiValues1(this.data.element.formats);
        }
      }
    }
  }
  setapiobj(formats) {
    let result = this.datasetsFetched.filter(each => each.alias == formats['restdatasetname'])
    if (result[0] != undefined && result[0] != '') {
      let datasetDetailsModified = this.service.getDatasetAttribute(result[0], formats['payload']);
      this.service.getSpecificDatasetDetail(datasetDetailsModified, this.flagR).subscribe(res => {
        let datasets = res
        if (this.data.element.attributes.hasOwnProperty('Dataset')) {
          this.awsdata = datasets
          if (this.data.element.attributes['Dataset'] != '') {
            this.Bucket_list = this.data.element.attributes['Dataset'].split("/").pop()
            //console.log(this.data.element.attributes['Dataset'].split("/").pop())
          }
        }
        datasets.forEach(r => {
          if (r[formats['response']] != undefined || r[formats['response']] == '') {
            if (this.data.element.attributes.hasOwnProperty('Dataset')) {
              //console.log(r[formats['response']].split('.').pop())
              if (r[formats['response']].split('.').pop() == 'csv') {
                this.apiValue.push(r[formats['response']])
              }

            }
            else if (this.data.element.attributes.hasOwnProperty('Mlflowdataset')) {

              this.mllist = datasets
              this.apiValue.push(r[formats['response']])

            }


            else {
              this.apiValue.push(r[formats['response']])
            }


            if (this.data.element.classname == "BatchConfig" && this.data.element.formats.type != "BatchPrediction") {
              this.nme.push(r.name)
            }
          }
        })
        if (this.data.element.attributes["Mlflowdataset"] != undefined) {
          let k = datasets.filter(each => each._id == this.data.element.attributes["Mlflowdataset"])
          this.Bucket_list = k[0].displayName
        }
      })
    }
  }
  setapi1obj(formats) {
    let result = this.datasetsFetched.filter(each => each.alias == formats['restdatasetname1'])
    if (result[0] != undefined && result[0] != '') {
      let datasetDetailsModified = this.service.getDatasetAttribute(result[0], formats['payload1']);
      this.service.getSpecificDatasetDetail(datasetDetailsModified, this.flagR).subscribe(res => {
        let datasets = res

        datasets.forEach(r => {
          if (r[formats['response1']] != undefined || r[formats['response1']] == '') {
            this.apiValue1.push(r[formats['response1']])
          }
        })

      })
    }
  }
  setapi2obj(formats) {
    let result = this.datasetsFetched.filter(each => each.alias == formats['restdatasetname2'])
    if (result[0] != undefined && result[0] != '') {
      let datasetDetailsModified = this.service.getDatasetAttribute(result[0], formats['payload2']);
      this.service.getSpecificDatasetDetail(datasetDetailsModified, this.flagR).subscribe(res => {
        let datasets = res

        datasets.forEach(r => {
          if (r[formats['response2']] != undefined || r[formats['response2']] == '') {
            this.apiValue2.push(r[formats['response2']])
          }
        })

      })
    }
  }
  displayAutoComplete(option) {
    if (option == null) return ""
    else if (option == undefined) return ""
    else if (option.displayName) return option.displayName
    else return option
  }


  fetchSchemaColNames(val: any) {
    // try{
    this.service.getSchemas(val).subscribe(res => {
      let schemavalue = JSON.parse(res.schemavalue)
      if (schemavalue.length >= 1) {
        schemavalue.forEach(element => {
          if (element.recordcolumnname) {
            this.colList.push(element.recordcolumnname);
          }
        });
      }
    });
    // }
    // catch(Exception){
    // this.messageService.error("Some error occured", Exception)
    // }


  }

  onCloseEditProperties() {
    if (this.result.action != 'create') {
      this.result.action = 'noAction';
      this.result.element = this.actualData;
    }
    if (this.isCode) {
      const code = this.codeEditor.getValue();
      if (code !== '') {
        // const codeArray = [code]
        const codetxt = code;
        const codeArray = codetxt.replace(/"/g, "\"").split('\n');
        for (let i = 0; i < codeArray.length - 1; i++) {
          // codeArray[i] = codeArray[i] + '\\n';
          // codeArray[i] = codeArray[i] + String.fromCharCode(10);
          codeArray[i] = codeArray[i] + '\r';


        }
        this.data.element.attributes['script'] = codeArray;
      }
    }
    if (this.isCodes) {
      const code = this.codeEditors.getValue();
      if (code !== '') {
        const codetxt = code;
        const codeArray = codetxt.replace(/"/g, "\"").split('\n');
        this.data.element.attributes['env_yaml'] = codeArray;
      }
    }
    this.dialogRef.close(this.result);

  }

  checkSchema(val) {
    if (val.name === 'schema') {
      this.selected = val.value;
      return true;
    }
    return false;
  }

  showSchema(val) {
    // this.dialog.open(SchemaDetailsComponent, {
    //   disableClose: true,
    //   data: {
    //     isAutoExtract: false,
    //     name: val
    //   }
    // });
  }

  showInfo() {
    var dataset: Dataset

    if (typeof (this.data.element.attributes.dataset) == "string") {
      dataset = new Dataset()
      dataset.name = this.data.element.attributes.dataset
    }
    else {
      if (this.data.element.attributes.dataset.datasetType)
        delete this.data.element.attributes.dataset.datasetType
      dataset = this.data.element.attributes.dataset
      // dataset.name = null
      // if(dataset.schema!=null){
      //   this.schemaService.searchSchemasByName(dataset.schema).subscribe(res=>{
      //     dataset.schema = res[0]
      //   },err=>{},
      //   ()=>{
      dataset.organization = sessionStorage.getItem('organization');
      delete dataset["groups"]
      //console.log(dataset);
      this.dlgOpn(dataset);
      //   })
      // }
    }
  }

  fetchDatasets() {
    this.service.getDatasets().subscribe(response => {
      this.datasets = response;
      this.datasets.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
      this.originalDatasets = this.datasets;
      if (this.data.element.name === 'Dataset  Loader') {
        this.datasets = this.datasets.filter((element) => element.type === 'rw');
      }
      this.datasetList = this.datasets
      this.originalDatasetList = this.datasetList;
      this.filteredDatasets.next(this.datasetList.slice());
      if (this.keys.length >= 1) {
        if (this.keys.find(k => k === 'dataset')) {
          const name = this.data.element.attributes['dataset'];
          this.selectedDataset = this.datasets.filter(dataset => dataset.name === name)[0];
          this.datasetCtrl.setValue(name);
          this.setDatasetInitialValue();
        }
      }
    },
      error => this.service.message('Error! Due to: ' + error, 'error')
    );
  }

  fetchDatasources() {
    this.service.getDatasources().subscribe(resp => {
      this.allDatasources = resp
      this.connectionList = resp
    })
  }
  createDatasets() {
    const dialogRef = this.dialog.open(ModalConfigDatasetComponent, {
      height: '90%',
      width: '60%',
      disableClose: true,
      data: {
        purpose: 'pipeline',
        create: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      let dataset;
      dataset = result
      this.service.getDatasource(dataset.datasource.name ? dataset.datasource.name : dataset.datasource).subscribe(resp => {
        dataset.datasource = resp
      }, err => { },
        () => {
          if (result != null) {
            this.result.action = 'create';
            this.data.element.attributes['dataset'] = dataset
            this.result.element = this.data.element
            this.onCloseEditProperties();
          }
        })

    });
  }
  showDatasets() {
    const dialogRef = this.dialog.open(ModalConfigDatasetComponent, {
      height: '90%',
      width: '60%',
      disableClose: true,
      data: {
        purpose: 'pipeline',
        data: this.data.element.attributes.dataset,
        edit: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      let dataset;
      dataset = result
      this.service.getDatasource(dataset.datasource.name ? dataset.datasource.name : dataset.datasource).subscribe(resp => {
        dataset.datasource = resp
      }, err => { },
        () => {
          if (result != null) {
            this.result.action = 'create';
            this.data.element.attributes['dataset'] = dataset
            this.result.element = this.data.element
            this.onCloseEditProperties();
          }
        })

    });
  }

  onDatasetChange(e) {
    this.selectedDataset = this.datasets.filter(dataset => dataset.name === e.name)[0];
    this.data.element.attributes.dataset = this.selectedDataset;
  }

  onChangeStreaming() {
    // try{
    this.isStreaming = !this.isStreaming;
    if (this.isStreaming) {
      this.datasets = this.originalDatasets.filter((ele) => {
        this.attributes = JSON.parse(ele.attributes);
        this.attributes.isStreaming = 'true';
      });
      this.datasetList = [];
      this.datasets.forEach(dataset => {
        this.datasetList.push(dataset.name);
      });
    } else {
      this.datasets = this.originalDatasets.filter((ele) => ele.type === 'rw');
      this.datasetList = [];
      this.datasets.forEach(dataset => {
        this.datasetList.push(dataset.name);
      });
    }
    // }
    // catch(Exception){
    // this.messageService.error("Some error occured", Exception)
    // }

  }

  dlgOpn(dataset: Dataset) {
    this.dialog.open(ModalInfoComponent, {
      width: '90%',
      height: '95%',
      disableClose: true,
      data: dataset
    });
  }

  displayDialog(button, name, value, type, index, alias, key) {
    const dialogRef = this.dialog.open(NativeScriptDialogComponent, {
      height: '50%',
      width: '50%',
      // maxWidth: '50%',
      disableClose: false,
      data: {
        "button": button,
        "name": name,
        "value": value,
        "type": type,
        "index": index,
        "alias": alias,
        "source": "azure"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        if (button == 'ADD') {
          this.addElementInTree(result.index, result.name, result.value, result.type, result.alias);
        } else {
          if (button == 'MODIFY') {
            this.modifyNode(result.index, result.name, result.value, result.type, result.alias);
          }
        }
        this.refreshTree();
        this.data.element.attributes[key] = this.treeData
      }
    });
  }

  deleteNodeInTree(tree: Elementt[], element: Elementt) {
    for (var i = 0, j = tree.length; i < j; i++) {
      if (tree[i] == element) {
        tree.splice(i, 1);
        break;
      }
    }
    return tree;
  }

  modifyElementInTree(tree: Elementt[], element, name, value, type, alias) {
    for (var i = 0, j = tree.length; i < j; i++) {
      if (tree[i] == element) {
        tree[i].name = name;
        tree[i].value = value;
        tree[i].type = type;
        tree[i].alias = alias;
        break;
      }
    }
    return tree;
  }

  addElementInTree(index, name, value, type, alias): string {
    var newNode: Elementt = {
      name: name,
      value: value,
      type: type,
      alias: alias,
      index: "" + (this.treeData.length > 0 ? this.treeData.length + 1 : 1)
    }
    this.treeData.push(newNode);
    return newNode.index;
  }

  modifyNode(index, key, value, type, alias) {
    this.treeData = this.modifyElementInTree(this.treeData, this.returnTreeElement(this.treeData, index), key, value, type, alias);
    this.refreshTree();
  }

  refreshTree() {
    this.dataSource.data = null;
    this.dataSource.data = this.treeData;
  }

  returnTreeElement(tree: Elementt[], index): Elementt {
    for (var i = 0, j = tree.length; i < j; i++) {
      if (tree[i].index == index) {
        return tree[i];
      }
    }
    return null;
  }

  getAlias(node) {
    return node.alias ? node.alias : node.value
  }

  deleteNode(index) {
    this.treeData = this.deleteNodeInTree(this.treeData, this.returnTreeElement(this.treeData, index));
    this.refreshTree();
  }

  getDatasource(key) {
    if (this.data.element.attributes[key] == '')
      this.dataSource.data = []
    else
      this.dataSource.data = this.data.element.attributes[key]
    return this.dataSource
  }

  uploadDataset() {
    let dataset = this.data.element.attributes.dataset
    dataset.type = "rw"
    let existedDataset = this.datasets.filter(dset => dset.name == dataset.name)[0]
    if (!existedDataset) {
      if (dataset.schema == "") dataset.schema = null
      if (dataset.backingDataset == "") dataset.backingDataset = null
      this.service.createDataset(dataset).subscribe(resp => {
        this.createdDataset = resp.body
        this.showupload = true
      })
    }
    else {
      this.createdDataset = existedDataset
      this.showupload = true
    }
  }

  onConnectionChange(connect: any) {
    this.selectedConnection = connect;
    this.data.element.attributes.connections = this.selectedConnection;
  }

  fetchAdapters() {
    this.adapterServices.getMlInstanceNamesByOrganization().subscribe(resp => {
      this.adaptersList = resp;
      this.filteredAdapters.next(this.adaptersList.slice());
    });
  }

  onAdapterChange(adapter: any) {
    this.selectedAdapter = adapter;
    this.adapterServices.getMethodsByInstanceAndOrganization(adapter).subscribe(resp => {
      this.dsetListForSelectedAdapter = resp;
      this.filteredMethods.next(this.dsetListForSelectedAdapter.slice());
      if (this.data.element.attributes.adaptermethod.alias)
        this.data.element.attributes.adaptermethod.alias = null;
    });
  }

  onAdapterMethodChange(adapterMethod: any) {
    this.selectedAdapterMethod = adapterMethod;
    this.data.element.attributes.adaptermethod = this.selectedAdapterMethod;
  }

  filterAdapters() {
    if (!this.adaptersList) {
      return;
    }
    let search = this.adapterFilterCtrl.value;
    if (!search) {
      this.filteredAdapters.next(this.adaptersList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredAdapters.next(
      this.adaptersList.filter(adapter => adapter.alias.toLowerCase().indexOf(search) > -1)
    );
  }

  filterMethods() {
    if (!this.dsetListForSelectedAdapter) {
      return;
    }
    let search = this.methodFilterCtrl.value;
    if (!search) {
      this.filteredMethods.next(this.dsetListForSelectedAdapter.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredMethods.next(
      this.dsetListForSelectedAdapter.filter(method => method.alias.toLowerCase().indexOf(search) > -1)
    );
  }

  filterConnections() {
    if (!this.connectionList) {
      return;
    }
    let search = this.connectionFilterCtrl.value;
    if (!search) {
      this.filteredConnection.next(this.connectionList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredConnection.next(
      this.connectionList.filter(connect => connect.alias.toLowerCase().indexOf(search) > -1)
    );
  }

  showAdapterMethodInfo() {
    var adaptermethod: Dataset
    if (typeof (this.data.element.attributes.adaptermethod) == "string") {
      adaptermethod = new Dataset();
      adaptermethod.name = this.data.element.attributes.adaptermethod;
    }
    else {
      if (this.data.element.attributes.adaptermethod.datasetType)
        delete this.data.element.attributes.adaptermethod.datasetType
      adaptermethod = this.data.element.attributes.adaptermethod
      adaptermethod.organization = sessionStorage.getItem('organization');
      delete adaptermethod["groups"]
      this.dlgOpn(adaptermethod);
    }
  }

  showAdapterMethod() {
    // const dialogRef = this.dialog.open(ModalConfigDatasetComponent, {
    //   height: '90%',
    //   width: '60%',
    //   disableClose: true,
    //   data: {
    //     purpose: 'pipeline',
    //     data: this.data.element.attributes.adaptermethod
    //   }
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   let dataset;
    //   dataset = result
    //   this.service.getDatasource(dataset.datasource.name ? dataset.datasource.name : dataset.datasource).subscribe(resp => {
    //     dataset.datasource = resp
    //   }, err => { },
    //     () => {
    //       if (result != null) {
    //         this.result.action = 'create';
    //         this.data.element.attributes['adaptermethod'] = dataset
    //         this.result.element = this.data.element
    //         this.onCloseEditProperties();
    //       }
    //     })
    // });
  }

}
