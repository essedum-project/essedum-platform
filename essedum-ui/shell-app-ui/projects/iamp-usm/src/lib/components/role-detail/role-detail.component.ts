import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, Inject } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";
import { DatePipe } from "@angular/common";
import { MessageService } from "../../services/message.service";
import { Role } from "../../models/role";
import { RoleService } from "../../services/role.service";
import { HelperService } from "../../services/helper.service";
import { ProjectService } from "../../services/project.service";
import { Project } from "../../models/project";
// import { UsersService } from "../../services/users.service";
import { UsmPortfolio } from "../../models/usm-portfolio";
import { Subscription } from "rxjs";
import { IampUsmService } from "../../iamp-usm.service";
// import { LeapTelemetryService } from "../../telemetry-util/telemetry.service";
import { UsmPortfolioService } from "../../services/usm-portfolio.service";
@Component({
  selector: 'lib-role-detail',
  templateUrl: './role-detail.component.html',
  styleUrl: './role-detail.component.css'
})
export class RoleDetailComponent implements OnInit {
  role: Role;
  params_subscription: any;
  edit: boolean = false;
  view: boolean = false;
  displayProjectDropdown: Boolean = false;
  lazyload = { first: 0, rows: 5000, sortField: null, sortOrder: null };
  projectList = new Array<Project>();
  projectListPortfolioAdmin = new Array<Project>();
  viewRole: boolean = false;
  lengthNameErrorMessage: String = "Maximum Character Limit Reached";
  showNameLengthErrorMessage: Boolean = false;
  showDescLengthErrorMessage: Boolean = false;
  busy: Subscription;
  rolesArray: any;
  allRole = new Role();
  auth: string = "";
  isAuth: boolean = true;
  permissionList: any[];
  selectedPermissionList: any[];
  editFlag: boolean = false;
  viewFlag: boolean = true;
  deleteFlag: boolean = false;
  createFlag: boolean = false;
  usm_portfolio_idArray: UsmPortfolio[] = [];
  usm_portfolio_idObject: UsmPortfolio = new UsmPortfolio();
  rolePermissions: any;
  normalRole: boolean = false;
  portfolioAdminBoolean: boolean = false;
  portfolioIdVar: any;
  disableEditOfDefaultRoles: boolean = false;
    @Output() roleModelClosed = new EventEmitter<void>();

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public messageService: MessageService,
    public helperService: HelperService,
    public elementRef: ElementRef,
    public roleService: RoleService,
    private projectService: ProjectService,
    // private usersService: UsersService,
    private usmService: IampUsmService,
    // private telemetryService: LeapTelemetryService,
    private usm_portfolio: UsmPortfolioService,
     public dialogRef: MatDialogRef<RoleDetailComponent>,
    public dialog: MatDialog,
   @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.role = new Role();
    let role: Role;
    try {
      role = JSON.parse(sessionStorage.getItem("role"));
    } catch (e : any)  {
      role = null;
      console.error("JSON.parse error - ", e.message);
    }
    if (sessionStorage.getItem("usmAuthority")) {
      sessionStorage.removeItem("usmAuthority");
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
    this.fetchRoles();
    this.params_subscription = this.route.params.subscribe((params) => {
      let id = params["rid"];
      if (id) {
        if (window.location.href.includes("edit")) {
          this.edit = true;
          this.view = false;
        } else {
          this.view = true;
          this.edit = false;
          this.viewRole = true;
        }
        this.roleService.getRole(id).subscribe(
          (roles) => {
            this.role = roles;
            if (this.role.projectId == undefined || this.role.projectId == null){
              this.displayProjectDropdown = false;
            } 
            else {
              this.displayProjectDropdown = true;
            }
    
            if(role.name == 'Admin'){
              this.disableEditOfDefaultRoles = false;
            } else {
              if(this.role.projectId == undefined || this.role.projectId == null){
                this.disableEditOfDefaultRoles = true;
              } else{
                this.disableEditOfDefaultRoles = false;
              }
            }
    
          },
          (error) => this.messageService.error("Could not fetch role", "IAMP")
        );
      } else {
        this.edit = false;
        this.view = false;
        this.viewRole = false;
      }
    });

    this.fetchProjects();
    this.getid();
    console.log(this.role);
    this.params_subscription = this.route.params.subscribe((params) => {
      let id = params["rid"];
      if (id) {
        if (window.location.href.includes("edit")) {
          this.edit = true;
          this.view = false;
        } else {
          this.view = true;
          this.edit = false;
          this.viewRole = true;
        }
        this.roleService.getRole(id).subscribe(
          (roles) => {
            this.role = roles;
            if (this.role.projectId == undefined || this.role.projectId == null) this.displayProjectDropdown = false;
            else this.displayProjectDropdown = true;
          },
          (error) => this.messageService.error("Could not fetch role", "IAMP")
        );
      } else {
        this.edit = false;
        this.view = false;
        this.viewRole = false;
      }
    });
  }

