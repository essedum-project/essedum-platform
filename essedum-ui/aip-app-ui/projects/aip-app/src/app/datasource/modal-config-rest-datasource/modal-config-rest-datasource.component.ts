import {
  Component,
  OnInit,
  OnChanges,
  Inject,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  DoCheck,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { Services } from '../../services/service';
@Component({
  selector: 'modal-config-rest-datasource',
  templateUrl: './modal-config-rest-datasource.component.html',
  styleUrls: ['./modal-config-rest-datasource.component.scss'],
})
export class ModalConfigRestDatasourceComponent
  implements OnInit, OnChanges, DoCheck
{
  @ViewChild('columnJsonEditor', { static: false })
  columnJsonEditor: JsonEditorComponent;
  @ViewChild('formJsonEditor', { static: false })
  formJsonEditor: JsonEditorComponent;
  @Input() apispec;
  @Input() datasourcePortJson;
  @Output() close = new EventEmitter();
  datasetsoptions = [];
  constructor(private Services: Services) {}

  @Input() matData: any = {};
  data: any;
  name: string;
  description: string;
  keys: any = [];
  @Input() type: any;
  category: any;
  datasourceTypes = [];
  sourceType: any = {};
  formats: any = [];
  fileData: any;
  fileToUpload: File;
  headers: Headers;
  filename: string;
  filepath: string;
  groups: any[] = [];
  inputColumns = new FormControl();
  editCanvas: any;
  keypass = 'abcdef';
  isAuth: boolean = true;
  isInEdit: boolean = false;
  allDatasources = [];

  isRestDataSrc: boolean = false;
  tab: any = 'authorizationTab';
  authTypes = [
    { viewValue: 'NoAuth', value: 'NoAuth' },
    { viewValue: 'BasicAuth', value: 'BasicAuth' },
    { viewValue: 'OAuth', value: 'OAuth' },
    { viewValue: 'BearerToken', value: 'BearerToken' },
    { viewValue: 'AWSSign', value: 'AWSSign' },
    { viewValue: 'BigQuery', value: 'BigQuery' },
    { viewValue: 'HMAC', value: 'HMAC' },
    { viewValue: 'Token', value: 'Token' },
  ];
  AuthDetails: {} = {};
  authParams: any = {};
  isExiPorts = false;
  isDefaultPorts = false;
  addPorts: {} = {};
  connectionTypes = [{ viewValue: 'ApiRequest', value: 'ApiRequest' }];
  noProxyValues = [
    { viewValue: 'true', value: 'true' },
    { viewValue: 'false', value: 'false' },
  ];
  requestMethods = [
    { viewValue: 'GET', value: 'GET' },
    { viewValue: 'POST', value: 'POST' },
    { viewValue: 'PUT', value: 'PUT' },
    { viewValue: 'DELETE', value: 'DELETE' },
  ];
  testDataset: any = { attributes: {} };
  basicReqTab: any = 'paramsTab';
  dynamicParamsArray: Array<DynamicParamsGrid> = [];
  paramsDynamic: any = {};
  dynamicHeadersArray: Array<DynamicParamsGrid> = [];
  headersDynamic: any = {};
  leapParamDynamic: any = {};
  bodyOption: string;
  urlEncodedArray: Array<DynamicParamsGrid> = [];
  urlEncodedDynamic: any = {};
  editorOptions = new JsonEditorOptions();
  schemaForm: any;
  password;
  resStatus;
  scope = '';
  grant_type = '';
  client_id = '';
  client_secret = '';
  username = '';
  pswd = '';
  addCerts = false;

  options = [];
  clientAuthenticationOptions = [];
  selectedOption: any;
  grantTypeOptions = [];

  body: any = '';
  test: any;
  value: any;
  datasets: any;
  datasources: any;
  datasourceOptions = [];
  extasforAPIspec: any;
  dsourceCtrl = new FormControl();
  executionOptions = [
    { viewValue: 'Native', value: 'Native' },
    { viewValue: 'Remote', value: 'Remote' },
  ];

  instanceTypeOptions = [
    { viewValue: 'Dev', value: 'dev' },
    { viewValue: 'Test', value: 'test' },
    { viewValue: 'Prod', value: 'prod' },
    { viewValue: 'Staging', value: 'staging' },
  ];

  @Output() connectionDetails = new EventEmitter<any>();
  @Output() portDetails = new EventEmitter<any>();
  @Input('isVaultEnabled') isVaultEnabled: boolean;
  @Input() capability: string[];
  @Output() onSetApiSpec = new EventEmitter<any>();

  ngOnInit() {
    this.findalldatasources();
    this.AuthDetails = {};
    this.AuthDetails['password'] = this.isVaultEnabled ? this.keypass : '';
    this.AuthDetails['authToken'] = this.isVaultEnabled ? this.keypass : '';
    this.AuthDetails['authParams'] = {};
    this.isVaultEnabled
      ? (this.AuthDetails['authParams']['scope'] = this.keypass)
      : '';
    this.isVaultEnabled
      ? (this.AuthDetails['authParams']['client_id'] = this.keypass)
      : '';
    this.isVaultEnabled
      ? (this.AuthDetails['authParams']['client_secret'] = this.keypass)
      : '';

    this.paramsDynamic = { key: '', value: '' };
    this.dynamicParamsArray.push(this.paramsDynamic);

    this.headersDynamic = { key: '', value: '' };
    this.dynamicHeadersArray.push(this.headersDynamic);

    this.urlEncodedDynamic = { key: '', value: '' };
    this.urlEncodedArray.push(this.urlEncodedDynamic);

    this.editorOptions.modes = ['text', 'tree', 'view'];
    this.editorOptions.mode = 'text';

    if (this.matData && this.matData.name) {
      this.Services.getCoreDatasource(
        this.matData.name,
        this.matData.organization
      ).subscribe((res) => {
        this.data = res;
        //this.apispec = JSON.parse("{}");
        if (this.data.extras == null || this.data.extras == '') {
          this.data.extras = JSON.stringify({
            apispec: {},
            apispectemplate: {},
          });
        }
        this.extasforAPIspec = JSON.parse(this.data.extras);
        this.apispec = this.extasforAPIspec.apispectemplate;
        this.sourceType.attributes = JSON.parse(this.data.connectionDetails);
        this.testDataset = this.sourceType.attributes.testDataset;
        if (this.testDataset?.attributes?.bodyType) {
          this.bodyOption = this.testDataset.attributes.bodyType;
          this.onOptionChange(null, this.bodyOption);
        }
        if (this.testDataset?.attributes?.Body) {
          if (this.bodyOption === 'x-www-form-urlencoded')
            this.urlEncodedArray = this.testDataset.attributes.Body;
          else {
            this.selectedOption = this.bodyOption;
            this.schemaForm = this.body = this.testDataset.attributes.Body;
          }
        }
        this.AuthDetails = this.sourceType.attributes.AuthDetails;
        this.addCerts = this.sourceType.attributes['CertsAdded']
          ? this.sourceType.attributes['CertsAdded']
          : false;
        if (this.AuthDetails['authParams']) {
          this.scope = this.AuthDetails['authParams'].scope;
          this.grant_type = this.AuthDetails['authParams'].grant_type;
          this.client_id = this.AuthDetails['authParams'].client_id;
          this.client_secret = this.AuthDetails['authParams'].client_secret;
        }

        if (
          JSON.stringify(this.testDataset.attributes) === JSON.stringify({})
        ) {
          this.dynamicParamsArray = [];
          this.dynamicHeadersArray = [];
        } else {
          this.dynamicParamsArray = this.testDataset.attributes.QueryParams;
          this.dynamicHeadersArray = this.testDataset.attributes.Headers;
          if (typeof this.testDataset.attributes.Body != 'string')
            this.schemaForm = this.testDataset.attributes.Body;
          else this.body = this.testDataset.attributes.Body;
        }

        this.editCanvas = res;
        this.getdatasourceTypes();
        this.isInEdit = true;
      });
    } else {
      this.data = {
        name: '',
        description: '',
        type: this.matData.group != 'NA' ? this.matData.group : 'SQL',
        category: '',
      };
      this.getdatasourceTypes();
      this.Services.getDatasourcesNames().subscribe((resp) => {
        this.allDatasources = resp;
      });
    }

    this.options = [
      { viewValue: 'Text', value: 'Text' },
      { viewValue: 'JSON', value: 'JSON' },
      { viewValue: 'XML', value: 'XML' },
    ];
    if (!this.selectedOption) this.selectedOption = this.options[0].value;

    this.clientAuthenticationOptions = [
      {
        viewValue: 'Send as Basic Auth header',
        value: 'Send as Basic Auth header',
      },
      {
        viewValue: 'Send client credentials in body',
        value: 'Send client credentials in body',
      },
    ];

    this.grantTypeOptions = [
      { viewValue: 'client_credentials', value: 'client_credentials' },
      { viewValue: 'password_credentials', value: 'password_credentials' },
    ];

    this.editorOptions.statusBar = true;
    this.editorOptions.enableSort = false;
    this.editorOptions.enableTransform = false;
    (this.editorOptions.onChange = () => {
      if ((this.basicReqTab = 'bodyTab')) {
        this.schemaForm = this.formJsonEditor.get();
      }
    }),
      (err) => {
        this.Services.message('Error! Enclose body in STRING ','error');
      };
  }

  ngOnChanges(changes) {
    if (changes?.datasourcePortJson?.currentValue) {
      this.addPorts['startport'] =
        this.datasourcePortJson['connport-startrange'];
      this.addPorts['endport'] = this.datasourcePortJson['connport-endrange'];
      this.addPorts['existartport'] =
        this.datasourcePortJson['exiport-startrange'];
      this.addPorts['exiendport'] = this.datasourcePortJson['exiport-endrange'];

      this.isExiPorts = this.datasourcePortJson['isExiPorts'];
      this.isDefaultPorts = this.datasourcePortJson['isDefaultPorts'];
    }
  }
  setApiSpec(e) {
    this.onSetApiSpec.emit(e.target.value);
  }

  findalldatasources() {
    let projName = sessionStorage.getItem('organization');
    this.Services.getDatasourcesNames1(projName).subscribe((res) => {
      this.datasources = res;
      this.datasources.forEach((opt) => {
        let val = { viewValue: opt.alias, value: opt.name };
        this.datasourceOptions.push(val);
      });
    });
  }

  getDatasetsforDatasource(datasource) {
    this.Services.getDatasetNamesByDatasource(datasource).subscribe((res) => {
      this.datasets = res;
      this.datasets.forEach((opt) => {
        console.log(opt.type);
        let val = { viewValue: opt.alias, value: opt.alias };
        this.datasetsoptions.push(val);
      });
    });
  }

  OnDatasourceChange(datasource) {
    this.getDatasetsforDatasource(datasource.name);
  }

  OnDatasetChange(dataset) {
    this.Services.getDatasetByNameAndOrg(dataset.name).subscribe((res) => {
      res.datasource.extras = '{}';
      this.AuthDetails['tokenDataset'] = res;
    });
  }

  setDatasource(key, datasource) {
    this.sourceType.attributes[key] = datasource.value;
  }
  setDgInstanceType(key, instanceType) {
    console.log('instancetypeevent', instanceType);

    this.sourceType.attributes[key] = instanceType;
  }
  testConnection() {
    if (this.isInEdit || this.isWordValid(this.data.name)) {
      this.AuthDetails['authParams'] = this.authParams;

      this.sourceType.attributes.AuthDetails = this.AuthDetails;
      this.sourceType.attributes.password = this.password;

      if (
        this.dynamicParamsArray.length == 1 &&
        this.dynamicParamsArray[0].key == '' &&
        this.dynamicParamsArray[0].value == ''
      )
        this.testDataset.attributes.QueryParams = '';
      else this.testDataset.attributes.QueryParams = this.dynamicParamsArray;

      if (
        this.dynamicHeadersArray.length == 1 &&
        this.dynamicHeadersArray[0].key == '' &&
        this.dynamicHeadersArray[0].value == ''
      )
        this.testDataset.attributes.Headers = '';
      else this.testDataset.attributes.Headers = this.dynamicHeadersArray;

      if (this.schemaForm) this.testDataset.attributes.Body = this.schemaForm;
      if (this.body) this.testDataset.attributes.Body = this.body;

      this.sourceType.attributes.testDataset = this.testDataset;

      this.data.connectionDetails = JSON.stringify(this.sourceType.attributes);
      this.data.type = this.sourceType.type;
      this.data.category = this.sourceType.category;

      this.connectionDetails.emit(this.data.connectionDetails);
      this.portDetails.emit(this.addPorts);
    } else {
      this.Services.message('Error! Invalid Connection Name ','error');
    }
  }

  getdatasourceTypes() {
    let size = 0;
    this.Services.getPluginsLength().subscribe(
      (response) => {
        let s = new Number(response);
        size = s.valueOf();
        // size = response
      },
      (err) => {
        this.Services.message(
          'Error Unable to fetch Connection types ','error'
        );
      },
      () => {
        this.Services.getDatasourceJson(0, size).subscribe(
          (res) => {
            this.datasourceTypes = res;

            this.datasourceTypes.sort((a, b) =>
              a.type.toLowerCase() < b.type.toLowerCase() ? -1 : 1
            );

            if (!this.data.id) {
              // this.type = 'rest';

              this.sourceType = this.datasourceTypes.filter(
                (row) => row.type.toLowerCase() === this.type.toLowerCase()
              )[0];

              this.category = this.sourceType.category;
              this.formats = [];
              // this.sourceType.storage = {}
              if (this.sourceType.formats) {
                Object.keys(this.sourceType.formats).forEach((keyValue) => {
                  if (!keyValue.includes('-dp')) {
                    this.formats.push(keyValue);
                  }
                });
              }
              this.testDataset = JSON.parse(
                this.sourceType.attributes.testDataset
              );
              this.schemaForm = this.testDataset.attributes.Body;
              this.body = this.testDataset.attributes.Body;
            } else {
              this.type = this.data.type;
              this.category = this.data.category;
              this.sourceType['type'] = this.type;
              this.sourceType['attributes'] = JSON.parse(
                this.data.connectionDetails
              );
              this.sourceType['formats'] = this.sourceType.attributes.formats;
              console.log('sourceType', this.sourceType.formats);

              this.formats = [];
              Object.keys(this.sourceType.attributes.formats).forEach(
                (keyValue) => {
                  if (!keyValue.includes('-dp')) {
                    this.formats.push(keyValue);
                  }
                }
              );
              console.log('formatselse', this.formats);
            }
          },
          (error) => {
            this.Services.message(
              'Error Unable to fetch Connection types ','error'
            );
          }
        );
      }
    );
  }

  onTypeChange() {
    this.sourceType = this.datasourceTypes.filter(
      (row) => row.type === this.type
    )[0];
  }

  selectedz(data) {
    return JSON.stringify(data);
  }

  omit_special_char(event) {
    var k = event.charCode;
    return this.isValidLetter(k);
  }

  isValidLetter(k) {
    return (
      (k >= 65 && k <= 90) ||
      (k >= 97 && k <= 122) ||
      (k >= 48 && k <= 57) ||
      [8, 9, 13, 16, 17, 20, 95].indexOf(k) > -1
    );
  }

  isWordValid(word) {
    word = word.toString();
    for (var i = 0, j = word.length; i < j; i++) {
      if (!this.isValidLetter(word.charCodeAt(i))) {
        return false;
      }
    }
    if (this.allDatasources.includes(word)) return false;
    return true;
  }

  onPasswordChange(event) {
    if (event === true) this.AuthDetails['password'] = this.keypass;
  }

  onScopeChange(event) {
    if (event === true) this.AuthDetails['authParams']['scope'] = this.keypass;
  }

  onClientIdChange(event) {
    if (event === true)
      this.AuthDetails['authParams']['client_id'] = this.keypass;
  }

  onClientSecretChange(event) {
    if (event === true)
      this.AuthDetails['authParams']['client_secret'] = this.keypass;
  }

  onAuthTokenChange(event) {
    if (event === true) this.AuthDetails['authToken'] = this.keypass;
  }

  setValue(istrue: any) {
    this.sourceType.attributes['CertsAdded'] = istrue.checked;
  }

  tabChange(index) {
    switch (index) {
      case 0:
        this.tab = 'authorizationTab';
        break;
      case 1:
        this.tab = 'connectionTab';
        break;
      case 2:
        this.tab = 'settingsTab';
        break;
      case 3:
        this.tab = 'apiSpecTab';
        break;
    }
  }

  basicReqTabChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = 'paramsTab';
        break;
      case 1:
        this.basicReqTab = 'headersTab';
        break;
      case 2:
        this.basicReqTab = 'extrasTab';
        break;
      case 3:
        this.basicReqTab = 'bodyTab';
        break;
    }
  }

  onAuthTypeChange() {
    this.AuthDetails = {};
    this.AuthDetails['authParams'] = {};
  }

  addParamsRow() {
    if (this.dynamicParamsArray.length == 0) {
      this.dynamicParamsArray = [];
    }

    this.paramsDynamic = { key: '', value: '' };
    this.dynamicParamsArray.push(this.paramsDynamic);
    this.testDataset.attributes['QueryParams'] = this.dynamicParamsArray;
    return true;
  }

  deleteParamsRow(index) {
    this.dynamicParamsArray.splice(index, 1);
    this.testDataset.attributes['QueryParams'] = this.dynamicParamsArray;
    return true;
  }

  addHeadersRow() {
    if (this.dynamicHeadersArray.length == 0) {
      this.dynamicHeadersArray = [];
    }
    this.headersDynamic = { key: '', value: '' };
    this.dynamicHeadersArray.push(this.headersDynamic);
    this.testDataset.attributes['Headers'] = this.dynamicHeadersArray;
    return true;
  }

  deleteHeadersRow(index) {
    this.dynamicHeadersArray.splice(index, 1);
    this.testDataset.attributes['Headers'] = this.dynamicHeadersArray;
    return true;
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

  ngDoCheck() {
    this.category = 'rest';
    this.scope ? (this.authParams.scope = this.scope) : null;
    this.authParams.grant_type = this.grant_type;
    this.authParams.client_id = this.client_id;
    this.authParams.client_secret = this.client_secret;
    this.AuthDetails['authParams'] = this.authParams;

    if (this.sourceType?.attributes?.AuthDetails)
      this.sourceType.attributes.AuthDetails = this.AuthDetails;
    if (this.sourceType?.attributes?.password)
      this.sourceType.attributes.password = this.password;
    try {
      this.testDataset = JSON.parse(this.testDataset);
    } catch (e) {}
    if (
      this.dynamicParamsArray.length == 1 &&
      this.dynamicParamsArray[0].key == '' &&
      this.dynamicParamsArray[0].value == ''
    )
      this.testDataset.attributes.QueryParams = '';
    else this.testDataset.attributes.QueryParams = this.dynamicParamsArray;

    if (
      this.dynamicHeadersArray.length == 1 &&
      this.dynamicHeadersArray[0].key == '' &&
      this.dynamicHeadersArray[0].value == ''
    )
      this.testDataset.attributes.Headers = '';
    else this.testDataset.attributes.Headers = this.dynamicHeadersArray;

    if (this.selectedOption === 'JSON' && this.schemaForm)
      this.testDataset.attributes.Body = this.schemaForm;
    if (this.selectedOption != 'JSON' && this.body)
      this.testDataset.attributes.Body = this.body;
    if (this.bodyOption === 'x-www-form-urlencoded')
      this.testDataset.attributes.bodyType = this.bodyOption;
    else this.testDataset.attributes.bodyType = this.selectedOption;
    if (this.sourceType?.attributes?.testDataset)
      this.sourceType.attributes.testDataset = this.testDataset;
    if (this.sourceType.formats)
      this.sourceType.attributes['formats'] = this.sourceType.formats;
    this.data.connectionDetails = JSON.stringify(this.sourceType.attributes);

    this.data.type = this.sourceType.type;
    this.data.categoy = this.sourceType.category;

    this.connectionDetails.emit(this.data.connectionDetails);
    this.portDetails.emit(this.addPorts);
  }

  optionChange(event) {
    this.selectedOption = event.value;
    this.bodyOption = event.value;
    this.addHeaderRowBasedOnType(event.value);
  }

  addfile(file) {
    if (
      file.target.files[0].name.endsWith('.csv') ||
      file.target.files[0].name.endsWith('.xlsx') ||
      file.target.files[0].name.endsWith('.json')
    ) {
      try {
        const formData: FormData = new FormData();
        let file1: File = file.target.files[0];
        let possible =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890,./;'[]=-)(*&^%$#@!~`";
        const lengthOfCode = 40;
        let metadata = {};
        metadata['FileGuid'] = this.makeRandom(lengthOfCode, possible);
        metadata['FileName'] = file1.name;
        metadata['TotalCount'] = 1;
        metadata['FileSize'] = file1.size;
        this.Services.generateFileId(
          sessionStorage.getItem('organization')
        ).subscribe(
          (fileid) => {
            this.sourceType.attributes['fileid'] = fileid;
            this.sourceType.attributes['file_name'] = file1.name;
          },
          (err) => {},
          () => {
            formData.set('file', file1, file1.name);
            metadata['Index'] = 1;
            formData.set('chunkMetadata', JSON.stringify(metadata));
            this.Services.uploadFile(
              formData,
              this.sourceType.attributes['fileid']
            ).subscribe(
              (res) => {},
              (err) => {}
            );
          }
        );
      } catch (Exception) {
        this.Services.message('Some error occured ', 'error');
      }
    } else this.Services.message('File format not supported ', 'error');
  }

  makeRandom(lengthOfCode: number, possible: string) {
    let text = '';
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(
        Math.floor(
          (window.crypto.getRandomValues(new Uint32Array(1))[0] /
            (0xffffffff + 1)) *
            possible.length
        )
      );
    }
    return text;
  }
  onOptionChange(event, option?) {
    if (option) {
      this.bodyOption = option;
      if (option === 'x-www-form-urlencoded')
        this.value = 'x-www-form-urlencoded';
      else this.value = 'raw';
    }
    if (event?.value) {
      this.bodyOption = event.value;
      if (this.bodyOption === 'x-www-form-urlencoded') {
        this.value = 'x-www-form-urlencoded';
        this.addHeaderRowBasedOnType(event.value);
      } else {
        this.value = 'raw';
        this.addHeaderRowBasedOnType(this.selectedOption);
      }
    }
    if (event?.value === 'raw') {
      this.bodyOption = this.selectedOption;
    }
  }

  addHeaderRowBasedOnType(type: string) {
    if (!this.dynamicHeadersArray) {
      this.dynamicHeadersArray = [];
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

  setIsExiPort(istrue: any) {
    console.log('Capability is :', this.capability);
    this.isExiPorts = istrue.checked;
    this.addPorts['exiPort'] = istrue.checked;
  }

  setIsDefaultPort(istrue: any) {
    this.addPorts['defaultPort'] = istrue.checked;
    this.isDefaultPorts = istrue.checked;
    console.log('Set Default Port Button Clicked : ', this.addPorts);
  }
}

export class DynamicParamsGrid {
  key: string;
  value: string;
}

export class DatasourceDetails {
  name = '';
  description = '';
}
