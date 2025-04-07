import { ChangeDetectorRef, Component, Inject, OnChanges, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'com-lib-util';
import { Subscription } from 'rxjs';
import { Workflow } from '../entities/workflow';
import { WorkflowService } from '../entities/workflow.service';
import { Services } from '../../services/service';
import { DatasetServices } from '../../dataset/dataset-service';
import * as _ from "lodash";
@Component({
  selector: 'app-workflow-details',
  templateUrl: './workflow-details.component.html',
  styleUrls: ['./workflow-details.component.scss']
})
export class WorkflowDetailsComponent implements OnInit, OnChanges {
  tabs = [];
  workflow: Workflow = new Workflow();
  wkJson: any;
  newwkJson;
  workflowJson: any[] = [];
  jsonKeys: any[];
  jsonToQuest: any[] = [];
  jsonToWk: any = [];
  index = 1;
  selected = new FormControl(0);
  id: any;
  name: any;
  tabSelected: any = 0;
  workflowData = {
    jsondata: {},
  };
  workflowSpec: any;
  showBreadcrumb =true
  breadcrumb: any[]=[];
  busy: any=Subscription;


  constructor(
    @Inject("envi") private baseUrl: string,
    public messageService: Services,
    private workflowService: WorkflowService,
    private datasetService: DatasetServices,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private changeRef: ChangeDetectorRef
  ) {

  }

  ngOnInit() {
    this.route.params.subscribe((res) => {
      this.name = res.name;
      this.id = res.id;
      this.breadcrumb.push(res)
    });
    this.getWorkflowById();
//console.log("details", this.name, this.id)
  }

  ngOnChanges() {
    this.ngOnInit();
  }

  getWorkflowById() {
    let stage = 0;
    this.workflowService.getWorkflowByNameAndOrg(this.id).subscribe((resp) => {
      if (resp && resp.name) {
        this.tabs = [];
        this.workflow = resp;
        console.log(resp);
        this.workflow.workflowData = JSON.parse(resp.workflowData);
        this.wkJson = this.workflow.workflowData;
        this.newwkJson = this.wkJson;
        this.workflowData = this.wkJson
        this.datasetService.setCorelId(this.workflow.corelid)
        let jason = resp.workflowData;
        if(this.workflow.currentStage == 1){
          this.tabs.push(this.wkJson.jsondata.stage1.WorkareaComponent.alias)
          this.newwkJson = this.wkJson; 
          this.jsonToWk = this.wkJson.jsondata["stage1"];
          this.jsonToQuest.push(this.wkJson.jsondata["stage1"]);
        }
        else{
        for (let json in jason.jsondata) {
          stage++;
          if (stage <= this.workflow.currentStage && !this.jsonToQuest.includes(jason.jsondata[json])) {
            this.jsonToQuest.push(jason.jsondata[json]);
            if (jason.jsondata[json].Tab.toLowerCase() == "true") {
              this.tabs.push(jason.jsondata[json].WorkareaComponent.alias);
              this.jsonToWk = jason.jsondata[json];
            }
          }
          else
            break;
        }
      }
        this.selected.setValue(this.tabs.length - 1);
        this.index = this.jsonToQuest.length;
      }
    });
  }

  

  navigateToWorkflow(name) {
    this.router.navigate(["../../"+name], {
      relativeTo: this.route,
    });
  }

  changeStage(event) {
    let indexCopy;
console.log("event change stage=", event)
    let gonext = true;
    if (event.update){
      indexCopy = _.clone(this.index)
       this.index = event.update
       this.messageService.info("Updated Successfully","Workflow")
      };
      if (event.gonext == false) {
        gonext = false;
      }
      event = event.json!=undefined && event.json!=null?event.json:event
    if (!gonext) {
      this.workflowData.jsondata["stage" + this.index]["output"] = event;
    } else {
      if (this.index == 1) {
        if(this.wkJson.jsondata.stage1.Tab.toLowerCase() == "false")
          this.tabs = []
        this.workflowData.jsondata["stage" + this.index]["output"] = event;
      } else {
        
        let inpIndex = 1
        let inpData = {}
        for(let inp in this.newwkJson.jsondata["stage" + this.index]["input"]["stage"]){
          inpData["data"+inpIndex] = this.newwkJson.jsondata["stage" + this.index]["input"]["stage"][inp]
          inpIndex++
        }        
        this.workflowData.jsondata["stage" + this.index]["input"]["data"] = inpData

        this.workflowData.jsondata["stage" + this.index]["output"] = event;
      }
      this.index++;
      if(this.newwkJson.jsondata["stage" + this.index]){
        this.jsonToQuest.push(this.newwkJson.jsondata["stage" + this.index]);
        this.jsonToWk = this.newwkJson.jsondata["stage" + this.index];
      }
      if (this.wkJson.jsondata["stage" + this.index].Tab.toLowerCase() == "true" && 
          !this.tabs.includes(this.wkJson.jsondata["stage" + this.index].WorkareaComponent.alias)) {
        this.tabs.push(this.wkJson.jsondata["stage" + this.index].WorkareaComponent.alias);
        this.selected.setValue(this.index);
      }
    }
    if(indexCopy) this.index = _.clone(indexCopy)
    this.saveWorkflow()
  }

  skipStage(){
    this.index++;
      if(this.newwkJson.jsondata["stage" + this.index]){
        this.jsonToQuest.push(this.newwkJson.jsondata["stage" + this.index]);
        this.jsonToWk = this.newwkJson.jsondata["stage" + this.index];
      }
      if (this.wkJson.jsondata["stage" + this.index].Tab.toLowerCase() == "true" && 
          !this.tabs.includes(this.wkJson.jsondata["stage" + this.index].WorkareaComponent.alias)) {
        this.tabs.push(this.wkJson.jsondata["stage" + this.index].WorkareaComponent.alias);
        this.selected.setValue(this.index);
      }
      this.saveWorkflow()
  }

  saveWorkflow() {
    this.workflow.currentStage = this.index
    this.workflow.workflowData = JSON.stringify(this.workflowData);
    this.busy=this.workflowService.create(this.workflow).subscribe((res) => {
      // this.messageService.info("Saved Successfully!", "");
    });
  }

  onTabChange(event) {
    for(let json in this.wkJson.jsondata){
      if(this.wkJson.jsondata[json].Tab.toLowerCase() == "true" && this.wkJson.jsondata[json].WorkareaComponent.alias == event.tab.textLabel){
        this.jsonToWk = this.wkJson.jsondata[json]
        
        break;
      }
    }
  }

  showQuestionTab(i){
    if (this.wkJson.jsondata["stage" + i].Tab.toLowerCase() == "true") {
      this.jsonToWk = this.wkJson.jsondata["stage" + i]
        this.selected.setValue(this.tabs.indexOf(this.jsonToWk?.WorkareaComponent?.alias));
      }
    else{
      for(let ind=i;ind>0;ind--){
        if (this.wkJson.jsondata["stage" + ind].Tab.toLowerCase() == "true") {
          this.jsonToWk = this.wkJson.jsondata["stage" + ind]
          this.selected.setValue(this.tabs.indexOf(this.jsonToWk?.WorkareaComponent?.alias));
          break;
        }
      }
    }
  }
}
