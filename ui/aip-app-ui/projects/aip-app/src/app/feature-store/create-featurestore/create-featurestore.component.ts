import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import { Services } from '../../services/service';

@Component({
  selector: 'app-create-featurestore',
  templateUrl: './create-featurestore.component.html',
  styleUrls: ['./create-featurestore.component.scss']
})
export class CreateFeaturestoreComponent {
  @Input() cardTitle: String = 'Create Feature Store';
  keys: any = [];
  attributes: any;
  name: any;
  uischema;

  data = {};
  renderers = angularMaterialRenderers;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
  ) {}
  ngOnInit():void{
    this.name=this.route.snapshot.paramMap.get('name');
    this.getRegisterFeatureStoreJson();
  }
  routeBackToStoreList(){
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }
  getRegisterFeatureStoreJson() {
    let label: any = [];
    this.service.getRegisterFeatureStoreJson(this.name).subscribe((resp) => {
      this.attributes = resp.attributes;
      this.uischema = resp.uischema;
      console.log(this.attributes);
      label.push(Object.keys(this.attributes));
      this.keys = label[0];
      console.log(this.keys);
    });
  }
  onClickSubmit() {
    console.log(this.attributes);
    console.log(this.data);
    this.service.registerFeatureStore(this.data, this.name).subscribe((resp) => {
      console.log(resp);
      this.service.messageService(resp,"Done! FeatureStore is Created.");
      if(resp.status==200){this.routeBackToStoreList();}
    },error=>{this.service.messageService(error);});
  }
  showData(event){
    this.data = event
  }
}
