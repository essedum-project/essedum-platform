import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LedsLibService, LedsModalService } from 'leds-lib';
import { Clipboard } from '@angular/cdk/clipboard';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Services } from '../../services/service';
import { HttpParams } from '@angular/common/http';
import { Location } from '@angular/common';

@Component({
  selector: 'app-feature-store-description',
  templateUrl: './feature-store-description.component.html',
  styleUrls: ['./feature-store-description.component.scss']
})
export class FeatureStoreDescriptionComponent {

  @Input() card: any;
  @Input() cardToggled: boolean = false;
  cardCreator: string;
  addTags: string = 'Add Tags to Feature-Store';
  edit: string = 'Edit';
  delete: string = 'Delete';
  tooltipPoition: string = 'above';
  editAuth: boolean;
  deleteAuth: boolean;
  back: string = 'Back';
  entity: string = 'feature-store';
  relatedComponent :any;
  basicReqTab: any = 'featureStoreTab';
  cardsDetails:any;
  instance:any;
  storeName:any;
  errorMessage: string;
  payload: any;
  cards:any;
  linkAuth: boolean;
  relatedloaded:boolean=false;
  component:any=[];
  parentType: string='FEATURESTORE';
  featureStoreUnlink: boolean;
  initiativeView: boolean;
  constructor(
    private modalService: LedsModalService,
    private clipboard: Clipboard,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private service: Services,
    private location :Location,
    private ledsLibService: LedsLibService,
    private cdRef:ChangeDetectorRef,
  ) {}
  @Output() newItemEvent = new EventEmitter<boolean>();
  reload($event:any){
    if($event){
      this.ngOnInit();
    }
  }
  ngAfterViewInit(): void {
    this.ledsLibService.middleHeight();
    this.ledsLibService.equalHT();
  }
  unlink(data:any){
    let body={};
    body['childId']=data.id;
    body['childType']=data.type;
    body['parentId']=this.card.id;
    body['parentType']=this.parentType;
    this.service.removelinkage(body).subscribe(res=>{
      console.log(res+"unlinkage done");
      if(res.status==200){
      this.ngOnInit()}
    },error=>{});
 
  }
  ngOnInit() {
    if (this.router.url.includes('initiative')) {
      this.initiativeView = false;
    } else {
      this.initiativeView = true;
      if (history.state.relatedData) {
        // console.log(history.state);
        let cards = this.location.getState();
        // console.log('relatedData', cards['relatedData'].data);
        this.card = cards['relatedData'].data;
      } else {
        let cards = this.location.getState();
        this.card = cards['card'];  
      }
    }
    this.instance = this.card.featureStoreId['adapterId'];    
    this.storeName=this.card.name;
    console.log(this.cardToggled);
    this.getRelatedComponent();
    this.Authentications();
  }
  
  Authentications(){
      this.service.getPermission("cip").subscribe((cipAuthority)=>{
              // featureStore-edit/update permission
    if (
    cipAuthority.includes('featureStore-edit')
    )
      this.editAuth = true;
    // featureStore-delete permission
    if (
    cipAuthority.includes('featureStore-delete')
    )
      this.deleteAuth = true;
      },(error)=>{
        console.log(`error when calling getPermission method. Error Details:${error}`);
      })
       // linking related components
    // if (
    // sessionStorage.getItem('cipAuthority') &&
    // sessionStorage.getItem('cipAuthority').includes('featureStore-link')
    // )
      this.linkAuth = true;
     // if (
      //   sessionStorage.getItem('cipAuthority') &&
      //   sessionStorage.getItem('cipAuthority').includes('featureStoreUnlink-unlink')
      // )
      this.featureStoreUnlink = true;
  }

  getRelatedComponent(){
    this.component=[];
    this.service.getRelatedComponent(this.card.id,'FEATURESTORE').subscribe({next:res => {
      // this.relatedloaded=true;
      this.relatedComponent=res[0];
      this.relatedComponent.data=JSON.parse(this.relatedComponent.data)
      this.component.push(this.relatedComponent);
      this.cdRef.detectChanges();
      
      // console.log(this.component);
    },
    complete() {
      console.log('completed');
    },
    error:err => {console.log(err);},
  });
  }
  openModal(content: any): void {
    this.modalService.openModal(content, 'standard');
  }
  navigateBack() {
    this.location.back();
  }
  redirection(card: any, type: string) {
    this.router.navigate(['../../' + type,card.featureStoreId['sourceName']], {
      state: {
        card,
      },
      relativeTo: this.route,
    });
  }
  basicReqTabChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = 'featureStoreTab';
        this.ngAfterViewInit();
        break;
      case 1:
        this.basicReqTab = 'featureTab';        
        break;
      case 2:
        this.basicReqTab = 'groupedFeatures';
        break;
      case 3:
        this.basicReqTab = 'feastExtras';
        this.processJson();
        break;
    }
  }
  processJson() {
    this.errorMessage = '';
    this.payload = this.card;
    try {
      this.payload = (this.card);
      console.log('payload',this.payload);
    } catch (error) {
      this.errorMessage = 'error.message';
    }
  }
  refreshiframe() {
    setTimeout(() => {
      this.ngOnInit();
    }, 1000);
  }
  deleteFeatureStore(card){
    let storeName =card.name;
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.service.deleteFeatureStore(storeName,this.instance).subscribe((res) => {
          this.service.messageService(res, "Done! FeatureStore Deleted Successfully");
        }, error => { this.service.messageService(error); });
      }
    });    
  }
  open(content: any): void{
    this.modalService.openModal(content, 'standard');}
    refeshrelated(event:any){
      if(event==true){
        this.relatedloaded=false;
        setTimeout(() => {
          this.ngOnInit();
        }, 2000);
      }
    }
  // open(content: any): void{
  //   this.modalService.openModal(content, 'standard');}
  //   refeshrelated(event:any){
  //     if(event==true){
  //       this.relatedloaded=false;
  //       this.ngOnInit();
  //     }
  //   }
}
