import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../../services/service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import { RaiservicesService } from '../../services/raiservices.service';

@Component({
  selector: 'app-model-create',
  templateUrl: './model.create.component.html',
  styleUrls: ['./model.create.component.scss'],
})
export class ModelCreateComponent {
  @Output() responseLink = new EventEmitter<any>();
  @Input() cardTitle: String = 'Model';
  @Input() customCreateName: String;
  datasetTypes = [];
  keys: any = [];
  attributes: any;
  name: any;
  uischema;
  customCreate:boolean ;
  isHover=false;
  
  data = {};
  renderers = angularMaterialRenderers;
  check: boolean=false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private formBuilder: FormBuilder,  
    private raiService: RaiservicesService
  ) {}

 
  ngOnInit() {
    if(this.router.url.includes('models')){
      this.customCreate = false;
    }
    else
    {
      this.customCreate = true;
    }
    console.log('ModelCreateComponent');
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
    this.getRegisterModelJson();

  }
  numSequence(n: number): Array<number> {
    return Array(n);
  }

  routeBackToModelList() {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }
  getRegisterModelJson() {
    let label: any = [];
    this.service.getRegisterModelJson(this.name).subscribe((resp) => {
      this.attributes = resp.attributes;
      this.uischema = resp.uischema;
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
    console.log(this.data);
    this.service.registerModel(this.data, this.name).subscribe(
      (resp) => {
        console.log(resp);
        this.service.messageService(resp, 'Done! Model is registered.');
        if (resp.status == 200) {
          if(this.router.url.includes('initiative')){
            this.responseLink.emit(resp);
            this.raiService.changeModalData(true);
            this.closeModal()
          }
          else{
            this.routeBackToModelList();
          }
        }
      },
      (error) => {
        this.service.message('Error '+error, 'error');
      }
    );
  }

  showData(event) {
    this.data = event;
  }

  closeModal() {
      //this.dialogRef.close();
  }

  
}