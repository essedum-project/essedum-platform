import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Services } from '../../services/service';
import { ActivatedRoute, Router } from '@angular/router';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import { LocationStrategy } from '@angular/common';
import { Location } from '@angular/common';
import { RaiservicesService } from '../../services/raiservices.service';


@Component({
  selector: 'app-datasource-config',
  templateUrl: './datasource-config.component.html',
  styleUrls: ['./datasource-config.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatasourceConfigComponent implements OnInit {
  @Output() responseLink = new EventEmitter<any>();
  alias: any;
  gitUrl: any
  description: any;
  datasourceTypes = [];
  type: any;
  data: any
  customCreate: boolean = false;
  check: boolean = false;
  @Input() matData: any = {}
  @Input() view: boolean = false;
  @Input() ConnectionEdit: boolean = false;
  sourceType: any = {};
  category: any;
  dsUrl: string
  keys: any = [];
  typeOptions = [];
  capabilityOptions =
    [{ viewValue: "Data", value: "dataset" },
    { viewValue: "Runtime", value: "runtime" },
    { viewValue: "Model", value: "model" },
    { viewValue: "Adapter", value: "adapter" },
    { viewValue: "Prompt Provider", value: "promptprovider" },
    { viewValue: "Endpoint", value: "endpoint" },
    { viewValue: "App", value: "app" }
    ];
  fileData: any;
  fileToUpload: File;
  headers: Headers;
  filename: string;
  filepath: string;
  groups: any[] = [];
  editCanvas: any;
  keypass = 'abcdef';
  isAuth: boolean = true;
  isInEdit: boolean = false;
  isVaultEnabled: boolean = false;
  isGithub: boolean = true;
  apispec: any;
  allDatasources = []
  testSuccessful: boolean = false;
  Jdata

  connectionDetails = {};
  isCdFull: boolean = false;
  extras = { apispec: {}, apispectemplate: {} };
  apiSpec: "";
  apiSpecTemplate: "";
  extasforAPIspec: any;
  obfuscate: string[] = ['password', 'accessKey', 'secretKey', 'apiKey'];
  renderers = angularMaterialRenderers;
  formData: any;
  uischema;
  attributes: any;
  schema: any;
  edit: boolean = false;
  capability: string[] = [];
  initiativeView: boolean;
  lastRefreshedTime: Date | null = null;
  modelTypeOptions: any = [];
  options: any = [];
  @Input() initiativeCreate: boolean;
  capabilityPromise: Promise<boolean>;
  portDetails: any;
  portPayload: any;
  showCustomIcon: boolean = true;

  constructor(
    private Services: Services,
    private route: ActivatedRoute,
    private router: Router,
    private location: LocationStrategy,
    private _location: Location,
    private raiService: RaiservicesService
  ) { }

  ngOnInit() {
    this.initiativeCreate ? this.initiativeView = false : this.initiativeView = true
    this.router.url.includes('initiative') ? (this.initiativeView = false) : (this.initiativeView = true);
    if (this.router.url.includes('connections')) {
      this.customCreate = false;
    }
    else {
      this.customCreate = true;
    }
    try {
      setTimeout(() => {
        this.checkVaultStatus();
        if (this.matData && this.matData.name && this.matData.description != "imported") {
          this.edit = true;
          this.Services.getCoreDatasource(this.matData.name, this.matData.organization).subscribe(res => {
            this.data = res;
            if (this.data.fordataset) {
              this.capability.push("dataset")
            }
            if (this.data.foradapter) {
              this.capability.push("adapter")
            }
            if (this.data.forruntime) {
              this.capability.push("runtime")
            }
            if (this.data.formodel) {
              this.capability.push("model")
            }
            if (this.data.forpromptprovider) {
              this.capability.push("promptprovider")
            }
            if (this.data.forendpoint) {
              this.capability.push("endpoint")
            }
            this.capabilityPromise = Promise.resolve(true);
            if (this.data.forapp) {
              this.capability.push("app")
            }
            this.capabilityPromise = Promise.resolve(true);
            this.sourceType.attributes = JSON.parse(this.data.connectionDetails);
            this.editCanvas = res;
            this.getdatasourceTypes();

            this.isInEdit = true
            if (!this.data.extras && this.data.extras == null) {
              this.data.extras = JSON.stringify(this.extras);
            }
            this.extasforAPIspec = JSON.parse(this.data.extras)
            this.apispec = this.extasforAPIspec.apispectemplate;


          });
        } else if (this.matData && this.matData.description == "imported") {
          this.edit = true;
          this.data = {
            name: this.matData.name,
            alias: this.matData.alias,
            description: '',
            type: this.matData.group != 'NA' ? this.matData.group : 'SQL',
            category: ''
          };
          if (this.matData.data.organization) this.data.organization = this.matData.data.organization
          this.getdatasourceTypes();
        } else {
          this.data = {
            name: '',
            description: '',
            type: this.matData.group != 'NA' ? this.matData.group : 'SQL',
            category: '',
            extras: JSON.stringify({ apispec: {}, apispectemplate: {} }),
            organization: ''
          };
          if (this.matData && this.matData.data?.organization) this.data.organization = this.matData.data.organization
          this.getdatasourceTypes();
        }
        this.Services.getDatasourcesNames().subscribe(resp => {
          this.allDatasources = resp
        })
        this.editConnection();
      },);
    }
    catch (Exception: any) {
      this.Services.message("Some error occured" ,'error')
    }

    this.lastRefreshTime();
  }

  lastRefreshTime() {
    setTimeout(() => {
      this.lastRefreshedTime = new Date();
      console.log('Data refreshed!');
    }, 1000);
  }

 
  checkVaultStatus() {
    this.Services.isVaultEnabled().subscribe(resp => {
      this.isVaultEnabled = resp
    })
  }

  editConnection() {
    if (this.edit) {
      this.schema = JSON.parse(this.matData.connectionDetails);
      this.formData = this.schema
      this.type = this.matData.type;
      console.log('editType', this.type);
      if (this.type == 'GIT') {
        this.isGithub = false;
      }
      else this.isGithub = true;
      if (this.data?.fordataset) {
        this.capability.push("dataset")
      }
      if (this.data?.foradapter) {
        this.capability.push("adapter")
      }
      if (this.data?.forruntime) {
        this.capability.push("runtime")
      }
      if (this.data?.formodel) {
        this.capability.push("model")
      }
      if (this.data?.forpromptprovider) {
        this.capability.push("promptprovider")
      }
      if (this.data?.forendpoint) {
        this.capability.push("endpoint")
      }
      if (this.data?.forapp) {
        this.capability.push("app")
      }
    }
  }


  routeBackToConnectionList() {
    this._location.back();
  }

  testConnection() {

    this.data.type = this.sourceType?.type;
    this.data.category = this.sourceType?.category;
    if (!this.data.organization || this.data.organization == "") {
      this.data.organization = sessionStorage.getItem('organization');
    }
    if (this.data.category.toLowerCase().endsWith('rest') || this.data.category.toLowerCase().endsWith('git')) {
      this.data.connectionDetails = this.connectionDetails;
    }
    else {
      this.data.connectionDetails = this.sourceType && this.sourceType.attributes && JSON.stringify(this.sourceType.attributes);

    }

    const parsedDetails = JSON.parse(this.data.connectionDetails);
    this.dsUrl = parsedDetails.Url
    const validatePort = { 'portDetails': this.portDetails, 'dsUrl': this.dsUrl }
    if (this.portDetails && Object.keys(this.portDetails).length) {
      this.validatePorts(validatePort);
    }

    this.Services.testConnection(this.data).subscribe((response) => {
      this.Services.message('Tested! Connected successfully');
      this.testSuccessful = true;
    },
      error => {
        this.Services.message('Error! Please check connection details: ' + error,'error');
      }
    );
  }
  validatePorts(validatePort: any) {
    this.Services.validatePorts(validatePort).subscribe((response) => {
      if (response.body.available_ports.length) {
        console.log("Available Ports :", response.body.available_ports)
      }

    }, error => {

      setTimeout(() => {
        this.Services.message('Please Provide a different Port Range','error');
        // Place your code here that you want to execute after 2 seconds  
      }, 2000); // 2000 milliseconds = 2 seconds  
    });

  }

  saveDatasource() {
    if (!this.isGithub && !this.edit) {
      this.data.alias = this.alias;
      this.data.description = this.description;
      this.data.category = this.sourceType?.category;
      this.data.type = this.sourceType?.type;
      this.data.connectionDetails = this.sourceType?.attributes && JSON.stringify(this.sourceType.attributes);
      //  this.data.url = this.gitUrl;
      this.data.organization = sessionStorage.getItem("organization");
      console.log('data', this.data);
      this.Services.createDatasource(this.data).subscribe((res) => {
        console.log('git', res);
        this.Services.message('Connection created successfully ');
        console.log('telemetry started');
        if (this.router.url.includes('initiative')) {
          this.responseLink.emit(res);
          this.raiService.changeModalData(true);
          this.closeModal();
        }

      })
    }
    else {
      if (this.edit) {
        this.data.alias = this.matData.alias;
        this.data.description = this.matData.description;
      } else {
        this.data.alias = this.alias;
        this.data.description = this.description;
      }
      this.data.category = this.sourceType?.category;
      this.data.type = this.sourceType?.type;
      this.data.extras = this.extras;
      console.log(this.data);
      if (this.data.category.toLowerCase().endsWith('rest') || this.data.category.toLowerCase().endsWith('git')) {
        if (Object.keys(this.connectionDetails).length !== 0) {
          this.data.connectionDetails = this.connectionDetails;
        }
      }
      else {
        this.data.connectionDetails = this.sourceType?.attributes && JSON.stringify(this.sourceType.attributes);

      }
      if (this.apiSpecTemplate && JSON.parse(this.apiSpecTemplate).openapi) {
        if (this.data.extras.apispectemplate) {
          this.data.extras.apispectemplate = JSON.parse(this.apiSpecTemplate);
          this.data.extras.apispec = this.extasforAPIspec.apispec;
        }
        else {
          this.data.extras = { apispectemplate: JSON.parse(this.apiSpecTemplate), apispec: JSON.parse(this.extasforAPIspec.apispec) };
        }
      }
      if (this.extasforAPIspec && this.extasforAPIspec.apispec) {
        this.data.extras.apispec = this.extasforAPIspec.apispec;
        this.data.extras.apispectemplate = this.apispec;
      }
      if (!this.data.organization)
        this.data.organization = sessionStorage.getItem("organization");

      if (this.data.name && this.data.name != "") {
        this.data.extras = JSON.stringify(this.data.extras);
        this.Services.saveDatasource(this.data).subscribe((res) => {
          if (this.data.interfacetype === "adapter") {
            this.Services.message('Adapter saved successfully');
          }
          else {
            this.Services.message('Connection updated successfully ');
            this._location.back();
          }
          if (this.router.url.includes('initiative')) {
            this.raiService.changeModalData(true);
          }
          else {
            this.router.navigate(['../'], { relativeTo: this.route });

          }
        },
          error => {
            if (this.data.interfacetype === "adapter") {
              this.Services.message('Error! Adapter not saved due to: ' + JSON.stringify(error),'error');
            }
            else {
              this.Services.message('Error! Connection not updated due to: ' + JSON.stringify(error),'error');
            }
          });
      }
      else {
        this.data.extras = JSON.stringify(this.data.extras);
        this.Services.createDatasource(this.data).subscribe((res) => {
          this.Services.message('Connection created successfully');

          this.router.navigate(['../'], { relativeTo: this.route });

          this.portDetails.datasourceid = res.body.id;
          this.portDetails.organization = res.body.organization;

          this.portPayload = this.portDetails;
          console.log("This is portPayload :", this.portPayload);
          this.Services.addPorts(this.portPayload).subscribe((response) => {
            console.log("This is Port Details Response :", response);
          }
          );


          if (this.data.interfacetype === "adapter") {
            this.Services.message('Adapter created successfully');
          } else {
            this.Services.message('Connection created successfully');
          }
          if (this.router.url.includes('initiative')) {
            this.responseLink.emit(res);
            this.raiService.changeModalData(true);
          }
          else {
            this.router.navigate(['../'], { relativeTo: this.route });

          }
        },
          error => {
            if (this.data.interfacetype === "adapter") {
              this.Services.message('Error! Adapter not created due to: ' + JSON.stringify(error),'error');
            } else {
              this.Services.message('Error! Connection not created due to: ' + JSON.stringify(error),'error');
            }
          });
      }
    }
  }
  showData(event) {
    this.data = event;

  }
  getdatasourceTypes() {
    try {
      let size = 0;
      this.Services.getPluginsLength().
        subscribe(
          response => {
            let s = new Number(response)
            size = s.valueOf()
            // size = response
          }, err => { this.Services.message("Unable to fetch Connection types",'error' ) },
          () => {
            //console.log("Modal-config")
            this.Services.getDatasourceJson(0, size)
              .subscribe(res => {
                this.datasourceTypes = res;
                this.uischema = res[0].uischema;
                this.attributes = res[0].attributes;
                this.datasourceTypes.sort((a, b) => a.type.toLowerCase() < b.type.toLowerCase() ? -1 : 1);
                this.datasourceTypes.forEach((opt) => {
                  let val = { viewValue: opt.type, value: opt.type };
                  this.typeOptions.push(val)
                })
                if (!this.data.id) {
                  this.type = this.matData.group != 'NA' ? this.matData.group : 'SQL'
                  this.sourceType = this.datasourceTypes.filter(row => row.type === this.type)[0];
                  this.category = this.sourceType?.category;
                } else {
                  this.type = this.data.type;
                  this.category = this.data.category;
                  this.sourceType['category'] = this.data.category;
                  this.sourceType['type'] = this.type;
                  this.sourceType['attributes'] = JSON.parse(this.data.connectionDetails);
                }
                if (this.sourceType?.attributes)
                  Object.keys(this.sourceType.attributes).forEach(keyValue => {
                    this.keys.push(keyValue);
                  });
              }, error => {
                this.Services.message("Unable to fetch Connection types ","error")
              });
          });
    }
    catch (Exception) {
      this.Services.message("Some error occured", "error")
    }
  }

  onTypeChange(event: any) {
    console.log('event', event);
    if (event == 'GIT') this.isGithub = true;
    else this.isGithub = true;

    this.keys = [];
    this.sourceType = this.datasourceTypes.filter(row => row.type === event.value)[0];
    this.category = this.sourceType?.category;
    if (this.sourceType?.attributes)
      Object.keys(this.sourceType.attributes).forEach(keyValue => {
        this.keys.push(keyValue);
      });
    if (this.sourceType.type == 'AWSBedrock') {

    }
  }
  onCapbilityTypeChange(event) {
    this.data.fordataset = false;
    this.data.foradapter = false;
    this.data.forruntime = false;
    this.data.formodel = false;
    this.data.forpromptprovider = false;
    this.data.forendpoint = false;
    this.data.app = false;
    event.value.forEach(cap => {
      if (cap === "dataset") {
        this.data.fordataset = true;
      } else if (cap === "adapter") {
        this.data.foradapter = true;
      } else if (cap === "runtime") {
        this.data.forruntime = true;
      } else if (cap === "formodel") {
        this.data.formodel = true;
      } else if (cap === "promptprovider") {
        this.data.forpromptprovider = true;
      } else if (cap === "endpoint") {
        this.data.forendpoint = true;

      } else if (cap === "app") {
        this.data.forapp = true;
      }
    })
  }

  makeRandom(lengthOfCode: number, possible: string) {
    let text = "";
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(Math.floor((window.crypto.getRandomValues(new Uint32Array(1))[0] /
        (0xffffffff + 1)) * possible.length));
    }
    return text;
  }
  getApiSpecTemplate(value) {
    this.apiSpecTemplate = value
    this.apispec = JSON.parse(value);
  }

  fetchGroups() {
    this.Services.getDatasourceGroups(0, 12).subscribe((res) => {
      this.groups = res;
      this.groups.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
    })
  }

  selectedz(data) {
    try {
      return JSON.stringify(data);
    }
    catch (Exception) {
      this.Services.message("Some error occured", "error")
    }

  }

  omit_special_char(event) {
    var k = event.charCode
    return this.isValidLetter(k);
  }

  isValidLetter(k) {
    return ((k >= 65 && k <= 90) || (k >= 97 && k <= 122) || (k >= 48 && k <= 57) || [8, 9, 13, 16, 17, 20, 95].indexOf(k) > -1)
  }

  isWordValid(word) {
    word = word.toString()

    if (this.allDatasources.includes(word))
      return false
    return true
  }

  onPasswordChange() {
    this.sourceType.attributes.password = this.keypass;
    if (this.editCanvas) {
      this.editCanvas.connectionDetails = this.sourceType?.attributes && JSON.stringify(this.sourceType.attributes);
    }

  }

  getConnectionDetails(connectionDetails) {
    this.connectionDetails = connectionDetails;
    this.isCdFull = true;
  }
  getPortDetails(port: any) {
    this.portDetails = { ...port };
  }

  closeModal() {
    //this.dialogRef.close();
  }

shouldShowCustomIcon(): boolean {
  // Check if the CSS pseudo-element is applying
  const selectElement = document.querySelector('.mat-mdc-select-trigger');
  if (selectElement) {
    const computedStyle = window.getComputedStyle(selectElement, '::after');
    const content = computedStyle.getPropertyValue('content');
    // If content is not 'none' or empty, CSS is applying
    return content === 'none' || content === '' || content === 'normal';
  }
  return true; // Default to showing custom icon
}

ngAfterViewInit() {
  // Check after view initialization
  setTimeout(() => {
    const selectElement = document.querySelector('.mat-mdc-select-trigger');
    if (selectElement) {
      const computedStyle = window.getComputedStyle(selectElement, '::after');
      const content = computedStyle.getPropertyValue('content');
      this.showCustomIcon = content === 'none' || content === '' || content === 'normal';
    }
  }, 100);
}

}
