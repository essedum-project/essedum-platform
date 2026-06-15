import {
  Component,
  OnInit,
  Input,
  Inject,
  OnChanges,
  EventEmitter,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';
import * as FileSaver from 'file-saver';
import { MatDialog } from '@angular/material/dialog';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Services, StreamingServices, OptionsDTO } from '@essedum/shared-lib';
import { NativeScriptDialogComponent } from './native-script-dialog/native-script-dialog.component';
import { PipelineCreateComponent } from '../pipeline/pipeline-create/pipeline-create.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { DynamicParamsGrid, DynamicSecretsGrid } from './pipeline.models';
import { NotebookDialogComponent, NotebookDialogData } from '../pipeline.description/notebook-dialog/notebook-dialog.component';

interface FileNode {
  name: string;
  extension: string;
  selected?: boolean;
  children?: FileNode[];
}

interface Elementt {
  name: string;
  value: string;
  type: string;
  alias: string;
  children?: Elementt[];
  index: string;
}

@Component({
  selector: 'app-native-script',
  templateUrl: './native-script.component.html',
  styleUrls: ['./native-script.component.scss'],
})
export class NativeScriptComponent implements OnInit, OnChanges {
  @Input() initiativeData: any;
  @Input() streamItem: StreamingServices;
  @Input() cardTitle: String = 'Pipeline';
  @Input() cardToggled: boolean = false;
  @Input() pipelineAlias: String;
  @Input() card: any;
  @Output() newItemEvent = new EventEmitter<boolean>();
  uploader: FileUploader;
  cardName: any;
  uploadingCounter = 0;
  uploadingError = false;
  data: any = {
    filetype: 'Python3',
    files: [],
    arguments: [],
    dataset: [],
  };
  choosenFile = '';
  filetypes: any[] = [
    { viewValue: 'Python2', value: 'Python2' },
    { viewValue: 'Python3', value: 'Python3' },
    { viewValue: 'JavaScript', value: 'JavaScript' },
    { viewValue: 'Jython', value: 'Jython' },
  ];
  script: any[] = [];
  lang: string;
  loadScript: boolean = false;
  isAuth: boolean = true;
  addTags: string = 'Add Tags to Pipeline';
  entity: string = 'pipeline';
  tooltipPoition: string = 'above';
  permissionList;
  relatedloaded = false;
  isExpand: boolean = true;
  component: any = [];
  linkAuth: boolean;
  relatedComponent: any;
  isAuthRun: boolean = true;
  treeData: Elementt[] = [];
  dataSource = new MatTreeNestedDataSource<Elementt>();
  dataSet = new MatTreeNestedDataSource<Elementt>();
  treeControl = new NestedTreeControl<Elementt>((node) => node.children);
  
  // File structure properties for the new panel
  fileStructure: FileNode[] = [];
  selectedFileNode: FileNode | null = null;
  fileTreeControl = new NestedTreeControl<FileNode>(node => node.children);
  fileTreeDataSource = new MatTreeNestedDataSource<FileNode>();
  scriptsObj: any;
  fileExtension: string = 'py';
  scriptSelected: string;
  runTypes: OptionsDTO[] = [];
  selectedRunType: any;
  selectedDatasource: string = '';
  runtypesCheck: boolean = true;
  organisation: any;
  initiativeView: boolean;
  inGroupedJob: boolean;
  environment: any;
  dynamicEnvArray: Array<DynamicParamsGrid> = [];
  envModified = false;
    secrets: any;
  dynamicSecretsArray: Array<DynamicSecretsGrid> = [];
  secretsModified = false;
    defaultRuntime: any;
    isHovered=false;
    isHoveredSave=false;
    isHoveredRun=false;
    isHoveredTag=false;
    defaultRuntimeFromDB: any;
    isBackHovered=false;
    envCollapsed = true;
    secretsCollapsed = true;
    envEditIndex: number = -1;
    envEditMode: boolean = false;
    secretsEditIndex: number = -1;
    secretsEditMode: boolean = false;
    secretsShowValue: boolean[] = [];
    private _saveDebounceTimer: any = null;
  constructor(
    @Inject('envi') private baseUrl: string,
    private service: Services,
    public dialog: MatDialog,
    private _location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef 
  ) 
 
