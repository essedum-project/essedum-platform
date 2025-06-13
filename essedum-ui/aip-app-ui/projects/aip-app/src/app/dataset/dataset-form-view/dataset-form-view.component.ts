import { AfterViewChecked, Component, DoCheck, EventEmitter, HostListener, Input, KeyValueDiffers, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { Dataset } from '../datasets';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetServices } from '../dataset-service';
// import { Project } from 'com-lib-util';
import * as _ from "lodash";
import { Project } from '../../DTO/project';

export enum KEY_CODE {
  X = 88
}
@Component({
  selector: 'app-dataset-form-view',
  templateUrl: './dataset-form-view.component.html',
  styleUrls: ['./dataset-form-view.component.scss']
})
export class DatasetFormViewComponent implements OnInit, DoCheck, OnChanges, AfterViewChecked, OnDestroy {

    busy: Subscription;
    datasetName: string = "";
    writeAccess: boolean;
    formObjValue: { "data": any } = { "data": {} };
    formObjValueCpy: { "data": any } = { "data": {} };
    // formHeight: any = {};
    error: string;
    btnText: string;
    differ: any;
    rowEntryChanges: any = {};
    valCpy: any;
    // enblSaveBtn: boolean = true;
    unqId: string;
    tableName: string;
    unqIdValue: any;
    dataset: any;
    schema: any = {};
    showUpdateBtn: boolean = false;
    actionsChecked: boolean = false;
    actionsList: {}[] = [];
    caseMgmt: boolean = false;
    formTemplateAvailable: boolean;
    workflowFields: string[] = [];
    formObjValues: any;
    nodeId: string;
    filteredOcrData: any;
    selectedSplit: string;
    selectedSubset: string;
    loading:boolean;
    // fullscreenView: boolean = false;
    isFormValid: boolean = true;
    isdisabled: any;
    disable: boolean = false;
    dataComponentList: string[] = [];
    isdatasetroute: boolean = false;
    // fullscreenView: boolean = false;
    @Input('inboxqueue') inboxqueue: string = "";
    @Input('dataset') data: Dataset;
    @Input('usedatasetobject') usedatasetobject;
    @Input('action') incAction: string;
    @Input('rowObj') incRowObj: any;
    @Input('showTableViewBtn') incShowTableViewBtn: string;
    @Input('processName') incProcessName: string;
    @Input('source') incSource: string;
    @Input('queue') queue: string = "Inbox";
    @Output('result') result = new EventEmitter();
    @Output('formData') formData = new EventEmitter();
    @Input('businesskey') businesskey: string;
    @Input('formname') formname;
    @Input('datasetname') inpdataset;
    @Input('initiativeDatasetName') initiativeDatasetName;
    @Input('params') params;
    @Input('formParam') formParam;
    @Input('id') id;
   @Input('ocrIdList') ocrIdList:string[];
   @Output() selectedValueChanged: EventEmitter<[string, string]> =   new EventEmitter();
  
    @HostListener("window:keydown", ["$event"])
    keyDownEvent(event: KeyboardEvent) {
      if (event.ctrlKey && event.keyCode == KEY_CODE.X) {
        this.changeToTableView();
        event.preventDefault();
      }
    }
  
    constructor(
      public router: Router,
      private route: ActivatedRoute,
      private datasetsService: DatasetServices,
      private differs: KeyValueDiffers,
      private location: Location
  
    ) { }
    ngOnDestroy(): void {
      this.actionsChecked = false
      Array.from(document.getElementsByClassName("adp-form-btn-clck-chck")).forEach(ele => {
        ele.remove()
      })
    }
  
    ngOnInit(): void {
  //console.log("rowobj", this.incRowObj)
      this.getSourceApiParameters();
      if (this.router.url.includes("datasets")) this.isdatasetroute = true;
  
      
      // if (this.router.url.includes("/view")) this.fullscreenView = true;
      // else this.fullscreenView = false;
      // if (!this.fullscreenView) this.formHeight = { "height": "52vh", "overflow-y": "scroll" };
    }
    
    getSourceApiParameters() {
  
      try { 
        if (this.queue != 'Inbox') {
          this.disable = true;
          this.isdisabled = 'your-class';
        }
        this.route.params.subscribe((param) => {
          this.datasetName = param['cname'];
        });
        if (this.router.url.includes('sandbox')) {
          this.datasetName = this.data?.name;
        }
        if (this.router.url.includes('initiative')) {
          this.datasetName = this.initiativeDatasetName;
        }
      }
      catch (Exception) {
        if (this.data?.name) this.datasetName = this.data?.name;
        if (this.usedatasetobject) this.dataset = this.data
      }
      if (this.datasetName == undefined && this.data?.name) {
        this.datasetName = this.data?.name;
      }
      if(this.datasetName == undefined || this.datasetName == '' && this.data){
        this.datasetName = this.data as any;
      }
      if (this.inpdataset) this.datasetName = this.inpdataset
      if (!this.datasetName || this.datasetName.replace(/\s/g, "").length < 1) {
        this.result.emit("Hide Create/Form Template Button");
        this.datasetsService.message("Dataset name not found", "Dataset View");
      }
      else {
        if (this.usedatasetobject)
          this.open(this.data)
        else {
  
          this.busy = this.datasetsService.getDataset(this.datasetName)
            .subscribe(resp => {
              if (resp) {
                this.open(resp)
              } else {
                this.datasetsService.message("Dataset details not found", "Dataset View");
              }
            },
              error => { this.datasetsService.message("Error in fetching dataset details " + error, "Dataset View"); })
        }
      }
      // }
      // catch(Exception){
      // this.datasetsService.message("Some error occured", "Error")
      // }
  
    }
  
