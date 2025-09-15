import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, Inject, Optional, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";
import { DatePipe } from "@angular/common";
import { MessageService } from "../../services/message.service";
import { Project } from "../../models/project";
import { Role } from "../../models/role";
import { ProjectService } from "../../services/project.service";
import { HelperService } from "../../services/helper.service";
import { UsmPortfolioService } from "../../services/usm-portfolio.service";
import { Portfolio } from "../../models/portfolio";
import { Subscription } from "rxjs";
import { IampUsmService } from "../../iamp-usm.service";
import { RoleService } from "../../services/role.service";

@Component({
  selector: 'lib-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput: ElementRef;
  project: Project;
  params_subscription: any;
  edit: boolean = false;
  view: boolean = false;
  viewProject: boolean = false;
  lengthNameErrorMessage: String = "Maximum Character Limit Reached";
  showNameLengthErrorMessage: Boolean = false;
  showDescLengthErrorMessage: Boolean = false;
  showDisplayNameLengthErrorMessage: Boolean = false;
  busy: Subscription;
  projectsArray: any;
  allProject = new Project();
  auth: string = "";
  isAuth: boolean = true;
  permissionList: any[];
  selectedPermissionList: any[];
  editFlag: boolean = false;
  viewFlag: boolean = true;
  deleteFlag: boolean = false;
  createFlag: boolean = false;
  usm_portfolio_idArray: Portfolio[] = [];
  usm_portfolio_idObject: Portfolio = new Portfolio();
  portfolioIdVar: any;
  isBackHovered: boolean = false;
  @Output() projectModelClosed = new EventEmitter<void>();
  
  // Additional properties for new form fields
  url: any; // For logo preview
  extension: string = ".png, .jpg, .jpeg";
  allowedTypes: boolean = true;
  rolesArray: any[] = [];
  role: any = {};
  tzNames: string[] = [];
  
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public messageService: MessageService,
    public helperService: HelperService,
    public elementRef: ElementRef,
    public projectService: ProjectService,
    private usmService: IampUsmService,
    private usm_portfolio: UsmPortfolioService,
    private roleService: RoleService,
    @Optional() public dialogRef: MatDialogRef<ProjectDetailComponent>,
    public dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Only set dialogRef.disableClose if we're in dialog mode
    if (dialogRef) {
      dialogRef.disableClose = true;
    }
    
    // Handle data from the dialog if present
    if (data) {
      if (data.edit) {
        this.edit = true;
      }
      if (data.view) {
        this.view = true;
      }
      if (data.project) {
        this.project = data.project;
      }
      if (data.role) {
        this.role = data.role;
      }
    }
  }

  ngOnInit() {
    // Only initialize a new project if it wasn't passed in via data
    if (!this.project) {
      this.project = new Project();
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
    
    this.fetchProjects();
    this.getPortfolios();
    this.fetchRoles();
    this.loadTimeZones();
    
    // Check for route parameters (for edit mode)
    this.params_subscription = this.route.params.subscribe(params => {
      if (params['projectid']) {
        const projectId = params['projectid'];
        // Set edit mode if view param is false
        if (params['view'] === 'false') {
          this.edit = true;
          this.view = false;
        }
        
        // Load the project data
        this.projectService.getProject(projectId).subscribe(
          (project) => {
            this.project = project;
            if (this.project.logo) {
              this.url = this.project.logo;
            }
          },
          (error) => this.messageService.messageNotification("Could not fetch project", "error")
        );
      }
    });
    
    // If we're editing or viewing an existing project with just an ID via dialog
    if (this.data && this.data.projectId && !this.data.project) {
      this.projectService.getProject(this.data.projectId).subscribe(
        (project) => {
          this.project = project;
          if (this.project.logo) {
            this.url = this.project.logo;
          }
        },
        (error) => this.messageService.messageNotification("Could not fetch project", "error")
      );
    } else if (this.project && this.project.logo) {
      // If the project was passed directly and has a logo, update the url for display
      this.url = this.project.logo;
    }
  }

  fetchProjects() {
    this.allProject = new Project();
    this.projectService
      .findAll(this.allProject, { first: 0, rows: 1000, sortField: null, sortOrder: null })
      .subscribe((res) => {
        this.projectsArray = res.content;
      });
  }

  getPortfolios() {
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
        (error) => this.messageService.messageNotification("Could not get the portfolios", "error")
      );
  }

  check(project) {
    if (this.project && this.project.name) {
      this.project.name = this.project.name.trim();
    }
    if (project.name == undefined || project.name == null || project.name.trim().length == 0) {
      this.messageService.messageNotification("Project name can't be empty", "warning");
    } else if (!/^[a-zA-Z][a-zA-Z0-9 \-\_\.]*?$/.test(project.name)) {
      this.messageService.messageNotification("Project name format is incorrect", "warning");
    }
    else if (project.description && (!/^[a-zA-Z0-9][a-zA-Z0-9 \-\_\.]*?$/.test(project.description))) {
      this.messageService.messageNotification("Project description format is incorrect", "warning");
    }
    else if (!project.portfolioId) {
      this.messageService.messageNotification("Please select a portfolio", "warning");
    }
    else {
      this.onSave();
    }
  }

  closeProjectAddDialog(): void {
      const openDialogs = this.dialog.openDialogs;
      for (const dialog of openDialogs) {
        if (dialog.componentInstance instanceof ProjectDetailComponent) {
          dialog.close();
          this.dialogRef.afterClosed().subscribe(() => {
            this.projectModelClosed.emit();
          });
        }
      
    } 
  }
  navigateToList(){
          this.router.navigate(['./landing/iamp-usm/projectlist/'],);

  }
  onSave() {
    if (this.edit) {
      this.onUpdate();
    } else {
      let arr1 = this.projectsArray?.filter((item) => item.name != undefined);
      let arr2 = arr1?.filter((item) => item.name.toLowerCase() == this.project.name.toLowerCase());
      if (arr2?.length > 0) {
        this.messageService.messageNotification("Project name already exists", "info");
        return;
      } else {
        this.busy = this.projectService.create(this.project).subscribe((project) => {
          this.project = new Project();
          this.messageService.messageNotification("Created Successfully", "success");
          this.closeProjectAddDialog();
        });
      }
    }
  }
  
  compareTodiff(curr: any, prev: any) {
    let temparr = [];
    Object.keys(prev).forEach(key => {
      if (prev[key] != curr[key])
        temparr.push(key)
    });
    return temparr;
  }
  
  onUpdate() {
    let arr1 = this.projectsArray.filter((item) => item.name != undefined);
    let arr2 = arr1.filter(
      (item) => item.id != this.project.id && item.name.toLowerCase() == this.project.name.toLowerCase()
    );
    if (arr2.length > 0) {
      this.messageService.messageNotification("Project name already exists", "info");
      return;
    } else {
      this.busy = this.projectService.update(this.project).subscribe(
        (project) => {
          this.project = project;
          this.messageService.messageNotification("Updated Successfully", "success");
          this.clearProject();
          this.navigateToList();
        },
        (error) => this.messageService.messageNotification("Could not update", "error")
      );
    }
  }
  
  compareObjects(o1: any, o2: any): boolean {
    // Handle null values
    if (!o1 || !o2) {
      return o1 === o2;
    }
    // For portfolio objects - compare by id
    if (o1.portfolioName !== undefined && o2.portfolioName !== undefined) {
      return o1.id === o2.id;
    }
    // For roles and other objects - compare by name and id
    return o1.name === o2.name && o1.id === o2.id;
  }
  
  listView() {
    this.showNameLengthErrorMessage = false;
    this.showDescLengthErrorMessage = false;
    this.closeProjectAddDialog();
  }
  
  clearProject() {
    this.project = new Project();
    this.showDescLengthErrorMessage = false;
    this.showNameLengthErrorMessage = false;
  }
  
  trackByMethod(index, item) { }

  checkNameMaxLength() {
    if (this.project.name && this.project.name.length >= 255) {
      this.showNameLengthErrorMessage = true;
    } else {
      this.showNameLengthErrorMessage = false;
    }
  }

  checkDescriptionMaxLength() {
    if (this.project.description && this.project.description.length >= 255) {
      this.showDescLengthErrorMessage = true;
    } else {
      this.showDescLengthErrorMessage = false;
    }
  }
  
  checkProjectDisplayNameMaxLength() {
    if (this.project.projectdisplayname && this.project.projectdisplayname.length >= 255) {
      this.showDisplayNameLengthErrorMessage = true;
    } else {
      this.showDisplayNameLengthErrorMessage = false;
    }
  }
  
  deleteSpecialChars(event) {
    // Allow only alphanumeric and underscore characters
    const regex = new RegExp("^[a-zA-Z0-9_]$");
    const key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
  
  profileImageAdded(event) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Check file type
      const fileType = file.type;
      if (fileType.match(/image\/(png|jpeg|jpg)/)) {
        this.allowedTypes = true;
        
        // Store file info
        this.project.logoName = file.name;
        
        // Create image preview
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event: any) => {
          this.url = event.target.result;
          this.project.logo = this.url;
        };
      } else {
        this.allowedTypes = false;
        this.messageService.messageNotification("Only PNG, JPG and JPEG image formats are allowed", "warning");
        this.fileInput.nativeElement.value = "";
        this.project.logoName = null;
      }
    }
  }
  
  timeZoneChanged(event) {
    // Handle time zone change event if needed
    console.log("Time zone changed to:", event);
  }
  
  excelValueChanged(event) {
    // Handle excel value change event if needed
    console.log("Excel download option changed:", event);
  }
  
  fetchRoles() {
    // Fetch roles from the role service
    const roleFilter = new Role();
    this.roleService.findAll(roleFilter, { first: 0, rows: 1000, sortField: null, sortOrder: null })
      .subscribe(
        (response) => {
          this.rolesArray = response.content;
        },
        (error) => this.messageService.messageNotification("Could not fetch roles", "error")
      );
  }
  
  loadTimeZones() {
    // Load time zones list
    this.tzNames = [
      "Africa/Abidjan",
      "Africa/Accra",
      "Africa/Addis_Ababa",
      "Africa/Algiers",
      "Africa/Asmara",
      "Africa/Bamako",
      "Africa/Cairo",
      "Africa/Casablanca",
      "Africa/Lagos",
      "America/Argentina/Buenos_Aires",
      "America/Bogota",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "America/New_York",
      "America/Phoenix",
      "America/Sao_Paulo",
      "America/Toronto",
      "Asia/Calcutta",
      "Asia/Dubai",
      "Asia/Hong_Kong",
      "Asia/Jerusalem",
      "Asia/Kolkata",
      "Asia/Seoul",
      "Asia/Shanghai",
      "Asia/Singapore",
      "Asia/Tokyo",
      "Australia/Melbourne",
      "Australia/Sydney",
      "Europe/Amsterdam",
      "Europe/Berlin",
      "Europe/Brussels",
      "Europe/London",
      "Europe/Madrid",
      "Europe/Moscow",
      "Europe/Paris",
      "Europe/Rome",
      "Europe/Stockholm",
      "Pacific/Auckland",
      "Pacific/Honolulu"
    ];
  }
  
  ngOnDestroy() {
    // Clean up subscriptions when component is destroyed
    if (this.params_subscription) {
      this.params_subscription.unsubscribe();
    }
    
    if (this.busy) {
      this.busy.unsubscribe();
    }
  }
}
