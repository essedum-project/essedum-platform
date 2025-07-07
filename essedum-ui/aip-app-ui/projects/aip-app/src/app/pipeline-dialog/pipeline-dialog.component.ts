import { Component, Input } from '@angular/core';
import { Services } from '../services/service';
import { Router } from '@angular/router';
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { DatePipe } from "@angular/common";
import { SchemaRegistryService } from '../services/schema-registry.service';
import { EventsService } from '../services/event.service';
import { DatasetServices } from '../dataset/dataset-service';
import { JobsService } from '../services/jobs.service';

@Component({
  selector: 'app-pipeline-dialog',
  templateUrl: './pipeline-dialog.component.html',
  styleUrls: ['./pipeline-dialog.component.scss']
})
export class PipelineDialogComponent {
  @Input() data: string;
  @Input() dstName:string;
  @Input() dstId:string;
  @Input() event:any;
  tooltipPoition: string = 'above';
  card;
  eventName;
  avail_refresh: boolean = true;
  busy: Subscription;
  event_status: string = '';
  corelid: string;
  org:string
  pName:string;
  loadingPageForSpinner: boolean;
  filteredTopics: any;
  cardData:any[] = [];
  selectedTopic: string;
  startTime: any;
  endTime: any;
  status: any;
  showLog: boolean = false;
  viewType:string;
  type: boolean = false;
  cardStatus: any;
  jobStatus:any;
  lastStatus: any;
  jobid: any;
  logs: any;
  start: number;
  end: number;
  stat: any;
  topics: any;
  searchCards: any[]=[];
  jobStat: string;
  jobCorelId: any;
  examplee: any;
  translationConfig: boolean=false;
  errMsgFlag: boolean = true;
  language: any;
  cards: boolean;
  languages=[
    {name:'English', value:'eng'},
    {name:'Hindi', value:'hin'},
    {name:'Telugu', value:'tel'},
    {name:'Kannada', value:'kan'},
    {name:'Tamil', value:'tam'},
    {name:'German', value:'deu'},
    {name:'French', value:'fre'},
    {name:'Spanish', value:'spa'}
  ]
  languageOpt: any[]=[];
  languageAllOpt: any[]=[];
  lanValue: string;
  count: number=0;
  errCount: number=0;

    constructor(
      public datepipe: DatePipe,
      public router: Router,
      private service: Services, 
      private jobService: JobsService,
      private datasetsService: DatasetServices,
      public dialog: MatDialog,
      public schemaService:SchemaRegistryService,
      private eventsService: EventsService,
    ) {
      
    }

  ngOnInit(): void{
    this.showLog=false;
    this.cards=true;
    this.errMsgFlag = true;
    this.translationConfig = false
    this.selectedTopic =null;
    if(this.dstName){
      this.datasetsService.getDatasetByNameAndOrg(this.dstName).subscribe((res) => {
        this.card = res
        this.viewType=this.card.views
        this.fileType(this.viewType)
        if(this.card.event_details!=null){
          this.filteredTopics=JSON.parse(this.card.event_details)
          this.getCardStatus();
          this.loadingPageForSpinner = false;
        }
      });
    }
    this.language = null; // Resetting the selected language
    this.languageOpt = []; // Resetting the options array
    this.lanOpts()
  }

  closeModal(){
    this.dialog.closeAll();
  }

  getCardStatus(){
    this.cardData=[];
    this.searchCards=[];
    this.filteredTopics.forEach(e=>{
      this.jobService.getByCorelationId(e.corelId).subscribe(res=>{
        this.cardData.push({...e,status:res[0].jobStatus}),
        this.searchCards.push({...e,status:res[0].jobStatus})

      })
    });
  }

  filterStatus(event){
    const card = this.cardData.find(s=>s.eventName === event)
    this.cardStatus = card.status;
  }

  fileType(typ){
    if(typ==='Pdf View' ||typ=== 'Text View')
      this.type=false;
    else
      this.type=true;
  }

  searchfilteredTopics(filter) {
    this.showLog = false;
    this.selectedTopic = '';
    this.cardData = []
    if (filter && filter != "") {
      this.searchCards.forEach(topic => {
        if (topic.eventName?.toUpperCase().includes(filter?.toUpperCase())) {
          this.cardData.push(topic);
        }
      });
    }
    else if (filter == "") {
      this.searchCards.forEach(indexName => {
        this.cardData.push(indexName);
      });
    }
  }

