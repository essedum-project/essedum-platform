import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Dataset } from '../datasets';
import { ActivatedRoute } from '@angular/router';
import { DatasetServices } from '../dataset-service';
import { Services } from '../../services/service';
import { Project } from '../../DTO/project';

@Component({
  selector: 'app-dataset-power-mode-view',
  templateUrl: './dataset-power-mode-view.component.html',
  styleUrls: ['./dataset-power-mode-view.component.scss']
})
export class DatasetPowerModeViewComponent implements OnInit {

    searchIncidentObj = {};
    datasetName: string = "";
    schemaName: string = "";
    length: number;
    busy: Subscription;
    columnNamesList: string[] = [];
    columnHeadersList: string[] = [];
    powerModeFetch: boolean = true;
    pmSearch: any = {};
  
    viewIncident: any;
    selectedTicket: any;
    powerModeTicketList: any[] = [];
    ticketListBackup: any[] = [];
  
    page = 0;
    rows = 10;
    sortEvent: any = "";
    sortorder = -1;
  
    cols: any[] = [];
    colsBackup: any[] = [];
    fmFlrDsb: boolean = false;
  
    unqId: string;
    rowObj: any;
    action: string;
    dataset: any;
    schema: any = {};
  
    selectedColumn: string;
    powerModeInputValue: any;
  
    @Input('data') data: Dataset;
    @Input('datasetname') inpdataset;
    @Output('result') result = new EventEmitter();
  
    constructor(
      private route: ActivatedRoute,
      private datasetsService: DatasetServices,
      private schemaService: Services
    ) { }
  
    ngOnInit(): void {
      this.getSourceApiParameters();
    }
  
    getSourceApiParameters() {
      try{
        try {
          this.route.params.subscribe(param => {
            this.datasetName = param['name'];
          })
        }
        catch (Exception) {
          this.datasetName = this.data?.name;
        }
        if(this.datasetName==undefined){
          this.datasetName = this.data?.name;
        }
        if (this.inpdataset) {this.datasetName = this.inpdataset}
        if(!this.datasetName || this.datasetName.replace(/\s/g,"").length<1){
          this.datasetsService.message("Dataset name not found", "Dataset View");
        }
        else{
          this.busy = this.datasetsService.getDataset(this.datasetName)
          .subscribe(resp => {
            if (resp) {
              this.dataset = resp;
              this.data = resp
              this.dataset.schema ? this.schemaName = this.dataset.schema : this.schemaName = "";
              let actionToBeCompared:string;
                if(((this.dataset.attributes && JSON.parse(this.dataset.attributes)['isApprovalRequired'])
                  || (this.dataset.attributes && JSON.parse(this.dataset.attributes)['isInboxRequired']))) 
                      actionToBeCompared = this.rowObj['action']
                else  actionToBeCompared = "update";
               
              this.dataset.type == "rw" ? this.action = 'update' : this.action = 'view';
              (this.dataset.attributes && JSON.parse(this.dataset.attributes)['uniqueIdentifier']) ?
                this.unqId = JSON.parse(this.dataset.attributes)['uniqueIdentifier'] :
                this.unqId = undefined;
              if (this.unqId) this.sortEvent = this.unqId;
              this.getColumnNamesAndPrmKys();
            }
            else { this.datasetsService.message("Dataset details not found", "Dataset View"); }
          },
            error => { this.datasetsService.message("Error in fetching dataset details " + error, "Dataset View"); })
        }
      }
      catch(Exception){
      this.datasetsService.message("Some error occured", "Error")
      }
    
    }
  
