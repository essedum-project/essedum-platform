/**
 * PROJECT LIST VIEW COMPONENT
 * 
 * IMPORTANT: Client-side Filtering Implementation
 * ----------------------------------------------
 * This component has been updated to use client-side filtering instead of making API calls when
 * filter options are selected. Key changes include:
 * 
 * 1. Initial data load in fetchWave() loads all records at once with a large page size
 * 2. All projects are stored in projectsCopy for client-side filtering
 * 3. onFilterSelected() and Search() methods filter data locally without API calls
 * 4. updateTableData() handles client-side pagination
 * 5. onPageFired() manages pagination state
 * 
 * This approach reduces server load and improves performance by avoiding redundant API calls.
 */

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
import { ConfirmProjectDeleteDialogComponent } from "../../support/confirm-project-delete-dialog.component ";
import { Project } from "../../models/project";
import { ProjectService } from "../../services/project.service";
import { HelperService } from "../../services/helper.service";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { FormControl } from "@angular/forms";
import { Subscription } from "rxjs";
import { Portfolio } from "../../models/portfolio";
import { UsersService } from "../../services/users.service";
import { UsmPortfolioService } from "../../services/usm-portfolio.service";
import { DeleteComponent } from "../../shared-modules/confirm-delete/delete.component";
import { IampUsmService } from "../../iamp-usm.service";
import * as momentTz from "moment-timezone";
import { RoleService } from "../../services/role.service";
import { Role } from "../../models/role";
import { AppTheme, BCCTheme, DashboardTheme, Theme, WidgetTheme } from "../../models/theme";
import { DashConstant } from "../../models/dash-constant";
import { DashConstantService } from "../../services/dash-constant.service";
import { ProjectDetailComponent } from "../project-detail/project-detail.component";
@Component({
  //moduleId: module.id,
  templateUrl: "project-list-view.component.html",
  selector: "project-list-view",
  styleUrls: ["project-list-view.component.css"],
})
export class ProjectListViewComponent implements OnInit, OnDestroy {
  @Input() header = "Projects...";
  @Output() changeView: EventEmitter<boolean> = new EventEmitter();
  // When 'sub' is true, it means this list is used as a one-to-many list.
  // It belongs to a parent entity, as a result the addNew operation
  // must prefill the parent entity. The prefill is not done here, instead we
  // emit an event.
  // When 'sub' is false, we display basic search criterias
  @Input() sub: boolean;
  pageSize = 10;
  filterFlag = false;
  clickedcopyblueprint: boolean = false;
  @Output() onAddNewClicked = new EventEmitter();
  p: number;
  showCreateUserRole: boolean = false;
  showBluePrint: boolean;
  @ViewChild("myInput", { static: false }) myInputReference: ElementRef;
  @ViewChild("myInput1", { static: false }) myInputReference1: ElementRef;
  projectToDelete: Project;
  displayedColumns: string[] = ["id", "name", "projectdisplayname", "portfolioName", "description", "actions"];
  ProjectList: MatTableDataSource<any>;
  private sort: MatSort;
  fromProject: string = "";
  busy: Subscription;
  busy1: Subscription;
  role: any;
  
  // Add subscriptions for cleanup
  private paramsSubscription: Subscription;
  private subscriptions: Subscription[] = [];
  
  // New properties for updated UI
  isFilterExpanded = false;
  filterOptions: any[] = [];
  selectedFilterValues: any = {};
  activeFilters: any = {};
  sortActive = 'name';
  sortDirection = 'asc';
  
  // Add emitter for filter panel status changes
  filterStatusChange = new EventEmitter<boolean>();
  
  isLoading = false;
  wavesData = [];
  rows = 10;
  first = 0;
  wavesLength = 0;
  pageEvent: PageEvent;
  page = 0;
  lastPage = 0;
  pageIndex = 0;
  auth: string = "";
  isAuth: boolean = true;
  editFlag: boolean = false;
  viewFlag: boolean = true;
  deleteFlag: boolean = false;
  
  TOOLTIP_POSITION: string = 'below';
  createFlag: boolean = false;
  permissionList: any[];
  selectedPermissionList: any[];
  private paginator: MatPaginator;
  coreProjectFlag: boolean = false;
  copyblueprintProjects: Project[];
  extension: string = "";
  extensionArray = [];
  allowedTypes: string;
  themeoriginalcolor: string;
  @ViewChild(MatSort, { static: false }) set matSort(ms: MatSort) {
    this.sort = ms;
  }

  //foreign key dependencies
  // basic search criterias (visible if not in 'sub' mode)
  example: Project = new Project();

  // list is paginated
  currentPage: PageResponse<Project> = new PageResponse<Project>(0, 0, []);
  usm_portfolio_idArray: Portfolio[] = [];
  usm_portfolio_idObject: Portfolio = new Portfolio();
  private _id: Portfolio;

  pointerevent: string = "auto";
  opacity: number = 1;
  projectSearched: any;
  rolesArray = []
  constructor(
    public router: Router,
    public projectService: ProjectService,
    public roleService: RoleService,
    public messageService: MessageService,
    public confirmDeleteDialog: MatDialog,
    public confirmDialog: MatDialog,
    public helperService: HelperService,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private usm_portfolio: UsmPortfolioService,
    public dashConstantService: DashConstantService,
    private usmService: IampUsmService,
  ) { }



  //code related to make it consistent with wave UI
  filterProject: any;
  filterProjectName: any;
  showCreate: boolean = false;
  projects = new Array<Project>();
  projectsCopy = new Array<Project>();
  showList: boolean = false;
  view: boolean = false;
  buttonFlag: boolean = false;
  viewProject: boolean = false;
  edit: boolean = false;
  selectedPortfolio = new Portfolio();
  lazyload = { first: 0, rows: 1000, sortField: null, sortOrder: null };
  project = new Project();
  currentProject = new Project();
  selected = new FormControl(0);
  tab = "User-Role-Mapping";
  url;
  filterFlag1: boolean = false;
  lengthNameErrorMessage: String = "Maximum Character Limit Reached";
  showNameLengthErrorMessage: Boolean = false;
  showDisplayNameLengthErrorMessage: Boolean = false;
  showDescLengthErrorMessage: Boolean = false;
  timeZone: string;
  disableExcel: boolean;
  public tzNames: string[];

