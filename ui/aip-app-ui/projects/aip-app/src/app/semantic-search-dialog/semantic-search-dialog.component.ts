import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Services } from '../services/service';
import { AdapterServices } from '../adapter/adapter-service';
import { DashConstant } from 'com-lib-util';
import { Project } from '../models/project';
import { OptionsDTO } from '../DTO/OptionsDTO';
import { DatasetServices } from '../dataset/dataset-service';
import { LedsModalService } from 'leds-lib';
import { SemanticService } from '../services/semantic.services';
import { Validators } from '@angular/forms';
import { MlTopic } from '../DTO/mlTopic';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';

@Component({
  selector: 'app-semantic-search-dialog',
  templateUrl: './semantic-search-dialog.component.html',
  styleUrls: ['./semantic-search-dialog.component.scss']
})
export class SemanticSearchDialogComponent implements OnInit {
  type: string = 'ingest';
  index_id: any;
  cURL: string;
  specPath: any;
  isInstance: boolean = true;
  isEndpoint: boolean = false;
  response: any;
  serverUrl = "";
  adapter: any;
  adapterName: string;
  instanceName: string;
  result: any;
  spp: any;
  formattedapispec: any[];
  spec: any = {};
  isInstanceNameConfigured: boolean = false;
  adapterInstanceName: string;
  instanceNameDashConstantsKey: string = "icip.semantic-search.adapter-instance-name";
  dashConstant: DashConstant;
  project: Project;
  projectId: any;
  isInstanceExist: boolean = true;
  adapterInstance: any;
  loadingPageForSpinner: boolean = true;
  isIngestionTriggered: boolean = false;
  adaptersOptions: OptionsDTO[] = [];
  adapterInstances: any;
  dataset: any;
  editAuth: boolean = false;
  @Input() public data: any;
  topics: any;
  filteredTopics: any;
  createNewKBScreen: boolean = false;
  indexName: string;
  mlTopics: any;
  knowledgeBaseOptions: OptionsDTO[] = [];
  knowledgeBaseOptionsList = [];
  errMsg: string = "Name is required filed.";
  regexPatternObj: any;
  nameFlag: boolean = false;
  errMsgFlag: boolean = true;
  regexPatternForExistingNames = `^(?!REX).+$`;
  regexPatternForExistingNamesObj: any;
  regexPatternForValidAlphabets = `^[a-zA-Z0-9\_\-]+$`;
  regexPatternForValidAlphabetsObj: any;
  nameValidator: any;
  regString: string = '';
  regexPatternString: any;
  regexPattern = `^(?!REX)[a-zA-Z0-9\_\-]+$`;
  regexPatterForEmptyNames = `^(?!www$)[a-zA-Z0-9\_\-]+$`;
  relatedTopicsList = [];
  mlTopic: MlTopic;
  selectedTopic: string;
  selectedTopicId: string;
  selectedTopicObj: any;
  description: string = '';
  adapterInstanceNameExist: boolean = false;
  startTime: any;
  endTime: any;
  showLog: boolean = false;
  searchInp: string;
  apiSpecServerUrl: string;

  constructor(
    public dialogRef: MatDialogRef<SemanticSearchDialogComponent>,
    private service: Services,
    private adapterServices: AdapterServices,
    private datasetServices: DatasetServices,
    private modalService: LedsModalService,
    private semanticService: SemanticService,
    private dialog: MatDialog,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.apiSpecServerUrl = null;
    this.isInstanceNameConfigured = false;
    this.knowledgeBaseOptionsList = [];
    this.relatedTopicsList = [];
    this.selectedTopic = '';
    this.description = "";
    this.selectedTopicObj = undefined;
    this.showLog = false;
    this.selectedTopicId = undefined;
    this.searchInp = "";
    this.semanticService.getAllTopics().subscribe(res => {
      this.mlTopics = res;
      this.mlTopics.forEach(topic => {
        this.knowledgeBaseOptions.push(new OptionsDTO(topic.topicname, topic.topicname));
        this.knowledgeBaseOptionsList.push(topic.topicname);
      });
    },)
    this.semanticService.getIngestedTopicsByDatasetnameAndOrg(this.data).subscribe(res => {
      this.topics = res;
      this.filteredTopics = res;
      this.topics.forEach(topic => {
        this.relatedTopicsList.push(topic.topicname.topicname);
      });
      if (this.relatedTopicsList.length > 0) {
        for (let i = 0; i < this.relatedTopicsList.length; i++) {
          if (i != this.relatedTopicsList.length - 1)
            this.regString = this.regString.concat(this.relatedTopicsList[i].concat('$|'));
          else
            this.regString = this.regString.concat(this.relatedTopicsList[i].concat('$'));
        }
        this.regexPatternString = this.regexPattern.replace('REX', this.regString)
        this.regexPatternForExistingNames = this.regexPatternForExistingNames.replace('REX', this.regString)
      } else {
        this.regexPatternString = this.regexPatterForEmptyNames;
      }
      this.regexPatternObj = new RegExp(this.regexPatternString, 'i');
      this.regexPatternForExistingNamesObj = new RegExp(this.regexPatternForExistingNames, 'i');
      this.regexPatternForValidAlphabetsObj = new RegExp(this.regexPatternForValidAlphabets, 'i');

      this.nameValidator = [Validators.required, Validators.pattern(this.regexPatternObj)];

      this.loadingPageForSpinner = false;
    });
    this.service.getDatasetByNameAndOrg(this.data).subscribe((res) => {
      if (res) {
        this.dataset = res;
        if (this.dataset.indexname) {
          this.index_id = this.dataset.indexname;
        }
      }
    });
    if (this.data) {
      this.type = 'ingest'
    }
    this.authentications();
    this.findAllAdapters();
  }

