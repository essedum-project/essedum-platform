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
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ConfirmDeleteDialogComponent } from "../../support/confirm-delete-dialog.component";
import { UserProjectRole } from "../../models/user-project-role";
import { UserProjectRoleService } from "../../services/user-project-role.service";
import { Users } from "../../models/users";
import { UsersService } from "../../services/users.service";
import { Project } from "../../models/project";
import { ProjectService } from "../../services/project.service";
import { Role } from "../../models//role";
import { RoleService } from "../../services/role.service";
import { HelperService } from "../../services/helper.service";
import { FormControl } from "@angular/forms";
import { Msg } from "../../shared-modules/services/msg";
import * as _ from "lodash";
import { UsmPortfolioService } from "../../services/usm-portfolio.service";
import { Portfolio } from "../../models/portfolio";
import { Observable, ReplaySubject, Subject, Subscription } from "rxjs";
import { DeleteComponent } from "../../shared-modules/confirm-delete/delete.component";
import { IampUsmService } from "../../iamp-usm.service";
import { takeUntil } from "rxjs/operators";
import { DatePipe } from "@angular/common";
// import { LeapTelemetryService } from "../../telemetry-util/telemetry.service";
// import { ApisService } from "../../services/apis.service";
@Component({
  //moduleId: module.id,
  templateUrl: "user-project-role-list.component.html",
  selector: 'lib-user-project-role-list',
  styleUrls: ["user-project-role-list.component.css"],
})
export class UserProjectRoleListComponent implements OnInit, OnChanges {
  lastRefreshedTime: Date = new Date();
  @Input() header = "User Roles...";
  @Output() changeView: EventEmitter<boolean> = new EventEmitter();
  @Input() sub: boolean;
  @Input() showCreateUserRole: boolean;
  @Output() onAddNewClicked = new EventEmitter();

  // Filter properties
  isFilterExpanded: boolean = false;
  filterOptions: any[] = [];
  selectedFilterValues: any = {
    users: [],
    roles: [],
    projects: []
  };

  userRoleToDelete: UserProjectRole;
  displayedColumns: string[] = ["name", "description", "actions"];
  UserList: MatTableDataSource<any>;
  existingUserProjectRole: MatTableDataSource<any>;
  displayColumns: string[] = ["name", "description", "actions"];
  enablePortfolioAdminView: boolean = false;
  enableProjectAdminView: boolean = false;

  @Input() project: Project;
  public usersFilterCtrl: FormControl = new FormControl();
  protected _onDestroy = new Subject<void>();
  public usersListSearch: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public rolesFilterCtrl: FormControl = new FormControl();
  public rolesListSearch: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  currentPage: PageResponse<UserProjectRole> = new PageResponse<UserProjectRole>(0, 0, []);
  @ViewChild("myInput", { static: false }) myInputReference: ElementRef;
  @Input() selectedUser: Users;
  @Input() selectedRole: Role;
  filterUser: any;
  filterRole: any;
  filterProject: any;
  role;
  flag: boolean = false;
  defaultFlag: boolean = false;
  callId: any;
  errorMessage: boolean = false;
  pageEvent: any;
  constructor(
    public router: Router,
    public messageService: MessageService,
    public confirmDeleteDialog: MatDialog,
    public confirmDialog: MatDialog,
    public helperService: HelperService,
    private route: ActivatedRoute,
    private userRoleService: UserProjectRoleService,
    private userService: UsersService,
    private roleService: RoleService,
    private projectService: ProjectService,
    public usm_portfolio: UsmPortfolioService,
    private usmService: IampUsmService,
    // private telemetryService: LeapTelemetryService,
    public datePipe: DatePipe,
    // private apisService: ApisService
  ) {}

  /**
   * Initialize filter options based on loaded data
   */
  initializeFilterOptions() {
    // Create filter options from loaded data
    const filterOptions = [];
    
    // Add user filter options if available - show when project or selectedRole is defined
    if (this.usersList && this.usersList.length > 0 && (this.project != undefined || this.selectedRole != undefined)) {
      filterOptions.push({
        type: 'user',
        options: this.usersList.map(user => ({ 
          value: user.id, 
          label: user.user_login || user.user_f_name || 'Unnamed User'
        }))
      });
    }
    
    // Add role filter options if available - show when project or selectedUser is defined
    if (this.roleList && this.roleList.length > 0 && (this.project != undefined || this.selectedUser != undefined)) {
      filterOptions.push({
        type: 'role',
        options: this.roleList.map(role => ({ 
          value: role.id, 
          label: role.name || 'Unnamed Role'
        }))
      });
    }
    
    // Add project filter options if available - show when selectedRole is defined or when selectedUser is defined and not projectadmin
    if (this.projectList && this.projectList.length > 0 && 
        (this.selectedRole != undefined || (this.selectedUser != undefined && (!this.role || !this.role.projectadmin)))) {
      filterOptions.push({
        type: 'project',
        options: this.projectList.map(project => ({ 
          value: project.id, 
          label: project.name || 'Unnamed Project'
        }))
      });
    }
    
    // Add portfolio filter options if available - only when user is a roleadmin
    if (this.usm_portfolio_idArray && this.usm_portfolio_idArray.length > 0 && this.role && this.role.roleadmin) {
      filterOptions.push({
        type: 'portfolio',
        options: this.usm_portfolio_idArray.map(portfolio => ({ 
          value: portfolio.id, 
          label: portfolio.portfolioName || 'Unnamed Portfolio'
        }))
      });
    }
    
    // Update filter options
    this.filterOptions = filterOptions;
    
    console.log('Filter options initialized:', this.filterOptions);
    
    // Force change detection after setting filter options
    setTimeout(() => {
      this.filterOptions = [...this.filterOptions];
      console.log('Filter options refreshed with change detection');
    }, 0);
  }
  

  /**
   * Handler for filter selection events
   */
  onFilterSelected(event: any) {
    console.log('Filter selected:', event);
    // Update selected filter values
    this.selectedFilterValues = event;
    // Apply filters to the data
    this.applyFilters();
  }

  /**
   * Handler for filter panel expansion/collapse
   */
  onFilterStatusChange(isExpanded: boolean) {
    this.isFilterExpanded = isExpanded;
  }

  /**
   * Apply selected filters to the data
   */
  applyFilters() {
    console.log('Applying filters:', this.selectedFilterValues);
    let filteredData = [...this.usersCopy]; // Start with a copy of the original data

    // Filter by users if any are selected
    if (this.selectedFilterValues.users && this.selectedFilterValues.users.length > 0) {
      const userValues = this.selectedFilterValues.users;
      filteredData = filteredData.filter(item => 
        userValues.some(u => u === item.user_id?.id)
      );
    }

    // Filter by roles if any are selected
    if (this.selectedFilterValues.roles && this.selectedFilterValues.roles.length > 0) {
      const roleValues = this.selectedFilterValues.roles;
      filteredData = filteredData.filter(item => 
        roleValues.some(r => r === item.role_id?.id)
      );
    }

    // Filter by projects if any are selected
    if (this.selectedFilterValues.projects && this.selectedFilterValues.projects.length > 0) {
      const projectValues = this.selectedFilterValues.projects;
      filteredData = filteredData.filter(item => 
        projectValues.some(p => p === item.project_id?.id)
      );
    }
    
    // Filter by portfolios if any are selected
    if (this.selectedFilterValues.portfolio && this.selectedFilterValues.portfolio.length > 0) {
      const portfolioValues = this.selectedFilterValues.portfolio;
      filteredData = filteredData.filter(item => 
        portfolioValues.some(p => p === item.portfolio_id?.id)
      );
    }

    // Update the displayed data
    this.users = filteredData;
    
    // Update the MatTableDataSource if it exists
    if (this.UserList) {
      this.UserList.data = filteredData;
    }
    
    console.log('Filtered data length:', filteredData.length);
  }

