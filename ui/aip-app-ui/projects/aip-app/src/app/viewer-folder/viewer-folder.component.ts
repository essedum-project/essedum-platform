import { Component, Input, SimpleChanges, Injectable, ViewChild, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Services } from '../services/service';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { FileInfoComponent } from './file-info/file-info.component';
import { Location } from '@angular/common';
import { DatasetServices } from '../dataset/dataset-service';
import { Stomp } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import * as _ from "lodash";

class FileNode {
  children: FileNode[];
  name: string;
}

class FlatNode {
  name: string;
  level: number;
  data:any;
  expandable: boolean;
}

interface TreeNode{
  [key:string]:TreeNode | null | string[] | string;
}

@Component({
  selector: 'app-viewer-folder',
  templateUrl: './viewer-folder.component.html',
  styleUrls: ['./viewer-folder.component.scss']
})
export class ViewerFolderComponent {
  @Input() ResponseList:any;
  @Input() AnnotateFlag:any;
  @Input() datasetId:any;
  @Input() cardData: any;
  @Input() path:any;
  @Input() selectedReferenceObject: any;
  @ViewChild('tree') tree;
  @Output() refresh = new EventEmitter<boolean>();
  filesList:{filename: string; data:any; extension:string}[]=[];
  fileData:any;
  isImg:boolean;
  isPdf:boolean;
  isCode:boolean;
  isTxt:boolean;
  isVideo:boolean;
  isAudio:boolean;
  isCsv:boolean;
  isJson: boolean;
  defaultExtention: boolean;
  ROOT_LEVEL:number=1;
  fetchFile:boolean=false;
  flag=0;
  datasetName:string;
  TREE_DATA;
  hoverNode = null;
  selectNode = null;
  downloadFilesList=[];
  shownMenu = false;
  menuTop = 0;
  menuLeft = 0;
  menuNode: any;
  sortingpath: any=[];
  deleteFileList: any=[];
  fileSize:any;
  lastModified:any;
  lastdate:any;
  fileName: any;
  homeScreen: boolean;
  tempDatasetArray:any=[];
  tempDataset:any={};
  fileNamePlaceholder='';
  uploadPercentage: number = 0;
  uploading: boolean=false;
  stompClient: any;
  nodeUpload: any;
  nodelevel: any;
  fileNamePath:any;
  index: number;
  filePath:string;
  tabReq:string = 'filePreview'
  fullPath:string;
  questions;
  answers;
  ind:number;
  selectedTabIndex: number;
  fileCount: number = 0;
  modifiedPath:string;
  list: any=[];
  codeExtensions = [
    "abap", "abc", "as", "ada", "alda", "conf", "apex", "aql", "adoc", "asl","asm", "ahk", "bat", "c9search", "c", "cirru", "clj", "cbl", "coffee", "cfm",
    "cr", "cs", "csd", "orc", "sco", "css", "curly", "d", "dart", "diff", "html","dockerfile", "dot", "drl", "edi", "e", "ejs", "ex", "elm", "erl", "fs",
    "fsl", "ftl", "gcode", "feature", "gitignore", "glsl", "gbs", "go", "graphql","groovy", "haml", "hbs", "hs", "cabal", "hx", "hjson", "html.eex", "erb",
    "ini", "io", "jack", "jade", "java", "js", "json", "json5", "jq", "jsp","jssm", "jsx", "jl", "kt", "tex", "latte", "less", "liquid", "lisp", "ls",
    "logic", "lsl", "lua", "lp", "lucene", "makefile", "md", "mask", "m", "mw","mel", "mips", "mc", "sql", "nginx", "nim", "nix", "nsi", "njk", "ml",
    "pas", "pl", "pgsql", "php", "pig", "ps1", "praat", "pro", "properties","proto", "py", "r", "cshtml", "rdoc", "red", "rhtml", "rst", "rb", "rs",
    "sass", "scad", "scala", "scm", "scss", "sh", "sjs", "slim", "tpl", "soy","space", "rq", "sqlserver", "styl", "svg", "swift", "tcl", "tf", "txt",
    "textile", "toml", "tsx", "ttl", "twig", "ts", "vala", "vbs", "vm", "v","vhd", "vf", "wlk", "xml", "xq", "yaml", "zeek","yml"];
  refreshChild: boolean = false;
  isGitView: boolean = false;
  isTabSummary: boolean = true;
  enableEdit: boolean = false;
  tempFileName: string;
  dataset: any;
  isFolderSummary: boolean = false;
  selectedPathForSummary: string;
  listObjectsJson: any;

