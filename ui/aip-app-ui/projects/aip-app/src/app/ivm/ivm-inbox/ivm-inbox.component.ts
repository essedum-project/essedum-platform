import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ivm-inbox',
  templateUrl: './ivm-inbox.component.html',
  styleUrls: ['./ivm-inbox.component.scss'],
})
export class IvmInboxComponent  {
  constructor(private location:Location) {}


  navigateBack() {
    this.location.back();
  }

  inboxData=[{
    'Request No':'339934',
    'Initiative':'AI augmented software Engineering',
    'Description':'Approval for Risk Mitigation action plans',
    'Requested Date':'23 Aug 2023',
    'Requester':'Sandeep Kumar Sundaram',
    'Status':'PENDING',
    'Action':'PROCEED'
    },
    {
    'Request No':'339934',
    'Initiative':'AI augmented software Engineering',
    'Description':'Approval for Risk assessment',
    'Requested Date':'23 Aug 2023',
    'Requester':'Sandeep Kumar Sundaram',
    'Status':'PENDING',
    'Action':'PROCEED'
    },
    {
    'Request No':'339934',
    'Initiative':'AI augmented software Engineering',
    'Description':'Approval for AI and RAI Canvas',
    'Requested Date':'23 Aug 2023',
    'Requester':'Sandeep Kumar Sundaram',
    'Status':'APPROVED',
    'Action':'PROCEED'
    }];
}
