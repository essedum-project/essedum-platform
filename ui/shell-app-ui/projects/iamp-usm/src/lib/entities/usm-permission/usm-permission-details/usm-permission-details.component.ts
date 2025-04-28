import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { UsmPermissionsApi } from '../../../models/usm-permission-api';
import { UsmPermissions } from '../../../models/usm-permissions';
import { MessageService } from '../../../services/message.service';
import { PermissionApiService } from '../../../services/permission-api.service';

import { UsmPermissionsService } from '../../../services/usm-permission.service';
import { ModulesService } from '../../../services/modules.service';
import { UsmModules } from '../../../models/module';

@Component({
  selector: 'lib-usm-permission-details',
  templateUrl: './usm-permission-details.component.html',
  styleUrls: ['./usm-permission-details.component.css']
})
export class UsmPermissionDetailsComponent implements OnInit {
  showList:boolean=true
  showPermissionApiList:boolean=false
  usmpermission: UsmPermissions=new UsmPermissions();
  usmpermissionApi: UsmPermissionsApi=new UsmPermissionsApi();
  updateUsmpermissionApi :UsmPermissionsApi = new UsmPermissionsApi();

  permissionApiList: MatTableDataSource<any> = new MatTableDataSource();
  permissionApi = new Array<UsmPermissionsApi>();
  permissionApiCopy = new Array<UsmPermissionsApi>();
  permissionApiArraySorted = new Array<UsmPermissionsApi>();
  displayedColumns: string[] = ["id", "api", "type", "isWhiteListed","description","actions"];
  permissionApiLength:number=0;
  isCreatePermission:boolean=true
  isCreateAndUpdateApi:boolean=false
  isUpdateApi:boolean=false
  apiViewflag:boolean=false
  viewflag:boolean=false
  apieditflag:boolean=false
  showPermissionLengthErrorMessage:boolean=false
  showModuleLengthErrorMessage:boolean=false
  isValidRegex:boolean=false;
  lengthNameErrorMessage: String = "Maximum Character Limit Reached";
  invalidRegexMessage: String = "Invalid Regex";
  descriptionFilter: string = "";
  apiFilter: string = "";
  tooltipMessage: string = "";
  isDisabled: boolean = true;

  showDescLengthErrorMessage:boolean=false
  showApiLengthErrorMessage:boolean=false
  p: number;
  methodType:string[]=["GET","PUT","POST","DELETE","ALL"]
  modules:UsmModules[]=[];
  lazyloadevent = {
    first: 0,
    rows: 3000,
    sortField: null,
    sortOrder: 1,
    filters: null,
    multiSortMeta: null,
  };

  constructor(
    private usmPermissionsService:UsmPermissionsService,
    private router:Router,
    public route: ActivatedRoute,
    public permissionApiService:PermissionApiService,
    public messageService: MessageService,
    private modulesService:ModulesService,
  ) { }

  private paginator: MatPaginator;
  private sort: MatSort;

