import { Component, OnInit } from '@angular/core';
import { LedsModalService } from 'leds-lib';
import { MashupsService } from '../mashups.service';
import { Mashup } from '../../DTO/mashup';
import { AdapterServices } from '../../adapter/adapter-service';


@Component({
  selector: 'app-create-mashup',
  templateUrl: './create-mashup-popup.component.html',
  styleUrls: ['./create-mashup-popup.component.scss']
})
export class CreateMashupComponent implements OnInit {

  alias = '';
  mashup: Mashup = new Mashup();

  constructor(
    private modalService: LedsModalService,
    private mashupService: MashupsService,
    private adapterServices: AdapterServices,
  ) { }

  ngOnInit() {
    this.mashup = new Mashup();
    this.mashup.organization = sessionStorage.getItem("organization");
  }

  saveDetails() {
    if (!this.mashup.organization)
      this.mashup.organization = sessionStorage.getItem("organization");
    this.mashup.name = this.alias;
    this.mashupService.createMashup(this.mashup).subscribe(resp => {
      this.adapterServices.messageNotificaionService('success', "Done!  Mashup Created Successfully");
      this.closeModal();
      this.ngOnInit();
    })
  }

  closeModal() {
    this.modalService.dismissAll();
  }

}
