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
import { ActivatedRoute, Router } from '@angular/router';
import { LedsLibService, LedsModalService } from 'leds-lib';
import { Services } from '../services/service';
import { TabsFilterService } from '../services/tabs-filter.service';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { LeapTelemetryService, OpenTelemetryService } from 'com-lib-util';
import { Location } from '@angular/common';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-endpoint',
  templateUrl: './endpoint.component.html',
  styleUrls: ['./endpoint.component.scss'],
})
export class EndpointComponent implements OnInit, OnChanges {
  menus: boolean = false;
  test: any;
  cards: any;
  options = [];
  alias = [];
  datasetTypes = [];
  OptionType: any;
  selectedInstance: any;
  keys: any = [];
  users: any = [];
  filter: string = '';
  selectedCard: any = [];
  cardToggled: boolean = true;
  cardTitle: String = 'Endpoint';
  searchText: string = '';
  tmpSearchText = '';
  category = [];
  tags;
  tagsBackup;
  allTags: any;
  tagStatus = {};
  catStatus = {};
  selectedTag = [];

  // pageSize: number;
  // pageNumber: number;
  // pageArr: number[] = [];
  // pageNumberInput: number = 1;
  // noOfPages: number = 0;
  // prevRowsPerPageValue: number;
  // itemsPerPage: number[] = [6, 9, 18, 36, 54, 72];
  // noOfItems: number;
  // @Output() pageChanged = new EventEmitter<any>();
  // @Output() pageSizeChanged = new EventEmitter<any>();
  // endIndex: number;
  // startIndex: number;
  // pageNumberChanged: boolean = true;
  pageNumber: number;
  pageSize: number;
  noOfItems: number;
  @ViewChild('pagination') paginationComponent:PaginationComponent;
  createAuth: boolean;
  editAuth: boolean;
  deleteAuth: boolean;

  selectedTagList: any[];
  selectedType: string[] = [];
  adapterTypes: any;
  selectedAdapterType: string[] = [];
  selectedAdapterInstance: string[] = [];
  adapterTypeList: any[] = [];
  adapterInstanceList: any[] = [];
  servicev1 = 'endpoint';
  tagrefresh: boolean = false;
  cortexwindow: any;
  records: boolean = false;
  isExpanded = false;
  tooltip: string = 'above';

