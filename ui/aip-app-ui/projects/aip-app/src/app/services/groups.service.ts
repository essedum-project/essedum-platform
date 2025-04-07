//
//  @ 2018 Infosys Limited, Bangalore, India. All Rights Reserved.
//  Version: 1.0
//  Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
//  this Program is protected by copyright laws, international treaties and  other pending or existing intellectual property
//  rights in India, the United States, and other countries. Except as expressly permitted, any unauthorized reproduction, storage,
//  transmission in any form or by any means(including without limitation electronic, mechanical, printing, photocopying,
//  recording, or otherwise), or any distribution of this program, or any portion of it, may result in severe civil and
//  criminal penalties, and will be prosecuted to the maximum extent possible under the law.
//

import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Services } from './service';
import { Groups } from '../groups/groups';
import { PageRequestByExample, PageResponse } from 'com-lib-util';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor(private https: HttpClient, private messageService: Services,
    @Inject('envi') private baseUrl: string,
    private router: Router
  ) {

  }
  // getGroupsLength(): Observable<any> {
  
  //   return this.http.get(this.baseUrl + '/groups/all/len/' + sessionStorage.getItem("organization"))
  // }

  getAllPage(groups: Groups,
    event: any): Observable<PageResponse<Groups>> {
      try{
        const req = new PageRequestByExample(groups, event);
        const body = JSON.stringify(req);
        return this.https
          .post(
            this.baseUrl + '/groups/all',
            body,
            {
              headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
              observe: 'response'
            }
          )
          .pipe(map(response => {
            const pr: any = response.body;
            return new PageResponse<Groups>(
              pr.totalPages,
              pr.totalElements,
              Groups.toArray(pr.content)
            );
          }))
          .pipe(catchError(err => {
            if (err.status === 401) {
              sessionStorage.setItem('pendingNavigation', window.location.pathname);
              this.router.navigate(['/']);
            }
            return this.handleError(err);
          }));

      }
      catch(Exception){
      this.messageService.message("Some error occured", "Error")
      }
   
  }

  updateGroupings(alias: any, value: any): Observable<any> {
    const body = value;
    body.organization = sessionStorage.getItem("organization");
    return this.https.post(this.baseUrl + '/groups/add/' + alias, body)
        .pipe(map(response => {
            return response
        }))
        .pipe(catchError(err => {
            return this.handleError(err);
        }));
}

  getGroupsLength(): Observable<any> {
    return this.https.get(this.baseUrl + '/groups/all/len/' + sessionStorage.getItem("organization"))
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError(err => {
        return this.handleError(err)
      }))
  }

  // getAllGroups(page, size): Observable<any> {
  
  //   return this.http.get(this.baseUrl + '/groups/paginated/all', {
  //     params: { page: page, size: size, org: sessionStorage.getItem("organization") }
// }
// }
  getAllGroups(page, size): Observable<any> {
    return this.https.get(this.baseUrl + '/groups/paginated/all',  {
      params: {org:sessionStorage.getItem("organization"),observe:'response', page: page, size: size }
    })
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getGroups(): Observable<any> {
    return this.https.get(this.baseUrl + '/groups/all', { params: { org: sessionStorage.getItem("organization") } })
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getAllGroupsByOrgAndEntity(entityType: any, entity: any, page, size): Observable<any> {
    return this.https.get(this.baseUrl + '/groups/search/' + entityType + '/' + entity, {
      observe: 'response',
      params: {
        org: sessionStorage.getItem("organization"),
        page: page,
        size: size
      }
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getAllGroupsLenByOrgAndEntity(entityType: any, entity: any): Observable<any> {
    return this.https.get(this.baseUrl + '/groups/search/len/' + entityType + '/' + entity + '/' + sessionStorage.getItem("organization"), { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getSingleGroupByOrgAndEntity(entity: any): Observable<any> {
    return this.https.get(this.baseUrl + '/groups/pipeline/' + entity + '/' + sessionStorage.getItem("organization"), { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getSingleGroupByOrgAndEntityForAgent(entity: any): Observable<any> {
    return this.https.get(this.baseUrl + '/groups/agent/' + entity + '/' + sessionStorage.getItem("organization"), { observe: 'response' })
    // return this.https.get(this.baseUrl + '/groups/search/' + entityType + '/' + entity , 
    // { observe: 'response',
    // params: {org:sessionStorage.getItem("organization"), page : page, size : size} })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    const errMsg = error.error
      ? error.error
      : error.status
        ? `Status: ${error.status} - Text: ${error.statusText}`
        : 'Server error';
    console.error(errMsg); // log to console instead
    // if (error.status === 401) {
    //   window.location.href = '/';
    // }
    return throwError(errMsg);
  }
}
