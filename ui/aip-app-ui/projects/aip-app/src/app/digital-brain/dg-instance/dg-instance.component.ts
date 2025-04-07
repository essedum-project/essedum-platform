import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LedsLibService } from 'leds-lib';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { Services } from '../../services/service';
import { Location } from '@angular/common';
import { PaginationComponent } from '../../pagination/pagination.component';

@Component({
  selector: 'app-dg-instance',
  templateUrl: './dg-instance.component.html',
  styleUrls: ['./dg-instance.component.scss'],
})
export class DgInstanceComponent {
  cardTitle: String = 'Thoughts';
  filter: string = '';
  createAuth: boolean;
  editAuth: boolean;
  deleteAuth: boolean;
  publishAuth: boolean;
  servicev1 = 'dgTool';
  selectedAppId = [];
  selectedAdapterType: string[] = [];
  tagrefresh: boolean = false;
  selectedTag = [];
  selectedApp = [];
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
  alias: any[] = [];
  assignedAppList: any[] = [];
  tagStatus = {};
  cards: any[] = [];
  pageNumber: number;
  pageSize: number;
  noOfItems: number;
  @ViewChild('pagination') paginationComponent:PaginationComponent;

  constructor(
    private ledsLibService: LedsLibService,
    private router: Router,
    private route: ActivatedRoute,
    private service: Services,
    private changeDetectionRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private location: Location
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    this.refresh();
  }
  ngOnInit(): void {
    //this.pageSize = this.itemsPerPage[0];
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['page']) {
        this.pageNumber = params['page'];
        this.filter = params['search'];
        this.selectedAppId = params['id'] ? params['id'].split(',') : [];
      } else {
        //this.pageNumber = 1;
        this.filter = '';
      }
    });
    this.fetchAssignedApp();
    this.updateQueryParam(this.pageNumber);
    setTimeout(() => {
      this.getCountDgTool();
      this.getToolList();
    }, 1000);
  //  this.indexChanged();
    this.Authentications();
  }
  Authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      if (cipAuthority.includes('dg-instance-create')) this.createAuth = true;
      if (cipAuthority.includes('dg-instance-edit')) this.editAuth = true;
      if (cipAuthority.includes('dg-instance-delete')) this.deleteAuth = true;
      if (cipAuthority.includes('dg-instance-publish')) this.publishAuth = true;
    });
  }
  resetPage(page:number){
    this.paginationComponent.changePage(page);
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
  //   this.getToolList();
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
  fetchAssignedApp() {
    this.assignedAppList = [];
    let param: HttpParams = new HttpParams();
    let userDetails = sessionStorage.getItem('user');
    param = param.set('user_id', JSON.parse(userDetails).id);
    param = param.set('user_email', JSON.parse(userDetails).user_email);
    param = param.set('project', sessionStorage.getItem('organization'));
    this.service.getAssignedApp(param).subscribe((res) => {
      this.alias = res.map((item: any) => item.appName);
      console.log('alias', this.alias);

      res.forEach((element: any) => {
        this.tagStatus[element.appName] = false;
        this.assignedAppList.push({
          category: 'Instance',
          label: element.appName,
          value: element.appId,
          selected: false,
        });
      });
      console.log('res', this.assignedAppList);
      // this.selectedAppId.push(this.assignedAppList[0].value);
    });
  }
  getToolList() {
    let params: HttpParams = new HttpParams();
    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    if (this.selectedAppId.length >= 1) {
      params = params.set('app_id', this.selectedAppId.toString());
    } else {
      params = params.set('app_id', this.assignedAppList[0].value);
    }
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.getDgToolList(params).subscribe((res: any) => {
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
      this.selectedAppId.toString()
    );
  }
  getCountDgTool() {
    let params: HttpParams = new HttpParams();
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    if (this.selectedAppId.length >= 1) {
      params = params.set('app_id', this.selectedAppId.toString());
    } else {
      params = params.set('app_id', this.assignedAppList[0].value);
    }
    params = params.set('project', sessionStorage.getItem('organization'));
    // params = params.set('isCached', false);
    this.service.getCountDGTool(params).subscribe((res) => {
      this.noOfItems = res;
    });
    console.log('count', this.noOfItems);
  }
  // optionChange(event: Event) {
  //   let i: number = event.target['selectedIndex'];
  //   this.pageSize = this.itemsPerPage[i];
  //   this.pageNumber = 1;
  //   this.getToolList();
  // }
  // tagSelectedEvent(event) {
  //   //  this.selectedAdapterInstance = event.getSelectedAdapterInstance();
  //   this.selectedAdapterType = event.getSelectedAdapterType();
  //   this.pageNumber = 1;
  //   this.selectedTag = event.getSelectedTagList();
  //   this.tagrefresh = false;
  //   this.refresh();
  // }
  updateQueryParam(
    page: number = 1,
    search: string = '',
    appId: string = '',
    org: string = sessionStorage.getItem('organization'),
    roleId: string = JSON.parse(sessionStorage.getItem('role')).id
  ) {
    const url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          id: appId,
          org: org,
          roleId: roleId,
        },
        queryParamsHandling: 'merge',
      })
      .toString();
    this.location.replaceState(url);
  }

  deleteDGTool(card: any) {
    let toolName = card.toolName;
    // this.instance= card.adapterId;
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.service.deleteDGTool(toolName).subscribe(
          (res) => {
            this.service.messageService(
              res,
              'Done! Thoughts Deleted Successfully'
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
  publishDGTool(card: any) {}
  selectChange(val: any): void {
    this.selectedApp.push({
      Name: val.label,
      Id: val.value,
    });
    console.log('selectedApp', this.selectedApp);
    this.redirect();
  }
  redirect() {
    const navigationExtras: NavigationExtras = {
      queryParams: { App: JSON.stringify(this.selectedApp) },
      relativeTo: this.route,
    };
    this.router.navigate(['./view', this.cardTitle], navigationExtras);
  }
  redirection(card: any, type: any) {
    this.router.navigate(['./' + type + '/' + card.toolName], {
      queryParams: {
        page: this.pageNumber,
        search: this.filter,
        id: this.selectedAppId.toString(),
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
  handlePageAndSizeChange(event: { pageNumber: number; pageSize: number }) {
    // Handle the updated pageNumber and pageSize here
    console.log('Page number:', event.pageNumber);
    console.log('Page size:', event.pageSize);
    this.pageNumber=event.pageNumber;
    this.pageSize=event.pageSize;
    this.getToolList();
  }
  refresh() {
    this.getCountDgTool();
    // this.fetchAssignedApp();
  //  this.changePage(1);
    this.getToolList();
  }
  filterz() {
    this.refresh();
  }
  refreshComplete() {
    this.filter = '';
    this.getCountDgTool();
    this.fetchAssignedApp();
    this.tagrefresh = true;
  //  this.changePage(1);
  this.resetPage(1);
    this.getToolList()
  }
  filterAppById(tag) {
    console.log('tag', tag);
    this.tagStatus[tag.label] = !this.tagStatus[tag.label];
    if (!this.tagStatus[tag.label]) {
      const index = this.selectedAppId.findIndex(
        (ele) => ele.value == tag.value
      );
      this.selectedAppId.splice(index, 1);
    } else {
      this.selectedAppId.push(tag.value);
    }
    console.log(this.selectedAppId, 'selectedApp after filter');
    // this.router.navigate([],{queryParams:{app:JSON.stringify(this.selectedAppId)}});
    this.getCountDgTool();
    this.getToolList();
    //this.changeDetectionRef.detectChanges();
  }
  // selectedButton(i) {
  //   if (i == this.pageNumber) return { color: 'white', background: '#7b39b1' };
  //   else return { color: 'black' };
  // }

}
