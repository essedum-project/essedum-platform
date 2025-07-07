import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { DatasetServices } from '../dataset-service';

@Component({
  selector: 'app-rest-dataset-config',
  templateUrl: './rest-dataset-config.component.html',
  styleUrls: ['./rest-dataset-config.component.scss']
})
export class RestDatasetConfigComponent implements OnInit {
  @ViewChild('columnJsonEditor', { static: false }) columnJsonEditor: JsonEditorComponent;
  @ViewChild('formJsonEditor', { static: false }) formJsonEditor: JsonEditorComponent;

  @Input('dataset') dataset;
  @Input() copyDataset: boolean;
  @Input('isInEdit') isInEdit;
  @Output('action') action = new EventEmitter();
  @Output('cache') cache = new EventEmitter();

  @Output('extractSchema') schemaExtractor = new EventEmitter();
  connectionDetails = {};
  connectionType: string = "";

  tab: any = "connectionTab";
  requestMethods = [{ viewValue: 'GET', value: 'GET' },
  { viewValue: 'POST', value: 'POST' },
  { viewValue: 'PUT', value: 'PUT' },
  { viewValue: 'DELETE', value: 'DELETE' }];
  connectionTypes = ["ApiRequest"];
  testDataset: any = { attributes: {} };
  basicReqTab: any = "queryParamsTab";
  transformScriptbasicReqTab: any = "transformScriptTab"
  datasetTypes = [];
  splunkTypes = [];
  sourceType: any = {};
  prescriptShow = false;
  prescript = 'import groovy.json.*\n\ndef inpBody = \"$Body\"\ndef inpQueryParams = \"$QueryParams\"\ndef inpHeaders = \"$Headers\"\ndef inpbodyType = \"$bodyType\"\ndef inpPathVariables = \"$PathVariables\"\ndef inpUrl = \"$Url\"\ndef inpConfigVariables = \"$ConfigVariables\"\n\n//start your code from here\n\nreturn JsonOutput.prettyPrint(JsonOutput.toJson([Body:{preprocessed_Body}, QueryParams:{preprocessed_QueryParams},Headers:{preprocessed_Headers},bodyType:{preprocessed_bodyType},PathVariables:{preprocessed_PathVariables},Url:{preprocessed_Url},ConfigVariables:{preprocessed_ConfigVariables}]))\n';
  prescript_cpy = [];
  scriptShow = false;
  script = 'import groovy.json.*\n\ndef inpResponse = \"$inputJson\"\n//start your code from here\n';
  script_cpy = [];
  transformScriptShow = false;
  transformScript = 'import groovy.json.*\n\ndef inpBody = \"$Body\"\ndef inpQueryParams = \"$QueryParams\"\ndef inpHeaders = \"$Headers\"\ndef inpbodyType = \"$bodyType\"\ndef inpPathVariables = \"$PathVariables\"\ndef inpUrl = \"$Url\"\n\ndef inpConfigVariables = \"$ConfigVariables\"\n//start your code from here\n\n\nreturn JsonOutput.prettyPrint(JsonOutput.toJson([Body:{preprocessed_Body}, QueryParams:{preprocessed_QueryParams},Headers:{preprocessed_Headers},bodyType:{preprocessed_bodyType},PathVariables:{preprocessed_PathVariables},Url:{preprocessed_Url},ConfigVariables:{preprocessed_ConfigVariables}]))\n';
  transformScript_cpy = [];
  isCacheable: any = false;
  keys: any = [];
  dynamicParamsArray: Array<DynamicParamsGrid> = [];
  paramsDynamic: any = {};
  dynamicHeadersArray: Array<DynamicParamsGrid> = [];
  dynamicPathVariablesArray: Array<DynamicParamsGrid> = [];
  dynamicConfigVariablesArray: Array<DynamicParamsGrid> = [];
  headersDynamic: any = {};
  pathVariablesDynamic: any = {};
  configVariablesDynamic: any = {};
  bodyOption: string;
  urlEncodedArray: Array<DynamicParamsGrid> = [];
  urlEncodedDynamic: any = {};
  editorOptions = new JsonEditorOptions();
  schemaForm: any = {};
  isRestDataset: boolean = true;