    getColumnNamesAndPrmKys() {
      try{
        if (this.schemaName && this.schemaName.trim().replace(/\s/g, '').length > 0) {
          this.busy = this.schemaService.getSchemaByName(this.schemaName)
            .subscribe(resp => {
              if (typeof (resp) != "object") {
                this.datasetsService.message(resp, "Dataset View");
              }
              else {
                let schemaContents: any[] = resp ? resp.schemavalue ? JSON.parse(resp.schemavalue) : [] : [];
                if (schemaContents && schemaContents.length < 1) {
                  this.datasetsService.message("Error: Linked schema is empty", "Dataset View");
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
        else {
          let pagination: any = { page: 0, size: 1 };
          this.datasetsService.getPaginatedDetails(this.dataset, pagination).subscribe(resp => {
            if (resp && resp[0]) {
              Object.keys(resp[0]).forEach((ky) => {
                this.columnNamesList.push(ky);
                this.columnHeadersList.push(ky);
              })
              this.checkRouteQueryParams();
            }
            else {
              this.datasetsService.message("Dataset query returned no results", "Dataset View");
            }
          })
        }
      }
      catch(Exception){
      this.datasetsService.message("Some error occured", "Error")
      }
     
    }
  
    checkRouteQueryParams() {
      if (this.columnNamesList && this.columnNamesList.length < 1) {
        this.datasetsService.message("Error: Received empty list of columns names", "Dataset View");
      }
      else {
        this.selectedColumn = this.columnNamesList[0];
        if(!(this.sortEvent?.trim().length>0))
          this.sortEvent = this.columnNamesList[0];
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
  
    createColumn() {
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
  
    refreshTicket(decodedSPrList?: any[], decodedSValList?: any[]) {
      try{
        if (sessionStorage.getItem("failureDashboardToTickets") == "True") {
          this.fmFlrDsb = true;
        }
        let example = {};
        let project = new Project();
        this.searchIncidentObj = {};
        let objList = [];
        let finalOrObj = {"or":[]};
        let finalAndObj ={"and":[]};
        project = JSON.parse(sessionStorage.getItem("project"));
        
        let projName: string = project.name;
        let pagination = { 'page': this.page, 'size': this.rows, 'sortEvent': this.sortEvent, 'sortOrder': this.sortorder };
       
        if (decodedSPrList && decodedSValList) {
          decodedSPrList.forEach((param, index) => {
            let decodedCol = this.cols.filter(ele => {
              if (ele['field']) return ele['field'].toLowerCase() == param.toLowerCase();
            });
            decodedCol = decodedCol[0];
            if (decodedCol && decodedCol['field'] && decodedSValList[index]) {
              if (Array.isArray(decodedSValList[index])){ 
                decodedSValList[index].forEach(ele => {
                  objList.push({"property":decodedCol['field'],"equality":"like","value":ele});
                });
                finalOrObj.or = objList;
                finalAndObj.and.push(finalOrObj);
                finalOrObj = {"or":[]};
              }
              else{ 
                finalAndObj.and.push({"or":{"property":decodedCol['field'],"equality":"like","value":decodedSValList[index]}});
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
          this.searchIncidentObj = null;
          this.cols.map(ele => ele['filterValue'] = null);
        }
        this.datasetsService.getSearchCount(this.datasetName, projName, finalAndObj)
          .subscribe(resp => {
            if (resp) {
              if (resp.startsWith("Error: ")) {
               
              }
              else {
                let response: number = +resp;
                this.length = response;
              }
            }        
          },
            error => {console.log(error)}
          )
        this.busy = this.datasetsService.searchTicketsUsingDataset(this.datasetName, projName, pagination, finalAndObj)
          .subscribe(
            (pageResponse) => {
              if (typeof pageResponse == "string") {
                this.datasetsService.message(pageResponse, "Dataset View");
                this.powerModeTicketList = this.ticketListBackup;
              }
              else {
                pageResponse.forEach((element) => {
                  if (element) {
                    Object.keys(element).map(ky => { if (element[ky]) element[ky] = element[ky].toString() });
                    this.powerModeTicketList.push(element);
                  }
                });
               
                if(this.powerModeTicketList?.length>0 && this.powerModeTicketList[0]){
                  if(!this.rowObj)  this.rowObj = {};
                  Object.entries(this.powerModeTicketList[0]).forEach(ele => { this.rowObj[ele[0]] = ele[1]; });
                }
                this.ticketListBackup = this.powerModeTicketList;
              }
            },
            (error) => {
              this.datasetsService.message("Could not get the results", "Dataset View");
              this.powerModeTicketList = this.ticketListBackup;
            }
          );
      }
      catch(Exception){
      this.datasetsService.message("Some error occured", "Error")
      }
    
    }
  
    loadObjects(exampleIncident: any) {
      try{
        if (!exampleIncident) exampleIncident = {};
        this.powerModeTicketList = [];
        let project = new Project();
        project = JSON.parse(sessionStorage.getItem("project"));
        this.powerModeTicketList = [];
        let projName: string = project.name;
        let pagination = { 'page': this.page, 'size': this.rows, 'sortEvent': this.sortEvent, 'sortOrder': this.sortorder };
        this.busy = this.datasetsService.searchTicketsUsingDataset(this.datasetName, projName, pagination, exampleIncident)
          .subscribe(res => {
            if (typeof res == "string") {
              this.datasetsService.message(res, "Dataset View");
              this.powerModeTicketList = this.ticketListBackup;
            }
            else {
              res.forEach((ele) => {
                if (ele) {
                  Object.keys(ele).map(ky => { if (ele[ky]) ele[ky] = ele[ky].toString() });
                  this.powerModeTicketList.push(ele);
                }
              });
              if(this.unqId){
                this.powerModeTicketList = this.powerModeTicketList.filter((elem, index, self) => {
                  return (
                    index ===
                    self.findIndex((ele) => {
                      return ele[this.unqId] === elem[this.unqId];
                    })
                  );
                });
              }
              this.powerModeTicketList = this.powerModeTicketList;
              this.ticketListBackup = this.powerModeTicketList;
              if (this.powerModeTicketList.length == 0)
                this.powerModeFetch = false;
            }
          },
            error => {
              this.datasetsService.message("Some error occurred while fetching data", "Dataset View");
              this.powerModeTicketList = this.ticketListBackup;
            });
        this.datasetsService.getSearchCount(this.datasetName, projName, exampleIncident).
          subscribe(resp => {
            if (resp) {
              if (resp.startsWith("Error: ")) {
               
              }
              else {
                let response: number = +resp;
                this.length = response;
              }
            }
           },
            error => {console.log(error)}
          )
      }
      catch(Exception){
      this.datasetsService.message("Some error occured", "Error")
      }
    
    }
  
    updateDetails(incident) {
      this.viewIncident = incident[this.unqId];
      this.rowObj = {};
     
      if(incident){
        Object.entries(incident).forEach(ele => { this.rowObj[ele[0]] = ele[1]; });
      }
    }
  
    onScroll(event) {
      try{
        let example = {};
        let project = new Project();
        project = JSON.parse(sessionStorage.getItem("project"));
        let projName: string = project.name;
        if (this.pmSearch && Object.keys(this.pmSearch) && Object.keys(this.pmSearch).length > 0) {
          example = this.pmSearch;
        }
        let pagination = { 'page': this.page, 'size': this.rows, 'sortEvent': this.sortEvent, 'sortOrder': this.sortorder }
        if ((event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight)
          && (this.powerModeTicketList.length < this.length)) {
          this.busy = this.datasetsService.searchTicketsUsingDataset(this.datasetName, projName, pagination, example)
            .subscribe(
              (pageResponse) => {
                if (typeof pageResponse == "string") {
                  this.datasetsService.message(pageResponse, "Dataset View");
                }
                else {
                  pageResponse.forEach((element) => {
                    if (element) {
                      Object.keys(element).map(ky => { if (element[ky]) element[ky] = element[ky].toString() });
                      this.powerModeTicketList.push(element);
                    }
                  });
                }
                this.page = this.page + 1;
              },
              (error) => {
                this.datasetsService.message("Could not get the results", "Dataset View");
              }
            );
        }
      }
      catch(Exception){
      this.datasetsService.message("Some error occured", "Error")
      }
     
    }
  
    powerModeSearch() {
      this.powerModeFetch = true;
      this.pmSearch = {and:[{or:[]}]};
      this.pmSearch.and[0].or.push({"property":this.selectedColumn,"equality":"like","value":this.powerModeInputValue});
      this.searchOnInput();
      this.page = 1;
    }
  
    powerModeInput(event) {
      this.powerModeInputValue = event.target.value;
    }
  
    searchOnInput() {
      this.page = 0;
      this.loadObjects(this.pmSearch);
    }
  
    checkFormViewResult(event){
      if(event?.toString()=="Hide Create/Form Template Button"){
        this.result.emit("Hide Create/Form Template Button");
      }
    }
  
    adjustDataLength(colField, pkVal) {
      let ele;
      let id = "dtstflscrnvwcrd-" + colField + "-" + pkVal;
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
  

}