  createNewKB() {
    this.indexName = "";
    this.adapterInstanceName = "";
    this.createNewKBScreen = true;
    this.selectedTopic = '';
    this.description = "";
    this.selectedTopicObj = undefined;
    this.showLog = false;
    this.selectedTopicId = undefined;
  }

  deleteTopicById() {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.semanticService.deleteTopicById(this.selectedTopicObj.id).subscribe(res => {
          if (res) {
            if (res.message == "success")
              this.adapterServices.messageNotificaionService('success', "Done!  Topic Deleted Successfully");
          } else
            this.adapterServices.messageNotificaionService('error', "Error");
          this.selectedTopic = '';
          this.selectedTopicId = '';
          this.selectedTopicObj = undefined;
          this.ngOnInit();
        }, error => { this.service.messageService(error); });
      }
    });
  }

  cancelLinkKB() {
    this.createNewKBScreen = false;
    this.indexName = "";
    this.adapterInstanceName = "";
    this.description = "";
    this.ngOnInit();
  }

  searchfilteredTopics(filter) {
    this.showLog = false;
    this.selectedTopicId = undefined;
    this.selectedTopic = '';
    this.selectedTopicObj = undefined;
    this.filteredTopics = []
    if (filter && filter != "") {
      this.topics.forEach(topic => {
        if (topic.topicname.topicname?.toUpperCase().includes(filter?.toUpperCase())) {
          this.filteredTopics.push(topic);
        }
      });
    }
    else if (filter == "") {
      this.topics.forEach(indexName => {
        this.filteredTopics.push(indexName);
      });
    }
  }

  indexNameChangesOccur(indexName) {
    this.errMsg = "Name is required filed.";
    if (this.regexPatternObj.test(indexName)) {
      this.nameFlag = true;
      this.errMsgFlag = false;
    } else {
      this.nameFlag = false;
      this.errMsgFlag = true;
      if (indexName.length == 0) {
        this.errMsg = "Name is required filed.";
      } else if (indexName.match(this.regexPatternForExistingNamesObj) == null) {
        this.errMsg = "Name already exists";
      } else if (indexName.match(this.regexPatternForValidAlphabetsObj) == null) {
        this.errMsg = "Name should not contain special characters, accepted special characters are _ and -";
      }
    }
    this.knowledgeBaseChangesOccur(indexName);
  }

  knowledgeBaseChangesOccur(knowledgeBaseName) {
    this.adapterInstanceName = '';
    this.adapterInstanceName = this.mlTopics.filter(result => result.topicname === knowledgeBaseName)?.[0]?.adapterinstance;
    if (this.adapterInstanceName && this.adapterInstanceName != '') {
      this.adapterInstanceNameExist = true;
    }
    else {
      this.adapterInstanceNameExist = false;
    }
  }

  retryLinkKB() {
    this.indexName = this.selectedTopicObj.topicname.topicname;
    this.adapterInstanceName = this.selectedTopicObj.topicname.adapterinstance;
    this.description = undefined;
    this.createAndLinkToKB();
  }

  createAndLinkToKB() {
    try {
      this.isIngestionTriggered = true;
    this.mlTopic = new MlTopic(this.data, sessionStorage.getItem('organization'), this.indexName, this.adapterInstanceName, 'IN-PROGRESS', this.description);
    this.semanticService.addOrUpdateTopic(this.mlTopic).subscribe(res => {
      this.initiateKnowledgeBaseIngestion(this.adapterInstanceName);
    });
  } catch (error) {
    console.error("Error in createAndLinkToKB:", error);
    this.adapterServices.messageNotificaionService('error', "Some error occured!");
    this.isIngestionTriggered = false;
    this.closeModal();
  }
  }

  initiateKnowledgeBaseIngestion(adapterInstanceName) {
    try {
      this.instanceName = adapterInstanceName;
      this.adapterServices.getInstanceByNameAndOrganization(adapterInstanceName).subscribe((res) => {
        if (res && res.adaptername) {
          this.adapterName = res.adaptername;
          this.adapterServices.getAdapteByNameAndOrganization(this.adapterName).subscribe((resAdp) => {
            if (resAdp) {
              this.isInstanceExist = true;
              this.adapter = resAdp;
              this.spp = JSON.parse(resAdp.apispec);
              this.formatSpec();
            } else {
              this.isInstanceExist = false;
            }
          });
        } else {
          this.isInstanceExist = false;
        }
      });
    }
    catch (error) {
      this.adapterServices.messageNotificaionService('error', "Some error occured!");
      this.isIngestionTriggered = false;
    }
  }

  showOrHideLog() {
    this.showLog = !this.showLog;
  }

  linked(result, b, c) {
    this.showLog = false;
    let timezoneOffset = new Date().getTimezoneOffset();
    if (result.startTime)
      this.startTime = new Date(new Date(result.startTime).getTime() - timezoneOffset * 60 * 1000);
    else
      this.startTime = undefined;

    if (result.finishTime)
      this.endTime = new Date(new Date(result.finishTime).getTime() - timezoneOffset * 60 * 1000);
    else
      this.endTime = undefined;

    this.selectedTopic = result.topicname.topicname;
    this.selectedTopicId = result.id;
    this.selectedTopicObj = result;
  }

  formatSpec() {
    try {
    this.formattedapispec = []
    if (this.spp && this.spp.servers[0]?.url)
      this.apiSpecServerUrl = this.spp.servers[0].url;
    for (let keys in this.spp.paths) {
      if (keys.includes(this.type)) {
        for (let key in this.spp.paths[keys]) {
          let pathObj = {}
          pathObj["path"] = keys
          pathObj["requestType"] = key.toUpperCase()
          for (let value in this.spp.paths[keys][key]) {
            if (value == "responses") {
              let responses = []
              for (let resp in this.spp.paths[keys][key][value]) {
                let respObj = {}
                respObj["status"] = resp
                respObj["description"] = this.spp.paths[keys][key][value][resp]["description"]
                respObj["content"] = this.spp.paths[keys][key][value][resp]["content"]
                responses.push(respObj)

              }
              pathObj[value] = responses
            }
            else if (value == "parameters") {
              for (let i = 0; i < this.spp.paths[keys][key][value].length; i++) {
                this.spp.paths[keys][key][value][i].value = this.spp.paths[keys][key][value][i].value?.replace("{datasource}", this.adapter?.alias).replace("{org}", sessionStorage.getItem("organization"))
              }
              pathObj[value] = this.spp.paths[keys][key][value]
            }
            else {
              pathObj[value] = this.spp.paths[keys][key][value];
              if (pathObj["requestType"] == "POST" && value == "requestBody") {
              }
            }
          }
          pathObj["button"] = "Try it out"
          pathObj["executeFlag"] = false
          this.formattedapispec.push(pathObj)
        }
      }
    }
    this.spec = this.formattedapispec[0];
  } catch (error) {
    console.error("Error in ingestToKB:", error);
    this.adapterServices.messageNotificaionService('error', "Some error occured!");
    this.isIngestionTriggered = false;
    this.closeModal();
  }
    this.ingestToKB();
  }

  closeModal() {
    this.modalService.dismissAll('close the modal');

  }

  ingestToKB() {
    try {
    if (this.indexName == undefined || this.indexName == null || this.indexName == '') {
      this.service.message('Enter Details', 'error');
    }
    else {
      let org = sessionStorage.getItem("organization");
      let spec = JSON.parse(JSON.stringify(this.spec));
      let requestBody = JSON.parse(spec.requestBody.value);
      requestBody["dataset_id"] = this.data;
      requestBody["organization"] = org;
      requestBody["index_name"] = this.indexName;
      if (requestBody.config?.VectorStoreConfig) {
        requestBody.config.VectorStoreConfig["index_name"] = this.indexName;
      }
      spec.requestBody.value = JSON.stringify(requestBody);
      spec.path.substring(0, spec.path.lastIndexOf('/')) + '/' + sessionStorage.getItem('organization')

      this.cURL = null;
      this.specPath = spec.path;
      this.response = { "Status": "Executing" };
      spec["executeFlag"] = true
      let headers = {}
      if (this.specPath && this.specPath.includes("/adapters/"))
        headers['access-token'] = localStorage.getItem("accessToken");
      let params = {}
      if (spec.parameters) {
        for (let param of spec.parameters) {
          if (param.in == "params" || param.in == "query") {
            if (!this.isInstance)
              params[param.name] = param.value ? param.value.replace("{datasource}", this.adapterName).replace("{org}", sessionStorage.getItem("organization")) : ""
            else {
              params[param.name] = param.value ? param.value.replace("{datasource}", this.instanceName).replace("{org}", sessionStorage.getItem("organization")) : ""
            }
            if (!param.value)
              param.value = ""
          }
          if (param.in == "header") {
            headers[param.name] = param.value ? param.value : ""
          }
          if (param.in == "path") {
            this.specPath = this.specPath.replace("{" + param.name + "}", param.value)
          }
        }
      }
      if (this.isInstance)
        params['isInstance'] = 'true';
      if (this.isEndpoint)
        params['isInstance'] = 'REMOTE';
      if (spec.requestType.toLowerCase() == "post") {
        let url = spec.path;
        this.specPath = this.specPath.replace(this.adapterName, this.instanceName);
        if (this.apiSpecServerUrl && this.apiSpecServerUrl.includes("api"))
          this.serverUrl = this.apiSpecServerUrl.replaceAll("{spec}", this.instanceName).replaceAll("{org}", sessionStorage.getItem("organization")).replaceAll("{host}", window.location.origin);
        url = this.serverUrl + this.specPath
        if (spec.requestBody.content['multipart/form-data']) {
          delete headers['Content-Type']; delete headers['content-type']; delete headers['content-Type']; delete headers['Content-type'];
        } else {
          this.adapterServices.callPostApi(url, spec.requestBody.value, params, headers).subscribe(resp => {
            this.response = resp
            if (resp.body) {
              this.result = resp.body;
              this.adapterServices.messageNotificaionService('success', "Knowledge Base Ingestion Initiated");
              this.cancelLinkKB();
              this.closeModal();
              this.ngOnInit();
            } else {
              this.service.message('Upstream API is currently down! Please try again later', 'warning');
            }
          }, err => {
            this.service.message('Upstream API is currently down! Please try again later', 'warning');
            this.response = err
            if (!err) this.response = "ERROR"
          })
        }
        if (spec.requestBody.value) {
          if (spec.requestBody.value.includes("'")) {
            spec.requestBody.value = spec.requestBody.value.replaceAll("'", "'\\''");
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in ingestToKB:", error);
    this.adapterServices.messageNotificaionService('error', "Some error occured!");
    this.isIngestionTriggered = false;
    this.closeModal();
  }
  }

  adapterNameChangesOccur(adpName: string) {
    this.adapterInstanceName = adpName;
  }

  findAllAdapters() {
    this.adapterServices.getMlInstanceNamesByOrganization()
      .subscribe(res => {
        this.adapterInstances = res;
        this.adapterInstances.forEach((insNamr) => {
          this.adaptersOptions.push(new OptionsDTO(insNamr, insNamr));
        });
      });
  }

  configureAdapterInstance() {
    this.projectId = JSON.parse(String(sessionStorage.getItem('project'))).id;
    this.dashConstant = new DashConstant();
    this.project = new Project();
    this.project.id = this.projectId;
    this.dashConstant.keys = this.instanceNameDashConstantsKey;
    this.dashConstant.value = this.adapterInstanceName;
    this.dashConstant.project_id = this.project
    this.dashConstant.project_name = sessionStorage.getItem('organization');
    this.service.createDashConstant(this.dashConstant).subscribe((res) => {
      if (res) {
        this.adapterServices.messageNotificaionService('success', "Adapter Instance Name Configured Successfully");
        this.ngOnInit();
      } else {
        this.adapterServices.messageNotificaionService('error', "Some error occured!");
      }
    });
  }

  authentications() {
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes("dataset-edit")) this.editAuth = true;
      }
    );
  }

}
