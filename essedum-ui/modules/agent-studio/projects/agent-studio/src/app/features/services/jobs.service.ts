import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class JobsService {

  constructor(
    private https: HttpClient,
    @Inject('envi') private baseUrl: string
  ) {

  }



  getByCorelationId(id): Observable<any> {
    return this.https.get(this.baseUrl + '/jobs/corelid/' + id, { observe: 'response' }).pipe(map(response => {
      return <any>response.body
    }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

   private handleError(error: any) {
    const errMsg = error.error
      ? error.error
      : error.status
        ? `Status: ${error.status} - Text: ${error.statusText}`
        : 'Server error';
    if (error.status === 401) {
      window.location.href = '/';
    }
    return throwError(errMsg);
  }


}
