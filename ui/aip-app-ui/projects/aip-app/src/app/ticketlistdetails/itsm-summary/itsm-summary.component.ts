import { Component, Input, ChangeDetectorRef,EventEmitter,Output } from '@angular/core';
import { Location } from "@angular/common";
import { Subscription } from "rxjs";
import { EventsService } from "../../services/event.service";
import { Services } from '../../services/service';

@Component({
  selector: 'app-itsm-summary',
  templateUrl: './itsm-summary.component.html',
  styleUrl: './itsm-summary.component.scss'
})
export class ItsmSummaryComponent {
  @Input() incident: any;
  @Input() updatechild: any;
  @Input() ticketId: any;
  @Output() updateSuccess = new EventEmitter<boolean>();

  busy: Subscription;
  tooltipPoition: string = 'above';
  incidentbackup: any;

  state1: string[] = [];
  category: string[] = [];
  assignmentGroup: string[] = [];
  assignee: string[] = [];
  configurationItem: string[] = [];
  priorityy: string[] = [];
  sop: string[] = [];
  workflow: string[] = [];


  zz: boolean = false;
  daata: any;
  daata1: any;

  constructor(private _location: Location,
    private service: Services,
    private changeDetectorRefs: ChangeDetectorRef,
    private eventsService: EventsService) { }


  ngOnInit() {
    let projName = JSON.parse(sessionStorage.getItem("project")).name;
    let pagination: any = { page: 0, size: 100 };
    let example = {};
    // let ticketId = this.incident.number;
    let obj = [{ "or": { "property": "number", "equality": "=", "value": this.ticketId } }];
    example["and"] = obj;
    this.service.searchTicketsUsingDataset1("Tickets", projName, pagination, example).subscribe(
      (res) => {
        // this.isInstanceNameConfigured = false;
        // this.checkInstanceNameConfiguration();
        this.incident = res[0];
        this.incidentbackup = JSON.parse(JSON.stringify(this.incident));
        // this.changeDetectorRefs.detectChanges();

        //fetching Snow Tool Metdata 
        this.busy = this.service.getDataset('LEOMTDTP69578').subscribe((res) => {
          let kk = res;
          let pagination: any = { page: 0, size: 100 };
          this.service.getPaginatedDetails(kk, pagination).subscribe((res) => {
            this.daata = res.body;
            this.statusData();
          });
        });
        //fetching SOP Configuration data 
        this.busy = this.service.getDataset('ACMSPCNF36673').subscribe((res) => {
          let kk = res;
          let pagination: any = { page: 0, size: 100 };
          this.service.getPaginatedDetails(kk, pagination).subscribe((res) => {
            this.daata1 = res.body;
            this.sopData();
          });
        });
        this.changeDetectorRefs.detectChanges();
      }
    )
  }
  ngOnChanges(changes) {
    if (changes?.updatechild?.currentValue===true){
      this.updateTicket();
      this.updatechild = false;
    } 
  }
  statusData() {
    if (!this.daata) {
      console.error("daata is not defined or has no value");
      return; // Exit early if daata is not available

    }

    // Ensure arrays are initialized to avoid potential errors
    this.state1 = [];
    this.category = [];
    this.assignmentGroup = [];
    this.assignee = [];
    this.configurationItem = [];
    this.priorityy = [];

    for (const item of this.daata) {
      try {
        // Use optional chaining for safer property access
        if (item?.type === "state") {
          this.state1.push(item?.displayValue);
        } else if (item?.type === "category") {
          this.category.push(item?.displayValue);
        } else if (item?.type === "assignmentGroup") {
          this.assignmentGroup.push(item?.displayValue);
        } else if (item?.type === "assignee") {
          this.assignee.push(item?.displayValue);
        } else if (item?.type === "configurationItem") {
          this.configurationItem.push(item?.displayValue);
        } else if (item?.type === "priority") {
          this.priorityy.push(item?.displayValue);
        }
      } catch (error) {
        console.error("Error processing item:", error); // Log any errors during processing
      }
    }

  }

  sopData() {
    if (!this.daata1) {
      console.error("daata is not defined or has no value");
      return; // Exit early if daata is not available

    }
    this.sop = [];
    this.workflow = [];
    this.daata1.forEach(item => {
      this.sop.push(item.sop);
      this.workflow.push(item.workflow);
    });

  }


  navigateBack() {
    this._location.back();
  }

  updateTicket() {
    const eventName = 'updateIncident';
    let requestBody = {
      "environment": [
        {
          "name": "incidentPayload",
          "value": JSON.stringify(this.incident)
        }
      ]
    };
    let selectedRunType: any;
    this.busy = this.eventsService.getEventByName(eventName).subscribe((eventRes) => {
      let jobdetails = JSON.parse(eventRes.jobdetails);
      selectedRunType = jobdetails[0].runtime;

      this.busy = this.eventsService.triggerPostEvent(eventName, requestBody, selectedRunType['dsName']).subscribe((res) => {
        this.service.message("Job Triggered Successfully", 'success');
        this.updateSuccess.emit(true);

      }, error => {
        this.service.message('Job not triggered due to error: ' + error, 'error')
        this.updateSuccess.emit(true);
      });

    }, error => {
      this.service.message('Job not triggered due to error: ' + error, 'error');
      this.updateSuccess.emit(true);
    });



  }

  refresh() {
    this.incident = JSON.parse(JSON.stringify(this.incidentbackup));
  }


  triggerAio() {
    let eventName = "ticketAIO";

    let requestBody = {
      "environment": [
        {
          "key": "incidentPayload",
          "value": JSON.stringify(this.incident)
        }
      ]
    };
    let selectedRunType: any;
    this.busy = this.eventsService.getEventByName(eventName).subscribe((eventRes) => {
      let jobdetails = JSON.parse(eventRes.jobdetails);
      selectedRunType = jobdetails[0].runtime;

      this.busy = this.eventsService.triggerPostEvent(eventName, requestBody, selectedRunType['dsName']).subscribe((res) => {
        this.service.message("Job Triggered Successfully", 'success');

      }, error => this.service.message('Job not triggered due to error: ' + error, 'error'));

    }, error => this.service.message('Job not triggered due to error: ' + error, 'error'));


  }

  triggerResolve() {
    let eventName = "GenericWorkflowResolver";

    let requestBody = {
      "environment": [
        {
          "key": "incidentPayload",
          "value": JSON.stringify(this.incident)
        }
      ]
    };
    let selectedRunType: any;
    this.busy = this.eventsService.getEventByName(eventName).subscribe((eventRes) => {
      let jobdetails = JSON.parse(eventRes.jobdetails);
      selectedRunType = jobdetails[0].runtime;

      this.busy = this.eventsService.triggerPostEvent(eventName, requestBody, selectedRunType['dsName']).subscribe((res) => {
        this.service.message("Job Triggered Successfully", 'success');

      }, error => this.service.message('Job not triggered due to error: ' + error, 'error'));

    }, error => this.service.message('Job not triggered due to error: ' + error, 'error'));


  }


  onChanginDatasource(Data) {
    this.zz = true;

  }

}