  eventTrigger(eventName:string){
    try{
      this.avail_refresh = false;
      let updateEventName = eventName;
      this.busy = this.eventsService.getEventByName(updateEventName).subscribe((eventRes) => {
        if(eventRes!=null){
        let jobdetails = JSON.parse(eventRes.jobdetails);
        let selectedRunType = jobdetails[0].runtime;
        this.corelid = jobdetails[0].last_refresh_event
        const requesting = this.reqBody();
        this.busy = this.eventsService.triggerPostEvent(updateEventName,requesting, selectedRunType['dsName']).subscribe((res) => {
          this.event_status = 'RUNNING'
          jobdetails[0]["last_refresh_event"] = res
          this.service.message(updateEventName+" Job Triggered Successfully", 'success');
          this.service.getEventStatus(res).subscribe(status => {
            this.event_status = status
            jobdetails[0]["last_refresh_status"] = this.event_status
            eventRes.jobdetails = JSON.stringify(jobdetails)
            this.busy = this.eventsService.createEvent(eventRes).subscribe((response) => {
              this.avail_refresh = true;
              this.corelid = jobdetails[0].last_refresh_event
            },error => {
              this.service.message('Event not updated due to error: ' + error,'error')
              this.avail_refresh = true;
            });
          });
          this.corelid = jobdetails[0].last_refresh_event
          this.setCorelId(this.dstId,this.corelid,updateEventName);
          this.ngOnInit();
          this.refreshJobStatus(updateEventName)
        }, error => {
          this.service.message('Job not triggered due to error: ' + error, 'error')
          this.avail_refresh = true;
        });
      } else {
        this.service.errorMessage('Please check event '+updateEventName)
      }
    }, error => {
        this.service.message('Job not triggered due to error: ' + error, 'error')
        this.avail_refresh = true;
      });
    }
    catch(Exception){
      this.service.message('Some error occured', 'error');
    }
  }

    async refreshJobStatus(event:string) {
    if(event){
      const corelId:string = this.getCorelid(event);
      if(corelId){
        const id=corelId[0]
        if(id){
          this.busy = this.eventsService.getEventByName(event).subscribe((eventRes) => {
            let jobdetails = JSON.parse(eventRes.jobdetails);
            let eventStat = jobdetails[0].last_refresh_status
            // if(this.stat){
            //   console.log("status in refresh if Stat", this.stat)
              if(eventStat == 'RUNNING'){
                this.service.getEventStatus(jobdetails[0].last_refresh_event).subscribe(
                  status=>{
                    this.stat = status
                    this.event_status = status
                    jobdetails[0]["last_refresh_status"] = this.event_status
                    eventRes.jobdetails = JSON.stringify(jobdetails)
                    this.busy = this.eventsService.createEvent(eventRes).subscribe((response) => {
                      this.avail_refresh = true;
                      this.service.message('Status refreshed')
                    },error => { 
                        this.service.message('Event not updated due to error: ' + error,'error')
                        this.avail_refresh = true;
                      });
                  });
              } else{
                this.event_status = jobdetails[0].last_refresh_status
                this.service.message('Status refreshed')
              } 
       
          });
        // });
        }
      }
    }
  }

  reqBody(){
    let requestBody = {
      "environment": [
        {
          "name": "datasetId",
          "value": this.dstName
        },
        {
          "name": "org",
          "value": this.org = sessionStorage.getItem("organization")
        }
      
      ]
    };
    if (this.lanValue) { 
      requestBody.environment.push({
          "name": "targetLanguage",
          "value": this.lanValue
      });
  }
    return requestBody;
  }

  setCorelId(dstid,corelid,name){
    this.datasetsService.savecorelId(dstid,corelid,name).subscribe((res) => {
      let dataset = res
      this.eventName = JSON.parse(dataset.event_details);
    },error => {
        this.service.message('Error in corelId! '+ error)
        this.avail_refresh = true;
      }
    );
  }
  getCorelid(event:string){
    if(this.card.event_details!=null){
      const filterEvent = this.filteredTopics.filter(eve=>eve.eventName===event);
      if (filterEvent.length === 0) {
        return 0;
      }
      return filterEvent.map(eve=>eve.corelId);
    } else {
      return 0
    }
  }