  listView() {
    if (this.edit || this.view) this.router.navigate(["../../"], { relativeTo: this.route });
    else {
      // this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
      // this.router.navigate(["../"], { relativeTo: this.route });
      this.fetchWave(null);
    }
    this.showCreate = false;
    this.changeView.emit(true);
    this.view = false;
    this.edit = false;
    this.viewProject = false;
    this.showCreateUserRole = false;
    this.showBluePrint = false;
    this.showNameLengthErrorMessage = false;
    this.showDisplayNameLengthErrorMessage = false;
    this.showDescLengthErrorMessage = false;
    
    // Clean up session storage
    try {
      sessionStorage.removeItem('currentEditProject');
    } catch (e) {
      console.error("Error removing project from session storage:", e);
    }
  }


  showProjectList() { }

  getProjects(id) {
    // First, check if this is an edit operation and if we have project data in session storage
    if (this.edit) {
      try {
        const storedProject = sessionStorage.getItem('currentEditProject');
        if (storedProject) {
          const projectData = JSON.parse(storedProject);
          // Verify this is the correct project by checking ID
          if (projectData.id == id) {
            console.log("Loading project from session storage:", projectData);
            this.currentProject = projectData;
            this.project = projectData;
            
            // Set theme color
            if (this.project.theme == null) {
              this.project.theme = sessionStorage.getItem("defaultTheme");
            }
            this.themeoriginalcolor = this.project.theme;
            
            // Set logo URL if available
            if (this.project.logo) {
              this.url = "data:image/png;base64," + this.project.logo;
            } else {
              this.url = null;
            }
            
            // Check for Core project restrictions
            if (this.project.name == "Core") {
              this.coreProjectFlag = true;
              if (this.edit && this.coreProjectFlag) {
                window.location.href = '/unauthorized.html';
              }
            }
            
            // We've loaded from session storage, so we can return early
            return;
          }
        }
      } catch (e) {
        console.error("Error retrieving project from session storage:", e);
        // Continue with API call if session storage fails
      }
    }
    
    // If we didn't find it in session storage or this is not an edit operation,
    // proceed with the API call
    const subscription = this.projectService.getProject(id).subscribe((res) => {
      this.currentProject = res;
      this.project = res;
      if (this.project.theme == null) {
        this.project.theme = sessionStorage.getItem("defaultTheme");
      }
      this.themeoriginalcolor = this.project.theme
      if (this.project.logo) {
        this.url = "data:image/png;base64," + this.project.logo;
      } else {
        this.url = null;
      }
      if (this.project.name == "Core") {
        this.coreProjectFlag = true
        if (this.edit && this.coreProjectFlag) {
          window.location.href = '/unauthorized.html';
        }
      }
    });
    
    // Add the subscription to our tracked subscriptions for cleanup
    this.subscriptions.push(subscription);
  }

  editProject(project: Project) {
    this.changeView.emit(false);
    this.view = false;
    this.edit = true;
    this.project = project;
    this.buttonFlag = false;
    this.clickedcopyblueprint = false;
    
    // Store the project data in session storage for retrieval after navigation
    try {
      sessionStorage.setItem('currentEditProject', JSON.stringify(project));
    } catch (e) {
      console.error("Error storing project in session storage:", e);
    }
    
    // Navigate to the edit route
    this.router.navigate(["projectlist", project.id, "false"], { relativeTo: this.route.parent });
  }

