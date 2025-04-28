import { Injectable } from '@angular/core';
import { HttpHandler, HttpClient } from '@angular/common/http';
import { Notifications } from '../models/notifications';
import { throwError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Audit } from '../models/audit';

@Injectable()
export class AuditService {

  constructor(private _httpHandler: HttpHandler,
    private https: HttpClient
  ) { }

  //Create a new Auit
  createAudit(audit: Audit): Observable<Audit> {
    return this.https
      .post("/api/audit/saveAll", audit, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          if (response.status == 200) {
            return new Audit(response.body);
          }
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleAPIError(err);
        })
      );
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
    // if (error.status === 401) window.location.href = "/";
    return throwError(errObj.message);
  }
}
