import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Delegate } from '../../models/delegate';
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { DelegateService } from '../../services/delegate.service';
import { Process } from '../../models/process';
import { ProcessService } from '../../services/process.service';
import { Users } from '../../models/users';
import { UsersService } from '../../services/users.service';
import * as moment from 'moment';
import { MessageService } from "../../services/message.service";
import { Msg } from "../../shared-modules/services/msg";
import { Subscription } from 'rxjs';
import { DatePipe } from "@angular/common";
import { Role } from '../../models/role';
import { RoleService } from '../../services/role.service';
import { UserProjectRoleService } from '../../services/user-project-role.service';
import { DashConstantService } from '../../services/dash-constant.service';

@Component({
  selector: 'lib-delegate-form',
  templateUrl: './delegate-form.component.html',
  styleUrls: ['./delegate-form.component.css']
})
export class DelegateFormComponent implements OnInit {

  lazyloadevent = {
    first: 0,
    rows: 5000,
    sortField: null,
    sortOrder: null,
  };
  @ViewChild("myInput", { static: false }) myInputReference: ElementRef;

  delegate : Delegate = new Delegate();
  delegates : Delegate[] = [];
  process: Process = new Process();
  processList: Process[] = [];
  reasonList : String[];
  roleList : Role[] = [];
  allRolesList: Role[] = [];
  users: Users;
  alternateUserList : Users[] = [];
  private paginator: MatPaginator;
  private sort: MatSort;
  delegateList: MatTableDataSource<any> = new MatTableDataSource();
  pageSize = 6;
  displayedColumns: string[] = ["process", "alternate_user", "start_time", "end_time", "reason","role_id","edit", "is_active"];
  editScreen: boolean = false;
  busy: Subscription;
  currentUser: Users;
  currentProject: number;
  currentRole: number;

  modules: {
    ImageResize: {
      modules: ['Resize', 'DisplaySize', 'Toolbar']
    }
  }

  processMap = new Map();
  roleMap = new Map();
  inputReason: boolean = false;
  roleAccess: number = 0;

  constructor(
    private delegateService: DelegateService,
    private changeDetectionRef: ChangeDetectorRef,
    private processService: ProcessService,
    private usersService: UsersService,
    private messageService: MessageService,
    private datepipe: DatePipe,
    private roleService: RoleService,
    private userProjectRoleService: UserProjectRoleService,
    private dashConstantService: DashConstantService
  ) { }

  ngOnInit(): void {

    this.delegate.notifyViaMail = false;
    this.currentUser = JSON.parse(sessionStorage.getItem("user"));
    this.currentProject = JSON.parse(sessionStorage.getItem("project")).id;
    this.currentRole = JSON.parse(sessionStorage.getItem("role")).id;

    let userTz = this.currentUser.timezone ? this.currentUser.timezone : 'Asia/Kolkata';
    moment.tz.setDefault(userTz);

    this.roleService.findAll(new Role(), this.lazyloadevent).subscribe(
      (response) => {
        this.allRolesList = response.content;
      },
      (error) => {
        this.messageService.error(error, Msg.APP);
      },
      () => {
        this.allRolesList.filter((role)=> {
          this.roleMap.set(role.id,role.name);
        });
      }
    )

    this.dashConstantService.getDashConstsCheck().subscribe((res) => {
      let tempRoleHierarchy = res.filter((item) => item.keys === "RoleAccess");
      if(tempRoleHierarchy[0] && tempRoleHierarchy[0].project_id.id == this.currentProject){
        if (tempRoleHierarchy[0] && tempRoleHierarchy[0].value && !isNaN(tempRoleHierarchy[0].value))
          this.roleAccess = Number(tempRoleHierarchy[0].value);
        else this.roleAccess = 0;
      }
      else this.roleAccess = 0;
    });

    this.fetchProcesses();
  }

  @ViewChild(MatSort, { static: false }) set matSort(ms: MatSort) {
    this.sort = ms;
  }

  fetchProcesses(){

    this.processService.getAllProcessesByUserRole(this.currentUser.id,this.currentProject).subscribe(
      (response) => {
        this.processList = response;
      },
      (error) => {
        this.messageService.error(error, Msg.APP);
      },
      () => {
        this.processList.filter((process)=> {
          this.processMap.set(process.process_id,process.process_name);
        });
        this.fetchDelegates();
      }
    )

    this.reasonList = ["In Meeting", "Out of Office"];
  }

