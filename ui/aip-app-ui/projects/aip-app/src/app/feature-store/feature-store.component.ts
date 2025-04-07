import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LedsLibService, LedsModalService } from 'leds-lib';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { Services } from '../services/service';
import { LeapTelemetryService } from 'com-lib-util';
import { PaginationComponent } from '../pagination/pagination.component';
import { Location } from '@angular/common';
@Component({
  selector: 'app-feature-store',
  templateUrl: './feature-store.component.html',
  styleUrls: ['./feature-store.component.scss']
})
export class FeatureStoreComponent implements OnInit, OnChanges {

  cardTitle: String = 'FeatureStore';
  cardToggled: boolean = true;
  servicev1 = 'featurestore';
  selectedAdapterType: string[] = [];
  selectedAdapterInstance: string[] = [];
  createAuth: boolean = true;
  selectedCard: any = [];
  editAuth: boolean;
  deleteAuth: boolean;
  deployAuth: boolean;
  // pageSize: number;
  // pageNumber: number;
  // pageArr: number[] = [];
  // pageNumberInput: number;
  // noOfPages: number = 0;
  // prevRowsPerPageValue: number;
  // itemsPerPage: number[] = [6, 9, 18, 36, 54, 72];
  // noOfItems: number;
  // @Output() pageChanged = new EventEmitter<any>();
  // @Output() pageSizeChanged = new EventEmitter<any>();
  // endIndex: number;
  // startIndex: number;
  // pageNumberChanged: boolean = true;
  tagrefresh: boolean = false;
  filter: string = '';
  selectedTag = [];
  users: any = [];
  options = [];
  selectedInstance: any;
  instance: any;
  cards: any;
  storeName: any;
  alias = [];
  adapterInstanceList: any[];
  adapterInstance: any;
  isExpanded = false;
  tooltip: string = 'above';
  pageNumber: number;
  pageSize: number;
  noOfItems: number;
  @ViewChild('pagination') paginationComponent: PaginationComponent;
  records: boolean = false;
  constructor(
    private telemetryService: LeapTelemetryService,
    private modalService: LedsModalService,
    private service: Services,
    private ledsLibService: LedsLibService,
    private router: Router,
    private route: ActivatedRoute,
    private changeDetectionRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private location: Location
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    this.refresh();
  }
  ngOnInit(): void {
    this.telemetryImpression();
    //  this.pageSize = this.itemsPerPage[0];
    //  this.pageNumber = 1;
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['page']) {
        this.pageNumber = params['page'];
        this.filter = params['search'];
        this.selectedAdapterType = params['type']
          ? params['type'].split(',')
          : [];
        this.selectedAdapterInstance = params['adapterInstance']
          ? params['adapterInstance'].split(',')
          : [];
      } else {
        //  this.pageNumber = 1;
        this.filter = '';
      }
    });
    this.updateQueryParam(this.pageNumber);
    this.records = false;
    console.log(this.cards);
    this.Authentications();
    this.fetchFSAdapters();
    setTimeout(() => {
      this.getCards();
      this.getCountFSList();
    }, 1000);
    //  this.indexChanged();

  }

  telemetryImpression() {
    this.telemetryService.start();
    this.telemetryService.impression("aip-app", "list", "FeatureStoreComponent");
  }

  Authentications() {

    this.service.getPermission("cip").subscribe((cipAuthority) => {
      //featureStore-create permission
      if (
        cipAuthority.includes('featureStore-create')
      )
        this.createAuth = true;
      // featureStore-edit/update permission
      if (
        cipAuthority.includes('featureStore-edit')
      )
        this.editAuth = true;
      // featureStore-delete permission
      if (
        cipAuthority.includes('featureStore-delete')
      )
        this.deleteAuth = true;
    }, (error) => {
      console.log(`error when calling getPermission method. Error Details:${error}`);
    })
  }
  resetPage(page: number) {
    this.paginationComponent.changePage(page);
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
          org: org,
          roleId: roleId,
        },
        queryParamsHandling: 'merge',
      })
      .toString();

    this.location.replaceState(url);
  }
  // indexChanged(){
  //   if (this.pageNumber && this.pageNumber >= 5) {
  //     this.endIndex = this.pageNumber + 2;
  //     this.startIndex = this.endIndex - 5;
  //   } else {
  //     this.startIndex = 0;
  //     this.endIndex = 5;
  //   }
  // }
  // nextPage() {
  //   if (this.pageNumber + 1 <= this.noOfPages) {
  //     this.pageNumber += 1;
  //     this.changePage(this.pageNumber);
  //   }
  // }  
  // prevPage() {
  //   if (this.pageNumber - 1 >= 1) {
  //     this.pageNumber -= 1;
  //     this.changePage(this.pageNumber);
  //   }
  // }
  // changePage(page?: number) {
  //   if (page && page >= 1 && page <= this.noOfPages) this.pageNumber = page;
  //   if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
  //     this.pageChanged.emit(this.pageNumber);
  //     //this.updatequeryParam(this.pageNumber,this.filter);
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
  fetchFSAdapters(): boolean {
    let params: HttpParams = new HttpParams();
    this.adapterInstanceList = [];
    this.selectedAdapterInstance = [];
    if (this.selectedAdapterType.length >= 1)
      params = params.set('adapterType', this.selectedAdapterType.toString());
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.getFeastAdapters(params).subscribe((res) => {
      let test = res.body;
      this.alias = test.map((item: any) => item.alias);
      this.options = test;
      test.forEach((element: any) => {
        this.adapterInstanceList.push({
          category: 'Instance',
          label: element.alias,
          value: element.name,
          selected: false,
        });
      });
      this.adapterInstance = this.adapterInstanceList[0].value;
    });
    return true;
  }
  getCards(): void {
    //  this.pageNumberInput = this.pageNumber;
    let params: HttpParams = new HttpParams();
    if (this.selectedTag.length >= 1)
      params = params.set('tags', this.selectedTag.toString());
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    if (this.selectedAdapterType.length >= 1)
      params = params.set('type', this.selectedAdapterType.toString());
    if (this.selectedAdapterInstance.length >= 1) {
      this.instance = this.selectedAdapterInstance;
      params = params.set('instance', this.instance);
    }
    else {
      this.instance = this.adapterInstance;
      params = params.set('instance', this.instance)
    }
    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);
    params = params.set('project', sessionStorage.getItem('organization'));
    params = params.set('isCached', true);

    this.service.getFeatureStoreCards(params).subscribe((res) => {
      let data: any = [];
      res.forEach((element: any) => {
        data.push(element);
        //this.users.push(element.appName);      
      });
      this.cards = data;
      if (this.cards.length == 0) {
        this.records = true;
      } else {
        this.records = false;
      }
      // this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      // this.pageArr = [...Array(this.noOfPages).keys()];
    });
    //  this.pageSize = this.pageSize || 6;
    this.updateQueryParam(
      this.pageNumber,
      this.filter,
      this.selectedAdapterType.toString(),
      this.instance.toString()
    );
  }
  // count the features Store List
  getCountFSList() {
    let params: HttpParams = new HttpParams();
    if (this.selectedTag.length >= 1)
      params = params.set('tags', this.selectedTag.toString());
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    if (this.selectedAdapterType.length >= 1)
      params = params.set('type', this.selectedAdapterType.toString());
    if (this.selectedAdapterInstance.length >= 1)
      params = params.set('instance', this.selectedAdapterInstance.toString());
    params = params.set('project', sessionStorage.getItem('organization'));
    params = params.set('isCached', false);
    this.service.getCountFSList(params).subscribe((res) => {
      this.noOfItems = res;
      if (res) {
        this.records = false;
      } else {
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
  open(content: any): void {
    this.modalService.openModal(content, 'standard');
  }

  openedit(content: any): void {
    this.modalService.openModal(content, 'standard');
  }
  changedToogle(event: any) {
    this.cardToggled = event;
  }
  redirect() {
    this.options.forEach((element: any) => {
      if (element.alias === this.selectedInstance) {
        this.selectedInstance = element.name;
      }
    });
    this.router.navigate(['./view', this.cardTitle, this.selectedInstance], { relativeTo: this.route });
  }
  redirection(card: any, type: string) {
    this.router.navigate(['./' + type + '/' + card.featureStoreId['sourceName']], {
      // state: {
      //   card ,
      // },
      // relativeTo: this.route,
      queryParams: {
        page: this.pageNumber,
        search: this.filter,
        adapterType: this.selectedAdapterType.toString(),
        adapterInstance: this.selectedAdapterInstance.toString(),
        org: sessionStorage.getItem('organization'),
        roleId: JSON.parse(sessionStorage.getItem('role')).id,
      },
      queryParamsHandling: 'merge',
      state: {
        card,
      },
      relativeTo: this.route,
    });
  }
  clickactive(eventObj: any) {
    this.ledsLibService.clickactive(eventObj);
  }
  refresh() {
    this.fetchFSAdapters();
    this.getCountFSList();
    this.resetPage(1);
    this.getCards();
  }
  refreshComplete() {
    this.filter = "";
    this.getCountFSList();
    this.fetchFSAdapters();
    this.tagrefresh = true;
    this.resetPage(1);
    //  this.changePage(1);
    this.getCards();

  }
  filterz() {
    this.refresh();
  }
  handlePageAndSizeChange(event: { pageNumber: number; pageSize: number }) {
    // Handle the updated pageNumber and pageSize here
    console.log('Page number:', event.pageNumber);
    console.log('Page size:', event.pageSize);
    this.pageNumber = event.pageNumber;
    this.pageSize = event.pageSize;
    this.cards = [];
    this.getCards();
    this.getCountFSList();
  }

  tagSelectedEvent(event) {
    this.selectedAdapterInstance = event.getSelectedAdapterInstance();
    this.selectedAdapterType = event.getSelectedAdapterType();
    this.pageNumber = 1;
    this.selectedTag = event.getSelectedTagList();
    this.tagrefresh = false;
    this.refresh();
  }
  selectChange(value: string): void {
    this.selectedInstance = value;
    this.redirect();
  }
  //Delete Feature Store
  deleteFeatureStore(card) {
    let storeName = card.name;
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.service.deleteFeatureStore(storeName, this.instance).subscribe((res) => {
          this.service.messageService(res, "Done! FeatureStore Deleted Successfully");
          this.refresh();
        }, error => { this.service.messageService(error); });
      }
    });
  }
  selectedButton(i) {
    if (i == this.pageNumber) return { color: 'white', background: '#7b39b1' };
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
}
