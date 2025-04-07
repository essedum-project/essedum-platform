import { Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Services } from '../services/service';

@Component({
  selector: 'app-viewer-audio',
  templateUrl: './viewer-audio.component.html',
  styleUrls: ['./viewer-audio.component.scss']
})
export class ViewerAudioComponent{
  @Input('AudioResponse') audioData;
  @ViewChild('audioPlayer') audioPlayer: ElementRef;
  @Input('audioViewDetails') audioDetails;
  @Input('ind') index;
  @Input() filelist;
  @Input() fileType;
  datasetName:string;
  tabReq:string = 'filePreview'
  fileData:any;
  fullPath:string;
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
  langOption:{ viewValue: string; value: string; }[];

  constructor(private service:Services,
    private route:ActivatedRoute){
    this.datasetName=this.route.snapshot.paramMap.get('cname')
  }
  
  ngOnChanges(simpleChanges:any) {
    if (simpleChanges.audioData.currentValue !== simpleChanges.audioData.previousValue && simpleChanges.audioData.previousValue !== undefined) {
    this.playAudio();
    }
  }

  ngAfterViewInit(): void {
    if (this.audioData) {
      this.playAudio();
    }
  }

  playAudio() {
    const pathDetails = this.audioDetails.split('/');
    const lstPath = pathDetails[pathDetails.length-1]
    this.filenameNoExt = lstPath.replace(/\.[^/.]+$/, '')
    this.audioPlayer.nativeElement.src = this.audioData;
  }

  basicReqTabChange(index) {
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
        this.tabReq = 'transcription';
        this.getTranscription();
        break; 
      case 2:
        this.tabReq = 'translation';  
        this.opt();
        this.getTranslation();
        break;
      case 3:
        this.tabReq = 'fileSummary';  
        this.getSummary();
        break;
      case 4:
        this.tabReq = 'faq';
        this.getFAQ();
        break;
    }
  }
  refreshiframe() {
    setTimeout(() => { 
      this.ngAfterViewInit(); 
    }, 1000);
  }

  getTranscription(){
    let pathString:string =this.audioDetails;
    const pathDetails = pathString.split('/');
    const lstPath = pathDetails[pathDetails.length-1]
    const filenameNoExt = lstPath.replace(/\.[^/.]+$/, '')
    let part: string[] = pathString.split("/");
    let name: string = part[part.length-1].split(".")[0];
    if(pathString.split("/").length === 2) {
      this.fullPath = ".aip/Transcribe/"+filenameNoExt+".txt"
    } else {
      let path: string = part.slice(0, part.length-1).join("/");
      let parts: string[] = path.split("/");
      parts.shift();
      path = parts.join("/");
      this.fullPath = path+"/.aip/Transcribe/"+filenameNoExt+".txt"
    }
    let data = this.getFileData(this.fullPath);
    data.then(res=>{
      this.fileData=res;
      this.fetchFile=false;
      this.noData=true;
    });
  }
  
  getTranslation(){
    this.fileData='';
    this.fetchFile=true;
    this.conatiner=true;
    this.noData=false;
    let pathString:string =this.audioDetails;
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
    let pathString:string =this.audioDetails;
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
    let pathString:string =this.audioDetails;
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
    if(this.fileType==='Video View'){
      this.langOption=this.opts;
      if(this.langOption.length>0)
        this.language=this.langOption[0].value;
    }
    else
      this.options(this.filenameNoExt);
  }
 
}
