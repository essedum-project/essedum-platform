import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DashConstantService, LeapTelemetryService } from 'com-lib-util';
import { JobServices } from './jobservice';
import { JobDataViewerComponent } from '../job-data-viewer/job-data-viewer.component';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project';
import { OpenTelemetryService } from '../../../telemetry-util/open-telemetry.service';

@Component({
  selector: 'lib-jobs',
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.css'
})
export class JobsComponent implements OnInit, OnDestroy {

  @Input() internalJob
  @Input() cname
  @Input() desProj
  @Input() srcProj

  internalJobs = ['CopyDatasets','CopyPipelines', 'CopyDashboards']
  page = 0
  row = 4
  totalJobs: number = 0;
  lastPage: number = 0;
  currentJob: any = {};
  timeInterval: any;
  jobData: any = '';
  datas: any = [];
  jobList: any = [];
  logsdata: any = [];
  sourceProjectList: Project[] = [];
  lazyloadevent = {
    first: 0,
    rows: 1000,
    sortField: null,
    sortOrder: 1,
    filters: null,
    multiSortMeta: null
  };
  desProjId: number;
  defaultvalue = '--'
  constructor(
    protected dashConstantService: DashConstantService,
    private telemetryService: LeapTelemetryService,
    private openTelemetryService: OpenTelemetryService,
    private service: JobServices,
    private projectService: ProjectService,
    public dialog: MatDialog) { }
  @Output() statusChanged = new EventEmitter();
  ngOnInit(): void {
    this.lazyloadevent.rows=this.dashConstantService.getrowCount();
    this.telemetryImpression();
    this.desProj = sessionStorage.getItem("organization");
    let project: Project = new Project();
    this.projectService.findAll(project, this.lazyloadevent).subscribe(
      response => {
        this.sourceProjectList = response.content.sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        );
        let index = this.sourceProjectList.findIndex(x => x.name === this.desProj);
        this.desProjId=this.sourceProjectList[index].id;
      });
    if (this.internalJob) {
      this.totalJobs = 0;
      this.internalJobs.forEach((job, index) => {
        this.service.fetchInternalJobLenByname(job, this.desProj).
          subscribe(
            response => {
              var n: Number = new Number(response);
              this.totalJobs = this.totalJobs + n.valueOf();
              if (index == this.internalJobs.length - 1) {
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
                  this.statusChanged.emit(true);
                  this.getJobs('First');
                } else this.jobList = [];
              }
            },
            error => this.service.message('Could not fetch jobs', 'error')
          );
      });
    }

  }

  ngOnDestroy(): void {
    let activeSpan = this.openTelemetryService.fetchActiveSpan();
    this.openTelemetryService.endTelemetry(activeSpan);
  }

  telemetryImpression() {
    // this.telemetryService.start();
    // this.telemetryService.impression("icip-iai", "list", "EventsComponent");
    this.openTelemetryService.startTelemetry("icip-iai", "EventsComponent", 'list');
  }

  onRefresh() {
    // this.ngOnInit();
    if (this.totalJobs !== 0) {
      this.getJobs('First');
    }else{
      this.ngOnInit();
      this.service.message('No jobs triggered!', 'success');
    }
  }

  sortByOrder(jobData) {
    this.jobList = jobData.sort((a, b) => parseInt(a.index) - parseInt(b.index));
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
    this.jobList = [];
    this.internalJobs.forEach((job, index) => {
      this.service.fetchInternalJobByName2(job, this.page, this.row, this.desProj).subscribe(resp => {
        if(resp.length>0){
          resp[0]['index'] = index
          this.jobList.push(resp[0]);
        }else{
          resp.push({});
          resp[0]['index'] = index.toString()
          resp[0]['jobName'] = job
          resp[0]['jobStatus'] = 'AWAITING'
          resp[0]['id'] = 'NA'
          resp[0]['submittedBy'] = 'NA'
          this.jobList.push(resp[0]);
        }

        if (index == this.internalJobs.length - 1) {
          this.sortByOrder(this.jobList);
          this.jobList.forEach((job, index) => {
            if (this.jobList[index]?.jobmetadata != null)
              this.jobList[index].jobmetadata = JSON.parse(this.jobList[index].jobmetadata)
            // if (this.jobList[index]?.submittedOn != null)
            //   this.jobList[index].submittedOn = this.jobList[index].submittedOn.split('+')[0]
            // if (this.jobList[index]?.finishtime != null)
            //   this.jobList[index].finishtime = this.jobList[index].finishtime.split('+')[0]
          })
        }
      });
    });
  }

  onChangeStatus(value) {
    this.statusChanged.emit(value);
  }
  fetchInternalJob(jobId: string, status) {
    try {
      let linenumber = 0
      this.service.fetchInternalJob(jobId, linenumber, 50, status, this.desProj).subscribe(
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
          this.service.message('Job Status not fetched:' + error, 'error');
        }
      );
      // }
    }
    catch (Exception) {
      this.service.message("Some error occured", "error")
    }
  }

  showConsole(jobId: string, runtime: string, status, job) {
    if (this.internalJob) {
      let linenumber = 0;
      this.service.fetchInternalJob(jobId, linenumber, 50, status, this.desProj).subscribe(response => {
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
          if (this.jobData) {
            for (var i in this.jobData) {
              let a = { 'name': i, 'value': this.jobData[i] };
              this.datas.push(a);
            }
          }
          console.log(this.datas)
          this.logsdata = this.datas
          // this.ngOnChanges();
          this.openDialog(jobId, "internal jobs", this.currentJob.jobStatus, this.logsdata);
        }
      }, error => {
        this.currentJob['status'] = 'ERROR';
        this.service.message('Could not get the results', 'error');
        clearInterval(this.timeInterval);
      });


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
        linenumber: 0,
        project: this.desProj
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  stopJob(id) {
    this.service.stopJob(id).subscribe(
      response => {
        this.service.message('Stop Event Triggered!', 'success');
      }, error => {
        this.service.message('Error!', 'error');
      });
  }

  retrigger(jobName) {
    if (this.srcProj == null || this.srcProj == undefined) {
      this.service.message("Source Project Should be Selected", "error");
    }
    else if (this.srcProj == this.desProj) {
      this.service.message("Source Project and Destination Project cannot be same", "error");
    }
    else {
      if (jobName == 'CopyPipelines') {
        this.projectService
          .copyPipelines(this.srcProj, this.desProj, this.desProjId)
          .subscribe(
            (res) => {
              this.service.message("CopyPipelines has restarted.", "success");
            },
            (error) => {
              if (error instanceof TypeError)
                this.service.message("Copy Blueprint has already been done for this project", "error");
              else this.service.message("Copy blueprint failed", "error");
            }
          );
      }
      if (jobName == 'CopyDatasets') {
        this.projectService
          .copyDatasets(this.srcProj, this.desProj, this.desProjId)
          .subscribe(
            (res) => {
              this.service.message("CopyDatasets has restarted.", "success");
            },
            (error) => {
              if (error instanceof TypeError)
                this.service.message("Copy Blueprint has already been done for this project", "error");
              else this.service.message("Copy blueprint failed", "error");
            }
          );
      }
      if (jobName == 'CopyDashboards') {
        this.projectService
          .copyDashboards(this.srcProj, this.desProj, this.desProjId)
          .subscribe(
            (res) => {
              this.service.message("CopyDashboards has restarted.", "success");
            },
            (error) => {
              if (error instanceof TypeError)
                this.service.message("Copy Blueprint has already been done for this project", "error");
              else this.service.message("Copy blueprint failed", "error");
            }
          );
      }
    }
  }
}
