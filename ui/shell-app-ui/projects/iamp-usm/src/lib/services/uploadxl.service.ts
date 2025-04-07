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
// Template pack-angular:web/src/app/entities/entity.service.ts.e.vm
//
import { Injectable, SkipSelf } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { MessageService } from "./message.service";
// import { Task } from '../models/task';
import { throwError } from "rxjs";

import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map, catchError } from "rxjs/operators";

@Injectable()
export class UploadXLSService {
  private jwt: any;

  constructor(private https: HttpClient, private messageService: MessageService) {
    this.jwt = {
      headers: new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem("jwtToken")}` })
    };
  }

  uploadrolexls(excelfile: FormData): Observable<any> {
    let project;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e) {
      console.error("JSON.parse error - ", e.message);
    }
    return this.https.post("/api/uploadUserRoleExcel/" + project.id, excelfile,{
      observe: "response",
      responseType: "text",
    }).pipe(
      map((res) => {
        return res;
      })
    ).pipe(
      catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  uploadDocument(fd, name, transitionId, fileType): Observable<any> {
    let project;
    try {
      project = JSON.parse(sessionStorage.getItem("project"));
    } catch (e) {
      console.error("JSON.parse error - ", e.message);
    }
    return this.https
      .post(
        "/api/uploadDocument?processName=Knowledge Transfer&projectName=" +
        project.name +
        "&phaseName=TRANSITION&name=" +
        name +
        "&dataContentType=" +
        fileType +
        "&transitionId=" +
        transitionId,
        fd,
        { observe: "response" }
      )
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  downloadDocument(name: string, transId: number): Observable<any> {
    return this.https
      .get("/api/documents/download?name=" + name + "&transitionId=" + transId, { observe: "response" })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  deleteDocument(nameDlt: string, transId: number) {
    return this.https.delete("/api/document?name=" + nameDlt + "&transitionId=" + transId, { observe: "response" }).pipe(
      catchError((err) => {
        return this.handleError(err);
      })
    );
  }
  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    let errMsg = error.error;
    error.status ? `Status: ${error.status} - Text: ${error.statusText}` : "Server error";
    console.error(errMsg); // log to console instead
    if (error.status === 401) {
      window.location.href = "/";
    }
    return throwError(errMsg)
  }

  getDocumentsForTransition(transitionId) {
    return this.https
      .get("/api/documents?transitionId=" + transitionId, this.jwt)
      .pipe(
        map((response) => {
          return response;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
}
