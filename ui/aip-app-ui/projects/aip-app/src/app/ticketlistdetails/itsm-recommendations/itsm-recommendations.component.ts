import { DatePipe, Location } from "@angular/common";
import { Services } from '../../services/service';
import { Component, OnInit, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, OnDestroy, Pipe, PipeTransform, Type, Input, Output, Injector, EventEmitter } from "@angular/core";
import { Subscription, Subject, ReplaySubject, forkJoin } from "rxjs";
import { EventsService } from "../../services/event.service";
import { AdapterServices } from "../../adapter/adapter-service";
import { OptionsDTO } from "../../DTO/OptionsDTO";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-itsm-recommendations',
  templateUrl: './itsm-recommendations.component.html',
  styleUrl: './itsm-recommendations.component.scss'
})
export class ItsmRecommendationsComponent implements OnInit, OnChanges {

  @Input() incident: any;
  @Input() ticketId: any;
  @Input() callResolve: any;
  @Output() updateSuccessResolved = new EventEmitter<boolean>();

  state: string[] = [];
  tooltipPoition: string = 'above';
  chatUrl: string;
  selectedTab: string;
  showAll: boolean = false;
  type: string = "secondary";
  headerBg: string = "transparent";

  constructor(
    private service: Services,
    private _location: Location,
    private changeDetectorRefs: ChangeDetectorRef,
    private eventsService: EventsService,
    private adapterServices: AdapterServices,
    private route: ActivatedRoute
  ) { }
  loadingPage: boolean = true;
  isInstanceNameConfigured: boolean = false;
  isTicketSummaryLoading: boolean = true;
  isRecommendedResolution: any;
  isRecommendedResolutionLoading: boolean = true;
  recommendedResolutionSLA: any;
  recommendedResolution: any;
  recommendedAssignee: any = "";
  automatedFollowUps: any = "";
  firstResponse: any = "";
  predictedPriority: any = "";
  relatedEntities: any = "";
  sentimentAnalysis: any = "";
  languageTranslation: any = "";
  incidentCategory: any = "";
  recommendedAssignmentGroup: any = "";
  instanceName: string;
  adapter: any;
  tickets: any;
  ticketSummary: any;
  isTicketSummary: any;
  busy: Subscription;
  adapterInstances: any;
  adaptersOptions: OptionsDTO[] = [];
  instanceNameDashConstantsKey: string = "icip.itsm.adapter-instance-name";
  isInstanceNameExist: boolean = false;
  adapterName: string;
  incidentbackup: any;
  busy1: any;
  daata: any;
  daata1: any;
  isInstanceExist: boolean = true;
  sop: string[] = [];
  workflow: string[] = [];
  category: string[] = [];
  assignmentGroup: string[] = [];
  assignee: string[] = [];
  configurationItem: string[] = [];
  priorityy: string[] = [];
  state1: string[] = [];
  fetchCompleted: boolean = true;
  ticketList: any[] = [];
  ticketListBackup: any[] = [];


  genAIAssistList = [
    {
      "viewValue": "Automated FollowUps",
      "value": "automatedFollowUps",
      "data": this.automatedFollowUps,
      "loading": true,
      "isAIOps": true
    },
    {
      "viewValue": "First Response",
      "value": "firstResponse",
      "data": this.firstResponse,
      "loading": true,
      "isAIOps": true
    },
    {
      "viewValue": "Predicted Priority",
      "value": "priorityPrediction",
      "data": this.predictedPriority,
      "loading": true,
      "isAIOps": true
    },
    {
      "viewValue": "Related Entities",
      "value": "entities",
      "data": this.relatedEntities,
      "loading": true,
      "isAIOps": true
    },
    {
      "viewValue": "Ticket Sentiment",
      "value": "sentimentAnalysis",
      "data": this.sentimentAnalysis,
      "loading": true,
      "isAIOps": true
    },
    {
      "viewValue": "Incident Category",
      "value": "incidentCategorization",
      "data": this.incidentCategory,
      "loading": true,
      "isAIOps": true
    },
    {
      "viewValue": "Assignee Group",
      "value": "recommendedAssignee",
      "data": this.recommendedAssignee,
      "loading": true,
      "isAIOps": false,
    },
    {
      "viewValue": "Assignment Group",
      "value": "recommendedAssignmentGroup",
      "data": this.recommendedAssignmentGroup,
      "loading": true,
      "isAIOps": false
    }
  ];

