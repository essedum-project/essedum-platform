import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Services } from '../../../services/service';
import { LedsModalService } from 'leds-lib';
import { RaiservicesService } from '../../../services/raiservices.service';

@Component({
  selector: 'app-add-template',
  templateUrl: './add-template.component.html',
  styleUrls: ['./add-template.component.scss'],
})
export class AddTemplateComponent implements OnInit {
  @Input() templateId: any;
  @Output() newTemplate = new EventEmitter();
  responseTypes = [
    { value: 'text', viewValue: 'text' },
    { value: 'email', viewValue: 'email' },
    { value: 'checkbox', viewValue: 'checkbox' },
    { value: 'number', viewValue: 'number' },
    { value: 'dropdown', viewValue: 'dropdown' },
  ];
  questionareOtions: any = '';
  questionareResponseType: any;
  questionareContent: any;
  parentName:any;
  constructor(
    private service: Services,
    private modalService: LedsModalService,
    private raiservice: RaiservicesService
  ) {}
  ngOnInit(): void {
    console.log('');
  }
  close() {
    this.modalService.dismissAll('close the modal');
    this.ngOnInit();
  }
  selectResponseTypes(event: any) {
    this.questionareResponseType = event;
  }
  addTemplate() {
    // let id = this.templateData.length + 1;
    let templateData = [];
    let optionsArray: any;
    if (this.questionareOtions.length > 0) {
      optionsArray = this.questionareOtions.split('+');
    }
    templateData.push({
      question_id: this.templateId+1,
      parent_name: this.parentName,
      question_content: this.questionareContent,
      response_type: this.questionareResponseType,
      options: optionsArray,
    });
    // console.log('templateData', templateData);
    this.newTemplate.emit(templateData);
    this.close();
  }
}
