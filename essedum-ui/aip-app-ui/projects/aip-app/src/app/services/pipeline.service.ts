import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChainJob } from '../DTO/chainJob';
@Injectable()
export class PipelineService {
  constructor(
    private https: HttpClient,
    @Inject('dataSets') private dataUrl: string,
    private matSnackbar: MatSnackBar
  ) { }
   //getPipelines
   getPipelines(): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('cloud_provider', 'internal')
      .set('filter', 'abc')
      .set('orderBy', 'abc')
      .set('project', session);
    return this.https
      .get(this.dataUrl + '/service/v1/pipelines/training/list',{
        observe: 'response',
        params: param,
      })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getPipeline(cid: any) {
    return this.https
      .get(this.dataUrl + '/streamingServices/' + cid, { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  getPipelineByName(name: any) {
    let session: any = sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl + '/streamingServices/' + name+"/"+session, { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  messageService(resp: any,msg?: any){
    console.log(resp)
    if(resp.status == 200){
    if(resp.body.status === "FAILURE" || (resp.body[0] && resp.body[0].status === "FAILURE")){
      let failmsg = ""
      if(resp.body.status === "FAILURE")
        failmsg = resp.body.details[0].message
      else if(resp.body[0] && resp.body[0].status === "FAILURE")
        failmsg = resp.body[0].message
      else failmsg = "FAILED"
      let message = {
       message : failmsg,
       button : false,
       type : "error",
       successButton : "Ok",
       errorButton : "Cancel"
       }
       this.matSnackbar.open(message.message, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass:
            message.type === 'error'
              ? 'mat-snack-bar-error'
              : 'mat-snack-bar-success',
        });
   }
   else{
     let message = {
       message : msg?msg:resp.body.status,
       button : false,
       type : "success",
       successButton : "Ok",
       errorButton : "Cancel"
       }
       this.matSnackbar.open(message.message, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass:
            message.type === 'error'
              ? 'mat-snack-bar-error'
              : 'mat-snack-bar-success',
        });
 
   }
  }else{
    let message = {
      message : resp.error?resp.error:resp,
      button : false,
      type : "error",
      successButton : "Ok",
      errorButton : "Cancel"
      }
      this.matSnackbar.open(message.message, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass:
            message.type === 'error'
              ? 'mat-snack-bar-error'
              : 'mat-snack-bar-success',
        });

  }
  }
  listJsonByType(type: string): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl +'/plugin/all/' + type + '/' + org, { observe: 'response' ,responseType: 'text'})
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getAllChainJobs(org, filter:any): Observable<any> {
    // const org = sessionStorage.getItem("organization");
    let param: HttpParams = new HttpParams();
    param = param.set('filter', filter)
    return this.https.get(this.dataUrl + '/chain/' + org, { params :param,observe: 'response' })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  getChainByName(name) {
    const org = sessionStorage.getItem("organization");
    return this.https.get(this.dataUrl + '/chain/name/' + org, { params: { jobName: name }, observe: 'response' }).pipe(map(response => {
      return new ChainJob(response.body)
    }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  createChainJob(chainedJob: any): Observable<any> {
    chainedJob.org = sessionStorage.getItem("organization");
    return this.https.post(this.dataUrl + '/chain/save', chainedJob, { observe: 'response' })
      .pipe(map(response => {
        return response.body
      }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  updateChainedJob(jobname, canvasElements) {
    const org = sessionStorage.getItem("organization");
    return this.https.post(this.dataUrl + '/chain/update/' + jobname + '/' + org, canvasElements, { observe: 'response' })
      .pipe(map(response => { return response }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  updateChainByID(id:any, jobname:any, jobdescription){
    const org = sessionStorage.getItem("organization");
    let param = new HttpParams()
    .set('jobName', jobname)
    .set('jobDesc' ,jobdescription);
    let body={}

    return this.https.post(this.dataUrl + '/chain/editNameAndDesc/' + id + '/' + org, body,
      {   
      params: param, 
      observe: 'response' })
      .pipe(map(response => { return response }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
  }

  deleteChain(cid: any) {
    return this.https
      .delete(this.dataUrl + '/chain/' + cid)
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

  fetchJobRunTypes(): Observable<string> {

    const org = sessionStorage.getItem("organization");
    return this.https.get(this.dataUrl+'/jobs/runtime/types/'+org).pipe((resp: any) => resp);
  }

  runChainedJob(jobname, canvasElements): Observable<string> {
    const org = sessionStorage.getItem("organization");
    let offset = new Date().getTimezoneOffset();
    return this.https.post(this.dataUrl + '/chainjob/run/tree/' + jobname + '/' + org+'/true?offset=' + offset, canvasElements, { responseType: 'text' })
      .pipe(map(response => { return response.toString(); }))
      .pipe(catchError(error => {
        return this.handleError(error)
      }));
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
}
