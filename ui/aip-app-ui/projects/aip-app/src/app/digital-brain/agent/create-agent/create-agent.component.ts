import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import { Services } from '../../../services/service';

@Component({
  selector: 'app-create-agent',
  templateUrl: './create-agent.component.html',
  styleUrls: ['./create-agent.component.scss']
})
export class CreateAgentComponent {
  cardTitle: String = 'Create Agent';
  instance:any;
  keys: any = [];
  attributes: any;
  uischema;

  data = {};
  renderers = angularMaterialRenderers;
  constructor(
    private router: Router,
    private route :ActivatedRoute,
    private service: Services,
  ){}
  ngOnInit():void{
    // this.instance=this.route.snapshot.paramMap.get('name');
    //     this.data = {InstanceName:this.instance};
    this.getAgentJson();
  }
  getAgentJson() {
    let label: any = [];
    this.service.getRegisterAgentJson().subscribe((resp) => {
      this.attributes = resp.attributes;
      this.uischema = resp.uischema;
      console.log(this.attributes);
      label.push(Object.keys(this.attributes));
      this.keys = label[0];
      console.log(this.keys);
    });
  }
  onClickSubmit(){
    // console.log(this.attributes);
    // console.log(this.data);
    // this.service.registerDGApp(this.data, this.instance).subscribe((resp) => {
    //   console.log(resp);
    //   this.service.messageService(resp,"Done! DG App  is Created.");
    //   if(resp.status==200){this.routeBackToList();}
    // },error=>{this.service.messageService(error);});
  }
  showData(event){
    this.data = event
  }
  routeBackToList(){
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }


}
