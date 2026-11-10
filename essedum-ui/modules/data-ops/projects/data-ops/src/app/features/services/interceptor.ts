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
        try {
          const r = JSON.parse(role);
          if (r?.rank?.toString())
            request = request.clone({ headers: request.headers.set("rank", r.rank.toString()) });
        } catch { /* ignore */ }
      }

      // portfolioId — required by backend ORG_APPROVED visibility filter (org admin flow).
      const portfolioDataRaw = sessionStorage.getItem("portfoliodata");
      if (portfolioDataRaw) {
        try {
          const pd = JSON.parse(portfolioDataRaw);
          if (pd?.id?.toString())
            request = request.clone({ headers: request.headers.set("portfolioId", pd.id.toString()) });
        } catch { /* ignore */ }
      }

      // organisation — portfolio/org name for ORG_APPROVED visibility.
      if (portfolioDataRaw) {
        try {
          const pd = JSON.parse(portfolioDataRaw);
          if (pd?.portfolioName)
            request = request.clone({ headers: request.headers.set("organisation", pd.portfolioName) });
        } catch { /* ignore */ }
      }

      // user-login — required for DRAFT-only-creator visibility.
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          const username = userObj?.username || userObj?.preferred_username || userObj?.name;
          if (username)
            request = request.clone({ headers: request.headers.set("user-login", username) });
        } catch { /* ignore */ }
      }
    }
    if(request.url.includes("service") && localStorage.hasOwnProperty("accessToken")){  
      request = request.clone({ headers: request.headers.append('access-token', accessToken) });    
    }
    return next.handle(request);
  }
}
