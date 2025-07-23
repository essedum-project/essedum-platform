import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, Pipe, PipeTransform } from '@angular/core';
import { Dataset } from '../datasets';
import { saveAs as importedSaveAs } from "file-saver";
import { Services } from '../../services/service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from "@angular/common";
import { MatTableDataSource } from '@angular/material/table';
import * as _ from "lodash";
import { Project } from '../../DTO/project';
import { DatasetServices } from '../dataset-service';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-dataset-table-view',
  templateUrl: './dataset-table-view.component.html',
  styleUrls: ['./dataset-table-view.component.scss']
})
export class DatasetTableViewComponent implements OnInit {
  @Input('datasetname') inpdataset;
  @Input('datasetAlias') alias;
  @Input('pipelineData') pipelineData: boolean = false;
  @Output('result') result = new EventEmitter();
  filterjson = { "and": [] };
  @Input('params') params;
  @Input('id') id;
  @Input('isRest') isRest;
  @Input('formParam') formParam;
  @Input('data') data: Dataset;
  @Input('itsm') itsm: boolean;
  @Input('isItsm') isItsm: boolean;
  @Input('incident') incident;
  @Input('instanceName') instanceName;
  @Input('tickets') tickets;
  showSpinnertable: boolean = true;
  showAddTagBtn: boolean = false;
  datasetsCount: number;
  selectedDatasetsCount: number = 0;
  upload: any;
  fullscreenView: boolean;
  sidebarHeight: any = {};
  searchIncidentObj = {};
  sampleQueries = [];
  analyticData = [];
  samples: string[] = [
    "and",
    "in",
    "not in",
    "or",
    ">>",
    "COUNT( ) as",
    "max( ) as",
    "min( ) as",
    "avg( ) as",
    ">",
    "<",
    "=",
    ">=",
    "<=",
    "!=",
    "<>"
  ];
  datasetName: string = "";
  busy: any;
  dataset: any;
  schemaName: any;
  datasetAlias: any;
  rowObj: any;
   
  schemaFormTemplate: any = {};
  asChildView: boolean = false;
  actionsList: {}[] = [];
  action: string;
  unqId: string;
  sortEvent: any = "";
  lastRefreshDate: any = "";
  columnNamesList: string[] = [];
  columnHeadersList: string[] = [];
  showPublicDataset: boolean;
  fmFlrDsb: boolean;
  ticketList: any[] = [];
  ticketListBackup: any[] = [];
  displayedColumns: any;
  showColumnSelector: boolean = false;
  downloading: boolean = false;
  bsyGtngDwnldCnt: boolean = false;
  newDatasource: any;
  oldSortEvent: any = "";
  page: number;
  goToPage: null;
  paginatorFirstRow: number;
  rows: any = 10;
  cols: any[] = [];
  colsBackup: any[] = [];
  lastPage: number;
  sortorder: any = -1;
  allIdsSelected: boolean = false;
  selectedTickets: any[] = [];
  excludeIdsFromSelected: string[] = [];
  includeIdsFromSelected: string[] = [];
  andObj = { "and": [] };
  includeIdsToSelected: string[] = [];
  formView: boolean = false;
  prev_openedRow: any[] = [];
  displayTableFilters: boolean = false;
  collectionSize: number = 70;
  page1: number = 4;
  maxSize: number = 10;
  length: number;
  showcipDtstCols: boolean = false;
  selectAllColsToDwnld: boolean = false;
  colsToDownload: string[] = [];
  csvData: string[] = [];
  downloadErrorLog: string = "";
  apiCount: number = 0;
  downloadPercentage: number = 0;
  cancelDownload: boolean = false;
  chunkSize: number = 500;
  search: any;
  recipeName: any;
  selectedRecipe: any;
  searchToggle: boolean = false;
  basicReqTab: any = 'create';
  showRecipe: boolean = true;
  showWranglingData: boolean = false;
  WranglingFileData;
  recipeList: any[] = [{ viewValue: 'w1', value: 'w1' }, { viewValue: 'Test', value: 'Test' }];
  showSpinner: boolean = false;
        appLoading: boolean = true;


