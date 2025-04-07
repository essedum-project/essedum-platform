import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ScheduleService } from '../../services/schedule.service';
import cRonstrue from "cronstrue";
// import { GroupsService } from '../../groups/groups.service';
import { IcipComService } from '../../services/icip-com.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Services } from '../../services/service';
// import { MessageService } from '../../services/message.service';
import { JobsService } from '../../services/jobs.service';
import { PipelinesummaryService } from '../../pipeline-summary/pipeline-summary.service';
import { MatDialog } from '@angular/material/dialog';
import { SchedulerComponent } from '../scheduler.component';
import { GroupsService } from '../../services/groups.service';
import { DashConstant } from 'com-lib-util';

@Component({
  selector: 'app-scheduler-list',
  templateUrl: './scheduler-list.component.html',
  styleUrls: ['./scheduler-list.component.scss']
})
export class SchedulerListComponent implements OnInit {

  jobsList: any = [];
  chainJobsList: any = [];
  scheduledJobsList: any[] = [];
  internaljobs: any[] = [];
  internaljobnames: any[] = [];
  hiddenlogs: any[] = [];
  chainedjobslist = {}; 
  pausedJobs: Boolean=true;

  rows = 15;
  page = 0;
  lastPage = 0;
  totalJobs = 0;

  chainedrows = 12;
  chainedpage = 0;
  chainedlastPage = 0;
  chainedtotalJobs = 0;

  scheduledrows = 12;
  scheduledpage = 0;
  scheduledlastPage = 0;
  scheduledtotalJobs = 0;


  originalPipeline: any = [];
  activeTab;
  isInEdit = false;
  isScheduledView = false;
  scheduledJobAlias = "";
  scheduleJobName = "";
  scheduleJobType = "";
  scheduleJobDateTime = "";
  scheduleJobExpression = "";
  scheduleJobDetails;
  isQuartzEnabled = true;
  schedulejob;
  scheduleJobRemoteDs: any;

  sortElement = {
    "alias": "NO",
    "submittedby": "NO",
    "submittedon": "NO",
    "finishtime": "NO",
    "jobstatus": "NO"
  }
  filterColumn = ""
  filterValue = ""
  filterDate = "1980-12-12"
  scheduledjobtimeout: any;

  jobs= ["Single Pipeline","Grouped Job","Internal Job"]
  searchText = ""
  organization: string;

  // pagination variable
  pageSize: number;
  pageNumber: number;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number = 0;
  prevRowsPerPageValue: number;
  itemsPerPage: number[] = [6, 12, 18, 24, 30]
  noOfItems: number;
  endIndex: number;
  startIndex: number;
  pageNumberChanged: boolean = true;
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();
  dashvalue: DashConstant = new DashConstant();

  constructor(
  
    private scheduledJobService: ScheduleService,
    private groupService: GroupsService,
    private jobService: JobsService,
    public icipComService: IcipComService,
    // private messageService: MessageService,
    public pipelinesummaryService: PipelinesummaryService,
    private router: Router,
    private route: ActivatedRoute,
    private service: Services,
    public dialog: MatDialog,
  ) {
    
  }

  // changeTabChild(id) {
  //   this.activeTab = id;
  //   switch (id) {
  //     case "chain": this.getChains(); break;
  //     case "scheduled": this.getSchedules(); break;
  //     case "logs": this.getLogs(); break;
  //     case "internal": this.fetchAllInternalJobs(); break;
  //   }
  // }

  ngOnInit() {
    this.getScheduledJobs()
    this.getConstant()
  }
  getScheduledJobs() {
    this.pageSize = this.itemsPerPage[0];
    this.pageNumber = 1;
    if (this.pageNumberChanged) {
      this.pageNumber = 1;
      this.startIndex = 0;
      this.endIndex = 5;
    }
    // this.scheduledpage = 0;
    // this.scheduledlastPage = 0;
    this.scheduledJobService.getScheduledJobs("").subscribe(
      (res) => {
        res.forEach(job => {
          job.repeattypestmt = job.repeattype != undefined && job.repeattype != null && job.repeattype.trim() != "" ? cRonstrue.toString(job.repeattype) : "No Repeat"
        })
        this.scheduledJobsList = res;
        this.noOfItems = res.length
        this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
        this.pageArr = [...Array(this.noOfPages).keys()];
        this.pausedJobs = this.scheduledJobsList.length>0 ? true : false;
        this.scheduledJobsList.forEach(job =>{
          if(job.quartzProperties.status!='PAUSED') {
            this.pausedJobs=false;
          }
          if(job.scheduleType == 'chain')job.scheduleType = 'group'
        })
      },
      (error) => { }
    );
  }

