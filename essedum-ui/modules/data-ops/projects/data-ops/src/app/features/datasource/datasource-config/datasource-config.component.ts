import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Services, EventBusService } from '@essedum/shared-lib';
import { ActivatedRoute, Router } from '@angular/router';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import { LocationStrategy } from '@angular/common';
import { Location } from '@angular/common';
import { RaiservicesService } from '../../services/raiservices.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
    selector: 'app-datasource-config',
    templateUrl: './datasource-config.component.html',
    styleUrls: ['./datasource-config.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
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

  // Approval flow
  currentUserLogin: string = '';
  selectedProjectId: number | null = null;

  constructor(
    private Services: Services,
    private route: ActivatedRoute,
    private router: Router,
    private location: LocationStrategy,
    private _location: Location,
    private raiService: RaiservicesService,
    private eventBus: EventBusService,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.resolveUserContext();
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
        // Check if error has the new format with error and details
        if (error?.error?.details) {
          this.Services.message(error.error.details, 'error');
        } else if (error?.error?.message) {
          this.Services.message(error.error.message, 'error');
        }
      }
    );
  }
  validatePorts(validatePort: any) {
    this.Services.validatePorts(validatePort).subscribe((response) => {
      if (response.body.available_ports.length) {
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
      this.data.organization = sessionStorage.getItem("organization");
      this.Services.createDatasource(this.data).subscribe((res) => {
        // Cross-MFE event: integration/agent MFEs subscribe to refresh their connection pickers.
        this.eventBus.emit({ type: 'CONNECTION_CREATED', payload: { id: res?.id ?? this.data.name, name: this.data.name } });
        this.Services.message('Connection created successfully ');
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
            // Check if error has the new format with error and details
            if (error?.error?.details) {
              this.Services.message(error.error.details, 'error');
            } else if (error?.error?.message) {
              this.Services.message(error.error.message, 'error');
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
          this.Services.addPorts(this.portPayload).subscribe((response) => {
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
            // Check if error has the new format with error and details
            if (error?.error?.details) {
              this.Services.message(error.error.details, 'error');
            } else if (error?.error?.message) {
              this.Services.message(error.error.message, 'error');
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
      // The backend ignores page/size for connection types and returns the full plugin list,
      // so fetch it directly rather than gating on the separate length call.
      this.Services.getDatasourceJson(0, 100)
        .subscribe(res => {
          this.datasourceTypes = Array.isArray(res) ? res : [];
          this.uischema = this.datasourceTypes[0]?.uischema;
          this.attributes = this.datasourceTypes[0]?.attributes;
          this.datasourceTypes.sort((a, b) => a.type.toLowerCase() < b.type.toLowerCase() ? -1 : 1);
          this.typeOptions = this.datasourceTypes.map(opt => ({ viewValue: opt.type, value: opt.type }));
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
          this.Services.message("Unable to fetch Connection types ", "error")
        });
    }
    catch (Exception) {
      this.Services.message("Some error occured", "error")
    }
  }

  onTypeChange(event: any) {
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

  /**
   * Generates a cryptographically secure random string without bias.
   * Uses rejection sampling to avoid statistical bias in random character selection.
   * @param lengthOfCode - The length of the random string to generate
   * @param possible - The character set to use for generation
   * @returns A cryptographically secure random string
   */
  makeRandom(lengthOfCode: number, possible: string): string {
    let text = "";
    for (let i = 0; i < lengthOfCode; i++) {
      text += this.getSecureRandomChar(possible);
    }
    return text;
  }

  /**
   * Securely selects a random character from a charset using rejection sampling.
   * This avoids bias that would be introduced by simple division and modulo operations.
   * @param charset - The character set to select from
   * @returns A randomly selected character
   */
  private getSecureRandomChar(charset: string): string {
    const randomBuffer = new Uint32Array(1);
    const maxValue = charset.length;
    // Calculate limit to avoid bias: largest multiple of maxValue that fits in 32 bits
    const limit = Math.floor(0x100000000 / maxValue) * maxValue;
    
    let randomValue: number;
    do {
      window.crypto.getRandomValues(randomBuffer);
      randomValue = randomBuffer[0];
    } while (randomValue >= limit); // Reject values that would introduce bias
    
    return charset.charAt(randomValue % maxValue);
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
  setTimeout(() => {
    const selectElement = document.querySelector('.mat-mdc-select-trigger');
    if (selectElement) {
      const computedStyle = window.getComputedStyle(selectElement, '::after');
      const content = computedStyle.getPropertyValue('content');
      this.showCustomIcon = content === 'none' || content === '' || content === 'normal';
    }
  }, 100);
}

  // ── Approval flow ────────────────────────────────────────────────────────

  private resolveUserContext(): void {
    try {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      const role = JSON.parse(sessionStorage.getItem('role') || '{}');
      const rawLogin = (user?.user_login || user?.username || user?.name || '').toLowerCase();
      const email = (user?.user_email || rawLogin).toLowerCase();
      const emailPrefix = email.includes('@') ? email.split('@')[0] : email;
      this.currentUserLogin = rawLogin.includes('@') ? rawLogin.split('@')[0] : (rawLogin || emailPrefix);
      try {
        const projectObj = JSON.parse(sessionStorage.getItem('project') || '{}');
        this.selectedProjectId = projectObj?.id || Number(sessionStorage.getItem('projectId')) || null;
      } catch { }
    } catch { }
  }

  isOwnConnection(): boolean {
    if (!this.currentUserLogin || !this.data) return false;
    const cb = (this.data.created_by || this.data.lastmodifiedby || '').toLowerCase();
    return cb === this.currentUserLogin || cb.startsWith(this.currentUserLogin + '@');
  }

  getApprovalStatus(): string {
    // Empty until loaded, otherwise an unloaded connection renders as a false DRAFT.
    if (!this.data?.id) return '';
    // /service/v1/fetchDatasource serializes camelCase, the datasource APIs use snake_case.
    return this.data.approval_status || this.data.approvalStatus || 'DRAFT';
  }

  hasApprovalStatus(): boolean {
    return !!this.getApprovalStatus();
  }

  getApprovalStatusLabel(): string {
    const labels: Record<string, string> = {
      DRAFT: 'Draft',
      PENDING_PROJECT_APPROVAL: 'Pending Project Approval',
      PROJECT_APPROVED: 'Project Approved',
      PROJECT_REJECTED: 'Project Rejected',
      PENDING_ORG_APPROVAL: 'Pending Org Approval',
      ORG_APPROVED: 'Org Approved',
      ORG_REJECTED: 'Org Rejected',
      PENDING_PLATFORM_APPROVAL: 'Pending Platform Approval',
      PLATFORM_REJECTED: 'Platform Rejected',
      PUBLISHED: 'Published',
    };
    return labels[this.getApprovalStatus()] || this.getApprovalStatus();
  }

  getApprovalStatusClass(): string {
    const classes: Record<string, string> = {
      DRAFT: 'draft',
      PENDING_PROJECT_APPROVAL: 'pending',
      PROJECT_APPROVED: 'project-approved',
      PROJECT_REJECTED: 'rejected',
      PENDING_ORG_APPROVAL: 'pending',
      ORG_APPROVED: 'org-approved',
      ORG_REJECTED: 'rejected',
      PENDING_PLATFORM_APPROVAL: 'pending',
      PLATFORM_REJECTED: 'rejected',
      PUBLISHED: 'published',
    };
    return classes[this.getApprovalStatus()] || 'draft';
  }

  showSubmitButton(): boolean {
    const status = this.getApprovalStatus();
    return status === 'DRAFT' || status === 'PROJECT_REJECTED';
  }

  submitForApproval(): void {
    if (!this.selectedProjectId) {
      this.Services.message('No project selected', 'error');
      return;
    }
    this.http.post(
      `/api/aip/datasources/approval/project/submit`,
      { resourceId: this.data.id, projectId: this.selectedProjectId },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }), observe: 'response' }
    ).subscribe({
      next: () => {
        this.Services.message('Connection submitted for approval');
        this.data.approval_status = 'PENDING_PROJECT_APPROVAL';
        this.data.approvalStatus = 'PENDING_PROJECT_APPROVAL';
      },
      error: err => this.Services.message(err?.error?.message || 'Failed to submit for approval', 'error'),
    });
  }

}