  constructor(
    private datepipe: DatePipe,
    private service: Services,
    private router: Router,
    private route: ActivatedRoute,
    private changeDetectorRefs: ChangeDetectorRef,
    private datasetsService: DatasetServices,
    private dialog: MatDialog,
  ) {

  }
  name_id: any;
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.name_id = params['cname'];
    });

    this.pipelineData
    this.getSourceApiParameters();

    if (this.router.url.includes("/view")) this.fullscreenView = true;
    else this.fullscreenView = false;
    if (!this.fullscreenView) this.sidebarHeight = { "margin-top": "28vh", "height": "72vh" };
    this.searchIncidentObj = {};
    this.sampleQueries = _.cloneDeep(this.samples);
  }


  getSourceApiParameters() {
              this.appLoading = true;

    try {
      try {
        if (this.router.url.includes("/workflows/")) throw '';
        this.route.params.subscribe(param => {
          this.datasetName = param['name'];
        })
      }
      catch (Exception) {
        this.datasetName = this.data?.name;
      }
      if (this.datasetName == undefined) {
        this.datasetName = this.data?.name;
      }
      if (this.inpdataset) this.datasetName = this.inpdataset
      if (!this.datasetName || this.datasetName.replace(/\s/g, "").length < 1) {
        if (sessionStorage.getItem("isSbx") != "true") this.service.message("Dataset name not found ", "error");
      }
      else {
        this.busy = this.datasetsService.getDataset(this.datasetName)
          .subscribe(resp => {
            if (resp) {
              this.dataset = resp;
              this.showSpinnertable = false;
              this.dataset.schema ? this.schemaName = this.dataset.schema : this.schemaName = "";
              this.datasetAlias = this.dataset.alias;
              let actionToBeCompared: string;
              if (((this.dataset.attributes && JSON.parse(this.dataset.attributes)['isApprovalRequired'])
                || (this.dataset.attributes && JSON.parse(this.dataset.attributes)['isInboxRequired'])))
                actionToBeCompared = this.rowObj['action']
              else actionToBeCompared = "update";
              this.getDatasetFormTemplate()
                        this.appLoading = false;
                        let response: number = +resp;
                this.datasetsCount = response;

            }
            else { this.service.message("Dataset details not found", "error") 
                                      this.appLoading = false;

            }
          },
            error => { this.service.message("Error in fetching dataset details", "error")
                                      this.appLoading = false;

             })
      }
    }
    catch (Exception) {
      this.service.message("Some error occured", "error")
    }

  }

  getDatasetFormTemplate() {
    this.service.getDatasetForm(this.dataset.name).subscribe(resp => {
      this.schemaFormTemplate = resp[0]?.formtemplate?.formtemplate
      if (this.asChildView) this.actionsList = [];
      JSON.stringify(this.schemaFormTemplate, (_, nestedValue) => {
        if (nestedValue && nestedValue['type'] == "button"
          && (nestedValue['key'] == "refresh" || nestedValue['key'] == "internalNavigation"
            || nestedValue['key'] == "eventTrigger" || nestedValue['key']?.startsWith("externalNavigation")
            || (nestedValue['key']?.startsWith("multipleActions") && nestedValue['properties'] && Object.keys(nestedValue['properties']).every(ele => ele != "submit" && ele != "reset")))) {
          this.actionsList.push({
            "name": nestedValue['key'], "properties": nestedValue['properties'], "leftIcon": nestedValue['leftIcon'],
            "rightIcon": nestedValue['rightIcon'], "tooltip": nestedValue['tooltip']?.length > 0 ? nestedValue['tooltip'] : nestedValue['key']
          });
        }
        return nestedValue;
      });
      this.actionsList.forEach(action => {
        if ((!action['leftIcon'] || action['leftIcon'].replace(/\s/g, "").length == 0) && (!action['rightIcon'] || action['rightIcon'].replace(/\s/g, "").length == 0)) {
          if (action['name'] == "refresh") action['icon'] = "fa fa-refresh";
          else if (action['name'] == "internalNavigation") action['icon'] = "fa fa-cog";
          else if (action['name'] == "eventTrigger") action['icon'] = "fa fa-play";
          else if (action['name'].startsWith("externalNavigation")) action['icon'] = "fa fa-external-link-alt";
          else if (action['name'].startsWith("multipleActions")) action['icon'] = "fa fa-cogs";
        }
        else if (action['leftIcon']?.replace(/\s/g, "").length > 0) action['icon'] = action['leftIcon'];
        else if (action['rightIcon']?.replace(/\s/g, "").length > 0) action['icon'] = action['rightIcon'];
      })
      this.dataset.type == "rw" ? this.action = 'update' : this.action = 'view';
      (this.dataset.attributes && JSON.parse(this.dataset.attributes)['uniqueIdentifier']) ?
        this.unqId = JSON.parse(this.dataset.attributes)['uniqueIdentifier'] :
        this.unqId = undefined;
      if (this.unqId) this.sortEvent = this.unqId;


      this.lastRefreshDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy hh:mm:ss a");
      this.getColumnNamesAndPrmKys();

    })
  }

  createNew() {
    this.action = "new";
    this.formView = true;

  }
  getColumnNamesAndPrmKys() {
    try {
      if (this.schemaName && this.schemaName.trim().replace(/\s/g, '').length > 0) {
        this.busy = this.service.getSchemaByName(this.schemaName)
          .subscribe(resp => {
            if (typeof (resp) != "object") {
              this.service.message('Error! '+resp, "error");
            }
            else {
              let schemaContents: any[] = resp ? resp.schemavalue ? JSON.parse(resp.schemavalue) : [] : [];
              if (schemaContents && schemaContents.length < 1) {
                this.service.message("Error: Linked schema is empty", "error");
              }
              else {
                schemaContents.sort((a, b) => a['columnorder'] - b['columnorder']);
                this.columnNamesList = schemaContents.map(ele => ele['recordcolumnname']);
                this.columnHeadersList = schemaContents.map(ele => ele['recordcolumndisplayname']);
                this.checkRouteQueryParams();
              }
            }
          })
      }
      else if (this.isRest) {
        this.showPublicDataset = true
        this.service.getDatasource(this.dataset?.datasource).subscribe(resp => {
          this.busy = this.service.getProxyDatasetDetails(this.dataset, resp, this.formParam, null, sessionStorage.getItem("organization")).subscribe(res => {
            this.displayedColumns = Object.keys(res[0]);
            this.newDatasource = new MatTableDataSource(res);
          })
        })
      }
      else {
        let pagination: any = { page: 0, size: 1 };
        this.service.getPaginatedDetails(this.dataset, pagination).subscribe(resp => {
          this.columnNamesList = [];
          this.columnHeadersList = [];
          if (resp && resp.body[0]) {
            if (this.asChildView) {
              this.columnNamesList = [];
              this.columnHeadersList = [];
            }
            Object.keys(resp.body[0]).forEach((ky) => {
              this.columnNamesList.push(ky);
              this.columnHeadersList.push(ky);
            })
            this.checkRouteQueryParams();
          }
          else {
            this.service.message("Dataset query returned no results", "error");
          }
        },
          error => {
            if (this.asChildView) {
              this.service.message('Error! '+error, "error");
              this.columnNamesList = [];
              this.columnHeadersList = [];
              this.ticketList = [];
              this.ticketListBackup = [];
              this.datasetsCount = 0;
            }
          })
      }
    }
    catch (Exception: any) {
      this.service.message("Error "+Exception, "error")
    }

  }

  checkRouteQueryParams() {
    if (this.columnNamesList && this.columnNamesList.length < 1) {
      this.service.message("Received empty list of columns names", "error");
    }
    else {
      if (!(this.sortEvent?.trim().length > 0))
        this.sortEvent = this.columnNamesList[0];
      this.showAddTagBtn = this.columnNamesList.includes("tags");
      this.createColumn();
      this.route.queryParams.subscribe((params) => {
        if (params['q']) {
          let incomingSearchParams = decodeURIComponent(params['q']);
          let incomingSearchValues = decodeURIComponent(params['r']);
          let incomingSearchParamList: any[] = incomingSearchParams.split(",");
          let incomingSearchValueList: any[] = incomingSearchValues.split(",");
          for (let i = 0; i < incomingSearchParamList.length; i++) {
            incomingSearchParamList[i] = incomingSearchParamList[i].trim();
          }
          for (let i = 0; i < incomingSearchValueList.length; i++) {
            incomingSearchValueList[i] = incomingSearchValueList[i].trim();
            if (incomingSearchValueList[i].includes("//")) {
              let tempArray: string[] = incomingSearchValueList[i].split("//");
              for (let j = 0; j < tempArray.length; j++) {
                tempArray[j] = tempArray[j].trim();
              }
              incomingSearchValueList[i] = tempArray;
            }
          }
          // To Be Generalised
          this.fmFlrDsb = true;
          sessionStorage.setItem("failureDashboardToTickets", "True");
          this.refreshTicket(incomingSearchParamList, incomingSearchValueList);
        }
        else {
          this.refreshTicket();
        }
      })
    }
  }

  refreshTicket(decodedSPrList?: any[], decodedSValList?: any[]) {
                            this.appLoading = true;

    try {

      if (sessionStorage.getItem("failureDashboardToTickets") == "True") {
        this.fmFlrDsb = true;
      }
      this.oldSortEvent = this.sortEvent;
      this.ticketList = [];
      let example = {};
      let project = new Project();
      this.searchIncidentObj = {};
      let objList = [];
      let finalOrObj = { "or": [] };
      let finalAndObj = { "and": [] };
      this.page = 0;
      this.goToPage = null;
      this.paginatorFirstRow = 0;
      project = JSON.parse(sessionStorage.getItem("project"));

      let projName: string = project.name;
      let pagination = { 'page': this.page, 'size': this.rows, 'sortEvent': this.sortEvent, 'sortOrder': this.sortorder }

      if (decodedSPrList && decodedSValList) {
        // To Be Generalised
        decodedSPrList.forEach((param, index) => {
          let decodedCol = this.cols.filter(ele => {
            if (ele['field']) return ele['field'].toLowerCase() == param.toLowerCase();
          });
          decodedCol = decodedCol[0];
          if (decodedCol && decodedCol['field'] && decodedSValList[index]) {
            if (Array.isArray(decodedSValList[index])) {
              decodedSValList[index].forEach(ele => {
                objList.push({ "property": decodedCol['field'], "equality": "like", "value": ele });
              });
              finalOrObj.or = objList;
              finalAndObj.and.push(finalOrObj);
              finalOrObj = { "or": [] };
            }
            else {
              finalAndObj.and.push({ "or": { "property": decodedCol['field'], "equality": "like", "value": decodedSValList[index] } });
            }
            if (decodedCol['field'].toLowerCase() != "type" && decodedCol['field'].toLowerCase() != "projectid") {
              decodedCol['visible'] = true;
              if (Array.isArray(decodedSValList[index])) decodedCol['filterValue'] = decodedSValList[index].toString();
              else decodedCol['filterValue'] = decodedSValList[index];
            }
          }
        })
        this.searchIncidentObj = finalAndObj;
        this.colsBackup.forEach(item => {
          let matchingCol = this.cols.filter(ele => item['header'] == ele['header'])[0];
          if (matchingCol) matchingCol['field'] = item['field'];
        });
      }

      else {
        this.searchIncidentObj = {};
        this.cols.map(ele => ele['filterValue'] = null);
      }
      if (!this.itsm && !this.tickets) {
        let queryParams: any = { number: this.id }
        let queryParamsJson = JSON.stringify(queryParams);
        this.service.getSearchCount(this.datasetName, projName, finalAndObj, queryParamsJson).
          subscribe(resp => {
            if (resp) {

              if (resp.startsWith("Error: ")) {
                        this.appLoading = false;

              }
              else {
                                        this.appLoading = false;

                let response: number = +resp;
                this.datasetsCount = response;
                // this.analyticsDatas(this.searchIncidentObj,finalAndObj,paramObj,this.datasetsCount);
                this.initializePaginationVariables();
              }
            }
          },
            error => { console.log(error)
                                      this.appLoading = false;

             }
          )
      }
      let paramObj;
      if (this.params) {
        paramObj = {}
        this.params.forEach(param => {
          paramObj[param] = this.id
        })
      }

      if (!this.itsm && !this.tickets) {
        if (this.showWranglingData) {
          pagination = { 'page': this.page, 'size': this.datasetsCount, 'sortEvent': this.sortEvent, 'sortOrder': this.sortorder };
        }
        this.busy = this.service.searchTicketsUsingDataset(this.datasetName, projName, pagination, finalAndObj, paramObj)
          .subscribe(
            (pageResponse: any) => {
              if (typeof pageResponse == "string") {
                this.service.message("Error "+pageResponse, "error");
                this.ticketList = this.ticketListBackup;
                                        this.appLoading = false;

              }
              else {
                this.ticketList = [];
                pageResponse.forEach((element) => {
                  if (element) {
                    Object.keys(element).map(ky => { if (element[ky]) element[ky] = element[ky].toString() });
                    this.ticketList.push(element);
                  }
                });
                if (this.showWranglingData) {
                  this.WranglingFileData = [];
                  this.WranglingFileData = this.ticketList
                  this.showSpinner = false;
                }
                else {
                  this.ticketListBackup = this.ticketList;
                }
                                        this.appLoading = false;

              }
            },
            (error) => {
              this.service.message("Could not get the results", "error");
              this.ticketList = this.ticketListBackup;
                                      this.appLoading = false;

            }
          );
      } else if (this.tickets) {
        this.searchOnInputForSemanticSearchResult(this.tickets)
                                this.appLoading = false;

      } else {
        let queryParams: any = { number: this.id }
        let queryParamsJson = JSON.stringify(queryParams);
        if (this.incident.remshortdescription != null) {
          this.incident.shortdescription = this.incident.remshortdescription;
        }
        const body = { "query": this.incident };
        this.busy = this.service.getAiOpsData('similarTickets', body, this.instanceName)
          .subscribe(
            (pageResponse: any) => {
              if (typeof pageResponse == "string") {
                this.service.message("Error "+pageResponse, "error");
                this.ticketList = this.ticketListBackup;
              }
              else {
                this.ticketList = []
                Object.keys(pageResponse.body.Answer).forEach((keyIndex) => {
                  let element = pageResponse.body.Answer[keyIndex];
                  if (element) {
                    Object.keys(element).map(ky => { if (element[ky]) element[ky] = element[ky].toString() });
                    this.ticketList.push(element);
                  }
                });
                this.datasetsCount = this.ticketList.length;
                this.ticketListBackup = this.ticketList;
                                        this.appLoading = false;

              }
            },
            (error) => {
              this.ticketList = this.ticketListBackup;
                                      this.appLoading = false;

            }
          );
      }

    }
    catch (Exception: any) {
      this.service.message("Error "+Exception, "error")
                              this.appLoading = false;

    }

  }

  initializePaginationVariables() {
    if (this.datasetsCount > 0) {
      var remainder = this.datasetsCount % this.rows;
      var cof = (this.datasetsCount - remainder) / this.rows;
      if (remainder != 0) {
        this.lastPage = cof;
      } else {
        this.lastPage = cof - 1;
      }
    } else {
      if (this.datasetsCount == 0) {
        this.page = 0;
        this.lastPage = 0;
      }
    }
  }

  searchValueAdder(event, columnName: string, dateIndicator?: string) {
    if (event.target.value != "") {
      if (event.target.value.includes(",")) {
        let filterValueList = event.target.value.split(",");
        let objList = [];
        filterValueList = filterValueList.map(ele => ele.trim()).filter(ele => ele != "");
        filterValueList.forEach(ele => {
          objList.push({ "property": columnName, "equality": "like", "value": ele })
        });
        this.searchIncidentObj[columnName] = objList;
      } else {
        this.searchIncidentObj[columnName] = [{ "property": columnName, "equality": "like", "value": event.target.value }];
      }
    }
    else {
      this.searchIncidentObj[columnName] = undefined;
    }
  }

  searchOnInput() {
    let hasTruthyValue = Object.keys(this.searchIncidentObj).some(key => Boolean(this.searchIncidentObj[key]));
    if (!hasTruthyValue && this.tickets)
      this.constructSearchIncidentObj(this.cols, this.tickets);

    let andList = []
    Object.keys(this.searchIncidentObj).forEach(ele => {
      if (this.searchIncidentObj[ele]) {
        if ((this.searchIncidentObj[ele]).length == 1) {
          andList.push({ "or": this.searchIncidentObj[ele][0] });
        }
        else {
          andList.push({ "or": this.searchIncidentObj[ele] });
        }
      }
    });
    this.andObj["and"] = andList;
    this.page = 0;
    this.goToPage = null;
    this.paginatorFirstRow = 0;
    this.resetSelection();
    this.loadObjects(this.andObj);
  }

  sortData(column) {
    this.sortEvent = column;
    if (this.oldSortEvent == this.sortEvent) {
      this.sortorder = -1 * this.sortorder;
    } else {
      this.sortorder = -1;
    }
    this.oldSortEvent = this.sortEvent;
    this.loadObjects(this.andObj);
  }
  quickStatsData: any = '';

  loadObjects(exampleIncident: any) {
    try {
      if (!exampleIncident) exampleIncident = {};
      this.ticketList = [];
      let project = new Project();
      project = JSON.parse(sessionStorage.getItem("project"));
      let projName: string = project.name;
      let pagination = { 'page': this.page, 'size': this.rows, 'sortEvent': this.sortEvent, 'sortOrder': this.sortorder };
      let paramObj = {}
      if (this.params) {
        this.params.forEach(param => {
          paramObj[param] = this.id
        })
      }

      if (!this.itsm) {
        this.busy = this.service.searchTicketsUsingDataset(this.datasetName, projName, pagination, exampleIncident)
          .subscribe(res => {
            if (typeof res == "string") {
              this.service.message("Error "+res, "error");
              this.ticketList = this.ticketListBackup;
            }
            else {
              res.forEach((ele) => {
                if (ele) {
                  Object.keys(ele).map(ky => { if (ele[ky]) ele[ky] = ele[ky].toString() });
                  this.ticketList.push(ele);
                }
              });
              if (this.unqId) {
                this.ticketList = this.ticketList.filter((elem, index, self) => {
                  return (
                    index ===
                    self.findIndex((ele) => {
                      return ele[this.unqId] === elem[this.unqId];
                    })
                  );
                });
              }
              this.ticketListBackup = this.ticketList;
              this.checkIfAllIdsSelected();
              this.changeDetectorRefs.detectChanges();
            }

          },
            error => {
              this.service.message("Some error occurred while fetching data", "error");
              this.ticketList = this.ticketListBackup;
            });
      } else {
        let queryParams: any = { number: this.id }
        let queryParamsJson = JSON.stringify(queryParams);
        if (this.incident.remshortdescription != null) {
          this.incident.shortdescription = this.incident.remshortdescription;
        }
        const body = { "query": this.incident };
        this.busy = this.service.getAiOpsData('similarTickets', body, this.instanceName)
          .subscribe(
            (pageResponse: any) => {
              if (typeof pageResponse == "string") {
                this.service.message("Error "+pageResponse, "error");
                this.ticketList = this.ticketListBackup;
              }
              else {
                this.ticketList = []
                Object.keys(pageResponse.body.Answer).forEach((keyIndex) => {
                  let element = pageResponse.body.Answer[keyIndex];
                  if (element) {
                    Object.keys(element).map(ky => { if (element[ky]) element[ky] = element[ky].toString() });
                    this.ticketList.push(element);
                  }
                });
                this.datasetsCount = this.ticketList.length;
                this.ticketListBackup = this.ticketList;
              }
            },
            error => {
              this.ticketList = this.ticketListBackup;
            });
      }


      let queryParams: any = { number: this.id }
      let queryParamsJson = JSON.stringify(queryParams);
      this.service.getSearchCount(this.datasetName, projName, exampleIncident, queryParamsJson)
        .subscribe(resp => {
          if (resp) {
            if (resp.startsWith("Error: ")) {

            }
            else {
              let response: number = +resp;
              this.datasetsCount = response;
              this.initializePaginationVariables();
            }
          }
        },
          error => { console.log(error) }
        )
    }
    catch (Exception: any) {
      this.service.message("Error "+Exception, "error")
    }

  }

  checkIfAllIdsSelected() {
    if (this.allIdsSelected || this.excludeIdsFromSelected?.length > 0) {
      this.selectedTickets = [];
      this.selectedTickets = this.ticketList.map(ele => ele[this.unqId]).filter(ele => !this.excludeIdsFromSelected.includes(ele)).slice();
    }
  }

  createColumn() {
    if (this.asChildView || this.itsm) {
      this.cols = [];
      this.colsBackup = [];
    }
    this.cols = [];
    this.columnNamesList.forEach((key, index) => {
      var header = this.columnHeadersList[this.columnNamesList.indexOf(key)];
      var col = {};
      col["field"] = key;
      col["header"] = header;
      col["visible"] = index < 5 ? true : false;
      col["filterValue"] = null;
      this.cols.push(col);
    });
    this.cols.forEach(item => this.colsBackup.push(Object.assign({}, item)));
  }

  refresh() {
    // this.table.reset();
    this.selectedTickets = [];
    this.lastRefreshDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy hh:mm:ss a");
    this.resetSelection();
    this.refreshTicket();

  }

  resetSelection() {
    this.allIdsSelected = false;
    this.selectedTickets = [];
    this.includeIdsToSelected = [];
    this.excludeIdsFromSelected = [];
  }

  trackByField(index, item) {
    return item.field;
  }

  edit(dataObj) {
    this.rowObj = {};
    if (this.schemaFormTemplate && typeof this.schemaFormTemplate == "string") this.schemaFormTemplate = JSON.parse(this.schemaFormTemplate)
    if (this.schemaFormTemplate?.components?.length > 0) {

      this.rowObj = dataObj;
    }
    this.formView = true;
    this.result.emit("formView");
  }

  adjustDataLength(colField, pkVal) {
    let ele;
    let id = "dtstflscrnvw-" + colField + "-" + pkVal;
    if (document.getElementById(id) && document.getElementById(id).parentElement && document.getElementById(id).parentElement.style) {
      ele = document.getElementById(id).parentElement;
    }
    if (ele && ele.style && ele.style.whiteSpace && ele.style.whiteSpace == "nowrap") {
      ele.style.whiteSpace = "pre-wrap";
      ele.style.overflow = null;
      ele.style.textOverflow = null;
    }
    else if (ele && ele.style && ele.style.whiteSpace && ele.style.whiteSpace == "pre-wrap") {
      ele.style.whiteSpace = "nowrap";
      ele.style.overflow = "hidden";
      ele.style.textOverflow = "ellipsis";
    }
  }

  ToggleRow =
    (eventObj: any) => {
      const targetClass = eventObj.target.classList; const
        targetParentElement = eventObj.target.parentElement.parentElement; if
        (targetClass.contains('arrow_expand')) {
        if (this.prev_openedRow.length) {
          this.prev_openedRow[0].children[0].children[0].classList.remove('arrow_collapse',
            'down-arw-icon');
          this.prev_openedRow[0].children[0].children[0].classList.add('arrow_expand');
          this.prev_openedRow[0].children[0].children[0].classList.add('next-icon');
          this.prev_openedRow[0].classList.remove('row_opened');
          this.prev_openedRow[0].nextSibling.classList.remove('open'); this.prev_openedRow.splice(0,
            1);
        } this.prev_openedRow.push(targetParentElement);
        targetClass.remove('arrow_expand', 'next-icon');
        targetClass.add('arrow_collapse'); targetClass.add('down-arw-icon');
        targetParentElement.classList.add('row_opened');
        targetParentElement.nextSibling.classList.add('open');
      } else {
        targetClass.remove('arrow_collapse', 'down-arw-icon');
        targetClass.add('arrow_expand'); targetClass.add('next-icon');
        targetParentElement.classList.remove('row_opened');
        targetParentElement.nextSibling.classList.remove('open'); if
          (this.prev_openedRow.length) { this.prev_openedRow.splice(0, 1); }
      }
    };

  toggleHeaderChkbx() {
    this.selectedTickets = [];
    if (this.allIdsSelected) {
      this.ticketList.forEach(ele => { this.selectedTickets.push(ele[this.unqId]) });
      this.selectedDatasetsCount = this.datasetsCount
      this.includeIdsToSelected = [];
    }
    else {
      this.selectedDatasetsCount = 0
    }
    this.excludeIdsFromSelected = [];
  }

  showTickets(inc) {
    if (!this.selectedTickets.includes(inc)) {
      this.selectedTickets.push(inc);
      this.selectedDatasetsCount = this.selectedDatasetsCount + 1;
      if (!this.allIdsSelected && this.excludeIdsFromSelected.length == 0) {
        this.includeIdsToSelected.push(inc);
        if (this.includeIdsToSelected.length == this.length) this.allIdsSelected = true
      }
      else {
        this.excludeIdsFromSelected.splice(this.excludeIdsFromSelected.indexOf(inc, 0), 1);
        if (this.excludeIdsFromSelected.length == 0 && this.includeIdsToSelected.length == 0) this.allIdsSelected = true
      }
    }
    else {
      if (this.includeIdsToSelected.length > 0) this.includeIdsToSelected.splice(this.includeIdsToSelected.indexOf(inc, 0), 1);
      this.selectedTickets.splice(this.selectedTickets.indexOf(inc, 0), 1);
      if (this.allIdsSelected || this.excludeIdsFromSelected.length > 0) {
        this.allIdsSelected = false;
        this.excludeIdsFromSelected.push(inc);
      }
      this.selectedDatasetsCount = this.selectedDatasetsCount - 1;
    }
  }

  showcipDtstColsToDwnld() {
    this.showcipDtstCols = !this.showcipDtstCols;
  }

  toggleSelectAllColsToDwnld() {
    this.cols.forEach(col => col.selected = this.selectAllColsToDwnld);

    this.colsToDownload = this.selectAllColsToDwnld
      ? this.cols.map(col => col.field)
      : [];

  }

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
      let searchExample: any;
      if (this.searchIncidentObj) searchExample = this.andObj;
      else searchExample = {};
      let queryParams: any = { number: this.id }
      let queryParamsJson = JSON.stringify(queryParams);
      this.service.getSearchCount(this.datasetName, projName, searchExample, queryParamsJson).
        subscribe(resp => {
          if (resp) {
            if (resp.startsWith("Error: ")) {
              this.service.message("Error while fetching data count is " + resp.substring(resp.indexOf(": ")), "Dataset View");
              this.bsyGtngDwnldCnt = false;
            }
            else {
              let tktCount: number = +resp;
              this.bsyGtngDwnldCnt = false;
              this.callDownloadApi(this.datasetName, projName, searchExample, tktCount, this.chunkSize);
            }
          }
          else {
            this.service.message("Data count returned null", "Dataset View");
            this.bsyGtngDwnldCnt = false;
          }
        },
          error => {
            this.service.message("Error while fetching data count is " + error, "Dataset View");
            this.bsyGtngDwnldCnt = false;
          }
        )
    }
    catch (Exception: any) {
      this.service.message("Some error occured "+ Exception, 'error')
    }

  }

  callDownloadApi(dsName, projName, srchExample, tktCount, chunkSize) {
    this.downloading = true;
    this.changeDetectorRefs.detectChanges();
    this.service.getDownloadData(dsName, projName, srchExample, chunkSize.toString(), this.apiCount.toString(), this.sortEvent, this.sortorder.toString(), this.colsToDownload.toString())
      .subscribe(resp => {
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
          if (!(this.csvData.length == 0 && this.downloadErrorLog != "")) {
            let fileBlob = new Blob(this.csvData, { type: "text/csv" });
            importedSaveAs(fileBlob, this.datasetAlias + " Data-" + this.datepipe.transform(new Date(), "ddMMMyyyy-hhmmssa") + ".csv");
          }
          if (this.downloadErrorLog != "") {
            let errorBlob = new Blob([this.downloadErrorLog], { type: "text/plain" });
            importedSaveAs(errorBlob, "DownloadErrorLog-" + this.datepipe.transform(new Date(), "ddMMMyyyy-hhmmssa") + ".txt");
          }
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
            if (!(this.csvData.length == 0 && this.downloadErrorLog != "")) {
              let fileBlob = new Blob(this.csvData, { type: "text/csv" });
              importedSaveAs(fileBlob, this.datasetAlias + " Data-" + this.datepipe.transform(new Date(), "ddMMMyyyy-hhmmssa") + ".csv");
            }
            if (this.downloadErrorLog != "") {
              let errorBlob = new Blob([this.downloadErrorLog], { type: "text/plain" });
              importedSaveAs(errorBlob, "DownloadErrorLog-" + this.datepipe.transform(new Date(), "ddMMMyyyy-hhmmssa") + ".txt");
            }
            this.downloading = false;
            this.changeDetectorRefs.detectChanges();
          }
        })
  }

  checkSelectAllStatus() {
    this.selectAllColsToDwnld = (this.colsToDownload.length == this.cols.length);
  }

  toggleSelectHeaderToDwnld(header: string) {
    const col = this.cols.find(col => col.header === header);
    if (col) {
      col.selected = !col.selected;


      if (col.selected) {
        this.colsToDownload.push(col.field);
      } else {
        this.colsToDownload = this.colsToDownload.filter(item => item !== col.field);
      }

      // Check if all columns are selected and update the "Select All" checkbox
      this.selectAllColsToDwnld = this.cols.every(col => col.selected);
    }
  }

  checkResult(event) {
    this.dataset.type == "rw" ? this.action = 'update' : this.action = 'view';
    if (event?.toString() == "backToTableView") {
      this.formView = false;
      this.rowObj = undefined;
      this.loadObjects(this.searchIncidentObj);
      this.result.emit("tableView");
    }
  }

  navigatePage(choice: String) {
    switch (choice) {
      case 'Next':
        this.page += 1;
        if (this.page > this.lastPage)
          this.page = this.lastPage;
        break;
      case 'Prev':
        this.page -= 1;
        if (this.page < 0)
          this.page = 0;
        break
      case 'First':
        this.page = 0;
        break;
      case 'Last':
        this.page = this.lastPage;
        break;
    }
    this.getIncidentsByPage();
  }
  ngOnChanges() {
    this.ngOnInit();

  }


  selectChange($event) {
    this.selectedRecipe = $event;

  }
  getIncidentsByPage() {
    // this.page = pgInfo.page;
    this.goToPage = null;
    this.paginatorFirstRow = this.page * this.rows;
    this.loadObjects(this.andObj);
  }

  terminateDownload() {
    this.cancelDownload = true;
    this.service.message("Download Terminated", "Dataset View");
  }
  colSearch() {
    this.searchToggle = !this.searchToggle
  }
  displayDetails() { }
  startAnalytics() {
    localStorage.setItem('dataalias', this.datasetAlias);
    localStorage.setItem('nameid', this.name_id);
    this.router.navigate(['../../../datasetAnalytics'], {
      state: { dataalias: this.datasetAlias, quickdata: this.quickStatsData },
      relativeTo: this.route,

    });
  }
  startWrangling(content: any) {
    this.showRecipe = true;
    this.showWranglingData = true;

    this.dialog.open(content, {
      width: '600px', // adjust as needed
      data: {} // pass any data if required
    });

  }

  triggerIngestPipeline() {
    console.log('Trigger Ingest Pipeline')
  }

  searchOnInputForSemanticSearchResult(tickets) {
    this.constructSearchIncidentObj(this.cols, tickets);
    let andList = []
    Object.keys(this.searchIncidentObj).forEach(ele => {
      if (this.searchIncidentObj[ele]) {
        if ((this.searchIncidentObj[ele]).length == 1) {
          andList.push({ "or": this.searchIncidentObj[ele][0] });
        }
        else {
          andList.push({ "or": this.searchIncidentObj[ele] });
        }
      }
    });
    this.andObj["and"] = andList;
    this.page = 0;
    this.goToPage = null;
    this.paginatorFirstRow = 0;
    this.resetSelection();
    this.loadObjects(this.andObj);
  }