  constructor(
    private telemetryService: LeapTelemetryService,
    private telemetry: OpenTelemetryService,
    private service: Services,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: LedsModalService,
    private ledsLibService: LedsLibService,
    private filtersService: TabsFilterService,
    private changeDetectionRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private location: Location
  ) {
    // this.cortexwindow = window['cortexCore'].config.getConfig().features.virtualAssistant;
    // this.route.queryParams.subscribe((params) => {
    //   this.pageNumber = params['page'] ? parseInt(params['page']) : 1;
    //   this.filter = params['search'] || this.filter;
    // });
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.getCards();
  }
  redirection(card: any, type: string) {
    // //this.telemetry.addTelemetryEvent(card.alias + type);
    this.router.navigate(['./' + type + '/' + card.name], {
      queryParams: {
        page: this.pageNumber,
        search: this.filter,
        adapterType: this.selectedType.toString(),
        adapterInstance: this.selectedAdapterInstance.toString(),
        org: sessionStorage.getItem('organization'),
        roleId:  JSON.parse(sessionStorage.getItem('role')).id
      },
      queryParamsHandling: 'merge',
      state: {
        card,
      },
      relativeTo: this.route,
    });
    //this.telemetry.addTelemetryEvent(card.alias + type);
  }
  redirectionedit(card: any, type: string) {
    this.router.navigate(['./' + type], {
      state: {
        card,
      },
      relativeTo: this.route,
    });
  }
  updateQueryParam(
    page: number = 1,
    search: string = '',
    adapterType: string = '',
    adapterInstance: string = '',
    org: string = sessionStorage.getItem('organization'),
    roleId: string = JSON.parse(sessionStorage.getItem('role')).id
  ) {
    const url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          type: adapterType,
          adapterInstance: adapterInstance,
          org:org,
          roleId: roleId
        },
        queryParamsHandling: 'merge',
      })
      .toString();

    this.location.replaceState(url);
  }
  ngOnInit(): void {
    this.Authentications();
    this.records = false;
    this.telemetryImpression();
  //  this.pageSize = this.itemsPerPage[0];
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['page']) {
        this.pageNumber = params['page'];
        this.filter = params['search'];
        this.selectedType = params['type']
          ? params['type'].split(',')
          : [];
        this.selectedAdapterInstance = params['adapterInstance']
          ? params['adapterInstance'].split(',')
          : [];
      } else {
        this.pageNumber = 1;
        this.filter = '';
      }
    });
    this.updateQueryParam(this.pageNumber);
    this.getCountModels();
    this.getCards();
    // if (this.pageNumber && this.pageNumber >= 5) {
    //   this.endIndex = this.pageNumber + 2;
    //   this.startIndex = this.endIndex - 5;
    // } else {
    //   this.startIndex = 0;
    //   this.endIndex = 5;
    // }

    this.fetchAdapterList();
  }

  telemetryImpression() {
    this.telemetryService.start();
    this.telemetryService.impression('aip-app', 'list', 'EndpointComponent');
  }
  resetPage(page:number){
    this.paginationComponent.changePage(page);
  }

  Authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      // endpoint-create permission
      if (cipAuthority.includes('endpoint-create')) this.createAuth = true;
      // endpoint-edit/update permission
      if (cipAuthority.includes('endpoint-edit')) this.editAuth = true;
      // endpoint-delete permission
      if (cipAuthority.includes('endpoint-delete')) this.deleteAuth = true;
    });
  }
  // nextPage() {
  //   if (this.pageNumber + 1 <= this.noOfPages) {
  //     this.pageNumber += 1;
  //     // this.changePage(this.pageNumber);
  //     this.changePage();
  //   }
  // }
  // prevPage() {
  //   if (this.pageNumber - 1 >= 1) {
  //     this.pageNumber -= 1;
  //     // this.changePage(this.pageNumber);
  //     this.changePage();
  //   }
  // }
  // updatequeryParam(page: number, search: string) {
  //   this.router.navigate([], {
  //     relativeTo: this.route,
  //     queryParams: { page: page, search: search },
  //     queryParamsHandling: 'merge',
  //   });
  // }
  // changePage(page?: number) {
  //   if (page && page >= 1 && page <= this.noOfPages) this.pageNumber = page;
  //   if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
  //     this.pageChanged.emit(this.pageNumber);
  //     // this.updatequeryParam(this.pageNumber, this.filter);
  //     if (this.pageNumber > 5) {
  //       this.endIndex = this.pageNumber + 2;
  //       this.startIndex = this.endIndex - 3;
  //     } else {
  //       this.startIndex = 0;
  //       this.endIndex = 5;
  //     }
  //   }
  //   this.getCards();
  // }
  // rowsPerPageChanged() {
  //   if (this.pageSize == 0) {
  //     this.pageSize = this.prevRowsPerPageValue;
  //   } else {
  //     this.pageSizeChanged.emit(this.pageSize);
  //     this.prevRowsPerPageValue = this.pageSize;
  //     this.changeDetectionRef.detectChanges();
  //   }
  // }
  getCards() {
    //this.pageNumberInput = this.pageNumber;
    let params: HttpParams = new HttpParams();
    if (this.selectedTag.length >= 1)
      params = params.set('tags', this.selectedTag.toString());
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    if (this.selectedType.length >= 1)
      params = params.set('type', this.selectedType.toString());
    if (this.selectedAdapterInstance.length >= 1)
      params = params.set('instance', this.selectedAdapterInstance.toString());
    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);
    params = params.set('project', sessionStorage.getItem('organization'));
    params = params.set('isCached', true);
    this.service.getEndpointCards(params).subscribe((res) => {
      let data: any = [];
      let test = res;
      test.forEach((element: any) => {
        data.push(element);
        this.users.push(element.appName);
      });
      this.cards = data;
      if (this.cards.length == 0) {
        this.records = true;
      } else {
        this.records = false;
      }
      console.log('DATA', this.cards);

      // this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      // this.pageArr = [...Array(this.noOfPages).keys()];
    });
  //  this.pageSize = this.pageSize || 9;
    this.updateQueryParam(
      this.pageNumber,
      this.filter,
      this.selectedType.toString(),
      this.selectedAdapterInstance.toString()
    );
  }
  getCountModels() {
    let params: HttpParams = new HttpParams();
    if (this.selectedTag.length >= 1)
      params = params.set('tags', this.selectedTag.toString());
    if (this.selectedType.length >= 1)
      params = params.set('type', this.selectedType.toString());
    if (this.selectedAdapterInstance.length >= 1)
      params = params.set('instance', this.selectedAdapterInstance.toString());
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    params = params.set('project', sessionStorage.getItem('organization'));
    params = params.set('isCached', false);
    this.service.getCountEndpoint(params).subscribe((res) => {
      this.noOfItems = res;
      if(res){
        this.records = false;
      }
      else{
        this.records = true;
      }
    });
  }
  // optionChange(event: Event) {
  //   let i: number = event.target['selectedIndex'];
  //   this.pageSize = this.itemsPerPage[i];
  //   this.pageNumber = 1;
  //   this.getCards();
  // }

  fetchAdapterList() {
    let params: HttpParams = new HttpParams();
    if (this.selectedType.length >= 1)
      params = params.set('adapterType', this.selectedType.toString());
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.getEndpointListAdapters(params).subscribe((res) => {
      let test = res.body;
      this.alias = test.map((item: any) => item.alias);
      this.options = test;
      console.log(this.alias);
      console.log(this.options);
    });
  }
  // changedToogle(event:any){
  //   this.cardToggled = event;
  // }
  // desc(card:any) {
  //   this.cardToggled = !this.cardToggled;
  //   this.selectedCard=card;
  //   console.log(this.selectedCard);

  // }
  redirect() {
    // console.log('redirect');
    this.options.forEach((element: any) => {
      if (element.alias === this.selectedInstance) {
        this.selectedInstance = element.name;
      }
    });
    this.router.navigate(['./preview', this.cardTitle, this.selectedInstance], {
      relativeTo: this.route,
    });
  }
  numSequence(n: number): Array<number> {
    return Array(n);
  }
  // open(content: any): void {
  //   this.modalService.openModal(content, 'standard');
  // }
  // openedit(content: any): void {
  //   this.modalService.openModal(content, 'standard');
  // }
  selectChange(value: string): void {
    this.selectedInstance = value;
    this.redirect();
    // console.log(this.selectedInstance);
  }
  // editModel(card:any) {
  //   console.log(card);

  //   this.router.navigate(['./edit'], { queryParams: { data: card },relativeTo: this.route });
  // }

  clickactive(eventObj: any) {
    this.ledsLibService.clickactive(eventObj);
  }

  onSearch() {
    this.filtersService.changeText(this.searchText);
  }

  refresh() {
    this.getCountModels();
    this.fetchAdapterList();
    //this.changePage(1);
    this.resetPage(1);
    this.getCards();
  }
  refreshComplete() {
    this.filter='';
    this.getCountModels();
    this.fetchAdapterList();
    this.tagrefresh = true;
  //  this.changePage(1);
  this.resetPage(1);
    this.getCards();
  }
  handlePageAndSizeChange(event: { pageNumber: number; pageSize: number }) {
    // Handle the updated pageNumber and pageSize here
    console.log('Page number:', event.pageNumber);
    console.log('Page size:', event.pageSize);
    this.pageNumber=event.pageNumber;
    this.pageSize=event.pageSize;
    this.getCards();
  }

  filterz() {
    // setTimeout(() => {
    //   this.updatequeryParam(1, this.filter);
    //   this.refresh();
    // }, 1500);
    this.refresh();
  }

  tagSelectedEvent(event) {
    this.selectedAdapterInstance = event.getSelectedAdapterInstance();
    this.selectedType = event.getSelectedAdapterType();
    this.pageNumber = 1;
    this.selectedTag = event.getSelectedTagList();
    this.tagrefresh = false;
    this.refresh();
  }

  deleteEndpoint(card) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.service.deleteEndpoint(card.sourceId, card.adapterId).subscribe(
          (res) => {
            this.service.messageService(
              res,
              'Done!  Endpoint Deleted Successfully'
            );
            this.refresh();
            //this.telemetry.addTelemetryEvent(card.alias + " Deleted");
          },
          (error) => {
            this.service.messageService(error);
          }
        );
      }
    });
  }

  // selectedButton(i) {
  //   if (i == this.pageNumber) return { color: 'white', background: '#7b39b1' };
  //   else return { color: 'black' };
  // }
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
}
