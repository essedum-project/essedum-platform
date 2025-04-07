//
// Copyright © 2016-2017 Infosys Limited, Bangalore, India. All Rights Reserved.
// * Except for any open source software components embedded in this
// * Infosys proprietary software program (Program), this Program is protected
// * by copyright laws, international treaties and other pending or existing
// * intellectual property rights in India, the United States and other countries.
// * Except as expressly permitted, any unauthorized reproduction, storage,
// * transmission in any form or by any means (including without limitation
// * electronic, mechanical, printing, photocopying, recording or otherwise),
// * or any distribution of this Program, or any portion of it,
// * may result in severe civil and criminal penalties, and
// * will be prosecuted to the maximum extent possible under the law.
// Template pack-angular:web/src/app/base-entities/entity-detail.component.ts.e.vm
//
import {
  Component,
  Input,
  Output,
  OnChanges,
  EventEmitter,
  SimpleChanges,
  OnInit,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { PageResponse } from "../../support/paging";
import { MessageService } from "../../services/message.service";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ConfirmDeleteDialogComponent } from "../../support/confirm-delete-dialog.component";
import { HelperService } from "../../services/helper.service";
import { FormControl } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { RoleService } from "../../services/role.service";
import { Usertouser } from "../../models/user-user";
import { UseruserService } from "../../services/user-user.service";
import { UsersService } from '../../services/users.service';
import { LeapTelemetryService } from "../../telemetry-util/telemetry.service";
import { Role } from "../../models/role";
import { UsmPermissions } from "../../models/usm-permissions";
import { Project } from "../../models/project";
import { DeleteComponent } from "../../shared-modules/confirm-delete/delete.component";
import { Subscription } from "rxjs/Subscription";
import { IampUsmService } from "../../iamp-usm.service";
// import { DashConstantService } from "../../services/dash-constant.service";
import { DashConstant } from "../../models/dash-constant";
import { Users } from '../../models/users';


@Component({
  selector: 'lib-user-user',
  templateUrl: './user-user.component.html',
  styleUrls: ['./user-user.component.css']
})
export class UserUserComponent implements OnInit {
  @Input() header = "UsmRolePermissions...";
  @Input() selectedUser: Users;
  @Output() changeView: EventEmitter<boolean> = new EventEmitter();
  @Input() sub: boolean = false;
  @Output() onAddNewClicked = new EventEmitter();
  p: number;
  @ViewChild("myInput", { static: false }) myInputReference: ElementRef;
  usmRolePermissionsToDelete: Usertouser;
  UsertouserdetailList: MatTableDataSource<any>;

  displayedColumns: string[] = ["id", "role", "module",  "actions"];

  private paginator: MatPaginator;
  private sort: MatSort;
  busy: Subscription;
  exampleUser:Users
  // widgetSettingsArray: DashConstant[];
  widgetsSettingsAll:any[]=[];
  selectedWidgetSettings:any[]=[];
  dashconstant: DashConstant;
  @ViewChild(MatSort, { static: false }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatPaginator, { static: false }) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  setDataSourceAttributes() {
    if (this.UsertouserdetailList) {
      this.UsertouserdetailList.paginator = this.paginator;
      this.UsertouserdetailList.sort = this.sort;
    }
  }

  example: Usertouser = new Usertouser();
  examplepermission: UsmPermissions = new UsmPermissions();
  examplerole: Role = new Role();
  // list is paginated
  currentPage: PageResponse<Usertouser> = new PageResponse<Usertouser>(0, 0, []);

  //foreign key dependencies

  constructor(
    public router: Router,
    public messageService: MessageService,
    public confirmDeleteDialog: MatDialog,
    public confirmDialog: MatDialog,
    public helperService: HelperService,
    private route: ActivatedRoute,
    public useruserService: UseruserService,
    public roleservice: RoleService,
    private usersService:UsersService,
    private telemetryService: LeapTelemetryService,
    private usmService: IampUsmService,
    // public dashConstantService: DashConstantService,
  ) {}

  //Temps
  testCreate: boolean = false;
  testId: number;