    getData(datasetname) {
      let finalAndObj = { "and": [] };
      // params.forEach(param => {
      //   finalAndObj.and.push({ "or": { "property": param, "equality": "like", "value": this.rowObj.number } });
      // })
      let proj: Project = JSON.parse(sessionStorage.getItem("project"));
  
      let pagination = { 'page': 0, 'size': 10 }
      this.busy = this.datasetsService.searchTicketsUsingDataset(datasetname, proj.name, pagination, finalAndObj).subscribe(
        (pageResponse) => {
          let tickets: any = [];
          if (typeof pageResponse == "string") {
            this.datasetsService.message(pageResponse, "Ticket Management");
  
          }
          else {
            pageResponse.forEach((element) => {
              tickets.push(element);
            })
          }
  
  
          this.incRowObj = tickets[0];
          //if (this.incidents.sop) this.fetchSopList(this.incidents.sop);
  
  
        }
      );
  
    }
  
    open(resp) {
      this.dataset = resp;
      (sessionStorage.getItem("cipAuthority")?.includes("dataset-edit") && this.dataset.type == "rw") ?
        this.writeAccess = true :
        this.writeAccess = false;
      (this.dataset.attributes && JSON.parse(this.dataset.attributes)['uniqueIdentifier']) ?
        this.unqId = JSON.parse(this.dataset.attributes)['uniqueIdentifier'] :
        this.unqId = undefined;
      (this.dataset.attributes && JSON.parse(this.dataset.attributes)['tableName']) ?
        this.tableName = JSON.parse(this.dataset.attributes)['tableName'] :
        this.tableName = undefined;
      this.caseMgmt = (this.dataset.isApprovalRequired || this.dataset.isInboxRequired);
      this.openForm(this.incAction, {...this.incRowObj});
    }
  
    // edit(dataObj) {
    //   this.saveSearchFilterExample();
    //   this.writeAccess ? this.openForm('update', dataObj) : this.openForm('view', dataObj);
    // }
  
    // createTicket() {
    //   this.saveSearchFilterExample();
    //   this.openForm('add');
    // }
  
    saveSearchFilterExample() {
      // this.datasetsService.setSearchFilterExample({ searchExample: this.searchIncident, selectedTickets: this.selectedTickets });
    }
  
    // checkFormValidations(): boolean {
    //   if (this.schema && this.schema['required'] && this.schema['required'].length > 0) {
    //     for (let i = 0; i < this.schema['required'].length; i++) {
    //       let fld = this.schema['required'][i];
    //       if (!this.formObjValue[fld] || this.formObjValue[fld].toString().replace(/\s/g, '').length < 1) return false;
    //     }
    //     return true;
    //   }
    //   return true;
    // }
  
