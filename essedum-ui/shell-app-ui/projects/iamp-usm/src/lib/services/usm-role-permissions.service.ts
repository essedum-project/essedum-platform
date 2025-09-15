import { Injectable, SkipSelf } from "@angular/core";
import { Observable, map, catchError, throwError } from "rxjs";
import { MessageService } from "./message.service";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { UsmRolePermissions } from "../models/usm-role-permissions";
import { UsmPermissions } from "../models/usm-permissions";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable()
export class UsmRolePermissionsService {
  constructor(private https: HttpClient, private messageService: MessageService) { }

  /**
   * Create a new  UsmRolePermissions.
   */
  create(usm_role_permissions: UsmRolePermissions): Observable<UsmRolePermissions> {
    let headers = this.createRequestHeaders();
    // Add Content-Type header - critical for POST requests
    headers = headers.append('Content-Type', 'application/json');

    // Log what's being sent for debugging
    console.log('Creating single role permission with data:', JSON.stringify(usm_role_permissions));

    // Ensure permission is always an array
    const copy = this.convert(usm_role_permissions);
    if (!Array.isArray(copy.permission)) {
      copy.permission = copy.permission ? [copy.permission] : [];
    }

    return this.https
      .post("/api/usm-role-permissionss", copy, {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          console.log('Single create succeeded:', response);
          return new UsmRolePermissions(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          console.error('Single create failed:', err);
          return this.handleError(err);
        })
      );
  }

  /**
   * Get a UsmRolePermissions by id.
   */
  getUsmRolePermissions(id: any): Observable<UsmRolePermissions> {
    return this.https
      .get("/api/usm-role-permissionss/" + id, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new UsmRolePermissions(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  /**
   * Update the passed usm_role_permissions.as per aip
   */
  update(usm_role_permissions: UsmRolePermissions): Observable<UsmRolePermissions> {
    let headers = this.createRequestHeaders();
    // Add Content-Type header - critical for PUT requests
    headers = headers.append('Content-Type', 'application/json');

    // Format the data properly for the API (similar to createAll method)
    const copy: any = {
      id: usm_role_permissions.id,
      role: usm_role_permissions.role
    };

    // The API expects permission to be a single object, not an array
    if (Array.isArray(usm_role_permissions.permission) && usm_role_permissions.permission.length > 0) {
      copy.permission = usm_role_permissions.permission[0];
    } else {
      copy.permission = usm_role_permissions.permission;
    }

    console.log('Updating role permission with data:', JSON.stringify(copy));

    return this.https
      .put("/api/usm-role-permissionss", copy, {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          return new UsmRolePermissions(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Load a page (for paginated datatable) of UsmRolePermissions using the passed
   * usm_role_permissions as an example for the search by example facility.
   */
  findAll(usm_role_permissions: UsmRolePermissions, event: any): Observable<PageResponse<UsmRolePermissions>> {
    let req = new PageRequestByExample(usm_role_permissions, event);
    let body;
    let headerValue;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }    // Get base headers from createRequestHeaders, then add the example header
    let headers = this.createRequestHeaders();
    headers = headers.append('example', headerValue);
    return this.https
      .get("/api/usm-role-permissionss/page", {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<UsmRolePermissions>(
            pr.totalPages,
            pr.totalElements,
            UsmRolePermissions.toArray(pr.content)
          );
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  } findAllPaginated(page, size, sortBy, orderBy): Observable<PageResponse<UsmRolePermissions>> {
    // Create standardized headers with all required information
    let headers = this.createRequestHeaders();

    // Note: The role headers are now added in the createRequestHeaders() method
    // No need to add them here again

    return this.https
      .get("/api/usm-role-permissionss/paginated?page=" + page + "&size=" + size, {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<UsmRolePermissions>(
            pr.totalPages,
            pr.totalElements,
            UsmRolePermissions.toArray(pr.content)
          );
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  findAllSearched(module, permission, role, page, size, sortBy, orderBy): Observable<PageResponse<UsmRolePermissions>> {
    // We'll use the same header creation logic that we use in findAllPaginated
    // for consistency and to ensure all required headers are included
    let headers = this.createRequestHeaders();

    return this.https
      .get("/api/usm-role-permissionss/searched?" + "module=" + module + "&permission=" + permission + "&role=" + role + "&page=" + page + "&size=" + size, {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<UsmRolePermissions>(
            pr.totalPages,
            pr.totalElements,
            UsmRolePermissions.toArray(pr.content)
          );
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  findAllPermissions(usm_permissions: UsmPermissions, event: any): Observable<PageResponse<UsmPermissions>> {
    let req = new PageRequestByExample(usm_permissions, event);
    let body;
    let headerValue;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');

    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }    // Get base headers from createRequestHeaders, then add the example header
    let headers = this.createRequestHeaders();
    headers = headers.append('example', headerValue);
    return this.https
      .get("/api/usm-permissionss/page", {
        observe: "response",
        headers: headers
      })
      .pipe(map((response) => {
        let pr: any = response.body;
        return new PageResponse<UsmPermissions>(pr.totalPages, pr.totalElements, UsmPermissions.toArray(pr.content));
      }))
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Performs a search by example on 1 attribute (defined on server side) and returns at most 10 results.
   * Used by UsmRolePermissionsCompleteComponent.
   */
  complete(query: string): Observable<UsmRolePermissions[]> {
    let body;
    try {
      body = JSON.stringify({ query: query, maxResults: 10 });
    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/usm-role-permissionss/complete", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return UsmRolePermissions.toArray(a);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Delete an UsmRolePermissions by id.
   */
  delete(id: any) {
    let headers = this.createRequestHeaders();
    // Set content type to application/json
    headers = headers.append('Content-Type', 'application/json');
    // Log the request for debugging
    console.log(`Deleting role permission with ID: ${id}`);
    return this.https
      .delete("/api/usm-role-permissionss/" + id, {
        observe: "response",
        headers: headers
      })
      .pipe(
        catchError((err) => {
          console.error(`Delete attempt failed for ID ${id}:`, err);
          return this.handleError(err);
        })
      );
  }

  /**
   * Create a List of  UsmRolePermissions.
   */
  createAll(usm_role_permissions: UsmRolePermissions[]): Observable<UsmRolePermissions[]> {
    let headers = this.createRequestHeaders();
    // Add Content-Type header for POST requests
    headers = headers.append('Content-Type', 'application/json');

    // Format the data properly for the API
    const copy = usm_role_permissions.map(item => {
      // Create a new copy to avoid modifying the original
      const newItem: any = {
        role: item.role,
        id: item.id
      };

      // The API expects permission to be a single object, not an array
      if (Array.isArray(item.permission) && item.permission.length > 0) {
        newItem.permission = item.permission[0];
      } else {
        newItem.permission = item.permission;
      }

      return newItem;
    });

    console.log('Sending formatted data to API:', JSON.stringify(copy));

    return this.https
      .post("/api/usm-role-permissionss-list", copy, {
        observe: "response",
        headers: headers
      })
      .pipe(
        map((response) => {
          let a: any = response.body;
          return UsmRolePermissions.toArray(a);
        }),
        catchError((err) => {
          console.error('Error creating role permissions:', err);
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
  private convert(usm_role_permissions: UsmRolePermissions): UsmRolePermissions {
    const copy: UsmRolePermissions = Object.assign({}, usm_role_permissions);
    return copy;
  }



  // Helper method to create standardized request headers with all required values
  private createRequestHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
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
