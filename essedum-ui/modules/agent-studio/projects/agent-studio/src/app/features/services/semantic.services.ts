import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map} from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { Observable, throwError} from 'rxjs';

@Injectable()
export class SemanticService {

  constructor(
    private https: HttpClient,
    @Inject('envi') private baseUrl: string
  ) {}

  getConfigByName(name): Observable<any> {
    return this.https.get(this.baseUrl + '/semantic/configByName/' + name, {
      observe: 'response'
    })
      .pipe(map(response => { return response.body }))
      .pipe(catchError(error => { return this.handleError(error) }));
  }

  getAllTopicsbyOrg(): Observable<any> {
    return this.https.get(this.baseUrl + '/mltopics/'+ sessionStorage.getItem("organization"), {
      observe: 'response'
    })
      .pipe(map(response => { return response.body }))
      .pipe(catchError(error => { return this.handleError(error) }));
  }

  getAllTopics(): Observable<any>{
    return this.https
    .get(this.baseUrl + '/mltopics/list/activeMltopicsByOrg/'+ sessionStorage.getItem("organization"), {
      observe: 'response'
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
  getIngestedTopicsByDatasetnameAndOrg(dname): Observable<any>{
    return this.https
    .get(this.baseUrl + '/mldatasettopics/'+dname +'/'+sessionStorage.getItem("organization"), {
      observe: 'response'
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

  addOrUpdateTopic(mlTopic: any): Observable<any> {
    return this.https.post(this.baseUrl + '/mltopics/addOrUpdateTopic', mlTopic, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response'
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  addOrUpdateTopicFAQs(mlTopicFAQs: any): Observable<any> {
    return this.https.post(this.baseUrl + '/mltopics/addOrUpdateTopicSuggestedQueries', mlTopicFAQs, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response'
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  deleteTopicById(id) : Observable<any>{
    return this.https
      .delete(`${this.baseUrl}/mltopics/deleteTopicById/${id}`, {
        observe: 'response'
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
  filterDatasetsByTopics(topics:any){
    return this.https.post(this.baseUrl + '/mldatasettopics/getDatasetsByTopics/' + sessionStorage.getItem("organization"),topics, { observe: 'response', })
    .pipe(map(response => {
      return response.body;
    }))
    .pipe(catchError(err => {
      return this.handleError(err);
    }));
  }

  getTopicByTopicNameAndOrg(topicName){
    return this.https.get(this.baseUrl + '/mltopics/'+topicName+'/'+sessionStorage.getItem("organization"), {
      observe: 'response'
    })
      .pipe(map(response => { return response.body }))
      .pipe(catchError(error => { return this.handleError(error) }));
  }
}

