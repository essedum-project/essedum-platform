import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LedsLibService, LedsModalService } from 'leds-lib';
import { Services } from '../../../services/service';
import { Clipboard } from '@angular/cdk/clipboard';
import { Location } from '@angular/common';
import { ConfirmDeleteDialogComponent } from '../../../confirm-delete-dialog.component/confirm-delete-dialog.component';

@Component({
  selector: 'app-agent-description',
  templateUrl: './agent-description.component.html',
  styleUrls: ['./agent-description.component.scss']
})
export class AgentDescriptionComponent {
  basicReqTab: any = 'AgentTab';
  tooltipPoition: string = 'above';
  addTags: string = 'Add Tags to Agent';
  entity: string = 'Agent';
  card: any;
  back: string = 'Back';
  parentType: string = 'Agent';
  relatedloaded: boolean = false;
  errorMessage: string;
  payload: any;
  instance: any;
  editAuth: boolean=true;
  deleteAuth: boolean=true;
  linkAuth: boolean=true;
  constructor(
    private modalService: LedsModalService,
    private location: Location,
    private clipboard: Clipboard,
    private router: Router,
    private route: ActivatedRoute,
    private ledsLibService: LedsLibService,
    private dialog: MatDialog,
    private service: Services
  ) {}

  ngAfterViewInit(): void {
    this.ledsLibService.middleHeight();
    this.ledsLibService.equalHT();
  }
  ngOnInit() {
    let cards = this.location.getState();
    console.log('cards', cards);

    this.card = cards['card'];
    this.Authentications();
  }
  Authentications() {
    // this.service.getPermission('cip').subscribe((cipAuthority) => {
    //   if (cipAuthority.includes('dg-tool-description-edit'))
    //     this.editAuth = true;
    //   if (cipAuthority.includes('dg-tool-description-delete'))
    //     this.deleteAuth = true;
    //   if (cipAuthority.includes('dg-tool-description-link'))
    //     this.linkAuth = true;
    // });
  }
  openModal(content: any): void {
    this.modalService.openModal(content, 'standard');
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
        this.basicReqTab = 'AgentTab';
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
  getShortName(fullName: string) {
    return fullName.charAt(0).toUpperCase();
  }
  routeBackToToolList() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
  // deleteDGTool(card: any) {
  //   let toolName = card.toolName;
  //   const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result === 'delete') {
  //       this.service.deleteDGTool(toolName).subscribe(
  //         (res) => {
  //           this.service.messageService(
  //             res,
  //             'Done! Thoughts Deleted Successfully'
  //           );
  //           this.routeBackToToolList();
  //         },
  //         (error) => {
  //           this.service.messageService(error);
  //         }
  //       );
  //     }
  //   });
  // }
  refeshrelated(event: any) {
    if (event == true) {
      this.relatedloaded = false;
      setTimeout(() => {
        this.ngOnInit();
      }, 2000);
    }
  }


}