  getConstant() {
    this.service.getDashConstantByKey("icip.scheduler.pause.status","Core").subscribe((response) => {
      this.dashvalue = JSON.parse(response);
      if(this.dashvalue.value != this.pausedJobs.toString()) {
        this.dashvalue.value = this.pausedJobs.toString();
        this.service.updateDashConstant(this.dashvalue).subscribe((response) => {
        });
      }
    });
  }

  getAlias(job) {
    return job.alias ? job.alias : job.cname
  }

  navigateToPipeline(entity, runtime) {
    let bcEntity = entity
    if (!entity.alias && entity.includes(";")) {
      bcEntity = { name: entity.split(";")[0], alias: entity.split(";")[1] }
      entity = entity.split(";")[0]
    }
    else if (typeof (entity) == 'string')
      bcEntity = { name: entity, alias: entity }

    if (runtime != 'INTERNAL') {
      if (runtime != 'AGENTS') {
        this.groupService.getSingleGroupByOrgAndEntity(entity.cname ? entity.cname : entity).subscribe(
          (response) => {
            if (response != undefined && response != null) {
              let bc1 = { item: response, parent: true }
              this.icipComService.pushBreadCrumb(bc1)
              let bc2 = { item: bcEntity, parent: false }
              this.icipComService.pushBreadCrumb(bc2)
              // this.router.navigate(["../pipelines/", response.name, entity.cname ? entity.cname : entity], { relativeTo: this.route }); 
              this.service.getStreamingServicesByName(entity.cname, response.organization).subscribe((res) => {
                
              const navigationExtras: NavigationExtras = {
                state: {
                 cardTitle: 'Pipeline',
                 pipelineAlias: res.alias,
                 streamItem: res,
                  card: res,
                },
                relativeTo: this.route,
              }
              if (response.type === 'NativeScript'){
                this.router.navigate(['../pipelines/view'+'/'+res.name],navigationExtras);
              }else{
                this.router.navigate(['../pipelines/view/drgndrp'+'/'+res.name], navigationExtras);
              } })    
            }
            else {
              this.editChainJob(entity.cname);
            }
          },
          (error) => { }
        );
      }
      else {
          this.groupService.getSingleGroupByOrgAndEntityForAgent(entity.name ? entity.name : entity).subscribe(
          (response) => {
            if (response != undefined && response != null) {
              let bc1 = { item: response, parent: true }
              this.icipComService.pushBreadCrumb(bc1)
              let bc2 = { item: bcEntity, parent: false }
              this.icipComService.pushBreadCrumb(bc2)
              this.router.navigate(["../agents/", response.name, entity.cname], { relativeTo: this.route });
            }
            else {
              this.editChainJob(entity.cname);
            }
          },
          (error) => { }
        );
      }
    } else {
      this.router.navigate(["../jobs/internal"], { relativeTo: this.route });
    }
  }

  editChainJob(name) {
    this.router.navigate(["../jobs", name], { relativeTo: this.route });
  }

  displayEditForm(pipeline, jobname, jobgroup, datetime, exp,jobtimeout, remoteDatasourceName, scheduleType) {
    let jobType = "";
    let splits = pipeline.split(";");
    let cname = splits[0];
    jobType = scheduleType;
    this.scheduleJobDetails = jobname
        this.scheduleJobName = cname
        this.scheduleJobType = jobType
        this.scheduleJobDateTime = datetime
        this.scheduleJobExpression = exp
        this.scheduledJobAlias = this.displayFn(cname);
        this.isInEdit = true
        this.isScheduledView = true
        this.scheduledjobtimeout=jobtimeout
        this.schedulejob = jobType
        this.scheduleJobRemoteDs = remoteDatasourceName

        const dialogRef = this.dialog.open(SchedulerComponent, {
          height: '90%',
          width: '60%',
          disableClose: true,
          data: {
            jobtype: this.scheduleJobType,
            joboption: this.schedulejob,
            isInEdit: this.isInEdit,
            jobname: this.scheduleJobName,
            jobdatetime: this.scheduleJobDateTime,
            jobexpression: this.scheduleJobExpression,
            jobid: this.scheduleJobDetails,
            jobalias: this.scheduledJobAlias,
            jobtimeout: this.scheduledjobtimeout,
            jobremotedatasource: this.scheduleJobRemoteDs
          },
        });
        dialogRef.afterClosed().subscribe(result => {
          this.onRefresh();
        });


    // this.groupService.getSingleGroupByOrgAndEntity(cname).subscribe(
    //   (response) => {
    //     if (response != undefined && response != null) {
    //       jobType = "pipeline";
    //     } else {
    //       jobType = splits[1] == "INTERNAL" ? "internal" : "chain";
    //     }
    //   },
    //   (error) => { },
    //   () => {
    //     this.scheduleJobDetails = jobname
    //     this.scheduleJobName = cname
    //     this.scheduleJobType = jobType
    //     this.scheduleJobDateTime = datetime
    //     this.scheduleJobExpression = exp
    //     this.scheduledJobAlias = this.displayFn(cname);
    //     this.isInEdit = true
    //     this.isScheduledView = true
    //     this.scheduledjobtimeout=jobtimeout
    //     this.schedulejob = jobType
    //     this.scheduleJobRemoteDs = remoteDatasourceName

    //     const dialogRef = this.dialog.open(SchedulerComponent, {
    //       height: '90%',
    //       width: '60%',
    //       disableClose: true,
    //       data: {
    //         jobtype: this.scheduleJobType,
    //         joboption: this.schedulejob,
    //         isInEdit: this.isInEdit,
    //         jobname: this.scheduleJobName,
    //         jobdatetime: this.scheduleJobDateTime,
    //         jobexpression: this.scheduleJobExpression,
    //         jobid: this.scheduleJobDetails,
    //         jobalias: this.scheduledJobAlias,
    //         jobtimeout: this.scheduledjobtimeout,
    //         jobremotedatasource: this.scheduleJobRemoteDs
    //       },
    //     });
        
    //   }
    // );
    
  }

