import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Services } from '../services/service';
import { map} from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { Observable, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PluginService {

  constructor(
    private https: HttpClient, 
    private service: Services, 
    @Inject('envi') private baseUrl: string
  ) {}

  // to get all plugins from mlplugin
  getAllPlugins(org): Observable<any> {
    return this.https.get(this.baseUrl + '/plugin/allPlugins/' + org, {
      observe: 'response'
    })
      .pipe(map(response => { return response.body }))
      .pipe(catchError(error => { return this.handleError(error) }));
  }

  getAllPluginsByOrg(org): Observable<any> {
    return this.https.get(this.baseUrl + '/plugin/allPluginsByOrg/' + org, {
      observe: 'response'
    })
      .pipe(map(response => { return response.body }))
      .pipe(catchError(error => { return this.handleError(error) }));
  }

  // to get pluginNode details from mlpluginDetails by individual type
  getPlugin(type: any, org: any): Observable<any> {
    return this.https.get(this.baseUrl + '/plugin/all/' + type + '/' + org, { responseType: 'text' , observe: 'response'})
      .pipe(map(response => {return response}))
      .pipe(catchError(error => { return this.handleError(error)}));
  }

  getPluginCount(type:any): Observable<any> {
    return this.https.get(this.baseUrl + '/plugin/count/' + type, {
        observe: 'response',
      })
      .pipe(map((response) => {return response.body;}))
      .pipe(catchError((err) => {return this.handleError(err);}));
  }

  // to create new plugin in mlplugin
  createPlugin(plugin): Observable<any> {
    return this.https.post(this.baseUrl + '/plugin/add', plugin, {
      observe: 'response'
    })
      .pipe(map(response => { return response.body }))
      .pipe(catchError(error => { return this.handleError(error) }));
  }

  // to update config and environment in mlplugin
  updateConfig(config: any, type: any): Observable<any> {
    const body = config
    const org = sessionStorage.getItem('organization');
    return this.https.post(this.baseUrl + '/plugin/updateconfig/' + type + '/' + org, body,{
      observe: 'response'
    })
      .pipe(map(response => response))
      .pipe(catchError(error => { return this.handleError(error) }));
  }

  // to add new node in mlpluginDetails for a particular type in new screen
  createNewNode(newNodeData): Observable<any> {
    return this.https.post(this.baseUrl + '/plugin/addNewNode', newNodeData,{
      observe: 'response'
    })
      .pipe(map(response => response))
      .pipe(catchError(error => { return this.handleError(error) }));
  }

  // to update node in mlpluginDetails for a particular pluginName in new screen
  updateIndividualNode(plugNodeName: any, plugNodeValue: any): Observable<any> {
    const body = JSON.stringify(plugNodeValue)
    const org = sessionStorage.getItem('organization');
    return this.https.post(this.baseUrl + '/plugin/update/' + plugNodeName + '/' + org, body,{
      observe: 'response'
    })
      .pipe(map(response => response))
      .pipe(catchError(error => { return this.handleError(error) }));
  }

  // to delete node in mlpluginDetails for a particular pluginName in new screen
  deleteIndividualNode(plugNodeName: any): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https.delete(this.baseUrl + '/plugin/delete/' + plugNodeName + '/' + org, {
      observe: 'response'
    })
      .pipe(catchError(error => { return this.handleError(error) }));
  }

  updatePlugin(plugData): Observable<any> {
    const body = JSON.stringify(plugData);
    return this.https.post(this.baseUrl + '/plugin/updateplugin/' + plugData.id, body,{
      observe: 'response'
    })
      .pipe(map(response => response))
      .pipe(catchError(error => { return this.handleError(error) }));
  }

  updatePluginScript(name: any, value: any, type: any): Observable<any> {
    return this.https.post(this.baseUrl + '/pluginscript/add/' + name + '/' + type, value,{
      observe: 'response'
    })
      .pipe(map(response => response))
      .pipe(catchError(error => { return this.handleError(error) }));
  }

  deletePlugin(name: any): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https.delete(this.baseUrl + '/plugin/deleteAllNode/' + name + '/' + org, {
      observe: 'response'
    })
      .pipe(catchError(error => { return this.handleError(error) }));
  }

  // getJwtToken() {
  //     this.jwt = JSON.parse(sessionStorage.getItem('authenticationToken'));
  //     this.options.headers.delete('Authorization');
  //     this.options.headers.append('Authorization', `Bearer ${this.jwt}`);
  //     return { headers: new HttpHeaders({ "Content-Type": "application/json" }) };
  //  }

  // sample method from angular doc
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
}

