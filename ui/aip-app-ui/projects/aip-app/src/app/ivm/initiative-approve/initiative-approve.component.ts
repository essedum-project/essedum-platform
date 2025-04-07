import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RaiservicesService } from '../../services/raiservices.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Services } from '../../services/service';
import { LedsModalService } from 'leds-lib';
@Component({
  selector: 'app-initiative-approve',
  templateUrl: './initiative-approve.component.html',
  styleUrls: ['./initiative-approve.component.scss'],
})
export class InitiativeApproveComponent implements OnInit {
  taskType: any;
  checklistId: any;
  taskName: any;
  showSpinner: boolean = false;
  organization: any;
  initiativeId: any;
  initiativeName: any;
  taskId: any;
  form: FormGroup;
  param: any;
  questions: any;
  isCompeleted: boolean = false;
  template: any;
  response: any;
  mailValidator: any;
  userResponses: any;
  userResponse: any;
  rejectReason: any = '';
  parentName: any = [];
  childData: any = [];
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private raiService: RaiservicesService,
    private services: Services,
    private modalService: LedsModalService
  ) {}
  ngOnInit(): void {
    this.getParams();
    this.getFormDetails(this.param);
  }
  getParams() {
    this.initiativeId = this.route.snapshot.params['initaitiveId'];
    this.checklistId = this.route.snapshot.params['checklistId'];
    // this.taskType = this.route.snapshot.params['artifactType'];
    // this.taskId = this.route.snapshot.params['artifactId'];
    this.organization = sessionStorage.getItem('organization');
    this.param = new HttpParams()
      .set('organization', this.organization)
      // .set('taskId', this.taskId)
      // .set('taskType', this.taskType)
      .set('initiativeId', this.initiativeId)
      .set('checklistId', this.checklistId);
  }
  getFormDetails(param: any) {
    this.raiService.getApprovalForm(param).subscribe((res) => {
      this.response = res;
      this.initiativeName = res.initiativeName;
      this.template = res.template;
      this.userResponse = res.userResponse;
      this.taskName = res.taskName;
      this.taskType = res.taskType;
      this.forgenerator();
    });
  }
  forgenerator() {
    this.parentName = [];
    this.questions = JSON.parse(this.template);
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
  }
  userresponse() {
    // Prefill the form
    this.userResponses = JSON.parse(this.userResponse);
    this.userResponses.forEach((response) => {
      this.form
        .get(response.question_id.toString())
        ?.patchValue(response.user_response);
    });
  }
  onApprove() {
    this.showSpinner = true;
    let userId = JSON.parse(sessionStorage.getItem('user')).id;
    let template = {
      status: 'APPROVED',
      comments: '',
      approverId: userId,
      taskType: this.taskType,
      taskId: this.taskId,
    };
    this.raiService
      .approveUserTask(this.initiativeId, this.checklistId, template)
      .subscribe((res) => {
        this.services.message('Approved !');
        this.showSpinner = false;
        this.router.navigate(['../../../'], {
          relativeTo: this.route,
        });
      });
  }
  onReject() {
    this.showSpinner = true;
    let userId = JSON.parse(sessionStorage.getItem('user')).id;
    let template = {
      status: 'REJECTED',
      comments: this.rejectReason,
      approverId: userId,
      taskType: this.taskType,
      taskId: this.taskId,
    };
    this.raiService
      .approveUserTask(this.initiativeId, this.checklistId, template)
      .subscribe((res) => {
        this.services.message('Rejected !');
        this.router.navigate(['../../../'], {
          relativeTo: this.route,
        });
        this.showSpinner = false;
        this.close();
      });
  }
  open(content: any): void {
    // this.tempId = this.templateData.length;
    this.modalService.openModal(content, 'mini');
  }
  openlarge(content: any): void {
    this.modalService.openModal(content, 'standard');
  }
  close() {
    this.modalService.dismissAll('close the modal');
    this.ngOnInit();
  }
  redirect() {
    this.router.navigate(
      [
        '../../../viewinitiative/' +
          this.initiativeId +
          '/' +
          this.initiativeName,
      ],
      {
        relativeTo: this.route,
      }
    );
  }
}
