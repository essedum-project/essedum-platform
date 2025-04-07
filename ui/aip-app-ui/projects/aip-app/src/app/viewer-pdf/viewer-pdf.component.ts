import { AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Services } from '../services/service';
import { DatasetServices } from '../dataset/dataset-service';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-viewer-pdf',
  templateUrl: './viewer-pdf.component.html',
  styleUrls: ['./viewer-pdf.component.scss']
})
export class ViewerPdfComponent implements AfterViewInit, OnChanges {
  @Input('pdfFile') pdfData;
  @Input() AnnotateFlag;
  @ViewChild('pdfIframe') pdfIframe: ElementRef;
  @Input('pdfViewDetails') pdfDetails;
  @Input() selectedReferenceObject;
  @Input() filelist;
  @Input() fileType;
  tabReq:string = 'filePreview'
  fileData:any;
  tempFileData:any;
  dataset:any;
  fullPath:string;
  tempFileName:string;
  datasetName:string;
  questions;
  answers;
  fetchFile:boolean=false;
  noData:boolean=false;
  conatiner: boolean=false;
  opts=[{viewValue: 'English', value: 'eng'}, {viewValue: 'Hindi', value: 'hin'}, {viewValue: 'German', value: 'deu'}, {viewValue: 'Telugu', value: 'tel'},
    {viewValue: 'Kannada', value: 'kan'}, {viewValue: 'Tamil', value: 'tam'}, {viewValue: 'French', value: 'fre'}, {viewValue: 'Spanish', value: 'spa'}]
  language:string
  filteredOpts: any[];
  filenameNoExt:string
  langOption: { viewValue: string; value: string; }[];
  enableEdit: boolean=false;

  constructor(private service: Services,
    private dsetservice: DatasetServices,
    private changedetectionref:ChangeDetectorRef,
    private route:ActivatedRoute) { 
      // this.tabReq='filePreview';

      this.datasetName=this.route.snapshot.paramMap.get('cname')
    }

  ngAfterViewInit(): void {
    if (this.pdfData) {
      this.displayPdf();
    }
  }

  ngOnChanges(simpleChanges: any) {
    if((simpleChanges.pdfDetails.currentValue !== simpleChanges.pdfDetails.previousValue && simpleChanges.pdfDetails.previousValue !== undefined)|| (simpleChanges.pdfData.currentValue !== simpleChanges.pdfData.previousValue && simpleChanges.pdfData.previousValue !== undefined)){
      if(this.tabReq=='filePreview'){
      this.basicReqTabChange(0);
      }
      else if(this.tabReq=='translation'){
        this.basicReqTabChange(1);
      }
      else if(this.tabReq=='fileSummary'){
        this.basicReqTabChange(2);
      }
      else if(this.tabReq=='faq'){
        this.basicReqTabChange(3);
      }
      else if(this.tabReq=='annotate'){
        this.basicReqTabChange(4);
      }
      // this.changedetectionref.detectChanges();
      // this.displayPdf();
    }
  }

  displayPdf() {
    const byteArray = this.base64ToUint8Array(this.pdfData);
    const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(pdfBlob);
    if (this.pdfData && !this.selectedReferenceObject) {
      const pathDetails = this.pdfDetails.split('/');
      const lstPath = pathDetails[pathDetails.length - 1]
      this.filenameNoExt = lstPath.replace(/\.[^/.]+$/, '')
    }
    
    if (this.selectedReferenceObject && this.selectedReferenceObject.page)
    {
      if (this.selectedReferenceObject.fileName)
        this.pdfDetails = this.selectedReferenceObject.fileName;
      if (this.selectedReferenceObject.datasetId)
        this.datasetName = this.selectedReferenceObject.datasetId;
      this.pdfIframe.nativeElement.src = `${pdfUrl}#page=${this.selectedReferenceObject.page}`;
    }
    else
      this.pdfIframe.nativeElement.src = pdfUrl;
  }

  base64ToUint8Array(base64String: string): Uint8Array {
    const binaryString = window.atob(base64String);
    const byteArray = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }

