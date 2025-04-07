import { LocationStrategy } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LedsModalService } from 'leds-lib';
import { Services } from '../../services/service';

@Component({
  selector: 'app-edit-feature-store',
  templateUrl: './edit-feature-store.component.html',
  styleUrls: ['./edit-feature-store.component.scss']
})
export class EditFeatureStoreComponent {
  data: any = {};
  keys: any;
  values: any;
  cardTitle = 'Edit Feature Store';
  capKeys: any;

  constructor(
    private service: Services,
    private modalService: LedsModalService,
    private route: ActivatedRoute,
    private router: Router,
    private location: LocationStrategy
  ) {}
  ngOnInit(): void {
    let cards = this.location.getState();
    this.data = cards['card'];
    this.capKeys = [];
    console.log(this.data, 'data');
    this.keys = Object.keys(this.data);
    this.keys.forEach((element) => {
      element = element.split(/(?=[A-Z])/).join(' ');
      this.capKeys.push(element);
      //console.log(element, 'element');
    });
    this.values = Object.values(this.data);
  }
  routeBackToModelList() {
    this.router.navigate(['../../'], { relativeTo: this.route });
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
  closeModal() {
    this.modalService.dismissAll();
  }

}
