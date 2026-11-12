import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  OnChanges,
  OnInit,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Services } from '@essedum/shared-lib';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TagsService } from '@essedum/shared-lib';
import { Location } from '@angular/common';
import { GitHubService } from '../../sharedModule/services/github.service';
import { ConfirmDeleteDialogComponent } from '@essedum/shared-lib';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, map, takeUntil, timeout } from 'rxjs/operators';
import { PipelineCreateComponent } from '../../pipeline/pipeline-create/pipeline-create.component';
import { DataPipelineWizardLocalComponent } from '../wizard/data-pipeline-wizard/data-pipeline-wizard.component';
import { TrainingPipelineWizardLocalComponent } from '../wizard/training-pipeline-wizard/training-pipeline-wizard.component';

@Component({
    selector: 'app-agent-pipeline-dashboard',
    templateUrl: './agent-pipeline-dashboard.component.html',
    styleUrls: ['./agent-pipeline-dashboard.component.scss'],
    standalone: false
})
export class AgentPipelineDashboardComponent implements OnInit, OnChanges, OnDestroy {
  private readonly AGENT_DESIGNER_API = '/mfe/agent-designer/api/v1';
  private readonly AGENT_DESIGNER_TIMEOUT = 5000; // 5 seconds timeout for agent-designer API
  private agentDesignerCids = new Set<string>();
  private destroy$ = new Subject<void>();

  // Constants
  get CARD_TITLE() {
    if (this.pipelineMode === 'mcp') {
      return 'MCP Pipelines';
    } else if (this.pipelineMode === 'app') {
      return 'App Pipelines';
    } else if (this.pipelineMode === 'pipeline') {
      return 'Native Pipelines';
    } else if (this.pipelineMode === 'data') {
      return 'Data Pipelines';
    } else if (this.pipelineMode === 'training') {
      return 'Training Pipelines';
    } else {
      return 'Agent Pipelines';
    }
  }
  readonly SERVICE_V1 = 'pipelineagent';

  // Pipeline Mode Support
  pipelineMode: 'agent' | 'mcp' | 'app' | 'pipeline' | 'data' | 'training' = 'agent';

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
  projectName: string;  // Actual project name from sessionStorage for API calls
  pipelineConstantsKey: string = 'icip.pipeline.includeCore';

  // GitHub auth state
  isGitAuthenticated = false;
  gitUsername = '';
  isGitLoading = false;
  showGitDropdown = false;

