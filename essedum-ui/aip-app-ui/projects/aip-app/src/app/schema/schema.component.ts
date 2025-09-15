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
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Services } from '../services/service';
import { TagsService } from '../services/tags.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { Location } from '@angular/common';
import { AipDeleteConfirmationComponent } from '../sharedModule/aip-delete-confirmation/aip-delete-confirmation.component';

@Component({
  selector: 'app-schema',
  templateUrl: './schema.component.html',
  styleUrls: ['./schema.component.scss'],
})
export class SchemaComponent implements OnInit, OnChanges {
  // Constants
  readonly CARD_TITLE = 'Schemas';
  readonly SERVICE_V1 = 'schemas';

  // Component state
  hoverStates: boolean[] = [];
  hasFilters: boolean = false;
  loading: boolean = true;
  lastRefreshedTime: Date | null = null;
  tagrefresh: boolean = false;

  // Auth flags
  createAuth: boolean = true;
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
  dropDown: any;
  selectedInstance: string | null = null;
  selectedCard: any | null = null;

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
    private changeDetectionRef: ChangeDetectorRef,
    public tagService: TagsService,
    private dialog: MatDialog,
    private location: Location
  ) {}

  @HostListener('window:resize')
  onResize(): void {
    this.updatePageSize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getCards(this.pageNumber, this.pageSize, this.filt);
    this.updatePageSize();
  }

  ngOnInit(): void {
    this.updatePageSize();
    this.service.getConstantByKey('icip.schema.system').subscribe((res) => {
      this.createDropdown(JSON.parse(res.body));
    });
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['page']) {
        this.pageNumber = parseInt(params['page']);
        this.filt = params['search'];
      } else {
        this.pageNumber = 1;
        this.filt = '';
      }
    });
    this.updateQueryParam(this.pageNumber);
    this.getCards(this.pageNumber, this.pageSize, this.filt);

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

    this.getCards(this.pageNumber, this.pageSize, this.filt);
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

  private loadAuthentication(): void {
    this.service.getPermission('cip').subscribe((cipAuthority: string[]) => {
      if (cipAuthority.includes('schema-create')) this.createAuth = true;
      this.editAuth = cipAuthority.includes('schema-edit');
      this.deleteAuth = cipAuthority.includes('schema-delete');
    });
  }

  private getCards(page: any, size: any, filter: any): void {
    if (!size) return;

    this.loading = true;
    let params: HttpParams = new HttpParams();
    if (filter?.length > 0) {
      params = params.set('filter', filter);
    }
    params = params.set('orderBy', 'abc');
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.getSchemasCards(params).subscribe((res) => {
      this.users = [];
      this.cards = res;

      // Extract aliases to users array
      res.forEach((element) => {
        if (element.alias) {
          this.users.push(element.alias);
        }
      });

      this.noOfItems = res.length;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = Array.from({ length: this.noOfPages }, (_, i) => i);
      this.initializePagination();
      this.loading = false;
    });
    this.updateQueryParam(this.pageNumber, this.filt);
  }

  private updateQueryParam(
    page: number = 1,
    search: string = '',
    org: string = sessionStorage.getItem('organization') || '',
    roleId: string = JSON.parse(sessionStorage.getItem('role') || '{}')?.id ||
      ''
  ): void {
    const queryParams = { page, search, org, roleId };
    const url = this.router
      .createUrlTree([], {
        queryParams,
        queryParamsHandling: 'merge',
      })
      .toString();

    this.location.replaceState(url);
  }

  private createDropdown(data: any[]): void {
    let capabilitiesMap: Map<string, any> = new Map<string, any>();
    let types = [];
    data.forEach((element) => {
      if (element != null && typeof element === 'object')
        Object.keys(element).forEach((key) => {
          types.push({ value: key, viewValue: key });
          let capabilityList: any = [];
          let def: any = '';
          let isdef = false;
          element[key].forEach((ele) => {
            Object.entries(ele).forEach(([key1, value1]) => {
              if (key1 == 'Capability' && value1 != null && value1 != '')
                capabilityList.push({ value: value1, viewValue: value1 });
              if (!isdef && key1 != 'default') def = value1;
              // console.log('this is default value', def);
              if (key1 == 'default' && !isdef) isdef = value1 as boolean;
            });
          });
          let temp: any = {
            default: def,
            value: capabilityList,
          };
          capabilitiesMap.set(key, temp);
        });
    });
    let drop: any = {
      types: types,
      capabilities: capabilitiesMap,
    };
    this.dropDown = drop;

    // console.log('this is dropDown', this.dropDown);
  }

  private updateLastRefreshTime(): void {
    this.lastRefreshedTime = new Date();
  }

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
    this.pageNumber = 1;
    this.getCards(this.pageNumber, this.pageSize, this.filt);
  }

  createSchema(dropDown: any): void {
    const navigationExtras: NavigationExtras = {
      state: {
        drop: dropDown,
      },
      relativeTo: this.route,
    };
    this.router.navigate(['./create'], navigationExtras);
  }

  onRefresh(): void {
    this.filt = '';
    this.pageNumber = 1;
    this.updateQueryParam(this.pageNumber, this.filt);
    this.onChangePage(this.pageNumber);
    this.updateLastRefreshTime();
  }

  details(card: any, type: string, dropDown: any): void {
    const navigationExtras: NavigationExtras = {
      state: {
        card: card,
        drop: dropDown,
      },
      relativeTo: this.route,
    };
    this.router.navigate(['./' + type], navigationExtras);
  }

  deleteSchema(card: any): void {
    const dialogRef = this.dialog.open(AipDeleteConfirmationComponent, {
      width: '360px',
      panelClass: 'standard-dialog',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.service.deleteSchema(card.name).subscribe(
          (res) => {
            this.getCards(this.pageNumber, this.pageSize, this.filt);
            this.service.message('Schema Deleted Successfully', 'success');
          },
          (error) => {
            this.service.message('Error in Deleting Schema' + error, 'error');
          }
        );
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
    if (page !== undefined && page >= 1 && page <= this.noOfPages) {
      this.pageNumber = page;
    }

    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      this.pageChanged.emit(this.pageNumber);
      this.getCards(this.pageNumber, this.pageSize, this.filt);
    }
  }
}
