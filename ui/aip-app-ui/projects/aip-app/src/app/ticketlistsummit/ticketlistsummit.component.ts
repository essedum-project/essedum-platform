import { Component } from '@angular/core';
import { Services } from '../services/service';
import { Router } from '@angular/router';
import { DatePipe, Location } from "@angular/common";
import { EventsService } from '../services/event.service';

@Component({
  selector: 'app-ticketlistsummit',
  templateUrl: './ticketlistsummit.component.html',
  styleUrls: ['./ticketlistsummit.component.scss']
})
export class TicketlistsummitComponent {
  incident: any = {
    approval
      :
      null,
    assignedDate
      :
      null,
    assignedto
      :
      null,
    assignmentgroup
      :
      null,
    business_service
      :
      null,
    caller
      :
      null,
    category
      :
      null,
    closecode
      :
      null,
    closedDate
      :
      null,
    closedby
      :
      null,
    closenotes
      :
      null,
    clustername
      :
      null,
    comments
      :
      null,
    configurationItem
      :
      null,
    createdDate
      :
      null,
    createdby
      :
      null,
    description
      :
      null,
    duedate
      :
      null,
    impact
      :
      null,
    lastUpdated
      :
      null,
    last_updated_by
      :
      null,
    location
      :
      null,
    number
      :
      null,
    openedDate
      :
      null,
    price
      :
      null,
    priority
      :
      null,
    remshortdescription
      :
      null,
    remshortdescriptioncopy
      :
      null,
    reopenedDate
      :
      null,
    request_state
      :
      null,
    requested_by
      :
      null,
    requested_for
      :
      null,
    resolutionCategory
      :
      null,
    resolution_steps
      :
      null,
    resolvedDate
      :
      null,
    resolvedby
      :
      null,
    risk
      :
      null,
    severity
      :
      null,
    shortdescription
      :
      null,
    sladueDate
      :
      null,
    sop
      :
      null,
    source
      :
      null,
    special_instructions
      :
      null,
    state
      :
      null,
    sysId
      :
      null,
    tags
      :
      null,
    taskType
      :
      null,
    type
      :
      null,
    updatedDate
      :
      null,
    updatedby
      :
      null,
    workflow
      :
      null,
      urgency:null,
  };
  countt: String;
  j1: number;
  busy1: any;
  daata: any;
  category: string[] = [];
  caller: string[] = [];
  impact: string[] = [];
  urgency: string[] = [];
  assignmentGroup: string[] = [];
  assignee: string[] = [];
  configurationItem: string[] = [];
  priorityy: string[] = [];
  state1: string[] = [];
  workflow: string[] = [];
  sop: string[] = [];
  daata1: any;
  constructor(


    public router: Router,

    private service: Services,

    private _location: Location,
 
    private eventsService: EventsService
  ) {

  }
  ngOnInit() {

    // let state = this._location.getState()
    // this.incident =  state['dsname'];
    // this.incidentbackup = JSON.parse(JSON.stringify(this.incident));
    // this.pp=[];
    // this.pp1=[];
    // this.pp2=[];

    // console.log(" incident data is :::",this.incident);
    //fetching Snow Tool Metdata 
    this.busy1 = this.service.getDataset('LEOMTDTP69578').subscribe((res) => {
      let kk = res;
      let pagination: any = { page: 0, size: 100 };
      this.service.getPaginatedDetails(kk, pagination).subscribe((res) => {
        console.log("data is:::::::", res);
        this.daata = res.body;

        this.statusData();

      });

    });

    this.busy1 = this.service.getDataset('ACMSPCNF36673').subscribe((res) => {
      let kk = res;
      let pagination: any = { page: 0, size: 100 };
      this.service.getPaginatedDetails(kk, pagination).subscribe((res) => {
        console.log("data is:::::::", res);
        this.daata1 = res.body;

        this.sopData();

      });

    });


  }

  createTicket() {  
    const createEventName = 'createIncident';
    const payload = {
      "short_description": this.incident.shortdescription,
      "state": this.incident.state,
      "pritory": this.incident.priority,
      "category": this.incident.category,
      "assignment_group": this.incident.assignmentgroup,
      "assigned_to": this.incident.assignedto,
      "caller": this.incident.caller,
      "impact": this.incident.impact,
      "urgency": this.incident.urgency,
      "configuration_item": this.incident.configurationItem,
      "description": this.incident.description
    };
    let requestBody = {
      "environment": [
        {
          "key": "incidentPayload",
          "value": JSON.stringify(payload)
        }
      ]
    };
    let selectedRunType: any;

    this.busy1 = this.eventsService.getEventByName(createEventName).subscribe((eventRes) => {
      let jobdetails = JSON.parse(eventRes.jobdetails);
      selectedRunType = jobdetails[0].runtime;

      this.busy1 = this.eventsService.triggerPostEvent(createEventName, requestBody, selectedRunType['dsName']).subscribe((res) => {
        this.service.message("Job Triggered Successfully", 'success');
        this._location.back();

      }, error => this.service.message('Job not triggered due to error: ' + error, 'error'));

    }, error => this.service.message('Job not triggered due to error: ' + error, 'error'));
  
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
    this.caller=[];
    this.impact=[];
    this.urgency=[];

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
        }else if (item?.type === "caller") {
          this.caller.push(item?.displayValue);
        }
        else if (item?.type === "impact") {
          this.impact.push(item?.displayValue);
        }
        else if (item?.type === "urgency") {
          this.urgency.push(item?.displayValue);
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
    console.log("valufe of sopis", this.sop);
    console.log("valufe of  workfloe is", this.workflow);

  }
  navigateBack() {
    this._location.back();
  }

}
