import { Component, ElementRef, EventEmitter, HostListener, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SemanticService } from '../../services/semantic.services';
import { Services } from '../../services/service';
import { SemanticSearchResult } from '../../DTO/SemanticSearchResult';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { DatasetServices } from '../dataset-service';
import { AdapterServices } from '../../adapter/adapter-service';
import { LedsModalService } from 'leds-lib';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient, HttpParams } from '@angular/common/http';
import { saveAs as importedSaveAs } from "file-saver";
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { OpenTelemetryService } from 'com-lib-util';

@Component({
  selector: 'app-dataset-knowledge',
  templateUrl: './dataset-knowledge.component.html',
  styleUrls: ['./dataset-knowledge.component.scss']
})
export class DatasetKnowledgeComponent implements OnInit, OnChanges {

  cards: any;
  filteredCards: any;
  records: boolean = false;
  mladaptersFormattedapispec: any;
  topicAdaperInstance: any;
  adapterAndInstanceNames: any;

  pageNumber: any;
  noOfPages: number = 0;
  endIndex: number;
  startIndex: number;
  pageSize: number;
  noOfItems: number;
  pageArr: number[] = [];
  itemsPerPage: number[] = [];
  pageNumberInput: number = 1;
  @Output() pageChanged = new EventEmitter<any>();

  semanticSearchActive: boolean = false;
  showQuestions: boolean = false;
  count = 0;
  filt: any;
  loading: boolean = false;
  allTopicsSelected: boolean = true;
  selectedQuestions = [];
  selectedAdapterType: string[] = [];

  datasetAlias: any;
  selectedIndexNames: string[] = [];
  selectedfaq: any;
  indexNames: any;

  tooltipPoition: string = 'above';
  createAuth: boolean;
  editAuth: boolean;
  deleteAuth: boolean;
  query: string;
  defaultKB: string;
  inputData: any;

  cardTitle: String = "Knowledge";
  DEFAULT_KNOWLEDGE_BASE_KEY = 'icip.knowledgebase.default';
  isExpanded = false;

  @ViewChild('scrollableDiv', { read: ElementRef })
  public scrollableDiv: ElementRef<any>;
  hasClickedRight: boolean = false;
  isScrollAtEnd: boolean = false;
  triggeredFirstTime = 0;

  semanticSearchResult: SemanticSearchResult[] = [];
  queryIndexes: string[] = [];
  isSemanticSearch: boolean;
  type: any;
  filteredIndexNames: any;
  mlTopics: any;
  faqs: any;
  mladaptersSpp: any;
  serverUrl = "";
  adapterInstances: any;
  adaptersOptions: OptionsDTO[] = [];

  embeddedStatus: any = {};
  transcribeStatus: any = {};
  translationStatus: any = {};
  summaryStatus: any = {};
  questionsStatus: any = {};

  filteredTopics: any;
  knowledgeBaseFilter: string;
  iconIterations = Array(5).fill(0);
  selectedCard: any;
  selectedEvent: any;
  status: any;
  rateData: { selectedModule: string; selectedElement: any; selectedElementAlias:any, previousRating: any; previousFeedback: any; };
  ratingList: any;
  numberOfSelectedIndexes = 0;

