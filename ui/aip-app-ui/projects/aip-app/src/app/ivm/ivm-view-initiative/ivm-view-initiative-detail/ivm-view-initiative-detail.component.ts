import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LedsModalService } from 'leds-lib';
import { RaiservicesService } from '../../../services/raiservices.service';
import { Services } from '../../../services/service';
import { HttpParams } from '@angular/common/http';
import { SbxServicesService } from '../../../services/sbx-services.service';
import { J } from '@angular/cdk/keycodes';
import { Team } from '../../../models/teamSolution';
@Component({
  selector: 'app-ivm-view-initiative-detail',
  templateUrl: './ivm-view-initiative-detail.component.html',
  styleUrls: ['./ivm-view-initiative-detail.component.scss'],
})
export class IvmViewInitiativeDetailComponent implements OnInit {
  @Input() initiativeDetails: any;
  workGroupCount: any;
  workGroup = [];
  aiCanvas = false;
  raiCanvas = false;
  riskAssessment = false;
  leanCanvas = false;
  numberOfTasks: any;
  completedTask: any;
  index: any;
  initiativeName: any;
  initiativeId: any;
  initiativeData: any;
  initiativeMenu: any = [];
  steppers = [];
  tasks = [];
  component: any = [];
  relatedComponent: any;
  approvalStatus: any;
  approvedOn: Date;
  approvalComments: any;
  stepStatus: any;
  data: boolean;
  refreshed: boolean = true;
  raiLinkArtifacts = false;
  combined_MemAndReq: any = [];
  breadcrumb = [];
  initiativeView: boolean;
  solutionTeam: Team = new Team();
  teamMembersObj: any = [];

