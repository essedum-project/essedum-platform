import {
  Component,
  OnInit,
  OnChanges,
  OnDestroy,
  Input,
  ViewChild,
  SimpleChanges,
  ElementRef,
  EventEmitter,
  ChangeDetectorRef,
  Output,
  AfterViewInit
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { jsPlumb } from 'jsplumb/dist/js/jsplumb.js';
import JSPLUMB_CONFIG from './jsplumb.config';
import { TreeComponent } from '@ali-hm/angular-tree-component';
import { Subject, Subscription } from 'rxjs';
import { NgbNav } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StreamingServices } from '../streaming-services/streaming-service';
import { Canvas, Connector, PipelineModel, Element } from '../sharedModule/pipeline-model/canvas';
//import { LedsLibService, LedsModalService } from 'leds-lib';
import { Services } from '../services/service';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
//import { RadioModule } from 'leds-lib';
//import { ConsoleTabComponent } from './console-tab/console-tab.component';
import { PipelineCreateComponent } from '../pipeline/pipeline-create/pipeline-create.component';
import { OptionsDTO } from '../DTO/OptionsDTO';
import { HttpParams } from '@angular/common/http';
//import { OpenTelemetryService } from 'com-lib-util';

interface ParamsElement {
  value: String;
  type: String;
  required: boolean;
}