  constructor(
    private telemetry: OpenTelemetryService,
    private router: Router,
    private service: Services,
    private location: Location,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private http: HttpClient,
    private datepipe: DatePipe,
    private modalService: LedsModalService,
    private datasetService: DatasetServices,
    private adapterServices: AdapterServices,
    private semanticService: SemanticService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.fetchIndexNamesByOrg();
    this.semanticSearchResult = [];
  }
  telemetryCall(){
    this.telemetry.startTelemetry('aip-app','DatasourceComponent',sessionStorage.getItem('organization'))
  }
  async ngOnInit() {
    this.telemetryCall();
    this.count = 0;
    this.records = false;
    this.hasClickedRight = false;
    this.isScrollAtEnd = false;
    await this.selectDefaultKB().then((res) => {
      this.defaultKB = res.body;
    }).catch((error) => {
      this.service.message('Unable to Fetch Default Knowledge base!', 'warning');
    });
    this.authentications();
    this.route.params.subscribe(params => this.type = params.type);
    this.route.queryParams.subscribe((params) => {
      if (params['search']) {
        this.filt = params['search'];
      }
      if (params['page']) {
        this.pageNumber = params['page'];
        this.pageNumber = parseInt(this.pageNumber);
        this.filt = params['search'];
        this.selectedAdapterType = params['type']
          ? params['type'].split(',')
          : [];
        if ((params['topics'] != undefined && params['topics'] != "") || params['topics'] === "") {
          if (params['topics'] === "") {
            this.queryIndexes = this.defaultKB.split(',');
            if (this.filt != '' && this.defaultKB != "") {
              setTimeout(() => {
                this.onEnter();
              }, 3000);
            }
            this.getdatasetsByTopics();
          }
          else {
            this.queryIndexes = params['topics'].split(',');
            if (this.filt != '' && params['topics'] != "") {
              setTimeout(() => {
                this.onEnter();
              }, 3000);
            } else if (params['topics'] != "") {
              this.selectedIndexNames = this.queryIndexes;
              this.fetchIndexNamesByOrg();
            }
            this.getdatasetsByTopics();
          }
        } else {
          this.fetchIndexNamesByOrg();
        }
      } else {
        this.fetchIndexNamesByOrg();
        this.selectAllTopics();
        this.pageNumber = 1;
      }
      this.semanticSearchResult = [];
      this.selectedfaq = undefined;
      this.renderSemanticSeach();
      this.pageNumber = 1;
      this.updatePageSize();
      this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id, this.selectedIndexNames.toString());
      this.isSemanticSearch = true;
      this.getdatasetsByTopics();
    });
  }

  async selectDefaultKB(): Promise<any> {
    return await this.service.getConstantByKey(this.DEFAULT_KNOWLEDGE_BASE_KEY).toPromise();
  }

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
    this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id, indexesQuery);
    this.updatePageSize();
    if (this.indexNames.length === this.selectedIndexNames.length) {
      this.allTopicsSelected = true;
    } else {
      this.allTopicsSelected = false;
    }
    this.changeQuestions(this.selectedIndexNames);
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
            this.getdatasetsByTopics();
          }, 1000);
        } else {
          this.selectAllTopics();
        }
      } else {
        this.selectedIndexNames = [];
        this.selectedIndexNames.push(this.defaultKB);
        this.changeQuestions(this.selectedIndexNames);
        this.getdatasetsByTopics();
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

  renderSemanticSeach() {
    this.findAllAdapters();
    this.serverUrl = window.location.origin;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updatePageSize();
  }

  updatePageSize() {
    this.pageSize = 0;
    this.pageNumber = 1;
    if (window.innerWidth > 2500) {
      this.itemsPerPage = [16, 32, 48, 64, 80, 96];
      this.pageSize = this.pageSize || 16; // xl
    } else if (window.innerWidth > 1440 && window.innerWidth <= 2500) {
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
    this.getdatasetsByTopics();
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

  findAllAdapters() {
    this.adapterServices.getMlInstanceNamesByOrganization()
      .subscribe(res => {
        this.adapterInstances = res;
        this.adapterInstances.forEach((insNamr) => {
          this.adaptersOptions.push(new OptionsDTO(insNamr, insNamr));
        });
      });
  }

  authentications() {
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes("dataset-create")) this.createAuth = true;
        if (cipAuthority.includes("dataset-edit")) this.editAuth = true;
        if (cipAuthority.includes("dataset-delete")) this.deleteAuth = true;
      }
    );
  }

  navigateTo(card: any) {
    let selectedCard = card;
    if (this.type)
      this.router.navigate(['../data'], {
        state: {
          selectedCard,
        },
        relativeTo: this.route
      });
    else
      this.router.navigate(['./data'], {
        state: {
          selectedCard,
        },
        relativeTo: this.route
      });
  }

  deleteAdapter(name: string) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.datasetService.deleteDatasets(name).subscribe((res) => {
          this.service.messageNotificaionService('success', "Dataset Deleted Successfully");
          this.service.deleteRatingByElement(name,'Dataset').subscribe((res) => {
            this.service.messageNotificaionService('success', "Ratings Deleted Successfully");
            this.telemetry.addTelemetryEvent(name +' Deleted successfully');
          });
            this.ngOnInit();
        }, ((error) => {
          this.service.messageNotificaionService('error', "Error");
        }));
      }
    });
  }

  // scroll references
  scrollLeftForQuestions(): void {
    this.scrollableDiv.nativeElement.scrollTo({
      left: this.scrollableDiv.nativeElement.scrollLeft - 150,
      behavior: 'smooth',
    });
  }

  scrollRightForQuestion() {
    this.scrollableDiv.nativeElement.scrollTo({
      left: this.scrollableDiv.nativeElement.scrollLeft + 150,
      behavior: 'smooth',
    });
  }

  checkScroll() {
    let scrollContainer = this.scrollableDiv.nativeElement
    const isAtEnd = scrollContainer.scrollWidth - scrollContainer.scrollLeft === scrollContainer.clientWidth;
    this.isScrollAtEnd = isAtEnd;
    this.hasClickedRight = scrollContainer.scrollLeft !== 0;
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
    this.updateQueryParam(this.pageNumber, this.filt);
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

  open() {
    this.router.navigate(["./create"], { relativeTo: this.route });
  }

  onEnter() {
    this.selectedfaq = undefined;
    this.query = this.filt;
    if (this.selectedIndexNames.length == 0) {
      this.selectedIndexNames.push(this.defaultKB);
    }
    this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id, this.selectedIndexNames.toString());
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

  searchByContentParams(filt) {
    this.updateQueryParam(this.pageNumber, filt);
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  toggler(isExpanded: boolean) {
    if (isExpanded) {
      return { width: '80%', margin: '0 0 0 20%' };
    } else {
      return { width: '100%', margin: '0%' };
    }
  }

  // get semantic data
  getdatasetsByTopics() {
    let topics: string = '';
    if (this.selectedIndexNames.length > 0) {
      topics = this.selectedIndexNames.join(',');
    }
    else {
      topics = this.indexNames.join(",");
    }

    let body = {};
    body['topics'] = topics;
    this.semanticService.filterDatasetsByTopics(body).subscribe((resp: any) => {
      this.cards = resp;
      this.filteredCards = this.cards;
      if (this.filteredCards.length == 0) {
        this.records = true;
      } else {
        this.records = false;
      }
      let timezoneOffset = new Date().getTimezoneOffset();
      if (this.filteredCards && this.filteredCards.length > 0) {
        this.filteredCards.forEach((e) => {
          e.lastmodifieddate = new Date(new Date(e.lastmodifieddate).getTime() - timezoneOffset * 60 * 1000);
        });
      }
      this.noOfItems = resp.length;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
      this.filteredCards = this.cards.slice(((this.pageNumber - 1) * this.pageSize), ((this.pageNumber - 1) * this.pageSize + this.pageSize))
      this.getRatingByUserAndModule();
      this.updateQueryParam(this.pageNumber, this.filt);
      this.getIconStatus();
    })
  }

  getIconStatus() {
    this.filteredCards.forEach(card => {
      this.semanticService.getIngestedTopicsByDatasetnameAndOrg(card.name).subscribe(res => {
        if (res && res.length > 0) {
          this.embeddedStatus[card.name] = res[0].status;
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
              case 'Questions':
                this.questionsStatus[card.name] = resp;
                break;
              default:
                break;
            }
          });
        });
      }
    });
  }

  updateQueryParam(
    page: number = 1,
    search: string = '',
    adapterType: string = '',
    org: string = sessionStorage.getItem('organization'),
    roleId: string = JSON.parse(sessionStorage.getItem('role')).id,
    topics: string = this.selectedIndexNames.join(','),
  ) {
    let url;
    url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          type: adapterType,
          org: org,
          roleId: roleId,
          topics: topics
        },
        queryParamsHandling: 'merge',
      })
      .toString();
    this.location.replaceState(url);
  }


  // clear semantic search
  clearSemanticSearchBoolean($event) {
    if ($event && $event != 'semanticSearchNotActive' && $event != 'hideQuestions')
      this.clearSemanticSearch()
    else if ($event == 'semanticSearchNotActive') {
      this.semanticSearchActive = false;
    } else if ($event == 'hideQuestions') {
      this.showQuestions = false;
    }
  }

  clearSemanticSearch() {
    this.count = 0;
    this.semanticSearchActive = false;
    this.filt = '';
    this.loading = false;
    this.datasetAlias = '';
    this.selectedIndexNames = [];
    this.selectedfaq = undefined;
    this.clearSelectedTopics();
  }

  clearKBsearch() {
    console.log('clearKBsearch');
    this.knowledgeBaseFilter = "";
    this.filteredIndexNames = [];
    this.indexNames.forEach(indexName => {
      this.filteredIndexNames.push(indexName);
    });
    if (this.indexNames.length === this.selectedIndexNames.length) {
      this.allTopicsSelected = true;
    } else {
      this.allTopicsSelected = false;
    }
  }

  clearSelectedTopics() {
    this.allTopicsSelected = false;
    this.selectedfaq = undefined;
    this.selectedQuestions = [];
    this.selectedIndexNames = [];
    this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id);
    this.getdatasetsByTopics()
  }

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
    //this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id, indexesQuery);
    this.getdatasetsByTopics();

    if (this.filteredIndexNames.length === this.selectedIndexNames.length) {
      this.allTopicsSelected = true;
    } else {
      this.allTopicsSelected = false;
    }
  }

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


  // pagination
  nextPage() {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      this.filteredCards = this.cards.slice(((this.pageNumber - 1) * this.pageSize), ((this.pageNumber - 1) * this.pageSize + this.pageSize))
    }
  }

  prevPage() {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      this.changePage();
      this.filteredCards = this.cards.slice(((this.pageNumber - 1) * this.pageSize), ((this.pageNumber - 1) * this.pageSize + this.pageSize))
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
      this.filteredCards = this.cards.slice(((this.pageNumber - 1) * this.pageSize), ((this.pageNumber - 1) * this.pageSize + this.pageSize))
    }
  }

  selectedButton(i) {
    if (i == this.pageNumber)
      return { "color": "white", "background": "#7b39b1" }
    else
      return { "color": "black" }
  }


  // new card view
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
    this.selectedCard = card;
    this.selectedEvent = type;
    this.status = status;
    this.modalService.openModal(retrigger, 'mini')
  }

  desc(card: any) {
    this.telemetry.addTelemetryEvent(card.alias + 'Viewed')
    if (this.type)
      this.router.navigate(["../view/" + card.name], { state: { card }, relativeTo: this.route });
    else
      this.router.navigate(["./view/" + card.name], { state: { card }, relativeTo: this.route });
  }

  optionChange(event: Event) {
    let i: number = event.target['selectedIndex'];
    this.pageSize = this.itemsPerPage[i];
    this.pageNumber = 1;
    this.getdatasetsByTopics();
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


  getFileData(datasetName, fileName, org) {
    return this.service.getNutanixFileData(datasetName, [fileName], org).toPromise()
      .catch(err => this.service.messageService('Some error occured while fetching file'));
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

  downloadSelectedFiles(filename: string, data: any, extension: string, card?: any) {
    if (extension.match(/pdf|jpg|png|jpeg/)) {
      this.service.messageNotificaionService('success', "Download initiated");
      if (!data) {
        this.service.getDatasetByNameAndOrg(card.name, card.organization).subscribe(resp => {
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
              let obj = JSON.parse(card.attributes).object;
              if (obj && fileN.includes(obj)) {
                const splitBySlash = fileN.split('/');
                let fileName = splitBySlash.slice(1).join('/');
                this.service.getNutanixFileData(card.name, `${fileName}`, card.organization).subscribe((res) => {
                  if (res && res[0]) {
                    const decode = atob(res[0]);
                    const byteArray = new Uint8Array(decode.length);
                    for (let i = 0; i < decode.length; i++) {
                      byteArray[i] = decode.charCodeAt(i);
                    }
                    const linkA = document.createElement('a');
                    const blobdata = new Blob([byteArray], { type: `application/${extension}` });
                    linkA.href = window.URL.createObjectURL(blobdata);
                    linkA.download = obj;
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
        linkA.download = card.alias;
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

  getRatingByUserAndModule() {
    this.service.getRatingByUserAndModule("Knowledge").subscribe(res => {
      this.ratingList = res.body;
      this.filteredCards.forEach(card => {
        let found = this.ratingList.filter(_ => _.element == card.name)[0];
        if (found)
          card['rate'] = found.rating;
        else
          card['rate'] = 0;
       })
    })
  }

  openRatingModule(rate,card,i) {
    let found = this.ratingList.filter(e => e.element == card.name && e.module == "Knowledge");
    this.rateData = {
      "selectedModule":"Knowledge",
      "selectedElement":card.name,
      "selectedElementAlias":card.alias,
      "previousRating": found["rating"] || i+1,
      "previousFeedback": found["feedback"],
    }
    this.modalService.openModal(rate, 'mini');
  }
  ngOnDestroy() : void {
    let activeSpan = this.telemetry.fetchActiveSpan();
    this.telemetry.endTelemetry(activeSpan);
  }

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
          let url = `/api/aip/adapters/${adapterInstanceName}/semanticsearch_faq/${sessionStorage.getItem('organization')}?isInstance=true`;
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
          console.error('ERROR:', error);
          this.numberOfSelectedIndexes = this.numberOfSelectedIndexes + 1;
          if (this.selectedIndexNames.length === this.numberOfSelectedIndexes) {
            this.selectedIndexNames = []
            this.ngOnInit();
          }
        }
      }
      );
    } catch (error) {
      console.error('ERROR:', error);
      this.numberOfSelectedIndexes = this.numberOfSelectedIndexes + 1;
      if (this.selectedIndexNames.length === this.numberOfSelectedIndexes) {
        this.selectedIndexNames = []
        this.ngOnInit();
      }
    }
  }

  softDeleteSelectedKBs() {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        let topics: string = '';
        if (this.selectedIndexNames.length > 0) {
          topics = this.selectedIndexNames.join(',');
        } else {
          this.adapterServices.messageNotificaionService('warning', "No Knowledge Bases Selected");
          return;
        }
        let params = new HttpParams().set('topics', topics);
        this.datasetService.softDeleteSelectedKBs(params).subscribe((res) => {
          this.service.messageNotificaionService('success', "Knowledge Bases Deleted Successfully");
          this.ngOnInit();
        }, ((error) => {
          console.error('ERROR:', error);
          this.service.messageNotificaionService('error', "Some error occured while deleting Knowledge Bases");
        }));
      }
    });
  }

}
