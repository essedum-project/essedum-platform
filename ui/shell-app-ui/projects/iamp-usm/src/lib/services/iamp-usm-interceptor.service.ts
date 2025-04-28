import { Injectable } from "@angular/core";
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class IampUsmInterceptorService implements HttpInterceptor {

  constructor() { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    /*  if (request.url.indexOf("/api/") != -1) {
       request = request.clone({ url: sessionStorage.getItem("baseUrl") + "/api/" + request.url.split("/api/")[1] });
     } */
     console.log("inside interceptor")
     
    if (request.url.indexOf("/api/") != -1)
    request = request.clone({ url: sessionStorage.getItem("contextPath") + (request.url.charAt(0) === '/' ? request.url.slice(1) : request.url)});

    request = request.clone({ headers: request.headers.set("X-Requested-With", "Leap") });
    if (!request.headers.has("Content-Type")) {
      request = request.clone({ headers: request.headers.set("Content-Type", "application/json") });
      if ((sessionStorage.getItem("activeProfiles") && (JSON.parse(sessionStorage.getItem("activeProfiles")).indexOf("dbjwt") != -1))) {
        request = request.clone({ headers: request.headers.set("charset", "utf-8") });
      }
    }
    if (request.body instanceof FormData) {
      request = request.clone({ headers: request.headers.delete('Content-Type', 'application/json') });
    }
    // if (
    //   localStorage.hasOwnProperty("jwtToken") &&
    //   ((request.url.includes("api")) || (request.url.includes("json"))) &&
    //   !request.url.endsWith("/api/getConfigDetails") && !request.url.includes(sessionStorage.getItem("capBaseUrl"))
    // ) {
    //   request = request.clone({ setHeaders: { Authorization: "Bearer " + localStorage.getItem("jwtToken") } });
    // }
    // if (sessionStorage.hasOwnProperty("project") && sessionStorage.getItem("project") != "") {
    //   request = request.clone({ headers: request.headers.set("Project", JSON.parse(sessionStorage.getItem('project')).id.toString()) });
    // }

    if (
      localStorage.hasOwnProperty("jwtToken") &&
      request.url.includes("api") &&
      !request.url.endsWith("/api/getConfigDetails")
    ) {
      request = request.clone({ setHeaders: { Authorization: "Bearer " + localStorage.getItem("jwtToken") } });
      if (sessionStorage.hasOwnProperty("project") && sessionStorage.getItem("project")!="" ){
        request = request.clone({ headers: request.headers.set("Project", JSON.parse(sessionStorage.getItem('project')).id.toString()) });
        if(JSON.parse(sessionStorage.getItem('project')).id.toString() !="")
          request = request.clone({ headers: request.headers.set("Project", JSON.parse(sessionStorage.getItem('project')).id.toString()   )});
        if(JSON.parse(sessionStorage.getItem('project')).name.toString() !="")
          request = request.clone({ headers: request.headers.set("ProjectName", JSON.parse(sessionStorage.getItem('project')).name.toString()   )});
      }
      if(sessionStorage.hasOwnProperty("role") && sessionStorage.getItem("role")!=""){
        if(JSON.parse(sessionStorage.getItem('role')).id.toString() !="")
          request = request.clone({ headers: request.headers.set("roleId", JSON.parse(sessionStorage.getItem('role')).id.toString()   )});
        if(JSON.parse(sessionStorage.getItem('role')).name.toString() !="")
          request = request.clone({ headers: request.headers.set("roleName", JSON.parse(sessionStorage.getItem('role')).name.toString()   )});
      }
    }
    
    return next.handle(request);
  }
}