  async transcribe(){
    this.eventName='Transcribe'
    await this.eventTrigger(this.eventName);
  }

  async translation(){
    if(this.type){
      this.service.message('Checking Transcribe pipeline status')
      const corlId = this.getCorelid('Transcribe');
      if(corlId===0){
        this.service.errorMessage('No Transcribe event found! Trigerring','error')
        this.transcribe()
      } else {
        let corelationId = this.getCorelid('Transcribe');
        this.jobService.getByCorelationId(corelationId).subscribe(resp => {
          let job = resp
          const jobStat = job[0].jobStatus
          console.log("Job status before triggering in else",jobStat)
          if(jobStat==="ERROR"){
            this.errCount=this.errCount+1
            if(this.errCount===1){
              this.service.errorMessage('Retriggering Transcribe Pipeline',"error")
              this.transcribe()
              console.log("Job status in transcribe",jobStat)
            } else {
              // clearInterval(checkInterval);
              this.service.errorMessage('Error in Transcribe Pipeline',"error")
            }
          }
        });
      }
      const checkInterval = setInterval(() => {
        let corelationId = this.getCorelid('Transcribe');
        this.jobService.getByCorelationId(corelationId).subscribe(resp => {
          let job = resp
          const jobStat = job[0].jobStatus
          if(jobStat==="COMPLETED"){
            clearInterval(checkInterval);
            this.eventTrigger('Translation') 
          } 
          else if(jobStat==="RUNNING"){
            console.log("Job status while running",jobStat)
            this.service.message('Pipeline running')
          }
          else if(jobStat==="CANCELLED"){
            this.count=this.count+1
            if(this.count===1){
              this.service.errorMessage('Retriggering Transcribe Pipeline',"error")
              this.transcribe()
            } else {
              clearInterval(checkInterval);
              this.service.errorMessage('Pipeline cancelled!',"error")
            }
          } 
          else if(jobStat==="ERROR"){
            clearInterval(checkInterval);
            this.service.errorMessage('Error in Transcribe Pipeline',"error")
            this.ngOnInit()
          }
        });
      }, 10000);
    }
    else {
      this.eventName = 'Translation';
      await this.eventTrigger(this.eventName); 
    }
  }

  async summary(){
    this.service.message('Checking Translation pipeline status')
    const corlId = this.getCorelid('Translation');
    if(corlId===0){
      this.service.errorMessage('No Translation event found! Trigerring','error')
      this.translationn()
    } else {
      let corelationId = this.getCorelid('Translation');
      this.jobService.getByCorelationId(corelationId).subscribe(resp => {
        let job = resp
        const jobStat = job[0].jobStatus
        console.log("Job status before triggering in else",jobStat)
        if(jobStat==="ERROR"){
          this.errCount=this.errCount+1
          if(this.errCount===1){
            this.service.errorMessage('Retriggering Translation Pipeline',"error")
            this.translationn()
            console.log("Job status in translationn",jobStat)
          } else {
            clearInterval(checkInterval);
            this.service.errorMessage('Error in Translation Pipeline',"error")
          }
        }
      });
    }
    const checkInterval = setInterval(() => {
      let corelationId = this.getCorelid('Translation');
      this.jobService.getByCorelationId(corelationId).subscribe(resp => {
        let job = resp
        const jobStat = job[0].jobStatus
        if(jobStat==="COMPLETED"){
          clearInterval(checkInterval);
          this.eventTrigger('Summary') 
        } 
        else if(jobStat==="RUNNING"){
          console.log("Job status while running",jobStat)
          this.service.message('Pipeline running')
        }
        else if(jobStat==="CANCELLED"){
          this.count=this.count+1
          if(this.count===1){
            this.service.errorMessage('Retriggering Translation Pipeline',"error")
            this.translationn()
          } else {
            clearInterval(checkInterval);
            this.service.errorMessage('Pipeline cancelled!',"error")
          }
        } 
        else if(jobStat==="ERROR"){
          clearInterval(checkInterval);
          this.service.errorMessage('Error in Translation Pipeline',"error")
          this.ngOnInit()
        }
      });
    }, 10000);
  }

