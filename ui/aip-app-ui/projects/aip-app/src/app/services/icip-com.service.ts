import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IcipComService {
  private jwt: any;
  private options = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
  messageService: any;

  constructor(private https: HttpClient) {

  }

  getPermission(mod: any): Observable<any> {
    try{
      let role = JSON.parse(sessionStorage.getItem('role')).id
      return this.https.get( 'api/usm-role-permissionss/formodule/'+role, 
      { observe: 'response', responseType: 'text' ,params: {module: mod}})
        .pipe(map(response => {
          return response.body;
        }))
        .pipe(catchError(err => {
          return this.handleError(err);
        }));
    }
    catch(Exception){
    this.messageService.error("Some error occured", "Error")
    }
    

  }

  pushBreadCrumb(item : any){
    try{
    
      let stack = [];
      if(sessionStorage.getItem("icip.breadcrumb")){
        stack  = JSON.parse(sessionStorage.getItem("icip.breadcrumb"))
      }
      if(!stack.includes(item))
        stack.push(item)
      sessionStorage.setItem("icip.breadcrumb",JSON.stringify(stack))
      return item;
    }
    catch(Exception){
    this.messageService.error("Some error occured", "Error")
    }

  }

  popBreadCrumb(item : any){
    try{
    
      let stack = [];
      if(sessionStorage.getItem("icip.breadcrumb")){
        stack  = JSON.parse(sessionStorage.getItem("icip.breadcrumb"))
        let index = stack.findIndex(x => x.item.alias === item.item.alias)
        // stack.splice(index,stack.length-index-1)
        let len = stack.length
        for(let i = index+1; i<len;i++)
          stack.pop()
        sessionStorage.setItem("icip.breadcrumb",JSON.stringify(stack))
      }
      
    }
    catch(Exception){
    this.messageService.error("Some error occured", "Error")
     }
 }


  private handleError(error: any) {
    // TODO: seems we cannot use messageService from here...
    const errMsg = error.error;
    console.error(errMsg); // log to console instead
    // if (error.status === 401) {
    //   window.location.href = '/';
    // }
    return throwError(errMsg);
  }


}
