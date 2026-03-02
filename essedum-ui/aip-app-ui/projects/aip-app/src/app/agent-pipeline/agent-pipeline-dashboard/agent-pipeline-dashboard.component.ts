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
import { Services } from '../../services/service';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { TagsService } from '../../services/tags.service';
import { Location } from '@angular/common';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { PipelineCreateComponent } from '../../pipeline/pipeline-create/pipeline-create.component';

@Component({
  selector: 'app-agent-pipeline-dashboard',
  templateUrl: './agent-pipeline-dashboard.component.html',
  styleUrls: ['./agent-pipeline-dashboard.component.scss'],
})
export class AgentPipelineDashboardComponent implements OnInit, OnChanges {
  // Constants
  get CARD_TITLE() {
    return this.pipelineMode === 'mcp' ? 'MCP Pipelines' : 'Agent Pipelines';
  }
  readonly SERVICE_V1 = 'pipelineagent';

  // Pipeline Mode Support
  pipelineMode: 'agent' | 'mcp' = 'agent';

  // Component state
  hoverStates: boolean[] = [];
  hasFilters = false;
  loading = true;
  lastRefreshedTime: Date | null = null;
  cardToggled = true;
  tagrefresh = false;

  // Auth flags
  createAuth = false;
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
  selectedPipelineAgentType: string[] = [];
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
        this.selectedPipelineAgentType = params['pipelineType']
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
  }

  private loadAuthentications(): void {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
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
        this.selectedPipelineAgentType.toString()
      );
    });
  }

  private buildHttpParams(): HttpParams {
    const apiParams = this.getApiParametersForMode();
    
    let params = new HttpParams()
      .set('page', this.pageNumber.toString())
      .set('size', this.pageSize.toString())
      .set('project', this.organization)
      .set('isCached', 'true')
      .set('adapter_instance', 'internal')    
      .set('interfacetype', apiParams.interfacetype);

    // Add type parameter for MCP mode
    if (apiParams.type) {
      params = params.set('type', apiParams.type);
    }
    // For agent mode, add existing type filter if selected
    else if (this.selectedPipelineAgentType.length >= 1) {
      params = params.set('type', this.selectedPipelineAgentType.toString());
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

    if (this.selectedPipelineAgentType.length > 0) {
      this.finalDataList = [];

      for (const adapterType of this.selectedPipelineAgentType) {
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
      this.selectedPipelineAgentType.toString()
    );
  }

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


  onRefresh(): void {
    this.tagrefresh = true;
    this.pageNumber = 1;
    this.pageSize = 8;
    this.filter = '';
    this.selectedPipelineAgentType = [];
    this.selectedTag = [];
    this.getCountPipelines();
    this.getCards();
    this.filt = '';
    this.ngOnInit();
  }

  onAdd(): void {
    if (this.pipelineMode === 'mcp') {
      
      // Open the pipeline creation dialog with MCP-specific parameters
      const dialogRef = this.dialog.open(PipelineCreateComponent, {
        width: '600px',
        height: '500px',
        disableClose: true,
        data: {
          interfacetype: 'mcp-pipeline', // MCP-specific interface type
          type: 'mcpServer', // MCP-specific type
          mode: 'create'
        }
      });
      
      // Handle dialog result
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.service.message('MCP Pipelines created successfully!', 'success');
          // Refresh the cards to show the new MCP pipeline
          this.refresh();
        }
      });
    } else {
      
      // Open the pipeline creation dialog with Agent-specific parameters
      const dialogRef = this.dialog.open(PipelineCreateComponent, {
        width: '600px',
        height: '500px',
        disableClose: true,
        data: {
          interfacetype: 'pipeline-agent', // Agent-specific interface type
          type: 'AIAgent', // Agent-specific type
          mode: 'create'
        }
      });
      
      // Handle dialog result
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.service.message('Agent Pipelines created successfully!', 'success');
          // Refresh the cards to show the new agent pipeline
          this.refresh();
        }
      });
    }
  }

  onTagSelected(event: any): void {
    this.selectedAdapterInstance = event.getSelectedAdapterInstance();
    
    // Only update pipeline agent type for agent mode, not for MCP mode
    if (this.pipelineMode !== 'mcp') {
      this.selectedPipelineAgentType = event.getSelectedAdapterType();
    }
    
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
          pipelineType: this.selectedPipelineAgentType.toString(),
          org: this.organization,
          roleId: JSON.parse(sessionStorage.getItem('role')).id,
        },
        queryParamsHandling: 'merge',
        state: {
          cardTitle: this.pipelineMode === 'mcp' ? 'MCP Pipelines' : 'Pipeline Agent',
          pipelineAlias: this.streamItem.alias,
          streamItem: this.streamItem,
          card: card,
          pipelineMode: this.pipelineMode // Pass the current mode to detail view
        },
        relativeTo: this.route,
      };
      
      // Navigate for both Agent and MCP pipeline types
      if (this.streamItem.type === 'AIAgent' || 
          this.streamItem.type === 'mcpServer' || 
          this.streamItem.type === 'NativeScript' ||
          this.pipelineMode === 'mcp' ||
          (this.pipelineMode === 'agent' && this.streamItem.interfacetype === 'pipeline-agent')) {
        this.router.navigate(['./view' + '/' + card.name], navigationExtras);
      } else {
      }
    });
  }

  deletePipeline(cid: string): void {
    try {
      const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'delete') {
          this.service.deletePipeline(cid).subscribe((res) => {
            this.service.message('Pipeline agent deleted!', 'success');
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

  /**
   * Handle pipeline mode change between Agent and MCP pipelines
   */
  onPipelineModeChange(event: any): void {
    const newMode = event.value;
    
    // Reset pagination when switching modes
    this.pageNumber = 1;
    
    // Clear current data and reload with new mode
    this.cards = [];
    this.filteredCards = [];
    this.loading = true;
    
    // Refresh data with new mode
    this.refresh();
  }

  /**
   * Switch to specific pipeline mode - simplified method
   */
  switchToPipelineMode(mode: 'agent' | 'mcp'): void {
    
    if (this.pipelineMode !== mode) {
      this.pipelineMode = mode;
      
      // Reset pagination when switching modes
      this.pageNumber = 1;
      
      // Clear current data and reload with new mode
      this.cards = [];
      this.filteredCards = [];
      this.loading = true;
      
      // Show loading message
      
      // Refresh data with new mode
      this.refresh();
    } else {
    }
  }

  /**
   * Get API parameters based on current pipeline mode
   */
  private getApiParametersForMode(): { type?: string; interfacetype: string } {
    if (this.pipelineMode === 'mcp') {
      return {
        type: 'mcpServer',
        interfacetype: 'mcp-pipeline'
      };
    } else {
      return {
        interfacetype: 'pipeline-agent'
      };
    }
  }


}