  // Approval flow (AI Client = rank 0)
  private readonly RBAC_BASE = '/api/usm';
  userRank = 0;
  currentUserId = 0;
  private currentUserLogin = '';
  private currentProjectId: number | null = null;
  /** asset.name values of approved (project/org-scoped) pipeline assets visible to this user */
  approvedNames = new Set<string>();
  /** asset.name values of pipelines this user has submitted for approval (draft/in_review) */
  myDraftNames = new Set<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private changeDetectionRef: ChangeDetectorRef,
    public dialog: MatDialog,
    public tagService: TagsService,
    private location: Location,
    private githubService: GitHubService,
    private http: HttpClient
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.organization) this.refresh();
  }

  ngOnInit(): void {
    this.filteredCards = [];
    this.organization = sessionStorage.getItem('organization');

    // Get the actual project name from sessionStorage for API calls
    try {
      const projectObj = JSON.parse(sessionStorage.getItem('project') || '{}');
      this.projectName = projectObj?.name || this.organization;
    } catch {
      this.projectName = this.organization;
    }

    const cachedGitUser = sessionStorage.getItem('git_username');
    if (cachedGitUser) {
      this.gitUsername = cachedGitUser;
      this.isGitAuthenticated = true;
    }

    if (this.organization) {
      this.handleRouteState();
      this.setupQueryParamHandling();
      this.getCards();
    }

    this.loadAuthentications();
    this.updateLastRefreshTime();
    this.resolveUserContext();    
  }

  /**
   * Remove all GitHub-related data cached in this browser session
   * (username, session id, and any previously selected repo/branch).
   */
  private clearGitSessionData(): void {
    this.githubService.clearClientGitSession();
  }

  toggleGitDropdown(event: Event): void {
    event.stopPropagation();
    this.showGitDropdown = !this.showGitDropdown;
  }

  @HostListener('document:click')
  closeGitDropdown(): void {
    this.showGitDropdown = false;
  }

  gitLogin(): void {
    this.isGitLoading = true;
    this.githubService.initiateOAuthFlow().subscribe({
      next: (status) => {
        this.isGitLoading = false;
        this.isGitAuthenticated = true;
        this.githubService.cacheClientAuth(status);
        this.gitUsername = status.githubUsername || status.username || '';
        this.service.message('Git login success', 'success');
        this.changeDetectionRef.detectChanges();
      },
      error: () => {
        this.isGitLoading = false;
        this.changeDetectionRef.detectChanges();
      }
    });
  }

  gitLogout(): void {
    this.showGitDropdown = false;
    this.isGitLoading = true;
    this.githubService.logout().subscribe({
      next: () => {
        this.isGitAuthenticated = false;
        this.gitUsername = '';
        this.isGitLoading = false;
        this.clearGitSessionData();
        this.service.message('Logout successful', 'success');
        this.changeDetectionRef.detectChanges();
      },
      error: () => {
        this.isGitLoading = false;
        this.changeDetectionRef.detectChanges();
      }
    });
  }

  private handleRouteState(): void {
    const state = this.location.getState() as any;

    if (state?.pipelineMode && ['agent', 'mcp', 'app'].includes(state.pipelineMode)) {
      this.pipelineMode = state.pipelineMode;
    }

    if (this.router.url.includes('preview')) {
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
      this.createAuth = cipAuthority.includes('pipeline-create');
    });
  }

  private updateLastRefreshTime(): void {
    this.lastRefreshedTime = new Date();
  }

  private getCards(): void {
    try {
      // Fetch all visible items at once; pagination is handled client-side so the
      // page count is derived from actual visible items, not the total DB count.
      const params = this.buildHttpParams().set('page', '1').set('size', '500');
      const httpOptions = this.buildHttpOptions();

      // Agent Designer API called once per fetch (always on the first server page)
      const agentDesigner$ = (this.pipelineMode === 'agent')
        ? this.http.get<any>(`${this.AGENT_DESIGNER_API}/pipelines?limit=200`).pipe(
            timeout(this.AGENT_DESIGNER_TIMEOUT),
            map((response: any) => {
              // Ensure response has items array
              if (response && Array.isArray(response.items)) {
                return response;
              }
              if (Array.isArray(response)) {
                return { items: response };
              }
              return { items: [] };
            }),
            catchError((error) => {
              console.warn('[AgentPipelineDashboard] Agent Designer API unavailable:', error?.message || error);
              return of({ items: [] });
            })
          )
        : of({ items: [] });

      forkJoin({
        java: this.service.getPipelinesCards(params, httpOptions).pipe(
          catchError((error) => {
            console.error('[AgentPipelineDashboard] Error fetching Java pipelines:', error?.message || error);
            return of([]);
          })
        ),
        agentDesigner: agentDesigner$
      }).pipe(
        takeUntil(this.destroy$),
        timeout(10000) // Overall timeout for forkJoin
      ).subscribe(
        ({ java, agentDesigner }) => {
          this.processCards(java, agentDesigner);
        },
        (error) => {
          console.error('[AgentPipelineDashboard] Error loading cards:', error?.message || error);
          this.cards = [];
          this.filteredCards = [];
          this.loading = false;
        }
      );
    } catch (error) {
      console.error('[AgentPipelineDashboard] Exception in getCards:', error);
      this.cards = [];
      this.filteredCards = [];
      this.loading = false;
    }
  }

  private processCards(java: any[], agentDesigner: any): void {
    try {
      const data: any[] = [];
      this.agentDesignerCids.clear();
      this.users = []; // Reset users array

      // Safely process agent-designer pipelines
      if (agentDesigner?.items && Array.isArray(agentDesigner.items) && agentDesigner.items.length > 0) {
        const sorted = [...agentDesigner.items]
          .filter((pipeline: any) => pipeline?.id && pipeline?.name && pipeline?.created_at) // Defensive filter
          .sort((a: any, b: any) => {
            try {
              const timeA = new Date(b.created_at).getTime();
              const timeB = new Date(a.created_at).getTime();
              return timeA - timeB;
            } catch {
              return 0; // If date parsing fails, maintain original order
            }
          });

        sorted.forEach((pipeline: any) => {
          try {
            const card = {
              alias: pipeline.name || 'Unknown',
              name: pipeline.cname || pipeline.name || 'Unknown',
              cid: pipeline.id,
              type: 'AIAgent',
              interfacetype: 'pipeline-agent',
              description: pipeline.description || '',
              status: pipeline.status || 'active',
              isAgentDesigner: true,
              flowId: pipeline.flow_id || null,
              createdDate: pipeline.created_at,
              target: { created_by: 'Agent Designer' },
            };
            data.push(card);
            this.agentDesignerCids.add(pipeline.id);
            if (pipeline.name) {
              this.users.push(pipeline.name);
            }
          } catch (err) {
            console.warn('[AgentPipelineDashboard] Error processing agent-designer pipeline:', err);
          }
        });
      }

      // Safely process Java pipelines
      if (java && Array.isArray(java) && java.length > 0) {
        java.forEach((element: any) => {
          try {
            data.push(element);
            if (element?.alias) {
              this.users.push(element.alias);
            }
          } catch (err) {
            console.warn('[AgentPipelineDashboard] Error processing Java pipeline:', err);
          }
        });
      }

      this.cards = data;
      this.filteredCards = data;
      this.loading = false;

      // Derive correct page count from actual visible items (client-side pagination)
      this.noOfItems = data.length;
      this.noOfPages = Math.ceil(Math.max(1, this.noOfItems) / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
      // Clamp current page in case it exceeds the new page count
      if (this.pageNumber > this.noOfPages) {
        this.pageNumber = 1;
      }
      this.initializePagination();

      this.updateQueryParam(
        this.pageNumber,
        this.filter,
        this.selectedPipelineAgentType.toString()
      );
    } catch (error) {
      console.error('[AgentPipelineDashboard] Error in processCards:', error);
      this.cards = [];
      this.filteredCards = [];
      this.loading = false;
    }
  }

  private buildHttpParams(): HttpParams {
    const apiParams = this.getApiParametersForMode();
    
    // Use the correct project name (not organization name) for API calls
    // Organization and project are kept separate: organization is for org-level APIs,
    // projectName is for project-level APIs to match the approval workflow expectations
    let params = new HttpParams()
      .set('page', this.pageNumber.toString())
      .set('size', this.pageSize.toString())
      .set('project', this.projectName || this.organization)  // Use projectName if available, fallback to organization
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
  }

  /** Build HTTP options with user context headers for approval workflow filtering (Java backend only) */
  private buildHttpOptions(): any {
    try {
      let headers = new HttpHeaders();
      let hasHeaders = false;

      if (this.currentUserLogin) {
        headers = headers.set('user-login', this.currentUserLogin);
        hasHeaders = true;
      }
      if (this.currentProjectId !== null && this.currentProjectId !== undefined) {
        headers = headers.set('project', String(this.currentProjectId));
        hasHeaders = true;
      }
      if (this.organization) {
        headers = headers.set('organisation', this.organization);
        hasHeaders = true;
      }
      if (this.userRank >= 0) {
        headers = headers.set('roleId', String(this.userRank));
        hasHeaders = true;
      }

      return hasHeaders ? { headers } : {}; // Return empty object instead of undefined for consistency
    } catch (error) {
      console.warn('[AgentPipelineDashboard] Error building HTTP options:', error);
      return {};
    }
  }

  /** Cleanup subscriptions on component destroy */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getCountPipelines(): void {
    try {
      let params = this.buildHttpParams();
      params = params.set('cloud_provider', 'internal');
      
      const httpOptions = this.buildHttpOptions();
      this.service.getCountPipelines(params, httpOptions).pipe(
        timeout(10000),
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('[AgentPipelineDashboard] Error getting pipeline count:', error?.message || error);
          return of(0);
        })
      ).subscribe((res) => {
        const count = res || 0;
        this.noOfItems = count;
        this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
        this.pageArr = [...Array(Math.max(1, this.noOfPages)).keys()];
        this.initializePagination();
      });
    } catch (error) {
      console.error('[AgentPipelineDashboard] Exception in getCountPipelines:', error);
      this.noOfItems = 0;
      this.noOfPages = 1;
      this.pageArr = [0];
    }
  }

  private desc(card: any): void {
    this.cardToggled = !this.cardToggled;
    this.selectedCard = card;
    const descOrg = (card as any).organization || this.organization;
    this.service.getStreamingServicesByName(card.name, descOrg).subscribe((res) => {
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
    if (!this.filteredCards || !this.pageSize) {
      return [];
    }
    const start = (this.pageNumber - 1) * this.pageSize;
    return this.filteredCards.slice(start, start + this.pageSize);
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
    if (this.pipelineMode === 'data') {
      // Open local Data Pipeline Wizard dialog
      const dialogRef = this.dialog.open(DataPipelineWizardLocalComponent, {
        width: '900px',
        maxWidth: '94vw',
        disableClose: true,
        panelClass: 'wizard-dialog',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result?.pipeline) {
          const pipelineName = result.pipeline.name;
          this.router.navigate(['/landing/integration/pipelines/view-wizard/' + pipelineName], {
            queryParamsHandling: 'merge',
            state: { card: result.pipeline, pipelineMode: 'data' }
          });
        }
      });
      return;
    }
    
    if (this.pipelineMode === 'training') {
      // Open local Training Pipeline Wizard dialog
      const dialogRef = this.dialog.open(TrainingPipelineWizardLocalComponent, {
        width: '900px',
        maxWidth: '94vw',
        disableClose: true,
        panelClass: 'wizard-dialog',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result?.pipeline) {
          const pipelineName = result.pipeline.name;
          this.router.navigate(['/landing/integration/training-pipelines/view-wizard/' + pipelineName], {
            queryParamsHandling: 'merge',
            state: { card: result.pipeline, pipelineMode: 'training' }
          });
        }
      });
      return;
    }

    const modeConfig = this.getCreateDialogConfig();
    
    const dialogRef = this.dialog.open(PipelineCreateComponent, {
      width: '460px',
      maxWidth: '92vw',
      disableClose: true,
      data: modeConfig.data
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.message(modeConfig.successMessage, 'success');
        this.refresh();
      }
    });
  }

  private getCreateDialogConfig(): { data: any; successMessage: string } {
    switch (this.pipelineMode) {
      case 'mcp':
        return {
          data: { interfacetype: 'mcp-pipeline', type: 'mcpServer', mode: 'create' },
          successMessage: 'MCP Pipeline created successfully!'
        };
      case 'app':
        return {
          data: { interfacetype: 'app-pipeline', type: 'appPipeline', mode: 'create' },
          successMessage: 'App Pipeline created successfully!'
        };
      case 'pipeline':
        return {
          data: { interfacetype: 'pipeline', type: 'NativeScript', mode: 'create' },
          successMessage: 'Pipeline created successfully!'
        };
      default:
        return {
          data: { interfacetype: 'pipeline-agent', type: 'AIAgent', mode: 'create' },
          successMessage: 'Agent Pipeline created successfully!'
        };
    }
  }

  onTagSelected(event: any): void {
    this.selectedAdapterInstance = event.getSelectedAdapterInstance();
    
    // Only update pipeline agent type for agent mode, not for other modes
    if (this.pipelineMode === 'agent') {
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
    if (card.isAgentDesigner) {
      try {
        sessionStorage.setItem('agentDesignerNavigationCard', JSON.stringify({ card }));
      } catch { /* ignore */ }
      this.router.navigate(['./view/' + card.name], {
        queryParamsHandling: 'merge',
        state: {
          card,
          pipelineMode: this.pipelineMode
        },
        relativeTo: this.route
      });
      return;
    }
    // Use the actual organization stored with this pipeline (from list API).
    // New pipelines use project name; old ones use org name — card.organization tells us which.
    const cardOrg = (card as any).organization || this.organization;
    this.service.getStreamingServicesByName(card.name, cardOrg).subscribe((res) => {
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
          cardTitle: this.CARD_TITLE,
          pipelineAlias: this.streamItem.alias,
          streamItem: this.streamItem,
          card: card,
          pipelineMode: this.pipelineMode
        },
        relativeTo: this.route,
      };
      
      // For pipeline/data/training modes, navigate to integration hub views
      if (this.pipelineMode === 'pipeline' || this.pipelineMode === 'data' || this.pipelineMode === 'training') {
        const isWizard = this.streamItem.type === 'DataPipeline' || this.streamItem.type === 'TrainingPipeline';
        if (isWizard) {
          // Navigate to integration hub wizard editor
          const basePath = this.streamItem.type === 'TrainingPipeline' 
            ? '/landing/integration/training-pipelines/view-wizard/' 
            : '/landing/integration/pipelines/view-wizard/';
          this.router.navigate([basePath + card.name], {
            queryParams: navigationExtras.queryParams,
            queryParamsHandling: 'merge',
            state: navigationExtras.state
          });
        } else {
          // Navigate to integration hub native script view
          this.router.navigate(['/landing/integration/pipelines/view/' + card.name], {
            queryParams: navigationExtras.queryParams,
            queryParamsHandling: 'merge',
            state: navigationExtras.state
          });
        }
      }
      // For agent, MCP, and app pipeline types - use existing logic
      else if (this.streamItem.type === 'AIAgent' || 
          this.streamItem.type === 'mcpServer' || 
          this.streamItem.type === 'appPipeline' ||
          this.streamItem.type === 'NativeScript' ||
          this.pipelineMode === 'mcp' ||
          this.pipelineMode === 'app' ||
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
          if (this.agentDesignerCids.has(cid)) {
            this.http.delete(`${this.AGENT_DESIGNER_API}/pipelines/${cid}`).subscribe({
              next: () => {
                this.service.message('Agent Designer Pipeline deleted successfully!', 'success');
                this.onRefresh();
              },
              error: () => {
                this.service.message('Error deleting Agent Designer Pipeline', 'error');
              }
            });
          } else {
            this.service.deletePipeline(cid).subscribe((res) => {
              this.service.message('Pipeline deleted successfully!', 'success');
              this.onRefresh();
            });
          }
        }
      });
    } catch (Exception) {
      this.service.message('Some error occured', 'error');
    }
  }

  openExecutionDialog(): void {
    this.router.navigate(['pipeline-in-execution'], { relativeTo: this.route });
  }

  navigateToExecution(status: string): void {
    this.router.navigate(['pipeline-in-execution'], {
      relativeTo: this.route,
      queryParams: status && status !== 'all' ? { status } : {},
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
      this.initializePagination();
      // No backend re-fetch — all visible items are already in memory (client-side pagination)
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
  switchToPipelineMode(mode: 'agent' | 'mcp' | 'app' | 'pipeline' | 'data' | 'training'): void {
    
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

  // ── Approval flow ────────────────────────────────────────────────────────────

  /** Reads userId, role rank, login, and RBAC projectId from sessionStorage. */
  private resolveUserContext(): void {
    try {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      this.currentUserId = Number(user.id) || 0;

      // Backend stores created_by as the email prefix (before @).
      // Normalise currentUserLogin to that same prefix so comparisons match
      // regardless of whether user_login is "anushka.mishra" or "anushka.mishra@infosys.com".
      const rawLogin = (user.user_login || user.username || user.name || '').toLowerCase();
      const email = (user.user_email || rawLogin).toLowerCase();
      const emailPrefix = email.includes('@') ? email.split('@')[0] : email;
      const resolvedLogin = rawLogin.includes('@') ? rawLogin.split('@')[0] : (rawLogin || emailPrefix);
      this.currentUserLogin = resolvedLogin;

      // Rank: role.rank is the definitive source; fall back to _rbac_role_rank_map
      // then to role.id if the shell didn't embed rank in the stored role object.
      const role = JSON.parse(sessionStorage.getItem('role') || '{}');
      let rank: number | null = null;
      if (role.rank != null && !isNaN(Number(role.rank))) {
        rank = Number(role.rank);
      } else {
        // Try the rank map the shell builds from the RBAC API
        try {
          const mapStr = sessionStorage.getItem('_rbac_role_rank_map');
          if (mapStr && role.name) {
            const entries: [string, number][] = JSON.parse(mapStr);
            const mapRank = new Map(entries).get(role.name.toLowerCase());
            if (mapRank != null) rank = Number(mapRank);
          }
        } catch {}
      }
      this.userRank = rank ?? 0;

      console.debug('[Pipeline] User context:', {
        currentUserLogin: this.currentUserLogin,
        userRank: this.userRank,
        currentUserId: this.currentUserId,
      });
    } catch (e) {
      console.error('Error resolving user context:', e);
    }

    // For all ranks: read numeric project ID from sessionStorage so the backend
    // visibility filter runs correctly (requires the "project" header as a numeric ID).
    try {
      const projObj = JSON.parse(sessionStorage.getItem('project') || '{}');
      if (projObj?.id) {
        this.currentProjectId = Number(projObj.id);
      }
    } catch {}

    if (this.userRank === 0 && this.currentUserId) {
      // Load catalog/drafts immediately (don't wait for project lookup).
      this.loadApprovalStatus();
      // Fallback project lookup for rank-0 when sessionStorage lacks the numeric id.
      if (!this.currentProjectId) {
        this.http.get<any[]>('/api/projects', { params: { size: '1000' } })
          .pipe(catchError(() => of([])))
          .subscribe(projects => {
            const orgName = sessionStorage.getItem('organization') ?? '';
            const match = projects.find((p: any) => p.name === orgName);
            this.currentProjectId = match?.id ?? null;
          });
      }
    }
  }

  /** Fetches catalog (approved) and all assets (my drafts) to populate approval sets. */
  private loadApprovalStatus(): void {
    if (!this.currentUserId) return;

    this.http.get<any[]>(`${this.RBAC_BASE}/assets/catalog`, { params: { userId: this.currentUserId } })
      .pipe(catchError(() => of([])))
      .subscribe(assets => {
        this.approvedNames.clear();
        assets.filter(a => a.assetType === 'pipeline').forEach(a => {
          if (a.name) this.approvedNames.add(a.name);
        });
      });

    this.http.get<any[]>(`${this.RBAC_BASE}/assets`, { params: { userId: this.currentUserId } })
      .pipe(catchError(() => of([])))
      .subscribe(assets => {
        this.myDraftNames.clear();
        assets.filter(a => a.assetType === 'pipeline' && a.createdBy === this.currentUserId && !a.currentVersionId)
          .forEach(a => { if (a.name) this.myDraftNames.add(a.name); });
      });
  }

  /** Pipeline cards visible to the current user.
   *  Higher ranks (AI Engineer+): approved items + own DRAFT/PENDING items.
   *  AI Client (rank 0): delegates to isCardVisibleToUser() — see that method.
   */
  get visibleCards(): any[] {
    if (this.userRank > 0) {
      return this.paginatedCards.filter(card => this.isCardVisibleToHigherRankUser(card));
    }
    return this.paginatedCards.filter(card => this.isCardVisibleToUser(card));
  }

  /** Visibility check for rank 1+ (AI Engineer, Project Admin, Org Admin, Platform Admin).
   *  - Non-draft items (approved, published) are visible to all higher-rank users.
   *  - DRAFT / PENDING items are only visible to their creator.
   *  - Agent Designer items and items with no approval_status are always visible.
   */
  private isCardVisibleToHigherRankUser(card: any): boolean {
    // Agent Designer cards always show
    if (card.isAgentDesigner) return true;

    const status = (card.approval_status || card.approvalStatus ||
                    card.target?.approval_status || '').toUpperCase();

    // Items with no approval_status (legacy) always show
    if (!status) return true;

    // Only DRAFT and PENDING_PROJECT_APPROVAL are creator-only.
    // PENDING_ORG_APPROVAL / PENDING_PLATFORM_APPROVAL are visible to all users
    // in scope — the backend already enforces this via approval-workflow filtering.
    const draftOrPending = status === 'DRAFT' ||
      status === 'PENDING_PROJECT_APPROVAL';

    if (!draftOrPending) return true; // approved / pending-org / published items visible to all

    // DRAFT / PENDING_PROJECT_APPROVAL: only the creator sees them.
    if (!this.currentUserLogin) return true;

    const rawCreatedBy = (card.target?.created_by || card.created_by || card.createdBy || '').toLowerCase();
    if (!rawCreatedBy) return true; // unknown creator → show by default
    // Normalise to email prefix — user_login may be stored as full email or bare name.
    const createdBy = rawCreatedBy.includes('@') ? rawCreatedBy.split('@')[0] : rawCreatedBy;

    return createdBy === this.currentUserLogin;
  }

  /** Visibility check for AI Client (rank=0). Shows:
   *  1. Admin-created pipelines (visible to all).
   *  2. Pipelines where created_by OR lastmodifiedby matches the logged-in user.
   *  3. Pipelines with PROJECT_APPROVED status (approved by project admin for team use).
   *  4. Approved or draft pipelines submitted by this user.
   *  Handles both snake_case (created_by) and camelCase (createdBy) from the API. */
  private isCardVisibleToUser(card: any): boolean {
    const normalise = (v: string) => { const s = v.toLowerCase(); return s.includes('@') ? s.split('@')[0] : s; };
    const createdBy = normalise(card.target?.created_by || card.created_by || card.createdBy || '');
    const lastModifiedBy = normalise(card.target?.lastmodifiedby || card.lastmodifiedby || '');
    const approvalStatus = card.approval_status || card.approvalStatus || '';
    
    // Rule 1: Admin-created pipelines visible to everyone
    if (createdBy === 'admin') return true;
    
    // Rule 2: Created by logged-in user
    if (this.currentUserLogin) {
      if (createdBy === this.currentUserLogin) return true;
      if (lastModifiedBy === this.currentUserLogin) return true;
    }
    
    // Rule 3: Any approved/pending-higher-level status — backend already scoped correctly
    const visibleStatuses = [
      'PROJECT_APPROVED', 'ORG_APPROVED', 'PUBLISHED',
      'PENDING_ORG_APPROVAL', 'PENDING_PLATFORM_APPROVAL'
    ];
    if (visibleStatuses.includes(approvalStatus)) {
      console.debug('[Visibility] Card visible:', approvalStatus, 'status', card.alias);
      return true;
    }
    
    // Rule 4: In approval sets (approvedNames or myDraftNames)
    return this.approvedNames.has(card.alias) || this.myDraftNames.has(card.alias);
  }

  /** True when the card was created by admin or by the logged-in user — no approval needed. */
  isDirectlyVisible(card: any): boolean {
    const raw = (card.target?.created_by || card.created_by || card.createdBy || '').toLowerCase();
    const createdBy = raw.includes('@') ? raw.split('@')[0] : raw;
   return createdBy === 'admin' || (!!this.currentUserLogin && createdBy === this.currentUserLogin);
  }



  // ── Approval badge / submit helpers ─────────────────────────────────────────

  getApprovalStatus(card: any): string {
    return (card.approval_status || card.approvalStatus || card.target?.approval_status || '').toUpperCase();
  }

  getApprovalLabel(card: any): string {
    const s = this.getApprovalStatus(card);
    const map: Record<string, string> = {
      DRAFT: 'Draft',
      PENDING_PROJECT_APPROVAL: 'Pending Project Approval',
      PROJECT_APPROVED: 'Project Approved',
      PENDING_ORG_APPROVAL: 'Pending Org Approval',
      ORG_APPROVED: 'Org Approved',
      PENDING_PLATFORM_APPROVAL: 'Pending Platform Approval',
      GLOBALLY_PUBLISHED: 'Globally Published',
      PUBLISHED: 'Globally Published',
    };
    return map[s] || s;
  }

  getApprovalBadgeClass(card: any): string {
    const s = this.getApprovalStatus(card);
    const map: Record<string, string> = {
      DRAFT: 'badge-draft',
      PENDING_PROJECT_APPROVAL: 'badge-pending',
      PROJECT_APPROVED: 'badge-project-approved',
      PENDING_ORG_APPROVAL: 'badge-pending',
      ORG_APPROVED: 'badge-org-approved',
      PENDING_PLATFORM_APPROVAL: 'badge-pending',
      GLOBALLY_PUBLISHED: 'badge-global',
      PUBLISHED: 'badge-global',
    };
    return map[s] || '';
  }

  getApprovalIcon(card: any): string {
    const s = this.getApprovalStatus(card);
    if (s === 'DRAFT') return 'edit_note';
    if (s.startsWith('PENDING_')) return 'hourglass_empty';
    if (s === 'PROJECT_APPROVED') return 'folder_open';
    if (s === 'ORG_APPROVED') return 'business';
    if (s === 'GLOBALLY_PUBLISHED' || s === 'PUBLISHED') return 'public';
    return 'label';
  }

  isDraftOwnedByUser(card: any): boolean {
    const status = this.getApprovalStatus(card);
    if (status !== 'DRAFT') return false;
    const createdBy = (card.target?.created_by || card.created_by || card.createdBy || '').toLowerCase();
    return !!this.currentUserLogin && createdBy === this.currentUserLogin;
  }

  submitForProjectApproval(card: any): void {
    const resourceId = card.cid;
    if (!resourceId) { return; }

    const headers: any = {};
    if (this.currentUserLogin) { headers['user-login'] = this.currentUserLogin; }
    if (this.currentProjectId) { headers['project'] = String(this.currentProjectId); }

    const body: any = { resourceId };
    if (this.currentProjectId) { body.projectId = this.currentProjectId; }

    this.http.post<any>(
      '/api/aip/streamingServices/approval/submit',
      body,
      { headers }
    ).pipe(catchError(err => {
      this.service.message(err?.error?.message || 'Failed to submit for approval', 'error');
      return of(null);
    })).subscribe(res => {
      if (res !== null) {
        this.service.message(`"${card.alias || card.name}" submitted for project approval`, 'success');
        this.getCards();
      }
    });
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
    } else if (this.pipelineMode === 'app') {
      return {
        type: 'appPipeline',
        interfacetype: 'app-pipeline'
      };
    } else if (this.pipelineMode === 'pipeline') {
      return {
        type: 'NativeScript',
        interfacetype: 'pipeline'
      };
    } else if (this.pipelineMode === 'data') {
      return {
        type: 'DataPipeline',
        interfacetype: 'pipeline'
      };
    } else if (this.pipelineMode === 'training') {
      return {
        type: 'TrainingPipeline',
        interfacetype: 'pipeline'
      };
    } else {
      return {
        interfacetype: 'pipeline-agent'
      };
    }
  }


}