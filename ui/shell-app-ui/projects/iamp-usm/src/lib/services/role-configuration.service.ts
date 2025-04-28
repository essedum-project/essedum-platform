import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PageRequestByExample } from '../support/page-request';
import { PageResponse } from '../support/paging';
import { Observable, map, catchError, throwError } from "rxjs";
// import { Observable } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';
import { Role } from '../models/role';


@Injectable({
  providedIn: 'root'
})
export class RoleConfigurationService {

  constructor(private https: HttpClient) { }

   /**
   * Load a page (for paginated datatable) of Role using the passed
   * role as an example for the search by example facility.
   */
  findAll(role: Role, event: any): Observable<PageResponse<Role>> {
    let req = new PageRequestByExample(role, event);
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
      .get("/api/roles/page", {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<Role>(pr.totalPages, pr.totalElements, Role.toArray(pr.content));
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  getAzureRole(){
    return this.https
    .get("/api/graph/allRoles", {
      observe: "response",
    })
    .pipe(
      map((response) => {
        if (response.status == 200) {
          return new Object(response.body);
        }
      })
    )
    .pipe(
      catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  getRole(id: any): Observable<Role> {
    return this.https
      .get("/api/roles/" + id, { observe: "response" })
      .pipe(
        map((response) => {
          return new Role(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Update the passed role.
   */
  update(role: Role): Observable<Role> {
    let body;
    try {
      body = JSON.stringify(role);
    } catch (e : any)  {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/roles", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new Role(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
/**
   * Delete an Role by id.
   */
  delete(id: any) {
    return this.https.delete("/api/roles/" + id, { observe: "response" }).pipe(
      catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  create(role: Role): Observable<Role> {
    const copy = this.convert(role);
    return this.https
      .post("/api/roles", copy, { observe: "response" })
      .pipe(
        map((response) => {
          return new Role(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  private convert(role: Role): Role {
    const copy: Role = Object.assign({}, role);
    return copy;
  }


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
}
