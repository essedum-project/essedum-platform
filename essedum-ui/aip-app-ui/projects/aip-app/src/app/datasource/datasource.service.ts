import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Datasource } from './datasource';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';

@Injectable()
export class DatasourceService {
  messageService: any;
  constructor(private https: HttpClient, @Inject('dataSets') private dataUrl: string) { }

  getDatasource(name: string): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https.get(this.dataUrl + '/datasources/' + name + '/' + org, {
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

  getDatasourcesByName(name: any): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/search/' + name, { observe: 'response', params: { org: sessionStorage.getItem("organization") } })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  testConnection(datasource: Datasource): Observable<any> {
    return this.https.post(this.dataUrl + '/datasources/test', datasource, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response'
    })
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  isVaultEnabled(): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/isVaultEnabled', {
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

  createDatasource(datasource: Datasource): Observable<any> {
    return this.https.post(this.dataUrl + '/datasources/add', datasource, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response'
    })
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  
  saveDatasource(datasource: Datasource): Observable<any> {
    return this.https.post(this.dataUrl + '/datasources/save/' + (datasource.id ? datasource.id : datasource.alias), datasource, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response'
    })
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getDatasources(): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/all', {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response',
      params: { org: sessionStorage.getItem("organization") }
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getDatasourceByPluginType(type, search, interfacetype, page, size,organization?): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/type/paginated/' + type, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response',
      params: { org: organization?organization:sessionStorage.getItem("organization"),interfacetype:interfacetype, page: page, size: size, search: search }
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getDatasourceCountByPluginType(type, search): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/type/count/' + type, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response',
      params: { org: sessionStorage.getItem("organization"), search: search },
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  getDatasourceCountByPluginInterface(type,interfacetype, search): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/interfacetype/count/'+ type+"/" + interfacetype, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response',
      params: { org: localStorage.getItem('organization'), search: search },
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

 

  getDatasourceGroups(page, size): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/groups/all', {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response',
      params: { org: sessionStorage.getItem("organization") }
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getDatasourcesForGroup(group: string): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/all/' + group, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response',
      params: { org: sessionStorage.getItem("organization") }
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getPluginsLength(): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/all/len')
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError(err => {
        return this.handleError(err)
      }))
  }

  getDatasourceJson(page, size): Observable<any> {
    let headers = new HttpHeaders().append("Authorization", "Bearer " + localStorage.getItem("jwtToken"))
    return this.https.get(this.dataUrl + '/datasources/types', { params: { page: page, size: size },headers:headers })
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getDatasourceJsonByDatasourceName(name): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/types/' + name + '/' + sessionStorage.getItem("organization"), {
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

  getDatasourceByNameAndType(name, type, page, size): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/type/search/' + name + '/' + type, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response',
      params: { org: sessionStorage.getItem("organization"), page: page, size: size }
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  deleteDatasource(name): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https.delete(this.dataUrl + '/datasources/delete/' + name + '/' + org, {
      observe: 'response',
      params: { organization: sessionStorage.getItem("organization") }
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  addGroupModelEntity(name: String, groups: any[]): Observable<any> {
    return this.https.post(this.dataUrl + '/entities/add/datasource/' + name, groups, {
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

  deleteGroupModelEntity(name: String): Observable<any> {
    return this.https.post(this.dataUrl + '/entities/delete/datasource/' + name, sessionStorage.getItem("organization"), {
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

  getGroupsForEntity(name: string): Observable<any> {
    return this.https.get(this.dataUrl + '/groups/all/datasource/' + name, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response',
      params: { org: sessionStorage.getItem("organization") }
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    const errMsg = error.error;
    console.error(errMsg); // log to console instead
    // if (error.status === 401) {
    //   window.location.href = '/';
    // }
    return throwError(errMsg);
  }

  getDatasourcesNames(): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/names', {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response',
      params: { org: sessionStorage.getItem('organization') }
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getDatasourcesAliases(): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/names', {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response',
      params: { org: sessionStorage.getItem('organization') }
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getCoreDatasourceByType(type, search, page, size): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/type/paginated/' + type, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response',
      params: { org: "core", page: page, size: size, search: search }
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getCoreDatasourceCountByType(type, search): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/type/count/' + type, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response',
      params: { org: "core", search: search },
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getCoreDatasourceJsonByDatasourceName(name): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/types/' + name + '/' + "core", {
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

  getCoreDatasource(name: string, org: any): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/get/' + name + '/' + org, {
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

  getDatasourcesNames1(org): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/names', {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response',
      params: { org: org }
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getAdapterTypes(): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/get/adapterTypes', {
      observe: 'response'
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getAdaptersByOrg(): Observable<any> {
    return this.https.get(this.dataUrl + '/datasources/getadapters/'+sessionStorage.getItem("organization"), {
      observe: 'response'
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  scheduleDatasourceTest(timeId, expression): Observable<any> {
    try{
      let body = {
        "expression": expression,
        "zoneid" : timeId
      }
      let body1 = JSON.stringify(body)
     
      return this.https.post(this.dataUrl + '/testDatasources',body1 ,{observe: 'response'})
        .pipe(map(response => {
          return response;
        }))
        .pipe(catchError(err => {
          return this.handleError(err);
        }));
    }
    catch(Exception){
    this.messageService.error("Some error occured", "Error")
    }
   
    }

      getDocs(pluginType){
        const org = sessionStorage.getItem("organization");
        return this.https.get(this.dataUrl + '/datasources/getDocs/' + pluginType + '/' + org,
      { observe: 'response',responseType: 'text'})
      .pipe(map(response => {
        
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err)
      }))
      }

      getSpecTemplateNames(): Observable<any> {
        return this.https.get('/api/aip/spectemplates/specTemplateNames/list', {
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
    
      getSpecTemplateByName(templateName: string): Observable<any> {
        return this.https.get('/api/aip/spectemplates/'+templateName, {
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

      createInstance(instance: any): Observable<any> {
        return this.https.post('/api/aip/instances/add', instance, {
          headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
          observe: 'response'
        })
          .pipe(map(response => {
            return response;
          }))
          .pipe(catchError(err => {
            return this.handleError(err);
          }));
      }

      getInstance(name: string, org: any): Observable<any> {
        return this.https.get('/api/aip/instances/' + name + '/' + org, {
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

      getInstancesByAlias(alias: string, org: any): Observable<any> {
        return this.https.get('/api/aip/instances/searchByAlias/' + alias + '/' + org, {
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
}
