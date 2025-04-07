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
import { UsmRolePermissions } from "../../models/usm-role-permissions";
import { UsmRolePermissionsService } from "../../services/usm-role-permissions.service";
import { UsmPermissionsService } from "../../services/usm-permission.service";
import { LeapTelemetryService } from "../../telemetry-util/telemetry.service";
import { Role } from "../../models/role";
import { UsmPermissions } from "../../models/usm-permissions";
import { Project } from "../../models/project";
import { DeleteComponent } from "../../shared-modules/confirm-delete/delete.component";
import { Subscription } from "rxjs/Subscription";
import { IampUsmService } from "../../iamp-usm.service";
import { DashConstantService } from "../../services/dash-constant.service";
import { DashConstant } from "../../models/dash-constant";

@Component({
  templateUrl: "./usm-role-permission.component.html",
  selector: "lib-usm-role-permission",
})
export class UsmRolePermissionComponent implements OnInit {
  @Input() header = "UsmRolePermissions...";
  @Output() changeView: EventEmitter<boolean> = new EventEmitter();
  @Input() sub: boolean = false;
  @Output() onAddNewClicked = new EventEmitter();
  p: number;
  @ViewChild("myInput", { static: false }) myInputReference: ElementRef;
  usmRolePermissionsToDelete: UsmRolePermissions;
  UsmRolePermissionsList: MatTableDataSource<any>;

  displayedColumns: string[] = ["id", "role", "module", "permission", "actions"];

