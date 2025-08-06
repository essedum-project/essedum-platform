import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from "../../services/message.service";
import { SecretService } from '../../services/secret.service';
import { DeleteComponent } from '../../shared-modules/confirm-delete/delete.component';
import { SecretAddComponent } from './secret-add/secret-add.component';

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
  itemsPerPage: number[] = [2, 4, 6];
  noOfItems: number;
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();
  endIndex: number;
  startIndex: number;
  pageNumberChanged: boolean = true;
  lastRefreshedTime: Date | null = null;
   pagedRoles: any[] = [];

  page: number = 0;
  rowsPerPage: number = 2;
  totalrecords: number = 0
  lastPage: number = 0;
    secretContent: any = [];
// Mock data for dashConstantList
mockDashConstants = [
  {
    id: 1,
    key: 'MAX_RETRY_ATTEMPTS',
    passcode: '222222fffff3',
    type: 'NUMBER',
    description: 'Maximum number of retry attempts for API calls',
    isActive: true,
    lastUpdated: new Date('2025-08-01')
  },
  {
    id: 2,
    key: 'SESSION_TIMEOUT',
    passcode: '18005tyuu',
    type: 'NUMBER',
    description: 'Session timeout in seconds (30 minutes)',
    isActive: true,
    lastUpdated: new Date('2025-08-02')
  },
  {
    id: 3,
    key: 'DEFAULT_THEME',
    passcode: 'dark1234555',
    type: 'STRING',
    description: 'Default application theme',
    isActive: false,
    lastUpdated: new Date('2025-08-03')
  }
];
  

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confirmDialog: MatDialog,
    private secretsService :SecretService,
    public messageService: MessageService,
    private changeDetectionRef: ChangeDetectorRef,
    public dialog: MatDialog,
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
     // this.dashConstantList=this.data;
     // Assign to your MatTableDataSource
this.dashConstantList.data = this.mockDashConstants;
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
      width: '30%',    
      data: { title: "Delete Secret key", message: "Are you sure do you want to delete the secret named '"+secrets.key+" ?" },
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

   createSecretKey(){
    const dialogRef = this.dialog.open(SecretAddComponent, {
      height: '67%',
      width: '50%',      
      disableClose: true,
      data: {
        edit: false,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
       // this.refresh();
      }
    });
   }

   editSecretKey(secret:any){
    const dialogRef = this.dialog.open(SecretAddComponent, {
      height: '67%',
      width: '50%',      
      disableClose: true,
      data: {
        edit: true,
        secret
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
       // this.refresh();
      }
    });
   }

  viewSecretKey(){
    const dialogRef = this.dialog.open(SecretAddComponent, {
      height: '67%',
      width: '50%',      
      disableClose: true,
      data: {
        view:true
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
       // this.refresh();
      }
    });
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

   // PAGINATION BLOCK START
  updatePagination() {
    const totalPages = Math.ceil(this.totalrecords / this.rowsPerPage);
    this.lastPage = Math.max(totalPages - 1, 0);
    if (this.page > this.lastPage) {
      this.page = this.lastPage;
    }
    this.updatePagedData()
  }

  updatePagedData() {
    const startIndex = this.page * this.rowsPerPage;
    const endIndex = Math.min(startIndex + this.rowsPerPage, this.totalrecords);
    this.pagedRoles = this.dashConstantList.data.slice(startIndex, endIndex);
    this.lastPage=Math.floor((this.dashConstantList.data.length-1)/ this.rowsPerPage);


  }
  getPageNumbers() {
    const totalPages = this.lastPage + 1;
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  navigatePage(direction: 'Prev' | 'Next'){
    if(direction === 'Prev' && this.page>0){
      this.page--;
    }else if(direction==='Next' && this.page<this.lastPage){
      this.page++;
        }
        this.updatePagedData();
  }

// changePage(p:number){
//   if(p>0 && p<=this.lastPage){
//     this.page=p;
//     this.updatePagedData();
//   }
// }

searchSecret(){
  alert('search clicked..')
}


}