  filteruserlist: any = { role: "All", module: "All" };
  searchedName: string = "All";
  showCreate: boolean = false;
  usertouserlist = new Array<Usertouser>();
  usertouserlistcopyarray = new Array<Usertouser>();
  showList: boolean = true;
  view: boolean = false;
  buttonFlag: boolean = false;
  usertouserPermissions: boolean = false;
  edit: boolean = false;
  lazyload = { first: 0, rows: 5000, sortField: null, sortOrder: null };
  usertouseritem = new Usertouser();
  currentUsmRolePermissions = new Usertouser();
  selected = new FormControl(0);
  rolearray: any[] = [];
  userlistarray: any[] = [];
  array: any[] = [];
  auth: string = "";
  isAuth: boolean = true;
  editFlag: boolean = false;
  viewFlag: boolean = true;
  deleteFlag: boolean = false;
  createFlag: boolean = false;
  permissionList: any[];
  selectedPermissionList: any[];
  usmtousermappingarray = new Array<Usertouser>();
  existingUsertousermappings = new Array<Usertouser>();
  existingUsertousermapping: MatTableDataSource<any>;
  displayColumns: string[] = ["name", "description"];
  errorMessage: boolean = false;
  // permissionarray: any[] = [];
  // permissionarraycopy: any[] = [];
  dbsViewFlag:boolean=false;

  ngOnInit() {
    this.telemetryImpression();
    // this.fetchrole();
    this.fetchmodule();
    // this.fetchdashconstants();
    if (sessionStorage.getItem("usmAuthority")) {
      sessionStorage.removeItem("usmAuthority");
      this.auth = "";
    }
    this.usmService.getPermission("usm").subscribe(
      (resp) => {
        this.permissionList = JSON.parse(resp);
        let temp = "";
        if (this.permissionList.length >= 1) {
          this.permissionList.forEach((ele) => {
            temp += "" + ele.permission + ",";
          });
          temp = temp.substring(0, temp.length - 1);
          sessionStorage.setItem("usmAuthority", temp);
        } else {
          sessionStorage.setItem("usmAuthority", "");
        }
      },
      (error) => {},
      () => {
        this.auth = sessionStorage.getItem("usmAuthority");
        this.selectedPermissionList = this.auth.split(",");
        this.selectedPermissionList.forEach((ele) => {
          if (ele === "edit") {
            this.editFlag = true;
          }
          if (ele === "view") {
            this.viewFlag = true;
          }
          if (ele === "delete") {
            this.deleteFlag = true;
          }
          if (ele === "create") {
            this.createFlag = true;
          }
        });
      }
    );
      this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
  }
  // fetchdashconstants() {
  //   let dashconstant = new DashConstant();
  //   dashconstant.keys="widgetSettingsdefault"
  //   this.dashConstantService.findAll(dashconstant, this.lazyload).subscribe((res) => {
  //       let response= res.content;
  //       this.widgetSettingsArray=response;
  //       this.widgetSettingsArray.forEach((ele,index)=>{
  //         if(index==0)
  //           this.widgetsSettingsAll=ele.value.split(',');
  //       })
  //   })
  // }

  //  fetcharray(event) {
  //   const temp: String[] = [];
  //   event.forEach((element) => {
  //    temp.push(element._name);
  //   });
  //   this.target = temp;
  //  }

  // fetchrole() {
  //   this.rolearray = [];
  //   this.examplerole.projectId = null;
  //   this.roleservice.findAll(this.examplerole, this.lazyload).subscribe((response) => {
  //     let project: Project;
  //     try {
  //       project = JSON.parse(sessionStorage.getItem("project"));
  //     } catch (e) {
  //       project = null;
  //       console.error("JSON.parse error - ", e.message);
  //     }
  //     this.rolearray = response.content;
  //     // let projectid = project.id;
  //     // this.rolearray = response.content.filter((role) => role.projectId == null || role.projectId == projectid);
  //     this.rolearray=response.content.filter((role) => role.id!=8);
  //     this.rolearray = this.rolearray.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
  //   });

  //   this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
  // }

