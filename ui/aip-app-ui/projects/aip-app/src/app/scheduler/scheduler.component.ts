import { Component, OnInit, OnChanges, Input, Inject, Output, EventEmitter, ChangeDetectionStrategy, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common'
//import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
// import { MessageService } from '../../sharedModule/service/message.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatRadioChange } from '@angular/material/radio';
// import { StreamingServicesService } from '../../entities/streaming-services/streaming-services.service';
// import { JobsService } from '../../entities/jobs/jobs.service';
// import { ScheduleService } from '../../entities/schedule-services/schedule.service';
import cRonstrue from "cronstrue";
import { Subscription } from 'rxjs';
import { Services } from '../services/service';
import { ScheduleService } from '../services/schedule.service';
import { JobsService } from '../services/jobs.service';
import { PipelinesummaryService } from '../pipeline-summary/pipeline-summary.service';
import { OptionsDTO } from '../DTO/OptionsDTO';
// import { PipelinesummaryService } from '../../entities/pipeline-summary/pipeline-summary.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Location } from "@angular/common";
import { OpenTelemetryService } from 'com-lib-util';

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SchedulerComponent implements OnInit {

  busy: Subscription;
  joboption;
  jobname;
  jobalias;
  jobtype;
  jobdatetime;
  jobexpression;
  jobid;
  isInEdit: boolean;
  isView: boolean;
  jobtimeout: number;
  @Output() isViewChange = new EventEmitter();


  yearNumbers = Array.from({ length: 200 }, (_, index) => index + 1900);
  wholeNumbers = Array.from({ length: 60 }, (_, index) => index);
  naturalNumbers = Array.from({ length: 59 }, (_, index) => index + 1);
  days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  // joboptions = [
  //   { "label": "Single Pipeline", "value": "pipeline" },
  //   { "label": "Chain Job", "value": "chain" },
  //   { "label": "Internal Job", "value": "internal" }
  // ]
  repeatOptions = [
    { "label": "Secondly", "value": "second" },
    { "label": "Minutely", "value": "minute" },
    { "label": "Hourly", "value": "hour" },
    { "label": "Daily", "value": "day" },
    { "label": "Weekly", "value": "week" },
    { "label": "Monthly", "value": "month" },
    { "label": "Yearly", "value": "year" },
    { "label": "Custom ", "value": "custom" }
  ]
  myControl = new FormControl();
  options: any[] = [];
  filteredOptions: Observable<string[]>;

  repeatEveryOptions = []
  //startAtOptions = []
  activedaylist = []
  repeat: boolean = false;
  isError: boolean = false;
  errorMessage = "";
  selectedJobOption;
  selecteddatetime;
  selectedtime;
  selectedRepeat;
  selectedRepeatEvery;
  //n;
  selectedjob;
  selectedAlias;
  zoneId;
  org;
  alias;
  repminute = [1, 2, 3, 4, 5, 6, 10, 15, 20, 30];
  rephour = [1, 2, 3, 4, 6, 8, 12];
  repday = [1, 2, 3, 5, 6, 15, 30];
  repmonth = [1, 2, 3, 4, 6];
  cronvalue;
  custom = false;
  customexp: string;
  customerror = false;
  customerrormsg;
  customsuccess = false;
  cronvalidated = false;

  threshold: boolean = false;
  selectedThresholdType;
  selectedThresholdtime;
  thresholdOptions = [
    { "label": "Secondly", "value": "second" },
    { "label": "Minutely", "value": "minute" },
    { "label": "Hourly", "value": "hour" }
  ]
  thresholdvalues: number[];
  runTypes: OptionsDTO[] = [];
  selectedRunType: any = {};
  pipelines_alias: any = [];
  pipelines_list: any = [];
  scheduledDate = new Date();
  currentTime: any;
  currentDate = new Date();
  runtypesCheck: boolean = true;
  typeValue: string;
  plist_available: boolean = false;
  chain_list: any = [];
  internal_name_list: any = [];
  selecteddate: string;
  options1: any = [];
  options2: any = [];
  remoteDatasourceName: any;
  runtimeObj: Object = { dsAlias: "", dsName: "", type: "Local" }
  localRuntime = this.runtimeObj as { dsAlias: string, dsName: string, type: string }
  defaultRunType = new OptionsDTO(this.localRuntime.type + "-" + this.localRuntime.dsAlias, this.localRuntime)

  constructor(
    private service: Services,
    private telemetry: OpenTelemetryService,
    private jobService: JobsService,
    private scheduleService: ScheduleService,
    private datepipe: DatePipe,
    private pipelinesummaryService: PipelinesummaryService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SchedulerComponent>,
    private location: Location,
  ) {
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

  telemetryCall(){
    this.telemetry.startTelemetry('aip-app','SchedulerComponent', sessionStorage.getItem('organization'));
  }

  ngOnInit() {
    // let es=new Date()
    // this.currentTime=es.getHours().toString() +":"+es.getMinutes().toString()
    // console.log(this.currentTime);
    this.telemetryCall();
    this.formatAMPM()
    this.isInEdit = this.data.isInEdit
    this.joboption = this.data.joboption
    this.jobname = this.data.jobname
    this.jobalias = this.data.jobalias
    this.jobtype = this.data.jobtype
    this.jobdatetime = this.data.jobdatetime
    this.jobexpression = this.data.jobexpression
    this.jobid = this.data.jobid
    this.isView = this.data.isview
    this.jobtimeout = this.data.jobtimeout
    this.remoteDatasourceName = this.data.jobremotedatasource
    if (this.remoteDatasourceName != null && this.remoteDatasourceName != undefined && this.remoteDatasourceName != "") {
      if (this.jobtype == 'group') {
        let run = JSON.parse(this.remoteDatasourceName)[(Object.keys(JSON.parse(this.remoteDatasourceName))[0])];
        this.selectedRunType = new OptionsDTO(run, run)
        this.runTypes.push(this.selectedRunType)
      }
      else {
        this.selectedRunType = new OptionsDTO(this.remoteDatasourceName, this.remoteDatasourceName)
        this.runTypes.push(this.selectedRunType)
      }
    }

    if (this.data && this.data.createjob) {
      this.selectedJobOption = this.data.jobtype
      this.joboption = this.data.joboption
      this.jobtype = this.data.jobtype
    }
    this.org = sessionStorage.getItem("organization");
    this.zoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // this._addFilter();
    // this.getAllPipelines();
    // this.getAllChains();
    // this.getAllInternals();
    if (this.data && this.data.isInEdit) {
      if (this.data.joboption != null)
        this.selectedJobOption = this.data.joboption
      else this.selectedJobOption = this.data.jobtype
      this.selectedjob = this.data.jobname
      this.alias = this.data.jobalias ? this.data.jobalias : this.data.jobname
      this.selecteddatetime = this.datepipe.transform(this.data.jobdatetime, 'yyyy-MM-ddTHH:mm')
      this.getDateTime(this.selecteddatetime);
      this.repeat = this.data.jobexpression != undefined && this.data.jobexpression != null && this.data.jobexpression.trim() != ""
      this.threshold = this.data.jobtimeout > 0 ? true : false;
      if (this.threshold) {
        this.decodeThreshold()
      }
      if (this.repeat) {
        this.decodeExpression(this.data.jobexpression)
      }
      this.resetDropDown(this.selectedJobOption)
    } else {

      this.selectedJobOption = this.data.jobtype
      this.resetDropDown(this.data.jobtype)
    }
    if (this.runtypesCheck == true)
      this.fetchRunTypes()
  }

  getDateTime(selecteddatetime: string) {
    const [date, time] = selecteddatetime.split("T");
    this.selecteddate = date;
    this.selectedtime = time;
  }

  dateChanged(event: any) {
    let tmpDateTime: Date = new Date(event);
    let tmp_date = tmpDateTime.getDate();
    let tmp_month = tmpDateTime.getMonth() + 1;
    let tmp_year = tmpDateTime.getFullYear();
    this.selecteddate = tmp_year + "-" + this.format(tmp_month.toString()) + "-" + this.format(tmp_date.toString());
  }
  timeChanged(event: any) {
    // this.currentTime=event
    this.selectedtime = event
  }

  fetchRunTypes() {
    this.service.fetchJobRunTypes().subscribe(resp => {
      if (resp) {
        this.runTypes = [];
        this.runTypes.push(this.defaultRunType)
        if (this.remoteDatasourceName == null || this.remoteDatasourceName == undefined || this.remoteDatasourceName == "") {
          this.selectedRunType = this.defaultRunType;
        }
        resp.forEach((ele) => {
          this.runTypes.push(new OptionsDTO(ele.type + "-" + ele.dsAlias, ele));
          let run;
          if (this.jobtype == 'group' && this.remoteDatasourceName != null && this.remoteDatasourceName != undefined && this.remoteDatasourceName != "") {
            run = JSON.parse(this.remoteDatasourceName)[(Object.keys(JSON.parse(this.remoteDatasourceName))[0])];
            let viewrun = ele.type + '-' + ele.dsAlias
            if (run == viewrun) {
              this.selectedRunType = new OptionsDTO(run, ele);
            }
          }
          if (ele.dsName == this.remoteDatasourceName?.toUpperCase() && this.jobtype != 'group') {
            this.selectedRunType = new OptionsDTO(ele.type + "-" + ele.dsAlias, ele);
          }
        });
      }
    })
    this.runtypesCheck = false
  }

  decodeThreshold() {
    this.selectThreshold()
    if (this.jobtimeout > 0 && this.jobtimeout <= 60) {
      this.selectedThresholdType = 'second'
      this.selectedThresholdtime = Number(this.jobtimeout)
    } else
      if (this.jobtimeout > 60 && this.jobtimeout < 3600) {
        this.selectedThresholdType = 'minute'
        this.selectedThresholdtime = Number(this.jobtimeout / 60)
      } else
        if (this.jobtimeout >= 3600) {
          this.selectedThresholdType = 'hour'
          this.selectedThresholdtime = Number(this.jobtimeout / 3600)
        }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.ngOnInit();

  }

  resetDropDown(value) {
    if (value === 'pipeline') {
      this.getAllPipelines();
    } else {
      if (value === 'group') {
        this.getAllChains();
      } else {
        this.getAllInternals();
      }
    }
  }

  private _filter(value: any): any[] {
    this.selectedjob = this.getValueFromFilteredOptions(value)
    const filterValue = value
    if (this.selectedJobOption === 'internal') {
      return this.options2.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
    } else {
      if (this.selectedJobOption === 'group') {
        return this.options1.filter(option => option.jobName.toLowerCase().indexOf(filterValue) === 0);
      } else {
        if (this.selectedJobOption === 'pipeline') {
          return this.options.filter(option => option.alias.toLowerCase().indexOf(filterValue) === 0);
        } else {
          return this.options.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
        }
      }
    }
  }

  private _addFilter() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  displayFn(option) {
    this.selectedAlias = this.getAliasFromFilteredOptions(option)
    return this.selectedAlias
  }

  getValueFromFilteredOptions(option): any {
    return this.selectedJobOption === 'pipeline' || this.selectedJobOption === 'internal' ? option : this.selectedJobOption === 'group' ? option.jobName : option
  }

  getAliasFromFilteredOptions(option): any {
    return this.selectedJobOption === 'internal' ? option.name : this.selectedJobOption === 'group' ? option.jobName : this.selectedJobOption === 'pipeline' ? option.alias ? option.alias : option.name : option
  }

  radioChange($event: MatRadioChange) {
    if (!this.isInEdit) {
      this.resetDropDown($event.value)
    } else {
      this.service.message("Cannot change job type in Edit Mode", "error")
    }
  }

  getAllPipelines() {
    // this.service.getPipelineNames(sessionStorage.getItem('organization')).subscribe((res) => {
    this.options = []
    this.service.getAllStreamingServicesByOrg().subscribe((res) => {
      res.body.forEach((ele) => {
        // this.pipelines_alias.push(ele.alias)
        this.options.push(ele.alias)
        this.pipelines_list.push(ele);
      });
      if (this.jobtype === 'pipeline' && this.typeValue) {
        let index = this.pipelines_list.findIndex(option => option.name === this.typeValue || option.alias === this.typeValue);
        this.typeValue = this.pipelines_list[index]?.alias.toString();
      }
      this.plist_available = true
      this._addFilter()
    });
  }

  getAllChains() {
    this.jobService.getChainJobsLen().subscribe(resp => {
      if (resp > 0) {
        this.jobService.getAllChainJobs(0, resp).subscribe(res => {
          res.forEach((ele) => {
            this.chain_list.push(ele);
            this.options1.push(ele.jobName);
          });
          if (this.jobtype === 'group' && this.typeValue) {
            // let index = this.chain_list.findIndex(option => option === this.typeValue);
            // this.typeValue = this.chain_list[index]?.toString();
            let index = this.options1.findIndex(option => option === this.typeValue);
            this.typeValue = this.options1[index]?.toString();
          }
        });
      }
      this._addFilter()
    });
  }

  getAllInternals() {
    this.jobService.getAllInternalJobs().subscribe(resp => {
      resp.forEach((ele) => {
        this.internal_name_list.push(ele)
        this.options2.push(ele.name)
      });
      if (this.jobtype === 'internal' && this.typeValue) {
        // let index = this.internal_name_list.findIndex(option => option === this.typeValue);
        // this.typeValue = this.internal_name_list[index]?.toString();
        let index = this.options2.findIndex(option => option === this.typeValue);
        this.typeValue = this.options2[index]?.toString();
      }
      this._addFilter()
    });

  }

  selectChange() {
    this.thresholdOptions = [
      { "label": "Secondly", "value": "second" },
      { "label": "Minutely", "value": "minute" },
      { "label": "Hourly", "value": "hour" }
    ]
    switch (this.selectedRepeat) {
      case "second":
        this.custom = false;
        this.repeatEveryOptions = this.naturalNumbers
        // this.startAtOptions = this.wholeNumbers
        this.thresholdOptions = [
          { "label": "Secondly", "value": "second" }
        ]
        break;
      case "minute":
        this.custom = false;
        this.repeatEveryOptions = this.repminute
        //this.startAtOptions = this.wholeNumbers
        this.thresholdOptions = [
          { "label": "Secondly", "value": "second" },
          { "label": "Minutely", "value": "minute" }
        ]
        break;
      case "hour":
        this.custom = false;
        this.repeatEveryOptions = this.rephour
        // this.startAtOptions = this.wholeNumbers.filter(number => number < 24)
        this.thresholdOptions = [
          { "label": "Secondly", "value": "second" },
          { "label": "Minutely", "value": "minute" },
          { "label": "Hourly", "value": "hour" }
        ]
        break;
      case "day":
        this.custom = false;
        this.repeatEveryOptions = this.repday
        // this.startAtOptions = this.naturalNumbers.filter(number => number < 31)
        break;
      case "month":
        this.custom = false;
        this.repeatEveryOptions = this.repmonth
        //this.startAtOptions = this.naturalNumbers.filter(number => number < 12)
        break;
      case "year":
        this.custom = false;
        this.repeatEveryOptions = this.naturalNumbers
        //this.startAtOptions = this.yearNumbers
        break;
      case "custom":
        this.customerrormsg = "";
        this.customsuccess = false;
        this.cronvalidated = false;
        this.custom = true;

        break;
      default:
        this.custom = false;
        this.repeatEveryOptions = []
        // this.startAtOptions = []
        // this.thresholdvalues=[]
        // this.selectedThresholdtime=undefined
        this.selectedThresholdType = 'second'
        this.selectThreshold();
    }
  }
  selectThreshold() {
    switch (this.selectedThresholdType) {
      case "second":
        this.custom = false;
        this.thresholdvalues = this.naturalNumbers
        break;
      case "minute":
        this.custom = false;
        this.thresholdvalues = this.naturalNumbers
        break;
      case "hour":
        this.custom = false;
        this.thresholdvalues = this.rephour
        break;
      case "day":
        this.custom = false;
        this.thresholdvalues = this.repday
        break;
      default:
        this.custom = false;
        this.thresholdvalues = []
        this.thresholdOptions = [
          { "label": "Secondly", "value": "second" },
          { "label": "Minutely", "value": "minute" },
          { "label": "Hourly", "value": "hour" }
        ]
      // this.startAtOptions = []
    }
    if (this.repeat && this.selectedRepeatEvery && this.selectedRepeat) {
      if (this.selectedRepeat == 'second') {
        if (this.selectedThresholdType == 'second') this.thresholdvalues = this.thresholdvalues.filter(num => num < this.selectedRepeatEvery)
      }
      else if (this.selectedRepeat == 'minute') {
        if (this.selectedThresholdType == 'minute') this.thresholdvalues = this.thresholdvalues.filter(num => num < this.selectedRepeatEvery)
      }
      else if (this.selectedRepeat == 'hour') {
        if (this.selectedThresholdType == 'hour') this.thresholdvalues = this.thresholdvalues.filter(num => num < this.selectedRepeatEvery)

      }
    }
  }
  repeatCheck(isrepeat: any) {
    this.repeat = isrepeat
    if (!isrepeat) {
      this.thresholdOptions = [
        { "label": "Secondly", "value": "second" },
        { "label": "Minutely", "value": "minute" },
        { "label": "Hourly", "value": "hour" }
      ]
    }
  }
  thresholdcheck(isTimeout: any) {
    this.threshold = isTimeout
    if (!this.threshold) {
      this.thresholdOptions = []
      this.thresholdvalues = []
    } else {
      if (this.repeat) {
        this.selectChange();

      }
      else
        this.thresholdOptions = [
          { "label": "Secondly", "value": "second" },
          { "label": "Minutely", "value": "minute" },
          { "label": "Hourly", "value": "hour" }
        ]

    }
  }


  isRepeatEveryOptionValid(): boolean {
    return (this.selectedRepeat != "week")
  }

  decodeExpression(expression) {
    let elements = expression.split(" ");
    if (elements[5] != "?") {
      this.selectedRepeat = "week"
      this.decodeExpressionChild(elements, 5);
    } else {
      if (elements[6] != "*") {
        this.selectedRepeat = "year"
        this.decodeExpressionChild(elements, 6);
      } else {
        if (elements[4] != "*") {
          this.selectedRepeat = "month"
          this.decodeExpressionChild(elements, 4);
        } else {
          if (elements[3] != "*") {
            this.selectedRepeat = "day"
            this.decodeExpressionChild(elements, 3);
          } else {
            if (elements[2] != "*") {
              this.selectedRepeat = "hour"
              this.decodeExpressionChild(elements, 2);
            } else {
              if (elements[1] != "*") {
                this.selectedRepeat = "minute"
                this.decodeExpressionChild(elements, 1);
              } else {
                if (elements[0] != "*") {
                  this.selectedRepeat = "second"
                  this.decodeExpressionChild(elements, 0);
                } else {
                  this.selectedRepeat = "second"
                  this.selectedRepeatEvery = 1;
                }
              }
            }
          }
        }
      }
    }
  }

  decodeExpressionChild(elements, index) {
    this.selectChange()
    if (index == 5) {
      let attr = elements[index].split(',')
      attr.forEach(element => {
        this.activedaylist.push(element)
      });
    } else {
      let attr = elements[index].split('/')
      if (attr.length > 1) {
        this.selectedRepeatEvery = Number(attr[1])
      } else {
        this.selectedRepeatEvery = 1
      }
    }
  }

  buttonClick(day) {
    if (this.activedaylist.indexOf(day) >= 0) {
      this.activedaylist = this.arrayRemove(this.activedaylist, day)
    } else {
      this.activedaylist.push(day)
    }
  }

  private format(value: String) {
    return (value.length > 1) ? value : "0" + value;
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
    if (this.repeat) {
      let tmpDateTime: Date = new Date(this.selecteddatetime);
      let tmp_hr: String = tmpDateTime.getHours().toString();
      let tmp_min: String = tmpDateTime.getMinutes().toString();
      let tmp_date = tmpDateTime.getDate();
      let tmp_month = tmpDateTime.getMonth() + 1;
      let tmp_year = tmpDateTime.getFullYear();
      let startmin: number = tmpDateTime.getMinutes();
      let starthour: number = tmpDateTime.getHours();
      let startdate: number = tmpDateTime.getDate();
      let startmonth: number = tmpDateTime.getMonth() + 1;
      let startyear: number = tmpDateTime.getFullYear();
      switch (this.selectedRepeat) {
        case "second":
          return "0" + "/" + this.selectedRepeatEvery + " * * * * ? *"
        case "minute":
          return "00 " + ((startmin) % this.selectedRepeatEvery) + "/" + this.selectedRepeatEvery + " * * * ? *"
        case "hour":
          return "00 " + tmp_min + " " + ((starthour) % this.selectedRepeatEvery) + "/" + this.selectedRepeatEvery + " * * ? *"
        case "day":
          return "00 " + tmp_min + " " + tmp_hr + " " + (((startdate - 1) % this.selectedRepeatEvery) + 1) + "/" + this.selectedRepeatEvery + " * ? *"
        case "month":
          return "00 " + tmp_min + " " + tmp_hr + " " + tmp_date + " " + (((startmonth - 1) % this.selectedRepeatEvery) + 1) + "/" + this.selectedRepeatEvery + " ? *"
        case "year":
          return "00 " + tmp_min + " " + tmp_hr + " " + tmp_date + " " + tmp_month + " " + "? " + ((startyear % this.selectedRepeatEvery) + 1900) + "/" + this.selectedRepeatEvery
        case "week":
          return "00 " + tmp_min + " " + tmp_hr + " ? * " + this.activedaylist.toString() + " *"
        case "custom":
          return this.customexp;
        default:
          return ""
      }
    } else {
      return ""
    }
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

  getExpressionString() {
    try {
      return cRonstrue.toString(this.createExpression())
    } catch (ex) {
      return ""
    }
  }

  schedule(isNative) {
    if (this.selectedJobOption === 'pipeline') {
      if (this.isInEdit) {
        this.updatePipelineJob();
      } else {
        this.schedulePipelineJob(isNative);
      }
    } else {
      if (this.selectedJobOption === 'group') {
        if (this.isInEdit) {
          this.updateChainJob();
        } else {
          this.scheduleChainJob();
        }
      } else {
        if (this.selectedJobOption === 'internal') {
          if (this.isInEdit) {
            this.updateInternalJob();
          } else {
            this.scheduleInternalJob();
          }
        } else {
          this.service.message("Invalid Job Option", "error")
        }
      }
    }
    this.close();
  }

  schedulePipelineJob(isNative) {
    let job_alias = this.getJob(this.selectedjob)[0]
    let index = this.pipelines_list.findIndex(option => option.name === job_alias || option.alias === job_alias);
    let job_name = this.pipelines_list[index]?.name.toString();
    let job_type = this.pipelines_list[index]?.type.toString();
    let localdate = this.getLocalDate();
    let localtime = this.getLocalTime();
    let thresholdtime = this.getThresholdTime();
    let scheduleType = 'pipeline'

    let expression = this.createExpression();
    if (this.repeat) {
      this.runCronSchedule(job_name, job_type, localdate, localtime, expression, isNative, job_alias, thresholdtime, scheduleType);
    } else {
      this.runSimpleSchedule(job_name, job_type, localdate, localtime, isNative, job_alias, thresholdtime, scheduleType);
    }
  }

  updatePipelineJob() {
    let job = this.getJob(this.selectedjob)[0]
    let localdate = this.getLocalDate();
    let localtime = this.getLocalTime();
    let expression = this.createExpression();
    let thresholdtime = this.getThresholdTime();
    if (this.repeat) {
      this.updateCronSchedule(this.jobid, this.org, localdate, localtime, expression, thresholdtime);
    } else {
      this.updateSimpleSchedule(this.jobid, this.org, localdate, localtime, thresholdtime);
    }
  }

  scheduleInternalJob() {
    let job = this.getJob(this.selectedjob)[0]
    let index = this.internal_name_list.findIndex(option => option.name === job || option.alias === job);
    let job_name = this.internal_name_list[index]?.name.toString();
    let job_url = this.internal_name_list[index]?.url.toString();
    let localdate = this.getLocalDate();
    let localtime = this.getLocalTime();
    let expression = this.createExpression();

    this.scheduleService.hitUrl(job_url, this.zoneId, expression, localdate, localtime, false, job_name).subscribe(
      pageResponse => {
        this.service.message("Job Scheduled Successfully", "success");
        this.closeDialog();
        this.telemetry.addTelemetryEvent(job_name+' Scheduled job');

      },
      error => {
        this.service.message('Could not get the results' + error.body, "error");
      }
    );
  }

  updateInternalJob() {
    this.scheduleService.deleteJob(this.jobid, this.org).subscribe(res => {
      this.scheduleInternalJob();
    }, err => {
      this.service.message("Error in Updating Job", "error");
    })
  }

  runCronSchedule(cname: any, pipelinetype: any, date: any, time: any, cronexp: any, isNative: any, alias, thresholdtime: any, scheduleType: any) {

    this.scheduleService.runCronSchedule(cname, pipelinetype, date, time, this.zoneId, cronexp, isNative, alias, thresholdtime, this.selectedRunType.value.type.toLowerCase(), this.selectedRunType.value.dsName, scheduleType).subscribe(
      pageResponse => {
        this.service.message("Job Scheduled Successfully", "success");
        this.closeDialog()
        this.telemetry.addTelemetryEvent(cname+ ' Scheduled job');

      },
      error => {
        this.service.message('Could not get the results' + error.body, "error");
      }
    );
  }

  runSimpleSchedule(cname: any, pipelinetype: any, date: any, time: any, isNative: any, alias, jobtimeout: any, scheduleType:any) {
    this.scheduleService.runSchedule(cname, pipelinetype, date, time, this.zoneId, isNative, false, alias, jobtimeout, this.selectedRunType.value.type.toLowerCase(), this.selectedRunType.value.dsName, scheduleType).subscribe(
      pageResponse => {
        this.service.message("Job Scheduled Successfully", "success");
        this.closeDialog();
        this.telemetry.addTelemetryEvent(cname+' Scheduled job');

      },
      error => {
        this.service.message("Error :", "error");
      }
    );
  }

  updateSimpleSchedule(jobname: any, jobgroup: any, date: any, time: any, threshold: any) {
    this.scheduleService.updateSchedule(jobname, jobgroup, date, time, this.zoneId, "", threshold, this.selectedRunType.value.type.toLowerCase(), this.selectedRunType.value.dsName).subscribe(
      pageResponse => {
        this.service.message("Job Updated Successfully", "success");
        this.close();
      },
      error => {
        this.service.message('Could not get the results', "error");
        this.close();
      }
    );
  }

  updateCronSchedule(jobname: any, jobgroup: any, date: any, time: any, exp: any, jobtimeout: any) {
    this.scheduleService.updateSchedule(jobname, jobgroup, date, time, this.zoneId, exp, jobtimeout, this.selectedRunType.value.type.toLowerCase(), this.selectedRunType.value.dsName).subscribe(
      pageResponse => {
        this.service.message("Job Updated Successfully", "success");
        this.close();
      },
      error => {
        this.service.message('Could not get the results', "error");
        this.close();
      }
    );
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
      // need to set selectedRunType to each pipeline of the chain
      chainedJob.jsonContent.element.elements.forEach((e) => {
        e.runtime = this.selectedRunType.viewValue;
      });

      this.jobService.updateChainedJob2(chainedJob.jobName, chainedJob.jsonContent, chainedJob.jsonContent.element.elements, chainedJob.jsonContent.element.params).subscribe(() => {
        this.jobService.getChainByName(chainedJob.jobName).subscribe((res) => {
          let chainedJob = res
          chainedJob.jsonContent["remoteDatasourceName"] = this.selectedRunType.value.dsName;
          this.jobService.runChainedJob3(chainedJob.jobName, chainedJob).subscribe(
            pageResponse => {
              this.service.message("Job Scheduled Successfully", "success");
              this.closeDialog();
              this.telemetry.addTelemetryEvent(chainedJob.jobName+' Scheduled job');

            },
            error => {
              this.service.message("Error in Creating Job", "error");
            }
          );
        });
      })
    })
  }
  //       this.jobService.runChainedJob2('', chainedJob.jobName, chainedJob.jsonContent.element.elements, chainedJob.jsonContent.element.params, false).subscribe(res => {
  //         this.service.message("Job Scheduled Successfully", "success");
  //       }, error => {
  //         this.service.message("Error in Creating Job", "error");
  //       })
  //     })
  //   })
  // }

  updateChainJob() {
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
      chainedJob.jsonContent.remoteDatasourceName = this.selectedRunType.value.dsName;
      chainedJob.jsonContent.element.elements.forEach((e) => {
        e.runtime = this.selectedRunType.viewValue;
      });
      this.jobService.updateChainedJob2(chainedJob.jobName, chainedJob.jsonContent, chainedJob.jsonContent.element.elements, chainedJob.jsonContent.element.params).subscribe(() => {
        chainedJob.jsonContent["remoteDatasourceName"] = this.selectedRunType.value.dsName;
        this.jobService.rescheduleChainJob(this.jobid,
          chainedJob.jobName, this.org, chainedJob).subscribe(res => {
            this.service.message("Job Updated Successfully", "success");
          }, error => {
            this.service.message("Error in Updating Job", "error");
          })
      });
    })
  }

  close() {
    let state = false;
    this.isViewChange.emit(state);
  }

  validate(isNative) {
    this.isError = false
    this.errorMessage = ""
    let validjoboption = this.joboption;
    if (this.isInEdit || validjoboption) {
      if (!this.selectedjob) { this.selectedjob = this.typeValue }
      let validjob = this.selectedjob && this.getJob(this.selectedjob).length == 1;
      if (this.isInEdit || validjob) {
        this.selecteddate = this.datepipe.transform(this.selecteddate, 'yyyy-MM-ddTHH:mm')
        this.formatTime(this.selecteddate, this.selectedtime)
        let datevalidation = new Date(this.selecteddatetime)
        let validdatetime = datevalidation instanceof Date && !isNaN(datevalidation.getTime()) && ((new Date()).getTime() < datevalidation.getTime());
        if (validdatetime) {
          if (this.repeat) {
            let validrepeatoption = this.repeatOptions.filter(option => option.value == this.selectedRepeat).length > 0
            if (this.selectedRepeat == "custom") {
              this.validateCustom();
              if (this.cronvalidated) {
                this.schedule(isNative)
                // this.closeDialog()
              }
              else {
                this.isError = true
                this.errorMessage = "Cron not Valid"
              }
            }
            else {
              if (validrepeatoption) {
                if (this.isRepeatEveryOptionValid()) {
                  let validrepeateveryoption = this.repeatEveryOptions.filter(option => option == this.selectedRepeatEvery).length > 0
                  if (validrepeateveryoption) {
                    //let validstartatoption = this.startAtOptions.filter(option => option == this.startAt).length > 0
                    // if (validstartatoption) {
                    this.schedule(isNative)
                    // this.closeDialog()
                    // } 
                    // else {
                    //   this.isError = true
                    //   this.errorMessage = "Invalid 'Start At' Criteria"
                    // }
                  } else {
                    this.isError = true
                    this.errorMessage = "Invalid 'Repeat Every' Criteria"
                  }
                } else {
                  if (this.activedaylist.length > 0) {
                    this.schedule(isNative)
                    // this.closeDialog()
                  } else {
                    this.isError = true
                    this.errorMessage = "Invalid Day"
                  }
                }
              } else {
                this.isError = true
                this.errorMessage = "Invalid 'Repeat' Criteria"
              }
            }
          } else {
            this.schedule(isNative)
            // this.closeDialog()
          }
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

  getJob(value) {
    if (this.selectedJobOption === 'pipeline') {
      return this.options.filter(option => option == value);
    } else {
      if (this.selectedJobOption === 'group') {
        return this.options1.filter(option => option == value);
      } else {
        return this.options2.filter(option => option == value);
      }
    }
  }



  validateCustom() {

    var cronValidator = require('cron-expression-validator');
    var validator;
    validator = cronValidator.isValidCronExpression(this.customexp, { error: true })
    if (validator.isValid == false) {
      this.customsuccess = false;
      this.customerrormsg = "";
      this.customerror = true;
      this.customerrormsg = validator.errorMessage;
      this.cronvalidated = false;

    }
    else {
      this.customerror = false;
      this.customsuccess = true;
      this.cronvalidated = true;
    }







  }


  private arrayRemove(arr, value) {
    return arr.filter(function (ele) {
      return ele != value;
    });
  }

  panelOptionSelected($event) {
    if (this.jobtype === 'pipeline') {
      let filteredpipeline = this.pipelines_list.filter(option => option.alias == $event.option.value)
      this.typeValue = filteredpipeline[0].value.toString();
    }

    else if (this.jobtype === 'internal') {
      this.typeValue = $event.option.value;
    }

    else
      this.typeValue = $event;

  }

  closeDialog() {
    this.dialogRef.close();
    // this.location.back();
  }

  onRuntimeChange(runtimeValue) {
    this.selectedRunType.value = runtimeValue;
    this.selectedRunType.viewValue = runtimeValue.type + "-" + runtimeValue.dsAlias;
  }

  ngOnDestroy(): void {
    let activeSpan = this.telemetry.fetchActiveSpan();
    this.telemetry.endTelemetry(activeSpan);
  }

}