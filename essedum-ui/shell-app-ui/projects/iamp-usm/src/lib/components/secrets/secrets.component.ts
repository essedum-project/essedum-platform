import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from "../../services/message.service";
import { SecretService } from '../../services/secret.service';
import { DeleteComponent } from '../../shared-modules/confirm-delete/delete.component';

@Component({
  selector: 'lib-secrets',
  templateUrl: './secrets.component.html',
  styleUrls: ['./secrets.component.css']
})
export class SecretsComponent {
  showList: boolean = true;
   dashConstantList: MatTableDataSource<any> = new MatTableDataSource();
  
  displayedColumns: string[] = ["id", "keys", "actions"];
  showCreate: boolean =false;
  configureTheme: boolean = false;
  edit:boolean = false;
  view :boolean=false;
  type:string;
  keys:string="";
  keyId:any;
  passcode:string="";
  pageNumber:number=0;
  pageSize:number=10;
  data:any=[];
  showPass:boolean;
  hidePass:boolean=true;
  title:string;
  showLoader:boolean;
  search: string[]=[];
  // pageSize: number;
  // pageNumber: number;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number = 0;
  prevRowsPerPageValue: number;
  itemsPerPage: number[] = [6, 9, 18, 36, 54,];
  noOfItems: number;
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();
  endIndex: number;
  startIndex: number;
  pageNumberChanged: boolean = true;
  

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confirmDialog: MatDialog,
    private secretsService :SecretService,
    public messageService: MessageService,
    private changeDetectionRef: ChangeDetectorRef
  ){}
  ngOnInit(){
    // this.keys = this.keys.concat('app_')
    this.pageSize = this.itemsPerPage[0];
    this.pageNumber = 1;
    this.getCount();
    this.getList();
    this.indexChanged();
    this.route.params.subscribe((params) => {    
      this.type = params["type"];
    });    
    if(this.type=="edit"){
      this.route.params.subscribe((params) => {     
        this.keys = params["key"];
      });
      this.showCreate = true;
      this.edit = true;
      this.showLoader=true;
      this.secretsService.getPasscode(this.keys).subscribe((res:any)=>{
        this.showLoader=false;
       this.hidePass=true;
       this.passcode=res;      
      },(error)=>{
       // this.showPass=false;
                  
      })
    }    
    console.log('data',this.data);
   // this.dashConstantList=this.data;       
  }
  indexChanged(){
    if (this.pageNumberChanged) {
      this.pageNumber = 1;
      this.startIndex = 0;
      this.endIndex = 5;
    }
  }
  nextPage() {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      this.changePage();
    }
  }
  prevPage() {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      this.changePage();
    }
  }
  changePage(page?: number) {
    if (page && page >= 1 && page <= this.noOfPages) this.pageNumber = page;
    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      this.pageChanged.emit(this.pageNumber);
      if (this.pageNumber > 5) {
        this.endIndex = this.pageNumber;
        this.startIndex = this.endIndex - 5;
      } else {
        this.startIndex = 0;
        this.endIndex = 5;
      }
    }
    this.getList();
  }
  rowsPerPageChanged() {
    if (this.pageSize == 0) {
      this.pageSize = this.prevRowsPerPageValue;
    } else {
      this.pageSizeChanged.emit(this.pageSize);
      this.prevRowsPerPageValue = this.pageSize;
      this.changeDetectionRef.detectChanges();
    }
  }
  
  filterItem(value){    
    let filterData:any=[];
    this.noOfPages=0;
    value=value.toLowerCase(value);
    if(!value.startsWith("app_")){
      var k = "app_";
      value=k.concat(value);      
    }
    // if(value.startsWith("app_")){
        this.data.forEach((e:any)=>{
        var eKey=e.key
        eKey=eKey.toLowerCase(eKey);
        if(eKey===value){
          filterData.push(e);
        }
      }) 
      if(filterData.length!==0){ 
        this.noOfItems=filterData.length;     
        this.dashConstantList=filterData;
        this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
        this.pageArr = [...Array(this.noOfPages).keys()];
        this.pageSize = this.pageSize || 6;
      }
      else{
        this.messageService.message("No Records Found")
        this.keys="";
      }
  //}
  // else{
  //   this.messageService.message("Invalid Input")
  //   this.keys="";
  // }

  }
  getList():void {
    this.data=[];
    let param :HttpParams = new HttpParams();
    param = param.set('page', this.pageNumber);
    param = param.set('size', this.pageSize);
    param = param.set('search',this.search.toString());
    param = param.set('project', sessionStorage.getItem('organization'));
    // param = param.set('isCached', true);

    this.secretsService.getSecretsList(param).subscribe((res)=>{
      res.forEach((secret)=>{
        this.data.push(secret)
      })
      this.dashConstantList=this.data;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
    })
    this.pageSize = this.pageSize || 6;
  }
  getCount(){
    this.secretsService.getSecreteCount().subscribe((res)=>{
      console.log('count',res);      
      this.noOfItems=res;
    })
  }
  
   editKey(secret:any) {
    this.router.navigate([secret.key + "/edit"], { relativeTo: this.route });
  }
  deleteKey(secrets:any) {
    let dialogRef = this.confirmDialog.open(DeleteComponent, {
      disableClose: true,
      data: { title: "Delete Configuration", message: "Do you want to delete?" },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === "yes") {
        this.secretsService.deleteKey(secrets.key).subscribe((resp)=>{         
          this.messageService.message(resp,"Key Deleted Successfully");
          this.refreshComplete();
        },(error)=>{
           this.messageService.message(error);
        }
         
        );
      }
    });
   }
   optionChange(event: Event) {
    let i: number = event.target['selectedIndex'];
    this.pageSize = this.itemsPerPage[i];
    this.pageNumber = 1;
    this.getList();
  }
  selectedButton(i){
    if(i==this.pageNumber)
      return {"color": "white","background": "#7b39b1"}
    else
      return {"color":"black"}
  }
   createView(){
    this.showCreate = true;
    this.edit = false;
   }
   onCreate(){
     this.secretsService.createKey(this.keys,this.passcode).subscribe((res)=>{      
      this.messageService.message(res,res.body);
      this.listView();
      this.refreshComplete();
     },(err)=>{
       console.log(err);
       this.messageService.message(err);       
     }
     )     
   }
   onUpdate(){
     this.secretsService.updateKey(this.keys,this.passcode).subscribe((res:any)=>{
      this.messageService.message(res,"Updated Successfully")
      this.hideValue();      
    })
   }
 
  getValue(){
    this.hidePass=false;
    this.showPass=true;
  }
  hideValue(){
    this.hidePass=true;
    this.showPass=false;
  }
   listView(){
    if (this.edit ) {
      this.refreshComplete();
      this.router.navigate(["../../"], { relativeTo: this.route });
    }
    this.showCreate = false;
   }
   onClear(){
     this.keys='';
     this.passcode='';
   }
   refreshComplete(){
     this.search=[];
    this.onClear();
    this.noOfPages=0;
    this.getCount();
    setTimeout(()=>{
      this.getList();
    },500)    
   }
}
