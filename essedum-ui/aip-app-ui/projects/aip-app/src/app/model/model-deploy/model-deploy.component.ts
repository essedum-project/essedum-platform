import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../../services/service';
import { FormBuilder } from '@angular/forms';
//import { LedsModalService } from 'leds-lib';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import { LocationStrategy } from '@angular/common';
//import { LeapTelemetryService, OpenTelemetryService } from 'com-lib-util';
@Component({
  selector: 'app-model-deploy',
  templateUrl: './model-deploy.component.html',
  styleUrls: ['./model-deploy.component.scss'],
})
export class ModelDeployComponent {
  data: any={};
  keys: any;
  values: any;
  appModifiedBy: any;
  datasetTypes = [];
  attributes: any;
  name: any;
  cardTitle = 'Deploy Model';
  adapterId: any;
  options: any = [];
  serving : any = ['Custom','Triton','Djl'];
  servingOptions:any =[];
  computes :any =['CPU','GPU'];
  computesOptions :any =[];
  optionid: any = [];
  relatedbody: any = [];
  message: any;
  endpointId:number;
  panelClass: string | string[];
  // uischema;
  // jsonData = {};
  // renderers = angularMaterialRenderers;

  constructor(
   // private telemetryService: LeapTelemetryService,
   // private telemetry: OpenTelemetryService,
    private service: Services,
    //private modalService: LedsModalService,
    private location: LocationStrategy,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  // telemetryCall(){
  //   this.telemetry.startTelemetry('aip-app','ModelDeployComponent', sessionStorage.getItem('organization'));
  // }

  ngOnInit(): void {
   // this.telemetryCall();
    //this.telemetryImpression();
    let data: any;
    let cards = this.location.getState();
    this.data = cards['card'];
    data = sessionStorage.getItem('user');
    this.appModifiedBy = JSON.parse(data).user_f_name;
    this.data.appModifiedBy = this.appModifiedBy;
    console.log(this.data, 'data');
    this.adapterId = this.data.adapterId;
    this.getDeployModelJson();
    this.getUniqueEndpoint();
    this.serving.forEach((e)=>{
      this.servingOptions.push({ viewValue: e, value: e });
    });
    this.computes.forEach((e)=>{
      this.computesOptions.push({ viewValue: e, value: e });
    });

  }

  // telemetryImpression() {
  //   this.telemetryService.start();
  //   this.telemetryService.impression("aip-app", "list", "ModelDeployComponent");
  // }
  
  routeBackToModelList() {
    // this.router.navigate(['../'], { relativeTo: this.route });
    this.location.back();
  }
  getUniqueEndpoint() {
    this.service.getUniqueEndpointList(this.adapterId).subscribe((resp) => {
      let endid: any = [];
      resp.forEach((e) => {
        let ep = { viewValue: e.appName, value: e.fedId ,value2: e.id };
        endid.push(ep);
      });
      this.options = endid;
      

      // this.options = resp.appName;
      console.log(resp);
      console.warn(resp);
      // alert(Object.keys(this.attributes));
    });
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }

  getDeployModelJson() {
    let label: any = [];
    this.service.getDeployModelJson(this.data.adapterId).subscribe((resp) => {
      this.attributes = resp.attributes;
      //this.uischema = resp.uischema;
      console.log(this.attributes);
      label.push(Object.keys(this.attributes));
      this.keys = label[0];
      console.log(this.keys);
    });
  }
  createLinked(endId:any) {
    this.relatedbody = [];
      this.relatedbody.push({
        parentId: this.data.id,
        parentType: "MODEL",
        childId: endId,
        childType: "ENDPOINT",

      });
    console.log(this.relatedbody, 'this.relatedbody');

    this.service.createlinkage(this.relatedbody).subscribe((val) => {
      console.log(Date.now(), val);
    });
   // this.refeshrelated.emit(true);
  }

  onClickSubmit() {
    let fId:any;
    console.log('form dets',this.data);
    console.log(this.keys);
    //console.log(this.jsonData);
    this.attributes['Model Id'] = this.data.sourceId;
    fId=this.attributes['Endpoint Id']
    this.options.forEach((e:any)=>{
      if(e.value===fId){
        this.endpointId=e.value2;
      }
    })
  //console.log('id',this.endpointId);    
    try {
      this.service
        .deployModel(this.attributes, this.data.adapterId, this.data.fedId)
        .subscribe(
          (resp) => {
            this.service.messageService(resp, 'Model deployment initiated.');
            //this.telemetry.addTelemetryEvent('Model Deployed');
            if (resp.body.status == 'SUCCESS') {
              this.createLinked(this.endpointId);
                // Close the modal using Angular general code
                // If using Angular Material Dialog:
                // this.dialogRef.close();

                // If using Bootstrap modal or other, you might emit an event or set a flag:
                // this.isModalOpen = false;

                // If you want to navigate away after deployment:
                this.routeBackToModelList();
            }
          },
          (error) => {
            this.service.messageService(error);
          }
        );
    } catch (e) {
      this.service.messageService(e);
    }
  }
  // showData(event){
  //   this.jsonData = event
  // }
  closeModal(){
    //this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    // let activeSpan = this.telemetry.fetchActiveSpan();
    // this.telemetry.endTelemetry(activeSpan);
  }
}