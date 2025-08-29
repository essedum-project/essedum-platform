import { Injectable, Inject, SkipSelf } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, map, catchError, throwError, switchMap } from "rxjs";
import { PageResponse } from "../support/paging";
import { PageRequestByExample } from "../support/page-request";
import { Users } from "../models/users";
import { CustomErrorHandlerService } from "../shared-modules/custom-error-handler/custom-error-handler.service";
import { MessageService } from "./message.service";
import { encKey } from '../models/encKey'

@Injectable()
export class UsersService {

  constructor(
    private https: HttpClient,
    private messageService: MessageService,
    private customErrorHandlerService: CustomErrorHandlerService,
    private encKey: encKey
  ) {

  }

  authenticate(formdata: any): Observable<any> {
    let body;
    try {
      body = JSON.stringify(formdata);

    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post("/api/authenticate", body, {

        observe: "response",
      })
      .pipe(
        map((response) => {
          if (response.status == 200) {
            localStorage.setItem("jwtToken", response.body["access_token"]);
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
      .post("/api/userss", copy, { observe: "response" })
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

    let req = new PageRequestByExample(id, event);
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

    return this.https
      .get("/api/userss/" + id, { observe: "response", headers: headers })
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

    } catch (e: any) {
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

    } catch (e: any) {
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

    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }

    return this.https
      .put("/api/userss", body, {
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
    } catch (e: any) {
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

    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
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

    return this.https
      .get("/api/userss/page", {
        observe: "response", headers: headers,
        responseType: "text"
      })
      .pipe(
        switchMap(async (response) => {
          result = JSON.parse(await this.decryptUsingAES256(response.body, this.getKey()));
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
    return this.https
      .get(`/api/users/page?page=${event.page}&size=${event.size}`, {
        observe: "response", headers: headers,
        responseType: "text"
      })
      .pipe(
        switchMap(async (response) => {
          let key = this.getKey();

          result = JSON.parse(await this.decryptUsingAES256(response.body, key));
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

  findByProjectIdOrPortfolioId(users: Users, event: any, flag: any, id: any): Observable<PageResponse<Users>> {
    let req = new PageRequestByExample(users, event);
    let body;
    let headerValue;
    let result;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');

    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    let headers = new HttpHeaders();
    headers = headers.append('example', headerValue);
    return this.https
      .get(`/api/users/pagination/${flag}/${id}/page?page=${event.page}&size=${event.size}`, {
        observe: "response", headers: headers,

        responseType: "text"
      })
      .pipe(
        switchMap(async (response) => {
          let key = this.getKey();
          result = JSON.parse(await this.decryptUsingAES256(response.body, key));
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

  findAllByProjectIdOrPortfolioId(users: Users, event: any, flag: any, id: any): Observable<PageResponse<Users>> {
    let req = new PageRequestByExample(users, event);
    let body;
    let headerValue;
    let result;
    let pages = 1;
    try {
      body = JSON.stringify(req);
      headerValue = Buffer.from(body, 'utf8').toString('base64');

    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    let headers = new HttpHeaders();
    headers = headers.append('example', headerValue);
    return this.https
      .get(`/api/users/filter/${flag}/${id}/page`, {
        observe: "response", headers: headers,

        responseType: "text"
      })
      .pipe(
        switchMap(async (response) => {
          let key = this.getKey();

          result = JSON.parse(await this.decryptUsingAES256(response.body, key));
          let pr: any = result;
          return new PageResponse<Users>(pages, result.length, Users.toArray(result));
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

    } catch (e: any) {
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

  searchInProjectOrPortfolio(users: Users, event: any, flag: any, id: any): Observable<PageResponse<Users>> {

    let req = new PageRequestByExample(users, event);
    let body;
    let result;
    try {
      body = JSON.stringify(req);

    } catch (e: any) {
      console.error("JSON.stringify error - ", e.message);
    }
    return this.https
      .post(`/api/users/search/${flag}/${id}/page?page=${event.page}&size=${event.size}`, body,
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
    } catch (e: any) {
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
    // if (error.status === 401) {
    //   window.location.href = "/";
    // }
    return throwError(errMsg);
  }

  private convert(users: Users): Users {
    const copy: Users = Object.assign({}, users);
    return copy;
  }

  async encrypt(plaintext, password) {

    const encryptedData = await this.encryptgcm(plaintext, password);
    return JSON.stringify(encryptedData);

  }

  async decryptUsingAES256(cipherResponse, password) {


    let cipherJson = JSON.parse(cipherResponse);
    let output = await this.decryptgcm(cipherJson["ciphertext"], cipherJson["iv"], password);
    return output;

  }

  async decryptgcm(ciphertext, iv, password) {
    // Decode the ciphertext and IV from Base64 strings
    const decodedCiphertext = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const decodedIV = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

    // Prepare the decryption parameters
    const algorithm = {
      name: 'AES-GCM',
      iv: decodedIV
    };

    // Import the key from password
    const importedKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      algorithm,
      false,
      ['decrypt']
    )

    const decryptedData = await crypto.subtle.decrypt(algorithm, importedKey, decodedCiphertext);
    const decryptedText = new TextDecoder().decode(decryptedData);

    return decryptedText;

  }

  async encryptgcm(plaintext, password) {
    // Generate random 12-byte IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Prepare the encryption parameters
    const algorithm = {
      name: 'AES-GCM',
      iv: iv
    };

    // Import the key from password
    const importedKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      algorithm,
      false,
      ['encrypt']
    );

    // Encrypt the plaintext
    const encodedText = new TextEncoder().encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt(algorithm, importedKey, encodedText);


    const ciphertextArray = Array.from(new Uint8Array(ciphertext));
    // Convert Uint8Array to regular array 
    const encodedCiphertext = btoa(String.fromCharCode.apply(null, ciphertextArray));
    // const encodedIV = btoa(Array.from(iv));
    // const encodedIV = btoa(String.fromCharCode.apply(null, iv));

    const encodedIV = btoa(Array.from(iv).map((byte) => String.fromCharCode(byte)).join(''));

    const encryptedJSON = { ciphertext: encodedCiphertext, iv: encodedIV }

    return encryptedJSON;
  }

  getKey() {
    return this.encKey.getSalt();
  }
}
