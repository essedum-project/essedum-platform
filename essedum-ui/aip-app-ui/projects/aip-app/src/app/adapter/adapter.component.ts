import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../services/service';
import { TagsService } from '../services/tags.service';
import { AdapterServices } from '../sharedModule/services/adapter-service';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { AipDeleteConfirmationComponent } from '../sharedModule/aip-delete-confirmation/aip-delete-confirmation.component';

@Component({
  selector: 'app-adapter',
  templateUrl: './adapter.component.html',
  styleUrls: ['./adapter.component.scss'],
})
export class AdapterComponent implements OnInit {
  // Constants
  readonly CARD_TITLE = 'Implementations';
  readonly SERVICE_V1 = 'adapters';
  readonly CREATE_ACTION = 'create';
  readonly EDIT_ACTION = 'edit';

  // Component state
  hoverStates: boolean[] = [];
  hasFilters: boolean = false;
  loading: boolean = true;
  lastRefreshedTime: Date | null = null;
  cardToggled: boolean = true;
  tagrefresh: boolean = false;

  // Auth flags
  createAuth: boolean;
  editAuth: boolean;
  deleteAuth: boolean;
  deployAuth: boolean;

  // Data collections
  cards: any[] = [];
  allCards: any[] = [];
  allCardsFiltered: any[] = [];
  users: string[] = [];

  // Filter state
  filt: any = '';
  filtbackup: any = '';
  selectedConnectionNamesList: string[] = [];
  selectedCategoryList: string[] = [];
  selectedSpecList: string[] = [];