  constructor(
    private route: ActivatedRoute,
    private modalService: LedsModalService,
    private raiservice: RaiservicesService,
    private sbxservice: SbxServicesService,
    private services: Services,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {
    this.raiservice.currentData.subscribe((value) => {
      this.data = value;
      if (this.data) {
        this.getInitiative();
        this.getcompoent();
      }
    });
    if (sessionStorage.getItem('sbxBreadcrumb') !== 'null') {
      let sbxBreadcrumb = JSON.parse(
        sessionStorage.getItem('sbxBreadcrumb')
      ).breadcrumb;
      this.breadcrumb.push(sbxBreadcrumb);
    } else {
      this.breadcrumb.push({ label: 'My Solutions', url: '../../../' });
    }
  }

  ngOnInit(): void {
    this.authorization();
    if (this.initiativeDetails == undefined) {
      this.initiativeName = this.route.snapshot.params['initiativeName'];
      this.initiativeId = this.route.snapshot.params['id'];
    }
    if (this.initiativeDetails != undefined) {
      this.initiativeName = this.initiativeDetails.name;
      this.initiativeId = this.initiativeDetails.id;
      this.initiativeView = false;
      this.getInitiative();
      this.getWorkgroup();
      this.getcompoent();
    } else {
      this.initiativeView = true;
      this.getInitiative();
      this.getWorkgroup();
      this.getcompoent();
    }
    this.breadcrumb.push({
      label: this.initiativeName,
      url: '../../',
    });
    let teamId = JSON.parse(sessionStorage.getItem('sbxBreadcrumb'))?.teamId;
    if (teamId) {
      this.getSolutionTeam(teamId);
    }
  }
  authorization() {
    this.services.getPermission('cip').subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes('rai-link-artifacts'))
          this.raiLinkArtifacts = true;
      },
      (error) => {
        console.log(
          `error when calling getPermission method. Error Details:${error}`
        );
      }
    );
  }
  open(content: any): void {
    this.modalService.openModal(content, 'mini');
  }
  close() {
    this.modalService.dismissAll('close the modal');
  }
  confToggle(type: any) {
    if (type == 'aiCanvas') {
      this.aiCanvas = !this.aiCanvas;
    } else if (type == 'raiCanvas') {
      this.raiCanvas = !this.raiCanvas;
    } else if (type == 'riskAssessment') {
      this.riskAssessment = !this.riskAssessment;
    } else if (type == 'leanCanvas') {
      this.leanCanvas = !this.leanCanvas;
    }
  }
  stepperClass(step: any) {
    if (step == 'PENDING') {
      // return 'le-c-badge le-c-badge--warning';
      return 'initiative__yet-to-start';
    } else if (step == 'APPROVED') {
      return 'initiative__approved';
      // return 'le-c-badge le-c-badge--active';
    } else if (step == 'REJECTED') {
      return 'initiative__rejected';
      // return 'le-c-badge le-c-badge--active';
    } else if (step == 'APENDING') {
      return 'initiative__approval_pending';
    } else {
      return 'initiative__compeleted';
      // return 'le-c-badge le-c-badge--info';
    }
  }
  afterClass(index: any) {
    if (this.steppers.length - 1 != index) {
      return 'stepName';
    }
  }
  confirm(index: number) {
    this.index = index + 1;
  }
  stepperValue(index: number) {
    this.index = index;
  }
  getInitiative() {
    this.initiativeData = [];
    this.raiservice.getInitiative(this.initiativeId).subscribe((res: any) => {
      this.initiativeData = res;
      this.getInitiativeCheckList();
      if (sessionStorage.getItem('sbxBreadcrumb') !== 'null') {
        let teamId = JSON.parse(sessionStorage.getItem('sbxBreadcrumb'))?.teamId;
        if(!teamId){
          this.teamMembersObj.push({
            userId: '',
            userName: this.initiativeData.createdBy,
          });
        }
      }
    });
  }
  getInitiativeCheckList() {
    let compeletedTask = 0;
    let checkList: any = [];
    this.steppers = [];
    this.tasks = [];
    this.initiativeMenu = [];
    this.raiservice
      .getInitiativeCheckList(this.initiativeId)
      .subscribe((res: any) => {
        checkList = res;
        this.numberOfTasks = checkList.length;
        checkList.forEach((element: any) => {
          if (element.status == 'COMPLETED') {
            compeletedTask++;
          }
          this.tasks.push(element);
          this.steppers.push(element);
        });
        this.initiativeMenu = checkList;
        this.completedTask = compeletedTask;
        this.tasks.sort((a, b) => {
          if (a.type === 'termsncondition') return -1;
          if (b.type === 'termsncondition') return 1;
          return 0;
        });
        this.steppers.sort((a, b) => {
          if (a.type === 'termsncondition') return -1;
          if (b.type === 'termsncondition') return 1;
          return 0;
        });
        this.initiativeMenu.sort((a, b) => {
          if (a.type === 'termsncondition') return -1;
          if (b.type === 'termsncondition') return 1;
          return 0;
        });
      });
  }
  questionare(task: any) {
    {
      let breadcrumb = this.breadcrumb;
      this.router.navigate(
        ['./view/' + task.taskName + '/' + task.taskTemplateId],
        {
          state: {
            breadcrumb,
          },
          relativeTo: this.route,
        }
      );
    }
  }
  openModal(content: any): void {
    this.refreshed = false;
    this.modalService.openModal(content, 'standard');
  }
  getcompoent() {
    this.component = [];
    this.services
      .getRelatedComponent(this.initiativeId, 'INITIATIVE')
      .subscribe({
        next: (res) => {
          this.relatedComponent = res[0];
          this.relatedComponent.data = JSON.parse(this.relatedComponent.data);
          this.component.push(this.relatedComponent);
          this.cdRef.detectChanges();
        },
        complete() {
          console.log('completed');
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
  getWorkgroup() {
    this.raiservice.workgroupList(this.initiativeId).subscribe((res) => {
      res.forEach((wg) => {
        this.workGroup.push({
          userId: wg.userId,
          userName: wg.userName,
          roleId: wg.roleId,
          roleName: wg.roleName,
        });
      });
    });
  }
  modalClose(event: any) {
    this.modalService.dismissAll('close the modal');
    this.workGroup = [];
    this.initiativeMenu = [];
    this.steppers = [];
    this.tasks = [];
    this.component = [];
    if (sessionStorage.getItem('sbxBreadcrumb') !== 'null') {
      let sbxBreadcrumb = JSON.parse(
        sessionStorage.getItem('sbxBreadcrumb')
      ).breadcrumb;
      this.breadcrumb.push(sbxBreadcrumb);
    } else {
      this.breadcrumb.push({ label: 'My Solutions', url: '../../../' });
    }
    this.ngOnInit();
  }
  taskClass(status: any) {
    if (status == 'PENDING') {
      return 'le-c-badge le-c-badge--warning';
    } else if (status == 'APPROVED') {
      // return 'initiative__approved';
      return 'le-c-badge le-c-badge--active';
    } else if (status == 'REJECTED') {
      return 'le-c-badge le-c-badge--error';
    } else {
      return 'le-c-badge le-c-badge--info';
    }
  }
  reloads($event: any) {
    if ($event) {
      this.getcompoent();
    }
  }
  getSolutionTeam(teamId) {
    this.teamMembersObj=[];
    this.sbxservice.getById(teamId).subscribe((res) => {
      this.solutionTeam = res;
      this.combined_MemAndReq = this.solutionTeam.teamMembers;
      this.getTeamApprovedMembers(res.id);
    });
  }
  getTeamApprovedMembers(teamId) {
    this.sbxservice.getMembers(teamId).subscribe((res) => {
      if (res.length != 0) {
        for (var i = 0; i < this.combined_MemAndReq.length; ++i) {
          var obj = this.combined_MemAndReq[i];

          if (obj.userId == res[0].userId) {
            this.combined_MemAndReq = this.combined_MemAndReq.filter(function (
              obj
            ) {
              return obj.userId !== res[0].userId;
            });
          }
        }

        this.combined_MemAndReq.push(res[0]);
      }

      this.combined_MemAndReq.forEach((obj) => {
        this.sbxservice.getUsers(obj.userId).subscribe((data) => {
          let user =
            data.user_f_name +
            ' ' +
            (data.user_m_name && data.user_m_name != 'null'
              ? data.user_m_name
              : '') +
            ' ' +
            (data.user_l_name && data.user_l_name != 'null'
              ? data.user_l_name
              : '');
          this.teamMembersObj.push({
            userId: data.id,
            userName: user,
          });
        });
      });
    });
  }
}
