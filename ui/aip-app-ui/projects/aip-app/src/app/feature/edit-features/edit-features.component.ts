import { Component, Input } from '@angular/core';
import { LedsModalService } from 'leds-lib';

import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationStrategy } from '@angular/common';
import { Services } from '../../services/service';
@Component({
  selector: 'app-edit-features',
  templateUrl: './edit-features.component.html',
  styleUrls: ['./edit-features.component.scss']
})
export class EditFeaturesComponent {

  data: any = {};
  keys: any;
  values: any;
  capKeys: any;
  @ Input() card:any;
  cardTitle = 'Edit Features';

  constructor(
    private service: Services,
    private modalService: LedsModalService,
    private route: ActivatedRoute,
    private router: Router,
    private location: LocationStrategy
  ) {}
  ngOnInit(): void {
     this.data = this.card;
    this.capKeys=[];
    console.log(this.data, 'data');
    this.keys = Object.keys(this.data);
    this.keys.forEach((element) => {
      element = element.split(/(?=[A-Z])/).join(' ');
      this.capKeys.push(element);
    });
    this.values = Object.values(this.data);
  }
  closeModal(){
    this.modalService.dismissAll();
  }
  updateModel() {
    // console.log('form dets',this.userForm);
    // this.data.keys = this.keys;
    // console.log(this.data);
    // this.modalService.dismissAll('close the modal');
    // this.service.updateModel(this.data).subscribe(
    //   (resp) => {
    //     console.log(resp);
    //     this.service.messageService(resp, 'Done! Model is updated.');
    //   },
    //   (error) => {
    //     this.service.messageService(error);
    //   }
    // );
  }
}
