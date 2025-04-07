import { HttpParams } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LedsLibService, LedsModalService } from 'leds-lib';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { Services } from '../../services/service';
//import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { DualListComponent } from 'angular-dual-listbox';
import { Location } from '@angular/common';
import { LeapTelemetryService } from 'com-lib-util';
import { PaginationComponent } from '../../pagination/pagination.component';
@Component({
  selector: 'app-dg-app',
  templateUrl: './dg-app.component.html',
  styleUrls: ['./dg-app.component.scss'],
})
export class DgAppComponent {
  cardTitle: String = 'DG App';
  ///  label:String="Select User Group"
  filter: string = '';
  servicev1 = 'dgApp';
  selectedAdapterInstance: string[] = [];
  selectedAdapterType: string[] = [];
  adapterInstanceList: any[];
  tagrefresh: boolean = false;
  selectedTag = [];
  // createAuth:boolean=true;
  // editAuth:boolean=true;
  // deleteAuth: boolean= true;
  createAuth: boolean;
  editAuth: boolean;
  deleteAuth: boolean;
  // pageNumber: number;
  // pageSize: number;
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
  alias = [];
  adapterInstance: any;
  instance: any;
  cards: any;
  selectedInstance: string;
  InstanceName: string;
  options: any;
  items: any = [];
  selectedUser: any[] = [];
  selectedApp = [];
  tagStatus = {};
  userGroups: any[] = [];
  pageNumber: number;
  pageSize: number;
  noOfItems: number;
  @ViewChild('pagination') paginationComponent:PaginationComponent;
  constructor(
    private modalService: LedsModalService,
    private ledsLibService: LedsLibService,
    private router: Router,
    private route: ActivatedRoute,
    private service: Services,
    private changeDetectionRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private telemetryService: LeapTelemetryService,
    private location: Location
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    this.refresh();
  }
  ngOnInit(): void {
    this.telemetryImpression();
  //  this.pageSize = this.itemsPerPage[0];
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
    //    this.pageNumber = 1;
        this.filter = '';
      }
    });
    this.fetchDGAdapters();
    this.getCountDg();
    setTimeout(() => {
      this.getList();
    }, 1000);
  //this.indexChanged();
  this.Authentications();
  }
  resetPage(page:number){
    this.paginationComponent.changePage(page);
  }

  telemetryImpression() {
    this.telemetryService.start();
    this.telemetryService.impression('aip-app', 'list', 'dgAppComponent');
  }

  Authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      if (cipAuthority.includes('dg-app-edit')) this.editAuth = true;
      if (cipAuthority.includes('dg-app-create')) this.createAuth = true;
      if (cipAuthority.includes('dg-app-delete')) this.deleteAuth = true;
    });
  }
  // indexChanged() {
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
  //     // this.updatequeryParam(this.pageNumber,this.filter);
  //     if (this.pageNumber > 5) {
  //       this.endIndex = this.pageNumber + 2;
  //       this.startIndex = this.endIndex - 3;
  //     } else {
  //       this.startIndex = 0;
  //       this.endIndex = 5;
  //     }
  //   }
  //   this.getList();
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
  clickactive(eventObj: any) {
    this.ledsLibService.clickactive(eventObj);
  }
  updateQueryParam(
    page: number = 1,
    search: string = '',
    type: string = '',
    adapterInstance: string = '',
    org: string = sessionStorage.getItem('organization'),
    roleId: string = JSON.parse(sessionStorage.getItem('role')).id
  ) {
    const url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          type: type,
          adapterInstance: adapterInstance,
          org: org,
          roleId: roleId,
        },
        queryParamsHandling: 'merge',
      })
      .toString();
    this.location.replaceState(url);
  }
  getAllDgAppList() {
    this.selectedApp = [];
    this.service.getDgappsList().subscribe((resp) => {
      resp.forEach((element: any) => {
        this.items.push(element);
        this.tagStatus[element.appName] = false;
      });
    });
    console.log('items', this.items);
  }
  fetchDGAdapters(): boolean {
    let params: HttpParams = new HttpParams();
    this.adapterInstanceList = [];
    if (this.selectedAdapterType.length >= 1)
      params = params.set('adapterType', this.selectedAdapterType.toString());
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.getDGAdapters(params).subscribe((res) => {
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
      // this.adapterInstance=this.adapterInstanceList[0].value;
      // console.log('dgInstanceList',this.adapterInstance);
    });
    return true;
  }
  getList() {
    let params: HttpParams = new HttpParams();
    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    if (this.selectedAdapterType.length >= 1) {
      params = params.set('type', this.selectedAdapterType.toString());
      //  this.setQueryParam('type',this.selectedAdapterType.toString());
    }
    if (this.selectedTag.length >= 1)
      params = params.set('tags', this.selectedTag.toString());
    if (this.selectedAdapterInstance.length >= 1) {
      this.instance = this.selectedAdapterInstance;
      params = params.set('instance', this.selectedAdapterInstance.toString());
      //  this.setQueryParam('Instance',this.selectedAdapterInstance.toString())
    }
    // else{
    //   this.instance=this.adapterInstance;
    //   params = params.set('adapter_instance', this.instance)
    //   }
    params = params.set('project', sessionStorage.getItem('organization'));
    params = params.set('isCached', true);
    //params =params.set('adapter_instance','DEMTSTDG33355')

    this.service.getDgAppList(params).subscribe((res: any) => {
      let data: any = [];
      res.forEach((element) => {
        data.push(element);
      });
      this.cards = data;
      console.log('appList', this.cards);
      // this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      // this.pageArr = [...Array(this.noOfPages).keys()];
      // console.log(this.pageArr, 'pageArr');
      // console.log(this.noOfPages, 'noOfPages');
    });
  //  this.pageSize = this.pageSize || 6;
    this.updateQueryParam(
      this.pageNumber,
      this.filter,
      this.selectedAdapterType.toString(),
      this.selectedAdapterInstance.toString()
    );
  }
  getCountDg() {
    let params: HttpParams = new HttpParams();
    if (this.selectedTag.length >= 1)
      params = params.set('tags', this.selectedTag.toString());
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    if (this.selectedAdapterType.length >= 1)
      params = params.set('type', this.selectedAdapterType.toString());
    if (this.selectedAdapterInstance.length >= 1)
      params = params.set('instance', this.selectedAdapterInstance.toString());
    params = params.set('project', sessionStorage.getItem('organization'));
    // params = params.set('isCached', false);
    this.service.getCountDgApp(params).subscribe((res) => {
      this.noOfItems = res;
    });
    console.log('count', this.noOfItems);
  }
  // optionChange(event: Event) {
  //   let i: number = event.target['selectedIndex'];
  //   this.pageSize = this.itemsPerPage[i];
  //   this.pageNumber = 1;
  //   this.getList();
  // }
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
  redirect() {
    this.options.forEach((element: any) => {
      if (element.alias === this.selectedInstance) {
        this.selectedInstance = element.name;
        this.InstanceName = element.instanceName;
      }
    });
    this.router.navigate(['./view', this.cardTitle, this.selectedInstance], {
      relativeTo: this.route,
      queryParams: { InstanceName: this.InstanceName },
    });
  }
  openModal(content: any): void {
    this.modalService.openModal(content, 'standard');
    //this.getAllDgAppList();
  }
  deleteDGApp(card: any) {
    let appId = card.appId;
    this.instance = card.adapterId;
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.service.deleteDGApp(appId, this.instance).subscribe(
          (res) => {
            this.service.messageService(
              res,
              'Done! DGApp Deleted Successfully'
            );
            this.refresh();
          },
          (error) => {
            this.service.messageService(error);
          }
        );
      }
    });
  }
  redirection(card: any, type: any) {
    this.router.navigate(['./' + type + '/' + card.appName], {
      queryParams: {
        page: this.pageNumber,
        search: this.filter,
        type: this.selectedAdapterType.toString(),
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
  redirectToAssignScreen(type: any) {
    this.router.navigate(['./' + type], {
      relativeTo: this.route,
    });
  }
  handlePageAndSizeChange(event: { pageNumber: number; pageSize: number }) {
    // Handle the updated pageNumber and pageSize here
    console.log('Page number:', event.pageNumber);
    console.log('Page size:', event.pageSize);
    this.pageNumber=event.pageNumber;
    this.pageSize=event.pageSize;
    this.getList();
  }
  filterz() {
    this.refresh();
  }
  refresh() {
    this.getCountDg();
    this.fetchDGAdapters();
  //  this.changePage(1);
  this.resetPage(1);
    this.getList();
  }
  refreshComplete() {
    this.filter = '';
    this.getCountDg();
    this.fetchDGAdapters();

  //  this.changePage(1);
  this.resetPage(1);
  this.tagrefresh = true;
    this.getList();
  }
  // setQueryParam(paramName:string,paramValue:string){
  //   this.router.navigate([],{
  //     relativeTo:this.route,
  //     queryParams:{
  //       [paramName]:paramValue
  //     },
  //     queryParamsHandling: 'merge',
  //   });

  // }

  closeModal() {
    this.modalService.dismissAll();
  }
  filterByTag(tag) {
    console.log('tag', tag);
    this.tagStatus[tag.appName] = !this.tagStatus[tag.appName];
    if (!this.tagStatus[tag.appName]) {
      const index = this.selectedApp.findIndex((ele) => ele.appId == tag.appId);
      this.selectedApp.splice(index, 1);
    } else {
      this.selectedApp.push(tag);
    }
    console.log(this.selectedApp, 'selectedApp after filter');
  }
  onSelect(event: any) {
    //  this.label="";
    this.selectedUser = event;
    console.log('selected', this.selectedUser);
  }
  // selectedButton(i) {
  //   if (i == this.pageNumber) return { color: 'white', background: '#7b39b1' };
  //   else return { color: 'black' };
  // }
}
