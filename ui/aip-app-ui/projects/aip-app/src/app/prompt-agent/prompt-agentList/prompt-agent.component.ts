import { Component, OnInit } from '@angular/core';
import { AIWorkerDTO } from '../promptAgent';
import { PromptServices } from '../../prompts/prompt.service';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { LedsLibService } from 'leds-lib';
import { Services } from '../../services/service';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-prompt-agent',
  templateUrl: './prompt-agent.component.html',
  styleUrl: './prompt-agent.component.scss'
})
export class PromptAgentComponent implements OnInit {

  aiWorkerList: AIWorkerDTO[] = [];
  cardTitle: string = "AI Workers";
  filter: string = "";
  isExpanded = false;
  pageNumber: number = 1;
  pageSize: number = 10;
  noOfItems: number;
  noRecords: boolean = false;
  createEditConfig: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: Services,
    private dialog: MatDialog,
    private promptService: PromptServices,
    private ledsLibService: LedsLibService,
  ) { }

  ngOnInit() {
    this.getAllPromptAgents();
    this.getPromptAgentsCount();
    this.Authentications();
  }

  Authentications() {
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes("create-workerConfig")) 
          this.createEditConfig = true;
      }
    );
  }

  getAllPromptAgents(pageNumber?, pageSize?) {
    let params: HttpParams = new HttpParams();
    if (this.filter.length >= 1) 
      params = params.set('query', this.filter);
    params = params.set('page', this.pageNumber);
    params = params.set('size', this.pageSize);
    params = params.set('project', sessionStorage.getItem('organization'));
    this.promptService.getAllAgents(params).subscribe(
      (response: any) => {
        this.aiWorkerList = response.body;
        if (this.aiWorkerList.length > 0) {
          this.noRecords = false;
        } else {
          this.noRecords = true;
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  getPromptAgentsCount(pageNumber?, pageSize?) {
    let params: HttpParams = new HttpParams();
    if (this.filter.length >= 1) 
      params = params.set('query', this.filter);
    params = params.set('project', sessionStorage.getItem('organization'));
    
    this.promptService.getAgentsCount(params).subscribe((res) => {
      this.noOfItems = res as number;
    });
  }
  
  addNewWorker() {
    this.router.navigate(["./createConfig/new"], { relativeTo: this.route });
  }

  navigateToConfigure(name: string) {
    this.router.navigate(["./viewConfig/" + name ], { relativeTo: this.route });
  }

  navigateToPrepare(name: string) {
    this.router.navigate(["./prepare-workers/" + name], { relativeTo: this.route });
  }

  navigateToExecute(worker) {
    let executionType = Object.keys(JSON.parse(worker.executor))[0]
    if(executionType == 'pipeline') {
      this.router.navigate(["./execute-workers/" + worker.name], { relativeTo: this.route });
    } else {
      this.router.navigateByUrl(JSON.parse(worker.executor)[executionType]);
    }
  }

  navigateToTasks(name: string) {
    this.router.navigate(["./tasks/" + name], { relativeTo: this.route });
  }

  deleteWorker(id) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    const org = sessionStorage.getItem('organization');
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.promptService.deleteAIworker(id,org).subscribe(
          (response) => {
            this.refresh();
            this.service.message("AI Worker deleted successfully", "success");
          },
          (error) => {
            console.log(error);
          });
      }
    });
  }

  refresh() {
    this.filter = "";
    this.pageSize = 10;
    this.pageNumber = 1;
    this.aiWorkerList = [];
    this.ngOnInit();
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  toggler(isExpanded: boolean) {
    if (isExpanded) {
      return { width: '80%', margin: '0 0 0 20%' };
    } else {
      return { width: '100%', margin: '0%' };
    }
  }

  filterz() {
    this.noOfItems = 0;
    this.aiWorkerList = [];
    this.getAllPromptAgents(this.pageNumber, this.pageSize);
    this.getPromptAgentsCount(this.pageNumber, this.pageSize);
  }

  handlePageAndSizeChange(event: { pageNumber: number; pageSize: number }) {
    this.pageNumber = event.pageNumber?event.pageNumber:1;
    this.pageSize = event.pageSize?event.pageSize:4;
    this.aiWorkerList = [];
    if (this.filter)
      this.filterz();
    else {
      this.getAllPromptAgents(this.pageNumber, this.pageSize);
      this.getPromptAgentsCount(this.pageNumber, this.pageSize);
    }
  }

}
