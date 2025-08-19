import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { AdapterServices } from '../../sharedModule/services/adapter-service';
import { OptionsDTO } from '../../DTO/OptionsDTO';

@Component({
  selector: 'app-spec-template-custom-swagger',
  templateUrl: './spec-template-custom-swagger.component.html',
  styleUrls: ['./spec-template-custom-swagger.component.scss'],
})
export class SpecTemplateCustomSwaggerComponent implements OnInit {
  @Input() data: any;
  @Input() isAdapter: any;
  checked: Boolean = false;
  disabled: Boolean = false;
  disableRipple: Boolean = true;
  labelPosition: string = 'before';
  swaggerView: Boolean = true;
  mlspecTemplate: any;
  apispecTemplate: any;
  adapterApispecTemplate: any;
  serverUrl = '';
  apiSpecServerUrl = '';
  serverUrls: OptionsDTO[] = [];
  formattedapispec: any[];
  resFormattedapispec = new Array<string>();
  paths = [];
  existingPaths: string[];
  response: any = { Status: 'Executing' };
  schema: { input: any[]; output: any[] };
  value: any;
  editorOptions = new JsonEditorOptions();
  @ViewChild('formJsonEditor', { static: false })
  formJsonEditor: JsonEditorComponent;
  executionRequired: Boolean = false;

  constructor(private adapterServices: AdapterServices) {}

  ngOnInit(): void {
    this.executionRequired = false;
    this.editorOptions.modes = ['text', 'tree', 'view'];
    this.editorOptions.statusBar = true;
    this.editorOptions.enableSort = false;
    this.editorOptions.enableTransform = false;
    this.editorOptions.mode = 'view';
    console.log('SwaggerCustomComponent loaded:', this.data);
    console.log('isAdapter loaded:', this.isAdapter);
    if (this.data && this.data.apispec) {
      this.adapterApispecTemplate = JSON.parse(this.data.apispectemplate);
    }
    this.serverUrl = window.location.origin;
    this.serverUrls.push(new OptionsDTO(this.serverUrl, this.serverUrl));
    if (this.isAdapter && this.isAdapter === 'yes') {
      this.getSpecTemplate(this.data.domainname);
    }
  }

  getSpecTemplate(spectemplatedomainname: string) {
    this.adapterServices
      .fetchApiSpecTemplate(
        spectemplatedomainname,
        sessionStorage.getItem('organization')
      )
      .subscribe((res) => {
        this.mlspecTemplate = res;
        this.mlspecTemplate.apispectemplate =
          this.mlspecTemplate.apispectemplate
            .replaceAll('{datasource}', this.data.name)
            .replaceAll('{org}', sessionStorage.getItem('organization'))
            .replaceAll('{spec}', spectemplatedomainname)
            .replaceAll('{host}', this.serverUrl);
        if (
          this.mlspecTemplate.apispectemplate &&
          this.mlspecTemplate.apispectemplate.includes('adapters/v1')
        ) {
          this.executionRequired = true;
        }
        this.apispecTemplate = JSON.parse(this.mlspecTemplate.apispectemplate);
        if (
          this.apispecTemplate.servers &&
          this.apispecTemplate.servers[0]?.url
        )
          this.apiSpecServerUrl = this.apispecTemplate.servers[0].url;
        if (this.apiSpecServerUrl && this.apiSpecServerUrl.includes('api'))
          this.serverUrl = this.apiSpecServerUrl;
        this.serverUrls.push(
          new OptionsDTO(this.apiSpecServerUrl, this.apiSpecServerUrl)
        );
        this.getParameters();
        this.getPaths();
        this.getSchemas();
      });
  }
  toggle() {
    this.swaggerView = !this.swaggerView;
  }

  onServerUrlChange(selectedServer: string) {
    console.log('selectedServer:', selectedServer);
    this.serverUrl = selectedServer;
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
                  ?.replace('{datasource}', this.data?.alias)
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

  addMethod(spec) {
    console.log('addMethod called', spec);
  }

  editMethod(spec) {
    console.log('editMethod called', spec);
  }

  deleteMethod(spec) {
    console.log('deleteMethod called', spec);
  }

  execute(spec, template?) {
    this.response = { Status: 'Executing' };
    spec['executeFlag'] = true;
    let headers = {};
    let params = {};
    if (spec.parameters) {
      for (let param of spec.parameters) {
        if (param.in == 'params' || param.in == 'query') {
          params[param.name] = param.value
            ? param.value
                .replace('{datasource}', this.data)
                .replace('{org}', sessionStorage.getItem('organization'))
            : '';
          if (!param.value) param.value = '';
        }
        if (param.in == 'header') {
          headers[param.name] = param.value ? param.value : '';
        }
        if (param.in == 'path') {
          spec.path = spec.path.replace('{' + param.name + '}', param.value);
          params[param.name] = param.value;
        }
      }
    }
    params['instance'] = '1';
    if (spec.requestType.toLowerCase() == 'post') {
      let url = spec.path;
      url = this.serverUrl + spec.path;
      this.adapterServices
        .callPostApi(url, spec.requestBody.value, params, headers)
        .subscribe(
          (resp) => {
            this.response = resp;
          },
          (err) => {
            this.response = err;
            if (!err) this.response = 'ERROR';
          }
        );
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
        .callGetApi(this.serverUrl + spec.path, params, headers)
        .subscribe(
          (resp) => {
            this.response = resp;
          },
          (err) => {
            this.response = err;
            if (!err) this.response = 'ERROR';
          }
        );
    } else if (spec.requestType.toLowerCase() == 'delete') {
      this.adapterServices.callDeleteApi(this.serverUrl + spec.path).subscribe(
        (resp) => {
          this.response = resp;
        },
        (err) => {
          this.response = err;
          if (!err) this.response = 'ERROR';
        }
      );
    }
  }
}