  // checkRolePermissions(){
  //   this.rolePermissions = JSON.parse(sessionStorage.getItem("role"));
  //   if(this.rolePermissions.portfolioId){

  //   }
  // }

  fetchProjects() {
    let project = new Project();
    let role: Role;
    try {
      role = JSON.parse(sessionStorage.getItem("role"));
    } catch (e : any)  {
      role = null;
      console.error("JSON.parse error - ", e.message);
    }
    if (role.roleadmin) {
      this.portfolioAdminBoolean = true;
      var portfolio: UsmPortfolio;
      try {
        portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
      } catch (e : any)  {
        portfolio = null;
        console.error("JSON.parse error - ", e.message);
      }

      // project.portfolioId = portfolio;
    }
    this.projectService.findAll(project, this.lazyload).subscribe((res) => {
      this.projectList = res.content;
      this.projectList = this.projectList.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
      if(role.portfolioId && role.portfolioId == portfolio.id){
        this.projectList.forEach(ele => {
          if(ele.portfolioId.id == role.portfolioId){
            this.projectListPortfolioAdmin.push(ele);
          }
        })
        this.projectList = this.projectListPortfolioAdmin;
      }else if((role.portfolioId && role.portfolioId != portfolio.id) || (!role.roleadmin && !role.projectadmin && role.id != 6)){
        if(!portfolio){
          portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
        }
        this.normalRole = true;
        this.projectList.forEach(ele => {
          if(ele.portfolioId.id == portfolio.id){
            this.projectListPortfolioAdmin.push(ele);
          }
        })
        this.projectList = this.projectListPortfolioAdmin;
      }
      this.projectList = this.projectList.filter((ele)=>{
        return ele.name != "Core";
      })
    });
  }

  getid() {
    
    this.usm_portfolio_idObject = null;
    this.usm_portfolio
      .findAll(this.usm_portfolio_idObject, {
        first: 0,
        rows: 1000,
        sortField: null,
        sortOrder: null,
      })
      .subscribe(
        (pageResponse) => {
          this.usm_portfolio_idArray = pageResponse.content;
          this.usm_portfolio_idArray = this.usm_portfolio_idArray.filter((ele) => {
            return ele.portfolioName != "Core";
          })
          this.usm_portfolio_idArray = this.usm_portfolio_idArray.sort((a, b) =>
            a.portfolioName.toLowerCase() > b.portfolioName.toLowerCase() ? 1 : -1
          );
        },
        (error) => this.messageService.error("Could not get the results", error)
      );
  }

  check(tool) {
    console.log(tool)
    if (this.role && this.role.name) {
      this.role.name = this.role.name.trim();
    }
    if (tool.name == undefined || tool.name == null || tool.name.trim().length == 0) {
      this.messageService.info("Role name can't be empty", "IAMP");
    } else if (!/^[a-zA-Z][a-zA-Z0-9 \-\_\.]*?$/.test(tool.name)) {
      this.messageService.info("Role name format is incorrect", "IAMP");
    }
    else if (tool.description && (!/^[a-zA-Z0-9][a-zA-Z0-9 \-\_\.]*?$/.test(tool.description))) {
      this.messageService.info("Role description format is incorrect", "IAMP");
    }
    // else if (tool.permission == undefined || tool.permission == null) {
    //   this.messageService.info("Type of access can't be empty", "IAMP");
    // }
    else if(tool.projectadmin==true && !tool.projectAdminId){
      this.messageService.info("Please select the project","IAMP")
    }
    else {
      if (this.displayProjectDropdown == false)
        /** if "Map to project" checkbox is deselected, then set projectId to null */
        this.role.projectId = null;
      this.onSave();
    }
  }

  radioChange(event) {
    this.role.permission = event.value;
  }

