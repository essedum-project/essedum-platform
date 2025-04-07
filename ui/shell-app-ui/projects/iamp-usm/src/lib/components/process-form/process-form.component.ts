import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
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
import { MatDialog } from "@angular/material/dialog";
import { RoleProcessFormComponent } from '../role-process-form/role-process-form.component';

@Component({
  selector: 'lib-process-form',
  templateUrl: './process-form.component.html',
  styleUrls: ['./process-form.component.css']
})
export class ProcessFormComponent implements OnInit {

  constructor(
    private changeDetectionRef: ChangeDetectorRef,
    private processService: ProcessService,
    private usersService: UsersService,
    private messageService: MessageService,
    private datepipe: DatePipe,
    private confirmDialog: MatDialog
  ) { }

  process: Process = new Process();
  processes: Process[];
  lazyloadevent = {
    first: 0,
    rows: 5000,
    sortField: null,
    sortOrder: null,
  };
  private paginator: MatPaginator;
  private sort: MatSort;
  processList: MatTableDataSource<any> = new MatTableDataSource();
  pageSize = 6;
  editScreen: boolean = false;
  workflowList: string[] = ["workflow1", "Workflow2"];
  displayedColumns: string[] = ["process_name","process_display_name","process_description","workflow_id","edit","mapRoles","is_active"];
  busy: Subscription;

  ngOnInit(){

    this.fetchProcessList();

  }

  fetchProcessList(){
    this.processService.findAll(new Process(), this.lazyloadevent).subscribe(
      (response) => {
        this.processes = response.content;
        this.processList = new MatTableDataSource(this.processes);
        this.processList.sort = this.sort;
        this.processList.paginator = this.paginator;
      },
      (error) => {
        this.messageService.error(error, Msg.APP);
      }
    )
  }

  saveProcessDetails(){

    if(this.process.process_name == undefined || this.process.process_name == null){
      return this.messageService.error("Please enter process name", Msg.APP);
    }

    if(this.process.process_display_name == undefined || this.process.process_display_name == null){
      return this.messageService.error("Please enter process display name", Msg.APP);
    }

    if(this.process.process_description == undefined || this.process.process_description == null){
      return this.messageService.error("Please enter process description", Msg.APP);
    }

    if(this.process.workflow_id == undefined || this.process.workflow_id == null){
      return this.messageService.error("Please select a workflow", Msg.APP);
    }

    this.process.is_active = true;
    this.process.last_updated_user = JSON.parse(sessionStorage.getItem("user")).user_login;
    this.process.last_updated_date = this.setDateFormatWithTime(new Date());
    this.process.project_id = JSON.parse(sessionStorage.getItem("project"));

    if(!this.editScreen){
      let duplicateNameCheck: boolean = false;
      this.processes.forEach((tempProcess)=>{
        if(tempProcess.process_name.trim().toLowerCase() == this.process.process_name.trim().toLowerCase()){
          duplicateNameCheck = true;
          return;
        }
      })
  
      if(duplicateNameCheck){
        return this.messageService.error("Process name already exists", Msg.APP);
      }
      
      this.process.created_date = this.setDateFormatWithTime(new Date());
      this.processService.createProcess(this.process).subscribe(
        (response) => {
          this.messageService.info("Process created", Msg.APP);
        },
        (error) => {this.messageService.error(error, Msg.APP)},
        () => {
          this.process = new Process();
          this.fetchProcessList();
        }
      )

    }
    else{

      let duplicateNameCheck: boolean = false;
      this.processes.forEach((tempProcess)=>{
        if(tempProcess.process_name.trim().toLowerCase() == this.process.process_name.trim().toLowerCase()){
          if(tempProcess.process_id == this.process.process_id){
            duplicateNameCheck = false;  
          }
          else{
            duplicateNameCheck = true;
            return;
          }
        }
      })
  
      if(duplicateNameCheck){
        return this.messageService.error("Process name already exists", Msg.APP);
      }

      this.processService.updateProcess(this.process).subscribe(
        (response) => {
          this.messageService.info("Process updated", Msg.APP);
        },
        (error) => {this.messageService.error(error, Msg.APP)},
        () => {
          this.process = new Process();
          this.editScreen = false;
          this.fetchProcessList();
        }
      )
    }
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 && o1.id == o2.id;
  }

  setDateFormatWithTime(pickedDate) {
    let formatted = this.datepipe.transform(pickedDate, "yyyy-MM-ddTHH:mm:ss");
    return formatted;
  }

  reset(){
    this.process = new Process();
  }

  editProcess(processId){
    this.editScreen = true;
    this.processService.getProcess(processId).subscribe(
      (response) => {
        this.process = response;
      }
    )
  }

  back(){
    this.process = new Process();
    this.editScreen = false;
  }

  mapRoles(task){
    let dialogRef = this.confirmDialog.open(RoleProcessFormComponent, {
      disableClose: true,
      width: "75vw",
      height: "89vh",
      data: {process: task}
    });

    dialogRef.afterClosed().subscribe(
      (result)=> {
      }
      )
  }

  changeStatus(task,event){
    task.is_active = event.checked;
    this.process.last_updated_user = JSON.parse(sessionStorage.getItem("user")).user_login;
    this.process.last_updated_date = this.setDateFormatWithTime(new Date());

    this.busy = this.processService.updateProcess(task).subscribe(
      (response)=>{
        this.messageService.info("Process updated successfully", Msg.APP);
      },
      (error) => {this.messageService.error(error, Msg.APP)},
      ()=>{
        this.fetchProcessList();
      }
    )
  }

  trackByMethod(index, item) {}
}
