import {Component, OnInit} from '@angular/core';
import { TabsFilterService } from '../services/tabs-filter.service';
import { Services } from '../services/service';
import { JobsService } from '../services/jobs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { JobDataViewerComponent } from '../pipeline.description/job-data-viewer/job-data-viewer.component';
import { Location } from '@angular/common';
@Component({
  selector: 'app-remote-console',
  templateUrl: './remote-console.component.html',
  styleUrls: ['./remote-console.component.scss']
})
export class RemoteConsoleComponent implements OnInit{
  isExpanded: boolean = false;
  cardTitle = 'Remote Console';
  tooltip: string = 'above';
  searchText: string;
  searchToggle: boolean = false;
  jobsList: any;
  designType:string='normal';
  REMOTE = 'REMOTE';
  page = 0;
  rows = 4;
  remoteConnectionsList: any;
  LIST_TITLE="Connections"
  columnList: any;
  selectedRemoteConnection: string;
  remoteUrl: string;
  logData: any;
  spin: boolean=false;
  loadingPage: boolean = true;
  searchIncidentObj= {};
  searchInputFilter :{ [key: string]: any } = {};  
  andObj = { "and": [] };
  filterColumn: any;
  filterDate: any;
  filterValue: any;
  filteredJobs: any;
  sortElement: any={};
  selectedConnectionAlias: string;
  jobsListLength: any;
  paginatedJobsList: any;
  
  constructor(
    private filtersService: TabsFilterService,
    private service: Services,
    private jobService: JobsService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private location: Location,
    ){
      this.route.queryParams.subscribe((param)=>{
        this.selectedRemoteConnection = param['name']
      })
    }
  
  ngOnInit() {
    if(this.selectedRemoteConnection){
    this.getDatasource();
    }
    this.getRemoteConnections();
  }

  getDatasource(){
    let org = sessionStorage.getItem('organization');
    this.service.getCoreDatasource(this.selectedRemoteConnection,org).subscribe((res) => {
      this.selectedConnectionAlias = res.alias;
      this.remoteUrl = JSON.parse(res.connectionDetails).Url;
      this.getJobsList(this.remoteUrl);
    })
  }