  // listView() {
  //   this.changeView.emit(false);
  // }
  showCreate: boolean = false;
  users = new Array<UserProjectRole>();
  usersCopy = new Array<UserProjectRole>();
  userProjectRoles = new Array<UserProjectRole>();
  showList: boolean = false;
  view: boolean = false;
  buttonFlag: boolean = false;
  viewUser: boolean = false;
  edit: boolean = false;
  isBackHovered: boolean = false;
  lazyload = { first: 0, rows: 5000, sortField: null, sortOrder: null };
  user = new UserProjectRole();
  currentUser = new UserProjectRole();
  selected = new FormControl(0);
  tab = "User-Role-Mapping";
  example: UserProjectRole = new UserProjectRole();
  projectList = new Array<Project>();
  roleList = new Array<Role>();
  rolesToBeFiltered = new Array<Role>();
  usersList = new Array<Users>();
  userProjectRole = new UserProjectRole();
  usm_portfolio_idArray: Portfolio[] = [];
  usm_portfolio_idObject: Portfolio = new Portfolio();
  private _portfolio_id: Portfolio;
  specificProjectList = new Array<Project>();
  specificRoleList = new Array<Role>();
  existingUserProjectRoles = new Array<UserProjectRole>();
  private paginator: MatPaginator;
  private sort: MatSort;
  p: number;
  pageSize = 6;
  pageIndex: number = 0;
  filterFlag = false;
  wavesLength: number;
  filterFlag1: boolean = false;
  projectSearched: any;
  busy: Subscription;
  auth: string = "";
  isAuth: boolean = true;
  editFlag: boolean = false;
  viewFlag: boolean = true;
  deleteFlag: boolean = false;
  createFlag: boolean = false;
  permissionList: any[];
  selectedPermissionList: any[];
  demoUserFlag: boolean = false;
  fromProject: any;
  fromProjectFlag: boolean = false;
  prjFlag: boolean = false;
  filteredroleslist = [];
  processdata: any;
  
  // Pagination variables
  page: number = 0;
  lastPage: number = 0;
  totalItems: number = 0;
  pagesCount: number = 0;

  @ViewChild(MatSort, { static: false }) set matSort(ms: MatSort) {
    this.sort = ms;
  }

  listView() {
    this.fetchUserProjectRoles(null);
    this.showCreate = false;
    this.changeView.emit(true);
    this.view = false;
    this.edit = false;
    this.viewUser = false;
    this.projectSearched = undefined;
    this.filterProject = undefined;
    this.filterRole = undefined;
    this.filterUser = undefined;
    this.filterFlag = false;
    this.filterFlag1 = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    let role: any;
    try {
      role = JSON.parse(sessionStorage.getItem("role"));
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }

    if(role.id != 6 && role.roleadmin && changes["project"]){
      if(changes["project"].currentValue){
        this.fromProjectFlag = true;
        this.fromProject = changes["project"].currentValue;
      }
    }
    
    // Refresh filter options if any of the key inputs change
    if (changes["project"] || changes["selectedUser"] || changes["selectedRole"]) {
      console.log("Key input changed, refreshing filter options");
      // Wait for the next tick to ensure data is processed
      setTimeout(() => {
        this.initializeFilterOptions();
      }, 0);
    }
  }

  createView() {
    this.showCreate = true;
    this.edit = false;
    this.user = new UserProjectRole();
    this.userProjectRole = new UserProjectRole();
    this.errorMessage = false;
    if (this.myInputReference) {
      this.myInputReference.nativeElement.value = null;
      this.projectSearched = undefined;
    }
    this.fetchApis();
    this.loadPage({ first: 0, rows: 5000, sortField: null, sortOrder: null });
  }

  clearWave() {
    this.project = new Project();
  }

  /**
   * When used as a 'sub' component (to display one-to-many list), refreshes the table
   * content when the input changes.
   */

