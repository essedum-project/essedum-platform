import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LedsLibService, LedsModalService, MessageBarComponent } from 'leds-lib';
import { Clipboard } from '@angular/cdk/clipboard';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Services } from '../../services/service';
import { HttpParams } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-features-description',
  templateUrl: './features-description.component.html',
  styleUrls: ['./features-description.component.scss']
})
export class FeaturesDescriptionComponent {
  @Input() card: any;
  @Input() cardToggled: boolean = false;
  @Input() storeName: any;
  cardCreator: string;
  avatar: string;
  addTags: string = 'Add Tags to Features';
  edit: string = 'Edit';
  delete: string = 'Delete';
  tooltipPoition: string = 'above';
  editAuth: boolean;
  deleteAuth: boolean;
  back: string = 'Back';
  entity: string = 'features';
  relatedComponent = [];
  selectedCard: any = [];
  basicReqTab: any = 'details';
  @Input() instance: any;
  cardsDetails: any;
  errorMessage: string;
  payload: any;

  constructor(
    private modalService: LedsModalService,
    private clipboard: Clipboard,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private service: Services,
    private matSnackbar: MatSnackBar,
    private ledsLibService: LedsLibService,
  ) { }
  @Output() newItemEvent = new EventEmitter<boolean>();
  ngAfterViewInit(): void {
    this.ledsLibService.middleHeight();
    this.ledsLibService.equalHT();
  }
  ngOnInit(): void {
    console.log("cards from des", this.card);
    this.cardsDetails = this.card.additionalProperties;
    console.log(this.cardToggled);
    this.Authentications();
  }
  Authentications() {
      this.service.getPermission("cip").subscribe((cipAuthority)=>{
    // featuresDescription-edit/update permission
        if (
          cipAuthority.includes('featuresDescription-edit')
        )
          this.editAuth = true;
        // featuresDescription-delete permission
        if (
          cipAuthority.includes('featuresDescription-delete')
        )
          this.deleteAuth = true;
      },(error)=>{
        console.log(`error when calling getPermission method. Error Details:${error}`);
      })
  }
  desc(card: any) {
    this.cardToggled = !this.cardToggled;
    this.selectedCard = card;
    console.log(this.selectedCard, 'selected Card');
  }
  openModal(content: any): void {
    this.modalService.openModal(content, 'standard');
  }
  open(content: any, card?: any): void {
    this.modalService.openModal(content, 'standard');
    this.selectedCard = card;
    console.log(this.selectedCard, 'selected Card');
  }
  toggler() {
    this.cardToggled = !this.cardToggled;
    console.log(this.cardToggled);
    //this.newItemEvent.emit(this.cardToggled);
  }

  redirection(card: any, type: string) {
    this.router.navigate(['./' + type], {
      state: {
        card,
      },
      relativeTo: this.route,
    });
  }
  getFeatureProfile() {
    console.log('name from profile', this.card.name);

    let params: HttpParams = new HttpParams();
    params = params.set('type', null);
    params = params.set('store', this.storeName);
    params = params.set('project', sessionStorage.getItem('organization'));
    params = params.set('instance', this.instance);
    params = params.set('featureName', this.card.name);
    this.service.getFeatureProfile(params).subscribe({
      next: res => {
        this.payload = res;
      }, error: err => {
        let message = {
          message: err,
          button: false,
          type: 'error',
          successButton: 'Ok',
          errorButton: 'Cancel',
        };
        this.matSnackbar.openFromComponent(MessageBarComponent, {
          data: message,
          duration: 10000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: '',
        });

      }
    }

    )
  }
  basicReqTabChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = 'details';
        this.ngAfterViewInit();
        break;
      case 1:
        this.basicReqTab = 'featuresProfile';
        this.payload ={};        
        this.getFeatureProfile();
        break;
      case 2:
        this.basicReqTab = 'featuresExtras';
        this.processJson();
        break;
    }
  }
  processJson() {
    this.errorMessage = '';
    this.payload = this.card;
    try {
      this.payload = (this.card);
    } catch (error) {
      this.errorMessage = 'error.message';
    }
  }
  refreshiframe() {
    setTimeout(() => {
      this.ngOnInit();
    }, 1000);
  }
  deleteFeatures(card) {
    let featuresName = card.name;
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.service.deleteFeatures(this.storeName, this.instance, featuresName).subscribe((res) => {
          this.service.messageService(res, "Done!  Features Deleted Successfully");
          if (res.status == 200) {
            this.newItemEvent.emit(featuresName);
            this.closeModal();
          }
        }, error => { this.service.messageService(error); });
      }
    });
  }
  closeModal() {
    this.modalService.dismissAll();
  }
}
