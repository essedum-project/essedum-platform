import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { OrgProject } from '../models/OrgProject';
import { PageRequestByExample } from '../support/page-request';
import { PageResponse } from '../support/paging';


@Injectable({
  providedIn: 'root'
})
export class OrganisationService {

  constructor(private https: HttpClient) { }

  /**
   * Load a page (for paginated datatable) of OrgProject using the passed
   * project as an example for the search by example facility.
   */
  findAll(project: OrgProject, event: any): Observable<PageResponse<OrgProject>> {
    let req = new PageRequestByExample(project, event);
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
      .get("/api/projects/page", {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<OrgProject>(pr.totalPages, pr.totalElements, OrgProject.toArray(pr.content));
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
  update(project: OrgProject): Observable<OrgProject> {
    let body;
    try {
      body = JSON.stringify(project);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/projects/", body, {
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
   * Delete an OrgProject by id.
   */
  delete(id: any) {
    return this.https
      .delete("/api/projects/" + id, {
        observe: "response",
      })
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  toBase64(file: File, cb: Function) {
    const fileReader: FileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = function(e: any) {
        const base64Data = e.target.result.substr(e.target.result.indexOf('base64,') + 'base64,'.length);
        cb(base64Data);
    };
}

  /**
   * Create a new  OrgProject.
   */

  create(project: OrgProject): Observable<OrgProject> {
    const copy = this.convert(project);
    return this.https
      .post("/api/projects/", copy, {
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
  deleteDatasource(name,organisation): Observable<any> {
    // this.loader.show();
    const org = organisation
    return this.https.delete('/api/datasources/delete/' + name + '/' + org, {
      observe: 'response',
      params: { organization: org }
    })
      .pipe(map(response => {
        // this.loader.hide();
        return response.body;
      }))
      .pipe(catchError(err => {
        // this.loader.hide();
        return this.handleError(err);
      }));
  }
  createDatasource(datasource: any): Observable<any> {​​​​​​​
    // this.loader.show();
    // datasource.organization = localStorage.getItem('organization');
    return this.https.post('/api/datasources/add/' + (datasource.id ? datasource.id : datasource.name), datasource, {​​​​​​​
      headers: new HttpHeaders({​​​​​​​ 'Content-Type': 'application/json; charset=utf-8' }​​​​​​​),
      observe: 'response'
    }​​​​​​​)
      .pipe(map(response => {​​​​​​​
        // this.loader.hide();
        return response;
      }​​​​​​​))
      .pipe(catchError(err => {​​​​​​​
        // this.loader.hide();
        return this.handleError(err);
      }​​​​​​​));
  }​​​​​​​

  createDashboard(dashboardConfiguration: any): Observable<any> {
    let body = dashboardConfiguration;
 
    return this.https
      .put("/api/dashboard-configurations", body, {
        observe: "response",
      })
      .pipe(map((response) => response.body))
      .pipe(catchError((err) => this.handleError(err)));
  }

  viewCreationForWatch(name:string){
    return this.https
    .get("/cyberwatch/api/create-view/" + name, {
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

  private convert(project: OrgProject): OrgProject {
    const copy: OrgProject = Object.assign({}, project);
    return copy;
  }


}
