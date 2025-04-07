import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from 'com-lib-util';
import { LogViewerComponent } from '../../../dataset/log-viewer/log-viewer.component';
import { MetricViewerComponent } from '../../../pipeline.description/metric-viewer/metric-viewer.component';
import { ScheduleService } from '../../../services/schedule.service';
import { WorkareaItemsComponent } from '../wk-workarea-items.component';
import { DatasetServices } from '../../../dataset/dataset-service';
import { Services } from '../../../services/service';
import { JobDataViewerComponent } from '../../../pipeline.description/job-data-viewer/job-data-viewer.component';

@Component({
  selector: 'app-wk-logs',
  templateUrl: './wk-logs.component.html',
  styleUrls: ['./wk-logs.component.scss']
})
export class WkLogsComponent implements OnInit,OnChanges, WorkareaItemsComponent {

  constructor(private datasetService:DatasetServices,
    private scheduledJobService: ScheduleService,
    private service: Services,
    public messageService: Services,
    public dialog: MatDialog,
     private streamingService: Services) { }

  @Input() data: any;
  @Input() internalJob
  @Output() event = new EventEmitter<any>();
  @Output() statusChanged = new EventEmitter();
  proceed = false
  currentJob: any = {};
  timeInterval: any;
  jobData: any = '';
  logsdata: any = [];
  corelid
  jobsList
  totalJobs
  datas
  type

  USERTRIGGERED = { value: "user-triggered", color: "label label-info" }
  SYSTEMTRIGGERED = { value: "system-triggered", color: "label label-success" }
  SYSTEMGENERATED = { value: "system-generated", color: "label label-warning" }
  THROUGHEVENT = { value: "through event", color: "label label-warning" }
  THROUGHSCHEDULER = { value: "through scheduler", color: "label label-info" }
  THROUGHCHAIN = { value: "through chain", color: "label label-danger" }


  ngOnInit(): void {
    this.corelid = this.datasetService.getCorelId()
    if(this.corelid)  
    if(this.data.wkJson.input.type == "internaljob"){
      this.datasetService.findInternalJobsByCoreid(this.corelid).subscribe(resp => {
        this.jobsList=resp
        this.totalJobs = this.jobsList.length
      })
    }
    else{
      this.datasetService.findByCoreid(this.corelid).subscribe(resp => {
        this.jobsList=resp
        this.totalJobs = this.jobsList.length
      },err=>{},
      ()=>{
        this.jobsList.forEach(job => {
          this.streamingService.getStreamingServicesByName(job.streamingService).subscribe(res=>{
            job.streamingService = res.alias
          })
        });
        
      })
    }
  }

  onRefresh(){
    this.ngOnInit();
  }

  ngOnChanges() {
    this.ngOnInit();
  }
  
  onChangeStatus(value) {
    this.statusChanged.emit(value);
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

  openDialog(jobid, jobtype, status, data) {
    const dialogRef = this.dialog.open(JobDataViewerComponent, {
      height: '95%',
      width: '90%',
      disableClose: true,
      data: {
        isConsole: true,
        // content: this.datas,
        content: this.jobData,
        isChain: false,
        jobid: jobid,
        jobtype: jobtype,
        status: status,
        linenumber: 0
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
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

  showConsole(jobId: string, runtime: string, status, job) { 
  if (this.internalJob){
    let linenumber = 0;
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
        console.log(this.datas)
        this.logsdata = this.datas
        // this.ngOnChanges();
        this.openDialog(jobId, "internal jobs", this.currentJob.jobStatus,this.logsdata);
      }
    },error=>{
      this.currentJob['status'] = 'ERROR';
      this.service.message('Could not get the results', 'error');
      clearInterval(this.timeInterval);
    });


  }
  else{
  let linenumber = 0;
  this.service.fetchSparkJob(jobId, linenumber, runtime, 0, status, false).subscribe(
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
        console.log(this.datas)
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
      // this.datas = []
      // let linenumber = 0
      // this.service.fetchSparkJob(job.jobId, linenumber, job.runtime, 0, job.jobStatus, false).subscribe(res => {
      //   this.totalJobs = res.length
      //   for (var i in res) {
      //     let a = { 'name': i, 'value': res[i] };
      //     this.datas.push(a);
      //   }
      //   const dialogRef = this.dialog.open(LogViewerComponent, {
      //     height: '95%',
      //     width: '90%',
      //     disableClose: true,
      //     data: {
      //       isConsole: true,
      //       content: this.datas,
      //       isChain: false,
      //       jobid: job.jobId,
      //       jobtype: "pipeline",
      //       status: job.jobStatus,
      //       linenumber: linenumber
      //     }
      //   });
      //   dialogRef.afterClosed().subscribe(result => {
      //   });
      // })
    }

    showmetrics(job) {
//console.log("jobparam",job.jobparam)
//console.log("jobimage",job.image)
//console.log("job",job)
      const dialogRef = this.dialog.open(MetricViewerComponent, {
        height: '95%',
        width: '90%',
        data: {
          metric: job.jobmetric,
          param: job.jobparam,
          image:job.image
        }
      });
      dialogRef.afterClosed().subscribe(result => {
      });
    }

     stopJob(id) {
      this.scheduledJobService.stopPipeline(id).subscribe(
        response => {
          this.messageService.info('Job', 'Stop Event Triggered!');
        }, error => {
          this.messageService.info('Error!', error);
        });
    }

    getjobnametags(obj) {
      try {
        let jsonobj = JSON.parse(obj)
        let metadata = jsonobj.tag
        switch (metadata.toUpperCase()) {
          case "EVENT":
            return [this.THROUGHEVENT]
          case "SCHEDULED":
            return [this.THROUGHSCHEDULER]
          case "CHAIN":
            return [this.THROUGHCHAIN]
          default:
            return []
        }
      }
      catch (error) {
        console.error('Unable to parse jobmetadata');
        return []
      }
    }

    getjobownertags(obj) {
      try {
        let jsonobj = JSON.parse(obj)
        let metadata = jsonobj.tag
        switch (metadata.toUpperCase()) {
          case "EVENT":
            return [this.USERTRIGGERED]
          case "SCHEDULED":
            return [this.SYSTEMTRIGGERED]
          case "CHAIN":
            return [this.SYSTEMGENERATED]
          case "USER":
            return [this.USERTRIGGERED]
          default:
            return []
        }
      }
      catch (error) {
        console.error('Unable to parse jobmetadata');
        return []
      }
    }

    getBackgroundColor(status) {
      switch (status.toUpperCase()) {
        case "STARTED":
          return "background-color: #c7fffc;"
        case "COMPLETED":
          return "background-color: #caffce;"
        case "ERROR":
          return "background-color: #ffefef;"
        case "RUNNING":
          return "background-color: #fffdbe;"
        case "CANCELLED":
          return "background-color: #f1f1f1;"
      }
    }
  
}
