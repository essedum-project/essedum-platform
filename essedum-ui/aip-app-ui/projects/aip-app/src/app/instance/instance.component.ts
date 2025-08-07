import {
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
import { AdapterServices } from '../sharedModule/services/adapter-service';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { AipDeleteConfirmationComponent } from '../sharedModule/aip-delete-confirmation/aip-delete-confirmation.component';

@Component({
  selector: 'app-instance',
  templateUrl: './instance.component.html',
  styleUrls: ['./instance.component.scss'],
})
export class InstanceComponent implements OnInit, OnChanges {
  // Constants
  readonly CARD_TITLE = 'Instances';
  readonly SERVICE_V1 = 'instances';
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
  selectedAdapterList: string[] = [];

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
    public tagService: TagsService,
    private dialog: MatDialog,
    private location: Location
  ) {}

  @HostListener('window:resize')
  onResize(): void {
    this.updatePageSizeOnly();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getCards(this.pageNumber, this.pageSize);
    this.tagchange();
    this.updatePageSize();
  }

  ngOnInit(): void {
    this.updatePageSizeOnly();
    this.setupRouteParams();
    this.loadInitialData();
  }

  private setupRouteParams(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['page']) {
        this.pageNumber = Number(params['page']);
        this.filt = params['search'] || '';
        this.selectedAdapterList = params['adapterList']
          ? params['adapterList'].split(',').filter(Boolean)
          : [];
        this.selectedConnectionNamesList = params['connectionsList']
          ? params['connectionsList'].split(',').filter(Boolean)
          : [];
        this.hasFilters = this.hasActiveFilters();
      } else {
        this.pageNumber = 1;
        this.filt = '';
      }
    });
  }

  private loadInitialData(): void {
    this.tagrefresh = false;
    this.updateQueryParam(this.pageNumber, this.filt);
    this.getCards(this.pageNumber, this.pageSize);
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

    this.adapterServices.getInstances(org).subscribe({
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
    adapterList: string = '',
    connectionsList: string = '',
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
          adapterList: adapterList,
          connectionsList: connectionsList,
          org: org,
          roleId: roleId,
        },
        queryParamsHandling: 'merge',
      })
      .toString();

    this.location.replaceState(url);
  }

  private filterSelectedCards(page: number, size?: number): void {
    this.tagrefresh = false;

    if (this.hasActiveFilters()) {
      this.applyFilters();
    } else {
      this.allCardsFiltered = this.allCards;
    }

    this.cards = this.allCardsFiltered;

    if (this.filt.length >= 1) {
      this.onSearch();
    } else {
      this.filt = '';
    }

    if (page) this.pageNumber = page;

    this.updateQueryParam(
      this.pageNumber,
      this.filt,
      this.selectedAdapterList?.toString() ?? '',
      this.selectedConnectionNamesList?.toString() ?? ''
    );

    this.updatePagination();
  }

  private updatePagination(): void {
    this.noOfItems = this.cards.length;
    this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
    this.pageArr = Array(this.noOfPages)
      .fill(0)
      .map((_, i) => i);
    this.hoverStates = new Array(this.pageArr.length).fill(false);
    this.initializePagination();
  }

  private hasActiveFilters(): boolean {
    return (
      (this.selectedAdapterList && this.selectedAdapterList.length > 0) ||
      (this.selectedConnectionNamesList &&
        this.selectedConnectionNamesList.length > 0)
    );
  }

  private applyFilters(): void {
    const filtered: any[] = [];

    // Filter by adapter name
    if (this.selectedAdapterList.length > 0) {
      this.selectedAdapterList.forEach((adapter) => {
        this.allCards.forEach((card) => {
          if (
            card.adaptername === adapter &&
            !filtered.some((item) => item.name === card.name)
          ) {
            filtered.push(card);
          }
        });
      });
    }

    // Filter by connection name
    if (this.selectedConnectionNamesList.length > 0) {
      this.selectedConnectionNamesList.forEach((connection) => {
        this.allCards.forEach((card) => {
          if (
            card.connectionname === connection &&
            !filtered.some((item) => item.name === card.name)
          ) {
            filtered.push(card);
          }
        });
      });
    }

    this.allCardsFiltered = filtered;
  }

  private refresh(): void {
    this.getCards(this.pageNumber, this.pageSize);
    this.filterSelectedCards(this.pageNumber, this.pageSize);
  }

  private updateLastRefreshTime(): void {
    this.lastRefreshedTime = new Date();
  }

  private loadAuthentications(): void {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      this.createAuth = cipAuthority.includes('instance-create');
      this.editAuth = cipAuthority.includes('instance-edit');
      this.deleteAuth = cipAuthority.includes('instance-delete');
    });
  }

  private tagchange(): void {
    this.tagService.tags.forEach((element: any) => {});
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

  // getTags() {
  //   this.tags = {};
  //   this.tagsBackup = {};
  //   // this.category.push("platform")
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

  // startChain(data) {
  //   this.adapterServices
  //     .getAdapteByNameAndOrganization(data.adaptername)
  //     .subscribe((resp) => {
  //       this.chainName = resp.chainName;
  //       this.service
  //         .getStreamingServicesByName(this.chainName, resp.organization)
  //         .subscribe((response) => {
  //           this.streamItem = response;
  //           this.service
  //             .savePipelineJSON(
  //               this.streamItem.name,
  //               this.streamItem.json_content
  //             )
  //             .subscribe(
  //               (res) => {
  //                 this.service.message('Saving Pipeline Json!', 'success');
  //                 this.triggerEvent(res.path, data);
  //               },
  //               (error) => {
  //                 this.service.message('Could not save the file', 'error');
  //               }
  //             );
  //         });
  //     });
  // }

  // triggerEvent(path, data) {
  //   let body = { pipelineName: this.streamItem.name, scriptPath: path[0] };
  //   this.service
  //     .triggerPostEvent('generateScript_' + this.streamItem.type, body, '')
  //     .subscribe(
  //       (resp) => {
  //         this.service.message('Generating Script!', 'success');
  //         this.service.getEventStatus(resp).subscribe((status) => {
  //           if (status == 'COMPLETED') this.runScript(data);
  //           else {
  //             this.service.message('Script is not generated.', 'error');
  //           }
  //         });
  //       },
  //       (error) => {
  //         this.service.message('Error! Could not generate script.', 'error');
  //       }
  //     );
  // }

  // runScript(data) {
  //   let passType = '';
  //   if (
  //     this.streamItem.type != 'Binary' &&
  //     this.streamItem.type != 'NativeScript'
  //   )
  //     passType = 'DragAndDrop';
  //   else passType = this.streamItem.type;
  //   data.status = 'RUNNING';
  //   var createdon = data.createdon;
  //   var lastmodifiedon = data.lastmodifiedon;
  //   delete data.createdon;
  //   delete data.lastmodifiedon;

  //   this.adapterServices.updateInstance(data).subscribe((resp) => {
  //   });
  //   this.service
  //     .runPipeline(
  //       this.streamItem.alias ? this.streamItem.alias : this.streamItem.name,
  //       this.streamItem.name,
  //       passType,
  //       'REMOTE',
  //       data.runtimename,
  //       'generated'
  //     )
  //     .subscribe(
  //       (res) => {
  //         this.service.message('Pipeline has been Started!', 'success');
  //         var jobData = JSON.parse(res);
  //         let job_id = jobData.jobId;
  //         data.jobid = job_id.replaceAll('-', '');
  //         data.status = jobData.status;
  //         data.status = 'RUNNING';
  //         this.adapterServices.updateInstance(data).subscribe((resp) => {
  //         });
  //         data.createdon = createdon;
  //         data.lastmodifiedon = lastmodifiedon;
  //         this.service
  //           .getStreamingServicesByName(this.chainName, data.organization)
  //           .subscribe((response) => {
  //             this.newCanvas = JSON.parse(response.json_content);
  //             this.newCanvas['latest_jobid'] = job_id;
  //             response.json_content = JSON.stringify(this.newCanvas);
  //             this.service.update(response).subscribe((response) => {
  //               this.latest_job = true;
  //             });
  //           });
  //         data.createdon = createdon;
  //         data.lastmodifiedon = lastmodifiedon;
  //       },
  //       (error) => {
  //         this.service.message('Some error occured.', 'error');
  //       }
  //     );
  // }

  // stopJob(data) {
  //   this.service.stopPipeline(data.jobid).subscribe(
  //     (response) => {
  //       this.service.message('Stop App Triggered!', 'success');
  //       data.status = 'CANCELLED';
  //       var createdon = data.createdon;
  //       var lastmodifiedon = data.lastmodifiedon;
  //       delete data.createdon;
  //       delete data.lastmodifiedon;

  //       this.adapterServices.updateInstance(data).subscribe((resp) => {
  //       });
  //       data.createdon = createdon;
  //       data.lastmodifiedon = lastmodifiedon;
  //     },
  //     (error) => {
  //       this.service.message('Error!', 'error');
  //     }
  //   );
  // }

  // refreshData(): void {
  //   this.tagrefresh = true;
  //   this.updateQueryParam(1, '', '');
  //   this.selectedAdapterList = [];
  //   this.selectedConnectionNamesList = [];
  //   this.filt = '';
  //   this.pageSize = 8;
  //   this.ngOnInit();
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

    // Reset to first page when search criteria changes
    if (this.filt.length !== this.filtbackup.length) {
      this.pageNumber = 1;
      this.filtbackup = this.filt;
    }

    // Filter cards by name
    const filteredCards = this.allCardsFiltered.filter((card) =>
      card.name.toLowerCase().includes(this.filt.toLowerCase())
    );

    this.cards = filteredCards;
    this.updatePagination();
    this.updateQueryParam(this.pageNumber, this.filt);
  }

  onAdd(): void {
    this.router.navigate(['./create'], {
      queryParams: {
        page: this.pageNumber,
        search: this.filt,
        adapterList: this.selectedAdapterList.toString(),
        // adapterInstance: this.selectedAdapterInstance.toString(),
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
      this.selectedAdapterList = [];
      this.selectedConnectionNamesList = [];
      this.updateQueryParam(1, '', '', '');
      this.pageNumber = 1;
      this.updatePageSize();
    }

    this.updateLastRefreshTime();
  }

  onTagSelected(event: any): void {
    this.pageNumber = 1;
    this.selectedConnectionNamesList =
      event.getSelectedMlInstanceConnectionType();
    this.selectedAdapterList = event.getSelectedMlInstanceAdapterType();
    this.filterSelectedCards(this.pageNumber);
  }

  onFilterStatusChange(hasActiveFilters: boolean) {
    this.hasFilters = hasActiveFilters;
  }

  onViewDetails(card: any): void {
    this.router.navigate(['../instances/' + card.name], {
      queryParams: {
        page: this.pageNumber,
        search: this.filt,
        adapterList: this.selectedAdapterList.toString(),
        // adapterInstance: this.selectedAdapterInstance.toString(),
        org: sessionStorage.getItem('organization'),
        roleId: JSON.parse(sessionStorage.getItem('role')).id,
      },
      queryParamsHandling: 'merge',
      relativeTo: this.route,
    });
  }

  openedit(content: any): void {
    this.dialog.open(content, {
      width: '600px',
      panelClass: 'standard-dialog',
    });
  }

  deleteInstance(instanceName: string): void {
    const dialogRef = this.dialog.open(AipDeleteConfirmationComponent, {
      width: '360px',
      panelClass: 'standard-dialog',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.adapterServices.deleteInstance(instanceName).subscribe(
          (res) => {
            if (res) {
              if (res.message == 'success') {
                this.adapterServices.messageNotificaionService(
                  'success',
                  'Done!  Instance Deleted Successfully'
                );
              } else
                this.adapterServices.messageNotificaionService(
                  'warning',
                  "Instance Can't be Deleted"
                );
            } else
              this.adapterServices.messageNotificaionService('error', 'Error');
            this.refresh();
          },
          (error) => {
            this.service.messageService(error);
          }
        );
      }
    });
  }

  triggereRefresh(event: boolean): void {
    if (event) this.ngOnInit();
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
    if (page && page >= 1 && page <= this.noOfPages) {
      this.pageNumber = page;
    }

    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      this.pageChanged.emit(this.pageNumber);
      this.initializePagination();
      this.getCards(this.pageNumber, this.pageSize);
    }
  }

  changedToogle(event: any): void {
    this.refresh();
    this.cardToggled = event;
  }
}
