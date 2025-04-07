import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Services } from '../services/service';
import { MatDialog } from '@angular/material/dialog';
import { JobDataViewerComponent } from '../pipeline.description/job-data-viewer/job-data-viewer.component';
import { DatePipe, Location } from "@angular/common";
import { Subscription } from 'rxjs';
import { JobsService } from '../services/jobs.service';
import { TabsFilterService } from '../services/tabs-filter.service';
import { Project } from 'com-lib-util';
import { saveAs as importedSaveAs } from "file-saver";
import { ActivatedRoute, Router } from '@angular/router';
import { PipelineService } from '../services/pipeline.service';

@Component({
  selector: 'app-jobs-log',
  templateUrl: './jobs-log.component.html',
  styleUrls: ['./jobs-log.component.scss']
})
export class JobsLogComponent implements OnInit {
  busy2: Subscription;
  busy3: Subscription;
  busy5: Subscription;
  internaljobs: any[] = [];
  internaljobnames: any[] = [];
  @Input('componentType') componentType: string;
  @Input("searchText") searchText;
  @Input('id') id;
  @Input('params') params;
  @Input('itsm') itsm: boolean;
  hiddenlogs: any[] = [];
  searchToggle: boolean = false;
  @Input() cname
  page = 0
  row = 4
  totalJobs: number = 0;
  lastPage: number = 0;
  currentJob: any = {};
  timeInterval: any;
  jobData: any = '';
  datas: any=[];
  logsdata: any = [];
  sortElement = {
    "jobid": "NO",
    "alias": "NO",
    "submittedby": "NO",
    "submittedon": "NO",
    "finishtime": "NO",
    "runtime": "NO",
    "jobstatus": "NO"
  }
  USERTRIGGERED = { value: "user-triggered", color: "label label-info" }
  SYSTEMTRIGGERED = { value: "system-triggered", color: "label label-success" }
  SYSTEMGENERATED = { value: "system-generated", color: "label label-warning" }
  THROUGHEVENT = { value: "through event", color: "label label-warning" }
  THROUGHSCHEDULER = { value: "through scheduler", color: "label label-info" }
  THROUGHCHAIN = { value: "through chain", color: "label label-danger" }

  rows= 4;
  filterColumn = ""
  filterValue = ""
  filterDate = ""
  jobsList: any = [];
  jobType: any
  cols: string[] = [
    'Job Id',
    'Job Name',
    'Used by',
    'Submitted on',
    'Finished on',
    'Runtime',
    'Status'
  ];
  colsMap: { [key: string]: any } = {
    'Job Id': 'jobid',
    'Job Name': 'alias',
    'Used by': 'submittedby',
    'Submitted on': 'submittedon',
    'Finished on': 'finishtime',
    'Runtime': 'runtime',
    'Status': 'jobstatus'
  };
  ticketList: any[] = [];
  bsyGtngDwnldCnt: boolean = false;
  downloading: boolean = false;
  downloadPercentage: number = 0;
  cancelDownload: boolean = false;
  downloadcols: any[] = [];
  columnHeadersList: string[] = [];
  colsBackup: any[] = [];
  searchIncidentObj = {};
  searchInputFilter :{ [key: string]: any } = {
    'Job Id': '',
    'Job Name': '',
    'Used by': '',
    'Submitted on': '',
    'Finished on': '',
    'Runtime': '',
    'Status': ''
  };
  andObj = { "and": [] };
  datasetName: string = "";
  chunkSize: number = 500;
  sortEvent: any = "";
  sortorder: any = -1;
  datasetAlias: any;

  selectAllColsToDwnld: boolean = false;
  colsToDownload: string[] = [];

  csvData: string[] = [];
  downloadErrorLog: string = "";
  apiCount: number = 0;

  goToPage: null;
  paginatorFirstRow: number;
  allIdsSelected: boolean = false;
  selectedTickets: any[]=[];
  excludeIdsFromSelected: string[] = [];
  includeIdsFromSelected: string[] = [];
  includeIdsToSelected: string[] = [];
  ticketListBackup: any[] = [];
  unqId: string;
  datasetsCount: number;
  sequence: any = [];