  constructor(
    private service:Services, 
    private route:ActivatedRoute, 
    private router: Router, 
    private datasetService:DatasetServices,
    private location: Location,
    private dialog: MatDialog, 
    private http:HttpClient,
    private datasourceService: Services){
    this.datasetName=this.route.snapshot.paramMap.get('cname')
    this.route.queryParams.subscribe((param)=>{
      this.fileName = param['flname']
    })
  }

  ngOnInit() { 
    if (this.cardData && this.cardData.views && this.cardData.views == "GIT View") {
      this.isGitView = true;
    } else {
      this.isGitView = false;
    }
    if(this.datasetId)
      this.datasetName=this.datasetId;
    if(this.fileName)
      this.mapfile(this.fileName);
    if (this.selectedReferenceObject && this.selectedReferenceObject.fileName && this.selectedReferenceObject.fileName != '')
      this.mapfile(this.selectedReferenceObject.fileName);
    this.addtoList();
    if (this.isGitView)
      this.fetchSummaryOfFolder("isGitView", "true");
  }

  ngOnChanges(changes:SimpleChanges){
    this.ResponseList=changes.ResponseList.currentValue;
    this.sorting();
    this.list=[];
    this.list=this.ResponseList[0];
    this.updateList();
    this.ngOnInit();
    this.ngAfterViewInit();
  }

  ngAfterViewInit() {
    this.treeControl.expand(this.treeControl.dataNodes[0])
  }

  addtoList() {
    this.TREE_DATA = this.convertFilePathtoTreeNode(this.ResponseList[0]);
    this.dataSource.data = this.buildFileTree(this.TREE_DATA, 0);
    this.homeScreen = true;
  }
  buildFileTree = (obj:{ [key: string]: any }, level: number): any[] => 
  {
          return Object.keys(obj).reduce<any[]>((accumulator, key) => {
                  const value = obj[key]; 
                  const node = new FileNode(); 
                  node.name = key; 
                  if (value != null) {
                          if (typeof value === 'object') { 
                              node.children = this.buildFileTree(value, level + 1); 
                          } else {
                              node.name = value;
                          }
                      } 
                      return accumulator.concat(node);
              }, 
          []);
  };

  flatNodeMap = new Map <FlatNode, FileNode>(); 
  nestedNodeMap = new Map<FileNode, FlatNode>();

  getLevel = (node: FlatNode) => node.level; 
  isExpandable = (node: FlatNode) => node.expandable; 
  getChildren = (node:FileNode): FileNode[] => node.children; 
  hasChild2 = (_: number, _nodeData: FlatNode) => _nodeData.expandable; 

  transformer = (node:FileNode, level: number) => {
          const existingNode = this.nestedNodeMap.get(node); 
          const flatNode = existingNode && existingNode.name === node.name ? existingNode : new FlatNode();
          flatNode.name = node.name; 
          flatNode.level = level; 
          flatNode.expandable = !!node.children; 
          this.flatNodeMap.set(flatNode, node); 
          this.nestedNodeMap.set(node,flatNode); 
      return flatNode;
  }; 

  treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
 
