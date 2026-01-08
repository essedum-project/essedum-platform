import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AgentDirectoryService {
  messageService: any;
  constructor(private https: HttpClient, @Inject('dataSets') private dataUrl: string) { }

  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    const errMsg = error.error;
    console.error(errMsg); // log to console instead
    return throwError(errMsg);
  }

  // ========================================
  // Agent Directory Methods
  // ========================================

      /**
       * Get list of agent directories with pagination and filters
       * GET /api/aip/agent-directory/list
       */
      getListAgentDirectory(page: number = 1, size: number = 8, project?: string, isCached: boolean = true, adapter_instance?: string, interfacetype?: string): Observable<any> {
        const organization = project || sessionStorage.getItem('organization');
        
        let params = new HttpParams()
          .set('page', page.toString())
          .set('size', size.toString())
          .set('project', organization)
          .set('isCached', isCached.toString());
        
        if (adapter_instance) {
          params = params.set('adapter_instance', adapter_instance);
        }
        return this.https.get('/api/aip/agent-directory/list', {
          params: params,
          headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
          observe: 'response'
        })
          .pipe(map(response => response.body))
          .pipe(catchError(err => this.handleError(err)));
      }

      /**
       * Get count of agent directories
       * GET /api/aip/agent-directory/count
       */
      getListCountAgentDirectory(project?: string, isCached: boolean = true, adapter_instance?: string): Observable<any> {
        const organization = project || sessionStorage.getItem('organization');
        
        let params = new HttpParams()
          .set('project', organization)
          .set('isCached', isCached.toString());
        
        if (adapter_instance) {
          params = params.set('adapter_instance', adapter_instance);
        }
        
        return this.https.get('/api/aip/agent-directory/count', {
          params: params,
          headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
          observe: 'response'
        })
          .pipe(map(response => response.body))
          .pipe(catchError(err => this.handleError(err)));
      }

      /**
       * Create new agent directory using real API
       * POST /api/aip/agent-directory/save
       */
      saveAgentDirectory(agentData: any): Observable<any> {
        return this.https.post('/api/aip/agent-directory/save', agentData, {
          headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
          observe: 'response'
        })
          .pipe(map(response => response))
          .pipe(catchError(err => this.handleError(err)));
      }

      /**
       * Update existing agent directory using real API
       * POST /api/aip/agent-directory/save (same endpoint for create and update)
       */
      agentDirectoryUpdate(agentData: any): Observable<any> {
        return this.https.post('/api/aip/agent-directory/save', agentData, {
          headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
          observe: 'response'
        })
          .pipe(map(response => response))
          .pipe(catchError(err => this.handleError(err)));
      }

      /**
       * Get agent directory by name
       * GET /api/aip/agent-directory/get/{name}/{organization}
       */
      getAgentDirectory(name: string, org?: string): Observable<any> {
    
          const organization = org || sessionStorage.getItem('organization');
          return this.https.get('/api/aip/agent-directory/get/' + name + '/' + organization, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
            observe: 'response'
          })
            .pipe(map(response => response.body))
            .pipe(catchError(err => this.handleError(err)));
        }
      

      /**
       * Create new agent directory (real API)
       * POST /api/aip/agent-directory/save
       */
      createAgentDirectory(agentData: any): Observable<any> {
        return this.https.post('/api/aip/agent-directory/save', agentData, {
          headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
          observe: 'response'
        })
          .pipe(map(response => response))
          .pipe(catchError(err => this.handleError(err)));
      }

      /**
       * Update existing agent directory
       */
      updateAgentDirectory(name: string, agentData: any): Observable<any> {
      
          return this.https.post(this.dataUrl + '/agent-directory///' + name, agentData, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
            observe: 'response'
          })
            .pipe(map(response => response))
            .pipe(catchError(err => this.handleError(err)));
      }

      /**
       * Delete agent directory by ID
       * DELETE /api/aip/agent-directory/delete/{id}
       */
      deleteAgentDirectory(id: number): Observable<any> {
        // Backend returns plain text message; request responseType set to 'text' to avoid JSON parse error
        return this.https.delete('/api/aip/agent-directory/delete/' + id, {
          observe: 'response',
          responseType: 'text' as 'json'
        })
          .pipe(map(response => response))
          .pipe(catchError(err => this.handleError(err)));
      }

      /**
       * Get unregistered pipelines by organization and interface type
       * GET /api/aip/agent-directory/pipelines/unregistered/{organization}?interfacetype={interfacetype}
       */
      getUnregisteredPipelines(organization: string, interfacetype: string): Observable<any> {
        let params = new HttpParams()
          .set('interfacetype', interfacetype);
        
        return this.https.get(`/api/aip/agent-directory/pipelines/unregistered/${organization}`, {
          params: params,
          headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
          observe: 'response'
        })
          .pipe(map(response => response.body))
          .pipe(catchError(err => this.handleError(err)));
      }
}