  view_Project(project: Project) {
    const dialogRef = this.confirmDialog.open(ProjectDetailComponent, {
      maxHeight: "90vh",
      width: "600px",
      maxWidth: "90vw",
      disableClose: false,
      autoFocus: false,
      panelClass: 'custom-dialog-container',
      data: {
        view: true,
        project: project
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.fetchWave(null);
    });
  }
  

  // createView() {
  //   const dialogRef = this.confirmDialog.open(ProjectDetailComponent, {
  //     height: "80%",
  //     width: "60%",
  //     disableClose: false,
  //     data: {
  //       edit: false,
  //     },
  //   });
  //   dialogRef.afterClosed().subscribe((result) => {
  //     this.fetchWave(null);
  //   });
  // }
  check(tool) {
    if (this.project && this.project.name) {
      this.project.name = this.project.name.trim();
    }
    if(this.project.autoUserProject==null) this.project.autoUserProject=false;
    let portfolio: Portfolio;
    try {
      portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
    } catch (e: any) {
      portfolio = null;
      console.error("JSON.parse error - ", e.message);
    }

    if (this.role.roleadmin) tool.portfolioId = portfolio;
    if (tool.name == undefined || tool.name == null || tool.name.trim().length == 0) {
      this.messageService.messageNotification("Project name can't be empty", "warning");
    } else if (tool.name.length > 255)
      this.messageService.messageNotification("Project name cannot be more than 255 characters", "warning");
    else if (!/^[a-zA-Z][a-zA-Z0-9 \-\_\.]*?$/.test(tool.name)) {
      this.messageService.messageNotification("Project name format is incorrect", "warning");
    } else if (tool.description && (!/^[a-zA-Z0-9][a-zA-Z0-9 \-\_\.]*?$/.test(tool.description))) {
      this.messageService.messageNotification("Project description format is incorrect", "warning");
    }
    else if (tool.portfolioId == undefined || tool.portfolioId == null) {
      this.messageService.messageNotification("Portfolio can't be empty", "warning");
    } else if (
      this.edit &&
      (tool.projectdisplayname == undefined ||
        tool.projectdisplayname == null ||
        tool.projectdisplayname.trim().length == 0)
    ) {
      this.messageService.messageNotification("Project Display Name can't be empty", "warning");
    } else if (this.edit && tool.projectdisplayname > 255) {
      this.messageService.messageNotification("Project Display name cannot be more than 255 characters", "warning");
    } else if (this.edit && !/^[a-zA-Z][a-zA-Z0-9 \-\_\.]*?$/.test(tool.projectdisplayname)) {
      this.messageService.messageNotification("Project Display Name format is incorrect", "warning");
    }
     else {
      if (tool.defaultrole == undefined || tool.defaultrole == null)
        /**To check -  If checkbox is not selected initially it will be undefined */
        this.project.defaultrole = false;
      if (this.role.roleadmin) this.project.portfolioId = portfolio;

      if (tool.disableExcel == undefined || tool.disableExcel == null) this.project.disableExcel = false;

      this.onSave();
    }
  }
  onSave() {
    if (this.project.timeZone == null || this.project.timeZone == undefined) {
      this.project.timeZone = "Asia/Calcutta";

      if (this.project.disableExcel == null || this.project.disableExcel == undefined) {
        this.project.disableExcel = false;
      }
    }
    if (this.edit) this.updateWave();
    else {
      let arr1 = this.projects.filter((item) => item.name != undefined);
      let arr = arr1.filter((item) => item.name.toLowerCase() == this.project.name.toLowerCase());
      if (arr.length > 0) {
        this.messageService.messageNotification("Project Name already exists", "warning");
        return;
      } else {
        this.project.projectdisplayname = this.project.name;
        if (sessionStorage.getItem("telemetry") == "true") {
          // this.telemetryService.audit(this.project, "CREATE");
        }
        this.busy = this.projectService.create(this.project).subscribe(
          (response) => {
            this.getDashConstant(this.project.theme, response)
            this.messageService.messageNotification("Project Saved Successfully", "success");
            // this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
            this.fetchWave(null);
            this.clearWave();
            this.showCreate = false;
          },
          (error) => this.messageService.messageNotification("Could not create project", "error")
        );
      }
    }
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
          this.usm_portfolio_idArray = this.usm_portfolio_idArray.sort((a, b) =>
            a.portfolioName.toLowerCase() > b.portfolioName.toLowerCase() ? 1 : -1
          );
          
          // Update filter options with portfolio data
          this.updatePortfolioFilterOptions();
        },
        (error) => this.messageService.messageNotification("Could not get the results", "error")
      );
  }
  compareTodiff(curr: any, prev: any) {
    let temparr = [];
    Object.keys(prev).forEach(key => {
      if (prev[key] != curr[key])
    temparr.push(key)
   });
   return temparr;
  }

  // Add portfolio data to filter options
  updatePortfolioFilterOptions() {
    if (this.usm_portfolio_idArray && this.usm_portfolio_idArray.length > 0) {
      this.filterOptions = [{
        type: 'portfolio',
        options: this.usm_portfolio_idArray.map(p => ({ label: p.portfolioName, value: p.portfolioName }))
      }];
    }
  }

  updateWave() {
    if (this.project && this.project.name == "Core") {
      this.messageService.messageNotification("Unauthorized Operation!!", "error");
      return;
    }
    let arr1 = this.projects.filter((item) => item.projectdisplayname != undefined);
    let arr = arr1.filter(
      (item) =>
        item.id != this.project.id &&
        item.projectdisplayname.toLowerCase() == this.project.projectdisplayname.toLowerCase()
    );
    if (arr.length > 0) {
      this.messageService.messageNotification("Project Display Name already exists", "warning");
      return;
    } else {
      if (sessionStorage.getItem("telemetry") == "true") {
      let arr = this.projects.filter(
        (item) =>
          item.id == this.project.id
      );
        let diff = this.compareTodiff(this.project, arr1[0])
        // this.telemetryService.audit(this.project, arr[0], diff);
      }
      this.busy = this.projectService.update(this.project).subscribe(
        (rs) => {

          let project: Project;
          try {
            project = JSON.parse(sessionStorage.getItem("project"));
          } catch (e: any) {
            project = null;
            console.error("JSON.parse error - ", e.message);
          }
          this.messageService.messageNotification("Project updated successfully", "success");
          if (sessionStorage.getItem("project")) {
            let currentproject = project;
            if (rs.id == currentproject.id) {
              try {
                sessionStorage.setItem("project", JSON.stringify(rs));
              } catch (e: any) {
                console.error("JSON.stringify error - ", e.message);
              }
            }
          }
          sessionStorage.setItem("UpdatedUser", "true");
          this.getDashConstant(this.project.theme)
          //this.initUserSettings()
          this.clearWave();
          this.showCreate = false;
          
          // Clean up session storage after successful update
          try {
            sessionStorage.removeItem('currentEditProject');
          } catch (e) {
            console.error("Error removing project from session storage:", e);
          }
        },
        (error) => this.messageService.messageNotification("Could not update", "error")
      );
    }
  }
  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 && o1.id == o2.id;
  }

  delete(projectToDelete: Project) {
    let id = projectToDelete.id;
    this.projectService.delete(id).subscribe(
      (response) => {
        sessionStorage.setItem("UpdatedUser", "true");
        if (sessionStorage.getItem("telemetry") == "true") {
          // this.telemetryService.audit(projectToDelete, "DELETE");
        }
        this.currentPage.remove(projectToDelete);
        // this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
        this.Clear();
        //this.initUserSettings();
        this.messageService.messageNotification("Project deleted successfully", "success");
        this.Refresh();
      },
      (error) => {
        this.messageService.messageNotification(error, "error");
        this.messageService.messageNotification("Deleted Successfully", "info");
        this.messageService.messageNotification("Could not Delete", "error");
      }
    );
  }
  clearWave() {
    if (this.edit || this.view) {
      this.project.defaultrole = null;
      this.project.description = null;
      this.project.logo = null;
      this.project.projectdisplayname = null;
      this.project.portfolioId = null;
      this.project.theme = null;
      this.url = null;
      this.project.logoName = null;
      this.project.timeZone = null;
      this.project.disableExcel = null;
      // this.myInputReference1.nativeElement.value = null;
      this.showNameLengthErrorMessage = false;
      this.showDescLengthErrorMessage = false;
    } else {
      this.showNameLengthErrorMessage = false;
      this.showDescLengthErrorMessage = false;
      this.project = new Project();
      this.url = null;
      // this.myInputReference1.nativeElement.value = null;
    }
  }

  /**
   * When used as a 'sub' component (to display one-to-many list), refreshes the table
   * content when the input changes.
   */

  ngOnInit() {
    this.telemetryImpression();
    this.tzNames = momentTz.tz.names();
    try {
      this.role = JSON.parse(sessionStorage.getItem("role"));
    } catch (e: any) {
      this.role = null;
      console.error("JSON.parse error - ", e.message);
    }
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
            if(this.role.roleadmin){
              this.deleteFlag = false;
            }
            else{
               this.deleteFlag = true;
            }
          }
          if (ele === "create") {
            this.createFlag = true;
          }
        });
      }
    );

    // Always load portfolio data for filter options
    this.getid();

    if (window.location.href.includes("project") && window.location.href.includes("true")) {
      this.showCreate = true;
      this.edit = false;
      this.view = true;
      this.viewProject = true;
      this.buttonFlag = true;
      this.paramsSubscription = this.route.params.subscribe((res: any) => {
        if (res && res.projectid) {
          this.getProjects(res.projectid);
        }
        this.loadPage({ first: 0, rows: 3000, sortField: null, sortOrder: null });
      });
    } else if (window.location.href.includes("project") && window.location.href.includes("false")) {
      this.showCreate = true;
      this.edit = true;
      this.view = false;
      this.buttonFlag = false;
      this.paramsSubscription = this.route.params.subscribe((res: any) => {
        //res.id
        if (res && res.projectid) {
          this.getProjects(res.projectid);
        }
        this.loadPage({ first: 0, rows: 3000, sortField: null, sortOrder: null });
      });
    } else {
      // this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
      this.fetchWave(null);
    }
    // this.dashConstantService.getExtensionKey("FileUpload.AllowedExtension.USM.AddImage").subscribe(
    //   (res) => {
    //   this.extension = res["allowedFileTypes"];
    //     if (this.extension) this.extensionArray = this.extension.split(",");
    //   this.allowedTypes = res["allowedFileExtension"];
    //   });

  }

  // New methods for updated UI
  toggleFilterExpanded() {
    this.isFilterExpanded = !this.isFilterExpanded;
  }

  toggleExpand() {
    this.isFilterExpanded = !this.isFilterExpanded;
  }

  hasActiveFilters(): boolean {
    return Object.keys(this.activeFilters).length > 0;
  }

  getActiveFiltersSummary(): string {
    const filterKeys = Object.keys(this.activeFilters);
    if (filterKeys.length === 0) return '';
    
    const summaries = filterKeys.map(key => {
      const value = this.activeFilters[key];
      return `${key}: ${value}`;
    });
    
    return summaries.join(', ');
  }

  onFilterSelected(event: any) {
    console.log('Filter selected:', event);
    this.selectedFilterValues = { ...this.selectedFilterValues, ...event };
    
    // Handle portfolio filter specifically
    if (event.portfolios && event.portfolios.length > 0) {
      const portfolioName = event.portfolios[0];
      const selectedPortfolio = this.usm_portfolio_idArray.find(p => 
        p.portfolioName === portfolioName || p.id.toString() === portfolioName);
      
      if (selectedPortfolio) {
        this.filterProject = selectedPortfolio;
        console.log('Selected portfolio:', selectedPortfolio);
      }
    } else if (event.portfolios && event.portfolios.length === 0) {
      // If portfolios were cleared, reset filterProject
      this.filterProject = undefined;
    }
    
    // Handle project name filter
    if (event.projects && event.projects.length > 0) {
      this.filterProjectName = event.projects[0];
    } else if (event.projects && event.projects.length === 0) {
      // If projects were cleared, reset filterProjectName
      this.filterProjectName = undefined;
    }
    
    // Ensure we have a copy of the original data for filtering
    if (!this.projectsCopy || this.projectsCopy.length === 0) {
      this.projectsCopy = JSON.parse(JSON.stringify(this.projects));
    }
    
    // If no filters are selected, restore original data
    if ((!event.portfolios || event.portfolios.length === 0) && 
        (!event.projects || event.projects.length === 0)) {
      this.projects = JSON.parse(JSON.stringify(this.projectsCopy));
      this.wavesLength = this.projects.length;
      this.updateTableData();
      return;
    }
    
    // Apply client-side filtering based on selected filters
    this.projects = this.projectsCopy.filter(project => {
      let matchesPortfolio = true;
      let matchesProjectName = true;
      
      // Filter by portfolio if selected
      if (event.portfolios && event.portfolios.length > 0) {
        const portfolioName = event.portfolios[0];
        matchesPortfolio = 
          (project.portfolioId?.portfolioName === portfolioName) || 
          (project.portfolioId?.id.toString() === portfolioName);
      }
      
      // Filter by project name if selected
      if (event.projects && event.projects.length > 0) {
        const projectName = event.projects[0].toLowerCase();
        matchesProjectName = 
          (project.name && project.name.toLowerCase().includes(projectName)) ||
          (project.projectdisplayname && project.projectdisplayname.toLowerCase().includes(projectName));
      }
      
      // Return true only if all selected filters match
      return matchesPortfolio && matchesProjectName;
    });
    
    // Update table and pagination
    this.wavesLength = this.projects.length;
    this.page = 0;
    this.updateTableData();
  }

  onFilterStatusChange(isExpanded: boolean) {
    this.isFilterExpanded = isExpanded;
  }
  
  /**
   * Handles search input from the header component
   * This performs client-side filtering without making API calls
   * @param searchText The search text input from the user
   */
  onSearchInput(searchText: string) {
    this.lastRefreshedTime = new Date();
    
    // If we don't have projectsCopy (original data), initialize it
    if (!this.projectsCopy || this.projectsCopy.length === 0) {
      this.projectsCopy = JSON.parse(JSON.stringify(this.projects));
    }
    
    // If search text is empty, restore the original data
    if (!searchText) {
      this.projects = JSON.parse(JSON.stringify(this.projectsCopy));
      this.wavesLength = this.projects.length;
      this.page = 0;
      this.updateTableData();
      return;
    }
    
    // Perform client-side filtering on the original data
    searchText = searchText.toLowerCase();
    this.projects = this.projectsCopy.filter(project => 
      (project.name && project.name.toLowerCase().includes(searchText)) ||
      (project.projectdisplayname && project.projectdisplayname.toLowerCase().includes(searchText)) ||
      (project.description && project.description.toLowerCase().includes(searchText)) ||
      (project.id && project.id.toString().toLowerCase().includes(searchText)) ||
      (project.portfolioId?.portfolioName && project.portfolioId.portfolioName.toLowerCase().includes(searchText))
    );
    
    // Update table and pagination
    this.wavesLength = this.projects.length;
    this.page = 0;
    this.updateTableData();
  }
  
  /**
   * Updates the table data source and pagination
   */
  updateTableData() {
    // Calculate the start and end indices for the current page
    const startIndex = this.page * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.projects.length);
    
    // Get the slice of data for the current page
    const paginatedData = this.projects.slice(startIndex, endIndex);
    
    // Update the table data source
    this.ProjectList = new MatTableDataSource(paginatedData);
    this.ProjectList.sort = this.sort;
    this.ProjectList.paginator = this.paginator;
    
    // Update pagination info
    this.wavesLength = this.projects.length;
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.wavesLength / this.pageSize);
    const pages = [];
    
    // Show max 5 page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(0, this.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  changePage(pageNumber: number) {
    this.page = pageNumber;
    this.pageIndex = pageNumber;
    this.onPageFired({ pageIndex: pageNumber, pageSize: this.pageSize, length: this.wavesLength });
  }

  navigatePage(direction: string) {
    if (direction === 'Prev' && this.page > 0) {
      this.changePage(this.page - 1);
    } else if (direction === 'Next' && this.page < this.lastPage) {
      this.changePage(this.page + 1);
    }
  }

  Refresh() {
    this.fetchWave(null);
  }

  lastRefreshedTime = new Date();

  ngOnDestroy(): void {
    // Clean up all subscriptions
    if (this.paramsSubscription) {
      this.paramsSubscription.unsubscribe();
    }
    
    // Unsubscribe from all subscriptions in the array
    this.subscriptions.forEach(sub => {
      if (sub) {
        sub.unsubscribe();
      }
    });
    
    // Clean up busy subscriptions
    if (this.busy) {
      this.busy.unsubscribe();
    }
    
    if (this.busy1) {
      this.busy1.unsubscribe();
    }
  }

  telemetryImpression() {
    // this.telemetryService.impression("iamp-usm", "detail", "ProjectListViewComponent");
    // this.openTelemetryService.startTelemetry("iamp-usm", "ProjectListViewComponent", "detail");
  }

  ngOnChanges(changes: SimpleChanges) {
    this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
  }

  /**
   * Invoked when user presses the search button.
   */
  search() {
    if (!this.sub) {
      this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
    }
  }

  loadPage(event) {
    if (this.role.roleadmin) {
      let portfolio: Portfolio;
      try {
        portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
      } catch (e: any) {
        portfolio = null;
        console.error("JSON.parse error - ", e.message);
      }
      this.example.portfolioId = portfolio;
    }

    this.projectService.findAll(this.example, event).subscribe(
      (pageResponse) => {
        (this.currentPage = pageResponse),
          (this.projects = this.currentPage.content.sort((a, b) =>
            a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
          ));
        this.projects = this.currentPage.content;
        this.copyblueprintProjects = this.currentPage.content.filter((project) => project.name.toLowerCase() != "core")
        
        // Store a deep copy of the original data for client-side filtering
        this.projectsCopy = JSON.parse(JSON.stringify(this.projects));
        
        // Update table data and pagination
        this.wavesLength = this.currentPage.totalElements;
        this.updateTableData();
      },
      (error) => this.messageService.messageNotification("Could not get the results", "error")
    );

    let allRole = new Role(); /** To fetch all roles */
    allRole.projectId = null;
    this.roleService.findAll(allRole, { first: 0, rows: 1000, sortField: null, sortOrder: null }).subscribe(res => {
      let rolesArr = []
      res.content.forEach((item) => {
        if (item.id != 6) rolesArr.push(item)    /** Array of all roles */
      })
      this.rolesArray = rolesArr.filter(r => r.projectId == this.project.id) /** Project specific roles */
      if (this.rolesArray.length == 0 && this.project.defaultrole) /** If project specific roles not exist and defaultrole is true */ {
        rolesArr = rolesArr.filter(r => r.projectId == null)
        this.rolesArray = rolesArr
      }
      this.rolesArray.sort((a, b) => a.name.localeCompare(b.name))
    })
  }
  fetchWave(pageEvent) {
    if (this.role.roleadmin) {
      let portfolio: Portfolio;
      try {
        portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
      } catch (e: any) {
        portfolio = null;
        console.error("JSON.parse error - ", e.message);
      }
      this.example.portfolioId = portfolio;
    }
    if (pageEvent == null || !pageEvent) {
      pageEvent = { page: 0, size: 1000 }; // Use a large page size to get most or all records at once
    }
    
    console.log('Fetching projects from API');
    
    this.projectService.FindAll(this.example, pageEvent).subscribe(
      (pageResponse) => {
        (this.currentPage = pageResponse),
          (this.projects = this.currentPage.content.sort((a, b) =>
            a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
          ));
        this.projects = this.currentPage.content;
        
        // Store a deep copy of the original projects for client-side filtering
        this.projectsCopy = JSON.parse(JSON.stringify(this.projects));
        console.log(`Loaded ${this.projectsCopy.length} projects for client-side filtering`);
        
        this.wavesLength = this.currentPage.totalElements;
        
        // Update pagination state
        this.page = pageEvent.page;
        this.pageSize = pageEvent.size;
        
        // Use client-side pagination
        this.updateTableData();
      },
      (error) => this.messageService.messageNotification("Could not get the results", "error")
    );
  }

  onRowSelect(event: any) {
    let id = event.id;
    this.router.navigate(["/project", id]);
  }

  showDeleteDialog(rowData: any) {
    let projectToDelete: Project = <Project>rowData;

    let dialogRef = this.confirmDeleteDialog.open(DeleteComponent, {
      disableClose: true,
      data: { title: "Delete Project", message: "Are you sure you want to delete?" },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "yes") {
        this.delete(projectToDelete);
      }
    });
  }

  // private delete(projectToDelete: Project) {
  //     let id = projectToDelete.id;

  //     this.projectService.delete(id).
  //         subscribe(
  //             response => {
  //                 this.currentPage.remove(projectToDelete);
  //                 this.messageService.messageNotification('Deleted OK', 'IAMP!');
  //             },
  //             error => this.messageService.messageNotification('Could not delete!', "IAMP")
  //         );
  // }
  rowSelected(item: Project) {
    this.router.navigate(["/project-view", item.id]);
  }
  setSelectedEntities(event) { }
  // Search() {
  //   let newtasks = new Array<Project>();

  //   if (this.filterProjectName == "All" || this.filterProjectName == "") {
  //     this.projects = this.projectsCopy;
  //   } else {
  //     this.projects = Object.assign([], this.projectsCopy).filter((item1) =>
  //       item1.name == null ? "" : item1.name.toLowerCase().indexOf(this.filterProjectName.toLowerCase()) > -1
  //     );
  //   }
  //   if (this.filterProject == "All" || this.filterProject == "") {
  //     this.projects = this.projects;
  //   } else {
  //     this.projects = Object.assign([], this.projects).filter(
  //       // item1 => item1.description.toLowerCase().indexOf(this.filterProject.toLowerCase()) > -1)
  //       (item1) =>
  //         item1.description == null ? "" : item1.description.toLowerCase().indexOf(this.filterProject.toLowerCase())
  //> -1
  //     );
  //     // newtasks = this.projectsCopy.filter(element => element.description == this.filterProject)
  //   }

  //   this.ProjectList = new MatTableDataSource(this.projects);
  //   this.ProjectList.sort = this.sort;
  //   this.ProjectList.paginator = this.paginator;
  // }
  Search(pageEvent) {
    let newtasks = new Array<Project>();
    if (pageEvent == null || !pageEvent) {
      pageEvent = { page: 0, size: this.pageSize };
    }
    
    // If this is a search text from the header component, treat it differently
    if (typeof pageEvent === 'string') {
      const searchText = pageEvent;
      
      // If search text is empty, restore original data
      if (!searchText) {
        this.projects = [...this.projectsCopy];
        this.wavesLength = this.projects.length;
        this.page = 0;
        this.updateTableData();
        return;
      }
      
      // Filter projects by name containing the search text
      this.projects = this.projectsCopy.filter(project => 
        project.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        project.projectdisplayname?.toLowerCase().includes(searchText.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchText.toLowerCase())
      );
      
      this.wavesLength = this.projects.length;
      this.page = 0;
      this.updateTableData();
      return;
    }
    
    // Ensure we have a copy of the original data for filtering
    if (!this.projectsCopy || this.projectsCopy.length === 0) {
      // If no cached data, fetch all projects first
      if (!this.projects || this.projects.length === 0) {
        this.fetchWave(null);
        return;
      }
      this.projectsCopy = JSON.parse(JSON.stringify(this.projects));
    }
    
    let params = {};
    
    // If no filters are applied, reset everything
    if ((this.selectedFilterValues.portfolios === undefined || this.selectedFilterValues.portfolios.length === 0) && 
        (this.selectedFilterValues.projects === undefined || this.selectedFilterValues.projects.length === 0) &&
        (this.filterProjectName == undefined || this.filterProjectName == "") &&
        (this.filterProject == undefined || this.filterProject == "")) {
      // Clear filters and show all data
      this.Clear();
      this.filterFlag = false;
      
      // Reset to original data from cache
      this.projects = [...this.projectsCopy];
      this.wavesLength = this.projects.length;
      this.page = 0;
      this.updateTableData();
      return;
    }
    
    // Use client-side filtering for all filter scenarios
    this.projects = this.projectsCopy.filter(project => {
      let matchesPortfolio = true;
      let matchesProjectName = true;
      
      // Filter by portfolio
      if (this.selectedFilterValues.portfolios && this.selectedFilterValues.portfolios.length > 0) {
        const portfolioName = this.selectedFilterValues.portfolios[0];
        const portfolioObj = this.usm_portfolio_idArray.find(p => 
          p.portfolioName === portfolioName || p.id.toString() === portfolioName);
          
        if (portfolioObj) {
          matchesPortfolio = 
            (project.portfolioId?.id === portfolioObj.id) || 
            (project.portfolioId?.portfolioName === portfolioObj.portfolioName);
        } else {
          matchesPortfolio = 
            (project.portfolioId?.portfolioName === portfolioName);
        }
      } else if (this.filterProject) {
        matchesPortfolio = 
          (project.portfolioId?.id === this.filterProject.id) || 
          (project.portfolioId?.portfolioName === this.filterProject.portfolioName);
      }
      
      // Filter by project name
      if (this.selectedFilterValues.projects && this.selectedFilterValues.projects.length > 0) {
        const projectName = this.selectedFilterValues.projects[0].toLowerCase();
        matchesProjectName = 
          (project.name && project.name.toLowerCase().includes(projectName)) ||
          (project.projectdisplayname && project.projectdisplayname.toLowerCase().includes(projectName));
      } else if (this.filterProjectName) {
        const projectName = this.filterProjectName.toLowerCase();
        matchesProjectName = 
          (project.name && project.name.toLowerCase().includes(projectName)) ||
          (project.projectdisplayname && project.projectdisplayname.toLowerCase().includes(projectName));
      }
      
      // Return true only if all selected filters match
      return matchesPortfolio && matchesProjectName;
    });
    
    this.wavesLength = this.projects.length;
    this.page = 0;
    this.updateTableData();
  }

  Clear() {
    console.log('Clearing all filters');
    
    // Reset filter values
    this.filterProject = undefined;
    this.filterProjectName = undefined;
    this.projectSearched = undefined;
    this.filterFlag1 = false;
    this.selectedFilterValues = {}; // Reset selected filter values
    this.activeFilters = {}; // Reset active filters
    
    // Clear search field if it exists
    if (this.myInputReference && this.myInputReference.nativeElement) {
      this.myInputReference.nativeElement.value = null;
    }
    
    // If we have stored original data, restore it for client-side filtering
    if (this.projectsCopy && this.projectsCopy.length > 0) {
      this.projects = JSON.parse(JSON.stringify(this.projectsCopy));
      this.wavesLength = this.projects.length;
      this.page = 0;
      this.updateTableData();
    } else {
      // If no original data, fetch from server
      this.fetchWave(null);
    }
    
    this.filterFlag = false;
  }
  assignCopy() {
    this.projects = Object.assign([], this.projectsCopy);
  }
  filterItem(value, pageEvent) {
    if (!value) {
      this.assignCopy();
    }
    if (this.projectSearched == "" || this.projectSearched == undefined) {
      this.Clear();
    } else {
      let params;
      params = {
        name: this.projectSearched,
      };
      if (this.role.roleadmin) {
        let portfolio: Portfolio;
        try {
          portfolio = JSON.parse(sessionStorage.getItem("portfoliodata"));
        } catch (e: any) {
          portfolio = null;
          console.error("JSON.parse error - ", e.message);
        }
        params.portfolioId = portfolio;
      }
      this.filterFlag1 = true;
      if (pageEvent == null || !pageEvent) {
        pageEvent = { page: 0, size: this.pageSize };
      }
      if (this.filterFlag1) {
        this.projectService.search(params, pageEvent).subscribe((res) => {
          this.projects = res.content;
          this.projectsCopy = this.projects;
          this.wavesLength = res.totalElements;
          this.pageIndex = 0;
          this.ProjectList = new MatTableDataSource(res.content);
          this.ProjectList.sort = this.sort;
          this.ProjectList.paginator = this.paginator;
        });
      }
    }
  }
  copyblueprint() {
    this.clickedcopyblueprint = true;
    if (this.fromProject == "" || this.fromProject == null || this.fromProject == undefined) {
      this.messageService.messageNotification("Project Should be Selected", "warning");
      this.clickedcopyblueprint = false;
    }
    else if (this.fromProject == this.project.name) {
      this.messageService.messageNotification("Source Project and Destination Project cannot be same", "warning");
      this.clickedcopyblueprint = false;
    }
    else {
        this.busy1 = this.projectService
        .copyBluePrint(this.fromProject, this.project.name, this.project.id)
        .subscribe(
          (res) => {
            this.messageService.messageNotification("Copy Blue Print Pipeline has started. Please check the Job Status", "success");
          },
          (error) => {
            if (error instanceof TypeError)
              this.messageService.messageNotification("Copy Blueprint has already been done for this project", "info");
            else this.messageService.messageNotification("Copy blueprint failed", "error");
          }
        );
    }
  }

  profileImageAdded(event) {
    if (event && event.target.files && event.target.files[0]) {
      if (event.target.files[0].size > 5 * 1000000) {
        this.messageService.messageNotification("Image file size exceeds 5 MB", "warning");
        return;
      } else if (event.target.files[0].name.length > 100) {
        this.messageService.messageNotification("Image Name  cannot be more than 100 characters", "warning");
        return;
      } else if (!this.extensionArray?.includes(event.target.files[0].type)) {
        this.messageService.messageNotification("File type should be " + this.allowedTypes + " ", "info");
        return;
      }
      else {
        this.helperService.toBase64(event.target.files[0], (base64Data) => {
          this.project.logo = base64Data;
          this.project.logoName = event.target.files[0].name;
          this.url = "data:image/png;base64," + this.project.logo;
        });
      }
    } else this.url = null;
  }
  removelogo() {
    this.url = null;
    // this.myInputReference1.nativeElement.value = null;
    this.project.logo = null;
    this.project.logoName = null;
  }

  // checkEnterPressed(event: any, val: any, pageEvent: any) {
  //   if (event.keyCode === 13) {
  //     this.projectSearched=event.srcElement.value;
  //     this.filterItem(event.srcElement.value, null);
  //   }
  // }
  callProjects() {
    this.loadPage({ first: 0, rows: 3000, sortField: null, sortOrder: null });
    // this.router.navigate(["../"], { relativeTo: this.route });
  }
  trackByMethod(index, item) { }

  onPageFired(event) {
    this.pageIndex = event.pageIndex;
    
    // Store the current pagination state
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    
    // If we have projectsCopy, we can do client-side pagination
    if (this.projectsCopy && this.projectsCopy.length > 0) {
      // Only make API calls if we need to load more data
      if (this.filterFlag == false && this.filterFlag1 == false && 
          this.projects.length < this.projectsCopy.length) {
        this.fetchWave({ page: event.pageIndex, size: this.pageSize });
      }
      // Otherwise, just update the UI with the filtered data we already have
      else {
        this.updateTableData();
      }
    } else {
      // If we don't have a cache of all projects, we need to get data from the server
      if (this.filterFlag == false && this.filterFlag1 == false) {
        this.fetchWave({ page: event.pageIndex, size: this.pageSize });
      }
      else if (this.filterFlag == true) {
        // Use client-side filtering with the data we already have
        this.Search({ page: event.pageIndex, size: this.pageSize });
      }
      else if (this.filterFlag1 == true) {
        this.filterItem(this.projectSearched, { page: event.pageIndex, size: this.pageSize });
      }
    }
  }

  checkProjectNameMaxLength() {
    if (this.project.name.length >= 255) {
      this.showNameLengthErrorMessage = true;
    } else {
      this.showNameLengthErrorMessage = false;
    }
  }

  checkDescriptionMaxLength() {
    if (this.project.description.length >= 255) {
      this.showDescLengthErrorMessage = true;
    } else {
      this.showDescLengthErrorMessage = false;
    }
  }

  checkProjectDisplayNameMaxLength() {
    if (this.project.projectdisplayname.length >= 255) {
      this.showDisplayNameLengthErrorMessage = true;
    } else {
      this.showDisplayNameLengthErrorMessage = false;
    }
  }
  callApi() {
    // this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
    if (!this.role.roleadmin) this.getid();
  }

  timeZoneChanged(timeZone: string): void {
    this.timeZone = timeZone;
  }

  excelValueChanged(disableExcel: boolean): void {
    this.disableExcel = disableExcel;
  }
  deleteSpecialChars(event) {
    var i = event.charCode
    return this.isValidLetter(i);
  }

  isValidLetter(i) {
    return ((i >= 65 && i <= 90) || (i >= 97 && i <= 122) || (i >= 48 && i <= 57) || [8, 13, 16, 17, 20, 95].indexOf(i) > -1)
  }

  createView() {
    const dialogRef = this.confirmDialog.open(ProjectDetailComponent, {
      maxHeight: "90vh",
      width: "600px",
      maxWidth: "90vw",
      disableClose: false,
      autoFocus: false,
      panelClass: 'custom-dialog-container',
      data: {
        edit: false,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.fetchWave(null);
    });
  }

  editView(project: Project) {
    // Navigate to the project detail page for editing
    this.router.navigate(["./projectlist/" + project.id + "/" + false], { relativeTo: this.route });
  }
  
  viewDetails(project: Project) {
    const dialogRef = this.confirmDialog.open(ProjectDetailComponent, {
      height: "70%", 
      width: "50%",
      disableClose: false,
      data: {
        view: true,
        project: project
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.fetchWave(null);
    });
  }
  theme = new Theme();
  response;
  saveTheme(theme, project?) {
    let projectTheme = this.response.content.filter((item) => (item.keys == "Project Theme")
      && item.project_id.id == this.project.id && item.project_name == this.project.name)[0];
    let themeId;
    if (projectTheme && projectTheme.value) {
      themeId = projectTheme.id
      this.theme = JSON.parse(projectTheme.value)
      this.theme.apptheme.themecolor = theme
      this.theme.widgettheme.tilebackgroundcolor = theme
      this.theme.widgettheme.proritizeThemeColor = true
      this.theme.widgettheme.colorpalette = [theme];
      this.theme.widgettheme.proritizeThemeColorArr = ["tilebackground"]
    } else {
      this.theme.apptheme = new AppTheme()
      this.theme.bcctheme = new BCCTheme()
      this.theme.dashboardtheme = new DashboardTheme()
      this.theme.widgettheme = new WidgetTheme()
      this.theme.apptheme.themecolor = theme
      this.theme.widgettheme.colorpalette = [theme];
      this.theme.widgettheme.proritizeThemeColorArr = ["tilebackground"]
      this.theme.widgettheme.proritizeThemeColor = true
      this.theme.widgettheme.tilebackgroundcolor = theme
    }
      let dashconstant = new DashConstant()
      dashconstant.keys = "Project Theme"
    dashconstant.project_id = new Project({ id: project ? project.id : this.project.id })
    dashconstant.project_name = project ? project.name : this.project.name
      dashconstant.value = JSON.stringify(this.theme)
      dashconstant.id = themeId
    if (this.themeoriginalcolor != this.theme.apptheme.themecolor) {
      this.dashConstantService.saveTheme(dashconstant).subscribe(
        response => {
          sessionStorage.setItem("AppCacheDashConstant", "true");
          sessionStorage.setItem("CacheDashConstant", "true");
          sessionStorage.setItem("UpdatedUser", "true");
      })
    }
    this.listView();
  }
  getDashConstant(theme, project?) {
    if (theme) {
      let dashconstant = new DashConstant()
      dashconstant.keys = "Project Theme"
      dashconstant.project_id = new Project({ id: project ? project.id : this.project.id })
      dashconstant.project_name = project ? project.name : this.project.name
      this.dashConstantService.findAll(dashconstant, this.lazyload).subscribe((res) => {
        this.response = res
      }, error => { this.listView() }, () => {
        this.saveTheme(theme, project)
      })
    }
  }

}
