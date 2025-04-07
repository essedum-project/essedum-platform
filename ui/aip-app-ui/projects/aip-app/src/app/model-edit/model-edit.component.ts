import { Component, Input, OnInit } from '@angular/core';
import { LedsModalService } from 'leds-lib';
import { Services } from '../services/service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ModelDTO } from './ModelDTO';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationStrategy } from '@angular/common';
import { OpenTelemetryService } from 'com-lib-util';
@Component({
  selector: 'app-model-edit',
  templateUrl: './model-edit.component.html',
  styleUrls: ['./model-edit.component.scss'],
})
export class ModelEditsComponent implements OnInit {
  data: any = {};
  keys: any;
  values: any;
  appModifiedBy: any;
  cardTitle = 'Edit Model';
  capKeys: any;
  basicReqTab: any = 'editModelTab';
  errorMessage: string;
  payload: any;
  @Input() componentData: any;
  constructor(
    private service: Services,
    private telemetry: OpenTelemetryService,
    private modalService: LedsModalService,
    private route: ActivatedRoute,
    private router: Router,
    private location: LocationStrategy
  ) {}

  telemetryCall(){
    this.telemetry.startTelemetry('aip-app','ModelEditsComponent', sessionStorage.getItem('organization'));
  }

  ngOnInit(): void {
    this.telemetryCall();
    if (this.componentData) {
      this.data = this.componentData.data;
    } else {
      let cards = this.location.getState();
      this.data = cards['card'];
    }
    this.capKeys = [];
    let data: any;
    data = sessionStorage.getItem('user');
    this.appModifiedBy = JSON.parse(data).user_f_name;
    this.data.modifiedBy = this.appModifiedBy;
    // console.log(this.data, 'data');
    this.keys = Object.keys(this.data);
    this.keys.forEach((element) => {
      element = element.split(/(?=[A-Z])/).join(' ');
      this.capKeys.push(element);
      // console.log(element, 'element');
    });
    // console.log(this.capKeys, 'this.capKeys');
    // console.log(this.keys, 'keys');

    this.values = Object.values(this.data);
  }
  routeBackToModelList() {
    // this.router.navigate(['../'], { relativeTo: this.route });
    this.location.back();
  }
  updateModel() {
    this.modalService.dismissAll('close the modal');
    this.service.updateModel(this.data).subscribe(
      (resp) => {
        // console.log(resp);
        this.routeBackToModelList();
        this.service.messageService(resp, 'Done! Model is updated.');
        this.telemetry.addTelemetryEvent(' Model Updated');
      },
      (error) => {
        this.service.messageService(error);
      }
    );
  }
  closeModal() {
    this.modalService.dismissAll();
  }
  basicReqTabChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = 'editModelTab';

        break;
      case 1:
        this.basicReqTab = 'modelExtras';
        this.processJson();
        break;
    }
  }
  processJson() {
    this.errorMessage = '';
    this.payload = this.data;
    try {
      this.payload = this.data;
    } catch (error) {
      this.errorMessage = 'error.message';
    }
  }

  ngOnDestroy(): void {
    let activeSpan = this.telemetry.fetchActiveSpan();
    this.telemetry.endTelemetry(activeSpan);
  }
}