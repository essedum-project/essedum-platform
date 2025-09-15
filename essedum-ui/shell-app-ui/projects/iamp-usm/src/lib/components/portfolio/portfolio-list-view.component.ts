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
  EventEmitter,
  SimpleChanges,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from "@angular/core";
import { ChangeDetectorRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { PageResponse } from "../../support/paging";
import { MessageService } from "../../services/message.service";
import {
  MatDialog
} from "@angular/material/dialog";
import { ConfirmDeleteDialogComponent } from "../../support/confirm-delete-dialog.component";
import { HelperService } from "../../services/helper.service";
import { FormControl } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";

import { Portfolio } from "../../models/portfolio";
import { PortfolioService } from "../../services/portfolio.service";
import { TagEventDTO } from "../../models/tagEventDTO.model";

import { DeleteComponent } from "../../shared-modules/confirm-delete/delete.component";
import { Subscription } from "rxjs";
import { IampUsmService } from "../../iamp-usm.service";
import { Project } from "../../models/project";
import { ProjectService } from "../../services/project.service";
import { PortfolioAddComponent } from "./portfolio-add/portfolio-add.component";

@Component({
  templateUrl: "portfolio-list-view.component.html",
  styleUrls: ["./portfolio-list-view.component.scss"],
  selector: "portfolio-list-view",
})
export class PortfolioListViewComponent implements OnInit, OnDestroy {
  @Input() header = "UsmPortfolios...";
  @Output() changeView: EventEmitter<boolean> = new EventEmitter();
  @Input() sub: boolean = false;
  @Output() onAddNewClicked = new EventEmitter();
  p: number;
  @ViewChild("myInput", { static: false }) myInputReference: ElementRef;
  usmPortfolioToDelete: Portfolio;
  UsmPortfolioList: MatTableDataSource<any>;

  tagrefresh = false;
  selectedAdapterType: string[] = [];
  readonly SERVICE_V1 = "Portfolio";
  displayedColumns: string[] = [
    "#",
    "Id",
    "PortfolioName",
    "Description",
    "Actions",
  ];
  displayColumns: string[] = ["Id", "Name", "Displayname"];
  lastRefreshedTime: Date | null = null;
  title = "Portfolio List";

  private paginator: MatPaginator;
  private sort: MatSort;
  length: number = 0;
  @ViewChild(MatSort, { static: false }) set matSort(ms: MatSort) {
    this.sort = ms;
  }
  @ViewChild(MatPaginator) paginator1: MatPaginator;
  example: Portfolio = new Portfolio();
  exampleProject: Project = new Project();
  currentPage: PageResponse<Portfolio> = new PageResponse<Portfolio>(
    0,
    0,
    []
  );
  currentPageProject: PageResponse<Project> = new PageResponse<Project>(
    0,
    0,
    []
  );
  ProjectList: MatTableDataSource<any>;

  //foreign key dependencies
  changeDetectionRef: ChangeDetectorRef;
  constructor(
    public router: Router,
    public messageService: MessageService,
    public confirmDeleteDialog: MatDialog,
    public confirmDialog: MatDialog,
    public dialog: MatDialog,
    public helperService: HelperService,
    private route: ActivatedRoute,
    public portfolioService: PortfolioService,
    private usmService: IampUsmService,
    public projectService: ProjectService,
    changeDetectionRef: ChangeDetectorRef
  ) {
    this.changeDetectionRef = changeDetectionRef;
    this.UsmPortfolioList = new MatTableDataSource([]);
  }

  testCreate: boolean = false;
  testId: number;

  filterUsmPortfolio: any;
  searchedName: any;
  showCreate: boolean = false;
  usmPortfolios = new Array<Portfolio>();
  usmPortfoliosCopy = new Array<Portfolio>();
  projects = new Array<Project>();
  projectsCopy = new Array<Project>();
  showList: boolean = true;
  view: boolean = false;
  buttonFlag: boolean = false;
  viewUsmPortfolio: boolean = false;
  edit: boolean = false;
  lazyload = { first: 0, rows: 5000, sortField: null, sortOrder: null };
  usmPortfolio = new Portfolio();
  currentUsmPortfolio = new Portfolio();
  selected = new FormControl(0);
  pageSize = 5;
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
  busy: Subscription;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number = 0;
  prevRowsPerPageValue: number;
  itemsPerPage: number[] = [5, 10, 20];
  endIndex: number;
  startIndex: number;
  pageNumberChanged: boolean = true;
  pageNumber: number = 0;
  hoverStates: boolean[] = Array(10).fill(false);
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();
  ngOnInit() {
    if (!this.UsmPortfolioList) {
      this.UsmPortfolioList = new MatTableDataSource([]);
    }

    this.pageNumber = 1;
    this.startIndex = 0;
    this.endIndex = 5;
    this.searchedName = "";
    this.filterUsmPortfolio = "";
    this.selectedAdapterType = [];

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
      window.location.href.includes("portfoliolist") &&
      window.location.href.includes("true")
    ) {
      this.showCreate = true;
      this.edit = true;
      this.view = true;
      this.viewUsmPortfolio = true;
      this.buttonFlag = true;
      this.route.params.subscribe((res: any) => {
        this.getUsmPortfolios(res.id);
      });
      this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
    } else if (
      window.location.href.includes("portfoliolist") &&
      window.location.href.includes("false")
    ) {
      this.showCreate = true;
      this.edit = true;
      this.view = false;
      this.buttonFlag = false;
      this.route.params.subscribe((res: any) => {
        this.getUsmPortfolios(res.id);
      });
      this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
    } else if (
      window.location.href.includes("portfoliolist") &&
      window.location.href.includes("create")
    ) {
      this.showCreate = true;
      this.edit = false;
      this.usmPortfolio = new Portfolio();
      this.loadPage({ first: 0, rows: 1000, sortField: null, sortOrder: null });
      this.changeView.emit(false);
    } else {
      this.fetchWave(null);
    }

    this.lastRefreshTime();
  }

  listView() {
    this.showNameLengthErrorMessage = false;
    this.showDescLengthErrorMessage = false;
    if (this.edit || this.view)
      this.router.navigate(["../../"], { relativeTo: this.route });
    else this.router.navigate(["../"], { relativeTo: this.route });
  }

  showUsmPortfolioList() {}
  getUsmPortfolios(id) {
    console.log("Getting portfolio with ID:", id);
    this.busy = this.portfolioService.getUsmPortfolio(id).subscribe(
      (res) => {
        console.log("Portfolio data received:", res);
        this.currentUsmPortfolio = res;
        this.usmPortfolio = res;
        this.exampleProject.portfolioId = this.usmPortfolio;

        console.log("Fetching projects for portfolio ID:", id);
        this.projectService
          .findAll(this.exampleProject, this.lazyload)
          .subscribe(
            (pageResponse) => {
              console.log("Project data received:", pageResponse);
              this.currentPageProject = pageResponse;
              this.projects = this.currentPageProject.content.sort((a, b) =>
                a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
              );
              this.projectsCopy = this.projects;
              this.ProjectList = new MatTableDataSource(
                this.currentPageProject.content
              );
              this.length = this.projects.length;
              this.ProjectList.paginator = this.paginator1;
              console.log("Projects processed, count:", this.projects.length);
            },
            (error) => {
              this.messageService.messageNotification("Could not get the projects", "error");
              // Initialize with empty array to prevent null reference errors
              this.projects = [];
              this.projectsCopy = [];
              this.ProjectList = new MatTableDataSource([]);
            }
          );
      },
      (error) => {
        this.messageService.messageNotification("Could not load portfolio details", "error");
        // Reset data on error
        this.currentUsmPortfolio = new Portfolio();
        this.projects = [];
      }
    );
  }

  editUsmPortfolio(usmPortfolio: Portfolio) {
    sessionStorage.setItem("usmPortfolioid", usmPortfolio.id.toString());
    sessionStorage.setItem("pageview", "usmPortfolio");

    // Get the full portfolio data and open dialog only after data is loaded
    this.busy = this.portfolioService.getUsmPortfolio(usmPortfolio.id).subscribe(
      (res) => {
        this.currentUsmPortfolio = res;
        this.usmPortfolio = res;
        this.exampleProject.portfolioId = this.usmPortfolio;

        this.projectService.findAll(this.exampleProject, this.lazyload).subscribe(
          (pageResponse) => {
            this.currentPageProject = pageResponse;
            this.projects = this.currentPageProject.content.sort((a, b) =>
              a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
            );
            this.projectsCopy = this.projects;
            this.ProjectList = new MatTableDataSource(this.currentPageProject.content);
            this.length = this.projects.length;
            this.ProjectList.paginator = this.paginator1;

            // Now open the dialog with the latest data
            const dialogRef = this.dialog.open(PortfolioAddComponent, {
              height: "80%",
              width: "70%",
              disableClose: true,
              data: {
                mode: "edit",
                portfolio: this.currentUsmPortfolio,
                projectList: this.projects,
              },
            });

            dialogRef.afterClosed().subscribe((result) => {
              if (result) {
                this.fetchWave(null);
                this.lastRefreshTime();
              }
            });
          },
          (error) => {
            this.messageService.messageNotification("Could not get the projects", "error");
            this.projects = [];
            this.projectsCopy = [];
            this.ProjectList = new MatTableDataSource([]);
          }
        );
      },
      (error) => {
        this.messageService.messageNotification("Could not load portfolio details", "error");
        this.currentUsmPortfolio = new Portfolio();
        this.projects = [];
      }
    );
  }

  view_UsmPortfolio(usmPortfolio: Portfolio) {
    sessionStorage.setItem("usmPortfolioid", usmPortfolio.id.toString());
    sessionStorage.setItem("pageview", "usmPortfolio");

    // Get the full portfolio data and open dialog only after data is loaded
    this.busy = this.portfolioService.getUsmPortfolio(usmPortfolio.id).subscribe(
      (res) => {
        this.currentUsmPortfolio = res;
        this.usmPortfolio = res;
        this.exampleProject.portfolioId = this.usmPortfolio;

        this.projectService.findAll(this.exampleProject, this.lazyload).subscribe(
          (pageResponse) => {
            this.currentPageProject = pageResponse;
            this.projects = this.currentPageProject.content.sort((a, b) =>
              a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
            );
            this.projectsCopy = this.projects;
            this.ProjectList = new MatTableDataSource(this.currentPageProject.content);
            this.length = this.projects.length;
            this.ProjectList.paginator = this.paginator1;

            // Now open the dialog with the latest data
            const dialogRef = this.dialog.open(PortfolioAddComponent, {
              height: "80%",
              width: "70%",
              disableClose: true,
              data: {
                mode: "view",
                portfolio: this.currentUsmPortfolio,
                projectList: this.projects,
              },
            });

            dialogRef.afterClosed().subscribe((result) => {
              if (result) {
                this.fetchWave(null);
                this.lastRefreshTime();
              }
            });
          },
          (error) => {
            this.messageService.messageNotification("Could not get the projects", "error");
            this.projects = [];
            this.projectsCopy = [];
            this.ProjectList = new MatTableDataSource([]);
          }
        );
      },
      (error) => {
        this.messageService.messageNotification("Could not load portfolio details", "error");
        this.currentUsmPortfolio = new Portfolio();
        this.projects = [];
      }
    );
  }

  createView() {
    if (
      window.location.href.includes("true") ||
      window.location.href.includes("false")
    ) {
      this.router.navigate(["./create"], { relativeTo: this.route });
    } else {
      this.router.navigate(["./create"], { relativeTo: this.route });
    }
  }

  createPortfolioKey() {
    this.exampleProject = new Project();
    this.projectService.findAll(this.exampleProject, this.lazyload).subscribe(
      (pageResponse) => {
        this.projects = pageResponse.content.sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        );

        const dialogRef = this.dialog.open(PortfolioAddComponent, {
          height: "67%",
          width: "50%",
          disableClose: true,
          data: {
            mode: "create",
            projectList: this.projects,
          },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.fetchWave(null);
            this.lastRefreshTime();
          }
        });
      },
      (error) => {
        this.messageService.messageNotification("Could not get the projects", "error");
        const dialogRef = this.dialog.open(PortfolioAddComponent, {
          height: "67%",
          width: "50%",
          disableClose: true,
          data: {
            mode: "create",
            projectList: [],
          },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.fetchWave(null);
            this.lastRefreshTime();
          }
        });
      }
    );
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
      this.messageService.messageNotification("Portfolio name can't be empty", "warning");
    } else if (this.usmPortfolio.portfolioName.length > 100) {
      this.messageService.messageNotification(
        "Portfolio name cannot be more than 100 characters",
        "warning"
      );
    } else if (
      !/^[a-zA-Z][a-zA-Z0-9 \@\%\!\#\*\-\_\&\$\(\)\=\+\/\.\?\\]*?$/.test(
        this.usmPortfolio.portfolioName
      )
    ) {
      this.messageService.messageNotification("Portfolio name format is incorrect", "warning");
    } else if (
      this.usmPortfolio.description &&
      !/^[a-zA-Z0-9][a-zA-Z0-9 \-\_\.]*?$/.test(this.usmPortfolio.description)
    ) {
      this.messageService.messageNotification(
        "Portfolio description format is incorrect",
        "warning"
      );
    } else {
      let flag: boolean = false;
      this.usmPortfolios.forEach((ele) => {
        if (
          ele.portfolioName.trim().toLowerCase() ==
          this.usmPortfolio.portfolioName.trim().toLowerCase()
        ) {
          flag = true;
          this.messageService.messageNotification("Portfolio Name Already Exists", "warning");
        }
      });
      if (!flag) {
        if (sessionStorage.getItem("telemetry") == "true") {
        }
        this.busy = this.portfolioService
          .create(this.usmPortfolio)
          .subscribe(
            (response) => {
              this.testId = response.id;
              this.messageService.messageNotification("Portfolio Saved Successfully");
              this.clearWave();
              this.showCreate = false;
              this.testCreate = true;
              this.listView();
            },
            (error) => {
              this.testCreate = false;
              this.messageService.messageNotification("Could not create Portfolio", "error");
            }
          );
      }
    }
  }

  compareTodiff(curr: any, prev: any) {
    let temparr = [];
    Object.keys(prev).forEach((key) => {
      if (prev[key] != curr[key]) temparr.push(key);
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
      this.messageService.messageNotification("Portfolio name can't be empty", "warning");
    } else if (this.usmPortfolio.portfolioName.length > 255) {
      this.messageService.messageNotification(
        "Portfolio name cannot be more than 255 characters",
        "warning"
      );
    } else if (
      !/^[a-zA-Z][a-zA-Z0-9 \@\%\!\#\*\-\_\&\$\(\)\=\+\/\.\?\\]*?$/.test(
        this.usmPortfolio.portfolioName
      )
    ) {
      this.messageService.messageNotification("Portfolio name format is incorrect", "warning");
    } else if (
      this.usmPortfolio.description &&
      !/^[a-zA-Z0-9][a-zA-Z0-9 \-\_\.]*?$/.test(this.usmPortfolio.description)
    ) {
      this.messageService.messageNotification(
        "Portfolio description format is incorrect",
        "warning"
      );
    } else {
      let flag: boolean = false;
      this.usmPortfolios.forEach((ele) => {
        if (
          ele.id != this.usmPortfolio.id &&
          ele.portfolioName.trim().toLowerCase() ==
            this.usmPortfolio.portfolioName.trim().toLowerCase()
        ) {
          flag = true;
          this.messageService.messageNotification("Portfolio Name Already Exists", "warning");
        }
      });
      if (!flag) {
        if (sessionStorage.getItem("telemetry") == "true") {
          let arr1 = [];
          if (this.usmPortfolios) {
            arr1 = this.usmPortfolios.filter(
              (item) => item.id == this.usmPortfolio.id
            );
          }
          let diff = this.compareTodiff(this.usmPortfolio, arr1[0]);
        }
        this.busy = this.portfolioService
          .update(this.usmPortfolio)
          .subscribe(
            (rs) => {
              sessionStorage.setItem("UpdatedUser", "true");
              this.testId = rs.id;
              this.testCreate = true;
              this.messageService.messageNotification(
                "Portfolio updated successfully"
                
              );
              this.clearWave();
              this.showCreate = false;
              this.listView();
            },
            (error) => {
              this.testCreate = false;
              this.messageService.messageNotification("Could not update", "error");
            }
          );
      }
    }
  }

  delete(usmPortfolioToDelete: Portfolio) {
    let id = usmPortfolioToDelete.id;
    this.portfolioService.delete(id).subscribe(
      (response) => {
        this.testCreate = true;
        sessionStorage.setItem("UpdatedUser", "true");
        this.currentPage.remove(usmPortfolioToDelete);
        this.Clear();
        this.messageService.messageNotification("Portfolio deleted successfully");
      },
      (error) => {
        this.testCreate = false;
        this.messageService.messageNotification("Could not delete!", "error");
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
      this.usmPortfolio = new Portfolio();
      this.showNameLengthErrorMessage = false;
      this.showDescLengthErrorMessage = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.fetchWave(null);
  }

  search() {
    if (!this.sub) {
      console.log("Search called with filter values:", {
        searchedName: this.searchedName,
        filterUsmPortfolio: this.filterUsmPortfolio,
        selectedAdapterType: this.selectedAdapterType,
        hasActiveFilters: this.hasActiveFilters()
      });
      
      if (this.hasActiveFilters()) {
        console.log("Active filters detected, applying portfolio filters");
        this.filterPortfolios();
      } else {
        console.log("No active filters detected, loading all portfolios");
        this.loadPage({
          first: 0,
          rows: 1000,
          sortField: null,
          sortOrder: null,
        });
      }
    }
  }

  loadPage(event) {
    this.portfolioService.findAll(this.example, event).subscribe(
      (pageResponse) => {
        (this.currentPage = pageResponse),
          (this.currentPage.content = this.currentPage.content.sort((a, b) =>
            a.portfolioName.toLowerCase() > b.portfolioName.toLowerCase()
              ? 1
              : -1
          ));
        this.usmPortfolios = this.currentPage.content;
        this.usmPortfoliosCopy = this.usmPortfolios;
        this.UsmPortfolioList = new MatTableDataSource(
          this.currentPage.content
        );
        this.UsmPortfolioList.paginator = this.paginator;
        this.UsmPortfolioList.sort = this.sort;
        if (this.currentPage.totalPages > 0) this.testCreate = true;
      },
      (error) => {
        this.testCreate = false;
        this.messageService.messageNotification("Could not get the results", "error");
      }
    );
  }
  fetchWave(pageEvent) {
    if (pageEvent == null || !pageEvent) {
      pageEvent = { page: 0, size: this.pageSize };
    }
    this.portfolioService.FindAll(this.example, pageEvent).subscribe(
      (pageResponse) => {
        (this.currentPage = pageResponse),
          (this.currentPage.content = this.currentPage.content.sort((a, b) =>
            a.portfolioName.toLowerCase() > b.portfolioName.toLowerCase()
              ? 1
              : -1
          ));
        this.usmPortfolios = this.currentPage.content;
        this.usmPortfoliosCopy = this.usmPortfolios;
        this.wavesLength = this.currentPage.totalElements;
        this.UsmPortfolioList = new MatTableDataSource(
          this.currentPage.content
        );
        this.UsmPortfolioList.paginator = this.paginator;
        this.UsmPortfolioList.sort = this.sort;

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
        if (this.currentPage.totalPages > 0) this.testCreate = true;

        this.pageChanged.emit(this.pageNumber);
        this.lastRefreshTime();
      },
      (error) => {
        this.testCreate = false;
        if (!this.UsmPortfolioList) {
          this.UsmPortfolioList = new MatTableDataSource([]);
        }
        this.messageService.messageNotification("Could not get the results", "error");
      }
    );
  }
  onRowSelect(event: any) {
    let id = event.id;
    this.router.navigate(["/portfoliolist", id]);
  }

  showDeleteDialog(rowData: any) {
    let usmPortfolioToDelete: Portfolio = <Portfolio>rowData;

    let dialogRef = this.confirmDeleteDialog.open(DeleteComponent, {
      disableClose: true,
      data: {
        title: "Delete Portfolio",
        message:
          "Are you sure do you want to delete the portfolio named '" +
          rowData.portfolioName +
          " ?",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "yes") {
        this.delete(usmPortfolioToDelete);
      }
    });
  }

  rowSelected(item: Portfolio) {
    this.router.navigate(["/portfoliolist", item.id]);
  }
  setSelectedEntities(event) {}

  Search(pageEvent) {
    if (pageEvent == null || !pageEvent) {
      pageEvent = { page: 0, size: this.pageSize };
    }
    let params;
    if (
      (this.searchedName == undefined || this.searchedName == "") &&
      (this.filterUsmPortfolio == undefined || this.filterUsmPortfolio == "")
    ) {
      this.Clear();
      this.filterFlag = false;
    } else if (
      this.searchedName != undefined &&
      (this.filterUsmPortfolio == undefined || this.filterUsmPortfolio == "")
    ) {
      params = {
        portfolioName: this.searchedName,
      };
      this.filterFlag = true;
    } else if (
      (this.searchedName == undefined || this.searchedName == "") &&
      this.filterUsmPortfolio != undefined
    ) {
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
      this.portfolioService.search(params, pageEvent).subscribe((res) => {
        this.currentPage = res;
        this.usmPortfolios = this.currentPage.content;
        this.usmPortfoliosCopy = this.usmPortfolios;
        this.wavesLength = this.currentPage.totalElements;
        this.UsmPortfolioList = new MatTableDataSource(
          this.currentPage.content
        );
        this.UsmPortfolioList.paginator = this.paginator;
        this.UsmPortfolioList.sort = this.sort;

        this.noOfPages = this.currentPage.totalPages;
        this.pageNumber = pageEvent.page + 1 || 1;

        this.pageChanged.emit(this.pageNumber);
      });
    }
  }

  Clear() {
    this.filterUsmPortfolio = undefined;
    this.searchedName = undefined;
    if (this.myInputReference && this.myInputReference.nativeElement) {
      this.myInputReference.nativeElement.value = null;
    }

    this.fetchWave(null);
    this.filterFlag = false;
    this.filterFlag1 = false;
    this.portfolioSearched = undefined;
  }

  assignCopy() {
    this.usmPortfolios = Object.assign([], this.usmPortfoliosCopy);
  }

  filterItem(value, pageEvent?) {
    this.portfolioSearched = value;

    if (!value) {
      this.assignCopy();
      return;
    }

    if (this.portfolioSearched == "" || this.portfolioSearched == undefined) {
      this.Clear();
      return;
    }

    let params;
    params = {
      portfolioName: this.portfolioSearched,
    };
    this.filterFlag1 = true;

    if (pageEvent == null || !pageEvent) {
      pageEvent = { page: 0, size: this.pageSize };
    }

    if (this.filterFlag1) {
      this.portfolioService.search(params, pageEvent).subscribe(
        (res) => {
          this.currentPage = res;
          this.usmPortfolios = this.currentPage.content;
          this.usmPortfoliosCopy = this.usmPortfolios;
          this.wavesLength = this.currentPage.totalElements;
          this.pageIndex = 0;
          this.UsmPortfolioList = new MatTableDataSource(
            this.currentPage.content
          );
          this.UsmPortfolioList.paginator = this.paginator;
          this.UsmPortfolioList.sort = this.sort;

          this.noOfPages = this.currentPage.totalPages;
          this.pageNumber = pageEvent.page + 1;

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
        },
        (error) => {
          if (!this.UsmPortfolioList) {
            this.UsmPortfolioList = new MatTableDataSource([]);
          }
          this.messageService.messageNotification("Could not get search results", "error");
        }
      );
    }
  }

  onPageFired(event) {
    this.pageIndex = event.pageIndex;

    if (this.filterFlag == false && this.filterFlag1 == false) {
      this.fetchWave({ page: event.pageIndex, size: this.pageSize });
    } else if (this.filterFlag == true) {
      this.Search({ page: event.pageIndex, size: this.pageSize });
    } else if (this.filterFlag1 == true) {
      this.filterItem(this.portfolioSearched, {
        page: event.pageIndex,
        size: this.pageSize,
      });
    }
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
    var i = event.charCode;
    return this.isValidLetter(i);
  }

  isValidLetter(i) {
    return (
      (i >= 65 && i <= 90) ||
      (i >= 97 && i <= 122) ||
      (i >= 48 && i <= 57) ||
      [8, 13, 16, 17, 20, 95].indexOf(i) > -1
    );
  }

  ngOnDestroy() {
    if (this.busy) {
      this.busy.unsubscribe();
    }
  }

  lastRefreshTime() {
    setTimeout(() => {
      this.lastRefreshedTime = new Date();
    }, 1000);
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
        this.Search(pageEvent);

        this.pageChanged.emit(this.pageNumber);
      } else if (this.filterFlag1 == true) {
        this.fetchWave(pageEvent);
        this.filterItem(this.portfolioSearched, pageEvent);
      }
    }
  }

  rowsPerPageChanged() {
    if (this.pageSize == 0) {
      this.pageSize = this.prevRowsPerPageValue;
    } else {
      this.pageSizeChanged.emit(this.pageSize);
      this.prevRowsPerPageValue = this.pageSize;
      this.changeDetectionRef.detectChanges();
    }
  }

  getRowNumber(index: number): number {
    return this.pageNumber * this.pageSize + index + 1 - this.pageSize;
  }

  hasActiveFilters(): boolean {
    const hasTypeFilter = this.selectedAdapterType && this.selectedAdapterType.length > 0;
    const hasNameFilter = this.searchedName && this.searchedName.trim() !== "";
    const hasDescFilter = this.filterUsmPortfolio && this.filterUsmPortfolio.trim() !== "";
    
    console.log("Portfolio component active filters check:", {
      hasTypeFilter,
      hasNameFilter, 
      hasDescFilter,
      searchedName: this.searchedName,
      filterUsmPortfolio: this.filterUsmPortfolio
    });
    
    return hasTypeFilter || hasNameFilter || hasDescFilter;
  }

  getActiveFiltersSummary(): string {
    if (!this.hasActiveFilters()) {
      return "";
    }

    const filterParts = [];

    if (this.selectedAdapterType && this.selectedAdapterType.length > 0) {
      filterParts.push(`Type: ${this.selectedAdapterType.join(", ")}`);
    }

    if (this.searchedName && this.searchedName.trim() !== "") {
      filterParts.push(`Name: ${this.searchedName}`);
    }

    if (this.filterUsmPortfolio && this.filterUsmPortfolio.trim() !== "") {
      filterParts.push(`Description: ${this.filterUsmPortfolio}`);
    }

    return filterParts.join(" | ");
  }
  onFilterStatusChange(event: boolean) {
    console.log("Filter status changed:", event);

    if (event === false) {
      if (this.hasActiveFilters() === false) {
        this.fetchWave({ page: 0, size: this.pageSize });
      }
    } else {
      this.search();
    }
  }
  onTagSelected(event: TagEventDTO) {
    if (event) {
      console.log("Portfolio component received TagEventDTO:", event);
      this.selectedAdapterType = event.selectedAdapterType || [];
      this.searchedName = "";
      this.filterUsmPortfolio = "";
      if (Array.isArray(event.portfolioName) && event.portfolioName.length > 0) {
        this.searchedName = event.portfolioName[0];
        console.log("Portfolio name set to:", this.searchedName);
      }

      if (Array.isArray(event.portfolioDescription) && event.portfolioDescription.length > 0) {
        this.filterUsmPortfolio = event.portfolioDescription[0];
        console.log("Portfolio description set to:", this.filterUsmPortfolio);
      }

      this.tagrefresh = false;
      if (this.hasActiveFilters()) {
        console.log("Applying portfolio filters with active filters");
        this.filterPortfolios();
      } else {
        console.log("No active filters, fetching all portfolios");
        this.fetchWave({ page: 0, size: this.pageSize });
      }

      console.log(
        "Filter applied with selected types:",
        this.selectedAdapterType
      );
    }
  }
  private filterPortfolios(): void {
    console.log("filterPortfolios called with values:", {
      searchedName: this.searchedName,
      filterUsmPortfolio: this.filterUsmPortfolio,
      selectedAdapterType: this.selectedAdapterType,
      hasActiveFilters: this.hasActiveFilters()
    });
    
    if (!this.hasActiveFilters()) {
      console.log("No active filters, fetching all portfolios");
      this.fetchWave({ page: this.pageNumber - 1, size: this.pageSize });
      return;
    }

    let params: any = {};

    if (this.selectedAdapterType && this.selectedAdapterType.length > 0) {
      params.portfolioType = this.selectedAdapterType.join(",");
    }

    if (this.filterUsmPortfolio) {
      const trimmedDesc = this.filterUsmPortfolio.trim();
      if (trimmedDesc !== "") {
        params.description = trimmedDesc;
      }
    }

    if (this.searchedName) {
      const trimmedName = this.searchedName.trim();
      if (trimmedName !== "") {
        params.portfolioName = trimmedName;
      }
    }

    this.filterFlag = true;

    console.log("Applying portfolio filters with params:", params);

    this.portfolioService
      .search(params, { page: 0, size: this.pageSize })
      .subscribe(
        (res) => {
          this.currentPage = res;
          this.usmPortfolios = this.currentPage.content;
          this.usmPortfoliosCopy = this.usmPortfolios;
          this.wavesLength = this.currentPage.totalElements;

          this.UsmPortfolioList = new MatTableDataSource(
            this.currentPage.content
          );
          this.UsmPortfolioList.paginator = this.paginator;
          this.UsmPortfolioList.sort = this.sort;

          this.noOfPages = this.currentPage.totalPages;
          this.pageNumber = 1;

          this.pageArr = Array(this.noOfPages)
            .fill(0)
            .map((x, i) => i);

          this.startIndex = 0;
          this.endIndex = Math.min(5, this.noOfPages);

          this.pageChanged.emit(this.pageNumber);
          this.lastRefreshTime(); 
          console.log(
            "Filter results loaded, found:",
            this.currentPage.totalElements,
            "items"
          );
        },
        (error) => {
          if (!this.UsmPortfolioList) {
            this.UsmPortfolioList = new MatTableDataSource([]);
          }
          this.messageService.messageNotification("Could not apply filters", "info");
        }
      );
  }
}
