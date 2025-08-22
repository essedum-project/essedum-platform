import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Services } from '../services/service';
import { MatDialog } from '@angular/material/dialog';
import { JobDataViewerComponent } from '../pipeline.description/job-data-viewer/job-data-viewer.component';
import { ShowOutputArtifactsComponent } from '../pipeline.description/show-output-artifacts/show-output-artifacts.component';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
})
export class JobsComponent implements OnInit {
  @Input() internalJob;
  @Input() cname;
  @Input() agenttaskname;
  @Output() status = new EventEmitter();
  page = 0;
  row = 4;
  totalJobs: number = 0;
  lastPage: number = 0;
  currentJob: any = {};
  timeInterval: any;
  jobData: any = '';
  datas: any = [];
  jobList: any = [];
  logsdata: any = [];
  isHovered = false;
  constructor(private service: Services, public dialog: MatDialog) {}
  @Output() statusChanged = new EventEmitter();
  ngOnInit(): void {
    if (this.internalJob) {
      this.service.fetchInternalJobLenByname(this.internalJob).subscribe(
        (response) => {
          var n: Number = new Number(response);
          this.totalJobs = n.valueOf();
          var remainder = this.totalJobs % this.row;
          var cof = (this.totalJobs - remainder) / this.row;
          if (remainder != 0) {
            this.lastPage = cof;
          } else {
            this.lastPage = cof - 1;
          }

          this.service.message('Fetched successfully', 'success');
          if (this.totalJobs !== 0) {
            this.getJobs('First');
          } else this.jobList = [];
        },
        (error) => this.service.message('Could not fetch jobs', 'error')
      );
    } else {
      this.service.getJobsByStreamingServiceLen(this.cname).subscribe(
        (response) => {
          var n: Number = new Number(response);
          this.totalJobs = n.valueOf();
          var remainder = this.totalJobs % this.row;
          var cof = (this.totalJobs - remainder) / this.row;
          if (remainder != 0) {
            this.lastPage = cof;
          } else {
            this.lastPage = cof - 1;
          }
          this.service.message('Fetched successfully', 'success');
          if (this.totalJobs !== 0) {
            this.getJobs('First');
          }
        },
        (error) => this.service.message('Could not fetch jobs!', 'error')
      );
    }

    this.jobList.forEach((job, index) => {
      // Check if jobmetadata exists and is a string before parsing
      if (
        this.jobList[index].jobmetadata &&
        typeof this.jobList[index].jobmetadata === 'string'
      ) {
        try {
          this.jobList[index].jobmetadata = JSON.parse(
            this.jobList[index].jobmetadata
          );
        } catch (error) {
          console.error(
            'Error parsing jobmetadata for job at index',
            index,
            ':',
            error
          );
          // Keep the original value if parsing fails
        }
      }
      // If jobmetadata is already an object or null/undefined, leave it as is

      if (this.jobList[index].submittedOn != null)
        this.jobList[index].submittedOn =
          this.jobList[index].submittedOn.split('+')[0];
      if (this.jobList[index].finishtime != null)
        this.jobList[index].finishtime =
          this.jobList[index].finishtime.split('+')[0];
    });
  }

  onRefresh() {
    this.ngOnInit();
  }

  private isValidJobData(jobData: any): boolean {
    if (!jobData) {
      console.warn('Job data is null or undefined');
      return false;
    }

    if (!Array.isArray(jobData)) {
      console.warn('Job data is not an array');
      return false;
    }

    if (jobData.length === 0) {
      console.warn('Job data array is empty');
      return false;
    }
    return true;
  }

  sortByLatest(jobData: any): void {
    if (!this.isValidJobData(jobData)) {
      this.jobList = [];
      return;
    }

    this.jobList = jobData.sort((a, b) => {
      const dateA = a.submittedOn ? new Date(a.submittedOn).getTime() : 0;
      const dateB = b.submittedOn ? new Date(b.submittedOn).getTime() : 0;
      return dateB - dateA;
    });

    if (this.jobList.length > 0 && this.jobList[0].jobStatus) {
      this.status.emit(this.jobList[0].jobStatus);
    }
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
        break;
      case 'First':
        this.page = 0;
        break;
      case 'Last':
        this.page = this.lastPage;
        break;
    }

