import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { RoleProcess } from "../models/role-process";
import { CustomErrorHandlerService } from "../shared-modules/custom-error-handler/custom-error-handler.service";
import { MessageService } from "./message.service";
import { throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";

@Injectable()
export class RoleProcessService{

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
        if (error.status === 401) {
          window.location.href = "/";
        }
        return throwError(errMsg);
    }

    private convert(roleProcess: RoleProcess): RoleProcess {
        const copy: RoleProcess = Object.assign({}, roleProcess);
        return copy;
    }

    createRoleProcessList(roleProcessList: RoleProcess[]):Observable<RoleProcess[]>{

        return this.https
            .post("/api/roleProcessList", roleProcessList, { observe: "response" })
            .pipe(
                map((response) =>{
                    let a:any = response.body;
                    return RoleProcess.toArray(a);
                })    
            )
            .pipe(
                catchError((err) => {
                  return this.handleError(err);
                })
            );
    }

    getRoleProcessByProcessId(processId): Observable<RoleProcess[]>{
        return this.https
            .get("/api/roleProcesses/process/" + processId, { observe: "response" })
            .pipe(
                map((response) =>{
                    let a:any = response.body;
                    return RoleProcess.toArray(a);
                })  
            )
            .pipe(
                catchError((err) => {
                    return this.handleError(err);
                })
            )
    }

    deleteRoleProcessByRoleId(roleId: number){
        return this.https
        .delete("/api/roleProcesses/role/" + roleId, { observe: "response" })
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    }

}