  {
    this.route.queryParams.subscribe((params) => {
      if (params['org']) {
        this.organisation = params['org'];
      } else {
        this.organisation = sessionStorage.getItem('organization');
      }
    });
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params['cname']) {
        this.cardName = params['cname'];
      } else {
        this.cardName = this.streamItem.name;
      }
    });
    if (this.router.url.includes('chains')) {
      this.inGroupedJob = true;
    } else {
      this.inGroupedJob = false;
    }
    if (this.router.url.includes('initiative')) {
      this.initiativeView = false;
      this.cardName = this.initiativeData.name;
    } else {
      this.initiativeView = true;
    }

    this.getStreamService();
    this.getPipelineByName();
    this.authentications();
  }
  getStreamService() {
    this.service.getStreamingServicesByName(this.cardName).subscribe((res) => {
      this.streamItem = res;
      this.pipelineAlias = res.alias;
      
      // Load files for code explorer
      // Files will be loaded after data is parsed in try block below

      if (this.router.url.includes('preview')) {
        this.pipelineAlias = this.streamItem.alias;
      }
      this.uploader = new FileUploader({
        url:
          this.baseUrl +
          '/file/pipeline/native/upload/' +
          this.streamItem.name +
          '/' +
          this.streamItem.organization,
      });
      try {
        if (this.runtypesCheck == true) this.fetchRunTypes();
        if (this.router.url.includes('native')) {
          this.data = JSON.parse(
            this.streamItem.jsonContent
          ).elements[0].attributes;
          this.dynamicEnvArray=JSON.parse(this.streamItem.jsonContent).environment;
    if (this.dynamicEnvArray?.length) {
      this.envCollapsed = false;
    }

        } else {
          if (this.streamItem.json_content) {
            this.dynamicEnvArray = JSON.parse(this.streamItem.json_content).environment;
            this.defaultRuntimeFromDB = JSON.parse(this.streamItem.json_content).default_runtime;
            this.selectedRunType = this.defaultRuntimeFromDB;
          }
          this.data = JSON.parse(
            this.streamItem.json_content
          ).elements[0].attributes;
          this.dynamicEnvArray=JSON.parse(this.streamItem.json_content).environment;
    if (this.dynamicEnvArray?.length) {
      this.envCollapsed = false;
    }

        }
        if (this.data.dataset) {
          this.data.dataset.forEach((data) => {
            if (data.datasource) {
              this.service
                .getDatasource(data.datasource.name)
                .subscribe((resp) => {
                  data.datasource = resp;
                });
            }
          });
        }
        if (this.data.filetype == 'Python') {
          this.data.filetype = 'Python3';
        }
        if (this.data.filetype) {
          this.changeLang(this.data.filetype);
        }
        if (this.data.arguments) {
          this.treeData = this.data.arguments;
        }
        if (this.data.dataset) {
          this.dataSet.data = this.data.dataset;
        }
        if (this.data.arguments) {
          this.refreshTree();
        }
        if (this.data.files && this.data.files.length > 0) {
          // Don't read files here - let buildFileStructure handle it
          // this.readFile(this.data.files[0]);
        }
        if(this.data.usedSecrets){
          this.dynamicSecretsArray=this.data.usedSecrets;
          if (this.dynamicSecretsArray?.length) { this.secretsCollapsed = false; }
          this.secretsShowValue = this.dynamicSecretsArray.map(() => false);
        }
        if(this.data.files==null || this.data.files==undefined){
          this.data['files'] = [];
          this.loadScript = true;
        }        
        this.buildFileStructure();
     
      } catch (e) {
        this.loadScript = true;
        console.error('no attribute found in json[element0]');
      }
      this.uploader.onErrorItem = (item, response, status, headers) =>
        this.onErrorItem(item, response, status, headers);
      this.uploader.onSuccessItem = (item, response, status, headers) =>
        this.onSuccessItem(item, response, status, headers);
      this.getRelatedComponent();

      this.linkAuth = true;
    });
  }
  getRelatedComponent() {
    this.component = [];
    this.service
      .getRelatedComponent(this.streamItem.cid, 'PIPELINE')
      .subscribe({
        next: (res) => {
          this.relatedComponent = res[0];
          this.relatedComponent.data = JSON.parse(this.relatedComponent.data);
          this.component.push(this.relatedComponent);
          this.cdr.detectChanges();


        },
        complete() {
        },
        error: (err) => {
        },
      });
  }
  refeshrelated(event: any) {
    if (event == true) {
      this.relatedloaded = false;
      setTimeout(() => {
        this.getRelatedComponent();
      }, 2000);
    }
  }
  expandCollapse() {
    this.isExpand = !this.isExpand;
  }

  getPipelineByName() {
    let params: HttpParams = new HttpParams();
    params = params.set('name', this.cardName);
    params = params.set('org', this.organisation);
    this.service.getPipelineByName(params).subscribe((res) => {
      this.cardTitle = 'Pipeline';
      this.card = res[0];
    });
  }
  authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      if (cipAuthority.includes('pipeline-edit')) this.isAuth = false;
      if (cipAuthority.includes('pipeline-run')) this.isAuthRun = false;
    });
  }


  ngOnChanges() {
    this.ngOnInit();
    if (this.runtypesCheck == true) this.fetchRunTypes();
  }

  fetchRunTypes() {
    this.runTypes = [];
    this.service.fetchJobRunTypes().subscribe((resp) => {
      resp.forEach((ele) => {
        this.runTypes.push(new OptionsDTO(ele.type + '-' + ele.dsAlias, ele));
      });
      if (this.data.filetype === 'Jython') {
        this.runTypes.push(
          new OptionsDTO('Local-', { dsAlias: '', dsName: '', type: 'Local' })
        );
      }
      if (!this.defaultRuntimeFromDB) {
        this.selectedRunType = this.runTypes[0].value;
      }
      else {
        if (this.defaultRuntimeFromDB) {
          const matchingOption = this.runTypes.find(
            (option: any) => option.value.dsName === this.defaultRuntimeFromDB.dsName &&
              option.value.type === this.defaultRuntimeFromDB.type
          );

          if (matchingOption) {
            this.selectedRunType = matchingOption.value;
            this.defaultRuntime = matchingOption.value;
          } else {
            this.selectedRunType = this.runTypes[0]?.value;
          }
        } else {
          this.selectedRunType = this.runTypes[0]?.value;
        }
      }
      this.runtypesCheck = false;
    });
  }
  onInputTypeChange(filetype) {
    this.uploader.clearQueue();
    this.changeLang(filetype);
    if (filetype === 'Jython') {
      let index = this.runTypes.findIndex(
        (option) => option.viewValue === 'Local-'
      );
      if (index == -1)
        this.runTypes.push(
          new OptionsDTO('Local-', { dsAlias: '', dsName: '', type: 'Local' })
        );
    } else {
      let index = this.runTypes.findIndex(
        (option) => option.viewValue === 'Local-'
      );
      if (index > -1) this.runTypes.splice(index, 1);
    }
  }

  runTypeChanged($event) {
    this.defaultRuntime = $event;
    const data = this.runTypes.find(option => option.value === this.defaultRuntime);
    if (data) {
      this.selectedRunType = data.value;
    }
  }

  onSuccessItem(
    item: FileItem,
    response: string,
    status: number,
    headers: ParsedResponseHeaders
  ): any {
    this.data.files.push(response);
    this.uploadingCounter++;
    if (this.uploadingCounter == this.uploader.queue.length) {
      this.service.message('Uploaded Successfully', 'success');
      this.uploader.clearQueue();
      this.readFile(response);
    }
  }

  onErrorItem(
    item: FileItem,
    response: string,
    status: number,
    headers: ParsedResponseHeaders
  ): any {
    const error = response;
    this.service.message('Error! while uploading file', 'error');
    this.uploadingError = true;
  }

  readFile(filename: string, retryCount = 0) {
    if (!filename || !this.streamItem?.name || !this.streamItem?.organization) {
      console.error('Missing required parameters for readFile:', { filename, streamName: this.streamItem?.name, org: this.streamItem?.organization });
      this.service.message('Error: Missing file or stream information', 'error');
      return;
    }
    
    const extension = filename.split('.').pop()?.toLowerCase();
    if (extension !== 'py') {
      this.script = [];
      this.loadScript = true;
      return;
    }
    
    const encodedFilename = encodeURIComponent(filename);
    
    this.service
      .readNativeFile(
        this.streamItem.name,
        this.streamItem.organization,
        encodedFilename
      )
      .subscribe({
        next: (resp) => {
          try {
            const textDecoder = new TextDecoder('utf-8');
            this.script = textDecoder.decode(resp).split('\n');
            this.loadScript = true;
            
            if (this.fileStructure.length > 0) {
              this.fileStructure.forEach(file => {
                file.selected = file.name === filename && file.extension === 'py';
              });
              this.selectedFileNode = this.fileStructure.find(f => f.name === filename && f.extension === 'py') || null;
            }
            
            this.cdr.detectChanges();
          } catch (e) {
            console.error('Error decoding file:', e);
            this.service.message('Error decoding file content', 'error');
            this.script = [];
            this.loadScript = true;
          }
        },
        error: (err) => {
          console.error('readFile failed', filename, 'attempt', retryCount + 1, 'status', err?.status);

          if (retryCount < 3) {
            setTimeout(() => {
              this.readFile(filename, retryCount + 1);
            }, (retryCount + 1) * 1000);
            return;
          }
          
          let errorMessage = 'Error reading file';
          if (err.status === 404) {
            errorMessage = 'Python file not found. The file may still be processing.';
          } else if (err.status === 400) {
            errorMessage = 'Invalid file request. Please check the file name.';
          } else if (err.status === 500) {
            errorMessage = 'Server error while reading file. Please try again.';
          } else {
            errorMessage += ': ' + (err.message || err.statusText || 'Unknown error');
          }
          
          this.service.message(errorMessage, 'error');
          this.script = [];
          this.loadScript = true;
        },
        complete: () => {
        }
      });
  }
  showDatasets(dataset) {
    
  }

  showInfo(dataset) {

  }

  deleteDataset(dataset) {
    for (var i = 0, j = this.data.dataset.length; i < j; i++) {
      if (this.data.dataset[i] == dataset) {
        this.data.dataset.splice(i, 1);
        break;
      }
    }
    this.saveJson(this.data.name);
  }

  uploads() {
    if (this.uploader.queue.length > 1 || this.data.files.length >= 1) {
      this.service.message(
        'Error! Executable file cannot be more than 1',
        'error'
      );
    } else {
      this.uploadingError = false;
      this.uploadingCounter = 0;
      this.uploader.queue.forEach((element) => {
        this.uploader.uploadItem(element);
      });
    }
  }

  deleteDataFile(file) {
    this.data.files = this.data.files.filter(function (f) {
      return f != file;
    });
    this.script = [];
  }

  downloadFile(filename) {
    this.service
      .downloadNativeFile(
        this.streamItem.name,
        this.streamItem.organization,
        filename
      )
      .subscribe(
        (response) => {
          FileSaver.saveAs(response, filename);
        },
        (error) => {
          this.service.message('Error! While Downloading File', 'error');
        }
      );
  }

  deleteFile(file) {
    this.uploader.queue = this.uploader.queue.filter(function (f) {
      return f != file;
    });
  }

  onScriptChange($event) {
    this.script = $event;
  }

  onLangChange() {
    this.changeLang(this.data.filetype);
  }

  changeLang(type) {
    switch (type) {
      case 'Python2':
      case 'Python3':
      case 'Jython':
        this.lang = 'python';
        break;
      case 'JavaScript':
        this.lang = 'javascript';
        break;
      default:
        this.lang = undefined;
    }
  }

  reload($event: any) {
    if ($event) {
      this.ngOnInit();
    }
  }
  saveJson(pname: string) {
    try {
      if (!this.data.files) {
        this.data.files = [];
      }

      let targetFileName: string;      
      if (this.selectedFileNode && this.selectedFileNode.extension === 'py') {
        targetFileName = this.selectedFileNode.name;
      } else {
        targetFileName = `${pname}_${this.streamItem.organization}.py`;
      }
      
      let scriptContent = this.script.join('\n');
      
      this.service
        .createNativeFile(
          pname,
          this.streamItem.organization,
          targetFileName,
          this.data.filetype,
          scriptContent
        )
        .subscribe({
          next: (response) => {
            this.streamItem.name = pname;
            let fileExists = false;
            if (Array.isArray(this.data.files)) {
              for (let i = 0; i < this.data.files.length; i++) {
                let fileEntry = this.data.files[i];
                if (typeof fileEntry === 'string') {
                  if (fileEntry.includes(targetFileName)) {
                    this.data.files[i] = response;
                    fileExists = true;
                    break;
                  }
                }
              }
            }
            
            if (!fileExists) {
              this.data.files.push(response);
            }
            
            this.data.arguments = this.treeData;
            this.data.usedSecrets = this.dynamicSecretsArray;            
            this.streamItem.json_content = JSON.stringify({
              elements: [{ attributes: this.data }],
              environment: this.dynamicEnvArray,
              default_runtime: this.selectedRunType
            });
            
            this.service.update(this.streamItem).subscribe({
              next: (updateResponse) => {
                this.service.message('Pipeline saved successfully', 'success');
                this.buildFileStructureFromCurrentData();
                setTimeout(() => {
                  this.refreshFileStructureAfterSave();
                }, 2000);
              },
              error: (error) => {
                console.error('Error updating streamItem:', error);
                this.service.message(
                  'Pipeline saved but failed to update metadata: ' + error,
                  'warning'
                );
                this.buildFileStructureFromCurrentData();
              }
            });
          },
          error: (error) => {
            console.error('Error creating native file:', error);
            this.service.message('Error saving pipeline: ' + error, 'error');
          }
        });
    } catch (Exception) {
      console.error('Exception in saveJson:', Exception);
      this.service.message('Error occurred while saving', 'error');
    }
  }

  runPipeline() {
    this.saveJson(this.streamItem.name);
    this.service
      .runPipeline(
        this.streamItem.alias ? this.streamItem.alias : this.streamItem.name,
        this.streamItem.name,
        'NativeScript',
        this.selectedRunType['type'],
        this.selectedRunType['dsName']
      )
      .subscribe(
        (pageResponse) => {
          if (this.data.files && this.data.files.length > 0)
            this.service.message('Pipeline has been Started!', 'success');
          else
            this.service.message(
              'Pipeline has been Started with empty script!',
              'success'
            );
        },
        (error) => {
          this.service.message('Could not get the results', 'error');
        }
      );
  }

  copyPipeline() {
    const dialogRef = this.dialog.open(PipelineCreateComponent, {
      width: '460px',
      maxWidth: '92vw',
      data: {
        sourceToCopy: this.data,
        type: this.streamItem.type,
        interfacetype: this.streamItem.interfacetype,
        copy: true,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.copyPipelineJson(result);
    });
  }

  displayDialog(button, name, value, type, index, alias) {
    const dialogRef = this.dialog.open(NativeScriptDialogComponent, {
      width: '480px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'argument-dialog-panel',
      data: {
        button: button,
        name: name,
        value: value,
        type: type,
        index: index,
        alias: alias,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result != undefined) {
        if (button == 'ADD') {
          this.addElementInTree(
            result.index,
            result.name,
            result.value,
            result.type,
            result.alias
          );
        } else {
          if (button == 'MODIFY') {
            this.modifyNode(
              result.index,
              result.name,
              result.value,
              result.type,
              result.alias
            );
          }
        }
        this.refreshTree();
      }
    });
  }
 

  deleteAll() {
    this.treeData = [];
    this.refreshTree();
  }

  deleteNode(index) {
    this.treeData = this.deleteNodeInTree(
      this.treeData,
      this.returnTreeElement(this.treeData, index)
    );
    this.refreshTree();
  }

  modifyNode(index, key, value, type, alias) {
    this.treeData = this.modifyElementInTree(
      this.treeData,
      this.returnTreeElement(this.treeData, index),
      key,
      value,
      type,
      alias
    );
    this.refreshTree();
  }

  refreshTree() {
    this.dataSource.data = null;
    this.dataSource.data = this.treeData;
  }

  returnTreeElement(tree: Elementt[], index): Elementt {
    for (var i = 0, j = tree.length; i < j; i++) {
      if (tree[i].index == index) {
        return tree[i];
      }
    }
    return null;
  }

  deleteNodeInTree(tree: Elementt[], element: Elementt) {
    for (var i = 0, j = tree.length; i < j; i++) {
      if (tree[i] == element) {
        tree.splice(i, 1);
        break;
      }
    }
    return tree;
  }

  modifyElementInTree(tree: Elementt[], element, name, value, type, alias) {
    for (var i = 0, j = tree.length; i < j; i++) {
      if (tree[i] == element) {
        tree[i].name = name;
        tree[i].value = value;
        tree[i].type = type;
        tree[i].alias = alias;
        break;
      }
    }
    return tree;
  }

  addElementInTree(index, name, value, type, alias): string {
    var newNode: Elementt = {
      name: name,
      value: value,
      type: type,
      alias: alias,
      index: '' + (this.treeData.length > 0 ? this.treeData.length + 1 : 1),
    };
    this.treeData.push(newNode);
    return newNode.index;
  }

  getAlias(node) {
    return node.alias ? node.alias : node.value;
  }

  navigateBack() {
    this._location.back();
  }
  openModal(content: any): void {
    this.dialog.open(content, {
      width: '500px',
    });
    this.getRelatedComponent();
  }

  addEnvVar() {
    if (this.isAuth) { return; }
    // If already editing a row, don't add another blank one
    if (this.envEditMode) { return; }
    if (!this.dynamicEnvArray) { this.dynamicEnvArray = []; }
    this.dynamicEnvArray.push({ name: '', value: '' });
    this.envEditIndex = this.dynamicEnvArray.length - 1;
    this.envEditMode = true;
    this.envCollapsed = false;
  }

  editEnvVar(i: number) {
    if (this.isAuth) { return; }
    this.envEditIndex = i;
    this.envEditMode = true;
  }

  saveEnvVar(i: number) {
    this.envEditMode = false;
    this.envEditIndex = -1;
    this.saveEnvAndSecrets();
  }

  deleteEnvVar(i: number) {
    if (this.isAuth) { return; }
    this.dynamicEnvArray.splice(i, 1);
    this.saveEnvAndSecrets();
  }

  onEnvDataChange($event) {
    this.environment = $event;
    this.dynamicEnvArray = $event;
    this.envModified = true;
    if (this.dynamicEnvArray?.length) { this.envCollapsed = false; }
  }

  onSecretsDataChange($event) {
    this.secrets = $event;
    this.dynamicSecretsArray = $event;
    this.secretsModified = true;
    if (this.dynamicSecretsArray?.length) { this.secretsCollapsed = false; }
    this.secretsShowValue = this.dynamicSecretsArray.map(() => false);
    this.saveEnvAndSecrets();
  }

  addSecret(): void {
    if (this.secretsEditMode) { return; }
    if (!this.dynamicSecretsArray) { this.dynamicSecretsArray = []; }
    this.dynamicSecretsArray.push({ name: '', value: '' });
    this.secretsShowValue.push(false);
    this.secretsEditIndex = this.dynamicSecretsArray.length - 1;
    this.secretsEditMode = true;
    this.secretsCollapsed = false;
  }

  editSecret(i: number): void {
    this.secretsEditIndex = i;
    this.secretsEditMode = true;
  }

  saveSecret(i: number): void {
    this.secretsEditMode = false;
    this.secretsEditIndex = -1;
    this.saveEnvAndSecrets();
  }

  deleteSecret(i: number): void {
    this.dynamicSecretsArray.splice(i, 1);
    this.secretsShowValue.splice(i, 1);
    this.secretsEditMode = false;
    this.secretsEditIndex = -1;
    this.saveEnvAndSecrets();
  }

  toggleSecretVisibility(i: number): void {
    this.secretsShowValue[i] = !this.secretsShowValue[i];
  }

  saveEnvAndSecrets() {
    // Debounce: collapse multiple rapid calls into a single API request
    if (this._saveDebounceTimer) { clearTimeout(this._saveDebounceTimer); }
    this._saveDebounceTimer = setTimeout(() => {
      this._saveDebounceTimer = null;
      try {
        if (!this.streamItem) { return; }
        const current = this.streamItem.json_content
          ? JSON.parse(this.streamItem.json_content)
          : { elements: [{ attributes: this.data || {} }] };
        current.environment = this.dynamicEnvArray || [];
        if (current.elements?.[0]?.attributes) {
          current.elements[0].attributes.usedSecrets = this.dynamicSecretsArray || [];
        }
        current.default_runtime = this.selectedRunType;
        this.streamItem.json_content = JSON.stringify(current);
        this.service.update(this.streamItem).subscribe({
          next: () => {
            this.service.message('Configuration saved', 'success');
          },
          error: (err) => {
            console.error('Failed to save env/secrets:', err);
            this.service.message('Failed to save configuration', 'error');
          }
        });
      } catch (e) {
        console.error('saveEnvAndSecrets error:', e);
      }
    }, 300);
  }

  // File structure methods
  buildFileStructureFromCurrentData() {
    this.fileStructure = [];
    
    if (this.data && this.data.files && Array.isArray(this.data.files) && this.data.files.length > 0) {
      this.data.files.forEach((fileEntry: any) => {
        
        let fileNames: string[] = [];
        
        if (typeof fileEntry === 'string') {
          if (fileEntry.startsWith('[') && fileEntry.endsWith(']')) {
            try {
              const parsedArray = JSON.parse(fileEntry);
              if (Array.isArray(parsedArray)) {
                fileNames = parsedArray.filter(name => typeof name === 'string' && name.trim().length > 0);
              } else {
                fileNames = [fileEntry.trim()];
              }
            } catch (e) {
              console.warn('Failed to parse bracket format, treating as single file:', fileEntry);
              const cleanEntry = fileEntry.slice(1, -1);
              fileNames = cleanEntry.split(',').map(f => f.trim().replace(/"/g, '')).filter(f => f.length > 0);
            }
          } else if (fileEntry.includes(',')) {
            fileNames = fileEntry.split(',').map(f => f.trim().replace(/"/g, '')).filter(f => f.length > 0);
          } else {
            fileNames = [fileEntry.trim()];
          }
        } else if (Array.isArray(fileEntry)) {
          fileNames = fileEntry.filter(name => typeof name === 'string' && name.trim().length > 0);
        }
        
        fileNames.forEach((fileName: string) => {
          if (fileName && fileName.trim().length > 0) {
            const cleanFileName = fileName.trim();
            const extension = cleanFileName.split('.').pop()?.toLowerCase();
            
            if (extension === 'py' || extension === 'ipynb') {
              const existingFile = this.fileStructure.find(f => f.name === cleanFileName);
              if (!existingFile) {
                this.fileStructure.push({
                  name: cleanFileName,
                  extension: extension,
                  selected: extension === 'py' 
                });
              }
            }
          }
        });
      });
      
      this.fileTreeDataSource.data = this.fileStructure;      
      this.loadScript = true;      
      const pythonFile = this.fileStructure.find(f => f.extension === 'py' && f.selected);
      if (pythonFile) {
        this.selectedFileNode = pythonFile;
      }
      
      this.cdr.detectChanges();
    } else {
      this.loadScript = true;
    }
  }

  buildFileStructure() {
    this.fileStructure = [];
    
    if (this.streamItem && this.streamItem.json_content) {
      try {
        const jsonContent = JSON.parse(this.streamItem.json_content);
        const files = jsonContent.elements[0]?.attributes?.files;
        
        if (files && Array.isArray(files) && files.length > 0) {
          files.forEach((fileEntry: any, index: number) => {
            let fileNames: string[] = [];
            
            // Handle different formats of file entries
            if (typeof fileEntry === 'string') {
              if (fileEntry.startsWith('[') && fileEntry.endsWith(']')) {
                try {
                  const parsedArray = JSON.parse(fileEntry);
                  if (Array.isArray(parsedArray)) {
                    fileNames = parsedArray.filter(name => typeof name === 'string' && name.trim().length > 0);
                  } else {
                    fileNames = [fileEntry.trim()];
                  }
                } catch (e) {
                  console.warn('Failed to parse as JSON, trying manual parsing:', e);
                  const cleanEntry = fileEntry.slice(1, -1); 
                  fileNames = cleanEntry.split(',').map(f => f.trim().replace(/[\"\']/g, '')).filter(f => f.length > 0);
                }
              } else if (fileEntry.includes(',')) {
                fileNames = fileEntry.split(',').map(f => f.trim()).filter(f => f.length > 0);
              } else {
                fileNames = [fileEntry.trim()];
              }
            } else if (Array.isArray(fileEntry)) {
              fileNames = fileEntry.filter(name => typeof name === 'string' && name.trim().length > 0);
            } else {
              console.warn('File entry is neither string nor array:', fileEntry);
              return; 
            }
            
            fileNames.forEach((fileName: string) => {
              if (fileName && fileName.length > 0) {
                const cleanFileName = fileName.trim();
                const extension = cleanFileName.split('.').pop()?.toLowerCase();
                
                if (extension === 'py' || extension === 'ipynb') {
                  const existingFile = this.fileStructure.find(f => f.name === cleanFileName);
                  if (!existingFile) {
                    this.fileStructure.push({
                      name: cleanFileName,
                      extension: extension,
                      selected: false
                    });
                  }
                }
              }
            });
          });
          
          // Auto-select the first Python file with a delay to ensure backend is ready
          if (this.fileStructure.length > 0) {
            const firstPyFile = this.fileStructure.find(file => file.extension === 'py');
            if (firstPyFile) {
              this.fileStructure.forEach(file => file.selected = false);
              firstPyFile.selected = true;
              this.selectedFileNode = firstPyFile;
              
              if (this.script && this.script.length > 0) {
                this.loadScript = true;
                this.cdr.detectChanges();
              } else {
                setTimeout(() => {
                  this.readFile(firstPyFile.name);
                }, 1000);
              }
            } else {
              this.loadScript = true;
              this.selectedFileNode = null;
            }
          } else {
            this.loadScript = true;
          }
        } else {
          this.loadScript = true;
        }
      } catch (error) {
        console.error('Error parsing json_content:', error);
        this.loadScript = true;
      }
    } else {
      this.loadScript = true;
    }
    
    this.fileTreeDataSource.data = this.fileStructure;
    
    this.cdr.detectChanges();
  }

  onFileNodeSelect(fileNode: FileNode) {
    this.fileStructure.forEach(file => file.selected = false);
    
    fileNode.selected = true;
    this.selectedFileNode = fileNode;
    
    if (fileNode.extension === 'ipynb') {
      this.script = [];
      this.scriptSelected = '';
      this.loadScript = true; 
      this.showNotebookDialog();
    } else if (fileNode.extension === 'py') {
      
      const isCurrentFile = this.data.files && this.data.files.length > 0 && 
        (this.data.files[0] === fileNode.name || 
         (typeof this.data.files[0] === 'string' && this.data.files[0].includes(fileNode.name)));
      const hasContent = this.script && this.script.length > 0;
      
      if (isCurrentFile && hasContent) {
        this.loadScript = true;
        this.cdr.detectChanges();
      } else {
        this.readFile(fileNode.name);
      }
    } else {
      this.script = [];
      this.loadScript = true;
      this.cdr.detectChanges();
    }
  }

  onFileChange(file: string, i: number) {
    this.fileExtension = file.substring(file.lastIndexOf(".") + 1);
    if (this.fileExtension === 'json') {
      this.scriptSelected = JSON.parse(this.scriptsObj.script[i]);
    } else {
      this.scriptSelected = this.scriptsObj.script[i];
      this.script = this.scriptSelected ? this.scriptSelected.split('\n') : [];
    }
  }

  refreshFileStructureAfterSave() {
    if (!this.streamItem?.name) {
      console.error('Cannot refresh: streamItem.name is missing');
      this.buildFileStructureFromCurrentData();
      return;
    }
    
    // Re-fetch the streaming service data to get updated file list
    this.service.getStreamingServicesByName(this.streamItem.name).subscribe({
      next: (serviceData) => {
        if (serviceData && serviceData.json_content) {
          this.streamItem = serviceData;
          
          try {
            const jsonContent = JSON.parse(serviceData.json_content);
            
            if (jsonContent.elements && jsonContent.elements[0]?.attributes) {
              this.data = jsonContent.elements[0].attributes;
              this.dynamicEnvArray = jsonContent.environment || [];
              this.defaultRuntimeFromDB = jsonContent.default_runtime;
              if (!this.selectedRunType) {
                this.selectedRunType = this.defaultRuntimeFromDB;
              }
              
              this.buildFileStructure();
              
            } else {
              console.warn('No attributes found in refreshed data');
              this.buildFileStructureFromCurrentData();
            }
          } catch (error) {
            console.error('Error parsing updated json_content:', error);
            this.service.message('Warning: Could not parse updated file data', 'warning');
            this.buildFileStructureFromCurrentData();
          }
        } else {
          console.warn('No json_content in refreshed service data');
          this.buildFileStructureFromCurrentData();
        }
      },
      error: (error) => {
        console.error('Error refreshing service data:', error);
        this.buildFileStructureFromCurrentData();
      }
    });
  }

  showNotebookDialog() {
    const dialogRef = this.dialog.open(NotebookDialogComponent, {
      width: '400px',
      data: {
        message: 'Please access notebook extension file using essedum plugin in Visual Studio Code.'
      } as NotebookDialogData
    });
  }

  /**
   * Copy pipeline with proper file handling and json_content updates
   * This method ensures:
   *  New file names are generated based on new cname_orgname.py format
   *  Json_content is updated with new file names
   */
  copyPipelineJson(newPipelineData: any) {
    try {
      const newCname = newPipelineData.name;
      const newOrg = newPipelineData.organization;
      const newFileName = `${newCname}_${newOrg}.py`;
      
      if (this.data.files && this.data.files.length > 0) {
        let oldFileName = this.data.files[0];
        
        if (typeof oldFileName === 'string') {
          if (oldFileName.startsWith('[') && oldFileName.endsWith(']')) {
            try {
              const filesArray = JSON.parse(oldFileName);
              if (Array.isArray(filesArray)) {
                oldFileName = filesArray.find((f: string) => f.endsWith('.py')) || filesArray[0];
              }
            } catch (e) {
              console.warn('Failed to parse files array as JSON, trying manual parsing:', e);
              const cleanStr = oldFileName.slice(1, -1); 
              const filesArray = cleanStr.split(',').map(f => f.trim().replace(/["\']/g, ''));
              oldFileName = filesArray.find(f => f.endsWith('.py')) || filesArray[0];
            }
          }
        }
        
        this.service.readNativeFile(
          this.streamItem.name,
          this.streamItem.organization,
          oldFileName
        ).subscribe({
          next: (fileContent) => {
            const textDecoder = new TextDecoder('utf-8');
            const scriptContent = textDecoder.decode(fileContent);
            
            this.service.createNativeFile(
              newCname,
              newOrg,
              newFileName,
              this.data.filetype || 'Python3',
              scriptContent
            ).subscribe({
              next: (createResponse) => {
                const updatedData = { ...this.data };
                updatedData.files = [newFileName];
                
                const updatedJsonContent = {
                  elements: [{ attributes: updatedData }],
                  environment: this.dynamicEnvArray || [],
                  default_runtime: this.selectedRunType
                };
                
                newPipelineData.json_content = JSON.stringify(updatedJsonContent);
                
                this.service.update(newPipelineData).subscribe({
                  next: (updateResponse) => {
                    this.service.message('Pipeline copied successfully', 'success');
                    
                    setTimeout(() => {
                      this._location.back();
                    }, 1500);
                  },
                  error: (updateError) => {
                    console.error('Error updating pipeline:', updateError);
                    this.service.message('Pipeline copied but failed to update: ' + updateError, 'error');
                  }
                });
              },
              error: (createError) => {
                console.error('Error creating new file:', createError);
                this.service.message('Error creating file for copied pipeline: ' + createError, 'error');
              }
            });
          },
          error: (readError) => {
            console.error('Error reading old file:', readError);
            this.service.message('Error reading original file: ' + readError, 'error');
          }
        });
      } else {
        const updatedData = { ...this.data };
        updatedData.files = [];
        
        const updatedJsonContent = {
          elements: [{ attributes: updatedData }],
          environment: this.dynamicEnvArray || [],
          default_runtime: this.selectedRunType
        };
        
        newPipelineData.json_content = JSON.stringify(updatedJsonContent);
        
        this.service.update(newPipelineData).subscribe({
          next: (updateResponse) => {
            this.service.message('Pipeline copied successfully', 'success');
          },
          error: (updateError) => {
            console.error('Error updating pipeline:', updateError);
            this.service.message('Error copying pipeline: ' + updateError, 'error');
          }
        });
      }
    } catch (error) {
      console.error('Exception in copyPipelineJson:', error);
      this.service.message('Error occurred while copying pipeline', 'error');
    }
  }

  hasChild = (_: number, node: FileNode) => !!node.children && node.children.length > 0;
}