  dataMap: { [key: string]: any } = {
    recommendedAssignee: this.recommendedAssignee,
    recommendedAssignmentGroup: this.recommendedAssignmentGroup,
    automatedFollowUps: this.automatedFollowUps,
    firstResponse: this.firstResponse,
    incidentCategorization: this.incidentCategory,
    priorityPrediction: this.predictedPriority,
    entities: this.relatedEntities,
    sentimentAnalysis: this.sentimentAnalysis
  };
  ngOnInit() {
    this.ticketId;
    let projName = JSON.parse(sessionStorage.getItem("project")).name;
    let pagination: any = { page: 0, size: 100 };
    let example = {};
    let obj = [{ "or": { "property": "number", "equality": "=", "value": this.ticketId } }];
    example["and"] = obj;
    this.service.searchTicketsUsingDataset1("Tickets", projName, pagination, example).subscribe(
      (res) => {
        this.isInstanceNameConfigured = false;
        this.checkInstanceNameConfiguration();
        this.incident = res[0];
        this.incidentbackup = JSON.parse(JSON.stringify(this.incident));
        // this.changeDetectorRefs.detectChanges();
        this.getRecommendationData();

        //fetching Snow Tool Metdata 
        this.busy1 = this.service.getDataset('LEOMTDTP69578').subscribe((res) => {
          let kk = res;
          let pagination: any = { page: 0, size: 100 };
          this.service.getPaginatedDetails(kk, pagination).subscribe((res) => {
            this.daata = res.body;
            this.statusData();
          });
        });
        //fetching SOP Configuration data 
        this.busy1 = this.service.getDataset('ACMSPCNF36673').subscribe((res) => {
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
    if (changes?.callResolve?.currentValue === true) {
      this.callResolve = false;

      this.triggerResolve();
      this.updateSuccessResolved.emit(true);

    }
  }
  getRecommendationData() {
    const body = { "query": this.incident };

    let project = JSON.parse(sessionStorage.getItem("project"));
    let projName = project.name;
    let pagination: any = { page: 0, size: 100 };
    let example = {};
    let obj = [{ "or": { "property": "number", "equality": "=", "value": this.incident.number } }];
    example["and"] = obj;

    //fetching data from Tickets Enriched dataset i.e. ACMTCKTS76661
    this.service.searchTicketsUsingDataset1("ACMTCKTS76661", projName, pagination, example)
      .subscribe(

        (pageResponse) => {
          this.recommendedAssignmentGroup = pageResponse[0].predicted_assignment_group;
          this.recommendedAssignee = pageResponse[0].predicted_assignee;
          // this.genAIAssist(this.genAIAssistData);
        },
        (error) => {
          this.fetchCompleted = false;

          // this.service.message('Could not get the results', 'error');

          this.ticketList = this.ticketListBackup;
        }
      );

    //fetching coun and data from Genai Recommendations dataset i.e. LEOGNRCM43086
    this.service.getSearchCount1("LEOGNRCM43086", projName, example).
      subscribe(resp => {
        if (resp) {
          if (resp.startsWith("Error: ")) {

          }
          else {
            let response: number = +resp;
            if (response < 1) {
              // this.saveRecommendationData("insert");
            }
          }
        }
      },
        (error) => console.log(error)
      )

    this.service.searchTicketsUsingDataset1("LEOGNRCM43086", projName, pagination, example)
      .subscribe(

        (pageResponse) => {
          // this.recommendedSOP = pageResponse[0].sop;
          this.isTicketSummaryLoading = false;
          this.isRecommendedResolutionLoading = false;

          this.recommendedResolution = pageResponse[0].recommendedResolution;
          this.predictedPriority = pageResponse[0].priority;
          this.firstResponse = pageResponse[0].firstResponse;
          this.automatedFollowUps = pageResponse[0].automatedFollowUps;
          this.incidentCategory = pageResponse[0].incidentCategorization;
          this.sentimentAnalysis = pageResponse[0].sentimentAnalysis;
          this.languageTranslation = pageResponse[0].languageTranslation;
          this.ticketSummary = pageResponse[0].ticketSummary;
          this.relatedEntities = pageResponse[0].entities;

          if (this.relatedEntities) {
            try {
              if (typeof this.relatedEntities == "string")
                this.relatedEntities = JSON.parse(this.relatedEntities.split('}')[0] + '}').named_entities;
              else
                this.relatedEntities = this.relatedEntities.named_entities;
            } catch (error) {
              this.relatedEntities = "";
              console.error("Error in parsing related entities: ", error);
            }

          }


          if (!this.ticketSummary) {
            this.isTicketSummaryLoading = true;
            this.service.getAiOpsData('ticketSummarization', body, this.instanceName).subscribe((res) => {
              this.isTicketSummaryLoading = false;
              this.ticketSummary = res.body.Answer;
              this.isTicketSummary = !res || !res.body || !res.body.Answer;
              this.changeDetectorRefs.detectChanges();
              // this.saveRecommendationData("update");
            }, () => (this.isTicketSummaryLoading = false));

          }

          // //related tickets
          // this.busy = this.service.getAiOpsData('similarTickets', body, this.instanceName)
          //   .subscribe(
          //     (pageResponse: any) => {
          //       if (typeof pageResponse == "string" || typeof pageResponse.body.Answer == "string") {
          //         this.service.messageService(pageResponse, "error");
          //       }
          //       else {
          //         this.tickets = pageResponse.body.Answer[1].context[0].metadata.data;
          //       }
          //     },
          //     (error) => {
          //       // this.service.messageService("Could not get the results", "error");
          //     }
          //   );

          if (!this.recommendedResolution) {
            this.isRecommendedResolutionLoading = true;
            this.service.getAiOpsData('recommendedResolution', body, this.instanceName).subscribe((res) => {
              this.isRecommendedResolutionLoading = false;
              this.recommendedResolution = res.body.Answer;
              this.isRecommendedResolution = !res || !res.body || !res.body.Answer;
              this.changeDetectorRefs.detectChanges();
              // this.saveRecommendationData("update");

            }, () => (this.isRecommendedResolutionLoading = false));
          }

          this.dataMap.recommendedAssignee = this.recommendedAssignee;
          this.dataMap.recommendedAssignmentGroup = this.recommendedAssignmentGroup;
          this.dataMap.automatedFollowUps = this.automatedFollowUps;
          this.dataMap.firstResponse = this.firstResponse;
          this.dataMap.incidentCategorization = this.incidentCategory;
          this.dataMap.priorityPrediction = this.predictedPriority;
          this.dataMap.entities = this.relatedEntities;
          this.dataMap.sentimentAnalysis = this.sentimentAnalysis;
          this.dataMap.ticketSummary = this.ticketSummary;
          this.dataMap.recommendedResolution = this.recommendedResolution;

          this.genAIAssistList.forEach((element) => {
            if (this.dataMap.hasOwnProperty(element.value)) {
              element.data = this.dataMap[element.value];
              element.loading = false;
            }
            if (element.isAIOps && (!element.data || element.data == "")) {
              if (element.value == 'entities') {
                // if(!element.data || element.data == ""){
                element.loading = true;
                this.service.getAiOpsData(element.value, body, this.instanceName).subscribe((res) => {
                  element.data = res.body.Answer;
                  if (element.data) {
                    try {
                      if (typeof element.data == "string")
                        element.data = JSON.parse(element.data.split('}')[0] + '}').named_entities;
                      else
                        element.data = element.data.named_entities;
                    } catch (error) {
                      element.data = "";
                      console.error("Error in parsing related entities: ", error);
                    }
                  }
                  if (this.dataMap.hasOwnProperty(element.value)) {
                    this.dataMap[element.value] = element.data;
                    element.data = this.dataMap[element.value];
                  }
                  element.loading = false;
                  this.changeDetectorRefs.detectChanges();
                }, () => (element.loading = false));
                // }
                // } else if(!element.data || element.data == ""){
              } else {
                element.loading = true;
                this.service.getAiOpsData(element.value, body, this.instanceName).subscribe((res) => {
                  element.data = res.body.Answer;
                  if (this.dataMap.hasOwnProperty(element.value)) {
                    this.dataMap[element.value] = element.data;
                    element.data = this.dataMap[element.value];
                  }
                  element.loading = false;
                  this.changeDetectorRefs.detectChanges();
                }, () => (element.loading = false));
                // }
              }
            }
          });

        },
        (error) => {
          this.fetchCompleted = false;

          // this.service.message('Could not get the results', 'error');

          this.ticketList = this.ticketListBackup;
        }
      );
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


  splitLines(text: string) {
    if (text) {
      let textList = text.split('\n');
      return textList;
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

  checkInstanceNameConfiguration() {
    this.findAllAdapters();
    this.service.getConstantByKey(this.instanceNameDashConstantsKey).subscribe((res) => {
      if (res.body) {
        this.instanceName = res.body;
        this.isInstanceNameExist = true;
        this.isInstanceNameConfigured = true;
        this.loadingPage = false;
        this.checkIsInstanceExist();
      } else {
        this.loadingPage = false;
        this.isInstanceNameConfigured = false;
      }
    });
  }


  checkIsInstanceExist() {
    this.adapterServices.getInstanceByNameAndOrganization(this.instanceName).subscribe((res) => {
      if (res && res.adaptername) {
        this.adapterName = res.adaptername;
        this.adapterServices.getAdapteByNameAndOrganization(this.adapterName).subscribe((resAdp) => {
          if (resAdp) {
            this.isInstanceExist = true;
            this.adapter = resAdp;
          } else {
            this.isInstanceExist = false;
          }
        });
      } else {
        this.isInstanceExist = false;
      }
    });

  }

  findAllAdapters() {
    this.adapterServices.getMlInstanceNamesByOrganization()
      .subscribe(res => {
        this.adapterInstances = res;
        this.adapterInstances.forEach((insNamr) => {
          this.adaptersOptions.push(new OptionsDTO(insNamr, insNamr));
        });
      });
  }

  navigateBack() {
    this._location.back();
  }

  refreshRecommendationData() {
    const body = { "query": this.incident };

    this.isTicketSummaryLoading = true;
    this.isRecommendedResolutionLoading = true;

    this.genAIAssistList.forEach((element) => {
      element.data = "";
      if (element.isAIOps) {
        if (element.value == 'entities') {
          // if(!element.data || element.data == ""){
          element.loading = true;
          this.service.getAiOpsData(element.value, body, this.instanceName).subscribe((res) => {
            element.data = res.body.Answer;
            if (element.data) {
              try {
                if (typeof element.data == "string")
                  element.data = JSON.parse(element.data.split('}')[0] + '}').named_entities;
                else
                  element.data = element.data.named_entities;
              } catch (error) {
                element.data = "";
                console.error("Error in parsing related entities: ", error);
              }
            }
            if (this.dataMap.hasOwnProperty(element.value)) {
              this.dataMap[element.value] = element.data;
              element.data = this.dataMap[element.value];
            }
            element.loading = false;
          }, () => (element.loading = false));
          // }
          // } else if(!element.data || element.data == ""){
        } else {
          element.loading = true;
          this.service.getAiOpsData(element.value, body, this.instanceName).subscribe((res) => {
            element.data = res.body.Answer;
            if (this.dataMap.hasOwnProperty(element.value)) {
              this.dataMap[element.value] = element.data;
              element.data = this.dataMap[element.value];
            }
            element.loading = false;
          }, () => (element.loading = false));
          // }
        }
      }
    });

    // this.service.getAiOpsData('priorityPrediction', body, this.instanceName).pipe(
    // ).subscribe((res) => {
    //   this.predictedPriority = res.body.Answer;
    // });

    // this.service.getAiOpsData('ticketSentiment', body, this.instanceName).pipe(
    // ).subscribe((res) => {
    //   this.ticketSentiment = res.body.Answer;
    // });

    // this.service.getAiOpsData('incidentCategorization', body, this.instanceName).pipe(
    // ).subscribe((res) => {
    //   this.incidentCategory = res.body.Answer;
    // });

    // this.service.getAiOpsData('firstResponse', body, this.instanceName).pipe(
    // ).subscribe((res) => {
    //   this.firstResponse = res.body.Answer;
    // });

    // this.service.getAiOpsData('automatedFollowUps', body, this.instanceName).pipe(
    // ).subscribe((res) => {
    //   this.automatedFollowUps = res.body.Answer;
    // });

    this.service.getAiOpsData('ticketSummarization', body, this.instanceName).pipe(
    ).subscribe((res) => {
      this.ticketSummary = res.body.Answer;
      this.isTicketSummaryLoading = false;
      this.changeDetectorRefs.detectChanges();
    });

    this.service.getAiOpsData('recommendedResolution', body, this.instanceName).pipe(
    ).subscribe((res) => {
      this.recommendedResolution = res.body.Answer;
      this.isRecommendedResolutionLoading = false;
      this.changeDetectorRefs.detectChanges();
    });

    // this.service.getAiOpsData('entities', body, this.instanceName).pipe(
    // ).subscribe((res) => {
    //   this.relatedEntities = res.body.Answer;
    //   if(this.relatedEntities){
    //     try {
    //       this.relatedEntities = JSON.parse(this.relatedEntities.split('}')[0] + '}').named_entities;
    //     } catch (error) {
    //       this.relatedEntities = "";
    //       console.error("Error in parsing related entities: ", error);
    //     }
    //   }      
    // });

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
    const body = { "query": this.incident };

    this.service.getAiOpsData('resolveTickets', body, this.instanceName)
    .subscribe(
      (pageResponse: any) => {
        this.service.message("Job Triggered Successfully", 'success');
        this.updateSuccessResolved.emit(true);
      });
    // this.busy = this.eventsService.getEventByName(eventName).subscribe((eventRes) => {
    //   try{
    //   let jobdetails = JSON.parse(eventRes.jobdetails);
    //   selectedRunType = jobdetails[0].runtime;
    //   }
    //   catch (error) {
    //     this.updateSuccessResolved.emit(true);
      
    //   }

    //   this.busy = this.eventsService.triggerPostEvent(eventName, requestBody, selectedRunType['dsName']).subscribe((res) => {
    //     this.service.message("Job Triggered Successfully", 'success');
    //     this.updateSuccessResolved.emit(true);

    //   }, error => {
    //     this.service.message('Job not triggered due to error: ' + error, 'error');
    //     this.updateSuccessResolved.emit(true);
    //   });


    // }, error => {
    //   this.service.message('Job not triggered due to error: ' + error, 'error');
    //   this.updateSuccessResolved.emit(true);
    // });

  }
}
