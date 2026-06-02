import { Injectable, Inject, SkipSelf } from "@angular/core";
import { Observable } from "rxjs";

import { MessageService } from "./message.service";
import { OrgUnit } from "../models/org-unit";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
// import { AuthService } from "./auth.service";
import { CustomErrorHandlerService } from "../shared-modules/custom-error-handler/custom-error-handler.service";
import { throwError } from "rxjs";

import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map, catchError } from "rxjs/operators";
@Injectable()
export class OrgUnitService {

  constructor(
    private https: HttpClient,
    private messageService: MessageService,
    private customErrorHandlerService: CustomErrorHandlerService
  ) {

  }
  fetchToken() {

  }
  /**
   * Create a new  OrgUnit.
   */

  create(org_unit: OrgUnit): Observable<OrgUnit> {
    const copy = this.convert(org_unit);
    this.fetchToken();
    return this.https
      .post("/api/org-units/", copy, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new OrgUnit(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Get a OrgUnit by id.
   */
  getOrgUnit(id: any): Observable<OrgUnit> {
    this.fetchToken();
    return this.https
      .get("/api/org-units/" + id, { observe: "response" })
      .pipe(
        map((response) => {
          return new OrgUnit(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.customErrorHandlerService.handleAPIError(err);
        })
      );
  }

  /**
   * Update the passed org_unit.
   */
  update(org_unit: OrgUnit): Observable<OrgUnit> {
    let body;
    try {
      body = JSON.stringify(org_unit);
    } catch (e : any)  {
      console.error("JSON.stringify error - ", e.message);
    }
    this.fetchToken();
    return this.https
      .put("/api/org-units/", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new OrgUnit(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.customErrorHandlerService.handleAPIError(err);
        })
      );
  }

  /**
   * Load a page (for paginated datatable) of OrgUnit using the passed
   * org_unit as an example for the search by example facility.
   */
  findAll(org_unit: OrgUnit, event: any): Observable<PageResponse<OrgUnit>> {
    let req = new PageRequestByExample(org_unit, event);
    let body;
    let headerValue;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');
    } catch (e : any)  {
      console.error("JSON.stringify error - ", e.message);
    }
    this.fetchToken();
    let headers = new HttpHeaders();
    headers = headers.append('example', headerValue);
    return this.https
      .get("/api/org-units/page", {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<OrgUnit>(pr.totalPages, pr.totalElements, OrgUnit.toArray(pr.content));
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
   * Used by OrgUnitCompleteComponent.
   */
  complete(query: string): Observable<OrgUnit[]> {
    let body;
    try {
      body = JSON.stringify({ query: query, maxResults: 10 });
    } catch (e : any)  {
      console.error("JSON.stringify error - ", e.message);
    }
    this.fetchToken();
    return this.https
      .post("/api/org-units/complete", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return OrgUnit.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Delete an OrgUnit by id.
   */
  delete(id: any) {
    this.fetchToken();
    return this.https
      .delete("/api/org-units/" + id, {
        observe: "response",
      })
      .pipe(
        catchError((err) => {
          return this.customErrorHandlerService.handleAPIError(err);
        })
      );
  }

  // sample method from angular doc
  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    let errMsg = error.error;
    error.status ? `Status: ${error.status} - Text: ${error.statusText}` : "Server error";
    console.error(errMsg); // log to console instead
    // if (error.status === 401) {
    //   window.location.href = "/";
    // }
    return throwError(errMsg)
  }

  private convert(org_unit: OrgUnit): OrgUnit {
    const copy: OrgUnit = Object.assign({}, org_unit);
    return copy;
  }
}
