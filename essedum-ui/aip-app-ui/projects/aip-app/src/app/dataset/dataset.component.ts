import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../services/service';
import { TagsService } from '../services/tags.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { DatasetServices } from './dataset-service';
import { HttpParams } from '@angular/common/http';
import { Location } from '@angular/common';
import { OptionsDTO } from '../DTO/OptionsDTO';
import { Project } from '../DTO/project';
import { SemanticSearchContext } from '../DTO/SemanticSearchContext';
import { AdapterServices } from '../services/adapter-service';
import { SemanticSearchResult } from '../DTO/SemanticSearchResult';
import { SemanticService } from '../services/semantic.services';
import { TagEventDTO } from '../DTO/tagEventDTO.model';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss']
})
export class DatasetComponent implements OnInit, OnChanges {
  @ViewChild('scrollableDiv', { read: ElementRef })
  public scrollableDiv: ElementRef<any>;
  edit: boolean = false
  cardTitle: String = "Datasets";
  test: any;
  cards: any;
  options = [];
  alias = [];
  datasetTypes = [];
  copyDataset: boolean = false;
  OptionType: any;
  selectedInstance: any;
  keys: any = [];
  users: any = [];
  filt: any;
  selectedCard: any = [];
  cardToggled: boolean = true;
  pageSize: number;
  pageNumber: any;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number = 0;
  prevRowsPerPageValue: number;
  itemsPerPage: number[] = []
  noOfItems: number;
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();
  endIndex: number;
  startIndex: number;
  pageNumberChanged: boolean = true;
  createAuth: boolean;
  editAuth: boolean;
  deleteAuth: boolean;
  deployAuth: boolean;
  category = [];
  tags;
  tagsBackup;
  allTags: any;
  tagStatus = {};
  catStatus = {};
  selectedTag = [];
  DEFAULT_KNOWLEDGE_BASE_KEY = 'icip.knowledgebase.default';
  type: any;
  resp: any;
  filteredCards: any;
  allCards: any;
  finalDataList: any = [];
  selectedAdapterInstance: string[] = [];
  selectedAdapterType: string[] = [];
  filter: string = '';
  tagrefresh: boolean = false;
  records: boolean = false;

  isSemanticSearch: boolean = false;
  toggleAdvanced: boolean = false;
  serverUrl = "";
  datasetList: OptionsDTO[] = [];
  datasetAlias: any;
  adapterInstanceName: string;
  adapterInstance: any;
  adaptersOptions: OptionsDTO[] = [];
  adapterInstances: any;
  tooltipPoition: string = 'above';
  adapterName: string;
  instanceName: string;
  adapter: any;
  spp: any;
  formattedapispec: any[];
  spec: any = {};
  query: string;
  loading: boolean = false;
  isCollapsed: boolean = false;
  cURL: string;
  specPath: any;
  isEndpoint: boolean = false;
  response: any;
  semanticSearchActive: boolean = false;
  count = 0;
  isInstanceConfiguredNow: boolean = false;
  searchOptions: OptionsDTO[] = [];
  selectedSeachOption: string = "Name";
  isExpanded = false;
  tooltip: string = 'above';
  selectable: boolean = true;
  multiSelect: boolean = false;
  indexNames: any;
  selectedIndexNames: string[] = [];
  semanticSearchResult: SemanticSearchResult[] = [];
  mlTopics: any;
  allTopicsSelected: boolean = true;
  mladaptersSpp: any;
  mladaptersFormattedapispec: any;
  topicAdaperInstance: any;
  mladpSeverURLs: any;
  adapterAndInstanceNames: any;
  knowledgeBaseFilter: string;
  filteredIndexNames: any;
  queryIndexes: string[] = [];
  deleteFilteredTag: boolean = false;
  deleteFilteredDataset: any;
  inputData: any;
  faqs: any;
  selectedfaq: any;
  triggeredFirstTime = 0;
  numberOfSelectedIndexes = 0;
  selectedQuestions = [];

