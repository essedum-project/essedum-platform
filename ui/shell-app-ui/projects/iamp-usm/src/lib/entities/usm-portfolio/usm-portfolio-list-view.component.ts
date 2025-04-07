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

import { UsmPortfolio } from "../../models/usm-portfolio";
import { UsmPortfolioService } from "../../services/usm-portfolio.service";
import { LeapTelemetryService } from "../../telemetry-util/telemetry.service";
import { DeleteComponent } from "../../shared-modules/confirm-delete/delete.component";
import { Subscription } from "rxjs/Subscription";
import { IampUsmService } from "../../iamp-usm.service";
import { Project } from "../../models/project";
import { ProjectService } from "../../services/project.service";

@Component({
  templateUrl: "usm-portfolio-list-view.component.html",
  selector: "usm-portfolio-list-view",
})
export class UsmPortfolioListViewComponent implements OnInit {
  @Input() header = "UsmPortfolios...";
  @Output() changeView: EventEmitter<boolean> = new EventEmitter();
  @Input() sub: boolean = false;
  @Output() onAddNewClicked = new EventEmitter();
  p: number;
  @ViewChild("myInput", { static: false }) myInputReference: ElementRef;
  usmPortfolioToDelete: UsmPortfolio;
  UsmPortfolioList: MatTableDataSource<any>;

  displayedColumns: string[] = ["id", "portfolioName", "description", "actions"];
  displayColumns: string[] = ["id","name", "displayname",];

  private paginator: MatPaginator;
  private sort: MatSort;
  length: number = 0;
  @ViewChild(MatSort, { static: false }) set matSort(ms: MatSort) {
    this.sort = ms;
  }
  @ViewChild(MatPaginator) paginator1: MatPaginator;

  // ngAfterViewInit() {
  //   this.ProjectList.paginator = this.paginator1;
  // }
  example: UsmPortfolio = new UsmPortfolio();
  exampleProject: Project = new Project();

