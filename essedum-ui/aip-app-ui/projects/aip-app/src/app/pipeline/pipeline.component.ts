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
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Services } from '../services/service';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { TagsService } from '../services/tags.service';
import { Location } from '@angular/common';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { PipelineCreateComponent } from './pipeline-create/pipeline-create.component';
@Component({
  selector: 'app-pipeline',
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.scss'],
})
export class PipelineComponent implements OnInit, OnChanges {
  // Constants
  readonly CARD_TITLE = 'Pipelines';
  readonly SERVICE_V1 = 'pipeline';

  // Component state
  hoverStates: boolean[] = [];
  hasFilters = false;
  loading = true;
  lastRefreshedTime: Date | null = null;
  cardToggled = true;
  tagrefresh = false;

  // Auth flags
  createAuth = false;
  editAuth = false;
  deleteAuth = false;
  deployAuth = false;

  // Data collections
  cards: any[] = [];
  filteredCards: any[] = [];
  users: string[] = [];

  // Filter state
  filt = '';
  filtbackup = '';
  selectedAdapterInstance: string[] = [];
  selectedAdapterType: string[] = [];
  selectedTag: string[] = [];

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

  selectedCard: any = [];
  selectedInstance: any;
  toggle: boolean = false;
  tags;
  allTags: any;
  catStatus = {};
  streamItem: any;
  finalDataList: any = [];
  filter: string = '';
  organization: string;
  pipelineConstantsKey: string = 'icip.pipeline.includeCore';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private changeDetectionRef: ChangeDetectorRef,
    public dialog: MatDialog,
    public tagService: TagsService,
    private location: Location
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.organization) this.refresh();
  }

  ngOnInit(): void {
    this.filteredCards = [];
    this.organization = sessionStorage.getItem('organization');

    if (this.organization) {
      this.handleRouteState();
      this.setupQueryParamHandling();
      this.getCountPipelines();
      this.getCards();
    }

    this.loadAuthentications();
    this.updateLastRefreshTime();
  }

  private handleRouteState(): void {
    if (this.router.url.includes('preview')) {
      const state = this.location.getState() as any;
      if (state?.relatedData?.data) {
        this.streamItem = state.relatedData.data;
        this.desc(this.streamItem);
      }
    }
  }

  private setupQueryParamHandling(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['page']) {
        this.pageNumber = +params['page'];
        this.filter = params['search'] || '';
        this.selectedAdapterType = params['pipelineType']
          ? params['pipelineType'].split(',')
          : [];
      } else {
        this.pageNumber = 1;
        this.pageSize = 8;
        this.filter = '';
      }
      this.updateQueryParam(this.pageNumber);
    });
  }

  private updateQueryParam(
    page: number = 1,
    search: string = '',
    pipelineType: string = '',
    org: string = this.organization,
    roleId: string = JSON.parse(sessionStorage.getItem('role') || '{}').id
  ): void {
    const url = this.router
      .createUrlTree([], {
        queryParams: {
          page,
          search,
          pipelineType,
          org,
          roleId,
        },
        queryParamsHandling: 'merge',
      })
      .toString();

    this.location.replaceState(url);
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

    console.log(
      'Pagination initialized with startIndex:',
      this.startIndex,
      'endIndex:',
      this.endIndex
    );
  }

  private loadAuthentications(): void {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      this.createAuth = cipAuthority.includes('pipeline-create');
      this.editAuth = cipAuthority.includes('pipeline-edit');
      this.deleteAuth = cipAuthority.includes('pipeline-delete');
    });
  }

  private updateLastRefreshTime(): void {
    this.lastRefreshedTime = new Date();
  }

  private getCards(): void {
    const params = this.buildHttpParams();

    this.service.getPipelinesCards(params).subscribe((res) => {
      const data: any[] = [];
      if (res.length) {
        res.forEach((element: any) => {
          data.push(element);
          this.users.push(element.alias);
        });
      }

      this.cards = data;
      this.filteredCards = data;
      this.loading = false;

      this.updateQueryParam(
        this.pageNumber,
        this.filter,
        this.selectedAdapterType.toString()
      );
    });
  }

  private buildHttpParams(): HttpParams {
    let params = new HttpParams()
      .set('page', this.pageNumber.toString())
      .set('size', this.pageSize.toString())
      .set('project', this.organization)
      .set('isCached', 'true')
      .set('adapter_instance', 'internal')
      .set('interfacetype', 'pipeline');

    if (this.selectedAdapterType.length >= 1) {
      params = params.set('type', this.selectedAdapterType.toString());
    }

    if (this.filter.length >= 1) {
      params = params.set('query', this.filter);
    }

    if (this.selectedTag.length >= 1) {
      params = params.set('tags', this.selectedTag.toString());
    }

    return params;
  }

  private refresh(): void {
    this.getCards();
    this.getCountPipelines();
  }

  private getCountPipelines(): void {
    let params = this.buildHttpParams();

    params = params.set('cloud_provider', 'internal');

    this.service.getCountPipelines(params).subscribe((res) => {
      this.noOfItems = res;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
      this.initializePagination();
    });
  }

  private desc(card: any): void {
    this.cardToggled = !this.cardToggled;
    this.selectedCard = card;
    this.service.getStreamingServicesByName(card.name).subscribe((res) => {
      this.streamItem = res;
    });
  }

  getOrganization(): void {
    this.service
      .getConstantByKey(this.pipelineConstantsKey)
      .subscribe((response) => {
        if (response.body == 'true')
          this.organization = 'Core,' + sessionStorage.getItem('organization');
        else this.organization = sessionStorage.getItem('organization');
      });
  }

  filterCards(page?: number): void {
    if (page) {
      this.pageNumber = page;
    } else {
      this.pageNumber = 1;
    }

    if (this.selectedAdapterType.length > 0) {
      this.finalDataList = [];

      for (const adapterType of this.selectedAdapterType) {
        const matchingCards = this.cards.filter((data) => {
          const isAdapterTypeIncluded = data.type?.includes(adapterType);
          const isFiltIncluded =
            !this.filt ||
            this.filt.trim() === '' ||
            data.alias.toLowerCase().includes(this.filt.toLowerCase()) ||
            data.name.toLowerCase().includes(this.filt.toLowerCase());

          return isAdapterTypeIncluded && isFiltIncluded;
        });

        this.finalDataList.push(...matchingCards);
      }

      this.filteredCards = this.finalDataList;
    } else if (this.filt && this.filt !== '') {
      this.filteredCards = this.cards.filter(
        (data) =>
          data.alias.toLowerCase().includes(this.filt.toLowerCase()) ||
          data.name.toLowerCase().includes(this.filt.toLowerCase())
      );
    } else if (!page) {
      this.onRefresh();
      return;
    }

    this.noOfItems = this.filteredCards.length;
    this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
    this.pageArr = [...Array(this.noOfPages).keys()];

    this.updateQueryParam(
      this.pageNumber,
      this.filt,
      this.selectedAdapterType.toString()
    );
  }

  // changedToogle(event: any) {
  //   this.cardToggled = event;
  //   this.streamItem = this.streamItem.reset;
  // }

  // tagchange() {
  //   this.tagService.tags.forEach((element: any) => {});
  // }

  // numSequence(n: number): Array<number> {
  //   return Array(n);
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

  get paginatedCards(): any[] {
    if (!this.cards || !this.pageSize) {
      return [];
    }

    return this.filteredCards;
  }

  get shouldShowEmptyState(): boolean {
    return !this.loading && (!this.cards || this.cards.length === 0);
  }

  get shouldShowPagination(): boolean {
    return this.filteredCards && this.filteredCards.length > 0;
  }

  trackByCardId(index: number, card: any): string | number {
    return card?.id || card?.name || index;
  }

  onSearch(searchText?: string): void {
    if (searchText !== undefined) {
      this.filt = searchText;
    }

    const search = (this.filt || '').toLowerCase().trim();

    if (!search) {
      this.filteredCards = this.cards;
    } else {
      this.filteredCards = this.cards.filter(
        (card) =>
          (card.alias || '').toLowerCase().includes(search) ||
          (card.name || '').toLowerCase().includes(search)
      );
    }
  }

  onAdd(): void {
    const dialogRef = this.dialog.open(PipelineCreateComponent, {
      height: '80%',
      width: '60%',
      minWidth: '60vw',
      disableClose: true,
      data: {
        edit: false,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refresh();
      }
    });
  }

  onRefresh(): void {
    this.tagrefresh = true;
    this.pageNumber = 1;
    this.pageSize = 8;
    this.filter = '';
    this.selectedAdapterType = [];
    this.selectedTag = [];
    this.getCountPipelines();
    this.getCards();
    this.filt = '';
    this.ngOnInit();
  }

  onTagSelected(event: any): void {
    this.selectedAdapterInstance = event.getSelectedAdapterInstance();
    this.selectedAdapterType = event.getSelectedAdapterType();
    this.pageNumber = 1;
    this.selectedTag = event.getSelectedTagList();
    this.tagrefresh = false;
    this.refresh();
  }

  onFilterStatusChange(hasActiveFilters: boolean) {
    this.hasFilters = hasActiveFilters;
  }

  redirection(card: any): void {
    this.service.getStreamingServicesByName(card.name).subscribe((res) => {
      this.streamItem = res;
      const navigationExtras: NavigationExtras = {
        queryParams: {
          page: this.pageNumber,
          search: this.filter,
          pipelineType: this.selectedAdapterType.toString(),
          org: this.organization,
          roleId: JSON.parse(sessionStorage.getItem('role')).id,
        },
        queryParamsHandling: 'merge',
        state: {
          cardTitle: 'Pipeline',
          pipelineAlias: this.streamItem.alias,
          streamItem: this.streamItem,
          card: card,
        },
        relativeTo: this.route,
      };
      if (this.streamItem.type === 'NativeScript') {
        this.router.navigate(['./view' + '/' + card.name], navigationExtras);
      }
    });
  }

  // redirect(): void {
  //   this.selectedInstance = this.selectedCard.name;
  //   this.router.navigate(['./view', this.CARD_TITLE, this.selectedInstance], {
  //     relativeTo: this.route,
  //   });
  // }

  editPipeline(id: string): void {
    this.service.getStreamingServices(id).subscribe(
      (pageResponse) => {
        const dialogRef = this.dialog.open(PipelineCreateComponent, {
          height: '80%',
          width: '60%',
          minWidth: '60vw',
          disableClose: true,
          data: {
            canvasData: pageResponse,
            edit: true,
          },
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.refresh();
          }
        });
      },
      (error) =>
        this.service.message('Could not get the results', 'error')
    );
  }

  deletePipeline(cid: string): void {
    try {
      const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'delete') {
          this.service.deletePipeline(cid).subscribe((res) => {
            this.service.message('Pipeline deleted!', 'success');
            this.onRefresh();
          });
        }
      });
    } catch (Exception) {
      this.service.message('Some error occured', 'error');
    }
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
