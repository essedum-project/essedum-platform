import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
// import { MessageService } from '../../sharedModule/service/message.service';
import { Services } from '../services/service';
import { encKey } from "com-lib-util";
import { Incidents } from './incidents';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class TicketsService {

  constructor(private https: HttpClient,
    // private messageService: MessageService,
    private service: Services,
    private encKey: encKey,
    private http: HttpClient,
    @Inject('envi') private baseUrl: string
  ) { }

  resolveTickets: Incidents[] = [];
  resolveTicketsObj: Incidents[] = [];
  setResolveIncidents(incidents) {
    this.resolveTickets = incidents;
  }
  getResolveIncidents() {
    return this.resolveTickets;
  }
  setResolveIncidentsObj(incidents) {
    this.resolveTicketsObj = incidents;
  }
  getResolveIncidentsObj() {
    return this.resolveTicketsObj;
  }

  getDataset(name, list): Observable<any> {
    return this.getDataSet(list[name]["dataset"])
  }

  getDatasetData(dataset, params, page, size): Observable<any> {
    try {
      var attr = JSON.parse(dataset.attributes)
      attr["params"] = params
      dataset.attributes = JSON.stringify(attr);
      // var pagination: PaginationAttributes = new PaginationAttributes()
      var pagination
      pagination.page = page;
      pagination.size = size;
      return this.getPaginatedDetails(dataset, pagination)
    }
    catch (Exception) {
      
      this.service.message('Some error occured', 'error')
    }

  }
  getPaginatedDetails(dataset, pagination): Observable<any> {
    let tmpParams = (pagination.sortEvent) ? { page: pagination.page, size: pagination.size, sortEvent: pagination.sortEvent, sortOrder: pagination.sortOrder } : { page: pagination.page, size: pagination.size }
    const org = localStorage.getItem('organization');

    let salt = this.encKey.getSalt()
    if (!salt)
      salt = sessionStorage.getItem("salt")
    let attributes = dataset.attributes

    if (dataset.attributes && dataset.attributes.length > 0)
      attributes = this.encrypt(dataset.attributes, salt);
    else
      attributes = this.encrypt(JSON.stringify(dataset.attributes), salt);
    return this.https.get(this.baseUrl +'/datasets/getPaginatedData/' + dataset.name + '/' + org,
      { observe: 'response', params: tmpParams, headers: new HttpHeaders().append("attribute", attributes) })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }
  getDataSet(name: string): Observable<any> {
    return this.https.get(this.baseUrl +'/datasets/' + name + '/' + localStorage.getItem('organization'), { observe: 'response' })
      .pipe(map(response => {
        let result = response.body;
        let salt = this.encKey.getSalt()
        if (!salt)
          salt = sessionStorage.getItem("salt")
        if (result)
          result['attributes'] = this.decryptUsingAES256(result['attributes'], salt)
        return result;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  triggerEvent(param: any, eventName: any) {
    let org = sessionStorage.getItem("organization")
    return this.https.get( this.baseUrl +'/event/trigger/' + eventName, {
      observe: 'response', responseType: 'text', params: {
        org: localStorage.getItem("organization"),
        param: param
      }
    })
      .pipe(map(response => {
        return response.body;

      }))
      .pipe(catchError(error => {
        return this.handleError(error);
      }));
  }

  viewSop(id: any, name: any): Observable<any> {
    return this.https.get(this.baseUrl +'/icm_sops/' + name + '/' + id, { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  addNer(map: any) {
    return this.https.post(this.baseUrl +'/sql/update/aio_tkt_ner', "1:" + map, { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  async encrypt(plaintext, password) {
    // const encryptedData = await this.usersService.encryptgcm(plaintext, password);
    const encryptedData = await this.encryptgcm(plaintext, password);
    return JSON.stringify(encryptedData);
  }

  async decryptUsingAES256(cipherResponse, password) {
    let cipherJson = JSON.parse(cipherResponse);
    // const result = await this.usersService.decryptgcm(cipherJson["ciphertext"], cipherJson["iv"], password)
    const result = await this.decryptgcm(cipherJson["ciphertext"], cipherJson["iv"], password)
    return result;
  }

  async encryptgcm(plaintext, password) {
    // Generate random 12-byte IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    // Prepare the encryption parameters
    const algorithm = {
      name: 'AES-GCM',
      iv: iv
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
    const ciphertext = await crypto.subtle.encrypt(algorithm, importedKey, encodedText);
    const ciphertextArray = Array.from(new Uint8Array(ciphertext));
    const encodedCiphertext = btoa(String.fromCharCode.apply(null, ciphertextArray));
    const encodedIV = btoa(Array.from(iv).map((byte) => String.fromCharCode(byte)).join(''));
    const encryptedJSON = { ciphertext: encodedCiphertext, iv: encodedIV }
    return encryptedJSON;
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
    let errMsg = (error.message) ? error.message :
      error.status ? `Status: ${error.status} - Text: ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    // if (error.status === 401) {
    //   window.location.href = '/';
    // }
    return throwError(errMsg);
  }
}
