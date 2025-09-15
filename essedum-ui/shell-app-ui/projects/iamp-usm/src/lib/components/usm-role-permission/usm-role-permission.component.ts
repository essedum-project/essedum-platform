/**
* The MIT License (MIT)
* Copyright © 2025 Infosys Limited
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
* to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
  OnDestroy,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { PageResponse } from "../../support/paging";
import { MessageService } from "../../services/message.service";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
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
import { Role } from "../../models/role";
import { UsmPermissions } from "../../models/usm-permissions";
import { Project } from "../../models/project";
import { DeleteComponent } from "../../shared-modules/confirm-delete/delete.component";
import { Subscription } from "rxjs";
import { IampUsmService } from "../../iamp-usm.service";
import { DashConstantService } from "../../services/dash-constant.service";
import { DashConstant } from "../../models/dash-constant";
import { RolePermissionAddComponent } from "./role-permission-add/role-permission-add/role-permission-add.component";
import { TagEventDTO } from "../../models/tagEventDTO.model";

@Component({
  templateUrl: "./usm-role-permission.component.html",
  styleUrl: "./usm-role-permission.component.css",
  selector: "lib-usm-role-permission",
})
export class UsmRolePermissionComponent implements OnInit, OnDestroy {
  @Input() header = "UsmRolePermissions...";
  @Output() changeView: EventEmitter<boolean> = new EventEmitter();
  @Input() sub: boolean = false;
  @Output() onAddNewClicked = new EventEmitter();
  p: number;
  @ViewChild("myInput", { static: false }) myInputReference: ElementRef;
  usmRolePermissionsToDelete: UsmRolePermissions;
  UsmRolePermissionsList: MatTableDataSource<any>;
  title = "Role Permissions list";
  readonly SERVICE_V1 = "RolePermission";
  lastRefreshedTime: Date | null = null;
  tagrefresh = false;
  displayedColumns: string[] = [
    "#",
    "Id",
    "Role",
    "Module",
    "Permission",
    "Actions",
  ];

  busy: Subscription;
  widgetSettingsArray: DashConstant[];
  widgetsSettingsAll: any[] = [];
  selectedWidgetSettings: any[] = [];
  dashconstant: DashConstant;
  wavesLength: number = 0;
  pageSize: number = 5;
  pageInde = 0;
  pageEvent: any;

  private sort: MatSort;
  selectedAdapterType: any;
  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
  }
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  example: UsmRolePermissions = new UsmRolePermissions();
  examplepermission: UsmPermissions = new UsmPermissions();
  examplerole: Role = new Role();

  currentPage: PageResponse<UsmRolePermissions> =
    new PageResponse<UsmRolePermissions>(0, 0, []);

  constructor(
    public dialog: MatDialog,
    public router: Router,
    public messageService: MessageService,
    public confirmDeleteDialog: MatDialog,
    public confirmDialog: MatDialog,
    public helperService: HelperService,
    private route: ActivatedRoute,
    public usmRolePermissionsService: UsmRolePermissionsService,
    public roleservice: RoleService,
    public usmPermissionService: UsmPermissionsService,
    private usmService: IampUsmService,
    public dashConstantService: DashConstantService
  ) {}

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
  lazyload = {
    first: 0,
    rows: 5000,
    sortField: "obj.role?.name",
    sortOrder: "desc",
  };
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
  dbsViewFlag: boolean = false;
  modulepermissionarrayFilter: any[] = [];
  pageArr: number[] = [0];
  pageNumberInput: number = 1;
  noOfPages: number = 1;
  prevRowsPerPageValue: number = 5;
  itemsPerPage: number[] = [5, 10, 20];
  endIndex: number = 5;
  startIndex: number = 0;
  pageNumberChanged: boolean = true;
  pageNumber: number = 1;
  filterFlag: boolean = false;
  filterFlag1: boolean = false;
  pageIndex: number = 0;
  hoverStates: boolean[] = Array(10).fill(false);
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();

  ngOnInit() {
    this.lastRefreshTime();
    this.fetchrole();
    this.fetchmodule();
    this.fetchdashconstants();
    this.loadPaginated(0, this.pageSize, null, null);

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
    if (
      window.location.href.includes("permissionlist") &&
      window.location.href.includes("true")
    ) {
      this.showCreate = true;
      this.edit = true;
      this.view = true;
      this.viewUsmRolePermissions = true;
      this.buttonFlag = true;
      this.route.params.subscribe((res) => {
        this.getUsmRolePermissionss(Number(window.atob(res["id"])));
      });
    } else if (
      window.location.href.includes("permissionlist") &&
      window.location.href.includes("false")
    ) {
      this.showCreate = true;
      this.edit = true;
      this.view = false;
      this.buttonFlag = false;
      this.route.params.subscribe((res) => {
        this.getUsmRolePermissionss(Number(window.atob(res["id"])));
      });
    } else if (
      window.location.href.includes("permissionlist") &&
      window.location.href.includes("create")
    ) {
      this.showCreate = true;
      this.edit = false;
      this.usmRolePermissions = new UsmRolePermissions();
      this.changeView.emit(false);
    }
  }

  fetchdashconstants() {
    let dashconstant = new DashConstant();
    dashconstant.keys = "widgetSettingsdefault";
    this.dashConstantService
      .findAll(dashconstant, this.lazyload)
      .subscribe((res) => {
        let response = res.content;
        this.widgetSettingsArray = response;
        this.widgetSettingsArray.forEach((ele, index) => {
          if (index == 0) this.widgetsSettingsAll = ele.value.split(",");
        });
      });
  }

  fetchrole() {
    this.rolearray = [];
    this.examplerole.projectId = null;
    this.roleservice
      .findAll(this.examplerole, this.lazyload)
      .subscribe((response) => {
        let project: Project;
        try {
          project = JSON.parse(sessionStorage.getItem("project"));
        } catch (e) {
          project = null;
        }
        this.rolearray = response.content;
        this.rolearray = response.content.filter((role) => role.id != 8);
        let role = JSON.parse(sessionStorage.getItem("role"));
        if (role.roleadmin) {
          this.rolearray = response.content.filter(
            (value) =>
              (!value.projectId || value.projectId == project.id) &&
              value.id != 6
          );
        }
        this.rolearray = this.rolearray.sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        );
      });
  }

  onKey(value) {
    this.modulepermissionarrayFilter = this.search(value);
    console.log("searched usm-permission", this.modulepermissionarrayFilter);
  }

  search(value: string) {
    let filter = value.toLowerCase();
    return this.modulepermissionarray.filter((option: UsmPermissions) =>
      (option.module + "-" + option.permission).toLowerCase().includes(filter)
    );
  }

  fetchmodule() {
    this.modulepermissionarray = [];
    this.array = [];
    this.usmPermissionService
      .findAll(this.examplepermission, this.lazyload)
      .subscribe((response) => {
        let project: Project;
        try {
          project = JSON.parse(sessionStorage.getItem("project"));
        } catch (e) {
          project = null;
        }
        this.modulepermissionarray = response.content;
        this.modulepermissionarray = this.modulepermissionarray.filter(
          (arr, index, self) =>
            index ===
            self.findIndex(
              (t) => t.module === arr.module && t.permission === arr.permission
            )
        );
        this.modulepermissionarray = this.modulepermissionarray.sort((a, b) =>
          a.module.toLowerCase() > b.module.toLowerCase() ? 1 : -1
        );
        this.modulepermissionarrayFilter = this.modulepermissionarray;
      });
  }

  ngOnDestroy() {}

  listView() {
    this.showCreate = false;
    this.changeView.emit(true);
    this.view = false;
    this.edit = false;
    this.viewUsmRolePermissions = false;
    this.loadPaginated(0, this.pageSize, null, null);
    this.router.navigate(["../../"], { relativeTo: this.route });
    this.lastRefreshTime();
  }

  checkUsmRolePermissions() {
    this.existingUsmRolePermissions = new Array<UsmRolePermissions>();
    this.usmRolePermissionss.forEach((existingElement) => {
      this.usmRolePermissionsArray.forEach((newElement) => {
        const existingPermissions = Array.isArray(existingElement.permission)
          ? existingElement.permission
          : [existingElement.permission];
        const newPermissions = Array.isArray(newElement.permission)
          ? newElement.permission
          : [newElement.permission];

        // Check if role IDs match and if there's any overlap in permissions
        if (existingElement.role.id === newElement.role.id) {
          for (const existingPerm of existingPermissions) {
            for (const newPerm of newPermissions) {
              if (
                existingPerm.module === newPerm.module &&
                existingPerm.permission === newPerm.permission
              ) {
                this.existingUsmRolePermissions.push(existingElement);
                break;
              }
            }
          }
        }
      });
    });
    if (this.existingUsmRolePermissions.length >= 1) {
      this.existingUsmRolePermission = new MatTableDataSource(
        this.existingUsmRolePermissions
      );
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
    }

    this.errorMessage = false;
    if (
      this.usmRolePermissions.role == undefined ||
      this.usmRolePermissions.role == null
    ) {
      this.messageService.messageNotification("Please Select A Role", "warning");
    } else if (
      this.usmRolePermissions.permission == undefined ||
      this.usmRolePermissions.permission == null
    ) {
      this.messageService.messageNotification(
        "Please Select A Module and Permission",
        "warning"
      );
    } else {
      if (this.edit) this.updateWave();
      else {
        this.usmRolePermissionsArray = new Array<UsmRolePermissions>();
        let permissions: UsmPermissions[] = this.usmRolePermissions.permission;

        if (permissions.length > 1) {
          // Create separate role-permission entries for each permission
          permissions.forEach((element) => {
            let temp = new UsmRolePermissions();
            temp.permission = [element];
            temp.role = this.usmRolePermissions.role;
            this.usmRolePermissionsArray.push(temp);
          });
        } else if (permissions.length === 1) {
          // Just one permission, create a single role-permission entry
          let temp = new UsmRolePermissions();
          temp.permission = [permissions[0]];
          temp.role = this.usmRolePermissions.role;
          this.usmRolePermissionsArray.push(temp);
        }
        let flag: boolean = false;
        flag = this.checkUsmRolePermissions();

        if (!flag) {
          this.busy = this.usmRolePermissionsService
            .createAll(this.usmRolePermissionsArray)
            .subscribe(
              (response) => {
                this.messageService.messageNotification(
                  "Role-Permissions Saved Successfully"
                  
                );
                this.saveDashConstant();
                this.loadPaginated(0, this.pageSize, null, null);
                this.clearWave();
                this.showCreate = false;
                this.testCreate = true;
                this.errorMessage = false;
                this.listView();

              },
              (error) => {
                this.testCreate = false;
                this.messageService.messageNotification(
                  "Could not create Role-Permissions",
                  "error"
                );
              }
            );
        } else {
          this.messageService.messageNotification(
            "Could not save " +
              this.existingUsmRolePermissions.length +
              " Mapping(s) Already Exists",
            "error"
          );
        }
      }
    }
  }

  getUsmRolePermissionss(that) {
    this.usmRolePermissionsService
      .getUsmRolePermissions(that)
      .subscribe((res) => {
        this.usmRolePermissions = res;
        if (!Array.isArray(this.usmRolePermissions.permission)) {
          this.usmRolePermissions.permission = this.usmRolePermissions
            .permission
            ? [this.usmRolePermissions.permission]
            : [];
        }

        this.dbsViewFlag = false;
        if (
          this.usmRolePermissions.permission &&
          this.usmRolePermissions.permission.length > 0
        ) {
          for (let perm of this.usmRolePermissions.permission) {
            if (perm.module == "dbs" && perm.permission == "view") {
              this.dbsViewFlag = true;
              break;
            }
          }
        }
        let project: any;
        try {
          project = JSON.parse(sessionStorage.getItem("project"));
        } catch (e) {
          project = null;
        }
        if (this.dbsViewFlag) {
          this.dashConstantService.getDashConsts(project).subscribe((res) => {
            this.widgetSettingsArray = res.filter(
              (item) =>
                item.keys ==
                this.usmRolePermissions.role.name + "dbsViewSettingsdefault"
            );
            this.widgetSettingsArray.forEach((ele, index) => {
              if (index == 0) {
                this.dashconstant = ele;
                this.selectedWidgetSettings = JSON.parse(ele.value);
              }
            });
          });
        }
      });
  }

  showDeleteDialog(rowData: any) {
    let usmRolePermissionsToDelete: UsmRolePermissions = <UsmRolePermissions>(
      rowData
    );

    let dialogRef = this.confirmDeleteDialog.open(DeleteComponent, {
      disableClose: true,
      data: {
        title: "Delete Role Permission",
        message:
          "Are you sure do you want to delete the role permission '" +
          rowData.role?.name +
          "' with permission '" +
          rowData.permission[0]?.permission +
          "' ?",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "yes") {
        this.delete(usmRolePermissionsToDelete);
      }
    });
  }

  editUsmRolePermissions(usmRolePermissions) {
    // Use the new dialog approach
    this.editRolePermission(usmRolePermissions);

    // Keep the existing approach for backward compatibility
    this.changeView.emit(false);
    this.view = false;
    this.edit = true;
    this.showCreate = true;
    this.usmRolePermissions = usmRolePermissions;
    this.buttonFlag = false;
    this.router.navigate(
      ["./" + window.btoa(usmRolePermissions.id) + "/" + false],
      { relativeTo: this.route }
    );
  }

  view_UsmRolePermissions(usmRolePermissions) {
    this.viewRolePermission(usmRolePermissions);
    this.view = true;
    this.edit = true;
    this.viewUsmRolePermissions = true;
    this.changeView.emit(false);
    this.showCreate = true;
    this.buttonFlag = true;
    this.currentUsmRolePermissions = usmRolePermissions;
    this.usmRolePermissions = usmRolePermissions;
    this.router.navigate(
      ["./" + window.btoa(usmRolePermissions.id) + "/" + true],
      { relativeTo: this.route }
    );
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
        (this.currentPage = pageResponse),
          (this.usmRolePermissionss = this.currentPage.content);
        this.usmRolePermissionssCopy = this.usmRolePermissionss;
        this.UsmRolePermissionsList = new MatTableDataSource(
          this.currentPage.content
        );
        this.UsmRolePermissionsList.paginator = this.paginator;
        this.UsmRolePermissionsList.sort = this.sort;

        if (this.currentPage.totalPages > 0) this.testCreate = true;
      },
      (error) => {
        this.testCreate = false;
        this.messageService.messageNotification("Could not get the results", "error");
      }
    );
  }

  loadPaginated(
    pageIndex: number,
    pageSize: number,
    sortField: string,
    orderBy: string
  ) {
    try {
      this.usmRolePermissionsService
        .findAllPaginated(pageIndex, pageSize, sortField, orderBy)
        .subscribe(
          (pageResponse) => {
            // Check if we received valid data
            if (pageResponse && pageResponse.content) {
              this.loadData(pageResponse);

              // If the response is empty, show an info message
              if (pageResponse.content.length === 0) {
                this.messageService.messageNotification(
                  "No role-permission records found",
                  "info"
                );
              }
            } else {
              // Handle null or invalid response
              this.messageService.messageNotification(
                "Invalid response received from API",
                "error"
              );
              // Initialize empty data structure
              this.loadData({ content: [], totalElements: 0, totalPages: 0 });
            }
          },
          (error) => {
            console.error("Error loading data from API:", error);
            this.messageService.messageNotification(
              "Failed to load role-permissions: " +
                (error.message || "Unknown error"),
              "error"
            );
            this.testCreate = false;
            // Initialize empty data structure
            this.loadData({ content: [], totalElements: 0, totalPages: 0 });
          }
        );
    } catch (error) {
      console.error("Exception occurred while loading data:", error);
      this.messageService.messageNotification("An error occurred while loading data", "error");
      this.testCreate = false;
      // Initialize empty data structure
      this.loadData({ content: [], totalElements: 0, totalPages: 0 });
    }
  }

  loadData(pageResponse) {
    console.log("pageResponse", pageResponse);
    pageResponse.content = pageResponse.content.sort((a, b) => {
      const nameA = a.role ? a.role.name.toLowerCase() : "";
      const nameB = b.role ? b.role.name.toLowerCase() : "";
      return nameA > nameB ? 1 : nameA < nameB ? -1 : 0;
    });
    this.currentPage = pageResponse;
    this.usmRolePermissionss = this.currentPage.content;
    this.usmRolePermissionssCopy = this.usmRolePermissionss;
    this.UsmRolePermissionsList = new MatTableDataSource(
      this.currentPage.content
    );
    this.wavesLength = pageResponse.totalElements;

    this.noOfPages = this.currentPage.totalPages || 1; // Ensure at least 1 page
    console.log("Setting noOfPages to:", this.noOfPages);
    this.pageArr = Array(this.noOfPages)
      .fill(0)
      .map((x, i) => i);
    console.log("Generated pageArr:", this.pageArr);

    if (this.pageNumber > 5) {
      this.endIndex = Math.min(this.pageNumber + 2, this.noOfPages);
      this.startIndex = Math.max(0, this.endIndex - 5);
    } else {
      this.startIndex = 0;
      this.endIndex = Math.min(5, this.noOfPages);
    }

    if (this.currentPage.totalPages > 0) this.testCreate = true;
    this.lastRefreshTime()
  }

  onPageFired(event) {
    this.pageEvent = event;
    if (
      this.filterUsmRolePermissions.role == "All" &&
      this.filterUsmRolePermissions.module == "All"
    )
      this.loadPaginated(event.pageIndex, this.pageSize, null, null);
    else this.SearchedPage(true, "", "", "All");
  }

  filterItem(value) {
    console.log("inside filterItem value", value);
    this.filterUsmRolePermissions.role = value;
    this.filterUsmRolePermissions.module = "All";

    console.log("filterUsmRolePermissions", this.filterUsmRolePermissions);

    // Check if value is a Role object or a string or the value 'All'
    let roleName;
    if (value === 'All') {
      roleName = ""; // Empty string means no filter
    } else if (typeof value === 'object' && value !== null) {
      roleName = value.name || "All";
    } else {
      roleName = value || "All";
    }
    
    console.log("Filtering by role name:", roleName);
    this.SearchedPage(false, "", "", roleName);
    this.paginator.firstPage();
    this.lastRefreshTime();    
  }

  checkEnterPressed(event: any, val: any) {
    console.log("inside checkEnterpressed event", event, "val", val);
    if (event.keyCode === 13) {
      this.filterItem(val);
    }
  }  Search() {
    // Extract module value - could be a string or an object with a module property
    let module = "";
    if (this.filterUsmRolePermissions.module && this.filterUsmRolePermissions.module !== "All") {
      // Check if module is a string or an object
      if (typeof this.filterUsmRolePermissions.module === 'string') {
        module = this.filterUsmRolePermissions.module;
      } else if (this.filterUsmRolePermissions.module.module) {
        module = this.filterUsmRolePermissions.module.module;
      }
    }
    
    // Extract permission values - handle both array and single object cases
    let permission = "";
    if (this.filterUsmRolePermissions.permission) {
      if (Array.isArray(this.filterUsmRolePermissions.permission) && this.filterUsmRolePermissions.permission.length > 0) {
        // For API filtering, we'll use the first permission's value
        // The full array is used in the UI display
        permission = this.filterUsmRolePermissions.permission[0].permission || "";
      } else if (typeof this.filterUsmRolePermissions.permission === 'object') {
        permission = this.filterUsmRolePermissions.permission.permission || "";
      }
    }
    
    // Extract role value
    let role = "";
    if (this.filterUsmRolePermissions.role) {
      if (this.filterUsmRolePermissions.role === "All") {
        role = "";
      } else if (typeof this.filterUsmRolePermissions.role === 'object') {
        role = this.filterUsmRolePermissions.role.name || "";
      } else {
        role = this.filterUsmRolePermissions.role;
      }
    }
    
    console.log("Search with params:", { module, permission, role });
    this.SearchedPage(false, module, permission, role);
    this.paginator.firstPage();
  }  
  
  SearchedPage(flag, module, permission, role) {
    let index = flag ? this.pageEvent.pageIndex : 0;
    
    // Handle various formats of role parameter
    let roleName = "";
    if (role === "All") {
      roleName = "";
    } else if (typeof role === 'object' && role !== null) {
      // If role is an object, extract the name
      roleName = role.name || "";
      console.log("Using role name from object:", roleName);
    } else if (typeof role === 'string') {
      // If role is already a string but not "All"
      roleName = role;
      console.log("Using role name from string:", roleName);
    }
    
    // Handle permission parameter - could be a string, array, or object
    let permissionName = "";
    if (permission) {
      if (Array.isArray(permission) && permission.length > 0) {
        // Use the first permission's value for API filtering
        permissionName = permission[0].permission || "";
      } else if (typeof permission === 'object') {
        permissionName = permission.permission || "";
      } else if (typeof permission === 'string') {
        permissionName = permission;
      }
    }
    
    console.log("SearchedPage params:", { 
      module, 
      permission: permissionName, 
      roleName,
      index, 
      pageSize: this.pageSize 
    });
      this.usmRolePermissionsService
      .findAllSearched(
        module,
        permissionName,
        roleName,
        index,
        this.pageSize,
        null,
        null
      )
      .subscribe(
        (pageResponse) => {
          this.loadData(pageResponse);
        },
        (error) => {
          this.testCreate = false;
          this.messageService.messageNotification("Could not get the results", "error");
          console.error("Error in SearchedPage:", error);
        }
      );
  }

  updateWave() {
    if (!Array.isArray(this.usmRolePermissions.permission)) {
      this.usmRolePermissions.permission = this.usmRolePermissions.permission
        ? [this.usmRolePermissions.permission]
        : [];
    }
    let duplicateFound = false;
    for (const currentPermission of this.usmRolePermissions.permission) {
      const duplicates = this.usmRolePermissionss.filter(
        (item) =>
          item.id != this.usmRolePermissions.id &&
          item.role.id == this.usmRolePermissions.role.id &&
          Array.isArray(item.permission) &&
          item.permission.some(
            (p) =>
              p.module === currentPermission.module &&
              p.permission === currentPermission.permission
          )
      );

      if (duplicates.length > 0) {
        duplicateFound = true;
        break;
      }
    }

    if (duplicateFound) {
      this.messageService.messageNotification(
        "Duplicate Role Permission cannot be created",
        "warning"
      );
      return;
    } else {
      this.busy = this.usmRolePermissionsService
        .update(this.usmRolePermissions)
        .subscribe(
          (rs) => {
            this.testId = rs.id;
            this.testCreate = true;
            this.updateDashConstant();
            this.messageService.message(
             rs, "Role-Permission updated successfully",
              
            );
            this.clearWave();
            this.showCreate = false;
            this.listView();
          },
          (error) => {
            this.testCreate = false;
            this.messageService.messageNotification("Could not update", "warning");
          }
        );
    }
  }

  delete(usmRolePermissionsToDelete: UsmRolePermissions) {
    let id = usmRolePermissionsToDelete.id;
    console.log(
      `Attempting to delete role permission with ID: ${id}`,
      usmRolePermissionsToDelete
    );

    this.usmRolePermissionsService.delete(id).subscribe(
      (response) => {
        console.log(`Delete response for ID ${id}:`, response);
        this.testCreate = true;
        this.currentPage.remove(usmRolePermissionsToDelete);
        this.deletedashconstant(usmRolePermissionsToDelete);        
        this.messageService.messageNotification(
          "Role-Permission Deleted successfully"
        );
  this.loadPaginated(0, this.pageSize, null, null);
        this.Clear();
      },
      (error) => {
        console.error(`Error deleting role permission with ID ${id}:`, error);
        this.testCreate = false;
        const errorMessage =
          error?.error?.message ||
          "Could not delete! Server returned an error.";
        this.messageService.messageNotification(errorMessage, "error");       
        this.loadPaginated(0, this.pageSize, null, null);
      }
    );
  }

  clearWave() {
    if (this.edit || this.view) {
      this.usmRolePermissions.permission = [];
      this.usmRolePermissions.role = null;
      this.errorMessage = false;
    } else {
      this.usmRolePermissions = new UsmRolePermissions();
      this.errorMessage = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.loadPaginated(0, this.pageSize, null, null);
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 && o1.id == o2.id;
  }

  compareObjects1(o1: any, o2: any): boolean {
    return o1 && o2 && o1.permission == o2.permission;
  }

  Clear() {
    this.filterUsmRolePermissions.role = "All";
    this.filterUsmRolePermissions.module = "All";
    this.myInputReference.nativeElement.value = null;
    this.usmRolePermissionss = this.usmRolePermissionssCopy;
    this.loadPaginated(0, this.pageSize, null, null);
  }

  assignCopy() {
    this.usmRolePermissionss = Object.assign([], this.usmRolePermissionssCopy);
  }

  trackByMethod(index, item) {}

  permissionCheck(event) {
    let flag: boolean = false;
    let permissions: any = this.usmRolePermissions.permission;
    if (permissions.length >= 1) {
      permissions.forEach((element) => {
        if (element.module == "dbs" && element.permission == "view")
          flag = true;
      });
    }
    if (flag) this.dbsViewFlag = true;
    else this.dbsViewFlag = false;
  }

  updatepermissionCheck(event) {
    let flag: boolean = false;
    let permissions: any = this.usmRolePermissions.permission;
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      for (let perm of permissions) {
        if (perm.module == "dbs" && perm.permission == "view") {
          flag = true;
          break;
        }
      }
    }

    if (flag) this.dbsViewFlag = true;
    else this.dbsViewFlag = false;
  }

  saveDashConstant() {
    let project: Project;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e) {
      project = null;
    }
    let dashConstant: DashConstant = new DashConstant();
    dashConstant.keys =
      this.usmRolePermissions.role.name + "dbsViewSettingsdefault";
    dashConstant.value = JSON.stringify(this.selectedWidgetSettings);
    dashConstant.project_id = new Project({ id: project.id });
    dashConstant.project_name = project.name;
    this.busy = this.dashConstantService.create(dashConstant).subscribe(
      (response) => {
        this.messageService.message(
         response, "Configuration for Dbs-view added successfully"
         
        );
      },
      (error) => {
        this.messageService.messageNotification(
          "Could not Add Configuration for Dbs-view!",
          "warning"
        );
      }
    );
  }

  updateDashConstant() {
    let project: Project;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e) {
      project = null;
    }
    if (this.dashconstant)
      this.dashconstant.value = JSON.stringify(this.selectedWidgetSettings);
    else {
      this.dashconstant = new DashConstant();
      this.dashconstant.keys =
        this.usmRolePermissions.role.name + "dbsViewSettingsdefault";
      this.dashconstant.value = JSON.stringify(this.selectedWidgetSettings);
      this.dashconstant.project_id = new Project({ id: project.id });
      this.dashconstant.project_name = project.name;
    }
    this.busy = this.dashConstantService.update(this.dashconstant).subscribe(
      (response) => {
        this.messageService.info(
          "Configuration for Dbs-view updated successfully",
          ""
        );
      },
      (error) => {
        this.messageService.messageNotification(
          "Could not Add Configuration for Dbs-view!",
          "warning"
        );
      }
    );
  }

  deletedashconstant(usmRolePermissionsToDelete) {
    let project: Project;
    let dbsViewFlag: boolean = false;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e) {
      project = null;
    }
    if (usmRolePermissionsToDelete.permission) {
      const permissions = Array.isArray(usmRolePermissionsToDelete.permission)
        ? usmRolePermissionsToDelete.permission
        : [usmRolePermissionsToDelete.permission];

      for (const perm of permissions) {
        if (perm.module === "dbs" && perm.permission === "view") {
          dbsViewFlag = true;
          break;
        }
      }
    }
    if (dbsViewFlag) {
      this.dashConstantService.getDashConsts(project).subscribe((res) => {
        let widgetSettingsArray = res.filter(
          (item) =>
            item.keys ==
            usmRolePermissionsToDelete.role.name + "dbsViewSettingsdefault"
        );
        widgetSettingsArray.forEach((ele, index) => {
          if (index == 0) {
            this.dashConstantService.delete(ele.id).subscribe(
              (res) => {
                this.messageService.info(
                  "Configuration for Dbs-view deleted successfully",
                  ""
                );
              },
              (error) => {
                this.messageService.messageNotification(
                  "Could not delete Configuration for Dbs-view!",
                  "warning"
                );
              }
            );
          }
        });
      });
    }
  }

  createRolePermission() {
    const dialogRef = this.dialog.open(RolePermissionAddComponent, {
      height: "67%",
      width: "50%",
      disableClose: true,
      data: {
        mode: "create",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPaginated(0, this.pageSize, null, null);
        this.lastRefreshTime();
      }
    });
  }

  editRolePermission(rolePermission?: UsmRolePermissions) {
    if (
      !rolePermission &&
      this.usmRolePermissionss &&
      this.usmRolePermissionss.length > 0
    ) {
      rolePermission = this.usmRolePermissionss[0];
    } else if (!rolePermission) {
      this.loadPaginated(0, this.pageSize, null, null);
      if (this.usmRolePermissionss && this.usmRolePermissionss.length > 0) {
        rolePermission = this.usmRolePermissionss[0];
      } else {
        this.messageService.message(
          "No role permissions available to edit",
          ""
        );
        return;
      }
    }

    const dialogRef = this.dialog.open(RolePermissionAddComponent, {
      height: "67%",
      width: "50%",
      disableClose: true,
      data: {
        mode: "edit",
        rolePermission: rolePermission,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPaginated(0, this.pageSize, null, null);
        this.lastRefreshTime();
      }
    });
  }

  viewRolePermission(rolePermission?: UsmRolePermissions) {
    if (
      !rolePermission &&
      this.usmRolePermissionss &&
      this.usmRolePermissionss.length > 0
    ) {
      rolePermission = this.usmRolePermissionss[0];
    } else if (!rolePermission) {
      this.loadPaginated(0, this.pageSize, null, null);
      if (this.usmRolePermissionss && this.usmRolePermissionss.length > 0) {
        rolePermission = this.usmRolePermissionss[0];
      } else {
        this.messageService.info(
          "No role permissions available to view",
          ""
        );
        return;
      }
    }

    const dialogRef = this.dialog.open(RolePermissionAddComponent, {
      height: "67%",
      width: "50%",
      disableClose: true,
      data: {
        mode: "view",
        rolePermission: rolePermission,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
      }
    });
  }

  getRowNumber(index: number): number {
    return this.pageNumber * this.pageSize + index + 1 - this.pageSize;
  }

  lastRefreshTime() {
    setTimeout(() => {
      this.lastRefreshedTime = new Date();
    }, 1000);
  }
  onTagSelected(event: TagEventDTO) {
    console.log('onTagSelected event received:', event);
    
    // Check if we have role filter information
    if (event && event['roleFilter']) {
      const roleFilter = event['roleFilter'];
      console.log('Role filter received in event:', roleFilter);
      
      // Get module and permission filters if present
      const moduleFilter = event['moduleFilter'] || 'All';
      const permissionFilter = event['permissionFilter'] || [];
      
      console.log('Module filter received in event:', moduleFilter);
      console.log('Permission filter received in event:', permissionFilter);
      
      // Set filters in the filterUsmRolePermissions object
      this.filterUsmRolePermissions.role = roleFilter;
      this.filterUsmRolePermissions.module = moduleFilter;
      
      // Determine role name for filtering
      let roleName;
      if (roleFilter === 'All') {
        roleName = ""; // Empty string means no filter
      } else if (typeof roleFilter === 'object' && roleFilter !== null) {
        roleName = roleFilter.name || "All";
      } else {
        roleName = roleFilter || "All";
      }
      
      // Determine module name for filtering
      let moduleName = "";
      if (moduleFilter !== 'All') {
        moduleName = moduleFilter;
      }
        // Pass the entire permission filter array to allow proper handling in SearchedPage
      console.log("Filtering by role, module, permission:", roleName, moduleName, permissionFilter);
      
      // Pass the full array to SearchedPage which will handle extracting the appropriate value
      this.SearchedPage(false, moduleName, permissionFilter, roleName);
      this.paginator.firstPage();
    } else {
      // If no filters, show all
      this.SearchedPage(false, "", "", "");
    }
  }

  nextPage() {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      this.changePage();
    }
  }

  prevPage() {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      this.changePage();
    }
  }

  changePage(page?: number) {
    if (page && page >= 1 && page <= this.noOfPages) this.pageNumber = page;
    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      if (this.pageNumber > 5) {
        this.endIndex = this.pageNumber;
        this.startIndex = this.endIndex - 5;
      } else {
        this.startIndex = 0;
        this.endIndex = 5;
      }

      const pageEvent = { page: this.pageNumber - 1, size: this.pageSize };
      if (this.filterFlag == false && this.filterFlag1 == false) {
        this.fetchWave(pageEvent);
      } else if (this.filterFlag == true) {
        this.Search();
        this.pageChanged.emit(this.pageNumber);
      } else if (this.filterFlag1 == true) {
        this.fetchWave(pageEvent);
        if (this.searchedName && this.searchedName !== "All") {
          this.filterItem(this.searchedName);
        }
      }
    }
  }

  fetchWave(pageEvent) {
    if (pageEvent == null || !pageEvent) {
      pageEvent = { page: 0, size: this.pageSize };
    }

    this.loadPaginated(pageEvent.page, this.pageSize, null, null);

    this.pageNumber = pageEvent.page + 1 || 1;
    if (this.currentPage && this.currentPage.totalPages) {
      this.noOfPages = this.currentPage.totalPages;

      this.pageArr = Array(this.noOfPages)
        .fill(0)
        .map((x, i) => i);

      if (this.pageNumber > 5) {
        this.endIndex = Math.min(this.pageNumber + 2, this.noOfPages);
        this.startIndex = Math.max(0, this.endIndex - 5);
      } else {
        this.startIndex = 0;
        this.endIndex = Math.min(5, this.noOfPages);
      }
    }

    this.pageChanged.emit(this.pageNumber);
    this.lastRefreshTime();
    this.loadPaginated(pageEvent.page, this.pageSize, null, null);
    this.noOfPages = this.currentPage.totalPages;
    this.pageNumber = pageEvent.page + 1 || 1;

    this.pageArr = Array(this.noOfPages)
      .fill(0)
      .map((x, i) => i);

    if (this.pageNumber > 5) {
      this.endIndex = Math.min(this.pageNumber + 2, this.noOfPages);
      this.startIndex = Math.max(0, this.endIndex - 5);
    } else {
      this.startIndex = 0;
      this.endIndex = Math.min(5, this.noOfPages);
    }

    this.pageChanged.emit(this.pageNumber);
    this.lastRefreshTime();
  }
}
