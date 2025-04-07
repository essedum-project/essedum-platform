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
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Mashup } from '../DTO/mashup';
import { PageRequestByExample } from '../sharedModule/support/paging';

@Injectable()
export class MashupsService {

  messageService: any;

  constructor(
    private https: HttpClient,
    @Inject('envi') private baseUrl: string,
  ) { }

  getAllMashups(organization): Observable<any> {
    return this.https.get(this.baseUrl + '/mashups/all', { observe: 'response', params: { org: organization } })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getMashupByName(name: any): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https.get(this.baseUrl + '/mashups/' + name + '/' + org, { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  deleteMashupByName(name: any): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https.delete(this.baseUrl + '/mashups/' + name + '/' + org, { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  createMashup(mashup): Observable<any> {
    const copy = this.convertTemplate(mashup);
    return this.https
      .post(this.baseUrl + '/mashups/add', mashup, { observe: 'response' })
      .pipe(map(res => {
        return res.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  private convertTemplate(mashup: Mashup): Mashup {
    const copy: Mashup = Object.assign({}, mashup);
    return copy;
  }

  getPermissionList(): Observable<any> {
    let project = {};
    project['module'] = 'cip'
    let lazyload = { first: 0, rows: 1000, sortField: null, sortOrder: null };
    let req = new PageRequestByExample(project, lazyload);
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
    return this.https.get(this.baseUrl + '/usm-permissionss/page', { observe: 'response', headers: headers })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  private handleError(error: any) {
    const errMsg = (error.message) ? error.message :
      error.status ? `Status: ${error.status} - Text: ${error.statusText}` : 'Server error';
    console.error(errMsg);
    return throwError(errMsg);
  }
}