  ngOnInit() {
    console.log("THIS WORKSSSS")
    if (sessionStorage.getItem("usmAuthority")) {
      sessionStorage.removeItem("usmAuthority");
      this.auth = "";
    }

    if(this.selectedRole != undefined){
      if(this.selectedRole.roleadmin){
        this.enablePortfolioAdminView = true;
      } else if(this.selectedRole.projectadmin){
          this.enableProjectAdminView = true
      } else{
          this.enablePortfolioAdminView = false;
          this.enableProjectAdminView = false;
      }
    } else {
        this.enablePortfolioAdminView = false;
        this.enableProjectAdminView = false;
    }

    try {
      this.role = JSON.parse(sessionStorage.getItem("role"));
    } catch (e : any)  {
      this.role = null;
      console.error("JSON.parse error - ", e.message);
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

    if (this.showCreateUserRole) {
      this.showCreate = true;
      this.edit = false;
      this.user = new UserProjectRole();
      this.changeView.emit(false);
      this.fetchApis();
    } else this.fetchUserProjectRoles(null);
    
    // Initialize empty filter options until data is loaded
    this.filterOptions = [];
    
    // Wait for data to be loaded, then initialize filter options
    setTimeout(() => {
      this.fetchApis();
    }, 0);
    
    // this.loadPage({ first: 0, rows: 5000, sortField: null, sortOrder: null });
    this.usersFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filterusers();
    });
    this.rolesFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filterroles();
    });
  }

  protected filterusers() {
    if (!this.usersList) {
      return;
    }
    let search = this.usersFilterCtrl.value;
    if (!search) {
      this.usersListSearch.next(this.usersList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.usersListSearch.next(
      this.usersList.filter((users) => users.user_login.toLowerCase().indexOf(search) > -1)
    );
  }
  protected filterroles() {
    if (!this.specificRoleList) {
      return;
    }
    let search = this.rolesFilterCtrl.value;
    if (!search) {
      this.rolesListSearch.next(this.specificRoleList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.rolesListSearch.next(
      this.specificRoleList.filter((role) => role.name.toLowerCase().indexOf(search) > -1)
    );
  }
  /**
   * Invoked when user presses the search button.
   */
  search() {
    if (!this.sub) {
      this.loadPage({ first: 0, rows: 5000, sortField: null, sortOrder: null });
    }
  }

  /**
   * Invoked while inititializing component to fetch datatable.
   */
  loadPage(event) {
    let tempUserProjectRole = new UserProjectRole();
    if (this.project != undefined) tempUserProjectRole.project_id = new Project({ id: this.project.id });
    if (this.selectedUser != undefined) tempUserProjectRole.user_id = new Users({ id: this.selectedUser.id });
    if (this.selectedRole != undefined) tempUserProjectRole.role_id = new Role({ id: this.selectedRole.id });
    this.userRoleService.findAll(tempUserProjectRole, event).subscribe(
      (pageResponse) => {
        this.currentPage = pageResponse;
        this.users = this.currentPage.content;
        if (this.selectedUser != null || this.selectedRole != null)
          this.users = this.users.sort((a, b) =>
            a.project_id.name.toLowerCase() > b.project_id.name.toLowerCase() ? 1 : -1
          );
        if (this.project != undefined)
          this.users = this.users.sort((a, b) =>
            a.user_id.user_f_name.toLowerCase() > b.user_id.user_f_name.toLowerCase() ? 1 : -1
          );

        this.usersCopy = this.users;

        // this.UserList = new MatTableDataSource(this.users);
        // if (this.UserList) {
        //     this.UserList.paginator = this.paginator;
        //     this.UserList.sort = this.sort;
        // }
      },
      (error) => this.messageService.messageNotification("Could not get the results", "error")
    );
  }

  Refresh() {
    this.lastRefreshedTime = new Date();
    this.loadPage({ first: 0, rows: 5000, sortField: null, sortOrder: null });
  }
  
  fetchUserProjectRoles(pageEvent) {
    this.lastRefreshedTime = new Date();
    this.demoUserFlag = false;
    this.prjFlag = false;
    if (pageEvent == null || !pageEvent) {
      pageEvent = { page: 0, size: this.pageSize };
    }
    let tempUserProjectRole = new UserProjectRole();
    if (this.project != undefined) {
    if(this.project.name =='Core'){
        this.prjFlag = true;
      }
     tempUserProjectRole.project_id = new Project({ id: this.project.id });
    }
    if (this.selectedUser != undefined) tempUserProjectRole.user_id = new Users({ id: this.selectedUser.id });
    if (this.selectedRole != undefined) tempUserProjectRole.role_id = new Role({ id: this.selectedRole.id });
    if (this.selectedUser != undefined && this.selectedUser.user_email == "demouser@infosys.com") {
      this.demoUserFlag = true;
    }
    if (this.role.projectadmin) {
      let project: Project;
      try {
        project = JSON.parse(sessionStorage.getItem("project"));
      } catch (e : any)  {
        project = null;
        console.error("JSON.parse error - ", e.message);
      }
      tempUserProjectRole.project_id = new Project({ id: project.id });
      if (this.selectedUser != undefined)
        tempUserProjectRole.user_id = new Users({ id: this.selectedUser.id });
    }
 
      if (this.role.roleadmin) {
        let portfolio: Portfolio;
        try {
          portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
        } catch (e : any)  {
          portfolio = null;
          console.error("JSON.parse error - ", e.message);
        }
        tempUserProjectRole.portfolio_id = new Portfolio({ id: portfolio.id });
      }

    this.userRoleService.FindAll(tempUserProjectRole, pageEvent).subscribe(
      (pageResponse) => {
        this.currentPage = pageResponse;
        this.users = this.currentPage.content;
        if (this.selectedUser != null || this.selectedRole != null)
          this.users = this.users.sort((a, b) =>
            a.project_id.name.toLowerCase() > b.project_id.name.toLowerCase() ? 1 : -1
          );
        if (this.project != undefined)
          this.users = this.users.sort((a, b) =>
            a.user_id.user_f_name.toLowerCase() > b.user_id.user_f_name.toLowerCase() ? 1 : -1
          );

        this.usersCopy = this.users;
        this.wavesLength = this.currentPage.totalElements;
        this.UserList = new MatTableDataSource(this.users);
        if (this.UserList) {
          this.UserList.paginator = this.paginator;
          this.UserList.sort = this.sort;
        }
        
        // Update pagination data
        this.totalItems = this.currentPage.totalElements;
        this.page = pageEvent.page;
        this.pagesCount = Math.ceil(this.totalItems / this.pageSize);
        this.lastPage = this.pagesCount - 1;
        
        // Load other required data for filters if not already loaded
        if (this.filterOptions.length === 0) {
          this.fetchApis();
        }
        
        // Apply any active filters
        if (this.selectedFilterValues && 
            (this.selectedFilterValues.users?.length > 0 || 
             this.selectedFilterValues.roles?.length > 0 || 
             this.selectedFilterValues.projects?.length > 0)) {
          this.applyFilters();
        }
      },
      (error) => this.messageService.messageNotification("Could not get the results", "error")
    );
  }
  onRowSelect(event: any) {
    let id = event.id;
    this.router.navigate(["/project", id]);
  }
  rowSelected(item: Project) {
    this.router.navigate(["/project-view", item.id]);
  }
  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  checkForAdminAuthority(){
    let project: any;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }

    let role: any;
    try {
      role = JSON.parse(sessionStorage.getItem("role"));
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }

    let portfolio: any;
    try {
      portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
    } catch (e: any) {
      console.error("JSON.parse error - ", e.message);
    }

    if(role.roleadmin){
      this.flag = true;
      this.callId = portfolio.id;
    } else if(role.projectadmin){
      this.flag = false;
      this.callId = project.id;
    } else {
      this.defaultFlag = true;
    }
  }

  fetchUsers() {
    this.checkForAdminAuthority();
    if(!this.defaultFlag){

      this.userService.findAllByProjectIdOrPortfolioId(new Users(), this.lazyload, this.flag, this.callId).subscribe((res) => {
        this.usersList = res.content;
        this.usersList = this.usersList.sort((a, b) =>
          a.user_login.toLowerCase() > b.user_login.toLowerCase() ? 1 : -1
        );
        this.usersListSearch.next(this.usersList.slice());
        
        console.log('Users loaded:', this.usersList.length);
        // Call the data loaded counter
        if (typeof this.checkAllDataLoaded === 'function') {
          this.checkAllDataLoaded();
        }
      });

    } else {

      this.userService.findAll(new Users(), this.lazyload).subscribe((res) => {
        this.usersList = res.content;
        this.usersList = this.usersList.sort((a, b) =>
          a.user_login.toLowerCase() > b.user_login.toLowerCase() ? 1 : -1
        );
        this.usersListSearch.next(this.usersList.slice());
        
        console.log('Users loaded:', this.usersList.length);
        // Call the data loaded counter
        if (typeof this.checkAllDataLoaded === 'function') {
          this.checkAllDataLoaded();
        }
      });

    }
  }

  fetchProjects() {
    let project = new Project();
    if (this.role.roleadmin) {
      let portfolio: Portfolio;
      try {
        portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
      } catch (e : any)  {
        portfolio = null;
        console.error("JSON.parse error - ", e.message);
      }
      project.portfolioId = new Portfolio({ id: portfolio.id });
    }
    this.projectService.findAll(project, this.lazyload).subscribe((res) => {
      this.projectList = res.content;
      this.projectList = this.projectList.sort((a, b) =>
        a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
      );
      
      console.log('Projects loaded:', this.projectList.length);
      
      // Call checkAllDataLoaded if it exists
      if (typeof this.checkAllDataLoaded === 'function') {
        this.checkAllDataLoaded();
      }
      
      // Force filter initialization after projects are loaded
      // This is a backup in case checkAllDataLoaded doesn't work
      setTimeout(() => {
        this.initializeFilterOptions();
        console.log('Filter options initialized after projects loaded');
      }, 0);
    });
      
      if (this.selectedRole != undefined) this.fetchRelatedProjects();
      if (this.selectedUser != undefined) this.fetchRoles();
    }
  

  fetchRoles() {

    let userprojectrole = new UserProjectRole();

    let portfolio: Portfolio;
    let project: Project;
    let user: Users;
    let allRole = new Role(); /** To fetch all the roles */
    allRole.projectId = null;

    try {
      portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
      project = JSON.parse(sessionStorage.getItem("project"));
      user = JSON.parse(sessionStorage.getItem("user"));
    } catch (e : any)  {
      portfolio = null;
      project = null;
      user = null;
      console.error("JSON.parse error - ", e.message);
    }

    if (this.role.roleadmin) {


      userprojectrole.portfolio_id = new Portfolio({ id: portfolio.id });
      userprojectrole.project_id = new Project({ id: project.id });
      userprojectrole.user_id = new Users({ id: user.id });
      // this.userRoleService.findAll(userprojectrole, this.lazyload).subscribe(res => {
      //     this.roleList = [];
      //     res.content.forEach(item => {
      //         if (item.role_id.id != 6) {
      //             if (item.role_id.projectId == null)
      //                 this.roleList.push(item.role_id)
      //         }
      //     })
      // })

      this.roleService.findAll(allRole, this.lazyload).subscribe((res) => {
        res.content.forEach((item) => {
          if (item.id != 6) {
            if(!item.projectadmin && !item.roleadmin){
              this.roleList.push(item);
              this.rolesToBeFiltered.push(item);
            }
          }
        });
        this.roleList = this.roleList.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
        
        // Initialize filter options if other data is loaded
        if (this.usersList.length > 0 && this.projectList.length > 0) {
          this.initializeFilterOptions();
        }
        
        //this.filterRolesForProject()
        if(this.fromProjectFlag){
          this.fetchRelatedRoles(this.fromProject);
        } else {
          this.fetchRelatedRoles(project);
        }
        
        if (this.selectedUser != undefined) {
          this.fetchAllProject();
        }
      });
    } else if(this.role.projectadmin){
      this.roleService.findAll(allRole, this.lazyload).subscribe((res) => {
        res.content.forEach((item) => {
          if (item.id != 6) {
            if(!item.projectadmin && !item.roleadmin){
              this.roleList.push(item);
              this.rolesToBeFiltered.push(item);
            }
          }
        });
        this.roleList = this.roleList.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
        if(this.fromProjectFlag){
          this.fetchRelatedRoles(this.fromProject);
        } else {
          this.fetchRelatedRoles(project);
        }
        
        if (this.selectedUser != undefined) {
          this.fetchAllProject();
        }
      });
    }
    else {
      let allRole = new Role(); /** To fetch all the roles */
      allRole.projectId = null;
      this.roleService.findAll(allRole, this.lazyload).subscribe((res) => {
        this.roleList = res.content;
        this.rolesToBeFiltered = res.content;
        this.roleList = this.roleList.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
        this.fetchRelatedRoles(this.project);          
        if (this.selectedUser != undefined) {
          this.fetchAllProject();
        }
      });
    }
  }

  fetchRelatedProjects() {
    let tempProjectArray = new Array<Project>();
    let tempspecificProjectList = new Array<Project>();
    if (this.selectedRole.projectId == null) {
      /** Default role */ this.projectList.forEach((element) => {
        if (element.defaultrole == true) tempProjectArray.push(element);
      });
    } else {
      /** Role is mapped to a project */
      this.projectList.forEach((element) => {
        if (element.id == this.selectedRole.projectId) {
          tempProjectArray.push(element);
        }
      });
    }
    this.specificProjectList = tempProjectArray;
    
    if(this.enablePortfolioAdminView && this.selectedRole && this.specificProjectList.length){
      this.specificProjectList.forEach((item) => {
        if(item.portfolioId != null && item.portfolioId.id == this.selectedRole.portfolioId){
          tempspecificProjectList.push(item);
        }
      });

      this.specificProjectList = tempspecificProjectList;
    }
  }
  fetchRelatedRoles(project?: any) {
    let tempRolesArray = new Array<Role>();

      if(project != null || project != undefined){
        if (project.defaultrole == false) {
          this.roleList.forEach((element) => {
            if (element.projectId == project.id) tempRolesArray.push(element);
          });
        } else {
          /** if default roles are used (==true) along with specific roles */
          this.roleList.forEach((element) => {
            if (element.projectId == project.id || element.projectId == null) tempRolesArray.push(element);
          });
        }
        this.specificRoleList = tempRolesArray;
        this.roleList = tempRolesArray;
        this.rolesListSearch.next(this.specificRoleList.slice());
       } else {
          this.specificRoleList = this.roleList;
          this.rolesListSearch.next(this.specificRoleList.slice());
       }

  }
  fetchAllProject() {
    this.specificProjectList = this.projectList;

    if (this.edit || this.view || this.role.projectadmin) {
      this.filterRolesForProject();
    } else {
      this.specificRoleList = this.roleList;
      this.rolesListSearch.next(this.specificRoleList.slice());
    }
  }

  filterRolesForProject() {
    if(this.role.id != 6){

      if(!this.userProjectRole?.role_id)
      this.userProjectRole.role_id = new Role();
      if (this.userProjectRole.project_id != undefined && this.userProjectRole.project_id != null) {
        this.setSpecificRolesAgain(this.userProjectRole.project_id);
      }

    }
    // if (this.role.projectadmin) {
    //   let project: Project;
    //   try {
    //     project = JSON.parse(sessionStorage.getItem("project"));
    //     this.setSpecificRolesAgain(project);
    //   } catch (e : any)  {
    //     this.project = undefined;
    //     console.error("JSON.parse error - ", e.message);
    //   }
    // }
    this.fetchRolebasedonProject();
  }

  // filterrolesforprojectadmin(){
  //   if (this.role.projectadmin) {
  //     let project: Project;
  //     try {
  //       project = JSON.parse(sessionStorage.getItem("project"));
  //     } catch (e:any) {
  //       this.project = undefined;
  //       console.error("JSON.parse error - ", e.message);
  //     }
  //     this.apisService.getUserInfoData().subscribe((pageResponse) => {
  //       this.processdata = pageResponse["porfolios"];
  //       this.processdata.forEach((element) => {
  //         if (element.porfolioId.id == project.portfolioId.id) {
  //           element.projectWithRoles.forEach((element1) => {
  //             try{
  //               if (element1.projectId.id == project.id) {
  //                 this.filteredroleslist = element1.roleId
  //                 this.setSpecificRolesAgain(project);
  //               }
  //             }catch(e){}
  //           });
  //         }
  //       });
  //     });

  //   }
  // }

  // filterrolesforportfolioadmin(){
  //   if (this.role.roleadmin) {
  //     let project: Project;
  //     try {
  //       project = JSON.parse(sessionStorage.getItem("project"));
  //     } catch (e:any) {
  //       this.project = undefined;
  //       console.error("JSON.parse error - ", e.message);
  //     }
  //     this.apisService.getUserInfoData().subscribe((pageResponse) => {
  //       this.processdata = pageResponse["porfolios"];
  //       this.processdata.forEach((element) => {
  //         if (element.porfolioId.id == project.portfolioId.id) {
  //           element.projectWithRoles.forEach((element1) => {
  //             try{
  //                 .push(...element1.projectId.id);
  //                 =
  //             }catch(e){}
  //           });
  //         }
  //       });

  //       // this.filteredroleslist = this.filteredroleslist.filter((obj, index) => {
  //       //   return index === this.filteredroleslist.findIndex(o => obj.id === o.id);
  //       // });
  //       // this.setSpecificRolesAgain(project);
  //     });

  //   }
  // }

  setSpecificRolesAgain(project: any) {
    let tempRolesArray = new Array<Role>();

    if (project.defaultrole == false) {
      this.rolesToBeFiltered.forEach((element) => {
        if (element.projectId == project.id) tempRolesArray.push(element);
      });
    } else {
      /** if default roles are used (==true) along with specific roles */
      this.rolesToBeFiltered.forEach((element) => {
        if (element.projectId == project.id || element.projectId == null) tempRolesArray.push(element);
      });
    }
    this.specificRoleList = tempRolesArray;
    this.specificRoleList = this.specificRoleList.sort((a, b) =>
      a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    );
    this.rolesListSearch.next(this.specificRoleList.slice());
    // if(this.role.projectadmin){
    //   this.specificRoleList = this.roleList;
    //   this.rolesListSearch.next(this.specificRoleList.slice());
    // }
    // if(this.role.roleadmin){
    //   this.specificRoleList = this.roleList;
    //   this.rolesListSearch.next(this.specificRoleList.slice());
    // }
    // if (!this.edit)
    //     this.userProjectRole.role_id = this.specificRoleList[0];
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 && o1.id == o2.id;
  }
  saveuserprojectrole() {
    let roles: any = this.userProjectRole.role_id;
    let users: any = this.userProjectRole.user_id;
    let usersLength: number = users.length;
    //let time_stamp: String = this.userProjectRole.time_stamp;
    let temp: UserProjectRole = new UserProjectRole();
    this.userProjectRoles = new Array<UserProjectRole>();
    if (this.project) {
      if (roles.length > 1) {
        roles.forEach((element) => {
          temp.role_id = element;
          temp.portfolio_id = this.userProjectRole.portfolio_id;
          temp.time_stamp = this.userProjectRole.time_stamp
          let tempProject= new Project({id:this.userProjectRole.project_id.id,name:this.userProjectRole.project_id.name}); 
          temp.project_id = tempProject
          this.userProjectRoles.push(temp);
          temp = new UserProjectRole();
        });
      } else {
        temp.role_id = this.userProjectRole.role_id[0];
        temp.portfolio_id = this.userProjectRole.portfolio_id;
        temp.time_stamp = this.userProjectRole.time_stamp
        let tempProject= new Project({id:this.userProjectRole.project_id.id,name:this.userProjectRole.project_id.name}); 
        temp.project_id = tempProject;
        this.userProjectRoles.push(temp);
        temp = new UserProjectRole();
      }
      let userProjectRoles1=new Array<UserProjectRole>();
      if (usersLength > 1) {
        users.forEach((element, i) => {
          this.userProjectRoles.forEach((element1) => {
              temp.user_id = element;
              temp.role_id = element1.role_id;
              temp.time_stamp = this.userProjectRole.time_stamp
              let tempProject= new Project({id:element1.project_id.id,name:element1.project_id.name}); 
              temp.project_id = tempProject;
              temp.portfolio_id = element1.portfolio_id;
              userProjectRoles1.push(temp);
              temp = new UserProjectRole();
          });
        });
        this.userProjectRoles=userProjectRoles1;
      } else {
        this.userProjectRoles.forEach((element1) => {
          element1.user_id = this.userProjectRole.user_id[0];
        });
      }
    } else if (this.selectedRole) {
      if (users.length > 1) {
        users.forEach((element) => {
          temp.role_id = this.userProjectRole.role_id;
          temp.portfolio_id = this.userProjectRole.portfolio_id;
          temp.time_stamp = this.userProjectRole.time_stamp
          let tempProject= new Project({id:this.userProjectRole.project_id.id,name:this.userProjectRole.project_id.name}); 
        temp.project_id = tempProject;
          temp.user_id = element;
          this.userProjectRoles.push(temp);
          temp = new UserProjectRole();
        });
      } else {
        temp.role_id = this.userProjectRole.role_id;
        temp.portfolio_id = this.userProjectRole.portfolio_id;
        temp.time_stamp = this.userProjectRole.time_stamp
        let tempProject= new Project({id:this.userProjectRole.project_id.id,name:this.userProjectRole.project_id.name}); 
        temp.project_id = tempProject;
        temp.user_id = this.userProjectRole.user_id[0];
        this.userProjectRoles.push(temp);
        temp = new UserProjectRole();
      }
    } else if (this.selectedUser) {
      if (roles.length > 1) {
        roles.forEach((element) => {
          temp.user_id = this.userProjectRole.user_id;
          temp.portfolio_id = this.userProjectRole.portfolio_id;
          temp.time_stamp = this.userProjectRole.time_stamp
          let tempProject= new Project({id:this.userProjectRole.project_id.id,name:this.userProjectRole.project_id.name}); 
          temp.project_id = tempProject;
          temp.role_id = element;
          this.userProjectRoles.push(temp);
          temp = new UserProjectRole();
        });
      } else {
        temp.role_id = this.userProjectRole.role_id[0];
        temp.portfolio_id = this.userProjectRole.portfolio_id;
        temp.time_stamp = this.userProjectRole.time_stamp
        let tempProject= new Project({id:this.userProjectRole.project_id.id,name:this.userProjectRole.project_id.name}); 
        temp.project_id = tempProject;
        temp.user_id = this.userProjectRole.user_id;
        this.userProjectRoles.push(temp);
        temp = new UserProjectRole();
      }
    }
  }
  checkuserprojectrole() {
    this.existingUserProjectRoles = new Array<UserProjectRole>();
    this.users.forEach((element) => {
      this.userProjectRoles.forEach((ele, i) => {
        if (
          element.portfolio_id.id == ele.portfolio_id.id &&
          element.project_id.id == ele.project_id.id &&
          ele.role_id.id == element.role_id.id &&
          ele.user_id.id == element.user_id.id
        ) {
          this.existingUserProjectRoles.push(element);
        }
      });
    });
    if (this.existingUserProjectRoles.length >= 1) {
      this.existingUserProjectRole = new MatTableDataSource(this.existingUserProjectRoles);
      this.errorMessage = true;
      return true;
    } else {
      return false;
    }
  }
  onSave() {
    let portfolioForSave: Portfolio;
    // if(this.edit){
      this.userProjectRole.time_stamp = new Date();
    this.errorMessage = false;
    if (this.selectedUser != undefined) this.userProjectRole.user_id = this.selectedUser;
    else if (this.selectedRole != undefined) this.userProjectRole.role_id = this.selectedRole;
    if (this.project != undefined) this.userProjectRole.project_id = this.project;
    if (this.role.roleadmin) {
      let portfolio: Portfolio;
      try {
        portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
      } catch (e : any)  {
        portfolio = null;
        console.error("JSON.parse error - ", e.message);
      }
      this.userProjectRole.portfolio_id = new Portfolio({ id: portfolio.id });
    }
    if (this.role.projectadmin) {
      let portfolio: Portfolio;
      try {
        portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
      } catch (e : any)  {
        portfolio = null;
        console.error("JSON.parse error - ", e.message);
      }
      this.userProjectRole.portfolio_id = new Portfolio({ id: portfolio.id });
      let project: Project;
      try {
        project = JSON.parse(sessionStorage.getItem("project"));
      } catch (e : any)  {
        project = null;
        console.error("JSON.parse error - ", e.message);
      }
      this.userProjectRole.project_id = new Project({ id: project.id });
    }
    if(this.enablePortfolioAdminView){
      if(this.selectedRole){
        this.userProjectRole.portfolio_id = new Portfolio({ id: this.selectedRole.portfolioId });
      }
    }
    if(this.enableProjectAdminView){
      if(this.selectedRole){
        this.userProjectRole.project_id = new Project({id: this.selectedRole.projectAdminId})

        if(this.projectList.length > 0){
          this.projectList.forEach((item) => {
            if(item.id != null && item.id == this.selectedRole.projectAdminId){
              portfolioForSave = item.portfolioId;
            }
          });

          this.userProjectRole.portfolio_id = new Portfolio({ id: portfolioForSave.id });
        }
      }
    }
    if (
      this.userProjectRole.role_id == undefined ||
      this.userProjectRole.project_id == undefined ||
      this.userProjectRole.user_id == undefined
    ) {
      this.messageService.messageNotification("All fields are mandatory", "warning");
    } else {
      this.saveuserprojectrole();
      let flag: boolean = false;
      flag = this.checkuserprojectrole();
      // this.users.forEach(element => {
      //     if ((element.portfolio_id.id == this.userProjectRole.portfolio_id.id) &&
      //         (element.project_id.id == this.userProjectRole.project_id.id) &&
      //         (this.userProjectRole.role_id.id == element.role_id.id) &&
      //         (this.userProjectRole.user_id.id == element.user_id.id)) {
      //         flag = true;
      //     }
      // })

      if (!flag) {
        if (sessionStorage.getItem("telemetry") == "true") {
        // this.telemetryService.audit(this.userProjectRoles,"CREATE");
        }
        this.busy = this.userRoleService.createAll(this.userProjectRoles).subscribe(
          (res) => {
            this.messageService.messageNotification("Mapping(s) Created", "success");
            let user: Users;
            try {
              user = JSON.parse(sessionStorage.getItem("user"));
            } catch (e : any)  {
              user = null;
              console.error("JSON.parse error - ", e.message);
            }
            // this.fetchUserProjectRoles(null);
            this.clearFilters();
            this.userProjectRole = new UserProjectRole();
            this.errorMessage = false;
            this.showCreate = false;
            if (this.userProjectRoles.length > 0) {
              this.userProjectRoles.forEach((ele) => {
                if (ele.user_id.id == user.id) {
                  this.initUserSettings();
                  return;
                }
              });
            }
          },
          (error) => this.messageService.messageNotification("Could not save", "error")
        );
      } else {
        this.messageService.messageNotification(
          "Could not save " + this.existingUserProjectRoles.length + " Mapping(s) Already Exists",
          "error"
        );
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
  update() {
    if (this.selectedUser != undefined) this.userProjectRole.user_id = this.selectedUser;
    else if (this.selectedRole != undefined) this.userProjectRole.role_id = this.selectedRole;
    if (this.project != undefined) this.userProjectRole.project_id = this.project;
    if (
      this.userProjectRole.role_id == undefined ||
      this.userProjectRole.project_id == undefined ||
      this.userProjectRole.user_id == undefined ||
      this.userProjectRole.portfolio_id == undefined
    ) {
      this.messageService.messageNotification("All fields are mandatory", "warning");
    } else {
      let flag: boolean = false;
      this.users.forEach((element) => {
        if (
          element.id != this.userProjectRole.id &&
          element.portfolio_id.id == this.userProjectRole.portfolio_id.id &&
          element.project_id.id == this.userProjectRole.project_id.id &&
          this.userProjectRole.role_id.id == element.role_id.id &&
          this.userProjectRole.user_id.id == element.user_id.id
        ) {
          flag = true;
        }
      });
      if (this.role.roleadmin) {
        let portfolio: Portfolio;
        try {
          portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
        } catch (e : any)  {
          portfolio = null;
          console.error("JSON.parse error - ", e.message);
        }
        this.userProjectRole.portfolio_id = new Portfolio({ id: portfolio.id });
      }
      if (this.role.projectadmin) {
        let portfolio: Portfolio;
        try {
          portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
        } catch (e : any)  {
          portfolio = null;
          console.error("JSON.parse error - ", e.message);
        }
        let project: Project;
        try {
          project = JSON.parse(sessionStorage.getItem("project"));
        } catch (e : any)  {
          project = null;
          console.error("JSON.parse error - ", e.message);
        }
        this.userProjectRole.project_id = new Project({ id: project.id });
      }
      if (!flag) {
        
        this.userProjectRole.project_id.portfolioId = this.userProjectRole.portfolio_id;
        this.userProjectRole.time_stamp = new Date();
        if (sessionStorage.getItem("telemetry") == "true") {
        let arr = this.users.filter(
          (item) =>
            item.id == this.userProjectRole.id 
        );
        let diff=this.compareTodiff(this.userProjectRole,arr[0])
        // this.telemetryService.audit(this.userProjectRole,arr[0],diff);
        }
        this.busy = this.userRoleService.update(this.userProjectRole).subscribe(
          (res) => {
            this.messageService.messageNotification("Mapping updated", "success");
            let user: Users;
            try {
              user = JSON.parse(sessionStorage.getItem("user"));
            } catch (e : any)  {
              user = null;
              console.error("JSON.parse error - ", e.message);
            }
            if (this.userProjectRole.user_id.id == user.id) this.initUserSettings();
            this.userProjectRole = res;
            this.clearFilters();
            // this.fetchUserProjectRoles(null);
            this.userProjectRole = new UserProjectRole();
            this.showCreate = false;
          },
          (error) => this.messageService.messageNotification("Could not update", "error")
        );
      } else {
        this.messageService.messageNotification("Mapping Already Exists", "error");
      }
    }
  }

  initUserSettings() {
    sessionStorage.setItem("UpdatedUser", "true");
  }

  onView(userProjRole: UserProjectRole) {
    this.prjFlag = false;
    this.demoUserFlag = false;
    this.edit = false;
    this.view = true;
    this.showCreate = true;
    this.errorMessage = false;
    if (this.myInputReference) {
      this.myInputReference.nativeElement.value = null;
      this.projectSearched = undefined;
    }
    this.userProjectRole = Object.assign({}, userProjRole);
    if (this.userProjectRole.user_id.user_email == "demouser@infosys.com") {
      this.demoUserFlag = true;
    }
    if(this.userProjectRole.project_id.name =='Core'){
      this.prjFlag = true;
    }
    this.fetchApis();
  }
  onEdit(userProjRole: UserProjectRole) {
    this.edit = true;
    this.view = false;
    this.showCreate = true;
    this.errorMessage = false;
    if (this.myInputReference) {
      this.myInputReference.nativeElement.value = null;
      this.projectSearched = undefined;
    }
    this.userProjectRole = Object.assign({}, userProjRole);
    this.fetchApis();
  }
  // filterItem(value) {

  //     if (!value) {
  //         this.assignCopy();
  //     }
  //     else if (this.selectedUser != undefined) {

  //         this.users = Object.assign([], this.usersCopy).filter(
  //             item1 => item1.project_id.name.toLowerCase().indexOf(value.toLowerCase()) > -1
  //         )

  //         // this.users = Object.assign([], this.usersCopy).filter(
  //         //     item1 => item1.role_id.name.toLowerCase().indexOf(value.toLowerCase()) > -1
  //         // )
  //     }
  //     else if (this.selectedRole != undefined) {

  //         this.users = Object.assign([], this.usersCopy).filter(
  //             item1 => item1.user_id.user_f_name.toLowerCase().indexOf(value.toLowerCase()) > -1)

  //     }
  //     else if (this.project != undefined) {

  //         this.users = Object.assign([], this.usersCopy).filter(
  //             item1 => item1.user_id.user_f_name.toLowerCase().indexOf(value.toLowerCase()) > -1)
  //     }
  //     this.UserList = new MatTableDataSource(this.users);
  //     this.UserList.sort = this.sort;
  //     this.UserList.paginator = this.paginator;
  // }
  filterItem(value, pageEvent) {
    if (!value) {
      this.assignCopy();
    }
    if (this.projectSearched == "" || this.projectSearched == undefined) {
      this.clearFilters();
    } else {
      let tempUserProjectRole = new UserProjectRole();
      if (this.project != undefined) {
        tempUserProjectRole.user_id = new Users({ user_f_name: this.projectSearched });
        tempUserProjectRole.project_id = new Project({ id: this.project.id });
      }
      if (this.selectedUser != undefined) {
        if (this.role.projectadmin) {
          let project: Project;
          try {
            project = JSON.parse(sessionStorage.getItem("project"));
          } catch (e : any)  {
            project = null;
            console.error("JSON.parse error - ", e.message);
          }
          tempUserProjectRole.project_id = new Project({ id: project.id });
          tempUserProjectRole.user_id = new Users({ id: this.selectedUser.id });
        } else {
          tempUserProjectRole.project_id = new Project({ name: this.projectSearched });
          tempUserProjectRole.user_id = new Users({ id: this.selectedUser.id });
        }
      }
      if (this.selectedRole != undefined) {
        tempUserProjectRole.project_id = new Project({ name: this.projectSearched });
        tempUserProjectRole.role_id = new Role({ id: this.selectedRole.id });
      }
      this.filterFlag1 = true;
      if (pageEvent == null || !pageEvent) {
        pageEvent = { page: 0, size: this.pageSize };
      }
      if (this.filterFlag1) {
        this.userRoleService.search(tempUserProjectRole, pageEvent).subscribe((res) => {
          this.currentPage = res;
          this.users = this.currentPage.content;
          if (this.selectedUser != null || this.selectedRole != null)
            this.users = this.users.sort((a, b) =>
              a.project_id.name.toLowerCase() > b.project_id.name.toLowerCase() ? 1 : -1
            );
          if (this.project != undefined)
            this.users = this.users.sort((a, b) =>
              a.user_id.user_f_name.toLowerCase() > b.user_id.user_f_name.toLowerCase() ? 1 : -1
            );

          this.usersCopy = this.users;
          this.wavesLength = this.currentPage.totalElements;
          this.pageIndex = 0;
          
          // Update pagination data for custom pagination
          this.totalItems = this.currentPage.totalElements;
          this.page = pageEvent.page;
          this.pagesCount = Math.ceil(this.totalItems / this.pageSize);
          this.lastPage = this.pagesCount - 1;
          this.UserList = new MatTableDataSource(this.users);
          this.UserList.paginator = this.paginator;
          this.UserList.sort = this.sort;
        });
      }
    }
  }
  assignCopy() {
    this.users = this.usersCopy;
  }
  valueChangeRole(event) {
    this.filterRole = event.value;
  }

  valueChangeProject(event) {
    this.filterProject = event.value;
    if(this.role.id != 6){
      this.fetchRelatedRoles(this.filterProject);
    }
  }

  valueChangeUser(event) {
    this.filterUser = event.value;
  }
  // Search() {
  //     let newtasks = []
  //     if (this.filterProject == 'All') {
  //         newtasks = this.usersCopy;
  //     }
  //     else {
  //         newtasks = this.usersCopy.filter(element => element.project_id.name == this.filterProject)
  //     }
  //     if (this.filterRole == 'All') {
  //         newtasks = newtasks;
  //     }
  //     else {
  //         newtasks = newtasks.filter(element => element.role_id.name == this.filterRole)
  //     }
  //     if (this.filterUser == 'All') {
  //         newtasks = newtasks;
  //     }
  //     else {
  //         newtasks = newtasks.filter(element => element.user_id.user_f_name == this.filterUser)
  //     }
  //     this.users = newtasks;
  //     this.UserList = new MatTableDataSource(newtasks);
  //     this.UserList.sort = this.sort;
  //     this.UserList.paginator = this.paginator;
  // }
  Search(pageEvent) {
    this.lastRefreshedTime = new Date();
    if (pageEvent == null || !pageEvent) {
      pageEvent = { page: 0, size: this.pageSize };
    }
    let tempUserProjectRole = new UserProjectRole();
    if (this.project != undefined) tempUserProjectRole.project_id = new Project({ id: this.project.id });
    if (this.selectedUser != undefined) {
      if (this.role.projectadmin) {
        let project: Project;
        try {
          project = JSON.parse(sessionStorage.getItem("project"));
        } catch (e : any)  {
          project = null;
          console.error("JSON.parse error - ", e.message);
        }
        tempUserProjectRole.project_id = new Project({ id: project.id });
        tempUserProjectRole.user_id = new Users({ id: this.selectedUser.id });
      } else {
        tempUserProjectRole.user_id = new Users({ id: this.selectedUser.id });
      }
    }
    if (this.selectedRole != undefined) tempUserProjectRole.role_id = new Role({ id: this.selectedRole.id });
    if (this.filterProject == undefined && this.filterRole == undefined && this.filterUser == undefined) {
      this.clearFilters();
      this.filterFlag = true;
    } else if (
      this.filterProject != undefined &&
      this.filterRole == undefined &&
      this.filterUser == undefined
    ) {
      tempUserProjectRole.project_id = new Project({ name: this.filterProject });
      this.filterFlag = true;
    } else if (
      this.filterProject != undefined &&
      this.filterRole != undefined &&
      this.filterUser == undefined
    ) {
      tempUserProjectRole.project_id = new Project({ name: this.filterProject });
      tempUserProjectRole.role_id = new Role({ name: this.filterRole });
      this.filterFlag = true;
    } else if (
      this.filterProject == undefined &&
      this.filterRole != undefined &&
      this.filterUser == undefined
    ) {
      tempUserProjectRole.role_id = new Role({ name: this.filterRole });
      this.filterFlag = true;
    } else if (
      this.filterProject == undefined &&
      this.filterRole != undefined &&
      this.filterUser != undefined
    ) {
      tempUserProjectRole.role_id = new Role({ name: this.filterRole });
      tempUserProjectRole.user_id = new Users({ user_f_name: this.filterUser });
      this.filterFlag = true;
    } else if (
      this.filterProject == undefined &&
      this.filterRole == undefined &&
      this.filterUser != undefined
    ) {
      tempUserProjectRole.user_id = new Users({ user_f_name: this.filterUser });
      this.filterFlag = true;
    } else if (
      this.filterProject != undefined &&
      this.filterRole == undefined &&
      this.filterUser != undefined
    ) {
      tempUserProjectRole.user_id = new Users({ user_f_name: this.filterUser });
      tempUserProjectRole.project_id = new Project({ name: this.filterProject });
      this.filterFlag = true;
    } else {
      tempUserProjectRole.project_id = new Project({ name: this.filterProject });
      tempUserProjectRole.role_id = new Role({ name: this.filterRole });
      tempUserProjectRole.user_id = new Users({ user_f_name: this.filterUser });
      this.filterFlag = true;
    }

    if (this.filterFlag) {
      this.userRoleService.search(tempUserProjectRole, pageEvent).subscribe((res) => {
        this.currentPage = res;
        this.users = this.currentPage.content;
        if (this.selectedUser != null || this.selectedRole != null)
          this.users = this.users.sort((a, b) =>
            a.project_id.name.toLowerCase() > b.project_id.name.toLowerCase() ? 1 : -1
          );
        if (this.project != undefined)
          this.users = this.users.sort((a, b) =>
            a.user_id.user_f_name.toLowerCase() > b.user_id.user_f_name.toLowerCase() ? 1 : -1
          );

        this.usersCopy = this.users;
        this.wavesLength = this.currentPage.totalElements;
        this.UserList = new MatTableDataSource(this.users);
        this.UserList.paginator = this.paginator;
        this.UserList.sort = this.sort;
        
        // Update pagination data for custom pagination
        this.totalItems = this.currentPage.totalElements;
        this.page = pageEvent.page;
        this.pagesCount = Math.ceil(this.totalItems / this.pageSize);
        this.lastPage = this.pagesCount - 1;
      });
    }
  }
  clearFilters() {
    this.filterProject = undefined;
    this.filterRole = undefined;
    this.filterUser = undefined;
    this.filterFlag = false;
    this.filterFlag1 = false;
    this.projectSearched = undefined;
    if (this.myInputReference) {
      this.myInputReference.nativeElement.value = null;
    }
    console.log(this.pageEvent)
    if(this.pageEvent)
      this.fetchUserProjectRoles({ page: this.pageEvent.pageIndex, size: this.pageSize });
    else
      this.fetchUserProjectRoles(null);
  }
  clear() {
    if (this.edit || this.view) {
      if (!this.role.roleadmin) {
        this.userProjectRole.portfolio_id = null;
      }
      this.userProjectRole.user_id = null;
      this.userProjectRole.project_id = null;
      this.userProjectRole.role_id = null;
      this.errorMessage = false;
      this.demoUserFlag = false;
      this.prjFlag = false;
    } else {
      this.userProjectRole = new UserProjectRole();
      this.users = Object.assign([], this.usersCopy);
      this.UserList = new MatTableDataSource(this.users);
      this.UserList.sort = this.sort;
      this.UserList.paginator = this.paginator;
      this.userProjectRole.user_id = undefined;
      this.userProjectRole.project_id = undefined;
      this.userProjectRole.role_id = undefined;
      this.errorMessage = false;
      this.demoUserFlag = false;
      this.prjFlag = false;
    }
  }
  deleteUserProjectRole(role: UserProjectRole) {
    let dialogRef = this.confirmDeleteDialog.open(DeleteComponent, {
      disableClose: true,
      width: '400px',
      height: 'auto',
      maxHeight: '300px',
      panelClass: 'delete-dialog-panel',
      data: {
        title: "Delete User Project Role",
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
  delete(upr: UserProjectRole) {
    this.userRoleService.delete(upr.id).subscribe(
      (Response) => {
        if (sessionStorage.getItem("telemetry") == "true") {
        // this.telemetryService.audit(upr,"DELETE");
        }
        this.messageService.messageNotification("User project Role Mapping Deleted successfully", "success");
        let user: Users;
        try {
          user = JSON.parse(sessionStorage.getItem("user"));
        } catch (e : any)  {
          user = null;
          console.error("JSON.parse error - ", e.message);
        }
        if (upr.user_id.id == user.id) this.initUserSettings();
        this.clearFilters();
        // this.loadPage({ first: 0, rows: 5000, sortField: null, sortOrder: null });
      },
      (error) => this.messageService.messageNotification("Could not delete", "error")
    );
  }
  getportfolio_id(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.project && this.project.portfolioId) {
        this.usm_portfolio_idArray = [];
        this.usm_portfolio_idArray.push(this.project.portfolioId);
        resolve();
      } else {
        this.usm_portfolio_idObject = null;
        this.usm_portfolio
          .findAll(this.usm_portfolio_idObject, { first: 0, rows: 1000, sortField: null, sortOrder: null })
          .subscribe(
            (pageResponse) => {
              this.usm_portfolio_idArray = pageResponse.content;
              this.usm_portfolio_idArray = this.usm_portfolio_idArray.sort((a, b) =>
                a.portfolioName.toLowerCase() > b.portfolioName.toLowerCase() ? 1 : -1
              );
              resolve();
            },
            (error) => {
              this.messageService.messageNotification("Could not get the portfolio results", "error");
              reject(error);
            }
          );
      }
    });
  }

  // checkEnterPressed(event: any, val: any) {
  //     if (event.keyCode === 13) {
  //         this.filterItem(event.srcElement.value);
  //     }
  // }
  fetchprojectsbasedonportfolio() {
    this.userProjectRole.role_id=new Role();
    if (this.project) {
      this.userProjectRole.project_id = this.project;
    } else {
      let temp = [];
      this.specificProjectList = this.projectList.filter(
        (item) => item.portfolioId != null && item.portfolioId.id == this.userProjectRole.portfolio_id.id
      );
      if (this.selectedRole && this.selectedRole.projectId != null) {
        this.specificProjectList.forEach((element) => {
          if (element.id == this.selectedRole.projectId) temp.push(element);
        });
        this.specificProjectList = temp;
      } else if (this.selectedRole) {
        temp = [];
        this.specificProjectList.forEach((element) => {
          if (element.defaultrole != false || this.selectedRole.projectId == element.id) {
            temp.push(element);
          }
        });

        this.specificProjectList = temp;
      }
      // this.userProjectRole.project_id = this.specificProjectList[0];
    }
    this.filterRolesForProject();
    this.fetchRolebasedonportfolio();
  }
  fetchRolebasedonportfolio(){
    let roleSpecific=new Array<Role>();
    roleSpecific=this.roleList.filter((element)=>{
    if( element.roleadmin)
    {
      //Check if the portfolioAdmin matches to the selected portfolio  or portfolioadmin role which can be mapped to any portfolio
    return  (element.portfolioId == this.userProjectRole.portfolio_id.id) || element.portfolioId==null
    } 
    else 
    // return the roles having both portfolioAdmin and projectAdmin not selected and   excluing the roles which is under any other portfolio or project
    {
    return  (!element.projectadmin || !element.roleadmin && element.projectAdminId==null) || (this.project.id == element.projectAdminId)
  }
    }); 
    this.specificRoleList=roleSpecific;
    this.filterroles();    
  }

  fetchRolebasedonProject(){
  let roleSpecific=new Array<Role>();
  roleSpecific = this.roleList.filter((element) => {
  if (element.projectadmin==true) {
  
    // Check if role is specifically mapped to the selected project  or projectadmin role which can be mapped to any project (not specified the projectName). 
     return this.userProjectRole.project_id.id==element.projectAdminId ||(element.projectAdminId==null);
    }
   else {
    // Check if projectadmin and profolioadmin are not checked and if role is specifically mapped to the selected portfolio or portfolioadmin role which can be mapped to any portfolio. 
    return (!element.projectadmin && element.portfolioId == this.userProjectRole.portfolio_id.id || !element.roleadmin) || (element.portfolioId==null && element.roleadmin);
  }
});
this.specificRoleList = roleSpecific;
this.filterroles();
}
  /**
   * Initialize filter options if all required data is loaded
   */
  initializeFilterOptionsIfAllLoaded() {
    if (this.usersList && this.usersList.length > 0 &&
        this.roleList && this.roleList.length > 0 &&
        this.projectList && this.projectList.length > 0) {
      
      console.log('All data loaded, initializing filter options');
      // Force an update to refresh the data
      setTimeout(() => {
        this.initializeFilterOptions();
      }, 0);
    } else {
      console.log('Not all data loaded yet, waiting for more data...');
    }
  }
  // Data loading completion counter
  private dataLoadedCount = 0;
  private  totalDataToLoad = 4; // portfolio, roles, users, projects

  // Check if all data is loaded and initialize filters if it is
  private checkAllDataLoaded(): void {
    this.dataLoadedCount++;
    console.log(`Data loaded: ${this.dataLoadedCount}/${this.totalDataToLoad}`);
    if (this.dataLoadedCount >= this.totalDataToLoad) {
      console.log("All data loaded, initializing filter options");
      this.initializeFilterOptions();
      // Reset counter for next time
      this.dataLoadedCount = 0;
    }
  }

  fetchApis() {
    console.log("Fetching APIs for filter data");
    
    // Reset counter at the start of loading
    this.dataLoadedCount = 0;
    this.totalDataToLoad = 4; // We're loading 4 different data sets
    
    this.fetchPortfolios();
    this.fetchUsers();
    this.fetchProjects();
    this.fetchRoles();
    
    // Backup: Ensure filter options are initialized even if some data fails to load
    setTimeout(() => {
      console.log("Backup filter initialization after timeout");
      this.initializeFilterOptions();
    }, 2000);
  }
  
  fetchPortfolios() {
    /*If the list is already populated dont need to call the api again*/
    if (!(this.usm_portfolio_idArray && this.usm_portfolio_idArray.length)) {
      this.getportfolio_id().then(() => {
        this.checkAllDataLoaded();
      }).catch(() => {
        this.checkAllDataLoaded(); // Still increment counter even if failed
      });
    } else {
      this.checkAllDataLoaded();
    }
  
      
  }
  
  // Fetch all roles for filter
  fetchAllRoles(): Promise<void> {
    return new Promise((resolve, reject) => {
      let allRole = new Role();
      allRole.projectId = null;
      
      this.roleService.findAll(allRole, this.lazyload).subscribe(
        (res) => {
          this.roleList = res.content;
          this.rolesToBeFiltered = res.content;
          this.roleList = this.roleList.sort((a, b) => 
            (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)
          );
          resolve();
        },
        (error) => {
          console.error("Error fetching roles:", error);
          reject(error);
        }
      );
    });
  }
  
  // Fetch all users for filter
  fetchAllUsers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.findAll(new Users(), this.lazyload).subscribe(
        (res) => {
          this.usersList = res.content;
          this.usersList = this.usersList.sort((a, b) =>
            a.user_login.toLowerCase() > b.user_login.toLowerCase() ? 1 : -1
          );
          this.usersListSearch.next(this.usersList.slice());
          resolve();
        },
        (error) => {
          console.error("Error fetching users:", error);
          reject(error);
        }
      );
    });
  }
  
  // Fetch all projects for filter
  fetchAllProjects(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.projectService.findAll(new Project(), this.lazyload).subscribe(
        (res) => {
          this.projectList = res.content;
          this.projectList = this.projectList.sort((a, b) =>
            a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
          );
          resolve();
        },
        (error) => {
          console.error("Error fetching projects:", error);
          reject(error);
        }
      );
    });
  }
  trackByMethod(index, item) {}
  onPageFired(event) {
    this.pageEvent = event;
    console.log(this.pageEvent);
    if (this.filterFlag == false && this.filterFlag1 == false){
      this.fetchUserProjectRoles({ page: event.pageIndex, size: this.pageSize });
      this.pageIndex = event.pageIndex;
    }
    else if (this.filterFlag == true) this.Search({ page: event.pageIndex, size: this.pageSize });
    else if (this.filterFlag1 == true)
      this.filterItem(this.projectSearched, { page: event.pageIndex, size: this.pageSize });
  }
  
  // Custom pagination methods
  getPageNumbers(): number[] {
    const totalPages = this.pagesCount;
    const currentPage = this.page;
    const visiblePages = 5; // Number of page numbers to show
    
    let startPage = Math.max(0, currentPage - Math.floor(visiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + visiblePages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < visiblePages && startPage > 0) {
      startPage = Math.max(0, endPage - visiblePages + 1);
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
  
  changePage(pageNumber: number): void {
    if (pageNumber !== this.page) {
      this.page = pageNumber;
      this.onPageFired({ pageIndex: pageNumber, pageSize: this.pageSize, length: this.totalItems });
    }
  }
  
  navigatePage(direction: string): void {
    if (direction === 'Next' && this.page < this.lastPage) {
      this.changePage(this.page + 1);
    } else if (direction === 'Prev' && this.page >  0) {
      this.changePage(this.page - 1);
    }
  }
}
