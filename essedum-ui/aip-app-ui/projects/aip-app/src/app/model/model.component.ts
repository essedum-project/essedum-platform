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
  adapterTypes: any;
  selectedAdapterType: string[] = [];
  selectedAdapterInstance: string[] = [];
  adapterTypeList: any[] = [];
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
  ) { }
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
        this.selectedAdapterType = params['modelType']
          ? params['modelType'].split(',')
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
    this.fetchAdapters();
    this.lastRefreshTime();
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

  fetchAdapters(): boolean {
    let params: HttpParams = new HttpParams();
    this.adapterInstanceList = [];
    //this.selectedAdapterInstance = [];
    if (this.selectedAdapterType.length >= 1)
      params = params.set('adapterType', this.selectedAdapterType.toString());
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.getModelListAdapters(params).subscribe((res) => {
      let test = res.body;
      this.alias = test.map((item: any) => item.alias);
      this.options = test;
      test.forEach((element: any) => {
        this.adapterInstanceList.push({
          category: 'Instance',
          label: element.alias,
          value: element.name,
          selected: false,
        });
      });
    });
    return true;
  }
  tagchange() {
    this.tagService.tags.forEach((element: any) => {
      // console.log(element, 'element');
    });
  }
  getCards(): void {
    let params: HttpParams = new HttpParams();

    if (this.filter && this.filter.length > 0) {
      params = params.set('modelname', this.filter);
    }

    if (this.selectedAdapterType && this.selectedAdapterType.length > 0) {
      params = params.set('type', this.selectedAdapterType.toString());
    }

    // Set page and size
    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);

    params = params.set('project', sessionStorage.getItem('organization'));
    params = params.set('isCached', true);

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
      // console.log('DATA', this.cards);
    });

    this.updateQueryParam(
      this.pageNumber,
      this.filter,
      this.selectedAdapterType.toString(),
      this.selectedAdapterInstance.toString()
    );
  }
  getCountModels() {
    let params: HttpParams = new HttpParams();
    if (this.selectedTag.length >= 1)
      params = params.set('tags', this.selectedTag.toString());
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    if (this.selectedAdapterType.length >= 1)
      params = params.set('type', this.selectedAdapterType.toString());
    if (this.selectedAdapterInstance.length >= 1)
      params = params.set('instance', this.selectedAdapterInstance.toString());
    params = params.set('project', sessionStorage.getItem('organization'));
    params = params.set('isCached', false);
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
    let extension = (obj).split('.').pop();
    let fileName = obj.split('/').toString();
    if (extension.match('mkv')) {
      this.service.messageService('This file cannot be downloaded currently');
    }
    else {
      this.service.messageNotificaionService('success', "Download initiated");

      this.service.getModelFileData(card.modelName, `${fileName}`, card.organisation).subscribe((res: any) => {
        if (res && res[0]) {
          const fileData = res[0];
          let downloadData = fileData[0].data;
          const contentType = fileData[0].contentType;

          try {

            const decode = atob(downloadData);
            // const blob = new Blob([decode], { type: 'text/csv;charset=utf-8;' })
            

            const byteArray = new Uint8Array(decode.length);
            for (let i = 0; i < decode.length; i++) {
              byteArray[i] = decode.charCodeAt(i);
            }
            const blob = new Blob([byteArray], { type: contentType });

            const linkA = document.createElement('a');
            linkA.href = window.URL.createObjectURL(blob);
            linkA.download = fileName;
            linkA.click();
            URL.revokeObjectURL(linkA.href);
          }
          catch (e) {
            this.service.message("Download Failed. Invalid Data", 'error')
          }
        } else {
          this.service.message("Download Failed. Data does not exist", 'error')

        }

      });
    }


  }
  redirection(card: any, type: string) {
    this.router.navigate(['./' + type + '/' + card.id], {
      queryParams: {
        page: this.pageNumber,
        search: this.filter,
        adapterType: this.selectedAdapterType.toString(),
        adapterInstance: this.selectedAdapterInstance.toString(),
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

  selectChange(value: string): void {
    this.selectedInstance = value;
    this.redirect();
  }

  createModel(){
    this.router.navigate(['./create'], {
      relativeTo: this.route
    });
  }

  editModel(card: any) {
    console.log(card);
    this.router.navigate(['./edit-model', card.id], {
      relativeTo: this.route,
    });
  }

  viewDetails(card: any, type: string){
     this.router.navigate(['./' + type + '/' + card.id], {
      relativeTo: this.route,
    });
  }

  clickactive(eventObj: any) { }
  refresh() {
    this.getCountModels();
    this.fetchAdapters();

    this.getCards();
  }
  refreshComplete() {
    this.tagrefresh = true;
    this.filter = '';
    this.selectedAdapterType = [];
    this.selectedTag = [];
    this.getCountModels();
    this.fetchAdapters();

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
    this.selectedAdapterInstance = event.getSelectedAdapterInstance();
    this.selectedAdapterType = event.getSelectedAdapterType();
    this.pageNumber = 1;
    this.selectedTag = event.getSelectedTagList();
    this.tagrefresh = false;
    this.refresh();
  }

  deleteDeployment(card) {
    // console.log('deletecard', card);
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.service
          .undeployModel(
            card.adapterId,
            card.version,
            card.sourceId,
            card.deployment
          )
          .subscribe(
            (res) => {
              this.service.message(
                'Done!  Model Un-deployed Successfully '+ res,
                'success'
              );
              this.refresh();
            },
            (error) => {
              this.service.message('Error '+error, 'error');
            }
          );
      }
    });
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
}
