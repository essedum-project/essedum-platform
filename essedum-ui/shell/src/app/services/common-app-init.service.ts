import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthConfig } from 'angular-oauth2-oidc';
import { forkJoin } from "rxjs";
import { tap } from "rxjs/operators";
import { environment } from "../../environments/environment";

@Injectable()
export class AppInitService {

   constructor(private https: HttpClient, 
   ) { }

   private authConfig: AuthConfig = {
      issuer: '',
      clientId: '', // The "Auth Code + PKCE" client
      responseType: 'code',
      redirectUri: window.location.origin + '/index.html',
      silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
      scope: '', // Ask offline_access to support refresh token refreshes
      useSilentRefresh: true, // Needed for Code Flow to suggest using iframe-based refreshes
      //silentRefreshTimeout: 50000, // For faster testing
      timeoutFactor: 0.75, // For faster testing
      sessionChecksEnabled: true,
      showDebugInformation: true, // Also requires enabling "Verbose" level in devtools
      clearHashAfterLogin: false, // https://github.com/manfredsteyer/angular-oauth2-oidc/issues/457#issuecomment-431807040,
      nonceStateSeparator: 'semicolon', // Real semicolon gets mangled by IdentityServer's URI encoding
      strictDiscoveryDocumentValidation: false
   }

   get getAuthConfig(): AuthConfig {
      return this.authConfig;
   }

   loadConfig() {
      return forkJoin(this.init());
   }

   init() {
      console.log("AppInitService.init() called");
      return this.https
         .get("/api/getConfigDetails")
         .pipe(tap((res: any) => {
            sessionStorage.setItem("data_limit", res["data_limit"]);
            sessionStorage.setItem("autoUserCreation", res["autoUserCreation"]);
            sessionStorage.setItem("autoUserProject", JSON.stringify(res["autoUserProject"]));
            sessionStorage.setItem("activeProfiles", JSON.stringify(res["activeProfiles"].split(",")));
            sessionStorage.setItem("logoLocation", res["logoLocation"]);
            sessionStorage.setItem("theme", res["theme"]);
            sessionStorage.setItem("defaultTheme", res["theme"]);
            sessionStorage.setItem("font", res["font"]);
            sessionStorage.setItem("telemetryUrl", res["telemetryUrl"]);
            sessionStorage.setItem("telemetry", res["telemetry"]);
            sessionStorage.setItem("telemetryPdataId", res["telemetryPdataId"]);
            sessionStorage.setItem("capBaseUrl", res["capBaseUrl"]);
            sessionStorage.setItem("appVersion", res["appVersion"]);
            sessionStorage.setItem("leapAppYear", res["leapAppYear"]);
            sessionStorage.setItem("showPortfolioHeader", res["showPortfolioHeader"]);
            sessionStorage.setItem("showProfileIcon",  res["showProfileIcon"]);
            sessionStorage.setItem("encDefault", res["encDefault"]);
            if (sessionStorage.getItem("activeProfiles").indexOf("dbjwt") != -1) {
               sessionStorage.setItem("expireTokenTime", res["expireTokenTime"]);
            }
         
            this.authConfig.issuer = res["issuerUri"];
            this.authConfig.clientId = res["clientId"];
            this.authConfig.responseType = 'code';
            this.authConfig.redirectUri = window.location.origin + sessionStorage.getItem("contextPath") + 'index.html';
            this.authConfig.silentRefreshRedirectUri = window.location.origin + sessionStorage.getItem("contextPath") + 'silent-refresh.html';
            this.authConfig.scope = res["scope"]; // Ask offline_access to support refresh token refreshes
            this.authConfig.useSilentRefresh = true; // Needed for Code Flow to suggest using iframe-based refreshes
            let value = res["silentRefreshTimeoutFactor"];
            if (typeof value === 'number' && value > 0 && value <= 1) {
               this.authConfig.timeoutFactor = value;
            } else {
               this.authConfig.timeoutFactor = 0.9;
            }
            this.authConfig.sessionChecksEnabled = true;
            this.authConfig.showDebugInformation = true; // Also requires enabling "Verbose" level in devtools
            this.authConfig.clearHashAfterLogin = false; // https=//github.com/manfredsteyer/angular-oauth2-oidc/issues/457#issuecomment-431807040,
            this.authConfig.nonceStateSeparator = 'semicolon'; // Real semicolon gets mangled by IdentityServer's URI encoding
            this.authConfig.strictDiscoveryDocumentValidation = false;
            this.authConfig.postLogoutRedirectUri = window.location.origin + sessionStorage.getItem("contextPath");
            sessionStorage.setItem("baseUrl", environment.baseUrl);
            if(res["autoUserProject"].id==null){
            }
         }));
   }
}
