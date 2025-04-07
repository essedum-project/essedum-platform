import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { UserProjectRole } from '../models/user-project-role';
import { PageResponse } from '../sharedModule/support/paging';
import { PageRequestByExample } from './page-request';
import { Role } from '../models/role';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  constructor(
    private https: HttpClient,
    @Inject('dataSets') private dataUrl: string,
    @Inject('envi') private baseUrl: string
  ) {}
  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    const errMsg = error.error;
    console.error(errMsg); // log to console instead
    if (error.status === 401) {
      window.location.href = '/';
    }
    return throwError(errMsg);
  }
  getRoleList(role): Observable<PageResponse<Role>> {
    let event = { first: 0, rows: 100000, sortField: null, sortOrder: null };
    let req = new PageRequestByExample(role, event);
    let body;
    let headerValue;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');
    } catch (e: any) {
      console.error('JSON.stringify error - ', e.message);
    }
    let headers = new HttpHeaders();
    headers = headers.append('example', headerValue);
    return this.https
      .get('/api/roles/page', {
        observe: 'response',
        headers: headers,
      })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<Role>(
            pr.totalPages,
            pr.totalElements,
            Role.toArray(pr.content)
          );
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  getUserList(user_project_role: UserProjectRole, event: any): Observable<PageResponse<UserProjectRole>> {
    let req = new PageRequestByExample(user_project_role, event);
    let body;
    let headerValue;
    let result;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, "utf8").toString("base64");
    } catch (e : any)  {
      console.error("JSON.stringify error - ", e.message);
    }
    let headers = new HttpHeaders();
    headers = headers.append("example", headerValue);
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
}
