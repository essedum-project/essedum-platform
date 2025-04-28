import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, NgZone } from '@angular/core';
import { Observable, from, throwError, of as observableof } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MessageBarComponent } from 'leds-lib';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashConstant, encKey } from 'com-lib-util';

@Injectable()
export class JobServices {
  datasetsFetched: any;

  private jwt: any;
  searchValues: any;
  paginationValues: any;
  private dataUrl: string = '/api/aip';

  constructor(
    private https: HttpClient,
    private matSnackbar: MatSnackBar,
  ) { }

  fetchInternalJobLenByname(name: string, project: string): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
        '/internaljob/jobname/len/' +
        name +
        '/' +
        project
      )
      .pipe(map((response) => response))
      .pipe(catchError(this.handleError));
  }

  message(msg: any, msgtype: any = 'success') {
    let message = {
      message: msg,
      button: false,
      type: msgtype,
      successButton: 'Ok',
      errorButton: 'Cancel',
    };
    this.matSnackbar.openFromComponent(MessageBarComponent, {
      data: message,
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: '',
    });
  }

  fetchInternalJobByName(name: string, page, rows): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
        '/jobs/' +
        name +
        '/' +
        localStorage.getItem('organization'),
        { params: { page: page, size: rows } }
      )

      .pipe(map((response) => response))

      .pipe(catchError(this.handleError));
  }

  fetchInternalJobByName2(name: string, page, rows, project): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
        '/internaljob/jobname/' +
        name +
        '/' +
        project,
        { params: { page: page, size: rows } }
      )
      .pipe(map((response) => response))
      .pipe(catchError(this.handleError));
  }
  fetchSparkJob(
    jobId: string,
    linenumber: Number,
    runtime: string,
    offset: Number,
    status,
    read
  ): Observable<any> {
    const org = sessionStorage.getItem('organization');
    runtime = runtime.split('-')[0].toLowerCase();
    if (
      runtime == 'local' ||
      runtime == 'aicloud' ||
      runtime == 'remote' ||
      runtime == 'emr' ||
      runtime == 'sagemaker'
    ) {
      return this.https
        .get(
          this.dataUrl +
          '/jobs/console/' +
          jobId +
          '?offset=' +
          offset +
          '&org=' +
          org +
          '&lineno=' +
          linenumber +
          '&status=' +
          status +
          '&readconsole=' +
          read
        )
        .pipe(map((response) => response))
        .pipe(catchError(this.handleError));
    } else {
      // if (jobType.toUpperCase() === 'DRAGANDDROP' || jobType.toUpperCase() === 'SCALA' || jobType.toUpperCase() === 'SPARK') {
      return this.https
        .get(this.dataUrl + '/service/v1/jobs/spark/' + jobId)
        .pipe(map((response) => response))
        .pipe(catchError(this.handleError));
      // } else {
      //   return this.https.get(this.baseUrl + '/jobs/' + jobId)
      //     .pipe(map(response => response))
      //     .pipe(catchError(this.handleError));
      // }
    }
  }
  fetchInternalJob(
    jobId: string,
    linenumber: Number,
    offset: Number,
    status,
    project:string
  ): Observable<any> {
    // const org = sessionStorage.getItem('organization');
    const org = project;
    return this.https
      .get(
        this.dataUrl +
        '/service/v1/internaljob/console/' +
        jobId +
        '?offset=' +
        offset +
        '&org=' +
        org +
        '&lineno=' +
        linenumber +
        '&status=' +
        status
      )
      .pipe(map((response) => response))
      .pipe(catchError(this.handleError));
  }

  stopJob(jobid): Observable<any> {
    return this.https
      .get('/api/stopJob/' + jobid, {
        observe: 'response',
      })
      .pipe(map((response) => response))
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    const errMsg = error.error;
    console.error(errMsg); // log to console instead
    if (error.status === 401) {
      window.location.href = '/';
    }
    return throwError(errMsg);
  }

  getJobsByStreamingServiceLen(name: any): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl + '/service/v1/jobs/streamingLen/' + name + '/' + org, {
        observe: 'response',
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  fetchAgentJob(
    jobId: string,
    linenumber: Number,
    offset: Number,
    status,
    read
  ): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(
        this.dataUrl +
        '/service/v1/agentjobs/console/' +
        jobId +
        '?offset=' +
        offset +
        '&org=' +
        org +
        '&lineno=' +
        linenumber +
        '&status=' +
        status +
        '&readconsole=' +
        read
      )
      .pipe(map((response) => response))
      .pipe(catchError(this.handleError));
  }

  downloadPipelineLog(id): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/file/download/log/pipeline', {
        params: { id: id },
        responseType: 'blob',
      })
      .pipe((resp: any) => resp);
  }
}