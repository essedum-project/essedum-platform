import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UsmModules } from '../models/module';
import { ModuleOrganization } from '../models/ModuleOrganization';
import { PageRequestByExample } from '../support/page-request';
import { PageResponse } from '../support/paging';


@Injectable({
  providedIn: 'root'
})
export class ModulesService {

  constructor(private https: HttpClient) { }

   /**
   * Load a page (for paginated datatable) of Project using the passed
   * project as an example for the search by example facility.
   */
  findAll(module: UsmModules, event: any): Observable<PageResponse<UsmModules>> {
    console.log("here");
    
    let req = new PageRequestByExample(module, event);
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
      .get("/api/usm-modules/page", {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<UsmModules>(pr.totalPages, pr.totalElements, UsmModules.toArray(pr.content));
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
    
    return throwError(errMsg);
  }

  private convert(project: ModuleOrganization): ModuleOrganization {
    const copy: ModuleOrganization = Object.assign({}, project);
    return copy;
  }
}
