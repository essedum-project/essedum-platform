import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UsmPermissionsApi } from '../models/usm-permission-api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageBarComponent } from 'leds-lib';


@Injectable({
  providedIn: 'root'
})
export class PersonalAccessTokenService {

  constructor(private https: HttpClient,
    private matSnackbar: MatSnackBar,) { }

  private handleError(error: any) {
    let errMsg = error.error;
    error.status ? `Status: ${error.status} - Text: ${error.statusText}` : "Server error";
    console.error(errMsg); // log to console instead
    return throwError(errMsg);
  }

  createPersonalAccessToken(userTokeDetails: any): Observable<any> {
    return this.https
      .post("/api/access-token/generate-by-user-id", userTokeDetails, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return new UsmPermissionsApi(response);
        })
      )
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        })
      );
  }

  fetchPersonalAccessTokenDetails(userId: any): Observable<any> {
    return this.https.get('/api/access-token/search-by-user-id/' + userId , { observe: 'response' })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
  }

  revokePersonalAccessToken(userId: any): Observable<any> {
    return this.https.delete('/api/access-token/revoke-by-user-id/' + userId, {
      observe: 'response'
    })
      .pipe(map(response => {
        return response.body;
      }))
      .pipe(catchError(err => {
        return this.handleError(err);
      }));
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
}