  closeRoleAddDialog(): void {
    const openDialogs = this.dialog.openDialogs;
    for (const dialog of openDialogs) {
      if (dialog.componentInstance instanceof RoleDetailComponent) {
        dialog.close();
        this.dialogRef.afterClosed().subscribe(() => {
          this.roleModelClosed.emit();
        });
      }
    }
  }
  onSave() {
    this.role.permission=false;
    if (this.edit) {
      this.onUpdate();
    } else {
      let arr1 = this.rolesArray?.filter((item) => item.name != undefined);
      let arr2 = arr1?.filter((item) => item.name.toLowerCase() == this.role.name.toLowerCase());
      if (arr2?.length > 0) {
        this.messageService.error("Role already exists", "IAMP");
        return;
      } else {
        // if (sessionStorage.getItem("telemetry") == "true") {
        // this.telemetryService.audit(this.role,"CREATE");
        // }
        this.busy = this.roleService.create(this.role).subscribe((roles) => {
          this.role = new Role();
          this.displayProjectDropdown = false;
          this.messageService.info("Role created", "IAMP");
          this.listView();
        });
      }
    }
  }
  compareTodiff(curr:any,prev:any){
    let temparr=[];
    Object.keys(prev).forEach(key => {
    if(prev[key]!=curr[key])
    temparr.push(key)
   });
   return temparr;
  }
  onUpdate() {
    this.allRole.projectId = null;
    let arr1 = this.rolesArray.filter((item) => item.name != undefined);
    let arr2 = arr1.filter(
      (item) => item.id != this.role.id && item.name.toLowerCase() == this.role.name.toLowerCase()
    );
    if (arr2.length > 0) {
      this.messageService.error("Role already exists", "IAMP");
      return;
    } else {
      if (sessionStorage.getItem("telemetry") == "true") {
      let arr = this.rolesArray.filter(
        (item) =>
          item.id == this.role.id
      );
      let diff=this.compareTodiff(this.role,arr1[0])
      // this.telemetryService.audit(this.role,arr[0],diff);
      }
      this.busy = this.roleService.update(this.role).subscribe(
        (roles) => {
          this.role = roles;
          this.messageService.info("Role updated", "IAMP");
          this.clearRole();
          if (sessionStorage.getItem("role")) {
            let role: Role;
            try {
              role = JSON.parse(sessionStorage.getItem("role"));
            } catch (e : any)  {
              role = null;
              console.error("JSON.parse error - ", e.message);
            }
            let currentrole = role;
            if (roles.id == currentrole.id) {
              try {
                sessionStorage.setItem("role", JSON.stringify(roles));
              } catch (e : any)  {
                console.error("JSON.stringify error - ", e.message);
              }
            }
            sessionStorage.setItem("UpdatedUser", "true");
            if (sessionStorage.getItem("roleList")) {
              let rolelist;
              try {
                rolelist = JSON.parse(sessionStorage.getItem("roleList"));
              } catch (e : any)  {
                console.error("JSON.parse error - ", e.message);
              }
              let newrolelist = [];
              rolelist.forEach((element) => {
                if (element.id == roles.id) {
                  element = roles;
                  newrolelist.push(roles);
                } else {
                  newrolelist.push(element);
                }
              });
              try {
                sessionStorage.setItem("roleList", JSON.stringify(newrolelist));
              } catch (e : any)  {
                console.error("JSON.stringify error - ", e.message);
              }
            }
          }
          this.listView();
        },
        (error) => this.messageService.error("Could not update", "IAMP")
      );
    }
  }
  compareObjects(o1: any, o2: any): boolean {
    return o1.name === o2.name && o1.id === o2.id;
  }
  listView() {
    this.showNameLengthErrorMessage = false;
    this.showDescLengthErrorMessage = false;
    if (this.edit || this.view) this.router.navigate(["./../../list"], { relativeTo: this.route });
    else this.router.navigate(["./../list"], { relativeTo: this.route });
  }
  clearRole() {
    if (this.edit || this.view) {
      this.role.name = null;
      this.role.description = null;
      this.role.permission = null;
      this.role.roleadmin = null;
      this.role.projectId = null;
      this.displayProjectDropdown = false;
      this.showDescLengthErrorMessage = false;
      this.showNameLengthErrorMessage = false;
    } else {
      this.role = new Role();
      this.displayProjectDropdown = false;
      this.role.permission = null;
      this.showDescLengthErrorMessage = false;
      this.showNameLengthErrorMessage = false;
    }
  }
  trackByMethod(index, item) {}

  checkNameMaxLength() {
    if (this.role.name.length >= 255) {
      this.showNameLengthErrorMessage = true;
    } else {
      this.showNameLengthErrorMessage = false;
    }
  }

  checkDescMaxLength() {
    if (this.role.description.length >= 255) {
      this.showDescLengthErrorMessage = true;
    } else {
      this.showDescLengthErrorMessage = false;
    }
  }

  resetChanges(changesobj,type){
    if (changesobj == false){
      if(type == 1){
        this.role.projectId = JSON.parse(sessionStorage.getItem("project"))?.id;
      }
      else if(type == 2){
        this.role.portfolioId = null;
      }
    }
      
  }


  fetchRoles() {
    this.allRole.projectId = null;
    this.roleService
      .findAll(this.allRole, { first: 0, rows: 1000, sortField: null, sortOrder: null })
      .subscribe((res) => {
        this.rolesArray = res.content;
      });
  }
}
