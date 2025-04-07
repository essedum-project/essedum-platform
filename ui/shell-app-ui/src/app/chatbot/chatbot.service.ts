import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http";
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatbotServices {
  constructor(
    private https: HttpClient
  ) { }

  sendChat(chatObj, instance) {
    let org = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('isInstance', 'true');
    return this.https.post('/api/aip' + '/adapters/' + instance + '/chat/' + org, chatObj,{
      params: param,
    });
  }

  getChatHistory(chat_user_id, instance) :Observable<any> {
    let obj = {
      'chat_user_id': chat_user_id
    }
    let org = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('isInstance', 'true');
    return this.https.post('/api/aip' + '/adapters/' + instance + '/chat_history/' + org, obj, {
      params: param});
  }

  saveChatHistory(chat_user_id, instance){
    let obj = {
      'chat_user_id': chat_user_id
    }
    let org = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('isInstance', 'true');
    return this.https.post('/api/aip' + '/adapters/' + instance + '/save_chat_history/' + org, obj,{
      params: param,
      responseType: 'text',
    });
  }

  saveFeedback(feedbackObj, instance){
    let org = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('isInstance', 'true');
    return this.https.post('/api/aip' + '/adapters/' + instance + '/save_feedback/' + org,  feedbackObj, {
      params: param,
      responseType: 'text' });

  }

  getBotIntro(introBotObj, instance){
    let org = sessionStorage.getItem('organization');
    let param = new HttpParams()
      .set('adapter_instance', instance)
      .set('project', org)
      .set('isInstance', 'true')
      .set('isCached', 'false');
    return this.https.get('/api/aip' + '/adapters/' + instance + '/get_chat_intro/' + org,{
      params: param,
    });
  }

  getMlInstanceNamesByOrganization(): Observable<any> {
    return this.https.get('/api/aip' + '/mlinstances/getMlInstanceNamesByOrganization/' + sessionStorage.getItem("organization"), { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  private handleError(error: any) {
    const errMsg = error.error;
    console.error(errMsg);
    if (error.status === 401) {
      window.location.href = '/';
    }
    return throwError(errMsg);
  }
  getAllMashups(): Observable<any> {
    return this.https.get('/api/aip' + '/mashups/all', { observe: 'response', params: { org: sessionStorage.getItem('organization') } })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getMashupByName(name: any): Observable<any> {
    const org = sessionStorage.getItem("organization");
    return this.https.get('/api/aip' + '/mashups/' + name + '/' + org, { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getFormtemplateByName(name: string): Observable<any> {
    let org = sessionStorage.getItem('organization');
    return this.https.get('/api/aip' + '/schemaRegistry/schemaFormTemplate/' + name + '/' + org, { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  getUsersession(sessionId,userId,instance): Observable<any> {
    let org = sessionStorage.getItem('organization');
    let body = {chat_id: sessionId,chat_user_id: userId};
    let param = new HttpParams()
      .set('isInstance', 'true');
    return this.https.post('/api/aip' + '/adapters/' + instance + '/get_Session_Details/' + org, body,{
      params: param
    });
  }

  getConstantByKey(key: string): Observable<any> {
    return this.https.get("/api/get-startup-constants/" + key + "/" + sessionStorage.getItem("organization"), {
      observe: 'response',
      responseType: 'text'
    })
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
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
}