  @ViewChild(MatPaginator, { static: false }) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatSort, { static: false }) set matSort(ms: MatSort) {
    this.sort= ms;
    this.setDataSourceAttributes();
  }

  setDataSourceAttributes(){
    if (this.permissionApiList) {
      this.permissionApiList.paginator = this.paginator
      this.permissionApiList.sort = this.sort
    }
  }


  ngOnInit(){
    console.log("Inside ngOninit of usm-permission-details component")
    this.modulesService.findAll(new UsmModules,this.lazyloadevent).subscribe((res)=>{
      this.modules=res.content
    })

    if (window.location.href.includes("/usmPermission/view/") && window.location.href.includes("false")){
      this.route.params.subscribe((res) => {
        this.getUsmPermissions((Number(window.atob(res['rid']))));
        this.getUsmPermissionApi((Number(window.atob(res['rid']))));
        this.viewflag=true
      })
    }
    if (window.location.href.includes("/usmPermission/edit/") && window.location.href.includes("true")){
      this.route.params.subscribe((res) => {
        this.getUsmPermissions((Number(window.atob(res['rid']))));
        this.getUsmPermissionApi((Number(window.atob(res['rid']))));
      })
    }

  }


  getUsmPermissionApi(id){
    this.permissionApiService.findAllUsmPermissionApi(id).subscribe(
      (response)=>{
      this.permissionApiLength=response.length;
      this.showPermissionApiList=true
      this.permissionApi=response
      this.permissionApiCopy=response
      this.isCreatePermission=false
      this.permissionApiList=new MatTableDataSource(this.permissionApi);
      this.permissionApiList.paginator=this.paginator
      this.permissionApiList.sort=this.sort
      },
      (error) => {
        this.messageService.error("Could not get the results", "LEAP");
      })
  }

  listView(){
    if (!this.isCreatePermission){
      this.router.navigate(["./../../../list"], { relativeTo: this.route });
    }else{
      this.router.navigate(["./../list"], { relativeTo: this.route });
    }
  }


  getUsmPermissions(id){
    this.usmPermissionsService.getUsmPermissions(id).subscribe(
      (response)=>{
      this.usmpermission=response
      },
      (error) => {
        this.messageService.error("Could not get the results", "LEAP");
      }
    )

  }
 
  checkDescMaxLength(description){
    if (description.length >= 500) {
      this.showDescLengthErrorMessage = true;
    } else {
      this.showDescLengthErrorMessage = false;
    }
  }
  checkApiMaxLength(api){
    this.isValidRegex=false
    if (api.length >= 500) {
      this.showApiLengthErrorMessage = true;
    } else {
      this.showApiLengthErrorMessage = false;
    }
  }
  clearRole(){
    this.usmpermission=new UsmPermissions()
    this.usmpermission.module=null;
    this.usmpermission.permission=null;

  }
  savePermission(){
    if(this.usmpermission.module.length>= 255 || this.usmpermission.permission.length>= 255){
      this.messageService.error("Unable To Save USM Permission ","");
    }
    else{
      this.usmPermissionsService.create(this.usmpermission).subscribe(
        ()=>{
          this.messageService.error("Saved Successfully", "LEAP");
          this.router.navigate(["./../list"], { relativeTo: this.route });
        },
        (error) => {
          this.messageService.error("Unable To Save USM Permission ", "LEAP");
          this.router.navigate(["./../list"], { relativeTo: this.route });
        }
      )
    }

  }
  viewPermissionApi(permissionapi){
    this.usmpermissionApi=permissionapi
    this.usmpermissionApi.type=permissionapi.type.toUpperCase()
    this.isCreateAndUpdateApi=true
    this.isUpdateApi=true
    this.apiViewflag=true
    this.apieditflag=false
    this.messageToolTip(permissionapi.isWhiteListed)


  }
  editPermissionApi(permissionApi) {
    this.isValidRegex = false
    this.usmpermissionApi = permissionApi
    this.isCreateAndUpdateApi = true
    this.usmpermissionApi.type=permissionApi.type.toUpperCase()
    this.isUpdateApi = true
    this.apiViewflag = false
    this.apieditflag = true
    this.messageToolTip(permissionApi.isWhiteListed)


  }
  messageToolTip(val:boolean){
    if(val){
      this.tooltipMessage="Api is accessible to all"
     }
     else{
       this.tooltipMessage="Api is accessible to role(s) with permission"
     }
  }
  deletePermissionApi(permissionApi) {
    this.permissionApiService.delete(permissionApi.id).subscribe(
      ()=>{
        this.permissionApiService.findAllUsmPermissionApi(this.usmpermission.id).subscribe(
        (response)=>{
            this.messageService.error("Deleted Successfully", "LEAP");
        this.permissionApiList=new MatTableDataSource(response);
          },
          (error) => {
            this.messageService.error("Could not get the results", "LEAP");
          }
        )
      },
      (error) => {
        this.messageService.error("Unable To Delete USM Permission API", "LEAP");
      })
  }
  createApiPermission(){
    this.isCreateAndUpdateApi=true
    this.isUpdateApi=false
    this.apiViewflag = false
    this.usmpermissionApi=new UsmPermissionsApi()
    this.usmpermissionApi.isWhiteListed=false
    this.usmpermissionApi.type="ALL"
    this.messageToolTip(false);
  }
  editView(){
   this.isCreateAndUpdateApi=false
   this.apieditflag=false
   this.apiViewflag=true
    this.getUsmPermissionApi(this.usmpermission.id)

  }
  savePermissionApi(){
    this.usmpermissionApi.permissionId=this.usmpermission.id
    if(this.usmpermissionApi.type!=null) this.usmpermissionApi.type=this.usmpermissionApi.type.toUpperCase();
    if(this.usmpermissionApi.api.length>=500 || this.usmpermissionApi.description.length>=500){
      this.messageService.error("Unable to Save ", "LEAP");
    }
    else{
      this.permissionApiService.create(this.usmpermissionApi).subscribe(
      (response)=>{
          this.getUsmPermissionApi(this.usmpermission.id)
          this.permissionApi.push(response)
          this.permissionApiCopy.push(response)
      this.permissionApiList.data=[...this.permissionApi]
      this.isCreateAndUpdateApi=false
          this.messageService.error("Saved Successfully", "LEAP");
        },
        (error) => {
      if(error=="Invalid regex"){
        console.log("save savePermissionApi",error)
        this.isValidRegex=true;
      }else{
      this.messageService.error("Unable to Save ","Leap")
          }
        })
    }
  }
  updatePermissionApi(){
    if(this.usmpermissionApi.api.length>=500 || this.usmpermissionApi.description.length>=500){
      this.messageService.error("Unable to Save ", "LEAP");
    }
    else{
      this.permissionApiService.update(this.usmpermissionApi).subscribe(
      (response)=>{
          this.getUsmPermissionApi(this.usmpermission.id)
      this.isCreateAndUpdateApi=false
          this.messageService.error("Updated Sucessfully", "LEAP");
        },
        (error) => {
      if(error=="Invalid regex"){
       this.isValidRegex=true;
      }else{
      this.messageService.error("Unable to Save ","Leap")
          }
        }
      )
    }

  }

  clearPermissionApi(){
    this.usmpermissionApi=new UsmPermissionsApi()
  }


  updatePermission(){
    if(this.usmpermission.module.length>= 255 || this.usmpermission.permission.length>= 255){
      this.messageService.error("Unable To Update USM Permission ","");
    }
   else{
      this.usmPermissionsService.update(this.usmpermission).subscribe(
      (response)=>{
          this.messageService.error("Updated Sucessfully", "LEAP");
          this.router.navigate(["./../../../list"], { relativeTo: this.route });
        },
        (error) => {
          this.messageService.error("Unable To Update", "LEAP");
          this.router.navigate(["./../../../list"], { relativeTo: this.route });
        }
      )
    }

  }
  checkPermissionMaxLength() {
    if (this.usmpermission.permission.length >= 255) {
      this.showPermissionLengthErrorMessage = true;
    } else {
      this.showPermissionLengthErrorMessage = false;
    }
  }
  checkModuleMaxLength() {
    if (this.usmpermission.module.length >= 255) {
      this.showModuleLengthErrorMessage = true;
    } else {
      this.showModuleLengthErrorMessage = false;
    }
  }

  trackByMethod(index, item) { }



  assignCopy() {
    this.permissionApi = Object.assign([], this.permissionApiCopy);
  }
  filterItem(value) {
    if (!value) {
      this.assignCopy();
    }
    this.permissionApi = Object.assign([], this.permissionApiCopy).filter(
      (item1) => item1.api.toLowerCase().indexOf(value.toLowerCase()) > -1
    );
    this.permissionApiList.data=[...this.permissionApi]


  }
  checkEnterPressed(event: any, val: any) {
    if (event.keyCode === 13) {
      this.filterItem(event.srcElement.value);
    }
  }
  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 && o1.id == o2.id;
  }

  onSaveUsernameChanged(value:boolean){
    this.usmpermissionApi.isWhiteListed = value;
    this.messageToolTip(value);
    
  }
  
  onKey() {
    console.log("inside onkey",this.descriptionFilter,this.apiFilter)
    if (this.descriptionFilter.trim() != '' && this.apiFilter.trim() == '') {
      this.permissionApiList.data = [...this.permissionApiCopy].filter(((Option: UsmPermissionsApi) => (Option.description).toLowerCase().includes(this.descriptionFilter.toLowerCase())))
    }
    else if (this.apiFilter.trim() != '' && this.descriptionFilter.trim() == '') {
      this.permissionApiList.data = [...this.permissionApiCopy].filter(((Option: UsmPermissionsApi) => (Option.api).toLowerCase().includes(this.apiFilter.toLowerCase())))
    }
    else if(this.descriptionFilter.trim() != '' && this.apiFilter.trim() != ''){
      this.permissionApiList.data = [...this.permissionApiCopy].filter(((Option: UsmPermissionsApi) => (Option.description).toLowerCase().includes(this.descriptionFilter.toLowerCase()) && (Option.api).toLowerCase().includes(this.apiFilter.toLowerCase())))
    }
      else{
      this.permissionApiList.data = [...this.permissionApiCopy]
    }
  }
  onKeyDescription(value:any){
    this.descriptionFilter = value;
    this.onKey();
    this.isEmpty()
  }
  onKeyApi(value:any){
    this.apiFilter = value;
    this.onKey();
    this.isEmpty()
  }
  search(){
    this.onKey()
  }
  clear(){
    this.descriptionFilter = "";
    this.apiFilter = "";
    this.onKey();
    this.isEmpty()
  }
 


isEmpty() {
  if(this.descriptionFilter == ""&&this.apiFilter == "")
    this.isDisabled=true
  else
    this.isDisabled=false
  
}
}

