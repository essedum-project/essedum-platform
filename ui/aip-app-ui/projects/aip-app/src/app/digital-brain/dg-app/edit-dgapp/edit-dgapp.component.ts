import { LocationStrategy } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LedsModalService } from 'leds-lib';
//import { LedsModalService } from 'leds-lib/lib/modal/leds-modal.service';
import { Services } from '../../../services/service';

@Component({
  selector: 'app-edit-dgapp',
  templateUrl: './edit-dgapp.component.html',
  styleUrls: ['./edit-dgapp.component.scss']
})
export class EditDgappComponent {
  data: any = {};
  keys: any;
  values: any;
  cardTitle = 'Edit DG App';
  capKeys: any;
  instance:any;

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
    this.instance= this.data.adapterId;
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
  updateDGApp() {
    //console.log('form dets',this.userForm);
    this.data.keys = this.keys;
   // console.log('data from edit',this.data);
    this.modalService.dismissAll('close the modal');
    this.service.updateDgApp(this.data,this.instance).subscribe(
      (resp) => {
        console.log(resp);
        this.service.messageService(resp, 'Done! DGApp is updated.');
      },
      (error) => {
        this.service.messageService(error);
      }
    );
  }
  closeModal() {
    this.modalService.dismissAll();
  }


}
