import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { AdapterServices } from '../services/adapter-service';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { AipDeleteConfirmationComponent } from '../aip-delete-confirmation/aip-delete-confirmation.component';
import { MatDialog } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { Services } from '../../services/service';
import { MLOpsSwaggerAPISpec } from '../../DTO/mlopsapispec';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-aip-swagger-custom',
  templateUrl: './aip-swagger-custom.component.html',
  styleUrls: ['./aip-swagger-custom.component.scss']
})
export class AipSwaggerCustomComponent implements OnInit {
  @Input() adapterName: any;
  @Input() isAdapter: any;
  @Input() instanceName: any;
  @Input() restProvider: any;
  @Input() endpointName: any;
  hasSwaggerData: Boolean = false;
  updateEndpoint: any;
  restProviderData: any;
  specToSave: any;
  tooltipPosition: string = 'above';
  isInstance: Boolean = false;
  isEndpoint: Boolean = false;
  isToggle: Boolean = false;
  adapter: any;
  checked: Boolean = false;
  disabled: Boolean = false;
  disableRipple: Boolean = true;
  labelPosition: string = 'before';
  swaggerView: Boolean = true;
  mlspecTemplate: any;
  apispecTemplate: any;
  adapterApispecTemplate: any;
  serverUrl = '';
  specPath = '';
  apiSpecServerUrl = '';
  serverUrls: OptionsDTO[] = [];
  selectedFile: File;
  fileName: string;
  formData: FormData;
  formattedapispec: any[];
  resFormattedapispec = new Array<string>();
  paths = [];
  existingPaths: string[];
  response: any = { Status: 'Executing' };
  schema: { input: any[]; output: any[] };
  value: any;
  createAction: string = 'create';
  editAction: string = 'edit';
  editorOptions = new JsonEditorOptions();
  edit: string = 'Edit';
  delete: string = 'Delete';
  tooltipPoition: string = 'above';
  dataset: any;
  createAuth: boolean;
  editAuth: boolean;
  deleteAuth: boolean;
  formType;
  alias = ['API', 'Script'];
  cURL: string;
  isRemoteExecution: Boolean = false;
  specToBeAdded: any;
  apispec: any;
  adapterReplica: any;
  mlOpsSwaggerAPISpec: MLOpsSwaggerAPISpec = new MLOpsSwaggerAPISpec();
  @ViewChild('formJsonEditor', { static: false })
  formJsonEditor: JsonEditorComponent;

  constructor(
    private adapterServices: AdapterServices,
    private dialog: MatDialog,
    private clipboard: Clipboard,
    private changeDetector: ChangeDetectorRef,
    private service: Services
  ) { }

  ngOnInit(): void {
    this.authentications();
    this.serverUrl = window.location.origin;
    if (!this.serverUrls.some((item) => item.value === this.serverUrl))
      this.serverUrls.push(new OptionsDTO(this.serverUrl, this.serverUrl));
    if (this.isAdapter && this.isAdapter === 'yes') {
      this.getAdapter();
    }
    if (this.isAdapter && this.isAdapter === 'no') {
      this.isInstance = true;
      this.getAdapterInstance();
    }
  }

  ngAfterViewInit() {
    if (this.restProviderData) {
      this.loadEndpointDetails();
    }
  }

