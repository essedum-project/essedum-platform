import { Component, Input, OnInit } from '@angular/core';
import { JobsService } from '../../services/jobs.service';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { Subscription } from 'rxjs';
import { Services } from '../../services/service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-wk-schedule',
  templateUrl: './wk-schedule.component.html',
  styleUrls: ['./wk-schedule.component.scss']
})
export class WkScheduleComponent implements OnInit{
  
  @Input("wkJson") json;
  @Input() wkData;
  @Input() hide;
  wkJson: any;
  chain_list: any = [];
  options1: any = [];
  typeValue: string;
  selecteddate: string;
  selectedtime: any;
  runTypes: OptionsDTO[] = [];
  busy: Subscription;
  remoteDatasourceName: any;
  selectedRunType: OptionsDTO;
  runtypesCheck: boolean = true;
  isError: boolean = false;
  errorMessage = "";
  joboption;
  currentTime: any;
  zoneId;
  org;
  runtyperesp: any;
  runTypeResp: any;
  selectedjob: any;
  selecteddatetime: string;
  threshold: boolean = false;
  selectedThresholdtime;
  selectedThresholdType;
  
  constructor(
    private jobService: JobsService,
    private service: Services,
    private datepipe: DatePipe,
    ) { }

  ngOnInit() {
    this.formatAMPM()
    this.org = sessionStorage.getItem("organization");
    this.zoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (this.runtypesCheck == true)
    this.fetchRunTypes();
    this.getAllChains();
  }

  getLocalDate() {
    let tmpDateTime: Date = new Date(this.selecteddatetime);
    let tmp_date = tmpDateTime.getDate();
    let tmp_month = tmpDateTime.getMonth() + 1;
    let tmp_year = tmpDateTime.getFullYear();
    return "" + tmp_year + "-" + this.format(tmp_month.toString()) + "-" + this.format(tmp_date.toString());
  }

  getLocalTime() {
    let tmpDateTime: Date = new Date(this.selecteddatetime);
    let tmp_hr: String = tmpDateTime.getHours().toString();
    let tmp_min: String = tmpDateTime.getMinutes().toString();
    return "" + this.format(tmp_hr) + ":" + this.format(tmp_min);
  }

  createExpression() {  
      return ""
  }
  getThresholdTime() {
    if (this.threshold) {
      let thresholdtime = parseInt(this.selectedThresholdtime)
      switch (this.selectedThresholdType) {
        case "second":
          return thresholdtime
        case "minute":
          return thresholdtime * 60
        case "hour":
          return thresholdtime * 60 * 60
        default:
          return 0
      }
    } else {
      return 0
    }

  }

  formatTime(date, time) {
    const amPm = time.split(' ')[1];
    let t = time.split(' ')[0];
    let hours = Number(t.split(':')[0]);
    let minutes = t.split(':')[1];

    if (amPm === 'PM' && hours < 12) {
      hours += 12;
    } else if (amPm === 'AM' && hours === 12) {
      hours = 0;
    }
    if (hours == 0) {
      let final_time = "00:" + minutes
      date = date.split("T")[0]
      this.selecteddatetime = date + "T" + final_time

    } else if (hours > 0 && hours < 10) {
      let final_time = "0" + hours.toString() + ":" + minutes
      date = date.split("T")[0]
      this.selecteddatetime = date + "T" + final_time
    }
    else {
      let final_time = hours.toString() + ":" + minutes
      date = date.split("T")[0]
      this.selecteddatetime = date + "T" + final_time
    }
  }
  
  formatAMPM() {
    let date = new Date()
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'  minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    this.currentTime = strTime.toString();
  }
  getAllChains() {
    this.jobService.getChainJobsLen().subscribe(resp => {
      if (resp > 0) {
        this.jobService.getAllChainJobs(0, resp).subscribe(res => {
          res.forEach((ele) => {
            this.chain_list.push(ele);
            this.options1.push(ele.jobName);
          });
        });
      }
    });
  }

