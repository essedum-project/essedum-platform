import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Project } from 'com-lib-util';
import { IncidentsService } from '../itsm/incidents.service';
import { NgxIndexedDBService } from 'ngx-indexed-db';
// import { MessageService } from '../../sharedModule/service/message.service';
import { Services } from '../services/service';
import { LedsModalService } from 'leds-lib';


@Component({
  selector: 'lib-cluster-tickets',
  templateUrl: './cluster-tickets.component.html',
  styleUrls: ['./cluster-tickets.component.css']
})
export class ClusterTicketsComponent implements OnInit {
  datasetName: string = "";
  purpose: string;
  clusterDetailsFlag: boolean = false;
  incidentsList: any;
  entryCount: number;
  searchParams: any;
  tktsPrkyLst: string[] = [];
  ticketLogFlag: boolean = false;
  workRes: any;
  workTimestamp: any;
  workflowName: any;
  ticketLogResult: string = "No logs available";
  loggedInProject: Project;
  tag: string;
  appendOverwriteFlag: string = "overwrite"; //"append";


  constructor(
    public dialogRef: MatDialogRef<ClusterTicketsComponent>,
    public incidentsService: IncidentsService,
    private modalService: LedsModalService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    // public messageService: MessageService,
    private service: Services,
    private dbService: NgxIndexedDBService
  ) { }

  ngOnInit() {
    try {
      this.datasetName = this.incidentsService.getDatasetName();
      this.purpose = this.data.purpose;
      if (this.purpose == "openClusterDetails") {
        this.clusterDetailsFlag = true;
        this.incidentsList = this.data.incidentsList;
        this.entryCount = this.data.entryCount;
        this.searchParams = this.data.searchParams;
        // this.existingTagsList = this.data.existingTagsList;
        this.tktsPrkyLst = this.incidentsList?.number?.toString().substring(1, this.incidentsList?.number?.length - 1).split(",");
        // if(this.existingTagsList && this.existingTagsList.length>0){
        //   this.exstTagsLst = this.existingTagsList.map(ele=>({"display":ele,"value":ele}));
        // }
        //
        // this.clusterArray = this.data.clusterArray;
        // this.sopArray = this.data.sopArray;
        // this.problemTypeArray = this.data.problemTypeArray;
      }
      else if (this.purpose == "ticketing") {
        this.ticketLogFlag = true;
        // this.ticketLog = this.data.ticketLog;
        if (this.data.data! + undefined && this.data.data != null && this.data.data.apiResponse != undefined && this.data.data.apiResponse != null) {
          this.workflowName = this.data.data.workflow_name;
          this.workTimestamp = this.data.data.run_timestamp;
          this.workRes = this.data.data.apiResponse;
          this.ticketLogResult = "WorkFLow Name : " + this.workflowName + '\n\n' + "Last Executed : " + this.workTimestamp + '\n\n' + "Logs : " + this.workRes;
        }
      }
      else if (this.purpose == "ticketLog") {
        this.ticketLogFlag = true;
        this.ticketLogResult = this.data.ticketLog;
      }
      this.loggedInProject = JSON.parse(sessionStorage.getItem("project"));
    }
    catch (Exception) {
      
      this.service.message('Some error occured', 'error')
    }
  }
 
