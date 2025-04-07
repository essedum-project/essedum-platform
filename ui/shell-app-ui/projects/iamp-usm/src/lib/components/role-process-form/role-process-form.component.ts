import { Component, OnInit, Inject, ChangeDetectorRef, ViewChild, SimpleChanges } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { RoleProcess } from '../../models/role-process';
import { RoleProcessService } from '../../services/role-process.service';
import { Process } from '../../models/process';
import { Role } from '../../models/role';
import { RoleService } from '../../services/role.service';
import { MessageService } from "../../services/message.service";
import { Msg } from "../../shared-modules/services/msg";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from "@angular/common";
import { ProcessService } from "../../services/process.service";
import { Subscription } from 'rxjs';


@Component({
  selector: 'lib-role-process-form',
  templateUrl: './role-process-form.component.html',
  styleUrls: ['./role-process-form.component.css']
})

export class RoleProcessFormComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<RoleProcessFormComponent>,
    private roleProcessService: RoleProcessService,
    private roleService: RoleService,
    private changeDetectionRef: ChangeDetectorRef,
    private messageService: MessageService,
    private datepipe: DatePipe,
    private processService: ProcessService
  ) { }

  roleProcess: RoleProcess = new RoleProcess();
  roleProcesses: RoleProcess[] = [];
  process: Process;
  roleList: Role[];
  filteredRoles: Role[] = [];
  lazyloadevent = {
    first: 0,
    rows: 5000,
    sortField: null,
    sortOrder: null,
  };
  private paginator: MatPaginator;
  private sort: MatSort;
  roleProcessList: MatTableDataSource<any> = new MatTableDataSource();
  displayedColumns: string[] = ["is_active","role","role_hierarchy","is_role_based_search_access","is_role_based_reassign_access","is_role_based_assign_access","is_role_based_transfer_access",
  "is_role_based_bulkPage_access","delete"];
  accessLevels: number[] = [];
  roleProcessesToSave: RoleProcess[] = [];
  initialSelection = [];
  allowMultiSelect = true;
  selection;
  rolesToMap: Role[] = [];
  enableSave: boolean = false;
  selectType = [
    { text: "Multiple", value: 'multiple'}
  ];
  fetchedRoleProcesses: RoleProcess[] = [];
  busy: Subscription;

  ngOnInit(){

    if(this.data.process){
      this.processService.getProcess(this.data.process).subscribe(
        (response) =>{
          this.process = response;
        }
      )

      this.fetchRoles();
    }

    for(let i=1; i<=20; i++){
      this.accessLevels.push(i);
    }


  }

  fetchRoles(){
    let role: Role = new Role();
    role.projectId = null;
    this.busy = this.roleService.findAll(role,this.lazyloadevent).subscribe(
      (response) => {
        this.roleList = response.content;
      },
      (error) =>{
        this.messageService.error(error, Msg.APP);
      },
      () =>{
        this.filteredRoles = this.roleList.filter(function (el) {
          let currentProject = JSON.parse(sessionStorage.getItem("project")).id;
          return el.projectId == null ||
                el.projectId == currentProject
        })
        this.filteredRoles = this.filteredRoles.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
        this.filteredRoles = [...this.filteredRoles];

        this.busy = this.roleProcessService.getRoleProcessByProcessId(this.data.process).subscribe(
          (response) =>{
            this.fetchedRoleProcesses = response;
            if(this.fetchedRoleProcesses.length > 0){
              this.fetchedRoleProcesses.forEach((item)=>{
               this.rolesToMap.push(item.role_id);
              })
              this.rolesToMap = this.rolesToMap.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
              this.rolesToMap = [...this.rolesToMap];
            }
          },
          (error)=>{
            this.mapRoles();
          },
          ()=>{
            this.mapRoles();
          }
        )
      }
    )
  }

  mapRoles(){
    this.enableSave = true;
    this.roleProcessList = null;
    this.roleProcesses = [];
    let tempRoleProcesses = [];
    
    this.filteredRoles.forEach(
      (role) =>{
        let check = 0;
        let temp: RoleProcess = new RoleProcess();
        // temp.roleProcess = tempRoleProcess;
        // temp.role = role

        if(this.fetchedRoleProcesses.length > 0){
          this.fetchedRoleProcesses.forEach(
            (item)=>{
              if(role.id == item.role_id.id){
                temp = item;
                check = 1;
                this.roleProcesses.push(temp);
              }
            }
          )
          if(check == 0){
            temp.role_id = role;
            temp.role_hierarchy = 1;
            temp.is_role_based_search_access = false;
            temp.is_role_based_reassign_access = false;
            temp.is_role_based_assign_access = false;
            temp.is_role_based_transfer_access = false;
            temp.is_role_based_bulkPage_access = false;
            temp.is_role_based_manualPage_access = false; 
            tempRoleProcesses.push(temp)
          }
        }
        else{
          temp.role_id = role;
          temp.role_hierarchy = 1;
          temp.is_role_based_search_access = false;
          temp.is_role_based_reassign_access = false;
          temp.is_role_based_assign_access = false;
          temp.is_role_based_transfer_access = false;
          temp.is_role_based_bulkPage_access = false;
          temp.is_role_based_manualPage_access = false;
          tempRoleProcesses.push(temp)
        }

      }
    )
    tempRoleProcesses.forEach((item)=>{
      this.roleProcesses.push(item);
    })
    this.roleProcesses = [...this.roleProcesses];
    this.roleProcessList = new MatTableDataSource(this.roleProcesses);
    this.selection = new SelectionModel<RoleProcess>(this.allowMultiSelect,this.initialSelection);
  }

  // showExistingMappedRoles(){
  //   this.fetchedRoleProcesses.forEach(
  //     (item) => {
  //       let temp: RoleProcess = new RoleProcess();
  //       temp = item;
  //       this.roleProcesses.push(temp);
  //     }
  //   )
  //   this.roleProcessList = new MatTableDataSource(this.roleProcesses);
  //   this.selection = new SelectionModel<RoleProcess>(this.allowMultiSelect,this.initialSelection);
  // }

  close(): void {
    this.dialogRef.close();
  }

  ngAfterViewInit(): void {
    this.changeDetectionRef.detectChanges();
  }

  saveRoleProcesses(){
    this.roleProcesses = [];
    // this.roleProcessList.data.forEach(
    //   (row) => {
    //     this.selection.select(row);
    //   }
    // )
    this.selection.selected.forEach(
      (item) => {
        let tempRoleProcess: RoleProcess = new RoleProcess(item);
        tempRoleProcess.process_id = this.process;
        tempRoleProcess.last_updated_date = this.setDateFormatWithTime(new Date());
        tempRoleProcess.last_updated_user = JSON.parse(sessionStorage.getItem("user")).user_login;
        tempRoleProcess.project_id = JSON.parse(sessionStorage.getItem("project"));
        this.roleProcesses.push(tempRoleProcess);
      }
    )

    if(this.roleProcesses.length > 0){
      this.roleProcessService.createRoleProcessList(this.roleProcesses).subscribe(
        (response)=>{
          this.messageService.info("Role-Process mapping successfull", Msg.APP);
        },
        (error) =>{
          this.messageService.error(error, Msg.APP);
        }
      )
    }

    this.dialogRef.close();
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 && o1.id == o2.id;
  }

  // updateSaveCounter(temp){
  //   this.roleProcessesToSave.push(temp);
  // }

  @ViewChild(MatSort, { static: false }) set matSort(ms: MatSort) {
    this.sort = ms;
  }

  selectHandler(row: RoleProcess) {
    this.selection.toggle(row);
  }

  setDateFormatWithTime(pickedDate) {
    let formatted = this.datepipe.transform(pickedDate, "yyyy-MM-ddTHH:mm:ss");
    return formatted;
  }

  trackByMethod(index, item) {}

  removeMapping(event){
    console.log(event);
  }

  deleteEntry(task){
    this.roleProcessService.deleteRoleProcessByRoleId(task.role_id.id).subscribe(
      (response)=>{
        this.messageService.info("Deleted successfully", Msg.APP);
        this.dialogRef.close();
      },
      (error) =>{
        this.messageService.error(error, Msg.APP);
      },
    )
  }
}
