import { leadingComment } from '@angular/compiler';
import {
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LedsModalService } from 'leds-lib';
import { RaiservicesService } from '../../services/raiservices.service';
import { Services } from '../../services/service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';

@Component({
  selector: 'app-ivm-view-initiative',
  templateUrl: './ivm-view-initiative.component.html',
  styleUrls: ['./ivm-view-initiative.component.scss'],
})
export class IvmViewInitiativeComponent implements OnInit, OnChanges {
  initiativeMenu = [];
  modeSwitch: boolean = false;
  keys: any = [];
  values: any = [];
  breadcrumb = [];
  initiativeName: any;
  initiativeId: any;
  selectArtifact: any;
  breadcrumbs = [];
  data: boolean;
  component: any = [];
  relatedComponent: any;
  dataType: any;
  refresh: boolean;
  childId: any;
  parentType = 'INITIATIVE';
  raiLinkArtifacts: boolean;
  selectedComp: any;
  constructor(
    private route: ActivatedRoute,
    private modalService: LedsModalService,
    private router: Router,
    private raiservice: RaiservicesService,
    private cdRef: ChangeDetectorRef,
    private services: Services,
    private dialog: MatDialog
  ) {
    this.raiservice.currentData.subscribe((value) => {
      this.data = value;
      if (this.data) {
        this.getcompoent();
      }
    });
    if (history.state.currentUrl) {
      let sbx = {
        breadcrumb: {
          label: history.state.projName,
          url: history.state.currentUrl,
        },
        initiativeId: history.state.solutionId,
        teamId: history.state?.teamId,
      };
      sessionStorage.setItem('sbxBreadcrumb', JSON.stringify(sbx));
      // sessionStorage.setItem('initiativeId', history.state.solutionId);
    }
    if (sessionStorage.getItem('sbxBreadcrumb') !== 'null') {
      let sbxBreadcrumb = (JSON.parse(sessionStorage.getItem('sbxBreadcrumb'))).breadcrumb;
      this.breadcrumb.push(sbxBreadcrumb);
      this.breadcrumbs = this.breadcrumb;
    } else {
      this.breadcrumb.push({ label: 'My Solutions', url: '../../../' });
      this.breadcrumbs = this.breadcrumb;
    }
  }
  setValue(istrue: any) {
    this.modeSwitch = !this.modeSwitch;
    // this.raiservice.changeMode(this.modeSwitch);
  }
  ngOnInit(): void {
    this.authorization();
    this.initiativeName = this.route.snapshot.params['initiativeName'];
    this.initiativeId = this.route.snapshot.params['id'];
    this.breadcrumb.push({
      label: this.initiativeName,
      url: '../../',
    });
    this.childId = this.initiativeId;
    this.getInitiative();
    this.getcompoent();
  }
  ngOnChanges(changes: SimpleChanges) {
    // if (sessionStorage.getItem('aip.breadcrumb')) {
    //   this.breadcrumbs = JSON.parse(sessionStorage.getItem('aip.breadcrumb'));
    // }
    if (this.data) {
      this.getcompoent();
    }
  }
  selectedArtifact(artifact: any) {
    this.modeSwitch = true;
    this.refresh = false;
    this.selectArtifact = null;
    this.dataType = null;
    this.cdRef.detectChanges();
    this.selectArtifact = artifact;
    this.dataType = artifact.type;
    this.refresh = true;
    this.cdRef.detectChanges();
  }
  openModal(type: any, content: any): void {
    if (type == 'MODEL') {
      this.modalService.openModal(content, 'wide');
    } else {
      this.modalService.openModal(content, 'standard');
    }
  }
  reloads($event: any) {
    if ($event) {
      this.getcompoent();
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
  getcompoent() {
    this.component = [];
    this.services
      .getRelatedComponent(this.initiativeId, 'INITIATIVE')
      .subscribe({
        next: (res) => {
          // this.relatedloaded=true;
          this.relatedComponent = res[0];
          this.relatedComponent.data = JSON.parse(this.relatedComponent.data);
          if (
            !this.component.some(
              (comp) =>
                comp.id === this.relatedComponent.id &&
                comp.type === this.relatedComponent.type &&
                comp.alias === this.relatedComponent.alias
            )
          ) {
            this.component.push(this.relatedComponent);
          }
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
  stepperClass(status: any) {
    if (status == 'PENDING') {
      // return 'le-c-badge le-c-badge--warning';
      return 'initiative__yet-to-start';
    } else if (status == 'APPROVED') {
      return 'initiative__approved';
      // return 'le-c-badge le-c-badge--active';
    } else if (status == 'REJECTED') {
      return 'initiative__rejected';
      // return 'le-c-badge le-c-badge--active';
    } else if (status == 'APENDING') {
      return 'initiative__approval_pending';
    } else {
      return 'initiative__compeleted';
      // return 'le-c-badge le-c-badge--info';
    }
  }
  questionare(task: any) {
    this.modeSwitch = false;
    // let initiativeId = this.initiativeId;
    // let InitiativeMenu = this.initiativeMenu;
    // let initiativeName = this.initiativeName;
    let breadcrumb = this.breadcrumbs;
    this.router.navigate(
      ['./view/' + task.taskName + '/' + task.taskTemplateId],
      {
        state: {
          // task,
          // InitiativeMenu,
          // initiativeId,
          breadcrumb,
          // initiativeName
        },
        relativeTo: this.route,
      }
    );
  }
  getInitiative() {
    this.raiservice
      .getInitiativeCheckList(this.initiativeId)
      .subscribe((res: any) => {
        res.forEach((element: any) => {
          this.initiativeMenu.push(element);
        });
        this.initiativeMenu.sort((a, b) => {
          if (a.type === 'termsncondition') return -1;
          if (b.type === 'termsncondition') return 1;
          return 0;
        });
      });
  }
  initiativeDetails() {
    this.router.navigate(['./'], {
      relativeTo: this.route,
    });
    this.modeSwitch = false;
  }
  unlink(data: any) {
    let body = {};
    if (data.type == 'PIPELINE') {
      body['childId'] = data.data.cid;
    } else {
      body['childId'] = data.data.id;
    }
    body['childType'] = data.type;
    body['parentId'] = Number(this.childId);
    body['parentType'] = this.parentType;
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.services.removelinkage(body).subscribe(
          (res) => {
            if (res.status == 200) {
              // this.reloads.emit(true);
              this.raiservice.changeData(true);
            }
          },
          (error) => {
            this.services.messageService(error);
          }
        );
      }
    });
    this.reloads(true);
  }
  edit(comp: any) {
    this.selectedComp = comp;
  }
}