  fetchRoles(){

    this.roleService.getAllRolesByProcessId(this.delegate.process_id,this.roleAccess,this.currentRole).subscribe(
      (response) => {
        this.roleList = response;
      },
      (error) => {
        this.messageService.error(error, Msg.APP);
      }
    )
  }

  fetchUsers(){
    this.userProjectRoleService.getUsersByRoleId(this.delegate.role_id.id, this.currentProject).subscribe(
      (response) => {
        this.alternateUserList = response;
      },
      (error) => {
        this.messageService.error(error, Msg.APP);
      }
    )
  }

  fetchDelegates(){

    this.delegateService.getDelegatesByUserId(this.currentUser.id, this.currentProject).subscribe(
      (response) => {
        let delegatesDetails = [];
        this.delegates = response;
        this.delegates.forEach((delegate)=>{
          let tempDel: any = new Delegate();
          tempDel = delegate;
          tempDel.process = this.processMap.get(delegate.process_id);
          tempDel.start_time = this.updateToTimezone(delegate.start_time)
          tempDel.end_time = this.updateToTimezone(delegate.end_time)
          tempDel.notifyViaMail = false;
          delegatesDetails.push(tempDel);
        })
        this.delegateList = new MatTableDataSource(delegatesDetails);
        this.delegateList.sort = this.sort;
        this.delegateList.paginator = this.paginator;
      }
    )
  }

  editDelegate(tempDelegateId){
    
    this.delegateService.getDelegate(tempDelegateId).subscribe(
      (response) => {
        this.delegate = response;
      },
      (error) => {
        this.messageService.error(error, Msg.APP)
      },
      () => {
        this.delegate.start_time = new Date(this.delegate.start_time);
        this.delegate.end_time = new Date(this.delegate.end_time);
        this.editScreen = true;
        this.delegate.notifyViaMail = false;
        this.fetchRoles();
        this.fetchUsers();
      } 
    )
  }

  back(){
    this.delegate = new Delegate();
    this.delegate.notifyViaMail = false;
    this.editScreen = false;
  }

  trackByMethod(index, item) { }

  saveDelegateDetails(){
    
    if(this.delegate.process_id == undefined || this.delegate.process_id == null){
      return this.messageService.error("Please select a process", Msg.APP);
    }

    if(this.delegate.reason == undefined || 
      this.delegate.reason.trim().length == 0 || 
      this.delegate.reason == null){
       return this.messageService.error("Please select a reason", Msg.APP);
    }

    if(this.delegate.role_id == undefined || this.delegate.role_id == null){
      return this.messageService.error("Please select a role", Msg.APP);
    }

    if(this.delegate.alternate_user == undefined || 
      this.delegate.alternate_user.trim().length == 0 || 
      this.delegate.alternate_user == null){
        return this.messageService.error("Please select a user to delegate to", Msg.APP);
    }

    if(!this.checkValidDateRanges()){
      return this.messageService.error("End time cannot be lower than or equal to Start time", Msg.APP);
    }

    if(this.delegate.notifyViaMail) {
      if(this.delegate.to == undefined || 
        this.delegate.to.trim().length == 0 || 
        this.delegate.to == null){
          return this.messageService.error("Please enter email-id of the recipient", Msg.APP);
      }
      else if (!this.delegate.to.match(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/)) {
        return this.messageService.error("The recipient email-id does not match the required pattern", Msg.APP);
      }

      if(this.delegate.cc != null){
        if(!this.checkCC(this.delegate.cc)){
          return this.messageService.error("The recipient email-id does not match the required pattern", Msg.APP);
        }
      }

      if(this.delegate.subject == undefined || 
        this.delegate.subject.trim().length == 0 || 
        this.delegate.subject == null){
          return this.messageService.error("Please enter subject", Msg.APP);
      }
      this.delegate.from = JSON.parse(sessionStorage.getItem("user")).user_email;
    }

    this.delegate.is_active = true;
    this.delegate.is_delegate = false;
    this.checkComments();
    this.delegate.last_updated_user = JSON.parse(sessionStorage.getItem("user")).user_login;
    this.delegate.last_updated_date = this.setDateFormatWithTime(new Date());
    this.delegate.start_time = this.setDateFormatWithTime(this.delegate.start_time);
    this.delegate.end_time = this.setDateFormatWithTime(this.delegate.end_time);
    this.delegate.project_id = JSON.parse(sessionStorage.getItem("project"));
    this.delegate.role_id = new Role(this.delegate.role_id);

    if(!this.editScreen){
      this.delegate.login_id = JSON.parse(sessionStorage.getItem("user"));
      this.busy = this.delegateService.createDelegate(this.delegate).subscribe(
        (response) => {
          this.messageService.info("Delegated successfully", Msg.APP);
        },
        (error) => {this.messageService.error(error, Msg.APP)},
        () => {
          let newDelegate : Delegate = new Delegate();
          this.delegate = newDelegate;
          this.delegate.notifyViaMail = false;
          this.inputReason = false;
          this.fetchDelegates();
        }
      )
    }
    else{
      this.busy = this.delegateService.updateDelegate(this.delegate).subscribe(
        (response) => {
          this.messageService.info("Delegate updated successfully", Msg.APP);
        },
        (error) => {this.messageService.error(error, Msg.APP)},
        () => {
          this.editScreen = false;
          let newDelegate : Delegate = new Delegate();
          this.delegate = newDelegate;
          this.delegate.notifyViaMail = false;
          this.inputReason = false;
          this.fetchDelegates();
        }
      )
    }

  }

