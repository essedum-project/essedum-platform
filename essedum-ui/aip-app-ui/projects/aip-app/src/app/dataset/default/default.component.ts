import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DatasetServices } from '../dataset-service';
import { Services } from '../../services/service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ReplaySubject, Subject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { FileItem, FileUploader, ParsedResponseHeaders } from 'ng2-file-upload';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent {
  splunkTypesOpt = [];
  constructor(private datasetsService: DatasetServices,
    private service: Services,
    public dialogRef: MatDialogRef<DefaultComponent>,
    public matdialog: MatDialog) { }

  @Input('testSuccessful') testSuccessful = false;
  @Input('dataset') dataset;
  @Output('testLoaderBoolean') testLoaderBoolean= new EventEmitter();;
  @Input() copyDataset:boolean;
  @Input('edit') edit;
  @Input('schemaVal') schemaVal;
  @Output('action') action = new EventEmitter();
  @Output('cache') cache = new EventEmitter();

  fileUploader:boolean;
  splunkTypes = [];
  datasetTypes = [];
  schemaBolVal : Boolean =false;
  sourceType: any = {};
  selectedDatasetType: any;
  headers: Headers;
  filename: string;
  filepath: string;
  fileData: any;
  isAuth: boolean = true;
  isGitDataset:boolean;
  fileToUpload: File;
  keys: any = [];
  gitUrl:any;
  isCacheable: any = false;
  protected onDestroy = new Subject<void>();
  datasets: any = [];
  datasetObjects: any = [];
  filteredDatasets: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  backingDatasetCtrl = new FormControl();
  backingDatasetFilterCtrl = new FormControl();
  @ViewChild('datasetSelect', { static: true }) datasetSelect: MatSelect;
  scriptShow = false;
  script = [];
  apitypes = ['GET', 'POST'];
  colsList:any;
  whereCondStr:String;
  uploadedFilename
  fileid
  file_extensions = ["abap", "abc", "as", "ada", "alda", "conf", "apex", "aql", "adoc", "asl","asm", "ahk", "bat", "c9search", "c", "cirru", "clj", "cbl", "coffee", "cfm",
  "cr", "cs", "csd", "orc", "sco", "css", "curly", "d", "dart", "diff", "html","dockerfile", "dot", "drl", "edi", "e", "ejs", "ex", "elm", "erl", "fs",
  "fsl", "ftl", "gcode", "feature", "gitignore", "glsl", "gbs", "go", "graphql","groovy", "haml", "hbs", "hs", "cabal", "hx", "hjson", "html.eex", "erb",
  "ini", "io", "jack", "jade", "java", "js", "json", "json5", "jq", "jsp","jssm", "jsx", "jl", "kt", "tex", "latte", "less", "liquid", "lisp", "ls",
  "logic", "lsl", "lua", "lp", "lucene", "makefile", "md", "mask", "m", "mw","mel", "mips", "mc", "sql", "nginx", "nim", "nix", "nsi", "njk", "ml",
  "pas", "pl", "pgsql", "php", "pig", "ps1", "praat", "pro", "properties","proto", "py", "r", "cshtml", "rdoc", "red", "rhtml", "rst", "rb", "rs",
  "sass", "scad", "scala", "scm", "scss", "sh", "sjs", "slim", "tpl", "soy","space", "rq", "sqlserver", "styl", "svg", "swift", "tcl", "tf", "txt",
  "textile", "toml", "tsx", "ttl", "twig", "ts", "vala", "vbs", "vm", "v","vhd", "vf", "wlk", "xml", "xq", "yaml", "zeek","yml","csv", "xlsx" ,"zip","mp4","pdf","mp3"];
  selectedFile: File;
  public uploader: FileUploader = new FileUploader({
    url: '/api/aip/datasets/upload',
  });


  getCheck(event) {
    this.isCacheable = !this.isCacheable;
    this.cache.emit(event.checked);
  }


  ngOnInit() {
    if(this.dataset['datasource'].type=='GIT'){
      const details = this.dataset['datasource'].connectionDetails;
      this.gitUrl = JSON.parse(details).url;
      this.isGitDataset=false;
      this.testSuccessful=true;
    }
    else {
      this.isGitDataset=false;
    }
    

    if(this.schemaVal){
      this.schemaBolVal=true;
      this.findByName(this.schemaVal);
    }
    this.authentications();
    this.getdatasetTypes();
    this.uploader.onErrorItem = (item, response, status, headers) => this.onErrorItem(item, response, status, headers);
    this.uploader.onSuccessItem = (item, response, status, headers) => this.onSuccessItem(item, response, status, headers);
  }

  changesOccur($event){
    this.dataset.attributes.url=$event;
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
    
  }

  authentications() {
    this.service.getPermission("cip").subscribe(
      (cipAuthority) => {
        const authorityArr = JSON.parse(cipAuthority);
        this.isAuth = !authorityArr.some(item => item.permission === "dataset-edit");
      }
    );
  }

  findByName(name) {
    try{
      this.service.getSchemaByName(name).subscribe(res => {
        this.colsList = res.schemavalue?.length > 0 ? JSON.parse(res.schemavalue) : [];
      })
    }
    catch(Exception){
    }
   }
    
  saveDataset() {
    this.action.emit('save');
  }
  createDataset() {
    this.action.emit('create');
  }

  testConnection() {
    if(this.dataset.type == 'rw' && this.dataset.datasource.category=='SQL'){
    if(this.dataset.attributes['uniqueIdentifier']){
      this.fileUploader=false;
      this.action.emit('test');
      this.testLoaderBoolean.emit(true);
    }else{
     this.service.message('Please enter unique identifier', 'error');
    }
    }
    else{
      this.fileUploader=false;
      this.action.emit('test');
      this.testLoaderBoolean.emit(true);
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  getdatasetTypes() {

    this.datasetsService.getDatasetJson()
      .subscribe(resp => {
        this.datasetTypes = resp;
        this.datasetTypes.forEach(dType => {
          if (dType === 'SPLUNK')
            this.splunkTypes = dType[0]['splunkTypes'];
            this.splunkTypes.forEach((opt)=>{
              let val={viewValue:opt,value:opt};
              this.splunkTypesOpt.push(val)
            })
        });
        this.dataset.backingDataset = this.dataset.backingDataset &&
          this.dataset.backingDataset !== null ? this.dataset.backingDataset : '';
        this.backingDatasetCtrl.setValue(this.dataset.backingDataset.name);
        if (this.dataset.datasource.type == "SQL")
          this.sourceType = this.datasetTypes.filter(row =>
            row.type.toLocaleLowerCase() === 'mssql')[0];
        else if (this.dataset.datasource.type)
          this.sourceType = this.datasetTypes.filter(row =>
            row.type.toLocaleLowerCase() === this.dataset.datasource.type.toLocaleLowerCase())[0];
        let keys = [];
        Object.keys(this.sourceType?.attributes||{}).forEach(keyValue => {

          if (keyValue === 'script') {
            this.scriptShow = true;
            this.script = this.dataset.attributes.script;
          } else {
            keys.push(keyValue);          
            if(typeof(this.dataset.attributes)==='string'){
              this.dataset.attributes=JSON.parse(this.dataset.attributes);
            }
            if (!this.dataset.attributes[keyValue]) {
              this.dataset.attributes[keyValue] = this.sourceType.attributes[keyValue];
            }
            if (keyValue === 'Cacheable') {
              this.isCacheable = this.dataset.attributes[keyValue];
            }
          }
        });
        Object.keys(this.sourceType.position).forEach(pos => {
          this.keys[this.sourceType.position[pos]] = pos
        })
         


  });
    
  }



  handleFileInput(files: any){
    this.fileUploader=true
    this.selectedFile=files.target.files[0];
    const formData=new FormData();
    formData.append('file',this.selectedFile);
    this.datasetsService.uploadFileToServer(formData).subscribe(res => {
      if(res.body){
        // this.dataset.attributes['object']=this.dataset.attributes['path'];
        this.dataset.attributes['object']=this.selectedFile.name;
        this.dataset.attributes['uploadFile']=res.body.uploadFilePath;
        this.fileUploader=false
      }
    },
      err => {
       
      })
  }

  onBackingDatasetChange(backingDataset) {
    const dataset = this.datasetObjects.filter(s => s.name === backingDataset)[0];
    this.dataset.backingDataset = JSON.parse(JSON.stringify(dataset));
  }

  addfiletodataset(file) {
    try{
      const chunkSize = 200000
      const formData: FormData = new FormData();
      let file1: File = file.target.files[0];
      let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890,./;'[]\=-)(*&^%$#@!~`";
      const lengthOfCode = 40;
      let metadata = {};
      metadata['FileGuid'] = this.makeRandom(lengthOfCode, possible);
      metadata['FileName'] = file1.name
      metadata['TotalCount'] = Math.ceil(file1.size / chunkSize)
      metadata['FileSize'] = file1.size
      this.datasetsService.generateFileId(sessionStorage.getItem("organization")).subscribe(fileid => {
        this.dataset.attributes.fileId = fileid;
      }, err => { },
        () => {
          let i = 0
          for (let offset = 0; offset < file1.size; offset += chunkSize) {
            const chunk = file1.slice(offset, offset + chunkSize)
            formData.set('file', chunk, file1.name);
            metadata['Index'] = i++
            formData.set('chunkMetadata', JSON.stringify(metadata));
            this.datasetsService.uploadFile(formData, this.dataset.attributes.fileId).subscribe(res => {
              this.uploadedFilename = res.body?.fileName; //[0]
              this.dataset.attributes.fileName = this.uploadedFilename
              this.dataset.attributes.bucketName = sessionStorage.getItem("organization")
            },
              err => {
               
              })
          }
        })
    }
    catch(Exception){
    }
  
  }

  makeRandom(lengthOfCode: number, possible: string) {
    let text = "";
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(Math.floor((window.crypto.getRandomValues(new Uint32Array(1))[0] /
      (0xffffffff + 1)) * possible.length));
    }
    return text;
  }

  uploads() {
    this.uploader.uploadItem(this.uploader.queue[this.uploader.queue.length - 1]);
    this.dataset.attributes.file = this.uploader.queue[this.uploader.queue.length - 1].file.name;
   
  }

  onSuccessItem(item: FileItem, response: any, status: number, headers: ParsedResponseHeaders): any {
    this.filename = item.file.name;
    this.uploadedFilename = response.fileName
    this.fileid = response.fileId
  }

  onErrorItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    const error = response;
  }

  selectedz(data) {
    return JSON.stringify(data);
  }

  onScriptChange($event) {
    if ($event instanceof Object) {
      this.dataset.attributes.script = JSON.stringify($event);
    } else {
      this.dataset.attributes.script = $event;
    }
  }

  back() {
    this.action.emit('back');
  }

  whereStatement(x) {
    let val = "";
    if (x.rules == undefined) {

    } else {
        for (let y of x.rules) {
            if ("condition" in y) {
                val += y.condition + " " + this.whereStatement(y)
            } else {
                if (x.rules[0] == y) {
                    val += y.field + " " + y.operator + " " + y.value + " "
                } else {
                    val += x.condition + " " + y.field + " " + y.operator + " " + y.value + " "
                }

            }

        }
    }
    return val


}


 
}
