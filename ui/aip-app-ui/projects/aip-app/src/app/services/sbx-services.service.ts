import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Team } from '../models/teamSolution';
import { Users } from '../models/users';
@Injectable()
export class SbxServicesService {

  constructor(
    private https: HttpClient,
    @Inject('dataSets') private dataUrl: string,
    @Inject('envi') private baseUrl: string,
    @Inject('sbx') private sbx: string,

  ) { }
  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    const errMsg = error.error;
    console.error(errMsg); // log to console instead
    if (error.status === 401) {
      window.location.href = '/';
    }
    return throwError(errMsg);
  }
  getMembers(teamId): Observable<any> {
    return this.https
      .get(this.sbx + '/team/getMembers/' + teamId, { observe: 'response' })
      .pipe(
        map((response) => {
          return <any>response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  getById(id): Observable<Team> {
    return this.https
      .get(this.sbx + '/team/teamDetails/' + id, { observe: 'response' })
      .pipe(
        map((response) => {
          return <Team>response.body;
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
}
