import { AdapterServices } from '../../adapter/adapter-service';
import { Component, EventEmitter, Input, Injector, Output, SimpleChanges, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { DatasetServices } from '../dataset-service';
import { MatDialog } from '@angular/material/dialog';
import { Services } from '../../services/service';
import { SemanticSearchContext } from '../../DTO/SemanticSearchContext';
import { SemanticSearchResult } from '../../DTO/SemanticSearchResult';
import { SemanticSearchDataSetViewDialogComponent } from '../../semantic-search-dialog/semantic-search-dataset-view/semantic-search-dataset-view-dialog.component';
import { LedsModalService } from 'leds-lib';
import { marked } from 'marked';
import { SemanticSearchDataSetSummaryViewDialogComponent } from '../../semantic-search-dialog/semantic-search-dataset-summary-view/semantic-search-dataset-summary-view-dialog.component';
import { HttpClient } from '@angular/common/http';
import { saveAs as importedSaveAs } from "file-saver";
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dataset-semantic',
  templateUrl: './dataset-semantic.component.html',
  styleUrls: ['./dataset-semantic.component.scss']
})
export class DatasetSemanticComponent {

  @ViewChild('scrollableDivForRefCards', { read: ElementRef })
  public scrollableDivForRefCards: ElementRef<any>;
  @Input() inputData : any;
  @Output() clearSemanticSearchBoolean = new EventEmitter<any>();
  selectedIndexNames: any;
  searchableIndexNames: any;
  semanticSearchResult: any;
  index: any;
  query: any;
  loading: any;
  semanticSearchContextList: SemanticSearchContext[] = [];
  answer: any;
  selectedReferenceId: any;
  selectedReferenceObject: any;
  adapterAndInstanceNames: any;
  mladaptersFormattedapispec: any;
  mladpSeverURLs: any;
  isInstance: boolean = true;
  topicAdaperInstance: any;
  serverUrl = "";
  response: any;
  semanticSearchActive: any;
  selectedIndexId: string;
  selectedResult: any;
  figure: any;
  result: any;
  chatUrl: any;
  numberOfSelectedIndexes: number = 0;
  semanticSearchCompleted: boolean = false;
  mladaptersSpp: any;
  backButton: boolean = true;
  triggeredFirstTime = 0;
  triggeredSecondTime = false
  showPopup = false;
  pageContentObject: any;
  columns: string[] = [];
  rows: any[] = [];
  summaryTab: boolean = false;
  hasClickedRight: boolean = false;
  isScrollAtEnd: boolean = false;
  summaries = {};
  tickets: any;
  isUpstreamAPIsDown = false;
  isOneSemanticSearchResultOnly = false;
  apiSpecServerUrl: string;

  constructor(
    private service: Services,
    private adapterServices: AdapterServices,
    private datasetService: DatasetServices,
    private dialog: MatDialog,
    private injector: Injector,
    private modalService: LedsModalService,
    private http: HttpClient,
    private datepipe: DatePipe,
  ) { }

  ngOnInit() {
    this.apiSpecServerUrl = null;
    this.summaries = {};
    this.hasClickedRight = false;
    this.isScrollAtEnd = false;
    this.isUpstreamAPIsDown = false;
    this.isOneSemanticSearchResultOnly = false;
    if (this.triggeredFirstTime == 0) {
      this.triggeredSecondTime = false;
    } else {
      this.triggeredFirstTime = this.triggeredFirstTime + 1;
      this.triggeredSecondTime = true;
    }
    this.semanticSearchResult = [];
    if(this.inputData){
      this.serverUrl = window.location.origin;
      this.selectedIndexNames = this.inputData.selectedIndexNames;
      this.semanticSearchResult = [];
      this.query = this.inputData.query;
      this.loading = this.inputData.loading;
      this.topicAdaperInstance = this.inputData.topicAdaperInstance;
      this.adapterAndInstanceNames = this.inputData.adapterAndInstanceNames;
      this.mladaptersFormattedapispec = this.inputData.mladaptersFormattedapispec;
      this.mladpSeverURLs = this.inputData.mladpSeverURLs;
      this.getResult();
      this.backButton = true;
    }
    else {
      this.chatUrl = this.injector.get('chatData')
      console.log('chatUrl:', this.chatUrl);
      let x = this.chatUrl.substring(this.chatUrl.lastIndexOf('?')+1)
      this.query = x.substring(x.indexOf('=')+1).replaceAll('%20',' ');
      this.selectAllTopics();
      this.backButton = false;
    }
    this.semanticSearchActive = true;
  }

