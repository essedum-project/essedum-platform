import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Datasource } from '../datasource/datasource';
import { Manifest, RemoteConfig } from '@angular-architects/module-federation';
import { encKey } from './encKey';
import { Dataset } from '../dataset/datasets';
import { StreamingServices } from '../streaming-services/streaming-service';
import { DashConstant } from '../DTO/dash-constant';
import { App } from '../apps/app';
import { AipSnackbarCustomService } from '../sharedModule/services/aip-snackbar-custom.service';

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
    private encKey: encKey,
    private customSnackbar: AipSnackbarCustomService
  ) {}


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

  deleteDatasource(name): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .delete(this.dataUrl + '/datasources/delete/' + name + '/' + org, {
        observe: 'response',
        params: { organization: sessionStorage.getItem('organization') },
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

  deleteRuntimes(name) {
    const org = sessionStorage.getItem('organization');
    return this.https
      .delete(this.dataUrl + '/runtime/delete/' + name + '/' + org, {
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

  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    const errMsg = error.error;
    console.error(errMsg); // log to console instead
    if (error.status === 401) {
      window.location.href = '/';
    }
    return throwError(errMsg);
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

  getDatasourcePort(id: any): Observable<any> {
    return this.https
      .get(this.dataUrl + '/runtime/get/connection?connid=' + id, {
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

  getAvailablePorts(id: any): Observable<any> {
    return this.https
      .get(this.dataUrl + '/runtime/get/available-ports?connid=' + id, {
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

  messageService(resp: any, msg?: any) {
    this.customSnackbar.handleResponse(resp, msg);
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

  message(msg: any, msgtype: any = 'success') {
    // Use the new custom snackbar service for better styling
    if (msgtype === 'success') {
      this.customSnackbar.success(msg);
    } else if (msgtype === 'error') {
      this.customSnackbar.error(msg);
    } else if (msgtype === 'warning') {
      this.customSnackbar.warning(msg);
    } else {
      this.customSnackbar.info(msg);
    }
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
              // Replace the usage of this.encKey.getSalt() with direct retrieval from sessionStorage or another secure source.
              // The original code uses this.encKey.getSalt() to get the salt value for decryption.
              // If encKey is not defined or not needed, you can directly get the salt from sessionStorage:
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
          // Replace the usage of this.encKey.getSalt() with direct retrieval from sessionStorage or another secure source.
          // The original code uses this.encKey.getSalt() to get the salt value for decryption.
          // If encKey is not defined or not needed, you can directly get the salt from sessionStorage:
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

  messageNotificaionService(type: string, msg: string) {
    // Use the new custom snackbar service for better styling
    const config = { duration: 2500 }; // Shorter duration for notifications

    if (type === 'success') {
      this.customSnackbar.success(msg, undefined, config);
    } else if (type === 'error') {
      this.customSnackbar.error(msg, undefined, config);
    } else if (type === 'warning') {
      this.customSnackbar.warning(msg, undefined, config);
    } else {
      this.customSnackbar.info(msg, undefined, config);
    }
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
        capability: capability,
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

  getNutanixFileData(datasetName, fileList, org): Observable<any> {
    return this.https.get('/api/aip/datasets/fileData', {
      params: {
        datasetName: datasetName,
        fileName: fileList,
        org: org,
      },
    });
  }
  getModelFileData(datasetName, fileList, org): Observable<any> {
    const params = new HttpParams()
      .set('modelName', datasetName)
      .set('fileName', fileList)
      .set('org', org)

    return this.https.get('/api/aip/service/v1/models/fileData', {
      params,
      responseType:'blob'
    });
  }


  getRatingByUserAndModule(module: String): Observable<any> {
    let org = sessionStorage.getItem('organization');
    let user = JSON.parse(sessionStorage.getItem('user')).id;
    return this.https
      .get(
        this.dataUrl +
        '/rating/getByUserAndModule/' +
        user +
        '/' +
        module +
        '/' +
        org,
        {
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

  // CRADS
  getModelCards(param: HttpParams): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl + '/service/v1/models/list/' + session, {
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
    let session: any = sessionStorage.getItem('organization');

    return this.https
      .get(this.dataUrl + '/service/v1/models/count/' + session, {
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

  // REGISTER MODEL
  registerModel(regBody: any, adapter?: any): Observable<any> {
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

  //Fetch Model datasource filter list
  getModelDatasourceList(param: HttpParams): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl + '/service/v1/models/getfilters/' + session, {
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

  //get model list with filter and search
  getModelListWithFilterAndSearch(param: HttpParams): Observable<any> {
    let session: any = sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl + '/service/v1/models/list/' + session, {
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

  getModelBySourceId(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/models/getModel', {
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

  //read native file
  readNativeFile(cname, org, filename): Observable<any> {
    return this.https.get(this.baseUrl + '/file/read/' + cname + '/' + org, {
      params: { file: filename },
      responseType: 'arraybuffer',
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
    return this.https
      .get(this.baseUrl + '/plugin/allPluginsByOrg/' + org, {
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

  readAllScriptsInFolder(name): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https.get(
      this.dataUrl + '/service/v1/streamingServices/readAllScripts',
      { params: { name: name, org: org }, observe: 'response' }
    );
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

  //for pipeline runtypes
  fetchJobRunTypes(): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl + '/service/v1/jobs/runtime/types/' + org)
      .pipe((resp: any) => resp);
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
          params: {
            param: params,
            alias: alias,
            datasource: datasource,
            workerlogId: workerlogId,
          },
          responseType: 'text',
        }
      )

      .pipe(map((response) => response))
      .pipe(catchError(this.handleError));
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

  publishPipeline(streamItem): Observable<any> {
    let name = streamItem.name;
    let org = sessionStorage.getItem('organization');
    let type = streamItem.type;
    return this.https
      .post(
        this.dataUrl +
        '/service/v1/pipeline/publish/' +
        name +
        '/' +
        org +
        '/' +
        type,
        {},
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

  //console-tab stopPipeline
  stopPipeline(jobid): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/jobs/stopJob/' + jobid, {
        observe: 'response',
      })
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

  //job-data-viewer findByCoreid
  downloadPipelineLog(id): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/file/download/log/pipeline', {
        params: { id: id },
        responseType: 'blob',
      })
      .pipe((resp: any) => resp);
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

  setSearchValues(searchValues) {
    this.searchValues = searchValues;
  }
  setPaginationValues(paginationValues) {
    this.paginationValues = paginationValues;
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

  errorMessage(msg: any, msgtype: any = 'error') {
    // Use the new custom snackbar service for better styling
    if (msgtype === 'error') {
      this.customSnackbar.error(msg);
    } else if (msgtype === 'warning') {
      this.customSnackbar.warning(msg);
    } else {
      this.customSnackbar.info(msg);
    }
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

  // Apps

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

  private convertDashConstant(dash_constant: DashConstant): DashConstant {
    const copy: DashConstant = Object.assign({}, dash_constant);
    return copy;
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

  deleteApp(id: Number) {
    return this.https.delete(this.baseUrl + '/app/delete/' + id);
  }

  public getMfeAppConfig(): Observable<CustomManifest> {
    return Observable.create((observer) => {
      this.https
        .get<CustomManifest>(
          sessionStorage.getItem('contextPath') + 'assets/json/mf.manifest.json'
        )
        .subscribe((response) => {
          return observer.next(response);
        });
    });
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

  readScriptFile(cname, filename): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https.get(this.baseUrl + '/file/read/' + cname + '/' + org, {
      params: { file: filename },
      responseType: 'arraybuffer',
    });
  }

  fetchJobRunTypes2(): Observable<string> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.baseUrl + '/jobs/runtime/types/' + org)
      .pipe((resp: any) => resp);
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

  createTempTextFileforS3(fileData, fileName) {
    let body = {
      fileData: fileData,
      fileName: fileName,
    };
    return this.https
      .post(this.baseUrl + '/fileserver/uploadTempFileFromData', body, {
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

  testConnectionForModels(model: any, uploadFileName: any): Observable<any> {
    let params = new HttpParams();
    if (uploadFileName) {
      params = params.set('fileUploaded', uploadFileName);
    }
    return this.https.post(this.dataUrl + '/service/v1/models/upload', model, {
      observe: 'response',
      responseType: 'text',
      params: params
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  fetchModelDetails(id: any): Observable<any> {
    let param = new HttpParams()
      .set('modelid', id)
      .set('project', sessionStorage.getItem('organization'));
    return this.https
      .get(this.dataUrl + '/service/v1/models/getModel', {
        observe: 'response',
        params: param
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
export class AddPorts {
  datasourceid: String;
  endport: String;
  exiendport: String;
  existartport: String;
  isDefaultPort: boolean;
  isExiPort: boolean;
  organization: String;
  startport: String;
}
export type CustomManifest = Manifest<CustomRemoteConfig>;