    openForm(source, rowData?) {
      try {
        this.busy=this.datasetsService.getDatasetForm(this.dataset.name).subscribe(res => {
          this.formTemplateAvailable = res && res.length > 0
          let form;
          if (this.formname) {
            form = res.filter(fm => (fm.formtemplate.name == this.formname || fm.formtemplate.alias == this.formname))[0].formtemplate.formtemplate
          }
          else {
            form = res[0]?.formtemplate.formtemplate
          }
          this.schema = JSON.parse(form)
          this.saveFormTemplateChanges()
  
          if (this.formTemplateAvailable) {
            if (source == "add" || source == "reset" || source == "ocr") {
              if (this.tableName) {
                this.btnText = "Add";
                this.selectFormTemplate();
                if (source == "add" || source == "reset") this.formObjValue.data = {};
                else if(source == "ocr")  this.formObjValue.data = rowData;
                if (source == "add" || source == "ocr")  this.formObjValueCpy = _.cloneDeep(this.formObjValue);
                // this.formView = true;
              }
              else {
                // this.formView = false;
                this.datasetsService.message("Table Name is required for inserting data", "Dataset View");
              }
            }
            else if (source == "update" || source == "ocrUpdate") {
              if (this.tableName && this.unqId) {
                if (rowData && JSON.stringify(rowData)!="{}") {
                  if(this.incSource=="caseDetails"){
                    if(source == "update")  this.datasetsService.setFormData(rowData);
                    else if(source == "ocrUpdate"){
                      let formFields: string[] = [];
                      JSON.stringify(this.schema, (_, nestedValue) => {
                        if(nestedValue["key"])  formFields.push(nestedValue["key"])
                        return nestedValue
                      })
                      Object.keys(rowData).forEach(ele=> {
                        if(!formFields.includes(ele)) delete rowData[ele];
                      })
                      this.filteredOcrData = {...rowData};
                      rowData = {...this.datasetsService.getFormData(), ...rowData};
                    }
                  }
                  this.templateGenerate(rowData)
                }
                else {
                  this.formTemplateAvailable = false
                  let finalAndObj = { "and": [] };
                  if (this.params) {
                    this.params.forEach(param => {
                      finalAndObj.and.push({ "or": { "property": param, "equality": "like", "value": this.id } });
                    })
                  }
                  let proj: Project = JSON.parse(sessionStorage.getItem("project"));
  
                  let pagination = { 'page': 0, 'size': 10 }
                  this.busy = this.datasetsService.searchTicketsUsingDataset(this.datasetName, proj.name, pagination, finalAndObj).subscribe(
                    (pageResponse) => {
                      let tickets: any = [];
                      if (typeof pageResponse == "string") {
                        this.datasetsService.message(pageResponse, "Ticket Management");
  
                      }
                      else {
                        pageResponse.forEach((element) => {
                          tickets.push(element);
                        })
                      }
  
  
                      this.incRowObj = tickets[0];
                      this.templateGenerate({...this.incRowObj})
                      //if (this.incidents.sop) this.fetchSopList(this.incidents.sop);
  
  
                    }
                  );
                }
              }
              else {
                // this.formView = false;
                this.datasetsService.message("Both Table Name and Unique Identifier are required for updating data", "Dataset View");
              }
            }
            else if (source == "view") {
              if (rowData) {
                this.formObjValue.data = rowData;
                this.formObjValueCpy = _.cloneDeep(this.formObjValue);
                // let tempArr = Object.entries(rowData).filter(ele => Object.keys(this.schema).map(ky => ky.toLowerCase()).includes(ele[0].toLowerCase()));
                // tempArr.forEach(ele => { this.formObjValue[ele[0]] = ele[1]; })
              }
              this.btnText = undefined;
              this.selectFormTemplate();
              // this.formView = true;
            }
            else if (source == "new") {
              this.btnText = "Add";
              this.selectFormTemplate();
              this.formObjValue.data = {};
              if (source == "new") this.formObjValueCpy = _.cloneDeep(this.formObjValue);
            }
          }
          else {
            this.result.emit("Hide Create/Form Template Button");
            this.datasetsService.message("Form Template is not available", "Dataset View");
          }
        })
      }
      catch (Exception) {
        this.datasetsService.message("Some error occured", "Error")
      }
  
    }
  
    saveFormTemplateChanges() {
      // try {
      this.schema = JSON.parse(JSON.stringify(this.schema, (_, nestedValue1) => {
        nestedValue1?.components?.forEach(nestedValue => {
          if (nestedValue && nestedValue['type'] == "select") {
            if(nestedValue.hasOwnProperty('data') && nestedValue['data']['url'] ){
              if(nestedValue['data']['url'].startsWith("/api")){
              nestedValue['data']['url'] = window.location.origin + nestedValue['data']['url']
              if(this.formParam){
                for(let par in this.formParam){
                  nestedValue['data']['url'] = nestedValue['data']['url'].replace("{{"+par+"}}",this.formParam[par])
                }
              }
              nestedValue['data']['url'] = nestedValue['data']['url'].replace("{{userEmail}}",JSON.parse(sessionStorage.getItem("user")).user_email)
              if(nestedValue['data']['url'].startsWith("/api/aip/service"))
              nestedValue['data']['headers'].push({ "key": "access-token", "value": "{{localStorage['accessToken']}}" })
              }
              else{
                nestedValue['data']['headers'].push({ "key": "Authorization", "value": "Bearer {{localStorage['jwtToken']}}" })
              }
              
              
            }
          }
        })
        return nestedValue1;
      }));
      // }
      // catch (Exception) {
      //   this.datasetsService.message("Some error occured", "Error")
      // }
    }
  
