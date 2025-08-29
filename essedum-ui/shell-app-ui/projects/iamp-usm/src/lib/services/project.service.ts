import { Injectable, Inject, SkipSelf } from "@angular/core";
import { Observable, map, catchError, throwError } from "rxjs";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { Project } from "../models/project";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export class ProjectService {
  constructor(private https: HttpClient) { }

  /**
   * Create a new  Project.
   */

  create(project: Project): Observable<Project> {

    // Get a copy of the project to modify
    const copy = this.convert(project);

    // Ensure required fields are present (use properties from the model)
    copy.is_active = true; // Now this property exists in the model
    copy.projectdisplayname = copy.projectdisplayname || copy.name; // Use name as display name if not set
    copy.autoUserProject = copy.autoUserProject === undefined ? false : copy.autoUserProject;
    copy.defaultrole = copy.defaultrole === undefined ? false : copy.defaultrole;
    copy.disableExcel = copy.disableExcel === undefined ? false : copy.disableExcel;
    copy.timeZone = copy.timeZone || "Asia/Calcutta";

    // Get context from session storage
    const project1 = JSON.parse(sessionStorage.getItem("project") || '{}');
    const userRole = JSON.parse(sessionStorage.getItem("role") || '{}');

    // Ensure portfolioId is valid
    if (!copy.portfolioId || !copy.portfolioId.id) {
      try {
        const portfolioData = JSON.parse(sessionStorage.getItem("portfoliodata") || '{}');
        if (portfolioData && portfolioData.id) {
          copy.portfolioId = portfolioData;
        }
      } catch (e) {
        console.error("Error getting portfolio data from session:", e);
      }
    }

    // Create headers
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'project': project1.id || '',
      'projectname': project1.name || '',
      'roleid': userRole.id || '',
      'rolename': userRole.name || ''
    });

    console.log('Creating project with payload:', JSON.stringify(copy));

    return this.https
      .post<any>("/api/projects", copy, {
        headers: headers
      })
      .pipe(
        map((response) => {
          return new Project(response);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Get a Project by id.
   */
  getProject(id: any): Observable<Project> {

    // Get project and role from sessionStorage for headers
    const project1 = JSON.parse(sessionStorage.getItem("project") || '{}');
    const userRole = JSON.parse(sessionStorage.getItem("role") || '{}');

    // Set headers with only essential data
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'project': project1.id || '',
      'projectname': project1.name || '',
      'roleid': userRole.id || '',
      'rolename': userRole.name || ''
    });

    return this.https
      .get<any>(`/api/projects/${id}`, {
        headers: headers
      })
      .pipe(
        map((response) => {
          return new Project(response);
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
  update(project: Project): Observable<Project> {
    let body;

    let headerValue;

    try {
      body = JSON.stringify(project);
      headerValue = Buffer.from(body, 'utf8').toString('base64');

    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    const project1 = JSON.parse(sessionStorage.getItem("project") || '{}');
    const userRole = JSON.parse(sessionStorage.getItem("role") || '{}');

    // Set headers
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
      'Content-Type': 'application/json',
      'Accept': 'application/json,text/plain, */*',
      'Priority': 'u=1, i',
      'project': project1.id || '',
      'projectname': project1.name || '',
      'roleid': userRole.id || '',
      'rolename': userRole.name || '',
      example: headerValue

    });
    return this.https
      .put("/api/projects", body, {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          return new Project(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Load a page (for paginated datatable) of Project using the passed
   * project as an example for the search by example facility.
   */
  findAll(project: Project, event: any): Observable<PageResponse<Project>> {
    let req = new PageRequestByExample(project, event);
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
      .get("/api/projects/page", {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<Project>(pr.totalPages, pr.totalElements, Project.toArray(pr.content));
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  /**
   * Load a page (for paginated datatable) of Project using the passed
   * project as an example for the search by example facility.
   */
  FindAll(project: Project, event: any): Observable<PageResponse<Project>> {
    let req = new PageRequestByExample(project, event);
    let body;
    let headerValue;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }

    // let headers = new HttpHeaders();

    // headers = headers.append('example', headerValue);
    // Get project and role from sessionStorage
    const project1 = JSON.parse(sessionStorage.getItem("project") || '{}');
    const userRole = JSON.parse(sessionStorage.getItem("role") || '{}');

    // Set headers
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
      'Content-Type': 'application/json',
      'Accept': 'application/json,text/plain, */*',
      'Priority': 'u=1, i',
      'project': project1.id || '',
      'projectname': project1.name || '',
      'roleid': userRole.id || '',
      'rolename': userRole.name || '',
      example: headerValue
    });

    return this.https
      .get(`/api/projectss/page?page=${event.page}&size=${event.size}`, {
        observe: "response", headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<Project>(pr.totalPages, pr.totalElements, Project.toArray(pr.content));
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  search(project: Project, event: any): Observable<PageResponse<Project>> {
    let req = new PageRequestByExample(project, event);
    let body;
    let headerValue;

    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');

    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    // headers = headers.append('example', headerValue);
    // Get project and role from sessionStorage
    const project1 = JSON.parse(sessionStorage.getItem("project") || '{}');
    const userRole = JSON.parse(sessionStorage.getItem("role") || '{}');

    // Set headers
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
      'Content-Type': 'application/json',
      'Accept': 'application/json,text/plain, */*',
      'Priority': 'u=1, i',
      'project': project1.id || '',
      'projectname': project1.name || '',
      'roleid': userRole.id || '',
      'rolename': userRole.name || '',
      example: headerValue
    });
    return this.https
      .post(`/api/search/projects/page?page=${event.page}&size=${event.size}`, body,
        {
          observe: "response",
          headers: headers
        })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<Project>(pr.totalPages, pr.totalElements, Project.toArray(pr.content));
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
   * Used by ProjectCompleteComponent.
   */
  complete(query: string): Observable<Project[]> {
    let body;
    try {
      body = JSON.stringify({ query: query, maxResults: 10 });
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/projects/complete", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return Project.toArray(a);
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
    let req = new PageRequestByExample(id, event);
    let body;
    let headerValue;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    // let headers = new HttpHeaders();

    // headers = headers.append('example', headerValue);
    // Get project and role from sessionStorage
    const project1 = JSON.parse(sessionStorage.getItem("project") || '{}');
    const userRole = JSON.parse(sessionStorage.getItem("role") || '{}');

    // Set headers
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
      'Content-Type': 'application/json',
      'Accept': 'application/json,text/plain, */*',
      'Priority': 'u=1, i',
      'project': project1.id || '',
      'projectname': project1.name || '',
      'roleid': userRole.id || '',
      'rolename': userRole.name || '',
      example: headerValue
    });
    return this.https
      .delete("/api/projects/" + id, {
        observe: "response",
        headers: headers
      })
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  copyBluePrint(fromproject, toproject, toprojectid) {
    let body;
    try {
      body = toproject;
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/copyblueprint/" + toproject + "/" + fromproject + "?projectId=" + toprojectid, body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  copyPipelines(fromproject, toproject, toprojectid) {
    let body;
    try {
      body = toproject;
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/aip/jobs/copyPipelines/" + toproject + "/" + fromproject + "?projectId=" + toprojectid, body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  copyDatasets(fromproject, toproject, toprojectid) {
    let body;
    try {
      body = toproject;
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/aip/jobs/copyDatasets/" + toproject + "/" + fromproject + "?projectId=" + toprojectid, body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  copyDashboards(fromproject, toproject, toprojectid) {
    let body;
    try {
      body = toproject;
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/copyDashboards/" + toproject + "/" + fromproject + "?projectId=" + toprojectid, body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return response.body;
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

  private convert(project: Project): Project {
    const copy: Project = Object.assign({}, project);
    return copy;
  }
}