  private searchSubscription: Subscription;
  constructor(private service: Services,
    private router: Router,
    private route: ActivatedRoute,
    private jobService: JobsService,
    private location: Location,
    private filtersService: TabsFilterService,
    private changeDetectorRefs: ChangeDetectorRef,
    private datepipe: DatePipe,
    public dialog: MatDialog,
    private pipelineService: PipelineService
  ){}
  @Output() statusChanged = new EventEmitter();
  ngOnInit(): void {
    this.fetchAllInternalJobs();
    this.filtersService.changeText('');
    this.searchSubscription = this.filtersService.getSearchText().subscribe((message) => {
      this.searchText = message;
      // if (this.searchText)
        this.searching();
      // else{
      //   this.busy3 = this.jobService.getCommonJobsLen("alias", this.searchText, "1980-12-12").subscribe((res) => {
      //     const n = res;
      //     this.totalJobs = n.valueOf();
      //     const remainder = this.totalJobs % this.rows;
      //     const cof = (this.totalJobs - remainder) / this.rows;
      //     if (remainder !== 0) {
      //       this.lastPage = cof;
      //     } else {
      //       this.lastPage = cof - 1;
      //     }
      //     if (this.totalJobs !== 0) {
      //       this.getJobs("First");
      //     } else {
      //       this.page = 0;
      //       this.lastPage = 0;
      //       this.jobsList = [];
      //     }
      //   });
      // }
    });
    this.busy3 = this.jobService.getCommonJobs(this.page, this.rows, this.getFilterColumn(), this.getFilterColumnValue(), this.getFilterDate(), this.getSortedColumn(), this.getDirection()).subscribe((res) => {

      this.jobsList = res;

      // this.initializeChainedJobs();

    });
    // this.service.getJobsByStreamingServiceLen(this.cname).
    //         subscribe(
    //           response => {
    //             var n: Number = new Number(response);
    //             this.totalJobs = n.valueOf();
    //             var remainder = this.totalJobs % this.row;
    //             var cof = ((this.totalJobs - remainder) / this.row);
    //             if (remainder != 0) {
    //               this.lastPage = cof;
    //             }
    //             else {
    //               this.lastPage = cof - 1;
    //             }
    //             this.service.message('Fetched successfully', 'success');
    //             if (this.totalJobs !== 0) {
    //               this.getJobs('First');
    //             }
    //           },
    //           error => this.service.message('Could not fetch jobs!', 'error')
    //         );
    // this.service.fetchInternalJobByName(this.cname,this.page,this.row).subscribe(resp=>{
    //   this.jobList =  resp
    //   console.log('jobList')
    //   console.log(this.jobList)
    // })
    // this.jobList.forEach((job,index)=>{
    //   this.jobList[index].jobmetadata = JSON.parse(this.jobList[index].jobmetadata)
    //   if(this.jobList[index].submittedOn!=null)
    //   this.jobList[index].submittedOn = this.jobList[index].submittedOn.split('+')[0]
    //   if(this.jobList[index].finishtime!=null)
    //   this.jobList[index].finishtime = this.jobList[index].finishtime.split('+')[0]
    // })
    this.createColumn();
  }

onRefresh() {
  this.searchValueAdder("","");
  this.searchOnInput();
}

sortByLatest(jobData){
  this.jobsList=jobData.sort((a,b)=>new Date(b.submittedOn).getTime()-new Date(a.submittedOn).getTime())
}


getJobs(choice: String) {
  switch (choice) {
    case 'Next':
      this.page += 1;
      if (this.page == this.lastPage) {
        choice = 'Last';
        this.getJobs('Last');
        break;
      }
      console.log(this.page);
      break;
    case 'Prev':
      this.page -= 1;
      if (this.page == 0) {
        choice = 'First';
        this.getJobs('First');
        break;
      }
      console.log(this.page);
      break
    case 'First':
      this.page = 0;
      console.log(this.page);
      break;
    case 'Last':
      this.page = this.lastPage;
      console.log(this.page);
      break;
  }
  // if (this.type == "agent") {
  //   this.busy = this.service.getJobsByAgents(this.item.name, this.page, this.rows).subscribe(res => {
  //     this.jobsList = res;
  //   });
  // }
  // else if(this.item.type == "Azure"){
  //   this.busy = this.jobsService.getAzureJobs(this.uid,this.item.alias).subscribe(res=>{
  //       res.runs.forEach(ele=>{
  //         let data={};
  //         data['jobId'] = ele.runId
  //         data['submittedBy'] = this.uid;
  //         data['submittedOn'] = ele.startTimeUtc;
  //         data['finishtime'] = ele.endTimeUtc;
  //         data['jobStatus'] = ele.status;
  //         data['type'] = res.Platform;
  //         data['jobObj'] = ele
  //         this.jobsList.push(data);
  //       })
  //     console.log("jobsList",this.jobsList)
  //     this.jobsList.forEach(ele=>{
  //     })
  //   },error=>{
  //     console.log("err",error)
  //       this.messageService.error('Some error occured',"Error");
  //   })
  // }
  // else {
    // this.busy3 = this.jobService.getCommonJobsnew(this.page, this.rows, "alias", this.searchText, "", this.getSortedColumn(), this.getDirection(),this.andObj).subscribe((res) => {
    //   this.jobsList = res;
    //   // if (this.searchText)
    //   //   this.searching();
    //   this.sortByLatest(this.jobsList);
    // });
    this.busy3 = this.jobService.getCommonJobsnew(this.page, this.rows, this.filterColumn, this.filterValue,this.filterDate, this.getSortedColumn(), this.getDirection(),this.andObj).subscribe((res) => {
      this.jobsList = res;
      // if (this.searchText)
      //   this.searching();
      this.sortByLatest(this.jobsList);
    });
  // }
}
fetchChainJob(jobId:string){
  try{
    let linenumber = 0
      this.service.getIndvLog(jobId).subscribe(
        response => {
          this.currentJob = JSON.parse(response);
          this.onChangeStatus(this.currentJob.status);
          if (
            this.currentJob.status !== 'STARTED' &&
            this.currentJob.status !== 'RUNNING'
          ) {
            clearInterval(this.timeInterval);
          }
        },
        error => {
          this.currentJob['status'] = 'ERROR';
          this.service.message('Job Status not fetched:' + error,'error');
        }
      );
    // }
  }
  catch(Exception){
  this.service.message("Some error occured", "error")
  }
}
fetchInternalJob(jobId:string,status){
  try{
    let linenumber = 0
      this.service.fetchInternalJob(jobId, linenumber, 50, status).subscribe(
        response => {
          this.currentJob = JSON.parse(response);
          this.onChangeStatus(this.currentJob.status);
          if (
            this.currentJob.status !== 'STARTED' &&
            this.currentJob.status !== 'RUNNING'
          ) {
            clearInterval(this.timeInterval);
          }
        },
        error => {
          this.currentJob['status'] = 'ERROR';
          this.service.message('Job Status not fetched:' + error,'error');
        }
      );
    // }
  }
  catch(Exception){
  this.service.message("Some error occured", "error")
  }
}
fetchJob(jobId: string, runtime: string, status) {
  try{
    let linenumber = 0
    // if (this.type == "agent") {
    //   this.busy = this.service.fetchAgentJob(jobId, linenumber, 0, status, false).subscribe(
    //     response => {
    //       this.currentJob = response
    //       this.onChangeStatus(this.currentJob.status);
    //       if (
    //         this.currentJob.status !== 'STARTED' &&
    //         this.currentJob.status !== 'RUNNING'
    //       ) {
    //         clearInterval(this.timeInterval);
    //       }
    //     },
    //     error => {
    //       this.currentJob['status'] = 'ERROR';
    //       this.service.message( 'Job Status not fetched:' + error,'error');
    //     }
    //   );
    // }
    // else {
      this.service.fetchSparkJob(jobId, linenumber, runtime, 50, status, false).subscribe(
        response => {
          this.currentJob = JSON.parse(response);
          this.onChangeStatus(this.currentJob.status);
          if (
            this.currentJob.status !== 'STARTED' &&
            this.currentJob.status !== 'RUNNING'
          ) {
            clearInterval(this.timeInterval);
          }
        },
        error => {
          this.currentJob['status'] = 'ERROR';
          this.service.message('Job Status not fetched:' + error,'error');
        }
      );
    // }
  }
  catch(Exception){
  this.service.message("Some error occured", "error")
  }
}



onChangeStatus(value) {
  this.statusChanged.emit(value);
}

getIndividualPipeline(chainName) {
  this.pipelineService.getChainByName(chainName).subscribe((res) => {
    res.jsonContent.element.elements.forEach(e => {
      this.sequence.push(e.name);
    })
  });
}

showConsole(jobId: string, runtime: string, status,jObj) {
  let linenumber = 0;
   if(jObj.jobtype == "internal"){
    this.service.fetchInternalJob(jobId,linenumber,50,status).subscribe(response=>{
      if (response != null) {
        this.currentJob = response;
        this.onChangeStatus(this.currentJob.status);
        if (this.currentJob.status) {
          if (
            this.currentJob.status === 'STARTED' ||
            this.currentJob.status === 'RUNNING'
          ) {
            const interval = 10000;
            this.timeInterval = setInterval(() => {
              this.fetchInternalJob(jobId, status);
            }, interval);
          }
        }
        this.jobData = this.currentJob;
        console.log("jobdata")
        console.log(this.jobData)
        // this.openJobLog(this.jobData, false, job.jobid, jobtype, job.jobstatus);
        this.datas = [];
        // if (Object.keys(this.jobData).length !== 0 && this.jobData.constructor === Object) {
        if(this.jobData){
          for (var i in this.jobData) {
            let a = { 'name': i, 'value': this.jobData[i] };
            this.datas.push(a);
          }
        }
        this.logsdata = this.datas
        // this.ngOnChanges();
        this.openDialog(jobId, "internal jobs", this.currentJob.jobStatus,this.logsdata);
      }
    },error=>{
      this.currentJob['status'] = 'ERROR';
      this.service.message('Could not get the results', 'error');
      clearInterval(this.timeInterval);
    });
   }else if(jObj.jobtype == "chain"){
    this.getIndividualPipeline(jObj.alias);
    this.service.getIndvLog(jobId).subscribe(response=>{
      if (response != null) {
        this.currentJob = response;
        this.onChangeStatus(this.currentJob.status);
        if (this.currentJob.status) {
          if (
            this.currentJob.status === 'STARTED' ||
            this.currentJob.status === 'RUNNING'
          ) {
            const interval = 10000;
            this.timeInterval = setInterval(() => {
              this.fetchChainJob(jobId);
            }, interval);
          }
        }
        this.jobData = this.currentJob;
        console.log("jobdata")
        console.log(this.jobData)
        // this.openJobLog(this.jobData, false, job.jobid, jobtype, job.jobstatus);
        this.datas = [];
        // if (Object.keys(this.jobData).length !== 0 && this.jobData.constructor === Object) {
        if(this.jobData){
          for (var i in this.jobData) {
            let a = { 'name': i, 'value': this.jobData[i] };
            this.datas.push(a);
          }
        }        
        this.logsdata = this.datas
        // this.ngOnChanges();
        this.openDialog(jobId, "chain", this.currentJob.jobStatus,this.logsdata);
      }
    },error=>{
      this.currentJob['status'] = 'ERROR';
      this.service.message('Could not get the results', 'error');
      clearInterval(this.timeInterval);
    });
   } else{
  this.service.fetchSparkJob(jobId, linenumber, runtime, 50, status, false).subscribe(
    response => {
      if (response != null) {
        this.currentJob = response;
        this.onChangeStatus(this.currentJob.status);
        if (this.currentJob.status) {
          if (
            this.currentJob.status === 'STARTED' ||
            this.currentJob.status === 'RUNNING'
          ) {
            const interval = 10000;
            this.timeInterval = setInterval(() => {
              this.fetchJob(jobId, runtime, status);
            }, interval);
          }
        }
        this.jobData = this.currentJob;
        console.log("jobdata")
        console.log(this.jobData)
        // this.openJobLog(this.jobData, false, job.jobid, jobtype, job.jobstatus);
        this.datas = [];
        // if (Object.keys(this.jobData).length !== 0 && this.jobData.constructor === Object) {
        if(this.jobData){
          for (var i in this.jobData) {
            let a = { 'name': i, 'value': this.jobData[i] };
            this.datas.push(a);
          }
        }
        this.logsdata = this.datas
        // this.ngOnChanges();
        this.openDialog(jobId, "pipeline", this.currentJob.jobStatus,this.logsdata);
      }
    },
    error => {
      this.currentJob['status'] = 'ERROR';
      this.service.message('Could not get the results', 'error');
      clearInterval(this.timeInterval);
    }
  );
}
}