  panelOptionSelected($event) {
      this.typeValue = $event;
  }
  private format(value: String) {
    return (value.length > 1) ? value : "0" + value;
  }
  dateChanged(event: any) {
    let tmpDateTime: Date = new Date(event);
    let tmp_date = tmpDateTime.getDate();
    let tmp_month = tmpDateTime.getMonth() + 1;
    let tmp_year = tmpDateTime.getFullYear();
    console.log(
      tmp_year + "-" + this.format(tmp_month.toString()) + "-" + this.format(tmp_date.toString())
    )
    this.selecteddate = tmp_year + "-" + this.format(tmp_month.toString()) + "-" + this.format(tmp_date.toString());
  }
  timeChanged(event: any) {
    // this.currentTime=event
    this.selectedtime = event
  }
  fetchRunTypes() {
    this.runTypes = []
    this.busy = this.service.fetchJobRunTypes().subscribe(resp => {
      this.runTypeResp = resp;
      resp.forEach((ele) => {
        this.runTypes.push(new OptionsDTO(ele.type + "-" + ele.dsAlias, ele));
        if(ele.dsName == this.remoteDatasourceName){
          this.selectedRunType = new OptionsDTO(ele.type + "-" + ele.dsAlias, ele);
        }
      });
      let runtimeObj: Object = {
        dsAlias: "",
        dsName: "",
        type: "Local"
      }
      let localRuntime = runtimeObj as { dsAlias: string, dsName: string, type: string }
      this.runTypes.push(new OptionsDTO(localRuntime.type + "-" + localRuntime.dsAlias, localRuntime));
      if(this.remoteDatasourceName == null || this.remoteDatasourceName == undefined || this.remoteDatasourceName == ""){
        this.selectedRunType = new OptionsDTO(localRuntime.type + "-" + localRuntime.dsAlias, localRuntime);
      }
    })
    this.runtypesCheck = false
  }
  onRuntimeChange(runtimeValue) {
    this.selectedRunType.value = runtimeValue;
    this.selectedRunType.viewValue = runtimeValue.type + "-" + runtimeValue.dsAlias;
  }

  getJob(value) {
        return this.options1.filter(option => option == value);
  }

  validate(isNative) {
    this.isError = false
    this.errorMessage = ""
    let validjoboption = "Chain"
    if (validjoboption) {
      if (!this.selectedjob) { this.selectedjob = this.typeValue }
      let validjob = this.selectedjob && this.getJob(this.selectedjob).length == 1;
      if (validjob) {
        console.log(this.selectedtime)
        this.selecteddate = this.datepipe.transform(this.selecteddate, 'yyyy-MM-ddTHH:mm')
        this.formatTime(this.selecteddate, this.selectedtime)
        let datevalidation = new Date(this.selecteddatetime)
        let validdatetime = datevalidation instanceof Date && !isNaN(datevalidation.getTime()) && ((new Date()).getTime() < datevalidation.getTime());
        if (validdatetime) {
            this.scheduleChainJob()
        } else {
          this.isError = true
          this.errorMessage = "Invalid Datetime | Datetime should be after the current time"
        }
      }
      else {
        this.isError = true
        this.errorMessage = "Invalid Job"
      }
    } else {
      this.isError = true
      this.errorMessage = "Invalid Job Option"
    }
  }
  scheduleChainJob() {
    this.jobService.getChainJobByName(this.selectedjob).subscribe(res => {
      let localdate = this.getLocalDate();
      let localtime = this.getLocalTime();
      let expression = this.createExpression();
      let jobtimeout = this.getThresholdTime();
      let chainedJob = res;
      chainedJob.jsonContent.myDate = localdate;
      chainedJob.jsonContent.myTime = localtime;
      chainedJob.jsonContent.timeZone = this.zoneId;
      chainedJob.jsonContent.expression = expression;
      chainedJob.jsonContent.jobTimeout = jobtimeout;

      this.jobService.updateChainedJob2(chainedJob.jobName, chainedJob.jsonContent, chainedJob.jsonContent.element.elements, chainedJob.jsonContent.element.params).subscribe(() => {
        this.jobService.getChainByName(chainedJob.jobName).subscribe((res) => {
          let chainedJob = res

          this.jobService.runChainedJob3(chainedJob.jobName, chainedJob).subscribe(
            pageResponse => {
              this.service.message("Job Scheduled Successfully", "success");
            },
            error => {
              this.service.message("Error in Creating Job", "error");
            }
          );
        });
      })
    })
  }

}
