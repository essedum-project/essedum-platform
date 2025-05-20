import { Component, Input, OnInit } from '@angular/core';
import { LedsLibService, LedsModalService } from 'leds-lib';
import { Services } from '../../services/service';
import { LocationStrategy } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OpenTelemetryService } from 'com-lib-util';

@Component({
  selector: 'app-endpoint-edit',
  templateUrl: './endpoint-edit.component.html',
  styleUrls: ['./endpoint-edit.component.scss'],
})
export class EndpointEditComponent implements OnInit{
  data: any={};
  keys :any;
  Platform: any;
  EndpointName: any;
  EndpointId: any;
  Description: any;
  ModelName: any;
  ConnectionDetails: any;
  APISpecification: any;
  Sample: any;
  cardTitle='Edit Endpoint';
  capKeys: any;
  local:boolean= false;
  options: any = [];
  constructor(
    private ledsLibService: LedsLibService,
    private telemetry: OpenTelemetryService,
    private service: Services,
    private modalService: LedsModalService,
    private route: ActivatedRoute,
    private router: Router,
    private location: LocationStrategy
  ) {}

  telemetryCall(){
    this.telemetry.startTelemetry('aip-app','EndpointEditComponent', sessionStorage.getItem('organization'));
  }
  ngOnInit(): void {
    this.telemetryCall();
    let cards = this.location.getState();
    this.data = cards['card'];
    if (this.data.adapterId=='Local') {
      this.local=true
    }
    this.capKeys = [];
    this.keys=Object.keys(this.data);
    this.keys.forEach((element) => {
      element = element.split(/(?=[A-Z])/).join(' ');
      this.capKeys.push(element);
      // console.log(element, 'element');
    });
    this.getRestProviders();
  }
  routeBackToModelList() {
    this.location.back()
  }
  showTabContent = (eventObj: any) => {
    this.ledsLibService.showTabContent(eventObj);
  };
  editEndpoint() {
    console.log('editEndpoint');
  }
  updateEndpoint() {
    // console.log('form dets',this.userForm);
    // this.data.keys = this.keys;
    console.log(this.data);
    this.modalService.dismissAll("close the modal");
    this.service.updateEndpoint(this.data).subscribe((resp) => {
      console.log(resp);
      this.service.messageService(resp,"Done! Endpoint is updated.");
      //this.telemetry.addTelemetryEvent('Endpoint updated');
      this.router.navigate(['../'], { relativeTo: this.route });
    },error=>{this.service.messageService(error);});
  }
  closeModal(){
    this.modalService.dismissAll();
  }

  onRestProviderChange() {
    this.data['swaggerData'] = "";  // Reset swaggerData to an empty string
  }
  getRestProviders() {
    this.service.getRestProviders(sessionStorage.getItem("organization")).subscribe((resp) => {
      let conNames: any = [];
      resp.forEach((a) => {
        let conn = { viewValue: a.alias, value: a.name };
        conNames.push(conn);
      });
      this.options = conNames;
    });
  }
  ngOnDestroy(): void {
    let activeSpan = this.telemetry.fetchActiveSpan();
    this.telemetry.endTelemetry(activeSpan);
  }
}