  ngAfterViewInit(): void {
    this.changeDetectionRef.detectChanges();
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 && o1.id == o2.id;
  }

  setDateFormatWithTime(pickedDate) {
    let formatted = this.datepipe.transform(pickedDate, "yyyy-MM-ddTHH:mm:ss");
    return formatted;
  }
  displayDateFormatWithTime(pickedDate) {
    let formatted = this.datepipe.transform(pickedDate, "MM/DD/YYYY, HH:mm:ss");
    return formatted;
  }

  checkComments(){
    if(this.delegate.comments == undefined || 
        this.delegate.comments.trim().length == 0 || 
        this.delegate.comments == null){
          this.delegate.comments = "Delegated";
    }
  }

  checkValidDateRanges(){
    let date1: number = new Date(this.delegate.start_time).getTime();
    let date2: number = new Date(this.delegate.end_time).getTime();

    if(date1 >= date2)
      return false;
    else
      return true;

  }

  cancel(){
    let newDelegate : Delegate = new Delegate();
    this.delegate = newDelegate;
    this.inputReason = false;
    this.delegate.notifyViaMail = false;
  }

  checkCC(cc: string){
    let splitCC = cc.split(",");
    for(let i=0; i<splitCC.length; i++){
      if(!splitCC[i].trim().match(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/))
        return false;
    }
    return true;
  }

  clearMailFields(event){
    if(event == false){
      this.delegate.cc = null;
      this.delegate.to = null;
      this.delegate.message = null;
      this.delegate.subject = null;
    }
  }

  customReason(){
    if(this.delegate.reason == 'Other'){
      this.inputReason = true;
      this.delegate.reason = '';
    }
  }

  changeStatus(task,event){
    
    task.is_active = event.checked;
    task.last_updated_date = this.setDateFormatWithTime(new Date());
    task.start_time = this.setDateFormatWithTime(task.start_time);
    task.end_time = this.setDateFormatWithTime(task.end_time);

    this.busy = this.delegateService.updateDelegate(task).subscribe(
      (response) => {
        this.messageService.info("Delegate updated successfully", Msg.APP);
      },
      (error) => {this.messageService.error(error, Msg.APP)},
      () => {
        this.fetchDelegates();
      }
    )
    
  }

  updateToTimezone(date){
    const tz1 = moment.tz.guess()
    let utcTime = moment.tz(date, tz1).utc().format();
    let userTime = moment.utc(utcTime)
      .tz(this.currentUser.timezone ? this.currentUser.timezone : 'Asia/Kolkata')
      .format('YYYY-MMM-DD HH:mm:ss');
    return userTime;
  }
}
