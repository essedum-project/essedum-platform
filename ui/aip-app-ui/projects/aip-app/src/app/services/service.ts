import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, NgZone } from '@angular/core';
import { Observable, from, throwError, of as observableof } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MessageBarComponent } from 'leds-lib';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StreamingServices } from '../streaming-services/streaming-service';
import { App } from '../apps/app';
import { DashConstant, encKey } from 'com-lib-util';
import { Datasource } from '../datasource/datasource';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Dataset } from '../dataset/datasets';
import { ANALYTICS_URLS, COMMON_URLS } from '../dataset/staticfile/api-endpoints';
import { CHARTAPI, CORR_CHART_ENDPOINTS, MULTI_VARIATE_ENDPOINTS, SCREEN_DOC } from '../dataset/staticfile/constant';
import { RecipeObject, StatisticsRequestObject, StoryBoardParameter, StoryObject } from '../dataset/staticfile/models';
import { BehaviorSubject } from 'rxjs';


import * as CHARTTYPES from '../dataset/staticfile/chart-list.json';
import * as MULTI_CHARTTYPES from '../dataset/staticfile/multivariate-charts';
import { Manifest, RemoteConfig } from '@angular-architects/module-federation';

@Injectable()
export class Services {
  datasetsFetched: any;

  private jwt: any;
  searchValues: any;
  paginationValues: any;

