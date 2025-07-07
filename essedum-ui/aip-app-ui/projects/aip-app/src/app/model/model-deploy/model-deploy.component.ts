import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../../services/service';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import { LocationStrategy } from '@angular/common';
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


  constructor(
    private service: Services,
    private location: LocationStrategy,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {

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


  
  routeBackToModelList() {
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
      console.log(resp);
      console.warn(resp);
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

  }

  onClickSubmit() {
    let fId:any;
    console.log('form dets',this.data);
    console.log(this.keys);
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

            if (resp.body.status == 'SUCCESS') {
              this.createLinked(this.endpointId);
         
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

  closeModal(){
    //this.modalService.dismissAll();
  }


}