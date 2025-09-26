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

@Component({
  selector: 'app-datasource',
  templateUrl: './datasource.component.html',
  styleUrls: ['./datasource.component.scss'],
})
export class DatasourceComponent implements OnInit, OnChanges {
  cardTitle: String = 'Connections';
    hoverStates: boolean[] = [];
  lastRefreshedTime: Date | null = null;
    servicev1 = 'connections';
      hasFilters = false;

  test: any;
  cards: any;
  filteredCards: any;
  options = [];
  alias = [];
  datasetTypes = [];
  OptionType: any;
  selectedInstance: any;
  keys: any = [];
  users: any = [];
  filt: any;
  selectedCard: any = [];
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
  deleteAuth: boolean;
  deployAuth: boolean;
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
  finalDataList: any = [];
  filter: string = '';
  records: boolean = false;
  isExpanded = false;
  tooltip: string = 'above';
  filtbackup: any="";
  tagSelected: boolean = false;
  datasourceName:any;
  private hasRefreshed = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private changeDetectionRef: ChangeDetectorRef,
    public tagService: TagsService,
    private dialog: MatDialog,
    private location: Location
  ) {}
  ngOnChanges(changes: SimpleChanges): void {}

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updatePageSize();
  }
  updatePageSize() {
    this.pageSize=0;
    if (window.innerWidth > 2500) {
      this.itemsPerPage = [16,32,48,64,80,96];
      this.pageSize = this.pageSize || 16; // xl
      this.getCards(this.pageNumber,this.pageSize);
    }
    else if (window.innerWidth > 1440 && window.innerWidth <= 2500) {
      this.itemsPerPage = [10, 20, 40, 60, 80, 100];
      this.pageSize = this.pageSize || 10; // lg
      this.getCards(this.pageNumber,this.pageSize);
    } else if (window.innerWidth > 1024 && window.innerWidth <= 1440) {
      this.itemsPerPage = [8, 16, 32, 48, 64, 80];
      this.pageSize = this.pageSize || 8; //md
      this.getCards(this.pageNumber,this.pageSize);
    } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      this.itemsPerPage = [6, 9, 18, 36, 54, 72];
      this.pageSize = this.pageSize || 6; //sm
      this.getCards(this.pageNumber,this.pageSize);
    } else if (window.innerWidth < 768 ) {
      this.itemsPerPage = [4,8,12,16,20,24];
      this.pageSize = this.pageSize || 4; //xs
      this.getCards(this.pageNumber,this.pageSize);
    }
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
    this.getCards(this.pageNumber, this.pageSize);
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
    this.tagService.tags.forEach((element: any) => {
      console.log(element, 'element');
    });
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }
  getCards(page: any, size: any): void {
    let org;
    if (this.router.routerState.snapshot.url.includes('core-datasources'))
      org = 'Core';
    else org = sessionStorage.getItem('organization');
      if(this.cards==undefined || this.cards==null || this.cards.length==0)
      this.service.getDatasourceCards(org).subscribe((res) => {        
        let data: any = [];
        let test = res;
        test.forEach((element: any) => {
          data.push(element);
          this.users.push(element.alias);
        });
        this.cards = data;
        let sort: any = [];
        let timezoneOffset = new Date().getTimezoneOffset();
        this.cards.forEach((e) => {
          e.lastmodifieddate = new Date(new Date(e.lastmodifieddate).getTime() - timezoneOffset * 60 * 1000);
          sort.push(e);
        });
        this.filteredCards = sort.sort(
          (a, b) => b.lastmodifieddate - a.lastmodifieddate
        );
        this.noOfItems = data.length;
        this.noOfItems = this.noOfItems || data.length;
        this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
        this.pageArr = [...Array(this.noOfPages).keys()];
            this.hoverStates = new Array(this.pageArr.length).fill(false);

        if(page)
          this.filterCards(page);

      });
    this.pageSize = this.pageSize || 6;
  }
  desc(card: any) {
    this.cardToggled = !this.cardToggled;
    this.selectedCard = card;
    console.log(this.selectedCard);
  }
  redirect() {
    this.selectedInstance = this.selectedCard.name;
    this.router.navigate(['./view', this.cardTitle, this.selectedInstance], {
      relativeTo: this.route,
    });
  }
  navigateTo(type) {
    this.router.navigate(['../datasets/' + type], { relativeTo: this.route });
  }

  viewConnection(name) {
    this.view = true;
    this.router.navigate(['./view/' + name, this.view], {
      relativeTo: this.route,
    });
  }
  editConnection(name) {
    this.edit = true;
    this.router.navigate(['./edit/' + name, this.edit], {
      relativeTo: this.route,
    });
  }
  tagSelectedEvent(event) {
    this.selectedAdapterInstance = event.getSelectedAdapterInstance();
    this.selectedAdapterType = event.getSelectedAdapterType();
    this.selectedTag = event.getSelectedTagList();
    this.tagrefresh = false;
    this.tagSelected = true;
          this.hasRefreshed=false;

    this.filterCards();
  }

  filterCards(searchText?:string, page?: number) {
     if (searchText !== undefined) {
      this.filt = searchText;
    }
      const filtStr = typeof this.filt === 'string' ? this.filt.trim() : '';

      if (filtStr.length != this.filtbackup.length) {
      this.pageNumber = 1;
      this.filtbackup = this.filt;
    }
    if (page)
      this.pageNumber = page;
    else
      this.pageNumber = 1;
    if (this.selectedAdapterType.length > 0) {
      let multiFilter;
      this.finalDataList = [];
      this.records = true;
      for (let i = 0; i < this.selectedAdapterType.length; i++) {
        multiFilter = this.cards.filter((data) => {
          const isAdapterTypeIncluded = data.type?.includes(this.selectedAdapterType[i]);
          const isFiltIncluded = filtStr && filtStr.trim() !== '' ? (data.alias.toLowerCase().includes(filtStr.toLowerCase()) || data.name.toLowerCase().includes(filtStr.toLowerCase())) : true;
          if (this.records)
            this.records = !(isAdapterTypeIncluded && isFiltIncluded);
          return isAdapterTypeIncluded && isFiltIncluded;
        }

        );
        this.finalDataList.push(...multiFilter);
      }
      this.filteredCards = this.finalDataList;
      this.noOfItems = this.filteredCards.length;
      this.noOfItems = this.noOfItems || this.filteredCards.length;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
          this.hoverStates = new Array(this.pageArr.length).fill(false);

    } else {
      if (filtStr && filtStr != '') {
        this.records = true;
        this.filteredCards = this.cards.filter((data) => {
          const match = data.alias.toLowerCase().includes(filtStr?.toLowerCase()) || data.name.toLowerCase().includes(filtStr?.toLowerCase());
          if (match) {
            this.records = false;
          }
          return match;
        });
        this.noOfItems = this.filteredCards.length;
        this.noOfItems = this.noOfItems || this.filteredCards.length;
        this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
        this.pageArr = [...Array(this.noOfPages).keys()];
            this.hoverStates = new Array(this.pageArr.length).fill(false);

      }
       else {
        if (!page && !this.hasRefreshed){
          this.hasRefreshed=true;
          this.refreshComplete();
      }
    }
    }
    this.updateQueryParam(this.pageNumber, this.filt, this.selectedAdapterType.toString());
  }


  getCountPipelines() {
    let params: HttpParams = new HttpParams();
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    if (this.selectedAdapterType.length >= 1)
      params = params.set('type', this.selectedAdapterType.toString());
    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);
    params = params.set('project', sessionStorage.getItem('organization'));
    params = params.set('isCached', true);
    params = params.set('cloud_provider', 'internal');
    params = params.set('interfacetype', 'pipeline');
    this.service.getCountPipelines(params).subscribe((res) => {
      this.noOfItems = res;
    });
  }

  filterz(searchText?: string) {
    this.filterCards(searchText);
  }
  getTags() {
    this.tags = {};
    this.tagsBackup = {};
    // this.category.push("platform")
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
  open() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  deleteConnection(name: string) {
    this.deleteRuntimes(name);
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.service.deleteDatasource(name).subscribe(
          (res: any) => {
            if (res && res.status === 200) {
              this.service.message('Done! Connection deleted Successfully');
              this.refreshComplete();
            } else {
              this.service.message('Failed to delete connection ', 'error');
            }
          },
          (error) => {
            this.service.message('Error deleting connection '+error?.error?.message ,'error');
          }
        );
      }
    });
  }

  deleteRuntimes(name:any){
   this.service.deleteRuntimes(name).subscribe((res) =>{
    console.log("Delete Runtimes : ",res);
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
        this.tagrefresh = true;
        if (!this.hasFilters) {
    this.updateQueryParam(1, "", "");
    this.cards = [];
    this.tagrefresh = true;
    this.selectedAdapterType = [];
    this.getCards(1, this.pageSize);
         this.filt = '';
      this.tagrefresh = true;
        }
        this.lastRefreshTime();

  }
   lastRefreshTime() {
    setTimeout(() => {
      this.lastRefreshedTime = new Date();
      console.log('Data refreshed!');
    }, 1000);
  }
  onFilterStatusChange(hasActiveFilters: boolean) {
    this.hasFilters = hasActiveFilters;
  }
}

