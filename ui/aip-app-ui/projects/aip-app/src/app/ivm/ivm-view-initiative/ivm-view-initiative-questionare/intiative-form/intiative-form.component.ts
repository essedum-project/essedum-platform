import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RaiservicesService } from 'projects/aip-app/src/app/services/raiservices.service';
import { Services } from 'projects/aip-app/src/app/services/service';

@Component({
  selector: 'app-intiative-form',
  templateUrl: './intiative-form.component.html',
  styleUrls: ['./intiative-form.component.scss'],
})
export class IntiativeFormComponent implements OnInit {
  task: any;
  InitiativeMenu: any = [];
  isCompeleted: boolean = false;
  mailValidator: any;
  initiativeId: any;
  templateType: any;
  templateId: any;
  userResponses: any;
  form: FormGroup;
  taskName: any;
  taskTemplateId: any;
  questions: any;
  errorMessage: string;
  breadcrumb = [];
  parentName: any = [];
  childData: any = [];
  status: any;
  disabled: boolean = false;
  showNext: boolean = false;
  showSave: boolean = false;
  showSubmit: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private services: Services,
    private raiservices: RaiservicesService
  ) {
    this.route.params.subscribe((params) => {
      this.taskName = params['questionare'];
      this.taskTemplateId = params['taskTemplateId'];
    });
  }
  ngOnInit(): void {
    this.initiativeId = Number(sessionStorage.getItem('initiativeId'));
    this.getInitiative();
    // if (history.bc) {
    //   bc = history.state.breadcrumb;
    //   // this.task = history.state.task;
    //   // if (this.task.status == 'COMPLETED') {
    //   //   this.isCompeleted = true;
    //   // }
    //   // this.InitiativeMenu = history.state.InitiativeMenu;
    // }
  }
  breadCrumb() {
    let bc = [];
    if (sessionStorage.getItem('sbxBreadcrumb')!=='null') {
      let sbxBreadcrumb = (JSON.parse(sessionStorage.getItem('sbxBreadcrumb'))).breadcrumb;
      bc.push(sbxBreadcrumb);
    } else {
      bc.push({
        label: 'My Solutions',
        url: '/landing/aip/initiative',
      });
    }
    bc.push({
      label: this.task.initiativeName,
      url: '../../../',
    });
    this.breadcrumb = [];
    for (let i = 0; i < 2 && i < bc.length; i++) {
      this.breadcrumb.push(bc[i]);
    }
  }
  formInitialize() {
    this.breadcrumb.push({
      label: this.task.taskName,
      url: '/',
    });
    this.questions = JSON.parse(this.task.template);
    this.questions = this.questions.sort(
      (a, b) => a.question_id - b.question_id
    );
    this.questions.forEach((question) => {
      if (
        !this.parentName.some(
          (element) => element == question.parent_name.toString()
        )
      ) {
        this.parentName.push(question.parent_name.toString());
      }
    });
    this.parentName.forEach((element) => {
      let obj = {
        parentName: element,
        child: [],
      };
      this.questions.forEach((question) => {
        if (question.parent_name.toString() == element) {
          obj.child.push(question);
        }
      });
      this.childData.push(obj);
    });
    this.status = this.task.status;
    this.form = this.formBuilder.group({});
    this.mailValidator = [Validators.required, Validators.email];
    this.questions.forEach((question) => {
      this.form.addControl(
        question.question_id.toString(),
        this.formBuilder.control('', [
          Validators.required,
          Validators.minLength(1),
        ])
      );
      if (question.response_type == 'dropdown') {
        let obj: any;
        let qopts: any = [];
        question.options.forEach((option: any) => {
          obj = {
            value: option,
            viewValue: option,
          };
          qopts.push(obj);
        });
        question.options = qopts;
      }
    });
    this.userresponse();
    if (this.task.approvalStatus == 'APPROVED') this.disabled = true;
    // if( this.task.status!='COMPLETED') this.disabled=false
    if (this.task.approvalStatus == 'REJECTED') {
      this.disabled = false;
    }
    if (this.task.status == 'COMPLETED' && this.task.approvalStatus == null) {
      this.disabled = true;
    }
  }
  getInitiative() {
    this.InitiativeMenu = [];
    this.raiservices
      .getInitiativeCheckList(this.initiativeId)
      .subscribe((res: any) => {
        res.forEach((element: any) => {
          this.InitiativeMenu.push(element);
        });
        this.InitiativeMenu.sort((a, b) => {
          if (a.type === 'termsncondition') return -1;
          if (b.type === 'termsncondition') return 1;
          return 0;
        });
        this.tasks();
      });
  }
  userresponse() {
    // Prefill the form
    this.userResponses = JSON.parse(this.task.userResponse);
    this.userResponses.forEach((response) => {
      this.form
        .get(response.question_id.toString())
        ?.patchValue(response.user_response);
    });
  }
  tasks() {
    let taskIndex = this.InitiativeMenu.findIndex(
      (element) =>
        element.taskName == this.taskName &&
        element.taskTemplateId == this.taskTemplateId
    );
    this.task = this.InitiativeMenu[taskIndex];
    if (
      this.task.status == 'COMPLETED' &&
      (this.task.approvalStatus == 'PENDING' ||
        this.task.approvalStatus == 'APPROVED' ||
        this.task.approvalStatus == null)
    ) {
      this.showSave = false;
      this.showNext = true;
      this.showSubmit = false;
    }
    if (this.task.status == 'PENDING' && this.task.approvalStatus == null) {
      this.showSave = true;
      this.showNext = false;
      this.showSubmit = true;
    }
    if (
      this.task.status == 'COMPLETED' &&
      this.task.approvalStatus == 'REJECTED'
    ) {
      this.showSave = true;
      this.showNext = false;
      this.showSubmit = true;
    }
    this.breadCrumb();
    this.formInitialize();
  }
  formswitch() {
    // let breadcrumb = this.breadcrumb;
    let taskIndex = this.InitiativeMenu.findIndex(
      (element) =>
        element.taskName == this.task.taskName &&
        element.taskTemplateId == this.task.taskTemplateId
    );
    this.task = this.InitiativeMenu[taskIndex + 1];
    if (taskIndex + 1 == this.InitiativeMenu.length) {
      this.router.navigate(['../../../'], {
        relativeTo: this.route,
      });
    }
    this.router.navigate(
      ['../../' + this.task.taskName + '/' + this.task.taskTemplateId],
      {
        relativeTo: this.route,
        // state: {
        //   task: this.task,
        //   InitiativeMenu: this.InitiativeMenu,
        //   breadcrumb,
        // },
      }
    );
    this.initiativeId = this.initiativeId;
    this.parentName = [];
    this.ngOnInit();
  }
  onSubmit(): void {
    let userId = JSON.parse(sessionStorage.getItem('user')).id;
    this.templateType = this.task.taskType;
    this.templateId = this.task.taskTemplateId;
    if (this.form.valid) {
      this.errorMessage = null;
      const user_response = [];
      this.questions.forEach((question) => {
        user_response.push({
          question_id: question.question_id,
          user_response: this.form.get(question.question_id.toString())?.value,
        });
      });
      this.raiservices
        .compeleteUserResponseRai(
          this.templateType,
          this.templateId,
          this.initiativeId,
          userId,
          JSON.stringify(user_response),
          this.task.checklistid
        )
        .subscribe((res) => {
          this.services.message(
            this.task.taskName + ' Submitted Successfully',
            'success'
          );
          this.formswitch();
        });
      // this.formSubmit.emit(true);
    } else {
      this.errorMessage = 'Please fill out all required fields.';
    }
  }
  onSave() {
    const user_response = [];
    this.questions.forEach((question) => {
      user_response.push({
        question_id: question.question_id,
        user_response: this.form.get(question.question_id.toString())?.value,
      });
    });
    this.templateType = this.task.taskType;
    this.templateId = this.task.taskTemplateId;
    let checklistId = this.task.checklistid;
    this.raiservices
      .saveUserResponseRai(
        this.templateType,
        this.templateId,
        this.initiativeId,
        JSON.stringify(user_response),
        checklistId
      )
      .subscribe((res: any) => {
        this.services.message(
          this.task.taskName + ' Saved Successfully',
          'success'
        );
        this.formswitch();
      });
  }
}
