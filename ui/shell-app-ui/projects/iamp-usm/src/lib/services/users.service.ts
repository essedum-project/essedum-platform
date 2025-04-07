//
// Copyright © 2016-2017 Infosys Limited, Bangalore, India. All Rights Reserved.
// * Except for any open source software components embedded in this
// * Infosys proprietary software program (Program), this Program is protected
// * by copyright laws, international treaties and other pending or existing
// * intellectual property rights in India, the United States and other countries.
// * Except as expressly permitted, any unauthorized reproduction, storage,
// * transmission in any form or by any means (including without limitation
// * electronic, mechanical, printing, photocopying, recording or otherwise),
// * or any distribution of this Program, or any portion of it,
// * may result in severe civil and criminal penalties, and
// * will be prosecuted to the maximum extent possible under the law.
// Template pack-angular:web/src/app/entities/entity.service.ts.e.vm
//
import { Injectable, Inject, SkipSelf } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { Users } from "../models/users";
//import { environment } from '../../../../../src/environments/environment';
// import { AuthService } from './auth.service';
import { CustomErrorHandlerService } from "../shared-modules/custom-error-handler/custom-error-handler.service";
import { MessageService } from "./message.service";

import { throwError, pipe } from "rxjs";
import { map, catchError } from "rxjs/operators";
import * as CryptoJS from 'crypto-js';
import {encKey} from '../models/encKey'

@Injectable()
export class UsersService {



  constructor(
    private https: HttpClient,
    private messageService: MessageService,
    private customErrorHandlerService: CustomErrorHandlerService,
    private encKey: encKey,
  ) {

  }

