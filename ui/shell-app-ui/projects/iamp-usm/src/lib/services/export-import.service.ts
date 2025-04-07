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
import { throwError } from "rxjs";
import "rxjs/add/operator/map";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map, catchError } from "rxjs/operators";
import { Project } from "../models/project";

@Injectable()
export class ExportImportService {
  constructor(private https: HttpClient) { }

  /**
   * fetch dashboards and widgets for a project.
   */
  getNestedStructure(project: number): Observable<any> {
    return this.https
      .get("/api/get-nested-structure-for-project/" +
        project,
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
  /**
   * get exported json
   */
  getExportedJson(project: number, dashboards: any): Observable<any> {
    return this.https.post("/api/get-exported-json/" + project,
      JSON.stringify(dashboards),
      { responseType: "blob" as "json" }
    );
  }

  /**
   *import json
   */
  postNestedStructure(file: FormData, project: Project): Observable<any[]> {
    return this.https
      .post("/api/import-json/" + project.name + "/" + project.id ,
        file,
        {observe: "response"}
      )
      .pipe(map((response) => {
        let pr: any = response.body;
        return pr;
      }))
      .pipe(catchError((err) => this.handleError(err)));
  }

  // sample method from angular doc
  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    let errMsg = error.error.error;
    error.status ? `Status: ${error.status} - Text: ${error.statusText}` : "Server error";
    console.error(errMsg); // log to console instead
    if (error.status === 401) {
      window.location.href = "/";
    }
    return throwError(errMsg);
  }
}