  // Pagination
  pageSize!: number;
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private adapterServices: AdapterServices,
    public tagService: TagsService,
    private dialog: MatDialog,
    private location: Location
  ) {}

  @HostListener('window:resize')
  onResize(): void {
    this.updatePageSizeOnly();
  }

  ngOnInit(): void {
    this.updatePageSizeOnly();
    this.route.queryParams.subscribe((params) =>
      this.handleQueryParams(params)
    );
    this.tagrefresh = false;
    this.updateQueryParam(this.pageNumber, this.filt);
    this.getCards(this.pageNumber, this.pageSize);

    if (this.pageNumberChanged) {
      this.pageNumber = 1;
      this.startIndex = 0;
      this.endIndex = 5;
    }
    this.loadAuthentications();
    this.updateLastRefreshTime();
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

  private handleQueryParams(params: any): void {
    if (params['page']) {
      this.pageNumber = +params['page'];
      this.filt = params['search'] || '';

      this.selectedSpecList = params['specList']
        ? params['specList'].split(',').filter(Boolean)
        : [];

      this.selectedConnectionNamesList = params['connectionList']
        ? params['connectionList'].split(',').filter(Boolean)
        : [];

      this.selectedCategoryList = params['categoryList']
        ? params['categoryList'].split(',').filter(Boolean)
        : [];

      this.hasFilters = !!(
        this.selectedSpecList.length ||
        this.selectedConnectionNamesList.length ||
        this.selectedCategoryList.length
      );
    } else {
      this.pageNumber = 1;
      this.filt = '';
    }
  }

  private updatePageSize(): void {
    const width = window.innerWidth;

    if (width > 2500) {
      this.itemsPerPage = [16, 32, 48, 64, 80, 96];
      this.pageSize = this.pageSize || 16; // xl
    } else if (width > 1440) {
      this.itemsPerPage = [10, 20, 40, 60, 80, 100];
      this.pageSize = this.pageSize || 10; // lg
    } else if (width > 1024) {
      this.itemsPerPage = [8, 16, 32, 48, 64, 80];
      this.pageSize = this.pageSize || 8; // md
    } else if (width >= 768) {
      this.itemsPerPage = [6, 9, 18, 36, 54, 72];
      this.pageSize = this.pageSize || 6; // sm
    } else {
      this.itemsPerPage = [4, 8, 12, 16, 20, 24];
      this.pageSize = this.pageSize || 4; // xs
    }

    this.getCards(this.pageNumber, this.pageSize);
  }

  private updatePageSizeOnly(): void {
    this.pageSize = 0;

    const width = window.innerWidth;

    if (width > 1440) {
      this.itemsPerPage = [10, 20, 40, 60, 80, 100];
      this.pageSize = 10; // lg
    } else if (width > 1024 && width <= 1440) {
      this.itemsPerPage = [8, 16, 32, 48, 64, 80];
      this.pageSize = 8; // md
    } else if (width >= 768 && width <= 1024) {
      this.itemsPerPage = [6, 9, 18, 36, 54, 72];
      this.pageSize = 6; // sm
    } else {
      this.itemsPerPage = [4, 8, 12, 16, 20, 24];
      this.pageSize = 4; // xs
    }
  }

  private getCards(page: number, size: number): void {
    this.loading = true;

    if (page) this.pageNumber = page;
    if (size) this.pageSize = size || 8;

    const timezoneOffset = new Date().getTimezoneOffset();
    const org = sessionStorage.getItem('organization');

    this.adapterServices.getAdapters(org).subscribe({
      next: (res) => {
        const data: any[] = [];

        res.forEach((element: any) => {
          element.createdon = new Date(
            new Date(element.createdon).getTime() - timezoneOffset * 60 * 1000
          );
          data.push(element);
          if (!this.users.includes(element.name)) {
            this.users.push(element.name);
          }
        });

        this.cards = data;
        this.allCards = data;
        this.allCardsFiltered = data;
        this.filterSelectedCards(page, size);
        this.loading = false;
      },
      error: (error) => {
        this.service.messageService(error);
        this.loading = false;
      },
    });
  }

  private updateQueryParam(
    page: number = 1,
    search: string = '',
    categoryList: string = '',
    connectionList: string = '',
    specList: string = '',
    org: string | null = sessionStorage.getItem('organization'),
    roleId: string | null = JSON.parse(sessionStorage.getItem('role') || '{}')
      .id
  ): void {
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

  private filterSelectedCards(page: any, size?: any): void {
    this.tagrefresh = false;
    let filteredCards = this.allCards;

    // Filter by category if needed
    if (this.selectedCategoryList.length > 0) {
      filteredCards = filteredCards.filter((card) =>
        this.selectedCategoryList.includes(card.category)
      );
    }

    // Filter by spec template if needed
    if (this.selectedSpecList.length > 0) {
      filteredCards = filteredCards.filter((card) =>
        this.selectedSpecList.includes(card.spectemplatedomainname)
      );
    }

    // Filter by connection name if needed
    if (this.selectedConnectionNamesList.length > 0) {
      filteredCards = filteredCards.filter((card) =>
        this.selectedConnectionNamesList.includes(card.connectionname)
      );
    }

    this.allCardsFiltered = filteredCards;
    this.cards = filteredCards;

    // Apply text search if filter exists
    if (this.filt.length >= 1) {
      this.onSearch();
    } else {
      this.filt = '';
    }

    // Update pagination
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
    this.pageArr = Array.from({ length: this.noOfPages }, (_, i) => i);
    this.hoverStates = new Array(this.pageArr.length).fill(false);
    this.initializePagination();
  }

  private refresh(): void {
    this.filt = '';
    this.getCards(this.pageNumber, this.pageSize);
  }

  private updateLastRefreshTime(): void {
    this.lastRefreshedTime = new Date();
  }

  private loadAuthentications(): void {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      this.createAuth = cipAuthority.includes('adapter-create');
      this.editAuth = cipAuthority.includes('adapter-edit');
      this.deleteAuth = cipAuthority.includes('adapter-delete');
    });
  }

  // rowsPerPageChanged() {
  //   if (this.pageSize == 0) {
  //     this.pageSize = this.prevRowsPerPageValue;
  //   } else {
  //     this.pageSizeChanged.emit(this.pageSize);
  //     this.prevRowsPerPageValue = this.pageSize;
  //     this.changeDetectionRef.detectChanges();
  //   }
  // }

  // showMore(category) {
  //   this.catStatus[category] = !this.catStatus[category];
  //   if (this.catStatus[category])
  //     this.tags[category] = this.allTags.filter(
  //       (tag) => tag.category == category
  //     );
  //   else
  //     this.tags[category] = this.allTags
  //       .filter((tag) => tag.category == category)
  //       .slice(0, 10);
  // }
  // filterByTag(tag) {
  //   this.tagStatus[tag.category + ' - ' + tag.label] =
  //     !this.tagStatus[tag.category + ' - ' + tag.label];

  //   if (!this.selectedTag.includes(tag)) {
  //     this.selectedTag.push(tag);
  //   } else {
  //     this.selectedTag.splice(this.selectedTag.indexOf(tag), 1);
  //   }
  // }

  get paginatedCards(): any[] {
    if (!this.cards || !this.pageSize) {
      return [];
    }

    const startIndex = (this.pageNumber - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.cards.length);
    return this.cards.slice(startIndex, endIndex);
  }

  get shouldShowEmptyState(): boolean {
    return !this.loading && (!this.cards || this.cards.length === 0);
  }

  get shouldShowPagination(): boolean {
    return this.cards && this.cards.length > 0 && this.noOfPages > 1;
  }

  trackByCardId(index: number, card: any): string | number {
    return card?.id || card?.name || index;
  }

  onSearch(searchText?: string): void {
    if (searchText !== undefined) {
      this.filt = searchText;
    }

    if (this.filt.length !== this.filtbackup.length) {
      this.pageNumber = 1;
      this.filtbackup = this.filt;
    }

    const searchTerm = this.filt.toLowerCase();
    this.cards = this.allCardsFiltered.filter((element) =>
      element.name.toLowerCase().includes(searchTerm)
    );

    this.noOfItems = this.cards.length;
    this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
    this.pageArr = Array.from({ length: this.noOfPages }, (_, i) => i);
    this.hoverStates = new Array(this.pageArr.length).fill(false);

    this.updateQueryParam(
      this.pageNumber,
      this.filt,
      this.selectedCategoryList?.toString() ?? '',
      this.selectedConnectionNamesList?.toString() ?? '',
      this.selectedSpecList?.toString() ?? ''
    );
  }

  onAdd(): void {
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

  onRefresh(): void {
    this.filt = '';
    this.tagrefresh = true;

    if (!this.hasFilters) {
      // Reset filters
      this.selectedConnectionNamesList = [];
      this.selectedSpecList = [];
      this.selectedCategoryList = [];

      // Reset pagination
      this.pageNumber = 1;

      // Update query params and refresh data
      this.updateQueryParam(1, '', '', '', '');
      this.updatePageSize();
    }

    // Update last refresh timestamp
    this.updateLastRefreshTime();
  }

  onTagSelected(event: any): void {
    this.pageNumber = 1;
    this.selectedConnectionNamesList =
      event.getSelectedMlAdapterConnectionType();
    this.selectedCategoryList = event.getSelectedMlAdapterCategoryType();
    this.selectedSpecList = event.getSelectedMlAdapterSpecType();
    this.filterSelectedCards(this.pageNumber);
  }

  onFilterStatusChange(hasActiveFilters: boolean): void {
    this.hasFilters = hasActiveFilters;
  }

  onViewDetails(card: any): void {
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

  openedit(content: any): void {
    this.dialog.open(content, {
      width: '560px',
      panelClass: 'standard-dialog',
    });
  }

  deleteAdapter(adapterName: string): void {
    const dialogRef = this.dialog.open(AipDeleteConfirmationComponent, {
      width: '360px',
      panelClass: 'standard-dialog',
    });
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

  triggereRefresh(event: boolean): void {
    if (event) this.onRefresh();
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
    if (page !== undefined) {
      this.pageNumber = Math.max(1, Math.min(page, this.noOfPages));
    }

    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      this.pageChanged.emit(this.pageNumber);

      this.getCards(this.pageNumber, this.pageSize);

      this.updateQueryParam(
        this.pageNumber,
        this.filt,
        this.selectedCategoryList.join(','),
        this.selectedConnectionNamesList.join(','),
        this.selectedSpecList.join(',')
      );
    }
  }

  changedToogle(event: boolean): void {
    this.refresh();
    this.cardToggled = event;
  }
}
