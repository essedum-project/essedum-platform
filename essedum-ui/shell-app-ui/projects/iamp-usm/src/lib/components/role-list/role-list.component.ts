import { Component, OnInit, ViewChild, Input, ElementRef, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { PageResponse } from "../../support/paging";
import { MessageService } from "../../services/message.service";
import { Msg } from "../../shared-modules/services/msg";
import { ConfirmDeleteDialogComponent } from "../../support/confirm-delete-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { RoleService } from "../../services/role.service";
import { ProjectService } from "../../services/project.service";
import { saveAs as importedSaveAs } from "file-saver";
import { UserProjectRole } from "../../models/user-project-role";
import { UserProjectRoleService } from "../../services/user-project-role.service";
import { UsmPortfolio } from "../../models/usm-portfolio";
import { Project } from "../../models/project";
import { Users } from "../../models/users";
// import { LeapTelemetryService } from "../../telemetry-util/telemetry.service";
import { DeleteComponent } from "../../shared-modules/confirm-delete/delete.component";
import { IampUsmService } from "../../iamp-usm.service";
import { Role } from "../../models/role";
import { MatSelectChange } from "@angular/material/select";
import { start } from "repl";
import { RoleDetailComponent } from "../role-detail/role-detail.component";
// import { OpenTelemetryService } from "../../telemetry-util/open-telemetry.service";
@Component({
  templateUrl: "role-list.component.html",
  selector: "role-list",
  styleUrls: ["./role-list.component.css"],
})
export class RoleListComponent implements OnInit, OnDestroy {
  lazyload = { first: 0, rows: 1000, sortField: null, sortOrder: null };
  statusArray = [];
  role: Role = new Role();
  roles = new Array<Role>();
  // rolesFilter = new Array<Role>();
  roleList: MatTableDataSource<any> = new MatTableDataSource();
  rolesLength: number = 0;
  associatedproject: any = [];
  ProjectList: Project[] = [];
  rolesResponse: any = {};
  rolesContent: any = [];
  // rowsPerPage = 5;
  // noOfPages = 0;
  // pageArr: number[] = [];
  pagedRoles: any[] = [];
  // startIndex = 0;
  // endIndex = 0;
  // hoverStates: boolean[] = []
  // pageNumber = 1;
  page: number = 0;
  rowsPerPage: number = 5;
  totalrecords: number = 0
  lastPage: number = 0;
  currentproject: any;
  showList: boolean = false;
  lastRefreshedTime: Date | null = null;
  createAuth: boolean = true;

  view_Role: boolean = false;
  displayedColumns: string[] = ["id", "name", "AssociatedProject", "description", "actions"];
  selectedDesc: string = "All";
  rolesArraySorted = new Array<Role>(); /** To separate roles from other project(keep spcific), if defaultRoles
  true then keep (specific + null projectId)  */
  @ViewChild("myInput", { static: false }) myInputReference: ElementRef;
  private paginator: MatPaginator;
  private sort: MatSort;
  p: number;

  currentRole: Role = new Role();
  popup: boolean = false;
  searchedRole: string = "All";
  isFilterExpanded: boolean = false;
  selectedAdapterType: string[] = [];
  rolesFilter: Array<{ label: string, selected: boolean }> = [];
  TOOLTIP_POSITION: 'above' | 'below' = 'above';
  auth: string = "";
  isAuth: boolean = false;
  permissionList: any[];
  selectedPermissionList: any[];
  editFlag: boolean = false;
  viewFlag: boolean = true;
  deleteFlag: boolean = false;
  createFlag: boolean = false;
  portfolioAdminPermsFlag: any[] = [];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roleService: RoleService,
    private userProjectRoleService: UserProjectRoleService,
    public projectService: ProjectService,
    public confirmDeleteDialog: MatDialog,
    public dialog:MatDialog,
    private messageService: MessageService,
    // private telemetryService: LeapTelemetryService,
    private usmService: IampUsmService,
    // private openTelemetryService: OpenTelemetryService
  ) { }

  @ViewChild(MatSort, { static: false }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatPaginator, { static: false }) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  ngOnInit() {
    // this.telemetryImpression();
    if (sessionStorage.getItem("usmAuthority")) {
      sessionStorage.removeItem("usmAuthority");
    }
    this.usmService.getPermission("usm").subscribe(
      (resp) => {
        this.permissionList = JSON.parse(resp);
        this.permissionList;
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
      (error) => { },
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
    this.fetchRole();
    this.rolesResponse = {
      "totalPages": 1,
      "totalElements": 14,
      "content": [
        {
          "id": 1,
          "projectId": null,
          "name": "Project Manager",
          "description": "Project Manager",
          "permission": true,
          "roleadmin": null,
          "projectadmin": null,
          "portfolioId": null,
          "projectAdminId": null
        },
        {
          "id": 6,
          "projectId": 2,
          "name": "Admin",
          "description": "Admin",
          "permission": false,
          "roleadmin": null,
          "projectadmin": null,
          "portfolioId": null,
          "projectAdminId": null
        },
        {
          "id": 11,
          "projectId": null,
          "name": "Project Admin",
          "description": "Project Admin",
          "permission": true,
          "roleadmin": null,
          "projectadmin": null,
          "portfolioId": null,
          "projectAdminId": null
        },
        {
          "id": 123,
          "projectId": null,
          "name": "Project Client",
          "description": "Project Client",
          "permission": true,
          "roleadmin": null,
          "projectadmin": null,
          "portfolioId": null,
          "projectAdminId": null
        },
        {
          "id": 124,
          "projectId": null,
          "name": "Portfolio Admin",
          "description": "Portfolio Admin",
          "permission": true,
          "roleadmin": null,
          "projectadmin": null,
          "portfolioId": null,
          "projectAdminId": null
        },
        {
          "id": 125,
          "projectId": null,
          "name": "Portfolio Client",
          "description": "Portfolio Client",
          "permission": true,
          "roleadmin": null,
          "projectadmin": null,
          "portfolioId": null,
          "projectAdminId": null
        },
        {
          "id": 126,
          "projectId": null,
          "name": "Portfolio Manager",
          "description": "Portfolio Manager",
          "permission": true,
          "roleadmin": null,
          "projectadmin": null,
          "portfolioId": null,
          "projectAdminId": null
        },
        {
          "id": 127,
          "projectId": null,
          "name": "Core Project Admin",
          "description": "Core Project Admin",
          "permission": true,
          "roleadmin": null,
          "projectadmin": null,
          "portfolioId": null,
          "projectAdminId": null
        },
        {
          "id": 128,
          "projectId": null,
          "name": "Core Portfolio Admin",
          "description": "Core Portfolio Admin",
          "permission": false,
          "roleadmin": null,
          "projectadmin": null,
          "portfolioId": null,
          "projectAdminId": null
        },
        {
          "id": 129,
          "projectId": null,
          "name": "leo1311",
          "description": null,
          "permission": false,
          "roleadmin": null,
          "projectadmin": false,
          "portfolioId": null,
          "projectAdminId": 18
        },
        {
          "id": 131,
          "projectId": null,
          "name": "IT OPERATIONS Test",
          "description": "IT OPERATIONS Test",
          "permission": false,
          "roleadmin": null,
          "projectadmin": null,
          "portfolioId": null,
          "projectAdminId": null
        },
        {
          "id": 133,
          "projectId": null,
          "name": "Test",
          "description": "Test",
          "permission": false,
          "roleadmin": null,
          "projectadmin": null,
          "portfolioId": null,
          "projectAdminId": null
        },
        {
          "id": 134,
          "projectId": null,
          "name": "User",
          "description": null,
          "permission": false,
          "roleadmin": null,
          "projectadmin": null,
          "portfolioId": null,
          "projectAdminId": null
        },
        {
          "id": 135,
          "projectId": 2,
          "name": "A",
          "description": "A",
          "permission": false,
          "roleadmin": null,
          "projectadmin": null,
          "portfolioId": null,
          "projectAdminId": null
        }
      ]
    };
    this.rolesContent = this.rolesResponse.content;
    this.totalrecords = this.rolesContent.length;
    this.updatePagedData();
  }
// PAGINATION BLOCK START
  updatePagination() {
    const totalPages = Math.ceil(this.totalrecords / this.rowsPerPage);
    this.lastPage = Math.max(totalPages - 1, 0);
    if (this.page > this.lastPage) {
      this.page = this.lastPage;
    }
    this.updatePagedData()
  }

  updatePagedData() {
    const startIndex = this.page * this.rowsPerPage;
    const endIndex = Math.min(startIndex + this.rowsPerPage, this.totalrecords);
    this.pagedRoles = this.rolesContent.slice(startIndex, endIndex);
    this.lastPage=Math.floor((this.rolesContent.length-1)/ this.rowsPerPage);


  }
  getPageNumbers() {
    const totalPages = this.lastPage + 1;
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  navigatePage(direction: 'Prev' | 'Next'){
    if(direction === 'Prev' && this.page>0){
      this.page--;
    }else if(direction==='Next' && this.page<this.lastPage){
      this.page++;
        }
        this.updatePagedData();
  }

changePage(p:number){
  if(p>0 && p<=this.lastPage){
    this.page=p;
    this.updatePagedData();
  }
}

// PAGINATION BLOCK ENDS
telemetryImpression() {
  // this.telemetryService.impression("iamp-usm", "list", "RoleListComponent");
  // this.openTelemetryService.startTelemetry("iamp-usm", "RoleListComponent", "list");
}

ngOnDestroy() {
  // let activeSpan = this.openTelemetryService.fetchActiveSpan();
  // this.openTelemetryService.endTelemetry(activeSpan);
}

setDataSourceAttributes() {
  this.roleList.paginator = this.paginator;
  this.roleList.sort = this.sort;
}

fetchRole() {
  this.roles = [];

  let allRole = new Role(); /** To check if the project has default roles or not */

  allRole.projectId = null;

  let role: Role;
  try {

    role = JSON.parse(sessionStorage.getItem("role"));
  } catch (e: any) {

    console.error("JSON.parse error - ", e.message);
  }

  let example: Project = new Project();
  let event = { first: 0, rows: 1000, sortField: null, sortOrder: null };
  this.projectService.findAll(example, event).subscribe(
    (pageResponse) => {

      this.ProjectList = pageResponse.content;
    },
    (error) => this.messageService.error("Could not get the results", "IAMP"),
    () => {

      if (role.roleadmin) {

        let userprojectrole = new UserProjectRole();

        let portfolio: UsmPortfolio;
        let project: Project;
        let user: Users;

        try {


          portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
          project = JSON.parse(sessionStorage.getItem("project"));
          user = JSON.parse(sessionStorage.getItem("user"));
        } catch (e: any) {

          portfolio = null;
          project = null;
          user = null;
          console.error("JSON.parse error - ", e.message);
        }

        userprojectrole.portfolio_id = new UsmPortfolio({ id: portfolio.id });
        userprojectrole.project_id = new Project({ id: project.id });
        userprojectrole.user_id = new Users({ id: user.id });
        this.roleService.findAll(allRole, this.lazyload).subscribe((res) => {
          this.rolesArraySorted = [];
          res.content.forEach((item) => {

            if (item.id != 6) {

              if (!item.roleadmin) {

                if (!(item.projectadmin && item.projectAdminId != project.id)) {

                  this.rolesArraySorted.push(item);
                }
              }
            }
          });
          if (portfolio.id == role.portfolioId && role.roleadmin && !role.projectadmin) {

            this.rolesArraySorted.forEach((ele) => {

              if (ele.projectId == project.id) {

                this.portfolioAdminPermsFlag.push(ele.id);
              }
              if (ele.projectadmin == true && ele.projectAdminId == project.id) {

                this.portfolioAdminPermsFlag.push(ele.id);
              }
            })
          }

          this.computeRole(false);
        });
      } else {


        this.roleService.findAll(allRole, this.lazyload).subscribe(
          (res) => {

            this.rolesArraySorted = res.content;
            this.computeRole(true);

          },
          (error) => this.messageService.error("could not fetch", "IAMP")
        );
      }
    }
  );
}

checkPerms(roleSent: any) {
  let role: Role;
  let portfolio: UsmPortfolio;
  try {
    role = JSON.parse(sessionStorage.getItem("role"));
    portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
  } catch (e: any) {
    console.error("JSON.parse error - ", e.message);
  }
  if (role.name == "Admin" || (role.roleadmin && role.portfolioId != portfolio.id)) {
    return true;
  }

  if (this.portfolioAdminPermsFlag.includes(roleSent.id)) {
    return true;
  } else {
    return false;
  }
}

Search() {
  let newApps = [];
  if (this.searchedRole == "All" || this.searchedRole == "") {
    newApps = this.rolesArraySorted;
  } else {
    newApps = Object.assign([], this.rolesArraySorted).filter((item1) =>
      item1.name == null ? "" : item1.name.toLowerCase() == this.searchedRole.toLowerCase()
    );
  }
  if (this.selectedDesc == "All" || this.selectedDesc == "") {
    newApps = newApps;
  } else {
    newApps = newApps.filter(
      // item1 => item1.description.toLowerCase().indexOf(this.selectedDesc.toLowerCase()) > -1)
      (item1) =>
        item1.description == null
          ? ""
          : item1.description.toLowerCase().indexOf(this.selectedDesc.toLowerCase()) > -1
    );
    // newApps = this.rolePage.content.filter(element => element.description == this.selectedDesc)
  }
  this.roles = newApps;
  this.roleList = new MatTableDataSource(newApps);
  this.roleList.sort = this.sort;
  this.roleList.paginator = this.paginator;
  this.rolesLength = newApps.length;
}

Refresh() {
  this.fetchRole();
}

clearRole() {
  this.selectedDesc = "All";
  this.searchedRole = "All";
  this.myInputReference.nativeElement.value = null;
  let newapps = [];
  newapps = this.rolesArraySorted;
  this.roles = newapps;
  this.roleList = new MatTableDataSource(newapps);
  this.roleList.sort = this.sort;
  this.roleList.paginator = this.paginator;
  this.rolesLength = newapps.length;
}

assignCopy() {
  this.roles = Object.assign([], this.rolesArraySorted);
}
toggleFilterExpanded(): void {
  this.isFilterExpanded = !this.isFilterExpanded;
}
toggleExpand(): void {
  this.toggleFilterExpanded();
}
hasActiveFilters(): boolean {
  return this.selectedAdapterType.length > 0;
}
getActiveFilterSummary(): string {
  return this.hasActiveFilters() ? this.selectedAdapterType.join(', ') : '';

}
pipelineTypeSelected(event: MatSelectChange): void {
  const selectedValue = event.value;
  if(!selectedValue) {
    this.clearAllFilters('Role');
    return;
  }
    if(!this.selectedAdapterType.includes(selectedValue)) {
  this.selectedAdapterType.push(selectedValue);
}
this.rolesFilter = this.rolesFilter.map(option => ({
  ...option,
  selected: option.label === selectedValue
})

);
  }
clearAllFilters(filtertype: string): void {
  if(filtertype === 'Role') {
  this.selectedAdapterType = [];
  this.rolesFilter = this.rolesFilter.map(option => ({ ...option, selected: false }));
}
  }
removePipelineType(type: string): void {
  this.selectedAdapterType = this.selectedAdapterType.filter(t => t !== type);
  this.rolesFilter = this.rolesFilter.map(Option => ({
    ...Option,
    selected: Option.label === type ? false : Option.selected
  }));
}
filterItem(value) {
  if (!value) {
    this.assignCopy();
  }
  this.roles = Object.assign([], this.rolesArraySorted).filter(
    (item1) => item1.name.toLowerCase().indexOf(value.toLowerCase()) > -1
  );
  this.roleList = new MatTableDataSource(this.roles);
  this.roleList.sort = this.sort;
  this.roleList.paginator = this.paginator;
}

updateRole() {
  this.roleService.update(this.currentRole).subscribe(
    (rs) => {
      this.messageService.info("Role updated successfully", "IAMP");
      this.clear();
    },
    (error) => this.messageService.error("Could not update", "IAMP")
  );
}

createView() {
  // this.router.navigate(["./role/create"], { relativeTo: this.route });
   const dialogRef = this.dialog.open(RoleDetailComponent, {
      height: "67%",
      width: "50%",
      disableClose: false,
      data: {
        edit: false,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.refresh();
      }
    });
  }


editRole(role: Role) {
  this.router.navigate(["../edit", role.id], { relativeTo: this.route });
}

viewRole(role: Role) {
  this.router.navigate(["../view", role.id], { relativeTo: this.route });
}

clear() {
  this.role = new Role();
}
deleteRole(role: any) {
  let dialogRef = this.confirmDeleteDialog.open(DeleteComponent, {
    disableClose: true,
    data: {
      title: "Delete Role",
      message: "Are you sure you want to delete?",
    },
  });
  dialogRef.afterClosed().subscribe(
    (result) => {
      if (result === "yes") {
        this.delete(role);
      }
    },
    (error) => this.messageService.error(error, Msg.APP)
  );
}
delete (role: Role) {
  this.roleService.delete(role.id).subscribe(
    (Response) => {
      if (sessionStorage.getItem("telemetry") == "true") {
        // this.telemetryService.audit(role,"DELETE");
      }
      sessionStorage.setItem("UpdatedUser", "true");
      this.messageService.info("Role Deleted successfully", "IAMP");
      this.fetchRole();
      if (this.myInputReference.nativeElement) {
        this.myInputReference.nativeElement.value = null;
      }
    },
    (error) => this.messageService.error("Could not delete", "IAMP")
  );
}
compareObjects(o1: any, o2: any): boolean {
  return o1 && o2 && o1.id == o2.id;
}

download() {
  let project: Project;
  try {
    project = JSON.parse(sessionStorage.getItem("project"));
  } catch (e: any) {
    project = null;
    console.error("JSON.parse error - ", e.message);
  }
  var projectID = project.id;

  this.roleService.download(projectID).subscribe((response) => {
    let fileBlob = response as Blob;
    importedSaveAs(fileBlob, "Roles.xlsx");
  });
}
checkEnterPressed(event: any, val: any) {
  if (event.keyCode === 13) {
    this.filterItem(event.srcElement.value);
  }
}
computeRole(superadmin) {
  let project: Project;
  try {
    project = JSON.parse(sessionStorage.getItem("project"));
  } catch (e: any) {
    project = null;
    console.error("JSON.parse error - ", e.message);
  }
  let pID: number = project.id;
  let tempRolesArray = new Array<Role>();
  this.associatedproject = [];
  this.rolesArraySorted.forEach((element) => {
    if (superadmin) tempRolesArray.push(element);
    else if (element.projectId == pID || element.projectId == null) tempRolesArray.push(element);
  });
  this.rolesArraySorted = tempRolesArray;
  this.rolesArraySorted = this.rolesArraySorted.sort((a, b) =>
    a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
  );
  this.roles = this.rolesArraySorted;
  this.rolesArraySorted.forEach((element) => {
    if (element.projectId == null) {
      element["projectName"] = "Default Role";
      this.associatedproject.push(element);
    } else {
      this.ProjectList.forEach((element1) => {
        if (element1.id == element.projectId) {
          element["projectName"] = element1.name;
          this.associatedproject.push(element);
        }
      });
    }
  });
  this.rolesArraySorted = this.associatedproject;
  this.rolesLength = this.rolesArraySorted.length;
  this.rolesArraySorted = this.rolesArraySorted.sort((a, b) =>
    a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
  );
  this.roleList = new MatTableDataSource(this.rolesArraySorted);
  this.roleList.sort = this.sort;
  this.roleList.paginator = this.paginator;
  this.rolesFilter = Object.assign([], this.roles);

}
trackByMethod(index, item) { }
showUploadDialog() {
  this.popup = !this.popup;
}
}