  async questions(){
    this.count=0
    this.errCount=0;
    this.service.message('Checking Translation pipeline status')
    const corlId = this.getCorelid('Translation');
    if(corlId===0){
      this.service.errorMessage('No Translation event found! Trigerring','error')
      this.translationn()
    } else {
      let corelationId = this.getCorelid('Translation');
      this.jobService.getByCorelationId(corelationId).subscribe(resp => {
        let job = resp
        const jobStat = job[0].jobStatus
        if(jobStat==="ERROR"){
          this.errCount=this.errCount+1
          if(this.errCount===1){
            this.service.errorMessage('Retriggering Translation Pipeline',"error")
            this.translationn()
          } else {
            clearInterval(checkInterval);
            this.service.errorMessage('Error in Translation Pipeline',"error")
          }
        }
      });
    }
    const checkInterval = setInterval(() => {
      let corelationId = this.getCorelid('Translation');
      this.jobService.getByCorelationId(corelationId).subscribe(resp => {
        let job = resp
        const jobStat = job[0].jobStatus
        if(jobStat==="COMPLETED"){
          clearInterval(checkInterval);
          this.eventTrigger('Questions') 
        } 
        else if(jobStat==="RUNNING"){
          this.service.message('Pipeline running')
        }
        else if(jobStat==="CANCELLED"){
          this.count=this.count+1
          if(this.count===1){
            this.service.errorMessage('Retriggering Translation Pipeline',"error")
            this.translationn()
          } else {
            clearInterval(checkInterval);
            this.service.errorMessage('Pipeline cancelled!',"error")
          }
        } 
        else if(jobStat==="ERROR"){
          clearInterval(checkInterval);
          this.service.errorMessage('Error in Translation Pipeline',"error")
          this.ngOnInit()
        }
      });
    }, 10000);
  }

  linked(result) {
    this.showLog = false;
    this.selectedTopic = result;
    this.filterStatus(result)
    this.examplee = this.cardStatus
    this.jobCorelId = this.getCorelid(result);
    this.fetchLogs(this.jobCorelId)
  }

  showOrHideLog() {
    this.showLog = !this.showLog;
  }

  async fetchLogs(corelid){
    this.startTime='';
    this.endTime='';
    await this.jobService.getByCorelationId(corelid).subscribe(resp => {
      let job = resp
      this.jobid = job[0].jobId
      this.jobStat = job[0].jobStatus
      this.startTime = job[0].submittedOn
      this.endTime = job[0].finishtime
      this.fetchLog()
      this.start = (new Date(this.startTime).getTime());
      this.end = (new Date(this.endTime).getTime())
      if (this.startTime)
        this.startTime = new Date(this.start);
      else
        this.startTime = undefined;
      
      if (this.endTime)
        this.endTime = new Date(this.end);
      else
        this.endTime = undefined;
    });
  }

  fetchLog(){
    this.service.fetchSparkJob(this.jobid, 0, 'local', 0, this.examplee,false).subscribe(
      (response) => {
        let resp = response
        this.logs = resp.log
    })
  }

  async retryLinkKB(event:string) {
    this.trigger(event);
  }

  trigger(event){
    this.loadingPageForSpinner=false;
    switch (event) {
      case 'Transcribe':
        this.transcribe()
        break;
      case 'Translation':
        this.translation()
        break; 
      case 'Summary':
        this.summary()
        break;
      case 'Questions':
        this.questions()
        break;
      default:
        this.service.messageService('Failed to trigger! Please check events')
        break;
    }
  }

  translate(eve: any){
    this.language = eve;
    this.errMsgFlag = true;
    if(eve){
      this.errMsgFlag = false;
    }
    this.languageValue(this.language)
  }

  cancelTranslation(){
    this.translationConfig = false
    this.errMsgFlag = false;
    this.ngOnInit()
  }

  closeDialog() {
    this.translationConfig = false;  
    this.cards = true;  // Restoreing previous state
  }
  
  translationn(){
    this.translationConfig = true
    this.cards=false;
  }
  lanOpts(){
    this.languages.forEach((opt)=>{
      let val={viewValue:opt.name,value:opt.value};
      this.languageOpt.push(opt.name)
      this.languageAllOpt.push(val)
    });
  }
  languageValue(val: string){
    const value = this.languageAllOpt.find(i=>i.viewValue.toLowerCase()===val.toLowerCase())
    this.lanValue = value.value
  }
 
}