@Component({
  selector: 'app-pipeline-description',
  templateUrl: './pipeline.description.component.html',
  styleUrls: ['./pipeline.description.component.scss']
})
export class PipelineDescriptionComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() initiativeData: any;
  @Input() cardTitle: String = "Pipeline";
  @Input() cardToggled: boolean = false;
  @Input() pipelineAlias: String;
  @Input() streamItem: StreamingServices;
  @Input() card: any;
  @Output() statusChanged = new EventEmitter();
  @Output() newItemEvent = new EventEmitter<boolean>();
  @ViewChild('currentDiv', { static: false }) mlCanvas: ElementRef;
 // @ViewChild('console', { static: false }) consoleTab: ConsoleTabComponent; //for jobs
  @ViewChild('nav', { static: false }) public tabs: NgbNav;
  @ViewChild(TreeComponent, { static: false }) private tree: TreeComponent;
  entity: string = 'pipeline';
  addTags: string = 'Add Tags to Pipeline';
  tooltipPoition: string = 'above';
  eventsSubject: Subject<void> = new Subject<void>();
  dynamicParamsArray: Array<DynamicParamsGrid> = [];
  dynamicEnvArray: Array<DynamicParamsGrid> = [];
  dynamicSecretsArray: Array<DynamicSecretsGrid> = [];
  paramsDynamic: any = {};
  dynamicRuntimeParamsArray: Array<DynamicParamsGrid> = [];
  paramsRuntimeDynamic: any = {};
  basicReqTab: any = "modelsTab";
  configReqTab: any = "pipelinesTab";
  tmpParams: string = '';
  elements: any = [];
  datasetArray: any = [];
  allDatasources: any = [];
  jsPlumbInstance: any;
  newCanvas: Canvas;
  isExpand: boolean = true;
  savenode = false;
  relatedloaded = false;
  inputp = JSON.parse(sessionStorage.user).user_email
  finalJsonList: any = [];
  categoryList: any = [];
  currentJob: any = {};
  component: any = [];
  linkAuth: boolean;
  isBeingDestroyed = false;
  out = {};
  jsonChange: string;
  isAuth: boolean = true;
  isAuthRun = true
  timeInterval: any;
  busy: Subscription;
  nodes = [];
  options = { allowDrag: false, allowDrop: false };
  transform: any = 1.0;
  isDown = false;
  load = false
  dragOffset = [0, 0];
  dialogBoxDiv: any;
  canvasMode = 'edit';
  type
  isPageLoad = false;
  isLocalJob: boolean = true;
  permissionList
  Uid = JSON.parse(sessionStorage.user).user_email;
  pip: any = {};
  // swaggerapispec: SwaggerAPISpec = new SwaggerAPISpec();
  requestbodytype: any = "application/json";
  modelVersion: any = "1";
  serverurl: any = "_url_";
  endpoint: any = "_urlpath_";
  metadata = {};
  pipelineModel: PipelineModel = new PipelineModel();
  deployOption: any = "";
  frameworkOption: any = "";
  pushtocodestore = true;
  publicmodel = true;
  isOverwrite = true;
  modelSummary: any = "";
  tagInfo: any = "";
  frameworkVersion: any = "";
  modelclassname: any = "";
  inferenceclassname: any = "";
  modelfilepath: any = "";
  inputType: any = "";
  paramslist: ParamsElement[] = [];
  isScript = false
  script: any[] = [];
  data: any = {
    'input': { 'dataset': [] },
    'output': { 'dataset': [] },
    'script': [],
    'params': ''
  };
  fileObj: any;
  iecp: boolean;
  list = [];
  version: any;
  pipeline_attributes: any;
  environment: any;
  secrets: any;
  selectedRunType: any = [];
  defaultRuntime: any;
  // dynamicRuntimeParamsArray:Array<DynamicParamsGrid> = [];
  runtime_attributes: any;
  plugin
  runTypes: OptionsDTO[] = [];
  scriptsObj: any;
  fileExtension: string = 'py';
  scriptSelected: string;
  prev_openedRow: any[] = [];
  runtime_params_attributes: DynamicRuntimeGrid[];
  dynamicRuntimeArray: Array<DynamicRuntimeGrid> = [{ runtype: "", value: [{ name: "", value: "" }] }];
  runtimeDynamic: any = {};
  plugin_editortype: String;
  panelOpenState = false;
  configModified = false
  envModified = false
  secretsModified = false
  previousTab: String;
  runtypesCheck: boolean = true;
  pluginData: any = "";
  relatedComponent: any;
  // script_generated: boolean = false;
  cardName: any;
  organisation: any;
  initiativeView: boolean;
  inGroupedJob: boolean;
  runPipeline: boolean = false;
  publishAuth: boolean = false;
  publishnow: boolean = false;
  is_app: boolean;
  appName: String;
  pipelineData: any;
  pipelineId: any;
  pipelineDataResponse = {};
  assingnedRuntimeDetails: any;
  pipelineType: any;
  constructor(
   // private modalService: LedsModalService,
   // private telemetry: OpenTelemetryService,
    private route: ActivatedRoute,
    //private ledsLibService: LedsLibService,
    private service: Services,
    public confirmDeleteDialog: MatDialog,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private _location: Location,
    private router: Router,
    private _formBuilder: FormBuilder,
  ) {

    this.pipelineDataResponse = {};

    this.route.queryParams.subscribe((params) => {
      if (params['org']) {
        this.organisation = params['org'];
      } else {
        this.organisation = sessionStorage.getItem('organization');
      }
    });
  }
  // telemetryCall(){
  //   this.telemetry.startTelemetry('aip-app','PipelineDescriptionComponent', sessionStorage.getItem('organization'));
  // }
  ngOnInit() {
  ///  this.telemetryCall();
    let state = this._location.getState()
    this.card = state['card']
    this.pipelineType = this.card ? this.card.type : '';

    this.route.params.subscribe((params) => {
      if (params['cname']) {
        this.cardName = params['cname'];
      }
      else {
        this.cardName = this.streamItem.name;
      }
    });
    if (this.router.url.includes('chains')) {
      this.inGroupedJob = true;

    } else {
      this.inGroupedJob = false;
    }
    if (this.router.url.includes('initiative')) {
      this.initiativeView = false;
      this.cardName = this.initiativeData.name
    } else {
      this.initiativeView = true;
    }
    this.getPipelineByName();



    try {

      // let state = this._location.getState()
      // this.cardTitle = state['cardTitle']
      // if (this.pipelineAlias == null) {
      //   this.pipelineAlias = state['pipelineAlias']
      // }
      // if (this.streamItem == null) {
      //   this.streamItem = state['streamItem']
      // }
      // this.card = state['card']
      // console.log(history.state);
      // if (history.state.relatedData) {
      //   console.log(history.state);
      //   let cards = this._location.getState();
      //   console.log('relatedData', cards['relatedData'].data);
      //   this.streamItem = cards['relatedData'].data;
      // if (this.router.url.includes('preview')) {
      //   this.pipelineAlias = this.streamItem.alias;
      // }
      // if(this.router.url.includes('related')){
      //   let cards = this._location.getState();  
      //   console.log('cards', cards['card'].data);
      //   this.streamItem = cards['card'].data;
      //   this.pipelineAlias = this.streamItem.alias;
      // }
      this.authentications();
      // this.isPageLoad = true;
      this.newCanvas = new Canvas();
      this.newCanvas.elements = [];
      this.service.getDatasources().subscribe(res => {
        this.allDatasources = res
      })

      this.service.getStreamingServicesByName(this.cardName).subscribe((res) => {
        if (res.is_app) {
          this.is_app = res.is_app;
        }
        this.streamItem = res;
        this.type = this.streamItem.type;
        this.getRelatedComponent();
        this.fetchPluginData(this.type);
        this.version = this.streamItem.interfacetype;
        this.pipelineAlias = res.alias;
        if (this.router.url.includes('preview')) {
          this.pipelineAlias = this.streamItem.alias;
        }
        this.streamItem['json_content'] = res.json_content
        if (this.streamItem.json_content) {
          this.newCanvas = JSON.parse(this.streamItem.json_content);
          this.elements = this.newCanvas.elements;
          this.jsonChange = this.streamItem.json_content;
          if (!this.configModified) {
            if (this.newCanvas['pipeline_attributes']?.length > 0) {
              this.newCanvas['pipeline_attributes'].forEach(ele => {
                if (ele?.name != 'usedSecrets')
                  this.dynamicParamsArray.push(ele)
              })
            }
            this.pipeline_attributes = this.dynamicParamsArray
          } else {
            this.pipeline_attributes.forEach(ele => {
              if (ele.name != 'usedSecrets')
                this.dynamicParamsArray.push(ele)
            })
          }
          if (!this.secretsModified) {
            if (this.newCanvas['pipeline_attributes']?.length > 0) {
              this.newCanvas['pipeline_attributes'].forEach((ele) => {
                if (ele.name === 'usedSecrets')
                  this.dynamicSecretsArray.push(ele);
              });
            }
            this.secrets = this.dynamicSecretsArray
          } else {
            this.dynamicSecretsArray = this.secrets
          }
          this.newCanvas.elements?.forEach(ele => {
            if (ele.attributes.dataset) {
              if (!this.datasetArray.includes(ele.attributes.dataset))
                this.datasetArray.push(ele.attributes.dataset)
            }
          })
          if (this.newCanvas['default_runtime']) {
            let dr = JSON.parse(this.newCanvas['default_runtime'])
            this.defaultRuntime = dr.type + "-" + dr.dsAlias
          }
          if (!this.envModified) {
            if (this.newCanvas['environment']) {
              this.dynamicEnvArray = this.newCanvas['environment']
              this.environment = this.dynamicEnvArray
            }
          } else {
            this.dynamicEnvArray = this.environment
          }
          this.instanceCreation();
        }
      });
      // this.instanceCreation();
      if (this.runtypesCheck == true)
        this.fetchRunTypes()
      this.linkAuth = true;

    }
    catch (Exception) {
      this.service.message("Some error occured", "error")
    }
  }

  ngOnChanges() {
    // this.ngOnInit()
    if (this.runtypesCheck == true)
      this.fetchRunTypes()
  }

  authentications() {
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        // pipeline-edit/update permission
        if (cipAuthority.includes("pipeline-edit")) this.isAuth = false;
        if (!this.isAuth) {
          this.options = { allowDrag: true, allowDrop: true };
        }
        if (cipAuthority.includes("pipeline-publish")) this.publishAuth = true;
      }
    );
  }
  getRelatedComponent() {
    this.component = [];
    this.service.getRelatedComponent(this.streamItem.cid, 'PIPELINE').subscribe({
      next: (res) => {
        // this.relatedloaded=true;
        this.relatedComponent = res[0];
        this.relatedComponent.data = JSON.parse(this.relatedComponent.data);
        this.component.push(this.relatedComponent);
        this.cdr.detectChanges();

        // console.log(this.component);
      },
      complete() {
        console.log('completed');
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  refeshrelated(event: any) {
    if (event == true) {
      this.relatedloaded = false;
      setTimeout(() => {
        this.getRelatedComponent();
      }, 2000);
    }
  }
  reload($event: any) {
    if ($event) {
      this.ngOnInit();
    }
  }
  getPipelineByName() {
    let params: HttpParams = new HttpParams();
    params = params.set('name', this.cardName);
    params = params.set('org', this.organisation);

    this.service.getPipelineByName(params).subscribe((res) => {
      console.log('res', res);
      this.pipelineId = res[0].target.cid;
      this.pipelineData = res[0].target;
      this.is_app = res[0].target.is_app;
      this.cardTitle = 'Pipeline';
      this.card = res[0];
      this.refreshPipelineDataResponse();
    });

  }

  assignRuntime() {
    //this.pipelineData['appName'] = this.appName;
    this.pipelineData['defaultRuntime'] = this.defaultRuntime;
    this.pipelineData["json_content"]=this.streamItem.json_content;
    console.log("Pipeline Data :",this.pipelineData);
    console.log("Default Runtime :", this.defaultRuntime);
    if (this.is_app) {
      this.pipelineData.is_app = this.is_app;
    }
    this.service.assignRuntimeService(this.pipelineData).subscribe((response) => {

    });
  }

  refreshPipelineDataResponse() {

    this.service.isRuntimeAssigned(this.pipelineId).subscribe((response) => {
      this.assingnedRuntimeDetails = response;
      // Sample JSON string  
      const jsonData = this.assingnedRuntimeDetails;
      const data = JSON.parse(jsonData);
      const connectionEndpoint = data["connection-endpoint"];
      if (connectionEndpoint != "") {
        const url = new URL(connectionEndpoint);
        const port = url.port;
        this.pipelineDataResponse['assignedPort'] = port;
        const endpoint = url.href;

        const pathname = url.pathname;
        this.pipelineDataResponse['endpointUrl'] = pathname;
        this.pipelineDataResponse['runtime'] = endpoint;
        //this.pipelineDataResponse['appName'] = "APP";

      } else {
        this.pipelineDataResponse = {};
       }




    });





  }

  releasePort(){
    this.service.releasePort(this.pipelineId).subscribe((response) => {
         console.log("Release Port : ",response);
       });
 
 
  }
  
  expandCollapse() {
    this.isExpand = !this.isExpand;
  }

  fetchRunTypes() {
    this.runTypes = []
    this.busy = this.service.fetchJobRunTypes().subscribe(resp => {

      resp.forEach((ele) => {
        if (ele.dsCapability === 'app' && this.pipelineType === 'Apps') {
          this.runTypes.push(new OptionsDTO(ele.type + "-" + ele.dsAlias, ele));

        }
        if (ele.dsCapability != 'app' && this.pipelineType != 'Apps') {
          this.runTypes.push(new OptionsDTO(ele.type + "-" + ele.dsAlias, ele));
        }

      });
      console.log("RESPONSE FOR RUNTYPES IS : ", this.runTypes);
      // this.runTypes.push(new OptionsDTO("Local-", {"dsAlias":"","dsName":"","type":"Local"}));
      if (this.defaultRuntime) {
        let index = this.runTypes.findIndex(option => option.viewValue === this.defaultRuntime);
        if (index > -1) {
          this.selectedRunType = this.runTypes[index].value
        }
        else {
          this.selectedRunType = this.runTypes[0].value;
        }
      } else {
        this.selectedRunType = this.runTypes[0].value;
      }
    })
    this.runtypesCheck = false
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.instanceCreation();
    }, 0);
  }
  ngDoCheck() {
    if (this.previousTab == 'modelsTab' && this.basicReqTab != 'modelsTab') {
      this.cdr.detectChanges();
      this.updatePositions();
      this.updateConnections();
    }

    if (this.basicReqTab != this.previousTab)
      this.previousTab = this.basicReqTab

  }

  // addForm() {
  //  const newFormGroup = this._formBuilder.group({
  //   runtype: this._formBuilder.control(''),
  //   config: this._formBuilder.array([this._formBuilder.group({
  //     key: '',
  //     value:''})])
  //  });
  // //  this.formGroups.push(newFormGroup)
  //  this.jsondata.push(newFormGroup)
  // }

  // get jsondata(): FormArray {
  //   return this.orderForm.get('jsondata') as FormArray;
  // };

  // onSubmit() {
  //   console.log(this.orderForm.value);
  // }

  ngOnDestroy() : void{
    clearInterval(this.timeInterval);
    this.isBeingDestroyed = true;
    this.busy.unsubscribe()
  //  let activeSpan = this.telemetry.fetchActiveSpan();
   // this.telemetry.endTelemetry(activeSpan);
  }

  exportToFile() {
    try {
      const blob = new Blob([JSON.stringify(this.newCanvas, null, 2)], { type: 'application/json' });
      saveAs(blob, 'source.json');
      //this.telemetry.addTelemetryEvent(this.streamItem.alias + ' pipeline exported.');
    }
    catch (Exception) {
      this.service.message("Some error occured", "error")
    }
  }

  // runscripts() {
  //   let obj
  //   if (this.streamItem.type.toLowerCase() == 'icmm') {

  //     obj = {
  //       "elements": this.newCanvas.elements,
  //       "userId": this.Uid,
  //       "platform": "iecp",
  //       "experiment_name": this.streamItem.alias ? this.streamItem.alias : this.streamItem.name,
  //       "pipeline_attributes": this.pipeline_attributes,
  //     }
  //   }
  //   else {
  //     obj = {
  //       "elements": this.newCanvas.elements,
  //       "userId": this.Uid,
  //       "platform": this.streamItem.type,
  //       "experiment_name": this.streamItem.alias ? this.streamItem.alias : this.streamItem.name,
  //       "pipeline_attributes": this.pipeline_attributes,
  //     }
  //   }

  //   this.service.runIcmmPipeline(obj).subscribe(
  //     resp => {


  //       this.load = false
  //       this.messageService.info('Started!', resp.Message);
  //     },
  //     error => {
  //       this.load = false
  //       this.messageService.error('Could not get the results', error);
  //     });
  // }

  onModelChange() {
    if (this.newCanvas) {
      this.newCanvas.elements = this.elements;
      this.instanceCreation();
    }
  }



  onDrop(event: any) {
    try {
      const data = JSON.parse(JSON.stringify(event.element.data));
      const position = { x: event.event.clientX - 100, y: event.event.clientY - 300 };
      const ele = new Element(
        this.generateHash(),
        data.name,
        data.category,
        data.classname,
        data.description,
        data.attributes,
        position.x,
        position.y,
        new Array<Connector>(),
        [],
        data.inputEndpoints,
        data.outputEndpoints,
        data.requiredJars,
        data.formats,
        data.codeGeneration
      );
      this.newCanvas.elements.push(ele);
      this.cdr.detectChanges();
      this.addNewItemToJsPlumb(ele);
    }
    catch (Exception) {
      this.service.message("Some error occured", "error")
    }


  }

  onDragStart(event) {
    this.mlCanvas.nativeElement.setAttribute(
      'style',
      'border: 3px dashed #c3c3c3; width:100%;'
    );
  }

  onDragEnd(event) {
    this.mlCanvas.nativeElement.setAttribute(
      'style',
      'border: 0.5px solid #c3c3c3; width:100%;'
    );
  }

  generateHash() {
    return Array.apply(0, Array(5))
      .map(function () {
        return (function (charset) {
          let min = 0;
          let max = charset.length - 1;
          let rand = window.crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1)
          return charset.charAt(Math.floor(rand * (max - min + 1)) + min);
        })('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
      })
      .join('');
  }

  instanceCreation() {
    if (this.jsPlumbInstance) {
      this.jsPlumbInstance.reset();
    }
    this.jsPlumbInstance = jsPlumb.getInstance();
    this.jsPlumbInstance.bind('dblclick', function (conn) {
      if (confirm('Do you want to delete this connection?')) {
        this.deleteConnection(conn);
      }
    });
    this.jsPlumbInstance.setContainer('mlCanvasId');
    this.jsPlumbInstance['mlstudio'] = this;
    jsPlumb.fire('jsPlumbDemoLoaded', this.jsPlumbInstance);
    this.cdr.detectChanges();
    if (this.newCanvas) {
      this.createElementsFromSavedData();
    }
  }

  createElementsFromSavedData() {
    if (this.newCanvas.elements) {
      for (const item of this.newCanvas.elements) {
        this.addNewItemToJsPlumb(item);
      }
      this.createConnectionsFromSavedData();
    }
  }

  addNewItemToJsPlumb(ele: Element) {
    this.jsPlumbInstance.draggable(ele.id, {
      getConstrainingRectangle: () => [1000, 500],
      containment: true,
    });
    const inputEndPointAnchors = ['LeftMiddle', 'TopCenter', 'BottomCenter', 'RightMiddle'];
    const outputEndPointAnchors = ['RightMiddle', 'BottomCenter', 'TopCenter', 'LeftMiddle'];
    if (ele.inputEndpoints) {
      ele.inputEndpoints.forEach((eleInputEndpoint, index) => {
        const uuid = inputEndPointAnchors[index] + '_' + ele.id;
        const ele_I = this.jsPlumbInstance.addEndpoint(
          ele.id,
          JSPLUMB_CONFIG.sourceEndpoint,
          {
            anchor: inputEndPointAnchors[index],
            uuid: uuid,
            editable: true,
            parameters: {
              pointName: eleInputEndpoint,
              inParams: ele.attributes,
              inId: ele.id
            }
          }
        );
        ele_I.addOverlay([
          'Label',
          {
            location: [0.5, -0.5],
            cssClass: 'endpointSourceLabel',
            label: ele.inputEndpoints[index],
            id: 'label'
          }
        ]);

        // ele_I.bind('mouseout', function (endpoint) {
        //   endpoint.removeOverlay('label');
        // });
      });
    }
    if (ele.outputEndpoints) {
      ele.outputEndpoints.forEach((eleOnputEndpoint, index) => {
        const uuid = outputEndPointAnchors[index] + '_' + ele.id;
        const ele_O = this.jsPlumbInstance.addEndpoint(ele.id, JSPLUMB_CONFIG.targetEndpoint, {
          anchor: outputEndPointAnchors[index],
          uuid: uuid,
          editable: true,
          parameters: {
            pointName: eleOnputEndpoint,
            outParams: ele.attributes,
            outId: ele.id,
            outConnAttr: ele.connattributes
          }
        });
        ele_O.addOverlay([
          'Label',
          {
            location: [0.5, -0.5],
            cssClass: 'endpointSourceLabel',
            label: ele.outputEndpoints[index],
            id: 'label'
          }
        ]);

        // ele_O.bind('mouseout', function (endpoint) {
        //   endpoint.removeOverlay('label');
        // });
      });
    }
  }

  createConnectionsFromSavedData() {
    if (this.newCanvas.elements) {
      for (const connection of this.newCanvas.elements) {
        this.createConnection(connection);
        connection.context = [];
        this.transmitSchemaCols(connection, connection.context);
      }
    }
  }

  createConnection(ele: Element) {
    ele.connectors
      .filter(connector => {
        return connector.type === 'source';
      })
      .forEach(connector => {
        const fromConnctionName = connector.position + '_' + ele.id;
        const toConnctionName = connector.elementPosition + '_' + connector.elementId;
        const conn = this.jsPlumbInstance.connect({
          uuids: [fromConnctionName, toConnctionName],
          editable: true
        });
        const params = conn.getParameters();
        if (this.newCanvas.elements) {
          for (const connection of this.newCanvas.elements) {
            if (connection.id === params.inId) {
              connection.connattributes = params.outParams;
            }
          }
        }
      });
  }

  transmitSchemaCols(ele: Element, attrs: any) {
    ele.connectors.filter(connector => {
      return connector.type === 'target';
    }).forEach(connector => {
      const parentId = connector.elementId;
      for (const element of this.newCanvas.elements) {
        if (element.id.toString() === parentId) {
          attrs.push(element.attributes);
          this.transmitSchemaCols(element, attrs);
        }
      }
    });
  }

  onChangeStatus(value) {
    this.statusChanged.emit(value);
  }

  onDelete(e) {
    for (const el of this.jsPlumbInstance.getEndpoints(
      jsPlumb.getElement(e.id)
    )) {
      this.jsPlumbInstance.deleteEndpoint(el);
    }
    // this.jsPlumbInstance.remove(e);
    let index = -1;
    for (let i = 0; i < this.newCanvas.elements.length; i++) {
      if (this.newCanvas.elements[i].id === e.id) {
        index = i;
        break;
      }
    }
    this.newCanvas.elements.splice(index, 1);
    // this.jsPlumbInstance.repaintEverything(true);
    // this.instanceCreation();
  }

  onSave(e) {
    const index = this.newCanvas.elements.findIndex(x => x.id === e.element.id);
    this.newCanvas.elements[index] = e.element;
    this.saveJson();
  }

  // modifyAPISpec() {
  //   this.swaggerapispec.changeType(this.requestbodytype)
  //   this.swaggerapispec.addTitle(this.pipelineModel.modelname)
  //   this.swaggerapispec.addDescription(this.pipelineModel.explanation)
  //   this.swaggerapispec.addVersion(this.modelVersion)
  //   this.swaggerapispec.addUrl(this.serverurl)
  //   this.swaggerapispec.addUrlPath(this.endpoint)
  //   this.paramslist.forEach(element => {
  //     // if (this.requestbodytype == 'application/json') {
  //     this.swaggerapispec.addElementInJson(element.value, element.type)
  //     // } else {
  //     //   this.swaggerapispec.addElementInFormData(element.value, element.type, element.required)
  //     // }
  //   })
  //   this.pipelineModel.apispec = this.swaggerapispec.getAPISpec(true)//(this.requestbodytype == 'application/json')
  // }

  // runPipeline() {
  // ##this.generateScript(this.streamItem.name)
  // ##this.saveJson(true);
  // if (this.currentJob && this.currentJob.status !== 'STARTED' && this.currentJob.status !== 'RUNNING') {
  //   if (this.streamItem.type == "Azure" || this.streamItem.type == "Vertex") {
  //     this.service.runIecpPipeline(this.newCanvas).subscribe();
  //   }
  //   else if (this.streamItem.type == "Mlflow") {
  //     this.service.runMlFlowPipeline(this.newCanvas).subscribe()
  //   }
  //   else {
  //     let passType = '';
  //     if (this.type != 'Binary' && this.type != 'NativeScript') passType = 'DragAndDrop'
  //     else passType = this.type
  //     this.service.runPipeline(this.streamItem.alias ? this.streamItem.alias : this.streamItem.name, this.streamItem.name, passType, this.selectedRunType['type'], this.selectedRunType['dsName'], this.tmpParams).subscribe(
  //       pageResponse => {
  //         pageResponse = JSON.parse(pageResponse)
  //         this.service.message('Pipeline has been Started!', 'success');
  //         this.currentJob = pageResponse;
  //         this.onChangeStatus(this.currentJob.status);
  //         this.streamItem.job_id = this.currentJob.jobId;
  //         this.saveJson();
  //         if (this.currentJob.status) {
  //           if (
  //             this.currentJob.status === 'STARTED' ||
  //             this.currentJob.status === 'RUNNING'
  //           ) {
  //             const interval = 10000;
  //             this.timeInterval = setInterval(() => {
  //               this.fetchJob(this.currentJob.jobId, this.currentJob.status, this.currentJob.runtime);
  //             }, interval);
  //           }
  //         }
  //       },
  //       error => {
  //         this.service.message('Error : ' + error, 'error');
  //         clearInterval(this.timeInterval);
  //       }
  //     );
  //   }
  // } else {
  //   this.service.message('Pipeline is already running!', 'error');
  // }
  // ##this.consoleTab.ngOnChanges();
  // }

  fetchJob(jobId: string, status: string, runtime?: string) {
    let linenumber = status.toLowerCase() == "running" ? 0 : -1
    this.service.fetchSparkJob(jobId, linenumber, runtime, 50, status, false).subscribe(
      response => {
        this.currentJob = response;
        this.onChangeStatus(this.currentJob.status);
        if (
          this.currentJob.status !== 'STARTED' &&
          this.currentJob.status !== 'RUNNING'
        ) {
          clearInterval(this.timeInterval);
        }
      },
      error => {
        this.currentJob['status'] = 'ERROR';
        this.service.message('Job Status not fetched:' + error, 'error');
      }
    );
  }

  saveJson(run?) {
    // try {
    // console.log(this.formGroups)

    this.streamItem.is_app = this.is_app;
    console.log("savejsondrawflow = ", this.streamItem)
    if (this.streamItem["jsoncontent"]) {
      this.streamItem.json_content = JSON.stringify(this.streamItem["jsoncontent"])
      this.service.update(this.streamItem).subscribe(

        response => {
          if (run) {
            this.ngOnInit();
          }
        },
        error => {
          if (run)
            console.log(
              'Error!',
              'Canvas not updated due to error: ' + error
            )
        }
      );
    }
    else {
      if (this.basicReqTab == 'modelsTab') {
        this.cdr.detectChanges();
        this.updatePositions();
        this.updateConnections();
      }

      if (this.streamItem.type == "Azure" || this.streamItem.type == "Mlflow") {
        this.newCanvas['userId'] = this.Uid;
        this.newCanvas['platform'] = this.streamItem.type;
        this.newCanvas['experiment_name'] = this.streamItem.alias;
      }
      if (this.streamItem.type == "Vertex") {
        this.newCanvas['userId'] = this.Uid;
        this.newCanvas['platform'] = this.streamItem.type;
        this.newCanvas['display_name'] = this.streamItem.alias;
      }
      let pa = this.dynamicParamsArray
      this.dynamicSecretsArray?.forEach(ele => {
        pa.push(ele)
      });
      this.newCanvas['pipeline_attributes'] = pa
      this.dynamicParamsArray = []
      this.newCanvas['pipeline_attributes'].forEach(ele => {
        if (ele?.name != 'usedSecrets')
          this.dynamicParamsArray.push(ele)
      })
      this.dynamicSecretsArray = []
      this.newCanvas['pipeline_attributes'].forEach(ele => {
        if (ele.name === 'usedSecrets')
          this.dynamicSecretsArray.push(ele)
      })
      // this.newCanvas['secrets'] = this.secrets
      this.newCanvas.elements.forEach(element => {
        delete element.connattributes;
        let codegen = this.finalJsonList.filter(json => json.classname == element.classname)[0]
        element.codeGeneration = codegen?.codeGeneration
        if (element.attributes.script) {
          let script = []
          for (let i = 0; i < element.attributes.script.length; i++) {
            if (element.attributes.script[i].length > 0) {
              script.push(element.attributes.script[i])
            }
          }
          element.attributes.script = script
        }
        if (element.attributes.dataset && element.attributes.dataset.datasource) {
          element.attributes.dataset.datasource = this.allDatasources.filter(data => data.name == element.attributes.dataset.datasource.name)[0]
        }
      });
      this.newCanvas.elements.forEach(element => {
        if (element.attributes.dataset && element.attributes.dataset.datasource)
          element.attributes.dataset.datasource.connectionDetails = JSON.parse(JSON.stringify(element.attributes.dataset.datasource.connectionDetails))
      })

      if (this.defaultRuntime) {
        let index = this.runTypes.findIndex(option => option.viewValue === this.defaultRuntime);
        if (index > -1) {
          this.newCanvas['default_runtime'] = JSON.stringify(this.runTypes[index].value);
          this.selectedRunType = this.runTypes[index].value
        }
        else {
          this.selectedRunType = this.runTypes[0].value
        }
      }
      this.newCanvas['environment'] = this.dynamicEnvArray;
      console.log("This is Stream Item Sending2 : ", this.streamItem);
      this.streamItem.json_content = JSON.stringify(this.newCanvas);
      this.service.update(this.streamItem).subscribe(
        response => {
          if (run)
            this.service.message('Updated Successfully');
           //this.telemetry.addTelemetryEvent(this.streamItem.alias + ' pipeline updated.');
          // this.ngOnInit();
        },
        error => {
          if (run)
            console.log(
              'Error!',
              'Canvas not updated due to error: ' + error
            )
        }
      );
      // }
      // catch (Exception) {
      //   // this.messageService.error("Some error occured", "Error")
      // }

    }
  }

  updatePositions() {
    this.newCanvas.elements.forEach(x => {
      x.position_x = jsPlumb.getElement(x.id).style.left.replace('px', '');
      x.position_y = jsPlumb.getElement(x.id).style.top.replace('px', '');
    });
  }

  updateConnections() {
    this.newCanvas.elements.forEach(x => {
      x.connectors = new Array<Connector>();
    });
    const elements = this.newCanvas.elements;
    this.jsPlumbInstance.getAllConnections().forEach(connection => {
      const conn_source = new Connector(
        'source',
        connection.endpoints[0].getParameter('pointName'),
        connection.endpoints[0].anchor.type,
        connection.targetId,
        connection.endpoints[1].anchor.type
      );
      const conn_tgt = new Connector(
        'target',
        connection.endpoints[1].getParameter('pointName'),
        connection.endpoints[1].anchor.type,
        connection.sourceId,
        connection.endpoints[0].anchor.type
      );
      const sourceEle = elements.filter(x => {
        return x.id === connection.sourceId;
      })[0];
      sourceEle.connectors.push(conn_source);
      const targetEle = elements.filter(x => {
        return x.id === connection.targetId;
      })[0];
      targetEle.connectors.push(conn_tgt);
    });
  }

  restoreCanvas(event) {
    if (event.tab.textLabel == "Canvas")
      this.instanceCreation()
    if (event.tab.textLabel == "Scripts")
      this.readScript()
    this.isPageLoad = false;
    this.cdr.detectChanges();
  }

  nameCheck(val) {
    if (val.length >= 10) {
      return val.substr(0, 7) + '...';
    }
    return val;
  }

  categoryFormat(val) {
    return val
      .replace('Config', '')
      .split(/(?=[A-Z])/)
      .join(' ');
  }

  toggleCanvasMode() {
    if (this.canvasMode === 'pan') {
      this.canvasMode = 'edit';
    } else {
      this.canvasMode = 'pan';
    }
  }

  resizeContent(event) {
    if (event.wheelDelta > 0) {
      this.transform += 0.05;
    }
    if (event.wheelDelta < 0) {
      this.transform -= 0.05;
    }
    event.currentTarget.getElementsByClassName('mlCanvas')[0].style.setProperty('transform', 'scale(' + this.transform + ')');
    event.preventDefault();
  }

  mousedown($event) {
    this.isDown = true;
    this.dialogBoxDiv = document.getElementById('mlCanvasId');
    this.dragOffset = [
      this.dialogBoxDiv.offsetLeft - $event.clientX,
      this.dialogBoxDiv.offsetTop - $event.clientY
    ];
  }

  mouseup($event) {
    this.isDown = false;
  }

  mousemove($event) {
    $event.preventDefault();
    this.dialogBoxDiv = document.getElementById('mlCanvasId');
    if (this.isDown) {
      const mousePosition = {
        x: $event.clientX,
        y: $event.clientY
      };
      this.dialogBoxDiv.style.left = (mousePosition.x + this.dragOffset[0]) + 'px';
      this.dialogBoxDiv.style.top = (mousePosition.y + this.dragOffset[1]) + 'px';
    }
  }


  fetchPluginData(type: string) {
    // this.service.getPluginByTypeAndOrg(type).subscribe(response => {
    //   let resp = JSON.parse(response)
    //   this.plugin_editortype = resp.editortype
    // });
    this.busy = this.service.listJsonByType(type).subscribe(response => {
      this.nodes = [];
      let resp = JSON.parse(response)
      this.pluginData = []
      resp.forEach(ele => {
        this.pluginData.push(JSON.parse(ele.plugindetails))
      })
      // let resp = JSON.parse(response)
      // this.plugin = resp
      // this.finalJsonList = JSON.parse(this.pluginData);
      this.finalJsonList = this.pluginData;

      var data = this.pluginData,
        tree = function (data, root) {
          var t = {};
          data.forEach(({ id, category, parentCategory, alias, name,
            classname, attributes, connectors, inputEndpoints, outputEndpoints,
            position_x, position_y, formats, codeGeneration }) => {
            Object.assign(t[id] = t[id] || {},
              {
                label: id,
                name: name,
                alias: alias,
                category: category,
                classname: classname,
                attributes: attributes,
                connectors: connectors,
                inputEndpoints: inputEndpoints,
                outputEndpoints: outputEndpoints,
                position_x: position_x,
                position_y: position_y,
                formats: formats,
                codeGeneration: codeGeneration
              });
            t[parentCategory] = t[parentCategory] || {};
            t[parentCategory].children = t[parentCategory].children || [];
            t[parentCategory].children.push(t[id]);
          });
          return t[root].children;
        }(data, "");

      this.nodes = tree;
      this.tree.treeModel.update();
      this.tree.sizeChanged();
    });
  }

  copyPipeline() {
    const dialogRef = this.dialog.open(PipelineCreateComponent, {
      height: '80%',
      width: '60%',
      data: {
        sourceToCopy: this.newCanvas.elements,
        type: this.streamItem.type,
        interfacetype: this.streamItem.interfacetype,
        pipeline_attributes: this.pipeline_attributes,
        secrets: this.secrets,
        copy: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  // run pipeline for script
  runGenratedScriptPipeline() {
    this.saveJson()
    this.busy = this.service.runPipeline(this.streamItem.alias ? this.streamItem.alias : this.streamItem.name, this.streamItem.name, 'Script').subscribe(
      pageResponse => {
        this.service.message('Pipeline has been Started!', 'success');
      },
      error => {
        this.service.message('Could not get the results', 'error');
      }
    );
  }

  routeBack() {
    this._location.back();
  }

  routeToLogs() {
    this.router.navigate(["/landing/aip/jobs-log"]);
  }

  generateScript(name) {
    this.saveJson(true)
    let path
    let connNodeExist = false
    let connNodeIndex
    this.newCanvas.elements.forEach((element, index) => {
      if (element.name == "Connection") {
        connNodeExist = true
        connNodeIndex = index
      }
    })
    if (connNodeExist) {
      let params: HttpParams = new HttpParams();
      params = params.append('name', this.newCanvas.elements[connNodeIndex].attributes.connections.name);
      params = params.append('org', this.newCanvas.elements[connNodeIndex].attributes.connections.organization);
      this.service.getDatasourceByName(params).subscribe(res => {
        this.newCanvas.elements[connNodeIndex].attributes.connections = res[0];
        this.streamItem.json_content = JSON.stringify(this.newCanvas);
        this.service.update(this.streamItem).subscribe(
          response => { },
          error => {
            console.log(
              'Error!',
              'Canvas not updated due to error: ' + error
            )
          }
        );
        this.service.savePipelineJSON(this.streamItem.name, this.streamItem.json_content).subscribe(
          res => {
            this.service.message('Saving Pipeline Json!', 'success');
            this.triggerEvent(res.path)
          },
          error => {
            this.service.message('Could not save the file', 'error');
            this.runPipeline = false
            this.publishnow = false
          }
        );
      })
    } else {
      this.service.savePipelineJSON(this.streamItem.name, this.streamItem.json_content).subscribe(
        res => {
          this.service.message('Saving Pipeline Json!', 'success');
          this.triggerEvent(res.path)
        },
        error => {
          this.service.message('Could not save the file', 'error');
          this.runPipeline = false
          this.publishnow = false
        }
      );
    }
  }

  triggerEvent(path) {
    let body = { pipelineName: this.streamItem.name, scriptPath: path[0] }
    this.busy = this.service.triggerPostEvent("generateScript_" + this.streamItem.type, body, "").subscribe(
      resp => {
        // this.service.message( 'Pipeline has been Started!','success');
        this.service.message('Generating Script!', 'success');
        // this.script_generated = true
        this.service.getEventStatus(resp).subscribe(
          status => {
            if (status == 'COMPLETED') {
              if (this.runPipeline) {
                this.service.message('Script Generated successfully', 'success');
                let passType = '';
                if (this.type != 'Binary' && this.type != 'NativeScript') passType = 'DragAndDrop'
                else passType = this.type
                this.busy = this.service.runPipeline(this.streamItem.alias ? this.streamItem.alias : this.streamItem.name, this.streamItem.name, passType, this.selectedRunType['type'], this.selectedRunType['dsName'], "generated").subscribe(
                  res => {
                    this.service.message('Pipeline has been Started!', 'success');
                    this.runPipeline = false
                  //  //this.telemetry.addTelemetryEvent(this.streamItem.alias + ' pipeline started running.');

                  },
                  error => {
                    this.service.message('Some error occured.', 'error');
                    this.runPipeline = false
                  }
                )
              }
              else if (this.publishnow) {
                this.service.message('Script generated successfully.', 'success');
                this.publishnow = false
                this.service.publishPipeline(this.streamItem).subscribe(
                  res => {
                    this.service.message('Pipeline published successfully.', 'success');
                    //this.telemetry.addTelemetryEvent(this.streamItem.alias + ' pipeline published.');

                  },
                  error => {
                    this.service.message('Error in publishing pipeline.', 'error');
                  }
                )

              }
              else {
                this.service.message('Script generated successfully.', 'success');
              }
              //this.telemetry.addTelemetryEvent(this.streamItem.alias + ' pipeline started running.');
            } else if (status == 'ERROR') {
              this.service.message('Error in script generation.', 'error');
              this.runPipeline = false
              this.publishnow = false
            }
          },
          error => {
            // this.service.message('Could not get the results', 'error');
            this.service.message('Error! Could not generate script.', 'error');
            this.runPipeline = false
            this.publishnow = false
          });
      },
      error => {
        // this.service.message('Could not get the results', 'error');
        this.service.message('Error! Could not generate script.', 'error');
        this.runPipeline = false
        this.publishnow = false
      });
  }

  readScript() {
    this.busy = this.service.readGeneratedScript(this.streamItem.name).subscribe(
      async (res) => {
        this.fileObj = await res.body
        if (this.fileObj.script)
          this.isScript = true
        this.scriptSelected = this.fileObj.script[0];
      },
      error => {
        this.service.message('Script is not generated.', 'error');
      }
    );
  }

  readScripts() {
    this.isScript = false
    this.readScript();
    this.readAllScriptsInFolder();
  }


  onFileChange(file: string, i: number) {
    this.fileExtension = file.substring(file.lastIndexOf(".") + 1);
    if (this.fileExtension === 'json') {
      this.scriptSelected = JSON.parse(this.scriptsObj.script[i]);
    }
    else {
      this.scriptSelected = this.scriptsObj.script[i];
    }
  }


  readAllScriptsInFolder() {
    this.busy = this.service.readAllScriptsInFolder(this.streamItem.name).subscribe(
      res => {
        this.scriptsObj = res.body
      },
      error => {
        this.service.message('Script is not generated.', 'error');
      }
    );
  }

  runScript() {
    // if(this.isScript){
    let passType = '';
    if (this.type != 'Binary' && this.type != 'NativeScript') passType = 'DragAndDrop'
    else passType = this.type

    this.runPipeline = true
    this.generateScript(this.streamItem.name)
    // passType = this.type
    // this.busy = this.service.runPipeline(this.streamItem.alias ? this.streamItem.alias : this.streamItem.name, this.streamItem.name, passType, this.selectedRunType['type'], this.selectedRunType['dsName'], "generated").subscribe(
    //   res => {
    //     this.service.message('Pipeline has been Started!', 'success');
    //   },
    //   error => {
    //     this.service.message('Some error occured.', 'error');
    //   }
    // )
    // }else{
    //   this.service.message('Please generate script to run pipeline.', 'error');
    // }

  }

  addRuntimeParamsRow() {
    if (!this.dynamicRuntimeParamsArray || this.dynamicRuntimeParamsArray.length == 0) {
      this.dynamicRuntimeParamsArray = [];
    }
    this.paramsRuntimeDynamic = { key: "", value: "" };
    this.dynamicRuntimeParamsArray.push(this.paramsRuntimeDynamic);
    // this.runtime_params_attributes = this.dynamicRuntimeParamsArray;
    return true;
  }
  addRuntimeRow() {
    if (!this.dynamicRuntimeArray || this.dynamicRuntimeArray.length == 0) {
      this.dynamicRuntimeArray = [];
    }
    this.runtimeDynamic = { key: "", value: this.dynamicRuntimeParamsArray };
    this.dynamicRuntimeArray.push(this.runtimeDynamic);
    this.runtime_params_attributes = this.dynamicRuntimeArray;
    return true;
  }
  // addRuntimeParamsRow(){
  //   if (!this.dynamicRuntimeParamsArray || this.dynamicRuntimeParamsArray.length == 0) {
  //     this.dynamicRuntimeParamsArray = [];
  //   }
  //   this.paramsDynamic = { key: "", value: { key: "", value: "" } };
  //   this.dynamicRuntimeParamsArray.push(this.paramsDynamic);
  //   this.runtime_attributes = this.dynamicRuntimeParamsArray;
  //   return true;
  // }

  toggler() {
    this.cardToggled = !this.cardToggled;
    this.newItemEvent.emit(this.cardToggled);
    if (this.router.url.includes('preview')) {
      this._location.back();
    }
  }
  basicReqTabChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = "modelsTab";
        this.instanceCreation();
        // this.ngOnInit();
        break;
      case 1:
        this.basicReqTab = "pipelineConfigTab";
        break;
      case 2:
        this.basicReqTab = "scriptsTab";
        this.readScripts();
        break;
      case 3:
        this.basicReqTab = "jobsTab";
        break;
      case 4:
        this.basicReqTab = "drawTab";
        break;
    }
  }

  navigateBack() {
    this._location.back();
  }

  configTabChange(index) {
    switch (index) {
      case 0:
        this.configReqTab = "pipelinesTab";
        this.ngOnInit();
        break;
      case 1:
        this.configReqTab = "runtimeTab";
        break;
    }
  }
  showEditableRow = (event: any) => {
    event.target
      .closest('tbody').querySelectorAll('tr').forEach((eachList: any) => {
        eachList.classList.remove('active');
      });
    event.target.closest('tr').classList.add('active');
  };

  hideEditableRow =
    (event: any) => { event.target.closest('tr').classList.remove('active'); };

  ToggleRow =
    (eventObj: any) => {
      const targetClass = eventObj.target.classList; const
        targetParentElement = eventObj.target.parentElement.parentElement; if
        (targetClass.contains('arrow_expand')) {
        if (this.prev_openedRow.length) {
          this.prev_openedRow[0].children[0].children[0].classList.remove('arrow_collapse',
            'down-arw-icon');
          this.prev_openedRow[0].children[0].children[0].classList.add('arrow_expand');
          this.prev_openedRow[0].children[0].children[0].classList.add('next-icon');
          this.prev_openedRow[0].classList.remove('row_opened');
          this.prev_openedRow[0].nextSibling.classList.remove('open'); this.prev_openedRow.splice(0,
            1);
        } this.prev_openedRow.push(targetParentElement);
        targetClass.remove('arrow_expand', 'next-icon');
        targetClass.add('arrow_collapse'); targetClass.add('down-arw-icon');
        targetParentElement.classList.add('row_opened');
        targetParentElement.nextSibling.classList.add('open');
      } else {
        targetClass.remove('arrow_collapse', 'down-arw-icon');
        targetClass.add('arrow_expand'); targetClass.add('next-icon');
        targetParentElement.classList.remove('row_opened');
        targetParentElement.nextSibling.classList.remove('open');
        if (this.prev_openedRow.length) { this.prev_openedRow.splice(0, 1); }
      }
    };


  addRuntype() {
    this.dynamicRuntimeArray.push({ runtype: "", value: [{ name: "", value: "" }] })
    // this.editMode=true
    // this.editIndex=this.configData.length-1
  }

  onSecretsDataChange($event) {
    this.secrets = $event;
    this.dynamicSecretsArray = $event;
    this.secretsModified = true;
  }

  onConfigDataChange($event) {
    this.pipeline_attributes = $event;
    this.dynamicParamsArray = $event;
    this.configModified = true;
  }
  onEnvDataChange($event) {
    this.environment = $event;
    this.dynamicEnvArray = $event;
    this.envModified = true;
  }
  copyScript() {
    let script = this.scriptSelected;
    if (this.fileExtension == 'json') {
      script = JSON.stringify(this.scriptSelected, null, 2);
    }
    else {
      let codeStr = '';
      for (let i = 0; i < script.length; i++) {
        codeStr += script[i] + '\n';
      }
      script = codeStr
    }
    navigator.clipboard.writeText(script);
  }
  openModal(content: any): void {
   // this.modalService.openModal(content, 'standard');
    this.getRelatedComponent();
  }

  defaultRuntimeChange($event) {
    this.defaultRuntime = $event.value;
    let index = this.runTypes.findIndex(option => option.viewValue === this.defaultRuntime);
    this.selectedRunType = this.runTypes[index].value

    console.log("This is Stream Item : ," + this.streamItem);
  }
  //generateScript and then publish pipeline
  publishPipeline() {
    this.publishnow = true
    this.generateScript(this.streamItem.name)
  }

  onEventChangeIsApp(event) {
    this.is_app = event.checked;
    console.log("Triggering App : ", this.is_app);
  }
}

export class DynamicParamsGrid {
  name: string;
  value: string;
}
export class DynamicSecretsGrid {
  name: string;
  value: string;
}
export class DynamicRuntimeGrid {
  runtype: string;
  value: Array<DynamicParamsGrid> = [];
}
