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
        if (this.data.files && this.data.files.length > 0) {
          // Don't read files here - let buildFileStructure handle it
          // this.readFile(this.data.files[0]);
        }
        if(this.data.usedSecrets){
          this.dynamicSecretsArray=this.data.usedSecrets;
        }
        if(this.data.files==null || this.data.files==undefined){
          this.data['files'] = [];
          this.loadScript = true;
        }
        
        // Build file structure for code explorer
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

  readFile(filename: string, retryCount = 0) {
    console.log('Reading file:', filename, 'for stream:', this.streamItem?.name, 'org:', this.streamItem?.organization, 'retry:', retryCount);
    
    if (!filename || !this.streamItem?.name || !this.streamItem?.organization) {
      console.error('Missing required parameters for readFile:', { filename, streamName: this.streamItem?.name, org: this.streamItem?.organization });
      this.service.message('Error: Missing file or stream information', 'error');
      return;
    }
    
    // Only read .py files
    const extension = filename.split('.').pop()?.toLowerCase();
    if (extension !== 'py') {
      console.log('Skipping file read for non-Python file:', filename);
      this.script = [];
      this.loadScript = true;
      return;
    }
    
    // Encode filename to handle special characters
    const encodedFilename = encodeURIComponent(filename);
    
    this.service
      .readNativeFile(
        this.streamItem.name,
        this.streamItem.organization,
        encodedFilename
      )
      .subscribe({
        next: (resp) => {
          console.log('File read response received for:', filename);
          try {
            const textDecoder = new TextDecoder('utf-8');
            this.script = textDecoder.decode(resp).split('\n');
            this.loadScript = true;
            console.log('Successfully loaded script with', this.script.length, 'lines');
            
            // Update the selected file in the structure
            if (this.fileStructure.length > 0) {
              this.fileStructure.forEach(file => {
                file.selected = file.name === filename && file.extension === 'py';
              });
              this.selectedFileNode = this.fileStructure.find(f => f.name === filename && f.extension === 'py') || null;
            }
            
            // Trigger change detection
            this.cdr.detectChanges();
          } catch (e) {
            console.error('Error decoding file:', e);
            this.service.message('Error decoding file content', 'error');
            this.script = [];
            this.loadScript = true;
          }
        },
        error: (err) => {
          console.error('Error while reading file:', filename, 'Attempt:', retryCount + 1, err);
          
          // Retry logic for file reading errors
          if (retryCount < 3) {
            console.log(`Retrying file read in ${(retryCount + 1) * 1000}ms...`);
            setTimeout(() => {
              this.readFile(filename, retryCount + 1);
            }, (retryCount + 1) * 1000);
            return;
          }
          
          // After all retries failed
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
          console.log('readNativeFile observable completed for:', filename);
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
      console.log('Starting saveJson for pipeline:', pname);
      console.log('Current data.files:', this.data.files);
      console.log('Current script length:', this.script.length);
      console.log('Selected file node:', this.selectedFileNode);

      // Ensure we have a files array
      if (!this.data.files) {
        this.data.files = [];
      }

      // Script list to file
      // Determine the specific file being edited first
      let targetFileName: string;
      
      if (this.selectedFileNode && this.selectedFileNode.extension === 'py') {
        // If we have a selected Python file, use that
        targetFileName = this.selectedFileNode.name;
        console.log('Using selected Python file:', targetFileName);
      } else {
        // For new pipelines or if no specific file is selected, generate default filename
        targetFileName = `${pname}_${this.streamItem.organization}.py`;
        console.log('Generated default filename:', targetFileName);
      }
      
      // Get the script content as a string
      let scriptContent = this.script.join('\n');
      
      console.log('💾 Saving script file:', {
        fileName: targetFileName,
        contentLength: scriptContent.length,
        contentPreview: scriptContent.substring(0, 100) + '...'
      });
      
      // Pass the script content string directly - service will create FormData
      this.service
        .createNativeFile(
          pname,
          this.streamItem.organization,
          targetFileName, // Use specific filename instead of files array
          this.data.filetype,
          scriptContent  // Pass content string, not FormData
        )
        .subscribe({
          next: (response) => {
            console.log('File creation response:', response);
            this.streamItem.name = pname;
            
            // Update the files array with the response
            // Check if this is a new file or updating existing
            let fileExists = false;
            if (Array.isArray(this.data.files)) {
              // Look for existing file in the array (handle both string and array formats)
              for (let i = 0; i < this.data.files.length; i++) {
                let fileEntry = this.data.files[i];
                if (typeof fileEntry === 'string') {
                  // Check if this entry contains our target file
                  if (fileEntry.includes(targetFileName)) {
                    // Update this entry with the response
                    this.data.files[i] = response;
                    fileExists = true;
                    console.log('Updated existing file entry at index', i);
                    break;
                  }
                }
              }
            }
            
            // If file doesn't exist in array, add it
            if (!fileExists) {
              this.data.files.push(response);
              console.log('Added new file to array:', response);
            }
            
            this.data.arguments = this.treeData;
            this.data.usedSecrets = this.dynamicSecretsArray;
            
            // Update the streamItem with new data
            this.streamItem.json_content = JSON.stringify({
              elements: [{ attributes: this.data }],
              environment: this.dynamicEnvArray,
              default_runtime: this.selectedRunType
            });
            
            console.log('Updated streamItem json_content:', this.streamItem.json_content);
            
            this.service.update(this.streamItem).subscribe({
              next: (updateResponse) => {
                console.log('StreamItem update response:', updateResponse);
                this.service.message('Pipeline saved successfully', 'success');
                
                // Immediate UI update for better user experience
                this.buildFileStructureFromCurrentData();
                
                // Then refresh from server to ensure consistency
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
                // Still try to refresh the UI
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
      if (result) this.copyPipelineJson(result);
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

  // File structure methods
  buildFileStructureFromCurrentData() {
    console.log('Building file structure from current data...');
    this.fileStructure = [];
    
    if (this.data && this.data.files && Array.isArray(this.data.files) && this.data.files.length > 0) {
      this.data.files.forEach((fileEntry: any) => {
        console.log('Processing file entry from current data:', fileEntry, 'Type:', typeof fileEntry);
        
        let fileNames: string[] = [];
        
        if (typeof fileEntry === 'string') {
          // Handle string entries that might be in bracket format like '["file1.py","file2.ipynb"]'
          if (fileEntry.startsWith('[') && fileEntry.endsWith(']')) {
            try {
              // Parse as JSON array
              const parsedArray = JSON.parse(fileEntry);
              if (Array.isArray(parsedArray)) {
                fileNames = parsedArray.filter(name => typeof name === 'string' && name.trim().length > 0);
              } else {
                fileNames = [fileEntry.trim()];
              }
            } catch (e) {
              console.warn('Failed to parse bracket format, treating as single file:', fileEntry);
              // Fallback: treat as comma-separated
              const cleanEntry = fileEntry.slice(1, -1);
              fileNames = cleanEntry.split(',').map(f => f.trim().replace(/"/g, '')).filter(f => f.length > 0);
            }
          } else if (fileEntry.includes(',')) {
            // Handle comma-separated format
            fileNames = fileEntry.split(',').map(f => f.trim().replace(/"/g, '')).filter(f => f.length > 0);
          } else {
            // Single file name
            fileNames = [fileEntry.trim()];
          }
        } else if (Array.isArray(fileEntry)) {
          // Handle direct array
          fileNames = fileEntry.filter(name => typeof name === 'string' && name.trim().length > 0);
        }
        
        // Process each file name
        fileNames.forEach((fileName: string) => {
          if (fileName && fileName.trim().length > 0) {
            const cleanFileName = fileName.trim();
            const extension = cleanFileName.split('.').pop()?.toLowerCase();
            
            console.log(`Processing file: ${cleanFileName}, extension: ${extension}`);
            
            if (extension === 'py' || extension === 'ipynb') {
              const existingFile = this.fileStructure.find(f => f.name === cleanFileName);
              if (!existingFile) {
                this.fileStructure.push({
                  name: cleanFileName,
                  extension: extension,
                  selected: extension === 'py' // Auto-select only Python files
                });
                console.log('Added file to structure from current data:', cleanFileName);
              }
            }
          }
        });
      });
      
      // Update tree data source
      this.fileTreeDataSource.data = this.fileStructure;
      
      // Ensure we show the script editor
      this.loadScript = true;
      
      // Set the selected file node (only Python files)
      const pythonFile = this.fileStructure.find(f => f.extension === 'py' && f.selected);
      if (pythonFile) {
        this.selectedFileNode = pythonFile;
        console.log('Selected Python file from current data:', pythonFile.name);
      }
      
      console.log('Built file structure from current data:', this.fileStructure);
      
      // Trigger change detection
      this.cdr.detectChanges();
    } else {
      console.log('No files in current data, setting loadScript to true');
      this.loadScript = true;
    }
  }

  buildFileStructure() {
    console.log('Building file structure in NativeScript...', this.streamItem);
    this.fileStructure = [];
    
    if (this.streamItem && this.streamItem.json_content) {
      try {
        const jsonContent = JSON.parse(this.streamItem.json_content);
        const files = jsonContent.elements[0]?.attributes?.files;
        
        console.log('Raw files array from API:', files);
        
        if (files && Array.isArray(files) && files.length > 0) {
          // Process each file entry in the files array
          files.forEach((fileEntry: any, index: number) => {
            console.log(`Processing file entry ${index}:`, fileEntry, 'Type:', typeof fileEntry);
            let fileNames: string[] = [];
            
            // Handle different formats of file entries
            if (typeof fileEntry === 'string') {
              // Check if the file entry is in bracket format like '["file1.py","file2.ipynb"]'
              if (fileEntry.startsWith('[') && fileEntry.endsWith(']')) {
                try {
                  // Try to parse as JSON array first
                  const parsedArray = JSON.parse(fileEntry);
                  if (Array.isArray(parsedArray)) {
                    fileNames = parsedArray.filter(name => typeof name === 'string' && name.trim().length > 0);
                    console.log('Parsed as JSON array:', fileNames);
                  } else {
                    fileNames = [fileEntry.trim()];
                  }
                } catch (e) {
                  console.warn('Failed to parse as JSON, trying manual parsing:', e);
                  // Fallback: manual parsing of bracket format
                  const cleanEntry = fileEntry.slice(1, -1); // Remove brackets
                  fileNames = cleanEntry.split(',').map(f => f.trim().replace(/[\"\']/g, '')).filter(f => f.length > 0);
                  console.log('Manually parsed file names:', fileNames);
                }
              } else if (fileEntry.includes(',')) {
                // Handle comma-separated without brackets
                fileNames = fileEntry.split(',').map(f => f.trim()).filter(f => f.length > 0);
                console.log('Extracted file names from comma-separated format:', fileNames);
              } else {
                // Single file name
                fileNames = [fileEntry.trim()];
                console.log('Single file name:', fileNames);
              }
            } else if (Array.isArray(fileEntry)) {
              // Handle direct array entries
              fileNames = fileEntry.filter(name => typeof name === 'string' && name.trim().length > 0);
              console.log('Direct array format:', fileNames);
            } else {
              console.warn('File entry is neither string nor array:', fileEntry);
              return; // Exit this iteration of forEach
            }
            
            // Process each extracted file name
            fileNames.forEach((fileName: string) => {
              if (fileName && fileName.length > 0) {
                const cleanFileName = fileName.trim();
                const extension = cleanFileName.split('.').pop()?.toLowerCase();
                console.log(`Processing file: ${cleanFileName}, extension: ${extension}`);
                
                if (extension === 'py' || extension === 'ipynb') {
                  // Check if file already exists in structure to avoid duplicates
                  const existingFile = this.fileStructure.find(f => f.name === cleanFileName);
                  if (!existingFile) {
                    this.fileStructure.push({
                      name: cleanFileName,
                      extension: extension,
                      selected: false
                    });
                    console.log('Added file to structure:', cleanFileName);
                  }
                } else {
                  console.log('Skipping file with unsupported extension:', cleanFileName);
                }
              }
            });
          });
          
          console.log('Built file structure:', this.fileStructure);
          
          // Auto-select the first Python file with a delay to ensure backend is ready
          if (this.fileStructure.length > 0) {
            const firstPyFile = this.fileStructure.find(file => file.extension === 'py');
            if (firstPyFile) {
              console.log('Auto-selecting Python file:', firstPyFile.name);
              
              // Mark as selected immediately for UI
              this.fileStructure.forEach(file => file.selected = false);
              firstPyFile.selected = true;
              this.selectedFileNode = firstPyFile; // Ensure selectedFileNode is set
              
              console.log('Set selectedFileNode to:', this.selectedFileNode);
              
              // If we already have script content, don't reload
              if (this.script && this.script.length > 0) {
                console.log('Script content already available, not reloading');
                this.loadScript = true;
                this.cdr.detectChanges();
              } else {
                // Add delay before reading file to ensure it's available on the server
                setTimeout(() => {
                  this.readFile(firstPyFile.name);
                }, 1000);
              }
            } else {
              console.log('No Python file found, setting loadScript to true');
              // If no Python file found, just set loadScript to true for empty editor
              this.loadScript = true;
              this.selectedFileNode = null;
            }
          } else {
            console.log('No files in structure, setting loadScript to true');
            // No files found, show empty editor
            this.loadScript = true;
          }
        } else {
          console.log('No files found in json_content or files array is empty');
          this.loadScript = true;
        }
      } catch (error) {
        console.error('Error parsing json_content:', error);
        this.loadScript = true;
      }
    } else {
      console.log('No streamItem or json_content available');
      this.loadScript = true;
    }
    
    this.fileTreeDataSource.data = this.fileStructure;
    console.log('File tree data source updated:', this.fileTreeDataSource.data);
    
    // Trigger change detection
    this.cdr.detectChanges();
  }

  onFileNodeSelect(fileNode: FileNode) {
    console.log('File node selected in NativeScript:', fileNode);
    
    // Deselect all files first
    this.fileStructure.forEach(file => file.selected = false);
    
    // Select the clicked file
    fileNode.selected = true;
    this.selectedFileNode = fileNode;
    
    console.log('Selected file node updated:', this.selectedFileNode);
    
    if (fileNode.extension === 'ipynb') {
      // Clear the code editor content when notebook is selected
      this.script = [];
      this.scriptSelected = '';
      this.loadScript = true; // Show empty editor
      // Show dialog for notebook files - using existing implementation
      console.log('Opening notebook dialog for:', fileNode.name);
      this.showNotebookDialog();
    } else if (fileNode.extension === 'py') {
      // Handle Python file selection - only read .py files
      console.log('Python file selected:', fileNode.name);
      
      // If we have current script content and this is the file we're editing, don't reload
      const isCurrentFile = this.data.files && this.data.files.length > 0 && 
        (this.data.files[0] === fileNode.name || 
         (typeof this.data.files[0] === 'string' && this.data.files[0].includes(fileNode.name)));
      const hasContent = this.script && this.script.length > 0;
      
      if (isCurrentFile && hasContent) {
        console.log('File is already loaded with content, not reloading');
        this.loadScript = true;
        this.cdr.detectChanges();
      } else {
        console.log('Loading Python file content:', fileNode.name);
        this.readFile(fileNode.name);
      }
    } else {
      console.log('Unsupported file type:', fileNode.extension);
      // For any other file types, show empty editor
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
      // Update the main script array used by the code editor
      this.script = this.scriptSelected ? this.scriptSelected.split('\n') : [];
    }
  }

  refreshFileStructureAfterSave() {
    console.log('Refreshing file structure after save...');
    
    if (!this.streamItem?.name) {
      console.error('Cannot refresh: streamItem.name is missing');
      this.buildFileStructureFromCurrentData();
      return;
    }
    
    // Re-fetch the streaming service data to get updated file list
    this.service.getStreamingServicesByName(this.streamItem.name).subscribe({
      next: (serviceData) => {
        console.log('Service data refreshed successfully:', serviceData);
        
        if (serviceData && serviceData.json_content) {
          // Update the component's streamItem reference
          this.streamItem = serviceData;
          
          // Parse the updated data to get the file list
          try {
            const jsonContent = JSON.parse(serviceData.json_content);
            console.log('Parsed refreshed json_content:', jsonContent);
            
            if (jsonContent.elements && jsonContent.elements[0]?.attributes) {
              this.data = jsonContent.elements[0].attributes;
              this.dynamicEnvArray = jsonContent.environment || [];
              this.defaultRuntimeFromDB = jsonContent.default_runtime;
              // Only update selectedRunType if it's not already set (i.e., during initial load)
              // This prevents overwriting the user's current selection when refreshing after actions like run/save
              if (!this.selectedRunType) {
                this.selectedRunType = this.defaultRuntimeFromDB;
              }
              
              console.log('Updated component data after refresh:', {
                files: this.data.files,
                environment: this.dynamicEnvArray.length,
                runtime: this.selectedRunType
              });
              
              // Rebuild the file structure with updated data
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
        console.log('Falling back to current data for file structure');
        // Fallback to current file structure rebuild without showing error to user
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
      console.log('Starting copyPipelineJson for new pipeline:', newPipelineData);
      
      const newCname = newPipelineData.name;
      const newOrg = newPipelineData.organization;
      const newFileName = `${newCname}_${newOrg}.py`;
      
      console.log('New pipeline details:', { newCname, newOrg, newFileName });
      
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
              const cleanStr = oldFileName.slice(1, -1); // Remove brackets
              const filesArray = cleanStr.split(',').map(f => f.trim().replace(/["\']/g, ''));
              oldFileName = filesArray.find(f => f.endsWith('.py')) || filesArray[0];
            }
          }
        }
        
        console.log('Reading old file:', oldFileName);
        
        this.service.readNativeFile(
          this.streamItem.name,
          this.streamItem.organization,
          oldFileName
        ).subscribe({
          next: (fileContent) => {
            console.log('Old file content read successfully');
            
            const textDecoder = new TextDecoder('utf-8');
            const scriptContent = textDecoder.decode(fileContent);
            
            console.log('Creating new file with name:', newFileName);
            
            this.service.createNativeFile(
              newCname,
              newOrg,
              newFileName,
              this.data.filetype || 'Python3',
              scriptContent
            ).subscribe({
              next: (createResponse) => {
                console.log('New file created successfully:', createResponse);
                
                const updatedData = { ...this.data };
                updatedData.files = [newFileName];
                
                const updatedJsonContent = {
                  elements: [{ attributes: updatedData }],
                  environment: this.dynamicEnvArray || [],
                  default_runtime: this.selectedRunType
                };
                
                newPipelineData.json_content = JSON.stringify(updatedJsonContent);
                
                console.log('Updated json_content with new file name:', newPipelineData.json_content);
                
                this.service.update(newPipelineData).subscribe({
                  next: (updateResponse) => {
                    console.log('Pipeline updated successfully in database:', updateResponse);
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
        console.log('No files to copy, updating pipeline with empty files array');
        
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
            console.log('Pipeline updated successfully:', updateResponse);
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