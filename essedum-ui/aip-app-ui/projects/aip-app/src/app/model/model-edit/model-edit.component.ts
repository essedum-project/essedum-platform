import { Component, Input, OnInit } from '@angular/core';
import { Services } from '../../services/service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationStrategy } from '@angular/common';

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

    private route: ActivatedRoute,
    private router: Router,
    private location: LocationStrategy
  ) {}



  ngOnInit(): void {
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

    this.keys = Object.keys(this.data);
    this.keys.forEach((element) => {
      element = element.split(/(?=[A-Z])/).join(' ');
      this.capKeys.push(element);

    });


    this.values = Object.values(this.data);
  }
  routeBackToModelList() {

    this.location.back();
  }

  updateModel() {
    this.service.updateModel(this.data).subscribe(
      (resp) => {

        this.routeBackToModelList();
        this.service.message('Done! Model is updated.');
   
      },
      (error) => {
        this.service.message('Error while update model '+ error, 'error');
      }
    );
  }

  closeModal() {
   // this.modalService.dismissAll();
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
    // let activeSpan = this.telemetry.fetchActiveSpan();
    // this.telemetry.endTelemetry(activeSpan);
  }
}