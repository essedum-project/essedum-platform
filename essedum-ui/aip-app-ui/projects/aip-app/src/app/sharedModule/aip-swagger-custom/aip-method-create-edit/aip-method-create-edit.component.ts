import { Component, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdapterServices } from '../../services/adapter-service';
import { OptionsDTO } from '../../../DTO/OptionsDTO';
import { Services } from '../../../services/service';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { SwaggerAPISpec } from '../../../DTO/swaggerapispec';
import { AipSwaggerCustomComponent } from '../aip-swagger-custom.component';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-aip-method-create-edit',
  templateUrl: './aip-method-create-edit.component.html',
  styleUrls: ['./aip-method-create-edit.component.scss']
})
export class AipMethodCreateEditComponent {
  tab: any = 'connectionTab';
  scriptType = ['Groovy', 'Python'];
  requestMethods = ['GET', 'POST', 'PUT', 'DELETE'];
  connectionTypes = ['ApiRequest'];
  testDataset: any = { attributes: {} };
  transformScriptbasicReqTab: any = 'queryParamsTab';
  methodType: boolean = true;
  dynamicRequirementsArray: any[];
  dynamicImportsArray: any[];
  transformScriptData: any;

  connectionDetails: any;
  importsDynamic: { key: string };
  requirementsDynamic: { key: string };
  transformScriptShow = false;
  transformScript =
    'import groovy.json.*\n\ndef inpBody = "$Body"\ndef inpConnectionDetails = "$ConnectionDetails"\n\n//start your code from here\n\nreturn JsonOutput.prettyPrint(JsonOutput.toJson([Body:{preprocessed_Body}, QueryParams:{preprocessed_QueryParams},Headers:{preprocessed_Headers},bodyType:{preprocessed_bodyType},PathVariables:{preprocessed_PathVariables},Url:{preprocessed_Url},ConfigVariables:{preprocessed_ConfigVariables}]))\n';
  transformScript_cpy = [];
  transformScriptPythonShow = false;
  transformScriptPython =
    'def execute(connectionDetails,body):\n\n\t//start your code from here\n\n\treturn response';
  transformScriptPython_cpy = [];
  splunkTypes: any;
  connectionOptions: OptionsDTO[] = [];
  selectedConnection: any = { alias: '' };
  constructor(
    private dialogRef: MatDialogRef<AipMethodCreateEditComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private adapterServices: AdapterServices,
    private service: Services,
    private swaggerCustomComponent: AipSwaggerCustomComponent
  ) { }

  @Input('data') data: any;
  @Input('action') action: any;
  @Input('adapter') adapter: any;
  @Input('apiSpecServerUrl') apiSpecServerUrl: string;
  @Input('formType') formType: string;
  @ViewChild('formJsonEditor', { static: false })
  formJsonEditor: JsonEditorComponent;
  adapterOptions: OptionsDTO[] = [];
  dataset: any;
  datasource: any;
  remotePromise: Promise<boolean>;
  isInEdit: Boolean = true;
  proceed: Boolean = false;
  proceedContentFlag: Boolean = false;
  paramsDynamic: any = {};
  dynamicParamsArray: Array<DynamicParamsGrid> = [];
  headersDynamic: any = {};
  dynamicHeadersArray: Array<DynamicParamsGrid> = [];
  dynamicPathVariablesArray: Array<DynamicParamsGrid> = [];
  dynamicConfigVariablesArray: Array<DynamicParamsGrid> = [];
  pathVariablesDynamic: any = {};
  configVariablesDynamic: any = {};
  urlEncodedArray: Array<DynamicParamsGrid> = [];
  urlEncodedDynamic: any = {};
  editorOptions = new JsonEditorOptions();
  schemaForm: any = {};
  options: OptionsDTO[] = [];
  option: any;
  requestMethodOptions: OptionsDTO[] = [];
  selectedOption: any;
  body: any = '';
  pretransformData: boolean = false;
  transformData: boolean = false;
  bodyOption: string = 'raw';
  basicReqTab: any = 'queryParamsTab';
  datasetTypes = [];
  sourceType: any = {};
  prescript =
    'import groovy.json.*\n\ndef inpBody = "$Body"\ndef inpQueryParams = "$QueryParams"\ndef inpHeaders = "$Headers"\ndef inpbodyType = "$bodyType"\ndef inpPathVariables = "$PathVariables"\ndef inpUrl = "$Url"\ndef inpConfigVariables = "$ConfigVariables"\n\n//start your code from here\n\nreturn JsonOutput.prettyPrint(JsonOutput.toJson([Body:preprocessed_Body, QueryParams:preprocessed_QueryParams,Headers:preprocessed_Headers,bodyType:preprocessed_bodyType,PathVariables:preprocessed_PathVariables,Url:preprocessed_Url,ConfigVariables:preprocessed_ConfigVariables]))\n';
  script =
    'import groovy.json.*\n\ndef inpResponse = "$inputJson"\n//start your code from here\n';
  prescript_cpy = [];
  script_cpy = [];
  swaggerapispec: SwaggerAPISpec = new SwaggerAPISpec();
  connectionType: string = 'REST';
  returnedName: string;
  adapterApispecTemplate: any;
  cardTitle: String = 'Methods';
  editPromise: Promise<boolean>;
  isRemoteExecution: boolean = false;
  remoteExecutorURL: string;
  datasourcesForConnection: any;
  selectedFile: File;
  formData: FormData;
  fileName: string;

