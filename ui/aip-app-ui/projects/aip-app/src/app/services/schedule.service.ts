import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  messageService: any;
  baseUrl = "/api/aip"

  // private options = { headers: new HttpHeaders({ "Content-Type": "application/json" }) };

  constructor(private http: HttpClient) { }

  runSchedule(cname: any, pipelineType: any, date: any, time: any, zoneid: any, isNative: any, runNow: any, alias, thresholdtime: any, runtimeType:any, datasourceName: any, scheduleType: any): Observable<any> {
    var data = {
      "org": sessionStorage.getItem("organization").toString(),
      "params": "{}",
      "alias": alias,
      "myDate": date != undefined ? date.toString() : "",
      "myTime": time != undefined ? time.toString() : "",
      "timeZone": zoneid != undefined ? zoneid.toString() : "",
      "expression": null,
      "isNative": isNative.toString(),
      "thresholdTime": thresholdtime,
      "datasourceName": datasourceName,
      "scheduleType" : scheduleType
    }
    let offset = new Date().getTimezoneOffset();
    return this.http.post(this.baseUrl + '/schedule/scheduleJob/' + pipelineType + '/' + cname + '/' + runNow.toString() + '?offset=' + offset +"&runtimeType="+runtimeType, data, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response',
      responseType: 'text'
    }
    )
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(this.handleError));
  }

  runCronSchedule(cname: any, pipelineType: any, date: any, time: any, zoneid: any, exp: any, isNative: any, alias, thresholdtime:any,runtimeType:any,datasourceName: any, scheduleType:any): Observable<any> {
    try{
      var data = {
        "org": sessionStorage.getItem("organization").toString(),
        "params": "{}",
        "alias": alias,
        "myDate": date.toString(),
        "myTime": time.toString(),
        "timeZone": zoneid.toString(),
        "expression": exp.toString(),
        "isNative": isNative.toString(),
        "thresholdTime": thresholdtime,
        "datasourceName": datasourceName,
        "scheduleType": scheduleType
      }
      let offset = new Date().getTimezoneOffset();
      return this.http.post(this.baseUrl + '/schedule/cronScheduleJob/' + pipelineType + '/' + cname + '?offset=' + offset +"&runtimeType="+runtimeType, JSON.stringify(data), {
        headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
        observe: 'response',
        responseType: 'text'
      }
      )
        .pipe(map(response => response))
        .pipe(catchError(this.handleError));

    }
    catch(Exception){
    this.messageService.error("Some error occured", "Error")
    }
    
  }

  // updateSimpleSchedule(jobName: any, jobGroup: any, date: any, time: any, zoneid: any): Observable<any> {
  //   var data = {
  //     "jobName": jobName.toString(),
  //     "jobGroup": jobGroup.toString(),
  //     "date": date.toString(),
  //     "time": time.toString(),
  //     "timezone": zoneid.toString(),
  //     "expression": null
  //   }

  //   return this.http.post(this.baseUrl + '/schedule/updateSimpleJob', data, {
  //     headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
  //     observe: 'response'
  //   }
  //   )
  //     .pipe(map(response => response))
  //     .pipe(catchError(this.handleError));
  // }

  // updateCronSchedule(jobName: any, jobGroup: any, date: any, time: any, zoneid: any, exp: any): Observable<any> {
  //   var data = {
  //     "jobName": jobName.toString(),
  //     "jobGroup": jobGroup.toString(),
  //     "date": date.toString(),
  //     "time": time.toString(),
  //     "timezone": zoneid.toString(),
  //     "expression": exp.toString()
  //   }

  //   return this.http.post(this.baseUrl + '/schedule/updateCronJob', data, {
  //     headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
  //     observe: 'response'
  //   }
  //   )
  //     .pipe(map(response => response))
  //     .pipe(catchError(this.handleError));
  // }

  updateSchedule(jobName: any, jobGroup: any, date: any, time: any, zoneid: any, exp: any,thresholdtime:any, runtimeType:any, datasource:any): Observable<any> {
    var data = {
      "jobName": jobName.toString(),
      "jobGroup": jobGroup.toString(),
      "date": date.toString(),
      "time": time.toString(),
      "timezone": zoneid.toString(),
      "expression": exp.toString(),
      "thresholdTime": thresholdtime,
      "datasourceName": datasource
    }
    let offset = new Date().getTimezoneOffset();
    return this.http.post(this.baseUrl + '/schedule/updateJob?offset=' + offset +"&runtimeType="+runtimeType, data, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response',
      responseType: 'text'
    }
    )
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(this.handleError));
  }

  deleteJob(jobname: any, jobgroup: any) {
    return this.http.delete(this.baseUrl + '/schedule/scheduleJob/delete/' + jobname + '/' + jobgroup)
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }

  retryJob(name, jobtype, local,datasource?:any) {
    const org = sessionStorage.getItem("organization");
    let offset = new Date().getTimezoneOffset();
    return this.http
      .get(this.baseUrl + '/schedule/retryJob/' + name + '/' + org + '/' + jobtype + '?local=' + local +'?datasource=' +datasource+ '&offset=' + offset, { observe: 'response', responseType: 'text' })
      .pipe(map(response => response.body))
      .pipe(catchError(this.handleError));
  }

  isQuartzEnabled() {
    return this.http
      .get(this.baseUrl + '/schedule/quartz', { observe: 'response', responseType: 'text' })
      .pipe(map(response => response.body))
      .pipe(catchError(this.handleError));
  }

  pauseJob(jobname: any, jobgroup: any, flag: boolean) {
    return this.http.get(this.baseUrl + '/schedule/scheduleJob/pause/' + jobname + '/' + jobgroup + '/' + flag)
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }

  pauseAllJob(jobgroup: any, flag: boolean) {
    return this.http.get(this.baseUrl + '/schedule/scheduleJob/pauseAll/' + jobgroup + '/' + flag)
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }

  getScheduledJobs(searchText: string): Observable<any> {
    const org = sessionStorage.getItem("organization");
    let offset = new Date().getTimezoneOffset();
    if (searchText) {
      let params = new HttpParams();
      params = params.set('searchText', searchText);
      return this.http
      .get(this.baseUrl + '/schedule/scheduleJob/all/' + org + '?offset=' + offset, { observe: 'response', params: params })
      .pipe(map(response => response.body))
      .pipe(catchError(this.handleError));
    } else {
      return this.http
        .get(this.baseUrl + '/schedule/scheduleJob/all/' + org + '?offset=' + offset, { observe: 'response' })
        .pipe(map(response => response.body))
        .pipe(catchError(this.handleError));
    }
  }

  getScheduledJobsByName(name): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.http
      .get(this.baseUrl + '/schedule/scheduleJob/name/' + name + '/' + org, { observe: 'response' })
      .pipe(map(response => response.body))
      .pipe(catchError(this.handleError));
  }

  // getScheduledJobsLen(): Observable<any> {
  //   const org = sessionStorage.getItem("organization");
  //   return this.http
  //     .get(this.baseUrl + '/schedule/jobsLen/' + org, { observe: 'response' })
  //     .pipe(map(response => response.body))
  //     .pipe(catchError(this.handleError));
  // }

  stopPipeline(jobid): Observable<any> {
    return this.http.get(this.baseUrl + '/jobs/stopJob/' + jobid, { observe: 'response' })
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }

  stopChain(jobid): Observable<any> {
    return this.http.get(this.baseUrl + '/chainjob/stopJob/' + jobid, { observe: 'response' })
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }

  hitUrl(url, zoneid, exp, userdate, usertime, runnow, params): Observable<any> {
    const org = sessionStorage.getItem('organization');
    let data = {
      "zoneid": zoneid,
      "expression": exp,
      "date": userdate,
      "time": usertime,
      "org": org,
      "runnow": runnow,
      "reqBody":params
    }
    return this.http.post(this.baseUrl + url, data, { observe: 'response' })
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    const errMsg = error.error
      ? error.error
      : error.status
        ? `Status: ${error.status} - Text: ${error.statusText}`
        : 'Server error';
    console.error(errMsg); // log to console instead
    // if (error.status === 401) {
    //   window.location.href = '/';
    // }
    return throwError(errMsg);
  }
}
