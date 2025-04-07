// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-ticketlist',
//   templateUrl: './ticketlist.component.html',
//   styleUrls: ['./ticketlist.component.scss']
// })
// export class TicketlistComponent {

// }
//

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, OnDestroy, Pipe, PipeTransform, Type, Input } from "@angular/core";
import { Router, ActivatedRoute, NavigationStart } from "@angular/router";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { Subscription, Subject, ReplaySubject } from "rxjs";
import { Project } from "com-lib-util";
import { FormControl, FormGroup } from "@angular/forms";
import { filter, takeUntil } from "rxjs/operators";
import { DatePipe } from "@angular/common";
// import { IcmClustersService } from "../../service/icm-clusters.service";
// import { IcmSopsService } from "../../service/icm-sops.service";
// import { IcmProblemTypeService } from "../../service/icm-problem-type.service";
// import { IcmClusters } from "../../models/icm-clusters";
// import { IcmSops } from "../../models/icm-sops";
// import { IcmProblemType } from "../../models/icm-problem-type";
import { saveAs as importedSaveAs } from "file-saver";
import { DashConstantService, DashConstant } from "com-lib-util";
import { LeapTelemetryService } from "com-lib-util";
import { Table } from 'primeng/table';
// import { NgxIndexedDBService } from 'ngx-indexed-db';
// import { LazyLoadEvent, SelectItem } from "primeng/api";
import { Services } from '../services/service';

// import { MessageService } from "../../sharedModule/service/message.service";
import { IncidentsService } from "../itsm/incidents.service";

import { IcmClusters } from "../itsm/icm-clusters";
import { IcmProblemType } from "../itsm/icm-problem-type";

import { ClusterTicketsComponent } from "../cluster-tickets/cluster-tickets.component";
import { SchemaRegistryService } from "../services/schema-registry.service";
import { TicketsService } from "../itsm/tickets.service";
import { EventsService } from "../services/event.service";

import { Location } from '@angular/common';
import { LedsModalService, PaginationModule } from 'leds-lib';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

export type ChartOptions = {
  series: any;
  chart: any;
  dataLabels: any;
  markers: any;
  title: any;
  fill: any;
  yaxis: any;
  xaxis: any;
  tooltip: any;
  stroke: any;
  annotations: any;
  colors: any;
  plotOptions: any;
  grid:any;
  legend:any
  noData:any
};

