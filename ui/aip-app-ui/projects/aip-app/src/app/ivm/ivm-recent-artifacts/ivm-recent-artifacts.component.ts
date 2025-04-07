import { Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LedsModalService } from 'leds-lib';
import { Subscription } from 'rxjs';
import { Services } from '../../services/service';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { RaiservicesService } from '../../services/raiservices.service';
@Component({
  selector: 'app-ivm-recent-artifacts',
  templateUrl: './ivm-recent-artifacts.component.html',
  styleUrls: ['./ivm-recent-artifacts.component.scss'],
})
export class IvmRecentArtifactsComponent implements OnInit {
  @ViewChild('scrollableDiv1', { read: ElementRef })
  // @Output() reloads = new EventEmitter<boolean>();
  public scrollableDiv1: ElementRef<any>;
  @Input() initiativeId: any;
  childId?: any;
  @Input() parentType: any;
  groupData: { [key: string]: any[] } = {};
  resultObserver: any;
  groupkey: any[] = [];
  unlinkinitiative: boolean = false;
  protected subscriptions: Subscription[] = [];
  selectedGroup: any = '';
  size: number = 5;
  page: number = 0;
  search: any = '';
  

  constructor(
    private modalService: LedsModalService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private dialog: MatDialog,
    private cdref: ChangeDetectorRef,
    private service: Services,
    private raiservice: RaiservicesService
  ) {}
  ngOnInit(): void {
    this.childId = this.initiativeId;
    if (this.router.url.includes('viewinitiative')) {
      this.getArtifacts();
      setTimeout(() => {
        this.selectedGroup = this.groupkey[0];
      }, 2500);
    } else {
      this.getAllArtifacts();
      this.selectedGroup = 'DATASET';
    }
    this.Authentications();
  }

  selectionChange(event: any) {
    this.selectedGroup = event;
  }
  scrollLeft1(): void {
    this.scrollableDiv1.nativeElement.scrollTo({
      left: this.scrollableDiv1.nativeElement.scrollLeft - 150,
      behavior: 'smooth',
    });
  }
  scrollRight1() {
    this.scrollableDiv1.nativeElement.scrollTo({
      left: this.scrollableDiv1.nativeElement.scrollLeft + 150,
      behavior: 'smooth',
    });
  }
  getArtifacts() {
    const subscription = this.service
      .getRelatedComponent(this.initiativeId, 'INITIATIVE')
      .subscribe({
        next: (val) => {
          this.resultObserver = val;
          if (this.resultObserver.length > 0) {
            if (!this.groupData[this.resultObserver[0].type]) {
              this.groupData[this.resultObserver[0].type] = [];
            }

            this.groupData[this.resultObserver[0].type].push({
              // data: this.resultObserver[0],
              data: JSON.parse(this.resultObserver[0].data),
              status: false,
              type_nav: this.resultObserver[0].type,
            });

            this.groupkey = Object.keys(this.groupData);

            this.cdref.detectChanges();
          }
        },
        error: (err) => {
        },
      });

    this.subscriptions.push(subscription);
  }
  getAllArtifacts() {
    const subscription = this.service
      .getCommonSearchData(this.size, this.page, this.search)
      .subscribe({
        next: (val) => {
          this.resultObserver = val;
          if (this.resultObserver.length > 0) {
            if (!this.groupData[this.resultObserver[0].type]) {
              this.groupData[this.resultObserver[0].type] = [];
            }

            this.groupData[this.resultObserver[0].type].push({
              // data: this.resultObserver[0],
              data: JSON.parse(this.resultObserver[0].data),
              status: false,
              type_nav: this.resultObserver[0].type,
            });

            this.groupkey = Object.keys(this.groupData);

            this.cdref.detectChanges();
          }
        },
        error: (err) => {
          console.log(err);
        },
      });

    this.subscriptions.push(subscription);
  }

  redirection(cards: any, type: string) {
    let back = '';
    let card = cards.data;

    if (this.router.url.includes('viewinitiative')) {
      back = '../../../../' + cards.type_nav.toLowerCase() + 's';
    }

    if (!this.router.url.includes('viewinitiative')) {
      back = '../' + cards.type_nav.toLowerCase() + 's';
    }
    if (cards.type_nav == 'PIPELINE') {
      this.service.getStreamingServices(card.cid).subscribe((res) => {
        let streamItem = res;
        const navigationExtras: NavigationExtras = {
          state: {
            cardTitle: 'Pipeline',
            pipelineAlias: streamItem.alias,
            streamItem: streamItem,
            card: card,
          },
          relativeTo: this.route,
        };
        if (streamItem.type === 'NativeScript') {
          this.router.navigate(
            [back + '/view' + '/' + streamItem.name],
            navigationExtras
          );
        } else {
          this.router.navigate(
            [back + '/view/drgndrp' + '/' + streamItem.name],
            navigationExtras
          );
        }
      });
    }
    if (cards.type_nav == 'APP') {
      back = '../../../../' + cards.type_nav.toLowerCase() ;
      if (cards.data.scope == "external" || cards.data.type == 'runApp') {
        window.open(cards.data.tryoutlink, "_blank");
        return
      }
      else{
      this.router.navigate([back + '/' + cards.data.name+'/'+'runApp'], {
        state: {
          card,
        },
        relativeTo: this.route,
      });}
    }
    if (cards.type_nav != 'PIPELINE' && cards.type_nav != 'APP' ) {
      this.router.navigate([back + '/' + type + '/' + cards.data.name], {
        state: {
          card,
        },
        relativeTo: this.route,
      });
    }
  }

  Authentications() {   
        this.service.getPermission('cip').subscribe((cipAuthority) => {
          if (cipAuthority.includes('initiative-unlink')) this.unlinkinitiative = true;
        });
      }
  
  unlink(data: any) {
    let body = {};
    if (data.type_nav == 'PIPELINE') {
      body['childId'] = data.data.cid;
    } else {
      body['childId'] = data.data.id;
    }
    body['childType'] = data.type_nav;
    body['parentId'] = Number(this.childId);
    body['parentType'] = this.parentType;
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.service.removelinkage(body).subscribe(
          (res) => {
            if (res.status == 200) {
              // this.reloads.emit(true);
              this.raiservice.changeData(true);
              this.cdref.detectChanges();
            }
          },
          (error) => {
            this.service.messageService(error);
          }
        );
      }
    });
  }
}
