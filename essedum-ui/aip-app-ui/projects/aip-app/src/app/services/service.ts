import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, NgZone } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Datasource } from '../datasource/datasource';
import { Manifest, RemoteConfig } from '@angular-architects/module-federation';
import { encKey } from './encKey';
import { Dataset } from '../dataset/datasets';
import { StreamingServices } from '../streaming-services/streaming-service';


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
    private zone: NgZone,
    private encKey: encKey,
  ) { }


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
          return response.body;
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
        this.matSnackbar.open(message.message, 'Ok', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: message.type === 'error' ? 'mat-warn' : '',
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
        this.matSnackbar.open(message.message, 'Ok', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: message.type === 'error' ? 'mat-warn' : '',
        });
      } else {
        let message = {
          message: msg ? msg : resp.body.status,
          button: false,
          type: 'success',
          successButton: 'Ok',
          errorButton: 'Cancel',
        };
        this.matSnackbar.open(message.message, 'Ok', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: message.type === 'error' ? 'mat-warn' : '',
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
      this.matSnackbar.open(message.message, 'Ok', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: message.type === 'error' ? 'mat-warn' : '',
      });
    } else {
      let message = {
        message: resp.error ? resp.error : resp,
        button: false,
        type: 'error',
        successButton: 'Ok',
        errorButton: 'Cancel',
      };
      this.matSnackbar.open(message.message, 'Ok', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: message.type === 'error' ? 'mat-warn' : '',
      });
    }
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
    let message = {
      message: msg,
      button: false,
      type: msgtype,
      successButton: 'Ok',
      errorButton: 'Cancel',
    };
    this.matSnackbar.open(message.message, 'Ok', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: message.type === 'error' ? 'mat-warn' : '',
    });
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
    let message = {
      message: msg,
      button: false,
      type: type,
      successButton: 'Ok',
      errorButton: 'Cancel',
    };
    this.matSnackbar.open(message.message, 'Ok', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: '',
    });
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
    return this.https.get(this.baseUrl + '/plugin/allPluginsByOrg/' + org, {
      observe: 'response'
    })
      .pipe(map(response => { return response.body }))
      .pipe(catchError(error => { return this.handleError(error) }));
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
          params: { param: params, alias: alias, datasource: datasource, workerlogId: workerlogId },
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
    return this.https.post(
      this.dataUrl +
      '/service/v1/pipeline/publish/' +
      name +
      '/' +
      org +
      '/' +
      type, {},
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

  datasourceid: String
  endport: String
  exiendport: String
  existartport: String
  isDefaultPort: boolean
  isExiPort: boolean
  organization: String
  startport: String

}
export type CustomManifest = Manifest<CustomRemoteConfig>;