  getRemoteConnections(){
    let org = sessionStorage.getItem('organization')
    this.service.getDatasourceCards(org).subscribe((res) => {
      this.remoteConnectionsList=[];
      let data: any = [];
      let test = res.filter((res) => res.type == this.REMOTE);
      test.forEach((element: any) => {
        data.push(element);
        let k=JSON.parse(element.connectionDetails);
        this.remoteConnectionsList.push({name:element.name, alias:element.alias, connectionID:element.name, endpoint:k.Url})
      });
      if(this.remoteConnectionsList.length>0 && !this.selectedRemoteConnection){
      this.openConsole(this.remoteConnectionsList[0].name,this.remoteConnectionsList[0].alias,this.remoteConnectionsList[0].endpoint);
      }
    },
    (err)=>{
      this.service.messageService('Error in fetching remote connections');
    });
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
  toggler(isExpanded: boolean) {
    if (isExpanded) {
      return { width: '78%', margin: '0 0 0 22%' };
    } else {
      return { width: '100%', margin: '0%' };
    }
  }

  onSearch() {
    this.filtersService.changeText(this.searchText);
  }

  onRefresh(){
    this.getRemoteConnections();
    this.getJobsList(this.remoteUrl);
  }

  navigateToProperties() {
    if(this.selectedRemoteConnection){
      this.router.navigate(['../connections/view/' + this.selectedRemoteConnection, true], {
        relativeTo: this.route,
      });
    }
    else{
      this.service.messageService('Please select a connection to navigate');
    }
  }

  colSearch(){
    this.searchToggle=!this.searchToggle
  }

  setSortElement(element) {
    if (this.sortElement[element] == "NO") {
      this.sortElement[element] = "DESC"
    } else {
      if (this.sortElement[element] == "DESC") {
        this.sortElement[element] = "ASC"
      } else {
        if (this.sortElement[element] == "ASC") {
          this.sortElement[element] = "NO"
        }
      }
    }
    for (let key in this.sortElement) {
      if (key != element) {
        this.sortElement[key] = "NO"
      }
    }
    this.getSortedColumns();
  }

  getSortedColumns(){
    let sortElement = this.sortElement;
    let sortKey = Object.keys(sortElement).find(key => sortElement[key] != "NO");
    sortKey = sortKey ? sortKey : "id";
    if (sortElement[sortKey] == "ASC") {
      this.filteredJobs = this.filteredJobs.sort((a, b) => {
        if (a[sortKey] > b[sortKey]) {
          return 1;
        }
        if (a[sortKey] < b[sortKey]) {
          return -1;
        }
        return 0;
      });
    } else if(sortElement[sortKey] == "DESC") {
      this.filteredJobs = this.filteredJobs.sort((a, b) => {
        if (a[sortKey] < b[sortKey]) {
          return 1;
        }
        if (a[sortKey] > b[sortKey]) {
          return -1;
        }
        return 0;
      });
    }
    else{
      this.filteredJobs=JSON.parse(JSON.stringify(this.jobsList));
    }
    this.paginatedJobsList=this.getPaginatedData(this.page);
   }
  
  getSortClass(element) {
    switch (this.sortElement[element]) {
      case "DESC":
        return "fa fa-caret-down"
      case "ASC":
        return "fa fa-caret-up"
      default:
        return "fa fa-sort"
    }
  }

  getBadgeType(type:string){
    switch (type) {
      case "ERROR":
      case "CANCELLED":  
        return "error"
      case "COMPLETED":
        return "closed"
      case "RUNNING":
        return "inProgress"   
      default:
        return "info"
    }
  }
  
  getJobsList(endpoint: string) {
    this.spin=true;
    this.jobService.getRemoteJobs(endpoint).subscribe((res) => {
      this.columnList=[]
      this.jobsList=[]
      this.jobsList = res;
      this.filteredJobs= JSON.parse(JSON.stringify(this.jobsList));
      if(this.jobsList.length>0)
      this.columnList = Object.keys(this.jobsList[0]);
      this.columnList.forEach((element) => {
        this.searchInputFilter[element] = ''
        this.sortElement[element] = "NO"
      });
      this.spin=false;
      this.jobsListLength = this.filteredJobs.length;
      this.page=0;
      this.paginatedJobsList=this.getPaginatedData(this.page);
    },(err)=>{
      this.spin=false;
      this.jobsList=[];
      this.paginatedJobsList=[];
      this.service.messageService('Error in fetching jobs list');
    });
  }  

  openConsole(name:string,aliasName:string,endpoint: string){
    this.selectedRemoteConnection = name;
    this.selectedConnectionAlias = aliasName;
    this.remoteUrl=endpoint;
    this.queryparam(name);
    this.getJobsList(endpoint);
  }

  queryparam(connName){
    const url = this.router.createUrlTree([], {
      queryParams: {name: connName},
      queryParamsHandling: 'merge',
    }).toString();
    this.location.replaceState(url);
  }

  showLogs(id,status){
    this.getLogsData(this.remoteUrl,id,status);
  }

  getLogsData(url,id,status){
    this.jobService.getRemoteJobLog(url,id).subscribe((res) => {
      this.logData=res.logs.content;
      this.openDialog(id,status)
    },(err)=>{
      this.service.messageService('Error in fetching logs');
    });
  }

  stopRemoteJob(id){
    this.jobService.stopRemoteJob(this.remoteUrl,id).subscribe((res) => {
      if(res['Task cancelled']){
        this.service.message('Job Terminated Successfully');
      }
      if(!res['Task cancelled']){
        this.service.messageService('This job has already ended or terminated by user');
      }
    },
    (err)=>{
      this.service.messageService('Job Termination failed');
    });
  }

  openDialog(jobid, status) {
    const dialogRef = this.dialog.open(JobDataViewerComponent, {
      height: '95%',
      width: '90%',
      disableClose: true,
      data: {
        isConsole: true,
        content: this.logData,
        isChain: false,
        isRemote:true,
        jobid: jobid,
        jobtype: 'REMOTE',
        status: status,
        linenumber: 0
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  searchValueAdder(event, column:string) {
    this.searchIncidentObj = {};
    this.searchInputFilter[column]=event.target.value; 
    if (event.target.value != "") {
      if (event.target.value.includes(",")) {
        let filterValueList = event.target.value.split(",");
        let objList = [];
        filterValueList = filterValueList.map(ele => ele.trim()).filter(ele => ele != "");
        filterValueList.forEach(ele => {
          objList.push({ "property": column, "equality": "like", "value": ele })
        });
        this.searchIncidentObj[column] = objList;
      } else {
        this.searchIncidentObj[column] = [{ "property": column, "equality": "like", "value": event.target.value }];
      }
    }
    else {
      this.searchIncidentObj[column] = undefined;
    }
  }

  searchOnInput() {
    let andList = []
    Object.keys(this.searchIncidentObj).forEach(ele => {
      if (this.searchIncidentObj[ele]) {
        if ((this.searchIncidentObj[ele]).length == 1) {
          andList.push({ "or": [this.searchIncidentObj[ele][0]] });
        }
        else {
          andList.push({ "or": this.searchIncidentObj[ele] });
        }
      }
    });
    this.andObj["and"] = andList;
    if(andList.length>0){
     this.filterColumn= andList[0].or[0].property
     if(this.filterColumn==="submitted"){
      this.filterDate= andList[0].or[0].value
     }
     else{
     this.filterValue= andList[0].or[0].value
     }
    }
    else{
      this.filterColumn= ""
      this.filterValue= ""
    }

    this.getfilteredJobs()

  }

  getFilterColumn(): string {
    return this.filterColumn
  }

  getFilterColumnValue(): any {
    return this.filterValue
  }

  getFilterDate(): string {
    return this.filterDate
  }

  getfilteredJobs(){
    this.page=0;
    this.filteredJobs=this.jobsList.filter((ele,index)=>{
      let flag=true;
      Object.keys(this.searchIncidentObj).forEach((key)=>{
        if(this.searchIncidentObj[key] && ele[key]){
          if(this.searchIncidentObj[key].length==1){
            if(ele[key].toLowerCase().includes(this.searchIncidentObj[key][0].value.toLowerCase())){
              flag=flag && true;
            }
            else{
              flag=flag && false;
            }
          }
          else{
            let valueList=this.searchIncidentObj[key].map((ele)=>ele.value);
            let flag1=false;
            valueList.forEach((value)=>{
              if(ele[key].toLowerCase().includes(value.toLowerCase())){
                flag1=true;
              }
            })
            flag=flag && flag1;
          }
        }
        else if(ele[key]==null){
          flag=false;
        }
      })
      return flag;
    })
    this.jobsListLength=this.filteredJobs.length
    this.paginatedJobsList=this.getPaginatedData(this.page);
  }

  pageChanged(event){
    this.page = event.pageIndex;
    this.paginatedJobsList = this.getPaginatedData(this.page);
  }

  getPaginatedData(currentPage){
    return this.filteredJobs.slice(currentPage*this.rows,(currentPage*this.rows)+this.rows);
  }
}