  displayFn(name) {
    if (name) {
      let filteredarray = this.originalPipeline.filter(option => option.name.toLowerCase() == name.toLowerCase())
      let alias;
      if (filteredarray && filteredarray.length > 0) {
        alias = filteredarray[0]["alias"]
      }
      return alias ? alias : name
    }
    return name;
  }

  pause(jobName: any, jobGroup: any, flag: boolean) {
    this.scheduledJobService.pauseJob(jobName, jobGroup, flag).subscribe(
      (pageResponse) => {
        this.service.message(flag ? "Paused!" : "Resumed!", "success");
        this.onRefresh();
      },
      (error) => {
        this.service.message("Could not get the results", "error");
      }
    );
  }

  onRefresh() {
    this.getScheduledJobs()
  }

  getChains() {
    this.jobService.getChainJobsLen().subscribe((res) => {
      const n = res;
      this.chainedtotalJobs = n.valueOf();
      const remainder = this.chainedtotalJobs % this.chainedrows;
      const cof = (this.chainedtotalJobs - remainder) / this.chainedrows;
      if (remainder !== 0) {
        this.chainedlastPage = cof;
      } else {
        this.chainedlastPage = cof - 1;
      }
      if (this.chainedtotalJobs !== 0) {
        this.getChainJobs("First");
      } else {
        this.chainedpage = 0;
        this.chainedlastPage = 0;
        this.chainJobsList = []
      }
    });
  }

  getChainJobs(choice: string) {
    switch (choice) {
      case "Next":
        this.chainedpage += 1;
        break;
      case "Prev":
        this.chainedpage -= 1;
        break;
      case "First":
        this.chainedpage = 0;
        break;
      case "Last":
        this.chainedpage = this.chainedlastPage;
        break;
    }
    this.jobService.getAllChainJobs(this.chainedpage, this.chainedrows).subscribe((res) => {
      this.chainJobsList = res;
    });
  }

