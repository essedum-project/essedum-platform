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
import { Injectable, Inject, SkipSelf } from "@angular/core";
import { Observable } from "rxjs/Observable";
// import { MessageService } from './message.service';
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { Project } from "../models/project";
//import { environment } from '../../../../../src/environments/environment';
import { AuthService } from "./auth.service";
import { throwError } from "rxjs";

import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map, catchError } from "rxjs/operators";
@Injectable()
export class ProjectService {
  constructor(private https: HttpClient) { }

  /**
   * Create a new  Project.
   */

  create(project: Project): Observable<Project> {
    const copy = this.convert(project);
    return this.https
      .post("/api/projects/", copy, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new Project(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Get a Project by id.
   */
  getProject(id: any): Observable<Project> {
    return this.https
      .get("/api/projects/" + id, { observe: "response" })
      .pipe(
        map((response) => {
          return new Project(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Update the passed project.
   */
  update(project: Project): Observable<Project> {
    let body;
    try {
      body = JSON.stringify(project);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/projects/", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new Project(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Load a page (for paginated datatable) of Project using the passed
   * project as an example for the search by example facility.
   */
  findAll(project: Project, event: any): Observable<PageResponse<Project>> {
    let req = new PageRequestByExample(project, event);
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
      .get("/api/projects/page", {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<Project>(pr.totalPages, pr.totalElements, Project.toArray(pr.content));
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  /**
   * Load a page (for paginated datatable) of Project using the passed
   * project as an example for the search by example facility.
   */
  FindAll(project: Project, event: any): Observable<PageResponse<Project>> {
    let req = new PageRequestByExample(project, event);
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
      .get(`/api/projectss/page?page=${event.page}&size=${event.size}`, {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<Project>(pr.totalPages, pr.totalElements, Project.toArray(pr.content));
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  search(project: Project, event: any): Observable<PageResponse<Project>> {
    let req = new PageRequestByExample(project, event);
    let body;
    try {
      body = JSON.stringify(req);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post(`/api/search/projects/page?page=${event.page}&size=${event.size}`, body,
        {
          observe: "response"
        })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<Project>(pr.totalPages, pr.totalElements, Project.toArray(pr.content));
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
   * Used by ProjectCompleteComponent.
   */
  complete(query: string): Observable<Project[]> {
    let body;
    try {
      body = JSON.stringify({ query: query, maxResults: 10 });
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/projects/complete", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return Project.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Delete an Project by id.
   */
  delete(id: any) {
    return this.https
      .delete("/api/projects/" + id, {
        observe: "response",
      })
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  copyBluePrint(fromproject, toproject, toprojectid) {
    let body;
    try {
      body = toproject;
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/copyblueprint/" + toproject + "/" + fromproject + "?projectId=" + toprojectid, body, {
        observe: "response",
      })
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
  // sample method from angular doc
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

  private convert(project: Project): Project {
    const copy: Project = Object.assign({}, project);
    return copy;
  }
}
