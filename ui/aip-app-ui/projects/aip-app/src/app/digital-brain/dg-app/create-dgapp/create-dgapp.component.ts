import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import { Services } from '../../../services/service';

@Component({
  selector: 'app-create-dgapp',
  templateUrl: './create-dgapp.component.html',
  styleUrls: ['./create-dgapp.component.scss']
})
export class CreateDgappComponent {
  cardTitle: String = 'Create DG App';
  instance: any;
  keys: any = [];
  attributes: any;
  uischema;

  data = {};
  renderers = angularMaterialRenderers;
  instanceName: any;
  createdBy:any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: Services,
  ) { }
  ngOnInit(): void {
    this.instance=this.route.snapshot.paramMap.get('name');
      //  this.data = {InstanceName:this.instance};
      let data :any;
      data = sessionStorage.getItem('user');
    this.createdBy=JSON.parse(data).user_f_name;
  console.log('createdBy',this.createdBy);
  
    this.instanceName = this.route.snapshot.queryParamMap.get('InstanceName')
    this.data = { InstanceName: this.instanceName,CreatedBy: this.createdBy };

    this.getDGAppJson();
  }
  getDGAppJson() {
    let label: any = [];
    this.service.getRegisterDGAppJson(this.instance).subscribe((resp) => {
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
    this.service.registerDGApp(this.data, this.instance).subscribe((resp) => {
      console.log(resp);
      this.service.messageService(resp, "Done! DG App  is Created.");
      if (resp.status == 200) { this.routeBackToList(); }
    }, error => { this.service.messageService(error); });
  }
  showData(event) {
    this.data = event
  }
  routeBackToList() {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }

}
