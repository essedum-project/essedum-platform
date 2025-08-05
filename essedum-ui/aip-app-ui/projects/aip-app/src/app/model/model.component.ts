import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Services } from '../services/service';
import { TagsService } from '../services/tags.service';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ModelComponent implements OnInit, OnChanges {
  hoverStates: boolean[] = [];
  hasFilters = false;
  lastRefreshedTime: Date | null = null;
  test: any;
  cards: any;
  options = [];
  alias = [];
  datasetTypes = [];
  OptionType: any;
  selectedInstance: any;
  keys: any = [];
  users: any = [];
  filter: string = '';
  selectedCard: any = [];
  cardToggled: boolean = true;

  // Pagination
  pageSize: number = 8;
  pageNumber: number = 1;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number = 0;
  prevRowsPerPageValue!: number;
  itemsPerPage: number[] = [];
  noOfItems: number;
  startIndex: number;
  endIndex: number;
  pageNumberChanged: boolean = true;

  @Output() pageChanged = new EventEmitter<number>();
  @Output() pageSizeChanged = new EventEmitter<number>();

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
  selectedTagList: any[];
  selectedType: string[] = [];
  datasource: any;
  selectedDatasource: string[] = [];
  selectedAdapterInstance: string[] = [];
  dataSourceList: any[] = [];
  adapterInstanceList: any[] = [];
  servicev1 = 'model';
  tagrefresh: boolean = false;
  records: boolean = false;
  cortexwindow: any;
  tooltip: string = 'above';

  constructor(
    private service: Services,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetectionRef: ChangeDetectorRef,
    public tagService: TagsService,
    private dialog: MatDialog,
    private location: Location
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    this.refresh();
  }
  cardTitle: String = 'Models';

  ngOnInit(): void {
    this.records = false;
    this.route.queryParams.subscribe((params) => {
      if (params['page']) {
        this.pageNumber = params['page'];
        this.filter = params['search'];
        this.selectedDatasource = params['datasource']
          ? params['datasource'].split(',')
          : [];
        this.selectedAdapterInstance = params['adapterInstance']
          ? params['adapterInstance'].split(',')
          : [];
      } else {
        this.pageNumber = 1;
        this.pageSize = 8;
        this.filter = '';
      }
    });
    this.updateQueryParam(this.pageNumber);
    this.getCountModels();
    this.getCards();
    this.Authentications();
    this.lastRefreshTime();
    this.fetchDatasourceFilterList();
  }

  updateQueryParam(
    page: number = 1,
    search: string = '',
    adapterType: string = '',
    adapterInstance: string = '',
    org: string = sessionStorage.getItem('organization'),
    roleId: string = JSON.parse(sessionStorage.getItem('role')).id
  ) {
    const url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          type: adapterType,
          adapterInstance: adapterInstance,
          org: org,
          roleId: roleId,
        },
        queryParamsHandling: 'merge',
      })
      .toString();

    this.location.replaceState(url);
  }

  Authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      if (cipAuthority.includes('model-create')) this.createAuth = true;
      if (cipAuthority.includes('model-edit')) this.editAuth = true;
      if (cipAuthority.includes('model-delete')) this.deleteAuth = true;
      if (cipAuthority.includes('model-deploy')) this.deployAuth = true;
    });
  }

  private initializePagination(): void {
    // Define how many page numbers to show
    const visiblePages = 5;
    const halfVisible = Math.floor(visiblePages / 2);

    if (!this.noOfPages) {
      this.startIndex = 0;
      this.endIndex = visiblePages;
    } else if (this.noOfPages <= visiblePages) {
      // If we have fewer pages than the visible count, show all
      this.startIndex = 0;
      this.endIndex = this.noOfPages;
    } else if (this.pageNumber <= halfVisible + 1) {
      // Near the beginning
      this.startIndex = 0;
      this.endIndex = visiblePages;
    } else if (this.pageNumber >= this.noOfPages - halfVisible) {
      // Near the end
      this.startIndex = this.noOfPages - visiblePages;
      this.endIndex = this.noOfPages;
    } else {
      // In the middle - center the current page
      this.startIndex = this.pageNumber - halfVisible - 1;
      this.endIndex = this.pageNumber + halfVisible;
    }

    // Ensure indexes are within valid bounds
    this.startIndex = Math.max(0, this.startIndex);
    this.endIndex = Math.min(this.noOfPages, this.endIndex);
  }

  changedToogle(event: any) {
    this.cardToggled = event;
  }

  tagchange() {
    this.tagService.tags.forEach((element: any) => {    
    });
  }

  getCards(): void {
    let params: HttpParams = new HttpParams();

    if (this.selectedDatasource.length >= 1)
      params = params.set('connectionname', this.selectedDatasource.toString());

    if (this.filter && this.filter.length > 0) {
      params = params.set('searchquery', this.filter);
    }

    // Set page and size
    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);

    this.service.getModelCards(params).subscribe((res) => {
      let data: any = [];
      let test = res;
      test.forEach((element: any) => {
        data.push(element);
        this.users.push(element.appName);
      });
      this.cards = data;
      if (this.cards.length == 0) {
        this.records = true;
      } else {
        this.records = false;
      }
    });

    this.updateQueryParam(
      this.pageNumber,
      this.filter,
      this.selectedDatasource.toString(),
      this.selectedAdapterInstance.toString()
    );
  }

  getCountModels() {
    let params: HttpParams = new HttpParams();

    if (this.filter.length >= 1)
      params = params.set('searchquery', this.filter);
    if (this.selectedDatasource.length >= 1)
      params = params.set('connectionname', this.selectedDatasource.toString());

    this.service.getCountModels(params).subscribe((res) => {
      this.noOfItems = res;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
      this.initializePagination();
      if (res) {
        this.records = false;
      } else {
        this.records = true;
      }
    });
  }

  redirect() {
    this.options.forEach((element: any) => {
      if (element.alias === this.selectedInstance) {
        this.selectedInstance = element.name;
      }
    });
    this.router.navigate(['./preview', this.cardTitle, this.selectedInstance], {
      relativeTo: this.route,
    });
  }

  downloadModel(card: any) {
    let obj = JSON.parse(card.attributes).object;
    let extension = obj.split('.').pop();
    let fileName = obj.split('/').toString();
    if (extension.match('mkv')) {
      this.service.messageService('This file cannot be downloaded currently');
    } else {
      this.service.messageNotificaionService('success', 'Download initiated');

      this.service
        .getModelFileData(card.modelName, `${fileName}`, card.organisation)
        .subscribe(blob=> {
              const linkA = document.createElement('a');
              const url = window.URL.createObjectURL(blob);
              linkA.href = url
              linkA.download = fileName;
              linkA.click();
              window.URL.revokeObjectURL(url);
            },
              err => {
              this.service.message('Download Failed. Invalid Data', 'error');
            });
          
    }
  }

  selectChange(value: string): void {
    this.selectedInstance = value;
    this.redirect();
  }

  createModel() {
    this.router.navigate(['./create'], {
      relativeTo: this.route,
    });
  }

  editModel(card: any) {
    console.log(card);
    this.router.navigate(['./edit-model', card.id], {
      relativeTo: this.route,
    });
  }

  viewDetails(card: any, type: string) {
    this.router.navigate(['./' + type + '/' + card.id], {
      relativeTo: this.route,
    });
  }

  clickactive(eventObj: any) {}
  refresh() {
    this.getCountModels();
    this.getCards();
  }
  
  refreshComplete() {
    this.tagrefresh = true;
    this.filter = '';
    this.selectedDatasource = [];
    this.selectedTag = [];
    this.getCountModels();
    this.getCards();
    this.lastRefreshTime();
  }

  filterz(searchText?: string) {
    if (searchText !== undefined) {
      this.filter = searchText;
    }
    this.refresh();
  }

  tagSelectedEvent(event) {
    console.log('TagSelectedEvent received:', event);
    if (event && typeof event.getSelectedModelDatasource === 'function') {
      this.selectedDatasource = event.getSelectedModelDatasource();
    } else {
      this.selectedDatasource = [];
    }
    console.log('Selected datasources:', this.selectedDatasource);
    this.pageNumber = 1;
    this.tagrefresh = false;
    this.refresh();
  }

  deleteModels(card) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.service
          .deleteModels(card.id, card.adapterId, card.version)
          .subscribe(
            (res) => {
              this.service.message('Done!  Model deleted Successfully');
              this.refresh();
            },
            (error) => {
              this.service.message('Error ', 'error');
            }
          );
      }
    });
  }

  lastRefreshTime() {
    setTimeout(() => {
      this.lastRefreshedTime = new Date();
    }, 1000);
  }

  onFilterStatusChange(hasActiveFilters: boolean) {
    this.hasFilters = hasActiveFilters;
  }

  onNextPage(): void {
    if (this.pageNumber < this.noOfPages) {
      this.pageNumber++;
      this.onChangePage();
    }
  }

  onPrevPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.onChangePage();
    }
  }

  onChangePage(page?: number): void {
    if (page !== undefined && page >= 1 && page <= this.noOfPages) {
      this.pageNumber = page;
    }

    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      this.pageChanged.emit(this.pageNumber);
      this.initializePagination();
      this.getCards();
    }
  }

  fetchDatasourceFilterList() {
    let params: HttpParams = new HttpParams();
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.getModelDatasourceList(params).subscribe((res) => {
      this.datasource = res;
      this.dataSourceList = [];
      this.datasource.forEach((element: any) => {
        this.dataSourceList.push({
          category: 'Datasource',
          label: element.alias,
          value: element.name,
          selected: false,
        });
      });
    });
  }
}