getPageNumbers(): number[] {
  const totalVisiblePages = 5;
  const pages: number[] = [];

  let start = Math.max(this.page - Math.floor(totalVisiblePages / 2), 0);
  let end = start + totalVisiblePages;

  if (end > this.lastPage + 1) {
    end = this.lastPage + 1;
    start = Math.max(end - totalVisiblePages, 0);
  }

  for (let i = start; i < end; i++) {
    pages.push(i);

  }

  return pages;

}

changePage(p: number) {
  if (p >= 0 && p <= this.lastPage) {
    this.page = p;
    this.getIncidentsByPage();
  }
}
 
  constructSearchIncidentObj(cols, ticketsObj) {
    this.searchIncidentObj = {};
    const defaultField = 'number';
    const normalizedDefaultField = defaultField.toLowerCase();
    for (const key in ticketsObj) {
      let field = cols.find(col => col.field.toLowerCase() === key.toLowerCase())?.field || defaultField;
      let normalizedField = field.toLowerCase();
      normalizedField = normalizedField === normalizedDefaultField ? defaultField : field;
      this.searchIncidentObj[normalizedField] = ticketsObj[key].map(ticketNumber => ({
        property: normalizedField,
        equality: "like",
        value: ticketNumber
      }));
    }
    if (!Object.keys(this.searchIncidentObj).length) {
      this.searchIncidentObj[normalizedDefaultField] = [];
    }
  }

}

@Pipe({ name: 'highlight', pure: false })
export class HighlightSearch implements PipeTransform {
  transform(value: any, args: any): any {
    if (!args) { return value; }
    var re = new RegExp(args, 'gi'); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
    return value?.toString().replace(re, '<span class="text-highlight">$&</span>');
  }
}