import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LedsLibService, LedsModalService } from 'leds-lib';
import { Services } from '../../../services/service';
import { Clipboard } from '@angular/cdk/clipboard';
import { Location } from '@angular/common';
import { ConfirmDeleteDialogComponent } from '../../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { HttpParams } from '@angular/common/http';
import { LeapTelemetryService } from 'com-lib-util';

@Component({
  selector: 'app-dg-app-description',
  templateUrl: './dg-app-description.component.html',
  styleUrls: ['./dg-app-description.component.scss'],
})
export class DgAppDescriptionComponent {
  basicReqTab: any = 'DGAppTab';
  tooltipPoition: string = 'above';
  addTags: string = 'Add Tags to DGApp';
  // title:string ='DGApp';
  entity: string = 'DGApp';
  card: any;
  back: string = 'Back';
  parentType: string = 'DGAPP';
  relatedloaded: boolean = false;
  errorMessage: string;
  payload: any;
  instance: any;
  // editAuth: boolean = true;
  // linkAuth: boolean = true;
  // deleteAuth: boolean = true;
  linkAuth: boolean;
  editAuth: boolean;
  deleteAuth: boolean;
  items: any = [];
  tagStatus = {};
  // catStatus = {};
  selectedTag = [];
  //myArr:any
  constructor(
    private modalService: LedsModalService,
    private location: Location,
    private clipboard: Clipboard,
    private router: Router,
    private route: ActivatedRoute,
    private ledsLibService: LedsLibService,
    private dialog: MatDialog,
    private telemetryService: LeapTelemetryService,
    private service: Services
  ) {}

  ngAfterViewInit(): void {
    this.ledsLibService.middleHeight();
    this.ledsLibService.equalHT();
  }
  ngOnInit() {
    this.telemetryImpression();
    let cards = this.location.getState();
    console.log('cards', cards);
    this.card = cards['card'];
    // this.items = this.card.appName;
    // console.log('item',this.items);
    // this.getAllDgAppList();
    this.Authentications();
  }

  telemetryImpression() {
    this.telemetryService.start();
    this.telemetryService.impression("dg-app-description", "list", "dgAppDescriptionComponent");
  }

  Authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      if (cipAuthority.includes('dg-app-description-edit'))
        this.editAuth = true;
      if (cipAuthority.includes('dg-app-description-link'))
        this.linkAuth = true;
      if (cipAuthority.includes('dg-app-description-delete'))
        this.deleteAuth = true;
    });
  }

  openModal(content: any): void {
    this.modalService.openModal(content, 'standard');
    //this.getAllDgAppList();
    // this.getAssignedApp();
  }
  copyModel(artifacts: any) {
    this.clipboard.copy(artifacts);
    alert('Repo URL Copied to Clipboard');
  }
  navigateBack() {
    this.location.back();
  }
  redirection(card: any, type: string) {
    this.router.navigate(['../../' + type, card.appName], {
      state: {
        card,
      },
      relativeTo: this.route,
    });
  }
  basicReqTabChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = 'DGAppTab';
        this.ngAfterViewInit();
        break;
      case 1:
        this.basicReqTab = 'extras';
        this.processJson();
        break;
    }
  }
  processJson() {
    this.errorMessage = '';
    this.payload = this.card;
    try {
      this.payload = this.card;
      console.log('payload', this.payload);
    } catch (error) {
      this.errorMessage = 'error.message';
    }
  }
  closeModal() {
    this.modalService.dismissAll();
  }
  getShortName(fullName: string) {
    return fullName.charAt(0).toUpperCase();
  }
  filterByTag(tag) {
    console.log('tag', tag);
  }

  // getAllDgAppList(){
  //   this.instance= this.card.adapterId;
  //   this.service.getDgappsList(this.instance).subscribe((resp)=>{
  //     this.items=resp;
  //   })
  // }
  updateTag() {}
  deleteDGApp(card: any) {
    let appId = card.appId;
    this.instance = card.adapterId;
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.service.deleteDGApp(appId, this.instance).subscribe(
          (res) => {
            this.service.messageService(
              res,
              'Done! DGApp Deleted Successfully'
            );
            this.navigateBack();
          },
          (error) => {
            this.service.messageService(error);
          }
        );
      }
    });
  }
  refeshrelated(event: any) {
    if (event == true) {
      this.relatedloaded = false;
      setTimeout(() => {
        this.ngOnInit();
      }, 2000);
    }
  }
}