    return byteArray;
  }

  basicReqTabChange(index) {
    this.enableEdit=false;
    this.fileData='';
    this.fetchFile=true;
    this.conatiner=true;
    this.noData=false;
    switch (index) {
      case 0:
        this.tabReq = 'filePreview';
        this.refreshiframe();
        this.fetchFile=false;
        this.conatiner=false;
        break;
      case 1:
        this.tabReq = 'translation';  
        this.opt();
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
        case 4:
        this.tabReq = 'annotate';
        this.fetchFile=false;
        break;
    }
  }
  refreshiframe() {
    setTimeout(() => { 
      this.ngAfterViewInit(); 
    }, 1000);
  }

  getTranslation(){
    this.fileData='';
    this.fetchFile=true;
    this.conatiner=true;
    this.noData=false;
    let pathString:string =this.pdfDetails;
    const pathDetails = pathString.split('/');
    const lstPath = pathDetails[pathDetails.length-1]
    this.filenameNoExt = lstPath.replace(/\.[^/.]+$/, '')
    let part: string[] = pathString.split("/");
    let name: string = part[part.length-1].split(".")[0];
    if(pathString.split("/").length === 2) {
      this.fullPath = ".aip/Translation/"+this.filenameNoExt+'_'+this.language+".txt"
    } else {
      let path: string = part.slice(0, part.length-1).join("/");
      let parts: string[] = path.split("/");
      parts.shift();
      path = parts.join("/");
      this.fullPath = path+"/.aip/Translation/"+this.filenameNoExt+'_'+this.language+".txt"
    }
    let data = this.getFileData(this.fullPath);
    data.then(res=>{
      this.fileData=res;
      this.fetchFile=false;
      this.noData=true;
    });
  }
  
  getSummary(){
    let pathString:string =this.pdfDetails;
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
    let data = this.getFileData(this.fullPath);
    data.then(res=>{
      this.fileData=res;
      this.fetchFile=false;
      this.noData=true;
    });
  }

  getFileData(fileName){
    return this.service.getNutanixFileData(this.datasetName,[fileName],localStorage.getItem('organization')).toPromise()
    .catch(err=>this.service.messageService('Some error occured while fetching file'));
  }

  getFAQ(){
    let pathString:string =this.pdfDetails;
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
      this.noData=true;
    });
  }

  selectChange(language){
    this.language=language;
  }

  onLanguageChange(newLanguage: string) {
    this.language=newLanguage;
    this.getTranslation()
  }

  options(name:string){
    this.filteredOpts=[];
    this.langOption=[]
    const fullName = new RegExp(`^.*\/${name}_[a-z]+\\.txt$`);
    this.filteredOpts = this.filelist.filter(opt => fullName.test(opt));
    this.langOption = this.opts.filter(opt => 
    this.filteredOpts.some(filename => filename.includes(opt.value)));
    if(this.langOption.length>0)
      this.language=this.langOption[0].value;
  }

  opt(){
    if(this.fileType==='Pdf View'){
      this.langOption=this.opts;
      if(this.langOption.length>0)
        this.language=this.langOption[0].value;
    }
    else if (this.selectedReferenceObject && this.selectedReferenceObject.views == 'Pdf View'){
      this.langOption=this.opts;
      if(this.langOption.length>0)
        this.language=this.langOption[0].value;
      this.pdfDetails = this.selectedReferenceObject.path;
      this.datasetName = this.selectedReferenceObject.name;
    }
    else
      this.options(this.filenameNoExt);
  }

  onFileDataChange(event){
    event.preventDefault();
    const element=event.target as HTMLInputElement;
    this.tempFileData=element.innerHTML;
  }
  
  saveEditedData(){
    this.enableEdit=false;
    let pathString:string =this.pdfDetails;
    const pathDetails = pathString.split('/');
    const lstPath = pathDetails[pathDetails.length-1]
    const filenameNoExt = lstPath.replace(/\.[^/.]+$/, '')
    let part: string[] = pathString.split("/");
    let name: string = part[part.length-1].split(".")[0];
  
    if(pathString.split("/").length === 2) {
      if(this.tabReq=='translation'){
        this.tempFileName=this.filenameNoExt+'_'+this.language+".txt"

      }
      else if(this.tabReq=='fileSummary'){
      this.tempFileName = filenameNoExt+".txt"
      }
    } else {
      let path: string = part.slice(0, part.length-1).join("/");
      let parts: string[] = path.split("/");
      parts.shift();
      path = parts.join("/");
      this.fullPath = path+"/.aip/Summary/"+filenameNoExt+".txt"
    }
    // this.fileData=this.tempFileData;
    this.service.createTempTextFileforS3(this.fileData,this.tempFileName).subscribe(resp => {
      console.log(resp);
      let response=resp;
      let responseJson=JSON.parse(response);
      responseJson['uploadFilePath']
      
      this.dsetservice.getDatasetByNameAndOrg(this.datasetName).subscribe(dset=>{
        this.dataset=dset;
        let attribute= this.dataset['attributes'];
        let attributes= JSON.parse(attribute);
        attributes['object']=responseJson['object'];
        attributes['uploadFile']=responseJson['uploadFilePath'];
        if(this.tabReq=='translation'){
          attributes['path']= attributes['path']+"/.aip/Translation";
  
        }
        else if(this.tabReq=='fileSummary'){
          attributes['path']= attributes['path']+"/.aip/Summary";
        }
        this.dataset['attributes']=attributes;
        this.dataset['taskdetails']=null;
        this.dsetservice.testConnection(this.dataset).subscribe((response) => {
          this.service.message('File saved successfully');
          if(this.tabReq=='translation'){
            this.getTranslation();
    
          }
          else if(this.tabReq=='fileSummary'){
            this.getSummary();
          }
      }, (error) => {
        this.service.message('Error in Saving','error');
      })
    });
    
    console.log(this.fileData);
  });
}
  enableEditing(){
    this.enableEdit=true;
  }

}
