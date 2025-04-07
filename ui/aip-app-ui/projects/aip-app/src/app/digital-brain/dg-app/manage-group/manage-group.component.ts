import { HttpParams } from '@angular/common/http';
import { Component, ChangeDetectorRef, EventEmitter, Output, SimpleChanges, SimpleChange, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LedsModalService, LedsLibService } from 'leds-lib';
import { ConfirmDeleteDialogComponent } from '../../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { UserProjectRole } from '../../../models/user-project-role';
import { PaginationComponent } from '../../../pagination/pagination.component';
import { RoleService } from '../../../services/role.service';
import { Services } from '../../../services/service';

@Component({
  selector: 'app-manage-group',
  templateUrl: './manage-group.component.html',
  styleUrls: ['./manage-group.component.scss']
})
export class ManageGroupComponent {
  button: string = 'Create';
  cardTitle: string = 'Manage Group'
  editAuth: boolean = true;
  deleteAuth: boolean = true;
  alias = '';
  searchTerm = '';
  userName: any[] = [];
  userData: any[] = [];
  userDetails: any[] = [];
  selectedUserId: any;
  filter = '';
  groupName: any;
  createAuth: boolean = true;
  showCreateForm: boolean = false;
  dgEngRoleId: any;
  tempUserProjectRole = new UserProjectRole();
  showEditScreen: boolean = true;
  userGroups: any[] = [];
  errorMessage: string;
  payload: any;
  pageNumber: number;
  pageSize: number;
  noOfItems: number;
  @ViewChild('pagination') paginationComponent:PaginationComponent;
  constructor(
    private service: Services,
    private dialog: MatDialog,
    private modalService: LedsModalService,
    public roleSerive: RoleService,
    private router: Router,
    private route: ActivatedRoute,
    private changeDetectionRef: ChangeDetectorRef,
    private ledsLibService: LedsLibService,


  ) { }
  ngOnChange(changes: SimpleChanges):void{
    console.log('change',changes);
  }

  ngOnInit(): void {
    this.getRoleId();
    this.getCountUserGroups();
    setTimeout(() => {
      this.getDGEngineerList();
      // this.getListUserGroup();
      this.getList();
    }, 1000);
  //  this.indexChanged();
  }
  resetPage(page:number){
    this.paginationComponent.changePage(page);
  }
  getRoleId() {
    let tempUserProjectRole = new UserProjectRole();
    this.roleSerive.getRoleList(tempUserProjectRole).subscribe((res) => {
      console.log('userRes', res);
      res.content.forEach((item) => {
        if (item.name == 'DG Engineer') {
          this.dgEngRoleId = item.id
        }
      })
      console.log('roleId', this.dgEngRoleId);
    });
  }
  getList() {
    let params: HttpParams = new HttpParams();
    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.getUserGroup(params).subscribe((res: any) => {
      this.userGroups = [];
      res.forEach((group) => {
        this.userGroups.push(group);
      })
    });
  }
  clickactive(eventObj: any) {
    this.ledsLibService.clickactive(eventObj);
  }
  getCountUserGroups() {
    let params: HttpParams = new HttpParams();
    if (this.filter.length >= 1) params = params.set('query', this.filter);
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.getCountUserGroup(params).subscribe((res) => {
      this.noOfItems = res;
    });
    console.log('count', this.noOfItems);
  }
  getDGEngineerList() {
    // this.dgEngRoleId='138';
    this.service.getListDgEngineer(this.dgEngRoleId).subscribe((res: any) => {
      this.userData = res;
      res.forEach((user) => {
        this.userName.push({
          viewValue: user.userFName,
          value: user.userId
        });
      })
      console.log('userRes', this.userName);
      console.log('data', this.userData);

    })
  }

  onSelect($event) {
    this.selectedUserId = $event;
    console.log('selectedUserId', this.selectedUserId);
  }
  createGroup() {
    let filterUserData = this.userData.filter(user => this.selectedUserId.includes(user.userId));
    console.log('filterData', filterUserData);
    console.log('alias', this.alias);
    this.service.registerUserGroup(this.alias, filterUserData).subscribe((resp) => {
      console.log('res', resp);
      if (resp.status == 200) {
        this.refreshComplete();
        this.service.messageService(resp, "Done! UserGroup  is Created.");
      }
    }, error => { this.service.messageService(error); })

  }
  close() {
    this.showCreateForm = !this.showCreateForm;
  }
  addGroup() {
    this.showCreateForm = !this.showCreateForm;
  }
  closeModal() {
    this.modalService.dismissAll();
  }
  openModal(content: any, group: any): void {
    console.log('group', group);
    this.groupName = group.groupName;
    this.userDetails = [];
    group.userDetails.forEach((user) => {
      this.userDetails.push(user)
    })
    console.log('userDetails', this.userDetails);
    this.modalService.openModal(content, 'standard');
  }
  deleteGroup(userGroup: any) {
    console.log('user', userGroup);
    this.groupName = userGroup.groupName;
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.service.deleteUserGroup(this.groupName).subscribe((res) => {
          this.service.messageService(res, "Done! UserGroup Deleted Successfully");
          this.refreshComplete();
        }, error => { this.service.messageService(error); });
      }
    });
  }
  redirection(group: any, type: any) {
    this.router.navigate(['./' + type + '/' + group.groupName + '/' + this.dgEngRoleId], {
      state: {
        group,
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
  this.getList();
}
  filterz() {
    this.getCountUserGroups();
  //  this.changePage(1);
  this.getList();
  }
  // refresh() {
  //   this.changePage(this.pageNumber);
  //   // this.getList();
  // }
  refreshComplete() {
    this.showCreateForm = false;
    this.alias = '';
    this.filter = "";
    this.userGroups = [];
    this.resetPage(1);
    this.getCountUserGroups();
  //  this.changePage(1);
     this.getList();
    //this.getListUserGroup();
  }
}
