import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ivm-view-initiative-questionare',
  templateUrl: './ivm-view-initiative-questionare.component.html',
  styleUrls: ['./ivm-view-initiative-questionare.component.scss'],
})
export class IvmViewInitiativeQuestionareComponent implements OnInit {
  task: any;
  template;
  InitiativeMenu: any;
  initiativeId: any;
  constructor(private location: Location) {}

  ngOnInit(): void {
    let Task = this.location.getState();
    this.InitiativeMenu = Task['InitiativeMenu'];
    this.initiativeId=Task['initiativeId'];
    this.task = Task['task'];
  }
}
