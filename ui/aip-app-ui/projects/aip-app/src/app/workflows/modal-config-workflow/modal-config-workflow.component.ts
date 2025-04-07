import { Component, OnInit,Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'com-lib-util';
import { Workflow } from '../entities/workflow';
import { WorkflowService } from '../entities/workflow.service';
import { WorkflowSpec } from '../entities/workflowspec';
import { Services } from '../../services/service';

@Component({
  selector: 'app-modal-config-workflow',
  templateUrl: './modal-config-workflow.component.html',
  styleUrls: ['./modal-config-workflow.component.scss']
})
export class ModalConfigWorkflowComponent implements OnInit{
  spec=false;
  addWk = false
  addWkSpec = false
  workflowSpec: WorkflowSpec = new WorkflowSpec()
  workflow: Workflow = new Workflow()
  name: any;
  addmashup: boolean=true
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public messageService: Services,
    private workflowService: WorkflowService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ModalConfigWorkflowComponent>
  ) {
    this.spec=this.data.spec;
   }
  ngOnInit() {

    this.name =
      this.router.url.split("/")[this.router.url.split("/").length - 1];
  }
    
 

  saveDetails() {
    if (this.spec) {
      this.workflowSpec.wkspec=this.workflow.wkspec;
      this.workflowSpec.wkname=this.workflow.alias;
      this.workflowService.createSpec(this.workflowSpec).subscribe(resp => {
        this.messageService.message("Workflow Spec Saved Successfully", "success");
        this.addWkSpec=false
        this.dialogRef.close();
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
              this.messageService.message("Workflow Saved Successfully", "success");
              this.addWk=false
              this.dialogRef.close();
              this.ngOnInit()
            })
          }
          else {
            // this.messageService.error("Please Enter Name", "Workflow")
            this.messageService.message("Please Enter Workflow Name", "error")
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

}
