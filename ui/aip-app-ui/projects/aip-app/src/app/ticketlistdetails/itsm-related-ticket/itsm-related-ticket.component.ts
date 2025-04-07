import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Location } from "@angular/common";
import { Services } from '../../services/service';
import { AdapterServices } from "../../adapter/adapter-service";
import { OptionsDTO } from "../../DTO/OptionsDTO";
import { PageResponse, Project } from 'com-lib-util';

@Component({
  selector: 'app-itsm-related-ticket',
  templateUrl: './itsm-related-ticket.component.html',
  styleUrl: './itsm-related-ticket.component.scss'
})
export class ItsmRelatedTicketComponent implements OnInit {


  @Input() ticketId: any;
  @Input() tickets: any;
  @Input() incident: any;

  isInstanceNameExist: boolean = false;
  isItsm: boolean = true;
  isInstanceNameConfigured: boolean = false;
  instanceNameDashConstantsKey: string = "icip.itsm.adapter-instance-name";
  instanceName: string;
  loadingPage: boolean = true;
  incidentbackup: any;
  adapterName: string;
  isInstanceExist: boolean = true;
  adapter: any;
  adapterInstances: any;
  adaptersOptions: OptionsDTO[] = [];
  datasetName: string;
  project: Project;
  projName: string;
  similarTickets: any;
  noSimilarTickets: boolean;
  loadingSimilarTickets: boolean;

  constructor(
    private service: Services,
    private adapterServices: AdapterServices,
    private changeDetectorRefs: ChangeDetectorRef,
    private _location: Location) { }

  ngOnInit() {
    this.ticketId;
    this.loadingSimilarTickets = true;
    this.project = JSON.parse(sessionStorage.getItem("project"));
    this.projName = this.project.name;
    let pagination: any = { page: 0, size: 100 };
    let example = {};
    let obj = [{ "or": { "property": "number", "equality": "=", "value": this.ticketId } }];
    example["or"] = obj;
    this.service.searchTicketsUsingDataset1("Tickets", this.projName, pagination, example).subscribe(
      (res) => {
        this.isInstanceNameConfigured = false;
        this.checkInstanceNameConfiguration();
        this.incident = res[0];
        this.incidentbackup = JSON.parse(JSON.stringify(this.incident));
        // this.changeDetectorRefs.detectChanges();
        // this.getSimilarTickets();

        this.changeDetectorRefs.detectChanges();
      }
    )
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
        this.getSimilarTickets();
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


  getSimilarTickets() {
    const body = { "query": this.incident };
    // let project = JSON.parse(sessionStorage.getItem("project"));
    // let projName = project.name;
    let pagination: any = { page: 0, size: 100 };
    let example = {};
    let obj = [{ "or": { "property": "number", "equality": "=", "value": this.incident.number } }];
    example["or"] = obj;

    //related tickets
    this.service.getAiOpsData('similarTickets', body, this.instanceName)
      .subscribe(
        (pageResponse: any) => {

          if (typeof pageResponse == "string" || typeof pageResponse.body.Answer == "string") {
            this.service.messageService(pageResponse, "error");
          }
          else {
            this.tickets = pageResponse.body.Answer[1].context[0].metadata.data.number;
          }
          // this.changeDetectorRefs.detectChanges();
          this.getTicketsData();
        },
        (error) => {
        }
      );
  }

  getTicketsData() {
    let pagination: any = { page: 0, size: 20 };
    let finalOrObj = { "or": [] };
    let paramObj = "";
    this.datasetName = "Tickets";

      this.tickets.forEach(param => {
        finalOrObj.or.push({ "or": { "property": "number", "equality": "like", "value": param } });
      })

    this.service.searchTicketsUsingDataset(this.datasetName, this.projName, pagination, finalOrObj, paramObj)
      .subscribe(
        (pageResponse: any) => {
          if (typeof pageResponse == "string") {
            this.service.messageService(pageResponse, "error");
          }
          else {
            pageResponse.forEach((element) => {
              if (element) {
                Object.entries(element).forEach(([key, value]) => {
                  if (value) {
                    element[key] = value.toString();
                  }
                });
              }
            });
            this.similarTickets = pageResponse;
            this.loadingSimilarTickets = false;
            if(this.similarTickets[0].number !== null && this.similarTickets[0].number !== undefined && this.similarTickets[0].number !== "") {
              this.noSimilarTickets = false;
            } else {
              this.noSimilarTickets = true;
            }
          }
          this.changeDetectorRefs.detectChanges();
        }
      )
  };

  navigateBack() {
    this._location.back();
  }
}