  ngOnInit(): void {
    this.editorOptions.modes = ['text', 'tree', 'view'];
    this.editorOptions.mode = 'text';
    this.options.push(new OptionsDTO('Text', 'Text'));
    this.options.push(new OptionsDTO('JSON', 'JSON'));
    this.options.push(new OptionsDTO('XML', 'XML'));
    this.options.push(new OptionsDTO('FILE', 'FILE'));
    this.selectedOption = this.options[0].value;
    if (this.adapter) {
      this.adapterApispecTemplate = JSON.parse(this.adapter.apispec);
      this.getDataSource();
    }
    this.adapterOptions.push(
      new OptionsDTO(this.adapter.name, this.adapter.name)
    );
    this.requestMethodOptions.push(new OptionsDTO('GET', 'GET'));
    this.requestMethodOptions.push(new OptionsDTO('POST', 'POST'));
    this.requestMethodOptions.push(new OptionsDTO('PUT', 'PUT'));
    this.requestMethodOptions.push(new OptionsDTO('DELETE', 'DELETE'));

    if (this.action == 'create') {
      this.findalldatasourcesForConnection();
      this.getDatasetForCreateMethod();
    }

    if (this.action == 'edit' || this.action == 'view') {
      this.findalldatasourcesForConnection();
      this.getDatasetForEditMethod(this.data);
    }
    if (this.formType == 'Script') {
      this.dataset.attributes['ScriptType'] = 'Python';
    }
  }

  getDatasetForCreateMethod() {
    let attributes = {
      RequestMethod: this.data.requestType,
      Headers: [],
      QueryParams: [],
      PathVariables: [],
      Url: '',
    };
    let headersData = [];
    let paramsData = [];
    let pathVariables = [];
    let datasetObj = {};
    if (this.data) {
      if (!this.data.parameters) this.data['parameters'] = [];
      if (
        !this.data.parameters?.filter((par) => par.name == 'cloud_provider')[0]
      ) {
        attributes['Headers'] = headersData;
        attributes['QueryParams'] = paramsData;
        attributes['PathVariables'] = pathVariables;
        attributes['Body'] = this.data?.requestBody?.value;
      }
      attributes['bodyType'] = 'Text';
      attributes['Cacheable'] = false;
      attributes['transformData'] = false;
      attributes['TransformationScript'] = '';
      attributes['bodyOption'] = 'raw';
      attributes['fileParamName'] = 'file';
    } else {
      attributes['transformScriptData'] = false;
      attributes['transformScriptTransformationScript'] = '';
      attributes['fileParamName'] = 'file';
    }
    datasetObj['attributes'] = attributes;
    datasetObj['datasource'] = this.data;
    datasetObj['type'] = 'rw';
    datasetObj['alias'] = this.data.alias;
    datasetObj['adaptername'] = this.adapter.name;
    datasetObj['organization'] = sessionStorage.getItem('organization');
    datasetObj['createdby'] = JSON.parse(
      sessionStorage.getItem('user')
    ).user_email;
    datasetObj['description'] = '';
    datasetObj['datasource'] = this.datasource;
    datasetObj['backingDataset'] = '';
    this.dataset = datasetObj;
  }

  getDatasetForEditMethod(spec: any) {
    try {
      if (this.adapterApispecTemplate.paths) {
        if (
          this.adapterApispecTemplate.paths[spec.path] &&
          this.adapterApispecTemplate.paths[spec.path][
          spec.requestType.toLowerCase()
          ]
        ) {
          let method =
            this.adapterApispecTemplate.paths[spec.path][
            spec.requestType.toLowerCase()
            ];
          if (method.dataset) {
            this.adapterServices.getDataset(method.dataset).subscribe((res) => {
              this.dataset = res;
              this.dataset.attributes = JSON.parse(this.dataset?.attributes);
              if (this.dataset.attributes.ScriptType === 'Python') {
                this.transformScriptPython = JSON.parse(
                  this.dataset.attributes.transformScriptTransformationScript
                );
              } else {
                this.transformScript = JSON.parse(
                  this.dataset.attributes.transformScriptTransformationScript
                );
              }
              this.dynamicImportsArray = this.dataset.attributes.imports;
              this.dynamicRequirementsArray =
                this.dataset.attributes.requirements;
              this.isRemoteExecution =
                this.dataset.attributes.isRemoteExecution;
              this.remoteExecutorURL =
                this.dataset.attributes.remoteExecutorURL;
              this.transformScriptData =
                this.dataset.attributes.transformScriptData;
              this.selectedConnection = this.datasourcesForConnection.filter(
                (datasource) =>
                  datasource.alias ===
                  this.dataset.attributes.remoteConnectionAlias
              )[0];
            });
          }
        }
      }
    } catch (Exception) {
      // this.messageService.error("Some error occured", "Error")
    }
  }

