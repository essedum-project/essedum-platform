import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Services } from '../../../services/service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../../confirm-delete-dialog.component/confirm-delete-dialog.component';

@Component({
  selector: 'app-edit-manage-group',
  templateUrl: './edit-manage-group.component.html',
  styleUrls: ['./edit-manage-group.component.scss']
})
export class EditManageGroupComponent  {
  cardTitle:string=' Edit Manage Group';
  alias:string='';
  selectedUser:any[]=[];
  userName:any[]=[];
  userDetails=[];
  userData:any[]=[];
  selectedUserId:any;
  groupName:string='';
  dgEngRoleId:any;
  enableAddButton:boolean=true;
  group:any;
  constructor(
    private service: Services,
    private router :Router,
    private route : ActivatedRoute,
    private location :Location,
    private dialog: MatDialog,
  ){}
  ngOnInit(){
    this.dgEngRoleId=this.route.snapshot.paramMap.get('id');
    console.log('grpdgEngRoleIdNa',this.dgEngRoleId);
    
    let cards =this.location.getState();
    console.log('cards',cards);    
    this.group =cards['group'];
    this.alias=this.group.groupName;
    this.group.userDetails.forEach((user)=>{
      this.userDetails.push(user);
    });
  
    
    this.getDGEngineerList();
    console.log('group',this.group);
    
  }
  getDGEngineerList(){
    // this.dgEngRoleId='138';
    this.service.getListDgEngineer(this.dgEngRoleId).subscribe((res:any)=>{
      this.userData=res;
      res.forEach((user)=>{
        this.userName.push({
          viewValue:user.userFName,       
          value:user.userId     
        });
      })
      console.log('userRes',this.userName);
      console.log('data',this.userData);
      
    })
  }
  
  onSelect($event){
  console.log('event',$event.length);
  
  this.selectedUserId=$event;
  if(this.selectedUserId.length>0) this.enableAddButton=false;
  else this.enableAddButton=true;
  console.log('selectedUserId',this.selectedUserId);
  }
  routeBackToModelList() {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }
  deleteUser(user:any){
    // const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result === "delete") {
    //     const index = this.userDetails.findIndex(ele=>ele.userId==user.userId);
    //    this.userDetails.splice(index,1);
    //   }
    // }); 
    const index = this.userDetails.findIndex(ele=>ele.userId==user.userId);
    this.userDetails.splice(index,1);
    console.log('deleteuser',this.userDetails);
       
  }
  onAddUser(){
  //  let users:any[] = this.userDetails
    console.log('users',this.userDetails);
    
     let filterUserData = this.userData.filter(user=>this.selectedUserId.includes(user.userId));
    //  console.log('filterData',filterUserData);
    //  console.log('userDetail1',this.userDetails);    
    filterUserData.forEach((user)=>{
      let isPresent = this.userDetails.some((userObj) => userObj.userId == user.userId);
      if(isPresent){
        const index = this.userDetails.findIndex(ele=>ele.userId==user.userId);
        this.userDetails.splice(index,1);
      }
        this.userDetails.push(user);
    })
  //  console.log('addUsers',this.userDetails);    
  }
    UpdateGroup(){
      this.enableAddButton=true;
     //this.filterUserDetails();
      this.service.updateUserGroup(this.alias,this.userDetails).subscribe((resp)=>{
        console.log(resp);
        this.service.messageService(resp, 'Done! UserGroup is updated.');
      });
    
    }
}


