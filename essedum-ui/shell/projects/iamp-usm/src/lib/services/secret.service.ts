import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SecretService {

  dataUrl = "/api/secrets"
  constructor(private https: HttpClient) { }


  deleteKey(key: any) {
    let session: any = sessionStorage.getItem('organization');
    let params = new HttpParams()
      .set('project', session)
      .set('key', key)
    return this.https
      .delete(this.dataUrl + "/delete",
        {
          observe: 'response',
          params: params,
          responseType: 'text'
        }
      ).pipe(
        map((response) => {
          return response;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );

  }
  getPasscode(key: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .set('key', key);

    return this.https
      .get(this.dataUrl + '/resolve', {
        observe: 'response',
        params: param,
        responseType: 'text'
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  getSecreteCount(): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
    // .set('key', key);

    return this.https
      .get(this.dataUrl + '/count', {
        observe: 'response',
        params: param
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  getSecreteCountBySearch(param: HttpParams): Observable<any> {
    let session: any = sessionStorage.getItem("organization");
    param = param.append("project", session);
    return this.https
      .get(this.dataUrl + "/countBySearch", {
        observe: "response",
        params: param,
      })
      .pipe(
        map((response) => response.body),
        catchError((err) => this.handleError(err))
      );
  }

  getSecretsList(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/list', {
        observe: 'response',
        params: param,
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  createKey(key: any, value: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .set('key', key)
      .set('value', value);
    let body = {};
    return this.https
      .put(this.dataUrl + '/add', body, {
        observe: 'response',
        params: param,
        responseType: 'text'
      })
      .pipe(
        map((response) => {
          return response;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );


  }
  updateKey(key: any, value: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .set('key', key)
      .set('value', value);
    let body = []
    return this.https
      .put(this.dataUrl + '/update', body, {
        observe: 'response',
        params: param,
        responseType: 'text'
      })
      .pipe(
        map((response) => {
          return response;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    const errMsg = error.error;
    console.log(errMsg); // log to console instead
    if (error.status === 401) {
      window.location.href = '/';
    }
    return throwError(errMsg);
  }
}
