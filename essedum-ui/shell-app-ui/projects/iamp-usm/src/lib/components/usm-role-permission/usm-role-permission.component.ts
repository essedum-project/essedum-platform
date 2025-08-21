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
  styleUrl:"./usm-role-permission.component.css",
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
  title="Role Permissions list";
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
  // list is paginated
  currentPage: PageResponse<UsmRolePermissions> =
    new PageResponse<UsmRolePermissions>(0, 0, []);

  //foreign key dependencies

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
  dbsViewFlag: boolean = false;
  modulepermissionarrayFilter: any[] = [];  pageArr: number[] = [0]; // Initialize with at least one page
  pageNumberInput: number = 1;
  noOfPages: number = 1; // Start with at least one page
  prevRowsPerPageValue: number = 5; // Default to pageSize
  itemsPerPage: number[] = [5, 10, 20];
  endIndex: number = 5; // Default value for pagination display
  startIndex: number = 0; // Default value for pagination display
  pageNumberChanged: boolean = true;
  pageNumber: number = 1; // Start at page 1
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
    
    // Always load data from API at initialization
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
          //console.error("JSON.parse error - ", e.message);
        }
        this.rolearray = response.content;
        // let projectid = project.id;
        // this.rolearray = response.content.filter((role) => role.projectId == null || role.projectId == projectid);
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

    // this.loadPage({ first: 0, rows: 5000, sortField: null, sortOrder: null });
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
          //console.error("JSON.parse error - ", e.message);
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

        // this.permissionarray = response.content;
        // this.permissionarray = this.permissionarray.filter(
        //   (arr, index, self) => index === self.findIndex((t) => t.permission === arr.permission)
        // );
        // this.permissionarray = this.permissionarray.sort((a, b) => (a.permission.toLowerCase() > b.permission.
        //toLowerCase() ? 1 : -1));
        // this.permissionarraycopy=this.permissionarray;
      });
    // this.loadPage({ first: 0, rows: 5000, sortField: null, sortOrder: null });
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
  }  checkUsmRolePermissions() {
    this.existingUsmRolePermissions = new Array<UsmRolePermissions>();
    this.usmRolePermissionss.forEach((existingElement) => {
      this.usmRolePermissionsArray.forEach((newElement) => {
        // Ensure we're working with arrays
        const existingPermissions = Array.isArray(existingElement.permission) ? existingElement.permission : [existingElement.permission];
        const newPermissions = Array.isArray(newElement.permission) ? newElement.permission : [newElement.permission];
        
        // Check if role IDs match and if there's any overlap in permissions
        if (existingElement.role.id === newElement.role.id) {
          for (const existingPerm of existingPermissions) {
            for (const newPerm of newPermissions) {
              if (existingPerm.module === newPerm.module && 
                  existingPerm.permission === newPerm.permission) {
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
      //console.error("JSON.parse error - ", e.message);
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
    if (
      this.usmRolePermissions.role == undefined ||
      this.usmRolePermissions.role == null
    ) {
      this.messageService.error("Please Select A Role", "LEAP");
    } else if (
      this.usmRolePermissions.permission == undefined ||
      this.usmRolePermissions.permission == null
    ) {
      this.messageService.error(
        "Please Select A Module and Permission",
        "LEAP"
      );    } else {
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
          this.busy = this.usmRolePermissionsService
            .createAll(this.usmRolePermissionsArray)
            .subscribe(
              (response) => {
                this.messageService.info(
                  "Role-Permissions Saved Successfully",
                  "LEAP"
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
                this.messageService.error(
                  "Could not create Role-Permissions",
                  "LEAP"
                );
              }
            );
        } else {
          this.messageService.info(
            "Could not save " +
              this.existingUsmRolePermissions.length +
              " Mapping(s) Already Exists",
            "IAMP"
          );
        }
      }
    }
  }

  getUsmRolePermissionss(that) {
    this.usmRolePermissionsService      .getUsmRolePermissions(that)
      .subscribe((res) => {
        this.usmRolePermissions = res;
        
        // Ensure permission is always treated as an array
        if (!Array.isArray(this.usmRolePermissions.permission)) {
          this.usmRolePermissions.permission = this.usmRolePermissions.permission ? 
            [this.usmRolePermissions.permission] : [];
        }
        
        // Check if any permission is for dbs view
        this.dbsViewFlag = false;
        if (this.usmRolePermissions.permission && this.usmRolePermissions.permission.length > 0) {
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
          //console.error("JSON.parse error - ", e.message);
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
    let usmRolePermissionsToDelete: UsmRolePermissions = <UsmRolePermissions>(
      rowData
    );

    let dialogRef = this.confirmDeleteDialog.open(DeleteComponent, {
      disableClose: true,
      data: {
        title: "Delete Role Permission",
        message:
          "Are you sure do you want to delete the role permission named '" +
          rowData.role?.name + "' with permission '"+rowData.permission?.module +
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
    // Use the new dialog approach
    this.viewRolePermission(usmRolePermissions);
    
    // Keep the existing approach for backward compatibility
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
        this.messageService.error("Could not get the results", "LEAP");
      }
    );
  }  loadPaginated(
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
                this.messageService.info("No role-permission records found", "LEAP");
              }
            } else {
              // Handle null or invalid response
              this.messageService.error("Invalid response received from API", "LEAP");
              // Initialize empty data structure
              this.loadData({ content: [], totalElements: 0, totalPages: 0 });
            }
          },
          (error) => {
            console.error('Error loading data from API:', error);
            this.messageService.error("Failed to load role-permissions: " + (error.message || "Unknown error"), "LEAP");
            this.testCreate = false;
            // Initialize empty data structure
            this.loadData({ content: [], totalElements: 0, totalPages: 0 });
          }
        );
    } catch (error) {
      console.error('Exception occurred while loading data:', error);
      this.messageService.error("An error occurred while loading data", "LEAP");
      this.testCreate = false;
      // Initialize empty data structure
      this.loadData({ content: [], totalElements: 0, totalPages: 0 });
    }
  }loadData(pageResponse) {
    console.log("pageResponse", pageResponse);
    pageResponse.content = pageResponse.content.sort((a, b) => {
      const nameA = a.role ? a.role.name.toLowerCase() : "";
      const nameB = b.role ? b.role.name.toLowerCase() : "";
      return nameA > nameB ? 1 : nameA < nameB ? -1 : 0;
    });
    (this.currentPage = pageResponse);
    (this.usmRolePermissionss = this.currentPage.content);
    this.usmRolePermissionssCopy = this.usmRolePermissionss;
    this.UsmRolePermissionsList = new MatTableDataSource(
      this.currentPage.content
    );
    this.wavesLength = pageResponse.totalElements;
    
    // Update pagination state
    this.noOfPages = this.currentPage.totalPages || 1; // Ensure at least 1 page
    console.log("Setting noOfPages to:", this.noOfPages);
    
    // Generate pagination array
    this.pageArr = Array(this.noOfPages).fill(0).map((x, i) => i);
    console.log("Generated pageArr:", this.pageArr);
    
    // Calculate start and end indices for pagination display
    if (this.pageNumber > 5) {
      this.endIndex = Math.min(this.pageNumber + 2, this.noOfPages);
      this.startIndex = Math.max(0, this.endIndex - 5);
    } else {
      this.startIndex = 0;
      this.endIndex = Math.min(5, this.noOfPages);
    }
    
    if (this.currentPage.totalPages > 0) this.testCreate = true;
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
    // if (!value) {
    //   this.assignCopy();
    // }
    // this.usmRolePermissionss = Object.assign([], this.usmRolePermissionssCopy).filter(
    //   (item1) => item1.role.name.toLowerCase().indexOf(value.toLowerCase()) > -1
    // );
    // this.UsmRolePermissionsList = new MatTableDataSource(this.usmRolePermissionss);
    // this.UsmRolePermissionsList.sort = this.sort;
    // this.UsmRolePermissionsList.paginator = this.paginator;
    this.filterUsmRolePermissions.role = value;
    this.filterUsmRolePermissions.module = "All";

    console.log("filterUsmRolePermissions", this.filterUsmRolePermissions);

    this.SearchedPage(false, "", "", value);
    this.paginator.firstPage();
  }

  checkEnterPressed(event: any, val: any) {
    console.log("inside checkEnterpressed event", event, "val", val);
    if (event.keyCode === 13) {
      // this.filterItem(event.srcElement.value);
      this.filterItem(val);
    }
  }

  Search() {
    let module =
      this.filterUsmRolePermissions.module == "All"
        ? ""
        : this.filterUsmRolePermissions.module.module;
    let permission =
      this.filterUsmRolePermissions.module == "All"
        ? ""
        : this.filterUsmRolePermissions.module.permission;
    let role =
      this.filterUsmRolePermissions.role == "All"
        ? "All"
        : this.filterUsmRolePermissions.role.name;
    this.SearchedPage(false, module, permission, role);
    this.paginator.firstPage();
  }

  SearchedPage(flag, module, permission, role) {
    let index = flag ? this.pageEvent.pageIndex : 0;
    if (role == "All") {
      this.usmRolePermissionsService
        .findAllSearched(
          module,
          permission,
          "",
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
            this.messageService.error("Could not get the results", "LEAP");
          }
        );
    } else {
      this.usmRolePermissionsService
        .findAllSearched(
          module,
          permission,
          role,
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
            this.messageService.error("Could not get the results", "LEAP");
          }
        );
    }
  }
  updateWave() {
    // Make sure we're dealing with an array of permissions
    if (!Array.isArray(this.usmRolePermissions.permission)) {
      this.usmRolePermissions.permission = this.usmRolePermissions.permission ? 
        [this.usmRolePermissions.permission] : [];
    }
    
    // Check for duplicate role-permission combinations
    let duplicateFound = false;
    
    // For each permission in the current role permission object
    for (const currentPermission of this.usmRolePermissions.permission) {
      // Check against existing role permissions
      const duplicates = this.usmRolePermissionss.filter(
        (item) =>
          item.id != this.usmRolePermissions.id &&
          item.role.id == this.usmRolePermissions.role.id &&
          // Check if any permission matches
          Array.isArray(item.permission) && 
          item.permission.some(p => 
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
      this.messageService.error(
        "Duplicate Role Permission cannot be created",
        "IAMP"
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
            this.messageService.info(
              "Role-Permission updated successfully",
              "LEAP"
            );
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
    
    // Log delete operation for debugging
    console.log(`Attempting to delete role permission with ID: ${id}`, usmRolePermissionsToDelete);
    
    this.usmRolePermissionsService.delete(id).subscribe(
      (response) => {
        console.log(`Delete response for ID ${id}:`, response);
        this.testCreate = true;
        
        // First refresh the data, then update UI
        this.loadPaginated(0, this.pageSize, null, null);
        
        // Remove from current page after successful deletion
        this.currentPage.remove(usmRolePermissionsToDelete);
        
        // Clean up related data
        this.deletedashconstant(usmRolePermissionsToDelete);
        
        // Show success message
        this.messageService.info(
          "Role-Permission Deleted successfully",
          "LEAP!"
        );
        
        this.Clear();
      },
      (error) => {
        console.error(`Error deleting role permission with ID ${id}:`, error);
        this.testCreate = false;
        
        // Provide more detailed error message if available
        const errorMessage = error?.error?.message || "Could not delete! Server returned an error.";
        this.messageService.error(errorMessage, "LEAP");
        
        // Refresh the data to ensure consistent state
        this.loadPaginated(0, this.pageSize, null, null);
      }
    );
  }  clearWave() {
    if (this.edit || this.view) {
      this.usmRolePermissions.permission = []; // Now using empty array instead of null
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
  // filterPermission(){
  //   this.permissionarray=this.permissionarraycopy.filter(item=>item.module==this.usmRolePermissions.permission.
  //module)
  // }
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
  }  updatepermissionCheck(event) {
    let flag: boolean = false;
    let permissions: any = this.usmRolePermissions.permission;
    
    // Check if permissions is an array and has items
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      // Check if any permission matches the criteria
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
      //console.error("JSON.parse error - ", e.message);
    }
    let dashConstant: DashConstant = new DashConstant();
    dashConstant.keys =
      this.usmRolePermissions.role.name + "dbsViewSettingsdefault";
    dashConstant.value = JSON.stringify(this.selectedWidgetSettings);
    dashConstant.project_id = new Project({ id: project.id });
    dashConstant.project_name = project.name;
    this.busy = this.dashConstantService.create(dashConstant).subscribe(
      (response) => {
        this.messageService.info(
          "Configuration for Dbs-view added successfully",
          "LEAP!"
        );
      },
      (error) => {
        this.messageService.error(
          "Could not Add Configuration for Dbs-view!",
          "LEAP"
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
      //console.error("JSON.parse error - ", e.message);
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
          "LEAP!"
        );
      },
      (error) => {
        this.messageService.error(
          "Could not Add Configuration for Dbs-view!",
          "LEAP"
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
      //console.error("JSON.parse error - ", e.message);
    }    // Check if permission is an array and has any dbs-view permissions
    if (usmRolePermissionsToDelete.permission) {
      const permissions = Array.isArray(usmRolePermissionsToDelete.permission) ? 
        usmRolePermissionsToDelete.permission : [usmRolePermissionsToDelete.permission];
        
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
                  "LEAP!"
                );
              },
              (error) => {
                this.messageService.error(
                  "Could not delete Configuration for Dbs-view!",
                  "LEAP"
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
        mode: 'create',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.refresh();
        this.loadPaginated(0, this.pageSize, null, null);
      }
    });
  }  editRolePermission(rolePermission?: UsmRolePermissions) {
    // If no rolePermission is provided (called from menu), get the first item from the list
    if (!rolePermission && this.usmRolePermissionss && this.usmRolePermissionss.length > 0) {
      rolePermission = this.usmRolePermissionss[0];
    } else if (!rolePermission) {
      // If no items exist yet, load data from API
      this.loadPaginated(0, this.pageSize, null, null);
      if (this.usmRolePermissionss && this.usmRolePermissionss.length > 0) {
        rolePermission = this.usmRolePermissionss[0];
      } else {
        this.messageService.info("No role permissions available to edit", "LEAP");
        return;
      }
    }
    
    const dialogRef = this.dialog.open(RolePermissionAddComponent, {
      height: "67%",
      width: "50%",
      disableClose: true,
      data: {
        mode: 'edit',
        rolePermission: rolePermission
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Refresh the data grid
        this.loadPaginated(0, this.pageSize, null, null);
      }
    });
  }
  viewRolePermission(rolePermission?: UsmRolePermissions) {
    // If no rolePermission is provided (called from menu), get the first item from the list
    if (!rolePermission && this.usmRolePermissionss && this.usmRolePermissionss.length > 0) {
      rolePermission = this.usmRolePermissionss[0];
    } else if (!rolePermission) {
      // If no items exist yet, load data from API
      this.loadPaginated(0, this.pageSize, null, null);
      if (this.usmRolePermissionss && this.usmRolePermissionss.length > 0) {
        rolePermission = this.usmRolePermissionss[0];
      } else {
        this.messageService.info("No role permissions available to view", "LEAP");
        return;
      }
    }
    
    const dialogRef = this.dialog.open(RolePermissionAddComponent, {
      height: "67%",
      width: "50%",
      disableClose: true,
      data: {
        mode: 'view',
        rolePermission: rolePermission
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // No need to refresh when just viewing
      }
    });
  }
  // Method to initialize mock data for UsmRolePermissionsList
  initializeMockData() {
    // Create mock role permissions data
    const mockRolePermissions: UsmRolePermissions[] = [];
    
    // Create Role objects
    const adminRole = new Role();
    adminRole.id = 1;
    adminRole.name = 'Admin';
    adminRole.description = 'Administrator role';
    adminRole.projectId = null;
    
    const userRole = new Role();
    userRole.id = 2;
    userRole.name = 'User';
    userRole.description = 'Standard user role';
    userRole.projectId = null;
    
    const managerRole = new Role();
    managerRole.id = 3;
    managerRole.name = 'Manager';
    managerRole.description = 'Manager role';
    managerRole.projectId = null;
    
    const viewerRole = new Role();
    viewerRole.id = 4;
    viewerRole.name = 'Viewer';
    viewerRole.description = 'Read-only role';
    viewerRole.projectId = null;
    
    const developerRole = new Role();
    developerRole.id = 5;
    developerRole.name = 'Developer';
    developerRole.description = 'Developer role';
    developerRole.projectId = null;
      // Add mock data
    const addMockRolePermission = (id: number, role: Role, module: string, perm: string) => {
      const permission = new UsmPermissions();
      permission.module = module;
      permission.permission = perm;
      
      const rolePermission = new UsmRolePermissions();
      rolePermission.id = id;
      rolePermission.role = role;
      rolePermission.permission = [permission]; // Now assigning as an array
      
      mockRolePermissions.push(rolePermission);
    };
    
    // Admin permissions
    addMockRolePermission(1, adminRole, 'usm', 'view');
    addMockRolePermission(2, adminRole, 'usm', 'edit');
    addMockRolePermission(3, adminRole, 'usm', 'create');
    addMockRolePermission(4, adminRole, 'usm', 'delete');
    
    // User permissions
    addMockRolePermission(5, userRole, 'usm', 'view');
    
    // Manager permissions
    addMockRolePermission(6, managerRole, 'portfolio', 'view');
    addMockRolePermission(7, managerRole, 'portfolio', 'edit');
    
    // Viewer permissions
    addMockRolePermission(8, viewerRole, 'dbs', 'view');
    
    // Developer permissions
    addMockRolePermission(9, developerRole, 'portfolio', 'create');
    addMockRolePermission(10, developerRole, 'portfolio', 'edit');
    
    // Set the mock data to the component properties
    this.usmRolePermissionss = mockRolePermissions;
    this.usmRolePermissionssCopy = [...mockRolePermissions];
    this.currentPage = new PageResponse<UsmRolePermissions>(0, mockRolePermissions.length, mockRolePermissions);
    this.UsmRolePermissionsList = new MatTableDataSource(mockRolePermissions);
    
    // Configure the MatTableDataSource
    setTimeout(() => {
      if (this.paginator) {
        this.UsmRolePermissionsList.paginator = this.paginator;
      }
      if (this.sort) {
        this.UsmRolePermissionsList.sort = this.sort;
      }
    });
      // Set other necessary properties
    this.wavesLength = mockRolePermissions.length;
    this.testCreate = true;
    
    // Setup pagination properly
    const totalPages = Math.ceil(mockRolePermissions.length / this.pageSize);
    this.noOfPages = totalPages > 0 ? totalPages : 1;
    console.log("Mock data: Setting noOfPages to:", this.noOfPages);
    
    // Generate pagination array
    this.pageArr = Array(this.noOfPages).fill(0).map((x, i) => i);
    console.log("Mock data: Generated pageArr:", this.pageArr);
    
    // Reset page number
    this.pageNumber = 1;
    
    // Calculate pagination display indices
    this.startIndex = 0;
    this.endIndex = Math.min(5, this.noOfPages);
    
    // Log pagination state for debugging
    console.log("Pagination state after mock data load:", {
      pageNumber: this.pageNumber,
      noOfPages: this.noOfPages,
      pageArr: this.pageArr,
      startIndex: this.startIndex,
      endIndex: this.endIndex
    });
  }
  // Calculate row number based on current page index and row index
  getRowNumber(index: number): number {
    return this.pageNumber * this.pageSize + index + 1 - this.pageSize;
  }
  
  lastRefreshTime() {
    setTimeout(() => {
      this.lastRefreshedTime = new Date();
    }, 1000);
  }

   onTagSelected(event: TagEventDTO) {
  
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

      const pageEvent = { page: this.pageNumber - 1, size: this.pageSize };      if (this.filterFlag == false && this.filterFlag1 == false) {
        this.fetchWave(pageEvent);
      } else if (this.filterFlag == true) {
        // The Search method doesn't accept parameters in this implementation
        this.Search();
        this.pageChanged.emit(this.pageNumber);
      } else if (this.filterFlag1 == true) {
        this.fetchWave(pageEvent);
        // Use the correct method based on what we need
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
    
    // Use the loadPaginated method which already has the logic to handle pagination
    this.loadPaginated(pageEvent.page, this.pageSize, null, null);
    
    // Update pagination state
    this.pageNumber = pageEvent.page + 1 || 1;
    
    // Update page arrays and indices for pagination display
    if (this.currentPage && this.currentPage.totalPages) {
      this.noOfPages = this.currentPage.totalPages;
      
      // Generate pagination array
      this.pageArr = Array(this.noOfPages).fill(0).map((x, i) => i);
      
      // Calculate start and end indices for pagination display
      if (this.pageNumber > 5) {
        this.endIndex = Math.min(this.pageNumber + 2, this.noOfPages);
        this.startIndex = Math.max(0, this.endIndex - 5);
      } else {
        this.startIndex = 0;
        this.endIndex = Math.min(5, this.noOfPages);
      }
    }
    
    // Emit events and update timestamps
    this.pageChanged.emit(this.pageNumber);
    this.lastRefreshTime();
    
    
    // Use the loadPaginated method which already has the logic to handle pagination
    this.loadPaginated(pageEvent.page, this.pageSize, null, null);
    
    // Update pagination state
    this.noOfPages = this.currentPage.totalPages;
    this.pageNumber = pageEvent.page + 1 || 1;
    
    // Generate pagination array
    this.pageArr = Array(this.noOfPages).fill(0).map((x, i) => i);
    
    // Calculate start and end indices for pagination display
    if (this.pageNumber > 5) {
      this.endIndex = Math.min(this.pageNumber + 2, this.noOfPages);
      this.startIndex = Math.max(0, this.endIndex - 5);
    } else {
      this.startIndex = 0;
      this.endIndex = Math.min(5, this.noOfPages);
    }
    
    // Emit events and update timestamps
    this.pageChanged.emit(this.pageNumber);
    this.lastRefreshTime();
  }



}
