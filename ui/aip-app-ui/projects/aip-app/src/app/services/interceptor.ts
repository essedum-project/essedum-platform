import { Injectable } from "@angular/core";
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AipInterceptorService implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let activeProfile: any = sessionStorage.getItem("activeProfiles");
    let capBaseUrl: any = sessionStorage.getItem("capBaseUrl");
    let project: any = sessionStorage.getItem("project");
    let role: any = sessionStorage.getItem("role");
    let accessToken: any = localStorage.getItem("accessToken");
    
    // if (request.url.indexOf("/api/aip/") != -1) {
    //   request = request.clone({ headers: request.headers.set("Project", (JSON.parse(project).id).toString()) });
    // }
    request = request.clone({ headers: request.headers.set("X-Requested-With", "Leap") });
    
    if (!request.headers.has("Content-Type")) {
      request = request.clone({ headers: request.headers.set("Content-Type", "application/json") });
      if ((sessionStorage.getItem("activeProfiles") && (JSON.parse(activeProfile).indexOf("dbjwt") != -1))) {
        request = request.clone({ headers: request.headers.set("charset", "utf-8") });
      }
    }
    if (request.body instanceof FormData) {
      request = request.clone({ headers: request.headers.delete('Content-Type', 'application/json') });
    }
    if (
      localStorage.hasOwnProperty("jwtToken") &&
      ((request.url.includes("api")) || (request.url.includes("json"))) &&
      !request.url.endsWith("/api/aip/getConfigDetails") && !request.url.includes(capBaseUrl)
    ) {
      request = request.clone({ setHeaders: { Authorization: "Bearer " + localStorage.getItem("jwtToken") } });
      if (sessionStorage.hasOwnProperty("project") && sessionStorage.getItem("project")!="" ){
        request = request.clone({ headers: request.headers.set("Project", JSON.parse(project).id.toString()) });
        if(JSON.parse(project).id.toString() !="")
          request = request.clone({ headers: request.headers.set("Project", JSON.parse(project).id.toString()   )});
        if(JSON.parse(project).name.toString() !="")
          request = request.clone({ headers: request.headers.set("ProjectName", JSON.parse(project).name.toString()   )});
      }
      if(sessionStorage.hasOwnProperty("role") && sessionStorage.getItem("role")!=""){
        if(JSON.parse(role).id.toString() !="")
          request = request.clone({ headers: request.headers.set("roleId", JSON.parse(role).id.toString()   )});
        if(JSON.parse(role).name.toString() !="")
          request = request.clone({ headers: request.headers.set("roleName", JSON.parse(role).name.toString()   )});
      }
  
    
    }
    if(request.url.includes("service") && localStorage.hasOwnProperty("accessToken")){  
      request = request.clone({ headers: request.headers.append('access-token', accessToken) });    
    }
    return next.handle(request);
  }
}
