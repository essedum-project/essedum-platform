import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DocumentViewComponent } from '../documents-library/document-view/document-view.component';
import { Services } from '../services/service';
import { LedsModalService } from 'leds-lib';
import { JobsService } from '../services/jobs.service';
import { EventsService } from '../services/event.service';
import { Subscription } from 'rxjs';
import { DatasetServices } from '../dataset/dataset-service';

@Component({
  selector: 'app-data-enchrichment',
  templateUrl: './data-enchrichment.component.html',
  styleUrl: './data-enchrichment.component.scss'
})
export class DataEnchrichmentComponent implements OnInit {

  @Input() status;
  @Input() selectedCard;
  @Input() selectedEvent;
  @ViewChild('ingest', { static: true }) ingest: ElementRef;
  @ViewChild('translate', { static: true }) translate: ElementRef;


  count = 0;
  type: boolean;
  docName: string;
  corelid: string;
  lanValue: string;
  eventName: string;
  busy: Subscription;
  filteredTopics: any;
  errCount: number = 0;
  event_status: string = '';
  avail_refresh: boolean = true;
  languageOpt: any[] = [];
  languageAllOpt: any[] = [];
  languages = [
    { name: 'English', value: 'eng' },
    { name: 'Hindi', value: 'hin' },
    { name: 'Telugu', value: 'tel' },
    { name: 'Kannada', value: 'kan' },
    { name: 'Tamil', value: 'tam' },
    { name: 'German', value: 'deu' },
    { name: 'French', value: 'fre' },
    { name: 'Spanish', value: 'spa' }
  ]


  constructor(
    private dialog: MatDialog,
    private service: Services,
    private jobService: JobsService,
    private eventsService: EventsService,
    private datasetService: DatasetServices,
    private modalService: LedsModalService,
  ) {}

  ngOnInit() {
    this.count = 0;
    this.fileType(this.selectedCard.views);
    this.lanOpts();
    this.docName = this.selectedCard.name;
  }

  lanOpts() {
    this.languages.forEach((opt) => {
      let val = { viewValue: opt.name, value: opt.value };
      this.languageOpt.push(opt.name)
      this.languageAllOpt.push(val)
    });
  }

  languageValue(val: string) {
    const value = this.languageAllOpt.find(i => i.viewValue.toLowerCase() === val.toLowerCase())
    this.lanValue = value.value
  }

  fileType(typ) {
    if (typ === 'Pdf View' || typ === 'Text View')
      this.type = false;
    else
      this.type = true;
  }

  open(type) {
    const dialogRef = this.dialog.open(DocumentViewComponent, {
      height: '80%',
      width: '60%',
      disableClose: true,
      data: {
        type: type,
        datasetName: this.selectedCard.name,
        attributes: this.selectedCard.attributes,
      }
    });
  }

  generate(type) {
    switch (type) {
      case 'Transcribe':
        this.transcribe()
        break;
      case 'Translation':
        this.translationn()
        break;
      case 'Summary':
        this.summary()
        break;
      case 'FAQ':
        this.questions()
        break;
      case 'Embeddings':
        this.ingestDialog(this.ingest);
        break;
      default:
        this.service.messageService('Failed to trigger! Please check events')
        break;
    }
  }

  async transcribe() {
    await this.eventTrigger('Transcribe');
  }

  translationn() {
    this.modalService.openModal(this.translate, 'mini')
  }

  async translation() {
    let eventName = 'Translation';
    await this.eventTrigger(eventName);
  }