    templateGenerate(rowData) {
      // if (rowData[this.unqId]) {
      this.unqIdValue = rowData[this.unqId];
      this.btnText = "Update";
      this.selectFormTemplate();
      this.rowEntryChanges = {};
      this.formObjValue.data = rowData;
      JSON.stringify(this.schema, (_, nestedValue) => {
        if (nestedValue && (nestedValue['type'] == "datagrid" || nestedValue['type'] == "editgrid" || nestedValue['type'] == "tree")) {
          this.dataComponentList.push(nestedValue['key']);
          try {
            this.formObjValue.data[nestedValue['key']] = JSON.parse(rowData[nestedValue['key']]);
          }
          catch (Exception) { }
        }
        return nestedValue;
      });
      this.formObjValueCpy = _.cloneDeep(this.formObjValue);
      // let tempArr = Object.entries(rowData).filter(ele => Object.keys(this.schema).map(ky => ky.toLowerCase()).includes(ele[0].toLowerCase()));
      // tempArr.forEach(ele => { this.formObjValue[ele[0]] = ele[1]; })
      this.valCpy = Object.assign({}, this.formObjValue.data);
      this.differ = this.differs.find(this.formObjValue.data).create();
      this.formTemplateAvailable = true
      // if (!this.powerMode) 
      // this.formView = true;
      // }
      // else {
      //   // this.formView = false;
      //   this.datasetsService.message(this.unqId + "(unique identifier) value is required for updating data", "Dataset View");
      // }
    }
  
    selectFormTemplate() {
      try {
        let actionToBeCompared: string;
        if (this.caseMgmt && this.incRowObj?.formkey) {
          actionToBeCompared = this.incRowObj?.formkey;
        }
        else {
          if (this.btnText == "Add") actionToBeCompared = "create";
          else if (this.btnText == "Update") actionToBeCompared = "update";
          else actionToBeCompared = "view";
        }
  
        // this.schema = JSON.parse(this.dataset.schemajson)?.filter(ele => ele.templateTags?.toString().split(",").includes(actionToBeCompared))[0];
        // if (!this.schema && JSON.parse(this.dataset.schemajson)?.length > 0) this.schema = JSON.parse(this.dataset.schemajson)[0];
        // this.formTemplateAvailable = this.schema && Object.keys(this.schema).length > 0;
      }
      catch (Exception) {
        this.datasetsService.message("Some error occured", "Error")
      }
  
    }
  
    checkButtonClick() {
      let clickedBtn
      this.actionsList.forEach((btnActn, index) => {
        if (document.getElementById("formio-btnclk-" + btnActn['name']) && (Number(document.getElementById("formio-btnclk-" + btnActn['name']).innerHTML) - btnActn['count']) == 1) {
          clickedBtn = btnActn;
          this.actionsList[index]['count'] = Number(document.getElementById("formio-btnclk-" + btnActn['name']).innerHTML);
        }
      })
      if (clickedBtn) {
        this.navigateToAction(clickedBtn);
      }
      // else
      //   this.formData.emit(this.formObjValue.data)
    }
  
    navigateToAction(actionObj): Promise<string> {
      return new Promise((resolve, reject) => {
        if (actionObj['name'] == "submit") {
          this.performAction("submit").then(resp => { resolve(resp) }).catch(err => { reject(err) });
        }
        else if (actionObj['name'] == "reset") {
          this.performAction("reset").then(resp => { resolve(resp) }).catch(err => { reject(err) });
        }
        else if (actionObj['name'] == "refresh") {
          this.performAction("refresh").then(resp => { resolve(resp) }).catch(err => { reject(err) });
        }
        else if (actionObj['name'] == "ok") {
          this.performAction("ok").then(resp => { resolve(resp) }).catch(err => { reject(err) });
        }
        else if (actionObj['name'] == "cancel") {
          this.performAction("cancel").then(resp => { resolve(resp) }).catch(err => { reject(err) });
        }
        else if (actionObj['name'].startsWith("eventTrigger")) {
          this.performAction("eventTrigger", actionObj['properties']).then(resp => { resolve(resp) }).catch(err => { reject(err) });
        }
        else if (actionObj['name'] == "internalNavigation") {
          this.performAction("internalNavigation", actionObj['properties']).then(resp => { resolve(resp) }).catch(err => { reject(err) });
        }
        else if (actionObj['name'].startsWith("externalNavigation")) {
          this.performAction("externalNavigation", actionObj['properties']).then(resp => { resolve(resp) }).catch(err => { reject(err) });
        }
        else if (actionObj['name'].startsWith("multipleActions")) {
          this.performMultipleActions(Object.entries(actionObj['properties']), 0);
        }
        else if (actionObj['name'].startsWith("api")) {
          this.performAction("api", actionObj['properties']).then(resp => { resolve(resp) }).catch(err => { reject(err) });
        }
  
      })
    }
  
