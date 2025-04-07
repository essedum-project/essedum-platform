import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { Workflow } from '../entities/workflow';
import { WorkflowService } from '../entities/workflow.service';
import { WorkflowSpec } from '../entities/workflowspec';
import { Services } from '../../services/service';
import { ModalConfigWorkflowComponent } from '../modal-config-workflow/modal-config-workflow.component';

@Component({
  selector: 'app-workflow-table',
  templateUrl: './workflow-table.component.html',
  styleUrls: ['./workflow-table.component.scss']
})
  export class WorkflowTableComponent implements OnInit {
    wklist: any[];
    cols: any[] = [];
    busy: Subscription;
    showList;
    name;
    wkspec;
    isGridView = true
    addWk = false
    addWkSpec = false
    workflow: Workflow = new Workflow()
    workflowSpec: WorkflowSpec = new WorkflowSpec()
  
    id
    spec = false
    showBreadcrumb=true;
  
    breadcrumb: any[]=[];
    pageNumber = 1
    pageSize = 8
    noOfItems: number;
    noOfPages: number = 0
    pageChanged = new EventEmitter<any>();
    endIndex: number;
    startIndex: number;
    pageNumberChanged: boolean = true;
    pageNumberInput: number = 1;
    itemsPerPage: number[] = [8, 9, 18, 36, 54, 72]
    pageArr: number[] = [];
    records: boolean = false;
    constructor(
      @Inject("envi") private baseUrl: string,
      public services: Services,
      private workflowService: WorkflowService,
      private route: ActivatedRoute,
      private router: Router,
      public dialog: MatDialog,
      
    ) { }
  
    ngOnInit() {
      this.name =
        this.router.url.split("/")[this.router.url.split("/").length - 1];
      this.cols = [
        { header: "Name", field: "name" },
        { header: "Description", field: "description" },
        { header: "Correlation ID", field: "corelid" },
      ];
      if (this.pageNumberChanged) {
        this.pageNumber = 1;
        this.startIndex = 0;
        this.endIndex = 5;
      }
      if (this.name == "specification") {
        this.breadcrumb=[];
        this.breadcrumb.push({name: "Create Specification"})
        this.spec = true
        this.getAllWorkflowSpec()
      }
      else {
        this.breadcrumb=[]
        this.route.params.subscribe((res) => {
          this.name = res.name;
          this.id = res.id;
          this.breadcrumb.push(res)
        });
        this.getAllWorkflows();
      }
    }
    getAllWorkflows() {
      this.busy = this.workflowService
        .getWorkflowsByNameAndOrg(this.name)
        .subscribe((res) => {
          this.wklist = res;
          console.log(this.wklist);
          
          if (this.wklist.length > 0) this.showList = true;
        });
    }
  
    getAllWorkflowSpec() {
      this.workflowService.getAllWorkflowSpec().subscribe(
        (res) => {
          this.wklist = res;
          this.wklist = this.wklist.filter(wk=>wk.wkname!='specification')
          if (this.wklist.length > 0) this.showList = true;
        })
    }
  
    addWorkflows() {
      if(this.spec)
        this.addWkSpec = true
      else
        this.addWk = true
      // this.router.navigate(["../" + this.name + "/new"], {
      //   relativeTo: this.route,
      // });
    }
  
    openDialog() {
      const dialogRef = this.dialog.open(ModalConfigWorkflowComponent, {
        height: '40%',
        width: '50%',
        data: {
          spec:this.spec
      }});
  
      dialogRef.afterClosed().subscribe(result => {
        this.ngOnInit();
        // this.getAllWorkflows();
      });
    }
  
    toTitleCase(str) {
      return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }
  
    delete(id) {
      const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
        dialogRef.afterClosed().subscribe((result) => {
          if (result === "delete") {
            this.workflowService.deletespec(id).subscribe((resp) => {
              this.services.message("Deleted Successfully");
              this.ngOnInit()
            },
              (error) => console.log(error)
            );}
        });
    }
  
    saveDetails() {
      if (this.spec) {
        this.workflowService.createSpec(this.workflowSpec).subscribe(resp => {
          this.services.message("Saved Successfully", "Workflow Spec");
          this.addWkSpec=false
          this.ngOnInit()
  
        })
      }
      else {
        this.workflowService.getAllWorkflowSpec().subscribe(
          (res) => {
            this.workflow.wkspec = res.filter((wk) => wk.wkname == this.name)[0];
          }, err => { },
          () => {
            if (this.workflow.alias) {
              this.workflow.workflowData = this.workflow.wkspec.wkspec;
              this.workflow.currentStage = 1
              this.workflow.corelid = this.generateCorelId() + new Date().getTime().toString()
              this.workflowService.create(this.workflow).subscribe(resp => {
                this.services.message("Saved Successfully", "Workflow");
                this.addWk=false
                this.ngOnInit()
              })
            }
            else {
              this.services.messageService("Please Enter Name", 'error')
            }
          })
      }
    }
    
    generateCorelId() {
      return Array.apply(0, Array(5))
        .map(function () {
          return (function (charset) {
            let min = 0;
            let max = charset.length - 1;
            let rand = window.crypto.
              getRandomValues(new Uint32Array(1))[0] / (0xffffffff +
  
                1)
            return charset.charAt(Math.floor(rand * (max - min + 1)) + min);
          })('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
        })
        .join('');
    }
  
    navigate(model) {
      if(model.wkspec.wkname == 'TicketClustering'){
        this.router.navigate(['clustering'], { relativeTo: this.route,
           queryParams: { name: model.name, displayName: model.alias}})
      }
      else if(this.spec){
        this.router.navigate([model.wkname], { relativeTo: this.route })
      }else
        this.router.navigate([model.name], { relativeTo: this.route })
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
      
      if (this.name == "specification") {
        this.spec = true
        this.breadcrumb=[]
        this.breadcrumb.push({name: "Create Specification"})
        this.getAllWorkflowSpec()
      }
      else {
        this.breadcrumb=[]
        this.route.params.subscribe((res) => {
          this.name = res.name;
          this.id = res.id;
          this.breadcrumb.push(res)
        });
        this.getAllWorkflows();
      }
    }
}
