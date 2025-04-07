import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from "@angular/material/expansion";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
import { Subscription } from "rxjs";
import { LeapTelemetryService, OpenTelemetryService } from "com-lib-util";
import { AppGlobals } from "../sharedModule/shared-variables/app.globals";
import { ConfirmDeleteDialogComponent } from "../confirm-delete-dialog.component/confirm-delete-dialog.component";
import { TabsFilterService } from '../services/tabs-filter.service';
import { Services } from "../services/service";
import { EventsService } from "../services/event.service";
import { CreateeventComponent } from "./createevent/createevent.component";
import { LedsLibService } from "leds-lib";
import { HttpParams } from "@angular/common/http";
@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})

export class EventsComponent implements OnInit {
  busy: Subscription;
  @Input("searchText") searchText;
  tmpSearchText = "";
  eventsList: any[] = [];
  originalPipeline: any = [];
  currentSearchList: any[] = [];
  totalJobs = 0;
  page = 0;
  lastPage = 0;
  rows = 6;
  showBreadcrumb = false;
  isAuth: boolean = false;
  breadcrumbName: any = [];
  permissionList
  isGridView: boolean;
  isAnalyst: boolean = true;
  private searchSubscription: Subscription;
  private viewSubscription: Subscription;
  eventOptions = [
    { "label": "Job Event", "value": "job" },
    { "label": "API Event", "value": "api" },
    { "label": "Action Event", "value": "action" }]
  selectedEventType: string[] = [];
  allCards: any;
  allCardsFiltered: any;
  
  pageSize: number;
  pageNumber: any;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number = 0;
  prevRowsPerPageValue: number;
  itemsPerPage: number[] = [6, 9, 18, 36, 54, 72];
  noOfItems: number;
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();
  endIndex: number;
  startIndex: number;
  pageNumberChanged: boolean = true;
  records: boolean = false;
  