    performAction(actionType, actionNames?): Promise<string> {
      try {
        return new Promise((resolve, reject) => {
          switch (actionType) {
            case "submit":
              this.saveEntry().then(resp => resolve(resp)).catch(error => reject(error));
              break;
            case "reset":
              this.openForm('reset');
              resolve("Form reset successfully");
              break;
            case "refresh":
              let unqIdObj = {};
              let finalAndObj = { "and": [] };
              unqIdObj[this.unqId] = this.formObjValueCpy.data && this.formObjValueCpy.data[this.unqId];
              let orobj = {"or":{"property":this.unqId,"equality":"like","value":unqIdObj[this.unqId]}}
              finalAndObj.and.push(orobj)
              this.busy = this.datasetsService.searchTicketsUsingDataset(this.datasetName, sessionStorage.getItem("organization"), { 'page': 0, 'size': 10 }, finalAndObj)
                .subscribe(resp => {
                  if (resp) {
                    if (Array.isArray(resp)) {
                      if (resp[0]) {
                        let actionToBeCompared: string;
                        if (this.caseMgmt && this.incRowObj?.formkey) {
                          actionToBeCompared = this.incRowObj?.formkey;
                        }
                        else {
                          if (this.btnText == "Add") actionToBeCompared = "create";
                          else if (this.btnText == "Update") actionToBeCompared = "update";
                          else actionToBeCompared = "view";
                        }
                        // this.schema = JSON.parse(this.dataset.schemajson)?.filter(ele => ele.templateTags?.toString().split(",").includes(actionToBeCompared))[0];
                        // if (!this.schema && JSON.parse(this.dataset.schemajson)?.length > 0) this.schema = JSON.parse(this.dataset.schemajson)[0];
                        this.formObjValue.data = resp[0];
                        this.formObjValueCpy = _.cloneDeep(this.formObjValue);
                        resolve("Entry refreshed successfully");
                      }
                      else {
                        this.datasetsService.message("Did not receive any data from the server", "Dataset Form View");
                        reject("Did not receive any data from the server");
                      }
                    }
                    else {
                      this.datasetsService.message("Error occured while fetching data from server " + resp, "Dataset Form View");
                      reject("Error occured while fetching data from server " + resp);
                    }
                  }
                  else {
                    this.datasetsService.message("Did not receive any data from the server", "Dataset Form View");
                    reject("Did not receive any data from the server");
                  }
                },
                  error => {
                    this.datasetsService.message("Error occured while fetching data from server " + error, "Dataset Form View");
                    reject("Error occured while fetching data from server " + error);
                  })
              break;
            case "eventTrigger":
              let eventName: string = Object.values(actionNames)[0].toString();
              let formValues = Object.entries(this.formObjValue.data)
                .filter(ele => ele[0] != "submit" && ele[0] != "reset" && ele[0] != "refresh" && ele[0] != "eventTrigger" && ele[0] != "internalNavigation"
                  && !new RegExp('externalNavigation[0-9]{0,3}$').test(ele[0]) && !new RegExp('multipleActions[0-9]{0,3}$').test(ele[0]));
              this.formObjValue.data = {};
              formValues.forEach(prop => this.formObjValue.data[prop[0]] = prop[1]);
              
              if (actionNames.body) {
                actionNames.body = actionNames.body.replace("$ticketcreatetype$",this.id)
                let a = (actionNames.body).split("$")
                for (let i = 1; i < a.length; i = i + 2) {
                  let value = a[i]
                  actionNames.body = actionNames.body.replace("$" + a[i] + "$", this.formObjValue.data[value])
                }
                
                this.formObjValues = actionNames.body;
              }
              else {
                this.formObjValues = { "formValues": this.formObjValue }
              }
              this.datasetsService.triggerPostEvent(eventName, this.formObjValues)
                .subscribe(resp => {
                  this.datasetsService.message(eventName + " Event Triggered Successfully", "Dataset Form View");
                  resolve(eventName + " Event Triggered Successfully");
                },
                  err => {
                    this.datasetsService.message("Error occurred while triggering event " + eventName, err);
                    reject("Error occurred while triggering event " + eventName + " " + err);
                  })
              break;
            case "internalNavigation":
              let internalUrl: string = Object.values(actionNames) && Object.values(actionNames)[0]?.toString();
              let newUrl: string = internalUrl;
              if (internalUrl.includes("{") && internalUrl.includes("}")) {
                newUrl = "";
                let routeFrags = internalUrl?.split("/");
                routeFrags.forEach(ele => {
                  if (ele.startsWith("{") && ele.endsWith("}")) {
                    ele = this.formObjValue.data[ele.substring(1, ele.length - 1)];
                  }
                  newUrl += "/" + ele;
                })
              }
              this.router.navigate([newUrl]).then(resp => resolve(resp.toString())).catch(error => reject(error))
              break;
            case "externalNavigation":
              Object.values(actionNames).forEach((url, index) => {
                window.open(url as string, "_blank");
                if (index == Object.values(actionNames).length - 1) resolve("Navigated successfully");
              })
              break;
            case "api":
  //console.log("formvalues=", this.formObjValue.data)
              // delete this.formObjValue.data["tags"]
              for(let action in actionNames){
                if(action!="url")
                  this.formObjValue.data[action] = actionNames[action].replace("{org}", sessionStorage.getItem("organization"))
                                                    .replace("{useremail}",JSON.parse(sessionStorage.getItem("user")).user_email)
              }
              if(actionNames.organization){
                this.formObjValue.data.organization = sessionStorage.getItem("organization")
              }
  //console.log(actionNames,this.formObjValue.data)
              this.datasetsService.callPostApi(actionNames.url,this.formObjValue.data).subscribe(resp=>{
            
                this.datasetsService.message("Success","")
              },err=>{
                this.datasetsService.message("Fail", err)
              })
              break;
            case "ok":
          this.formData.emit(this.formObjValue.data)
          
              break;
            case "cancel":
             // this.location.back()
                this.result.emit("backToTableView")
          }
        })
      }
      catch (Exception) {
        this.datasetsService.message("Some error occured", "Error")
      }
  
    }
  
