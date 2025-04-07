import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-viewer-zip',
  templateUrl: './viewer-zip.component.html',
  styleUrls: ['./viewer-zip.component.scss']
})
export class ViewerZipComponent {
  @Input() ResponseList:any;
  currentPage: number = 1;
  pageSize:number = 1;
  fileList:{ filename: string; data: string; extension:string}[]=[];
  pathName:string;

  ngOnInit() {
   this.addtoList(this.ResponseList);
  }

  ngOnChanges(changes:SimpleChanges){
    this.addtoList(this.ResponseList);
  }

  addtoList(responseList: any) {
    this.fileList=[];
    for(var item of responseList) {
      let entry = Object.keys(item);
        const name = entry[0];
        let data = item[name];
        const extension = name.split('.').pop();
        const flname = name.split('/').pop();
        const folderpath = name.split('/')[0];
        if(extension.match(/mp3|mp4/)){
          data = this.convertToURL(data);
        }
        const file = { filename: flname, data: data, extension: extension }
        this.fileList.push(file);
        this.pathName=folderpath;
      }
  }

  convertToURL(mediaData) {
    const byteArray = this.base64ToUint8Array(mediaData);
    const audioBlob = new Blob([byteArray], { type: 'audio/mp3' });
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl
  }

  base64ToUint8Array(base64String: string): Uint8Array {
    const binaryString = window.atob(base64String);
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
    return byteArray;
  }

  isImage(ext):boolean{
    return ['png','jpeg','jpg'].includes(ext);
  }

  handlePageChange(event:any){
    this.currentPage=event;
  }

}