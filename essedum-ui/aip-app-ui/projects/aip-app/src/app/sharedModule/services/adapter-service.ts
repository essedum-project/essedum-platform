import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { encKey } from '../../services/encKey';
import { AipSnackbarCustomService } from './aip-snackbar-custom.service';

@Injectable()
export class AdapterServices {
  organization = String(sessionStorage.getItem('organization'));
  constructor(
    private https: HttpClient,
    @Inject('dataSets') private dataUrl: string,
    private matSnackbar: MatSnackBar,
    private encKey: encKey,
    private customSnackbar: AipSnackbarCustomService
  ) {}

  private handleError(error: any) {
    const errMsg = error.error;
    console.error(errMsg);
    if (error.status === 401) {
      window.location.href = '/';
    }
    return throwError(errMsg);
  }

  messageService(resp: any, msg?: any) {
    console.log(resp);
    
    // Use the new custom snackbar service which handles all the styling and logic
    this.customSnackbar.handleResponse(resp, msg);
  }

  getOCRDetails(formData: any): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
          '/adapters/Annotation_Service/getOCRConfig/' +
          this.organization,
        {
          params: { datasetID: formData, OrgID: this.organization },
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

  CreateOCREntity(formData: any): Observable<any> {
    return this.https
      .post(
        this.dataUrl +
          '/adapters/Annotation_Service/CreateOcrDataset/' +
          this.organization,
        formData,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
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
  EditOCREntity(formData: any): Observable<any> {
    return this.https
      .post(
        this.dataUrl +
          '/adapters/Annotation_Service/EditOcrDataset/' +
          this.organization,
        formData,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
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
  TokenizeFile(formData: any): Observable<any> {
    return this.https
      .post(
        this.dataUrl +
          '/adapters/Annotation_Service/TokenizeFile/' +
          this.organization,
        formData,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
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
  TokenView(formData: any): Observable<any> {
    return this.https
      .post(
        this.dataUrl +
          '/adapters/Annotation_Service/TokenView/' +
          this.organization,
        formData,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
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

  gettaggeddata(data: any): Observable<any> {
    return this.https
      .post(
        this.dataUrl +
          '/adapters/Annotation_Service/TaggedData/' +
          this.organization,
        data,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
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

  UploadTaggedData(data: any): Observable<any> {
    return this.https
      .post(
        this.dataUrl +
          '/adapters/Annotation_Service/UploadtaggedData/' +
          this.organization,
        data,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
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
  getMlSpecTemplatesCards(
    org: string,
    page?: number,
    size?: number,
    query?: string,
    type?: string
  ): Observable<any> {
    let params = new HttpParams();
    if (page !== undefined) {
      params = params.set('page', page.toString());
    }
    if (size !== undefined) {
      params = params.set('size', size.toString());
    }
    if (query) {
      params = params.set('query', query);
    }
    if (type) {
      params = params.set('type', type);
    }

    return this.https
      .get(
        this.dataUrl + '/mlspectemplates/getSpecTemplatesByOrganization/' + org,
        {
          params: params,
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

  getCountSpecTemplates(
    org: string,
    query?: string,
    type?: string
  ): Observable<any> {
    let params = new HttpParams();
    if (query) {
      params = params.set('query', query);
    }
    if (type) {
      params = params.set('type', type);
    }
    return this.https
      .get(
        this.dataUrl + '/mlspectemplates/getSpecTemplatesCountByOrg/' + org,
        {
          params: params,
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

  getDatasources(): Observable<any> {
    return this.https
      .get(this.dataUrl + '/datasources/all', {
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

  getAdapters(org): Observable<any> {
    return this.https
      .get(this.dataUrl + '/mladapters/getAdaptesByOrganization/' + org, {
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

  createAdapter(adapter: any): Observable<any> {
    return this.https
      .post(this.dataUrl + '/mladapters/add', adapter, {
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

  updateAdapter(adapter: any): Observable<any> {
    return this.https
      .post(this.dataUrl + '/mladapters/update', adapter, {
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

  deleteAdapter(adapterName: string): Observable<any> {
    return this.https
      .delete(
        this.dataUrl +
          '/mladapters/delete/' +
          adapterName +
          '/' +
          sessionStorage.getItem('organization'),
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
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
  fetchApiSpecTemplate(domainname, org) {
    const options = {
      params: new HttpParams().set('domainName', domainname),
    };
    return this.https
      .get(
        `${this.dataUrl}/mlspectemplates/specTemplateByDomainNameAndOrg/${domainname}/${org}`,
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
  createApiSpecTemplate(data) {
    return this.https
      .post(this.dataUrl + '/mlspectemplates/add', data, {
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

  deleteApiSpecTemplate(domainname, org) {
    return this.https
      .delete(`${this.dataUrl}/mlspectemplates/delete/${domainname}/${org}`, {
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

  updateApiSpecTemplate(data) {
    return this.https
      .post(this.dataUrl + '/mlspectemplates/update', data, {
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

  callGetApi(url, parameters?, headers?) {
    let path: string;
    if (url.startsWith('http')) {
      const urlObject = new URL(url);
      path = urlObject.pathname + urlObject.search;
    } else {
      path = url;
    }
    if (headers) delete headers['access-token'];
    return this.https
      .get(path, {
        observe: 'response',
        params: parameters,
        headers: headers,
      })
      .pipe(catchError(this.handleError));
  }

  callDeleteApi(url, parameters?, headers?) {
    let path: string;
    if (url.startsWith('http')) {
      const urlObject = new URL(url);
      path = urlObject.pathname + urlObject.search;
    } else {
      path = url;
    }
    if (headers) delete headers['access-token'];
    return this.https
      .delete(path, {
        observe: 'response',
        params: parameters,
        headers: headers,
      })
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  callPostApi(url, body, params?, headers?): Observable<any> {
    let path: string;
    if (url.startsWith('http')) {
      const urlObject = new URL(url);
      path = urlObject.pathname + urlObject.search;
    } else {
      path = url;
    }
    if (headers) delete headers['access-token'];
    return this.https
      .post(path, body, {
        headers: headers,
        params: params,
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

  callPostApiFromEndpointSwagger(
    url,
    body,
    params?,
    headers?
  ): Observable<any> {
    if (headers) delete headers['access-token'];
    return this.https
      .post(this.dataUrl + '/prompt/postPromptFromEndpoint', body, {
        headers: headers,
        params: params,
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

  getDataSource(connectionId: string): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
          '/datasources/get/' +
          connectionId +
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

  testConnection(dataset: any): Observable<any> {
    dataset.organization = String(sessionStorage.getItem('organization'));
    return this.https
      .post(this.dataUrl + '/datasets/test', dataset, {
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

  createDataset(dataset: any): Observable<any> {
    return this.https
      .post(this.dataUrl + '/datasets/add', dataset, { observe: 'response' })
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

  saveDataset(dataset: any): Observable<any> {
    dataset.organization = sessionStorage.getItem('organization');
    return this.https
      .post(
        this.dataUrl +
          '/datasets/save/' +
          (dataset.id ? dataset.id : dataset.alias),
        dataset,
        { observe: 'response' }
      )
      .pipe(
        switchMap(async (response) => {
          this.messageNotificaionService(
            'success',
            'Done!  Method Updated Successfully'
          );
          let result = response.body;
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
          this.messageNotificaionService('error', 'Error!');
          return this.handleError(err);
        })
      );
  }

  deleteDatasets(name): Observable<any> {
    const org = sessionStorage.getItem('organization');
    return this.https
      .delete(this.dataUrl + '/datasets/delete/' + name + '/' + org, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
        observe: 'response',
      })
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
          let result = response.body;
          if (result) {
            let salt = this.encKey.getSalt();
            if (!salt) salt = sessionStorage.getItem('salt');
            result['attributes'] = await this.decryptUsingAES256(
              result['attributes'],
              salt
            );
          }
          return result;
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  async decryptUsingAES256(cipherResponse, password) {
    let cipherJson = JSON.parse(cipherResponse);
    const result = await this.decryptgcm(
      cipherJson['ciphertext'],
      cipherJson['iv'],
      password
    );
    return result;
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

  updateAdapterAPISpec(adapter: any): Observable<any> {
    return this.https
      .post(this.dataUrl + '/mladapters/updateAPISpec', adapter, {
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

  getAdapteByNameAndOrganization(name: string): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
          '/mladapters/getAdapteByNameAndOrganization/' +
          name +
          '/' +
          sessionStorage.getItem('organization'),
        { observe: 'response' }
      )
      .pipe(
        map((response) => {
          if (response?.body['apispec']) {
            let apispec = response.body['apispec'];
            apispec = apispec.replaceAll(
              '{org}',
              sessionStorage.getItem('organization')
            );
            response.body['apispec'] = apispec;
          }
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

  getAdapterFilters(): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
          '/mladapters/getFiltersByOrganization/' +
          sessionStorage.getItem('organization'),
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
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

  getSpecTemplateFilters(): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
          '/mlspectemplates/getFiltersByOrganization/' +
          sessionStorage.getItem('organization'),
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
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
  getInstancesFilters(): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
          '/mlinstances/getFiltersByOrganization/' +
          sessionStorage.getItem('organization'),
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
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
  getAdaptersBySpectempdomainname(domainName): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
          '/mladapters/getAdaptersBySpecTemDomNameAndOrg/' +
          domainName +
          '/' +
          sessionStorage.getItem('organization'),
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
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

  getInstances(org): Observable<any> {
    return this.https
      .get(this.dataUrl + '/mlinstances/getMlInstanceByOrganization/' + org, {
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
  updateInstance(instance: any): Observable<any> {
    return this.https
      .post(this.dataUrl + '/mlinstances/update', instance, {
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

  createInstance(instance: any): Observable<any> {
    return this.https
      .post(this.dataUrl + '/mlinstances/add', instance, {
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

  deleteInstance(instanceName: string): Observable<any> {
    return this.https
      .delete(
        this.dataUrl +
          '/mlinstances/delete/' +
          instanceName +
          '/' +
          sessionStorage.getItem('organization'),
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
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

  getInstanceByNameAndOrganization(name: string): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
          '/mlinstances/getMlInstanceByNameAndOrganization/' +
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

  getMlInstanceNamesByAdapterNameAndOrganization(
    adapterName: string
  ): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
          '/mlinstances/getMlInstanceNamesByAdapterNameAndOrganization/' +
          adapterName +
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

  getSpecTemplateNamesByOrganization(): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
          '/mlspectemplates/getSpecTemplateNamesByOrganization/' +
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

  getMlInstanceNamesByOrganization(): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
          '/mlinstances/getMlInstanceNamesByOrganization/' +
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

  getAdapterNamesByOrganization(): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
          '/mladapters/getAdapterNamesByOrganization/' +
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

  callPostApiForMultipartFormData(
    url,
    formData: FormData,
    params?,
    headers?
  ): Observable<any> {
    try {
      let path: string;
      if (url.startsWith('http')) {
        const urlObject = new URL(url);
        path = urlObject.pathname + urlObject.search;
      } else {
        path = url;
      }
      if (headers) delete headers['access-token'];
      return this.https
        .post(path, formData, {
          headers: headers,
          params: params,
          observe: 'response',
        })
        .pipe((response) => {
          return response;
        })
        .pipe(
          catchError((err) => {
            return this.handleError(err);
          })
        );
    } catch (Exception) {
      console.log(
        'Some error occured while callPostApiForMultipartFormData API Call'
      );
    }
  }

  uploadFileToServerForAdapterMethod(
    formData: FormData,
    adapterName: string,
    methodName: string
  ): Observable<any> {
    try {
      return this.https
        .post(
          '/api/aip/adapters/uploadTempFileForAdapter/' +
            sessionStorage.getItem('organization') +
            '/' +
            adapterName +
            '/' +
            methodName,
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
      console.log(
        'Some error occured while uploadFileToServerForAdapterMethod API Call'
      );
    }
  }

  getMethodsByInstanceAndOrganization(instanceName): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
          '/mlinstances/getMethodsByInstanceAndOrganization/' +
          instanceName +
          '/' +
          sessionStorage.getItem('organization'),
        { observe: 'response' }
      )
      .pipe(
        switchMap(async (response: any) => {
          let result = response.body.listOfMethods as Array<any>;
          result.forEach(async (res) => {
            res.datasource = response.body.connection;
            let salt = this.encKey.getSalt();
            if (!salt) salt = sessionStorage.getItem('salt');
            if (res.attributes && res.attributes != null) {
              res.attributes = await this.decryptUsingAES256(
                res.attributes,
                salt
              );
            }
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

  getInstancesBySpectempdomainname(domainName): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
          '/mlinstances/getMlInstancesBySpecTemDomNameAndOrg/' +
          domainName +
          '/' +
          sessionStorage.getItem('organization'),
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
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

  changePriorityBySpecTemDomNameAndInstancNameAndOrg(
    domainName,
    adapterInsName,
    priority,
    org
  ): Observable<any> {
    return this.https
      .get(
        this.dataUrl +
          '/mlinstances/changeOrderBySpecTemDomNameAndInstancNameAndOrg/' +
          domainName +
          '/' +
          adapterInsName +
          '/' +
          priority +
          '/' +
          org,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
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
}
