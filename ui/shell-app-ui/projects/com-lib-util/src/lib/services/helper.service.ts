//
// Copyright © 2016-2017 Infosys Limited, Bangalore, India. All Rights Reserved.
// * Except for any open source software components embedded in this
// * Infosys proprietary software program (Program), this Program is protected
// * by copyright laws, international treaties and other pending or existing
// * intellectual property rights in India, the United States and other countries.
// * Except as expressly permitted, any unauthorized reproduction, storage,
// * transmission in any form or by any means (including without limitation
// * electronic, mechanical, printing, photocopying, recording or otherwise),
// * or any distribution of this Program, or any portion of it,
// * may result in severe civil and criminal penalties, and
// * will be prosecuted to the maximum extent possible under the law.
// Template pack-angular:web/src/app/service/auth.service.ts.p.vm
//

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
