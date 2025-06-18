import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, NgZone } from '@angular/core';
import { Observable, Subject, from, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import { encKey } from '../services/encKey';

import { Dataset } from './datasets';
@Injectable()
export class DatasetServices {
  datasetsFetched: any;
  private jwt: any;
  corelId
  private options = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
  static readonly SCENES = 'scenes';
  static readonly DATA = 'data';
  static readonly MAX_DB_COUNT = 100;
  private dbPrefix = '';
  private datasetName: string;
  private formData: any;
  public dataRefreshed1 = new Subject<number>()
  public dataRefreshed2 = new Subject<any>();

  constructor(
    private https: HttpClient,
    @Inject('dataSets') private dataUrl: string,
    @Inject('envi') private baseUrl: string,
    private matSnackbar: MatSnackBar,
    private encKey: encKey,
    private zone: NgZone
  ) { }

  async decryptUsingAES256(cipherResponse, password) {
    let cipherJson = JSON.parse(cipherResponse);
    const result = await this.decryptgcm(cipherJson["ciphertext"], cipherJson["iv"], password)

    return result;
  }
  async decryptgcm(ciphertext, iv, password) {
    const decodedCiphertext = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const decodedIV = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

    const algorithm = {
      name: 'AES-GCM',
      iv: decodedIV
    };

    const importedKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      algorithm,
      false,
      ['decrypt']
    )

    const decryptedData = await crypto.subtle.decrypt(algorithm, importedKey, decodedCiphertext);
    const decryptedText = new TextDecoder().decode(decryptedData);

    return decryptedText;

  }

  private handleError(error: any) {
    const errMsg = error.error;
    console.error(errMsg);
    if (error.status === 401) {
      window.location.href = '/';
    }
    return throwError(errMsg);
  }

  createDataset(dataset: Dataset): Observable<any> {
    dataset.organization = String(sessionStorage.getItem('organization'));


    return this.https.post(this.dataUrl + '/datasets/add', dataset, { observe: 'response' })
      .pipe(switchMap(async (response) => {
   
        let result = response.body;
        let salt = this.encKey.getSalt()
        if (!salt)
          salt = sessionStorage.getItem("salt")
        result['attributes'] = await this.decryptUsingAES256(result['attributes'], salt)
        return result;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  createDatasetApprovalForExperiment(datasetId, user, requestedDate, status): Observable<any> {
    try {
      let form = new FormData();
      var datasetApproval = {
        "datasetId": datasetId,
        "userId": user,
        "requestedDate": requestedDate,
        "status": status
      }
      let projectId = JSON.parse(String(sessionStorage.getItem('project'))).id;
      let portfolioId = JSON.parse(String(sessionStorage.getItem('project'))).portfolioId.id;
      form.append("datasetApproval", JSON.stringify(datasetApproval))
      form.append("projectId", JSON.stringify(projectId))
      form.append("portfolioId", JSON.stringify(portfolioId))
      let headers = new HttpHeaders();
      headers.append('Accept', 'application/json');
      headers.append("Content-Type", 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');

      return this.https.post(this.dataUrl + '/exp/dataset/createDatasetApproval', form, { observe: 'response', responseType: "text", headers: headers })
        .pipe(switchMap(async (response) => {
       
          let result = JSON.parse(response.body);
          let salt = this.encKey.getSalt()
          if (!salt)
            salt = sessionStorage.getItem("salt")
          result.attributes = await this.decryptUsingAES256(result.attributes, salt)
          return result;
        }))
        .pipe(catchError(err => {
          return this.handleError(err);
        }));

    }
    catch (Exception) {
     
    }

  }

  addGroupModelEntity(name: String, groups, organization: String): Observable<any> {
    return this.https.post(this.dataUrl + '/entities/add/dataset/' + organization + '/' + name, groups, { observe: 'response' })
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  testConnection(dataset: Dataset): Observable<any> {
    dataset.organization = String(sessionStorage.getItem('organization'));
    return this.https.post(this.dataUrl + '/datasets/test', dataset, { observe: 'response', responseType: 'text' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  deleteFileFromServer(body: any): Observable<any> {
    try {
      return this.https.post('/api/aip/fileserver/deleteTemp', body, { observe: 'response' })
        .pipe(response => {
          return response;
        })
        .pipe(catchError(err => {
          return this.handleError(err);
        }));

    }
    catch (Exception) {
    }

  }

  getPaginatedDatasetGroups(page, size): Observable<any> {
    return this.https.get(this.dataUrl + '/groups/paginated/all', {
      params: { page: page, size: size, org: sessionStorage.getItem("organization") }
    })
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getGroupsForEntity(name: string): Observable<any> {
    return this.https.get(this.dataUrl + '/groups/all/dataset/' + name, { observe: 'response', params: { org: sessionStorage.getItem("organization"), } })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  getDatasetsByOrganizationAndSchema(schema: string): Observable<any | string> {
    return this.https.get(this.dataUrl + '/datasets/schema/' + sessionStorage.getItem("organization"),
      {
        observe: 'response',
        params: { schema: schema }
      })
      .pipe(switchMap(async (response) => {
        let result = response.body as Array<any>;
        result.forEach(async res => {
          let salt = this.encKey.getSalt()
          if (!salt)
            salt = sessionStorage.getItem("salt")
          res.attributes = await this.decryptUsingAES256(res.attributes, salt)
        })
        return result;
      }))
      .pipe(catchError(err => this.handleError(err)));

  }
  getDataset(name: string): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/' + name + '/' + sessionStorage.getItem("organization"), { observe: 'response' })
      .pipe(switchMap(async (response) => {
    
        let result = response.body;
        if (result) {
          let salt = this.encKey.getSalt()
          if (!salt)
            salt = sessionStorage.getItem("salt")
          result['attributes'] = await this.decryptUsingAES256(result['attributes'], salt)
        }

        return result;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  getDatasetJson(): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/types', { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  uploadFileToServer(formData: FormData): Observable<any> {
    try {
      return this.https.post('/api/aip/fileserver/uploadTemp', formData, { observe: 'response' })
        .pipe(response => {
          return response;
        })
        .pipe(catchError(err => {
          return this.handleError(err);
        }));

    }
    catch (Exception) {
    }

  }

  uploadMultipleFilesToServer(formData: FormData): Observable<any> {
    try {
      return this.https.post('/api/aip/fileserver/uploadMultipleFile', formData, { observe: 'response' })
        .pipe(response => {
          return response;
        })
        .pipe(catchError(err => {
          return this.handleError(err);
        }));

    }
    catch (Exception) {
      this.message("Some error occured while uploading multiple files", "Error")
    }
  }

  public generateFileId(org): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/generate/fileid?org=' + org, {
      observe: 'response', responseType: 'text'
    })
      .pipe(map(res => {
        return res.body;
      }))
      .pipe(catchError(err => {

        return this.handleError(err);
      }));
  }
  uploadFile(formData: FormData, fileid): Observable<any> {
    try {
      let body = JSON.stringify(formData)
      return this.https.post(this.dataUrl + '/datasets/upload/' + fileid + '/' + sessionStorage.getItem('organization'), formData, { observe: 'response' })
        .pipe(response => {
          return response;
        })
        .pipe(catchError(err => {
          return this.handleError(err);
        }));

    }
    catch (Exception) {
    }

  }
  messageService(resp: any, msg?: any) {
    console.log(resp);
    if (resp.status == 200) {
      if (
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
          panelClass: message.type === 'error' ? 'snackbar-error' : 'snackbar-success',
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
          panelClass: message.type === 'error' ? 'snackbar-error' : 'snackbar-success',
        });
      }
    }
    else if (resp.text == 'success') {
      let message = {
        message: "Tags Updated Successfully",
        button: false,
        type: 'success',
        successButton: 'Ok',
        errorButton: 'Cancel',
      };
      this.matSnackbar.open(message.message, 'Ok', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: message.type === 'error' ? 'snackbar-error' : 'snackbar-success',
      });
    }
    else {
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
        panelClass: message.type === 'error' ? 'snackbar-error' : 'snackbar-success',
      });
    }
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
      panelClass: message.type === 'error' ? 'snackbar-error' : 'snackbar-success',
    });
  }

  getDatasetByNameAndOrg(name: string): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/get/' + name + '/' + sessionStorage.getItem("organization"), { observe: 'response' })
      .pipe(switchMap(async (response) => {
        let result = response.body as Array<any>;
        let salt = this.encKey.getSalt()
        if (!salt)
          salt = sessionStorage.getItem("salt")
        result['attributes'] = await this.decryptUsingAES256(result['attributes'], salt)
        return result;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  checkVisualizeSupport(datasetName): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/isVisualizationSupported/' + datasetName + '/' + sessionStorage.getItem("organization"), { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  popBreadCrumb(item: any) {
    try {

      let stack = [];
      if (sessionStorage.getItem("icip.breadcrumb")) {
        stack = JSON.parse(sessionStorage.getItem("icip.breadcrumb"))
        let index = stack.findIndex(x => x.item.alias === item.item.alias)
        let len = stack.length
        for (let i = index + 1; i < len; i++)
          stack.pop()
        sessionStorage.setItem("icip.breadcrumb", JSON.stringify(stack))
      }

    }
    catch (Exception) {
      this.message("Some error occured", "Error")
    }
  }
  async encrypt(plaintext, password) {

    const encryptedData = await this.encryptgcm(plaintext, password);

    return JSON.stringify(encryptedData);

  }

  async encryptgcm(plaintext, password) {
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const algorithm = {
      name: 'AES-GCM',
      iv: iv
    };

    const importedKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      algorithm,
      false,
      ['encrypt']
    );

    const encodedText = new TextEncoder().encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt(algorithm, importedKey, encodedText);

    const ciphertextArray = Array.from(new Uint8Array(ciphertext));
    const encodedCiphertext = btoa(String.fromCharCode.apply(null, ciphertextArray));

    const encodedIV = btoa(Array.from(iv).map((byte) => String.fromCharCode(byte)).join(''));

    const encryptedJSON = { ciphertext: encodedCiphertext, iv: encodedIV }

    return encryptedJSON;
  }

  getTextDatasetDetails(dataset: Dataset): Observable<any> {
    let body: any
    let salt = this.encKey.getSalt()
    if (!salt)
      salt = sessionStorage.getItem("salt")
    if (dataset.attributes && dataset.attributes.length > 0)
      return from(this.encrypt(dataset.attributes, salt)).pipe(
        switchMap((body) => {
          const org = sessionStorage.getItem("organization");
          return this.https.get(this.dataUrl + '/datasets/viewData/' + dataset.name + '/' + org,
            { observe: 'response', responseType: 'text', params: { limit: '10' }, headers: new HttpHeaders().append("attributes", body) })
            .pipe(map(response => {
              return response.body;
            }))
            .pipe(catchError(err => {
              return this.handleError(err);
            }));
        }));
    else
      return from(this.encrypt(JSON.stringify(dataset.attributes), salt)).pipe(
        switchMap((body) => {
          const org = sessionStorage.getItem("organization");
          return this.https.get(this.dataUrl + '/datasets/viewData/' + dataset.name + '/' + org,
            { observe: 'response', responseType: 'text', params: { limit: '10' }, headers: new HttpHeaders().append("attributes", body) })
            .pipe(map(response => {
              return response.body;
            }))
            .pipe(catchError(err => {
              return this.handleError(err);
            }));
        }));
    
  }

  getDatasetDetails(dataset: Dataset): Observable<any> {
    let body: any;
    let salt = this.encKey.getSalt()
    if (!salt)
      salt = sessionStorage.getItem("salt")
    if (dataset.attributes && dataset.attributes.length > 0)
      return from(this.encrypt(dataset.attributes, salt)).pipe(
        switchMap((body) => {
          const org = sessionStorage.getItem("organization");
          return this.https.get(this.dataUrl + '/datasets/viewData/' + dataset.name + '/' + org,
            { observe: 'response', params: { limit: '10' }, headers: new HttpHeaders().append("attributes", body) })
            .pipe(map(response => {
              return response.body;
            }))
            .pipe(catchError(err => {
              return this.handleError(err);
            }));
        }));
    else
      return from(this.encrypt(JSON.stringify(dataset.attributes), salt)).pipe(
        map((body) => {
          const org = sessionStorage.getItem("organization");
          return this.https.get(this.dataUrl + '/datasets/viewData/' + dataset.name + '/' + org,
            { observe: 'response', params: { limit: '10' }, headers: new HttpHeaders().append("attributes", body) })
            .pipe(map(response => {
              return response.body;
            }))
            .pipe(catchError(err => {
              return this.handleError(err);
            }));
        }));
    
  }
  getDirectDatasetDetails(dataset: Dataset, pagination): Observable<any> {
    if (dataset.alias == "Daily Volume_forecast" || dataset.alias == "Daily Volume") {
      dataset.taskdetails = null
    }
    try {
      let tmpParams = (pagination.sortEvent) ? { page: pagination.page, size: pagination.size, sortEvent: pagination.sortEvent, sortOrder: pagination.sortOrder }
        : { page: pagination.page, size: pagination.size }
      const org = sessionStorage.getItem("organization");
      return this.https.post(this.dataUrl + '/datasets/direct/viewData/' + dataset.alias + '/' + org, dataset,
        { observe: 'response', params: tmpParams })
        .pipe(map(response => {
          return response.body;
        }))
        .pipe(catchError(err => {
          return this.handleError(err);
        }));
    }
    catch (Exception) {
      this.message("Some error occured", "Error")
    }

  }
  downloadFile(filePath: string, dataset: Dataset): Observable<any> {
    try {
      this.jwt = JSON.parse(String(sessionStorage.getItem('authenticationToken')));
      const options = {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.jwt}`, responseType: 'blob as json',
          'Content-Type': 'application/json'
        })
      };
      return this.https.post(this.dataUrl + '/datasets/download/' + filePath, dataset, { observe: 'response' })
        .pipe(catchError(this.handleError));

    }
    catch (Exception) {
      this.message("Some error occured", "Error")
    }

  }
  getProxyDbDatasetDetails(dataset: Dataset, dsource, params, org, removeCache?): Observable<any> {
    if (removeCache == null || removeCache == undefined) removeCache = true
    return this.https.get(this.dataUrl + '/service/dbdata/' + dsource.type + "/" + dsource.alias + "/" + dataset.alias + '/' + org + '/' + removeCache,
      { observe: 'response', params: params })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  saveDataset(dataset: Dataset): Observable<any> {
    dataset.organization = String(sessionStorage.getItem('organization'));
    return this.https.post(this.dataUrl + '/datasets/save/' + (dataset.id ? dataset.id : dataset.alias), dataset, { observe: 'response' })
      .pipe(switchMap(async (response) => {
       
        let result = response.body;
        let salt = this.encKey.getSalt()
        if (!salt)
          salt = sessionStorage.getItem("salt")
        result['attributes'] = await this.decryptUsingAES256(result['attributes'], salt)
        return result;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  getDatasetForm(name: string): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/datasetform/' + name + '/' + sessionStorage.getItem("organization"), { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getDatasetGroupNames(org: any): Observable<any> {
    return this.https.get(this.dataUrl + '/groups/names', { params: { org: org } })
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  getMlTags(): Observable<any> {
    return this.https.get(this.dataUrl + '/tags/fetchAll', { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  getPaginatedDetails(dataset: any, pagination: any): Observable<any> {
    let body: any
    let salt = this.encKey.getSalt()
    if (!salt)
      salt = sessionStorage.getItem("salt")
    if (dataset.attributes && dataset.attributes.length > 0)
      return from(this.encrypt(dataset.attributes, salt)).pipe(
        switchMap((body) => {
          let tmpParams = (pagination.sortEvent) ? { page: pagination.page, size: pagination.size, sortEvent: pagination.sortEvent, sortOrder: pagination.sortOrder } : { page: pagination.page, size: pagination.size }
          const org = sessionStorage.getItem("organization");
          return this.https.get(this.dataUrl + '/datasets/getPaginatedData/' + dataset.name + '/' + org,
            { observe: 'response', params: tmpParams, headers: new HttpHeaders().append("attribute", body) })
            .pipe(map(response => {
              return response.body;
            }));
        }));
    else
      return from(this.encrypt(JSON.stringify(dataset.attributes), salt)).pipe(
        switchMap((body) => {
          let tmpParams = (pagination.sortEvent) ? { page: pagination.page, size: pagination.size, sortEvent: pagination.sortEvent, sortOrder: pagination.sortOrder } : { page: pagination.page, size: pagination.size }
          const org = sessionStorage.getItem("organization");
          return this.https.get(this.dataUrl + '/datasets/getPaginatedData/' + dataset.name + '/' + org,
            { observe: 'response', params: tmpParams, headers: new HttpHeaders().append("attribute", body) })
            .pipe(map(response => {
              return response.body;
            }));
        }));
  
  }
  getSearchCount(datasetName: string, projectName: string, searchValues): Observable<string> {
    try {
      let searchParamsValue = searchValues;
      if (searchValues && searchValues.length > 0)
        searchParamsValue = searchValues;
      else
        searchParamsValue = JSON.stringify(searchValues);
      let apiParams = { datasetName, projectName, searchParams: searchParamsValue };
      return this.https.get('/api/aip/datasets/searchDataCount', {
        params: apiParams, responseType: 'text',
      })
        .pipe(map(response => {
          if (response) {
            return response.toString();
          }
        }))
        .pipe(catchError(err => {
          return this.handleError(err);
        }));
    }
    catch (Exception) {
      this.message("Some error occured", "Error")
    }
  }
  searchTicketsUsingDataset(datasetName: string, projectName: string, pagination, searchValues, searchClause?): Observable<any[] | string> {
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
      let apiParams = (pagination.sortEvent) ? {
        page: pagination.page, size: pagination.size, sortEvent: pagination.sortEvent,
        sortOrder: pagination.sortOrder
      }
        : {
          datasetName: datasetName, projectName: projectName,
          page: pagination.page, size: pagination.size
        }
      if (searchClause) {
        apiParams["datasetName"] = datasetName;
        apiParams["projectName"] = projectName;
        apiParams["searchParams"] = searchParamsValue;
        apiParams["selectClauseParams"] = selectClauseParamsValue;
      } else {
        apiParams["datasetName"] = datasetName;
        apiParams["projectName"] = projectName;
        apiParams["searchParams"] = searchParamsValue;
      }
   
      return this.https.get('/api/aip/datasets/searchData', {
        params: apiParams,
      })
        .pipe(map(response => {
          if (response && response[0] && response[0].hasOwnProperty("Error: ")) {
            let errorMsg: string = response[0]["Error: "];
            return errorMsg;
          }
          else {
            let responseArray: any[] = [];
            responseArray = <any[]>(response);
            return responseArray;
          }
        }))
        .pipe(catchError(err => {
          return this.handleError(err);
        }));

    }
    catch (Exception) {
      this.message("Some error occured", "Error")
    }

  }
  setFormData(formData: any) {
    this.formData = formData;
  }
  getFormData() {
    return this.formData;
  }
  triggerPostEvent(Eventdetails: any, body, corelid?): Observable<any> {
    return this.https.post(this.baseUrl + '/event/trigger/' + Eventdetails, body, {
      observe: 'response', responseType: 'text', params: {
        org: sessionStorage.getItem("organization"),
        corelid: corelid ? corelid : ""
      }
    })
      .pipe(map(response => {
        return response.body;

      }))
      .pipe(catchError(error => {
        return this.handleError(error);
      }));
  }

  callPostApi(url, body, params?, headers?): Observable<any> {
    if (headers)
      delete headers['access-token'];
    return this.https.post(url, body, {
      headers: headers,
      params: params,
      observe: 'response'
    })
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  addEndUserData(rowData: string, action: string, datasetName: string, processName: string): Observable<any> {
    let apiParams = { action: action, datasetName: datasetName, processName: processName, projectName: sessionStorage.getItem('organization') };
    return this.https.post('/api/aip/endUser/data/' + sessionStorage.getItem('organization') + "/" + datasetName + "/" + processName + "/" + action, rowData, { params: apiParams, observe: 'response', responseType: 'text' })
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }
  startProcess(processName: string, rowData: any, source: string, idList?: any): Observable<any> {
    let params = { "ocrIdList": idList }
    return this.https.post('/api/aip/inbox/startProcess/' + sessionStorage.getItem('organization') + "/" + processName + "/" + source, rowData, { params: params, observe: 'response', responseType: 'text' })
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }
  completeActiveTask(businessKeyId: string, processKey: string, workflowFields: any) {
    return this.https.post('/api/aip/inbox/completeActiveTask/' + sessionStorage.getItem("organization") + "/" + processKey + "/" + businessKeyId, workflowFields, { observe: 'response', responseType: 'text' })
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }
  updateProcessInstanceVariables(processName: string, rowData: any, businessKey: string) {
    return this.https.post('/api/aip/inbox/updateVariables/' + sessionStorage.getItem('organization') + "/" + processName + "/" + businessKey, rowData, { observe: 'response', responseType: 'text' })
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }
  saveEntry(rowData: string, action: string, datasetName: string): Observable<any> {
    let apiParams = { action: action, datasetName: datasetName, projectName: sessionStorage.getItem('organization') };
    return this.https.post('/api/aip/datasets/saveEntry', rowData, { params: apiParams, observe: 'response', responseType: 'text' })
      .pipe(map(response => {
        if (response && response.body) return response.body;
        else if (response && response.ok) return "Entry saved successfully";
        else return "Error: An unexpected error occurred while saving entry";
      }))
      .pipe(catchError(err => { return this.handleError(err); }));
  }
  getFormNameConstant(process: any): Observable<any> {
    let params = { "pKey": process, "org": sessionStorage.getItem('organization'), "constant": "forms" };
    return this.https.get('api/inbox/constant/', { params: params, observe: 'response', responseType: 'json' })
      .pipe(
        map(response => {
          return response.body;
        })
      );
  }
  checkTaskSupport(datasetName): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/checkIfSupported/' + datasetName + '/' + sessionStorage.getItem("organization"), { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  getFileNames(name: any): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/uploadedfiles/' + name + '/' + sessionStorage.getItem('organization'), { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));

  }
  findById(id: any): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/files/' + id, { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  loadDataset(name, id, data, overwrite): Observable<any> {
    try {
      return this.https.post(this.dataUrl + '/datasets/load-dataset/' + name + '/' + id + '/'
        + JSON.parse(sessionStorage.getItem("project")).id + '/' + overwrite + '/' +
        sessionStorage.getItem("organization"), data,
        {
          observe: 'response'
        })
        .pipe(map(response => response.body))
        .pipe(catchError(err => this.handleError(err)));

    }
    catch (Exception) {
      this.message("Some error occured", "Error")
    }

  }
  extractSchema(dataset: Dataset): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/extractSchema/' + dataset.name + '/' + dataset.organization, { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  saveChunks(data, formData: FormData): Observable<any> {
    try {
      let body = JSON.stringify(formData)
      return this.https.post(this.dataUrl + '/datasets/saveChunks/' + data + "/" + sessionStorage.getItem('organization'), formData, { observe: 'response' })
        .pipe(response => {
          return response;
        })
        .pipe(catchError(err => {
          return this.handleError(err);
        }));
    }
    catch (Exception) {
      this.message("Some error occured", "Error")
    }
  }

  uploadChunks(data, formData: FormData): Observable<any> {
    try {
      let body = JSON.stringify(formData)
      return this.https.post('/api/aip/fileserver/uploadChunks/' + sessionStorage.getItem('organization'), formData, { observe: 'response' })
        .pipe(response => {
          return response;
        })
        .pipe(catchError(err => {
          return this.handleError(err);
        }));
    }
    catch (Exception) {
      this.message("Some error occured", "Error")
    }
  }

  isTablePresent(datasetName): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/istablepresent/' + datasetName + '/' + sessionStorage.getItem("organization"), { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  extractTableSchema(datasetName): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/extracttableschema/' + datasetName + '/' + sessionStorage.getItem("organization"), { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  generateFormTemplate(datasetName: string, templateDetails: any) {
    let params = { "datasetName": datasetName, "org": sessionStorage.getItem("organization") };
    return this.https.post("/api/aip/datasets/generateFormTemplate", templateDetails, { params: params, observe: "response" })
      .pipe(map((response) => response.body))
      .pipe(catchError((err) => this.handleError(err)));
  }
  setJsonHeaders(query: any, datasetFile) {
    let params = { "query": query };
    return this.https.post("/api/aip/datasets/setJsonHeader", datasetFile, { params: params, observe: "response" })
      .pipe(map((response) => response.body))
      .pipe(catchError((err) => this.handleError(err)));
  }
  getCorelId() {
    return this.corelId;
  }
  fetchInternalJobLenByname(name: string): Observable<any> {
    return this.https.get(this.dataUrl + '/internaljob/jobname/len/' + name + '/' + sessionStorage.getItem("organization"))
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }
  findInternalJobsByCoreid(corelid): Observable<any> {
    return this.https.get(this.dataUrl + '/internaljob/corelid/' + corelid)
      .pipe((resp: any) => resp);
  }
  fetchInternalJobLenByNameAndJob(job, name: string): Observable<any> {

    return this.https.get(this.dataUrl + '/internaljob/macrobase/len/' + name + '/' + job + '/' + sessionStorage.getItem("organization"))

      .pipe(map(response => response))

      .pipe(catchError(this.handleError));

  }
  fetchInternalJobLen(name: string): Observable<any> {
    return this.https.get(this.dataUrl + '/internaljob/dataset/len/' + name + '/' + sessionStorage.getItem("organization"))
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }
  findByCoreid(corelid): Observable<any> {
    return this.https.get(this.dataUrl + '/jobs/corelid/' + corelid)
      .pipe((resp: any) => resp);
  }
  fetchInternalJobLog(jobId: string, linenumber: Number, offset: Number, status): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https.get(this.dataUrl + '/internaljob/console/' + jobId + "?offset=" + offset + "&org=" + org + "&lineno=" + linenumber + "&status=" + status)
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }
  fetchSparkJob(jobId: string, linenumber: Number, runtime: string, offset: Number, status, read): Observable<any> {
    const org = sessionStorage.getItem("organization");
    if (runtime == "local") {
      return this.https.get(this.dataUrl + '/jobs/console/' + jobId + "?offset=" + offset + "&org=" + org + "&lineno=" + linenumber + "&status=" + status + "&readconsole=" + read)
        .pipe(map(response => response))
        .pipe(catchError(this.handleError));
    } else {
      return this.https.get(this.dataUrl + '/jobs/spark/' + jobId)
        .pipe(map(response => response))
        .pipe(catchError(this.handleError));
    }
  }
  fetchInternalJobByName(name: string, page, rows): Observable<any> {
    return this.https.get(this.dataUrl + '/internaljob/jobname/' + name + '/' + sessionStorage.getItem("organization"), { params: { page: page, size: rows } })
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }
  fetchInternalJob(name: string, page, rows): Observable<any> {
    return this.https.get(this.dataUrl + '/internaljob/dataset/' + name + '/' + sessionStorage.getItem("organization"), { params: { page: page, size: rows } })
      .pipe(map(response => response))
      .pipe(catchError(this.handleError));
  }
  getDatasetsType(): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .get(this.dataUrl + '/datasets/types', {
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
  deleteDatasets(name): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https.delete(this.dataUrl + '/datasets/delete/' + name + '/' + org, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response'
    })
      .pipe(catchError(this.handleError));
  }
  getCountDatasets(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/service/v1/datasets/list/count', {
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
  getDatasetsByDatasource(datasource, search, pageNumber, pageSize): Observable<any> {
    let session = sessionStorage.getItem('organization')
    let param: HttpParams = new HttpParams()
      .set('project', session)
      .set('datasource', datasource)
      .set('search', search)
      .set('page', pageNumber)
      .set('size', pageSize);
    return this.https
      .get(this.dataUrl + '/service/v1/datasets/list/datasource', {
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
  getProjectNames(): Observable<any> {

    return this.https.get('/api/projects/names', { observe: 'response' })
      .pipe(map(response => {

        return response.body;
      }))
      .pipe(catchError(err => {

        return this.handleError(err);
      }));
  }
  getProjectByName(name): Observable<any> {

    return this.https.get('/api/projects/get/' + name, { observe: 'response' })
      .pipe(map(response => {

        return response.body;
      }))
      .pipe(catchError(err => {

        return this.handleError(err);
      }));
  }
  getDatasetNamesByDatasource(data): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/dsetNames/' + sessionStorage.getItem("organization"),
      {
        observe: 'response',
        params: { datasource: data }
      })
      
      .pipe(switchMap(async (response) => {
        let result = response.body as Array<any>;
        result.forEach(async res => {

          let salt = this.encKey.getSalt()
          if (!salt)
            salt = sessionStorage.getItem("salt")
          if (res.attributes != null) {
            res.attributes = await this.decryptUsingAES256(res.attributes, salt)
          }
        })

        return result;

      }))
      .pipe(catchError(err => this.handleError(err)));

  }
  copyDatasets(fromproject, toproject, datasets: any[], projectId, todatasource) {
    let mapping = {};
    mapping["datasets"] = datasets
    mapping["todatasource"] = todatasource
    var body = mapping;
    return this.https
      .post("/api/aip/datasets/datasetsCopy/" + toproject + "/" + fromproject + "?projectId=" + projectId, body, {
        observe: "response",
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
  getDatasets(): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/all/' + sessionStorage.getItem("organization"), { observe: 'response' })
      .pipe(switchMap(async (response) => {
        // return response.body;
        let result = response.body as Array<any>;
        result.forEach(async res => {
          let salt = this.encKey.getSalt()
          if (!salt)
            salt = sessionStorage.getItem("salt")
          res.attributes = await this.decryptUsingAES256(res.attributes, salt)
        })
        return result;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  setCorelId(corelId) {
    this.corelId = corelId;
  }
  getDatasetsLenBySearch(search: any): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/len/' + sessionStorage.getItem("organization"), {
      observe: 'response',
      params: { search: search }
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  getDatasetsByOrg(page, size): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/search/' + sessionStorage.getItem("organization"),
      {
        observe: 'response',
        params: {
          page: page,
          size: size
        }
      })
      .pipe(switchMap(async (response) => {
        let result = response.body as Array<any>;
        result.forEach(async res => {
          let salt = this.encKey.getSalt()
          if (!salt)
            salt = sessionStorage.getItem("salt")
          res.attributes = await this.decryptUsingAES256(res.attributes, salt)
        })
        return result;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  getDatasetsByName(name: any, page, size): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/search/' + name + '/' + sessionStorage.getItem("organization"),
      {
        observe: 'response',
        params: {
          page: page,
          size: size
        }
      })
      .pipe(switchMap(async (response) => {
        let result = response.body as Array<any>;
        result.forEach(async res => {
          let salt = this.encKey.getSalt()
          if (!salt)
            salt = sessionStorage.getItem("salt")
          res.attributes = await this.decryptUsingAES256(res.attributes, salt)
        })
        return result;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getDatasetDataCount(dataset: Dataset): Observable<any> {
    let body = dataset.attributes;
    let salt = this.encKey.getSalt();
    if (!salt) {
      salt = sessionStorage.getItem("salt");
    }
    if (dataset.attributes && dataset.attributes.length > 0) {
      return from(this.encrypt(dataset.attributes, salt)).pipe(
        switchMap((body) => {
          const org = sessionStorage.getItem("organization");
          return this.https.get(this.dataUrl + '/datasets/getDatasetDataCount/' + dataset.name + '/' + org, {
            observe: 'response',
            headers: new HttpHeaders().append("attributes", body)
          })
        }));
    } else {
      return from(this.encrypt(JSON.stringify(dataset.attributes), salt)).pipe(
        switchMap((body) => {
          const org = sessionStorage.getItem("organization");
          return this.https.get(this.dataUrl + '/datasets/getDatasetDataCount/' + dataset.name + '/' + org, {
            observe: 'response',
            headers: new HttpHeaders().append("attributes", body)
          })

        }));
    }
  }
  analysis(data, dset): Observable<any> {
    try {
      let body = JSON.stringify(data)
      return this.https.post(this.dataUrl + '/macrobase/analyze/' + dset + "/" + sessionStorage.getItem('organization'), body, { observe: 'response' })
        .pipe(response => {
          return response;
        })
        .pipe(catchError(err => {
          return this.handleError(err);
        }));

    }
    catch (Exception) {
      this.message("Some error occured", "Error")
    }

  }
  fetchInternalJobByNameAndJob(job, name: string, page, rows): Observable<any> {

    return this.https.get(this.dataUrl + '/internaljob/macrobase/' + name + '/' + job + '/' + sessionStorage.getItem("organization"), { params: { page: page, size: rows } })

      .pipe(map(response => response))

      .pipe(catchError(this.handleError));

  }
  getMbResult(fileId, fileName): Observable<any> {
    return this.https.get(this.dataUrl + '/macrobase/analyze/result/' + fileId + '/' + fileName + "/" + sessionStorage.getItem('organization'),
      { observe: 'response' })
      .pipe(map(response => response.body))
      .pipe(catchError(err => this.handleError(err)));
  }

  getIndexNamesByOrg(org: string): Observable<any> {
    return this.https.get(this.dataUrl + '/mltopics/list/activeMltopicsByOrg/' + org,
      { observe: 'response', })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  updateIndexNameOrSummary(name: string, org, updateIndexNameOrSummary): Observable<any> {
    return this.https
      .post(
        this.dataUrl +
        '/datasets/updateIndexNameOrSummary/' +
        name +
        '/' +
        org, updateIndexNameOrSummary,
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
  getAllEventDetails(): Observable<any> {
    return this.https
      .get("/api/aip/event/all", {
        observe: "response",
        params: {
          org: localStorage.getItem("organization"),
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
  getDatasetForDatasource(datasource: string): Observable<any> {
    return this.https
      .get("/api/aip/datasets/datasource/" + sessionStorage.getItem("organization"), {
        observe: 'response',
        params: { datasource: datasource }
      })
   
      .pipe(switchMap(async (response) => {
        let result = response.body as Array<any>;
        result.forEach(async res => {
          let salt = this.encKey.getSalt()
          if (!salt)
            salt = sessionStorage.getItem("salt")
          if (res.attributes != null) {
            res.attributes = await this.decryptUsingAES256(res.attributes, salt)
          }
        })
        return result;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  triggerProcessMiningPipeline(Eventdetails: any, params: any): Observable<any> {
    return this.https.get("/api/aip/event/trigger/" + Eventdetails, {
      observe: 'response', responseType: 'text', params: {
        org: localStorage.getItem("organization"),
        param: params
      }
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

  getStreamingServicesByName(name: any): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https
      .get('/api/aip/streamingServices/' + name + '/' + org, { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  createDashboardProcess(body) {
    return this.https
      .post("/api/aip/dashboard-configurations/create-template", body, { observe: "response" })
      .pipe(map((response) => response.body))
      .pipe(catchError((err) => this.handleError(err)));
  }

  savecorelId(datasetId,corelId: string,eventName:string): Observable<any> {
    let param = new HttpParams()
      .set('id', datasetId)
      .set('corelid', corelId)
      .set('event',eventName)
    
    return this.https.post<any>(this.dataUrl+'/datasets/set/corelid', {},
    {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
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

  createSummary(datasetName: String, datasetData: any): Observable<any>{
    let org = sessionStorage.getItem("organization");
    let body = JSON.stringify(datasetData);
    return this.https
      .post(this.dataUrl + '/datasets/summarise/' + datasetName + '/' + org, body, { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getByDatasourceType(docViewType, page, size): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/getDoc/' + sessionStorage.getItem("organization"), {
      observe: 'response',
      params: {
        docViewType: docViewType,
        page: page,
        size: size
      }
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getCountDatasourceType(docViewType): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/getDocCount/' + sessionStorage.getItem("organization"), {
      observe: 'response',
      params: {
        docViewType: docViewType
      }
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getFileTemplateNames(): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/uploadedTemplateFiles/' + sessionStorage.getItem('organization'), { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  saveTemplateChunks(fileName,formData: FormData): Observable<any> {
    try {
      let body = JSON.stringify(formData)
      return this.https.post(this.dataUrl + '/datasets/saveTemplateChunks/' + sessionStorage.getItem('organization')
        + '/' + fileName, formData, { observe: 'response' })
        .pipe(response => {
          return response;
        })
        .pipe(catchError(err => {
          return this.handleError(err);
        }));
    }
    catch (Exception) {
      this.message("Some error occured", "Error")
    }
  }

  findFileDataById(id: any): Observable<any> {
    return this.https.get(this.dataUrl + '/datasets/fileTemplateData/' + id, { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
    
  cloneGitRepoAndPushToS3(datasetId, org): Observable<any> {
    return this.https.get(this.dataUrl + '/file/cloneGitRepoAndPushToS3/' + datasetId + '/' + org, {
      observe: 'response'
    })
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getDatasetByViewType(viewType) : Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https.get(this.dataUrl + '/datasets/datasetByView/'+ viewType +'/' + org, { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getCountDatasetsAdvancedFilter(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/datasets/filter/advanced/count', {
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

  getDatasetsAdvancedFilter(param: HttpParams): Observable<any> {
    return this.https
      .get(this.dataUrl + '/datasets/filter/advanced/list', {
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

  stopJob(jobid): Observable<any> {
    return this.https
      .get(this.dataUrl + '/internaljob/stopJob/' + jobid, {
        observe: 'response',
      })
      .pipe(map((response) => response))
      .pipe(catchError(this.handleError));
  }

  softDeleteSelectedKBs(param: HttpParams): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https.delete(this.dataUrl + '/mldatasettopics/softDeleteTopics/' + org, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      observe: 'response',
      params: param,
    })
      .pipe(catchError(this.handleError));
  }

}