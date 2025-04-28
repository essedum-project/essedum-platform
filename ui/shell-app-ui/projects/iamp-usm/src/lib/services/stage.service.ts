import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, map, catchError, throwError } from "rxjs";
// import { Observable } from "rxjs/Observable";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { Stage } from "../models/stage";
import { CustomErrorHandlerService } from "../shared-modules/custom-error-handler/custom-error-handler.service";
import { MessageService } from "./message.service";
// import { throwError } from "rxjs";
// import { map, catchError } from "rxjs/operators";

@Injectable()
export class StageService{

    constructor(
        private https: HttpClient,
        private messageService: MessageService,
        private customErrorHandlerService: CustomErrorHandlerService
    ) {}

    private handleError(error: any) {
        // TODO: seems we cannot use messageService from here...
        let errMsg = error.error;
        error.status ? `Status: ${error.status} - Text: ${error.statusText}` : "Server error";
        console.error(errMsg); // log to console instead
        // if (error.status === 401) {
        //   window.location.href = "/";
        // }
        return throwError(errMsg);
    }

    private convert(stage: Stage): Stage {
        const copy: Stage = Object.assign({}, stage);
        return copy;
    }

    createStage(stage: Stage) : Observable<Stage> {
        
        const copy = this.convert(stage);
  
        return this.https
            .post("/api/usmStage", copy, { observe: "response" })
            .pipe(
                map((response) => {
                return new Stage(response.body);
            })
        )
        .pipe(
            catchError((err) => {
            return this.handleError(err);
            })
        );
      }

      findAll(stage: Stage, event: any): Observable<PageResponse<Stage>> {
        let req = new PageRequestByExample(stage, event);
        let body;
        let headerValue;

        try {
            body = JSON.stringify(req);
            headerValue = Buffer.from(body, 'utf8').toString('base64');
        } catch (e : any)  {
            console.error("JSON.stringify error - ", e.message);
        }

        let headers = new HttpHeaders();
        headers = headers.append('example', headerValue);

        return this.https
        .get("/api/userss/page", {
          observe: "response", headers: headers,
        })
        .pipe(
          map((response) => {
            let pr: any = response.body;
            return new PageResponse<Stage>(pr.totalPages, pr.totalElements, Stage.toArray(pr.content));
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
        
    }

    getStage(id: any) : Observable<Stage> {
        return this.https
      .get("/api/usmStage/" + id, { observe: "response" })
      .pipe(
        map((response) => {  
          return new Stage(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
    }

    updateStage(stage : Stage) {
        let body;
  
        try {
            body = JSON.stringify(stage);
        } catch (e : any)  {
            console.error("JSON.stringify error - ", e.message);
        }
  
        return this.https
        .put("/api/usmStage", body, {
          observe: "response",
        })
        .pipe(
          map((response) => {
            return new Stage(response.body);
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    }
}