  openDialog(jobid, jobtype, status, data) {
    let isChain = jobtype == "chain" ? true : false;
    const dialogRef = this.dialog.open(JobDataViewerComponent, {
      height: '95%',
      width: '90%',
      disableClose: true,
      data: {
        isConsole: true,
        // content: this.datas,
        content: this.jobData,
        isChain: isChain,
        jobid: jobid,
        jobtype: jobtype,
        status: status,
        linenumber: 0,
        sequence: this.sequence
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }
  // ngOnChanges() {
  //   this.datas = [];
  //   if (Object.keys(this.jobData).length !== 0 && this.jobData.constructor === Object) {
  //     for (var i in this.jobData) {
  //       let a = { 'name': i, 'value': this.jobData[i] };
  //       this.datas.push(a);
  //     }
  //   }
  //   console.log(this.datas)
  // }

  stopJob(id) {
    this.service.stopPipeline(id).subscribe(
      response => {
        this.service.message('Stop Event Triggered!','success');
      }, error => {
        this.service.message('Error!', 'error');
      });
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
    this.getLogs()
  }
  getLogs() {
    this.jobService.getCommonJobsLen(this.getFilterColumn(), this.getFilterColumnValue(), this.getFilterDate()).subscribe((res) => {
      const n = res;
      this.totalJobs = n.valueOf();
      const remainder = this.totalJobs % this.rows;
      const cof = (this.totalJobs - remainder) / this.rows;
      if (remainder !== 0) {
        this.lastPage = cof;
      } else {
        this.lastPage = cof - 1;
      }
      if (true) {
        this.getJobs("First");
      } else {
        this.page = 0;
        this.lastPage = 0;
        this.jobsList = [];
      }
    });
    this.jobService.getHiddenLogs().subscribe(res => {
      this.hiddenlogs = res;
    })
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

  getSortedColumn(): string {
    let result = ""
    for (let key in this.sortElement) {
      if (this.sortElement[key] != "NO") {
        result = key
        break
      }
    }
    return result;
  }  
  getDirection(): string {
    let result = "DESC"
    for (let key in this.sortElement) {
      if (this.sortElement[key] != "NO") {
        result = this.sortElement[key]
        break
      }
    }
    return result;
  }
  filterAlias(value) {

    let array = value?.split(",", 2);

    if (array?.length > 1) {

      if (array[1] != "undefined" && array[1] != "null" && array[1].trim() != "") {

        return array[1]

      }

    }

    return array?array[0]:null

  }
  back() {
    this.location.back();
  }
  onSearch() {
    this.filtersService.changeText(this.searchText);
  }
  searching() {
    // if (this.searchText) {
      this.busy3 = this.jobService.getCommonJobsLen("alias", this.searchText, "1980-12-12").subscribe((res) => {
        const n = res;
        this.totalJobs = n.valueOf();
        const remainder = this.totalJobs % this.rows;
        const cof = (this.totalJobs - remainder) / this.rows;
        if (remainder !== 0) {
          this.lastPage = cof;
        } else {
          this.lastPage = cof - 1;
        }
        if (this.totalJobs !== 0) {
          this.searchJobs("First");
        } else {
          this.page = 0;
          this.lastPage = 0;
          this.jobsList = [];
        }
      });
    // }
    // else {
    //   this.getJobs('First')
    // }
  }
  searchJobs(choice: string) {
    switch (choice) {
      case "Next":
        this.page += 1;
        console.log(this.page);
        break;
      case "Prev":
        this.page -= 1;
        console.log(this.page);
        break;
      case "First":
        this.page = 0;
        break;
      case "Last":
        this.page = this.lastPage;
        break;
    }
    if (this.searchText) {
      this.busy3 = this.jobService.getCommonJobs(this.page, this.rows, "alias", this.searchText, "", this.getSortedColumn(), this.getDirection()).subscribe((res) => {
        this.jobsList = res;
      });
    }
    else {
      this.getJobs('First');
    }
  }
// Download functionality

  checkSelectAllStatus() {
    this.selectAllColsToDwnld = (this.colsToDownload.length == this.cols.length);
  }

  toggleSelectAllColsToDwnld() {
    this.downloadcols.forEach(col => col.selected = this.selectAllColsToDwnld);
  
    // Update colstodownload based on the selection
    this.colsToDownload = this.selectAllColsToDwnld
      ? this.downloadcols.map(col => col.header)
      : [];
  }
  toggleSelectHeaderToDwnld(header: string) {
    const col = this.downloadcols.find(col => col.header === header);
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
      this.selectAllColsToDwnld = this.downloadcols.every(col => col.selected);
    }
  }

  formatDate(date: string) {
    if(date==null){
      return '';
    }
     let splitteDate=date.split("T");
     let splitteTime=splitteDate[1].split(":");
     return splitteDate[0]+" "+splitteTime[0]+":"+splitteTime[1];
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
      let queryParams: any = {number: this.id}
      let queryParamsJson = JSON.stringify(queryParams);  
      this.jobService.downloadCsv(this.colsToDownload).subscribe((res) => {
        console.log(res)
        this.csvData.push(res);
        let fileBlob = new Blob(this.csvData, { type: "text/csv" });
        importedSaveAs(fileBlob,  "Jobs-Log Data-" + this.datepipe.transform(new Date(), "ddMMMyyyy-hhmmssa") + ".csv");
      });
    }
    catch (Exception: any) {
      this.service.messageService("Some error occured", Exception)
    }

  }
  terminateDownload(){
    this.cancelDownload=true;
   
    this.service.message('Download Terminated', 'error')
  }

  createColumn() {
    this.downloadcols = [];
    this.cols.forEach((key, index) => {
      var header = this.columnHeadersList[this.cols.indexOf(key)];
      var col = {};
      col["field"] = key;
      col["header"] = key;
      col["visible"] = index < 5 ? true : false;
      col["filterValue"] = null;
      this.downloadcols.push(col);
    });
    this.cols.forEach(item => this.colsBackup.push(Object.assign({}, item)));
  }
// Filter functionality

  colSearch(){
    this.searchToggle=!this.searchToggle
  }
  searchValueAdder(event, columnAlias:string, dateIndicator?: string) {
    // event.target.value=this.searchInputFilter[columnAlias];
    this.searchIncidentObj = {};
    this.searchInputFilter={
      'Job Id': '',
      'Job Name': '',
      'Used by': '',
      'Submitted on': '',
      'Finished on': '',
      'Runtime': '',
      'Status': ''
    };
    if(event == ""){
      this.searchInputFilter[columnAlias]= "";
      this.searchIncidentObj = {};
    }else{
    this.searchInputFilter[columnAlias]=event.target.value; 
    let columnName= this.colsMap[columnAlias];
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
  }
  searchOnInput() {
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
    if(andList.length>0){
     this.filterColumn= andList[0].or.property
     if(this.filterColumn==="finishtime" || this.filterColumn==="submittedon"){
      this.filterDate= andList[0].or.value
     }
     else{
     this.filterValue= andList[0].or.value
     }
    //  this.searchText= andList[0].or.value
    }
    else{
      this.filterColumn= ""
      this.filterValue= ""
     
    }
    this.page = 0;
    this.goToPage = null;
    this.paginatorFirstRow = 0;

    //this.typingTimer = setTimeout(() => {  }, this.doneTypingInterval);
    this.resetSelection();
    this.getLogs()

    // this.loadObjects(this.andObj);
  }

  resetSelection() {
    this.allIdsSelected = false;
    this.selectedTickets = [];
    this.includeIdsToSelected = [];
    this.excludeIdsFromSelected = [];
  }
  filterName(value) {
    let array = value.split(",");
    return array[0]
  }
  filterAliass(value){
    let array = value.split(",");
    return array[1]

  } 

  editChainJob(name) {
    if (name) {
      this.router.navigate(["../chains/", name], { relativeTo: this.route });
    } else {
      console.error('Name is undefined or null');
    }
  }

  navigate(job) {
    if (this.isNavigationValid(job)) {
      let name = this.filterName(job.alias)
      let aliass=this.filterAliass(job.alias)
      let type = job.jobtype
      if (type == "pipeline") {
        this.navigateToPipeline(job,name,aliass)
      } else {
        if (type == "chain") {
          this.editChainJob(name)
        } else {
          if (type == "internal") {
            // this.router.navigate(["../jobs/internal"], { relativeTo: this.route });
          } else {
            if (type == "agent") {
              // this.navigateToPipeline(name, "AGENTS")
            }
          }
        }
      }
    }
  }
  fetchAllInternalJobs() {
    this.busy5 = this.jobService.getAllInternalJobs().subscribe(resp => {
      this.internaljobs = resp;
      this.internaljobnames = [];
      this.internaljobs.forEach(internaljob => {
        this.internaljobnames.push(internaljob.name)
      })
    },
      (err) => {
        this.service.error("Error!", err._body);
      }
    );
  }
  isNavigationValid(job): boolean {
    return job.jobtype == 'pipeline' || job.jobtype == 'chain' || (job.jobtype == 'internal' && this.internaljobnames.includes(this.filterName(job.alias)))
  }
  navigateToPipeline(job,name,aliass) {
    if (job.type === 'NativeScript') {
      this.router.navigate(['../pipelines/view/' + name],{ relativeTo: this.route });
    } else {
      this.router.navigate(
        ['../pipelines/view/drgndrp' + '/' + name],{ relativeTo: this.route }
      );
    }
    // this.router.navigate(["../jobs", name,aliass], { relativeTo: this.route });

  }
  getjobnametags(obj: string, type) {
    obj = obj.slice(1, -1)
    let array = []
    if (type != undefined && type != null && type.trim() != "") {
      array.push({ value: type.toLowerCase(), color: "label label-warning" })
    }
    try {
      let jsonobj = JSON.parse(obj)
      let metadata = jsonobj.tag
      switch (metadata.toUpperCase()) {
        case "EVENT":
          array.push(this.THROUGHEVENT);
          break;
        case "SCHEDULED":
          array.push(this.THROUGHSCHEDULER);
          break;
        case "CHAIN":
          array.push(this.THROUGHCHAIN);
          break;
      }
    }
    catch (error) {
      console.error('Unable to parse jobmetadata', obj);
    }
    return array;
  }

}
