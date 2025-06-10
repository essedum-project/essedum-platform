import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../../services/service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgForm } from '@angular/forms';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import {
  ApiDropdownRenderer,  apiControlTester} from '../../renderers/api-dropdown.renderer';
import { RaiservicesService } from '../../services/raiservices.service';
import { MatDialogRef } from '@angular/material/dialog';
//import { CommonCreateDialogComponent } from '../ivm/ivm-view-initiative/ivm-view-initiative-detail/common-create/common-create-dialog.component';
//import { OpenTelemetryService } from 'com-lib-util';

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
  // schema = {
  //   type: 'object',
  //   properties: {
  //     name: {
  //       type: 'string',
  //       minLength: 1,
  //     },
  //     done: {
  //       type: 'boolean',
  //     },
  //     due_date: {
  //       type: 'string',
  //       format: 'date',
  //     },
  //     recurrence: {
  //       type: 'string',
  //       enum: ['Never', 'Daily', 'Weekly', 'Monthly'],
  //     },
  //   },
  //   required: ['name', 'due_date'],
  // };
  data = {};
  renderers = angularMaterialRenderers;
  check: boolean=false;
  constructor(
    private route: ActivatedRoute,
 //   private telemetry: OpenTelemetryService,
    private router: Router,
    private service: Services,
    private formBuilder: FormBuilder,
   // public dialogRef: MatDialogRef<CommonCreateDialogComponent>,
    private raiService: RaiservicesService
  ) {}

  // telemetryCall(){
  //   this.telemetry.startTelemetry('aip-app','ModelCreateComponent', sessionStorage.getItem('organization'));
  // }

  ngOnInit() {
    //this.telemetryCall();
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

    // this.renderers.push({ tester: apiControlTester, renderer: ApiDropdownRenderer })
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
        //this.telemetry.addTelemetryEvent('Model registered');
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
        this.service.messageService(error);
      }
    );
  }

  showData(event) {
    this.data = event;
  }

  closeModal() {
      //this.dialogRef.close();
  }

  ngOnDestroy(): void {
    // let activeSpan = this.telemetry.fetchActiveSpan();
    // this.telemetry.endTelemetry(activeSpan);
  }
}