    performMultipleActions(actionList, index) {
      if (index < actionList.length) {
        let actionObj = {};
        actionObj['name'] = actionList[index][0];
        actionObj['properties'] = {};
        actionObj['properties'][actionList[index][0]] = actionList[index][1];
        this.navigateToAction(actionObj)
          .then(resp => setTimeout(() => { this.performMultipleActions(actionList, index + 1) }, 1000))
          .catch(err => this.datasetsService.message("Error ", err));
      }
    }
  
    saveEntry(option?: string): Promise<string> {
      try {
        this.loading = true;
        let rowData, action;
        if (this.btnText == "Add") {
          let formValues = Object.entries(this.formObjValue.data).filter(ele => ele[0] != "submit" && ele[0] != "reset" && ele[0] != "refresh"
            && ele[0] != "eventTrigger" && ele[0] != "internalNavigation"
            && !new RegExp('externalNavigation[0-9]{0,3}$').test(ele[0]) && !new RegExp('multipleActions[0-9]{0,3}$').test(ele[0])
            && !this.workflowFields.includes(ele[0]));
          this.formObjValue.data = {};
          formValues.forEach(prop => this.formObjValue.data[prop[0]] = prop[1]);
          rowData = this.formObjValue.data;
          if (rowData['formkey']) delete rowData['formkey'];
          this.formObjValueCpy = _.cloneDeep(this.formObjValue);
          if(this.incSource == "enduser" && option=="createCase"){
            this.incProcessName = rowData['proc_def_key_'];
            this.ocrIdList = [];
            return new Promise((resolve,reject)=>{ 
              rowData['requested_by'] = (!rowData['requested_by'] || rowData['requested_by'].toString().replace(/\s/g, "").length==0) ? JSON.parse(sessionStorage.getItem('user')).user_email : rowData['requested_by'];
              if(this.incAction == "ocr"){
                if(this.ocrIdList?.length==0) this.ocrIdList=undefined;
              }
              let idListString:any = null;
              if(this.ocrIdList != undefined && this.ocrIdList){
                idListString = this.ocrIdList.toString();
              }
              this.busy = this.datasetsService.addEndUserData(rowData,action,this.datasetName,this.incProcessName)
              .subscribe(resp=>{
                if(resp==undefined || resp.status.toString().startsWith("2")){
                  this.datasetsService.message(resp.body,"Submitted");
                  resolve("Case created successfully");
                  setTimeout(()=>{ this.result.emit("backToTableView"); }, 1000);
                }
                else{
                  this.datasetsService.message("Some error occured while creating case","Case Management");
                  reject("Some error occured while creating case");
                }
              },
              error=>{
                this.datasetsService.message("Error occured while creating case "+error,"Case Management");
                reject("Error occured while creating case "+error);
              })
            })
          }
          if(option=="createCase" && this.incSource != "enduser"){
            return new Promise((resolve,reject)=>{ 
              rowData['requested_by'] = (!rowData['requested_by'] || rowData['requested_by'].toString().replace(/\s/g, "").length==0) ? JSON.parse(sessionStorage.getItem('user')).user_email : rowData['requested_by'];
              if(this.incAction == "ocr"){
                if(this.ocrIdList?.length==0) this.ocrIdList=undefined;
              }
              this.busy = this.datasetsService.startProcess(this.incProcessName,rowData,"Manual",this.ocrIdList?this.ocrIdList.toString():"")
              .subscribe(resp=>{
                if(resp==undefined || resp.status.toString().startsWith("2")){
                  this.datasetsService.message(resp.body,"Submitted");
                  resolve("Case created successfully");
                  setTimeout(()=>{ this.result.emit("backToTableView"); }, 1000);
                }
                else{
                  this.datasetsService.message("Some error occured while creating case","Case Management");
                  reject("Some error occured while creating case");
                }
              },
              error=>{
                this.datasetsService.message("Error occured while creating case "+error,"Case Management");
                reject("Error occured while creating case "+error);
              })
            })
          }
          action = "create";
  
          this.formData.emit(this.formObjValue.data)
        }
        else if (this.btnText == "Update") {
          this.rowEntryChanges[this.unqId] = this.unqIdValue;
          let formValues = Object.entries(this.rowEntryChanges).filter(ele => ele[0] != "submit" && ele[0] != "reset" && ele[0] != "refresh"
            && ele[0] != "eventTrigger" && ele[0] != "internalNavigation"
            && !new RegExp('externalNavigation[0-9]{0,3}$').test(ele[0]) && !new RegExp('multipleActions[0-9]{0,3}$').test(ele[0])
            && !this.workflowFields.includes(ele[0]));
          this.rowEntryChanges = {};
          formValues.forEach(prop => this.rowEntryChanges[prop[0]] = prop[1]);
          rowData = this.rowEntryChanges;
          this.dataComponentList.forEach(ele => {
            try {
              if (JSON.stringify(this.formObjValueCpy.data[ele]) != JSON.stringify(this.formObjValue.data[ele]))
                rowData[ele] = this.formObjValue.data[ele];
            }
            catch (Exception) { }
          })
          if (option == "completeActiveTask") {
            return new Promise((resolve, reject) => {
              rowData = {};
              Object.entries(this.formObjValue.data).filter(ele => this.workflowFields.includes(ele[0]))
                .forEach(prop => rowData[prop[0]] = prop[1]);
              Object.entries(rowData).forEach(ele => {
                if (typeof (ele[1]) == "object") {
                  let ky = Object.keys(rowData[ele[0]])[0];
                  rowData[ele[0]] = rowData[ele[0]][ky];
                }
              })
              rowData['contents'] = {};
              Object.keys(rowData).forEach(ele => {
                if (ele != "comments" && ele != "contents") {
                  rowData['contents'][ele] = rowData[ele];
                  delete rowData[ele];
                }
              })
              if (Object.keys(rowData['contents']).length == 0) delete rowData['contents'];
              if (this.incAction == "ocrUpdate") {
                this.rowEntryChanges = {...this.filteredOcrData, ...this.rowEntryChanges};
              }
              rowData['variables'] = this.rowEntryChanges;
              this.busy = this.datasetsService.completeActiveTask(this.incRowObj["ID"], this.incProcessName, rowData)
                .subscribe(resp => {
                  if (resp == undefined || resp.status.toString().startsWith("2")) {
                    this.datasetsService.message("Case transferred successfully", "Case Management");
                    resolve("Case transferred successfully");
                    setTimeout(() => { this.result.emit("backToTableView"); }, 1000);
                  }
                  else {
                    this.datasetsService.message("Some error occured while transferring case", "Case Management");
                    reject("Some error occured while transferring case");
                  }
                },
                  error => {
                    this.datasetsService.message("Error occured while transferring case " + error, "Case Management");
                    reject("Error occured while transferring case " + error);
                  })
            })
          }
          else if (this.incSource == "caseDetails") {
            return new Promise((resolve, reject) => {
              if (this.incAction == "ocrUpdate") {
                rowData = {...this.filteredOcrData, ...rowData};
              }
              this.busy = this.datasetsService.updateProcessInstanceVariables(this.incProcessName, rowData, this.businesskey)
                .subscribe(resp => {
                  if (resp == undefined || resp.status.toString().startsWith("2")) {
                    this.datasetsService.message("Case updated successfully", "Case Management");
                    this.datasetsService.dataRefreshed2.next(this.formObjValue);
                    resolve("Case updated successfully");
                  }
                  else {
                    this.datasetsService.message("Some error occured while updating case", "Case Management");
                    reject("Some error occured while updating case");
                  }
                },
                  error => {
                    this.datasetsService.message("Error occured while updating case " + error, "Case Management");
                    reject("Error occured while updating case " + error);
                  })
            })
          }
          action = "update";
          if (this.caseMgmt) {
  
            rowData['BID'] = this.incRowObj?.BID;
          }
        }
        return new Promise((resolve, reject) => {
          delete rowData["cancel"]
          this.busy = this.datasetsService.saveEntry(JSON.stringify(rowData), action, this.dataset.name)
            .subscribe(resp => {
              if (resp) {
                if (resp.startsWith("Error: ")) {
                  this.datasetsService.message(resp.substring(7), "Dataset View");
                  reject(resp.substring(7));
                }
                else {
                  this.datasetsService.message(resp, "Dataset View");
                  if (this.btnText == "Update") this.rowEntryChanges = {};
                  resolve(resp);
                }
              }
              else {
                reject("No response from server");
              }
            },
              error => {
                this.datasetsService.message(error, "Dataset View");
                reject(error);
              })
        })
      }
      catch (Exception) {
        this.datasetsService.message("Some error occured", "Error")
      }
  
    }
  
