import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Services } from '../services/service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { ListComponent, MessageBarComponent } from 'leds-lib';
import { LedsModalService } from 'leds-lib';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GroupedFeaturesComponent } from './grouped-features/grouped-features.component';
import { LeapTelemetryService } from 'com-lib-util';

@Component({
  selector: 'app-feature',
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.scss']
})

export class FeatureComponent  implements OnInit ,OnChanges{
  cardTitle: String = 'Features';
  test: any;
  @Input() storeName:any;
  groupName:any;
  options = [];
  datasetTypes = [];
  OptionType: any;
  selectedInstance: any;
  keys: any = [];
  users: any = [];
  filter: string = '';
  selectedCard: any = [];
  cardToggled: boolean = true;
  pageSize: number;
  pageNumber: number;
  pageArr: number[] = [];
  createAuth: boolean;
  editAuth: boolean;
  deleteAuth: boolean;
  labelPosition:any='before';
  showCheckbox:boolean=false;
  category = [];
  tags;
  tagsBackup;
  allTags: any;
  tagStatus = {};
  catStatus = {};
  selectedTag = [];
  selectedTagList: any[];
  selectedType: string[] = [];
  adapterTypes: any;
  selectedAdapterType: string[] = [];
  selectedAdapterInstance: string[] = [];
  adapterTypeList: any[] = [];
  adapterInstanceList: any[] = [];
  servicev1 = 'feature';
  @Input() instance:any;
  tagrefresh: boolean = false;
  alias = [];
  cards:any;
  selectedGroupName:any;
  featureGroup:boolean=false;
  isChecked:boolean=false;
  featureName:any[]=[];
  fName:any;
 constructor(
    private telemetryService: LeapTelemetryService,
    private service: Services,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: LedsModalService,
    private matSnackbar: MatSnackBar,
    private dialog: MatDialog,
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    //this.refresh();
  }
  ngOnInit(): void {
    this.telemetryImpression();
    this.getGroupedFeaturesList();
    this.Authentications();
    this.getList();  
  }

  telemetryImpression() {
    this.telemetryService.start();
    this.telemetryService.impression("aip-app", "list", "FeatureComponent");
  }

  Authentications() {
    //features-create permission

      this.service.getPermission("cip").subscribe((cipAuthority)=>{
        if (
          cipAuthority.includes('features-create')
        )
          this.createAuth = true;
        // features-edit/update permission
        if (
          cipAuthority.includes('features-edit')
        )
          this.editAuth = true;
        // features-delete permission
        if (
          cipAuthority.includes('features-delete')
        )
          this.deleteAuth = true;
      },(error)=>{
        console.log(`error when calling getPermission method. Error Details:${error}`);
      })
  }
  desc(card: any) {
    this.cardToggled = !this.cardToggled;
    this.selectedCard = card;
    console.log(this.selectedCard,'selected Card');
  }
  changedToogle(event: any) {
    this.cardToggled = event;
    this.getList();
  }
  open(content: any ,card?:any): void {
    this.modalService.openModal(content, 'standard');
    this.selectedCard=card;
  }
  redirection(card: any, type: string) {
    this.router.navigate(['./' + type], {
      state: {
        card,
      },
      relativeTo: this.route,
    });
  }  
  getList(): void {
    let params: HttpParams = new HttpParams();
      params = params.set('instance', this.instance);
    // params = params.set('page', this.pageNumber);
    // params = params.set('size', this.pageSize);
    params = params.set('store',this.storeName);
    params = params.set('project', sessionStorage.getItem('organization'));
    params = params.set('isCached', false);
    this.service.getFeatureList(params).subscribe((res:any) => {
      let data: any = [];      
      res.forEach((element: any) => {
        data.push(element);     
      });
      if(data.length===0){
        let message = {
          message: "No Featutres is registered",
          button: false,
          type: 'success',
          successButton: 'Ok',
          errorButton: 'Cancel',
        };
        this.matSnackbar.openFromComponent(MessageBarComponent, {
          data: message,
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: '',
        });
      }
        this.cards = data;
        console.log('DATA', this.cards);    
      // this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      // this.pageArr = [...Array(this.noOfPages).keys()];
    });
    // this.pageSize = this.pageSize || 6;
  }
  getGroupedFeaturesList(): void {
    let params: HttpParams = new HttpParams();
      params = params.set('instance', this.instance);
    params = params.set('store',this.storeName);
    params = params.set('project', sessionStorage.getItem('organization'));
    this.groupName=[];
    this.service.getGroupedFeatures(params).subscribe((res) => {   
      res.body.forEach((element: any) => {
        this.groupName.push({viewValue:element.name,value:element.name})   
      });
       //  console.log('group from feature',this.groupName);
    });
  }

  refreshComplete(){
    this.isChecked=false;
    this.featureName=[];
    this.featureGroup=false;
    this.getGroupedFeaturesList();
    // setTimeout(() => {
    //   this.getList();
    // }, 1000); 
    this.getList();
  }
  addItem(event:any){
   this.getList();    
  }
  onclick(card:any){
    console.log('name',name);
    
    this.featureGroup=true;
   if(this.featureName.length>=0){
     if(this.featureName.includes(card.name)){
      let index= this.featureName.indexOf(card.name);
       this.featureName.splice(index,1);
       if(this.featureName.length===0){
         this.featureGroup=false;
         this.isChecked=false;
       }
     }
     else
     this.featureName.push(card.name);
   }
  }
  onSelect(event:any){
    this.selectedGroupName=event;
    this.isChecked=true;
  }
  onChange(event:any){
    this.showCheckbox=event.checked;    
    if(event.checked===false){
      this.featureGroup=false;
      this.isChecked=false;
    }  
  }
  addFeaturesToGroup(){
    this.fName=this.featureName.join(',');
    // console.log('fName',this.fName);
    
    let params:HttpParams = new HttpParams();
    params=params.set('instance',this.instance);
    params=params.set('store',this.storeName);
    params = params.set('selectedGroup',this.selectedGroupName);
    params =params.set('selectedFeatures',this.fName);
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.addFeaturesToGroup(params).subscribe( (resp) => {
      console.log(resp);
      this.service.messageService(resp, 'features added');
      this.refreshComplete();
    },
    (error) => {
      this.service.messageService(error);
    }
  )
  }
 
  deleteFeatures(card){
    let featuresName =card.name;
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.service.deleteFeatures(this.storeName,this.instance,featuresName).subscribe((res) => {
          this.service.messageService(res, "Done!  Features Deleted Successfully");
          this.refreshComplete();
        }, error => { this.service.messageService(error); });
      }
    });
  }
}