  getDataSource() {
    this.adapterServices
      .getDataSource(this.adapter.connectionid)
      .subscribe((resp) => {
        // console.log(resp);

        this.datasource = resp;
      });
  }

  closePopup() {
    this.dialogRef.close();
  }

  refreshSwagger() {
    this.closePopup();
    this.swaggerCustomComponent.ngOnInit();
  }

  next() {
    if (!this.proceedContentFlag) {
      this.proceedContent();
      this.proceedContentFlag = true;
    }
    this.proceed = true;
  }

  previous() {
    this.basicReqTab = 'queryParamsTab';
    this.proceed = false;
  }
  proceedContent() {
    try {
      if (this.formType === 'API' || !this.dataset.attributes['ScriptType']) {
        this.formType = 'API';
        this.paramsDynamic = { key: '', value: '' };
        this.dynamicParamsArray.push(this.paramsDynamic);

        this.headersDynamic = { key: '', value: '' };
        this.dynamicHeadersArray.push(this.headersDynamic);

        this.pathVariablesDynamic = { key: '', value: '' };
        this.dynamicPathVariablesArray.push(this.pathVariablesDynamic);

        this.configVariablesDynamic = { key: '', value: '' };
        this.dynamicConfigVariablesArray.push(this.configVariablesDynamic);

        this.urlEncodedDynamic = { key: '', value: '' };
        this.urlEncodedArray.push(this.urlEncodedDynamic);

        this.editorOptions.modes = ['text', 'tree', 'view'];
        this.editorOptions.mode = 'text';

        if (JSON.stringify(this.dataset.attributes) === JSON.stringify({})) {
          this.dynamicParamsArray = [];
          this.dynamicHeadersArray = [];
          this.dynamicPathVariablesArray = [];
          this.dynamicConfigVariablesArray = [];
          this.urlEncodedArray = [];
        } else {
          this.dynamicParamsArray = this.dataset.attributes.QueryParams;
          this.dynamicHeadersArray = this.dataset.attributes.Headers;
          this.dynamicPathVariablesArray =
            this.dataset.attributes.PathVariables;
          this.dynamicConfigVariablesArray =
            this.dataset.attributes.ConfigVariables;

          if (this.dataset.attributes.bodyOption == 'raw') {
            if (
              this.dataset.attributes.bodyType == 'JSON' ||
              this.dataset.attributes.bodyType == 'FILE'
            )
              this.schemaForm = JSON.parse(this.dataset.attributes.Body);
            else if (
              this.dataset.attributes.bodyType == 'Text' ||
              this.dataset.attributes.bodyType == 'XML'
            )
              this.body = this.dataset.attributes.Body;
          } else {
            let totalPairs = this.dataset.attributes.Body.split('&');
            totalPairs.forEach((element) => {
              let pair = element.split('=');
              this.urlEncodedArray.push({ key: pair[0], value: pair[1] });
            });
          }
          this.pretransformData = this.dataset.attributes.pretransformData;
          this.transformData = this.dataset.attributes.transformData;
        }

        this.getdatasetTypes();

        this.editorOptions.statusBar = true;
        this.editorOptions.enableSort = false;
        this.editorOptions.enableTransform = false;
        this.editorOptions.onChange = () => {
          if ((this.basicReqTab = 'bodyTab')) {
            this.schemaForm = this.formJsonEditor.get();
          }
        };
        if (this.dataset.attributes.bodyType)
          this.selectedOption = this.dataset.attributes.bodyType;
        else this.selectedOption = this.options[0].value;

        if (this.dataset.attributes.bodyOption)
          this.bodyOption = this.dataset.attributes.bodyOption;
      } else {
        this.methodType = false;
        this.formType = 'Script';
        this.schemaForm = JSON.parse(this.dataset.attributes.Body);
        this.editorOptions.modes = ['text', 'tree', 'view'];
        this.editorOptions.mode = 'text';
        this.editorOptions.statusBar = true;
        this.editorOptions.enableSort = false;
        this.editorOptions.enableTransform = false;
        this.editorOptions.onChange = () => {
          if ((this.basicReqTab = 'bodyTab')) {
            this.schemaForm = this.formJsonEditor.get();
          }
        };
        // this.formType = this.dataset.formType;

        if (JSON.stringify(this.data.attributes) === JSON.stringify({})) {
          this.dynamicImportsArray = [];
          this.dynamicRequirementsArray = [];
        } else {
          this.dynamicImportsArray = this.data.attributes.imports;
          this.dynamicRequirementsArray = this.data.attributes.requirements;
          this.transformScriptData =
            this.dataset.attributes.transformScriptData;
        }
        this.getscriptdatasetTypes();
        this.editorOptions.statusBar = true;
        this.editorOptions.enableSort = false;
        this.editorOptions.enableTransform = false;
        this.editorOptions.onChange = () => {
          if ((this.basicReqTab = 'bodyTab')) {
            this.schemaForm = this.formJsonEditor.get();
            // this.body = this.formJsonEditor.get();
          }
        };
        if (this.dataset.attributes.bodyType)
          this.selectedOption = this.dataset.attributes.bodyType;
        else this.selectedOption = this.options[0].value;

        if (this.dataset.attributes.bodyOption)
          this.bodyOption = this.dataset.attributes.bodyOption;
      }
    } catch (Exception) {
      // this.messageService.error("Some error occured", "Error")
    }
  }
  findalldatasourcesForConnection() {
    this.adapterServices.getDatasources().subscribe((res) => {
      this.datasourcesForConnection = res;
      this.remotePromise = Promise.resolve(true);
      this.datasourcesForConnection = this.datasourcesForConnection.filter(
        (datasource) =>
          (datasource.interfacetype == null ||
            datasource.interfacetype != 'adapter') &&
          datasource.organization == sessionStorage.getItem('organization') &&
          datasource.type == 'REMOTE'
      );
      this.datasourcesForConnection.forEach((datasource) => {
        this.connectionOptions.push(
          new OptionsDTO(
            datasource.type.concat('-' + datasource.alias),
            datasource.alias
          )
        );
      });
      // console.log(this.connectionOptions);
    });
  }
  connectionNameSelectChange(connectionNameSelectd: string) {
    // console.log(this.datasourcesForConnection);
    this.selectedConnection = this.datasourcesForConnection.filter(
      (datasource) => datasource.alias == connectionNameSelectd
    )[0];
    // console.log(this.selectedConnection);
    this.dataset.attributes.remoteConnectionAlias =
      this.selectedConnection?.alias;
    this.dataset.attributes.remoteConnectionName = this.selectedConnection?.name;
    if (this.isRemoteExecution === false) {
      this.dataset.attributes.remoteConnectionAlias = '';
      this.dataset.attributes.remoteConnectionName = '';
    }
  }
  getscriptdatasetTypes() {
    try {
      this.service.getDatasetJson().subscribe((resp) => {
        this.datasetTypes = resp;
        this.datasetTypes.forEach((dType) => {
          if (dType === 'SPLUNK') this.splunkTypes = dType[0]['splunkTypes'];
        });

        this.dataset.backingDataset =
          this.dataset.backingDataset && this.dataset.backingDataset !== null
            ? this.dataset.backingDataset
            : '';
        // this.backingDatasetCtrl.setValue(this.dataset.backingDataset.name);
        // this.setBackingDatasetInitialValue();

        if (this.dataset.datasource.type == 'SQL')
          this.sourceType = this.datasetTypes.filter(
            (row) => row.type.toLocaleLowerCase() === 'mssql'
          )[0];
        else if (this.dataset.datasource.type) {
          this.sourceType = this.datasetTypes.filter(
            (row) =>
              row.type.toLocaleLowerCase() ===
              this.dataset.datasource.type.toLocaleLowerCase()
          )[0];
        }

        if (
          this.dataset.attributes &&
          this.dataset.attributes.ScriptType == 'Python' &&
          this.dataset.attributes.transformScriptTransformationScript != ''
        )
          this.transformScriptPython = JSON.parse(
            this.dataset.attributes.transformScriptTransformationScript
          );
        this.transformScriptData = this.dataset.attributes?.transformScriptData;

        if (
          this.dataset.attributes &&
          this.dataset.attributes.transformScriptTransformationScript != ''
        )
          this.transformScript = JSON.parse(
            this.dataset.attributes.transformScriptTransformationScript
          );
        this.transformScriptData = this.dataset.attributes?.transformScriptData;
      });
    } catch (Exception) {
      // this.messageService.error("Some error occured", "Error");
    }
  }
  getdatasetTypes() {
    try {
      this.adapterServices.getDatasetJson().subscribe((resp) => {
        this.datasetTypes = resp;
        this.dataset.backingDataset =
          this.dataset.backingDataset && this.dataset.backingDataset !== null
            ? this.dataset.backingDataset
            : '';
        if (this.connectionType) {
          this.sourceType = this.datasetTypes.filter(
            (row) =>
              row.type.toLocaleLowerCase() ===
              this.connectionType.toLocaleLowerCase()
          )[0];
        }

        if (
          this.dataset.attributes &&
          this.dataset.attributes.TransformationScript != ''
        )
          this.script = JSON.parse(
            this.dataset.attributes.TransformationScript
          );
        this.transformData = this.dataset.attributes?.transformData;

        if (
          this.dataset.attributes &&
          this.dataset.attributes.preTransformationScript &&
          this.dataset.attributes.preTransformationScript != ''
        )
          this.prescript = JSON.parse(
            this.dataset.attributes.preTransformationScript
          );
        this.pretransformData = this.dataset.attributes?.pretransformData;
      });
    } catch (Exception) {
      //this.messageService.error("Some error occured", "Error");
    }
  }
  basicReqTabScriptTypeChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = 'queryParamsTab';
        break;
      case 1:
        this.basicReqTab = 'headersTab';
        break;
      case 2:
        this.basicReqTab = 'pathVariablesTab';
        break;
      case 3:
        this.basicReqTab = 'configVariablesTab';
        break;
      case 4:
        this.basicReqTab = 'bodyTab';
        break;
    }
  }
  basicReqTabChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = 'queryParamsTab';
        break;
      case 1:
        this.basicReqTab = 'headersTab';
        break;
      case 2:
        this.basicReqTab = 'preTransformScriptTab';
        break;
      case 3:
        this.basicReqTab = 'postTransformScriptTab';
        break;
      case 4:
        this.basicReqTab = 'pathVariablesTab';
        break;
      case 5:
        this.basicReqTab = 'configVariablesTab';
        break;
      case 6:
        this.basicReqTab = 'bodyTab';
        break;
    }
  }

  addParamsRow() {
    if (!this.dynamicParamsArray || this.dynamicParamsArray.length == 0) {
      this.dynamicParamsArray = [];
    }
    this.paramsDynamic = { key: '', value: '' };
    this.dynamicParamsArray.push(this.paramsDynamic);
    this.dataset.attributes['QueryParams'] = this.dynamicParamsArray;
    return true;
  }

  deleteParamsRow(index) {
    this.dynamicParamsArray.splice(index, 1);
    this.dataset.attributes['QueryParams'] = this.dynamicParamsArray;
    return true;
  }

  addHeadersRow() {
    if (this.dynamicHeadersArray.length == 0) {
      this.dynamicHeadersArray = [];
    }
    this.headersDynamic = { key: '', value: '' };
    this.dynamicHeadersArray.push(this.headersDynamic);
    this.dataset.attributes['Headers'] = this.dynamicHeadersArray;
    return true;
  }

  deleteHeadersRow(index) {
    this.dynamicHeadersArray.splice(index, 1);
    this.dataset.attributes['Headers'] = this.dynamicHeadersArray;
    return true;
  }

  addPathVariablesRow() {
    if (!this.dynamicPathVariablesArray) {
      this.dynamicPathVariablesArray = [];
    }
    this.pathVariablesDynamic = { key: '', value: '' };
    this.dynamicPathVariablesArray.push(this.pathVariablesDynamic);
    this.dataset.attributes['PathVariables'] = this.dynamicPathVariablesArray;
    return true;
  }

  deletePathVariablesRow(index) {
    this.dynamicPathVariablesArray.splice(index, 1);
    this.dataset.attributes['PathVariables'] = this.dynamicPathVariablesArray;
    return true;
  }

  addConfigVariablesRow() {
    if (!this.dynamicConfigVariablesArray) {
      this.dynamicConfigVariablesArray = [];
    }
    this.configVariablesDynamic = { key: '', value: '' };
    this.dynamicConfigVariablesArray.push(this.configVariablesDynamic);
    this.dataset.attributes['ConfigVariables'] =
      this.dynamicConfigVariablesArray;
    return true;
  }

  deleteConfigVariablesRow(index) {
    this.dynamicConfigVariablesArray.splice(index, 1);
    this.dataset.attributes['ConfigVariables'] =
      this.dynamicConfigVariablesArray;
    return true;
  }

  presetValue(event) {
    this.pretransformData = event.checked;
  }

  setValue(event) {
    this.transformData = event.checked;
  }

  optionChange(event) {
    this.selectedOption = event.value;
    if (this.selectedOption == 'FILE')
      this.dataset.attributes.bodyType = 'FILE';
    this.addHeaderRowBasedOnType(this.selectedOption);
  }

  addUrlEncodedRow() {
    if (this.urlEncodedArray.length == 0) {
      this.urlEncodedArray = [];
    }
    this.urlEncodedDynamic = { key: '', value: '' };
    this.urlEncodedArray.push(this.urlEncodedDynamic);
    this.testDataset.attributes['Body'] = this.urlEncodedArray;
    return true;
  }

  deleteUrlEncodedRow(index) {
    if (this.urlEncodedArray.length == 1) {
      return false;
    } else {
      this.urlEncodedArray.splice(index, 1);
      this.testDataset.attributes['Body'] = this.urlEncodedArray;
      return true;
    }
  }

  addHeaderRowBasedOnType(type: string) {
    if (!this.dynamicHeadersArray) {
      this.dynamicHeadersArray = [];
    }

    if (type === 'FILE') {
      const index = this.dynamicHeadersArray.findIndex(
        (header) => header.key.toLowerCase() === 'content-type'
      );
      if (index !== -1) {
        this.dynamicHeadersArray.splice(index, 1);
      }
      return;
    }

    const contentTypeMap = {
      'x-www-form-urlencoded': 'application/x-www-form-urlencoded',
      JSON: 'application/json',
      XML: 'application/xml',
      Text: 'text/plain',
    };
    const contentTypeValue = contentTypeMap[type];
    if (!contentTypeValue) {
      return;
    }
    const existingHeader = this.dynamicHeadersArray.find(
      (header) => header.key.toLowerCase() === 'content-type'
    );
    if (existingHeader) {
      existingHeader.value = contentTypeValue;
    } else {
      this.dynamicHeadersArray.push({
        key: 'Content-Type',
        value: contentTypeValue,
      });
    }
  }

  testConnection() {
    this.dataset.backingDataset = null;
    this.dataset.taskdetails = null;
    if (this.formType == 'API' || !this.dataset.attributes['ScriptType']) {
      if (this.bodyOption == 'raw') {
        if (this.selectedOption == 'JSON' || this.selectedOption == 'FILE')
          this.dataset.attributes.Body = JSON.stringify(this.schemaForm);
        else if (this.selectedOption == 'Text' || this.selectedOption == 'XML')
          this.dataset.attributes.Body = this.body;
      } else {
        this.dataset.attributes.Body = this.parseUrlEncoded(
          this.urlEncodedArray
        );
      }

      this.dataset.attributes.pretransformData = this.pretransformData;
      this.dataset.attributes.transformData = this.transformData;
      this.dataset.datasource = this.datasource;

      this.adapterServices.testConnection(this.dataset).subscribe(
        (response) => {
          this.adapterServices.messageNotificaionService(
            'success',
            'Tested!  Connected Successfully'
          );
        },
        (error) => {
          this.adapterServices.messageNotificaionService(
            'warning',
            'Tested!  FAILED'
          );
        }
      );
    } else {
      if (this.bodyOption == 'raw') {
        if (this.selectedOption == 'JSON')
          this.dataset.attributes.Body = JSON.stringify(this.schemaForm);
        else if (this.selectedOption == 'Text')
          this.dataset.attributes.Body = this.body;
      } else {
        this.dataset.attributes.Body = this.parseUrlEncoded(
          this.urlEncodedArray
        );
      }
      this.dataset.attributes.transformScriptData = this.transformScriptData;
      this.dataset.datasource = this.datasource;

      this.adapterServices.testConnection(this.dataset).subscribe(
        (response) => {
          this.adapterServices.messageNotificaionService(
            'success',
            'Tested!  Connected Successfully'
          );
        },
        (error) => {
          this.adapterServices.messageNotificaionService(
            'warning',
            'Tested!  FAILED'
          );
        }
      );
    }
  }

  saveDataset() {
    this.dataset.backingDataset = null;
    this.dataset.taskdetails = null;
    if (this.formType == 'API' || !this.dataset.attributes['ScriptType']) {
      if (this.bodyOption == 'raw') {
        this.dataset.attributes.bodyOption = 'raw';
        if (this.selectedOption == 'JSON') {
          this.dataset.attributes.bodyType = 'JSON';
          this.dataset.attributes.Body = JSON.stringify(this.schemaForm);
        } else if (this.selectedOption == 'Text') {
          this.dataset.attributes.bodyType = 'Text';
          this.dataset.attributes.Body = this.body;
        } else if (this.selectedOption == 'FILE') {
          this.dataset.attributes.bodyType = 'FILE';
          this.dataset.attributes.Body = JSON.stringify(this.schemaForm);
        } else if (this.selectedOption == 'XML') {
          this.dataset.attributes.bodyType = 'XML';
          this.dataset.attributes.Body = this.body;
        }
      } else {
        this.dataset.attributes.bodyOption = 'x-www-form-urlencoded';
        this.dataset.attributes.Body = this.parseUrlEncoded(
          this.urlEncodedArray
        );
      }

      this.dataset.attributes.pretransformData = this.pretransformData;

      var prescript1 = JSON.stringify(this.prescript)
        .replace(/\s/g, '')
        .replace(/[,]["]["]/g, '');
      var prescript2 = JSON.stringify(this.prescript_cpy)
        .replace(/\s/g, '')
        .replace(/[,]["]["]/g, '');

      if (prescript1 != prescript2)
        this.dataset.attributes.preTransformationScript = JSON.stringify(
          this.prescript
        );
      else this.dataset.attributes.preTransformationScript = '';

      this.dataset.attributes.transformData = this.transformData;

      var script1 = JSON.stringify(this.script)
        .replace(/\s/g, '')
        .replace(/[,]["]["]/g, '');
      var script2 = JSON.stringify(this.script_cpy)
        .replace(/\s/g, '')
        .replace(/[,]["]["]/g, '');

      if (script1 != script2)
        this.dataset.attributes.TransformationScript = JSON.stringify(
          this.script
        );
      else this.dataset.attributes.TransformationScript = '';

      this.dataset.expStatus = 0;
      this.dataset['groups'] = [];
      this.dataset['interfacetype'] = 'adapter';
      this.dataset['tags'] = '"';
      this.dataset['views'] = '""';
      this.dataset['isadapteractive'] = 'Y';
      this.dataset.datasource = this.datasource;
      // console.log(this.dataset);
      if (this.action == 'create') {
        // console.log(this.dataset);
        this.adapterServices.createDataset(this.dataset).subscribe(
          (response) => {
            this.service.messageService(
              response,
              'Done!  Method Added Successfully'
            );
            this.returnedName = response.body.name;
            this.modifyAPISpec(
              this.dataset,
              this.returnedName,
              this.data.path,
              this.data.parameters
            );
          },
          (error) => {
            //this.messageService.error('Error!', error);
          }
        );
      }

      if (this.action == 'edit') {
        // console.log(this.dataset);
        this.adapterServices.saveDataset(this.dataset).subscribe(
          (response) => {
            this.returnedName = response.name;
            this.modifyAPISpec(
              this.dataset,
              this.returnedName,
              this.data.path,
              this.data.parameters
            );
          },
          (error) => {
            //this.messageService.error('Error!', error);
          }
        );
      }
    } else {
      this.dataset.attributes.bodyType = 'JSON';
      this.dataset.attributes.Body = JSON.stringify(this.schemaForm);
      this.dataset.attributes.transformScriptData = this.transformScriptData;
      if (this.dataset.attributes.ScriptType == 'Python') {
        this.dataset.attributes.remoteExecutorURL = this.remoteExecutorURL;
        var transformScriptPython1 = JSON.stringify(this.transformScriptPython)
          .replace(/\s/g, '')
          .replace(/[,]["]["]/g, '');
        var transformScriptPython2 = JSON.stringify(
          this.transformScriptPython_cpy
        )
          .replace(/\s/g, '')
          .replace(/[,]["]["]/g, '');

        if (transformScriptPython1 != transformScriptPython2)
          this.dataset.attributes.transformScriptTransformationScript =
            JSON.stringify(this.transformScriptPython);
        else this.dataset.attributes.transformScriptTransformationScript = '';
        // console.log(this.dataset.attributes);
      }
      if (this.dataset.attributes.ScriptType == 'Groovy') {
        var transformScript1 = JSON.stringify(this.transformScript)
          .replace(/\s/g, '')
          .replace(/[,]["]["]/g, '');
        var transformScript2 = JSON.stringify(this.transformScript_cpy)
          .replace(/\s/g, '')
          .replace(/[,]["]["]/g, '');

        if (transformScript1 != transformScript2)
          this.dataset.attributes.transformScriptTransformationScript =
            JSON.stringify(this.transformScript);
        else this.dataset.attributes.transformScriptTransformationScript = '';
      }
      // console.log(this.datasource);
      // console.log(this.dataset.attributes);
      this.dataset['datasource'] = this.datasource;
      this.dataset.expStatus = 0;
      this.dataset['groups'] = [];
      this.dataset['interfacetype'] = 'adapter';
      this.dataset['tags'] = '"';
      this.dataset['views'] = '""';
      this.dataset['isadapteractive'] = 'Y';
      if (this.action == 'create') {
        this.adapterServices.createDataset(this.dataset).subscribe(
          (response) => {
            this.service.messageService(
              response,
              'Done!  Method Added Successfully'
            );
            this.returnedName = response.body.name;
            this.modifyAPISpec(
              this.dataset,
              this.returnedName,
              this.data.path,
              this.data.parameters
            );
          },
          (error) => {
            //this.messageService.error('Error!', error);
          }
        );
      }

      if (this.action == 'edit') {
        this.adapterServices.saveDataset(this.dataset).subscribe(
          (response) => {
            this.returnedName = response.name;
            this.modifyAPISpec(
              this.dataset,
              this.returnedName,
              this.data.path,
              this.data.parameters
            );
          },
          (error) => {
            //this.messageService.error('Error!', error);
          }
        );
      }
    }
  }

  transformScriptsetValue(event) {
    this.transformScriptData = event.checked;
  }

  remoteExecutorsetValue(event) {
    this.isRemoteExecution = event.checked;
    this.dataset.attributes.isRemoteExecution = this.isRemoteExecution;
    if (this.isRemoteExecution === false) {
      this.dynamicRequirementsArray = [];
      this.dynamicImportsArray = [];
    }
  }

  modifyAPISpec(dataset, name, pathUrlWithOrg, specParams) {
    let pathUrl = pathUrlWithOrg;
    pathUrl = pathUrl.replace(sessionStorage.getItem('organization'), '{org}');
    let attributes = dataset.attributes;
    let parameters = [];
    attributes.QueryParams?.forEach((param) => {
      let params = {};
      params['name'] = param.key;
      params['value'] = param.value;
      params['description'] = param.key;
      params['required'] = 'true';
      params['type'] = 'string';
      params['in'] = 'params';
      parameters.push(params);
    });
    attributes.Headers?.forEach((param) => {
      let params = {};
      params['name'] = param.key;
      params['value'] = param.value;
      params['description'] = param.key;
      params['required'] = 'true';
      params['type'] = 'string';
      params['in'] = 'header';
      parameters.push(params);
    });

    if (attributes.Body && attributes.RequestMethod.toLowerCase() != 'get')
      this.swaggerapispec.addRequestBody(attributes.Body);
    if (attributes.bodyType == 'FILE')
      this.swaggerapispec.changeType('multipart/form-data');
    else this.swaggerapispec.changeType('application/json');
    this.swaggerapispec.addTitle(this.adapter.name);
    this.swaggerapispec.addVersion(1);
    this.swaggerapispec.addDescription(dataset.description);
    this.swaggerapispec.addDatasetAndParams(name, specParams);
    if (this.apiSpecServerUrl && this.apiSpecServerUrl.includes('api')) {
      const path = this.apiSpecServerUrl
        .replaceAll(this.adapter.name, '{spec}')
        .replaceAll(sessionStorage.getItem('organization'), '{org}')
        .replaceAll(window.location.origin, '{host}');
      this.swaggerapispec.addUrl(path);
    } else this.swaggerapispec.addUrl(window.location.origin);
    this.swaggerapispec.addRequestMethod(
      dataset.attributes.RequestMethod.toLowerCase()
    );

    this.swaggerapispec.addUrlPath(pathUrl);
    let apispec;
    if (this.adapter.apispec != '{}') {
      apispec = JSON.parse(this.adapter.apispec);
      let path = JSON.parse(this.swaggerapispec.getAPIPath());
      if (apispec.paths[pathUrl])
        apispec.paths[pathUrl][attributes.RequestMethod.toLowerCase()] =
          path[pathUrl][attributes.RequestMethod.toLowerCase()];
      else {
        apispec.paths[pathUrl] = path[pathUrl];
        apispec.paths[pathUrl][attributes.RequestMethod.toLowerCase()] =
          path[pathUrl][attributes.RequestMethod.toLowerCase()];
      }
    } else {
      let spec = this.swaggerapispec.getAPISpec(true);
      apispec = JSON.parse(spec);
    }
    this.adapter.apispec = JSON.stringify(apispec);
    this.adapterServices.updateAdapterAPISpec(this.adapter).subscribe((res) => {
      this.refreshSwagger();
    });
  }

  parseUrlEncoded(urlEncodedArray) {
    let s: String = '';
    let mod_s: String = '';
    urlEncodedArray.forEach((element) => {
      if (element.key != '' && element.value != '')
        s += element.key + '=' + element.value + '&';
    });
    if (s.endsWith('&')) {
      mod_s = s.substr(0, s.length - 1);
    }
    return mod_s;
  }

  transformScriptbasicReqTabChange(index) {
    switch (index) {
      case 0:
        this.transformScriptbasicReqTab = 'queryParamsTab';
        break;
      case 1:
        this.transformScriptbasicReqTab = 'headersTab';
        break;
      // case 2:
      //   this.transformScriptbasicReqTab = "transformScriptTab";
      //   break;
      case 2:
        this.transformScriptbasicReqTab = 'pathVariablesTab';
        break;
      // case 4:
      //   this.transformScriptbasicReqTab = "configVariablesTab";
      //   break;
      case 3:
        this.transformScriptbasicReqTab = 'bodyTab';
        break;
    }
  }

  addImortsRow() {
    if (!this.dynamicImportsArray) {
      this.dynamicImportsArray = [];
    }
    this.importsDynamic = { key: '' };
    this.dynamicImportsArray.push(this.importsDynamic);
    this.dataset.attributes['imports'] = this.dynamicImportsArray;
    return true;
  }

  deleteImportsRow(index) {
    // if (this.dynamicImportsArray.length == 1) {
    //   return false;
    // } else {
    this.dynamicImportsArray.splice(index, 1);
    this.dataset.attributes['imports'] = this.dynamicImportsArray;
    return true;
    // }
  }

  addRequirementsRow() {
    if (!this.dynamicRequirementsArray) {
      this.dynamicRequirementsArray = [];
    }
    this.requirementsDynamic = { key: '' };
    this.dynamicRequirementsArray.push(this.requirementsDynamic);
    this.dataset.attributes['requirements'] = this.dynamicRequirementsArray;
    return true;
  }

  deleteRequirementsRow(index) {
    // if (this.dynamicRequirementsArray.length == 1) {
    //   return false;
    // } else {
    this.dynamicRequirementsArray.splice(index, 1);
    this.dataset.attributes['requirements'] = this.dynamicRequirementsArray;
    return true;
    // }
  }

  handleFileInput(files: any) {
    this.selectedFile = files.target.files[0];
    this.formData = new FormData();
    this.formData.append('file', this.selectedFile);
    this.fileName = this.selectedFile.name;
    this.adapterServices
      .uploadFileToServerForAdapterMethod(
        this.formData,
        this.dataset.adaptername,
        this.dataset.alias
      )
      .subscribe((res) => {
        if (res.body) {
          this.schemaForm = res.body;
          if (this.schemaForm) this.schemaForm['isForTest'] = true;
        }
      });
  }
}

export class DynamicParamsGrid {
  key: string;
  value: string;
}
