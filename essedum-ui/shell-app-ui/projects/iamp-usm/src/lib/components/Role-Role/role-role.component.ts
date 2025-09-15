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
  import { Role } from "../../models/role";
  import { UsmPermissions } from "../../models/usm-permissions";
  import { Project } from "../../models/project";
  import { DeleteComponent } from "../../shared-modules/confirm-delete/delete.component";
  import { Subscription } from "rxjs";
  import { IampUsmService } from "../../iamp-usm.service";
  // import { DashConstantService } from "../../services/dash-constant.service";
  import { DashConstant } from "../../models/dash-constant";
  import { Users } from '../../models/users';
  
  
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
    isBackHovered: boolean = false;
  // Filter properties
  isFilterExpanded: boolean = false;
  filterOptions: any[] = [];
  selectedFilterValues: any = {
    roles: [],
    projects: [],
    descriptions: []
  };
    lastRefreshedTime: Date = new Date();
    
    // Pagination variables
    pagedRoles: any[] = [];
    page: number = 0;
    rowsPerPage: number = 5;
    totalrecords: number = 0;
    lastPage: number = 0;
    
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
      private usmService: IampUsmService,
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
      console.log("thisworkkkksss2222")
      // this.telemetryImpression();
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
        // Initialize pagination
        this.totalrecords = this.roletorolemappinglist.length;
        this.lastPage = Math.ceil(this.totalrecords / this.rowsPerPage) - 1;
        this.updatePagedRoles();
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
      
      console.log("Fetching all roles for dropdown");
      this.roleservice.findAll(allRole, event).subscribe(
        (response) => {
          console.log("Roles fetched:", response.content);
          this.roletorolearray = response.content;
          
          // Initialize filter options
          this.initializeFilterOptions();
          
          if(role && role.roleadmin && portfolio && role.portfolioId == portfolio.id){
            this.roletorolearray.forEach((element)=>{
              if(element.projectId == null || (project && element.projectId == project.id)){
                tempRolesArray.push(element);
              }
            });
            this.roletorolearray = tempRolesArray;
          }

          console.log("Filtered roles for dropdown:", this.roletorolearray);

          // Sort the array by name
          this.roletorolearray = this.roletorolearray.sort((a, b) =>
            a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
          );
          
          // If we already have a role loaded (in edit/view mode), match it with the dropdown data
          if (this.roletoroleitem && this.roletoroleitem.childRoleId) {
            const matchedRole = this.roletorolearray.find(
              r => r.id === this.roletoroleitem.childRoleId.id
            );
            
            if (matchedRole) {
              // Update the role with the full object so dropdown selects properly
              this.roletoroleitem.childRoleId = matchedRole;
              console.log("Updated existing role with full object", matchedRole);
            }
          }
        },
        (error) => {
          console.error("Error fetching roles:", error);
          this.messageService.messageNotification("Error loading roles", "error");
        }
      );
    }

    // Filter methods
    initializeFilterOptions(): void {
      this.filterOptions = [];
      
      // Add role options if available
      if (this.roletorolearray && this.roletorolearray.length > 0) {
        this.filterOptions.push({
          type: 'role',
          options: this.roletorolearray.map(role => ({
            label: role.name,
            value: role.name
          }))
        });
      }
  }    onFilterSelected(event: any): void {
      this.selectedFilterValues = event;
      this.applyFilters();
    }
  
    onFilterStatusChange(isExpanded: boolean): void {
      this.isFilterExpanded = isExpanded;
    }
  
    applyFilters(): void {
      // Reset to original list
      let filteredRoleRoles = [...this.roletorolemappinglist];
      
      // Apply role filters
      if (this.selectedFilterValues.roles && this.selectedFilterValues.roles.length > 0) {
        filteredRoleRoles = filteredRoleRoles.filter(roleRole => 
          roleRole.childRoleId && this.selectedFilterValues.roles.includes(roleRole.childRoleId.name)
        );
      }
      
      // Update the display data
      this.roletorolelistcopy.data = filteredRoleRoles;
      this.totalrecords = filteredRoleRoles.length;
      
      // Reset page to 0 when applying new filters
      this.page = 0;
      
      // Update pagination
      this.updatePagination();
    }

    ngOnDestroy() {
      // let activeSpan = this.openTelemetryService.fetchActiveSpan();
      // this.openTelemetryService.endTelemetry(activeSpan);
   }

    BackToListView() {
  
      this.showCreate=false;
      this.Refresh();
      // this.router.navigate(["../../"], { relativeTo: this.route });
    }
    listView() {
      this.changeView.emit(false);
      this.viewUsertouser = false;
      this.existingUsertouserlist = null;
      this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });}

    
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
        this.messageService.messageNotification("Please Select A Role", "warning");
      } 
      else if (arr.length>0 || (!temp.length && temp.name==this.selectedRole.name)) {
        this.messageService.messageNotification("Parent and Child Role cannot be same", "warning");
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
          //   this.messageService.messageNotification("Duplicate Role Permission cannot be created", "IAMP");
          //   return;
          // }
          if (!flag) {
            this.busy = this.roleroleService.createAll(this.roletorolecopyarraylist).subscribe(
              (response) => {
                this.messageService.messageNotification("Role-Role Mapping Saved Successfully", "success");
                this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
                this.clearWave();
                this.showCreate = false;
                this.testCreate = true;
                this.errorMessage = false;
                this.listView();
              },
              (error) => {
                this.testCreate = false;
                this.messageService.messageNotification("Could not create Role-Role Mapping", "error");
              }
            );
          } else {
            this.messageService.messageNotification(
              "Could not save " + this.existingUsertouserlists.length + " Mapping(s) Already Exists",
              "error"
            );
          }
        }
      }
    }
  
    getroletorole(id) {
    console.log("Getting role-to-role data for ID:", id);
    this.roleroleService.getRolerole(id).subscribe(
      (res) => {
        console.log("Role-to-role data received:", res);
        this.roletoroleitem = res;
        
        // Ensure the childRoleId is properly set for viewing/editing
        if (this.roletoroleitem && this.roletorolearray) {
          // Find the matching child role in the array
          const matchedRole = this.roletorolearray.find(
            role => role.id === this.roletoroleitem.childRoleId.id
          );
          
          if (matchedRole) {
            // Set the full object for the dropdown to properly select
            this.roletoroleitem.childRoleId = matchedRole;
            console.log("Child role matched and set:", matchedRole);
          }
        }
        
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
      },
      (error) => {
        console.error("Error fetching role-to-role data:", error);
        this.messageService.messageNotification("Error loading role details", "error");
      }
    );
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
          
          // Update pagination data
          this.totalrecords = this.roletorolemappinglist.length;
          this.lastPage = Math.ceil(this.totalrecords / this.rowsPerPage) - 1;
          this.updatePagedRoles();
          this.roletorolelistcopy.paginator = this.paginator;
          this.roletorolelistcopy.sort = this.sort;
          
          // Add pagination logic
          this.totalrecords = this.roletorolemappinglist.length;
          this.updatePagination();
  
          if (this.currentPage.totalPages > 0) this.testCreate = true;
        },
        (error) => {
          this.testCreate = false;
          this.messageService.messageNotification("Could not get the results", "error");
        }
      );
    }
    
    // PAGINATION METHODS
    updatePagination() {
      const totalPages = Math.ceil(this.totalrecords / this.rowsPerPage);
      this.lastPage = Math.max(totalPages - 1, 0);
      if (this.page > this.lastPage) {
        this.page = this.lastPage;
      }
      this.updatePagedData();
    }

    updatePagedData() {
      const startIndex = this.page * this.rowsPerPage;
      const endIndex = Math.min(startIndex + this.rowsPerPage, this.totalrecords);
      this.pagedRoles = this.roletorolelistcopy.data.slice(startIndex, endIndex);
    }

    // getPageNumbers() {
    //   const totalPages = this.lastPage + 1;
    //   return Array.from({ length: totalPages }, (_, i) => i);
    // }

    // navigatePage(direction: 'Prev' | 'Next') {
    //   if (direction === 'Prev' && this.page > 0) {
    //     this.page--;
    //   } else if (direction === 'Next' && this.page < this.lastPage) {
    //     this.page++;
    //   }
    //   this.updatePagedData();
    // }

    // changePage(p: number) {
    //   this.page = p;
    //   this.updatePagedData();
    // }
    
    Refresh() {
      this.lastRefreshedTime = new Date();
      this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
    }
    
  
    updateWave() {
      let arr = this.roletorolemappinglist.filter(
        (item) =>
        item.id != this.roletoroleitem.id &&
        item.childRoleId.id == this.roletoroleitem.childRoleId.id &&
        item.parentRoleId.id == this.roletoroleitem.parentRoleId.id 
      );
      if (arr.length > 0) {
        this.messageService.messageNotification("Duplicate Role Permission cannot be created", "error");
        return;
      } else {
        this.busy = this.roleroleService.update(this.roletoroleitem).subscribe(
          (rs) => {
            this.testId = rs.id;
            this.testCreate = true;
            this.messageService.messageNotification("Role-Role Mapping updated successfully", "success");
            this.clearWave();
            this.showCreate = false;
            this,this.Refresh();
          },
          (error) => {
            this.testCreate = false;
            this.messageService.messageNotification("Could not update", "error");
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
          this.messageService.messageNotification("Role-Role Mapping Deleted successfully", "success");
          this.Clear();
        },
        (error) => {
          this.testCreate = false;
          this.messageService.messageNotification("Could not delete", "error");
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
      
      // Update pagination after filtering
      this.page = 0;
      this.totalrecords = this.roletorolemappinglist.length;
      this.lastPage = Math.ceil(this.totalrecords / this.rowsPerPage) - 1;
      this.updatePagedRoles();
    }
    Clear() {
      this.filterroletorole = "All";
  
      this.myInputReference.nativeElement.value = null;
      this.roletorolemappinglist = this.roletorolelistcopyarray;
      this.roletorolelistcopy = new MatTableDataSource(this.roletorolelistcopyarray);
      this.roletorolelistcopy.sort = this.sort;
      this.roletorolelistcopy.paginator = this.paginator;
      
      // Update pagination after clearing filters
      this.page = 0;
      this.totalrecords = this.roletorolemappinglist.length;
      this.lastPage = Math.ceil(this.totalrecords / this.rowsPerPage) - 1;
      this.updatePagedRoles();
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
      
      // Update pagination after filtering
      this.page = 0;
      this.totalrecords = this.roletorolemappinglist.length;
      this.lastPage = Math.ceil(this.totalrecords / this.rowsPerPage) - 1;
      this.updatePagedRoles();
    }
    checkEnterPressed(event: any, val: any) {
      if (event.keyCode === 13) {
        this.filterItem(event.srcElement.value);
      }
    }
    trackByMethod(index, item) {}
    
    // Pagination methods
    updatePagedRoles() {
      const startIndex = this.page * this.rowsPerPage;
      const endIndex = startIndex + this.rowsPerPage;
      this.pagedRoles = this.roletorolemappinglist.slice(startIndex, endIndex);
    }
    
    getPageNumbers(): number[] {
      const totalPages = Math.ceil(this.totalrecords / this.rowsPerPage);
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    
    changePage(pageNumber: number) {
      this.page = pageNumber;
      this.updatePagedRoles();
    }
    
    navigatePage(direction: string) {
      if (direction === 'Prev' && this.page > 0) {
        this.page--;
      } else if (direction === 'Next' && this.page < this.lastPage) {
        this.page++;
      }
      this.updatePagedRoles();
    }
  }