  constructor(
    private telemetryService: LeapTelemetryService,
    private telemetry: OpenTelemetryService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private eventsService: EventsService,
    private filtersService: TabsFilterService,
    private changeDetectionRef: ChangeDetectorRef,
    private _globals: AppGlobals,
    private service: Services,
    private ledsLibService: LedsLibService,
  ) {
    this.router.onSameUrlNavigation = "reload";
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }
  telemetryCall(){
    this.telemetry.startTelemetry('aip-app','EventsComponent',sessionStorage.getItem('organization'))
  }
  ngOnInit() {
    this.telemetryCall();
    this.records= false;
    this.filtersService.changeText('');
    this.telemetryImpression();
    this.pageSize = this.itemsPerPage[0];
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['page']) {
        this.pageNumber = parseInt(params['page']);
        this.tmpSearchText = params['search'];
      } else {
        this.pageNumber = 1;
        this.tmpSearchText = '';
      }
    });
    this.updateQueryParam(this.pageNumber);
    this.getInnerJobs();
    // if (this.pageNumberChanged) {
    //   this.pageNumber = 1;
    //   this.startIndex = 0;
    //   this.endIndex = 5;
    // }
    if (this.pageNumber && this.pageNumber >= 5) {
      this.endIndex = this.pageNumber + 2;
      this.startIndex = this.endIndex - 5;
    } else {
      this.startIndex = 0;
      this.endIndex = 5;
    }
    this._globals.setAPIStatus(false);
    this.searchSubscription = this.filtersService.getSearchText().subscribe((message) => {
      this.searchText = message;
      this.searching();
    });
    this.viewSubscription = this.filtersService.getView().subscribe((view) => (this.isGridView = view));
    this.authentications();
    this.busy = this.service.getPipelineNames(sessionStorage.getItem('organization')).subscribe((res) => {
      this.originalPipeline = res;
    });
  }

  authentications() {
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        // event-edit/update permission
        if (cipAuthority.includes("event-edit")) this.isAuth = true;
      }
    );
  }

  telemetryImpression() {
    this.telemetryService.start();
    this.telemetryService.impression("aip-app", "list", "EventsComponent");
  }

  back() {
    this.location.back();
  }

  onSearch() {
    this.filtersService.changeText(this.searchText);
    this.updateQueryParam(this.pageNumber = 1,this.searchText);
  }
  compareString(a: string, b: string, isAsc: boolean) {
    return (a.toLowerCase() < b.toLowerCase() ? -1 : 1) * (isAsc ? 1 : -1);
  }

  compareNumber(a: number, b: number, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  onRefresh() {
    this.ngOnInit();
  }

  delete(data) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.deleteJob(data.id);
      }
    });
  }

  deleteJob(jobName: any) {
    this.busy = this.eventsService.deleteEventbyId(jobName).subscribe(
      (pageResponse) => {
        this.service.message("Deleted!", "success");
        this.telemetry.addTelemetryEvent(jobName + ' Event Deleted');
        this.onRefresh();
      },
      (error) => {
        this.service.message("Could not get the results", 'error');
      }
    );
  }

  displayEventForm() {
    const dialogRef = this.dialog.open(CreateeventComponent, {
      height: "max-content",
      width: "90%",
      minWidth: "70vw",
      disableClose: false,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.type == "build") this.router.navigate([result.data.jobName], { relativeTo: this.route });
      else {
        dialogRef.close();
        this.onRefresh();
      }
    });
  }

  navigateToEvent(entity, mode) {
    // this.telemetry.addTelemetryEvent(entity?.alias+ ' Event viewed ')
    let isEdit = false
    if(mode === 'edit')
       isEdit = true

    const dialogRef = this.dialog.open(CreateeventComponent, {
      height: "max-content",
      width: "90%",
      minWidth: "70vw",
      // maxWidth: '50%',
      disableClose: false,
      data: {
        data: entity,
        editTrue: isEdit
      }
    });
    this.telemetry.addTelemetryEvent(entity?.alias+ ' Event viewed ')
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.type == "build") this.router.navigate([result.data.jobName], { relativeTo: this.route });
      else dialogRef.close();
    });
    this.getInnerJobs();
  }
  getInnerJobs() {
    this.eventsList = [];
    let org = sessionStorage.getItem("organization");
    this.busy = this.eventsService.getEventBySearch(this.tmpSearchText,org, this.pageNumber-1, this.pageSize).subscribe((res) => {
      this.eventsList = res;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
      this._globals.setAPIStatus(false);
    }, err => { this._globals.setAPIStatus(false); });
    this.pageSize = this.pageSize || 6;
    this.updateQueryParam(
      this.pageNumber,
      this.tmpSearchText
    );
  }

  resolveName(details){
    try{
      let json = JSON.parse(details)
      return json[0].name
    }
    catch(Exception){
    this.service.message("Some error occured", "error")
    }

  }

  resolveType(details){
    try{
      let json = JSON.parse(details)
      return json[0].type
    }
    catch(Exception){
    this.service.message("Some error occured", "error")
    }

  }

  getCorrectResponseForSearching() {
    this.busy = this.eventsService.countEvent(this.tmpSearchText).subscribe(
      resp => {
        if (this.searchText != this.tmpSearchText) {
          this.tmpSearchText = this.searchText;
          this.getCorrectResponseForSearching();
        } else {
          this.subSearching(resp);
        }
      }
    )
  }

  subSearching(response) {
    var n: Number = new Number(response);
    this.totalJobs = n.valueOf();
    this.noOfItems = this.totalJobs;
    var remainder = this.totalJobs % this.rows;
    var cof = (this.totalJobs - remainder) / this.rows;
    if (remainder != 0) {
      this.lastPage = cof;
    } else {
      this.lastPage = cof - 1;
    }
    // this.service.message("Fetched successfully", "success");
    if (this.totalJobs !== 0) {
      this.getInnerJobs();
      this.records = false;
    } else {
      this.page = 0;
      this.lastPage = 0;
      this.eventsList = []
      this.records = true;
      this._globals.setAPIStatus(false);
    }
  }

  searching() {
    if (!this._globals.getAPIStatus()) {
      this._globals.setAPIStatus(true);
      this.tmpSearchText = this.searchText;
      this.busy = this.eventsService.countEvent(this.tmpSearchText).subscribe(
        (response) => {
          this.noOfItems = response;
          if (this.searchText != this.tmpSearchText) {
            this.tmpSearchText = this.searchText;
            this.getCorrectResponseForSearching();
          } else {
            this.subSearching(response)
          }
        },
        (error) => {
          this._globals.setAPIStatus(false);
          this.service.message("Could not fetch jobs!",'error');
        }
      );
    }
  }
  goBack() {
    this.router.navigate(["../"], { relativeTo: this.route });
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
    this.viewSubscription.unsubscribe();
    this.busy.unsubscribe();
    let activeSpan = this.telemetry.fetchActiveSpan();
    this.telemetry.endTelemetry(activeSpan);
  }
  
  getJobAlias(name){
    let filteredarray = this.originalPipeline.filter(option => option.name?.toLowerCase() == name?.toLowerCase())
    let alias;
    if(filteredarray && filteredarray.length > 0){
      alias = filteredarray[0]["alias"]
    }
    return alias ? alias : name
  }

  clickactive(eventObj: any) {
    this.ledsLibService.clickactive(eventObj);
  }

  // tagSelectedEvent(event) {
  //   this.selectedEventType = event.getSelectedEventType();
  //   this.refresh();
  // }
  // refresh() {
  //   this.getCards();
  //   this.getCountPipelines();
  //   this.changePage(1)
  // }

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
      this.pageChanged.emit(this.pageNumber);
      if (this.pageNumber > 5) {
        this.endIndex = this.pageNumber;
        this.startIndex = this.endIndex - 5;
      } else {
        this.startIndex = 0;
        this.endIndex = 5;
      }
    }
    this.getInnerJobs();
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
  selectedButton(i){
    if(i==this.pageNumber)
      return {"color": "white","background": "#7b39b1"}
    else
      return {"color":"black"}
  }
  optionChange(event: Event) {
    let i: number = event.target['selectedIndex'];
    this.pageSize = this.itemsPerPage[i];
    this.pageNumber = 1;
    this.getInnerJobs();
  }
  // getCountEvents() {
  //   let params: HttpParams = new HttpParams();
  //   // if (this.selectedTag.length >= 1)
  //   //   params = params.set('tags', this.selectedTag.toString());
  //   // if (this.filter.length >= 1) params = params.set('query', this.filter);
  //   // if (this.selectedAdapterType.length >= 1)
  //   //   params = params.set('type', this.selectedAdapterType.toString());
  //   // if (this.selectedAdapterInstance.length >= 1)
  //   //   params = params.set('instance', this.selectedAdapterInstance.toString());
  //   params = params.set('project', sessionStorage.getItem('organization'));
  //   params = params.set('isCached', false);
  //   this.eventsService.getCountEvents(params).subscribe((res) => {
  //     this.noOfItems = res;
  //   });
  // }
  updateQueryParam(
    page: number = 1,
    search: string = '',
   
    org: string = sessionStorage.getItem('organization'),
    roleId: string = JSON.parse(sessionStorage.getItem('role')).id
  ) {
    const url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          org: org,
          roleId: roleId,
        },
        queryParamsHandling: 'merge',
      })
      .toString();

    this.location.replaceState(url);
  }

}