  authenticate(formdata: any): Observable<any> {
    let body;
    try {
      body = JSON.stringify(formdata);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/authenticate", body, {

        observe: "response",
      })
      .pipe(
        map((response) => {
          if (response.status == 200) {
            localStorage.setItem("jwtToken", response.body["id_token"]);
            return new Users(response.body);
          }
        })
      )
      .pipe(
        catchError((err) => {
          return "1";
          return this.customErrorHandlerService.handleAPIError(err);
        })
      );
  }

  getUserInfo(): Observable<any> {
    let result;
    return this.https
      .get("/api/userInfo", {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.customErrorHandlerService.handleAPIError(err);
        })
      );
  }

  /**
   * Create a new  Users.
   */

  create(users: Users): Observable<Users> {
    let result
    const copy = this.convert(users);
    return this.https
      .post("/api/userss/", copy, { observe: "response" })
      .pipe(
        map((response) => {
          return new Users(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Get a Users by id.
   */
  getUsers(id: any): Observable<Users> {
    let result;
    let temp;
    return this.https
      .get("/api/userss/" + id, { observe: "response" })
      .pipe(
        map((response) => {  
          return new Users(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  authorize(user: Users, org: string): Observable<any> {
    let body;
    try {
      body = JSON.stringify(user);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/userss/authorize/" + org, body, {

        observe: "response",
      })
      .pipe(
        map((response) => {
          if (response.status == 200) {
            return new Users(response.body);
          } else return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.customErrorHandlerService.handleAPIError(err);
        })
      );
  }
  getUsername(): Observable<any> {
    return this.https.get("/username", {
      responseType: "text",
      withCredentials: true,
    });
  }
  fetchEmployees(employeeName: string) {
    //this.fetchToken();
    return this.https
      .get("/api/get-user-details/" + employeeName + "/", {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.customErrorHandlerService.handleAPIError(err);
        })
      );
  }

  authenticateUser(user: Users, org: string): Observable<any> {
    let body;
    try {
      body = JSON.stringify(user);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/userss/authenticate/" + org, body, {

        observe: "response",
      })
      .pipe(
        map((response) => {
          if (response.status == 200) {
            return new Users(response.body);
          } else return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.customErrorHandlerService.handleAPIError(err);
        })
      );
  }

  /**
   * Update the passed users.
   */
  update(users: Users): Observable<Users> {
    let body;
    let result;
    try {
      body = JSON.stringify(users);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/userss/", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          //new Users(response.json()))
          return new Users(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  resetPassword(users: Users): Observable<Users> {
    let body;
    try {
      body = JSON.stringify(users);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/userss/updatePassword", body, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          //new Users(response))
          return new Users(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * Load a page (for paginated datatable) of Users using the passed
   * users as an example for the search by example facility.
   */
  findAll(users: Users, event: any): Observable<PageResponse<Users>> {
    let req = new PageRequestByExample(users, event);
    let body;
    let headerValue;
    let result;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    let headers = new HttpHeaders();
    headers = headers.append('example', headerValue);
    return this.https
      .get("/api/userss/page", {
        observe: "response", headers: headers,
        responseType: "text"
      })
      .pipe(
        map((response) => {
          result=JSON.parse(this.decryptUsingAES256(response.body,this.getKey()));
          let pr: any = result;
          return new PageResponse<Users>(pr.totalPages, pr.totalElements, Users.toArray(pr.content));
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  FindAll(users: Users, event: any): Observable<PageResponse<Users>> {
    let req = new PageRequestByExample(users, event);
    let body;
    let headerValue;
    let result;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    let headers = new HttpHeaders();
    headers = headers.append('example', headerValue);
    return this.https
      .get(`/api/users/page?page=${event.page}&size=${event.size}`, {
        observe: "response", headers: headers,
        responseType : "text"
      })
      .pipe(
        map((response) => {
          let key = this.getKey();
          result=JSON.parse(this.decryptUsingAES256(response.body,key));
          let pr: any = result;
          return new PageResponse<Users>(pr.totalPages, pr.totalElements, Users.toArray(pr.content));
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  search(users: Users, event: any): Observable<PageResponse<Users>> {
    let req = new PageRequestByExample(users, event);
    let body;
    let result;
    try {
      body = JSON.stringify(req);
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post(`/api/search/users/page?page=${event.page}&size=${event.size}`, body,
        {
          observe: "response",
        })
      .pipe(
        map((response) => {
          let pr: any = response.body;
          return new PageResponse<Users>(pr.totalPages, pr.totalElements, Users.toArray(pr.content));
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
   * Used by UsersCompleteComponent.
   */
  complete(query: string): Observable<Users[]> {
    let body;
    try {
      body = JSON.stringify({ query: query, maxResults: 10 });
    } catch (e) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/userss/complete", body, {
        observe: "response",
      })
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

  /**
   * Delete an Users by id.
   */
  delete(id: any) {
    return this.https
      .delete("/api/userss/" + id, { observe: "response" })
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  /**
   * logout
   */
  logout() {
    return this.https.get("/sso/logout/").pipe(
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
    if (error.status === 401) {
      window.location.href = "/";
    }
    return throwError(errMsg);
  }

  private convert(users: Users): Users {
    const copy: Users = Object.assign({}, users);
    return copy;
  }

  encrypt(dashFilter,key){
    key= window.btoa(key);
    var parsedBase64Key = CryptoJS.enc.Base64.parse(key);
    let iv =  CryptoJS.enc.Base64.parse(key);
    var encrypted = CryptoJS.AES.encrypt(dashFilter, parsedBase64Key, {
      blockSize: 128,
      keySize: 128,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();

  }
  decryptUsingAES256(decString,key) {
    key= window.btoa(key);
    var parsedBase64Key = CryptoJS.enc.Base64.parse(key);
    let iv =  CryptoJS.enc.Base64.parse(key);
    var decrypted = CryptoJS.AES.decrypt(decString, parsedBase64Key, {
      blockSize: 128,
      keySize: 128,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    // console.log('Decrypted : ' + decrypted);
    // console.log('utf8 = ' + decrypted.toString(CryptoJS.enc.Utf8));
    return decrypted.toString(CryptoJS.enc.Utf8);
}
getKey(){
  return this.encKey.getSalt();
}
}
