import { Component, OnInit } from '@angular/core';
import { Services } from '../../services/service';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { AdapterServices } from '../../adapter/adapter-service';
import { DashConstant } from 'com-lib-util';
import { Project } from '../../models/project';
import { SemanticSearchContext } from '../../DTO/SemanticSearchContext';
import { SemanticSearchDataSetViewDialogComponent } from '../semantic-search-dataset-view/semantic-search-dataset-view-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-semantic-search-infer',
  templateUrl: './semantic-search-infer.component.html',
  styleUrls: ['./semantic-search-infer.component.scss']
})

export class SemanticSearchInferComponent implements OnInit {
  serverUrl = "";
  query: string;
  index: string;
  datasetList: OptionsDTO[] = [];
  datasetAlias: any;
  response: any;
  cURL: string;
  specPath: any;
  isInstance: boolean = true;
  isEndpoint: boolean = false;
  adapter: any;
  adapterName: string;
  instanceName: string;
  result: any;
  answer: any;
  loading: boolean = false;
  isCollapsed: boolean = false;
  formattedapispec: any[];
  spec: any = {};
  spp: any;
  isInstanceNameConfigured: boolean = false;
  adapterInstanceName: string;
  instanceNameDashConstantsKey: string = "icip.semantic-search.adapter-instance-name";
  dashConstant: DashConstant;
  project: Project;
  projectId: any;
  isInstanceExist: boolean = true;
  adapterInstance: any;
  loadingPage: boolean = true;
  adaptersOptions: OptionsDTO[] = [];
  adapterInstances: any;
  semanticSearchContextList: SemanticSearchContext[] = [];
  tooltipPoition: string = 'above';

  constructor(
    private service: Services,
    private adapterServices: AdapterServices,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.isInstanceNameConfigured = false;
    this.checkInstanceNameConfiguration();
    this.serverUrl = window.location.origin;
    if (history.state) {
      this.datasetList.push(new OptionsDTO(history.state.datasetAlias, history.state.datasetId));
      this.datasetAlias = history.state.datasetId;
    }
    let org = sessionStorage.getItem("organization");
    this.service.getDatasetNames(org).subscribe((res) => {
      if (res) {
        for (let dataset of res) {
          this.datasetList.push(new OptionsDTO(dataset.alias, dataset.name));
        }
      }
    })
  }

  formatSpec() {
    this.formattedapispec = []
    for (let keys in this.spp.paths) {
      if (keys.includes('infer')) {
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
    this.spec = this.formattedapispec[0]
  }

  optionChange($event) {
    this.datasetAlias = $event;
  }

  onSearch() {
    this.semanticSearchContextList = [];
    if (this.query) {
      this.loading = true
      this.answer = ''
      this.result = []
      // to add query in spec
      let spec = JSON.parse(JSON.stringify(this.spec));
      let requestBody = JSON.parse(spec.requestBody.value);
      requestBody.config.VectorStoreConfig.query = this.query;
      requestBody.config.LLMConfig.query = this.query;
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
              params[param.name] = param.value ? param.value.replace("{datasource}", this.adapter).replace("{org}", sessionStorage.getItem("organization")) : ""
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
        url = this.serverUrl + this.specPath
        this.adapterServices.callPostApi(url, spec.requestBody.value, params, headers).subscribe(resp => {
          this.response = resp
          if (resp.body) {
            this.loading = false;
            this.result = resp.body;
            this.answer = this.result[0]['Answer'].toString();
            this.result[1]['context'].forEach(ele => {
              this.service.getDatasetByNameAndOrg(ele.metadata.dataset_id, ele.metadata.organization).subscribe((resBody) => {
                if (resBody) {
                  let semanticSearchContext = new SemanticSearchContext();
                  semanticSearchContext.datasetId = ele.metadata.dataset_id;
                  if (resBody.alias)
                    semanticSearchContext.datasetName = resBody.alias;
                  semanticSearchContext.organization = ele.metadata.organization;
                  semanticSearchContext.datasetType = ele.metadata.dataset_type;
                  if (resBody.views)
                    semanticSearchContext.datasetView = resBody.views;
                  semanticSearchContext.source = ele.metadata.source;
                  semanticSearchContext.pageContent = ele.page_content;
                  if (resBody.attributes) {
                    let attrs = JSON.parse(resBody.attributes)
                    if (attrs.object)
                      semanticSearchContext.object = attrs.object;
                  }
                  this.semanticSearchContextList.push(semanticSearchContext);
                }
              });
            });
          }
        }, err => {
          this.response = err
          if (!err) this.response = "ERROR"
        })
        if (spec.requestBody.value) {
          if (spec.requestBody.value.includes("'")) {
            spec.requestBody.value = spec.requestBody.value.replaceAll("'", "'\\''");
          }
        }
      }
    }
    else {
      this.service.message('Please fill all the fields', 'error');
    }
  }

  toggleChange($event) {
    this.isCollapsed = !this.isCollapsed;
  }

  navToDataset(dset, org, viewType, object, datasetName) {
    const dialogRef = this.dialog.open(SemanticSearchDataSetViewDialogComponent, {
      height: '100%',
      width: '100%',
      disableClose: true,
      data: {
        viewType: viewType,
        datasetId: dset,
        org: org,
        object: object,
        datasetName: datasetName,
      }
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

  checkInstanceNameConfiguration() {
    this.findAllAdapters();
    this.service.getConstantByKey(this.instanceNameDashConstantsKey).subscribe((res) => {
      if (res.body) {
        this.instanceName = res.body;
        this.isInstanceNameConfigured = true;
        this.loadingPage = false;
        this.checkIsInstanceExist();
      } else {
        this.loadingPage = false;
        this.isInstanceNameConfigured = false;
      }
    });
  }

  checkIsInstanceExist() {
    this.adapterServices.getInstanceByNameAndOrganization(this.instanceName).subscribe((res) => {
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

}
