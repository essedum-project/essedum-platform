import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { Delegate } from "../models/delegate";
// import { CustomErrorHandlerService } from "../shared-modules/custom-error-handler/custom-error-handler.service";
import { MessageService } from "./message.service";
import { throwError, pipe } from "rxjs";
import { map, catchError } from "rxjs/operators";

@Injectable()
export class DelegateService {
    constructor(
        private https: HttpClient,
        private messageService: MessageService,
        // private customErrorHandlerService: CustomErrorHandlerService
      ) {
          
    }

    private handleError(error: any) {
        // TODO: seems we cannot use messageService from here...
        let errMsg = error.error;
        error.status ? `Status: ${error.status} - Text: ${error.statusText}` : "Server error";
        console.error(errMsg); // log to console instead
        if (error.status === 401) {
          window.location.href = "/";
        }
        return throwError(errMsg);
    }

    private convert(delegate: Delegate): Delegate {
        const copy: Delegate = Object.assign({}, delegate);
        return copy;
    }

    getAllDelegates(request : string) {
        let headers = new HttpHeaders().append('example', request);
        return this.https
            .get("/api/delegates", 
                { observe: "response", headers: headers 
            })
            .pipe(
                map((response) => {
                    let pr: any = response.body;
                    return new PageResponse<Delegate>(pr.totalPages, pr.totalElements, Delegate.toArray(pr.content));
                })
            )
            .pipe(
                catchError((err) => {
                  return this.handleError(err);
                })
              );
    }

    createDelegate(delegate: Delegate) : Observable<Delegate> {
        
        const copy = this.convert(delegate);

        return this.https
            .post("/api/delegate", copy, { observe: "response" })
            .pipe(
                map((response) => {
                return new Delegate(response.body);
            })
        )
        .pipe(
            catchError((err) => {
            return this.handleError(err);
            })
        );
    }

    updateDelegate(delegate : Delegate) {
        let body;

        try {
            body = JSON.stringify(delegate);
        } catch (e) {
            console.error("JSON.stringify error - ", e.message);
        }

        return this.https
        .put("/api/delegate", body, {
          observe: "response",
        })
        .pipe(
          map((response) => {
            return new Delegate(response.body);
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    }

    findAll(delegate: Delegate, event: any): Observable<PageResponse<Delegate>> {
        let req = new PageRequestByExample(delegate, event);
        let body;
        let headerValue;

        try {
            body = JSON.stringify(req);
            headerValue = Buffer.from(body, 'utf8').toString('base64');
        } catch (e) {
            console.error("JSON.stringify error - ", e.message);
        }

        let headers = new HttpHeaders();
        headers = headers.append('example', headerValue);

        return this.https
        .get("/api/delegates/page", {
          observe: "response", headers: headers,
        })
        .pipe(
          map((response) => {
            let pr: any = response.body;
            return new PageResponse<Delegate>(pr.totalPages, pr.totalElements, Delegate.toArray(pr.content));
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
        
    }

    getDelegate(id: any) : Observable<Delegate> {
        return this.https
      .get("/api/delegate/" + id, { observe: "response" })
      .pipe(
        map((response) => {  
          return new Delegate(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
    }

    getDelegatesByUserId(userId, projectId): Observable<Delegate[]> {
      return this.https
      .get("/api/delegatesByUserId/" + userId + '/' + projectId, { observe: "response" })
      .pipe(
        map((response) => { 
          let a: any = response.body; 
          return Delegate.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
    }
}