  // list is paginated
  currentPage: PageResponse<UsmPortfolio> = new PageResponse<UsmPortfolio>(0, 0, []);
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
    public usmPortfolioService: UsmPortfolioService,
    private telemetryService: LeapTelemetryService,
    private usmService: IampUsmService,
    public projectService: ProjectService,
  ) { }

  //Temps
  testCreate: boolean = false;
  testId: number;

  filterUsmPortfolio: any;
  searchedName: any;
  showCreate: boolean = false;
  usmPortfolios = new Array<UsmPortfolio>();
  usmPortfoliosCopy = new Array<UsmPortfolio>();
  projects = new Array<Project>();
  projectsCopy = new Array<Project>();
  showList: boolean = true;
  view: boolean = false;
  buttonFlag: boolean = false;
  viewUsmPortfolio: boolean = false;
  edit: boolean = false;
  lazyload = { first: 0, rows: 5000, sortField: null, sortOrder: null };
  usmPortfolio = new UsmPortfolio();
  currentUsmPortfolio = new UsmPortfolio();
  selected = new FormControl(0);
  pageSize = 6;
  wavesLength: number;
  filterFlag: boolean = false;
  filterFlag1: boolean = false;
  pageIndex: number = 0;
  portfolioSearched: any;
  lengthNameErrorMessage: String = "Maximum Character Limit Reached";
  showNameLengthErrorMessage: Boolean = false;
  showDescLengthErrorMessage: Boolean = false;
  permissionList: any[];
  auth: string = "";
  selectedPermissionList: any[];
  editFlag: boolean = false;
  viewFlag: boolean = true;
  deleteFlag: boolean = false;
  createFlag: boolean = false;

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
    if (window.location.href.includes("portfoliolist") && window.location.href.includes("true")) {
      this.showCreate = true;
      this.edit = true;
      this.view = true;
      this.viewUsmPortfolio = true;
      this.buttonFlag = true;
      this.route.params.subscribe((res) => {
        //res.id
        this.getUsmPortfolios(Number(window.atob(res.id)));
      });
      this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
    } else if (window.location.href.includes("portfoliolist") && window.location.href.includes("false")) {
      this.showCreate = true;
      this.edit = true;
      this.view = false;
      this.buttonFlag = false;
      this.route.params.subscribe((res) => {
        //res.id
        this.getUsmPortfolios(Number(window.atob(res.id)));
      });
      this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
    } else if (window.location.href.includes("portfoliolist") && window.location.href.includes("create")) {
      this.showCreate = true;
      this.edit = false;
      this.usmPortfolio = new UsmPortfolio();
      this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
      this.changeView.emit(false);
    } else {
      this.fetchWave(null);
    }
  }
  telemetryImpression() {
    this.telemetryService.impression("iamp-usm", "list", "UsmPortfolioListViewComponent");
  }

  listView() {
    this.showNameLengthErrorMessage = false;
    this.showDescLengthErrorMessage = false;
    if (this.edit || this.view) this.router.navigate(["../../"], { relativeTo: this.route });
    else this.router.navigate(["../"], { relativeTo: this.route });
  }

  showUsmPortfolioList() { }

  getUsmPortfolios(id) {
    this.usmPortfolioService.getUsmPortfolio(id).subscribe((res) => {
      this.currentUsmPortfolio = res;
      this.usmPortfolio = res;
      this.exampleProject.portfolioId = this.usmPortfolio;
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
      (error) => this.messageService.error("Could not get the results", "IAMP")
    );
    });
    
  
  }

  editUsmPortfolio(usmPortfolio) {
    sessionStorage.setItem("usmPortfolioid", usmPortfolio.id.toString());
    sessionStorage.setItem("pageview", "usmPortfolio");
    if (window.location.href.includes("true") || window.location.href.includes("false")) {
      this.router.navigate(["./" + window.btoa(usmPortfolio.id) + "/" + false], { relativeTo: this.route });
    } else {
      this.router.navigate(["./" + window.btoa(usmPortfolio.id) + "/" + false], { relativeTo: this.route });
    }
  }

  view_UsmPortfolio(usmPortfolio) {
    sessionStorage.setItem("usmPortfolioid", usmPortfolio.id.toString());
    sessionStorage.setItem("pageview", "usmPortfolio");
    if (window.location.href.includes("true") || window.location.href.includes("false")) {
      this.router.navigate(["./" +  window.btoa(usmPortfolio.id )+ "/" + true], { relativeTo: this.route });
    } else {
      this.router.navigate(["./" + window.btoa( usmPortfolio.id) + "/" + true], { relativeTo: this.route });
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
    if (this.usmPortfolio && this.usmPortfolio.portfolioName) {
      this.usmPortfolio.portfolioName = this.usmPortfolio.portfolioName.trim();
    }
    if (this.edit) this.updateWave();
    else if (
      this.usmPortfolio.portfolioName == undefined ||
      this.usmPortfolio.portfolioName == null ||
      this.usmPortfolio.portfolioName.trim().length == 0
    ) {
      this.messageService.info("Portfolio name can't be empty", "IAMP");
    } else if (this.usmPortfolio.portfolioName.length > 100) {
      this.messageService.info("Portfolio name cannot be more than 100 characters", "IAMP");
    } else if (
      !/^[a-zA-Z][a-zA-Z0-9 \@\%\!\#\*\-\_\&\$\(\)\=\+\/\.\?\\]*?$/.test(this.usmPortfolio.portfolioName)
    ) {
      this.messageService.error("Portfolio name format is incorrect", "IAMP");
    }else if (this.usmPortfolio.description && (!/^[a-zA-Z][a-zA-Z0-9 \-\_\.]*?$/.test(this.usmPortfolio.description))) {
      this.messageService.error("Portfolio description format is incorrect", "IAMP");
    } else {
      let flag: boolean = false;
      this.usmPortfolios.forEach((ele) => {
        if (ele.portfolioName.trim().toLowerCase() == this.usmPortfolio.portfolioName.trim().toLowerCase()) {
          flag = true;
          this.messageService.info("Portfolio Name Already Exists", "IAMP");
        }
      });
      if (!flag) {
        if (sessionStorage.getItem("telemetry") == "true") {
          this.telemetryService.audit(this.usmPortfolio,"CREATE");
          }
        this.busy = this.usmPortfolioService.create(this.usmPortfolio).subscribe(
          (response) => {
            this.testId = response.id;
            this.messageService.info("Portfolio Saved Successfully", "IAMP");
            // this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
            this.clearWave();
            this.showCreate = false;
            this.testCreate = true;
            this.listView();
          },
          (error) => {
            this.testCreate = false;
            this.messageService.error("Could not create Portfolio", "IAMP");
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
    this.usmPortfolio.portfolioName = this.usmPortfolio.portfolioName.trim();
    if (
      this.usmPortfolio.portfolioName == undefined ||
      this.usmPortfolio.portfolioName == null ||
      this.usmPortfolio.portfolioName.trim().length == 0
    ) {
      this.messageService.info("Portfolio name can't be empty", "IAMP");
    } else if (this.usmPortfolio.portfolioName.length > 255) {
      this.messageService.info("Portfolio name cannot be more than 255 characters", "IAMP");
    } else if (
      !/^[a-zA-Z][a-zA-Z0-9 \@\%\!\#\*\-\_\&\$\(\)\=\+\/\.\?\\]*?$/.test(this.usmPortfolio.portfolioName)
    ) {
      this.messageService.error("Portfolio name format is incorrect", "IAMP");
    }else if (this.usmPortfolio.description && (!/^[a-zA-Z][a-zA-Z0-9 \-\_\.]*?$/.test(this.usmPortfolio.description))) {
      this.messageService.error("Portfolio description format is incorrect", "IAMP");
    } else {
      let flag: boolean = false;
      this.usmPortfolios.forEach((ele) => {
        if (
          ele.id != this.usmPortfolio.id &&
          ele.portfolioName.trim().toLowerCase() == this.usmPortfolio.portfolioName.trim().toLowerCase()
        ) {
          flag = true;
          this.messageService.info("Portfolio Name Already Exists", "IAMP");
        }
      });
      if (!flag) {
        if (sessionStorage.getItem("telemetry") == "true") {
          let arr1=[];
          if(this.usmPortfolios){
         arr1 = this.usmPortfolios.filter(
            (item) => item.id == this.usmPortfolio.id 
          );
          }
          let diff=this.compareTodiff(this.usmPortfolio,arr1[0])
          this.telemetryService.audit(this.usmPortfolio, arr1[0],diff);
        }
        this.busy = this.usmPortfolioService.update(this.usmPortfolio).subscribe(
          (rs) => {
            sessionStorage.setItem("UpdatedUser", "true");
            this.testId = rs.id;
            this.testCreate = true;
            this.messageService.info("Portfolio updated successfully", "IAMP");
            this.clearWave();
            this.showCreate = false;
            this.listView();
          },
          (error) => {
            this.testCreate = false;
            this.messageService.error("Could not update", "IAMP");
          }
        );
      }
    }
  }
  delete(usmPortfolioToDelete: UsmPortfolio) {
    let id = usmPortfolioToDelete.id;
    this.usmPortfolioService.delete(id).subscribe(
      (response) => {
        this.testCreate = true;
        sessionStorage.setItem("UpdatedUser", "true");
        this.currentPage.remove(usmPortfolioToDelete);
        // this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
        // this.fetchWave(null);
        this.Clear();
        this.messageService.info("Portfolio deleted successfully", "IAMP");
      },
      (error) => {
        this.testCreate = false;
        this.messageService.error("Could not delete!", "IAMP");
      }
    );
  }
  clearWave() {
    if (this.edit || this.view) {
      this.usmPortfolio.portfolioName = null;
      this.usmPortfolio.description = null;
      this.showNameLengthErrorMessage = false;
      this.showDescLengthErrorMessage = false;
    } else {
      this.usmPortfolio = new UsmPortfolio();
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
    this.usmPortfolioService.findAll(this.example, event).subscribe(
      (pageResponse) => {
        (this.currentPage = pageResponse),
          (this.currentPage.content = this.currentPage.content.sort((a, b) =>
            a.portfolioName.toLowerCase() > b.portfolioName.toLowerCase() ? 1 : -1
          ));
        this.usmPortfolios = this.currentPage.content;
        this.usmPortfoliosCopy = this.usmPortfolios;
        this.UsmPortfolioList = new MatTableDataSource(this.currentPage.content);
        this.UsmPortfolioList.paginator = this.paginator;
        this.UsmPortfolioList.sort = this.sort;
        if (this.currentPage.totalPages > 0) this.testCreate = true;
      },
      (error) => {
        this.testCreate = false;
        this.messageService.error("Could not get the results", "IAMP");
      }
    );
  }

  fetchWave(pageEvent) {
    if (pageEvent == null || !pageEvent) {
      pageEvent = { page: 0, size: this.pageSize };
    }
    this.usmPortfolioService.FindAll(this.example, pageEvent).subscribe(
      (pageResponse) => {
        (this.currentPage = pageResponse),
          (this.currentPage.content = this.currentPage.content.sort((a, b) =>
            a.portfolioName.toLowerCase() > b.portfolioName.toLowerCase() ? 1 : -1
          ));
        this.usmPortfolios = this.currentPage.content;
        this.usmPortfoliosCopy = this.usmPortfolios;
        this.wavesLength = this.currentPage.totalElements;
        this.UsmPortfolioList = new MatTableDataSource(this.currentPage.content);
        this.UsmPortfolioList.paginator = this.paginator;
        this.UsmPortfolioList.sort = this.sort;
        if (this.currentPage.totalPages > 0) this.testCreate = true;
      },
      (error) => {
        this.testCreate = false;
        this.messageService.error("Could not get the results", "IAMP");
      }
    );
  }
  onRowSelect(event: any) {
    let id = event.id;
    this.router.navigate(["/portfoliolist", id]);
  }

  showDeleteDialog(rowData: any) {
    let usmPortfolioToDelete: UsmPortfolio = <UsmPortfolio>rowData;

    let dialogRef = this.confirmDeleteDialog.open(DeleteComponent, {
      disableClose: true,
      data: {
        title: "Delete Portfolio",
        message: "Are you sure you want to delete?",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "yes") {
        this.delete(usmPortfolioToDelete);
      }
    });
  }

  rowSelected(item: UsmPortfolio) {
    this.router.navigate(["/portfoliolist", item.id]);
  }
  setSelectedEntities(event) { }
  // Search() {
  //     let newtasks = new Array<UsmPortfolio>();
  //     if (this.searchedName == "All" || this.searchedName == "") {
  //         this.usmPortfolios = this.usmPortfoliosCopy;
  //     } else {
  //         this.usmPortfolios = Object.assign([], this.usmPortfoliosCopy).filter((item1) =>
  //             item1.portfolioName == null ? "" : item1.portfolioName.toLowerCase().indexOf(this.searchedName.
  //toLowerCase()) > -1
  //         );
  //     }
  //     if (this.filterUsmPortfolio == "All" || this.filterUsmPortfolio == "") {
  //         this.usmPortfolios = this.usmPortfolios;
  //     } else {
  //         this.usmPortfolios = Object.assign([], this.usmPortfolios).filter((item1) =>
  //             item1.description == null ? "" : item1.description.toLowerCase().indexOf(this.filterUsmPortfolio.
  //toLowerCase()) > -1
  //         );
  //     }
  //     this.UsmPortfolioList = new MatTableDataSource(this.usmPortfolios);
  //     this.UsmPortfolioList.sort = this.sort;
  //     this.UsmPortfolioList.paginator = this.paginator;
  // }
  Search(pageEvent) {
    if (pageEvent == null || !pageEvent) {
      pageEvent = { page: 0, size: this.pageSize };
    }
    let params;
    if ((this.searchedName == undefined || this.searchedName == "") && (this.filterUsmPortfolio == undefined || this.filterUsmPortfolio == "")) {
      this.Clear();
      this.filterFlag = false;
    }
    //  else if (this.searchedName == "" || this.filterUsmPortfolio == "") {
    //   this.Clear();
    //   this.filterFlag = false;
    // } 
    else if (this.searchedName != undefined && (this.filterUsmPortfolio == undefined || this.filterUsmPortfolio == "")) {
      params = {
        portfolioName: this.searchedName,
      };
      this.filterFlag = true;
    } else if ((this.searchedName == undefined || this.searchedName == "") && this.filterUsmPortfolio != undefined) {
      params = {
        description: this.filterUsmPortfolio,
      };
      this.filterFlag = true;
    } else {
      params = {
        portfolioName: this.searchedName,
        description: this.filterUsmPortfolio,
      };
      this.filterFlag = true;
    }
    if (this.filterFlag) {
      this.usmPortfolioService.search(params, pageEvent).subscribe((res) => {
        this.currentPage = res;
        this.usmPortfolios = this.currentPage.content;
        this.usmPortfoliosCopy = this.usmPortfolios;
        this.wavesLength = this.currentPage.totalElements;
        this.UsmPortfolioList = new MatTableDataSource(this.currentPage.content);
        this.UsmPortfolioList.paginator = this.paginator;
        this.UsmPortfolioList.sort = this.sort;
      });
    }
  }
  Clear() {
    this.filterUsmPortfolio = undefined;
    this.searchedName = undefined;
    this.myInputReference.nativeElement.value = null;
    this.fetchWave(null);
    this.filterFlag = false;
    this.filterFlag1 = false;
    this.portfolioSearched = undefined;
  }
  assignCopy() {
    this.usmPortfolios = Object.assign([], this.usmPortfoliosCopy);
  }
  filterItem(value, pageEvent) {
    if (!value) {
      this.assignCopy();
    }
    if (this.portfolioSearched == "" || this.portfolioSearched == undefined) {
      this.Clear();
    } else {
      let params;
      params = {
        portfolioName: this.portfolioSearched,
      };
      this.filterFlag1 = true;
      if (pageEvent == null || !pageEvent) {
        pageEvent = { page: 0, size: this.pageSize };
      }
      if (this.filterFlag1) {
        this.usmPortfolioService.search(params, pageEvent).subscribe((res) => {
          this.currentPage = res;
          this.usmPortfolios = this.currentPage.content;
          this.usmPortfoliosCopy = this.usmPortfolios;
          this.wavesLength = this.currentPage.totalElements;
          this.pageIndex = 0;
          this.UsmPortfolioList = new MatTableDataSource(this.currentPage.content);
          this.UsmPortfolioList.paginator = this.paginator;
          this.UsmPortfolioList.sort = this.sort;
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
    if (this.filterFlag == false && this.filterFlag1 == false){
      this.fetchWave({ page: event.pageIndex, size: this.pageSize });
      this.pageIndex = event.pageIndex;
    }
    else if (this.filterFlag == true) this.Search({ page: event.pageIndex, size: this.pageSize });
    else if (this.filterFlag1 == true)
      this.filterItem(this.portfolioSearched, { page: event.pageIndex, size: this.pageSize });
  }

  checkNameMaxLength() {
    if (this.usmPortfolio.portfolioName.length >= 255) {
      this.showNameLengthErrorMessage = true;
    } else {
      this.showNameLengthErrorMessage = false;
    }
  }

  checkDescriptionMaxLength() {
    if (this.usmPortfolio.description.length >= 255) {
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