  private paginator: MatPaginator;
  private sort: MatSort;
  busy: Subscription;
  widgetSettingsArray: DashConstant[];
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
    if (this.UsmRolePermissionsList) {
      this.UsmRolePermissionsList.paginator = this.paginator;
      this.UsmRolePermissionsList.sort = this.sort;
    }
  }

  example: UsmRolePermissions = new UsmRolePermissions();
  examplepermission: UsmPermissions = new UsmPermissions();
  examplerole: Role = new Role();
  // list is paginated
  currentPage: PageResponse<UsmRolePermissions> = new PageResponse<UsmRolePermissions>(0, 0, []);

  //foreign key dependencies

  constructor(
    public router: Router,
    public messageService: MessageService,
    public confirmDeleteDialog: MatDialog,
    public confirmDialog: MatDialog,
    public helperService: HelperService,
    private route: ActivatedRoute,
    public usmRolePermissionsService: UsmRolePermissionsService,
    public roleservice: RoleService,
    public usmPermissionService: UsmPermissionsService,
    private telemetryService: LeapTelemetryService,
    private usmService: IampUsmService,
    public dashConstantService: DashConstantService,
  ) {}

  //Temps
  testCreate: boolean = false;
  testId: number;

  filterUsmRolePermissions: any = { role: "All", module: "All" };
  searchedName: string = "All";
  showCreate: boolean = false;
  usmRolePermissionss = new Array<UsmRolePermissions>();
  usmRolePermissionssCopy = new Array<UsmRolePermissions>();
  showList: boolean = true;
  view: boolean = false;
  buttonFlag: boolean = false;
  viewUsmRolePermissions: boolean = false;
  edit: boolean = false;
  lazyload = { first: 0, rows: 5000, sortField: null, sortOrder: null };
  usmRolePermissions = new UsmRolePermissions();
  currentUsmRolePermissions = new UsmRolePermissions();
  selected = new FormControl(0);
  rolearray: any[] = [];
  modulepermissionarray: any[] = [];
  array: any[] = [];
  auth: string = "";
  isAuth: boolean = true;
  editFlag: boolean = false;
  viewFlag: boolean = true;
  deleteFlag: boolean = false;
  createFlag: boolean = false;
  permissionList: any[];
  selectedPermissionList: any[];
  usmRolePermissionsArray = new Array<UsmRolePermissions>();
  existingUsmRolePermissions = new Array<UsmRolePermissions>();
  existingUsmRolePermission: MatTableDataSource<any>;
  displayColumns: string[] = ["name", "description", "actions"];
  errorMessage: boolean = false;
  // permissionarray: any[] = [];
  // permissionarraycopy: any[] = [];
  dbsViewFlag:boolean=false;

  ngOnInit() {
    this.telemetryImpression();
    this.fetchrole();
    this.fetchmodule();
    this.fetchdashconstants();
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
    if (window.location.href.includes("permissionlist") && window.location.href.includes("true")) {
      //  this.usmRolePermissionsService.findAllPermissions(this.examplepermission, this.lazyload).subscribe((response)
      //=> {
      //   this.permissionarray = response.content;
      //   this.permissionarray = this.permissionarray.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1
      //: -1));
      this.showCreate = true;
      this.edit = true;
      this.view = true;
      this.viewUsmRolePermissions = true;
      this.buttonFlag = true;
      // var that = this;
      // this.getUsmRolePermissionss(that).then((value) => {
      this.route.params.subscribe((res) => {
        this.getUsmRolePermissionss(Number(window.atob(res.id)));
        //   that.currentUsmRolePermissions = value.filter((usmRolePermissions) => usmRolePermissions.id == res.id).pop
        //();
        //   that.usmRolePermissions = value.filter((usmRolePermissions) => usmRolePermissions.id == res.id).pop();
        //  });
        //  try {
        //   this.target = JSON.parse(this.usmRolePermissions.permission);
        //  } catch (e) {
        //   console.error("JSON.parse error - ", e.message);
        //  }
      });
      //  });
    } else if (window.location.href.includes("permissionlist") && window.location.href.includes("false")) {
      //  this.usmRolePermissionsService.findAllPermissions(this.examplepermission, this.lazyload).subscribe((response)
      //=> {
      //   this.permissionarray = response.content;
      //   this.permissionarray = this.permissionarray.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1
      //: -1));
      this.showCreate = true;
      this.edit = true;
      this.view = false;
      this.buttonFlag = false;
      // var that = this;
      // this.getUsmRolePermissionss(that).then((value) => {
      this.route.params.subscribe((res) => {
        this.getUsmRolePermissionss(Number(window.atob(res.id)));
        //   that.currentUsmRolePermissions = value.filter((usmRolePermissions) => usmRolePermissions.id == res.id).pop
        //();
        //   that.usmRolePermissions = value.filter((usmRolePermissions) => usmRolePermissions.id == res.id).pop();
        //  });
        //  try {
        //   JSON.parse(this.usmRolePermissions.permission).forEach((element) => {
        //    this.target.push(element.name);
        //   });
        //   this.permissionarray.forEach((ele) => {
        //    if (!JSON.parse(this.usmRolePermissions.permission).includes(ele)) {
        //     this.source.push(ele.name);
        //    }
        //   });
        //  } catch (e) {
        //   console.error("JSON.parse error - ", e.message);
        //  }
        // });
      });
    } else if (window.location.href.includes("permissionlist") && window.location.href.includes("create")) {
      //  this.usmRolePermissionsService.findAllPermissions(this.examplepermission, this.lazyload).subscribe((response)
      //=> {
      //   this.permissionarray = response.content;
      //   this.permissionarray = this.permissionarray.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1
      //: -1));

      // this.permissionarray.forEach((e) => this.source.push(e.name));

      this.showCreate = true;
      this.edit = false;
      this.usmRolePermissions = new UsmRolePermissions();
      this.changeView.emit(false);
      //  });
    } else {
      this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
    }
  }
  fetchdashconstants() {
    let dashconstant = new DashConstant();
    dashconstant.keys="widgetSettingsdefault"
    this.dashConstantService.findAll(dashconstant, this.lazyload).subscribe((res) => {
        let response= res.content;
        this.widgetSettingsArray=response;
        this.widgetSettingsArray.forEach((ele,index)=>{
          if(index==0)
            this.widgetsSettingsAll=ele.value.split(',');
        })
    })
  }

  //  fetcharray(event) {
  //   const temp: String[] = [];
  //   event.forEach((element) => {
  //    temp.push(element._name);
  //   });
  //   this.target = temp;
  //  }

  fetchrole() {
    this.rolearray = [];
    this.examplerole.projectId = null;
    this.roleservice.findAll(this.examplerole, this.lazyload).subscribe((response) => {
      let project: Project;
      try {
        project = JSON.parse(sessionStorage.getItem("project"));
      } catch (e) {
        project = null;
        console.error("JSON.parse error - ", e.message);
      }
      this.rolearray = response.content;
      // let projectid = project.id;
      // this.rolearray = response.content.filter((role) => role.projectId == null || role.projectId == projectid);
      this.rolearray=response.content.filter((role) => role.id!=8);
      this.rolearray = this.rolearray.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
    });

    this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
  }

  fetchmodule() {
    this.modulepermissionarray = [];
    this.array = [];
    this.usmPermissionService.findAll(this.examplepermission, this.lazyload).subscribe((response) => {
      let project: Project;
      try {
        project = JSON.parse(sessionStorage.getItem("project"));
      } catch (e) {
        project = null;
        console.error("JSON.parse error - ", e.message);
      }
      this.modulepermissionarray = response.content;
      this.modulepermissionarray = this.modulepermissionarray.filter(
        (arr, index, self) =>
          index === self.findIndex((t) => t.module === arr.module && t.permission === arr.permission)
      );
      this.modulepermissionarray = this.modulepermissionarray.sort((a, b) =>
        a.module.toLowerCase() > b.module.toLowerCase() ? 1 : -1
      );
      // this.permissionarray = response.content;
      // this.permissionarray = this.permissionarray.filter(
      //   (arr, index, self) => index === self.findIndex((t) => t.permission === arr.permission)
      // );
      // this.permissionarray = this.permissionarray.sort((a, b) => (a.permission.toLowerCase() > b.permission.
      //toLowerCase() ? 1 : -1));
      // this.permissionarraycopy=this.permissionarray;
    });
    // this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
  }

  telemetryImpression() {
    this.telemetryService.impression("iamp-usm", "list", "UsmRolePermissionComponent");
  }

  listView() {
    this.showCreate = false;
    this.changeView.emit(true);
    this.view = false;
    this.edit = false;
    this.viewUsmRolePermissions = false;
    this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
    this.router.navigate(["../../"], { relativeTo: this.route });
  }
  checkUsmRolePermissions() {
    this.existingUsmRolePermissions = new Array<UsmRolePermissions>();
    this.usmRolePermissionss.forEach((element) => {
      this.usmRolePermissionsArray.forEach((ele) => {
        if (
          element.role.id == ele.role.id &&
          element.permission.module == ele.permission.module &&
          element.permission.permission == ele.permission.permission
        ) {
          this.existingUsmRolePermissions.push(element);
        }
      });
    });
    if (this.existingUsmRolePermissions.length >= 1) {
      this.existingUsmRolePermission = new MatTableDataSource(this.existingUsmRolePermissions);
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
    // this.usmRolePermissions.projectId = project.id;
    // let array = [];
    // this.target.forEach((e) => {
    //  for (let i = 0; i < this.permissionarray.length; i++) {
    //   if (this.permissionarray[i].name == e) {
    //    array.push(this.permissionarray[i]);
    //   }
    //  }
    // });
    // try {
    //  this.usmRolePermissions.permission = JSON.stringify(array);
    // } catch (e) {
    //  console.error("JSON.stringify error - ", e.message);
    // }
    this.errorMessage = false;
    if (this.usmRolePermissions.role == undefined || this.usmRolePermissions.role == null) {
      this.messageService.error("Please Select A Role", "LEAP");
    } else if (
      this.usmRolePermissions.permission == undefined ||
      this.usmRolePermissions.permission == null
    ) {
      this.messageService.error("Please Select A Module and Permission", "LEAP");
    } else {
      if (this.edit) this.updateWave();
      else {
        this.usmRolePermissionsArray = new Array<UsmRolePermissions>();
        let temp: UsmRolePermissions = new UsmRolePermissions();
        let permissions: any = this.usmRolePermissions.permission;
        if (permissions.length > 1) {
          permissions.forEach((element) => {
            temp.permission = element;
            temp.permission.module = element.module;
            temp.permission.permission = element.permission;
            temp.role = this.usmRolePermissions.role;
            this.usmRolePermissionsArray.push(temp);
            temp = new UsmRolePermissions();
          });
        } else {
          temp.permission = this.usmRolePermissions.permission[0];
          temp.permission.module = this.usmRolePermissions.permission[0].module;
          temp.permission.permission = this.usmRolePermissions.permission[0].permission;
          temp.role = this.usmRolePermissions.role;
          this.usmRolePermissionsArray.push(temp);
        }
        let flag: boolean = false;
        flag = this.checkUsmRolePermissions();
        // let arr = this.usmRolePermissionss.filter(
        //   (item) =>
        //     item.role.id == this.usmRolePermissions.role.id &&
        //     item.permission.module == this.usmRolePermissions.permission.module &&
        //     item.permission.permission == this.usmRolePermissions.permission.permission
        // );
        // if (arr.length > 0) {
        //   this.messageService.error("Duplicate Role Permission cannot be created", "IAMP");
        //   return;
        // }
        if (!flag) {
          this.busy = this.usmRolePermissionsService.createAll(this.usmRolePermissionsArray).subscribe(
            (response) => {
              this.messageService.info("Role-Permissions Saved Successfully", "LEAP");
              this.saveDashConstant();
              this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
              this.clearWave();
              this.showCreate = false;
              this.testCreate = true;
              this.errorMessage = false;
              this.listView();
            },
            (error) => {
              this.testCreate = false;
              this.messageService.error("Could not create Role-Permissions", "LEAP");
            }
          );
        } else {
          this.messageService.info(
            "Could not save " + this.existingUsmRolePermissions.length + " Mapping(s) Already Exists",
            "IAMP"
          );
        }
      }
    }
  }

  getUsmRolePermissionss(that) {
    this.usmRolePermissionsService.getUsmRolePermissions(that).subscribe((res) => {
      this.usmRolePermissions = res;
      if(this.usmRolePermissions.permission.module=="dbs" && this.usmRolePermissions.permission.permission=="view"){
        this.dbsViewFlag=true;
      }
      let project:any
      try {
        project = JSON.parse(sessionStorage.getItem("project"));
      } catch (e) {
        project = null;
        console.error("JSON.parse error - ", e.message);
      }
      if(this.dbsViewFlag){
      this.dashConstantService.getDashConsts(project).subscribe((res) => {
        this.widgetSettingsArray=res.filter((item) => (item.keys == this.usmRolePermissions.role.name+"dbsViewSettingsdefault"));
        this.widgetSettingsArray.forEach((ele,index)=>{
          if(index==0){  
            this.dashconstant=ele;
            this.selectedWidgetSettings=JSON.parse(ele.value)

            }
        })
    })
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
  //    this.router.navigate(["../../" + this.usmRolePermissions.id + "/" + false], { relativeTo: this.route });
  //   } else {
  //    this.view = true;
  //    this.edit = true;
  //    this.viewUsmRolePermissions = true;
  //    this.changeView.emit(false);
  //    this.showCreate = true;
  //    this.buttonFlag = true;
  //    this.router.navigate(["../../" + this.usmRolePermissions.id + "/" + true], { relativeTo: this.route });
  //   }
  //  }

  showDeleteDialog(rowData: any) {
    let usmRolePermissionsToDelete: UsmRolePermissions = <UsmRolePermissions>rowData;

    let dialogRef = this.confirmDeleteDialog.open(DeleteComponent, {
      disableClose: true,
      data: {
        title: "Delete Role Permission",
        message: "Are you sure you want to delete?",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "yes") {
        this.delete(usmRolePermissionsToDelete);
      }
    });
  }

  editUsmRolePermissions(usmRolePermissions) {
    this.changeView.emit(false);
    this.view = false;
    this.edit = true;
    this.showCreate = true;
    this.usmRolePermissions = usmRolePermissions;
    this.buttonFlag = false;
    this.router.navigate(["./" + window.btoa(usmRolePermissions.id) + "/" + false], { relativeTo: this.route });
  }

  view_UsmRolePermissions(usmRolePermissions) {
    this.view = true;
    this.edit = true;
    this.viewUsmRolePermissions = true;
    this.changeView.emit(false);
    this.showCreate = true;
    this.buttonFlag = true;
    this.currentUsmRolePermissions = usmRolePermissions;
    this.usmRolePermissions = usmRolePermissions;
    this.router.navigate(["./" + window.btoa(usmRolePermissions.id) + "/" + true], { relativeTo: this.route });
  }

  createView() {
    this.showCreate = true;
    this.edit = false;
    this.usmRolePermissions = new UsmRolePermissions();
    this.changeView.emit(false);
    this.router.navigate(["./create/permission"], { relativeTo: this.route });
  }

  loadPage(event) {
    this.usmRolePermissionsService.findAll(this.example, event).subscribe(
      (pageResponse) => {
        pageResponse.content = pageResponse.content.sort((a, b) =>
          a.role.name.toLowerCase() > b.role.name.toLowerCase() ? 1 : -1
        );
        (this.currentPage = pageResponse), (this.usmRolePermissionss = this.currentPage.content);
        this.usmRolePermissionssCopy = this.usmRolePermissionss;
        this.UsmRolePermissionsList = new MatTableDataSource(this.currentPage.content);
        this.UsmRolePermissionsList.paginator = this.paginator;
        this.UsmRolePermissionsList.sort = this.sort;

        if (this.currentPage.totalPages > 0) this.testCreate = true;
      },
      (error) => {
        this.testCreate = false;
        this.messageService.error("Could not get the results", "LEAP");
      }
    );
  }

  updateWave() {
    let arr = this.usmRolePermissionss.filter(
      (item) =>
        item.id != this.usmRolePermissions.id &&
        item.role.id == this.usmRolePermissions.role.id &&
        item.permission.module == this.usmRolePermissions.permission.module &&
        item.permission.permission == this.usmRolePermissions.permission.permission
    );
    if (arr.length > 0) {
      this.messageService.error("Duplicate Role Permission cannot be created", "IAMP");
      return;
    } else {
      this.busy = this.usmRolePermissionsService.update(this.usmRolePermissions).subscribe(
        (rs) => {
          this.testId = rs.id;
          this.testCreate = true;
          this.updateDashConstant();
          this.messageService.info("Role-Permission updated successfully", "LEAP");
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

  delete(usmRolePermissionsToDelete: UsmRolePermissions) {
    let id = usmRolePermissionsToDelete.id;
    this.usmRolePermissionsService.delete(id).subscribe(
      (response) => {
        this.testCreate = true;
        this.deletedashconstant(usmRolePermissionsToDelete)
        this.currentPage.remove(usmRolePermissionsToDelete);
        this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
        this.messageService.info("Role-Permission Deleted successfully", "LEAP!");
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
      this.usmRolePermissions.permission = null;
      this.usmRolePermissions.role = null;
      this.errorMessage = false;
    } else {
      this.usmRolePermissions = new UsmRolePermissions();
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
    let newtasks = Object.assign([], this.usmRolePermissionssCopy);
    if (this.filterUsmRolePermissions.role == "All" && this.filterUsmRolePermissions.module == "All") {
      newtasks = this.usmRolePermissionssCopy;
    }
    if (this.filterUsmRolePermissions.role != "All") {
      newtasks = newtasks.filter(
        (item1) => item1.role.name.toLowerCase() == this.filterUsmRolePermissions.role.name.toLowerCase()
      );
    }
    if (this.filterUsmRolePermissions.module != "All") {
      newtasks = newtasks.filter(
        (item1) =>
          item1.permission.module.toLowerCase() ==
            this.filterUsmRolePermissions.module.module.toLowerCase() &&
          item1.permission.permission.toLowerCase() ==
            this.filterUsmRolePermissions.module.permission.toLowerCase()
      );
    }
    this.usmRolePermissionss = newtasks;
    this.UsmRolePermissionsList = new MatTableDataSource(this.usmRolePermissionss);
    this.UsmRolePermissionsList.sort = this.sort;
    this.UsmRolePermissionsList.paginator = this.paginator;
  }
  Clear() {
    this.filterUsmRolePermissions.role = "All";
    this.filterUsmRolePermissions.module = "All";
    this.myInputReference.nativeElement.value = null;
    this.usmRolePermissionss = this.usmRolePermissionssCopy;
    this.UsmRolePermissionsList = new MatTableDataSource(this.usmRolePermissionssCopy);
    this.UsmRolePermissionsList.sort = this.sort;
    this.UsmRolePermissionsList.paginator = this.paginator;
  }
  assignCopy() {
    this.usmRolePermissionss = Object.assign([], this.usmRolePermissionssCopy);
  }
  filterItem(value) {
    if (!value) {
      this.assignCopy();
    }
    this.usmRolePermissionss = Object.assign([], this.usmRolePermissionssCopy).filter(
      (item1) => item1.role.name.toLowerCase().indexOf(value.toLowerCase()) > -1
    );
    this.UsmRolePermissionsList = new MatTableDataSource(this.usmRolePermissionss);
    this.UsmRolePermissionsList.sort = this.sort;
    this.UsmRolePermissionsList.paginator = this.paginator;
  }
  checkEnterPressed(event: any, val: any) {
    if (event.keyCode === 13) {
      this.filterItem(event.srcElement.value);
    }
  }
  trackByMethod(index, item) {}
  // filterPermission(){
  //   this.permissionarray=this.permissionarraycopy.filter(item=>item.module==this.usmRolePermissions.permission.
  //module)
  // }
  permissionCheck(event){
    let flag : boolean=false;
    let permissions: any = this.usmRolePermissions.permission
    if (permissions.length >= 1) {
      permissions.forEach(element => {
        if(element.module=="dbs" && element.permission=="view")
        flag = true;
      });
    }
    if(flag)
      this.dbsViewFlag= true;
    else
      this.dbsViewFlag = false;
  }
  updatepermissionCheck(event){
    let flag : boolean=false;
    let permissions: any = this.usmRolePermissions.permission
    if(permissions && permissions.module=="dbs" && permissions.permission=="view")
      flag = true;
    if(flag)
      this.dbsViewFlag= true;
    else
      this.dbsViewFlag = false;
  }
  saveDashConstant(){
    let project: Project;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e) {
      project = null;
      console.error("JSON.parse error - ", e.message);
    }
    let dashConstant:DashConstant=new DashConstant();
    dashConstant.keys=this.usmRolePermissions.role.name+"dbsViewSettingsdefault";
    dashConstant.value=JSON.stringify(this.selectedWidgetSettings);
    dashConstant.project_id= new Project({ id: project.id });
    dashConstant.project_name = project.name;
    this.busy = this.dashConstantService.create(dashConstant).subscribe(
      (response) => {
        this.messageService.info("Configuration for Dbs-view added successfully", "LEAP!");
      },
      (error) => {
        this.messageService.error("Could not Add Configuration for Dbs-view!", "LEAP");
      }
      );
  }
  updateDashConstant(){
    let project: Project;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e) {
      project = null;
      console.error("JSON.parse error - ", e.message);
    }
    if(this.dashconstant)
      this.dashconstant.value=JSON.stringify(this.selectedWidgetSettings);
    else{
      this.dashconstant=new DashConstant();
      this.dashconstant.keys=this.usmRolePermissions.role.name+"dbsViewSettingsdefault";
      this.dashconstant.value=JSON.stringify(this.selectedWidgetSettings);
      this.dashconstant.project_id= new Project({ id: project.id });
      this.dashconstant.project_name = project.name;
    }
    this.busy = this.dashConstantService.update(this.dashconstant).subscribe(
      (response) => {
        this.messageService.info("Configuration for Dbs-view updated successfully", "LEAP!");
      },
      (error) => {
        this.messageService.error("Could not Add Configuration for Dbs-view!", "LEAP");
      });
    
  }
  deletedashconstant(usmRolePermissionsToDelete){
    let project: Project;
    let dbsViewFlag:boolean = false;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e) {
      project = null;
      console.error("JSON.parse error - ", e.message);
    }
    if(usmRolePermissionsToDelete.permission.module=="dbs" && usmRolePermissionsToDelete.permission.permission=="view"){
      dbsViewFlag=true;
    }
    if(dbsViewFlag){
    this.dashConstantService.getDashConsts(project).subscribe((res) => {
      let widgetSettingsArray=res.filter((item) => (item.keys == usmRolePermissionsToDelete.role.name+"dbsViewSettingsdefault"));
      widgetSettingsArray.forEach((ele,index)=>{
        if(index==0){  
          this.dashConstantService.delete(ele.id).subscribe((res)=>{
            this.messageService.info("Configuration for Dbs-view deleted successfully", "LEAP!");
          },
          (error) => {
            this.messageService.error("Could not delete Configuration for Dbs-view!", "LEAP");
          });
          }
      })
  })
}

  }
}
