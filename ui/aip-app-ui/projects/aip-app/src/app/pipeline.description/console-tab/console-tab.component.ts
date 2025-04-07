//
//  @ 2018 Infosys Limited, Bangalore, India. All Rights Reserved.
//  Version: 1.0
//  Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
//  this Program is protected by copyright laws, international treaties and  other pending or existing intellectual property
//  rights in India, the United States, and other countries. Except as expressly permitted, any unauthorized reproduction, storage,
//  transmission in any form or by any means(including without limitation electronic, mechanical, printing, photocopying,
//  recording, or otherwise), or any distribution of this program, or any portion of it, may result in severe civil and
//  criminal penalties, and will be prosecuted to the maximum extent possible under the law.
//

import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges } from '@angular/core';
// import { StreamingServices } from '../../entities/streaming-services/streaming-services';
// import { StreamingServicesService } from '../../entities/streaming-services/streaming-services.service';
// import { JobsService } from '../../entities/jobs/jobs.service';
// import { Jobs } from '../../entities/jobs/jobs';
// import { MessageService } from '../../sharedModule/service/message.service';
// import { PipelinesummaryService } from '../../entities/pipeline-summary/pipeline-summary.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
// import { LoaderService } from '../../sharedModule/service/loader.service';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
// import { JobDataViewerComponent } from '../job-data-viewer/job-data-viewer.component';
import { Subscription } from 'rxjs';
import { StreamingServices } from '../../streaming-services/streaming-service';
import { Jobs } from '../../sharedModule/pipeline-model/jobs';
import { Services } from '../../services/service';
import { JobDataViewerComponent } from '../job-data-viewer/job-data-viewer.component';
import { MetricViewerComponent } from '../metric-viewer/metric-viewer.component';
// import { ScheduleService } from "../../entities/schedule-services/schedule.service";
// import { AgentService } from '../../entities/agent/agent.service';
// import { MetricViewerComponent } from '../metric-viewer/metric-viewer.component';

@Component({
  selector: 'app-console-tab',
  templateUrl: './console-tab.component.html',
  styleUrls: ['./console-tab.component.scss']
})
export class ConsoleTabComponent implements OnInit, OnChanges {
  logFiles: any;
  showLogs: boolean=false;

  constructor(
    // private streamingServicesService: StreamingServicesService,
    // private agentService: AgentService,
    // private jobsService: JobsService,
    // public pipelinesummaryService: PipelinesummaryService,
    // private scheduledJobService: ScheduleService,
    private modalService: NgbModal,
    // public messageService: MessageService,
    // private loaderService: LoaderService,
    public dialog: MatDialog,
    private service: Services,
  ) { }

  busy: Subscription
  jobData: any = '';
  @Input() item: StreamingServices;
  @Input() jobItem: Jobs;
  @Input() type: any;
  closeResult: string;
  datas: any = [];
  selectedModel: StreamingServices;
  jobsList: any = [];
  newData: any = [];
  job = false;
  totalJobs = 0;
  page = 0;
  lastPage = 0;
  currentJob: any = {};
  timeInterval: any;
  modalRef: any;
  rows = 5;
  validations: any = [];
  showValidation: boolean;
  keys: any = [];
  values: any = [];
  pi: boolean = false;
  uid = JSON.parse(sessionStorage['user']).user_email;
  @Output() statusChanged = new EventEmitter();

  USERTRIGGERED = { value: "user-triggered", color: "label label-info" }
  SYSTEMTRIGGERED = { value: "system-triggered", color: "label label-success" }
  SYSTEMGENERATED = { value: "system-generated", color: "label label-warning" }
  THROUGHEVENT = { value: "through event", color: "label label-warning" }
  THROUGHSCHEDULER = { value: "through scheduler", color: "label label-info" }
  THROUGHCHAIN = { value: "through chain", color: "label label-danger" }

  ngOnInit() {
    this.getJobsData(this.item);
  }

  ngOnChanges() {
    this.datas = [];
    if (Object.keys(this.jobData).length !== 0 && this.jobData.constructor === Object) {
      for (var i in this.jobData) {
        let a = { 'name': i, 'value': this.jobData[i] };
        this.datas.push(a);
      }
    }
  }

