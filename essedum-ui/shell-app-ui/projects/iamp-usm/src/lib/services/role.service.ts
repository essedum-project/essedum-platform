import { Injectable, Inject } from "@angular/core";
import { Observable, map, catchError, throwError } from "rxjs";
// import { Observable } from "rxjs/Observable";
// import { throwError } from "rxjs";
import { MessageService } from "./message.service";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { Role } from "../models/role";
import { HttpClient, HttpHeaders } from "@angular/common/http";
// import { map, catchError } from "rxjs/operators";
@Injectable()
export class RoleService {
  constructor(private https: HttpClient, private messageService: MessageService) { }

  /**
   * Create a new  Role.
   */

  create(role: Role): Observable<Role> {
    const copy = this.convert(role);
        let req = new PageRequestByExample(role, event);
    let body;
    let headerValue;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');
    } catch (e : any)  {
      console.error("JSON.stringify error - ", e.message);
    }
      const project = JSON.parse(sessionStorage.getItem("project") || '{}');
    const userRole = JSON.parse(sessionStorage.getItem("role") || '{}');
   const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
      'Content-Type': 'application/json',
      'Accept': 'application/json,text/plain, */*',
      'Priority': 'u=1, i',
      'project': project.id || '',
      'projectname': project.name || '',
      'roleid': userRole.id || '',
      'rolename': userRole.name || '',
      'example': headerValue 
    });
    return this.https
      .post("/api/roles", copy, { observe: "response", headers: headers })
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
   * Get a Role by id.
   */
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
    } catch (e: any) {
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

  /*
   *Download Roles.
   */
  download(id: any): Observable<any> {

    return this.https.get("/api/getUserRolesInExcel/" + id, { responseType: "blob" as "json" });
  }

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
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }

    const project = JSON.parse(sessionStorage.getItem("project") || '{}');
    const userRole = JSON.parse(sessionStorage.getItem("role") || '{}');

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
      'Content-Type': 'application/json',
      'Accept': 'application/json,text/plain, */*',
      'Priority': 'u=1, i',
      'project': project.id || '',
      'projectname': project.name || '',
      'roleid': userRole.id || '',
      'rolename': userRole.name || '',
      'example': headerValue 
    });

 

    return this.https
      .get("/api/roles/page", {
        observe: "response", 
        headers: headers
      })
      .pipe(
        map((response) => {
          console.log('API Response:', response);
          let pr: any = response.body;
          return new PageResponse<Role>(pr.totalPages, pr.totalElements, Role.toArray(pr.content));
        })
      )
      .pipe(
        catchError((err) => {
          console.error('API Error:', err);
          return this.handleError(err);
        })
      );
  }

  /**
   * Performs a search by example on 1 attribute (defined on server side) and returns at most 10 results.
   * Used by RoleCompleteComponent.
   */
  complete(query: string): Observable<Role[]> {
    let body;
    try {
      body = JSON.stringify({ query: query, maxResults: 10 });
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/roles/complete", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return Role.toArray(a);
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

  // sample method from angular doc
  private handleError(error: any) {
    // More detailed error logging
    console.error('Error status:', error.status);
    console.error('Error status text:', error.statusText);
    console.error('Error details:', error);
    
    let errMsg = error.error;
    error.status ? `Status: ${error.status} - Text: ${error.statusText}` : "Server error";
    console.error(errMsg); // log to console instead
    // if (error.status === 401) {
    //   window.location.href = "/";
    // }
    return throwError(errMsg);
  }

  private convert(role: Role): Role {
    const copy: Role = Object.assign({}, role);
    return copy;
  }

  getAllRolesByProcessId(processId, filterType, roleId): Observable<Role[]> {

    return this.https
      .get("/api/rolesByProcessId/" + processId + '/' + filterType + '/' + roleId, { observe: "response" })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return Role.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );

  }

  getAllRolesOfProcess(process: string): Observable<Role[]> {

    return this.https
      .get("/api/rolesByProcess/" + process, { observe: "response" })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return Role.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );

  }

  getAllRoleByNameAndProject(roleName: string): Observable<Role[]> {

    return this.https
      .get("/api/rolesByNameAndProjectId/" + roleName + "/" + JSON.parse(sessionStorage.getItem("project"))?.id, { observe: "response" })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return Role.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );

  }

  getRoleByName(roleName: string): Observable<Role[]> {

    return this.https
      .get("/api/roleByName/" + roleName, { observe: "response" })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return Role.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );

  }
}
