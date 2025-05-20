import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../../services/service';
import { FormBuilder } from '@angular/forms';
import { RaiservicesService } from '../../services/raiservices.service';
import { MatDialogRef } from '@angular/material/dialog';
//import { CommonCreateDialogComponent } from '../../ivm/ivm-view-initiative/ivm-view-initiative-detail/common-create/common-create-dialog.component';
import { OpenTelemetryService } from 'com-lib-util';


@Component({
  selector: 'app-create-endpoint[id=ele]',
  templateUrl: './create-endpoint.component.html',
  styleUrls: ['./create-endpoint.component.scss']
})
export class CreateEndpointComponent {
  @Output() responseLink = new EventEmitter<any>();
  @Input() customCreateName: String;
  @Input() cardTitle: String = 'Endpoint';
  datasetTypes = [];
  keys: any = [];
  attributes: any;
  name: any;
  check: boolean=false;
  customCreate:boolean ;
  // uischema;
  // data = {};
  // renderers = angularMaterialRenderers;
  constructor(
    private route: ActivatedRoute,
    private telemetry: OpenTelemetryService,
    private router: Router,
    private service: Services,
    private formBuilder: FormBuilder,
    private raiService: RaiservicesService,
  //  public dialogRef: MatDialogRef<CommonCreateDialogComponent>
  ) {}

  telemetryCall(){
    this.telemetry.startTelemetry('aip-app','CreateEndpointComponent', sessionStorage.getItem('organization'));
  }

  ngOnInit() {
    this.telemetryCall();
    if(this.router.url.includes('endpoints')){
      this.customCreate = false;
    }
    else
    {
      this.customCreate = true;
    }
    console.log('EndpointCreateComponent');
    if (this.route.snapshot.paramMap.get('name')) {
      this.name = this.route.snapshot.paramMap.get('name');
    }
    else{
      this.name = this.customCreateName;
    }
    console.log('THIS.name', this.name);
    if (this.router.url.includes('/initiative')) {
      this.check=true;
    }
    this.getRegisterEndpointJson();
  }
  numSequence(n: number): Array<number> {
    return Array(n);
  }

  routeBackToModelList() {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }
  getRegisterEndpointJson() {
    let label: any = [];
    this.service.getRegisterEndpointJson(this.name).subscribe((resp) => {
      this.attributes = resp.attributes;
     // this.uischema = resp.uischema;
      console.log(this.attributes);
      label.push(Object.keys(this.attributes));
      this.keys = label[0];
      console.log(this.keys);
    });
  }
  onClickSubmit() {
    console.log('form dets');
    console.log(this.keys);
    console.log(this.attributes);
    //console.log(this.data);
    this.service.registerEndpoint(this.attributes, this.name).subscribe((resp) => {
      console.log(resp);
      this.service.messageService(resp,"Done! Endpoint is registered.");
      //this.telemetry.addTelemetryEvent('Endpoint registered');
      if(resp.status==200){
        if(this.router.url.includes('initiative')){
          this.responseLink.emit(resp);
          this.raiService.changeModalData(true);        
          this.closeModal();
        }
        else{
          this.routeBackToModelList();
        }
      }
    },error=>{this.service.messageService(error);});
  }
  // showData(event){
  //   this.data = event
  // }

  closeModal() {
    //this.dialogRef.close();
  }

  ngOnDestroy(): void {
    let activeSpan = this.telemetry.fetchActiveSpan();
    this.telemetry.endTelemetry(activeSpan);
  }
}