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
import { PageResponse } from "../models/paging";
import { PageRequestByExample } from "../models/page-request";

import { of, throwError } from "rxjs";
import { DashConstant } from "../models/dash-constant";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map, catchError } from "rxjs/operators";
import { Project } from "../models/project";
declare const Buffer
@Injectable()
export class DashConstantService {

  private dashconstants: any[];
  private fetchConst:boolean=false;

  constructor(@SkipSelf() private https: HttpClient) { }

  /**
   * Create a new  DashConstant.
   */

  create(dash_constant: DashConstant, isDefault?: boolean): Observable<DashConstant> {
    const copy = this.convert(dash_constant);
    return this.https
      .post("/api/dash-constants/", copy, { observe: "response" })
      .pipe(
        map((response) => {
          if (!isDefault){
            sessionStorage.setItem("CacheDashConstant", "true");
            sessionStorage.setItem("AppCacheDashConstant", "true");
          }
          return new DashConstant(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Get a DashConstant by project_name.
   */
  getDashConstant(id: any): Observable<DashConstant> {
    return this.https
      .get("/api/dash-constants/" + id, { observe: "response" })
      .pipe(
        map((response) => {
          return new DashConstant(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  refresh(): Observable<any> {
    return this.https
      .post("/actuator/refresh", null, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return response.body
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Update the passed dash_constant.
   */
  update(dash_constant: DashConstant, isDefault?: boolean): Observable<DashConstant> {
    let body;
    try {
      body = JSON.stringify(dash_constant);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/dash-constants/", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          if (!isDefault){
            sessionStorage.setItem("CacheDashConstant", "true");
            sessionStorage.setItem("AppCacheDashConstant", "true");
          }
          return new DashConstant(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Load a page (for paginated datatable) of DashConstant using the passed
   * dash_constant as an example for the search by example facility.
   */
  findAll(dash_constant: DashConstant, event: any): Observable<PageResponse<DashConstant>> {
    let req = new PageRequestByExample(dash_constant, event);
    let body;
    try {
      body = JSON.stringify(req);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    const headerValue = Buffer.from(body, 'utf8').toString('base64');
    let headers = new HttpHeaders().append('example', headerValue);
    return this.https
      .get("/api/dash-constants/page", {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<DashConstant>(pr.totalPages, pr.totalElements, DashConstant.toArray(pr.content));
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  getDashConstsCheck(): Observable<any[]> {
    try {
      let project = new Project({ id: JSON.parse(sessionStorage.getItem("project")).id });
      let projectname = JSON.parse(sessionStorage.getItem("project")).name
      let cached = sessionStorage.getItem("CacheDashConstant");
      if (cached && cached == "true") return this.getDashConsts(project);
      else {
        if (this.dashconstants && this.dashconstants.length) {
          let tempDashConst = this.dashconstants.filter((item) => !item.keys.toLowerCase().endsWith("default"));
          if (tempDashConst && tempDashConst.length && tempDashConst[0].project_id.id == project.id)
            return of(this.dashconstants);
          //if project has no mapping then first key after filtering out default keys will be core so 
          //so we need to fetch mapping from db only once remaining time return from cache.fetchConst will let us
          //know whether it was fetched once or not.
          else if(this.fetchConst && projectname!="Core" && tempDashConst[0].project_id.name == "Core")
            return of(this.dashconstants);
          else 
          {
            //if we are switching the projects then dashconstant will be available for the old projects
            //so we need to call the api again to fetch for the new project and only once its needed to be called
            this.fetchConst=false;
            let result= this.getDashConsts(project);
            this.fetchConst=true;
            return result
          }
        } else //if leap is loaded for first time dashconstant is undefined so call api
        return this.getDashConsts(project);
      }
    } catch (error) { }
  }

  getDashConsts(project: Project): Observable<DashConstant[]> {
    return this.https
      .get("/api/get-dash-constants?projectId=" + project.id, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          // let dashconsts: DashConstant[] = pr;
          this.dashconstants = pr;
          sessionStorage.removeItem("CacheDashConstant");
          // return dashconsts;
          return this.dashconstants;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Performs a search by example on 1 attribute (defined on server side) and returns at most 10 results.
   * Used by DashConstantCompleteComponent.
   */
  complete(query: string): Observable<DashConstant[]> {
    let body;
    try {
      body = JSON.stringify({ query: query, maxResults: 10 });
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/dash-constants/complete", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return DashConstant.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Delete an DashConstant by project_name.
   */
  delete(project_name: any) {
    return this.https
      .delete("/api/dash-constants/" + project_name, { observe: "response" })
      .pipe(
        map((response) => {
          sessionStorage.setItem("CacheDashConstant", "true");
          sessionStorage.setItem("AppCacheDashConstant", "true");
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

   /**
   * save theme constant
   */
    saveTheme(dash_constant: DashConstant): Observable<any[]> {
      let body;
      try {
        body = JSON.stringify(dash_constant);
      } catch (e) {
        console.error("JSON.stringify error - ", e.message);
      }
      return this.https
        .post("/api/save-theme", body, {
          observe: "response",
          responseType:"text"
        })
        .pipe(
          map((response) => {
            console.log("response received")
            let pr: any = response.body;
            return pr;
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    }

  // sample method from angular doc
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

  private convert(dash_constant: DashConstant): DashConstant {
    const copy: DashConstant = Object.assign({}, dash_constant);
    return copy;
  }
  PostFileValidateData(excelfile: FormData): Observable<any> {
    return this.https.post('/api/validate/v2/multipartfile', excelfile, {observe:  "response",responseType: "text", })
        .pipe(map(response => response))
        .map(err=>{return err;})            
  }
  getExtensionKey(key:string): Observable<any[]> {
    let project = JSON.parse(sessionStorage.getItem('project')).id;
    return this.https
      .get("/api/get-extension-key?projectId=" + project +"&key="+key, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return pr;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
}
