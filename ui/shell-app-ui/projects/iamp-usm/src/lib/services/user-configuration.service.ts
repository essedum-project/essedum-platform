import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Users } from '../models/users';
import { PageResponse } from '../support/paging';
import { PageRequestByExample } from '../support/page-request';

@Injectable({
  providedIn: 'root'
})
export class UserConfigurationService {

  constructor(private https: HttpClient) { }

  /**
   * Create a new  Users.
   */

  create(users: Users): Observable<Users> {
    const copy = this.convert(users);
    return this.https
      .post("/api/userss/", copy, { observe: "response" })
      .pipe(
        map((response) => {
          return new Users(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  getAzureUser(){
    return this.https
    .get("/api/graph/allUsers/Roles", {
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

  private convert(users: Users): Users {
    const copy: Users = Object.assign({}, users);
    return copy;
  }
  /**
   * Get a Users by id.
   */
  getUsers(id: any): Observable<Users> {
    return this.https
      .get("/api/userss/" + id, { observe: "response" })
      .pipe(
        map((response) => {
          return new Users(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
/**
   * Update the passed users.
   */
  update(users: Users): Observable<Users> {
    let body;
    try {
      body = JSON.stringify(users);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/userss/", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          //new Users(response.json()))
          return new Users(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
 /**
   * Delete an Users by id.
   */
  delete(id: any) {
    return this.https
      .delete("/api/userss/" + id, { observe: "response" })
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }


  findAll(users: any, event: any): Observable<PageResponse<any>> {
    let req = new PageRequestByExample(users, event);
    let body;
    try {
      body = JSON.stringify(req);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    let headerValue = Buffer.from(body, 'utf8').toString('base64');
    let headers = new HttpHeaders();
    headers = headers.append('example', headerValue);
    return this.https
      .get("/api/userss/page", {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<any>(pr.totalPages, pr.totalElements, pr.content);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    let errMsg = error.error;
    error.status ? `Status: ${error.status} - Text: ${error.statusText}` : "Server error";
    console.error(errMsg); // log to console instead
    if (error.status === 401) {
      window.location.href = "/";
    }
    return Observable.throw(errMsg);
  }

}
