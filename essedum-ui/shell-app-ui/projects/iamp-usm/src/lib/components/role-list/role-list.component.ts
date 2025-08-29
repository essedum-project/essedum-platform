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
import { Portfolio } from "../../models/portfolio";
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
  
  // Filter options for the aip-filter component
  filterOptions: any[] = [];
  selectedFilterValues: any = {
    roles: [],
    projects: [],
    descriptions: []
  };
  
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
    public dialog: MatDialog,
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
    // Initialize the lastRefreshedTime
    this.lastRefreshedTime = new Date();
    
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
    this.pagedRoles = this.roles.slice(startIndex, endIndex);
    this.lastPage = Math.floor((this.rolesLength - 1) / this.rowsPerPage);


  }
  getPageNumbers() {
    const totalPages = this.lastPage + 1;
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  navigatePage(direction: 'Prev' | 'Next') {
    if (direction === 'Prev' && this.page > 0) {
      this.page--;
    } else if (direction === 'Next' && this.page < this.lastPage) {
      this.page++;
    }
    this.updatePagedData();
  }

  changePage(p: number) {

    this.page = p;
    this.updatePagedData();

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
    this.lastRefreshedTime = new Date();
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
      (error) => this.messageService.messageNotification("Could not get the results", "error"),
      () => {

        if (role.roleadmin) {


          let userprojectrole = new UserProjectRole();

          let portfolio: Portfolio;
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

          userprojectrole.portfolio_id = new Portfolio({ id: portfolio.id });
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
              this.rolesResponse = res;
              this.rolesContent = this.rolesResponse.content;
              this.totalrecords = this.rolesContent.length;
              this.rolesArraySorted = res.content;
              this.computeRole(true);
              
              // Initialize filter options now that we have data
              this.initializeFilterOptions();

            },
            (error) => this.messageService.messageNotification("Could not fetch", "error")
          );
        }
      }
    );
  }

  checkPerms(roleSent: any) {
    let role: Role;
    let portfolio: Portfolio;
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

  Search(searchText?: string) {
    this.lastRefreshedTime = new Date();
    let newApps = [];
    
    // Check if searchText is provided from the header search input
    if (searchText !== undefined && searchText !== '') {
      // Filter roles by name containing the search text
      newApps = Object.assign([], this.rolesArraySorted).filter((item1) =>
        item1.name ? item1.name.toLowerCase().includes(searchText.toLowerCase()) : false
      );
    } else if (searchText === '') {
      // If search text is empty, show all roles
      newApps = this.rolesArraySorted;
    } else if (this.searchedRole == "All" || this.searchedRole == "") {
      newApps = this.rolesArraySorted;
    } else {
      newApps = Object.assign([], this.rolesArraySorted).filter((item1) =>
        item1.name == null ? "" : item1.name.toLowerCase() == this.searchedRole.toLowerCase()
      );
    }
    
    if (this.selectedDesc == "All" || this.selectedDesc == "") {
      // Keep as is
    } else {
      newApps = newApps.filter(
        (item1) =>
          item1.description == null
            ? ""
            : item1.description.toLowerCase().indexOf(this.selectedDesc.toLowerCase()) > -1
      );
    }
    this.roles = newApps;
    this.roleList = new MatTableDataSource(newApps);
    this.roleList.sort = this.sort;
    this.roleList.paginator = this.paginator;
    this.rolesLength = newApps.length;
    
    // Update pagination for the new UI
    this.totalrecords = newApps.length;
    this.lastPage = Math.ceil(this.totalrecords / this.rowsPerPage) - 1;
    this.page = 0; // Reset to first page
    this.updatePagedRoles(newApps);
  }

  Refresh() {
    this.lastRefreshedTime = new Date();
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
    if (!selectedValue) {
      this.clearAllFilters('Role');
      return;
    }
    if (!this.selectedAdapterType.includes(selectedValue)) {
      this.selectedAdapterType.push(selectedValue);
    }
    this.rolesFilter = this.rolesFilter.map(option => ({
      ...option,
      selected: option.label === selectedValue
    })

    );
  }
  clearAllFilters(filtertype: string): void {
    if (filtertype === 'Role') {
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
        this.messageService.messageNotification("Role updated successfully", "success");
        this.clear();
      },
      (error) => this.messageService.messageNotification("Could not update", "error")
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
      this.fetchRole();

    });
  }


  editRole(role: Role) {
    this.router.navigate(["/landing/iamp-usm/role/edit", role.id]);
    // this.router.navigate(["./role/edit", 6], { relativeTo: this.route });

  }

  viewRole(role: Role) {
    this.router.navigate(["/landing/iamp-usm/role/view", role.id]);
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
      (error) => this.messageService.messageNotification(error, "error")
    );
  }
  delete(role: Role) {
    this.roleService.delete(role.id).subscribe(
      (Response) => {
        if (sessionStorage.getItem("telemetry") == "true") {
          // this.telemetryService.audit(role,"DELETE");
        }
        sessionStorage.setItem("UpdatedUser", "true");
        this.messageService.messageNotification("Role Deleted successfully", "success");
        this.fetchRole();
        if (this.myInputReference.nativeElement) {
          this.myInputReference.nativeElement.value = null;
        }
      },
      (error) => this.messageService.messageNotification("Could not delete", "error")
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
    this.updatePagedData();

  }
  trackByMethod(index, item) { }
  showUploadDialog() {
    this.popup = !this.popup;
  }

  private initializeFilterOptions(): void {
    const filterOptions: any[] = [];

    if (this.rolesContent && this.rolesContent.length > 0) {
      filterOptions.push({
        type: 'role',
        options: this.rolesContent.map(role => ({
          label: role.name,
          value: role.name
        }))
      });
    }

    if (this.ProjectList && this.ProjectList.length > 0) {
      filterOptions.push({
        type: 'project',
        options: this.ProjectList.map(project => ({
          label: project.name,
          value: project.name
        }))
      });
    }

    this.filterOptions = filterOptions;
  }

  onFilterSelected(event: any): void {
    this.selectedFilterValues = event;
    this.applyFilters();
  }

  onFilterStatusChange(isExpanded: boolean): void {
    this.isFilterExpanded = isExpanded;
  }

  applyFilters(): void {
    // Reset to original list
    let filteredRoles = [...this.rolesContent];
    
    // Apply role filters
    if (this.selectedFilterValues.roles && this.selectedFilterValues.roles.length > 0) {
      filteredRoles = filteredRoles.filter(role => 
        this.selectedFilterValues.roles.includes(role.name)
      );
    }
    
    // Apply project filters
    if (this.selectedFilterValues.projects && this.selectedFilterValues.projects.length > 0) {
      filteredRoles = filteredRoles.filter(role => 
        role.projectId && this.selectedFilterValues.projects.includes(role.projectId)
      );
    }
    
    // Apply description filters if needed
    if (this.selectedFilterValues.descriptions && this.selectedFilterValues.descriptions.length > 0) {
      filteredRoles = filteredRoles.filter(role => 
        role.description && this.selectedFilterValues.descriptions.includes(role.description)
      );
    }
    
    // Update pagination
    this.totalrecords = filteredRoles.length;
    this.lastPage = Math.ceil(this.totalrecords / this.rowsPerPage) - 1;
    
    // Update the display with the filtered roles
    this.updatePagedRoles(filteredRoles);
  }
  
  updatePagedRoles(filteredRoles: any[] = null): void {
    // If no filtered roles provided, use the current roles content
    const roles = filteredRoles || this.rolesContent;
    
    // Calculate pagination
    const startIndex = this.page * this.rowsPerPage;
    const endIndex = Math.min(startIndex + this.rowsPerPage, roles.length);
    
    // Update the paged roles for display
    this.pagedRoles = roles.slice(startIndex, endIndex);
  }
}
