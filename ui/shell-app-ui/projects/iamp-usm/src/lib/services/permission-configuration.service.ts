import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { throwError } from "rxjs";
import { UsmPermissions } from '../models/usm-permissions';
import { UsmRolePermissions } from '../models/usm-role-permissions';
import { PageResponse } from '../support/paging';
import { PageRequestByExample } from '../support/page-request';

@Injectable({
  providedIn: 'root'
})
export class PermissionConfigurationService {

  constructor(private https: HttpClient) { }
/**
   * Create a new  UsmRolePermissions.
   */

  create(usm_role_permissions: UsmRolePermissions): Observable<Object> {
    const copy = this.convert(usm_role_permissions);
    return this.https
      .post("/api/usm-role-permissionss", copy, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          console.log(response);
          
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
   * Delete an UsmRolePermissions by id.
   */
  delete(id: any) {
    return this.https
      .delete("/api/usm-role-permissionss/" + id, {
        observe: "response",
      })
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Get a UsmRolePermissions by id.
   */
  getUsmRolePermissions(id: any): Observable<UsmRolePermissions> {
    return this.https
      .get("/api/usm-role-permissionss/" + id, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new UsmRolePermissions(response.body);
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
  update(usm_role_permissions: UsmRolePermissions): Observable<UsmRolePermissions> {
    let body;
    try {
      body = JSON.stringify(usm_role_permissions);
    } catch (e : any)  {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/usm-role-permissionss", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new UsmRolePermissions(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }


  /**
   * Load a page (for paginated datatable) of UsmRolePermissions using the passed
   * usm_role_permissions as an example for the search by example facility.
   */
  findAll(usm_role_permissions: UsmRolePermissions, event: any): Observable<PageResponse<UsmRolePermissions>> {
    let req = new PageRequestByExample(usm_role_permissions, event);
    let body;
    let headerValue;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');
    } catch (e : any)  {
      console.error("JSON.stringify error - ", e.message);
    }
    let headers = new HttpHeaders();
    headers = headers.append('example', headerValue);
    return this.https
      .get("/api/usm-role-permissionss/page", {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<UsmRolePermissions>(
            pr.totalPages,
            pr.totalElements,
            UsmRolePermissions.toArray(pr.content)
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
    } catch (e : any)  {
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

  private convert(usm_role_permissions: UsmRolePermissions): UsmRolePermissions {
    const copy: UsmRolePermissions = Object.assign({}, usm_role_permissions);
    return copy;
  }


}
