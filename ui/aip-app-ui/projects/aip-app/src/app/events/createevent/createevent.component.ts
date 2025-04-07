import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { EventsService } from '../../services/event.service';
import { Services } from '../../services/service';
import { Events, JobDetails } from '../../sharedModule/events/events';
import { JobsService } from '../../services/jobs.service';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { OpenTelemetryService } from 'com-lib-util';
@Component({
  selector: 'app-createevent',
  templateUrl: './createevent.component.html',
  styleUrls: ['./createevent.component.scss']
})

export class CreateeventComponent implements OnInit {
  name = '';
  description = '';
  colList: any = [];
  eventtypes: any[] = [{viewValue:"pipeline",value:"pipeline"}, {viewValue:"chain",value:"chain"}, {viewValue:"internal",value:"internal"}, {viewValue:"api",value:"api"}];
  inputColumns = new FormControl();
  selectedFile: File;
  importedJson: string;
  eventname: string;
  jobname: string;
  jobtype: string;
  updatetrue: boolean = false;
  id: any;
  isAuth: boolean = true;
  isAuthRun: boolean = true
  busy: Subscription
  isType: string;
  myDropDown: string;
  originalPipeline: any = [];
  originalChains: any = [];
  originalInternals: any = [];
  originalApiEvents: any = [];
  typeValue: string;
  pipelinefilter = new FormControl();
  chainfilter = new FormControl();
  internalfilter = new FormControl();
  apifilter = new FormControl();
  pipelines: Observable<string[]>;
  pipelines_list: OptionsDTO[]=[];
  chains: Observable<string[]>;
  internals: Observable<string[]>;
  apis: Observable<string[]>;
  sampleRequestBody: any = "{}";
  isBody: boolean = false;
  jobDescription: string;
  @ViewChild('autoTrigger', { read: MatAutocompleteTrigger, static: false })
  inputAutoComplete: MatAutocompleteTrigger;

  runTypes:OptionsDTO[]=[];
  selectedRunType: any;
  pipelines_alias: any = [];
  errFlag: boolean = false;
  chain_alias: any;
  chain_list: any = [];
  internal_name_list: any = [];
  api_list: any = [];
  plist_available: boolean = false;
  data: any;
  isEdit: boolean = true;
  constructor(
    public dialogRef: MatDialogRef<CreateeventComponent>,
    private eventsService: EventsService,
    private telemetry: OpenTelemetryService,
    private service: Services,
    private jobService: JobsService,
    @Inject(MAT_DIALOG_DATA) public data1: any
  ) {
    dialogRef.disableClose = true;
  }

  telemetryCall(){
    this.telemetry.startTelemetry('aip-app','CreateeventComponent', sessionStorage.getItem('organization'));
  }

  ngOnInit() {
    this.telemetryCall();
    this.authentications();
    this.fetchGroup();
    this.getAllPipelines();
    this.getAllChains();
    this.getAllInternals();
    this.getAllApiEvents();

    this.service.fetchJobRunTypes().subscribe(resp=>{
      resp.forEach((ele)=> {
        this.runTypes.push(new OptionsDTO(ele.type+"-"+ele.dsAlias, ele));
      });
      this.runTypes.push(new OptionsDTO("Local", {"dsAlias":"","dsName":"","type":"Local"}));
      if(this.selectedRunType){
        let index = this.runTypes.findIndex(x => JSON.stringify(x.value) === JSON.stringify(this.selectedRunType));
        this.selectedRunType=this.runTypes[index].value;
      }
      else{
        let index = this.runTypes.findIndex(x => JSON.stringify(x.value) === '{"dsAlias":"","dsName":"","type":"Local"}');
        this.selectedRunType=this.runTypes[index].value;
      }
    });

    if (this.data1 != null) {
      this.data = this.data1.data
      this.isEdit = this.data1.editTrue
      this.editDetails()
    }
  }

