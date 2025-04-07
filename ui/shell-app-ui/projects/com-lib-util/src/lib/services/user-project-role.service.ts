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
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Observable } from "rxjs/Observable";
import { PageResponse } from "../models/paging";
import { PageRequestByExample } from "../models/page-request";
import { UserProjectRole } from "../models/user-project-role";
import { throwError } from "rxjs";
import { map } from "rxjs/operators";
import { catchError } from "rxjs/operators";
import { Users } from "../models/users";
declare const Buffer
@Injectable()
export class UserProjectRoleService {

  constructor(private https: HttpClient) {}

  /**
   * Create a new  UserProjectRole.
   */

  create(user_project_role: UserProjectRole): Observable<UserProjectRole> {
    const copy = this.convert(user_project_role);
    return this.https
      .post("/api/user-project-roles/", copy, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new UserProjectRole(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Get a UserProjectRole by id.
   */
  getUserProjectRole(id: any): Observable<UserProjectRole> {
    return this.https
      .get("/api/user-project-roles/" + id, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new UserProjectRole(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Update the passed user_project_role.
   */
  update(user_project_role: UserProjectRole): Observable<UserProjectRole> {
    let body;
    let result
    try {
      body = JSON.stringify(user_project_role);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/user-project-roles/", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new UserProjectRole(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Load a page (for paginated datatable) of UserProjectRole using the passed
   * user_project_role as an example for the search by example facility.
   */
  findAll(user_project_role: UserProjectRole, event: any): Observable<PageResponse<UserProjectRole>> {
    let req = new PageRequestByExample(user_project_role, event);
    let body;
    let headerValue;
    let result;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, "utf8").toString("base64");
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    let headers = new HttpHeaders();
    headers = headers.append("example", headerValue);
    return this.https
      .get("/api/user-project-roles/page", {
        observe: "response",
        headers: headers,
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<UserProjectRole>(
            pr.totalPages,
            pr.totalElements,
            UserProjectRole.toArray(pr.content)
          );
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  FindAll(user_project_role: UserProjectRole, event: any): Observable<PageResponse<UserProjectRole>> {
    let req = new PageRequestByExample(user_project_role, event);
    let body;
    let headerValue;
    let result;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, "utf8").toString("base64");
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    let headers = new HttpHeaders();
    headers = headers.append("example", headerValue);
    return this.https
      .get(`/api/user-project-roless/page?page=${event.page}&size=${event.size}`, {
        observe: "response",
        headers: headers,
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<UserProjectRole>(
            pr.totalPages,
            pr.totalElements,
            UserProjectRole.toArray(pr.content)
          );
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  search(user_project_role: UserProjectRole, event: any): Observable<PageResponse<UserProjectRole>> {
    let req = new PageRequestByExample(user_project_role, event);
    let body;
    let result;
    try {
      body = JSON.stringify(req);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post(`/api/search/user-project-roles/page?page=${event.page}&size=${event.size}`, body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<UserProjectRole>(
            pr.totalPages,
            pr.totalElements,
            UserProjectRole.toArray(pr.content)
          );
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  findAllTwb(user_project_role: any, event: any): Observable<PageResponse<UserProjectRole>> {
    let req = new PageRequestByExample(user_project_role, event);
    req.example.project_id = req.example.project_id;
    delete req.example.project_id;
    let body;
    let headerValue;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, "utf8").toString("base64");
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    let headers = new HttpHeaders();
    headers = headers.append("example", headerValue);
    return this.https
      .get("/api/user-project-roles/page", {
        observe: "response",
        headers: headers,
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<UserProjectRole>(
            pr.totalPages,
            pr.totalElements,
            UserProjectRole.toArray(pr.content)
          );
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
   * Used by UserProjectRoleCompleteComponent.
   */
  complete(query: string): Observable<UserProjectRole[]> {
    let body;
    try {
      body = JSON.stringify({ query: query, maxResults: 10 });
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .post("/api/user-project-roles/complete", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any;
          response.body;
          return UserProjectRole.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Delete an UserProjectRole by id.
   */
  delete(id: any) {
    return this.https
      .delete("/api/user-project-roles/" + id, {
        observe: "response",
      })
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Create a List of  UserProjectRoles.
   */
  createAll(user_project_role: UserProjectRole[]): Observable<UserProjectRole[]> {
    let result;
    const copy: UserProjectRole[] = Object.assign([], user_project_role);
    return this.https
      .post("/api/user-project-roles-list/", copy, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return UserProjectRole.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  getUsersByRoleId(roleId, projectId): Observable<Users[]>{
    return this.https
      .get("/api/user-project-roles-by-roleid/" + roleId + '/' + projectId, { observe: "response" })
      .pipe(
        map((response) => {  
          let a: any = response.body;
          return Users.toArray(a);
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

  private convert(user_project_role: UserProjectRole): UserProjectRole {
    const copy: UserProjectRole = Object.assign({}, user_project_role);
    return copy;
  }
}
