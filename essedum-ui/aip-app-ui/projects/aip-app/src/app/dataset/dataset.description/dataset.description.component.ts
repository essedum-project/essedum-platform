import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../../services/service';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { DatasetServices } from '../dataset-service';
import { AdapterServices } from '../../sharedModule/services/adapter-service';
import { Stomp } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { DashConstant } from '../../DTO/dash-constant';
import { Project } from '../../DTO/project';
import { SemanticSearchContext } from '../../DTO/SemanticSearchContext';
import { SemanticService } from '../../services/semantic.services';
import { SemanticSearchResult } from '../../DTO/SemanticSearchResult';
import { EventsService } from '../../services/event.service';
import { Subscription } from 'rxjs';
import mammoth from 'mammoth';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dataset-description',
  templateUrl: './dataset.description.component.html',
  styleUrls: ['./dataset.description.component.scss']
})
export class DatasetDescriptionComponent implements OnInit {
  @Input() cardTitle: String;
  @Input() cardToggled: boolean = false;
  @Input() datasetAlias: String;
  @Input() initiativeData:any;
  @Input() card: any;
  tooltipPoition: string = 'above';
  togglerTitle = 'Connected components';
  connectedComponentsList: string[] = ['Model', 'Dataset', 'Pipeline', 'Endpoint']
  tabList: string[] = ["View", "Configuration", "Tasks", "Logs"];
  likesCount = 438;
  AnnotateFlag:boolean=false;
  rowObj: any;
  description: any;
  isAuth: boolean;
  datasetUnlink: boolean;
      appLoading: boolean = true;
  tableView: boolean;
  selectedDatasetName: string;
  mashupView: boolean;
  mashupname: string;
  formParam: any = {};
  dataset: any = { 'views': false };
  views: any;
  tableviews: string;
  datasetData: any;
  tableviewsupport: boolean;
  selectedDataset: any = {};
  component: any = [];
  relatedComponent: any;
  relatedloaded: boolean = false;
  linkAuth: boolean = false;
  isExpand: boolean = true;
  folderZip: boolean;
  metaData: any;
  metaDataKeys;
  metaDataValues;
  fileNamePlaceholder='';
  tempDataset:any={};
  tempDatasetArray:any=[];
  datasetDataErr:any;
  datasetName:any;
  uploadPercentage: number = 0;
  uploading: boolean=false;
  stompClient: any;
  check:boolean=true
  isSemanticSearch: boolean = false;
  isInstanceNameConfigured: boolean = true;
  serverUrl = "";
  adapterInstanceName: string;
  instanceNameDashConstantsKey: string = "icip.semantic-search.adapter-instance-name";
  dashConstant: DashConstant;
  project: Project;
  projectId: any;
  isInstanceExist: boolean = true;
  adapterInstance: any;
  loadingPage: boolean = false;
  adaptersOptions: OptionsDTO[] = [];
  adapterInstances: any;
  semanticSearchContextList: SemanticSearchContext[] = [];
  adapterName: string;
  instanceName: string;
  adapter: any;
  spp: any;
  formattedapispec: any[];
  spec: any = {};
  query: string;
  index: string;
  result: any;
  answer: any;
  loading: boolean = false;
  cURL: string;
  specPath: any;
  isInstance: boolean = true;
  isEndpoint: boolean = false;
  response: any;
  url:any;
  isGitUrl:boolean=false;
  semanticSearchActive: boolean = false;
  isInstanceConfiguredNow: boolean = false;
  initiativeView: boolean;
  mlTopics: any;
  allTopicsSelected: boolean = true;
  mladaptersSpp: any;
  mladaptersFormattedapispec: any;
  topicAdaperInstance: any;
  adapterAndInstanceNames: any;
  knowledgeBaseFilter: string;
  filteredIndexNames: any;
  selectedIndexNames: string[] = [];
  semanticSearchResult: SemanticSearchResult[] = [];
  selectedIndexId: string;
  selectedResult: any;
  summaryShowMore: boolean = true;
  metaDataDescKey:string;
  descValue:string;
  metaDataUrlKey:string;
  urlValue:string;
  fileName:string;
  path:string;
  chatUrl;
  tabReq:string = 'filePreview'
  fileData:any;
  fullPath:string;
  questions;
  answers;
  fileCount: number = 0;
  newres: any;
  statusnew: any;
  topicnamenew: any;
  datasetId:number;
  viewType:string;
  type: boolean = false;
  eventData:any;
  busy: Subscription;
  corelid: string;
  stat: any;
  event_status : string = '';
  htmlstring: any;
  dataDoc: boolean = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private adapterServices: AdapterServices,
    private location: Location,
    private cdRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private datasetsService: DatasetServices,
    private semanticService:SemanticService,
    private eventsService: EventsService,
    private injector: Injector,
    private datasourceService: Services,
    private http: HttpClient,
  ) { }


  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.datasetName = params['cname'];
    });
    if (this.router.url.includes('initiative')) {
      this.datasetName = this.initiativeData.name;
      if (!this.datasetName) {
        this.datasetName = this.initiativeData.name;
      }
    }
    this.router.url.includes('initiative')? (this.initiativeView = false): (this.initiativeView = true);

    this.service.getPermission("cip").subscribe((cipAuthority) => {
      if (
        cipAuthority.includes('link-component')
      )
        this.linkAuth = true;
      if (cipAuthority.includes(this.rowObj.permission)) this.isAuth = false;
      if (
        cipAuthority.includes('dataset-unlink')
      )
        this.datasetUnlink = true;
    }, (error) => {
      console.log(`error when calling getPermission method. Error Details:${error}`);
    });
    if (history.state.relatedData) {
      let cards = this.location.getState();
      this.card = cards['relatedData'].data;
      this.datasetAlias = this.card.alias;
      this.metaData = JSON.parse(this.card.attributes);      
      this.metaDataKeys = Object.keys(this.metaData);
      this.metaDataValues = Object.values(this.metaData);
      this.rowObj = this.card;
      this.description = this.card.description;
      if (this.card?.indexname) {
        this.index = this.card.indexname;
      }
      if(this.card?.tags=='[\"Doc Labelling\"]'){
        this.AnnotateFlag=true;
      }
      this.getActions();
      this.getRelatedComponent();
    }
    else if (this.datasetName){
      this.getDatasetByName();
    }
    else {
      this.chatUrl = this.injector.get('chatData');
      this.datasetName = this.chatUrl.substring(this.chatUrl.lastIndexOf('/')+1);
      this.getDatasetByName();
    }
    this.renderSemanticSearchForTabs();
    this.getknowledgebases();
   
  }
     get shouldShowEmptyState(): boolean {
    return !this.appLoading && (!this.datasetData || this.datasetData.length === 0);
  }
  getDatasetByName(){
    this.datasetsService. getDatasetByNameAndOrg(this.datasetName).subscribe((res) => {
      console.log(res);
      this.card = res;
      this.tempDataset['attributes']=this.card.attributes;
      this.tempDataset['datasource']=this.card.datasource;
      this.metaData = JSON.parse(this.card.attributes);
      this.metaDataKeys = Object.keys(this.metaData);
      this.metaDataValues = Object.values(this.metaData);
      this.datasetAlias = this.card.alias;
      this.rowObj = this.card;
      if(this.card?.tags=='[\"Doc Labelling\"]'){
        this.AnnotateFlag=true;
        this.cdRef.detectChanges();
      }
      this.description = this.card.description;
      if(this.card.datasource.type=='GIT'){
        this.isGitUrl=true;
      }
      else this.isGitUrl=false;
      if (this.card.indexname) {
        this.index = this.card.indexname;
      }
      this.getActions();
      this.getRelatedComponent();
      this.metaDataDescKey = this.metaDataKeys[2];
      this.metaDataUrlKey = this.metaDataKeys[4];
      this.descValue = this.metaData.description;
      this.urlValue = this.metaData.url;
      this.path=JSON.parse(this.card.attributes).path;
      this.fileName=this.path + '/' + JSON.parse(this.card.attributes).object;
      this.datasetId=this.card.id
      this.viewType=this.card.views
      this.fileType(this.viewType)
      if(this.card.event_details)
        this.eventData = JSON.parse(this.card.event_details);
    });
  }
  getRelatedComponent(){
    this.component = [];
    this.service.getRelatedComponent(this.card.id, 'DATASET').subscribe((res) => {
      this.relatedComponent = res[0];
      this.relatedComponent.data = JSON.parse(this.relatedComponent.data)
      this.component.push(this.relatedComponent);
      this.cdRef.detectChanges();
      this.relatedloaded = true;
    });
  }

  reload($event: any) {
    if ($event) {
      this.ngOnInit();
    }
  }
  refeshrelated(event: any) {
    if (event == true) {
      this.relatedloaded = false;
      setTimeout(() => {
        this.ngOnInit();
      }, 2000);
    }
  }
  openModal(content: any): void {
    this.dialog.open(content, { width: '600px', disableClose: false });
  }

  @Output() newItemEvent = new EventEmitter<boolean>();

  numSequence(n: number): Array<number> {
    return Array(n);
  }

  navigateTo() {
    let selectedCard = this.card;
    this.router.navigate(['../../data'], {
      state: {
        selectedCard,
      },
      relativeTo: this.route
    });
  }


  toggler() {
    if (this.router.url.includes('view')) {
      this.location.back();
    }
  }

  routeBackToModelList() {
    this.router.navigate(["../../"], { relativeTo: this.route })
  }


  getActions() {
    this.selectedDatasetName = this.rowObj.name;
    this.checkTableSupport()
  }

  expandCollapse() {
    this.isExpand = !this.isExpand;
  }

  checkTableSupport() {
          this.appLoading = true;

    this.service.checkVisualizeSupport(this.selectedDatasetName)
      .subscribe(res => {
        if (res && res.filter(ele => ele["Tabular View"]).length > 0) {

          this.service.getDataset(this.selectedDatasetName).subscribe(resp => {
            this.dataset = resp;
            try {
              try {
                this.views = JSON.parse(this.dataset.views)
              }
              catch {
                this.views = this.dataset.views
              }
              if (this.views == "") {
                this.tableviews = 'yes'
              }
            }
            catch {
              this.views = this.dataset.views
            }

            if (this.dataset.views) {
              this.service.getDatasource(this.dataset.datasource).subscribe(resp => {
                this.dataset.datasource = resp;
                let params = { page: 0, size: 50 }
                this.service.getProxyDbDatasetDetails(
                  this.dataset,
                  this.dataset.datasource,
                  params,
                  this.dataset.organization,
                  true
                ).subscribe(resp => {
                  if(resp.length===0) {
                    this.appLoading=false;
                    this.datasetDataErr = 'There is an application error, please contact the application admin';
                  } else {
                    this.appLoading=false;
                    this.datasetDataErr=false;
                    this.datasetData = resp;
                    if(this.dataset.views=='Table view'){
                       this.datasetData = resp;
                    }
                    if(this.dataset.views == 'Doc View'){
                      this.http.get(resp[0], { responseType: 'arraybuffer' }).subscribe(async (docxArray) => {
                        let docxHtml = mammoth.convertToHtml({ arrayBuffer: docxArray })
                        await docxHtml.then((result) => {
                          this.dataDoc = true;
                          this.htmlstring = result.value;
                        })
                        .catch(function(err) {
                            console.error(err);
                        });
                      });
                    }
                  // if (this.views == 'Folder View') this.datasetData = resp;
                  }
                }, err => {
                  console.log(err);
                  this.datasetDataErr = err;
                  this.appLoading=false;
                });
              }, err => { console.log(err) });

            }
            else {
              this.tableviewsupport = false
            }
          }, err => { console.log(err) });
        }
        else {

          this.service.getDataset(this.selectedDatasetName).subscribe(resp => {
            this.dataset = resp;
            try {
              try {
                this.views = JSON.parse(this.dataset.views)
              }
              catch {
                this.views = this.dataset.views
              }
            }
            catch {
              this.views = this.dataset.views
            }

            if (this.views == "") {
              this.tableviews = 'no'
            }

            if (this.dataset.views) {
              this.service.getDatasource(this.dataset.datasource).subscribe(resp => {
                this.dataset.datasource = resp;
                let params = { page: 0, size: 50 }
                this.service.getProxyDbDatasetDetails(
                  this.dataset,
                  this.dataset.datasource,
                  params,
                  this.dataset.organization,
                  true
                ).subscribe(resp => {
                  this.datasetData = resp
                  this.appLoading=false;
                  if(this.dataset.views == 'Doc View'){
                    this.http.get(resp[0], { responseType: 'arraybuffer' }).subscribe(async (docxArray) => {
                      let docxHtml = mammoth.convertToHtml({ arrayBuffer: docxArray })
                      await docxHtml.then((result) => {
                        this.dataDoc = true;
                        this.htmlstring = result.value;
                      })
                      .catch(function(err) {
                          console.error(err);
                      });
                    });
                  }
                }, err => {
                  console.log(err);
                  this.datasetData = err.text;
                  this.appLoading=false;
                });
              }, err => { console.log(err) });

            }
            else {
              this.tableviewsupport = false
            }
          }, err => { console.log(err) });
        }
      }, err => {
        this.tableviews = 'no'
      })
    this.selectedDataset["name"] = this.selectedDatasetName;
  }

  deleteAdapter(name: string) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.service.deleteDatasource(name).subscribe((res) => {
          this.service.messageNotificaionService('success', "Connection Deleted Successfully");
          this.ngOnInit();
        });
      }
      else
        this.service.messageNotificaionService('error', "Error");
    });
  }

  isShortString(val): boolean {
    if(val.length<=100 && val && typeof val === 'string'){
    return true;
   }
    return false;
  }

  
  uploadFile() {
    try{
      for(let i=0;i<this.tempDatasetArray.length;i++){
      this.datasetsService.testConnection(this.tempDatasetArray[i]).subscribe((response) => {
        this.service.message('File Upload Initiated!');
        this.websocketConnection();
      }
      ,
      (err)=>{
        this.service.message("some error occured",'error');
      })
    }
      this.fileNamePlaceholder=''
      this.tempDatasetArray=[];
    }
    catch(Exception){
    this.service.message("Some error occured",'error')
    }
  }
 
  websocketConnection(){
    const socket = new SockJS('/ws');
    this.stompClient = Stomp.over(socket);
    
    this.stompClient.connect({}, (frame) => {
      console.log('connected to webSocket server');

      this.stompClient.subscribe('/topic/fileUploadStatus', (message) => {
        console.log(message.body);
        // this.service.message(message.body);
        if(message.body=="Success") {
          this.service.message("File Uploaded Successfully!");
      } else {
          this.service.message("Error in file upload",'error');
      }

          this.stompClient.disconnect(() => {
          console.log('Disconnected from WebSocket server');
        });
      
      });
      
    });
}
  

  ingestDialog(content) {
    this.dialog.open(content, { width: '600px', disableClose: false });
  }

  async addFile(file) {
    this.tempDatasetArray=[]
    if(file.target.files.length==0){
      this.fileNamePlaceholder=''
      return;
    }
    for (let i = 0; i < file.target.files.length; i++) {
      if (file.target.files[i].name.endsWith(".pptx") || file.target.files[i].name.endsWith(".docx")){
        this.fileNamePlaceholder=''
        this.datasourceService.message("File format not supported", "error")
      } else {
        this.fileCount = this.fileCount + 1;
        this.uploadPercentage = 0;
        const chunkSize = 20000000;
        const formData: FormData = new FormData();
        let file1: File = file.target.files[i];
        let metadata = {};
        metadata["FileGuid"] = this.generateHash();
        metadata["FileName"] = file1.name;
        metadata["TotalCount"] = Math.ceil(file1.size / chunkSize);
        metadata["FileSize"] = file1.size;
        let metaDataIndex = 0;
        let count = 0;
        this.uploading=true;
        for (let offset = 0; offset < file1.size; offset += chunkSize) {
          const chunk = file1.slice(offset, offset + chunkSize);
          formData.set("file", chunk, file1.name);
          metadata["Index"] = metaDataIndex++;
          formData.set("chunkMetadata", JSON.stringify(metadata));
          if(typeof(this.tempDataset.attributes)=="string")
          this.tempDataset.attributes=JSON.parse(this.tempDataset.attributes);
          let res = this.datasetsService.uploadChunks(this.selectedDatasetName, formData).toPromise();
          await res.then((res)=>{
            count += 1;
            if (count < Math.ceil(file1.size / chunkSize))
                this.onUploadProgress(chunkSize,count * chunk.size, file1.size);
            if(count==Math.ceil(file1.size / chunkSize)){  
            this.uploadPercentage=100;
            this.tempDataset.attributes['object']=file.target.files[i].name;
            this.tempDataset.attributes['uploadFile']=res.body.uploadFilePath;
            this.tempDatasetArray.push(JSON.parse(JSON.stringify(this.tempDataset)));  
            this.uploading=false;
            this.service.message('File Chunked Successfully!');
            }
          })
          .catch((err)=>{
            console.log('An error occured');
            this.service.message('Error! while uploading file','error');
            this.uploading=false;
          });
        }
      }
      }
      // this.fileNamePlaceholder=`${file.target.files.length} files selected`;
      if(this.fileCount!==0){
        this.fileNamePlaceholder=`${this.fileCount} files selected`;
      } else {
        this.fileNamePlaceholder=''
      }
      file.value='';
    }

  generateHash() {
    return Array.apply(0, Array(5))
      .map(function () {
        return (function (charset) {
          let min = 0;
          let max = charset.length - 1;
          let rand =
            window.crypto.getRandomValues(new Uint32Array(1))[0] /
            (0xffffffff + 1);
          return charset.charAt(Math.floor(rand * (max - min + 1)) + min);
        })("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");
      })
      .join("");
  }


  onUploadProgress(chunkSize,bytesLoaded, bytesTotal) {
    let dlper: number = Math.round(((bytesLoaded / bytesTotal) * 100) * 100) / 100;
    this.uploadPercentage = dlper > 99.99 ? 99.99 : dlper;
  }

  showOrHideMore() {
    this.summaryShowMore = !this.summaryShowMore;
  }

  renderSemanticSearchForTabs() {
    this.selectedIndexNames = [];
    this.semanticService.getIngestedTopicsByDatasetnameAndOrg(this.datasetName).subscribe((res) => {
      this.mlTopics = res;
      this.topicAdaperInstance = {};
      this.mlTopics.forEach(topic => {
        if (!this.selectedIndexNames.includes(topic.topicname.topicname) && topic.status == 'COMPLETED') {
          this.selectedIndexNames.push(topic.topicname.topicname);
          if (!this.topicAdaperInstance[topic.topicname.topicname])
            this.topicAdaperInstance[topic.topicname.topicname] = topic.topicname.adapterinstance;
        }
      });
      this.renderAdapterInstancesForSemanticSearch();
    });
  }

  renderAdapterInstancesForSemanticSearch() {
    this.mladaptersSpp = {};
    this.mladaptersFormattedapispec = {};
    this.adapterAndInstanceNames = {};
    this.mlTopics.forEach(topic => {
      if (topic.status == 'COMPLETED' && !this.mladaptersSpp[topic.topicname.adapterinstance]) {
        this.adapterServices.getInstanceByNameAndOrganization(topic.topicname.adapterinstance).subscribe((respAdpInstance) => {
          if (respAdpInstance && respAdpInstance.adaptername) {
            if (!this.mladaptersSpp[topic.topicname.adapterinstance])
              this.adapterServices.getAdapteByNameAndOrganization(respAdpInstance.adaptername).subscribe((resAdp) => {
                if (resAdp) {
                  if (!this.mladaptersSpp[topic.topicname.adapterinstance]) {
                    let spp = JSON.parse(resAdp.apispec);
                    this.mladaptersSpp[topic.topicname.adapterinstance] = spp;
                    if (!this.adapterAndInstanceNames[topic.topicname.adapterinstance])
                      this.adapterAndInstanceNames[topic.topicname.adapterinstance] = respAdpInstance.adaptername;
                    let formattedapispec = []
                    for (let keys in spp.paths) {
                      if (keys.includes('infer')) {
                        for (let key in spp.paths[keys]) {
                          let pathObj = {}
                          pathObj["path"] = keys
                          pathObj["requestType"] = key.toUpperCase()
                          for (let value in spp.paths[keys][key]) {
                            if (value == "responses") {
                              let responses = []
                              for (let resp in spp.paths[keys][key][value]) {
                                let respObj = {}
                                respObj["status"] = resp
                                respObj["description"] = spp.paths[keys][key][value][resp]["description"]
                                respObj["content"] = spp.paths[keys][key][value][resp]["content"]
                                responses.push(respObj);
                              }
                              pathObj[value] = responses
                            }
                            else if (value == "parameters") {
                              for (let i = 0; i < spp.paths[keys][key][value].length; i++) {
                                spp.paths[keys][key][value][i].value = spp.paths[keys][key][value][i].value?.replace("{datasource}", respAdpInstance?.adaptername).replace("{org}", sessionStorage.getItem("organization"))
                              }
                              pathObj[value] = spp.paths[keys][key][value]
                            }
                            else {
                              pathObj[value] = spp.paths[keys][key][value];
                              if (pathObj["requestType"] == "POST" && value == "requestBody") {
                              }
                            }
                          }
                          pathObj["button"] = "Try it out"
                          pathObj["executeFlag"] = false
                          formattedapispec.push(pathObj)
                          if (!this.mladaptersFormattedapispec[topic.topicname.adapterinstance])
                            this.mladaptersFormattedapispec[topic.topicname.adapterinstance] = formattedapispec;
                        }
                      }
                    }
                  }
                }
              });
          }
        });
      }
    });
  }

  onEnterNew() {
    this.semanticSearchActive = true;
    this.semanticSearchResult = [];
    if (this.query) {
      if (this.selectedIndexNames?.length > 0) {
        this.loading = true
        this.semanticSearchContextList = [];
        this.answer = '';
        this.selectedIndexNames.forEach(async indexId => {
          let adapterInstanceName = this.topicAdaperInstance[indexId];
          let adapterName = this.adapterAndInstanceNames[adapterInstanceName];
          let spec = JSON.parse(JSON.stringify(this.mladaptersFormattedapispec[adapterInstanceName][0]));
          let cURL = null;
          let specPath = spec.path;
          let response = { "Status": "Executing" };
          spec["executeFlag"] = true
          let headers = {}
          if (specPath && specPath.includes("/adapters/"))
            headers['access-token'] = localStorage.getItem("accessToken");
          let params = {}
          if (spec.parameters) {
            for (let param of spec.parameters) {
              if (param.in == "params" || param.in == "query") {
                if (!this.isInstance)
                  params[param.name] = param.value ? param.value.replace("{datasource}", adapterName).replace("{org}", sessionStorage.getItem("organization")) : ""
                else {
                  params[param.name] = param.value ? param.value.replace("{datasource}", adapterInstanceName).replace("{org}", sessionStorage.getItem("organization")) : ""
                }
                if (!param.value)
                  param.value = ""
              }
              if (param.in == "header") {
                headers[param.name] = param.value ? param.value : ""
              }
              if (param.in == "path") {
                specPath = specPath.replace("{" + param.name + "}", param.value)
              }
            }
          }
          if (this.isInstance)
            params['isInstance'] = 'true';
          let semanticSearchContextListTemp: SemanticSearchContext[] = [];
          let semanticSearchResultTemp = new SemanticSearchResult();
          semanticSearchResultTemp.index = indexId;
          /* to add query in spec */
          let requestBody = JSON.parse(spec.requestBody.value);
          requestBody["index_name"] = indexId;
          requestBody["query"] = this.query;
          if (requestBody?.config?.VectorStoreConfig) {
            requestBody.config.VectorStoreConfig["index_name"] = indexId;
            requestBody.config.VectorStoreConfig["query"] = this.query;
            if (requestBody?.config?.LLMConfig) {
              requestBody.config.LLMConfig["query"] = this.query;
              requestBody.config.LLMConfig["index_name"] = indexId;
            }
          }
          spec.requestBody.value = JSON.stringify(requestBody);
          if (spec.requestType.toLowerCase() == "post") {
            let url = spec.path;
            specPath = specPath.replace(adapterName, adapterInstanceName);
            url = this.serverUrl + specPath
            let resp = this.adapterServices.callPostApi(url, spec.requestBody.value, params, headers).toPromise();
            await resp.then((resp) => {
              if (resp.body) {
                this.loading = false;
                let result = resp.body;
                let answerTemp = result[0]['Answer'];
                if (answerTemp && typeof (answerTemp) != "string")
                  answerTemp = answerTemp.toString();
                semanticSearchResultTemp.summary = answerTemp;
                this.semanticSearchResult.push(semanticSearchResultTemp);
                if (this.semanticSearchResult.length === 1) {
                  this.selectedIndexName(indexId);
                  this.loading = false;
                }
                ;
              } else {
                this.loading = false;
                this.service.message('Upstream API is down!', 'warning');
              }
            }, err => {
              this.response = err
              this.loading = false;
              if (!err) this.response = "ERROR"
            })
          }
        });
      }
      else {
        this.loading = false;
        this.semanticSearchActive = false;
        this.service.message('No Knowledge bases are linked to this Dataset!', 'warning');
      }
    } else {
      this.semanticSearchActive = false;
      this.loading = false;
      this.service.message('Please enter content to search!', 'warning');
    }
  }

  selectedIndexName(selectedIndexId) {
    this.selectedIndexId = selectedIndexId;
    this.selectedResult = this.semanticSearchResult.filter(result => result.index === selectedIndexId)?.[0];
    this.answer = this.selectedResult.summary;
  }

  tabChangeForIndexes(index) {
    this.summaryShowMore = true;
    this.selectedIndexName(this.semanticSearchResult[index].index);
  }

  onEnter() {
    this.semanticSearchContextList = [];
    this.semanticSearchActive = true;
    if (this.isInstanceNameConfigured) {
      if (this.query) {
        this.loading = true
        this.answer = ''
        this.result = []
        // to add query in spec
        let spec = JSON.parse(JSON.stringify(this.spec));
        let requestBody = JSON.parse(spec.requestBody.value);
        requestBody.config.VectorStoreConfig.query = this.query;
        requestBody.config.LLMConfig.query = this.query;
        if (this.index && this.index != "" && requestBody.config.VectorStoreConfig) {
          requestBody.config.VectorStoreConfig.index_name = this.index;
        }
        if (this.card.name && this.card.name != "") {
          // to add dataset in request filter
        }
        spec.requestBody.value = JSON.stringify(requestBody);
        spec.path.substring(0, spec.path.lastIndexOf('/')) + '/' + sessionStorage.getItem('organization')

        this.cURL = null;
        this.specPath = spec.path;
        this.response = { "Status": "Executing" };
        spec["executeFlag"] = true
        let headers = {}
        if (this.specPath && this.specPath.includes("/adapters/"))
          headers['access-token'] = localStorage.getItem("accessToken");
        let params = {}
        if (spec.parameters) {
          for (let param of spec.parameters) {
            if (param.in == "params" || param.in == "query") {
              if (!this.isInstance)
                params[param.name] = param.value ? param.value.replace("{datasource}", this.adapter).replace("{org}", sessionStorage.getItem("organization")) : ""
              else {
                params[param.name] = param.value ? param.value.replace("{datasource}", this.instanceName).replace("{org}", sessionStorage.getItem("organization")) : ""
              }
              if (!param.value)
                param.value = ""
            }
            if (param.in == "header") {
              headers[param.name] = param.value ? param.value : ""
            }
            if (param.in == "path") {
              this.specPath = this.specPath.replace("{" + param.name + "}", param.value)
            }
          }
        }
        if (this.isInstance)
          params['isInstance'] = 'true';
        if (this.isEndpoint)
          params['isInstance'] = 'REMOTE';
        if (spec.requestType.toLowerCase() == "post") {
          let url = spec.path;
          this.specPath = this.specPath.replace(this.adapterName, this.instanceName);
          url = this.serverUrl + this.specPath
          this.adapterServices.callPostApi(url, spec.requestBody.value, params, headers).subscribe(resp => {
            this.response = resp
            if (resp.body) {
              this.loading = false;
              this.result = resp.body;
              this.answer = this.result[0]['Answer'];
              if (this.answer && typeof (this.answer) == "string")
                this.answer = this.answer.toString();
            } else {
              this.service.message('Upstream API is down!', 'warning');

            }
          }, err => {
            this.service.message('Upstream API is currently down! Please try again later', 'warning');
            this.loading = false;
            this.answer = '';
            this.result = [];
            this.semanticSearchContextList = [];
            this.response = err
            if (!err) this.response = "ERROR"
          })
          if (spec.requestBody.value) {
            if (spec.requestBody.value.includes("'")) {
              spec.requestBody.value = spec.requestBody.value.replaceAll("'", "'\\''");
            }
          }
        }
      }
      else {
        this.semanticSearchActive = false;
        this.service.message('Please enter content to search!', 'warning'); 
      }
    }
  }

  clearSemanticSearch() {
    this.semanticSearchActive = false;
    this.query = '';
    this.loading = false;
    this.answer = '';
    this.result = [];
    this.semanticSearchContextList = [];
  }

  renderSemanticSeach() {
    this.isInstanceNameConfigured = false;
    this.checkInstanceNameConfiguration();
    this.serverUrl = window.location.origin;
    let org = sessionStorage.getItem("organization");
  }

  checkInstanceNameConfiguration() {
    this.findAllAdapters();
    this.service.getConstantByKey(this.instanceNameDashConstantsKey).subscribe((res) => {
      if (res.body) {
        this.instanceName = res.body;
        this.isInstanceNameConfigured = true;
        this.loadingPage = false;
        this.checkIsInstanceExist();
      } else {
        this.loadingPage = false;
        this.isInstanceNameConfigured = false;
      }
    });
  }

  findAllAdapters() {
    this.adapterServices.getMlInstanceNamesByOrganization()
      .subscribe(res => {
        this.adapterInstances = res;
        this.adapterInstances.forEach((insNamr) => {
          this.adaptersOptions.push(new OptionsDTO(insNamr, insNamr));
        });
      });
  }

  checkIsInstanceExist() {
    this.adapterServices.getInstanceByNameAndOrganization(this.instanceName).subscribe((res) => {
      if (res && res.adaptername) {
        this.adapterName = res.adaptername;
        this.adapterServices.getAdapteByNameAndOrganization(this.adapterName).subscribe((resAdp) => {
          if (resAdp) {
            this.isInstanceExist = true;
            this.adapter = resAdp;
            this.spp = JSON.parse(resAdp.apispec);
            this.formatSpec();
          } else {
            this.isInstanceExist = false;
          }
        });
      } else {
        this.isInstanceExist = false;
      }
    });
  }

  formatSpec() {
    this.formattedapispec = []
    for (let keys in this.spp.paths) {
      if (keys.includes('infer')) {
        for (let key in this.spp.paths[keys]) {
          let pathObj = {}
          pathObj["path"] = keys
          pathObj["requestType"] = key.toUpperCase()
          for (let value in this.spp.paths[keys][key]) {
            if (value == "responses") {
              let responses = []
              for (let resp in this.spp.paths[keys][key][value]) {
                let respObj = {}
                respObj["status"] = resp
                respObj["description"] = this.spp.paths[keys][key][value][resp]["description"]
                respObj["content"] = this.spp.paths[keys][key][value][resp]["content"]
                responses.push(respObj)

              }
              pathObj[value] = responses
            }
            else if (value == "parameters") {
              for (let i = 0; i < this.spp.paths[keys][key][value].length; i++) {
                this.spp.paths[keys][key][value][i].value = this.spp.paths[keys][key][value][i].value?.replace("{datasource}", this.adapter?.alias).replace("{org}", sessionStorage.getItem("organization"))
              }
              pathObj[value] = this.spp.paths[keys][key][value]
            }
            else {
              pathObj[value] = this.spp.paths[keys][key][value];
              if (pathObj["requestType"] == "POST" && value == "requestBody") {
              }
            }
          }
          pathObj["button"] = "Try it out"
          pathObj["executeFlag"] = false
          this.formattedapispec.push(pathObj)
        }
      }
    }
    this.spec = this.formattedapispec[0];
    if (this.isInstanceConfiguredNow) {
      this.onEnter();
    }
  }

  adapterNameChangesOccur(adpName: string) {
    this.adapterInstanceName = adpName;
  }

  configureAdapterInstance() {
    this.projectId = JSON.parse(String(sessionStorage.getItem('project'))).id;
    this.dashConstant = new DashConstant();
    this.project = new Project();
    this.project.id = this.projectId;
    this.dashConstant.keys = this.instanceNameDashConstantsKey;
    this.dashConstant.value = this.adapterInstanceName;
    this.dashConstant.project_id = this.project
    this.dashConstant.project_name = sessionStorage.getItem('organization');
    this.service.createDashConstant(this.dashConstant).subscribe((res) => {
      if (res) {
        this.adapterServices.messageNotificaionService('success', "Adapter Instance Name Configured Successfully");
        this.isInstanceConfiguredNow = true;
        this.renderSemanticSeach();
      } else {
        this.adapterServices.messageNotificaionService('error', "Some error occured!");
      }
    });
  }
  
  isShortStringURL(val):boolean {
    let urlKey:boolean = this.metaDataKeys.some(url => url === this.metaDataUrlKey)
    if(val && typeof val === 'string' && urlKey){
      return true;
    }
    return false;
  }

  basicReqTabChange(index) {
    this.fileData='';
    switch (index) {
      case 0:
        this.tabReq = 'filePreview';
        // this.refreshiframe();
        break;
      case 1:
        this.tabReq = 'translation';  
        this.getTranslation();
        break;
      case 2:
        this.tabReq = 'fileSummary';  
        this.getSummary();
        break;
      case 3:
        this.tabReq = 'faq';
        this.getFAQ();
        break;
    }
  }

  getFileData(fileName){
    return this.service.getNutanixFileData(this.datasetName,[fileName],localStorage.getItem('organization')).toPromise()
    .catch(err=>this.service.message('Some error occured while fetching file','error'));
  }

  getTranslation(){
    let pathString:string =this.fileName;
    const pathDetails = pathString.split('/');
    const lstPath = pathDetails[pathDetails.length-1]
    const filenameNoExt = lstPath.replace(/\.[^/.]+$/, '')
    let part: string[] = pathString.split("/");
    let name: string = part[part.length-1].split(".")[0];
    if(pathString.split("/").length === 2) {
      this.fullPath = ".aip/Translation/"+filenameNoExt+".txt"
    } else {
      let path: string = part.slice(0, part.length-1).join("/");
      let parts: string[] = path.split("/");
      parts.shift();
      path = parts.join("/");
      this.fullPath = path+"/.aip/Translation/"+filenameNoExt+".txt"
    }
    let data = this.getFileData(this.fullPath);
    data.then(res=>{
      this.fileData=res;
      const objectData = Object.assign({}, ...this.fileData.flat());
      this.questions = Object.keys(objectData);
      this.answers = Object.values(objectData);
    });
  }
  
  getSummary(){
    let pathString:string =this.fileName;
    const pathDetails = pathString.split('/');
    const lstPath = pathDetails[pathDetails.length-1]
    const filenameNoExt = lstPath.replace(/\.[^/.]+$/, '')
    let part: string[] = pathString.split("/");
    let name: string = part[part.length-1].split(".")[0];
    if(pathString.split("/").length === 2) {
      this.fullPath = ".aip/Summary/"+filenameNoExt+".txt"
    } else {
      let path: string = part.slice(0, part.length-1).join("/");
      let parts: string[] = path.split("/");
      parts.shift();
      path = parts.join("/");
      this.fullPath = path+"/.aip/Summary/"+filenameNoExt+".txt"
    }
    let data = this.getFileData(this.fullPath);
    data.then(res=>{
      this.fileData=res;
    });
  }

  getFAQ(){
    let pathString:string =this.fileName;
    const pathDetails = pathString.split('/');
    const lstPath = pathDetails[pathDetails.length-1]
    const filenameNoExt = lstPath.replace(/\.[^/.]+$/, '')
    let part: string[] = pathString.split("/");
    let name: string = part[part.length-1].split(".")[0];
    if(pathString.split("/").length === 2) {
      this.fullPath = ".aip/FAQ/"+filenameNoExt+".txt"
    } else {
      let path: string = part.slice(0, part.length-1).join("/");
      let parts: string[] = path.split("/");
      parts.shift();
      path = parts.join("/");
      this.fullPath = path+"/.aip/FAQ/"+filenameNoExt+".txt"
    }
    let data = this.getFileData(this.fullPath);
    data.then(res=>{
      this.fileData=res;
      const objectData = Object.assign({}, ...this.fileData.flat());
      this.questions = Object.keys(objectData);
      this.answers = Object.values(objectData);
    });
  }

  getknowledgebases() {
    this.semanticService.getIngestedTopicsByDatasetnameAndOrg(this.datasetName).subscribe((res) => {
      this.newres = res;
      this.topicnamenew = [];
      for (let i = 0; i < this.newres.length; i++) {
        this.topicnamenew.push(this.newres[i].topicname.topicname);
      }
      this.statusnew = [];
      for (let i = 0; i < this.newres.length; i++) {
        this.statusnew.push(this.newres[i].status);
      }
    });
  }

  fileType(typ){
    if(typ==='Image View' ||typ=== 'Json View'||typ=== 'Table View')
      this.type=false;
    else
      this.type=true;
  }

  pipelineDialog(content) {
    this.dialog.open(content, { width: '600px', disableClose: false });
  }

  ConfigDialog(data){
    this.dialog.open(data, { width: '600px', disableClose: false });
  }

  createSummary() {
    this.datasetsService.createSummary(this.datasetName,this.datasetData[0]).subscribe((res) => {
      if(res.length>0){
        this.service.message('Summary created successfully');
        console.log(res);
      }
    });
  }
  
  cloneRepoToS3() {
    this.datasetsService.cloneGitRepoAndPushToS3(this.datasetName, sessionStorage.getItem('organization')).subscribe((res) => {
      if (res && res.body) {
        this.service.messageNotificaionService('success', "GIT Project clonned successfully");
        this.getActions();
      } else {
        this.service.messageNotificaionService('error', "Some error occurued while cloning GIT Project");
      }
    });
  }

  isEmptyArray(data: any[]): boolean {
    if (!data)
      return true;
    return data.length === 1 && Array.isArray(data[0]) && data[0].length === 0;
  }

  reqBody() {
    let requestBody = {
      "environment": [
        {
          "name": "datasetId",
          "value": this.datasetName
        },
        {
          "name": "org",
          "value": sessionStorage.getItem("organization")
        }
      ]
    };
    return requestBody;
  }

  async refreshJobStatus(event: string) {
    if (event) {
      this.busy = this.eventsService.getEventByName(event).subscribe((eventRes) => {
        let jobdetails = JSON.parse(eventRes.jobdetails);
        let eventStat = jobdetails[0].last_refresh_status
        if (eventStat == 'RUNNING') {
          this.service.getEventStatus(jobdetails[0].last_refresh_event).subscribe(
            status => {
              this.stat = status
              this.event_status = status
              jobdetails[0]["last_refresh_status"] = this.event_status
              eventRes.jobdetails = JSON.stringify(jobdetails)
              this.busy = this.eventsService.createEvent(eventRes).subscribe((response) => {
                this.service.message('Status refreshed')
              }, error => {
                this.service.message('Event not updated due to error: ' + error, 'error')
              });
            });
        } else {
          this.event_status = jobdetails[0].last_refresh_status
          this.service.message('Status refreshed')
        }
      });
    }
  }

  setCorelId(dstid, corelid, name) {
    this.datasetsService.savecorelId(dstid, corelid, name).subscribe((res) => {
      let dataset = res;
    }, error => {
      this.service.message('Error in corelId! ' + error,'error')
    }
    );
  }

  triggerGitFilesSummaryGenetationEvent() {
    try {
      let updateEventName = "CodeSummarization";
      this.eventsService.getEventByName(updateEventName).subscribe((eventRes) => {
        if (eventRes != null) {
          let jobdetails = JSON.parse(eventRes.jobdetails);
          let selectedRunType = jobdetails[0].runtime;
          this.corelid = jobdetails[0].last_refresh_event
          const requesting = this.reqBody();
          this.eventsService.triggerPostEvent(updateEventName, requesting, selectedRunType['dsName']).subscribe((res) => {
            this.event_status = 'RUNNING'
            jobdetails[0]["last_refresh_event"] = res
            this.service.message(updateEventName + " Job Triggered Successfully", 'success');
            this.service.getEventStatus(res).subscribe(status => {
              this.event_status = status
              jobdetails[0]["last_refresh_status"] = this.event_status
              eventRes.jobdetails = JSON.stringify(jobdetails)
              this.busy = this.eventsService.createEvent(eventRes).subscribe((response) => {
                this.corelid = jobdetails[0].last_refresh_event
              }, error => {
                this.service.message('Event not updated due to error: ' + error, 'error')
              });
            });
            this.corelid = jobdetails[0].last_refresh_event
            this.setCorelId(this.card.id, this.corelid, updateEventName);
            this.ngOnInit();
            this.refreshJobStatus(updateEventName)
          }, error => {
            this.service.message('Job not triggered due to error: ' + error, 'error')
          });
        } else {
          this.service.errorMessage('Please check event ' + updateEventName)
        }
      }, error => {
        this.service.message('Job not triggered due to error: ' + error, 'error')
      });
    }
    catch (Exception) {
      this.service.message('Some error occured', 'error');
    }
  }
  
}
