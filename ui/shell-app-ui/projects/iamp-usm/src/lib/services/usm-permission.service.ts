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
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { UsmPermissions } from "../models/usm-permissions";
import { map, catchError } from "rxjs/operators";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { throwError } from "rxjs";
@Injectable()
export class UsmPermissionsService {
  constructor(private https: HttpClient, private messageService: MessageService) { }

  /**
   * Create a new  UsmPermissions.
   */

  create(usm_permissions: UsmPermissions): Observable<UsmPermissions> {
    const copy = this.convert(usm_permissions);
    return this.https
      .post("/api/usm-permissionss/", copy, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new UsmPermissions(response);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Get a UsmPermissions by id.
   */
  getUsmPermissions(id: any): Observable<UsmPermissions> {
    return this.https
      .get("/api/usm-permissionss/" + id, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new UsmPermissions(response);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Update the passed usm_permissions.
   */
  update(usm_permissions: UsmPermissions): Observable<UsmPermissions> {
    let body;
    try {
      body = JSON.stringify(usm_permissions);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/usm-permissionss/", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new UsmPermissions(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Load a page (for paginated datatable) of UsmPermissions using the passed
   * usm_permissions as an example for the search by example facility.
   */
  findAll(usm_permissions: UsmPermissions, event: any): Observable<PageResponse<UsmPermissions>> {
    let req = new PageRequestByExample(usm_permissions, event);
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
      .get("/api/usm-permissionss/page", {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<UsmPermissions>(
            pr.totalPages,
            pr.totalElements,
            UsmPermissions.toArray(pr.content)
          );
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  findAllPermissions(usm_permissions: UsmPermissions, event: any): Observable<PageResponse<UsmPermissions>> {
    let req = new PageRequestByExample(usm_permissions, event);
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
      .get("/api/usm-permissionss/page", {
        observe: "response",
        headers: headers
      })
      .pipe(map((response) => {
        let pr: any = response.body;
        return new PageResponse<UsmPermissions>(pr.totalPages, pr.totalElements, UsmPermissions.toArray(pr.content));
      }))
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Performs a search by example on 1 attribute (defined on server side) and returns at most 10 results.
   * Used by UsmRolePermissionsCompleteComponent.
   */
  complete(query: string): Observable<UsmPermissions[]> {
    let body;
    try {
      body = JSON.stringify({ query: query, maxResults: 10 });
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/usm-permissions/complete", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return UsmPermissions.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Delete an UsmPermissions by id.
   */
  delete(id: any) {
    return this.https
      .delete("/api/usm-permissions/" + id, {
        observe: "response",
      })
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

  private convert(usm_permissions: UsmPermissions): UsmPermissions {
    const copy: UsmPermissions = Object.assign({}, usm_permissions);
    return copy;
  }
}
