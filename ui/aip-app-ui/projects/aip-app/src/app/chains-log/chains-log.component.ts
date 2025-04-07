

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Services } from '../services/service';
import { MatDialog } from '@angular/material/dialog';
import { JobDataViewerComponent } from '../pipeline.description/job-data-viewer/job-data-viewer.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PipelineService } from '../services/pipeline.service';


@Component({
  selector: 'app-chains-log',
  templateUrl: './chains-log.component.html',
  styleUrls: ['./chains-log.component.scss']
})
export class ChainsLogComponent implements OnInit{
  cname:any;
  page = 0
  row = 4
  totalJobs: number = 0;
  lastPage: number = 0;
  currentJob: any = {};
  timeInterval: any;
  jobData: any = '';
  datas: any=[];
  jobList: any = [];
  logsdata: any = [];
  sequence: any = [];
  constructor(
    private service: Services,
    private router: ActivatedRoute,
    public dialog: MatDialog,
    private pipelineService: PipelineService
  ){}

  @Output() statusChanged = new EventEmitter();
  ngOnInit(): void {
    this.cname=this.router.snapshot.paramMap.get('name');
    this.service.getChainJobLen(this.cname).
            subscribe(
              response => {
                var n: Number = new Number(response);
                this.totalJobs = n.valueOf();
                var remainder = this.totalJobs % this.row;
                var cof = ((this.totalJobs - remainder) / this.row);
                if (remainder != 0) {
                  this.lastPage = cof;
                }
                else {
                  this.lastPage = cof - 1;
                }
                this.service.message('Fetched successfully', 'success');
                if (this.totalJobs !== 0) {
                  this.getJobs('First');
                }
              },
              error => this.service.message('Could not fetch jobs!', 'error')
            );
    this.service.getLogList(this.cname, this.page, this.row).subscribe(resp=>{
    // this.service.fetchInternalJobByName(this.cname,this.page,this.row).subscribe(resp=>{
      this.jobList =  resp
      this.getIndividualPipeline(resp[0].jobName);
    })
    this.jobList.forEach((job,index)=>{
      this.jobList[index].jobmetadata = JSON.parse(this.jobList[index].jobmetadata)
      if(this.jobList[index].submittedOn!=null)
      this.jobList[index].submittedOn = this.jobList[index].submittedOn.split('+')[0]
      if(this.jobList[index].finishtime!=null)
      this.jobList[index].finishtime = this.jobList[index].finishtime.split('+')[0]
    })

  }

onRefresh() {
  this.ngOnInit();
}

sortByLatest(jobData){
  this.jobList=jobData.sort((a,b)=>new Date(b.submittedOn).getTime()-new Date(a.submittedOn).getTime())
}

getIndividualPipeline(chainName) {
  this.pipelineService.getChainByName(chainName).subscribe((res) => {
    res.jsonContent.element.elements.forEach(e => {
      this.sequence.push(e.name);
    })
  });
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
      break;
    case 'Prev':
      this.page -= 1;
      if (this.page == 0) {
        choice = 'First';
        this.getJobs('First');
        break;
      }
      break
    case 'First':
      this.page = 0;
      break;
    case 'Last':
      this.page = this.lastPage;
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
    this.service.getLogList(this.cname,this.page,this.row).subscribe(resp=>{
      this.jobList = resp;
      this.sortByLatest(this.jobList);
    });
  // }
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

showConsole(jobId: string, runtime: string, status, job) {
  let linenumber = 0
  // this.service.fetchSparkJob(jobId, linenumber, runtime, 50, status, false).subscribe(
  //   response => {
  //     if (response != null) {
  //       this.currentJob = response;
  //       this.onChangeStatus(this.currentJob.status);
  //       if (this.currentJob.status) {
  //         if (
  //           this.currentJob.status === 'STARTED' ||
  //           this.currentJob.status === 'RUNNING'
  //         ) {
  //           const interval = 10000;
  //           this.timeInterval = setInterval(() => {
  //             this.fetchJob(jobId, runtime, status);
  //           }, interval);
  //         }
  //       }
  //       this.jobData = this.currentJob;
  //       console.log("jobdata")
  //       console.log(this.jobData)
  //       // this.openJobLog(this.jobData, false, job.jobid, jobtype, job.jobstatus);
  //       this.datas = [];
  //       // if (Object.keys(this.jobData).length !== 0 && this.jobData.constructor === Object) {
  //       if(this.jobData){
  //         for (var i in this.jobData) {
  //           let a = { 'name': i, 'value': this.jobData[i] };
  //           this.datas.push(a);
  //         }
  //       }
  //       console.log(this.datas)
  //       this.logsdata = this.datas
  //       // this.ngOnChanges();
  //       this.openDialog(jobId, "pipeline", this.currentJob.jobStatus,this.logsdata);
  //     }
  //   },
  //   error => {
  //     this.currentJob['status'] = 'ERROR';
  //     this.service.message('Could not get the results', 'error');
  //     clearInterval(this.timeInterval);
  //   }
  // );
  this.service.getIndvLog(jobId).subscribe(res => {
    this.jobData = res;

    this.openDialog(jobId, res.jobStatus);
  })
}


  openDialog(jobid, status){
    const dialogRef = this.dialog.open(JobDataViewerComponent, {
      height: '95%',
      width: '90%',
      disableClose: true,
      data: {
        isConsole: true,
        // content: this.datas,
        content: this.jobData,
        isChain: true,
        jobid: jobid,
        jobtype: "chain",
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
}