    changeToTableView() {
      // this.formView = false;
      this.result.emit("backToTableView");
      // if (this.powerMode) {
      //   this.powerModeToggle(undefined);
      // }
    }
  
    disableFormFields() {
      if (!this.isdatasetroute)
        return { 'pointer-events': 'auto', 'opacity': '1' };
      else if ((!this.caseMgmt && this.btnText == 'Update' && !this.showUpdateBtn) || (this.caseMgmt && !this.writeAccess) || this.disable)
        return { 'pointer-events': 'none', 'opacity': '0.8' }
  
      return { 'pointer-events': 'auto', 'opacity': '1' };
    }
  
    changeForm(){
      if(JSON.stringify(this.formObjValue?.data)!="{}")
        this.selectedValueChanged.emit(this.formObjValue?.data)
    }
  
  
    ngDoCheck() {
      if (this.formObjValue?.data) { //this.formView && 
        if (this.btnText == "Update") {
          if (this.differ) {
            let differences = this.differ.diff(this.formObjValue.data);
            if (differences) {
              differences.forEachChangedItem(rcd => {
                if (this.valCpy[rcd.key] != rcd.currentValue) this.rowEntryChanges[rcd.key] = rcd.currentValue;
                else {
                  if (Object.keys(this.rowEntryChanges).includes(rcd.key)) delete this.rowEntryChanges[rcd.key];
                }
              });
            }
            // if (Object.keys(this.rowEntryChanges).length < 1 || !this.checkFormValidations()) this.enblSaveBtn = false;
            // else this.enblSaveBtn = true;
            // this.enblSaveBtn = (Object.keys(this.rowEntryChanges).length > 0);
          }
          // else {
          //   this.enblSaveBtn = false;
          // }
          if (this.router.url.includes("sandbox") || this.router.url.includes("workflows"))
            this.formData.emit(this.rowEntryChanges)
        }
        else if (this.btnText == "Add") {
          // if (Object.keys(this.formObjValue).length < 1 || !this.checkFormValidations()) this.enblSaveBtn = false;
          // else this.enblSaveBtn = true;
          // this.enblSaveBtn = (Object.keys(this.formObjValue.data).length > 0);
          if (this.router.url.includes("sandbox"))
            this.formData.emit(this.formObjValue.data)
        }
      }
    }
  
