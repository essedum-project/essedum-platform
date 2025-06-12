import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Relationship } from './relationship';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SchemaRelationshipService {
  constructor(
    private https: HttpClient,
    @Inject('envi') private baseUrl: string
  ) {}

  getAllRelationships(org): Observable<any> {
    return this.https
      .get(this.baseUrl + '/relationship/' + org)
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

  getRelationshipById(rid: any): Observable<any> {
    return this.https
      .get(this.baseUrl + '/relationship/id/' + rid, { observe: 'response' })
      .pipe(
        map((response) => {
          return new Relationship(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  create(rel: any): Observable<Relationship> {
    const copy = this.convert(rel);
    return this.https
      .post(this.baseUrl + '/relationship/add', copy, { observe: 'response' })
      .pipe(
        map((res) => {
          return new Relationship(res.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  update(rel: any): Observable<any> {
    const copy = this.convert(rel);
    return this.https
      .put(this.baseUrl + '/relationship/update', rel, { observe: 'response' })
      .pipe(
        map((res) => {
          return res.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  deleteR(rid: any) {
    return this.https
      .delete(this.baseUrl + '/relationship/delete/' + rid)
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

  private convert(rel: Relationship): Relationship {
    const copy: Relationship = Object.assign({}, rel, {
      organization: sessionStorage.getItem('organization'),
    });
    return copy;
  }

  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    const errMsg = error.error
      ? error.error
      : error.status
      ? `Status: ${error.status} - Text: ${error.statusText}`
      : 'Server error';
    console.error(errMsg); // log to console instead
    if (error.status === 401) {
      window.location.href = '/';
    }
    return throwError(errMsg);
  }
}