  constructor(
    private https: HttpClient,
    @Inject('dataSets') private dataUrl: string,
    @Inject('envi') private baseUrl: string,
    private matSnackbar: MatSnackBar,
    private encKey: encKey,
    private zone: NgZone,
    private snackBar: MatSnackBar
  ) { }
  public getEndpointById(fedid: any, adapterId: any): Observable<any> {
    let session = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('instance', adapterId)
      .set('project', session)
      .set('isCached', 'true');
    return this.https
      .get(this.dataUrl + '/service/v1/endpoints/' + fedid, {
        observe: 'response',
        params: param,
      })
      .pipe(
        map((res) => {
          return res.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  info(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  error(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
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

  getDatasetJson(): Observable<any> {
    return this.https
      .get(this.dataUrl + '/datasets/types', { observe: 'response' })
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
  gg() {
    return this.https.get('https://victlpfc1-02.ad.infosys.com:5004/histogram');
  }
  uploadToStorageServer(storageAttributes): Observable<any> {
    let param = new HttpParams()
      .set('objectKey', storageAttributes.objectKey)
      .set('uploadFile', storageAttributes.uploadFile)
      .set('org', sessionStorage.getItem('organization'));
    return this.https
      .post(
        this.baseUrl + '/app/uploadToServer',
        {},
        { observe: 'response', responseType: 'text', params: param }
      )
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

  //getModelList
  getModelListAdapters(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/models/listAdapters', {
        observe: 'response',
        params: param,
      })
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

  getModelListAdaptersTypes(): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/models/listAdapterTypes', {
        observe: 'response',
      })
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

  // undeployeModel
  undeployModel(adapter: any, version: any, model_id: any, deployment_id: any) {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('model_id', model_id)
      .set('version', version)
      .set('project', session)
      .set('deployment_id', deployment_id)
      .append('cloud_provider', adapter);
    return this.https
      .delete(this.dataUrl + '/service/v1/model/deleteDeployment', {
        observe: 'response',
        params: param,
      })
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
  // delteEndpoint
  deleteEndpoint(endpoint_id: any, adapter: any) {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .set('isCached', true)
      .append('adapter_instance', adapter);
    return this.https
      .delete(
        this.dataUrl + '/service/v1/endpoints/' + endpoint_id + '/delete',
        {
          observe: 'response',
          params: param,
        }
      )
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
  deleteModels(model_id: any, adapter: any, version: any) {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .set('isCached', true)
      .set('isInstance', true)
      .set('version', version)
      .append('adapter_instance', adapter);
    return this.https
      .delete(this.dataUrl + '/service/v1/models/delete/' + model_id, {
        observe: 'response',
        params: param,
      })
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
  //getModelList
  getEndpointListAdapters(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/endpoints/listAdapters', {
        observe: 'response',
        params: param,
      })
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

  //getModelList
  getEndpointListAdaptersTypes(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/endpoints/listAdapterTypes', {
        observe: 'response',
      })
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
  // MODELS
  getRegisterModelJson(adapter: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .append('adapter_instance', adapter);

    return this.https
      .get(this.dataUrl + '/service/v1/models/getRegisterModelJson', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
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

  getDeployModelJson(adapter: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .append('adapter_instance', adapter);

    return this.https
      .get(this.dataUrl + '/service/v1/models/getDeployModelJson', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
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

  getAllModels(org): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/models/getAll/' + org, {
        observe: 'response',
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

  getAllEndpoints(org): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/endpoints/getAll/' + org, {
        observe: 'response',
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
  // CRADS
  getModelCards(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/models/list', {
        observe: 'response',
        params: param,
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
  getCountModels(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/models/list/count', {
        observe: 'response',
        params: param,
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
  getCountFSList(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/features/store/list/count', {
        observe: 'response',
        params: param,
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
  //featureStore Cards
  getFeatureStoreCards(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/features/store/list', {
        observe: 'response',
        params: param,
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
  //Get Feature Profile
  getFeatureProfile(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/features/profile', {
        observe: 'response',
        params: param,
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
  getEndpointCards(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/endpoints/list', {
        observe: 'response',
        params: param,
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
  getCountEndpoint(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/endpoints/list/count', {
        observe: 'response',
        params: param,
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

  // REGISTER MODEL
  registerModel(regBody: any, adapter: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .set('isCached', true)
      .set('adapter_instance', adapter);
    return this.https
      .post(this.dataUrl + '/service/v1/models/register', regBody, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
      })
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
  deployModel(deployBody: any, adapter: any, modelId: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .set('isCached', true)
      .set('adapter_instance', adapter);
    return this.https
      .post(
        this.dataUrl + '/service/v1/models/' + modelId + '/export',
        deployBody,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
          observe: 'response',
          params: param,
        }
      )
      .pipe(
        map((response) => {
          return response;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
          // return err
        })
      );
  }

  // UPDAT MODEL
  updateModel(regBody: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams().set('project', session);
    return this.https
      .post(this.dataUrl + '/service/v1/models/updateModel', regBody, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
      })
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

  // MODELS
  getRegisterEndpointJson(adapter: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .append('adapter_instance', adapter);

    return this.https
      .get(this.dataUrl + '/service/v1/endpoints/getRegisterEndpointJson', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
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

  // REGISTER MODEL
  registerEndpoint(regBody: any, adapter: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .set('adapter_instance', adapter)
      .set('isCached', true);
    return this.https
      .post(this.dataUrl + '/service/v1/endpoints/register', regBody, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
      })
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
  // permissions api for edit and delete
  getPermission(mod: any): Observable<any> {
    try {
      let role = JSON.parse(sessionStorage.getItem('role')).id;
      return this.https
        .get('api/usm-role-permissionss/formodule/' + role, {
          observe: 'response',
          responseType: 'text',
          params: { module: mod },
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
    } catch (Exception) {
      // this.messageService.error("Some error occured", "Error")
      console.log('Some error occured', 'Error');
    }
  }
  getUniqueEndpointList(adapterid: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('app_org', session)
      .append('adapter_id', adapterid);

    return this.https
      .get(this.dataUrl + '/service/v1/endpoints/listAdapterEndpoints', {
        // headers: new HttpHeaders({
        //   'Content-Type': 'application/json; charset=utf-8',
        // }),
        observe: 'response',
        params: param,
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

  getRestProviders(org: any): Observable<any> {
    return this.https
      .get(this.dataUrl + '/datasources/getRestProvidersForEndpoint/' + org, {
        observe: 'response',
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
  //getPipelinesCards
  getPipelinesCards(param: HttpParams): Observable<any> {
    // let session: any = sessionStorage.getItem('organization');
    // let param = new HttpParams()
    //   .set('cloud_provider', 'internal')
    //   .set('filter', 'abc')
    //   .set('orderBy', 'abc')
    //   .set('project', session);
    return this.https
      .get(this.dataUrl + '/service/v1/pipelines/training/list', {
        observe: 'response',
        params: param,
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

  getallPipelinesByOrg(): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(
        this.dataUrl + '/service/v1/streamingServices/allPipelinesByOrg/' + org,
        { observe: 'response' }
      )
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

  getCountPipelines(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/pipelines/count', {
        observe: 'response',
        params: param,
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

  getPipelines(): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('cloud_provider', 'internal')
      .set('filter', 'abc')
      .set('orderBy', 'abc')
      .set('isCached', false)
      .set('project', session);
    return this.https
      .get(this.dataUrl + '/service/v1/pipelines/training/list', {
        observe: 'response',
        params: param,
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

  getPipelinesByInterfacetype(org, type: String): Observable<any> {
    // let org: any = sessionStorage.getItem('organization');

    return this.https
      .get(this.dataUrl + '/service/v1/pipelines/' + type + '/' + org, {
        observe: 'response',
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

  getPipelinesByTypeAndInterface(
    org,
    type: String,
    interfacetype: String
  ): Observable<any> {
    // let org: any = sessionStorage.getItem('organization');

    return this.https
      .get(
        this.dataUrl +
        '/service/v1/pipelines/' +
        type +
        '/' +
        interfacetype +
        '/' +
        org,
        {
          observe: 'response',
        }
      )
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
  //getDatasets
  getDatasetCards(pageNumber, pageSize, search, template?): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('adapter_instance', 'internal')
      .set('filter', 'abc')
      .set('orderBy', 'abc')
      .set('project', session)
      .set('isTemplate', template)
      .set('isCached', true)
      .set('page', pageNumber)
      .set('size', pageSize)
      .set('search', search);
    return this.https
      .get(this.dataUrl + '/service/v1/datasets/list', {
        observe: 'response',
        params: param,
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
  //getSchemas
  getSchemasCards(param): Observable<any> {
    let session: any = sessionStorage.getItem('organization');

    return this.https
      .get(this.dataUrl + '/service/v1/schemas/list', {
        observe: 'response',
        params: param,
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

  //getAdapters
  getAdapterCards(): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('filter', 'abc')
      .set('orderBy', 'abc')
      .set('project', session);
    return this.https
      .get(this.dataUrl + '/service/v1/adapters/list', {
        observe: 'response',
        params: param,
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

  //getDatasources
  getDatasourceCards(session): Observable<any> {
    // let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('filter', 'abc')
      .set('orderBy', 'abc')
      .set('project', session);
    return this.https
      .get(this.dataUrl + '/service/v1/datasources/list', {
        observe: 'response',
        params: param,
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

  //getInstances
  getInstanceCards(): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('filter', 'abc')
      .set('orderBy', 'abc')
      .set('project', session);
    return this.https
      .get(this.dataUrl + '/service/v1/instances/list', {
        observe: 'response',
        params: param,
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
  messageService(resp: any, msg?: any) {
    console.log(resp);
    if (resp.status == 200) {
      if (resp.body.length === 0) {
        let message = {
          message: msg,
          button: false,
          type: 'success',
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
      } else if (
        resp.body.status === 'FAILURE' ||
        (resp.body[0] && resp.body[0].status === 'FAILURE')
      ) {
        let failmsg = '';
        if (resp.body.status === 'FAILURE')
          failmsg = resp.body.details[0].message;
        else if (resp.body[0] && resp.body[0].status === 'FAILURE')
          failmsg = resp.body[0].message;
        else failmsg = 'FAILED';
        let message = {
          message: failmsg,
          button: false,
          type: 'error',
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
      } else {
        let message = {
          message: msg ? msg : resp.body.status,
          button: false,
          type: 'success',
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
    } else if (resp.text == 'success') {
      let message = {
        message: 'Tags Updated Successfully',
        button: false,
        type: 'success',
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
    } else {
      let message = {
        message: resp.error ? resp.error : resp,
        button: false,
        type: 'error',
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
  }
  getMlTagswithparams(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/tags/fetchAll', {
        observe: 'response',
        params: param,
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
  getMlTags(): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/tags/fetchAll', { observe: 'response' })
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
  // ENDPOINT update
  updateEndpoint(regBody: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams().set('project', session);
    return this.https
      .post(this.dataUrl + '/service/v1/endpoints/updateEndpoint', regBody, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
      })
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

  callGetApi(url, parameters?, headers?) {
    return this.https
      .get(url, {
        // headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
        observe: 'response',
        params: parameters,
        headers: headers,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get a StreamingServices by cid.
   */
  getStreamingServicesByName(
    name: any,
    org1?: any
  ): Observable<StreamingServices> {
    const org = org1 ? org1 : sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl + '/service/v1/streamingServices/' + name + '/' + org, {
        observe: 'response',
      })
      .pipe(
        map((response) => {
          return new StreamingServices(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  getStreamingServicesByAlias(alias: any, org1?: any): Observable<string> {
    const org = org1 ? org1 : sessionStorage.getItem('organization');
    return this.https
      .get(
        this.dataUrl +
        '/service/v1/streamingServicesByAlias/' +
        alias +
        '/' +
        org,
        {
          observe: 'response',
          responseType: 'text',
        }
      )
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

  readGeneratedScript(name): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https.get(
      this.dataUrl + '/service/v1/streamingServices/generatedScript',
      {
        params: { name: name, org: org },
        observe: 'response',
      }
    );
  }
  updateTags(tagIds: any, entityType: any, entityId: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let regBody = {};
    // let param = new HttpParams()
    //   .set('tagIds', tagIds.toString())
    //   .append('entityType', entityType)
    //   .append('entityId', entityId)
    //   .append('organization', session);
    let param = {
      entityType: entityType,
      tagIds: tagIds,
      entityId: entityId,
      organization: session,
    };
    return this.https
      .post(this.dataUrl + '/service/v1/add/tags', regBody, {
        observe: 'response',
        params: param,
      })
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
  //to create new label for tags
  createTagLabel(allTag): Observable<any> {
    return this.https
      .post(this.dataUrl + '/service/v1/tags/addTag', allTag, {
        observe: 'response',
      })
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
  //to update the tag
  //  updateTagLabel(id,allTag):Observable<any>{
  //   return
  //  }
  updateTagLabel(id: number, allTag: any): Observable<any> {
    return this.https
      .post(this.dataUrl + '/service/v1/tags/updateTag/' + id, allTag, {
        observe: 'response',
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return err;
        })
      );
  }

  //to delete tag from any category
  deleteTag(id: number): Observable<any> {
    return this.https
      .delete(this.dataUrl + '/service/v1/tags/delete/' + id, {
        observe: 'response',
      })
      .pipe(catchError(this.handleError));
  }

  listJsonByType(type: string): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl + '/plugin/all/' + type + '/' + org, {
        observe: 'response',
        responseType: 'text',
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
    // .get(this.dataUrl + '/service/v1/plugin/all/' + type + '/'+ org, { observe: 'response' ,responseType: 'text'})
    // .pipe(map(response => {
    //   return response.body;
    // }))
    // .pipe(catchError(err => {
    //   return this.handleError(err);
    // }));
  }

  //modal-edit-canvas
  update(streaming_services: StreamingServices): Observable<StreamingServices> {
    try {
      streaming_services.organization = sessionStorage.getItem('organization');
      const body = JSON.stringify(streaming_services);
      if (streaming_services.json_content) {
        const jsonContent = JSON.parse(streaming_services.json_content);
        jsonContent.elements?.map((ele) => {
          delete ele.context;
          return ele;
        });
        streaming_services.json_content = JSON.stringify(jsonContent);
      }
      return this.https
        .put(this.dataUrl + '/service/v1/streamingServices/update', body, {
          // .put(this.dataUrl + '/streamingServices/update', body, {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
          observe: 'response',
        })
        .pipe(
          map((response) => {
            return new StreamingServices(response.body);
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    } catch (Exception) {
      this.message('Some error occured', 'error');
    }
  }

  updateImage(
    id: any,
    alias: any,
    name: any,
    fileName: any,
    mimeType: any,
    url: any
  ): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let regBody = {
      id: id,
      alias: alias,
      name: name,
      filename: fileName,
      mimetype: mimeType,
      url: url,
      organization: session,
    };
    return this.https
      .put(this.dataUrl + '/service/v1/image/update', regBody, {
        observe: 'response',
      })
      .pipe(
        map((res) => {
          return res;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  getAllPlugins(org): Observable<any> {
    return (
      this.https
        // .get(this.dataUrl + '/service/v1/plugin/allPlugins/' + org)
        .get(this.dataUrl + '/plugin/allPlugins/' + org)
        .pipe(map((response) => response))
        .pipe(catchError(this.handleError))
    );
  }
  getAllPluginsByOrg(org): Observable<any> {
    return this.https.get(this.baseUrl + '/plugin/allPluginsByOrg/' + org, {
      observe: 'response'
    })
      .pipe(map(response => { return response.body }))
      .pipe(catchError(error => { return this.handleError(error) }));
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

  //modal-edit-canvas
  create(streaming_services: StreamingServices): Observable<StreamingServices> {
    const copy = this.convert(streaming_services);
    return this.https
      .post(this.dataUrl + '/service/v1/streamingServices/add', copy, {
        observe: 'response',
      })
      .pipe(
        map((res) => {
          return new StreamingServices(res.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  private convert(streaming_services: StreamingServices): StreamingServices {
    const copy: StreamingServices = Object.assign({}, streaming_services, {
      organization: sessionStorage.getItem('organization'),
    });
    return copy;
  }

  //modal-edit-canvas
  addGroupModelEntity(name: String, groups: any[]): Observable<any> {
    return this.https
      .post(
        this.dataUrl +
        '/entities/add/pipeline/' +
        sessionStorage.getItem('organization') +
        '/' +
        name,
        groups
      )
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
  //modal-edit-canvas
  getStreamingServices(cid: any): Observable<StreamingServices> {
    return (
      this.https
        .get(this.dataUrl + '/service/v1/streamingServices/' + cid, {
          observe: 'response',
        })
        // .get(this.dataUrl + '/streamingServices/' + cid, { observe: 'response' })
        .pipe(
          map((response) => {
            return new StreamingServices(response.body);
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        )
    );
  }
  //modal-edit-canvas
  getPipelineGroups(): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/groups/all', {
        params: { org: sessionStorage.getItem('organization') },
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
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

  //modal-edit-canvas
  getGroupsForEntity(name: string): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/groups/all/pipeline/' + name, {
        observe: 'response',
        params: { org: sessionStorage.getItem('organization') },
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
  //pipeline.description
  savePipelineJSON(name, jsonObj): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return (
      this.https
        // .post(this.dataUrl + '/service/v1/streamingServices/saveJson/'+ name + '/' + org, jsonObj)
        .post(
          this.dataUrl + '/streamingServices/saveJson/' + name + '/' + org,
          jsonObj
        )
        .pipe(
          map((res) => {
            return res;
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        )
    );
  }
  getMappedTags(entityId: any, entityType: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = {
      entityType: entityType,
      entityId: entityId,
      organization: session,
    };
    return this.https
      .get(this.dataUrl + '/service/v1/getMappedTags', {
        observe: 'response',
        params: param,
      })
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

  saveImage(
    alias: any,
    name: any,
    fileName: any,
    mimeType: any,
    url: any
  ): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let regBody = {
      alias: alias,
      name: name,
      filename: fileName,
      mimetype: mimeType,
      url: url,
      organization: session,
    };
    return this.https
      .post(this.dataUrl + '/service/v1/save/image', regBody, {
        observe: 'response',
      })
      .pipe(
        map((res) => {
          return res;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  getImage(name: string): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl + '/service/v1/get/image/' + name + '/' + org, {
        observe: 'response',
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

  getTemplate(name: string): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(
        this.dataUrl +
        '/service/v1/streamingServices/template/' +
        name +
        '/' +
        org,
        { observe: 'response' }
      )
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
  //console-tab getAgentById
  getAgentById(cid: any): Observable<StreamingServices> {
    return this.https
      .get(this.dataUrl + '/service/v1/agents/' + cid, { observe: 'response' })
      .pipe(
        map((response) => {
          return new StreamingServices(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  //console-tab getAgentJobsByStreamingServiceLen
  getAgentJobsByStreamingServiceLen(name: any): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(
        this.dataUrl + '/service/v1/agentjobs/streamingLen/' + name + '/' + org,
        { observe: 'response' }
      )
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

  //console-tab getJobsByStreamingServiceLen
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

  getChainJobLen(name): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.baseUrl + '/chainjob/jobsLen/' + name + '/' + org, {
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
  getLogList(name, page, size): Observable<any[]> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.baseUrl + '/chainjob/fetch/' + name + '/' + org, {
        params: { page: page, size: size },
        observe: 'response',
      })
      .pipe(
        map((response) => {
          return <any>response.body;
        })
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }
  //console-tab fetchAgentJob
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

  //console-tab fetchSparkJob
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
  //console-tab getJobsByAgents
  getJobsByAgents(name: any, page: any, size: any): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl + '/service/v1/agentjobs/' + name + '/' + org, {
        params: { page: page, size: size },
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
  getIndvLog(id): Observable<any> {
    return this.https
      .get(this.baseUrl + '/chainjob/console/' + id, { observe: 'response' })
      .pipe(
        map((response) => {
          return <any>response.body;
        })
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }
  //console-tab getJobsByStreamingService
  getJobsByStreamingService(name: any, page: any, size: any): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl + '/service/v1/jobs/' + name + '/' + org, {
        params: { page: page, size: size },
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
  //console-tab stopPipeline
  stopPipeline(jobid): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/jobs/stopJob/' + jobid, {
        observe: 'response',
      })
      .pipe(map((response) => response))
      .pipe(catchError(this.handleError));
  }
  //job-data-viewer getPipelineNames
  getPipelineNames(org): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/streamingServices/allPipelineNames', {
        observe: 'response',
        params: { org: org },
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
  //job-data-viewer findByCoreid
  findByCoreid(corelid): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/jobs/corelid/' + corelid)
      .pipe((resp: any) => resp);
  }
  fetchoutputArtifacts(jobId): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/jobs/outputArtifacts/' + jobId)
      .pipe(map((response) => response))
      .pipe(catchError(this.handleError));
  }
  //job-data-viewer findByCoreid
  fetchInternalJob(
    jobId: string,
    linenumber: Number,
    offset: Number,
    status
  ): Observable<any> {
    const org = sessionStorage.getItem('organization');
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

  //job-data-viewer findByCoreid
  downloadPipelineLog(id): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/file/download/log/pipeline', {
        params: { id: id },
        responseType: 'blob',
      })
      .pipe((resp: any) => resp);
  }
  //metric-viewer  getImageByPath
  getImageByPath(path: any) {
    return this.https.get(this.dataUrl + '/service/v1/jobs/image', {
      params: { path: path },
      responseType: 'blob',
    });
  }
  //for run pipeline
  triggerPostEvent(
    Eventdetails: any,
    body,
    datasourceName,
    corelid?
  ): Observable<any> {
    return this.https
      .post(this.dataUrl + '/service/v1/event/trigger/' + Eventdetails, body, {
        observe: 'response',
        responseType: 'text',
        params: {
          org: sessionStorage.getItem('organization'),
          corelid: corelid ? corelid : '',
          datasourceName: datasourceName,
        },
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
  //for run pipeline
  runIecpPipeline(newCanvas: any): Observable<any> {
    const org = sessionStorage.getItem('organization');
    let url = 'https://ai-platform/cloudBaseUrl/pipeline/pipeline_training/ ';
    return this.https.post(url, newCanvas);
  }
  //for run pipeline
  runMlFlowPipeline(newCanvas: any): Observable<any> {
    const org = sessionStorage.getItem('organization');
    let url = 'https://ai-platform/cloudBaseUrl/pipeline/pipeline_training/';
    return this.https.post(url, newCanvas);
  }
  //for run pipeline
  runPipeline(
    alias,
    cname: any,
    pipelineType: any,
    isLocal?: any,
    datasource?: any,
    params?: any,
    workerlogId?: any
  ): Observable<any> {
    const org = sessionStorage.getItem('organization');
    if (isLocal == undefined || isLocal == null || isLocal == '') {
      isLocal = 'true';
    }
    if (params == undefined || params == null || params == '') {
      params = '{}';
    }
    let offset = new Date().getTimezoneOffset();
    return this.https
      .get(
        this.dataUrl +
        '/service/v1/pipeline/run-pipeline/' +
        pipelineType +
        '/' +
        cname +
        '/' +
        org +
        '/' +
        isLocal +
        '?offset=' +
        offset,
        {
          params: { param: params, alias: alias, datasource: datasource, workerlogId: workerlogId },
          responseType: 'text',
        }
      )

      .pipe(map((response) => response))
      .pipe(catchError(this.handleError));
  }
  //for pipeline runtypes
  fetchJobRunTypes(): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl + '/service/v1/jobs/runtime/types/' + org)
      .pipe((resp: any) => resp);
  }
  //to get datasources for pipelines
  getDatasources(): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/datasources/all', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: { org: sessionStorage.getItem('organization') },
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
  //modal-view-properties
  postCallObservableFn = (url: string, body: any, options: object = {}) => {
    var urlarr = url.split('/');

    if (urlarr[urlarr.length - 1] != '') {
      var service = urlarr[urlarr.length - 1];
    } else {
      var service = urlarr[urlarr.length - 2];
    }

    if (!service.includes('.')) {
      let formdata = new FormData();

      if (sessionStorage['currentDomain']) {
        formdata.append('domain', sessionStorage['currentDomain']);
      } else {
        formdata.append('domain', 'None');
      }

      if (sessionStorage['selectedUsecase']) {
        formdata.append('usecase', sessionStorage['selectedUsecase']);
      } else {
        formdata.append('usecase', 'None');
      }

      formdata.append('service', service);

      formdata.append('navsection', sessionStorage['navhead']);

      if (sessionStorage['uName']) {
        formdata.append('username', sessionStorage['uName']);
      } else {
        formdata.append('username', 'None');
      }

      if (sessionStorage['selectedtenantId']) {
        formdata.append(
          'tenantId',
          JSON.parse(sessionStorage['selectedtenantId'])
        );
      } else {
        formdata.append('tenantId', 'None');
      }

      // this.postgetlogsFn(environment.logdetails, formdata).subscribe(res => {

      //     console.log(res);

      // },

      //     err => {

      //         console.log(err);

      //     });
    }

    return this.https.post(url, body, options);
  };

  getDatasetAttribute(datasetValue, obj) {
    let attributes: any;

    try {
      attributes = JSON.parse(datasetValue.attributes);
    } catch {
      attributes = datasetValue.attributes;
    }

    attributes.Body = JSON.stringify(obj);

    datasetValue.attributes = attributes;

    return datasetValue;
  }

  getSpecificDatasetDetail(dataset: Dataset, removeCache): Observable<any> {
    // this.loader.show();
    let body: any;
    // let body = dataset.attributes
    if (dataset.attributes && dataset.attributes.length > 0) {
      const org = sessionStorage.getItem('organization');
      return this.https
        .get(this.dataUrl + '/datasets/viewData/' + dataset.name + '/' + org, {
          observe: 'response',
          params: { limit: '10', removeCache: removeCache },
          headers: new HttpHeaders().append('attributes', body),
        })
        .pipe(
          map((response) => {
            // this.loader.hide();
            console.log(response.body);
            return response.body;
          })
        )
        .pipe(
          catchError((err) => {
            // this.loader.hide();
            return this.handleError(err);
          })
        );
    } else {
      const org = sessionStorage.getItem('organization');
      return this.https
        .get(this.dataUrl + '/datasets/viewData/' + dataset.name + '/' + org, {
          observe: 'response',
          params: { limit: '10', removeCache: removeCache },
          headers: new HttpHeaders().append('attributes', body),
        })
        .pipe(
          map((response) => {
            // this.loader.hide();
            console.log(response.body);
            return response.body;
          })
        )
        .pipe(
          catchError((err) => {
            // this.loader.hide();
            return this.handleError(err);
          })
        );
    }
  }
  getAllDatasets() {
    return this.datasetsFetched;
  }
  setAllDatasets(datasets: any) {
    this.datasetsFetched = datasets;
  }
  getDatasets(): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
        '/datasets/all/' +
        sessionStorage.getItem('organization'),
        { observe: 'response' }
      )
      .pipe(
        switchMap(async (response) => {
          // this.loader.hide();
          // return response.body;
          let result = response.body as Array<any>;
          result.forEach(async (res) => {
            let salt = this.encKey.getSalt();
            if (!salt) salt = sessionStorage.getItem('salt');
            res.attributes = await this.decryptUsingAES256(
              res.attributes,
              salt
            );
          });
          return result;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  // getPaginatedDetails(dataset: any, pagination: any): Observable<any> {
  //   // let body = dataset.attributes
  //   let body: any;
  //   if (dataset.attributes && dataset.attributes.length > 0) {
  //     let tmpParams = pagination.sortEvent
  //       ? {
  //           page: pagination.page,
  //           size: pagination.size,
  //           sortEvent: pagination.sortEvent,
  //           sortOrder: pagination.sortOrder,
  //         }
  //       : { page: pagination.page, size: pagination.size };
  //     const org = sessionStorage.getItem('organization');
  //     return this.https.get(
  //       this.dataUrl + '/datasets/getPaginatedData/' + dataset.name + '/' + org,
  //       {
  //         observe: 'response',
  //         params: tmpParams,
  //         headers: new HttpHeaders().append('attribute', body),
  //       }
  //     );
  //   } else {
  //     let tmpParams = pagination.sortEvent
  //       ? {
  //           page: pagination.page,
  //           size: pagination.size,
  //           sortEvent: pagination.sortEvent,
  //           sortOrder: pagination.sortOrder,
  //         }
  //       : { page: pagination.page, size: pagination.size };
  //     const org = sessionStorage.getItem('organization');
  //     return this.https.get(
  //       this.dataUrl + '/datasets/getPaginatedData/' + dataset.name + '/' + org,
  //       {
  //         observe: 'response',
  //         params: tmpParams,
  //         headers: new HttpHeaders().append('attribute', body),
  //       }
  //     );
  //   }
  //   // let tmpParams = (pagination.sortEvent) ? { page: pagination.page, size: pagination.size, sortEvent: pagination.sortEvent, sortOrder: pagination.sortOrder } : { page: pagination.page, size: pagination.size }
  //   // const org = sessionStorage.getItem("organization");
  //   // return this.https.get(this.dataUrl + '/datasets/getPaginatedData/' + dataset.name + '/' + org,
  //   //   { observe: 'response', params: tmpParams, headers: new HttpHeaders().append("attribute", body) })
  //   // .pipe(map(response => {
  //   //   this.loader.hide();
  //   //   return response.body;
  //   // }))
  //   // .pipe(catchError(err => {
  //   //   this.loader.hide();
  //   //   return err;
  //   // }));
  // }

  getPaginatedDetails(dataset: any, pagination: any): Observable<any> {
    // let body = dataset.attributes
    let body: any;
    let salt = this.encKey.getSalt();
    if (!salt) salt = sessionStorage.getItem('salt');
    if (dataset.attributes && dataset.attributes.length > 0)
      return from(this.encrypt(dataset.attributes, salt)).pipe(
        switchMap((body) => {
          let tmpParams = pagination.sortEvent
            ? {
              page: pagination.page,
              size: pagination.size,
              sortEvent: pagination.sortEvent,
              sortOrder: pagination.sortOrder,
            }
            : { page: pagination.page, size: pagination.size };
          const org = sessionStorage.getItem('organization');
          return this.https.get(
            this.dataUrl +
            '/datasets/getPaginatedData/' +
            dataset.name +
            '/' +
            org,
            {
              observe: 'response',
              params: tmpParams,
              headers: new HttpHeaders().append('attribute', body),
            }
          );
        })
      );
    else
      return from(this.encrypt(JSON.stringify(dataset.attributes), salt)).pipe(
        switchMap((body) => {
          let tmpParams = pagination.sortEvent
            ? {
              page: pagination.page,
              size: pagination.size,
              sortEvent: pagination.sortEvent,
              sortOrder: pagination.sortOrder,
            }
            : { page: pagination.page, size: pagination.size };
          const org = sessionStorage.getItem('organization');
          return this.https.get(
            this.dataUrl +
            '/datasets/getPaginatedData/' +
            dataset.name +
            '/' +
            org,
            {
              observe: 'response',
              params: tmpParams,
              headers: new HttpHeaders().append('attribute', body),
            }
          );
        })
      );
    // let tmpParams = (pagination.sortEvent) ? { page: pagination.page, size: pagination.size, sortEvent: pagination.sortEvent, sortOrder: pagination.sortOrder } : { page: pagination.page, size: pagination.size }
    // const org = sessionStorage.getItem("organization");
    // return this.https.get(this.dataUrl + '/datasets/getPaginatedData/' + dataset.name + '/' + org,
    //   { observe: 'response', params: tmpParams, headers: new HttpHeaders().append("attribute", body) })
    // .pipe(map(response => {
    //   this.loader.hide();
    //   return response.body;
    // }))
    // .pipe(catchError(err => {
    //   this.loader.hide();
    //   return err;
    // }));
  }

  listSchemas(): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/schemaRegistry/schemas', {
        params: { org: sessionStorage.getItem('organization') },
        observe: 'response',
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
  updatePluginScript(name: any, value: any, type: any): Observable<any> {
    return this.https
      .post(
        this.dataUrl + '/service/v1/pluginscript/add/' + name + '/' + type,
        value
      )
      .pipe(map((response) => response))
      .pipe(catchError(this.handleError));
  }
  updatePlugin(name: any, value: any, config: any): Observable<any> {
    const body = {
      pluginData: JSON.stringify(value),
      configData: JSON.stringify(config),
    };
    return this.https
      .post(this.dataUrl + '/plugin/add/' + name, body)
      .pipe(map((response) => response))
      .pipe(catchError(this.handleError));
  }
  getDataset(name: string): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
        '/datasets/' +
        name +
        '/' +
        sessionStorage.getItem('organization'),
        { observe: 'response' }
      )
      .pipe(
        switchMap(async (response) => {
          let result = response.body as Array<any>;
          let salt = this.encKey.getSalt();
          if (!salt) salt = sessionStorage.getItem('salt');
          result['attributes'] = await this.decryptUsingAES256(
            result['attributes'],
            salt
          );
          return result;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  getalllabels(formData: any): Observable<any> {
    let newUrl = 'configuration/getlabelsforclassifier/';

    return this.https.post(
      'https://ai-platform/icmmMasterHost/' + newUrl,
      formData
    );
  }

  gettraininglist(formData: any): Observable<any> {
    let newUrl = 'configuration/getalltrainingsets/';

    return this.https.post(
      'https://ai-platform/icmmMasterHost/' + newUrl,
      formData
    );
  }

  gettaglist(formData: any): Observable<any> {
    let newUrl = 'processing/docanalysistechniques/';
    return this.https.post(
      'https://ai-platform/icmmMasterHost/' + newUrl,
      formData
    );
  }

  getSchemas(name: any): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(
        this.dataUrl + '/service/v1/schemaRegistry/schemas/' + name + '/' + org,
        { observe: 'response' }
      )
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
  createDataset(dataset: Dataset): Observable<any> {
    dataset.organization = String(sessionStorage.getItem('organization'));
    return this.https
      .post(this.dataUrl + '/datasets/add', dataset, { observe: 'response' })
      .pipe(
        map((response) => {
          // this.loader.hide();
          return response;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  getAdaptersByOrg(): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
        '/service/v1/datasources/getadapters/' +
        sessionStorage.getItem('organization'),
        {
          observe: 'response',
        }
      )
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

  getDatasetForDatasource(datasource: string): Observable<any> {
    return this.https
      .get(
        '/api/aip/datasets/datasource/' + sessionStorage.getItem('organization'),
        {
          observe: 'response',
          params: { datasource: datasource },
        }
      )
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

  fetchJobRunTypes2(): Observable<string> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.baseUrl + '/jobs/runtime/types/' + org)
      .pipe((resp: any) => resp);
  }

  runPipeline3(
    alias,
    cname: any,
    pipelineType: any,
    isLocal?: any,
    datasource?: any,
    params?: any
  ): Observable<any> {
    const org = sessionStorage.getItem('organization');
    if (isLocal == undefined || isLocal == null || isLocal == '') {
      isLocal = 'true';
    }
    if (params == undefined || params == null || params == '') {
      params = '{}';
    }
    let offset = new Date().getTimezoneOffset();
    return this.https
      .get(
        this.baseUrl +
        '/pipeline/run/' +
        pipelineType +
        '/' +
        cname +
        '/' +
        org +
        '/' +
        isLocal +
        '?offset=' +
        offset,
        {
          params: { param: params, alias: alias, datasource: datasource },
          responseType: 'text',
        }
      )

      .pipe(map((response) => response))
      .pipe(catchError(this.handleError));
  }
  runpipeline2(name: String, runtime: String) {
    const org = sessionStorage.getItem('organization');
    let offset = 0;
    return this.https.get(
      this.baseUrl +
      '/pipeline/run/nativescript/' +
      name +
      '/' +
      org +
      '/' +
      runtime +
      '/',
      { params: { offset: offset, generated: 1 }, responseType: 'text' }
    );
  }
  //create native-file
  createNativeFile(cname, org, file, filetype, script): Observable<any> {
    let headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append(
      'Content-Type',
      'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    );

    return this.https
      .post(
        this.dataUrl + '/file/create/' + cname + '/' + org + '/' + filetype,
        script,
        {
          params: { file: file },
          headers: headers,
          observe: 'response',
          responseType: 'text',
        }
      )
      .pipe(
        map((response) => {
          return response.body;
        })
      );
  }

  saveNativeScript(cname: String, filetype: String, script: any) {
    const org = sessionStorage.getItem('organization');
    let headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append(
      'Content-Type',
      'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    );
    // let filename = cname+"_"+org
    return this.https.post(
      this.baseUrl + '/file/create/' + cname + '/' + org + '/' + filetype,
      script,
      {
        params: { file: '' },
        headers: headers,
        observe: 'response',
      }
    );
  }
  //  return this.https.post(this.baseUrl + '/file/create/script/' + cname + '/' + org + '/' + filetype, script, { params: { file: 'DEMAKSHP47352_Demo.py' }, headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }), observe: 'response', responseType: 'text' })
  //     .pipe(map(response => {
  //       return response.body
  //     }))
  //  }

  saveApp(app: App) {
    const org = sessionStorage.getItem('organization');
    return this.https
      .post(this.baseUrl + '/app/save', app)
      .pipe(
        map((response) => {
          return new App(response);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  deleteApp(id: Number) {
    return this.https.delete(this.baseUrl + '/app/delete/' + id);
  }

  getAppByName(name: String) {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.baseUrl + '/app/' + name + '/' + org, { observe: 'response' })
      .pipe(
        map((response) => {
          return new App(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  getAppRoute(name: String) {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.baseUrl + '/app/appRoute/' + name + '/' + org, {
        observe: 'response',
        responseType: 'text',
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
  getPipelines2() {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.baseUrl + '/streamingServices/allPipelines/' + org)
      .pipe(
        map((response) => {
          return response;
        })
      )
      .pipe(catchError(this.handleError));
  }

  readAllScriptsInFolder(name): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https.get(
      this.dataUrl + '/service/v1/streamingServices/readAllScripts',
      { params: { name: name, org: org }, observe: 'response' }
    );
  }
  getPluginByTypeAndOrg(type: string): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl + '/service/v1/pluginbytype/' + type + '/' + org, {
        observe: 'response',
        responseType: 'text',
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

  getPipelinesTypeByOrganization(): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl + '/service/v1/streamingServices/getTypes/' + org, {
        observe: 'response',
        responseType: 'text',
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
  fetchInternalJobByName2(name: string, page, rows): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
        '/internaljob/jobname/' +
        name +
        '/' +
        sessionStorage.getItem('organization'),
        { params: { page: page, size: rows } }
      )
      .pipe(map((response) => response))
      .pipe(catchError(this.handleError));
  }
  //download native file
  downloadNativeFile(cname, org, filename): Observable<any> {
    return this.https
      .get(this.dataUrl + '/file/download/native/' + cname + '/' + org, {
        params: { filename: filename },
        responseType: 'blob',
      })
      .pipe((resp: any) => resp);
  }
  //read native file
  readNativeFile(cname, org, filename): Observable<any> {
    return this.https.get(this.baseUrl + '/file/read/' + cname + '/' + org, {
      params: { file: filename },
      responseType: 'arraybuffer',
    });
  }
  //get datasource
  getDatasource(name: string): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl + '/datasources/' + name + '/' + org, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
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
  getDatasourcesNames(): Observable<any> {
    return this.https
      .get(this.dataUrl + '/datasources/names', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: { org: sessionStorage.getItem('organization') },
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

  readScriptFile(cname, filename): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https.get(this.baseUrl + '/file/read/' + cname + '/' + org, {
      params: { file: filename },
      responseType: 'arraybuffer',
    });
  }

  // getImage(name): Observable<any> {
  //   const org = sessionStorage.getItem('organization');
  //   return this.https.get(this.dataUrl + '/service/v1/get/image' + name + '/'+ org, { observe: 'response' ,responseType: 'text'})
  //     .pipe(map(response => {
  //       return response.body;
  //     }))
  //     .pipe(catchError(err => {
  //       return this.handleError(err);
  //     }));
  //   }

  deleteStreamingService(cid: any) {
    return this.https
      .delete(this.baseUrl + '/streamingServices/delete/' + cid)
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
  getDatasetNames(org): Observable<any> {
    return this.https
      .get(this.dataUrl + '/datasets/dataset', {
        observe: 'response',
        params: { org: org },
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
  getAllSchemas(): Observable<any> {
    return this.https
      .get(this.baseUrl + '/schemaRegistry/schemas/all', {
        observe: 'response',
        params: { org: sessionStorage.getItem('organization') },
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

  deletePipeline(cid: any) {
    return this.https
      .delete(this.baseUrl + '/streamingServices/delete/' + cid)
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
  getPluginsLength(): Observable<any> {
    return this.https
      .get(this.baseUrl + '/datasources/all/len')
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

  getDatasourceJson(page, size): Observable<any> {
    let headers = new HttpHeaders().append(
      'Authorization',
      'Bearer ' + localStorage.getItem('jwtToken')
    );
    return this.https
      .get(this.baseUrl + '/datasources/types', {
        params: { page: page, size: size },
        headers: headers,
      })
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
  getCoreDatasource(name: string, org: any): Observable<any> {
    return this.https
      .get(this.dataUrl + '/datasources/get/' + name + '/' + org, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
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
  releasePort(pipelineId): Observable<any> {
    return this.https
      .put(this.dataUrl + '/runtime/release?pipelineid=' + pipelineId, {
        observe: 'response',
        responseType: 'text',
      })
      .pipe(
        map((res) => {
          return res;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  getDatasourcePort(id:any): Observable<any> {
    return this.https
      .get(this.dataUrl + '/runtime/get/connection?connid=' + id ,{
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
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

  getAvailablePorts(id:any): Observable<any> {
    return this.https
      .get(this.dataUrl + '/runtime/get/available-ports?connid=' + id ,{
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
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

  isVaultEnabled(): Observable<any> {
    return this.https
      .get(this.dataUrl + '/datasources/isVaultEnabled', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
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
  getDatasourceGroups(page, size): Observable<any> {
    return this.https
      .get(this.dataUrl + '/datasources/groups/all', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: { org: sessionStorage.getItem('organization') },
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
  getDatasourcesNames1(org): Observable<any> {
    return this.https
      .get(this.dataUrl + '/datasources/names', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: { org: org },
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

  async encryptgcm(plaintext, password) {
    // Generate random 12-byte IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Prepare the encryption parameters
    const algorithm = {
      name: 'AES-GCM',
      iv: iv,
    };

    // Import the key from password
    const importedKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      algorithm,
      false,
      ['encrypt']
    );

    // Encrypt the plaintext
    const encodedText = new TextEncoder().encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt(
      algorithm,
      importedKey,
      encodedText
    );

    const ciphertextArray = Array.from(new Uint8Array(ciphertext));
    // Convert Uint8Array to regular array
    const encodedCiphertext = btoa(
      String.fromCharCode.apply(null, ciphertextArray)
    );
    // const encodedIV = btoa(Array.from(iv));
    // const encodedIV = btoa(String.fromCharCode.apply(null, iv));
    const encodedIV = btoa(
      Array.from(iv)
        .map((byte) => String.fromCharCode(byte))
        .join('')
    );

    const encryptedJSON = { ciphertext: encodedCiphertext, iv: encodedIV };

    return encryptedJSON;
  }

  async encrypt(plaintext, password) {
    // const encryptedData = await this.usersService.encryptgcm(plaintext, password);
    const encryptedData = await this.encryptgcm(plaintext, password);

    return JSON.stringify(encryptedData);
  }

  async decryptgcm(ciphertext, iv, password) {
    // Decode the ciphertext and IV from Base64 strings
    const decodedCiphertext = Uint8Array.from(atob(ciphertext), (c) =>
      c.charCodeAt(0)
    );
    const decodedIV = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

    // Prepare the decryption parameters
    const algorithm = {
      name: 'AES-GCM',
      iv: decodedIV,
    };

    // Import the key from password
    const importedKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      algorithm,
      false,
      ['decrypt']
    );

    const decryptedData = await crypto.subtle.decrypt(
      algorithm,
      importedKey,
      decodedCiphertext
    );
    const decryptedText = new TextDecoder().decode(decryptedData);

    return decryptedText;
  }

  async decryptUsingAES256(cipherResponse, password) {
    let cipherJson = JSON.parse(cipherResponse);
    // const result = await this.usersService.decryptgcm(cipherJson["ciphertext"], cipherJson["iv"], password)
    const result = await this.decryptgcm(
      cipherJson['ciphertext'],
      cipherJson['iv'],
      password
    );

    return result;
  }

  getDatasetNamesByDatasource(data): Observable<any> {
    return (
      this.https
        .get(
          this.dataUrl +
          '/datasets/dsetNames/' +
          sessionStorage.getItem('organization'),
          {
            observe: 'response',
            params: { datasource: data },
          }
        )
        // .pipe(map(response => response.body))
        // .pipe(catchError(err => this.handleError(err)));
        .pipe(
          switchMap(async (response) => {
            let result = response.body as Array<any>;
            result.forEach(async (res) => {
              let salt = this.encKey.getSalt();
              if (!salt) salt = sessionStorage.getItem('salt');
              if (res.attributes != null) {
                res.attributes = await this.decryptUsingAES256(
                  res.attributes,
                  salt
                );
              }
            });
            return result;
          })
        )
        .pipe(catchError((err) => this.handleError(err)))
    );
  }

  getDatasetByNameAndOrg(name: string, org?): Observable<any> {
    let organization = org ? org : sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl + '/datasets/get/' + name + '/' + organization, {
        observe: 'response',
      })
      .pipe(
        switchMap(async (response) => {
          // this.loader.hide();
          // return response.body;
          let result = response.body as Array<any>;
          let salt = this.encKey.getSalt();
          if (!salt) salt = sessionStorage.getItem('salt');
          result['attributes'] = await this.decryptUsingAES256(
            result['attributes'],
            salt
          );
          return result;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  public generateFileId(org): Observable<any> {
    return this.https
      .get(this.dataUrl + '/datasets/generate/fileid?org=' + org, {
        observe: 'response',
        responseType: 'text',
      })
      .pipe(
        map((res) => {
          return res.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  uploadFile(formData: FormData, fileid): Observable<any> {
    try {
      let body = JSON.stringify(formData);
      return this.https
        .post(
          this.dataUrl +
          '/datasets/upload/' +
          fileid +
          '/' +
          sessionStorage.getItem('organization'),
          formData,
          { observe: 'response' }
        )
        .pipe((response) => {
          return response;
        })
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    } catch (Exception) {
      this.messageService('Some error occured', 'Error');
    }
  }

  testConnection(datasource: Datasource): Observable<any> {
    return this.https
      .post(this.dataUrl + '/datasources/test', datasource, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
      })
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

  addPorts(addPorts: any): Observable<any> {
    return this.https
      .post(this.dataUrl + '/runtime/addports', addPorts, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
      })
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

  validatePorts(validatePort: any): Observable<any> {
    return this.https
      .post(this.dataUrl + '/runtime/validateport', validatePort, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
      })
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
  editPorts(addPorts: any): Observable<any> {
  return this.https
    .post(this.dataUrl + '/runtime/editports', addPorts, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8',
      }),
      observe: 'response',
    })
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
  assignRuntimeService(pipelineData: any): Observable<any> {
    return this.https
      .put(this.dataUrl + '/runtime/assign', pipelineData, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
      })
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

  isRuntimeAssigned(pipeline_id): Observable<any> {
    return this.https
      .get(this.dataUrl + '/runtime/isAssigned?pipeline_id=' + pipeline_id, {
        observe: 'response',
        responseType: 'text',
      })
      .pipe(
        map((res) => {
          return res.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  saveDatasource(datasource: Datasource): Observable<any> {
    return this.https
      .post(
        this.dataUrl +
        '/datasources/save/' +
        (datasource.id ? datasource.id : datasource.alias),
        datasource,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
          observe: 'response',
        }
      )
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

  createDatasource(datasource: Datasource): Observable<any> {
    return this.https
      .post(this.dataUrl + '/datasources/add', datasource, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
      })
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
  getRegisterFeatureStoreJson(adapter: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .append('instance', adapter);
    return this.https
      .get(this.dataUrl + '/service/v1/features/store/createFeatureStoreJSON', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
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
  getRegisterDGAppJson(adapter: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .append('adapter_instance', adapter);
    return this.https
      .get(this.dataUrl + '/service/v1/dgbrain/app/createAppJson', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
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
  getDgappsList(): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams().set('project', session);
    return this.https
      .get(this.dataUrl + '/service/v1/dgbrain/appList', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
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
  getRegisterDGToolJson(appId: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .append('app_id', appId);
    return this.https
      .get(this.dataUrl + '/service/v1/dgbrain/app/createToolJson', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
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
  getRegisterAgentJson(): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams().set('project', session);
    // .append('app_id', appId);
    return this.https
      .get(this.dataUrl + '/service/v1/dgbrain/app/createAgentJson', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
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
  getRegisterFeaturesJson(adapter: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .append('instance', adapter);
    return this.https
      .get(this.dataUrl + '/service/v1/features/registerFeatureJSON', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
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
  getGroupJson(adapter: any, storeName: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .set('store', storeName)
      .append('instance', adapter);
    return this.https
      .get(this.dataUrl + '/service/v1/features/getGroupFeaturesJson', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
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

  //Register Feature Store
  registerFeatureStore(regBody: any, adapter: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .set('instance', adapter);
    return this.https
      .post(this.dataUrl + '/service/v1/features/store/create', regBody, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
      })
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
  //Register Features
  registerFeatures(
    regBody: any,
    adapter: any,
    storeName: any
  ): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .set('instance', adapter)
      .set('store', storeName);
    return this.https
      .post(this.dataUrl + '/service/v1/features/register/feature', regBody, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
      })
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
  //List Features
  getFeatureList(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/features/list/features', {
        observe: 'response',
        params: param,
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

  getTemplatesCards(param: HttpParams): Observable<any> {
    // let session: any = sessionStorage.getItem('organization');
    // let param = new HttpParams()
    //   .set('cloud_provider', 'internal')
    //   .set('filter', 'abc')
    //   .set('orderBy', 'abc')
    //   .set('project', session);
    return this.https
      .get(this.dataUrl + '/service/v1/templates/list', {
        observe: 'response',
        params: param,
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

  getCountTemplates(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/templates/count', {
        observe: 'response',
        params: param,
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
  deleteFeatureStore(storeName: any, adapter: any) {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .set('featureStoreName', storeName)
      .append('instance', adapter);
    return this.https
      .delete(this.dataUrl + '/service/v1/features/store/delete', {
        observe: 'response',
        params: param,
      })
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
  deleteFeatures(storeName: any, adapter: any, featureName: any) {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .set('featureStoreName', storeName)
      .set('featureName', featureName)
      .append('instance', adapter);
    return this.https
      .delete(this.dataUrl + '/service/v1/features/delete', {
        observe: 'response',
        params: param,
      })
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
  //Delete Features Group
  deleteFeaturesGroup(storeName: any, groupName: any, adapter: any) {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .set('featureStoreName', storeName)
      .set('groupName', groupName)
      .append('instance', adapter);
    return this.https
      .delete(this.dataUrl + '/service/v1/features/group/delete', {
        observe: 'response',
        params: param,
      })
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
  getFeastAdapters(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/features/feast/listAdapters', {
        observe: 'response',
        params: param,
      })
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
  getDGAdapters(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/dgbrain/listAdapters', {
        observe: 'response',
        params: param,
      })
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
  //Register DGApp
  registerDGApp(regBody: any, adapter: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .set('adapter_instance', adapter);
    return this.https
      .post(this.dataUrl + '/service/v1/dgbrain/app/create', regBody, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
      })
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
  //count DGApp
  getCountDgApp(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/dgbrain/apps/list/count', {
        observe: 'response',
        params: param,
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
  //count User Group
  getCountUserGroup(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/dgbrain/usergroups/count', {
        observe: 'response',
        params: param,
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
  //count DGTool
  getCountDGTool(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/dgbrain/list/tools/count', {
        observe: 'response',
        params: param,
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
  //Update UserGroup
  updateUserGroup(groupName: any, regBody: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('group_name', groupName)
      .set('project', session);
    return this.https
      .post(
        this.dataUrl + '/service/v1/dgbrain/update/group/' + groupName,
        regBody,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
          observe: 'response',
          params: param,
          responseType: 'text',
        }
      )
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
  // Assign Apps to UserGroup
  assignAppsToGroup(groupName: any, appIds: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('app_ids', appIds)
      .set('group_name', groupName)
      .set('project', session);
    return this.https
      .post(this.dataUrl + '/service/v1/dgbrain/apps/assignToGroup', appIds, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
        responseType: 'text',
      })
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
  //update DGApp
  updateDgApp(regBody: any, adapter: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .set('adapter_instance', adapter);
    return this.https
      .post(this.dataUrl + '/service/v1/dgbrain/app/edit', regBody, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
      })
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
  //update dgTool
  updateDgTool(regBody: any, appId: any, fileType: any, file): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .set('app_id', appId)
      .set('fileType', fileType)
      .append('script', file);
    return this.https
      .post(this.dataUrl + '/service/v1/dgbrain/tool/edit', regBody, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
      })
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
  //Delete DGApp
  deleteDGApp(appId: any, adapter: any) {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .append('adapter_instance', adapter);
    return this.https
      .delete(this.dataUrl + '/service/v1/dgbrain/app/delete/' + appId, {
        observe: 'response',
        params: param,
      })
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
  //Delete DGTool
  deleteDGTool(toolName: any) {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams().set('project', session);
    return this.https
      .delete(this.dataUrl + '/service/v1/dgbrain/tool/delete/' + toolName, {
        observe: 'response',
        params: param,
      })
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
  deleteUserGroup(groupName: any) {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams().set('project', session);
    // .append('group_name', groupName);
    return this.https
      .delete(
        this.dataUrl + '/service/v1/dgbrain/delete/usergroup/' + groupName,
        {
          observe: 'response',
          params: param,
        }
      )
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
  //Register DGTool
  registerDGTool(regBody: any, appId: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams().set('project', session).set('app_id', appId);
    return this.https
      .post(this.dataUrl + '/service/v1/dgbrain/tool/create', regBody, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
      })
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
  //Create userGroup
  registerUserGroup(groupName: any, regBody: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('group_name', groupName)
      .set('project', session);
    return this.https
      .post(this.dataUrl + '/service/v1/dgbrain/create/group', regBody, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
        responseType: 'text',
      })
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
  getListDgEngineer(roleId: any): Observable<any> {
    let session = JSON.parse(sessionStorage.getItem('project')).id;
    let param = new HttpParams()
      .set('project_id', session)
      .set('role_id', roleId);

    return this.https
      .get(this.dataUrl + '/service/v1/dgbrain/list/dgEngineer', {
        observe: 'response',
        params: param,
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
  // get userGroupList
  getUserGroup(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/dgbrain/usergroups', {
        observe: 'response',
        params: param,
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
  //To load the boilerplate code
  loadFile(): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/dgbrain/tool/loadFile', {
        observe: 'response',
        responseType: 'text',
      })
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
  //To Check the the syntax of code in DGTool Create screen
  syntaxValidation(
    regBody: any,
    toolName: any,
    appId,
    appName
  ): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('project', session)
      .set('appId', appId)
      .set('appName', appName);

    return this.https
      .post(
        this.dataUrl + '/service/v1/dgbrain/tool/syntaxValidation/' + toolName,
        regBody,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
          observe: 'response',
          params: param,
        }
      )
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
  getDatasourcesTypeByOrganization(): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl + '/service/v1/datasources/getTypes/' + org, {
        observe: 'response',
        responseType: 'text',
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
  getFeastAdaptersTypes(): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/features/listAdapterTypes', {
        observe: 'response',
      })
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
  getAppTypes(): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/getAppsType', {
        observe: 'response',
      })
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
  getDGAdaptersTypes(): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/dgbrain/listAdapterTypes', {
        observe: 'response',
      })
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
  getGroupedFeatures(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/features/groups/list', {
        observe: 'response',
        params: param,
      })
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
  addFeaturesToGroup(param: HttpParams, regBody?: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let requestBody = {};
    if (regBody) {
      requestBody = regBody;
    }
    return this.https
      .post(this.dataUrl + '/service/v1/features/group', requestBody, {
        observe: 'response',
        params: param,
      })
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
  checkVisualizeSupport(datasetName): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
        '/datasets/isVisualizationSupported/' +
        datasetName +
        '/' +
        sessionStorage.getItem('organization'),
        { observe: 'response' }
      )
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

  getProxyDbDatasetDetails(
    dataset: Dataset,
    dsource,
    params,
    org,
    removeCache?
  ): Observable<any> {
    if (removeCache == null || removeCache == undefined) removeCache = true;
    return this.https
      .get(
        this.dataUrl +
        '/service/dbdata/' +
        dsource.type +
        '/' +
        dsource.alias +
        '/' +
        dataset.alias +
        '/' +
        org +
        '/' +
        removeCache,
        { observe: 'response', params: params }
      )
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

  getDatasetForm(name: string): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
        '/datasets/datasetform/' +
        name +
        '/' +
        sessionStorage.getItem('organization'),
        { observe: 'response' }
      )
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

  getSchemaByName(name: any): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.baseUrl + '/schemaRegistry/schemas/' + name + '/' + org, {
        observe: 'response',
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

  getProxyDatasetDetails(
    dataset: Dataset,
    dsource,
    params,
    headers,
    org,
    removeCache?
  ): Observable<any> {
    // console.log(org);
    if (removeCache == null || removeCache == undefined) removeCache = true;
    return this.https
      .get(
        this.dataUrl +
        '/service/' +
        dsource.type +
        '/' +
        dsource.alias +
        '/' +
        dataset.alias +
        '/' +
        org +
        '/' +
        removeCache,
        { observe: 'response', params: params, headers: headers }
      )
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

  searchSchemasByName(name: any): Observable<any> {
    return this.https
      .get(this.baseUrl + '/schemaRegistry/search/' + name, {
        observe: 'response',
        params: { org: sessionStorage.getItem('organization') },
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

  getSearchCount1(
    datasetName: string,
    projectName: string,
    searchValues
  ): Observable<string> {
    try {
      let searchParamsValue = searchValues;
      if (searchValues && searchValues.length > 0)
        searchParamsValue = searchValues;
      else searchParamsValue = JSON.stringify(searchValues);
      let apiParams = {
        datasetName,
        projectName,
        searchParams: searchParamsValue,
      };
      return this.https
        .get('/api/aip/datasets/searchDataCount', {
          params: apiParams,
          responseType: 'text',
        })
        .pipe(
          map((response) => {
            if (response) {
              return response.toString();
            }
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    } catch (Exception) {
      this.messageService('Some error occured', 'Error');
    }
  }

  searchTicketsUsingDataset1(
    datasetName: string,
    projectName: string,
    pagination,
    searchValues,
    searchClause?
  ): Observable<any[] | string> {
    try {
      let searchParamsValue = searchValues;
      let selectClauseParamsValue = searchClause ? searchClause : null;
      if (searchValues && searchValues.length > 0)
        searchParamsValue = searchValues;
      else if (searchValues) {
        searchParamsValue = JSON.stringify(searchValues);
      }
      if (searchClause && searchClause.length > 0)
        selectClauseParamsValue = searchClause;
      else if (searchClause) {
        selectClauseParamsValue = JSON.stringify(searchClause);
      }
      let apiParams = pagination.sortEvent
        ? {
          page: pagination.page,
          size: pagination.size,
          sortEvent: pagination.sortEvent,
          sortOrder: pagination.sortOrder,
        }
        : {
          datasetName: datasetName,
          projectName: projectName,
          page: pagination.page,
          size: pagination.size,
        };
      if (searchClause) {
        apiParams['datasetName'] = datasetName;
        apiParams['projectName'] = projectName;
        apiParams['searchParams'] = searchParamsValue;
        apiParams['selectClauseParams'] = selectClauseParamsValue;
      } else {
        apiParams['datasetName'] = datasetName;
        apiParams['projectName'] = projectName;
        apiParams['searchParams'] = searchParamsValue;
      }
      // return this.https.get('/api/aip/datasets/searchData/'+datasetName+"/"+projectName, {
      //   params: apiParams,
      // })
      return this.https
        .get('/api/aip/datasets/searchData', {
          params: apiParams,
        })
        .pipe(
          map((response) => {
            if (
              response &&
              response[0] &&
              response[0].hasOwnProperty('Error: ')
            ) {
              let errorMsg: string = response[0]['Error: '];
              return errorMsg;
            } else {
              let responseArray: any[] = [];
              responseArray = <any[]>response;
              return responseArray;
            }
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    } catch (Exception) {
      this.messageService('Some error occured', 'Error');
    }
  }

  searchTicketsUsingParametertizedDataset1(
    datasetName: string,
    projectName: string,
    pagination,
    searchValues,
    queryParams?: string
  ): Observable<any[] | string> {
    try {
      let searchParamsValue = null;
      let queryParamsValue = null;
      this.setPaginationValues(pagination);
      this.setSearchValues(searchValues);
      if (searchValues && searchValues.length > 0)
        searchParamsValue = searchValues;
      else if (searchValues) {
        searchParamsValue = JSON.stringify(searchValues);
      }
      if (queryParams) queryParamsValue = queryParams;
      let apiParams = pagination.sortEvent
        ? {
          page: pagination.page,
          size: pagination.size,
          sortEvent: pagination.sortEvent,
          sortOrder: pagination.sortOrder,
        }
        : {
          datasetName: datasetName,
          projectName: projectName,
          page: pagination.page,
          size: pagination.size,
        };

      if (queryParams) {
        apiParams['searchParams'] = searchParamsValue;
        apiParams['queryParams'] = queryParamsValue;
        apiParams['datasetName'] = datasetName;
        apiParams['projectName'] = projectName;
      } else {
        apiParams['searchParams'] = searchParamsValue;
        apiParams['datasetName'] = datasetName;
        apiParams['projectName'] = projectName;
      }
      return this.https
        .get('/api/aip/datasets/searchData', {
          params: apiParams,
        })
        .pipe(
          map((response) => {
            if (
              response &&
              response[0] &&
              response[0].hasOwnProperty('Error: ')
            ) {
              let errorMsg: string = response[0]['Error: '];
              return errorMsg;
            } else {
              let responseArray: any[] = [];
              responseArray = <any[]>response;
              return responseArray;
            }
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    } catch (Exception) {
      this.message('Some error occured', 'error');
    }
  }

  searchTicketsUsingParametertizedDataset(
    datasetName: string,
    projectName: string,
    pagination,
    queryParams?: string
  ): Observable<any[] | string> {
    try {
      let searchParamsValue = null;
      let queryParamsValue = null;
      this.setPaginationValues(pagination);
      if (queryParams) queryParamsValue = queryParams;
      let apiParams = pagination.sortEvent
        ? {
          page: pagination.page,
          size: pagination.size,
          sortEvent: pagination.sortEvent,
          sortOrder: pagination.sortOrder,
        }
        : {
          datasetName: datasetName,
          projectName: projectName,
          page: pagination.page,
          size: pagination.size,
        };

      if (queryParams) {
        apiParams['queryParams'] = queryParamsValue;
        apiParams['datasetName'] = datasetName;
        apiParams['projectName'] = projectName;
      } else {
        apiParams['datasetName'] = datasetName;
        apiParams['projectName'] = projectName;
      }
      return this.https
        .get('/api/aip/datasets/searchData', {
          params: apiParams,
        })
        .pipe(
          map((response) => {
            if (
              response &&
              response[0] &&
              response[0].hasOwnProperty('Error: ')
            ) {
              let errorMsg: string = response[0]['Error: '];
              return errorMsg;
            } else {
              let responseArray: any[] = [];
              responseArray = <any[]>response;
              return responseArray;
            }
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    } catch (Exception) {
      this.message('Some error occured', 'error');
    }
  }

  role = sessionStorage.getItem('role');
  project = sessionStorage.getItem('project');
  // groupData: { [key: string]: any[] } = {};
  gheader: any = {
    'Content-Type': 'text/event-stream',
    Authorization: 'Bearer ' + localStorage.getItem('jwtToken'),
    Project: JSON.parse(this.project).id,
    Roleid: JSON.parse(this.role).id,
    Rolename: JSON.parse(this.role).name.toString(),
  };
  getGHeaders() {
    return (this.gheader = {
      'Content-Type': 'text/event-stream',
      Authorization: 'Bearer ' + localStorage.getItem('jwtToken'),
      Project: JSON.parse(this.project).id,
      Roleid: JSON.parse(this.role).id,
      Rolename: JSON.parse(this.role).name.toString(),
      'Access-Token': localStorage.getItem('accessToken'),
    });
  }
  data_flux = [];
  data = [];

  getCommonSearchData(
    size: number,
    page: number,
    search
  ): Observable<string[]> {
    let session: any = sessionStorage.getItem('organization');
    return new Observable((observer) => {
      let eventSource = new EventSourcePolyfill(
        this.dataUrl +
        '/service/v1/search/' +
        `?project=${session}&size=${size}&page=${page}&search=${search}`,
        {
          headers: this.getGHeaders(),
          withCredentials: true,
        }
      );
      let endSearch = false;
      eventSource.onmessage = (event) => {
        this.data_flux = [];
        this.data_flux.push(JSON.parse(event.data));
        observer.next(this.data_flux);
      };
      eventSource.onerror = (error) => {
        if (eventSource.readyState == 0) {
          eventSource.close();
          //  eventSource.abort();
          observer.complete();
        }
      };
    });
  }
  commonSearchByType(
    type: any,
    size: number,
    page: number,
    search?: any
  ): Observable<any> {
    if (!search) {
      search = '';
    }
    let session: any = sessionStorage.getItem('organization');
    return new Observable((observer) => {
      let eventSource = new EventSourcePolyfill(
        this.dataUrl +
        '/service/v1/search/type' +
        `?project=${session}&size=${size}&page=${page}&type=${type}&search=${search}`,
        {
          headers: this.getGHeaders(),
          withCredentials: true,
        }
      );
      let endSearch = false;
      eventSource.onmessage = (event) => {
        this.data_flux = [];
        this.data_flux.push(JSON.parse(event.data));

        observer.next(this.data_flux);
      };
      eventSource.onerror = (error) => {
        eventSource.close();
        observer.complete();
        console.log(error);
      };
      eventSource.onopen = (event) => {
        if (endSearch) {
          //  eventSource.abort();
          eventSource.close();
          observer.complete();
        }
        endSearch = true;
      };
    });
  }
  createlinkage(regBody: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams().set('project', session);
    return this.https
      .post(this.dataUrl + '/service/v1/useCase/add', regBody, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
      })
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
  getDgAppList(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/dgbrain/apps/list', {
        observe: 'response',
        params: param,
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
  getDgToolList(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/dgbrain/list/tools', {
        observe: 'response',
        params: param,
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
  getAgentList(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/dgbrain/getSyncAgents', {
        observe: 'response',
        params: param,
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
  getAssignedApp(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/dgbrain/assignedApps', {
        observe: 'response',
        params: param,
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
  deleteDatasource(name): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .delete(this.dataUrl + '/datasources/delete/' + name + '/' + org, {
        observe: 'response',
        params: { organization: sessionStorage.getItem('organization') },
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

  deleteRuntimes(name){
    const org = sessionStorage.getItem('organization');
    return this.https
    .delete(this.dataUrl + '/runtime/delete/' + name + '/' + org, {
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
  removelinkage(regBody: any): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams().set('project', session);
    return this.https
      .delete(this.dataUrl + '/service/v1/useCase/unlink', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        body: regBody,
        params: param,
      })
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
  messageNotificaionService(type: string, msg: string) {
    let message = {
      message: msg,
      button: false,
      type: type,
      successButton: 'Ok',
      errorButton: 'Cancel',
    };
    this.matSnackbar.openFromComponent(MessageBarComponent, {
      data: message,
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: '',
    });
  }
  getGroupsLength(): Observable<any> {
    return this.https
      .get(
        this.baseUrl +
        '/groups/all/len/' +
        sessionStorage.getItem('organization')
      )
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
  getSchemaGroups(page, size): Observable<any> {
    return this.https
      .get(this.baseUrl + '/groups/all', {
        observe: 'response',
        params: {
          page: page,
          size: size,
          org: sessionStorage.getItem('organization'),
        },
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
  getSchemaFormsByName(name: any): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.baseUrl + '/schemaRegistry/schemaForms/' + name + '/' + org, {
        observe: 'response',
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
  related = [];
  getRelatedComponent(id: any, type: any): Observable<string[]> {
    let session: any = sessionStorage.getItem('organization');
    return new Observable((observer) => {
      let eventSource = new EventSourcePolyfill(
        this.dataUrl +
        '/service/v1/useCase/get' +
        `?project=${session}&id=${id}&type=${type}`,
        {
          headers: this.getGHeaders(),
          withCredentials: true,
        }
      );
      let endSearch = false;
      eventSource.onmessage = (event) => {
        this.related = [];
        this.related.push(JSON.parse(event.data));
        observer.next(this.related);
      };
      eventSource.onerror = (error) => {
        eventSource.close();
      };
      eventSource.onopen = (event) => {
        // console.log('this.eventSource.onopen', event);

        if (endSearch) {
          eventSource._close();
          observer.complete();
        }
        endSearch = true;
      };
    });
  }
  getFile(fileId) {
    const org = sessionStorage.getItem('organization');

    return this.https
      .get(this.baseUrl + '/fileserver/downloadFile/' + fileId + '/' + org, {
        observe: 'response',
        responseType: 'blob',
      })
      .pipe(
        map((response) => {
          return <any>response.body;
        })
      )
      .pipe(catchError(this.handleError));
  }

  getPresignedUrl(fileName: string) {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.baseUrl + '/app/streamFile/' + fileName + '/' + org, {
        observe: 'response',
        responseType: 'text',
      })
      .pipe(
        map((response) => {
          return <any>response.body;
        })
      )
      .pipe(catchError(this.handleError));
  }

  uploadFile2(file, chunkMetadata) {
    const org = sessionStorage.getItem('organization');
    let headers = new HttpHeaders();

    let form = new FormData();
    form.append('file', file);
    form.append('chunkMetadata', JSON.stringify(chunkMetadata));
    //form.append("metadata", JSON.stringify(metadata))

    headers.append('Accept', 'application/json');
    headers.append(
      'Content-Type',
      'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    );

    return this.https
      .post(this.dataUrl + '/service/v1/saveFile/' + org, form)
      .pipe(map((response) => response))
      .pipe(catchError(this.handleError));
  }

  getTextDatasetDetails(dataset: Dataset): Observable<any> {
    let body: any;
    let salt = this.encKey.getSalt();
    if (!salt) salt = sessionStorage.getItem('salt');
    if (dataset.attributes && dataset.attributes.length > 0)
      return from(this.encrypt(dataset.attributes, salt)).pipe(
        switchMap((body) => {
          const org = sessionStorage.getItem('organization');
          return this.https
            .get(
              this.dataUrl + '/datasets/viewData/' + dataset.name + '/' + org,
              {
                observe: 'response',
                responseType: 'text',
                params: { limit: '10' },
                headers: new HttpHeaders().append('attributes', body),
              }
            )
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
        })
      );
    else
      return from(this.encrypt(JSON.stringify(dataset.attributes), salt)).pipe(
        switchMap((body) => {
          const org = sessionStorage.getItem('organization');
          return this.https
            .get(
              this.dataUrl + '/datasets/viewData/' + dataset.name + '/' + org,
              {
                observe: 'response',
                responseType: 'text',
                params: { limit: '10' },
                headers: new HttpHeaders().append('attributes', body),
              }
            )
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
        })
      );
  }
  tagDetails(
    datasetName: string,
    projectName: string,
    taggingDetails,
    ticketIdList: string[],
    updateAction: string,
    searchParams,
    entryCount: string
  ): Observable<string> {
    try {
      let taggingDtls: Object = taggingDetails;
      let taggingDetailsStr: string = JSON.stringify(taggingDtls);
      let bodyObj = Object.assign({
        ticketIdList: ticketIdList,
        taggingDetails: taggingDetailsStr,
        updateAction: updateAction,
      });
      if (searchParams) {
        bodyObj['searchParams'] = JSON.stringify(searchParams);
        bodyObj['entryCount'] = entryCount;
      }
      let body = JSON.stringify(bodyObj);
      let apiParams = { datasetName: datasetName, projectName: projectName };
      return this.https
        .post('/api/aip/datasets/tagDetails', body, {
          params: apiParams,
          responseType: 'text',
        })
        .pipe(
          map((response) => {
            if (
              response &&
              response[0] &&
              response[0].hasOwnProperty('Error: ')
            ) {
              let errorMsg: string = response[0]['Error: '];
              return errorMsg;
            } else {
              return response.toString();
            }
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    } catch (Exception) {
      this.message('Some error occured', 'error');
    }
  }

  getDatasetDetails(dataset: Dataset): Observable<any> {
    let body: any;
    // let body = dataset.attributes
    let salt = this.encKey.getSalt();
    if (!salt) salt = sessionStorage.getItem('salt');
    if (dataset.attributes && dataset.attributes.length > 0)
      return from(this.encrypt(dataset.attributes, salt)).pipe(
        switchMap((body) => {
          const org = sessionStorage.getItem('organization');
          return this.https
            .get(
              this.dataUrl + '/datasets/viewData/' + dataset.name + '/' + org,
              {
                observe: 'response',
                params: { limit: '10' },
                headers: new HttpHeaders().append('attributes', body),
              }
            )
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
        })
      );
    else
      return from(this.encrypt(JSON.stringify(dataset.attributes), salt)).pipe(
        map((body) => {
          const org = sessionStorage.getItem('organization');
          return this.https
            .get(
              this.dataUrl + '/datasets/viewData/' + dataset.name + '/' + org,
              {
                observe: 'response',
                params: { limit: '10' },
                headers: new HttpHeaders().append('attributes', body),
              }
            )
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
        })
      );
  }

  getDirectDatasetDetails(dataset: Dataset, pagination): Observable<any> {
    if (
      dataset.alias == 'Daily Volume_forecast' ||
      dataset.alias == 'Daily Volume'
    ) {
      dataset.taskdetails = null;
    }
    try {
      let tmpParams = pagination.sortEvent
        ? {
          page: pagination.page,
          size: pagination.size,
          sortEvent: pagination.sortEvent,
          sortOrder: pagination.sortOrder,
        }
        : { page: pagination.page, size: pagination.size };
      const org = sessionStorage.getItem('organization');
      return this.https
        .post(
          this.dataUrl +
          '/datasets/direct/viewData/' +
          dataset.alias +
          '/' +
          org,
          dataset,
          { observe: 'response', params: tmpParams }
        )
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
    } catch (Exception) {
      this.messageService('Some error occured', 'Error');
    }
  }

  downloadFile(filePath: string, dataset: Dataset): Observable<any> {
    try {
      this.jwt = JSON.parse(
        String(sessionStorage.getItem('authenticationToken'))
      );
      const options = {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.jwt}`,
          responseType: 'blob as json',
          'Content-Type': 'application/json',
        }),
      };
      return this.https
        .post(this.dataUrl + '/datasets/download/' + filePath, dataset, {
          observe: 'response',
        })
        .pipe(catchError(this.handleError));
    } catch (Exception) {
      this.messageService('Some error occured', 'Error');
    }
  }
  getDatasourcesAliases(): Observable<any> {
    return this.https
      .get(this.dataUrl + '/datasources/names', {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: { org: sessionStorage.getItem('organization') },
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

  getDownloadData(
    datasetName: string,
    projectName: string,
    searchValues,
    chunkSize: string,
    apiCount: string,
    sortEvent: string,
    sortOrder: string,
    fieldsToDownload: string
  ): Observable<string> {
    try {
      let body = searchValues;
      let salt = this.encKey.getSalt();
      if (!salt) salt = sessionStorage.getItem('salt');
      if (searchValues && searchValues.length > 0) {
        return from(this.encrypt(searchValues, salt)).pipe(
          switchMap((encryptedSearchValues) => {
            // searchValues = encryptedSearchValues
            return from(this.encrypt(fieldsToDownload, salt)).pipe(
              switchMap((encryptedFieldsToDownload) => {
                let apiParams = sortEvent
                  ? {
                    datasetName: datasetName,
                    projectName: projectName,
                    chunkSize: chunkSize,
                    apiCount: apiCount,
                    sortEvent: sortEvent,
                    sortOrder: sortOrder,
                  }
                  : {
                    datasetName: datasetName,
                    projectName: projectName,
                    chunkSize: chunkSize,
                    apiCount: apiCount,
                  };
                return this.https
                  .get('/api/aip/datasets/downloadCsvData', {
                    params: apiParams,
                    responseType: 'text/csv' as 'json',
                    headers: new HttpHeaders()
                      .append('searchParams', encryptedSearchValues)
                      .append('fieldsToDownload', encryptedFieldsToDownload),
                  })
                  .pipe(
                    map((response) => {
                      if (
                        response &&
                        response[0] &&
                        response[0].hasOwnProperty('Error: ')
                      ) {
                        let errorMsg: string = response[0]['Error: '];
                        return errorMsg;
                      } else {
                        return response.toString();
                      }
                    })
                  )
                  .pipe(
                    catchError((err) => {
                      return this.handleError(err);
                    })
                  );
              })
            );
          })
        );
      } else {
        return from(this.encrypt(JSON.stringify(searchValues), salt)).pipe(
          switchMap((encryptedSearchValues) => {
            return from(
              this.encrypt(JSON.stringify(fieldsToDownload), salt)
            ).pipe(
              switchMap((encryptedFieldsToDownload) => {
                let apiParams = sortEvent
                  ? {
                    datasetName: datasetName,
                    projectName: projectName,
                    chunkSize: chunkSize,
                    apiCount: apiCount,
                    sortEvent: sortEvent,
                    sortOrder: sortOrder,
                  }
                  : {
                    datasetName: datasetName,
                    projectName: projectName,
                    chunkSize: chunkSize,
                    apiCount: apiCount,
                  };
                return this.https
                  .get('/api/aip/datasets/downloadCsvData', {
                    params: apiParams,
                    responseType: 'text/csv' as 'json',
                    headers: new HttpHeaders()
                      .append('searchParams', encryptedSearchValues)
                      .append('fieldsToDownload', encryptedFieldsToDownload),
                  })
                  .pipe(
                    map((response) => {
                      if (
                        response &&
                        response[0] &&
                        response[0].hasOwnProperty('Error: ')
                      ) {
                        let errorMsg: string = response[0]['Error: '];
                        return errorMsg;
                      } else {
                        return response.toString();
                      }
                    })
                  )
                  .pipe(
                    catchError((err) => {
                      return this.handleError(err);
                    })
                  );
              })
            );
          })
        );
      }
    } catch (Exception) {
      this.messageService('Some error occured', 'Error');
    }
  }
  updateSchema(
    name: any,
    alias: any,
    value: any,
    description?: string,
    formTemplate?: any,
    type?: any,
    capability?: any
  ): Observable<any> {
    try {
      if (name?.length == 0) name = 'new';
      const body = {
        alias: alias,
        description: description,
        schemavalue: JSON.stringify(value),
        formtemplate: JSON.stringify(formTemplate),
        type: type,
        capability: capability
      };
      return this.https
        .post(
          this.baseUrl +
          '/schemaRegistry/add/' +
          name +
          '/' +
          sessionStorage.getItem('organization'),
          body,
          { observe: 'response' }
        )
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
    } catch (Exception) {
      // this.messageService.error("Some error occured", "Error")
    }
  }
  saveSchemaForm(schemaForm): Observable<any> {
    try {
      return this.https
        .post(this.baseUrl + '/schemaRegistry/add/schemaForm', schemaForm, {
          observe: 'response',
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
    } catch (Exception) {
      console.log(Exception);
    }
  }
  deleteSchema(name: any): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .delete(this.baseUrl + '/schemaRegistry/delete/' + name + '/' + org, {
        observe: 'response',
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
  deleteFormTemplate(id: any): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .delete(this.baseUrl + '/schemaRegistry/deleteFormtemplate/' + id, {
        observe: 'response',
      })
      .pipe(
        map((response) => {
          console.log(response);
          return response;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  pushBreadCrumb(item: any) {
    try {
      let stack = [];
      if (sessionStorage.getItem('aip.breadcrumb')) {
        stack = JSON.parse(sessionStorage.getItem('aip.breadcrumb'));
      }
      if (!stack.includes(item)) stack.push(item);
      sessionStorage.setItem('aip.breadcrumb', JSON.stringify(stack));
      return item;
    } catch (Exception) {
      this.message('Some error occured', 'error');
    }
  }

  popBreadCrumb(item: any) {
    try {
      let stack = [];
      if (sessionStorage.getItem('aip.breadcrumb')) {
        stack = JSON.parse(sessionStorage.getItem('aip.breadcrumb'));
        let index = stack.findIndex((x) => x.item.label === item.item.label);
        // stack.splice(index,stack.length-index-1)
        let len = stack.length;
        for (let i = index + 1; i < len; i++) stack.pop();
        sessionStorage.setItem('aip.breadcrumb', JSON.stringify(stack));
      }
    } catch (Exception) {
      this.message('Some error occured', 'error');
    }
  }
  getAllStreamingServicesByOrg(): Observable<any> {
    return this.https
      .get(this.baseUrl + '/streamingServices/allPipelinesByOrg', {
        observe: 'response',
        params: { org: sessionStorage.getItem('organization') },
      })
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

  //to get the projects for copy pipeline
  getProjectNames(): Observable<any> {
    return this.https
      .get('api/projects/names', { observe: 'response' })
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
  copyPipelines(fromproject, toproject, pipelines: any[], projectId) {
    let mapping = {};
    mapping['pipelines'] = pipelines;
    var body = mapping;

    return this.https
      .post(
        '/api/aip/streamingServices/pipelinesCopy/' +
        toproject +
        '/' +
        fromproject +
        '?projectId=' +
        projectId,
        body,
        {
          observe: 'response',
        }
      )
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
  getProjectByName(name): Observable<any> {
    return this.https
      .get(this.dataUrl + '/projects/get/' + name, { observe: 'response' })
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
  exportPipelines(project: any, pipelines: any) {
    return this.https
      .get(this.baseUrl + '/pipeline/getPipelines/' + project, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: { cname: pipelines },
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
  importPipelines(formData) {
    return this.https
      .post(
        '/api/aip/importPipelines/' + sessionStorage.getItem('organization'),
        formData,
        {
          observe: 'response',
        }
      )
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
  fetchInternalJobLenByname(name: string): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
        '/internaljob/jobname/len/' +
        name +
        '/' +
        sessionStorage.getItem('organization')
      )
      .pipe(map((response) => response))
      .pipe(catchError(this.handleError));
  }
  // getinitiatives(questionnaireId, page, size): Observable<any> {
  //   let param = new HttpParams()
  //     .set('questionnaireId', questionnaireId)
  //     .append('page', page)
  //     .append('size', size);
  //   console.warn(this.baseUrl + '/api/aip/ivm/initiatives');
  //   return this.https
  //     .get('/api/aip/ivm/initiatives', {
  //       observe: 'response',
  //       params: param,
  //     })
  //     .pipe(
  //       map((response) => {
  //         return response.body;
  //       })
  //     )
  //     .pipe(
  //       catchError((err) => {
  //         return this.handleError(err);
  //       })
  //     );
  // }
  // getQuestionnaires(): Observable<any> {
  //   return this.https
  //     .get('/api/aip/initiative/list/template/questionnaire', {
  //       observe: 'response',
  //     })
  //     .pipe(
  //       map((response) => {
  //         return response.body;
  //       })
  //     )
  //     .pipe(
  //       catchError((err) => {
  //         return this.handleError(err);
  //       })
  //     );
  // }
  // getTermsCondition(): Observable<any> {
  //   return this.https
  //     .get('/api/aip/initiative/list/template/termnconditions', {
  //       observe: 'response',
  //     })
  //     .pipe(
  //       map((response) => {
  //         return response.body;
  //       })
  //     )
  //     .pipe(
  //       catchError((err) => {
  //         return this.handleError(err);
  //       })
  //     );
  // }
  // getCanvas(): Observable<any> {
  //   return this.https
  //     .get('/api/aip/initiative/list/template/canvas', {
  //       observe: 'response',
  //     })
  //     .pipe(
  //       map((response) => {
  //         return response.body;
  //       })
  //     )
  //     .pipe(
  //       catchError((err) => {
  //         return this.handleError(err);
  //       })
  //     );
  // }

  getSearchCount(
    datasetName: string,
    projectName: string,
    searchValues,
    queryParams?: string
  ): Observable<string> {
    try {
      let searchparams = searchValues;
      let queryParamsValue = null;
      if (queryParams) queryParamsValue = queryParams;
      if (searchValues && searchValues.length > 0) searchparams = searchValues;
      else searchparams = JSON.stringify(searchValues);
      let apiParams = {
        searchParams: searchparams,
        datasetName: datasetName,
        projectName: projectName,
      };
      if (queryParams) {
        apiParams['queryParams'] = queryParamsValue;
      }
      return this.https
        .get('/api/aip/datasets/searchDataCount', {
          params: apiParams,
          responseType: 'text',
        })
        .pipe(
          map((response) => {
            if (response) {
              return response.toString();
            }
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    } catch (Exception) {
      this.message('Some error occured', 'error');
    }
  }

  setSearchValues(searchValues) {
    this.searchValues = searchValues;
  }
  setPaginationValues(paginationValues) {
    this.paginationValues = paginationValues;
  }

  searchTicketsUsingDataset(
    datasetName: string,
    projectName: string,
    pagination,
    searchValues,
    selectClauseParams?: string
  ): Observable<any[] | string> {
    try {
      let searchParamsValue = null;
      let selectClauseParamsValue = null;
      this.setPaginationValues(pagination);
      this.setSearchValues(searchValues);
      if (searchValues && searchValues.length > 0)
        searchParamsValue = searchValues;
      else if (searchValues) {
        searchParamsValue = JSON.stringify(searchValues);
      }
      if (selectClauseParams) selectClauseParamsValue = selectClauseParams;
      let apiParams = pagination.sortEvent
        ? {
          page: pagination.page,
          size: pagination.size,
          sortEvent: pagination.sortEvent,
          sortOrder: pagination.sortOrder,
        }
        : {
          datasetName: datasetName,
          projectName: projectName,
          page: pagination.page,
          size: pagination.size,
        };

      if (selectClauseParams) {
        apiParams['searchParams'] = searchParamsValue;
        apiParams['selectClauseParams'] = selectClauseParamsValue;
        apiParams['datasetName'] = datasetName;
        apiParams['projectName'] = projectName;
      } else {
        apiParams['searchParams'] = searchParamsValue;
        apiParams['datasetName'] = datasetName;
        apiParams['projectName'] = projectName;
      }
      return this.https
        .get('/api/aip/datasets/searchData', {
          params: apiParams,
        })
        .pipe(
          map((response) => {
            if (
              response &&
              response[0] &&
              response[0].hasOwnProperty('Error: ')
            ) {
              let errorMsg: string = response[0]['Error: '];
              return errorMsg;
            } else {
              let responseArray: any[] = [];
              responseArray = <any[]>response;
              return responseArray;
            }
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    } catch (Exception) {
      this.message('Some error occured', 'error');
    }
  }
  triggerEvent(param: any, eventName: any) {
    let org = sessionStorage.getItem('organization');
    return this.https
      .get(this.baseUrl + '/event/trigger/' + eventName, {
        observe: 'response',
        responseType: 'text',
        params: {
          org: localStorage.getItem('organization'),
          param: param,
        },
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

  copyCip(source, target, modules) {
    const body = {
      source: source,
      target: target,
      modules: modules,
    };
    const org = sessionStorage.getItem('organization');
    return this.https
      .post('/api/aip/copyCip/' + org, body, {
        observe: 'response',
        responseType: 'text',
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

  importCip(file) {
    const org = sessionStorage.getItem('organization');
    return this.https
      .post('/api/aip/importCip/' + org, file, {
        observe: 'response',
        responseType: 'text'
      })
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

  exportCip(source, modules) {
    const body = {
      source: source,
      modules: modules,
    };
    const org = sessionStorage.getItem('organization');
    return this.https
      .post('/api/aip/exportCip/' + org, body, {
        observe: 'response',
      })
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

  testcss() {
    return this.https.get(this.baseUrl + '/service/v1/test/css', {
      responseType: 'text',
    });
  }
  getTicketsForRange(
    datasetName: string,
    projectName: string,
    pagination,
    searchValues,
    dateFilter,
    columnName
  ): Observable<Map<any, any> | string> {
    try {
      this.setPaginationValues(pagination);
      this.setSearchValues(searchValues);
      let body = searchValues;
      let salt = this.encKey.getSalt();
      if (!salt) salt = sessionStorage.getItem('salt');
      if (searchValues && searchValues.length > 0)
        body = this.encrypt(searchValues, salt);
      else body = this.encrypt(JSON.stringify(searchValues), salt);
      let apiParams = pagination.sortEvent
        ? {
          datasetName: datasetName,
          projectName: projectName,
          dateFilter: dateFilter,
          columnName: columnName,
          page: pagination.page,
          size: pagination.size,
          sortEvent: pagination.sortEvent,
          sortOrder: pagination.sortOrder,
        }
        : {
          datasetName: datasetName,
          projectName: projectName,
          dateFilter: dateFilter,
          columnName: columnName,
          page: pagination.page,
          size: pagination.size,
        };
      return this.https
        .get('/api/aip/datasets/gettickets', {
          params: apiParams,
          headers: new HttpHeaders().append('searchParams', body),
        })
        .pipe(
          map((response) => {
            if (
              response &&
              response[0] &&
              response[0].hasOwnProperty('Error: ')
            ) {
              let errorMsg: string = response[0]['Error: '];
              return errorMsg;
            } else {
              let responseArray: Map<any, any> = new Map();
              responseArray = <Map<any, any>>response;
              return responseArray;
            }
          })
        )
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    } catch (Exception) {
      this.message('Some error occured', 'error');
    }
  }

  // checklistTemplate(checklist,configName): Observable<any> {
  //   let session: any = sessionStorage.getItem('organization');
  //   let param = new HttpParams().set('organization', session).set('name',configName);
  //   return this.https
  //     .post('/api/aip/initiative/add/checklistTemplate', checklist, {
  //       observe: 'response',
  //       params: param,
  //     })
  //     .pipe(
  //       map((response) => {
  //         return response;
  //       })
  //     )
  //     .pipe(
  //       catchError((err) => {
  //         return this.handleError(err);
  //       })
  //     );
  // }
  // createInitiative(formData): Observable<any> {
  //   let session: any = sessionStorage.getItem('organization');
  //   return this.https
  //     .post('/api/aip/initiative/create', formData, {
  //       observe: 'response',
  //     })
  //     .pipe(
  //       map((response) => {
  //         return response.body;
  //       })
  //     )
  //     .pipe(
  //       catchError((err) => {
  //         return this.handleError(err);
  //       })
  //     );
  // }
  // initiativeList(page,size): Observable<any> {
  //   let session: any = sessionStorage.getItem('organization');
  //   let param = new HttpParams().set('organization', session);
  //   return this.https
  //     .get('/api/aip/initiative/list', { observe: 'response',params:param })
  //     .pipe(
  //       map((response) => {
  //         return response.body;
  //       })
  //     )
  //     .pipe(
  //       catchError((err) => {
  //         return this.handleError(err);
  //       })
  //     );
  // }
  // getInitiative(id): Observable<any> {
  //   let session: any = sessionStorage.getItem('organization');
  //   let param = new HttpParams().set('organization', session);
  //   return this.https
  //     .get('/api/aip/initiative/detail/'+id, { observe: 'response',params:param })
  //     .pipe(
  //       map((response) => {
  //         return response.body;
  //       })
  //     )
  //     .pipe(
  //       catchError((err) => {
  //         return this.handleError(err);
  //       })
  //     );
  // }

  getAiOpsData(endpoint, body, adapterInstance): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    // let adapterInstance = 'AIOPS-Adapter'
    // let adapterInstance = 'AIOPS-Instance'
    // let adapterInstance = 'ITSM-Adapter'
    let isInstance = 'true';
    let param = new HttpParams()
      .set('project', session)
      .set('adapter_instance', adapterInstance)
      .set('isInstance', isInstance);

    return this.https
      .post(this.dataUrl + '/service/aiops/v1/' + endpoint, body, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: param,
      })
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

  getNutanixFileData(datasetName, fileList, org): Observable<any> {
    return this.https.get('/api/aip/datasets/fileData', {
      params: {
        datasetName: datasetName,
        fileName: fileList,
        org: org,
      },
    });
  }


  createTempTextFileforS3(fileData,fileName){
    let body={
      fileData:fileData,
      fileName:fileName
    }
    return this.https
      .post(this.baseUrl + '/fileserver/uploadTempFileFromData',body, {
        observe: 'response',
        responseType: 'text',
      })
      .pipe(
        map((response) => {
          return <any>response.body;
        })
      )
      .pipe(catchError(this.handleError));
  }

  getNutanixFileInfo(datasetName, filename, org): Observable<any> {
    return this.https.get('/api/aip/datasets/fileInfo', {
      params: { datasetName: datasetName, fileName: filename, org: org },
    });
  }

  deleteNutanixFile(
    fileName: string,
    datasetName: string,
    org: string
  ): Observable<any> {
    let param = new HttpParams()
      .set('fileName', fileName)
      .set('datasetName', datasetName)
      .set('org', org);
    return this.https
      .post(
        '/api/aip/datasets/deleteFile',
        {},
        { observe: 'response', responseType: 'text', params: param }
      )
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
  createInitiative(formData): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    return this.https
      .post('/api/aip/initiative/create', formData, {
        observe: 'response',
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
  initiativeList(page, size): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams().set('organization', session);
    return this.https
      .get('/api/aip/initiative/list', { observe: 'response', params: param })
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
  getInitiative(id): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    let param = new HttpParams().set('organization', session);
    return this.https
      .get('/api/aip/initiative/detail/' + id, {
        observe: 'response',
        params: param,
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
  getStatus(jobid) {
    return this.https
      .get('/api/aip/jobs/jobstatus/' + jobid, {
        observe: 'response',
        responseType: 'text',
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

  getEventStatus(corelid) {
    return this.https
      .get('/api/aip/jobs/eventstatus/' + corelid, {
        observe: 'response',
        responseType: 'text',
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

  getVideoDatasets(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/videolist', {
        observe: 'response',
        params: param,
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

  createDashConstant(dash_constant: DashConstant): Observable<DashConstant> {
    const copy = this.convertDashConstant(dash_constant);
    return this.https
      .post('/api/dash-constants', copy, { observe: 'response' })
      .pipe(
        map((response) => {
          return new DashConstant(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  private convertDashConstant(dash_constant: DashConstant): DashConstant {
    const copy: DashConstant = Object.assign({}, dash_constant);
    return copy;
  }

  getConstantByKey(key: string): Observable<any> {
    return this.https
      .get(
        '/api/get-startup-constants/' +
        key +
        '/' +
        sessionStorage.getItem('organization'),
        {
          observe: 'response',
          responseType: 'text',
        }
      )
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

  getDashConstantByKey(key: string, org?): Observable<any> {
    org = org ? org : sessionStorage.getItem('organization');
    return this.https
      .get(
        '/api/get-startup-constants/id/' +
        key +
        '/' +
        org,
        {
          observe: 'response',
          responseType: 'text',
        }
      )
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

  updateDashConstant(dash_constant: DashConstant, isDefault?: boolean): Observable<DashConstant> {
    const copy = this.convertDash(dash_constant);
    return this.https
      .put("/api/dash-constants", copy, { observe: "response" })
      .pipe(
        map((response) => {
          if (!isDefault)
            sessionStorage.setItem("CacheDashConstant", "true");
          return new DashConstant(response.body);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  private convertDash(dash_constant: DashConstant): DashConstant {
    const copy: DashConstant = Object.assign({}, dash_constant);
    return copy;
  }

  // saveUserResponseRai(templateType, templateId, initiativeId, user_response): Observable<any> {
  //   let regBody = {};
  //   let session: any = sessionStorage.getItem('organization');
  //   let param = new HttpParams().set('organization', session).set('type', templateType).set('templateId', templateId).set('userResponse', user_response);
  //   return this.https
  //     .post('/api/aip/initiative/task/save/' + initiativeId, regBody, { observe: 'response', params: param, })
  //     .pipe(
  //       map((response) => {
  //         return response;
  //       })
  //     )
  //     .pipe(
  //       catchError((err) => {
  //         return this.handleError(err);
  //       })
  //     );
  // }
  // compeleteUserResponseRai(templateType, templateId, initiativeId, user_response): Observable<any> {
  //   let regBody = {};
  //   let session: any = sessionStorage.getItem('organization');
  //   let param = new HttpParams().set('organization', session).set('type', templateType).set('templateId', templateId).set('userResponse', user_response);
  //   return this.https
  //     .post('/api/aip/initiative/task/complete/' + initiativeId, regBody, { observe: 'response', params: param, })
  //     .pipe(
  //       map((response) => {
  //         console.log(response);

  //         return response;
  //       })
  //     )
  //     .pipe(
  //       catchError((err) => {
  //         return this.handleError(err);
  //       })
  //     );
  // }
  getModelBySourceId(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/fetchmodels', {
        observe: 'response',
        params: param,
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
  getEndpointBySourceId(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/fetchEndpoint', {
        observe: 'response',
        params: param,
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
  getPipelineByName(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/fetchPipeline', {
        observe: 'response',
        params: param,
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
  getDatasourceByName(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/fetchDatasource', {
        observe: 'response',
        params: param,
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

  getQuickStatsData(param: any): Observable<any> {
    let querparam = new HttpParams().set('parms', JSON.stringify(param));
    console.log("value of querparam", querparam.toString());
    return this.https
      .get('http://victdwast-22:2306/statistics_advisory_details', {
        observe: 'body',
        params: querparam,
      })
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }
  getAllAttributeTypes(recObject: RecipeObject): Observable<any> {
    const parms = new HttpParams().set('parms', JSON.stringify(recObject));
    return this.https.get('', {
      params: parms,
    });
  }
  getAllStories(userId): Observable<any> {
    return this.https.get<any>('' + userId);
  }
  getSingleStoryData(requestObject): Observable<any> {
    const parms = new HttpParams().set('parms', JSON.stringify(requestObject));
    return this.https.get<any>('', {
      params: parms,
    });
  }
  getfilternew(param: any, url: any): Observable<any> {
    let urlnew = url + '/filter_data';
    const paramData = {
      "column_name" : param.column,
      "dataset_name" : param.dataset_name,
      "aip_login" : "True"
    }
    let querparam = new HttpParams().set('parms', JSON.stringify(paramData));
    console.log("value of querparam", querparam.toString());
    return this.https
      .get(urlnew, {
        observe: 'body',
        params: querparam,
      })
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );

}

getFilterList(params): Observable<any> {
  const parms = new HttpParams().set('parms', JSON.stringify(params));
  return this.https.get<any>('', { params: parms });
}
getAllChartTypes(): Observable<any> {
  return observableof(CHARTTYPES);
}

getAllMultivariateChartTypes(): Observable<any> {
  return observableof(MULTI_CHARTTYPES);
}

getSelectedChart(type, chartDetails): Observable<any> {
  const parms = new HttpParams().set('parms', JSON.stringify(chartDetails));
  return this.https.get('' + CHARTAPI[type], {
    params: parms,
  });
}

  executeTransformJobForDatatypeConvert(transformObj): Observable<any> {
    const parms = new HttpParams().set('parms', JSON.stringify(transformObj));
    return this.https.get('', { params: parms });
  }
  getColumnStatistics(
    statsReqObject: StatisticsRequestObject
  ): Observable<any> {
    const parms = new HttpParams().set('parms', JSON.stringify(statsReqObject));
    return this.https.get('', {
      params: parms,
    });
  }

  createBiVariateChartURL(type, chartDetails,paramdata,datasetname) {
    chartDetails.org = sessionStorage.getItem('organization');
    chartDetails.dataset_name = datasetname;
    chartDetails.aip_login = 'True';
    const parms = new HttpParams().set('parms', JSON.stringify(chartDetails));
    return paramdata + '/charts/bivariate' + '?' + parms;
  }
  getBiVariateTableData(reqObject,paramdata,datasetname) {
    reqObject.org = sessionStorage.getItem('organization');
    reqObject.aip_login = 'True';
    reqObject.dataset_name = datasetname;
    const parms = new HttpParams().set('parms', JSON.stringify(reqObject));
    const url = paramdata + '/bivariate_table';
    return this.https.get(url, { params: parms });
  }
  /**createBivariateChartURL(chartDetails) {
    const parms = new HttpParams().set('parms', JSON.stringify(chartDetails));
    return '' + '?' + parms;
  }**/
  createCorrChartURL(chartDetails, type, datasetname, paramdata) {
    chartDetails.org = sessionStorage.getItem('organization');
    chartDetails.dataset_name = datasetname;
    chartDetails.aip_login = 'True';
    const parms = new HttpParams().set('parms', JSON.stringify(chartDetails));
    return paramdata + '/charts'+ CORR_CHART_ENDPOINTS[type] + '?' + parms;
  }
  /**getBivariateTableData(reqObject): Observable<any> {
    const parms = new HttpParams().set('parms', JSON.stringify(reqObject));
    return this.https.get('', { params: parms });
  }**/
  addObjectToStory(storyDetails: StoryObject): Observable<any> {
    return this.https.put('', storyDetails);
  }
  createStor(storyDetails: StoryObject): Observable<any> {
    return this.https.post('', storyDetails);
  }
  deleteStory(requestObject): Observable<any> {
    const parms = new HttpParams().set('parms', JSON.stringify(requestObject));
    return this.https.delete('', { params: parms });
  }
  getChartImage(chartParams): Observable<any> {
    const parms = new HttpParams().set('parms', JSON.stringify(chartParams));
    return this.https.get('http://victdwast-22:2300/screenshot', { params: parms });
  }
  updateStoryDescription(storyObjectToUpdate: StoryObject): Observable<any> {
    return this.https.put('', storyObjectToUpdate);
  }

  dendrogramValidation(chartDetails): Observable<any> {
    const parms = new HttpParams().set('parms', JSON.stringify(chartDetails));
    return this.https.get('', { params: parms });
  }
  createMultiVariateChartURL(chartDetails, type) {
    const parms = new HttpParams().set('parms', JSON.stringify(chartDetails));
    return '' + MULTI_VARIATE_ENDPOINTS[type] + '?' + parms;
  }

  getHelpDocUrl(screenDoc: string): string {
    return `${'http://victeapst-01:8881/idsmlp_help_doc'}${SCREEN_DOC[screenDoc]}`;
  }
  private messageSource = new BehaviorSubject(null);
  currentMessage = this.messageSource.asObservable();

  private messageSourceQuickStat = new BehaviorSubject(null);
  currentMessageQuickStat = this.messageSourceQuickStat.asObservable();

  private messageSourceBivariate = new BehaviorSubject(null);
  currentMessageBivariate = this.messageSourceBivariate.asObservable();

  private messageSourceAnomaly = new BehaviorSubject(null);
  currentMessageAnomaly = this.messageSourceAnomaly.asObservable();

  private messageSourceStories = new BehaviorSubject(null);
  currentMessageStories = this.messageSourceStories.asObservable();

  private messageAllAttributes = new BehaviorSubject(null);
  currentAllAttributes = this.messageAllAttributes.asObservable();

  private messageStoryBoard = new BehaviorSubject(null);
  currentStory = this.messageStoryBoard.asObservable();

  private resizePivot = new BehaviorSubject(true);
  currentResizePivot = this.resizePivot.asObservable();

  private resetPivot = new BehaviorSubject(false);
  currentResetPivot = this.resetPivot.asObservable();

  private displayPivotMsg = new BehaviorSubject(false);
  currentDisplayPivotMsg = this.displayPivotMsg.asObservable();

  private disablePivotActions = new BehaviorSubject(false);
  currentDisablePivotActions = this.disablePivotActions.asObservable();

  private getScreenShots = new BehaviorSubject(false);
  currentgetScreenShots = this.getScreenShots.asObservable();

  private pivotParameters = new BehaviorSubject(null);
  currentPivotParameters = this.pivotParameters.asObservable();

  private saveToStory = new BehaviorSubject(false);
  currentsaveToStory = this.saveToStory.asObservable();

  private multivariateData = new BehaviorSubject(null);
  currentMultivariateState = this.multivariateData.asObservable();

  private pivotDownloadData = new BehaviorSubject(null);
  currentPivotData = this.pivotDownloadData.asObservable();

  private bivariateDownloadData = new BehaviorSubject(null);
  currentBivariateData = this.bivariateDownloadData.asObservable();



  changeMessage(message: Object) {
    this.messageSource.next(message);
  }

  changeMessageQuickStat(message: Object) {
    this.messageSourceQuickStat.next(message);
  }

  changeMessageBivariate(message: Object) {
    this.messageSourceBivariate.next(message);
  }

  changeMessageAnomaly(message: Object) {
    this.messageSourceAnomaly.next(message);
  }

  changeMessageStories(message: Object) {
    this.messageSourceStories.next(message);
  }

  changeAllAttributes(message: Object) {
    this.messageAllAttributes.next(message);
  }

  updateStoryBoard(message: StoryBoardParameter) {
    this.messageStoryBoard.next(message);
  }

  updatePivotResize(minMax: boolean) {
    this.resizePivot.next(minMax);
  }

  updatePivotReset(reset: boolean) {
    this.resetPivot.next(reset);
  }

  updatePivotMsg(reset: boolean) {
    this.displayPivotMsg.next(reset);
  }

  updateDisablePivotFlag(reset: boolean) {
    this.disablePivotActions.next(reset);
  }

  updateGetScreenShots(reset: boolean) {
    this.getScreenShots.next(reset);
  }

  updatePivotParameters(pivots: any) {
    this.pivotParameters.next(pivots);
  }

  updateSaveToStory(reset: boolean) {
    this.saveToStory.next(reset);
  }

  updateMultivariateScreenParameters(screenParameters) {
    this.multivariateData.next(screenParameters);
  }

  setPivotDownloadData(data: any) {
    this.pivotDownloadData.next(data);
  }

  setBivariateDownloadData(data: any) {
    this.bivariateDownloadData.next(data);
  }
  // REGISTER MODEL

  createChartURL(type, chartDetails, regBody, paramdata, datasetname) {
    chartDetails.dataset_name = datasetname;
    chartDetails.aip_login = 'True';
    const parms = new HttpParams().set('parms', JSON.stringify(chartDetails));
    // const parms = new HttpParams().set('params', JSON.stringify(chartDetails)).set('dataset_name', datasetname);
    regBody = '';
    // let gg=paramdata+'/charts'+ CHARTAPI[type];
    return paramdata + '/charts' + CHARTAPI[type] + '?' + parms;
    // return this.https
    //   .get(
    //     gg, {
    //       headers: new HttpHeaders({
    //         'Content-Type': 'application/json; charset=utf-8',
    //       }),

    //       observe: 'response',
    //       params: parms,
    //     }
    //   )
    //   .pipe(
    //     map((response) => {
    //       return response.body['Response'];
    //     })
    //   )
    //   .pipe(
    //     catchError((err) => {
    //       return this.handleError(err);
    //       // return err
    //     })
    //   );
  }

  createMultivariateChartURL(type, chartDetails,regBody,paramdata,datasetname) {
  // const parms = new HttpParams().set('parms', JSON.stringify(chartDetails)).set('dataset_name', datasetname);
  regBody='';
  // let gg=paramdata+'/charts'+ CHARTAPI[type];
  // return paramdata+'/charts'+ CHARTAPI[type]+'?'+parms;
  chartDetails.dataset_name = datasetname;
  chartDetails.aip_login = 'True';
  const parms = new HttpParams().set('parms', JSON.stringify(chartDetails));
  return paramdata + '/charts' + CHARTAPI[type] + '?' + parms;
  // return this.https
  //   .get(
  //     gg, {
  //       headers: new HttpHeaders({
  //         'Content-Type': 'application/json; charset=utf-8',
  //       }),

  //       observe: 'response',
  //       params: parms,
  //     }
  //   )
  //   .pipe(
  //     map((response) => {
  //       return response.body['Response'];
  //     })
  //   )
  //   .pipe(
  //     catchError((err) => {
  //       return this.handleError(err);
  //       // return err
  //     })
  //   );
 }
 getcharthistogram( paramdata,regBody){
  // const parms = new HttpParams().set('parms', JSON.stringify(chartDetails));
  // return 'http://victdwast-22:2302/charts' + CHARTAPI[type] + '?' + parms;
    // return 'http://localhost:5000/charts/hbar' + '?' + parms;
    let datasetname = regBody;
    regBody = '';
    let gg = paramdata;
    return this.https
      .get(
        gg,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),

          observe: 'response',

        }
      )
      .pipe(
        map((response) => {
          return response.body['Response'];
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
          // return err
        })
      );

  }
  getAttributeCharts(chartDetails, regBody, paramdata, datasetname): Observable<any> {
    const parms = new HttpParams().set('parms', JSON.stringify(chartDetails));
    let idsmlUrl = paramdata + '/quick_stats';
    return this.https
      .get(
        idsmlUrl,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),

          observe: 'response',
          params: parms,
        }
      )
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
          // return err
        })
      );

  }
  quickStat2(regBody: any, paramdata: any, datasetname: any, org: any): Observable<any> {

    const parms = new HttpParams().set('parms', JSON.stringify(datasetname));
    //let dataUrl = "https://victdwast-24.ad.infosys.com:8092/db/quick_stats_for_s3bucket";
    let dataUrl = paramdata + '/db/quick_stats_for_s3bucket';
    return this.https
      .get(dataUrl, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: parms,
      })
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

  getAllAttributeTypes2(paramdata: any, realparamdata: any): Observable<any> {
    // const parms = new HttpParams().set('dataset_name', JSON.stringify(realparamdata));
    let regBody = '';
    const parms = new HttpParams().set('parms', JSON.stringify(realparamdata));
    let dataUrl = paramdata + '/data_catalog/data/preview';
    return this.https
      .get(dataUrl, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
        params: parms,
      }
      )
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

  pyjob(org: string): Observable<any> {
    let param = new HttpParams()
      .set('org', org);
    return this.https.post('api/aip/datasets/jobExecutor', {}, { observe: 'response', responseType: 'text', params: param })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  multivariateUrl(org: string): Observable<any> {
    let param = new HttpParams()
      .set('org', org);
    return this.https.post('api/aip/datasets/multivariateUrl', {}, { observe: 'response', responseType: 'text', params: param })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

errorMessage(msg: any, msgtype: any = 'error') {
  let message = {
    message: msg,
    button: false,
    type: msgtype,
    // successButton: 'Ok',
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
getPivotTableData(urlString: any, requestObject,datasetname:any,org): Observable<any> {
  // const parms = new HttpParams().set('params', JSON.stringify(requestObject)).set('dataset_name', datasetname).set('org',org);
  // return this.https.get(COMMON_URLS.PIVOT_TABLE_DATA, { params: parms });
  requestObject.dataset_name = datasetname;
  requestObject.aip_login = 'True';
  const parms = new HttpParams().set('parms', JSON.stringify(requestObject));
  return this.https.get(urlString + '/db/pivot_table_for_s3bucket' , { params: parms });
}
  // errorMessage(msg: any, msgtype: any = 'error') {
  //   let message = {
  //     message: msg,
  //     button: false,
  //     type: msgtype,
  //     // successButton: 'Ok',
  //     errorButton: 'Cancel',
  //   };
  //   this.matSnackbar.openFromComponent(MessageBarComponent, {
  //     data: message,
  //     duration: 5000,
  //     horizontalPosition: 'center',
  //     verticalPosition: 'top',
  //     panelClass: '',
  //   });
  // }
  // getPivotTableData(requestObject): Observable<any> {
  //   const parms = new HttpParams().set('parms', JSON.stringify(requestObject));
  //   return this.https.get(COMMON_URLS.PIVOT_TABLE_DATA, { params: parms });
  // }
  saveStory(organization: any, datasetName: any, storyType: any, reqBody: any) {
    const parms = new HttpParams()
      .set('org', organization)
      .set('dataset_id', datasetName)
      .set('toSave', storyType)
    return this.https
      .post(this.baseUrl + '/datasets/idsmldata/save', reqBody, {
        observe: 'response',
        params: parms
      })
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
  updateStory(organization: any, datasetName: any, storyType: any, reqBody: any) {
    const parms = new HttpParams()
      .set('org', organization)
      .set('dataset_id', datasetName)
      .set('toSave', storyType)
    return this.https
      .post(this.baseUrl + '/datasets/idsmldata/update', reqBody, {
        observe: 'response',
        params: parms
      })
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
  getStoryList(datasetName: any, organization: any): Observable<any> {
    const param = new HttpParams()
      .set('dataset_id', datasetName)
      .set('org', organization)
    return this.https
      .get(this.dataUrl + '/datasets/list/stories', {
        observe: 'response',
        params: param,
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

  public getMfeAppConfig(): Observable<CustomManifest> {
    return Observable.create((observer) => {
      this.https.get<CustomManifest>(sessionStorage.getItem("contextPath") + 'assets/json/mf.manifest.json').subscribe((response) => {
        return observer.next(response);
      });
    });
  }
publishPipeline(streamItem): Observable<any> {
  let name = streamItem.name;
  let org = sessionStorage.getItem('organization');
  let type = streamItem.type;
  return this.https.post(
    this.dataUrl +
      '/service/v1/pipeline/publish/' +
      name +
      '/' +
      org+
      '/' +
      type,{},
    {
      observe: 'response',
      responseType: 'text',
    }
  )
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

startGeneration(prompt){
  let org = sessionStorage.getItem('organization');
  return this.https.post(
    this.dataUrl +
      '/service/v1/pipeline/startGeneration/' +
      org,{},
    {
      observe: 'response',
      responseType: 'text',
    }
  )
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

  getRatingByUserAndModule(module: String): Observable<any> {
    let org = sessionStorage.getItem('organization');
    let user = JSON.parse(sessionStorage.getItem('user')).id;
    return this.https.get(this.dataUrl + '/rating/getByUserAndModule/' + user + '/' +
       module + '/' + org,
      {
        observe: 'response',
      }
    )
      .pipe(map((response) => { return response; }))
      .pipe(catchError((err) => { return this.handleError(err); })
      );
  }

  getRatingModules(): Observable<any> {
    let org = sessionStorage.getItem('organization');
    let user = JSON.parse(sessionStorage.getItem('user')).id;
    return this.https.get(this.dataUrl + '/rating/getAllModule/' + user + '/' + org,
      {
        observe: 'response',
      }
    )
      .pipe(map((response) => { return response.body; }))
      .pipe(catchError((err) => { return this.handleError(err); })
      );
  }

  getAllRatingByUser(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/rating/getAllByUserAndOrg', {
        observe: 'response',
        params: param,
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

  getAllRatingByUserCount(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/rating/getAllCountByUserAndOrg', {
        observe: 'response',
        params: param,
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

  deleteRatingByElement(element: string, module: string): Observable<any> {
    const org = sessionStorage.getItem('organization');
    let param = new HttpParams()
    .set('element', element)
    .set('module', module)
    .set('org', org);
    return this.https.delete(this.dataUrl + '/rating/deleteRatingByElementAndOrg',
      { observe: 'response', responseType: 'text', params: param }
    )
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

  saveRating(body): Observable<any>{
    return this.https
      .post(this.dataUrl + '/rating/add', body, {
        observe: 'response',
      })
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

    // uploadFileToServer(formData: FormData): Observable<any> {
    //   try {
    //     return this.https.post('/api/aip/fileserver/uploadTemp', formData, { observe: 'response' ,reportProgress: true})
    //       .pipe(response => {
    //         return response;
    //       })
    //       .pipe(catchError(err => {
    //         return this.handleError(err);
    //       }));
  
    //   }
    //   catch (Exception) {
    //     //   this.messageService.error("Some error occured", "Error")
    //   }
  
    // }

}

export type CustomRemoteConfig = RemoteConfig & {
  exposedModule: string;
  routePath: string;
  ngModuleName: string;
  remoteEntry: string;
  type: string;
  elementName: string;
  remoteName: string;
};
export class AddPorts{

  datasourceid:String
  endport:String
  exiendport:String
  existartport:String
  isDefaultPort:boolean
  isExiPort:boolean
  organization:String
  startport:String
  
}
export type CustomManifest = Manifest<CustomRemoteConfig>;