  fetchmodule() {
    this.userlistarray = [];
    this.array = [];
    // this.busy=this.usersService.findAll(this.exampleUser,this.lazyloadevent).subscribe(res=>{
    this.exampleUser=new Users();
    this.usersService.findAll(this.exampleUser, this.lazyload).subscribe((response) => {
      let project: Project;
      try {
        project = JSON.parse(sessionStorage.getItem("project"));
      } catch (e) {
        project = null;
        console.error("JSON.parse error - ", e.message);
      }
      this.userlistarray = response.content;
      // this.userlistarray = this.userlistarray.filter(
      //   (arr, index, self) =>
      //     index === self.findIndex((t) => t.module === arr.module && t.permission === arr.permission)
      // );
      this.userlistarray = this.userlistarray.sort((a, b) =>
        a.user_f_name.toLowerCase() > b.user_f_name.toLowerCase() ? 1 : -1
      );
    });
  }

  telemetryImpression() {
    this.telemetryService.impression("iamp-usm", "list", "UsmRolePermissionComponent");
  }

  listView() {
    this.showCreate = false;
    this.changeView.emit(true);
    this.view = false;
    this.edit = false;
    this.usertouserPermissions = false;
    this.existingUsertousermapping=null;
    this.errorMessage=false;
    this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
    // this.router.navigate(["../../"], { relativeTo: this.route });
  }
  checkUsmRolePermissions() {
    this.existingUsertousermappings = new Array<Usertouser>();
    this.usertouserlist.forEach((element) => {
      this.usmtousermappingarray.forEach((ele) => {
        if (
          element.childUserId.id == ele.childUserId.id &&
          element.parentUserId.id == ele.parentUserId.id
        ) {
          this.existingUsertousermappings.push(element);
        }
      });
    });
    if (this.existingUsertousermappings.length >= 1) {
      this.existingUsertousermapping = new MatTableDataSource(this.existingUsertousermappings);
      this.errorMessage = true;
      return true;
    } else {
      return false;
    }
  }

