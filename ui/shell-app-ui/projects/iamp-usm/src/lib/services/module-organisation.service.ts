import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ModuleOrganization } from '../models/ModuleOrganization';
import { OrgProject } from '../models/OrgProject';
import { PageRequestByExample } from '../support/page-request';
import { PageResponse } from '../support/paging';

@Injectable({
  providedIn: 'root'
})
export class ModuleOrganisationService {

  constructor(private https: HttpClient) { }

  /**
   * Load a page (for paginated datatable) of Project using the passed
   * project as an example for the search by example facility.
   */
  findAll(moduleOrganisation: ModuleOrganization, event: any): Observable<PageResponse<ModuleOrganization>> {
    let req = new PageRequestByExample(moduleOrganisation, event);
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
      .get("/api/usm-module-organisations/page", {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<ModuleOrganization>(pr.totalPages, pr.totalElements, ModuleOrganization.toArray(pr.content));
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Update the passed project.
   */
  update(project: ModuleOrganization): Observable<OrgProject> {
    let body;
    try {
      body = JSON.stringify(project);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/usm-module-organisations/", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new OrgProject(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
   /**
   * Delete an Project by id.
   */
  delete(id: any) {
    return this.https
      .delete("/api/usm-module-organisations/" + id, {
        observe: "response",
      })
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }


  /**
   * Create a new  Project.
   */

  create(project: ModuleOrganization): Observable<ModuleOrganization> {
    const copy = this.convert(project);
    return this.https
      .post("/api/usm-module-organisations/", copy, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new ModuleOrganization(response.body);
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
    // console.error(errMsg); // log to console instead
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
