import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule, REMOVE_STYLES_ON_COMPONENT_DESTROY, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { ApisService } from './services/apis.service';
import { AuthGuardService } from './services/auth-guard.service';
import { AppInitService } from './services/common-app-init.service';
import { CommonAppInterceptorService } from './services/common-app-interceptor.service';
import { OAuthModule, OAuthStorage } from "angular-oauth2-oidc";
import { AppConfigService } from './services/app-config.service';
import { buildRoutes } from './services/mfe-config-route';
import { NgcCookieConsentModule, NgcCookieConsentConfig } from 'ngx-cookieconsent';
import { InactivityPopupComponent } from './popups/inactivity-popup/inactivity-popup.component';
import { TokenExpiryPopupComponent } from './popups/token-expiry-popup/token-expiry-popup.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBar } from '@angular/material/snack-bar';
import '@linuxfoundation/lfx-ui-core';
import { MatMenuModule } from '@angular/material/menu';

const cookieConfig: NgcCookieConsentConfig = {
  "cookie": {
    "domain": window.location.hostname
  },
  "position": "bottom",
  "theme": "classic",
  "palette": {
    "popup": {
      "background": "#0b0c0c",
      "text": "#ffffff",
    },
    "button": {
      "background": "#0052cc",
      "text": "#ffffff",
      "border": "transparent"
    }
  },
  "type": "info",
  "content": {
    "message": "This website stores cookie on your computer. These cookies are used to collect information about how you interact with our website and allow us to remember you. We use this information in order to improve and customize your browsing experience and for analytics and metrics about our visitors both on this website and other media.",
    "dismiss": "Got it!",
    "deny": "",
    "link": ""
  }
};

@NgModule({
  declarations: [
    AppComponent,
    InactivityPopupComponent,
    TokenExpiryPopupComponent,
   
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CoreModule.forRoot(),
    HttpClientModule,
    HttpClientXsrfModule,
    OAuthModule.forRoot(),
    NgcCookieConsentModule.forRoot (cookieConfig),
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatMenuModule
  ],
  providers: [
    ApisService,
    AuthGuardService,
    AppInitService,
    MatSnackBar,
    { provide: APP_INITIALIZER, useFactory: initializeApp, deps: [AppInitService], multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CommonAppInterceptorService, multi: true },
    { provide: OAuthStorage, useValue: localStorage },
    { provide: REMOVE_STYLES_ON_COMPONENT_DESTROY, useValue: true },
    { provide: MatDialogRef, useValue: {} },
    Title,
    AppConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: (appConfigSvc: AppConfigService, titleService: Title) => {
        return () => {
          return appConfigSvc.getAppConfig().subscribe((response) => {
            titleService.setTitle(response.settings.find(x => x.key == 'PAGE_TITLE').value);
            sessionStorage.setItem('title', response.settings.find(x => x.key == 'PAGE_TITLE').value);
          });
        }
      },
      multi: true,
      deps: [AppConfigService, Title]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (mfeappConfigSvc: AppConfigService) => {
        return () => {
          return mfeappConfigSvc.getMfeAppConfig().subscribe((response) => {
            buildRoutes(response);
          });
        }
      },
      multi: true,
      deps: [AppConfigService]
    }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
export function initializeApp(appInitService: AppInitService) {
  return () => appInitService.loadConfig().toPromise();
}
