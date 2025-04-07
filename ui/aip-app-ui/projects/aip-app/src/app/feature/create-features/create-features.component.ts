import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import { LedsModalService } from 'leds-lib';
import { Services } from '../../services/service';

@Component({
  selector: 'app-create-features',
  templateUrl: './create-features.component.html',
  styleUrls: ['./create-features.component.scss']
})
export class CreateFeaturesComponent {
  @Input() cardTitle: String = 'Create Features ';
  @Input() storeName:any;
  @Input() instance:any;
  @Output() newItem =new EventEmitter<any>();
  keys: any = [];
  attributes: any;
  name: any;
  uischema;
  
  data = {};
  renderers = angularMaterialRenderers;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: LedsModalService,
    private service: Services,
  ) {}
  ngOnInit(): void {
    // console.log(this.storeName,"storeName on createComponent");
    this.getRegisterFeaturesJson();
  }
  getRegisterFeaturesJson() {
    let label: any = [];
    this.service.getRegisterFeaturesJson(this.instance).subscribe((resp) => {
      this.attributes = resp.attributes;
      this.uischema = resp.uischema;
      console.log(this.attributes);
      label.push(Object.keys(this.attributes));
      this.keys = label[0];
      console.log(this.keys);
    });
  }
  closeModal(){
    this.modalService.dismissAll();
  }
  onClickSubmit() {
    console.log(this.keys);
    console.log(this.attributes);
    console.log(this.data);
    this.service.registerFeatures(this.data, this.instance, this.storeName).subscribe((resp) => {
      console.log(resp);
      this.service.messageService(resp,resp.body.Message);
      if(resp.status==200){
        this.newItem.emit(this.data);
        this.closeModal();}
    },error=>{this.service.messageService(error);});
  }
  showData(event){
    this.data = event
  }
}
