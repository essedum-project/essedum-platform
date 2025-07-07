import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { encKey } from '../services/encKey';
@Injectable()
export class AdapterServices {
  organization = String(sessionStorage.getItem('organization'));
  constructor(
    private https: HttpClient,
    @Inject('dataSets') private dataUrl: string,
    private matSnackbar: MatSnackBar,
    private encKey: encKey
  ) {}

  private handleError(error: any) {
    const errMsg = error.error;
    console.error(errMsg);
    if (error.status === 401) {
      window.location.href = '/';
    }
    return throwError(errMsg);
  }

  getMlInstanceNamesByOrganization(): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
          '/mlinstances/getMlInstanceNamesByOrganization/' +
          sessionStorage.getItem('organization'),
        { observe: 'response' }
      )
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

  callPostApi(url, body, params?, headers?): Observable<any> {
    let path: string;
    if (url.startsWith('http')) {
      const urlObject = new URL(url);
      path = urlObject.pathname + urlObject.search;
    } else {
      path = url;
    }
    if (headers) delete headers['access-token'];
    return this.https
      .post(url, body, {
        headers: headers,
        params: params,
        observe: 'response',
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

  getAdapteByNameAndOrganization(name: string): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
          '/mladapters/getAdapteByNameAndOrganization/' +
          name +
          '/' +
          sessionStorage.getItem('organization'),
        { observe: 'response' }
      )
      .pipe(
        map((response) => {
          if (response?.body['apispec']) {
            let apispec = response.body['apispec'];
            apispec = apispec.replaceAll(
              '{org}',
              sessionStorage.getItem('organization')
            );
            response.body['apispec'] = apispec;
          }
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  getInstanceByNameAndOrganization(name: string): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
          '/mlinstances/getMlInstanceByNameAndOrganization/' +
          name +
          '/' +
          sessionStorage.getItem('organization'),
        { observe: 'response' }
      )
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
}