    if (this.cname) {
      this.service
        .fetchInternalJobByName(this.cname, this.page, this.row)
        .subscribe({
          next: (resp) => {
            if (resp && Array.isArray(resp)) {
              this.jobList = resp;
              const filteredJobs = this.jobList.filter(
                (job) =>
                  job.agenttaskname?.toLowerCase() ===
                  job.jobmetadata?.taskName?.toLowerCase()
              );
              this.sortByLatest(filteredJobs);
            } else {
              console.warn('Invalid response format:', resp);
              this.jobList = [];
              this.service.message(
                'No jobs found or invalid data format',
                'warning'
              );
            }
          },
          error: (error) => {
            console.error('Error fetching jobs by name:', error);
            this.jobList = [];
            this.service.message(
              'Failed to fetch jobs. Server error occurred.',
              'error'
            );
          },
        });
    } else {
      this.service
        .fetchInternalJobByName2(this.internalJob, this.page, this.row)
        .subscribe({
          next: (resp) => {
            if (resp && Array.isArray(resp)) {
              this.jobList = resp;
              this.sortByLatest(this.jobList);
            } else {
              console.warn('Invalid response format:', resp);
              this.jobList = [];
              this.service.message(
                'No jobs found or invalid data format',
                'warning'
              );
            }
          },
          error: (error) => {
            console.error('Error fetching internal jobs:', error);
            this.jobList = [];
            this.service.message(
              'Failed to fetch internal jobs. Server error occurred.',
              'error'
            );
          },
        });
    }
  }

  fetchJob(jobId: string, runtime: string, status) {
    try {
      let linenumber = 0;

      this.service
        .fetchSparkJob(jobId, linenumber, runtime, 50, status, false)
        .subscribe(
          (response) => {
            this.currentJob = JSON.parse(response);
            this.onChangeStatus(this.currentJob.status);
            if (
              this.currentJob.status !== 'STARTED' &&
              this.currentJob.status !== 'RUNNING'
            ) {
              clearInterval(this.timeInterval);
            }
          },
          (error) => {
            this.currentJob['status'] = 'ERROR';
            this.service.message('Job Status not fetched:' + error, 'error');
          }
        );
    } catch (Exception) {
      this.service.message('Some error occured', 'error');
    }
  }

  onChangeStatus(value) {
    this.statusChanged.emit(value);
  }
  fetchInternalJob(jobId: string, status) {
    try {
      let linenumber = 0;
      this.service.fetchInternalJob(jobId, linenumber, 50, status).subscribe(
        (response) => {
          this.currentJob = JSON.parse(response);
          this.onChangeStatus(this.currentJob.status);
          if (
            this.currentJob.status !== 'STARTED' &&
            this.currentJob.status !== 'RUNNING'
          ) {
            clearInterval(this.timeInterval);
          }
        },
        (error) => {
          this.currentJob['status'] = 'ERROR';
          this.service.message('Job Status not fetched:' + error, 'error');
        }
      );
    } catch (Exception) {
      this.service.message('Some error occured', 'error');
    }
  }
  showOutputArtifact(jobId: string) {
    let a = 1;
    this.service.fetchoutputArtifacts(jobId).subscribe((response) => {
      const dialogRef = this.dialog.open(ShowOutputArtifactsComponent, {
        height: '95%',
        width: '90%',
        disableClose: true,
        data: {
          isConsole: true,
          jobID: jobId,

          outputData: response,

          linenumber: 0,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {});
    });
  }

  showConsole(jobId: string, runtime: string, status, job) {
    if (this.internalJob) {
      let linenumber = 0;
      this.service.fetchInternalJob(jobId, linenumber, 50, status).subscribe(
        (response) => {
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
            this.datas = [];
            if (this.jobData) {
              for (var i in this.jobData) {
                let a = { name: i, value: this.jobData[i] };
                this.datas.push(a);
              }
            }
            this.logsdata = this.datas;
            this.openDialog(
              jobId,
              'internal jobs',
              this.currentJob.jobStatus,
              this.logsdata
            );
          }
        },
        (error) => {
          this.currentJob['status'] = 'ERROR';
          this.service.message('Could not get the results', 'error');
          clearInterval(this.timeInterval);
        }
      );
    } else {
      let linenumber = 0;
      this.service
        .fetchSparkJob(jobId, linenumber, runtime, 0, status, false)
        .subscribe(
          (response) => {
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
              this.datas = [];
              if (this.jobData) {
                for (var i in this.jobData) {
                  let a = { name: i, value: this.jobData[i] };
                  this.datas.push(a);
                }
              }
              this.logsdata = this.datas;
              this.openDialog(
                jobId,
                'pipeline',
                this.currentJob.jobStatus,
                this.logsdata
              );
            }
          },
          (error) => {
            this.currentJob['status'] = 'ERROR';
            this.service.message('Could not get the results', 'error');
            clearInterval(this.timeInterval);
          }
        );
    }
  }

  openDialog(jobid, jobtype, status, data) {
    const dialogRef = this.dialog.open(JobDataViewerComponent, {
      height: '95%',
      width: '90%',
      disableClose: true,
      data: {
        isConsole: true,
        content: this.jobData,
        isChain: false,
        jobid: jobid,
        jobtype: jobtype,
        status: status,
        linenumber: 0,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  stopJob(id) {
    this.service.stopPipeline(id).subscribe(
      (response) => {
        this.service.message('Stop Event Triggered!', 'success');
        console.log(response, 'stopjob response ');
        this.onRefresh();
      },
      (error) => {
        this.service.message('Error!', 'error');
      }
    );
  }
}