@Component({
  selector: 'app-ticketlist',
    templateUrl: './ticketlist.component.html',
     styleUrls: ['./ticketlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketlistComponent implements OnInit, OnDestroy {
 @ViewChild("chart", { static: false }) chart: any;
  public chartOptions: Partial<ChartOptions>;
  public activeOptionButton = "all";
  filterDate: Date = new Date();
  public updateOptionsData = {
    "month": {
      xaxis: {
        min: new Date(this.filterDate.getFullYear(), this.filterDate.getMonth() - 1, this.filterDate.getDay()).getTime(),
        max: new Date().getTime(),
        labels:{
          format:'dd MMM yy'
        }
      },
      tooltip: {
        enabled:true,
        x: {
          format: "dd MMM yyyy"
        }
      }
    },
    "three_year": {
      xaxis: {
        min: new Date(this.filterDate.getFullYear() - 3, this.filterDate.getMonth(), this.filterDate.getDay()).getTime(),
        max: undefined,
        labels:{
          format:'MMM yy'
        }
      },
      tooltip: {
        enabled:true,
        x: {
          format: "MMM yyyy"
        }
      }
    },
    "year": {
      xaxis: {
        min: new Date(this.filterDate.getFullYear(), this.filterDate.getMonth()-12, this.filterDate.getDay()).getTime(),
        max: new Date().getTime(),
        labels:{
          format:'MMM yy'
        }
      },
      tooltip: {
        enabled:true,
        x: {
          format: "MMM yyyy"
        }
      }
    },
    all: {
      xaxis: {
        min: new Date(this.filterDate.getFullYear() - 10, this.filterDate.getMonth(), this.filterDate.getDay()).getTime(),
        max: new Date().getTime(),
        labels:{
          format:'yyyy'
        }
      },
      tooltip: {
        enabled:true,
        x: {
          format: "yyyy"
        }
      }
    }
  };
  searchToggle: boolean = true;
  pp: Object[] = [];
  pp1: Object[]=[];
  pp2: Object[]=[];
  busy: Subscription;
  @Input() itsm: boolean = false;
  @Input() itsmRelatedTicket: any =null;
  graphBusy:Subscription;
  selectedUserType: string = "All";
  selectedPriority: string = "";
  selectedStatus: string = "";
  searchFromDateChange;
  searchToDateChange;
  user_name: any = JSON.parse(sessionStorage.getItem("user"));
  dashboardName: string;
  searchIncident: any;
  filterIncident: any = {};
  length: number;
  defaultStateArray = ["New", "In Progress", "On Hold", "Resolved", "Open", "Closed", "Canceled", "Verified", "Manual Review"];
  defaultPriorityArray = ["1 - Critical", "2 - High", "3 - Moderate", "4 - Low", "5 - Pending"];
  priorityArray = [];
  stateArray = [];
  ticketList: any[] = [];
  showList: boolean = true;
  pgChng: any;
  numberSearch: any = "";
  totalElements: number = 0;
  fetchCompleted: boolean = true;
  showAddTag: boolean = false;
  incidentsToBeTagged: any[] = [];
  callersArray = [];
  configurationItemArray = [];
  assignmentGroupArray = [];
  assigneeArray = [];
  categoryArray = [];
  impactArray = [];
  urgencyArray = [];
  ticketTypeArray: string[] = ["Incident"]; //,"Service Request","Change Request"
  selectedTicketType: string = "";
  searchParamsArray: string[] = [
    "Number",
    "Short Description",
    "Description",
    "State",
    "Priority",
    "Creation Date",
    "Closed Date",
    "Assigned To"
  ];
  searchReady: boolean = false;
  resetReady: boolean = false;
  selectedType: string = "Incident";
  viewSelectedType: string;
  searchParamList: string[] = ["Number"];
  searchedParamList: string[] = ["Number"];
  searchValueArray: string[][] = [[""], [""]];
  searchFromDate;
  searchToDate;
  oldSortEvent: any = "";
  sortEvent: any = "createdDate";
  sortorder = -1;
  sortEnabled = false;
  icmClusterArray: IcmClusters[] = [];
  icmSopArray: IcmClusters[] = [];
  icmProblemTypeArray: IcmClusters[] = [];
  enableFilter: boolean = false;
  paramForSearch: string = "Number";
  searchParam: string = "Number";
  valueOfInput: string = "";
  valueOfState: string = "All";
  valueOfPriority: string = "All";
  valueOfFromDate: any;
  valueOfToDate: any;
  searchExample: any;
  typesList: any[] = ["configurationItem", "category", "assignmentGroup", "assignee", "caller", "impact", "urgency", "state", "priority"]
  // snowConfigured: any = false;
  prioritylist: string[] = ["1 - Critical", "2 - High", "3 - Moderate", "4 - Low", "5 - Planning"];
  statelist: String[] = ["New", "In Progress", "Closed"];
  comparingCondition: string = "";
  secondaryColourCondition: string = "";
  datasetName: string = "";
  schemaName: string = "";
  typingTimer: any;
  doneTypingInterval: number = 2000;
  ticketListBackup: any[] = [];
  downloadErrorLog: string = "";
  apiCount: number = 0;
  chunkSize: number = 0;
  csvData: string[] = [];
  downloading: boolean = false;
  downloadPercentage: number = 0;
  cancelDownload: boolean = false;
  msHvr: boolean = false;
  selectedTickets: any[] = [];
  selectedTicketObj: any[] = [];
  checkedTickets: any[] = [];
  lastRefreshDate: any = "";
  goToPage: number;
  HighlightColor: boolean = false;
  storeName:string = "ticketData";
  paginatorFirstRow: number = 0;

  columnNamesList: string[] = [];
  columnHeadersList: string[] = [];
  showColumnSelector: boolean = false;
  showAllSltdTkts: boolean = false;
  displayTableFilters: boolean = true;
  minColsCountReached: boolean = false;
  maxColsCountReached: boolean = false;
  bsyGtngDwnldCnt: boolean = false;
  allTktsSltd: boolean = false;
  includeIdsToTag: any[] = [];
  excludeIdsToTag: any[] = [];
  numberOfDisplay: number = 7;
  directionLinks : boolean = true;
  powerMode: boolean = false;
  powerModeFetch:boolean = true;
  pmSearch: any = {};

  page = 0;
  pageIndex = 1;
  lastPage = 0;
  rows = 10;
  grphbtn: boolean = false;
  enableGraph: boolean = false;
  graphLoaded:boolean = false;
  dataList: any[] = [];
  dataRetriever:boolean = true;
  viewIncident:any;
  selectedTicket:any;
  powerModeTicketList:any[] = [];
  configureGraph:boolean = false;



  cols: any[] = [];
  colsBackup: any[] = [];
  columnNames: any[] = [];
  initialColumnList: any[] = [];
  chooseColumn: boolean = false;
  datasetList: any = {}
  fmFlrDsb: boolean = false;
  chartData: Map<string,any[]> = new Map();
  ticketTypeList: string[] = ["Incident", "ChangeRequest", "ServiceRequest","Task"]
 priorityList : string[] = ["P1", "P2", "P3"]
  typeAction: string = "All";
  dateAction: string = "all"
  priorityAction: string = "all";
  dataMapper: any[] = [];
  filteredInputColumns: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  inputColumnCtrl = new FormControl();
  inputColumnFilterCtrl = new FormControl();
  // table variables
  search: any;
  selectAllColsToDwnld: boolean = false;
  colsToDownload: string[] = [];
  datasetsCount: number;
  selectedDatasetsCount: Number = 0;
  allIdsSelected: boolean = false;
  excludeIdsFromSelected: string[] = [];
  includeIdsFromSelected: string[] = [];
  includeIdsToSelected: string[] = [];
  searchIncidentObj = {};
  icmdatasetList=[];
  icmdatasetname: string = "";
  datasetschema: string = "";
  icmTicketConstants: any = {};
  icmschemaList=[];
  downloadChunkSize: string = "";
  defaultColumns: string = "";

  protected _onDestroy = new Subject<void>();
  filterForm = new FormGroup({
    fromCreationDate: new FormControl(),
    toCreationDate: new FormControl(),
    fromClosedDate: new FormControl(),
    toClosedDate: new FormControl(),
  });

  @ViewChild('dt', { static: false })
  private table: Table;
  selectedColumn: string;
  powerModeInputValue: any;
  noData: any;
  andObj = { "and": [] };
  busy11: Subscription;
  relatedticket: any;
  relatedTicketsDataArray: any;
  event_status: string = '';
  avail_refresh: boolean = true;
  get fromCreationDate(): any {
    return this.filterForm.get("fromCreationDate");
  }
  get toCreationDate(): any {
    return this.filterForm.get("toCreationDate");
  }
  get fromClosedDate(): any {
    return this.filterForm.get("fromClosedDate");
  }
  get toClosedDate(): any {
    return this.filterForm.get("toClosedDate");
  }

  displayNameMapping = [
    { "property": "number", "displayValue": "Number" },
    { "property": "shortdescription", "displayValue": "Short Description" },
    { "property": "assignmentgroup", "displayValue": "Assignment Group" },
    { "property": "assignedto", "displayValue": "Assigned To" },
    { "property": "caller", "displayValue": "Caller" },
    { "property": "category", "displayValue": "Category" },
    { "property": "createdby", "displayValue": "Created By" },
    { "property": "closecode", "displayValue": "Close Code" },
    { "property": "closedby", "displayValue": "Closed By" },
    { "property": "configurationItem", "displayValue": "Configuration Item" },
    { "property": "configurationitem", "displayValue": "Configuration Item" },
    { "property": "closenotes", "displayValue": "Close Notes" },
    { "property": "closedDate", "displayValue": "Closed Date" },
    { "property": "closeddate", "displayValue": "Closed Date" },
    { "property": "comments", "displayValue": "Comments" },
    { "property": "createdDate", "displayValue": "Created Date" },
    { "property": "createddate", "displayValue": "Created Date" },
    { "property": "duedate", "displayValue": "Due Date" },
    { "property": "description", "displayValue": "Description" },
    { "property": "duration", "displayValue": "Duration" },
    { "property": "impact", "displayValue": "Impact" },
    { "property": "incidentstate", "displayValue": "Incident State" },
    { "property": "madesla", "displayValue": "Made SLA" },
    { "property": "openedDate", "displayValue": "Opened Date" },
    { "property": "openedby", "displayValue": "Opened By" },
    { "property": "priority", "displayValue": "Priority" },
    { "property": "resolved", "displayValue": "Resolved" },
    { "property": "resolvedby", "displayValue": "Resolved By" },
    { "property": "resourcepath", "displayValue": "Resource Path" },
    { "property": "resolvedDate", "displayValue": "Resolved Date" },
    { "property": "reopenedDate", "displayValue": "Reopened Date" },
    { "property": "state", "displayValue": "State" },
    { "property": "icapStatus", "displayValue": "ICAP Status" },
    { "property": "severity", "displayValue": "Severity" },
    { "property": "subcategory", "displayValue": "Subcategory" },
    { "property": "sysid", "displayValue": "System ID" },
    { "property": "sladueDate", "displayValue": "SLA Due Date" },
    { "property": "timeworked", "displayValue": "Time Worked" },
    { "property": "updatedby", "displayValue": "Updated By" },
    { "property": "updatedDate", "displayValue": "Updated Date" },
    { "property": "updateddate", "displayValue": "Updated Date" },
    { "property": "incidentsubstate", "displayValue": "Incident Substate" },
    { "property": "firstServiceCommunicationDate", "displayValue": "First Service Communication Date" },
    { "property": "assignedDate", "displayValue": "Assigned Date" },
    { "property": "resolutionCategory", "displayValue": "Resolution Category" },
    { "property": "resolutionsteps", "displayValue": "Resolution Steps" },
    { "property": "additionalComments", "displayValue": "Additional Comments" },
    { "property": "resolveTime", "displayValue": "Resolve Time" },
    { "property": "businessRestoredUpdateMissingLT24Hrs", "displayValue": "Business Restored Update Missing < 24 Hrs" },
    { "property": "businessRestoredUpdateMissingGT24hoursLT48", "displayValue": "Business Restored Update Missing > 24 Hours And < 48 Hours" },
    { "property": "slaabouttobreachinanother30mins", "displayValue": "SLA About To Breach In Another 30 Mins" },
    { "property": "slaabouttobreachinanother60mins", "displayValue": "SLA About To Breach In Another 60 Mins" },
    { "property": "incorrectQueueAssignmentResolved", "displayValue": "Incorrect Queue Assignment Resolved" },
    { "property": "incorrectPriorityAssignmentResolved", "displayValue": "Incorrect Priority Assignment Resolved" },
    { "property": "weekendticketsInflowART", "displayValue": "Weekend Tickets In-flow ART" },
    { "property": "weekendticketsOutflowART", "displayValue": "Weekend Tickets Out-flow ART" },
    { "property": "abouttobreachModerateandHighSLAAlertL1Resolution", "displayValue": "About To Breach Moderate And High SLA Alert L1 Resolution" },
    { "property": "abouttobreachModerateandHighSLAAlertL2Resolution", "displayValue": "About To Breach Moderate And High SLA Alert L2 Resolution" },
    { "property": "abouttobreachLowSLAAlertL1Resolution", "displayValue": "About To Breach Low SLA Alert L1 Resolution" },
    { "property": "abouttobreachLowSLAAlertL2Resolution", "displayValue": "About To Breach Low SLA Alert L2 Resolution" },
    { "property": "slaBreachedfortheday", "displayValue": "SLA Breached For The Day" },
    { "property": "incorrectassignedQueue", "displayValue": "Incorrect Assigned Queue" },
    { "property": "agingModerateticketsGT2days", "displayValue": "Aging Moderate Tickets > 2 Days" },
    { "property": "geographicalArea", "displayValue": "Geographical Area" },
    { "property": "inputJson", "displayValue": "Input JSON" },
    { "property": "isActive", "displayValue": "Is Active" },
    { "property": "isProcessed", "displayValue": "Is Processed" },
    { "property": "resolvedOutSideICAP", "displayValue": "Resolved Out Side ICAP" },
    { "property": "weekendticketsOutflowARF", "displayValue": "Weekend Tickets Out-flow ARF" },
    { "property": "weekendticketsInflowARF", "displayValue": "Weekend Tickets In-flow ARF" },
    { "property": "escalationCount", "displayValue": "Escalation Count" },
    { "property": "projectid", "displayValue": "Project ID" },
    { "property": "taskType", "displayValue": "Task Type" },
    { "property": "lastupdated", "displayValue": "Last Updated" },
    { "property": "shortdescriptionClusterName", "displayValue": "Short Description Cluster Name(Auto Assigned)" },
    { "property": "shortdescriptionClusterManual", "displayValue": "Short Description Cluster Name(Manually Assigned)" },
    { "property": "resolutionStepsClusterName", "displayValue": "Resolution Steps Cluster Name(Auto Assigned)" },
    { "property": "resolutionStepsClusterManual", "displayValue": "Resolution Steps Cluster Name(Manually Assigned)" },
    { "property": "type", "displayValue": "Type" },
    { "property": "crtype", "displayValue": "Change Request Type" },
    { "property": "risk", "displayValue": "Risk" },
    { "property": "openedBy", "displayValue": "Opened By" },
    { "property": "requestedFor", "displayValue": "Requested For" },
    { "property": "requestState", "displayValue": "Request State" },
    { "property": "dueDate", "displayValue": "Due Date" },
    { "property": "price", "displayValue": "Price" },
    { "property": "requestedBy", "displayValue": "Requested By" },
    { "property": "specialInstructions", "displayValue": "Special Instructions" },
    { "property": "problemType", "displayValue": "Problem Type" },
    { "property": "sop", "displayValue": "SOP" },
    { "property": "urgency", "displayValue": "Urgency" },
    { "property": "contactType", "displayValue": "Contact Type" }
  ]

  constructor(
    private telemetryService: LeapTelemetryService,
    public datepipe: DatePipe,
    public router: Router,
    public ticketsService: TicketsService,
    // public messageService: MessageService,
    private service: Services,
    public incidentsService: IncidentsService,
    private route: ActivatedRoute,
    private modalService: LedsModalService,
    private changeDetectorRefs: ChangeDetectorRef,
    public dialog: MatDialog,
    // public icmClusterService: IcmClustersService,
    // public icmSopService: IcmSopsService,
    // public icmProblemTypeService: IcmProblemTypeService,
    private dashConstantService: DashConstantService,
    // private dbService: NgxIndexedDBService,
    public schemaService:SchemaRegistryService,
    private eventsService: EventsService,
    private location: Location
  ) {
    this.getSourceApiParameters();
  }

  ngOnInit() {
    // this.route.url.subscribe((url) => {
    //   const path = this.router.url;
    //   if(path.includes('incident')) this.selectedType = 'Incident';
    //   else if(path.includes('changeRequest')) this.selectedType = 'ChangeRequest';
    //   else if(path.includes('serviceRequest')) this.selectedType = 'ServiceRequest';
    //   else if(path.includes('task')) this.selectedType = 'Task';
    //   else if(path.includes('alerts')) this.selectedType = 'Alerts';
    //   else this.selectedType = 'Incident';
    // });
    let params = {}
    let queryparams={};
    this.updateQueryParam(queryparams);
    this.pp=[];
    this.pp1=[];
    this.pp2=[];
    try{
      // this.refreshTicket()
     this.p1();
      this.k1();
      this.telemetryImpression();
      this.setIncidentType();
          var dash: DashConstant = new DashConstant();
          dash.keys = "ICMQueryDatasets";
          let project = new Project();
          project = JSON.parse(sessionStorage.getItem("project"));
          dash.project_name = project.name;
          this.busy = this.dashConstantService
            .findAll(dash, { first: 0, rows: 1, sortField: null, sortOrder: 1 })
            .subscribe((res) => {
              if (res && res.content && res.content[0]) {
                this.datasetList = JSON.parse(res.content[0].value)
              }
              else {
                
                this.service.message('ICMQueryDatasets key not found in mappings', 'error');
              }
            }, error => { 
            this.service.message('Error in getting ICMQueryDatasets key in mappings', 'error');
            
          
          },
              () => {
                // this.fetchToolMetadata();
              })
          console.log("tag")
          this.fetchTaggingDetails();
        // }
      // );
      this.inputColumnFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
        this.filterInputColumns();
      });
      this.router.events.pipe(
      filter((event) => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        let urlLastFragment:any;
        if(this.incidentsService.getUrl())
          urlLastFragment = this.incidentsService.getUrl().split("/").reverse()[0];
        if(!event.url.includes("create-ticket") && !event.url.includes("tickets/"+urlLastFragment)){
          sessionStorage.removeItem("failureDashboardToTickets");
        }
        if(this.router.url.includes("create-ticket") && event.url.includes("tickets")){
          this.incidentsService.setCurrentUrl(event.url);
          this.incidentsService.setPreviousUrl(this.router.url);
        }
        else if(this.router.url.includes("tickets") && event.url.includes("create-ticket")){    
          if(this.router.url && this.router.url.includes("?"))
            this.incidentsService.setUrl(this.router.url.substring(0,this.router.url.indexOf("?")));
          else
            this.incidentsService.setUrl(this.router.url);
        }
      });
      this.searchIncident = {};
      this.initChart();
    }
    catch(Exception){
   
    this.service.message('Some error occured', 'error');
    
    
    }
    this.searchIncidentObj = {};
    this.getDatasetList();
    this.getICMTicketConfig();
    this.refreshJobStatus()
  }
  refreshJobStatus() {
    this.busy = this.eventsService.getEventByName("refreshTickets").subscribe((eventRes) => {
      let jobdetails = JSON.parse(eventRes.jobdetails);
      if(jobdetails[0].last_refresh_status){
        if(jobdetails[0].last_refresh_status == 'RUNNING'){
          // this.evt_flag = true
          this.service.getEventStatus(jobdetails[0].last_refresh_event).subscribe(
            status => {
              this.event_status = status
              jobdetails[0]["last_refresh_status"] = this.event_status
              eventRes.jobdetails = JSON.stringify(jobdetails)
              this.busy = this.eventsService.createEvent(eventRes).subscribe((response) => {
                this.avail_refresh = true;
              },
                error => {this.service.message('Event not updated due to error: ' + error,'error')
                this.avail_refresh = true;
                }
              );
            });
        }else{
          this.event_status = jobdetails[0].last_refresh_status
        }
      }else{
        this.event_status = ''
      }
  });
  }

  updateQueryParam(params: any) {
    const queryParams = {
      ...params
    };

    const url = this.router
      .createUrlTree([], {
        queryParams,
        queryParamsHandling: 'merge',
      })
      .toString();

    this.location.replaceState(url);
  }
  p1(){
    let project = JSON.parse(sessionStorage.getItem("project"));
    let projName = project.name;
    let pagination: any = { page: 0, size: 100 };
    let example = {};
    let obj = [{"or":{ "property": "number", "equality": "=", "value": this.itsmRelatedTicket }}];
    example["and"] = obj ;
    this.service.searchTicketsUsingDataset1("ACMTCKTS76661", projName, pagination, example)
    .subscribe(
     
      (pageResponse) => { 
        console.log("res2:llll",pageResponse);
        let z1 = pageResponse[0].post_ranking_cluster;
        if(z1) {
          obj = [{"or":{ "property": "post_ranking_cluster", "equality": "=", "value": z1 }}];
        example["and"] = obj ;
          this.service.searchTicketsUsingDataset1("ACMTCKTS76661", projName, pagination, example)
    .subscribe(
     
      (pageResponse) => { 
        console.log("res2:llll",pageResponse);

       if (typeof pageResponse == "string") {        
        this.service.message(pageResponse, 'error');
      }
      else {
        let numberArr = pageResponse.map(element => element.number);
        numberArr.forEach((number) => {
          // ------------------ 1 ------------------
          let project = JSON.parse(sessionStorage.getItem("project"));
  let projName = project.name;
  let pagination: any = { page: 0, size: 100 };
  let example = {};
  let obj = [{"or":{ "property": "number", "equality": "=", "value": number }}];
  example["and"] = obj ;
  this.service.searchTicketsUsingDataset1("Tickets", projName, pagination, example)
  .subscribe(
    
    (pageResponse) => { console.log("res2:",pageResponse);
      if (typeof pageResponse == "string") {
        
        this.service.message(pageResponse, 'error');
      }
      else {
        let resultObject = {
          number: pageResponse[0].number,
          ShortDescription: pageResponse[0].shortdescription,
          ConfigurationItem: pageResponse[0].configurationItem,
          CloseNotes: pageResponse[0].closenotes
        };
        if (!this.relatedTicketsDataArray) {
          this.relatedTicketsDataArray = [];
        }
        this.relatedTicketsDataArray.push(resultObject);
      }
    },
    (error) => {
      this.fetchCompleted = false;
    
      this.service.message('Could not get the results', 'error');
      
      this.ticketList = this.ticketListBackup;
    }
  );
          // ------------------ 2 ------------------
        });
      }
       
      },
      (error) => {
        this.fetchCompleted = false;
     
        this.service.message('Could not get the results', 'error');
       
        this.ticketList = this.ticketListBackup;
      }
    );
        }
       
      },
      (error) => {
        this.fetchCompleted = false;
     
        this.service.message('Could not get the results', 'error');
       
        this.ticketList = this.ticketListBackup;
      }
    );

  }

 k1(){
  let ss = {
    viewValue: 'All',
    value: 'all'
  };
  let ss1 = {
    viewValue: 'Month',
    value: 'Month'
  };
  let ss2 = {
    viewValue: 'Year',
    value: 'Year'
  };
  this.pp.push(ss);
  this.pp.push(ss1);
  this.pp.push(ss2);
  this.pp1.push(ss);
this.pp2.push(ss);
this.ticketTypeList.forEach((cat)=>{
  let ss = {
    viewValue: cat,
    value: cat
  };
  this.pp1.push(ss);

});
this.prioritylist.forEach((cat)=>{
  let ss = {
    viewValue: cat,
    value: cat
  };
  this.pp2.push(ss);

});
 }

  telemetryImpression() {
    this.telemetryService.impression("iamp-icm", "list", "TicketsListComponent");
  }

  initializeDefaultColumns(defaultColumnsList) {
    var tmpList = defaultColumnsList.split(",");
    tmpList.forEach((element) => {
      this.initialColumnList.push(element.toString().trim());
    });
  }

  filterInputColumns() {
    if (!this.cols) {
      return;
    }
    let search = this.inputColumnFilterCtrl.value;
    if (!search) {
      this.filteredInputColumns.next(this.columnNames.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredInputColumns.next(this.columnNames.filter((d) => d.toLowerCase().indexOf(search) > -1));
  }

  assignInitialColumn() {
    let tmpValue = Object.assign(
      [],
      this.inputColumnCtrl.value != undefined && this.inputColumnCtrl.value != null ? this.inputColumnCtrl.value : []
    );
    this.initialColumnList.forEach((col) => {
      if (tmpValue.indexOf(col) < 0) {
        tmpValue = [...tmpValue, col];
      }
    });
    this.inputColumnCtrl.setValue(tmpValue);
  }

  onInputColumnChange() {
    this.assignInitialColumn();
    this.cols.forEach((col) => {
      if (this.inputColumnCtrl.value.indexOf(col.header) > -1) {
        col.visible = true;
      } else {
        col.visible = false;
      }
    });
  }

  toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  createColumn() {
    this.assignInitialColumn();
    //
    // Object.keys(this.ticketList[0]).forEach((key) => {
    this.columnNamesList.forEach((key) => {
      var header;
      // for (let i = 0; i < this.displayNameMapping.length; i++) {
      //   if (this.displayNameMapping[i]["property"] == key) {
      //     if (this.displayNameMapping[i]["displayValue"]) {
      //       header = this.displayNameMapping[i]["displayValue"];
      //       break;
      //     }
      //   }
      // }
      header = this.columnHeadersList[this.columnNamesList.indexOf(key)];
      if (this.columnNames.indexOf(header) < 0) {
        this.columnNames.push(header);
        var col = {};
        col["field"] = key;
        col["header"] = header;
        col["visible"] =
          this.inputColumnCtrl.value != undefined && this.inputColumnCtrl.value != null
            ? this.inputColumnCtrl.value.indexOf(header) > -1
            : false;
        col["filterValue"] = null;
        this.cols.push(col);
      } else {
        this.cols[this.columnNames.indexOf(header)]["field"] = this.cols[this.columnNames.indexOf(header)]["field"]
          .toString();
      }
    });

    this.cols.forEach(item => this.colsBackup.push(Object.assign({},item)));
    console.log("value of col:",this.cols);
    // this.cols = [
    //     { field: 'number', header: 'Number', visible: true },
    //     { field: 'shortdescription', header: 'Description', visible: true },
    //     { field: 'createdDate', header: 'Creation Date', visible: true },
    //     { field: 'sop', header: 'SOP', visible: true },
    //     {field: 'sladueDate', header: 'SLA Due Date', visible: true},
    //     {field: 'state', header: 'State', visible: true}
        
        
    // ];

  }

  radioChange() {
    if (this.selectedUserType == "My") {
      let assignedToIndex = this.searchParamsArray.indexOf("Assigned To");
      this.searchParamsArray.splice(assignedToIndex, 1);
      if (this.searchedParamList.includes("Assigned To")) {
        let assignedToInd = this.searchedParamList.indexOf("Assigned To");
        this.searchedParamList.splice(assignedToInd, 1);
        if (this.searchedParamList.length == 0) {
          this.searchedParamList.push("Number");
        }
      }
    }
    else if (this.selectedUserType == "All") {
      this.searchParamsArray.push("Assigned To");
    }
    this.refreshTicket();
  }
  resetSelection() {
    this.allIdsSelected = false;
    this.selectedTickets = [];
    this.includeIdsToSelected = [];
    this.excludeIdsFromSelected = [];
  }

  
  refreshTickets(){
    try{
      // this.table.reset();
      // let project: Project = JSON.parse(sessionStorage.getItem("project"));
      // let param = "{projectId:" + project.id + "}";
      // this.busy = this.service.triggerEvent(param, "refreshTickets").subscribe(
      //   (response) => { },
      //   (error) => { }
      // );
      
  // let updateEventName = "refreshTickets";

  // this.busy = this.eventsService.getEventByName(updateEventName).subscribe((eventRes) => {
  //   let jobdetails = JSON.parse(eventRes.jobdetails);
  //   let selectedRunType = jobdetails[0].runtime;

  //   this.busy = this.eventsService.triggerEvent(updateEventName, "{}", selectedRunType['dsName']).subscribe((res) => {
  //     this.service.message("Job Triggered Successfully", 'success');

  //   }, error => this.service.message('Job not triggered due to error: ' + error, 'error'));

  // }, error => this.service.message('Job not triggered due to error: ' + error, 'error'));
 

    //   this.selectedTickets = [];
    //   this.resetTicketsSelection();
    //   this.lastRefreshDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy hh:mm:ss a");
    //  this.refreshTicket();
    this.selectedTickets = [];
    this.lastRefreshDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy hh:mm:ss a");
    this.resetTicketsSelection();
    this.refreshTicket(); 
    console.log("value of cols is",this.cols);
    
    }
    catch(Exception){
      this.service.message('Some error occured', 'error');
    }
  

  }
  // refresh() {
  //   try{
  //     // this.table.reset();
  //     // let project: Project = JSON.parse(sessionStorage.getItem("project"));
  //     // let param = "{projectId:" + project.id + "}";
  //     // this.busy = this.service.triggerEvent(param, "refreshTickets").subscribe(
  //     //   (response) => { },
  //     //   (error) => { }
  //     // );
      
  // let updateEventName = "refreshTickets";

  // this.busy = this.eventsService.getEventByName(updateEventName).subscribe((eventRes) => {
  //   let jobdetails = JSON.parse(eventRes.jobdetails);
  //   let selectedRunType = jobdetails[0].runtime;

  //   this.busy = this.eventsService.triggerEvent(updateEventName, "{}", selectedRunType['dsName']).subscribe((res) => {
  //     this.service.message("Job Triggered Successfully", 'success');

  //   }, error => this.service.message('Job not triggered due to error: ' + error, 'error'));

  // }, error => this.service.message('Job not triggered due to error: ' + error, 'error'));
 

  //   //   this.selectedTickets = [];
  //   //   this.resetTicketsSelection();
  //   //   this.lastRefreshDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy hh:mm:ss a");
  //   //  this.refreshTicket();
  //   this.selectedTickets = [];
  //   this.lastRefreshDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy hh:mm:ss a");
  //   this.resetTicketsSelection();
  //   this.refreshTicket(); 
  //   console.log("value of cols is",this.cols);
    
  //   }
  //   catch(Exception){
  //     this.service.message('Some error occured', 'error');
  //   }
  
  // }

  refresh(){
    try{
      // this.table.reset();
      // let project: Project = JSON.parse(sessionStorage.getItem("project"));
      // let param = "{projectId:" + project.id + "}";
      // this.busy = this.service.triggerEvent(param, "refreshTickets").subscribe(
      //   (response) => { },
      //   (error) => { }
      // );
  this.avail_refresh = false;
  let updateEventName = "refreshTickets";

  this.busy = this.eventsService.getEventByName(updateEventName).subscribe((eventRes) => {
    let jobdetails = JSON.parse(eventRes.jobdetails);
    let selectedRunType = jobdetails[0].runtime;
    // this.event_status = 'RUNNING'
    if(jobdetails[0].last_refresh_status && jobdetails[0].last_refresh_status == 'RUNNING'){
      // this.evt_flag = true
      this.service.getEventStatus(jobdetails[0].last_refresh_event).subscribe(
        status => {
          this.event_status = status
          jobdetails[0]["last_refresh_status"] = this.event_status
          eventRes.jobdetails = JSON.stringify(jobdetails)
          this.busy = this.eventsService.createEvent(eventRes).subscribe((response) => {
            this.avail_refresh = true;
          },
            error => {this.service.message('Event not updated due to error: ' + error,'error')
            this.avail_refresh = true;
            }
          );
        });
      // this.event_status = jobdetails[0].last_refresh_status
    }else{
      this.busy = this.eventsService.triggerEvent(updateEventName, "{}", selectedRunType['dsName']).subscribe((res) => {
        // this.evt_flag = true
        this.event_status = 'RUNNING'
        jobdetails[0]["last_refresh_event"] = res
        this.service.message("Job Triggered Successfully", 'success');
        this.service.getEventStatus(res).subscribe(
          status => {
            this.event_status = status
            jobdetails[0]["last_refresh_status"] = this.event_status
            eventRes.jobdetails = JSON.stringify(jobdetails)
            this.busy = this.eventsService.createEvent(eventRes).subscribe((response) => {
              this.avail_refresh = true;
            },
              error => {
                this.service.message('Event not updated due to error: ' + error,'error')
                this.avail_refresh = true;
              }
            );
          });
  
      }, error => {
        this.service.message('Job not triggered due to error: ' + error, 'error')
        this.avail_refresh = true;
      }
      );
    }
  }, error => {
    this.service.message('Job not triggered due to error: ' + error, 'error')
    this.avail_refresh = true;
  });
 

    //   this.selectedTickets = [];
    //   this.resetTicketsSelection();
    //   this.lastRefreshDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy hh:mm:ss a");
    //  this.refreshTicket();
    this.selectedTickets = [];
    this.lastRefreshDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy hh:mm:ss a");
    this.resetTicketsSelection();
    this.refreshTicket(); 
    console.log("value of cols is",this.cols);
    
    }
    catch(Exception){
      this.service.message('Some error occured', 'error');
    }
  
  }

  refreshTicket(decodedSPrList?:any[],decodedSValList?:any[]) {
    try{
      if(sessionStorage.getItem("failureDashboardToTickets") == "True"){
        this.fmFlrDsb = true;
        this.dashboardName = JSON.parse(sessionStorage.getItem("tempDashboard")).appname;
      }
      // this.storeTaggingData();
      this.createColumn();
      this.enableFilter = false;
      this.showAddTag = false;
      this.sortEnabled = false;
      this.oldSortEvent = this.sortEvent;
      this.paramForSearch = "Number";
      this.searchParam = "Number";
      this.valueOfInput = "";
      this.searchIncidentObj = {};
      this.numberSearch = "";
      this.valueOfPriority = "";
      this.valueOfState = "";
      this.valueOfFromDate = "";
      this.valueOfToDate = "";
      this.ticketList = [];
      let example = {};
      this.pageIndex=1;
      let project = new Project();
      this.searchIncident = null;
      this.filterIncident = {};
      this.page = 0;
      this.goToPage = null;
      this.paginatorFirstRow = 0;
      project = JSON.parse(sessionStorage.getItem("project"));
      // example['projectid'] = project.id;
      let obj = [{"or":{ "property": "type", "equality": "like", "value": this.selectedType }}];
      example["and"] = obj 
      let previousUrl = this.incidentsService.getPreviousUrl();
      let currentUrl = this.incidentsService.getCurrentUrl();
      let projName: string = project.name;
      let pagination = { 'page': this.page, 'size': this.rows, 'sortEvent': this.sortEvent, 'sortOrder': this.sortorder }
      let urlLastFragment:any;
      if(this.incidentsService.getUrl())
        urlLastFragment = this.incidentsService.getUrl().split("/").reverse()[0];
      // if (this.selectedUserType == "My") {
      //   example['assignedto'] = this.user_name.user_login;
      // }
      if(decodedSPrList && decodedSValList){
        decodedSPrList.forEach((param,index) => {
          let decodedCol = this.cols.filter(ele=>{
            if(ele['field']) return ele['field'].toLowerCase() == param.toLowerCase();
          });
          decodedCol = decodedCol[0];
          if(decodedCol && decodedCol['field'] && decodedSValList[index]){
            if(Array.isArray(decodedSValList[index])){
              let filterValueList = decodedSValList[index];
              let objList = [];
              filterValueList = filterValueList.map(ele => ele.trim()).filter(ele => ele != "");
              filterValueList.forEach(ele => {
                objList.push({ "property": decodedCol['field'], "equality": "like", "value": ele })
              });
              example["and"].push({"or":objList})
            } 
            else{
              example["and"].push({"or":{ "property": decodedCol['field'], "equality": "like", "value": decodedSValList[index] }})
            }  
            if(decodedCol['field'].toLowerCase()!="type" && decodedCol['field'].toLowerCase()!="projectid"){
              decodedCol['visible'] = true;
              if(Array.isArray(decodedSValList[index])) decodedCol['filterValue'] = decodedSValList[index].toString();
              else  decodedCol['filterValue'] = decodedSValList[index];
            }
          }
        })
    
        this.searchIncident = example;
        this.colsBackup.forEach(item => {
          let matchingCol = this.cols.filter(ele=>item['header']==ele['header'])[0];
          if(matchingCol) matchingCol['field'] = item['field'];
        });
        //
      }
      // else if(previousUrl && previousUrl.includes("create-ticket") && currentUrl && currentUrl.includes("tickets/"+urlLastFragment)){
      //   let preservedObjects = this.incidentsService.getSearchFilterExample();
      //   this.selectedTickets = preservedObjects['selectedTickets'];
      //   let searchFilterExample = preservedObjects['searchExample'];
      //   let exWthLwrCsKys = {};
      //   if(searchFilterExample){
      //     Object.keys(searchFilterExample).forEach(ele=>{
      //       exWthLwrCsKys[ele.toLowerCase()] = searchFilterExample[ele];
      //     })
      //     Object.keys(exWthLwrCsKys).forEach(param => {
      //       let decodedCol = this.cols.filter(ele=>{
      //         if(ele['field']) return ele['field'].toLowerCase() == param.toLowerCase();
      //       })
      //       decodedCol = decodedCol[0];
      //       if(decodedCol && decodedCol['field']){
      //         let decColLwrCs = Object.assign({},decodedCol);
      //         decColLwrCs['field'] = decColLwrCs['field'].toLowerCase();
      //         if(exWthLwrCsKys[decColLwrCs['field']]){
      //           if(Array.isArray(exWthLwrCsKys[decColLwrCs['field']])) example[decodedCol['field']] = exWthLwrCsKys[decColLwrCs['field']].join("-=-=-=-");
      //           else  example[decodedCol['field']] = exWthLwrCsKys[decColLwrCs['field']];
      //           if(decColLwrCs['field']!="type" && decColLwrCs['field']!="projectid"){
      //             decodedCol['visible'] = true;
      //             // if(Array.isArray(exWthLwrCsKys[decColLwrCs['field']])) 
      //             // decodedCol['filterValue'] = exWthLwrCsKys[decColLwrCs['field']][0]['value'].toString();
      //             // else{
      //             //   if(exWthLwrCsKys[decColLwrCs['field']].toString().includes("-=-=-=-")){
      //             //     decodedCol['filterValue'] = exWthLwrCsKys[decColLwrCs['field']].split("-=-=-=-").join(",");
      //             //   }
      //             //   else{
      //             //     decodedCol['filterValue'] = exWthLwrCsKys[decColLwrCs['field']];
      //             //   }
      //             // }
      //           }
      //         }
      //       }
      //     })
      //   }
      //   this.searchIncident = example;
      //   this.incidentsService.setCurrentUrl("");
      //   this.incidentsService.setPreviousUrl("");
      //   this.colsBackup.forEach(item => {
      //     let matchingCol = this.cols.filter(ele=>item['header']==ele['header'])[0];
      //     if(matchingCol) matchingCol['field'] = item['field'];
      //   });
      //   //
      // }
      else{
        this.searchIncidentObj = {};
        this.searchIncident = null;
        this.cols.map(ele=>ele['filterValue'] = null);
      }
      this.service.getSearchCount1(this.datasetName, projName, example).
        subscribe(resp => {
          let response: number = +resp;

          if (resp) {
            this.numberOfDisplay= Math.ceil(response/this.rows);
            if(this.numberOfDisplay==0){
              this.numberOfDisplay=1;
            } 
            if(this.numberOfDisplay==1)
              this.directionLinks=false;
            if(this.numberOfDisplay>1)
              this.directionLinks=true;
            if(this.numberOfDisplay>7) this.numberOfDisplay=7;
            if (resp.startsWith("Error: ")) {
             
            }
            else {
              let response: number = +resp;
              this.length = response;
             this.datasetsCount=response;
              this.initializePaginationVariables();
              this.changeDetectorRefs.detectChanges();
            }
          }},
          (error) => console.log(error)
        )
     this.service.searchTicketsUsingDataset1(this.datasetName, projName, pagination, example)
        .subscribe(
          
          (pageResponse) => {
            if (typeof pageResponse == "string") {
              
              this.service.message(pageResponse, 'error');
              this.ticketList = this.ticketListBackup;
            }
            else {
              pageResponse.forEach((element) => {
                element = this.incidentsService.mapImpactValues(element);
                if(element){
                    Object.keys(element).map(ky=>{if(element[ky]) element[ky]=element[ky].toString()});
                    this.ticketList.push(element);
                }
              });
              this.selectedTicket = this.ticketList[0];
              this.filteredInputColumns.next(this.columnNames.slice());
              this.ticketList.forEach((ele) => {
                ele = this.formatDatasourceData(ele);
              });
              this.ticketListBackup = this.ticketList;
              this.fetchCompleted = true;
              this.changeDetectorRefs.detectChanges();
            }
          },
          (error) => {
            this.fetchCompleted = false;
          
            this.service.message('Could not get the results', 'error');
            
            this.ticketList = this.ticketListBackup;
          }
        );
        console.log("This is Ticketlist:3",this.ticketList);
    }
    catch(Exception){
    
    this.service.message('Some error occured', 'error');
    }
  
  }

  view1(incident) {
    this.incidentsService.setTicketType(this.selectedType);
    this.saveSearchFilterExample();
    this.router.navigate(["../create-ticket/" + incident.number + "/" + true], { relativeTo: this.route });
  }

  edit(incident) {
    let queryparams={};
    this.updateQueryParam(queryparams);
    this.incidentsService.setTicketType(this.selectedType);
    if (incident.state == "New" || incident.state == "In Progress" || incident.state == "On Hold" || incident.state == "Resolved" || incident.state == "Closed" || incident.state == "Canceled") {
      this.saveSearchFilterExample();
      this.router.navigate(["../create-ticket/" + incident.number], {   
        state:{
          dsname:incident,
        },
        relativeTo: this.route
      });
      
    }
    //  else if (incident.state == "Resolved" || incident.state == "Closed" || incident.state == "Canceled") {
    //   this.view1(incident);
    // } 
    else {
      this.saveSearchFilterExample();
      this.router.navigate(["../create-ticket/" + incident.number], {
        state:{dsname:incident}, relativeTo: this.route });
    } // else to be commented later
  }
  toggleSelectHeaderToDwnld(header: string) {
    const col = this.cols.find(col => col.header === header);
    if (col) {
      col.selected = !col.selected;

      // Update colstodownload based on the selection
      // if (col.selected) {
      //   this.colsToDownload.push(col.header);
      // } else {
      //   this.colsToDownload = this.colsToDownload.filter(item => item !== col.header);
      // }
      if (col.selected) {
        this.colsToDownload.push(col.field);
      } else {
        this.colsToDownload = this.colsToDownload.filter(item => item !== col.field);
      }

      // Check if all columns are selected and update the "Select All" checkbox
      this.selectAllColsToDwnld = this.cols.every(col => col.selected);
    }
  }

  getIncidentsByPage(pgInfo) {
    //  
    // switch (choice) {
    //   case "Next":
    //     this.page += 1;
    //     if (this.page == this.lastPage) {
    //       choice = "Last";
    //       break;
    //     }
    //     break;
    //   case "Prev":
    //     this.page -= 1;
    //     if (this.page == 0) {
    //       choice = "First";
    //       break;
    //     }
    //     break;
    //   case "First":
    //     this.page = 0;
    //     break;
    //   case "Last":
    //     this.page = this.lastPage;
    //     break;
    // }
    this.page = pgInfo.page;
    this.goToPage = null;
    this.paginatorFirstRow = this.page*this.rows;
    let searchExample: any;
    if (this.enableFilter) {
      searchExample = this.filterIncident;
    }
    else if (this.searchIncident) {
      searchExample = this.searchIncident;
    }
    else {
      searchExample = {};
    }
    this.loadIncidents(searchExample);
  }

  open(content: any): void {
    this.modalService.openModal(content, 'mini');
    // this.router.navigate(['create'], { relativeTo: this.route })
  }
  addIcmTicketConfig(){
    const jsonObject = {
      Summary: {
        "Dataset - ICMTickets": this.icmdatasetname,
        "Schema - ICMTickets": this.datasetschema,
        "DownloadChunkSize": this.downloadChunkSize,
        "DefaultColumns": this.defaultColumns,
        "PrimaryColourConditions": "sladueDate<=1?'red':sladueDate<=2?'orange':sladueDate<=4?'yellow':sladueDate<=9?'aqua':'green'",
        "SecondaryColourConditions": "priority=='1 - Critical'?'red':'transparent'"
      },
      Details: {}
    };
    let dashConstant = new DashConstant();
    dashConstant.project_name = JSON.parse(sessionStorage.getItem("project")).name;
    let projectID = JSON.parse(sessionStorage.getItem("project")).id;
    let autoUserProject = false;
    if(JSON.parse(sessionStorage.getItem("project")).autoUserProject){
      autoUserProject=true;
    }
    let projectid= new Project();
    projectid.id = projectID;
    dashConstant.project_id = projectid;
    dashConstant.keys= "ICMTickets";
    dashConstant.value = JSON.stringify(jsonObject);
    if(this.icmTicketConstants){
        dashConstant.id = this.icmTicketConstants.id;
        this.service.updateDashConstant(dashConstant).subscribe(res => {
          this.service.message("Saved Successfully", "success")
          this.ngOnInit();
          this.getSourceApiParameters();
          this.closemodalconfig();
        });
    }
    else{
      this.dashConstantService.update(dashConstant).subscribe(res => {
        this.service.message("Saved Successfully", "success")
        this.ngOnInit();
        this.getSourceApiParameters();
        this.closemodalconfig();
      },
        err => {
          this.service.message("Error occured", err)
        });
      }
    console.log(jsonObject);
    console.log("addIcmTicketConfig");
  }
  closemodalconfig(){
    this.modalService.dismissAll();
  }
  
  getICMTicketConfig(){
    this.service.getDashConstantByKey('ICMTickets').subscribe(res => {
      this.icmTicketConstants= JSON.parse(res);
    }
    );
  }

  getDatasetList() {
    this.service.getDatasets().subscribe(res=>{
      res.forEach((element: any) => {
        this.icmdatasetList.push({ viewValue: element.alias, value: element.name });
      });
    });

    this.service.getAllSchemas().subscribe(res=>{
      res.forEach((element: any) => {
        this.icmschemaList.push({ viewValue: element.alias, value: element.name });
      });
    });

  }
  setDatasetname(datasetName: string) {
    this.icmdatasetname = datasetName;
  }
  setSchemaName(schemaName: string) { 
    this.datasetschema = schemaName;
  }

  openDesc(ele, source) {
    switch (source) {
      case "shortdescription":
        if (ele.remshortdescription != null) {
          if (ele.shortdescription != ele.remshortdescription) {
            ele.shortdescription = ele.remshortdescription;
          } else {
            ele.shortdescription = ele.remshortdescriptioncopy;
          }
        }
        break;
      case "description":
        if (ele.remdescription != null) {
          if (ele.description != ele.remdescription) {
            ele.description = ele.remdescription;
          } else {
            ele.description = ele.remdescriptioncopy;
          }
        }
        break;
      case "resolutionSteps":
        if (ele.remresolutionsteps != null) {
          if (ele.resolutionSteps != ele.remresolutionsteps) {
            ele.resolutionSteps = ele.remresolutionsteps;
          } else {
            ele.resolutionSteps = ele.remresolutionstepscopy;
          }
        }
        break;
    }
  }

  createTicket() {
   this.saveSearchFilterExample();
    this.router.navigate(["../create-ticket/alerts"], { relativeTo: this.route });
  }

  async openClusterDetails() {
    // await this.storeTaggingData();
    // let tagSet:Set<any> = new Set<any>();
    // let tagsList:any[] = [];
    // this.dbService.getAll("tagsData").subscribe(resp=>{
    //   if(resp && resp.length>0){
    //     resp.forEach(ele=>{
    //       if(ele['tags']){
    //         ele['tags'].split(",").forEach(ele=>tagSet.add(ele));
    //       };
    //     })
    //     tagSet.forEach(ele=>tagsList.push(ele));
    //   }
    // })
    if(this.selectedTickets.length!=0){
    let tgTkts: any = {};
    let tempList = (this.allTktsSltd || this.excludeIdsToTag.length>0) ? this.excludeIdsToTag : this.includeIdsToTag
    tgTkts = Object.assign({ "number": "'" + tempList + "'" });
    const dialogRef = this.dialog.open(ClusterTicketsComponent, {
      width: "40%",
      data: {
        purpose: "openClusterDetails",
        // existingTagsList: tagsList,
        entryCount: this.length,
        searchParams: (this.allTktsSltd || this.excludeIdsToTag.length>0) 
                      ? this.searchIncident ? this.searchIncident : {"type":this.selectedType}
                      : undefined,
        incidentsList: tgTkts
      }
    }
    );
    dialogRef.afterClosed().subscribe((result) => {
      this.incidentsToBeTagged = [];
      this.loadIncidents(this.searchIncident);
    });
  } else {
    const message = `Please Select ${this.viewSelectedType}`;
    this.service.message(message, 'error');
  }
  }

  ticketTypeChange(event) {
    let selectElement = event.target;
    var optionIndex = selectElement.selectedIndex;
    var optionText = selectElement.options[optionIndex];
    var value = optionText.text;
    this.selectedTicketType = value;
    this.createTicket();
  }

  setDataSource(indexNumber) {
    this.page = 0;
    setTimeout(() => {
      switch (indexNumber) {
        case 0:
          this.selectedType = "Incident";
          break;
        case 1:
          this.selectedType = "Task";
          break;
        case 2:
          this.selectedType = "ChangeRequest";
          break;
        case 3:
          this.selectedType = "ServiceRequest";
          break;
      }
      let searchExample: any;
      if (this.enableFilter) {
        searchExample = this.filterIncident;
      }
      else if (this.searchIncident) {
        searchExample = this.searchIncident;
      }
      else {
        searchExample = {};
      }
      this.loadIncidents(searchExample);
    });
  }

  initializePaginationVariables() {
    if (this.length > 0) {
      var remainder = this.length % this.rows;
      var cof = (this.length - remainder) / this.rows;
      if (remainder != 0) {
        this.lastPage = cof;
      } else {
        this.lastPage = cof - 1;
      }
    } else {
      if (this.length == 0) {
        this.page = 0;
        this.lastPage = 0;
      }
    }
  }
  searchParamChange(event, index) {
    let selectElement = event.target;
    var optionIndex = selectElement.selectedIndex;
    var optionText = selectElement.options[optionIndex];
    var value = optionText.text;
    this.searchedParamList[index] = value;
    if (this.searchedParamList[index] == "State" || this.searchedParamList[index] == "Priority") {
      this.searchValueArray[0][index] = "All";
      this.searchValueArray[1][index] = "";
    } else {
      this.searchValueArray[0][index] = "";
      this.searchValueArray[1][index] = "";
    }
    if (this.searchValueArray[0].every((val) => val == "" || val == null || val == undefined)) {
      this.searchReady = false;
    } else {
      this.searchReady = true;
    }
  }

  changeSearchParam(event) {
    this.page = 0;
    let selectElement = event.target;
    var optionIndex = selectElement.selectedIndex;
    var optionText = selectElement.options[optionIndex];
    var value = optionText.text;
    this.paramForSearch = value;
    if (this.paramForSearch == "State") {
      this.valueOfState = "All";
    } else if (this.paramForSearch == "Priority") {
      this.valueOfPriority = "All";
    }
    else if (this.paramForSearch == "Creation Date" || this.paramForSearch == "Closed Date") {
      this.valueOfFromDate = "";
      this.valueOfToDate = "";
    }
    this.valueOfInput = "";
    this.valueOfFromDate = "";
    this.valueOfToDate = "";
    if (this.searchIncident) {
      this.searchIncident = null;
      this.loadIncidents(null);
    }
  }

  searchButtonStyle() {
    if (this.searchReady == true) {
      return { cursor: "pointer", background: "#00B28F" };
    } else {
      return { cursor: "not-allowed", background: "gray" };
    }
  }

  searchTickets() {
    this.filterIncident = {};
    // let project: Project = JSON.parse(sessionStorage.getItem("project"));
    // this.filterIncident.projectid = project.id;
    this.filterIncident.type = this.selectedType;
    if (this.selectedUserType == "My") {
      this.filterIncident.assignedto = this.user_name.user_login;
    }
    let srPrm;
    for (srPrm = 0; srPrm < this.searchedParamList.length; srPrm++) {
      if (
        this.searchedParamList[srPrm] == "Number" ||
        this.searchedParamList[srPrm] == "Short Description" ||
        this.searchedParamList[srPrm] == "Description" ||
        this.searchedParamList[srPrm] == "Resolution Steps" ||
        this.searchedParamList[srPrm] == "Assigned To"
      ) {
        if (
          this.searchValueArray[0][srPrm] == "" ||
          this.searchValueArray[0][srPrm] == null ||
          this.searchValueArray[0][srPrm] == undefined
        ) {
         
        } else {
          var changedInput = this.searchValueArray[0][srPrm];
          let upperCaseTransformed: string;
          upperCaseTransformed = changedInput.trim();
          if (this.searchedParamList[srPrm] == "Number") {
            this.filterIncident.number = upperCaseTransformed;
          } else if (this.searchedParamList[srPrm] == "Short Description") {
            this.filterIncident.shortdescription = upperCaseTransformed;
          } else if (this.searchedParamList[srPrm] == "Description") {
            this.filterIncident.description = upperCaseTransformed;
          } else if (this.searchedParamList[srPrm] == "Resolution Steps") {
            this.filterIncident.resolutionsteps = upperCaseTransformed;
          } else if (this.searchedParamList[srPrm] == "Assigned To") {
            this.filterIncident.assignedto = upperCaseTransformed;
          }
        }
      } else if (this.searchedParamList[srPrm] == "Creation Date" || this.searchedParamList[srPrm] == "Closed Date") {

        this.searchFromDateChange = this.searchValueArray[0][srPrm];
        this.searchToDateChange = this.searchValueArray[1][srPrm];
        if (this.searchedParamList[srPrm] == "Creation Date") {
          this.searchFromDateChange = this.datepipe.transform(this.searchFromDateChange, "yyyy-MM-dd");
          this.searchToDateChange = this.datepipe.transform(this.searchToDateChange, "yyyy-MM-dd");
         
          if (this.searchFromDateChange != "" && this.searchFromDateChange != null && this.searchFromDateChange != undefined) {
            if (this.searchToDateChange != "" && this.searchToDateChange != null && this.searchToDateChange != undefined) {
              this.filterIncident.createddate = "%' and createddate>='" + this.searchFromDateChange + " 00:00:00' and createddate<='" + this.searchToDateChange + " 23:59:59' and createddate like '%";
            }
            else {
              this.filterIncident.createddate = "%' and createddate>='" + this.searchFromDateChange + " 00:00:00' and createddate like '%";
            }

          }
          else {
            if (this.searchToDateChange != "" && this.searchToDateChange != null && this.searchToDateChange != undefined) {
              this.filterIncident.createddate = "%' and createddate<='" + this.searchToDateChange + " 23:59:59' and  createddate like '%";
            }
          }




        } else if (this.searchedParamList[srPrm] == "Closed Date") {
          this.searchFromDateChange = this.datepipe.transform(this.searchFromDateChange, "yyyy-MM-dd");
          this.searchToDateChange = this.datepipe.transform(this.searchToDateChange, "yyyy-MM-dd");

         
          if (this.searchFromDateChange != "" && this.searchFromDateChange != null && this.searchFromDateChange != undefined) {
            if (this.searchToDateChange != "" && this.searchToDateChange != null && this.searchToDateChange != undefined) {
              this.filterIncident.closeddate = "%' and closeddate>='" + this.searchFromDateChange + " 00:00:00' and closeddate<='" + this.searchToDateChange + " 23:59:59' and closeddate like '%";
            }
            else {
              this.filterIncident.closeddate = "%' and closeddate>='" + this.searchFromDateChange + " 00:00:00' and closeddate like '%";
            }

          }
          else {
            if (this.searchToDateChange != "" && this.searchToDateChange != null && this.searchToDateChange != undefined) {
              this.filterIncident.closeddate = "%' and closeddate<='" + this.searchToDateChange + " 23:59:59'  and closeddate like '%";
            }
          }

        }
      } else if (this.searchedParamList[srPrm] == "State") {
        if (
          this.searchValueArray[0][srPrm] == "" ||
          this.searchValueArray[0][srPrm] == null ||
          this.searchValueArray[0][srPrm] == undefined
        ) {
        } else if (this.searchValueArray[0][srPrm] == "All") {
        } else {
          this.filterIncident.state = this.searchValueArray[0][srPrm];
          this.selectedStatus = this.searchValueArray[0][srPrm];
        }
      } else if (this.searchedParamList[srPrm] == "Priority") {
        if (
          this.searchValueArray[0][srPrm] == "" ||
          this.searchValueArray[0][srPrm] == null ||
          this.searchValueArray[0][srPrm] == undefined
        ) {
        } else if (this.searchValueArray[0][srPrm] == "All") {
        } else {
          this.filterIncident.priority = this.searchValueArray[0][srPrm].substring(0, 1);
          this.selectedPriority = this.searchValueArray[0][srPrm];
        }
      }
    }
    this.showAddTag = true;
    this.resetReady = true;
    this.page = 0;
    let andList = []
    Object.keys(this.filterIncident).forEach(ele => {
      if (this.filterIncident[ele]) {
        if ((this.filterIncident[ele]).length == 1) {
          andList.push({ "or": this.filterIncident[ele][0] });
        }
        else {
          andList.push({ "or": this.filterIncident[ele] });
        }
      }
    });
    this.andObj["and"] = andList;
    this.loadIncidents(this.andObj);
  }
  loadIncidents(exampleIncident: any) {
    try{
       // this.storeTaggingData();
    if (!exampleIncident) exampleIncident = {};
    this.ticketList = [];
    let project = new Project();
    project = JSON.parse(sessionStorage.getItem("project"));
    // exampleIncident["projectid"] = project.id;
    
    if (exampleIncident.state == "All") {
      delete exampleIncident.state;
    }
    if (exampleIncident.priority == "All") {
      delete exampleIncident.priority;
    }
    this.powerModeTicketList = [];
    let projName: string = project.name;
    let pagination = { 'page': this.page, 'size': this.rows, 'sortEvent': this.sortEvent, 'sortOrder': this.sortorder };
    this.busy = this.service.searchTicketsUsingDataset1(this.datasetName, projName, pagination, exampleIncident)
      .subscribe(res => {
        if (typeof res == "string") {
         
          this.service.message(res, 'error')
          
          this.ticketList = this.ticketListBackup;
        }
        else {
          this.ticketList = [];
          res.forEach((ele) => {
            ele = this.incidentsService.mapImpactValues(ele);
            if(ele){
                Object.keys(ele).map(ky=>{if(ele[ky]) ele[ky]=ele[ky].toString()});
                this.ticketList.push(ele);
            }
          });
          this.ticketList = this.ticketList.filter((elem, index, self) => {
            return (
              index ===
              self.findIndex((ele) => {
                return ele.number === elem.number;
              })
            );
          });
          this.powerModeTicketList = this.ticketList;
          this.ticketList.forEach((ele) => {
            ele = this.formatDatasourceData(ele);
          });
          this.ticketListBackup = this.ticketList;
          this.checkIfAllTicketsSelected()
          this.fetchCompleted = true;
          this.changeDetectorRefs.detectChanges();
          if(this.ticketList.length == 0)
            this.powerModeFetch = false;
        }
      },
        error => {
          this.fetchCompleted = false;
         
          this.service.message('Some error occurred while fetching tickets', 'error')
          this.ticketList = this.ticketListBackup;
        });
    this.service.getSearchCount1(this.datasetName, projName, exampleIncident).
      subscribe(resp => {
        if (resp) {
            let response: number = +resp;
            this.length = response;
            this.numberOfDisplay= Math.ceil(this.length/this.rows);
            if(this.numberOfDisplay==0){
              this.numberOfDisplay=1;
            } 
            if(this.numberOfDisplay==1)
              this.directionLinks=false;
            if(this.numberOfDisplay>1)
              this.directionLinks=true;
            if(this.numberOfDisplay>7) this.numberOfDisplay=7;
            this.initializePaginationVariables();
            if(!this.powerMode) this.changeDetectorRefs.detectChanges();          
        }
      },
      (error) => console.log(error)
      )
    }
    catch(Exception){
    
    this.service.message('Some error occured', 'error')
    }
   
  }
  sortData(column) {
    this.sortEnabled = true;
    this.sortEvent = column;
    if (this.oldSortEvent == this.sortEvent) {
      this.sortorder = -1 * this.sortorder;
    } else {
      this.sortorder = -1;
    }
    this.oldSortEvent = this.sortEvent;
   
    let andList = []
    // Object.keys(this.searchIncident).forEach(ele => {
    //   if (this.searchIncident[ele]) {
    //     if ((this.searchIncident[ele]).length == 1) {
    //       andList.push({ "or": this.searchIncident[ele][0] });
    //     }
    //     else {
    //       andList.push({ "or": this.searchIncident[ele] });
    //     }
    //   }
    // });
    this.andObj["and"] = andList;
    this.loadIncidents(this.andObj);
  }
  colSearch(){
    this.searchToggle=!this.searchToggle
  }
  searchFilterReset() {
    this.searchedParamList.forEach((item, index) => {
      if (item == "Priority" || item == "State") this.searchValueArray[0][index] = "All";
      else if (item == "Creation Date" || item == "Closed Date") {
        this.searchValueArray[0][index] = "";
      } else this.searchValueArray[0][index] = "";
      this.searchValueArray[1][index] = "";
    });
    this.page = 0;
    this.resetReady = false;
    this.searchReady = false;
    this.showAddTag = false;
    this.filterIncident = {};
    this.loadIncidents(null);
  }

  checkChange(event, index) {
    let selectElement = event.target;
    var optionIndex = selectElement.selectedIndex;
    var optionText = selectElement.options[optionIndex];
    var value = optionText.text;
    if (this.searchedParamList[index] == "State") {
      this.searchValueArray[0][index] = value;
      this.selectedStatus = this.searchValueArray[0][index];
      if (this.searchValueArray[0].every((val) => val == "" || val == null || val == undefined)) {
        //this.selectedStatus=="" || this.selectedStatus==null || this.selectedStatus==undefined
        this.searchReady = false;
      } else {
        this.searchReady = true;
      }
    } else if (this.searchedParamList[index] == "Priority") {
      this.searchValueArray[0][index] = value;
      this.selectedPriority = this.searchValueArray[0][index];
      if (this.searchValueArray[0].every((val) => val == "" || val == null || val == undefined)) {
        this.searchReady = false;
      } else {
        this.searchReady = true;
      }
    }
  }

 

  searchNumber(event) {
    this.loadIncidents(this.numberSearch);
  }
  searchValueAdder(event, columnName:string, dateIndicator?: string) {
    // columnName = columnName.substring(0,1).toUpperCase() + columnName.substring(1).replace(/\s/g, "").toLowerCase();
    //
    if(this.searchIncident == null)
    this.searchIncident = {}
    if(event.target.value!=""){
      if (event.target.value.includes(",")) {
        let filterValueList = event.target.value.split(",");
        let objList = [];
        filterValueList = filterValueList.map(ele => ele.trim()).filter(ele => ele != "");
        filterValueList.forEach(ele => {
          objList.push({ "property": columnName, "equality": "like", "value": ele })
        });
        // objList.push({ "property": "type", "equality": "like", "value": this.selectedType })
        this.searchIncident["type"] = { "property": "type", "equality": "like", "value": this.selectedType }
        this.searchIncident[columnName] = objList;
      } else {
        this.searchIncident["type"] = { "property": "type", "equality": "like", "value": this.selectedType }
        this.searchIncident[columnName] = [{ "property": columnName, "equality": "like", "value": event.target.value }];
      }
    }
    else if(event.target.value=="")
    {
      this.searchIncident[columnName] = undefined;
      this.searchOnInput();
    }  
  }

  searchOnInput() {

    this.page = 0;
    this.goToPage = null;
    this.paginatorFirstRow = 0;
    this.resetTicketsSelection();
    //this.typingTimer = setTimeout(() => {  }, this.doneTypingInterval);
    let andList = []
    let queryparams={}
    Object.keys(this.searchIncident).forEach(ele => {
      if (this.searchIncident[ele]) {
        if ((this.searchIncident[ele]).length == 1) {
          andList.push({ "or": this.searchIncident[ele][0] });
          if(this.searchIncident[ele][0]['property']!='type'){
          queryparams[this.searchIncident[ele][0]['property']]=this.searchIncident[ele][0]['value'];
          }
        }
        else {
          andList.push({ "or": this.searchIncident[ele] });
          if(this.searchIncident[ele]['property']!='type'){
          queryparams[this.searchIncident[ele]['property']]=this.searchIncident[ele]['value'];
        }
      }
      }
    });
    
    this.andObj["and"] = andList;
    // if(this.powerMode)  this.loadIncidents(this.pmSearch);
      this.loadIncidents(this.andObj);
    this.updateQueryParam(queryparams);
  }

  enableFilterFunction() {
    this.valueOfInput = "";
    this.valueOfPriority = "All";
    this.valueOfState = "All";
    this.valueOfFromDate = "";
    this.valueOfToDate = "";
    this.numberSearch = "";
    this.searchedParamList.forEach((item, index) => {
      if (item == "Priority" || item == "State") this.searchValueArray[0][index] = "All";
      else if (item == "Created Date" || item == "Closed Date") {
        this.searchValueArray[0][index] = "";
        this.searchValueArray[1][index] = "";
      } else this.searchValueArray[0][index] = "";
    });
    this.enableFilter = !this.enableFilter;
    if (!this.enableFilter) {
      this.resetReady = false;
      this.showAddTag = false;
      this.searchReady = false;
      this.refreshTicket();
    }
    else {
      if (this.searchIncident) {
        this.searchIncident = null;
        this.loadIncidents(null);
      }
    }

  }

  createJsonBody(): {} {
    var newJson = {};
    switch (this.paramForSearch) {
      case "Creation Date":
        newJson["createddate"] = this.valueOfFromDate;
        break;
      case "Closed Date":
        newJson["closeddate"] = this.valueOfToDate;
        break;
      case "Number":
        newJson["number"] = this.searchNumber;
        break;
      case "State":
        newJson["state"] = this.valueOfState;
        break;
      case "Priority":
        newJson["priority"] = this.valueOfPriority.split("-")[0].trim();
        break;
      case "Description":
        newJson["clustername"] = this.valueOfInput;
        break;
      case "Assigned To":
        newJson["assignedto"] = this.valueOfInput;
        break;
      case "Short Description":
        newJson["shortdescription"] = this.valueOfInput;
        break;
    }
    return newJson;
  }

  addSearchCount() {
    this.searchParamList = this.searchParamsArray.filter((val) => !this.searchedParamList.includes(val));
    this.searchedParamList.push(this.searchParamList[0]);
    if (
      this.searchedParamList[this.searchedParamList.length - 1] == "State" ||
      this.searchedParamList[this.searchedParamList.length - 1] == "Priority"
    ) {
      this.searchValueArray[0].push("All");
      this.searchValueArray[1].push("");
    } else {
      this.searchValueArray[0].push("");
      this.searchValueArray[1].push("");
    }
    if (this.searchValueArray[0].every((val) => val == "" || val == null || val == undefined)) {
      this.searchReady = false;
    } else {
      this.searchReady = true;
    }
  }

  resetValue(type) {
    switch (type) {
      case "Creation Date":
        this.filterIncident.createddate = undefined;
        break;
      case "Closed Date":
        this.filterIncident.closeddate = undefined;
        break;
      case "Number":
        this.filterIncident.number = undefined;
        break;
      case "State":
        this.filterIncident.state = undefined;
        break;
      case "Priority":
        this.filterIncident.priority = undefined;
        break;
      case "Description":
        this.filterIncident.description = undefined;
        break;
      case "Assigned To":
        this.filterIncident.assignedto = undefined;
        break;
      case "Short Description":
        this.filterIncident.shortdescription = undefined;
        break;
    }
  }

  deleteSearchParam(index) {
    this.resetValue(this.searchedParamList[index]);
    this.searchValueArray[0].splice(index, 1);
    this.searchValueArray[1][index] = "";
    this.searchedParamList.splice(index, 1);
    if (this.searchValueArray[0].every((val) => val == "" || val == null || val == undefined)) {
      this.searchReady = false;
    } else {
      this.searchReady = true;
    }
  }

  getPages(choice, page?) {
    switch (choice) {
      case 'Next':
        this.page += 1;
        if(this.page > this.lastPage)
          this.page = this.lastPage;
        break;
      case 'Prev':
        this.page -= 1;
        if(this.page < 0)
          this.page = 0;
        break
      case 'First':
        this.page = 0;
        break;
      case 'Last':
        this.page = this.lastPage;
        break;
      case 'Fixed':
          this.page = page;
          break;
    }
    this.getIncidentsByPage1();
  }
  getIncidentsByPage1() {
    // this.page = pgInfo.page;
    this.goToPage = null;
    this.paginatorFirstRow = this.page * this.rows;
    this.loadIncidents(this.andObj);
  }
 
  fetchTaggingDetails() {
    try{
      let taggingLazyLoad = {
        first: 0,
        rows: 1000,
        sortField: null,
        sortOrder: this.sortorder,
        filters: null,
        multiSortMeta: null,
      };
      let project: Project = JSON.parse(sessionStorage.getItem("project"));
      let icmCluster: IcmClusters = new IcmClusters();
      // let icmSop: IcmSops = new IcmSops();
      let icmProblemType: IcmProblemType = new IcmProblemType();
      icmCluster.projectId = project.id;
      // icmSop.projectId = project.id;
      icmProblemType.projectId = project.id;
      // this.busy = this.icmSopService.findAll(icmSop, taggingLazyLoad).subscribe(
      //   (resp) => {
      //     this.icmSopArray = resp.content;
      //     this.incidentsService.setSopArray(this.icmSopArray);
      //   },
      //   (error) =>console.log(error)
      // );
    }
    catch(Exception){
        this.service.message('Some error occured', 'error')
    }
   
  }

  formatDatasourceData(ele: any) {
    if (ele.shortdescription != null) {
      if (ele.shortdescription.length > 35) {
        if (ele.remshortdescription == null || ele.remshortdescription == undefined) {
          ele.remshortdescription = ele.shortdescription;
        }
        ele.shortdescription = ele.shortdescription.slice(0, 35) + ".....";
        ele.remshortdescriptioncopy = ele.shortdescription;
      }
    }
    if (ele.description != null) {
      if (ele.description.length > 35) {
        if (ele.remdescription == null || ele.remdescription == undefined) {
          ele.remdescription = ele.description;
        }
        ele.description = ele.description.slice(0, 35) + ".....";
        ele.remdescriptioncopy = ele.description;
      }
    }
    if (ele.resolutionSteps != null) {
      if (ele.resolutionSteps.length > 35) {
        if (ele.remresolutionsteps == null || ele.remresolutionsteps == undefined) {
          ele.remresolutionsteps = ele.resolutionSteps;
        }
        ele.resolutionSteps = ele.resolutionSteps.slice(0, 35) + ".....";
        ele.remresolutionstepscopy = ele.resolutionSteps;
      }
    }
    let nameArray: string[] = [];
    let temp: string;
    let temp1: string = "";
    let tempArray: string[];
    if (ele.shortdescriptionClusterName != null && ele.shortdescriptionClusterName != undefined) {
      temp = ele.shortdescriptionClusterName;
      tempArray = temp.split(",");
      tempArray.forEach((item) => {
        nameArray.push(item);
      });
      tempArray = [];
    }
    if (ele.shortdescriptionClusterManual != null && ele.shortdescriptionClusterManual != undefined) {
      temp = ele.shortdescriptionClusterManual;
      tempArray = temp.split(",");
      tempArray.forEach((item) => {
        nameArray.push(item);
      });
      tempArray = [];
    }
    if (ele.resolutionStepsClusterName != null && ele.resolutionStepsClusterName != undefined) {
      temp = ele.resolutionStepsClusterName;
      tempArray = temp.split(",");
      tempArray.forEach((item) => {
        nameArray.push(item);
      });
      tempArray = [];
    }
    if (ele.resolutionStepsClusterManual != null && ele.resolutionStepsClusterManual != undefined) {
      temp = ele.resolutionStepsClusterManual;
      tempArray = temp.split(",");
      tempArray.forEach((item) => {
        nameArray.push(item);
      });
      tempArray = [];
    }
    ele.clustername = "";
    var unique = nameArray.filter(function (elem, index, self) {
      return index === self.indexOf(elem);
    });
    for (let i = 0; i < unique.length; i++) {
      if (i != unique.length - 1) {
        if (unique[i] != "" && unique[i + 1] != "") {
          temp1 = temp1 + unique[i] + ", ";
        } else {
          temp1 = temp1 + unique[i];
        }
      } else {
        temp1 = temp1 + unique[i];
      }
    }
    ele.clustername = temp1;
    return ele;
  }

  checkInputChanges(index) {
    if (
      this.searchedParamList[index] == "Number" ||
      this.searchedParamList[index] == "Short Description" ||
      this.searchedParamList[index] == "Description" ||
      this.searchedParamList[index] == "Resolution Steps" ||
      this.searchedParamList[index] == "Assigned To"
    ) {
      this.searchValueArray[0][index];
      if (this.searchValueArray[0].every((val) => val == "" || val == null || val == undefined)) {
        this.searchReady = false;
      } else {
        this.searchReady = true;
      }
    } else if (this.searchedParamList[index] == "Creation Date" || this.searchedParamList[index] == "Closed Date") {
      this.searchFromDate = this.searchValueArray[0][index];
      this.searchToDate = this.searchValueArray[1][index];
      this.searchFromDateChange = this.searchValueArray[0][index];
      this.searchToDateChange = this.searchValueArray[1][index];
      if (
        this.searchValueArray[0].every((val) => val == "" || val == null || val == undefined)
      ) {

        if (
          this.searchValueArray[1].every((val) => val == "" || val == null || val == undefined)
        ) {
          this.searchReady = false;
        }
        else {
          this.searchReady = true;
        }

      }


      else {
        this.searchReady = true;
      }

    }
  }

  // download() {
  //   try{
  //     this.bsyGtngDwnldCnt = true;
  //     this.csvData = [];
  //     this.downloadErrorLog = "";
  //     this.apiCount = 0;
  //     this.downloadPercentage = 0;
  //     this.cancelDownload = false;
  //     let project: Project = JSON.parse(sessionStorage.getItem("project"));
  //     let projName: string = project.name;
  //     let searchExample: any;
  //     // if (this.enableFilter) {
  //     //   searchExample = new Incidents(this.filterIncident);
  //     // }
  //     if (this.searchIncident) {
  //       searchExample = this.searchIncident;
  //     }
  //     else {
  //       searchExample = {};
  //       // searchExample.projectid = project.id;
  //       searchExample.type = this.selectedType;
  //     }
  //     // if (this.selectedUserType == "My") {
  //     //   searchExample.assignedto = this.user_name.user_login;
  //     // }
  //     // if (searchExample.state == "All") searchExample.state = null;
  //     // if (searchExample.priority == "All") searchExample.priority = null;
  //     this.service.getSearchCount1(this.datasetName, projName, searchExample).
  //       subscribe(resp => {
  //         if (resp) {
  //           if (resp.startsWith("Error: ")) {
              
  //             this.service.message('Error while fetching tickets count is '+ resp.substring(resp.indexOf(": ")), 'error')
  //             this.bsyGtngDwnldCnt = false;
  //           }
  //           else {
  //             let tktCount: number = +resp;
  //             this.bsyGtngDwnldCnt = false;
  //             this.callDownloadApi(this.datasetName, projName, searchExample, tktCount, this.chunkSize);
  //           }
  //         }
  //         else {
            
  //           this.service.message('Ticket count returned null', 'error')
  //           this.bsyGtngDwnldCnt = false;
  //         }
  //       },
  //         error => {
            
  //           this.service.message('Error while fetching tickets count is '+ error, 'error')
  //           this.bsyGtngDwnldCnt = false;
  //         }
  //       )
  //   }
  //   catch(Exception){
  
  //   this.service.message('Some error occured', 'error')
  //   }
  
  // }
  download() {
    try {
      this.bsyGtngDwnldCnt = true;
      this.csvData = [];
      this.downloadErrorLog = "";
      this.apiCount = 0;
      this.downloadPercentage = 0;
      this.cancelDownload = false;
      let project: Project = JSON.parse(sessionStorage.getItem("project"));
      let projName: string = project.name;
      let example= {};
      let searchObj: any=[{"or":{ "property": "type", "equality": "like", "value":this.selectedType }}];
      example["and"]=searchObj;
      // if (this.searchIncidentObj) searchExample = this.andObj;
      // else searchExample = {};
      example=this.andObj;
      this.service.getSearchCount(this.datasetName, projName, example).
        subscribe(resp => {
          if (resp) {
            if (resp.startsWith("Error: ")) {
              this.service.messageService("Error while fetching data count is " + resp.substring(resp.indexOf(": ")), "Dataset View");
              this.bsyGtngDwnldCnt = false;
            }
            else {
              let tktCount: number = +resp;
              this.bsyGtngDwnldCnt = false;
              this.callDownloadApi(this.datasetName, projName, example, tktCount, this.chunkSize);
            }
          }
          else {
            this.service.messageService("Data count returned null", "Dataset View");
            this.bsyGtngDwnldCnt = false;
          }
        },
          error => {
            this.service.messageService("Error while fetching data count is " + error, "Dataset View");
            this.bsyGtngDwnldCnt = false;
          }
        )
    }
    catch (Exception: any) {
      this.service.messageService("Some error occured", Exception)
    }

  }
  callDownloadApi(dsName, projName, srchExample, tktCount, chunkSize) {
    this.downloading = true;
    this.changeDetectorRefs.detectChanges();
    this.service.getDownloadData(dsName, projName, srchExample, chunkSize.toString(), this.apiCount.toString(), this.sortEvent, this.sortorder.toString(), this.colsToDownload.toString()).
      subscribe(resp => {
        if (resp) {
          if (resp.startsWith("Error: ")) {
            this.downloadErrorLog += "\nError while downloading records "
              + ((this.apiCount * chunkSize) + 1) + " to "
              + ((((this.apiCount + 1) * chunkSize) < tktCount) ? ((this.apiCount + 1) * chunkSize) : ((this.apiCount * chunkSize) + (tktCount - (this.apiCount * chunkSize)))) + "   "
              + resp.substring(resp.indexOf(": "));
            this.apiCount++;
            let dlper: number = Math.round((((this.apiCount * chunkSize) / tktCount) * 100) * 100) / 100;
            this.downloadPercentage = dlper > 99.99 ? 99.99 : dlper;
            this.changeDetectorRefs.detectChanges();
          }
          else {
            this.apiCount++;
            this.csvData.push(resp);
            let dlper: number = Math.round((((this.apiCount * chunkSize) / tktCount) * 100) * 100) / 100;
            this.downloadPercentage = dlper > 99.99 ? 99.99 : dlper;
            this.changeDetectorRefs.detectChanges();
          }
        }
        else {
          this.downloadErrorLog += "\nResponse for records "
            + ((this.apiCount * chunkSize) + 1) + " to "
            + ((((this.apiCount + 1) * chunkSize) < tktCount) ? ((this.apiCount + 1) * chunkSize) : ((this.apiCount * chunkSize) + (tktCount - (this.apiCount * chunkSize)))) + "   "
            + " was received as null";
          this.apiCount++;
          let dlper: number = Math.round((((this.apiCount * chunkSize) / tktCount) * 100) * 100) / 100;
          this.downloadPercentage = dlper > 99.99 ? 99.99 : dlper;
          this.changeDetectorRefs.detectChanges();
        }
        if ((this.apiCount * chunkSize) < tktCount && !this.cancelDownload) {
          this.callDownloadApi(dsName, projName, srchExample, tktCount, chunkSize);
          this.downloading = true;
          this.changeDetectorRefs.detectChanges();
        }
        else {
          let fileBlob = new Blob(this.csvData, { type: "text/csv" });
          importedSaveAs(fileBlob, this.viewSelectedType+"s-" + this.datepipe.transform(new Date(), "ddMMMyyyy-hhmmssa") + ".csv");
          if (this.downloadErrorLog != "") {
            let errorBlob = new Blob([this.downloadErrorLog], { type: "text/plain" });
            importedSaveAs(errorBlob, "DownloadErrorLog-" + this.datepipe.transform(new Date(), "ddMMMyyyy-hhmmssa") + ".txt");
          }
          this.msHvr = false;
          this.downloading = false;
          this.changeDetectorRefs.detectChanges();
        }
      },
        error => {
          this.downloadErrorLog += "\nError while downloading records "
            + ((this.apiCount * chunkSize) + 1) + " to "
            + ((((this.apiCount + 1) * chunkSize) < tktCount) ? ((this.apiCount + 1) * chunkSize) : ((this.apiCount * chunkSize) + (tktCount - (this.apiCount * chunkSize)))) + "   "
            + error;
          this.apiCount++;
          let dlper: number = Math.round((((this.apiCount * chunkSize) / tktCount) * 100) * 100) / 100;
          this.downloadPercentage = dlper > 99.99 ? 99.99 : dlper;
          this.changeDetectorRefs.detectChanges();
          if ((this.apiCount * chunkSize) < tktCount && !this.cancelDownload) {
            this.callDownloadApi(dsName, projName, srchExample, tktCount, chunkSize);
            this.downloading = true;
            this.changeDetectorRefs.detectChanges();
          }
          else {
            let fileBlob = new Blob(this.csvData, { type: "text/csv" });
            importedSaveAs(fileBlob, this.viewSelectedType+"s-" + this.datepipe.transform(new Date(), "ddMMMyyyy-hhmmssa") + ".csv");
            if (this.downloadErrorLog != "") {
              let errorBlob = new Blob([this.downloadErrorLog], { type: "text/plain" });
              importedSaveAs(errorBlob, "DownloadErrorLog-" + this.datepipe.transform(new Date(), "ddMMMyyyy-hhmmssa") + ".txt");
            }
            this.msHvr = false;
            this.downloading = false;
            this.changeDetectorRefs.detectChanges();
          }
        }
      )
  }

  terminateDownload(){
    this.cancelDownload=true;
   
    this.service.message('Download Terminated', 'error')
  }

  fetchColourConditions(prClrCd, secClrCd) {
    let primaryValue = prClrCd;
    // primaryValue=primaryValue.replace(/\s/gi,"").toLowerCase();
    let primaryParameterList: string[] = [];
    primaryParameterList = primaryValue.split(":");
    for (var i = 0; i < primaryParameterList.length - 1; i++) {
      primaryParameterList[i] = "incident." + primaryParameterList[i];
    }
    primaryValue = primaryParameterList.join(":");
    this.comparingCondition = primaryValue;
    let secondaryValue = secClrCd;
    // secondaryValue=secondaryValue.replace(/\s/gi,"").toLowerCase();
    let secondaryParameterList: string[] = [];
    secondaryParameterList = secondaryValue.split(":");
    for (var i = 0; i < secondaryParameterList.length - 1; i++) {
      secondaryParameterList[i] = "incident." + secondaryParameterList[i];
    }
    secondaryValue = secondaryParameterList.join(":");
    this.secondaryColourCondition = secondaryValue;
  }

  decideColour(inc, columnHeader) {
    if (inc && this.comparingCondition.match(".+?.+:.+")) {
      let inci = inc;
      var stringEvaluator = new Function("incident", "return " + this.comparingCondition);
      var colour = stringEvaluator(inci);
      if (colour.startsWith("0x")) {
        colour = colour.replace(/0x/gi, "#");
      }
      if (
        this.cols[0] &&
        this.cols[0].field &&
        columnHeader.field &&
        columnHeader.field.toString().toLowerCase() == this.cols[0].field.toString().toLowerCase()
      ) {
        return { "border-style": "solid", "border-color": colour, "border-left-width": "1.5rem" };
      } else {
        return { "border-style": "solid", "border-color": colour };
      }
    }
  }

  decideSecondaryColour(inc) {
    if (inc && this.secondaryColourCondition.match(".+?.+:.+")) {
      let inci = inc;
      var stringEvaluator = new Function("incident", "return " + this.secondaryColourCondition);
      var secondaryColour = stringEvaluator(inci);
      if (secondaryColour.startsWith("0x")) {
        secondaryColour = secondaryColour.replace(/0x/gi, "#");
      }
      return { background: "transparent", "box-shadow": "inset 0 0 5px 5px " + secondaryColour };
    }
  }

  getSourceApiParameters() {
    try{
      let projName: string = JSON.parse(sessionStorage.getItem('project')).name;
      let example: DashConstant = new DashConstant();
      example.project_name = projName;
      let lazyload = { first: 0, rows: 3, sortField: null, sortOrder: null, filters: null, multiSortMeta: null };
      example.keys = "ICMTickets";
      this.busy = this.dashConstantService.findAll(example, lazyload)
        .subscribe(resp => {
          let response = resp.content.filter(res=>res.project_name == projName)[0]
            if(response && response.value){
            try {
              let prClrCd: string = "";
              let secClrCd: string = "";
              let defaultColumnsList: string = "";
              let cnksz: string = "";
              let ctgry;
              let icmTktMap = JSON.parse(response.value);
              for (ctgry in icmTktMap) {
                let formattedCtgry: string = ctgry.replace(/\s/gi, "");
                if (formattedCtgry && formattedCtgry.toLowerCase() == "summary") {
                  let objMap = icmTktMap[ctgry];
                  let objKy;
                  for (objKy in objMap) {
                    let ky: string = objKy.replace(/\s/gi, "");
                    if (ky) {
                      ky = ky.toLowerCase();
                      switch (ky) {
                        case "dataset-icmtickets":
                          this.datasetName = objMap[objKy];
                          this.incidentsService.setDatasetName(this.datasetName);
                          break;
                        case "schema-icmtickets":
                          this.schemaName = objMap[objKy];
                          this.incidentsService.setSchemaName(this.schemaName);
                          break;
                        case "defaultcolumns":
                          defaultColumnsList = objMap[objKy];
                          break;
                        case "primarycolourconditions":
                          prClrCd = objMap[objKy];
                          break;
                        case "secondarycolourconditions":
                          secClrCd = objMap[objKy];
                          break;
                        case "downloadchunksize":
                          cnksz = objMap[objKy];
                          break;
                      }
                    }
                  }
                }
              }
              if (!defaultColumnsList || defaultColumnsList == "") {
                defaultColumnsList = "Number, Short Description, Created Date, State, SLA Due Date";
               
               
              }
              this.initializeDefaultColumns(defaultColumnsList);
              let warningMsg: string = "";
              if (!prClrCd || prClrCd == "") {
                warningMsg += "PrimaryColourConditions key not found in ICMTickets mapping value";
              }
              if (!secClrCd || secClrCd == "") {
                warningMsg += "\nSecondaryColourConditions key not found in ICMTickets mapping value";
              }
              if (!(warningMsg.includes("PrimaryColourConditions") && warningMsg.includes("SecondaryColourConditions"))) {
                this.fetchColourConditions(prClrCd, secClrCd);
              }
              if (warningMsg != "") {
               
              }
              if (cnksz && cnksz != "" && !isNaN(Number(cnksz)) && (+cnksz) % 1 == 0 && (+cnksz) > 0) {
                this.chunkSize = +cnksz;
              }
              else {
                this.chunkSize = 500;
              }
  
              let errorMsg: string = "";
              if (!this.datasetName || this.datasetName == "") {
                errorMsg += "Dataset - ICMTickets";
              }
              if (!this.schemaName || this.schemaName == "") {
                if (errorMsg.includes("Dataset - ICMTickets")) {
                  errorMsg += " and Schema - ICMTickets";
                }
                else {
                  errorMsg += "Schema - ICMTickets";
                }
              }
              if (errorMsg == "") {
                this.lastRefreshDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy hh:mm:ss a");
                this.getColumnNamesAndPrmKys();
              }
              else if (errorMsg.includes("Dataset - ICMTickets") && errorMsg.includes("Schema - ICMTickets")) {
                errorMsg += " keys not found in ICMTickets mapping value";
              
                this.service.message(errorMsg, 'error')
              }
              else {
                errorMsg += " key not found in ICMTickets mapping value";
               
                this.service.message(errorMsg, 'error')
              }
            }
            catch (Exception) {
              
              this.service.message('Exception: '+  Exception, 'error')
             
            }
          }
          else {
           
            this.service.message('ICMTickets key not found in mappings', 'error')
          }
        },
          error => {
           
            this.service.message('Error in fetching configuration mapping', 'error')
           
          })
    }
    catch(Exception){
   
    this.service.message('Some error occured', 'error')
    }
   
  }

  goToPageNo($event) {
    let pgNo:number = parseInt($event.target.value);
    this.goToPage = pgNo;
    if(this.goToPage || this.goToPage==0){
      this.checkPageNo();
      this.page = this.goToPage - 1;
      this.paginatorFirstRow = this.page*this.rows;
      this.loadIncidents(this.searchIncident);
    }
  }

  checkPageNo(){
    if(this.goToPage || this.goToPage==0){
      if(this.goToPage<1) {
        this.goToPage = 1;
        setTimeout(() => document.getElementById("icm-go-to-page").children[0].children[0]['value'] = this.goToPage);
      }
      else if(this.goToPage>((this.length/this.rows)+1)){
        this.goToPage = Math.floor((this.length/this.rows)+1);
        setTimeout(() => document.getElementById("icm-go-to-page").children[0].children[0]['value'] = this.goToPage);
      }
    }
  }

  showTickets(inc) {
    if (!this.selectedTickets.includes(inc)) {
      this.selectedTickets.push(inc);
      if(!this.allTktsSltd && this.excludeIdsToTag.length==0){
        this.includeIdsToTag.push(inc);
        if(this.includeIdsToTag.length == this.length)  this.allTktsSltd = true
      }
      else {
        this.excludeIdsToTag.splice(this.excludeIdsToTag.indexOf(inc,0), 1);
        if(this.excludeIdsToTag.length==0 && this.includeIdsToTag.length==0)  this.allTktsSltd = true
      }
    }
    else {
      if(this.includeIdsToTag.length>0) this.includeIdsToTag.splice(this.includeIdsToTag.indexOf(inc,0), 1);
      this.selectedTickets.splice(this.selectedTickets.indexOf(inc,0), 1);
      if(this.allTktsSltd || this.excludeIdsToTag.length>0){
        this.allTktsSltd = false;
        this.excludeIdsToTag.push(inc);
      }
    }
  }
  getColumnNamesAndPrmKys() {
    try{
      this.busy = this.service.getSchemaByName(this.schemaName)
      .subscribe(resp => {
        if (typeof(resp)!="object") {
         
          this.service.message(resp, 'error')
        }
        else {
          let schemaContents:any[] = resp?.schemavalue?.length>0 ? JSON.parse(resp.schemavalue) : [];
          if(schemaContents?.length>0){
            schemaContents.sort((a,b)=>a['columnorder']-b['columnorder']);
            this.columnNamesList = schemaContents.map(ele=>ele['recordcolumnname']);
            this.columnHeadersList = schemaContents.map(ele=>ele['recordcolumndisplayname']);
            if (this.columnNamesList && this.columnNamesList.length < 1) {
             
              this.service.message('Error: Received empty list of columns names', 'error')
            }
            else {
              this.selectedColumn = this.columnNamesList[0];
              this.route.queryParams.subscribe((params) => {
                if(params['q']){
                let incomingSearchParams = decodeURIComponent(params['q']);
                let incomingSearchValues= decodeURIComponent(params['r']);
                let incomingSearchParamList: any[] = incomingSearchParams.split(",");
                let incomingSearchValueList: any[] = incomingSearchValues.split(",");
                for(let i=0; i<incomingSearchParamList.length; i++){
                  incomingSearchParamList[i] = incomingSearchParamList[i].trim();
                }
                for(let i=0; i<incomingSearchValueList.length; i++){
                  incomingSearchValueList[i] = incomingSearchValueList[i].trim();
                  if(incomingSearchValueList[i].includes("//")){
                    let tempArray:string[] = incomingSearchValueList[i].split("//");
                    for(let j=0; j<tempArray.length; j++){
                      tempArray[j] = tempArray[j].trim();
                    }
                    incomingSearchValueList[i] = tempArray;
                  }
                }
                this.fmFlrDsb = true;
                this.dashboardName = JSON.parse(sessionStorage.getItem("tempDashboard")).appname;
                sessionStorage.setItem("failureDashboardToTickets","True");
                this.refreshTicket(incomingSearchParamList, incomingSearchValueList);
                }
                else{
                  this.refreshTicket();
                  //this.fetchData();
                }
              })
            }
          } 
          else{
           
            this.service.message('Error: Linked schema is empty', 'error')
          }
        }
      })
    }
    catch(Exception){
    
    this.service.message('Some error occured', 'error')
    }
   
  }

  // showTickets()
  // {
  //   this.changeDetectorRefs.detectChanges();
  //   if(this.HighlightColor)
  //   {
  //     this.HighlightColor = false;
  //   }
  //   else
  //     this.HighlightColor = true;
  //  
  // }

  sidebarOpened() {
  }

  
  saveColumnChanges() {
    this.showColumnSelector = false;
  }

  cancelColumnChanges() {
    this.showColumnSelector = false;
  }

  backToFlrDsb(){
    try{
      if(sessionStorage.getItem("tempDashboard")){
        let flrDsbId = JSON.parse(sessionStorage.getItem("tempDashboard")).id;
        sessionStorage.removeItem("failureDashboardToTickets");
        this.router.navigate(["../../../cc/OCC/"+flrDsbId], { relativeTo: this.route });
      }
      else  
      this.service.message('Dashboard ID not found', 'error');
    }
    catch(Exception){
   
    this.service.message('Some error occured', 'error')
    
    }
   
  }

  saveSearchFilterExample(){
    this.incidentsService.setSearchFilterExample({searchExample:this.searchIncident, selectedTickets:this.selectedTickets});
  }

  trackByContent(index, item) {
    return item;
  }

  trackByField(index, item) {
    return item.field;
  }

  trackByNumber(index, item) {
    return item.number;
  }

  clearTimer() {
    clearTimeout(this.typingTimer);
  }

  onKey(event, columnName) {
  }

  setIncidentType() {
    let route = this.router.url;
    if(route.includes("?")) route = route.substring(0,route.indexOf("?"));
    if (route.endsWith("incident")) {
      this.selectedType = "Incident";
      this.viewSelectedType = "Incident"
    }
    else if (route.endsWith("alerts")) {
      this.selectedType = "Alerts";
      this.viewSelectedType = "Alert"
    }
    else if (route.endsWith("servicerequests")) {
      this.selectedType = "ServiceRequest";
      this.viewSelectedType = "Service Request"
    }
    else if (route.endsWith("changerequests")) {
      this.selectedType = "ChangeRequest";
      this.viewSelectedType = "Change Request"
    }
    else if (route.endsWith("tasks")) {
      this.selectedType = "Task"
      this.viewSelectedType = "Task"
    }
    else{
      this.selectedType = "Incident";
      this.viewSelectedType = "Incident";
    }
    if(this.selectedType == "task")
      this.typeAction = "Task";
    else
      this.typeAction = this.selectedType;
  }

  resolveTickets() {
    this.selectedTicketObj = this.selectedTicketObj.filter(inc => { if (this.selectedTickets.includes(inc.number)) return inc })
    this.ticketsService.setResolveIncidents(this.selectedTickets);
    this.ticketsService.setResolveIncidentsObj(this.selectedTicketObj);
    this.router.navigate(['../../resolve/tickets'], { relativeTo: this.route });
  }

  initChart(): void {
    let legendTracker:number[] = [];

    this.chartOptions = {
      series: [],
      chart: {
        type: "bar",
        height: 200,
        width:'98%',
        toolbar:{
          show:false
        },
        animations:
        {
          enabled: false,
        },
        zoom:
        {
          enabled: false,
        },
        events:{
          legendClick:(chartContext,seriesIndex,config)=>{            
          }
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth:'20%'
          
        }
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      legend:{
        show:true,
        position:"top",
        horizontalAlign:"right"
      },
      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5
        }
      },
      dataLabels: {
        enabled: false
      },
      markers:
      {
        size: 0
      },
      xaxis: {
        type: "datetime",
        min: undefined,
      },
      yaxis:{
        max:undefined,
        tickAmount:1,
        labels:
        {
          formatter:function(value){
            return Math.floor(value).toString();
          }
        }
      },
      tooltip: {
        enabled:true,
        x: {
          format: "dd MMM yyyy"
        }
      },  
      noData:{
        text:'Loading...'
      }
    };
  }


  viewGraph() {

    this.enableGraph = !this.enableGraph
    if(this.enableGraph && !this.graphLoaded)
    {
      this.fetchDataForChart();
      this.graphLoaded = true;
    }
  }

  selectedTktsTopMargin(){
    if(this.selectedTickets.length==0){
      return {"margin-top":"12px"};
    }
    // else{
    //   return {"margin-top":"5px"};
    // }
  }

  // storeTaggingData(){
  //   return new Promise(resolve => {
  //     if(this.selectedTickets && this.selectedTickets.length>0){
  //       let selTkts = this.ticketList.filter(ele=> this.selectedTickets.includes(ele['number']));
  //       if(selTkts && selTkts.length>0){
  //         this.dbService.getAll("tagsData").subscribe(resp=>{
  //           if(resp && resp.length>0){
  //             let unqIdList = resp.map(ele=>ele['uniqueIdentifier']);
  //             let deleteList = unqIdList.filter(ele=>!this.selectedTickets.includes(ele));
  //             if(deleteList && deleteList.length>0){
  //               deleteList.forEach(ele=>{
  //                 this.dbService.delete("tagsData",ele).subscribe(resp=>{}, err=>{});
  //                 unqIdList.splice(unqIdList.indexOf(ele),1);
  //               })
  //             }
  //             selTkts.forEach(ele=>{
  //               if(unqIdList.includes(ele['number'])){
  //                 this.dbService.update("tagsData",{uniqueIdentifier:ele['number'],tags:ele["tags"]}).subscribe(
  //                   res=>{ resolve("pass"); }, error=>{ resolve("pass"); }
  //                 )
  //               }
  //               else{
  //                 this.dbService.add("tagsData",{uniqueIdentifier:ele['number'],tags:ele["tags"]}).subscribe(
  //                   res=>{ resolve("pass"); }, error=>{ resolve("pass"); }
  //                 )
  //               }
  //             })
  //           }
  //           else{
  //             selTkts.forEach(ele=>{
  //               this.dbService.add("tagsData",{uniqueIdentifier:ele['number'],tags:ele["tags"]}).subscribe(
  //                 resp=>{ resolve("pass"); }, error=>{ resolve("pass"); }
  //               )
  //             })
  //           }
  //         })
  //       }
  //       else{
  //         resolve("pass");
  //       }
  //     }
  //     else{
  //       this.dbService.getAll("tagsData").subscribe(resp=>{
  //         if(resp && resp.length>0){
  //           this.clearTagsDataStore();
  //           resolve("pass");
  //         }
  //       })
  //     }
  //   });
  // }

  ngOnDestroy(){
    // this.clearTagsDataStore();
    if(this.downloading){
      let fileBlob = new Blob(this.csvData, { type: "text/csv" });
      importedSaveAs(fileBlob, this.viewSelectedType+"s-" + this.datepipe.transform(new Date(), "ddMMMyyyy-hhmmssa") + ".csv");
      this.downloadErrorLog += "\nDownload Termiated. Records from "
            + ((this.apiCount * this.chunkSize) + 1) + " were not downloaded.";
      let errorBlob = new Blob([this.downloadErrorLog], { type: "text/plain" });
      importedSaveAs(errorBlob, "DownloadErrorLog-" + this.datepipe.transform(new Date(), "ddMMMyyyy-hhmmssa") + ".txt");
      this.msHvr = false;
      this.downloading = false;
    }
  }

  // clearTagsDataStore(){
  //   this.dbService.clear("tagsData").subscribe(resp=>{}, err=>{});
  // }
  
  powerModeToggle($event)
  {
    this.page = 0;
    // if(this.powerMode){
    //   this.loadIncidents(this.pmSearch);
    //   this.page = 1;
    // }
    // else{
      this.pmSearch["type"] = [{ "property": "type", "equality": "like", "value": this.selectedType }];
    this.searchIncident = this.pmSearch
    this.searchOnInput();
      // this.loadIncidents(this.searchIncident);
    // }
  }

  updateDetails(incident)
  {
    this.viewIncident = incident['number'];
    this.selectedTicket = incident;
  }

  onScroll(event)
  {
    try{
      let example = {};
      let project = new Project();
      project = JSON.parse(sessionStorage.getItem("project"));
      let projName: string = project.name;
      if(this.pmSearch && Object.keys(this.pmSearch) && Object.keys(this.pmSearch).length>0){
        example = this.pmSearch;
      }
      else{  
        // example['projectid'] = project.id;
        example['type'] = this.selectedType;
      }
      let pagination = { 'page': this.page, 'size': this.rows, 'sortEvent': this.sortEvent, 'sortOrder': this.sortorder }
      if (this.selectedUserType == "My") {
        example['assignedto'] = this.user_name.user_login;
      }
      if ((event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) 
          && (this.powerModeTicketList.length<this.length)) {
        this.busy = this.service.searchTicketsUsingDataset1(this.datasetName, projName, pagination, example)
        .subscribe(
          (pageResponse) => {
            if (typeof pageResponse == "string") {
             
              this.service.message(pageResponse, 'error')
              
            }
            else {
              pageResponse.forEach((element) => {
                element = this.incidentsService.mapImpactValues(element);
                if(element){
                    Object.keys(element).map(ky=>{if(element[ky]) element[ky]=element[ky].toString()});
                    this.powerModeTicketList.push(element);
                }
              });
              // if(this.powerModeTicketList.length>2*this.rows)
              // {
              //   this.powerModeTicketList = this.powerModeTicketList.splice(0,this.rows)
              // }
            }
            this.page = this.page+1;
          },
          (error) => {
            this.fetchCompleted = false;
           
            this.service.message('Could not get the results', 'error')
          }
        );
      }
      // else if(event.target.scrollTop == 0 && this.page>-1)
      // {
      //   this.page = this.page - 1;
      //   this.busy = this.incidentsService.searchTicketsUsingDataset(this.datasetName, projName, pagination, example)
      //   .subscribe(
      //     (pageResponse) => {
      //       if (typeof pageResponse == "string") {
      //         this.messageService.error(pageResponse, "Ticket Management");
      //       }
      //       else {
      //         pageResponse.forEach((element) => {
      //           element = this.incidentsService.mapImpactValues(element);
      //           this.powerModeTicketList.unshift(element);
      //         });
      //         if(this.powerModeTicketList.length>2*this.rows)
      //         {
      //           this.powerModeTicketList = this.powerModeTicketList.splice(2*this.rows,3*this.rows)
      //         }
      //       }
      //      
      //     },
      //     (error) => {
      //       this.fetchCompleted = false;
      //       this.messageService.error("Could not get the results", "IAMP");
      //     }
      //   );
      // }
    }
    catch(Exception){
   
    this.service.message('Some error occured', 'error')
    }
  


}

powerModeSearch()
{
  try{
    this.powerModeFetch = true;
    this.pmSearch = {};
    let project = new Project();
    project = JSON.parse(sessionStorage.getItem("project"));
    // this.pmSearch['projectid'] = project.id;
    this.pmSearch[this.selectedColumn] = [{ "property": this.selectedColumn, "equality": "like", "value": this.powerModeInputValue }];
    this.pmSearch["type"] = [{ "property": "type", "equality": "like", "value": this.selectedType }];
    // this.searchIncident = this.pmSearch
    // this.pmSearch['type'] = this.selectedType;
    // this.pmSearch[this.selectedColumn] = this.powerModeInputValue;
    let andList = []
    Object.keys(this.pmSearch).forEach(ele => {
      if (this.pmSearch[ele]) {
        if ((this.pmSearch[ele]).length == 1) {
          andList.push({ "or": this.pmSearch[ele][0] });
        }
        else {
          andList.push({ "or": this.pmSearch[ele] });
        }
      }
    });
    this.andObj["and"] = andList;
    // if(this.powerMode)  this.loadIncidents(this.pmSearch);
      this.loadIncidents(this.andObj);
    this.page = 1;
  }
  catch(Exception){

  this.service.message('Some error occured', 'error')
  }

}
powerModeInput(event)
{
  this.powerModeInputValue = event.target.value
}
fetchDataForChart()
{
  try{
    this.chart.updateOptions({noData:{text:'Loading...'}})
    this.chart.updateSeries([{name:'',data:[]}]);
    this.filterIncident = {};
      let project: Project = JSON.parse(sessionStorage.getItem("project"));
      // this.filterIncident['projectid'] = project.id;
      this.filterIncident['type'] = this.typeAction;
      let startDate;
      let endDate;
      let columnName = "createdDate";
      this.filterIncident['priority'] = this.priorityAction.substring(0,1);
      this.filterDate = new Date();
      if(this.dateAction == "month"){
        startDate = this.datepipe.transform( new Date(this.filterDate.getFullYear(), this.filterDate.getMonth() - 1, this.filterDate.getDay()),'yyyy-MM-dd');
        endDate = this.datepipe.transform(new Date(),"yyyy-MM-dd");
      }
      else if(this.dateAction == "year"){
        startDate = this.datepipe.transform(new Date(this.filterDate.getFullYear() - 1, this.filterDate.getMonth(), this.filterDate.getDay()),'yyyy-MM-dd');
        endDate = this.datepipe.transform(new Date(),"yyyy-MM-dd");
      }
      else if(this.dateAction == "all"){
        startDate = this.datepipe.transform(new Date(this.filterDate.getFullYear()-10, this.filterDate.getMonth(), this.filterDate.getDay()),'yyyy-MM-dd');
        endDate = this.datepipe.transform(new Date(),"yyyy-MM-dd");
      }
     this.filterIncident['createdDate'] = "%' and createdDate>='" + startDate + " 00:00:00' and createdDate<='" + endDate + " 23:59:59' and createdDate like '%";
  
      let projName: string = project.name;
      let pagination = { 'page': 0, 'size': this.rows, 'sortEvent': this.sortEvent, 'sortOrder': this.sortorder }
      if(this.typeAction!='All')
      {
      this.chartData.clear();
      this.service.getTicketsForRange(this.datasetName, projName, pagination, this.filterIncident,this.dateAction,columnName)
      .subscribe(
        (pageResponse) => {
          if (typeof pageResponse == "string") {
            
            this.service.message(pageResponse, 'error')
          }
          else {
            var mapper: Map<any, any> = new Map(Object.entries(pageResponse));
            //mapper = pageResponse;
            
            let filterType = [];
            for (let entry of Array.from(mapper.entries())) {
              filterType.push({ x: entry[0], y: entry[1] });
            }
            if(filterType.length>0)
            this.chartData.set(this.typeAction,filterType);
        
            if (this.typeAction != 'All') {
              this.dataMapper =
                [{
                  name: this.typeAction,
                  data: this.chartData.get(this.typeAction)
                }]
            }
            else {
              this.dataMapper = [];
              this.ticketTypeList.forEach(type => this.dataMapper.push({
                name: type,
                data: this.chartData.get(type)
              }))
            }
            // if(this.chartData.get(this.typeAction)[0].y<5){
            //   this.chart.updateOptions({yaxis:{
            //     max:undefined,
            //     tickAmount:2,
            //     labels:
            //     {
            //       formatter:function(value){
            //         return Math.floor(value).toString();
            //       }
            //     }
            //   }})
            // }
            // else
            // {
            //   this.chart.updateOptions({yaxis:{
            //     max:undefined,
            //     tickAmount:undefined,
            //     labels:
            //     {
            //       formatter:function(value){
            //         return Math.floor(value).toString();
            //       }
            //     }
            //   }})
            // }
            this.chart.updateSeries(this.dataMapper);
            this.chart.updateOptions(this.updateOptionsData[this.dateAction], false, true, true)
            this.chart.updateOptions({noData:{text:'No Data'}})
            this.chart.updateOptions({plotOptions:{bar:{columnWidth:'15%'}}})
            //this.initChart();
          }
        },
        (error)=>{
          this.chart.updateOptions({noData:{text:'No Data'}});
        }
    );
      }
      else
      {
      this.chartData.clear();
      this.ticketTypeList.forEach(type=>
        {
      this.filterIncident['type'] = type;
      this.service.getTicketsForRange(this.datasetName, projName, pagination, this.filterIncident,this.dateAction,columnName)
      .subscribe(
        (pageResponse) => {
          if (typeof pageResponse == "string") {
           
            this.service.message(pageResponse, 'error')
          }
          else {
            var mapper: Map<any, any> = new Map(Object.entries(pageResponse));
            //mapper = pageResponse;
  
            
            let filterType = [];
            for (let entry of Array.from(mapper.entries())) {
              filterType.push({ x: entry[0], y: entry[1] });
            }
            this.chartData.set(type,filterType);
          }
          },
          (error)=>{
              this.chart.updateOptions({noData:{text:'No Data'}});
          },
          ()=>{
            if(this.chartData.size == this.ticketTypeList.length){
              this.dataMapper = [];
              this.ticketTypeList.forEach(type => {
                if(this.chartData.get(type).length>0)
                this.dataMapper.push({
                name: type,
                data: this.chartData.get(type)
                })
              })
              if(this.dataMapper.length == 1){
                this.dataMapper = [];
              }
              this.chart.updateSeries(this.dataMapper);
              this.chart.updateOptions(this.updateOptionsData[this.dateAction], false, true, true)
              this.chart.updateOptions({noData:{text:'No Data'}})
              this.chart.updateOptions({plotOptions:{bar:{columnWidth:'20%'}}})
            }
          });
          });
          
      }
    
      // console.log("value of ticketTypeList:",this.ticketTypeList);
  }
  catch(Exception){
  
  this.service.message('Some error occured', 'error')
  }
}

  changeColumnVisibility(){
    let visibleColumns = this.cols.filter(ele=>ele['visible']);
    if(visibleColumns){
      if(visibleColumns.length<=1)  this.minColsCountReached = true;
      else if(visibleColumns.length>=10)this.maxColsCountReached = true;
      else{
        this.minColsCountReached = false;
        this.maxColsCountReached = false;
      }
    }
  }

 
  toggleHeaderChkbx(){
    this.selectedTickets = [];
    if(this.allTktsSltd){
      this.ticketList.forEach(ele=>{ this.selectedTickets.push(ele['number']) });
      this.includeIdsToTag = [];
    }
    // else {
      // let numberList = this.ticketList.map(ele=>ele['number'])
      // this.selectedTickets = this.selectedTickets.filter(ele=>!numberList.includes(ele))
      // this.selectedTickets = [];
      // this.excludeIdsToTag = [];
    // }
    this.excludeIdsToTag = [];
    // this.includeIdsToTag = this.includeIdsToTag.slice();
    // this.excludeIdsToTag = this.excludeIdsToTag.slice();
    // this.selectedTickets = this.selectedTickets.slice();
  }

  checkIfAllTicketsSelected(){
    // let sltdTktsOnPg = this.ticketList.filter(ele=>this.selectedTickets.includes(ele['number']))
    // this.allTktsSltd = !(sltdTktsOnPg.length<this.ticketList.length)
    if(this.allTktsSltd || this.excludeIdsToTag?.length>0){
      this.selectedTickets = [];
      this.selectedTickets = this.ticketList.map(ele=>ele['number']).filter(ele=>!this.excludeIdsToTag.includes(ele)).slice();
    }
  }

  resetTicketsSelection(){
    this.allTktsSltd = false;
    this.selectedTickets = [];
    this.includeIdsToTag = [];
    this.excludeIdsToTag = [];
  }

kk(){

}
toggleSelectAllColsToDwnld() {
  this.cols.forEach(col => col.selected = this.selectAllColsToDwnld);

  // Update colstodownload based on the selection
  this.colsToDownload = this.selectAllColsToDwnld
    ? this.cols.map(col => col.field)
    : [];
}
}

@Pipe({name: 'visibleColsCount', pure: false})
export class FilterByVisibleColumn implements PipeTransform {
  transform(cols: any[]): number {
    if (cols && cols.length>0) {
      return cols.filter(ele=>ele['visible']).length+1;
    }
  }
 
}
//  this.service.message('Please enter required details', 'error')
//    this.service.message("Created Successfully", 'success');