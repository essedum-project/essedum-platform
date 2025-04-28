import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UsmPermissionsApi } from '../models/usm-permission-api';


@Injectable({
  providedIn: 'root'
})
export class PermissionApiService {

  constructor(private https: HttpClient) { }


  findAllUsmPermissionApi(id: any): Observable<UsmPermissionsApi[]> {
    return this.https
      .get("/api/usm-permissions-api/permission/" + id, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return UsmPermissionsApi.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
  * Delete an UsmPermissionsApi by id.
  */
  delete(id: any) {
    return this.https
      .delete("/api/usm-permission-api/" + id, {
        observe: "response",
      })
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
    // if (error.status === 401) {
    //   window.location.href = "/";
    // }

    return throwError(errMsg);
  }


  create(usm_permissionsApi: UsmPermissionsApi): Observable<UsmPermissionsApi> {
    const copy = this.convert(usm_permissionsApi);
    return this.https
      .post("/api/usm-permission-api", copy, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new UsmPermissionsApi(response);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  private convert(usm_permissionsapi: UsmPermissionsApi): UsmPermissionsApi {
    const copy: UsmPermissionsApi = Object.assign({}, usm_permissionsapi);
    return copy;
  }

  /**
  * Update the passed usm_permissionsApi.
  */
  update(permissionsApi: UsmPermissionsApi): Observable<UsmPermissionsApi> {
    let body;
    try {
      body = JSON.stringify(permissionsApi);
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/usm-permissions-api", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new UsmPermissionsApi(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  /**
  * search api's with apiname and https type
  */
  findByApiAndType(permissionsApi: UsmPermissionsApi): Observable<UsmPermissionsApi[]> {
    let body;
    try {
      body = JSON.stringify(permissionsApi);
    } catch (e) {
      console.log(e)
    }

    return this.https
      .post("/api/search/usm-permissions-api", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return  UsmPermissionsApi.toArray(a)
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
}