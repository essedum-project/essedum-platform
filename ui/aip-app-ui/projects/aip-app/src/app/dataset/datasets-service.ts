import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, NgZone } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MessageBarComponent } from 'leds-lib';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StreamingServices } from '../streaming-services/streaming-service';
import { App } from '../apps/app';
// import { Dataset } from '../sharedModule/pipeline-model/datasets';
import { encKey } from 'com-lib-util';
import { Datasource } from '../datasource/datasource';
import { EventSourcePolyfill } from 'event-source-polyfill';
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
  ) {}

  async decryptUsingAES256(cipherResponse, password) {
    let cipherJson = JSON.parse(cipherResponse);
    // const result = await this.usersService.decryptgcm(cipherJson["ciphertext"], cipherJson["iv"], password)
    const result = await this.decryptgcm(cipherJson["ciphertext"], cipherJson["iv"], password)

    return result;
  }
  async decryptgcm(ciphertext, iv, password) {
    // Decode the ciphertext and IV from Base64 strings
    const decodedCiphertext = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const decodedIV = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

    // Prepare the decryption parameters
    const algorithm = {
      name: 'AES-GCM',
      iv: decodedIV
    };

    // Import the key from password
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
    // TODO: seems we cannot use messageService from here...
    const errMsg = error.error;
    console.error(errMsg); // log to console instead
    if (error.status === 401) {
      window.location.href = '/';
    }
    return throwError(errMsg);
  }

  createDataset(dataset: Dataset): Observable<any> {
    dataset.organization = String(sessionStorage.getItem('organization'));


    return this.https.post(this.dataUrl + '/datasets/add', dataset, { observe: 'response' })
      .pipe(switchMap(async (response) => {
        // this.loader.hide();
        // return response;
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
          // this.loader.hide();
          // return response.body;
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
    //   this.messageService.error("Some error occured", "Error")
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
    //   this.messageService.error("Some error occured", "Error")
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
      // .pipe(map(response => response.body))
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
        // this.loader.hide();
        // return response.body;
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
}