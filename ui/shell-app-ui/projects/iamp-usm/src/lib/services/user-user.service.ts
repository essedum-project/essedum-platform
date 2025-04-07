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
import { Observable } from "rxjs/Observable";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { Usertouser } from "../models/user-user";
import { map, catchError } from "rxjs/operators";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { throwError } from "rxjs";
@Injectable()
export class UseruserService {
  constructor(private https: HttpClient) { }

  /**
   * Create a new  Useruser.
   */

  create(usm_role_permissions: Usertouser): Observable<Usertouser> {
    const copy = this.convert(usm_role_permissions);
    return this.https
      .post("/api/usm-user-user/", copy, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new Usertouser(response);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Get a Useruser by id.
   */
  getUseruser(id: any): Observable<Usertouser> {
    return this.https
      .get("/api/usm-user-user/" + id, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new Usertouser(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Update the passed usm_role_permissions.
   */
  update(usm_role_permissions: Usertouser): Observable<Usertouser> {
    let body;
    try {
      body = JSON.stringify(usm_role_permissions);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/usm-user-user/", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new Usertouser(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Load a page (for paginated datatable) of Useruser using the passed
   * usm_role_permissions as an example for the search by example facility.
   */
  findAll(usm_role_permissions: Usertouser, event: any): Observable<PageResponse<Usertouser>> {
    let req = new PageRequestByExample(usm_role_permissions, event);
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
      .get("/api/usm-user-user/page", {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<Usertouser>(
            pr.totalPages,
            pr.totalElements,
            Usertouser.toArray(pr.content)
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
   * Used by UseruserCompleteComponent.
   */
  complete(query: string): Observable<Usertouser[]> {
    let body;
    try {
      body = JSON.stringify({ query: query, maxResults: 10 });
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/usm-user-user/complete", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return Usertouser.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Delete an Useruser by id.
   */
  delete(id: any) {
    return this.https
      .delete("/api/usm-user-user/" + id, {
        observe: "response",
      })
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

   /**
   * Create a List of  Useruser.
   */
  createAll(usm_role_permissions: Usertouser[]): Observable<Usertouser[]> {
    const copy: Usertouser[] = Object.assign([], usm_role_permissions);
    return this.https
      .post("/api/usm-user-user-list/", copy, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return Usertouser.toArray(a);
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

  private convert(usm_role_permissions: Usertouser): Usertouser {
    const copy: Usertouser = Object.assign({}, usm_role_permissions);
    return copy;
  }
}