  async summary() {
    this.service.message('Checking Translation pipeline status')
    const corlId = this.getCorelid('Translation');
    if (corlId === 0) {
      this.service.errorMessage('No Translation event found! Trigerring', 'error')
      this.translationn()
    } else {
      let corelationId = this.getCorelid('Translation');
      this.jobService.getByCorelationId(corelationId).subscribe(resp => {
        let job = resp
        const jobStat = job[0].jobStatus
        console.log("Job status before triggering in else", jobStat)
        if (jobStat === "ERROR") {
          this.errCount = this.errCount + 1
          if (this.errCount === 1) {
            this.service.errorMessage('Retriggering Translation Pipeline', "error")
            this.translationn()
            console.log("Job status in translationn", jobStat)
          } else {
            clearInterval(checkInterval);
            this.service.errorMessage('Error in Translation Pipeline', "error")
          }
        }
      });
    }
    const checkInterval = setInterval(() => {
      let corelationId = this.getCorelid('Translation');
      this.jobService.getByCorelationId(corelationId).subscribe(resp => {
        let job = resp
        const jobStat = job[0].jobStatus
        if (jobStat === "COMPLETED") {
          clearInterval(checkInterval);
          this.eventTrigger('Summary')
        }
        else if (jobStat === "RUNNING") {
          console.log("Job status while running", jobStat)
          this.service.message('Pipeline running')
        }
        else if (jobStat === "CANCELLED") {
          this.count = this.count + 1
          if (this.count === 1) {
            this.service.errorMessage('Retriggering Translation Pipeline', "error")
            this.translationn()
          } else {
            clearInterval(checkInterval);
            this.service.errorMessage('Pipeline cancelled!', "error")
          }
        }
        else if (jobStat === "ERROR") {
          clearInterval(checkInterval);
          this.service.errorMessage('Error in Translation Pipeline', "error")
          // this.ngOnInit()
        }
      });
    }, 10000);
  }

  async questions() {
    this.count = 0
    this.errCount = 0;
    this.service.message('Checking Translation pipeline status')
    const corlId = this.getCorelid('Translation');
    if (corlId === 0) {
      this.service.errorMessage('No Translation event found! Trigerring', 'error')
      this.translationn()
    } else {
      let corelationId = this.getCorelid('Translation');
      this.jobService.getByCorelationId(corelationId).subscribe(resp => {
        let job = resp
        const jobStat = job[0].jobStatus
        if (jobStat === "ERROR") {
          this.errCount = this.errCount + 1
          if (this.errCount === 1) {
            this.service.errorMessage('Retriggering Translation Pipeline', "error")
            this.translationn()
          } else {
            clearInterval(checkInterval);
            this.service.errorMessage('Error in Translation Pipeline', "error")
          }
        }
      });
    }
    const checkInterval = setInterval(() => {
      let corelationId = this.getCorelid('Translation');
      this.jobService.getByCorelationId(corelationId).subscribe(resp => {
        let job = resp
        const jobStat = job[0].jobStatus
        if (jobStat === "COMPLETED") {
          clearInterval(checkInterval);
          this.eventTrigger('Questions')
        }
        else if (jobStat === "RUNNING") {
          this.service.message('Pipeline running')
        }
        else if (jobStat === "CANCELLED") {
          this.count = this.count + 1
          if (this.count === 1) {
            this.service.errorMessage('Retriggering Translation Pipeline', "error")
            this.translationn()
          } else {
            clearInterval(checkInterval);
            this.service.errorMessage('Pipeline cancelled!', "error")
          }
        }
        else if (jobStat === "ERROR") {
          clearInterval(checkInterval);
          this.service.errorMessage('Error in Translation Pipeline', "error")
          // this.ngOnInit()
        }
      });
    }, 10000);
  }

  ingestDialog(content) {
    this.modalService.openModal(content, 'standard')
  }

