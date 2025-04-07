import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { map } from 'rxjs/operators';
import { catchError } from "rxjs/operators";
import { Workflow } from "./workflow";
import { WorkflowSpec } from "./workflowspec";
import { ClusteringWorkflow } from "../../clustering/clusteringWorkflow";

@Injectable()
export class WorkflowService {
  tab: String

  constructor(
    private https: HttpClient,
    @Inject('envi') private baseUrl: string,
  ) {

  }

  setTab(tab){
    this.tab = tab
  }

  getTab(){
    return this.tab
  }

  getAllWorkflows(): Observable<any> {
    return this.https
      .get(this.baseUrl + '/workflows')
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getAllWorkflowSpec(): Observable<any> {
    return this.https
      .get(this.baseUrl + '/workflows/specs')
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getAllWorkflowSpecById(id:any){
    return this.https
      .get(this.baseUrl + '/workflows/spec/id/' + id, { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getWorkflowById(cid: any): Observable<any> {
    return this.https
      .get(this.baseUrl + '/workflows/id/' + cid, { observe: 'response' })
      .pipe(map(response => {
        return new Workflow(response.body);
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  /**
 * Get a StreamingServices by cid.
 */
  getWorkflowByNameAndOrg(name: any): Observable<Workflow> {
    const org = localStorage.getItem('organization');
    return this.https
      .get(this.baseUrl + '/workflows/' + name + '/' + org, { observe: 'response' })
      .pipe(map(response => {
        return new Workflow(response.body);
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getWorkflowBySpec(id: any): Observable<any> {
    const org = localStorage.getItem('organization');
    return this.https
      .get(this.baseUrl + '/workflows/specid/' + id , { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getWorkflowsByName(name: any): Observable<any> {
    return this.https
      .get(this.baseUrl + '/workflows/specname/' + name , { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  getWorkflowsByNameAndOrg(name: any): Observable<any> {
    const org = localStorage.getItem('organization');
    return this.https
      .get(this.baseUrl + '/workflows/specname/' + name +'/'+org , { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getWorkflowSpecByName(name: any): Observable<any> {
    return this.https
      .get(this.baseUrl + '/workflows/spec/name/' + name , { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  create(workflow: Workflow): Observable<Workflow> {
    const copy = this.convert(workflow);
    return this.https
      .post(this.baseUrl + '/workflows/add', copy, { observe: 'response' })
      .pipe(map(res => {
        return new Workflow(res.body);
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  createSpec(workflow: WorkflowSpec): Observable<any> {
    const copy = this.convertSpec(workflow);
    return this.https
      .post(this.baseUrl + '/workflows/addspec', copy, { observe: 'response' })
      .pipe(map(res => {
        return res.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  update(workflow: any): Observable<any> {
    const copy = this.convert(workflow);
    return this.https
      .put(this.baseUrl + '/workflows/updatespec', workflow, { observe: 'response' })
      .pipe(map(res => {
        return res.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  delete(cid: any) {
    return this.https
      .delete(this.baseUrl + '/workflows/delete/' + cid)
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  deletespec(cid: any) {
    return this.https
      .delete(this.baseUrl + '/workflows/deleteWorflowSpec/' + cid)
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  private convert(workflow: Workflow): Workflow {
    const copy: Workflow = Object.assign({}, workflow, { 'organization': localStorage.getItem('organization') });
    return copy;
  }

  private convertSpec(workflow: WorkflowSpec): WorkflowSpec {
    const copy: WorkflowSpec = Object.assign({}, workflow);
    return copy;
  }

  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
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

  saveClusteringWorkflow(body, params){
    return this.https.post(this.baseUrl + '/ClusteringWorkflow/save', body,{
      observe: 'response',
      params: params,
    }).pipe(map((response) => {
        return response;
      })
    ).pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  getClusteringWorkflowByName(name, org) {
    return this.https.get(this.baseUrl + '/ClusteringWorkflow/config/details', {
      params: { name: name, org: org },
      observe: 'response',
    }).pipe(map((response) => {
      return new ClusteringWorkflow(response.body);
      })
    )
    .pipe(catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  
}