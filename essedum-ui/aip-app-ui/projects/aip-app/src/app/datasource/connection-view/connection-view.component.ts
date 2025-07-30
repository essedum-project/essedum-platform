import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Services } from '../../services/service';
import { ActivatedRoute, Router } from '@angular/router';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-connection-view',
  templateUrl: './connection-view.component.html',
  styleUrls: ['./connection-view.component.scss'],
})
export class ConnectionViewComponent implements OnInit {
  @Input() initiativeData: any;
  edit: boolean = false;
  connectionName: any;
  data: any;
  typeOptions = [];
  datasourceTypes: any;
  uischema: any;
  attributes: any;
  keys: any[];
  sourceType: any;
  category: any;
  renderers = angularMaterialRenderers;
  schema: any;
  formData: any;
  type: any;
  datasourceports: any;
  datasourceportsjson: any;
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
  connectionDetails = {};
  isCdFull: boolean = false;
  view: boolean = false;
  isVaultEnabled: boolean = false;
  testSuccessful: boolean = false;
  extras = { apispec: {}, apispectemplate: {} };
  apiSpecTemplate: '';
  extasforAPIspec: any;
  apispec: any;
  component: any = [];
  relatedComponent: any;
  ConnectionUnlink: boolean;
  capability: string[] = [];
  capabilityPromise: Promise<boolean>;
  relatedloaded: boolean = false;
  linkAuth: boolean = false;
  cardName: any;
  organisation: any;
  hideDetails: boolean = true;
  portDetails: any;
  portPayload: any;
  capabilityOptions = [
    { viewValue: 'Data', value: 'dataset' },
    { viewValue: 'Runtime', value: 'runtime' },
    { viewValue: 'Model', value: 'model' },
    { viewValue: 'Adapter', value: 'adapter' },
    { viewValue: 'Prompt Provider', value: 'promptprovider' },
    { viewValue: 'Endpoint', value: 'endpoint' },
    { viewValue: 'App', value: 'app' },
  ];
  initiativeView: boolean;
  lastRefreshedTime: Date | null = null;
  
  constructor(
    private Services: Services,
    private route: ActivatedRoute,
    private router: Router,
    private _location: Location,
    private cdRef: ChangeDetectorRef,
    private service: Services
  ) {
    this.route.params.subscribe((params) => {
      this.cardName = params['name'];
    });
    this.route.queryParams.subscribe((params) => {
      if (params['org']) {
        this.organisation = params['org'];
      } else {
        this.organisation = sessionStorage.getItem('organization');
      }
    });
  }

  reload($event: any) {
    if ($event) {
      this.ngOnInit();
    }
  }
  refeshrelated(event: any) {
    this.relatedloaded = false;
    setTimeout(() => {
      this.ngOnInit();
    }, 1000);
  }
  getDatasourceByName() {
    let params: HttpParams = new HttpParams();
    params = params.append('name', this.connectionName);
    params = params.append('org', this.organisation);
    this.Services.getDatasourceByName(params).subscribe((res) => {
      console.log(res);
      this.data = res[0];
    });
  }

