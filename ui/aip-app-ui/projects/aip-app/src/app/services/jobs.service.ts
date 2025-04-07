import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
// import { ChainJob, JSONContent } from './chainJob';
import { throwError } from 'rxjs';
import { Services } from './service';
import { ChainJob, JSONContent } from '../sharedModule/jobs/chainJob';

@Injectable()
export class JobsService {

  constructor(
    private https: HttpClient,
    private service: Services,
    @Inject('envi') private baseUrl: string
  ) {

  }

  /**
   * creates chain job
   */
  createChainJob(chainedJob: any): Observable<any> {
    chainedJob.org = sessionStorage.getItem("organization");
    return this.https.post(this.baseUrl + '/chain/save', chainedJob, { observe: 'response' })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  rescheduleChainJob(jobid, jobname, jobgroup, jsoncontent): Observable<any> {
    const org = sessionStorage.getItem("organization");
    let offset = new Date().getTimezoneOffset();
    return this.https.post(this.baseUrl + '/chainjob/update/' + jobid + '/' + jobname + '/' + jobgroup + '/' + org + '?offset=' + offset, jsoncontent, { observe: 'response' })
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }

  /**
   * Get a jobs by streaming service.
   */
  getJobsByStreamingService(name: any, page: any, size: any): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https
      .get(this.baseUrl + '/jobs/' + name + '/' + org, { params: { page: page, size: size }, observe: 'response' })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  getAzureJobs(uid: any, cname: any): Observable<any>{
    const org = sessionStorage.getItem("organization");
    let azureLogs={
      "userId": uid,
      "platform":"Azure",
      "experiment_name": cname
    }
    let url="https://ai-platform/cloudBaseUrl/training/get_training_details/"
    return this.https.post(url,azureLogs)
  }

  getJobsByAgents(name: any, page: any, size: any): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https
      .get(this.baseUrl + '/agentjobs/' + name + '/' + org, { params: { page: page, size: size }, observe: 'response' })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }
  getJobsByStreamingServiceLen(name: any): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https
      .get(this.baseUrl + '/jobs/streamingLen/' + name + '/' + org, { observe: 'response' })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  getAgentJobsByStreamingServiceLen(name: any): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https
      .get(this.baseUrl + '/agentjobs/streamingLen/' + name + '/' + org, { observe: 'response' })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }
  /*
    Get all jobs 
  */
  getJobs(page: any, size: any): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https
      .get(this.baseUrl + '/jobs/all/' + org, { params: { page: page, size: size }, observe: 'response' })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));

  }

  getJobsLen(): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https
      .get(this.baseUrl + '/jobs/jobsLen/' + org, { observe: 'response' })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  getCommonJobs(page: any, size: any, filtercolumn: string, filtervalue: any, filterdate: string, sortcolumn: string, direction: string): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https
      .get(this.baseUrl + '/jobs/common/' + org, {
        params: {
          page: page,
          size: size,
          filtercolumn: filtercolumn,
          filtervalue: filtervalue,
          filterdate: filterdate,
          sortcolumn: sortcolumn,
          direction: direction
        },
        observe: 'response'
      })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }
  downloadCsv(colsToDownload): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https
      .get(this.baseUrl + '/jobs/downloadCsv/' + org, {
        params: {
          colsToDownload: colsToDownload
        
        },
        responseType: 'text/csv' as 'json',
        observe: 'response'
      })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }
  

  getCommonJobsnew(page: any, size: any, filtercolumn: string, filtervalue: any, filterdate: string, sortcolumn: string, direction: string, searchValues): Observable<any> {
    const org = sessionStorage.getItem("organization");
    let searchParamsValue = null;
    if (searchValues && searchValues.length > 0)
      searchParamsValue = searchValues;
    else if (searchValues) {
      searchParamsValue = JSON.stringify(searchValues);
    }
    return this.https
      .get(this.baseUrl + '/jobs/common/' + org, {
        params: {
          page: page,
          size: size,
          filtercolumn: filtercolumn,
          filtervalue: filtervalue,
          filterdate: filterdate,
          sortcolumn: sortcolumn,
          direction: direction,
          searchParams: searchParamsValue
        },
        observe: 'response'
      })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }
  getCommonJobsLen(filtercolumn: string, filtervalue: any, filterdate: string): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https
      .get(this.baseUrl + '/jobs/common/jobsLen/' + org, {
        observe: 'response',
        params: {
          filtercolumn: filtercolumn,
          filtervalue: filtervalue,
          filterdate: filterdate
        }
      })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  hide(jobtype, id, flag): Observable<any> {
    return this.https
      .get(this.baseUrl + '/jobs/hide/' + jobtype + '/' + id + '/' + flag, { observe: 'response', responseType: 'text' })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  getHiddenLogs(): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https
      .get(this.baseUrl + '/jobs/hiddenlogs/' + org, { observe: 'response' })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  deleteChainJob(id) {
    return this.https.delete(this.baseUrl + '/chain/' + id)
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }

  getAllChainJobs(page, size): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https.get(this.baseUrl + '/chain/' + org, { params: { page: page.toString(), size: size.toString(), filter: 'filter' }, observe: 'response' })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  getChainJobsLen(): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https
      .get(this.baseUrl + '/chain/getById' + '/' + org, { observe: 'response' })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  getChainJobLen(name): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https.get(this.baseUrl + '/chainjob/jobsLen/' + name + '/' + org, { observe: 'response' }).pipe(map(response => {
      return response.body
    }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  getIndvLog(id): Observable<any> {
    return this.https.get(this.baseUrl + '/chainjob/console/' + id, { observe: 'response' }).pipe(map(response => {
      return <any>response.body
    }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  getByCorelationId(id): Observable<any> {
    return this.https.get(this.baseUrl + '/jobs/corelid/' + id, { observe: 'response' }).pipe(map(response => {
      return <any>response.body
    }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  getLogList(name, page, size): Observable<any[]> {
    const org = sessionStorage.getItem("organization");
    return this.https.get(this.baseUrl + '/chainjob/fetch/' + name + '/' + org, { params: { page: page, size: size }, observe: 'response' }).pipe(map(response => {
      return <any>response.body
    }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  getChainJobByName(name): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https.get(this.baseUrl + '/chain/name/' + org, { params: { jobName: name }, observe: 'response' }).pipe(map(response => {
      return new ChainJob(response.body)
    }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  runChainedJob(jobname, canvasElements): Observable<string> {
    const org = sessionStorage.getItem("organization");
    return this.https.post(this.baseUrl + '/chainjob/run/' + jobname + '/' + org, canvasElements, { responseType: 'text' })
      .pipe(map(response => { return response.toString(); }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  runChainedJob3(jobname, canvasElements): Observable<string> {
    const org = sessionStorage.getItem("organization");
    let offset = new Date().getTimezoneOffset();
    return this.https.post(this.baseUrl + '/chainjob/run/tree/' + jobname + '/' + org+'/false?offset=' + offset, canvasElements, { responseType: 'text' })
      .pipe(map(response => { return response.toString(); }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  getChainByName(name) {
    const org = sessionStorage.getItem("organization");
    return this.https.get(this.baseUrl + '/chain/name/' + org, { params: { jobName: name }, observe: 'response' }).pipe(map(response => {
      return new ChainJob(response.body)
    }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  runChainedJob2(datasourceName,jobname, treedata, params, runNow: boolean): Observable<string> {
    if(datasourceName===''){
      datasourceName='local';
    }
    var json = {
      "elements": treedata,
      "params": params
    }
    const org = sessionStorage.getItem("organization");
    let offset = new Date().getTimezoneOffset();
    return this.https.post(this.baseUrl + '/chainjob/run/tree/' + jobname + '/' + org + '/' + runNow + '?offset=' + offset, json, { responseType: 'text' })
      .pipe(map(response => { return response.toString(); }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  updateChainedJob(jobname, canvasElements) {
    const org = sessionStorage.getItem("organization");
    return this.https.post(this.baseUrl + '/chain/update/' + jobname + '/' + org, canvasElements, { observe: 'response' })
      .pipe(map(response => { return response }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  updateChainedJob2(jobname, jsonContent: JSONContent, treedata, params) {
    jsonContent.element.elements = treedata;
    jsonContent.element.params = params;
    const org = sessionStorage.getItem("organization");
    let offset = new Date().getTimezoneOffset();
    return this.https.post(this.baseUrl + '/chain/update/tree/' + jobname + '/' + org + '?offset=' + offset, jsonContent, { observe: 'response' })
      .pipe(map(response => { return response }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  getAllInternalJobs(): Observable<any> {
    return this.https.get(this.baseUrl + '/internaljob/all', { observe: 'response' }).pipe(map(response => {
      return <any>response.body
    }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  getAllAPIEvents(org): Observable<any> {
    return this.https.get(this.baseUrl + '/event/apiClasses', {
      observe: 'response',
      params: { org: org }
    }).pipe(map(response => {
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
  getChainsJobsByCorelationId(id): Observable<any> {
    return this.https.get(this.baseUrl + '/chainjob/corelid/' + id, { observe: 'response' }).pipe(map(response => {
      return <any>response.body
    }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }
  getImageByPath(path: any){

    return this.https
      .get(this.baseUrl + '/jobs/image', { params: {path:path},responseType: 'blob'  })
    }
    
  getSingleGroupByOrgAndEntity(entity: any): Observable<any> {
    // this.loader.show();
    return this.https.get(this.baseUrl + '/groups/pipeline/' + entity + '/' + sessionStorage.getItem("organization"), { observe: 'response' })
      .pipe(map(response => {
        // this.loader.hide();
        return response.body;
      }))
      .pipe(catchError(err => {
        // this.loader.hide();
        return this.handleError(err);
      }));
  }

  getSingleGroupByOrgAndEntityForAgent(entity: any): Observable<any> {
    // this.loader.show();
    return this.https.get(this.baseUrl + '/groups/agent/' + entity + '/' + sessionStorage.getItem("organization"), { observe: 'response' })
    // return this.https.get(this.baseUrl + '/groups/search/' + entityType + '/' + entity , 
    // { observe: 'response',
    // params: {org:sessionStorage.getItem("organization"), page : page, size : size} })
      .pipe(map(response => {
        // this.loader.hide();
        return response.body;
      }))
      .pipe(catchError(err => {
        // this.loader.hide();
        return this.handleError(err);
      }));
  }
  pushBreadCrumb(item : any){
    try{
    
      let stack = [];
      if(sessionStorage.getItem("icip.breadcrumb")){
        stack  = JSON.parse(sessionStorage.getItem("icip.breadcrumb"))
      }
      if(!stack.includes(item))
        stack.push(item)
      sessionStorage.setItem("icip.breadcrumb",JSON.stringify(stack))
      return item;
    }
    catch(Exception){
    this.service.error("Some error occured", "Error")
    }

  }

  getRemoteJobs(url:string): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https
      .get(this.baseUrl + '/jobs/remote/all/' + org, {
        params: {
          url:url
        },
        observe: 'response'
      })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  getRemoteJobLog(url:string,id:string): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https
      .get(this.baseUrl + '/jobs/remote/log/' + org, {
        params: {
          jobId:id,
          url:url
        },
        observe: 'response'
      })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  stopRemoteJob(url:string,id:string): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https
      .get(this.baseUrl + '/jobs/remote/stopjob/' + org, {
        params: {
          jobId:id,
          url:url
        },
        observe: 'response'
      })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }
}
