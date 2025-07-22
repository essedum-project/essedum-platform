import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Relationship } from './relationship';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SchemaRelationshipService {
  private readonly apiPath = '/relationship';

  constructor(
    private readonly http: HttpClient,
    @Inject('envi') private readonly baseUrl: string
  ) {}

  getAllRelationships(org: string): Observable<Relationship[]> {
    return this.http
      .get<Relationship[]>(`${this.baseUrl}${this.apiPath}/${org}`)
      .pipe(catchError(this.handleError));
  }

  getRelationshipById(rid: string | number): Observable<Relationship> {
    return this.http
      .get<Relationship>(`${this.baseUrl}${this.apiPath}/id/${rid}`)
      .pipe(
        map((response) => new Relationship(response)),
        catchError(this.handleError)
      );
  }

  create(rel: Partial<Relationship>): Observable<Relationship> {
    const relationshipData = this.addOrganization(rel);
    return this.http
      .post<Relationship>(
        `${this.baseUrl}${this.apiPath}/add`,
        relationshipData
      )
      .pipe(
        map((response) => new Relationship(response)),
        catchError(this.handleError)
      );
  }

  update(rel: Relationship): Observable<Relationship> {
    const relationshipData = this.addOrganization(rel);
    return this.http
      .put<Relationship>(
        `${this.baseUrl}${this.apiPath}/update`,
        relationshipData
      )
      .pipe(catchError(this.handleError));
  }

  delete(rid: string | number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}${this.apiPath}/delete/${rid}`)
      .pipe(catchError(this.handleError));
  }

  private addOrganization(rel: Partial<Relationship>): Partial<Relationship> {
    return {
      ...rel,
      organization: sessionStorage.getItem('organization') || '',
    };
  }

  private readonly handleError = (
    error: HttpErrorResponse
  ): Observable<never> => {
    let errorMessage: string;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage =
        error.error?.message ||
        `Server error: ${error.status} - ${error.statusText}`;
    }

    console.error('SchemaRelationshipService Error:', errorMessage);

    // Handle unauthorized access
    if (error.status === 401) {
      window.location.href = '/';
    }

    return throwError(() => new Error(errorMessage));
  };
}
