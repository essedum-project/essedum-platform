import { Injectable, SkipSelf } from "@angular/core";
import { Observable, map, catchError, throwError } from "rxjs";
import { MessageService } from "./message.service";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { UsmPermissions } from "../models/usm-permissions";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable()
export class UsmPermissionsService {
  constructor(private https: HttpClient, private messageService: MessageService) { }

  /**
   * Create a new  UsmPermissions.
   */

  create(usm_permissions: UsmPermissions): Observable<UsmPermissions> {
    const copy = this.convert(usm_permissions);
    return this.https
      .post("/api/usm-permissionss", copy, {
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
   * Update the passed usm_permissions.
   */
  update(usm_permissions: UsmPermissions): Observable<UsmPermissions> {
    let body;
    try {
      body = JSON.stringify(usm_permissions);
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/usm-permissionss", body, {
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
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    //let headers = new HttpHeaders();
    let headers = this.createRequestHeaders();
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

    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    let headers = new HttpHeaders();
    headers = headers.append('example', headerValue);
    return this.https
      .get(`/api/usm-permissionss?page=${event.page}&size=${event.size}`, {
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
    } catch (e: any) {
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
    let headers = this.createRequestHeaders();
    return this.https
      .delete("/api/usm-permissionss/" + id, {
        observe: "response",
        headers: headers
      })
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  search(usm_permission: UsmPermissions, event: any): Observable<PageResponse<UsmPermissions>> {
    let req = new PageRequestByExample(usm_permission, event);
    let body;
    try {
      body = JSON.stringify(req);
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post(`/api/search/usm-permissions/page?page=${event.page}&size=${event.size}`, body,
        {
          observe: "response"
        })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<UsmPermissions>(pr.totalPages, pr.totalElements, UsmPermissions.toArray(pr.content));
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
    // if (error.status === 401) {
    //   window.location.href = "/";
    // }
    return throwError(errMsg);
  }

  private convert(usm_permissions: UsmPermissions): UsmPermissions {
    const copy: UsmPermissions = Object.assign({}, usm_permissions);
    return copy;
  }

  // Helper method to create standardized request headers with all required values
  private createRequestHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    // Add Referer header - matching the exact format in the curl example
    if (typeof window !== 'undefined') {
      // Use the actual origin like in the curl example
      headers = headers.append('Referer', window.location.origin + '/');
    }

    // Add authorization header if available
    if (sessionStorage.getItem("authToken")) {
      headers = headers.append('Authorization', 'Bearer ' + sessionStorage.getItem("authToken"));
    } else if (localStorage.getItem("jwtToken")) {
      headers = headers.append('Authorization', 'Bearer ' + localStorage.getItem("jwtToken"));
    }

    // Add Project headers - exact casing as in the curl example
    if (sessionStorage.hasOwnProperty("project") && sessionStorage.getItem("project") !== "") {
      try {
        const project = JSON.parse(sessionStorage.getItem("project") || "{}");
        if (project.id) {
          headers = headers.append('Project', project.id.toString());
        }
        if (project.name) {
          headers = headers.append('ProjectName', project.name.toString());
        }
      } catch (e) {
        console.error("Error parsing project from sessionStorage:", e);
      }
    }

    // Add role headers - exact casing as in the curl example
    if (sessionStorage.hasOwnProperty("role") && sessionStorage.getItem("role") !== "") {
      try {
        const role = JSON.parse(sessionStorage.getItem("role") || "{}");
        if (role.id) {
          headers = headers.append('roleId', role.id.toString());
        }
        if (role.name) {
          headers = headers.append('roleName', role.name.toString());
        }
      } catch (e) {
        console.error("Error parsing role from sessionStorage:", e);
      }
    }

    // Try to add Cookie header if available from document.cookie
    if (typeof document !== 'undefined' && document.cookie) {
      headers = headers.append('Cookie', document.cookie);
    }

    return headers;
  }
}