  getSchedules() {
   
    this.getScheduledJobs();
    
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
      if (this.totalJobs !== 0) {
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

  getJobs(choice: string) {
    switch (choice) {
      case "Next":
        this.page += 1;
        break;
      case "Prev":
        this.page -= 1;
        break;
      case "First":
        this.page = 0;
        break;
      case "Last":
        this.page = this.lastPage;
        break;
    }

    this.jobService.getCommonJobs(this.page, this.rows, this.getFilterColumn(), this.getFilterColumnValue(), this.getFilterDate(), this.getSortedColumn(), this.getDirection()).subscribe((res) => {
      this.jobsList = res;
      this.initializeChainedJobs();
    });
  }

  initializeChainedJobs() {
    this.jobsList.forEach(element => {
      if (element.jobtype == 'group') {
        this.panelOpen(element)
      }
    });
  }

  panelOpen(job) {
    this.jobService.getIndvLog(job.jobid).subscribe(
      (response) => {
        let array = [];
        this.pipelinesummaryService.findByCoreid(response.correlationid).subscribe(res => {
          res.forEach(element => {
            let tmp = {};
            tmp["jobid"] = element.jobId;
            tmp["alias"] = element.streamingService
            tmp["submittedby"] = element.submittedBy;
            tmp["submittedon"] = element.submittedOn;
            tmp["jobstatus"] = element.jobStatus;
            tmp["runtime"] = element.runtime;
            tmp["jobtype"] = "pipeline";
            tmp["finishtime"] = element.finishtime;
            tmp["jobmetadata"] = element.jobmetadata
            tmp["type"] = element.type.toLowerCase();
            if((JSON.parse(element.jobmetadata).tag=="CHAIN" && !JSON.parse(element.jobmetadata).name) || JSON.parse(element.jobmetadata).name == job.alias)
              array.push(tmp);
          });
        }, err => { }, () => {
          this.chainedjobslist[job.jobid] = array;
        })
      }
    );
  }

  fetchAllInternalJobs() {
    this.jobService.getAllInternalJobs().subscribe(resp => {
      this.internaljobs = resp;
      this.internaljobnames = [];
      this.internaljobs.forEach(internaljob => {
        this.internaljobnames.push(internaljob.name)
      })
    },
      (err) => {
        this.service.message("Error!"+err._body, "error" );
      }
    );
  }

  delete(jobName, jobGroup) {
    if (confirm("Are you sure?")) {
      this.deleteJob(jobName, jobGroup);
    }
  }

  deleteJob(jobName: any, jobGroup: any) {
    this.scheduledJobService.deleteJob(jobName, jobGroup).subscribe(
      (pageResponse) => {
        this.service.message("Deleted!", "success");
        this.onRefresh();
      },
      (error) => {
        this.service.message("Could not get the results", "error");
      }
    );
  }

  addjob(job:any, jobType:any) {
        this.schedulejob = job
        this.scheduleJobType = jobType
        
          const dialogRef = this.dialog.open(SchedulerComponent, {
            height: '90%',
            width: '60%',
            disableClose: true,
            data: {
              jobtype: this.scheduleJobType,
              joboption: this.schedulejob,
              createjob: true,
              
            }
          });
  }

  selectChange(value: string): void {
    if(value=="Single Pipeline")
      this.addjob("Pipeline", "pipeline")
    if(value=="Grouped Job")
      this.addjob("Group", "group")
    if(value=="Internal Job")
      this.addjob("Internal", "internal")
  }

  onSearch() {
    this.pageSize = this.itemsPerPage[0];
    this.pageNumber = 1;
    if (this.pageNumberChanged) {
      this.pageNumber = 1;
      this.startIndex = 0;
      this.endIndex = 5;
    }
    // this.scheduledpage = 0;
    // this.scheduledlastPage = 0;
    this.scheduledJobService.getScheduledJobs(this.searchText).subscribe(
      (res) => {
        res.forEach(job => {
          job.repeattypestmt = job.repeattype != undefined && job.repeattype != null && job.repeattype.trim() != "" ? cRonstrue.toString(job.repeattype) : "No Repeat"
        })
        this.scheduledJobsList = res;
        this.noOfItems = res.length
        this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
        this.pageArr = [...Array(this.noOfPages).keys()];
        this.pausedJobs=true;
        this.scheduledJobsList.forEach(job =>{
          if(job.quartzProperties.status!='PAUSED') {
            this.pausedJobs=false;
        
          }
        })
      },
      (error) => { }
    );
  }

  pauseAll(flag: boolean) {
    let org=sessionStorage.getItem('organization')
    
    this.scheduledJobService.pauseAllJob(org, flag).subscribe(
      (pageResponse) => {
        this.service.message(flag ? "Paused!" : "Resumed!", "success");
        this.pausedJobs=flag;
        this.dashvalue.value = flag.toString();
        this.service.updateDashConstant(this.dashvalue).subscribe((response) => {
          this.onRefresh();
        });
      },
      (error) => {
        this.service.message("Could not get the results", "error");
      }
    );
  }
  
   // for pagination
   nextPage() {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      this.changePage();
    }
  }

  prevPage() {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      this.changePage();
    }
  }

  changePage(page?: number) {
    if (page && page >= 1 && page <= this.noOfPages) this.pageNumber = page;
    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      this.pageChanged.emit(this.pageNumber);
      if (this.pageNumber > 5) {
        this.endIndex = this.pageNumber;
        this.startIndex = this.endIndex - 5;
      } else {
        this.startIndex = 0;
        this.endIndex = 5;
      }
    }
  }

  optionChange(event: Event) {
    let i: number = event.target['selectedIndex'];
    this.pageSize = this.itemsPerPage[i];
    this.pageNumber = 1;
    this.ngOnInit()
  }

  selectedButton(i) {
    if (i == this.pageNumber) {
      return { "color": "white", "background": "#7b39b1" }
    }
    else
      return { "color": "black" }
  }

}