  loadEndpointDetails() {
    let params: HttpParams = new HttpParams();
    params = params.set('fed_Name', this.endpointName);
    params = params.set('org', sessionStorage.getItem('organization'));
    this.service.getEndpointBySourceId(params).subscribe((res) => {
      if (res && res.length > 0) {
        this.updateEndpoint = res[0];
        const swaggerData = res[0].swaggerData;
        if (swaggerData && swaggerData.trim() !== '') {
          this.hasSwaggerData = true;
          try {
            this.apispecTemplate = JSON.parse(res[0].swaggerData);
          } catch (error) {
            console.error('Error parsing swaggerData in endpoint:', error);
          }
        } else {
          this.hasSwaggerData = false;
        }
      } else {
        this.hasSwaggerData = false;
      }
      if (this.formJsonEditor) {
        if (!this.hasSwaggerData) {
          this.apispecTemplate = this.createApiSpec(this.restProviderData);
          /**this.mlspecTemplate = JSON.stringify(this.mlOpsSwaggerAPISpec.getAPISpec2());
          this.mlspecTemplate = this.mlspecTemplate.replaceAll("{endpoint_name}", this.endpointName);
          this.apispecTemplate = JSON.parse(this.mlspecTemplate);**/
          this.formJsonEditor.set(this.apispecTemplate);
        } else {
          this.formJsonEditor.set(this.apispecTemplate);
        }
      }
    });
  }

  initializeSwaggerView() {
    this.swaggerView = !this.swaggerView;
    if (!this.isToggle) {
      this.editorOptions.modes = ['text', 'tree', 'view'];
      this.editorOptions.statusBar = true;
      this.editorOptions.enableSort = false;
      this.editorOptions.enableTransform = false;
      this.editorOptions.mode = 'text';
    } else {
      this.editorOptions.enableSort = true;
      this.editorOptions.enableTransform = true;
      this.editorOptions.mode = 'tree';
    }
    this.loadEndpointDetails();
  }

  getDatasourceData() {
    let params: HttpParams = new HttpParams();
    params = params.append('name', this.restProvider);
    params = params.append('org', sessionStorage.getItem('organization'));
    return this.service.getDatasourceByName(params);
  }