  treeControl = new FlatTreeControl<FlatNode>(this.getLevel, this.isExpandable); 
                          
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener); 
  
  checklistSelection = new SelectionModel<FlatNode>(true); 

  descendantsAllSelected = (node: FlatNode): boolean => {
    const descendants = this.treeControl.getDescendants(node); 
    const descAllSelected = descendants.every((child) =>
    this.checklistSelection.isSelected(child)); 
    return descAllSelected;
  };
  
  descendantsPartiallySelected = (node: FlatNode): boolean => {
    const descendants = this.treeControl.getDescendants(node); 
    const result = descendants.some((child) => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  };

  todoItemSelectionToggle = (node: FlatNode) => {
    this.checklistSelection.toggle(node); 
    const descendants = this.treeControl.getDescendants(node); 
    this.checklistSelection.isSelected(node) ? this.checklistSelection.select(...descendants) : this.checklistSelection.deselect(...descendants);
  };

  checkAllParentsSelection = (node: FlatNode) => {
    let parent: FlatNode | null = this.getParentNode(node); 
    while (parent) {
            this.checkRootNodeSelection(parent); 
            parent = this.getParentNode(parent);
        }
  };

  todoLeafItemSelectionToggle = (node: FlatNode) => {
    this.checklistSelection.toggle(node); 
    this.checkAllParentsSelection(node); 
  };

  checkRootNodeSelection = (node: FlatNode) => {
    const nodeSelected = this.checklistSelection.isSelected(node); 
    const descendants = this.treeControl.getDescendants(node); 
    const descAllSelected = descendants.every((child) => this.checklistSelection.isSelected(child));
    if (nodeSelected && !descAllSelected) {
        this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) { 
      this.checklistSelection.select(node); 
    }
  };

  getParentNode = (node: FlatNode): FlatNode | null => {
    const currentLevel = this.getLevel(node); if (currentLevel < 1) { return null; }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1; 
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i]; 
        if (this.getLevel(currentNode) < currentLevel) {
          return currentNode;
        }
      } 
    return null;
  }; 

  onNode(node: Node){
    this.hoverNode =  node;
  }
  isHover(node: Node){
    return this.hoverNode === node;
  }

  isSelect(hasChild2: Node){
    return this.selectNode === hasChild2;
  }

  switchToExtention(extension){
    this.isCode = false;
    if(this.codeExtensions.includes(extension)) {
      extension='code';
      this.refreshChild = true;
      this.basicReqTabChangeForGit(0, "triggeredFromtsfile");
    }
    this.fetchFile=false;
    switch(extension){
      case 'png':
      case 'jpeg':
      case 'jpg':
        this.isImg=true;
        break;
      case 'pdf':
        this.isPdf=true 
        break;   
      case 'code':
        this.isCode = true;
        this.isTxt=true
        break;     
      case 'txt':
        this.isTxt=true 
        break;
      case 'mp4':
        this.isVideo=true;
        break;
      case 'mp3':
        this.isAudio=true;
        break;
      case 'json':
        this.isJson=true;
        break;
      case 'csv':
        this.isCsv=true;
        this.convertCsvToText();
        break;
      case 'nodeUpload':
        this.homeScreen=true;
        break;
      default:
        this.defaultExtention=true;
        break;
    }
  }

  convertCsvToText(){
    let data = this.fileData;
    let formattedData = Object.keys(data[0][0]).join(', ') + '\n\n';
    formattedData += data[0].map(obj => Object.values(obj).join(', ') + '\n\n').join('');
    this.fileData = formattedData;
  }

  makeAllFalse(){
    this.isImg=false;
    this.isPdf=false;
    this.isTxt=false;
    this.isVideo=false;
    this.isAudio=false;
    this.isJson=false;
    this.isCsv=false;
    this.defaultExtention=false;
    this.homeScreen = false;
  }

  download(){
    this.filesList.forEach(file => {
      this.downloadSelectFiles(file.filename, file.data, file.extension);
    });
  }

  downloadSelectFiles(filename:string, data: any, extension:string){
    const link = document.createElement('a');
    if(extension.match(/pdf|jpg|png|jpeg/)){
      const decode = atob(data);
      const byteArray = new Uint8Array(decode.length);
      for(let i = 0; i< decode.length;i++){
        byteArray[i] = decode.charCodeAt(i);
      }
      const blobdata = new Blob([byteArray], {type:'application/${file.extension}'});
      link.href = window.URL.createObjectURL(blobdata);
    } 
    else if(extension.match(/mp3|mp4|docx|pptx|xlsx|zip/)){
      this.service.messageNotificaionService('success', "Download initiated");
      this.http.get(data[0], {responseType: 'blob'}).subscribe((res) => {
        const blob = new Blob([res], {type: 'application/${file.extension}'});
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        this.fetchFile=false;
        return;
      },
      (err)=>this.service.messageService('Some error occured while downloading media file'));
    }
    else if(extension.match(/csv|json|jsonl|txt/) || this.codeExtensions.includes(extension)) {
      let formattedData:string;
      if(this.codeExtensions.includes(extension)) {
        extension='code';
      }
      switch (extension){
        case 'csv':
          const header = Object.keys(data[0]).join(',') + '\n';
          const rows = data.map(obj => Object.values(obj).join(',') + '\n');
          formattedData = header + rows.join('');
          break;
        case 'json':
          formattedData = JSON.stringify(data, null, 2);
          break;
        case 'jsonl':
          formattedData = data.map(obj => JSON.stringify(obj) + '\n').join('');
          break;
        case 'txt':
          formattedData = data;
          break;
        case 'code':
          formattedData = data;
          break;
      }
      const blobdata = new Blob([formattedData], {type: this.getmimetype(extension)});
      const file = new File([blobdata], filename, {type: this.getmimetype(extension)});
      link.href = window.URL.createObjectURL(file);
    }
    else {
      this.service.messageService('This file cannot be downloaded currently');
      this.fetchFile=false;
      return;
    }
    link.download = filename;
    link.click();
    this.fetchFile=false;
  }

  getmimetype(extension:any):string {
    switch(extension) {
      case 'txt':
        return 'text/plain';
      case 'code':
        return 'text/plain';
      case 'csv':
        return 'text/csv';
      case 'png':
      case 'jpeg':
      case 'jpg':
        return 'image/jpg'
      case 'jsonl':
        return 'application/jsonlines';
      case 'json':
        return 'application/json';
      case 'zip':
        return 'application/zip';
      default:
        return '';
    }
  }

  openMenu(event: MouseEvent, node) {
    event.preventDefault();
    this.shownMenu = true;
    this.menuTop = event.pageY;
    this.menuLeft = event.pageX;
    this.menuNode = node;
  }

  disapperMenu() {
     this.shownMenu = false;
  }
  
  sorting(){
  const paths = this.ResponseList[0].sort((a,b) => {
    const countfile1 = (a.match(/\//g) || []).length;
    const countfile2 = (b.match(/\//g) || []).length;   
    return countfile1-countfile2;
  });
}

updateList(){
  this.listObjectsJson = _.cloneDeep(this.ResponseList[0]);
  this.ResponseList[0] = this.ResponseList[0].filter(str=>!/\/\./.test(str));
  return this.ResponseList[0]; 
}

  convertFilePathtoTreeNode(filePaths:string[]):TreeNode{
    const jsonResult:TreeNode={};
 
    filePaths.forEach((filePath)=>{
      const parts = filePath.split('/');
      let currentNode:TreeNode=jsonResult;
 
      parts.forEach((part,index)=>{
        if(index===parts.length-1){
          if(currentNode[part]!==undefined){
            if(!Array.isArray(currentNode[part])){
              currentNode[part]=[currentNode[part] as string];
            }
            else{
              (currentNode[part] as string[]).push(null);
            }
          }
          else{
            currentNode[part]=null;
          }
        }
        else{
          currentNode[part]=currentNode[part]||{};
          currentNode=currentNode[part] as TreeNode;
        }
      });
    });
  return jsonResult;
  }

  showFile(node){
    this.refreshChild = false;
    this.isFolderSummary = false;
    this.selectNode = this.selectNode === node ? null : node;
    this.nodeUpload='';
    this.index = 0;
    if(!node.expandable){
      this.filePath = this.getFilePath(node);
      this.selectedPathForSummary = _.cloneDeep(this.filePath);
      const slashIndex = this.path.indexOf('/');
      if(slashIndex !== -1){
        this.modifiedPath = this.path.substring(0, slashIndex + 1)
      } else {
        this.modifiedPath = this.path
      }
      this.fileNamePath=this.modifiedPath+this.filePath;
      let data = this.getFileData(this.filePath);
      data.then(res=>{
        this.fileData=res;
       
        this.makeAllFalse();
        const ext=node.name.split('.').pop()
        this.switchToExtention(ext)
        this.queryparam(this.filePath);
        this.homeScreen=false;
        this.ind=0;
        this.selectedTabIndex = 0;
      });
    }
    else if(node.expandable){
      this.makeAllFalse();
      this.switchToExtention("nodeUpload");
      let filePath = this.getFilePath(node)
      this.homeScreen = true;
      this.nodeUpload=filePath;
      this.nodelevel=node.level;
      this.isFolderSummary = false;
      if (this.isGitView) {
        this.switchToExtention("code")
        this.fileNamePath = filePath;
        this.fetchSummaryOfFolder(filePath);
      }
    }
    else{
      this.makeAllFalse();
      this.switchToExtention("no preview");
    }
    // this.refreshChild=true;
  }

  uploadFile() {
    try{
      for(let i=0;i<this.tempDatasetArray.length;i++){
      this.datasetService.testConnection(this.tempDatasetArray[i]).subscribe((response) => {
        this.service.message('File Upload Initiated!');
        this.websocketConnection();
      },
      (err)=>{
        this.service.messageService("some error occured");
      })
    }
      this.fileNamePlaceholder=''
      this.tempDatasetArray=[];
    }
    catch(Exception){
      this.service.messageService("Some error occured")
    }
  }
 
  websocketConnection(){
    const socket = new SockJS('/ws');
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect({}, (frame) => {
      console.log('connected to webSocket server');
      this.stompClient.subscribe('/topic/fileUploadStatus', (message) => {
        console.log(message.body);
        // this.service.message(message.body);
        if(message.body=="Success") {
            this.service.message("File Uploaded Successfully!");
        } else {
            this.service.messageService("Error in file upload");
        }
        this.stompClient.disconnect(() => {
          console.log('Disconnected from WebSocket server');
        });
      });
    });
  }

async chunkFile(file) {
  this.tempDatasetArray=[]
  if(file.target.files.length==0){
    this.fileNamePlaceholder=''
    return;
  }
  for (let i = 0; i < file.target.files.length; i++) {
    if (file.target.files[i].name.endsWith(".pptx") || file.target.files[i].name.endsWith(".docx")){
      this.fileNamePlaceholder=''
      this.datasourceService.message("File format not supported", "error")
    } else {
      this.fileCount = this.fileCount + 1;
      this.uploadPercentage = 0;
      const chunkSize = 20000000;
      const formData: FormData = new FormData();
      let file1: File = file.target.files[i];
      let metadata = {};
      metadata["FileGuid"] = this.generateHash();
      metadata["FileName"] = file1.name;
      metadata["TotalCount"] = Math.ceil(file1.size / chunkSize);
      metadata["FileSize"] = file1.size;
      let metaDataIndex = 0;
      let count = 0;
      this.uploading=true;
      for (let offset = 0; offset < file1.size; offset += chunkSize) {
        const chunk = file1.slice(offset, offset + chunkSize);
        formData.set("file", chunk, file1.name);
        metadata["Index"] = metaDataIndex++;
        formData.set("chunkMetadata", JSON.stringify(metadata));
        this.tempDataset['attributes']=this.cardData.attributes;
        this.tempDataset['datasource']=this.cardData.datasource;
        if(typeof(this.tempDataset.attributes)=="string")
        this.tempDataset.attributes=JSON.parse(this.tempDataset.attributes);
        let res = this.datasetService.uploadChunks(this.datasetName, formData).toPromise();
        await res.then((res)=>{
          count += 1;
          if (count < Math.ceil(file1.size / chunkSize))
              this.onUploadProgress(chunkSize,count * chunk.size, file1.size);
          if(count==Math.ceil(file1.size / chunkSize)){  
          this.uploadPercentage=100;
          if(this.nodelevel>0){
            this.tempDataset.attributes['object']=this.nodeUpload+"/"+file.target.files[i].name;
            // console.log("object in if",this.nodeUpload+"/"+file.target.files[i].name)
          } else {
            this.tempDataset.attributes['object']=file.target.files[i].name;
            // console.log("object in else",file.target.files[i].name)
          }
          this.tempDataset.attributes['uploadFile']=res.body.uploadFilePath;
          // console.log("uploadFile",res.body.uploadFilePath)
          this.tempDatasetArray.push(JSON.parse(JSON.stringify(this.tempDataset)));  
          this.uploading=false;
          this.service.message('File Chunked Successfully!');
          }
        })
        .catch((err)=>{
          console.log(err);
          console.log('An error occured');
          this.service.messageService('Error! while uploading file',);
          this.uploading=false;
        });
       }
      }
    }
    if(this.fileCount!==0){
      this.fileNamePlaceholder=`${this.fileCount} files selected`;
    } else {
      this.fileNamePlaceholder=''
    }
    file.value='';
  }

generateHash() {
  return Array.apply(0, Array(5))
    .map(function () {
      return (function (charset) {
        let min = 0;
        let max = charset.length - 1;
        let rand =
          window.crypto.getRandomValues(new Uint32Array(1))[0] /
          (0xffffffff + 1);
        return charset.charAt(Math.floor(rand * (max - min + 1)) + min);
      })("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");
    })
    .join("");
}


onUploadProgress(chunkSize,bytesLoaded, bytesTotal) {
  let dlper: number = Math.round(((bytesLoaded / bytesTotal) * 100) * 100) / 100;
  this.uploadPercentage = dlper > 99.99 ? 99.99 : dlper;
}
  
  queryparam(filePath){
    const url = this.router.createUrlTree([], {
      queryParams: {flname: filePath},
      queryParamsHandling: 'merge',
    }).toString();
    this.location.replaceState(url);
  }

  mapfile(file){
    this.homeScreen = false;
    let data = this.getFileData(file);
      data.then(res=>{
        this.fileData=res;
        this.makeAllFalse();
        const ext=file.split('.').pop()
        this.switchToExtention(ext)
      });
  }
  
  getFileData(fileName){
    this.fetchFile=true;
    return this.service.getNutanixFileData(this.datasetName,[fileName],localStorage.getItem('organization')).toPromise()
    .catch(err=>this.service.messageService('Some error occured while fetching file'));
  }

  downloadFiles(){
    this.downloadFilesList=[];
    this.filesList=[];
    this.checklistSelection.selected.forEach(node=> {
      if (!node.expandable){
      const ext = (node.name).split('.').pop()
      this.filesList.push({filename:node.name,data:"",extension:ext})
      let filePath=this.getFilePath(node);
      this.downloadFilesList.push(filePath);
      this.flag=0
      }
    } );
    this.service.getNutanixFileData(this.datasetName,this.downloadFilesList,localStorage.getItem('organization'))
    .subscribe(
      (res)=>{
        res.forEach((item,index)=>this.filesList[index].data=item);
        this.download();
      },
      (err)=>this.service.messageService('some error occurred')
    );
  }  

  fileDownload(node){
    let filePath = this.getFilePath(node)
    let data = this.getFileData(filePath)
    let extension = (node.name).split('.').pop()
    if(extension.match('mkv')){
      this.service.messageService('This file cannot be downloaded currently');
      this.fetchFile=false;
    }
    else{
      data.then((res)=>{
        this.downloadSelectFiles(node.name,res[0],extension)
      })
    }
  } 

  getFilePath(node):string{
    let path=node.name
    let level=node.level;
    let tempNode = node
    while(level>1){
        this.flag=1
        let childnode = this.getParentNode(tempNode);
        path=`${childnode.name}/`+path;
        tempNode=childnode
      level=level-1
    }
    return path
  }

  selectfile(){
    const file = this.menuNode;
    this.fileDownload(file);
    this.shownMenu = false;
  }

  deletefile(){
    let node = this.menuNode
    let fileName = this.getFilePath(node);
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.service.deleteNutanixFile(fileName,this.datasetName,localStorage.getItem('organization')).subscribe((res) => {
           this.service.messageNotificaionService('success', "File Deleted Successfully");
           this.refresh.emit(true);
           this.makeAllFalse();
           this.homeScreen=true;
          },(error)=>{
            this.service.messageNotificaionService('error', "Error");
          });
      } 
    });
    this.fetchFile=false;
  }

  async info(){
    let node = this.menuNode
    let fileName = this.getFilePath(node);
    let data = this.getFileInfo(fileName);
    await data.then(res=>{
      this.fileSize=res[0][0].filesize;
      this.lastModified=res[0][0].lastdate;
    },(error)=>{
      this.service.messageNotificaionService('error', "Can't access file info currently");
      this.fetchFile=false;
    });
    let sizeofFile = this.sizeConvert(this.fileSize);
    const dial = this.dialog.open(FileInfoComponent,{
      height: '24%',
      width: '26%',
      disableClose: true,
      data:{
        filename : node.name,
        filesize: sizeofFile,
        lastmodifydate: this.lastModified
      },
    });
    dial.afterClosed().subscribe((result) => {
    });
    this.fetchFile=false;
  }

  getFileInfo(fileName){
    return this.service.getNutanixFileInfo(this.datasetName,[fileName],localStorage.getItem('organization')).toPromise()
    .catch(err=>this.service.messageService('Error occured while fetching file info'));
  }
  
  sizeConvert(size:number){
    const kb = 1024;
    const mb = kb*1024;
    const gb = mb*1024;
    if(size<kb){
      return size+' B';
    } else if(size<mb){
      return (size/kb).toFixed(2)+' KB';
    } else if(size<gb){
      return (size/mb).toFixed(2)+' MB';
    } else 
      return (size/gb).toFixed(2)+' GB';
  }

  deleteFiles(){
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.deleteFileList=[];
        this.checklistSelection.selected.forEach(node=> {
          if (!node.expandable){
            this.deleteFileList = node
            let filePath=this.getFilePath(node);
            this.deleteFileList=filePath;
            this.flag=0
          }
          this.service.deleteNutanixFile(this.deleteFileList,this.datasetName,localStorage.getItem('organization')).subscribe((res) => {
            this.service.messageNotificaionService('success', "Selected Files Deleted Successfully");
            this.refresh.emit(true);
            this.makeAllFalse();
            this.homeScreen=true;
          }, (error) => {
            this.service.messageNotificaionService('error', "Error");
          });
          this.fetchFile=false;
          this.checklistSelection.clear();
        });
      } 
    });
  }

  basicReqTabChange(ind) {
    this.fileData='';
    switch (ind) {
      case 0:
        this.tabReq = 'filePreview';
        let data = this.getFileData(this.filePath);
        data.then(res=>{
          this.fileData=res;
          this.fetchFile=false;
        })
        this.fetchFile=false;
        break;
      case 1:
        this.tabReq = 'translation';  
        this.getTranslation();
        break;
      case 2:
        this.tabReq = 'fileSummary';  
        this.getSummary();
        break;
      case 3:
        this.tabReq = 'faq';
        this.getFAQ();
        break;
    }
  }

  basicReqTabChangeForGit(ind, triggeredFrom?) {
    this.enableEdit = false;
    if (triggeredFrom) {
      this.isTabSummary = false;
    } else {
      this.isTabSummary = true;
    }
    this.fileData = null;
    switch (ind) {
      case 0:
        this.tabReq = 'filePreview';
        let data = this.getFileData(this.filePath);
        data.then(res => {
          this.isTabSummary = true;
          this.fileData = res;
          this.fetchFile = false;
        })
        this.fetchFile = false;
        break;
      case 1:
        this.tabReq = 'fileSummary';
        this.getSummary();
        break;
    }
  }

  getTranslation(){
    let pathString:string =this.fileNamePath;
    const pathDetails = pathString.split('/');
    const lstPath = pathDetails[pathDetails.length-1]
    const filenameNoExt = lstPath.replace(/\.[^/.]+$/, '')
    let part: string[] = pathString.split("/");
    let name: string = part[part.length-1].split(".")[0];
    if(pathString.split("/").length === 2) {
      this.fullPath = ".aip/Translation/"+filenameNoExt+".txt"
    } else {
      let path: string = part.slice(0, part.length-1).join("/");
      let parts: string[] = path.split("/");
      parts.shift();
      path = parts.join("/");
      this.fullPath = path+"/.aip/Translation/"+filenameNoExt+".txt"
    }
    let data = this.getFileData(this.fullPath);
    data.then(res=>{
      this.fileData=res;
      this.fetchFile=false;
    });
  }
  
  getSummary(){
    let pathString:string =this.fileNamePath;
    const pathDetails = pathString.split('/');
    const lstPath = pathDetails[pathDetails.length-1]
    const filenameNoExt = lstPath.replace(/\.[^/.]+$/, '')
    let part: string[] = pathString.split("/");
    let name: string = part[part.length-1].split(".")[0];
    if(pathString.split("/").length === 2) {
      this.fullPath = ".aip/Summary/"+filenameNoExt+".txt"
    } else {
      let path: string = part.slice(0, part.length-1).join("/");
      let parts: string[] = path.split("/");
      parts.shift();
      path = parts.join("/");
      this.fullPath = path+"/.aip/Summary/"+filenameNoExt+".txt"
    }
    this.selectedPathForSummary = _.cloneDeep(this.fullPath);
    let data = this.getFileData(this.fullPath);
    data.then(res=>{
      this.isTabSummary=true;
      this.fileData=res;
      this.fetchFile=false;
    });
  }

  getFAQ(){
    let pathString:string =this.fileNamePath;
    const pathDetails = pathString.split('/');
    const lstPath = pathDetails[pathDetails.length-1]
    const filenameNoExt = lstPath.replace(/\.[^/.]+$/, '')
    let part: string[] = pathString.split("/");
    let name: string = part[part.length-1].split(".")[0];
    if(pathString.split("/").length === 2) {
      this.fullPath = ".aip/FAQ/"+filenameNoExt+".txt"
    } else {
      let path: string = part.slice(0, part.length-1).join("/");
      let parts: string[] = path.split("/");
      parts.shift();
      path = parts.join("/");
      this.fullPath = path+"/.aip/FAQ/"+filenameNoExt+".txt"
    }
    let data = this.getFileData(this.fullPath);
    data.then(res=>{
      this.fileData=res;
      const objectData = Object.assign({}, ...this.fileData.flat());
      this.questions = Object.keys(objectData);
      this.answers = Object.values(objectData);
      this.fetchFile=false;
    });
  }

  enableEditing() {
    this.enableEdit = true;
  }

  getObjAndPath(targetPath: string): { path: string, obj: string } {
    for (const item of this.listObjectsJson) {
      if (item.includes(targetPath)) {
        const parts = item.split('/');
        const obj = parts.pop();
        const path = parts.join('/');
        return { path, obj };
      }
    }
    const parts = targetPath.split('/');
    const obj = parts.pop();
    const path = parts.join('/');
    return { path, obj };
  }
  
  saveEditedData() {
    try {
      let result = this.getObjAndPath(this.selectedPathForSummary);
      this.tempFileName = result.obj;
      this.fullPath = result.path;
      let datasetForGit = _.cloneDeep(this.cardData);
      let connection = datasetForGit['datasource'];
      connection.connectionDetails = JSON.parse(connection.connectionDetails);
      let bucket = connection.connectionDetails['bucketname'];
      let bucketPath = connection.connectionDetails['bucketPath'];
      let s3ConnectionId = connection.connectionDetails['datasource'];

      this.service.getCoreDatasource(s3ConnectionId, sessionStorage.getItem("organization")).subscribe(res => {
        let s3Connection = res;
        datasetForGit.datasource = s3Connection;
        let attribute = {};
        attribute['bucket'] = bucket;
        if (this.fullPath && this.fullPath.includes(bucketPath) && this.fullPath.startsWith(bucketPath)) {
          attribute['path'] = "";
        } else {
          attribute['path'] = bucketPath;
        }

        attribute['QueryParams'] = "";
        attribute['Headers'] = "";
        this.service.createTempTextFileforS3(this.fileData, this.tempFileName).subscribe(resp => {
          console.log(resp);
          let response = resp;
          let responseJson = JSON.parse(response);
          attribute['uploadFile'] = responseJson['uploadFilePath'];
          attribute['object'] = responseJson['object'];
          attribute['path'] = attribute['path'] + '/' + this.fullPath;
          if (attribute['path'] && attribute['path'].startsWith('/')) {
            attribute['path'] = attribute['path'].substring(1);
          }
          datasetForGit.attributes = attribute;
          datasetForGit['taskdetails'] = null;
          console.log('dataset:', datasetForGit);

          this.datasetService.testConnection(datasetForGit).subscribe((response) => {
            console.log('test response:', response);
            this.service.message('File saved successfully');
            this.enableEdit = false;
          }, (error) => {
            this.service.message('Error in Saving', 'error');
          })
        });
      });
    } catch (e) {
      console.log('Error:', e);
      this.service.message('Error in Saving', 'error');
    }
  }

  extractRepoName(repoUrl: string): string {
    const parts = repoUrl.split('/');
    let lastSegment = parts[parts.length - 1];
    if (lastSegment.endsWith('.git')) {
      lastSegment = lastSegment.substring(0, lastSegment.length - 4);
    }
    return lastSegment;
  }

  getFilePathForSummary(path: string): string {
    const parts = path.split('/');
    if (parts.length === 1) {
      return `.aip/Summary/${parts[0]}.txt.txt`;
    }
    const lastSegment = parts.pop();
    const newSegment = `.aip/Summary/${lastSegment}.txt.txt`;
    parts.push(newSegment);
    return parts.join('/');
  }

  fetchSummaryOfFolder(path, isRepo?) {
    this.tabReq = 'fileSummary';
    let fullPathForSummary = this.getFilePathForSummary(path);
    if (isRepo) {
      this.switchToExtention("code");
      let datasetForSummary = _.cloneDeep(this.cardData);
      let attributes = datasetForSummary['attributes'];
      attributes = JSON.parse(attributes);
      let repoName = this.extractRepoName(attributes['url']);
      fullPathForSummary = this.getFilePathForSummary(repoName);
      this.fileNamePath = repoName;
    }
    this.selectedPathForSummary = fullPathForSummary;
    let data = this.getFileData(fullPathForSummary);
    data.then(res => {
      this.isTabSummary = true;
      this.homeScreen = false;
      this.fileData = res;
      this.fetchFile = false;
      this.isFolderSummary = true;
    });
  }
}
