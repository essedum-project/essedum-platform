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
    const isApiRequest =
      ((request.url.includes("api")) || (request.url.includes("json"))) &&
      !request.url.endsWith("/api/aip/getConfigDetails") &&
      (!capBaseUrl || !request.url.includes(capBaseUrl));

    // Project and roleId headers are required by the backend's CustomAuthorizationManager
    // in ALL auth modes. Send them whenever they are in sessionStorage.
    if (isApiRequest) {
      if (project) {
        try {
          const p = JSON.parse(project);
          if (p?.id?.toString()) {
            request = request.clone({ headers: request.headers.set("Project", p.id.toString()) });
          }
          if (p?.name?.toString()) {
            request = request.clone({ headers: request.headers.set("ProjectName", p.name.toString()) });
            // Send project name as 'organisation' header — required by approval workflow filter.
            request = request.clone({ headers: request.headers.set("organisation", p.name.toString()) });
          }
        } catch { /* ignore parse errors */ }
      }
      if (role) {
        try {
          const r = JSON.parse(role);
          if (r?.id?.toString()) {
            request = request.clone({ headers: request.headers.set("roleId", r.id.toString()) });
          }
          // Send rank (approval level 1-4) for the approval workflow filter.
          if (r?.rank?.toString()) {
            request = request.clone({ headers: request.headers.set("rank", r.rank.toString()) });
          }
          if (r?.name?.toString()) {
            request = request.clone({ headers: request.headers.set("roleName", r.name.toString()) });
          }
        } catch { /* ignore parse errors */ }
      }

      // Send portfolioId (numeric portfolio/org ID) for org-scoped approval visibility.
      // Required by the pipeline list backend to fetch ORG_APPROVED pipelines cross-project.
      const portfolioDataRaw = sessionStorage.getItem("portfoliodata");
      if (portfolioDataRaw) {
        try {
          const pd = JSON.parse(portfolioDataRaw);
          if (pd?.id?.toString()) {
            request = request.clone({ headers: request.headers.set("portfolioId", pd.id.toString()) });
          }
        } catch { /* ignore */ }
      }

      // Send user-login header — required by the approval workflow filter for DRAFT visibility.
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          const username = userObj?.username || userObj?.preferred_username || userObj?.name;
          if (username) {
            request = request.clone({ headers: request.headers.set("user-login", username) });
          }
        } catch { /* ignore */ }
      }
    }

    // Authorization Bearer only in dbjwt mode; oauth2 mode uses angular-oauth2-oidc interceptor.
    if (localStorage.hasOwnProperty("jwtToken") && isApiRequest) {
      request = request.clone({ setHeaders: { Authorization: "Bearer " + localStorage.getItem("jwtToken") } });
    }
    if(request.url.includes("service") && localStorage.hasOwnProperty("accessToken")){  
      request = request.clone({ headers: request.headers.append('access-token', accessToken) });    
    }
    return next.handle(request);
  }
}
