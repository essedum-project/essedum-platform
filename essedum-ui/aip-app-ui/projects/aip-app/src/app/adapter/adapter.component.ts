import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../services/service';
import { TagsService } from '../services/tags.service';
import { AdapterServices } from './adapter-service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-adapter',
  templateUrl: './adapter.component.html',
  styleUrls: ['./adapter.component.scss'],
})
export class AdapterComponent implements OnInit, OnChanges {
  cardTitle: String = 'Implementations';
  isSearchHovered: boolean = false;
  isAddHovered: boolean = false;
  isRefreshHovered: boolean = false;
  isMenuHovered: boolean = false;
  createAction = 'create';
  editAction = 'edit';
  test: any;
  cards: any;
  allCards: any;
  allCardsFiltered: any;
  options = [];
  alias = [];
  datasetTypes = [];
  OptionType: any;
  selectedInstance: any;
  keys: any = [];
  users: any = [];
  filt: any = '';
  selectedCard: any = [];
  cardToggled: boolean = true;
  pageSize: number;
  pageNumber: number;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number = 0;
  prevRowsPerPageValue: number;
  itemsPerPage: number[] = [];
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
  selectedConnectionNamesList: string[] = [];
  selectedCategoryList: string[] = [];
  selectedSpecList: string[] = [];
  records: boolean = false;
  isExpanded = false;
  tooltip: string = 'above';
  filtbackup: any = '';
  tagrefresh: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private adapterServices: AdapterServices,
    private changeDetectionRef: ChangeDetectorRef,
    public tagService: TagsService,
    private dialog: MatDialog,
    private location: Location
  ) {}

  ngOnChanges(changes: SimpleChanges): void {}

  @HostListener('window:resize', ['$event'])
  onResize(event) {}

  updatePageSize() {
    this.pageSize = 0;
    if (window.innerWidth > 2500) {
      this.itemsPerPage = [16, 32, 48, 64, 80, 96];
      this.pageSize = this.pageSize || 16; // xl
      this.getCards(this.pageNumber, this.pageSize);
    } else if (window.innerWidth > 1440 && window.innerWidth <= 2500) {
      this.itemsPerPage = [10, 20, 40, 60, 80, 100];
      this.pageSize = this.pageSize || 10; // lg
      this.getCards(this.pageNumber, this.pageSize);
    } else if (window.innerWidth > 1024 && window.innerWidth <= 1440) {
      this.itemsPerPage = [8, 16, 32, 48, 64, 80];
      this.pageSize = this.pageSize || 8; //md
      this.getCards(this.pageNumber, this.pageSize);
    } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      this.itemsPerPage = [6, 9, 18, 36, 54, 72];
      this.pageSize = this.pageSize || 6; //sm
      this.getCards(this.pageNumber, this.pageSize);
    } else if (window.innerWidth < 768) {
      this.itemsPerPage = [4, 8, 12, 16, 20, 24];
      this.pageSize = this.pageSize || 4; //xs
      this.getCards(this.pageNumber, this.pageSize);
    }
  }

  ngOnInit(): void {
    this.updatePageSizeOnly();
    this.records = false;
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['page']) {
        this.pageNumber = params['page'];
        this.filt = params['search'];
        this.selectedSpecList = params['specList']
          ? params['specList'].split(',')
          : [];
        this.selectedConnectionNamesList = params['connectionList']
          ? params['connectionList'].split(',')
          : [];
        this.selectedCategoryList = params['categoryList']
          ? params['categoryList'].split(',')
          : [];
        if (
          (this.selectedSpecList && this.selectedSpecList.length > 0) ||
          (this.selectedConnectionNamesList &&
            this.selectedConnectionNamesList.length > 0) ||
          (this.selectedCategoryList && this.selectedCategoryList.length > 0)
        ) {
          this.isExpanded = true;
        }
      } else {
        this.pageNumber = 1;
        this.filt = '';
      }
    });
    this.tagrefresh = false;
    this.updateQueryParam(this.pageNumber, this.filt);
    this.getCards(this.pageNumber, this.pageSize);

    if (this.pageNumberChanged) {
      this.pageNumber = 1;
      this.startIndex = 0;
      this.endIndex = 5;
    }
    this.Authentications();
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

  updateQueryParam(
    page: number = 1,
    search: string = '',
    categoryList: string = '',
    connectionList: string = '',
    specList: string = '',
    org: string | null = sessionStorage.getItem('organization'),
    roleId: string | null = JSON.parse(sessionStorage.getItem('role') || '{}')
      .id
  ) {
    const urlTree = this.router.createUrlTree([], {
      queryParams: {
        page: page,
        search: search,
        categoryList: categoryList,
        connectionList: connectionList,
        specList: specList,
        org: org,
        roleId: roleId,
      },
      queryParamsHandling: 'merge',
    });
    const url = this.router.serializeUrl(urlTree);
    this.location.replaceState(url);
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
    this.getCards(this.pageNumber, this.pageSize);
  }

  rowsPerPageChanged() {
    if (this.pageSize == 0) {
      this.pageSize = this.prevRowsPerPageValue;
    } else {
      this.pageSizeChanged.emit(this.pageSize);
      this.prevRowsPerPageValue = this.pageSize;
      this.changeDetectionRef.detectChanges();
    }
  }

  Authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      // adapter-create permission
      if (cipAuthority.includes('adapter-create')) this.createAuth = true;
      // adapter-edit/update permission
      if (cipAuthority.includes('adapter-edit')) this.editAuth = true;
      // adapter-delete permission
      if (cipAuthority.includes('adapter-delete')) this.deleteAuth = true;
    });
  }

  changedToogle(event: any) {
    this.refresh();
    this.cardToggled = event;
  }

  tagchange() {}

  numSequence(n: number): Array<number> {
    return Array(n);
  }

  getCards(page: any, size: any): void {
    if (page) this.pageNumber = page;
    if (size) this.pageSize = size || 8;
    let timezoneOffset = new Date().getTimezoneOffset();
    let org = sessionStorage.getItem('organization');
    this.adapterServices.getAdapters(org).subscribe((res) => {
      let data: any = [];
      let test = res;
      test.forEach((element: any) => {
        element.createdon = new Date(
          new Date(element.createdon).getTime() - timezoneOffset * 60 * 1000
        );
        data.push(element);
        this.users.push(element.name);
      });
      this.cards = data;
      this.allCards = data;
      this.allCardsFiltered = data;
      this.filterSelectedCards(page, size);
    });
  }

  desc(card: any) {
    this.router.navigate(['../implementations/' + card.name], {
      queryParams: {
        page: this.pageNumber,
        search: this.filt,
        categoryList: this.selectedCategoryList.toString(),
        org: sessionStorage.getItem('organization'),
        roleId: JSON.parse(sessionStorage.getItem('role')).id,
      },
      queryParamsHandling: 'merge',
      relativeTo: this.route,
    });
  }

  redirect() {
    this.router.navigate(['./create'], {
      queryParams: {
        page: this.pageNumber,
        search: this.filt,

        categoryList: this.selectedCategoryList.toString(),
        org: sessionStorage.getItem('organization'),
        roleId: JSON.parse(sessionStorage.getItem('role')).id,
      },
      queryParamsHandling: 'merge',

      relativeTo: this.route,
    });
  }

  filterSelectedCards(page: any, size?: any) {
    this.tagrefresh = false;
    if (
      this.selectedConnectionNamesList.length > 0 ||
      this.selectedCategoryList.length > 0 ||
      this.selectedSpecList.length > 0
    ) {
      if (this.selectedCategoryList.length > 0) {
        let data: any = [];
        this.selectedCategoryList.forEach((element: any) => {
          this.allCards.forEach((ele: any) => {
            if (ele.category == element) {
              data.push(ele);
            }
          });
        });
        this.allCardsFiltered = data;
      } else {
        this.allCardsFiltered = this.allCards;
      }
      if (this.selectedSpecList.length > 0) {
        let data: any = [];
        this.selectedSpecList.forEach((element: any) => {
          this.allCardsFiltered.forEach((ele: any) => {
            if (ele.spectemplatedomainname == element) {
              data.push(ele);
            }
          });
        });
        this.allCardsFiltered = data;
      }
      if (this.selectedConnectionNamesList.length > 0) {
        let data: any = [];
        this.selectedConnectionNamesList.forEach((element: any) => {
          this.allCardsFiltered.forEach((ele: any) => {
            if (ele.connectionname == element) {
              data.push(ele);
            }
          });
        });
        this.allCardsFiltered = data;
      }
      this.cards = this.allCardsFiltered;
    } else {
      this.allCardsFiltered = this.allCards;
      this.cards = this.allCards;
    }
    if (this.cards.length == 0) {
      this.records = true;
    } else {
      this.records = false;
    }
    if (this.filt.length >= 1) {
      this.filterz();
    } else {
      this.filt = '';
    }
    if (page) this.pageNumber = page;
    this.updateQueryParam(
      this.pageNumber,
      this.filt,
      this.selectedCategoryList?.toString() ?? '',
      this.selectedConnectionNamesList?.toString() ?? '',
      this.selectedSpecList?.toString() ?? ''
    );
    this.noOfItems = this.cards.length;
    this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
    this.pageArr = [...Array(this.noOfPages).keys()];
  }
  filterz() {
    if (this.filt.length != this.filtbackup.length) {
      this.pageNumber = 1;
      this.filtbackup = this.filt;
    }
    let data: any = [];
    this.allCardsFiltered.forEach((element: any) => {
      if (element.name.toLowerCase().includes(this.filt.toLowerCase())) {
        data.push(element);
      }
    });
    this.cards = data;
    if (this.cards.length == 0) {
      this.records = true;
    } else {
      this.records = false;
    }
    this.noOfItems = this.cards.length;
    this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
    this.pageArr = [...Array(this.noOfPages).keys()];
    this.updateQueryParam(
      this.pageNumber,
      this.filt,
      this.selectedCategoryList?.toString() ?? '',
      this.selectedConnectionNamesList?.toString() ?? '',
      this.selectedSpecList?.toString() ?? ''
    );
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
    this.tagStatus[tag.category + ' - ' + tag.label] =
      !this.tagStatus[tag.category + ' - ' + tag.label];

    if (!this.selectedTag.includes(tag)) {
      this.selectedTag.push(tag);
    } else {
      this.selectedTag.splice(this.selectedTag.indexOf(tag), 1);
    }
  }

  tagSelectedEvent(event) {
    this.pageNumber = 1;
    this.selectedConnectionNamesList =
      event.getSelectedMlAdapterConnectionType();
    this.selectedCategoryList = event.getSelectedMlAdapterCategoryType();
    this.selectedSpecList = event.getSelectedMlAdapterSpecType();
    this.filterSelectedCards(this.pageNumber);
  }

  openedit(content: any): void {
    this.dialog.open(content, {
      width: '830px',
      panelClass: 'standard-dialog',
    });
  }

  refresh() {
    this.filt = '';
    this.records = false;
    this.getCards(this.pageNumber, this.pageSize);
  }

  deleteAdapter(adapterName: string) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.adapterServices.deleteAdapter(adapterName).subscribe(
          (res) => {
            if (res) {
              if (res.message == 'success') {
                this.adapterServices.messageNotificaionService(
                  'success',
                  'Done!  Implementation Deleted Successfully'
                );
                this.refresh();
              } else
                this.adapterServices.messageNotificaionService(
                  'warning',
                  "Implementation Can't be Deleted, It's being used by instance(s)"
                );
            } else
              this.adapterServices.messageNotificaionService('error', 'Error');
          },
          (error) => {
            this.service.messageService(error);
          }
        );
      }
    });
  }

  selectedButton(i) {
    if (i == this.pageNumber) return { color: 'white', background: '#0094ff' };
    else return { color: 'black' };
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

  triggereRefresh($event) {
    if ($event) this.completeRefresh();
  }

  updatePageSizeOnly() {
    this.pageSize = 0;
    if (window.innerWidth > 1440) {
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

  completeRefresh() {
    this.filt = '';
    this.tagrefresh = true;
    if (!this.isExpanded) {
      this.selectedConnectionNamesList = [];
      this.selectedSpecList = [];
      this.selectedCategoryList = [];
      this.updateQueryParam(1, '', '', '', '');
      this.pageNumber = 1;
      this.filt = '';
      this.tagrefresh = true;
      this.updatePageSize();
    }
  }
}
