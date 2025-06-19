import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Services } from "../services/service";

@Injectable()
export class EventsService {
  trigger: any;

  constructor(
    private https: HttpClient,
    private service: Services,
    @Inject('envi') private baseUrl: string
  ) {

  }

  /**
   * creates chain job
   */


  getEventBySearch(search, org, page?, size?): Observable<any> {
    let param
    if (size!=0) {
     param = new HttpParams().set('search', search).set('org', org).set('page', page).set('size', size);
    }
    else{
      let param = new HttpParams().set('search', search).set('org', org);
    }
    console.log(param)
    return this.https.get(this.baseUrl + '/event/all/search', {
      observe: 'response', params: param
    })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error);
      }));
  }

  getAllEventDetails(org): Observable<any> {
    return this.https.get(this.baseUrl + '/event/all', {
      observe: 'response', params: {
        org: org,
      }
    })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error);
      }));
  }

  countEvent(search): Observable<any> {
    return this.https.get(this.baseUrl + '/event/all/len', {
      observe: 'response', params: {
        org: sessionStorage.getItem("organization"),
        search: search
      }
    })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error);
      }));
  }

  getEventbyID(id: any): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https
      .get(this.baseUrl + '/event/id/' + id, { observe: 'response' })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error);
      }));
  }
  deleteEventbyId(id) {
    return this.https.delete(this.baseUrl + '/event/delete/id/' + id)
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }
  createEvent(Eventdetails: any): Observable<any> {
    Eventdetails.organization = sessionStorage.getItem("organization");
    return this.https.post(this.baseUrl + '/event/add', Eventdetails, { observe: 'response' })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error);
      }));
  }
  triggerEvent(Eventdetails: any, body, datasourceName, corelid?): Observable<any> {
    body = encodeURIComponent(body)
    return this.https.get(this.baseUrl + '/event/trigger/' + Eventdetails, {
      observe: 'response', responseType: 'text', params: {
        org: sessionStorage.getItem("organization"),
        corelid: corelid ? corelid : "",
        param: body != "null" ? body : "",
        datasourceName: datasourceName
      }
    })
      .pipe(map(response => {
        return response.body;

      }))
      .pipe(catchError(error => {
        return this.handleError(error);
      }));
  }

  triggerPostEvent(Eventdetails: any, body, datasourceName, corelid?): Observable<any> {

    return this.https.post(this.baseUrl + '/event/trigger/' + Eventdetails, body, {

      observe: 'response', responseType: 'text', params: {

        org: sessionStorage.getItem("organization"),
        corelid: corelid ? corelid : "",
        datasourceName: datasourceName
      }

    })

      .pipe(map(response => {


        return response.body;



      }))

      .pipe(catchError(error => {


        return this.handleError(error);

      }));

  }

  testEvent(Eventdetails: any): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https.get(this.baseUrl + '/event/test/' + Eventdetails + '/' + org, { observe: 'response', responseType: 'text' })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error);
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

  getEventByName(name): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https.get(this.baseUrl + '/event/name/' + name + '/' + org, {
      observe: 'response'
      // , params: {
      //   org: org,
      //   name: name
      // }
    })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error);
      }));
  }
}