  hasClickedRight: boolean = false;
  isScrollAtEnd: boolean = false;
  showQuestions: boolean = false;
  defaultKB: string;
  constructor(


    private route: ActivatedRoute,
  
    private router: Router,
    private service: Services,
    private datasetService: DatasetServices,
    private changeDetectionRef: ChangeDetectorRef,
    public tagService: TagsService,

    private dialog: MatDialog,
    private adapterServices: AdapterServices,
    private location: Location,
    private semanticService: SemanticService
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.selectedSeachOption == "Content") {
      this.fetchIndexNamesByOrg();
      this.semanticSearchResult = [];
    } else {
      this.getCards(this.pageNumber, this.pageSize);
      this.updatePageSize();
      this.tagchange();
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.selectedSeachOption != "Content") {
      this.updatePageSize();
    }
  }

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

  updatePageSize() {
    this.pageSize = 0;
    this.pageNumber = 1;
    if (window.innerWidth > 2500) {
      this.itemsPerPage = [16,32,48,64,80,96];
      this.pageSize = this.pageSize || 16; // xl
    }
    else if (window.innerWidth > 1440 && window.innerWidth <= 2500) {
      this.itemsPerPage = [10, 20, 40, 60, 80, 100];
      this.pageSize = this.pageSize || 10; // lg

    } else if (window.innerWidth > 1024 && window.innerWidth <= 1440) {
      this.itemsPerPage = [8, 16, 32, 48, 64, 80];
      this.pageSize = this.pageSize || 8; //md

    } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      this.itemsPerPage = [6, 9, 18, 36, 54, 72];
      this.pageSize = this.pageSize || 6; //sm

    } else if (window.innerWidth < 768) {
      this.itemsPerPage = [4, 8, 12, 16, 20, 24];
      this.pageSize = this.pageSize || 4; //xs

    }
    if (this.selectedSeachOption == "Content") {
 
      this.getdatasetsByTopics();
    }
  }
  
  async ngOnInit() {
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
    if (!this.searchOptions.some(item => item.value === "Name"))
      this.searchOptions.push(new OptionsDTO('Name', 'Name'));
    if (!this.searchOptions.some(item => item.value === "Content"))
      this.searchOptions.push(new OptionsDTO('Content', 'Content'));
    if(this.type) this.selectedSeachOption = "Name";
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
        if (params['searchBy']) {
          this.selectedSeachOption = params['searchBy'];
          this.onSearchMethodChange(this.selectedSeachOption, this.filt);
        }
        if ((params['topics'] != undefined && params['topics'] != "") || params['topics'] === "") {
          if(params['topics'] === ""){
            this.queryIndexes = this.defaultKB.split(',');
            if (this.selectedSeachOption == "Content" && this.filt != '' && this.defaultKB != "") {
              setTimeout(() => {
                this.onEnter();
              }, 3000);
            }
            this.getdatasetsByTopics();
          }
          else{
          this.queryIndexes = params['topics'].split(',');
          if (this.selectedSeachOption == "Content" && this.filt != '' && params['topics'] != "") {
            setTimeout(() => {
              this.onEnter();
            }, 3000);
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
      if (this.selectedSeachOption == "Content") {
        this.semanticSearchResult = [];
        this.selectedfaq = undefined;
        this.renderSemanticSeach();
        this.pageNumber = 1;
        this.updatePageSize();
        this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id, this.selectedSeachOption, this.selectedIndexNames.toString());
        this.isSemanticSearch = true;
        this.getdatasetsByTopics();
      } else {
        this.onSearchMethodChange("Name");
        this.updatePageSize();
        this.isSemanticSearch = false;
        let params: HttpParams = new HttpParams();
        let session = sessionStorage.getItem('organization')
        params = params.set('project', session);
        params = params.set('isTemplate', false);
        this.datasetService.getCountDatasets(params).subscribe((res) => {
          this.noOfItems = res;
        });
        this.service.getDatasetCards("", "1000", "", false).subscribe((res) => {
          this.allCards = res;
        })
    
        this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id, this.selectedSeachOption);
        if (this.filt) this.filterz();
        else this.getCards(this.pageNumber, this.pageSize);
      
        if (this.pageNumber && this.pageNumber > 5) {
          this.endIndex = this.pageNumber + 2;
          this.startIndex = this.endIndex - 5;
        } else {
          this.startIndex = 0;
          this.endIndex = 5;
        }

        this.getTags();
      }

    });

  }
  updateQueryParam(
    page: number = 1,
    search: string = '',
    adapterType: string = '',
    org: string = sessionStorage.getItem('organization'),
    roleId: string = JSON.parse(sessionStorage.getItem('role')).id,
    searchBy: string = this.selectedSeachOption,
    topics: string = this.selectedIndexNames.join(','),
  ) {
    let url;
    if (searchBy == 'Content') {
      url = this.router
        .createUrlTree([], {
          queryParams: {
            page: page,
            search: search,
            type: adapterType,
            org: org,
            roleId: roleId,
            searchBy: searchBy,
            topics: topics
          },
          queryParamsHandling: 'merge',
        })
        .toString();
    }
    else {
      url = this.router
        .createUrlTree([], {
          queryParams: {
            page: page,
            search: search,
            type: adapterType,
            org: org,
            roleId: roleId,
            searchBy: searchBy
          },
          queryParamsHandling: 'merge',
        })
        .toString();
    }
    this.location.replaceState(url);
  }


  open() {
    if (this.type)
      this.router.navigate(["../create"], { relativeTo: this.route });
    else
      this.router.navigate(["./create"], { relativeTo: this.route });
  }

  openedit(name: any) {
    this.edit = true;
    this.router.navigate(["./edit/" + name, +this.edit], { relativeTo: this.route });
  }

  nextPage() {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      if (this.selectedSeachOption == "Name")
        this.changePage();
      else
        this.filteredCards = this.cards.slice(((this.pageNumber - 1) * this.pageSize), ((this.pageNumber - 1) * this.pageSize + this.pageSize))

    }
  }
  prevPage() {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      this.changePage();
      if (this.selectedSeachOption == "Name")
        this.changePage();
      else
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
    }
   
  }
  rowsPerPageChanged() {
    if (this.pageSize == 0) {
      this.pageSize = this.prevRowsPerPageValue;
    }
    else {
      this.pageSizeChanged.emit(this.pageSize);
      this.prevRowsPerPageValue = this.pageSize;
      this.changeDetectionRef.detectChanges();
    }
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

  changedToogle(event: any) {
    this.cardToggled = event;
  }

  tagchange() {
    this.tagService.tags.forEach((element: any) => {
    });
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }
  getCards(page: any, size: any): void {
    if (this.selectedSeachOption == "Name") {
      if (this.type) {
        this.getDatasetByConnection();
      }
      else {
        this.service.getDatasetCards(this.pageNumber, this.pageSize, "", false).subscribe((res) => {
          let data: any = [];
          let test = res;
          test.forEach((element: any) => {
            data.push(element);
            this.users.push(element.alias)
          });
          this.cards = data;
          let sort: any = []
          let timezoneOffset = new Date().getTimezoneOffset();
          this.cards.forEach((e) => {
            e.lastmodifieddate = new Date(new Date(e.lastmodifieddate).getTime() - timezoneOffset * 60 * 1000);
            sort.push(e)
          })
          this.filteredCards = this.cards;
          this.noOfItems = this.noOfItems || data.length;
          this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
          this.pageArr = [...Array(this.noOfPages).keys()];
          this.records = false;
        });
      }
      this.updateQueryParam(
        this.pageNumber,
        this.filt
      );
    }
  }
  desc(card: any) {
    if (this.type)
      this.router.navigate(["../view/" + card.name], { state: { card }, relativeTo: this.route });
    else{
      this.router.navigate(["./view/" + card.name], { state: { card }, relativeTo: this.route });
    }
  }

  redirect() {
    this.selectedInstance = this.selectedCard.name
    this.router.navigate([
      './view',
      this.cardTitle,
      this.selectedInstance
    ],
      {
        relativeTo: this.route,
      });
  }


  filterz() {
    if (this.type) {
      let params: HttpParams = new HttpParams();
      let session = sessionStorage.getItem('organization')
      params = params.set('project', session);
      params = params.set('datasource', this.type);
      params = params.set('isTemplate', false);
      params = params.set('query', this.filt);
      this.datasetService.getCountDatasets(params).subscribe((res) => {
        this.noOfItems = res;
      });
      this.datasetService.getDatasetsByDatasource(this.type, this.filt, this.pageNumber, this.pageSize).subscribe((res) => {
        let resp = res;
        this.filteredCards = resp;
        this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
        this.pageArr = [...Array(this.noOfPages).keys()];
      });

    } else {
      if (this.selectedSeachOption == "Name") {
        this.service.getDatasetCards(this.pageNumber, this.pageSize, this.filt, false).subscribe((res) => {
          this.filteredCards = res
          if (this.filteredCards.length == 0) {
            this.records = true;
          }
          else {
            this.records = false;
          }
          let params: HttpParams = new HttpParams();
          let session = sessionStorage.getItem('organization')
          params = params.set('project', session);
          params = params.set('query', this.filt);
          params = params.set('isTemplate', false);
          this.pageArr = [];
          this.datasetService.getCountDatasets(params).subscribe((resp) => {
            this.noOfItems = resp
            this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
            this.pageArr = [...Array(this.noOfPages).keys()];
           
          })
        });

        this.updateQueryParam(this.pageNumber, this.filt);
        this.pageChanged.emit(this.pageNumber);
      }
    }
  }
  getTags() {

    this.tags = {};
    this.tagsBackup = {};
    this.service.getMlTags().subscribe((resp) => {
      this.allTags = resp;
      resp.forEach((tag) => {
        if (this.category.indexOf(tag.category) == -1) {
          this.category.push(tag.category);
        }
        this.tagStatus[tag.category + " - " + tag.label] = false;
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
    this.tagStatus[tag.category + " - " + tag.label] =
      !this.tagStatus[tag.category + " - " + tag.label];

    if (!this.selectedTag.includes(tag)) {
      this.selectedTag.push(tag);
    }
    else {
      this.selectedTag.splice(this.selectedTag.indexOf(tag), 1)
    }

  }
  tagSelectedEvent(event: TagEventDTO) {
    this.selectedAdapterInstance = event.getSelectedAdapterInstance();
    this.selectedAdapterType = event.getSelectedAdapterType();
    this.selectedTag = event.getSelectedTagList();
    this.selectedIndexNames = event.getSelectedDatasetTopicType();
    console.log(this.selectedIndexNames);

    this.tagrefresh = false;
    this.filterCards();
  }
  filterCards() {
    this.finalDataList = []
    if (this.selectedTag.length > 0) {
      let multiFilter;
      for (let i = 0; i < this.selectedTag.length; i++) {
        multiFilter = this.allCards.filter(
          (data) =>
            data.tags?.includes(
              this.selectedTag[i]
            )
        );
        this.finalDataList.push(...multiFilter);
      }
      this.filteredCards = this.finalDataList
      this.filteredCards = this.filteredCards.slice(((this.pageNumber - 1) * this.pageSize), ((this.pageNumber - 1) * this.pageSize + this.pageSize))
      this.noOfItems = this.finalDataList.length;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
    }
    else if (this.selectedAdapterType.length > 0) {
      let multiFilter;
      if(this.deleteFilteredTag){
        let n = this.allCards.findIndex((data) => data.name == this.deleteFilteredDataset)
        this.allCards.splice(n,1)
      } 
      for (let i = 0; i < this.selectedAdapterType.length; i++) {
        multiFilter = this.allCards.filter(
          (data) =>
            data.datasource?.type.includes(
              this.selectedAdapterType[i]
            )
        );
        this.finalDataList.push(...multiFilter);
      }
      this.filteredCards = this.finalDataList
      this.filteredCards = this.filteredCards.slice(((this.pageNumber - 1) * this.pageSize), ((this.pageNumber - 1) * this.pageSize + this.pageSize))
      this.noOfItems = this.finalDataList.length;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
      this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString());
    }
    else if (this.selectedIndexNames.length > 0) {
      let topics: string = this.selectedIndexNames.join(',');
      let body = {};
      body['topics'] = topics;
      this.semanticService.filterDatasetsByTopics(body).subscribe((resp: any[]) => {
        console.log(resp);
        this.finalDataList.push(...resp);
        this.filteredCards = this.finalDataList;
        this.filteredCards = this.filteredCards.slice(((this.pageNumber - 1) * this.pageSize), ((this.pageNumber - 1) * this.pageSize + this.pageSize))
        this.noOfItems = this.finalDataList.length;
        this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
        this.pageArr = [...Array(this.noOfPages).keys()];
        this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id, 'Name', this.selectedIndexNames.join(','));

      })
    }
    else
      this.ngOnInit();
  }

  deleteAdapter(name: string) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.datasetService.deleteDatasets(name).subscribe((res) => {
          this.service.messageNotificaionService('success', "Dataset Deleted Successfully");
          if(this.selectedAdapterType.length > 0){
            this.deleteFilteredTag = true;
            this.deleteFilteredDataset = name;
            this.filterCards();
          }else{
          this.ngOnInit();
          }
        }, ((error) => {
          this.service.messageNotificaionService('error', "Error");
        }));
      }
    });
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
  selectedButton(i) {
    if (i == this.pageNumber)
      return { "color": "white", "background": "#7b39b1" }
    else
      return { "color": "black" }
  }
  routeBackToConnections() {
    this.router.navigate(["../../connections"], { relativeTo: this.route });
  }
  clickactive(eventObj: any) {
   console.log(' clickactive method clicked  ', eventObj)
  }

  getDatasetByConnection() {
    let params: HttpParams = new HttpParams();
    let session = sessionStorage.getItem('organization')
    params = params.set('project', session);
    params = params.set('datasource', this.type);
    params = params.set('isTemplate', false);
    this.datasetService.getCountDatasets(params).subscribe((res) => {
      this.noOfItems = res;
    });
    this.datasetService.getDatasetsByDatasource(this.type, "", this.pageNumber, this.pageSize).subscribe((res) => {
      let resp = res;
      this.filteredCards = resp;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
      this.records = false;
    });
  }

  navigate(content: any) {
    this.copyDataset = true;


    this.dialog.open(content);
  }

  refreshcards(event) {
    this.ngOnInit();
  }

  inferDialog() {
    this.router.navigate(['../search'], {
      relativeTo: this.route,
      state: {}
    });
  }

  toggleView() {
    this.isSemanticSearch = !this.isSemanticSearch;
    this.semanticSearchActive = false;
    this.toggleAdvanced = false;
    this.filt = '';
    if (this.isSemanticSearch) {
      this.loading = false;
      this.renderSemanticSeach();
    }
  }

  async selectDefaultKB(): Promise<any>{
    return await this.service.getConstantByKey(this.DEFAULT_KNOWLEDGE_BASE_KEY).toPromise();
  }

  onEnter() {
    this.selectedfaq = undefined;
    this.query = this.filt;
    if(this.selectedIndexNames.length == 0){
      this.selectedIndexNames.push(this.defaultKB);
    }
    this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id, 'Content', this.selectedIndexNames.toString());
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
      mladpSeverURLs: this.mladpSeverURLs,
    }
  }

  clearSemanticSearchBoolean($event) {
    if ($event && $event != 'semanticSearchNotActive' && $event != 'hideQuestions')
      this.clearSemanticSearch()
    else if ($event == 'semanticSearchNotActive') {
      this.semanticSearchActive = false;
    }else if ($event == 'hideQuestions') {
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

  toggleAdvanceChange() {
    this.toggleAdvanced = !this.toggleAdvanced;
  }

  renderSemanticSeach() {
    this.findAllAdapters();
    this.serverUrl = window.location.origin;
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

  renderAdapterInstancesForSemanticSearch() {
    this.mladaptersSpp = {};
    this.mladaptersFormattedapispec = {};
    this.mladpSeverURLs = {};
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
                    if (spp && spp.servers.length > 0 && spp.servers[0].url) {
                      if (!this.mladpSeverURLs[topic.adapterinstance])
                        this.mladpSeverURLs[topic.adapterinstance] = spp.servers[0].url;
                    }
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

  optionChange($event) {
    this.datasetAlias = $event;
  }

  adapterNameChangesOccur(adpName: string) {
    this.adapterInstanceName = adpName;
  }

  onSearchMethodChange(selectedSearchOption: string, filt?: string) {
    this.hasClickedRight = false;
    this.isScrollAtEnd = false;
    this.selectedfaq = undefined;
    this.selectedSeachOption = selectedSearchOption;
    this.semanticSearchActive = false;
    this.toggleAdvanced = false;
    this.filt = '';
    if (filt)
      this.filt = filt;
    if (this.isSemanticSearch) {
      this.loading = false;
      this.renderSemanticSeach();
    }
    if (this.selectedSeachOption == "Content") {
      this.showQuestions = true;
      this.isSemanticSearch = true;
      this.fetchIndexNamesByOrg();
      this.semanticSearchResult = [];
      this.renderSemanticSeach();
      this.pageNumber = 1;
      this.updatePageSize();
      this.filteredCards = [];
      this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id, this.selectedSeachOption);

    } else {
      this.isSemanticSearch = false;
      this.updatePageSize();
      this.filteredCards = [];
      this.route.params.subscribe(params => this.type = params.type);
      let params: HttpParams = new HttpParams();
      let session = sessionStorage.getItem('organization')
      params = params.set('project', session);
      params = params.set('isTemplate', false);
      this.datasetService.getCountDatasets(params).subscribe((res) => {
        this.noOfItems = res;
      });
      this.service.getDatasetCards("", "1000", "", false).subscribe((res) => {
        this.allCards = res;
      })
  
      this.route.queryParams.subscribe((params) => {
        if (params['page']) {
          this.pageNumber = params['page'];
          this.pageNumber = parseInt(this.pageNumber);
          this.filt = params['search'];
          this.selectedAdapterType = params['type']
            ? params['type'].split(',')
            : [];
        } else {
          this.pageNumber = 1;
          this.filt = '';
        }
      });
      this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id, 'Name', '');
      if (this.filt) this.filterz();
      else this.getCards(this.pageNumber, this.pageSize);
     
      if (this.pageNumber && this.pageNumber > 5) {
        this.endIndex = this.pageNumber + 2;
        this.startIndex = this.endIndex - 5;
      } else {
        this.startIndex = 0;
        this.endIndex = 5;
      }

      this.getTags();
    }
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
      if (this.selectedSeachOption == "Content") {
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
      }
      this.renderAdapterInstancesForSemanticSearch();
    }, ((error) => {
      console.error('Error occurred! while fetching indexNames');
    }));
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
    this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id, this.selectedSeachOption, indexesQuery);
    this.getdatasetsByTopics();
    if (this.indexNames.length === this.selectedIndexNames.length) {
      this.allTopicsSelected = true;
    } else {
      this.allTopicsSelected = false;
    }
    this.changeQuestions(this.selectedIndexNames);
  }

  clearSelectedTopics() {
    this.allTopicsSelected = false;
    this.selectedfaq = undefined;
    this.selectedQuestions = [];
    this.selectedIndexNames = [];
    this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id, this.selectedSeachOption);
    this.getdatasetsByTopics()
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
    this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id, this.selectedSeachOption, indexesQuery);
    this.getdatasetsByTopics();

    if (this.filteredIndexNames.length === this.selectedIndexNames.length) {
      this.allTopicsSelected = true;
    } else {
      this.allTopicsSelected = false;
    }
  }

  handlePageAndSizeChange(event: { pageNumber: number; pageSize: number }) {
    console.log('Page number:', event.pageNumber);
    console.log('Page size:', event.pageSize);
    this.pageNumber = event.pageNumber?event.pageNumber:1;
    this.pageSize = event.pageSize?event.pageSize:4;
    this.cards = [];
    if (this.filt)
      this.filterz();
    else if (this.finalDataList.length >= 1) {
      this.filterCards()
    }
    else
      this.getCards(this.pageNumber, this.pageSize);

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
  getdatasetsByTopics() {
    let topics: string = '';
    if (this.selectedIndexNames.length > 0) {
      topics = this.selectedIndexNames.join(',');
    } else if (this.selectedSeachOption != "Name") {
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
      this.noOfItems = resp.length;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
      this.filteredCards = this.cards.slice(((this.pageNumber - 1) * this.pageSize), ((this.pageNumber - 1) * this.pageSize + this.pageSize))
      this.updateQueryParam(this.pageNumber, this.filt);
    })
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
      mladpSeverURLs: this.mladpSeverURLs,
      isFaq: isFaq,
    }
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



  searchByContentParams(filt) {
    this.updateQueryParam(this.pageNumber, filt);
  }

}