  authentications() {
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        // event-edit/update permission
        if (cipAuthority.includes("event-edit")) this.isAuth = false;
        // event-run permission
        if (cipAuthority.includes("event-run")) this.isAuthRun = false;
      }
    );
  }

  selectedz(data) {
    try{
      return JSON.stringify(data);
    }
    catch(Exception){
    this.service.message("Some error occured", "error")
    }
  }

  omit_special_char(event) {
    var k = event.charCode
    return this.isValidLetter(k);
  }

  isValidLetter(k) {
    return ((k >= 65 && k <= 90) || (k >= 97 && k <= 122) || (k >= 48 && k <= 57) || [8, 9, 13, 16, 17, 20, 95].indexOf(k) > -1)
  }

  isWordValid(word) {
    word = word.toString()
    for (var i = 0, j = word.length; i < j; i++) {
      if (!this.isValidLetter(word.charCodeAt(i))) {
        return false
      }
    }
    return true
  }

  saveDetails() {
    try{
      if (this.eventname && this.typeValue && this.isType && this.selectedRunType)
      {
      if (this.updatetrue || this.isWordValid(this.eventname)) {
        const newCanvas = new Events();
        newCanvas.eventname = this.eventname;
        let jobdetail = new JobDetails();
        if(this.isType === 'pipeline'){
          let index = this.pipelines_list.findIndex(option => option.viewValue === this.typeValue);
          this.typeValue = this.pipelines_list[index].value.toString();
          // let filteredpipeline = this.pipelines_list.filter(option => option.viewValue === this.typeValue)
          // this.typeValue = filteredpipeline[0].value.toString();
          jobdetail.name = this.typeValue;
        }
        else{
          jobdetail.name = this.typeValue;
        }
        jobdetail.type = this.isType;
        jobdetail.runtime = this.selectedRunType
        let jobdetails: JobDetails[] = []
        jobdetails.push(jobdetail);
        // newCanvas.jobname = this.typeValue;
        // newCanvas.jobtype = this.isType;
        newCanvas.jobdetails = JSON.stringify(jobdetails);
        newCanvas.description = this.jobDescription;
        newCanvas.body = this.sampleRequestBody;
        this.busy = this.eventsService.createEvent(newCanvas).subscribe((response) => {
          this.service.message('Created Successfully','success');
          this.telemetry.addTelemetryEvent(this.eventname + ' event created');
          this.dialogRef.close({ group: '"temp[0].name"', data: response });
        },
          error => this.service.message('Event not Created due to error: ' + error,'error')
        );
      } else {
        this.service.message('Invalid Event Name','error')
      }
    }else {
      this.errFlag = true
    }
    }
    catch(Exception){
      this.service.message("Some error occured", "error")
    }
    

  }

  updateDetails() {
    try{
      if (this.eventname && this.typeValue && this.isType && this.selectedRunType)
      {
      const newCanvas = new Events();
      newCanvas.eventname = this.eventname;
      let jobdetail = new JobDetails()
      if(this.isType === 'pipeline'){
        let index = this.pipelines_list.findIndex(option => option.viewValue === this.typeValue);
        this.typeValue = this.pipelines_list[index].value.toString();
        // let filteredpipeline = this.pipelines_list.filter(option => option.viewValue === this.typeValue)
        // this.typeValue = filteredpipeline[0].value.toString();
        jobdetail.name = this.typeValue;
      }
      else if(this.isType === 'internal'){
        jobdetail.name = this.typeValue;
      } else{
        jobdetail.name = this.typeValue;
      }
      jobdetail.type = this.isType;
      jobdetail.runtime = this.selectedRunType
      let jobdetails: JobDetails[] = []
      jobdetails.push(jobdetail);
      // newCanvas.jobname = this.typeValue;
      // newCanvas.jobtype = this.isType;
      newCanvas.jobdetails = JSON.stringify(jobdetails);
      // newCanvas.jobname = this.typeValue;
      // newCanvas.jobtype = this.isType;
      newCanvas.id = this.id;
      newCanvas.description = this.jobDescription;
      newCanvas.body = this.sampleRequestBody;
      this.busy = this.eventsService.createEvent(newCanvas).subscribe((response) => {
        this.service.message('Updated Successfully','success');
        this.telemetry.addTelemetryEvent(this.eventname + ' event updated');
        this.dialogRef.close({ group: '"temp[0].name"', data: response });
        this.updatetrue = false
      },
        error => this.service.message('Event not Updated due to error: ' + error,'error')
      );
    }else {
      this.errFlag = true
    }
    }
    catch(Exception){
      this.service.message("Some error occured", "error")
    }

  }

  editDetails() {
    try{
      // this.busy = this.eventsService.getEventbyID(this.data.id).subscribe((res) => {
        let jobdetails = JSON.parse(this.data.jobdetails)
        this.eventname = this.data.eventname
        this.isType = jobdetails[0].type
        this.jobDescription = this.data.description;
        this.sampleRequestBody = this.data.body?this.data.body:"{}";
        this.id = this.data.id
        if(jobdetails[0].runtime)
        this.selectedRunType = jobdetails[0].runtime
        if(this.isType === 'pipeline' ){
          if(this.plist_available){
            let index = this.pipelines_list.findIndex(option => option.value === jobdetails[0].name || option.viewValue === jobdetails[0].name);
            this.typeValue = this.pipelines_list[index]?.viewValue.toString();
          }else{
            this.typeValue = jobdetails[0].name;
          }
            // let filteredpipeline = this.pipelines_list.filter(option => option.value == jobdetails[0].name)
            // this.typeValue = filteredpipeline[0].viewValue.toString();
        }
        else if(this.isType === 'internal'){
          this.typeValue = jobdetails[0].name;
        }else{
          this.typeValue = jobdetails[0].name;
        }   
        this.updatetrue = true
      // });
    }
    catch(Exception){
    this.service.message("Some error occured", "error")
    }

  }

  runfunction() {
    this.busy = this.eventsService.triggerPostEvent(this.eventname, this.sampleRequestBody, this.selectedRunType['dsName']).subscribe((res) => {
      this.service.message("Job Triggered Successfully",'success');
      this.telemetry.addTelemetryEvent(this.eventname + ' event triggered');

    }, error => this.service.message('Job not triggered due to error: ' + error,'error'));

  }

  fetchGroup() {
    try{
      this.busy = this.service.getPipelineGroups().subscribe((res) => {
        this.colList = [];
        res.forEach(element => {
          const newelement = {};
          newelement['id'] = element.id;
          newelement['name'] = element.name;
          newelement['description'] = element.description;
          newelement['organization'] = element.organization;
          newelement['groupType'] = element.groupType;
          this.colList.push(newelement);
        });
        this.colList.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
        if (this.data && this.data.canvasData && this.data.canvasData.name !== '') {
          this.busy = this.service.getGroupsForEntity(this.data.canvasData.name).subscribe(res1 => {
            const temp = [];
            res1.forEach(element => {
              const index = this.colList.findIndex(i => i.name === element.name);
              if (index !== -1) {
                temp.push(JSON.stringify(this.colList[index]));
              }
            });
            this.inputColumns.setValue(temp);
          });
        }
      });
    }
    catch(Exception){
    this.service.message("Some error occured", "error")
    }

  }

  closeDialog() {
    this.dialogRef.close();
  }

  dropChange(val) {
    if (this.data && this.data.canvasData) {
      this.data.canvasData.groups = this.inputColumns.value;
    }
  }

  onFileChanged(event) {
    try{
      this.selectedFile = event.target.files[0];
      const fileReader = new FileReader();
      fileReader.readAsText(this.selectedFile, 'UTF-8');
      fileReader.onload = () => {
        const json = JSON.parse(fileReader.result as string);
        this.importedJson = JSON.stringify(json, null, 2);
      };
      fileReader.onerror = (error) => {
      };
    }
    catch(Exception){
    this.service.message("Some error occured", "error")
    }

  }

  changeTypeParam(event) {
    this.isType = event;
    this.typeValue = undefined;
    if (this.isType == "internal") {
      const org = sessionStorage.getItem("organization");
      const zoneid = Intl.DateTimeFormat().resolvedOptions().timeZone;
      this.sampleRequestBody = '{"org":"' + org + '", "zoneid":"' + zoneid + '", "date":"", "time":"", "expression":"", "event":"true", "runnow":"true"}'
    } else {
      this.sampleRequestBody = '{}'
    }
  }

  getAllPipelines() {
      this.service.getPipelineNames(sessionStorage.getItem('organization')).subscribe((res) => {
        this.originalPipeline = res;
        res.forEach((ele)=> {
          this.pipelines_alias.push(ele.alias)
          this.pipelines_list.push(new OptionsDTO(ele.alias, ele.name));
        });
        if(this.isType === 'pipeline' && this.typeValue){
          let index = this.pipelines_list.findIndex(option => option.value === this.typeValue || option.viewValue === this.typeValue );
          this.typeValue = this.pipelines_list[index]?.viewValue.toString();
        }
        this.plist_available = true
    });
    // this.service.getPipelineNames(sessionStorage.getItem('organization')).subscribe(resp=>{
    //   // let rt = JSON.parse(JSON.stringify(resp))
    //   resp.forEach((ele)=> {
    //     this.pipelines_alias.push(ele.alias)
    //     this.pipelines_list.push(new OptionsDTO(ele.alias, ele.name));
    //   });
    // })
  }

  getAllChains() {
      this.busy = this.jobService.getChainJobsLen().subscribe(resp => {
        if(resp>0){
          this.jobService.getAllChainJobs(0, resp).subscribe(res => {
            this.originalChains = res;
            res.forEach((ele)=> {
              this.chain_list.push(ele.jobName);
            });
            if(this.isType === 'chain' && this.typeValue){
              let index = this.chain_list.findIndex(option => option === this.typeValue);
              this.typeValue = this.chain_list[index]?.toString();
            }
          });
        }
      });
  }

  getAllInternals() {
      this.busy = this.jobService.getAllInternalJobs().subscribe(resp => {
        this.originalInternals = resp;
        resp.forEach((ele)=> {
          this.internal_name_list.push(ele.name)
        });
        if(this.isType === 'internal' && this.typeValue){
          let index = this.internal_name_list.findIndex(option => option === this.typeValue);
          this.typeValue = this.internal_name_list[index]?.toString();
        }
      });
   
  }

  getAllApiEvents() {
      this.busy = this.jobService.getAllAPIEvents(sessionStorage.getItem('organization')).subscribe(resp => {
        this.originalApiEvents = resp;
        resp.forEach((ele)=> {
          this.api_list.push(ele);
        });
        if(this.isType === 'api' && this.typeValue){
          let index = this.api_list.findIndex(option => option === this.typeValue);
          this.typeValue = this.api_list[index]?.toString();
        }
      });
  }

  panelOptionSelected($event){
    if(this.isType === 'pipeline'){
      let filteredpipeline = this.pipelines_list.filter(option => option.viewValue == $event.option.value)
      this.typeValue = filteredpipeline[0].value.toString();
    }
    
    else if(this.isType === 'internal'){
      this.typeValue = $event.option.value;
    }
    
    else if(this.isType === 'api'){
      this.typeValue = $event;
    }

    else
      this.typeValue = $event;

}

ngOnDestroy(): void {
	let activeSpan = this.telemetry.fetchActiveSpan();
	this.telemetry.endTelemetry(activeSpan);
}
}