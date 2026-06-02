
import { Injectable, SkipSelf } from "@angular/core";
import { Observable, map, catchError, throwError } from "rxjs";
import { MessageService } from "./message.service";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { Roletorole } from "../models/role-role";
import { UsmPermissions } from "../models/usm-permissions";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable()
export class RoleroleService {
  constructor(private https: HttpClient, private messageService: MessageService) { }

  /**
   * Create a new  Rolerole.
   */

  create(usm_role_permissions: Roletorole): Observable<Roletorole> {
    const copy = this.convert(usm_role_permissions);

    // Get project and role from sessionStorage
    const project = JSON.parse(sessionStorage.getItem("project") || '{}');
    const userRole = JSON.parse(sessionStorage.getItem("role") || '{}');

    // Set headers
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
      'Content-Type': 'application/json',
      'Accept': 'application/json,text/plain, */*',
      'Priority': 'u=1, i',
      'project': project.id || '',
      'projectname': project.name || '',
      'roleid': userRole.id || '',
      'rolename': userRole.name || ''
    });

    console.log("Creating role-role:", copy);
    console.log("Headers:", headers);

    return this.https
      .post("/api/usm-role-role", copy, {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          return new Roletorole(response);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Get a Rolerole by id.
   */
  getRolerole(id: any): Observable<Roletorole> {
    // Get project and role from sessionStorage
    const project = JSON.parse(sessionStorage.getItem("project") || '{}');
    const userRole = JSON.parse(sessionStorage.getItem("role") || '{}');

    // Set headers
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
      'Content-Type': 'application/json',
      'Accept': 'application/json,text/plain, */*',
      'Priority': 'u=1, i',
      'project': project.id || '',
      'projectname': project.name || '',
      'roleid': userRole.id || '',
      'rolename': userRole.name || ''
    });

    console.log("Getting role-role with ID:", id);
    console.log("Headers:", headers);

    return this.https
      .get("/api/usm-role-role/" + id, {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          return new Roletorole(response.body);
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
  update(usm_role_permissions: Roletorole): Observable<Roletorole> {
    let body;
    try {
      body = JSON.stringify(usm_role_permissions);
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }

    // Get project and role from sessionStorage
    const project = JSON.parse(sessionStorage.getItem("project") || '{}');
    const userRole = JSON.parse(sessionStorage.getItem("role") || '{}');

    // Set headers
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
      'Content-Type': 'application/json',
      'Accept': 'application/json,text/plain, */*',
      'Priority': 'u=1, i',
      'project': project.id || '',
      'projectname': project.name || '',
      'roleid': userRole.id || '',
      'rolename': userRole.name || ''
    });

    console.log("Updating role-role:", usm_role_permissions);
    console.log("Headers:", headers);

    return this.https
      .put("/api/usm-role-role", body, {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          return new Roletorole(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Load a page (for paginated datatable) of Rolerole using the passed
   * usm_role_permissions as an example for the search by example facility.
   */
  findAll(usm_role_permissions: Roletorole, event: any): Observable<PageResponse<Roletorole>> {
    let req = new PageRequestByExample(usm_role_permissions, event);
    let body;
    let headerValue;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }

    // Get project and role from sessionStorage
    const project = JSON.parse(sessionStorage.getItem("project") || '{}');
    const userRole = JSON.parse(sessionStorage.getItem("role") || '{}');

    // Set headers
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

    console.log("Finding role-roles");
    console.log("Headers:", headers);

    return this.https
      .get("/api/usm-role-role/page", {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<Roletorole>(
            pr.totalPages,
            pr.totalElements,
            Roletorole.toArray(pr.content)
          );
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
   * Used by RoleroleCompleteComponent.
   */
  complete(query: string): Observable<Roletorole[]> {
    let body;
    try {
      body = JSON.stringify({ query: query, maxResults: 10 });
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }

    // Get project and role from sessionStorage
    const project = JSON.parse(sessionStorage.getItem("project") || '{}');
    const userRole = JSON.parse(sessionStorage.getItem("role") || '{}');

    // Set headers
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
      'Content-Type': 'application/json',
      'Accept': 'application/json,text/plain, */*',
      'Priority': 'u=1, i',
      'project': project.id || '',
      'projectname': project.name || '',
      'roleid': userRole.id || '',
      'rolename': userRole.name || ''
    });

    console.log("Complete search for role-roles with query:", query);
    console.log("Headers:", headers);

    return this.https
      .post("/api/usm-role-role/complete", body, {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return Roletorole.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Delete an Rolerole by id.
   */
  delete(id: any) {
    // Get project and role from sessionStorage
    const project = JSON.parse(sessionStorage.getItem("project") || '{}');
    const userRole = JSON.parse(sessionStorage.getItem("role") || '{}');

    // Set headers
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
      'Content-Type': 'application/json',
      'Accept': 'application/json,text/plain, */*',
      'Priority': 'u=1, i',
      'project': project.id || '',
      'projectname': project.name || '',
      'roleid': userRole.id || '',
      'rolename': userRole.name || ''
    });

    console.log("Deleting role-role with ID:", id);
    console.log("Headers:", headers);

    return this.https
      .delete("/api/usm-role-role/" + id, {
        observe: "response",
        headers: headers
      })
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
  * Create a List of  Rolerole.
  */
  createAll(usm_role_permissions: Roletorole[]): Observable<Roletorole[]> {
    const copy: Roletorole[] = Object.assign([], usm_role_permissions);
    const project = JSON.parse(sessionStorage.getItem("project") || '{}');
    const userRole = JSON.parse(sessionStorage.getItem("role") || '{}');

    // Set headers
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
      'Content-Type': 'application/json',
      'Accept': 'application/json,text/plain, */*',
      'Priority': 'u=1, i',
      'project': project.id || '',
      'projectname': project.name || '',
      'roleid': userRole.id || '',
      'rolename': userRole.name || ''
    });
    return this.https
      .post("/api/usm-role-role-list", copy, {
        observe: "response",
        headers: headers

      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return Roletorole.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }


  getRoleroleChild(id: any): Observable<Roletorole[]> {
    return this.https
      .get("/api/usm-role-roleParent/" + id, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return Roletorole.toArray(a);
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
    // Enhanced error logging with detailed information
    console.error('API Error in RoleRoleService');
    console.error('Error status:', error.status);
    console.error('Error status text:', error.statusText);
    console.error('Error message:', error.message);
    console.error('Error URL:', error.url);

    // Log request details if available
    if (error.error && error.error.message) {
      console.error('Server error message:', error.error.message);
    }

    // Log the full error object for debugging
    console.error('Full error object:', JSON.stringify(error, null, 2));

    let errMsg = error.error || error.statusText || 'Unknown server error';
    return throwError(errMsg);
  }

  private convert(usm_role_permissions: Roletorole): Roletorole {
    const copy: Roletorole = Object.assign({}, usm_role_permissions);
    return copy;
  }
}
