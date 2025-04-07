import { HttpParams } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LedsLibService, LedsModalService, MessageBarComponent } from 'leds-lib';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { Services } from '../../services/service';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-grouped-features',
  templateUrl: './grouped-features.component.html',
  styleUrls: ['./grouped-features.component.scss']
})
export class GroupedFeaturesComponent {

  cardTitle:any="GroupName"
  @Input() instance:any;
  cards:any;
  fcards:any;
  fcard:any= [];
  payload: any;
  @Input() storeName:any;
  createAuth: boolean=true;
  deleteAuth: boolean;
  viewDetails:boolean;
  filter: string = '';
  item:any;
  attributes: any;
  uischema;
  keys: any = [];
  data = {};
  renderers = angularMaterialRenderers;
  constructor(
    private modalService: LedsModalService,
    private ledsLibService: LedsLibService,
    private service: Services,
    private dialog: MatDialog, 
    private matSnackbar: MatSnackBar
    ){}
  ngOnInit():void{
    
    this.getGroupedFeaturesList();
    this.Authentications();
  }
  Authentications() {

      this.service.getPermission("cip").subscribe((cipAuthority)=>{
           //GroupFeatures Create permission
    if (
      cipAuthority.includes('groupFeatures-create')
    )
      this.createAuth = true;
    // GroupFeatures Delete permission
    if (
      cipAuthority.includes('groupFeatures-delete')
    )
      this.deleteAuth = true;
      },(error)=>{
        console.log(`error when calling getPermission method. Error Details:${error}`);
      });
  }
 desc(content:any,card :any ){
    this.fcard=[];
    this.item= card.features;
    this.getFeatureList();
    console.log('item',this.item);
    if(this.item.length==0){
      let message = {
        message: "Group is empty",
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
    else
     this.modalService.openModal(content,'mini');
  }
  open(content:any){
    this.getGroupJsonForm();
    this.modalService.openModal(content,'mini');
  }
  getGroupedFeaturesList(): void {
    let params: HttpParams = new HttpParams();
      params = params.set('instance', this.instance);
    // params = params.set('page', this.pageNumber);
    // params = params.set('size', this.pageSize);
    params = params.set('store',this.storeName);
    params = params.set('project', sessionStorage.getItem('organization'));
   // params = params.set('isCached', false);
    this.service.getGroupedFeatures(params).subscribe((res) => {
      if(res.body.length===0){
        this.service.messageService(res,"No Group is Registered")
      }
      else{
      let data: any = [];      
      res.body.forEach((element: any) => {
        data.push(element);    
      });
         this.cards = data;
      //  console.log('DATA for grouped features', this.cards);
      // this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      // this.pageArr = [...Array(this.noOfPages).keys()];
    }
    });
  
    // this.pageSize = this.pageSize || 6;
  }
  getFeatureList(){
    let params: HttpParams = new HttpParams();
    params = params.set('instance', this.instance);
  params = params.set('store',this.storeName);
  params = params.set('project', sessionStorage.getItem('organization'));
  params = params.set('isCached', false);
  this.service.getFeatureList(params).subscribe((res:any) => {
    let data: any = [];      
    res.forEach((element: any) => {
      data.push(element);    
    });
    this.item.forEach((f:any)=>{
      data.forEach((ele)=>{
        if(ele.name==f){
          this.fcard.push(ele)
        }
      })
    });
      this.fcards = data;
  });
  }
  onClick(content: any, inc:any): void {
    this.fcard.forEach((ele)=>{
      if(ele.name===inc){
        this.payload=ele;
      }
    });
    this.modalService.openModal(content, 'standard');
  }
  getGroupJsonForm(){
    let label: any = [];
    this.service.getGroupJson(this.instance,this.storeName).subscribe((resp)=>{
      this.attributes = resp.attributes;
      this.uischema = resp.uischema;
      console.log(this.attributes);
      label.push(Object.keys(this.attributes));
      this.keys = label[0];
      console.log(this.keys);
    })
  }
  filterz(){}
  closeModal(){
    this.modalService.dismissAll();
    this.refreshComplete();
  }
  clickActive(eventObj: any) {
    this.ledsLibService.clickactive(eventObj);
  }
  
  register(){
    console.log(this.keys);
    console.log(this.attributes);
    console.log(this.data);
    let params:HttpParams = new HttpParams();
    params=params.set('instance',this.instance);
    params=params.set('store',this.storeName);
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.addFeaturesToGroup(params,this.data).subscribe((resp) => {
      console.log(resp);
      this.service.messageService(resp,"Group Created Successfully");
      this.refreshComplete();
      if(resp.status==200){this.closeModal();}
    },error=>{this.service.messageService(error);});
  }
  refreshComplete(){
    this.getGroupedFeaturesList();
  }
  deleteGroup(card){
    let groupName =card.name;
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.service.deleteFeaturesGroup(this.storeName,groupName,this.instance).subscribe((res) => {
          this.service.messageService(res, "Done!  Group Deleted Successfully");
          this.refreshComplete();
        }, error => { this.service.messageService(error); });
      }
    });
  }
  showData(event){
    this.data = event
  }
}