  isObject(val) {
    if (typeof val === 'object') {
      if (val != null) {
        if (Object.keys(val).length !== 0 && val.constructor === Object) {
          this.newData = [];
          for (const i in val) {
            let a = { name: i, value: val[i] };
            this.newData.push(a);
          }
        }
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  getJobsData(model) {
    if (this.type == "agent") {
      this.busy = this.service.getAgentById(model.cid).subscribe(
        res => {
          this.selectedModel = res;
          this.busy = this.service.getAgentJobsByStreamingServiceLen(model.name).
            subscribe(
              response => {
                var n: Number = new Number(response);
                this.totalJobs = n.valueOf();
                var remainder = this.totalJobs % this.rows;
                var cof = ((this.totalJobs - remainder) / this.rows);
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
        },
        error => this.service.message('Could not fetch details!', 'error')
      );
    }
    else {
      this.busy = this.service.getStreamingServices(model.cid).subscribe(
        res => {
          this.selectedModel = res;
          this.busy = this.service.getJobsByStreamingServiceLen(model.name).
            subscribe(
              response => {
                var n: Number = new Number(response);
                this.totalJobs = n.valueOf();
                var remainder = this.totalJobs % this.rows;
                var cof = ((this.totalJobs - remainder) / this.rows);
                if (remainder != 0) {
                  this.lastPage = cof;
                }
                else {
                  this.lastPage = cof - 1;
                }
                this.service.message('Fetched successfully', 'success');
                if (this.totalJobs !== 0 || model.type == "Azure") {
                  this.getJobs('First');
                }
              },
              error => this.service.message('Could not fetch jobs!', 'error')
            );
        },
        error => this.service.message('Could not fetch details!', 'error')
      );
    }
  }

  showValidations(jobId: string) {
    this.validations = [];
    this.showValidation = false;
    this.jobsList.forEach(element => {
      if (element.jobId === jobId) {
        if (element.validation != null) {
          const rows = element.validation.slice(1, element.validation.length - 1).split(',');
          rows.forEach(row => {
            const temp = row.trim().split(':');
            const obj = {
              key: temp[0].slice(1, temp[0].length - 1),
              value: temp[1].slice(1)
            };
            this.validations.push(obj);
          });
          this.showValidation = true;
        }
        const dialogRef = this.dialog.open(JobDataViewerComponent, {
          height: '95%',
          width: '90%',
          disableClose: true,
          data: {
            isConsole: false,
            content: this.validations
          }
        });
        dialogRef.afterClosed().subscribe(result => {
        });
      }
    });
  }

  fetchJob(jobId: string, runtime: string, status) {
    try{
      let linenumber = 0
      if (this.type == "agent") {
        this.busy = this.service.fetchAgentJob(jobId, linenumber, 0, status, false).subscribe(
          response => {
            this.currentJob = response
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
            this.service.message( 'Job Status not fetched:' + error,'error');
          }
        );
      }
      else {
        this.busy = this.service.fetchSparkJob(jobId, linenumber, runtime, 0, status, false).subscribe(
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
      }
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
    if (this.type == "agent") {
      this.busy = this.service.fetchAgentJob(jobId, linenumber, 0, status, false).subscribe(
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
            this.ngOnChanges();
            this.openDialog(jobId, "agent", this.currentJob.jobStatus);
          }
        },
        error => {
          this.currentJob['status'] = 'ERROR';
          this.service.message( 'Job Status not fetched:' + error,'error');
          clearInterval(this.timeInterval);
        }
      );
    }
    // else if(this.item.type == "Azure"){
    //   this.logFiles = []
    //   for(let log in job.logFiles){
    //     let logobj = {}
    //     logobj["key"] = log
    //     logobj["value"] = job.logFiles[log]
    //     this.logFiles.push(logobj)
    //   }
    //   this.showLogs = true
    // }
    else {
      this.busy = this.service.fetchSparkJob(jobId, linenumber, runtime, 0, status, false).subscribe(
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
            this.ngOnChanges();
            this.openDialog(jobId, "pipeline", this.currentJob.jobStatus);
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

  openDialog(jobid, jobtype, status) {
    const dialogRef = this.dialog.open(JobDataViewerComponent, {
      height: '95%',
      width: '90%',
      disableClose: true,
      data: {
        isConsole: true,
        content: this.datas,
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

  showmetrics(job) {
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

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  onRefresh() {
    this.ngOnInit();
    this.pi = false;
  }

  sortData(sort: Sort) {
    const data = this.jobsList.slice();
    if (!sort.active || sort.direction === '') {
      this.jobsList = data;
      return;
    }
    this.jobsList = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'jobId': return this.compareString(a.jobId, b.jobId, isAsc);
        case 'submittedBy': return this.compareString(a.submittedBy, b.submittedBy, isAsc);
        case 'submitted_on': return this.compareString(a.submitted_on.toString(), b.submitted_on.toString(), isAsc);
        case 'jobStatus': return this.compareString(a.jobStatus, b.jobStatus, isAsc);
        case 'version': return this.compareNumber(a.version, b.version, isAsc);
        default: return 0;
      }
    });
  }

  compareString(a: string, b: string, isAsc: boolean) {
    return (a.toLowerCase() < b.toLowerCase() ? -1 : 1) * (isAsc ? 1 : -1);
  }

  compareNumber(a: number, b: number, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
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
    if (this.type == "agent") {
      this.busy = this.service.getJobsByAgents(this.item.name, this.page, this.rows).subscribe(res => {
        this.jobsList = res;
      });
    }
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
    else {
      this.busy = this.service.getJobsByStreamingService(this.item.name, this.page, this.rows).subscribe(res => {
        this.jobsList = res;
      });
    }
  }

  stopJob(id) {
    this.service.stopPipeline(id).subscribe(
      response => {
        this.service.message('Stop Event Triggered!','success');
      }, error => {
        this.service.message('Error!', 'error');
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
      // console.error('Unable to parse jobmetadata');
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
      //console.error('Unable to parse jobmetadata');
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

  onDialogClose(){
    this.showLogs = false
  }
}
