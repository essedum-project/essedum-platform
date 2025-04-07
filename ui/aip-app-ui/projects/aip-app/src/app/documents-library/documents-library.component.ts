import { Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { Services } from '../services/service';
import { DatasetServices } from '../dataset/dataset-service';
import { AdapterServices } from '../adapter/adapter-service';
import { SemanticService } from '../services/semantic.services';
import { SemanticSearchResult } from '../DTO/SemanticSearchResult';
import { SemanticSearchDataSetViewDialogComponent } from '../semantic-search-dialog/semantic-search-dataset-view/semantic-search-dataset-view-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { LedsModalService } from 'leds-lib';
import { EventsService } from '../services/event.service';
import { Subscription } from 'rxjs';
import { JobsService } from '../services/jobs.service';
import { HttpClient } from '@angular/common/http';
import { saveAs as importedSaveAs } from "file-saver";
import { DatePipe } from '@angular/common';
import { DocumentViewComponent } from './document-view/document-view.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { OpenTelemetryService } from 'com-lib-util';

@Component({
  selector: 'app-documents-library',
  templateUrl: './documents-library.component.html',
  styleUrls: ['./documents-library.component.scss']
})
export class DocumentsLibraryComponent {

  @ViewChild('scrollableDiv', { read: ElementRef })
  public scrollableDiv: ElementRef<any>;
  @ViewChild('scrollableDivForDocCards', { read: ElementRef })
  public scrollableDivForDocCards: ElementRef<any>;

  isExpanded: boolean = false;
  tooltip: string = 'above';
  filteredIndexNames: any;
  knowledgeBaseFilter: String;
  indexNames: any;
  allTopicsSelected: boolean = true;
  selectedIndexNames: string[] = [];
  mlTopics: any;
  topicAdaperInstance: any;
  faqs: any;
  selectedQuestions = [];
  queryIndexes: string[] = [];
  defaultKB: string;
  DEFAULT_KNOWLEDGE_BASE_KEY = 'icip.knowledgebase.default';
  mladaptersSpp: any;
  mladaptersFormattedapispec: any;
  adapterAndInstanceNames: any;
  hasClickedRight: boolean = false;
  isScrollAtEnd: boolean = false;
  hasClickedRightDoc: boolean = false;
  isScrollAtEndDoc: boolean = false;
  cards: any;
  filteredCards: any;
  noOfItems: number;
  noOfPages: number = 0;
  pageSize: number;
  pageArr: number[] = [];
  pageNumber: any;
  cardTitle: String = "Comprehend Library";
  selectedfaq: any;
  semanticSearchActive: boolean = false;
  query: string;
  filt: any;
  count = 0;
  inputData: any;
  loading: boolean = false;
  tooltipPoition: string = 'above';
  showQuestions: boolean = false;
  triggeredFirstTime = 0;
  semanticSearchResult: SemanticSearchResult[] = [];
  docViewType = { "GIT": true, "Doc": true };
  docType: String[] = ["GIT", "Doc"];
  numberOfSelectedIndexes = 0;
  iconIterations = Array(5).fill(0);
  ratingList = [];

  // pagination
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();
  endIndex: number;
  startIndex: number;
  pageNumberChanged: boolean = true;
  dispCards: any;
  itemsPerPage: number[] = []
  embeddedStatus: any = {};
  transcribeStatus: any = {};
  translationStatus: any = {};
  summaryStatus: any = {};
  questionsStatus: any = {};
  selectedEvent: any;

  avail_refresh: boolean = true;
  corelid: string;
  busy: Subscription;
  event_status: string = '';
  eventName;
  selectedCard: any;
  filteredTopics: any;
  errCount: number = 0;
  type: boolean;
  status: any;
  rateData: { selectedModule: string; selectedElement: any; selectedElementAlias:any, previousRating: any; previousFeedback: any; };


  constructor(
    private telemetry: OpenTelemetryService,
    private service: Services,
    private datasetService: DatasetServices,
    private adapterServices: AdapterServices,
    private semanticService: SemanticService,
    private dialog: MatDialog,
    private modalService: LedsModalService,
    private eventsService: EventsService,
    private jobService: JobsService,
    private http: HttpClient,
    private datepipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  telemetryCall(){
    this.telemetry.startTelemetry('aip-app','DatasourceComponent',sessionStorage.getItem('organization'))
  }
  async ngOnInit() {
    this.telemetryCall();
    this.count = 0;
    this.hasClickedRight = false;
    this.isScrollAtEnd = false;
    this.hasClickedRightDoc = false;
    this.isScrollAtEndDoc = false;
    this.showQuestions = true;
    this.semanticSearchResult = [];
    this.selectedfaq = undefined;
    this.pageNumber = 1;
    if (this.pageNumber && this.pageNumber > 5) {
      this.endIndex = this.pageNumber + 2;
      this.startIndex = this.endIndex - 5;
    } else {
      this.startIndex = 0;
      this.endIndex = 5;
    }
    // this.renderSemanticSeach();
    this.updatePageSize();
    this.getDocumentsByDatasourceType();
    this.fetchIndexNamesByOrg();
    await this.selectDefaultKB().then((res) => {
      this.defaultKB = res.body;
    }).catch((error) => {
      this.service.message('Unable to Fetch Default Knowledge base!', 'warning');
    });
  }

  getRatingByUserAndModule() {
    this.service.getRatingByUserAndModule("Comprehend").subscribe(res => {
      this.ratingList = res.body;
      this.cards.forEach(card => {
        let found = this.ratingList.filter(_ => _.element == card.name)[0];
        if (found)
          card['rate'] = found.rating;
        else
          card['rate'] = 0;
       })
    })
  }

  // to get documents by datasource type
  getDocumentsByDatasourceType() {
    let drcType = [];
    Object.keys(this.docViewType).forEach((type) => {
      if (this.docViewType[type] == true)
        drcType.push(type);
    });
    this.datasetService.getCountDatasourceType(drcType).subscribe((resp: any) => {
      this.noOfItems = resp;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
    });
    this.datasetService.getByDatasourceType(drcType, this.pageNumber, this.pageSize).subscribe((resp: any) => {
      this.cards = resp;
      this.filteredCards = resp;
      this.getRatingByUserAndModule();
      // generate embedding status
      this.cards.forEach(card => {
        this.semanticService.getIngestedTopicsByDatasetnameAndOrg(card.name).subscribe(res => {
          if (res && res.length > 0) {
            this.embeddedStatus[card.name] = res[0].status;
            console.log("Embedded status", this.embeddedStatus[card.name])
          }
        });

        // dataset enrichment
        if (card.event_details != null) {
          let events = JSON.parse(card.event_details);
          this.filteredTopics = events;
          // let event = events[0];
          events.forEach(event => {
            this.service.getEventStatus(event.corelId).subscribe(resp => {
              switch (event.eventName) {
                case 'Transcribe':
                  this.transcribeStatus[card.name] = resp;
                  break;
                case 'Translation':
                  this.translationStatus[card.name] = resp;
                  break;
                case 'Summary':
                  this.summaryStatus[card.name] = resp;
                  break;
                case 'FAQ':
                  this.questionsStatus[card.name] = resp;
                  break;
                default:
                  break;
              }
            });
          });
        }
      });

    });
  }

  async selectDefaultKB(): Promise<any> {
    return await this.service.getConstantByKey(this.DEFAULT_KNOWLEDGE_BASE_KEY).toPromise();
  }

  fetchIndexNamesByOrg() {
    this.indexNames = [];
    this.filteredIndexNames = [];
    this.selectedIndexNames = [];
    this.datasetService.getIndexNamesByOrg(sessionStorage.getItem('organization')).subscribe((res) => {
      this.mlTopics = res;
      this.topicAdaperInstance = {};
      this.faqs = {};
      this.mlTopics.forEach(topic => {
        if (!this.indexNames.includes(topic.topicname)) {
          this.indexNames.push(topic.topicname);
          this.selectedIndexNames.push(topic.topicname);
          this.filteredIndexNames.push(topic.topicname);
          if (!this.topicAdaperInstance[topic.topicname])
            this.topicAdaperInstance[topic.topicname] = topic.adapterinstance;
          if (!this.faqs[topic.topicname] && topic.suggested_queries != null) {
            this.faqs[topic.topicname] = JSON.parse(topic.suggested_queries);
          }
        }
      });

      this.selectedQuestions = [];
      const faqsKeys = Object.keys(this.faqs);
      const maxQuestions = Math.max(...faqsKeys.map(key => this.faqs[key].length));
      for (let i = 0; i < maxQuestions; i++) {
        for (let key of faqsKeys) {
          if (this.selectedIndexNames.includes(key))
            if (this.faqs[key][i]) {
              if (!this.selectedQuestions.includes(this.faqs[key][i])) {
                this.selectedQuestions.push(this.faqs[key][i]);
              }
            }
        }
      }
      this.allTopicsSelected = true;
      if (this.queryIndexes.length > 0) {
        this.selectedIndexNames = this.queryIndexes;
        if (this.selectedIndexNames.length != this.indexNames.length) {
          this.allTopicsSelected = false;
          this.changeQuestions(this.selectedIndexNames);
          setTimeout(() => {
            // this.getdatasetsByTopics();
          }, 1000);
          //this.clearSelectedTopics();
        } else {
          this.selectAllTopics();
        }
      } else {
        this.selectedIndexNames = [];
        // this.indexNames.forEach(indexName => {
        //   this.selectedIndexNames.push(indexName);
        // });
        this.selectedIndexNames.push(this.defaultKB);
        this.changeQuestions(this.selectedIndexNames);
        // this.getdatasetsByTopics();
        //this.clearSelectedTopics();
        //this.selectAllTopics();
      }
      this.renderAdapterInstancesForSemanticSearch();
    }, ((error) => {
      console.error('Error occurred! while fetching indexNames');
    }));
  }

  renderAdapterInstancesForSemanticSearch() {
    this.mladaptersSpp = {};
    this.mladaptersFormattedapispec = {};
    this.adapterAndInstanceNames = {};
    this.mlTopics.forEach(topic => {
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
                }
              });
          }
        });
      }
    });
  }

  changeQuestions(selectedIndexNames: any) {
    this.selectedQuestions = [];
    if (this.scrollableDiv && this.scrollableDiv.nativeElement) {
      this.hasClickedRight = false;
      this.isScrollAtEnd = false;
      this.scrollableDiv.nativeElement.scrollLeft = 0;
    }
    const faqsKeys = Object.keys(this.faqs);
    const maxQuestions = Math.max(...faqsKeys.map(key => this.faqs[key].length));
    for (let i = 0; i < maxQuestions; i++) {
      for (let key of faqsKeys) {
        if (selectedIndexNames.includes(key))
          if (this.faqs[key][i]) {
            if (!this.selectedQuestions.includes(this.faqs[key][i])) {
              this.selectedQuestions.push(this.faqs[key][i]);
            }
          }
      }
    }
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  selectedFaqMethod(faq) {
    this.selectedfaq = faq;
    this.onSelectedFaq(faq);
  }

  onSelectedFaq(faq) {
    let isFaq = true;
    let triggercount = 0;
    if (this.triggeredFirstTime != 0) {
      triggercount = 1;
      isFaq = true;
    }
    else {
      isFaq = false;
      triggercount = 0;
      this.triggeredFirstTime = this.triggeredFirstTime + 1;
    }
    this.query = faq;
    this.filt = faq;
    // this.updateQueryParam(this.pageNumber, this.filt);
    this.semanticSearchActive = true;
    this.inputData = {
      count: 1,
      selectedIndexNames: this.selectedIndexNames,
      semanticSearchResult: [],
      query: this.query,
      loading: this.loading,
      topicAdaperInstance: this.topicAdaperInstance,
      adapterAndInstanceNames: this.adapterAndInstanceNames,
      mladaptersFormattedapispec: this.mladaptersFormattedapispec,
      isFaq: isFaq,
    }
  }

  // pagination

  nextPage() {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      this.changePage();
    }
  }

  prevPage() {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      this.changePage();
    }
  }

  changePage(page?: number) {
    if (page && page >= 1 && page <= this.noOfPages) this.pageNumber = page;
    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      this.pageChanged.emit(this.pageNumber);
      if (this.pageNumber > 5) {
        this.endIndex = this.pageNumber;
        this.startIndex = this.endIndex - 5;
      } else {
        this.startIndex = 0;
        this.endIndex = 5;
      }
    }
    this.getDocumentsByDatasourceType();
  }

  selectedButton(i) {
    if (i == this.pageNumber)
      return { "color": "white", "background": "#7b39b1" }
    else
      return { "color": "black" }
  }

  clearSemanticSearchBoolean($event) {
    if ($event && $event != 'semanticSearchNotActive' && $event != 'hideQuestions')
      this.clearSemanticSearch()
    else if ($event == 'semanticSearchNotActive') {
      this.semanticSearchActive = false;
    } else if ($event == 'hideQuestions') {
      this.showQuestions = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updatePageSize();
  }

  updatePageSize() {
    this.pageSize = 0;
    this.pageNumber = 1;
    if (window.innerWidth > 1440) {
      this.itemsPerPage = [8, 16, 32, 48, 64, 80];
      this.pageSize = this.pageSize || 8; // lg

    } else if (window.innerWidth > 1024 && window.innerWidth <= 1440) {
      this.itemsPerPage = [6, 9, 18, 36, 54, 72];
      this.pageSize = this.pageSize || 6; //md

    } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      this.itemsPerPage = [4, 8, 12, 16, 20, 24];
      this.pageSize = this.pageSize || 4; //sm

    } else if (window.innerWidth < 768) {
      this.itemsPerPage = [3, 6, 9, 12, 15, 18];
      this.pageSize = this.pageSize || 3; //xs
    }
    this.getDocumentsByDatasourceType();
  }

  selectedDocType(dsrcType) {
    this.docViewType[dsrcType] = !this.docViewType[dsrcType];
    this.getDocumentsByDatasourceType();
  }

  // document header actions
  // open Notification
  openNotification() {
  }

  // open Feedback
  openFeedback() {
  }

  // toggle to filter 
  toggler(isExpanded: boolean) {
    if (isExpanded) {
      return { width: '79%', margin: '0 0 0 20%' };
    } else {
      return { width: '99%', margin: '0%' };
    }
  }

  // clear semantic search
  clearSemanticSearch() {
    this.count = 0;
    this.semanticSearchActive = false;
    this.filt = '';
    this.loading = false;
    this.selectedIndexNames = [];
    this.selectedfaq = undefined;
    this.clearSelectedTopics();
  }

  // clear selected topics
  clearSelectedTopics() {
    this.allTopicsSelected = false;
    this.selectedfaq = undefined;
    this.selectedQuestions = [];
    this.selectedIndexNames = [];
    // this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id, this.selectedSeachOption);
    this.getDocumentsByDatasourceType();
  }

  // Filters left side
  // generate questions
  reGenerateAllFAQs() {
    
    this.service.message('Questions regeneration has been triggered!', 'success');
    this.numberOfSelectedIndexes = 0;
    if (this.indexNames && this.indexNames.length > 0 && (!this.selectedIndexNames || this.selectedIndexNames.length === 0)) {
      this.selectedIndexNames = this.indexNames;
    }
    try {
      this.selectedIndexNames.forEach(async indexId => {
        try {
          let adapterInstanceName = this.topicAdaperInstance[indexId];
          let requestBody = {};
          requestBody["index"] = indexId;
          let url = `/api/adapters/${adapterInstanceName}/semanticsearch_faq/${sessionStorage.getItem('organization')}?isInstance=true`;
          let params = {}
          let headers = {}
          let resp = this.adapterServices.callPostApi(url, requestBody, params, headers).toPromise();
          await resp.then((resp) => {
            if (resp && resp.body) {
              this.numberOfSelectedIndexes = this.numberOfSelectedIndexes + 1;
              if (this.selectedIndexNames.length === this.numberOfSelectedIndexes) {
                this.selectedIndexNames = []
                this.ngOnInit();
              }
              let result = resp.body;
              let requestBodyForTopicFAQs = {};
              requestBodyForTopicFAQs["topicname"] = indexId;
              requestBodyForTopicFAQs["suggested_queries"] = result;
              requestBodyForTopicFAQs["organization"] = sessionStorage.getItem('organization');
              this.semanticService.addOrUpdateTopicFAQs(requestBodyForTopicFAQs).subscribe(res => {
              });
            } else {
              this.numberOfSelectedIndexes = this.numberOfSelectedIndexes + 1;
              if (this.selectedIndexNames.length === this.numberOfSelectedIndexes) {
                this.selectedIndexNames = []
                this.ngOnInit();
              }
            }
          }
          );
        } catch (error) {
          console.log('ERROR:', error);
          this.numberOfSelectedIndexes = this.numberOfSelectedIndexes + 1;
          if (this.selectedIndexNames.length === this.numberOfSelectedIndexes) {
            this.selectedIndexNames = []
            this.ngOnInit();
          }
        }
      }
      );
    } catch (error) {
      console.log('ERROR:', error);
      this.numberOfSelectedIndexes = this.numberOfSelectedIndexes + 1;
      if (this.selectedIndexNames.length === this.numberOfSelectedIndexes) {
        this.selectedIndexNames = []
        this.ngOnInit();
      }
    }
  }

  // select all topics
  selectAllTopics() {
    this.hasClickedRight = false;
    this.isScrollAtEnd = false;
    if (!this.selectedIndexNames)
      this.selectedIndexNames = [];
    this.filteredIndexNames.forEach(indexName => {
      if (!this.selectedIndexNames.includes(indexName))
        this.selectedIndexNames.push(indexName);
    });
    let indexesQuery = this.selectedIndexNames.join(',');
    // this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id, this.selectedSeachOption, indexesQuery);
    if (this.indexNames.length === this.selectedIndexNames.length) {
      this.allTopicsSelected = true;
    } else {
      this.allTopicsSelected = false;
    }
    this.changeQuestions(this.selectedIndexNames);
  }

  // filter the KBs
  filterKBs() {
    this.filteredIndexNames = [];
    if (this.knowledgeBaseFilter && this.knowledgeBaseFilter != "") {
      this.indexNames.forEach(indexName => {
        if (indexName?.toUpperCase().includes(this.knowledgeBaseFilter?.toUpperCase())) {
          this.filteredIndexNames.push(indexName);
        }
      });
    }
    else if (this.knowledgeBaseFilter == "") {
      this.allTopicsSelected = true;
      this.indexNames.forEach(indexName => {
        this.filteredIndexNames.push(indexName);
      });
    }
  }

  // clear KB search
  clearKBsearch() {
    this.knowledgeBaseFilter = "";
    //this.allTopicsSelected=true;
    //this.selectedIndexNames = [];
    this.filteredIndexNames = [];
    this.indexNames.forEach(indexName => {
      //this.selectedIndexNames.push(indexName);
      this.filteredIndexNames.push(indexName);
    });
    if (this.indexNames.length === this.selectedIndexNames.length) {
      //if(this.filteredIndexNames.length===this.selectedIndexNames.length){
      this.allTopicsSelected = true;
    } else {
      this.allTopicsSelected = false;
    }
  }

  // select KB
  selectedIndex(indexName) {
    if (this.selectedIndexNames.includes(indexName)) {
      let indexToRemove = this.selectedIndexNames.indexOf(indexName);
      if (indexToRemove !== -1) {
        this.selectedIndexNames.splice(indexToRemove, 1);
      }
    } else {
      this.selectedIndexNames.push(indexName);
    }
    this.changeQuestions(this.selectedIndexNames);
    this.hasClickedRight = false;
    this.isScrollAtEnd = false;
    let indexesQuery = this.selectedIndexNames.join(',');
    // this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id, this.selectedSeachOption, indexesQuery);

    if (this.filteredIndexNames.length === this.selectedIndexNames.length) {
      this.allTopicsSelected = true;
    } else {
      this.allTopicsSelected = false;
    }
  }


  // How may I help you?
  searchByContentParams(filt) {
    // this.updateQueryParam(this.pageNumber, filt);
  }

  onEnter() {
    this.selectedfaq = undefined;
    this.query = this.filt;
    if (this.selectedIndexNames.length == 0) {
      this.selectedIndexNames.push(this.defaultKB);
    }
    // this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id, 'Content', this.selectedIndexNames.toString());
    this.semanticSearchActive = true;
    this.count = this.count + 1;
    this.inputData = {
      count: this.count,
      selectedIndexNames: this.selectedIndexNames,
      semanticSearchResult: [],
      query: this.query,
      loading: this.loading,
      topicAdaperInstance: this.topicAdaperInstance,
      adapterAndInstanceNames: this.adapterAndInstanceNames,
      mladaptersFormattedapispec: this.mladaptersFormattedapispec,
    }
  }

  // Question Tab navigate
  // scroll left
  scrollLeftForQuestions(): void {
    this.scrollableDiv.nativeElement.scrollTo({
      left: this.scrollableDiv.nativeElement.scrollLeft - 150,
      behavior: 'smooth',
    });
  }

  // scroll right
  scrollRightForQuestion() {
    this.scrollableDiv.nativeElement.scrollTo({
      left: this.scrollableDiv.nativeElement.scrollLeft + 150,
      behavior: 'smooth',
    });
  }

  // check scroll
  checkScroll() {
    let scrollContainer = this.scrollableDiv.nativeElement
    const isAtEnd = scrollContainer.scrollWidth - scrollContainer.scrollLeft === scrollContainer.clientWidth;
    this.isScrollAtEnd = isAtEnd;
    this.hasClickedRight = scrollContainer.scrollLeft !== 0;
  }

  // Document Tab navigate
  // scroll left document
  scrollLeftForDocCards(): void {
    this.scrollableDivForDocCards.nativeElement.scrollTo({
      left: this.scrollableDivForDocCards.nativeElement.scrollLeft - 300,
      behavior: 'smooth',
    });
  }

  // scroll right document
  scrollRightForDocCards() {
    this.scrollableDivForDocCards.nativeElement.scrollTo({
      left: this.scrollableDivForDocCards.nativeElement.scrollLeft + 300,
      behavior: 'smooth',
    });
  }

  // check scroll document
  checkScrollDoc() {
    let scrollContainer = this.scrollableDivForDocCards.nativeElement
    const isAtEnd = scrollContainer.scrollWidth - scrollContainer.scrollLeft === scrollContainer.clientWidth;
    this.isScrollAtEndDoc = isAtEnd;
    this.hasClickedRightDoc = scrollContainer.scrollLeft !== 0;
  }

  // card icons
  getIconClass(views): string {
    switch (views) {
      case 'Folder View':
        return 'icon-Superannuation';
      case 'Image View':
        return 'icon_jpeg';
      case 'Audio View':
        return 'announcement-icon';
      case 'Text View':
        return 'document-icon';
      case 'Zip View':
        return 'icon_zip';
      case 'Table View':
        return 'icon_grid_view';
      case 'Pdf View':
        return 'icon_pdf';
      case 'Video View':
        return 'icon_youtube';
      case 'Git View':
        return 'bi bi-github';
      case 'Json View':
        return 'bi bi-filetype-json';
      case 'Doc View':
        return 'icon_doc';
      default:
        return 'icon_OMS';
    }
  }

  documentView(card) {
      this.telemetry.addTelemetryEvent(card.alias+' viewed ');
      const dialogRef = this.dialog.open(DocumentViewComponent, {
        height: '80%',
        width: '65%',
        disableClose: true,
        data: {
          type: 'View',
          datasetName: card.name,
        }
      });
  }

  openDatasetPreview(card) {
    let selectedReferenceObject = card;
    selectedReferenceObject["path"] = JSON.parse(card.attributes).path + '/' + JSON.parse(card.attributes).object;
    const dialogRef = this.dialog.open(SemanticSearchDataSetViewDialogComponent, {
      height: '80%',
      width: '80%',
      disableClose: true,
      data: {
        viewType: card.views,
        datasetId: card.name,
        org: card.organization,
        datasetName: card.alias,
        path: JSON.parse(card.attributes).path,
        actualObject: JSON.parse(card.attributes).object,
        selectedReferenceObject: selectedReferenceObject,
      }
    });
  }

  // this.service.getDatasource(this.dataset.datasource).subscribe(resp => {
  //   this.dataset.datasource = resp;
  //   let params = { page: 0, size: 50 }
  //   this.service.getProxyDbDatasetDetails(
  //     this.dataset,
  //     this.dataset.datasource,
  //     params,
  //     this.dataset.organization,
  //     true
  //   ).subscribe(resp => {
  //     if(resp.length===0) {
  //       this.datasetDataErr = 'There is an application error, please contact the application admin';
  //     } else {
  //       this.datasetDataErr=false;
  //       this.datasetData = resp;
  //     // if (this.views == 'Folder View') this.datasetData = resp;
  //     }
  //   }, err => {
  //     console.log(err);
  //     this.datasetDataErr = err;
  //   });
  // }, err => { console.log(err) });

  getEmbedStatus(datasetName) {
    let status = this.getEmbedDocStatus(datasetName);
    if (status && status == 'COMPLETED')
      return { "color": "green", "background": "#8fbc8f8a", "border-radius": "18px" };
    else
      return { "color": "grey" };
  }

  getEmbedDocStatus(datasetName) {
    if (this.embeddedStatus && this.embeddedStatus[datasetName])
      return this.embeddedStatus[datasetName];
    else
      return false;
  }

  getTranscribeStatus(datasetName) {
    let status = this.getTranscribeDocStatus(datasetName);
    if (status && status == 'COMPLETED')
      return { "color": "green", "background": "#8fbc8f8a", "border-radius": "18px" };
    else
      return { "color": "grey" };
  }

  getTranscribeDocStatus(datasetName) {
    if (this.transcribeStatus && this.transcribeStatus[datasetName])
      return this.transcribeStatus[datasetName];
    else
      return false;
  }

  getTranslationStatus(datasetName) {
    let status = this.getTranslationDocStatus(datasetName);
    if (status && status == 'COMPLETED')
      return { "color": "green", "background": "#8fbc8f8a", "border-radius": "18px" };
    else
      return { "color": "grey" };
  }

  getTranslationDocStatus(datasetName) {
    if (this.translationStatus && this.translationStatus[datasetName])
      return this.translationStatus[datasetName];
    else
      return false;
  }

  getSummaryStatus(datasetName) {
    let status = this.getSummaryDocStatus(datasetName);
    if (status && status == 'COMPLETED')
      return { "color": "green", "background": "#8fbc8f8a", "border-radius": "18px" };
    else
      return { "color": "grey" };
  }

  getSummaryDocStatus(datasetName) {
    if (this.summaryStatus && this.summaryStatus[datasetName])
      return this.summaryStatus[datasetName];
    else
      return false;
  }

  getQuestionsStatus(datasetName) {
    let status = this.getQuestionsDocStatus(datasetName);
    if (status && status == 'COMPLETED')
      return { "color": "green", "background": "#8fbc8f8a", "border-radius": "18px" };
    else
      return { "color": "grey" };
  }

  getQuestionsDocStatus(datasetName) {
    if (this.questionsStatus && this.questionsStatus[datasetName])
      return this.questionsStatus[datasetName];
    else
      return false;
  }

  openDialog(retrigger, type, status, card) {
    this.telemetry.addTelemetryEvent(card.alias + 'Data enrichments')
    this.selectedCard = card;
    this.selectedEvent = type;
    this.status = status;
    this.modalService.openModal(retrigger, 'mini')
  }

  open(type) {
    const dialogRef = this.dialog.open(DocumentViewComponent, {
      height: '80%',
      width: '55%',
      disableClose: true,
      data: {
        type: type,
        datasetName: this.selectedCard.name,
        attributes: this.selectedCard.attributes,
      }
    });
  }

  downloadSelectedFile(card: any) {
    if ((card.datasource?.type && card.datasource.type == 'MYSQL') || (card.views && card.views == 'Table View')) {
      this.downloadCSV(card);
      return;
    }
    let obj = JSON.parse(card.attributes).object;
    let data = this.getFileData(card.name, obj, card.organization)
    let extension = (obj).split('.').pop()
    if (extension.match('mkv')) {
      this.service.messageService('This file cannot be downloaded currently');
    }
    else {
      data.then((res) => {
        this.downloadSelectedFiles(obj, res[0], extension, card)
      })
    }
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

  getFileData(datasetName, fileName, org) {
    return this.service.getNutanixFileData(datasetName, [fileName], org).toPromise()
      .catch(err => this.service.messageService('Some error occured while fetching file'));
  }

  downloadSelectedFiles(filename: string, data: any, extension: string, card?: any) {
    if (extension.match(/doc|docx/)) {
      this.service.messageNotificaionService('success', "Download initiated");
      this.service.getDatasetByNameAndOrg(card.name, card.organization).subscribe(resp => {
        let datasetViewDataResp = resp;
        let obj = JSON.parse(card.attributes).object;
        let params = { page: 0, size: 50 };
        this.service.getProxyDbDatasetDetails(
          datasetViewDataResp,
          datasetViewDataResp.datasource,
          params,
          datasetViewDataResp.organization,
          true
        ).subscribe(resp => {
          resp?.forEach(fileN => {
            if (obj && fileN.includes(obj)) {
              const splitBySlash = fileN.split('/');
              let fileName = splitBySlash.slice(1).join('/');
              this.service.getNutanixFileData(card.name, obj, card.organization).subscribe((res) => {
                if (res && res[0]) {
                  
                  this.http.get(res[0][0], { responseType: 'blob' }).subscribe((resdoc) => {
                    const linkB = document.createElement('a');
                    const blob = new Blob([resdoc], { type: this.getExtntype(extension) });
                    linkB.href = window.URL.createObjectURL(blob);
                    linkB.download = obj;
                    linkB.click();
                    return;
                  },
                    (err) => this.service.messageService('Some error occured while downloading media file:', err));
                }
              });
            }
          });
        }, err => {
          console.log(err);
        });
      });
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
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'doc':
        return 'application/msword';
      default:
        return '';
    }
  }

  createDocument() {
    this.router.navigate(['./create'], { relativeTo: this.route });
  }

  openRatingModule(rate,card,i) {
    let found = this.ratingList.filter(e => e.element == card.name && e.module == "Comprehend");
    this.rateData = {
      "selectedModule":"Comprehend",
      "selectedElement":card.name,
      "selectedElementAlias":card.alias,
      "previousRating": found["rating"] || i+1,
      "previousFeedback": found["feedback"],
    }
    this.modalService.openModal(rate, 'mini');
  }

  deleteDoc(card) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.datasetService.deleteDatasets(card.name).subscribe((res) => {
          this.service.messageNotificaionService('success', "Dataset Deleted Successfully");
          this.telemetry.addTelemetryEvent(card.alias+ ' Deleted');
          this.service.deleteRatingByElement(card.name,'Dataset');
          this.clearSemanticSearch();
        }, ((error) => {
          this.service.messageNotificaionService('error', "Error");
        }));
      }
    });
  }
  ngOnDestroy() : void {
    let activeSpan = this.telemetry.fetchActiveSpan();
    this.telemetry.endTelemetry(activeSpan);
  }
}