  onSave() {
    let project: Project;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e) {
      project = null;
      console.error("JSON.parse error - ", e.message);
    }
    // this.usertouseritem.projectId = project.id;
    // let array = [];
    // this.target.forEach((e) => {
    //  for (let i = 0; i < this.permissionarray.length; i++) {
    //   if (this.permissionarray[i].name == e) {
    //    array.push(this.permissionarray[i]);
    //   }
    //  }
    // });
    // try {
    //  this.usertouseritem.permission = JSON.stringify(array);
    // } catch (e) {
    //  console.error("JSON.stringify error - ", e.message);
    // }
    this.errorMessage = false;
    let temp: any = this.usertouseritem.childUserId;
    let arr = []
    if(temp.length)
    arr=temp.filter(
      (item) =>
        item.user_f_name == this.selectedUser.user_f_name 
    );
    if (this.usertouseritem.childUserId == undefined || this.usertouseritem.childUserId == null) {
      this.messageService.error("Please Select User", "LEAP");
    } 
    else if (arr.length>0 || (!temp.length && temp.user_f_name==this.selectedUser.user_f_name)) {
      this.messageService.error("Parent and Child User cannot be same", "LEAP");
    } 
     else {
      if (this.edit) this.updateWave();
      else {
        this.usmtousermappingarray = new Array<Usertouser>();
        let temp: Usertouser = new Usertouser();
        let permissions: any = this.usertouseritem.childUserId;
        if (permissions.length > 1) {
          permissions.forEach((element) => {
            temp.parentUserId = this.selectedUser;
            temp.childUserId = element;
            this.usmtousermappingarray.push(temp);
            temp = new Usertouser();
          });
        } else {
          temp.parentUserId = this.selectedUser
          temp.childUserId = this.usertouseritem.childUserId[0]
          this.usmtousermappingarray.push(temp);
        }
        let flag: boolean = false;
        flag = this.checkUsmRolePermissions();
        // let arr = this.usertouserlist.filter(
        //   (item) =>
        //     item.role.id == this.usertouseritem.role.id &&
        //     item.permission.module == this.usertouseritem.permission.module &&
        //     item.permission.permission == this.usertouseritem.permission.permission
        // );
        // if (arr.length > 0) {
        //   this.messageService.error("Duplicate Role Permission cannot be created", "IAMP");
        //   return;
        // }
        if (!flag) {
          this.busy = this.useruserService.createAll(this.usmtousermappingarray).subscribe(
            (response) => {
              this.messageService.info("User-user Mapping Saved Successfully", "LEAP");
              this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
              this.clearWave();
              this.showCreate = false;
              this.testCreate = true;
              this.errorMessage = false;
              this.listView();
            },
            (error) => {
              this.testCreate = false;
              this.messageService.error("Could not create User-user Mapping", "LEAP");
            }
          );
        } else {
          this.messageService.info(
            "Could not save " + this.existingUsertousermappings.length + " Mapping(s) Already Exists",
            "IAMP"
          );
        }
      }
    }
  }

  getallusers(that) {
    this.useruserService.getUseruser(that).subscribe((res) => {
      this.usertouseritem = res;
      let project:any
      try {
        project = JSON.parse(sessionStorage.getItem("project"));
      } catch (e) {
        project = null;
        console.error("JSON.parse error - ", e.message);
      }
      if(this.dbsViewFlag){
    //   this.dashConstantService.getDashConsts(project).subscribe((res) => {
    //     this.widgetSettingsArray=res.filter((item) => (item.keys == this.usertouseritem.role.name+"dbsViewSettingsdefault"));
    //     this.widgetSettingsArray.forEach((ele,index)=>{
    //       if(index==0){  
    //         this.dashconstant=ele;
    //         this.selectedWidgetSettings=JSON.parse(ele.value)

    //         }
    //     })
    // })
  }
      // this.filterPermission();
    });
  }
  //  viewroute(n) {
  //   if (n == 1) {
  //    this.changeView.emit(false);
  //    this.view = false;
  //    this.edit = true;
  //    this.showCreate = true;
  //    this.buttonFlag = false;
  //    this.router.navigate(["../../" + this.usertouseritem.id + "/" + false], { relativeTo: this.route });
  //   } else {
  //    this.view = true;
  //    this.edit = true;
  //    this.usertouserPermissions = true;
  //    this.changeView.emit(false);
  //    this.showCreate = true;
  //    this.buttonFlag = true;
  //    this.router.navigate(["../../" + this.usertouseritem.id + "/" + true], { relativeTo: this.route });
  //   }
  //  }

  showDeleteDialog(rowData: any) {
    let usmRolePermissionsToDelete: Usertouser = <Usertouser>rowData;

    let dialogRef = this.confirmDeleteDialog.open(DeleteComponent, {
      disableClose: true,
      data: {
        title: "Delete User-User Mapping",
        message: "Are you sure you want to delete?",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "yes") {
        this.delete(usmRolePermissionsToDelete);
      }
    });
  }

  editUsertouser(usmRolePermissions: Usertouser) {
    this.changeView.emit(false);
    this.view = false;
    this.edit = true;
    this.showCreate = true;
    this.usertouseritem = usmRolePermissions;
    this.buttonFlag = false;
    this.router.navigate(["./" + usmRolePermissions.id + "/" + false], { relativeTo: this.route });
    this.getallusers(usmRolePermissions.id);

  }

  view_usertouser(usmRolePermissions: Usertouser) {
    this.view = true;
    this.edit = true;
    this.usertouserPermissions = true;
    this.changeView.emit(false);
    this.showCreate = true;
    this.buttonFlag = true;
    this.currentUsmRolePermissions = usmRolePermissions;
    this.usertouseritem = usmRolePermissions;
    this.router.navigate(["./" + usmRolePermissions.id + "/" + true], { relativeTo: this.route });
    this.getallusers(usmRolePermissions.id);
  }

  createView() {
    this.showCreate = true;
    this.edit = false;
    this.usertouseritem = new Usertouser();
    this.changeView.emit(false);
    this.router.navigate(["./create/permission"], { relativeTo: this.route });
  }

  loadPage(event) {
    this.useruserService.findAll(this.example, event).subscribe(
      (pageResponse) => {
        pageResponse.content = pageResponse.content.sort((a, b) =>
          a.childUserId.user_f_name.toLowerCase() > b.childUserId.user_f_name.toLowerCase() ? 1 : -1
        );
        this.currentPage = pageResponse
        let temparray=[]
        this.currentPage.content.forEach(element => {
          if(element.parentUserId.user_f_name==this.selectedUser.user_f_name)
          temparray.push(element)
        });
        this.usertouserlist = temparray
        this.usertouserlistcopyarray = temparray
        this.UsertouserdetailList = new MatTableDataSource(temparray);
        this.UsertouserdetailList.paginator = this.paginator;
        this.UsertouserdetailList.sort = this.sort;

        if (this.currentPage.totalPages > 0) this.testCreate = true;
      },
      (error) => {
        this.testCreate = false;
        this.messageService.error("Could not get the results", "LEAP");
      }
    );
  }

  updateWave() {
    let arr = this.usertouserlist.filter(
      (item) =>
        item.id != this.usertouseritem.id &&
        item.childUserId.id == this.usertouseritem.childUserId.id &&
        item.parentUserId.id == this.usertouseritem.parentUserId.id 
    );
    if (arr.length > 0) {
      this.messageService.error("Duplicate User to user mapping cannot be created", "IAMP");
      return;
    } else {
      this.busy = this.useruserService.update(this.usertouseritem).subscribe(
        (rs) => {
          this.testId = rs.id;
          this.testCreate = true;
          this.messageService.info("User-user Mapping updated successfully", "LEAP");
          this.clearWave();
          this.showCreate = false;
          this.listView();
        },
        (error) => {
          this.testCreate = false;
          this.messageService.error("Could not update", "LEAP");
        }
      );
    }
  }

  delete(usmRolePermissionsToDelete: Usertouser) {
    let id = usmRolePermissionsToDelete.id;
    this.useruserService.delete(id).subscribe(
      (response) => {
        this.testCreate = true;
        this.currentPage.remove(usmRolePermissionsToDelete);
        this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
        this.messageService.info("User-user Mapping Deleted successfully", "LEAP!");
        this.Clear();
      },
      (error) => {
        this.testCreate = false;
        this.messageService.error("Could not delete!", "LEAP");
      }
    );
  }
  clearWave() {
    if (this.edit || this.view) {
      this.usertouseritem.childUserId = null;
      this.errorMessage = false;
    } else {
      this.usertouseritem = new Usertouser();
      this.errorMessage = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 && o1.id == o2.id;
  }

  compareObjects1(o1: any, o2: any): boolean {
    return o1 && o2 && o1.permission == o2.permission;
  }

  Search() {
    let newtasks = Object.assign([], this.usertouserlistcopyarray);
    if (this.filteruserlist == "All") {
      newtasks = this.usertouserlistcopyarray;
    }
    if (this.filteruserlist != "All") {
      newtasks = newtasks.filter(
        (item1) => item1.childUserId.user_f_name.toLowerCase() == this.filteruserlist.user_f_name.toLowerCase()
      );
    }
    this.usertouserlist = newtasks;
    this.UsertouserdetailList = new MatTableDataSource(this.usertouserlist);
    this.UsertouserdetailList.sort = this.sort;
    this.UsertouserdetailList.paginator = this.paginator;
  }
  Clear() {
    this.filteruserlist = "All";

    this.myInputReference.nativeElement.value = null;
    this.usertouserlist = this.usertouserlistcopyarray;
    this.UsertouserdetailList = new MatTableDataSource(this.usertouserlistcopyarray);
    this.UsertouserdetailList.sort = this.sort;
    this.UsertouserdetailList.paginator = this.paginator;
  }
  assignCopy() {
    this.usertouserlist = Object.assign([], this.usertouserlistcopyarray);
  }
  filterItem(value) {
    if (!value) {
      this.assignCopy();
    }
    this.usertouserlist = Object.assign([], this.usertouserlistcopyarray).filter(
      (item1) => item1.childUserId.user_f_name.toLowerCase().indexOf(value.toLowerCase()) > -1
    );
    this.UsertouserdetailList = new MatTableDataSource(this.usertouserlist);
    this.UsertouserdetailList.sort = this.sort;
    this.UsertouserdetailList.paginator = this.paginator;
  }
  checkEnterPressed(event: any, val: any) {
    if (event.keyCode === 13) {
      this.filterItem(event.srcElement.value);
    }
  }
  trackByMethod(index, item) {}
}
