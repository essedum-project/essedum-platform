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
import { Subscription } from 'rxjs';
import { StreamingServices } from '../streaming-services/streaming-service';
import { Services } from '../services/service';
import { OptionsDTO } from '../DTO/OptionsDTO';
import { NativeScriptDialogComponent } from './native-script-dialog/native-script-dialog.component';
import { PipelineCreateComponent } from '../pipeline/pipeline-create/pipeline-create.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { DynamicParamsGrid, DynamicSecretsGrid } from '../pipeline.description/pipeline.description.component';

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
    //this.telemetryImpression();
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
        if (this.data.files) {
          this.readFile(this.data.files[0]);
        }
        if(this.data.usedSecrets){
          this.dynamicSecretsArray=this.data.usedSecrets;
        }
        if(this.data.files==null || this.data.files==undefined){
          this.data['files'] = [];
          this.loadScript = true;
        }
     
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
          console.log('completed');
        },
        error: (err) => {
          console.log(err);
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
      console.log('res', res);
      this.cardTitle = 'Pipeline';
      this.card = res[0];
    });
  }
  authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      // pipeline-edit/update permission
      if (cipAuthority.includes('pipeline-edit')) this.isAuth = false;
      // pipeline-run permission
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
        // Set default selection
        if (this.defaultRuntimeFromDB) {
          // Find the matching runtime option
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
      if (index > -1) this.runTypes.splice(index, 1); // 2nd parameter means remove one item only
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

  readFile(filename: string) {
    this.service
      .readNativeFile(
        this.streamItem.name,
        this.streamItem.organization,
        filename
      )
      .subscribe({
        next: (resp) => {
          // script file to list
          console.log('File read response:', resp);
            this.service.message('Reading file done', resp);
          try {
            const textDecoder = new TextDecoder('utf-8');
            this.script = textDecoder.decode(resp).split('\n');
            this.loadScript = true;
          } catch (e) {
            console.error('Error decoding file:', e);
            this.service.message('Error decoding file', 'error');
          }
        },
        error: (err) => {
          console.error('Error while reading file:', err);
          this.service.message('Error! While reading file', 'error');
        },
        complete: () => {
          console.log('readNativeFile observable completed');
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
      //console.log("data.files : ", this.data.files)

      //script list to file
      const formData: FormData = new FormData();
      let script = this.script.join('\n');
      let scriptFile = new Blob([script], { type: 'text/plain' });
      formData.set('scriptFile', scriptFile);
      this.service
        .createNativeFile(
          pname,
          this.streamItem.organization,
          this.data.files[0],
          this.data.filetype,
          formData
        )
        .subscribe((response) => {
          this.streamItem.name = pname;
          console.log('this.streamItem:',this.streamItem);
          console.log('selectedRunType:',this.selectedRunType);
          this.data.files[0] = response;
          this.data.arguments = this.treeData;
          this.data.usedSecrets=this.dynamicSecretsArray;
          this.streamItem.json_content = JSON.stringify({
            elements: [{ attributes: this.data }],
            environment:this.dynamicEnvArray,
            default_runtime: this.selectedRunType
          });
          this.service.update(this.streamItem).subscribe(
            (response) => {
              this.service.message('Updated Successfully', 'success');
              // this.ngOnInit();
            },
            (error) =>
              this.service.message(
                'Canvas not updated due to error: ' + error,
                'error'
              )
          );
        });
    } catch (Exception) {
      this.service.message('Some error occured', 'error');
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
      height: '80%',
      width: '60%',
      data: {
        sourceToCopy: this.data,
        type: this.streamItem.type,
        interfacetype: this.streamItem.interfacetype,
        copy: true,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.saveJson(result.data.name);
    });
  }

  displayDialog(button, name, value, type, index, alias) {
    const dialogRef = this.dialog.open(NativeScriptDialogComponent, {
      height: '50%',
      width: '60%',
      disableClose: false,
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
      // You can add more config options here as needed
    });
    this.getRelatedComponent();
  }

  onEnvDataChange($event) {
    this.environment = $event;
    this.dynamicEnvArray = $event;
    this.envModified = true;
  }

  onSecretsDataChange($event) {
    this.secrets = $event;
    this.dynamicSecretsArray = $event;
    this.secretsModified = true;
    console.log('On Secret Data Change : ', this.dynamicSecretsArray)

  }
}