  submitDetails() {
    //

    // if (this.selectedTagType == "addCluster") {
    //   if (this.shortdescriptionCluster == null || this.shortdescriptionCluster == undefined) {
    //     this.shortdescriptionCluster = "";
    //   }
    //   if (this.resolutionCluster == null || this.resolutionCluster == undefined) {
    //     this.resolutionCluster = "";
    //   }
    //   this.appendShortDesc = this.descAppendFlag;
    //   this.appendResolution = this.resAppendFlag;
      // let inc: Incidents = new Incidents();
      // inc.shortdescriptionClusterManual = this.shortdescriptionCluster;
      // inc.resolutionStepsClusterManual = this.resolutionCluster;
      // inc.state = 'close';
      // if(!this.existingTagsList || this.existingTagsList.length==0) this.appendOverwriteFlag="overwrite";
      if(this.tag){
      let inc = {};
      inc['tags'] = this.tag ? this.tag : ''; //this.tagsList.toString();
      let remTkts:any[] = [];
      if(this.appendOverwriteFlag=="append"){
        this.dbService.getAll("tagsData").subscribe(resp=>{
          if(resp && resp.length>0){
            let preTaggedTkts = resp.filter(ele=>ele['tags']).map(el=>el['uniqueIdentifier']);
            let preTgdTkts = Object.assign({ "number": "'" + preTaggedTkts + "'" });
            remTkts = this.tktsPrkyLst.filter(ele=>!preTaggedTkts.includes(ele));
            this.service.tagDetails(this.datasetName, this.loggedInProject.name, inc, preTgdTkts, "append", null, this.entryCount.toString())
            .subscribe(resp => {
              if(!remTkts || remTkts.length==0){
               
                this.service.message(resp, 'Success')
                
                this.dialogRef.close();
              }
              else{
                this.tagUntaggedTkts(inc,remTkts);
              }
            },
              error => {
                if(!remTkts || remTkts.length==0) 
                
                this.service.message('Could not append tags', 'error')
               
                this.tagUntaggedTkts(inc,remTkts);
              }
            )
          }
        })
      }
      if(this.appendOverwriteFlag=="overwrite"){
        this.tagUntaggedTkts(inc,remTkts);
      }
    }
    else {
      this.service.message('Please enter required details', 'error')
    }
      // }
    // else if (this.selectedTagType == "addSop") {
    //   if (this.manualSop == null || this.manualSop == undefined) {
    //     this.manualSop = "";
    //   }
    //   this.appendManualSop = this.sopAppendFlag;
    //   this.appendManualSop = false;
    //   let inc: Incidents = new Incidents();
    //   inc.sop = this.manualSop;
      // this.incidentsService.tagDetails(this.datasetName, this.loggedInProject.name, this.loggedInProject.id.toString(), inc, this.incidentsList)
      // .subscribe(resp => {
      //   this.messageService.info(resp, "Ticket Management");
      //   // this.dialogRef.close();
      // },
      //   error => { 
      //     this.messageService.error("Could not tag SOP details", "IAMP");
      //    
      //    }
      // )
    // }
    // else if (this.selectedTagType == "addProblemType") {
    //   if (this.manualProblemType == null || this.manualProblemType == undefined) {
    //     this.manualProblemType = "";
    //   }
    //   this.appendProblemType = this.problemTypeAppendFlag;
    //   this.appendProblemType = false;
    //   let inc: Incidents = new Incidents();
    //   inc['problem_type'] = this.manualProblemType;
      // this.incidentsService.tagDetails(this.datasetName, this.loggedInProject.name, this.loggedInProject.id.toString(), inc, this.incidentsList)
      // .subscribe(resp => {
      //   this.messageService.info(resp, "Ticket Management");
      //   // this.dialogRef.close();
      // },
      //   error => { 
      //     this.messageService.error("Could not tag Problem Type details", "IAMP");
      //    
      //    }
      // )
    // }
    //
    // this.resolutionCluster+"-"+this.resAppendFlag+"-"+this.descAppendFlag);
  }

  tagUntaggedTkts(inc,remTkts){
    let unTaggedTkts:any[] = [];
    let unTgdTkts:any;
    if(remTkts.length>0) {
      unTaggedTkts = remTkts;
      unTgdTkts = Object.assign({ "number": "'" + unTaggedTkts + "'" });
    }
    else{
      unTgdTkts = this.incidentsList;
    }
    this.service.tagDetails(this.datasetName, this.loggedInProject.name, inc, unTgdTkts, "overwrite", this.searchParams, this.entryCount.toString())
    .subscribe(resp => {
       
        this.service.message(resp, 'success')
        this.dialogRef.close();
      },
        error => { 
         
          this.service.message('Could not append tags', 'error')
          
         
        }
      )
  }
  closeDiaglog(){
   
      this.dialogRef.close();
    
  }

}