  scrollLeftForRefCards(): void {
    this.scrollableDivForRefCards.nativeElement.scrollTo({
      left: this.scrollableDivForRefCards.nativeElement.scrollLeft - 150,
      behavior: 'smooth',
    });
  }
  scrollRightForRefCards() {
    this.scrollableDivForRefCards.nativeElement.scrollTo({
      left: this.scrollableDivForRefCards.nativeElement.scrollLeft + 150,
      behavior: 'smooth',
    });
  }
  
  
  checkScroll() {
    let scrollContainer=this.scrollableDivForRefCards.nativeElement
    const isAtEnd = scrollContainer.scrollWidth - scrollContainer.scrollLeft === scrollContainer.clientWidth;
    this.isScrollAtEnd = isAtEnd;
    this.hasClickedRight = scrollContainer.scrollLeft !== 0;
  }

  getIconClass(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!fileName.includes('.')) {
      return 'icon_grid_view';
    }
    switch (extension) {
      case 'pdf':
        return 'icon_pdf';
      case 'ppt':
        return 'icon_ppt';
      case 'xls':
        return 'icon_xls';
      case 'mp4':
        return 'icon_youtube';
      default:
        return 'document-icon';
    }
  }

  addSummaryToSummaries(dsetName, org, object, description, datasetView) {
    if (object && !object.includes('.') && description) {
      if (!this.summaries[dsetName]) {
        this.summaries[dsetName] = {};
      }
      this.summaries[dsetName][object] = description;
      return;
    }
    let parts = object.split('.');
    parts[parts.length - 1] = 'txt';
    let objectName = parts.join('.');
    if (!this.summaries[dsetName] || !this.summaries[dsetName][object] || this.summaries[dsetName][object] == undefined || this.summaries[dsetName][object] == null || this.summaries[dsetName][object] == '') {
      this.service.getNutanixFileData(dsetName, `.aip/Summary/${objectName}`, org).subscribe((res) => {
        if (res) {
          if (res && res.length > 0) {
            if (res[0] != null) {
              if (this.summaries[dsetName]) {
                this.summaries[dsetName][object] = res[0];
              } else {
                this.summaries[dsetName] = {};
                this.summaries[dsetName][object] = res[0];
              }
            } else {
              if (res[0] == null || res[0] == undefined || res[0] == '') {
                if (datasetView == 'Folder View') {
                  this.service.getDatasetByNameAndOrg(dsetName, org).subscribe(resp => {
                    let datasetViewDataResp = resp;
                    let params = { page: 0, size: 50 };
                    this.service.getProxyDbDatasetDetails(
                      datasetViewDataResp,
                      datasetViewDataResp.datasource,
                      params,
                      datasetViewDataResp.organization,
                      true
                    ).subscribe(resp => {
                      resp?.[0]?.forEach(file => {
                        if (objectName && file.includes(objectName) && file.includes('.aip/Summary')) {
                          const splitBySlash = file.split('/');
                          let fileName = splitBySlash.slice(1).join('/');
                          this.service.getNutanixFileData(dsetName, `${fileName}`, org).subscribe((res) => {
                            if (res) {
                              if (res && res.length > 0 && res[0]) {
                                if (this.summaries[dsetName]) {
                                  this.summaries[dsetName][object] = res[0];
                                } else {
                                  this.summaries[dsetName] = {};
                                  this.summaries[dsetName][object] = res[0];
                                }
                              }
                            }
                          });
                        }
                      });
                    }, err => {
                      console.log(err);
                    });
                  });
                }
              }
            }
          }
        }
      });
    }
  }

  fetchSummaryByDsetNameAndObject(dsetName, object) {
    // Check if the summary for the given dsetName exists
    if (this.summaries[dsetName]) {
      // Check if the object exists within the dsetName summaries
      if (this.summaries[dsetName][object]) {
        return this.summaries[dsetName][object];
      }
    }
  }

  getResult() {
    this.isUpstreamAPIsDown = false;
    this.summaryTab = false;
    this.isOneSemanticSearchResultOnly = false;
    if (this.selectedIndexNames?.length > 0) {
      this.searchableIndexNames = [];
      if (this.selectedIndexNames?.length > 0) {
        this.searchableIndexNames = this.selectedIndexNames;
      }
      this.semanticSearchResult = [];
      if (this.index && this.index != "") {
        if (!this.searchableIndexNames.includes(this.index)) {
          this.searchableIndexNames.push(this.index);
        }
      }
      this.numberOfSelectedIndexes = 0;
      this.semanticSearchCompleted = false;
      if (this.query) {
        this.loading = true
        this.semanticSearchContextList = [];
        this.answer = '';
        this.figure = undefined;
        this.selectedReferenceId = undefined
        this.selectedReferenceObject = undefined;
        this.selectedIndexNames.forEach(async indexId => {
          try {
            let adapterInstanceName = this.topicAdaperInstance[indexId];
            let adapterName = this.adapterAndInstanceNames[adapterInstanceName];
            let spec = JSON.parse(JSON.stringify(this.mladaptersFormattedapispec[adapterInstanceName][0]));
            if (spec && this.mladpSeverURLs && this.mladpSeverURLs[adapterInstanceName]) {
              let apiSpec = this.mladpSeverURLs[adapterInstanceName];
              if (apiSpec)
                this.apiSpecServerUrl = apiSpec;
            }
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
              if (this.apiSpecServerUrl && this.apiSpecServerUrl.includes("api"))
                this.serverUrl = this.apiSpecServerUrl.replaceAll("{spec}", adapterInstanceName).replaceAll("{org}", sessionStorage.getItem("organization")).replaceAll("{host}", window.location.origin);
              url = this.serverUrl + specPath
              let resp = this.adapterServices.callPostApi(url, spec.requestBody.value, params, headers).toPromise();
              await resp.then((resp) => {
                if (resp.body) {
                  let result = resp.body;
                  let answerTemp = result[0]['Answer'];
                  if (answerTemp && typeof (answerTemp) != "string")
                    answerTemp = answerTemp.toString();
                  semanticSearchResultTemp.summary = answerTemp;
                  if (result[0] && result[0]['figure'])
                    semanticSearchResultTemp.figure = result[0]['figure'];
                  if (result[0] && result[0]['tickets'])
                    semanticSearchResultTemp.tickets = result[0]['tickets'];
                  if (result[0] && result[0]['dataset_id'])
                    semanticSearchResultTemp.dataset_id = result[0]['dataset_id'];
                  if (result[0] && result[0]['dataset_type'])
                    semanticSearchResultTemp.dataset_type = result[0]['dataset_type'];
                  if (result[0] && result[0]['organization'])
                    semanticSearchResultTemp.organization = result[0]['organization'];
                  let index = 1;
                  result[1]['context'].forEach(async ele => {
                    let resBody = this.service.getDatasetByNameAndOrg(ele.metadata.dataset_id, ele.metadata.organization).toPromise();
                    await resBody.then((resBody) => {
                      if (resBody) {
                        let semanticSearchContext = new SemanticSearchContext();
                        semanticSearchContext.datasetId = ele.metadata.dataset_id;
                        if (resBody.alias)
                          semanticSearchContext.datasetName = resBody.alias;
                        semanticSearchContext.organization = ele.metadata.organization;
                        semanticSearchContext.datasetType = ele.metadata.dataset_type;
                        if (ele.metadata.start_time)
                          semanticSearchContext.startTime = ele.metadata.start_time;
                        else
                          semanticSearchContext.startTime = 0.001;
                        if (ele.metadata.end_time)
                          semanticSearchContext.endTime = ele.metadata.end_time;
                        if (ele.metadata.page)
                          semanticSearchContext.page = ele.metadata.page;
                        if (ele.metadata.data)
                          semanticSearchContext.data = ele.metadata.data;
                        if (resBody.views)
                          semanticSearchContext.datasetView = resBody.views;
                        semanticSearchContext.source = ele.metadata.source;
                        semanticSearchContext.pageContent = ele.page_content;
                        if (semanticSearchContext.source) {
                          if (semanticSearchContext.source.includes('/')) {
                            semanticSearchContext.object = semanticSearchContext.source.split('/').pop();
                          } else if (semanticSearchContext.source.includes('//')) {
                            semanticSearchContext.object = semanticSearchContext.source.split('//').pop();
                          } else if (semanticSearchContext.source.includes('\\')) {
                            semanticSearchContext.object = semanticSearchContext.source.split('\\').pop();
                          } else {
                            semanticSearchContext.object = semanticSearchContext.source;
                          }

                        }
                        if(semanticSearchContext && semanticSearchContext.object)
                        {
                          this.addSummaryToSummaries(semanticSearchContext.datasetId, semanticSearchContext.organization, semanticSearchContext.object, resBody.description, semanticSearchContext.datasetView);
                        }
                        if (resBody.attributes) {
                          let attrs = JSON.parse(resBody.attributes)
                          if (attrs.object)
                            semanticSearchContext.actualObject = attrs.object;
                          if (attrs.path)
                            semanticSearchContext.path = attrs.path;
                        }
                        semanticSearchContext.referenceId = index++;
                        semanticSearchContextListTemp.push(semanticSearchContext);
                      }
                    });
                  })
                  semanticSearchResultTemp.semanticSearchContextReferencesList = semanticSearchContextListTemp;
                  if (!this.semanticSearchResult.some(item => item.index === semanticSearchResultTemp.index)) {
                    this.semanticSearchResult.push(semanticSearchResultTemp);
                  }
                  this.numberOfSelectedIndexes = this.numberOfSelectedIndexes + 1;
                  this.semanticSearchResult.sort((a, b) => {
                    const phrase = "I don't have enough information";
                    const aHasPhrase = a.summary.includes(phrase);
                    const bHasPhrase = b.summary.includes(phrase);
                    if (aHasPhrase && !bHasPhrase) {
                      return 1;
                    } else if (!aHasPhrase && bHasPhrase) {
                      return -1;
                    } else {
                      return 0;
                    }
                  });
                  if (this.selectedIndexNames.length === this.numberOfSelectedIndexes) {
                    this.semanticSearchCompleted = true;
                    this.loading = false;
                    if (this.semanticSearchResult.length > 0) {
                      if(this.semanticSearchResult.length == 1)
                        this.isOneSemanticSearchResultOnly = true;
                      this.selectedResult = this.semanticSearchResult[0];
                      this.semanticSearchContextList = this.selectedResult.semanticSearchContextReferencesList;
                      if (this.semanticSearchContextList?.[0])
                        this.selectedReferenceObject = this.semanticSearchContextList?.[0];
                      if (this.selectedReferenceObject?.referenceId)
                        this.selectedReferenceId = this.selectedReferenceObject.referenceId;
                      this.selectedIndexName(this.semanticSearchResult[0].index, this.selectedResult);
                      if (this.semanticSearchResult.length > 1)
                      this.summaryTab = true;
                      this.hideQuestions();
                    }
                    else {
                      this.semanticSearchActive = false;
                      this.isUpstreamAPIsDown = true;
                    }
                  }
                  ;
                } else {
                  this.service.message('Upstream API is down!', 'warning');
                }
              }, err => {
                this.response = err
                this.numberOfSelectedIndexes = this.numberOfSelectedIndexes + 1;
                if (this.selectedIndexNames.length === this.numberOfSelectedIndexes) {
                  this.semanticSearchCompleted = true;
                  this.loading = false;
                  if (this.semanticSearchResult.length > 0) {
                    if (this.semanticSearchResult.length == 1)
                      this.isOneSemanticSearchResultOnly = true;
                    this.selectedResult = this.semanticSearchResult[0];
                    this.semanticSearchContextList = this.selectedResult.semanticSearchContextReferencesList;
                    if (this.semanticSearchContextList?.[0])
                      this.selectedReferenceObject = this.semanticSearchContextList?.[0];
                    if (this.selectedReferenceObject?.referenceId)
                      this.selectedReferenceId = this.selectedReferenceObject.referenceId;
                    this.selectedIndexName(this.semanticSearchResult[0].index, this.selectedResult);
                    if (this.semanticSearchResult.length > 1)
                    this.summaryTab = true;
                    this.hideQuestions();
                  }
                  else {
                    this.semanticSearchActive = false;
                    this.isUpstreamAPIsDown = true;
                  }
                }
                if (!err) this.response = "ERROR"
              })
            }
          } catch (error) {
            console.log('ERROR:', error);
            this.numberOfSelectedIndexes = this.numberOfSelectedIndexes + 1;
            if (this.selectedIndexNames.length === this.numberOfSelectedIndexes) {
              this.semanticSearchCompleted = true;
              this.loading = false;
              if (this.semanticSearchResult.length > 0) {
                if (this.semanticSearchResult.length == 1)
                  this.isOneSemanticSearchResultOnly = true;
                this.selectedResult = this.semanticSearchResult[0];
                this.semanticSearchContextList = this.selectedResult.semanticSearchContextReferencesList;
                if (this.semanticSearchContextList?.[0])
                  this.selectedReferenceObject = this.semanticSearchContextList?.[0];
                if (this.selectedReferenceObject?.referenceId)
                  this.selectedReferenceId = this.selectedReferenceObject.referenceId;
                this.selectedIndexName(this.semanticSearchResult[0].index, this.selectedResult);
                if (this.semanticSearchResult.length > 1)
                this.summaryTab = true;
              }
              else {
                this.semanticSearchActive = false;
                this.isUpstreamAPIsDown = true;
              }
            }
          }
        });
      }
      else {
        this.semanticSearchActive = false;
        this.semanticSearchNotActiveEmit();
        this.service.message('Please enter content to search!', 'warning');
      }
    } else {
      this.semanticSearchActive = false;
      this.semanticSearchNotActiveEmit();
      this.service.message('Please choose atleast one knowledge base!', 'warning');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.inputData.currentValue != changes.inputData.previousValue && 
      changes.inputData.currentValue["count"] != 1 && changes.inputData.currentValue["isFaq"]==undefined){
      this.ngOnInit();
    }

    if (changes.inputData.currentValue != changes.inputData.previousValue &&
      changes.inputData.currentValue["isFaq"] == true) {
      this.ngOnInit();
    }
  }

  selectAllTopics() {
    this.mladaptersSpp = {};
    this.selectedIndexNames = [];
    this.topicAdaperInstance = {};
    this.datasetService.getIndexNamesByOrg(sessionStorage.getItem('organization')).subscribe((res) => {
      if (res) {
        res.forEach(topic => {
          this.selectedIndexNames.push(topic.topicname);
          this.topicAdaperInstance[topic.topicname] = topic.adapterinstance;
          this.renderAdapterInstancesForSemanticSearch(res);
        });
      }
    })
  }

  renderAdapterInstancesForSemanticSearch(data) {
    this.mladaptersSpp = {};
    this.mladaptersFormattedapispec = {};
    this.adapterAndInstanceNames = {};
    data.forEach(topic => {
      if (!this.mladaptersSpp[topic.adapterinstance]) {
        this.adapterServices.getInstanceByNameAndOrganization(topic.adapterinstance).subscribe((respAdpInstance) => {
          if (respAdpInstance && respAdpInstance.adaptername) {
            if (!this.mladaptersSpp[topic.adapterinstance])
              this.adapterServices.getAdapteByNameAndOrganization(respAdpInstance.adaptername).subscribe((resAdp) => {
                if (resAdp) {
                  if (!this.mladaptersSpp[topic.adapterinstance]) {
                    let spp = JSON.parse(resAdp.apispec);
                    this.mladaptersSpp[topic.adapterinstance] = spp;
                    if (!this.adapterAndInstanceNames[topic.adapterinstance])
                      this.adapterAndInstanceNames[topic.adapterinstance] = respAdpInstance.adaptername;
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
                                responses.push(respObj)
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
                          if (!this.mladaptersFormattedapispec[topic.adapterinstance])
                            this.mladaptersFormattedapispec[topic.adapterinstance] = formattedapispec;
                        }
                      }
                    }
                  }
                  this.getResult();
                }
              });
          }
        });
      }
    });
  }

  clearSemanticSearch() {
    this.loading = false;
    this.index = '';
    this.answer = '';
    this.result = [];
    this.selectedIndexNames = [];
    this.semanticSearchContextList = [];
    this.clearSemanticSearchBoolean.emit(true);
  }

  semanticSearchNotActiveEmit() {
    this.clearSemanticSearchBoolean.emit('semanticSearchNotActive');
  }

  hideQuestions() {
    this.clearSemanticSearchBoolean.emit('hideQuestions');
  }

  tabChangeForIndexes(index) {
    if (this.scrollableDivForRefCards && this.scrollableDivForRefCards.nativeElement) {
      this.hasClickedRight = false;
      this.isScrollAtEnd = false;
      this.scrollableDivForRefCards.nativeElement.scrollLeft = 0;
    }
    if (index == 0) {
      this.summaryTab = true;
    } else {
      this.summaryTab = false;
      this.selectedIndexName(this.semanticSearchResult[index - 1].index);
    }
  }

  selectedIndexName(selectedIndexId, selectedResult?) {
    this.selectedIndexId = selectedIndexId;
    if (selectedResult)
      this.selectedResult = selectedResult;
    else
      this.selectedResult = this.semanticSearchResult.filter(result => result.index === selectedIndexId)?.[0];
    this.answer = this.selectedResult.summary;
    this.answer = this.answer.replaceAll('\\n', '\n');
    this.answer = this.answer.replaceAll('\\t', '\n');
    if (this.selectedResult && this.selectedResult.figure)
      this.figure = this.selectedResult.figure;
    else
      this.figure = undefined;
    if (this.selectedResult && this.selectedResult.tickets)
      this.tickets = this.selectedResult.tickets;
    else
      this.tickets = undefined;
    this.semanticSearchContextList = this.selectedResult.semanticSearchContextReferencesList;
    if (this.semanticSearchContextList?.[0])
      this.selectedReferenceObject = this.semanticSearchContextList?.[0];
    if (this.selectedReferenceObject?.referenceId)
      this.selectedReferenceId = this.selectedReferenceObject.referenceId;
  }

  selectedReference(reference) {
    this.selectedReferenceId = reference.referenceId;
    this.selectedReferenceObject = reference;
    if (this.selectedReferenceObject && this.selectedReferenceObject.pageContent) {
      this.selectedReferenceObject.pageContent = this.selectedReferenceObject.pageContent.replaceAll('\\n', '\n');
      this.selectedReferenceObject.pageContent = this.selectedReferenceObject.pageContent.replaceAll('\\t', '\n');
    }
    if (this.selectedReferenceObject && this.selectedReferenceObject.pageContent && this.selectedReferenceObject.pageContent.includes('{') && this.selectedReferenceObject.pageContent.includes('}')) {
      this.pageContentObject = JSON.parse(this.selectedReferenceObject.pageContent);
      this.columns = [];
      this.rows = [];
      this.columns = Object.keys(this.pageContentObject);
      const rowCount = Object.keys(this.pageContentObject[this.columns[0]]).length;
      for (let i = 0; i < rowCount; i++) {
        const row = {};
        this.columns.forEach(column => {
          row[column] = this.pageContentObject[column][i];
        });
        this.rows.push(row);
      }
    } else {
      this.pageContentObject = undefined;
      this.columns = [];
      this.rows = [];
    }
  }

  openDatasetPreview(dset, org, viewType, object, datasetName, actualObject, path, selectedReferenceObject) {
    const dialogRef = this.dialog.open(SemanticSearchDataSetViewDialogComponent, {
      height: '80%',
      width: '80%',
      disableClose: true,
      data: {
        viewType: viewType,
        datasetId: dset,
        org: org,
        object: object,
        datasetName: datasetName,
        actualObject: actualObject,
        path: path,
        selectedReferenceObject: selectedReferenceObject,
      }
    });
  }

  openDatasetSummary(selectedReferenceObject) {
    let summary = this.fetchSummaryByDsetNameAndObject(selectedReferenceObject.datasetId, selectedReferenceObject.object);
    const dialogRef = this.dialog.open(SemanticSearchDataSetSummaryViewDialogComponent, {
      height: '80%',
      width: '80%',
      disableClose: true,
      data: {
        summary: summary,
        selectedReferenceObject: selectedReferenceObject,
      }
    });
  }

  feedbackPopup(content) {
    this.showPopup = true;
    this.modalService.openModal(content, 'standard')
  }

  feedbackPositive() {
    this.service.message('Thank you for your feedback!', 'success');
  }

  checkAllIndexes(): boolean {
    return this.semanticSearchResult.every(val => val.summary.includes('I don\'t have enough information'));
  }

  convertToCSV(arr: any[]): string {
    if (arr.length === 0) {
      return '';
    }
    const csvRows = [];
    const headers = Object.keys(arr[0]);
    csvRows.push(headers.join(','));

    for (const row of arr) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) {
          return '';
        }
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  }

  downloadCSV(card) {
    this.service.messageNotificaionService('success', "Download initiated");
    this.service.getDatasetByNameAndOrg(card.datasetId, card.organization).subscribe(resp => {
      let datasetViewDataResp = resp;
      let params = { page: 0, size: 50 };
      this.service.getProxyDbDatasetDetails(
        datasetViewDataResp,
        datasetViewDataResp.datasource,
        params,
        datasetViewDataResp.organization,
        true
      ).subscribe(resp => {
        if (resp && resp.length > 0) {
          const csvString = this.convertToCSV(resp);
          const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
          importedSaveAs(blob, card.datasetName + " Data-" + this.datepipe.transform(new Date(), "ddMMMyyyy-hhmmssa") + ".csv");
        }
      });
    });
  }

  downloadSelectedFile(card: any) {
    if ((card.datasetType && card.datasetType == 'MYSQL') || (card.datasetView && card.datasetView == 'Table View')) {
      this.downloadCSV(card);
      return;
    }
    let data = this.getFileData(card.datasetId, card.object, card.organization)
    let extension = (card.object).split('.').pop()
    if (extension.match('mkv')) {
      this.service.messageService('This file cannot be downloaded currently');
    }
    else {
      data.then((res) => {
        this.downloadSelectedFiles(card.object, res[0], extension, card)
      })
    }
  }

  getFileData(datasetName, fileName, org) {
    return this.service.getNutanixFileData(datasetName, [fileName], org).toPromise()
      .catch(err => this.service.messageService('Some error occured while fetching file'));
  }

  downloadSelectedFiles(filename: string, data: any, extension: string, card?: any) {
    if (extension.match(/pdf|jpg|png|jpeg/)) {
      this.service.messageNotificaionService('success', "Download initiated");
      if (!data) {
        this.service.getDatasetByNameAndOrg(card.datasetId, card.organization).subscribe(resp => {
          let datasetViewDataResp = resp;
          let params = { page: 0, size: 50 };
          this.service.getProxyDbDatasetDetails(
            datasetViewDataResp,
            datasetViewDataResp.datasource,
            params,
            datasetViewDataResp.organization,
            true
          ).subscribe(resp => {
            resp?.[0]?.forEach(fileN => {
              if (card.object && fileN.includes(card.object)) {
                const splitBySlash = fileN.split('/');
                let fileName = splitBySlash.slice(1).join('/');
                this.service.getNutanixFileData(card.datasetId, `${fileName}`, card.organization).subscribe((res) => {
                  if (res && res[0]) {
                    const decode = atob(res[0]);
                    const byteArray = new Uint8Array(decode.length);
                    for (let i = 0; i < decode.length; i++) {
                      byteArray[i] = decode.charCodeAt(i);
                    }
                    const linkA = document.createElement('a');
                    const blobdata = new Blob([byteArray], { type: `application/${extension}` });
                    linkA.href = window.URL.createObjectURL(blobdata);
                    linkA.download = card.object;
                    linkA.click();
                  }
                });
              }
            });
          }, err => {
            console.log(err);
          });
        });
      } else {
        const decode = atob(data[0]);
        const byteArray = new Uint8Array(decode.length);
        for (let i = 0; i < decode.length; i++) {
          byteArray[i] = decode.charCodeAt(i);
        }
        const linkA = document.createElement('a');
        const blobdata = new Blob([byteArray], { type: `application/${extension}` });
        linkA.href = window.URL.createObjectURL(blobdata);
        linkA.download = card.object;
        linkA.click();
      }

    }
    else if (extension.match(/mp3|mp4|docx|pptx|xlsx|zip/)) {
      this.service.messageNotificaionService('success', "Download initiated");
      this.service.getDatasetByNameAndOrg(card.datasetId, card.organization).subscribe(resp => {
        let datasetViewDataResp = resp;
        let params = { page: 0, size: 50 };
        this.service.getProxyDbDatasetDetails(
          datasetViewDataResp,
          datasetViewDataResp.datasource,
          params,
          datasetViewDataResp.organization,
          true
        ).subscribe(resp => {
          resp?.[0]?.forEach(fileN => {
            if (card.object && fileN.includes(card.object)) {
              const splitBySlash = fileN.split('/');
              let fileName = splitBySlash.slice(1).join('/');
              this.service.getNutanixFileData(card.datasetId, `${fileName}`, card.organization).subscribe((res) => {
                if (res && res[0]) {
                  this.http.get(res[0][0], { responseType: 'blob' }).subscribe((resmp4) => {
                    const linkB = document.createElement('a');
                    const blob = new Blob([resmp4], { type: `application/${extension}` });
                    linkB.href = window.URL.createObjectURL(blob);
                    linkB.download = card.object;;
                    linkB.click();
                    return;
                  },
                    (err) => this.service.messageService('Some error occured while downloading media file: Please check connection settings', err));
                }
              });
            }
          });
        }, err => {
          console.log(err);
        });
      });
    }
    else if (extension.match(/csv|json|jsonl|txt/)) {
      let formattedData: string;
      if (!data) {
        this.service.getDatasetByNameAndOrg(card.datasetId, card.organization).subscribe(resp => {
          let datasetViewDataResp = resp;
          let params = { page: 0, size: 50 };
          this.service.getProxyDbDatasetDetails(
            datasetViewDataResp,
            datasetViewDataResp.datasource,
            params,
            datasetViewDataResp.organization,
            true
          ).subscribe(resp => {
            resp?.[0]?.forEach(fileN => {
              if (card.object && fileN.includes(card.object)) {
                const splitBySlash = fileN.split('/');
                let fileName = splitBySlash.slice(1).join('/');
                this.service.getNutanixFileData(card.datasetId, `${fileName}`, card.organization).subscribe((res) => {
                  if (res && res[0]) {
                    switch (extension) {
                      case 'csv':
                        const header = Object.keys(data[0]).join(',') + '\n';
                        const rows = data.map(obj => Object.values(obj).join(',') + '\n');
                        formattedData = header + rows.join('');
                        break;
                      case 'json':
                        formattedData = JSON.stringify(data, null, 2);
                        break;
                      case 'jsonl':
                        formattedData = data.map(obj => JSON.stringify(obj) + '\n').join('');
                        break;
                      case 'txt':
                        formattedData = data;
                        break;
                    }
                    const link = document.createElement('a');
                    const blobdata = new Blob([formattedData], { type: this.getExtntype(extension) });
                    const file = new File([blobdata], card.object, { type: this.getExtntype(extension) });
                    link.href = window.URL.createObjectURL(file);
                    link.download = card.object;;
                    link.click();
                  }
                });
              }
            });
          }, err => {
            console.log(err);
          });
        });
      } else {
        switch (extension) {
          case 'csv':
            const header = Object.keys(data[0]).join(',') + '\n';
            const rows = data.map(obj => Object.values(obj).join(',') + '\n');
            formattedData = header + rows.join('');
            break;
          case 'json':
            formattedData = JSON.stringify(data, null, 2);
            break;
          case 'jsonl':
            formattedData = data.map(obj => JSON.stringify(obj) + '\n').join('');
            break;
          case 'txt':
            formattedData = data;
            break;
        }
        const blobdata = new Blob([formattedData], { type: this.getExtntype(extension) });
        const file = new File([blobdata], filename, { type: this.getExtntype(extension) });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(file);
        link.download = card.object;;
        link.click();
      }
    }
    else {
      this.service.messageService('This file cannot be downloaded currently');
      return;
    }
  }

  getExtntype(extension: any): string {
    switch (extension) {
      case 'txt':
        return 'text/plain';
      case 'csv':
        return 'text/csv';
      case 'png':
      case 'jpeg':
      case 'jpg':
        return 'image/jpg'
      case 'jsonl':
        return 'application/jsonlines';
      case 'json':
        return 'application/json';
      case 'zip':
        return 'application/zip';
      default:
        return '';
    }
  }
  
}
