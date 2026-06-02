import { HttpClient ,HttpHeaders} from '@angular/common/http';
import { Injectable, SkipSelf } from "@angular/core";
import { Observable, map, catchError, throwError } from "rxjs";
// import { Observable } from 'rxjs/Observable';
// import { catchError, map } from 'rxjs/operators';
// import { throwError } from "rxjs";

@Injectable({
 providedIn: "root",
})
export class IampUsmService {
 private options = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
 constructor(private https: HttpClient) {}

 getPermission(mod: any): Observable<any> {
    let role = JSON.parse(sessionStorage.getItem('role')).id
    return this.https.get( '/api/usm-role-permissionss/formodule/'+role, 
    { observe: 'response', responseType: 'text' ,params: {module: mod}})
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
    return throwError(errMsg)
  }
}
