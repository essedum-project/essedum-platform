import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { LedsLibService, LedsModalService } from 'leds-lib';
import { Clipboard } from '@angular/cdk/clipboard';
import { DomSanitizer } from '@angular/platform-browser';
import { AfterViewInit, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { Services } from '../../services/service';
import { Location } from '@angular/common';
import { AdapterServices } from '../../adapter/adapter-service';
import { HttpParams } from '@angular/common/http';
@Component({
  selector: 'app-endpoint-description',
  templateUrl: './endpoint-description.component.html',
  styleUrls: ['./endpoint-description.component.scss'],
})
export class EndpointDescriptionComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Input() initiativeData: any;
  @Input() card: any;
  @Input() cardToggled: boolean = false;
  cardCreator: string;
  avatar: string;
  addTags: string = 'Add Tags to Model';
  edit: string = 'Edit';
  delete: string = 'Delete';
  back: string = 'Back';
  resizeing: boolean = false;
  tooltipPoition: string = 'above';
  editAuth: boolean;
  linkAuth: boolean;
  deleteAuth: boolean;
  endpointUnlink: boolean;
  component: any = [];
  relatedComponent: any;
  entity: string = 'endpoint';
  language: any = [
    { viewValue: 'Java', value: 'Java' },
    { viewValue: 'Python', value: 'Python' },
  ];
  label: any = [{ viewValue: 'Codegen', value: 'Codegen' }];
  basicReqTab: any = 'endpointTab';
  tryoutAvailable: boolean = true;
  tryoutUrl: any = '';
  tagAuth: boolean;
  relatedloaded: boolean = false;
  isVMAdapter: boolean = false;
  organisation: string;
  sourceName: string = this.route.snapshot.paramMap.get('name');
  initiativeView: boolean;
  connectionNames = [];
  constructor(
    private modalService: LedsModalService,
    private clipboard: Clipboard,
    private sanitizer: DomSanitizer,
    private ledsLibService: LedsLibService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private service: Services,
    private adapterServices: AdapterServices,
    private location: Location,
    private cdRef: ChangeDetectorRef
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params['org']) {
        this.organisation = params['org'];
      } else {
        this.organisation = sessionStorage.getItem('organization');
      }
    });
  }
  @Output() newItemEvent = new EventEmitter<boolean>();
  isMaximize = false;

  maximize() {
    this.isMaximize = !this.isMaximize;
    document
      .getElementById('my-modal-dialog')
      .classList.add('modal-fullscreen');
  }
  redirection(card: any, type: string) {
    this.router.navigate(['../../' + type], {
      state: {
        card,
      },
      relativeTo: this.route,
    });
  }
  tryout() {
    this.router.navigate(
      ['../tryout', this.card.sourceId, this.card.adapterId],
      {
        relativeTo: this.route,
      }
    );
  }
  restore() {
    this.isMaximize = !this.isMaximize;
    document
      .getElementById('my-modal-dialog')
      .classList.remove('modal-fullscreen');
  }
  ngOnChanges() {
    this.ngOnInit();
    this.ngAfterViewInit();
  }
  ngAfterViewInit(): void {
    this.ledsLibService.middleHeight();
    this.ledsLibService.equalHT();
  }
  ngOnInit() {
    this.router.url.includes('initiative')
      ? (this.initiativeView = false)
      : (this.initiativeView = true);
    this.getPermission();
    // console.log(history.state);
    // if (history.state.relatedData) {
    //   console.log(history.state);
    //   let cards = this.location.getState();
    //   console.log('relatedData', cards['relatedData'].data);
    //   this.card = cards['relatedData'].data;
    // } else {
    //   let cards = this.location.getState();
    //   this.card = cards['card'];
    // }
    if (!this.sourceName) {
      this.sourceName = this.initiativeData.sourceName;
    }
    let params: HttpParams = new HttpParams();
    params = params.set('fed_Name', this.sourceName);
    params = params.set('org', this.organisation);
    this.service.getEndpointBySourceId(params).subscribe((res) => {
      this.card = res[0];
      this.getRelatedComponent();
    });
    if (!this.card.application) this.checkVMAdapter(this.card.adapterId);
    // let cards = this.location.getState();
    // if(this.router.url.includes('related')){
    //   console.log('cards', cards['card'].data);
    //   this.card = cards['card'].data;
    // }
    // else{
    //   let cards = this.location.getState();
    //   this.card = cards['card'];
    // }

    console.log(this.card);
    // document.getElementsByTagName("iframe")[0].className = "fullScreen";
    console.log(this.cardToggled);
    // if(this.card.createdBy){
    // this.cardCreator = this.card.createdBy.split('@')[0];
    // this.avatar = this.cardCreator.charAt(0).toUpperCase();}
    //  this.tryoutAvailable = true;
    this.tryoutUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.card.application
    );
    if (this.tryoutUrl) {
      this.tryoutAvailable = true;
    } else {
      this.tryoutAvailable = false;
    }
  }
  getPermission() {
    // endpoint-edit/update permission
    this.service.getPermission('cip').subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes('endpoint-edit')) this.editAuth = true;
        if (cipAuthority.includes('endpoint-delete')) this.deleteAuth = true;
        if (cipAuthority.includes('endpoint-tag')) this.tagAuth = true;
        if (cipAuthority.includes('link-component')) this.linkAuth = true;
        if (cipAuthority.includes('endpoint-unlink'))
          this.endpointUnlink = true;
      },
      (error) => {
        console.log(
          `error when calling getPermission method. Error Details:${error}`
        );
      }
    );
  }
  getRelatedComponent() {
    this.component = [];
    this.service
      .getRelatedComponent(this.card.id, 'ENDPOINT')
      .subscribe((res) => {
        this.relatedComponent = res[0];
        this.relatedComponent.data = JSON.parse(this.relatedComponent.data);
        this.component.push(this.relatedComponent);
        // console.log(this.component);
        this.cdRef.detectChanges();
        // this.relatedloaded=true;
      });
  }

  checkVMAdapter(dsrcId) {
    this.adapterServices.getDataSource(dsrcId).subscribe((res) => {
      if (res && res.connectionDetails) {
        let connectionDetails = JSON.parse(res.connectionDetails);
        if (
          connectionDetails &&
          connectionDetails.executionEnvironment &&
          connectionDetails.executionEnvironment == 'Remote'
        ) {
          this.isVMAdapter = true;
          this.resizeing = false;
        }
      }
    });
  }

  refreshiframe() {
    setTimeout(() => {
      this.ngOnInit();
    }, 1000);
  }
  openModal(content: any): void {
    this.modalService.openModal(content, 'standard');
  }
  toggler() {
    this.location.back();
    // this.cardToggled = !this.cardToggled;
    // console.log(this.cardToggled);
    // this.newItemEvent.emit(this.cardToggled);
    // if(this.router.url.includes('related')){
    //   this.location.back();}
  }

  getShortName(fullName: string) {
    return fullName.charAt(0).toUpperCase();
  }
  copyModel(contextUri: any) {
    this.clipboard.copy(contextUri);
    alert('Endpoint Sample Input Copied to Clipboard');
  }
  basicReqTabChange(index) {
    if (this.card.application && this.card.restProvider) {
      switch (index) {
        case 0:
          this.basicReqTab = 'endpointTab';
          this.ngAfterViewInit();
          break;
        case 1:
          this.basicReqTab = 'swaggerTab';
          break;
        case 2:
          this.basicReqTab = 'tryItOutTab';
          if (!this.isVMAdapter) this.resizeing = true;
          break;
      }
    }else if(!this.card.application && this.card.restProvider){
      switch (index) {
        case 0:
          this.basicReqTab = 'endpointTab';
          this.ngAfterViewInit();
          break;
        case 1:
          this.basicReqTab = 'swaggerTab';
          break;
      }
    }else if(this.card.application && !this.card.restProvider){
      switch (index) {
        case 0:
          this.basicReqTab = 'endpointTab';
          this.ngAfterViewInit();
          break;
        case 1:
          this.basicReqTab = 'tryItOutTab';
          if (!this.isVMAdapter) this.resizeing = true;
          break;
      }
    }
  }
  
  delteEndpoint(card) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.service.deleteEndpoint(card.fedId, card.adapterId).subscribe(
          (res) => {
            this.service.messageService(
              res,
              'Done!  Endpoint Deleted Successfully'
            );
          },
          (error) => {
            this.service.messageService(error);
          }
        );
      }
    });
  }

  reload($event: any) {
    if ($event) {
      this.ngOnInit();
    }
  }
  refeshrelated(event: any) {
    if (event == true) {
      this.relatedloaded = false;
      setTimeout(() => {
        this.ngOnInit();
      }, 2000);
    }
  }
  open(content: any): void {
    this.modalService.openModal(content, 'standard');
  }
}
