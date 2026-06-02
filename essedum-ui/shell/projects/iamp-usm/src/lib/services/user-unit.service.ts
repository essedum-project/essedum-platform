import { Injectable, Inject, SkipSelf } from "@angular/core";
import { Observable, map, catchError, throwError } from "rxjs";
import { MessageService } from "./message.service";
import { UserUnit } from "../models/user-unit";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { CustomErrorHandlerService } from "../shared-modules/custom-error-handler/custom-error-handler.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable()
export class UserUnitService {

  constructor(
    private https: HttpClient,
    private messageService: MessageService,
    private customErrorHandlerService: CustomErrorHandlerService //   private auth: AuthService
  ) { }
  fetchToken() {

  }

  /**
   * Create a new  UserUnit.
   */

  create(user_unit: UserUnit): Observable<UserUnit> {
    const copy = this.convert(user_unit);
    let result;
    this.fetchToken();
    return this.https
      .post("/api/user-units", copy, { observe: "response" })
      .pipe(
        map((response) => {
          return new UserUnit(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Get a UserUnit by id.
   */
  getUserUnit(id: any): Observable<UserUnit> {
    this.fetchToken();
    return (<any>this).https
      .get("/api/user-units/" + id, { observe: "response" })
      .pipe(
        map((response) => {
          return new UserUnit(response);
        })
      )
      .pipe(
        catchError((err) => {
          return this.customErrorHandlerService.handleAPIError(err);
        })
      );
  }

  /**
   * Update the passed user_unit.
   */
  update(user_unit: UserUnit): Observable<UserUnit> {
    let body;
    try {
      body = JSON.stringify(user_unit);
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }

    this.fetchToken();
    return (<any>this).https
      .put("/api/user-units", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new UserUnit(response);
        })
      )
      .pipe(
        catchError((err) => {
          return this.customErrorHandlerService.handleAPIError(err);
        })
      );
  }

  /**
   * Load a page (for paginated datatable) of UserUnit using the passed
   * user_unit as an example for the search by example facility.
   */
  findAll(user_unit: UserUnit, event: any): Observable<PageResponse<UserUnit>> {
    let req = new PageRequestByExample(user_unit, event);
    let body;
    let headerValue;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    let headers = new HttpHeaders();
    headers = headers.append('example', headerValue);
    this.fetchToken();
    return (<any>this).https
      .get("/api/user-units/page", {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response;
          return new PageResponse<UserUnit>(pr.totalPages, pr.totalElements, UserUnit.toArray(pr.content));
        })
      )
      .pipe(
        catchError((err) => {
          return this.customErrorHandlerService.handleAPIError(err);
        })
      );
  }

  /**
   * Load all the users with their role and complement for the given units
   *
   */

  fetchUsersByUnits(id: number, role: string) {
    this.fetchToken();
    return this.https
      .post("/api/get-users-by-unit-role/" + role, id, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return response;
        })
      )
      .pipe(
        catchError((err) => {
          return this.customErrorHandlerService.handleAPIError(err);
        })
      );
  }

  /**
   * Performs a search by example on 1 attribute (defined on server side) and returns at most 10 results.
   * Used by UserUnitCompleteComponent.
   */
  complete(query: string): Observable<UserUnit[]> {
    this.fetchToken();
    let body;
    try {
      body = JSON.stringify({ query: query, maxResults: 10 });
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    return (<any>this).https
      .post("/api/user-units/complete", body, {

        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any;
          response;
          return UserUnit.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.customErrorHandlerService.handleAPIError(err);
        })
      );
  }

  /**
   * Delete an UserUnit by id.
   */
  delete(id: any) {
    this.fetchToken();
    return this.https
      .delete("/api/user-units/" + id, {
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

  private convert(user_unit: UserUnit): UserUnit {
    const copy: UserUnit = Object.assign({}, user_unit);
    return copy;
  }
}