    ngOnChanges(changes) {
      if (changes?.incSource?.currentValue?.toString()=="inbox" || changes?.incSource?.currentValue?.toString()=="caseDetails"  || changes?.incSource?.currentValue?.toString()=="enduser"){
        this.incSource = changes.incSource.currentValue.toString();
        this.data = new Dataset();
        this.data.name = changes?.data?.currentValue;
        this.incAction = changes?.incAction?.currentValue;
        this.incProcessName = changes?.incProcessName?.currentValue;
        if(this.incAction=="add" || this.incAction=="new"){
          this.datasetsService.getFormNameConstant(this.incProcessName).subscribe(resp=>{
            this.incRowObj = {'formkey':resp["create"]};
            this.formname=resp["create"]
          });
          
        }
        else if(this.incAction=="ocr"){
          this.incRowObj = changes?.incRowObj?.currentValue;
          this.datasetsService.getFormNameConstant(this.incProcessName).subscribe(resp=>{
            this.incRowObj['formkey']=resp["create"];
            this.formname=resp["create"]
          });
          this.ocrIdList = changes?.ocrIdList?.currentValue;
        }
        else if(this.incAction=="update" || this.incAction=="ocrUpdate"){
          this.incRowObj = changes?.incRowObj?.currentValue;
        }
        let currentValue = changes?.incRowObj?.currentValue;
        if (currentValue?.toString().replace(/\s/g, "").length > 0 && this.dataset) this.openForm(this.incAction, currentValue);
        this.getSourceApiParameters();
        return;
      }
      let currentValue = changes?.incRowObj?.currentValue;
      if (currentValue?.toString().replace(/\s/g, "").length > 0 && this.dataset) this.openForm(this.incAction, currentValue);
    }
  
    ngAfterViewChecked() {
      try {
        if (!this.actionsChecked || !document.getElementById(this.nodeId)) {
          let formContentsDiv = document.getElementById("dtstfrmvw-frmcntnts");
          if (formContentsDiv && this.schema && Object.keys(this.schema).length > 0) {          
              JSON.stringify(this.schema, (_, nestedValue) => {
                if (nestedValue && nestedValue['type'] == "button") {
                  this.actionsList.push({ "name": nestedValue['key'], "properties": nestedValue['properties'], "count": 0 });
                  let node = document.createElement('span');
                  node.classList.add("d-none","adp-form-btn-clck-chck")
                  // node.className = ;
                  // node.className = "adp-form-btn-clck-chck"
                  node.id = "formio-btnclk-" + nestedValue['key'];
                  this.nodeId = node.id
                  node.innerHTML = "0";
                  formContentsDiv.appendChild(node);
  
                }
                if (nestedValue?.tags?.includes("workflow")) this.workflowFields.push(nestedValue['key'])
                return nestedValue;
              });
              this.actionsChecked = true;
            }
  
            
          }
        
      }
      catch (Exception) {
        this.datasetsService.message("Some error occured", "Error")
      }
  
    }
  
}
