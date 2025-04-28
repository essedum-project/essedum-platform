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
  
  import { UsmModuleService } from "../../services/usm-module.service";
  import { LeapTelemetryService } from "../../telemetry-util/telemetry.service";
  import { DeleteComponent } from "../../shared-modules/confirm-delete/delete.component";
  import { Subscription } from "rxjs";
  import { IampUsmService } from "../../iamp-usm.service";
  import { Project } from "../../models/project";
  import { ProjectService } from "../../services/project.service";
import { UsmModule } from "../../models/usm-module";
import { OpenTelemetryService } from "../../telemetry-util/open-telemetry.service";
  
  @Component({
    templateUrl: "usm-module.component.html",
    selector: "usm-module",
  })
  export class UsmModuleComponent implements OnInit, OnDestroy {
    @Input() header = "UsmModules...";
    @Output() changeView: EventEmitter<boolean> = new EventEmitter();
    @Input() sub: boolean = false;
    @Output() onAddNewClicked = new EventEmitter();
    p: number;
    @ViewChild("myInput", { static: false }) myInputReference: ElementRef;
    usmModuleToDelete: UsmModule;
    UsmModuleList: MatTableDataSource<any>;
  
    displayedColumns: string[] = ["id", "name","display_name", "descriptions", "users_count","url","module_type", "actions"];
    displayColumns: string[] = ["id","name", "displayname",];
  
    private paginator: MatPaginator;
    private sort: MatSort;
    length: number = 0;
    modulesl: UsmModule[];
    @ViewChild(MatSort, { static: false }) set matSort(ms: MatSort) {
      this.sort = ms;
    }
    @ViewChild(MatPaginator) paginator1: MatPaginator;
  
    // ngAfterViewInit() {
    //   this.ProjectList.paginator = this.paginator1;
    // }
    example: UsmModule = new UsmModule();
    exampleProject: Project = new Project();
  
    // list is paginated
    currentPage: PageResponse<UsmModule> = new PageResponse<UsmModule>(0, 0, []);
    currentPageProject: PageResponse<Project> = new PageResponse<Project>(0, 0, []);
    ProjectList: MatTableDataSource<any>;
  
    //foreign key dependencies
    busy: Subscription;
    constructor(
      public router: Router,
      public messageService: MessageService,
      public confirmDeleteDialog: MatDialog,
      public confirmDialog: MatDialog,
      public helperService: HelperService,
      private route: ActivatedRoute,
      public usmModuleService: UsmModuleService,
      private telemetryService: LeapTelemetryService,
      private usmService: IampUsmService,
      public projectService: ProjectService,
      private openTelemetryService: OpenTelemetryService
    ) { }
  
    //Temps
    testCreate: boolean = false;
    testId: number;
  
    filterUsmModule: any;
    searchedName: any;
    showCreate: boolean = false;
    usmModules = new Array<UsmModule>();
    usmModulesCopy = new Array<UsmModule>();
    projects = new Array<Project>();
    projectsCopy = new Array<Project>();
    showList: boolean = true;
    view: boolean = false;
    buttonFlag: boolean = false;
    viewUsmModule: boolean = false;
    edit: boolean = false;
    lazyload = { first: 0, rows: 5000, sortField: null, sortOrder: null };
    usmModule = new UsmModule();
    currentUsmModule = new UsmModule();
    selected = new FormControl(0);
    pageSize = 6;
    wavesLength: number;
    filterFlag: boolean = false;
    filterFlag1: boolean = false;
    moduleSearched: any;
    lengthNameErrorMessage: String = "Maximum Character Limit Reached";
    showNameLengthErrorMessage: Boolean = false;
    showDescLengthErrorMessage: Boolean = false;
    permissionList: any[];
    auth: string = "";
    selectedPermissionList: any[];
    editFlag: boolean = true;
    viewFlag: boolean = true;
    deleteFlag: boolean = true;
    createFlag: boolean = true;
  
    ngOnInit() {
      this.telemetryImpression();
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
      if (window.location.href.includes("modulelist") && window.location.href.includes("true")) {
        this.showCreate = true;
        this.edit = true;
        this.view = true;
        this.viewUsmModule = true;
        this.buttonFlag = true;
        this.route.params.subscribe((res:any) => {
          //res.id
          this.getUsmModules(res.id);
        });
        this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
      } else if (window.location.href.includes("modulelist") && window.location.href.includes("false")) {
        this.showCreate = true;
        this.edit = true;
        this.view = false;
        this.buttonFlag = false;
        this.route.params.subscribe((res:any) => {
          //res.id
          this.getUsmModules(res.id);
        });
        this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
      } else if (window.location.href.includes("modulelist") && window.location.href.includes("create")) {
        this.showCreate = true;
        this.edit = false;
        this.usmModule = new UsmModule();
        this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
        this.changeView.emit(false);
      } else {
        this.fetchWave(null);
      }
    }
    telemetryImpression() {
      // this.telemetryService.impression("iamp-usm", "list", "UsmModuleListViewComponent");
      this.openTelemetryService.startTelemetry("iamp-usm", "UsmModuleListViewComponent", "list");
    }

    ngOnDestroy() {
      let activeSpan = this.openTelemetryService.fetchActiveSpan();
      this.openTelemetryService.endTelemetry(activeSpan);
    }
  
    listView() {
      this.showNameLengthErrorMessage = false;
      this.showDescLengthErrorMessage = false;
      if (this.edit || this.view) this.router.navigate(["../../"], { relativeTo: this.route });
      else this.router.navigate(["../"], { relativeTo: this.route });
    }
  
    showUsmModuleList() { }
  
    getUsmModules(id) {
      this.usmModuleService.getUsmModule(id).subscribe((res) => {
        this.currentUsmModule = res;
        this.usmModule = res;
        // this.exampleProject.moduleId = this.usmModule;
        this.projectService.findAll(this.exampleProject, this.lazyload).subscribe(
        (pageResponse) => {
          (this.currentPageProject = pageResponse),
            (this.projects = this.currentPageProject.content.sort((a, b) =>
              a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
            ));
          this.projects = this.currentPageProject.content;
          this.projectsCopy = this.projects;
          this.ProjectList = new MatTableDataSource(this.currentPageProject.content);
          this.length=this.projects.length;
          this.ProjectList.paginator = this.paginator1;
  
        },
        (error) => this.messageService.error("Could not get the results", "LEAP")
      );
      });
      
    
    }
  
    editUsmModule(usmModule: UsmModule) {
      sessionStorage.setItem("usmModuleid", usmModule.id.toString());
      sessionStorage.setItem("pageview", "usmModule");
      if (window.location.href.includes("true") || window.location.href.includes("false")) {
        this.router.navigate(["./" + usmModule.id + "/" + false], { relativeTo: this.route });
      } else {
        this.router.navigate(["./" + usmModule.id + "/" + false], { relativeTo: this.route });
      }
    }
  
    view_UsmModule(usmModule: UsmModule) {
      sessionStorage.setItem("usmModuleid", usmModule.id.toString());
      sessionStorage.setItem("pageview", "usmModule");
      if (window.location.href.includes("true") || window.location.href.includes("false")) {
        this.router.navigate(["./" + usmModule.id + "/" + true], { relativeTo: this.route });
      } else {
        this.router.navigate(["./" + usmModule.id + "/" + true], { relativeTo: this.route });
      }
    }
  
    createView() {
      if (window.location.href.includes("true") || window.location.href.includes("false")) {
        this.router.navigate(["./create"], { relativeTo: this.route });
      } else {
        this.router.navigate(["./create"], { relativeTo: this.route });
      }
    }
    onSave() {
      if (this.usmModule && this.usmModule.name) {
        this.usmModule.name = this.usmModule.name.trim();
      }
      if (this.edit) this.updateWave();
      else if (
        this.usmModule.name == undefined ||
        this.usmModule.name == null ||
        this.usmModule.name.trim().length == 0
      ) {
        this.messageService.info("Module name can't be empty", "LEAP");
      } else {
        let flag: boolean = false;
        this.usmModules.forEach((ele) => {
          if (ele.name.trim().toLowerCase() == this.usmModule.name.trim().toLowerCase()) {
            flag = true;
            this.messageService.info("Module Name Already Exists", "LEAP");
          }
        });
        if (!flag) {
          if (sessionStorage.getItem("telemetry") == "true") {
            // this.telemetryService.audit(this.usmModule,"CREATE");
            }
          this.busy = this.usmModuleService.create(this.usmModule).subscribe(
            (response) => {
              this.testId = response.id;
              this.messageService.info("Module Saved Successfully", "LEAP");
              // this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
              this.clearWave();
              this.showCreate = false;
              this.testCreate = true;
              this.listView();
            },
            (error) => {
              this.testCreate = false;
              this.messageService.error("Could not create Module", "LEAP");
            }
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
    updateWave() {
      this.usmModule.name = this.usmModule.name.trim();
      if (
        this.usmModule.name == undefined ||
        this.usmModule.name == null ||
        this.usmModule.name.trim().length == 0
      ) {
        this.messageService.info("Module name can't be empty", "LEAP");
      } else if (this.usmModule.name.length > 255) {
        this.messageService.info("Module name cannot be more than 255 characters", "LEAP");
      } else {
        let flag: boolean = false;
        this.usmModules.forEach((ele) => {
          if (
            ele.id != this.usmModule.id &&
            ele.name.trim().toLowerCase() == this.usmModule.name.trim().toLowerCase()
          ) {
            flag = true;
            this.messageService.info("Module Name Already Exists", "LEAP");
          }
        });
        if (!flag) {
          if (sessionStorage.getItem("telemetry") == "true") {
            let arr1=[];
            if(this.usmModules){
           arr1 = this.usmModules.filter(
              (item) => item.id == this.usmModule.id 
            );
            }
            let diff=this.compareTodiff(this.usmModule,arr1[0])
            // this.telemetryService.audit(this.usmModule, arr1[0],diff);
          }
          this.busy = this.usmModuleService.update(this.usmModule).subscribe(
            (rs) => {
              sessionStorage.setItem("UpdatedUser", "true");
              this.testId = rs.id;
              this.testCreate = true;
              this.messageService.info("Module updated successfully", "LEAP");
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
    }
    delete(usmModuleToDelete: UsmModule) {
      let id = usmModuleToDelete.id;
      this.usmModuleService.delete(id).subscribe(
        (response) => {
          this.testCreate = true;
          sessionStorage.setItem("UpdatedUser", "true");
          this.currentPage.remove(usmModuleToDelete);
          // this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
          // this.fetchWave(null);
          this.Clear();
          this.messageService.info("Module deleted successfully", "LEAP");
        },
        (error) => {
          this.testCreate = false;
          this.messageService.error("Could not delete!", "LEAP");
        }
      );
    }
    clearWave() {
      if (this.edit || this.view) {
        this.usmModule.name = null;
        this.usmModule.display_name = null;
        this.usmModule.module_type = null;
        this.usmModule.url = null;
        this.usmModule.users_count = null;
        this.usmModule.descriptions = null;
        this.showNameLengthErrorMessage = false;
        this.showDescLengthErrorMessage = false;
      } else {
        this.usmModule = new UsmModule();
        this.showNameLengthErrorMessage = false;
        this.showDescLengthErrorMessage = false;
      }
    }
  
    ngOnChanges(changes: SimpleChanges) {
      // this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
      this.fetchWave(null);
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
      this.usmModuleService.findAll(this.example, event).subscribe(
        (pageResponse) => {
          (this.currentPage = pageResponse),
            (this.currentPage.content = this.currentPage.content.sort((a, b) =>
              a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
            ));
          this.usmModules = this.currentPage.content;
          this.usmModulesCopy = this.usmModules;
          this.UsmModuleList = new MatTableDataSource(this.currentPage.content);
          this.UsmModuleList.paginator = this.paginator;
          this.UsmModuleList.sort = this.sort;
          console.log(this.UsmModuleList);
          if (this.currentPage.totalPages > 0) this.testCreate = true;
        },
        (error) => {
          this.testCreate = false;
          this.messageService.error("Could not get the results", "LEAP");
        }
      );
    }
  
    fetchWave(pageEvent) {
      if (pageEvent == null || !pageEvent) {
        pageEvent = { page: 0, size: this.pageSize };
      }
      this.usmModuleService.FindAll(this.example, pageEvent).subscribe(
        (pageResponse) => {
          (this.currentPage = pageResponse),
            (this.currentPage.content = this.currentPage.content.sort((a, b) =>
              a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
            ));
          this.usmModules = this.currentPage.content;
          this.usmModulesCopy = this.usmModules;
          this.wavesLength = this.currentPage.totalElements;
          this.UsmModuleList = new MatTableDataSource(this.currentPage.content);
          this.UsmModuleList.paginator = this.paginator;
          this.UsmModuleList.sort = this.sort;
          console.log(this.currentPage);
          if (this.currentPage.totalPages > 0) this.testCreate = true;
        },
        (error) => {
          this.testCreate = false;
          this.messageService.error("Could not get the results", "LEAP");
        }
      );
    }
    onRowSelect(event: any) {
      let id = event.id;
      this.router.navigate(["/modulelist", id]);
    }
  
    showDeleteDialog(rowData: any) {
      let usmModuleToDelete: UsmModule = <UsmModule>rowData;
  
      let dialogRef = this.confirmDeleteDialog.open(DeleteComponent, {
        disableClose: true,
        data: {
          title: "Delete Module",
          message: "Are you sure you want to delete?",
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result === "yes") {
          this.delete(usmModuleToDelete);
        }
      });
    }
  
    rowSelected(item: UsmModule) {
      this.router.navigate(["/modulelist", item.id]);
    }
    setSelectedEntities(event) { }
    // Search() {
    //     let newtasks = new Array<UsmModule>();
    //     if (this.searchedName == "All" || this.searchedName == "") {
    //         this.usmModules = this.usmModulesCopy;
    //     } else {
    //         this.usmModules = Object.assign([], this.usmModulesCopy).filter((item1) =>
    //             item1.name == null ? "" : item1.name.toLowerCase().indexOf(this.searchedName.
    //toLowerCase()) > -1
    //         );
    //     }
    //     if (this.filterUsmModule == "All" || this.filterUsmModule == "") {
    //         this.usmModules = this.usmModules;
    //     } else {
    //         this.usmModules = Object.assign([], this.usmModules).filter((item1) =>
    //             item1.description == null ? "" : item1.description.toLowerCase().indexOf(this.filterUsmModule.
    //toLowerCase()) > -1
    //         );
    //     }
    //     this.UsmModuleList = new MatTableDataSource(this.usmModules);
    //     this.UsmModuleList.sort = this.sort;
    //     this.UsmModuleList.paginator = this.paginator;
    // }
    Search(pageEvent) {
      if (pageEvent == null || !pageEvent) {
        pageEvent = { page: 0, size: this.pageSize };
      }
      let params;
      if ((this.searchedName == undefined || this.searchedName == "") && (this.filterUsmModule == undefined || this.filterUsmModule == "")) {
        this.Clear();
        this.filterFlag = false;
      }
      //  else if (this.searchedName == "" || this.filterUsmModule == "") {
      //   this.Clear();
      //   this.filterFlag = false;
      // } 
      else if (this.searchedName != undefined && (this.filterUsmModule == undefined || this.filterUsmModule == "")) {
        params = {
          name: this.searchedName,
        };
        this.filterFlag = true;
      } else if ((this.searchedName == undefined || this.searchedName == "") && this.filterUsmModule != undefined) {
        params = {
          descriptions: this.filterUsmModule,
        };
        this.filterFlag = true;
      } else {
        params = {
          name: this.searchedName,
          descriptions: this.filterUsmModule,
        };
        this.filterFlag = true;
      }
      if (this.filterFlag) {
        this.usmModuleService.search(params, pageEvent).subscribe((res) => {
          this.currentPage = res;
          this.usmModules = this.currentPage.content;
          this.usmModulesCopy = this.usmModules;
          this.wavesLength = this.currentPage.totalElements;
          this.UsmModuleList = new MatTableDataSource(this.currentPage.content);
          this.UsmModuleList.paginator = this.paginator;
          this.UsmModuleList.sort = this.sort;
        });
      }
    }
    Clear() {
      this.filterUsmModule = undefined;
      this.searchedName = undefined;
      this.myInputReference.nativeElement.value = null;
      this.fetchWave(null);
      this.filterFlag = false;
      this.filterFlag1 = false;
      this.moduleSearched = undefined;
    }
    assignCopy() {
      this.usmModules = Object.assign([], this.usmModulesCopy);
    }
    filterItem(value, pageEvent) {
      if (!value) {
        this.assignCopy();
      }
      if (this.moduleSearched == "" || this.moduleSearched == undefined) {
        this.Clear();
      } else {
        let params;
        params = {
          name: this.moduleSearched,
        };
        this.filterFlag1 = true;
        if (pageEvent == null || !pageEvent) {
          pageEvent = { page: 0, size: this.pageSize };
        }
        if (this.filterFlag1) {
          this.usmModuleService.search(params, pageEvent).subscribe((res) => {
            this.currentPage = res;
            this.usmModules = this.currentPage.content;
            this.usmModulesCopy = this.usmModules;
            this.wavesLength = this.currentPage.totalElements;
            this.UsmModuleList = new MatTableDataSource(this.currentPage.content);
            this.UsmModuleList.paginator = this.paginator;
            this.UsmModuleList.sort = this.sort;
          });
        }
      }
    }
    // checkEnterPressed(event: any, val: any) {
    //     if (event.keyCode === 13) {
    //         this.filterItem(event.srcElement.value);
    //     }
    // }
    trackByMethod(index, item) { }
    onPageFired(event) {
      if (this.filterFlag == false && this.filterFlag1 == false)
        this.fetchWave({ page: event.pageIndex, size: this.pageSize });
      else if (this.filterFlag == true) this.Search({ page: event.pageIndex, size: this.pageSize });
      else if (this.filterFlag1 == true)
        this.filterItem(this.moduleSearched, { page: event.pageIndex, size: this.pageSize });
    }
  
    checkNameMaxLength() {
      if (this.usmModule.name.length >= 255) {
        this.showNameLengthErrorMessage = true;
      } else {
        this.showNameLengthErrorMessage = false;
      }
    }
  
    checkDescriptionMaxLength() {
      if (this.usmModule.descriptions.length >= 255) {
        this.showDescLengthErrorMessage = true;
      } else {
        this.showDescLengthErrorMessage = false;
      }
    }
    deleteSpecialChars(event) {
      var i = event.charCode
      return this.isValidLetter(i);
    }
  
    isValidLetter(i) {
      return ((i >= 65 && i <= 90) || (i >= 97 && i <= 122) || (i >= 48 && i <= 57) || [8, 13, 16, 17, 20, 95].indexOf(i) > -1)
    }
  }
  