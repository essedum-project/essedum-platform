// import { throwError } from "rxjs";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { MessageService } from "../../services/message.service";
@Injectable({
 providedIn: "root",
})
export class CustomErrorHandlerService {
 constructor() {}

 handleError(error: any) {
  console.error(error);
 }

 handleAPIError(error: any) {
  let errObj = null;

  let tempStr = error.statusText ? error.statusText : error.title ? error.title : "Error message not available";
  let msg = error.message ? error.message : `${error.status}: ${tempStr}`;

  let body = error["_body"];

  if (body) {
   try {
    errObj = body === Object(body) ? body : JSON.parse(body);
   } catch (err) {
    console.dir(body);
   }
  }

  if (errObj) {
   if (!errObj.message) {
    errObj["message"] = msg;
   }
  } else {
   errObj = {};
   errObj["code"] = error.status;
   errObj["message"] = msg;
   errObj["detailedMessage"] = error.detail ? error.detail : msg;
  }

  error["_body"] = errObj;

  console.dir(error);

//   if (error.status === 401) window.location.href = "/";
  return throwError(errObj.message);
 }
}
