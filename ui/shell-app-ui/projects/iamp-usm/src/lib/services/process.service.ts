import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { Process } from "../models/process";
import { CustomErrorHandlerService } from "../shared-modules/custom-error-handler/custom-error-handler.service";
import { MessageService } from "./message.service";
import { throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";

@Injectable()
export class ProcessService {

    constructor(
        private https: HttpClient,
        private messageService: MessageService,
        private customErrorHandlerService: CustomErrorHandlerService
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

    private convert(process: Process): Process {
        const copy: Process = Object.assign({}, process);
        return copy;
    }

    findAll(process: Process, event: any): Observable<PageResponse<Process>> {
        let req = new PageRequestByExample(process, event);
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
        .get("/api/icmsProcesses/page", {
          observe: "response", headers: headers,
        })
        .pipe(
          map((response) => {
            let pr: any = response.body;
            return new PageResponse<Process>(pr.totalPages, pr.totalElements, Process.toArray(pr.content));
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
        
    }

    getAllProcessesByUserRole(userId: number, projectId: number): Observable<Process[]>{
      return this.https
      .get("/api/icmsProcessesByUserRole/" + userId + '/' + projectId, { observe: "response" })
      .pipe(
        map((response) => { 
          let a: any = response.body; 
          return Process.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
    }

    createProcess(process: Process) : Observable<Process> {
        
      const copy = this.convert(process);

      return this.https
          .post("/api/icmsProcess", copy, { observe: "response" })
          .pipe(
              map((response) => {
              return new Process(response.body);
          })
      )
      .pipe(
          catchError((err) => {
          return this.handleError(err);
          })
      );
    }

    updateProcess(process : Process) {
      let body;

      try {
          body = JSON.stringify(process);
      } catch (e) {
          console.error("JSON.stringify error - ", e.message);
      }

      return this.https
      .put("/api/icmsProcess", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new Process(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
    }

    getProcess(id: any) : Observable<Process> {
      return this.https
    .get("/api/icmsProcess/" + id, { observe: "response" })
    .pipe(
      map((response) => {  
        return new Process(response.body);
      })
    )
    .pipe(
      catchError((err) => {
        return this.handleError(err);
      })
    );
  }

    static toArray(jsons: any[]): any[] {
    let process: any[] = [];
    if (jsons != null) {
      for (let json of jsons) {
        process.push(json);
      }
    }
    return process;
  }
}