  createApiSpec(restConnection: any) {
    const connectionDetails = JSON.parse(restConnection.connectionDetails);
    const url = connectionDetails.Url;
    const parsedUrl = new URL(url);
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.port ? `:${parsedUrl.port}` : ''
      }`;
    const path = parsedUrl.pathname;
    const finalBody = this.generateFinalBody(connectionDetails);
    this.serverUrl = baseUrl;
    const generatedSpec = {
      openapi: '3.0.1',
      info: {
        title: 'Essedum Platform',
        description: restConnection.description || '',
        version: 'vi',
      },
      servers: [
        {
          url: baseUrl,
        },
      ],
      security: [
        {
          Basic: [],
        },
      ],
      paths: {
        [path]: {
          [connectionDetails.testDataset.attributes.RequestMethod.toLowerCase()]:
          {
            description: '',
            parameters: [],
            requestBody: {
              description: 'Request body',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {},
                  },
                },
              },
              value: finalBody,
            },
            responses: {
              '200': {
                description: 'Successful inference',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        response: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Invalid request parameters',
                content: {},
              },
              '500': {
                description: 'Server error',
                content: {},
              },
              default: {
                description: 'Unexpected error',
                content: {
                  'application/json': {
                    schema: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    return generatedSpec;
  }

  /**public generateFinalBody = (connectionDetails: any): string => {
    const { testDataset } = connectionDetails;
    let body = { ...testDataset.attributes.Body };
    testDataset.attributes.LeapParams.forEach((param: { key: string, value: string }) => {
      for (const key in body) {
        if (typeof body[key] === 'string' && body[key].includes(`<${param.key}>`)) {
          body[key] = body[key].replace(`<${param.key}>`, param.value);
        }
      }
    });
    return JSON.stringify(body);
  };**/

  public generateFinalBody = (connectionDetails: any): string => {
    const { testDataset } = connectionDetails;
    let body = { ...testDataset.attributes.Body };
    const replacePlaceholders = (obj: any, leapParams: any) => {
      if (Array.isArray(obj)) {
        return obj.map((item) => replacePlaceholders(item, leapParams));
      } else if (typeof obj === 'object' && obj !== null) {
        let newObj: any = {};
        for (const key in obj) {
          newObj[key] = replacePlaceholders(obj[key], leapParams);
        }
        return newObj;
      } else if (typeof obj === 'string') {
        leapParams.forEach((param: { key: string; value: string }) => {
          if (obj.includes(`<${param.key}>`)) {
            obj = obj.replace(`<${param.key}>`, param.value);
          }
        });
        return obj;
      }
      return obj;
    };
    body = replacePlaceholders(body, testDataset.attributes.LeapParams);
    return JSON.stringify(body);
  };

  setSwaggerForEndpointByConnectionId() {
    this.isRemoteExecution = true;
    this.adapterApispecTemplate = this.mlOpsSwaggerAPISpec.getAPISpec();
    this.mlspecTemplate = JSON.stringify(this.mlOpsSwaggerAPISpec.getAPISpec());
    this.mlspecTemplate = this.mlspecTemplate
      .replaceAll('{datasource}', this.adapterName)
      .replaceAll('{org}', sessionStorage.getItem('organization'))
      .replace('server_host_url', this.serverUrl);
    this.mlspecTemplate = this.mlspecTemplate.replaceAll(
      'endpoint__id',
      // this.endpointId
    );
    this.apispecTemplate = JSON.parse(this.mlspecTemplate);
    if (this.apispecTemplate.servers && this.apispecTemplate.servers[0]?.url)
      this.apiSpecServerUrl = this.apispecTemplate.servers[0].url;
    if (!this.serverUrls.some((item) => item.value === this.apiSpecServerUrl))
      this.serverUrls.push(
        new OptionsDTO(this.apiSpecServerUrl, this.apiSpecServerUrl)
      );
    this.getParameters();
    this.getPaths();
    this.getSchemas();
  }

  saveSpecTemplateToEndpoint(body?: any) {
    if (body) {
      const firstPathKey = Object.keys(this.specToSave.paths)[0];
      const firstPath = this.specToSave.paths[firstPathKey];
      firstPath.post.requestBody.value = body;
    } else {
      this.specToSave = this.formJsonEditor.get();
    }
    this.updateEndpoint.swaggerData = JSON.stringify(this.specToSave);
    this.service.updateEndpoint(this.updateEndpoint).subscribe(
      (resp) => {
        this.service.messageService(resp, 'Spec is updated');
      },
      (error) => {
        this.service.messageService(error);
      }
    );
  }

  onClickSwaggerView(formJsonEditor: any): void {
    this.swaggerView = true;
    /**if(!this.hasSwaggerData){
      this.adapterApispecTemplate = this.mlOpsSwaggerAPISpec.getAPISpec2();
      this.mlspecTemplate = JSON.stringify(this.mlOpsSwaggerAPISpec.getAPISpec2());
    }else{
      this.adapterApispecTemplate = JSON.parse(this.updateEndpoint.swaggerData);
      this.mlspecTemplate = this.updateEndpoint.swaggerData;
    }**/

    // this.mlspecTemplate = JSON.stringify(this.mlOpsSwaggerAPISpec.getAPISpec2());
    // this.mlspecTemplate = this.formJsonEditor.get();
    // this.mlspecTemplate = this.mlspecTemplate.replaceAll("{endpoint_name}", this.endpointName);
    // this.apispecTemplate = JSON.parse(this.mlspecTemplate);
    this.specToSave = this.formJsonEditor.get();
    this.adapterApispecTemplate = this.formJsonEditor.get();
    this.apispecTemplate = this.formJsonEditor.get();
    if (this.apispecTemplate.servers && this.apispecTemplate.servers[0]?.url)
      this.apiSpecServerUrl = this.apispecTemplate.servers[0].url;
    if (!this.serverUrls.some((item) => item.value === this.apiSpecServerUrl))
      this.serverUrls = [];
    this.serverUrls.push(
      new OptionsDTO(this.apiSpecServerUrl, this.apiSpecServerUrl)
    );
    this.getParameters();
    this.getPaths();
    this.getSchemas();
  }
  backToEditor() {
    this.swaggerView = false;
  }

  getAdapter() {
    this.adapterServices
      .getAdapteByNameAndOrganization(this.adapterName)
      .subscribe((res) => {
        this.adapter = res;
        this.adapter.apispec = this.adapter.apispec.replaceAll(
          '{org}',
          sessionStorage.getItem('organization')
        );
        this.adapterApispecTemplate = JSON.parse(this.adapter.apispec);
        if (this.adapter.executiontype == 'REMOTE')
          this.isRemoteExecution = true;
        this.getSpecTemplate(this.adapter.spectemplatedomainname);
      });
  }

  getAdapterInstance() {
    this.adapterServices
      .getAdapteByNameAndOrganization(this.adapterName)
      .subscribe((res) => {
        this.adapter = res;
        if (this.isInstance)
          this.adapter.apispec = this.adapter.apispec.replaceAll(
            this.adapterName,
            this.instanceName
          );
        this.adapter.apispec = this.adapter.apispec.replaceAll(
          '{org}',
          sessionStorage.getItem('organization')
        );
        this.adapterApispecTemplate = JSON.parse(this.adapter.apispec);
        this.getSpecTemplate(this.adapter.spectemplatedomainname);
      });
  }

  getSpecTemplate(spectemplatedomainname: string) {
    this.adapterServices
      .fetchApiSpecTemplate(
        spectemplatedomainname,
        sessionStorage.getItem('organization')
      )
      .subscribe((res) => {
        this.mlspecTemplate = res;
        if (!this.isInstance)
          this.mlspecTemplate.apispectemplate =
            this.mlspecTemplate.apispectemplate
              .replaceAll('{datasource}', this.adapter.name)
              .replaceAll('{spec}', this.adapter.name)
              .replaceAll('{host}', this.serverUrl)
              .replaceAll('{org}', sessionStorage.getItem('organization'));
        else {
          this.mlspecTemplate.apispectemplate =
            this.mlspecTemplate.apispectemplate
              .replaceAll('{datasource}', this.instanceName)
              .replaceAll('{spec}', this.instanceName)
              .replaceAll('{host}', this.serverUrl)
              .replaceAll('{org}', sessionStorage.getItem('organization'));
          this.mlspecTemplate.apispectemplate =
            this.mlspecTemplate.apispectemplate.replaceAll(
              this.adapterName,
              this.instanceName
            );
        }
        this.apispecTemplate = JSON.parse(this.mlspecTemplate.apispectemplate);
        if (
          this.apispecTemplate.servers &&
          this.apispecTemplate.servers[0]?.url
        )
          this.apiSpecServerUrl = this.apispecTemplate.servers[0].url;
        if (this.apiSpecServerUrl && this.apiSpecServerUrl.includes('api'))
          this.serverUrl = this.apiSpecServerUrl;
        if (
          !this.serverUrls.some((item) => item.value === this.apiSpecServerUrl)
        )
          this.serverUrls.push(
            new OptionsDTO(this.apiSpecServerUrl, this.apiSpecServerUrl)
          );
        this.getParameters();
        this.getPaths();
        this.getSchemas();
      });

    this.editorOptions.modes = ['text', 'tree', 'view'];
    this.editorOptions.statusBar = true;
    this.editorOptions.enableSort = false;
    this.editorOptions.enableTransform = false;
  }

  toggle() {
    if (this.restProvider) {
      this.isToggle = !this.isToggle;
      if (this.isToggle) this.swaggerView = true;
      else if (!this.isToggle) this.swaggerView = false;
    } else {
      this.swaggerView = !this.swaggerView;
    }
    this.ngOnInit();
  }

  onServerUrlChange(selectedServer: any) {    
    this.serverUrl = selectedServer.value;
  }

  handleFileInput(files: any) {
    this.selectedFile = files.target.files[0];
    this.fileName = this.selectedFile.name;
    this.formData = new FormData();
    this.formData.append('file', this.selectedFile);
  }

  clickBtn(spec) {
    if (spec['button'] == 'Try it out') spec['button'] = 'Cancel';
    else spec['button'] = 'Try it out';
  }

  getParameters() {
    this.formattedapispec = [];
    for (let keys in this.apispecTemplate.paths) {
      for (let key in this.apispecTemplate.paths[keys]) {
        let pathObj = {};
        pathObj['path'] = keys;
        pathObj['requestType'] = key.toUpperCase();
        for (let value in this.apispecTemplate.paths[keys][key]) {
          if (value == 'responses') {
            let responses = [];
            for (let resp in this.apispecTemplate.paths[keys][key][value]) {
              let respObj = {};
              respObj['status'] = resp;
              respObj['description'] =
                this.apispecTemplate.paths[keys][key][value][resp][
                'description'
                ];
              respObj['content'] =
                this.apispecTemplate.paths[keys][key][value][resp]['content'];
              responses.push(respObj);
            }
            pathObj[value] = responses;
          } else if (value == 'parameters') {
            for (
              let i = 0;
              i < this.apispecTemplate.paths[keys][key][value].length;
              i++
            ) {
              this.apispecTemplate.paths[keys][key][value][i].value =
                this.apispecTemplate.paths[keys][key][value][i].value
                  ?.replace('{datasource}', this.adapter?.alias)
                  .replace('{org}', sessionStorage.getItem('organization'));
            }
            pathObj[value] = this.apispecTemplate.paths[keys][key][value];
          } else {
            pathObj[value] = this.apispecTemplate.paths[keys][key][value];
            if (pathObj['requestType'] == 'POST' && value == 'requestBody') {
              if (this.adapterApispecTemplate?.paths?.[keys]?.[key]?.[value]) {
                pathObj[value] =
                  this.adapterApispecTemplate.paths[keys][key][value];
              }
            }
          }
        }
        pathObj['button'] = 'Try it out';
        pathObj['executeFlag'] = false;
        this.formattedapispec.push(pathObj);
      }
    }

    this.formattedapispec.forEach((element, index) => {
      this.resFormattedapispec = element.responses;
    });
  }

  getPaths() {
    this.paths = [];
    for (let path in this.apispecTemplate.paths) {
      this.paths.push(path);
    }

    this.existingPaths = [];
    if (this.adapterApispecTemplate)
      for (let keys in this.adapterApispecTemplate.paths) {
        for (let key in this.adapterApispecTemplate.paths[keys]) {
          this.existingPaths.push(keys + key.toUpperCase());
        }
      }
  }

  getSchemas() {
    this.schema = { input: [], output: [] };
    if (this.apispecTemplate.components) {
      for (let component in this.apispecTemplate.components.schemas) {
        if (component == 'input') {
          this.schema[component]?.push(
            JSON.stringify(
              this.apispecTemplate.components.schemas.input.properties
            )
          );
        } else {
          this.schema[component]?.push(
            JSON.stringify(
              this.apispecTemplate.components.schemas.output.properties
            )
          );
        }
        this.value = JSON.stringify(
          this.apispecTemplate.components.schemas.input.properties
        );
      }
    }
  }

  addMethod(spec: any, formType: any) {
    if (formType == 'API') {
      this.formType = 'API';
      this.dialog.open(spec, {
        width: '830px',
        panelClass: 'standard-dialog',
      });
    } else {
      this.formType = 'Script';
      this.dialog.open(spec, {
        width: '830px',
        panelClass: 'standard-dialog',
      });
    }
  }

  editMethod(spec: any) {
    this.dialog.open(spec, {
      width: '830px',
      panelClass: 'standard-dialog',
    });
  }

  deleteMethod(spec) {
    if (this.isRemoteExecution) {
      if (this.adapterApispecTemplate.paths) {
        if (
          this.adapterApispecTemplate.paths[spec.path] &&
          this.adapterApispecTemplate.paths[spec.path][
          spec.requestType.toLowerCase()
          ]
        ) {
          const dialogRef = this.dialog.open(AipDeleteConfirmationComponent);
          dialogRef.afterClosed().subscribe((result) => {
            if (result === 'delete') {
              let apispec = this.adapterApispecTemplate;
              delete apispec.paths[spec.path][spec.requestType.toLowerCase()];
              this.adapter.apispec = JSON.stringify(apispec);
              this.adapterServices
                .updateAdapterAPISpec(this.adapter)
                .subscribe((res) => {
                  this.adapterServices.messageNotificaionService(
                    'success',
                    'Done!  Method Deleted Successfully'
                  );
                  this.ngOnInit();
                });
            }
          });
        }
      }
    } else {
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
            const dialogRef = this.dialog.open(AipDeleteConfirmationComponent);
            dialogRef.afterClosed().subscribe((result) => {
              if (result === 'delete') {
                this.adapterServices.deleteDatasets(method.dataset).subscribe(
                  (res) => {
                    this.adapterServices.messageNotificaionService(
                      'success',
                      'Done!  Method Deleted Successfully'
                    );
                    let apispec = this.adapterApispecTemplate;
                    delete apispec.paths[spec.path][
                      spec.requestType.toLowerCase()
                    ];
                    this.adapter.apispec = JSON.stringify(apispec);
                    this.adapterServices
                      .updateAdapterAPISpec(this.adapter)
                      .subscribe((res) => {
                        this.ngOnInit();
                      });
                  },
                  (error) => console.log(error)
                );
              }
            });
          }
        }
      }
    }
  }

  addRemoteMethod(spec) {
    this.specToBeAdded = spec;
    let path = this.specToBeAdded.path;
    let requestMethod = this.specToBeAdded.requestType.toLowerCase();
    if (this.adapterApispecTemplate.paths) {
      this.apispec = this.adapterApispecTemplate;
      if (!this.apispec.paths[path]) this.apispec.paths[path] = {};
      this.apispec.paths[path][requestMethod] = this.specToBeAdded;
      this.adapterReplica = this.adapter;
      this.adapterReplica.apispec = JSON.stringify(this.apispec);
      this.adapterServices
        .updateAdapterAPISpec(this.adapterReplica)
        .subscribe((res) => {
          this.adapterServices.messageNotificaionService(
            'success',
            'Done! Method Added Successfully'
          );
          this.ngOnInit();
        });
    }
  }

  execute(spec, template?) {
    this.cURL = null;
    this.specPath = spec.path;
    this.response = { Status: 'Executing' };
    spec['executeFlag'] = true;
    let headers = {};
    if (this.specPath && this.specPath.includes('/adapters/'))
      headers['access-token'] = localStorage.getItem('accessToken');
    let params = {};
    if (spec.parameters) {
      for (let param of spec.parameters) {
        if (param.in == 'params' || param.in == 'query') {
          if (!this.isInstance)
            params[param.name] = param.value
              ? param.value
                .replace('{datasource}', this.adapter)
                .replace('{org}', sessionStorage.getItem('organization'))
              : '';
          else {
            params[param.name] = param.value
              ? param.value
                .replace('{datasource}', this.instanceName)
                .replace('{org}', sessionStorage.getItem('organization'))
              : '';
          }
          if (!param.value) param.value = '';
        }
        if (param.in == 'header') {
          headers[param.name] = param.value ? param.value : '';
        }
        if (param.in == 'path') {
          this.specPath = this.specPath.replace(
            '{' + param.name + '}',
            param.value
          );
        }
      }
    }
    if (this.isInstance) params['isInstance'] = 'true';
    if (this.isEndpoint) params['isInstance'] = 'REMOTE';
    if (!params.hasOwnProperty('isInstance'))
      if (this.restProvider) {
        params['rest_provider'] = this.restProvider;
        params['org'] = sessionStorage.getItem('organization');
      } else {
        params['isInstance'] = 'false';
      }
    if (spec.requestType.toLowerCase() == 'post') {
      let url = spec.path;
      url = this.serverUrl + this.specPath;
      if (spec.requestBody.content['multipart/form-data']) {
        delete headers['Content-Type'];
        delete headers['content-type'];
        delete headers['content-Type'];
        delete headers['Content-type'];
        this.adapterServices
          .callPostApiForMultipartFormData(url, this.formData, params, headers)
          .subscribe(
            (resp) => {
              this.response = resp;
              this.generateCURL(spec.requestType, resp.url, headers, 'FILE');
            },
            (err) => {
              this.response = err;
              if (!err) this.response = 'ERROR';
            }
          );
      } else {
        if (this.restProvider) {
          this.adapterServices
            .callPostApiFromEndpointSwagger(
              url,
              spec.requestBody.value,
              params,
              headers
            )
            .subscribe(
              (resp) => {
                this.response = resp.body;
                this.generateCURL(
                  spec.requestType,
                  resp.url,
                  headers,
                  spec.requestBody.value
                );
                this.saveSpecTemplateToEndpoint(spec.requestBody.value);
              },
              (err) => {
                this.response = err;
                if (!err) this.response = 'ERROR';
              }
            );
        } else {
          this.adapterServices
            .callPostApi(url, spec.requestBody.value, params, headers)
            .subscribe(
              (resp) => {
                this.response = resp;
                this.generateCURL(
                  spec.requestType,
                  resp.url,
                  headers,
                  spec.requestBody.value
                );
              },
              (err) => {
                this.response = err;
                if (!err) this.response = 'ERROR';
              }
            );
        }
      }
      if (spec.requestBody.value) {
        if (spec.requestBody.value.includes("'")) {
          spec.requestBody.value = spec.requestBody.value.replaceAll(
            "'",
            "'\\''"
          );
        }
      }
    } else if (spec.requestType.toLowerCase() == 'get') {
      this.adapterServices
        .callGetApi(this.serverUrl + this.specPath, params, headers)
        .subscribe(
          (resp) => {
            this.response = resp;
            this.generateCURL(spec.requestType, resp.url, headers, null);
          },
          (err) => {
            this.response = err;
            if (!err) this.response = 'ERROR';
          }
        );
    } else if (spec.requestType.toLowerCase() == 'delete') {
      this.adapterServices
        .callDeleteApi(this.serverUrl + this.specPath, params, headers)
        .subscribe(
          (resp) => {
            this.response = resp;
            this.generateCURL(spec.requestType, resp.url, headers, null);
          },
          (err) => {
            this.response = err;
            if (!err) this.response = 'ERROR';
          }
        );
    }
  }
  authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      // adapter-create permission
      if (cipAuthority.includes('adapter-create')) this.createAuth = true;
      // adapter-edit/update permission
      if (cipAuthority.includes('adapter-edit')) this.editAuth = true;
      // adapter-delete permission
      if (cipAuthority.includes('adapter-delete')) this.deleteAuth = true;
    });
  }

  copyCURL() {
    this.clipboard.copy(this.cURL);
    this.adapterServices.messageNotificaionService('success', 'CURL Copied');
  }
  generateCURL(
    requestType: string,
    url: string,
    headers: any,
    requestBody: string
  ) {
    let projectId = JSON.parse(sessionStorage.getItem('project'))?.id;
    let cUrlReq = 'curl';
    cUrlReq += ` -X ${requestType}`;
    cUrlReq += ` '${url}'`;
    cUrlReq += ` -H "access-token: <access-token>"`;
    cUrlReq += ` -H "Project: ${projectId}"`;
    if (headers) {
      for (const header in headers) {
        if (header != 'access-token')
          cUrlReq += ` -H "${header}: ${headers[header]}"`;
      }
    }
    if (requestBody) {
      if ('FILE' == requestBody) {
        cUrlReq += ` -F 'file=@"/path/to/file"'`;
      } else {
        if (headers && !JSON.stringify(headers).includes('Content-Type'))
          cUrlReq += ` -H "Content-Type: application/json"`;
        cUrlReq += ` -d '${requestBody}'`;
      }
    }
    this.cURL = cUrlReq;
  }

}