  eventTrigger(eventName: string) {
    try {
      this.avail_refresh = false;
      let updateEventName = eventName;
      this.busy = this.eventsService.getEventByName(updateEventName).subscribe((eventRes) => {
        if (eventRes != null) {
          let jobdetails = JSON.parse(eventRes.jobdetails);
          let selectedRunType = jobdetails[0].runtime;
          this.corelid = jobdetails[0].last_refresh_event
          const requesting = this.reqBody();
          this.busy = this.eventsService.triggerPostEvent(updateEventName, requesting, selectedRunType['dsName']).subscribe((res) => {
            this.event_status = 'RUNNING'
            jobdetails[0]["last_refresh_event"] = res
            this.service.message(updateEventName + " Job Triggered Successfully", 'success');
            this.service.getEventStatus(res).subscribe(status => {
              this.event_status = status
              jobdetails[0]["last_refresh_status"] = this.event_status
              eventRes.jobdetails = JSON.stringify(jobdetails)
              this.busy = this.eventsService.createEvent(eventRes).subscribe((response) => {
                this.avail_refresh = true;
                this.corelid = jobdetails[0].last_refresh_event
              }, error => {
                this.service.message('Event not updated due to error: ' + error, 'error')
                this.avail_refresh = true;
              });
            });
            this.corelid = jobdetails[0].last_refresh_event
            this.setCorelId(this.selectedCard.id, this.corelid, updateEventName);
            // this.ngOnInit();
            this.refreshJobStatus(updateEventName)
          }, error => {
            this.service.message('Job not triggered due to error: ' + error, 'error')
            this.avail_refresh = true;
          });
        } else {
          this.service.errorMessage('Please check event ' + updateEventName)
        }
      }, error => {
        this.service.message('Job not triggered due to error: ' + error, 'error')
        this.avail_refresh = true;
      });
    }
    catch (Exception) {
      this.service.message('Some error occured', 'error');
    }
  }

  getCorelid(event: string) {
    if (this.selectedCard.event_details != null) {
      const filterEvent = this.filteredTopics.filter(eve => eve.eventName === event);
      if (filterEvent.length === 0) {
        return 0;
      }
      return filterEvent.map(eve => eve.corelId);
    } else {
      return 0
    }
  }

  reqBody() {
    let requestBody = {
      "environment": [
        {
          "key": "datasetId",
          "value": this.selectedCard.name
        },
        {
          "key": "org",
          "value": sessionStorage.getItem("organization")
        }
      ]
    };
    if (this.lanValue) {
      requestBody.environment.push({
        "key": "targetLanguage",
        "value": this.lanValue
      });
    }
    return requestBody;
  }

  setCorelId(dstid, corelid, name) {
    this.datasetService.savecorelId(dstid, corelid, name).subscribe((res) => {
      let dataset = res
      this.eventName = JSON.parse(dataset.event_details);
    }, error => {
      this.service.message('Error in corelId! ' + error)
      this.avail_refresh = true;
    }
    );
  }

  
  async refreshJobStatus(event: string) {
    if (event) {
      const corelId: string = this.getCorelid(event);
      if (corelId) {
        const id = corelId[0]
        if (id) {
          this.busy = this.eventsService.getEventByName(event).subscribe((eventRes) => {
            let jobdetails = JSON.parse(eventRes.jobdetails);
            let eventStat = jobdetails[0].last_refresh_status
            // if(this.stat){
            //   console.log("status in refresh if Stat", this.stat)
            if (eventStat == 'RUNNING') {
                (jobdetails[0].last_refresh_event).subscribe(
                status => {
                  this.event_status = status
                  jobdetails[0]["last_refresh_status"] = this.event_status
                  eventRes.jobdetails = JSON.stringify(jobdetails)
                  this.busy = this.eventsService.createEvent(eventRes).subscribe((response) => {
                    this.avail_refresh = true;
                    this.service.message('Status refreshed')
                  }, error => {
                    this.service.message('Event not updated due to error: ' + error, 'error')
                    this.avail_refresh = true;
                  });
                });
            } else {
              this.event_status = jobdetails[0].last_refresh_status
              this.service.message('Status refreshed')
            }
            //  else {
            //   this.event_status = ''
            // }
          });
          // });
        }
      }
    }
  }

  closeModal() {
    this.modalService.dismissAll();
  }

}
