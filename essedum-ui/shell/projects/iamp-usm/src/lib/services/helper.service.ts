import { ElementRef, Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Injectable()
export class HelperService {
 constructor(public _DomSanitizer: DomSanitizer) {}

 /**
  * Method to open file
  */
 openFile(contentType: string, data: string) {
  const fileURL = `data:${contentType};base64,${data}`;
  const win = window.open();
  win.document.write(
   '<iframe src="' +
    fileURL +
    '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;"\
     allowfullscreen></iframe>'
  );
 }

 /**
  * Method to convert the file to base64
  */
 toBase64(file: File, cb: Function) {
  const fileReader: FileReader = new FileReader();
  fileReader.readAsDataURL(file);
  fileReader.onload = function (e: any) {
   const base64Data = e.target.result.substr(e.target.result.indexOf("base64,") + "base64,".length);
   cb(base64Data);
  };
 }

 /**
  * Method to clear the input
  */
 clearInputImage(entity: any, elementRef: ElementRef, field: string, fieldContentType: string, idInput: string) {
  if (entity && field && fieldContentType) {
   if (entity.hasOwnProperty(field)) {
    entity[field] = null;
   }
   if (entity.hasOwnProperty(fieldContentType)) {
    entity[fieldContentType] = null;
   }
   if (elementRef && idInput && elementRef.nativeElement.querySelector("#" + idInput)) {
    elementRef.nativeElement.querySelector("#" + idInput).value = null;
   }
  }
 }
}
