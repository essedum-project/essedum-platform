import { Component, OnInit } from '@angular/core';
import { Stage } from '../../models/stage';
import { StageService } from '../../services/stage.service';
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { Process } from '../../models/process';
import { Project } from '../../models/project';
import { ProcessService } from '../../services/process.service';
import { MessageService } from "../../services/message.service";
import { Msg } from "../../shared-modules/services/msg";
import { Users } from "../../models/users";
import { UsersService } from "../../services/users.service";
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-stage-form',
  templateUrl: './stage-form.component.html',
  styleUrls: ['./stage-form.component.css']
})
export class StageFormComponent implements OnInit {

  constructor(
    private stageService: StageService,
    private processService: ProcessService,
    private messageService: MessageService,
    private usersService: UsersService
  ) { }

  stage: Stage = new Stage();
  stages: number[] = [];
  stageList: MatTableDataSource<any> = new MatTableDataSource();
  lazyloadevent = {
    first: 0,
    rows: 5000,
    sortField: null,
    sortOrder: null,
  };
  private paginator: MatPaginator;
  private sort: MatSort;
  editScreen: boolean = false;
  displayedColumns: string[] = ["project_id","user_id","process_id","stage_id"];
  process: Process = new Process();
  processList: Process[] = [];
  currentUser: number;
  currentProject: Project;
  currentRole: number;
  usersList: Users[] = [];
  busy: Subscription;

  ngOnInit(){
  
    this.currentUser = JSON.parse(sessionStorage.getItem("user")).id;
    this.currentProject = JSON.parse(sessionStorage.getItem("project"));
    this.currentRole = JSON.parse(sessionStorage.getItem("role")).id;
    this.stages = [1, 2];

    this.fetchProcesses();
    this.fetchUsers();
  
  }

  fetchProcesses(){
    this.processService.getAllProcessesByUserRole(this.currentUser,this.currentProject.id).subscribe(
      (response) => {
        this.processList = response;
      },
      (error) => {
        this.messageService.error(error, Msg.APP);
      }
    )
  }

  fetchUsers(){
    this.usersService.findAll(new Users(), this.lazyloadevent).subscribe(
    (response) =>{
      this.usersList = response.content;
    }
    )
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 && o1.id == o2.id;
  }

  trackByMethod(index, item) { }

}
