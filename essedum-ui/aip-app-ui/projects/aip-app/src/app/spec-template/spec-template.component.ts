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
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../services/service';
import { TagsService } from '../services/tags.service';
import { AdapterServices } from '../sharedModule/services/adapter-service';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import * as _ from 'lodash';
import { AipDeleteConfirmationComponent } from '../sharedModule/aip-delete-confirmation/aip-delete-confirmation.component';

@Component({
  selector: 'app-spec-template',
  templateUrl: './spec-template.component.html',
  styleUrls: ['./spec-template.component.scss'],
})
export class SpecTemplateComponent implements OnInit, OnChanges {
  // Constants
  readonly CARD_TITLE = 'Specs';
  readonly SERVICE_V1 = 'specs';

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
  selectedCapabilityType: string[] = [];

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

  // selectedTag = [];

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

  @HostListener('window:resize')
  onResize(): void {
    this.updatePageSizeOnly();
  }

  ngOnInit(): void {
    this.updatePageSizeOnly();
    this.initFromQueryParams();
    this.loadInitialData();
    this.loadAuthentication();
    this.updateLastRefreshTime();
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

  private initFromQueryParams(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['page']) {
        this.pageNumber = +params['page'];
        this.filt = params['search'] || '';
        this.selectedCapabilityType = params['capabilityTypes']
          ? params['capabilityTypes'].split(',')
          : [];
        this.hasFilters = this.selectedCapabilityType.length > 0;
      } else {
        this.pageNumber = 1;
        this.filt = '';
      }
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

  private loadInitialData(): void {
    this.tagrefresh = false;
    this.updateQueryParam(this.pageNumber, this.filt);
    this.getCountSpecTemplates();
    this.getCards(this.pageNumber, this.pageSize);
  }

  private updateQueryParam(
    page: number = 1,
    search: string = '',
    capabilityTypes: string = '',
    org: string = sessionStorage.getItem('organization') || '',
    roleId: string = (() => {
      const role = sessionStorage.getItem('role');
      return role ? JSON.parse(role).id : '';
    })()
  ): void {
    const url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          capabilityTypes: capabilityTypes,
          org: org,
          roleId: roleId,
        },
        queryParamsHandling: 'merge',
      })
      .toString();
    this.location.replaceState(url);
  }

  private getCountSpecTemplates(): void {
    let params: HttpParams = new HttpParams();

    const org = sessionStorage.getItem('organization');
    if (this.filt?.length >= 1) {
      params = params.set('query', this.filt);
    }

    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);

    if (this.selectedCapabilityType?.length >= 1) {
      params = params.set(
        'capabilityTypes',
        this.selectedCapabilityType.toString()
      );
    }

    // Assuming `this.organization` is passed as a path variable to the service
    this.adapterServices
      .getCountSpecTemplates(org, this.filt, this.selectedCapabilityType.join())
      .subscribe((res) => {
        this.noOfItems = res;
        console.log('No of Items: ', this.noOfItems);
      });
  }

  private loadAuthentication(): void {
    this.service.getPermission('cip').subscribe((permissions) => {
      this.createAuth = permissions.includes('spectemplate-create');
      this.editAuth = permissions.includes('spectemplate-edit');
      this.deleteAuth = permissions.includes('spectemplate-delete');
    });
  }

  private updateLastRefreshTime(): void {
    this.lastRefreshedTime = new Date();
  }

  private getCards(
    page?: number,
    size?: number,
    query?: string,
    type?: string
  ): void {
    this.loading = true;

    if (page !== undefined) this.pageNumber = page;
    if (size !== undefined) this.pageSize = size;
    if (query !== undefined) this.filt = query;
    if (type !== undefined) this.selectedCapabilityType = type.split(',');

    this.pageSize = this.pageSize || 9;
    const timezoneOffset = new Date().getTimezoneOffset();
    const org = sessionStorage.getItem('organization') || '';

    this.adapterServices
      .getMlSpecTemplatesCards(
        org,
        this.pageNumber,
        this.pageSize,
        this.filt,
        this.selectedCapabilityType.join(',')
      )
      .subscribe({
        next: (res: any[]) => {
          const data: any[] = [];
          this.users = [];

          res.forEach((element) => {
            element.lastmodifiedon = new Date(
              new Date(element.lastmodifiedon).getTime() -
                timezoneOffset * 60 * 1000
            );
            data.push(element);
            this.users.push(element.domainname);
          });

          this.cards = data;
          this.allCards = data;
          this.allCardsFiltered = data;

          this.updatePagination();
          this.changeDetectionRef.detectChanges();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching cards:', error);

          this.loading = false;
        },
      });
  }

  private refresh(): void {
    this.getCards(this.pageNumber, this.pageSize);
  }

  private filterSelectedCards(page: any, size?: any) {
    this.tagrefresh = false;
    if (page) {
      this.pageNumber = page;
    }

    this.updateQueryParam(
      this.pageNumber,
      this.filt,
      this.selectedCapabilityType?.toString() ?? ''
    );

    // Fetch new data with filters
    this.getCards(
      this.pageNumber,
      this.pageSize,
      this.filt,
      this.selectedCapabilityType.join(',')
    );
    // Get updated count
    this.getCountSpecTemplates();
  }

  private updatePagination(): void {
    // Calculate total pages
    this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);

    // Create page array
    this.pageArr = Array.from({ length: this.noOfPages }, (_, i) => i);
    this.hoverStates = new Array(this.pageArr.length).fill(false);
    this.initializePagination();
  }

  // rowsPerPageChanged() {
  //   if (this.pageSize == 0) {
  //     this.pageSize = this.prevRowsPerPageValue;
  //   } else {
  //     this.pageSizeChanged.emit(this.pageSize);
  //     this.prevRowsPerPageValue = this.pageSize;
  //     this.pageNumber = 1; // Reset to first page when changing page size

  //     // Update pagination
  //     this.getCountSpecTemplates();
  //     this.getCards(this.pageNumber, this.pageSize);

  //     // Update URL params
  //     this.updateQueryParam(
  //       this.pageNumber,
  //       this.filt,
  //       this.selectedCapabilityType?.toString() ?? ''
  //     );
  //   }
  // }

  // redirect() {
  //   this.selectedInstance = this.selectedCard.name;
  //   this.router.navigate(['./view', this.CARD_TITLE, this.selectedInstance], {
  //     relativeTo: this.route,
  //   });
  // }

  // getTags() {
  //   this.tags = {};
  //   this.tagsBackup = {};
  //   this.service.getMlTags().subscribe((resp) => {
  //     this.allTags = resp;
  //     resp.forEach((tag) => {
  //       if (this.category.indexOf(tag.category) == -1) {
  //         this.category.push(tag.category);
  //       }
  //       this.tagStatus[tag.category + ' - ' + tag.label] = false;
  //     });
  //     this.category.forEach((cat) => {
  //       this.tags[cat] = this.allTags
  //         .filter((tag) => tag.category == cat)
  //         .slice(0, 10);
  //       this.tagsBackup[cat] = this.allTags.filter(
  //         (tag) => tag.category == cat
  //       );
  //       this.catStatus[cat] = false;
  //     });
  //   });
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

    return this.cards;
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

  onSearch(searchText?: string) {
    if (searchText !== undefined) {
      this.filt = searchText;
    }
    if (this.filt.length != this.filtbackup.length) {
      this.pageNumber = 1;
      this.filtbackup = this.filt;
    }

    // Update query parameters and refresh data from backend
    this.updateQueryParam(
      this.pageNumber,
      this.filt,
      this.selectedCapabilityType?.toString() ?? ''
    );

    // Fetch new data with filter
    this.getCards(this.pageNumber, this.pageSize, this.filt);
    // Get updated count
    this.getCountSpecTemplates();
  }

  createSpecTemplate(): void {
    this.router.navigate(['./create'], {
      relativeTo: this.route,
    });
  }

  onRefresh(): void {
    this.filt = '';
    this.tagrefresh = true;
    this.changeDetectionRef.detectChanges();

    if (!this.hasFilters) {
      this.selectedCapabilityType = [];
      this.updateQueryParam(1, '', '', '');
      this.pageNumber = 1;
      this.updatePageSize();
      this.getCards(this.pageNumber, this.pageSize);
    }

    this.updateLastRefreshTime();
  }

  onTagSelected(event: any): void {
    this.selectedCapabilityType =
      event.getSelectedMlSpecTemplateCapabilityType();
    this.pageNumber = 1;
    // this.selectedTag = event.getSelectedTagList();
    this.tagrefresh = false;
    this.changeDetectionRef.detectChanges();
    this.filterSelectedCards(this.pageNumber);
  }

  onFilterStatusChange(hasActiveFilters: boolean): void {
    this.hasFilters = hasActiveFilters;
  }

  onViewDetails(card: any): void {
    this.router.navigate(['../specs/' + card.domainname], {
      relativeTo: this.route,
    });
  }

  redirectToEdit(domainname: string): void {
    this.router.navigate(['./edit/' + domainname], {
      relativeTo: this.route,
    });
  }

  delete(domainname: string): void {
    const dialogRef = this.dialog.open(AipDeleteConfirmationComponent, {
      width: '360px',
      panelClass: 'standard-dialog',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.adapterServices
          .deleteApiSpecTemplate(
            domainname,
            sessionStorage.getItem('organization')
          )
          .subscribe((resp: any) => {
            if (resp.body) {
              if (resp.body.message == 'success') {
                this.adapterServices.messageNotificaionService(
                  'success',
                  'Done!  Spec Deleted Successfully'
                );
                this.refresh();
              } else
                this.adapterServices.messageNotificaionService(
                  'warning',
                  "Spec Can't be Deleted, It's being used by adapter(s)"
                );
            } else
              this.adapterServices.messageNotificaionService('error', 'Error');
          });
      }
    });
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
      this.initializePagination();
      this.getCards(this.pageNumber, this.pageSize);
      this.updateQueryParam(
        this.pageNumber,
        this.filt,
        this.selectedCapabilityType.join(',')
      );
    }
  }

  changedToogle(event: boolean): void {
    this.cardToggled = event;
  }
}