  ngOnInit() {
    this.router.url.includes('initiative')
      ? (this.initiativeView = false)
      : (this.initiativeView = true);
    this.service.getPermission('cip').subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes('connection-unlink'))
          this.ConnectionUnlink = true;
        if (cipAuthority.includes('link-component')) this.linkAuth = true;
      },
      (error) => {
        console.log(
          `error when calling getPermission method. Error Details:${error}`
        );
      }
    );
    if (this.router.url.includes('preview')) {
      if (history.state.relatedData) {
        let cards = this._location.getState();
        this.data = cards['relatedData'];
        this.data = this.data.data;
      }
      if (history.state.card) {
        let cards = this._location.getState();
        this.data = cards['card'];
      }

      if (this.data.fordataset) {
        this.capability.push('dataset');
      }
      if (this.data.foradapter) {
        this.capability.push('adapter');
      }
      if (this.data.forruntime) {
        this.capability.push('runtime');
      }
      if (this.data.formodel) {
        this.capability.push('model');
      }
      if (this.data.forpromptprovider) {
        this.capability.push('promptprovider');
      }

      if (this.data.forendpoint) {
        this.capability.push('endpoint');
      }
      if (this.data.forapp) {
        this.capability.push('app');
      }
      this.capabilityPromise = Promise.resolve(true);
      console.log(this.capability);
      this.view = true;
      this.component = [];
      this.service.getRelatedComponent(this.data.id, 'CONNECTION').subscribe({
        next: (res) => {
          this.relatedComponent = res[0];
          this.relatedComponent.data = JSON.parse(this.relatedComponent.data);
          this.component.push(this.relatedComponent);
          this.cdRef.detectChanges();
          this.relatedloaded = true;
          console.log(this.component);
        },
        error: (err) => {
          console.log(err);
        },
      });
    } else if (this.router.url.includes('initiative')) {
      this.connectionName = this.initiativeData.name;
      this.edit = false;
      this.view = true;
      if (!this.connectionName) {
        this.connectionName = this.initiativeData.name;
      }
      this.editConnection();
      this.getdatasourceTypes();
      this.checkVaultStatus();
      this.getDatasourceByName();
    } else {
      this.route.params.subscribe(
        (params) => (this.connectionName = params.name)
      );
      this.route.params.subscribe((params) => (this.view = params.view));
      this.route.params.subscribe((params) => (this.edit = params.edit));
      this.editConnection();
      this.getdatasourceTypes();
      this.checkVaultStatus();
      this.getDatasourceByName();
    }
    this.lastRefreshTime();
  }

  editConnection() {
    if (this.edit) {
      let org;
      if (this.router.routerState.snapshot.url.includes('core-datasources'))
        org = 'Core';
      else org = sessionStorage.getItem('organization');
      this.Services.getCoreDatasource(this.connectionName, org).subscribe(
        (res) => {
          this.data = res;
          if (this.data.type == 'GIT') {
            this.hideDetails = true;
          } else {
            this.hideDetails = true;
          }
          if (this.data.fordataset) {
            this.capability.push('dataset');
          }
          if (this.data.foradapter) {
            this.capability.push('adapter');
          }
          if (this.data.forruntime) {
            this.capability.push('runtime');
          }
          if (this.data.formodel) {
            this.capability.push('model');
          }
          if (this.data.forpromptprovider) {
            this.capability.push('promptprovider');
          }
          if (this.data.forendpoint) {
            this.capability.push('endpoint');
          }
          if (this.data.forapp) {
            this.capability.push('app');
          }
          this.capabilityPromise = Promise.resolve(true);
          console.log(this.capability);
          this.schema = JSON.parse(res.connectionDetails);
          this.formData = this.schema;
          this.type = res.type;
          this.getDatasourcePorts(res.id);
          this.getAvailablePorts(res.id);
        }
      );
    }
  }
  getDatasourcePorts(id: any) {
    this.Services.getDatasourcePort(id).subscribe((res) => {
      console.log('This is connection Id Response :', res);
      this.datasourceportsjson = res;
      console.log(
        'This is datasource ports details : ',
        this.datasourceportsjson
      );
    });
  }
  getAvailablePorts(id: any) {
    this.Services.getAvailablePorts(id).subscribe((res) => {
      console.log('Available Ports:', res);
      this.datasourceports = res;
      console.log('Available Ports: ', this.datasourceports);
    });
  }
  getdatasourceTypes() {
    try {
      let size = 0;
      this.Services.getPluginsLength().subscribe(
        (response) => {
          let s = new Number(response);
          size = s.valueOf();
          // size = response
        },
        (err) => {
          this.Services.message('Unable to fetch Connection types','error');
        },
        () => {
          this.Services.getDatasourceJson(0, size).subscribe(
            (res) => {
              this.datasourceTypes = res;
              this.uischema = res[0].uischema;
              this.attributes = res[0].attributes;
              this.datasourceTypes.sort((a, b) =>
                a.type.toLowerCase() < b.type.toLowerCase() ? -1 : 1
              );
              this.datasourceTypes.forEach((opt) => {
                console.log(opt.type);
                let val = { viewValue: opt.type, value: opt.type };
                this.typeOptions.push(val);
              });
            },
            (error) => {
              this.Services.message('Unable to fetch Connection types','error');
            }
          );
        }
      );
    } catch (Exception) {
      this.Services.message('Some error occured', 'error');
    }
  }

  onTypeChange(event: any) {
    console.log(event);
    this.keys = [];
    this.sourceType = this.datasourceTypes.filter(
      (row) => row.type === event.value
    )[0];
    this.category = this.sourceType?.category;
    if (this.sourceType?.attributes)
      Object.keys(this.sourceType.attributes).forEach((keyValue) => {
        this.keys.push(keyValue);
      });
  }
  onCapbilityTypeChange(event) {
    this.data.fordataset = false;
    this.data.foradapter = false;
    this.data.forruntime = false;
    this.data.formodel = false;
    this.data.forpromptprovider = false;
    this.data.forendpoint = false;

    event.value.forEach((cap) => {
      if (cap === 'dataset') {
        this.data.fordataset = true;
      } else if (cap === 'adapter') {
        this.data.foradapter = true;
      } else if (cap === 'runtime') {
        this.data.forruntime = true;
      } else if (cap === 'formodel') {
        this.data.formodel = true;
      } else if (cap === 'forpromptprovider') {
        this.data.forpromptprovider = true;
      } else if (cap === 'endpoint') {
        this.data.forendpoint = true;
      }
    });
  }
  routeBackToConnectionList() {
    this._location.back();
    if (this.edit) {
      this.router.navigate(['../../../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../'], { relativeTo: this.route });
    }
  }
  testConnection() {
    this.data.type = this.sourceType?.type || this.data.type;
    this.data.category = this.sourceType?.category || this.data.category;
    if (!this.data.organization || this.data.organization == '') {
      this.data.organization = sessionStorage.getItem('organization');
    }
    if (
      this.data.category.toLowerCase().endsWith('rest') ||
      this.data.category.toLowerCase().endsWith('git')
    ) {
      this.data.connectionDetails = this.connectionDetails;
    } else {
      let e = {};
      e['password'] = this.data.password;
      e['userName'] = this.data.userName;
      e['url'] = this.data.url;
      this.data.connectionDetails = JSON.stringify(e);
    }
    this.Services.testConnection(this.data).subscribe(
      (response) => {
        this.Services.message('Success Connected successfully');
        this.testSuccessful = true;
      },
      (error) => {
        this.Services.message(
          'Error! Please check connection details: ' + error,'error'
        );
      }
    );
  }
  updateConnection() {
    this.data.alias = this.data.alias;
    this.data.description = this.data.description;
    this.data.extras = this.extras;

    if (
      this.data.category.toLowerCase().endsWith('rest') ||
      this.data.category.toLowerCase().endsWith('git')
    ) {
      if (Object.keys(this.connectionDetails).length !== 0) {
        this.data.connectionDetails = this.connectionDetails;
      }
    } else {
      let e = {};
      e['password'] = this.data.password;
      e['userName'] = this.data.userName;
      e['url'] = this.data.url;
      this.data.connectionDetails = JSON.stringify(e);
    }
    if (this.apiSpecTemplate && JSON.parse(this.apiSpecTemplate).openapi) {
      if (this.data.extras.apispectemplate) {
        this.data.extras.apispectemplate = JSON.parse(this.apiSpecTemplate);
        this.data.extras.apispec = this.extasforAPIspec.apispec;
      } else {
        this.data.extras = {
          apispectemplate: JSON.parse(this.apiSpecTemplate),
          apispec: JSON.parse(this.extasforAPIspec.apispec),
        };
      }
    }
    if (this.extasforAPIspec && this.extasforAPIspec.apispec) {
      this.data.extras.apispec = this.extasforAPIspec.apispec;
      this.data.extras.apispectemplate = this.apispec;
    }
    if (!this.data.organization)
      this.data.organization = sessionStorage.getItem('organization');

    if (this.data.name && this.data.name != '') {
      this.data.extras = JSON.stringify(this.data.extras);
      this.Services.saveDatasource(this.data).subscribe(
        (res) => {
          this.portDetails.datasourceid = res.body.id;
          this.portDetails.organization = res.body.organization;

          this.portPayload = this.portDetails;
          console.log('This is portPayload :', this.portPayload);
          this.Services.editPorts(this.portPayload).subscribe((response) => {
            console.log('This is Port Details Response :', response);
          });
          if (this.data.interfacetype === 'adapter') {
            this.Services.message('Success Adapter saved');
          } else {
            this.Services.message('Connection updated successfully');
          }
          this._location.back();
        },
        (error) => {
          if (this.data.interfacetype === 'adapter') {
            this.Services.message(
              'Error! Adapter not saved due to: ' + JSON.stringify(error),'error'
            );
          } else {
            this.Services.message(
              'Error! Connection not saved due to: ' + JSON.stringify(error),'error'
            );
          }
        }
      );
    } else {
      this.data.extras = JSON.stringify(this.data.extras);
      this.Services.createDatasource(this.data).subscribe(
        (res) => {
          if (this.data.interfacetype === 'adapter') {
            this.Services.message('Success Adapter created');
          } else {
            this.Services.message('Success! Connection created successfully');
          }
          this._location.back();
        },
        (error) => {
          if (this.data.interfacetype === 'adapter') {
            this.Services.message(
              'Error! Adapter not created due to: ' + JSON.stringify(error),'error'
            );
          } else {
            this.Services.message(
              'Error! Connection not created due to: ' + JSON.stringify(error), 'error'
            );
          }
        }
      );
    }
    //this.telemetry.addTelemetryEvent(this.data?.alias + ' connection saved');
  }

  getPortDetails(port: any) {
    this.portDetails = { ...port };
  }

  getConnectionDetails(connectionDetails) {
    this.connectionDetails = connectionDetails;
    this.isCdFull = true;
  }

  checkVaultStatus() {
    this.Services.isVaultEnabled().subscribe((resp) => {
      this.isVaultEnabled = resp;
    });
  }

  related(relatedData: any) {
    this.router.navigate(
      [
        '../../../' +
          relatedData.type.toLowerCase() +
          's/preview/' +
          relatedData.alias,
      ],
      {
        state: {
          relatedData,
        },
        relativeTo: this.route,
      }
    );
  }
  ngOnDestroy(): void {}

  lastRefreshTime() {
    setTimeout(() => {
      this.lastRefreshedTime = new Date();
      console.log('Data refreshed!');
    }, 1000);
  }
}
