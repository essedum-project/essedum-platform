import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DatasetServices } from '../dataset-service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Sort } from '@angular/material/sort';
import { LogViewerComponent } from '../log-viewer/log-viewer.component';

@Component({
  selector: 'app-log-console',
  templateUrl: './log-console.component.html',
  styleUrls: ['./log-console.component.scss']
})
export class LogConsoleComponent implements OnInit {

    constructor(private datasetService: DatasetServices,
       private router: Router, 
      public dialog: MatDialog) { }
  
    busy: Subscription
    jobData: any = '';
    @Input('dataset') item: string;
    @Input('jobname') jobName: any;
    corelid
    closeResult: string;
    datas: any = [];
    jobsList = [];
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
    logsdata: any = [];
    pi: boolean = false;
    @Output() statusChanged = new EventEmitter();
    @Output() event = new EventEmitter<any>();
  
    USERTRIGGERED = { value: "user-triggered", color: "label label-info" }
    SYSTEMTRIGGERED = { value: "system-triggered", color: "label label-success" }
    SYSTEMGENERATED = { value: "system-generated", color: "label label-warning" }
    THROUGHEVENT = { value: "through event", color: "label label-warning" }
    THROUGHSCHEDULER = { value: "through scheduler", color: "label label-info" }
    THROUGHCHAIN = { value: "through chain", color: "label label-danger" }
  
    ngOnInit() {
      if(this.router.url.includes('workflows')){ 
        this.corelid = this.datasetService.getCorelId()
      }      
      this.getJobsData();
  
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
  
    getJobsData() {
      if (this.jobName) {
        this.busy = this.datasetService.fetchInternalJobLenByname(this.jobName).
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
              this.datasetService.message('Fetched successfully');
              if (this.totalJobs !== 0) {
                this.getJobs('First');
              } else this.jobsList = [];
            },
            error => this.datasetService.message('Could not fetch jobs!', error)
          );
      }
      else if (this.item) {
        this.busy = this.datasetService.fetchInternalJobLen(this.item).
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
              this.datasetService.message('Fetched successfully');
              if (this.totalJobs !== 0) {
                this.getJobs('First');
              } else this.jobsList = [];
            },
            error => this.datasetService.message('Could not fetch jobs!', error)
          );
      }
      else {
        this.datasetService.findByCoreid(this.corelid).subscribe(resp => {
          this.jobsList=resp
          this.onChangeStatus('')
          this.totalJobs = this.jobsList.length
        })
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
          // const dialogRef = this.dialog.open(LogViewerComponent, {
          //   height: '95%',
          //   width: '90%',
          //   disableClose: true,
          //   data: {
          //     isConsole: false,
          //     content: this.validations
          //   }
          // });
          // dialogRef.afterClosed().subscribe(result => {
          // });
        }
      });
    }
  
    fetchJob(job) {
      try{
        let linenumber = 0
        this.busy = this.datasetService.fetchInternalJobLog(job.jobId, linenumber, 0, job.jobStatus).subscribe(
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
            this.datasetService.message('Error!', 'Job Status not fetched:' + error);
          }
        );
  
      }
      catch(Exception){
      this.datasetService.message("Some error occured", "Error")
      }
     
    }
  
    onChangeStatus(value) {
      this.statusChanged.emit(value);
    }
  
    showConsole(job,jobtype) {
      let linenumber = 0
      this.busy = this.datasetService.fetchInternalJobLog(job.jobId, 0, 0, job.jobStatus).subscribe(
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
                  this.fetchJob(job);
                }, interval);
              }
            }
            this.jobData = this.currentJob;
            console.log("jobdata");
            console.log(this.jobData);
            this.datas = [];
            if(this.jobData){
              for (var i in this.jobData) {
                let a = { 'name': i, 'value': this.jobData[i] };
                this.datas.push(a);
              }
            }
            console.log(this.datas)
            this.logsdata = this.datas;
            // this.ngOnChanges();
            this.openDialog(job.jobId, "internal", job.jobStatus, this.logsdata);
          }
        },
        error => {
          this.currentJob['status'] = 'ERROR';
          this.datasetService.message('Could not get the results', error);
          clearInterval(this.timeInterval);
        }
      );
    }
  
    openDialog(jobid, jobtype, status, data) {
      const dialogRef = this.dialog.open(LogViewerComponent, {
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
  
    // private getDismissReason(reason: any): string {
    //   if (reason === ModalDismissReasons.ESC) {
    //     return 'by pressing ESC';
    //   } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
    //     return 'by clicking on a backdrop';
    //   } else {
    //     return `with: ${reason}`;
    //   }
    // }
  
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
      if (this.jobName) {
        this.busy = this.datasetService.fetchInternalJobByName(this.jobName, this.page, this.rows).subscribe(res => {
          this.jobsList = res;
        });
      }
      else {
        this.busy = this.datasetService.fetchInternalJob(this.item, this.page, this.rows).subscribe(res => {
          this.jobsList = res;
        });
      }
     
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

    stopJob(id) {
      this.datasetService.stopJob(id).subscribe(
        response => {
          this.datasetService.message('Stop Event Triggered!','success');
        }, error => {
          this.datasetService.message('Error!', 'error');
        });
    }
  
}