  options: any;
  selectedOption: any;
  body: any = "";
  pretransformData: boolean = false;
  transformData: boolean = false;
  transformScriptData: boolean = false;
  messageService: any;
  scriptType = ["Groovy"];
  scriptTypeOpt = [{ viewValue: 'Groovy', value: 'Groovy' }]
  formType = 'API';
  gitDataSource: boolean = true;
  datasourceType: any;


  constructor(private datasetsService: DatasetServices
  ) { }

  ngOnInit() {

    this.datasourceType = this.dataset['datasource'].type
    if (this.datasourceType == 'GIT') {
      this.gitDataSource = false;
    }
    else {
      this.gitDataSource = true;
    }

    try {
      if (this.dataset.attributes["ScriptType"]) {
        this.formType = 'Script';
        this.configVariablesDynamic = { key: "", value: "" };
        this.dynamicConfigVariablesArray.push(this.configVariablesDynamic);

        this.connectionDetails = JSON.parse(this.dataset.datasource.connectionDetails);
        this.connectionType = this.connectionDetails['ConnectionType'];
        this.testDataset = this.connectionDetails['testDataset'];

        if (JSON.stringify(this.dataset.attributes) === JSON.stringify({})) {
          this.dynamicConfigVariablesArray = [];
        }
        else {
          this.dynamicConfigVariablesArray = this.dataset.attributes.ConfigVariables;
          this.transformScriptData = this.dataset.attributes.transformScriptData;
        }
        this.getscriptdatasetTypes();

      } else {
        this.paramsDynamic = { key: "", value: "" };
        this.dynamicParamsArray.push(this.paramsDynamic);

        this.headersDynamic = { key: "", value: "" };
        this.dynamicHeadersArray.push(this.headersDynamic);

        this.pathVariablesDynamic = { key: "", value: "" };
        this.dynamicPathVariablesArray.push(this.pathVariablesDynamic);

        this.configVariablesDynamic = { key: "", value: "" };
        this.dynamicConfigVariablesArray.push(this.configVariablesDynamic);

        this.urlEncodedDynamic = { key: "", value: "" };
        this.urlEncodedArray.push(this.urlEncodedDynamic);

        this.editorOptions.modes = ['text', 'tree', 'view'];
        this.editorOptions.mode = "text";

        this.connectionDetails = JSON.parse(this.dataset.datasource.connectionDetails);
        this.connectionType = this.connectionDetails['ConnectionType'];
        this.testDataset = this.connectionDetails['testDataset'];

        if (JSON.stringify(this.dataset.attributes) === JSON.stringify({})) {
          this.dynamicParamsArray = [];
          this.dynamicHeadersArray = [];
          this.dynamicPathVariablesArray = [];
          this.dynamicConfigVariablesArray = [];
          this.urlEncodedArray = [];
        }
        else {
          this.dynamicParamsArray = this.dataset.attributes.QueryParams;
          this.dynamicHeadersArray = this.dataset.attributes.Headers;
          this.dynamicPathVariablesArray = this.dataset.attributes.LeapParams;
          this.dynamicConfigVariablesArray = this.dataset.attributes.ConfigVariables;

          if (this.dataset.attributes.bodyOption == "raw") {
            if (this.dataset.attributes.bodyType == "JSON")
              this.schemaForm = JSON.parse(this.dataset.attributes.Body);
            else if (this.dataset.attributes.bodyType == "Text")
              this.body = this.dataset.attributes.Body;
          }
          else {
            let totalPairs = this.dataset.attributes.Body.split("&");
            totalPairs.forEach(element => {
              let pair = element.split("=");
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
          if (this.basicReqTab = "bodyTab") {
            this.schemaForm = this.formJsonEditor.get();
          }
        }

        this.options = [
          { viewValue: "Text", value: "Text" },
          { viewValue: "JSON", value: "JSON" },
          { viewValue: "XML", value: "XML" }
        ];

        if (this.dataset.attributes.bodyType)
          this.selectedOption = this.dataset.attributes.bodyType;
        else
          this.selectedOption = this.options[0].value;

        if (this.dataset.attributes.bodyOption)
          this.bodyOption = this.dataset.attributes.bodyOption;
      }

    }
    catch (Exception) {
    }


  }

  getscriptdatasetTypes() {
    try {
      this.datasetsService.getDatasetJson()
        .subscribe(resp => {

          this.datasetTypes = resp;
          this.datasetTypes.forEach(dType => {
            if (dType === 'SPLUNK')
              this.splunkTypes = dType[0]['splunkTypes'];
          });

          this.dataset.backingDataset = this.dataset.backingDataset &&
            this.dataset.backingDataset !== null ? this.dataset.backingDataset : '';
        

          if (this.dataset.datasource.type == "SQL")
            this.sourceType = this.datasetTypes.filter(row => row.type.toLocaleLowerCase() === 'mssql')[0];
          else if (this.dataset.datasource.type) {
            this.sourceType = this.datasetTypes.filter(row =>
              row.type.toLocaleLowerCase() === this.dataset.datasource.type.toLocaleLowerCase())[0];
          }

          if (this.dataset.attributes && this.dataset.attributes.transformScriptTransformationScript != "")
            this.transformScript = JSON.parse(this.dataset.attributes.transformScriptTransformationScript);
          this.transformScriptData = this.dataset.attributes?.transformScriptData;

        });
    }
    catch (Exception) {
      this.messageService.error("Some error occured", "Error")
    }
  }

  getdatasetTypes() {
    try {
      this.datasetsService.getDatasetJson()
        .subscribe(resp => {

          this.datasetTypes = resp;
          this.datasetTypes.forEach(dType => {
            if (dType === 'SPLUNK')
              this.splunkTypes = dType[0]['splunkTypes'];
          });

          this.dataset.backingDataset = this.dataset.backingDataset &&
            this.dataset.backingDataset !== null ? this.dataset.backingDataset : '';
     

          if (this.dataset.datasource.type == "SQL")
            this.sourceType = this.datasetTypes.filter(row => row.type.toLocaleLowerCase() === 'mssql')[0];
          else if (this.dataset.datasource.type) {
            this.sourceType = this.datasetTypes.filter(row =>
              row.type.toLocaleLowerCase() === this.dataset.datasource.type.toLocaleLowerCase())[0];
          }

          if (this.dataset.attributes && this.dataset.attributes.TransformationScript != "")
            this.script = JSON.parse(this.dataset.attributes.TransformationScript);
          this.transformData = this.dataset.attributes?.transformData;

          if (this.dataset.attributes && this.dataset.attributes.preTransformationScript != "")
            this.prescript = JSON.parse(this.dataset.attributes.preTransformationScript);
          this.pretransformData = this.dataset.attributes?.pretransformData;

        });
    }
    catch (Exception) {
      this.messageService.error("Some error occured", "Error")
    }
  }

  tabChange(index) {
    switch (index) {
      case 0:
        this.tab = "connectionTab";
        break;
    }
  }
  basicReqTabChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = "queryParamsTab";
        break;
      case 1:
        this.basicReqTab = "headersTab";
        break;
      case 2:
        this.basicReqTab = "preTransformScriptTab";
        break;
      case 3:
        this.basicReqTab = "postTransformScriptTab";
        break;
      case 4:
        this.basicReqTab = "pathVariablesTab";
        break;
      case 5:
        this.basicReqTab = "configVariablesTab";
        break;
      case 6:
        this.basicReqTab = "bodyTab";
        break;
    }

  }

  transformScriptbasicReqTabChange(index) {
    switch (index) {
      case 0:
        this.transformScriptbasicReqTab = "transformScriptTab";
        break;
      case 1:
        this.transformScriptbasicReqTab = "configVariablesTab";
        break;
    }

  }

  addParamsRow() {
    if (!this.dynamicParamsArray || this.dynamicParamsArray.length == 0) {
      this.dynamicParamsArray = [];
    }
    this.paramsDynamic = { key: "", value: "" };
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
    this.headersDynamic = { key: "", value: "" };
    this.dynamicHeadersArray.push(this.headersDynamic);
    this.dataset.attributes['Headers'] = this.dynamicHeadersArray;
    return true;
  }

  addPathVariablesRow() {
    if (!this.dynamicPathVariablesArray) {
      this.dynamicPathVariablesArray = [];
    }
    this.pathVariablesDynamic = { key: "", value: "" };
    this.dynamicPathVariablesArray.push(this.pathVariablesDynamic);
    this.dataset.attributes['PathVariables'] = this.dynamicPathVariablesArray;
    return true;
  }
  addConfigVariablesRow() {
    if (!this.dynamicConfigVariablesArray) {
      this.dynamicConfigVariablesArray = [];
    }
    this.configVariablesDynamic = { key: "", value: "" };
    this.dynamicConfigVariablesArray.push(this.configVariablesDynamic);
    this.dataset.attributes['ConfigVariables'] = this.dynamicConfigVariablesArray;
    return true;
  }
  deleteConfigVariablesRow(index) {

    this.dynamicConfigVariablesArray.splice(index, 1);
    this.dataset.attributes['ConfigVariables'] = this.dynamicConfigVariablesArray;
    return true;
    //}
  }
  deleteHeadersRow(index) {
   
    this.dynamicHeadersArray.splice(index, 1);
  }
  deletePathVariablesRow(index) {

    this.dynamicPathVariablesArray.splice(index, 1);
    this.dataset.attributes['PathVariables'] = this.dynamicPathVariablesArray;
    return true;
    
  }

  addUrlEncodedRow() {
    if (this.urlEncodedArray.length == 0) {
      this.urlEncodedArray = [];
    }
    this.urlEncodedDynamic = { key: "", value: "" };
    this.urlEncodedArray.push(this.urlEncodedDynamic);
 
    this.dataset.attributes['Body'] = this.urlEncodedArray;
    return true;
  }

  deleteUrlEncodedRow(index) {
    if (this.urlEncodedArray.length == 1) {
      return false;
    } else {
      this.urlEncodedArray.splice(index, 1);
      this.dataset.attributes['Body'] = this.urlEncodedArray;
      return true;
    }

  }

  parseUrlEncoded(urlEncodedArray) {

    let s: String = "";
    let mod_s: String = "";
    urlEncodedArray.forEach(element => {
      if (element.key != "" && element.value != "")
        s += element.key + "=" + element.value + "&"
    });

    if (s.endsWith("&")) {
      mod_s = s.substr(0, s.length - 1);
    }


    return mod_s;

  }

  saveDataset() {
    try {
      if (this.dataset.attributes["ScriptType"]) {
        this.dataset.attributes.transformScriptData = this.transformScriptData;
        this.dataset.views = null;
        var transformScript1 = JSON.stringify(this.transformScript).replace(/\s/g, "").replace(/[,]["]["]/g, "");
        var transformScript2 = JSON.stringify(this.transformScript_cpy).replace(/\s/g, "").replace(/[,]["]["]/g, "");

        if (transformScript1 != transformScript2)
          this.dataset.attributes.transformScriptTransformationScript = JSON.stringify(this.transformScript);
        else
          this.dataset.attributes.transformScriptTransformationScript = "";

        this.action.emit('save');
      } else {
        if (this.bodyOption == "raw") {
          this.dataset.attributes.bodyOption = "raw";
          if (this.selectedOption == 'JSON') {
            this.dataset.attributes.bodyType = "JSON";
            this.dataset.attributes.Body = JSON.stringify(this.schemaForm);
          }
          else if (this.selectedOption == 'Text') {
            this.dataset.attributes.bodyType = "Text";
            this.dataset.attributes.Body = this.body;
          }
        }
        else {
          this.dataset.attributes.bodyOption = "x-www-form-urlencoded";
          this.dataset.attributes.Body = this.parseUrlEncoded(this.urlEncodedArray);
        }


        this.dataset.attributes.pretransformData = this.pretransformData;

        var prescript1 = JSON.stringify(this.prescript).replace(/\s/g, "").replace(/[,]["]["]/g, "");
        var prescript2 = JSON.stringify(this.prescript_cpy).replace(/\s/g, "").replace(/[,]["]["]/g, "");

        if (prescript1 != prescript2)
          this.dataset.attributes.preTransformationScript = JSON.stringify(this.prescript);
        else
          this.dataset.attributes.preTransformationScript = "";

        this.dataset.attributes.transformData = this.transformData;

        var script1 = JSON.stringify(this.script).replace(/\s/g, "").replace(/[,]["]["]/g, "");
        var script2 = JSON.stringify(this.script_cpy).replace(/\s/g, "").replace(/[,]["]["]/g, "");

        if (script1 != script2)
          this.dataset.attributes.TransformationScript = JSON.stringify(this.script);
        else
          this.dataset.attributes.TransformationScript = "";

        this.action.emit('save');
      }
    }
    catch (Exception) {
      this.messageService.error("Some error occured", "Error")
    }


  }

  testConnection() {
    try {
      if (this.dataset.attributes["ScriptType"]) {
        this.dataset.attributes.transformScriptData = this.transformScriptData;

        this.action.emit('test');

      } else {
        if (this.bodyOption == "raw") {
          if (this.selectedOption == 'JSON')
            this.dataset.attributes.Body = JSON.stringify(this.schemaForm);
          else if (this.selectedOption == 'Text')
            this.dataset.attributes.Body = this.body;
        }
        else {
          this.dataset.attributes.Body = this.parseUrlEncoded(this.urlEncodedArray);
        }

        this.dataset.attributes.pretransformData = this.pretransformData;
        this.dataset.attributes.transformData = this.transformData;

        this.action.emit('test');
      }
    }
    catch (Exception) {
      this.messageService.error("Some error occured", "Error")
    }

  }



  onpreScriptChange($event) {
    try {
      if ($event instanceof Object) {
        this.prescript = $event;
      }
      else if (typeof ($event) == 'string') {
        this.prescript = JSON.parse($event);
      }

      this.isRestDataset = true;

    }
    catch (Exception) {
      this.messageService.error("Some error occured", "Error")
    }


  }

  onScriptChange($event) {
    try {
      if ($event instanceof Object) {
        this.script = $event;
      }
      else if (typeof ($event) == 'string') {
        this.script = JSON.parse($event);
      }

      this.isRestDataset = true;

    }
    catch (Exception) {
      this.messageService.error("Some error occured", "Error")
    }


  }

  ontransformScriptChange($event) {
    try {
      if ($event instanceof Object) {
        this.transformScript = $event;
      }
      else if (typeof ($event) == 'string') {
        this.transformScript = JSON.parse($event);
      }

      this.isRestDataset = true;

    }
    catch (Exception) {
      this.messageService.error("Some error occured", "Error")
    }


  }

  optionChange(event) {
    this.selectedOption = event.value;

  }


  presetValue(event) {
    this.pretransformData = event.checked;
  }

  setValue(event) {
    this.transformData = event.checked;
  }

  transformScriptsetValue(event) {
    this.transformScriptData = event.checked;
  }
  onOptionChange(event) {
    this.bodyOption = event.value;
  }

}

export class DynamicParamsGrid {
  key: string;
  value: string;
}

export class SlideToggleOverviewExample { }

