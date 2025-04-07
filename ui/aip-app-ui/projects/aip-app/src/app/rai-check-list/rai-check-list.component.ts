import { Component, OnInit } from '@angular/core';
import { Services } from '../services/service';
import { LedsModalService } from 'leds-lib';
import { RaiservicesService } from '../services/raiservices.service';
import { UserProjectRole } from '../models/user-project-role';
import { RoleService } from '../services/role.service';
import { HttpParams } from '@angular/common/http';
import { Role } from '../models/role';

@Component({
  selector: 'app-rai-check-list',
  templateUrl: './rai-check-list.component.html',
  styleUrls: ['./rai-check-list.component.scss'],
})
export class RaiCheckListComponent implements OnInit {
  isApprovalFlow: boolean = false;
  constructor(
    private service: Services,
    private modalService: LedsModalService,
    private raiservice: RaiservicesService,
    public roleSerive: RoleService
  ) {}
  types = [
    { value: 'Questionnaire', viewValue: 'Questionnaire' },
    { value: 'Canvas', viewValue: 'Canvas' },
    { value: 'TermsnCondition', viewValue: 'Terms & Condition' },
  ];
  selectedWorkflowType:any;
  workflowTypes:any=[];
  approver_role = [];
  approver_roleId: any;
  template: any;
  selectedType: any = '';
  templateContent: any;
  slectedTemplateView: any;
  slectedTemplate: any; 
  mandatory: boolean = false;
  checklisteddata: any;
  configName: any = 'Checklist';
  configNameExist: boolean = false;
  newConfig: boolean = true;
  listing: boolean = false;
  checklisted: any = [];
  ngOnInit(): void {
    this.getArtifactTypes()
    this.getRoleList();
  }
  CreateConfig($event: any) {
    this.listing = true;
    if ($event == 'Create') {
      this.newConfig = true;
    } else {
      this.newConfig = false;
    }
  }
  selectType(event: any) {
    console.log('SELECTEDtype', event);
    if (event === 'Questionnaire') {
      this.getQuestionares();
    } else if (event === 'Canvas') {
      this.getCanvas();
    } else if (event === 'TermsnCondition') {
      this.getTermsCondition();
    }
    this.selectedType = event;
  }
  selectWorkflowType(event: any) {
    this.selectedWorkflowType = event;
    this.getExistingChecklist();
  }
  selectTemplate(event: any) {
    this.slectedTemplateView=null;
    console.log('selectTemplate', event);
    this.templateContent.forEach((element: any) => {
      if (element.name === event) {
        this.slectedTemplateView = element.content;
        this.slectedTemplate = element;
      }
    });
  }
  mandate(event: any) {
    console.log('MANDATE', event.checked);
    this.mandatory = event.checked;
  }
  isApproval(event: any) {
    console.log('isApprovalFlow', event.checked);
    this.isApprovalFlow = event.checked;
  }
  viewselectedConfig(content: any) {
    this.modalService.openModal(content, 'wide');
  }
  selectconfig() {
    console.log('selectconfig');
    this.checklisteddata = {
      name: this.slectedTemplate.name,
      // content: JSON.stringify(this.slectedTemplateView),
      id: this.slectedTemplate.id,
      type: this.selectedType,
      mandatory: this.mandatory,
      approver_flow: this.isApprovalFlow,
      approver_role: this.approver_roleId,
    };

    // Find the index of the existing item in the array
    let index = this.checklisted.findIndex(
      (item) =>
        item.name === this.checklisteddata.name &&
        item.type === this.checklisteddata.type
    );

    // If the item exists, check if the mandatory field is the same
    if (index !== -1) {
      if (
        this.checklisted[index].mandatory !== this.checklisteddata.mandatory
      ) {
        // If the mandatory field is not the same, update the item
        this.checklisted[index] = this.checklisteddata;
      }
    }
    // If the item does not exist, add it to the array
    else {
      this.checklisted.push(this.checklisteddata);
      this.checklisted.sort((a, b) => {
        if (a.type === 'TermsnCondition') return -1;
        if (b.type === 'TermsnCondition') return 1;
        return 0;
      });
    }
    this.service.message('Checklist Template Added Successfully');
    // this.slectedTemplate=null;
    // this.selectedType=null;
  }
  saveConfig() {
    this.raiservice
      .checklistTemplate(this.checklisted, this.selectedWorkflowType)
      .subscribe((res) => {
        this.service.message('Saved Successfully');
      });
  }
  removeItem(index: number) {
    if (index > -1 && index < this.checklisted.length) {
      this.checklisted.splice(index, 1);
      this.service.message('Checklist Template Removed Successfully');
    }
  }
  getQuestionares() {
    this.template = [];
    this.slectedTemplateView =null;
    this.templateContent = [];
    this.raiservice.getQuestionnaires().subscribe((res) => {
      res.forEach((element: any) => {
        this.template.push({ value: element.name, viewValue: element.name });
        this.templateContent.push({
          name: element.name,
          content: JSON.parse(element.content),
          id: element.id.toString(),
        });
      });
    });
  }
  getCanvas() {
    this.template = [];
    this.slectedTemplateView = null;
    this.templateContent = [];
    this.raiservice.getCanvas().subscribe((res) => {
      res.forEach((element: any) => {
        this.template.push({ value: element.name, viewValue: element.name });
        this.templateContent.push({
          name: element.name,
          content: JSON.parse(element.content),
          id: element.id.toString(),
        });
      });
    });
  }
  getTermsCondition() {
    this.slectedTemplateView = null;
    this.template = [];
    this.templateContent = [];
    this.raiservice.getTermsCondition().subscribe((res) => {
      res.forEach((element: any) => {
        this.template.push({ value: element.name, viewValue: element.name });
        this.templateContent.push({
          name: element.name,
          content: JSON.parse(element.content),
          id: element.id.toString(),
        });
      });
    });
  }
  selectApproverRole(event: any) {
    this.approver_roleId = event;
    console.log('Selected Approver' + this.approver_roleId);
  }
  getRoleList() {
    this.approver_role=[];
    let tempUserProjectRole = new Role();
    tempUserProjectRole.projectId = null;
    this.roleSerive.getRoleList(tempUserProjectRole).subscribe((res) => {
      res.content.forEach((item) => {
        this.approver_role.push({ value: item.id, viewValue: item.name });
      });
    });
  }
  getExistingChecklist() {
    let params: HttpParams = new HttpParams();
    params= params.set('type',this.selectedWorkflowType);
    params= params.set('organization',sessionStorage.getItem('organization'));
    let contents: any;
    this.raiservice.getExistingChecklist(params).subscribe((res) => {
      this.checklisted = [];
      console.log(res);
      contents = res['content'];
      JSON.parse(contents).forEach((element: any) => {
        this.checklisted.push(element);
      });
    });
  }
  getArtifactTypes(){
    this.raiservice.getArtifactTypes().subscribe((res) => {
      console.log(res);
      
      res.body.forEach((element: any) => {
        this.workflowTypes.push({ value: element, viewValue: element });
      });
    });
  }
}
