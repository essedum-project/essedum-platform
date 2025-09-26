import { ChangeDetectorRef, Component, EventEmitter, HostListener, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { SemanticService } from '../../services/semantic.services';
import { DatasetServices } from '../dataset-service';
import { Services } from '../../services/service';
import { HttpClient, HttpParams } from '@angular/common/http';

import { MatDialog } from '@angular/material/dialog';
import { saveAs as importedSaveAs } from "file-saver";
import { TagEventDTO } from '../../DTO/tagEventDTO.model';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';

@Component({
  selector: 'app-dataset-by-name',
  templateUrl: './dataset-by-name.component.html',
  styleUrls: ['./dataset-by-name.component.scss']
})
export class DatasetByNameComponent {

  cardTitle: String = "Datasets";
  public isAddHovered: boolean = false;
  public isRefreshHovered: boolean = false;
  public isSearchHovered: boolean = false;
  public isFilterHovered: boolean = false;
  cardToggled: boolean = true;
  openSearchField: boolean = false;
  lastRefreshedTime: Date | null = null;
  servicev1 = 'Datasets';
  hasFilters = false;
  filtbackup: any = '';
  cards: any;
  filteredCards: any;
  finalDataList: any = [];
  filt: any;
  selectedTag = [];
  selectedAdapterInstance: string[] = [];
  selectedAdapterType: string[] = [];
  selectedIndexNames: string[] = [];
  allCards: any;
  deleteFilteredTag: boolean = false;
  deleteFilteredDataset: any;
  editData: any;
  loading: boolean = true;



  type: any;
  users: any = [];
  records: boolean = false;

  noOfItems: number;
  pageNumber: any;
  pageSize: number;
  noOfPages: number = 0;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  itemsPerPage: number[] = [];
  prevRowsPerPageValue: number;
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();
  endIndex: number;
  startIndex: number;
  isSearchVisible: boolean = false;
  category = [];
  tags;
  tagsBackup;
  allTags: any;
  tagStatus = {};
  catStatus = {};
  tagrefresh: boolean = false;

  DEFAULT_KNOWLEDGE_BASE_KEY = 'icip.knowledgebase.default';
  defaultKB: string;

  createAuth: boolean;
  editAuth: boolean;
  deleteAuth: boolean;

  isExpanded = false;
  tooltip: string = 'above';

  selectedCard: any;
  selectedEvent: any;
  iconIterations = Array(5).fill(0);

  copyDataset: boolean = false;

  embeddedStatus: any = {};
  transcribeStatus: any = {};
  translationStatus: any = {};
  summaryStatus: any = {};
  questionsStatus: any = {};
  filteredTopics: any;
  status: any;
  ratingList: any;
  selectedTab = 'datasets';
  hoverStates: boolean[] = [];

  rateData: { selectedModule: string; selectedElement: any; selectedElementAlias: any, previousRating: any; previousFeedback: any; };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private service: Services,
    private dialog: MatDialog,
    private http: HttpClient,
    private datepipe: DatePipe,
    private semanticService: SemanticService,
    private datasetService: DatasetServices,
    private changeDetectionRef: ChangeDetectorRef,

  ) { }

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

  async ngOnInit() {
    this.records = false;
    this.route.params.subscribe(params => this.type = params.type);
    if (this.type) this.selectedAdapterType.push(this.type);
    this.route.queryParams.subscribe((params) => {
      if (params['page']) {
        this.pageNumber = params['page'];
        this.filt = params['search'];
        this.selectedAdapterType = params['type']
          ? params['type'].split(',')
          : [];
        this.selectedAdapterInstance = params['adapterInstance']
          ? params['adapterInstance'].split(',')
          : [];
        this.selectedIndexNames = params['indexNames']
          ? params['indexNames'].split(',')
          : [];
        if (
          (this.selectedAdapterType && this.selectedAdapterType.length > 0) ||
          (this.selectedAdapterInstance &&
            this.selectedAdapterInstance.length > 0) ||
          (this.selectedIndexNames && this.selectedIndexNames.length > 0)
        ) {
          this.hasFilters = true;
        }
      } else {
        this.pageNumber = 1;
        this.pageSize = 4;
        this.filt = '';
      }
    });
    await this.selectDefaultKB().then((res) => {
      this.defaultKB = res.body;
    }).catch((error) => {
      this.service.message('Unable to Fetch Default Knowledge base!', 'warning');
    });
    this.authentications();
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
      } else {
        this.pageNumber = 1;
      }
      this.updatePageSize();
      let param: HttpParams = new HttpParams();
      let organization = sessionStorage.getItem('organization')
      param = param.set('organization', organization);
      if (this.filt && this.filt != '') {
        param = param.set('aliasOrName', this.filt);
      }
      if (this.selectedAdapterType && this.selectedAdapterType.length > 0) {
        this.selectedAdapterType.forEach((type) => {
          param = param.set('types', type);
        });
      }

      this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), this.selectedIndexNames.toString(), sessionStorage.getItem('organization'), JSON.parse(sessionStorage.getItem('role')).id);

      if (this.pageNumber && this.pageNumber > 5) {
        this.endIndex = this.pageNumber + 2;
        this.startIndex = this.endIndex - 5;
      } else {
        this.startIndex = 0;
        this.endIndex = 5;
      }
      this.getTags();
    });
    this.filterCards();
    this.lastRefreshTime();

  }

  async selectDefaultKB(): Promise<any> {
    return await this.service.getConstantByKey(this.DEFAULT_KNOWLEDGE_BASE_KEY).toPromise();
  }

  updatePageSize() {
    this.pageSize = 0;
    this.pageNumber = 1;
    if (window.innerWidth > 2500) {
      this.itemsPerPage = [16, 32, 48, 64, 80, 96];
      this.pageSize = this.pageSize || 16; // xl
    } else if (window.innerWidth > 1440 && window.innerWidth <= 2500) {
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

  authentications() {
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        const authorityArr = JSON.parse(cipAuthority);
        this.createAuth = authorityArr.some(item => item.permission === "dataset-create");
        this.editAuth = authorityArr.some(item => item.permission === "dataset-edit");
        this.deleteAuth = authorityArr.some(item => item.permission === "dataset-delete");
      }
    );
  }

  refreshData() {
    this.filt = '';
    this.tagrefresh = true;
    if (!this.hasFilters) {
      this.selectedAdapterType = [];
      this.selectedIndexNames = [];
      this.selectedTag = [];
      this.filt = '';
      this.noOfPages = 0;
      this.noOfItems = 0;
      this.filterCards();
    }
    this.lastRefreshTime();

  }
  toggleSearch(): void {
    this.isSearchVisible = true;
  }

  onInputBlur(): void {
    if (!this.filt) {
      this.isSearchVisible = false;
    }
  }

  filterCards() {
    this.records = false;
    this.loading = true;

    this.filteredCards = [];
    let param: HttpParams = new HttpParams();
    let organization = sessionStorage.getItem('organization')
    param = param.set('organization', organization);
    if (this.filt && this.filt != '' && this.filt != null) {
      param = param.set('aliasOrName', this.filt);
    }
    if (this.selectedAdapterType && this.selectedAdapterType.length > 0) {
      param = param.set('types', this.selectedAdapterType.toString());
    }

    if (this.selectedIndexNames && this.selectedIndexNames.length > 0) {
      param = param.set('knowledgeBases', this.selectedIndexNames.toString());
    }

    if (this.selectedTag && this.selectedTag.length > 0) {
      param = param.set('tags', this.selectedTag.toString());
    }

    this.datasetService.getCountDatasetsAdvancedFilter(param).subscribe((res) => {
      this.noOfItems = res;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
      this.hoverStates = new Array(this.pageArr.length).fill(false);

      this.pageSize = 8;
      // this.pageNumber = 1;
      param = param.set('page', this.pageNumber);
      param = param.set('size', this.pageSize);
      this.datasetService.getDatasetsAdvancedFilter(param).subscribe((res) => {
        this.filteredCards = res;
        let timezoneOffset = new Date().getTimezoneOffset();
        if (this.filteredCards && this.filteredCards.length > 0) {
          this.filteredCards.forEach((e) => {
            e.lastmodifieddate = new Date(new Date(e.lastmodifieddate).getTime() - timezoneOffset * 60 * 1000);
          });
        }
        this.records = true;
        this.loading = false;

        this.getIconStatus();
      });
    });
    this.updateQueryParam(
      this.pageNumber,
      this.filt,
      this.selectedAdapterType.toString(),
      this.selectedIndexNames.toString()
    );
  }

  updateQueryParam(
    page: number = 1,
    search: string = '',
    adapterType: string = '',
    indexName: string = '',
    org: string = sessionStorage.getItem('organization'),
    roleId: string = JSON.parse(sessionStorage.getItem('role')).id,
  ) {
    let url;
    url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          type: adapterType,
          knowledgeBases: indexName,
          org: org,
          roleId: roleId
        },
        queryParamsHandling: 'merge',
      })
      .toString();
    this.location.replaceState(url);
  }

  handlePageAndSizeChange(event: { pageNumber: number; pageSize: number }) {
    // Handle the updated pageNumber and pageSize here
    this.pageNumber = event.pageNumber ?? 1;
    this.pageSize = event.pageSize ?? 8;
    this.fetchDatasetsForPagination();
  }

  getCards(page: any, size: any): void {
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
        this.filteredCards = sort.sort((a, b) => b.lastmodifieddate - a.lastmodifieddate)
        this.filteredCards = this.cards;
        this.noOfItems = this.noOfItems || data.length;
        this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
        this.pageArr = [...Array(this.noOfPages).keys()];
        this.hoverStates = new Array(this.pageArr.length).fill(false);

        this.records = false;
      });
    }
    this.updateQueryParam(
      this.pageNumber,
      this.filt
    );
    this.getIconStatus();
    this.filterCards();
  }

  getRatingByUserAndModule() {
    this.service.getRatingByUserAndModule("Dataset").subscribe(res => {
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

  fetchDatasetsForPagination() {
    this.records = false;
    this.filteredCards = [];
    let param: HttpParams = new HttpParams();
    let organization = sessionStorage.getItem('organization')
    param = param.set('organization', organization);
    if (this.filt && this.filt != '' && this.filt != null) {
      param = param.set('aliasOrName', this.filt);
    }
    if (this.selectedAdapterType && this.selectedAdapterType.length > 0) {
      param = param.set('types', this.selectedAdapterType.toString());
    }

    if (this.selectedIndexNames && this.selectedIndexNames.length > 0) {
      param = param.set('knowledgeBases', this.selectedIndexNames.toString());
    }

    if (this.selectedTag && this.selectedTag.length > 0) {
      param = param.set('tags', this.selectedTag.toString());
    }
    this.pageNumber = this.pageNumber ? this.pageNumber : 1;
    this.pageSize = this.pageSize ? this.pageSize : 8;
    param = param.set('page', this.pageNumber);
    param = param.set('size', this.pageSize);
    this.datasetService.getDatasetsAdvancedFilter(param).subscribe((res) => {
      this.filteredCards = res;
      let timezoneOffset = new Date().getTimezoneOffset();
      if (this.filteredCards && this.filteredCards.length > 0) {
        this.filteredCards.forEach((e) => {
          e.lastmodifieddate = new Date(new Date(e.lastmodifieddate).getTime() - timezoneOffset * 60 * 1000);
        });
      }
      this.records = true;
      this.getIconStatus();
    });
    this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString(), this.selectedIndexNames.toString());
  }
  searchCards() {
    this.openSearchField = true;
  }
  handleSearch() {
    if (!this.filt || this.filt.trim() === '') {
      this.openSearchField = false;
    }
  }
  filterz(searchText?: string) {
    if (searchText !== undefined) {
      this.filt = searchText;
    }
    if (this.filt.length != this.filtbackup.length) {
      this.pageNumber = 1;
      this.filtbackup = this.filt;
    }

    this.records = false;
    this.filteredCards = [];
    let param: HttpParams = new HttpParams();
    let organization = sessionStorage.getItem('organization')
    param = param.set('organization', organization);
    if (this.filt && this.filt != '' && this.filt != null) {
      param = param.set('aliasOrName', this.filt);
    }
    if (this.selectedAdapterType && this.selectedAdapterType.length > 0) {
      param = param.set('types', this.selectedAdapterType.toString());
    }

    if (this.selectedIndexNames && this.selectedIndexNames.length > 0) {
      param = param.set('knowledgeBases', this.selectedIndexNames.toString());
    }

    if (this.selectedTag && this.selectedTag.length > 0) {
      param = param.set('tags', this.selectedTag.toString());
    }

    this.datasetService.getCountDatasetsAdvancedFilter(param).subscribe((res) => {
      this.noOfItems = res;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
      this.hoverStates = new Array(this.pageArr.length).fill(false);

      this.pageSize = 8;
      this.pageNumber = 1;
      param = param.set('page', this.pageNumber);
      param = param.set('size', this.pageSize);
      this.datasetService.getDatasetsAdvancedFilter(param).subscribe((res) => {
        this.filteredCards = res;
        let timezoneOffset = new Date().getTimezoneOffset();
        if (this.filteredCards && this.filteredCards.length > 0) {
          this.filteredCards.forEach((e) => {
            e.lastmodifieddate = new Date(new Date(e.lastmodifieddate).getTime() - timezoneOffset * 60 * 1000);
          });
        }
        this.records = true;
        this.getIconStatus();
      });
    });
    this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString());
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
      this.cards = resp;
      this.filteredCards = resp;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
      this.hoverStates = new Array(this.pageArr.length).fill(false);

      this.records = false;
    });
  }

  tagSelectedEvent(event: TagEventDTO) {
    this.selectedAdapterInstance = event.getSelectedAdapterInstance();
    this.selectedAdapterType = event.getSelectedAdapterType();
    this.selectedTag = event.getSelectedTagList();
    this.selectedIndexNames = event.getSelectedDatasetTopicType();

    this.tagrefresh = false;
    this.filterCards();
  }
  get shouldShowEmptyState(): boolean {
    return !this.loading && (!this.filteredCards || this.filteredCards.length === 0);
  }

  open() {
    if (this.type)
      this.router.navigate(["../create"], { relativeTo: this.route });
    else
      this.router.navigate(["./create"], { relativeTo: this.route });
  }

  desc(card: any) {
    if (this.type)
      this.router.navigate(["../view/" + card.name], { state: { card }, relativeTo: this.route });
    else

      this.router.navigate(["./view/" + card.name], {
        queryParams: {
          page: this.pageNumber,
          search: this.filt,
          type: this.selectedAdapterType.toString(),
          knowledgeBases: this.selectedIndexNames.toString(),
          org: sessionStorage.getItem('organization'),
          roleId: JSON.parse(sessionStorage.getItem('role')).id,
        },
        queryParamsHandling: 'merge',
        state: {
          card,
        },
        relativeTo: this.route,
      });
  }

  navigateToTab(tab: any) {
    this.selectedTab = tab;

    this.router.navigate([`../${tab}`], { relativeTo: this.route });

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
      if (result === 'delete') {
        this.datasetService.deleteDatasets(name).subscribe((res) => {

          this.ngOnInit();
          this.service.message('Dataset deleted successfully');

        },
          (error) => {
          }
        );
      }
    });
  }

  refreshcards(event) {
    this.ngOnInit();
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
      this.filterCards();

    }
  }
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

  routeBackToConnections() {
    this.router.navigate(["../../connections"], { relativeTo: this.route });
  }

  navigate(content: any) {
    this.copyDataset = true;
    this.selectedCard = content;

  }
  routeBackToList() {
    this.copyDataset = false;

  }
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

  openDatasetPreview(card) {
    let selectedReferenceObject = card;
    selectedReferenceObject["path"] = JSON.parse(card.attributes).path + '/' + JSON.parse(card.attributes).object;

  }
  selectedButton(i) {
    if (i == this.pageNumber) return { color: 'white', background: '#0094ff' };
    else return { color: 'black' };
  }

  downloadSelectedFile(card: any) {
    // //this.telemetry.addTelemetryEvent(card.alias + ' Downloaded ');
    if ((card.datasource?.type && card.datasource.type == 'MYSQL') || (card.views && card.views == 'Table View')) {
      this.downloadCSV(card);
      return;
    }
    let obj = JSON.parse(card.attributes).object;
    let data = this.getFileData(card.name, obj, card.organization)
    let extension = (obj).split('.').pop()
    if (extension.match('mkv')) {
      this.service.message('This file cannot be downloaded currently','warning');
    }
    else {
      data.then((res) => {
        this.downloadSelectedFiles(obj, res[0], extension, card)
      })
    }
  }

  downloadCSV(card) {
    this.service.messageNotificaionService('success', "Download initiated");
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
        if (resp && resp.length > 0) {
          const csvString = this.convertToCSV(resp);
          const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
          importedSaveAs(blob, card.alias + " Data-" + this.datepipe.transform(new Date(), "ddMMMyyyy-hhmmssa") + ".csv");
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
      .catch(err => this.service.message('Some error occured while fetching file ','error'));
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
            if (JSON.parse(card.attributes).object && fileN.includes(JSON.parse(card.attributes).object)) {
              const splitBySlash = fileN.split('/');
              let fileName = splitBySlash.slice(1).join('/');
              this.service.getNutanixFileData(card.name, `${fileName}`, card.organization).subscribe((res) => {
                if (res && res[0]) {
                  this.http.get(res[0][0], { responseType: 'blob' }).subscribe((resmp4) => {
                    const linkB = document.createElement('a');
                    const blob = new Blob([resmp4], { type: `application/${extension}` });
                    linkB.href = window.URL.createObjectURL(blob);
                    linkB.download = JSON.parse(card.attributes).object;;
                    linkB.click();
                    return;
                  },
                    (err) => this.service.message('Some error occured while downloading media file: '+err,'error'));
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
              if (JSON.parse(card.attributes).object && fileN.includes(JSON.parse(card.attributes).object)) {
                const splitBySlash = fileN.split('/');
                let fileName = splitBySlash.slice(1).join('/');
                this.service.getNutanixFileData(card.name, `${fileName}`, card.organization).subscribe((res) => {
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
                    const file = new File([blobdata], JSON.parse(card.attributes).object, { type: this.getExtntype(extension) });
                    link.href = window.URL.createObjectURL(file);
                    link.download = JSON.parse(card.attributes).object;;
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
        link.download = JSON.parse(card.attributes).object;;
        link.click();
      }
    }
    else {
      this.service.message('This file cannot be downloaded currently ','warning');
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

  openDialog(retrigger, type, status, card) {
    this.selectedCard = card;
    this.selectedEvent = type;
    this.status = status;
    this.dialog.open(type, {
      width: '400px',
      data: {
        retrigger,
        status,
        card
      }
    });
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
  /**
   * Listens for clicks outside the search container to collapse the input field.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const isInsideSearch = target.closest('.header-search');
    const isSearchIcon = target.closest('mat-icon'); // Check if the click is on the search icon

    // Only collapse the input field if the click is outside the search container and not on the search icon
    if (!isInsideSearch && !isSearchIcon && !this.filt) {
      this.isSearchVisible = false;
    }
  }

  lastRefreshTime() {
    // Simulate data fetching
    setTimeout(() => {
      this.lastRefreshedTime = new Date();
      console.log('Data refreshed!');
    }, 1000);
  }
  onFilterStatusChange(hasActiveFilters: boolean) {
    this.hasFilters = hasActiveFilters;
  }
}