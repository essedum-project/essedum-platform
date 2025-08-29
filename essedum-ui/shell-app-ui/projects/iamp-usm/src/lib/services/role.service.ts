import { Injectable, Inject } from "@angular/core";
import { Observable, map, catchError, throwError } from "rxjs";
import { MessageService } from "./message.service";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { Role } from "../models/role";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable()
export class RoleService {
  constructor(private https: HttpClient, private messageService: MessageService) { }

  /**
   * Create a new  Role.
   */
  create(role: Role): Observable<Role> {
    const copy = this.convert(role);

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

    console.log("Creating role:", copy);
    console.log("Headers:", headers);

    return this.https
      .post("/api/roles", copy, { observe: "response", headers: headers })
      .pipe(
        map((response) => {
          console.log("Create role response:", response);
          return new Role(response.body);
        })
      )
      .pipe(
        catchError((err) => {

          console.error("Error creating role:", err);
          return this.handleError(err);
        })
      );
  }

  /**
   * Get a Role by id.
   */
  getRole(id: any): Observable<Role> {

    console.log("Getting role with ID:", id);

    // Get a simpler set of headers for troubleshooting
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

    // Try a different URL format - some APIs use different patterns
    const url = `/api/roles/${id}`;
    console.log("Making request to:", url);

    return this.https
      .get(url, {
        observe: "response",
        headers: headers,
        // Add withCredentials to ensure cookies are sent
        withCredentials: true
      })
      .pipe(
        map((response) => {
          console.log("Role response:", response);
          return new Role(response.body);
        })
      )
      .pipe(
        catchError((err) => {

          console.error("Error getting role:", err);
          // Try to get more specific error details
          if (err.error instanceof ErrorEvent) {
            // Client-side error
            console.error('Client-side error:', err.error.message);
          } else {
            // Server-side error
            console.error(`Server returned code ${err.status}, error:`, err.error);
          }

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

    console.log("Updating role:", role);
    console.log("Headers:", headers);

    return this.https
      .put("/api/roles", body, {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          console.log("Update role response:", response);
          return new Role(response.body);
        })
      )
      .pipe(
        catchError((err) => {

          console.error("Error updating role:", err);
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

    console.log("Deleting role with ID:", id);
    console.log("Headers:", headers);

    return this.https.delete("/api/roles/" + id, {
      observe: "response",
      headers: headers
    }).pipe(
      map(response => {
        console.log("Delete role response:", response);
        return response;
      }),
      catchError((err) => {
        console.error("Error deleting role:", err);
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


  // Helper method to create standardized request headers with all required values
  private createRequestHeaders(): HttpHeaders {
    let headers = new HttpHeaders();

    // Add all required headers as shown in the curl example
    headers = headers.append('Accept', 'application/json, text/plain, */*');
    headers = headers.append('Accept-Language', 'en-US,en;q=0.9');
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Connection', 'keep-alive');
    headers = headers.append('X-Requested-With', 'Leap');
    headers = headers.append('charset', 'utf-8');
    headers = headers.append('Sec-Fetch-Dest', 'empty');
    headers = headers.append('Sec-Fetch-Mode', 'cors');
    headers = headers.append('Sec-Fetch-Site', 'same-origin');
    headers = headers.append('sec-ch-ua', '"Not;A=Brand";v="99", "Microsoft Edge";v="139", "Chromium";v="139"');
    headers = headers.append('sec-ch-ua-mobile', '?0');
    headers = headers.append('sec-ch-ua-platform', '"Windows"');

    // Add User-Agent header
    headers = headers.append('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0');

    // Add Referer header - matching the exact format in the curl example
    if (typeof window !== 'undefined') {
      // Use the actual origin like in the curl example
      headers = headers.append('Referer', window.location.origin + '/');
    }

    // Add authorization header if available
    if (sessionStorage.getItem("authToken")) {
      headers = headers.append('Authorization', 'Bearer ' + sessionStorage.getItem("authToken"));
    } else if (localStorage.getItem("jwtToken")) {
      headers = headers.append('Authorization', 'Bearer ' + localStorage.getItem("jwtToken"));
    }

    // Add Project headers - exact casing as in the curl example
    if (sessionStorage.hasOwnProperty("project") && sessionStorage.getItem("project") !== "") {
      try {
        const project = JSON.parse(sessionStorage.getItem("project") || "{}");
        if (project.id) {
          headers = headers.append('Project', project.id.toString());
        }
        if (project.name) {
          headers = headers.append('ProjectName', project.name.toString());
        }
      } catch (e) {
        console.error("Error parsing project from sessionStorage:", e);
      }
    }

    // Add role headers - exact casing as in the curl example
    if (sessionStorage.hasOwnProperty("role") && sessionStorage.getItem("role") !== "") {
      try {
        const role = JSON.parse(sessionStorage.getItem("role") || "{}");
        if (role.id) {
          headers = headers.append('roleId', role.id.toString());
        }
        if (role.name) {
          headers = headers.append('roleName', role.name.toString());
        }
      } catch (e) {
        console.error("Error parsing role from sessionStorage:", e);
      }
    }

    // Try to add Cookie header if available from document.cookie
    if (typeof document !== 'undefined' && document.cookie) {
      headers = headers.append('Cookie', document.cookie);
    }

    return headers;
  }

}
