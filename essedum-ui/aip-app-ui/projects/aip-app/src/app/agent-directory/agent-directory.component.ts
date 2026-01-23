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
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { Location } from '@angular/common';
import { AgentDirectoryCreateComponent } from './agent-directory-create/agent-directory-create.component';
import { AgentDirectoryService } from './agent-directory.service';
@Component({
  selector: 'app-agent-directory',
  templateUrl: './agent-directory.component.html',
  styleUrls: ['./agent-directory.component.scss'],
})
export class AgentDirectoryComponent implements OnInit, OnChanges {
  cardTitle: String = 'Agent Directory';
  servicev1: string = 'agent-directory';
  hoverStates: boolean[] = [];
  lastRefreshedTime: Date | null = null;
  hasFilters = false;

  cards: any;
  filteredCards: any;
  filt: any;
  cardToggled: boolean = true;
  pageSize: number;
  pageNumber: number;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number = 0;
  prevRowsPerPageValue: number;
  itemsPerPage: number[] = [6, 12, 18, 24, 30];
  noOfItems: number;
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();
  endIndex: number;
  startIndex: number;
  pageNumberChanged: boolean = true;
  createAuth: boolean;
  editAuth: boolean;
  addView:boolean;
  editView:boolean;
  deleteAuth: boolean;
  category = [];
  tags;
  tagsBackup;
  allTags: any;
  tagStatus = {};
  catStatus = {};
  selectedTag = [];
  edit: boolean = false;
  view: boolean = false;
  tagrefresh: boolean = false;
  selectedAdapterInstance: string[] = [];
  selectedAdapterType: string[] = [];
  records: boolean = false;
  isExpanded = false;
  filtbackup: any="";
  tagSelected: boolean = false;
  datasourceName:any;
  private hasRefreshed = false;
  selectedAgentSkills: string[] = [];
  selectedAgentLocatorTypes: string[] = [];
  selectedAgentModules: string[] = [];
  selectedAgentAllTypes: string[] = [];
  agentCreationDateFrom: Date | null = null;
  agentCreationDateTo: Date | null = null;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private changeDetectionRef: ChangeDetectorRef,
    public tagService: TagsService,
    private dialog: MatDialog,
    private location: Location,
    private agentDirectoryService: AgentDirectoryService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {}

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updatePageSize();
  }

  private getPageSizeConfig(width: number): { itemsPerPage: number[], defaultSize: number } {
    const configs = [
      { min: 2500, max: Infinity, itemsPerPage: [16,32,48,64,80,96], defaultSize: 16 }, // xl
      { min: 1440, max: 2500, itemsPerPage: [10, 20, 40, 60, 80, 100], defaultSize: 10 }, // lg
      { min: 1024, max: 1440, itemsPerPage: [8, 16, 32, 48, 64, 80], defaultSize: 8 }, // md
      { min: 768, max: 1024, itemsPerPage: [6, 9, 18, 36, 54, 72], defaultSize: 6 }, // sm
      { min: 0, max: 768, itemsPerPage: [4,8,12,16,20,24], defaultSize: 4 } // xs
    ];
    
    return configs.find(config => width > config.min && width <= config.max) || configs[configs.length - 1];
  }

  updatePageSize() {
    this.pageSize = 0;
    const config = this.getPageSizeConfig(window.innerWidth);
    this.itemsPerPage = config.itemsPerPage;
    this.pageSize = this.pageSize || config.defaultSize;
  }

  ngOnInit(): void {
    this.updatePageSize();
    
    const currentRoute = this.router.url;
    if (currentRoute === '/landing/aip/core-datasources') {
      this.cardTitle = 'Core Datasources';
    }
    this.records = false;
    this.pageSize = this.itemsPerPage[0];
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['page']) {
        this.pageNumber = params['page'];
        this.filt = params['search'];
        this.selectedAdapterType = params['type']
          ? params['type'].split(',')
          : [];
           if (this.selectedAdapterType && this.selectedAdapterType.length > 0) {
          this.hasFilters = true;
        }
       else {
        this.pageNumber = 1;
        this.filt = '';
      }
      } else {
        this.pageNumber = 1;
        this.filt = '';
      }
    });
    this.updateQueryParam(this.pageNumber,this.filt,this.selectedAdapterType.toString());
    if (this.pageNumber && this.pageNumber >= 5) {
      this.endIndex = this.pageNumber + 2;
      this.startIndex = this.endIndex - 5;
    } else {
      this.startIndex = 0;
      this.endIndex = 5;
    }
    if (
      this.cardTitle == 'Core Datasources' &&
      sessionStorage.getItem('organization') == 'Core'
    ) {
      this.Authentications();
    }
    if (this.cardTitle != 'Core Datasources') {
      this.Authentications();
    }
    this.getTags();
    this.loadAgentDirectoryList();
    this.lastRefreshTime();

  }
  updateQueryParam(
    page: number = 1,
    search: string = '',
    type: string = '',
    org: string = sessionStorage.getItem('organization'),
    roleId: string = JSON.parse(sessionStorage.getItem('role') || '{}').id
  ) {
    const urlTree = this.router.createUrlTree([], {
      queryParams: {
        page: page,
        search: search,
        type: type,
        org: org,
        roleId: roleId,
      },
      queryParamsHandling: 'merge',
    });

    const url = this.router.serializeUrl(urlTree);
    this.location.replaceState(url);
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
    this.updateQueryParam(this.pageNumber, this.filt,this.selectedAdapterType.toString());
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
    this.service.getPermission('cip').subscribe((cipAuthority) => 
      {
        const authorityArr = JSON.parse(cipAuthority);
        this.createAuth = authorityArr.some(item => item.permission === "datasource-create");
        this.editAuth = authorityArr.some(item => item.permission === "datasource-edit");
        this.deleteAuth = authorityArr.some(item => item.permission === "datasource-delete");
      });
  }

  changedToogle(event: any) {
    this.cardToggled = event;
  }

  tagchange() {
    // Tags change handler - can be extended as needed
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }

  // Navigation methods for agent directory

  viewAgentDirectory(name) {
    this.view = true;
    this.router.navigate(['./view/' + name], {
      relativeTo: this.route,
    });
  }

  editAgentDirectory(name) {
    this.editView = true;
    this.router.navigate(['./edit/' + name], {
      relativeTo: this.route,
    });
  }

    addAgentDirectory() {
    this.addView = true;
    this.router.navigate(['./add'], {
      relativeTo: this.route,
    });
  }

  tagSelectedEvent(event) {
    this.selectedAdapterInstance = event.getSelectedAdapterInstance();
    this.selectedAdapterType = event.getSelectedAdapterType();
    this.selectedTag = event.getSelectedTagList();
    this.selectedAgentSkills = event.getSelectedAgentSkills();
    this.selectedAgentLocatorTypes = event.getSelectedAgentLocatorTypes();
    this.selectedAgentModules = event.getSelectedAgentModules();
    this.selectedAgentAllTypes = event.getSelectedAgentAllTypes();
    this.agentCreationDateFrom = event.getAgentCreationDateFrom();
    this.agentCreationDateTo = event.getAgentCreationDateTo();
    this.tagrefresh = false;
    this.tagSelected = true;
    this.hasRefreshed=false;

    this.filterCards();
  }

  loadAgentDirectoryList(page?: number, size?: number) {
    const organization = sessionStorage.getItem('organization');
    
    // Fetch all data like datasource component does
    if(this.cards==undefined || this.cards==null || this.cards.length==0) {
      this.agentDirectoryService.getListAgentDirectory(
        1,
        1000, // Get large number to fetch all
        organization,
        true,
        'internal',
        'Agent'
      ).subscribe(
        (response: any) => {
          if (response) {
            const successMsg="Agent directory records fetched successfully"
            this.service.message(successMsg,'');
            let data: any = [];
            const responseData = response.content || response.data || response;
            responseData.forEach((element: any) => {
              data.push(element);
            });
            this.cards = data;
            
            let sort: any = [];
            let timezoneOffset = new Date().getTimezoneOffset();
            this.cards.forEach((e) => {
              if (e.lastmodifieddate) {
                e.lastmodifieddate = new Date(new Date(e.lastmodifieddate).getTime() - timezoneOffset * 60 * 1000);
              }
              sort.push(e);
            });
            this.filteredCards = sort.sort(
              (a, b) => {
                const dateA = a.lastmodifieddate ? new Date(a.lastmodifieddate).getTime() : 0;
                const dateB = b.lastmodifieddate ? new Date(b.lastmodifieddate).getTime() : 0;
                return dateB - dateA;
              }
            );
            
            console.log('[AgentDirectory] Loaded', data.length, 'agents, triggering filter refresh');
            
            // Notify filter component to refresh
            this.tagrefresh = true;
            setTimeout(() => {
              this.tagrefresh = false;
            }, 0);
            
            this.noOfItems = data.length;
            this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
            this.pageArr = [...Array(this.noOfPages).keys()];
            this.hoverStates = new Array(this.pageArr.length).fill(false);
            
            if(page)
              this.filterCards(this.filt, page);
          }
        },
        (error) => {
          console.error('Error loading agent directory list:', error);
         const errorMessage =error?.details || 'Failed to load agent directory list';
          this.service.message(errorMessage, 'error');
        }
      );
    }
  }

  filterCards(searchText?:string, page?: number) {
    if (searchText !== undefined) {
      this.filt = searchText;
    }
    const filtStr = typeof this.filt === 'string' ? this.filt.trim() : '';

    if (filtStr.length != this.filtbackup.length) {
      this.filtbackup = filtStr;
      this.pageNumber = 1;
    }
    if (page)
      this.pageNumber = page;
    else
      this.pageNumber = 1;

    // Start with all cards
    let tempFilteredCards = [...this.cards];

    // Apply text search filter
    if (filtStr.length > 0) {
      tempFilteredCards = tempFilteredCards.filter(card => 
        card.name?.toLowerCase().includes(filtStr.toLowerCase()) ||
        card.alias?.toLowerCase().includes(filtStr.toLowerCase()) ||
        card.description?.toLowerCase().includes(filtStr.toLowerCase()) ||
        card.type?.toLowerCase().includes(filtStr.toLowerCase())
      );
    }

    // Apply agent skills filter
    if (this.selectedAgentSkills.length > 0) {
      tempFilteredCards = tempFilteredCards.filter(card => {
        if (!card.skills || !Array.isArray(card.skills)) return false;
        return this.selectedAgentSkills.some(selectedSkill => 
          card.skills.some(skill => {
            const skillName = typeof skill === 'string' ? skill : skill.name;
            return skillName === selectedSkill;
          })
        );
      });
    }

    // Apply locator types filter
    if (this.selectedAgentLocatorTypes.length > 0) {
      tempFilteredCards = tempFilteredCards.filter(card => {
        if (!card.locators || !Array.isArray(card.locators)) return false;
        return this.selectedAgentLocatorTypes.some(selectedType => 
          card.locators.some(locator => locator.locatorType === selectedType)
        );
      });
    }

    // Apply modules filter
    if (this.selectedAgentModules.length > 0) {
      tempFilteredCards = tempFilteredCards.filter(card => {
        if (!card.modules || !Array.isArray(card.modules)) return false;
        return this.selectedAgentModules.some(selectedModule => 
          card.modules.some(module => module.name === selectedModule)
        );
      });
    }

    // Apply all types filter
    if (this.selectedAgentAllTypes.length > 0) {
      tempFilteredCards = tempFilteredCards.filter(card => 
        this.selectedAgentAllTypes.includes(card.type)
      );
    }

    // Apply creation date filter (based on lastmodifieddate)
    if (this.agentCreationDateFrom || this.agentCreationDateTo) {
      tempFilteredCards = tempFilteredCards.filter(card => {
        if (!card.lastModifiedDate) return true; // If no date, include the card
        
        // Parse the card date
        const cardDate = new Date(card.lastModifiedDate);
        
        // Check if date is valid
        if (isNaN(cardDate.getTime())) return true;
        
        // Reset time to start of day for fair comparison
        const cardDateOnly = new Date(cardDate.getFullYear(), cardDate.getMonth(), cardDate.getDate());
        
        // Check From date
        if (this.agentCreationDateFrom) {
          const fromDateOnly = new Date(this.agentCreationDateFrom.getFullYear(), this.agentCreationDateFrom.getMonth(), this.agentCreationDateFrom.getDate());
          if (cardDateOnly.getTime() < fromDateOnly.getTime()) return false;
        }
        
        // Check To date
        if (this.agentCreationDateTo) {
          const toDateOnly = new Date(this.agentCreationDateTo.getFullYear(), this.agentCreationDateTo.getMonth(), this.agentCreationDateTo.getDate());
          if (cardDateOnly.getTime() > toDateOnly.getTime()) return false;
        }
        
        return true;
      });
    }

    this.filteredCards = tempFilteredCards;
    this.noOfItems = this.filteredCards.length;
    this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
    this.pageArr = [...Array(this.noOfPages).keys()];
    this.hoverStates = new Array(this.pageArr.length).fill(false);
    
    this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString());
  }

  filterz(searchText?: string) {
    this.filterCards(searchText);
  }
  getTags() {
    this.tags = {};
    this.tagsBackup = {};
    this.service.getMlTags().subscribe((resp) => {
      this.allTags = resp;
      resp.forEach((tag) => {
        if (this.category.indexOf(tag.category) == -1) {
          this.category.push(tag.category);
        }
        this.tagStatus[tag.category + ' - ' + tag.label] = false;
      });
      this.category.forEach((cat) => {
        this.tags[cat] = this.allTags
          .filter((tag) => tag.category == cat)
          .slice(0, 10);
        this.tagsBackup[cat] = this.allTags.filter(
          (tag) => tag.category == cat
        );
        this.catStatus[cat] = false;
      });
    });
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


   createAgentDirectory(): void {
      const dialogRef = this.dialog.open(AgentDirectoryCreateComponent, {
        height: '80%',
        width: '60%',
        minWidth: '60vw',
        disableClose: true,
        panelClass: 'agent-directory-create-dialog',
        data: {
          edit: false,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.refreshComplete();
        }
      });
    }

  deleteAgentDirectory(cid: number) {
    const agent = this.cards.find(card => card.cid === cid);

    
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.agentDirectoryService.deleteAgentDirectory(cid).subscribe(
          (res: any) => {
            if (res && res.status === 200) {
              // Remove the deleted record from both arrays using ID
              this.cards = this.cards.filter(card => card.id !== cid);
              this.filteredCards = this.filteredCards.filter(card => card.id !== cid);
              
              // Update pagination
              this.noOfItems = this.filteredCards.length;
              this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
              this.pageArr = [...Array(this.noOfPages).keys()];
              this.hoverStates = new Array(this.pageArr.length).fill(false);
              
              this.service.message('Done! Agent directory deleted Successfully');
              this.lastRefreshTime();
               this.refreshComplete();
            } else {
              this.service.message('Failed to delete agent directory ', 'error');
            }
          },
          (error) => {
            const errorMessage =error?.details || 'Failed to delete agent directory';
            this.service.message(errorMessage ,'error');
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
  refreshComplete() {
    this.filt = '';
    this.selectedAgentSkills = [];
    this.selectedAgentLocatorTypes = [];
    this.selectedAgentModules = [];
    this.selectedAgentAllTypes = [];
    this.agentCreationDateFrom = null;
    this.agentCreationDateTo = null;
    this.selectedAdapterType = [];
    this.selectedAdapterInstance = [];
    this.selectedTag = [];
    this.tagrefresh = true;
    if (!this.hasFilters) {
      this.updateQueryParam(1, "", "");
      this.cards = [];
      this.tagrefresh = true;
      this.selectedAdapterType = [];
      this.loadAgentDirectoryList(1, this.pageSize);
      this.filt = '';
      this.tagrefresh = true;
    }
    this.lastRefreshTime();
  }
   lastRefreshTime() {
    setTimeout(() => {
      this.lastRefreshedTime = new Date();
    }, 1000);
  }
  onFilterStatusChange(hasActiveFilters: boolean) {
    this.hasFilters = hasActiveFilters;
  }

  downloadSelectedFile(card:any){
  }
}

