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
    OnDestroy
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
  import { Roletorole } from "../../models/role-role";
  import { RoleroleService } from "../../services/role-role.service";
  import { LeapTelemetryService } from "../../telemetry-util/telemetry.service";
  import { Role } from "../../models/role";
  import { UsmPermissions } from "../../models/usm-permissions";
  import { Project } from "../../models/project";
  import { DeleteComponent } from "../../shared-modules/confirm-delete/delete.component";
  import { Subscription } from "rxjs";
  import { IampUsmService } from "../../iamp-usm.service";
  // import { DashConstantService } from "../../services/dash-constant.service";
  import { DashConstant } from "../../models/dash-constant";
  import { Users } from '../../models/users';
import { OpenTelemetryService } from "../../telemetry-util/open-telemetry.service";
  
  
  @Component({
    selector: 'lib-role-role',
    templateUrl: './role-role.component.html',
    styleUrls: ['./role-role.component.css']
  })
  export class RoleRoleComponent implements OnInit, OnDestroy {
    @Input() selectedRole: Role;
    @Input() header = "UsmRolePermissions...";
    @Output() changeView: EventEmitter<boolean> = new EventEmitter();
    @Input() sub: boolean = false;
    @Output() onAddNewClicked = new EventEmitter();
    p: number;
    @ViewChild("myInput", { static: false }) myInputReference: ElementRef;
    usmRolePermissionsToDelete: Roletorole;
    roletorolelistcopy: MatTableDataSource<any>;
  
    displayedColumns: string[] = ["id", "role", "module",  "actions"];
  
    private paginator: MatPaginator;
    private sort: MatSort;
    busy: Subscription;
    exampleUser:Users
    example1: Roletorole = new Roletorole();
    example: Role = new Role();
    // widgetSettingsArray: DashConstant[];
    widgetsSettingsAll:any[]=[];
    selectedWidgetSettings:any[]=[];
    dashconstant: DashConstant;
    roletoroleitem: Roletorole;
    @ViewChild(MatSort, { static: false }) set matSort(ms: MatSort) {
      this.sort = ms;
      this.setDataSourceAttributes();
    }
  
    @ViewChild(MatPaginator, { static: false }) set matPaginator(mp: MatPaginator) {
      this.paginator = mp;
      this.setDataSourceAttributes();
    }
  
    setDataSourceAttributes() {
      if (this.roletorolelistcopy) {
        this.roletorolelistcopy.paginator = this.paginator;
        this.roletorolelistcopy.sort = this.sort;
      }
    }
  
    // example: Role = new Role();
    examplepermission: UsmPermissions = new UsmPermissions();
    examplerole: Roletorole = new Roletorole();
    // list is paginated
    currentPage: PageResponse<Roletorole> = new PageResponse<Roletorole>(0, 0, []);
  
    //foreign key dependencies
  
    constructor(
      public router: Router,
      public messageService: MessageService,
      public confirmDeleteDialog: MatDialog,
      public confirmDialog: MatDialog,
      public helperService: HelperService,
      private route: ActivatedRoute,
      public roleroleService: RoleroleService,
      public roleservice: RoleService,
      private telemetryService: LeapTelemetryService,
      private usmService: IampUsmService,
      private openTelemetryService: OpenTelemetryService
      // public dashConstantService: DashConstantService,
    ) {}
  
    //Temps
    testCreate: boolean = false;
    testId: number;
  
    filterroletorole: any = { role: "All", module: "All" };
    searchedName: string = "All";
    showCreate: boolean = false;
    roletorolemappinglist = new Array<Roletorole>();
    roletorolelistcopyarray = new Array<Roletorole>();
    showList: boolean = true;
    view: boolean = false;
    buttonFlag: boolean = false;
    viewUsertouser: boolean = false;
    edit: boolean = false;
    lazyload = { first: 0, rows: 5000, sortField: null, sortOrder: null };
    usmRolePermissions = new Roletorole();
    currentUsmRolePermissions = new Roletorole();
    selected = new FormControl(0);
    rolearray: any[] = [];
    roletorolearray: any[] = [];
    array: any[] = [];
    auth: string = "";
    isAuth: boolean = true;
    editFlag: boolean = false;
    viewFlag: boolean = true;
    deleteFlag: boolean = false;
    createFlag: boolean = false;
    permissionList: any[];
    selectedPermissionList: any[];
    roletorolecopyarraylist = new Array<Roletorole>();
    existingUsertouserlists = new Array<Roletorole>();
    existingUsertouserlist: MatTableDataSource<any>;
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
    //     } catch (e : any)  {
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
        let role;
        let project;
        let portfolio;
        let tempRolesArray = [];
        try {
          role = JSON.parse(sessionStorage.getItem("role") || '');
          project = JSON.parse(sessionStorage.getItem("project") || '');
          portfolio = JSON.parse(sessionStorage.getItem("portfoliodata") || '');
        } catch (e: any) {
          console.error("JSON.parse error - ", e.message);
        }

      this.roletorolearray = [];
      this.array = [];
      let event={ first: 0, rows: 1000, sortField: null, sortOrder: null };
      
    let allRole = new Role(); /** To check if the project has default roles or not */
    allRole.projectId = null;
      this.roleservice.findAll(allRole, event).subscribe((response) => {
        // let project: Project;
        // try {
        //   project = JSON.parse(sessionStorage.getItem("project"));
        // } catch (e : any)  {
        //   project = null;
        //   console.error("JSON.parse error - ", e.message);
        // }
        this.roletorolearray = response.content;
        if(role.roleadmin && role.portfolioId == portfolio.id){
          this.roletorolearray.forEach((element)=>{
            if(element.projectId == null || element.projectId == project.id){
              tempRolesArray.push(element);
            }
          });
          this.roletorolearray = tempRolesArray;
        }

        console.log(this.roletorolearray);

        // this.roletorolearray = this.roletorolearray.filter(
        //   (arr, index, self) =>
        //     index === self.findIndex((t) => t.module === arr.module && t.permission === arr.permission)
        // );
        this.roletorolearray = this.roletorolearray.sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        );
      });
    }
  
    telemetryImpression() {
      // this.telemetryService.impression("iamp-usm", "list", "UsmRolePermissionComponent");
      this.openTelemetryService.startTelemetry("iamp-usm", "UsmRolePermissionComponent", "list");
    }

    ngOnDestroy() {
      let activeSpan = this.openTelemetryService.fetchActiveSpan();
      this.openTelemetryService.endTelemetry(activeSpan);
   }
  
    listView() {
      this.showCreate = false;
      this.changeView.emit(true);
      this.view = false;
      this.edit = false;
      this.errorMessage=false;
      this.viewUsertouser = false;
      this.existingUsertouserlist=null;
      this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
      // this.router.navigate(["../../"], { relativeTo: this.route });
    }
    checkUsmRolePermissions() {
      this.existingUsertouserlists = new Array<Roletorole>();
      this.roletorolemappinglist.forEach((element) => {
        this.roletorolecopyarraylist.forEach((ele) => {
          if (
            element.childRoleId.id == ele.childRoleId.id &&
            element.parentRoleId.id == ele.parentRoleId.id
          ) {
            this.existingUsertouserlists.push(element);
          }
        });
      });
      if (this.existingUsertouserlists.length >= 1) {
        this.existingUsertouserlist = new MatTableDataSource(this.existingUsertouserlists);
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
      } catch (e : any)  {
        project = null;
        console.error("JSON.parse error - ", e.message);
      }
      // this.roletoroleitem.projectId = project.id;
      // let array = [];
      // this.target.forEach((e) => {
      //  for (let i = 0; i < this.permissionarray.length; i++) {
      //   if (this.permissionarray[i].name == e) {
      //    array.push(this.permissionarray[i]);
      //   }
      //  }
      // });
      // try {
      //  this.roletoroleitem.permission = JSON.stringify(array);
      // } catch (e : any)  {
      //  console.error("JSON.stringify error - ", e.message);
      // }
      this.errorMessage = false;
      let temp: any = this.roletoroleitem.childRoleId;
      let arr=[];
      if(temp.length){
        arr = temp.filter(
          (item) =>
            item.name == this.selectedRole.name 
        );
      }
      if (this.roletoroleitem.childRoleId == undefined || this.roletoroleitem.childRoleId == null) {
        this.messageService.error("Please Select A Role", "LEAP");
      } 
      else if (arr.length>0 || (!temp.length && temp.name==this.selectedRole.name)) {
        this.messageService.error("Parent and Child Role cannot be same", "LEAP");
      } 
      else {
        if (this.edit) this.updateWave();
        else {
          this.roletorolecopyarraylist = new Array<Roletorole>();
          let temp: Roletorole = new Roletorole();
          let permissions: any = this.roletoroleitem.childRoleId;
          if (permissions.length > 1) {
            permissions.forEach((element) => {
              temp.parentRoleId = this.selectedRole;
              temp.childRoleId = element;
              this.roletorolecopyarraylist.push(temp);
              temp = new Roletorole();
            });
          } else {
            temp.parentRoleId = this.selectedRole;
              temp.childRoleId = this.roletoroleitem.childRoleId[0]
            this.roletorolecopyarraylist.push(temp);
          }
          let flag: boolean = false;
          flag = this.checkUsmRolePermissions();
          // let arr = this.roletorolemappinglist.filter(
          //   (item) =>
          //     item.role.id == this.roletoroleitem.role.id &&
          //     item.permission.module == this.roletoroleitem.permission.module &&
          //     item.permission.permission == this.roletoroleitem.permission.permission
          // );
          // if (arr.length > 0) {
          //   this.messageService.error("Duplicate Role Permission cannot be created", "IAMP");
          //   return;
          // }
          if (!flag) {
            this.busy = this.roleroleService.createAll(this.roletorolecopyarraylist).subscribe(
              (response) => {
                this.messageService.info("Role-Role Mapping Saved Successfully", "LEAP");
                this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
                this.clearWave();
                this.showCreate = false;
                this.testCreate = true;
                this.errorMessage = false;
                this.listView();
              },
              (error) => {
                this.testCreate = false;
                this.messageService.error("Could not create Role-Role Mapping", "LEAP");
              }
            );
          } else {
            this.messageService.info(
              "Could not save " + this.existingUsertouserlists.length + " Mapping(s) Already Exists",
              "IAMP"
            );
          }
        }
      }
    }
  
    getroletorole(that) {
      this.roleroleService.getRolerole(that).subscribe((res) => {
        this.roletoroleitem = res;
        let project:any
        try {
          project = JSON.parse(sessionStorage.getItem("project"));
        } catch (e : any)  {
          project = null;
          console.error("JSON.parse error - ", e.message);
        }
        if(this.dbsViewFlag){
      //   this.dashConstantService.getDashConsts(project).subscribe((res) => {
      //     this.widgetSettingsArray=res.filter((item) => (item.keys == this.roletoroleitem.role.name+"dbsViewSettingsdefault"));
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
    //    this.router.navigate(["../../" + this.roletoroleitem.id + "/" + false], { relativeTo: this.route });
    //   } else {
    //    this.view = true;
    //    this.edit = true;
    //    this.viewUsertouser = true;
    //    this.changeView.emit(false);
    //    this.showCreate = true;
    //    this.buttonFlag = true;
    //    this.router.navigate(["../../" + this.roletoroleitem.id + "/" + true], { relativeTo: this.route });
    //   }
    //  }
  
    showDeleteDialog(rowData: any) {
      let usmRolePermissionsToDelete: Roletorole = <Roletorole>rowData;
  
      let dialogRef = this.confirmDeleteDialog.open(DeleteComponent, {
        disableClose: true,
        data: {
          title: "Delete Role-Role Mapping",
          message: "Are you sure you want to delete?",
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result === "yes") {
          this.delete(usmRolePermissionsToDelete);
        }
      });
    }
  
    edit_Usertouser(usmRolePermissions: Roletorole) {
      this.changeView.emit(false);
      this.view = false;
      this.edit = true;
      this.showCreate = true;
      this.roletoroleitem = usmRolePermissions;
      this.buttonFlag = false;
      this.router.navigate(["./" + usmRolePermissions.id + "/" + false], { relativeTo: this.route });
      this.getroletorole(usmRolePermissions.id);
  
    }
  
    view_Usertouser(usmRolePermissions: Roletorole) {
      this.view = true;
      this.edit = true;
      this.viewUsertouser = true;
      this.changeView.emit(false);
      this.showCreate = true;
      this.buttonFlag = true;
      this.currentUsmRolePermissions = usmRolePermissions;
      this.roletoroleitem = usmRolePermissions;
      this.router.navigate(["./" + usmRolePermissions.id + "/" + true], { relativeTo: this.route });
      this.getroletorole(usmRolePermissions.id);
    }
  
    createView() {
      this.showCreate = true;
      this.edit = false;
      this.roletoroleitem = new Roletorole();
      this.changeView.emit(false);
    }
  
    loadPage(event) {
      this.roleroleService.findAll(this.example1, event).subscribe(
        (pageResponse) => {
          pageResponse.content = pageResponse.content.sort((a, b) =>
            a.childRoleId.name.toLowerCase() > b.childRoleId.name.toLowerCase() ? 1 : -1
          );
          this.currentPage = pageResponse
          let temparray=[]
        this.currentPage.content.forEach(element => {
          if(element.parentRoleId.name==this.selectedRole.name)
          temparray.push(element)
        });
        this.roletorolemappinglist = temparray
          this.roletorolelistcopyarray = temparray;
          this.roletorolelistcopy = new MatTableDataSource(temparray);
          this.roletorolelistcopy.paginator = this.paginator;
          this.roletorolelistcopy.sort = this.sort;
  
          if (this.currentPage.totalPages > 0) this.testCreate = true;
        },
        (error) => {
          this.testCreate = false;
          this.messageService.error("Could not get the results", "LEAP");
        }
      );
    }
  
    updateWave() {
      let arr = this.roletorolemappinglist.filter(
        (item) =>
        item.id != this.roletoroleitem.id &&
        item.childRoleId.id == this.roletoroleitem.childRoleId.id &&
        item.parentRoleId.id == this.roletoroleitem.parentRoleId.id 
      );
      if (arr.length > 0) {
        this.messageService.error("Duplicate Role Permission cannot be created", "IAMP");
        return;
      } else {
        this.busy = this.roleroleService.update(this.roletoroleitem).subscribe(
          (rs) => {
            this.testId = rs.id;
            this.testCreate = true;
            this.messageService.info("Role-Role Mapping updated successfully", "LEAP");
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
  
    delete(usmRolePermissionsToDelete: Roletorole) {
      let id = usmRolePermissionsToDelete.id;
      this.roleroleService.delete(id).subscribe(
        (response) => {
          this.testCreate = true;
          this.currentPage.remove(usmRolePermissionsToDelete);
          this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
          this.messageService.info("Role-Role Mapping Deleted successfully", "LEAP!");
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
        this.roletoroleitem.childRoleId = null;
        this.errorMessage = false;
      } else {
        this.roletoroleitem = new Roletorole();
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
      let newtasks = Object.assign([], this.roletorolelistcopyarray);
      if (this.filterroletorole == "All") {
        newtasks = this.roletorolelistcopyarray;
      }
      if (this.filterroletorole != "All") {
        newtasks = newtasks.filter(
          (item1) => item1.childRoleId.name.toLowerCase() == this.filterroletorole.name.toLowerCase()
        );
      }
      this.roletorolemappinglist = newtasks;
      this.roletorolelistcopy = new MatTableDataSource(this.roletorolemappinglist);
      this.roletorolelistcopy.sort = this.sort;
      this.roletorolelistcopy.paginator = this.paginator;
    }
    Clear() {
      this.filterroletorole = "All";
  
      this.myInputReference.nativeElement.value = null;
      this.roletorolemappinglist = this.roletorolelistcopyarray;
      this.roletorolelistcopy = new MatTableDataSource(this.roletorolelistcopyarray);
      this.roletorolelistcopy.sort = this.sort;
      this.roletorolelistcopy.paginator = this.paginator;
    }
    assignCopy() {
      this.roletorolemappinglist = Object.assign([], this.roletorolelistcopyarray);
    }
    filterItem(value) {
      if (!value) {
        this.assignCopy();
      }
      this.roletorolemappinglist = Object.assign([], this.roletorolelistcopyarray).filter(
        (item1) => item1.childRoleId.name.toLowerCase().indexOf(value.toLowerCase()) > -1
      );
      this.roletorolelistcopy = new MatTableDataSource(this.roletorolemappinglist);
      this.roletorolelistcopy.sort = this.sort;
      this.roletorolelistcopy.paginator = this.paginator;
    }
    checkEnterPressed(event: any, val: any) {
      if (event.keyCode === 13) {
        this.filterItem(event.srcElement.value);
      }
    }
    trackByMethod(index, item) {}
  }
  