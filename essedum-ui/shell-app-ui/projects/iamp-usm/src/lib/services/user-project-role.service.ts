import { Injectable, Inject, SkipSelf } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, map, catchError, throwError } from "rxjs";
import { MessageService } from "./message.service";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { UserProjectRole } from "../models/user-project-role";
import { Users } from "../models/users";

@Injectable()
export class UserProjectRoleService {

  constructor(
    private https: HttpClient
  ) { }

  /**
   * Create a new  UserProjectRole.
   */

  create(user_project_role: UserProjectRole): Observable<UserProjectRole> {
    const copy = this.convert(user_project_role);

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

    console.log("Creating user project role:", copy);
    console.log("Headers:", headers);

    return this.https
      .post("/api/user-project-roles", copy, {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          return new UserProjectRole(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Get a UserProjectRole by id.
   */
  getUserProjectRole(id: any): Observable<UserProjectRole> {
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

    console.log("Getting user project role with ID:", id);
    console.log("Headers:", headers);

    return this.https
      .get("/api/user-project-roles/" + id, {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          return new UserProjectRole(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Update the passed user_project_role.
   */
  update(user_project_role: UserProjectRole): Observable<UserProjectRole> {
    let body;
    let result;
    try {
      body = JSON.stringify(user_project_role);
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

    console.log("Updating user project role:", user_project_role);
    console.log("Headers:", headers);

    return this.https
      .put("/api/user-project-roles", body, {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          return new UserProjectRole(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Load a page (for paginated datatable) of UserProjectRole using the passed
   * user_project_role as an example for the search by example facility.
   */
  findAll(user_project_role: UserProjectRole, event: any): Observable<PageResponse<UserProjectRole>> {
    let req = new PageRequestByExample(user_project_role, event);
    let body;
    let headerValue;
    let result;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, "utf8").toString("base64");
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

    console.log("Fetching user project roles with token:", localStorage.getItem('jwtToken'));

    return this.https
      .get("/api/user-project-roles/page", {
        observe: "response",
        headers: headers,
      })
      .pipe(
        map((response) => {
          console.log("FindAll response received:", response);
          let pr: any = response.body;
          return new PageResponse<UserProjectRole>(
            pr.totalPages,
            pr.totalElements,
            UserProjectRole.toArray(pr.content)
          );
        }),
        catchError((err) => {
          console.error("FindAll error:", err);
          return this.handleError(err);
        })
      )



      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  FindAll(user_project_role: UserProjectRole, event: any): Observable<PageResponse<UserProjectRole>> {
    let req = new PageRequestByExample(user_project_role, event);
    let body;
    let headerValue;
    let result;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, "utf8").toString("base64");
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

    console.log("Fetching user project roles with FindAll");
    console.log("Headers:", headers);
    console.log("URL:", `/api/user-project-roless/page?page=${event.page}&size=${event.size}`);

    return this.https
      .get(`/api/user-project-roless/page?page=${event.page}&size=${event.size}`, {
        observe: "response",
        headers: headers,
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<UserProjectRole>(
            pr.totalPages,
            pr.totalElements,
            UserProjectRole.toArray(pr.content)
          );
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  search(user_project_role: UserProjectRole, event: any): Observable<PageResponse<UserProjectRole>> {
    let req = new PageRequestByExample(user_project_role, event);
    let body;
    let result;
    try {
      body = JSON.stringify(req);
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

    console.log("Searching user project roles");
    console.log("Headers:", headers);
    console.log("URL:", `/api/search/user-project-roles/page?page=${event.page}&size=${event.size}`);

    return this.https
      .post(`/api/search/user-project-roles/page?page=${event.page}&size=${event.size}`, body, {
        observe: "response",
        headers: headers,
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<UserProjectRole>(
            pr.totalPages,
            pr.totalElements,
            UserProjectRole.toArray(pr.content)
          );
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  findAllTwb(user_project_role: any, event: any): Observable<PageResponse<UserProjectRole>> {
    let req = new PageRequestByExample(user_project_role, event);
    req.example.project_id = req.example.project_id;
    delete req.example.project_id;
    let body;
    let headerValue;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, "utf8").toString("base64");
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

    console.log("findAllTwb for user project roles");
    console.log("Headers:", headers);

    return this.https
      .get("/api/user-project-roles/page", {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<UserProjectRole>(
            pr.totalPages,
            pr.totalElements,
            UserProjectRole.toArray(pr.content)
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
   * Used by UserProjectRoleCompleteComponent.
   */
  complete(query: string): Observable<UserProjectRole[]> {
    let body;
    try {
      body = JSON.stringify({ query: query, maxResults: 10 });
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .post("/api/user-project-roles/complete", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any;
          response.body;
          return UserProjectRole.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Delete an UserProjectRole by id.
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

    console.log("Deleting user project role with ID:", id);
    console.log("Headers:", headers);

    return this.https
      .delete("/api/user-project-roles/" + id, {
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
   * Create a List of  UserProjectRoles.
   */
  createAll(user_project_role: UserProjectRole[]): Observable<UserProjectRole[]> {
    let result;
    const copy: UserProjectRole[] = Object.assign([], user_project_role);

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

    console.log("Creating multiple user project roles:", copy);
    console.log("Headers:", headers);

    return this.https
      .post("/api/user-project-roles-list", copy, {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return UserProjectRole.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  getUsersByRoleId(roleId, projectId): Observable<Users[]> {
    return this.https
      .get("/api/user-project-roles-by-roleid/" + roleId + '/' + projectId, { observe: "response" })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return Users.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  // sample method from angular doc
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



  private convert(user_project_role: UserProjectRole): UserProjectRole {
    const copy: UserProjectRole = Object.assign({}, user_project_role);
    return copy;
  }
}
