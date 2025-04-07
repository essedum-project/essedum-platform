//
//  @ 2018 Infosys Limited, Bangalore, India. All Rights Reserved.
//  Version: 1.0
//  Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
//  this Program is protected by copyright laws, international treaties and  other pending or existing intellectual property
//  rights in India, the United States, and other countries. Except as expressly permitted, any unauthorized reproduction, storage,
//  transmission in any form or by any means(including without limitation electronic, mechanical, printing, photocopying,
//  recording, or otherwise), or any distribution of this program, or any portion of it, may result in severe civil and
//  criminal penalties, and will be prosecuted to the maximum extent possible under the law.
//

import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { MessageService } from '../../sharedModule/service/message.service';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class PipelinesummaryService {

  // private jwt: any;
  // private options = new RequestOptions({
  //   headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  // });

  constructor(private https: HttpClient, @Inject('envi') private baseUrl: string) { }


  startById(id: any): Observable<String> {
    return this.https.get(this.baseUrl + '/pipeline/start/' + id)
      .pipe(map(response => response + ''))
      .pipe(catchError(this.handleError));
  }

  stopById(id: any): Observable<String> {
    return this.https.get(this.baseUrl + '/pipeline/stop/' + id)
      .pipe(map(response => response + ''))
      .pipe(catchError(this.handleError));
  }

  runIcmmPipeline(payload : any): Observable<any>{
    let url="http://give-url:8102/processing/createtemplate/";
    return this.https.post(url,payload);
  }

  runAzurePipeline(uid: any, pipelineType: any, cname: any , newCanvas : any): Observable<any>{
    const org = sessionStorage.getItem("organization");
    let url="https://ai-platform/cloudBaseUrl/pipeline/pipeline_training/"
    return this.https.post(url,newCanvas)
  }

  runBatchConfigAzurePipeline(uid: any, pipelineType: any, cname: any , newCanvas : any): Observable<any>{
    let url="http://give-url:9090/batch/batch_inferencing/"
    return this.https.post(url,newCanvas)
  }

  runIecpPipeline(newCanvas : any): Observable<any> {
    const org = sessionStorage.getItem("organization");
    let url="https://ai-platform/cloudBaseUrl/pipeline/pipeline_training/ "
    return this.https.post(url,newCanvas)
  }

  runMlFlowPipeline(newCanvas : any): Observable<any> {
    const org = sessionStorage.getItem("organization");
    let url="https://ai-platform/cloudBaseUrl/pipeline/pipeline_training/"
    return this.https.post(url,newCanvas)
  }

  runPipeline(alias, cname: any, pipelineType: any,isLocal?: any,datasource?:any,params?: any): Observable<any> {
    const org = sessionStorage.getItem("organization");
    if (isLocal == undefined || isLocal == null || isLocal == "") {
      isLocal = "true";
    }
    if (params == undefined || params == null || params == "") {
      params = "{}";
    }
    let offset = new Date().getTimezoneOffset();
    return this.https.get(this.baseUrl + '/pipeline/run/' + pipelineType + '/' + cname + '/' + org + '/' + isLocal + '?offset=' + offset , { params: { param: params, alias: alias,datasource :datasource }, responseType: 'text' })


      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }

  submitAgentJob(cname: any, pipelineType: any): Observable<any> {
    const org = sessionStorage.getItem("organization");
    let offset = new Date().getTimezoneOffset();
    return this.https.get(this.baseUrl + '/pipeline/runAgent/' + pipelineType + '/' + cname + '/' + org + '?offset=' + offset, { responseType: 'text' })
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }

  fetchSparkJob(jobId: string, linenumber: Number, runtime: string, offset: Number, status, read): Observable<any> {
    const org = sessionStorage.getItem("organization");
    runtime = runtime.split('-')[0].toLowerCase();
    if (runtime == "local" || runtime=="aicloud"  || runtime=="remote" || runtime=="emr" || runtime=="sagemaker") {
      return this.https.get(this.baseUrl + '/jobs/console/' + jobId + "?offset=" + offset + "&org=" + org + "&lineno=" + linenumber + "&status=" + status + "&readconsole=" + read)
        .pipe(map(response => response))
        .pipe(catchError(this.handleError));
    } else {
      // if (jobType.toUpperCase() === 'DRAGANDDROP' || jobType.toUpperCase() === 'SCALA' || jobType.toUpperCase() === 'SPARK') {
      return this.https.get(this.baseUrl + '/jobs/spark/' + jobId)
        .pipe(map(response => response))
        .pipe(catchError(this.handleError));
      // } else {
      //   return this.https.get(this.baseUrl + '/jobs/' + jobId)
      //     .pipe(map(response => response))
      //     .pipe(catchError(this.handleError));
      // }
    }
  }

  fetchInternalJob(jobId: string, linenumber: Number, offset: Number, status): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https.get(this.baseUrl + '/internaljob/console/' + jobId + "?offset=" + offset + "&org=" + org + "&lineno=" + linenumber + "&status=" + status)
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }

  fetchAgentJob(jobId: string, linenumber: Number, offset: Number, status, read): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https.get(this.baseUrl + '/agentjobs/console/' + jobId + "?offset=" + offset + "&org=" + org + "&lineno=" + linenumber + "&status=" + status + "&readconsole=" + read)
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }

  downloadFile(cname, org, filename): Observable<any> {
    return this.https.get(this.baseUrl + '/file/download/' + cname + '/' + org, { params: { filename: filename }, responseType: 'blob' })
      .pipe((resp: any) => resp);
  }

  downloadPipelineLog(id): Observable<any> {
    return this.https.get(this.baseUrl + '/file/download/log/pipeline', { params: { id: id }, responseType: 'blob' })
      .pipe((resp: any) => resp);
  }

  downloadChainLog(id): Observable<any> {
    return this.https.get(this.baseUrl + '/file/download/log/chain', { params: { id: id }, responseType: 'blob' })
      .pipe((resp: any) => resp);
  }

  downloadNativeFile(cname, org, filename): Observable<any> {
    return this.https.get(this.baseUrl + '/file/download/native/' + cname + '/' + org, { params: { filename: filename }, responseType: 'blob' })
      .pipe((resp: any) => resp);
  }

  readNativeFile(cname, org, filename): Observable<any> {
    return this.https.get(this.baseUrl + '/file/read/' + cname + '/' + org, { params: { file: filename } })
  }

  readScriptFile(cname, org, filename): Observable<any> {
    return this.https.get(this.baseUrl + '/file/read/script/' + cname + '/' + org, { params: { file: filename } })
  }

  readDragAndDropFile(cname, org, filename): Observable<any> {
    return this.https.get(this.baseUrl + '/file/read/drag/' + cname + '/' + org, { params: { file: filename } })
  }

  createNativeFile(cname, org, file, filetype, script): Observable<any> {
    return this.https.post(this.baseUrl + '/file/create/' + cname + '/' + org + '/' + filetype, script, { params: { file: file }, headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }), observe: 'response', responseType: 'text' })
      .pipe(map(response => {
        return response.body
      }))
  }

  createScriptFile(cname, org, file, filetype, script): Observable<any> {
    return this.https.post(this.baseUrl + '/file/create/script/' + cname + '/' + org + '/' + filetype, script, { params: { file: file }, headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }), observe: 'response', responseType: 'text' })
      .pipe(map(response => {
        return response.body
      }))
  }

  createDragAndDropFile(cname, org, file, filetype, script): Observable<any> {
    return this.https.post(this.baseUrl + '/file/create/drag/' + cname + '/' + org + '/' + filetype, script, { params: { file: file }, headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }), observe: 'response', responseType: 'text' })
      .pipe(map(response => {
        return response.body
      }))
  }

  findByCoreid(corelid): Observable<any> {
    return this.https.get(this.baseUrl + '/jobs/corelid/' + corelid)
      .pipe((resp: any) => resp);
  }

  // sample method from angular doc
  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    const errMsg = (error.error) ? error.error :
      error.status ? `Status: ${error.status} - Text: ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    // if (error.status === 401) {
    //   window.location.href = '/';
    // }
    return throwError(errMsg);
  }

  fetchJobRunTypes(): Observable<string> {

    const org = sessionStorage.getItem("organization");
    return this.https.get(this.baseUrl+'/jobs/runtime/types/'+org).pipe((resp: any) => resp);
  }
}



